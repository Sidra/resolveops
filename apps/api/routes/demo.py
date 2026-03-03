"""Demo reset endpoint — wipes and re-seeds data for repeatable demos."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/reset")
async def reset_demo(db: AsyncSession = Depends(get_db)):
    """Truncate all tables and re-seed demo data."""
    # Truncate in dependency order (CASCADE handles FKs)
    await db.execute(text("TRUNCATE audit_log, actions, messages, tickets, policies RESTART IDENTITY CASCADE"))
    await db.commit()

    # Re-seed inline (avoid import/async issues with seed.py)
    from datetime import datetime, timedelta, timezone
    from models import (
        Action, ActionStatus, ActionType, AuditLog, ChannelType,
        EventType, Message, MessageRole, Policy, PolicyType,
        Ticket, TicketPriority, TicketStatus,
    )

    now = datetime.now(timezone.utc)

    # Policies
    policies = [
        Policy(name="Refund Auto-Approve Under $50", type=PolicyType.refund_cap,
               threshold=50.00, requires_approval=False, active=True,
               config={"description": "Refunds under $50 are auto-approved without human review"}),
        Policy(name="Refund Approval $50-200", type=PolicyType.approval_threshold,
               threshold=200.00, requires_approval=True, active=True,
               config={"description": "Refunds between $50-$200 require manager approval"}),
        Policy(name="Reship Auto-Approve", type=PolicyType.reship_cap,
               threshold=100.00, requires_approval=False, active=True,
               config={"description": "Reshipments under $100 product value are auto-approved"}),
    ]
    db.add_all(policies)

    # Ticket 1: Resolved refund (completed example)
    t1 = Ticket(
        channel=ChannelType.email, status=TicketStatus.resolved,
        priority=TicketPriority.medium,
        subject="Damaged item received — requesting refund",
        customer_email="alex.chen@example.com", customer_name="Alex Chen",
        created_at=now - timedelta(hours=6), updated_at=now - timedelta(hours=4),
    )
    db.add(t1)
    await db.flush()

    db.add_all([
        Message(ticket_id=t1.id, role=MessageRole.customer,
                content="Hi, I received my order #ORD-4821 today but the ceramic vase arrived cracked. Can I get a refund?",
                created_at=now - timedelta(hours=6)),
        Message(ticket_id=t1.id, role=MessageRole.ai,
                content="I'm sorry to hear about the damaged vase, Alex. Since the item value is $34.99, I can process an immediate refund for you. Would you like me to go ahead?",
                created_at=now - timedelta(hours=5, minutes=55)),
        Message(ticket_id=t1.id, role=MessageRole.customer,
                content="Yes please, that would be great.",
                created_at=now - timedelta(hours=5, minutes=50)),
        Message(ticket_id=t1.id, role=MessageRole.system,
                content="Refund of $34.99 USD has been processed.",
                created_at=now - timedelta(hours=5, minutes=48)),
        Message(ticket_id=t1.id, role=MessageRole.ai,
                content="Your refund of $34.99 has been processed and should appear in your account within 3-5 business days. Is there anything else I can help you with?",
                created_at=now - timedelta(hours=5, minutes=47)),
    ])
    db.add(Action(
        ticket_id=t1.id, type=ActionType.refund, status=ActionStatus.executed,
        amount=34.99, currency="USD", approved_by="policy:refund-auto-approve-under-$50",
        created_at=now - timedelta(hours=5, minutes=49),
        updated_at=now - timedelta(hours=5, minutes=48),
    ))

    # Ticket 2: Open — shipping delay (via chat)
    t2 = Ticket(
        channel=ChannelType.chat, status=TicketStatus.open,
        priority=TicketPriority.high,
        subject="Order #ORD-5102 not delivered after 10 days",
        customer_email="maria.garcia@example.com", customer_name="Maria Garcia",
        created_at=now - timedelta(hours=3), updated_at=now - timedelta(hours=3),
    )
    db.add(t2)
    await db.flush()

    db.add(Message(
        ticket_id=t2.id, role=MessageRole.customer,
        content="My order #ORD-5102 was supposed to arrive 5 days ago and tracking still shows 'in transit'. This is really frustrating — I need this for a birthday party this weekend!",
        created_at=now - timedelta(hours=3),
    ))

    # Ticket 3: Pending with shadow mode draft
    t3 = Ticket(
        channel=ChannelType.email, status=TicketStatus.pending,
        priority=TicketPriority.medium,
        subject="Wrong size received — need exchange",
        customer_email="james.wilson@example.com", customer_name="James Wilson",
        created_at=now - timedelta(hours=2), updated_at=now - timedelta(hours=1),
    )
    db.add(t3)
    await db.flush()

    db.add_all([
        Message(ticket_id=t3.id, role=MessageRole.customer,
                content="I ordered a medium hoodie but received a large. Order #ORD-4990. Can I get the right size shipped?",
                created_at=now - timedelta(hours=2)),
        Message(ticket_id=t3.id, role=MessageRole.ai,
                content="I'm sorry about the mix-up, James. I can ship the correct medium size right away. The reship will be processed at no additional cost to you.",
                is_draft=True, visible_to_customer=False,
                created_at=now - timedelta(hours=1, minutes=55)),
    ])

    # Ticket 4: Open — billing question
    t4 = Ticket(
        channel=ChannelType.email, status=TicketStatus.open,
        priority=TicketPriority.low,
        subject="Double charged for subscription renewal",
        customer_email="priya.patel@example.com", customer_name="Priya Patel",
        created_at=now - timedelta(hours=1), updated_at=now - timedelta(hours=1),
    )
    db.add(t4)
    await db.flush()

    db.add(Message(
        ticket_id=t4.id, role=MessageRole.customer,
        content="I was charged twice for my monthly subscription ($29.99 each). Can you refund the duplicate charge? Transaction IDs: TXN-8831 and TXN-8832.",
        created_at=now - timedelta(hours=1),
    ))

    # Ticket 5: Escalated — high value refund (pending approval)
    t5 = Ticket(
        channel=ChannelType.email, status=TicketStatus.escalated,
        priority=TicketPriority.urgent,
        subject="Entire order damaged in shipping — $189 refund needed",
        customer_email="sarah.johnson@example.com", customer_name="Sarah Johnson",
        created_at=now - timedelta(minutes=45), updated_at=now - timedelta(minutes=30),
    )
    db.add(t5)
    await db.flush()

    db.add_all([
        Message(ticket_id=t5.id, role=MessageRole.customer,
                content="My entire order #ORD-5200 arrived completely destroyed. The box was crushed and every item inside is broken. I need a full refund of $189.00 immediately.",
                created_at=now - timedelta(minutes=45)),
        Message(ticket_id=t5.id, role=MessageRole.ai,
                content="I'm very sorry about this, Sarah. I can see order #ORD-5200 for $189.00. Since this amount requires manager approval, I've escalated this for immediate review. You should hear back within the hour.",
                created_at=now - timedelta(minutes=40)),
    ])
    db.add(Action(
        ticket_id=t5.id, type=ActionType.refund, status=ActionStatus.pending,
        amount=189.00, currency="USD",
        created_at=now - timedelta(minutes=38),
        updated_at=now - timedelta(minutes=38),
    ))

    # Ticket 6: Chat channel ticket
    t6 = Ticket(
        channel=ChannelType.chat, status=TicketStatus.open,
        priority=TicketPriority.medium,
        subject="Need help with my account login",
        customer_email="chat.user@example.com", customer_name="Jordan Lee",
        created_at=now - timedelta(minutes=20), updated_at=now - timedelta(minutes=20),
    )
    db.add(t6)
    await db.flush()

    db.add(Message(
        ticket_id=t6.id, role=MessageRole.customer,
        content="Hi, I can't log into my account. I've tried resetting my password but I'm not receiving the reset email. Can you help?",
        created_at=now - timedelta(minutes=20),
    ))

    # Audit log entries
    audit_entries = [
        AuditLog(event_type=EventType.ticket_created, actor="system", ticket_id=t1.id,
                 description="Ticket created from email — damaged item, refund request",
                 result="success", created_at=now - timedelta(hours=6)),
        AuditLog(event_type=EventType.ai_response, actor="gemini-3.1-pro-preview", ticket_id=t1.id,
                 description="AI drafted response acknowledging damage and offering $34.99 refund",
                 result="success", created_at=now - timedelta(hours=5, minutes=55)),
        AuditLog(event_type=EventType.policy_check, actor="policy-engine", ticket_id=t1.id,
                 description="Refund $34.99 — auto-approved under $50 policy",
                 result="approved", created_at=now - timedelta(hours=5, minutes=49)),
        AuditLog(event_type=EventType.action_executed, actor="policy:refund-auto-approve", ticket_id=t1.id,
                 description="Refund of $34.99 USD executed — executed via stripe-mock, id=re_demo0001",
                 result="success", created_at=now - timedelta(hours=5, minutes=48)),
        AuditLog(event_type=EventType.ticket_resolved, actor="system", ticket_id=t1.id,
                 description="Ticket auto-resolved after successful refund",
                 result="success", created_at=now - timedelta(hours=4)),
        AuditLog(event_type=EventType.ticket_created, actor="channel:chat", ticket_id=t2.id,
                 description="Chat started by maria.garcia@example.com — shipping delay",
                 result="success", created_at=now - timedelta(hours=3)),
        AuditLog(event_type=EventType.channel_inbound, actor="channel:chat", ticket_id=t2.id,
                 description="Inbound chat from maria.garcia@example.com",
                 result="success", created_at=now - timedelta(hours=3)),
        AuditLog(event_type=EventType.ticket_created, actor="channel:email", ticket_id=t3.id,
                 description="Ticket created from email — wrong size, exchange needed",
                 result="success", created_at=now - timedelta(hours=2)),
        AuditLog(event_type=EventType.shadow_draft, actor="gemini-3.1-pro-preview", ticket_id=t3.id,
                 description="AI draft (shadow mode) — reship response for wrong size hoodie",
                 result="success", created_at=now - timedelta(hours=1, minutes=55)),
        AuditLog(event_type=EventType.ticket_created, actor="channel:email", ticket_id=t4.id,
                 description="Ticket created from email — duplicate subscription charge",
                 result="success", created_at=now - timedelta(hours=1)),
        AuditLog(event_type=EventType.ticket_created, actor="system", ticket_id=t5.id,
                 description="Ticket created — high value damaged order, $189 refund",
                 result="success", created_at=now - timedelta(minutes=45)),
        AuditLog(event_type=EventType.ai_response, actor="gemini-3.1-pro-preview", ticket_id=t5.id,
                 description="AI drafted escalation response for $189 refund",
                 result="success", created_at=now - timedelta(minutes=40)),
        AuditLog(event_type=EventType.policy_check, actor="policy-engine", ticket_id=t5.id,
                 description="Refund $189.00 exceeds $50 auto-approve — requires manager approval",
                 result="pending", created_at=now - timedelta(minutes=38)),
        AuditLog(event_type=EventType.ticket_escalated, actor="policy-engine", ticket_id=t5.id,
                 description="Ticket escalated — refund $189 requires approval",
                 result="success", created_at=now - timedelta(minutes=35)),
        AuditLog(event_type=EventType.ticket_created, actor="channel:chat", ticket_id=t6.id,
                 description="Chat started by chat.user@example.com — account login help",
                 result="success", created_at=now - timedelta(minutes=20)),
        AuditLog(event_type=EventType.channel_inbound, actor="channel:chat", ticket_id=t6.id,
                 description="Inbound chat from chat.user@example.com",
                 result="success", created_at=now - timedelta(minutes=20)),
    ]
    db.add_all(audit_entries)

    await db.flush()
    return {"status": "reset", "tickets": 6, "policies": 3, "audit_entries": 16}
