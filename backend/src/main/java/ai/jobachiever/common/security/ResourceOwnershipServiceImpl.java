package ai.jobachiever.common.security;

import ai.jobachiever.applications.entity.ApplicationActivity;
import ai.jobachiever.applications.entity.JobApplication;
import ai.jobachiever.applications.repository.ApplicationActivityRepository;
import ai.jobachiever.applications.repository.JobApplicationRepository;
import ai.jobachiever.careertracks.entity.CareerTrack;
import ai.jobachiever.careertracks.repository.CareerTrackRepository;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.profiles.entity.CareerProfile;
import ai.jobachiever.profiles.repository.CareerProfileRepository;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;
import ai.jobachiever.resumes.repository.ResumeDocumentRepository;
import ai.jobachiever.resumes.repository.ResumeVersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ResourceOwnershipServiceImpl implements ResourceOwnershipService {

    private final CareerProfileRepository careerProfileRepository;
    private final CareerTrackRepository careerTrackRepository;
    private final ResumeDocumentRepository resumeDocumentRepository;
    private final ResumeVersionRepository resumeVersionRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ApplicationActivityRepository applicationActivityRepository;

    public ResourceOwnershipServiceImpl(CareerProfileRepository careerProfileRepository,
                                       CareerTrackRepository careerTrackRepository,
                                       ResumeDocumentRepository resumeDocumentRepository,
                                       ResumeVersionRepository resumeVersionRepository,
                                       JobApplicationRepository jobApplicationRepository,
                                       ApplicationActivityRepository applicationActivityRepository) {
        this.careerProfileRepository = careerProfileRepository;
        this.careerTrackRepository = careerTrackRepository;
        this.resumeDocumentRepository = resumeDocumentRepository;
        this.resumeVersionRepository = resumeVersionRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.applicationActivityRepository = applicationActivityRepository;
    }

    @Override
    public CareerProfile verifyCareerProfileOwnership(UUID profileId, UUID userId) {
        return careerProfileRepository.findByIdAndUserId(profileId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Career profile not found with id: " + profileId));
    }

    @Override
    public CareerTrack verifyCareerTrackOwnership(UUID trackId, UUID userId) {
        return careerTrackRepository.findByIdAndUserId(trackId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Career track not found with id: " + trackId));
    }

    @Override
    public ResumeDocument verifyResumeDocumentOwnership(UUID documentId, UUID userId) {
        return resumeDocumentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume document not found with id: " + documentId));
    }

    @Override
    public ResumeVersion verifyResumeVersionOwnership(UUID versionId, UUID userId) {
        return resumeVersionRepository.findByIdAndDocumentUserId(versionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume version not found with id: " + versionId));
    }

    @Override
    public JobApplication verifyJobApplicationOwnership(UUID applicationId, UUID userId) {
        return jobApplicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + applicationId));
    }

    @Override
    public ApplicationActivity verifyApplicationActivityOwnership(UUID activityId, UUID userId) {
        return applicationActivityRepository.findByIdAndApplicationUserId(activityId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application activity not found with id: " + activityId));
    }

    @Override
    public void validateResumeVersionForApplication(UUID resumeVersionId, UUID userId) {
        if (resumeVersionId != null && !resumeVersionRepository.existsByIdAndDocumentUserId(resumeVersionId, userId)) {
            throw new ResourceNotFoundException("Resume version not found with id: " + resumeVersionId);
        }
    }
}
