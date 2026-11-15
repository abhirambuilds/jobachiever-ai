package ai.jobachiever.ai.controller;

import ai.jobachiever.ai.dto.UpdateAiPreferencesRequestDto;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.ai.service.UserAiPreferenceService;
import ai.jobachiever.common.response.ApiResponse;
import ai.jobachiever.common.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller exposing endpoints for managing the authenticated user's AI provider preferences,
 * generation parameters, and external data transmission consent.
 */
@RestController
@RequestMapping("/api/v1/users/me/ai-preferences")
public class UserAiPreferenceController {

    private final UserAiPreferenceService userAiPreferenceService;
    private final CurrentUserService currentUserService;

    public UserAiPreferenceController(UserAiPreferenceService userAiPreferenceService,
                                      CurrentUserService currentUserService) {
        this.userAiPreferenceService = userAiPreferenceService;
        this.currentUserService = currentUserService;
    }

    /**
     * Retrieve the current authenticated user's AI preferences.
     * Returns platform defaults if preferences have not yet been stored.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<UserAiPreferenceDto>> getPreferences() {
        UUID userId = currentUserService.getAuthenticatedUserId();
        UserAiPreferenceDto preferences = userAiPreferenceService.getPreferences(userId);
        return ResponseEntity.ok(ApiResponse.ok(preferences, "AI preferences retrieved successfully"));
    }

    /**
     * Update the current authenticated user's AI preferences and consent settings.
     * Validates provider choices, supported models, temperature, and token boundaries.
     */
    @PutMapping
    public ResponseEntity<ApiResponse<UserAiPreferenceDto>> updatePreferences(
            @Valid @RequestBody UpdateAiPreferencesRequestDto request) {
        UUID userId = currentUserService.getAuthenticatedUserId();
        UserAiPreferenceDto updated = userAiPreferenceService.updatePreferences(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "AI preferences updated successfully"));
    }
}
