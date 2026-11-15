package ai.jobachiever.career.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class CareerRecommendationsDto {

    private UUID id;
    private UUID careerTrackId;
    private String targetRole;
    private String provider;
    private String model;
    private List<CareerRecommendationItemDto> recommendations;
    private Instant createdAt;

    public CareerRecommendationsDto() {
    }

    public CareerRecommendationsDto(UUID id, UUID careerTrackId, String targetRole,
                                    String provider, String model,
                                    List<CareerRecommendationItemDto> recommendations,
                                    Instant createdAt) {
        this.id = id;
        this.careerTrackId = careerTrackId;
        this.targetRole = targetRole;
        this.provider = provider;
        this.model = model;
        this.recommendations = recommendations;
        this.createdAt = createdAt;
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

    public List<CareerRecommendationItemDto> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<CareerRecommendationItemDto> recommendations) {
        this.recommendations = recommendations;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
