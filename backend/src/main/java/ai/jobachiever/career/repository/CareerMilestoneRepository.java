package ai.jobachiever.career.repository;

import ai.jobachiever.career.entity.CareerMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareerMilestoneRepository extends JpaRepository<CareerMilestone, UUID> {

    Optional<CareerMilestone> findByIdAndUserId(UUID id, UUID userId);

    List<CareerMilestone> findAllByRoadmapIdAndUserIdOrderByPhaseNumberAscCreatedAtAsc(UUID roadmapId, UUID userId);

    List<CareerMilestone> findAllByUserIdAndStatus(UUID userId, String status);

    List<CareerMilestone> findAllByUserId(UUID userId);
}
