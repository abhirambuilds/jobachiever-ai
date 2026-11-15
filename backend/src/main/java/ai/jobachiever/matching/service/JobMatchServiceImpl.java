package ai.jobachiever.matching.service;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.ParsedResumeDto;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.ai.exception.AIServiceException;
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
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Production implementation of the explainable Resume-to-Job Matching Engine service.
 * Enforces authenticated candidate ownership, mandatory AI consent, zero fabrication,
 * and deterministic multi-dimensional compatibility scoring.
 */
@Service
public class JobMatchServiceImpl implements JobMatchService {

    private static final Logger log = LoggerFactory.getLogger(JobMatchServiceImpl.class);

    private final JobMatchRepository jobMatchRepository;
    private final ResumeDocumentRepository resumeDocumentRepository;
    private final ResumeVersionRepository resumeVersionRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final JobRepository jobRepository;
    private final JobAnalysisRepository jobAnalysisRepository;
    private final JobAnalysisService jobAnalysisService;
    private final FileStorageService fileStorageService;
    private final UserAiPreferenceService userAiPreferenceService;
    private final AIServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public JobMatchServiceImpl(
            JobMatchRepository jobMatchRepository,
            ResumeDocumentRepository resumeDocumentRepository,
            ResumeVersionRepository resumeVersionRepository,
            ResumeAnalysisRepository resumeAnalysisRepository,
            JobRepository jobRepository,
            JobAnalysisRepository jobAnalysisRepository,
            JobAnalysisService jobAnalysisService,
            FileStorageService fileStorageService,
            UserAiPreferenceService userAiPreferenceService,
            AIServiceClient aiServiceClient,
            ObjectMapper objectMapper) {
        this.jobMatchRepository = jobMatchRepository;
        this.resumeDocumentRepository = resumeDocumentRepository;
        this.resumeVersionRepository = resumeVersionRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.jobRepository = jobRepository;
        this.jobAnalysisRepository = jobAnalysisRepository;
        this.jobAnalysisService = jobAnalysisService;
        this.fileStorageService = fileStorageService;
        this.userAiPreferenceService = userAiPreferenceService;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public JobMatchDto createMatch(UUID userId, CreateMatchRequest request) {
        log.info("Initiating explainable Resume-Job match for userId={} and resumeId={}", userId, request.resumeId());

        // 1. Mandatory explicit user consent check
        if (!userAiPreferenceService.hasConsent(userId)) {
            log.warn("Match rejected for userId={}: Missing explicit AI processing consent", userId);
            throw new AccessDeniedException("External AI processing consent is required. Please grant consent in AI Provider Settings before matching resumes.");
        }

        // 2. Tenancy & document ownership verification
        ResumeDocument resume = resumeDocumentRepository.findByIdAndUserId(request.resumeId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume document not found with id: " + request.resumeId()));

        // 3. Resolve active document version
        ResumeVersion version = resume.getCurrentVersion();
        if (version == null) {
            version = resumeVersionRepository.findFirstByDocumentIdOrderByVersionNumberDesc(request.resumeId())
                    .orElse(null);
        }
        UUID versionId = version != null ? version.getId() : null;

        // 4. Resolve structured candidate resume data
        Map<String, Object> resumeData = null;
        Optional<ResumeAnalysis> analysisOpt = resumeAnalysisRepository.findFirstByResumeIdAndUserIdOrderByCreatedAtDesc(request.resumeId(), userId);
        if (analysisOpt.isPresent() && analysisOpt.get().getAnalysisJson() != null) {
            try {
                resumeData = objectMapper.readValue(analysisOpt.get().getAnalysisJson(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception ex) {
                log.warn("Could not deserialize saved resume analysis json for resumeId={}: {}", request.resumeId(), ex.getMessage());
            }
        }

        if (resumeData == null) {
            if (version == null) {
                throw new ResourceNotFoundException("No valid resume file version found for resume: " + request.resumeId());
            }
            String storageKey = (version.getStorageKey() != null && !version.getStorageKey().isBlank())
                    ? version.getStorageKey()
                    : version.getStoragePath();
            if (storageKey == null || storageKey.isBlank()) {
                throw new ResourceNotFoundException("Resume file storage path is missing for version: " + version.getId());
            }

            byte[] fileBytes;
            try {
                Resource fileResource = fileStorageService.retrieve(storageKey);
                try (InputStream is = fileResource.getInputStream()) {
                    fileBytes = is.readAllBytes();
                }
            } catch (Exception ex) {
                log.error("Failed to read resume file from storage key '{}': {}", storageKey, ex.getMessage());
                throw new AIServiceException("Failed to read resume file from storage: " + ex.getMessage(), ex);
            }

            String filename = version.getFileName();
            if (filename == null || filename.isBlank()) {
                filename = (resume.getTitle() != null ? resume.getTitle() : "resume") + ".pdf";
            }
            String contentType = version.getMimeType();
            if (contentType == null || contentType.isBlank()) {
                contentType = filename.toLowerCase().endsWith(".docx")
                        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        : "application/pdf";
            }

            ParsedResumeDto parsed = aiServiceClient.parseResume(fileBytes, filename, contentType);
            resumeData = objectMapper.convertValue(parsed, new TypeReference<Map<String, Object>>() {});
        }

        // 5. Resolve target job requirements data
        UUID resolvedJobId = request.jobId();
        UUID resolvedJobAnalysisId = request.jobAnalysisId();
        Map<String, Object> jobData = null;

        if (resolvedJobAnalysisId != null) {
            final UUID targetAnalysisId = resolvedJobAnalysisId;
            JobAnalysis analysis = jobAnalysisRepository.findByIdAndUserId(targetAnalysisId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Job analysis report not found with id: " + targetAnalysisId));
            try {
                jobData = objectMapper.readValue(analysis.getAnalysisJson(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception ex) {
                log.error("Failed to parse analysis JSON for job analysis id={}: {}", resolvedJobAnalysisId, ex.getMessage());
                throw new AIServiceException("Malformed JSON in job analysis: " + ex.getMessage(), ex);
            }
            if (resolvedJobId == null) {
                resolvedJobId = analysis.getJobId();
            }
        } else if (resolvedJobId != null) {
            List<JobAnalysis> existingAnalyses = jobAnalysisRepository.findByUserIdAndJobIdOrderByCreatedAtDesc(userId, resolvedJobId);
            if (!existingAnalyses.isEmpty()) {
                JobAnalysis analysis = existingAnalyses.get(0);
                resolvedJobAnalysisId = analysis.getId();
                try {
                    jobData = objectMapper.readValue(analysis.getAnalysisJson(), new TypeReference<Map<String, Object>>() {});
                } catch (Exception ex) {
                    log.warn("Failed to parse existing job analysis JSON: {}", ex.getMessage());
                }
            }
            if (jobData == null) {
                JobAnalysisDto analysisDto = jobAnalysisService.analyzeJob(userId, resolvedJobId);
                resolvedJobAnalysisId = analysisDto.id();
                jobData = objectMapper.convertValue(analysisDto.report(), new TypeReference<Map<String, Object>>() {});
            }
        } else if (request.rawJobDescription() != null && !request.rawJobDescription().isBlank()) {
            if (request.rawJobDescription().trim().length() < 50) {
                throw new IllegalArgumentException("Job description must contain at least 50 meaningful characters");
            }
            AnalyzeJobDescriptionRequest analyzeRequest = new AnalyzeJobDescriptionRequest(
                    request.rawJobDescription(),
                    request.jobTitle(),
                    request.companyName(),
                    request.provider(),
                    request.model(),
                    request.temperature(),
                    request.maxTokens()
            );
            JobAnalysisDto analysisDto = jobAnalysisService.analyzeDescription(userId, analyzeRequest);
            resolvedJobAnalysisId = analysisDto.id();
            jobData = objectMapper.convertValue(analysisDto.report(), new TypeReference<Map<String, Object>>() {});
        } else {
            throw new IllegalArgumentException("A target job ID, job analysis ID, or raw job description is required for matching.");
        }

        // 6. Resolve AI provider settings
        UserAiPreferenceDto preferences = userAiPreferenceService.getPreferences(userId);
        String provider = (request.provider() != null && !request.provider().isBlank())
                ? request.provider().trim().toUpperCase()
                : preferences.getSelectedProvider();
        String model = (request.model() != null && !request.model().isBlank())
                ? request.model().trim()
                : preferences.getPreferredModel();
        Double temperature = request.temperature() != null
                ? request.temperature()
                : preferences.getTemperature();
        Integer maxTokens = request.maxTokens() != null
                ? request.maxTokens()
                : preferences.getMaxTokens();

        // 7. Dispatch to FastAPI matching microservice
        String responseJson = aiServiceClient.matchResumeToJob(
                resumeData,
                jobData,
                request.resumeId(),
                versionId,
                resolvedJobId,
                resolvedJobAnalysisId,
                provider,
                model,
                temperature,
                maxTokens,
                true
        );

        // 8. Parse score breakdown and summary
        JsonNode rootNode;
        try {
            rootNode = objectMapper.readTree(responseJson);
        } catch (Exception ex) {
            log.error("Failed to parse matching response JSON: {}", ex.getMessage());
            throw new AIServiceException("Malformed JSON received from AI matching service: " + ex.getMessage(), ex);
        }

        int overallScore = rootNode.has("overall_score") ? rootNode.get("overall_score").asInt() : 0;
        JsonNode scoresNode = rootNode.get("scores");
        Integer reqSkillsScore = null;
        Integer prefSkillsScore = null;
        Integer expScore = null;
        Integer qualScore = null;
        Integer respScore = null;

        if (scoresNode != null && !scoresNode.isNull()) {
            if (scoresNode.has("required_skills") && scoresNode.get("required_skills").has("score")) {
                reqSkillsScore = scoresNode.get("required_skills").get("score").asInt();
            }
            if (scoresNode.has("preferred_skills") && scoresNode.get("preferred_skills").has("score")) {
                prefSkillsScore = scoresNode.get("preferred_skills").get("score").asInt();
            }
            if (scoresNode.has("experience") && scoresNode.get("experience").has("score")) {
                expScore = scoresNode.get("experience").get("score").asInt();
            }
            if (scoresNode.has("qualifications") && scoresNode.get("qualifications").has("score")) {
                qualScore = scoresNode.get("qualifications").get("score").asInt();
            }
            if (scoresNode.has("responsibilities") && scoresNode.get("responsibilities").has("score")) {
                respScore = scoresNode.get("responsibilities").get("score").asInt();
            }
        }
        Double confidenceScore = rootNode.has("confidence_score") ? rootNode.get("confidence_score").asDouble() : null;

        String matchSummary = null;
        if (rootNode.has("match_summary") && !rootNode.get("match_summary").asText().isBlank()) {
            matchSummary = rootNode.get("match_summary").asText();
        } else if (rootNode.has("strengths") && rootNode.get("strengths").isArray() && !rootNode.get("strengths").isEmpty()) {
            matchSummary = rootNode.get("strengths").get(0).asText();
        }

        // 9. Persist JobMatch entity
        JobMatch entity = new JobMatch(
                userId,
                request.resumeId(),
                versionId,
                resolvedJobId,
                resolvedJobAnalysisId,
                provider,
                model,
                overallScore,
                reqSkillsScore,
                prefSkillsScore,
                expScore,
                qualScore,
                respScore,
                confidenceScore,
                matchSummary,
                responseJson
        );

        JobMatch saved = jobMatchRepository.save(entity);
        log.info("Successfully persisted JobMatch id={} for userId={}, overallScore={}", saved.getId(), userId, overallScore);

        return mapToDto(saved, rootNode);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobMatchSummaryDto> getMatches(UUID userId) {
        return jobMatchRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobMatchSummaryDto> getMatchesForJob(UUID userId, UUID jobId) {
        return jobMatchRepository.findByUserIdAndJobIdOrderByCreatedAtDesc(userId, jobId)
                .stream()
                .map(this::mapToSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobMatchSummaryDto> getMatchesForResume(UUID userId, UUID resumeId) {
        if (!resumeDocumentRepository.existsByIdAndUserId(resumeId, userId)) {
            throw new ResourceNotFoundException("Resume document not found with id: " + resumeId);
        }
        return jobMatchRepository.findByUserIdAndResumeIdOrderByCreatedAtDesc(userId, resumeId)
                .stream()
                .map(this::mapToSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobMatchDto getMatchDetails(UUID userId, UUID matchId) {
        JobMatch entity = jobMatchRepository.findByIdAndUserId(matchId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Match report not found with id: " + matchId));

        JsonNode reportNode;
        try {
            reportNode = objectMapper.readTree(entity.getMatchJson());
        } catch (Exception ex) {
            log.error("Failed to parse saved match JSON for id={}: {}", entity.getId(), ex.getMessage());
            reportNode = objectMapper.createObjectNode();
        }

        return mapToDto(entity, reportNode);
    }

    @Override
    @Transactional
    public void deleteMatch(UUID userId, UUID matchId) {
        JobMatch entity = jobMatchRepository.findByIdAndUserId(matchId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Match report not found with id: " + matchId));
        jobMatchRepository.delete(entity);
        log.info("Successfully deleted job match id={} for userId={}", matchId, userId);
    }

    private JobMatchDto mapToDto(JobMatch entity, JsonNode reportNode) {
        String resumeName = null;
        try {
            resumeName = resumeDocumentRepository.findById(entity.getResumeId())
                    .map(ResumeDocument::getTitle)
                    .orElse(null);
        } catch (Exception ignored) {}

        String jobTitle = null;
        String companyName = null;
        if (entity.getJobId() != null) {
            try {
                Optional<Job> jobOpt = jobRepository.findById(entity.getJobId());
                if (jobOpt.isPresent()) {
                    jobTitle = jobOpt.get().getTitle();
                    companyName = jobOpt.get().getCompanyName();
                }
            } catch (Exception ignored) {}
        }
        if (jobTitle == null && reportNode.has("metadata")) {
            jobTitle = reportNode.path("metadata").path("job_title").asText(null);
            companyName = reportNode.path("metadata").path("company_name").asText(null);
        }

        return new JobMatchDto(
                entity.getId(),
                entity.getResumeId(),
                entity.getResumeVersionId(),
                resumeName,
                entity.getJobId(),
                entity.getJobAnalysisId(),
                jobTitle,
                companyName,
                entity.getProvider(),
                entity.getModel(),
                entity.getOverallScore(),
                entity.getRequiredSkillsScore(),
                entity.getPreferredSkillsScore(),
                entity.getExperienceScore(),
                entity.getQualificationsScore(),
                entity.getResponsibilitiesScore(),
                entity.getConfidenceScore(),
                entity.getMatchSummary(),
                reportNode,
                entity.getCreatedAt()
        );
    }

    private JobMatchSummaryDto mapToSummary(JobMatch entity) {
        String resumeName = null;
        try {
            resumeName = resumeDocumentRepository.findById(entity.getResumeId())
                    .map(ResumeDocument::getTitle)
                    .orElse(null);
        } catch (Exception ignored) {}

        String jobTitle = null;
        String companyName = null;
        if (entity.getJobId() != null) {
            try {
                Optional<Job> jobOpt = jobRepository.findById(entity.getJobId());
                if (jobOpt.isPresent()) {
                    jobTitle = jobOpt.get().getTitle();
                    companyName = jobOpt.get().getCompanyName();
                }
            } catch (Exception ignored) {}
        }

        return new JobMatchSummaryDto(
                entity.getId(),
                entity.getResumeId(),
                resumeName,
                entity.getJobId(),
                entity.getJobAnalysisId(),
                jobTitle,
                companyName,
                entity.getProvider(),
                entity.getModel(),
                entity.getOverallScore(),
                entity.getConfidenceScore(),
                entity.getMatchSummary(),
                entity.getCreatedAt()
        );
    }
}
