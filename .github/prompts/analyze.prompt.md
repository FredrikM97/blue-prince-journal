---
name: analyze
description: Analyze codebase and maintain a clean TODO.
agent: agent
---

Treat /src as primary context.

---

## Mode (CRITICAL)

Analysis only.

- DO NOT modify source files
- DO NOT execute changes
- DO NOT simulate edits
- ONLY update docs/todo-architecture.md

---

## Silent Operation (CRITICAL)

- NO chat output
- NO explanations or summaries
- ONLY side-effect: update TODO file

Output ONLY if:
- TODO update fails
- invalid task format
- file error

---

## Step 0 — Intent

If input is short, map to:

- UI/layout → layout, spacing, alignment
- hooks → duplication, misuse
- dropdown/dialog → composition issues
- CSS → leakage, conflicts
- naming → inconsistency
- structure → ownership
- responsive → CSS vs JS conflicts

Else → default scan.

---

## Step 1 — Detect

Detect:

- duplication, dead code, unused files
- misplaced logic (.tsx vs .ts)
- complex components/hooks
- structure/responsibility issues
- CSS leakage, UI regressions
- responsive conflicts (CSS vs JS)
- scroll/overflow problems

No full audit.

---

## Step 2 — Tasks (CRITICAL)

Create atomic tasks:

Requirements:

- minimal scope (prefer 1 file)
- no combined operations (no move+rename+logic)
- no redesigns or large refactors

Prefer:

- small local fixes
- sequential decomposition

---

## Task Format (CRITICAL)

- [ ] <description> (type: X, scope: X, tags: [tag1, tag2])

### type

- bug | refactor | compose | minimal | feature

### tags (1–3 REQUIRED)

- layout, responsive, scroll, structure
- css, state, cleanup, duplication, bug, feature

---

## Feature-Safe

Allow ONLY if:

- local (≤2 files)
- obvious improvement
- no new system

---

## TODO Structure

# TODO

- [ ] <task>
- [ ] <task>

(no grouping)

---

## Step 3 — Maintain (CRITICAL)

Update TODO:

### Remove ONLY if:
- exact duplicate
- clearly invalid
- completed `[x]`
- directly replaced

### NEVER remove `[ ]` tasks because:
- partially fixed
- “seems outdated”
- code has changed

---

### Merge ONLY if:
- same intent
- same scope

---

### Always:
- simplify wording (no meaning change)
- append new findings
- keep list flat and minimal

---

## Hard Rule

- suppress ALL non-error output
- behave like background processor

---

## Rules

- generate useful, atomic tasks
- prefer delete > simplify > add
- always include tags

If instruction implies code change:
→ convert to task
