import io
import logging
from dataclasses import dataclass, field
from typing import List, Optional
from fastapi import HTTPException, status
import pdfplumber

logger = logging.getLogger(__name__)


@dataclass
class ExtractedPage:
    """Holds extracted text and statistics for a single document page."""
    page_number: int
    text: str
    char_count: int


@dataclass
class ExtractedDocument:
    """Standardized representation of extracted document contents."""
    raw_text: str
    page_count: int
    pages: List[ExtractedPage] = field(default_factory=list)
    extraction_method: str = "pdfplumber"
    warnings: List[str] = field(default_factory=list)


def extract_text_from_pdf(file_bytes: bytes) -> ExtractedDocument:
    """
    Extracts text from an Adobe PDF document using pdfplumber.
    Handles multi-page documents, detects empty pages, and handles corrupt or scanned pages gracefully.
    """
    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot extract text: PDF file content is empty."
        )

    pages: List[ExtractedPage] = []
    page_texts: List[str] = []
    warnings: List[str] = []

    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            total_pages = len(pdf.pages)
            if total_pages == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="PDF contains 0 pages."
                )

            for idx, page in enumerate(pdf.pages, start=1):
                # Try layout-aware extraction first, fallback to standard extraction
                text = None
                try:
                    text = page.extract_text(layout=True)
                except Exception as ex:
                    logger.debug("Layout extraction failed for page %d: %s. Falling back to plain text.", idx, ex)
                    try:
                        text = page.extract_text()
                    except Exception as fallback_ex:
                        logger.warning("Text extraction failed completely on page %d: %s", idx, fallback_ex)
                        warnings.append(f"Page {idx}: text extraction failed.")

                cleaned_text = (text or "").strip()
                char_count = len(cleaned_text)

                pages.append(ExtractedPage(
                    page_number=idx,
                    text=cleaned_text,
                    char_count=char_count
                ))

                if cleaned_text:
                    page_texts.append(cleaned_text)
                else:
                    warnings.append(f"Page {idx} contains no extractable text (may be an image or scanned page).")

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to parse PDF document: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to read PDF document structure: {str(e)}"
        )

    full_text = "\n\n".join(page_texts).strip()

    if not full_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document appears to be empty or contains only non-extractable scanned images."
        )

    return ExtractedDocument(
        raw_text=full_text,
        page_count=len(pages),
        pages=pages,
        extraction_method="pdfplumber",
        warnings=warnings
    )
