package ai.jobachiever.profiles.repository;

import ai.jobachiever.profiles.entity.ProfileCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileCertificationRepository extends JpaRepository<ProfileCertification, UUID> {

    List<ProfileCertification> findByProfileIdOrderByIssueDateDesc(UUID profileId);

    List<ProfileCertification> findByProfileId(UUID profileId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ProfileCertification pc WHERE pc.profile.id = :profileId")
    void deleteByProfileId(@Param("profileId") UUID profileId);
}
