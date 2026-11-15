package ai.jobachiever.ai.dto;

import java.time.Instant;

public class UserAiPreferenceDto {

    private String selectedProvider;
    private String preferredModel;
    private Double temperature;
    private Integer maxTokens;
    private boolean externalProcessingConsent;
    private Instant consentUpdatedAt;
    private Instant updatedAt;

    public UserAiPreferenceDto() {
    }

    public UserAiPreferenceDto(String selectedProvider, String preferredModel, Double temperature,
                               Integer maxTokens, boolean externalProcessingConsent,
                               Instant consentUpdatedAt, Instant updatedAt) {
        this.selectedProvider = selectedProvider;
        this.preferredModel = preferredModel;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.externalProcessingConsent = externalProcessingConsent;
        this.consentUpdatedAt = consentUpdatedAt;
        this.updatedAt = updatedAt;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
