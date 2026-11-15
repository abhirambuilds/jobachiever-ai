package ai.jobachiever.resumes.controller;

import ai.jobachiever.common.response.ApiResponse;
import ai.jobachiever.common.security.CurrentUserService;
import ai.jobachiever.resumes.dto.ResumeAnalysisDto;
import ai.jobachiever.resumes.dto.ResumeAnalysisSummaryDto;
import ai.jobachiever.resumes.service.ResumeAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for triggering and retrieving AI-powered resume analyses,
 * historical reports, and evidence-grounded critiques under /api/v1/resumes.
 */
@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeAnalysisController {

    private final ResumeAnalysisService resumeAnalysisService;
    private final CurrentUserService currentUserService;

    public ResumeAnalysisController(ResumeAnalysisService resumeAnalysisService, CurrentUserService currentUserService) {
        this.resumeAnalysisService = resumeAnalysisService;
        this.currentUserService = currentUserService;
    }

    /**
     * Triggers comprehensive AI analysis on an uploaded resume document.
     * Enforces user ownership, mandatory consent verification, and zero-fabrication guardrails.
     *
     * @param resumeId UUID of the resume to analyze
     * @return complete ResumeAnalysisDto
     */
    @PostMapping("/{resumeId}/analyze")
    public ResponseEntity<ApiResponse<ResumeAnalysisDto>> analyzeResume(@PathVariable UUID resumeId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        ResumeAnalysisDto analysis = resumeAnalysisService.analyzeResume(userId, resumeId);
        return ResponseEntity.ok(ApiResponse.ok(analysis, "Resume analysis completed successfully"));
    }

    /**
     * Retrieves all historical AI analysis reports for a specific resume.
     *
     * @param resumeId UUID of the resume document
     * @return list of ResumeAnalysisSummaryDto
     */
    @GetMapping("/{resumeId}/analyses")
    public ResponseEntity<ApiResponse<List<ResumeAnalysisSummaryDto>>> getAnalysisHistory(@PathVariable UUID resumeId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        List<ResumeAnalysisSummaryDto> history = resumeAnalysisService.getAnalysisHistory(userId, resumeId);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    /**
     * Retrieves complete details of a specific AI analysis report by ID.
     *
     * @param analysisId UUID of the analysis record
     * @return complete ResumeAnalysisDto
     */
    @GetMapping("/analyses/{analysisId}")
    public ResponseEntity<ApiResponse<ResumeAnalysisDto>> getAnalysisDetails(@PathVariable UUID analysisId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        ResumeAnalysisDto analysis = resumeAnalysisService.getAnalysisDetails(userId, analysisId);
        return ResponseEntity.ok(ApiResponse.ok(analysis));
    }
}
