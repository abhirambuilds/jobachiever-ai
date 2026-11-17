package ai.jobachiever.profiles.repository;

import ai.jobachiever.profiles.entity.ProfileProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileProjectRepository extends JpaRepository<ProfileProject, UUID> {

    List<ProfileProject> findByProfileIdOrderByStartDateDesc(UUID profileId);

    List<ProfileProject> findByProfileId(UUID profileId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ProfileProject pp WHERE pp.profile.id = :profileId")
    void deleteByProfileId(@Param("profileId") UUID profileId);
}
