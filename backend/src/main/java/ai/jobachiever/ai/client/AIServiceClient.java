package ai.jobachiever.ai.client;

import ai.jobachiever.ai.dto.ParsedResumeDto;

/**
 * Client abstraction for dispatching document parsing and AI computation tasks
 * to the internal Python FastAPI microservice.
 */
public interface AIServiceClient {

    /**
     * Sends resume file bytes to the AI microservice for parsing and normalization.
     *
     * @param fileBytes   raw document bytes (PDF or DOCX)
     * @param filename    sanitized original filename
     * @param contentType MIME type of the document
     * @return structured, normalized resume extraction response
     */
    ParsedResumeDto parseResume(byte[] fileBytes, String filename, String contentType);

    /**
     * Checks operational health and connectivity of the AI microservice.
     *
     * @return true if service reports status UP, false otherwise
     */
    boolean checkHealth();
}
