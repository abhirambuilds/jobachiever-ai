package ai.jobachiever.admin.dto;

import ai.jobachiever.users.entity.AccountStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAccountStatusRequest(
        @NotNull(message = "Account status is required")
        AccountStatus accountStatus,

        String reason
) {
}
