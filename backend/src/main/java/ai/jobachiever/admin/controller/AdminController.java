package ai.jobachiever.admin.controller;

import ai.jobachiever.admin.dto.UpdateAccountStatusRequest;
import ai.jobachiever.admin.dto.UpdateRoleRequest;
import ai.jobachiever.auth.dto.UserResponse;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.common.response.ApiResponse;
import ai.jobachiever.security.audit.SecurityAuditEventType;
import ai.jobachiever.security.audit.SecurityAuditLog;
import ai.jobachiever.security.audit.SecurityAuditLogRepository;
import ai.jobachiever.security.audit.SecurityAuditService;
import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final UserRepository userRepository;
    private final SecurityAuditService auditService;
    private final SecurityAuditLogRepository auditRepository;

    public AdminController(UserRepository userRepository,
                           SecurityAuditService auditService,
                           SecurityAuditLogRepository auditRepository) {
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.auditRepository = auditRepository;
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateAccountStatus(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateAccountStatusRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        AccountStatus oldStatus = user.getAccountStatus();
        user.setAccountStatus(request.accountStatus());
        User updated = userRepository.save(user);

        SecurityAuditEventType eventType = switch (request.accountStatus()) {
            case SUSPENDED -> SecurityAuditEventType.ACCOUNT_SUSPENDED;
            case DEACTIVATED -> SecurityAuditEventType.ACCOUNT_DEACTIVATED;
            default -> SecurityAuditEventType.ROLE_CHANGED;
        };

        auditService.recordSuccess(
                eventType,
                user.getId(),
                user.getEmail(),
                "Account status updated from " + oldStatus + " to " + request.accountStatus() + " (Reason: " + request.reason() + ")"
        );

        log.info("Admin updated status for user {} to {}", userId, request.accountStatus());
        return ResponseEntity.ok(ApiResponse.ok(UserResponse.fromEntity(updated), "Account status successfully updated"));
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateRoleRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setRole(request.role());
        User updated = userRepository.save(user);

        auditService.recordSuccess(
                SecurityAuditEventType.ROLE_CHANGED,
                user.getId(),
                user.getEmail(),
                "User role updated to " + request.role() + " (Reason: " + request.reason() + ")"
        );

        log.info("Admin updated role for user {} to {}", userId, request.role());
        return ResponseEntity.ok(ApiResponse.ok(UserResponse.fromEntity(updated), "User role successfully updated"));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<SecurityAuditLog>>> getAuditLogs() {
        List<SecurityAuditLog> logs = auditRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(logs, "Security audit logs retrieved"));
    }
}
