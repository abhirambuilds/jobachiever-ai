package ai.jobachiever.profiles.repository;

import ai.jobachiever.profiles.entity.ProfileEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileEducationRepository extends JpaRepository<ProfileEducation, UUID> {

    List<ProfileEducation> findByProfileIdOrderByStartDateDesc(UUID profileId);

    List<ProfileEducation> findByProfileId(UUID profileId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ProfileEducation pe WHERE pe.profile.id = :profileId")
    void deleteByProfileId(@Param("profileId") UUID profileId);
}
