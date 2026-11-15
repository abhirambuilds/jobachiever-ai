package ai.jobachiever.applications.repository;

import ai.jobachiever.applications.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {

    Optional<JobApplication> findByIdAndUserId(UUID id, UUID userId);

    List<JobApplication> findAllByUserId(UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}
