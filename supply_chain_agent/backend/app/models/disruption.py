from __future__ import annotations
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class Disruption(BaseModel):
    disruption_id: str
    type: Literal["weather", "strike", "port_congestion", "customs", "geopolitical"]
    severity: Literal["critical", "high", "medium", "low"]
    affected_supplier_ids: list[str]
    affected_shipment_ids: list[str]
    description: str
    detected_at: datetime
    estimated_resolution: datetime
    estimated_revenue_impact_usd: float = Field(ge=0)
