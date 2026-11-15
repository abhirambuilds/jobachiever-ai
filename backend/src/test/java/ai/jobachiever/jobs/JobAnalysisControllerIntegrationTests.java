package ai.jobachiever.jobs;

import ai.jobachiever.auth.service.JwtService;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.jobs.dto.AnalyzeJobDescriptionRequest;
import ai.jobachiever.jobs.dto.JobAnalysisDto;
import ai.jobachiever.jobs.dto.JobAnalysisSummaryDto;
import ai.jobachiever.jobs.service.JobAnalysisService;
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
@DisplayName("Job Analysis Controller Integration Tests")
class JobAnalysisControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private JobAnalysisService jobAnalysisService;

    @MockBean
    private UserRepository userRepository;

    private UUID userId;
    private User testUser;
    private String jwtToken;

    private static final String SAMPLE_JD =
            "We are seeking a Senior Distributed Systems Engineer to architect enterprise-scale microservices. "
            + "Requirements include 5+ years with Java 21, Spring Boot 3, Apache Kafka, and PostgreSQL. "
            + "Experience with Docker, Kubernetes, and AWS is required. BS in Computer Science or equivalent.";

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
    @DisplayName("POST /api/v1/jobs/analyze-description - Analyze JD successfully (200 OK)")
    void analyzeDescriptionSuccess() throws Exception {
        UUID analysisId = UUID.randomUUID();
        JobAnalysisDto dto = new JobAnalysisDto(
                analysisId,
                null,
                "GROQ",
                "llama-3.3-70b-versatile",
                "Senior Distributed Systems Engineer",
                "Acme Corp",
                "SENIOR",
                "FULL_TIME",
                "HYBRID",
                "San Francisco, CA",
                "5+ years",
                "Strong systems role",
                objectMapper.createObjectNode().put("success", true),
                Instant.now()
        );

        given(jobAnalysisService.analyzeDescription(eq(userId), any(AnalyzeJobDescriptionRequest.class)))
                .willReturn(dto);

        AnalyzeJobDescriptionRequest request = new AnalyzeJobDescriptionRequest(
                SAMPLE_JD, null, null, null, null, null, null
        );

        mockMvc.perform(post("/api/v1/jobs/analyze-description")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(analysisId.toString()))
                .andExpect(jsonPath("$.data.jobTitle").value("Senior Distributed Systems Engineer"))
                .andExpect(jsonPath("$.data.seniority").value("SENIOR"))
                .andExpect(jsonPath("$.data.provider").value("GROQ"));
    }

    @Test
    @DisplayName("POST /api/v1/jobs/analyze-description - Validation failure for short input (400 Bad Request)")
    void analyzeDescriptionTooShort() throws Exception {
        AnalyzeJobDescriptionRequest request = new AnalyzeJobDescriptionRequest(
                "Too short to analyze", null, null, null, null, null, null
        );

        mockMvc.perform(post("/api/v1/jobs/analyze-description")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/jobs/analyze-description - Missing authorization header (401 Unauthorized)")
    void analyzeDescriptionUnauthorized() throws Exception {
        AnalyzeJobDescriptionRequest request = new AnalyzeJobDescriptionRequest(
                SAMPLE_JD, null, null, null, null, null, null
        );

        mockMvc.perform(post("/api/v1/jobs/analyze-description")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/jobs/analyze-description - Consent missing returns 403 Forbidden")
    void analyzeDescriptionConsentForbidden() throws Exception {
        given(jobAnalysisService.analyzeDescription(eq(userId), any(AnalyzeJobDescriptionRequest.class)))
                .willThrow(new AccessDeniedException("External AI processing consent is required"));

        AnalyzeJobDescriptionRequest request = new AnalyzeJobDescriptionRequest(
                SAMPLE_JD, null, null, null, null, null, null
        );

        mockMvc.perform(post("/api/v1/jobs/analyze-description")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/v1/jobs/{jobId}/analyze - Analyze existing job record (200 OK)")
    void analyzeSavedJobSuccess() throws Exception {
        UUID jobId = UUID.randomUUID();
        UUID analysisId = UUID.randomUUID();

        JobAnalysisDto dto = new JobAnalysisDto(
                analysisId,
                jobId,
                "GEMINI",
                "gemini-2.0-flash",
                "Staff Software Engineer",
                "Stripe",
                "LEAD",
                "FULL_TIME",
                "REMOTE",
                "Seattle, WA",
                "7+ years",
                "Staff role overview",
                objectMapper.createObjectNode(),
                Instant.now()
        );

        given(jobAnalysisService.analyzeJob(userId, jobId)).willReturn(dto);

        mockMvc.perform(post("/api/v1/jobs/{jobId}/analyze", jobId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.jobId").value(jobId.toString()))
                .andExpect(jsonPath("$.data.jobTitle").value("Staff Software Engineer"));
    }

    @Test
    @DisplayName("POST /api/v1/jobs/{jobId}/analyze - Job not found (404 Not Found)")
    void analyzeSavedJobNotFound() throws Exception {
        UUID jobId = UUID.randomUUID();
        given(jobAnalysisService.analyzeJob(userId, jobId))
                .willThrow(new ResourceNotFoundException("Job not found with id: " + jobId));

        mockMvc.perform(post("/api/v1/jobs/{jobId}/analyze", jobId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/v1/jobs/analyses - Retrieve all analyses (200 OK)")
    void getAnalysesSuccess() throws Exception {
        JobAnalysisSummaryDto summary = new JobAnalysisSummaryDto(
                UUID.randomUUID(),
                null,
                "GROQ",
                "llama-3.3-70b-versatile",
                "Backend Engineer",
                "Netflix",
                "MID_LEVEL",
                "FULL_TIME",
                "REMOTE",
                "Los Gatos, CA",
                "3-5 years",
                "Streaming microservices",
                Instant.now()
        );

        given(jobAnalysisService.getAnalyses(userId)).willReturn(List.of(summary));

        mockMvc.perform(get("/api/v1/jobs/analyses")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].jobTitle").value("Backend Engineer"));
    }

    @Test
    @DisplayName("GET /api/v1/jobs/analyses/{analysisId} - Retrieve analysis details (200 OK)")
    void getAnalysisDetailsSuccess() throws Exception {
        UUID analysisId = UUID.randomUUID();
        JobAnalysisDto dto = new JobAnalysisDto(
                analysisId,
                null,
                "GROQ",
                "llama-3.3-70b-versatile",
                "Cloud Architect",
                "Google",
                "LEAD",
                "FULL_TIME",
                "HYBRID",
                "Sunnyvale, CA",
                "8+ years",
                "Enterprise cloud transformation",
                objectMapper.createObjectNode().put("evaluated", true),
                Instant.now()
        );

        given(jobAnalysisService.getAnalysisDetails(userId, analysisId)).willReturn(dto);

        mockMvc.perform(get("/api/v1/jobs/analyses/{analysisId}", analysisId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(analysisId.toString()))
                .andExpect(jsonPath("$.data.companyName").value("Google"));
    }

    @Test
    @DisplayName("DELETE /api/v1/jobs/analyses/{analysisId} - Delete analysis (200 OK)")
    void deleteAnalysisSuccess() throws Exception {
        UUID analysisId = UUID.randomUUID();
        doNothing().when(jobAnalysisService).deleteAnalysis(userId, analysisId);

        mockMvc.perform(delete("/api/v1/jobs/analyses/{analysisId}", analysisId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
