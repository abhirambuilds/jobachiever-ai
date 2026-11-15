package ai.jobachiever.resumes.dto;

import jakarta.validation.constraints.Size;
import java.util.UUID;

/**
 * Request payload for editing resume metadata.
 * Modifies only editable informational fields without altering ownership or storage keys.
 */
public record UpdateResumeRequest(
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        UUID careerTrackId
) {
}
