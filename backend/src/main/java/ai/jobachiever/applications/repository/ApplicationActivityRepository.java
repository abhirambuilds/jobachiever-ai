package ai.jobachiever.applications.repository;

import ai.jobachiever.applications.entity.ApplicationActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationActivityRepository extends JpaRepository<ApplicationActivity, UUID> {

    Optional<ApplicationActivity> findByIdAndApplicationUserId(UUID id, UUID userId);

    List<ApplicationActivity> findAllByApplicationUserId(UUID userId);

    List<ApplicationActivity> findAllByApplicationIdAndApplicationUserId(UUID applicationId, UUID userId);

    boolean existsByIdAndApplicationUserId(UUID id, UUID userId);
}
