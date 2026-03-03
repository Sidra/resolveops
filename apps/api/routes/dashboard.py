"""Dashboard stats API."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models import AuditLog, Ticket, TicketStatus, Action, ActionStatus

router = APIRouter(tags=["dashboard"])


class DashboardStats(BaseModel):
    open_tickets: int
    resolved_today: int
    total_tickets: int
    auto_resolve_rate: float
    pending_actions: int
    total_actions_today: int


class AuditItem(BaseModel):
    id: str
    event_type: str
    actor: str | None
    description: str
    result: str | None
    created_at: str

    model_config = {"from_attributes": True}


class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_activity: list[AuditItem]


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Counts
    open_q = select(func.count(Ticket.id)).where(
        Ticket.status.in_([TicketStatus.open, TicketStatus.pending, TicketStatus.escalated])
    )
    resolved_today_q = select(func.count(Ticket.id)).where(
        Ticket.status == TicketStatus.resolved,
        Ticket.updated_at >= today_start,
    )
    total_q = select(func.count(Ticket.id))

    # Actions
    pending_actions_q = select(func.count(Action.id)).where(
        Action.status == ActionStatus.pending
    )
    actions_today_q = select(func.count(Action.id)).where(
        Action.created_at >= today_start
    )

    # Auto-resolve: resolved tickets with an action approved by policy (not human)
    total_resolved_q = select(func.count(Ticket.id)).where(
        Ticket.status.in_([TicketStatus.resolved, TicketStatus.closed])
    )
    auto_resolved_q = (
        select(func.count(func.distinct(Action.ticket_id)))
        .where(
            Action.status == ActionStatus.executed,
            Action.approved_by.like("policy:%"),
        )
    )

    open_count = (await db.execute(open_q)).scalar() or 0
    resolved_today = (await db.execute(resolved_today_q)).scalar() or 0
    total_tickets = (await db.execute(total_q)).scalar() or 0
    pending_actions = (await db.execute(pending_actions_q)).scalar() or 0
    actions_today = (await db.execute(actions_today_q)).scalar() or 0
    total_resolved = (await db.execute(total_resolved_q)).scalar() or 0
    auto_resolved = (await db.execute(auto_resolved_q)).scalar() or 0

    auto_resolve_rate = (auto_resolved / total_resolved * 100) if total_resolved > 0 else 0.0

    # Recent audit activity (last 10)
    activity_q = (
        select(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(10)
    )
    activity_rows = (await db.execute(activity_q)).scalars().all()

    recent_activity = [
        AuditItem(
            id=str(r.id),
            event_type=r.event_type,
            actor=r.actor,
            description=r.description,
            result=r.result,
            created_at=r.created_at.isoformat(),
        )
        for r in activity_rows
    ]

    return DashboardResponse(
        stats=DashboardStats(
            open_tickets=open_count,
            resolved_today=resolved_today,
            total_tickets=total_tickets,
            auto_resolve_rate=round(auto_resolve_rate, 1),
            pending_actions=pending_actions,
            total_actions_today=actions_today,
        ),
        recent_activity=recent_activity,
    )
