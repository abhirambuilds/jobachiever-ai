package ai.jobachiever.resumes.studio.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Contextual metadata regarding the resume section, candidate role, or target job.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResumeStudioContextDto {

    private String section;
    private String role;
    private String company;

    @JsonProperty("job_title")
    private String jobTitle;

    @JsonProperty("target_job_description")
    private String targetJobDescription;

    @JsonProperty("target_job_requirements")
    private List<String> targetJobRequirements;

    @JsonProperty("verified_skills")
    private List<String> verifiedSkills;

    public ResumeStudioContextDto() {
    }

    public ResumeStudioContextDto(String section, String role, String company, String jobTitle,
                                  String targetJobDescription, List<String> targetJobRequirements,
                                  List<String> verifiedSkills) {
        this.section = section;
        this.role = role;
        this.company = company;
        this.jobTitle = jobTitle;
        this.targetJobDescription = targetJobDescription;
        this.targetJobRequirements = targetJobRequirements;
        this.verifiedSkills = verifiedSkills;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getTargetJobDescription() {
        return targetJobDescription;
    }

    public void setTargetJobDescription(String targetJobDescription) {
        this.targetJobDescription = targetJobDescription;
    }

    public List<String> getTargetJobRequirements() {
        return targetJobRequirements;
    }

    public void setTargetJobRequirements(List<String> targetJobRequirements) {
        this.targetJobRequirements = targetJobRequirements;
    }

    public List<String> getVerifiedSkills() {
        return verifiedSkills;
    }

    public void setVerifiedSkills(List<String> verifiedSkills) {
        this.verifiedSkills = verifiedSkills;
    }
}
