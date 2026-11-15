package ai.jobachiever.ai;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.ProviderDetailsDto;
import ai.jobachiever.ai.dto.ProviderMetadataDto;
import ai.jobachiever.ai.dto.UpdateAiPreferencesRequestDto;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.ai.entity.UserAiPreference;
import ai.jobachiever.ai.exception.AIServiceException;
import ai.jobachiever.ai.repository.UserAiPreferenceRepository;
import ai.jobachiever.ai.service.UserAiPreferenceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserAiPreferenceService Unit Tests")
class UserAiPreferenceServiceTest {

    @Mock
    private UserAiPreferenceRepository preferenceRepository;

    @Mock
    private AIServiceClient aiServiceClient;

    @InjectMocks
    private UserAiPreferenceServiceImpl service;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Test
    @DisplayName("getPreferences returns platform defaults when no row exists")
    void getPreferences_ReturnsDefaults() {
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.empty());

        UserAiPreferenceDto result = service.getPreferences(userId);

        assertThat(result).isNotNull();
        assertThat(result.getSelectedProvider()).isEqualTo("GROQ");
        assertThat(result.getPreferredModel()).isEqualTo("llama-3.3-70b-versatile");
        assertThat(result.getTemperature()).isEqualTo(0.2);
        assertThat(result.getMaxTokens()).isEqualTo(2048);
        assertThat(result.isExternalProcessingConsent()).isFalse();
        assertThat(result.getConsentUpdatedAt()).isNull();
    }

    @Test
    @DisplayName("getPreferences returns stored entity when row exists")
    void getPreferences_ReturnsStoredEntity() {
        UserAiPreference entity = new UserAiPreference();
        entity.setId(UUID.randomUUID());
        entity.setUserId(userId);
        entity.setSelectedProvider("GEMINI");
        entity.setPreferredModel("gemini-2.0-flash");
        entity.setTemperature(0.5);
        entity.setMaxTokens(4096);
        entity.setExternalProcessingConsent(true);
        Instant consentTime = Instant.now().minusSeconds(3600);
        entity.setConsentUpdatedAt(consentTime);
        entity.setUpdatedAt(consentTime);

        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(entity));

        UserAiPreferenceDto result = service.getPreferences(userId);

        assertThat(result.getSelectedProvider()).isEqualTo("GEMINI");
        assertThat(result.getPreferredModel()).isEqualTo("gemini-2.0-flash");
        assertThat(result.getTemperature()).isEqualTo(0.5);
        assertThat(result.getMaxTokens()).isEqualTo(4096);
        assertThat(result.isExternalProcessingConsent()).isTrue();
        assertThat(result.getConsentUpdatedAt()).isEqualTo(consentTime);
    }

    @Test
    @DisplayName("updatePreferences creates new record with consent timestamp when consent granted")
    void updatePreferences_CreatesNewWithConsent() {
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any(UserAiPreference.class))).thenAnswer(i -> i.getArgument(0));

        UpdateAiPreferencesRequestDto req = new UpdateAiPreferencesRequestDto(
                "GROQ", "llama-3.3-70b-versatile", 0.3, 1024, true
        );

        UserAiPreferenceDto result = service.updatePreferences(userId, req);

        assertThat(result.getSelectedProvider()).isEqualTo("GROQ");
        assertThat(result.getPreferredModel()).isEqualTo("llama-3.3-70b-versatile");
        assertThat(result.getTemperature()).isEqualTo(0.3);
        assertThat(result.getMaxTokens()).isEqualTo(1024);
        assertThat(result.isExternalProcessingConsent()).isTrue();
        assertThat(result.getConsentUpdatedAt()).isNotNull();

        ArgumentCaptor<UserAiPreference> captor = ArgumentCaptor.forClass(UserAiPreference.class);
        verify(preferenceRepository).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(userId);
        assertThat(captor.getValue().getConsentUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("updatePreferences updates existing record and sets consent timestamp on state toggle")
    void updatePreferences_UpdatesExistingWithConsentToggle() {
        Instant initialConsentTime = Instant.now().minusSeconds(10000);
        UserAiPreference existing = new UserAiPreference(userId, "GROQ", "llama-3.3-70b-versatile", 0.2, 2048, true);
        existing.setConsentUpdatedAt(initialConsentTime);

        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(existing));
        when(preferenceRepository.save(any(UserAiPreference.class))).thenAnswer(i -> i.getArgument(0));

        // Revoke consent
        UpdateAiPreferencesRequestDto req = new UpdateAiPreferencesRequestDto(
                "GEMINI", "gemini-2.0-flash", 0.7, 4000, false
        );

        UserAiPreferenceDto result = service.updatePreferences(userId, req);

        assertThat(result.getSelectedProvider()).isEqualTo("GEMINI");
        assertThat(result.isExternalProcessingConsent()).isFalse();
        // consentUpdatedAt should have been updated to a new timestamp
        assertThat(result.getConsentUpdatedAt()).isAfter(initialConsentTime);
    }

    @Test
    @DisplayName("updatePreferences keeps previous consent timestamp if consent status unchanged")
    void updatePreferences_PreservesConsentTimestamp_WhenUnchanged() {
        Instant initialConsentTime = Instant.now().minusSeconds(5000);
        UserAiPreference existing = new UserAiPreference(userId, "GROQ", "llama-3.3-70b-versatile", 0.2, 2048, true);
        existing.setConsentUpdatedAt(initialConsentTime);

        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(existing));
        when(preferenceRepository.save(any(UserAiPreference.class))).thenAnswer(i -> i.getArgument(0));

        UpdateAiPreferencesRequestDto req = new UpdateAiPreferencesRequestDto(
                "GROQ", "llama-3.1-8b-instant", 0.4, 2048, true
        );

        UserAiPreferenceDto result = service.updatePreferences(userId, req);

        assertThat(result.isExternalProcessingConsent()).isTrue();
        assertThat(result.getConsentUpdatedAt()).isEqualTo(initialConsentTime);
    }

    @Test
    @DisplayName("updatePreferences defaults model if null or blank")
    void updatePreferences_DefaultsModel() {
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any(UserAiPreference.class))).thenAnswer(i -> i.getArgument(0));

        UpdateAiPreferencesRequestDto req = new UpdateAiPreferencesRequestDto(
                "GEMINI", "   ", 0.5, 2048, false
        );

        UserAiPreferenceDto result = service.updatePreferences(userId, req);

        assertThat(result.getSelectedProvider()).isEqualTo("GEMINI");
        assertThat(result.getPreferredModel()).isEqualTo("gemini-2.0-flash");
    }

    @Test
    @DisplayName("updatePreferences rejects unsupported provider")
    void updatePreferences_RejectsInvalidProvider() {
        UpdateAiPreferencesRequestDto req = new UpdateAiPreferencesRequestDto(
                "OLLAMA", "llama3", 0.2, 2048, false
        );

        assertThatThrownBy(() -> service.updatePreferences(userId, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported AI provider");
    }

    @Test
    @DisplayName("updatePreferences rejects incompatible model for GROQ")
    void updatePreferences_RejectsIncompatibleModelForGroq() {
        UpdateAiPreferencesRequestDto req = new UpdateAiPreferencesRequestDto(
                "GROQ", "gemini-2.0-flash", 0.2, 2048, false
        );

        assertThatThrownBy(() -> service.updatePreferences(userId, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Model 'gemini-2.0-flash' is not supported for provider GROQ");
    }

    @Test
    @DisplayName("updatePreferences rejects incompatible model for GEMINI")
    void updatePreferences_RejectsIncompatibleModelForGemini() {
        UpdateAiPreferencesRequestDto req = new UpdateAiPreferencesRequestDto(
                "GEMINI", "llama-3.3-70b-versatile", 0.2, 2048, false
        );

        assertThatThrownBy(() -> service.updatePreferences(userId, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Model 'llama-3.3-70b-versatile' is not supported for provider GEMINI");
    }

    @Test
    @DisplayName("hasConsent returns true only when row exists and consent is granted")
    void hasConsent_ChecksAccurately() {
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.empty());
        assertThat(service.hasConsent(userId)).isFalse();

        UserAiPreference pref = new UserAiPreference(userId, "GROQ", "llama-3.3-70b-versatile", 0.2, 2048, true);
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(pref));
        assertThat(service.hasConsent(userId)).isTrue();
    }

    @Test
    @DisplayName("getProviders returns enriched Groq as primary and Gemini as secondary")
    void getProviders_ReturnsEnrichedMetadata() {
        ProviderMetadataDto groqMeta = new ProviderMetadataDto();
        groqMeta.setId("GROQ");
        groqMeta.setName("Groq Cloud");
        groqMeta.setAvailable(true);
        groqMeta.setConfigured(true);
        groqMeta.setSupportedModels(Arrays.asList("llama-3.3-70b-versatile", "llama-3.1-8b-instant"));

        ProviderMetadataDto geminiMeta = new ProviderMetadataDto();
        geminiMeta.setId("GEMINI");
        geminiMeta.setName("Google Gemini");
        geminiMeta.setAvailable(true);
        geminiMeta.setConfigured(true);
        geminiMeta.setSupportedModels(Arrays.asList("gemini-2.0-flash", "gemini-1.5-pro"));

        when(aiServiceClient.getProviders()).thenReturn(Arrays.asList(groqMeta, geminiMeta));

        List<ProviderDetailsDto> providers = service.getProviders();

        assertThat(providers).hasSize(2);

        ProviderDetailsDto groq = providers.stream()
                .filter(p -> "GROQ".equals(p.getProviderId()))
                .findFirst()
                .orElseThrow();
        assertThat(groq.getIsPrimary()).isTrue();
        assertThat(groq.getIsAvailable()).isTrue();
        assertThat(groq.getIsConfigured()).isTrue();
        assertThat(groq.getDisplayName()).isEqualTo("Groq");

        ProviderDetailsDto gemini = providers.stream()
                .filter(p -> "GEMINI".equals(p.getProviderId()))
                .findFirst()
                .orElseThrow();
        assertThat(gemini.getIsPrimary()).isFalse();
        assertThat(gemini.getIsAvailable()).isTrue();
        assertThat(gemini.getIsConfigured()).isTrue();
        assertThat(gemini.getDisplayName()).isEqualTo("Google Gemini");
    }

    @Test
    @DisplayName("getProviders returns graceful catalog fallback when FastAPI client fails")
    void getProviders_ReturnsFallback_WhenClientFails() {
        when(aiServiceClient.getProviders()).thenThrow(new AIServiceException("Connection refused"));

        List<ProviderDetailsDto> providers = service.getProviders();

        assertThat(providers).hasSize(2);
        assertThat(providers.get(0).getProviderId()).isEqualTo("GROQ");
        assertThat(providers.get(0).getIsPrimary()).isTrue();
        assertThat(providers.get(0).getIsAvailable()).isFalse();
        assertThat(providers.get(0).getIsConfigured()).isFalse();

        assertThat(providers.get(1).getProviderId()).isEqualTo("GEMINI");
        assertThat(providers.get(1).getIsPrimary()).isFalse();
        assertThat(providers.get(1).getIsAvailable()).isFalse();
        assertThat(providers.get(1).getIsConfigured()).isFalse();
    }
}
