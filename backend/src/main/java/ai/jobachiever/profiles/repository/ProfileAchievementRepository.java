package ai.jobachiever.profiles.repository;

import ai.jobachiever.profiles.entity.ProfileAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileAchievementRepository extends JpaRepository<ProfileAchievement, UUID> {

    List<ProfileAchievement> findByProfileIdOrderByAchievementDateDesc(UUID profileId);

    List<ProfileAchievement> findByProfileId(UUID profileId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ProfileAchievement pa WHERE pa.profile.id = :profileId")
    void deleteByProfileId(@Param("profileId") UUID profileId);
}
