from __future__ import annotations
import asyncio
import uuid
from datetime import datetime
from time import perf_counter
from typing import Any, Callable

from app.core.config import settings
from app.data.service import DataService
from app.models.agent import AgentResult, PipelineRun
from app.services.agents import (
    AgentContext,
    SupplierMonitorAgent,
    DisruptionDetectorAgent,
    RiskAssessmentAgent,
    MitigationAgent,
    StakeholderNotificationAgent,
)
from app.core.logging import get_logger

logger = get_logger("orchestrator")


class PipelineOrchestrator:
    def __init__(self, data_service: DataService):
        self.data_service = data_service
        self.pipeline_runs: dict[str, PipelineRun] = {}

    def create_run(self) -> PipelineRun:
        run_id = str(uuid.uuid4())
        run = PipelineRun(run_id=run_id, started_at=datetime.utcnow(), status="pending")
        self.pipeline_runs[run_id] = run
        return run

    async def _run_agent(
        self,
        agent: Any,
        context: AgentContext,
        status_callback: Callable[[str, dict], Any] | None = None,
    ) -> AgentContext:
        if status_callback is not None:
            await status_callback(context.run_id, {
                "event": "agent_start",
                "run_id": context.run_id,
                "agent": agent.name,
                "timestamp": datetime.utcnow().isoformat() + "Z",
            })

        start = perf_counter()
        try:
            result = await asyncio.wait_for(agent.run(context), timeout=settings.run_timeout_seconds)
            duration_ms = (perf_counter() - start) * 1000
            logger.info(
                "Agent completed",
                agent=agent.name,
                run_id=context.run_id,
                duration_ms=round(duration_ms, 2),
            )
            context.execution_details[agent.name] = {
                "duration_ms": round(duration_ms, 2),
                "status": "success",
            }
            if status_callback is not None:
                await status_callback(context.run_id, {
                    "event": "agent_complete",
                    "run_id": context.run_id,
                    "agent": agent.name,
                    "duration_ms": round(duration_ms, 2),
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                })
            return result
        except asyncio.TimeoutError as exc:
            duration_ms = (perf_counter() - start) * 1000
            message = f"Agent {agent.name} timed out after {settings.run_timeout_seconds}s"
            logger.error(
                message,
                agent=agent.name,
                run_id=context.run_id,
                duration_ms=round(duration_ms, 2),
            )
            context.errors.append(message)
            context.execution_details[agent.name] = {
                "duration_ms": round(duration_ms, 2),
                "status": "timeout",
                "error": message,
            }
            if status_callback is not None:
                await status_callback(context.run_id, {
                    "event": "agent_error",
                    "run_id": context.run_id,
                    "agent": agent.name,
                    "duration_ms": round(duration_ms, 2),
                    "error": message,
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                })
            return context
        except Exception as exc:
            duration_ms = (perf_counter() - start) * 1000
            message = f"Agent {agent.name} failed: {exc}"
            logger.exception(
                message,
                agent=agent.name,
                run_id=context.run_id,
                duration_ms=round(duration_ms, 2),
            )
            context.errors.append(message)
            context.execution_details[agent.name] = {
                "duration_ms": round(duration_ms, 2),
                "status": "failed",
                "error": str(exc),
            }
            if status_callback is not None:
                await status_callback(context.run_id, {
                    "event": "agent_error",
                    "run_id": context.run_id,
                    "agent": agent.name,
                    "duration_ms": round(duration_ms, 2),
                    "error": str(exc),
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                })
            return context

    async def _run_parallel(
        self,
        agents: list[Any],
        context: AgentContext,
        status_callback: Callable[[str, dict], Any] | None = None,
    ) -> AgentContext:
        tasks = [self._run_agent(agent, context, status_callback=status_callback) for agent in agents]
        completed = await asyncio.gather(*tasks, return_exceptions=True)
        for result in completed:
            if isinstance(result, Exception):
                logger.warning("Parallel agent error ignored", run_id=context.run_id, error=str(result))
        return context

    async def run_pipeline(
        self,
        run: PipelineRun | None = None,
        status_callback: Callable[[str, dict], Any] | None = None,
    ) -> PipelineRun:
        if run is None:
            run = self.create_run()
        run.status = "running"
        run.started_at = datetime.utcnow()
        context = AgentContext(run_id=run.run_id, timestamp=datetime.utcnow())

        if status_callback is not None:
            await status_callback(run.run_id, {
                "event": "pipeline_start",
                "run_id": run.run_id,
                "total_agents": 5,
                "timestamp": run.started_at.isoformat() + "Z",
            })

        try:
            tier1 = [
                SupplierMonitorAgent("supplier_monitor", self.data_service),
                DisruptionDetectorAgent("disruption_detector", self.data_service),
            ]
            await self._run_parallel(tier1, context, status_callback=status_callback)

            tier2 = [
                RiskAssessmentAgent("risk_assessor", self.data_service),
                MitigationAgent("mitigation", self.data_service),
            ]
            await self._run_parallel(tier2, context, status_callback=status_callback)

            # Stakeholder notification runs after tier 2 to preserve ordered output.
            await self._run_agent(
                StakeholderNotificationAgent("stakeholder_notification", self.data_service),
                context,
                status_callback=status_callback,
            )

            run.status = "completed"
            run.completed_at = datetime.utcnow()
            run.results = {
                agent_name: AgentResult(
                    agent_name=agent_name,
                    duration_ms=context.execution_details[agent_name].get("duration_ms", 0),
                    success=context.execution_details[agent_name].get("status") == "success",
                    error=context.execution_details[agent_name].get("error"),
                    result={
                        "details": context.execution_details[agent_name],
                    },
                )
                for agent_name in context.execution_details
            }
            if status_callback is not None:
                await status_callback(run.run_id, {
                    "event": "pipeline_complete",
                    "run_id": run.run_id,
                    "agent_times": {agent_name: context.execution_details[agent_name].get("duration_ms", 0) for agent_name in context.execution_details},
                    "timestamp": run.completed_at.isoformat() + "Z",
                })
            return run
        except Exception:
            run.status = "failed"
            run.completed_at = datetime.utcnow()
            run.errors = context.errors
            if status_callback is not None:
                await status_callback(run.run_id, {
                    "event": "pipeline_error",
                    "run_id": run.run_id,
                    "error": ", ".join(context.errors) if context.errors else "Unknown error",
                    "timestamp": run.completed_at.isoformat() + "Z",
                })
            return run
