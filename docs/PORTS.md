# ResolveOps — Ports Configuration

All ports are chosen to avoid conflicts with common defaults (3000, 5432, 6379, 8080, etc.).

---

## Port Assignments

| Service | Port | Default Conflict Avoided | Env Variable |
|---------|------|--------------------------|-------------|
| Web (Next.js dashboard) | **3100** | 3000 (default Next/React) | `WEB_PORT` |
| API (FastAPI) | **3101** | 8000 (default FastAPI/uvicorn) | `API_PORT` |
| Worker metrics/health | **3102** | — | `WORKER_PORT` |
| Webhook receiver | **3103** | — | `WEBHOOK_PORT` |
| Postgres (Docker) | **5436** | 5432 (default Postgres) | `POSTGRES_PORT` |
| Redis (Docker) | **6380** | 6379 (default Redis) | `REDIS_PORT` |
| pgAdmin (optional) | **5050** | 80/443 | `PGADMIN_PORT` |

## How Ports Are Configured

All ports are set via environment variables in `.env.local` (never hardcoded).

### Next.js (web)
```json
// package.json
"scripts": {
  "dev": "next dev -p ${WEB_PORT:-3100}"
}
```

### FastAPI (api)
```python
# apps/api/main.py
import os
port = int(os.getenv("API_PORT", "3101"))
uvicorn.run(app, host="0.0.0.0", port=port)
```

### Docker Compose
```yaml
services:
  postgres:
    ports:
      - "${POSTGRES_PORT:-5436}:5432"
  redis:
    ports:
      - "${REDIS_PORT:-6380}:6379"
```

## Checking for Conflicts

Before starting dev, verify no port collisions:

```bash
# Check if any assigned ports are already in use
for port in 3100 3101 3102 3103 5436 6380; do
  lsof -i :$port 2>/dev/null && echo "⚠️  Port $port is in use" || echo "✅ Port $port is free"
done
```

## Adding New Services

If you add a new service, pick from this reserved range and update this doc:

- **3104–3109**: reserved for future app services
- **5437–5439**: reserved for additional databases
- **6381–6383**: reserved for additional cache/queue instances
