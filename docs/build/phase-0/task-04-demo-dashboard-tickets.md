# Task 04 — Demo Dashboard, Tickets + AI Resolution

**Phase:** 0 — Prototype
**Status:** Complete
**Date:** 2026-03-03

---

## 1. What This Task Is About

**WHY:** Make the platform demo-worthy — show the full loop from ticket creation to AI resolution with policy checks and audit trails.

**WHAT:** Live dashboard with real stats, tickets list with create/filter, ticket detail with conversation thread, AI respond button, action processing with policy engine, resolve button. Active sidebar navigation.

**SCOPE:** Dashboard stats API, tickets CRUD + AI/action endpoints, 3 frontend pages, sidebar refactor, enriched seed data.

---

## 2. Backend

### New routes
| File | Endpoints |
|------|-----------|
| `routes/dashboard.py` | `GET /dashboard` — stats + recent activity |
| `routes/tickets.py` | `GET /tickets` — paginated list with status filter |
| | `POST /tickets` — create ticket with initial message |
| | `GET /tickets/{id}` — detail with messages + actions |
| | `POST /tickets/{id}/respond` — AI generates response |
| | `POST /tickets/{id}/actions` — create action with policy check (409 on duplicates) |
| | `POST /tickets/{id}/actions/{action_id}/approve` — approve pending action |
| | `POST /tickets/{id}/actions/{action_id}/reject` — reject pending action |
| | `POST /tickets/{id}/resolve` — mark as resolved |

### Policy engine (inline)
- Checks active policies by action type + amount
- Under $50 refund → auto-approved, auto-executed
- $50-$200 refund → requires approval (pending)
- Over $200 → manual review
- Reship under $100 → auto-approved
- All checks logged to audit_log

### Seed data (5 tickets)
1. Resolved: Damaged vase, $34.99 refund auto-approved
2. Open: Shipping delay complaint (high priority)
3. Pending: Wrong size, exchange needed
4. Open: Double subscription charge
5. Escalated: $189 damaged order (requires approval)

---

## 3. Frontend

| Page | URL | Features |
|------|-----|----------|
| Dashboard | `/` | 4 stat cards (open, resolved today, auto-resolve %, pending actions), ticket overview, activity feed, auto-refresh 15s |
| Tickets | `/tickets` | List with status/priority badges, channel icons, status filter, create ticket form, pagination |
| Ticket Detail | `/tickets/[id]` | Conversation thread, AI Respond button, Process Action form, Approve/Reject for pending actions, Resolve button, resolved banner, policy check feedback |
| Sidebar | (all pages) | Active highlighting, all nav links working |

### Sidebar refactor
- Extracted to `sidebar.tsx` client component
- Active page highlighted with accent color
- `suppressHydrationWarning` on `<html>` to handle Dark Reader

---

## 4. How to Test Manually

```bash
# 1. Docker + DB
docker compose up -d postgres
cd apps/api && source .venv/bin/activate
alembic upgrade head
python seed.py

# 2. Start API
uvicorn main:app --host 0.0.0.0 --port 3101 --reload

# 3. Start frontend
cd apps/web && pnpm dev

# 4. Browse
# Dashboard:    http://localhost:3100
# Tickets:      http://localhost:3100/tickets
# Ticket detail: Click any ticket
# Audit log:    http://localhost:3100/audit-log

# 5. Demo flow
# - Go to /tickets
# - Click "Order #ORD-5102 not delivered" (open ticket)
# - Click "AI Respond" — AI drafts a response
# - Click "Process Action" → Refund $29.99 → auto-approved!
# - Try "Process Action" again → Refund → 409 duplicate blocked!
# - Click "Resolve"
# - Go back to Dashboard — stats updated
# - Check Audit Log — all events tracked
#
# Approval flow:
# - Click "Entire order damaged" ticket (escalated, $189)
# - See pending action with Approve/Reject buttons
# - Click "Approve" — action becomes executed
# - Or click "Reject" — action becomes rejected

# 6. API endpoints
curl http://localhost:3101/dashboard
curl http://localhost:3101/tickets
curl http://localhost:3101/tickets?status=open
curl -X POST http://localhost:3101/tickets -H "Content-Type: application/json" \
  -d '{"subject":"Test","customer_email":"test@test.com","message":"Help!"}'
```

---

## 5. What Was NOT Built

- Real-time WebSocket updates (future)
- Ticket assignment to agents
- Message reply from agent (human)
- Ticket search
- Bulk operations
