package ai.jobachiever.career.repository;

import ai.jobachiever.career.entity.CareerRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareerRecommendationRepository extends JpaRepository<CareerRecommendation, UUID> {

    Optional<CareerRecommendation> findByIdAndUserId(UUID id, UUID userId);

    Optional<CareerRecommendation> findFirstByUserIdAndCareerTrackIdOrderByCreatedAtDesc(UUID userId, UUID careerTrackId);

    List<CareerRecommendation> findAllByUserIdAndCareerTrackIdOrderByCreatedAtDesc(UUID userId, UUID careerTrackId);
}
