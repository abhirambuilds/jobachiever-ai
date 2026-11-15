package ai.jobachiever.test;

import ai.jobachiever.ai.repository.UserAiPreferenceRepository;
import ai.jobachiever.applications.repository.ApplicationActivityRepository;
import ai.jobachiever.applications.repository.JobApplicationRepository;
import ai.jobachiever.auth.repository.EmailVerificationTokenRepository;
import ai.jobachiever.auth.repository.PasswordResetTokenRepository;
import ai.jobachiever.auth.repository.RevokedTokenRepository;
import ai.jobachiever.careertracks.repository.CareerTrackRepository;
import ai.jobachiever.jobs.repository.JobAnalysisRepository;
import ai.jobachiever.jobs.repository.JobRepository;
import ai.jobachiever.matching.repository.JobMatchRepository;
import ai.jobachiever.profiles.repository.CareerProfileRepository;
import ai.jobachiever.profiles.repository.ProfileAchievementRepository;
import ai.jobachiever.profiles.repository.ProfileCertificationRepository;
import ai.jobachiever.profiles.repository.ProfileEducationRepository;
import ai.jobachiever.profiles.repository.ProfileExperienceRepository;
import ai.jobachiever.profiles.repository.ProfileProjectRepository;
import ai.jobachiever.profiles.repository.ProfileSkillRepository;
import ai.jobachiever.resumes.repository.ResumeAnalysisRepository;
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
    public ProfileEducationRepository profileEducationRepository() {
        return Mockito.mock(ProfileEducationRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public ProfileSkillRepository profileSkillRepository() {
        return Mockito.mock(ProfileSkillRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public ProfileExperienceRepository profileExperienceRepository() {
        return Mockito.mock(ProfileExperienceRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public ProfileProjectRepository profileProjectRepository() {
        return Mockito.mock(ProfileProjectRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public ProfileCertificationRepository profileCertificationRepository() {
        return Mockito.mock(ProfileCertificationRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public ProfileAchievementRepository profileAchievementRepository() {
        return Mockito.mock(ProfileAchievementRepository.class);
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
    public ResumeAnalysisRepository resumeAnalysisRepository() {
        return Mockito.mock(ResumeAnalysisRepository.class);
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

    @Bean
    @ConditionalOnMissingBean
    public UserAiPreferenceRepository userAiPreferenceRepository() {
        return Mockito.mock(UserAiPreferenceRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public JobRepository jobRepository() {
        return Mockito.mock(JobRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public JobAnalysisRepository jobAnalysisRepository() {
        return Mockito.mock(JobAnalysisRepository.class);
    }

    @Bean
    @ConditionalOnMissingBean
    public JobMatchRepository jobMatchRepository() {
        return Mockito.mock(JobMatchRepository.class);
    }
}
