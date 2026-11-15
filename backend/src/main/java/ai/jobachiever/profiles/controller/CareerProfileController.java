package ai.jobachiever.profiles.controller;

import ai.jobachiever.common.response.ApiResponse;
import ai.jobachiever.common.security.CurrentUserService;
import ai.jobachiever.profiles.dto.*;
import ai.jobachiever.profiles.service.CareerProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
public class CareerProfileController {

    private final CareerProfileService careerProfileService;
    private final CurrentUserService currentUserService;

    public CareerProfileController(CareerProfileService careerProfileService,
                                   CurrentUserService currentUserService) {
        this.careerProfileService = careerProfileService;
        this.currentUserService = currentUserService;
    }

    /**
     * Retrieve the current authenticated user's master career profile.
     * Automatically initializes a default profile if one does not already exist.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CareerProfileResponse>> getMyProfile() {
        UUID userId = currentUserService.getAuthenticatedUserId();
        CareerProfileResponse profile = careerProfileService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.ok(profile, "Profile retrieved successfully"));
    }

    /**
     * Idempotently create or fully update the user's master career profile and all child sections.
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<CareerProfileResponse>> updateMyProfile(
            @Valid @RequestBody UpdateCareerProfileRequest request) {
        UUID userId = currentUserService.getAuthenticatedUserId();
        CareerProfileResponse updated = careerProfileService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Profile updated successfully"));
    }

    /**
     * Partially update specific sections of the user's master career profile without
     * touching unmodified sections.
     */
    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<CareerProfileResponse>> patchMyProfile(
            @Valid @RequestBody PatchCareerProfileRequest request) {
        UUID userId = currentUserService.getAuthenticatedUserId();
        CareerProfileResponse updated = careerProfileService.patchProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Profile updated successfully"));
    }

    /**
     * Retrieve transparent, deterministic profile completion calculation and breakdown.
     */
    @GetMapping("/me/completion")
    public ResponseEntity<ApiResponse<ProfileCompletionResponse>> getMyProfileCompletion() {
        UUID userId = currentUserService.getAuthenticatedUserId();
        ProfileCompletionResponse completion = careerProfileService.getCompletion(userId);
        return ResponseEntity.ok(ApiResponse.ok(completion, "Profile completion calculated successfully"));
    }
}
