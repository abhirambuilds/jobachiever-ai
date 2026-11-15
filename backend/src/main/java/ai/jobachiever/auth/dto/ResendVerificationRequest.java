package ai.jobachiever.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendVerificationRequest(
        @NotBlank(message = "Email address is required")
        @Email(message = "Email address must be valid")
        String email
) {
}
