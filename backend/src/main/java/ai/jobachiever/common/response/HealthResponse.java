package ai.jobachiever.common.response;

/**
 * Standard health response record.
 *
 * @param status  service health status (e.g. "UP")
 * @param service application identifier name
 * @param version application semantic version
 */
public record HealthResponse(
    String status,
    String service,
    String version
) {}
