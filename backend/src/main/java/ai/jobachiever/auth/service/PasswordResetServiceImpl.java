package ai.jobachiever.auth.service;

import ai.jobachiever.auth.entity.PasswordResetToken;
import ai.jobachiever.auth.exception.InvalidTokenException;
import ai.jobachiever.auth.repository.PasswordResetTokenRepository;
import ai.jobachiever.auth.security.SecurityTokenUtils;
import ai.jobachiever.notifications.EmailService;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final int resetTokenExpirationMinutes;

    public PasswordResetServiceImpl(
            UserRepository userRepository,
            PasswordResetTokenRepository resetTokenRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            @Value("${app.mail.reset-token-expiration-minutes:30}") int resetTokenExpirationMinutes) {
        this.userRepository = userRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.resetTokenExpirationMinutes = resetTokenExpirationMinutes;
    }

    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        // Security rule: Zero account enumeration.
        // Return silently with generic response if the email does not exist.
        if (userOpt.isEmpty()) {
            log.warn("Password reset requested for non-existent email {}. Suppressing error to prevent enumeration.", normalizedEmail);
            return;
        }

        User user = userOpt.get();

        // Consume any previous pending password reset tokens for this user
        List<PasswordResetToken> unconsumed = resetTokenRepository.findAllByUserIdAndConsumedAtIsNull(user.getId());
        unconsumed.forEach(PasswordResetToken::consume);
        if (!unconsumed.isEmpty()) {
            resetTokenRepository.saveAll(unconsumed);
        }

        // Generate 32-byte cryptographic random hex token and SHA-256 hash
        String plainToken = SecurityTokenUtils.generateSecureHexToken(32);
        String tokenHash = SecurityTokenUtils.hashSha256(plainToken);
        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(resetTokenExpirationMinutes));

        PasswordResetToken resetToken = new PasswordResetToken(user, tokenHash, expiresAt);
        resetTokenRepository.save(resetToken);

        // Security rule: Never log the plain reset token in application logs
        log.info("Dispatched password reset instructions for user {}", user.getId());

        emailService.sendPasswordReset(user.getEmail(), user.getFirstName(), plainToken, resetTokenExpirationMinutes);
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new InvalidTokenException("Invalid or missing password reset token.");
        }

        String tokenHash = SecurityTokenUtils.hashSha256(token.trim());
        PasswordResetToken resetToken = resetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired password reset token."));

        if (!resetToken.isValid()) {
            if (resetToken.isConsumed()) {
                throw new InvalidTokenException("This password reset token has already been used.");
            }
            if (resetToken.isExpired()) {
                throw new InvalidTokenException("Password reset token has expired. Please request a new link.");
            }
            throw new InvalidTokenException("Invalid or expired password reset token.");
        }

        User user = resetToken.getUser();

        // Update password hash using BCrypt
        String newPasswordHash = passwordEncoder.encode(newPassword);
        user.setPasswordHash(newPasswordHash);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        // Consume the reset token (single-use guarantee)
        resetToken.consume();
        resetTokenRepository.save(resetToken);

        log.info("Password successfully reset for user {}. Token consumed.", user.getId());
    }
}
