package ai.jobachiever.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ParsedResumeDto {

    private ParsedPersonalInfoDto personalInformation = new ParsedPersonalInfoDto();
    private String summary;
    private List<ParsedEducationDto> education = new ArrayList<>();
    private List<ParsedSkillDto> skills = new ArrayList<>();
    private List<ParsedExperienceDto> experience = new ArrayList<>();
    private List<ParsedProjectDto> projects = new ArrayList<>();
    private List<ParsedCertificationDto> certifications = new ArrayList<>();
    private List<ParsedAchievementDto> achievements = new ArrayList<>();
    private List<ParsedPublicationDto> publications = new ArrayList<>();
    private List<ParsedOtherSectionDto> otherSections = new ArrayList<>();
    private String rawText;
    private ParsedResumeMetadataDto metadata = new ParsedResumeMetadataDto();

    public ParsedResumeDto() {
    }

    public ParsedPersonalInfoDto getPersonalInformation() {
        return personalInformation;
    }

    public void setPersonalInformation(ParsedPersonalInfoDto personalInformation) {
        this.personalInformation = personalInformation != null ? personalInformation : new ParsedPersonalInfoDto();
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<ParsedEducationDto> getEducation() {
        return education;
    }

    public void setEducation(List<ParsedEducationDto> education) {
        this.education = education != null ? education : new ArrayList<>();
    }

    public List<ParsedSkillDto> getSkills() {
        return skills;
    }

    public void setSkills(List<ParsedSkillDto> skills) {
        this.skills = skills != null ? skills : new ArrayList<>();
    }

    public List<ParsedExperienceDto> getExperience() {
        return experience;
    }

    public void setExperience(List<ParsedExperienceDto> experience) {
        this.experience = experience != null ? experience : new ArrayList<>();
    }

    public List<ParsedProjectDto> getProjects() {
        return projects;
    }

    public void setProjects(List<ParsedProjectDto> projects) {
        this.projects = projects != null ? projects : new ArrayList<>();
    }

    public List<ParsedCertificationDto> getCertifications() {
        return certifications;
    }

    public void setCertifications(List<ParsedCertificationDto> certifications) {
        this.certifications = certifications != null ? certifications : new ArrayList<>();
    }

    public List<ParsedAchievementDto> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<ParsedAchievementDto> achievements) {
        this.achievements = achievements != null ? achievements : new ArrayList<>();
    }

    public List<ParsedPublicationDto> getPublications() {
        return publications;
    }

    public void setPublications(List<ParsedPublicationDto> publications) {
        this.publications = publications != null ? publications : new ArrayList<>();
    }

    public List<ParsedOtherSectionDto> getOtherSections() {
        return otherSections;
    }

    public void setOtherSections(List<ParsedOtherSectionDto> otherSections) {
        this.otherSections = otherSections != null ? otherSections : new ArrayList<>();
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }

    public ParsedResumeMetadataDto getMetadata() {
        return metadata;
    }

    public void setMetadata(ParsedResumeMetadataDto metadata) {
        this.metadata = metadata != null ? metadata : new ParsedResumeMetadataDto();
    }
}
