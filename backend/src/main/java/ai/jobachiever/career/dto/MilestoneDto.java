package ai.jobachiever.career.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class MilestoneDto {

    private UUID id;
    private UUID roadmapId;
    private int phaseNumber;
    private String title;
    private String description;
    private String priority;
    private String status;
    private List<String> relatedSkills;
    private List<RoadmapTaskDto> tasks;
    private List<String> completionCriteria;
    private String estimatedDuration;
    private Instant startDate;
    private Instant completedAt;
    private String personalNotes;
    private List<String> evidenceLinks;
    private Instant createdAt;
    private Instant updatedAt;

    public MilestoneDto() {
    }

    public MilestoneDto(UUID id, UUID roadmapId, int phaseNumber, String title,
                        String description, String priority, String status,
                        List<String> relatedSkills, List<RoadmapTaskDto> tasks,
                        List<String> completionCriteria, String estimatedDuration,
                        Instant startDate, Instant completedAt, String personalNotes,
                        List<String> evidenceLinks, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.roadmapId = roadmapId;
        this.phaseNumber = phaseNumber;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.relatedSkills = relatedSkills;
        this.tasks = tasks;
        this.completionCriteria = completionCriteria;
        this.estimatedDuration = estimatedDuration;
        this.startDate = startDate;
        this.completedAt = completedAt;
        this.personalNotes = personalNotes;
        this.evidenceLinks = evidenceLinks;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getRoadmapId() {
        return roadmapId;
    }

    public void setRoadmapId(UUID roadmapId) {
        this.roadmapId = roadmapId;
    }

    public int getPhaseNumber() {
        return phaseNumber;
    }

    public void setPhaseNumber(int phaseNumber) {
        this.phaseNumber = phaseNumber;
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

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getRelatedSkills() {
        return relatedSkills;
    }

    public void setRelatedSkills(List<String> relatedSkills) {
        this.relatedSkills = relatedSkills;
    }

    public List<RoadmapTaskDto> getTasks() {
        return tasks;
    }

    public void setTasks(List<RoadmapTaskDto> tasks) {
        this.tasks = tasks;
    }

    public List<String> getCompletionCriteria() {
        return completionCriteria;
    }

    public void setCompletionCriteria(List<String> completionCriteria) {
        this.completionCriteria = completionCriteria;
    }

    public String getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(String estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }

    public Instant getStartDate() {
        return startDate;
    }

    public void setStartDate(Instant startDate) {
        this.startDate = startDate;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public String getPersonalNotes() {
        return personalNotes;
    }

    public void setPersonalNotes(String personalNotes) {
        this.personalNotes = personalNotes;
    }

    public List<String> getEvidenceLinks() {
        return evidenceLinks;
    }

    public void setEvidenceLinks(List<String> evidenceLinks) {
        this.evidenceLinks = evidenceLinks;
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
