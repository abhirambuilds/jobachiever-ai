package ai.jobachiever.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AIGenerationResponseDto {

    private String provider;
    private String model;
    private String content;
    private Map<String, Object> jsonData;
    private TokenUsageDto usage;
    private String finishReason;
    private List<String> validationWarnings;
    private Double processingTimeMs;

    public AIGenerationResponseDto() {
    }

    public AIGenerationResponseDto(String provider, String model, String content, Map<String, Object> jsonData,
                                   TokenUsageDto usage, String finishReason, List<String> validationWarnings,
                                   Double processingTimeMs) {
        this.provider = provider;
        this.model = model;
        this.content = content;
        this.jsonData = jsonData;
        this.usage = usage;
        this.finishReason = finishReason;
        this.validationWarnings = validationWarnings;
        this.processingTimeMs = processingTimeMs;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Map<String, Object> getJsonData() {
        return jsonData;
    }

    public void setJsonData(Map<String, Object> jsonData) {
        this.jsonData = jsonData;
    }

    public TokenUsageDto getUsage() {
        return usage;
    }

    public void setUsage(TokenUsageDto usage) {
        this.usage = usage;
    }

    public String getFinishReason() {
        return finishReason;
    }

    public void setFinishReason(String finishReason) {
        this.finishReason = finishReason;
    }

    public List<String> getValidationWarnings() {
        return validationWarnings;
    }

    public void setValidationWarnings(List<String> validationWarnings) {
        this.validationWarnings = validationWarnings;
    }

    public Double getProcessingTimeMs() {
        return processingTimeMs;
    }

    public void setProcessingTimeMs(Double processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }
}
