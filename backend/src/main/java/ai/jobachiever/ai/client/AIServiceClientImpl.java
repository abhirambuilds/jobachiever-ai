package ai.jobachiever.ai.client;

import ai.jobachiever.ai.config.AIServiceProperties;
import ai.jobachiever.ai.dto.ParsedResumeDto;
import ai.jobachiever.ai.exception.AIServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;

@Component
public class AIServiceClientImpl implements AIServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AIServiceClientImpl.class);
    private static final String INTERNAL_SERVICE_KEY_HEADER = "X-Internal-Service-Key";

    private final AIServiceProperties properties;
    private final RestClient restClient;

    @org.springframework.beans.factory.annotation.Autowired
    public AIServiceClientImpl(AIServiceProperties properties) {
        this.properties = properties;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(properties.getTimeoutSeconds()));

        this.restClient = RestClient.builder()
                .baseUrl(properties.getUrl())
                .requestFactory(requestFactory)
                .build();
    }

    public AIServiceClientImpl(AIServiceProperties properties, RestClient restClient) {
        this.properties = properties;
        this.restClient = restClient;
    }

    @Override
    public ParsedResumeDto parseResume(byte[] fileBytes, String filename, String contentType) {
        if (fileBytes == null || fileBytes.length == 0) {
            throw new IllegalArgumentException("File content bytes cannot be null or empty");
        }

        log.info("Dispatching resume parsing request to AI service at {}/api/v1/parse for {}",
                properties.getUrl(), filename);

        ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        HttpHeaders partHeaders = new HttpHeaders();
        if (contentType != null && !contentType.isBlank()) {
            partHeaders.setContentType(MediaType.parseMediaType(contentType));
        }

        HttpEntity<ByteArrayResource> fileEntity = new HttpEntity<>(fileResource, partHeaders);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileEntity);

        try {
            ParsedResumeDto response = restClient.post()
                    .uri("/api/v1/parse")
                    .header(INTERNAL_SERVICE_KEY_HEADER, properties.getInternalKey())
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(ParsedResumeDto.class);

            if (response == null) {
                throw new AIServiceException("AI microservice returned an empty response body.");
            }

            log.info("Successfully received parsed resume structure for {}", filename);
            return response;

        } catch (RestClientResponseException ex) {
            log.error("AI microservice returned HTTP error status {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new AIServiceException("AI microservice error (" + ex.getStatusCode().value() + "): " + ex.getStatusText(), ex);
        } catch (Exception ex) {
            log.error("Failed to communicate with AI microservice at {}: {}", properties.getUrl(), ex.getMessage());
            throw new AIServiceException("Unable to communicate with AI parsing service: " + ex.getMessage(), ex);
        }
    }

    @Override
    public boolean checkHealth() {
        try {
            return restClient.get()
                    .uri("/api/v1/health")
                    .retrieve()
                    .toBodilessEntity()
                    .getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("AI microservice health check probe failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public ai.jobachiever.ai.dto.AIGenerationResponseDto generate(ai.jobachiever.ai.dto.AIGenerationRequestDto request) {
        if (request == null) {
            throw new IllegalArgumentException("AI generation request payload cannot be null");
        }

        log.info("Dispatching AI generation request to AI service at {}/api/v1/generate (provider: {}, task: {})",
                properties.getUrl(), request.getProvider(), request.getTask());

        try {
            ai.jobachiever.ai.dto.AIGenerationResponseDto response = restClient.post()
                    .uri("/api/v1/generate")
                    .header(INTERNAL_SERVICE_KEY_HEADER, properties.getInternalKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ai.jobachiever.ai.dto.AIGenerationResponseDto.class);

            if (response == null) {
                throw new AIServiceException("AI microservice returned an empty response body.");
            }

            log.info("Successfully received AI generation response from provider {} (tokens: in={}, out={})",
                    response.getProvider(),
                    response.getUsage() != null ? response.getUsage().getInputTokens() : 0,
                    response.getUsage() != null ? response.getUsage().getOutputTokens() : 0);
            return response;

        } catch (RestClientResponseException ex) {
            log.error("AI microservice returned HTTP error status {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            int code = ex.getStatusCode().value();
            if (code == 429) {
                throw new AIServiceException("AI provider rate limit reached. Please retry in a few moments.", ex);
            } else if (code == 502) {
                throw new AIServiceException("AI provider authentication failure. Please verify server configuration.", ex);
            } else if (code == 504) {
                throw new AIServiceException("AI generation request timed out.", ex);
            }
            throw new AIServiceException("AI microservice error (" + code + "): " + ex.getStatusText(), ex);
        } catch (Exception ex) {
            log.error("Failed to communicate with AI microservice at {}: {}", properties.getUrl(), ex.getMessage());
            throw new AIServiceException("Unable to communicate with AI generation service: " + ex.getMessage(), ex);
        }
    }

    @Override
    public java.util.List<ai.jobachiever.ai.dto.ProviderMetadataDto> getProviders() {
        log.info("Fetching available AI providers from {}/api/v1/providers", properties.getUrl());
        try {
            ai.jobachiever.ai.dto.ProviderListResponseDto response = restClient.get()
                    .uri("/api/v1/providers")
                    .retrieve()
                    .body(ai.jobachiever.ai.dto.ProviderListResponseDto.class);

            if (response == null || response.getProviders() == null) {
                return java.util.Collections.emptyList();
            }
            return response.getProviders();

        } catch (Exception ex) {
            log.error("Failed to fetch AI providers list: {}", ex.getMessage());
            throw new AIServiceException("Unable to retrieve AI providers list: " + ex.getMessage(), ex);
        }
    }

    @Override
    public String analyzeResume(byte[] fileBytes, String filename, String contentType, java.util.UUID resumeId,
                                String provider, String model, Double temperature, Integer maxTokens, boolean userConsent) {
        if (fileBytes == null || fileBytes.length == 0) {
            throw new IllegalArgumentException("File content bytes cannot be null or empty");
        }

        log.info("Dispatching resume analysis request to AI service at {}/api/v1/analyze-resume for {} with provider {}",
                properties.getUrl(), filename, provider);

        ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        HttpHeaders partHeaders = new HttpHeaders();
        if (contentType != null && !contentType.isBlank()) {
            partHeaders.setContentType(MediaType.parseMediaType(contentType));
        }

        HttpEntity<ByteArrayResource> fileEntity = new HttpEntity<>(fileResource, partHeaders);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileEntity);
        if (resumeId != null) {
            body.add("resume_id", resumeId.toString());
        }
        if (provider != null) {
            body.add("provider", provider);
        }
        if (model != null && !model.isBlank()) {
            body.add("model", model);
        }
        if (temperature != null) {
            body.add("temperature", temperature.toString());
        }
        if (maxTokens != null) {
            body.add("max_tokens", maxTokens.toString());
        }
        body.add("user_consent", String.valueOf(userConsent));

        try {
            String response = restClient.post()
                    .uri("/api/v1/analyze-resume")
                    .header(INTERNAL_SERVICE_KEY_HEADER, properties.getInternalKey())
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) {
                throw new AIServiceException("AI microservice returned an empty analysis response body.");
            }

            log.info("Successfully received resume analysis report for {}", filename);
            return response;
        } catch (RestClientResponseException e) {
            log.error("AI microservice returned HTTP {} during resume analysis: {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new AIServiceException("AI microservice error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Failed to communicate with AI microservice during resume analysis: {}", e.getMessage(), e);
            throw new AIServiceException("Failed to analyze resume with AI microservice: " + e.getMessage(), e);
        }
    }

    @Override
    public String analyzeJobDescription(String jobDescription, java.util.UUID jobId, String jobTitle,
                                       String companyName, String provider, String model,
                                       Double temperature, Integer maxTokens, boolean userConsent) {
        if (jobDescription == null || jobDescription.trim().length() < 50) {
            throw new IllegalArgumentException("Job description must contain at least 50 meaningful characters");
        }

        log.info("Dispatching job description analysis request to AI service at {}/api/v1/analyze/job-description (chars={})",
                properties.getUrl(), jobDescription.length());

        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("job_description", jobDescription);
        if (jobId != null) {
            payload.put("job_id", jobId.toString());
        }
        if (jobTitle != null && !jobTitle.isBlank()) {
            payload.put("job_title", jobTitle);
        }
        if (companyName != null && !companyName.isBlank()) {
            payload.put("company_name", companyName);
        }
        if (provider != null && !provider.isBlank()) {
            payload.put("provider", provider);
        }
        if (model != null && !model.isBlank()) {
            payload.put("model", model);
        }
        if (temperature != null) {
            payload.put("temperature", temperature);
        }
        if (maxTokens != null) {
            payload.put("max_tokens", maxTokens);
        }
        payload.put("user_consent", userConsent);

        try {
            String response = restClient.post()
                    .uri("/api/v1/analyze/job-description")
                    .header(INTERNAL_SERVICE_KEY_HEADER, properties.getInternalKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) {
                throw new AIServiceException("AI microservice returned an empty job analysis response body.");
            }

            log.info("Successfully received job description analysis report");
            return response;
        } catch (RestClientResponseException e) {
            log.error("AI microservice returned HTTP {} during job analysis: {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new AIServiceException("AI microservice error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Failed to communicate with AI microservice during job analysis: {}", e.getMessage(), e);
            throw new AIServiceException("Failed to analyze job description with AI microservice: " + e.getMessage(), e);
        }
    }

    @Override
    public String matchResumeToJob(java.util.Map<String, Object> resumeData,
                                   java.util.Map<String, Object> jobData,
                                   java.util.UUID resumeId,
                                   java.util.UUID versionId,
                                   java.util.UUID jobId,
                                   java.util.UUID jobAnalysisId,
                                   String provider,
                                   String model,
                                   Double temperature,
                                   Integer maxTokens,
                                   boolean userConsent) {
        if (resumeData == null || resumeData.isEmpty()) {
            throw new IllegalArgumentException("Resume data must not be empty for matching");
        }
        if (jobData == null || jobData.isEmpty()) {
            throw new IllegalArgumentException("Job requirement data must not be empty for matching");
        }

        log.info("Dispatching resume-job match request to AI service at {}/api/v1/matching/analyze (resumeId={}, jobId={})",
                properties.getUrl(), resumeId, jobId);

        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("resume_data", resumeData);
        payload.put("job_data", jobData);
        if (resumeId != null) {
            payload.put("resume_id", resumeId.toString());
        }
        if (versionId != null) {
            payload.put("resume_version_id", versionId.toString());
        }
        if (jobId != null) {
            payload.put("job_id", jobId.toString());
        }
        if (jobAnalysisId != null) {
            payload.put("job_analysis_id", jobAnalysisId.toString());
        }
        if (provider != null && !provider.isBlank()) {
            payload.put("provider", provider);
        }
        if (model != null && !model.isBlank()) {
            payload.put("model", model);
        }
        if (temperature != null) {
            payload.put("temperature", temperature);
        }
        if (maxTokens != null) {
            payload.put("max_tokens", maxTokens);
        }
        payload.put("user_consent", userConsent);

        try {
            String response = restClient.post()
                    .uri("/api/v1/matching/analyze")
                    .header(INTERNAL_SERVICE_KEY_HEADER, properties.getInternalKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) {
                throw new AIServiceException("AI microservice returned an empty matching response body.");
            }

            log.info("Successfully received resume-job match report");
            return response;
        } catch (RestClientResponseException e) {
            log.error("AI microservice returned HTTP {} during matching: {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new AIServiceException("AI microservice error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Failed to communicate with AI microservice during matching: {}", e.getMessage(), e);
            throw new AIServiceException("Failed to execute resume-job matching: " + e.getMessage(), e);
        }
    }
}
