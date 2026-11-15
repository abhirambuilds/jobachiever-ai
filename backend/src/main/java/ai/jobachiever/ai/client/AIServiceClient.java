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

    /**
     * Sends a raw job description or job posting text to the AI microservice
     * for deep architectural decomposition, requirement extraction, and gap analysis.
     *
     * @param jobDescription raw job description text (50-50,000 characters)
     * @param jobId          optional job entity ID
     * @param jobTitle       optional job title hint
     * @param companyName    optional company name hint
     * @param provider       selected AI provider (e.g. GROQ, GEMINI)
     * @param model          optional model override
     * @param temperature    sampling temperature
     * @param maxTokens      maximum output tokens
     * @param userConsent    explicit user consent indicator
     * @return raw JSON string representing the JobAnalysisResponse
     */
    String analyzeJobDescription(String jobDescription, java.util.UUID jobId, String jobTitle,
                                String companyName, String provider, String model,
                                Double temperature, Integer maxTokens, boolean userConsent);

    /**
     * Dispatches structured candidate resume evidence and job requirement definitions
     * to the internal Python FastAPI matching microservice.
     *
     * @param resumeData    structured resume fields or parsed resume map
     * @param jobData       structured job fields or analyzed job map
     * @param resumeId      optional resume UUID
     * @param versionId     optional resume version UUID
     * @param jobId         optional job UUID
     * @param jobAnalysisId optional job analysis UUID
     * @param provider      selected AI provider (GROQ / GEMINI)
     * @param model         optional model override
     * @param temperature   sampling temperature
     * @param maxTokens     max tokens
     * @param userConsent   explicit candidate AI consent
     * @return raw JSON string representing MatchingResponse
     */
    String matchResumeToJob(java.util.Map<String, Object> resumeData,
                            java.util.Map<String, Object> jobData,
                            java.util.UUID resumeId,
                            java.util.UUID versionId,
                            java.util.UUID jobId,
                            java.util.UUID jobAnalysisId,
                            String provider,
                            String model,
                            Double temperature,
                            Integer maxTokens,
                            boolean userConsent);

    /**
     * Dispatches text enhancement, rewriting, and tailoring requests to the internal
     * Python FastAPI Resume Studio microservice.
     *
     * @param action          enhancement action (e.g. IMPROVE_BULLET, IMPROVE_SUMMARY, TAILOR_TO_JOB)
     * @param sourceText      original sentence, bullet, or summary text
     * @param context         optional contextual information map (section, role, company, target JD)
     * @param writingMode     stylistic writing mode (e.g. PROFESSIONAL, CONCISE, TECHNICAL)
     * @param provider        selected AI provider (e.g. GROQ, GEMINI)
     * @param model           optional model override
     * @param temperature     sampling temperature
     * @param maxTokens       max tokens
     * @param numAlternatives number of variations to generate
     * @param userConsent     explicit candidate AI consent
     * @return raw JSON string representing ResumeStudioResponse
     */
    String generateResumeStudioContent(String action,
                                       String sourceText,
                                       java.util.Map<String, Object> context,
                                       String writingMode,
                                       String provider,
                                       String model,
                                       Double temperature,
                                       Integer maxTokens,
                                       Integer numAlternatives,
                                       boolean userConsent);

    /**
     * Dispatches candidate profile facts and target career track requirements
     * to the internal Python FastAPI skill gap analysis engine.
     *
     * @param payload map containing candidate facts, target role, and model parameters
     * @return raw JSON string representing SkillGapAnalysisResponse
     */
    String analyzeCareerSkillGaps(java.util.Map<String, Object> payload);

    /**
     * Dispatches skill gap items and candidate facts to the AI recommendations engine.
     *
     * @param payload map containing skill gaps, target role, and model parameters
     * @return raw JSON string representing CareerRecommendationsResponse
     */
    String generateCareerRecommendations(java.util.Map<String, Object> payload);

    /**
     * Dispatches candidate profile facts and skill gaps to the phased learning roadmap generator.
     *
     * @param payload map containing candidate facts, skill gaps, and model parameters
     * @return raw JSON string representing RoadmapGenerateResponse
     */
    String generateCareerRoadmap(java.util.Map<String, Object> payload);

    /**
     * Dispatches candidate profile facts and missing skills to the portfolio project recommender.
     *
     * @param payload map containing missing skills, target role, and model parameters
     * @return raw JSON string representing ProjectRecommendationsResponse
     */
    String recommendCareerProjects(java.util.Map<String, Object> payload);
}
