---
name: analyze-run
description: Execute TODO tasks sequentially with strict isolation.
agent: agent
---

Use docs/todo-architecture.md.

---

## Step 1 — Load ONE Task

- select the FIRST non-completed `[ ]` task
- ignore completed `[x]` tasks
- do NOT group by tags or type
- if no tasks remain → proceed to optional final validation

---

## Step 2 — Context Isolation (CRITICAL)

- treat task as independent
- do NOT rely on previous tasks
- re-evaluate only necessary files for THIS task

---

## Step 3 — Execute Task

Extract from task:

- type
- scope
- tags

Execute:

/<type>

---

## Execution Rules (CRITICAL)

- minimal change only
- preserve existing behavior
- do NOT expand scope
- do NOT introduce new patterns
- do NOT refactor beyond task scope
- complete task fully
- do NOT describe execution

If task is blocked:

- apply smallest valid partial change
- ensure forward progress

---

## Step 4 — Update TODO (CRITICAL)

- mark task as completed: `[x]`

Remove ONLY if:
- duplicate
- obsolete
- invalid

Validation:

- total `[ ]` tasks MUST decrease

If not:
- fix TODO before continuing

---

## Step 5 — Repeat

Loop:

WHILE tasks remain:

1. reload docs/todo-architecture.md
2. select next `[ ]` task
3. execute Steps 2–4

Stop when:
- no `[ ]` tasks remain, OR
- execution is interrupted

---

## Step 6 — Optional Cleanup Phase

If many `[x]` tasks:

- remove completed tasks
- keep TODO compact
- retain unfinished tasks

---

## Step 7 — Optional Final Validation

Run ONLY if explicitly required or at the very end:

- `npx tsc --noEmit`
- or `npm run build`

If failing:

- fix with minimal changes
- prefer:
  - simplify
  - delete invalid code

DO NOT introduce new systems.

---

## Output (ERROR ONLY)

Output ONLY if:

- task execution fails
- TODO cannot be updated
- validation explicitly fails

Keep output minimal.

---

## Rules

- process ONE task at a time
- do NOT preload tasks
- do NOT re-analyze
- do NOT create new tasks
- do NOT expand scope
- do NOT stop unless interrupted
- do NOT output explanations
- do NOT print progress