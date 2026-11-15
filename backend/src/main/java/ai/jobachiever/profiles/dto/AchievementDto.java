package ai.jobachiever.profiles.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AchievementDto {

    private UUID id;

    @Size(max = 255, message = "Achievement title cannot exceed 255 characters")
    private String title;

    private String description;

    @JsonAlias({"date", "achievementDate"})
    private String achievementDate;

    @JsonAlias({"issuer", "issuingOrg"})
    @Size(max = 255, message = "Issuer cannot exceed 255 characters")
    private String issuer;

    public AchievementDto() {
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAchievementDate() {
        return achievementDate;
    }

    public void setAchievementDate(String achievementDate) {
        this.achievementDate = achievementDate;
    }

    public String getDate() {
        return achievementDate;
    }

    public void setDate(String date) {
        this.achievementDate = date;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getIssuingOrg() {
        return issuer;
    }

    public void setIssuingOrg(String issuingOrg) {
        this.issuer = issuingOrg;
    }
}
