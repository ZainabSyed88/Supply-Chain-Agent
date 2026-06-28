from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class Warehouse(BaseModel):
    warehouse_id: str
    name: str
    region: str
    country: str
    utilization_rate: float = Field(ge=0, le=1)
    staff_scheduled: int = Field(ge=0)
    staff_required: int = Field(ge=0)
    pending_shipments: int = Field(ge=0)
    dock_capacity: int = Field(ge=1)
    throughput_today: int = Field(ge=0)
    storage_health: Literal["stable", "tight", "critical"]
    picking_efficiency: float = Field(ge=0, le=1)
