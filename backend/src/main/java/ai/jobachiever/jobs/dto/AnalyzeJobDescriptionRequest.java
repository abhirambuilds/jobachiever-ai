package ai.jobachiever.jobs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for AI-powered job description decomposition and analysis.
 */
public record AnalyzeJobDescriptionRequest(
        @NotBlank(message = "Job description text must not be blank")
        @Size(min = 50, max = 50000, message = "Job description must be between 50 and 50,000 characters")
        String jobDescription,

        String jobTitle,
        String companyName,
        String provider,
        String model,
        Double temperature,
        Integer maxTokens
) {
}
