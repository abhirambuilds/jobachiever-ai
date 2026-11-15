import logging
from fastapi import APIRouter, Depends, status

from app.schemas.ai_response import ProviderListResponse
from app.services.ai_service import AIService, get_ai_service

logger = logging.getLogger("ai_service.api.providers")
router = APIRouter(tags=["AI Providers"])


@router.get(
    "/providers",
    response_model=ProviderListResponse,
    status_code=status.HTTP_200_OK,
    summary="List available AI providers and model capabilities"
)
async def list_providers(
    ai_service: AIService = Depends(get_ai_service)
) -> ProviderListResponse:
    """
    Returns high-level metadata for registered AI providers and their supported models.
    Distinguishes operational availability without exposing server credentials.
    Does NOT execute expensive live LLM queries during listing.
    """
    providers = ai_service.get_available_providers()
    return ProviderListResponse(providers=providers)
