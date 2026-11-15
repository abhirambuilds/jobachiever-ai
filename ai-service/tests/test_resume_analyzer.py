import json
import pytest
from unittest.mock import AsyncMock, patch
from starlette.testclient import TestClient

from app.schemas.ai_response import AIGenerationResponse, TokenUsage
from tests.conftest import (
    SAMPLE_RESUME_LINES,
    create_synthetic_pdf,
    create_synthetic_docx,
)

MOCK_ANALYSIS_JSON = {
    "overallAssessment": {
        "score": 88,
        "rating": "EXCELLENT",
        "summary": "Demonstrates strong full-stack engineering proficiency with clear ownership of distributed systems.",
        "contentScore": 90,
        "skillsScore": 88,
        "experienceScore": 90,
        "impactScore": 82,
        "structureScore": 90,
        "atsScore": 85,
        "disclaimer": "Heuristic assessment based on standard hiring rubrics."
    },
    "sectionAnalysis": [
        {
            "section": "EXPERIENCE",
            "status": "PRESENT",
            "strengths": ["Clear role titles and verified accomplishments at Acme Corp."],
            "issues": ["Some bullets lack quantified latency and throughput metrics."],
            "recommendations": ["Add latency or query reduction numbers where known."]
        },
        {
            "section": "SKILLS",
            "status": "PRESENT",
            "strengths": ["Well-organized stack categorized into Python, Java, SQL, and Docker."],
            "issues": [],
            "recommendations": ["Ensure testing frameworks like pytest and JUnit are listed."]
        }
    ],
    "strengths": [
        "Strong verified full-stack architecture background with Java and Python.",
        "Clean single-column layout structure."
    ],
    "weaknesses": [
        "Some bullet points lack explicit scale metrics (e.g. requests/sec)."
    ],
    "skillsAnalysis": {
        "identifiedSkills": ["Python", "Java", "Docker", "PostgreSQL", "React"],
        "underrepresentedSkills": ["Kubernetes", "CI/CD Pipelines"],
        "notes": ["Technical proficiencies are accurately positioned without keyword stuffing."]
    },
    "impactAnalysis": {
        "strongExamples": [
            {
                "quote": "Engineered payment processing pipeline",
                "impactExplanation": "Conveys decisive technical leadership and direct ownership.",
                "section": "EXPERIENCE"
            }
        ],
        "improvementOpportunities": [
            {
                "originalExcerpt": "Worked on backend microservices",
                "issue": "Passive phrasing and vague technical agency.",
                "suggestedRewrite": "Architected Spring Boot backend microservices, supporting [actual functional outcome].",
                "section": "EXPERIENCE"
            }
        ]
    },
    "atsAnalysis": {
        "readability": "GOOD",
        "observations": ["Standard section headings detected (Experience, Education, Skills)."],
        "warnings": [],
        "disclaimer": "ATS behavior varies across different ATS platforms."
    },
    "recommendations": [
        {
            "id": "rec-1",
            "section": "EXPERIENCE",
            "priority": "HIGH",
            "issue": "Vague verbs in junior experience bullets.",
            "why": "Hiring teams prioritize candidates with active technical ownership.",
            "suggestedImprovement": "Replace passive verbs with active verbs like 'Architected' or 'Spearheaded'.",
            "originalExcerpt": "Worked on backend microservices"
        }
    ],
    "extractionWarnings": [],
    "createdAt": "2026-11-15T12:00:00Z"
}


def test_analyze_resume_success_groq(client: TestClient, auth_headers: dict):
    """Verifies successful resume analysis with Groq provider and structured response validation."""
    pdf_bytes = create_synthetic_pdf(SAMPLE_RESUME_LINES)

    mock_resp = AIGenerationResponse(
        provider="GROQ",
        model="llama-3.3-70b-versatile",
        content=json.dumps(MOCK_ANALYSIS_JSON),
        usage=TokenUsage(input_tokens=150, output_tokens=300, total_tokens=450),
        finish_reason="STOP"
    )

    with patch("app.services.ai_service.AIService.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_resp

        response = client.post(
            "/api/v1/analyze-resume",
            headers=auth_headers,
            files={"file": ("alex_mercer.pdf", pdf_bytes, "application/pdf")},
            data={
                "provider": "GROQ",
                "model": "llama-3.3-70b-versatile",
                "temperature": "0.2",
                "user_consent": "true"
            }
        )

        assert response.status_code == 200
        data = response.json()

        assert data["provider"] == "GROQ"
        assert data["model"] == "llama-3.3-70b-versatile"
        assert data["overallAssessment"]["score"] == 88
        assert data["overallAssessment"]["rating"] == "EXCELLENT"
        assert len(data["sectionAnalysis"]) >= 1
        assert len(data["strengths"]) >= 1
        assert len(data["skillsAnalysis"]["identifiedSkills"]) >= 1
        assert len(data["impactAnalysis"]["improvementOpportunities"]) >= 1
        assert data["atsAnalysis"]["readability"] == "GOOD"
        assert len(data["recommendations"]) >= 1


def test_analyze_resume_success_gemini(client: TestClient, auth_headers: dict):
    """Verifies successful resume analysis with Google Gemini provider on DOCX file."""
    docx_bytes = create_synthetic_docx([(line, "Normal") for line in SAMPLE_RESUME_LINES])

    mock_resp = AIGenerationResponse(
        provider="GEMINI",
        model="gemini-2.0-flash",
        content=json.dumps(MOCK_ANALYSIS_JSON),
        usage=TokenUsage(input_tokens=180, output_tokens=320, total_tokens=500),
        finish_reason="STOP"
    )

    with patch("app.services.ai_service.AIService.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_resp

        response = client.post(
            "/api/v1/analyze-resume",
            headers=auth_headers,
            files={"file": ("alex_mercer.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
            data={
                "provider": "GEMINI",
                "model": "gemini-2.0-flash",
                "temperature": "0.2",
                "user_consent": "true"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "GEMINI"
        assert data["overallAssessment"]["score"] == 88


def test_analyze_resume_missing_consent_rejected(client: TestClient, auth_headers: dict):
    """Analysis request without explicit user consent must be rejected with 403 Forbidden."""
    pdf_bytes = create_synthetic_pdf(SAMPLE_RESUME_LINES)

    response = client.post(
        "/api/v1/analyze-resume",
        headers=auth_headers,
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
        data={"user_consent": "false"}
    )

    assert response.status_code == 403
    assert "User consent is required" in response.json()["message"]


def test_analyze_resume_unauthorized(client: TestClient):
    """Request without internal service key must be rejected with 401."""
    pdf_bytes = create_synthetic_pdf(SAMPLE_RESUME_LINES)

    response = client.post(
        "/api/v1/analyze-resume",
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
        data={"user_consent": "true"}
    )

    assert response.status_code == 401


def test_analyze_resume_empty_file(client: TestClient, auth_headers: dict):
    """Empty 0-byte file must be rejected with 400 Bad Request."""
    response = client.post(
        "/api/v1/analyze-resume",
        headers=auth_headers,
        files={"file": ("empty.pdf", b"", "application/pdf")},
        data={"user_consent": "true"}
    )

    assert response.status_code == 400
    assert "empty" in response.json()["message"].lower()


def test_analyze_resume_scanned_pdf_rejected(client: TestClient, auth_headers: dict):
    """PDF with no extractable text (e.g. scanned image) must be rejected with 422 Unprocessable Entity."""
    empty_pdf = create_synthetic_pdf([])

    response = client.post(
        "/api/v1/analyze-resume",
        headers=auth_headers,
        files={"file": ("scanned.pdf", empty_pdf, "application/pdf")},
        data={"user_consent": "true"}
    )

    assert response.status_code == 422
    assert "scanned" in response.json()["message"].lower() or "insufficient" in response.json()["message"].lower()


def test_analyze_resume_malformed_llm_json(client: TestClient, auth_headers: dict):
    """Handles malformed JSON from provider safely with 502 Bad Gateway."""
    pdf_bytes = create_synthetic_pdf(SAMPLE_RESUME_LINES)

    mock_resp = AIGenerationResponse(
        provider="GROQ",
        model="llama-3.3-70b-versatile",
        content="This is not JSON at all.",
        usage=TokenUsage(input_tokens=50, output_tokens=10, total_tokens=60),
        finish_reason="STOP"
    )

    with patch("app.services.ai_service.AIService.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_resp

        response = client.post(
            "/api/v1/analyze-resume",
            headers=auth_headers,
            files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
            data={"user_consent": "true"}
        )

        assert response.status_code == 502
        assert "malformed json" in response.json()["message"].lower()
