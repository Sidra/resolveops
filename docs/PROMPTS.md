# ResolveOps — Design & Architecture Prompts

Use these prompts in GPT-4o, Gemini 3.1 Pro, Nano Banana 2 / Gemini Flash Image, Midjourney, or any design-to-image model.

---

## 1. End-to-End Product Storyboard (UI + User Journey)

> **Prompt:**
> "Create a dark-mode-only end-to-end product storyboard for an AI-native customer support agency platform called ResolveOps. Show 8 frames:
> (1) Landing page with 'Backlog Rescue Pilot' hero CTA, dark background #0B1220, ember orange #FF6B35 accents
> (2) Onboarding wizard: connect channels (email/chat/WhatsApp/TikTok) + commerce (Shopify/Stripe) — 3-step flow
> (3) Policy engine setup: refund caps, approval thresholds, escalation rules — clean form UI
> (4) Shadow mode inbox: AI draft responses with 'Approve / Edit / Escalate' buttons, confidence scores
> (5) Autopilot mode: ticket feed showing 'Resolved automatically' tags in green, 'Escalated' in amber
> (6) Escalation console for AI engineer: conversation TL;DR, customer history, suggested actions
> (7) Executive dashboard: KPI cards (CSAT 94%, Auto-resolve 68%, Backlog 0, Monthly savings $12K), sparkline charts
> (8) Audit & replay screen: timeline of tool calls, policy decisions, LLM reasoning traces
> Style: premium technical, minimal, high-trust. Dark background #0B1220, surface #111A2E, primary indigo #6366F1, success #10B981, warning #F59E0B, danger #EF4444. Crisp typography (Space Grotesk headlines, JetBrains Mono data). Subtle grain texture. No gradients. Thin borders."

### Variations prompt (for Nano Banana 2 / Gemini Flash Image):
> "Generate 3 variations of the above, keep layout consistent, change only typography density and accent color temperature (cool indigo vs warm orange vs neutral slate)."

---

## 2. Architecture Diagram

> **Prompt:**
> "Draw a clean, dark-mode architecture diagram for ResolveOps, an AI-native customer ops platform. Components:
>
> **Ingestion Layer:**
> Channels (Email, Chat, SMS, WhatsApp, TikTok, Voice) → Webhook Receivers → Message Queue (Redis)
>
> **Processing Layer:**
> Conversation Router → Identity Stitcher → Context Builder (customer history + order data)
>
> **Decision Layer:**
> Policy Engine (rules + caps + approvals) → LLM Gateway (OpenAI / Anthropic / Gemini adapters) → Confidence Scorer
>
> **Execution Layer:**
> Tool Executor (Shopify / Stripe / CRM write operations) → Audit Logger (append-only Postgres)
>
> **Human Layer:**
> HITL Console ↔ Conversation Router (escalation path)
> HITL Console ↔ Policy Engine (approval path)
>
> **Intelligence Layer:**
> Analytics Warehouse → VoC Engine → Revenue Signals → Executive Dashboard
>
> **Data Stores:**
> Postgres + pgvector (knowledge + embeddings), Redis (queues + cache)
>
> **Observability:**
> OpenTelemetry → tracing + structured logs
>
> Show clear arrows and labeled boundaries: 'Control Plane' (policy + approvals) vs 'Execution Plane' (tools + actions).
> Dark background #0B1220, modern minimal vector style, clean labels, no decorative elements."

---

## 3. Executive Dashboard Mockup

> **Prompt:**
> "Design a dark-mode executive dashboard for ResolveOps. Single screen showing:
> - Top row: 4 KPI cards (CSAT %, Auto-resolve rate %, Avg response time, Monthly savings $)
> - Each card has a sparkline trend and green/red delta vs previous period
> - Middle: Channel breakdown bar chart (Email, Chat, WhatsApp, SMS, Social, Voice) with resolution rates
> - Bottom left: Ticket volume line chart (7-day view, AI-resolved vs human-resolved stacked)
> - Bottom right: Recent activity feed (ticket resolved, escalated, policy triggered — with timestamps)
> - Background: #0B1220, cards: #111A2E with 1px #1E293B borders
> - Accent: indigo #6366F1, success: #10B981, text: #E5E7EB
> - Typography: Space Grotesk for labels, JetBrains Mono for numbers
> - No sidebar — top nav with ResolveOps logo + client switcher dropdown"

---

## 4. Onboarding Flow Mockup

> **Prompt:**
> "Design a 3-step dark-mode onboarding wizard for ResolveOps:
> Step 1 — 'Connect Your Channels': grid of channel tiles (Email, Zendesk, Intercom, WhatsApp, Shopify, Stripe) with OAuth connect buttons, green checkmarks when connected
> Step 2 — 'Set Your Policies': form with refund cap ($), auto-approve threshold, escalation rules, brand voice selector (Professional / Friendly / Casual)
> Step 3 — 'Go Live': summary card showing connected channels, policy rules, estimated AI coverage %, with a large 'Activate ResolveOps' button
> Progress bar at top showing steps 1/2/3. Dark background #0B1220, clean forms, indigo accents, minimal."

---

## 5. Policy Engine & Audit Trail

> **Prompt:**
> "Design a dark-mode policy engine configuration screen and audit replay view for ResolveOps:
> Left panel: Policy rules list (Refund cap: $50 auto / $200 approval required / >$200 block, Reship: auto if tracking shows delayed >5 days, Cancel subscription: require reason + offer save)
> Right panel: Audit replay timeline for a specific ticket — vertical timeline showing: (1) Ticket received via WhatsApp, (2) Identity matched to customer #4521, (3) Policy checked: refund $35 — auto-approved, (4) LLM generated response, (5) Shopify refund API called — success, (6) Response sent to customer, (7) CSAT: 5/5
> Each timeline node shows the decision path and data inputs.
> Dark background, indigo accents, monospace for IDs and amounts, green for success states."

---

## 6. Competitive Positioning Visual

> **Prompt:**
> "Create a dark-mode competitive landscape diagram for ResolveOps. 2x2 matrix:
> X-axis: 'Software Tool' ← → 'Managed Outcome'
> Y-axis: 'Startup/SMB' ← → 'Enterprise'
> Position these companies: Sierra (top-left, enterprise + tool), Decagon (middle-left, mid-market + tool), Intercom Fin (bottom-left, SMB + tool), Parloa (top-left, enterprise + tool), Traditional BPO (top-right, enterprise + managed), ResolveOps (bottom-right, SMB + managed outcome — highlighted with glow)
> ResolveOps should have a distinctive marker and label: 'AI-native agency — outcome ownership'
> Dark background, clean grid lines, company logos as simple text labels, indigo and orange accents."

---

## Notes on Model Selection for Image Generation

| Model | Best For | Speed | Quality |
|-------|----------|-------|---------|
| GPT-4o (DALL-E 3) | Storyboards, mockups | Medium | High |
| Gemini 3.1 Pro | Complex diagrams, architecture | Medium | High |
| Nano Banana 2 / Gemini Flash Image | Fast iteration, variations | Fast | Medium-High |
| Midjourney v6 | Polished marketing visuals | Slow | Highest |

**Recommendation:** Use Gemini Flash Image for rapid iteration (3 variations), then refine the best one in GPT-4o or Midjourney for final assets.
