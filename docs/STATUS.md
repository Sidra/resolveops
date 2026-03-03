# ResolveOps — Project Status

**Last updated:** 2026-03-03
**Current phase:** Phase 0 — Prototype (Week 1)
**Overall status:** 🟡 In Progress

---

## Current Milestone

**Phase 0 — Prototype (Weeks 1–2)**
Build the core proof: can we resolve tickets and execute actions safely with audit trails?

## Last Working Demo

**Available now.** Full loop: Dashboard → Tickets → AI Respond → Policy Check → Action → Audit Log.
- Dashboard: http://localhost:3100
- Tickets: http://localhost:3100/tickets

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

## In Progress

- [ ] Channel integrations (email + chat widget)

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
**Current confidence:** High (full demo loop working end-to-end)
