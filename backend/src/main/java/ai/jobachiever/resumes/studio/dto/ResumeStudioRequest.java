package ai.jobachiever.resumes.studio.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Incoming request payload for AI-assisted resume drafting and rewriting.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResumeStudioRequest {

    @NotBlank(message = "Action must be specified (e.g., IMPROVE_BULLET, IMPROVE_SUMMARY, TAILOR_TO_JOB)")
    private String action;

    @NotBlank(message = "Source text is required")
    @Size(min = 1, max = 5000, message = "Source text must be between 1 and 5000 characters")
    @JsonProperty("source_text")
    private String sourceText;

    private ResumeStudioContextDto context;

    @JsonProperty("writing_mode")
    private String writingMode = "PROFESSIONAL";

    private String provider;

    private String model;

    private Double temperature;

    @JsonProperty("max_tokens")
    private Integer maxTokens;

    @JsonProperty("num_alternatives")
    private Integer numAlternatives;

    @JsonProperty("resume_id")
    private UUID resumeId;

    @JsonProperty("job_id")
    private UUID jobId;

    public ResumeStudioRequest() {
    }

    public ResumeStudioRequest(String action, String sourceText, ResumeStudioContextDto context,
                               String writingMode, String provider, String model, Double temperature,
                               Integer maxTokens, Integer numAlternatives, UUID resumeId, UUID jobId) {
        this.action = action;
        this.sourceText = sourceText;
        this.context = context;
        this.writingMode = writingMode != null ? writingMode : "PROFESSIONAL";
        this.provider = provider;
        this.model = model;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.numAlternatives = numAlternatives;
        this.resumeId = resumeId;
        this.jobId = jobId;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String action;
        private String sourceText;
        private ResumeStudioContextDto context;
        private String writingMode = "PROFESSIONAL";
        private String provider;
        private String model;
        private Double temperature;
        private Integer maxTokens;
        private Integer numAlternatives;
        private UUID resumeId;
        private UUID jobId;

        public Builder action(String action) {
            this.action = action;
            return this;
        }

        public Builder sourceText(String sourceText) {
            this.sourceText = sourceText;
            return this;
        }

        public Builder context(ResumeStudioContextDto context) {
            this.context = context;
            return this;
        }

        public Builder writingMode(String writingMode) {
            this.writingMode = writingMode;
            return this;
        }

        public Builder provider(String provider) {
            this.provider = provider;
            return this;
        }

        public Builder model(String model) {
            this.model = model;
            return this;
        }

        public Builder temperature(Double temperature) {
            this.temperature = temperature;
            return this;
        }

        public Builder maxTokens(Integer maxTokens) {
            this.maxTokens = maxTokens;
            return this;
        }

        public Builder numAlternatives(Integer numAlternatives) {
            this.numAlternatives = numAlternatives;
            return this;
        }

        public Builder resumeId(UUID resumeId) {
            this.resumeId = resumeId;
            return this;
        }

        public Builder jobId(UUID jobId) {
            this.jobId = jobId;
            return this;
        }

        public ResumeStudioRequest build() {
            return new ResumeStudioRequest(action, sourceText, context, writingMode, provider,
                    model, temperature, maxTokens, numAlternatives, resumeId, jobId);
        }
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getSourceText() {
        return sourceText;
    }

    public void setSourceText(String sourceText) {
        this.sourceText = sourceText;
    }

    public ResumeStudioContextDto getContext() {
        return context;
    }

    public void setContext(ResumeStudioContextDto context) {
        this.context = context;
    }

    public String getWritingMode() {
        return writingMode;
    }

    public void setWritingMode(String writingMode) {
        this.writingMode = writingMode != null ? writingMode : "PROFESSIONAL";
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

    public Integer getNumAlternatives() {
        return numAlternatives;
    }

    public void setNumAlternatives(Integer numAlternatives) {
        this.numAlternatives = numAlternatives;
    }

    public UUID getResumeId() {
        return resumeId;
    }

    public void setResumeId(UUID resumeId) {
        this.resumeId = resumeId;
    }

    public UUID getJobId() {
        return jobId;
    }

    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }
}
