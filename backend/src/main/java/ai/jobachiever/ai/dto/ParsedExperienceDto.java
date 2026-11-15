package ai.jobachiever.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ParsedExperienceDto {

    private String company;
    private String role;
    private String location;
    private String startDate;
    private String endDate;
    private Boolean isCurrent;
    private List<String> bulletPoints = new ArrayList<>();
    private String originalText;
    private String confidence;
    private String verificationStatus;

    public ParsedExperienceDto() {
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

    public Boolean getIsCurrent() {
        return isCurrent;
    }

    public void setIsCurrent(Boolean current) {
        isCurrent = current;
    }

    public List<String> getBulletPoints() {
        return bulletPoints;
    }

    public void setBulletPoints(List<String> bulletPoints) {
        this.bulletPoints = bulletPoints != null ? bulletPoints : new ArrayList<>();
    }

    public String getOriginalText() {
        return originalText;
    }

    public void setOriginalText(String originalText) {
        this.originalText = originalText;
    }

    public String getConfidence() {
        return confidence;
    }

    public void setConfidence(String confidence) {
        this.confidence = confidence;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }
}
