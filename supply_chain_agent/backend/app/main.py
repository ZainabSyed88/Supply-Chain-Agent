from __future__ import annotations
import asyncio
from io import BytesIO
import json
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any, Dict, Optional, Set
from uuid import uuid4

from app.models.agent import PipelineRun
from fastapi import BackgroundTasks, Depends, FastAPI, Request, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import SupplyChainException
from app.core.logging import configure_logging, get_logger
from app.database import SessionLocal, get_db, init_db
from app.data_loader import get_data_service
from app.models.db_models import AlertRecord, PipelineRunRecord, TicketRecord, User, UserRole
from app.services.auth_service import create_user, require_analyst, require_viewer
from app.services.llm_service import LLMService
from app.services.email_service import pipeline_complete_email_template, send_email
from app.services.orchestrator import PipelineOrchestrator
from app.routers import agents, auth, chat, disruptions, intelligence, inventory, orders, shipments, suppliers, tickets, warehouses

configure_logging()
logger = get_logger("app")


def validate_startup_configuration() -> None:
    missing: list[str] = []
    if not settings.secret_key:
        missing.append("SECRET_KEY")

    if missing:
        raise RuntimeError(
            "Missing required environment variables: "
            + ", ".join(missing)
            + ". Set them in Railway or backend/.env before starting the API."
        )


def validate_admin_bootstrap_configuration() -> None:
    missing = [
        env_name
        for env_name, value in (
            ("ADMIN_BOOTSTRAP_USERNAME", settings.admin_bootstrap_username),
            ("ADMIN_BOOTSTRAP_EMAIL", settings.admin_bootstrap_email),
            ("ADMIN_BOOTSTRAP_PASSWORD", settings.admin_bootstrap_password),
        )
        if not value
    ]
    if missing:
        raise RuntimeError(
            "Database is empty, but the initial admin bootstrap variables are missing: "
            + ", ".join(missing)
            + ". Set them in Railway or backend/.env before first startup."
        )


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, run_id: str):
        await websocket.accept()
        if run_id not in self.active_connections:
            self.active_connections[run_id] = set()
        self.active_connections[run_id].add(websocket)

    def disconnect(self, websocket: WebSocket, run_id: str):
        if run_id in self.active_connections:
            self.active_connections[run_id].discard(websocket)
            if not self.active_connections[run_id]:
                del self.active_connections[run_id]

    async def broadcast(self, run_id: str, event: dict):
        if run_id not in self.active_connections:
            return
        dead: Set[WebSocket] = set()
        message = json.dumps(event)
        for ws in set(self.active_connections[run_id]):
            try:
                await ws.send_text(message)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self.active_connections[run_id].discard(ws)


class AlertsManager:
    def __init__(self):
        self.connections: Set[WebSocket] = set()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.add(ws)

    def disconnect(self, ws: WebSocket):
        self.connections.discard(ws)

    async def broadcast_alert(self, alert: dict):
        dead: Set[WebSocket] = set()
        message = json.dumps(alert)
        for ws in set(self.connections):
            try:
                await ws.send_text(message)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self.connections.discard(ws)


manager = ConnectionManager()
alerts_manager = AlertsManager()


def build_cors_origins() -> list[str]:
    candidates = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        settings.frontend_url,
        *settings.cors_origins,
    ]
    origins: list[str] = []
    seen: set[str] = set()
    for origin in candidates:
        if not origin or origin == "*" or origin in seen:
            continue
        seen.add(origin)
        origins.append(origin)
    return origins


def serialize_pipeline_run(run: PipelineRun) -> dict[str, Any]:
    return {
        "run_id": run.run_id,
        "started_at": run.started_at.isoformat() + "Z",
        "completed_at": run.completed_at.isoformat() + "Z" if run.completed_at else None,
        "status": run.status,
        "results": {
            agent_name: result.model_dump()
            for agent_name, result in run.results.items()
        },
        "errors": run.errors,
    }


def serialize_pipeline_record(record: PipelineRunRecord) -> dict[str, Any]:
    return {
        "run_id": record.id,
        "started_at": record.started_at.isoformat() + "Z" if record.started_at else None,
        "completed_at": record.completed_at.isoformat() + "Z" if record.completed_at else None,
        "status": record.status,
        "results": record.results_json or {},
        "errors": [record.error] if record.error else [],
    }


def get_agent_metadata(agent_name: str) -> dict[str, Any]:
    return {
        "supplier_monitor": {
            "agent_num": 1,
            "description": "Monitoring supplier health",
            "progress": 20,
            "tier": 1,
        },
        "disruption_detector": {
            "agent_num": 2,
            "description": "Detecting disruptions",
            "progress": 40,
            "tier": 1,
        },
        "risk_assessor": {
            "agent_num": 3,
            "description": "Assessing risks",
            "progress": 60,
            "tier": 2,
        },
        "mitigation": {
            "agent_num": 4,
            "description": "Planning mitigation",
            "progress": 80,
            "tier": 2,
        },
        "stakeholder_notification": {
            "agent_num": 5,
            "description": "Notifying stakeholders",
            "progress": 100,
            "tier": 3,
        },
    }.get(agent_name, {})


def get_pipeline_timing(run: PipelineRun) -> dict[str, object]:
    actual_ms = None
    if run.completed_at and run.started_at:
        actual_ms = round((run.completed_at - run.started_at).total_seconds() * 1000, 2)

    sequential_ms = round(
        sum(result.duration_ms for result in run.results.values()),
        2,
    )

    return {
        "run_id": run.run_id,
        "status": run.status,
        "started_at": run.started_at.isoformat() + "Z",
        "completed_at": run.completed_at.isoformat() + "Z" if run.completed_at else None,
        "actual_duration_ms": actual_ms,
        "sequential_duration_ms": sequential_ms,
        "agent_times": {agent_name: result.duration_ms for agent_name, result in run.results.items()},
        "potential_parallel_gain_ms": None if actual_ms is None else round(sequential_ms - actual_ms, 2),
    }


def find_latest_completed_run() -> PipelineRun | None:
    completed_runs = [run for run in app.state.orchestrator.pipeline_runs.values() if run.status == "completed"]
    if not completed_runs:
        return None
    return max(completed_runs, key=lambda run: run.started_at)


def build_report_pdf_from_record(record: PipelineRunRecord) -> bytes:
    buffer = BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()

    summary_rows = [
        ["Run ID", record.id],
        ["Status", record.status.title()],
        ["Started", record.started_at.isoformat() + "Z" if record.started_at else "Unknown"],
        ["Completed", record.completed_at.isoformat() + "Z" if record.completed_at else "In progress"],
        ["Agents", f"{record.agents_succeeded + record.agents_failed} recorded"],
    ]
    summary_table = Table(summary_rows, colWidths=[120, 360])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eff6ff")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0f172a")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))

    agent_rows = [["Agent", "Duration (ms)", "Success"]]
    for agent_name, result in (record.results_json or {}).items():
        details = result if isinstance(result, dict) else {}
        agent_rows.append([
            agent_name,
            f"{details.get('duration_ms', 0):.2f}" if isinstance(details.get("duration_ms"), (int, float)) else "--",
            "Yes" if details.get("success") else "No",
        ])

    story = [
        Paragraph("ChainPulse Pipeline Report", styles["Title"]),
        Spacer(1, 12),
        Paragraph("Executive Summary", styles["Heading2"]),
        Paragraph(
            f"This report captures persisted pipeline run {record.id} with status {record.status}.",
            styles["BodyText"],
        ),
        Spacer(1, 16),
        summary_table,
        Spacer(1, 20),
        Paragraph("Agent Performance", styles["Heading2"]),
        Table(agent_rows, colWidths=[180, 140, 140]),
    ]
    document.build(story)
    return buffer.getvalue()


def update_pipeline_record(run: PipelineRun) -> None:
    db = SessionLocal()
    try:
        record = db.query(PipelineRunRecord).filter(PipelineRunRecord.id == run.run_id).first()
        if record is None:
            return
        record.status = run.status
        record.started_at = run.started_at
        record.completed_at = run.completed_at
        if run.completed_at and run.started_at:
            record.duration_seconds = (run.completed_at - run.started_at).total_seconds()
        record.agents_succeeded = sum(1 for result in run.results.values() if result.success)
        record.agents_failed = sum(1 for result in run.results.values() if not result.success)
        record.progress = 100 if run.status == "completed" else record.progress
        record.results_json = {
            agent_name: {
                "duration_ms": result.duration_ms,
                "success": result.success,
                "error": result.error,
                "result": result.result,
            }
            for agent_name, result in run.results.items()
        }
        record.error = "; ".join(run.errors) if run.errors else None
        record.report_path = f"/api/report/download/{run.run_id}" if run.status == "completed" else record.report_path
        db.commit()
    finally:
        db.close()


async def send_pipeline_completion_email(run: PipelineRun) -> None:
    db = SessionLocal()
    try:
        record = db.query(PipelineRunRecord).filter(PipelineRunRecord.id == run.run_id).first()
        if record is None:
            return
        user = db.query(User).filter(User.id == record.user_id).first()
        if user is None or not user.email_alerts:
            return
        duration_seconds = 0.0
        if run.completed_at and run.started_at:
            duration_seconds = (run.completed_at - run.started_at).total_seconds()
        await send_email(
            to_email=user.email,
            subject="Pipeline Analysis Complete",
            html_body=pipeline_complete_email_template(
                user_name=user.full_name,
                run_id=run.run_id,
                duration_seconds=duration_seconds,
                report_url=f"{settings.frontend_url}/reports",
            ),
        )
    finally:
        db.close()


def persist_alert(*, user_id: str | None, severity: str, type_: str, title: str, message: str) -> None:
    db = SessionLocal()
    try:
        db.add(
            AlertRecord(
                user_id=user_id,
                severity=severity,
                type=type_,
                title=title,
                message=message,
            )
        )
        db.commit()
    finally:
        db.close()


def serialize_ticket_record(record: TicketRecord) -> dict[str, object]:
    return {
        "id": record.id,
        "user_id": record.user_id,
        "title": record.title,
        "description": record.description,
        "category": record.category,
        "severity": record.severity,
        "status": record.status,
        "affected_area": record.affected_area,
        "resolution_notes": record.resolution_notes,
        "created_at": record.created_at.isoformat() + "Z" if record.created_at else None,
        "updated_at": record.updated_at.isoformat() + "Z" if record.updated_at else None,
        "resolved_at": record.resolved_at.isoformat() + "Z" if record.resolved_at else None,
    }


def build_report_pdf(run: PipelineRun) -> bytes:
    buffer = BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()

    summary_rows = [
        ["Run ID", run.run_id],
        ["Status", run.status.title()],
        ["Started", run.started_at.isoformat() + "Z"],
        ["Completed", run.completed_at.isoformat() + "Z" if run.completed_at else "In progress"],
        ["Agents", f"{len(run.results)} completed"],
    ]
    summary_table = Table(summary_rows, colWidths=[120, 360])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eff6ff")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0f172a")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))

    agent_rows = [["Agent", "Duration (ms)", "Success"]]
    for agent_name, result in run.results.items():
        agent_rows.append([agent_name, f"{result.duration_ms:.2f}", "Yes" if result.success else "No"])

    agent_table = Table(agent_rows, colWidths=[180, 140, 140])
    agent_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))

    story = [
        Paragraph("ChainPulse Pipeline Report", styles["Title"]),
        Spacer(1, 12),
        Paragraph("Executive Summary", styles["Heading2"]),
        Paragraph(
            f"This report captures pipeline run {run.run_id} with {len(run.results)} recorded agent results.",
            styles["BodyText"],
        ),
        Spacer(1, 16),
        summary_table,
        Spacer(1, 20),
        Paragraph("Agent Performance", styles["Heading2"]),
        agent_table,
    ]
    document.build(story)
    return buffer.getvalue()


async def pipeline_event_callback(run_id: str, event: dict):
    if event.get("event") in {"agent_start", "agent_complete", "agent_error"}:
        event = {**get_agent_metadata(event.get("agent", "")), **event}
    elif event.get("event") == "pipeline_complete":
        run = app.state.orchestrator.pipeline_runs.get(run_id)
        if run is not None:
            event = {**event, **get_pipeline_timing(run)}

    await manager.broadcast(run_id, event)


async def run_pipeline_background(run_id: str):
    run = app.state.orchestrator.pipeline_runs.get(run_id)
    if not run:
        return

    try:
        await app.state.orchestrator.run_pipeline(run, status_callback=pipeline_event_callback)
        update_pipeline_record(run)

        if run.status == "completed":
            duration_seconds = 0.0
            if run.completed_at and run.started_at:
                duration_seconds = (run.completed_at - run.started_at).total_seconds()
            persist_alert(
                user_id=None,
                severity="info",
                type_="pipeline",
                title="Pipeline Complete",
                message=f"Full analysis completed in {duration_seconds:.1f}s",
            )
            await alerts_manager.broadcast_alert({
                "event": "new_alert",
                "type": "success",
                "severity": "info",
                "title": "Pipeline Complete",
                "message": f"Full analysis completed in {duration_seconds:.1f}s",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            })
            await send_pipeline_completion_email(run)
        elif run.status == "failed":
            persist_alert(
                user_id=None,
                severity="critical",
                type_="pipeline",
                title="Pipeline Failed",
                message="Pipeline execution failed. See run details for more information.",
            )
            await alerts_manager.broadcast_alert({
                "event": "new_alert",
                "type": "error",
                "severity": "critical",
                "title": "Pipeline Failed",
                "message": "Pipeline execution failed. See run details for more information.",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            })
    except Exception as exc:
        run.status = "failed"
        run.completed_at = datetime.utcnow()
        run.errors.append(str(exc))
        update_pipeline_record(run)
        persist_alert(
            user_id=None,
            severity="critical",
            type_="pipeline",
            title="Pipeline Error",
            message=str(exc),
        )
        await manager.broadcast(run_id, {
            "event": "pipeline_error",
            "run_id": run_id,
            "error": str(exc),
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })
        await alerts_manager.broadcast_alert({
            "event": "new_alert",
            "type": "error",
            "severity": "critical",
            "title": "Pipeline Error",
            "message": str(exc),
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_startup_configuration()
    init_db()
    app.state.data_service = get_data_service()
    app.state.orchestrator = PipelineOrchestrator(app.state.data_service)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            validate_admin_bootstrap_configuration()
            create_user(
                db,
                username=settings.admin_bootstrap_username,
                email=settings.admin_bootstrap_email,
                full_name=settings.admin_bootstrap_full_name,
                password=settings.admin_bootstrap_password,
                role=UserRole.admin,
            )
            logger.info(
                "Initial admin bootstrap user created",
                username=settings.admin_bootstrap_username,
                email=settings.admin_bootstrap_email,
            )
    finally:
        db.close()
    try:
        app.state.llm_service = LLMService()
    except RuntimeError as exc:
        app.state.llm_service = None
        logger.warning("LLM service is unavailable: %s", exc)
    logger.info("Application startup complete")
    yield
    logger.info("Application shutdown complete")


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=build_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/pipeline/{run_id}")
async def pipeline_websocket(websocket: WebSocket, run_id: str):
    await manager.connect(websocket, run_id)
    try:
        run = app.state.orchestrator.pipeline_runs.get(run_id)
        if run is not None and run.status in {"completed", "failed"}:
            await websocket.send_text(
                json.dumps({
                    "event": "pipeline_complete" if run.status == "completed" else "pipeline_error",
                    "run_id": run_id,
                    "results": str(run.results)[:500] if run.status == "completed" else None,
                    "error": None if run.status == "completed" else ", ".join(run.errors),
                })
            )

        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                await websocket.send_text(json.dumps({"event": "pong"}))
            except asyncio.TimeoutError:
                await websocket.send_text(json.dumps({"event": "ping"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket, run_id)


@app.websocket("/ws/alerts")
async def alerts_websocket(websocket: WebSocket):
    await alerts_manager.connect(websocket)
    try:
        while True:
            await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
    except (WebSocketDisconnect, asyncio.TimeoutError):
        alerts_manager.disconnect(websocket)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = str(uuid4())
    request.state.request_id = request_id
    start = datetime.utcnow()
    response = await call_next(request)
    duration_ms = (datetime.utcnow() - start).total_seconds() * 1000
    logger.info(
        "HTTP request completed",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        request_id=request_id,
        duration_ms=round(duration_ms, 2),
    )
    response.headers["x-request-id"] = request_id
    return response


@app.exception_handler(SupplyChainException)
async def supply_chain_exception_handler(request: Request, exc: SupplyChainException):
    logger.error("SupplyChainException", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": str(exc), "type": type(exc).__name__},
    )


@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": "1.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/api/dashboard/kpis")
async def get_dashboard_kpis(current_user: User = Depends(require_viewer)):
    return app.state.data_service.get_kpis()


@app.get("/api/dashboard/demand-forecast")
async def get_dashboard_demand_forecast(current_user: User = Depends(require_viewer)):
    return app.state.data_service.get_demand_overview()


@app.get("/api/dashboard/map-data")
async def get_dashboard_map_data(current_user: User = Depends(require_viewer)):
    return app.state.data_service.get_map_data()


@app.get("/api/dashboard/carbon")
async def get_dashboard_carbon(current_user: User = Depends(require_viewer)):
    return app.state.data_service.get_carbon_dashboard()


@app.get("/api/dashboard/anomalies")
async def get_dashboard_anomalies(current_user: User = Depends(require_viewer)):
    return app.state.data_service.get_anomalies()


@app.get("/api/runs")
async def list_pipeline_runs(current_user: User = Depends(require_viewer), db: Session = Depends(get_db)):
    records = db.query(PipelineRunRecord).order_by(PipelineRunRecord.started_at.desc()).all()
    return [serialize_pipeline_record(record) for record in records]


@app.post("/api/run")
async def start_pipeline(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_analyst),
    db: Session = Depends(get_db),
):
    pipeline_run = app.state.orchestrator.create_run()
    db.add(
        PipelineRunRecord(
            id=pipeline_run.run_id,
            user_id=current_user.id,
            status="queued",
            progress=0,
            started_at=pipeline_run.started_at,
        )
    )
    db.commit()
    background_tasks.add_task(run_pipeline_background, pipeline_run.run_id)
    return {"run_id": pipeline_run.run_id, "status": "queued"}


@app.post("/api/pipeline/run")
async def start_pipeline_alias(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_analyst),
    db: Session = Depends(get_db),
):
    return await start_pipeline(background_tasks, current_user, db)


@app.get("/api/pipeline/runs")
async def list_pipeline_runs_alias(
    current_user: User = Depends(require_viewer),
    db: Session = Depends(get_db),
):
    return await list_pipeline_runs(current_user, db)


@app.get("/api/pipeline/history")
async def get_pipeline_history(current_user: User = Depends(require_viewer), db: Session = Depends(get_db)):
    records = db.query(PipelineRunRecord).order_by(PipelineRunRecord.started_at.desc()).all()
    return [serialize_pipeline_record(record) for record in records]


@app.get("/api/tickets/recent")
async def get_recent_tickets(current_user: User = Depends(require_viewer), db: Session = Depends(get_db)):
    query = db.query(TicketRecord)
    if current_user.role == UserRole.viewer:
        query = query.filter(TicketRecord.user_id == current_user.id)
    records = query.order_by(TicketRecord.created_at.desc()).limit(5).all()
    return [serialize_ticket_record(record) for record in records]


@app.get("/api/pipeline/latest")
async def get_latest_pipeline_run(current_user: User = Depends(require_viewer), db: Session = Depends(get_db)):
    record = db.query(PipelineRunRecord).order_by(PipelineRunRecord.started_at.desc()).first()
    if record is None:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"error": "No pipeline runs found"})
    return serialize_pipeline_record(record)


@app.get("/api/pipeline/timing")
async def get_pipeline_timing_endpoint(run_id: str | None = None, current_user: User = Depends(require_viewer)):
    run = None
    if run_id:
        run = app.state.orchestrator.pipeline_runs.get(run_id)
    else:
        run = find_latest_completed_run()

    if not run:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Pipeline run not found or not yet completed"},
        )

    return get_pipeline_timing(run)


@app.get("/api/run/{run_id}")
async def get_pipeline_run(run_id: str, current_user: User = Depends(require_viewer), db: Session = Depends(get_db)):
    run = app.state.orchestrator.pipeline_runs.get(run_id)
    if run:
        return serialize_pipeline_run(run)
    record = db.query(PipelineRunRecord).filter(PipelineRunRecord.id == run_id).first()
    if record is None:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"error": "Run not found"})
    return serialize_pipeline_record(record)


@app.get("/api/pipeline/{run_id}")
async def get_pipeline_run_alias(
    run_id: str,
    current_user: User = Depends(require_viewer),
    db: Session = Depends(get_db),
):
    return await get_pipeline_run(run_id, current_user, db)


@app.get("/api/report/download/{run_id}")
async def download_report(run_id: str, current_user: User = Depends(require_viewer), db: Session = Depends(get_db)):
    run = app.state.orchestrator.pipeline_runs.get(run_id)
    if run is not None:
        pdf_bytes = build_report_pdf(run)
    else:
        record = db.query(PipelineRunRecord).filter(PipelineRunRecord.id == run_id).first()
        if record is None:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"error": "Run not found"})
        pdf_bytes = build_report_pdf_from_record(record)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="chainpulse-report-{run_id}.pdf"'},
    )


app.include_router(agents.router, prefix=f"{settings.api_prefix}/agents")
app.include_router(auth.router, prefix=f"{settings.api_prefix}/auth")
app.include_router(chat.router, prefix=f"{settings.api_prefix}/chat")
app.include_router(intelligence.router, prefix=f"{settings.api_prefix}/intelligence")
app.include_router(inventory.router, prefix=f"{settings.api_prefix}/inventory")
app.include_router(orders.router, prefix=f"{settings.api_prefix}/orders")
app.include_router(shipments.router, prefix=f"{settings.api_prefix}/shipments")
app.include_router(suppliers.router, prefix=f"{settings.api_prefix}/suppliers")
app.include_router(tickets.router, prefix=f"{settings.api_prefix}/tickets")
app.include_router(warehouses.router, prefix=f"{settings.api_prefix}/warehouses")
app.include_router(disruptions.router, prefix=f"{settings.api_prefix}/disruptions")
