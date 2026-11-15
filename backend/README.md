# JobAchiever AI — Spring Boot Backend & Database Infrastructure

**Service:** `jobachiever-backend`  
**Architecture:** Single Source of Truth for User Identity, Master Profile, Career Tracks, and Persistence  
**Technology Stack:** Java 21 LTS, Spring Boot 3.3.5, Spring Security 6.x, Spring Data JPA, Flyway 10.x, HikariCP, PostgreSQL 16 with pgvector  

---

## 1. Overview

The `backend` module represents the core primary backend and authoritative source of truth for JobAchiever AI. It owns:
- User identity, credentials, registration, and JWT token issuance.
- Master Career Profiles, multi-track career personas, and verified skills.
- Document storage dispatch, resume versioning, and processing statuses.
- Job postings, decomposed JD requirements, and application pipelines.
- Relational schema migrations via Flyway with semantic search preparation (`pgvector`).

The companion Python FastAPI service (`ai-service/`) operates as a stateless AI computation microservice dispatched by this backend.

---

## 2. Technology Requirements

- **Java Development Kit (JDK):** Java 21 LTS (e.g. Eclipse Adoptium Temurin 21).
- **Build Tool:** Apache Maven 3.9+ or the included Maven Wrapper (`./mvnw` or `mvnw.cmd`).
- **Database Engine:** PostgreSQL 16+ (supplied locally via Docker Compose or native install).
- **Extensions:** `uuid-ossp`, `pgcrypto`, and `vector` (`pgvector` for AI semantic matching).

---

## 3. Project Structure

```
backend/
├── pom.xml                               # Maven project descriptor (Spring Boot 3.3.5, Flyway 10, JPA)
├── mvnw / mvnw.cmd                       # Maven Wrapper scripts (POSIX & Windows)
├── .mvn/wrapper/                         # Wrapper configuration and properties
├── src/
│   ├── main/
│   │   ├── java/ai/jobachiever/
│   │   │   ├── JobAchieverApplication.java # Spring Boot main entry point
│   │   │   ├── common/
│   │   │   │   ├── config/              # SecurityConfig, CorsConfig
│   │   │   │   ├── exception/           # GlobalExceptionHandler, ResourceNotFoundException
│   │   │   │   └── response/            # HealthResponse, ApiResponse, ErrorResponse
│   │   │   ├── health/
│   │   │   │   └── HealthController.java # Public GET /api/v1/health endpoint
│   │   │   ├── auth/                    # Authentication domain module
│   │   │   ├── users/                   # User accounts & preferences domain module
│   │   │   ├── profiles/                # Master Career Profile domain module
│   │   │   ├── careertracks/            # Multi-track career personas domain module
│   │   │   ├── resumes/                 # Resume & document metadata domain module
│   │   │   ├── jobs/                    # Job postings & JD decomposition domain module
│   │   │   └── applications/            # Job application tracking pipeline module
│   │   └── resources/
│   │       ├── application.yml          # Primary application configuration (HikariCP, Flyway, JPA)
│   │       ├── application-local.yml    # Local development profile
│   │       ├── application-test.yml     # Automated test profile (DataSource/Flyway excluded)
│   │       └── db/migration/
│   │           └── V1__create_database_extensions.sql # Baseline extensions (UUID & pgvector)
│   └── test/
│       └── java/ai/jobachiever/
│           ├── JobAchieverApplicationTests.java
│           ├── health/HealthControllerTests.java
│           ├── database/DatabaseInfrastructureTests.java # DB, Flyway & Docker Compose tests
│           └── common/exception/GlobalExceptionHandlerTests.java
└── README.md                            # Backend documentation
```

---

## 4. Database Infrastructure (PostgreSQL 16 & Docker Compose)

Local development uses a containerized PostgreSQL 16 image bundled with `pgvector` (`pgvector/pgvector:pg16`).

### 4.1 Configuration Files
- **Compose Manifest:** [`infrastructure/docker/docker-compose.yml`](file:///c:/Projects/JobAchieverAI/infrastructure/docker/docker-compose.yml)
- **Environment Template:** [`infrastructure/docker/.env.example`](file:///c:/Projects/JobAchieverAI/infrastructure/docker/.env.example)

### 4.2 Starting PostgreSQL with Docker Compose
1. Navigate to the Docker configuration folder:
   ```bash
   cd infrastructure/docker
   ```
2. Create your local `.env` from the template (if not already present):
   ```bash
   cp .env.example .env
   ```
3. Start the container in detached mode:
   ```bash
   docker compose up -d
   ```
4. Verify the container is running and healthy:
   ```bash
   docker compose ps
   ```
   The `jobachiever-postgres` service uses `pg_isready` for health probes and will transition to `healthy`.

### 4.3 Stopping PostgreSQL Without Losing Data
To stop the database while preserving all data in the persistent volume:
```bash
docker compose stop
# or
docker compose down
```
> [!CAUTION]
> **Never** run `docker compose down -v` in development unless you explicitly intend to destroy all local data and recreate the database volume from scratch.

### 4.4 Viewing Database Logs
```bash
docker compose logs -f postgres
```

---

## 5. Alternative Native PostgreSQL Setup (Without Docker)

If Docker is unavailable on your development environment:
1. **Install PostgreSQL 16:**
   - Download and run the official installer from [EnterpriseDB](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) or install via package manager (`winget install PostgreSQL.PostgreSQL.16`).
2. **Create Database and User:**
   Connect via `psql` or SQL Shell:
   ```sql
   CREATE DATABASE jobachiever;
   CREATE USER jobachiever WITH ENCRYPTED PASSWORD 'jobachiever_dev_password';
   GRANT ALL PRIVILEGES ON DATABASE jobachiever TO jobachiever;
   ALTER DATABASE jobachiever OWNER TO jobachiever;
   ```
3. **Optional pgvector Installation:**
   - Install pgvector binaries for your PostgreSQL version from [pgvector releases](https://github.com/pgvector/pgvector).
   - If pgvector is omitted, migration `V1__create_database_extensions.sql` will detect its absence and log a warning without failing startup, allowing relational features to proceed normally.

---

## 6. Connecting via pgAdmin 4

> [!NOTE]
> pgAdmin 4 is an administrative client GUI. It connects to the PostgreSQL server supplied by Docker or your local PostgreSQL service.

### Connection Parameters:
- **Host Name / Address:** `localhost` (or `127.0.0.1`)
- **Port:** `5432`
- **Maintenance Database:** `jobachiever`
- **Username:** Value from `.env` (default: `jobachiever`)
- **Password:** Value from `.env` (default: `jobachiever_dev_password`)
- **SSL Mode:** `Prefer` or `Disable` (for local development)

---

## 7. Configuration & Environment Variables

The backend binds database connection properties through environment variables with sensible defaults:

| Property | Environment Variable | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `server.port` | `PORT` | `8080` | HTTP port for incoming requests |
| `spring.profiles.active` | `SPRING_PROFILES_ACTIVE` | `local` | Active Spring profile (`local`, `test`, `default`) |
| `spring.datasource.url` | `SPRING_DATASOURCE_URL` or `DB_HOST`, `DB_PORT`, `DB_NAME` | `jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:jobachiever}` | JDBC connection string |
| `spring.datasource.username` | `SPRING_DATASOURCE_USERNAME` or `DB_USERNAME` | `jobachiever` | Database user account |
| `spring.datasource.password` | `SPRING_DATASOURCE_PASSWORD` or `DB_PASSWORD` | `jobachiever_dev_password` | Database user password |
| `spring.datasource.hikari.maximum-pool-size` | — | `10` | Max active connection pool limit |
| `spring.datasource.hikari.minimum-idle` | — | `2` | Min idle connections maintained |
| `spring.datasource.hikari.connection-timeout` | — | `30000` (30s) | Max wait time for a connection |
| `spring.jpa.hibernate.ddl-auto` | — | `validate` | Validates schema without automatic DDL alters |
| `spring.flyway.enabled` | — | `true` | Automated Flyway migrations on startup |
| `app.cors.allowed-origins` | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed cross-origin client URLs |

---

## 8. Flyway Schema Migrations

Flyway is the **sole schema migration engine** for JobAchiever AI. Hibernate DDL generation (`ddl-auto: create` or `update`) is strictly forbidden. Schema validation (`hibernate.ddl-auto: validate`) verifies JPA entity alignment against the migrated schema.

- **Migration Scripts Directory:** `backend/src/main/resources/db/migration/`
- **Naming Pattern:** `V{Version}__{Descriptive_Title}.sql`
- **Detailed Schema Specification & ER Diagram:** See [`docs/database-schema.md`](file:///c:/Projects/JobAchieverAI/docs/database-schema.md)

### 8.1 Migration Catalog
| Version | Migration Script | Description |
| :--- | :--- | :--- |
| **V1** | `V1__create_database_extensions.sql` | Enables `uuid-ossp`, `pgcrypto`, and conditionally initializes `vector` (pgvector) |
| **V2** | `V2__create_user_accounts.sql` | Creates `users` table with case-insensitive unique email and account status constraints |
| **V3** | `V3__create_career_profiles.sql` | Creates `career_profiles` table (1-to-1 master career profile per user) |
| **V4** | `V4__create_profile_details.sql` | Creates structured child entities: educations, skills, experiences, projects, certifications, achievements |
| **V5** | `V5__create_career_tracks.sql` | Creates `career_tracks` table for multi-track persona management |
| **V6** | `V6__create_resume_documents.sql` | Creates `resume_documents` and `resume_versions` tables with secure storage paths |
| **V7** | `V7__create_jobs_and_requirements.sql` | Creates shared `jobs` catalog and decomposed `job_requirements` |
| **V8** | `V8__create_job_applications.sql` | Creates `job_applications` tracker and `application_activities` audit log |

### 8.2 Migration Execution
Migrations execute automatically when the Spring Boot backend starts with an active database connection:
```powershell
# Migrations run automatically at startup against local PostgreSQL
./mvnw spring-boot:run
```
To run tests without requiring a live database:
```powershell
# Uses test profile; DataSource and Flyway autoconfigurations are excluded
./mvnw clean test
```

### 8.3 Migration Rules:
1. Migrations are strictly **append-only**. Never edit a migration once committed and merged.
2. Destructive operations (`DROP TABLE`, `DROP DATABASE`, `TRUNCATE`) are prohibited in migrations.
3. Every table must include standard audit fields (`created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`).

---

## 9. Safe Database Development & Backup

### 9.1 Data Persistence
- Data is stored in the Docker named volume `jobachiever_postgres_data`, mapped to `/var/lib/postgresql/data`.
- This ensures data survives container updates, restarts, and local machine reboots.

### 9.2 Database Backup (pg_dump)
To take a snapshot of the local database:
```bash
docker exec -t jobachiever-postgres pg_dump -U jobachiever -d jobachiever -F c -b -v -f /tmp/jobachiever_backup.dump
docker cp jobachiever-postgres:/tmp/jobachiever_backup.dump ./jobachiever_backup.dump
```

### 9.3 Database Restore (pg_restore)
To restore a snapshot:
```bash
docker cp ./jobachiever_backup.dump jobachiever-postgres:/tmp/jobachiever_backup.dump
docker exec -t jobachiever-postgres pg_restore -U jobachiever -d jobachiever -v /tmp/jobachiever_backup.dump
```

---

## 10. Troubleshooting Connection Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Connection refused: localhost:5432` | PostgreSQL is not running | Run `docker compose up -d` in `infrastructure/docker/` or verify native service status. |
| `password authentication failed for user` | Password mismatch | Verify `DB_PASSWORD` matches `.env` (`jobachiever_dev_password`). |
| `port 5432 is already allocated` | Another local PostgreSQL is running on port 5432 | Stop existing PostgreSQL service or change `POSTGRES_PORT` in `.env` and `DB_PORT` in backend. |
| `Flyway checksum validation failed` | A committed migration file was altered | Do not edit applied migrations; create a new incremental migration `V2__...`. |

---

## 11. Build & Test Commands

Run from the `backend/` directory using Maven Wrapper:

```powershell
# Run all automated tests (no database required in test profile)
./mvnw clean test

# Package production executable JAR
./mvnw clean package

# Run local Spring Boot application (connects to PostgreSQL on 5432)
./mvnw spring-boot:run
```
