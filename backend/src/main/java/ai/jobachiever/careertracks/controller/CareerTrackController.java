package ai.jobachiever.careertracks.controller;

import ai.jobachiever.careertracks.dto.*;
import ai.jobachiever.careertracks.service.CareerTrackService;
import ai.jobachiever.common.response.ApiResponse;
import ai.jobachiever.common.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/career-tracks")
public class CareerTrackController {

    private final CareerTrackService careerTrackService;
    private final CurrentUserService currentUserService;

    public CareerTrackController(CareerTrackService careerTrackService,
                                CurrentUserService currentUserService) {
        this.careerTrackService = careerTrackService;
        this.currentUserService = currentUserService;
    }

    /**
     * List all career tracks for the authenticated candidate.
     * Supports optional active filtering and pagination.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<?>> listTracks(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "priority") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        UUID userId = currentUserService.getAuthenticatedUserId();

        if (page != null && size != null) {
            Sort.Direction direction = "DESC".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, sortBy));
            Page<CareerTrackResponse> pageResult = careerTrackService.getTracksPaginated(userId, active, pageable);
            return ResponseEntity.ok(ApiResponse.ok(pageResult, "Career tracks retrieved successfully"));
        }

        List<CareerTrackResponse> list = careerTrackService.getTracks(userId, active);
        return ResponseEntity.ok(ApiResponse.ok(list, "Career tracks retrieved successfully"));
    }

    /**
     * Retrieve a specific career track by ID, verifying user ownership.
     */
    @GetMapping("/{trackId}")
    public ResponseEntity<ApiResponse<CareerTrackResponse>> getTrack(
            @PathVariable UUID trackId) {
        UUID userId = currentUserService.getAuthenticatedUserId();
        CareerTrackResponse track = careerTrackService.getTrackById(trackId, userId);
        return ResponseEntity.ok(ApiResponse.ok(track, "Career track retrieved successfully"));
    }

    /**
     * Create a new career track tied to the authenticated user's master profile.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CareerTrackResponse>> createTrack(
            @Valid @RequestBody CreateCareerTrackRequest request) {
        UUID userId = currentUserService.getAuthenticatedUserId();
        CareerTrackResponse created = careerTrackService.createTrack(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Career track created successfully"));
    }

    /**
     * Update an existing career track, verifying user ownership.
     */
    @PutMapping("/{trackId}")
    public ResponseEntity<ApiResponse<CareerTrackResponse>> updateTrack(
            @PathVariable UUID trackId,
            @Valid @RequestBody UpdateCareerTrackRequest request) {
        UUID userId = currentUserService.getAuthenticatedUserId();
        CareerTrackResponse updated = careerTrackService.updateTrack(trackId, userId, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Career track updated successfully"));
    }

    /**
     * Activate or deactivate a career track.
     */
    @PatchMapping("/{trackId}/status")
    public ResponseEntity<ApiResponse<CareerTrackResponse>> updateTrackStatus(
            @PathVariable UUID trackId,
            @Valid @RequestBody UpdateTrackStatusRequest request) {
        UUID userId = currentUserService.getAuthenticatedUserId();
        CareerTrackResponse updated = careerTrackService.updateTrackStatus(trackId, userId, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Career track status updated successfully"));
    }

    /**
     * Update priority for a career track.
     */
    @PatchMapping("/{trackId}/priority")
    public ResponseEntity<ApiResponse<CareerTrackResponse>> updateTrackPriority(
            @PathVariable UUID trackId,
            @Valid @RequestBody UpdateTrackPriorityRequest request) {
        UUID userId = currentUserService.getAuthenticatedUserId();
        CareerTrackResponse updated = careerTrackService.updateTrackPriority(trackId, userId, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Career track priority updated successfully"));
    }

    /**
     * Delete a career track safely without affecting the master profile.
     */
    @DeleteMapping("/{trackId}")
    public ResponseEntity<ApiResponse<Void>> deleteTrack(
            @PathVariable UUID trackId) {
        UUID userId = currentUserService.getAuthenticatedUserId();
        careerTrackService.deleteTrack(trackId, userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Career track deleted successfully"));
    }

    /**
     * Retrieve deterministic overview of skills match, missing skills, and relevant projects/experiences.
     */
    @GetMapping("/{trackId}/overview")
    public ResponseEntity<ApiResponse<CareerTrackOverviewResponse>> getTrackOverview(
            @PathVariable UUID trackId) {
        UUID userId = currentUserService.getAuthenticatedUserId();
        CareerTrackOverviewResponse overview = careerTrackService.getTrackOverview(trackId, userId);
        return ResponseEntity.ok(ApiResponse.ok(overview, "Career track overview retrieved successfully"));
    }
}
