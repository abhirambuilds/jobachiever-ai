package ai.jobachiever.ai.service;

import ai.jobachiever.ai.dto.ProviderDetailsDto;
import ai.jobachiever.ai.dto.UpdateAiPreferencesRequestDto;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;

import java.util.List;
import java.util.UUID;

public interface UserAiPreferenceService {

    /**
     * Retrieves the active user's AI preferences, returning standard platform defaults
     * if none have been explicitly saved yet.
     *
     * @param userId authenticated user ID
     * @return UserAiPreferenceDto
     */
    UserAiPreferenceDto getPreferences(UUID userId);

    /**
     * Updates or creates the user's AI preferences, tracking changes in external consent timestamp.
     *
     * @param userId  authenticated user ID
     * @param request update payload with validation constraints
     * @return updated UserAiPreferenceDto
     */
    UserAiPreferenceDto updatePreferences(UUID userId, UpdateAiPreferencesRequestDto request);

    /**
     * Checks whether the user has explicitly consented to external AI data processing.
     *
     * @param userId authenticated user ID
     * @return true if consent is granted, false otherwise
     */
    boolean hasConsent(UUID userId);

    /**
     * Retrieves the list of available providers, enriched with metadata, status,
     * and capability summaries.
     *
     * @return list of ProviderDetailsDto
     */
    List<ProviderDetailsDto> getProviders();
}
