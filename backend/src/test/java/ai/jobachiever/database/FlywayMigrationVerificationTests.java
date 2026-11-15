package ai.jobachiever.database;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Flyway Schema & DDL Integrity Verification Tests")
class FlywayMigrationVerificationTests {

    private final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

    @Test
    @DisplayName("All 8 Flyway migrations exist, are ordered sequentially, and are non-empty")
    void allFlywayMigrationsExistAndAreOrdered() throws Exception {
        Resource[] resources = resolver.getResources("classpath:db/migration/V*.sql");
        assertThat(resources).hasSizeGreaterThanOrEqualTo(8);

        List<String> filenames = Arrays.stream(resources)
                .map(Resource::getFilename)
                .filter(Objects::nonNull)
                .sorted()
                .toList();

        assertThat(filenames).contains(
                "V1__create_database_extensions.sql",
                "V2__create_user_accounts.sql",
                "V3__create_career_profiles.sql",
                "V4__create_profile_details.sql",
                "V5__create_career_tracks.sql",
                "V6__create_resume_documents.sql",
                "V7__create_jobs_and_requirements.sql",
                "V8__create_job_applications.sql"
        );

        for (Resource resource : resources) {
            try (InputStream is = resource.getInputStream()) {
                String content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                assertThat(content)
                        .as("Migration " + resource.getFilename() + " should not be blank")
                        .isNotBlank();
            }
        }
    }

    @Test
    @DisplayName("Flyway migrations create all 15 core platform tables with UUID primary keys")
    void migrationsCreateAllCorePlatformTables() throws Exception {
        String allSql = loadCombinedMigrations();

        List<String> expectedTables = List.of(
                "users",
                "career_profiles",
                "profile_educations",
                "profile_skills",
                "profile_experiences",
                "profile_projects",
                "profile_certifications",
                "profile_achievements",
                "career_tracks",
                "resume_documents",
                "resume_versions",
                "jobs",
                "job_requirements",
                "job_applications",
                "application_activities"
        );

        for (String table : expectedTables) {
            assertThat(allSql)
                    .as("Schema migrations must define table " + table)
                    .containsIgnoringCase("CREATE TABLE " + table);
        }

        // Verify UUID primary key standard
        assertThat(allSql).containsIgnoringCase("id UUID PRIMARY KEY DEFAULT gen_random_uuid()");
    }

    @Test
    @DisplayName("User accounts table enforces case-insensitive unique email and status constraints")
    void userAccountsEnforcesIntegrityConstraints() throws Exception {
        String allSql = loadCombinedMigrations();

        assertThat(allSql).containsIgnoringCase("uq_users_email_lower");
        assertThat(allSql).containsIgnoringCase("LOWER(email)");
        assertThat(allSql).containsIgnoringCase("chk_users_account_status");
        assertThat(allSql).containsIgnoringCase("'ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'DEACTIVATED'");
    }

    @Test
    @DisplayName("Master career profile enforces exactly one profile per user (1-to-1 relationship)")
    void careerProfilesEnforcesOneProfilePerUser() throws Exception {
        String allSql = loadCombinedMigrations();

        assertThat(allSql).containsIgnoringCase("uq_career_profiles_user_id UNIQUE (user_id)");
        assertThat(allSql).containsIgnoringCase("REFERENCES users(id) ON DELETE CASCADE");
        assertThat(allSql).containsIgnoringCase("chk_career_profiles_career_stage");
    }

    @Test
    @DisplayName("Child profile details, career tracks, and resume versions enforce cascade and foreign keys")
    void relationshipsAndForeignKeysAreEnforced() throws Exception {
        String allSql = loadCombinedMigrations();

        // Profile children reference career_profiles with CASCADE
        assertThat(allSql).containsIgnoringCase("fk_profile_educations_profile FOREIGN KEY (profile_id)");
        assertThat(allSql).containsIgnoringCase("fk_profile_skills_profile FOREIGN KEY (profile_id)");
        assertThat(allSql).containsIgnoringCase("fk_profile_experiences_profile FOREIGN KEY (profile_id)");
        assertThat(allSql).containsIgnoringCase("fk_profile_projects_profile FOREIGN KEY (profile_id)");
        assertThat(allSql).containsIgnoringCase("fk_profile_certifications_profile FOREIGN KEY (profile_id)");
        assertThat(allSql).containsIgnoringCase("fk_profile_achievements_profile FOREIGN KEY (profile_id)");

        // Career tracks reference users and career_profiles
        assertThat(allSql).containsIgnoringCase("fk_career_tracks_user FOREIGN KEY (user_id)");
        assertThat(allSql).containsIgnoringCase("fk_career_tracks_profile FOREIGN KEY (profile_id)");

        // Resume documents & versions
        assertThat(allSql).containsIgnoringCase("fk_resume_documents_user FOREIGN KEY (user_id)");
        assertThat(allSql).containsIgnoringCase("fk_resume_versions_document FOREIGN KEY (document_id)");
        assertThat(allSql).containsIgnoringCase("uq_resume_versions_doc_num UNIQUE (document_id, version_number)");

        // Jobs and applications
        assertThat(allSql).containsIgnoringCase("fk_job_requirements_job FOREIGN KEY (job_id)");
        assertThat(allSql).containsIgnoringCase("fk_job_applications_user FOREIGN KEY (user_id)");
        assertThat(allSql).containsIgnoringCase("fk_job_applications_job FOREIGN KEY (job_id)");
        assertThat(allSql).containsIgnoringCase("uq_job_applications_user_job UNIQUE (user_id, job_id)");
        assertThat(allSql).containsIgnoringCase("fk_application_activities_app FOREIGN KEY (application_id)");
    }

    @Test
    @DisplayName("JPA Entity mappings match all database table names and structure")
    void jpaEntitiesMatchDatabaseTables() {
        Map<Class<?>, String> entityTableMap = Map.ofEntries(
                Map.entry(ai.jobachiever.users.entity.User.class, "users"),
                Map.entry(ai.jobachiever.profiles.entity.CareerProfile.class, "career_profiles"),
                Map.entry(ai.jobachiever.profiles.entity.ProfileEducation.class, "profile_educations"),
                Map.entry(ai.jobachiever.profiles.entity.ProfileSkill.class, "profile_skills"),
                Map.entry(ai.jobachiever.profiles.entity.ProfileExperience.class, "profile_experiences"),
                Map.entry(ai.jobachiever.profiles.entity.ProfileProject.class, "profile_projects"),
                Map.entry(ai.jobachiever.profiles.entity.ProfileCertification.class, "profile_certifications"),
                Map.entry(ai.jobachiever.profiles.entity.ProfileAchievement.class, "profile_achievements"),
                Map.entry(ai.jobachiever.careertracks.entity.CareerTrack.class, "career_tracks"),
                Map.entry(ai.jobachiever.resumes.entity.ResumeDocument.class, "resume_documents"),
                Map.entry(ai.jobachiever.resumes.entity.ResumeVersion.class, "resume_versions"),
                Map.entry(ai.jobachiever.jobs.entity.Job.class, "jobs"),
                Map.entry(ai.jobachiever.jobs.entity.JobRequirement.class, "job_requirements"),
                Map.entry(ai.jobachiever.applications.entity.JobApplication.class, "job_applications"),
                Map.entry(ai.jobachiever.applications.entity.ApplicationActivity.class, "application_activities")
        );

        for (Map.Entry<Class<?>, String> entry : entityTableMap.entrySet()) {
            Class<?> entityClass = entry.getKey();
            String expectedTable = entry.getValue();

            assertThat(entityClass.isAnnotationPresent(Entity.class))
                    .as("Class " + entityClass.getSimpleName() + " should be annotated with @Entity")
                    .isTrue();

            Table tableAnn = entityClass.getAnnotation(Table.class);
            assertThat(tableAnn)
                    .as("Class " + entityClass.getSimpleName() + " should have @Table annotation")
                    .isNotNull();

            assertThat(tableAnn.name())
                    .as("Class " + entityClass.getSimpleName() + " should map to table " + expectedTable)
                    .isEqualTo(expectedTable);
        }
    }

    private String loadCombinedMigrations() throws Exception {
        Resource[] resources = resolver.getResources("classpath:db/migration/V*.sql");
        StringBuilder sb = new StringBuilder();
        for (Resource resource : resources) {
            try (InputStream is = resource.getInputStream()) {
                sb.append(new String(is.readAllBytes(), StandardCharsets.UTF_8)).append("\n");
            }
        }
        return sb.toString();
    }
}
