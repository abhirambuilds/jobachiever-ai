package ai.jobachiever.ai.dto;

import java.util.List;

public class ProviderDetailsDto {

    private String providerId;
    private String displayName;
    private boolean isPrimary;
    private boolean isConfigured;
    private boolean isAvailable;
    private String defaultModel;
    private List<String> supportedModels;
    private String description;
    private String rateLimitNotice;
    private String privacyNotice;

    public ProviderDetailsDto() {
    }

    public ProviderDetailsDto(String providerId, String displayName, boolean isPrimary,
                              boolean isConfigured, boolean isAvailable, String defaultModel,
                              List<String> supportedModels, String description,
                              String rateLimitNotice, String privacyNotice) {
        this.providerId = providerId;
        this.displayName = displayName;
        this.isPrimary = isPrimary;
        this.isConfigured = isConfigured;
        this.isAvailable = isAvailable;
        this.defaultModel = defaultModel;
        this.supportedModels = supportedModels;
        this.description = description;
        this.rateLimitNotice = rateLimitNotice;
        this.privacyNotice = privacyNotice;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(boolean isPrimary) {
        this.isPrimary = isPrimary;
    }

    public boolean getIsConfigured() {
        return isConfigured;
    }

    public void setIsConfigured(boolean isConfigured) {
        this.isConfigured = isConfigured;
    }

    public boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public String getDefaultModel() {
        return defaultModel;
    }

    public void setDefaultModel(String defaultModel) {
        this.defaultModel = defaultModel;
    }

    public List<String> getSupportedModels() {
        return supportedModels;
    }

    public void setSupportedModels(List<String> supportedModels) {
        this.supportedModels = supportedModels;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRateLimitNotice() {
        return rateLimitNotice;
    }

    public void setRateLimitNotice(String rateLimitNotice) {
        this.rateLimitNotice = rateLimitNotice;
    }

    public String getPrivacyNotice() {
        return privacyNotice;
    }

    public void setPrivacyNotice(String privacyNotice) {
        this.privacyNotice = privacyNotice;
    }
}
