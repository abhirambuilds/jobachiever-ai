package ai.jobachiever.auth.service;

import ai.jobachiever.ai.entity.UserAiPreference;
import ai.jobachiever.ai.repository.UserAiPreferenceRepository;
import ai.jobachiever.auth.dto.AuthResponse;
import ai.jobachiever.auth.dto.LoginRequest;
import ai.jobachiever.auth.dto.RegisterRequest;
import ai.jobachiever.auth.dto.UserResponse;
import ai.jobachiever.auth.exception.AccountRestrictedException;
import ai.jobachiever.auth.exception.EmailAlreadyExistsException;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.profiles.entity.CareerProfile;
import ai.jobachiever.profiles.repository.CareerProfileRepository;
import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final CareerProfileRepository careerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenRevocationService tokenRevocationService;
    private final VerificationService verificationService;
    private final ai.jobachiever.security.audit.SecurityAuditService auditService;
    private final UserAiPreferenceRepository userAiPreferenceRepository;

    public AuthServiceImpl(UserRepository userRepository,
                           CareerProfileRepository careerProfileRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           TokenRevocationService tokenRevocationService,
                           VerificationService verificationService,
                           ai.jobachiever.security.audit.SecurityAuditService auditService,
                           UserAiPreferenceRepository userAiPreferenceRepository) {
        this.userRepository = userRepository;
        this.careerProfileRepository = careerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenRevocationService = tokenRevocationService;
        this.verificationService = verificationService;
        this.auditService = auditService;
        this.userAiPreferenceRepository = userAiPreferenceRepository;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            log.warn("Registration rejected: email {} already registered", normalizedEmail);
            throw new EmailAlreadyExistsException("An account with this email address already exists.");
        }

        // Hash password securely with BCrypt before persistence
        String passwordHash = passwordEncoder.encode(request.password());

        User user = new User(
                normalizedEmail,
                passwordHash,
                request.firstName().trim(),
                request.lastName().trim());
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setRole(ai.jobachiever.users.entity.Role.USER);
        user.setEmailVerified(true);

        User savedUser = userRepository.saveAndFlush(user);

        // Transactionally initialize master career profile (1-to-1 relationship)
        CareerProfile profile = new CareerProfile(savedUser);
        careerProfileRepository.saveAndFlush(profile);

        // Transactionally initialize AI preferences with active Groq engine and consent
        UserAiPreference aiPreference = new UserAiPreference(savedUser.getId(), "GROQ", "openai/gpt-oss-120b", 0.2, 2048, true);
        userAiPreferenceRepository.saveAndFlush(aiPreference);

        // Dispatch initial account verification OTP email
        verificationService.sendVerificationOtp(savedUser);

        // Record security audit event
        auditService.recordSuccess(
                ai.jobachiever.security.audit.SecurityAuditEventType.ACCOUNT_REGISTERED,
                savedUser.getId(),
                savedUser.getEmail(),
                "New user registered with default USER role");

        log.info("Registered new user with id: {} (status: PENDING_VERIFICATION, role: USER)", savedUser.getId());
        return UserResponse.fromEntity(savedUser);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        // Retrieve user or fail with generic error to avoid account enumeration
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> {
                    auditService.recordFailure(
                            ai.jobachiever.security.audit.SecurityAuditEventType.LOGIN_FAILURE,
                            null,
                            normalizedEmail,
                            "User not found");
                    log.warn("Authentication failed: user with email {} not found", normalizedEmail);
                    return new BadCredentialsException("Invalid email or password");
                });

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            auditService.recordFailure(
                    ai.jobachiever.security.audit.SecurityAuditEventType.LOGIN_FAILURE,
                    user.getId(),
                    normalizedEmail,
                    "Invalid password");
            log.warn("Authentication failed: invalid password for user {}", user.getId());
            throw new BadCredentialsException("Invalid email or password");
        }

        // Account status guardrails
        if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
            auditService.recordFailure(
                    ai.jobachiever.security.audit.SecurityAuditEventType.LOGIN_FAILURE,
                    user.getId(),
                    normalizedEmail,
                    "Account is SUSPENDED");
            log.warn("Authentication rejected: account {} is SUSPENDED", user.getId());
            throw new AccountRestrictedException("Account has been suspended. Please contact support.");
        }
        if (user.getAccountStatus() == AccountStatus.DEACTIVATED) {
            auditService.recordFailure(
                    ai.jobachiever.security.audit.SecurityAuditEventType.LOGIN_FAILURE,
                    user.getId(),
                    normalizedEmail,
                    "Account is DEACTIVATED");
            log.warn("Authentication rejected: account {} is DEACTIVATED", user.getId());
            throw new AccountRestrictedException("Account has been deactivated. Please contact support.");
        }

        // Update last login timestamp
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        auditService.recordSuccess(
                ai.jobachiever.security.audit.SecurityAuditEventType.LOGIN_SUCCESS,
                user.getId(),
                user.getEmail(),
                "User authentication successful");

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        log.info("Successful login for user {}", user.getId());

        return AuthResponse.of(token, jwtService.getExpirationSeconds(), UserResponse.fromEntity(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return UserResponse.fromEntity(user);
    }

    @Override
    @Transactional
    public void logout(String rawToken, UUID userId) {
        tokenRevocationService.revokeToken(rawToken, userId);
        auditService.recordSuccess(
                ai.jobachiever.security.audit.SecurityAuditEventType.TOKEN_REVOKED,
                userId,
                null,
                "Token successfully revoked on logout");
        log.info("User {} successfully logged out", userId);
    }
}
