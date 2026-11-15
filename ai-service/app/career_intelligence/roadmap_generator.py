from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Optional

from app.career_intelligence.schemas import (
    MilestoneStatus,
    PriorityLevel,
    RoadmapGenerateResponse,
    RoadmapMilestone,
    RoadmapPhase,
    RoadmapTask,
)
from app.career_intelligence.skill_normalizer import (
    canonicalize_skill,
    clean_skill_text,
    get_skill_dependencies,
)


def generate_structured_roadmap(
    career_track: Dict[str, Any],
    skill_gaps: Optional[List[Dict[str, Any]]] = None,
    profile_data: Optional[Dict[str, Any]] = None,
    target_role_override: Optional[str] = None,
) -> RoadmapGenerateResponse:
    """Generates an evidence-grounded phased learning roadmap respecting prerequisite skill dependencies."""
    target_role = clean_skill_text(target_role_override or career_track.get("target_role") or "Software Engineer")
    r_lower = target_role.lower()
    now_iso = datetime.now(timezone.utc).isoformat()
    roadmap_uuid = str(uuid.uuid4())

    # Collect missing and developing skills from gaps
    missing_skills: List[str] = []
    if skill_gaps:
        for g in skill_gaps:
            status = g.get("current_evidence_status") or g.get("currentEvidenceStatus")
            name = g.get("skill_name") or g.get("skillName")
            if status in ("MISSING", "UNVERIFIED", "NEEDS_REVIEW") and name:
                missing_skills.append(canonicalize_skill(name))

    # Determine phase breakdown based on role and dependencies
    phases: List[RoadmapPhase] = []

    if "backend" in r_lower or "system" in r_lower:
        # Phase 1: Core Fundamentals & Prerequisite Foundations
        phase1_milestones = [
            RoadmapMilestone(
                id=f"ms-{uuid.uuid4().hex[:8]}",
                title="Master Modern Java 21 & Language Fundamentals",
                description="Strengthen core language features including Virtual Threads (Project Loom), Pattern Matching, and Records for concurrent architectures.",
                phaseNumber=1,
                priority=PriorityLevel.CRITICAL,
                relatedSkills=["Java", "Java 21"],
                tasks=[
                    RoadmapTask(taskId="t-1-1", title="Study Virtual Threads & Structured Concurrency", description="Benchmark carrier thread pool efficiency vs virtual threads under I/O blocking."),
                    RoadmapTask(taskId="t-1-2", title="Implement robust error handling with Sealed Interfaces", description="Refactor command patterns using exhaustive pattern matching."),
                ],
                completionCriteria=[
                    "Build a concurrent worker pool utilizing Java 21 Virtual Threads.",
                    "Verify zero thread starvation under simulated blocking network calls.",
                ],
                estimatedDuration=None,
                status=MilestoneStatus.NOT_STARTED,
            ),
            RoadmapMilestone(
                id=f"ms-{uuid.uuid4().hex[:8]}",
                title="Relational Schema Design & ACID Query Optimization",
                description="Deepen PostgreSQL indexing strategies, EXPLAIN ANALYZE execution plan debugging, and transactional isolation levels.",
                phaseNumber=1,
                priority=PriorityLevel.HIGH,
                relatedSkills=["SQL", "PostgreSQL"],
                tasks=[
                    RoadmapTask(taskId="t-1-3", title="Design normalized multi-tenant relational schemas", description="Implement foreign key constraints and audit timestamps."),
                    RoadmapTask(taskId="t-1-4", title="Optimize slow queries using B-Tree and GIN indexes", description="Analyze cost estimates in query execution plans."),
                ],
                completionCriteria=[
                    "Achieve sub-50ms p99 query latency on a 100,000-row simulated relational dataset.",
                    "Demonstrate correct repeatable read / serializable transactional isolation.",
                ],
                estimatedDuration=None,
                status=MilestoneStatus.NOT_STARTED,
            ),
        ]
        phases.append(RoadmapPhase(phase=1, title="Core Fundamentals & Language Prerequisites", description="Consolidate language mastery and relational persistence foundations.", milestones=phase1_milestones))

        # Phase 2: Microservices & Framework Architecture
        phase2_milestones = [
            RoadmapMilestone(
                id=f"ms-{uuid.uuid4().hex[:8]}",
                title="Production-Grade Spring Boot 3 Microservices",
                description="Architect RESTful services with Spring Security, stateless JWT verification, and automated validation filters.",
                phaseNumber=2,
                priority=PriorityLevel.CRITICAL,
                relatedSkills=["Spring Boot", "REST APIs", "Spring Framework"],
                tasks=[
                    RoadmapTask(taskId="t-2-1", title="Implement stateless JWT security filter chain", description="Configure cryptographic token signature validation and revocation checks."),
                    RoadmapTask(taskId="t-2-2", title="Write automated unit and integration tests", description="Achieve test coverage using JUnit 5 and MockMvc."),
                ],
                completionCriteria=[
                    "Expose versioned REST endpoints (/api/v1/...) with strict DTO validation.",
                    "All integration tests passing in automated Maven test suite.",
                ],
                estimatedDuration=None,
                status=MilestoneStatus.NOT_STARTED,
            ),
            RoadmapMilestone(
                id=f"ms-{uuid.uuid4().hex[:8]}",
                title="Containerization & Local Cloud Emulation",
                description="Containerize Spring Boot services using multi-stage Docker builds and compose isolated database services.",
                phaseNumber=2,
                priority=PriorityLevel.HIGH,
                relatedSkills=["Docker", "Linux"],
                tasks=[
                    RoadmapTask(taskId="t-2-3", title="Author minimal non-root Dockerfile", description="Use Alpine / Temurin JRE base images to minimize image attack surface."),
                    RoadmapTask(taskId="t-2-4", title="Orchestrate multi-container stack in Docker Compose", description="Include healthchecks and volume mount persistence."),
                ],
                completionCriteria=[
                    "Verify image builds cleanly under 250MB with zero CVE critical vulnerabilities.",
                    "Docker Compose boots entire microservice stack with one command.",
                ],
                estimatedDuration=None,
                status=MilestoneStatus.NOT_STARTED,
            ),
        ]
        phases.append(RoadmapPhase(phase=2, title="Framework Engineering & Containerization", description="Build scalable REST architectures and containerized microservices.", milestones=phase2_milestones))

        # Phase 3: Distributed Systems & Production Scale
        phase3_milestones = [
            RoadmapMilestone(
                id=f"ms-{uuid.uuid4().hex[:8]}",
                title="Distributed Caching & Asynchronous Event Streaming",
                description="Integrate Redis distributed caching and Apache Kafka event publishing with at-least-once message delivery.",
                phaseNumber=3,
                priority=PriorityLevel.HIGH,
                relatedSkills=["Redis", "Apache Kafka", "Distributed System Design"],
                tasks=[
                    RoadmapTask(taskId="t-3-1", title="Implement cache-aside pattern with Redis", description="Set TTL expiration and cache stampede protections."),
                    RoadmapTask(taskId="t-3-2", title="Publish domain events to Kafka topics", description="Handle consumer group partition rebalancing and poison pill messages."),
                ],
                completionCriteria=[
                    "Demonstrate cache hit ratio exceeding 80% on repeated read workloads.",
                    "Verified idempotent consumer processing without duplicate database inserts.",
                ],
                estimatedDuration=None,
                status=MilestoneStatus.NOT_STARTED,
            ),
        ]
        phases.append(RoadmapPhase(phase=3, title="Distributed Systems & Operational Scale", description="Deliver event-driven architectures and distributed resilience.", milestones=phase3_milestones))

    elif "ai" in r_lower or "data" in r_lower:
        # Phase 1: Python Data Foundations
        phase1_milestones = [
            RoadmapMilestone(
                id=f"ms-{uuid.uuid4().hex[:8]}",
                title="Python Numerical Foundations & Data Processing",
                description="Master vectorized matrix computation with NumPy and tabular feature engineering with Pandas.",
                phaseNumber=1,
                priority=PriorityLevel.CRITICAL,
                relatedSkills=["Python", "NumPy", "Pandas"],
                tasks=[
                    RoadmapTask(taskId="t-1-1", title="Vectorize loop calculations using NumPy arrays", description="Avoid Python loops on multi-dimensional array operations."),
                    RoadmapTask(taskId="t-1-2", title="Perform feature normalization and imputation", description="Handle missing values and categorical encoding in Pandas."),
                ],
                completionCriteria=[
                    "Clean and engineer features from a raw real-world dataset without memory leaks.",
                ],
                estimatedDuration=None,
                status=MilestoneStatus.NOT_STARTED,
            ),
        ]
        phases.append(RoadmapPhase(phase=1, title="Foundations & Numerical Computation", description="Consolidate Python data processing fundamentals.", milestones=phase1_milestones))

        # Phase 2: Machine Learning & Deep Learning
        phase2_milestones = [
            RoadmapMilestone(
                id=f"ms-{uuid.uuid4().hex[:8]}",
                title="Applied Machine Learning & Model Evaluation",
                description="Build, tune, and cross-validate supervised and unsupervised algorithms using Scikit-Learn.",
                phaseNumber=2,
                priority=PriorityLevel.CRITICAL,
                relatedSkills=["Machine Learning", "Scikit-Learn", "Statistics"],
                tasks=[
                    RoadmapTask(taskId="t-2-1", title="Implement stratified cross-validation pipelines", description="Prevent data leakage across train and validation folds."),
                    RoadmapTask(taskId="t-2-2", title="Optimize ROC-AUC and precision-recall trade-offs", description="Evaluate classification metrics on imbalanced targets."),
                ],
                completionCriteria=[
                    "Deliver an end-to-end model evaluation script with verifiable benchmark metrics.",
                ],
                estimatedDuration=None,
                status=MilestoneStatus.NOT_STARTED,
            ),
            RoadmapMilestone(
                id=f"ms-{uuid.uuid4().hex[:8]}",
                title="Deep Learning & Neural Architectures with PyTorch",
                description="Design and train neural networks using PyTorch with GPU acceleration and tensor broadcasting.",
                phaseNumber=2,
                priority=PriorityLevel.HIGH,
                relatedSkills=["PyTorch", "Deep Learning"],
                tasks=[
                    RoadmapTask(taskId="t-2-3", title="Define PyTorch nn.Module architecture", description="Implement custom loss functions and AdamW optimizers."),
                ],
                completionCriteria=[
                    "Train a multi-layer deep learning model achieving convergence on validation loss.",
                ],
                estimatedDuration=None,
                status=MilestoneStatus.NOT_STARTED,
            ),
        ]
        phases.append(RoadmapPhase(phase=2, title="Machine Learning & Deep Neural Networks", description="Construct statistical learning models and PyTorch networks.", milestones=phase2_milestones))

        # Phase 3: Modern Generative AI & Retrieval Pipelines
        phase3_milestones = [
            RoadmapMilestone(
                id=f"ms-{uuid.uuid4().hex[:8]}",
                title="Vector Search & RAG System Engineering",
                description="Construct production Retrieval-Augmented Generation pipelines using PostgreSQL pgvector and FastAPI.",
                phaseNumber=3,
                priority=PriorityLevel.HIGH,
                relatedSkills=["Vector Databases", "pgvector", "RAG (Retrieval-Augmented Generation)", "FastAPI"],
                tasks=[
                    RoadmapTask(taskId="t-3-1", title="Implement HNSW cosine similarity search", description="Benchmark vector query latency on pgvector."),
                    RoadmapTask(taskId="t-3-2", title="Deploy inference endpoints in FastAPI", description="Validate structured JSON responses using Pydantic."),
                ],
                completionCriteria=[
                    "Serve sub-100ms vector retrieval responses from a containerized FastAPI endpoint.",
                ],
                estimatedDuration=None,
                status=MilestoneStatus.NOT_STARTED,
            ),
        ]
        phases.append(RoadmapPhase(phase=3, title="Vector Search & Production Generative AI", description="Deliver scalable semantic search and AI inference services.", milestones=phase3_milestones))

    else:
        # General / Full-Stack
        phase1_milestones = [
            RoadmapMilestone(
                id=f"ms-{uuid.uuid4().hex[:8]}",
                title="Modern Frontend Engineering with React & TypeScript",
                description="Master React functional components, hooks lifecycle, and strict TypeScript interfaces.",
                phaseNumber=1,
                priority=PriorityLevel.CRITICAL,
                relatedSkills=["JavaScript", "TypeScript", "React"],
                tasks=[
                    RoadmapTask(taskId="t-1-1", title="Build type-safe component design systems", description="Use TypeScript generics and discriminated unions."),
                ],
                completionCriteria=[
                    "Pass all component test suites with zero TypeScript compilation errors.",
                ],
                estimatedDuration=None,
                status=MilestoneStatus.NOT_STARTED,
            ),
        ]
        phases.append(RoadmapPhase(phase=1, title="Frontend Engineering & Type Safety", description="Consolidate modern client architectures.", milestones=phase1_milestones))

        phase2_milestones = [
            RoadmapMilestone(
                id=f"ms-{uuid.uuid4().hex[:8]}",
                title="Full-Stack Integration & Relational Persistence",
                description="Integrate client applications with PostgreSQL databases via secure REST APIs.",
                phaseNumber=2,
                priority=PriorityLevel.HIGH,
                relatedSkills=["Node.js", "PostgreSQL", "REST APIs"],
                tasks=[
                    RoadmapTask(taskId="t-2-1", title="Implement relational schemas and migrations", description="Enforce strict referential integrity."),
                ],
                completionCriteria=[
                    "End-to-end CRUD operations tested with automated integration test harnesses.",
                ],
                estimatedDuration=None,
                status=MilestoneStatus.NOT_STARTED,
            ),
        ]
        phases.append(RoadmapPhase(phase=2, title="API Engineering & Database Integration", description="Connect client interfaces to robust backend services.", milestones=phase2_milestones))

    return RoadmapGenerateResponse(
        roadmapId=roadmap_uuid,
        careerTrackId=career_track.get("id"),
        targetRole=target_role,
        generatedAt=now_iso,
        estimatedDuration=None,  # Strictly avoid unevidenced timeline promises
        phases=phases,
    )
