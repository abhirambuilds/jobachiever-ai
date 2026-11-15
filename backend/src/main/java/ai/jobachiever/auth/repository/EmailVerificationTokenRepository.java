package ai.jobachiever.auth.repository;

import ai.jobachiever.auth.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {

    Optional<EmailVerificationToken> findTopByUserIdOrderByCreatedAtDesc(UUID userId);

    List<EmailVerificationToken> findAllByUserIdAndConsumedAtIsNull(UUID userId);

    void deleteByExpiresAtBefore(Instant now);
}
