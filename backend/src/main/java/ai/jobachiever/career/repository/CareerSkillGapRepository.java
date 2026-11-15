package ai.jobachiever.career.repository;

import ai.jobachiever.career.entity.CareerSkillGap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareerSkillGapRepository extends JpaRepository<CareerSkillGap, UUID> {

    Optional<CareerSkillGap> findByIdAndUserId(UUID id, UUID userId);

    Optional<CareerSkillGap> findFirstByUserIdAndCareerTrackIdOrderByCreatedAtDesc(UUID userId, UUID careerTrackId);

    List<CareerSkillGap> findAllByUserIdAndCareerTrackIdOrderByCreatedAtDesc(UUID userId, UUID careerTrackId);

    List<CareerSkillGap> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
}
