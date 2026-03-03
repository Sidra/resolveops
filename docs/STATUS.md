# ResolveOps — Project Status

**Last updated:** 2026-03-03
**Current phase:** Phase 0 — Prototype (Week 1)
**Overall status:** 🟡 In Progress

---

## Current Milestone

**Phase 0 — Prototype (Weeks 1–2)**
Build the core proof: can we resolve tickets and execute actions safely with audit trails.

## Last Working Demo

**Available now.** Full loop with channels, shadow mode, and mock executors.
- Dashboard: http://localhost:3100 (channel stats, drafts pending)
- Tickets: http://localhost:3100/tickets (shadow mode drafts)
- Channels: http://localhost:3100/channels (email simulator)
- Chat: http://localhost:3100/chat (customer chat widget)
- Audit Log: http://localhost:3100/audit-log (new event types)

## KPIs (will populate once pilot begins)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Auto-resolve rate | > 40% (Phase 1) | — | Not started |
| Escalation rate | < 60% (Phase 1) | — | Not started |
| Median time-to-first-response | < 5 min | — | Not started |
| Cost per resolution vs baseline | 30%+ below | — | Not started |
| Onboarding time | < 3 days | — | Not started |
| CSAT | > 90% | — | Not started |

## Completed

- [x] Project scaffolding and docs set
- [x] Repo structure defined
- [x] Port assignments configured (non-conflicting)
- [x] Env hygiene strategy documented
- [x] Roadmap with stage gates
- [x] Build doc template integrated
- [x] **Task 01:** Full project scaffold — Next.js dashboard, FastAPI API + worker, LLM Gateway adapter stubs, env files, .gitignore
- [x] Next.js dark-mode dashboard scaffold (port 3100, Tailwind v4, zod env validation)
- [x] FastAPI core + health endpoint (port 3101, pydantic-settings config)
- [x] Worker stub with health endpoint (port 3102)
- [x] Postgres + pgvector setup (Docker, port 5436)
- [x] Redis setup (Docker, port 6380)
- [x] LLM Gateway — provider adapter pattern (gemini/openai/anthropic stubs + factory)
- [x] Policy engine + integrations package stubs
- [x] **Task 02:** LLM Gateway with Gemini adapter — real complete + streaming, API endpoints, chat playground UI
- [x] Gemini adapter with google-genai SDK (complete + stream)
- [x] API endpoints: POST /llm/complete, POST /llm/stream (SSE)
- [x] Chat playground page at /playground with streaming UI
- [x] Dual theme support (dark + light CSS variables)
- [x] Renamed llm-gateway → llm_gateway for Python import compatibility
- [x] **Task 03:** Database schema + migrations + audit log
- [x] SQLAlchemy async ORM + Alembic migrations (5 tables: tickets, messages, actions, audit_log, policies)
- [x] pgvector extension enabled
- [x] Seed data (3 policies, 1 ticket, 4 messages, 1 action, 5 audit entries)
- [x] Audit log API (GET/POST /audit-log with pagination + filters)
- [x] Health endpoint upgraded with DB status check
- [x] Audit log frontend page (table, color-coded badges, filter, pagination, dual-theme)
- [x] Sidebar audit log link active
- [x] **Task 04:** Demo dashboard, tickets + AI resolution
- [x] Live dashboard with real stats (open tickets, resolved today, auto-resolve rate, pending actions, activity feed)
- [x] Tickets list page with status/priority badges, channel icons, status filter, create ticket form
- [x] Ticket detail page with conversation thread, AI Respond, Process Action, Resolve
- [x] Policy engine (inline) — auto-approve under $50, require approval $50-200, manual review over $200
- [x] Active sidebar navigation with highlight
- [x] Playground: stop button + ResolveOps system prompt
- [x] Enriched seed data (5 tickets, 13 audit entries)
- [x] `suppressHydrationWarning` for Dark Reader compat
- [x] Duplicate action prevention (409 if same action type already pending/executed)
- [x] Action approval flow — Approve/Reject buttons on pending actions
- [x] Approve/Reject API endpoints (`POST /tickets/{id}/actions/{action_id}/approve|reject`)
- [x] Resolved ticket banner + conditional action bar
- [x] Playground: Stop button for streaming + ResolveOps system prompt
- [x] **Task 05:** Channels, Shadow Mode, Mock Executors
- [x] Email inbound channel with thread detection (`POST /channels/email/inbound`)
- [x] Live chat channel (start, message, poll with `visible_to_customer` filter)
- [x] Shadow mode: AI drafts → human approves/edits/rejects
- [x] Mock action executors (Stripe refund `re_` IDs, Shopify reship with fulfillment + tracking)
- [x] Executor factory pattern matching LLM Gateway adapters
- [x] Dashboard: channel breakdown (email/chat), drafts pending count
- [x] Channels page (email simulator with templates + chat widget link)
- [x] Customer chat widget with pre-chat form + 3s polling
- [x] Shadow mode UI: dashed amber draft badge, Approve & Send / Edit & Send / Reject
- [x] Shadow mode toggle checkbox on ticket detail
- [x] Seed data: 6 tickets (shadow draft + chat), 16 audit entries, mock executor results
- [x] New EventTypes: shadow_draft, shadow_approved, shadow_rejected, shadow_edited, channel_inbound
- [x] Alembic migration for `messages.is_draft` + `messages.visible_to_customer`

## In Progress

- [ ] Phase 0 Gate A review

## Blocked

Nothing currently blocked.

## Known Risks + Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| LLM hallucination on money-moving actions | High | Medium | Policy engine + tool gating + human approval for high-risk |
| Channel integration complexity | Medium | Medium | Start email-only, expand channels incrementally |
| Margin pressure before AI reaches 60%+ auto-resolve | High | Medium | Price pilots conservatively, track margin per client weekly |
| Single-provider LLM dependency | Medium | Low | LLM Gateway with adapters for OpenAI/Anthropic/Gemini |
| Env loading issues across Next.js / Python | Low | High | Centralized env validation (envalid + pydantic-settings) |

## Next 7 Days Plan

1. **Day 1–2:** Scaffold Next.js app (dark-mode, dashboard layout, auth stub), FastAPI app (health, config), Docker Compose (Postgres + Redis)
2. **Day 3–4:** LLM Gateway with Gemini 3.1 adapter (local dev default), OpenAI/Anthropic adapters stubbed
3. **Day 5–6:** Policy engine v1 (rules, caps, approvals), audit log table + API
4. **Day 7:** First integration test: receive mock ticket → route → LLM draft → policy check → mock action → audit log → dashboard display

## Gate A Check-In

**Due:** End of Week 2
**Criteria:** Safe refund/reship execution with audit trails
**Current confidence:** Very High — all Phase 0 deliverables complete:
- Email + chat channels working
- Shadow mode (AI drafts, human approves) end-to-end
- Mock Stripe refund + Shopify reship executors
- Full audit trail with new event types
- Dashboard with channel stats + drafts pending
