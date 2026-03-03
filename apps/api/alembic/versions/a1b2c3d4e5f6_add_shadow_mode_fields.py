"""add shadow mode fields to messages + new event types

Revision ID: a1b2c3d4e5f6
Revises: e3d45bf2b3bb
Create Date: 2026-03-03 23:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "e3d45bf2b3bb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add shadow mode columns to messages
    op.add_column("messages", sa.Column("is_draft", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("messages", sa.Column("visible_to_customer", sa.Boolean(), nullable=False, server_default="true"))

    # Add new EventType enum values
    op.execute("ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'shadow_draft'")
    op.execute("ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'shadow_approved'")
    op.execute("ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'shadow_rejected'")
    op.execute("ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'shadow_edited'")
    op.execute("ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'channel_inbound'")


def downgrade() -> None:
    op.drop_column("messages", "visible_to_customer")
    op.drop_column("messages", "is_draft")
    # Note: PostgreSQL does not support removing enum values
