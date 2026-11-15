package ai.jobachiever.jobs.controller;

import ai.jobachiever.common.response.ApiResponse;
import ai.jobachiever.common.security.CurrentUserService;
import ai.jobachiever.jobs.dto.AnalyzeJobDescriptionRequest;
import ai.jobachiever.jobs.dto.JobAnalysisDto;
import ai.jobachiever.jobs.dto.JobAnalysisSummaryDto;
import ai.jobachiever.jobs.service.JobAnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller exposing endpoints for AI-powered job description analysis,
 * decomposition, requirement extraction, and historical query views under /api/v1/jobs.
 */
@RestController
@RequestMapping("/api/v1/jobs")
public class JobAnalysisController {

    private final JobAnalysisService jobAnalysisService;
    private final CurrentUserService currentUserService;

    public JobAnalysisController(JobAnalysisService jobAnalysisService, CurrentUserService currentUserService) {
        this.jobAnalysisService = jobAnalysisService;
        this.currentUserService = currentUserService;
    }

    /**
     * Analyzes an arbitrary pasted or submitted job description.
     * Enforces minimum 50 chars, maximum 50,000 chars, and AI consent.
     */
    @PostMapping("/analyze-description")
    public ResponseEntity<ApiResponse<JobAnalysisDto>> analyzeDescription(
            @Valid @RequestBody AnalyzeJobDescriptionRequest request) {
        UUID userId = currentUserService.requireActiveUser().getId();
        JobAnalysisDto result = jobAnalysisService.analyzeDescription(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(result, "Job description analyzed successfully"));
    }

    /**
     * Analyzes an existing saved job posting record.
     */
    @PostMapping("/{jobId}/analyze")
    public ResponseEntity<ApiResponse<JobAnalysisDto>> analyzeSavedJob(@PathVariable UUID jobId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        JobAnalysisDto result = jobAnalysisService.analyzeJob(userId, jobId);
        return ResponseEntity.ok(ApiResponse.ok(result, "Job analyzed successfully"));
    }

    /**
     * Retrieves all job analyses conducted by the current user.
     */
    @GetMapping("/analyses")
    public ResponseEntity<ApiResponse<List<JobAnalysisSummaryDto>>> getAnalyses() {
        UUID userId = currentUserService.requireActiveUser().getId();
        List<JobAnalysisSummaryDto> analyses = jobAnalysisService.getAnalyses(userId);
        return ResponseEntity.ok(ApiResponse.ok(analyses));
    }

    /**
     * Retrieves all analyses for a specific saved job.
     */
    @GetMapping("/{jobId}/analyses")
    public ResponseEntity<ApiResponse<List<JobAnalysisSummaryDto>>> getJobAnalyses(@PathVariable UUID jobId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        List<JobAnalysisSummaryDto> analyses = jobAnalysisService.getJobAnalyses(userId, jobId);
        return ResponseEntity.ok(ApiResponse.ok(analyses));
    }

    /**
     * Retrieves full analysis report details by analysis ID.
     */
    @GetMapping("/analyses/{analysisId}")
    public ResponseEntity<ApiResponse<JobAnalysisDto>> getAnalysisDetails(@PathVariable UUID analysisId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        JobAnalysisDto result = jobAnalysisService.getAnalysisDetails(userId, analysisId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * Deletes a specific job analysis report owned by the user.
     */
    @DeleteMapping("/analyses/{analysisId}")
    public ResponseEntity<ApiResponse<Void>> deleteAnalysis(@PathVariable UUID analysisId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        jobAnalysisService.deleteAnalysis(userId, analysisId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Job analysis deleted successfully"));
    }
}
