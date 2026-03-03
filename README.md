# ResolveOps

**AI-native Customer Ops Agency** — replace your entire customer support department with a single AI-powered operation.

## What Is This

ResolveOps takes over your customer support end-to-end: ticketing, AI resolution, human escalation, and action execution (refunds, reships, account changes) — all governed by a policy engine with full audit trails.

Three balance sheet items become one. No ticketing system to manage. No AI tool to configure. No BPO team to hire.

## Quick Start

```bash
# 1. Clone
git clone git@github.com:YOUR_USERNAME/resolveops.git
cd resolveops

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your real values

# 3. Start infrastructure
docker-compose up -d  # Postgres (5436) + Redis (6380)

# 4. Start the API
cd apps/api
pip install -r requirements.txt
python main.py  # Runs on port 3101

# 5. Start the web dashboard
cd apps/web
npm install
npm run dev  # Runs on port 3100

# 6. Open dashboard
open http://localhost:3100
```

## Architecture

```
Channels (Email/Chat/SMS/WhatsApp/TikTok/Voice)
  → Webhook Receivers → Message Queue (Redis)
  → Conversation Router → Identity Stitcher
  → Policy Engine (rules + approvals)
  → LLM Gateway (Gemini/OpenAI/Anthropic)
  → Tool Executor (Shopify/Stripe/CRM)
  → Audit Logger (Postgres, append-only)
  → Executive Dashboard (Next.js, dark-mode)
```

## Tech Stack

- **Frontend:** Next.js (App Router) + Tailwind + shadcn/ui — dark mode only
- **Backend:** FastAPI (Python) — orchestration + APIs
- **Database:** Postgres + pgvector — knowledge + embeddings
- **Queue/Cache:** Redis
- **LLM:** Provider-agnostic gateway (Gemini 3.1 default, OpenAI/Anthropic available)
- **Observability:** OpenTelemetry + structured logs

## Ports

| Service | Port |
|---------|------|
| Web (Next.js) | 3100 |
| API (FastAPI) | 3101 |
| Worker | 3102 |
| Webhooks | 3103 |
| Postgres | 5436 |
| Redis | 6380 |

See [docs/PORTS.md](docs/PORTS.md) for details.

## Docs

| Document | Description |
|----------|-------------|
| [PITCH.md](docs/PITCH.md) | One-pager pitch and positioning |
| [ROADMAP.md](docs/ROADMAP.md) | Product roadmap with stage gates |
| [PROMPTS.md](docs/PROMPTS.md) | Design and architecture image prompts |
| [PORTS.md](docs/PORTS.md) | Port assignments and conflict avoidance |
| [STATUS.md](docs/STATUS.md) | Current project status and next steps |
| [TECH_TESTING.md](docs/TECH_TESTING.md) | Technical testing plan |
| [PM_TESTING.md](docs/PM_TESTING.md) | Product manager test scripts |
| [PIVOT_OPTIONS.md](docs/PIVOT_OPTIONS.md) | Alternative directions if gates fail |
| [ENV_HYGIENE.md](docs/ENV_HYGIENE.md) | Environment variable management |

## Build Docs

After every task, a build doc is written to `docs/build/phase-{N}/task-{NN}-{short-name}.md`. See the build doc template in the repo root for the required format.

## License

Proprietary. All rights reserved.
