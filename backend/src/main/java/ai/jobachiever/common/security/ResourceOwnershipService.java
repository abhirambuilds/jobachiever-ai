package ai.jobachiever.common.security;

import ai.jobachiever.applications.entity.ApplicationActivity;
import ai.jobachiever.applications.entity.JobApplication;
import ai.jobachiever.careertracks.entity.CareerTrack;
import ai.jobachiever.profiles.entity.CareerProfile;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;

import java.util.UUID;

/**
 * Reusable service validating resource ownership across all private user resources.
 * Always resolves access by both resource ID and authenticated user ID,
 * returning 404 (ResourceNotFoundException) for unauthorized queries to prevent ID enumeration.
 */
public interface ResourceOwnershipService {

    CareerProfile verifyCareerProfileOwnership(UUID profileId, UUID userId);

    CareerTrack verifyCareerTrackOwnership(UUID trackId, UUID userId);

    ResumeDocument verifyResumeDocumentOwnership(UUID documentId, UUID userId);

    ResumeVersion verifyResumeVersionOwnership(UUID versionId, UUID userId);

    JobApplication verifyJobApplicationOwnership(UUID applicationId, UUID userId);

    ApplicationActivity verifyApplicationActivityOwnership(UUID activityId, UUID userId);

    void validateResumeVersionForApplication(UUID resumeVersionId, UUID userId);
}
