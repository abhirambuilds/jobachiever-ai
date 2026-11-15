package ai.jobachiever.career.dto;

import java.util.List;
import java.util.UUID;

public class CareerDashboardSummaryDto {

    private int activeCareerTracksCount;
    private UUID activeTrackId;
    private String activeTrackName;
    private String targetRole;
    private int criticalGapsCount;
    private List<SkillGapItemDto> topCriticalGaps;
    private int totalMilestones;
    private int completedMilestones;
    private int inProgressMilestones;
    private int roadmapProgressPercentage;
    private List<MilestoneDto> upcomingMilestones;
    private boolean hasActiveRoadmap;

    public CareerDashboardSummaryDto() {
    }

    public CareerDashboardSummaryDto(int activeCareerTracksCount, UUID activeTrackId, String activeTrackName,
                                     String targetRole, int criticalGapsCount, List<SkillGapItemDto> topCriticalGaps,
                                     int totalMilestones, int completedMilestones, int inProgressMilestones,
                                     int roadmapProgressPercentage, List<MilestoneDto> upcomingMilestones,
                                     boolean hasActiveRoadmap) {
        this.activeCareerTracksCount = activeCareerTracksCount;
        this.activeTrackId = activeTrackId;
        this.activeTrackName = activeTrackName;
        this.targetRole = targetRole;
        this.criticalGapsCount = criticalGapsCount;
        this.topCriticalGaps = topCriticalGaps;
        this.totalMilestones = totalMilestones;
        this.completedMilestones = completedMilestones;
        this.inProgressMilestones = inProgressMilestones;
        this.roadmapProgressPercentage = roadmapProgressPercentage;
        this.upcomingMilestones = upcomingMilestones;
        this.hasActiveRoadmap = hasActiveRoadmap;
    }

    public int getActiveCareerTracksCount() {
        return activeCareerTracksCount;
    }

    public void setActiveCareerTracksCount(int activeCareerTracksCount) {
        this.activeCareerTracksCount = activeCareerTracksCount;
    }

    public UUID getActiveTrackId() {
        return activeTrackId;
    }

    public void setActiveTrackId(UUID activeTrackId) {
        this.activeTrackId = activeTrackId;
    }

    public String getActiveTrackName() {
        return activeTrackName;
    }

    public void setActiveTrackName(String activeTrackName) {
        this.activeTrackName = activeTrackName;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public int getCriticalGapsCount() {
        return criticalGapsCount;
    }

    public void setCriticalGapsCount(int criticalGapsCount) {
        this.criticalGapsCount = criticalGapsCount;
    }

    public List<SkillGapItemDto> getTopCriticalGaps() {
        return topCriticalGaps;
    }

    public void setTopCriticalGaps(List<SkillGapItemDto> topCriticalGaps) {
        this.topCriticalGaps = topCriticalGaps;
    }

    public int getTotalMilestones() {
        return totalMilestones;
    }

    public void setTotalMilestones(int totalMilestones) {
        this.totalMilestones = totalMilestones;
    }

    public int getCompletedMilestones() {
        return completedMilestones;
    }

    public void setCompletedMilestones(int completedMilestones) {
        this.completedMilestones = completedMilestones;
    }

    public int getInProgressMilestones() {
        return inProgressMilestones;
    }

    public void setInProgressMilestones(int inProgressMilestones) {
        this.inProgressMilestones = inProgressMilestones;
    }

    public int getRoadmapProgressPercentage() {
        return roadmapProgressPercentage;
    }

    public void setRoadmapProgressPercentage(int roadmapProgressPercentage) {
        this.roadmapProgressPercentage = roadmapProgressPercentage;
    }

    public List<MilestoneDto> getUpcomingMilestones() {
        return upcomingMilestones;
    }

    public void setUpcomingMilestones(List<MilestoneDto> upcomingMilestones) {
        this.upcomingMilestones = upcomingMilestones;
    }

    public boolean isHasActiveRoadmap() {
        return hasActiveRoadmap;
    }

    public void setHasActiveRoadmap(boolean hasActiveRoadmap) {
        this.hasActiveRoadmap = hasActiveRoadmap;
    }
}
