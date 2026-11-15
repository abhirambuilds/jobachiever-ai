import io
import logging
from typing import List
from fastapi import HTTPException, status
import docx

from .pdf_extractor import ExtractedDocument, ExtractedPage

logger = logging.getLogger(__name__)


def extract_text_from_docx(file_bytes: bytes) -> ExtractedDocument:
    """
    Extracts text from a Microsoft Word (.docx) document using python-docx.
    Extracts paragraphs with heading detection, extracts tables row-by-row,
    and defends against empty documents and macro-bearing malformed structures.
    """
    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot extract text: DOCX file content is empty."
        )

    paragraphs_text: List[str] = []
    warnings: List[str] = []

    try:
        doc = docx.Document(io.BytesIO(file_bytes))

        # 1. Extract paragraphs with heading markers
        for para in doc.paragraphs:
            text = (para.text or "").strip()
            if not text:
                continue

            style_name = para.style.name if para.style else ""
            is_heading = (
                style_name.startswith("Heading") or
                style_name in ("Title", "Subtitle") or
                any(run.bold for run in para.runs if run.text.strip()) and len(text) < 60
            )

            if is_heading:
                # Retain clean heading marker for section detection
                paragraphs_text.append(f"\n{text}\n")
            else:
                paragraphs_text.append(text)

        # 2. Extract tables (tables frequently hold skills matrices, education or experience dates)
        for t_idx, table in enumerate(doc.tables, start=1):
            table_lines: List[str] = []
            for row in table.rows:
                row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                # Deduplicate merged cells
                seen_cells = []
                for c in row_cells:
                    if not seen_cells or seen_cells[-1] != c:
                        seen_cells.append(c)
                if seen_cells:
                    table_lines.append(" | ".join(seen_cells))

            if table_lines:
                paragraphs_text.append("\n" + "\n".join(table_lines) + "\n")

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to parse DOCX document: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to read DOCX document structure: {str(e)}"
        )

    full_text = "\n".join(paragraphs_text).strip()

    if not full_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="DOCX document appears to be empty or contains no readable paragraphs or tables."
        )

    # Estimate page count (standard approx: 500 words or 3,000 characters per page)
    approx_pages = max(1, (len(full_text) // 2500) + 1)
    pages = [
        ExtractedPage(page_number=1, text=full_text, char_count=len(full_text))
    ]

    return ExtractedDocument(
        raw_text=full_text,
        page_count=approx_pages,
        pages=pages,
        extraction_method="python-docx",
        warnings=warnings
    )
