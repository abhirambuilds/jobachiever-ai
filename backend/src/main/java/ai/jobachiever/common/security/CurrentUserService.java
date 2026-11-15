package ai.jobachiever.common.security;

import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.Role;
import ai.jobachiever.users.entity.User;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

/**
 * Reusable service providing access to the currently authenticated security context.
 * Resolves user identity exclusively from validated server-side authentication tokens,
 * never trusting caller-provided user IDs.
 */
public interface CurrentUserService {

    /**
     * Retrieves the authenticated user's ID.
     * Throws InvalidTokenException / AccessDeniedException if unauthenticated.
     */
    UUID getAuthenticatedUserId();

    /**
     * Safely checks for an authenticated user ID without throwing an exception.
     */
    Optional<UUID> findAuthenticatedUserId();

    /**
     * Retrieves the live User entity from database, guaranteeing non-stale state.
     */
    User getCurrentUser();

    /**
     * Returns the current account status.
     */
    AccountStatus getAccountStatus();

    /**
     * Checks if the authenticated user has verified their email address.
     */
    boolean isEmailVerified();

    /**
     * Returns the user's assigned platform role (USER, ADMIN).
     */
    Role getRole();

    /**
     * Returns the granted security authorities for the authenticated user.
     */
    Collection<? extends GrantedAuthority> getAuthorities();

    /**
     * Checks if the authenticated user holds the specified role.
     */
    boolean hasRole(String role);

    /**
     * Checks if the authenticated user has administrative privileges (ROLE_ADMIN).
     */
    boolean isAdmin();

    /**
     * Enforces that the user is authenticated, has an ACTIVE status,
     * and is not suspended or deactivated.
     * Throws AccountRestrictedException if account is suspended or deactivated.
     */
    User requireActiveUser();

    /**
     * Enforces that the authenticated user has completed email verification.
     * Throws UnverifiedAccountException if account verification is still pending.
     */
    User requireVerifiedUser();
}
