package ai.jobachiever.matching;

import ai.jobachiever.auth.service.JwtService;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.matching.dto.CreateMatchRequest;
import ai.jobachiever.matching.dto.JobMatchDto;
import ai.jobachiever.matching.dto.JobMatchSummaryDto;
import ai.jobachiever.matching.service.JobMatchService;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Job Match Controller Integration Tests")
class JobMatchControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private JobMatchService jobMatchService;

    @MockBean
    private UserRepository userRepository;

    private UUID userId;
    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("developer@jobachiever.ai");
        testUser.setFirstName("Morgan");
        testUser.setLastName("Reed");
        testUser.setRole(Role.USER);
        testUser.setAccountStatus(AccountStatus.ACTIVE);
        testUser.setEmailVerified(true);

        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(userRepository.findByEmailIgnoreCase(testUser.getEmail())).willReturn(Optional.of(testUser));

        jwtToken = "Bearer " + jwtService.generateToken(testUser.getId(), testUser.getEmail());
    }

    @Test
    @DisplayName("POST /api/v1/matches - Create Match successfully (200 OK)")
    void createMatchSuccess() throws Exception {
        UUID resumeId = UUID.randomUUID();
        UUID jobId = UUID.randomUUID();
        UUID matchId = UUID.randomUUID();

        JobMatchDto dto = new JobMatchDto(
                matchId,
                resumeId,
                null,
                "Backend Resume",
                jobId,
                null,
                "Staff Distributed Systems Engineer",
                "Acme Global",
                "GROQ",
                "llama-3.3-70b-versatile",
                89,
                92,
                80,
                88,
                100,
                85,
                0.94,
                "Strong alignment across required technologies and architecture.",
                objectMapper.createObjectNode().put("success", true),
                Instant.now()
        );

        given(jobMatchService.createMatch(eq(userId), any(CreateMatchRequest.class))).willReturn(dto);

        CreateMatchRequest request = new CreateMatchRequest(
                resumeId, jobId, null, null, null, null, null, null, null, null
        );

        mockMvc.perform(post("/api/v1/matches")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(matchId.toString()))
                .andExpect(jsonPath("$.data.overallScore").value(89))
                .andExpect(jsonPath("$.data.requiredSkillsScore").value(92))
                .andExpect(jsonPath("$.data.provider").value("GROQ"));
    }

    @Test
    @DisplayName("POST /api/v1/matches - Validation failure on missing resumeId (400 Bad Request)")
    void createMatchValidationFailure() throws Exception {
        CreateMatchRequest invalidRequest = new CreateMatchRequest(
                null, UUID.randomUUID(), null, null, null, null, null, null, null, null
        );

        mockMvc.perform(post("/api/v1/matches")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/matches - Missing AI consent returns 403 Forbidden")
    void createMatchConsentRequired() throws Exception {
        UUID resumeId = UUID.randomUUID();
        CreateMatchRequest request = new CreateMatchRequest(
                resumeId, UUID.randomUUID(), null, null, null, null, null, null, null, null
        );

        given(jobMatchService.createMatch(eq(userId), any(CreateMatchRequest.class)))
                .willThrow(new AccessDeniedException("External AI processing consent is required"));

        mockMvc.perform(post("/api/v1/matches")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/matches - Retrieves user match history (200 OK)")
    void getMatchesSuccess() throws Exception {
        UUID matchId = UUID.randomUUID();
        JobMatchSummaryDto summary = new JobMatchSummaryDto(
                matchId,
                UUID.randomUUID(),
                "Primary Resume",
                UUID.randomUUID(),
                null,
                "Senior Cloud Architect",
                "CloudTech Inc",
                "GROQ",
                "llama-3.3-70b-versatile",
                86,
                0.92,
                "Strong overall profile fit",
                Instant.now()
        );

        given(jobMatchService.getMatches(userId)).willReturn(List.of(summary));

        mockMvc.perform(get("/api/v1/matches")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(matchId.toString()))
                .andExpect(jsonPath("$.data[0].overallScore").value(86));
    }

    @Test
    @DisplayName("GET /api/v1/matches/{matchId} - Retrieves full details (200 OK)")
    void getMatchDetailsSuccess() throws Exception {
        UUID matchId = UUID.randomUUID();
        JobMatchDto dto = new JobMatchDto(
                matchId,
                UUID.randomUUID(),
                null,
                "Primary Resume",
                UUID.randomUUID(),
                null,
                "Staff Software Engineer",
                "TechCorp",
                "GROQ",
                "llama-3.3-70b-versatile",
                91,
                95,
                85,
                90,
                100,
                88,
                0.96,
                "Exceptional alignment",
                objectMapper.createObjectNode().put("success", true),
                Instant.now()
        );

        given(jobMatchService.getMatchDetails(userId, matchId)).willReturn(dto);

        mockMvc.perform(get("/api/v1/matches/{matchId}", matchId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(matchId.toString()))
                .andExpect(jsonPath("$.data.overallScore").value(91));
    }

    @Test
    @DisplayName("GET /api/v1/matches/{matchId} - Not Found (404 Not Found)")
    void getMatchDetailsNotFound() throws Exception {
        UUID matchId = UUID.randomUUID();
        given(jobMatchService.getMatchDetails(userId, matchId))
                .willThrow(new ResourceNotFoundException("Match report not found with id: " + matchId));

        mockMvc.perform(get("/api/v1/matches/{matchId}", matchId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/v1/matches/{matchId} - Deletes match report (200 OK)")
    void deleteMatchSuccess() throws Exception {
        UUID matchId = UUID.randomUUID();
        doNothing().when(jobMatchService).deleteMatch(userId, matchId);

        mockMvc.perform(delete("/api/v1/matches/{matchId}", matchId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/matches - Unauthorized when no JWT token provided (401 Unauthorized)")
    void unauthenticatedAccessDenied() throws Exception {
        mockMvc.perform(get("/api/v1/matches"))
                .andExpect(status().isUnauthorized());
    }
}
