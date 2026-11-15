package ai.jobachiever.jobs.repository;

import ai.jobachiever.jobs.entity.JobAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobAnalysisRepository extends JpaRepository<JobAnalysis, UUID> {

    Optional<JobAnalysis> findByIdAndUserId(UUID id, UUID userId);

    List<JobAnalysis> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<JobAnalysis> findByUserIdAndJobIdOrderByCreatedAtDesc(UUID userId, UUID jobId);

    Optional<JobAnalysis> findFirstByUserIdAndRawDescriptionHashOrderByCreatedAtDesc(UUID userId, String rawDescriptionHash);

    void deleteByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
