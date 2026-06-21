from __future__ import annotations

from app.data.service import DataService


class FallbackCopilotService:
    def __init__(self, data_service: DataService):
        self.data_service = data_service

    def respond(self, message: str) -> str:
        normalized = message.lower()

        if any(keyword in normalized for keyword in ("highest risk", "riskiest", "top risk supplier", "supplier is highest risk")):
            return self._highest_risk_supplier_response()
        if any(keyword in normalized for keyword in ("delayed shipment", "shipments are delayed", "shipment delayed", "delay")):
            return self._delayed_shipments_response()
        if any(keyword in normalized for keyword in ("financial impact", "revenue impact", "cost impact", "impact")):
            return self._financial_impact_response()
        if any(keyword in normalized for keyword in ("carbon", "co2", "footprint", "emissions", "esg")):
            return self._carbon_response()
        if any(keyword in normalized for keyword in ("draft email", "write email", "email to", "supplier email")):
            return self._email_draft_response(message)
        if any(keyword in normalized for keyword in ("simulate supplier failure", "supplier failure", "alternate supplier", "backup supplier")):
            return self._supplier_failure_response(message)
        if any(keyword in normalized for keyword in ("summary", "summarize", "overview", "status")):
            return self._overview_response()
        return self._generic_response()

    def _highest_risk_supplier_response(self) -> str:
        suppliers = sorted(self.data_service.get_suppliers(), key=lambda supplier: supplier.risk_score, reverse=True)
        top_supplier = suppliers[0]
        related_shipments = self.data_service.get_shipments(supplier_id=top_supplier.supplier_id)
        disruptions = [
            disruption for disruption in self.data_service.get_disruptions(active_only=True)
            if top_supplier.supplier_id in disruption.affected_supplier_ids
        ]
        return (
            f"The highest-risk supplier right now is {top_supplier.name} ({top_supplier.supplier_id}) in "
            f"{top_supplier.country}. Its risk score is {top_supplier.risk_score:.1f}, on-time delivery is "
            f"{top_supplier.on_time_delivery_rate * 100:.1f}%, and ESG score is {top_supplier.esg_score:.1f}. "
            f"It currently has {len(related_shipments)} linked shipment(s) and {len(disruptions)} active disruption(s). "
            f"My recommendation is to monitor service levels daily and line up an alternate supplier in the same category."
        )

    def _delayed_shipments_response(self) -> str:
        delayed_shipments = sorted(
            self.data_service.get_shipments(status="delayed"),
            key=lambda shipment: (shipment.delay_days, shipment.value_usd),
            reverse=True,
        )
        if not delayed_shipments:
            return "There are no delayed shipments in the current dataset."

        supplier_names = {supplier.supplier_id: supplier.name for supplier in self.data_service.get_suppliers()}
        top_rows = [
            f"{shipment.shipment_id} from {supplier_names.get(shipment.supplier_id, shipment.supplier_id)} "
            f"is delayed by {shipment.delay_days} day(s) with ETA {shipment.eta.date().isoformat()} and value "
            f"${shipment.value_usd:,.0f}"
            for shipment in delayed_shipments[:5]
        ]
        return (
            f"There are {len(delayed_shipments)} delayed shipment(s) right now. "
            f"Top delayed lanes: {'; '.join(top_rows)}. "
            "Focus first on the highest-value delayed shipment and contact the carrier for revised milestones."
        )

    def _financial_impact_response(self) -> str:
        delayed_or_risky = [
            shipment for shipment in self.data_service.get_shipments()
            if shipment.status in {"delayed", "at_risk"}
        ]
        shipment_value = sum(shipment.value_usd for shipment in delayed_or_risky)
        disruption_value = sum(
            disruption.estimated_revenue_impact_usd
            for disruption in self.data_service.get_disruptions(active_only=True)
        )
        return (
            f"Estimated financial exposure is ${shipment_value:,.0f} across delayed or at-risk shipments, plus "
            f"${disruption_value:,.0f} in modeled disruption revenue impact. "
            "The fastest mitigation levers are expediting the highest-value delayed shipment, rebalancing inventory "
            "for low-stock SKUs, and moving critical categories to lower-risk suppliers."
        )

    def _carbon_response(self) -> str:
        carbon = self.data_service.get_carbon_dashboard()
        top_mode = max(carbon["by_mode"], key=lambda entry: entry["value"])
        return (
            f"Current modeled carbon footprint is {carbon['kpis']['total_co2']:.1f} tonnes CO2e, equal to about "
            f"{carbon['kpis']['car_equivalents']:.1f} car-equivalents. The highest-emission transport mode is "
            f"{top_mode['mode']} at {top_mode['value']:.1f} tonnes. "
            f"To offset the footprint, you would need roughly {carbon['kpis']['trees_to_offset']:,} trees. "
            "The best near-term action is shifting air shipments to sea where service constraints allow."
        )

    def _email_draft_response(self, message: str) -> str:
        supplier = self._pick_supplier_from_message_or_highest_risk(message)
        return (
            f"Subject: Immediate Supply Continuity Review for {supplier.name}\n\n"
            f"Hello {supplier.name} team,\n\n"
            "We are reviewing current supply continuity signals and would like to confirm your near-term production "
            "capacity, shipment schedule, and any operational constraints that could affect service levels over the "
            "next two weeks. Please share any risks, mitigation steps, and revised delivery expectations as soon as possible.\n\n"
            "Thank you,\nChainPulse Operations"
        )

    def _supplier_failure_response(self, message: str) -> str:
        supplier = self._pick_supplier_from_message_or_highest_risk(message)
        shipments = self.data_service.get_shipments(supplier_id=supplier.supplier_id)
        alternates = [
            candidate for candidate in self.data_service.get_suppliers(category=supplier.category)
            if candidate.supplier_id != supplier.supplier_id and candidate.active
        ]
        alternates = sorted(alternates, key=lambda item: (item.risk_score, -item.esg_score))
        alternate_text = ", ".join(
            f"{candidate.name} ({candidate.country}, risk {candidate.risk_score:.1f})"
            for candidate in alternates[:3]
        ) or "no active alternates were found in the current dataset"
        return (
            f"If {supplier.name} fails, {len(shipments)} shipment(s) are directly exposed with combined value "
            f"${sum(shipment.value_usd for shipment in shipments):,.0f}. "
            f"Best alternate options in {supplier.category} are {alternate_text}. "
            "I would pre-book backup capacity, prioritize open purchase orders, and increase monitoring on all linked lanes."
        )

    def _overview_response(self) -> str:
        kpis = self.data_service.get_kpis()
        top_supplier = max(self.data_service.get_suppliers(), key=lambda supplier: supplier.risk_score)
        return (
            f"ChainPulse overview: {kpis['total_suppliers']} suppliers, {kpis['active_disruptions']} active disruptions, "
            f"{kpis['delayed_shipments']} delayed shipments, and average supplier risk of {kpis['average_supplier_risk']:.1f}. "
            f"The riskiest supplier is {top_supplier.name} at {top_supplier.risk_score:.1f}. "
            "If you want, ask about delayed shipments, financial impact, carbon footprint, or a supplier failure simulation."
        )

    def _generic_response(self) -> str:
        alerts = self.data_service.get_anomalies()[:3]
        alert_text = "; ".join(alert["title"] for alert in alerts) if alerts else "no major anomalies detected"
        return (
            "Copilot is running in local fallback mode, so I can answer using the current ChainPulse dataset even "
            f"without an external LLM key. Right now I see {alert_text}. "
            "Try asking which supplier is highest risk, what shipments are delayed, the financial impact, carbon footprint, "
            "or to simulate a supplier failure."
        )

    def _pick_supplier_from_message_or_highest_risk(self, message: str) -> object:
        normalized = message.lower()
        suppliers = self.data_service.get_suppliers()
        for supplier in suppliers:
            if supplier.name.lower() in normalized or supplier.supplier_id.lower() in normalized:
                return supplier
        return max(suppliers, key=lambda supplier: supplier.risk_score)
