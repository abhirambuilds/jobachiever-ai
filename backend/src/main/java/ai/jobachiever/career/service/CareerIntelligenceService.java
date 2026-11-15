package ai.jobachiever.career.service;

import ai.jobachiever.career.dto.*;

import java.util.List;
import java.util.UUID;

public interface CareerIntelligenceService {

    SkillGapAnalysisDto analyzeSkillGaps(UUID userId, AnalyzeSkillGapRequestDto request);

    SkillGapAnalysisDto getLatestSkillGaps(UUID userId, UUID careerTrackId);

    CareerRecommendationsDto generateRecommendations(UUID userId, GenerateRecommendationsRequestDto request);

    CareerRecommendationsDto getLatestRecommendations(UUID userId, UUID careerTrackId);

    CareerRoadmapDto generateRoadmap(UUID userId, GenerateRoadmapRequestDto request);

    CareerRoadmapDto getActiveRoadmap(UUID userId, UUID careerTrackId);

    List<CareerRoadmapDto> getUserRoadmaps(UUID userId);

    MilestoneDto updateMilestone(UUID userId, UUID milestoneId, UpdateMilestoneRequestDto request);

    ProjectRecommendationsResponseDto recommendProjects(UUID userId, UUID careerTrackId);

    CareerDashboardSummaryDto getDashboardSummary(UUID userId);
}
