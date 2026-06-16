---
name: analyze-run
description: Execute TODO tasks one at a time with minimal safe refactoring.
agent: agent
---

Use docs/todo-architecture.md.

---

## Mode

- process exactly ONE task per iteration
- no grouping
- continue automatically until limit or no tasks

---

## Step 1 — Load TODO

- reload docs/todo-architecture.md
- remove duplicates and invalid tasks

If empty:
→ Final Validation

---

## Step 2 — Select Task

- pick the FIRST valid task only

---

## Step 3 — Execute

- complete only the selected task
- apply minimal changes
- preserve behavior
- no scope expansion

If blocked:
- apply smallest fix needed to complete it

---

## Step 4 — Update TODO

- rewrite docs/todo-architecture.md
- remove:
  - executed task
  - duplicates / invalid entries
  - tasks fully resolved by this change

---

## Step 5 — Validate

- reload TODO
- task count must decrease
- ensure no inconsistencies

---

## Step 6 — Continue

If:
- tasks remain
- limit not reached

→ repeat from Step 1

Else:
→ STOP

---

## Final Validation

Run only if requested or no tasks remain:

- npm run build
- npx tsc --noEmit

Fix minimally if failing

---

## Output

Only if failure occurs

---

## Rules

- one task per iteration
- no grouping
- no cross-task refactoring
- always complete the current task before moving on
