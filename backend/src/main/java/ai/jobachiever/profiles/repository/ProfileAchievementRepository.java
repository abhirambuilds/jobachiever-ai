package ai.jobachiever.profiles.repository;

import ai.jobachiever.profiles.entity.ProfileAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileAchievementRepository extends JpaRepository<ProfileAchievement, UUID> {

    List<ProfileAchievement> findByProfileIdOrderByAchievementDateDesc(UUID profileId);

    List<ProfileAchievement> findByProfileId(UUID profileId);

    void deleteByProfileId(UUID profileId);
}
