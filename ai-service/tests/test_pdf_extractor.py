import pytest
from fastapi import HTTPException
from app.services.extraction.pdf_extractor import extract_text_from_pdf
from tests.conftest import create_synthetic_pdf, create_multipage_pdf


def test_extract_valid_single_page_pdf():
    """Extracts text, page count, and metadata from valid single-page PDF."""
    lines = ["Jane Developer", "Full-Stack Engineer", "Experience: 4 years"]
    pdf_bytes = create_synthetic_pdf(lines)

    result = extract_text_from_pdf(pdf_bytes)

    assert result.page_count == 1
    assert len(result.pages) == 1
    assert result.extraction_method == "pdfplumber"
    assert "Jane Developer" in result.raw_text
    assert "Full-Stack Engineer" in result.raw_text


def test_extract_multi_page_pdf():
    """Extracts text page-by-page from a multi-page PDF document."""
    page1 = ["Alex Smith", "Software Engineer", "Page 1 Content"]
    page2 = ["Work Experience", "Acme Corp 2020-2023", "Page 2 Content"]
    pdf_bytes = create_multipage_pdf([page1, page2])

    result = extract_text_from_pdf(pdf_bytes)

    assert result.page_count == 2
    assert len(result.pages) == 2
    assert result.pages[0].page_number == 1
    assert "Alex Smith" in result.pages[0].text
    assert result.pages[1].page_number == 2
    assert "Acme Corp" in result.pages[1].text
    assert "Alex Smith" in result.raw_text
    assert "Acme Corp" in result.raw_text


def test_extract_empty_pdf_rejected():
    """Empty PDF with 0 extractable characters raises 400 Bad Request."""
    empty_pdf = create_synthetic_pdf(["   "])
    with pytest.raises(HTTPException) as exc_info:
        extract_text_from_pdf(empty_pdf)
    assert exc_info.value.status_code == 400
    assert "empty" in exc_info.value.detail.lower()


def test_extract_corrupt_pdf_fails_gracefully():
    """Corrupt PDF bytes raise 422 Unprocessable Entity."""
    corrupt_pdf = b"%PDF-1.4\nCorrupted binary content without valid xref or trailer"
    with pytest.raises(HTTPException) as exc_info:
        extract_text_from_pdf(corrupt_pdf)
    assert exc_info.value.status_code in (400, 422)
