package ai.jobachiever.common.exception;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false) // Bypass security filters for exception handler contract unit testing
@ActiveProfiles("test")
@Import(GlobalExceptionHandlerTests.TestConfig.class)
class GlobalExceptionHandlerTests {

    @Autowired
    private MockMvc mockMvc;

    @TestConfiguration
    static class TestConfig {
        @RestController
        @RequestMapping("/api/v1/test-validation")
        static class TestValidationController {
            @PostMapping
            public ResponseEntity<String> validatePayload(@Valid @RequestBody TestRequest request) {
                return ResponseEntity.ok("Valid: " + request.name());
            }
        }
    }

    record TestRequest(
            @NotBlank(message = "Name must not be blank")
            String name,

            @NotBlank(message = "Email must not be blank")
            @Email(message = "Must be a valid email format")
            String email
    ) {}

    @Test
    @DisplayName("Non-existent endpoint returns HTTP 404 with standardized ErrorResponse")
    void nonExistentEndpointReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/non-existent-route"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.timestamp", notNullValue()))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.path").value("/api/v1/non-existent-route"))
                .andExpect(jsonPath("$.message", notNullValue()));
    }

    @Test
    @DisplayName("Validation failure returns HTTP 400 with field-level validationErrors list")
    void validationErrorReturns400WithDetails() throws Exception {
        String invalidJson = """
                {
                    "name": "",
                    "email": "invalid-email-address"
                }
                """;

        mockMvc.perform(post("/api/v1/test-validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.timestamp", notNullValue()))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed for request parameters"))
                .andExpect(jsonPath("$.path").value("/api/v1/test-validation"))
                .andExpect(jsonPath("$.validationErrors", hasSize(2)));
    }

    @Test
    @DisplayName("Malformed JSON returns HTTP 400 with clean error message")
    void malformedJsonReturns400() throws Exception {
        String malformedJson = "{ broken json: ";

        mockMvc.perform(post("/api/v1/test-validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.timestamp", notNullValue()))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Malformed JSON request body"))
                .andExpect(jsonPath("$.path").value("/api/v1/test-validation"));
    }

    @Test
    @DisplayName("Unsupported HTTP method returns HTTP 405 Method Not Allowed")
    void unsupportedMethodReturns405() throws Exception {
        mockMvc.perform(delete("/api/v1/health"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.timestamp", notNullValue()))
                .andExpect(jsonPath("$.status").value(405))
                .andExpect(jsonPath("$.error").value("Method Not Allowed"))
                .andExpect(jsonPath("$.path").value("/api/v1/health"));
    }
}
