package ai.jobachiever.profiles.dto;

import ai.jobachiever.profiles.entity.CareerStage;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfessionalSummaryDto {

    @Size(max = 255, message = "Headline cannot exceed 255 characters")
    private String headline;

    private String summary;

    private CareerStage careerStage = CareerStage.ENTRY_LEVEL;

    private BigDecimal yearsOfExperience = BigDecimal.ZERO;

    public ProfessionalSummaryDto() {
    }

    public ProfessionalSummaryDto(String headline, String summary, CareerStage careerStage, BigDecimal yearsOfExperience) {
        this.headline = headline;
        this.summary = summary;
        this.careerStage = careerStage != null ? careerStage : CareerStage.ENTRY_LEVEL;
        this.yearsOfExperience = yearsOfExperience != null ? yearsOfExperience : BigDecimal.ZERO;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public CareerStage getCareerStage() {
        return careerStage;
    }

    public void setCareerStage(CareerStage careerStage) {
        this.careerStage = careerStage;
    }

    public BigDecimal getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(BigDecimal yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }
}
