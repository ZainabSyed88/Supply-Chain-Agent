from __future__ import annotations
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class Shipment(BaseModel):
    shipment_id: str
    supplier_id: str
    origin: str
    destination: str
    status: Literal["in_transit", "delayed", "delivered", "at_risk"]
    value_usd: float = Field(ge=0)
    eta: datetime
    actual_delivery: datetime | None
    carrier: str
    tracking_number: str
    delay_days: int = Field(ge=0)
