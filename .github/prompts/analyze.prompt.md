---
name: analyze
description: Analyze codebase and create a clean TODO queue.
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

Create a clean, minimal, high-impact TODO queue.

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

- MAX 10 tasks
- highest impact only

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

Remove:

- duplicates
- invalid tasks
- low-value tasks

Replace tasks if better understanding is found

---

## Rules

- prefer delete > simplify > add
- generate atomic tasks
- keep TODO minimal and clear

If input implies code change:
→ convert to task