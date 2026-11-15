package ai.jobachiever.resumes.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

/**
 * Complete AI resume analysis report including transparent scoring, section breakdowns,
 * ATS observations, and actionable evidence-grounded recommendations.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ResumeAnalysisDto(
        UUID id,
        UUID resumeId,
        UUID versionId,
        String provider,
        String model,
        int overallScore,
        String overallRating,
        String summary,
        JsonNode report,
        Instant createdAt
) {
}
