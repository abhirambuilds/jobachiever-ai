package ai.jobachiever.career;

import ai.jobachiever.auth.service.JwtService;
import ai.jobachiever.career.dto.*;
import ai.jobachiever.career.service.CareerIntelligenceService;
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

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Career Intelligence Controller Integration Tests")
class CareerIntelligenceControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private CareerIntelligenceService careerIntelligenceService;

    @MockBean
    private UserRepository userRepository;

    private UUID userId;
    private User testUser;
    private String jwtToken;
    private UUID trackId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        trackId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("careerseeker@jobachiever.ai");
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
    @DisplayName("POST /api/v1/career/skill-gaps - Analyze Skill Gaps successfully (200 OK)")
    void analyzeSkillGapsSuccess() throws Exception {
        SkillGapItemDto item = new SkillGapItemDto(
                "Kubernetes", "TECHNICAL", "MISSING_EVIDENCE", "MISSING",
                85, "HIGH", "Required for cloud platforms",
                List.of("Senior Backend Engineer"), List.of("Docker"), List.of()
        );

        SkillGapAnalysisDto responseDto = new SkillGapAnalysisDto(
                UUID.randomUUID(), trackId, "Senior Backend Engineer", "GROQ", "llama-3.3-70b-versatile",
                "Solid foundation, gaps in container orchestration.",
                List.of(), List.of(), List.of(item), List.of(item), List.of(item),
                Instant.now()
        );

        given(careerIntelligenceService.analyzeSkillGaps(eq(userId), any(AnalyzeSkillGapRequestDto.class)))
                .willReturn(responseDto);

        AnalyzeSkillGapRequestDto req = new AnalyzeSkillGapRequestDto(trackId, "Senior Backend Engineer", null, "GROQ", null);

        mockMvc.perform(post("/api/v1/career/skill-gaps")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.targetRole").value("Senior Backend Engineer"))
                .andExpect(jsonPath("$.data.missingEvidenceSkills[0].canonicalName").value("Kubernetes"))
                .andExpect(jsonPath("$.message").value("Skill gap analysis completed successfully"));
    }

    @Test
    @DisplayName("GET /api/v1/career/skill-gaps - Retrieve Latest Skill Gaps (200 OK)")
    void getLatestSkillGapsSuccess() throws Exception {
        SkillGapAnalysisDto responseDto = new SkillGapAnalysisDto(
                UUID.randomUUID(), trackId, "Senior Backend Engineer", "GROQ", "llama-3.3-70b-versatile",
                "Summary report", List.of(), List.of(), List.of(), List.of(), List.of(), Instant.now()
        );

        given(careerIntelligenceService.getLatestSkillGaps(userId, trackId)).willReturn(responseDto);

        mockMvc.perform(get("/api/v1/career/skill-gaps")
                        .header("Authorization", jwtToken)
                        .param("trackId", trackId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.summary").value("Summary report"));
    }

    @Test
    @DisplayName("POST /api/v1/career/roadmaps - Generate Learning Roadmap (200 OK)")
    void generateRoadmapSuccess() throws Exception {
        MilestoneDto milestone = new MilestoneDto(
                UUID.randomUUID(), UUID.randomUUID(), 1, "Master Kubernetes Deployments",
                "Setup clusters and manifests", "HIGH", "NOT_STARTED",
                List.of("Kubernetes"), List.of(), List.of("Deploy on minikube"),
                null, null, null, null, List.of(), Instant.now(), Instant.now()
        );

        RoadmapPhaseDto phase = new RoadmapPhaseDto(1, "Phase 1: Foundations", "Core prerequisites", List.of(milestone));

        CareerRoadmapDto roadmapDto = new CareerRoadmapDto(
                UUID.randomUUID(), trackId, "Senior Backend Engineer", "Roadmap Title",
                "Phased plan", "IN_PROGRESS", "GROQ", "llama-3.3-70b-versatile",
                null, List.of(phase), 1, 0, 0, 0, 0, Instant.now(), Instant.now()
        );

        given(careerIntelligenceService.generateRoadmap(eq(userId), any(GenerateRoadmapRequestDto.class)))
                .willReturn(roadmapDto);

        GenerateRoadmapRequestDto req = new GenerateRoadmapRequestDto(trackId, "Senior Backend Engineer", null, "GROQ", null);

        mockMvc.perform(post("/api/v1/career/roadmaps")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.phases[0].milestones[0].title").value("Master Kubernetes Deployments"));
    }

    @Test
    @DisplayName("PATCH /api/v1/career/milestones/{milestoneId} - Update Milestone (200 OK)")
    void updateMilestoneSuccess() throws Exception {
        UUID milestoneId = UUID.randomUUID();

        MilestoneDto milestone = new MilestoneDto(
                milestoneId, UUID.randomUUID(), 1, "Master Kubernetes Deployments",
                "Setup clusters and manifests", "HIGH", "COMPLETED",
                List.of("Kubernetes"), List.of(), List.of("Deploy on minikube"),
                null, null, Instant.now(), "Completed deployment exercises", List.of(), Instant.now(), Instant.now()
        );

        given(careerIntelligenceService.updateMilestone(eq(userId), eq(milestoneId), any(UpdateMilestoneRequestDto.class)))
                .willReturn(milestone);

        UpdateMilestoneRequestDto req = new UpdateMilestoneRequestDto("COMPLETED", "Completed deployment exercises", null);

        mockMvc.perform(patch("/api/v1/career/milestones/" + milestoneId)
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.personalNotes").value("Completed deployment exercises"));
    }

    @Test
    @DisplayName("GET /api/v1/career/dashboard-summary - Retrieve Dashboard Career Summary (200 OK)")
    void getDashboardSummarySuccess() throws Exception {
        CareerDashboardSummaryDto summary = new CareerDashboardSummaryDto(
                2, trackId, "Backend Track", "Senior Backend Engineer",
                1, List.of(), 5, 2, 1, 40, List.of(), true
        );

        given(careerIntelligenceService.getDashboardSummary(userId)).willReturn(summary);

        mockMvc.perform(get("/api/v1/career/dashboard-summary")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.activeCareerTracksCount").value(2))
                .andExpect(jsonPath("$.data.roadmapProgressPercentage").value(40))
                .andExpect(jsonPath("$.data.hasActiveRoadmap").value(true));
    }
}
