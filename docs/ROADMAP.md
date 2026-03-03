# ResolveOps — Product Roadmap

## Guiding Principle

Every phase has a **kill/pivot gate**. If metrics miss targets, we don't push forward — we replan. This roadmap is a living document updated after every build cycle.

---

## Phase 0 — Prototype (Week 1–2)

**Goal:** Prove we can resolve tickets and execute actions safely with audit trails.

### Deliverables
- ~~Project scaffold~~ **DONE (Task 01)** — Next.js + FastAPI + Worker + LLM Gateway stubs + env config
- ~~LLM Gateway with Gemini adapter~~ **DONE (Task 02)** — Real Gemini complete + streaming, API endpoints, chat playground
- ~~Database schema + migrations + audit log~~ **DONE (Task 03)** — 5 tables, Alembic migrations, audit CRUD API, audit log frontend
- ~~Demo dashboard + tickets + AI resolution~~ **DONE (Task 04)** — Live stats, ticket CRUD, AI respond, policy-gated actions, full demo loop
- Connect 2 channels (email + chat widget)
- Implement 2 write actions (refund + reship via Shopify/Stripe)
- Policy engine v1: caps, approvals, audit log
- Executive dashboard with live metrics (dark + light themes)
- Shadow mode: AI drafts responses, human approves

### Success Metrics
- Can execute a refund with full audit trail
- Dashboard renders live ticket data
- Shadow mode approval flow works end-to-end

### Gate A (End of Week 2)
- **PASS:** Safe refund/reship execution with audit trails working → proceed to Phase 1
- **FAIL:** Cannot safely execute money-moving actions → pause and re-scope to "draft + approve" only (no auto-execution)
- **PIVOT:** If channel integration proves too slow, pivot to email-only MVP

---

## Phase 1 — Pilot (Weeks 3–8, Customers 1–4)

**Goal:** Validate outcomes and onboarding speed with real paying customers.

### Deliverables
- Onboarding wizard: connect channels + commerce + knowledge base
- Identity stitching (same customer across channels)
- HITL orchestration: confidence-based escalation with AI-generated TL;DR
- Policy engine v1.5: branded response templates, escalation rules
- Weekly insights report (auto-generated)
- Backlog Rescue Pilot package (fixed-fee, KPI-targeted)

### Success Metrics (per customer)
- Median time-to-first-response: < 5 minutes
- AI auto-resolution rate: > 40% by week 2
- Escalation rate: < 60% by week 2
- Cost per resolution: 30%+ below customer's baseline
- Onboarding time: < 3 days

### Gate B (After Customer #4)
- **PASS:** Onboarding < 7 days, escalation rate drops below 60% after week 2 → proceed to Phase 2
- **FAIL:** Onboarding consistently > 7 days OR escalations remain > 70% → **pivot to one vertical** (DTC subscriptions) and ship deeper actions instead of broader channels
- **REPLAN:** If customers love the dashboard/insights but not the resolution quality → pivot to "VoC intelligence platform" positioning

---

## Phase 2 — Repeatable Motion (Months 3–6, Customers 5–20)

**Goal:** Standard playbooks, predictable margins, vertical specialization.

### Deliverables
- Vertical playbooks: DTC e-commerce, consumer health, SaaS
- Proactive prevention: shipping delay alerts, known-incident blasts
- Omnichannel expansion: SMS, WhatsApp, TikTok, Facebook, voice
- VoC insights: auto Jira/Linear issues + prioritized roadmap
- Knowledge base auto-updater (with approval workflow)
- Brand voice profiles

### Success Metrics
- 20+ active clients
- AI auto-resolution rate: > 60%
- Gross margin: > 50% (improving with scale)
- NPS from client founders: > 60
- $500K–$1M ARR

### Gate C (After Customer #10)
- **PASS:** Margins improve as volume increases → proceed to Phase 3
- **FAIL:** Margins flat or declining → invest in: (a) better policy gating + action automation, (b) prune channel scope to highest-ROI channels, (c) stronger eval/regression testing
- **PIVOT:** If vertical playbooks dramatically outperform horizontal → go vertical-only

---

## Phase 3 — Platform (Months 6–18)

**Goal:** Turn service learnings into scalable product modules. Path to Series A.

### Deliverables
- Revenue Growth AI: churn save + contextual upsell
- Customer DNA Engine: deep profiles from every touchpoint
- Automation Studio: visual workflow builder
- Self-serve tier for micro-startups (< $1M revenue, $499/mo flat)
- Partner marketplace: Shopify, Square, Toast, etc.
- Compliance-grade audit & replay (enterprise readiness)

### Success Metrics
- 100+ active clients
- $5M–$10M ARR
- AI auto-resolution rate: > 75%
- Gross margin: > 65%
- Series A at $50M–$80M valuation

---

## Phase 4 — Scale (Months 18–36)

**Goal:** Category leadership. Path to unicorn.

### Deliverables
- Enterprise SMB divisions + white-label offering
- International expansion (EU, APAC)
- Autonomous Ops Platform: support + sales ops + order management + fulfillment
- Voice AI agents (production-grade)
- Self-healing policy & playbook learning
- Bug reporting + roadmap intelligence for product teams

### Success Metrics
- $30M–$50M ARR
- Series B
- Path to unicorn valuation

---

## Quarterly Review Cadence

Every quarter:
1. Review gate metrics against targets
2. Update this roadmap
3. Decide: proceed / replan / pivot
4. Update STATUS.md and PIVOT_OPTIONS.md accordingly
