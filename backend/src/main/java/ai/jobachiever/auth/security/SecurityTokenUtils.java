package ai.jobachiever.auth.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

/**
 * Cryptographic utility for generating secure OTPs, tokens,
 * computing SHA-256 digests, and performing constant-time comparisons.
 */
public final class SecurityTokenUtils {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private SecurityTokenUtils() {
    }

    /**
     * Generates a cryptographically random numeric OTP of the specified length.
     *
     * @param digits number of digits (e.g. 6)
     * @return padded numeric string
     */
    public static String generateNumericOtp(int digits) {
        if (digits <= 0 || digits > 9) {
            throw new IllegalArgumentException("OTP digits must be between 1 and 9");
        }
        int max = (int) Math.pow(10, digits);
        int value = SECURE_RANDOM.nextInt(max);
        return String.format("%0" + digits + "d", value);
    }

    /**
     * Generates a cryptographically random hex token of the specified byte length.
     *
     * @param byteLength number of random bytes (e.g. 32 bytes = 64 hex characters)
     * @return hex-encoded token string
     */
    public static String generateSecureHexToken(int byteLength) {
        byte[] bytes = new byte[byteLength];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    /**
     * Computes the SHA-256 hex digest of the specified input string.
     *
     * @param input plain string to hash
     * @return lowercase 64-character SHA-256 hex digest
     */
    public static String hashSha256(String input) {
        if (input == null) {
            throw new IllegalArgumentException("Cannot compute SHA-256 digest of null input");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available in current JVM", e);
        }
    }

    /**
     * Performs a constant-time comparison between the SHA-256 hash of a candidate plain value
     * and a stored hash digest, preventing timing side-channel attacks.
     *
     * @param candidatePlain plain value to verify
     * @param storedHash expected hex hash
     * @return true if candidate matches stored hash, false otherwise
     */
    public static boolean verifyConstantTime(String candidatePlain, String storedHash) {
        if (candidatePlain == null || storedHash == null) {
            return false;
        }
        String candidateHash = hashSha256(candidatePlain);
        return MessageDigest.isEqual(
                candidateHash.getBytes(StandardCharsets.UTF_8),
                storedHash.getBytes(StandardCharsets.UTF_8)
        );
    }
}
