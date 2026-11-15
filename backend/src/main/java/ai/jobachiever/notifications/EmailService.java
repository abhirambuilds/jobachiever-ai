package ai.jobachiever.notifications;

/**
 * High-level domain service for sending system and security notifications.
 */
public interface EmailService {

    /**
     * Sends an account email verification OTP.
     */
    void sendVerificationOtp(String to, String name, String otp, int expirationMinutes);

    /**
     * Sends a password reset token and instruction link.
     */
    void sendPasswordReset(String to, String name, String resetToken, int expirationMinutes);

    /**
     * Dispatches an arbitrary constructed email message.
     */
    void sendCustomEmail(EmailMessage message);
}
