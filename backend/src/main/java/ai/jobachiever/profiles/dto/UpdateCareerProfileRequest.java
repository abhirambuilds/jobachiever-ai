package ai.jobachiever.profiles.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateCareerProfileRequest {

    @Valid
    private PersonalInfoDto personalInfo;

    @Valid
    private ProfessionalSummaryDto professionalSummary;

    @Valid
    private List<EducationDto> education;

    @Valid
    private List<SkillDto> skills;

    @Valid
    private List<ExperienceDto> experience;

    @Valid
    private List<ProjectDto> projects;

    @Valid
    private List<CertificationDto> certifications;

    @Valid
    private List<AchievementDto> achievements;

    @Valid
    private CareerPreferencesDto careerPreferences;

    public UpdateCareerProfileRequest() {
    }

    public PersonalInfoDto getPersonalInfo() {
        return personalInfo;
    }

    public void setPersonalInfo(PersonalInfoDto personalInfo) {
        this.personalInfo = personalInfo;
    }

    public ProfessionalSummaryDto getProfessionalSummary() {
        return professionalSummary;
    }

    public void setProfessionalSummary(ProfessionalSummaryDto professionalSummary) {
        this.professionalSummary = professionalSummary;
    }

    public List<EducationDto> getEducation() {
        return education;
    }

    public void setEducation(List<EducationDto> education) {
        this.education = education;
    }

    public List<SkillDto> getSkills() {
        return skills;
    }

    public void setSkills(List<SkillDto> skills) {
        this.skills = skills;
    }

    public List<ExperienceDto> getExperience() {
        return experience;
    }

    public void setExperience(List<ExperienceDto> experience) {
        this.experience = experience;
    }

    public List<ProjectDto> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectDto> projects) {
        this.projects = projects;
    }

    public List<CertificationDto> getCertifications() {
        return certifications;
    }

    public void setCertifications(List<CertificationDto> certifications) {
        this.certifications = certifications;
    }

    public List<AchievementDto> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<AchievementDto> achievements) {
        this.achievements = achievements;
    }

    public CareerPreferencesDto getCareerPreferences() {
        return careerPreferences;
    }

    public void setCareerPreferences(CareerPreferencesDto careerPreferences) {
        this.careerPreferences = careerPreferences;
    }
}
