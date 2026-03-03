# ResolveOps — Technical Testing Plan

## Testing Philosophy

Every action that touches money, customer data, or external systems must be tested. No exceptions. Tests are a first-class deliverable alongside code.

---

## 1. Unit Tests

### Policy Engine
- **Cap enforcement:** refund $49 with $50 cap → auto-approved; refund $51 → requires approval; refund $201 with $200 block → rejected
- **Approval routing:** low-risk actions → auto; medium-risk → queue for review; high-risk → block + alert
- **Rule composition:** multiple rules on same action type resolve correctly (most restrictive wins)
- **Edge cases:** zero-dollar refund, negative amounts, currency mismatches, missing customer ID

### LLM Gateway
- **Provider switching:** config change from `gemini` to `openai` to `anthropic` produces valid responses
- **Timeout handling:** provider takes > 10s → graceful fallback message
- **Token limit enforcement:** responses truncated correctly
- **Adapter isolation:** one provider failing doesn't affect others

### Identity Stitcher
- **Same email across channels:** correctly merges into single customer profile
- **Phone + email match:** correctly links
- **No match:** creates new profile, doesn't merge incorrectly
- **Duplicate detection:** near-duplicates flagged, not auto-merged

### Conversation Router
- **Channel detection:** email, chat, SMS, WhatsApp, TikTok messages correctly identified
- **Priority scoring:** VIP customers, repeat contacts, high-value orders prioritized
- **Confidence-based routing:** high confidence → auto-resolve; low → escalate

## 2. Integration Tests

### Shopify Integration
- **Refund:** submit refund → verify order status changed in Shopify → verify audit log entry
- **Reship:** create new fulfillment → verify tracking number generated → verify customer notified
- **Order lookup:** fetch order by ID, by email, by phone — all return correct data
- **Error handling:** invalid order ID → graceful error; Shopify API down → retry + escalate

### Stripe Integration
- **Refund:** process refund → verify charge status → verify balance impact → audit log
- **Partial refund:** $30 of $100 charge → verify remaining balance correct
- **Subscription cancel:** cancel sub → verify status → verify proration
- **Error handling:** insufficient balance, already refunded, expired charge

### Channel Integrations (per channel)
- **Inbound:** message received → correctly parsed → ticket created → routed
- **Outbound:** response generated → correctly formatted for channel → delivered
- **Attachments:** images, files handled correctly per channel's constraints
- **Rate limits:** channel API rate limit hit → queued, not dropped

## 3. End-to-End Tests

### Happy Path
1. Customer sends email: "I want a refund for order #1234"
2. System identifies customer, fetches order
3. Policy engine checks: refund $35, cap $50 → auto-approved
4. Shopify refund API called → success
5. Response generated and sent to customer
6. Audit log records full decision chain
7. Dashboard updates: +1 resolved, CSAT collected

### Escalation Path
1. Customer sends chat: "Your product gave me a rash, I want a full refund and compensation"
2. System identifies as high-risk (health claim + compensation request)
3. Policy engine: exceeds auto-approve threshold → escalate
4. AI generates TL;DR + suggested response for human review
5. Human approves modified response + refund
6. Actions executed, audit logged

### Shadow Mode
1. Ticket received
2. AI generates draft response + proposed actions
3. Draft appears in HITL console with confidence score
4. Human can: approve as-is, edit, reject, or escalate
5. Only approved responses are sent
6. System learns from human edits

## 4. Load Tests

| Scenario | Target | Measurement |
|----------|--------|-------------|
| Concurrent tickets (steady state) | 100 tickets/min | P95 response time < 10s |
| Burst (BFCM simulation) | 500 tickets/min for 5 min | No dropped tickets, P95 < 30s |
| Multi-channel simultaneous | 50/channel × 5 channels | All channels responsive |
| Dashboard under load | 10 concurrent dashboard users | Page load < 2s |

## 5. Security Tests

- **Hallucination containment:** LLM cannot execute actions not defined in tool registry
- **Tool gating:** every action must pass policy engine — no bypass path
- **Injection resistance:** customer messages containing prompt injection patterns → handled safely
- **Data isolation:** client A's data never visible to client B
- **Auth:** expired tokens rejected, API keys rotated, no secrets in logs
- **Audit immutability:** audit log entries cannot be modified or deleted

## 6. Regression Tests

After every deployment:
- Re-run all integration tests
- Re-run top 20 resolved ticket scenarios
- Verify policy engine rules haven't changed behavior
- Verify dashboard metrics match database queries

## 7. Test Infrastructure

- **Framework:** pytest (Python), vitest (TypeScript)
- **Mocks:** Mock Shopify/Stripe APIs for unit tests (httpx mock / msw)
- **Fixtures:** Standard test customers, orders, policies
- **CI:** Run full test suite on every PR, block merge if tests fail
- **Coverage target:** > 80% for policy engine, > 70% for integrations
