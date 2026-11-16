from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str
    context_window: int
    max_output_tokens: int
    description: str
    is_default: bool = False


# Supported models for Groq provider
GROQ_SUPPORTED_MODELS: Dict[str, ModelInfo] = {
    "openai/gpt-oss-120b": ModelInfo(
        id="openai/gpt-oss-120b",
        name="GPT-OSS 120B",
        provider="GROQ",
        context_window=131072,
        max_output_tokens=8192,
        description="High-performance open weights 120B model on Groq LPUs.",
        is_default=True,
    ),
    "openai/gpt-oss-20b": ModelInfo(
        id="openai/gpt-oss-20b",
        name="GPT-OSS 20B",
        provider="GROQ",
        context_window=131072,
        max_output_tokens=4096,
        description="Fast low-latency open weights 20B model on Groq LPUs.",
        is_default=False,
    ),
    "llama-3.3-70b-versatile": ModelInfo(
        id="llama-3.3-70b-versatile",
        name="Llama 3.3 70B Versatile",
        provider="GROQ",
        context_window=131072,
        max_output_tokens=32768,
        description="State-of-the-art multilingual model with 128k context; recommended default for complex career advisory and resume optimization.",
        is_default=False,
    ),
    "llama-3.1-8b-instant": ModelInfo(
        id="llama-3.1-8b-instant",
        name="Llama 3.1 8B Instant",
        provider="GROQ",
        context_window=131072,
        max_output_tokens=8192,
        description="Fast, ultra-low latency model for real-time text processing, formatting and quick phrasing improvements.",
        is_default=False,
    ),
    "mixtral-8x7b-32768": ModelInfo(
        id="mixtral-8x7b-32768",
        name="Mixtral 8x7B",
        provider="GROQ",
        context_window=32768,
        max_output_tokens=4096,
        description="High-throughput mixture-of-experts model for structured analysis.",
        is_default=False,
    ),
    "gemma2-9b-it": ModelInfo(
        id="gemma2-9b-it",
        name="Gemma 2 9B IT",
        provider="GROQ",
        context_window=8192,
        max_output_tokens=4096,
        description="Google open model running on Groq LPUs.",
        is_default=False,
    ),
}

DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b"


# Supported models for Google Gemini provider
GEMINI_SUPPORTED_MODELS: Dict[str, ModelInfo] = {
    "gemini-2.0-flash": ModelInfo(
        id="gemini-2.0-flash",
        name="Gemini 2.0 Flash",
        provider="GEMINI",
        context_window=1048576,
        max_output_tokens=8192,
        description="Google's next-generation multimodal model with 1M context, high speed and strong multimodal reasoning.",
        is_default=True,
    ),
    "gemini-1.5-pro": ModelInfo(
        id="gemini-1.5-pro",
        name="Gemini 1.5 Pro",
        provider="GEMINI",
        context_window=2097152,
        max_output_tokens=8192,
        description="Google's flagship reasoning model with 2M context for complex career analysis and extensive portfolio evaluation.",
        is_default=False,
    ),
    "gemini-1.5-flash": ModelInfo(
        id="gemini-1.5-flash",
        name="Gemini 1.5 Flash",
        provider="GEMINI",
        context_window=1048576,
        max_output_tokens=8192,
        description="High-frequency, lightweight model optimized for rapid text transformation.",
        is_default=False,
    ),
}

DEFAULT_GEMINI_MODEL = "gemini-2.0-flash"


def get_supported_groq_models() -> List[str]:
    """Returns list of supported Groq model IDs."""
    return list(GROQ_SUPPORTED_MODELS.keys())


def is_valid_groq_model(model_id: str) -> bool:
    """Validates if a given model identifier is supported for Groq."""
    return model_id in GROQ_SUPPORTED_MODELS


def get_groq_model_info(model_id: str) -> Optional[ModelInfo]:
    """Retrieves metadata for a Groq model if supported."""
    return GROQ_SUPPORTED_MODELS.get(model_id)


def get_supported_gemini_models() -> List[str]:
    """Returns list of supported Gemini model IDs."""
    return list(GEMINI_SUPPORTED_MODELS.keys())


def is_valid_gemini_model(model_id: str) -> bool:
    """Validates if a given model identifier is supported for Gemini."""
    return model_id in GEMINI_SUPPORTED_MODELS


def get_gemini_model_info(model_id: str) -> Optional[ModelInfo]:
    """Retrieves metadata for a Gemini model if supported."""
    return GEMINI_SUPPORTED_MODELS.get(model_id)
