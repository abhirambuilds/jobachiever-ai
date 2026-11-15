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
}
