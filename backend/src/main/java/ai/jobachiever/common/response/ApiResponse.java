package ai.jobachiever.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

/**
 * Reusable generic API response wrapper for successful service responses.
 *
 * @param success   boolean indicator of request success
 * @param data      payload object
 * @param message   human-readable summary message
 * @param timestamp ISO-8601 UTC timestamp of response generation
 * @param <T>       payload type
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
    boolean success,
    T data,
    String message,
    Instant timestamp
) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, "Operation completed successfully", Instant.now());
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(true, data, message, Instant.now());
    }
}
