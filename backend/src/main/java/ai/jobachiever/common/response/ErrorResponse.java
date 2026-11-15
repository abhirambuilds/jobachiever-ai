package ai.jobachiever.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

/**
 * Standard centralized error response structure.
 *
 * @param timestamp        instant of error occurrence in UTC
 * @param status           HTTP numeric status code
 * @param error            HTTP reason phrase
 * @param message          human-readable error message
 * @param path             requested endpoint URI path
 * @param validationErrors field-level validation constraint violations (when applicable)
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path,
    List<ValidationError> validationErrors
) {
    public ErrorResponse(int status, String error, String message, String path) {
        this(Instant.now(), status, error, message, path, null);
    }

    public ErrorResponse(int status, String error, String message, String path, List<ValidationError> validationErrors) {
        this(Instant.now(), status, error, message, path, validationErrors);
    }

    /**
     * Field-level constraint violation detail.
     *
     * @param field          name of the validated field
     * @param message        validation failure message
     * @param rejectedValue  the rejected value (if safe to include)
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ValidationError(
        String field,
        String message,
        Object rejectedValue
    ) {
        public ValidationError(String field, String message) {
            this(field, message, null);
        }
    }
}
