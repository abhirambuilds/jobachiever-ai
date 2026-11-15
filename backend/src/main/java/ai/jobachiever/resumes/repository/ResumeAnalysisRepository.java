package ai.jobachiever.resumes.repository;

import ai.jobachiever.resumes.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, UUID> {

    Optional<ResumeAnalysis> findByIdAndUserId(UUID id, UUID userId);

    List<ResumeAnalysis> findByResumeIdAndUserIdOrderByCreatedAtDesc(UUID resumeId, UUID userId);

    List<ResumeAnalysis> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<ResumeAnalysis> findFirstByResumeIdAndUserIdOrderByCreatedAtDesc(UUID resumeId, UUID userId);
}
