package ai.jobachiever.profiles.repository;

import ai.jobachiever.profiles.entity.ProfileEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileEducationRepository extends JpaRepository<ProfileEducation, UUID> {

    List<ProfileEducation> findByProfileIdOrderByStartDateDesc(UUID profileId);

    List<ProfileEducation> findByProfileId(UUID profileId);

    void deleteByProfileId(UUID profileId);
}
