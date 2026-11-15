package ai.jobachiever.resumes;

import ai.jobachiever.auth.service.JwtService;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.resumes.dto.ResumeAnalysisDto;
import ai.jobachiever.resumes.dto.ResumeAnalysisSummaryDto;
import ai.jobachiever.resumes.service.ResumeAnalysisService;
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
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Resume Analysis Controller Integration Tests")
class ResumeAnalysisControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private ResumeAnalysisService resumeAnalysisService;

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
        testUser.setEmail("alex@jobachiever.ai");
        testUser.setFirstName("Alex");
        testUser.setLastName("Mercer");
        testUser.setRole(Role.USER);
        testUser.setAccountStatus(AccountStatus.ACTIVE);
        testUser.setEmailVerified(true);

        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(userRepository.findByEmailIgnoreCase(testUser.getEmail())).willReturn(Optional.of(testUser));

        jwtToken = "Bearer " + jwtService.generateToken(testUser.getId(), testUser.getEmail());
    }

    @Test
    @DisplayName("POST /api/v1/resumes/{resumeId}/analyze - Analyze resume successfully (200 OK)")
    void analyzeResumeSuccess() throws Exception {
        UUID resumeId = UUID.randomUUID();
        UUID analysisId = UUID.randomUUID();

        ResumeAnalysisDto mockDto = new ResumeAnalysisDto(
                analysisId,
                resumeId,
                UUID.randomUUID(),
                "GROQ",
                "llama-3.3-70b-versatile",
                91,
                "EXCELLENT",
                "Outstanding engineering profile",
                objectMapper.readTree("{\"strengths\": [\"Modern stack\"]}"),
                Instant.now()
        );

        given(resumeAnalysisService.analyzeResume(userId, resumeId)).willReturn(mockDto);

        mockMvc.perform(post("/api/v1/resumes/" + resumeId + "/analyze")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("successfully")))
                .andExpect(jsonPath("$.data.id", is(analysisId.toString())))
                .andExpect(jsonPath("$.data.resumeId", is(resumeId.toString())))
                .andExpect(jsonPath("$.data.overallScore", is(91)))
                .andExpect(jsonPath("$.data.overallRating", is("EXCELLENT")))
                .andExpect(jsonPath("$.data.provider", is("GROQ")));
    }

    @Test
    @DisplayName("POST /api/v1/resumes/{resumeId}/analyze - Returns 401 when unauthenticated")
    void analyzeResumeUnauthenticated() throws Exception {
        UUID resumeId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/resumes/" + resumeId + "/analyze")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/resumes/{resumeId}/analyze - Returns 403 when user consent is missing")
    void analyzeResumeMissingConsent() throws Exception {
        UUID resumeId = UUID.randomUUID();

        given(resumeAnalysisService.analyzeResume(userId, resumeId))
                .willThrow(new AccessDeniedException("External AI processing consent is required. Please grant consent in AI Provider Settings before analyzing resumes."));

        mockMvc.perform(post("/api/v1/resumes/" + resumeId + "/analyze")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("consent is required")));
    }

    @Test
    @DisplayName("GET /api/v1/resumes/{resumeId}/analyses - List analysis history (200 OK)")
    void getAnalysisHistorySuccess() throws Exception {
        UUID resumeId = UUID.randomUUID();
        ResumeAnalysisSummaryDto summary1 = new ResumeAnalysisSummaryDto(
                UUID.randomUUID(), resumeId, UUID.randomUUID(),
                "GROQ", "llama-3.3-70b-versatile",
                92, "EXCELLENT", "Great review", Instant.now()
        );

        given(resumeAnalysisService.getAnalysisHistory(userId, resumeId)).willReturn(List.of(summary1));

        mockMvc.perform(get("/api/v1/resumes/" + resumeId + "/analyses")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].overallScore", is(92)))
                .andExpect(jsonPath("$.data[0].provider", is("GROQ")));
    }

    @Test
    @DisplayName("GET /api/v1/resumes/analyses/{analysisId} - Retrieve analysis details (200 OK)")
    void getAnalysisDetailsSuccess() throws Exception {
        UUID analysisId = UUID.randomUUID();
        UUID resumeId = UUID.randomUUID();

        ResumeAnalysisDto mockDto = new ResumeAnalysisDto(
                analysisId,
                resumeId,
                UUID.randomUUID(),
                "GROQ",
                "llama-3.3-70b-versatile",
                85,
                "EXCELLENT",
                "Summary details",
                objectMapper.readTree("{\"reportDetails\": true}"),
                Instant.now()
        );

        given(resumeAnalysisService.getAnalysisDetails(userId, analysisId)).willReturn(mockDto);

        mockMvc.perform(get("/api/v1/resumes/analyses/" + analysisId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(analysisId.toString())))
                .andExpect(jsonPath("$.data.overallScore", is(85)));
    }

    @Test
    @DisplayName("GET /api/v1/resumes/analyses/{analysisId} - Returns 404 when report not found")
    void getAnalysisDetailsNotFound() throws Exception {
        UUID analysisId = UUID.randomUUID();

        given(resumeAnalysisService.getAnalysisDetails(userId, analysisId))
                .willThrow(new ResourceNotFoundException("Resume analysis report not found with id: " + analysisId));

        mockMvc.perform(get("/api/v1/resumes/analyses/" + analysisId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("not found")));
    }
}
