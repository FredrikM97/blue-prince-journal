---
name: compose
description: Build or extend a reusable shell/component using composition, props, and shared behavior.
argument-hint: Describe the shell/component, what content/actions vary, and which behaviors should be configurable.
agent: agent
---

Treat the rest of the chat message as a composition request.

Apply **Feature mode** plus the repository's reuse rules.

Priorities:
1. Use a shared shell/container for structure and behavior.
2. Inject content, actions, and small UI differences via props or children.
3. Centralize shared behavior in one hook or one implementation.
4. Avoid creating multiple components for minor variations.

This prompt is best for dialogs, previews, panels, modals, drawers, and similar reusable UI shells.
