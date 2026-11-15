import pytest
from fastapi.testclient import TestClient

from app.career_intelligence.prioritizer import calculate_skill_priority
from app.career_intelligence.schemas import (
    EvidenceStatus,
    GapClassification,
    MilestoneStatus,
    PriorityLevel,
)
from app.career_intelligence.skill_normalizer import (
    canonicalize_skill,
    categorize_skill,
    evaluate_evidence_status,
    get_skill_dependencies,
    normalize_skill_token,
)
from app.main import app

client = TestClient(app)
INTERNAL_KEY = "dev-internal-service-secret-key-change-in-prod"


@pytest.fixture
def sample_backend_track():
    return {
        "id": "trk-backend-1",
        "name": "Core Backend Track",
        "target_role": "Backend Developer",
        "target_seniority": "MID_LEVEL",
        "required_skills": ["Java", "Spring Boot", "SQL", "PostgreSQL", "Docker", "REST APIs"],
        "preferred_skills": ["Kubernetes", "Redis", "Apache Kafka", "Microservices Architecture"],
        "career_goals": "Master distributed event streaming and microservices architecture.",
        "industries": ["Enterprise SaaS", "Fintech"],
    }


@pytest.fixture
def sample_aiml_track():
    return {
        "id": "trk-aiml-1",
        "name": "Machine Learning Track",
        "target_role": "AI/ML Engineer",
        "target_seniority": "MID_LEVEL",
        "required_skills": ["Python", "PyTorch", "Machine Learning", "NumPy", "Pandas", "Scikit-Learn"],
        "preferred_skills": ["Deep Learning", "Large Language Models", "Vector Databases", "Docker"],
        "career_goals": "Build scalable generative AI and retrieval pipelines.",
        "industries": ["AI & Data Systems"],
    }


@pytest.fixture
def sample_profile():
    return {
        "skills": [
            {"name": "Java", "verified": True, "yearsOfExperience": 3},
            {"name": "SQL", "verified": True, "yearsOfExperience": 2},
            {"name": "Spring Boot", "verified": False},
        ],
        "experience": [
            {
                "title": "Software Engineer",
                "company": "Tech Corp",
                "bullet_points": [
                    "Engineered containerized services with Docker and deployed to production.",
                    "Designed REST APIs with sub-50ms latency.",
                ],
            }
        ],
        "projects": [
            {
                "title": "Vector Search Engine",
                "technologies": ["Python", "PostgreSQL", "FastAPI"],
                "description": "High-throughput similarity search platform.",
            }
        ],
        "certifications": [
            {"name": "Oracle Certified Professional: Java SE 21 Developer"}
        ],
    }


# ==============================================================================
# Unit Tests: Normalizer, Prioritizer, Gap Analyzer
# ==============================================================================

def test_skill_normalization_canonical_aliases():
    """Requirement 1 & 2: Skill normalization and valid alias resolution."""
    assert canonicalize_skill("js") == "JavaScript"
    assert canonicalize_skill("javascript") == "JavaScript"
    assert canonicalize_skill("ts") == "TypeScript"
    assert canonicalize_skill("typescript") == "TypeScript"
    assert canonicalize_skill("postgres") == "PostgreSQL"
    assert canonicalize_skill("postgresql") == "PostgreSQL"
    assert canonicalize_skill("node") == "Node.js"
    assert canonicalize_skill("nodejs") == "Node.js"
    assert canonicalize_skill("k8s") == "Kubernetes"
    assert canonicalize_skill("springboot") == "Spring Boot"
    assert canonicalize_skill("tf") == "Terraform"
    assert canonicalize_skill("py") == "Python"

    # Distinct technologies must NEVER be equated
    assert canonicalize_skill("Java") != canonicalize_skill("JavaScript")
    assert canonicalize_skill("C#") != canonicalize_skill("C++")


def test_evidence_status_classification(sample_profile):
    """Requirement 3: Evidence status classification (CONFIRMED, EVIDENCED, UNVERIFIED, MISSING)."""
    # 1. Java is confirmed in profile (verified: True)
    status_java, src_java = evaluate_evidence_status("Java", sample_profile)
    assert status_java == EvidenceStatus.CONFIRMED
    assert "Verified in Profile" in src_java

    # 2. Spring Boot is in profile but unverified (verified: False)
    status_spring, src_spring = evaluate_evidence_status("Spring Boot", sample_profile)
    assert status_spring == EvidenceStatus.UNVERIFIED
    assert "Awaiting confirmation" in src_spring

    # 3. Docker is not in profile.skills, but evidenced in experience bullet points
    status_docker, src_docker = evaluate_evidence_status("Docker", sample_profile)
    assert status_docker == EvidenceStatus.EVIDENCED
    assert "Demonstrated in Experience" in src_docker

    # 4. FastAPI is in project technologies
    status_fastapi, src_fastapi = evaluate_evidence_status("FastAPI", sample_profile)
    assert status_fastapi == EvidenceStatus.EVIDENCED
    assert "Demonstrated in Project" in src_fastapi

    # 5. Kafka is completely missing from profile
    status_kafka, src_kafka = evaluate_evidence_status("Apache Kafka", sample_profile)
    assert status_kafka == EvidenceStatus.MISSING
    assert "Not demonstrated" in src_kafka


def test_skill_dependency_ordering():
    """Requirement 8: Skill dependency relationships."""
    deps_spring = get_skill_dependencies("Spring Boot")
    assert "Java" in deps_spring

    deps_next = get_skill_dependencies("Next.js")
    assert "React" in deps_next

    deps_k8s = get_skill_dependencies("Kubernetes")
    assert "Docker" in deps_k8s


def test_deterministic_prioritization(sample_backend_track):
    """Requirement 5 & 7: Deterministic requirement prioritization."""
    all_target = ["Java", "Spring Boot", "Apache Kafka", "PostgreSQL"]

    # Kafka: REQUIRED/PREFERRED, missing, foundational
    prio_kafka, score_kafka = calculate_skill_priority(
        skill_name="Apache Kafka",
        importance="PREFERRED",
        evidence_status=EvidenceStatus.MISSING,
        career_track=sample_backend_track,
        all_target_skills=all_target,
    )
    assert 0.0 <= score_kafka <= 1.0
    assert prio_kafka in (PriorityLevel.HIGH, PriorityLevel.CRITICAL, PriorityLevel.MEDIUM)

    # Java: already confirmed -> score is scaled down
    prio_java, score_java = calculate_skill_priority(
        skill_name="Java",
        importance="REQUIRED",
        evidence_status=EvidenceStatus.CONFIRMED,
        career_track=sample_backend_track,
        all_target_skills=all_target,
    )
    assert score_java < score_kafka


def test_job_frequency_prioritization(sample_backend_track):
    """Requirement 7: Job frequency impacts deterministic priority score."""
    all_target = ["Kubernetes", "Redis"]
    jobs_with_k8s = [
        {"title": "DevOps Engineer", "description": "Needs deep Kubernetes and Docker."},
        {"title": "Backend Architect", "description": "Experience running Kubernetes in cloud."},
    ]

    _, score_k8s_freq = calculate_skill_priority(
        skill_name="Kubernetes",
        importance="PREFERRED",
        evidence_status=EvidenceStatus.MISSING,
        career_track=sample_backend_track,
        all_target_skills=all_target,
        target_jobs=jobs_with_k8s,
    )

    _, score_k8s_no_jobs = calculate_skill_priority(
        skill_name="Kubernetes",
        importance="PREFERRED",
        evidence_status=EvidenceStatus.MISSING,
        career_track=sample_backend_track,
        all_target_skills=all_target,
        target_jobs=[],
    )

    assert score_k8s_freq >= score_k8s_no_jobs


# ==============================================================================
# Integration Tests: Endpoints
# ==============================================================================

def test_endpoint_skill_gaps_analysis(sample_backend_track, sample_profile):
    """Requirement 4 & 6: Full skill gap analysis endpoint for career track."""
    payload = {
        "careerTrack": sample_backend_track,
        "profileData": sample_profile,
        "provider": "GROQ",
        "userConsent": True,
    }

    res = client.post(
        "/api/v1/career/skill-gaps",
        json=payload,
        headers={"X-Internal-Service-Key": INTERNAL_KEY},
    )

    assert res.status_code == 200
    data = res.json()
    assert data["targetRole"] == "Backend Developer"
    assert "Java" in data["demonstratedSkills"]
    assert len(data["skillGaps"]) > 0

    # Ensure items have complete required structure
    first_gap = data["skillGaps"][0]
    assert "skillName" in first_gap
    assert "skillCategory" in first_gap
    assert "currentEvidenceStatus" in first_gap
    assert "gapExplanation" in first_gap
    assert "priority" in first_gap
    assert "confidence" in first_gap
    assert first_gap["confidence"] == "HIGH"


def test_multiple_career_tracks_isolation(sample_backend_track, sample_aiml_track, sample_profile):
    """Requirement 6: Support multiple career tracks without cross-contamination."""
    # Analyze Backend Track
    res_backend = client.post(
        "/api/v1/career/skill-gaps",
        json={"careerTrack": sample_backend_track, "profileData": sample_profile, "userConsent": True},
        headers={"X-Internal-Service-Key": INTERNAL_KEY},
    )
    assert res_backend.status_code == 200
    backend_skills = [g["skillName"] for g in res_backend.json()["skillGaps"]]
    assert "Java" in backend_skills
    assert "PyTorch" not in backend_skills

    # Analyze AI/ML Track
    res_aiml = client.post(
        "/api/v1/career/skill-gaps",
        json={"careerTrack": sample_aiml_track, "profileData": sample_profile, "userConsent": True},
        headers={"X-Internal-Service-Key": INTERNAL_KEY},
    )
    assert res_aiml.status_code == 200
    aiml_skills = [g["skillName"] for g in res_aiml.json()["skillGaps"]]
    assert "PyTorch" in aiml_skills
    assert "Spring Boot" not in aiml_skills


def test_endpoint_career_recommendations(sample_backend_track, sample_profile):
    """Requirement 9: Career recommendations endpoint."""
    payload = {
        "careerTrack": sample_backend_track,
        "profileData": sample_profile,
        "provider": "GROQ",
        "userConsent": True,
    }

    res = client.post(
        "/api/v1/career/recommendations",
        json=payload,
        headers={"X-Internal-Service-Key": INTERNAL_KEY},
    )

    assert res.status_code == 200
    data = res.json()
    assert data["targetRole"] == "Backend Developer"
    assert len(data["recommendations"]) >= 3
    rec = data["recommendations"][0]
    assert "title" in rec
    assert "rationale" in rec
    assert "actionableSteps" in rec
    assert len(rec["actionableSteps"]) > 0


def test_endpoint_roadmap_generation(sample_backend_track, sample_profile):
    """Requirement 10: Phased learning roadmap generation."""
    payload = {
        "careerTrack": sample_backend_track,
        "profileData": sample_profile,
        "provider": "GROQ",
        "userConsent": True,
    }

    res = client.post(
        "/api/v1/career/roadmaps/generate",
        json=payload,
        headers={"X-Internal-Service-Key": INTERNAL_KEY},
    )

    assert res.status_code == 200
    data = res.json()
    assert data["targetRole"] == "Backend Developer"
    assert len(data["phases"]) >= 2

    # Check phase ordering and milestone structure
    phase1 = data["phases"][0]
    assert phase1["phase"] == 1
    assert len(phase1["milestones"]) > 0

    ms = phase1["milestones"][0]
    assert "title" in ms
    assert "relatedSkills" in ms
    assert ms["status"] == "NOT_STARTED"
    assert len(ms["completionCriteria"]) > 0
    assert data["estimatedDuration"] is None  # Strictly avoid unevidenced timeline guarantees


def test_endpoint_project_recommendations(sample_backend_track, sample_profile):
    """Requirement 11: Project recommendations endpoint."""
    payload = {
        "careerTrack": sample_backend_track,
        "profileData": sample_profile,
        "provider": "GROQ",
        "userConsent": True,
    }

    res = client.post(
        "/api/v1/career/projects/recommend",
        json=payload,
        headers={"X-Internal-Service-Key": INTERNAL_KEY},
    )

    assert res.status_code == 200
    data = res.json()
    assert len(data["projects"]) >= 2
    proj = data["projects"][0]
    assert "title" in proj
    assert "targetSkills" in proj
    assert "objective" in proj
    assert "expectedDeliverables" in proj
    assert "resumeEvidenceValue" in proj


def test_endpoint_missing_consent_rejected(sample_backend_track, sample_profile):
    """Requirement 18: Missing explicit consent rejected with HTTP 403."""
    payload = {
        "careerTrack": sample_backend_track,
        "profileData": sample_profile,
        "userConsent": False,
    }

    res = client.post(
        "/api/v1/career/skill-gaps",
        json=payload,
        headers={"X-Internal-Service-Key": INTERNAL_KEY},
    )

    assert res.status_code == 403
    assert "consent is required" in res.json().get("message", "").lower()


def test_endpoint_unauthorized_without_internal_key(sample_backend_track, sample_profile):
    """Internal service key security dependency."""
    payload = {
        "careerTrack": sample_backend_track,
        "profileData": sample_profile,
        "userConsent": True,
    }

    res = client.post(
        "/api/v1/career/skill-gaps",
        json=payload,
    )

    assert res.status_code == 401


def test_endpoint_explicit_gemini_selection(sample_aiml_track, sample_profile):
    """Requirement 16 & 17: Explicit Gemini selection accepted."""
    payload = {
        "careerTrack": sample_aiml_track,
        "profileData": sample_profile,
        "provider": "GEMINI",
        "model": "gemini-2.0-flash",
        "userConsent": True,
    }

    res = client.post(
        "/api/v1/career/skill-gaps",
        json=payload,
        headers={"X-Internal-Service-Key": INTERNAL_KEY},
    )

    assert res.status_code == 200
    assert res.json()["targetRole"] == "AI/ML Engineer"


def test_empty_profile_handling(sample_backend_track):
    """Requirement 12: Handles empty or partial candidate profile gracefully."""
    payload = {
        "careerTrack": sample_backend_track,
        "profileData": {},
        "userConsent": True,
    }

    res = client.post(
        "/api/v1/career/skill-gaps",
        json=payload,
        headers={"X-Internal-Service-Key": INTERNAL_KEY},
    )

    assert res.status_code == 200
    data = res.json()
    assert len(data["demonstratedSkills"]) == 0
    assert len(data["missingEvidenceSkills"]) > 0
