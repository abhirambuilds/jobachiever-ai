package ai.jobachiever.jobs.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.UUID;

/**
 * Lightweight summary of an AI job description analysis for list views and history.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record JobAnalysisSummaryDto(
        UUID id,
        UUID jobId,
        String provider,
        String model,
        String jobTitle,
        String companyName,
        String seniority,
        String employmentType,
        String workArrangement,
        String location,
        String experienceSummary,
        String summary,
        Instant createdAt
) {
}
