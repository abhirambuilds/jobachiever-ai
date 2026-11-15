package ai.jobachiever.career.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class AnalyzeSkillGapRequestDto {

    @NotNull(message = "Career track ID is required")
    private UUID careerTrackId;

    private String targetRole;

    private UUID resumeId;

    private String provider;

    private String model;

    public AnalyzeSkillGapRequestDto() {
    }

    public AnalyzeSkillGapRequestDto(UUID careerTrackId, String targetRole, UUID resumeId, String provider, String model) {
        this.careerTrackId = careerTrackId;
        this.targetRole = targetRole;
        this.resumeId = resumeId;
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

    public UUID getResumeId() {
        return resumeId;
    }

    public void setResumeId(UUID resumeId) {
        this.resumeId = resumeId;
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
