package ai.jobachiever.auth;

import ai.jobachiever.auth.dto.AuthResponse;
import ai.jobachiever.auth.dto.LoginRequest;
import ai.jobachiever.auth.dto.RegisterRequest;
import ai.jobachiever.auth.dto.UserResponse;
import ai.jobachiever.auth.exception.AccountRestrictedException;
import ai.jobachiever.auth.exception.EmailAlreadyExistsException;
import ai.jobachiever.auth.service.AuthServiceImpl;
import ai.jobachiever.auth.service.JwtService;
import ai.jobachiever.auth.service.TokenRevocationService;
import ai.jobachiever.profiles.entity.CareerProfile;
import ai.jobachiever.profiles.repository.CareerProfileRepository;
import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthServiceImpl Business Logic & Password Hashing Tests")
class AuthServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CareerProfileRepository careerProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private TokenRevocationService tokenRevocationService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("dev@jobachiever.ai", "$2a$12$hashedPasswordExample", "Dev", "User");
        sampleUser.setId(UUID.randomUUID());
        sampleUser.setAccountStatus(AccountStatus.ACTIVE);
    }

    @Test
    @DisplayName("Password is BCrypt-hashed before persistence and plaintext password is never saved")
    void register_hashesPasswordWithBCrypt() {
        RegisterRequest request = new RegisterRequest(
                "Dev",
                "User",
                "Dev@JobAchiever.ai", // Test case normalization
                "PlaintextSecret123!"
        );

        given(userRepository.existsByEmailIgnoreCase("dev@jobachiever.ai")).willReturn(false);
        given(passwordEncoder.encode("PlaintextSecret123!")).willReturn("$2a$12$eX4mpL3H4sh3dStr1ng");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        given(userRepository.save(userCaptor.capture())).willAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        UserResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.email()).isEqualTo("dev@jobachiever.ai");

        User persistedUser = userCaptor.getValue();
        // Crucial security assertions
        assertThat(persistedUser.getPasswordHash()).isEqualTo("$2a$12$eX4mpL3H4sh3dStr1ng");
        assertThat(persistedUser.getPasswordHash()).doesNotContain("PlaintextSecret123!");
        assertThat(persistedUser.getEmail()).isEqualTo("dev@jobachiever.ai");

        // Verify master career profile is created in same transaction
        verify(careerProfileRepository, times(1)).save(any(CareerProfile.class));
    }

    @Test
    @DisplayName("Duplicate email registration is rejected with EmailAlreadyExistsException")
    void register_rejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Dev", "User", "dev@jobachiever.ai", "Secret123!");

        given(userRepository.existsByEmailIgnoreCase("dev@jobachiever.ai")).willReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
        verify(careerProfileRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login with invalid password throws BadCredentialsException")
    void login_withWrongPassword_throwsBadCredentials() {
        LoginRequest request = new LoginRequest("dev@jobachiever.ai", "WrongPassword!");

        given(userRepository.findByEmailIgnoreCase("dev@jobachiever.ai")).willReturn(Optional.of(sampleUser));
        given(passwordEncoder.matches("WrongPassword!", sampleUser.getPasswordHash())).willReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    @DisplayName("Login with unknown email throws BadCredentialsException (zero enumeration)")
    void login_withUnknownEmail_throwsBadCredentials() {
        LoginRequest request = new LoginRequest("unknown@jobachiever.ai", "Secret123!");

        given(userRepository.findByEmailIgnoreCase("unknown@jobachiever.ai")).willReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    @DisplayName("Login with suspended account throws AccountRestrictedException")
    void login_withSuspendedAccount_throwsRestricted() {
        sampleUser.setAccountStatus(AccountStatus.SUSPENDED);
        LoginRequest request = new LoginRequest("dev@jobachiever.ai", "ValidPassword!");

        given(userRepository.findByEmailIgnoreCase("dev@jobachiever.ai")).willReturn(Optional.of(sampleUser));
        given(passwordEncoder.matches("ValidPassword!", sampleUser.getPasswordHash())).willReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AccountRestrictedException.class)
                .hasMessageContaining("suspended");
    }

    @Test
    @DisplayName("Logout invokes TokenRevocationService with raw token and user id")
    void logout_invokesRevocationService() {
        UUID userId = UUID.randomUUID();
        String token = "sample.jwt.token";

        authService.logout(token, userId);

        verify(tokenRevocationService, times(1)).revokeToken(token, userId);
    }
}
