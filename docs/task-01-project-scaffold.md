# Task 01 — Project Scaffold & Documentation Foundation

**Phase:** 0 — Prototype
**Date:** 2026-03-02
**Commit:** `initial`
**Tests:** 0 total (0 new, 0 existing)
**Build:** Scaffold only — no runnable code yet

---

## 2. What This Task Is About

### WHY

Before writing a single line of application code, the project needs a solid foundation: directory structure, documentation, environment configuration, port assignments, and operational discipline (build docs, git workflow, env hygiene). Every ResolveOps build task after this one will follow the patterns established here.

This task also serves as the "decision record" — it captures the tech stack choices, roadmap with kill/pivot gates, competitive positioning, and design prompts so the founding team has a single source of truth.

### WHAT

From the developer's perspective: after this task, they can clone the repo, copy `.env.example` to `.env.local`, run `docker-compose up -d` to start Postgres and Redis, and have the full docs set available. The project structure is ready for Phase 0 application code.

From the founder's perspective: all strategic documents (pitch, roadmap, pivot options, testing plans) are committed and version-controlled alongside the code.

### SCOPE

This task covers scaffolding and documentation only. No application code, no running servers, no tests. The Next.js app, FastAPI server, LLM gateway, and policy engine are all deferred to subsequent tasks.

---

## 3. Backend

### 3a. Dependencies Added

None. Backend application code is deferred to Task 02.

### 3b. New Services / Modules

None.

### 3c. New Routes / Endpoints

None.

### 3d. Modified Backend Files

None.

### 3e. Data Flows and State Machines

N/A.

---

## 4. Frontend

### 4a. New Pages

None. Frontend application code is deferred to Task 02.

### 4b. New Components

None.

### 4c. Modified Frontend Files

None.

### 4d. Types and Interfaces

No new types.

---

## 5. Database

### 5a. New Tables

None. Database schema is deferred to Task 02.

### 5b. Schema Changes

None.

### 5c. Migrations

No changes.

---

## 6. Tests

### 6a. Per-Test Documentation

No tests in this task.

### 6b. Test Summary Table

| File | Tests | What it covers |
|------|-------|---------------|
| — | 0 | — |
| **Total** | **0** | |

### 6c. Test Output

N/A.

---

## 7. What Was NOT Built (Deferred)

- **Next.js application** — Deferred to Task 02. Will include dark-mode dashboard scaffold, auth stub, and executive command center layout.
- **FastAPI application** — Deferred to Task 02. Will include health endpoint, config module with pydantic-settings, and CORS setup.
- **LLM Gateway** — Deferred to Task 03. Will include Gemini 3.1 adapter (default for local dev), OpenAI adapter, Anthropic adapter.
- **Policy Engine** — Deferred to Task 04. Will include rules, caps, approvals, audit log.
- **Channel integrations** — Deferred to Task 05+. Will start with email + chat.
- **Commerce integrations** — Deferred to Task 05+. Will start with Shopify + Stripe.
- **Database schema and migrations** — Deferred to Task 02.
- **All tests** — Deferred to subsequent tasks.

---

## 8. How to Test Manually

1. Verify all docs exist:
   ```bash
   ls docs/
   # Expected: PITCH.md ROADMAP.md PROMPTS.md PORTS.md STATUS.md
   #           TECH_TESTING.md PM_TESTING.md PIVOT_OPTIONS.md ENV_HYGIENE.md
   #           build/
   ```

2. Verify env files:
   ```bash
   cat .env.example  # Should show all variable names with safe defaults
   cat .gitignore     # Should include .env.* exclusion (except .env.example)
   ```

3. Verify directory structure:
   ```bash
   ls apps/           # Expected: web/ api/ worker/
   ls packages/       # Expected: llm-gateway/ policy-engine/ integrations/
   ```

4. Verify Docker Compose:
   ```bash
   docker-compose config  # Should parse without errors
   ```

5. Verify port assignments match docs/PORTS.md:
   ```bash
   grep -E 'PORT' .env.example
   # Should show: 3100, 3101, 3102, 3103, 5436, 6380
   ```

---

## Git Commands (Run in zsh)

### First-time setup (create private repo via gh with SSH):

```zsh
cd resolveops
git init
git branch -M main
gh repo create resolveops --private --source=. --remote=origin --push
```

### Initial commit:

```zsh
git add -A
git commit -m "chore: initial scaffold with docs, env template, ports, and gitignore"
git push -u origin main
```

### Build doc commit:

```zsh
git add docs/build/
git commit -m "docs: build doc for Task 01 — project scaffold"
git push
```
