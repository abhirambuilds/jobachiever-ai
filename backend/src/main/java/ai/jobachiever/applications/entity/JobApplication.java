package ai.jobachiever.applications.entity;

import ai.jobachiever.careertracks.entity.CareerTrack;
import ai.jobachiever.jobs.entity.Job;
import ai.jobachiever.resumes.entity.ResumeVersion;
import ai.jobachiever.users.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_version_id")
    private ResumeVersion resumeVersion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "career_track_id")
    private CareerTrack careerTrack;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ApplicationStatus status = ApplicationStatus.SAVED;

    @Column(name = "applied_at")
    private Instant appliedAt;

    @Column(name = "deadline")
    private Instant deadline;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "company_contact_info", columnDefinition = "JSONB")
    private String companyContactInfo = "{}";

    @Column(name = "interview_dates", columnDefinition = "JSONB")
    private String interviewDates = "[]";

    @Column(name = "offer_details", columnDefinition = "JSONB")
    private String offerDetails = "{}";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public JobApplication() {
    }

    public JobApplication(User user, Job job) {
        this.user = user;
        this.job = job;
        this.status = ApplicationStatus.SAVED;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public ResumeVersion getResumeVersion() {
        return resumeVersion;
    }

    public void setResumeVersion(ResumeVersion resumeVersion) {
        this.resumeVersion = resumeVersion;
    }

    public CareerTrack getCareerTrack() {
        return careerTrack;
    }

    public void setCareerTrack(CareerTrack careerTrack) {
        this.careerTrack = careerTrack;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public Instant getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(Instant appliedAt) {
        this.appliedAt = appliedAt;
    }

    public Instant getDeadline() {
        return deadline;
    }

    public void setDeadline(Instant deadline) {
        this.deadline = deadline;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCompanyContactInfo() {
        return companyContactInfo;
    }

    public void setCompanyContactInfo(String companyContactInfo) {
        this.companyContactInfo = companyContactInfo;
    }

    public String getInterviewDates() {
        return interviewDates;
    }

    public void setInterviewDates(String interviewDates) {
        this.interviewDates = interviewDates;
    }

    public String getOfferDetails() {
        return offerDetails;
    }

    public void setOfferDetails(String offerDetails) {
        this.offerDetails = offerDetails;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
