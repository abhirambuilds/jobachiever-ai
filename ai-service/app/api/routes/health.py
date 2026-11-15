from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import get_settings

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """
    Public operational health verification endpoint.
    Returns status UP without exposing internal system secrets or credentials.
    """
    settings = get_settings()
    return HealthResponse(
        status="UP",
        service=settings.service_name,
        version=settings.version
    )
