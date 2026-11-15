package ai.jobachiever.resumes.studio.service;

import ai.jobachiever.resumes.studio.dto.ResumeStudioRequest;
import ai.jobachiever.resumes.studio.dto.ResumeStudioResponseDto;

import java.util.UUID;

/**
 * Service orchestrating AI-assisted resume content enhancement, tailoring, and anti-fabrication checks.
 */
public interface ResumeStudioService {

    /**
     * Enhances resume text (bullet points, summaries, projects, experience) using user's configured AI provider.
     * Enforces user consent, tenant isolation, and anti-fabrication rules.
     *
     * @param userId  authenticated user ID
     * @param request rewrite request payload
     * @return structured suggestions and validation warnings
     */
    ResumeStudioResponseDto enhanceContent(UUID userId, ResumeStudioRequest request);
}
