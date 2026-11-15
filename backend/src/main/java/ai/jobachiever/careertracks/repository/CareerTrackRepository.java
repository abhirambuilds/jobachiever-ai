package ai.jobachiever.careertracks.repository;

import ai.jobachiever.careertracks.entity.CareerTrack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareerTrackRepository extends JpaRepository<CareerTrack, UUID> {

    Optional<CareerTrack> findByIdAndUserId(UUID id, UUID userId);

    List<CareerTrack> findAllByUserId(UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}
