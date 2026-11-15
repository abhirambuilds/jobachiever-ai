package ai.jobachiever.resumes.service;

import ai.jobachiever.resumes.dto.ResumeAnalysisDto;
import ai.jobachiever.resumes.dto.ResumeAnalysisSummaryDto;

import java.util.List;
import java.util.UUID;

/**
 * Service contract for triggering and retrieving AI-powered resume analyses.
 */
public interface ResumeAnalysisService {

    /**
     * Executes end-to-end evidence-grounded AI analysis on a candidate's uploaded resume document.
     * Enforces user ownership, mandatory AI data processing consent, and zero-fabrication guardrails.
     *
     * @param userId   authenticated user ID
     * @param resumeId UUID of the resume document to analyze
     * @return structured, normalized ResumeAnalysisDto report
     */
    ResumeAnalysisDto analyzeResume(UUID userId, UUID resumeId);

    /**
     * Retrieves chronological analysis history for a specific resume document.
     *
     * @param userId   authenticated user ID
     * @param resumeId UUID of the resume document
     * @return list of analysis summaries ordered most recent first
     */
    List<ResumeAnalysisSummaryDto> getAnalysisHistory(UUID userId, UUID resumeId);

    /**
     * Retrieves complete analysis report details by analysis ID.
     *
     * @param userId     authenticated user ID
     * @param analysisId UUID of the resume analysis record
     * @return complete ResumeAnalysisDto
     */
    ResumeAnalysisDto getAnalysisDetails(UUID userId, UUID analysisId);
}
