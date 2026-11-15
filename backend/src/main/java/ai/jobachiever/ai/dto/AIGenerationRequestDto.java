package ai.jobachiever.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AIGenerationRequestDto {

    private String provider = "GROQ";
    private String task = "TEXT_GENERATION";

    @NotBlank(message = "Prompt is required")
    @Size(max = 64000, message = "Prompt exceeds maximum allowed size of 64000 characters")
    private String prompt;

    private String systemPrompt;
    private String model;
    private String responseFormat = "text";
    private Map<String, Object> jsonSchema;
    private Double temperature = 0.2;
    private Integer maxTokens;
    private Boolean userConsent = true;

    public AIGenerationRequestDto() {
    }

    public AIGenerationRequestDto(String provider, String task, String prompt, String systemPrompt,
                                  String model, String responseFormat, Map<String, Object> jsonSchema,
                                  Double temperature, Integer maxTokens, Boolean userConsent) {
        this.provider = provider != null ? provider : "GROQ";
        this.task = task != null ? task : "TEXT_GENERATION";
        this.prompt = prompt;
        this.systemPrompt = systemPrompt;
        this.model = model;
        this.responseFormat = responseFormat != null ? responseFormat : "text";
        this.jsonSchema = jsonSchema;
        this.temperature = temperature != null ? temperature : 0.2;
        this.maxTokens = maxTokens;
        this.userConsent = userConsent != null ? userConsent : true;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getTask() {
        return task;
    }

    public void setTask(String task) {
        this.task = task;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getSystemPrompt() {
        return systemPrompt;
    }

    public void setSystemPrompt(String systemPrompt) {
        this.systemPrompt = systemPrompt;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getResponseFormat() {
        return responseFormat;
    }

    public void setResponseFormat(String responseFormat) {
        this.responseFormat = responseFormat;
    }

    public Map<String, Object> getJsonSchema() {
        return jsonSchema;
    }

    public void setJsonSchema(Map<String, Object> jsonSchema) {
        this.jsonSchema = jsonSchema;
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

    public Boolean getUserConsent() {
        return userConsent;
    }

    public void setUserConsent(Boolean userConsent) {
        this.userConsent = userConsent;
    }
}
