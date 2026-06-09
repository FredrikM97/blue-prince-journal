---
name: analyze
description: Analyze codebase and maintain a clean, executable TODO.
agent: agent
---

Treat /src as primary context.

## Step 1 — Minimal Overview

Understand only enough to detect improvements:

- duplicated concepts (same idea implemented more than once)
- repeated behavior across files
- misplaced logic (UI vs .ts responsibility)
- overcomplex components or hooks
- unused or duplicate files
- inconsistent structure or responsibility

Do NOT perform a full audit.
Do NOT explore broadly.

---

## Step 2 — Identify Issues

Detect ALL meaningful high-impact issues:

- reduce duplication
- simplify structure
- fix responsibility boundaries
- remove dead code

Do NOT limit number of issues.

---

## Step 3 — Convert Issues to Tasks (CRITICAL)

Each issue must be split into atomic tasks.

### Task Rules

Each task MUST:

- represent ONE action only
- be directly executable
- have clear or inferable scope
- not combine multiple changes

If an issue requires multiple steps:
- split it into multiple tasks

---

## Step 4 — Task Definition

Each task must be written as:

- <intent> (type: X, action: X, scope: X)

Where:

type:
- refactor | compose | minimal | bug

action:
- merge | extract | move | delete | simplify

scope:
- explicit files if possible
- otherwise: meaningful grouping (NOT just "multi")

---

## Step 5 — TODO Maintenance (CRITICAL)

Create or update:

docs/todo-architecture.md

Before writing:

- remove completed tasks
- remove obsolete tasks
- merge duplicate or overlapping tasks
- simplify wording
- remove low-value tasks

Then append new tasks if not already covered.

### Structure

# TODO

## Tasks

- <task 1>
- <task 2>
- ...

Keep minimal. No explanations.

---

## Step 6 — Output (MINIMAL)

updated: docs/todo-architecture.md

---

## Rules

- generate ALL useful tasks (no artificial limit)
- tasks must be atomic and executable
- do NOT output task list
- do NOT output high-level architecture explanation
- do NOT output execution prompts
- do NOT output ordering or "next step"
- prefer deletion > modification > addition
- avoid unnecessary abstraction
- align with copilot-instructions.md