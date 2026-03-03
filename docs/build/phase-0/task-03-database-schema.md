# Task 03 — Database Schema + Migrations + Audit Log

**Phase:** 0 — Prototype
**Status:** Complete
**Date:** 2026-03-03

---

## 1. What This Task Is About

**WHY:** Every subsequent feature (policy engine, ticket routing, actions, dashboard) needs a data foundation. Without tables, nothing can persist.

**WHAT:** Installed SQLAlchemy + Alembic, created 5 core tables (tickets, messages, actions, audit_log, policies), ran migrations, seeded sample data, built audit log API + frontend page.

**SCOPE:** Database layer, ORM models, migration tooling, audit CRUD endpoints, audit UI page.

---

## 2. Backend

### Dependencies added
- `sqlalchemy[asyncio]==2.0.36`
- `alembic==1.14.1`
- `greenlet==3.1.1`

### Files created/modified
| File | Purpose |
|------|---------|
| `apps/api/db.py` | Async engine, session maker, `get_db()` FastAPI dependency |
| `apps/api/models.py` | 5 SQLAlchemy models with enums, UUID PKs, indexes |
| `apps/api/routes/audit.py` | GET/POST `/audit-log` with pagination + filters |
| `apps/api/seed.py` | Sample data: 3 policies, 1 ticket, 4 messages, 1 action, 5 audit entries |
| `apps/api/main.py` | Added audit router, lifespan handler, DB health check |
| `apps/api/alembic.ini` | Alembic config (URL loaded from app config) |
| `apps/api/alembic/env.py` | Async migration runner |

### API endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/audit-log` | Paginated list with `event_type`, `actor`, `ticket_id` filters |
| POST | `/audit-log` | Create audit entry (201) |
| GET | `/health` | Now includes `"database": "connected\|disconnected"` |

### Data flow
1. Request → FastAPI route → `get_db()` dependency injects async session
2. SQLAlchemy query → asyncpg → Postgres
3. Session auto-commits on success, rolls back on error

---

## 3. Frontend

| File | Purpose |
|------|---------|
| `apps/web/app/audit-log/page.tsx` | Audit log table page |
| `apps/web/app/layout.tsx` | Sidebar — Audit Log is now a clickable link |

### Audit Log page features
- Table with 5 columns: Time, Event, Actor, Description, Result
- Color-coded event type badges (blue/green/purple/cyan/etc.)
- Color-coded result badges (success=green, approved=green, failed=red)
- Event type filter dropdown
- Pagination controls (Previous/Next)
- Refresh button
- Dual-theme styling (dark + light)
- Loading and error states

---

## 4. Database

### Tables
| Table | Columns | Indexes |
|-------|---------|---------|
| tickets | id (UUID PK), channel, status, priority, subject, customer_email, customer_name, created_at, updated_at | status, customer_email, created_at |
| messages | id (UUID PK), ticket_id (FK), role, content, created_at | ticket_id, created_at |
| actions | id (UUID PK), ticket_id (FK), type, status, amount, currency, approved_by, created_at, updated_at | ticket_id, status |
| audit_log | id (UUID PK), event_type, actor, ticket_id (FK), description, result, created_at | event_type, ticket_id, created_at |
| policies | id (UUID PK), name (unique), type, threshold, requires_approval, active, config (JSON), created_at, updated_at | type, active |

### Enums
- `channel_type`: email, chat, sms, whatsapp, voice
- `ticket_status`: open, pending, resolved, closed, escalated
- `ticket_priority`: low, medium, high, urgent
- `message_role`: customer, agent, ai, system
- `action_type`: refund, reship, discount, cancel
- `action_status`: pending, approved, executed, rejected, failed
- `event_type`: ticket_created, ticket_resolved, ticket_escalated, ai_response, policy_check, action_requested, action_executed, action_rejected, human_override
- `policy_type`: refund_cap, reship_cap, approval_threshold, auto_resolve, escalation_rule

### Migration
- Alembic with async runner
- Initial migration includes `CREATE EXTENSION IF NOT EXISTS vector` for pgvector
- Revision: `e3d45bf2b3bb`

---

## 5. Seed Data

### Policies (3)
1. Refund Auto-Approve Under $50
2. Refund Approval $50-200
3. Reship Auto-Approve

### Sample ticket
- Customer: Alex Chen (alex.chen@example.com)
- Subject: Damaged item received — requesting refund
- Channel: email, resolved, medium priority
- 4 messages showing realistic AI interaction
- 1 refund action ($34.99, auto-approved)

### Audit log entries (5)
1. Ticket created from email
2. AI drafted response
3. Policy check — auto-approved
4. Refund executed
5. Ticket auto-resolved

---

## 6. What Was NOT Built

- Ticket CRUD API endpoints (will come with ticket routing task)
- Policy CRUD API endpoints (will come with policy engine task)
- Message CRUD API endpoints (will come with ticket detail page)
- Real-time audit log updates (WebSocket — future)
- Audit log export (CSV/JSON — future)

---

## 7. How to Test Manually

```bash
# 1. Start Postgres
docker compose up -d postgres

# 2. Run migrations (if fresh)
cd apps/api && source .venv/bin/activate && alembic upgrade head

# 3. Seed data
python seed.py

# 4. Start API
uvicorn main:app --host 0.0.0.0 --port 3101

# 5. Test endpoints
curl http://localhost:3101/health
# → {"status":"ok","service":"api","version":"0.1.0","database":"connected"}

curl http://localhost:3101/audit-log
# → 5 seed entries

curl -X POST http://localhost:3101/audit-log \
  -H "Content-Type: application/json" \
  -d '{"event_type":"ticket_created","description":"Test"}'
# → 201

curl "http://localhost:3101/audit-log?event_type=ai_response"
# → filtered results

# 6. Start frontend
cd apps/web && pnpm dev
# → http://localhost:3100/audit-log
```
