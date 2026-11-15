package ai.jobachiever.auth.service;

import ai.jobachiever.auth.entity.RevokedToken;
import ai.jobachiever.auth.repository.RevokedTokenRepository;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class TokenRevocationService {

    private static final Logger log = LoggerFactory.getLogger(TokenRevocationService.class);

    private final RevokedTokenRepository revokedTokenRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public TokenRevocationService(RevokedTokenRepository revokedTokenRepository,
                                  UserRepository userRepository,
                                  JwtService jwtService) {
        this.revokedTokenRepository = revokedTokenRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    /**
     * Revokes a JWT access token by storing its cryptographic identifier (jti or SHA-256 hash)
     * and its expiry date. Raw JWT tokens are NEVER stored in the database.
     */
    @Transactional
    public void revokeToken(String rawToken, UUID userId) {
        String identifier = computeTokenIdentifier(rawToken);

        if (revokedTokenRepository.existsByTokenIdentifier(identifier)) {
            log.debug("Token with identifier {} is already revoked", identifier);
            return;
        }

        Instant expiresAt;
        try {
            expiresAt = jwtService.extractExpiration(rawToken);
        } catch (JwtException e) {
            log.warn("Cannot extract expiration for token revocation; using 24h default: {}", e.getMessage());
            expiresAt = Instant.now().plusSeconds(86400);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        RevokedToken revokedToken = new RevokedToken(identifier, user, expiresAt);
        revokedTokenRepository.save(revokedToken);
        log.info("Access token identifier {} revoked for user {}", identifier, userId);
    }

    /**
     * Checks if a token has been revoked by checking for its token identifier in the database.
     */
    @Transactional(readOnly = true)
    public boolean isTokenRevoked(String rawToken) {
        String identifier = computeTokenIdentifier(rawToken);
        return revokedTokenRepository.existsByTokenIdentifier(identifier);
    }

    /**
     * Computes a safe 64-character token identifier (JWT ID claim or SHA-256 hex digest).
     */
    public String computeTokenIdentifier(String rawToken) {
        try {
            Claims claims = jwtService.parseAndValidateClaims(rawToken);
            String jti = claims.getId();
            if (jti != null && !jti.trim().isEmpty()) {
                return hashString(jti);
            }
        } catch (Exception ignored) {
            // If token cannot be parsed into claims, fall back to hashing raw token
        }
        return hashString(rawToken);
    }

    /**
     * Periodically cleans up expired revoked token records.
     */
    @Transactional
    public void cleanupExpiredTokens() {
        revokedTokenRepository.deleteByExpiresAtBefore(Instant.now());
    }

    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 message digest algorithm not available", e);
        }
    }
}
