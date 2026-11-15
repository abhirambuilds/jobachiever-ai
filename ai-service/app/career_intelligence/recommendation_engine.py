import uuid
from typing import Any, Dict, List, Optional

from app.career_intelligence.schemas import (
    CareerRecommendationItem,
    CareerRecommendationsResponse,
    PriorityLevel,
    RecommendationCategory,
)
from app.career_intelligence.skill_normalizer import clean_skill_text


def generate_career_recommendations(
    career_track: Dict[str, Any],
    skill_gaps: Optional[List[Dict[str, Any]]] = None,
    profile_data: Optional[Dict[str, Any]] = None,
) -> CareerRecommendationsResponse:
    """Generates prescriptive, evidence-grounded career recommendations based on identified gaps."""
    target_role = clean_skill_text(career_track.get("target_role") or "Software Engineer")
    r_lower = target_role.lower()

    # Extract missing / high-priority skills
    prioritized_missing: List[str] = []
    if skill_gaps:
        for g in skill_gaps:
            status = g.get("current_evidence_status") or g.get("currentEvidenceStatus")
            prio = g.get("priority")
            name = g.get("skill_name") or g.get("skillName")
            if (status in ("MISSING", "UNVERIFIED", "NEEDS_REVIEW") or prio in ("CRITICAL", "HIGH")) and name:
                prioritized_missing.append(name)

    recommendations: List[CareerRecommendationItem] = []

    # 1. Skill Development Recommendation
    if "backend" in r_lower:
        recommendations.append(
            CareerRecommendationItem(
                id=f"rec-{uuid.uuid4().hex[:8]}",
                category=RecommendationCategory.SKILL_DEVELOPMENT,
                title="Deepen Asynchronous Messaging & Event-Driven Patterns",
                description="Strengthen your architectural command of distributed message brokers such as Apache Kafka and Redis Pub/Sub.",
                targetRole=target_role,
                relatedSkills=["Apache Kafka", "Redis", "Distributed System Design"],
                priority=PriorityLevel.CRITICAL,
                rationale="Enterprise backend engineering roles increasingly require proven experience handling asynchronous decoupling, backpressure, and eventual consistency.",
                actionableSteps=[
                    "Implement a producer-consumer service with Apache Kafka verifying consumer group rebalancing.",
                    "Design idempotent message handlers using unique event UUIDs in PostgreSQL.",
                    "Write automated integration tests asserting dead-letter queue behavior under simulated consumer exceptions.",
                ],
                estimatedEffort="2 to 3 weeks of focused weekend implementation",
            )
        )
    elif "ai" in r_lower or "data" in r_lower:
        recommendations.append(
            CareerRecommendationItem(
                id=f"rec-{uuid.uuid4().hex[:8]}",
                category=RecommendationCategory.SKILL_DEVELOPMENT,
                title="Master Modern Vector Database Indexing & RAG Pipelines",
                description="Acquire production competency with high-dimensional vector search using PostgreSQL pgvector and cosine distance ranking.",
                targetRole=target_role,
                relatedSkills=["Vector Databases", "pgvector", "RAG (Retrieval-Augmented Generation)", "Python"],
                priority=PriorityLevel.CRITICAL,
                rationale="Modern AI engineering mandates moving beyond simple API prompt wrappers into resilient semantic retrieval, vector indexing, and grounded context validation.",
                actionableSteps=[
                    "Provision a PostgreSQL instance with the pgvector extension and build HNSW index benchmarks.",
                    "Implement chunking strategies and compare Cosine vs Euclidean similarity on document embeddings.",
                    "Evaluate retrieval precision using automated evaluation frameworks.",
                ],
                estimatedEffort="2 to 3 weeks of hands-on experimentation",
            )
        )
    else:
        recommendations.append(
            CareerRecommendationItem(
                id=f"rec-{uuid.uuid4().hex[:8]}",
                category=RecommendationCategory.SKILL_DEVELOPMENT,
                title="Strengthen Strict Type Systems & Component Architectures",
                description="Solidify type safety using TypeScript interfaces, generics, and discriminated unions across full-stack applications.",
                targetRole=target_role,
                relatedSkills=["TypeScript", "React", "REST APIs"],
                priority=PriorityLevel.CRITICAL,
                rationale="Commercial engineering teams prioritize maintainability; TypeScript fluency reduces runtime exceptions and clarifies API contracts.",
                actionableSteps=[
                    "Migrate JavaScript components to strict TypeScript with zero any escapes.",
                    "Define shared DTO interfaces between frontend client and backend REST endpoints.",
                ],
                estimatedEffort="1 to 2 weeks of refactoring practice",
            )
        )

    # 2. Practical Project Recommendation
    recommendations.append(
        CareerRecommendationItem(
            id=f"rec-{uuid.uuid4().hex[:8]}",
            category=RecommendationCategory.PRACTICAL_PROJECT,
            title=f"Build and Open-Source a Focused {target_role} Benchmark Project",
            description=f"Create a public GitHub project specifically demonstrating {', '.join(prioritized_missing[:3]) if prioritized_missing else 'core role capabilities'}.",
            targetRole=target_role,
            relatedSkills=prioritized_missing[:3] if prioritized_missing else ["Docker", "Git", "REST APIs"],
            priority=PriorityLevel.HIGH,
            rationale="Hiring managers evaluate verifiable code repositories and automated test suites over self-reported resume bullet points.",
            actionableSteps=[
                "Create a public GitHub repository with an architecture diagram in the README.",
                "Implement automated CI workflows executing unit and integration test suites on every pull request.",
                "Include a step-by-step reproduction guide using Docker Compose.",
            ],
            estimatedEffort="3 to 4 weeks to production-grade repository",
        )
    )

    # 3. Portfolio & Resume Alignment Recommendation
    recommendations.append(
        CareerRecommendationItem(
            id=f"rec-{uuid.uuid4().hex[:8]}",
            category=RecommendationCategory.PORTFOLIO_ENHANCEMENT,
            title="Quantify Engineering Impact in Work & Project Summaries",
            description="Revise existing experience and project bullet points using the Resume Studio AI Writing Assistant to highlight verified latency, scale, and uptime deliverables.",
            targetRole=target_role,
            relatedSkills=["Technical Writing", "Resume Impact"],
            priority=PriorityLevel.HIGH,
            rationale="Recruiters scan for quantifiable impact (e.g. latency reductions, scale managed, test coverage) rather than passive duty descriptions.",
            actionableSteps=[
                "Open Resume Studio and run 'Action Verbs & Impact' on all project highlights.",
                "Replace passive phrasing ('worked on', 'helped with') with leadership ownership descriptors ('architected', 'spearheaded').",
                "Ensure every metric is grounded in candidate verification; never fabricate numbers.",
            ],
            estimatedEffort="1 to 2 hours in Resume Studio",
        )
    )

    # 4. Concept Mastery / Architecture Recommendation
    recommendations.append(
        CareerRecommendationItem(
            id=f"rec-{uuid.uuid4().hex[:8]}",
            category=RecommendationCategory.CONCEPT_MASTERY,
            title="Consolidate System Design Principles for Seniority Advancement",
            description="Deepen understanding of horizontal partitioning, distributed caching, CAP theorem trade-offs, and microservices decomposition.",
            targetRole=target_role,
            relatedSkills=["Distributed System Design", "Microservices Architecture"],
            priority=PriorityLevel.MEDIUM,
            rationale="Senior and mid-level interviews evaluate architectural rationale, fault tolerance, and trade-off analysis.",
            actionableSteps=[
                "Diagram a multi-region transactional system handling failover and data replication.",
                "Review real-world post-mortems of distributed systems outages.",
            ],
            estimatedEffort="Ongoing weekly architectural case study review",
        )
    )

    return CareerRecommendationsResponse(
        careerTrackId=career_track.get("id"),
        targetRole=target_role,
        recommendations=recommendations,
    )
