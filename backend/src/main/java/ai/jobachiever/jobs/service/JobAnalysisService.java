package ai.jobachiever.jobs.service;

import ai.jobachiever.jobs.dto.AnalyzeJobDescriptionRequest;
import ai.jobachiever.jobs.dto.JobAnalysisDto;
import ai.jobachiever.jobs.dto.JobAnalysisSummaryDto;

import java.util.List;
import java.util.UUID;

/**
 * Service contract for triggering, caching, and retrieving AI-powered
 * job description analyses and structured requirements breakdowns.
 */
public interface JobAnalysisService {

    /**
     * Executes AI analysis on an arbitrary pasted or submitted job description.
     * Enforces user consent, length bounds, and anti-fabrication rules.
     *
     * @param userId  authenticated candidate user ID
     * @param request payload containing the raw job description and optional overrides
     * @return structured, normalized JobAnalysisDto report
     */
    JobAnalysisDto analyzeDescription(UUID userId, AnalyzeJobDescriptionRequest request);

    /**
     * Executes AI analysis on an existing saved job posting record.
     *
     * @param userId authenticated user ID
     * @param jobId  UUID of the saved job record
     * @return structured, normalized JobAnalysisDto report
     */
    JobAnalysisDto analyzeJob(UUID userId, UUID jobId);

    /**
     * Retrieves all job analyses performed by the user, ordered most recent first.
     *
     * @param userId authenticated user ID
     * @return list of analysis summaries
     */
    List<JobAnalysisSummaryDto> getAnalyses(UUID userId);

    /**
     * Retrieves analysis history for a specific saved job record.
     *
     * @param userId authenticated user ID
     * @param jobId  UUID of the job record
     * @return list of analysis summaries for the specified job
     */
    List<JobAnalysisSummaryDto> getJobAnalyses(UUID userId, UUID jobId);

    /**
     * Retrieves full analysis report details by analysis ID.
     * Enforces strict user data isolation.
     *
     * @param userId     authenticated user ID
     * @param analysisId UUID of the analysis record
     * @return complete JobAnalysisDto
     */
    JobAnalysisDto getAnalysisDetails(UUID userId, UUID analysisId);

    /**
     * Deletes a job analysis report owned by the authenticated user.
     *
     * @param userId     authenticated user ID
     * @param analysisId UUID of the analysis record
     */
    void deleteAnalysis(UUID userId, UUID analysisId);
}
