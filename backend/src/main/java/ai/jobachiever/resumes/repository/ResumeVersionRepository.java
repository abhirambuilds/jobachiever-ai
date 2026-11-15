package ai.jobachiever.resumes.repository;

import ai.jobachiever.resumes.entity.ResumeVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeVersionRepository extends JpaRepository<ResumeVersion, UUID> {

    Optional<ResumeVersion> findByIdAndDocumentUserId(UUID id, UUID userId);

    List<ResumeVersion> findAllByDocumentUserId(UUID userId);

    List<ResumeVersion> findAllByDocumentIdOrderByVersionNumberDesc(UUID documentId);

    Optional<ResumeVersion> findByDocumentIdAndVersionNumber(UUID documentId, int versionNumber);

    Optional<ResumeVersion> findFirstByDocumentIdOrderByVersionNumberDesc(UUID documentId);

    @Query("SELECT COALESCE(MAX(v.versionNumber), 0) FROM ResumeVersion v WHERE v.document.id = :documentId")
    int findMaxVersionNumber(@Param("documentId") UUID documentId);

    boolean existsByIdAndDocumentUserId(UUID id, UUID userId);
}
