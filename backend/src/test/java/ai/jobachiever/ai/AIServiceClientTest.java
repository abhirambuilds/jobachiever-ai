package ai.jobachiever.ai;

import ai.jobachiever.ai.client.AIServiceClientImpl;
import ai.jobachiever.ai.config.AIServiceProperties;
import ai.jobachiever.ai.dto.ParsedPersonalInfoDto;
import ai.jobachiever.ai.dto.ParsedResumeDto;
import ai.jobachiever.ai.dto.ParsedSkillDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

@DisplayName("AIServiceClient Unit & MockRestServiceServer Tests")
class AIServiceClientTest {

    private AIServiceProperties properties;
    private RestClient.Builder restClientBuilder;
    private MockRestServiceServer mockServer;
    private AIServiceClientImpl client;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        properties = new AIServiceProperties();
        properties.setUrl("http://ai-service-mock:8000");
        properties.setInternalKey("test-secret-key");
        properties.setTimeoutSeconds(10);

        restClientBuilder = RestClient.builder().baseUrl(properties.getUrl());
        mockServer = MockRestServiceServer.bindTo(restClientBuilder).build();
        client = new AIServiceClientImpl(properties, restClientBuilder.build());
    }

    @Test
    @DisplayName("parseResume sends multipart request with internal key header and deserializes response")
    void parseResumeSuccess() throws Exception {
        ParsedResumeDto mockResponse = new ParsedResumeDto();
        ParsedPersonalInfoDto personalInfo = new ParsedPersonalInfoDto();
        personalInfo.setName("John Developer");
        personalInfo.setEmail("john@example.com");
        mockResponse.setPersonalInformation(personalInfo);

        ParsedSkillDto skill = new ParsedSkillDto();
        skill.setName("Java");
        skill.setCategory("Programming Languages");
        mockResponse.setSkills(List.of(skill));

        String responseJson = objectMapper.writeValueAsString(mockResponse);

        mockServer.expect(requestTo("http://ai-service-mock:8000/api/v1/parse"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("X-Internal-Service-Key", "test-secret-key"))
                .andExpect(header("Content-Type", org.hamcrest.Matchers.startsWith("multipart/form-data")))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        byte[] fakeBytes = "%PDF-1.4 Fake PDF Content".getBytes();
        ParsedResumeDto result = client.parseResume(fakeBytes, "resume.pdf", "application/pdf");

        assertThat(result).isNotNull();
        assertThat(result.getPersonalInformation().getName()).isEqualTo("John Developer");
        assertThat(result.getPersonalInformation().getEmail()).isEqualTo("john@example.com");
        assertThat(result.getSkills()).hasSize(1);
        assertThat(result.getSkills().get(0).getName()).isEqualTo("Java");

        mockServer.verify();
    }

    @Test
    @DisplayName("checkHealth returns true when AI service responds with 200 OK")
    void checkHealthSuccess() {
        mockServer.expect(requestTo("http://ai-service-mock:8000/api/v1/health"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"status\":\"UP\"}", MediaType.APPLICATION_JSON));

        boolean isHealthy = client.checkHealth();
        assertThat(isHealthy).isTrue();

        mockServer.verify();
    }

    @Test
    @DisplayName("generate sends JSON payload with internal key and returns normalized completion")
    void generateSuccess() throws Exception {
        ai.jobachiever.ai.dto.AIGenerationRequestDto request = new ai.jobachiever.ai.dto.AIGenerationRequestDto();
        request.setProvider("GROQ");
        request.setModel("llama-3.3-70b-versatile");
        request.setTask("TEXT_GENERATION");
        request.setPrompt("Draft an executive career summary.");

        ai.jobachiever.ai.dto.AIGenerationResponseDto mockResponse = new ai.jobachiever.ai.dto.AIGenerationResponseDto();
        mockResponse.setProvider("GROQ");
        mockResponse.setModel("llama-3.3-70b-versatile");
        mockResponse.setContent("Accomplished Senior Software Architect with 10+ years...");
        mockResponse.setFinishReason("STOP");
        mockResponse.setUsage(new ai.jobachiever.ai.dto.TokenUsageDto(15, 45, 60));
        mockResponse.setProcessingTimeMs(150.0);

        String responseJson = objectMapper.writeValueAsString(mockResponse);

        mockServer.expect(requestTo("http://ai-service-mock:8000/api/v1/generate"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("X-Internal-Service-Key", "test-secret-key"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ai.jobachiever.ai.dto.AIGenerationResponseDto result = client.generate(request);

        assertThat(result).isNotNull();
        assertThat(result.getProvider()).isEqualTo("GROQ");
        assertThat(result.getModel()).isEqualTo("llama-3.3-70b-versatile");
        assertThat(result.getContent()).contains("Accomplished Senior Software Architect");
        assertThat(result.getUsage().getTotalTokens()).isEqualTo(60);

        mockServer.verify();
    }

    @Test
    @DisplayName("generate sends JSON payload with explicit Gemini provider selection")
    void generateGeminiSuccess() throws Exception {
        ai.jobachiever.ai.dto.AIGenerationRequestDto request = new ai.jobachiever.ai.dto.AIGenerationRequestDto();
        request.setProvider("GEMINI");
        request.setModel("gemini-2.0-flash");
        request.setTask("TEXT_GENERATION");
        request.setPrompt("Generate career roadmap recommendations.");

        ai.jobachiever.ai.dto.AIGenerationResponseDto mockResponse = new ai.jobachiever.ai.dto.AIGenerationResponseDto();
        mockResponse.setProvider("GEMINI");
        mockResponse.setModel("gemini-2.0-flash");
        mockResponse.setContent("Step 1: Deepen distributed systems fundamentals...");
        mockResponse.setFinishReason("STOP");
        mockResponse.setUsage(new ai.jobachiever.ai.dto.TokenUsageDto(20, 60, 80));
        mockResponse.setProcessingTimeMs(210.0);

        String responseJson = objectMapper.writeValueAsString(mockResponse);

        mockServer.expect(requestTo("http://ai-service-mock:8000/api/v1/generate"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("X-Internal-Service-Key", "test-secret-key"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        ai.jobachiever.ai.dto.AIGenerationResponseDto result = client.generate(request);

        assertThat(result).isNotNull();
        assertThat(result.getProvider()).isEqualTo("GEMINI");
        assertThat(result.getModel()).isEqualTo("gemini-2.0-flash");
        assertThat(result.getContent()).contains("Step 1: Deepen distributed systems");
        assertThat(result.getUsage().getTotalTokens()).isEqualTo(80);

        mockServer.verify();
    }

    @Test
    @DisplayName("getProviders returns list of configured AI providers including Groq and Gemini")
    void getProvidersSuccess() throws Exception {
        ai.jobachiever.ai.dto.ProviderMetadataDto groqMeta = new ai.jobachiever.ai.dto.ProviderMetadataDto();
        groqMeta.setId("GROQ");
        groqMeta.setName("Groq Cloud");
        groqMeta.setPriority("PRIMARY");
        groqMeta.setAvailable(true);
        groqMeta.setConfigured(true);
        groqMeta.setDefault(true);
        groqMeta.setStatus("CONFIGURED");
        groqMeta.setDefaultModel("llama-3.3-70b-versatile");
        groqMeta.setSupportedModels(List.of("llama-3.3-70b-versatile", "llama-3.1-8b-instant"));

        ai.jobachiever.ai.dto.ProviderMetadataDto geminiMeta = new ai.jobachiever.ai.dto.ProviderMetadataDto();
        geminiMeta.setId("GEMINI");
        geminiMeta.setName("Google Gemini");
        geminiMeta.setPriority("SECONDARY");
        geminiMeta.setAvailable(true);
        geminiMeta.setConfigured(true);
        geminiMeta.setDefault(false);
        geminiMeta.setStatus("CONFIGURED");
        geminiMeta.setDefaultModel("gemini-2.0-flash");
        geminiMeta.setSupportedModels(List.of("gemini-2.0-flash", "gemini-1.5-pro"));

        ai.jobachiever.ai.dto.ProviderListResponseDto responseDto = new ai.jobachiever.ai.dto.ProviderListResponseDto(List.of(groqMeta, geminiMeta));

        String responseJson = objectMapper.writeValueAsString(responseDto);

        mockServer.expect(requestTo("http://ai-service-mock:8000/api/v1/providers"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(responseJson, MediaType.APPLICATION_JSON));

        List<ai.jobachiever.ai.dto.ProviderMetadataDto> providers = client.getProviders();

        assertThat(providers).hasSize(2);
        assertThat(providers.get(0).getId()).isEqualTo("GROQ");
        assertThat(providers.get(0).getPriority()).isEqualTo("PRIMARY");
        assertThat(providers.get(1).getId()).isEqualTo("GEMINI");
        assertThat(providers.get(1).getPriority()).isEqualTo("SECONDARY");
        assertThat(providers.get(1).getDefaultModel()).isEqualTo("gemini-2.0-flash");

        mockServer.verify();
    }

    @Test
    @DisplayName("generate handles 429 rate limit with descriptive AIServiceException")
    void generateRateLimitThrowsException() {
        ai.jobachiever.ai.dto.AIGenerationRequestDto request = new ai.jobachiever.ai.dto.AIGenerationRequestDto();
        request.setProvider("GROQ");
        request.setPrompt("Test prompt");

        mockServer.expect(requestTo("http://ai-service-mock:8000/api/v1/generate"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withRawStatus(429).body("{\"message\":\"Rate limit reached\"}"));

        org.junit.jupiter.api.Assertions.assertThrows(
                ai.jobachiever.ai.exception.AIServiceException.class,
                () -> client.generate(request)
        );

        mockServer.verify();
    }

    @Test
    @DisplayName("generateResumeStudioContent dispatches payload with internal key and returns response string")
    void generateResumeStudioContentSuccess() {
        String mockResponse = "{\"suggestions\":[{\"id\":\"sug-1\",\"original_text\":\"did work\",\"suggested_text\":\"Engineered systems\"}],\"action\":\"IMPROVE_BULLET\"}";

        mockServer.expect(requestTo("http://ai-service-mock:8000/api/v1/resume-studio/generate"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("X-Internal-Service-Key", "test-secret-key"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andRespond(withSuccess(mockResponse, MediaType.APPLICATION_JSON));

        String result = client.generateResumeStudioContent(
                "IMPROVE_BULLET",
                "did work",
                java.util.Map.of("section", "experience"),
                "PROFESSIONAL",
                "GROQ",
                "llama-3.3-70b-versatile",
                0.3,
                1024,
                null,
                true
        );

        assertThat(result).isNotNull();
        assertThat(result).contains("Engineered systems");
        mockServer.verify();
    }
}
