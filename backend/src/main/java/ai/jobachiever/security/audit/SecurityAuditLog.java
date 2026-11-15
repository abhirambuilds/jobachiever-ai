package ai.jobachiever.security.audit;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "security_audit_logs")
public class SecurityAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 64)
    private SecurityAuditEventType eventType;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "SUCCESS";

    @Column(name = "details", length = 1000)
    private String details;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public SecurityAuditLog() {
    }

    public SecurityAuditLog(SecurityAuditEventType eventType, UUID userId, String email,
                            String ipAddress, String userAgent, String status, String details) {
        this.eventType = eventType;
        this.userId = userId;
        this.email = email;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.status = status != null ? status : "SUCCESS";
        this.details = details;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public SecurityAuditEventType getEventType() {
        return eventType;
    }

    public void setEventType(SecurityAuditEventType eventType) {
        this.eventType = eventType;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
