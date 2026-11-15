package ai.jobachiever.resumes.service;

import ai.jobachiever.careertracks.entity.CareerTrack;
import ai.jobachiever.careertracks.repository.CareerTrackRepository;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.resumes.dto.ResumeResponse;
import ai.jobachiever.resumes.dto.ResumeVersionResponse;
import ai.jobachiever.resumes.dto.UpdateResumeRequest;
import ai.jobachiever.resumes.entity.ProcessingStatus;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;
import ai.jobachiever.resumes.exception.FileStorageException;
import ai.jobachiever.resumes.repository.ResumeDocumentRepository;
import ai.jobachiever.resumes.repository.ResumeVersionRepository;
import ai.jobachiever.resumes.storage.FileStorageService;
import ai.jobachiever.resumes.validation.FileValidationResult;
import ai.jobachiever.resumes.validation.ResumeFileValidator;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mock.web.MockMultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Resume Service Business Logic Unit Tests")
class ResumeServiceUnitTest {

    @Mock
    private ResumeDocumentRepository resumeDocumentRepository;

    @Mock
    private ResumeVersionRepository resumeVersionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CareerTrackRepository careerTrackRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private ResumeFileValidator resumeFileValidator;

    private ResumeServiceImpl resumeService;

    private UUID userIdA;
    private UUID userIdB;
    private User userA;
    private User userB;

    @BeforeEach
    void setUp() {
        resumeService = new ResumeServiceImpl(
                resumeDocumentRepository,
                resumeVersionRepository,
                userRepository,
                careerTrackRepository,
                fileStorageService,
                resumeFileValidator
        );

        userIdA = UUID.randomUUID();
        userIdB = UUID.randomUUID();

        userA = new User();
        userA.setId(userIdA);
        userA.setEmail("userA@jobachiever.ai");

        userB = new User();
        userB.setId(userIdB);
        userB.setEmail("userB@jobachiever.ai");
    }

    private ResumeDocument createTestDoc(UUID id, User user, String title, boolean isPrimary) {
        ResumeDocument doc = new ResumeDocument();
        doc.setId(id);
        doc.setUser(user);
        doc.setTitle(title);
        doc.setPrimary(isPrimary);

        ResumeVersion ver = new ResumeVersion();
        ver.setId(UUID.randomUUID());
        ver.setDocument(doc);
        ver.setVersionNumber(1);
        ver.setFileName(title + ".pdf");
        ver.setMimeType("application/pdf");
        ver.setFileSizeBytes(1024L);
        ver.setSha256Checksum("abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890");
        ver.setStorageKey(user.getId() + "/" + doc.getId() + ".pdf");
        ver.setProcessingStatus(ProcessingStatus.READY);

        doc.setCurrentVersion(ver);
        return doc;
    }

    @Test
    @DisplayName("9. List current user's resumes with pagination and filtering")
    void listResumesForCurrentUser() {
        ResumeDocument doc1 = createTestDoc(UUID.randomUUID(), userA, "Resume 1", true);
        ResumeDocument doc2 = createTestDoc(UUID.randomUUID(), userA, "Resume 2", false);

        Page<ResumeDocument> pageResult = new PageImpl<>(List.of(doc1, doc2));
        when(resumeDocumentRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(pageResult);

        Page<ResumeResponse> result = resumeService.listResumes(userIdA, 0, 10, null, null, null, null, "createdAt,desc");

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).title()).isEqualTo("Resume 1");
        assertThat(result.getContent().get(1).title()).isEqualTo("Resume 2");
    }

    @Test
    @DisplayName("10. Retrieve document metadata for authorized user")
    void retrieveDocumentMetadata() {
        UUID docId = UUID.randomUUID();
        ResumeDocument doc = createTestDoc(docId, userA, "Full-Stack Resume", true);
        when(resumeDocumentRepository.findByIdAndUserId(docId, userIdA)).thenReturn(Optional.of(doc));

        ResumeResponse response = resumeService.getResume(userIdA, docId);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(docId);
        assertThat(response.title()).isEqualTo("Full-Stack Resume");
        assertThat(response.isPrimary()).isTrue();
    }

    @Test
    @DisplayName("11. Download authorized document returns readable file resource")
    void downloadAuthorizedDocument() {
        UUID docId = UUID.randomUUID();
        ResumeDocument doc = createTestDoc(docId, userA, "Resume to Download", true);
        when(resumeDocumentRepository.findByIdAndUserId(docId, userIdA)).thenReturn(Optional.of(doc));

        Resource mockResource = new ByteArrayResource("%PDF-1.4 sample content".getBytes(StandardCharsets.UTF_8));
        when(fileStorageService.retrieve(doc.getCurrentVersion().getStorageKey())).thenReturn(mockResource);

        Resource downloaded = resumeService.downloadResume(userIdA, docId, null);

        assertThat(downloaded).isNotNull();
        assertThat(downloaded.exists()).isTrue();
    }

    @Test
    @DisplayName("12. Preview authorized PDF document")
    void previewAuthorizedPdf() {
        UUID docId = UUID.randomUUID();
        ResumeDocument doc = createTestDoc(docId, userA, "Preview Resume", false);
        when(resumeDocumentRepository.findByIdAndUserId(docId, userIdA)).thenReturn(Optional.of(doc));

        Resource mockResource = new ByteArrayResource("%PDF-1.4 preview data".getBytes(StandardCharsets.UTF_8));
        when(fileStorageService.retrieve(doc.getCurrentVersion().getStorageKey())).thenReturn(mockResource);

        Resource preview = resumeService.previewResume(userIdA, docId, null);

        assertThat(preview).isNotNull();
        assertThat(preview.exists()).isTrue();
    }

    @Test
    @DisplayName("13. Rename document updates title safely without altering file paths")
    void renameDocument() {
        UUID docId = UUID.randomUUID();
        ResumeDocument doc = createTestDoc(docId, userA, "Old Title", false);
        when(resumeDocumentRepository.findByIdAndUserId(docId, userIdA)).thenReturn(Optional.of(doc));
        when(resumeDocumentRepository.save(any(ResumeDocument.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateResumeRequest request = new UpdateResumeRequest("Updated Tech Lead CV", "New description", null);
        ResumeResponse updated = resumeService.updateResume(userIdA, docId, request);

        assertThat(updated.title()).isEqualTo("Updated Tech Lead CV");
        assertThat(updated.description()).isEqualTo("New description");
    }

    @Test
    @DisplayName("14. Delete document safely removes DB record, versions, and storage files with primary promotion")
    void deleteDocumentWithFileCleanupAndPrimaryPromotion() {
        UUID docId1 = UUID.randomUUID();
        UUID docId2 = UUID.randomUUID();

        ResumeDocument primaryDoc = createTestDoc(docId1, userA, "Primary to Delete", true);
        ResumeDocument secondaryDoc = createTestDoc(docId2, userA, "Remaining Secondary", false);

        when(resumeDocumentRepository.findByIdAndUserId(docId1, userIdA)).thenReturn(Optional.of(primaryDoc));
        when(resumeVersionRepository.findAllByDocumentIdOrderByVersionNumberDesc(docId1))
                .thenReturn(List.of(primaryDoc.getCurrentVersion()));
        when(resumeDocumentRepository.findFirstByUserIdOrderByUpdatedAtDesc(userIdA))
                .thenReturn(Optional.of(secondaryDoc));

        resumeService.deleteResume(userIdA, docId1);

        verify(resumeDocumentRepository).delete(primaryDoc);
        verify(fileStorageService).delete(primaryDoc.getCurrentVersion().getStorageKey());
        verify(resumeDocumentRepository).save(secondaryDoc);
        assertThat(secondaryDoc.isPrimary()).isTrue();
    }

    @Test
    @DisplayName("15. Upload a new version increments version number and updates current version")
    void uploadNewVersion() {
        UUID docId = UUID.randomUUID();
        ResumeDocument doc = createTestDoc(docId, userA, "Multi-version Doc", false);
        when(resumeDocumentRepository.findByIdAndUserId(docId, userIdA)).thenReturn(Optional.of(doc));

        MockMultipartFile file = new MockMultipartFile("file", "v2.pdf", "application/pdf", "%PDF-1.4".getBytes());
        FileValidationResult validation = new FileValidationResult(
                "v2.pdf", "v2.pdf", "pdf", "application/pdf", 1024L, "checksumV2", "%PDF-1.4".getBytes()
        );
        when(resumeFileValidator.validate(file)).thenReturn(validation);
        when(resumeVersionRepository.findMaxVersionNumber(docId)).thenReturn(1);
        when(resumeVersionRepository.save(any(ResumeVersion.class))).thenAnswer(i -> {
            ResumeVersion v = i.getArgument(0);
            v.setId(UUID.randomUUID());
            return v;
        });

        ResumeVersionResponse response = resumeService.uploadNewVersion(userIdA, docId, file, "Version 2 release", null);

        assertThat(response.versionNumber()).isEqualTo(2);
        assertThat(response.fileName()).isEqualTo("v2.pdf");
        verify(fileStorageService).store(any(InputStream.class), anyString());
    }

    @Test
    @DisplayName("16. Retrieve version history ordered descending by version number")
    void getVersionHistory() {
        UUID docId = UUID.randomUUID();
        when(resumeDocumentRepository.existsByIdAndUserId(docId, userIdA)).thenReturn(true);

        ResumeDocument doc = createTestDoc(docId, userA, "Versioned Resume", false);
        ResumeVersion v1 = new ResumeVersion();
        v1.setId(UUID.randomUUID());
        v1.setDocument(doc);
        v1.setVersionNumber(1);
        v1.setFileName("v1.pdf");
        v1.setMimeType("application/pdf");
        v1.setSha256Checksum("hash1");

        ResumeVersion v2 = new ResumeVersion();
        v2.setId(UUID.randomUUID());
        v2.setDocument(doc);
        v2.setVersionNumber(2);
        v2.setFileName("v2.pdf");
        v2.setMimeType("application/pdf");
        v2.setSha256Checksum("hash2");

        when(resumeVersionRepository.findAllByDocumentIdOrderByVersionNumberDesc(docId))
                .thenReturn(List.of(v2, v1));

        List<ResumeVersionResponse> history = resumeService.getVersionHistory(userIdA, docId);

        assertThat(history).hasSize(2);
        assertThat(history.get(0).versionNumber()).isEqualTo(2);
        assertThat(history.get(1).versionNumber()).isEqualTo(1);
    }

    @Test
    @DisplayName("17. Set primary resume un-marks other primaries and sets target as primary")
    void setPrimaryResume() {
        UUID docId1 = UUID.randomUUID();
        UUID docId2 = UUID.randomUUID();

        ResumeDocument oldPrimary = createTestDoc(docId1, userA, "Old Primary", true);
        ResumeDocument newPrimary = createTestDoc(docId2, userA, "New Primary", false);

        when(resumeDocumentRepository.findByIdAndUserId(docId2, userIdA)).thenReturn(Optional.of(newPrimary));
        when(resumeDocumentRepository.findAllByUserIdAndPrimaryTrue(userIdA)).thenReturn(List.of(oldPrimary));
        when(resumeDocumentRepository.save(any(ResumeDocument.class))).thenAnswer(i -> i.getArgument(0));

        ResumeResponse result = resumeService.setPrimaryResume(userIdA, docId2);

        assertThat(result.isPrimary()).isTrue();
        assertThat(oldPrimary.isPrimary()).isFalse();
    }

    @Test
    @DisplayName("18. Reject foreign career track association")
    void rejectForeignCareerTrackAssociation() {
        UUID foreignTrackId = UUID.randomUUID();
        when(resumeFileValidator.validate(any())).thenReturn(
                new FileValidationResult("test.pdf", "test.pdf", "pdf", "application/pdf", 100L, "hash", new byte[100])
        );
        when(userRepository.findById(userIdA)).thenReturn(Optional.of(userA));
        when(careerTrackRepository.findByIdAndUserId(foreignTrackId, userIdA)).thenReturn(Optional.empty());

        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", new byte[100]);

        assertThatThrownBy(() -> resumeService.uploadResume(userIdA, file, "Title", null, foreignTrackId, null))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Career track not found or does not belong to user");
    }

    @Test
    @DisplayName("19. User A cannot download User B's resume (Tenant Isolation)")
    void userACannotDownloadUserBResume() {
        UUID docId = UUID.randomUUID();
        when(resumeDocumentRepository.findByIdAndUserId(docId, userIdA)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resumeService.downloadResume(userIdA, docId, null))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Resume not found with id: " + docId);
    }

    @Test
    @DisplayName("20. User A cannot delete User B's resume (Tenant Isolation)")
    void userACannotDeleteUserBResume() {
        UUID docId = UUID.randomUUID();
        when(resumeDocumentRepository.findByIdAndUserId(docId, userIdA)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resumeService.deleteResume(userIdA, docId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Resume not found with id: " + docId);
    }

    @Test
    @DisplayName("21. User A cannot access User B's version history (Tenant Isolation)")
    void userACannotAccessUserBVersion() {
        UUID docId = UUID.randomUUID();
        when(resumeDocumentRepository.existsByIdAndUserId(docId, userIdA)).thenReturn(false);

        assertThatThrownBy(() -> resumeService.getVersionHistory(userIdA, docId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Resume not found with id: " + docId);
    }

    @Test
    @DisplayName("22. Database failure triggers appropriate file cleanup (Compensating storage rollback)")
    void databaseFailureTriggersCompensatingFileCleanup() {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", new byte[100]);
        FileValidationResult validation = new FileValidationResult("test.pdf", "test.pdf", "pdf", "application/pdf", 100L, "hash", new byte[100]);
        when(resumeFileValidator.validate(file)).thenReturn(validation);
        when(userRepository.findById(userIdA)).thenReturn(Optional.of(userA));
        when(resumeDocumentRepository.save(any(ResumeDocument.class)))
                .thenThrow(new RuntimeException("Simulated Database Outage"));

        assertThatThrownBy(() -> resumeService.uploadResume(userIdA, file, "Title", null, null, null))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Simulated Database Outage");

        // Verify compensating cleanup deleted the orphaned file from storage
        verify(fileStorageService).delete(anyString());
    }

    @Test
    @DisplayName("23. Storage failure does not create inconsistent metadata (No partial DB record)")
    void storageFailureDoesNotCreateInconsistentMetadata() {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", new byte[100]);
        FileValidationResult validation = new FileValidationResult("test.pdf", "test.pdf", "pdf", "application/pdf", 100L, "hash", new byte[100]);
        when(resumeFileValidator.validate(file)).thenReturn(validation);
        when(userRepository.findById(userIdA)).thenReturn(Optional.of(userA));
        when(fileStorageService.store(any(InputStream.class), anyString()))
                .thenThrow(new FileStorageException("Disk full / I/O error"));

        assertThatThrownBy(() -> resumeService.uploadResume(userIdA, file, "Title", null, null, null))
                .isInstanceOf(FileStorageException.class)
                .hasMessageContaining("Disk full");

        // Verify database was never touched
        verify(resumeDocumentRepository, never()).save(any());
        verify(resumeVersionRepository, never()).save(any());
    }
}
