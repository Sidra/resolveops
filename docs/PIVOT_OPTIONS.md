# ResolveOps — Pivot Options

## When to Use This Document

Reference this document when any Gate (A, B, C) fails, or when quarterly review reveals the current direction isn't working. Each pivot option leverages the core technology already built — nothing is wasted.

---

## Pivot 1: Vertical-Only Agency (DTC Subscriptions)

**Trigger:** Gate B fails — broad horizontal approach is too slow to onboard / too many edge cases.

**What changes:**
- Stop trying to serve all industries
- Go deep on DTC subscription brands (supplements, skincare, food/beverage)
- Pre-built playbooks for: cancel/save flows, subscription pause/skip, recurring billing disputes, "where's my order" for subscription shipments

**Why it works:**
- DTC subscriptions have predictable, repeatable ticket patterns (80% of tickets are 5 categories)
- Cancel/save flows are directly tied to revenue — easy to prove ROI
- Shopify + Recharge + Stripe covers 90% of the stack
- Smaller TAM but faster time-to-value and easier to dominate

**What we keep:** Policy engine, audit trails, LLM gateway, Shopify/Stripe integrations, dashboard
**What we drop:** Broad channel support (focus on email + chat only), generic onboarding

---

## Pivot 2: Policy Engine as Product (Sell Governance)

**Trigger:** Customers love the policy engine and audit trail but want to use their own AI/agents.

**What changes:**
- Extract the policy engine into a standalone product
- Sell it as middleware: "governance layer for any AI agent"
- Position: "We don't replace your AI — we make it safe to deploy"
- Pricing: per-decision or per-seat

**Why it works:**
- Every company deploying AI agents needs guardrails (caps, approvals, audit)
- No incumbent owns this layer yet (Sierra/Decagon build it internally, not as a product)
- Horizontal play: works for customer support, sales, HR, IT — any AI agent
- Lower go-to-market cost (developer-focused, self-serve)

**What we keep:** Policy engine, approval workflows, audit/replay, tool gating
**What we drop:** Channel integrations, LLM gateway, managed service model

---

## Pivot 3: Post-Purchase Ops OS

**Trigger:** Customers want us to handle more than just support — returns, chargebacks, reviews, logistics.

**What changes:**
- Expand from "support agency" to "post-purchase operations platform"
- Add: returns management, chargeback dispute automation, review generation, shipping intelligence
- Position: "Everything that happens after checkout — handled by AI"

**Why it works:**
- Post-purchase is where DTC brands bleed money (returns, chargebacks, poor reviews)
- Each module is directly tied to P&L impact (easy ROI proof)
- Natural expansion from support conversations (50%+ of tickets are post-purchase)
- Combines 4–5 separate tools into one

**What we keep:** Everything from the core product + add new modules
**What we drop:** Nothing — this is an expansion, not a pivot

---

## Pivot 4: VoC Intelligence Platform (Support → Product Intelligence)

**Trigger:** Gate C reveals that customers value the insights more than the resolution.

**What changes:**
- Reposition from "support agency" to "customer intelligence engine"
- Core product becomes: analyze every support conversation → generate product insights, bug reports, feature requests, friction maps
- Auto-create Jira/Linear issues with evidence trails
- Prioritized product roadmap based on actual customer pain

**Why it works:**
- Product teams are starved for real customer feedback (surveys are biased, analytics miss context)
- Support conversations are the richest source of product intelligence (and nobody mines them today)
- Lighter operational burden (don't need to resolve tickets, just analyze them)
- Can layer on top of existing support tools (Zendesk/Intercom/etc.) — complementary, not competitive

**What we keep:** LLM analysis, conversation processing, identity stitching, dashboard
**What we drop:** Channel integrations (use webhooks from existing tools), policy engine (not needed), managed service model

---

## Pivot 5: Revenue Recovery Agency (Support → Sales)

**Trigger:** The revenue/upsell signals from support conversations prove more valuable than cost savings.

**What changes:**
- Reposition from "cost center replacement" to "revenue recovery engine"
- Focus on: churn saves (cancel flow interception), upsell/cross-sell during support, win-back campaigns from churned customers, review generation from happy resolutions
- Pricing: revenue share on recovered/generated revenue

**Why it works:**
- Easier to sell "we'll make you money" than "we'll save you money"
- Revenue share pricing aligns incentives perfectly
- Churn save alone can be 10–25% revenue impact for subscription businesses
- Defensible: the more conversations we handle, the better our save/upsell models get

**What we keep:** Channel integrations, LLM gateway, policy engine, customer profiles
**What we drop:** Pure support resolution focus — everything reframes through revenue lens

---

## Decision Framework

When a gate fails, score each pivot option:

| Criteria | Weight | Score 1–5 |
|----------|--------|-----------|
| How much of existing tech carries over? | 25% | |
| How fast can we validate with existing customers? | 25% | |
| Market size and growth rate | 20% | |
| Competitive defensibility | 15% | |
| Team capability match | 15% | |

**Rule:** Pick the option with the highest weighted score. If two options tie, pick the one that's faster to validate.

**Timeline:** Pivot decision within 48 hours of gate failure. New MVP within 2 weeks.
