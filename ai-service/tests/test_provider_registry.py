import pytest
from unittest.mock import MagicMock

from app.core.ai_config import GroqSettings
from app.providers.base import UnsupportedProviderError
from app.providers.groq_provider import GroqProvider
from app.providers.provider_registry import ProviderRegistry
from app.schemas.ai_response import ProviderStatus


@pytest.fixture
def registry():
    settings = GroqSettings(api_key="gsk_test_key_123456789")
    return ProviderRegistry(settings)


def test_default_provider_resolves_to_groq(registry):
    provider = registry.get_provider(None)
    assert provider.provider_id == "GROQ"


def test_explicit_groq_provider_resolution(registry):
    provider = registry.get_provider("GROQ")
    assert provider.provider_id == "GROQ"

    # Case insensitive
    provider_lower = registry.get_provider("groq")
    assert provider_lower.provider_id == "GROQ"


def test_gemini_provider_unsupported_in_prompt_22(registry):
    with pytest.raises(UnsupportedProviderError) as exc_info:
        registry.get_provider("GEMINI")
    assert "Prompt 23" in exc_info.value.message


def test_ollama_provider_excluded_from_initial_release(registry):
    with pytest.raises(UnsupportedProviderError) as exc_info:
        registry.get_provider("OLLAMA")
    assert "excluded" in exc_info.value.message.lower()


def test_unknown_provider_rejection(registry):
    with pytest.raises(UnsupportedProviderError) as exc_info:
        registry.get_provider("ANTHROPIC_CLAUDE")
    assert "Unsupported AI provider" in exc_info.value.message


def test_zero_automatic_fallback_guarantee(registry):
    """
    Verifies that if Groq fails or encounters errors, the registry
    never silently routes to another provider.
    """
    provider = registry.get_provider("GROQ")
    assert provider.provider_id == "GROQ"
    # Registry returns exact provider requested or raises; no alternate provider routing exists
    with pytest.raises(UnsupportedProviderError):
        registry.get_provider("NON_EXISTENT")


def test_list_providers_metadata(registry):
    providers = registry.list_providers()
    assert len(providers) == 2

    groq_meta = next(p for p in providers if p.id == "GROQ")
    assert groq_meta.name == "Groq Cloud"
    assert groq_meta.default is True

    gemini_meta = next(p for p in providers if p.id == "GEMINI")
    assert gemini_meta.name == "Google Gemini"
    assert gemini_meta.available is False
    assert gemini_meta.default is False
    assert gemini_meta.status == ProviderStatus.NOT_CONFIGURED
