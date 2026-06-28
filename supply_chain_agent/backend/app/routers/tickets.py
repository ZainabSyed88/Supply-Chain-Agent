from __future__ import annotations

from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db_models import TicketRecord, User, UserRole
from app.services.auth_service import require_analyst, require_viewer

router = APIRouter()


class TicketCreateRequest(BaseModel):
    title: str = Field(min_length=5, max_length=255)
    description: str = Field(min_length=15, max_length=5000)
    category: Literal["general", "shipment", "supplier", "inventory", "billing", "access", "bug"] = "general"
    severity: Literal["low", "medium", "high", "critical"] = "medium"
    affected_area: str | None = Field(default=None, max_length=100)


class TicketUpdateRequest(BaseModel):
    status: Literal["open", "in_progress", "waiting_on_customer", "resolved", "closed"] | None = None
    resolution_notes: str | None = Field(default=None, max_length=5000)


def serialize_ticket(ticket: TicketRecord) -> dict[str, object]:
    return {
        "id": ticket.id,
        "user_id": ticket.user_id,
        "title": ticket.title,
        "description": ticket.description,
        "category": ticket.category,
        "severity": ticket.severity,
        "status": ticket.status,
        "affected_area": ticket.affected_area,
        "resolution_notes": ticket.resolution_notes,
        "created_at": ticket.created_at.isoformat() + "Z" if ticket.created_at else None,
        "updated_at": ticket.updated_at.isoformat() + "Z" if ticket.updated_at else None,
        "resolved_at": ticket.resolved_at.isoformat() + "Z" if ticket.resolved_at else None,
        "reporter": {
            "id": ticket.user.id,
            "full_name": ticket.user.full_name,
            "email": ticket.user.email,
            "role": ticket.user.role.value if isinstance(ticket.user.role, UserRole) else str(ticket.user.role),
        } if ticket.user else None,
    }


@router.get("")
async def list_tickets(
    status_filter: str | None = Query(None, alias="status"),
    current_user: User = Depends(require_viewer),
    db: Session = Depends(get_db),
):
    query = db.query(TicketRecord)
    if current_user.role == UserRole.viewer:
        query = query.filter(TicketRecord.user_id == current_user.id)
    if status_filter:
        query = query.filter(TicketRecord.status == status_filter)
    tickets = query.order_by(TicketRecord.created_at.desc()).all()
    return [serialize_ticket(ticket) for ticket in tickets]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_ticket(
    payload: TicketCreateRequest,
    request: Request,
    current_user: User = Depends(require_viewer),
    db: Session = Depends(get_db),
):
    ticket = TicketRecord(
        user_id=current_user.id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        category=payload.category,
        severity=payload.severity,
        affected_area=payload.affected_area.strip() if payload.affected_area else None,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    request.app.state.last_ticket_timestamp = datetime.utcnow().isoformat() + "Z"
    return serialize_ticket(ticket)


@router.get("/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    current_user: User = Depends(require_viewer),
    db: Session = Depends(get_db),
):
    ticket = db.query(TicketRecord).filter(TicketRecord.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current_user.role == UserRole.viewer and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return serialize_ticket(ticket)


@router.put("/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    payload: TicketUpdateRequest,
    current_user: User = Depends(require_analyst),
    db: Session = Depends(get_db),
):
    ticket = db.query(TicketRecord).filter(TicketRecord.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if payload.status is not None:
        ticket.status = payload.status
        if payload.status in {"resolved", "closed"}:
            ticket.resolved_at = datetime.utcnow()
    if payload.resolution_notes is not None:
        ticket.resolution_notes = payload.resolution_notes.strip() or None

    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket)
