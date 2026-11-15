package ai.jobachiever.profiles.service;

import ai.jobachiever.profiles.dto.*;
import ai.jobachiever.profiles.entity.CareerStage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Profile Completion Calculator Tests")
class ProfileCompletionCalculatorTest {

    private ProfileCompletionCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new ProfileCompletionCalculator();
    }

    @Test
    @DisplayName("Empty profile yields 0% completion with all incomplete sections and actionable recommendations")
    void emptyProfileYieldsZeroPercent() {
        ProfileCompletionResponse result = calculator.calculate(
                new PersonalInfoDto(),
                new ProfessionalSummaryDto("", "", CareerStage.MID_LEVEL, BigDecimal.ZERO),
                new ArrayList<>(),
                new ArrayList<>(),
                new ArrayList<>(),
                new ArrayList<>(),
                new ArrayList<>(),
                new ArrayList<>(),
                new CareerPreferencesDto()
        );

        assertThat(result.getCompletionPercentage()).isEqualTo(0);
        assertThat(result.getCompletedSections()).isEmpty();
        assertThat(result.getIncompleteSections()).hasSize(8);
        assertThat(result.getRecommendations()).hasSize(8);
    }

    @Test
    @DisplayName("Complete profile yields 100% completion and no incomplete sections")
    void completeProfileYields100Percent() {
        PersonalInfoDto personal = new PersonalInfoDto();
        personal.setHeadline("Senior Software Architect");
        personal.setLocation("San Francisco, CA");
        personal.setCountry("United States");
        personal.setLinkedinUrl("https://linkedin.com/in/janedoe");
        personal.setSummary("Seasoned software architect with 10+ years designing enterprise platforms.");

        ProfessionalSummaryDto summary = new ProfessionalSummaryDto(
                "Senior Software Architect",
                "Seasoned software architect with 10+ years designing enterprise platforms.",
                CareerStage.SENIOR,
                BigDecimal.valueOf(10.0)
        );

        EducationDto edu = new EducationDto();
        edu.setInstitution("UC Berkeley");
        edu.setDegree("B.S. Computer Science");
        List<EducationDto> educations = List.of(edu);

        SkillDto s1 = new SkillDto(); s1.setName("Java");
        SkillDto s2 = new SkillDto(); s2.setName("Spring Boot");
        SkillDto s3 = new SkillDto(); s3.setName("PostgreSQL");
        List<SkillDto> skills = List.of(s1, s2, s3);

        ExperienceDto exp = new ExperienceDto();
        exp.setCompanyName("Tech Corp");
        exp.setJobTitle("Staff Engineer");
        List<ExperienceDto> experiences = List.of(exp);

        ProjectDto proj = new ProjectDto();
        proj.setTitle("Cloud Migration Engine");
        proj.setDescription("Distributed migration service");
        List<ProjectDto> projects = List.of(proj);

        CertificationDto cert = new CertificationDto();
        cert.setName("AWS Solutions Architect");
        cert.setIssuingOrganization("Amazon");
        List<CertificationDto> certs = List.of(cert);

        CareerPreferencesDto prefs = new CareerPreferencesDto();
        prefs.setTargetRoles(List.of("Principal Architect"));
        prefs.setCareerGoals("Lead cloud transformation initiatives across Fortune 500 organizations.");

        ProfileCompletionResponse result = calculator.calculate(
                personal, summary, educations, skills, experiences, projects, certs, new ArrayList<>(), prefs
        );

        assertThat(result.getCompletionPercentage()).isEqualTo(100);
        assertThat(result.getIncompleteSections()).isEmpty();
        assertThat(result.getRecommendations()).isEmpty();
        assertThat(result.getCompletedSections()).hasSize(8);
    }

    @Test
    @DisplayName("Adaptive scoring for Student career stage without work experience allows 100% completion")
    void adaptiveScoringForStudentWithoutExperience() {
        PersonalInfoDto personal = new PersonalInfoDto();
        personal.setHeadline("Computer Science Undergraduate");
        personal.setLocation("Berkeley, CA");
        personal.setGithubUrl("https://github.com/student");
        personal.setSummary("Final-year CS student passionate about distributed systems and open source.");

        ProfessionalSummaryDto summary = new ProfessionalSummaryDto(
                "Computer Science Undergraduate",
                "Final-year CS student passionate about distributed systems and open source.",
                CareerStage.STUDENT,
                BigDecimal.ZERO
        );

        EducationDto edu = new EducationDto();
        edu.setInstitution("UC Berkeley");
        edu.setDegree("B.S. EECS");

        SkillDto s1 = new SkillDto(); s1.setName("C++");
        SkillDto s2 = new SkillDto(); s2.setName("Python");
        SkillDto s3 = new SkillDto(); s3.setName("Rust");

        ProjectDto proj = new ProjectDto();
        proj.setTitle("Raft Consensus Library");
        proj.setDescription("Implemented Raft consensus in Rust with leader election and log replication.");

        AchievementDto ach = new AchievementDto();
        ach.setTitle("Dean's Honors List");

        CareerPreferencesDto prefs = new CareerPreferencesDto();
        prefs.setTargetRoles(List.of("Software Engineer - Systems"));
        prefs.setCareerGoals("Contribute to high-performance open-source distributed systems.");

        ProfileCompletionResponse result = calculator.calculate(
                personal, summary, List.of(edu), List.of(s1, s2, s3),
                new ArrayList<>(), // 0 corporate experience
                List.of(proj), new ArrayList<>(), List.of(ach), prefs
        );

        assertThat(result.getCompletionPercentage()).isEqualTo(100);
        assertThat(result.getCompletedSections()).contains("Work Experience");
        SectionScoreDto expScore = result.getSectionBreakdown().stream()
                .filter(s -> s.getSection().equals("Work Experience"))
                .findFirst().orElseThrow();
        assertThat(expScore.isCompleted()).isTrue();
        assertThat(expScore.getDetails()).contains("Waived for Student/Entry-Level");
    }

    @Test
    @DisplayName("Non-student profile without experience is penalized for missing work history")
    void nonStudentWithoutExperienceIsPenalized() {
        PersonalInfoDto personal = new PersonalInfoDto();
        personal.setHeadline("Senior Software Architect");
        personal.setLocation("San Francisco, CA");
        personal.setLinkedinUrl("https://linkedin.com/in/janedoe");
        personal.setSummary("Seasoned software architect with 10+ years designing enterprise platforms.");

        ProfessionalSummaryDto summary = new ProfessionalSummaryDto(
                "Senior Software Architect",
                "Seasoned software architect with 10+ years designing enterprise platforms.",
                CareerStage.SENIOR,
                BigDecimal.valueOf(10)
        );

        EducationDto edu = new EducationDto();
        edu.setInstitution("Stanford");
        edu.setDegree("M.S. CS");

        SkillDto s1 = new SkillDto(); s1.setName("Java");
        SkillDto s2 = new SkillDto(); s2.setName("Kubernetes");
        SkillDto s3 = new SkillDto(); s3.setName("Kafka");

        ProjectDto proj = new ProjectDto();
        proj.setTitle("Event Router");
        proj.setDescription("High throughput Kafka message router");

        CertificationDto cert = new CertificationDto();
        cert.setName("CKA");
        cert.setIssuingOrganization("CNCF");

        CareerPreferencesDto prefs = new CareerPreferencesDto();
        prefs.setCareerGoals("Drive high-scale architecture strategies.");

        ProfileCompletionResponse result = calculator.calculate(
                personal, summary, List.of(edu), List.of(s1, s2, s3),
                new ArrayList<>(), // Missing corporate experience for SENIOR!
                List.of(proj), List.of(cert), new ArrayList<>(), prefs
        );

        // 100 - 15 = 85%
        assertThat(result.getCompletionPercentage()).isEqualTo(85);
        assertThat(result.getIncompleteSections()).contains("Work Experience");
        assertThat(result.getRecommendations()).anyMatch(r -> r.contains("work history"));
    }

    @Test
    @DisplayName("Graduated skill scoring awards 5% for 1 skill, 10% for 2 skills, 15% for 3+ skills")
    void graduatedSkillScoring() {
        SkillDto s1 = new SkillDto(); s1.setName("Java");
        SkillDto s2 = new SkillDto(); s2.setName("Spring");
        SkillDto s3 = new SkillDto(); s3.setName("Postgres");

        ProfileCompletionResponse r1 = calculator.calculate(null, null, null, List.of(s1), null, null, null, null, null);
        assertThat(r1.getSectionBreakdown().stream().filter(s -> s.getSection().equals("Skills")).findFirst().get().getEarned()).isEqualTo(5);

        ProfileCompletionResponse r2 = calculator.calculate(null, null, null, List.of(s1, s2), null, null, null, null, null);
        assertThat(r2.getSectionBreakdown().stream().filter(s -> s.getSection().equals("Skills")).findFirst().get().getEarned()).isEqualTo(10);

        ProfileCompletionResponse r3 = calculator.calculate(null, null, null, List.of(s1, s2, s3), null, null, null, null, null);
        assertThat(r3.getSectionBreakdown().stream().filter(s -> s.getSection().equals("Skills")).findFirst().get().getEarned()).isEqualTo(15);
    }
}
