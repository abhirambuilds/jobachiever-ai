# AI Skill Gap Analysis & Career Recommendations Architecture

## 1. Executive Summary

**JobAchiever AI Career Intelligence** is a multi-user, evidence-grounded AI system designed to analyze candidate skill readiness against target career roles, diagnose critical qualification gaps, prioritize technical competencies through deterministic formula weights, and generate dependency-ordered phased learning roadmaps.

The system adheres strictly to the non-negotiable **Zero-Fabrication** principle: it evaluates actual verified credentials, project descriptions, work experiences, and master skills. Unevidenced qualifications are marked as `MISSING_EVIDENCE` or `DEVELOPING`, and learning roadmaps require explicit user confirmation before milestones transition to `COMPLETED`.

---

## 2. Decoupled Two-Tier Architecture & Orchestration

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 18 Frontend Client                        │
│   (CareerTrackSelector, SkillGapOverviewCard, SkillGapExplorer,        │
│    LearningRoadmapView, CareerRecommendationsView, ProjectBlueprints)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON (Bearer JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              Primary Backend: Spring Boot 3.x (Port 8080)              │
│  - Authoritative Source of Truth: Users, Career Tracks, Master Profile │
│  - Mandatory Explicit AI Processing Consent Verification               │
│  - Tenancy Isolation: User-scoped access checks                        │
│  - Database Persistence: career_skill_gaps, career_roadmaps,           │
│    career_milestones, career_recommendations                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON (X-Internal-Service-Key)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               AI Microservice: Python FastAPI (Port 8000)              │
│  - Skill Normalization & Canonical Alias Mapping                       │
│  - Deterministic Formula-Weighted Skill Prioritization                 │
│  - Benchmark Role Evaluation & Evidence Classification                 │
│  - Phased Learning Roadmap Synthesis & Portfolio Project Blueprints    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Manual User Provider Selection
                                    ▼
                   ┌─────────────────────────────────┐
                   │    Groq Cloud API (Primary)     │
                   │    Google Gemini API (Secondary)│
                   └─────────────────────────────────┘
```

### Architectural Responsibilities:
- **Spring Boot 3.x:** Sole authoritative owner of user credentials, multi-tenancy, Master Career Profile, career tracks, and persistent roadmap state. Verifies explicit AI processing consent (`UserAiPreferenceService.hasConsent(userId)`) before dispatching any profile context.
- **Python FastAPI:** Stateless AI computation microservice. Performs canonical alias resolution, dependency graph evaluation, priority calculation, and structured JSON output synthesis via Groq or Google Gemini.
- **AI Providers:** Selected manually by the candidate. No silent automatic switching or hidden fallbacks.

---

## 3. Deterministic Skill Prioritization Engine

Every benchmark skill is evaluated through a strict multi-factor mathematical weighting formula:

$$\text{Priority Score} = 0.35 \times R + 0.20 \times F + 0.20 \times T + 0.15 \times D + 0.10 \times G$$

Where:
- **$R$ (Target Role Importance - 35%):** Centrality of the skill to the target role (e.g., Python for AI/ML, Java for Enterprise Backend).
- **$F$ (Job Specification Frequency - 20%):** Frequency with which the skill appears in target industry job postings.
- **$T$ (Career Track Relevance - 20%):** Overlap with the candidate's active career track requirements and preferred technologies.
- **$D$ (Skill Dependency Graph - 15%):** Number of downstream technologies that require this skill as a prerequisite (e.g., Docker is required before Kubernetes).
- **$G$ (Goal Alignment - 10%):** Semantic alignment with the candidate's explicitly stated career goals.

### Priority Level Classification:
- **CRITICAL ($\ge 90$):** High market urgency and essential prerequisite.
- **HIGH ($70 - 89$):** Core competence required for competitive market candidacy.
- **MEDIUM ($50 - 69$):** Secondary or specialized competence.
- **LOW ($< 50$):** Auxiliary or optional competence.

---

## 4. Evidence Classification & Zero-Fabrication Directives

Each candidate skill is classified into one of four deterministic categories:

| Classification | Meaning | Evidence Criteria |
| :--- | :--- | :--- |
| `STRONG` | Demonstrated Mastery | Verified in candidate profile skills and supported by projects, experiences, or certifications. |
| `DEVELOPING` | Partial Evidence | Present in profile skills but lacks rich project/experience detail, or mentioned in descriptions without formal skill verification. |
| `MISSING_EVIDENCE` | Unproven Competence | Required for the target role benchmark but zero evidence found across verified candidate profile. |
| `NEEDS_REVIEW` | Ambiguous / Aliased | Appears under non-standard terminology requiring candidate confirmation. |

### Evidence Status Matrix:
- `CONFIRMED`: Verified in candidate's structured profile skills.
- `EVIDENCED`: Demonstrated through detailed project descriptions or work experience bullets.
- `UNVERIFIED`: Extracted from uploaded documents but pending candidate review.
- `MISSING`: No evidence found in profile.

---

## 5. Phased Learning Roadmaps & Milestones

Roadmaps are synthesized into progressive, dependency-ordered phases:
- **Phase 1: Foundations & Prerequisites:** Core technologies that unblock subsequent stages.
- **Phase 2: Core Engineering & System Design:** Direct application development, message queues, and databases.
- **Phase 3: Scale, Distributed Systems & Production:** High-throughput streaming, cluster orchestration, and observability.

### Milestone State Machine:
```
[ NOT_STARTED ] ──> [ IN_PROGRESS ] ──> [ COMPLETED ]
        │                    │
        └─────> [ BLOCKED ] <┘
```
- **Strict Human-in-the-Loop:** Milestones only transition to `COMPLETED` when the user explicitly triggers the completion action.
- Automatic recording of `completedAt` timestamps and tracking of personal learning notes and artifact/repository links.
- When all milestones in a roadmap reach `COMPLETED`, the parent roadmap automatically transitions to `COMPLETED`.

---

## 6. Strategic Recommendations & Portfolio Projects

### Recommendation Categories:
1. `SKILL_DEVELOPMENT`: Conceptual mastery and technical deep-dives.
2. `PRACTICAL_PROJECT`: End-to-end hands-on system builds.
3. `PORTFOLIO_ENHANCEMENT`: Public repository optimization, documentation, and demonstrable artifacts.
4. `CERTIFICATION`: High-credibility cloud or domain credentials.
5. `CONCEPT_MASTERY`: Architectural patterns, distributed consistency, and concurrency.

### Multi-Skill Portfolio Projects:
Blueprints are architected specifically to eliminate 2–4 missing skills simultaneously (e.g., an event-driven order processing system combining Kafka, Kubernetes, and Redis rate limiting) to maximize hiring impact.

---

## 7. Database Persistence Schema (Flyway V19)

### Tables Introduced:
1. `career_skill_gaps`: Stores AI-analyzed skill assessments, demonstrated skills, developing skills, missing evidence, and critical priorities.
2. `career_recommendations`: Stores structured recommendations history per user and career track.
3. `career_roadmaps`: Stores learning roadmaps, active status, and estimated duration.
4. `career_milestones`: Stores actionable milestones, status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`), related skills, tasks, completion criteria, personal notes, and evidence links.

---

## 8. REST API Specifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/career/skill-gaps` | Analyze candidate skill gaps against career track |
| `GET` | `/api/v1/career/skill-gaps?trackId={id}` | Retrieve latest skill gap analysis for track |
| `POST` | `/api/v1/career/recommendations` | Generate actionable strategic recommendations |
| `GET` | `/api/v1/career/recommendations?trackId={id}` | Retrieve latest recommendations for track |
| `POST` | `/api/v1/career/roadmaps` | Generate phased learning roadmap |
| `GET` | `/api/v1/career/roadmaps?trackId={id}` | Retrieve active roadmap and milestone progress |
| `GET` | `/api/v1/career/roadmaps/all` | List all roadmaps for candidate |
| `PATCH` | `/api/v1/career/milestones/{id}` | Update milestone status, notes, or evidence links |
| `POST` | `/api/v1/career/projects?trackId={id}` | Recommend multi-skill portfolio project blueprints |
| `GET` | `/api/v1/career/dashboard-summary` | Aggregated career intelligence metrics for dashboard |

---

## 9. Security & Tenancy Guarantees

- **User Isolation:** All queries and updates enforce `userId` filtering. Cross-user access returns `404 Not Found` or `403 Forbidden`.
- **Consent Gate:** If `hasConsent(userId)` is false, all AI operations immediately reject with `403 Forbidden` requesting the user grant consent in AI Provider Settings.
- **Stateless AI microservice:** FastAPI accepts prompts and returns responses; never retains user credentials or private data.
