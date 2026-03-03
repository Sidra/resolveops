# Task 01 — Full Project Scaffold

**Phase:** 0 — Prototype
**Date:** 2026-03-03
**Commit:** `feat: full project scaffold with apps, packages, and env config`
**Tests:** 0 total (0 new, 0 existing)
**Build:** All apps compile/start, health endpoints verified

---

## 2. What This Task Is About

### WHY

The repo had only docs and a `docker-compose.yml`. Before any feature work (LLM Gateway, Policy Engine, integrations), we need a working skeleton: runnable apps, package stubs, env configuration, and a dark-mode dashboard shell.

### WHAT

After this task, a developer can:
1. `docker-compose up -d` — Postgres + Redis start with healthchecks
2. `cd apps/api && python main.py` — API responds at `localhost:3101/health`
3. `cd apps/web && pnpm dev` — Dark dashboard at `localhost:3100`
4. Missing required env vars (JWT_SECRET, POSTGRES_PASSWORD) crash startup with clear pydantic errors

### SCOPE

Scaffold only — no business logic, no database schema, no real LLM calls. All adapters are stubs that raise `NotImplementedError`.

---

## 3. Backend

### 3a. Dependencies Added

**apps/api/requirements.txt:**
- fastapi 0.115.8
- uvicorn[standard] 0.34.0
- pydantic-settings 2.7.1
- python-dotenv 1.0.1
- asyncpg 0.30.0
- redis 5.2.1

**apps/worker/requirements.txt:**
- fastapi 0.115.8
- uvicorn[standard] 0.34.0
- pydantic-settings 2.7.1
- python-dotenv 1.0.1
- redis 5.2.1

### 3b. New Services / Modules

| Module | Path | Purpose |
|--------|------|---------|
| API | `apps/api/` | FastAPI backend, port 3101 |
| Worker | `apps/worker/` | Background job runner stub, port 3102 |
| LLM Gateway | `packages/llm-gateway/` | Provider adapter pattern |
| Policy Engine | `packages/policy-engine/` | Stub (__init__.py only) |
| Integrations | `packages/integrations/` | Stub (__init__.py only) |

### 3c. New Routes / Endpoints

| Method | Path | Service | Response |
|--------|------|---------|----------|
| GET | `/health` | API | `{"status": "ok", "service": "api", "version": "0.1.0"}` |
| GET | `/health` | Worker | `{"status": "ok", "service": "worker", "version": "0.1.0"}` |

### 3d. Modified Backend Files

None (all new).

### 3e. Data Flows and State Machines

**LLM Gateway factory pattern:**
```
LLM_PROVIDER env var → factory.create_adapter() → GeminiAdapter | OpenAIAdapter | AnthropicAdapter
```

**Config loading:**
```
.env.local (project root) → python-dotenv → pydantic-settings BaseSettings → validated Settings object
```

---

## 4. Frontend

### 4a. New Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `apps/web/app/page.tsx` | Dashboard with stat cards and placeholder panels |

### 4b. New Components

| Component | Location | Description |
|-----------|----------|-------------|
| `RootLayout` | `app/layout.tsx` | Dark sidebar + top nav + main content area |
| `StatCard` | `app/page.tsx` (inline) | Metric display card |
| `PlaceholderCard` | `app/page.tsx` (inline) | Content placeholder panel |

### 4c. Modified Frontend Files

None (all new).

### 4d. Types and Interfaces

- `lib/env.ts` — zod schema for `NEXT_PUBLIC_API_URL` env validation

---

## 5. Database

### 5a. New Tables

None. Database schema deferred to future tasks.

### 5b. Schema Changes

None.

### 5c. Migrations

None.

---

## 6. Tests

### 6a. Per-Test Documentation

No automated tests in this task. Manual verification only.

### 6b. Test Summary Table

| File | Tests | What it covers |
|------|-------|---------------|
| — | 0 | — |
| **Total** | **0** | |

### 6c. Test Output

N/A.

---

## 7. What Was NOT Built (Deferred)

- **shadcn/ui components** — Will be added incrementally as UI features are built. The dark color system is in place.
- **Real LLM adapter implementations** — All three adapters (Gemini, OpenAI, Anthropic) are stubs. Gemini implementation is Task 02/03.
- **Database schema and migrations** — Postgres is running via Docker but no tables created yet.
- **Authentication** — JWT_SECRET is in env config but no auth middleware yet.
- **Worker job processing** — Worker has a health endpoint but no actual job queue integration.
- **Policy engine logic** — Stub package only.
- **Integration connectors** — Stub package only.

---

## 8. How to Test Manually

1. **Docker services:**
   ```bash
   docker-compose up -d
   docker-compose ps  # Both postgres and redis should be healthy
   ```

2. **API health:**
   ```bash
   cd apps/api
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   python main.py
   # In another terminal:
   curl http://localhost:3101/health
   # Expected: {"status":"ok","service":"api","version":"0.1.0"}
   ```

3. **Worker health:**
   ```bash
   cd apps/worker
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   python main.py
   # In another terminal:
   curl http://localhost:3102/health
   # Expected: {"status":"ok","service":"worker","version":"0.1.0"}
   ```

4. **Web dashboard:**
   ```bash
   cd apps/web
   pnpm install
   pnpm dev
   # Open http://localhost:3100 — dark dashboard with ResolveOps branding
   ```

5. **Env validation:**
   ```bash
   # Remove JWT_SECRET and POSTGRES_PASSWORD from .env.local
   cd apps/api && python main.py
   # Expected: pydantic ValidationError listing missing required fields
   ```

6. **LLM Gateway factory:**
   ```python
   from packages.llm_gateway import create_adapter
   adapter = create_adapter("gemini")
   print(adapter.provider_name)  # "gemini"
   ```
