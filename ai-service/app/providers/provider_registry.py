import logging
from typing import Dict, List, Optional

from app.core.ai_config import (
    GeminiSettings,
    GroqSettings,
    load_gemini_settings_from_env,
    load_groq_settings_from_env,
)
from app.providers.base import (
    BaseLLMProvider,
    ProviderAuthenticationError,
    UnsupportedProviderError,
)
from app.providers.gemini_provider import GeminiProvider
from app.providers.groq_provider import GroqProvider
from app.schemas.ai_response import ProviderMetadata

logger = logging.getLogger("ai_service.providers.registry")


class ProviderRegistry:
    """
    Central registry for managing concrete AI provider implementations.
    Guarantees strict manual selection, independent configuration, and prevents silent fallback or routing.
    """

    def __init__(
        self,
        groq_settings: Optional[GroqSettings] = None,
        gemini_settings: Optional[GeminiSettings] = None
    ):
        self._groq_settings = groq_settings or load_groq_settings_from_env()
        self._gemini_settings = gemini_settings or load_gemini_settings_from_env()
        self._providers: Dict[str, BaseLLMProvider] = {}
        self._init_providers()

    def _init_providers(self) -> None:
        """Initializes supported concrete providers."""
        groq_provider = GroqProvider(self._groq_settings)
        gemini_provider = GeminiProvider(self._gemini_settings)
        self._providers["GROQ"] = groq_provider
        self._providers["GEMINI"] = gemini_provider

    def get_provider(self, provider_id: Optional[str]) -> BaseLLMProvider:
        """
        Resolves the requested provider by ID.
        Strict manual selection:
        - If provider is omitted, uses the platform default ('GROQ').
        - If provider is unrecognized, raises UnsupportedProviderError.
        - If provider is unconfigured, raises an informative error.
        - NEVER automatically routes or falls back between providers.
        """
        pid = (provider_id or "GROQ").strip().upper()

        if pid == "GROQ":
            return self._providers["GROQ"]

        if pid == "GEMINI":
            provider = self._providers["GEMINI"]
            if not getattr(provider, "settings", None) or not provider.settings.is_configured:
                raise UnsupportedProviderError(
                    message="Provider 'GEMINI' is not configured on the server. Please supply a valid GEMINI_API_KEY in the environment.",
                    provider="GEMINI"
                )
            return provider

        if pid == "OLLAMA":
            raise UnsupportedProviderError(
                message="Provider 'OLLAMA' is excluded from the initial release of JobAchiever AI.",
                provider="OLLAMA"
            )

        raise UnsupportedProviderError(
            message=f"Unsupported AI provider '{pid}'. Supported active providers: ['GROQ', 'GEMINI'].",
            provider=pid
        )

    def list_providers(self) -> List[ProviderMetadata]:
        """
        Returns high-level metadata for all known providers without exposing credentials.
        """
        groq_meta = self._providers["GROQ"].get_metadata()
        gemini_meta = self._providers["GEMINI"].get_metadata()
        return [groq_meta, gemini_meta]

    def set_groq_provider(self, groq_provider: GroqProvider) -> None:
        """Allows injecting a custom or mocked Groq provider for testing."""
        self._providers["GROQ"] = groq_provider

    def set_gemini_provider(self, gemini_provider: GeminiProvider) -> None:
        """Allows injecting a custom or mocked Gemini provider for testing."""
        self._providers["GEMINI"] = gemini_provider


# Global singleton instance of ProviderRegistry
_default_registry: Optional[ProviderRegistry] = None


def get_provider_registry() -> ProviderRegistry:
    """Returns the singleton provider registry instance."""
    global _default_registry
    if _default_registry is None:
        _default_registry = ProviderRegistry()
    return _default_registry
