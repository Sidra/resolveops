# Task 05 — Channels, Shadow Mode, Mock Executors

**Phase:** 0 — Prototype
**Date:** 2026-03-03
**Status:** Complete

---

## 1. What This Task Is About

**WHY:** Phase 0 Gate A requires channel integrations, shadow mode, and real action execution. Tasks 01-04 built the core loop (tickets + AI + policy + actions). This task completes all remaining Phase 0 deliverables.

**WHAT:**
- Email inbound channel with thread detection
- Live chat channel (start, message, poll)
- Shadow mode (AI drafts, human approves/edits/rejects)
- Mock action executors (Stripe refund, Shopify reship)
- Dashboard channel stats + drafts pending
- Frontend: email simulator, chat widget, shadow mode UI

**SCOPE:** Full Phase 0 completion. Email + chat channels, shadow mode end-to-end, mock executors with factory pattern.

---

## 2. Backend

### Dependencies
- No new pip packages needed (all built on existing FastAPI + SQLAlchemy)

### Database Migration
- `alembic/versions/a1b2c3d4e5f6_add_shadow_mode_fields.py`
  - Added `messages.is_draft` (bool, default false)
  - Added `messages.visible_to_customer` (bool, default true)
  - Added EventType enum values: `shadow_draft`, `shadow_approved`, `shadow_rejected`, `shadow_edited`, `channel_inbound`

### Models Updated
- `models.py`: Message model now has `is_draft` and `visible_to_customer` fields; EventType has 5 new values

### New Routes

**`routes/channels.py`** — Email + Chat endpoints:
| Endpoint | Purpose |
|----------|---------|
| `POST /channels/email/inbound` | Receive parsed email, thread or create ticket |
| `POST /channels/chat/start` | Start chat session, create ticket |
| `POST /channels/chat/{id}/message` | Send chat message |
| `GET /channels/chat/{id}/messages` | Poll messages (respects visible_to_customer) |

**Shadow mode in `routes/tickets.py`**:
| Endpoint | Purpose |
|----------|---------|
| `POST /tickets/{id}/respond` | Now accepts `shadow_mode` (default true), saves draft |
| `POST /tickets/{id}/messages/{msg_id}/approve` | Approve draft (optional edited content) |
| `POST /tickets/{id}/messages/{msg_id}/reject` | Reject draft, mark as internal system note |

### Mock Executors

**`packages/integrations/executors/`** — Factory pattern matching LLM Gateway:
| File | Class | Purpose |
|------|-------|---------|
| `base.py` | `ActionExecutor` ABC + `ExecutionResult` | Interface |
| `stripe_mock.py` | `StripeMockExecutor` | Mock refund (returns `re_` ID) |
| `shopify_mock.py` | `ShopifyMockExecutor` | Mock reship (returns fulfillment + tracking) |
| `factory.py` | `create_executor()` | Routes action type to executor |

### Dashboard Updated
- `routes/dashboard.py`: Added `drafts_pending` count and `channels` breakdown (email/chat/other)

### Seed Data
- 6 tickets (was 5): added chat channel ticket + shadow mode draft ticket
- 16 audit entries (was 13): includes `shadow_draft`, `channel_inbound` events
- Mock executor result in audit descriptions

---

## 3. Frontend

### New Pages
| Page | Path | Purpose |
|------|------|---------|
| `app/channels/page.tsx` | `/channels` | Email simulator with templates + chat widget link |
| `app/chat/page.tsx` | `/chat` | Customer-facing chat widget with pre-chat form + polling |

### Modified Pages
| Page | Changes |
|------|---------|
| `app/tickets/[id]/page.tsx` | Shadow mode draft UI (dashed amber border, DRAFT badge, Approve/Edit/Reject buttons, edit textarea, shadow mode toggle checkbox) |
| `app/page.tsx` | Second stat row with Drafts Pending, Email/Chat ticket counts |
| `app/sidebar.tsx` | Added Channels + Live Chat nav items |

---

## 4. Tests

### API Verification
| Test | Result |
|------|--------|
| `POST /demo/reset` | 6 tickets, 3 policies, 16 audit entries |
| `GET /dashboard` | Returns `drafts_pending: 1`, `channels: {email: 4, chat: 2}` |
| `POST /channels/email/inbound` (new) | Creates ticket, returns `action: "created"` |
| `POST /channels/email/inbound` (thread) | Threads into existing ticket, returns `action: "threaded"` |
| `POST /channels/chat/start` | Creates ticket + first message |
| `GET /channels/chat/{id}/messages` | Returns only `visible_to_customer=true` messages |
| Shadow mode draft in seed | `is_draft=true, visible_to_customer=false` verified |
| `POST /tickets/{id}/messages/{msg_id}/approve` | Draft becomes `is_draft=false, visible_to_customer=true` |
| `next build` | All pages compile cleanly |

---

## 5. What Was NOT Built
- Real Stripe/Shopify API calls (mocks only — real integrations in Phase 1)
- WebSocket for real-time chat (polling at 3s for now)
- Email sending (outbound — only inbound simulation)
- Authentication/authorization

---

## 6. How to Test Manually

```bash
# Reset demo data
curl -X POST http://localhost:3101/demo/reset

# Dashboard with channel stats
open http://localhost:3100

# Ticket with shadow draft (ticket 3 — "Wrong size")
open http://localhost:3100/tickets  # click the pending ticket

# Email simulator
open http://localhost:3100/channels

# Chat widget
open http://localhost:3100/chat

# Email inbound API
curl -X POST http://localhost:3101/channels/email/inbound \
  -H "Content-Type: application/json" \
  -d '{"from_email":"test@example.com","subject":"Need help","body":"Hello!"}'

# Chat API
curl -X POST http://localhost:3101/channels/chat/start \
  -H "Content-Type: application/json" \
  -d '{"customer_email":"user@test.com","message":"Hi, need help"}'
```
