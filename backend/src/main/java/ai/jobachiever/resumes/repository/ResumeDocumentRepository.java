package ai.jobachiever.resumes.repository;

import ai.jobachiever.resumes.entity.ResumeDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeDocumentRepository extends JpaRepository<ResumeDocument, UUID>, JpaSpecificationExecutor<ResumeDocument> {

    Optional<ResumeDocument> findByIdAndUserId(UUID id, UUID userId);

    List<ResumeDocument> findAllByUserId(UUID userId);

    Page<ResumeDocument> findAllByUserId(UUID userId, Pageable pageable);

    List<ResumeDocument> findAllByUserIdAndPrimaryTrue(UUID userId);

    Optional<ResumeDocument> findFirstByUserIdOrderByUpdatedAtDesc(UUID userId);

    long countByUserId(UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}
