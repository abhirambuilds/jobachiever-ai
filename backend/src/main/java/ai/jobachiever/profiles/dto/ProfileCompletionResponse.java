package ai.jobachiever.profiles.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfileCompletionResponse {

    private int completionPercentage;
    private List<String> completedSections = new ArrayList<>();
    private List<String> incompleteSections = new ArrayList<>();
    private List<SectionScoreDto> sectionBreakdown = new ArrayList<>();
    private List<String> recommendations = new ArrayList<>();

    public ProfileCompletionResponse() {
    }

    public ProfileCompletionResponse(int completionPercentage,
                                     List<String> completedSections,
                                     List<String> incompleteSections,
                                     List<SectionScoreDto> sectionBreakdown,
                                     List<String> recommendations) {
        this.completionPercentage = completionPercentage;
        this.completedSections = completedSections != null ? completedSections : new ArrayList<>();
        this.incompleteSections = incompleteSections != null ? incompleteSections : new ArrayList<>();
        this.sectionBreakdown = sectionBreakdown != null ? sectionBreakdown : new ArrayList<>();
        this.recommendations = recommendations != null ? recommendations : new ArrayList<>();
    }

    public int getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(int completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public List<String> getCompletedSections() {
        return completedSections;
    }

    public void setCompletedSections(List<String> completedSections) {
        this.completedSections = completedSections;
    }

    public List<String> getIncompleteSections() {
        return incompleteSections;
    }

    public void setIncompleteSections(List<String> incompleteSections) {
        this.incompleteSections = incompleteSections;
    }

    public List<SectionScoreDto> getSectionBreakdown() {
        return sectionBreakdown;
    }

    public void setSectionBreakdown(List<SectionScoreDto> sectionBreakdown) {
        this.sectionBreakdown = sectionBreakdown;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }
}
