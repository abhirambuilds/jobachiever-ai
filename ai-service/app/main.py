import logging
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import health, resume_parser
from app.core.config import get_settings
from app.core.logging import setup_logging

settings = get_settings()
logger = setup_logging(settings.log_level)

app = FastAPI(
    title="JobAchiever AI Service",
    description="Stateless AI Microservice for Document Parsing and Career Analysis",
    version=settings.version,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

# CORS Middleware (Restricted to internal / authorized caller origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats Pydantic request validation failures into standard JSON error contracts."""
    errors = []
    for error in exc.errors():
        loc = " -> ".join(str(l) for l in error.get("loc", []))
        errors.append({
            "field": loc,
            "message": error.get("msg", "Validation error"),
            "type": error.get("type", "invalid")
        })

    logger.warning("Request validation failed at %s: %s", request.url.path, errors)
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "status": 400,
            "error": "Bad Request",
            "message": "Invalid request parameters",
            "path": request.url.path,
            "details": errors
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Uniform handler for domain and HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": exc.status_code,
            "error": "HTTP Error",
            "message": exc.detail,
            "path": request.url.path
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Sanitizes unhandled server errors to prevent leaking stack traces or internal secrets."""
    logger.error("Unhandled exception at %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": 500,
            "error": "Internal Server Error",
            "message": "An unexpected error occurred processing your request.",
            "path": request.url.path
        }
    )


# Mount versioned API routes under /api/v1
app.include_router(health.router, prefix="/api/v1")
app.include_router(resume_parser.router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
