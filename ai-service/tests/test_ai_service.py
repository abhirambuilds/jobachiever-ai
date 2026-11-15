import logging
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.core.ai_config import GroqSettings
from app.providers.base import UserConsentRequiredError
from app.providers.groq_provider import GroqProvider
from app.providers.provider_registry import ProviderRegistry
from app.schemas.ai_request import AIGenerationRequest, ResponseFormatType, TaskType
from app.schemas.ai_response import AIGenerationResponse, TokenUsage
from app.services.ai_service import AIService


@pytest.fixture
def mock_groq_provider():
    provider = MagicMock(spec=GroqProvider)
    provider.provider_id = "GROQ"
    provider.provider_name = "Groq Cloud"

    response = AIGenerationResponse(
        provider="GROQ",
        model="llama-3.3-70b-versatile",
        content="Success completion",
        usage=TokenUsage(input_tokens=10, output_tokens=20, total_tokens=30),
        finish_reason="STOP",
        processing_time_ms=120.0
    )
    provider.generate_text = AsyncMock(return_value=response)
    provider.generate_structured = AsyncMock(return_value=response)
    return provider


@pytest.fixture
def ai_service(mock_groq_provider):
    registry = MagicMock(spec=ProviderRegistry)
    registry.get_provider.return_value = mock_groq_provider
    registry.list_providers.return_value = []
    return AIService(registry)


@pytest.mark.asyncio
async def test_user_consent_enforcement(ai_service):
    req = AIGenerationRequest(
        provider="GROQ",
        prompt="Sensitive resume content",
        user_consent=False
    )

    with pytest.raises(UserConsentRequiredError) as exc_info:
        await ai_service.generate(req)
    assert "User consent is required" in exc_info.value.message


@pytest.mark.asyncio
async def test_generate_text_routing(ai_service, mock_groq_provider):
    req = AIGenerationRequest(
        provider="GROQ",
        prompt="Write a cover letter",
        response_format=ResponseFormatType.TEXT
    )

    res = await ai_service.generate(req)
    assert res.content == "Success completion"
    mock_groq_provider.generate_text.assert_awaited_once_with(req)
    mock_groq_provider.generate_structured.assert_not_awaited()


@pytest.mark.asyncio
async def test_generate_structured_routing(ai_service, mock_groq_provider):
    req = AIGenerationRequest(
        provider="GROQ",
        prompt="Extract skills as JSON",
        response_format=ResponseFormatType.JSON
    )

    res = await ai_service.generate(req)
    assert res.content == "Success completion"
    mock_groq_provider.generate_structured.assert_awaited_once_with(req)
    mock_groq_provider.generate_text.assert_not_awaited()


@pytest.mark.asyncio
async def test_privacy_safe_logging(ai_service, caplog):
    caplog.set_level(logging.INFO)
    sensitive_prompt = "Confidential resume of John Doe: email john@example.com, phone 555-123-4567, secret key gsk_abc123456789012345678901234567890"

    req = AIGenerationRequest(
        provider="GROQ",
        prompt=sensitive_prompt,
        user_consent=True
    )

    await ai_service.generate(req)

    log_text = caplog.text
    # Verify that the full sensitive prompt text is NEVER logged in INFO logs
    assert "Confidential resume of John Doe" not in log_text
    assert "555-123-4567" not in log_text
    assert "gsk_abc1234567890" not in log_text
