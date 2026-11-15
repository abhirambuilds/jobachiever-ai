package ai.jobachiever.resumes.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Lightweight summary of an AI resume analysis report for list views and history timelines.
 */
public record ResumeAnalysisSummaryDto(
        UUID id,
        UUID resumeId,
        UUID versionId,
        String provider,
        String model,
        int overallScore,
        String overallRating,
        String summary,
        Instant createdAt
) {
}
