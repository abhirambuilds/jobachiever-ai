package ai.jobachiever.security.audit;

import java.util.UUID;

public interface SecurityAuditService {

    void recordEvent(SecurityAuditEventType eventType, UUID userId, String email,
                     String ipAddress, String userAgent, String status, String details);

    void recordSuccess(SecurityAuditEventType eventType, UUID userId, String email, String details);

    void recordFailure(SecurityAuditEventType eventType, UUID userId, String email, String reason);
}
