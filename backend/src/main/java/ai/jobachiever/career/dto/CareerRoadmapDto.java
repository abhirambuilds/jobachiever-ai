package ai.jobachiever.career.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class CareerRoadmapDto {

    private UUID id;
    private UUID careerTrackId;
    private String targetRole;
    private String title;
    private String description;
    private String status;
    private String provider;
    private String model;
    private String estimatedDuration;
    private List<RoadmapPhaseDto> phases;
    private int totalMilestones;
    private int completedMilestones;
    private int inProgressMilestones;
    private int blockedMilestones;
    private int progressPercentage;
    private Instant createdAt;
    private Instant updatedAt;

    public CareerRoadmapDto() {
    }

    public CareerRoadmapDto(UUID id, UUID careerTrackId, String targetRole, String title,
                            String description, String status, String provider, String model,
                            String estimatedDuration, List<RoadmapPhaseDto> phases,
                            int totalMilestones, int completedMilestones, int inProgressMilestones,
                            int blockedMilestones, int progressPercentage,
                            Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.careerTrackId = careerTrackId;
        this.targetRole = targetRole;
        this.title = title;
        this.description = description;
        this.status = status;
        this.provider = provider;
        this.model = model;
        this.estimatedDuration = estimatedDuration;
        this.phases = phases;
        this.totalMilestones = totalMilestones;
        this.completedMilestones = completedMilestones;
        this.inProgressMilestones = inProgressMilestones;
        this.blockedMilestones = blockedMilestones;
        this.progressPercentage = progressPercentage;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCareerTrackId() {
        return careerTrackId;
    }

    public void setCareerTrackId(UUID careerTrackId) {
        this.careerTrackId = careerTrackId;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(String estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }

    public List<RoadmapPhaseDto> getPhases() {
        return phases;
    }

    public void setPhases(List<RoadmapPhaseDto> phases) {
        this.phases = phases;
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

    public int getBlockedMilestones() {
        return blockedMilestones;
    }

    public void setBlockedMilestones(int blockedMilestones) {
        this.blockedMilestones = blockedMilestones;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
