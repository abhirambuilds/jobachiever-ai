package ai.jobachiever.profiles.service;

import ai.jobachiever.profiles.dto.CareerProfileResponse;
import ai.jobachiever.profiles.dto.PatchCareerProfileRequest;
import ai.jobachiever.profiles.dto.ProfileCompletionResponse;
import ai.jobachiever.profiles.dto.UpdateCareerProfileRequest;

import java.util.UUID;

public interface CareerProfileService {

    CareerProfileResponse getProfile(UUID userId);

    CareerProfileResponse updateProfile(UUID userId, UpdateCareerProfileRequest request);

    CareerProfileResponse patchProfile(UUID userId, PatchCareerProfileRequest request);

    ProfileCompletionResponse getCompletion(UUID userId);
}
