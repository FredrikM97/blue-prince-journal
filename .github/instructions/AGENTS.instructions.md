# Agent Instructions

## Goal
Maintain and improve a TypeScript + React + Tailwind codebase by reducing complexity, removing duplication, and improving long-term maintainability.

Prefer practical simplification over theoretical architecture. Avoid unnecessary abstraction.

---

## General Principles
- Optimize for maintainability and clarity over elegance.
- Keep changes small unless a larger rewrite clearly reduces complexity.
- Do not introduce new systems unless they replace existing ones.
- Preserve existing behavior unless explicitly instructed otherwise.
- Prefer deletion over addition when simplifying systems.

---

## Refactor Scope Rules (Rewrites Allowed)

Full rewrites are allowed when they reduce systemic complexity.

A rewrite is only valid if it clearly achieves at least one of:
- reduces number of concepts (variants, props, classes, layers)
- removes duplicated or overlapping systems
- consolidates multiple abstractions into fewer, clearer ones
- simplifies usage for consumers of the API/component

Rewrites must NOT:
- introduce new abstraction layers without removing existing ones
- increase number of variants, classes, or configuration axes
- expand the system surface area

Prefer replacing entire subsystems over incremental patching when:
- the subsystem is already inconsistent or overextended
- local fixes would increase complexity further

All rewrites must preserve behavior unless explicitly stated otherwise.

---

## Architecture Model (Pragmatic, Not Strict)

Use separation of concerns as a guideline, not a rigid rule.

### UI Layer (React Components)
- Responsible for rendering and basic UI interaction.
- May contain simple derived values and conditional rendering.
- Must not directly access persistence, APIs, or external systems.
- Avoid embedding complex business logic.

### Domain Layer (Pure Functions)
- Contains reusable, pure transformations.
- Handles mapping, normalization, filtering, aggregation.
- Must not depend on React or UI state.

### State Layer (Hooks / Reducers)
- Encapsulates state transitions and orchestration.
- Exposes explicit actions or state functions.
- Avoid mixing unrelated responsibilities in a single hook.

### Data Layer (Services)
- Handles external systems: API, storage, filesystem, DB.
- No UI logic.
- No business rules beyond transport concerns.

---

## React Rules

- Functional components only.
- Keep components focused and small where possible.
- Local logic inside components is allowed if it stays simple.
- Extract logic only when it is reusable or clearly complex.

### Derived State
- Prefer computed values over duplicated state.
- Avoid storing values that can be derived reliably.

### Effects
- Side effects must live in:
  - useEffect
  - custom hooks
  - service layer
- Never perform side effects during render.

---

## State Management Rules

- Keep state close to where it is used.
- Avoid unnecessary global state.
- Maintain a single source of truth.
- Do not duplicate state across layers.

---

## CSS & Styling System Rules

### Core Principle
The styling system must remain minimal, composable, and not evolve into a second design framework.

### Tailwind vs CSS
- Tailwind is the default styling system.
- Custom CSS is allowed only for:
  - complex selectors
  - animation/state coupling
  - layout patterns not easily expressed in Tailwind

### Prohibited Patterns
- Do not recreate Tailwind utilities in CSS.
- Do not expand `.ui-*`, `.btn-*`, `.page-*` systems unless they reduce complexity.
- Do not add new CSS abstraction layers that duplicate Tailwind functionality.

---

## Variant System Rules (Critical)

Avoid variant explosion.

- Do NOT add new variant props without strong justification.
- Each new variant axis must replace or simplify existing complexity.
- Prefer composition over adding new variants.

### Allowed only if:
- the variant is reused in multiple places, OR
- it represents a clear semantic role (not a visual tweak)

### Forbidden:
- adding variants for minor styling differences
- creating new orthogonal styling axes unnecessarily

Goal: keep variant systems small, semantic, and stable.

---

## Component Design Rules

- Each component owns its rendering and local UI behavior.
- Avoid “god components” and overly generic components.
- Extract shared logic only when it is reused or clearly domain-level.

### Structure Preference
- Small local helper functions inside files are preferred over premature abstraction.
- Avoid unnecessary cross-file dependencies.

---

## CSS System Maintenance Rules

- Prefer removing CSS over adding new classes.
- Do not duplicate Tailwind utilities in CSS.
- Merge overlapping utility classes when possible.
- Collapse redundant design-system abstractions.

Goal: move toward fewer, more reusable primitives instead of many specialized classes.

---

## Data & Side Effects

- All external interactions must go through services or hooks.
- UI must never directly access persistence or APIs.
- Side effects must be explicit and isolated.

---

## Refactoring Rules

- Do not refactor unrelated areas.
- Prefer incremental cleanup unless a subsystem is clearly overgrown.
- Rewrites are allowed when they reduce overall complexity.
- Avoid speculative or future-proofing changes.

---

## TypeScript Rules

- Avoid `any`.
- Prefer explicit types for public interfaces.
- Use narrowing instead of assertions.
- Prefer discriminated unions for complex states.

---

## Output Rules

- Provide minimal, focused changes.
- Avoid unnecessary restructuring.
- Keep diffs small unless a full rewrite is explicitly justified by complexity reduction.