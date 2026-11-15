package ai.jobachiever.profiles.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CareerProfileResponse {

    private UUID id;
    private UUID userId;
    private String email;

    private PersonalInfoDto personalInfo;
    private ProfessionalSummaryDto professionalSummary;

    private List<EducationDto> education = new ArrayList<>();
    private List<SkillDto> skills = new ArrayList<>();
    private List<ExperienceDto> experience = new ArrayList<>();
    private List<ProjectDto> projects = new ArrayList<>();
    private List<CertificationDto> certifications = new ArrayList<>();
    private List<AchievementDto> achievements = new ArrayList<>();
    private CareerPreferencesDto careerPreferences;

    private int completionPercentage;
    private boolean verified;

    private Instant createdAt;
    private Instant updatedAt;

    public CareerProfileResponse() {
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
        this.education = education != null ? education : new ArrayList<>();
    }

    public List<SkillDto> getSkills() {
        return skills;
    }

    public void setSkills(List<SkillDto> skills) {
        this.skills = skills != null ? skills : new ArrayList<>();
    }

    public List<ExperienceDto> getExperience() {
        return experience;
    }

    public void setExperience(List<ExperienceDto> experience) {
        this.experience = experience != null ? experience : new ArrayList<>();
    }

    public List<ProjectDto> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectDto> projects) {
        this.projects = projects != null ? projects : new ArrayList<>();
    }

    public List<CertificationDto> getCertifications() {
        return certifications;
    }

    public void setCertifications(List<CertificationDto> certifications) {
        this.certifications = certifications != null ? certifications : new ArrayList<>();
    }

    public List<AchievementDto> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<AchievementDto> achievements) {
        this.achievements = achievements != null ? achievements : new ArrayList<>();
    }

    public CareerPreferencesDto getCareerPreferences() {
        return careerPreferences;
    }

    public void setCareerPreferences(CareerPreferencesDto careerPreferences) {
        this.careerPreferences = careerPreferences;
    }

    public int getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(int completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
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
