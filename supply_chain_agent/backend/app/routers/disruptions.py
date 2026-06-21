from __future__ import annotations
from fastapi import APIRouter, Query, Request

router = APIRouter()


@router.get("")
async def list_disruptions(request: Request, severity: str | None = Query(None), active_only: bool = Query(True)):
    data_service = request.app.state.data_service
    return data_service.get_disruptions(severity=severity, active_only=active_only)
