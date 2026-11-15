package ai.jobachiever.careertracks.service;

import ai.jobachiever.careertracks.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CareerTrackService {

    List<CareerTrackResponse> getTracks(UUID userId, Boolean activeOnly);

    Page<CareerTrackResponse> getTracksPaginated(UUID userId, Boolean activeOnly, Pageable pageable);

    CareerTrackResponse getTrackById(UUID trackId, UUID userId);

    CareerTrackResponse createTrack(UUID userId, CreateCareerTrackRequest request);

    CareerTrackResponse updateTrack(UUID trackId, UUID userId, UpdateCareerTrackRequest request);

    CareerTrackResponse updateTrackStatus(UUID trackId, UUID userId, UpdateTrackStatusRequest request);

    CareerTrackResponse updateTrackPriority(UUID trackId, UUID userId, UpdateTrackPriorityRequest request);

    void deleteTrack(UUID trackId, UUID userId);

    CareerTrackOverviewResponse getTrackOverview(UUID trackId, UUID userId);
}
