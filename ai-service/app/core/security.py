import logging
from typing import Optional
from fastapi import Depends, Header, HTTPException, status

from app.core.config import Settings, get_settings

logger = logging.getLogger("ai_service.security")


def verify_internal_service_key(
    x_internal_service_key: Optional[str] = Header(None, alias="X-Internal-Service-Key"),
    settings: Settings = Depends(get_settings)
) -> None:
    """
    Verifies service-to-service authentication header.
    Only requests dispatched by trusted internal services (Spring Boot) carrying
    the valid shared secret are permitted to invoke internal endpoints.
    """
    if not settings.internal_service_key:
        return

    if not x_internal_service_key or x_internal_service_key != settings.internal_service_key:
        logger.warning("Rejected unauthorized internal service request (invalid or missing X-Internal-Service-Key)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal service credentials."
        )
