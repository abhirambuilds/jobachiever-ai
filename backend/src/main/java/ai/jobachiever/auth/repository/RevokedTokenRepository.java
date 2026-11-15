package ai.jobachiever.auth.repository;

import ai.jobachiever.auth.entity.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, UUID> {

    boolean existsByTokenIdentifier(String tokenIdentifier);

    void deleteByExpiresAtBefore(Instant now);
}
