import pytest
from starlette.testclient import TestClient


def test_health_endpoint_returns_up(client: TestClient):
    """GET /api/v1/health should return 200 OK with expected status, service, and version."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "UP"
    assert data["service"] == "jobachiever-ai-service"
    assert data["version"] == "1.0.0"


def test_health_endpoint_does_not_leak_secrets(client: TestClient):
    """Health check must never leak environment secrets or credentials."""
    response = client.get("/api/v1/health")
    payload = response.text.lower()

    assert "secret" not in payload
    assert "key" not in payload
    assert "password" not in payload
    assert "token" not in payload
