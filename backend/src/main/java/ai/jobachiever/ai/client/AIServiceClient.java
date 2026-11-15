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

    /**
     * Sends resume file bytes and metadata to the AI microservice for comprehensive
     * quality evaluation and structured feedback report generation.
     *
     * @param fileBytes    raw document bytes (PDF or DOCX)
     * @param filename     original filename
     * @param contentType  document MIME type
     * @param resumeId     optional resume entity ID
     * @param provider     selected AI provider (e.g. GROQ, GEMINI)
     * @param model        optional model override
     * @param temperature  sampling temperature
     * @param maxTokens    maximum output tokens
     * @param userConsent  explicit user consent indicator
     * @return raw JSON string representing the ResumeAnalysisResponse
     */
    String analyzeResume(byte[] fileBytes, String filename, String contentType, java.util.UUID resumeId,
                         String provider, String model, Double temperature, Integer maxTokens, boolean userConsent);
}
