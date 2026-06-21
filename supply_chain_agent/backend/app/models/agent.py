from __future__ import annotations
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class AgentResult(BaseModel):
    agent_name: str
    duration_ms: float
    success: bool
    error: str | None = None
    result: dict | list | None = None


class PipelineRun(BaseModel):
    run_id: str
    started_at: datetime
    completed_at: datetime | None = None
    status: Literal["pending", "running", "completed", "failed"] = "pending"
    results: dict[str, AgentResult] = Field(default_factory=dict)
    errors: list[str] = Field(default_factory=list)


class ChatMessage(BaseModel):
    message: str
