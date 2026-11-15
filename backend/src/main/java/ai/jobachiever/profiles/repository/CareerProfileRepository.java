package ai.jobachiever.profiles.repository;

import ai.jobachiever.profiles.entity.CareerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareerProfileRepository extends JpaRepository<CareerProfile, UUID> {

    Optional<CareerProfile> findByUserId(UUID userId);

    Optional<CareerProfile> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserId(UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}
