from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


def to_camel(string: str) -> str:
    components = string.split("_")
    return components[0] + "".join(x.capitalize() for x in components[1:])


class TokenUsage(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    input_tokens: Optional[int] = Field(default=None, description="Tokens in input prompt")
    output_tokens: Optional[int] = Field(default=None, description="Tokens generated in completion")
    total_tokens: Optional[int] = Field(default=None, description="Total tokens consumed")


class FinishReason(str, Enum):
    STOP = "STOP"
    LENGTH = "LENGTH"
    SAFETY = "SAFETY"
    CONTENT_FILTER = "CONTENT_FILTER"
    ERROR = "ERROR"


class ProviderPriority(str, Enum):
    PRIMARY = "PRIMARY"
    SECONDARY = "SECONDARY"


class ProviderStatus(str, Enum):
    NOT_CONFIGURED = "NOT_CONFIGURED"
    CONFIGURED = "CONFIGURED"
    CONNECTION_VERIFIED = "CONNECTION_VERIFIED"
    TEMPORARILY_UNAVAILABLE = "TEMPORARILY_UNAVAILABLE"


class ProviderMetadata(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: str = Field(..., description="Provider identifier (e.g. GROQ, GEMINI)")
    name: str = Field(..., description="Human-readable provider name")
    priority: ProviderPriority = Field(default=ProviderPriority.PRIMARY, description="Platform priority tier")
    available: bool = Field(..., description="Whether the provider is currently ready for generation requests")
    configured: bool = Field(default=False, description="Whether the provider has non-empty credentials")
    default: bool = Field(default=False, description="Whether this is the platform default provider")
    status: ProviderStatus = Field(..., description="Operational status")
    connection_status: ProviderStatus = Field(default=ProviderStatus.NOT_CONFIGURED, description="Connection verification status")
    supported_models: List[str] = Field(default_factory=list, description="List of supported model identifiers")
    default_model: str = Field(..., description="Default model ID for this provider")


class ProviderListResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    providers: List[ProviderMetadata] = Field(..., description="List of registered AI providers")


class AIGenerationResponse(BaseModel):
    """
    Standard normalized response structure for all AI generation tasks.
    Guarantees no internal credentials or raw stack traces are exposed.
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    provider: str = Field(..., description="AI provider that fulfilled the request")
    model: str = Field(..., description="Exact model utilized for generation")
    content: str = Field(..., description="Generated raw text completion")
    json_data: Optional[Dict[str, Any]] = Field(default=None, description="Parsed JSON object if structured output requested")
    usage: Optional[TokenUsage] = Field(default=None, description="Input/output token usage metrics (null if unavailable)")
    finish_reason: str = Field(default="STOP", description="Reason completion concluded")
    validation_warnings: List[str] = Field(default_factory=list, description="Non-fatal structured output validation warnings")
    processing_time_ms: float = Field(default=0.0, description="End-to-end execution latency in milliseconds")
