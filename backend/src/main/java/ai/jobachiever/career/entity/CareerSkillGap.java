package ai.jobachiever.career.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing an AI-analyzed skill gap evaluation for a career track.
 */
@Entity
@Table(name = "career_skill_gaps")
public class CareerSkillGap {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "career_track_id", nullable = false)
    private UUID careerTrackId;

    @Column(name = "target_role", nullable = false, length = 255)
    private String targetRole;

    @Column(name = "provider", nullable = false, length = 32)
    private String provider = "GROQ";

    @Column(name = "model", length = 128)
    private String model;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "demonstrated_skills", columnDefinition = "JSONB")
    private String demonstratedSkills = "[]";

    @Column(name = "developing_skills", columnDefinition = "JSONB")
    private String developingSkills = "[]";

    @Column(name = "missing_evidence_skills", columnDefinition = "JSONB")
    private String missingEvidenceSkills = "[]";

    @Column(name = "critical_priorities", columnDefinition = "JSONB")
    private String criticalPriorities = "[]";

    @Column(name = "analysis_json", nullable = false, columnDefinition = "JSONB")
    private String analysisJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public CareerSkillGap() {
    }

    public CareerSkillGap(UUID userId, UUID careerTrackId, String targetRole, String provider,
                          String model, String summary, String demonstratedSkills,
                          String developingSkills, String missingEvidenceSkills,
                          String criticalPriorities, String analysisJson) {
        this.userId = userId;
        this.careerTrackId = careerTrackId;
        this.targetRole = targetRole;
        this.provider = provider != null ? provider : "GROQ";
        this.model = model;
        this.summary = summary;
        this.demonstratedSkills = demonstratedSkills != null ? demonstratedSkills : "[]";
        this.developingSkills = developingSkills != null ? developingSkills : "[]";
        this.missingEvidenceSkills = missingEvidenceSkills != null ? missingEvidenceSkills : "[]";
        this.criticalPriorities = criticalPriorities != null ? criticalPriorities : "[]";
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

    public String getDemonstratedSkills() {
        return demonstratedSkills;
    }

    public void setDemonstratedSkills(String demonstratedSkills) {
        this.demonstratedSkills = demonstratedSkills;
    }

    public String getDevelopingSkills() {
        return developingSkills;
    }

    public void setDevelopingSkills(String developingSkills) {
        this.developingSkills = developingSkills;
    }

    public String getMissingEvidenceSkills() {
        return missingEvidenceSkills;
    }

    public void setMissingEvidenceSkills(String missingEvidenceSkills) {
        this.missingEvidenceSkills = missingEvidenceSkills;
    }

    public String getCriticalPriorities() {
        return criticalPriorities;
    }

    public void setCriticalPriorities(String criticalPriorities) {
        this.criticalPriorities = criticalPriorities;
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
