# ResolveOps — Claude Code Instructions (CLAUDE.md)

## Project Overview

ResolveOps is an AI-native customer ops agency platform. It replaces a startup's entire customer support department (ticketing + AI + labor) with a single managed operation.

## Critical Rules

1. **Dark mode only.** Every page, component, and modal must use dark backgrounds (#0B1220 base, #111A2E surface). No light mode. No white backgrounds. Ever.
2. **No co-author sentence.** Git commits must NOT include "Co-authored-by" lines.
3. **Update docs after every task.** Update STATUS.md and write a build doc to `docs/build/phase-{N}/task-{NN}-{short-name}.md` following the template.
4. **Return git commands.** At the end of every task, output the exact git commands the developer should run in zsh. Do not run them — the developer runs them manually.
5. **Env hygiene.** Never hardcode secrets. Always use env variables. Validate at startup.
6. **Port discipline.** Use the ports in docs/PORTS.md. Never use 3000, 5432, 6379, 8000, or 8080.

## Tech Stack

- Frontend: Next.js (App Router) + Tailwind + shadcn/ui
- Backend: FastAPI (Python)
- Database: Postgres + pgvector (port 5436)
- Queue: Redis (port 6380)
- LLM: Provider-agnostic gateway (Gemini 3.1 default for local dev)

## LLM Provider Config

Default to Gemini 3.1 for local development. OpenAI and Anthropic are available as alternatives. The LLM_PROVIDER env var controls which adapter is used. All three must remain functional.

## Build Doc Format

After every task, write a build doc following the template in the uploaded BUILD_DOC_TEMPLATE.md. Location: `docs/build/phase-{N}/task-{NN}-{short-name}.md`

Required sections:
1. Title and Metadata
2. What This Task Is About (WHY, WHAT, SCOPE)
3. Backend (dependencies, services, routes, data flows)
4. Frontend (pages, components, types)
5. Database (tables, schema changes, migrations)
6. Tests (per-test docs, summary table, output)
7. What Was NOT Built (deferred items)
8. How to Test Manually

## Git Commands (End of Every Build)

Always output these at the end of every task:

```zsh
git status
git add -A
git commit -m "feat: short description of what was built"
git push

# Then the build doc commit:
git add docs/
git commit -m "docs: build doc for Task N — short description"
git push
```

Never include `--co-author` or "Co-authored-by" in any commit.

## File Structure

```
resolveops/
  apps/
    web/          # Next.js dashboard (dark-only, port 3100)
    api/          # FastAPI (port 3101)
    worker/       # Background jobs (port 3102)
  packages/
    llm-gateway/  # Provider adapters
    policy-engine/ # Rules, approvals, audit
    integrations/ # Channel + commerce connectors
  docs/
    build/        # Build docs per task
    PITCH.md
    ROADMAP.md
    PROMPTS.md
    PORTS.md
    STATUS.md
    TECH_TESTING.md
    PM_TESTING.md
    PIVOT_OPTIONS.md
    ENV_HYGIENE.md
  .env.example
  .gitignore
  README.md
  CLAUDE.md
```
