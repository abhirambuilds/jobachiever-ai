import logging
import time
from typing import AsyncGenerator, List, Optional

from app.providers.base import BaseLLMProvider, UserConsentRequiredError
from app.providers.provider_registry import ProviderRegistry, get_provider_registry
from app.schemas.ai_request import AIGenerationRequest, ResponseFormatType, TaskType
from app.schemas.ai_response import AIGenerationResponse, ProviderMetadata

logger = logging.getLogger("ai_service.service")


class AIService:
    """
    Central orchestration service for AI model invocations across JobAchiever AI.
    Enforces privacy, user consent, provider resolution, and execution logging.
    """

    def __init__(self, registry: Optional[ProviderRegistry] = None):
        self.registry = registry or get_provider_registry()

    def get_available_providers(self) -> List[ProviderMetadata]:
        """Returns metadata for registered providers without revealing keys or internal endpoints."""
        return self.registry.list_providers()

    async def generate(self, request: AIGenerationRequest) -> AIGenerationResponse:
        """
        Coordinates execution of text or structured JSON generation.
        Enforces user consent and privacy-safe diagnostic logging.
        """
        # Strict privacy guardrail: User consent is mandatory before sending data to external AI
        if not request.user_consent:
            raise UserConsentRequiredError(
                message="User consent is required before transmitting career data to external AI providers."
            )

        provider: BaseLLMProvider = self.registry.get_provider(request.provider)

        # Privacy-safe diagnostic logging: never log full prompts or raw candidate text
        logger.info(
            "Executing AI generation task '%s' via provider '%s' (model: %s, prompt_len: %d chars, format: %s)",
            request.task.value if hasattr(request.task, "value") else request.task,
            provider.provider_id,
            request.model or "default",
            len(request.prompt),
            request.response_format.value if hasattr(request.response_format, "value") else request.response_format
        )

        start_time = time.perf_counter()

        if request.response_format == ResponseFormatType.JSON or request.task == TaskType.STRUCTURED_OUTPUT:
            response = await provider.generate_structured(request)
        else:
            response = await provider.generate_text(request)

        latency_ms = (time.perf_counter() - start_time) * 1000.0
        logger.info(
            "AI generation succeeded for provider '%s' in %.2fms (tokens: input=%d, output=%d)",
            response.provider,
            latency_ms,
            response.usage.input_tokens,
            response.usage.output_tokens
        )

        return response

    async def stream(self, request: AIGenerationRequest) -> AsyncGenerator[str, None]:
        """Coordinates streaming generation."""
        if not request.user_consent:
            raise UserConsentRequiredError(
                message="User consent is required before transmitting career data to external AI providers."
            )

        provider: BaseLLMProvider = self.registry.get_provider(request.provider)
        logger.info(
            "Initiating AI stream for task '%s' via provider '%s'",
            request.task.value if hasattr(request.task, "value") else request.task,
            provider.provider_id
        )

        async for chunk in provider.stream_text(request):
            yield chunk


# Global singleton instance of AIService
_default_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    """Returns singleton instance of AIService."""
    global _default_ai_service
    if _default_ai_service is None:
        _default_ai_service = AIService()
    return _default_ai_service
