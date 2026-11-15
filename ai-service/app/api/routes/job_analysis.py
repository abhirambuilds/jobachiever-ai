import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import get_settings, Settings
from app.core.security import verify_internal_service_key
from app.schemas.job_analysis import JobAnalysisRequest, JobAnalysisResponse
from app.services.ai_service import AIService, get_ai_service
from app.services.analysis.job_analyzer import analyze_job_description_text

logger = logging.getLogger(__name__)
router = APIRouter(tags=["AI Job Description Analysis"])


@router.post(
    "/analyze/job-description",
    response_model=JobAnalysisResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)],
    summary="Deconstruct and analyze a job description into structured requirements and skills"
)
async def analyze_job_description_endpoint(
    request: JobAnalysisRequest,
    settings: Settings = Depends(get_settings),
    ai_service: AIService = Depends(get_ai_service)
) -> JobAnalysisResponse:
    """
    Executes deep, evidence-grounded job description decomposition:
    - Input validation (length 50 - 50,000 characters).
    - Distinguishes Required vs Preferred vs Mentioned technical skills.
    - Classifies experience requirements and seniority levels.
    - Extracts qualifications, responsibilities, tools, and grouped keywords.
    - Identifies ambiguities and red flags with neutral framing.
    - Strictly isolates untrusted input against prompt injections.
    - Uses only the explicitly requested provider (no silent fallback).
    """
    return await analyze_job_description_text(
        ai_service=ai_service,
        description=request.description,
        job_id=request.job_id,
        title_hint=request.title,
        company_hint=request.company_name,
        provider=request.provider,
        model=request.model,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        user_consent=request.user_consent
    )


@router.post(
    "/analyze-job-description",
    response_model=JobAnalysisResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)],
    include_in_schema=False
)
async def analyze_job_description_alias_endpoint(
    request: JobAnalysisRequest,
    settings: Settings = Depends(get_settings),
    ai_service: AIService = Depends(get_ai_service)
) -> JobAnalysisResponse:
    """Alias for /analyze/job-description to support varied path conventions."""
    return await analyze_job_description_endpoint(request, settings, ai_service)
