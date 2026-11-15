package ai.jobachiever.auth;

import ai.jobachiever.auth.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JWT Service Unit & Security Tests")
class JwtServiceTests {

    private JwtService jwtService;
    private final String secretKey = "test-secret-key-jobachiever-development-32bytes-minimum!";
    private final long expirationSeconds = 3600; // 1 hour
    private final String issuer = "jobachiever-ai-test";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtService, "expirationSeconds", expirationSeconds);
        ReflectionTestUtils.setField(jwtService, "issuer", issuer);
        ReflectionTestUtils.setField(jwtService, "activeProfile", "test");
        jwtService.init();
    }

    @Test
    @DisplayName("JWT is generated correctly with subject, email, issuer, jti and expiration")
    void generateToken_producesValidTokenWithClaims() {
        UUID userId = UUID.randomUUID();
        String email = "candidate@jobachiever.ai";

        String token = jwtService.generateToken(userId, email);
        assertThat(token).isNotBlank();

        Claims claims = jwtService.parseAndValidateClaims(token);
        assertThat(claims.getSubject()).isEqualTo(userId.toString());
        assertThat(claims.get("email")).isEqualTo(email);
        assertThat(claims.getIssuer()).isEqualTo(issuer);
        assertThat(claims.getId()).isNotBlank();
        assertThat(claims.getIssuedAt()).isBefore(new Date());
        assertThat(claims.getExpiration()).isAfter(new Date());

        assertThat(jwtService.isTokenValid(token, userId)).isTrue();
    }

    @Test
    @DisplayName("Token validation fails when expected user ID does not match subject")
    void isTokenValid_failsOnSubjectMismatch() {
        UUID userId = UUID.randomUUID();
        UUID differentUserId = UUID.randomUUID();
        String token = jwtService.generateToken(userId, "test@example.com");

        assertThat(jwtService.isTokenValid(token, differentUserId)).isFalse();
    }

    @Test
    @DisplayName("Expired JWT token is rejected")
    void expiredToken_isRejected() {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        UUID userId = UUID.randomUUID();

        // Create a token expired 10 minutes ago
        String expiredToken = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(userId.toString())
                .claim("email", "expired@jobachiever.ai")
                .issuer(issuer)
                .issuedAt(new Date(System.currentTimeMillis() - 20 * 60 * 1000))
                .expiration(new Date(System.currentTimeMillis() - 10 * 60 * 1000))
                .signWith(key)
                .compact();

        assertThatThrownBy(() -> jwtService.parseAndValidateClaims(expiredToken))
                .isInstanceOf(JwtException.class);

        assertThat(jwtService.isTokenValid(expiredToken, userId)).isFalse();
    }

    @Test
    @DisplayName("Modified JWT signature is rejected")
    void modifiedSignature_isRejected() {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateToken(userId, "tamper@jobachiever.ai");

        // Tamper with the signature portion (last part of dot-separated JWT)
        String[] parts = token.split("\\.");
        String tamperedToken = parts[0] + "." + parts[1] + ".tamperedSignatureValue";

        assertThatThrownBy(() -> jwtService.parseAndValidateClaims(tamperedToken))
                .isInstanceOf(JwtException.class);

        assertThat(jwtService.isTokenValid(tamperedToken, userId)).isFalse();
    }

    @Test
    @DisplayName("Invalid JWT format is rejected")
    void invalidTokenFormat_isRejected() {
        assertThatThrownBy(() -> jwtService.parseAndValidateClaims("not.a.valid.jwt.token"))
                .isInstanceOf(JwtException.class);

        assertThat(jwtService.isTokenValid("gibberish", UUID.randomUUID())).isFalse();
    }

    @Test
    @DisplayName("Production profile fails initialization if JWT secret is missing or weak")
    void productionProfile_requiresStrongSecret() {
        JwtService prodService = new JwtService();
        ReflectionTestUtils.setField(prodService, "secretKey", "short");
        ReflectionTestUtils.setField(prodService, "activeProfile", "production");

        assertThatThrownBy(prodService::init)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 bytes");
    }

    @Test
    @DisplayName("Extracts userId, tokenId, and expiration accurately")
    void extractsKeyClaimsAccurately() {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateToken(userId, "extract@jobachiever.ai");

        UUID extractedUserId = jwtService.extractUserId(token);
        String extractedJti = jwtService.extractTokenId(token);
        Instant extractedExpiry = jwtService.extractExpiration(token);

        assertThat(extractedUserId).isEqualTo(userId);
        assertThat(extractedJti).isNotBlank();
        assertThat(extractedExpiry).isAfter(Instant.now());
    }
}
