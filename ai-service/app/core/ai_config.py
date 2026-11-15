import os
from typing import Optional
from pydantic import BaseModel, Field
from app.core.model_config import DEFAULT_GROQ_MODEL


class GroqSettings(BaseModel):
    """
    Configuration parameters for the Groq AI Provider.
    Loaded securely from environment variables.
    """
    api_key: Optional[str] = Field(default=None, description="Groq Cloud API Key")
    default_model: str = Field(default=DEFAULT_GROQ_MODEL, description="Default model for text generation")
    timeout_seconds: float = Field(default=30.0, description="Per-request timeout in seconds")
    max_retries: int = Field(default=2, description="Maximum retries for transient errors")
    max_output_tokens: int = Field(default=4096, description="Upper bound for generation tokens")
    max_concurrency: int = Field(default=10, description="Concurrency semaphore ceiling")
    max_input_chars: int = Field(default=32000, description="Safety limit for input prompt character length")

    @property
    def is_configured(self) -> bool:
        """Returns True if a non-placeholder API key is configured."""
        if not self.api_key:
            return False
        key = self.api_key.strip()
        return bool(key) and not key.startswith("gsk_your_groq_api_key") and key != "placeholder"


def load_groq_settings_from_env() -> GroqSettings:
    """Instantiates GroqSettings from ambient environment variables."""
    api_key = os.getenv("GROQ_API_KEY", "").strip() or None
    default_model = os.getenv("GROQ_DEFAULT_MODEL", DEFAULT_GROQ_MODEL).strip()
    
    timeout_str = os.getenv("GROQ_TIMEOUT_SECONDS", "30.0")
    try:
        timeout_seconds = float(timeout_str)
    except ValueError:
        timeout_seconds = 30.0

    retries_str = os.getenv("GROQ_MAX_RETRIES", "2")
    try:
        max_retries = int(retries_str)
    except ValueError:
        max_retries = 2

    tokens_str = os.getenv("GROQ_MAX_OUTPUT_TOKENS", "4096")
    try:
        max_output_tokens = int(tokens_str)
    except ValueError:
        max_output_tokens = 4096

    concurrency_str = os.getenv("GROQ_MAX_CONCURRENCY", "10")
    try:
        max_concurrency = int(concurrency_str)
    except ValueError:
        max_concurrency = 10

    return GroqSettings(
        api_key=api_key,
        default_model=default_model,
        timeout_seconds=timeout_seconds,
        max_retries=max_retries,
        max_output_tokens=max_output_tokens,
        max_concurrency=max_concurrency
    )
