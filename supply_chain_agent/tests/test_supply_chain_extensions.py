from pathlib import Path
import os
import sys


ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
os.chdir(BACKEND_DIR)

for path in (ROOT_DIR, BACKEND_DIR):
    path_str = str(path)
    if path_str not in sys.path:
        sys.path.insert(0, path_str)


from app.data.service import DataService
from app.main import app as main_app, build_pipeline_proactive_alerts
from app.models.agent import PipelineRun
from app.models.disruption import Disruption
from app.models.shipment import Shipment
from app.models.supplier import Supplier
from app.services.agents import AgentContext, DecisionSynthesisAgent
from datetime import datetime
from types import SimpleNamespace


def test_data_service_exposes_orders_and_warehouses():
    service = DataService()

    orders = service.get_orders()
    warehouses = service.get_warehouses()

    assert orders
    assert warehouses
    assert all(order.warehouse_id for order in orders)
    assert all(warehouse.region for warehouse in warehouses)


def test_order_and_warehouse_summaries_have_expected_fields():
    service = DataService()

    order_summary = service.get_order_summary()
    warehouse_summary = service.get_warehouse_summary()

    assert {"total_orders", "backlog_orders", "delayed_orders", "critical_orders", "average_fill_rate"} <= set(order_summary.keys())
    assert {"total_warehouses", "critical_warehouses", "average_picking_efficiency", "staffing_gap"} <= set(warehouse_summary.keys())


def test_supplier_risk_kpis_expose_dynamic_thresholds_and_counts():
    service = DataService()

    thresholds = service.get_supplier_risk_thresholds()
    kpis = service.get_kpis()

    assert {"at_risk", "critical"} <= set(thresholds.keys())
    assert thresholds["at_risk"] >= 15
    assert thresholds["critical"] >= thresholds["at_risk"]
    assert {"risk_alert_threshold", "risk_critical_threshold", "at_risk_suppliers", "critical_suppliers"} <= set(kpis.keys())
    assert kpis["at_risk_suppliers"] > 0


def test_decision_synthesis_includes_cross_functional_plan():
    service = DataService()
    agent = DecisionSynthesisAgent("decision_synthesis", service)
    context = AgentContext(run_id="test-run", timestamp=datetime.utcnow())

    updated = __import__("asyncio").run(agent.run(context))
    decision = updated.recommendations[-1]

    assert "cross_functional_plan" in decision
    assert {"procurement", "warehouse", "customer_orders", "transport"} <= set(decision["cross_functional_plan"].keys())


def test_pipeline_proactive_alerts_skip_weak_supplier_risk_signals(monkeypatch):
    supplier = Supplier(
        supplier_id="SUP-001",
        name="Gray-Mayo",
        country="Japan",
        category="Raw Materials",
        on_time_delivery_rate=0.91,
        defect_rate=0.03,
        avg_lead_time_days=14,
        risk_score=24.0,
        esg_score=70.0,
        active=True,
    )

    fake_service = SimpleNamespace(
        get_suppliers=lambda: [supplier],
        get_disruptions=lambda active_only=True: [],
        get_shipments=lambda: [],
        get_inventory_alerts=lambda: [],
        get_supplier_risk_thresholds=lambda: {"at_risk": 15.0, "critical": 23.5},
    )
    monkeypatch.setattr(main_app.state, "data_service", fake_service, raising=False)

    alerts = build_pipeline_proactive_alerts(
        PipelineRun(run_id="run-weak-signal", started_at=datetime.utcnow(), status="completed")
    )

    assert not [alert for alert in alerts if alert.get("category") == "supplier_risk"]


def test_pipeline_proactive_alerts_require_real_supplier_exposure(monkeypatch):
    supplier = Supplier(
        supplier_id="SUP-002",
        name="Walter, Edwards and Rios",
        country="Mexico",
        category="Electronics",
        on_time_delivery_rate=0.87,
        defect_rate=0.04,
        avg_lead_time_days=19,
        risk_score=24.0,
        esg_score=68.0,
        active=True,
    )
    shipment = Shipment(
        shipment_id="SHIP-001",
        supplier_id="SUP-002",
        origin="Monterrey",
        destination="Dallas",
        status="at_risk",
        value_usd=325000.0,
        eta=datetime.utcnow(),
        actual_delivery=None,
        carrier="Blue Freight",
        tracking_number="TRK-001",
        delay_days=6,
    )
    disruption = Disruption(
        disruption_id="DIS-001",
        type="customs",
        severity="critical",
        affected_supplier_ids=["SUP-002"],
        affected_shipment_ids=["SHIP-001"],
        description="Customs queue is growing.",
        detected_at=datetime.utcnow(),
        estimated_resolution=datetime.utcnow(),
        estimated_revenue_impact_usd=1118133.0,
    )

    fake_service = SimpleNamespace(
        get_suppliers=lambda: [supplier],
        get_disruptions=lambda active_only=True: [disruption],
        get_shipments=lambda: [shipment],
        get_inventory_alerts=lambda: [],
        get_supplier_risk_thresholds=lambda: {"at_risk": 15.0, "critical": 23.5},
    )
    monkeypatch.setattr(main_app.state, "data_service", fake_service, raising=False)

    alerts = build_pipeline_proactive_alerts(
        PipelineRun(run_id="run-real-signal", started_at=datetime.utcnow(), status="completed")
    )
    supplier_alert = next(alert for alert in alerts if alert.get("category") == "supplier_risk")

    assert "1 active disruption(s)" in supplier_alert["message"]
    assert "1 exposed shipment(s)" in supplier_alert["message"]
