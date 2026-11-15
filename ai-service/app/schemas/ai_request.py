from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


class ProviderType(str, Enum):
    GROQ = "GROQ"
    GEMINI = "GEMINI"
    OLLAMA = "OLLAMA"


class TaskType(str, Enum):
    TEXT_GENERATION = "TEXT_GENERATION"
    STRUCTURED_OUTPUT = "STRUCTURED_OUTPUT"
    SUMMARY = "SUMMARY"
    CRITIQUE = "CRITIQUE"
    REWRITE = "REWRITE"


class ResponseFormatType(str, Enum):
    TEXT = "text"
    JSON = "json"


def to_camel(string: str) -> str:
    """Converts snake_case to camelCase."""
    components = string.split("_")
    return components[0] + "".join(x.capitalize() for x in components[1:])


class AIGenerationRequest(BaseModel):
    """
    Standard request payload for AI model invocation.
    Supports both direct prompt and nested input object formats.
    """
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        use_enum_values=True
    )

    provider: str = Field(default="GROQ", description="AI Provider identifier (e.g. GROQ)")
    task: TaskType = Field(default=TaskType.TEXT_GENERATION, description="Task categorization")
    prompt: Optional[str] = Field(default=None, description="Primary user prompt / input")
    input: Optional[Dict[str, Any]] = Field(default=None, description="Optional nested input dictionary containing prompt")
    system_prompt: Optional[str] = Field(default=None, description="System role and boundary instruction")
    model: Optional[str] = Field(default=None, description="Specific model override (optional)")
    response_format: ResponseFormatType = Field(default=ResponseFormatType.TEXT, description="Format of response: text or json")
    json_schema: Optional[Dict[str, Any]] = Field(default=None, description="Expected JSON schema for structured responses")
    temperature: Optional[float] = Field(default=0.2, ge=0.0, le=2.0, description="Sampling temperature")
    max_tokens: Optional[int] = Field(default=None, ge=1, le=8192, description="Maximum output tokens to generate")
    user_consent: bool = Field(default=True, description="Explicit confirmation that user consented to external AI processing")

    @model_validator(mode="before")
    @classmethod
    def resolve_prompt_from_input(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # If prompt not given at top-level but present in input.prompt
            if not data.get("prompt") and isinstance(data.get("input"), dict):
                data["prompt"] = data["input"].get("prompt")
            # If responseFormat is JSON or json_object, ensure response_format is JSON
            rf = data.get("responseFormat") or data.get("response_format")
            if rf == "json_object":
                data["response_format"] = "json"
        return data

    @model_validator(mode="after")
    def validate_prompt_present(self) -> "AIGenerationRequest":
        if not self.prompt or not self.prompt.strip():
            raise ValueError("Prompt must not be empty. Provide either 'prompt' or 'input.prompt'.")
        if len(self.prompt) > 64000:
            raise ValueError(f"Prompt character length ({len(self.prompt)}) exceeds maximum limit of 64000 characters.")
        return self
