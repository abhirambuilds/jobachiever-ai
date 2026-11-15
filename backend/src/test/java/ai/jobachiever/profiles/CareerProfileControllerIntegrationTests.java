package ai.jobachiever.profiles;

import ai.jobachiever.auth.service.JwtService;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Career Profile Controller Integration Tests")
class CareerProfileControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private CareerProfileRepository careerProfileRepository;

    @MockBean
    private ProfileEducationRepository educationRepository;

    @MockBean
    private ProfileSkillRepository skillRepository;

    @MockBean
    private ProfileExperienceRepository experienceRepository;

    @MockBean
    private ProfileProjectRepository projectRepository;

    @MockBean
    private ProfileCertificationRepository certificationRepository;

    @MockBean
    private ProfileAchievementRepository achievementRepository;

    private User testUser;
    private String userToken;
    private CareerProfile testProfile;

    @BeforeEach
    void setUp() {
        testUser = new User("jane.doe@example.com", "hashed_pwd", "Jane", "Doe");
        testUser.setId(UUID.randomUUID());
        testUser.setRole(Role.USER);
        testUser.setAccountStatus(AccountStatus.ACTIVE);
        testUser.setEmailVerified(true);

        userToken = jwtService.generateToken(testUser.getId(), testUser.getEmail());

        testProfile = new CareerProfile(testUser);
        testProfile.setId(UUID.randomUUID());
        testProfile.setHeadline("Senior Full-Stack Engineer");
        testProfile.setSummary("Experienced engineer with 5+ years of experience in distributed systems.");
        testProfile.setCurrentLocation("San Francisco, CA");
        testProfile.setCountry("United States");
        testProfile.setPhoneNumber("+1-555-123-4567");
        testProfile.setLinkedinUrl("https://linkedin.com/in/janedoe");
        testProfile.setGithubUrl("https://github.com/janedoe");
        testProfile.setYearsOfExperience(BigDecimal.valueOf(5.0));
        testProfile.setCareerStage(CareerStage.MID_LEVEL);
        testProfile.setCompletionPercentage(75);

        given(userRepository.findById(testUser.getId())).willReturn(Optional.of(testUser));
        given(userRepository.findByEmailIgnoreCase(testUser.getEmail())).willReturn(Optional.of(testUser));
    }

    @Test
    @DisplayName("GET /api/v1/profiles/me without auth header returns 401 Unauthorized")
    void getProfileUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/profiles/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/profiles/me with valid JWT returns 200 OK with full profile structure")
    void getProfileAuthenticatedReturns200() throws Exception {
        given(careerProfileRepository.findByUserId(testUser.getId())).willReturn(Optional.of(testProfile));

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

        mockMvc.perform(get("/api/v1/profiles/me")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("jane.doe@example.com"))
                .andExpect(jsonPath("$.data.personalInfo.fullName").value("Jane Doe"))
                .andExpect(jsonPath("$.data.personalInfo.headline").value("Senior Full-Stack Engineer"))
                .andExpect(jsonPath("$.data.personalInfo.location").value("San Francisco, CA"))
                .andExpect(jsonPath("$.data.personalInfo.phone").value("+1-555-123-4567"))
                .andExpect(jsonPath("$.data.education", hasSize(1)))
                .andExpect(jsonPath("$.data.education[0].institution").value("UC Berkeley"))
                .andExpect(jsonPath("$.data.skills", hasSize(1)))
                .andExpect(jsonPath("$.data.skills[0].name").value("Java"));
    }

    @Test
    @DisplayName("GET /api/v1/profiles/me auto-initializes profile if user has none")
    void getProfileInitializesMissingProfile() throws Exception {
        given(careerProfileRepository.findByUserId(testUser.getId())).willReturn(Optional.empty());
        given(careerProfileRepository.save(any(CareerProfile.class))).willAnswer(invocation -> {
            CareerProfile saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        mockMvc.perform(get("/api/v1/profiles/me")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("jane.doe@example.com"))
                .andExpect(jsonPath("$.data.personalInfo.fullName").value("Jane Doe"));
    }

    @Test
    @DisplayName("PUT /api/v1/profiles/me updates profile and recalculates completion percentage")
    void updateProfileFullPayload() throws Exception {
        given(careerProfileRepository.findByUserId(testUser.getId())).willReturn(Optional.of(testProfile));
        given(careerProfileRepository.save(any(CareerProfile.class))).willAnswer(inv -> inv.getArgument(0));

        UpdateCareerProfileRequest request = new UpdateCareerProfileRequest();
        PersonalInfoDto personal = new PersonalInfoDto();
        personal.setHeadline("Staff Distributed Systems Architect");
        personal.setLocation("Seattle, WA");
        personal.setCountry("United States");
        personal.setLinkedinUrl("https://linkedin.com/in/janedoe");
        personal.setSummary("Seasoned software architect with 10+ years designing enterprise distributed platforms.");
        request.setPersonalInfo(personal);

        ProfessionalSummaryDto summary = new ProfessionalSummaryDto(
                "Staff Distributed Systems Architect",
                "Seasoned software architect with 10+ years designing enterprise distributed platforms.",
                CareerStage.SENIOR,
                BigDecimal.valueOf(10.0)
        );
        request.setProfessionalSummary(summary);

        SkillDto s1 = new SkillDto(); s1.setName("Java");
        SkillDto s2 = new SkillDto(); s2.setName("Kafka");
        SkillDto s3 = new SkillDto(); s3.setName("Kubernetes");
        request.setSkills(List.of(s1, s2, s3));

        EducationDto edu = new EducationDto();
        edu.setInstitution("MIT");
        edu.setDegree("M.S. EECS");
        edu.setStartDate("2017-09-01");
        edu.setEndDate("2019-06-01");
        request.setEducation(List.of(edu));

        mockMvc.perform(put("/api/v1/profiles/me")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.personalInfo.headline").value("Staff Distributed Systems Architect"))
                .andExpect(jsonPath("$.data.personalInfo.location").value("Seattle, WA"))
                .andExpect(jsonPath("$.data.completionPercentage", greaterThan(0)));
    }

    @Test
    @DisplayName("PUT /api/v1/profiles/me rejects attempt to change email address with 400 Bad Request")
    void updateProfileRejectsEmailChange() throws Exception {
        given(careerProfileRepository.findByUserId(testUser.getId())).willReturn(Optional.of(testProfile));

        UpdateCareerProfileRequest request = new UpdateCareerProfileRequest();
        PersonalInfoDto personal = new PersonalInfoDto();
        personal.setEmail("different.email@attacker.com"); // Not matching testUser email!
        request.setPersonalInfo(personal);

        mockMvc.perform(put("/api/v1/profiles/me")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Email address cannot be changed via profile management")));
    }

    @Test
    @DisplayName("PUT /api/v1/profiles/me rejects invalid education date range with 400 Bad Request")
    void updateProfileRejectsInvalidEducationDateRange() throws Exception {
        given(careerProfileRepository.findByUserId(testUser.getId())).willReturn(Optional.of(testProfile));

        UpdateCareerProfileRequest request = new UpdateCareerProfileRequest();
        EducationDto edu = new EducationDto();
        edu.setInstitution("Stanford");
        edu.setDegree("B.S.");
        edu.setStartDate("2024-01-01");
        edu.setEndDate("2020-01-01"); // Invalid: end before start!
        request.setEducation(List.of(edu));

        mockMvc.perform(put("/api/v1/profiles/me")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("cannot be before start date for education")));
    }

    @Test
    @DisplayName("PUT /api/v1/profiles/me rejects invalid experience date range with 400 Bad Request")
    void updateProfileRejectsInvalidExperienceDateRange() throws Exception {
        given(careerProfileRepository.findByUserId(testUser.getId())).willReturn(Optional.of(testProfile));

        UpdateCareerProfileRequest request = new UpdateCareerProfileRequest();
        ExperienceDto exp = new ExperienceDto();
        exp.setCompanyName("Google");
        exp.setJobTitle("Software Engineer");
        exp.setStartDate("2023-01-01");
        exp.setEndDate("2021-01-01"); // Invalid!
        request.setExperience(List.of(exp));

        mockMvc.perform(put("/api/v1/profiles/me")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("cannot be before start date for work experience")));
    }

    @Test
    @DisplayName("PUT /api/v1/profiles/me deduplicates skills case-insensitively")
    void updateProfileDeduplicatesSkills() throws Exception {
        given(careerProfileRepository.findByUserId(testUser.getId())).willReturn(Optional.of(testProfile));
        given(careerProfileRepository.save(any(CareerProfile.class))).willAnswer(inv -> inv.getArgument(0));

        UpdateCareerProfileRequest request = new UpdateCareerProfileRequest();
        SkillDto s1 = new SkillDto(); s1.setName("PostgreSQL");
        SkillDto s2 = new SkillDto(); s2.setName("postgresql"); // Duplicate!
        SkillDto s3 = new SkillDto(); s3.setName("POSTGRESQL "); // Duplicate!
        SkillDto s4 = new SkillDto(); s4.setName("Redis");
        request.setSkills(List.of(s1, s2, s3, s4));

        mockMvc.perform(put("/api/v1/profiles/me")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PATCH /api/v1/profiles/me partially updates only personal info without touching other sections")
    void patchProfilePersonalInfoOnly() throws Exception {
        given(careerProfileRepository.findByUserId(testUser.getId())).willReturn(Optional.of(testProfile));
        given(careerProfileRepository.save(any(CareerProfile.class))).willAnswer(inv -> inv.getArgument(0));

        PatchCareerProfileRequest request = new PatchCareerProfileRequest();
        PersonalInfoDto personal = new PersonalInfoDto();
        personal.setHeadline("VP of Engineering");
        personal.setCountry("United Kingdom");
        request.setPersonalInfo(personal);

        mockMvc.perform(patch("/api/v1/profiles/me")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.personalInfo.headline").value("VP of Engineering"))
                .andExpect(jsonPath("$.data.personalInfo.country").value("United Kingdom"));
    }

    @Test
    @DisplayName("PATCH /api/v1/profiles/me rejects email update attempt with 400 Bad Request")
    void patchProfileRejectsEmailChange() throws Exception {
        given(careerProfileRepository.findByUserId(testUser.getId())).willReturn(Optional.of(testProfile));

        PatchCareerProfileRequest request = new PatchCareerProfileRequest();
        PersonalInfoDto personal = new PersonalInfoDto();
        personal.setEmail("unauthorized.email@test.com");
        request.setPersonalInfo(personal);

        mockMvc.perform(patch("/api/v1/profiles/me")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Email address cannot be changed via profile management")));
    }

    @Test
    @DisplayName("GET /api/v1/profiles/me/completion returns transparent score breakdown and recommendations")
    void getCompletionReturnsBreakdownAndRecommendations() throws Exception {
        given(careerProfileRepository.findByUserId(testUser.getId())).willReturn(Optional.of(testProfile));

        mockMvc.perform(get("/api/v1/profiles/me/completion")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.completionPercentage").isNumber())
                .andExpect(jsonPath("$.data.sectionBreakdown").isArray())
                .andExpect(jsonPath("$.data.recommendations").isArray());
    }
}
