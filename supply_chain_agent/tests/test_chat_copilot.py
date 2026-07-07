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
from app.models.db_models import User, UserRole
from app.routers.chat import _build_context_block, _build_live_context_snapshot
from app.services.fallback_copilot import FallbackCopilotService


def build_context_snapshot():
    service = DataService()
    user = User(
        username="viewer",
        email="viewer@example.com",
        full_name="Viewer User",
        hashed_password="hashed",
        role=UserRole.viewer,
    )
    snapshot, at_risk_suppliers, delayed_shipments, critical_disruptions = _build_live_context_snapshot(
        suppliers=[supplier.model_dump() for supplier in service.get_suppliers()],
        shipments=[shipment.model_dump() for shipment in service.get_shipments()],
        disruptions=[disruption.model_dump() for disruption in service.get_disruptions(active_only=True)],
        kpis=service.get_kpis(),
        carbon=service.get_carbon_dashboard(),
        anomalies=service.get_anomalies(),
        latest_results={},
        has_pipeline_results=False,
        current_user=user,
    )
    return service, snapshot, at_risk_suppliers, delayed_shipments, critical_disruptions


def test_live_context_snapshot_includes_supplier_and_disruption_entities():
    _, snapshot, at_risk_suppliers, delayed_shipments, critical_disruptions = build_context_snapshot()

    assert at_risk_suppliers
    assert delayed_shipments
    assert critical_disruptions
    assert snapshot["summary"]["risk_alert_threshold"] >= 15
    assert snapshot["top_at_risk_suppliers"][0]["name"]
    assert snapshot["active_disruptions_detail"][0]["affected_suppliers"]
    assert snapshot["highlights"]["top_supplier_names"]


def test_context_prompt_embeds_real_live_context_names():
    _, snapshot, _, _, _ = build_context_snapshot()

    prompt = _build_context_block(context_snapshot=snapshot)

    top_supplier = snapshot["top_at_risk_suppliers"][0]["name"]
    top_disruption = snapshot["active_disruptions_detail"][0]["disruption_id"]
    assert "LIVE_CONTEXT_JSON" in prompt
    assert top_supplier in prompt
    assert top_disruption in prompt


def test_fallback_generic_response_uses_context_snapshot_details():
    service, snapshot, _, _, _ = build_context_snapshot()

    response = FallbackCopilotService(service).respond("What should I ask next?", context_snapshot=snapshot)

    assert snapshot["top_at_risk_suppliers"][0]["name"] in response
    assert "at-risk suppliers" in response
    assert "revenue at risk" in response


def test_fallback_streaming_chunks_reconstruct_full_response():
    service, snapshot, _, _, _ = build_context_snapshot()
    fallback = FallbackCopilotService(service)

    full_response = fallback.respond("What should I ask next?", context_snapshot=snapshot)
    streamed = "".join(fallback.stream_response("What should I ask next?", context_snapshot=snapshot))

    assert streamed == full_response
