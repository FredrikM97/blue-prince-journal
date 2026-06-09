---
name: analyze-run
description: Execute TODO tasks sequentially with strict isolation.
agent: agent
---

Use docs/todo-architecture.md.

## Step 1 — Load ONE Task

- read the first valid task only
- ignore completed or invalid tasks
- if no tasks remain → proceed to final validation

---

## Step 2 — Context Isolation (CRITICAL)

Before executing:

- treat this task as a fresh execution
- do NOT rely on previous task context
- do NOT assume file state
- re-evaluate affected files for this task only

---

## Step 3 — Execute Task

Extract:

- type (bug | refactor | compose | minimal)
- action (merge | extract | move | delete | simplify)
- scope

Execute using:

/<type>

Apply rules:

- minimal change only
- preserve behavior
- do NOT expand scope
- identify affected files fresh for THIS task
- complete task fully

---

## Step 4 — Update TODO

- mark task as done or remove it
- remove obsolete tasks
- merge tasks if they became redundant
- keep file minimal and clean

---

## Step 5 — Repeat (CRITICAL)

This is a loop:

WHILE tasks remain:

1. reload docs/todo-architecture.md
2. load next valid task
3. execute task (Steps 2–4)

When no tasks remain → proceed to final validation.

---

## Step 6 — Final Validation (CRITICAL)

After all tasks are complete:

Run a validation command:

- prefer `npx tsc --noEmit`
- or `npm run build` if available

If the command fails:

- identify the cause from the output
- fix issues using minimal changes
- do NOT introduce new systems or abstraction
- prefer removing or simplifying invalid code

Ensure the project builds or typechecks successfully before finishing.

---

## Output (MINIMAL)

apply: yes

---

## Rules

- process ONE task at a time
- do NOT pre-load all tasks
- do NOT carry context between tasks
- do NOT re-analyze
- do NOT introduce new tasks
- do NOT expand scope
- do NOT stop between tasks
- do NOT output explanations