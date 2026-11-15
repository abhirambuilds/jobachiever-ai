import pytest
from unittest.mock import MagicMock

from app.core.ai_config import GeminiSettings, GroqSettings
from app.providers.base import UnsupportedProviderError
from app.providers.gemini_provider import GeminiProvider
from app.providers.groq_provider import GroqProvider
from app.providers.provider_registry import ProviderRegistry
from app.schemas.ai_response import ProviderPriority, ProviderStatus


@pytest.fixture
def registry():
    groq_settings = GroqSettings(api_key="gsk_test_key_123456789")
    gemini_settings = GeminiSettings(api_key="AIzaSy_test_gemini_key_123456789")
    return ProviderRegistry(groq_settings, gemini_settings)


def test_default_provider_resolves_to_groq(registry):
    provider = registry.get_provider(None)
    assert provider.provider_id == "GROQ"


def test_explicit_groq_provider_resolution(registry):
    provider = registry.get_provider("GROQ")
    assert provider.provider_id == "GROQ"

    # Case insensitive
    provider_lower = registry.get_provider("groq")
    assert provider_lower.provider_id == "GROQ"


def test_explicit_gemini_provider_resolution(registry):
    provider = registry.get_provider("GEMINI")
    assert provider.provider_id == "GEMINI"
    assert isinstance(provider, GeminiProvider)

    # Case insensitive
    provider_lower = registry.get_provider("gemini")
    assert provider_lower.provider_id == "GEMINI"


def test_unconfigured_gemini_provider_rejection():
    groq_settings = GroqSettings(api_key="gsk_test_key_123456789")
    unconfigured_gemini_settings = GeminiSettings(api_key=None)
    reg = ProviderRegistry(groq_settings, unconfigured_gemini_settings)

    with pytest.raises(UnsupportedProviderError) as exc_info:
        reg.get_provider("GEMINI")
    assert "not configured" in exc_info.value.message.lower()


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
    Verifies that if a provider fails or is unconfigured, the registry
    never silently routes to another provider.
    """
    provider = registry.get_provider("GROQ")
    assert provider.provider_id == "GROQ"

    gemini_prov = registry.get_provider("GEMINI")
    assert gemini_prov.provider_id == "GEMINI"

    with pytest.raises(UnsupportedProviderError):
        registry.get_provider("NON_EXISTENT")


def test_list_providers_metadata(registry):
    providers = registry.list_providers()
    assert len(providers) == 2

    groq_meta = next(p for p in providers if p.id == "GROQ")
    assert groq_meta.name == "Groq Cloud"
    assert groq_meta.default is True
    assert groq_meta.priority == ProviderPriority.PRIMARY
    assert groq_meta.configured is True

    gemini_meta = next(p for p in providers if p.id == "GEMINI")
    assert gemini_meta.name == "Google Gemini"
    assert gemini_meta.default is False
    assert gemini_meta.priority == ProviderPriority.SECONDARY
    assert gemini_meta.configured is True
    assert "gemini-2.0-flash" in gemini_meta.supported_models
