package ai.jobachiever.auth.service;

import ai.jobachiever.auth.entity.EmailVerificationToken;
import ai.jobachiever.auth.exception.OtpVerificationException;
import ai.jobachiever.auth.exception.RateLimitException;
import ai.jobachiever.auth.repository.EmailVerificationTokenRepository;
import ai.jobachiever.auth.security.SecurityTokenUtils;
import ai.jobachiever.notifications.EmailService;
import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class VerificationServiceImpl implements VerificationService {

    private static final Logger log = LoggerFactory.getLogger(VerificationServiceImpl.class);

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;

    private final int otpExpirationMinutes;
    private final int resendCooldownSeconds;
    private final int maxOtpAttempts;

    public VerificationServiceImpl(
            UserRepository userRepository,
            EmailVerificationTokenRepository tokenRepository,
            EmailService emailService,
            @Value("${app.mail.otp-expiration-minutes:15}") int otpExpirationMinutes,
            @Value("${app.mail.resend-cooldown-seconds:60}") int resendCooldownSeconds,
            @Value("${app.mail.max-otp-attempts:5}") int maxOtpAttempts) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.otpExpirationMinutes = otpExpirationMinutes;
        this.resendCooldownSeconds = resendCooldownSeconds;
        this.maxOtpAttempts = maxOtpAttempts;
    }

    @Override
    @Transactional
    public void sendVerificationOtp(User user) {
        if (user.isEmailVerified()) {
            log.info("User {} is already email-verified. Skipping OTP generation.", user.getId());
            return;
        }

        // Consume any previous active verification tokens for this user
        List<EmailVerificationToken> unconsumed = tokenRepository.findAllByUserIdAndConsumedAtIsNull(user.getId());
        unconsumed.forEach(EmailVerificationToken::consume);
        if (!unconsumed.isEmpty()) {
            tokenRepository.saveAll(unconsumed);
        }

        // Generate 6-digit cryptographic OTP and SHA-256 hash
        String plainOtp = SecurityTokenUtils.generateNumericOtp(6);
        String otpHash = SecurityTokenUtils.hashSha256(plainOtp);
        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(otpExpirationMinutes));

        EmailVerificationToken token = new EmailVerificationToken(user, otpHash, expiresAt, maxOtpAttempts);
        tokenRepository.save(token);

        // Security rule: Never log the plain OTP in application logs
        log.info("Dispatched verification OTP for user {}", user.getId());

        emailService.sendVerificationOtp(user.getEmail(), user.getFirstName(), plainOtp, otpExpirationMinutes);
    }

    @Override
    @Transactional
    public void verifyEmail(String email, String otp) {
        String normalizedEmail = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        if (userOpt.isEmpty()) {
            log.warn("Verification failed: no account found for email {}", normalizedEmail);
            throw new OtpVerificationException("Invalid email address or verification code.");
        }

        User user = userOpt.get();

        if (user.isEmailVerified()) {
            log.info("User {} email is already verified. Verification request succeeded idempotently.", user.getId());
            return;
        }

        EmailVerificationToken token = tokenRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new OtpVerificationException("No active verification code found. Please request a new code."));

        if (token.isConsumed()) {
            throw new OtpVerificationException("This verification code has already been used. Please request a new code.");
        }

        if (token.isExpired()) {
            throw new OtpVerificationException("Verification code has expired. Please request a new code.");
        }

        if (token.isMaxAttemptsExceeded()) {
            throw new OtpVerificationException("Maximum verification attempts exceeded. Please request a new code.");
        }

        // Increment attempts count
        token.incrementAttempts();

        // Constant-time SHA-256 hash comparison
        boolean isMatch = SecurityTokenUtils.verifyConstantTime(otp.trim(), token.getOtpHash());
        if (!isMatch) {
            tokenRepository.save(token);
            int remaining = token.getMaxAttempts() - token.getAttemptsCount();
            if (remaining > 0) {
                throw new OtpVerificationException("Invalid verification code. " + remaining + " attempts remaining.");
            } else {
                throw new OtpVerificationException("Maximum verification attempts exceeded. Please request a new code.");
            }
        }

        // Verification successful: consume token
        token.consume();
        tokenRepository.save(token);

        // Update user verification status and activate account if pending
        user.setEmailVerified(true);
        if (user.getAccountStatus() == AccountStatus.PENDING_VERIFICATION) {
            user.setAccountStatus(AccountStatus.ACTIVE);
        }
        userRepository.save(user);

        log.info("Email successfully verified for user {}. Account status is now ACTIVE.", user.getId());
    }

    @Override
    @Transactional
    public void resendVerificationOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        // Security rule: Zero account enumeration. Return gracefully if email is unregistered.
        if (userOpt.isEmpty()) {
            log.warn("Resend OTP requested for non-existent email {}. Suppressing error to prevent enumeration.", normalizedEmail);
            return;
        }

        User user = userOpt.get();

        if (user.isEmailVerified()) {
            log.info("User {} is already email-verified. Resend OTP request ignored.", user.getId());
            return;
        }

        // Check cooldown period from last created token
        Optional<EmailVerificationToken> latestTokenOpt = tokenRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId());
        if (latestTokenOpt.isPresent()) {
            EmailVerificationToken latestToken = latestTokenOpt.get();
            long elapsedSeconds = Duration.between(latestToken.getCreatedAt(), Instant.now()).getSeconds();
            if (elapsedSeconds < resendCooldownSeconds) {
                long waitTime = resendCooldownSeconds - elapsedSeconds;
                log.warn("Resend OTP throttled for user {}. Cooldown remaining: {}s", user.getId(), waitTime);
                throw new RateLimitException("Please wait " + waitTime + " seconds before requesting a new verification code.");
            }
        }

        sendVerificationOtp(user);
    }
}
