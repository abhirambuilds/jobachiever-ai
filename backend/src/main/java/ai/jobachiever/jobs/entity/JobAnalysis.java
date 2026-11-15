package ai.jobachiever.jobs.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing an AI-analyzed and structured job description report,
 * decomposing qualifications, responsibilities, technical skills, and ambiguities.
 */
@Entity
@Table(name = "job_analyses")
public class JobAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "job_id")
    private UUID jobId;

    @Column(name = "provider", nullable = false, length = 32)
    private String provider;

    @Column(name = "model", length = 128)
    private String model;

    @Column(name = "job_title", length = 255)
    private String jobTitle;

    @Column(name = "company_name", length = 255)
    private String companyName;

    @Column(name = "seniority", length = 32)
    private String seniority;

    @Column(name = "employment_type", length = 32)
    private String employmentType;

    @Column(name = "work_arrangement", length = 32)
    private String workArrangement;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "experience_summary", length = 255)
    private String experienceSummary;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "analysis_json", nullable = false, columnDefinition = "JSONB")
    private String analysisJson;

    @Column(name = "raw_description_hash", length = 64)
    private String rawDescriptionHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public JobAnalysis() {
    }

    public JobAnalysis(UUID userId, UUID jobId, String provider, String model,
                       String jobTitle, String companyName, String seniority,
                       String employmentType, String workArrangement, String location,
                       String experienceSummary, String summary, String analysisJson,
                       String rawDescriptionHash) {
        this.userId = userId;
        this.jobId = jobId;
        this.provider = provider;
        this.model = model;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.seniority = seniority;
        this.employmentType = employmentType;
        this.workArrangement = workArrangement;
        this.location = location;
        this.experienceSummary = experienceSummary;
        this.summary = summary;
        this.analysisJson = analysisJson;
        this.rawDescriptionHash = rawDescriptionHash;
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

    public UUID getJobId() {
        return jobId;
    }

    public void setJobId(UUID jobId) {
        this.jobId = jobId;
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

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getSeniority() {
        return seniority;
    }

    public void setSeniority(String seniority) {
        this.seniority = seniority;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getWorkArrangement() {
        return workArrangement;
    }

    public void setWorkArrangement(String workArrangement) {
        this.workArrangement = workArrangement;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getExperienceSummary() {
        return experienceSummary;
    }

    public void setExperienceSummary(String experienceSummary) {
        this.experienceSummary = experienceSummary;
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

    public String getRawDescriptionHash() {
        return rawDescriptionHash;
    }

    public void setRawDescriptionHash(String rawDescriptionHash) {
        this.rawDescriptionHash = rawDescriptionHash;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
