package ai.jobachiever.career.dto;

import java.util.List;

public class SkillGapItemDto {

    private String canonicalName;
    private String category;
    private String classification;
    private String evidenceStatus;
    private int priorityScore;
    private String priorityLevel;
    private String importanceRationale;
    private List<String> requiredForRoles;
    private List<String> prerequisites;
    private List<String> candidateEvidence;

    public SkillGapItemDto() {
    }

    public SkillGapItemDto(String canonicalName, String category, String classification,
                           String evidenceStatus, int priorityScore, String priorityLevel,
                           String importanceRationale, List<String> requiredForRoles,
                           List<String> prerequisites, List<String> candidateEvidence) {
        this.canonicalName = canonicalName;
        this.category = category;
        this.classification = classification;
        this.evidenceStatus = evidenceStatus;
        this.priorityScore = priorityScore;
        this.priorityLevel = priorityLevel;
        this.importanceRationale = importanceRationale;
        this.requiredForRoles = requiredForRoles;
        this.prerequisites = prerequisites;
        this.candidateEvidence = candidateEvidence;
    }

    public String getCanonicalName() {
        return canonicalName;
    }

    public void setCanonicalName(String canonicalName) {
        this.canonicalName = canonicalName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getClassification() {
        return classification;
    }

    public void setClassification(String classification) {
        this.classification = classification;
    }

    public String getEvidenceStatus() {
        return evidenceStatus;
    }

    public void setEvidenceStatus(String evidenceStatus) {
        this.evidenceStatus = evidenceStatus;
    }

    public int getPriorityScore() {
        return priorityScore;
    }

    public void setPriorityScore(int priorityScore) {
        this.priorityScore = priorityScore;
    }

    public String getPriorityLevel() {
        return priorityLevel;
    }

    public void setPriorityLevel(String priorityLevel) {
        this.priorityLevel = priorityLevel;
    }

    public String getImportanceRationale() {
        return importanceRationale;
    }

    public void setImportanceRationale(String importanceRationale) {
        this.importanceRationale = importanceRationale;
    }

    public List<String> getRequiredForRoles() {
        return requiredForRoles;
    }

    public void setRequiredForRoles(List<String> requiredForRoles) {
        this.requiredForRoles = requiredForRoles;
    }

    public List<String> getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(List<String> prerequisites) {
        this.prerequisites = prerequisites;
    }

    public List<String> getCandidateEvidence() {
        return candidateEvidence;
    }

    public void setCandidateEvidence(List<String> candidateEvidence) {
        this.candidateEvidence = candidateEvidence;
    }
}
