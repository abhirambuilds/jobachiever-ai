package ai.jobachiever.jobs.service;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.ai.exception.AIServiceException;
import ai.jobachiever.ai.service.UserAiPreferenceService;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.jobs.dto.AnalyzeJobDescriptionRequest;
import ai.jobachiever.jobs.dto.JobAnalysisDto;
import ai.jobachiever.jobs.dto.JobAnalysisSummaryDto;
import ai.jobachiever.jobs.entity.Job;
import ai.jobachiever.jobs.entity.JobAnalysis;
import ai.jobachiever.jobs.repository.JobAnalysisRepository;
import ai.jobachiever.jobs.repository.JobRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.UUID;

@Service
public class JobAnalysisServiceImpl implements JobAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(JobAnalysisServiceImpl.class);

    private final JobAnalysisRepository jobAnalysisRepository;
    private final JobRepository jobRepository;
    private final UserAiPreferenceService userAiPreferenceService;
    private final AIServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public JobAnalysisServiceImpl(
            JobAnalysisRepository jobAnalysisRepository,
            JobRepository jobRepository,
            UserAiPreferenceService userAiPreferenceService,
            AIServiceClient aiServiceClient,
            ObjectMapper objectMapper) {
        this.jobAnalysisRepository = jobAnalysisRepository;
        this.jobRepository = jobRepository;
        this.userAiPreferenceService = userAiPreferenceService;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public JobAnalysisDto analyzeDescription(UUID userId, AnalyzeJobDescriptionRequest request) {
        log.info("Initiating AI job description analysis for userId={}, chars={}",
                userId, request.jobDescription().length());

        // 1. Mandatory AI consent check
        if (!userAiPreferenceService.hasConsent(userId)) {
            log.warn("Job analysis rejected for userId={}: Missing explicit AI processing consent", userId);
            throw new AccessDeniedException("External AI processing consent is required. Please grant consent in AI Provider Settings before analyzing job descriptions.");
        }

        // 2. Compute hash for tracking & deduplication
        String textHash = computeSha256(request.jobDescription());

        // 3. Resolve user AI preferences
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

        // 4. Dispatch request to FastAPI AI microservice
        String responseJson = aiServiceClient.analyzeJobDescription(
                request.jobDescription(),
                null,
                request.jobTitle(),
                request.companyName(),
                provider,
                model,
                temperature,
                maxTokens,
                true
        );

        // 5. Parse structured report and persist
        return parseAndSaveAnalysis(userId, null, provider, model, textHash, responseJson);
    }

    @Override
    @Transactional
    public JobAnalysisDto analyzeJob(UUID userId, UUID jobId) {
        log.info("Initiating AI job analysis for userId={}, jobId={}", userId, jobId);

        // 1. Mandatory consent check
        if (!userAiPreferenceService.hasConsent(userId)) {
            log.warn("Job analysis rejected for userId={}: Missing explicit AI processing consent", userId);
            throw new AccessDeniedException("External AI processing consent is required. Please grant consent in AI Provider Settings before analyzing job descriptions.");
        }

        // 2. Retrieve job record
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        String description = job.getDescription();
        if (description == null || description.trim().length() < 50) {
            throw new IllegalArgumentException("The target job has insufficient description text (minimum 50 characters required).");
        }

        String textHash = computeSha256(description);

        // 3. Resolve AI preferences
        UserAiPreferenceDto preferences = userAiPreferenceService.getPreferences(userId);

        // 4. Dispatch request to FastAPI AI microservice
        String responseJson = aiServiceClient.analyzeJobDescription(
                description,
                jobId,
                job.getTitle(),
                job.getCompanyName(),
                preferences.getSelectedProvider(),
                preferences.getPreferredModel(),
                preferences.getTemperature(),
                preferences.getMaxTokens(),
                true
        );

        // 5. Parse and save
        return parseAndSaveAnalysis(
                userId,
                jobId,
                preferences.getSelectedProvider(),
                preferences.getPreferredModel(),
                textHash,
                responseJson
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobAnalysisSummaryDto> getAnalyses(UUID userId) {
        return jobAnalysisRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobAnalysisSummaryDto> getJobAnalyses(UUID userId, UUID jobId) {
        return jobAnalysisRepository.findByUserIdAndJobIdOrderByCreatedAtDesc(userId, jobId)
                .stream()
                .map(this::mapToSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobAnalysisDto getAnalysisDetails(UUID userId, UUID analysisId) {
        JobAnalysis entity = jobAnalysisRepository.findByIdAndUserId(analysisId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job analysis report not found with id: " + analysisId));

        return mapToDto(entity);
    }

    @Override
    @Transactional
    public void deleteAnalysis(UUID userId, UUID analysisId) {
        JobAnalysis entity = jobAnalysisRepository.findByIdAndUserId(analysisId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job analysis report not found with id: " + analysisId));

        jobAnalysisRepository.delete(entity);
        log.info("Deleted job analysis id={} for userId={}", analysisId, userId);
    }

    private JobAnalysisDto parseAndSaveAnalysis(
            UUID userId,
            UUID jobId,
            String provider,
            String model,
            String textHash,
            String responseJson) {

        JsonNode rootNode;
        try {
            rootNode = objectMapper.readTree(responseJson);
        } catch (Exception ex) {
            log.error("Failed to parse AI microservice response JSON: {}", ex.getMessage());
            throw new AIServiceException("Malformed JSON received from AI service: " + ex.getMessage(), ex);
        }

        // Extract metadata from jobOverview
        String jobTitle = null;
        String companyName = null;
        String seniority = "UNKNOWN";
        String employmentType = "UNKNOWN";
        String workArrangement = "UNKNOWN";
        String location = null;
        String experienceSummary = null;

        JsonNode overviewNode = rootNode.has("jobOverview") ? rootNode.get("jobOverview") : rootNode.get("job_overview");
        if (overviewNode != null && !overviewNode.isNull()) {
            jobTitle = getOptionalText(overviewNode, "jobTitle", "job_title");
            companyName = getOptionalText(overviewNode, "companyName", "company_name");
            seniority = getOptionalText(overviewNode, "seniority", "seniority");
            employmentType = getOptionalText(overviewNode, "employmentType", "employment_type");
            workArrangement = getOptionalText(overviewNode, "workArrangement", "work_arrangement");
            location = getOptionalText(overviewNode, "location", "location");

            JsonNode expNode = overviewNode.has("experienceRange") ? overviewNode.get("experienceRange") : overviewNode.get("experience_range");
            if (expNode != null && !expNode.isNull()) {
                String rawExp = getOptionalText(expNode, "rawRequirement", "raw_requirement");
                if (rawExp != null && !rawExp.isBlank()) {
                    experienceSummary = rawExp;
                } else if (expNode.has("minimumYears") && !expNode.get("minimumYears").isNull()) {
                    int min = expNode.get("minimumYears").asInt();
                    if (expNode.has("maximumYears") && !expNode.get("maximumYears").isNull()) {
                        experienceSummary = min + " - " + expNode.get("maximumYears").asInt() + " years";
                    } else {
                        experienceSummary = min + "+ years";
                    }
                }
            }
        }

        String summary = null;
        if (rootNode.has("summary") && !rootNode.get("summary").isNull()) {
            summary = rootNode.get("summary").asText();
        }

        JobAnalysis entity = new JobAnalysis(
                userId,
                jobId,
                provider,
                model,
                jobTitle,
                companyName,
                seniority != null ? seniority : "UNKNOWN",
                employmentType != null ? employmentType : "UNKNOWN",
                workArrangement != null ? workArrangement : "UNKNOWN",
                location,
                experienceSummary,
                summary,
                responseJson,
                textHash
        );

        JobAnalysis saved = jobAnalysisRepository.save(entity);
        log.info("Saved AI job analysis id={} for userId={}", saved.getId(), userId);

        return new JobAnalysisDto(
                saved.getId(),
                saved.getJobId(),
                saved.getProvider(),
                saved.getModel(),
                saved.getJobTitle(),
                saved.getCompanyName(),
                saved.getSeniority(),
                saved.getEmploymentType(),
                saved.getWorkArrangement(),
                saved.getLocation(),
                saved.getExperienceSummary(),
                saved.getSummary(),
                rootNode,
                saved.getCreatedAt()
        );
    }

    private JobAnalysisDto mapToDto(JobAnalysis entity) {
        JsonNode reportNode;
        try {
            reportNode = objectMapper.readTree(entity.getAnalysisJson());
        } catch (Exception ex) {
            log.error("Failed to parse persisted analysisJson for id={}: {}", entity.getId(), ex.getMessage());
            reportNode = objectMapper.createObjectNode();
        }

        return new JobAnalysisDto(
                entity.getId(),
                entity.getJobId(),
                entity.getProvider(),
                entity.getModel(),
                entity.getJobTitle(),
                entity.getCompanyName(),
                entity.getSeniority(),
                entity.getEmploymentType(),
                entity.getWorkArrangement(),
                entity.getLocation(),
                entity.getExperienceSummary(),
                entity.getSummary(),
                reportNode,
                entity.getCreatedAt()
        );
    }

    private JobAnalysisSummaryDto mapToSummary(JobAnalysis entity) {
        return new JobAnalysisSummaryDto(
                entity.getId(),
                entity.getJobId(),
                entity.getProvider(),
                entity.getModel(),
                entity.getJobTitle(),
                entity.getCompanyName(),
                entity.getSeniority(),
                entity.getEmploymentType(),
                entity.getWorkArrangement(),
                entity.getLocation(),
                entity.getExperienceSummary(),
                entity.getSummary(),
                entity.getCreatedAt()
        );
    }

    private String getOptionalText(JsonNode node, String camelCaseKey, String snakeCaseKey) {
        if (node.has(camelCaseKey) && !node.get(camelCaseKey).isNull()) {
            return node.get(camelCaseKey).asText();
        }
        if (node.has(snakeCaseKey) && !node.get(snakeCaseKey).isNull()) {
            return node.get(snakeCaseKey).asText();
        }
        return null;
    }

    private String computeSha256(String text) {
        if (text == null) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.warn("Failed to compute SHA-256 hash: {}", e.getMessage());
            return null;
        }
    }
}
