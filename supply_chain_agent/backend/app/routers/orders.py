from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.models.db_models import User
from app.services.auth_service import require_viewer

router = APIRouter()


@router.get("")
async def list_orders(
    request: Request,
    status: str | None = Query(None),
    priority: str | None = Query(None),
    warehouse_id: str | None = Query(None),
    current_user: User = Depends(require_viewer),
):
    return request.app.state.data_service.get_orders(status=status, priority=priority, warehouse_id=warehouse_id)


@router.get("/summary")
async def get_order_summary(request: Request, current_user: User = Depends(require_viewer)):
    return request.app.state.data_service.get_order_summary()


@router.get("/{order_id}")
async def get_order(order_id: str, request: Request, current_user: User = Depends(require_viewer)):
    order = request.app.state.data_service.get_order(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
