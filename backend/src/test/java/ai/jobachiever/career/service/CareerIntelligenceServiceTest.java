package ai.jobachiever.career.service;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.ai.service.UserAiPreferenceService;
import ai.jobachiever.career.dto.*;
import ai.jobachiever.career.entity.CareerMilestone;
import ai.jobachiever.career.entity.CareerRecommendation;
import ai.jobachiever.career.entity.CareerRoadmap;
import ai.jobachiever.career.entity.CareerSkillGap;
import ai.jobachiever.career.repository.CareerMilestoneRepository;
import ai.jobachiever.career.repository.CareerRecommendationRepository;
import ai.jobachiever.career.repository.CareerRoadmapRepository;
import ai.jobachiever.career.repository.CareerSkillGapRepository;
import ai.jobachiever.careertracks.entity.CareerTrack;
import ai.jobachiever.careertracks.repository.CareerTrackRepository;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.profiles.dto.CareerProfileResponse;
import ai.jobachiever.profiles.dto.SkillDto;
import ai.jobachiever.profiles.service.CareerProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Career Intelligence Service Unit Tests")
class CareerIntelligenceServiceTest {

    @Mock
    private CareerSkillGapRepository skillGapRepository;

    @Mock
    private CareerRecommendationRepository recommendationRepository;

    @Mock
    private CareerRoadmapRepository roadmapRepository;

    @Mock
    private CareerMilestoneRepository milestoneRepository;

    @Mock
    private CareerTrackRepository careerTrackRepository;

    @Mock
    private CareerProfileService careerProfileService;

    @Mock
    private UserAiPreferenceService userAiPreferenceService;

    @Mock
    private AIServiceClient aiServiceClient;

    private ObjectMapper objectMapper;
    private CareerIntelligenceServiceImpl service;

    private final UUID userId = UUID.randomUUID();
    private final UUID trackId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        service = new CareerIntelligenceServiceImpl(
                skillGapRepository,
                recommendationRepository,
                roadmapRepository,
                milestoneRepository,
                careerTrackRepository,
                careerProfileService,
                userAiPreferenceService,
                aiServiceClient,
                objectMapper
        );
    }

    @Test
    @DisplayName("analyzeSkillGaps fails when user has not granted AI consent")
    void analyzeSkillGapsFailsWhenNoConsent() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(false);

        AnalyzeSkillGapRequestDto request = new AnalyzeSkillGapRequestDto();
        request.setCareerTrackId(trackId);

        assertThatThrownBy(() -> service.analyzeSkillGaps(userId, request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("consent is required");

        verifyNoInteractions(careerProfileService, aiServiceClient);
    }

    @Test
    @DisplayName("analyzeSkillGaps fails when career track does not belong to user")
    void analyzeSkillGapsFailsWhenTrackNotFound() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);
        when(careerTrackRepository.findByIdAndUserId(trackId, userId)).thenReturn(Optional.empty());

        AnalyzeSkillGapRequestDto request = new AnalyzeSkillGapRequestDto();
        request.setCareerTrackId(trackId);

        assertThatThrownBy(() -> service.analyzeSkillGaps(userId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Career track not found");
    }

    @Test
    @DisplayName("analyzeSkillGaps succeeds, calls AI microservice, and persists results")
    void analyzeSkillGapsSucceeds() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);

        CareerTrack track = new CareerTrack();
        track.setId(trackId);
        track.setName("Backend Engineering");
        track.setTargetRole("Senior Backend Developer");
        when(careerTrackRepository.findByIdAndUserId(trackId, userId)).thenReturn(Optional.of(track));

        CareerProfileResponse profile = new CareerProfileResponse();
        SkillDto skillDto = new SkillDto();
        skillDto.setName("Java");
        profile.setSkills(List.of(skillDto));
        when(careerProfileService.getProfile(userId)).thenReturn(profile);

        UserAiPreferenceDto preferences = new UserAiPreferenceDto();
        preferences.setSelectedProvider("GROQ");
        preferences.setPreferredModel("llama-3.3-70b-versatile");
        when(userAiPreferenceService.getPreferences(userId)).thenReturn(preferences);

        String fakeFastApiResponse = """
                {
                    "target_role": "Senior Backend Developer",
                    "provider": "GROQ",
                    "model": "llama-3.3-70b-versatile",
                    "summary": "Solid Java foundations. Key gaps in Kubernetes and Kafka.",
                    "demonstrated_skills": [
                        {
                            "canonical_name": "Java",
                            "category": "TECHNICAL",
                            "classification": "STRONG",
                            "evidence_status": "CONFIRMED",
                            "priority_score": 90,
                            "priority_level": "HIGH",
                            "importance_rationale": "Core backend language",
                            "required_for_roles": ["Senior Backend Developer"],
                            "prerequisites": [],
                            "candidate_evidence": ["Confirmed profile skill: Java"]
                        }
                    ],
                    "developing_skills": [],
                    "missing_evidence_skills": [
                        {
                            "canonical_name": "Kubernetes",
                            "category": "TECHNICAL",
                            "classification": "MISSING_EVIDENCE",
                            "evidence_status": "MISSING",
                            "priority_score": 85,
                            "priority_level": "HIGH",
                            "importance_rationale": "Container orchestration",
                            "required_for_roles": ["Senior Backend Developer"],
                            "prerequisites": ["Docker"],
                            "candidate_evidence": []
                        }
                    ],
                    "critical_priorities": [],
                    "all_evaluated_skills": []
                }
                """;

        when(aiServiceClient.analyzeCareerSkillGaps(any())).thenReturn(fakeFastApiResponse);
        when(skillGapRepository.save(any(CareerSkillGap.class))).thenAnswer(invocation -> {
            CareerSkillGap gap = invocation.getArgument(0);
            gap.setId(UUID.randomUUID());
            gap.setCreatedAt(Instant.now());
            return gap;
        });

        AnalyzeSkillGapRequestDto request = new AnalyzeSkillGapRequestDto();
        request.setCareerTrackId(trackId);

        SkillGapAnalysisDto result = service.analyzeSkillGaps(userId, request);

        assertThat(result).isNotNull();
        assertThat(result.getTargetRole()).isEqualTo("Senior Backend Developer");
        assertThat(result.getDemonstratedSkills()).hasSize(1);
        assertThat(result.getDemonstratedSkills().get(0).getCanonicalName()).isEqualTo("Java");
        assertThat(result.getMissingEvidenceSkills()).hasSize(1);
        assertThat(result.getMissingEvidenceSkills().get(0).getCanonicalName()).isEqualTo("Kubernetes");

        verify(skillGapRepository).save(any(CareerSkillGap.class));
    }

    @Test
    @DisplayName("generateRoadmap persists roadmap and milestones with phases")
    void generateRoadmapSucceeds() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);

        CareerTrack track = new CareerTrack();
        track.setId(trackId);
        track.setName("Backend Engineering");
        track.setTargetRole("Senior Backend Developer");
        when(careerTrackRepository.findByIdAndUserId(trackId, userId)).thenReturn(Optional.of(track));

        when(userAiPreferenceService.getPreferences(userId)).thenReturn(new UserAiPreferenceDto());
        when(careerProfileService.getProfile(userId)).thenReturn(new CareerProfileResponse());

        CareerSkillGap existingGap = new CareerSkillGap();
        existingGap.setId(UUID.randomUUID());
        existingGap.setCareerTrackId(trackId);
        existingGap.setTargetRole("Senior Backend Developer");
        existingGap.setAnalysisJson("""
                {
                    "demonstrated_skills": [],
                    "developing_skills": [],
                    "missing_evidence_skills": [],
                    "critical_priorities": [],
                    "all_evaluated_skills": [
                        {
                            "canonical_name": "Kubernetes",
                            "category": "TECHNICAL",
                            "classification": "MISSING_EVIDENCE",
                            "evidence_status": "MISSING",
                            "priority_score": 85,
                            "priority_level": "HIGH",
                            "importance_rationale": "Orchestration",
                            "required_for_roles": ["Senior Backend Developer"],
                            "prerequisites": [],
                            "candidate_evidence": []
                        }
                    ]
                }
                """);
        when(skillGapRepository.findFirstByUserIdAndCareerTrackIdOrderByCreatedAtDesc(userId, trackId))
                .thenReturn(Optional.of(existingGap));
        when(careerTrackRepository.existsByIdAndUserId(trackId, userId)).thenReturn(true);

        String fakeRoadmapJson = """
                {
                    "title": "Senior Backend Developer Strategic Learning Roadmap",
                    "description": "Phased plan",
                    "phases": [
                        {
                            "phase_number": 1,
                            "name": "Phase 1: Foundations",
                            "description": "Prerequisite setup",
                            "milestones": [
                                {
                                    "title": "Container Orchestration with Kubernetes",
                                    "description": "Master deployments",
                                    "priority": "HIGH",
                                    "related_skills": ["Kubernetes"],
                                    "tasks": [
                                        {
                                            "description": "Deploy minikube cluster",
                                            "task_type": "PRACTICE",
                                            "skills": ["Kubernetes"]
                                        }
                                    ],
                                    "completion_criteria": ["Cluster up and running"]
                                }
                            ]
                        }
                    ]
                }
                """;

        when(aiServiceClient.generateCareerRoadmap(any())).thenReturn(fakeRoadmapJson);
        when(roadmapRepository.save(any(CareerRoadmap.class))).thenAnswer(invocation -> {
            CareerRoadmap rm = invocation.getArgument(0);
            rm.setId(UUID.randomUUID());
            rm.setCreatedAt(Instant.now());
            rm.setUpdatedAt(Instant.now());
            return rm;
        });
        when(milestoneRepository.save(any(CareerMilestone.class))).thenAnswer(invocation -> {
            CareerMilestone m = invocation.getArgument(0);
            m.setId(UUID.randomUUID());
            m.setCreatedAt(Instant.now());
            m.setUpdatedAt(Instant.now());
            return m;
        });

        GenerateRoadmapRequestDto req = new GenerateRoadmapRequestDto();
        req.setCareerTrackId(trackId);

        CareerRoadmapDto roadmap = service.generateRoadmap(userId, req);

        assertThat(roadmap).isNotNull();
        assertThat(roadmap.getPhases()).hasSize(1);
        assertThat(roadmap.getPhases().get(0).getMilestones()).hasSize(1);
        assertThat(roadmap.getPhases().get(0).getMilestones().get(0).getTitle())
                .isEqualTo("Container Orchestration with Kubernetes");
        verify(roadmapRepository).save(any(CareerRoadmap.class));
        verify(milestoneRepository).save(any(CareerMilestone.class));
    }

    @Test
    @DisplayName("updateMilestone updates status and auto-marks completedAt")
    void updateMilestoneUpdatesStatusAndCompletes() {
        UUID milestoneId = UUID.randomUUID();
        UUID roadmapId = UUID.randomUUID();

        CareerMilestone m = new CareerMilestone();
        m.setId(milestoneId);
        m.setRoadmapId(roadmapId);
        m.setUserId(userId);
        m.setStatus("IN_PROGRESS");
        m.setTitle("Build CI/CD Pipeline");

        when(milestoneRepository.findByIdAndUserId(milestoneId, userId)).thenReturn(Optional.of(m));
        when(milestoneRepository.save(any(CareerMilestone.class))).thenAnswer(inv -> inv.getArgument(0));
        when(milestoneRepository.findAllByRoadmapIdAndUserIdOrderByPhaseNumberAscCreatedAtAsc(roadmapId, userId))
                .thenReturn(List.of(m));

        UpdateMilestoneRequestDto updateReq = new UpdateMilestoneRequestDto();
        updateReq.setStatus("COMPLETED");
        updateReq.setPersonalNotes("Passed all tests in github actions");

        MilestoneDto updated = service.updateMilestone(userId, milestoneId, updateReq);

        assertThat(updated.getStatus()).isEqualTo("COMPLETED");
        assertThat(updated.getCompletedAt()).isNotNull();
        assertThat(updated.getPersonalNotes()).isEqualTo("Passed all tests in github actions");
    }

    @Test
    @DisplayName("getDashboardSummary aggregates track, gap, and roadmap counts")
    void getDashboardSummaryCalculatesMetrics() {
        when(careerTrackRepository.countByUserIdAndActiveTrue(userId)).thenReturn(1L);

        CareerTrack track = new CareerTrack();
        track.setId(trackId);
        track.setName("Backend Engineering");
        track.setTargetRole("Senior Backend Developer");
        when(careerTrackRepository.findByUserIdAndPrimaryTrue(userId)).thenReturn(Optional.of(track));
        when(careerTrackRepository.existsByIdAndUserId(trackId, userId)).thenReturn(true);

        CareerSkillGap gap = new CareerSkillGap();
        gap.setId(UUID.randomUUID());
        gap.setCareerTrackId(trackId);
        gap.setTargetRole("Senior Backend Developer");
        gap.setAnalysisJson("""
                {
                    "demonstrated_skills": [],
                    "developing_skills": [],
                    "missing_evidence_skills": [],
                    "critical_priorities": [
                        {
                            "canonical_name": "Kafka",
                            "category": "TECHNICAL",
                            "classification": "MISSING_EVIDENCE",
                            "evidence_status": "MISSING",
                            "priority_score": 95,
                            "priority_level": "CRITICAL",
                            "importance_rationale": "High throughput messaging",
                            "required_for_roles": [],
                            "prerequisites": [],
                            "candidate_evidence": []
                        }
                    ],
                    "all_evaluated_skills": []
                }
                """);
        when(skillGapRepository.findFirstByUserIdAndCareerTrackIdOrderByCreatedAtDesc(userId, trackId))
                .thenReturn(Optional.of(gap));

        CareerRoadmap roadmap = new CareerRoadmap();
        roadmap.setId(UUID.randomUUID());
        roadmap.setCareerTrackId(trackId);
        roadmap.setTargetRole("Senior Backend Developer");
        roadmap.setTitle("Roadmap");
        when(roadmapRepository.findFirstByUserIdAndCareerTrackIdOrderByCreatedAtDesc(userId, trackId))
                .thenReturn(Optional.of(roadmap));

        CareerMilestone m1 = new CareerMilestone();
        m1.setId(UUID.randomUUID());
        m1.setRoadmapId(roadmap.getId());
        m1.setPhaseNumber(1);
        m1.setStatus("COMPLETED");
        m1.setTitle("M1");

        CareerMilestone m2 = new CareerMilestone();
        m2.setId(UUID.randomUUID());
        m2.setRoadmapId(roadmap.getId());
        m2.setPhaseNumber(1);
        m2.setStatus("IN_PROGRESS");
        m2.setTitle("M2");

        when(milestoneRepository.findAllByRoadmapIdAndUserIdOrderByPhaseNumberAscCreatedAtAsc(roadmap.getId(), userId))
                .thenReturn(List.of(m1, m2));

        CareerDashboardSummaryDto summary = service.getDashboardSummary(userId);

        assertThat(summary).isNotNull();
        assertThat(summary.getActiveCareerTracksCount()).isEqualTo(1);
        assertThat(summary.getCriticalGapsCount()).isEqualTo(1);
        assertThat(summary.getTopCriticalGaps()).hasSize(1);
        assertThat(summary.getTopCriticalGaps().get(0).getCanonicalName()).isEqualTo("Kafka");
        assertThat(summary.getTotalMilestones()).isEqualTo(2);
        assertThat(summary.getCompletedMilestones()).isEqualTo(1);
        assertThat(summary.getInProgressMilestones()).isEqualTo(1);
        assertThat(summary.getRoadmapProgressPercentage()).isEqualTo(50);
        assertThat(summary.isHasActiveRoadmap()).isTrue();
    }
}
