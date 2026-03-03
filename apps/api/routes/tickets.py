"""Ticket CRUD + AI resolution routes."""

import json
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from db import get_db
from models import (
    Action, ActionStatus, ActionType,
    AuditLog, EventType,
    Message, MessageRole,
    Policy, PolicyType,
    Ticket, TicketStatus, TicketPriority, ChannelType,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tickets", tags=["tickets"])

SYSTEM_PROMPT = (
    "You are ResolveOps AI, a customer support assistant. "
    "You help resolve customer tickets: refunds, reshipments, order inquiries. "
    "Be concise, empathetic, and professional. Keep responses to 2-4 sentences. "
    "If the customer needs a refund or reship, acknowledge it and confirm you'll process it. "
    "Never make up order numbers or financial details."
)


# --- Schemas ---

class TicketCreate(BaseModel):
    channel: str = "email"
    subject: str = Field(..., min_length=1, max_length=500)
    customer_email: str = Field(..., min_length=1)
    customer_name: str | None = None
    priority: str = "medium"
    message: str = Field(..., min_length=1)


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: str


class ActionOut(BaseModel):
    id: str
    type: str
    status: str
    amount: float | None
    currency: str | None
    approved_by: str | None
    created_at: str


class TicketOut(BaseModel):
    id: str
    channel: str
    status: str
    priority: str
    subject: str
    customer_email: str
    customer_name: str | None
    created_at: str
    updated_at: str


class TicketDetail(TicketOut):
    messages: list[MessageOut]
    actions: list[ActionOut]


class TicketListResponse(BaseModel):
    items: list[TicketOut]
    total: int
    page: int
    page_size: int


class AIRespondRequest(BaseModel):
    pass  # No input needed — AI reads the conversation


class ReplyRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class ActionRequest(BaseModel):
    type: str  # refund, reship
    amount: float | None = None
    currency: str = "USD"


# --- Routes ---

@router.get("", response_model=TicketListResponse)
async def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Ticket)
    count_query = select(func.count(Ticket.id))

    if status:
        query = query.where(Ticket.status == status)
        count_query = count_query.where(Ticket.status == status)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(Ticket.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    rows = (await db.execute(query)).scalars().all()

    return TicketListResponse(
        items=[_ticket_out(t) for t in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", status_code=201, response_model=TicketDetail)
async def create_ticket(req: TicketCreate, db: AsyncSession = Depends(get_db)):
    ticket = Ticket(
        channel=req.channel,
        subject=req.subject,
        customer_email=req.customer_email,
        customer_name=req.customer_name,
        priority=req.priority,
    )
    db.add(ticket)
    await db.flush()

    msg = Message(
        ticket_id=ticket.id,
        role=MessageRole.customer,
        content=req.message,
    )
    db.add(msg)

    audit = AuditLog(
        event_type=EventType.ticket_created,
        actor="system",
        ticket_id=ticket.id,
        description=f"Ticket created: {req.subject}",
        result="success",
    )
    db.add(audit)
    await db.flush()

    return _ticket_detail(ticket, [msg], [])


@router.get("/{ticket_id}", response_model=TicketDetail)
async def get_ticket(ticket_id: UUID, db: AsyncSession = Depends(get_db)):
    query = (
        select(Ticket)
        .where(Ticket.id == ticket_id)
        .options(selectinload(Ticket.messages), selectinload(Ticket.actions))
    )
    ticket = (await db.execute(query)).scalar_one_or_none()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    msgs = sorted(ticket.messages, key=lambda m: m.created_at)
    actions = sorted(ticket.actions, key=lambda a: a.created_at)
    return _ticket_detail(ticket, msgs, actions)


@router.post("/{ticket_id}/respond", response_model=MessageOut)
async def ai_respond(ticket_id: UUID, db: AsyncSession = Depends(get_db)):
    """Have AI draft and send a response to the ticket."""
    import os, sys
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "packages")))
    from llm_gateway import create_adapter

    query = (
        select(Ticket)
        .where(Ticket.id == ticket_id)
        .options(selectinload(Ticket.messages))
    )
    ticket = (await db.execute(query)).scalar_one_or_none()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    # Build conversation context
    conversation = "\n".join(
        f"{m.role.upper()}: {m.content}" for m in sorted(ticket.messages, key=lambda m: m.created_at)
    )
    prompt = f"Ticket subject: {ticket.subject}\nCustomer: {ticket.customer_name or ticket.customer_email}\n\nConversation:\n{conversation}\n\nDraft a helpful response:"

    try:
        adapter = create_adapter()
        response_text = await adapter.complete(
            prompt,
            temperature=0.5,
            max_tokens=512,
            system_prompt=SYSTEM_PROMPT,
        )
    except Exception as e:
        logger.exception("AI respond error")
        raise HTTPException(502, f"AI error: {e}")

    ai_msg = Message(
        ticket_id=ticket.id,
        role=MessageRole.ai,
        content=response_text,
    )
    db.add(ai_msg)

    audit = AuditLog(
        event_type=EventType.ai_response,
        actor=adapter.model_name,
        ticket_id=ticket.id,
        description=f"AI drafted response ({len(response_text)} chars)",
        result="success",
    )
    db.add(audit)

    # Update ticket status
    if ticket.status == TicketStatus.open:
        ticket.status = TicketStatus.pending

    await db.flush()

    return MessageOut(
        id=str(ai_msg.id),
        role=ai_msg.role,
        content=ai_msg.content,
        created_at=ai_msg.created_at.isoformat(),
    )


@router.post("/{ticket_id}/reply", status_code=201, response_model=MessageOut)
async def agent_reply(ticket_id: UUID, req: ReplyRequest, db: AsyncSession = Depends(get_db)):
    """Send a manual agent reply to the ticket."""
    ticket = (await db.execute(select(Ticket).where(Ticket.id == ticket_id))).scalar_one_or_none()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    msg = Message(
        ticket_id=ticket.id,
        role=MessageRole.agent,
        content=req.content,
    )
    db.add(msg)

    if ticket.status == TicketStatus.open:
        ticket.status = TicketStatus.pending

    await db.flush()

    return MessageOut(
        id=str(msg.id),
        role=msg.role,
        content=msg.content,
        created_at=msg.created_at.isoformat(),
    )


@router.post("/{ticket_id}/actions", status_code=201, response_model=ActionOut)
async def create_action(ticket_id: UUID, req: ActionRequest, db: AsyncSession = Depends(get_db)):
    """Create an action (refund/reship) with policy check."""
    ticket = (await db.execute(select(Ticket).where(Ticket.id == ticket_id))).scalar_one_or_none()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    # Prevent duplicate: check for existing pending/executed action of same type
    existing = (await db.execute(
        select(Action).where(
            Action.ticket_id == ticket_id,
            Action.type == req.type,
            Action.status.in_([ActionStatus.pending, ActionStatus.executed, ActionStatus.approved]),
        )
    )).scalar_one_or_none()
    if existing:
        raise HTTPException(
            409,
            f"A {req.type} action already exists on this ticket (status: {existing.status.value if hasattr(existing.status, 'value') else existing.status})"
        )

    # Policy check
    approved_by, auto_approved = await _check_policy(db, req.type, req.amount)

    action_status = ActionStatus.executed if auto_approved else ActionStatus.pending

    action = Action(
        ticket_id=ticket.id,
        type=req.type,
        status=action_status,
        amount=req.amount,
        currency=req.currency,
        approved_by=approved_by if auto_approved else None,
    )
    db.add(action)

    # Policy check audit
    policy_desc = f"{'Auto-approved' if auto_approved else 'Requires approval'} by {approved_by}"
    db.add(AuditLog(
        event_type=EventType.policy_check,
        actor="policy-engine",
        ticket_id=ticket.id,
        description=f"{req.type.title()} ${req.amount or 0:.2f} — {policy_desc}",
        result="approved" if auto_approved else "pending",
    ))

    if auto_approved:
        db.add(AuditLog(
            event_type=EventType.action_executed,
            actor=approved_by,
            ticket_id=ticket.id,
            description=f"{req.type.title()} of ${req.amount or 0:.2f} {req.currency} executed",
            result="success",
        ))

        # Add system message
        db.add(Message(
            ticket_id=ticket.id,
            role=MessageRole.system,
            content=f"{req.type.title()} of ${req.amount or 0:.2f} {req.currency} has been processed.",
        ))

    await db.flush()

    return ActionOut(
        id=str(action.id),
        type=action.type,
        status=action.status,
        amount=float(action.amount) if action.amount else None,
        currency=action.currency,
        approved_by=action.approved_by,
        created_at=action.created_at.isoformat(),
    )


@router.post("/{ticket_id}/actions/{action_id}/approve")
async def approve_action(ticket_id: UUID, action_id: UUID, db: AsyncSession = Depends(get_db)):
    """Approve a pending action."""
    action = (await db.execute(
        select(Action).where(Action.id == action_id, Action.ticket_id == ticket_id)
    )).scalar_one_or_none()
    if not action:
        raise HTTPException(404, "Action not found")
    if action.status != ActionStatus.pending:
        raise HTTPException(409, f"Action is already {action.status}")

    action.status = ActionStatus.executed
    action.approved_by = "manager:manual-approval"

    db.add(AuditLog(
        event_type=EventType.action_executed,
        actor="manager:manual-approval",
        ticket_id=ticket_id,
        description=f"{action.type.title()} of ${float(action.amount or 0):.2f} {action.currency} approved and executed",
        result="success",
    ))

    db.add(Message(
        ticket_id=ticket_id,
        role=MessageRole.system,
        content=f"{action.type.title()} of ${float(action.amount or 0):.2f} {action.currency} has been approved and processed.",
    ))

    await db.flush()
    return ActionOut(
        id=str(action.id), type=action.type, status=action.status,
        amount=float(action.amount) if action.amount else None,
        currency=action.currency, approved_by=action.approved_by,
        created_at=action.created_at.isoformat(),
    )


@router.post("/{ticket_id}/actions/{action_id}/reject")
async def reject_action(ticket_id: UUID, action_id: UUID, db: AsyncSession = Depends(get_db)):
    """Reject a pending action."""
    action = (await db.execute(
        select(Action).where(Action.id == action_id, Action.ticket_id == ticket_id)
    )).scalar_one_or_none()
    if not action:
        raise HTTPException(404, "Action not found")
    if action.status != ActionStatus.pending:
        raise HTTPException(409, f"Action is already {action.status}")

    action.status = ActionStatus.rejected

    db.add(AuditLog(
        event_type=EventType.action_rejected,
        actor="manager:manual-review",
        ticket_id=ticket_id,
        description=f"{action.type.title()} of ${float(action.amount or 0):.2f} {action.currency} rejected",
        result="rejected",
    ))

    db.add(Message(
        ticket_id=ticket_id,
        role=MessageRole.system,
        content=f"{action.type.title()} of ${float(action.amount or 0):.2f} {action.currency} has been rejected.",
    ))

    await db.flush()
    return ActionOut(
        id=str(action.id), type=action.type, status=action.status,
        amount=float(action.amount) if action.amount else None,
        currency=action.currency, approved_by=action.approved_by,
        created_at=action.created_at.isoformat(),
    )


@router.post("/{ticket_id}/resolve")
async def resolve_ticket(ticket_id: UUID, db: AsyncSession = Depends(get_db)):
    """Mark ticket as resolved."""
    ticket = (await db.execute(select(Ticket).where(Ticket.id == ticket_id))).scalar_one_or_none()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    ticket.status = TicketStatus.resolved

    db.add(AuditLog(
        event_type=EventType.ticket_resolved,
        actor="system",
        ticket_id=ticket.id,
        description=f"Ticket resolved: {ticket.subject}",
        result="success",
    ))

    await db.flush()
    return {"status": "resolved", "ticket_id": str(ticket.id)}


# --- Helpers ---

async def _check_policy(db: AsyncSession, action_type: str, amount: float | None) -> tuple[str, bool]:
    """Check policies and return (approved_by, auto_approved)."""
    if amount is None:
        return ("policy:default", True)

    # Get active policies for this action type
    policy_type = PolicyType.refund_cap if action_type == "refund" else PolicyType.reship_cap
    policies = (await db.execute(
        select(Policy).where(Policy.active == True, Policy.type == policy_type)
    )).scalars().all()

    for policy in policies:
        if policy.threshold and amount <= float(policy.threshold):
            if not policy.requires_approval:
                return (f"policy:{policy.name.lower().replace(' ', '-')}", True)

    # Check approval threshold
    approval_policies = (await db.execute(
        select(Policy).where(Policy.active == True, Policy.type == PolicyType.approval_threshold)
    )).scalars().all()

    for policy in approval_policies:
        if policy.threshold and amount <= float(policy.threshold):
            return (f"policy:{policy.name.lower().replace(' ', '-')}", False)

    return ("policy:manual-review", False)


def _ticket_out(t: Ticket) -> TicketOut:
    return TicketOut(
        id=str(t.id),
        channel=t.channel,
        status=t.status,
        priority=t.priority,
        subject=t.subject,
        customer_email=t.customer_email,
        customer_name=t.customer_name,
        created_at=t.created_at.isoformat(),
        updated_at=t.updated_at.isoformat(),
    )


def _ticket_detail(t: Ticket, messages: list, actions: list) -> TicketDetail:
    return TicketDetail(
        id=str(t.id),
        channel=t.channel,
        status=t.status,
        priority=t.priority,
        subject=t.subject,
        customer_email=t.customer_email,
        customer_name=t.customer_name,
        created_at=t.created_at.isoformat(),
        updated_at=t.updated_at.isoformat(),
        messages=[
            MessageOut(
                id=str(m.id),
                role=m.role,
                content=m.content,
                created_at=m.created_at.isoformat(),
            )
            for m in messages
        ],
        actions=[
            ActionOut(
                id=str(a.id),
                type=a.type,
                status=a.status,
                amount=float(a.amount) if a.amount else None,
                currency=a.currency,
                approved_by=a.approved_by,
                created_at=a.created_at.isoformat(),
            )
            for a in actions
        ],
    )
