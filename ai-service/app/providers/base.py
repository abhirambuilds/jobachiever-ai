from abc import ABC, abstractmethod
from typing import AsyncGenerator, Optional
from app.schemas.ai_request import AIGenerationRequest
from app.schemas.ai_response import AIGenerationResponse, ProviderMetadata, ProviderStatus


class AIProviderError(Exception):
    """Base exception for all AI provider operations."""
    def __init__(self, message: str, status_code: int = 500, provider: str = ""):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.provider = provider


class ProviderAuthenticationError(AIProviderError):
    """Raised when upstream API key is invalid, revoked, or unauthorized."""
    def __init__(self, message: str = "AI provider authentication failed.", provider: str = ""):
        super().__init__(message=message, status_code=502, provider=provider)


class ProviderRateLimitError(AIProviderError):
    """Raised when upstream API rate limit or quota is exceeded."""
    def __init__(self, message: str = "AI provider rate limit exceeded.", retry_after: Optional[float] = None, provider: str = ""):
        super().__init__(message=message, status_code=429, provider=provider)
        self.retry_after = retry_after


class ProviderTimeoutError(AIProviderError):
    """Raised when upstream API call times out."""
    def __init__(self, message: str = "AI provider request timed out.", provider: str = ""):
        super().__init__(message=message, status_code=504, provider=provider)


class ProviderServiceUnavailableError(AIProviderError):
    """Raised when upstream API suffers a 5xx outage or network disconnection."""
    def __init__(self, message: str = "AI provider service is temporarily unavailable.", provider: str = ""):
        super().__init__(message=message, status_code=503, provider=provider)


class UnsupportedProviderError(AIProviderError):
    """Raised when a client requests an unrecognized or unconfigured AI provider."""
    def __init__(self, message: str = "Requested AI provider is not supported.", provider: str = ""):
        super().__init__(message=message, status_code=400, provider=provider)


class InvalidModelError(AIProviderError):
    """Raised when an unapproved or unsupported model is requested."""
    def __init__(self, message: str = "Requested model is invalid or not supported for this provider.", provider: str = ""):
        super().__init__(message=message, status_code=400, provider=provider)


class StructuredOutputError(AIProviderError):
    """Raised when the provider fails to return valid, schema-compliant JSON."""
    def __init__(self, message: str = "Failed to produce valid structured JSON output.", raw_content: Optional[str] = None, provider: str = ""):
        super().__init__(message=message, status_code=422, provider=provider)
        self.raw_content = raw_content


class UserConsentRequiredError(AIProviderError):
    """Raised when private resume/career data would be transmitted without user consent."""
    def __init__(self, message: str = "Explicit user consent is required before transmitting career data to external AI providers.", provider: str = ""):
        super().__init__(message=message, status_code=400, provider=provider)


class BaseLLMProvider(ABC):
    """
    Abstract base interface that all concrete AI providers (Groq, Gemini, etc.) must implement.
    Guarantees provider-independence across high-level business features.
    """

    @property
    @abstractmethod
    def provider_id(self) -> str:
        """Returns standard uppercase identifier (e.g., 'GROQ')."""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Returns friendly display name (e.g., 'Groq Cloud')."""
        pass

    @abstractmethod
    async def check_health(self) -> ProviderStatus:
        """
        Evaluates operational health of the provider.
        Must NOT perform expensive generation requests on every invocation.
        """
        pass

    @abstractmethod
    async def generate_text(self, request: AIGenerationRequest) -> AIGenerationResponse:
        """Executes text generation using the configured model."""
        pass

    @abstractmethod
    async def generate_structured(self, request: AIGenerationRequest) -> AIGenerationResponse:
        """Executes structured JSON generation with schema validation and sanitization."""
        pass

    @abstractmethod
    async def stream_text(self, request: AIGenerationRequest) -> AsyncGenerator[str, None]:
        """Streams token chunks asynchronously as they arrive."""
        pass

    @abstractmethod
    def get_metadata(self) -> ProviderMetadata:
        """Returns descriptive metadata about the provider and its models without exposing secrets."""
        pass
