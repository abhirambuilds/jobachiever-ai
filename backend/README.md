# JobAchiever AI — Spring Boot Backend Foundation

**Service:** `jobachiever-backend`  
**Architecture:** Single Source of Truth for User Identity, Master Profile, Career Tracks, and Persistence  
**Technology Stack:** Java 21 LTS, Spring Boot 3.3.5, Spring Security 6.x, Spring Data JPA, Spring Validation, Actuator  

---

## 1. Overview

The `backend` module represents the core primary backend and authoritative source of truth for JobAchiever AI. It owns:
- User identity, credentials, registration, and JWT token issuance.
- Master Career Profiles, multi-track career personas, and verified skills.
- Document storage dispatch, resume versioning, and processing statuses.
- Job postings, decomposed JD requirements, and application pipelines.

The companion Python FastAPI service (`ai-service/`) operates as a stateless AI computation microservice dispatched by this backend.

---

## 2. Technology Requirements

- **Java Development Kit (JDK):** Java 21 LTS (e.g. Eclipse Adoptium Temurin 21).
- **Build Tool:** Apache Maven 3.9+ or the included Maven Wrapper (`./mvnw` or `mvnw.cmd`).
- **Target Runtime:** Java 21 LTS (`<java.version>21</java.version>`).

---

## 3. Project Structure

```
backend/
├── pom.xml                               # Maven project descriptor
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
│   │       ├── application.yml          # Default configuration (starts without live DB)
│   │       ├── application-local.yml    # Local development profile (prepared for PostgreSQL)
│   │       └── application-test.yml     # Automated test profile
│   └── test/
│       └── java/ai/jobachiever/
│           ├── JobAchieverApplicationTests.java
│           ├── health/HealthControllerTests.java
│           └── common/exception/GlobalExceptionHandlerTests.java
└── README.md                            # Backend documentation
```

---

## 4. Configuration & Environment Variables

All settings use environment-variable-backed properties with sensible local defaults:

| Property | Environment Variable | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `server.port` | `PORT` | `8080` | HTTP port for incoming requests |
| `spring.profiles.active` | `SPRING_PROFILES_ACTIVE` | `default` | Active Spring profile (`default`, `local`, `test`) |
| `app.cors.allowed-origins` | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed cross-origin client URLs |
| `spring.datasource.url` | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/jobachiever_db` | PostgreSQL connection URL (local profile) |
| `spring.datasource.username` | `SPRING_DATASOURCE_USERNAME` | `postgres` | Database username |
| `spring.datasource.password` | `SPRING_DATASOURCE_PASSWORD` | `postgres` | Database password |

> **Note on Zero DB Dependency in Default Profile:** In the `default` profile, database auto-configuration (`DataSourceAutoConfiguration`, `HibernateJpaAutoConfiguration`) is excluded. The health check and security layers run immediately without requiring PostgreSQL to be running.

---

## 5. API Endpoints

### Public Health Check
- **Endpoint:** `GET /api/v1/health`
- **Response Format:**
  ```json
  {
    "status": "UP",
    "service": "jobachiever-backend",
    "version": "1.0.0"
  }
  ```
- **HTTP Status:** `200 OK`

### Spring Boot Actuator
- **Health:** `GET /actuator/health` (Exposes `status: "UP"`, liveness and readiness probes)
- **Info:** `GET /actuator/info`

---

## 6. Uniform Error Handling Contract

All endpoints adhere to a standardized error response schema managed by `GlobalExceptionHandler`:

```json
{
  "timestamp": "2026-11-15T10:18:30.974Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for request parameters",
  "path": "/api/v1/example",
  "validationErrors": [
    {
      "field": "email",
      "message": "Must be a valid email format",
      "rejectedValue": "invalid-email"
    }
  ]
}
```

Stack traces and internal implementation details are suppressed from client responses and logged internally via SLF4J.

---

## 7. Security & CORS Preparation

- **Security Baseline:** Stateless session management (`SessionCreationPolicy.STATELESS`), CSRF disabled for stateless REST operations.
- **Access Control:** Public access is granted to `/api/v1/health` and `/actuator/health`. All other business endpoints require authentication (`anyRequest().authenticated()`).
- **CORS:** Explicitly allows `http://localhost:5173` (Vite dev server) with credentials and standard HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`).

---

## 8. Build & Test Commands

Run from the `backend/` directory or repository root using Maven Wrapper:

```powershell
# Run automated tests
./mvnw clean test

# Package executable JAR (target/jobachiever-backend-1.0.0-SNAPSHOT.jar)
./mvnw clean package

# Run local Spring Boot application on port 8080
./mvnw spring-boot:run

# Run local application with active PostgreSQL profile (when DB is provisioned)
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```
