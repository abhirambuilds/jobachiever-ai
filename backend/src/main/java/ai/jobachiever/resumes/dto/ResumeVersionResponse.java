package ai.jobachiever.resumes.dto;

import ai.jobachiever.resumes.entity.ProcessingStatus;
import ai.jobachiever.resumes.entity.ResumeVersion;

import java.time.Instant;
import java.util.UUID;

/**
 * Public response DTO for a historical version of a Resume Document.
 * Excludes physical storage keys and storage paths.
 */
public record ResumeVersionResponse(
        UUID id,
        UUID documentId,
        int versionNumber,
        String fileName,
        String mimeType,
        long fileSizeBytes,
        String sha256Checksum,
        ProcessingStatus processingStatus,
        String templateIdentifier,
        Instant createdAt
) {
    public static ResumeVersionResponse fromEntity(ResumeVersion version) {
        return new ResumeVersionResponse(
                version.getId(),
                version.getDocument().getId(),
                version.getVersionNumber(),
                version.getFileName(),
                version.getMimeType(),
                version.getFileSizeBytes(),
                version.getSha256Checksum(),
                version.getProcessingStatus(),
                version.getTemplateIdentifier(),
                version.getCreatedAt()
        );
    }
}
