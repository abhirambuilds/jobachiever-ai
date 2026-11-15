package ai.jobachiever.career.repository;

import ai.jobachiever.career.entity.CareerRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareerRoadmapRepository extends JpaRepository<CareerRoadmap, UUID> {

    Optional<CareerRoadmap> findByIdAndUserId(UUID id, UUID userId);

    Optional<CareerRoadmap> findFirstByUserIdAndCareerTrackIdOrderByCreatedAtDesc(UUID userId, UUID careerTrackId);

    List<CareerRoadmap> findAllByUserIdAndCareerTrackIdOrderByCreatedAtDesc(UUID userId, UUID careerTrackId);

    List<CareerRoadmap> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
}
