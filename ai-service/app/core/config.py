import os
from functools import lru_cache
from typing import List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centralized configuration settings for the JobAchiever AI Microservice.
    Loaded from environment variables or .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    # Service Metadata
    service_name: str = "jobachiever-ai-service"
    version: str = "1.0.0"
    env: str = "development"
    log_level: str = "INFO"

    # Server Bindings
    host: str = "0.0.0.0"
    port: int = 8000

    # Internal Service-to-Service Authentication
    # Shared secret for trusted Spring Boot <-> FastAPI requests
    internal_service_key: str = "dev-internal-service-secret-key-change-in-prod"

    # Upload Constraints (Default: 10 MB)
    max_upload_size_bytes: int = 10 * 1024 * 1024

    # CORS Configuration
    cors_allowed_origins: Union[str, List[str]] = ["http://localhost:8080", "http://127.0.0.1:8080"]

    # Groq AI Provider Configuration
    groq_api_key: Optional[str] = None
    groq_default_model: str = "llama-3.3-70b-versatile"
    groq_timeout_seconds: float = 30.0
    groq_max_retries: int = 2
    groq_max_output_tokens: int = 4096
    groq_max_concurrency: int = 10

    # Google Gemini AI Provider Configuration
    gemini_api_key: Optional[str] = None
    gemini_default_model: str = "gemini-2.0-flash"
    gemini_timeout_seconds: float = 30.0
    gemini_max_output_tokens: int = 4096
    gemini_max_concurrency: int = 10

    @field_validator("cors_allowed_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @property
    def is_production(self) -> bool:
        return self.env.lower() in ("prod", "production")


@lru_cache()
def get_settings() -> Settings:
    """Return a cached singleton instance of application settings."""
    return Settings()
