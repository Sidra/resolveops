"""Channel inbound routes — email webhook + live chat."""

import re
import logging
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models import (
    AuditLog, ChannelType, EventType,
    Message, MessageRole,
    Ticket, TicketPriority, TicketStatus,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/channels", tags=["channels"])

# --- Helpers ---

_SUBJECT_PREFIX_RE = re.compile(r"^(re|fwd|fw)\s*:\s*", re.IGNORECASE)


def _clean_subject(subject: str) -> str:
    """Strip Re:/Fwd:/Fw: prefixes for thread matching."""
    cleaned = subject.strip()
    while True:
        m = _SUBJECT_PREFIX_RE.match(cleaned)
        if not m:
            break
        cleaned = cleaned[m.end():].strip()
    return cleaned


# --- Email schemas ---

class EmailInbound(BaseModel):
    from_email: str = Field(..., min_length=1)
    from_name: str | None = None
    subject: str = Field(..., min_length=1, max_length=500)
    body: str = Field(..., min_length=1)


class EmailResult(BaseModel):
    action: str  # "created" or "threaded"
    ticket_id: str
    subject: str


# --- Chat schemas ---

class ChatStartRequest(BaseModel):
    customer_email: str = Field(..., min_length=1)
    customer_name: str | None = None
    message: str = Field(..., min_length=1)


class ChatMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    sender: str = "customer"  # customer or agent


class ChatMessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: str


class ChatStartResult(BaseModel):
    ticket_id: str
    message_id: str


# --- Email endpoints ---

@router.post("/email/inbound", response_model=EmailResult)
async def email_inbound(req: EmailInbound, db: AsyncSession = Depends(get_db)):
    """Receive a parsed inbound email. Thread into existing ticket or create new."""
    cleaned_subject = _clean_subject(req.subject)

    # Try to find existing open/pending ticket from same customer with matching subject
    existing = (await db.execute(
        select(Ticket).where(
            Ticket.customer_email == req.from_email,
            Ticket.status.in_([TicketStatus.open, TicketStatus.pending, TicketStatus.escalated]),
        ).order_by(Ticket.created_at.desc())
    )).scalars().all()

    threaded_ticket = None
    for t in existing:
        if _clean_subject(t.subject).lower() == cleaned_subject.lower():
            threaded_ticket = t
            break

    if threaded_ticket:
        # Thread into existing ticket
        msg = Message(
            ticket_id=threaded_ticket.id,
            role=MessageRole.customer,
            content=req.body,
        )
        db.add(msg)

        db.add(AuditLog(
            event_type=EventType.channel_inbound,
            actor="channel:email",
            ticket_id=threaded_ticket.id,
            description=f"Email threaded from {req.from_email}: {req.subject}",
            result="success",
        ))
        await db.flush()

        return EmailResult(
            action="threaded",
            ticket_id=str(threaded_ticket.id),
            subject=threaded_ticket.subject,
        )

    # Create new ticket
    ticket = Ticket(
        channel=ChannelType.email,
        subject=cleaned_subject or req.subject,
        customer_email=req.from_email,
        customer_name=req.from_name,
        priority=TicketPriority.medium,
    )
    db.add(ticket)
    await db.flush()

    msg = Message(
        ticket_id=ticket.id,
        role=MessageRole.customer,
        content=req.body,
    )
    db.add(msg)

    db.add(AuditLog(
        event_type=EventType.ticket_created,
        actor="channel:email",
        ticket_id=ticket.id,
        description=f"Ticket created from email — {req.from_email}: {ticket.subject}",
        result="success",
    ))
    db.add(AuditLog(
        event_type=EventType.channel_inbound,
        actor="channel:email",
        ticket_id=ticket.id,
        description=f"Inbound email from {req.from_email}",
        result="success",
    ))
    await db.flush()

    return EmailResult(
        action="created",
        ticket_id=str(ticket.id),
        subject=ticket.subject,
    )


# --- Chat endpoints ---

@router.post("/chat/start", status_code=201, response_model=ChatStartResult)
async def chat_start(req: ChatStartRequest, db: AsyncSession = Depends(get_db)):
    """Customer starts a live chat session — creates a ticket."""
    ticket = Ticket(
        channel=ChannelType.chat,
        subject=req.message[:100] + ("..." if len(req.message) > 100 else ""),
        customer_email=req.customer_email,
        customer_name=req.customer_name,
        priority=TicketPriority.medium,
    )
    db.add(ticket)
    await db.flush()

    msg = Message(
        ticket_id=ticket.id,
        role=MessageRole.customer,
        content=req.message,
    )
    db.add(msg)

    db.add(AuditLog(
        event_type=EventType.ticket_created,
        actor="channel:chat",
        ticket_id=ticket.id,
        description=f"Chat started by {req.customer_email}",
        result="success",
    ))
    db.add(AuditLog(
        event_type=EventType.channel_inbound,
        actor="channel:chat",
        ticket_id=ticket.id,
        description=f"Inbound chat from {req.customer_email}",
        result="success",
    ))
    await db.flush()

    return ChatStartResult(ticket_id=str(ticket.id), message_id=str(msg.id))


@router.post("/chat/{ticket_id}/message", status_code=201, response_model=ChatMessageOut)
async def chat_message(ticket_id: UUID, req: ChatMessageRequest, db: AsyncSession = Depends(get_db)):
    """Customer or agent sends a chat message."""
    ticket = (await db.execute(select(Ticket).where(Ticket.id == ticket_id))).scalar_one_or_none()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    role = MessageRole.customer if req.sender == "customer" else MessageRole.agent
    msg = Message(
        ticket_id=ticket.id,
        role=role,
        content=req.content,
    )
    db.add(msg)
    await db.flush()

    return ChatMessageOut(
        id=str(msg.id),
        role=msg.role,
        content=msg.content,
        created_at=msg.created_at.isoformat(),
    )


@router.get("/chat/{ticket_id}/messages", response_model=list[ChatMessageOut])
async def chat_messages(
    ticket_id: UUID,
    after: str | None = Query(None, description="ISO timestamp — only return messages after this time"),
    db: AsyncSession = Depends(get_db),
):
    """Poll for chat messages. Only returns visible_to_customer=True messages."""
    ticket = (await db.execute(select(Ticket).where(Ticket.id == ticket_id))).scalar_one_or_none()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    query = (
        select(Message)
        .where(Message.ticket_id == ticket_id, Message.visible_to_customer == True)
        .order_by(Message.created_at.asc())
    )

    if after:
        try:
            after_dt = datetime.fromisoformat(after)
        except ValueError:
            raise HTTPException(400, "Invalid 'after' timestamp")
        query = query.where(Message.created_at > after_dt)

    messages = (await db.execute(query)).scalars().all()

    return [
        ChatMessageOut(
            id=str(m.id),
            role=m.role,
            content=m.content,
            created_at=m.created_at.isoformat(),
        )
        for m in messages
    ]
