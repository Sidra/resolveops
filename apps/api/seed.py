"""Seed the database with sample data for development."""

import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from db import async_session
from models import (
    ActionStatus,
    ActionType,
    AuditLog,
    ChannelType,
    EventType,
    MessageRole,
    Policy,
    PolicyType,
    Ticket,
    TicketPriority,
    TicketStatus,
    Action,
    Message,
)


async def seed():
    async with async_session() as session:
        # Check if data already exists
        existing = (await session.execute(select(Policy))).scalars().first()
        if existing:
            print("Seed data already exists — skipping.")
            return

        now = datetime.now(timezone.utc)

        # --- 3 Default Policies ---
        policies = [
            Policy(
                name="Refund Auto-Approve Under $50",
                type=PolicyType.refund_cap,
                threshold=50.00,
                requires_approval=False,
                active=True,
                config={"description": "Refunds under $50 are auto-approved without human review"},
            ),
            Policy(
                name="Refund Approval $50-200",
                type=PolicyType.approval_threshold,
                threshold=200.00,
                requires_approval=True,
                active=True,
                config={"description": "Refunds between $50-$200 require manager approval"},
            ),
            Policy(
                name="Reship Auto-Approve",
                type=PolicyType.reship_cap,
                threshold=100.00,
                requires_approval=False,
                active=True,
                config={"description": "Reshipments under $100 product value are auto-approved"},
            ),
        ]
        session.add_all(policies)

        # --- 1 Sample Ticket ---
        ticket = Ticket(
            channel=ChannelType.email,
            status=TicketStatus.resolved,
            priority=TicketPriority.medium,
            subject="Damaged item received — requesting refund",
            customer_email="alex.chen@example.com",
            customer_name="Alex Chen",
            created_at=now - timedelta(hours=2),
            updated_at=now - timedelta(minutes=10),
        )
        session.add(ticket)
        await session.flush()  # Get ticket.id

        # --- Messages on the ticket ---
        messages = [
            Message(
                ticket_id=ticket.id,
                role=MessageRole.customer,
                content="Hi, I received my order #ORD-4821 today but the ceramic vase arrived cracked. Can I get a refund?",
                created_at=now - timedelta(hours=2),
            ),
            Message(
                ticket_id=ticket.id,
                role=MessageRole.ai,
                content="I'm sorry to hear about the damaged vase, Alex. I can see order #ORD-4821 in our system. Since the item value is $34.99, I can process an immediate refund for you. Would you like me to go ahead?",
                created_at=now - timedelta(hours=1, minutes=55),
            ),
            Message(
                ticket_id=ticket.id,
                role=MessageRole.customer,
                content="Yes please, that would be great.",
                created_at=now - timedelta(hours=1, minutes=50),
            ),
            Message(
                ticket_id=ticket.id,
                role=MessageRole.ai,
                content="Your refund of $34.99 has been processed and should appear in your account within 3-5 business days. Is there anything else I can help you with?",
                created_at=now - timedelta(hours=1, minutes=48),
            ),
        ]
        session.add_all(messages)

        # --- Action ---
        action = Action(
            ticket_id=ticket.id,
            type=ActionType.refund,
            status=ActionStatus.executed,
            amount=34.99,
            currency="USD",
            approved_by="policy:refund-auto-approve",
            created_at=now - timedelta(hours=1, minutes=49),
            updated_at=now - timedelta(hours=1, minutes=48),
        )
        session.add(action)

        # --- 5 Audit Log Entries (realistic flow) ---
        audit_entries = [
            AuditLog(
                event_type=EventType.ticket_created,
                actor="system",
                ticket_id=ticket.id,
                description="Ticket created from email — damaged item, refund request",
                result="success",
                created_at=now - timedelta(hours=2),
            ),
            AuditLog(
                event_type=EventType.ai_response,
                actor="gemini-2.0-flash",
                ticket_id=ticket.id,
                description="AI drafted response acknowledging damage and offering $34.99 refund",
                result="success",
                created_at=now - timedelta(hours=1, minutes=55),
            ),
            AuditLog(
                event_type=EventType.policy_check,
                actor="policy-engine",
                ticket_id=ticket.id,
                description="Refund $34.99 checked against 'Refund Auto-Approve Under $50' — auto-approved",
                result="approved",
                created_at=now - timedelta(hours=1, minutes=49),
            ),
            AuditLog(
                event_type=EventType.action_executed,
                actor="policy:refund-auto-approve",
                ticket_id=ticket.id,
                description="Refund of $34.99 USD executed for order #ORD-4821",
                result="success",
                created_at=now - timedelta(hours=1, minutes=48),
            ),
            AuditLog(
                event_type=EventType.ticket_resolved,
                actor="system",
                ticket_id=ticket.id,
                description="Ticket auto-resolved after successful refund and customer confirmation",
                result="success",
                created_at=now - timedelta(minutes=10),
            ),
        ]
        session.add_all(audit_entries)

        await session.commit()
        print("Seed data inserted: 3 policies, 1 ticket, 4 messages, 1 action, 5 audit entries")


if __name__ == "__main__":
    asyncio.run(seed())
