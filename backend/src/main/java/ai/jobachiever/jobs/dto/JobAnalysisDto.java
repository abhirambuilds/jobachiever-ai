package ai.jobachiever.jobs.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

/**
 * Complete AI job description analysis report containing extracted overview,
 * categorized skills, responsibilities, qualifications, and grounded evidence.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record JobAnalysisDto(
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
        JsonNode report,
        Instant createdAt
) {
}
