package ai.jobachiever.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for the internal Python FastAPI AI microservice.
 */
@Component
@ConfigurationProperties(prefix = "app.ai-service")
public class AIServiceProperties {

    private String url = "http://localhost:8000";
    private String internalKey = "dev-internal-service-secret-key-change-in-prod";
    private int timeoutSeconds = 30;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getInternalKey() {
        return internalKey;
    }

    public void setInternalKey(String internalKey) {
        this.internalKey = internalKey;
    }

    public int getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(int timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }
}
