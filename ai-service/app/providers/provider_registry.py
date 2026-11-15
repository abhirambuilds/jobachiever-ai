import logging
from typing import Dict, List, Optional

from app.core.ai_config import GroqSettings, load_groq_settings_from_env
from app.providers.base import BaseLLMProvider, UnsupportedProviderError
from app.providers.groq_provider import GroqProvider
from app.schemas.ai_response import ProviderMetadata, ProviderStatus

logger = logging.getLogger("ai_service.providers.registry")


class ProviderRegistry:
    """
    Central registry for managing concrete AI provider implementations.
    Guarantees strict manual selection and prevents silent fallback or routing.
    """

    def __init__(self, groq_settings: Optional[GroqSettings] = None):
        self._groq_settings = groq_settings or load_groq_settings_from_env()
        self._providers: Dict[str, BaseLLMProvider] = {}
        self._init_providers()

    def _init_providers(self) -> None:
        """Initializes supported concrete providers."""
        groq_provider = GroqProvider(self._groq_settings)
        self._providers["GROQ"] = groq_provider

    def get_provider(self, provider_id: Optional[str]) -> BaseLLMProvider:
        """
        Resolves the requested provider by ID.
        Strict manual selection:
        - If provider is omitted, uses the platform default ('GROQ').
        - If provider is unrecognized or unavailable, raises UnsupportedProviderError.
        - NEVER automatically routes or falls back between providers.
        """
        pid = (provider_id or "GROQ").strip().upper()

        if pid == "GROQ":
            return self._providers["GROQ"]

        if pid == "GEMINI":
            raise UnsupportedProviderError(
                message="Provider 'GEMINI' is not currently active. Google Gemini integration is scheduled for Prompt 23.",
                provider="GEMINI"
            )

        if pid == "OLLAMA":
            raise UnsupportedProviderError(
                message="Provider 'OLLAMA' is excluded from the initial release of JobAchiever AI.",
                provider="OLLAMA"
            )

        raise UnsupportedProviderError(
            message=f"Unsupported AI provider '{pid}'. Supported active providers: ['GROQ'].",
            provider=pid
        )

    def list_providers(self) -> List[ProviderMetadata]:
        """
        Returns high-level metadata for all known providers without exposing credentials.
        """
        groq_meta = self._providers["GROQ"].get_metadata()

        # Metadata for upcoming Gemini provider
        gemini_meta = ProviderMetadata(
            id="GEMINI",
            name="Google Gemini",
            available=False,
            default=False,
            status=ProviderStatus.NOT_CONFIGURED,
            supported_models=["gemini-2.0-flash", "gemini-1.5-pro"],
            default_model="gemini-2.0-flash"
        )

        return [groq_meta, gemini_meta]

    def set_groq_provider(self, groq_provider: GroqProvider) -> None:
        """Allows injecting a custom or mocked Groq provider for testing."""
        self._providers["GROQ"] = groq_provider


# Global singleton instance of ProviderRegistry
_default_registry: Optional[ProviderRegistry] = None


def get_provider_registry() -> ProviderRegistry:
    """Returns the singleton provider registry instance."""
    global _default_registry
    if _default_registry is None:
        _default_registry = ProviderRegistry()
    return _default_registry
