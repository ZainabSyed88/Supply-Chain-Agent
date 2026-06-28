from __future__ import annotations
from fastapi import APIRouter, Depends, Query, Request

from app.models.db_models import User
from app.services.auth_service import require_viewer

router = APIRouter()


@router.get("")
async def list_inventory(
    request: Request,
    risk_threshold: float | None = Query(None),
    current_user: User = Depends(require_viewer),
):
    data_service = request.app.state.data_service
    return data_service.get_inventory_levels()


@router.get("/alerts")
async def inventory_alerts(request: Request, current_user: User = Depends(require_viewer)):
    data_service = request.app.state.data_service
    return data_service.get_inventory_alerts()
