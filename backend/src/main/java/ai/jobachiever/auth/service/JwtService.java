package ai.jobachiever.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    // Default development fallback key (never used in production)
    private static final String DEV_DEFAULT_SECRET = "jobachiever-ai-development-jwt-signing-secret-key-32bytes-minimum!";

    @Value("${app.jwt.secret:${JWT_SECRET:}}")
    private String secretKey;

    @Value("${app.jwt.expiration-seconds:${JWT_EXPIRATION_SECONDS:86400}}")
    private long expirationSeconds;

    @Value("${app.jwt.issuer:${JWT_ISSUER:jobachiever-ai}}")
    private String issuer;

    @Value("${spring.profiles.active:local}")
    private String activeProfile;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        if (secretKey == null || secretKey.trim().isEmpty()) {
            if ("prod".equalsIgnoreCase(activeProfile) || "production".equalsIgnoreCase(activeProfile)) {
                throw new IllegalStateException("Production environment requires a non-empty JWT_SECRET with at least 32 bytes.");
            }
            log.warn("JWT_SECRET environment variable not provided. Using development HMAC secret key.");
            secretKey = DEV_DEFAULT_SECRET;
        }

        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            if ("prod".equalsIgnoreCase(activeProfile) || "production".equalsIgnoreCase(activeProfile)) {
                throw new IllegalStateException("JWT_SECRET must be at least 32 bytes (256 bits) for HMAC-SHA256 in production.");
            }
            log.warn("JWT secret is shorter than 32 bytes. Padding secret for local development.");
            secretKey = DEV_DEFAULT_SECRET;
            keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        }

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        log.info("JwtService initialized with issuer '{}' and token expiration of {}s", issuer, expirationSeconds);
    }

    /**
     * Generates a signed JWT access token for the given user.
     */
    public String generateToken(UUID userId, String email) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(expirationSeconds);
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .id(jti)
                .subject(userId.toString())
                .claim("email", email)
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Validates signature, expiration, and issuer claims.
     */
    public Claims parseAndValidateClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID extractUserId(String token) {
        Claims claims = parseAndValidateClaims(token);
        return UUID.fromString(claims.getSubject());
    }

    public String extractTokenId(String token) {
        Claims claims = parseAndValidateClaims(token);
        return claims.getId();
    }

    public Instant extractExpiration(String token) {
        Claims claims = parseAndValidateClaims(token);
        return claims.getExpiration().toInstant();
    }

    public boolean isTokenValid(String token, UUID expectedUserId) {
        try {
            Claims claims = parseAndValidateClaims(token);
            UUID subjectId = UUID.fromString(claims.getSubject());
            boolean notExpired = claims.getExpiration().after(new Date());
            return subjectId.equals(expectedUserId) && notExpired;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    public String getIssuer() {
        return issuer;
    }
}
