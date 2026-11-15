import logging
from typing import Optional
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File, status

from app.core.config import get_settings, Settings
from app.core.security import verify_internal_service_key
from app.schemas.resume_analysis import ResumeAnalysisResponse
from app.services.ai_service import AIService, get_ai_service
from app.services.analysis.resume_analyzer import analyze_resume_document
from app.utils.file_validation import validate_uploaded_document

logger = logging.getLogger(__name__)
router = APIRouter(tags=["AI Resume Analysis"])


@router.post(
    "/analyze-resume",
    response_model=ResumeAnalysisResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)],
    summary="Perform comprehensive AI critique and quality scoring on an uploaded resume"
)
async def analyze_resume_endpoint(
    file: UploadFile = File(..., description="Uploaded resume document in PDF or DOCX format"),
    resume_id: Optional[str] = Form(None, description="Optional UUID of the resume entity"),
    provider: str = Form("GROQ", description="Target AI provider (GROQ or GEMINI)"),
    model: Optional[str] = Form(None, description="Model identifier override"),
    temperature: float = Form(0.2, description="Sampling temperature (0.0 to 2.0)"),
    max_tokens: Optional[int] = Form(None, description="Max output tokens"),
    user_consent: bool = Form(True, description="Explicit user confirmation for external AI processing"),
    settings: Settings = Depends(get_settings),
    ai_service: AIService = Depends(get_ai_service)
) -> ResumeAnalysisResponse:
    """
    Executes deep, evidence-grounded resume critique and scoring:
    - Defense-in-depth file validation (magic bytes, MIME type, size limit).
    - Extracts multi-page text using pdfplumber or python-docx.
    - Evaluates the resume across the 6-dimension weighted quality rubric.
    - Enforces zero-fabrication and anti-hallucination guardrails.
    - Uses only the explicitly selected provider (no silent fallback).
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload request."
        )

    # 1. Read binary content
    try:
        content = await file.read()
    except Exception as e:
        logger.error("Failed to read uploaded resume file stream: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}"
        )
    finally:
        await file.close()

    # 2. File validation
    validation_result = validate_uploaded_document(
        file_bytes=content,
        filename=file.filename,
        declared_content_type=file.content_type or "",
        max_size_bytes=settings.max_upload_size_bytes
    )

    # 3. Execute analysis
    return await analyze_resume_document(
        ai_service=ai_service,
        file_bytes=validation_result.raw_bytes,
        filename=validation_result.filename,
        file_type=validation_result.extension,
        resume_id=resume_id,
        provider=provider,
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        user_consent=user_consent
    )
