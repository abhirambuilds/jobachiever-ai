import json
from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient

from app.schemas.ai_response import AIGenerationResponse, TokenUsage
from app.services.ai_service import AIService


SAMPLE_JOB_DESCRIPTION = """
About Acme Corporation:
Acme Corp is a hyper-growth enterprise payments provider. We are hiring a Senior Distributed Systems Engineer.

Location: San Francisco, CA (Hybrid: 2 days in office)
Employment Type: Full-time

About the Role:
You will architect, scale, and maintain high-throughput transactional settlement engines.

Requirements (Must-Have):
• 5+ years of software development experience in Java or Go.
• Deep expertise with Spring Boot 3, Kafka, and PostgreSQL.
• Bachelor's degree in Computer Science or equivalent practical experience.
• Proven track record architecting distributed microservices.

Nice-to-Have (Bonus Qualifications):
• Hands-on experience with pgvector, Redis, or semantic embeddings.
• Prior experience in payments, fintech, or PCI-DSS compliance.
• AWS Certified Solutions Architect certification.

Responsibilities:
• Architect robust distributed transaction services with 99.99% availability.
• Mentor early-career engineers and lead architectural design reviews.
• Participate in lightweight rotational on-call support.

We also use Docker and Kubernetes in our development workflow.
"""

SAMPLE_PARSED_OUTPUT = {
    "jobOverview": {
        "jobTitle": "Senior Distributed Systems Engineer",
        "companyName": "Acme Corp",
        "roleCategory": "Software Engineering & Infrastructure",
        "seniority": "SENIOR",
        "employmentType": "FULL_TIME",
        "workArrangement": "HYBRID",
        "location": "San Francisco, CA",
        "experienceRange": {
            "minimumYears": 5.0,
            "maximumYears": None,
            "rawRequirement": "5+ years of software development experience"
        }
    },
    "technicalSkills": {
        "required": ["Java", "Go", "Spring Boot 3", "Kafka", "PostgreSQL"],
        "preferred": ["pgvector", "Redis", "semantic embeddings"],
        "mentioned": ["Docker", "Kubernetes"]
    },
    "softSkills": ["Mentorship", "Cross-functional collaboration", "Architectural leadership"],
    "responsibilities": [
        "Architect robust distributed transaction services with 99.99% availability",
        "Mentor early-career engineers and lead architectural design reviews",
        "Participate in lightweight rotational on-call support"
    ],
    "qualifications": {
        "education": ["Bachelor's degree in Computer Science or equivalent practical experience"],
        "certifications": ["AWS Certified Solutions Architect"],
        "otherRequirements": ["PCI-DSS compliance familiarity"]
    },
    "toolsAndTechnologies": ["Spring Boot 3", "Kafka", "PostgreSQL", "Docker", "Kubernetes", "Redis", "pgvector"],
    "keywords": {
        "coreTechnical": ["Java", "Go", "Distributed Systems", "PostgreSQL"],
        "frameworksAndTools": ["Spring Boot 3", "Kafka", "Docker", "Kubernetes", "Redis"],
        "domain": ["Fintech", "Enterprise Payments", "Transactional Settlement", "PCI-DSS"],
        "softSkills": ["Leadership", "Mentorship", "Design Reviews"],
        "roleAndResponsibility": ["Architect", "Scale", "Maintain", "Mentor"]
    },
    "requirements": [
        {
            "name": "Java or Go Experience",
            "category": "SKILL",
            "importance": "CRITICAL",
            "requirementType": "EXPLICIT",
            "evidenceExcerpt": "5+ years of software development experience in Java or Go.",
            "section": "Requirements (Must-Have)",
            "confidence": 1.0
        },
        {
            "name": "AWS Certified Solutions Architect",
            "category": "CERTIFICATION",
            "importance": "MEDIUM",
            "requirementType": "EXPLICIT",
            "evidenceExcerpt": "AWS Certified Solutions Architect certification.",
            "section": "Nice-to-Have (Bonus Qualifications)",
            "confidence": 0.95
        },
        {
            "name": "High Availability System Design",
            "category": "RESPONSIBILITY",
            "importance": "HIGH",
            "requirementType": "INFERRED",
            "evidenceExcerpt": "Architect robust distributed transaction services with 99.99% availability.",
            "section": "Responsibilities",
            "confidence": 0.90
        }
    ],
    "ambiguities": [
        {
            "issue": "Specific Go proficiency depth unclear",
            "category": "CLARIFICATION_NEEDED",
            "explanation": "JD mentions 'Java or Go' without specifying whether Go is primarily used in production or optional.",
            "excerpt": "experience in Java or Go"
        }
    ],
    "redFlags": [],
    "summary": "Senior Distributed Systems Engineer role at Acme Corp requiring 5+ years of backend engineering in Java/Go.",
    "warnings": []
}


def test_analyze_job_description_success_groq(client: TestClient, auth_headers: dict):
    """Verifies successful job description decomposition with Groq provider."""
    mock_resp = AIGenerationResponse(
        provider="GROQ",
        model="llama-3.3-70b-versatile",
        content=json.dumps(SAMPLE_PARSED_OUTPUT),
        usage=TokenUsage(input_tokens=450, output_tokens=320, total_tokens=770),
        finish_reason="STOP"
    )

    with patch.object(AIService, "generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_resp

        response = client.post(
            "/api/v1/analyze/job-description",
            headers=auth_headers,
            json={
                "description": SAMPLE_JOB_DESCRIPTION,
                "provider": "GROQ",
                "temperature": 0.2,
                "user_consent": True
            }
        )

        assert response.status_code == 200
        data = response.json()

        # Job overview & seniority
        assert data["jobOverview"]["jobTitle"] == "Senior Distributed Systems Engineer"
        assert data["jobOverview"]["companyName"] == "Acme Corp"
        assert data["jobOverview"]["seniority"] == "SENIOR"
        assert data["jobOverview"]["employmentType"] == "FULL_TIME"
        assert data["jobOverview"]["workArrangement"] == "HYBRID"
        assert data["jobOverview"]["experienceRange"]["minimumYears"] == 5.0

        # Required vs Preferred vs Mentioned distinction
        assert "Java" in data["technicalSkills"]["required"]
        assert "Spring Boot 3" in data["technicalSkills"]["required"]
        assert "pgvector" in data["technicalSkills"]["preferred"]
        assert "Docker" in data["technicalSkills"]["mentioned"]

        # Qualifications
        assert len(data["qualifications"]["education"]) > 0
        assert "AWS Certified Solutions Architect" in data["qualifications"]["certifications"]

        # Requirements and evidence excerpts
        reqs = data["requirements"]
        assert len(reqs) == 3
        explicit_req = next(r for r in reqs if r["requirementType"] == "EXPLICIT")
        assert explicit_req["evidenceExcerpt"] is not None
        inferred_req = next(r for r in reqs if r["requirementType"] == "INFERRED")
        assert inferred_req["requirementType"] == "INFERRED"

        # Ambiguities
        assert len(data["ambiguities"]) == 1
        assert data["ambiguities"][0]["category"] == "CLARIFICATION_NEEDED"


def test_analyze_job_description_success_gemini(client: TestClient, auth_headers: dict):
    """Verifies successful job description decomposition with Google Gemini provider."""
    mock_resp = AIGenerationResponse(
        provider="GEMINI",
        model="gemini-2.0-flash",
        content=json.dumps(SAMPLE_PARSED_OUTPUT),
        usage=TokenUsage(input_tokens=420, output_tokens=310, total_tokens=730),
        finish_reason="STOP"
    )

    with patch.object(AIService, "generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_resp

        response = client.post(
            "/api/v1/analyze/job-description",
            headers=auth_headers,
            json={
                "description": SAMPLE_JOB_DESCRIPTION,
                "provider": "GEMINI",
                "temperature": 0.2,
                "user_consent": True
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "GEMINI"
        assert data["jobOverview"]["seniority"] == "SENIOR"


def test_analyze_job_description_alias_endpoint(client: TestClient, auth_headers: dict):
    """Verifies /analyze-job-description alias endpoint works identically."""
    mock_resp = AIGenerationResponse(
        provider="GROQ",
        model="llama-3.3-70b-versatile",
        content=json.dumps(SAMPLE_PARSED_OUTPUT),
        usage=TokenUsage(input_tokens=400, output_tokens=300, total_tokens=700),
        finish_reason="STOP"
    )

    with patch.object(AIService, "generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_resp

        response = client.post(
            "/api/v1/analyze-job-description",
            headers=auth_headers,
            json={
                "description": SAMPLE_JOB_DESCRIPTION,
                "provider": "GROQ"
            }
        )

        assert response.status_code == 200
        assert response.json()["jobOverview"]["jobTitle"] == "Senior Distributed Systems Engineer"


def test_analyze_job_description_missing_consent(client: TestClient, auth_headers: dict):
    """Fails with 403 Forbidden when candidate consent is false."""
    response = client.post(
        "/api/v1/analyze/job-description",
        headers=auth_headers,
        json={
            "description": SAMPLE_JOB_DESCRIPTION,
            "provider": "GROQ",
            "user_consent": False
        }
    )

    assert response.status_code == 403
    assert "consent is required" in response.json()["message"].lower()


def test_analyze_job_description_too_short(client: TestClient, auth_headers: dict):
    """Input < 50 characters is rejected with 400 Bad Request."""
    response = client.post(
        "/api/v1/analyze/job-description",
        headers=auth_headers,
        json={
            "description": "Short job title only.",
            "provider": "GROQ"
        }
    )

    assert response.status_code == 400


def test_analyze_job_description_missing_auth(client: TestClient):
    """Fails with 401 Unauthorized without internal service key."""
    response = client.post(
        "/api/v1/analyze/job-description",
        json={"description": SAMPLE_JOB_DESCRIPTION}
    )

    assert response.status_code == 401


def test_analyze_job_description_malformed_llm_json(client: TestClient, auth_headers: dict):
    """Returns 502 Bad Gateway when LLM produces malformed non-JSON."""
    mock_resp = AIGenerationResponse(
        provider="GROQ",
        model="llama-3.3-70b-versatile",
        content="Not a JSON output at all.",
        usage=TokenUsage(input_tokens=50, output_tokens=10, total_tokens=60),
        finish_reason="STOP"
    )

    with patch.object(AIService, "generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_resp

        response = client.post(
            "/api/v1/analyze/job-description",
            headers=auth_headers,
            json={
                "description": SAMPLE_JOB_DESCRIPTION,
                "provider": "GROQ"
            }
        )

        assert response.status_code == 502
        assert "malformed" in response.json()["message"].lower()
