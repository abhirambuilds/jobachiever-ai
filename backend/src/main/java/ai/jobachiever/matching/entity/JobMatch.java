package ai.jobachiever.matching.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing an explainable, evidence-grounded Resume-to-Job compatibility analysis.
 */
@Entity
@Table(name = "job_matches")
public class JobMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "resume_id", nullable = false)
    private UUID resumeId;

    @Column(name = "resume_version_id")
    private UUID resumeVersionId;

    @Column(name = "job_id")
    private UUID jobId;

    @Column(name = "job_analysis_id")
    private UUID jobAnalysisId;

    @Column(name = "provider", nullable = false, length = 32)
    private String provider;

    @Column(name = "model", length = 128)
    private String model;

    @Column(name = "overall_score", nullable = false)
    private int overallScore;

    @Column(name = "required_skills_score")
    private Integer requiredSkillsScore;

    @Column(name = "preferred_skills_score")
    private Integer preferredSkillsScore;

    @Column(name = "experience_score")
    private Integer experienceScore;

    @Column(name = "qualifications_score")
    private Integer qualificationsScore;

    @Column(name = "responsibilities_score")
    private Integer responsibilitiesScore;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "match_summary", columnDefinition = "TEXT")
    private String matchSummary;

    @Column(name = "match_json", nullable = false, columnDefinition = "JSONB")
    private String matchJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public JobMatch() {
    }

    public JobMatch(UUID userId, UUID resumeId, UUID resumeVersionId, UUID jobId, UUID jobAnalysisId,
                    String provider, String model, int overallScore, Integer requiredSkillsScore,
                    Integer preferredSkillsScore, Integer experienceScore, Integer qualificationsScore,
                    Integer responsibilitiesScore, Double confidenceScore, String matchSummary,
                    String matchJson) {
        this.userId = userId;
        this.resumeId = resumeId;
        this.resumeVersionId = resumeVersionId;
        this.jobId = jobId;
        this.jobAnalysisId = jobAnalysisId;
        this.provider = provider;
        this.model = model;
        this.overallScore = overallScore;
        this.requiredSkillsScore = requiredSkillsScore;
        this.preferredSkillsScore = preferredSkillsScore;
        this.experienceScore = experienceScore;
        this.qualificationsScore = qualificationsScore;
        this.responsibilitiesScore = responsibilitiesScore;
        this.confidenceScore = confidenceScore;
        this.matchSummary = matchSummary;
        this.matchJson = matchJson;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
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

    public UUID getResumeId() {
        return resumeId;
    }

    public void setResumeId(UUID resumeId) {
        this.resumeId = resumeId;
    }

    public UUID getResumeVersionId() {
        return resumeVersionId;
    }

    public void setResumeVersionId(UUID resumeVersionId) {
        this.resumeVersionId = resumeVersionId;
    }

    public UUID getJobId() {
        return jobId;
    }

    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }

    public UUID getJobAnalysisId() {
        return jobAnalysisId;
    }

    public void setJobAnalysisId(UUID jobAnalysisId) {
        this.jobAnalysisId = jobAnalysisId;
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

    public int getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(int overallScore) {
        this.overallScore = overallScore;
    }

    public Integer getRequiredSkillsScore() {
        return requiredSkillsScore;
    }

    public void setRequiredSkillsScore(Integer requiredSkillsScore) {
        this.requiredSkillsScore = requiredSkillsScore;
    }

    public Integer getPreferredSkillsScore() {
        return preferredSkillsScore;
    }

    public void setPreferredSkillsScore(Integer preferredSkillsScore) {
        this.preferredSkillsScore = preferredSkillsScore;
    }

    public Integer getExperienceScore() {
        return experienceScore;
    }

    public void setExperienceScore(Integer experienceScore) {
        this.experienceScore = experienceScore;
    }

    public Integer getQualificationsScore() {
        return qualificationsScore;
    }

    public void setQualificationsScore(Integer qualificationsScore) {
        this.qualificationsScore = qualificationsScore;
    }

    public Integer getResponsibilitiesScore() {
        return responsibilitiesScore;
    }

    public void setResponsibilitiesScore(Integer responsibilitiesScore) {
        this.responsibilitiesScore = responsibilitiesScore;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getMatchSummary() {
        return matchSummary;
    }

    public void setMatchSummary(String matchSummary) {
        this.matchSummary = matchSummary;
    }

    public String getMatchJson() {
        return matchJson;
    }

    public void setMatchJson(String matchJson) {
        this.matchJson = matchJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
