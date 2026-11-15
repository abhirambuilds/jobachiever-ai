package ai.jobachiever.security;

import ai.jobachiever.admin.dto.UpdateAccountStatusRequest;
import ai.jobachiever.admin.dto.UpdateRoleRequest;
import ai.jobachiever.applications.entity.ApplicationActivity;
import ai.jobachiever.applications.entity.JobApplication;
import ai.jobachiever.applications.repository.ApplicationActivityRepository;
import ai.jobachiever.applications.repository.JobApplicationRepository;
import ai.jobachiever.auth.repository.RevokedTokenRepository;
import ai.jobachiever.auth.service.JwtService;
import ai.jobachiever.careertracks.entity.CareerTrack;
import ai.jobachiever.careertracks.repository.CareerTrackRepository;
import ai.jobachiever.profiles.entity.CareerProfile;
import ai.jobachiever.profiles.repository.CareerProfileRepository;
import ai.jobachiever.resumes.entity.DocumentType;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;
import ai.jobachiever.resumes.repository.ResumeDocumentRepository;
import ai.jobachiever.resumes.repository.ResumeVersionRepository;
import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.Role;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Centralized Authorization, User Ownership and Security Hardening Tests")
class CentralizedAuthorizationSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private CareerProfileRepository careerProfileRepository;

    @MockBean
    private CareerTrackRepository careerTrackRepository;

    @MockBean
    private ResumeDocumentRepository resumeDocumentRepository;

    @MockBean
    private ResumeVersionRepository resumeVersionRepository;

    @MockBean
    private JobApplicationRepository jobApplicationRepository;

    @MockBean
    private ApplicationActivityRepository applicationActivityRepository;

    @MockBean
    private RevokedTokenRepository revokedTokenRepository;

    private User userA;
    private User userB;
    private User adminUser;
    private User unverifiedUser;
    private User suspendedUser;
    private User deactivatedUser;

    private String tokenUserA;
    private String tokenUserB;
    private String tokenAdmin;
    private String tokenUnverified;
    private String tokenSuspended;
    private String tokenDeactivated;

    private UUID profileIdUserB;
    private UUID resumeIdUserB;
    private UUID resumeVersionIdUserB;
    private UUID applicationIdUserB;
    private UUID activityIdUserB;

    @BeforeEach
    void setUp() {
        // User A (Active, Verified, Standard USER)
        userA = new User("userA@jobachiever.ai", "$2a$12$hashA", "User", "A");
        userA.setId(UUID.randomUUID());
        userA.setAccountStatus(AccountStatus.ACTIVE);
        userA.setRole(Role.USER);
        userA.setEmailVerified(true);
        tokenUserA = jwtService.generateToken(userA.getId(), userA.getEmail());

        // User B (Active, Verified, Standard USER)
        userB = new User("userB@jobachiever.ai", "$2a$12$hashB", "User", "B");
        userB.setId(UUID.randomUUID());
        userB.setAccountStatus(AccountStatus.ACTIVE);
        userB.setRole(Role.USER);
        userB.setEmailVerified(true);
        tokenUserB = jwtService.generateToken(userB.getId(), userB.getEmail());

        // Admin User (Active, Verified, ADMIN)
        adminUser = new User("admin@jobachiever.ai", "$2a$12$hashAdmin", "Admin", "User");
        adminUser.setId(UUID.randomUUID());
        adminUser.setAccountStatus(AccountStatus.ACTIVE);
        adminUser.setRole(Role.ADMIN);
        adminUser.setEmailVerified(true);
        tokenAdmin = jwtService.generateToken(adminUser.getId(), adminUser.getEmail());

        // Unverified User (Pending verification)
        unverifiedUser = new User("unverified@jobachiever.ai", "$2a$12$hashUnver", "Unverified", "User");
        unverifiedUser.setId(UUID.randomUUID());
        unverifiedUser.setAccountStatus(AccountStatus.PENDING_VERIFICATION);
        unverifiedUser.setRole(Role.USER);
        unverifiedUser.setEmailVerified(false);
        tokenUnverified = jwtService.generateToken(unverifiedUser.getId(), unverifiedUser.getEmail());

        // Suspended User
        suspendedUser = new User("suspended@jobachiever.ai", "$2a$12$hashSusp", "Suspended", "User");
        suspendedUser.setId(UUID.randomUUID());
        suspendedUser.setAccountStatus(AccountStatus.SUSPENDED);
        suspendedUser.setRole(Role.USER);
        suspendedUser.setEmailVerified(true);
        tokenSuspended = jwtService.generateToken(suspendedUser.getId(), suspendedUser.getEmail());

        // Deactivated User
        deactivatedUser = new User("deactivated@jobachiever.ai", "$2a$12$hashDeact", "Deactivated", "User");
        deactivatedUser.setId(UUID.randomUUID());
        deactivatedUser.setAccountStatus(AccountStatus.DEACTIVATED);
        deactivatedUser.setRole(Role.USER);
        deactivatedUser.setEmailVerified(true);
        tokenDeactivated = jwtService.generateToken(deactivatedUser.getId(), deactivatedUser.getEmail());

        // Wire UserRepository mock responses for all test principals
        given(userRepository.findById(userA.getId())).willReturn(Optional.of(userA));
        given(userRepository.findByEmailIgnoreCase(userA.getEmail())).willReturn(Optional.of(userA));

        given(userRepository.findById(userB.getId())).willReturn(Optional.of(userB));
        given(userRepository.findByEmailIgnoreCase(userB.getEmail())).willReturn(Optional.of(userB));

        given(userRepository.findById(adminUser.getId())).willReturn(Optional.of(adminUser));
        given(userRepository.findByEmailIgnoreCase(adminUser.getEmail())).willReturn(Optional.of(adminUser));

        given(userRepository.findById(unverifiedUser.getId())).willReturn(Optional.of(unverifiedUser));
        given(userRepository.findByEmailIgnoreCase(unverifiedUser.getEmail())).willReturn(Optional.of(unverifiedUser));

        given(userRepository.findById(suspendedUser.getId())).willReturn(Optional.of(suspendedUser));
        given(userRepository.findByEmailIgnoreCase(suspendedUser.getEmail())).willReturn(Optional.of(suspendedUser));

        given(userRepository.findById(deactivatedUser.getId())).willReturn(Optional.of(deactivatedUser));
        given(userRepository.findByEmailIgnoreCase(deactivatedUser.getEmail())).willReturn(Optional.of(deactivatedUser));

        // Sample resources owned strictly by User B
        profileIdUserB = UUID.randomUUID();
        resumeIdUserB = UUID.randomUUID();
        resumeVersionIdUserB = UUID.randomUUID();
        applicationIdUserB = UUID.randomUUID();
        activityIdUserB = UUID.randomUUID();

        CareerProfile profileB = new CareerProfile(userB);
        profileB.setId(profileIdUserB);
        given(careerProfileRepository.findByIdAndUserId(profileIdUserB, userB.getId())).willReturn(Optional.of(profileB));
        given(careerProfileRepository.findByIdAndUserId(profileIdUserB, userA.getId())).willReturn(Optional.empty());

        ResumeDocument docB = new ResumeDocument(userB, "User B Resume", DocumentType.UPLOADED);
        docB.setId(resumeIdUserB);
        given(resumeDocumentRepository.findByIdAndUserId(resumeIdUserB, userB.getId())).willReturn(Optional.of(docB));
        given(resumeDocumentRepository.findByIdAndUserId(resumeIdUserB, userA.getId())).willReturn(Optional.empty());

        ResumeVersion verB = new ResumeVersion();
        verB.setId(resumeVersionIdUserB);
        verB.setDocument(docB);
        given(resumeVersionRepository.findByIdAndDocumentUserId(resumeVersionIdUserB, userB.getId())).willReturn(Optional.of(verB));
        given(resumeVersionRepository.findByIdAndDocumentUserId(resumeVersionIdUserB, userA.getId())).willReturn(Optional.empty());
        given(resumeVersionRepository.existsByIdAndDocumentUserId(resumeVersionIdUserB, userB.getId())).willReturn(true);
        given(resumeVersionRepository.existsByIdAndDocumentUserId(resumeVersionIdUserB, userA.getId())).willReturn(false);

        JobApplication appB = new JobApplication();
        appB.setId(applicationIdUserB);
        appB.setUser(userB);
        given(jobApplicationRepository.findByIdAndUserId(applicationIdUserB, userB.getId())).willReturn(Optional.of(appB));
        given(jobApplicationRepository.findByIdAndUserId(applicationIdUserB, userA.getId())).willReturn(Optional.empty());

        ApplicationActivity actB = new ApplicationActivity(appB, "STATUS_CHANGE", "Applied");
        actB.setId(activityIdUserB);
        given(applicationActivityRepository.findByIdAndApplicationUserId(activityIdUserB, userB.getId())).willReturn(Optional.of(actB));
        given(applicationActivityRepository.findByIdAndApplicationUserId(activityIdUserB, userA.getId())).willReturn(Optional.empty());

        given(revokedTokenRepository.existsByTokenIdentifier(any())).willReturn(false);
    }

    // =========================================================================
    // 1 & 2. Authentication Context and Baseline Access Boundaries
    // =========================================================================

    @Test
    @DisplayName("1. Unauthenticated user cannot access protected routes (401 Unauthorized)")
    void unauthenticatedUser_isRejectedWith401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("2. Valid authenticated user can access permitted resources (200 OK)")
    void validAuthenticatedUser_canAccessPermittedResources() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + tokenUserA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("userA@jobachiever.ai"))
                .andExpect(jsonPath("$.data.role").value("USER"));
    }

    // =========================================================================
    // 3, 4, 5, 6, 7, 8. Cross-User Resource Ownership Boundaries (404 Non-Enumeration)
    // =========================================================================

    @Test
    @DisplayName("3. User A cannot read User B's career profile (returns 404 to prevent enumeration)")
    void userA_cannotReadUserB_careerProfile() throws Exception {
        mockMvc.perform(get("/api/v1/resources/profile/" + profileIdUserB)
                        .header("Authorization", "Bearer " + tokenUserA))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value(containsString("Career profile not found")));
    }

    @Test
    @DisplayName("4. User A cannot modify User B's career profile (returns 404)")
    void userA_cannotModifyUserB_careerProfile() throws Exception {
        mockMvc.perform(put("/api/v1/resources/profile/" + profileIdUserB)
                        .header("Authorization", "Bearer " + tokenUserA))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("5. User A cannot delete User B's resume document (returns 404)")
    void userA_cannotDeleteUserB_resume() throws Exception {
        mockMvc.perform(delete("/api/v1/resources/resume/" + resumeIdUserB)
                        .header("Authorization", "Bearer " + tokenUserA))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("6. User A cannot access User B's resume version (returns 404)")
    void userA_cannotAccessUserB_resumeVersion() throws Exception {
        mockMvc.perform(get("/api/v1/resources/resume-version/" + resumeVersionIdUserB)
                        .header("Authorization", "Bearer " + tokenUserA))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("7. User A cannot access User B's job application (returns 404)")
    void userA_cannotAccessUserB_jobApplication() throws Exception {
        mockMvc.perform(get("/api/v1/resources/application/" + applicationIdUserB)
                        .header("Authorization", "Bearer " + tokenUserA))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("8. User A cannot access User B's application activity (returns 404)")
    void userA_cannotAccessUserB_applicationActivity() throws Exception {
        mockMvc.perform(get("/api/v1/resources/activity/" + activityIdUserB)
                        .header("Authorization", "Bearer " + tokenUserA))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("8b. User A cannot reference User B's resume version in their own application")
    void userA_cannotReferenceUserB_resumeVersionInApplication() throws Exception {
        mockMvc.perform(post("/api/v1/resources/application-reference/" + resumeVersionIdUserB)
                        .header("Authorization", "Bearer " + tokenUserA))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Owner can access their own private resources successfully")
    void owner_canAccessTheirOwnResources() throws Exception {
        mockMvc.perform(get("/api/v1/resources/profile/" + profileIdUserB)
                        .header("Authorization", "Bearer " + tokenUserB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(profileIdUserB.toString()));
    }

    // =========================================================================
    // 9 & 10. Role and Authority Boundaries
    // =========================================================================

    @Test
    @DisplayName("9. Standard user cannot access admin role modification endpoints (403 Forbidden)")
    void userCannotModifyTheirOwnRoleToAdmin() throws Exception {
        UpdateRoleRequest request = new UpdateRoleRequest(Role.ADMIN, "Self-promotion attempt");

        mockMvc.perform(patch("/api/v1/admin/users/" + userA.getId() + "/role")
                        .header("Authorization", "Bearer " + tokenUserA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("10. Admin user can successfully access admin role management API (200 OK)")
    void adminUser_canModifyRole() throws Exception {
        UpdateRoleRequest request = new UpdateRoleRequest(Role.ADMIN, "Legitimate administrative promotion");
        given(userRepository.save(any(User.class))).willAnswer(i -> i.getArgument(0));

        mockMvc.perform(patch("/api/v1/admin/users/" + userB.getId() + "/role")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    // =========================================================================
    // 11, 12, 13. Account State Enforcement
    // =========================================================================

    @Test
    @DisplayName("11. Unverified accounts cannot access verified-required protected resources (403 Forbidden)")
    void unverifiedAccount_cannotAccessProtectedResources() throws Exception {
        mockMvc.perform(get("/api/v1/resources/verified-only")
                        .header("Authorization", "Bearer " + tokenUnverified))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value(containsString("Account verification required")));
    }

    @Test
    @DisplayName("12. Suspended accounts are rejected during request authentication")
    void suspendedAccount_isRejected() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + tokenSuspended))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("13. Deactivated accounts are rejected during request authentication")
    void deactivatedAccount_isRejected() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + tokenDeactivated))
                .andExpect(status().isUnauthorized());
    }

    // =========================================================================
    // 14 & 15. Token Integrity and Revocation
    // =========================================================================

    @Test
    @DisplayName("14. Invalid JWT is rejected (401 Unauthorized)")
    void invalidJwt_isRejected() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer invalid.malformed.jwt.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("15. Revoked JWT is rejected (401 Unauthorized)")
    void revokedJwt_isRejected() throws Exception {
        given(revokedTokenRepository.existsByTokenIdentifier(any())).willReturn(true);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + tokenUserA))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    // =========================================================================
    // 16. Public Routes Allowlist
    // =========================================================================

    @Test
    @DisplayName("16. Public health and auth routes remain accessible without credentials (200 OK)")
    void publicRoutes_remainAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    // =========================================================================
    // 17. CORS Protection
    // =========================================================================

    @Test
    @DisplayName("17. CORS rejects unapproved cross-origin requests")
    void cors_rejectsUnapprovedOrigins() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login")
                        .header("Origin", "https://malicious-attacker-site.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CORS allows approved origins")
    void cors_allowsApprovedOrigins() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    // =========================================================================
    // 18. Administrative Route Protection
    // =========================================================================

    @Test
    @DisplayName("18. Administrative routes reject standard USER accounts (403 Forbidden)")
    void adminRoutes_rejectStandardUsers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .header("Authorization", "Bearer " + tokenUserA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Administrative routes allow ADMIN accounts (200 OK)")
    void adminRoutes_allowAdminAccounts() throws Exception {
        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
