package ai.jobachiever.career.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class GenerateRoadmapRequestDto {

    @NotNull(message = "Career track ID is required")
    private UUID careerTrackId;

    private String targetRole;

    private String customGoal;

    private String provider;

    private String model;

    public GenerateRoadmapRequestDto() {
    }

    public GenerateRoadmapRequestDto(UUID careerTrackId, String targetRole, String customGoal, String provider, String model) {
        this.careerTrackId = careerTrackId;
        this.targetRole = targetRole;
        this.customGoal = customGoal;
        this.provider = provider;
        this.model = model;
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

    public String getCustomGoal() {
        return customGoal;
    }

    public void setCustomGoal(String customGoal) {
        this.customGoal = customGoal;
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
}
