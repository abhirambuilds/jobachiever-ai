package ai.jobachiever.health;

import ai.jobachiever.common.response.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health check REST controller providing operational status verification.
 * Does not require database or external service availability.
 */
@RestController
@RequestMapping("/api/v1")
public class HealthController {

    private final String applicationName;
    private final String version;

    public HealthController(
            @Value("${spring.application.name:jobachiever-backend}") String applicationName,
            @Value("${app.version:1.0.0}") String version) {
        this.applicationName = applicationName;
        this.version = version;
    }

    /**
     * Public health status endpoint.
     *
     * @return 200 OK with HealthResponse JSON payload
     */
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> getHealth() {
        return ResponseEntity.ok(new HealthResponse("UP", applicationName, version));
    }
}
