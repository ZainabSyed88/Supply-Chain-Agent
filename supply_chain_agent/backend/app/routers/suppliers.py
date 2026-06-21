from __future__ import annotations
from fastapi import APIRouter, HTTPException, Query, Request

router = APIRouter()


@router.get("")
async def list_suppliers(request: Request, risk_threshold: float | None = Query(None), category: str | None = Query(None)):
    data_service = request.app.state.data_service
    return data_service.get_suppliers(risk_threshold=risk_threshold, category=category)


@router.get("/{supplier_id}")
async def get_supplier(supplier_id: str, request: Request):
    supplier = request.app.state.data_service.get_supplier(supplier_id)
    if supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier
