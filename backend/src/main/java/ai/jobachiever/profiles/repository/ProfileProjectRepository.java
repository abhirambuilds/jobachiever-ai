package ai.jobachiever.profiles.repository;

import ai.jobachiever.profiles.entity.ProfileProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileProjectRepository extends JpaRepository<ProfileProject, UUID> {

    List<ProfileProject> findByProfileIdOrderByStartDateDesc(UUID profileId);

    List<ProfileProject> findByProfileId(UUID profileId);

    void deleteByProfileId(UUID profileId);
}
