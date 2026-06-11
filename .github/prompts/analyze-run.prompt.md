---
name: analyze-run
description: Execute TODO tasks with grouping and minimal safe refactoring.
agent: agent
---

Use docs/todo-architecture.md.

---

## Mode

- process up to 10 tasks
- allow stopping anytime
- prefer grouped execution over strict sequencing

---

## Step 1 — Load TODO

- reload docs/todo-architecture.md
- remove duplicates
- remove invalid tasks

If no tasks:
→ Final Validation

---

## Step 2 — Group Tasks

Group tasks if ANY of these match:

- same file (scope)
- overlapping responsibility (e.g. css cleanup, layout)
- shared tags

Rules:

- grouped tasks MUST be executable together safely
- DO NOT merge unrelated scopes
- prefer grouping over strict one-by-one execution

Result:

- select FIRST group (not just first task)

---

## Step 3 — Execute Group

For all tasks in the group:

Extract:
- type
- scope
- intent

Then:

- execute changes together in ONE cohesive pass

---

## Execution Rules

- minimal change
- preserve behavior
- no scope expansion outside the group
- no new patterns
- resolve dependencies within group

If blocked:

- apply smallest possible fix
- continue group execution

---

## Step 4 — Update TODO

- MUST rewrite docs/todo-architecture.md

Remove:

- all executed tasks in the group
- duplicates
- invalid tasks
- tasks made obsolete by execution

---

## Step 5 — Validate State

- reload TODO
- task count MUST decrease

Also verify:

- no broken references
- no partial removals
- no inconsistent state

If issues:

- fix immediately with minimal change

---

## Step 6 — Continue

If:

- tasks remain
- limit not reached

→ repeat from Step 1

Else STOP

---

## Final Validation

Run ONLY if:

- requested OR no tasks remain

Commands:

- npm run build
- npx tsc --noEmit

Fix minimally if failing

---

## Output

ONLY if:

- execution fails
- TODO update fails

---

## Hard Rules

- prefer grouping over strict sequencing
- never leave partial refactors
- always remove fully completed concerns
- allow local re-evaluation after each group
- no new tasks
- no global re-analysis
- no explanations