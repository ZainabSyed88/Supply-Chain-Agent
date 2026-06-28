from datetime import datetime
from pathlib import Path
import os
import sys
from types import SimpleNamespace


ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
os.chdir(BACKEND_DIR)

for path in (ROOT_DIR, BACKEND_DIR):
    path_str = str(path)
    if path_str not in sys.path:
        sys.path.insert(0, path_str)


from app.routers.tickets import TicketCreateRequest, TicketUpdateRequest, serialize_ticket


def test_ticket_request_defaults_and_validation():
    payload = TicketCreateRequest(
        title="Delayed shipment issue",
        description="Customer reports a shipment delay and needs an ETA update immediately.",
    )

    assert payload.category == "general"
    assert payload.severity == "medium"


def test_serialize_ticket_includes_reporter_and_status_fields():
    now = datetime.utcnow()
    ticket = SimpleNamespace(
        id="ticket-1",
        user_id="user-1",
        title="Portal access issue",
        description="Unable to sign in to ChainPulse after password reset.",
        category="access",
        severity="high",
        status="open",
        affected_area="auth",
        resolution_notes=None,
        created_at=now,
        updated_at=now,
        resolved_at=None,
        user=SimpleNamespace(
            id="user-1",
            full_name="Viewer User",
            email="viewer@example.com",
            role="viewer",
        ),
    )

    serialized = serialize_ticket(ticket)

    assert serialized["id"] == "ticket-1"
    assert serialized["status"] == "open"
    assert serialized["reporter"]["email"] == "viewer@example.com"


def test_ticket_update_request_accepts_resolution_notes():
    payload = TicketUpdateRequest(status="resolved", resolution_notes="Reset the account and confirmed access.")

    assert payload.status == "resolved"
    assert "confirmed access" in payload.resolution_notes
