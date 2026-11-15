package ai.jobachiever.career.dto;

import java.util.List;

public class CareerRecommendationItemDto {

    private String title;
    private String category;
    private String priority;
    private String rationale;
    private List<String> targetSkills;
    private List<String> actionableSteps;
    private String estimatedEffort;

    public CareerRecommendationItemDto() {
    }

    public CareerRecommendationItemDto(String title, String category, String priority,
                                       String rationale, List<String> targetSkills,
                                       List<String> actionableSteps, String estimatedEffort) {
        this.title = title;
        this.category = category;
        this.priority = priority;
        this.rationale = rationale;
        this.targetSkills = targetSkills;
        this.actionableSteps = actionableSteps;
        this.estimatedEffort = estimatedEffort;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getRationale() {
        return rationale;
    }

    public void setRationale(String rationale) {
        this.rationale = rationale;
    }

    public List<String> getTargetSkills() {
        return targetSkills;
    }

    public void setTargetSkills(List<String> targetSkills) {
        this.targetSkills = targetSkills;
    }

    public List<String> getActionableSteps() {
        return actionableSteps;
    }

    public void setActionableSteps(List<String> actionableSteps) {
        this.actionableSteps = actionableSteps;
    }

    public String getEstimatedEffort() {
        return estimatedEffort;
    }

    public void setEstimatedEffort(String estimatedEffort) {
        this.estimatedEffort = estimatedEffort;
    }
}
