# ResolveOps — Product Manager Testing Plan

## Purpose

Step-by-step test scripts for validating every user-facing flow. A PM or QA person should be able to follow these scripts without reading code. Each script has clear acceptance criteria.

---

## Test Environment Setup

1. Start the dev server: `npm run dev` (web on port 3100)
2. Start the API: `cd apps/api && python main.py` (API on port 3101)
3. Ensure Docker is running: `docker-compose up -d` (Postgres 5436, Redis 6380)
4. Open browser: `http://localhost:3100`
5. Expected: dark-mode login page renders, no console errors

---

## Script 1: New Client Onboarding

### Steps
1. Click "Start Free Pilot" or "Sign Up"
2. Enter company name: "TestStore Inc."
3. Enter admin email and password
4. Expected: account created, redirected to onboarding wizard

### Step 1 — Connect Channels
5. See grid of channel tiles: Email, Zendesk, Intercom, WhatsApp, Shopify, Stripe
6. Click "Connect" on Email → enter IMAP/SMTP credentials or OAuth
7. Expected: green checkmark appears on Email tile
8. Click "Connect" on Shopify → OAuth flow → authorize
9. Expected: green checkmark on Shopify tile, store name displayed
10. Click "Next"

### Step 2 — Set Policies
11. See policy configuration form
12. Set refund auto-approve cap: $50
13. Set refund approval-required cap: $200
14. Set refund block threshold: > $200
15. Set reship: auto if tracking shows delayed > 5 days
16. Set brand voice: "Professional"
17. Click "Next"

### Step 3 — Go Live
18. See summary card: connected channels, policy rules, estimated AI coverage
19. Click "Activate ResolveOps"
20. Expected: redirected to executive dashboard with "Shadow Mode Active" banner

### Acceptance Criteria
- [ ] All 3 steps complete without errors
- [ ] Total onboarding time < 15 minutes (manual steps)
- [ ] Dashboard shows connected channels and policy summary
- [ ] Shadow mode is active (not auto-resolving yet)

---

## Script 2: Shadow Mode — AI Draft Review

### Steps
1. Send a test email to the connected email address: "Hi, I'd like a refund for order #TEST-001. The product arrived damaged."
2. Wait 30 seconds
3. Open the HITL Console (Escalation tab on dashboard)
4. Expected: ticket appears with:
   - Customer name/email
   - Order details (fetched from Shopify)
   - AI-generated draft response
   - Confidence score (e.g., 85%)
   - Proposed action: "Refund $29.99 — auto-approve eligible"
5. Click "Approve" on the draft response
6. Expected: response sent to customer's email, ticket marked "Resolved"
7. Check audit log: full decision chain visible (ticket received → order lookup → policy check → draft generated → human approved → response sent → refund processed)

### Acceptance Criteria
- [ ] Ticket appears within 60 seconds
- [ ] AI draft is relevant and professional
- [ ] Order data correctly fetched from Shopify
- [ ] Policy correctly identified refund as auto-approve eligible
- [ ] Audit log shows complete chain
- [ ] Customer receives response email

---

## Script 3: Approval-Required Action

### Steps
1. Send test email: "I want a full refund for order #TEST-002" (order value: $150)
2. Open HITL Console
3. Expected: ticket shows "Approval Required" badge (exceeds $50 auto-approve cap)
4. AI draft shows: "Refund $150 — requires approval"
5. Click "Approve Refund"
6. Expected: refund processed, response sent, audit log shows approval
7. Alternatively, click "Deny" → expected: ticket escalated, no refund processed

### Acceptance Criteria
- [ ] $150 refund correctly flagged as approval-required (not auto-approved)
- [ ] Approval flow works
- [ ] Denial flow works (no refund executed)
- [ ] Audit log shows approval/denial decision

---

## Script 4: Blocked Action

### Steps
1. Send test email: "Refund my order #TEST-003 immediately" (order value: $500)
2. Open HITL Console
3. Expected: ticket shows "Blocked — Exceeds Policy Limit" in red
4. AI draft offers alternative: "We'd like to help. Let me connect you with a senior agent."
5. No refund button available (blocked by policy)

### Acceptance Criteria
- [ ] $500 refund correctly blocked
- [ ] No execution path available for blocked actions
- [ ] Appropriate response generated for customer
- [ ] Audit log shows block reason

---

## Script 5: Autopilot Mode

### Steps
1. Navigate to Settings → Automation Level
2. Switch from "Shadow Mode" to "Autopilot"
3. Expected: confirmation dialog — "AI will automatically resolve tickets within policy. Continue?"
4. Confirm
5. Send test email: "Where is my order #TEST-004?"
6. Wait 60 seconds
7. Expected: customer receives automatic response with tracking info
8. Dashboard shows: ticket resolved automatically, no human intervention
9. Audit log shows: full chain without approval step (auto-approved by policy)

### Acceptance Criteria
- [ ] Mode switch requires confirmation
- [ ] Auto-resolved tickets clearly tagged on dashboard
- [ ] Response quality matches shadow mode quality
- [ ] Audit trail complete even without human intervention

---

## Script 6: Executive Dashboard

### Steps
1. Navigate to main dashboard
2. Verify KPI cards display:
   - CSAT percentage with sparkline
   - Auto-resolve rate with sparkline
   - Average response time
   - Monthly savings estimate
3. Verify channel breakdown chart shows data per connected channel
4. Verify ticket volume chart shows AI-resolved vs human-resolved
5. Verify activity feed shows recent tickets with timestamps
6. Click on a resolved ticket → drill down to audit trail
7. Resize browser to mobile width → verify responsive layout

### Acceptance Criteria
- [ ] All KPI cards render with real or placeholder data
- [ ] Charts are interactive (hover shows values)
- [ ] Activity feed updates in near-real-time
- [ ] Drill-down to audit trail works
- [ ] Mobile layout is usable
- [ ] All elements are dark-mode (no white flashes)

---

## Script 7: Weekly Insights Report

### Steps
1. Navigate to Reports → Weekly Insights
2. Click "Generate Report" for the current week
3. Expected: report generates showing:
   - Ticket volume by day and channel
   - Top 5 ticket categories (auto-classified)
   - Resolution rate breakdown (AI vs human)
   - Customer sentiment trends
   - Revenue opportunities identified
   - Recommended policy adjustments
4. Click "Export PDF"
5. Expected: PDF downloads with all sections, dark-mode styling preserved

### Acceptance Criteria
- [ ] Report generates within 30 seconds
- [ ] All sections populated with data
- [ ] PDF export works and is readable
- [ ] Recommendations are actionable

---

## Script 8: Multi-Channel Test

### Steps
1. Send test message via email: "Refund please for #TEST-005"
2. Send test message via chat widget: "Same issue, order #TEST-005"
3. Open HITL Console
4. Expected: both messages appear under the SAME customer profile (identity stitched)
5. Conversation thread shows both channels in a unified view
6. AI draft references both messages

### Acceptance Criteria
- [ ] Identity stitching works across email + chat
- [ ] Unified conversation view
- [ ] No duplicate tickets for same customer/issue

---

## Regression Checklist (Run After Every Deploy)

- [ ] Login works
- [ ] Dashboard loads without errors
- [ ] All KPI cards render
- [ ] Shadow mode flow works end-to-end
- [ ] Policy engine correctly applies caps
- [ ] Audit log records all actions
- [ ] No white-background elements (dark mode integrity)
- [ ] No console errors in browser
- [ ] API health endpoint returns 200
