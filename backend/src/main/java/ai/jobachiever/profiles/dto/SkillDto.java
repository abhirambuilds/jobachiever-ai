package ai.jobachiever.profiles.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SkillDto {

    private UUID id;

    @Size(max = 100, message = "Skill name cannot exceed 100 characters")
    private String name;

    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category = "TECHNICAL";

    @JsonAlias({"proficiencyLevel", "proficiency"})
    private String proficiencyLevel = "INTERMEDIATE";

    private BigDecimal yearsOfExperience;

    @JsonAlias({"verified", "isVerified"})
    private Boolean verified = false;

    private String evidence;

    public SkillDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getProficiencyLevel() {
        return proficiencyLevel;
    }

    public void setProficiencyLevel(String proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
    }

    public String getProficiency() {
        return proficiencyLevel;
    }

    public void setProficiency(String proficiency) {
        this.proficiencyLevel = proficiency;
    }

    public BigDecimal getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(BigDecimal yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public Boolean getVerified() {
        return verified != null ? verified : false;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public Boolean getIsVerified() {
        return getVerified();
    }

    public void setIsVerified(Boolean isVerified) {
        this.verified = isVerified;
    }

    public String getEvidence() {
        return evidence;
    }

    public void setEvidence(String evidence) {
        this.evidence = evidence;
    }
}
