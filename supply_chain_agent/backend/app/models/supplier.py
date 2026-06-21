from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field


class Supplier(BaseModel):
    supplier_id: str
    name: str
    country: str
    category: Literal["Electronics", "Raw Materials", "Packaging", "Finished Goods"]
    on_time_delivery_rate: float = Field(ge=0, le=1)
    defect_rate: float = Field(ge=0, le=1)
    avg_lead_time_days: int
    risk_score: float = Field(ge=0, le=100)
    esg_score: float = Field(ge=0, le=100)
    active: bool


class SupplierRisk(BaseModel):
    supplier: Supplier
    active_disruptions: int
    affected_shipments: int
    recommended_action: str
