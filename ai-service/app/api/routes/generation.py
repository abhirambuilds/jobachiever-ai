import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.security import verify_internal_service_key
from app.providers.base import (
    AIProviderError,
    InvalidModelError,
    ProviderAuthenticationError,
    ProviderRateLimitError,
    ProviderServiceUnavailableError,
    ProviderTimeoutError,
    StructuredOutputError,
    UnsupportedProviderError,
    UserConsentRequiredError,
)
from app.schemas.ai_request import AIGenerationRequest
from app.schemas.ai_response import AIGenerationResponse
from app.services.ai_service import AIService, get_ai_service

logger = logging.getLogger("ai_service.api.generation")
router = APIRouter(tags=["AI Generation"])


@router.post(
    "/generate",
    response_model=AIGenerationResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)],
    summary="Execute text or structured JSON generation using the selected AI provider"
)
async def generate(
    request: AIGenerationRequest,
    response: Response,
    ai_service: AIService = Depends(get_ai_service)
) -> AIGenerationResponse:
    """
    Executes a prompt generation task with explicit provider and model parameters.
    - Requires internal service authentication via X-Internal-Service-Key.
    - Strictly obeys user provider selection (no silent routing or fallback).
    - Requires explicit user consent before transmitting private career data.
    - Normalizes token usage and validates structured JSON output.
    """
    try:
        result = await ai_service.generate(request)
        return result

    except UnsupportedProviderError as ex:
        logger.warning("Unsupported provider requested: %s", ex.message)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ex.message
        ) from ex

    except InvalidModelError as ex:
        logger.warning("Invalid model requested: %s", ex.message)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ex.message
        ) from ex

    except UserConsentRequiredError as ex:
        logger.warning("Generation rejected: missing user consent.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ex.message
        ) from ex

    except ProviderRateLimitError as ex:
        logger.warning("Provider rate limit reached: %s", ex.message)
        headers = {}
        if ex.retry_after:
            headers["Retry-After"] = str(int(ex.retry_after))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=ex.message,
            headers=headers
        ) from ex

    except ProviderTimeoutError as ex:
        logger.error("Provider request timed out: %s", ex.message)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=ex.message
        ) from ex

    except ProviderAuthenticationError as ex:
        logger.error("Provider authentication failed: %s", ex.message)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider authentication failure. Please verify server configuration."
        ) from ex

    except ProviderServiceUnavailableError as ex:
        logger.error("Provider service unavailable: %s", ex.message)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=ex.message
        ) from ex

    except StructuredOutputError as ex:
        logger.error("Structured output schema failure: %s", ex.message)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=ex.message
        ) from ex

    except AIProviderError as ex:
        logger.error("Provider error (%d): %s", ex.status_code, ex.message)
        raise HTTPException(
            status_code=ex.status_code,
            detail=ex.message
        ) from ex

    except Exception as ex:
        logger.exception("Unexpected internal generation failure: %s", ex)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while executing AI generation."
        ) from ex
