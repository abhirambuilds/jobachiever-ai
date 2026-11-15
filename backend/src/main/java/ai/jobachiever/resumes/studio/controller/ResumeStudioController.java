package ai.jobachiever.resumes.studio.controller;

import ai.jobachiever.common.response.ApiResponse;
import ai.jobachiever.common.security.CurrentUserService;
import ai.jobachiever.resumes.studio.dto.ResumeStudioRequest;
import ai.jobachiever.resumes.studio.dto.ResumeStudioResponseDto;
import ai.jobachiever.resumes.studio.service.ResumeStudioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller exposing endpoints for the AI-powered Resume Studio writing assistant.
 * Supports /api/v1/studio and /api/v1/resumes/studio.
 */
@RestController
@RequestMapping({"/api/v1/studio", "/api/v1/resumes/studio"})
public class ResumeStudioController {

    private final ResumeStudioService resumeStudioService;
    private final CurrentUserService currentUserService;

    public ResumeStudioController(ResumeStudioService resumeStudioService, CurrentUserService currentUserService) {
        this.resumeStudioService = resumeStudioService;
        this.currentUserService = currentUserService;
    }

    /**
     * Generates rewritten sentences, improved bullet points, summaries, and tailoring recommendations.
     */
    @PostMapping({"/generate", "/rewrite"})
    public ResponseEntity<ApiResponse<ResumeStudioResponseDto>> generateEnhancement(
            @Valid @RequestBody ResumeStudioRequest request) {
        UUID userId = currentUserService.requireActiveUser().getId();
        ResumeStudioResponseDto response = resumeStudioService.enhanceContent(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Resume studio suggestions generated successfully"));
    }
}
