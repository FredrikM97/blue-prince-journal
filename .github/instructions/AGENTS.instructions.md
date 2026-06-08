# Agent Instructions

## Goal
Maintain and improve a TypeScript + React + Tailwind codebase by reducing complexity, duplication, and long-term maintenance cost.

Prefer practical simplification over theoretical architecture. Avoid unnecessary abstraction.

---

## General Principles
- Optimize for maintainability and clarity over elegance.
- Keep changes small unless a larger rewrite clearly reduces complexity.
- Prefer deletion over addition.
- Do not introduce new systems unless they replace existing ones.
- Preserve behavior unless explicitly instructed otherwise.

---

## Refactor Scope Rules (Rewrites Allowed)

Full rewrites are allowed when they reduce systemic complexity.

A rewrite is valid only if it:
- reduces number of concepts (variants, props, class systems, layers)
- removes duplication or overlapping abstractions
- consolidates systems into fewer primitives
- simplifies usage for consumers

Rewrites must NOT:
- increase system surface area
- introduce new abstraction layers without removing old ones
- expand variant/class/config complexity

Prefer replacing entire subsystems when partial fixes increase complexity.

---

## Architecture Model (Pragmatic)

### UI Layer (React Components)
- Responsible for rendering and local interaction
- May contain simple derived values
- Must not access persistence or external APIs
- Avoid complex business logic

### Domain Layer (Pure Functions)
- Pure transformations only
- No React or UI coupling
- Mapping, filtering, normalization, aggregation

### State Layer (Hooks / Reducers)
- Encapsulates state transitions
- Exposes explicit actions
- Avoid mixed responsibilities

### Data Layer (Services)
- External systems only (API, DB, storage)
- No UI logic or business rules

---

## React Rules

- Functional components only
- Keep components small and focused
- Local logic is allowed if simple
- Extract only reusable or clearly complex logic

### Derived State
- Prefer computed values over duplicated state
- Avoid storing derivable values

### Effects
- Only in useEffect, hooks, or services
- Never in render or pure functions

---

## State Rules

- Keep state close to usage
- Avoid unnecessary global state
- Maintain single source of truth

---

## CSS Ownership Model (CRITICAL)

- Every component owns its styling
- Styling must be colocated with component (CSS module or local file)
- Components must not depend on styling defined inside unrelated components

### Allowed
- Button.tsx + Button.module.css
- Tailwind inside component
- Shared design tokens only

### Forbidden
- importing CSS from unrelated components
- cross-feature .ui-*, .btn-* reuse systems
- global styling systems that encode component behavior

### Principle
If styling is reusable, it becomes:
- a primitive component, or
- a design token

Not a shared class system.

---

## Tailwind vs CSS

- Tailwind is default
- CSS only for:
  - complex selectors
  - animations/state coupling
  - layout patterns not expressible in Tailwind

---

## Variant System Rules (CRITICAL)

Avoid variant explosion.

- Variants must represent semantic meaning only
- Variants must NOT encode layout or minor visual differences

### Allowed
- semantic modes (e.g. destructive, disabled, loading)

### Forbidden
- layout variants
- spacing-only variants
- ad-hoc styling buckets

### Anti-pattern
- variant maps that behave like CSS routing tables

Variants should not become a second styling system.

---

## className Rules

- Allowed in all components
- Must not encode repeated patterns across codebase
- Repeated className patterns must be extracted into:
  - primitives, or
  - layout components

---

## Component Design Rules

- Components own rendering + local UI behavior
- Avoid god components
- Extract only when reuse or complexity justifies it

---

## CSS System Maintenance

- Prefer removing CSS over adding
- Do not duplicate Tailwind utilities in CSS
- Collapse redundant design systems
- Move toward primitives instead of special-case classes

---

## Data & Side Effects

- All external access via services/hooks only
- No direct API/DB calls in UI

---

## Refactoring Rules

- Do not refactor unrelated code
- Prefer incremental cleanup
- Full rewrites allowed when reducing complexity
- Avoid speculative changes

---

## TypeScript Rules

- Avoid any
- Prefer explicit types for public APIs
- Use narrowing instead of assertions
- Prefer discriminated unions for state

---

## Output Rules

- Minimal, focused changes
- Avoid unnecessary restructuring
- Keep diffs small unless rewrite is justified
