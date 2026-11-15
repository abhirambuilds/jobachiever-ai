package ai.jobachiever.resumes.service;

import ai.jobachiever.resumes.dto.ResumeResponse;
import ai.jobachiever.resumes.dto.ResumeVersionResponse;
import ai.jobachiever.resumes.dto.UpdateResumeRequest;
import ai.jobachiever.resumes.entity.ProcessingStatus;
import ai.jobachiever.resumes.entity.ResumeVersion;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ResumeService {

    ResumeResponse uploadResume(UUID userId, MultipartFile file, String title, String description, UUID careerTrackId, String templateIdentifier);

    Page<ResumeResponse> listResumes(UUID userId, int page, int size, String search, String fileType, UUID careerTrackId, ProcessingStatus status, String sort);

    ResumeResponse getResume(UUID userId, UUID resumeId);

    Resource downloadResume(UUID userId, UUID resumeId, Integer versionNumber);

    Resource previewResume(UUID userId, UUID resumeId, Integer versionNumber);

    ResumeVersion getVersionForDocument(UUID userId, UUID resumeId, Integer versionNumber);

    ResumeResponse updateResume(UUID userId, UUID resumeId, UpdateResumeRequest request);

    void deleteResume(UUID userId, UUID resumeId);

    ResumeVersionResponse uploadNewVersion(UUID userId, UUID resumeId, MultipartFile file, String description, String templateIdentifier);

    List<ResumeVersionResponse> getVersionHistory(UUID userId, UUID resumeId);

    ResumeResponse setPrimaryResume(UUID userId, UUID resumeId);
}
