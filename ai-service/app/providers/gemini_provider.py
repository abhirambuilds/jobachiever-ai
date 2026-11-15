import asyncio
import inspect
import json
import logging
import re
import time
from typing import Any, AsyncGenerator, Dict, List, Optional

from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.core.ai_config import GeminiSettings
from app.core.model_config import (
    DEFAULT_GEMINI_MODEL,
    GEMINI_SUPPORTED_MODELS,
    get_gemini_model_info,
    get_supported_gemini_models,
    is_valid_gemini_model,
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
    ProviderPriority,
    ProviderStatus,
    TokenUsage,
)

logger = logging.getLogger("ai_service.providers.gemini")


class GeminiProvider(BaseLLMProvider):
    """
    Concrete implementation of BaseLLMProvider for Google Gemini.
    Serves as the secondary AI provider within the JobAchiever AI platform.
    """

    def __init__(self, settings: GeminiSettings, client: Optional[genai.Client] = None):
        self.settings = settings
        self._custom_client = client
        self._semaphore = asyncio.Semaphore(settings.max_concurrency)
        self._cached_status: Optional[ProviderStatus] = None
        self._last_status_check_time: float = 0.0
        self._cache_ttl_seconds: float = 300.0  # 5 minutes

    @property
    def provider_id(self) -> str:
        return "GEMINI"

    @property
    def provider_name(self) -> str:
        return "Google Gemini"

    def _get_client(self) -> genai.Client:
        """Returns the configured Google genai Client."""
        if self._custom_client:
            return self._custom_client

        if not self.settings.is_configured:
            raise ProviderAuthenticationError(
                message="Google Gemini API key is not configured on the server.",
                provider=self.provider_id
            )

        return genai.Client(api_key=self.settings.api_key)

    def _resolve_model(self, requested_model: Optional[str]) -> str:
        """Validates and resolves the model to use for generation."""
        if requested_model:
            model = requested_model.strip()
            if not is_valid_gemini_model(model):
                raise InvalidModelError(
                    message=f"Model '{model}' is not supported for Gemini. Supported models: {get_supported_gemini_models()}",
                    provider=self.provider_id
                )
            return model
        return self.settings.default_model

    def _resolve_max_tokens(self, requested_tokens: Optional[int]) -> int:
        """Enforces configured upper bound for output tokens."""
        if requested_tokens:
            return min(requested_tokens, self.settings.max_output_tokens)
        return self.settings.max_output_tokens

    def _clean_json_markdown(self, raw_text: str) -> str:
        """Strips markdown code block fencing (```json ... ```) from JSON response."""
        cleaned = raw_text.strip()
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        return cleaned.strip()

    def _extract_usage(self, response: Any) -> Optional[TokenUsage]:
        """
        Extracts token usage metrics from Gemini response.
        Returns None if usage metadata is unavailable rather than fabricating values.
        """
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            meta = response.usage_metadata
            prompt_tokens = getattr(meta, "prompt_token_count", None)
            candidates_tokens = getattr(meta, "candidates_token_count", None)
            total_tokens = getattr(meta, "total_token_count", None)
            if prompt_tokens is not None or candidates_tokens is not None:
                return TokenUsage(
                    input_tokens=prompt_tokens or 0,
                    output_tokens=candidates_tokens or 0,
                    total_tokens=total_tokens or ((prompt_tokens or 0) + (candidates_tokens or 0))
                )
        return None

    def _map_gemini_error(self, err: Exception) -> AIProviderError:
        """Normalizes Google Gemini SDK exceptions into standard domain errors."""
        if isinstance(err, APIError):
            code = getattr(err, "code", 500)
            msg = getattr(err, "message", str(err))

            if code in (401, 403):
                logger.error("Gemini authentication failure: invalid or unauthorized API key.")
                return ProviderAuthenticationError(
                    message="Google Gemini authentication failed. Please verify server API key configuration.",
                    provider=self.provider_id
                )
            if code == 429:
                logger.warning("Gemini quota or rate limit exceeded.")
                return ProviderRateLimitError(
                    message="Google Gemini API rate limit or quota exceeded. Please try again shortly.",
                    provider=self.provider_id
                )
            if code == 404:
                logger.error("Gemini model not found: %s", msg)
                return InvalidModelError(
                    message=f"Requested Gemini model was not found: {msg}",
                    provider=self.provider_id
                )
            if code == 400:
                logger.error("Gemini bad request: %s", msg)
                return AIProviderError(
                    message=f"Invalid request sent to Google Gemini: {msg}",
                    status_code=400,
                    provider=self.provider_id
                )
            if code in (500, 502, 503):
                logger.error("Gemini service unavailable (%d): %s", code, msg)
                return ProviderServiceUnavailableError(
                    message="Google Gemini service is temporarily unavailable. Please retry later.",
                    provider=self.provider_id
                )
            if code == 504:
                logger.error("Gemini gateway timeout: %s", msg)
                return ProviderTimeoutError(
                    message="Google Gemini request timed out.",
                    provider=self.provider_id
                )

        if isinstance(err, asyncio.TimeoutError):
            logger.error("Gemini client timeout after %.1fs", self.settings.timeout_seconds)
            return ProviderTimeoutError(
                message=f"Gemini request timed out after {self.settings.timeout_seconds}s.",
                provider=self.provider_id
            )

        logger.error("Unexpected error in Gemini provider: %s", err)
        return AIProviderError(
            message=f"Unexpected error communicating with Google Gemini: {str(err)}",
            status_code=500,
            provider=self.provider_id
        )

    async def check_health(self) -> ProviderStatus:
        """
        Evaluates operational health of Google Gemini.
        Uses cached status to avoid consuming rate limits on regular polling.
        """
        if not self.settings.is_configured:
            return ProviderStatus.NOT_CONFIGURED

        now = time.time()
        if self._cached_status and (now - self._last_status_check_time) < self._cache_ttl_seconds:
            return self._cached_status

        try:
            client = self._get_client()
            # Perform lightweight model lookup probe
            if hasattr(client, "aio") and hasattr(client.aio, "models"):
                await client.aio.models.get(model=self.settings.default_model)
                self._cached_status = ProviderStatus.CONNECTION_VERIFIED
            else:
                self._cached_status = ProviderStatus.CONFIGURED
        except Exception as e:
            if isinstance(e, APIError) and getattr(e, "code", 0) in (401, 403):
                self._cached_status = ProviderStatus.NOT_CONFIGURED
            else:
                logger.warning("Gemini health probe encountered error: %s", e)
                self._cached_status = ProviderStatus.TEMPORARILY_UNAVAILABLE

        self._last_status_check_time = now
        return self._cached_status

    async def generate_text(self, request: AIGenerationRequest) -> AIGenerationResponse:
        """Executes text generation using Google Gemini."""
        client = self._get_client()
        model = self._resolve_model(request.model)
        max_tokens = self._resolve_max_tokens(request.max_tokens)

        config_kwargs: Dict[str, Any] = {
            "temperature": request.temperature or 0.2,
            "max_output_tokens": max_tokens,
        }
        if request.system_prompt:
            config_kwargs["system_instruction"] = request.system_prompt

        config = types.GenerateContentConfig(**config_kwargs)

        start_time = time.perf_counter()
        async with self._semaphore:
            try:
                response = await asyncio.wait_for(
                    client.aio.models.generate_content(
                        model=model,
                        contents=request.prompt,
                        config=config
                    ),
                    timeout=self.settings.timeout_seconds
                )
            except Exception as e:
                raise self._map_gemini_error(e) from e

        duration_ms = (time.perf_counter() - start_time) * 1000.0

        # Safety-block check
        finish_reason = "STOP"
        if hasattr(response, "candidates") and response.candidates:
            candidate = response.candidates[0]
            cand_finish = getattr(candidate, "finish_reason", None)
            if cand_finish:
                cand_finish_str = str(cand_finish).upper()
                if "SAFETY" in cand_finish_str:
                    logger.warning("Gemini response was blocked by safety policy.")
                    raise AIProviderError(
                        message="Google Gemini blocked the completion response due to safety filter restrictions.",
                        status_code=422,
                        provider=self.provider_id
                    )
                finish_reason = cand_finish_str

        content = getattr(response, "text", "") or ""
        usage = self._extract_usage(response)

        return AIGenerationResponse(
            provider=self.provider_id,
            model=model,
            content=content,
            json_data=None,
            usage=usage,
            finish_reason=finish_reason,
            validation_warnings=[],
            processing_time_ms=round(duration_ms, 2)
        )

    async def generate_structured(self, request: AIGenerationRequest) -> AIGenerationResponse:
        """
        Executes structured JSON generation with native response_mime_type and bounded retry.
        """
        client = self._get_client()
        model = self._resolve_model(request.model)
        max_tokens = self._resolve_max_tokens(request.max_tokens)

        system_instruction = request.system_prompt or "You are a specialized career AI assistant. Return valid, parseable JSON conforming strictly to the requested schema."

        config = types.GenerateContentConfig(
            temperature=request.temperature or 0.1,
            max_output_tokens=max_tokens,
            system_instruction=system_instruction,
            response_mime_type="application/json"
        )

        start_time = time.perf_counter()
        warnings: List[str] = []

        async with self._semaphore:
            try:
                response = await asyncio.wait_for(
                    client.aio.models.generate_content(
                        model=model,
                        contents=request.prompt,
                        config=config
                    ),
                    timeout=self.settings.timeout_seconds
                )
            except Exception as e:
                raise self._map_gemini_error(e) from e

        duration_ms = (time.perf_counter() - start_time) * 1000.0

        raw_content = getattr(response, "text", "") or ""
        cleaned_content = self._clean_json_markdown(raw_content)

        # Parse JSON
        parsed_json: Optional[Dict[str, Any]] = None
        try:
            parsed_json = json.loads(cleaned_content)
        except json.JSONDecodeError as err:
            logger.warning("Gemini output failed initial JSON parsing: %s. Attempting bounded 1-shot repair...", err)
            repair_prompt = f"{request.prompt}\n\nThe previous attempt produced invalid JSON ({err.msg}). Please output ONLY valid, well-formed JSON fixing all syntax mistakes."
            try:
                async with self._semaphore:
                    repair_response = await asyncio.wait_for(
                        client.aio.models.generate_content(
                            model=model,
                            contents=repair_prompt,
                            config=config
                        ),
                        timeout=self.settings.timeout_seconds
                    )
                repaired_raw = getattr(repair_response, "text", "") or ""
                cleaned_content = self._clean_json_markdown(repaired_raw)
                parsed_json = json.loads(cleaned_content)
                warnings.append("Output required bounded JSON repair.")
            except Exception as repair_err:
                logger.error("Gemini JSON repair retry failed: %s", repair_err)
                raise StructuredOutputError(
                    message=f"Gemini failed to produce valid JSON: {str(err)}",
                    raw_content=raw_content,
                    provider=self.provider_id
                ) from repair_err

        # Validate against JSON schema if supplied
        if request.json_schema and parsed_json:
            required_keys = request.json_schema.get("required", [])
            for key in required_keys:
                if key not in parsed_json:
                    warnings.append(f"Missing required schema property '{key}'.")

        usage = self._extract_usage(response)

        return AIGenerationResponse(
            provider=self.provider_id,
            model=model,
            content=cleaned_content,
            json_data=parsed_json,
            usage=usage,
            finish_reason="STOP",
            validation_warnings=warnings,
            processing_time_ms=round(duration_ms, 2)
        )

    async def stream_text(self, request: AIGenerationRequest) -> AsyncGenerator[str, None]:
        """Streams text completion tokens from Google Gemini."""
        client = self._get_client()
        model = self._resolve_model(request.model)
        max_tokens = self._resolve_max_tokens(request.max_tokens)

        config_kwargs: Dict[str, Any] = {
            "temperature": request.temperature or 0.2,
            "max_output_tokens": max_tokens,
        }
        if request.system_prompt:
            config_kwargs["system_instruction"] = request.system_prompt

        config = types.GenerateContentConfig(**config_kwargs)

        async with self._semaphore:
            try:
                stream_res = client.aio.models.generate_content_stream(
                    model=model,
                    contents=request.prompt,
                    config=config
                )
                if inspect.isawaitable(stream_res):
                    stream = await stream_res
                else:
                    stream = stream_res

                async for chunk in stream:
                    delta = getattr(chunk, "text", "") or ""
                    if delta:
                        yield delta
            except Exception as e:
                raise self._map_gemini_error(e) from e

    def get_metadata(self) -> ProviderMetadata:
        """Returns metadata description for Gemini without exposing credentials."""
        is_ready = self.settings.is_configured
        status = ProviderStatus.CONFIGURED if is_ready else ProviderStatus.NOT_CONFIGURED
        if self._cached_status:
            status = self._cached_status

        return ProviderMetadata(
            id=self.provider_id,
            name=self.provider_name,
            priority=ProviderPriority.SECONDARY,
            available=is_ready and (status in (ProviderStatus.CONFIGURED, ProviderStatus.CONNECTION_VERIFIED)),
            configured=is_ready,
            default=False,
            status=status,
            connection_status=status,
            supported_models=get_supported_gemini_models(),
            default_model=self.settings.default_model
        )
