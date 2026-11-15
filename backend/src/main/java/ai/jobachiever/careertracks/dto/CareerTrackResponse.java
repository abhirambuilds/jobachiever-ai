package ai.jobachiever.careertracks.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CareerTrackResponse {

    private UUID id;
    private UUID userId;
    private UUID profileId;
    private String name;
    private String targetRole;
    private String description;
    private String targetSeniority;
    private List<String> preferredLocations = new ArrayList<>();
    private List<String> employmentTypes = new ArrayList<>();
    private List<String> industries = new ArrayList<>();
    private List<String> targetCompanies = new ArrayList<>();
    private List<String> requiredSkills = new ArrayList<>();
    private List<String> preferredSkills = new ArrayList<>();
    private String careerGoals;
    private int priority;
    private boolean active;
    private boolean isPrimary;
    private Instant createdAt;
    private Instant updatedAt;

    public CareerTrackResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getProfileId() {
        return profileId;
    }

    public void setProfileId(UUID profileId) {
        this.profileId = profileId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTargetSeniority() {
        return targetSeniority;
    }

    public void setTargetSeniority(String targetSeniority) {
        this.targetSeniority = targetSeniority;
    }

    public List<String> getPreferredLocations() {
        return preferredLocations;
    }

    public void setPreferredLocations(List<String> preferredLocations) {
        this.preferredLocations = preferredLocations != null ? preferredLocations : new ArrayList<>();
    }

    public List<String> getEmploymentTypes() {
        return employmentTypes;
    }

    public void setEmploymentTypes(List<String> employmentTypes) {
        this.employmentTypes = employmentTypes != null ? employmentTypes : new ArrayList<>();
    }

    public List<String> getIndustries() {
        return industries;
    }

    public void setIndustries(List<String> industries) {
        this.industries = industries != null ? industries : new ArrayList<>();
    }

    public List<String> getTargetCompanies() {
        return targetCompanies;
    }

    public void setTargetCompanies(List<String> targetCompanies) {
        this.targetCompanies = targetCompanies != null ? targetCompanies : new ArrayList<>();
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills != null ? requiredSkills : new ArrayList<>();
    }

    public List<String> getRelevantSkills() {
        return requiredSkills;
    }

    public void setRelevantSkills(List<String> relevantSkills) {
        this.requiredSkills = relevantSkills != null ? relevantSkills : new ArrayList<>();
    }

    public List<String> getPreferredSkills() {
        return preferredSkills;
    }

    public void setPreferredSkills(List<String> preferredSkills) {
        this.preferredSkills = preferredSkills != null ? preferredSkills : new ArrayList<>();
    }

    public String getCareerGoals() {
        return careerGoals;
    }

    public void setCareerGoals(String careerGoals) {
        this.careerGoals = careerGoals;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public void setPrimary(boolean primary) {
        isPrimary = primary;
    }

    public boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(boolean primary) {
        isPrimary = primary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
