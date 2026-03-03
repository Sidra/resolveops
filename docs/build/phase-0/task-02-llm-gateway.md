# Task 02 — LLM Gateway with Gemini Adapter

**Phase:** 0 — Prototype
**Status:** Complete
**Date:** 2026-03-03

---

## What This Task Is About

**WHY:** The LLM Gateway had stub adapters that all raised `NotImplementedError`. To build any AI-powered feature, we need a working LLM connection.

**WHAT:** Implemented the Gemini adapter with real API calls (completion + streaming), added API endpoints to expose it, and built a chat playground in the dashboard.

**SCOPE:**
- Real Gemini adapter (complete + stream)
- API endpoints (`/llm/complete`, `/llm/stream` with SSE)
- Chat playground UI with streaming display
- Dual-theme support (dark + light CSS variables)
- Renamed `llm-gateway` → `llm_gateway` (Python import compatibility)

---

## Backend

### Dependencies Added
- `google-genai>=1.0.0` — Google GenAI Python SDK
- `sse-starlette>=2.0.0` — Server-Sent Events for FastAPI

### Services / Modules

**`packages/llm_gateway/gemini.py`** — Real Gemini adapter
- Constructor validates API key (fail-fast)
- `complete()` — sends prompt via `client.aio.models.generate_content`, returns full text
- `stream()` — async generator via `client.aio.models.generate_content_stream`, yields text chunks
- Configurable model via `GEMINI_MODEL` env var (default: `gemini-2.0-flash`)
- Temperature and max_tokens passed through kwargs

**`packages/llm_gateway/base.py`** — Added non-abstract `model_name` property (returns "unknown" by default, overridden in Gemini adapter)

**`packages/llm_gateway/factory.py`** — Passes `GEMINI_MODEL` env var to Gemini constructor

### Routes

**`apps/api/routes/llm.py`**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/llm/complete` | Full completion → `{text, provider, model}` |
| POST | `/llm/stream` | SSE streaming → `data: {"chunk": "..."}` events |

**Request schema:** `{prompt: str, temperature?: float, max_tokens?: int}`
**Error codes:** 503 for missing config, 502 for LLM errors

### Data Flows
1. Client → POST `/llm/complete` → `create_adapter()` → `GeminiAdapter.complete()` → Gemini API → response
2. Client → POST `/llm/stream` → `create_adapter()` → `GeminiAdapter.stream()` → Gemini API → SSE chunks

---

## Frontend

### Pages

**`apps/web/app/playground/page.tsx`** — Chat playground
- Client component with streaming text display
- User/assistant message bubbles (blue accent for user, surface for assistant)
- Input bar with send button (Enter to send, Shift+Enter for newline)
- Clear conversation button
- Error display with red border
- Loading state with animated cursor

### Layout Changes

**`apps/web/app/layout.tsx`**
- Added "Playground" link in sidebar navigation using `next/link`
- Made "Dashboard" link clickable with `next/link`

### Theme

**`apps/web/app/globals.css`**
- Added light theme variables in `:root`
- Dark theme variables in `.dark` class
- Both themes fully defined with all color tokens

---

## Database

No database changes in this task.

---

## Tests

### Manual Test Results

| Test | Result |
|------|--------|
| `curl /health` | `{"status":"ok"}` |
| `curl /llm/complete` with prompt | Returns Gemini response with provider + model |
| `curl /llm/stream` with prompt | Streams SSE chunks correctly |
| `pnpm build` (Next.js) | Compiles successfully |
| GeminiAdapter instantiation | Provider/model names correct |

### Test Commands

```bash
# Health check
curl http://localhost:3101/health

# Full completion
curl -X POST http://localhost:3101/llm/complete \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Say hello in one sentence"}'

# Streaming
curl -N -X POST http://localhost:3101/llm/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Count from 1 to 5"}'
```

---

## What Was NOT Built

- OpenAI adapter (still stub)
- Anthropic adapter (still stub)
- Conversation history / multi-turn context
- Token usage tracking
- Rate limiting
- Authentication on LLM endpoints

---

## How to Test Manually

1. Start the API: `cd apps/api && source venv/bin/activate && python main.py`
2. Test complete: `curl -X POST http://localhost:3101/llm/complete -H "Content-Type: application/json" -d '{"prompt":"Say hello"}'`
3. Test stream: `curl -N -X POST http://localhost:3101/llm/stream -H "Content-Type: application/json" -d '{"prompt":"Count 1-5"}'`
4. Start the web app: `cd apps/web && pnpm dev`
5. Open http://localhost:3100/playground — chat with Gemini
6. From Mac Mini: http://192.168.1.167:3100/playground
