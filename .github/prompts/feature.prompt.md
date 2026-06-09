---
name: feature
description: Add or extend functionality while reusing existing components, hooks, and patterns.
argument-hint: Describe the feature, where it belongs, and any constraints (reuse existing component, no new component, use hook, etc.)
agent: agent
---

Treat the rest of the chat message as the feature request.

Apply **Feature mode** from the repository instructions.

Priorities:
1. Extend existing primitives/components before creating new ones.
2. Reuse existing hooks, services, and Tailwind patterns.
3. Use composition and props instead of specialized variants.
4. Keep the feature isolated and preserve existing behavior.
5. Modify other files only when clearly required.

If the feature touches multiple files:
- identify affected files first
- keep changes small and consistent
- do not introduce new systems or abstractions unless replacing an existing one
