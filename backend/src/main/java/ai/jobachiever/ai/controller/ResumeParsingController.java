package ai.jobachiever.ai.controller;

import ai.jobachiever.ai.dto.ParsedResumeDto;
import ai.jobachiever.ai.service.ResumeParsingService;
import ai.jobachiever.auth.security.UserPrincipal;
import ai.jobachiever.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeParsingController {

    private final ResumeParsingService resumeParsingService;

    public ResumeParsingController(ResumeParsingService resumeParsingService) {
        this.resumeParsingService = resumeParsingService;
    }

    /**
     * Triggers AI parsing and structural extraction for an uploaded resume document.
     * Enforces authenticated user ownership, dispatches to FastAPI, and returns
     * extracted unverified career data for user confirmation.
     *
     * @param documentId UUID of the resume document
     * @param principal  the authenticated user
     * @return structured, unverified candidate profile data
     */
    @PostMapping("/{documentId}/parse")
    public ResponseEntity<ApiResponse<ParsedResumeDto>> parseResume(
            @PathVariable UUID documentId,
            @AuthenticationPrincipal UserPrincipal principal) {

        ParsedResumeDto response = resumeParsingService.parseResumeDocument(documentId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(response, "Resume parsed successfully. Review extracted fields before confirming."));
    }
}
