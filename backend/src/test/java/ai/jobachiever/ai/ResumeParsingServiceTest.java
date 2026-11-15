package ai.jobachiever.ai;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.ParsedPersonalInfoDto;
import ai.jobachiever.ai.dto.ParsedResumeDto;
import ai.jobachiever.ai.service.ResumeParsingServiceImpl;
import ai.jobachiever.common.security.ResourceOwnershipService;
import ai.jobachiever.resumes.entity.ProcessingStatus;
import ai.jobachiever.resumes.entity.ResumeDocument;
import ai.jobachiever.resumes.entity.ResumeVersion;
import ai.jobachiever.resumes.repository.ResumeDocumentRepository;
import ai.jobachiever.resumes.repository.ResumeVersionRepository;
import ai.jobachiever.resumes.storage.FileStorageService;
import ai.jobachiever.users.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ResumeParsingService Unit Tests")
class ResumeParsingServiceTest {

    @Mock
    private ResourceOwnershipService ownershipService;

    @Mock
    private ResumeDocumentRepository documentRepository;

    @Mock
    private ResumeVersionRepository versionRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private AIServiceClient aiServiceClient;

    private ResumeParsingServiceImpl parsingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private User testUser;
    private ResumeDocument testDocument;
    private ResumeVersion testVersion;

    @BeforeEach
    void setUp() {
        parsingService = new ResumeParsingServiceImpl(
                ownershipService,
                documentRepository,
                versionRepository,
                fileStorageService,
                aiServiceClient,
                objectMapper
        );

        testUser = new User("Jane", "Doe", "jane@example.com", "HashedPassword123!");
        testDocument = new ResumeDocument(testUser, "Software Resume", ai.jobachiever.resumes.entity.DocumentType.UPLOADED);
        testVersion = new ResumeVersion();
        testVersion.setDocument(testDocument);
        testVersion.setVersionNumber(1);
        testVersion.setStoragePath("/path/to/resume.pdf");
        testVersion.setStorageKey("user/doc/1_resume.pdf");
        testVersion.setFileName("resume.pdf");
        testVersion.setMimeType("application/pdf");
        testVersion.setFileSizeBytes(1024L);
        testVersion.setSha256Checksum("dummyhash");
        testDocument.setCurrentVersion(testVersion);
    }

    @Test
    @DisplayName("parseResumeDocument verifies ownership, fetches storage, dispatches to client, and updates version status")
    void parseResumeDocumentSuccess() {
        UUID docId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(ownershipService.verifyResumeDocumentOwnership(docId, userId)).thenReturn(testDocument);
        when(fileStorageService.retrieve("user/doc/1_resume.pdf")).thenReturn(new ByteArrayResource("%PDF-1.4 Data".getBytes()));

        ParsedResumeDto mockDto = new ParsedResumeDto();
        ParsedPersonalInfoDto personalInfo = new ParsedPersonalInfoDto();
        personalInfo.setName("Jane Doe");
        personalInfo.setEmail("jane@example.com");
        mockDto.setPersonalInformation(personalInfo);

        when(aiServiceClient.parseResume(any(byte[].class), eq("resume.pdf"), eq("application/pdf"))).thenReturn(mockDto);

        ParsedResumeDto result = parsingService.parseResumeDocument(docId, userId);

        assertThat(result).isNotNull();
        assertThat(result.getPersonalInformation().getName()).isEqualTo("Jane Doe");

        verify(ownershipService).verifyResumeDocumentOwnership(docId, userId);
        verify(fileStorageService).retrieve("user/doc/1_resume.pdf");
        verify(aiServiceClient).parseResume(any(byte[].class), eq("resume.pdf"), eq("application/pdf"));
        verify(versionRepository).save(testVersion);

        assertThat(testVersion.getProcessingStatus()).isEqualTo(ProcessingStatus.PARSED);
        assertThat(testVersion.getParsedContent()).contains("Jane Doe");
    }
}
