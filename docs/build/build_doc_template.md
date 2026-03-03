# Build Documentation Standard

> Drop this into any project's `CLAUDE.md` or paste it at the start of a Claude Code session to ensure comprehensive build documentation after every task.

---

## Instruction: Mandatory Build Documentation After Every Task

After completing every task, you MUST write a detailed build document before moving on. This is not optional. The build doc is a first-class deliverable, equal in importance to the code itself.

**The standard:** Someone reading the build doc should be able to understand everything that was built, why it was built, how it works, and how to verify it — without looking at a single line of source code.

### File Location and Naming

```
docs/build/phase-{N}/task-{NN}-{short-name}.md
```

Create `docs/build/` and phase subdirectories if they do not exist.

### Commit Discipline

Commit the build doc as a **separate commit** after the code commit:

```
docs: build doc for Task N — short description
```

---

## Required Sections

Every build doc MUST include all sections below, in order. If a section does not apply, include the heading and write "N/A."

---

### 1. Title and Metadata

```markdown
# Task {N} — {Descriptive Title}

**Phase:** {N} — {Phase Name}
**Date:** YYYY-MM-DD
**Commit:** `{short hash}`
**Tests:** {X} total ({Y} new, {Z} existing pass)
**Build:** {status}
```

---

### 2. What This Task Is About

2–4 paragraphs in plain language:

- **WHY** — what user problem does it solve? What business goal?
- **WHAT** — walk through the experience from the user's perspective
- **SCOPE** — what is NOT included (brief; detailed later in Section 7)

Lead with the why. Write for a human who hasn't seen the code.

---

### 3. Backend

#### 3a. Dependencies Added

| Package | Version | Why |
|---------|---------|-----|
| `package-name` | ^x.y.z | One-line reason |

Or "None."

#### 3b. New Services / Modules

For EVERY new file:
- **File path**
- **Purpose** — one sentence
- **Functions/methods** — for each:
  - Full signature (name, arguments with types, return type)
  - Step-by-step description of what it does
  - Design decisions and alternatives considered
  - Edge cases handled

#### 3c. New Routes / Endpoints

For EVERY new API endpoint:

```markdown
**`METHOD /path`** — One-line description. Auth: {none | token | admin}.

Request body: {schema with field types}
Response (200): {response shape}
Error responses: 400 (when), 422 (when)

Processing pipeline:
1. Validate with Zod
2. Call service
3. Return response
```

#### 3d. Modified Backend Files

List EVERY changed file. What was added/changed and why.

#### 3e. Data Flows and State Machines

If multi-step processes or status progressions were introduced:
```
state_a → state_b → state_c
```
Or "N/A."

---

### 4. Frontend

#### 4a. New Pages

- Route path, layout, UX flow, components used, data fetching

#### 4b. New Components

- Props, behavior per state, styling, interactions

#### 4c. Modified Frontend Files

List every changed file and why.

#### 4d. Types and Interfaces

List every new TypeScript type with fields and what each represents.

---

### 5. Database

#### 5a. New Tables

Every column: name, type, nullable, default, constraints, reasoning.

#### 5b. Schema Changes

Columns added/changed/removed and why.

#### 5c. Migrations

List every migration file. What it does. Reversible?

Or "No changes."

---

### 6. Tests

#### 6a. Per-Test Documentation

```markdown
**`test_name`** — Scenario description.
Mocks: {what and return values}.
Asserts: {every assertion and why}.
```

#### 6b. Test Summary Table

| File | Tests | What it covers |
|------|-------|---------------|
| file.test.ts | N | Description |
| **Total** | **N** | |

#### 6c. Test Output

Paste actual terminal output.

---

### 7. What Was NOT Built (Deferred)

- **{Feature}** — Deferred because {reason}. Planned for Task {N}.

---

### 8. How to Test Manually

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3020/{path}`
3. Do X → expect Y
4. Do Z → expect W

Include expected output at each step.

---

## Guiding Principles

1. **Thoroughness over brevity.** Too detailed is always better than too brief.
2. **WHY over WHAT.** Every section should explain reasoning.
3. **Standalone readability.** Must make sense without seeing code.
4. **Concrete over abstract.** Real field names, real paths, real values.
5. **Completeness over perfection.** Document rough edges honestly.
6. **Every file, every function, every test.** If created or modified, it's in the doc.