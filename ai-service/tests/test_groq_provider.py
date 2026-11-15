import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from groq import (
    APIConnectionError,
    APITimeoutError,
    AuthenticationError,
    BadRequestError,
    RateLimitError,
)

from app.core.ai_config import GroqSettings
from app.providers.base import (
    AIProviderError,
    InvalidModelError,
    ProviderAuthenticationError,
    ProviderRateLimitError,
    ProviderServiceUnavailableError,
    ProviderTimeoutError,
    StructuredOutputError,
)
from app.providers.groq_provider import GroqProvider
from app.schemas.ai_request import AIGenerationRequest, ResponseFormatType
from app.schemas.ai_response import ProviderStatus


@pytest.fixture
def groq_settings():
    return GroqSettings(
        api_key="gsk_test_mock_api_key_1234567890",
        default_model="llama-3.3-70b-versatile",
        timeout_seconds=5.0,
        max_retries=2,
        max_output_tokens=2048,
        max_concurrency=5
    )


@pytest.fixture
def mock_groq_client():
    client = MagicMock()
    client.chat = MagicMock()
    client.chat.completions = MagicMock()
    client.chat.completions.create = AsyncMock()
    client.models = MagicMock()
    client.models.list = AsyncMock()
    return client


def make_mock_completion(content="Generated text content", finish_reason="stop", prompt_tokens=12, completion_tokens=30):
    completion = MagicMock()
    choice = MagicMock()
    choice.message = MagicMock()
    choice.message.content = content
    choice.finish_reason = finish_reason
    completion.choices = [choice]
    completion.usage = MagicMock(
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=prompt_tokens + completion_tokens
    )
    return completion


@pytest.mark.asyncio
async def test_groq_provider_initialization(groq_settings, mock_groq_client):
    provider = GroqProvider(groq_settings, client=mock_groq_client)
    assert provider.provider_id == "GROQ"
    assert provider.provider_name == "Groq Cloud"
    metadata = provider.get_metadata()
    assert metadata.id == "GROQ"
    assert metadata.available is True
    assert metadata.default is True
    assert "llama-3.3-70b-versatile" in metadata.supported_models


@pytest.mark.asyncio
async def test_missing_api_key_raises_auth_error():
    empty_settings = GroqSettings(api_key=None)
    provider = GroqProvider(empty_settings)
    assert provider.settings.is_configured is False
    assert provider.get_metadata().available is False

    req = AIGenerationRequest(provider="GROQ", prompt="Hello world")
    with pytest.raises(ProviderAuthenticationError) as exc_info:
        await provider.generate_text(req)
    assert "not configured" in exc_info.value.message


@pytest.mark.asyncio
async def test_valid_text_generation(groq_settings, mock_groq_client):
    mock_groq_client.chat.completions.create.return_value = make_mock_completion(
        content="This is a tailored executive summary for a software engineer.",
        prompt_tokens=15,
        completion_tokens=40
    )

    provider = GroqProvider(groq_settings, client=mock_groq_client)
    req = AIGenerationRequest(
        provider="GROQ",
        prompt="Write a professional summary",
        system_prompt="You are a career consultant."
    )

    response = await provider.generate_text(req)

    assert response.provider == "GROQ"
    assert response.model == "llama-3.3-70b-versatile"
    assert response.content == "This is a tailored executive summary for a software engineer."
    assert response.usage.input_tokens == 15
    assert response.usage.output_tokens == 40
    assert response.usage.total_tokens == 55
    assert response.finish_reason == "STOP"
    assert response.processing_time_ms > 0


@pytest.mark.asyncio
async def test_structured_json_generation(groq_settings, mock_groq_client):
    expected_data = {"score": 92, "strengths": ["Python", "FastAPI"], "gaps": []}
    mock_groq_client.chat.completions.create.return_value = make_mock_completion(
        content=json.dumps(expected_data)
    )

    provider = GroqProvider(groq_settings, client=mock_groq_client)
    req = AIGenerationRequest(
        provider="GROQ",
        prompt="Critique this resume and output JSON",
        response_format=ResponseFormatType.JSON
    )

    response = await provider.generate_structured(req)

    assert response.provider == "GROQ"
    assert response.json_data == expected_data
    assert response.validation_warnings == []


@pytest.mark.asyncio
async def test_structured_json_generation_cleans_markdown_fences(groq_settings, mock_groq_client):
    expected_data = {"key": "value"}
    fenced_content = f"```json\n{json.dumps(expected_data)}\n```"
    mock_groq_client.chat.completions.create.return_value = make_mock_completion(
        content=fenced_content
    )

    provider = GroqProvider(groq_settings, client=mock_groq_client)
    req = AIGenerationRequest(
        provider="GROQ",
        prompt="Generate JSON",
        response_format=ResponseFormatType.JSON
    )

    response = await provider.generate_structured(req)
    assert response.json_data == expected_data


@pytest.mark.asyncio
async def test_structured_json_repair_and_failure(groq_settings, mock_groq_client):
    # Both initial call and retry return invalid JSON
    mock_groq_client.chat.completions.create.return_value = make_mock_completion(
        content="This is definitely not JSON {invalid"
    )

    provider = GroqProvider(groq_settings, client=mock_groq_client)
    req = AIGenerationRequest(
        provider="GROQ",
        prompt="Output JSON",
        response_format=ResponseFormatType.JSON
    )

    with pytest.raises(StructuredOutputError) as exc_info:
        await provider.generate_structured(req)
    assert "Failed to produce valid structured JSON output" in str(exc_info.value) or "valid JSON" in exc_info.value.message


@pytest.mark.asyncio
async def test_provider_authentication_failure(groq_settings, mock_groq_client):
    req_mock = MagicMock()
    mock_groq_client.chat.completions.create.side_effect = AuthenticationError(
        message="Invalid API Key provided",
        response=MagicMock(status_code=401),
        body={"error": {"message": "Invalid API Key"}}
    )

    provider = GroqProvider(groq_settings, client=mock_groq_client)
    req = AIGenerationRequest(provider="GROQ", prompt="Test prompt")

    with pytest.raises(ProviderAuthenticationError) as exc_info:
        await provider.generate_text(req)
    assert "authentication failed" in exc_info.value.message.lower()


@pytest.mark.asyncio
async def test_provider_rate_limit_response(groq_settings, mock_groq_client):
    mock_groq_client.chat.completions.create.side_effect = RateLimitError(
        message="Rate limit exceeded",
        response=MagicMock(status_code=429),
        body={"error": {"message": "Rate limit reached"}}
    )

    provider = GroqProvider(groq_settings, client=mock_groq_client)
    req = AIGenerationRequest(provider="GROQ", prompt="Test prompt")

    with pytest.raises(ProviderRateLimitError) as exc_info:
        await provider.generate_text(req)
    assert exc_info.value.status_code == 429
    assert "rate limit" in exc_info.value.message.lower()


@pytest.mark.asyncio
async def test_provider_timeout(groq_settings, mock_groq_client):
    mock_groq_client.chat.completions.create.side_effect = APITimeoutError(
        request=MagicMock()
    )

    provider = GroqProvider(groq_settings, client=mock_groq_client)
    req = AIGenerationRequest(provider="GROQ", prompt="Test prompt")

    with pytest.raises(ProviderTimeoutError) as exc_info:
        await provider.generate_text(req)
    assert exc_info.value.status_code == 504
    assert "timed out" in exc_info.value.message.lower()


@pytest.mark.asyncio
async def test_provider_transient_server_failure(groq_settings, mock_groq_client):
    mock_groq_client.chat.completions.create.side_effect = APIConnectionError(
        request=MagicMock()
    )

    provider = GroqProvider(groq_settings, client=mock_groq_client)
    req = AIGenerationRequest(provider="GROQ", prompt="Test prompt")

    with pytest.raises(ProviderServiceUnavailableError) as exc_info:
        await provider.generate_text(req)
    assert exc_info.value.status_code == 503
    assert "temporarily unavailable" in exc_info.value.message.lower()


@pytest.mark.asyncio
async def test_maximum_output_token_enforcement(groq_settings, mock_groq_client):
    mock_groq_client.chat.completions.create.return_value = make_mock_completion()

    provider = GroqProvider(groq_settings, client=mock_groq_client)
    # Request exceeds max_output_tokens (2048)
    req = AIGenerationRequest(provider="GROQ", prompt="Prompt", max_tokens=8000)

    await provider.generate_text(req)

    called_kwargs = mock_groq_client.chat.completions.create.call_args[1]
    assert called_kwargs["max_tokens"] == 2048


@pytest.mark.asyncio
async def test_invalid_model_selection_rejected(groq_settings, mock_groq_client):
    provider = GroqProvider(groq_settings, client=mock_groq_client)
    req = AIGenerationRequest(provider="GROQ", prompt="Prompt", model="unsupported-fake-model-xyz")

    with pytest.raises(InvalidModelError) as exc_info:
        await provider.generate_text(req)
    assert "not supported" in exc_info.value.message.lower()


@pytest.mark.asyncio
async def test_streaming_generation(groq_settings, mock_groq_client):
    async def mock_stream():
        tokens = ["Hello", " ", "world", "!"]
        for t in tokens:
            chunk = MagicMock()
            choice = MagicMock()
            choice.delta = MagicMock(content=t)
            chunk.choices = [choice]
            yield chunk

    mock_groq_client.chat.completions.create.return_value = mock_stream()

    provider = GroqProvider(groq_settings, client=mock_groq_client)
    req = AIGenerationRequest(provider="GROQ", prompt="Say hello")

    collected = []
    async for token in provider.stream_text(req):
        collected.append(token)

    assert "".join(collected) == "Hello world!"
