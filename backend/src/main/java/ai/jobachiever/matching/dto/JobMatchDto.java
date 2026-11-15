package ai.jobachiever.matching.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

/**
 * Complete explainable Resume-to-Job match report containing overall and dimension scores,
 * evidence excerpts, skill gaps, and prioritized recommendations.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record JobMatchDto(
        UUID id,
        UUID resumeId,
        UUID resumeVersionId,
        String resumeName,
        UUID jobId,
        UUID jobAnalysisId,
        String jobTitle,
        String companyName,
        String provider,
        String model,
        int overallScore,
        Integer requiredSkillsScore,
        Integer preferredSkillsScore,
        Integer experienceScore,
        Integer qualificationsScore,
        Integer responsibilitiesScore,
        Double confidenceScore,
        String matchSummary,
        JsonNode report,
        Instant createdAt
) {
}
