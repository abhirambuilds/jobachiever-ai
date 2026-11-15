import json
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app
from app.providers.base import (
    ProviderAuthenticationError,
    ProviderRateLimitError,
    ProviderTimeoutError,
    StructuredOutputError,
    UnsupportedProviderError,
    UserConsentRequiredError,
)
from app.schemas.ai_response import AIGenerationResponse, TokenUsage
from app.services.ai_service import get_ai_service


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_header():
    settings = get_settings()
    return {"X-Internal-Service-Key": settings.internal_service_key}


def test_list_providers_endpoint(client):
    response = client.get("/api/v1/providers")
    assert response.status_code == 200
    data = response.json()
    assert "providers" in data
    providers = data["providers"]
    assert len(providers) >= 2

    groq = next(p for p in providers if p["id"] == "GROQ")
    assert groq["name"] == "Groq Cloud"
    assert groq["default"] is True
    assert "apiKey" not in groq
    assert "secret" not in groq

    gemini = next(p for p in providers if p["id"] == "GEMINI")
    assert gemini["id"] == "GEMINI"
    assert gemini["available"] is False
    assert gemini["default"] is False


def test_generate_requires_internal_auth(client):
    payload = {"provider": "GROQ", "prompt": "Hello"}
    # No auth header
    response = client.post("/api/v1/generate", json=payload)
    assert response.status_code == 401

    # Invalid auth header
    response = client.post(
        "/api/v1/generate",
        headers={"X-Internal-Service-Key": "invalid-wrong-key"},
        json=payload
    )
    assert response.status_code == 401


def test_generate_text_success(client, auth_header):
    mock_response = AIGenerationResponse(
        provider="GROQ",
        model="llama-3.3-70b-versatile",
        content="Professional summary for senior engineer.",
        usage=TokenUsage(input_tokens=10, output_tokens=30, total_tokens=40),
        finish_reason="STOP",
        processing_time_ms=85.0
    )

    with patch("app.services.ai_service.AIService.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_response

        payload = {
            "provider": "GROQ",
            "prompt": "Draft a summary",
            "systemPrompt": "You are a career expert"
        }
        response = client.post("/api/v1/generate", headers=auth_header, json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "GROQ"
        assert data["model"] == "llama-3.3-70b-versatile"
        assert data["content"] == "Professional summary for senior engineer."
        assert data["usage"]["totalTokens"] == 40
        # Verify no credentials leaked
        raw_text = response.text
        assert "gsk_" not in raw_text
        assert "secret" not in raw_text


def test_generate_nested_input_format(client, auth_header):
    mock_response = AIGenerationResponse(
        provider="GROQ",
        model="llama-3.3-70b-versatile",
        content="Summary from nested input.",
        usage=TokenUsage(input_tokens=8, output_tokens=20, total_tokens=28),
        finish_reason="STOP",
        processing_time_ms=60.0
    )

    with patch("app.services.ai_service.AIService.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_response

        # Request matching prompt specification format
        payload = {
            "provider": "GROQ",
            "task": "TEXT_GENERATION",
            "input": {
                "prompt": "Generate a professional summary."
            }
        }
        response = client.post("/api/v1/generate", headers=auth_header, json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "Summary from nested input."


def test_generate_empty_prompt_validation_failure(client, auth_header):
    payload = {"provider": "GROQ", "prompt": "   "}
    response = client.post("/api/v1/generate", headers=auth_header, json=payload)
    assert response.status_code == 400


def test_generate_unsupported_provider_rejected(client, auth_header):
    payload = {"provider": "OLLAMA", "prompt": "Prompt"}
    response = client.post("/api/v1/generate", headers=auth_header, json=payload)
    assert response.status_code == 400
    assert "excluded" in response.json()["message"].lower()


def test_generate_without_user_consent_rejected(client, auth_header):
    payload = {"provider": "GROQ", "prompt": "Prompt", "userConsent": False}
    response = client.post("/api/v1/generate", headers=auth_header, json=payload)
    assert response.status_code == 400
    assert "consent" in response.json()["message"].lower()


def test_generate_rate_limit_error_mapping(client, auth_header):
    with patch("app.services.ai_service.AIService.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = ProviderRateLimitError("Rate limit reached", retry_after=15.0, provider="GROQ")

        payload = {"provider": "GROQ", "prompt": "Prompt"}
        response = client.post("/api/v1/generate", headers=auth_header, json=payload)

        assert response.status_code == 429
        assert response.headers.get("Retry-After") == "15"


def test_generate_provider_timeout_mapping(client, auth_header):
    with patch("app.services.ai_service.AIService.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = ProviderTimeoutError("Groq timeout", provider="GROQ")

        payload = {"provider": "GROQ", "prompt": "Prompt"}
        response = client.post("/api/v1/generate", headers=auth_header, json=payload)

        assert response.status_code == 504


def test_generate_provider_authentication_error_mapping(client, auth_header):
    with patch("app.services.ai_service.AIService.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = ProviderAuthenticationError("Bad API key", provider="GROQ")

        payload = {"provider": "GROQ", "prompt": "Prompt"}
        response = client.post("/api/v1/generate", headers=auth_header, json=payload)

        assert response.status_code == 502
        assert "authentication" in response.json()["message"].lower()


def test_generate_structured_output_error_mapping(client, auth_header):
    with patch("app.services.ai_service.AIService.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = StructuredOutputError("Invalid JSON generated", provider="GROQ")

        payload = {"provider": "GROQ", "prompt": "Prompt", "responseFormat": "json"}
        response = client.post("/api/v1/generate", headers=auth_header, json=payload)

        assert response.status_code == 422


def test_generate_via_gemini_success(client, auth_header):
    mock_response = AIGenerationResponse(
        provider="GEMINI",
        model="gemini-2.0-flash",
        content="Targeted summary generated by Google Gemini 2.0 Flash.",
        usage=TokenUsage(input_tokens=25, output_tokens=50, total_tokens=75),
        finish_reason="STOP",
        processing_time_ms=110.0
    )

    with patch("app.services.ai_service.AIService.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_response

        payload = {
            "provider": "GEMINI",
            "model": "gemini-2.0-flash",
            "prompt": "Summarize candidate achievements",
            "systemPrompt": "You are a senior tech recruiter"
        }
        response = client.post("/api/v1/generate", headers=auth_header, json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "GEMINI"
        assert data["model"] == "gemini-2.0-flash"
        assert data["content"] == "Targeted summary generated by Google Gemini 2.0 Flash."
        assert data["usage"]["totalTokens"] == 75
        # Verify no credentials leaked
        assert "AIzaSy" not in response.text
        assert "apiKey" not in response.text


def test_gemini_failure_returns_error_and_does_not_fallback_to_groq(client, auth_header):
    """
    Verifies that when Gemini fails (e.g. rate limit), the error is returned directly
    and the platform NEVER silently falls back to Groq.
    """
    with patch("app.services.ai_service.AIService.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = ProviderRateLimitError("Gemini quota exceeded", provider="GEMINI")

        payload = {
            "provider": "GEMINI",
            "prompt": "Evaluate resume alignment"
        }
        response = client.post("/api/v1/generate", headers=auth_header, json=payload)

        assert response.status_code == 429
        data = response.json()
        assert "Gemini quota exceeded" in data["message"]
        # mock_gen called exactly once with GEMINI; no secondary call to Groq made
        assert mock_gen.call_count == 1
        called_req = mock_gen.call_args[0][0]
        assert called_req.provider == "GEMINI"
