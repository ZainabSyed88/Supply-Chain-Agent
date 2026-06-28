from __future__ import annotations
from functools import lru_cache

from app.data.service import DataService


@lru_cache(maxsize=1)
def get_data_service() -> DataService:
    return DataService()


def load_suppliers(risk_threshold: float | None = None, category: str | None = None):
    return get_data_service().get_suppliers(risk_threshold=risk_threshold, category=category)


def load_shipments(status: str | None = None, supplier_id: str | None = None):
    return get_data_service().get_shipments(status=status, supplier_id=supplier_id)


def load_disruptions(severity: str | None = None, active_only: bool = True):
    return get_data_service().get_disruptions(severity=severity, active_only=active_only)


def get_dashboard_kpis() -> dict[str, float | int]:
    return get_data_service().get_kpis()


def load_inventory_levels() -> list[dict[str, object]]:
    return get_data_service().get_inventory_levels()


def load_inventory_alerts() -> list[dict[str, object]]:
    return get_data_service().get_inventory_alerts()


def load_orders(status: str | None = None, priority: str | None = None, warehouse_id: str | None = None):
    return get_data_service().get_orders(status=status, priority=priority, warehouse_id=warehouse_id)


def load_warehouses(region: str | None = None, health: str | None = None):
    return get_data_service().get_warehouses(region=region, health=health)
