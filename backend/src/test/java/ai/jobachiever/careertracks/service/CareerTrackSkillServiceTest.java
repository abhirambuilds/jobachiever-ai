package ai.jobachiever.careertracks.service;

import ai.jobachiever.careertracks.dto.SkillMatchResult;
import ai.jobachiever.profiles.dto.ExperienceDto;
import ai.jobachiever.profiles.dto.ProjectDto;
import ai.jobachiever.profiles.entity.ProfileExperience;
import ai.jobachiever.profiles.entity.ProfileProject;
import ai.jobachiever.profiles.entity.ProfileSkill;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Career Track Skill Service Tests")
class CareerTrackSkillServiceTest {

    private CareerTrackSkillService skillService;

    @BeforeEach
    void setUp() {
        skillService = new CareerTrackSkillServiceImpl(new ObjectMapper());
    }

    @Test
    @DisplayName("Skill matching accurately matches required and preferred skills case-insensitively")
    void skillMatchingCaseInsensitiveAndSeparated() {
        ProfileSkill s1 = new ProfileSkill(); s1.setName("Java");
        ProfileSkill s2 = new ProfileSkill(); s2.setName("Spring Boot");
        ProfileSkill s3 = new ProfileSkill(); s3.setName("MySQL");
        ProfileSkill s4 = new ProfileSkill(); s4.setName("Python");
        List<ProfileSkill> masterSkills = List.of(s1, s2, s3, s4);

        List<String> requiredSkills = List.of("java", "Spring-Boot", "PostgreSQL");
        List<String> preferredSkills = List.of("Docker", "python");

        SkillMatchResult result = skillService.matchSkills(requiredSkills, preferredSkills, masterSkills);

        assertThat(result.getMatchedRequiredSkills()).containsExactlyInAnyOrder("Java", "Spring Boot");
        assertThat(result.getMissingRequiredSkills()).containsExactly("PostgreSQL");
        assertThat(result.getMatchedPreferredSkills()).containsExactly("Python");
        assertThat(result.getMissingPreferredSkills()).containsExactly("Docker");
        assertThat(result.getAdditionalProfileSkills()).containsExactly("MySQL");

        // 2 matched out of 3 required = 67%
        assertThat(result.getRequiredSkillMatchPercentage()).isEqualTo(67);
        // 3 matched out of 5 total track skills = 60%
        assertThat(result.getOverallSkillMatchPercentage()).isEqualTo(60);
    }

    @Test
    @DisplayName("Skill matching normalizes canonical tech aliases like reactjs and k8s")
    void skillMatchingCanonicalAliases() {
        ProfileSkill s1 = new ProfileSkill(); s1.setName("Kubernetes");
        ProfileSkill s2 = new ProfileSkill(); s2.setName("React");
        ProfileSkill s3 = new ProfileSkill(); s3.setName("PostgreSQL");
        List<ProfileSkill> masterSkills = List.of(s1, s2, s3);

        List<String> required = List.of("k8s", "react.js", "postgres");

        SkillMatchResult result = skillService.matchSkills(required, List.of(), masterSkills);

        assertThat(result.getMatchedRequiredSkills()).containsExactlyInAnyOrder("Kubernetes", "React", "PostgreSQL");
        assertThat(result.getMissingRequiredSkills()).isEmpty();
        assertThat(result.getRequiredSkillMatchPercentage()).isEqualTo(100);
    }

    @Test
    @DisplayName("DeduplicateSkills eliminates whitespace and case-insensitive duplicates")
    void deduplicateSkillsRemovesDuplicates() {
        List<String> input = List.of("Java", "java", " JAVA ", "Spring Boot", "springboot", "Docker");
        List<String> unique = skillService.deduplicateSkills(input);

        // "Java", "java", " JAVA " should reduce to 1 ("Java")
        // "Spring Boot", "springboot" should reduce to 1 ("Spring Boot")
        // "Docker" = 1
        assertThat(unique).hasSize(3);
        assertThat(unique).containsExactly("Java", "Spring Boot", "Docker");
    }

    @Test
    @DisplayName("findRelevantProjects identifies projects by technologies and descriptions")
    void findRelevantProjectsMatchesCorrectly() {
        ProfileProject p1 = new ProfileProject();
        p1.setTitle("Vector Search Engine");
        p1.setDescription("Built FastAPI semantic search with pgvector");
        p1.setTechnologies("[\"Python\", \"FastAPI\", \"PostgreSQL\"]");

        ProfileProject p2 = new ProfileProject();
        p2.setTitle("E-Commerce Microservices");
        p2.setDescription("High throughput order processing");
        p2.setTechnologies("[\"Java\", \"Spring Boot\", \"Kafka\"]");

        ProfileProject p3 = new ProfileProject();
        p3.setTitle("Personal Blog");
        p3.setDescription("Static HTML portfolio");
        p3.setTechnologies("[\"HTML\", \"CSS\"]");

        List<ProjectDto> relevant = skillService.findRelevantProjects(
                List.of("Java", "Spring Boot", "Kafka"),
                "Backend Engineer",
                List.of(p1, p2, p3)
        );

        assertThat(relevant).hasSize(1);
        assertThat(relevant.get(0).getTitle()).isEqualTo("E-Commerce Microservices");
    }

    @Test
    @DisplayName("findRelevantExperiences identifies work experiences matching track skills")
    void findRelevantExperiencesMatchesCorrectly() {
        ProfileExperience e1 = new ProfileExperience();
        e1.setJobTitle("Senior Backend Engineer");
        e1.setCompanyName("CloudCorp");
        e1.setDescription("Engineered microservices using Spring Boot and Postgres.");
        e1.setAchievements("[\"Decreased p99 latency by 40%\"]");

        ProfileExperience e2 = new ProfileExperience();
        e2.setJobTitle("Marketing Coordinator");
        e2.setCompanyName("AdAgency");
        e2.setDescription("Managed social media campaigns.");

        List<ExperienceDto> relevant = skillService.findRelevantExperiences(
                List.of("Spring Boot", "PostgreSQL"),
                "Senior Backend Engineer",
                List.of(e1, e2)
        );

        assertThat(relevant).hasSize(1);
        assertThat(relevant.get(0).getCompanyName()).isEqualTo("CloudCorp");
        assertThat(relevant.get(0).getJobTitle()).isEqualTo("Senior Backend Engineer");
    }
}
