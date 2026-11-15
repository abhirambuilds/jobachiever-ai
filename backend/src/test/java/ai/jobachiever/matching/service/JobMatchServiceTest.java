package ai.jobachiever.matching.service;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.ParsedResumeDto;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.ai.service.UserAiPreferenceService;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.jobs.dto.AnalyzeJobDescriptionRequest;
import ai.jobachiever.jobs.dto.JobAnalysisDto;
import ai.jobachiever.jobs.entity.Job;
import ai.jobachiever.jobs.entity.JobAnalysis;
import ai.jobachiever.jobs.repository.JobAnalysisRepository;
import ai.jobachiever.jobs.repository.JobRepository;
import ai.jobachiever.jobs.service.JobAnalysisService;
import ai.jobachiever.matching.dto.CreateMatchRequest;
import ai.jobachiever.matching.dto.JobMatchDto;
import ai.jobachiever.matching.dto.JobMatchSummaryDto;
import ai.jobachiever.matching.entity.JobMatch;
import ai.jobachiever.matching.repository.JobMatchRepository;
import ai.jobachiever.resumes.entity.ResumeAnalysis;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;
import ai.jobachiever.resumes.repository.ResumeAnalysisRepository;
import ai.jobachiever.resumes.repository.ResumeDocumentRepository;
import ai.jobachiever.resumes.repository.ResumeVersionRepository;
import ai.jobachiever.resumes.storage.FileStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Job Match Service Unit Tests")
class JobMatchServiceTest {

    @Mock
    private JobMatchRepository jobMatchRepository;

    @Mock
    private ResumeDocumentRepository resumeDocumentRepository;

    @Mock
    private ResumeVersionRepository resumeVersionRepository;

    @Mock
    private ResumeAnalysisRepository resumeAnalysisRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private JobAnalysisRepository jobAnalysisRepository;

    @Mock
    private JobAnalysisService jobAnalysisService;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private UserAiPreferenceService userAiPreferenceService;

    @Mock
    private AIServiceClient aiServiceClient;

    private ObjectMapper objectMapper;
    private JobMatchServiceImpl service;

    private UUID userId;
    private UUID resumeId;
    private UUID versionId;
    private UUID jobId;
    private UUID analysisId;
    private UUID matchId;

    private static final String MOCK_MATCH_RESPONSE = """
            {
              "match_id": "00000000-0000-0000-0000-000000000001",
              "overall_score": 88,
              "confidence_score": 0.95,
              "coverage_score": 92.5,
              "match_summary": "Strong alignment on core technologies and experience.",
              "scores": {
                "overall_score": 88,
                "required_skills": { "score": 90, "weight": 0.35, "weight_percent": 35.0, "status": "EVALUATED", "notes": "3 of 3 matched" },
                "preferred_skills": { "score": 80, "weight": 0.10, "weight_percent": 10.0, "status": "EVALUATED", "notes": "1 of 1 matched" },
                "experience": { "score": 85, "weight": 0.20, "weight_percent": 20.0, "status": "EVALUATED", "notes": "5+ years verified" },
                "qualifications": { "score": 100, "weight": 0.10, "weight_percent": 10.0, "status": "EVALUATED", "notes": "Degree matched" },
                "responsibilities": { "score": 85, "weight": 0.15, "weight_percent": 15.0, "status": "EVALUATED", "notes": "Duties aligned" }
              },
              "strengths": ["Strong Java & Spring Boot mastery", "5+ years relevant experience"],
              "missing_requirements": [],
              "partial_matches": ["Kafka experience partial"],
              "recommendations": ["Highlight distributed caching achievements"],
              "metadata": { "job_title": "Senior Backend Engineer", "company_name": "Acme Corp" }
            }
            """;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        service = new JobMatchServiceImpl(
                jobMatchRepository,
                resumeDocumentRepository,
                resumeVersionRepository,
                resumeAnalysisRepository,
                jobRepository,
                jobAnalysisRepository,
                jobAnalysisService,
                fileStorageService,
                userAiPreferenceService,
                aiServiceClient,
                objectMapper
        );

        userId = UUID.randomUUID();
        resumeId = UUID.randomUUID();
        versionId = UUID.randomUUID();
        jobId = UUID.randomUUID();
        analysisId = UUID.randomUUID();
        matchId = UUID.randomUUID();
    }

    @Test
    @DisplayName("createMatch: throws AccessDeniedException when candidate has not given AI consent")
    void createMatch_noConsent_throwsAccessDenied() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(false);

        CreateMatchRequest request = new CreateMatchRequest(
                resumeId, jobId, null, null, null, null, null, null, null, null
        );

        assertThatThrownBy(() -> service.createMatch(userId, request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("consent is required");

        verifyNoInteractions(resumeDocumentRepository);
        verifyNoInteractions(aiServiceClient);
    }

    @Test
    @DisplayName("createMatch: throws ResourceNotFoundException when resume not found or not owned by user")
    void createMatch_resumeNotFound_throwsResourceNotFound() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);
        when(resumeDocumentRepository.findByIdAndUserId(resumeId, userId)).thenReturn(Optional.empty());

        CreateMatchRequest request = new CreateMatchRequest(
                resumeId, jobId, null, null, null, null, null, null, null, null
        );

        assertThatThrownBy(() -> service.createMatch(userId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Resume document not found");

        verifyNoInteractions(aiServiceClient);
    }

    @Test
    @DisplayName("createMatch: throws IllegalArgumentException when neither jobId, jobAnalysisId, nor rawJobDescription is provided")
    void createMatch_noJobCriteria_throwsIllegalArgument() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);

        ResumeDocument resume = new ResumeDocument();
        resume.setId(resumeId);
        resume.setTitle("Senior Resume");
        when(resumeDocumentRepository.findByIdAndUserId(resumeId, userId)).thenReturn(Optional.of(resume));

        ResumeAnalysis analysis = new ResumeAnalysis();
        analysis.setAnalysisJson("{\"skills\": [{\"name\": \"Java\"}]}");
        when(resumeAnalysisRepository.findFirstByResumeIdAndUserIdOrderByCreatedAtDesc(resumeId, userId))
                .thenReturn(Optional.of(analysis));

        CreateMatchRequest request = new CreateMatchRequest(
                resumeId, null, null, null, null, null, null, null, null, null
        );

        assertThatThrownBy(() -> service.createMatch(userId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("required for matching");
    }

    @Test
    @DisplayName("createMatch: successfully matches using existing job analysis report")
    void createMatch_withJobAnalysisId_success() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);

        ResumeDocument resume = new ResumeDocument();
        resume.setId(resumeId);
        resume.setTitle("My Dev Resume");
        when(resumeDocumentRepository.findByIdAndUserId(resumeId, userId)).thenReturn(Optional.of(resume));

        ResumeAnalysis resumeAnalysis = new ResumeAnalysis();
        resumeAnalysis.setAnalysisJson("{\"skills\": [{\"name\": \"Java\"}], \"experience\": []}");
        when(resumeAnalysisRepository.findFirstByResumeIdAndUserIdOrderByCreatedAtDesc(resumeId, userId))
                .thenReturn(Optional.of(resumeAnalysis));

        JobAnalysis jobAnalysis = new JobAnalysis();
        jobAnalysis.setId(analysisId);
        jobAnalysis.setJobId(jobId);
        jobAnalysis.setAnalysisJson("{\"requiredSkills\": [{\"name\": \"Java\"}]}");
        when(jobAnalysisRepository.findByIdAndUserId(analysisId, userId)).thenReturn(Optional.of(jobAnalysis));

        UserAiPreferenceDto prefs = new UserAiPreferenceDto("GROQ", "llama-3.3-70b-versatile", 0.2, 4096, true, Instant.now(), Instant.now());
        when(userAiPreferenceService.getPreferences(userId)).thenReturn(prefs);

        when(aiServiceClient.matchResumeToJob(
                any(), any(), eq(resumeId), isNull(), eq(jobId), eq(analysisId),
                eq("GROQ"), eq("llama-3.3-70b-versatile"), eq(0.2), eq(4096), eq(true)
        )).thenReturn(MOCK_MATCH_RESPONSE);

        when(jobMatchRepository.save(any(JobMatch.class))).thenAnswer(invocation -> {
            JobMatch m = invocation.getArgument(0);
            m.setId(matchId);
            return m;
        });

        CreateMatchRequest request = new CreateMatchRequest(
                resumeId, null, analysisId, null, null, null, null, null, null, null
        );

        JobMatchDto result = service.createMatch(userId, request);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(matchId);
        assertThat(result.overallScore()).isEqualTo(88);
        assertThat(result.requiredSkillsScore()).isEqualTo(90);
        assertThat(result.confidenceScore()).isEqualTo(0.95);
        assertThat(result.provider()).isEqualTo("GROQ");
        verify(jobMatchRepository).save(any(JobMatch.class));
    }

    @Test
    @DisplayName("createMatch: parses resume from storage when no existing resume analysis exists")
    void createMatch_parsesResumeFromStorage_whenNoAnalysisExists() {
        when(userAiPreferenceService.hasConsent(userId)).thenReturn(true);

        ResumeDocument resume = new ResumeDocument();
        resume.setId(resumeId);
        resume.setTitle("My Resume");
        ResumeVersion version = new ResumeVersion();
        version.setId(versionId);
        version.setStorageKey("users/123/resumes/test.pdf");
        version.setFileName("test.pdf");
        version.setMimeType("application/pdf");
        resume.setCurrentVersion(version);
        when(resumeDocumentRepository.findByIdAndUserId(resumeId, userId)).thenReturn(Optional.of(resume));

        when(resumeAnalysisRepository.findFirstByResumeIdAndUserIdOrderByCreatedAtDesc(resumeId, userId))
                .thenReturn(Optional.empty());

        when(fileStorageService.retrieve("users/123/resumes/test.pdf"))
                .thenReturn(new ByteArrayResource("dummy pdf content".getBytes()));

        ParsedResumeDto parsedResume = new ParsedResumeDto();
        parsedResume.setSummary("Experienced engineer");
        when(aiServiceClient.parseResume(any(byte[].class), eq("test.pdf"), eq("application/pdf")))
                .thenReturn(parsedResume);

        JobAnalysis jobAnalysis = new JobAnalysis();
        jobAnalysis.setId(analysisId);
        jobAnalysis.setAnalysisJson("{\"requiredSkills\": [{\"name\": \"Java\"}]}");
        when(jobAnalysisRepository.findByIdAndUserId(analysisId, userId)).thenReturn(Optional.of(jobAnalysis));

        UserAiPreferenceDto prefs = new UserAiPreferenceDto("GROQ", "llama-3.3-70b-versatile", 0.2, 4096, true, Instant.now(), Instant.now());
        when(userAiPreferenceService.getPreferences(userId)).thenReturn(prefs);

        when(aiServiceClient.matchResumeToJob(
                any(), any(), eq(resumeId), eq(versionId), isNull(), eq(analysisId),
                eq("GROQ"), eq("llama-3.3-70b-versatile"), eq(0.2), eq(4096), eq(true)
        )).thenReturn(MOCK_MATCH_RESPONSE);

        when(jobMatchRepository.save(any(JobMatch.class))).thenAnswer(invocation -> {
            JobMatch m = invocation.getArgument(0);
            m.setId(matchId);
            return m;
        });

        CreateMatchRequest request = new CreateMatchRequest(
                resumeId, null, analysisId, null, null, null, null, null, null, null
        );

        JobMatchDto result = service.createMatch(userId, request);

        assertThat(result).isNotNull();
        assertThat(result.overallScore()).isEqualTo(88);
        verify(aiServiceClient).parseResume(any(byte[].class), eq("test.pdf"), eq("application/pdf"));
    }

    @Test
    @DisplayName("getMatches: returns sorted list of match summaries for user")
    void getMatches_returnsSummaries() {
        JobMatch match = new JobMatch();
        match.setId(matchId);
        match.setUserId(userId);
        match.setResumeId(resumeId);
        match.setOverallScore(85);
        match.setProvider("GROQ");
        when(jobMatchRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(match));

        List<JobMatchSummaryDto> list = service.getMatches(userId);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).id()).isEqualTo(matchId);
        assertThat(list.get(0).overallScore()).isEqualTo(85);
    }

    @Test
    @DisplayName("getMatchDetails: returns full DTO when match exists and belongs to user")
    void getMatchDetails_success() {
        JobMatch match = new JobMatch();
        match.setId(matchId);
        match.setUserId(userId);
        match.setResumeId(resumeId);
        match.setOverallScore(92);
        match.setMatchJson(MOCK_MATCH_RESPONSE);
        when(jobMatchRepository.findByIdAndUserId(matchId, userId)).thenReturn(Optional.of(match));

        JobMatchDto result = service.getMatchDetails(userId, matchId);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(matchId);
        assertThat(result.overallScore()).isEqualTo(92);
        assertThat(result.report()).isNotNull();
    }

    @Test
    @DisplayName("getMatchDetails: throws ResourceNotFoundException when match not found")
    void getMatchDetails_notFound_throwsResourceNotFound() {
        when(jobMatchRepository.findByIdAndUserId(matchId, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getMatchDetails(userId, matchId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Match report not found");
    }

    @Test
    @DisplayName("deleteMatch: deletes entity when owned by user")
    void deleteMatch_success() {
        JobMatch match = new JobMatch();
        match.setId(matchId);
        match.setUserId(userId);
        when(jobMatchRepository.findByIdAndUserId(matchId, userId)).thenReturn(Optional.of(match));

        service.deleteMatch(userId, matchId);

        verify(jobMatchRepository).delete(match);
    }
}
