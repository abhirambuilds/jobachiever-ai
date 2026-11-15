package ai.jobachiever.careertracks.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SkillMatchResult {

    private List<String> matchedRequiredSkills = new ArrayList<>();
    private List<String> matchedPreferredSkills = new ArrayList<>();
    private List<String> missingRequiredSkills = new ArrayList<>();
    private List<String> missingPreferredSkills = new ArrayList<>();
    private List<String> additionalProfileSkills = new ArrayList<>();
    private int requiredSkillMatchPercentage;
    private int overallSkillMatchPercentage;

    public SkillMatchResult() {
    }

    public SkillMatchResult(List<String> matchedRequiredSkills,
                            List<String> matchedPreferredSkills,
                            List<String> missingRequiredSkills,
                            List<String> missingPreferredSkills,
                            List<String> additionalProfileSkills,
                            int requiredSkillMatchPercentage,
                            int overallSkillMatchPercentage) {
        this.matchedRequiredSkills = matchedRequiredSkills != null ? matchedRequiredSkills : new ArrayList<>();
        this.matchedPreferredSkills = matchedPreferredSkills != null ? matchedPreferredSkills : new ArrayList<>();
        this.missingRequiredSkills = missingRequiredSkills != null ? missingRequiredSkills : new ArrayList<>();
        this.missingPreferredSkills = missingPreferredSkills != null ? missingPreferredSkills : new ArrayList<>();
        this.additionalProfileSkills = additionalProfileSkills != null ? additionalProfileSkills : new ArrayList<>();
        this.requiredSkillMatchPercentage = requiredSkillMatchPercentage;
        this.overallSkillMatchPercentage = overallSkillMatchPercentage;
    }

    public List<String> getMatchedRequiredSkills() {
        return matchedRequiredSkills;
    }

    public void setMatchedRequiredSkills(List<String> matchedRequiredSkills) {
        this.matchedRequiredSkills = matchedRequiredSkills;
    }

    public List<String> getMatchedPreferredSkills() {
        return matchedPreferredSkills;
    }

    public void setMatchedPreferredSkills(List<String> matchedPreferredSkills) {
        this.matchedPreferredSkills = matchedPreferredSkills;
    }

    public List<String> getMissingRequiredSkills() {
        return missingRequiredSkills;
    }

    public void setMissingRequiredSkills(List<String> missingRequiredSkills) {
        this.missingRequiredSkills = missingRequiredSkills;
    }

    public List<String> getMissingPreferredSkills() {
        return missingPreferredSkills;
    }

    public void setMissingPreferredSkills(List<String> missingPreferredSkills) {
        this.missingPreferredSkills = missingPreferredSkills;
    }

    public List<String> getAdditionalProfileSkills() {
        return additionalProfileSkills;
    }

    public void setAdditionalProfileSkills(List<String> additionalProfileSkills) {
        this.additionalProfileSkills = additionalProfileSkills;
    }

    public int getRequiredSkillMatchPercentage() {
        return requiredSkillMatchPercentage;
    }

    public void setRequiredSkillMatchPercentage(int requiredSkillMatchPercentage) {
        this.requiredSkillMatchPercentage = requiredSkillMatchPercentage;
    }

    public int getOverallSkillMatchPercentage() {
        return overallSkillMatchPercentage;
    }

    public void setOverallSkillMatchPercentage(int overallSkillMatchPercentage) {
        this.overallSkillMatchPercentage = overallSkillMatchPercentage;
    }
}
