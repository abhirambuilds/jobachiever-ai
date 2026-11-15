package ai.jobachiever.ai.exception;

/**
 * Thrown when communication with or processing within the internal AI microservice fails.
 */
public class AIServiceException extends RuntimeException {

    public AIServiceException(String message) {
        super(message);
    }

    public AIServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
