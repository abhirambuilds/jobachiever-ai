package ai.jobachiever.profiles.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;

import java.util.*;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectDto {

    private UUID id;

    @JsonAlias({"name", "title"})
    @Size(max = 255, message = "Project title cannot exceed 255 characters")
    private String title;

    @Size(max = 255, message = "Role cannot exceed 255 characters")
    private String role;

    private String startDate;

    private String endDate;

    @JsonAlias({"current", "isCurrent"})
    private Boolean current = false;

    private String description;

    private String problemSolved;

    private String keyAchievements;

    private List<String> technologies = new ArrayList<>();

    private String technologiesText;

    @JsonAlias({"projectUrl", "liveDemoUrl"})
    @Size(max = 500, message = "Project URL cannot exceed 500 characters")
    private String projectUrl;

    @Size(max = 500, message = "GitHub URL cannot exceed 500 characters")
    private String githubUrl;

    public ProjectDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getName() {
        return title;
    }

    public void setName(String name) {
        this.title = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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

    public String getProblemSolved() {
        return problemSolved;
    }

    public void setProblemSolved(String problemSolved) {
        this.problemSolved = problemSolved;
    }

    public String getKeyAchievements() {
        return keyAchievements;
    }

    public void setKeyAchievements(String keyAchievements) {
        this.keyAchievements = keyAchievements;
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

    public String getProjectUrl() {
        return projectUrl;
    }

    public void setProjectUrl(String projectUrl) {
        this.projectUrl = projectUrl;
    }

    public String getLiveDemoUrl() {
        return projectUrl;
    }

    public void setLiveDemoUrl(String liveDemoUrl) {
        this.projectUrl = liveDemoUrl;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }
}
