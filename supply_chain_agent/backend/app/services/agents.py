from __future__ import annotations
import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from app.data.service import DataService


@dataclass
class AgentContext:
    run_id: str
    timestamp: datetime
    supplier_data: dict[str, Any] = field(default_factory=dict)
    disruptions: list[dict[str, Any]] = field(default_factory=list)
    risk_scores: dict[str, float] = field(default_factory=dict)
    recommendations: list[dict[str, Any]] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    execution_details: dict[str, dict[str, Any]] = field(default_factory=dict)


class BaseAgent:
    def __init__(self, name: str, data_service: DataService):
        self.name = name
        self.data_service = data_service

    async def run(self, context: AgentContext) -> AgentContext:
        raise NotImplementedError("Agents must implement run().")


class SupplierMonitorAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        suppliers = self.data_service.suppliers
        highest_risk = sorted(suppliers, key=lambda supplier: supplier.risk_score, reverse=True)[:5]
        context.supplier_data = {
            "total_suppliers": len(suppliers),
            "top_risk_suppliers": [supplier.model_dump() for supplier in highest_risk],
        }
        context.execution_details[self.name] = {"suppliers_scanned": len(suppliers)}
        await asyncio.sleep(0)
        return context


class DisruptionDetectorAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        disruptions = self.data_service.get_disruptions(active_only=True)
        context.disruptions = [disruption.model_dump() for disruption in disruptions]
        context.execution_details[self.name] = {
            "active_disruptions": len(disruptions),
        }
        await asyncio.sleep(0)
        return context


class NewsIntelligenceAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        active_disruptions = context.disruptions
        headlines = [
            f"Detected {disruption['severity']} {disruption['type']} event affecting {len(disruption['affected_supplier_ids'])} suppliers"
            for disruption in active_disruptions
        ]
        context.execution_details[self.name] = {"headlines": headlines[:3]}
        context.recommendations.append(
            {
                "agent": self.name,
                "summary": "Monitor news and confirm disruption signals.",
                "alerts": headlines,
            }
        )
        await asyncio.sleep(0)
        return context


class DemandForecastingAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        sku_ids = list(self.data_service._demand_history.keys())[:3]
        forecasts = {
            sku_id: self.data_service.get_demand_forecast(sku_id, days=30)
            for sku_id in sku_ids
        }
        context.execution_details[self.name] = {"forecasted_skus": len(forecasts)}
        context.recommendations.append(
            {"agent": self.name, "forecast": forecasts}
        )
        await asyncio.sleep(0)
        return context


class InventoryOptimizationAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        inventory_levels = self.data_service.get_inventory_levels()
        low_stock = [item for item in inventory_levels if item["stock_level"] < 60]
        context.recommendations.append(
            {
                "agent": self.name,
                "low_stock_items": low_stock,
                "message": "Recommend reorder for low stock SKUs.",
            }
        )
        context.execution_details[self.name] = {"low_stock_count": len(low_stock)}
        await asyncio.sleep(0)
        return context


class LogisticsRouteAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        shipments = self.data_service.get_shipments(status="in_transit")
        alternate_routes = [
            {"shipment_id": shipment.shipment_id, "suggested_action": "monitor route and confirm carrier"}
            for shipment in shipments[:5]
        ]
        context.recommendations.append(
            {"agent": self.name, "routes": alternate_routes}
        )
        context.execution_details[self.name] = {"in_transit_shipments": len(shipments)}
        await asyncio.sleep(0)
        return context


class RiskAssessmentAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        supplier_data = context.supplier_data.get("top_risk_suppliers", [])
        risk_scores = {supplier["supplier_id"]: supplier["risk_score"] for supplier in supplier_data}
        context.risk_scores = risk_scores
        context.execution_details[self.name] = {"assessed_suppliers": len(risk_scores)}
        await asyncio.sleep(0)
        return context


class MitigationAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        active_disruptions = context.disruptions
        mitigation_plans = [
            {
                "disruption_id": disruption.get("disruption_id"),
                "recommendation": "Engage alternate suppliers and reroute shipments.",
            }
            for disruption in active_disruptions[:3]
        ]
        context.recommendations.append(
            {
                "agent": self.name,
                "mitigation_plans": mitigation_plans,
                "summary": "Generate mitigation actions for active disruptions.",
            }
        )
        context.execution_details[self.name] = {"mitigation_plans": len(mitigation_plans)}
        await asyncio.sleep(0)
        return context


class FinancialImpactAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        active_disruptions = context.disruptions
        total_impact = sum(item["estimated_revenue_impact_usd"] for item in active_disruptions)
        context.recommendations.append(
            {
                "agent": self.name,
                "estimated_revenue_impact_usd": total_impact,
                "summary": "Compute financial exposure from active disruptions.",
            }
        )
        context.execution_details[self.name] = {"total_impact_usd": total_impact}
        await asyncio.sleep(0)
        return context


class AlternateSupplierAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        high_risk_suppliers = [
            supplier
            for supplier in self.data_service.suppliers
            if supplier.risk_score >= 70 and supplier.active
        ][:3]
        context.recommendations.append(
            {
                "agent": self.name,
                "alternate_suppliers": [supplier.model_dump() for supplier in high_risk_suppliers],
                "message": "Identify alternate suppliers for high-risk supply lanes.",
            }
        )
        context.execution_details[self.name] = {"alternate_supplier_count": len(high_risk_suppliers)}
        await asyncio.sleep(0)
        return context


class DecisionSynthesisAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        recommendations = [entry for entry in context.recommendations if entry["agent"] != self.name]
        context.recommendations.append(
            {
                "agent": self.name,
                "strategy": "Synthesize decisions from tier 1-3 analysis.",
                "summary": f"Found {len(recommendations)} upstream recommendations.",
            }
        )
        context.execution_details[self.name] = {"upstream_recommendations": len(recommendations)}
        await asyncio.sleep(0)
        return context


class StakeholderNotificationAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        context.recommendations.append(
            {
                "agent": self.name,
                "notification": "Stakeholder alerts generated for executive operations.",
                "status": "queued",
            }
        )
        context.execution_details[self.name] = {"notifications_created": 1}
        await asyncio.sleep(0)
        return context


class ReportGenerationAgent(BaseAgent):
    async def run(self, context: AgentContext) -> AgentContext:
        context.recommendations.append(
            {
                "agent": self.name,
                "report": "Generated summary report for executive review.",
                "status": "ready",
            }
        )
        context.execution_details[self.name] = {"report_status": "ready"}
        await asyncio.sleep(0)
        return context
