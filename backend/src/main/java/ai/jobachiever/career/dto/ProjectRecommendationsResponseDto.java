package ai.jobachiever.career.dto;

import java.util.List;
import java.util.UUID;

public class ProjectRecommendationsResponseDto {

    private UUID careerTrackId;
    private String targetRole;
    private String provider;
    private String model;
    private List<ProjectRecommendationDto> projects;

    public ProjectRecommendationsResponseDto() {
    }

    public ProjectRecommendationsResponseDto(UUID careerTrackId, String targetRole, String provider,
                                            String model, List<ProjectRecommendationDto> projects) {
        this.careerTrackId = careerTrackId;
        this.targetRole = targetRole;
        this.provider = provider;
        this.model = model;
        this.projects = projects;
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

    public List<ProjectRecommendationDto> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectRecommendationDto> projects) {
        this.projects = projects;
    }
}
