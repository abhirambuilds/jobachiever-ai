package ai.jobachiever.matching.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Request payload for creating a new explainable Resume-to-Job compatibility match.
 */
public record CreateMatchRequest(
        @NotNull(message = "Resume document ID is required")
        UUID resumeId,

        UUID jobId,

        UUID jobAnalysisId,

        String rawJobDescription,

        String jobTitle,

        String companyName,

        String provider,

        String model,

        Double temperature,

        Integer maxTokens
) {
}
