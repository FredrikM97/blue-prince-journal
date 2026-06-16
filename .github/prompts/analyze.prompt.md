---
name: analyze
description: Analyze codebase and maintain a clean TODO queue.
agent: agent
---

## Mode

- analysis only
- DO NOT modify source files
- ONLY write docs/todo-architecture.md

---

## Silent Operation

- no output
- only update TODO file

Output ONLY if:
- TODO update fails
- file error
- no valid tasks found

---

## Goal

Maintain a clean, minimal, high-impact TODO queue.

- prioritize important issues
- avoid full system analysis
- prefer small, actionable tasks

---

## Scope

Focus on:

- layout issues
- CSS problems
- structure issues
- obvious bugs

Avoid:
- full codebase audit unless required

---

## Task Limit

- MAX 10 tasks (soft limit)

If exceeded:
- prefer keeping existing valid tasks
- only drop clearly lower-value or redundant new tasks

---

## Detect

Look for:

- layout and alignment issues
- CSS leakage or conflicts
- duplication or dead code
- structural problems
- scroll or overflow issues
- misplaced logic (.tsx vs .ts)

---

## Tasks

Create atomic tasks:

- minimal scope (prefer 1 file)
- no combined operations
- safe incremental changes

---

## Task Format

- <description> (type: X, scope: X, tags: [tag1, tag2])

type:
- bug | refactor | compose | minimal | feature

tags (1–3):
- layout, responsive, scroll, structure
- css, state, cleanup, duplication, bug, feature

---

## Escalation

If unclear:

- create investigation task
- do NOT guess

Examples:
- "Investigate CSS dependency graph"
- "Analyze layout alignment issue"

---

## TODO Structure

# TODO

- <task>
- <task>

(queue of remaining work only)

---

## Maintain (CRITICAL)

- ALWAYS rewrite docs/todo-architecture.md completely
- output a clean list of tasks only

Preserve:

- all valid, unresolved tasks from the existing TODO

Remove ONLY:

- exact duplicates
- clearly invalid tasks
- tasks that are fully obsolete due to other tasks

Optional:

- merge tasks ONLY if clearly overlapping in scope
- refine wording for clarity without changing intent

DO NOT:

- remove tasks due to reprioritization alone
- remove tasks just to meet MAX limit
- replace or drop valid existing tasks with new ones

Priority Rule:

- existing tasks have priority over newly discovered tasks
- only add new tasks if they bring clear additional value

---

## Continuity Rule (MANDATORY)

- existing tasks MUST persist across runs unless:
  - completed
  - invalid
  - exact duplicate

- new analysis must EXTEND the TODO, not rebuild it

---

## Rules

- prefer delete > simplify > add
- generate atomic tasks
- keep TODO minimal and stable
- never discard valid work

If input implies code change:
→ convert to task
``