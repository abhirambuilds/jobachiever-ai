package ai.jobachiever.profiles.service;

import ai.jobachiever.common.exception.InvalidRequestException;
import ai.jobachiever.profiles.dto.*;
import ai.jobachiever.profiles.entity.*;
import ai.jobachiever.profiles.repository.*;
import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.Role;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Career Profile Service Unit Tests")
class CareerProfileServiceUnitTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private CareerProfileRepository careerProfileRepository;
    @Mock
    private ProfileEducationRepository educationRepository;
    @Mock
    private ProfileSkillRepository skillRepository;
    @Mock
    private ProfileExperienceRepository experienceRepository;
    @Mock
    private ProfileProjectRepository projectRepository;
    @Mock
    private ProfileCertificationRepository certificationRepository;
    @Mock
    private ProfileAchievementRepository achievementRepository;

    private ProfileCompletionCalculator completionCalculator;
    private ObjectMapper objectMapper;
    private CareerProfileServiceImpl profileService;

    private User testUser;
    private CareerProfile testProfile;
    private UUID userId;

    @BeforeEach
    void setUp() {
        completionCalculator = new ProfileCompletionCalculator();
        objectMapper = new ObjectMapper();

        profileService = new CareerProfileServiceImpl(
                userRepository,
                careerProfileRepository,
                educationRepository,
                skillRepository,
                experienceRepository,
                projectRepository,
                certificationRepository,
                achievementRepository,
                completionCalculator,
                objectMapper
        );

        userId = UUID.randomUUID();
        testUser = new User("jane.doe@example.com", "hash", "Jane", "Doe");
        testUser.setId(userId);
        testUser.setRole(Role.USER);
        testUser.setAccountStatus(AccountStatus.ACTIVE);

        testProfile = new CareerProfile(testUser);
        testProfile.setId(UUID.randomUUID());
        testProfile.setHeadline("Senior Software Engineer");
        testProfile.setSummary("Experienced backend engineer");
        testProfile.setCurrentLocation("San Francisco, CA");
    }

    @Test
    @DisplayName("getProfile auto-initializes profile if not found for user")
    void getProfileInitializesIfMissing() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.empty());
        given(careerProfileRepository.save(any(CareerProfile.class))).willAnswer(invocation -> {
            CareerProfile saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        CareerProfileResponse response = profileService.getProfile(userId);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("jane.doe@example.com");
        assertThat(response.getPersonalInfo().getFullName()).isEqualTo("Jane Doe");
        verify(careerProfileRepository).save(any(CareerProfile.class));
    }

    @Test
    @DisplayName("getProfile loads all child sections correctly")
    void getProfileLoadsAllChildSections() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.of(testProfile));

        ProfileEducation edu = new ProfileEducation();
        edu.setId(UUID.randomUUID());
        edu.setInstitution("UC Berkeley");
        edu.setDegree("B.S. CS");
        edu.setStartDate(LocalDate.of(2019, 9, 1));
        given(educationRepository.findByProfileIdOrderByStartDateDesc(testProfile.getId()))
                .willReturn(List.of(edu));

        ProfileSkill skill = new ProfileSkill();
        skill.setId(UUID.randomUUID());
        skill.setName("Java");
        skill.setCategory(SkillCategory.TECHNICAL);
        skill.setProficiencyLevel(ProficiencyLevel.EXPERT);
        given(skillRepository.findByProfileIdOrderByNameAsc(testProfile.getId()))
                .willReturn(List.of(skill));

        CareerProfileResponse response = profileService.getProfile(userId);

        assertThat(response.getEducation()).hasSize(1);
        assertThat(response.getEducation().get(0).getInstitution()).isEqualTo("UC Berkeley");
        assertThat(response.getSkills()).hasSize(1);
        assertThat(response.getSkills().get(0).getName()).isEqualTo("Java");
    }

    @Test
    @DisplayName("updateProfile rejects attempt to change email address")
    void updateProfileRejectsEmailChange() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.of(testProfile));

        UpdateCareerProfileRequest request = new UpdateCareerProfileRequest();
        PersonalInfoDto personal = new PersonalInfoDto();
        personal.setEmail("malicious-hacker@example.com"); // Mismatched!
        request.setPersonalInfo(personal);

        assertThatThrownBy(() -> profileService.updateProfile(userId, request))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("Email address cannot be changed via profile management");

        verify(careerProfileRepository, never()).save(any(CareerProfile.class));
    }

    @Test
    @DisplayName("updateProfile deduplicates skills case-insensitively")
    void updateProfileDeduplicatesSkills() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.of(testProfile));

        UpdateCareerProfileRequest request = new UpdateCareerProfileRequest();
        SkillDto s1 = new SkillDto(); s1.setName("Java");
        SkillDto s2 = new SkillDto(); s2.setName("JAVA "); // duplicate
        SkillDto s3 = new SkillDto(); s3.setName("java"); // duplicate
        SkillDto s4 = new SkillDto(); s4.setName("Spring Boot");
        request.setSkills(List.of(s1, s2, s3, s4));

        profileService.updateProfile(userId, request);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<ProfileSkill>> captor = ArgumentCaptor.forClass(List.class);
        verify(skillRepository).saveAll(captor.capture());

        List<ProfileSkill> savedSkills = captor.getValue();
        assertThat(savedSkills).hasSize(2);
        assertThat(savedSkills.stream().map(ProfileSkill::getName).toList())
                .containsExactlyInAnyOrder("Java", "Spring Boot");
    }

    @Test
    @DisplayName("updateProfile rejects education where end date is before start date")
    void updateProfileRejectsEducationInvalidDates() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.of(testProfile));

        UpdateCareerProfileRequest request = new UpdateCareerProfileRequest();
        EducationDto edu = new EducationDto();
        edu.setInstitution("UC Berkeley");
        edu.setDegree("B.S.");
        edu.setStartDate("2024-05-01");
        edu.setEndDate("2020-05-01"); // Invalid: end before start!
        request.setEducation(List.of(edu));

        assertThatThrownBy(() -> profileService.updateProfile(userId, request))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("cannot be before start date for education");
    }

    @Test
    @DisplayName("updateProfile rejects work experience where end date is before start date")
    void updateProfileRejectsExperienceInvalidDates() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.of(testProfile));

        UpdateCareerProfileRequest request = new UpdateCareerProfileRequest();
        ExperienceDto exp = new ExperienceDto();
        exp.setCompanyName("Google");
        exp.setJobTitle("Software Engineer");
        exp.setStartDate("2023-01-01");
        exp.setEndDate("2022-01-01"); // Invalid!
        request.setExperience(List.of(exp));

        assertThatThrownBy(() -> profileService.updateProfile(userId, request))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("cannot be before start date for work experience");
    }

    @Test
    @DisplayName("updateProfile rejects project where end date is before start date")
    void updateProfileRejectsProjectInvalidDates() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.of(testProfile));

        UpdateCareerProfileRequest request = new UpdateCareerProfileRequest();
        ProjectDto proj = new ProjectDto();
        proj.setTitle("AI Engine");
        proj.setStartDate("2023-10-01");
        proj.setEndDate("2023-01-01"); // Invalid!
        request.setProjects(List.of(proj));

        assertThatThrownBy(() -> profileService.updateProfile(userId, request))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("cannot be before start date for project");
    }

    @Test
    @DisplayName("patchProfile partially updates only specified sections")
    void patchProfilePartiallyUpdatesOnlySpecifiedSections() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.of(testProfile));

        PatchCareerProfileRequest patch = new PatchCareerProfileRequest();
        PersonalInfoDto personal = new PersonalInfoDto();
        personal.setHeadline("Principal Cloud Architect");
        personal.setCountry("Canada");
        patch.setPersonalInfo(personal);

        profileService.patchProfile(userId, patch);

        assertThat(testProfile.getHeadline()).isEqualTo("Principal Cloud Architect");
        assertThat(testProfile.getCountry()).isEqualTo("Canada");
        // Verify education repository was not modified
        verify(educationRepository, never()).deleteByProfileId(any());
        verify(educationRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("getCompletion returns transparent section breakdown and actionable recommendations")
    void getCompletionReturnsBreakdown() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.of(testProfile));

        ProfileCompletionResponse completion = profileService.getCompletion(userId);

        assertThat(completion).isNotNull();
        assertThat(completion.getSectionBreakdown()).isNotEmpty();
        assertThat(completion.getSectionBreakdown().stream().map(SectionScoreDto::getSection).toList())
                .contains("Personal Information", "Education", "Skills", "Work Experience", "Projects", "Career Preferences");
    }
}
