package ai.jobachiever.careertracks.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateCareerTrackRequest {

    @NotBlank(message = "Track name is required")
    @Size(max = 150, message = "Track name cannot exceed 150 characters")
    private String name;

    @NotBlank(message = "Target role is required")
    @Size(max = 255, message = "Target role cannot exceed 255 characters")
    private String targetRole;

    private String description;

    @Size(max = 50, message = "Target seniority cannot exceed 50 characters")
    private String targetSeniority = "ENTRY_LEVEL";

    private List<String> preferredLocations = new ArrayList<>();

    private List<String> employmentTypes = new ArrayList<>();

    @JsonAlias({"industries", "targetIndustries"})
    private List<String> industries = new ArrayList<>();

    private List<String> targetCompanies = new ArrayList<>();

    @JsonAlias({"requiredSkills", "relevantSkills"})
    private List<String> requiredSkills = new ArrayList<>();

    private List<String> preferredSkills = new ArrayList<>();

    @JsonAlias({"careerGoals", "careerObjectives"})
    private String careerGoals;

    @Min(value = 1, message = "Priority must be at least 1")
    @Max(value = 100, message = "Priority cannot exceed 100")
    private Integer priority = 1;

    private Boolean active = true;

    private Boolean isPrimary = false;

    public UpdateCareerTrackRequest() {
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

    @JsonProperty("preferredLocations")
    public void setPreferredLocations(Object value) {
        this.preferredLocations = parseList(value);
    }

    public List<String> getEmploymentTypes() {
        return employmentTypes;
    }

    @JsonProperty("employmentTypes")
    public void setEmploymentTypes(Object value) {
        this.employmentTypes = parseList(value);
    }

    public List<String> getIndustries() {
        return industries;
    }

    @JsonProperty("industries")
    public void setIndustries(Object value) {
        this.industries = parseList(value);
    }

    public List<String> getTargetCompanies() {
        return targetCompanies;
    }

    @JsonProperty("targetCompanies")
    public void setTargetCompanies(Object value) {
        this.targetCompanies = parseList(value);
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    @JsonProperty("requiredSkills")
    public void setRequiredSkills(Object value) {
        this.requiredSkills = parseList(value);
    }

    public List<String> getRelevantSkills() {
        return requiredSkills;
    }

    @JsonProperty("relevantSkills")
    public void setRelevantSkills(Object value) {
        this.requiredSkills = parseList(value);
    }

    public List<String> getPreferredSkills() {
        return preferredSkills;
    }

    @JsonProperty("preferredSkills")
    public void setPreferredSkills(Object value) {
        this.preferredSkills = parseList(value);
    }

    public String getCareerGoals() {
        return careerGoals;
    }

    public void setCareerGoals(String careerGoals) {
        this.careerGoals = careerGoals;
    }

    public Integer getPriority() {
        return priority != null ? priority : 1;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public Boolean getActive() {
        return active != null ? active : true;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getIsPrimary() {
        return isPrimary != null ? isPrimary : false;
    }

    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }

    private List<String> parseList(Object value) {
        if (value == null) {
            return new ArrayList<>();
        } else if (value instanceof List<?> list) {
            return list.stream()
                    .map(Object::toString)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        } else if (value instanceof String str) {
            return Arrays.stream(str.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
        return new ArrayList<>();
    }
}
