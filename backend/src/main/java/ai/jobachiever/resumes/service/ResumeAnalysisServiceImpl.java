package ai.jobachiever.resumes.service;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.ai.exception.AIServiceException;
import ai.jobachiever.ai.service.UserAiPreferenceService;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.resumes.dto.ResumeAnalysisDto;
import ai.jobachiever.resumes.dto.ResumeAnalysisSummaryDto;
import ai.jobachiever.resumes.entity.ResumeAnalysis;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;
import ai.jobachiever.resumes.repository.ResumeAnalysisRepository;
import ai.jobachiever.resumes.repository.ResumeDocumentRepository;
import ai.jobachiever.resumes.repository.ResumeVersionRepository;
import ai.jobachiever.resumes.storage.FileStorageService;
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
import java.util.UUID;

@Service
public class ResumeAnalysisServiceImpl implements ResumeAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(ResumeAnalysisServiceImpl.class);

    private final ResumeDocumentRepository resumeDocumentRepository;
    private final ResumeVersionRepository resumeVersionRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final FileStorageService fileStorageService;
    private final UserAiPreferenceService userAiPreferenceService;
    private final AIServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public ResumeAnalysisServiceImpl(
            ResumeDocumentRepository resumeDocumentRepository,
            ResumeVersionRepository resumeVersionRepository,
            ResumeAnalysisRepository resumeAnalysisRepository,
            FileStorageService fileStorageService,
            UserAiPreferenceService userAiPreferenceService,
            AIServiceClient aiServiceClient,
            ObjectMapper objectMapper) {
        this.resumeDocumentRepository = resumeDocumentRepository;
        this.resumeVersionRepository = resumeVersionRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.fileStorageService = fileStorageService;
        this.userAiPreferenceService = userAiPreferenceService;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public ResumeAnalysisDto analyzeResume(UUID userId, UUID resumeId) {
        log.info("Initiating AI resume analysis for userId={} and resumeId={}", userId, resumeId);

        // 1. Mandatory explicit user consent check
        if (!userAiPreferenceService.hasConsent(userId)) {
            log.warn("AI analysis rejected for userId={}: Missing explicit AI processing consent", userId);
            throw new AccessDeniedException("External AI processing consent is required. Please grant consent in AI Provider Settings before analyzing resumes.");
        }

        // 2. Tenancy & document ownership verification
        ResumeDocument resume = resumeDocumentRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume document not found with id: " + resumeId));

        // 3. Resolve active document version
        ResumeVersion version = resume.getCurrentVersion();
        if (version == null) {
            version = resumeVersionRepository.findFirstByDocumentIdOrderByVersionNumberDesc(resumeId)
                    .orElseThrow(() -> new ResourceNotFoundException("No valid resume file version found for resume: " + resumeId));
        }

        String storageKey = (version.getStorageKey() != null && !version.getStorageKey().isBlank())
                ? version.getStorageKey()
                : version.getStoragePath();

        if (storageKey == null || storageKey.isBlank()) {
            throw new ResourceNotFoundException("Resume file storage path is missing for resume version: " + version.getId());
        }

        // 4. Load binary file from storage
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

        // 5. Retrieve active AI provider preferences
        UserAiPreferenceDto preferences = userAiPreferenceService.getPreferences(userId);

        // 6. Dispatch analysis to internal Python FastAPI microservice
        String responseJson = aiServiceClient.analyzeResume(
                fileBytes,
                filename,
                contentType,
                resumeId,
                preferences.getSelectedProvider(),
                preferences.getPreferredModel(),
                preferences.getTemperature(),
                preferences.getMaxTokens(),
                true
        );

        // 7. Extract top-level scores for indexing and query performance
        JsonNode rootNode;
        try {
            rootNode = objectMapper.readTree(responseJson);
        } catch (Exception ex) {
            log.error("Failed to parse AI microservice response JSON: {}", ex.getMessage());
            throw new AIServiceException("Malformed JSON received from AI service: " + ex.getMessage(), ex);
        }

        int overallScore = 0;
        String overallRating = "FAIR";
        String summary = "";

        JsonNode overallNode = rootNode.get("overallAssessment");
        if (overallNode == null || overallNode.isNull()) {
            overallNode = rootNode.get("overall_assessment");
        }
        if (overallNode != null && !overallNode.isNull()) {
            overallScore = overallNode.has("score") ? overallNode.get("score").asInt() : 0;
            overallRating = overallNode.has("rating") ? overallNode.get("rating").asText() : "FAIR";
            summary = overallNode.has("summary") ? overallNode.get("summary").asText() : "";
        }

        // 8. Persist analysis history record
        ResumeAnalysis entity = new ResumeAnalysis(
                userId,
                resumeId,
                version.getId(),
                preferences.getSelectedProvider(),
                preferences.getPreferredModel(),
                overallScore,
                overallRating,
                summary,
                responseJson
        );

        ResumeAnalysis saved = resumeAnalysisRepository.save(entity);
        log.info("Successfully persisted AI resume analysis id={} for resumeId={} with overallScore={}",
                saved.getId(), resumeId, overallScore);

        return new ResumeAnalysisDto(
                saved.getId(),
                saved.getResumeId(),
                saved.getVersionId(),
                saved.getProvider(),
                saved.getModel(),
                saved.getOverallScore(),
                saved.getOverallRating(),
                saved.getSummary(),
                rootNode,
                saved.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeAnalysisSummaryDto> getAnalysisHistory(UUID userId, UUID resumeId) {
        // Enforce document ownership
        if (!resumeDocumentRepository.existsByIdAndUserId(resumeId, userId)) {
            throw new ResourceNotFoundException("Resume document not found with id: " + resumeId);
        }

        List<ResumeAnalysis> analyses = resumeAnalysisRepository.findByResumeIdAndUserIdOrderByCreatedAtDesc(resumeId, userId);
        return analyses.stream()
                .map(a -> new ResumeAnalysisSummaryDto(
                        a.getId(),
                        a.getResumeId(),
                        a.getVersionId(),
                        a.getProvider(),
                        a.getModel(),
                        a.getOverallScore(),
                        a.getOverallRating(),
                        a.getSummary(),
                        a.getCreatedAt()
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeAnalysisDto getAnalysisDetails(UUID userId, UUID analysisId) {
        ResumeAnalysis entity = resumeAnalysisRepository.findByIdAndUserId(analysisId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume analysis report not found with id: " + analysisId));

        JsonNode reportNode;
        try {
            reportNode = objectMapper.readTree(entity.getAnalysisJson());
        } catch (Exception ex) {
            log.error("Failed to deserialize saved analysis JSON for id={}: {}", analysisId, ex.getMessage());
            reportNode = objectMapper.createObjectNode();
        }

        return new ResumeAnalysisDto(
                entity.getId(),
                entity.getResumeId(),
                entity.getVersionId(),
                entity.getProvider(),
                entity.getModel(),
                entity.getOverallScore(),
                entity.getOverallRating(),
                entity.getSummary(),
                reportNode,
                entity.getCreatedAt()
        );
    }
}
