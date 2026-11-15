package ai.jobachiever.resumes.studio.service;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.ai.service.UserAiPreferenceService;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.jobs.entity.Job;
import ai.jobachiever.jobs.repository.JobRepository;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.repository.ResumeDocumentRepository;
import ai.jobachiever.resumes.studio.dto.ResumeStudioRequest;
import ai.jobachiever.resumes.studio.dto.ResumeStudioResponseDto;
import ai.jobachiever.resumes.studio.dto.SuggestionItemDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Resume Studio Service Unit Tests")
class ResumeStudioServiceTest {

    @Mock
    private AIServiceClient aiServiceClient;

    @Mock
    private UserAiPreferenceService userAiPreferenceService;

    @Mock
    private ResumeDocumentRepository resumeDocumentRepository;

    @Mock
    private JobRepository jobRepository;

    private ObjectMapper objectMapper;
    private ResumeStudioServiceImpl resumeStudioService;

    private UUID userId;
    private UserAiPreferenceDto defaultPreferences;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        resumeStudioService = new ResumeStudioServiceImpl(
                aiServiceClient,
                userAiPreferenceService,
                resumeDocumentRepository,
                jobRepository,
                objectMapper
        );

        userId = UUID.randomUUID();
        defaultPreferences = new UserAiPreferenceDto(
                "GROQ",
                "llama-3.3-70b-versatile",
                0.3,
                1024,
                true,
                Instant.now(),
                Instant.now()
        );
    }

    @Test
    @DisplayName("Should successfully enhance bullet point with user preferences")
    void shouldSuccessfullyEnhanceBulletPoint() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);
        when(userAiPreferenceService.getPreferences(userId)).thenReturn(defaultPreferences);

        String mockAiResponse = """
            {
              "suggestions": [
                {
                  "id": "sug-1",
                  "original_text": "Worked on backend microservices with Java.",
                  "suggested_text": "Architected distributed backend microservices utilizing Java and Spring Boot.",
                  "reason": "Replaced generic verb with technical ownership descriptor.",
                  "changes": ["Replaced 'Worked on' with 'Architected'"],
                  "preserved_facts": ["backend microservices", "Java"],
                  "unsupported_claims": [],
                  "warnings": [],
                  "confidence": "HIGH",
                  "writing_mode": "PROFESSIONAL"
                }
              ],
              "action": "IMPROVE_BULLET",
              "writing_mode": "PROFESSIONAL",
              "provider": "GROQ",
              "model": "llama-3.3-70b-versatile",
              "disclaimer": "JobAchiever AI enforces strict zero-fabrication."
            }
            """;

        when(aiServiceClient.generateResumeStudioContent(
                eq("IMPROVE_BULLET"),
                eq("Worked on backend microservices with Java."),
                anyMap(),
                eq("PROFESSIONAL"),
                eq("GROQ"),
                eq("llama-3.3-70b-versatile"),
                eq(0.3),
                eq(1024),
                isNull(),
                eq(true)
        )).thenReturn(mockAiResponse);

        ResumeStudioRequest request = ResumeStudioRequest.builder()
                .action("IMPROVE_BULLET")
                .sourceText("Worked on backend microservices with Java.")
                .writingMode("PROFESSIONAL")
                .build();

        ResumeStudioResponseDto response = resumeStudioService.enhanceContent(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.getAction()).isEqualTo("IMPROVE_BULLET");
        assertThat(response.getProvider()).isEqualTo("GROQ");
        assertThat(response.getSuggestions()).hasSize(1);
        SuggestionItemDto suggestion = response.getSuggestions().get(0);
        assertThat(suggestion.getSuggestedText()).contains("Architected distributed backend microservices");
        assertThat(suggestion.getConfidence()).isEqualTo("HIGH");
        assertThat(suggestion.getUnsupportedClaims()).isEmpty();
    }

    @Test
    @DisplayName("Should reject enhancement when user has not granted AI consent")
    void shouldRejectEnhancementWhenConsentMissing() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(false);

        ResumeStudioRequest request = ResumeStudioRequest.builder()
                .action("IMPROVE_BULLET")
                .sourceText("Managed cloud infrastructure.")
                .build();

        assertThatThrownBy(() -> resumeStudioService.enhanceContent(userId, request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("External AI processing consent is required");

        verifyNoInteractions(aiServiceClient);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when provided resumeId does not exist for user")
    void shouldThrowExceptionWhenResumeNotFound() {
        UUID resumeId = UUID.randomUUID();
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);
        when(resumeDocumentRepository.findByIdAndUserId(resumeId, userId)).thenReturn(Optional.empty());

        ResumeStudioRequest request = ResumeStudioRequest.builder()
                .action("IMPROVE_BULLET")
                .sourceText("Developed microservices.")
                .resumeId(resumeId)
                .build();

        assertThatThrownBy(() -> resumeStudioService.enhanceContent(userId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Resume document not found");

        verifyNoInteractions(aiServiceClient);
    }

    @Test
    @DisplayName("Should enrich target job context when jobId is provided")
    void shouldEnrichTargetJobContextWhenJobIdProvided() {
        UUID jobId = UUID.randomUUID();
        Job mockJob = new Job();
        mockJob.setTitle("Principal Architect");
        mockJob.setCompanyName("CloudScale Inc");
        mockJob.setDescription("Looking for expertise in Spring Boot, pgvector, and distributed cloud systems.");

        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);
        when(userAiPreferenceService.getPreferences(userId)).thenReturn(defaultPreferences);
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(mockJob));

        String mockAiResponse = """
            {
              "suggestions": [
                {
                  "id": "sug-tailored",
                  "original_text": "Built search feature.",
                  "suggested_text": "Engineered distributed vector search feature using pgvector.",
                  "reason": "Tailored for Principal Architect role.",
                  "changes": ["Aligned with pgvector search requirements"],
                  "preserved_facts": ["search feature"],
                  "unsupported_claims": [],
                  "warnings": [],
                  "confidence": "HIGH",
                  "writing_mode": "ATS_FRIENDLY"
                }
              ],
              "action": "TAILOR_TO_JOB",
              "writing_mode": "ATS_FRIENDLY",
              "provider": "GROQ",
              "model": "llama-3.3-70b-versatile"
            }
            """;

        when(aiServiceClient.generateResumeStudioContent(
                eq("TAILOR_TO_JOB"),
                eq("Built search feature."),
                argThat(map -> "Principal Architect".equals(map.get("job_title")) &&
                               "CloudScale Inc".equals(map.get("company"))),
                eq("ATS_FRIENDLY"),
                anyString(),
                anyString(),
                anyDouble(),
                anyInt(),
                isNull(),
                eq(true)
        )).thenReturn(mockAiResponse);

        ResumeStudioRequest request = ResumeStudioRequest.builder()
                .action("TAILOR_TO_JOB")
                .sourceText("Built search feature.")
                .jobId(jobId)
                .writingMode("ATS_FRIENDLY")
                .build();

        ResumeStudioResponseDto response = resumeStudioService.enhanceContent(userId, request);
        assertThat(response).isNotNull();
        assertThat(response.getAction()).isEqualTo("TAILOR_TO_JOB");
    }

    @Test
    @DisplayName("Should respect request-level provider override when Gemini is explicitly selected")
    void shouldRespectProviderOverride() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);
        when(userAiPreferenceService.getPreferences(userId)).thenReturn(defaultPreferences);

        String mockAiResponse = """
            {
              "suggestions": [
                {
                  "id": "sug-gemini",
                  "original_text": "Managed development team.",
                  "suggested_text": "Spearheaded development team operations.",
                  "reason": "Enhanced active leadership tone.",
                  "changes": ["Action verb enhancement"],
                  "preserved_facts": ["development team"],
                  "unsupported_claims": [],
                  "warnings": [],
                  "confidence": "HIGH",
                  "writing_mode": "ACTION_ORIENTED"
                }
              ],
              "action": "IMPROVE_EXPERIENCE",
              "writing_mode": "ACTION_ORIENTED",
              "provider": "GEMINI",
              "model": "gemini-2.5-flash"
            }
            """;

        when(aiServiceClient.generateResumeStudioContent(
                eq("IMPROVE_EXPERIENCE"),
                eq("Managed development team."),
                anyMap(),
                eq("ACTION_ORIENTED"),
                eq("GEMINI"),
                eq("gemini-2.5-flash"),
                eq(0.2),
                eq(500),
                eq(2),
                eq(true)
        )).thenReturn(mockAiResponse);

        ResumeStudioRequest request = ResumeStudioRequest.builder()
                .action("IMPROVE_EXPERIENCE")
                .sourceText("Managed development team.")
                .writingMode("ACTION_ORIENTED")
                .provider("GEMINI")
                .model("gemini-2.5-flash")
                .temperature(0.2)
                .maxTokens(500)
                .numAlternatives(2)
                .build();

        ResumeStudioResponseDto response = resumeStudioService.enhanceContent(userId, request);
        assertThat(response).isNotNull();
        assertThat(response.getProvider()).isEqualTo("GEMINI");
        assertThat(response.getModel()).isEqualTo("gemini-2.5-flash");
    }
}
