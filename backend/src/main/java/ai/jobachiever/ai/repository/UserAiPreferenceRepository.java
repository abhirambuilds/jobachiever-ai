package ai.jobachiever.ai.repository;

import ai.jobachiever.ai.entity.UserAiPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAiPreferenceRepository extends JpaRepository<UserAiPreference, UUID> {

    Optional<UserAiPreference> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}
