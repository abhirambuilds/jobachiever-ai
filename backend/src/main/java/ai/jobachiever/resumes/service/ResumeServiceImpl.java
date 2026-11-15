package ai.jobachiever.resumes.service;

import ai.jobachiever.careertracks.entity.CareerTrack;
import ai.jobachiever.careertracks.repository.CareerTrackRepository;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.resumes.dto.ResumeResponse;
import ai.jobachiever.resumes.dto.ResumeVersionResponse;
import ai.jobachiever.resumes.dto.UpdateResumeRequest;
import ai.jobachiever.resumes.entity.DocumentType;
import ai.jobachiever.resumes.entity.ProcessingStatus;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;
import ai.jobachiever.resumes.repository.ResumeDocumentRepository;
import ai.jobachiever.resumes.repository.ResumeVersionRepository;
import ai.jobachiever.resumes.storage.FileStorageService;
import ai.jobachiever.resumes.validation.FileValidationResult;
import ai.jobachiever.resumes.validation.ResumeFileValidator;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ResumeServiceImpl implements ResumeService {

    private static final Logger log = LoggerFactory.getLogger(ResumeServiceImpl.class);

    private final ResumeDocumentRepository resumeDocumentRepository;
    private final ResumeVersionRepository resumeVersionRepository;
    private final UserRepository userRepository;
    private final CareerTrackRepository careerTrackRepository;
    private final FileStorageService fileStorageService;
    private final ResumeFileValidator resumeFileValidator;

    public ResumeServiceImpl(ResumeDocumentRepository resumeDocumentRepository,
                             ResumeVersionRepository resumeVersionRepository,
                             UserRepository userRepository,
                             CareerTrackRepository careerTrackRepository,
                             FileStorageService fileStorageService,
                             ResumeFileValidator resumeFileValidator) {
        this.resumeDocumentRepository = resumeDocumentRepository;
        this.resumeVersionRepository = resumeVersionRepository;
        this.userRepository = userRepository;
        this.careerTrackRepository = careerTrackRepository;
        this.fileStorageService = fileStorageService;
        this.resumeFileValidator = resumeFileValidator;
    }

    @Override
    public ResumeResponse uploadResume(UUID userId, MultipartFile file, String title, String description, UUID careerTrackId, String templateIdentifier) {
        // 1. Deep file validation (size, extension, mime, magic bytes, structure, checksum)
        FileValidationResult validation = resumeFileValidator.validate(file);

        // 2. Fetch authenticated user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 3. Verify career track ownership if supplied
        CareerTrack careerTrack = null;
        if (careerTrackId != null) {
            careerTrack = careerTrackRepository.findByIdAndUserId(careerTrackId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Career track not found or does not belong to user: " + careerTrackId));
        }

        // 4. Resolve title
        String resolvedTitle = (title != null && !title.isBlank())
                ? title.trim()
                : extractDefaultTitle(validation.sanitizedFilename());

        // 5. Determine primary resume status
        boolean shouldBePrimary = resumeDocumentRepository.countByUserId(userId) == 0;

        // 6. Generate secure internal storage key
        String storageKey = userId + "/" + UUID.randomUUID() + "." + validation.extension();

        // 7. Store file binary using storage service
        fileStorageService.store(new ByteArrayInputStream(validation.content()), storageKey);

        // 8. Transaction-aware database persistence with compensating cleanup on failure
        try {
            ResumeDocument doc = new ResumeDocument();
            doc.setUser(user);
            doc.setTitle(resolvedTitle);
            doc.setDescription(description != null ? description.trim() : null);
            doc.setCareerTrack(careerTrack);
            doc.setDocumentType(DocumentType.UPLOADED);
            doc.setPrimary(shouldBePrimary);

            ResumeDocument savedDoc = resumeDocumentRepository.save(doc);

            ResumeVersion version = new ResumeVersion();
            version.setDocument(savedDoc);
            version.setVersionNumber(1);
            version.setStoragePath(storageKey);
            version.setStorageKey(storageKey);
            version.setFileName(validation.sanitizedFilename());
            version.setMimeType(validation.mimeType());
            version.setFileSizeBytes(validation.fileSizeBytes());
            version.setSha256Checksum(validation.sha256Checksum());
            version.setProcessingStatus(ProcessingStatus.READY);
            version.setTemplateIdentifier(templateIdentifier);

            ResumeVersion savedVersion = resumeVersionRepository.save(version);

            savedDoc.setCurrentVersion(savedVersion);
            savedDoc = resumeDocumentRepository.save(savedDoc);

            log.info("Successfully uploaded resume '{}' (id: {}) for user {}", savedDoc.getTitle(), savedDoc.getId(), userId);
            return ResumeResponse.fromEntity(savedDoc);
        } catch (Exception ex) {
            log.error("Database persistence failed for resume upload. Performing compensating storage cleanup: {}", storageKey, ex);
            fileStorageService.delete(storageKey);
            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResumeResponse> listResumes(UUID userId, int page, int size, String search, String fileType, UUID careerTrackId, ProcessingStatus status, String sort) {
        Pageable pageable = buildPageable(page, size, sort);

        Specification<ResumeDocument> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (careerTrackId != null) {
                predicates.add(cb.equal(root.get("careerTrack").get("id"), careerTrackId));
            }

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titlePredicate = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate filenamePredicate = cb.like(cb.lower(root.get("currentVersion").get("fileName")), searchPattern);
                predicates.add(cb.or(titlePredicate, filenamePredicate));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("currentVersion").get("processingStatus"), status));
            }

            if (fileType != null && !fileType.isBlank()) {
                String normalizedType = fileType.trim().toLowerCase().replace(".", "");
                if ("pdf".equals(normalizedType)) {
                    predicates.add(cb.equal(root.get("currentVersion").get("mimeType"), ResumeFileValidator.MIME_PDF));
                } else if ("docx".equals(normalizedType)) {
                    predicates.add(cb.equal(root.get("currentVersion").get("mimeType"), ResumeFileValidator.MIME_DOCX));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ResumeDocument> documents = resumeDocumentRepository.findAll(spec, pageable);
        return documents.map(ResumeResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeResponse getResume(UUID userId, UUID resumeId) {
        ResumeDocument doc = findDocumentOrThrow(userId, resumeId);
        return ResumeResponse.fromEntity(doc);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadResume(UUID userId, UUID resumeId, Integer versionNumber) {
        ResumeVersion version = getVersionForDocument(userId, resumeId, versionNumber);
        return fileStorageService.retrieve(version.getStorageKey());
    }

    @Override
    @Transactional(readOnly = true)
    public Resource previewResume(UUID userId, UUID resumeId, Integer versionNumber) {
        ResumeVersion version = getVersionForDocument(userId, resumeId, versionNumber);
        return fileStorageService.retrieve(version.getStorageKey());
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeVersion getVersionForDocument(UUID userId, UUID resumeId, Integer versionNumber) {
        ResumeDocument doc = findDocumentOrThrow(userId, resumeId);

        if (versionNumber == null) {
            ResumeVersion current = doc.getCurrentVersion();
            if (current != null) {
                return current;
            }
            return resumeVersionRepository.findFirstByDocumentIdOrderByVersionNumberDesc(resumeId)
                    .orElseThrow(() -> new ResourceNotFoundException("No versions found for resume: " + resumeId));
        }

        return resumeVersionRepository.findByDocumentIdAndVersionNumber(resumeId, versionNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Version " + versionNumber + " not found for resume: " + resumeId));
    }

    @Override
    public ResumeResponse updateResume(UUID userId, UUID resumeId, UpdateResumeRequest request) {
        ResumeDocument doc = findDocumentOrThrow(userId, resumeId);

        if (request.title() != null && !request.title().isBlank()) {
            doc.setTitle(request.title().trim());
        }

        if (request.description() != null) {
            doc.setDescription(request.description().trim());
        }

        if (request.careerTrackId() != null) {
            CareerTrack careerTrack = careerTrackRepository.findByIdAndUserId(request.careerTrackId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Career track not found or does not belong to user: " + request.careerTrackId()));
            doc.setCareerTrack(careerTrack);
        }

        ResumeDocument saved = resumeDocumentRepository.save(doc);
        log.info("Updated resume metadata for id: {}", resumeId);
        return ResumeResponse.fromEntity(saved);
    }

    @Override
    public void deleteResume(UUID userId, UUID resumeId) {
        ResumeDocument doc = findDocumentOrThrow(userId, resumeId);
        boolean wasPrimary = doc.isPrimary();

        List<ResumeVersion> versions = resumeVersionRepository.findAllByDocumentIdOrderByVersionNumberDesc(resumeId);

        // Delete from database
        resumeDocumentRepository.delete(doc);

        // Remove files from storage
        for (ResumeVersion version : versions) {
            fileStorageService.delete(version.getStorageKey());
        }

        // If deleted document was primary, promote remaining active resume to primary
        if (wasPrimary) {
            resumeDocumentRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId)
                    .ifPresent(remaining -> {
                        remaining.setPrimary(true);
                        resumeDocumentRepository.save(remaining);
                        log.info("Promoted resume id: {} to primary after deleting previous primary", remaining.getId());
                    });
        }

        log.info("Successfully deleted resume id: {} and {} associated version files for user: {}", resumeId, versions.size(), userId);
    }

    @Override
    public ResumeVersionResponse uploadNewVersion(UUID userId, UUID resumeId, MultipartFile file, String description, String templateIdentifier) {
        ResumeDocument doc = findDocumentOrThrow(userId, resumeId);

        // Validate new file
        FileValidationResult validation = resumeFileValidator.validate(file);

        int nextVersionNumber = resumeVersionRepository.findMaxVersionNumber(resumeId) + 1;
        String storageKey = userId + "/" + UUID.randomUUID() + "." + validation.extension();

        fileStorageService.store(new ByteArrayInputStream(validation.content()), storageKey);

        try {
            ResumeVersion newVersion = new ResumeVersion();
            newVersion.setDocument(doc);
            newVersion.setVersionNumber(nextVersionNumber);
            newVersion.setStoragePath(storageKey);
            newVersion.setStorageKey(storageKey);
            newVersion.setFileName(validation.sanitizedFilename());
            newVersion.setMimeType(validation.mimeType());
            newVersion.setFileSizeBytes(validation.fileSizeBytes());
            newVersion.setSha256Checksum(validation.sha256Checksum());
            newVersion.setProcessingStatus(ProcessingStatus.READY);
            newVersion.setTemplateIdentifier(templateIdentifier);

            ResumeVersion savedVersion = resumeVersionRepository.save(newVersion);

            doc.setCurrentVersion(savedVersion);
            if (description != null && !description.isBlank()) {
                doc.setDescription(description.trim());
            }
            resumeDocumentRepository.save(doc);

            log.info("Uploaded new version {} for resume id: {}", nextVersionNumber, resumeId);
            return ResumeVersionResponse.fromEntity(savedVersion);
        } catch (Exception ex) {
            log.error("Compensating cleanup: deleting stored file for failed version upload: {}", storageKey, ex);
            fileStorageService.delete(storageKey);
            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeVersionResponse> getVersionHistory(UUID userId, UUID resumeId) {
        if (!resumeDocumentRepository.existsByIdAndUserId(resumeId, userId)) {
            throw new ResourceNotFoundException("Resume not found with id: " + resumeId);
        }

        List<ResumeVersion> versions = resumeVersionRepository.findAllByDocumentIdOrderByVersionNumberDesc(resumeId);
        return versions.stream()
                .map(ResumeVersionResponse::fromEntity)
                .toList();
    }

    @Override
    public ResumeResponse setPrimaryResume(UUID userId, UUID resumeId) {
        ResumeDocument targetDoc = findDocumentOrThrow(userId, resumeId);

        // Un-set existing primary resumes
        List<ResumeDocument> primaries = resumeDocumentRepository.findAllByUserIdAndPrimaryTrue(userId);
        for (ResumeDocument primary : primaries) {
            if (!primary.getId().equals(resumeId)) {
                primary.setPrimary(false);
                resumeDocumentRepository.save(primary);
            }
        }

        targetDoc.setPrimary(true);
        ResumeDocument saved = resumeDocumentRepository.save(targetDoc);
        log.info("Set resume id: {} as primary for user: {}", resumeId, userId);
        return ResumeResponse.fromEntity(saved);
    }

    private ResumeDocument findDocumentOrThrow(UUID userId, UUID resumeId) {
        return resumeDocumentRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));
    }

    private String extractDefaultTitle(String filename) {
        if (filename == null) return "Untitled Resume";
        int lastDot = filename.lastIndexOf('.');
        String base = (lastDot > 0) ? filename.substring(0, lastDot) : filename;
        return base.replace('_', ' ').replace('-', ' ').trim();
    }

    private Pageable buildPageable(int page, int size, String sort) {
        Sort sortObj = Sort.by(Sort.Direction.DESC, "createdAt");

        if (sort != null && !sort.isBlank()) {
            if (sort.equalsIgnoreCase("title,asc") || sort.equalsIgnoreCase("name_asc")) {
                sortObj = Sort.by(Sort.Direction.ASC, "title");
            } else if (sort.equalsIgnoreCase("title,desc") || sort.equalsIgnoreCase("name_desc")) {
                sortObj = Sort.by(Sort.Direction.DESC, "title");
            } else if (sort.equalsIgnoreCase("updatedAt,desc") || sort.equalsIgnoreCase("recent_update")) {
                sortObj = Sort.by(Sort.Direction.DESC, "updatedAt");
            } else if (sort.equalsIgnoreCase("createdAt,asc") || sort.equalsIgnoreCase("oldest")) {
                sortObj = Sort.by(Sort.Direction.ASC, "createdAt");
            }
        }

        return PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 100), sortObj);
    }
}
