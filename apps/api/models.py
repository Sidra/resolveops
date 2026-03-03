"""SQLAlchemy models for ResolveOps."""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_uuid() -> uuid.UUID:
    return uuid.uuid4()


# --- Enums ---

class ChannelType(str, enum.Enum):
    email = "email"
    chat = "chat"
    sms = "sms"
    whatsapp = "whatsapp"
    voice = "voice"


class TicketStatus(str, enum.Enum):
    open = "open"
    pending = "pending"
    resolved = "resolved"
    closed = "closed"
    escalated = "escalated"


class TicketPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


class MessageRole(str, enum.Enum):
    customer = "customer"
    agent = "agent"
    ai = "ai"
    system = "system"


class ActionType(str, enum.Enum):
    refund = "refund"
    reship = "reship"
    discount = "discount"
    cancel = "cancel"


class ActionStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    executed = "executed"
    rejected = "rejected"
    failed = "failed"


class EventType(str, enum.Enum):
    ticket_created = "ticket_created"
    ticket_resolved = "ticket_resolved"
    ticket_escalated = "ticket_escalated"
    ai_response = "ai_response"
    policy_check = "policy_check"
    action_requested = "action_requested"
    action_executed = "action_executed"
    action_rejected = "action_rejected"
    human_override = "human_override"
    shadow_draft = "shadow_draft"
    shadow_approved = "shadow_approved"
    shadow_rejected = "shadow_rejected"
    shadow_edited = "shadow_edited"
    channel_inbound = "channel_inbound"


class PolicyType(str, enum.Enum):
    refund_cap = "refund_cap"
    reship_cap = "reship_cap"
    approval_threshold = "approval_threshold"
    auto_resolve = "auto_resolve"
    escalation_rule = "escalation_rule"


# --- Base ---

class Base(DeclarativeBase):
    pass


# --- Models ---

class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    channel: Mapped[str] = mapped_column(Enum(ChannelType, name="channel_type"), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(TicketStatus, name="ticket_status"), nullable=False, default=TicketStatus.open
    )
    priority: Mapped[str] = mapped_column(
        Enum(TicketPriority, name="ticket_priority"), nullable=False, default=TicketPriority.medium
    )
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(320), nullable=False)
    customer_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    messages: Mapped[list["Message"]] = relationship(back_populates="ticket", cascade="all, delete-orphan")
    actions: Mapped[list["Action"]] = relationship(back_populates="ticket", cascade="all, delete-orphan")
    audit_entries: Mapped[list["AuditLog"]] = relationship(back_populates="ticket")

    __table_args__ = (
        Index("ix_tickets_status", "status"),
        Index("ix_tickets_customer_email", "customer_email"),
        Index("ix_tickets_created_at", "created_at"),
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(Enum(MessageRole, name="message_role"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_draft: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    visible_to_customer: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    ticket: Mapped["Ticket"] = relationship(back_populates="messages")

    __table_args__ = (
        Index("ix_messages_ticket_id", "ticket_id"),
        Index("ix_messages_created_at", "created_at"),
    )


class Action(Base):
    __tablename__ = "actions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(Enum(ActionType, name="action_type"), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(ActionStatus, name="action_status"), nullable=False, default=ActionStatus.pending
    )
    amount: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    currency: Mapped[str | None] = mapped_column(String(3), nullable=True, default="USD")
    approved_by: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    ticket: Mapped["Ticket"] = relationship(back_populates="actions")

    __table_args__ = (
        Index("ix_actions_ticket_id", "ticket_id"),
        Index("ix_actions_status", "status"),
    )


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    event_type: Mapped[str] = mapped_column(Enum(EventType, name="event_type"), nullable=False)
    actor: Mapped[str | None] = mapped_column(String(200), nullable=True, default="system")
    ticket_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="SET NULL"), nullable=True
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    result: Mapped[str | None] = mapped_column(String(50), nullable=True, default="success")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    ticket: Mapped["Ticket | None"] = relationship(back_populates="audit_entries")

    __table_args__ = (
        Index("ix_audit_log_event_type", "event_type"),
        Index("ix_audit_log_ticket_id", "ticket_id"),
        Index("ix_audit_log_created_at", "created_at"),
    )


class Policy(Base):
    __tablename__ = "policies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    type: Mapped[str] = mapped_column(Enum(PolicyType, name="policy_type"), nullable=False)
    threshold: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    requires_approval: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_policies_type", "type"),
        Index("ix_policies_active", "active"),
    )
