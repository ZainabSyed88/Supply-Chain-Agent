from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import ChatRequest
from app.models.db_models import ChatHistoryRecord, User
from app.services.auth_service import require_viewer
from app.services.fallback_copilot import FallbackCopilotService

router = APIRouter()


def _to_dict(item):
    if hasattr(item, "model_dump"):
        return item.model_dump()
    if isinstance(item, dict):
        return item
    return dict(item)


def _latest_pipeline_context(request: Request) -> tuple[dict, bool]:
    orchestrator = getattr(request.app.state, "orchestrator", None)
    if orchestrator is None:
        return {}, False

    pipeline_runs = getattr(orchestrator, "pipeline_runs", None)
    if not pipeline_runs:
        return {}, False

    completed_runs = [
        run for run in pipeline_runs.values()
        if getattr(run, "status", "") == "completed"
    ]
    if not completed_runs:
        return {}, False

    latest_run = max(completed_runs, key=lambda run: getattr(run, "started_at", datetime.min))
    results = {}
    for agent_name, agent_result in getattr(latest_run, "results", {}).items():
        if getattr(agent_result, "result", None) is not None:
            results[agent_name] = agent_result.result
    return results, True


def _build_context_block(
    *,
    suppliers: list[dict],
    shipments: list[dict],
    disruptions: list[dict],
    kpis: dict,
    carbon: dict,
    anomalies: list[dict],
    latest_results: dict,
    has_pipeline_results: bool,
    current_user: User,
) -> tuple[str, list[dict], list[dict], list[dict], float, float]:
    at_risk_suppliers = sorted(
        [supplier for supplier in suppliers if supplier.get("risk_score", 0) > 60],
        key=lambda supplier: supplier.get("risk_score", 0),
        reverse=True,
    )[:5]
    delayed_shipments = [
        shipment for shipment in shipments
        if shipment.get("status") in {"delayed", "at_risk"}
    ]
    critical_disruptions = sorted(
        disruptions,
        key=lambda disruption: disruption.get("estimated_revenue_impact_usd", 0),
        reverse=True,
    )[:5]

    revenue_at_risk = sum(shipment.get("value_usd", 0) for shipment in delayed_shipments)
    avg_on_time = (
        sum(supplier.get("on_time_delivery_rate", 0) for supplier in suppliers) / max(len(suppliers), 1)
    )

    supplier_summary = "\n".join(
        [
            f"  - {supplier.get('name')} ({supplier.get('country')}): "
            f"Risk={supplier.get('risk_score', 0):.0f}/100, "
            f"OnTime={supplier.get('on_time_delivery_rate', 0) * 100:.0f}%, "
            f"Category={supplier.get('category')}"
            for supplier in at_risk_suppliers
        ]
    )

    shipment_summary = "\n".join(
        [
            f"  - {shipment.get('shipment_id')}: "
            f"{shipment.get('origin', '?')} -> {shipment.get('destination', '?')}, "
            f"Status={shipment.get('status')}, "
            f"Delay={shipment.get('delay_days', 0)} days, "
            f"Value=${shipment.get('value_usd', 0):,.0f}, "
            f"ETA={shipment.get('eta', '?')}"
            for shipment in delayed_shipments[:8]
        ]
    )

    disruption_summary = "\n".join(
        [
            f"  - {disruption.get('disruption_id')}: "
            f"{disruption.get('type')} disruption, "
            f"Severity={disruption.get('severity')}, "
            f"Impact=${disruption.get('estimated_revenue_impact_usd', 0):,.0f}, "
            f"Affects {len(disruption.get('affected_supplier_ids', []))} suppliers and "
            f"{len(disruption.get('affected_shipment_ids', []))} shipments"
            for disruption in critical_disruptions
        ]
    )

    financial = latest_results.get("financial_impact", {}) if isinstance(latest_results, dict) else {}
    anomaly_results = latest_results.get("anomaly_detection", {}) if isinstance(latest_results, dict) else {}
    esg_results = latest_results.get("esg_carbon", {}) if isinstance(latest_results, dict) else {}

    system_prompt = f"""You are ChainPulse AI Copilot, an intelligent supply chain advisor with access to LIVE data from the ChainPulse platform.

You MUST answer using the specific data provided below.
NEVER say you don't have access to data; you have it right here.
Be specific, cite actual supplier names, shipment IDs, and numbers.
Keep responses concise (3-5 sentences) unless detail is requested.
Always end with one specific actionable recommendation.

========================================
LIVE SUPPLY CHAIN DATA - {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}
========================================

KEY METRICS:
  Total Suppliers: {kpis.get('total_suppliers', len(suppliers))}
  At-Risk Suppliers: {len([supplier for supplier in suppliers if supplier.get('risk_score', 0) > 60])}
  Active Disruptions: {kpis.get('active_disruptions', len(disruptions))}
  Shipments Delayed: {kpis.get('delayed_shipments', len([shipment for shipment in shipments if shipment.get('status') == 'delayed']))}
  Revenue at Risk: ${revenue_at_risk:,.0f}
  Avg Risk Score: {kpis.get('average_supplier_risk', 0):.1f}/100
  On-Time Delivery Rate: {avg_on_time * 100:.1f}%

TOP AT-RISK SUPPLIERS:
{supplier_summary if supplier_summary else "  No high-risk suppliers currently"}

DELAYED/AT-RISK SHIPMENTS:
{shipment_summary if shipment_summary else "  No delayed shipments currently"}

ACTIVE DISRUPTIONS:
{disruption_summary if disruption_summary else "  No active disruptions"}

FINANCIAL INTELLIGENCE:
  Total Revenue at Risk: ${financial.get('total_revenue_at_risk_usd', revenue_at_risk):,.0f}
  Financial Health Score: {financial.get('financial_health_score', 'N/A')}
  Best Mitigation ROI: {financial.get('recommended_action', 'Run pipeline for deeper analysis')}
  Anomalies Detected: {anomaly_results.get('total_anomalies', len(anomalies))}

ESG & SUSTAINABILITY:
  Total CO2: {carbon.get('kpis', {}).get('total_co2', 'N/A')} tonnes
  Avg ESG Score: {carbon.get('kpis', {}).get('average_esg_score', 'N/A')}/100
  Latest ESG Pipeline Score: {esg_results.get('sustainability_metrics', {}).get('avg_esg_score', 'N/A')}

USER CONTEXT:
  User: {current_user.full_name} ({current_user.role})
  Last Pipeline Run: {"Completed recently" if has_pipeline_results else "Not run yet; recommend running pipeline when deeper analysis is needed"}

RESPONSE RULES:
- Use actual names, IDs, and numbers from the data above
- For riskiest suppliers, list from TOP AT-RISK SUPPLIERS
- For delayed shipments, list from DELAYED/AT-RISK SHIPMENTS
- For disruptions, list from ACTIVE DISRUPTIONS
- For financial impact, use FINANCIAL INTELLIGENCE
- If asked to draft an email, write a professional supplier email
- If asked to simulate, describe impact based on current data
- Never make up data not shown above
"""

    return system_prompt, at_risk_suppliers, delayed_shipments, critical_disruptions, revenue_at_risk, avg_on_time


def generate_follow_ups(
    query: str,
    at_risk_suppliers: list[dict],
    delayed_shipments: list[dict],
    disruptions: list[dict],
) -> list[str]:
    suggestions: list[str] = []

    if at_risk_suppliers:
        top_supplier = at_risk_suppliers[0].get("name", "top supplier")
        suggestions.append(f"Draft an email to {top_supplier} about their risk score")

    if delayed_shipments:
        suggestions.append(f"Which of the {len(delayed_shipments)} delayed shipments has the highest value at risk?")

    if disruptions:
        top_disruption = disruptions[0]
        suggestions.append(f"What's the mitigation plan for the {top_disruption.get('type')} disruption?")

    suggestions.extend(
        [
            "Show me alternate suppliers for the highest risk category",
            "What would happen if our top supplier failed?",
            "Which shipments will be delayed in the next 7 days?",
            "What is our total carbon footprint this month?",
            "Give me an executive summary of current supply chain health",
        ]
    )

    normalized_query = query.lower()
    filtered = [suggestion for suggestion in suggestions if suggestion.lower() != normalized_query]
    deduped = list(dict.fromkeys(filtered))
    return deduped[:3]


@router.post("")
async def send_chat(
    request: Request,
    payload: ChatRequest,
    current_user: User = Depends(require_viewer),
    db: Session = Depends(get_db),
):
    data_service = request.app.state.data_service

    suppliers = [_to_dict(supplier) for supplier in data_service.get_suppliers()]
    shipments = [_to_dict(shipment) for shipment in data_service.get_shipments()]
    disruptions = [_to_dict(disruption) for disruption in data_service.get_disruptions(active_only=True)]
    kpis = data_service.get_kpis()
    carbon = data_service.get_carbon_dashboard()
    anomalies = data_service.get_anomalies()

    latest_results, has_pipeline_results = _latest_pipeline_context(request)
    system_prompt, at_risk_suppliers, delayed_shipments, critical_disruptions, _, _ = _build_context_block(
        suppliers=suppliers,
        shipments=shipments,
        disruptions=disruptions,
        kpis=kpis,
        carbon=carbon,
        anomalies=anomalies,
        latest_results=latest_results,
        has_pipeline_results=has_pipeline_results,
        current_user=current_user,
    )

    history_messages = []
    for message in payload.history[-6:]:
        if hasattr(message, "model_dump"):
            item = message.model_dump()
        elif isinstance(message, dict):
            item = message
        else:
            continue
        if item.get("role") and item.get("content"):
            history_messages.append({"role": item["role"], "content": item["content"]})

    llm_messages = [*history_messages, {"role": "user", "content": payload.message}]
    session_id = payload.session_id
    if not session_id:
        for item in payload.history:
            if hasattr(item, "session_id") and getattr(item, "session_id"):
                session_id = getattr(item, "session_id")
                break
            if isinstance(item, dict) and item.get("session_id"):
                session_id = item["session_id"]
                break
    session_id = session_id or str(uuid4())

    db.add(ChatHistoryRecord(user_id=current_user.id, session_id=session_id, role="user", content=payload.message))
    db.commit()

    llm_service = getattr(request.app.state, "llm_service", None)
    ai_response = ""
    confidence = 0.0
    model_used = "fallback_copilot"

    if llm_service is not None:
        try:
            result = await llm_service.send_chat(
                system_prompt=system_prompt if payload.include_context else "You are ChainPulse AI Copilot.",
                messages=llm_messages,
                temperature=0.3,
                max_tokens=800,
            )
            ai_response = result["content"]
            model_used = result.get("model_used", "openai")
            confidence = 0.92
        except Exception:
            ai_response = ""

    if not ai_response:
        fallback_service = FallbackCopilotService(data_service)
        ai_response = fallback_service.respond(payload.message)
        model_used = "fallback_copilot"
        confidence = 0.68

    db.add(
        ChatHistoryRecord(
            user_id=current_user.id,
            session_id=session_id,
            role="assistant",
            content=ai_response,
            confidence=confidence,
        )
    )
    db.commit()

    follow_ups = generate_follow_ups(payload.message, at_risk_suppliers, delayed_shipments, critical_disruptions)

    return {
        "response": ai_response,
        "confidence": confidence,
        "model_used": model_used,
        "session_id": session_id,
        "context_used": {
            "suppliers_analyzed": len(suppliers),
            "disruptions_checked": len(disruptions),
            "shipments_reviewed": len(shipments),
            "pipeline_data": has_pipeline_results,
        },
        "follow_up_questions": follow_ups,
    }
