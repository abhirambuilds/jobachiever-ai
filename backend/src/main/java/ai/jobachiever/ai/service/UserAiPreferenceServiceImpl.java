package ai.jobachiever.ai.service;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.ProviderDetailsDto;
import ai.jobachiever.ai.dto.ProviderMetadataDto;
import ai.jobachiever.ai.dto.UpdateAiPreferencesRequestDto;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.ai.entity.UserAiPreference;
import ai.jobachiever.ai.repository.UserAiPreferenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserAiPreferenceServiceImpl implements UserAiPreferenceService {

    private static final Logger log = LoggerFactory.getLogger(UserAiPreferenceServiceImpl.class);

    public static final String PROVIDER_GROQ = "GROQ";
    public static final String PROVIDER_GEMINI = "GEMINI";

    public static final String DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
    public static final String DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

    public static final List<String> GROQ_MODELS = Collections.unmodifiableList(Arrays.asList(
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
            "gemma2-9b-it"
    ));

    public static final List<String> GEMINI_MODELS = Collections.unmodifiableList(Arrays.asList(
            "gemini-2.0-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash"
    ));

    private final UserAiPreferenceRepository preferenceRepository;
    private final AIServiceClient aiServiceClient;

    public UserAiPreferenceServiceImpl(UserAiPreferenceRepository preferenceRepository,
                                      AIServiceClient aiServiceClient) {
        this.preferenceRepository = preferenceRepository;
        this.aiServiceClient = aiServiceClient;
    }

    @Override
    @Transactional(readOnly = true)
    public UserAiPreferenceDto getPreferences(UUID userId) {
        return preferenceRepository.findByUserId(userId)
                .map(this::toDto)
                .orElseGet(this::createDefaultDto);
    }

    @Override
    public UserAiPreferenceDto updatePreferences(UUID userId, UpdateAiPreferencesRequestDto request) {
        String provider = request.getSelectedProvider().toUpperCase();
        if (!PROVIDER_GROQ.equals(provider) && !PROVIDER_GEMINI.equals(provider)) {
            throw new IllegalArgumentException("Unsupported AI provider: " + provider + ". Supported: GROQ, GEMINI");
        }

        String model = request.getPreferredModel();
        if (model == null || model.trim().isEmpty()) {
            model = PROVIDER_GROQ.equals(provider) ? DEFAULT_GROQ_MODEL : DEFAULT_GEMINI_MODEL;
        } else {
            model = model.trim();
            validateModelForProvider(provider, model);
        }

        Optional<UserAiPreference> existingOpt = preferenceRepository.findByUserId(userId);
        UserAiPreference entity;
        Instant now = Instant.now();

        if (existingOpt.isPresent()) {
            entity = existingOpt.get();
            // Track timestamp if external processing consent changed
            if (entity.isExternalProcessingConsent() != Boolean.TRUE.equals(request.getExternalProcessingConsent())) {
                entity.setConsentUpdatedAt(now);
            }
            entity.setSelectedProvider(provider);
            entity.setPreferredModel(model);
            entity.setTemperature(request.getTemperature());
            entity.setMaxTokens(request.getMaxTokens());
            entity.setExternalProcessingConsent(Boolean.TRUE.equals(request.getExternalProcessingConsent()));
            entity.setUpdatedAt(now);
        } else {
            entity = new UserAiPreference();
            entity.setUserId(userId);
            entity.setSelectedProvider(provider);
            entity.setPreferredModel(model);
            entity.setTemperature(request.getTemperature());
            entity.setMaxTokens(request.getMaxTokens());
            entity.setExternalProcessingConsent(Boolean.TRUE.equals(request.getExternalProcessingConsent()));
            if (Boolean.TRUE.equals(request.getExternalProcessingConsent())) {
                entity.setConsentUpdatedAt(now);
            }
            entity.setCreatedAt(now);
            entity.setUpdatedAt(now);
        }

        UserAiPreference saved = preferenceRepository.save(entity);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasConsent(UUID userId) {
        return preferenceRepository.findByUserId(userId)
                .map(UserAiPreference::isExternalProcessingConsent)
                .orElse(true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProviderDetailsDto> getProviders() {
        List<ProviderMetadataDto> backendProviders = Collections.emptyList();
        try {
            backendProviders = aiServiceClient.getProviders();
        } catch (Exception ex) {
            log.warn("Could not query live AI provider status from FastAPI: {}. Using catalog fallback.", ex.getMessage());
        }

        Map<String, ProviderMetadataDto> statusMap = new java.util.HashMap<>();
        for (ProviderMetadataDto p : backendProviders) {
            if (p.getId() != null) {
                statusMap.put(p.getId().toUpperCase(), p);
            }
        }

        List<ProviderDetailsDto> result = new ArrayList<>();

        // 1. Groq (Primary)
        ProviderMetadataDto groqMeta = statusMap.get(PROVIDER_GROQ);
        boolean groqAvailable = groqMeta != null && groqMeta.isAvailable();
        boolean groqConfigured = groqMeta != null && groqMeta.isConfigured();
        List<String> groqModels = groqMeta != null && groqMeta.getSupportedModels() != null && !groqMeta.getSupportedModels().isEmpty()
                ? groqMeta.getSupportedModels()
                : GROQ_MODELS;

        result.add(new ProviderDetailsDto(
                PROVIDER_GROQ,
                "Groq",
                true,
                groqConfigured,
                groqAvailable,
                DEFAULT_GROQ_MODEL,
                groqModels,
                "Ultra-fast inference powered by Groq LPU architecture. Ideal for real-time analysis, structured extraction, and rapid ATS scoring.",
                "Subject to Groq Cloud free-tier rate limits (~30 RPM / 14,400 RPD).",
                "Data sent to Groq Cloud is processed in memory. No user resume data is used for model training."
        ));

        // 2. Google Gemini (Secondary)
        ProviderMetadataDto geminiMeta = statusMap.get(PROVIDER_GEMINI);
        boolean geminiAvailable = geminiMeta != null && geminiMeta.isAvailable();
        boolean geminiConfigured = geminiMeta != null && geminiMeta.isConfigured();
        List<String> geminiModels = geminiMeta != null && geminiMeta.getSupportedModels() != null && !geminiMeta.getSupportedModels().isEmpty()
                ? geminiMeta.getSupportedModels()
                : GEMINI_MODELS;

        result.add(new ProviderDetailsDto(
                PROVIDER_GEMINI,
                "Google Gemini",
                false,
                geminiConfigured,
                geminiAvailable,
                DEFAULT_GEMINI_MODEL,
                geminiModels,
                "Google DeepMind frontier multimodal models with large context windows. Optimal for complex contextual synthesis and deep career narratives.",
                "Subject to Google Gemini API free-tier quotas (15 RPM / 1M TPM).",
                "Data processed under Google Cloud & Gemini enterprise privacy commitments. Transmitted only with explicit user consent."
        ));

        return result;
    }

    private void validateModelForProvider(String provider, String model) {
        if (PROVIDER_GROQ.equals(provider)) {
            if (!GROQ_MODELS.contains(model)) {
                throw new IllegalArgumentException(
                        "Model '" + model + "' is not supported for provider GROQ. Supported: " + GROQ_MODELS);
            }
        } else if (PROVIDER_GEMINI.equals(provider)) {
            if (!GEMINI_MODELS.contains(model)) {
                throw new IllegalArgumentException(
                        "Model '" + model + "' is not supported for provider GEMINI. Supported: " + GEMINI_MODELS);
            }
        }
    }

    private UserAiPreferenceDto toDto(UserAiPreference entity) {
        return new UserAiPreferenceDto(
                entity.getSelectedProvider(),
                entity.getPreferredModel(),
                entity.getTemperature(),
                entity.getMaxTokens(),
                entity.isExternalProcessingConsent(),
                entity.getConsentUpdatedAt(),
                entity.getUpdatedAt() != null ? entity.getUpdatedAt() : entity.getCreatedAt()
        );
    }

    private UserAiPreferenceDto createDefaultDto() {
        return new UserAiPreferenceDto(
                PROVIDER_GROQ,
                DEFAULT_GROQ_MODEL,
                0.2,
                2048,
                false,
                null,
                Instant.now()
        );
    }
}
