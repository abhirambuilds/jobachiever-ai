package ai.jobachiever.resumes.dto;

import ai.jobachiever.resumes.entity.DocumentType;
import ai.jobachiever.resumes.entity.ProcessingStatus;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;

import java.time.Instant;
import java.util.UUID;

/**
 * Public response DTO for a Resume Document.
 * Completely encapsulates private storage paths, presenting only safe metadata.
 */
public record ResumeResponse(
        UUID id,
        UUID userId,
        UUID careerTrackId,
        String careerTrackName,
        String title,
        String description,
        DocumentType documentType,
        boolean isPrimary,
        int currentVersionNumber,
        UUID currentVersionId,
        String originalFilename,
        String mimeType,
        String fileExtension,
        long fileSizeBytes,
        String sha256Checksum,
        ProcessingStatus processingStatus,
        Instant createdAt,
        Instant updatedAt
) {
    public static ResumeResponse fromEntity(ResumeDocument doc) {
        ResumeVersion version = doc.getCurrentVersion();

        UUID trackId = doc.getCareerTrack() != null ? doc.getCareerTrack().getId() : null;
        String trackName = doc.getCareerTrack() != null ? doc.getCareerTrack().getName() : null;

        int verNum = version != null ? version.getVersionNumber() : 1;
        UUID verId = version != null ? version.getId() : null;
        String origName = version != null ? version.getFileName() : doc.getTitle();
        String mime = version != null ? version.getMimeType() : "application/pdf";
        String ext = origName.contains(".") ? origName.substring(origName.lastIndexOf('.') + 1).toLowerCase() : "pdf";
        long size = version != null ? version.getFileSizeBytes() : 0L;
        String checksum = version != null ? version.getSha256Checksum() : "";
        ProcessingStatus status = version != null ? version.getProcessingStatus() : ProcessingStatus.READY;

        return new ResumeResponse(
                doc.getId(),
                doc.getUser().getId(),
                trackId,
                trackName,
                doc.getTitle(),
                doc.getDescription(),
                doc.getDocumentType(),
                doc.isPrimary(),
                verNum,
                verId,
                origName,
                mime,
                ext,
                size,
                checksum,
                status,
                doc.getCreatedAt(),
                doc.getUpdatedAt()
        );
    }
}
