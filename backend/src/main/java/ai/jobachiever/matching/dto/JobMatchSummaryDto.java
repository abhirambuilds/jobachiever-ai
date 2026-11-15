package ai.jobachiever.matching.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.UUID;

/**
 * Lightweight summary of an explainable Resume-to-Job match for history and timelines.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record JobMatchSummaryDto(
        UUID id,
        UUID resumeId,
        String resumeName,
        UUID jobId,
        UUID jobAnalysisId,
        String jobTitle,
        String companyName,
        String provider,
        String model,
        int overallScore,
        Double confidenceScore,
        String matchSummary,
        Instant createdAt
) {
}
