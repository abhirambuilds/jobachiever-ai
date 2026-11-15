package ai.jobachiever.jobs.service;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.ai.service.UserAiPreferenceService;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.jobs.dto.AnalyzeJobDescriptionRequest;
import ai.jobachiever.jobs.dto.JobAnalysisDto;
import ai.jobachiever.jobs.dto.JobAnalysisSummaryDto;
import ai.jobachiever.jobs.entity.EmploymentType;
import ai.jobachiever.jobs.entity.ExperienceLevel;
import ai.jobachiever.jobs.entity.Job;
import ai.jobachiever.jobs.entity.JobAnalysis;
import ai.jobachiever.jobs.entity.WorkplaceType;
import ai.jobachiever.jobs.repository.JobAnalysisRepository;
import ai.jobachiever.jobs.repository.JobRepository;
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
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Job Analysis Service Unit Tests")
class JobAnalysisServiceTest {

    @Mock
    private JobAnalysisRepository jobAnalysisRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserAiPreferenceService userAiPreferenceService;

    @Mock
    private AIServiceClient aiServiceClient;

    private ObjectMapper objectMapper;
    private JobAnalysisServiceImpl service;

    private UUID userId;
    private UUID jobId;
    private UUID analysisId;

    private static final String SAMPLE_JD =
            "We are seeking a Senior Distributed Systems Engineer to architect enterprise-scale microservices. "
            + "Requirements include 5+ years with Java 21, Spring Boot 3, Apache Kafka, and PostgreSQL. "
            + "Experience with Docker, Kubernetes, and AWS is required. BS in Computer Science or equivalent.";

    private static final String MOCK_AI_RESPONSE = """
            {
              "jobOverview": {
                "jobTitle": "Senior Distributed Systems Engineer",
                "companyName": "Acme Corp",
                "roleCategory": "BACKEND",
                "seniority": "SENIOR",
                "employmentType": "FULL_TIME",
                "workArrangement": "HYBRID",
                "location": "San Francisco, CA",
                "experienceRange": {
                  "minimumYears": 5,
                  "maximumYears": null,
                  "rawRequirement": "5+ years"
                }
              },
              "technicalSkills": {
                "required": ["Java 21", "Spring Boot 3", "Apache Kafka", "PostgreSQL"],
                "preferred": ["Docker", "Kubernetes"],
                "mentioned": ["AWS"]
              },
              "softSkills": ["Problem Solving", "Collaboration"],
              "responsibilities": ["Architect enterprise-scale microservices"],
              "qualifications": {
                "education": ["BS in Computer Science or equivalent"],
                "certifications": [],
                "otherRequirements": []
              },
              "toolsAndTechnologies": ["Kafka", "PostgreSQL", "Docker", "Kubernetes"],
              "keywords": {
                "coreTechnical": ["Java 21", "Spring Boot 3"],
                "frameworksAndTools": ["Docker", "Kubernetes"],
                "domain": ["Distributed Systems"],
                "softSkills": ["Collaboration"],
                "roleAndResponsibility": ["Microservices Architecture"]
              },
              "requirements": [
                {
                  "name": "Java 21 & Spring Boot 3",
                  "category": "TECHNICAL_SKILL",
                  "importance": "CRITICAL",
                  "requirementType": "EXPLICIT",
                  "evidenceExcerpt": "5+ years with Java 21, Spring Boot 3",
                  "section": "Requirements",
                  "confidence": 0.98
                }
              ],
              "ambiguities": [],
              "redFlags": [],
              "summary": "Senior distributed systems engineering role requiring strong Java and Kafka skills.",
              "warnings": []
            }
            """;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        service = new JobAnalysisServiceImpl(
                jobAnalysisRepository,
                jobRepository,
                userAiPreferenceService,
                aiServiceClient,
                objectMapper
        );

        userId = UUID.randomUUID();
        jobId = UUID.randomUUID();
        analysisId = UUID.randomUUID();
    }

    @Test
    @DisplayName("analyzeDescription succeeds when consent is granted and returns structured report")
    void analyzeDescription_success() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);
        when(userAiPreferenceService.getPreferences(userId)).thenReturn(
                new UserAiPreferenceDto("GROQ", "llama-3.3-70b-versatile", 0.2, 4096, true, Instant.now(), Instant.now())
        );
        when(aiServiceClient.analyzeJobDescription(
                eq(SAMPLE_JD), isNull(), isNull(), isNull(),
                eq("GROQ"), eq("llama-3.3-70b-versatile"), eq(0.2), eq(4096), eq(true)
        )).thenReturn(MOCK_AI_RESPONSE);

        when(jobAnalysisRepository.save(any(JobAnalysis.class))).thenAnswer(invocation -> {
            JobAnalysis entity = invocation.getArgument(0);
            entity.setId(analysisId);
            entity.setCreatedAt(Instant.now());
            return entity;
        });

        AnalyzeJobDescriptionRequest request = new AnalyzeJobDescriptionRequest(
                SAMPLE_JD, null, null, null, null, null, null
        );

        JobAnalysisDto result = service.analyzeDescription(userId, request);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(analysisId);
        assertThat(result.jobTitle()).isEqualTo("Senior Distributed Systems Engineer");
        assertThat(result.companyName()).isEqualTo("Acme Corp");
        assertThat(result.seniority()).isEqualTo("SENIOR");
        assertThat(result.employmentType()).isEqualTo("FULL_TIME");
        assertThat(result.workArrangement()).isEqualTo("HYBRID");
        assertThat(result.experienceSummary()).isEqualTo("5+ years");
        assertThat(result.report()).isNotNull();
        assertThat(result.report().has("technicalSkills")).isTrue();

        verify(jobAnalysisRepository).save(any(JobAnalysis.class));
    }

    @Test
    @DisplayName("analyzeDescription throws AccessDeniedException when consent is not granted")
    void analyzeDescription_throwsWhenNoConsent() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(false);

        AnalyzeJobDescriptionRequest request = new AnalyzeJobDescriptionRequest(
                SAMPLE_JD, null, null, null, null, null, null
        );

        assertThatThrownBy(() -> service.analyzeDescription(userId, request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("External AI processing consent is required");

        verifyNoInteractions(aiServiceClient);
        verifyNoInteractions(jobAnalysisRepository);
    }

    @Test
    @DisplayName("analyzeJob succeeds for valid existing job and persists association")
    void analyzeJob_success() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);

        Job job = new Job();
        job.setId(jobId);
        job.setTitle("Senior Distributed Systems Engineer");
        job.setCompanyName("Acme Corp");
        job.setDescription(SAMPLE_JD);
        job.setWorkplaceType(WorkplaceType.HYBRID);
        job.setEmploymentType(EmploymentType.FULL_TIME);
        job.setExperienceLevel(ExperienceLevel.SENIOR);

        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        when(userAiPreferenceService.getPreferences(userId)).thenReturn(
                new UserAiPreferenceDto("GEMINI", "gemini-2.0-flash", 0.2, 4096, true, Instant.now(), Instant.now())
        );
        when(aiServiceClient.analyzeJobDescription(
                eq(SAMPLE_JD), eq(jobId), eq("Senior Distributed Systems Engineer"), eq("Acme Corp"),
                eq("GEMINI"), eq("gemini-2.0-flash"), eq(0.2), eq(4096), eq(true)
        )).thenReturn(MOCK_AI_RESPONSE);

        when(jobAnalysisRepository.save(any(JobAnalysis.class))).thenAnswer(invocation -> {
            JobAnalysis entity = invocation.getArgument(0);
            entity.setId(analysisId);
            entity.setCreatedAt(Instant.now());
            return entity;
        });

        JobAnalysisDto result = service.analyzeJob(userId, jobId);

        assertThat(result).isNotNull();
        assertThat(result.jobId()).isEqualTo(jobId);
        assertThat(result.provider()).isEqualTo("GEMINI");
        assertThat(result.jobTitle()).isEqualTo("Senior Distributed Systems Engineer");

        verify(jobRepository).findById(jobId);
        verify(jobAnalysisRepository).save(any(JobAnalysis.class));
    }

    @Test
    @DisplayName("analyzeJob throws ResourceNotFoundException when job does not exist")
    void analyzeJob_throwsWhenJobNotFound() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);
        when(jobRepository.findById(jobId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.analyzeJob(userId, jobId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Job not found");

        verifyNoInteractions(aiServiceClient);
    }

    @Test
    @DisplayName("analyzeJob throws IllegalArgumentException when job description is too short")
    void analyzeJob_throwsWhenDescriptionTooShort() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);

        Job job = new Job();
        job.setId(jobId);
        job.setTitle("Short Job");
        job.setDescription("Too short");

        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));

        assertThatThrownBy(() -> service.analyzeJob(userId, jobId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("minimum 50 characters required");

        verifyNoInteractions(aiServiceClient);
    }

    @Test
    @DisplayName("getAnalyses returns summaries in chronological order")
    void getAnalyses_returnsSummaries() {
        JobAnalysis a1 = new JobAnalysis();
        a1.setId(UUID.randomUUID());
        a1.setUserId(userId);
        a1.setJobTitle("Backend Engineer");
        a1.setProvider("GROQ");
        a1.setCreatedAt(Instant.now());

        when(jobAnalysisRepository.findByUserIdOrderByCreatedAtDesc(userId))
                .thenReturn(List.of(a1));

        List<JobAnalysisSummaryDto> result = service.getAnalyses(userId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).jobTitle()).isEqualTo("Backend Engineer");
    }

    @Test
    @DisplayName("getAnalysisDetails returns full DTO when analysis exists and belongs to user")
    void getAnalysisDetails_success() {
        JobAnalysis a = new JobAnalysis();
        a.setId(analysisId);
        a.setUserId(userId);
        a.setJobTitle("Senior Distributed Systems Engineer");
        a.setAnalysisJson(MOCK_AI_RESPONSE);
        a.setCreatedAt(Instant.now());

        when(jobAnalysisRepository.findByIdAndUserId(analysisId, userId))
                .thenReturn(Optional.of(a));

        JobAnalysisDto dto = service.getAnalysisDetails(userId, analysisId);

        assertThat(dto).isNotNull();
        assertThat(dto.id()).isEqualTo(analysisId);
        assertThat(dto.report()).isNotNull();
        assertThat(dto.report().has("jobOverview")).isTrue();
    }

    @Test
    @DisplayName("getAnalysisDetails throws ResourceNotFoundException when not found or owned by other user")
    void getAnalysisDetails_notFound() {
        when(jobAnalysisRepository.findByIdAndUserId(analysisId, userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getAnalysisDetails(userId, analysisId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Job analysis report not found");
    }

    @Test
    @DisplayName("deleteAnalysis deletes entity when owned by authenticated user")
    void deleteAnalysis_success() {
        JobAnalysis a = new JobAnalysis();
        a.setId(analysisId);
        a.setUserId(userId);

        when(jobAnalysisRepository.findByIdAndUserId(analysisId, userId))
                .thenReturn(Optional.of(a));

        service.deleteAnalysis(userId, analysisId);

        verify(jobAnalysisRepository).delete(a);
    }

    @Test
    @DisplayName("deleteAnalysis throws ResourceNotFoundException when analysis does not exist")
    void deleteAnalysis_notFound() {
        when(jobAnalysisRepository.findByIdAndUserId(analysisId, userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteAnalysis(userId, analysisId))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(jobAnalysisRepository, never()).delete(any());
    }
}
