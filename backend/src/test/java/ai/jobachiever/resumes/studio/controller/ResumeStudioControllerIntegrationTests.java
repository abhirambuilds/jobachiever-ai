package ai.jobachiever.resumes.studio.controller;

import ai.jobachiever.auth.service.JwtService;
import ai.jobachiever.resumes.studio.dto.ResumeStudioRequest;
import ai.jobachiever.resumes.studio.dto.ResumeStudioResponseDto;
import ai.jobachiever.resumes.studio.dto.SuggestionItemDto;
import ai.jobachiever.resumes.studio.service.ResumeStudioService;
import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.Role;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Resume Studio Controller Integration Tests")
class ResumeStudioControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private ResumeStudioService resumeStudioService;

    @MockBean
    private UserRepository userRepository;

    private UUID userId;
    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("author@jobachiever.ai");
        testUser.setFirstName("Morgan");
        testUser.setLastName("Reed");
        testUser.setRole(Role.USER);
        testUser.setAccountStatus(AccountStatus.ACTIVE);
        testUser.setEmailVerified(true);

        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(userRepository.findByEmailIgnoreCase(testUser.getEmail())).willReturn(Optional.of(testUser));

        jwtToken = "Bearer " + jwtService.generateToken(testUser.getId(), testUser.getEmail());
    }

    @Test
    @DisplayName("POST /api/v1/studio/generate returns 200 OK with suggestions")
    void shouldGenerateSuggestionsSuccessfully() throws Exception {
        ResumeStudioResponseDto mockResponse = ResumeStudioResponseDto.builder()
                .action("IMPROVE_BULLET")
                .writingMode("PROFESSIONAL")
                .provider("GROQ")
                .model("llama-3.3-70b-versatile")
                .disclaimer("JobAchiever AI enforces strict zero-fabrication.")
                .suggestions(List.of(
                        SuggestionItemDto.builder()
                                .id("sug-1")
                                .originalText("Worked on backend microservices.")
                                .suggestedText("Architected resilient backend microservices.")
                                .reason("Replaced weak verb with technical leadership.")
                                .changes(List.of("Replaced 'Worked on' with 'Architected'"))
                                .preservedFacts(List.of("backend microservices"))
                                .confidence("HIGH")
                                .writingMode("PROFESSIONAL")
                                .build()
                ))
                .build();

        given(resumeStudioService.enhanceContent(eq(userId), any(ResumeStudioRequest.class)))
                .willReturn(mockResponse);

        ResumeStudioRequest request = ResumeStudioRequest.builder()
                .action("IMPROVE_BULLET")
                .sourceText("Worked on backend microservices.")
                .writingMode("PROFESSIONAL")
                .build();

        mockMvc.perform(post("/api/v1/studio/generate")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.action").value("IMPROVE_BULLET"))
                .andExpect(jsonPath("$.data.writing_mode").value("PROFESSIONAL"))
                .andExpect(jsonPath("$.data.provider").value("GROQ"))
                .andExpect(jsonPath("$.data.suggestions", hasSize(1)))
                .andExpect(jsonPath("$.data.suggestions[0].suggested_text").value("Architected resilient backend microservices."))
                .andExpect(jsonPath("$.data.suggestions[0].confidence").value("HIGH"));
    }

    @Test
    @DisplayName("POST /api/v1/studio/rewrite alias also returns 200 OK")
    void shouldSupportRewriteEndpointAlias() throws Exception {
        ResumeStudioResponseDto mockResponse = ResumeStudioResponseDto.builder()
                .action("FIX_GRAMMAR")
                .writingMode("CONCISE")
                .suggestions(List.of(
                        SuggestionItemDto.builder()
                                .id("sug-grammar")
                                .originalText("he did work fast")
                                .suggestedText("Executed deliverables promptly")
                                .confidence("HIGH")
                                .build()
                ))
                .build();

        given(resumeStudioService.enhanceContent(eq(userId), any(ResumeStudioRequest.class)))
                .willReturn(mockResponse);

        ResumeStudioRequest request = ResumeStudioRequest.builder()
                .action("FIX_GRAMMAR")
                .sourceText("he did work fast")
                .writingMode("CONCISE")
                .build();

        mockMvc.perform(post("/api/v1/studio/rewrite")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.action").value("FIX_GRAMMAR"));
    }

    @Test
    @DisplayName("POST /api/v1/studio/generate returns 400 Bad Request when action or sourceText is blank")
    void shouldReturnBadRequestWhenMissingRequiredFields() throws Exception {
        ResumeStudioRequest emptyRequest = ResumeStudioRequest.builder()
                .action("")
                .sourceText("")
                .build();

        mockMvc.perform(post("/api/v1/studio/generate")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/studio/generate returns 401 Unauthorized without Bearer token")
    void shouldReturnUnauthorizedWhenNoTokenProvided() throws Exception {
        ResumeStudioRequest request = ResumeStudioRequest.builder()
                .action("IMPROVE_BULLET")
                .sourceText("Built web application.")
                .build();

        mockMvc.perform(post("/api/v1/studio/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/studio/generate returns 403 Forbidden when AI consent is not granted")
    void shouldReturnForbiddenWhenConsentMissing() throws Exception {
        given(resumeStudioService.enhanceContent(eq(userId), any(ResumeStudioRequest.class)))
                .willThrow(new AccessDeniedException("External AI processing consent is required. Please grant consent in AI Provider Settings before using the AI Writing Assistant."));

        ResumeStudioRequest request = ResumeStudioRequest.builder()
                .action("IMPROVE_BULLET")
                .sourceText("Built web application.")
                .build();

        mockMvc.perform(post("/api/v1/studio/generate")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
