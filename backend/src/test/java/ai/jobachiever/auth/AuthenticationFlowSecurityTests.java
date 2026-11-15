package ai.jobachiever.auth;

import ai.jobachiever.auth.dto.AuthResponse;
import ai.jobachiever.auth.dto.LoginRequest;
import ai.jobachiever.auth.dto.RegisterRequest;
import ai.jobachiever.auth.dto.UserResponse;
import ai.jobachiever.auth.exception.AccountRestrictedException;
import ai.jobachiever.auth.exception.EmailAlreadyExistsException;
import ai.jobachiever.auth.service.AuthService;
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
}
