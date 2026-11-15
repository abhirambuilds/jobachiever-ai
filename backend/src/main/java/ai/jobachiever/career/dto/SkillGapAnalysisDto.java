package ai.jobachiever.career.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class SkillGapAnalysisDto {

    private UUID id;
    private UUID careerTrackId;
    private String targetRole;
    private String provider;
    private String model;
    private String summary;
    private List<SkillGapItemDto> demonstratedSkills;
    private List<SkillGapItemDto> developingSkills;
    private List<SkillGapItemDto> missingEvidenceSkills;
    private List<SkillGapItemDto> criticalPriorities;
    private List<SkillGapItemDto> allEvaluatedSkills;
    private Instant createdAt;

    public SkillGapAnalysisDto() {
    }

    public SkillGapAnalysisDto(UUID id, UUID careerTrackId, String targetRole, String provider,
                               String model, String summary, List<SkillGapItemDto> demonstratedSkills,
                               List<SkillGapItemDto> developingSkills, List<SkillGapItemDto> missingEvidenceSkills,
                               List<SkillGapItemDto> criticalPriorities, List<SkillGapItemDto> allEvaluatedSkills,
                               Instant createdAt) {
        this.id = id;
        this.careerTrackId = careerTrackId;
        this.targetRole = targetRole;
        this.provider = provider;
        this.model = model;
        this.summary = summary;
        this.demonstratedSkills = demonstratedSkills;
        this.developingSkills = developingSkills;
        this.missingEvidenceSkills = missingEvidenceSkills;
        this.criticalPriorities = criticalPriorities;
        this.allEvaluatedSkills = allEvaluatedSkills;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCareerTrackId() {
        return careerTrackId;
    }

    public void setCareerTrackId(UUID careerTrackId) {
        this.careerTrackId = careerTrackId;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<SkillGapItemDto> getDemonstratedSkills() {
        return demonstratedSkills;
    }

    public void setDemonstratedSkills(List<SkillGapItemDto> demonstratedSkills) {
        this.demonstratedSkills = demonstratedSkills;
    }

    public List<SkillGapItemDto> getDevelopingSkills() {
        return developingSkills;
    }

    public void setDevelopingSkills(List<SkillGapItemDto> developingSkills) {
        this.developingSkills = developingSkills;
    }

    public List<SkillGapItemDto> getMissingEvidenceSkills() {
        return missingEvidenceSkills;
    }

    public void setMissingEvidenceSkills(List<SkillGapItemDto> missingEvidenceSkills) {
        this.missingEvidenceSkills = missingEvidenceSkills;
    }

    public List<SkillGapItemDto> getCriticalPriorities() {
        return criticalPriorities;
    }

    public void setCriticalPriorities(List<SkillGapItemDto> criticalPriorities) {
        this.criticalPriorities = criticalPriorities;
    }

    public List<SkillGapItemDto> getAllEvaluatedSkills() {
        return allEvaluatedSkills;
    }

    public void setAllEvaluatedSkills(List<SkillGapItemDto> allEvaluatedSkills) {
        this.allEvaluatedSkills = allEvaluatedSkills;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
