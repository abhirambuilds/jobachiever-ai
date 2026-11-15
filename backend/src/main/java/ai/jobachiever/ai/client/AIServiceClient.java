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

    /**
     * Dispatches text or structured generation request to the selected AI provider.
     *
     * @param request configuration and prompt payload
     * @return normalized generation response with content and token metrics
     */
    ai.jobachiever.ai.dto.AIGenerationResponseDto generate(ai.jobachiever.ai.dto.AIGenerationRequestDto request);

    /**
     * Retrieves available AI providers and their supported models.
     *
     * @return list of provider metadata objects
     */
    java.util.List<ai.jobachiever.ai.dto.ProviderMetadataDto> getProviders();
}
