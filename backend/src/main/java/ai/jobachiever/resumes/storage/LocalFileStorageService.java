package ai.jobachiever.resumes.storage;

import ai.jobachiever.resumes.exception.FileStorageException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;

/**
 * Local filesystem implementation of {@link FileStorageService}.
 * Persists resume files into an isolated directory outside the public web server root.
 * Strictly defends against path traversal and unauthorized directory escapes.
 */
@Service
public class LocalFileStorageService implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalFileStorageService.class);

    private final Path rootStorageLocation;

    public LocalFileStorageService(@Value("${app.storage.resumes-dir:./data/resumes}") String storageDir) {
        this.rootStorageLocation = Paths.get(storageDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootStorageLocation);
            log.info("Initialized local resume storage directory at: {}", rootStorageLocation);
        } catch (IOException e) {
            throw new FileStorageException("Could not initialize local resume storage directory: " + rootStorageLocation, e);
        }
    }

    @Override
    public String store(InputStream inputStream, String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            throw new FileStorageException("Storage key cannot be null or empty");
        }

        Path targetPath = resolveAndValidatePath(storageKey);

        try {
            if (targetPath.getParent() != null) {
                Files.createDirectories(targetPath.getParent());
            }

            long bytesCopied = Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.debug("Successfully stored {} bytes to storage key: {}", bytesCopied, storageKey);
            return storageKey;
        } catch (IOException e) {
            log.error("Failed to store file with storage key: {}", storageKey, e);
            throw new FileStorageException("Failed to store file content: " + e.getMessage(), e);
        }
    }

    @Override
    public Resource retrieve(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            throw new FileStorageException("Storage key cannot be null or empty");
        }

        Path filePath = resolveAndValidatePath(storageKey);

        if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
            log.warn("Requested resume file not found or unreadable: {}", storageKey);
            throw new FileStorageException("File not found or unreadable for storage key: " + storageKey);
        }

        return new FileSystemResource(filePath);
    }

    @Override
    public boolean delete(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return false;
        }

        try {
            Path filePath = resolveAndValidatePath(storageKey);
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.debug("Successfully deleted stored resume file: {}", storageKey);
            }
            return deleted;
        } catch (Exception e) {
            log.warn("Could not delete stored file for key: {}", storageKey, e);
            return false;
        }
    }

    @Override
    public boolean exists(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return false;
        }

        try {
            Path filePath = resolveAndValidatePath(storageKey);
            return Files.exists(filePath);
        } catch (Exception e) {
            return false;
        }
    }

    public Path getRootStorageLocation() {
        return rootStorageLocation;
    }

    /**
     * Resolves and normalizes a storage key against the storage root directory,
     * ensuring no path traversal escapes the root boundary.
     */
    public Path resolveAndValidatePath(String storageKey) {
        if (storageKey.contains("..") || storageKey.startsWith("/") || storageKey.startsWith("\\")) {
            throw new FileStorageException("Path traversal attempt detected in storage key: " + storageKey);
        }

        Path resolved = rootStorageLocation.resolve(storageKey).normalize();

        if (!resolved.startsWith(rootStorageLocation)) {
            throw new FileStorageException("Storage key escapes the root storage directory: " + storageKey);
        }

        return resolved;
    }
}
