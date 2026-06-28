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


class ChatHistoryMessage(BaseModel):
    role: str
    content: str
    session_id: str | None = None
    timestamp: str | None = None
    confidence: float | None = None


class ChatRequest(BaseModel):
    message: str
    history: list[ChatHistoryMessage | dict] = Field(default_factory=list)
    include_context: bool = True
    session_id: str | None = None
