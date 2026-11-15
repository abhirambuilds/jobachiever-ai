package ai.jobachiever.ai.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class UpdateAiPreferencesRequestDto {

    @NotBlank(message = "selectedProvider is required")
    @Pattern(regexp = "^(?i)(GROQ|GEMINI)$", message = "selectedProvider must be GROQ or GEMINI")
    private String selectedProvider;

    private String preferredModel;

    @NotNull(message = "temperature is required")
    @DecimalMin(value = "0.0", message = "temperature must be between 0.0 and 2.0")
    @DecimalMax(value = "2.0", message = "temperature must be between 0.0 and 2.0")
    private Double temperature;

    @NotNull(message = "maxTokens is required")
    @Min(value = 128, message = "maxTokens must be between 128 and 8192")
    @Max(value = 8192, message = "maxTokens must be between 128 and 8192")
    private Integer maxTokens;

    @NotNull(message = "externalProcessingConsent is required")
    private Boolean externalProcessingConsent;

    public UpdateAiPreferencesRequestDto() {
    }

    public UpdateAiPreferencesRequestDto(String selectedProvider, String preferredModel,
                                         Double temperature, Integer maxTokens,
                                         Boolean externalProcessingConsent) {
        this.selectedProvider = selectedProvider;
        this.preferredModel = preferredModel;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.externalProcessingConsent = externalProcessingConsent;
    }

    public String getSelectedProvider() {
        return selectedProvider != null ? selectedProvider.toUpperCase() : null;
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

    public Boolean getExternalProcessingConsent() {
        return externalProcessingConsent;
    }

    public void setExternalProcessingConsent(Boolean externalProcessingConsent) {
        this.externalProcessingConsent = externalProcessingConsent;
    }
}
