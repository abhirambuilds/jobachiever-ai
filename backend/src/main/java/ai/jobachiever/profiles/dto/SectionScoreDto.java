package ai.jobachiever.profiles.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SectionScoreDto {

    private String section;
    private int weight;
    private int earned;
    private boolean completed;
    private String details;

    public SectionScoreDto() {
    }

    public SectionScoreDto(String section, int weight, int earned, boolean completed, String details) {
        this.section = section;
        this.weight = weight;
        this.earned = earned;
        this.completed = completed;
        this.details = details;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }

    public int getEarned() {
        return earned;
    }

    public void setEarned(int earned) {
        this.earned = earned;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
