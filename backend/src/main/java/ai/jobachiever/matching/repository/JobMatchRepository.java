package ai.jobachiever.matching.repository;

import ai.jobachiever.matching.entity.JobMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobMatchRepository extends JpaRepository<JobMatch, UUID> {

    Optional<JobMatch> findByIdAndUserId(UUID id, UUID userId);

    List<JobMatch> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<JobMatch> findByUserIdAndJobIdOrderByCreatedAtDesc(UUID userId, UUID jobId);

    List<JobMatch> findByUserIdAndResumeIdOrderByCreatedAtDesc(UUID userId, UUID resumeId);

    void deleteByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
