package ai.jobachiever.resumes.studio.service;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.ai.exception.AIServiceException;
import ai.jobachiever.ai.service.UserAiPreferenceService;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.jobs.entity.Job;
import ai.jobachiever.jobs.repository.JobRepository;
import ai.jobachiever.resumes.repository.ResumeDocumentRepository;
import ai.jobachiever.resumes.studio.dto.ResumeStudioContextDto;
import ai.jobachiever.resumes.studio.dto.ResumeStudioRequest;
import ai.jobachiever.resumes.studio.dto.ResumeStudioResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ResumeStudioServiceImpl implements ResumeStudioService {

    private static final Logger log = LoggerFactory.getLogger(ResumeStudioServiceImpl.class);

    private final AIServiceClient aiServiceClient;
    private final UserAiPreferenceService userAiPreferenceService;
    private final ResumeDocumentRepository resumeDocumentRepository;
    private final JobRepository jobRepository;
    private final ObjectMapper objectMapper;

    public ResumeStudioServiceImpl(AIServiceClient aiServiceClient,
                                  UserAiPreferenceService userAiPreferenceService,
                                  ResumeDocumentRepository resumeDocumentRepository,
                                  JobRepository jobRepository,
                                  ObjectMapper objectMapper) {
        this.aiServiceClient = aiServiceClient;
        this.userAiPreferenceService = userAiPreferenceService;
        this.resumeDocumentRepository = resumeDocumentRepository;
        this.jobRepository = jobRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeStudioResponseDto enhanceContent(UUID userId, ResumeStudioRequest request) {
        log.info("Processing Resume Studio rewrite request for userId={}, action={}, mode={}",
                userId, request.getAction(), request.getWritingMode());

        // 1. Mandatory AI consent check
        if (!userAiPreferenceService.hasConsent(userId)) {
            log.warn("Resume Studio enhancement rejected for userId={}: Missing explicit AI processing consent", userId);
            throw new AccessDeniedException("External AI processing consent is required. Please grant consent in AI Provider Settings before using the AI Writing Assistant.");
        }

        // 2. Validate resume ownership if resumeId is specified
        if (request.getResumeId() != null) {
            resumeDocumentRepository.findByIdAndUserId(request.getResumeId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resume document not found with id: " + request.getResumeId()));
        }

        // 3. Enrich context from target job if jobId is specified
        ResumeStudioContextDto context = request.getContext();
        if (request.getJobId() != null) {
            Optional<Job> jobOpt = jobRepository.findById(request.getJobId());
            if (jobOpt.isPresent()) {
                Job job = jobOpt.get();
                if (context == null) {
                    context = new ResumeStudioContextDto();
                }
                if (context.getTargetJobDescription() == null || context.getTargetJobDescription().isBlank()) {
                    context.setTargetJobDescription(job.getDescription());
                }
                if (context.getJobTitle() == null || context.getJobTitle().isBlank()) {
                    context.setJobTitle(job.getTitle());
                }
                if (context.getCompany() == null || context.getCompany().isBlank()) {
                    context.setCompany(job.getCompanyName());
                }
            }
        }

        // 4. Retrieve active user AI provider preferences
        UserAiPreferenceDto preferences = userAiPreferenceService.getPreferences(userId);
        String provider = (request.getProvider() != null && !request.getProvider().isBlank())
                ? request.getProvider()
                : preferences.getSelectedProvider();
        String model = (request.getModel() != null && !request.getModel().isBlank())
                ? request.getModel()
                : preferences.getPreferredModel();
        Double temperature = request.getTemperature() != null ? request.getTemperature() : preferences.getTemperature();
        Integer maxTokens = request.getMaxTokens() != null ? request.getMaxTokens() : preferences.getMaxTokens();

        // 5. Build context map for microservice
        Map<String, Object> contextMap = new HashMap<>();
        if (context != null) {
            if (context.getSection() != null) contextMap.put("section", context.getSection());
            if (context.getRole() != null) contextMap.put("role", context.getRole());
            if (context.getCompany() != null) contextMap.put("company", context.getCompany());
            if (context.getJobTitle() != null) contextMap.put("job_title", context.getJobTitle());
            if (context.getTargetJobDescription() != null) contextMap.put("target_job_description", context.getTargetJobDescription());
            if (context.getTargetJobRequirements() != null) contextMap.put("target_job_requirements", context.getTargetJobRequirements());
            if (context.getVerifiedSkills() != null) contextMap.put("verified_skills", context.getVerifiedSkills());
        }

        // 6. Invoke AI microservice
        String responseJson = aiServiceClient.generateResumeStudioContent(
                request.getAction(),
                request.getSourceText(),
                contextMap,
                request.getWritingMode() != null ? request.getWritingMode() : "PROFESSIONAL",
                provider,
                model,
                temperature,
                maxTokens,
                request.getNumAlternatives(),
                true
        );

        // 7. Deserialize JSON into structured response DTO
        try {
            return objectMapper.readValue(responseJson, ResumeStudioResponseDto.class);
        } catch (Exception ex) {
            log.error("Failed to deserialize Resume Studio response: {}", ex.getMessage(), ex);
            throw new AIServiceException("Malformed response received from Resume Studio microservice: " + ex.getMessage(), ex);
        }
    }
}
