package ai.jobachiever.careertracks.repository;

import ai.jobachiever.careertracks.entity.CareerTrack;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareerTrackRepository extends JpaRepository<CareerTrack, UUID> {

    Optional<CareerTrack> findByIdAndUserId(UUID id, UUID userId);

    List<CareerTrack> findAllByUserIdOrderByPriorityAscCreatedAtDesc(UUID userId);

    List<CareerTrack> findAllByUserIdAndActiveOrderByPriorityAscCreatedAtDesc(UUID userId, boolean active);

    Page<CareerTrack> findAllByUserId(UUID userId, Pageable pageable);

    Page<CareerTrack> findAllByUserIdAndActive(UUID userId, boolean active, Pageable pageable);

    boolean existsByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);

    boolean existsByUserIdAndTargetRoleIgnoreCaseAndActiveTrue(UUID userId, String targetRole);

    long countByUserIdAndActiveTrue(UUID userId);

    Optional<CareerTrack> findByUserIdAndPrimaryTrue(UUID userId);
}
