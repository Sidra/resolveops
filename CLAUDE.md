# ResolveOps — Claude Code Instructions (CLAUDE.md)

## Project Overview

ResolveOps is an AI-native customer ops agency platform. It replaces a startup's entire customer support department (ticketing + AI + labor) with a single managed operation.

## Critical Rules

1. **Dual theme.** Every page, component, and modal must look beautiful in both dark mode (#0B1220 base, #111A2E surface) and light mode. Default to dark. Both themes must be polished.
2. **No co-author sentence.** Git commits must NOT include "Co-authored-by" lines.
3. **Update docs after every task.** Update STATUS.md and write a build doc to `docs/build/phase-{N}/task-{NN}-{short-name}.md` following the template.
4. **Commit and push.** At the end of every task, actually run the git commit and push. Do not just output commands — execute them.
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

## End-of-Build Checklist

After every task, do ALL of the following:
1. **Test** — verify the build works (run the app, hit endpoints, check UI)
2. **Build doc** — write to `docs/build/phase-{N}/task-{NN}-{short-name}.md`
3. **Update STATUS.md** — mark completed items, update in-progress
4. **Update ROADMAP.md** — mark delivered items, add any newly discussed features
5. **Update PROMPTS.md** — if new prompts were written or missing ones found
6. **Update docs/whatsnext/** — if new features were discussed that aren't in roadmap
7. **Commit and push** — actually run the git commands
8. **Summary to user** — what was built, what to observe/test (with links), what's next

## Build Doc Format

Write a build doc following the template. Location: `docs/build/phase-{N}/task-{NN}-{short-name}.md`

Required sections:
1. Title and Metadata
2. What This Task Is About (WHY, WHAT, SCOPE)
3. Backend (dependencies, services, routes, data flows)
4. Frontend (pages, components, types)
5. Database (tables, schema changes, migrations)
6. Tests (per-test docs, summary table, output)
7. What Was NOT Built (deferred items)
8. How to Test Manually

## Auth Requirements (When Built)

- Provide test email and password for the developer
- Persistent sessions ("remember me" — computer should remember login)
- Show/hide password toggle on all password fields

## Git (End of Every Build)

Actually commit and push at end of every task. Never include `--co-author` or "Co-authored-by" in any commit.

## File Structure

```
resolveops/
  apps/
    web/          # Next.js dashboard (dark+light themes, port 3100)
    api/          # FastAPI (port 3101)
    worker/       # Background jobs (port 3102)
  packages/
    llm_gateway/  # Provider adapters (Gemini, OpenAI, Anthropic)
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
