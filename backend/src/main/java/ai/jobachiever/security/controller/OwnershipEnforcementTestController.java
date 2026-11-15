package ai.jobachiever.security.controller;

import ai.jobachiever.applications.entity.ApplicationActivity;
import ai.jobachiever.applications.entity.JobApplication;
import ai.jobachiever.careertracks.entity.CareerTrack;
import ai.jobachiever.common.response.ApiResponse;
import ai.jobachiever.common.security.CurrentUserService;
import ai.jobachiever.common.security.ResourceOwnershipService;
import ai.jobachiever.profiles.entity.CareerProfile;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Controller enforcing and verifying user ownership boundaries and account state guardrails
 * across private resources. All operations scope strictly by authenticated user ID.
 */
@RestController
@RequestMapping("/api/v1/resources")
public class OwnershipEnforcementTestController {

    private final CurrentUserService currentUserService;
    private final ResourceOwnershipService ownershipService;

    public OwnershipEnforcementTestController(CurrentUserService currentUserService,
                                              ResourceOwnershipService ownershipService) {
        this.currentUserService = currentUserService;
        this.ownershipService = ownershipService;
    }

    @GetMapping("/profile/{profileId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(@PathVariable UUID profileId) {
        currentUserService.requireActiveUser();
        UUID userId = currentUserService.getAuthenticatedUserId();
        CareerProfile profile = ownershipService.verifyCareerProfileOwnership(profileId, userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("id", profile.getId(), "ownerId", userId)));
    }

    @PutMapping("/profile/{profileId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(@PathVariable UUID profileId) {
        currentUserService.requireActiveUser();
        UUID userId = currentUserService.getAuthenticatedUserId();
        CareerProfile profile = ownershipService.verifyCareerProfileOwnership(profileId, userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("id", profile.getId(), "updated", true)));
    }

    @GetMapping("/track/{trackId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTrack(@PathVariable UUID trackId) {
        currentUserService.requireActiveUser();
        UUID userId = currentUserService.getAuthenticatedUserId();
        CareerTrack track = ownershipService.verifyCareerTrackOwnership(trackId, userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("id", track.getId(), "ownerId", userId)));
    }

    @DeleteMapping("/resume/{documentId}")
    public ResponseEntity<Void> deleteResume(@PathVariable UUID documentId) {
        currentUserService.requireActiveUser();
        UUID userId = currentUserService.getAuthenticatedUserId();
        ResumeDocument document = ownershipService.verifyResumeDocumentOwnership(documentId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/resume-version/{versionId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getResumeVersion(@PathVariable UUID versionId) {
        currentUserService.requireActiveUser();
        UUID userId = currentUserService.getAuthenticatedUserId();
        ResumeVersion version = ownershipService.verifyResumeVersionOwnership(versionId, userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("id", version.getId(), "version", version.getVersionNumber())));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getJobApplication(@PathVariable UUID applicationId) {
        currentUserService.requireActiveUser();
        UUID userId = currentUserService.getAuthenticatedUserId();
        JobApplication application = ownershipService.verifyJobApplicationOwnership(applicationId, userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("id", application.getId(), "status", application.getStatus())));
    }

    @GetMapping("/activity/{activityId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getActivity(@PathVariable UUID activityId) {
        currentUserService.requireActiveUser();
        UUID userId = currentUserService.getAuthenticatedUserId();
        ApplicationActivity activity = ownershipService.verifyApplicationActivityOwnership(activityId, userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("id", activity.getId(), "type", activity.getActivityType())));
    }

    @PostMapping("/application-reference/{resumeVersionId}")
    public ResponseEntity<ApiResponse<String>> referenceResumeVersion(@PathVariable UUID resumeVersionId) {
        currentUserService.requireActiveUser();
        UUID userId = currentUserService.getAuthenticatedUserId();
        ownershipService.validateResumeVersionForApplication(resumeVersionId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Valid resume version attachment"));
    }

    @GetMapping("/verified-only")
    public ResponseEntity<ApiResponse<String>> getVerifiedOnlyResource() {
        currentUserService.requireVerifiedUser();
        return ResponseEntity.ok(ApiResponse.ok("Access granted to verified user"));
    }
}
