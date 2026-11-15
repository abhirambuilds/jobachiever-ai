package ai.jobachiever.resumes.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing an AI-generated resume quality assessment and multi-dimensional analysis report.
 */
@Entity
@Table(name = "resume_analyses")
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "resume_id", nullable = false)
    private UUID resumeId;

    @Column(name = "version_id")
    private UUID versionId;

    @Column(name = "provider", nullable = false, length = 32)
    private String provider;

    @Column(name = "model", length = 128)
    private String model;

    @Column(name = "overall_score", nullable = false)
    private int overallScore;

    @Column(name = "overall_rating", nullable = false, length = 32)
    private String overallRating;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "analysis_json", nullable = false, columnDefinition = "JSONB")
    private String analysisJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public ResumeAnalysis() {
    }

    public ResumeAnalysis(UUID userId, UUID resumeId, UUID versionId, String provider, String model,
                          int overallScore, String overallRating, String summary, String analysisJson) {
        this.userId = userId;
        this.resumeId = resumeId;
        this.versionId = versionId;
        this.provider = provider;
        this.model = model;
        this.overallScore = overallScore;
        this.overallRating = overallRating;
        this.summary = summary;
        this.analysisJson = analysisJson;
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

    public UUID getVersionId() {
        return versionId;
    }

    public void setVersionId(UUID versionId) {
        this.versionId = versionId;
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

    public String getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(String overallRating) {
        this.overallRating = overallRating;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getAnalysisJson() {
        return analysisJson;
    }

    public void setAnalysisJson(String analysisJson) {
        this.analysisJson = analysisJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
