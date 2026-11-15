package ai.jobachiever.profiles.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EducationDto {

    private UUID id;

    @Size(max = 255, message = "Institution name cannot exceed 255 characters")
    private String institution;

    @Size(max = 255, message = "Degree cannot exceed 255 characters")
    private String degree;

    @Size(max = 255, message = "Field of study cannot exceed 255 characters")
    private String fieldOfStudy;

    private String startDate;

    @JsonAlias({"endDate", "graduationDate"})
    private String endDate;

    @JsonAlias({"current", "isCurrent"})
    private Boolean current = false;

    @JsonAlias({"gradeOrGpa", "gpa"})
    @Size(max = 50, message = "Grade/GPA cannot exceed 50 characters")
    private String gradeOrGpa;

    @JsonAlias({"description", "coursework"})
    private String description;

    public EducationDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getInstitution() {
        return institution;
    }

    public void setInstitution(String institution) {
        this.institution = institution;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public String getFieldOfStudy() {
        return fieldOfStudy;
    }

    public void setFieldOfStudy(String fieldOfStudy) {
        this.fieldOfStudy = fieldOfStudy;
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

    public String getGraduationDate() {
        return endDate;
    }

    public void setGraduationDate(String graduationDate) {
        this.endDate = graduationDate;
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

    public String getGradeOrGpa() {
        return gradeOrGpa;
    }

    public void setGradeOrGpa(String gradeOrGpa) {
        this.gradeOrGpa = gradeOrGpa;
    }

    public String getGpa() {
        return gradeOrGpa;
    }

    public void setGpa(String gpa) {
        this.gradeOrGpa = gpa;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCoursework() {
        return description;
    }

    public void setCoursework(String coursework) {
        this.description = coursework;
    }
}
