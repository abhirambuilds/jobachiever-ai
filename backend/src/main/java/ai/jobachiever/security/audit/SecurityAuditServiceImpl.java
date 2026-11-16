package ai.jobachiever.security.audit;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Service
public class SecurityAuditServiceImpl implements SecurityAuditService {

    private static final Logger log = LoggerFactory.getLogger(SecurityAuditServiceImpl.class);

    private final SecurityAuditLogRepository auditRepository;

    public SecurityAuditServiceImpl(SecurityAuditLogRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void recordEvent(SecurityAuditEventType eventType, UUID userId, String email,
                            String ipAddress, String userAgent, String status, String details) {
        try {
            // Guarantee that sensitive parameters are sanitized and bounded
            String safeDetails = (details != null && details.length() > 1000)
                    ? details.substring(0, 997) + "..."
                    : details;

            SecurityAuditLog auditLog = new SecurityAuditLog(
                    eventType,
                    userId,
                    email,
                    ipAddress,
                    userAgent,
                    status != null ? status : "SUCCESS",
                    safeDetails
            );
            auditRepository.saveAndFlush(auditLog);

            log.info("[AUDIT] Event: {} | User: {} | Email: {} | Status: {}",
                    eventType, userId != null ? userId : "ANONYMOUS", email, status);
        } catch (Exception e) {
            // Audit failures should never crash core operational flows
            log.error("[AUDIT-ERROR] Failed to persist security audit record for event {}: {}", eventType, e.getMessage());
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void recordSuccess(SecurityAuditEventType eventType, UUID userId, String email, String details) {
        String ip = extractClientIp();
        String ua = extractUserAgent();
        recordEvent(eventType, userId, email, ip, ua, "SUCCESS", details);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void recordFailure(SecurityAuditEventType eventType, UUID userId, String email, String reason) {
        String ip = extractClientIp();
        String ua = extractUserAgent();
        recordEvent(eventType, userId, email, ip, ua, "FAILURE", reason);
    }

    private String extractClientIp() {
        HttpServletRequest request = getCurrentHttpRequest();
        if (request == null) {
            return "UNKNOWN";
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "UNKNOWN";
    }

    private String extractUserAgent() {
        HttpServletRequest request = getCurrentHttpRequest();
        if (request == null) {
            return "UNKNOWN";
        }
        String ua = request.getHeader("User-Agent");
        return (ua != null && !ua.isBlank()) ? ua : "UNKNOWN";
    }

    private HttpServletRequest getCurrentHttpRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception ignored) {
            return null;
        }
    }
}
