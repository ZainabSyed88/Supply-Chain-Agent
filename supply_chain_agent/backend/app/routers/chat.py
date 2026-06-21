from __future__ import annotations
from fastapi import APIRouter, Request
from app.models.agent import ChatMessage
from app.services.fallback_copilot import FallbackCopilotService

router = APIRouter()


@router.post("")
async def send_chat(request: Request, message: ChatMessage):
    llm_service = getattr(request.app.state, "llm_service", None)
    if llm_service is not None:
        try:
            response = await llm_service.send_message(message.message)
            return {"message": message.message, "response": response, "mode": "llm"}
        except Exception:
            pass

    fallback_service = FallbackCopilotService(request.app.state.data_service)
    response = fallback_service.respond(message.message)
    return {"message": message.message, "response": response, "mode": "fallback"}
