from __future__ import annotations

import asyncio
import json
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.logging import get_logger
from app.models.agent import ChatRequest
from app.models.db_models import ChatHistoryRecord, User
from app.services.auth_service import require_viewer
from app.services.fallback_copilot import FallbackCopilotService

router = APIRouter()
logger = get_logger("chat")


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


def _supplier_risk_threshold(suppliers: list[dict]) -> float:
    scores = [float(supplier.get("risk_score", 0)) for supplier in suppliers]
    if not scores:
        return 0.0
    average_score = sum(scores) / len(scores)
    return round(max(15.0, average_score), 1)


def _build_live_context_snapshot(
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
) -> tuple[dict, list[dict], list[dict], list[dict]]:
    risk_threshold = _supplier_risk_threshold(suppliers)
    supplier_name_by_id = {
        supplier.get("supplier_id"): supplier.get("name", supplier.get("supplier_id", "Unknown supplier"))
        for supplier in suppliers
    }
    supplier_disruption_counts: dict[str, int] = {}
    supplier_shipment_counts: dict[str, int] = {}
    for disruption in disruptions:
        for supplier_id in disruption.get("affected_supplier_ids", []):
            supplier_disruption_counts[supplier_id] = supplier_disruption_counts.get(supplier_id, 0) + 1
    for shipment in shipments:
        supplier_id = shipment.get("supplier_id")
        if supplier_id:
            supplier_shipment_counts[supplier_id] = supplier_shipment_counts.get(supplier_id, 0) + 1

    at_risk_suppliers = sorted(
        [supplier for supplier in suppliers if supplier.get("risk_score", 0) >= risk_threshold],
        key=lambda supplier: supplier.get("risk_score", 0),
        reverse=True,
    )[:6]
    delayed_shipments = sorted(
        [
            shipment for shipment in shipments
            if shipment.get("status") in {"delayed", "at_risk"}
        ],
        key=lambda shipment: (
            shipment.get("status") != "delayed",
            -shipment.get("delay_days", 0),
            -shipment.get("value_usd", 0),
        ),
    )
    critical_disruptions = sorted(
        disruptions,
        key=lambda disruption: (
            disruption.get("severity") != "critical",
            -disruption.get("estimated_revenue_impact_usd", 0),
        ),
    )[:5]

    revenue_at_risk = round(sum(shipment.get("value_usd", 0) for shipment in delayed_shipments), 2)
    avg_on_time = round(
        sum(supplier.get("on_time_delivery_rate", 0) for supplier in suppliers) / max(len(suppliers), 1),
        4,
    )

    financial = latest_results.get("financial_impact", {}) if isinstance(latest_results, dict) else {}
    anomaly_results = latest_results.get("anomaly_detection", {}) if isinstance(latest_results, dict) else {}
    esg_results = latest_results.get("esg_carbon", {}) if isinstance(latest_results, dict) else {}

    supplier_rows = [
        {
            "supplier_id": supplier.get("supplier_id"),
            "name": supplier.get("name"),
            "country": supplier.get("country"),
            "category": supplier.get("category"),
            "risk_score": round(float(supplier.get("risk_score", 0)), 1),
            "on_time_delivery_rate_pct": round(float(supplier.get("on_time_delivery_rate", 0)) * 100, 1),
            "esg_score": round(float(supplier.get("esg_score", 0)), 1),
            "active_disruptions": supplier_disruption_counts.get(supplier.get("supplier_id"), 0),
            "linked_shipments": supplier_shipment_counts.get(supplier.get("supplier_id"), 0),
        }
        for supplier in at_risk_suppliers
    ]
    shipment_rows = [
        {
            "shipment_id": shipment.get("shipment_id"),
            "supplier_id": shipment.get("supplier_id"),
            "supplier_name": supplier_name_by_id.get(shipment.get("supplier_id"), shipment.get("supplier_id")),
            "origin": shipment.get("origin"),
            "destination": shipment.get("destination"),
            "status": shipment.get("status"),
            "delay_days": shipment.get("delay_days", 0),
            "value_usd": round(float(shipment.get("value_usd", 0)), 2),
            "eta": shipment.get("eta"),
        }
        for shipment in delayed_shipments[:8]
    ]
    disruption_rows = [
        {
            "disruption_id": disruption.get("disruption_id"),
            "type": disruption.get("type"),
            "severity": disruption.get("severity"),
            "description": disruption.get("description"),
            "estimated_revenue_impact_usd": round(float(disruption.get("estimated_revenue_impact_usd", 0)), 2),
            "affected_suppliers": [
                supplier_name_by_id.get(supplier_id, supplier_id)
                for supplier_id in disruption.get("affected_supplier_ids", [])
            ],
            "affected_supplier_ids": disruption.get("affected_supplier_ids", []),
            "affected_shipment_ids": disruption.get("affected_shipment_ids", []),
        }
        for disruption in critical_disruptions
    ]
    anomaly_rows = [
        {
            "id": anomaly.get("id"),
            "severity": anomaly.get("severity"),
            "title": anomaly.get("title"),
        }
        for anomaly in anomalies[:5]
    ]
    context_snapshot = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "user": {
            "full_name": current_user.full_name,
            "role": current_user.role,
        },
        "summary": {
            "total_suppliers": kpis.get("total_suppliers", len(suppliers)),
            "risk_alert_threshold": risk_threshold,
            "at_risk_suppliers": len([supplier for supplier in suppliers if supplier.get("risk_score", 0) >= risk_threshold]),
            "active_disruptions": kpis.get("active_disruptions", len(disruptions)),
            "delayed_shipments": len([shipment for shipment in shipments if shipment.get("status") == "delayed"]),
            "shipments_at_risk": len(delayed_shipments),
            "revenue_at_risk_usd": revenue_at_risk,
            "average_supplier_risk": round(float(kpis.get("average_supplier_risk", 0)), 1),
            "on_time_delivery_rate_pct": round(avg_on_time * 100, 1),
            "pipeline_context_available": has_pipeline_results,
        },
        "top_at_risk_suppliers": supplier_rows,
        "delayed_or_at_risk_shipments": shipment_rows,
        "active_disruptions_detail": disruption_rows,
        "pipeline_insights": {
            "financial_health_score": financial.get("financial_health_score"),
            "total_revenue_at_risk_usd": financial.get("total_revenue_at_risk_usd", revenue_at_risk),
            "recommended_action": financial.get("recommended_action", "Run pipeline for deeper analysis"),
            "detected_anomalies": anomaly_results.get("total_anomalies", len(anomalies)),
            "latest_esg_score": esg_results.get("sustainability_metrics", {}).get("avg_esg_score"),
        },
        "carbon_kpis": carbon.get("kpis", {}),
        "recent_anomalies": anomaly_rows,
        "highlights": {
            "top_supplier_names": [supplier["name"] for supplier in supplier_rows[:3] if supplier.get("name")],
            "top_disruption_labels": [
                f"{disruption['type']} ({disruption['severity']})"
                for disruption in disruption_rows[:2]
                if disruption.get("type") and disruption.get("severity")
            ],
            "highest_revenue_disruption_id": disruption_rows[0]["disruption_id"] if disruption_rows else None,
            "highest_value_delayed_shipment_id": shipment_rows[0]["shipment_id"] if shipment_rows else None,
        },
    }
    return context_snapshot, at_risk_suppliers, delayed_shipments, critical_disruptions


def _build_context_block(*, context_snapshot: dict) -> str:
    live_context_json = json.dumps(context_snapshot, indent=2, default=str)
    return f"""You are ChainPulse AI Copilot, an intelligent supply chain advisor with access to LIVE operational context from the ChainPulse platform.

Use the live context JSON below as the source of truth.
Do not give generic advice when the context includes concrete names, scores, shipment IDs, disruption IDs, dates, or dollar values.
Answer with actual supplier names, risk scores, shipment IDs, disruption types, and financial impact whenever relevant.
If the user asks for an email, write a concise professional draft grounded in the cited supplier or disruption.
If the user asks for a simulation, base it on the exposed suppliers, shipments, and disruptions.
If the answer is not in the context, say what is missing and give the best next action.
Keep default answers concise at 3-6 sentences and end with one specific recommendation.

LIVE_CONTEXT_JSON:
{live_context_json}
"""


def _build_context_used_payload(
    *,
    suppliers: list[dict],
    shipments: list[dict],
    disruptions: list[dict],
    has_pipeline_results: bool,
    context_snapshot: dict,
    include_context: bool,
) -> dict:
    return {
        "enabled": include_context,
        "suppliers_analyzed": len(suppliers),
        "disruptions_checked": len(disruptions),
        "shipments_reviewed": len(shipments),
        "pipeline_data": has_pipeline_results,
        "summary": context_snapshot.get("summary", {}),
        "highlights": context_snapshot.get("highlights", {}),
        "generated_at": context_snapshot.get("generated_at"),
    }


def _build_preview_payload(context_snapshot: dict) -> dict:
    return {
        "generated_at": context_snapshot.get("generated_at"),
        "summary": context_snapshot.get("summary", {}),
        "top_suppliers": context_snapshot.get("top_at_risk_suppliers", [])[:3],
        "top_disruptions": context_snapshot.get("active_disruptions_detail", [])[:2],
        "highlights": context_snapshot.get("highlights", {}),
    }


def _build_chat_response_payload(
    *,
    response: str,
    confidence: float,
    model_used: str,
    session_id: str,
    suppliers: list[dict],
    shipments: list[dict],
    disruptions: list[dict],
    has_pipeline_results: bool,
    context_snapshot: dict,
    include_context: bool,
    follow_ups: list[str],
) -> dict:
    return {
        "response": response,
        "confidence": confidence,
        "model_used": model_used,
        "session_id": session_id,
        "context_used": _build_context_used_payload(
            suppliers=suppliers,
            shipments=shipments,
            disruptions=disruptions,
            has_pipeline_results=has_pipeline_results,
            context_snapshot=context_snapshot,
            include_context=include_context,
        ),
        "context_preview": _build_preview_payload(context_snapshot),
        "follow_up_questions": follow_ups,
    }


def _stream_event(payload: dict) -> str:
    return f"data: {json.dumps(payload, default=str)}\n\n"


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
    context_snapshot, at_risk_suppliers, delayed_shipments, critical_disruptions = _build_live_context_snapshot(
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
    system_prompt = _build_context_block(context_snapshot=context_snapshot)

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

    follow_ups = generate_follow_ups(payload.message, at_risk_suppliers, delayed_shipments, critical_disruptions)
    llm_service = getattr(request.app.state, "llm_service", None)
    fallback_service = FallbackCopilotService(data_service)

    if payload.stream:
        async def event_generator():
            ai_response = ""
            confidence = 0.68
            model_used = "fallback_copilot"

            try:
                if llm_service is not None:
                    model_used = getattr(llm_service, "openai_model", "openai")
                    confidence = 0.92
                    yield _stream_event(
                        {
                            "type": "start",
                            "session_id": session_id,
                            "model_used": model_used,
                            "confidence": confidence,
                            "context_used": _build_context_used_payload(
                                suppliers=suppliers,
                                shipments=shipments,
                                disruptions=disruptions,
                                has_pipeline_results=has_pipeline_results,
                                context_snapshot=context_snapshot,
                                include_context=payload.include_context,
                            ),
                            "context_preview": _build_preview_payload(context_snapshot),
                        }
                    )
                    try:
                        async for delta in llm_service.stream_chat(
                            system_prompt=system_prompt if payload.include_context else "You are ChainPulse AI Copilot.",
                            messages=llm_messages,
                            temperature=0.3,
                            max_tokens=800,
                        ):
                            ai_response += delta
                            yield _stream_event({"type": "delta", "delta": delta})
                    except Exception as exc:
                        logger.warning(
                            "LLM streaming failed; attempting graceful fallback",
                            user_id=current_user.id,
                            session_id=session_id,
                            error=str(exc),
                        )
                        if ai_response:
                            interruption_note = "\n\nI hit a streaming issue before finishing. Please retry for the full answer."
                            ai_response += interruption_note
                            confidence = 0.35
                            model_used = "openai_interrupted"
                            yield _stream_event({"type": "delta", "delta": interruption_note})
                        else:
                            model_used = "fallback_copilot"
                            confidence = 0.68
                            for chunk in fallback_service.stream_response(
                                payload.message,
                                include_context=payload.include_context,
                                context_snapshot=context_snapshot if payload.include_context else None,
                            ):
                                ai_response += chunk
                                yield _stream_event({"type": "delta", "delta": chunk})
                                await asyncio.sleep(0.02)
                else:
                    yield _stream_event(
                        {
                            "type": "start",
                            "session_id": session_id,
                            "model_used": model_used,
                            "confidence": confidence,
                            "context_used": _build_context_used_payload(
                                suppliers=suppliers,
                                shipments=shipments,
                                disruptions=disruptions,
                                has_pipeline_results=has_pipeline_results,
                                context_snapshot=context_snapshot,
                                include_context=payload.include_context,
                            ),
                            "context_preview": _build_preview_payload(context_snapshot),
                        }
                    )
                    for chunk in fallback_service.stream_response(
                        payload.message,
                        include_context=payload.include_context,
                        context_snapshot=context_snapshot if payload.include_context else None,
                    ):
                        ai_response += chunk
                        yield _stream_event({"type": "delta", "delta": chunk})
                        await asyncio.sleep(0.02)

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

                yield _stream_event(
                    {
                        "type": "done",
                        **_build_chat_response_payload(
                            response=ai_response,
                            confidence=confidence,
                            model_used=model_used,
                            session_id=session_id,
                            suppliers=suppliers,
                            shipments=shipments,
                            disruptions=disruptions,
                            has_pipeline_results=has_pipeline_results,
                            context_snapshot=context_snapshot,
                            include_context=payload.include_context,
                            follow_ups=follow_ups,
                        ),
                    }
                )
            except Exception as exc:
                db.rollback()
                logger.exception(
                    "Streaming chat failed",
                    user_id=current_user.id,
                    session_id=session_id,
                    error=str(exc),
                )
                yield _stream_event({"type": "error", "error": "Unable to stream a response right now. Please try again."})

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

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
        except Exception as exc:
            logger.warning(
                "LLM chat failed; falling back to local copilot response",
                user_id=current_user.id,
                session_id=session_id,
                error=str(exc),
            )
            ai_response = ""

    if not ai_response:
        ai_response = fallback_service.respond(
            payload.message,
            include_context=payload.include_context,
            context_snapshot=context_snapshot if payload.include_context else None,
        )
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

    return _build_chat_response_payload(
        response=ai_response,
        confidence=confidence,
        model_used=model_used,
        session_id=session_id,
        suppliers=suppliers,
        shipments=shipments,
        disruptions=disruptions,
        has_pipeline_results=has_pipeline_results,
        context_snapshot=context_snapshot,
        include_context=payload.include_context,
        follow_ups=follow_ups,
    )
