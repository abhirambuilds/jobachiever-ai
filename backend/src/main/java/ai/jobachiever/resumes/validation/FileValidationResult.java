package ai.jobachiever.resumes.validation;

/**
 * Result record containing validated document metadata and integrity attributes.
 */
public record FileValidationResult(
        String originalFilename,
        String sanitizedFilename,
        String extension,
        String mimeType,
        long fileSizeBytes,
        String sha256Checksum,
        byte[] content
) {
}
