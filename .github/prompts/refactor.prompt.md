---
name: refactor
description: Reduce duplication and complexity without changing behavior.
argument-hint: Describe what feels duplicated, over-complex, or inconsistent.
agent: agent
---

Treat the rest of the chat message as the refactor request.

Apply **Refactor mode** from the repository instructions.

Priorities:
1. Remove duplication and reduce concepts.
2. Consolidate similar components, hooks, or logic when they represent the same concept.
3. Prefer deletion over addition.
4. Allow rewrites only when the system becomes simpler.
5. Preserve behavior unless the user explicitly asks otherwise.

Avoid:
- new abstraction layers
- speculative architecture changes
- mixing feature work into the refactor
