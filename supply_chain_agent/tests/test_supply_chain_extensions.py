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
from app.services.agents import AgentContext, DecisionSynthesisAgent
from datetime import datetime


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


def test_decision_synthesis_includes_cross_functional_plan():
    service = DataService()
    agent = DecisionSynthesisAgent("decision_synthesis", service)
    context = AgentContext(run_id="test-run", timestamp=datetime.utcnow())

    updated = __import__("asyncio").run(agent.run(context))
    decision = updated.recommendations[-1]

    assert "cross_functional_plan" in decision
    assert {"procurement", "warehouse", "customer_orders", "transport"} <= set(decision["cross_functional_plan"].keys())
