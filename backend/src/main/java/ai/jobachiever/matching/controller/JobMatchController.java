package ai.jobachiever.matching.controller;

import ai.jobachiever.common.response.ApiResponse;
import ai.jobachiever.common.security.CurrentUserService;
import ai.jobachiever.matching.dto.CreateMatchRequest;
import ai.jobachiever.matching.dto.JobMatchDto;
import ai.jobachiever.matching.dto.JobMatchSummaryDto;
import ai.jobachiever.matching.service.JobMatchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller exposing endpoints for explainable Resume-to-Job compatibility matching
 * under /api/v1/matches.
 */
@RestController
@RequestMapping("/api/v1/matches")
public class JobMatchController {

    private final JobMatchService jobMatchService;
    private final CurrentUserService currentUserService;

    public JobMatchController(JobMatchService jobMatchService, CurrentUserService currentUserService) {
        this.jobMatchService = jobMatchService;
        this.currentUserService = currentUserService;
    }

    /**
     * Executes evidence-grounded matching between a candidate resume and a target job.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<JobMatchDto>> createMatch(@Valid @RequestBody CreateMatchRequest request) {
        UUID userId = currentUserService.requireActiveUser().getId();
        JobMatchDto result = jobMatchService.createMatch(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(result, "Resume matched against job successfully"));
    }

    /**
     * Retrieves all match history reports for the authenticated candidate.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<JobMatchSummaryDto>>> getMatches() {
        UUID userId = currentUserService.requireActiveUser().getId();
        List<JobMatchSummaryDto> matches = jobMatchService.getMatches(userId);
        return ResponseEntity.ok(ApiResponse.ok(matches));
    }

    /**
     * Retrieves all matches for a specific target job.
     */
    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<List<JobMatchSummaryDto>>> getMatchesForJob(@PathVariable UUID jobId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        List<JobMatchSummaryDto> matches = jobMatchService.getMatchesForJob(userId, jobId);
        return ResponseEntity.ok(ApiResponse.ok(matches));
    }

    /**
     * Retrieves all matches for a specific resume.
     */
    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<ApiResponse<List<JobMatchSummaryDto>>> getMatchesForResume(@PathVariable UUID resumeId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        List<JobMatchSummaryDto> matches = jobMatchService.getMatchesForResume(userId, resumeId);
        return ResponseEntity.ok(ApiResponse.ok(matches));
    }

    /**
     * Retrieves full match report details by match ID.
     */
    @GetMapping("/{matchId}")
    public ResponseEntity<ApiResponse<JobMatchDto>> getMatchDetails(@PathVariable UUID matchId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        JobMatchDto result = jobMatchService.getMatchDetails(userId, matchId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * Deletes a match report owned by the user.
     */
    @DeleteMapping("/{matchId}")
    public ResponseEntity<ApiResponse<Void>> deleteMatch(@PathVariable UUID matchId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        jobMatchService.deleteMatch(userId, matchId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Match report deleted successfully"));
    }
}
