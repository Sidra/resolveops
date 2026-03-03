# ResolveOps — Env Hygiene

## The Problem (Why .env Loading Always Breaks)

Root causes of env pain in every project:

1. **Multiple `.env` files with unclear precedence** — `.env`, `.env.local`, `.env.development`, `.env.production` — which one wins?
2. **Different behavior between Next.js and Python** — Next.js auto-loads `.env.local`, Python needs `python-dotenv`
3. **Shells not exporting variables** — `source .env` doesn't export; you need `export $(cat .env | xargs)`
4. **Missing variables silently default** — app starts but behaves wrong because a key is empty
5. **Secrets committed to git** — someone adds a real key to `.env` and pushes

## The Fix (Do This Once, Stop Bleeding Time)

### Rule 1: One Template, One Override

- **`.env.example`** — committed to git. Template with all variable names + safe defaults. Never contains real secrets.
- **`.env.local`** — gitignored. Developer fills in real values. This is the ONLY override file.
- **No other `.env` files.** No `.env.development`, no `.env.staging`, no `.env.production` in the repo.

### Rule 2: Validate at Startup (Fail Fast)

Every app validates its env variables on boot. Missing or invalid = crash immediately with a clear error.

**Node.js (Next.js web app) — use `envalid` or `zod`:**
```typescript
// apps/web/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  WEB_PORT: z.string().default('3100'),
  NEXT_PUBLIC_API_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
});

// This throws immediately if any var is missing/invalid
export const env = envSchema.parse(process.env);
```

**Python (FastAPI api + worker) — use `pydantic-settings`:**
```python
# apps/api/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    api_port: int = 3101
    postgres_db: str = "resolveops"
    postgres_user: str = "resolveops"
    postgres_password: str  # no default = required
    redis_url: str = "redis://localhost:6380"
    llm_provider: str = "gemini"  # openai | anthropic | gemini
    gemini_api_key: str = ""
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    jwt_secret: str  # no default = required

    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"

settings = Settings()
```

### Rule 3: Single Load Point

Each app loads env exactly once. No double-loading.

- **Next.js:** relies on Next's built-in env loading. Do NOT also import `dotenv`. Next automatically reads `.env.local`.
- **FastAPI/Worker:** load via `pydantic-settings` in `config.py` (which reads `.env.local`). Import `settings` everywhere — never call `os.getenv()` directly.
- **Docker Compose:** uses `env_file: .env.local` directive. Variables flow into containers.

### Rule 4: CI Validation

Add a CI step that compares `.env.example` keys against the validation schema:

```bash
# scripts/check-env.sh
#!/bin/bash
# Extract variable names from .env.example
EXPECTED=$(grep -v '^#' .env.example | grep '=' | cut -d= -f1 | sort)
# Compare against schema (implementation depends on framework)
# Fail CI if any key in .env.example is not in the schema
```

### Rule 5: Never Commit Secrets

The `.gitignore` handles this:
```gitignore
.env
.env.*
!.env.example
```

If someone accidentally commits a secret:
1. Rotate the secret immediately
2. Use `git filter-branch` or BFG Repo-Cleaner to remove from history
3. Force push (coordinate with team)

## Variable Precedence (Clear and Final)

| Priority | Source | Used By |
|----------|--------|---------|
| 1 (highest) | Shell environment variables | Everything |
| 2 | `.env.local` | Next.js auto-loads; Python via pydantic-settings |
| 3 | `.env.example` defaults | Only as fallback in validation schemas |

That's it. No other sources.

## Debugging Env Issues

```bash
# Print all resolved env vars for the API
cd apps/api && python -c "from config import settings; print(settings.model_dump_json(indent=2))"

# Print all NEXT_PUBLIC vars for the web app
env | grep NEXT_PUBLIC

# Verify which .env file Next.js is loading
# (Next.js prints this in dev mode stdout)
npm run dev 2>&1 | head -20
```
