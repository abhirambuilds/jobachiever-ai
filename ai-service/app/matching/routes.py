import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import Settings, get_settings
from app.core.security import verify_internal_service_key
from app.matching.schemas import MatchingRequest, MatchingResponse
from app.matching.service import execute_resume_job_match
from app.services.ai_service import AIService, get_ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/matching", tags=["Explainable Resume-Job Matching"])


@router.post(
    "/analyze",
    response_model=MatchingResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)],
    summary="Executes deterministic and explainable resume-to-job matching analysis"
)
async def analyze_match_endpoint(
    request: MatchingRequest,
    settings: Settings = Depends(get_settings),
    ai_service: AIService = Depends(get_ai_service)
) -> MatchingResponse:
    """
    Executes deep, evidence-grounded resume-to-job compatibility analysis:
    - Enforces mandatory user consent.
    - Normalizes multi-source candidate skills and job requirements.
    - Evaluates skills (exact, alias, closely related, missing).
    - Calculates non-overlapping professional tenure.
    - Evaluates education, certifications, and responsibilities.
    - Computes transparent deterministic scores across 6 dimensions.
    """
    if not request.user_consent:
        logger.warning("Match rejected: Missing explicit external AI processing consent.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="External AI processing consent is required to execute resume-job matching."
        )

    logger.info("Executing resume-job matching (provider: %s, model: %s)", request.provider, request.model)

    try:
        response = await execute_resume_job_match(request, ai_service)
        return response
    except Exception as ex:
        logger.error("Failed to execute resume-job match: %s", ex, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Matching calculation failed: {str(ex)}"
        )


@router.post(
    "/match",
    response_model=MatchingResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)],
    include_in_schema=False
)
async def match_endpoint_alias(
    request: MatchingRequest,
    settings: Settings = Depends(get_settings),
    ai_service: AIService = Depends(get_ai_service)
) -> MatchingResponse:
    """Route alias for POST /matching/analyze."""
    return await analyze_match_endpoint(request, settings, ai_service)
