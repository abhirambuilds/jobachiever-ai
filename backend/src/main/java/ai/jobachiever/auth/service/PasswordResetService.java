package ai.jobachiever.auth.service;

public interface PasswordResetService {

    /**
     * Initiates a password recovery workflow.
     * Generates a 32-byte secure token, stores its SHA-256 digest, and sends a recovery link.
     * Enforces zero account enumeration if the email is not registered.
     */
    void requestPasswordReset(String email);

    /**
     * Completes password recovery by validating the reset token and updating
     * the user's password with BCrypt.
     * Ensures single-use consumption and leaves email_verified status untouched.
     */
    void resetPassword(String token, String newPassword);
}
