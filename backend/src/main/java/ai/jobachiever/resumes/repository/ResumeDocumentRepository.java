package ai.jobachiever.resumes.repository;

import ai.jobachiever.resumes.entity.ResumeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeDocumentRepository extends JpaRepository<ResumeDocument, UUID> {

    Optional<ResumeDocument> findByIdAndUserId(UUID id, UUID userId);

    List<ResumeDocument> findAllByUserId(UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}
