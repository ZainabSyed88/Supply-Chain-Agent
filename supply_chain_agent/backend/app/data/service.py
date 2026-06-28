from __future__ import annotations
from datetime import datetime, timedelta
from functools import lru_cache
import math
import random

from app.data.mock_generator import (
    generate_disruptions,
    generate_orders,
    generate_shipments,
    generate_suppliers,
    generate_demand_history,
    generate_warehouses,
)
from app.models.disruption import Disruption
from app.models.order import Order
from app.models.shipment import Shipment
from app.models.supplier import Supplier
from app.models.warehouse import Warehouse

COUNTRY_COORDINATES = {
    "China": {"lat": 35.8617, "lng": 104.1954},
    "India": {"lat": 20.5937, "lng": 78.9629},
    "Germany": {"lat": 51.1657, "lng": 10.4515},
    "Netherlands": {"lat": 52.1326, "lng": 5.2913},
    "United States": {"lat": 37.0902, "lng": -95.7129},
    "Mexico": {"lat": 23.6345, "lng": -102.5528},
    "Vietnam": {"lat": 14.0583, "lng": 108.2772},
    "Poland": {"lat": 51.9194, "lng": 19.1451},
    "Japan": {"lat": 36.2048, "lng": 138.2529},
    "South Korea": {"lat": 35.9078, "lng": 127.7669},
    "France": {"lat": 46.2276, "lng": 2.2137},
    "Canada": {"lat": 56.1304, "lng": -106.3468},
}

TRANSPORT_MODES = ("air", "sea", "road", "rail")
EMISSIONS_FACTORS = {"air": 2.4, "sea": 0.7, "road": 1.4, "rail": 0.6}


class DataService:
    def __init__(self):
        self._suppliers = generate_suppliers()
        self._shipments = generate_shipments(self._suppliers)
        self._disruptions = generate_disruptions(self._suppliers, self._shipments)
        self._demand_history = generate_demand_history()
        self._inventory = {
            sku_id: random.randint(40, 220) for sku_id in self._demand_history.keys()
        }
        self._warehouses = generate_warehouses()
        self._orders = generate_orders(self._shipments, self._inventory, self._warehouses)

    @property
    def suppliers(self) -> list[Supplier]:
        return self._suppliers

    @property
    def shipments(self) -> list[Shipment]:
        return self._shipments

    @property
    def disruptions(self) -> list[Disruption]:
        return self._disruptions

    @property
    def inventory(self) -> dict[str, int]:
        return self._inventory

    @property
    def orders(self) -> list[Order]:
        return self._orders

    @property
    def warehouses(self) -> list[Warehouse]:
        return self._warehouses

    @lru_cache(maxsize=128)
    def get_suppliers(self, risk_threshold: float | None = None, category: str | None = None) -> list[Supplier]:
        results = self._suppliers
        if risk_threshold is not None:
            results = [supplier for supplier in results if supplier.risk_score >= risk_threshold]
        if category is not None:
            results = [supplier for supplier in results if supplier.category == category]
        return results

    def get_supplier(self, supplier_id: str) -> Supplier | None:
        return next((supplier for supplier in self._suppliers if supplier.supplier_id == supplier_id), None)

    @lru_cache(maxsize=128)
    def get_shipments(self, status: str | None = None, supplier_id: str | None = None) -> list[Shipment]:
        results = self._shipments
        if status is not None:
            results = [shipment for shipment in results if shipment.status == status]
        if supplier_id is not None:
            results = [shipment for shipment in results if shipment.supplier_id == supplier_id]
        return results

    def get_shipment(self, shipment_id: str) -> Shipment | None:
        return next((shipment for shipment in self._shipments if shipment.shipment_id == shipment_id), None)

    @lru_cache(maxsize=128)
    def get_orders(
        self,
        status: str | None = None,
        priority: str | None = None,
        warehouse_id: str | None = None,
    ) -> list[Order]:
        results = self._orders
        if status is not None:
            results = [order for order in results if order.status == status]
        if priority is not None:
            results = [order for order in results if order.priority == priority]
        if warehouse_id is not None:
            results = [order for order in results if order.warehouse_id == warehouse_id]
        return results

    def get_order(self, order_id: str) -> Order | None:
        return next((order for order in self._orders if order.order_id == order_id), None)

    @lru_cache(maxsize=64)
    def get_warehouses(self, region: str | None = None, health: str | None = None) -> list[Warehouse]:
        results = self._warehouses
        if region is not None:
            results = [warehouse for warehouse in results if warehouse.region == region]
        if health is not None:
            results = [warehouse for warehouse in results if warehouse.storage_health == health]
        return results

    def get_warehouse(self, warehouse_id: str) -> Warehouse | None:
        return next((warehouse for warehouse in self._warehouses if warehouse.warehouse_id == warehouse_id), None)

    @lru_cache(maxsize=128)
    def get_disruptions(self, severity: str | None = None, active_only: bool = True) -> list[Disruption]:
        results = self._disruptions
        if severity is not None:
            results = [disruption for disruption in results if disruption.severity == severity]
        if active_only:
            now = datetime.utcnow()
            results = [disruption for disruption in results if disruption.estimated_resolution >= now]
        return results

    @lru_cache(maxsize=32)
    def get_kpis(self) -> dict[str, float | int]:
        total_suppliers = len(self._suppliers)
        active_disruptions = len(self.get_disruptions(active_only=True))
        delayed_shipments = len(self.get_shipments(status="delayed"))
        critical_disruptions = len(self.get_disruptions(severity="critical", active_only=True))
        avg_risk_score = round(sum(s.risk_score for s in self._suppliers) / max(total_suppliers, 1), 2)
        total_value = round(sum(s.value_usd for s in self._shipments), 2)
        open_orders = len([order for order in self._orders if order.status in {"pending", "allocated", "processing", "delayed"}])
        warehouse_utilization = round(
            sum(warehouse.utilization_rate for warehouse in self._warehouses) / max(len(self._warehouses), 1),
            2,
        )
        return {
            "total_suppliers": total_suppliers,
            "active_disruptions": active_disruptions,
            "delayed_shipments": delayed_shipments,
            "critical_disruptions": critical_disruptions,
            "average_supplier_risk": avg_risk_score,
            "total_shipment_value_usd": total_value,
            "open_orders": open_orders,
            "warehouse_utilization_rate": warehouse_utilization,
        }

    @lru_cache(maxsize=64)
    def get_demand_forecast(self, sku_id: str, days: int = 30) -> list[dict[str, float]]:
        history = self._demand_history.get(sku_id, [])
        if not history:
            return []

        last_demand = history[-1]["demand"]
        forecast: list[dict[str, float]] = []
        for day in range(1, days + 1):
            seasonal = 1 + 0.15 * math.sin((2 * math.pi / 30) * day)
            noise = random.uniform(-4, 4)
            forecast.append(
                {
                    "date": (datetime.utcnow().date() + timedelta(days=day)).isoformat(),
                    "demand": round(max(0, last_demand * seasonal + noise), 2),
                }
            )
        return forecast

    def get_inventory_levels(self) -> list[dict[str, object]]:
        return [
            {"sku_id": sku_id, "stock_level": quantity, "threshold": 50}
            for sku_id, quantity in sorted(self._inventory.items())
        ]

    def get_inventory_alerts(self) -> list[dict[str, object]]:
        return [
            {"sku_id": sku_id, "stock_level": quantity, "alert": "low_stock"}
            for sku_id, quantity in self._inventory.items()
            if quantity < 50
        ]

    def get_order_summary(self) -> dict[str, object]:
        backlog = [order for order in self._orders if order.status in {"pending", "allocated", "processing", "delayed"}]
        delayed = [order for order in self._orders if order.status == "delayed"]
        critical = [order for order in backlog if order.priority == "critical"]
        avg_fill_rate = round(
            sum(min(1, order.inventory_available / order.quantity) for order in self._orders) / max(len(self._orders), 1),
            2,
        )
        return {
            "total_orders": len(self._orders),
            "backlog_orders": len(backlog),
            "delayed_orders": len(delayed),
            "critical_orders": len(critical),
            "average_fill_rate": avg_fill_rate,
        }

    def get_warehouse_summary(self) -> dict[str, object]:
        critical_sites = [warehouse for warehouse in self._warehouses if warehouse.storage_health == "critical"]
        avg_picking_efficiency = round(
            sum(warehouse.picking_efficiency for warehouse in self._warehouses) / max(len(self._warehouses), 1),
            2,
        )
        staffing_gap = sum(max(0, warehouse.staff_required - warehouse.staff_scheduled) for warehouse in self._warehouses)
        return {
            "total_warehouses": len(self._warehouses),
            "critical_warehouses": len(critical_sites),
            "average_picking_efficiency": avg_picking_efficiency,
            "staffing_gap": staffing_gap,
        }

    def get_demand_overview(self) -> list[dict[str, object]]:
        sku_ids = sorted(self._demand_history.keys())[:6]
        monthly_totals: dict[str, float] = {}
        for sku_id in sku_ids:
            for entry in self._demand_history[sku_id][-180:]:
                month_key = entry["date"][:7]
                monthly_totals[month_key] = monthly_totals.get(month_key, 0) + float(entry["demand"])

        historical_months = sorted(monthly_totals.keys())[-6:]
        historical = [
            {"month": month, "demand": round(monthly_totals[month], 2), "forecast": False}
            for month in historical_months
        ]

        forecast_totals: dict[str, float] = {}
        for sku_id in sku_ids:
            for entry in self.get_demand_forecast(sku_id, days=90):
                month_key = entry["date"][:7]
                forecast_totals[month_key] = forecast_totals.get(month_key, 0) + float(entry["demand"])

        forecast_months = sorted(forecast_totals.keys())[:3]
        forecast = [
            {"month": month, "demand": round(forecast_totals[month], 2), "forecast": True}
            for month in forecast_months
        ]
        return historical + forecast

    def get_map_data(self) -> dict[str, list[dict[str, object]]]:
        suppliers = []
        for supplier in self._suppliers:
            base = COUNTRY_COORDINATES.get(supplier.country, COUNTRY_COORDINATES["United States"])
            suffix = int(supplier.supplier_id.split("-")[-1])
            offset = ((suffix % 5) - 2) * 0.55
            suppliers.append({
                **supplier.model_dump(),
                "coordinates": {
                    "lat": round(base["lat"] + offset, 4),
                    "lng": round(base["lng"] - offset, 4),
                },
            })

        shipments = []
        for shipment in self._shipments:
            shipments.append({
                **shipment.model_dump(),
                "transport_mode": self._transport_mode(shipment),
                "origin_coordinates": COUNTRY_COORDINATES.get(shipment.origin, COUNTRY_COORDINATES["United States"]),
                "destination_coordinates": COUNTRY_COORDINATES.get(
                    shipment.destination, COUNTRY_COORDINATES["United States"]
                ),
            })

        disruptions = []
        for disruption in self._disruptions:
            impacted = [item for item in suppliers if item["supplier_id"] in disruption.affected_supplier_ids]
            if impacted:
                avg_lat = sum(item["coordinates"]["lat"] for item in impacted) / len(impacted)
                avg_lng = sum(item["coordinates"]["lng"] for item in impacted) / len(impacted)
            else:
                avg_lat = COUNTRY_COORDINATES["United States"]["lat"]
                avg_lng = COUNTRY_COORDINATES["United States"]["lng"]
            disruptions.append({
                **disruption.model_dump(),
                "coordinates": {"lat": round(avg_lat, 4), "lng": round(avg_lng, 4)},
            })

        return {"suppliers": suppliers, "shipments": shipments, "disruptions": disruptions}

    def get_carbon_dashboard(self) -> dict[str, object]:
        mode_totals = {mode: 0.0 for mode in TRANSPORT_MODES}
        monthly_totals: dict[str, float] = {}
        supplier_impacts: dict[str, float] = {}
        recommendations: list[dict[str, object]] = []

        for shipment in self._shipments:
            mode = self._transport_mode(shipment)
            emissions = round((shipment.value_usd / 10000) * EMISSIONS_FACTORS[mode], 2)
            mode_totals[mode] += emissions

            month_key = shipment.eta.date().replace(day=1).isoformat()[:7]
            monthly_totals[month_key] = monthly_totals.get(month_key, 0) + emissions
            supplier_impacts[shipment.supplier_id] = supplier_impacts.get(shipment.supplier_id, 0) + emissions

            if mode == "air":
                recommendations.append({
                    "shipment_id": shipment.shipment_id,
                    "supplier_id": shipment.supplier_id,
                    "current_mode": mode,
                    "recommendation": "Switch to Sea",
                    "estimated_co2_savings": round(emissions * 0.55, 2),
                    "estimated_cost_savings": round(shipment.value_usd * 0.04, 2),
                })

        total_co2 = round(sum(mode_totals.values()), 2)
        monthly_series = [
            {"month": month, "co2": round(value, 2), "target": round(value * 0.88, 2)}
            for month, value in sorted(monthly_totals.items())[-6:]
        ]

        leaderboard = []
        for supplier in self._suppliers:
            impact = round(supplier_impacts.get(supplier.supplier_id, 0), 2)
            leaderboard.append({
                "supplier_id": supplier.supplier_id,
                "name": supplier.name,
                "country": supplier.country,
                "esg_score": supplier.esg_score,
                "grade": self._grade_for_score(supplier.esg_score),
                "co2_impact": impact,
            })
        leaderboard.sort(key=lambda item: item["esg_score"], reverse=True)

        return {
            "kpis": {
                "total_co2": total_co2,
                "car_equivalents": round(total_co2 / 4.6, 1),
                "trees_to_offset": round(total_co2 * 16.5),
                "average_esg_score": round(
                    sum(supplier.esg_score for supplier in self._suppliers) / max(len(self._suppliers), 1), 1
                ),
            },
            "by_mode": [
                {"mode": mode.title(), "value": round(value, 2)}
                for mode, value in mode_totals.items()
            ],
            "monthly": monthly_series,
            "leaderboard": leaderboard[:10],
            "recommendations": recommendations[:8],
        }

    def get_anomalies(self) -> list[dict[str, object]]:
        anomalies = []
        for alert in self.get_inventory_alerts():
            anomalies.append({
                "id": f"INV-{alert['sku_id']}",
                "type": "inventory",
                "severity": "high",
                "title": f"Low stock detected for {alert['sku_id']}",
                "description": f"Stock level is {alert['stock_level']} units.",
            })

        for shipment in self.get_shipments(status="delayed")[:5]:
            anomalies.append({
                "id": shipment.shipment_id,
                "type": "shipment",
                "severity": "medium" if shipment.delay_days < 3 else "high",
                "title": f"Shipment {shipment.shipment_id} is delayed",
                "description": f"Delay is currently {shipment.delay_days} day(s).",
            })

        for order in self.get_orders(status="delayed")[:5]:
            anomalies.append({
                "id": order.order_id,
                "type": "order",
                "severity": "high" if order.priority in {"high", "critical"} else "medium",
                "title": f"Order {order.order_id} is delayed",
                "description": f"{order.quantity} units of {order.sku_id} are behind the promised date.",
            })

        for warehouse in self.get_warehouses(health="critical")[:4]:
            anomalies.append({
                "id": warehouse.warehouse_id,
                "type": "warehouse",
                "severity": "high",
                "title": f"{warehouse.name} is capacity constrained",
                "description": f"Utilization is at {round(warehouse.utilization_rate * 100)}% with {warehouse.pending_shipments} pending shipments.",
            })
        return anomalies

    def _transport_mode(self, shipment: Shipment) -> str:
        checksum = sum(ord(char) for char in shipment.shipment_id)
        return TRANSPORT_MODES[checksum % len(TRANSPORT_MODES)]

    def _grade_for_score(self, score: float) -> str:
        if score >= 85:
            return "A"
        if score >= 70:
            return "B"
        if score >= 55:
            return "C"
        return "D"
