package ai.jobachiever.test;

import ai.jobachiever.auth.repository.RevokedTokenRepository;
import ai.jobachiever.profiles.repository.CareerProfileRepository;
import ai.jobachiever.users.repository.UserRepository;
import org.mockito.Mockito;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Test configuration providing mock repository beans when JPA autoconfiguration
 * is excluded in the test profile, allowing all Spring Security and service
 * beans to instantiate cleanly without a live PostgreSQL instance.
 */
@Configuration
@Profile("test")
public class TestRepositoryConfig {

    @Bean
    @ConditionalOnMissingBean
    public UserRepository userRepository() {
        return Mockito.mock(UserRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public CareerProfileRepository careerProfileRepository() {
        return Mockito.mock(CareerProfileRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public RevokedTokenRepository revokedTokenRepository() {
        return Mockito.mock(RevokedTokenRepository.class);
    }
}
