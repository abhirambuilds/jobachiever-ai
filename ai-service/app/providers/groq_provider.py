import asyncio
import json
import logging
import re
import time
from typing import Any, AsyncGenerator, Dict, List, Optional

from groq import (
    APIConnectionError,
    APIError,
    APIStatusError,
    APITimeoutError,
    AsyncGroq,
    AuthenticationError,
    BadRequestError,
    RateLimitError,
)

from app.core.ai_config import GroqSettings
from app.core.model_config import (
    DEFAULT_GROQ_MODEL,
    GROQ_SUPPORTED_MODELS,
    get_supported_groq_models,
    is_valid_groq_model,
)
from app.providers.base import (
    AIProviderError,
    BaseLLMProvider,
    InvalidModelError,
    ProviderAuthenticationError,
    ProviderRateLimitError,
    ProviderServiceUnavailableError,
    ProviderTimeoutError,
    StructuredOutputError,
)
from app.schemas.ai_request import AIGenerationRequest, ResponseFormatType
from app.schemas.ai_response import (
    AIGenerationResponse,
    FinishReason,
    ProviderMetadata,
    ProviderStatus,
    TokenUsage,
)

logger = logging.getLogger("ai_service.providers.groq")


class GroqProvider(BaseLLMProvider):
    """
    Concrete implementation of BaseLLMProvider for Groq Cloud.
    Leverages high-throughput LPU inference for fast career intelligence.
    """

    def __init__(self, settings: GroqSettings, client: Optional[AsyncGroq] = None):
        self.settings = settings
        self._custom_client = client
        self._semaphore = asyncio.Semaphore(settings.max_concurrency)
        self._cached_status: Optional[ProviderStatus] = None
        self._last_status_check_time: float = 0.0
        self._cache_ttl_seconds: float = 300.0  # 5 minutes

    @property
    def provider_id(self) -> str:
        return "GROQ"

    @property
    def provider_name(self) -> str:
        return "Groq Cloud"

    def _get_client(self) -> AsyncGroq:
        """Returns the configured AsyncGroq client."""
        if self._custom_client:
            return self._custom_client

        if not self.settings.is_configured:
            raise ProviderAuthenticationError(
                message="Groq API key is not configured on the server.",
                provider=self.provider_id
            )

        return AsyncGroq(
            api_key=self.settings.api_key,
            timeout=self.settings.timeout_seconds,
            max_retries=self.settings.max_retries,
        )

    def _resolve_model(self, requested_model: Optional[str]) -> str:
        """Validates and resolves the model to use for generation."""
        if requested_model:
            model = requested_model.strip()
            if not is_valid_groq_model(model):
                raise InvalidModelError(
                    message=f"Model '{model}' is not supported for Groq. Supported models: {get_supported_groq_models()}",
                    provider=self.provider_id
                )
            return model
        return self.settings.default_model

    def _resolve_max_tokens(self, requested_tokens: Optional[int]) -> int:
        """Enforces configured upper bound for output tokens."""
        if requested_tokens:
            return min(requested_tokens, self.settings.max_output_tokens)
        return self.settings.max_output_tokens

    def _build_messages(self, request: AIGenerationRequest) -> List[Dict[str, str]]:
        """Constructs chat completion message list."""
        messages: List[Dict[str, str]] = []

        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        elif request.response_format == ResponseFormatType.JSON:
            messages.append({
                "role": "system",
                "content": "You are a specialized career AI assistant. You must return valid, parseable JSON conforming strictly to the requested schema. Do not include markdown code block fencing or extra narrative."
            })

        messages.append({"role": "user", "content": request.prompt})
        return messages

    def _clean_json_markdown(self, raw_text: str) -> str:
        """Strips markdown code block fencing (```json ... ```) from JSON response."""
        cleaned = raw_text.strip()
        # Remove opening code fence
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        # Remove closing code fence
        cleaned = re.sub(r"\s*```$", "", cleaned)
        return cleaned.strip()

    def _extract_usage(self, completion: Any) -> TokenUsage:
        """Extracts token usage metrics from Groq completion response."""
        if hasattr(completion, "usage") and completion.usage:
            usage = completion.usage
            prompt_tokens = getattr(usage, "prompt_tokens", 0) or 0
            completion_tokens = getattr(usage, "completion_tokens", 0) or 0
            total_tokens = getattr(usage, "total_tokens", 0) or (prompt_tokens + completion_tokens)
            return TokenUsage(
                input_tokens=prompt_tokens,
                output_tokens=completion_tokens,
                total_tokens=total_tokens
            )
        return TokenUsage()

    def _map_groq_error(self, err: Exception) -> AIProviderError:
        """Normalizes Groq SDK exceptions into standard domain errors."""
        if isinstance(err, AuthenticationError):
            logger.error("Groq authentication failure: invalid or expired credentials.")
            return ProviderAuthenticationError(
                message="AI provider authentication failed. Please verify server API key configuration.",
                provider=self.provider_id
            )
        if isinstance(err, RateLimitError):
            logger.warning("Groq rate limit exceeded.")
            retry_after = getattr(err, "retry_after", None)
            return ProviderRateLimitError(
                message="Groq API rate limit or quota exceeded. Please try again shortly.",
                retry_after=retry_after,
                provider=self.provider_id
            )
        if isinstance(err, APITimeoutError):
            logger.error("Groq request timed out.")
            return ProviderTimeoutError(
                message=f"Groq request timed out after {self.settings.timeout_seconds}s.",
                provider=self.provider_id
            )
        if isinstance(err, (APIConnectionError, APIStatusError)):
            status_code = getattr(err, "status_code", 503)
            logger.error("Groq server or network error (%s): %s", status_code, err)
            return ProviderServiceUnavailableError(
                message="Groq AI service is temporarily unavailable. Please retry later.",
                provider=self.provider_id
            )
        if isinstance(err, BadRequestError):
            logger.error("Groq bad request: %s", err)
            return AIProviderError(
                message=f"Invalid request sent to Groq: {str(err)}",
                status_code=400,
                provider=self.provider_id
            )
        logger.error("Unexpected error in Groq provider: %s", err)
        return AIProviderError(
            message=f"Unexpected error communicating with Groq: {str(err)}",
            status_code=500,
            provider=self.provider_id
        )

    async def check_health(self) -> ProviderStatus:
        """
        Evaluates operational health of Groq.
        Uses cached status to avoid consuming rate limits on regular polling.
        """
        if not self.settings.is_configured:
            return ProviderStatus.NOT_CONFIGURED

        now = time.time()
        if self._cached_status and (now - self._last_status_check_time) < self._cache_ttl_seconds:
            return self._cached_status

        # If configured, perform a lightweight check (or mark CONFIGURED)
        try:
            client = self._get_client()
            # Perform a lightweight models list probe
            if hasattr(client, "models") and hasattr(client.models, "list"):
                await client.models.list()
                self._cached_status = ProviderStatus.VERIFIED
            else:
                self._cached_status = ProviderStatus.CONFIGURED
        except AuthenticationError:
            self._cached_status = ProviderStatus.NOT_CONFIGURED
        except Exception as e:
            logger.warning("Groq health probe encountered transient error: %s", e)
            self._cached_status = ProviderStatus.TEMPORARILY_UNAVAILABLE

        self._last_status_check_time = now
        return self._cached_status

    async def generate_text(self, request: AIGenerationRequest) -> AIGenerationResponse:
        """Executes text generation on Groq."""
        client = self._get_client()
        model = self._resolve_model(request.model)
        max_tokens = self._resolve_max_tokens(request.max_tokens)
        messages = self._build_messages(request)

        start_time = time.perf_counter()
        async with self._semaphore:
            try:
                completion = await client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=request.temperature or 0.2,
                    max_tokens=max_tokens,
                )
            except Exception as e:
                raise self._map_groq_error(e) from e

        duration_ms = (time.perf_counter() - start_time) * 1000.0
        choice = completion.choices[0]
        content = choice.message.content or ""
        finish_reason = getattr(choice, "finish_reason", "STOP") or "STOP"
        usage = self._extract_usage(completion)

        return AIGenerationResponse(
            provider=self.provider_id,
            model=model,
            content=content,
            json_data=None,
            usage=usage,
            finish_reason=finish_reason.upper(),
            validation_warnings=[],
            processing_time_ms=round(duration_ms, 2)
        )

    async def generate_structured(self, request: AIGenerationRequest) -> AIGenerationResponse:
        """
        Executes structured JSON generation with schema validation and bounded retry.
        """
        client = self._get_client()
        model = self._resolve_model(request.model)
        max_tokens = self._resolve_max_tokens(request.max_tokens)
        messages = self._build_messages(request)

        # Enforce JSON output format on Groq
        response_format = {"type": "json_object"}

        start_time = time.perf_counter()
        warnings: List[str] = []

        async with self._semaphore:
            try:
                completion = await client.chat.completions.create(
                    model=model,
                    messages=messages,
                    response_format=response_format,
                    temperature=request.temperature or 0.1,
                    max_tokens=max_tokens,
                )
            except Exception as e:
                raise self._map_groq_error(e) from e

        duration_ms = (time.perf_counter() - start_time) * 1000.0
        choice = completion.choices[0]
        raw_content = choice.message.content or ""
        cleaned_content = self._clean_json_markdown(raw_content)

        # Attempt to parse JSON
        parsed_json: Optional[Dict[str, Any]] = None
        try:
            parsed_json = json.loads(cleaned_content)
        except json.JSONDecodeError as err:
            logger.warning("Groq response failed initial JSON parsing: %s. Attempting bounded 1-shot repair...", err)
            # Safe bounded 1-shot repair
            repair_messages = list(messages)
            repair_messages.append({"role": "assistant", "content": raw_content})
            repair_messages.append({
                "role": "user",
                "content": f"The output was not valid JSON ({err.msg}). Please return ONLY valid, correctly formatted JSON fixing any syntax errors."
            })
            try:
                async with self._semaphore:
                    repair_completion = await client.chat.completions.create(
                        model=model,
                        messages=repair_messages,
                        response_format=response_format,
                        temperature=0.0,
                        max_tokens=max_tokens,
                    )
                repaired_raw = repair_completion.choices[0].message.content or ""
                parsed_json = json.loads(self._clean_json_markdown(repaired_raw))
                cleaned_content = self._clean_json_markdown(repaired_raw)
                warnings.append("Output required bounded JSON repair.")
            except Exception as repair_err:
                logger.error("JSON repair retry failed: %s", repair_err)
                raise StructuredOutputError(
                    message=f"Groq failed to produce valid JSON: {str(err)}",
                    raw_content=raw_content,
                    provider=self.provider_id
                ) from repair_err

        # Validate against JSON schema if supplied
        if request.json_schema and parsed_json:
            required_keys = request.json_schema.get("required", [])
            for key in required_keys:
                if key not in parsed_json:
                    warnings.append(f"Missing required schema property '{key}'.")

        finish_reason = getattr(choice, "finish_reason", "STOP") or "STOP"
        usage = self._extract_usage(completion)

        return AIGenerationResponse(
            provider=self.provider_id,
            model=model,
            content=cleaned_content,
            json_data=parsed_json,
            usage=usage,
            finish_reason=finish_reason.upper(),
            validation_warnings=warnings,
            processing_time_ms=round(duration_ms, 2)
        )

    async def stream_text(self, request: AIGenerationRequest) -> AsyncGenerator[str, None]:
        """Streams text completion tokens from Groq."""
        client = self._get_client()
        model = self._resolve_model(request.model)
        max_tokens = self._resolve_max_tokens(request.max_tokens)
        messages = self._build_messages(request)

        async with self._semaphore:
            try:
                stream = await client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=request.temperature or 0.2,
                    max_tokens=max_tokens,
                    stream=True
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta.content if chunk.choices else ""
                    if delta:
                        yield delta
            except Exception as e:
                raise self._map_groq_error(e) from e

    def get_metadata(self) -> ProviderMetadata:
        """Returns metadata description for Groq without exposing credentials."""
        is_ready = self.settings.is_configured
        status = ProviderStatus.CONFIGURED if is_ready else ProviderStatus.NOT_CONFIGURED
        if self._cached_status:
            status = self._cached_status

        return ProviderMetadata(
            id=self.provider_id,
            name=self.provider_name,
            available=is_ready and (status in (ProviderStatus.CONFIGURED, ProviderStatus.VERIFIED)),
            default=True,
            status=status,
            supported_models=get_supported_groq_models(),
            default_model=self.settings.default_model
        )
