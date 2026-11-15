package ai.jobachiever.resumes.service;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.ai.service.UserAiPreferenceService;
import ai.jobachiever.resumes.dto.ResumeAnalysisDto;
import ai.jobachiever.resumes.dto.ResumeAnalysisSummaryDto;
import ai.jobachiever.resumes.entity.DocumentType;
import ai.jobachiever.resumes.entity.ResumeAnalysis;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;
import ai.jobachiever.resumes.repository.ResumeAnalysisRepository;
import ai.jobachiever.resumes.repository.ResumeDocumentRepository;
import ai.jobachiever.resumes.repository.ResumeVersionRepository;
import ai.jobachiever.resumes.storage.FileStorageService;
import ai.jobachiever.users.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.security.access.AccessDeniedException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Resume Analysis Service Unit Tests")
class ResumeAnalysisServiceTest {

    @Mock
    private ResumeDocumentRepository resumeDocumentRepository;

    @Mock
    private ResumeVersionRepository resumeVersionRepository;

    @Mock
    private ResumeAnalysisRepository resumeAnalysisRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private UserAiPreferenceService userAiPreferenceService;

    @Mock
    private AIServiceClient aiServiceClient;

    private ObjectMapper objectMapper;

    private ResumeAnalysisServiceImpl service;

    private UUID userId;
    private UUID resumeId;
    private UUID versionId;
    private User user;
    private ResumeDocument resume;
    private ResumeVersion version;

    private final String sampleAnalysisJson = """
            {
              "overallAssessment": {
                "score": 88,
                "rating": "EXCELLENT",
                "summary": "Strong engineering profile with verified accomplishments."
              },
              "sectionAnalysis": [
                {
                  "section": "EXPERIENCE",
                  "status": "PRESENT",
                  "strengths": ["Clear metrics"],
                  "issues": [],
                  "recommendations": []
                }
              ],
              "strengths": ["Modern tech stack"],
              "weaknesses": ["Minor summary vagueness"],
              "skillsAnalysis": {
                "identifiedSkills": ["Java", "Spring Boot", "React"],
                "underrepresentedSkills": [],
                "notes": []
              },
              "impactAnalysis": {
                "strongExamples": [],
                "improvementOpportunities": []
              },
              "atsAnalysis": {
                "readability": "GOOD",
                "observations": ["Single-column clean"],
                "warnings": []
              },
              "recommendations": [],
              "extractionWarnings": []
            }
            """;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        service = new ResumeAnalysisServiceImpl(
                resumeDocumentRepository,
                resumeVersionRepository,
                resumeAnalysisRepository,
                fileStorageService,
                userAiPreferenceService,
                aiServiceClient,
                objectMapper
        );

        userId = UUID.randomUUID();
        resumeId = UUID.randomUUID();
        versionId = UUID.randomUUID();

        user = new User();
        user.setId(userId);
        user.setEmail("alex@example.com");

        resume = new ResumeDocument(user, "Senior Full-Stack Resume", DocumentType.UPLOADED);
        resume.setId(resumeId);

        version = new ResumeVersion();
        version.setId(versionId);
        version.setDocument(resume);
        version.setVersionNumber(1);
        version.setStoragePath("resumes/" + userId + "/sample.pdf");
        version.setFileName("sample.pdf");
        version.setMimeType("application/pdf");

        resume.setCurrentVersion(version);
    }

    @Test
    @DisplayName("analyzeResume fails with AccessDeniedException when user consent is not granted")
    void analyzeResumeFailsWithoutConsent() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(false);

        assertThatThrownBy(() -> service.analyzeResume(userId, resumeId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("External AI processing consent is required");

        verifyNoInteractions(aiServiceClient);
        verifyNoInteractions(resumeAnalysisRepository);
    }

    @Test
    @DisplayName("analyzeResume fails with ResourceNotFoundException when resume does not belong to user")
    void analyzeResumeFailsWhenResumeNotFound() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);
        when(resumeDocumentRepository.findByIdAndUserId(resumeId, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.analyzeResume(userId, resumeId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Resume document not found");

        verifyNoInteractions(aiServiceClient);
    }

    @Test
    @DisplayName("analyzeResume executes successfully, resolves file bytes, invokes AI service, and persists report")
    void analyzeResumeSuccess() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);
        when(resumeDocumentRepository.findByIdAndUserId(resumeId, userId)).thenReturn(Optional.of(resume));

        byte[] fakePdfBytes = "%PDF-1.4 Fake PDF Content for Unit Test".getBytes(StandardCharsets.UTF_8);
        when(fileStorageService.retrieve("resumes/" + userId + "/sample.pdf"))
                .thenReturn(new ByteArrayResource(fakePdfBytes));

        UserAiPreferenceDto preferences = new UserAiPreferenceDto(
                "GROQ",
                "llama-3.3-70b-versatile",
                0.2,
                2048,
                true,
                Instant.now(),
                Instant.now()
        );
        when(userAiPreferenceService.getPreferences(userId)).thenReturn(preferences);

        when(aiServiceClient.analyzeResume(
                eq(fakePdfBytes),
                eq("sample.pdf"),
                eq("application/pdf"),
                eq(resumeId),
                eq("GROQ"),
                eq("llama-3.3-70b-versatile"),
                eq(0.2),
                eq(2048),
                eq(true)
        )).thenReturn(sampleAnalysisJson);

        when(resumeAnalysisRepository.save(any(ResumeAnalysis.class))).thenAnswer(invocation -> {
            ResumeAnalysis entity = invocation.getArgument(0);
            entity.setId(UUID.randomUUID());
            entity.setCreatedAt(Instant.now());
            return entity;
        });

        ResumeAnalysisDto result = service.analyzeResume(userId, resumeId);

        assertThat(result).isNotNull();
        assertThat(result.resumeId()).isEqualTo(resumeId);
        assertThat(result.overallScore()).isEqualTo(88);
        assertThat(result.overallRating()).isEqualTo("EXCELLENT");
        assertThat(result.provider()).isEqualTo("GROQ");
        assertThat(result.report()).isNotNull();
        assertThat(result.report().get("overallAssessment").get("score").asInt()).isEqualTo(88);

        verify(resumeAnalysisRepository).save(any(ResumeAnalysis.class));
    }

    @Test
    @DisplayName("getAnalysisHistory returns chronological list of summaries")
    void getAnalysisHistorySuccess() {
        when(resumeDocumentRepository.existsByIdAndUserId(resumeId, userId)).thenReturn(true);

        ResumeAnalysis item1 = new ResumeAnalysis(
                userId, resumeId, versionId, "GROQ", "llama-3.3-70b-versatile",
                92, "EXCELLENT", "Great resume", "{}"
        );
        item1.setId(UUID.randomUUID());
        item1.setCreatedAt(Instant.now());

        ResumeAnalysis item2 = new ResumeAnalysis(
                userId, resumeId, versionId, "GEMINI", "gemini-2.0-flash",
                85, "EXCELLENT", "Previous review", "{}"
        );
        item2.setId(UUID.randomUUID());
        item2.setCreatedAt(Instant.now().minusSeconds(3600));

        when(resumeAnalysisRepository.findByResumeIdAndUserIdOrderByCreatedAtDesc(resumeId, userId))
                .thenReturn(List.of(item1, item2));

        List<ResumeAnalysisSummaryDto> history = service.getAnalysisHistory(userId, resumeId);

        assertThat(history).hasSize(2);
        assertThat(history.get(0).overallScore()).isEqualTo(92);
        assertThat(history.get(1).overallScore()).isEqualTo(85);
    }

    @Test
    @DisplayName("getAnalysisDetails returns full analysis with deserialized JSON report")
    void getAnalysisDetailsSuccess() {
        UUID analysisId = UUID.randomUUID();
        ResumeAnalysis entity = new ResumeAnalysis(
                userId, resumeId, versionId, "GROQ", "llama-3.3-70b-versatile",
                88, "EXCELLENT", "Verified summary", sampleAnalysisJson
        );
        entity.setId(analysisId);
        entity.setCreatedAt(Instant.now());

        when(resumeAnalysisRepository.findByIdAndUserId(analysisId, userId)).thenReturn(Optional.of(entity));

        ResumeAnalysisDto details = service.getAnalysisDetails(userId, analysisId);

        assertThat(details).isNotNull();
        assertThat(details.id()).isEqualTo(analysisId);
        assertThat(details.overallScore()).isEqualTo(88);
        assertThat(details.report().get("strengths").get(0).asText()).isEqualTo("Modern tech stack");
    }

    @Test
    @DisplayName("getAnalysisDetails throws ResourceNotFoundException when analysis does not exist or belong to user")
    void getAnalysisDetailsNotFound() {
        UUID analysisId = UUID.randomUUID();
        when(resumeAnalysisRepository.findByIdAndUserId(analysisId, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getAnalysisDetails(userId, analysisId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Resume analysis report not found");
    }
}
