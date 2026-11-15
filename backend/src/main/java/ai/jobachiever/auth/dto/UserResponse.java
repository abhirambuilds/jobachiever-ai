package ai.jobachiever.auth.dto;

import ai.jobachiever.users.entity.User;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String accountStatus,
        String role,
        boolean emailVerified,
        Instant createdAt,
        Instant lastLoginAt
) {
    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getAccountStatus() != null ? user.getAccountStatus().name() : null,
                user.getRole() != null ? user.getRole().name() : "USER",
                user.isEmailVerified(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}
