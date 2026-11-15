import io
import pytest
from starlette.testclient import TestClient
from tests.conftest import (
    SAMPLE_RESUME_LINES,
    create_synthetic_pdf,
    create_synthetic_docx,
)


def test_api_parse_valid_pdf_success(client: TestClient, auth_headers: dict):
    """POST /api/v1/parse successfully processes PDF and returns normalized JSON."""
    pdf_bytes = create_synthetic_pdf(SAMPLE_RESUME_LINES)
    files = {"file": ("alex_mercer.pdf", io.BytesIO(pdf_bytes), "application/pdf")}

    response = client.post("/api/v1/parse", files=files, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert "personalInformation" in data
    assert data["personalInformation"]["name"] == "Alex Mercer"
    assert data["personalInformation"]["email"] == "alex.mercer@example.com"
    assert "skills" in data
    assert len(data["skills"]) >= 3
    assert "education" in data
    assert "experience" in data
    assert "metadata" in data
    assert data["metadata"]["fileType"] == "pdf"


def test_api_parse_valid_docx_success(client: TestClient, auth_headers: dict):
    """POST /api/v1/parse successfully processes DOCX and returns normalized JSON."""
    paragraphs = [
        ("Maria Garcia", "Heading 1"),
        ("maria.garcia@example.com", "Normal"),
        ("Education", "Heading 2"),
        ("B.S. Software Engineering, 2021", "Normal")
    ]
    docx_bytes = create_synthetic_docx(paragraphs=paragraphs)
    files = {"file": ("maria_garcia.docx", io.BytesIO(docx_bytes), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}

    response = client.post("/api/v1/parse", files=files, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["personalInformation"]["name"] == "Maria Garcia"
    assert data["personalInformation"]["email"] == "maria.garcia@example.com"
    assert data["metadata"]["fileType"] == "docx"


def test_api_parse_missing_internal_auth_rejected(client: TestClient):
    """POST /api/v1/parse without internal service auth header returns 401 Unauthorized."""
    pdf_bytes = create_synthetic_pdf(["John Doe"])
    files = {"file": ("resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}

    response = client.post("/api/v1/parse", files=files)
    assert response.status_code == 401
    assert "internal service credentials" in response.json()["message"].lower()


def test_api_parse_wrong_internal_auth_rejected(client: TestClient):
    """POST /api/v1/parse with invalid internal service key returns 401 Unauthorized."""
    pdf_bytes = create_synthetic_pdf(["John Doe"])
    files = {"file": ("resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}

    response = client.post(
        "/api/v1/parse",
        files=files,
        headers={"X-Internal-Service-Key": "invalid-wrong-secret"}
    )
    assert response.status_code == 401


def test_api_parse_empty_file_rejected(client: TestClient, auth_headers: dict):
    """POST /api/v1/parse with 0-byte file returns 400 Bad Request."""
    files = {"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}
    response = client.post("/api/v1/parse", files=files, headers=auth_headers)
    assert response.status_code == 400
    assert "empty" in response.json()["message"].lower()


def test_api_parse_unsupported_format_rejected(client: TestClient, auth_headers: dict):
    """POST /api/v1/parse with unsupported file format returns 400 Bad Request."""
    files = {"file": ("script.py", io.BytesIO(b"print('hello')"), "text/plain")}
    response = client.post("/api/v1/parse", files=files, headers=auth_headers)
    assert response.status_code == 400
    assert "unsupported file format" in response.json()["message"].lower()


def test_api_parse_file_signature_mismatch_rejected(client: TestClient, auth_headers: dict):
    """POST /api/v1/parse with spoofed extension and wrong magic bytes returns 400 Bad Request."""
    files = {"file": ("fake.pdf", io.BytesIO(b"NOT_A_REAL_PDF_STREAM"), "application/pdf")}
    response = client.post("/api/v1/parse", files=files, headers=auth_headers)
    assert response.status_code == 400
    assert "file signature mismatch" in response.json()["message"].lower()


def test_api_error_response_does_not_leak_stack_traces(client: TestClient, auth_headers: dict):
    """Error responses must return clean JSON contracts without stack traces or environment paths."""
    files = {"file": ("fake.pdf", io.BytesIO(b"INVALID"), "application/pdf")}
    response = client.post("/api/v1/parse", files=files, headers=auth_headers)

    body = response.text
    assert "Traceback" not in body
    assert "File \"" not in body
    assert "line " not in body.lower()
