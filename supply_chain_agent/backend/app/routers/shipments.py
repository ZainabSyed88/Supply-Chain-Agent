from __future__ import annotations
from fastapi import APIRouter, HTTPException, Query, Request

router = APIRouter()


@router.get("")
async def list_shipments(
    request: Request,
    status: str | None = Query(None),
    supplier_id: str | None = Query(None),
):
    data_service = request.app.state.data_service
    return data_service.get_shipments(status=status, supplier_id=supplier_id)


@router.get("/{shipment_id}")
async def get_shipment(shipment_id: str, request: Request):
    shipment = request.app.state.data_service.get_shipment(shipment_id)
    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment
