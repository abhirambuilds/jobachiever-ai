package ai.jobachiever.career.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing an actionable learning milestone within a career roadmap.
 */
@Entity
@Table(name = "career_milestones")
public class CareerMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "roadmap_id", nullable = false)
    private UUID roadmapId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "phase_number", nullable = false)
    private int phaseNumber = 1;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "priority", nullable = false, length = 32)
    private String priority = "MEDIUM";

    @Column(name = "status", nullable = false, length = 32)
    private String status = "NOT_STARTED";

    @Column(name = "related_skills", columnDefinition = "JSONB")
    private String relatedSkills = "[]";

    @Column(name = "tasks", columnDefinition = "JSONB")
    private String tasks = "[]";

    @Column(name = "completion_criteria", columnDefinition = "JSONB")
    private String completionCriteria = "[]";

    @Column(name = "estimated_duration", length = 100)
    private String estimatedDuration;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "personal_notes", columnDefinition = "TEXT")
    private String personalNotes;

    @Column(name = "evidence_links", columnDefinition = "JSONB")
    private String evidenceLinks = "[]";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public CareerMilestone() {
    }

    public CareerMilestone(UUID roadmapId, UUID userId, int phaseNumber, String title,
                           String description, String priority, String status,
                           String relatedSkills, String tasks, String completionCriteria,
                           String estimatedDuration) {
        this.roadmapId = roadmapId;
        this.userId = userId;
        this.phaseNumber = phaseNumber;
        this.title = title;
        this.description = description;
        this.priority = priority != null ? priority : "MEDIUM";
        this.status = status != null ? status : "NOT_STARTED";
        this.relatedSkills = relatedSkills != null ? relatedSkills : "[]";
        this.tasks = tasks != null ? tasks : "[]";
        this.completionCriteria = completionCriteria != null ? completionCriteria : "[]";
        this.estimatedDuration = estimatedDuration;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
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

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
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

    public String getRelatedSkills() {
        return relatedSkills;
    }

    public void setRelatedSkills(String relatedSkills) {
        this.relatedSkills = relatedSkills;
    }

    public String getTasks() {
        return tasks;
    }

    public void setTasks(String tasks) {
        this.tasks = tasks;
    }

    public String getCompletionCriteria() {
        return completionCriteria;
    }

    public void setCompletionCriteria(String completionCriteria) {
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

    public String getEvidenceLinks() {
        return evidenceLinks;
    }

    public void setEvidenceLinks(String evidenceLinks) {
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
