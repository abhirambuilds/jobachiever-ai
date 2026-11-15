package ai.jobachiever.profiles.repository;

import ai.jobachiever.profiles.entity.ProfileExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileExperienceRepository extends JpaRepository<ProfileExperience, UUID> {

    List<ProfileExperience> findByProfileIdOrderByStartDateDesc(UUID profileId);

    List<ProfileExperience> findByProfileId(UUID profileId);

    void deleteByProfileId(UUID profileId);
}
