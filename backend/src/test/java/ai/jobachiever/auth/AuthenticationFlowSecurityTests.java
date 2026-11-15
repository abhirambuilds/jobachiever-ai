package ai.jobachiever.auth;

import ai.jobachiever.auth.dto.*;
import ai.jobachiever.auth.exception.AccountRestrictedException;
import ai.jobachiever.auth.exception.EmailAlreadyExistsException;
import ai.jobachiever.auth.exception.InvalidTokenException;
import ai.jobachiever.auth.exception.OtpVerificationException;
import ai.jobachiever.auth.exception.RateLimitException;
import ai.jobachiever.auth.service.AuthService;
import ai.jobachiever.auth.service.PasswordResetService;
import ai.jobachiever.auth.service.VerificationService;
import ai.jobachiever.common.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@DisplayName("Authentication Controller & Security Flow Tests")
class AuthenticationFlowSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private VerificationService verificationService;

    @MockBean
    private PasswordResetService passwordResetService;

    private UUID sampleUserId;
    private UserResponse sampleUserResponse;

    @BeforeEach
    void setUp() {
        sampleUserId = UUID.randomUUID();
        sampleUserResponse = new UserResponse(
                sampleUserId,
                "alex.turner@jobachiever.ai",
                "Alex",
                "Turner",
                "PENDING_VERIFICATION",
                false,
                Instant.now(),
                null
        );
    }

    @Test
    @DisplayName("POST /register succeeds and returns 201 Created with safe user info")
    void register_withValidData_returnsCreated() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Alex",
                "Turner",
                "alex.turner@jobachiever.ai",
                "SecureP@ssw0rd2026!"
        );

        given(authService.register(any(RegisterRequest.class))).willReturn(sampleUserResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.email").value("alex.turner@jobachiever.ai"))
                .andExpect(jsonPath("$.data.firstName").value("Alex"))
                .andExpect(jsonPath("$.data.accountStatus").value("PENDING_VERIFICATION"))
                .andExpect(jsonPath("$.data.emailVerified").value(false))
                .andExpect(jsonPath("$.data.password").doesNotExist())
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /register with duplicate email returns 409 Conflict")
    void register_withDuplicateEmail_returnsConflict() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Alex",
                "Turner",
                "alex.turner@jobachiever.ai",
                "SecureP@ssw0rd2026!"
        );

        given(authService.register(any(RegisterRequest.class)))
                .willThrow(new EmailAlreadyExistsException("An account with this email address already exists."));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value(containsString("already exists")));
    }

    @Test
    @DisplayName("POST /register with invalid email format returns 400 Bad Request")
    void register_withInvalidEmail_returnsBadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Alex",
                "Turner",
                "invalid-email-address",
                "SecureP@ssw0rd2026!"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors[0].field").value("email"));
    }

    @Test
    @DisplayName("POST /register with weak password returns 400 Bad Request")
    void register_withWeakPassword_returnsBadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Alex",
                "Turner",
                "alex.turner@jobachiever.ai",
                "weak"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors[0].field").value("password"));
    }

    @Test
    @DisplayName("POST /login with valid credentials returns 200 OK with Bearer token")
    void login_withValidCredentials_returnsToken() throws Exception {
        LoginRequest request = new LoginRequest("alex.turner@jobachiever.ai", "SecureP@ssw0rd2026!");
        AuthResponse response = AuthResponse.of("mock.jwt.token", 86400, sampleUserResponse);

        given(authService.login(any(LoginRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.expiresIn").value(86400))
                .andExpect(jsonPath("$.data.user.email").value("alex.turner@jobachiever.ai"));
    }

    @Test
    @DisplayName("POST /login with invalid credentials returns generic 401 Unauthorized")
    void login_withBadCredentials_returnsGenericUnauthorized() throws Exception {
        LoginRequest request = new LoginRequest("alex.turner@jobachiever.ai", "WrongPassword!");

        given(authService.login(any(LoginRequest.class)))
                .willThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("POST /login with suspended account returns 403 Forbidden")
    void login_withSuspendedAccount_returnsForbidden() throws Exception {
        LoginRequest request = new LoginRequest("suspended@jobachiever.ai", "SecureP@ssw0rd2026!");

        given(authService.login(any(LoginRequest.class)))
                .willThrow(new AccountRestrictedException("Account has been suspended. Please contact support."));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value(containsString("suspended")));
    }

    @Test
    @DisplayName("POST /logout returns 204 No Content")
    void logout_returnsNoContent() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer sample.revoked.token"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("POST /verify-email with valid 6-digit OTP returns 200 OK")
    void verifyEmail_withValidOtp_returnsOk() throws Exception {
        VerifyEmailRequest request = new VerifyEmailRequest("alex.turner@jobachiever.ai", "123456");
        doNothing().when(verificationService).verifyEmail("alex.turner@jobachiever.ai", "123456");

        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(containsString("Email successfully verified")));
    }

    @Test
    @DisplayName("POST /verify-otp alias endpoint with valid OTP returns 200 OK")
    void verifyOtp_aliasEndpoint_returnsOk() throws Exception {
        VerifyEmailRequest request = new VerifyEmailRequest("alex.turner@jobachiever.ai", "654321");
        doNothing().when(verificationService).verifyEmail("alex.turner@jobachiever.ai", "654321");

        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(containsString("Email successfully verified")));
    }

    @Test
    @DisplayName("POST /verify-email with invalid OTP format fails validation with 400 Bad Request")
    void verifyEmail_withInvalidOtpFormat_failsValidation() throws Exception {
        VerifyEmailRequest request = new VerifyEmailRequest("alex.turner@jobachiever.ai", "123");

        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("POST /verify-email with failed OTP verification returns 400 Bad Request")
    void verifyEmail_withIncorrectOtp_returnsBadRequest() throws Exception {
        VerifyEmailRequest request = new VerifyEmailRequest("alex.turner@jobachiever.ai", "999999");
        org.mockito.Mockito.doThrow(new OtpVerificationException("Invalid verification code. 4 attempts remaining."))
                .when(verificationService).verifyEmail("alex.turner@jobachiever.ai", "999999");

        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(containsString("Invalid verification code")));
    }

    @Test
    @DisplayName("POST /resend-verification returns 200 OK")
    void resendVerification_returnsOk() throws Exception {
        ResendVerificationRequest request = new ResendVerificationRequest("alex.turner@jobachiever.ai");
        doNothing().when(verificationService).resendVerificationOtp("alex.turner@jobachiever.ai");

        mockMvc.perform(post("/api/v1/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(containsString("verification code has been dispatched")));
    }

    @Test
    @DisplayName("POST /resend-otp alias endpoint returns 200 OK")
    void resendOtp_aliasEndpoint_returnsOk() throws Exception {
        ResendVerificationRequest request = new ResendVerificationRequest("alex.turner@jobachiever.ai");
        doNothing().when(verificationService).resendVerificationOtp("alex.turner@jobachiever.ai");

        mockMvc.perform(post("/api/v1/auth/resend-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(containsString("verification code has been dispatched")));
    }

    @Test
    @DisplayName("POST /resend-verification throttled by cooldown returns 429 Too Many Requests")
    void resendVerification_throttled_returnsTooManyRequests() throws Exception {
        ResendVerificationRequest request = new ResendVerificationRequest("alex.turner@jobachiever.ai");
        org.mockito.Mockito.doThrow(new RateLimitException("Please wait 45 seconds before requesting a new verification code."))
                .when(verificationService).resendVerificationOtp("alex.turner@jobachiever.ai");

        mockMvc.perform(post("/api/v1/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value(containsString("wait 45 seconds")));
    }

    @Test
    @DisplayName("POST /forgot-password returns 200 OK with zero email enumeration")
    void forgotPassword_returnsOk() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("alex.turner@jobachiever.ai");
        doNothing().when(passwordResetService).requestPasswordReset("alex.turner@jobachiever.ai");

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(containsString("password reset instructions have been dispatched")));
    }

    @Test
    @DisplayName("POST /reset-password with valid token and strong password returns 200 OK")
    void resetPassword_withValidTokenAndStrongPassword_returnsOk() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest("valid-hex-token-32-bytes", "NewStr0ngP@ssw0rd2026!");
        doNothing().when(passwordResetService).resetPassword("valid-hex-token-32-bytes", "NewStr0ngP@ssw0rd2026!");

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(containsString("Password successfully reset")));
    }

    @Test
    @DisplayName("POST /reset-password with weak password fails validation with 400 Bad Request")
    void resetPassword_withWeakPassword_failsValidation() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest("valid-hex-token-32-bytes", "weak");

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("POST /reset-password with expired/invalid token returns 401 Unauthorized")
    void resetPassword_withInvalidToken_returnsUnauthorized() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest("expired-token", "NewStr0ngP@ssw0rd2026!");
        org.mockito.Mockito.doThrow(new InvalidTokenException("Invalid or expired password reset token."))
                .when(passwordResetService).resetPassword("expired-token", "NewStr0ngP@ssw0rd2026!");

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value(containsString("Invalid or expired")));
    }
}
