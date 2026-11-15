package ai.jobachiever.ai.service;

import ai.jobachiever.ai.dto.ParsedResumeDto;

import java.util.UUID;

public interface ResumeParsingService {

    /**
     * Parses an existing stored resume document belonging to the authenticated user.
     * Enforces user ownership, loads the document binary from isolated storage,
     * dispatches to the AI microservice, and returns structured unverified data
     * for human inspection.
     *
     * @param documentId UUID of the resume document
     * @param userId     UUID of the authenticated user
     * @return structured unverified extraction results
     */
    ParsedResumeDto parseResumeDocument(UUID documentId, UUID userId);
}
