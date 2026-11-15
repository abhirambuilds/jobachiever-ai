package ai.jobachiever.career.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing an AI-generated learning roadmap for a candidate's target career role.
 */
@Entity
@Table(name = "career_roadmaps")
public class CareerRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "career_track_id", nullable = false)
    private UUID careerTrackId;

    @Column(name = "target_role", nullable = false, length = 255)
    private String targetRole;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "IN_PROGRESS";

    @Column(name = "provider", nullable = false, length = 32)
    private String provider = "GROQ";

    @Column(name = "model", length = 128)
    private String model;

    @Column(name = "estimated_duration", length = 100)
    private String estimatedDuration;

    @Column(name = "roadmap_json", nullable = false, columnDefinition = "JSONB")
    private String roadmapJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public CareerRoadmap() {
    }

    public CareerRoadmap(UUID userId, UUID careerTrackId, String targetRole, String title,
                         String description, String status, String provider, String model,
                         String estimatedDuration, String roadmapJson) {
        this.userId = userId;
        this.careerTrackId = careerTrackId;
        this.targetRole = targetRole;
        this.title = title;
        this.description = description;
        this.status = status != null ? status : "IN_PROGRESS";
        this.provider = provider != null ? provider : "GROQ";
        this.model = model;
        this.estimatedDuration = estimatedDuration;
        this.roadmapJson = roadmapJson;
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

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
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

    public String getRoadmapJson() {
        return roadmapJson;
    }

    public void setRoadmapJson(String roadmapJson) {
        this.roadmapJson = roadmapJson;
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
