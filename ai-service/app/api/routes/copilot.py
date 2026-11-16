import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from groq import AsyncGroq
from app.core.config import get_settings

logger = logging.getLogger("ai_service.copilot")
router = APIRouter(prefix="/ai", tags=["AI Copilot & Realtime Generation"])


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: system, user, assistant")
    content: str = Field(..., description="Message text content")


class CopilotChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Conversation messages")
    model: Optional[str] = Field(default=None, description="Groq model ID")
    temperature: Optional[float] = Field(default=0.3, ge=0.0, le=1.0)
    max_tokens: Optional[int] = Field(default=2048)


class CopilotChatResponse(BaseModel):
    success: bool
    content: str
    model: str
    provider: str = "GROQ"


@router.post("/chat", response_model=CopilotChatResponse)
async def chat_with_copilot(payload: CopilotChatRequest):
    import os
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Groq API Key is not configured in AI Service environment.",
        )

    model_to_use = payload.model or os.getenv("GROQ_DEFAULT_MODEL") or "openai/gpt-oss-120b"
    client = AsyncGroq(api_key=api_key)

    formatted_messages = [{"role": m.role, "content": m.content} for m in payload.messages]

    try:
        completion = await client.chat.completions.create(
            model=model_to_use,
            messages=formatted_messages,
            temperature=payload.temperature,
            max_tokens=payload.max_tokens,
        )
        content = completion.choices[0].message.content or ""
        return CopilotChatResponse(
            success=True,
            content=content,
            model=model_to_use,
            provider="GROQ",
        )
    except Exception as exc:
        logger.error(f"Error in Groq chat completion: {exc}", exc_info=True)
        # Try fallback to 20b model if 120b fails
        if "120b" in model_to_use:
            try:
                fallback_comp = await client.chat.completions.create(
                    model="openai/gpt-oss-20b",
                    messages=formatted_messages,
                    temperature=payload.temperature,
                    max_tokens=payload.max_tokens,
                )
                return CopilotChatResponse(
                    success=True,
                    content=fallback_comp.choices[0].message.content or "",
                    model="openai/gpt-oss-20b",
                    provider="GROQ",
                )
            except Exception as e2:
                logger.error(f"Fallback 20b model also failed: {e2}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq API error: {str(exc)}",
        )
