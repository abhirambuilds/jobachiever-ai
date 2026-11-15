package ai.jobachiever.career.controller;

import ai.jobachiever.career.dto.*;
import ai.jobachiever.career.service.CareerIntelligenceService;
import ai.jobachiever.common.response.ApiResponse;
import ai.jobachiever.common.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/career")
public class CareerIntelligenceController {

    private final CareerIntelligenceService careerIntelligenceService;
    private final CurrentUserService currentUserService;

    public CareerIntelligenceController(CareerIntelligenceService careerIntelligenceService,
                                        CurrentUserService currentUserService) {
        this.careerIntelligenceService = careerIntelligenceService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/skill-gaps")
    public ResponseEntity<ApiResponse<SkillGapAnalysisDto>> analyzeSkillGaps(
            @Valid @RequestBody AnalyzeSkillGapRequestDto request) {
        UUID userId = currentUserService.requireActiveUser().getId();
        SkillGapAnalysisDto result = careerIntelligenceService.analyzeSkillGaps(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(result, "Skill gap analysis completed successfully"));
    }

    @GetMapping("/skill-gaps")
    public ResponseEntity<ApiResponse<SkillGapAnalysisDto>> getLatestSkillGaps(
            @RequestParam UUID trackId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        SkillGapAnalysisDto result = careerIntelligenceService.getLatestSkillGaps(userId, trackId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/recommendations")
    public ResponseEntity<ApiResponse<CareerRecommendationsDto>> generateRecommendations(
            @Valid @RequestBody GenerateRecommendationsRequestDto request) {
        UUID userId = currentUserService.requireActiveUser().getId();
        CareerRecommendationsDto result = careerIntelligenceService.generateRecommendations(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(result, "Career recommendations generated successfully"));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<CareerRecommendationsDto>> getLatestRecommendations(
            @RequestParam UUID trackId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        CareerRecommendationsDto result = careerIntelligenceService.getLatestRecommendations(userId, trackId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/roadmaps")
    public ResponseEntity<ApiResponse<CareerRoadmapDto>> generateRoadmap(
            @Valid @RequestBody GenerateRoadmapRequestDto request) {
        UUID userId = currentUserService.requireActiveUser().getId();
        CareerRoadmapDto result = careerIntelligenceService.generateRoadmap(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(result, "Personalized career roadmap generated successfully"));
    }

    @GetMapping("/roadmaps")
    public ResponseEntity<ApiResponse<CareerRoadmapDto>> getActiveRoadmap(
            @RequestParam UUID trackId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        CareerRoadmapDto result = careerIntelligenceService.getActiveRoadmap(userId, trackId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/roadmaps/all")
    public ResponseEntity<ApiResponse<List<CareerRoadmapDto>>> getUserRoadmaps() {
        UUID userId = currentUserService.requireActiveUser().getId();
        List<CareerRoadmapDto> result = careerIntelligenceService.getUserRoadmaps(userId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PatchMapping("/milestones/{milestoneId}")
    public ResponseEntity<ApiResponse<MilestoneDto>> updateMilestone(
            @PathVariable UUID milestoneId,
            @RequestBody UpdateMilestoneRequestDto request) {
        UUID userId = currentUserService.requireActiveUser().getId();
        MilestoneDto result = careerIntelligenceService.updateMilestone(userId, milestoneId, request);
        return ResponseEntity.ok(ApiResponse.ok(result, "Milestone updated successfully"));
    }

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<ProjectRecommendationsResponseDto>> recommendProjects(
            @RequestParam UUID trackId) {
        UUID userId = currentUserService.requireActiveUser().getId();
        ProjectRecommendationsResponseDto result = careerIntelligenceService.recommendProjects(userId, trackId);
        return ResponseEntity.ok(ApiResponse.ok(result, "Portfolio projects recommended successfully"));
    }

    @GetMapping("/dashboard-summary")
    public ResponseEntity<ApiResponse<CareerDashboardSummaryDto>> getDashboardSummary() {
        UUID userId = currentUserService.requireActiveUser().getId();
        CareerDashboardSummaryDto result = careerIntelligenceService.getDashboardSummary(userId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
