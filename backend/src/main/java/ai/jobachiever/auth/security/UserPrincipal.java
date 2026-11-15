package ai.jobachiever.auth.security;

import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.Role;
import ai.jobachiever.users.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

public class UserPrincipal implements UserDetails {

    private final UUID id;
    private final String email;
    private final String passwordHash;
    private final AccountStatus accountStatus;
    private final Role role;
    private final boolean emailVerified;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(UUID id, String email, String passwordHash,
                         AccountStatus accountStatus, Role role, boolean emailVerified,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.accountStatus = accountStatus;
        this.role = role != null ? role : Role.USER;
        this.emailVerified = emailVerified;
        this.authorities = authorities;
    }

    public static UserPrincipal fromUser(User user) {
        Role role = user.getRole() != null ? user.getRole() : Role.USER;
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));
        if (user.isEmailVerified()) {
            authorities.add(new SimpleGrantedAuthority("AUTHORITY_VERIFIED_EMAIL"));
        } else {
            authorities.add(new SimpleGrantedAuthority("AUTHORITY_UNVERIFIED_EMAIL"));
        }

        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getAccountStatus(),
                role,
                user.isEmailVerified(),
                Collections.unmodifiableList(authorities)
        );
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public Role getRole() {
        return role;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountStatus != AccountStatus.DEACTIVATED;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountStatus != AccountStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return accountStatus == AccountStatus.ACTIVE || accountStatus == AccountStatus.PENDING_VERIFICATION;
    }
}
