from __future__ import annotations
from fastapi import APIRouter, Query, Request

router = APIRouter()


@router.get("")
async def list_inventory(request: Request, risk_threshold: float | None = Query(None)):
    data_service = request.app.state.data_service
    return data_service.get_inventory_levels()


@router.get("/alerts")
async def inventory_alerts(request: Request):
    data_service = request.app.state.data_service
    return data_service.get_inventory_alerts()
