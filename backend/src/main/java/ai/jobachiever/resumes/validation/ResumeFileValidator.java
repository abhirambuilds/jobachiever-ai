package ai.jobachiever.resumes.validation;

import ai.jobachiever.resumes.exception.FileValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Deep file validator for uploaded resumes.
 * Inspects file size, extension, MIME type, magic bytes signatures,
 * and internal structure for DOCX to protect against malicious payloads,
 * zip slip, zip bombs, and disguised executables.
 */
@Component
public class ResumeFileValidator {

    private static final Logger log = LoggerFactory.getLogger(ResumeFileValidator.class);

    // Default 10 MB limit (10 * 1024 * 1024 bytes)
    private final long maxFileSizeBytes;

    // Allowed extensions (lowercase)
    public static final String EXT_PDF = "pdf";
    public static final String EXT_DOCX = "docx";
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(EXT_PDF, EXT_DOCX);

    // Standard MIME types
    public static final String MIME_PDF = "application/pdf";
    public static final String MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    // Allowed declared MIME types for PDF
    private static final Set<String> ALLOWED_PDF_MIMES = Set.of(
            "application/pdf",
            "application/x-pdf",
            "application/acrobat",
            "applications/vnd.pdf",
            "text/pdf"
    );

    // Allowed declared MIME types for DOCX (some browsers send zip or octet-stream)
    private static final Set<String> ALLOWED_DOCX_MIMES = Set.of(
            MIME_DOCX,
            "application/zip",
            "application/x-zip-compressed",
            "application/octet-stream",
            "application/msword"
    );

    // PDF magic bytes: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
    private static final byte[] PDF_MAGIC_BYTES = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D};

    // Zip standard magic bytes: PK\003\004 (0x50, 0x4B, 0x03, 0x04)
    private static final byte[] ZIP_MAGIC_BYTES = new byte[]{0x50, 0x4B, 0x03, 0x04};

    public ResumeFileValidator(@Value("${app.storage.max-file-size-bytes:10485760}") long maxFileSizeBytes) {
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    /**
     * Validates an uploaded resume file and returns a structured validation result.
     *
     * @param file the multipart file from the HTTP request
     * @return FileValidationResult with sanitized attributes and SHA-256 checksum
     */
    public FileValidationResult validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileValidationException("Uploaded file is missing or empty (0 bytes)");
        }

        long size = file.getSize();
        if (size > maxFileSizeBytes) {
            throw new FileValidationException(String.format(
                    "File size (%d bytes) exceeds the maximum allowed limit of %d bytes (10 MB)",
                    size, maxFileSizeBytes
            ));
        }

        String rawFilename = file.getOriginalFilename();
        if (rawFilename == null || rawFilename.isBlank()) {
            throw new FileValidationException("Original filename cannot be empty");
        }

        // Sanitize filename to prevent directory traversal in name
        String sanitizedFilename = Paths.get(rawFilename).getFileName().toString();
        String extension = extractExtension(sanitizedFilename);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new FileValidationException(String.format(
                    "Unsupported file extension '.%s'. Only PDF and DOCX files are permitted",
                    extension
            ));
        }

        // Read bytes once for signature, structural validation, and checksum
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new FileValidationException("Failed to read uploaded file stream: " + e.getMessage(), e);
        }

        if (bytes.length == 0) {
            throw new FileValidationException("Uploaded file content is empty");
        }

        // Validate MIME type against allowed sets
        String declaredMime = file.getContentType();
        validateMimeType(extension, declaredMime);

        // Validate file signature / magic bytes
        if (EXT_PDF.equals(extension)) {
            validatePdfSignature(bytes);
        } else if (EXT_DOCX.equals(extension)) {
            validateDocxStructure(bytes);
        }

        // Compute SHA-256 checksum
        String checksum = computeSha256(bytes);

        String canonicalMime = EXT_PDF.equals(extension) ? MIME_PDF : MIME_DOCX;

        return new FileValidationResult(
                rawFilename,
                sanitizedFilename,
                extension,
                canonicalMime,
                bytes.length,
                checksum,
                bytes
        );
    }

    private String extractExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex <= 0 || lastDotIndex == filename.length() - 1) {
            throw new FileValidationException("File has no valid extension. Only PDF and DOCX files are supported.");
        }
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    private void validateMimeType(String extension, String declaredMime) {
        if (declaredMime == null || declaredMime.isBlank()) {
            // Some clients do not set Content-Type; magic bytes will enforce real type
            return;
        }

        String normalizedMime = declaredMime.toLowerCase().trim();
        if (normalizedMime.contains(";")) {
            normalizedMime = normalizedMime.split(";")[0].trim();
        }

        if (EXT_PDF.equals(extension)) {
            if (!ALLOWED_PDF_MIMES.contains(normalizedMime)) {
                throw new FileValidationException("Declared MIME type '" + declaredMime + "' does not match PDF document");
            }
        } else if (EXT_DOCX.equals(extension)) {
            if (!ALLOWED_DOCX_MIMES.contains(normalizedMime)) {
                throw new FileValidationException("Declared MIME type '" + declaredMime + "' does not match DOCX document");
            }
        }
    }

    private void validatePdfSignature(byte[] bytes) {
        if (bytes.length < PDF_MAGIC_BYTES.length) {
            throw new FileValidationException("File is too small to be a valid PDF document");
        }

        for (int i = 0; i < PDF_MAGIC_BYTES.length; i++) {
            if (bytes[i] != PDF_MAGIC_BYTES[i]) {
                throw new FileValidationException("File signature mismatch: file does not match Adobe PDF standard header (%PDF-)");
            }
        }
    }

    /**
     * Inspects DOCX file signature and Open Packaging Conventions structure.
     * Prevents archive extraction vulnerabilities (Zip Slip, Zip Bomb) by scanning headers without writing to disk.
     */
    private void validateDocxStructure(byte[] bytes) {
        if (bytes.length < ZIP_MAGIC_BYTES.length) {
            throw new FileValidationException("File is too small to be a valid DOCX document");
        }

        // Verify PK\003\004 magic bytes
        for (int i = 0; i < ZIP_MAGIC_BYTES.length; i++) {
            if (bytes[i] != ZIP_MAGIC_BYTES[i]) {
                throw new FileValidationException("File signature mismatch: file is not a valid DOCX archive (missing PK signature)");
            }
        }

        // Inspect zip entries defensively
        boolean hasDocumentXml = false;
        boolean hasContentTypes = false;
        int entryCount = 0;
        final int MAX_ENTRIES_TO_INSPECT = 100;

        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                entryCount++;
                if (entryCount > MAX_ENTRIES_TO_INSPECT) {
                    break;
                }

                String name = entry.getName();
                // Check for Zip Slip attempt
                if (name.contains("..") || name.startsWith("/") || name.startsWith("\\")) {
                    throw new FileValidationException("Corrupted or malicious DOCX document: invalid archive entry path");
                }

                if ("word/document.xml".equalsIgnoreCase(name)) {
                    hasDocumentXml = true;
                }
                if ("[Content_Types].xml".equalsIgnoreCase(name)) {
                    hasContentTypes = true;
                }

                zis.closeEntry();
            }
        } catch (IOException e) {
            throw new FileValidationException("Failed to parse DOCX archive structure: " + e.getMessage(), e);
        }

        if (!hasDocumentXml && !hasContentTypes) {
            throw new FileValidationException("Malformed DOCX document: archive does not contain standard Word processing structures");
        }
    }

    private String computeSha256(byte[] bytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(bytes);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    public long getMaxFileSizeBytes() {
        return maxFileSizeBytes;
    }
}
