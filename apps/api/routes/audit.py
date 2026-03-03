"""Audit log API routes."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models import AuditLog, EventType

router = APIRouter(tags=["audit"])


# --- Schemas ---

class AuditLogCreate(BaseModel):
    event_type: str
    actor: str | None = "system"
    ticket_id: UUID | None = None
    description: str
    result: str | None = "success"


class AuditLogItem(BaseModel):
    id: UUID
    event_type: str
    actor: str | None
    ticket_id: UUID | None
    description: str
    result: str | None
    created_at: str

    model_config = {"from_attributes": True}


class AuditLogListResponse(BaseModel):
    items: list[AuditLogItem]
    total: int
    page: int
    page_size: int


# --- Routes ---

@router.get("/audit-log", response_model=AuditLogListResponse)
async def list_audit_log(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    event_type: str | None = Query(None),
    actor: str | None = Query(None),
    ticket_id: UUID | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Paginated audit log with optional filters."""
    query = select(AuditLog)
    count_query = select(func.count(AuditLog.id))

    if event_type:
        query = query.where(AuditLog.event_type == event_type)
        count_query = count_query.where(AuditLog.event_type == event_type)
    if actor:
        query = query.where(AuditLog.actor == actor)
        count_query = count_query.where(AuditLog.actor == actor)
    if ticket_id:
        query = query.where(AuditLog.ticket_id == ticket_id)
        count_query = count_query.where(AuditLog.ticket_id == ticket_id)

    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(AuditLog.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    rows = result.scalars().all()

    items = [
        AuditLogItem(
            id=row.id,
            event_type=row.event_type,
            actor=row.actor,
            ticket_id=row.ticket_id,
            description=row.description,
            result=row.result,
            created_at=row.created_at.isoformat(),
        )
        for row in rows
    ]

    return AuditLogListResponse(items=items, total=total, page=page, page_size=page_size)


@router.post("/audit-log", status_code=201)
async def create_audit_entry(
    entry: AuditLogCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new audit log entry."""
    # Validate event_type
    try:
        EventType(entry.event_type)
    except ValueError:
        valid = [e.value for e in EventType]
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail=f"Invalid event_type. Valid values: {valid}")

    row = AuditLog(
        event_type=entry.event_type,
        actor=entry.actor,
        ticket_id=entry.ticket_id,
        description=entry.description,
        result=entry.result,
    )
    db.add(row)
    await db.flush()

    return {
        "id": str(row.id),
        "event_type": row.event_type,
        "description": row.description,
        "created_at": row.created_at.isoformat(),
    }
