package ai.jobachiever.users.entity;

/**
 * Platform user authorization roles.
 * Supports minimal two-tier authority model: standard job seeker (USER)
 * and platform administration (ADMIN).
 */
public enum Role {
    USER,
    ADMIN
}
