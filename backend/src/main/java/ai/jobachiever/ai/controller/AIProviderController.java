package ai.jobachiever.ai.controller;

import ai.jobachiever.ai.dto.ProviderDetailsDto;
import ai.jobachiever.ai.service.UserAiPreferenceService;
import ai.jobachiever.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller exposing available AI provider metadata, supported models, and connection readiness
 * for the AI Provider Settings interface.
 */
@RestController
@RequestMapping("/api/v1/ai/providers")
public class AIProviderController {

    private final UserAiPreferenceService userAiPreferenceService;

    public AIProviderController(UserAiPreferenceService userAiPreferenceService) {
        this.userAiPreferenceService = userAiPreferenceService;
    }

    /**
     * Retrieves all supported AI providers and their operational status for the settings interface.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProviderDetailsDto>>> getProviders() {
        List<ProviderDetailsDto> providers = userAiPreferenceService.getProviders();
        return ResponseEntity.ok(ApiResponse.ok(providers, "AI providers retrieved successfully"));
    }
}
