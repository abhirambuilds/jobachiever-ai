package ai.jobachiever.database;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.yaml.snakeyaml.Yaml;

import javax.sql.DataSource;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("PostgreSQL & Flyway Infrastructure Tests")
class DatabaseInfrastructureTests {

    @Autowired
    private ApplicationContext applicationContext;

    @Test
    @DisplayName("Application context loads in test profile without a running PostgreSQL instance")
    void testProfileDoesNotRequireRunningPostgresInstance() {
        assertThat(applicationContext).isNotNull();

        // In the test profile, DataSource and Flyway autoconfigurations are safely excluded
        // so no connection to PostgreSQL 5432 is attempted during unit/controller testing.
        assertThatThrownBy(() -> applicationContext.getBean(DataSource.class))
                .isInstanceOf(NoSuchBeanDefinitionException.class);

        assertThatThrownBy(() -> applicationContext.getBean("flyway"))
                .isInstanceOf(NoSuchBeanDefinitionException.class);
    }

    @Test
    @DisplayName("Flyway V1 migration exists, is well-formed, and safely handles pgvector")
    void flywayMigrationV1ExistsAndConfigured() throws Exception {
        ClassPathResource resource = new ClassPathResource("db/migration/V1__create_database_extensions.sql");
        assertThat(resource.exists())
                .as("Flyway V1 migration file should exist in db/migration/")
                .isTrue();

        String sqlContent;
        try (InputStream is = resource.getInputStream()) {
            sqlContent = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }

        // Verify UUID extensions
        assertThat(sqlContent).contains("uuid-ossp");
        assertThat(sqlContent).contains("pgcrypto");

        // Verify defensive pgvector check (does not fail when pgvector is unavailable)
        assertThat(sqlContent).contains("pg_available_extensions WHERE name = 'vector'");
        assertThat(sqlContent).contains("CREATE EXTENSION IF NOT EXISTS \"vector\"");
    }

    @Test
    @DisplayName("Application configuration validates Flyway, HikariCP, and JPA settings")
    void applicationConfigurationContainsExpectedDatabaseProperties() throws Exception {
        ClassPathResource resource = new ClassPathResource("application.yml");
        assertThat(resource.exists()).isTrue();

        Yaml yaml = new Yaml();
        Map<String, Object> config;
        try (InputStream is = resource.getInputStream()) {
            config = yaml.load(is);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> spring = (Map<String, Object>) config.get("spring");
        assertThat(spring).isNotNull();

        // Datasource properties check
        @SuppressWarnings("unchecked")
        Map<String, Object> datasource = (Map<String, Object>) spring.get("datasource");
        assertThat(datasource).isNotNull();
        assertThat(datasource.get("driver-class-name")).isEqualTo("org.postgresql.Driver");

        // HikariCP pool check
        @SuppressWarnings("unchecked")
        Map<String, Object> hikari = (Map<String, Object>) datasource.get("hikari");
        assertThat(hikari).isNotNull();
        assertThat(hikari.get("pool-name")).isEqualTo("JobAchieverHikariPool");
        assertThat(hikari.get("maximum-pool-size")).isEqualTo(10);
        assertThat(hikari.get("connection-timeout")).isEqualTo(30000);

        // JPA validation check
        @SuppressWarnings("unchecked")
        Map<String, Object> jpa = (Map<String, Object>) spring.get("jpa");
        assertThat(jpa).isNotNull();
        assertThat(jpa.get("show-sql")).isEqualTo(false);
        assertThat(jpa.get("open-in-view")).isEqualTo(false);

        @SuppressWarnings("unchecked")
        Map<String, Object> hibernate = (Map<String, Object>) jpa.get("hibernate");
        assertThat(hibernate).isNotNull();
        assertThat(hibernate.get("ddl-auto")).isEqualTo("validate");

        // Flyway properties check
        @SuppressWarnings("unchecked")
        Map<String, Object> flyway = (Map<String, Object>) spring.get("flyway");
        assertThat(flyway).isNotNull();
        assertThat(flyway.get("enabled")).isEqualTo(true);
        assertThat(flyway.get("baseline-on-migrate")).isEqualTo(true);
        assertThat(flyway.get("locations")).isEqualTo("classpath:db/migration");
    }

    @Test
    @DisplayName("Docker Compose YAML is syntactically valid and configured securely for PostgreSQL 16")
    void dockerComposeYamlIsSyntacticallyValid() throws Exception {
        Path composePath = findWorkspaceFile("infrastructure/docker/docker-compose.yml");
        assertThat(Files.exists(composePath))
                .as("docker-compose.yml should exist at infrastructure/docker/docker-compose.yml")
                .isTrue();

        Yaml yaml = new Yaml();
        Map<String, Object> compose;
        try (InputStream is = new FileInputStream(composePath.toFile())) {
            compose = yaml.load(is);
        }

        assertThat(compose).isNotNull();

        // Check services
        @SuppressWarnings("unchecked")
        Map<String, Object> services = (Map<String, Object>) compose.get("services");
        assertThat(services).isNotNull();
        assertThat(services).containsKey("postgres");

        @SuppressWarnings("unchecked")
        Map<String, Object> postgres = (Map<String, Object>) services.get("postgres");
        assertThat(postgres.get("image")).isEqualTo("pgvector/pgvector:pg16");
        assertThat(postgres.get("container_name")).isEqualTo("jobachiever-postgres");
        assertThat(postgres.get("restart")).isEqualTo("unless-stopped");

        // Check port is bound locally (127.0.0.1) to avoid public exposure
        @SuppressWarnings("unchecked")
        List<String> ports = (List<String>) postgres.get("ports");
        assertThat(ports).isNotEmpty();
        assertThat(ports.get(0)).startsWith("127.0.0.1:");

        // Check persistent named volumes
        @SuppressWarnings("unchecked")
        List<String> volumes = (List<String>) postgres.get("volumes");
        assertThat(volumes).isNotEmpty();
        assertThat(volumes.get(0)).contains("postgres_data:");

        @SuppressWarnings("unchecked")
        Map<String, Object> topVolumes = (Map<String, Object>) compose.get("volumes");
        assertThat(topVolumes).containsKey("postgres_data");
    }

    @Test
    @DisplayName("Docker Compose database healthcheck is properly configured with pg_isready")
    void dockerComposeHealthCheckIsCorrect() throws Exception {
        Path composePath = findWorkspaceFile("infrastructure/docker/docker-compose.yml");
        assertThat(Files.exists(composePath)).isTrue();

        Yaml yaml = new Yaml();
        Map<String, Object> compose;
        try (InputStream is = new FileInputStream(composePath.toFile())) {
            compose = yaml.load(is);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> services = (Map<String, Object>) compose.get("services");
        @SuppressWarnings("unchecked")
        Map<String, Object> postgres = (Map<String, Object>) services.get("postgres");

        @SuppressWarnings("unchecked")
        Map<String, Object> healthcheck = (Map<String, Object>) postgres.get("healthcheck");
        assertThat(healthcheck).isNotNull();

        @SuppressWarnings("unchecked")
        List<String> testCmd = (List<String>) healthcheck.get("test");
        assertThat(testCmd).isNotEmpty();
        String commandStr = String.join(" ", testCmd);
        assertThat(commandStr).contains("pg_isready");

        assertThat(healthcheck.get("interval")).isEqualTo("5s");
        assertThat(healthcheck.get("timeout")).isEqualTo("5s");
        assertThat(healthcheck.get("retries")).isEqualTo(5);
    }

    private Path findWorkspaceFile(String relativePath) {
        // Try direct relative to process working directory or traverse upward
        Path path = Paths.get(relativePath);
        if (Files.exists(path)) {
            return path;
        }
        path = Paths.get("..", relativePath);
        if (Files.exists(path)) {
            return path;
        }
        path = Paths.get("../..", relativePath);
        if (Files.exists(path)) {
            return path;
        }
        return Paths.get(relativePath);
    }
}
