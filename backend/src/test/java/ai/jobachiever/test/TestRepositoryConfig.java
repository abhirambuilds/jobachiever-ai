package ai.jobachiever.test;

import ai.jobachiever.applications.repository.ApplicationActivityRepository;
import ai.jobachiever.applications.repository.JobApplicationRepository;
import ai.jobachiever.auth.repository.EmailVerificationTokenRepository;
import ai.jobachiever.auth.repository.PasswordResetTokenRepository;
import ai.jobachiever.auth.repository.RevokedTokenRepository;
import ai.jobachiever.careertracks.repository.CareerTrackRepository;
import ai.jobachiever.profiles.repository.CareerProfileRepository;
import ai.jobachiever.resumes.repository.ResumeDocumentRepository;
import ai.jobachiever.resumes.repository.ResumeVersionRepository;
import ai.jobachiever.security.audit.SecurityAuditLogRepository;
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

    @Bean
    @ConditionalOnMissingBean
    public EmailVerificationTokenRepository emailVerificationTokenRepository() {
        return Mockito.mock(EmailVerificationTokenRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public PasswordResetTokenRepository passwordResetTokenRepository() {
        return Mockito.mock(PasswordResetTokenRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public SecurityAuditLogRepository securityAuditLogRepository() {
        return Mockito.mock(SecurityAuditLogRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public CareerTrackRepository careerTrackRepository() {
        return Mockito.mock(CareerTrackRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public ResumeDocumentRepository resumeDocumentRepository() {
        return Mockito.mock(ResumeDocumentRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public ResumeVersionRepository resumeVersionRepository() {
        return Mockito.mock(ResumeVersionRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public JobApplicationRepository jobApplicationRepository() {
        return Mockito.mock(JobApplicationRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public ApplicationActivityRepository applicationActivityRepository() {
        return Mockito.mock(ApplicationActivityRepository.class);
    }
}
