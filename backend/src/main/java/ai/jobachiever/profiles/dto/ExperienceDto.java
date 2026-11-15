package ai.jobachiever.profiles.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;

import java.util.*;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExperienceDto {

    private UUID id;

    @JsonAlias({"company", "companyName"})
    @Size(max = 255, message = "Company name cannot exceed 255 characters")
    private String companyName;

    @Size(max = 255, message = "Job title cannot exceed 255 characters")
    private String jobTitle;

    @Size(max = 255, message = "Location cannot exceed 255 characters")
    private String location;

    @Size(max = 50, message = "Employment type cannot exceed 50 characters")
    private String employmentType = "FULL_TIME";

    private String startDate;

    private String endDate;

    @JsonAlias({"current", "isCurrent"})
    private Boolean current = false;

    @JsonAlias({"description", "responsibilities"})
    private String description;

    private List<String> achievements = new ArrayList<>();

    private List<String> technologies = new ArrayList<>();

    private String technologiesText;

    public ExperienceDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompany() {
        return companyName;
    }

    public void setCompany(String company) {
        this.companyName = company;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public Boolean getCurrent() {
        return current != null ? current : false;
    }

    public void setCurrent(Boolean current) {
        this.current = current;
    }

    public Boolean getIsCurrent() {
        return getCurrent();
    }

    public void setIsCurrent(Boolean isCurrent) {
        this.current = isCurrent;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getResponsibilities() {
        return description;
    }

    public void setResponsibilities(String responsibilities) {
        this.description = responsibilities;
    }

    public List<String> getAchievements() {
        return achievements;
    }

    @JsonProperty("achievements")
    public void setAchievements(Object value) {
        if (value == null) {
            this.achievements = new ArrayList<>();
        } else if (value instanceof List<?> list) {
            this.achievements = list.stream().map(Object::toString).toList();
        } else if (value instanceof String str) {
            if (!str.trim().isEmpty()) {
                this.achievements = List.of(str.trim());
            } else {
                this.achievements = new ArrayList<>();
            }
        }
    }

    public List<String> getTechnologies() {
        return technologies;
    }

    @JsonProperty("technologies")
    public void setTechnologies(Object value) {
        if (value == null) {
            this.technologies = new ArrayList<>();
            this.technologiesText = null;
        } else if (value instanceof List<?> list) {
            this.technologies = list.stream().map(Object::toString).map(String::trim).filter(s -> !s.isEmpty()).toList();
            this.technologiesText = String.join(", ", this.technologies);
        } else if (value instanceof String str) {
            this.technologiesText = str;
            this.technologies = Arrays.stream(str.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }

    public String getTechnologiesText() {
        return technologiesText != null ? technologiesText : (technologies != null ? String.join(", ", technologies) : "");
    }

    public void setTechnologiesText(String technologiesText) {
        this.technologiesText = technologiesText;
    }
}
