import uuid
from typing import Any, Dict, List, Optional

from app.career_intelligence.schemas import (
    ProjectRecommendationItem,
    ProjectRecommendationsResponse,
)
from app.career_intelligence.skill_normalizer import clean_skill_text


def recommend_projects_for_gaps(
    career_track: Dict[str, Any],
    skill_gaps: Optional[List[Dict[str, Any]]] = None,
    profile_data: Optional[Dict[str, Any]] = None,
) -> ProjectRecommendationsResponse:
    """Generates realistic, portfolio-worthy project suggestions demonstrating multiple missing target skills."""
    target_role = clean_skill_text(career_track.get("target_role") or "Software Engineer")
    r_lower = target_role.lower()

    # Identify top missing or developing skills
    missing_skills: List[str] = []
    if skill_gaps:
        for g in skill_gaps:
            status = g.get("current_evidence_status") or g.get("currentEvidenceStatus")
            name = g.get("skill_name") or g.get("skillName")
            if status in ("MISSING", "UNVERIFIED", "NEEDS_REVIEW") and name:
                missing_skills.append(name)

    projects: List[ProjectRecommendationItem] = []

    if "backend" in r_lower or "system" in r_lower:
        projects.append(
            ProjectRecommendationItem(
                id=f"proj-{uuid.uuid4().hex[:8]}",
                title="Distributed Job Queue & Event Processing Engine",
                targetSkills=["Java", "Spring Boot", "Apache Kafka", "PostgreSQL", "Docker", "Redis"],
                objective="Architect a resilient, distributed asynchronous task scheduling engine with horizontal worker scalability and at-least-once delivery guarantees.",
                suggestedFeatures=[
                    "Dead-letter queue handling for resilient failure recovery",
                    "Idempotent message consumption using PostgreSQL distributed locks",
                    "Prometheus metrics scraping for queue lag and worker throughput",
                    "Docker Compose orchestration for multi-service local testing",
                ],
                technologyChoices=["Java 21", "Spring Boot 3", "PostgreSQL", "Apache Kafka", "Redis", "Docker"],
                difficulty="INTERMEDIATE",
                expectedDeliverables=[
                    "Public GitHub repository with comprehensive README and architecture diagram",
                    "Automated integration test suite using Testcontainers and JUnit 5",
                    "Documented benchmark results demonstrating throughput under high concurrency",
                ],
                resumeEvidenceValue="Provides direct evidence of distributed systems design, asynchronous queuing, and fault-tolerant transactional persistence.",
            )
        )
        projects.append(
            ProjectRecommendationItem(
                id=f"proj-{uuid.uuid4().hex[:8]}",
                title="Multi-Tenant High-Throughput REST API Gateway",
                targetSkills=["Spring Boot", "REST APIs", "Microservices Architecture", "Redis", "CI/CD"],
                objective="Build an enterprise API gateway featuring token bucket rate-limiting, stateless JWT validation, and dynamic route dispatching.",
                suggestedFeatures=[
                    "Stateless JWT authorization filter with Redis token revocation caching",
                    "Sliding-window rate limiter preventing API abuse",
                    "Automated GitHub Actions CI/CD pipeline building Docker images",
                ],
                technologyChoices=["Java / Spring Boot", "Redis", "Docker", "GitHub Actions"],
                difficulty="ADVANCED",
                expectedDeliverables=[
                    "Production-ready repository with OpenAPI / Swagger documentation",
                    "Stress test harness simulating 1,000 req/sec with Apache JMeter or k6",
                ],
                resumeEvidenceValue="Demonstrates enterprise backend architecture, rate-limiting algorithms, and production cloud readiness.",
            )
        )
    elif "ai" in r_lower or "data" in r_lower or "machine learning" in r_lower:
        projects.append(
            ProjectRecommendationItem(
                id=f"proj-{uuid.uuid4().hex[:8]}",
                title="Semantic Retrieval & RAG Query Engine",
                targetSkills=["Python", "PyTorch", "FastAPI", "Vector Databases", "pgvector", "Large Language Models"],
                objective="Engineered an end-to-end Retrieval-Augmented Generation (RAG) platform with hybrid dense/sparse vector search and hallucination mitigation guardrails.",
                suggestedFeatures=[
                    "Chunking pipeline extracting semantic embeddings from multi-format documents",
                    "Vector similarity search using PostgreSQL pgvector with HNSW indexing",
                    "Evaluation harness computing context precision and answer faithfulness",
                ],
                technologyChoices=["Python 3.11", "FastAPI", "PostgreSQL (pgvector)", "Hugging Face / OpenAI", "Docker"],
                difficulty="ADVANCED",
                expectedDeliverables=[
                    "Interactive REST API endpoints with Swagger documentation",
                    "Documented eval metrics with Ragas or TruLens benchmarking",
                ],
                resumeEvidenceValue="Demonstrates modern AI engineering, vector database integration, and quantifiable model evaluation.",
            )
        )
        projects.append(
            ProjectRecommendationItem(
                id=f"proj-{uuid.uuid4().hex[:8]}",
                title="End-to-End Predictive Analytics Pipeline",
                targetSkills=["Python", "Scikit-Learn", "Pandas", "NumPy", "SQL", "Docker"],
                objective="Built a reproducible machine learning pipeline predicting customer churn with rigorous feature engineering and cross-validation.",
                suggestedFeatures=[
                    "Automated data cleaning and outlier detection modules",
                    "Hyperparameter tuning with Optuna and cross-validated ROC-AUC optimization",
                    "Containerized inference service exposing real-time predictions",
                ],
                technologyChoices=["Python", "Pandas", "Scikit-Learn", "Docker", "FastAPI"],
                difficulty="INTERMEDIATE",
                expectedDeliverables=[
                    "Jupyter Notebook walkthrough explaining model interpretability (SHAP)",
                    "Modular Python package with automated pytest unit coverage",
                ],
                resumeEvidenceValue="Evidences data science fundamentals, statistical feature engineering, and production deployment.",
            )
        )
    else:
        # Full-stack / general
        projects.append(
            ProjectRecommendationItem(
                id=f"proj-{uuid.uuid4().hex[:8]}",
                title="Full-Stack Collaborative Kanban Application",
                targetSkills=["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs", "Tailwind CSS"],
                objective="Architect a responsive full-stack task management workspace with drag-and-drop workflow columns and real-time state synchronization.",
                suggestedFeatures=[
                    "Optimistic UI updates with framer-motion transitions",
                    "Relational schema modeling cards, labels, and swimlanes",
                    "Role-based workspace access permissions",
                ],
                technologyChoices=["React", "TypeScript", "Tailwind CSS", "Node.js / Express", "PostgreSQL"],
                difficulty="INTERMEDIATE",
                expectedDeliverables=[
                    "Live deployed application link and GitHub repository",
                    "Component test suite with React Testing Library and Vitest",
                ],
                resumeEvidenceValue="Validates full-stack fluency, state management patterns, and production UX craft.",
            )
        )
        projects.append(
            ProjectRecommendationItem(
                id=f"proj-{uuid.uuid4().hex[:8]}",
                title="Cloud-Native Microservices Deployment Harness",
                targetSkills=["Docker", "Kubernetes", "CI/CD", "Linux", "Terraform"],
                objective="Provisioned reproducible multi-environment cloud infrastructure using Infrastructure as Code (IaC) with automated GitOps deployment.",
                suggestedFeatures=[
                    "Declarative Kubernetes manifests with ingress routing and resource quotas",
                    "Automated canary deployment workflow using GitHub Actions",
                ],
                technologyChoices=["Terraform", "Kubernetes", "Docker", "GitHub Actions"],
                difficulty="ADVANCED",
                expectedDeliverables=[
                    "Clean Terraform configuration with modular AWS / GCP resources",
                    "Step-by-step reproduction runbook",
                ],
                resumeEvidenceValue="Direct proof of DevOps automation, cloud architecture, and container orchestration.",
            )
        )

    return ProjectRecommendationsResponse(
        careerTrackId=career_track.get("id"),
        targetRole=target_role,
        projects=projects,
    )
