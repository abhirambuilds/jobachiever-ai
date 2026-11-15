import logging
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File, status

from app.core.config import get_settings, Settings
from app.core.security import verify_internal_service_key
from app.schemas.resume import ParsedResumeResponse
from app.services.parsing.resume_parser import parse_resume_document
from app.utils.file_validation import validate_uploaded_document

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Resume Parsing"])


@router.post(
    "/parse",
    response_model=ParsedResumeResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)]
)
async def parse_resume(
    file: UploadFile = File(..., description="Resume document in PDF or DOCX format"),
    settings: Settings = Depends(get_settings)
) -> ParsedResumeResponse:
    """
    Parses an uploaded resume document (PDF or DOCX) into structured data.
    - Validates file size, extension, MIME type, and magic bytes signature.
    - Extracts multi-page text and tabular structures.
    - Segments resume into semantic sections and normalizes candidate fields.
    - Sets all verification statuses to UNVERIFIED for human review.
    - Never persists documents to disk; cleans up all memory/temporary buffers.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload request."
        )

    # Read uploaded bytes with size enforcement
    try:
        content = await file.read()
    except Exception as e:
        logger.error("Failed to read uploaded stream: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}"
        )
    finally:
        await file.close()

    # 1. Defense-in-depth file validation
    validation_result = validate_uploaded_document(
        file_bytes=content,
        filename=file.filename,
        declared_content_type=file.content_type or "",
        max_size_bytes=settings.max_upload_size_bytes
    )

    # 2. Extract and parse structured resume data
    try:
        parsed_resume = parse_resume_document(
            file_bytes=validation_result.raw_bytes,
            filename=validation_result.filename,
            file_type=validation_result.extension,
            sha256_checksum=validation_result.sha256_checksum
        )
        return parsed_resume

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Resume parsing pipeline failed for %s: %s", validation_result.filename, str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while parsing the resume document."
        )
