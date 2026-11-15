package ai.jobachiever.resumes.controller;

import ai.jobachiever.common.response.ApiResponse;
import ai.jobachiever.common.security.CurrentUserService;
import ai.jobachiever.resumes.dto.ResumeResponse;
import ai.jobachiever.resumes.dto.ResumeVersionResponse;
import ai.jobachiever.resumes.dto.UpdateResumeRequest;
import ai.jobachiever.resumes.entity.ProcessingStatus;
import ai.jobachiever.resumes.entity.ResumeVersion;
import ai.jobachiever.resumes.service.ResumeService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller managing resume documents, secure file uploads, downloads,
 * in-browser previews, revision tracking, and primary resume selection under /api/v1/resumes.
 */
@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final CurrentUserService currentUserService;

    public ResumeController(ResumeService resumeService, CurrentUserService currentUserService) {
        this.resumeService = resumeService;
        this.currentUserService = currentUserService;
    }

    /**
     * Upload a new resume document with multipart/form-data.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResumeResponse>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "displayName", required = false) String displayName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "careerTrackId", required = false) UUID careerTrackId,
            @RequestParam(value = "templateIdentifier", required = false) String templateIdentifier) {

        UUID userId = currentUserService.requireActiveUser().getId();
        String effectiveTitle = (title != null && !title.isBlank()) ? title : displayName;

        ResumeResponse response = resumeService.uploadResume(userId, file, effectiveTitle, description, careerTrackId, templateIdentifier);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Resume uploaded successfully"));
    }

    /**
     * List authenticated user's resumes with optional pagination, search, and filtering.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ResumeResponse>>> listResumes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String fileType,
            @RequestParam(required = false) UUID careerTrackId,
            @RequestParam(required = false) ProcessingStatus status,
            @RequestParam(required = false) String sort) {

        UUID userId = currentUserService.requireActiveUser().getId();
        Page<ResumeResponse> response = resumeService.listResumes(userId, page, size, search, fileType, careerTrackId, status, sort);
        return ResponseEntity.ok(ApiResponse.ok(response, "Resumes retrieved successfully"));
    }

    /**
     * Retrieve document metadata by resume ID.
     */
    @GetMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<ResumeResponse>> getResume(@PathVariable UUID resumeId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        ResumeResponse response = resumeService.getResume(userId, resumeId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Resume metadata retrieved successfully"));
    }

    /**
     * Securely download document binary.
     */
    @GetMapping("/{resumeId}/download")
    public ResponseEntity<Resource> downloadResume(
            @PathVariable UUID resumeId,
            @RequestParam(required = false) Integer versionNumber) {

        UUID userId = currentUserService.requireActiveUser().getId();
        ResumeVersion version = resumeService.getVersionForDocument(userId, resumeId, versionNumber);
        Resource resource = resumeService.downloadResume(userId, resumeId, versionNumber);

        String safeFilename = sanitizeFilename(version.getFileName());
        ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename(safeFilename)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .contentType(MediaType.parseMediaType(version.getMimeType()))
                .contentLength(version.getFileSizeBytes())
                .body(resource);
    }

    /**
     * Provide secure access for browser in-line preview.
     */
    @GetMapping("/{resumeId}/preview")
    public ResponseEntity<Resource> previewResume(
            @PathVariable UUID resumeId,
            @RequestParam(required = false) Integer versionNumber) {

        UUID userId = currentUserService.requireActiveUser().getId();
        ResumeVersion version = resumeService.getVersionForDocument(userId, resumeId, versionNumber);
        Resource resource = resumeService.previewResume(userId, resumeId, versionNumber);

        String safeFilename = sanitizeFilename(version.getFileName());
        ContentDisposition contentDisposition = ContentDisposition.inline()
                .filename(safeFilename)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .header("Content-Security-Policy", "default-src 'none'")
                .contentType(MediaType.parseMediaType(version.getMimeType()))
                .contentLength(version.getFileSizeBytes())
                .body(resource);
    }

    /**
     * Update editable metadata.
     */
    @PatchMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<ResumeResponse>> updateResume(
            @PathVariable UUID resumeId,
            @Valid @RequestBody UpdateResumeRequest request) {

        UUID userId = currentUserService.requireActiveUser().getId();
        ResumeResponse response = resumeService.updateResume(userId, resumeId, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Resume metadata updated successfully"));
    }

    /**
     * Delete a document safely.
     */
    @DeleteMapping("/{resumeId}")
    public ResponseEntity<Void> deleteResume(@PathVariable UUID resumeId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        resumeService.deleteResume(userId, resumeId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Upload a new version of an existing resume document.
     */
    @PostMapping(value = "/{resumeId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResumeVersionResponse>> uploadNewVersion(
            @PathVariable UUID resumeId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "templateIdentifier", required = false) String templateIdentifier) {

        UUID userId = currentUserService.requireActiveUser().getId();
        ResumeVersionResponse response = resumeService.uploadNewVersion(userId, resumeId, file, description, templateIdentifier);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "New resume version uploaded successfully"));
    }

    /**
     * List version history for a resume document.
     */
    @GetMapping("/{resumeId}/versions")
    public ResponseEntity<ApiResponse<List<ResumeVersionResponse>>> getVersionHistory(@PathVariable UUID resumeId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        List<ResumeVersionResponse> response = resumeService.getVersionHistory(userId, resumeId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Version history retrieved successfully"));
    }

    /**
     * Designate a resume as the user's primary master resume.
     */
    @PatchMapping("/{resumeId}/primary")
    public ResponseEntity<ApiResponse<ResumeResponse>> setPrimaryResume(@PathVariable UUID resumeId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        ResumeResponse response = resumeService.setPrimaryResume(userId, resumeId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Primary resume updated successfully"));
    }

    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "resume.pdf";
        }
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
