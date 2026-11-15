package ai.jobachiever.admin.dto;

import ai.jobachiever.users.entity.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(
        @NotNull(message = "Role is required")
        Role role,

        String reason
) {
}
