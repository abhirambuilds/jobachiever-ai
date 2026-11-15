package ai.jobachiever.ai.service;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.ParsedResumeDto;
import ai.jobachiever.ai.exception.AIServiceException;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.common.security.ResourceOwnershipService;
import ai.jobachiever.resumes.entity.ProcessingStatus;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;
import ai.jobachiever.resumes.repository.ResumeDocumentRepository;
import ai.jobachiever.resumes.repository.ResumeVersionRepository;
import ai.jobachiever.resumes.storage.FileStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.UUID;

@Service
public class ResumeParsingServiceImpl implements ResumeParsingService {

    private static final Logger log = LoggerFactory.getLogger(ResumeParsingServiceImpl.class);

    private final ResourceOwnershipService ownershipService;
    private final ResumeDocumentRepository documentRepository;
    private final ResumeVersionRepository versionRepository;
    private final FileStorageService fileStorageService;
    private final AIServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public ResumeParsingServiceImpl(
            ResourceOwnershipService ownershipService,
            ResumeDocumentRepository documentRepository,
            ResumeVersionRepository versionRepository,
            FileStorageService fileStorageService,
            AIServiceClient aiServiceClient,
            ObjectMapper objectMapper) {
        this.ownershipService = ownershipService;
        this.documentRepository = documentRepository;
        this.versionRepository = versionRepository;
        this.fileStorageService = fileStorageService;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public ParsedResumeDto parseResumeDocument(UUID documentId, UUID userId) {
        // 1. Verify user ownership
        ResumeDocument document = ownershipService.verifyResumeDocumentOwnership(documentId, userId);

        ResumeVersion currentVersion = document.getCurrentVersion();
        if (currentVersion == null) {
            currentVersion = versionRepository.findFirstByDocumentIdOrderByVersionNumberDesc(documentId)
                    .orElseThrow(() -> new ResourceNotFoundException("No resume version found for document: " + documentId));
        }

        String storageKey = currentVersion.getStorageKey();
        if (storageKey == null || storageKey.isBlank()) {
            throw new AIServiceException("Resume document version has no associated storage key");
        }

        // 2. Retrieve document binary from isolated storage
        Resource fileResource = fileStorageService.retrieve(storageKey);
        byte[] fileBytes;
        try (InputStream is = fileResource.getInputStream()) {
            fileBytes = is.readAllBytes();
        } catch (Exception e) {
            log.error("Failed to read stored resume file from storage key: {}", storageKey, e);
            throw new AIServiceException("Failed to read resume file from storage: " + e.getMessage(), e);
        }

        // 3. Dispatch to FastAPI AI microservice
        ParsedResumeDto parsedDto = aiServiceClient.parseResume(
                fileBytes,
                currentVersion.getFileName(),
                currentVersion.getMimeType()
        );

        // 4. Save parsed JSON in resume_versions without automatically altering Master Career Profile
        try {
            String jsonContent = objectMapper.writeValueAsString(parsedDto);
            currentVersion.setParsedContent(jsonContent);
            currentVersion.setProcessingStatus(ProcessingStatus.PARSED);
            versionRepository.save(currentVersion);
        } catch (Exception e) {
            log.warn("Could not serialize parsed resume structure to version JSONB: {}", e.getMessage());
        }

        log.info("Successfully parsed resume document {} for user {}. Extracted {} skills, {} experiences.",
                documentId, userId, parsedDto.getSkills().size(), parsedDto.getExperience().size());

        return parsedDto;
    }
}
