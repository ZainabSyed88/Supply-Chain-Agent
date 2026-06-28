from __future__ import annotations
from fastapi import APIRouter, Depends

from app.models.db_models import User
from app.services.auth_service import require_viewer

router = APIRouter()


@router.get("/status")
async def get_agents_status(current_user: User = Depends(require_viewer)):
    return {"status": "available", "agents": 16}
