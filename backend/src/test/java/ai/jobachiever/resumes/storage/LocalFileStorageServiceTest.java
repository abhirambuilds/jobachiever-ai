package ai.jobachiever.resumes.storage;

import ai.jobachiever.resumes.exception.FileStorageException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Local File Storage Service Tests")
class LocalFileStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalFileStorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new LocalFileStorageService(tempDir.toString());
        storageService.init();
    }

    @Test
    @DisplayName("Store and retrieve file successfully from isolated local directory")
    void storeAndRetrieveFile() throws IOException {
        String content = "%PDF-1.4 sample content";
        String storageKey = "user-123/resume-abc.pdf";

        storageService.store(new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8)), storageKey);

        assertThat(storageService.exists(storageKey)).isTrue();

        Resource resource = storageService.retrieve(storageKey);
        assertThat(resource.exists()).isTrue();
        assertThat(resource.isReadable()).isTrue();
        assertThat(new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8))
                .isEqualTo(content);
    }

    @Test
    @DisplayName("Delete file permanently removes it from filesystem")
    void deleteFile() {
        String storageKey = "user-123/to-delete.pdf";
        storageService.store(new ByteArrayInputStream("data".getBytes(StandardCharsets.UTF_8)), storageKey);

        assertThat(storageService.exists(storageKey)).isTrue();
        boolean deleted = storageService.delete(storageKey);
        assertThat(deleted).isTrue();
        assertThat(storageService.exists(storageKey)).isFalse();
    }

    @Test
    @DisplayName("24. File storage paths cannot be manipulated through request input (Path Traversal)")
    void preventPathTraversalAttempts() {
        String maliciousKey1 = "../outside.pdf";
        String maliciousKey2 = "user-123/../../secret.txt";
        String maliciousKey3 = "/root/escaped.pdf";

        ByteArrayInputStream stream = new ByteArrayInputStream("bad".getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> storageService.store(stream, maliciousKey1))
                .isInstanceOf(FileStorageException.class)
                .hasMessageContaining("Path traversal attempt detected");

        assertThatThrownBy(() -> storageService.store(stream, maliciousKey2))
                .isInstanceOf(FileStorageException.class)
                .hasMessageContaining("Path traversal attempt detected");

        assertThatThrownBy(() -> storageService.store(stream, maliciousKey3))
                .isInstanceOf(FileStorageException.class)
                .hasMessageContaining("Path traversal attempt detected");
    }

    @Test
    @DisplayName("Retrieve non-existent file throws FileStorageException")
    void retrieveNonExistentFileThrows() {
        assertThatThrownBy(() -> storageService.retrieve("non-existent-user/missing.pdf"))
                .isInstanceOf(FileStorageException.class)
                .hasMessageContaining("File not found or unreadable");
    }

    @Test
    @DisplayName("Creates parent subdirectories automatically during store")
    void createsParentDirectoriesSafely() {
        String nestedKey = "tenant-a/deeply/nested/folder/resume.pdf";
        storageService.store(new ByteArrayInputStream("nested".getBytes(StandardCharsets.UTF_8)), nestedKey);

        Path resolved = storageService.resolveAndValidatePath(nestedKey);
        assertThat(Files.exists(resolved)).isTrue();
        assertThat(Files.isDirectory(resolved.getParent())).isTrue();
    }
}
