package ai.jobachiever.security.audit;

/**
 * Enumeration of security-critical audit event types tracked by the platform.
 */
public enum SecurityAuditEventType {
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    PASSWORD_RESET_REQUESTED,
    PASSWORD_RESET_COMPLETED,
    EMAIL_VERIFIED,
    ACCOUNT_REGISTERED,
    ACCOUNT_SUSPENDED,
    ACCOUNT_DEACTIVATED,
    ROLE_CHANGED,
    TOKEN_REVOKED,
    ACCESS_DENIED
}
