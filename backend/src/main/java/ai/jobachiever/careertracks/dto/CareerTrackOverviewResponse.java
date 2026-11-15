package ai.jobachiever.careertracks.dto;

import ai.jobachiever.profiles.dto.ExperienceDto;
import ai.jobachiever.profiles.dto.ProjectDto;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CareerTrackOverviewResponse {

    private CareerTrackResponse track;
    private int requiredSkillsCount;
    private int preferredSkillsCount;
    private List<String> matchedRequiredSkills = new ArrayList<>();
    private List<String> matchedPreferredSkills = new ArrayList<>();
    private List<String> missingRequiredSkills = new ArrayList<>();
    private List<String> missingPreferredSkills = new ArrayList<>();
    private List<String> additionalProfileSkills = new ArrayList<>();
    private int requiredSkillMatchPercentage;
    private int overallSkillMatchPercentage;
    private List<ProjectDto> relevantProjects = new ArrayList<>();
    private List<ExperienceDto> relevantExperience = new ArrayList<>();
    private String readinessStatus;
    private List<String> summaryNotes = new ArrayList<>();

    public CareerTrackOverviewResponse() {
    }

    public CareerTrackResponse getTrack() {
        return track;
    }

    public void setTrack(CareerTrackResponse track) {
        this.track = track;
    }

    public int getRequiredSkillsCount() {
        return requiredSkillsCount;
    }

    public void setRequiredSkillsCount(int requiredSkillsCount) {
        this.requiredSkillsCount = requiredSkillsCount;
    }

    public int getPreferredSkillsCount() {
        return preferredSkillsCount;
    }

    public void setPreferredSkillsCount(int preferredSkillsCount) {
        this.preferredSkillsCount = preferredSkillsCount;
    }

    public List<String> getMatchedRequiredSkills() {
        return matchedRequiredSkills;
    }

    public void setMatchedRequiredSkills(List<String> matchedRequiredSkills) {
        this.matchedRequiredSkills = matchedRequiredSkills != null ? matchedRequiredSkills : new ArrayList<>();
    }

    public List<String> getMatchedPreferredSkills() {
        return matchedPreferredSkills;
    }

    public void setMatchedPreferredSkills(List<String> matchedPreferredSkills) {
        this.matchedPreferredSkills = matchedPreferredSkills != null ? matchedPreferredSkills : new ArrayList<>();
    }

    public List<String> getMissingRequiredSkills() {
        return missingRequiredSkills;
    }

    public void setMissingRequiredSkills(List<String> missingRequiredSkills) {
        this.missingRequiredSkills = missingRequiredSkills != null ? missingRequiredSkills : new ArrayList<>();
    }

    public List<String> getMissingPreferredSkills() {
        return missingPreferredSkills;
    }

    public void setMissingPreferredSkills(List<String> missingPreferredSkills) {
        this.missingPreferredSkills = missingPreferredSkills != null ? missingPreferredSkills : new ArrayList<>();
    }

    public List<String> getAdditionalProfileSkills() {
        return additionalProfileSkills;
    }

    public void setAdditionalProfileSkills(List<String> additionalProfileSkills) {
        this.additionalProfileSkills = additionalProfileSkills != null ? additionalProfileSkills : new ArrayList<>();
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

    public List<ProjectDto> getRelevantProjects() {
        return relevantProjects;
    }

    public void setRelevantProjects(List<ProjectDto> relevantProjects) {
        this.relevantProjects = relevantProjects != null ? relevantProjects : new ArrayList<>();
    }

    public List<ExperienceDto> getRelevantExperience() {
        return relevantExperience;
    }

    public void setRelevantExperience(List<ExperienceDto> relevantExperience) {
        this.relevantExperience = relevantExperience != null ? relevantExperience : new ArrayList<>();
    }

    public String getReadinessStatus() {
        return readinessStatus;
    }

    public void setReadinessStatus(String readinessStatus) {
        this.readinessStatus = readinessStatus;
    }

    public List<String> getSummaryNotes() {
        return summaryNotes;
    }

    public void setSummaryNotes(List<String> summaryNotes) {
        this.summaryNotes = summaryNotes != null ? summaryNotes : new ArrayList<>();
    }
}
