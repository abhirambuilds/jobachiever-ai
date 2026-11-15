package ai.jobachiever.resumes;

import ai.jobachiever.auth.service.JwtService;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.resumes.dto.ResumeResponse;
import ai.jobachiever.resumes.dto.ResumeVersionResponse;
import ai.jobachiever.resumes.dto.UpdateResumeRequest;
import ai.jobachiever.resumes.entity.DocumentType;
import ai.jobachiever.resumes.entity.ProcessingStatus;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;
import ai.jobachiever.resumes.exception.FileValidationException;
import ai.jobachiever.resumes.service.ResumeService;
import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.Role;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Resume Controller Integration Tests")
class ResumeControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private ResumeService resumeService;

    @MockBean
    private UserRepository userRepository;

    private UUID userId;
    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("developer@jobachiever.ai");
        testUser.setFirstName("Alex");
        testUser.setLastName("Mercer");
        testUser.setRole(Role.USER);
        testUser.setAccountStatus(AccountStatus.ACTIVE);
        testUser.setEmailVerified(true);

        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(userRepository.findByEmailIgnoreCase(testUser.getEmail())).willReturn(Optional.of(testUser));

        jwtToken = "Bearer " + jwtService.generateToken(testUser.getId(), testUser.getEmail());
    }

    private ResumeResponse createMockResumeResponse(UUID id, String title, boolean isPrimary) {
        return new ResumeResponse(
                id,
                userId,
                null,
                null,
                title,
                "Test resume description",
                DocumentType.UPLOADED,
                isPrimary,
                1,
                UUID.randomUUID(),
                title + ".pdf",
                "application/pdf",
                "pdf",
                2048L,
                "a1b2c3d4e5f60123456789abcdef0123456789abcdef0123456789abcdef0123",
                ProcessingStatus.READY,
                Instant.now(),
                Instant.now()
        );
    }

    @Test
    @DisplayName("POST /api/v1/resumes - Upload valid resume successfully (201 Created)")
    void uploadResumeSuccess() throws Exception {
        UUID docId = UUID.randomUUID();
        ResumeResponse mockResponse = createMockResumeResponse(docId, "Senior Full-Stack Resume", true);

        given(resumeService.uploadResume(eq(userId), any(), eq("Senior Full-Stack Resume"), any(), any(), any()))
                .willReturn(mockResponse);

        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf", "%PDF-1.4 sample content".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/v1/resumes")
                        .file(file)
                        .param("title", "Senior Full-Stack Resume")
                        .param("description", "Master tailored resume")
                        .header("Authorization", jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id", is(docId.toString())))
                .andExpect(jsonPath("$.data.title", is("Senior Full-Stack Resume")))
                .andExpect(jsonPath("$.data.isPrimary", is(true)))
                .andExpect(jsonPath("$.data.processingStatus", is("READY")))
                .andExpect(jsonPath("$.message", containsString("uploaded successfully")));
    }

    @Test
    @DisplayName("POST /api/v1/resumes - Unauthenticated request rejected (401 Unauthorized)")
    void uploadResumeUnauthenticated() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf", "%PDF-1.4 sample content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/resumes").file(file))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/resumes - Reject unsupported file format (400 Bad Request)")
    void uploadResumeUnsupportedFormat() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "script.sh", "text/plain", "#!/bin/bash".getBytes()
        );

        given(resumeService.uploadResume(eq(userId), any(), any(), any(), any(), any()))
                .willThrow(new FileValidationException("Unsupported file extension '.sh'"));

        mockMvc.perform(multipart("/api/v1/resumes")
                        .file(file)
                        .header("Authorization", jwtToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Unsupported file extension")));
    }

    @Test
    @DisplayName("GET /api/v1/resumes - List authenticated user's resumes (200 OK)")
    void listResumesSuccess() throws Exception {
        ResumeResponse r1 = createMockResumeResponse(UUID.randomUUID(), "Resume 1", true);
        ResumeResponse r2 = createMockResumeResponse(UUID.randomUUID(), "Resume 2", false);

        given(resumeService.listResumes(eq(userId), eq(0), eq(20), any(), any(), any(), any(), any()))
                .willReturn(new PageImpl<>(List.of(r1, r2)));

        mockMvc.perform(get("/api/v1/resumes")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.content[0].title", is("Resume 1")))
                .andExpect(jsonPath("$.data.content[1].title", is("Resume 2")));
    }

    @Test
    @DisplayName("GET /api/v1/resumes/{resumeId} - Retrieve document metadata (200 OK)")
    void getResumeSuccess() throws Exception {
        UUID docId = UUID.randomUUID();
        ResumeResponse mockResponse = createMockResumeResponse(docId, "Master Resume", true);

        given(resumeService.getResume(userId, docId)).willReturn(mockResponse);

        mockMvc.perform(get("/api/v1/resumes/{resumeId}", docId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id", is(docId.toString())))
                .andExpect(jsonPath("$.data.title", is("Master Resume")));
    }

    @Test
    @DisplayName("GET /api/v1/resumes/{resumeId} - Inaccessible or non-existent document (404 Not Found)")
    void getResumeNotFound() throws Exception {
        UUID foreignId = UUID.randomUUID();
        given(resumeService.getResume(userId, foreignId))
                .willThrow(new ResourceNotFoundException("Resume not found with id: " + foreignId));

        mockMvc.perform(get("/api/v1/resumes/{resumeId}", foreignId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Resume not found")));
    }

    @Test
    @DisplayName("GET /api/v1/resumes/{resumeId}/download - Download document with safe headers (200 OK)")
    void downloadResumeSuccess() throws Exception {
        UUID docId = UUID.randomUUID();
        ResumeDocument doc = new ResumeDocument();
        doc.setId(docId);

        ResumeVersion ver = new ResumeVersion();
        ver.setDocument(doc);
        ver.setFileName("Clean_Resume.pdf");
        ver.setMimeType("application/pdf");
        ver.setFileSizeBytes(100L);
        ver.setStorageKey("user/clean.pdf");

        Resource mockFileResource = new ByteArrayResource("%PDF-1.4 file data".getBytes(StandardCharsets.UTF_8));

        given(resumeService.getVersionForDocument(userId, docId, null)).willReturn(ver);
        given(resumeService.downloadResume(userId, docId, null)).willReturn(mockFileResource);

        mockMvc.perform(get("/api/v1/resumes/{resumeId}/download", docId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", allOf(containsString("attachment"), containsString("Clean_Resume.pdf"))))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Content-Type", "application/pdf"));
    }

    @Test
    @DisplayName("GET /api/v1/resumes/{resumeId}/preview - In-browser preview with security headers (200 OK)")
    void previewResumeSuccess() throws Exception {
        UUID docId = UUID.randomUUID();
        ResumeDocument doc = new ResumeDocument();
        doc.setId(docId);

        ResumeVersion ver = new ResumeVersion();
        ver.setDocument(doc);
        ver.setFileName("Preview_Resume.pdf");
        ver.setMimeType("application/pdf");
        ver.setFileSizeBytes(100L);
        ver.setStorageKey("user/preview.pdf");

        Resource mockFileResource = new ByteArrayResource("%PDF-1.4 preview data".getBytes(StandardCharsets.UTF_8));

        given(resumeService.getVersionForDocument(userId, docId, null)).willReturn(ver);
        given(resumeService.previewResume(userId, docId, null)).willReturn(mockFileResource);

        mockMvc.perform(get("/api/v1/resumes/{resumeId}/preview", docId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", allOf(containsString("inline"), containsString("Preview_Resume.pdf"))))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Content-Security-Policy", "default-src 'none'"));
    }

    @Test
    @DisplayName("PATCH /api/v1/resumes/{resumeId} - Update metadata (200 OK)")
    void updateResumeSuccess() throws Exception {
        UUID docId = UUID.randomUUID();
        UpdateResumeRequest request = new UpdateResumeRequest("New Title", "Updated Description", null);
        ResumeResponse mockResponse = createMockResumeResponse(docId, "New Title", true);

        given(resumeService.updateResume(eq(userId), eq(docId), any(UpdateResumeRequest.class)))
                .willReturn(mockResponse);

        mockMvc.perform(patch("/api/v1/resumes/{resumeId}", docId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title", is("New Title")));
    }

    @Test
    @DisplayName("DELETE /api/v1/resumes/{resumeId} - Safe document deletion (204 No Content)")
    void deleteResumeSuccess() throws Exception {
        UUID docId = UUID.randomUUID();
        doNothing().when(resumeService).deleteResume(userId, docId);

        mockMvc.perform(delete("/api/v1/resumes/{resumeId}", docId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("POST /api/v1/resumes/{resumeId}/versions - Upload new version (201 Created)")
    void uploadNewVersionSuccess() throws Exception {
        UUID docId = UUID.randomUUID();
        ResumeVersionResponse mockVersion = new ResumeVersionResponse(
                UUID.randomUUID(),
                docId,
                2,
                "updated.pdf",
                "application/pdf",
                1024L,
                "checksum2",
                ProcessingStatus.READY,
                null,
                Instant.now()
        );

        given(resumeService.uploadNewVersion(eq(userId), eq(docId), any(), any(), any()))
                .willReturn(mockVersion);

        MockMultipartFile file = new MockMultipartFile(
                "file", "updated.pdf", "application/pdf", "%PDF-1.4 new version content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/resumes/{resumeId}/versions", docId)
                        .file(file)
                        .param("description", "Version 2 release")
                        .header("Authorization", jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.versionNumber", is(2)))
                .andExpect(jsonPath("$.data.fileName", is("updated.pdf")));
    }

    @Test
    @DisplayName("GET /api/v1/resumes/{resumeId}/versions - List version history (200 OK)")
    void getVersionHistorySuccess() throws Exception {
        UUID docId = UUID.randomUUID();
        ResumeVersionResponse v1 = new ResumeVersionResponse(
                UUID.randomUUID(), docId, 1, "v1.pdf", "application/pdf", 100L, "hash1", ProcessingStatus.READY, null, Instant.now()
        );
        ResumeVersionResponse v2 = new ResumeVersionResponse(
                UUID.randomUUID(), docId, 2, "v2.pdf", "application/pdf", 100L, "hash2", ProcessingStatus.READY, null, Instant.now()
        );

        given(resumeService.getVersionHistory(userId, docId)).willReturn(List.of(v2, v1));

        mockMvc.perform(get("/api/v1/resumes/{resumeId}/versions", docId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].versionNumber", is(2)))
                .andExpect(jsonPath("$.data[1].versionNumber", is(1)));
    }

    @Test
    @DisplayName("PATCH /api/v1/resumes/{resumeId}/primary - Set as primary resume (200 OK)")
    void setPrimaryResumeSuccess() throws Exception {
        UUID docId = UUID.randomUUID();
        ResumeResponse mockResponse = createMockResumeResponse(docId, "Primary Resume", true);

        given(resumeService.setPrimaryResume(userId, docId)).willReturn(mockResponse);

        mockMvc.perform(patch("/api/v1/resumes/{resumeId}/primary", docId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isPrimary", is(true)));
    }
}
