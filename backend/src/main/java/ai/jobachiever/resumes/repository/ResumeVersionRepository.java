package ai.jobachiever.resumes.repository;

import ai.jobachiever.resumes.entity.ResumeVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeVersionRepository extends JpaRepository<ResumeVersion, UUID> {

    Optional<ResumeVersion> findByIdAndDocumentUserId(UUID id, UUID userId);

    List<ResumeVersion> findAllByDocumentUserId(UUID userId);

    boolean existsByIdAndDocumentUserId(UUID id, UUID userId);
}
