package ai.jobachiever.careertracks.entity;

import ai.jobachiever.profiles.entity.CareerProfile;
import ai.jobachiever.users.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "career_tracks")
public class CareerTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private CareerProfile profile;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "target_role", nullable = false, length = 255)
    private String targetRole;

    @Column(name = "target_seniority", length = 50)
    private String targetSeniority = "ENTRY_LEVEL";

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "preferred_locations", columnDefinition = "JSONB")
    private String preferredLocations = "[]";

    @Column(name = "employment_types", columnDefinition = "JSONB")
    private String employmentTypes = "[]";

    @Column(name = "industries", columnDefinition = "JSONB")
    private String industries = "[]";

    @Column(name = "target_companies", columnDefinition = "JSONB")
    private String targetCompanies = "[]";

    @Column(name = "required_skills", columnDefinition = "JSONB")
    private String requiredSkills = "[]";

    @Column(name = "preferred_skills", columnDefinition = "JSONB")
    private String preferredSkills = "[]";

    @Column(name = "career_goals", columnDefinition = "TEXT")
    private String careerGoals;

    @Column(name = "priority", nullable = false)
    private int priority = 1;

    @Column(name = "is_primary", nullable = false)
    private boolean primary = false;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public CareerTrack() {
    }

    public CareerTrack(User user, CareerProfile profile, String name, String targetRole) {
        this.user = user;
        this.profile = profile;
        this.name = name;
        this.targetRole = targetRole;
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

    public CareerProfile getProfile() {
        return profile;
    }

    public void setProfile(CareerProfile profile) {
        this.profile = profile;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getTargetSeniority() {
        return targetSeniority;
    }

    public void setTargetSeniority(String targetSeniority) {
        this.targetSeniority = targetSeniority;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPreferredLocations() {
        return preferredLocations;
    }

    public void setPreferredLocations(String preferredLocations) {
        this.preferredLocations = preferredLocations;
    }

    public String getEmploymentTypes() {
        return employmentTypes;
    }

    public void setEmploymentTypes(String employmentTypes) {
        this.employmentTypes = employmentTypes;
    }

    public String getIndustries() {
        return industries;
    }

    public void setIndustries(String industries) {
        this.industries = industries;
    }

    public String getTargetCompanies() {
        return targetCompanies;
    }

    public void setTargetCompanies(String targetCompanies) {
        this.targetCompanies = targetCompanies;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getPreferredSkills() {
        return preferredSkills;
    }

    public void setPreferredSkills(String preferredSkills) {
        this.preferredSkills = preferredSkills;
    }

    public String getCareerGoals() {
        return careerGoals;
    }

    public void setCareerGoals(String careerGoals) {
        this.careerGoals = careerGoals;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public boolean isPrimary() {
        return primary;
    }

    public void setPrimary(boolean primary) {
        this.primary = primary;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
