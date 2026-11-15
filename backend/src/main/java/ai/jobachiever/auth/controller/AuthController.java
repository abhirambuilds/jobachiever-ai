package ai.jobachiever.auth.controller;

import ai.jobachiever.auth.dto.*;
import ai.jobachiever.auth.exception.InvalidTokenException;
import ai.jobachiever.auth.security.UserPrincipal;
import ai.jobachiever.auth.service.AuthService;
import ai.jobachiever.auth.service.PasswordResetService;
import ai.jobachiever.auth.service.VerificationService;
import ai.jobachiever.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final VerificationService verificationService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService,
                          VerificationService verificationService,
                          PasswordResetService passwordResetService) {
        this.authService = authService;
        this.verificationService = verificationService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "User registered successfully. Verification OTP dispatched."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Login successful"));
    }

    @PostMapping({"/verify-email", "/verify-otp"})
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        verificationService.verifyEmail(request.email(), request.otp());
        return ResponseEntity.ok(ApiResponse.ok(null, "Email successfully verified. Your account is now active."));
    }

    @PostMapping({"/resend-verification", "/resend-otp"})
    public ResponseEntity<ApiResponse<Void>> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        verificationService.resendVerificationOtp(request.email());
        return ResponseEntity.ok(ApiResponse.ok(null, "If an account exists with this email address, a new verification code has been dispatched."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestPasswordReset(request.email());
        return ResponseEntity.ok(ApiResponse.ok(null, "If an account exists with this email address, password reset instructions have been dispatched."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.ok(null, "Password successfully reset. You may now log in with your new credentials."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new InvalidTokenException("Authentication required to access this endpoint");
        }
        UserResponse response = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(response, "Current user retrieved successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserPrincipal principal,
                                       @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (principal != null && authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            authService.logout(token, principal.getId());
        }
        return ResponseEntity.noContent().build();
    }
}
