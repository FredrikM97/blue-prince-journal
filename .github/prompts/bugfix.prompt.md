---
name: bugfix
description: Fix a bug at the root cause with the smallest safe change.
argument-hint: Describe the bug, current behavior, expected behavior, and any relevant file or component.
agent: agent
---

Treat the rest of the chat message as the bug report.

Apply **Bugfix mode** from the repository instructions.

Priorities:
1. Find and fix the root cause.
2. Keep changes minimal and localized.
3. Preserve existing behavior outside the bug.
4. Update related files only if the fix clearly requires it.

Avoid:
- unrelated refactors
- rewrites unless the current structure blocks a correct fix
- adding new features as part of the fix
