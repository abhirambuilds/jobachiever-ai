package ai.jobachiever.common.security;

import ai.jobachiever.auth.exception.AccountRestrictedException;
import ai.jobachiever.auth.exception.InvalidTokenException;
import ai.jobachiever.auth.exception.UnverifiedAccountException;
import ai.jobachiever.auth.security.UserPrincipal;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.Role;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Service("currentUserService")
public class CurrentUserServiceImpl implements CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private UserPrincipal getPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new InvalidTokenException("Authentication required to access this resource");
        }
        return principal;
    }

    @Override
    public UUID getAuthenticatedUserId() {
        return getPrincipal().getId();
    }

    @Override
    public Optional<UUID> findAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal.getId());
        }
        return Optional.empty();
    }

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser() {
        UUID userId = getAuthenticatedUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user record not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public AccountStatus getAccountStatus() {
        return getCurrentUser().getAccountStatus();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isEmailVerified() {
        return getCurrentUser().isEmailVerified();
    }

    @Override
    @Transactional(readOnly = true)
    public Role getRole() {
        return getCurrentUser().getRole();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return getPrincipal().getAuthorities();
    }

    @Override
    public boolean hasRole(String role) {
        if (role == null) {
            return false;
        }
        String normalized = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase(normalized) || a.getAuthority().equalsIgnoreCase(role));
    }

    @Override
    public boolean isAdmin() {
        return hasRole("ADMIN") || hasRole("ROLE_ADMIN");
    }

    @Override
    @Transactional(readOnly = true)
    public User requireActiveUser() {
        User user = getCurrentUser();
        if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
            throw new AccountRestrictedException("Account has been suspended. Please contact support.");
        }
        if (user.getAccountStatus() == AccountStatus.DEACTIVATED) {
            throw new AccountRestrictedException("Account has been deactivated. Please contact support.");
        }
        if (user.getAccountStatus() == AccountStatus.PENDING_VERIFICATION || !user.isEmailVerified()) {
            throw new UnverifiedAccountException("Account verification required. Please verify your email before accessing this resource.");
        }
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public User requireVerifiedUser() {
        User user = getCurrentUser();
        if (!user.isEmailVerified()) {
            throw new UnverifiedAccountException("Account verification required. Please verify your email before accessing this resource.");
        }
        return user;
    }
}
