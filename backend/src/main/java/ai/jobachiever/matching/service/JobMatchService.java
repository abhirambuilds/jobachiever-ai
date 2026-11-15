package ai.jobachiever.matching.service;

import ai.jobachiever.matching.dto.CreateMatchRequest;
import ai.jobachiever.matching.dto.JobMatchDto;
import ai.jobachiever.matching.dto.JobMatchSummaryDto;

import java.util.List;
import java.util.UUID;

/**
 * Service contract for creating, retrieving, and managing explainable
 * Resume-to-Job compatibility matches.
 */
public interface JobMatchService {

    /**
     * Executes end-to-end evidence-grounded matching between a candidate resume
     * and a target job description. Enforces candidate ownership, mandatory AI consent,
     * and zero-fabrication constraints.
     *
     * @param userId  authenticated candidate user ID
     * @param request match configuration payload referencing resume and job criteria
     * @return structured, explainable JobMatchDto report
     */
    JobMatchDto createMatch(UUID userId, CreateMatchRequest request);

    /**
     * Retrieves all match reports created by the authenticated user in chronological order.
     *
     * @param userId authenticated user ID
     * @return list of match summaries
     */
    List<JobMatchSummaryDto> getMatches(UUID userId);

    /**
     * Retrieves all match reports for a specific job posting.
     *
     * @param userId authenticated user ID
     * @param jobId  UUID of the target job
     * @return list of match summaries
     */
    List<JobMatchSummaryDto> getMatchesForJob(UUID userId, UUID jobId);

    /**
     * Retrieves all match reports for a specific resume document.
     *
     * @param userId   authenticated user ID
     * @param resumeId UUID of the resume
     * @return list of match summaries
     */
    List<JobMatchSummaryDto> getMatchesForResume(UUID userId, UUID resumeId);

    /**
     * Retrieves full match report details by match ID.
     * Enforces strict tenancy isolation.
     *
     * @param userId  authenticated user ID
     * @param matchId UUID of the match record
     * @return complete JobMatchDto report
     */
    JobMatchDto getMatchDetails(UUID userId, UUID matchId);

    /**
     * Deletes a match report owned by the authenticated user.
     *
     * @param userId  authenticated user ID
     * @param matchId UUID of the match record
     */
    void deleteMatch(UUID userId, UUID matchId);
}
