package ai.jobachiever.resumes.storage;

import org.springframework.core.io.Resource;
import java.io.InputStream;

/**
 * Storage abstraction for persisting, retrieving, and removing resume document binaries.
 * Designed to cleanly decouple business logic from underlying storage mechanism (Local filesystem or S3).
 */
public interface FileStorageService {

    /**
     * Stores a file input stream under the specified internal storage key.
     *
     * @param inputStream the stream to read and persist
     * @param storageKey   the sanitized internal storage identifier (e.g., "userId/uuid.pdf")
     * @return the storage key confirming successful persistence
     */
    String store(InputStream inputStream, String storageKey);

    /**
     * Retrieves a stored file as a Spring Resource.
     *
     * @param storageKey the internal storage identifier
     * @return the resource for reading/streaming the file
     */
    Resource retrieve(String storageKey);

    /**
     * Deletes a stored file.
     *
     * @param storageKey the internal storage identifier
     * @return true if deleted, false if file did not exist
     */
    boolean delete(String storageKey);

    /**
     * Checks if a file exists under the specified storage key.
     *
     * @param storageKey the internal storage identifier
     * @return true if the file exists and is accessible
     */
    boolean exists(String storageKey);
}
