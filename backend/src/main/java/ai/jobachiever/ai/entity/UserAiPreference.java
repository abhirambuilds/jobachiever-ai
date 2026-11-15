package ai.jobachiever.ai.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing an authenticated user's AI provider selection, model hyperparameter
 * preferences, and explicit external data processing consent.
 */
@Entity
@Table(name = "user_ai_preferences")
public class UserAiPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "selected_provider", nullable = false, length = 32)
    private String selectedProvider = "GROQ";

    @Column(name = "preferred_model", length = 128)
    private String preferredModel;

    @Column(name = "temperature", nullable = false)
    private Double temperature = 0.2;

    @Column(name = "max_tokens", nullable = false)
    private Integer maxTokens = 2048;

    @Column(name = "external_processing_consent", nullable = false)
    private boolean externalProcessingConsent = false;

    @Column(name = "consent_updated_at")
    private Instant consentUpdatedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UserAiPreference() {
    }

    public UserAiPreference(UUID userId) {
        this.userId = userId;
        this.selectedProvider = "GROQ";
        this.preferredModel = "llama-3.3-70b-versatile";
        this.temperature = 0.2;
        this.maxTokens = 2048;
        this.externalProcessingConsent = false;
    }

    public UserAiPreference(UUID userId, String selectedProvider, String preferredModel,
                            Double temperature, Integer maxTokens, boolean externalProcessingConsent) {
        this.userId = userId;
        this.selectedProvider = selectedProvider != null ? selectedProvider : "GROQ";
        this.preferredModel = preferredModel;
        this.temperature = temperature != null ? temperature : 0.2;
        this.maxTokens = maxTokens != null ? maxTokens : 2048;
        this.externalProcessingConsent = externalProcessingConsent;
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

    public String getSelectedProvider() {
        return selectedProvider;
    }

    public void setSelectedProvider(String selectedProvider) {
        this.selectedProvider = selectedProvider;
    }

    public String getPreferredModel() {
        return preferredModel;
    }

    public void setPreferredModel(String preferredModel) {
        this.preferredModel = preferredModel;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Integer getMaxTokens() {
        return maxTokens;
    }

    public void setMaxTokens(Integer maxTokens) {
        this.maxTokens = maxTokens;
    }

    public boolean isExternalProcessingConsent() {
        return externalProcessingConsent;
    }

    public void setExternalProcessingConsent(boolean externalProcessingConsent) {
        this.externalProcessingConsent = externalProcessingConsent;
    }

    public Instant getConsentUpdatedAt() {
        return consentUpdatedAt;
    }

    public void setConsentUpdatedAt(Instant consentUpdatedAt) {
        this.consentUpdatedAt = consentUpdatedAt;
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
