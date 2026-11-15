package ai.jobachiever.auth.service;

import ai.jobachiever.users.entity.User;

public interface VerificationService {

    /**
     * Generates a cryptographically secure 6-digit OTP, stores its SHA-256 digest,
     * and dispatches a verification email to the user.
     */
    void sendVerificationOtp(User user);

    /**
     * Validates a submitted 6-digit verification code against the active token.
     * Enforces expiration, attempt limits, constant-time comparison, and transitions
     * the user to ACTIVE / emailVerified.
     */
    void verifyEmail(String email, String otp);

    /**
     * Re-issues a verification OTP respecting cooldown rate limits.
     * Guarantees zero user enumeration if the requested email is unregistered.
     */
    void resendVerificationOtp(String email);
}
