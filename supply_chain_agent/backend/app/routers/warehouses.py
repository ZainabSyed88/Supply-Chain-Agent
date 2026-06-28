from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.models.db_models import User
from app.services.auth_service import require_viewer

router = APIRouter()


@router.get("")
async def list_warehouses(
    request: Request,
    region: str | None = Query(None),
    health: str | None = Query(None),
    current_user: User = Depends(require_viewer),
):
    return request.app.state.data_service.get_warehouses(region=region, health=health)


@router.get("/summary")
async def get_warehouse_summary(request: Request, current_user: User = Depends(require_viewer)):
    return request.app.state.data_service.get_warehouse_summary()


@router.get("/{warehouse_id}")
async def get_warehouse(warehouse_id: str, request: Request, current_user: User = Depends(require_viewer)):
    warehouse = request.app.state.data_service.get_warehouse(warehouse_id)
    if warehouse is None:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse
