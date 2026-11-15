package ai.jobachiever.auth;

import ai.jobachiever.auth.entity.EmailVerificationToken;
import ai.jobachiever.auth.entity.PasswordResetToken;
import ai.jobachiever.auth.exception.InvalidTokenException;
import ai.jobachiever.auth.exception.OtpVerificationException;
import ai.jobachiever.auth.exception.RateLimitException;
import ai.jobachiever.auth.repository.EmailVerificationTokenRepository;
import ai.jobachiever.auth.repository.PasswordResetTokenRepository;
import ai.jobachiever.auth.security.SecurityTokenUtils;
import ai.jobachiever.auth.service.PasswordResetServiceImpl;
import ai.jobachiever.auth.service.VerificationServiceImpl;
import ai.jobachiever.notifications.EmailMessage;
import ai.jobachiever.notifications.EmailService;
import ai.jobachiever.notifications.EmailTemplateService;
import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Verification and Password Recovery Service Unit Tests")
class VerificationAndRecoveryServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailVerificationTokenRepository emailTokenRepository;

    @Mock
    private PasswordResetTokenRepository resetTokenRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    private VerificationServiceImpl verificationService;
    private PasswordResetServiceImpl passwordResetService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        verificationService = new VerificationServiceImpl(
                userRepository,
                emailTokenRepository,
                emailService,
                15, // 15 min expiry
                60, // 60 sec cooldown
                5   // 5 max attempts
        );

        passwordResetService = new PasswordResetServiceImpl(
                userRepository,
                resetTokenRepository,
                emailService,
                passwordEncoder,
                30 // 30 min expiry
        );

        sampleUser = new User("candidate@jobachiever.ai", "$2a$12$hashedPassword", "Jane", "Doe");
        sampleUser.setId(UUID.randomUUID());
        sampleUser.setAccountStatus(AccountStatus.PENDING_VERIFICATION);
        sampleUser.setEmailVerified(false);
    }

    // =========================================================================
    // 1. Email OTP Verification Tests
    // =========================================================================

    @Test
    @DisplayName("sendVerificationOtp stores SHA-256 hash and never stores plain OTP")
    void sendVerificationOtp_storesSha256Hash() {
        given(emailTokenRepository.findAllByUserIdAndConsumedAtIsNull(sampleUser.getId()))
                .willReturn(Collections.emptyList());

        ArgumentCaptor<EmailVerificationToken> tokenCaptor = ArgumentCaptor.forClass(EmailVerificationToken.class);
        given(emailTokenRepository.save(tokenCaptor.capture())).willAnswer(i -> i.getArgument(0));

        verificationService.sendVerificationOtp(sampleUser);

        EmailVerificationToken saved = tokenCaptor.getValue();
        assertThat(saved.getOtpHash()).isNotNull().hasSize(64);
        assertThat(saved.getMaxAttempts()).isEqualTo(5);
        assertThat(saved.getAttemptsCount()).isEqualTo(0);
        assertThat(saved.isConsumed()).isFalse();

        // Plain OTP is passed to email service, not persisted
        verify(emailService, times(1)).sendVerificationOtp(
                eq("candidate@jobachiever.ai"),
                eq("Jane"),
                anyString(),
                eq(15)
        );
    }

    @Test
    @DisplayName("verifyEmail with correct OTP sets emailVerified=true and transitions status to ACTIVE")
    void verifyEmail_withCorrectOtp_activatesAccount() {
        String plainOtp = "482910";
        String otpHash = SecurityTokenUtils.hashSha256(plainOtp);
        EmailVerificationToken token = new EmailVerificationToken(sampleUser, otpHash, Instant.now().plus(15, ChronoUnit.MINUTES), 5);

        given(userRepository.findByEmailIgnoreCase("candidate@jobachiever.ai"))
                .willReturn(Optional.of(sampleUser));
        given(emailTokenRepository.findTopByUserIdOrderByCreatedAtDesc(sampleUser.getId()))
                .willReturn(Optional.of(token));

        verificationService.verifyEmail("candidate@jobachiever.ai", plainOtp);

        assertThat(sampleUser.isEmailVerified()).isTrue();
        assertThat(sampleUser.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(token.isConsumed()).isTrue();

        verify(userRepository, times(1)).save(sampleUser);
        verify(emailTokenRepository, times(1)).save(token);
    }

    @Test
    @DisplayName("verifyEmail with incorrect OTP increments attempts and throws OtpVerificationException")
    void verifyEmail_withIncorrectOtp_incrementsAttempts() {
        String correctOtp = "482910";
        String otpHash = SecurityTokenUtils.hashSha256(correctOtp);
        EmailVerificationToken token = new EmailVerificationToken(sampleUser, otpHash, Instant.now().plus(15, ChronoUnit.MINUTES), 5);

        given(userRepository.findByEmailIgnoreCase("candidate@jobachiever.ai"))
                .willReturn(Optional.of(sampleUser));
        given(emailTokenRepository.findTopByUserIdOrderByCreatedAtDesc(sampleUser.getId()))
                .willReturn(Optional.of(token));

        assertThatThrownBy(() -> verificationService.verifyEmail("candidate@jobachiever.ai", "000000"))
                .isInstanceOf(OtpVerificationException.class)
                .hasMessageContaining("4 attempts remaining");

        assertThat(token.getAttemptsCount()).isEqualTo(1);
        assertThat(sampleUser.isEmailVerified()).isFalse();
        verify(emailTokenRepository, times(1)).save(token);
    }

    @Test
    @DisplayName("verifyEmail with expired token throws OtpVerificationException")
    void verifyEmail_withExpiredToken_throwsException() {
        String otpHash = SecurityTokenUtils.hashSha256("123456");
        // Expired in past
        EmailVerificationToken token = new EmailVerificationToken(sampleUser, otpHash, Instant.now().minus(5, ChronoUnit.MINUTES), 5);

        given(userRepository.findByEmailIgnoreCase("candidate@jobachiever.ai"))
                .willReturn(Optional.of(sampleUser));
        given(emailTokenRepository.findTopByUserIdOrderByCreatedAtDesc(sampleUser.getId()))
                .willReturn(Optional.of(token));

        assertThatThrownBy(() -> verificationService.verifyEmail("candidate@jobachiever.ai", "123456"))
                .isInstanceOf(OtpVerificationException.class)
                .hasMessageContaining("expired");
    }

    @Test
    @DisplayName("resendVerificationOtp enforces 60-second cooldown rate limit")
    void resendVerificationOtp_throttledByCooldown() {
        EmailVerificationToken recentToken = new EmailVerificationToken(
                sampleUser,
                SecurityTokenUtils.hashSha256("111111"),
                Instant.now().plus(15, ChronoUnit.MINUTES),
                5
        );
        recentToken.setCreatedAt(Instant.now().minus(20, ChronoUnit.SECONDS)); // Created 20s ago (cooldown is 60s)

        given(userRepository.findByEmailIgnoreCase("candidate@jobachiever.ai"))
                .willReturn(Optional.of(sampleUser));
        given(emailTokenRepository.findTopByUserIdOrderByCreatedAtDesc(sampleUser.getId()))
                .willReturn(Optional.of(recentToken));

        assertThatThrownBy(() -> verificationService.resendVerificationOtp("candidate@jobachiever.ai"))
                .isInstanceOf(RateLimitException.class)
                .hasMessageContaining("seconds before requesting");
    }

    @Test
    @DisplayName("resendVerificationOtp for unknown email returns silently with zero enumeration")
    void resendVerificationOtp_unknownEmail_doesNotEnumerate() {
        given(userRepository.findByEmailIgnoreCase("unknown@jobachiever.ai"))
                .willReturn(Optional.empty());

        // Should return silently without throwing an exception
        verificationService.resendVerificationOtp("unknown@jobachiever.ai");

        verify(emailTokenRepository, never()).save(any());
        verify(emailService, never()).sendVerificationOtp(any(), any(), any(), anyInt());
    }

    // =========================================================================
    // 2. Password Reset Tests
    // =========================================================================

    @Test
    @DisplayName("requestPasswordReset creates SHA-256 token hash and dispatches email")
    void requestPasswordReset_createsTokenAndDispatchesEmail() {
        given(userRepository.findByEmailIgnoreCase("candidate@jobachiever.ai"))
                .willReturn(Optional.of(sampleUser));
        given(resetTokenRepository.findAllByUserIdAndConsumedAtIsNull(sampleUser.getId()))
                .willReturn(Collections.emptyList());

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        given(resetTokenRepository.save(tokenCaptor.capture())).willAnswer(i -> i.getArgument(0));

        passwordResetService.requestPasswordReset("candidate@jobachiever.ai");

        PasswordResetToken saved = tokenCaptor.getValue();
        assertThat(saved.getTokenHash()).isNotNull().hasSize(64);
        assertThat(saved.isConsumed()).isFalse();

        verify(emailService, times(1)).sendPasswordReset(
                eq("candidate@jobachiever.ai"),
                eq("Jane"),
                anyString(),
                eq(30)
        );
    }

    @Test
    @DisplayName("requestPasswordReset for non-existent email returns silently with zero enumeration")
    void requestPasswordReset_unknownEmail_doesNotEnumerate() {
        given(userRepository.findByEmailIgnoreCase("nonexistent@jobachiever.ai"))
                .willReturn(Optional.empty());

        passwordResetService.requestPasswordReset("nonexistent@jobachiever.ai");

        verify(resetTokenRepository, never()).save(any());
        verify(emailService, never()).sendPasswordReset(any(), any(), any(), anyInt());
    }

    @Test
    @DisplayName("resetPassword with valid token updates password hash and consumes token")
    void resetPassword_updatesPasswordAndConsumesToken() {
        String plainToken = "3a7b9c1d5e2f4a6b8c0d1e3f5a7b9c1d3a7b9c1d5e2f4a6b8c0d1e3f5a7b9c1d";
        String tokenHash = SecurityTokenUtils.hashSha256(plainToken);
        PasswordResetToken token = new PasswordResetToken(sampleUser, tokenHash, Instant.now().plus(30, ChronoUnit.MINUTES));

        given(resetTokenRepository.findByTokenHash(tokenHash)).willReturn(Optional.of(token));
        given(passwordEncoder.encode("NewStr0ngP@ssw0rd2026!")).willReturn("$2a$12$newBcryptHashedPassword");

        passwordResetService.resetPassword(plainToken, "NewStr0ngP@ssw0rd2026!");

        assertThat(sampleUser.getPasswordHash()).isEqualTo("$2a$12$newBcryptHashedPassword");
        assertThat(token.isConsumed()).isTrue();
        // emailVerified remains false (does NOT alter email_verified)
        assertThat(sampleUser.isEmailVerified()).isFalse();

        verify(userRepository, times(1)).save(sampleUser);
        verify(resetTokenRepository, times(1)).save(token);
    }

    @Test
    @DisplayName("resetPassword with consumed token throws InvalidTokenException")
    void resetPassword_withConsumedToken_throwsException() {
        String plainToken = "consumedtoken1234567890abcdef1234567890abcdef";
        String tokenHash = SecurityTokenUtils.hashSha256(plainToken);
        PasswordResetToken token = new PasswordResetToken(sampleUser, tokenHash, Instant.now().plus(30, ChronoUnit.MINUTES));
        token.consume();

        given(resetTokenRepository.findByTokenHash(tokenHash)).willReturn(Optional.of(token));

        assertThatThrownBy(() -> passwordResetService.resetPassword(plainToken, "NewStr0ngP@ssw0rd2026!"))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("already been used");
    }

    @Test
    @DisplayName("resetPassword with expired token throws InvalidTokenException")
    void resetPassword_withExpiredToken_throwsException() {
        String plainToken = "expiredtoken1234567890abcdef1234567890abcdef";
        String tokenHash = SecurityTokenUtils.hashSha256(plainToken);
        PasswordResetToken token = new PasswordResetToken(sampleUser, tokenHash, Instant.now().minus(10, ChronoUnit.MINUTES));

        given(resetTokenRepository.findByTokenHash(tokenHash)).willReturn(Optional.of(token));

        assertThatThrownBy(() -> passwordResetService.resetPassword(plainToken, "NewStr0ngP@ssw0rd2026!"))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("expired");
    }

    // =========================================================================
    // 3. Cryptographic and Template Tests
    // =========================================================================

    @Test
    @DisplayName("SecurityTokenUtils creates 6-digit numeric OTP and 64-char hex tokens")
    void securityTokenUtils_generatesValidTokens() {
        String otp = SecurityTokenUtils.generateNumericOtp(6);
        assertThat(otp).matches("^\\d{6}$");

        String hexToken = SecurityTokenUtils.generateSecureHexToken(32);
        assertThat(hexToken).matches("^[a-f0-9]{64}$");

        String hash = SecurityTokenUtils.hashSha256("test-input");
        assertThat(hash).hasSize(64);

        assertThat(SecurityTokenUtils.verifyConstantTime("test-input", hash)).isTrue();
        assertThat(SecurityTokenUtils.verifyConstantTime("wrong-input", hash)).isFalse();
    }

    @Test
    @DisplayName("EmailTemplateService formats responsive HTML and accessible text with zero leaks")
    void emailTemplateService_formatsTemplates() {
        EmailTemplateService templateService = new EmailTemplateService();

        EmailMessage verificationMsg = templateService.createVerificationEmail(
                "user@jobachiever.ai", "Jane", "839201", 15
        );
        assertThat(verificationMsg.to()).isEqualTo("user@jobachiever.ai");
        assertThat(verificationMsg.subject()).contains("839201");
        assertThat(verificationMsg.textBody()).contains("839201");
        assertThat(verificationMsg.htmlBody()).contains("839201");

        EmailMessage resetMsg = templateService.createPasswordResetEmail(
                "user@jobachiever.ai", "Jane", "abcdef123456", 30, "http://localhost:5173/reset-password"
        );
        assertThat(resetMsg.to()).isEqualTo("user@jobachiever.ai");
        assertThat(resetMsg.textBody()).contains("http://localhost:5173/reset-password?token=abcdef123456");
        assertThat(resetMsg.htmlBody()).contains("http://localhost:5173/reset-password?token=abcdef123456");
    }
}
