package ai.jobachiever.career.dto;

import java.util.List;

public class ProjectRecommendationDto {

    private String title;
    private String description;
    private List<String> targetMissingSkills;
    private String architectureOverview;
    private List<String> keyDeliverables;
    private String estimatedDifficulty;
    private String portfolioImpact;

    public ProjectRecommendationDto() {
    }

    public ProjectRecommendationDto(String title, String description, List<String> targetMissingSkills,
                                    String architectureOverview, List<String> keyDeliverables,
                                    String estimatedDifficulty, String portfolioImpact) {
        this.title = title;
        this.description = description;
        this.targetMissingSkills = targetMissingSkills;
        this.architectureOverview = architectureOverview;
        this.keyDeliverables = keyDeliverables;
        this.estimatedDifficulty = estimatedDifficulty;
        this.portfolioImpact = portfolioImpact;
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

    public List<String> getTargetMissingSkills() {
        return targetMissingSkills;
    }

    public void setTargetMissingSkills(List<String> targetMissingSkills) {
        this.targetMissingSkills = targetMissingSkills;
    }

    public String getArchitectureOverview() {
        return architectureOverview;
    }

    public void setArchitectureOverview(String architectureOverview) {
        this.architectureOverview = architectureOverview;
    }

    public List<String> getKeyDeliverables() {
        return keyDeliverables;
    }

    public void setKeyDeliverables(List<String> keyDeliverables) {
        this.keyDeliverables = keyDeliverables;
    }

    public String getEstimatedDifficulty() {
        return estimatedDifficulty;
    }

    public void setEstimatedDifficulty(String estimatedDifficulty) {
        this.estimatedDifficulty = estimatedDifficulty;
    }

    public String getPortfolioImpact() {
        return portfolioImpact;
    }

    public void setPortfolioImpact(String portfolioImpact) {
        this.portfolioImpact = portfolioImpact;
    }
}
