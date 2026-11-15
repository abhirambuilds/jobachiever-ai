"""
FastAPI routing endpoints for the AI-Powered Resume Studio Writing Assistant.
Exposes POST /api/v1/resume-studio/generate with security, consent enforcement,
and anti-fabrication structured output.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import Settings, get_settings
from app.core.security import verify_internal_service_key
from app.resume_studio.schemas import ResumeStudioRequest, ResumeStudioResponse
from app.resume_studio.service import execute_studio_enhancement
from app.services.ai_service import AIService, get_ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resume-studio", tags=["AI Resume Studio Writing Assistant"])


@router.post(
    "/generate",
    response_model=ResumeStudioResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)],
    summary="Generate fact-preserving resume writing enhancements and suggestions"
)
async def generate_studio_suggestions(
    request: ResumeStudioRequest,
    settings: Settings = Depends(get_settings),
    ai_service: AIService = Depends(get_ai_service)
) -> ResumeStudioResponse:
    """
    Executes AI writing assistance for resume content:
    - Enforces mandatory external AI consent.
    - Preserves factual integrity via the AntiFabricationValidator.
    - Supports writing modes (PROFESSIONAL, CONCISE, TECHNICAL, ACHIEVEMENT_FOCUSED, ACTION_ORIENTED, ATS_FRIENDLY).
    - Supports actions (IMPROVE_BULLET, IMPROVE_SUMMARY, IMPROVE_PROJECT, IMPROVE_EXPERIENCE, FIX_GRAMMAR, MAKE_CONCISE, TAILOR_TO_JOB, GENERATE_ALTERNATIVES).
    """
    if not request.user_consent:
        logger.warning("Resume Studio request rejected: Missing explicit external AI processing consent.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="External AI processing consent is required to use the AI Writing Assistant."
        )

    logger.info("Resume Studio generation requested (action=%s, mode=%s, provider=%s)",
                request.action, request.writing_mode, request.provider)

    try:
        response = await execute_studio_enhancement(request, ai_service)
        return response
    except ValueError as ve:
        logger.warning("Invalid Resume Studio request: %s", ve)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as ex:
        logger.error("Resume Studio enhancement failed: %s", ex, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume Studio generation failed: {str(ex)}"
        )


@router.post(
    "/rewrite",
    response_model=ResumeStudioResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)],
    include_in_schema=False
)
async def rewrite_endpoint_alias(
    request: ResumeStudioRequest,
    settings: Settings = Depends(get_settings),
    ai_service: AIService = Depends(get_ai_service)
) -> ResumeStudioResponse:
    """Route alias for POST /resume-studio/generate."""
    return await generate_studio_suggestions(request, settings, ai_service)
