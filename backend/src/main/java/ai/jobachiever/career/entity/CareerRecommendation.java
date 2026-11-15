package ai.jobachiever.career.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing AI-generated career recommendations for a career track.
 */
@Entity
@Table(name = "career_recommendations")
public class CareerRecommendation {

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

    @Column(name = "provider", nullable = false, length = 32)
    private String provider = "GROQ";

    @Column(name = "model", length = 128)
    private String model;

    @Column(name = "recommendations_json", nullable = false, columnDefinition = "JSONB")
    private String recommendationsJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public CareerRecommendation() {
    }

    public CareerRecommendation(UUID userId, UUID careerTrackId, String targetRole,
                                String provider, String model, String recommendationsJson) {
        this.userId = userId;
        this.careerTrackId = careerTrackId;
        this.targetRole = targetRole;
        this.provider = provider != null ? provider : "GROQ";
        this.model = model;
        this.recommendationsJson = recommendationsJson;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
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

    public String getRecommendationsJson() {
        return recommendationsJson;
    }

    public void setRecommendationsJson(String recommendationsJson) {
        this.recommendationsJson = recommendationsJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
