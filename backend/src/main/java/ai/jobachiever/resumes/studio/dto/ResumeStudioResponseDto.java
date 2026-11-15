package ai.jobachiever.resumes.studio.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

/**
 * Normalized response wrapper returned to client applications containing rewriting suggestions
 * and explainable validation evidence.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResumeStudioResponseDto {

    private List<SuggestionItemDto> suggestions = new ArrayList<>();

    private String action;

    @JsonProperty("writing_mode")
    @JsonAlias({"writing_mode", "writingMode"})
    private String writingMode;

    private String provider;

    private String model;

    private String disclaimer;

    public ResumeStudioResponseDto() {
    }

    public ResumeStudioResponseDto(List<SuggestionItemDto> suggestions, String action, String writingMode,
                                   String provider, String model, String disclaimer) {
        this.suggestions = suggestions != null ? suggestions : new ArrayList<>();
        this.action = action;
        this.writingMode = writingMode;
        this.provider = provider;
        this.model = model;
        this.disclaimer = disclaimer;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private List<SuggestionItemDto> suggestions = new ArrayList<>();
        private String action;
        private String writingMode;
        private String provider;
        private String model;
        private String disclaimer;

        public Builder suggestions(List<SuggestionItemDto> suggestions) {
            this.suggestions = suggestions;
            return this;
        }

        public Builder action(String action) {
            this.action = action;
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

        public Builder disclaimer(String disclaimer) {
            this.disclaimer = disclaimer;
            return this;
        }

        public ResumeStudioResponseDto build() {
            return new ResumeStudioResponseDto(suggestions, action, writingMode, provider, model, disclaimer);
        }
    }

    public List<SuggestionItemDto> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<SuggestionItemDto> suggestions) {
        this.suggestions = suggestions;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getWritingMode() {
        return writingMode;
    }

    public void setWritingMode(String writingMode) {
        this.writingMode = writingMode;
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

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
