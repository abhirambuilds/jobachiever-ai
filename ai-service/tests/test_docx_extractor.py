import pytest
from fastapi import HTTPException
from app.services.extraction.docx_extractor import extract_text_from_docx
from tests.conftest import create_synthetic_docx


def test_extract_valid_docx_paragraphs():
    """Extracts paragraphs and headings from valid DOCX."""
    paragraphs = [
        ("David Miller", "Heading 1"),
        ("david.miller@example.com | (555) 123-4567", "Normal"),
        ("Professional Summary", "Heading 2"),
        ("Cloud Architect with 8 years of distributed systems experience.", "Normal")
    ]
    docx_bytes = create_synthetic_docx(paragraphs=paragraphs)

    result = extract_text_from_docx(docx_bytes)

    assert result.extraction_method == "python-docx"
    assert "David Miller" in result.raw_text
    assert "Cloud Architect" in result.raw_text
    assert result.page_count >= 1


def test_extract_docx_tables():
    """Extracts tables row-by-row formatted cleanly with cell delimiters."""
    table_data = [
        ["Company", "Role", "Dates"],
        ["Google", "Staff Engineer", "2021 - Present"],
        ["Amazon", "Senior SDE", "2018 - 2021"]
    ]
    docx_bytes = create_synthetic_docx(
        paragraphs=[("Work History", "Heading 1")],
        tables=[table_data]
    )

    result = extract_text_from_docx(docx_bytes)

    assert "Google | Staff Engineer | 2021 - Present" in result.raw_text
    assert "Amazon | Senior SDE | 2018 - 2021" in result.raw_text


def test_extract_empty_docx_rejected():
    """DOCX with no paragraphs or table text is rejected with 400 Bad Request."""
    empty_docx = create_synthetic_docx(paragraphs=[("", "Normal")])
    with pytest.raises(HTTPException) as exc_info:
        extract_text_from_docx(empty_docx)
    assert exc_info.value.status_code == 400
    assert "empty" in exc_info.value.detail.lower()


def test_extract_corrupt_docx_fails_gracefully():
    """Corrupt DOCX raises 422 Unprocessable Entity."""
    corrupt_docx = b"PK\x03\x04corrupted zip stream without valid catalog"
    with pytest.raises(HTTPException) as exc_info:
        extract_text_from_docx(corrupt_docx)
    assert exc_info.value.status_code in (400, 422)
