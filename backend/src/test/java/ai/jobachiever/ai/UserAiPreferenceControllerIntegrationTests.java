package ai.jobachiever.ai;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.ProviderMetadataDto;
import ai.jobachiever.ai.dto.UpdateAiPreferencesRequestDto;
import ai.jobachiever.ai.entity.UserAiPreference;
import ai.jobachiever.ai.repository.UserAiPreferenceRepository;
import ai.jobachiever.auth.service.JwtService;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("UserAiPreferenceController Integration Tests")
class UserAiPreferenceControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private UserAiPreferenceRepository preferenceRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private AIServiceClient aiServiceClient;

    private UUID userIdA;
    private User userA;
    private String jwtTokenA;

    private UUID userIdB;
    private User userB;
    private String jwtTokenB;

    @BeforeEach
    void setUp() {
        userIdA = UUID.randomUUID();
        userA = new User("User", "Alpha", "user.alpha@jobachiever.ai", "HashedSecret123!");
        userA.setId(userIdA);
        userA.setAccountStatus(AccountStatus.ACTIVE);
        userA.setEmailVerified(true);
        userA.setRole(Role.USER);

        userIdB = UUID.randomUUID();
        userB = new User("User", "Beta", "user.beta@jobachiever.ai", "HashedSecret456!");
        userB.setId(userIdB);
        userB.setAccountStatus(AccountStatus.ACTIVE);
        userB.setEmailVerified(true);
        userB.setRole(Role.USER);

        when(userRepository.findById(userIdA)).thenReturn(Optional.of(userA));
        when(userRepository.findByEmailIgnoreCase("user.alpha@jobachiever.ai")).thenReturn(Optional.of(userA));

        when(userRepository.findById(userIdB)).thenReturn(Optional.of(userB));
        when(userRepository.findByEmailIgnoreCase("user.beta@jobachiever.ai")).thenReturn(Optional.of(userB));

        jwtTokenA = jwtService.generateToken(userIdA, userA.getEmail());
        jwtTokenB = jwtService.generateToken(userIdB, userB.getEmail());
    }

    @Test
    @DisplayName("GET /api/v1/users/me/ai-preferences without auth returns 401")
    void getPreferences_WithoutAuth_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me/ai-preferences"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/users/me/ai-preferences with auth returns platform defaults for new user")
    void getPreferences_ReturnsDefaults() throws Exception {
        when(preferenceRepository.findByUserId(userIdA)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/users/me/ai-preferences")
                        .header("Authorization", "Bearer " + jwtTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.selectedProvider").value("GROQ"))
                .andExpect(jsonPath("$.data.preferredModel").value("llama-3.3-70b-versatile"))
                .andExpect(jsonPath("$.data.temperature").value(0.2))
                .andExpect(jsonPath("$.data.maxTokens").value(2048))
                .andExpect(jsonPath("$.data.externalProcessingConsent").value(false));
    }

    @Test
    @DisplayName("PUT /api/v1/users/me/ai-preferences saves updated preferences and records consent timestamp")
    void putPreferences_SavesSuccessfully() throws Exception {
        when(preferenceRepository.findByUserId(userIdA)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any(UserAiPreference.class))).thenAnswer(i -> {
            UserAiPreference p = i.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        UpdateAiPreferencesRequestDto request = new UpdateAiPreferencesRequestDto(
                "GEMINI", "gemini-2.0-flash", 0.7, 4096, true
        );

        mockMvc.perform(put("/api/v1/users/me/ai-preferences")
                        .header("Authorization", "Bearer " + jwtTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.selectedProvider").value("GEMINI"))
                .andExpect(jsonPath("$.data.preferredModel").value("gemini-2.0-flash"))
                .andExpect(jsonPath("$.data.temperature").value(0.7))
                .andExpect(jsonPath("$.data.maxTokens").value(4096))
                .andExpect(jsonPath("$.data.externalProcessingConsent").value(true))
                .andExpect(jsonPath("$.data.consentUpdatedAt").isNotEmpty());

        verify(preferenceRepository).save(any(UserAiPreference.class));
    }

    @Test
    @DisplayName("PUT /api/v1/users/me/ai-preferences rejects unsupported provider name")
    void putPreferences_RejectsInvalidProvider() throws Exception {
        UpdateAiPreferencesRequestDto request = new UpdateAiPreferencesRequestDto(
                "OLLAMA", "llama3", 0.2, 2048, false
        );

        mockMvc.perform(put("/api/v1/users/me/ai-preferences")
                        .header("Authorization", "Bearer " + jwtTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("PUT /api/v1/users/me/ai-preferences rejects temperature out of range [0.0, 2.0]")
    void putPreferences_RejectsInvalidTemperature() throws Exception {
        UpdateAiPreferencesRequestDto request = new UpdateAiPreferencesRequestDto(
                "GROQ", "llama-3.3-70b-versatile", 2.5, 2048, false
        );

        mockMvc.perform(put("/api/v1/users/me/ai-preferences")
                        .header("Authorization", "Bearer " + jwtTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/v1/users/me/ai-preferences rejects maxTokens out of range [128, 8192]")
    void putPreferences_RejectsInvalidMaxTokens() throws Exception {
        UpdateAiPreferencesRequestDto request = new UpdateAiPreferencesRequestDto(
                "GROQ", "llama-3.3-70b-versatile", 0.5, 10000, false
        );

        mockMvc.perform(put("/api/v1/users/me/ai-preferences")
                        .header("Authorization", "Bearer " + jwtTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/v1/users/me/ai-preferences rejects model not belonging to chosen provider")
    void putPreferences_RejectsIncompatibleModel() throws Exception {
        UpdateAiPreferencesRequestDto request = new UpdateAiPreferencesRequestDto(
                "GROQ", "gemini-2.0-flash", 0.5, 2048, false
        );

        mockMvc.perform(put("/api/v1/users/me/ai-preferences")
                        .header("Authorization", "Bearer " + jwtTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("not supported for provider GROQ")));
    }

    @Test
    @DisplayName("GET /api/v1/ai/providers returns provider catalog with primary and secondary tiers")
    void getProviders_ReturnsList() throws Exception {
        ProviderMetadataDto groqMeta = new ProviderMetadataDto();
        groqMeta.setId("GROQ");
        groqMeta.setName("Groq Cloud");
        groqMeta.setAvailable(true);
        groqMeta.setConfigured(true);

        ProviderMetadataDto geminiMeta = new ProviderMetadataDto();
        geminiMeta.setId("GEMINI");
        geminiMeta.setName("Google Gemini");
        geminiMeta.setAvailable(false);
        geminiMeta.setConfigured(false);

        when(aiServiceClient.getProviders()).thenReturn(Arrays.asList(groqMeta, geminiMeta));

        mockMvc.perform(get("/api/v1/ai/providers")
                        .header("Authorization", "Bearer " + jwtTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].providerId").value("GROQ"))
                .andExpect(jsonPath("$.data[0].isPrimary").value(true))
                .andExpect(jsonPath("$.data[0].isAvailable").value(true))
                .andExpect(jsonPath("$.data[0].isConfigured").value(true))
                .andExpect(jsonPath("$.data[1].providerId").value("GEMINI"))
                .andExpect(jsonPath("$.data[1].isPrimary").value(false))
                .andExpect(jsonPath("$.data[1].isAvailable").value(false));
    }

    @Test
    @DisplayName("User Isolation: User A's AI preferences are isolated from User B")
    void userIsolation_Enforced() throws Exception {
        UserAiPreference prefA = new UserAiPreference(userIdA, "GEMINI", "gemini-2.0-flash", 0.9, 3000, true);
        prefA.setConsentUpdatedAt(Instant.now());

        when(preferenceRepository.findByUserId(userIdA)).thenReturn(Optional.of(prefA));
        when(preferenceRepository.findByUserId(userIdB)).thenReturn(Optional.empty());

        // User A reads preferences -> gets GEMINI with consent
        mockMvc.perform(get("/api/v1/users/me/ai-preferences")
                        .header("Authorization", "Bearer " + jwtTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.selectedProvider").value("GEMINI"))
                .andExpect(jsonPath("$.data.externalProcessingConsent").value(true));

        // User B reads preferences -> gets defaults (GROQ, consent=false), NOT User A's GEMINI
        mockMvc.perform(get("/api/v1/users/me/ai-preferences")
                        .header("Authorization", "Bearer " + jwtTokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.selectedProvider").value("GROQ"))
                .andExpect(jsonPath("$.data.externalProcessingConsent").value(false));
    }
}
