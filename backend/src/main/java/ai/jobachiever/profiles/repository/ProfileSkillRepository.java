package ai.jobachiever.profiles.repository;

import ai.jobachiever.profiles.entity.ProfileSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileSkillRepository extends JpaRepository<ProfileSkill, UUID> {

    List<ProfileSkill> findByProfileIdOrderByNameAsc(UUID profileId);

    List<ProfileSkill> findByProfileId(UUID profileId);

    void deleteByProfileId(UUID profileId);
}
