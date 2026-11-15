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
}
