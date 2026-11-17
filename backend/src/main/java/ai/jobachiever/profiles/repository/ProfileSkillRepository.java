package ai.jobachiever.profiles.repository;

import ai.jobachiever.profiles.entity.ProfileSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileSkillRepository extends JpaRepository<ProfileSkill, UUID> {

    List<ProfileSkill> findByProfileIdOrderByNameAsc(UUID profileId);

    List<ProfileSkill> findByProfileId(UUID profileId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ProfileSkill ps WHERE ps.profile.id = :profileId")
    void deleteByProfileId(@Param("profileId") UUID profileId);
}
