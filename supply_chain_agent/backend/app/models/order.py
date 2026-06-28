from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class Order(BaseModel):
    order_id: str
    sku_id: str
    customer_name: str
    destination_region: str
    warehouse_id: str
    shipment_id: str | None = None
    status: Literal["pending", "allocated", "processing", "shipped", "delayed"]
    priority: Literal["low", "medium", "high", "critical"]
    quantity: int = Field(ge=1)
    inventory_available: int = Field(ge=0)
    promised_date: datetime
    created_at: datetime
    fulfillment_risk: float = Field(ge=0, le=100)
