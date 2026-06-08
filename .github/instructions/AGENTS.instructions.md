# Agent Instructions

## General Principles
- Prefer simplicity over abstraction.
- Optimize for maintainability, not theoretical purity.
- Keep changes small, localized, and reversible.
- Do not restructure unrelated code.

---

## Architecture Model (Pragmatic Layers)

Use a soft layered architecture:

### UI Layer (Components)
- Responsible for rendering and local UI behavior.
- May contain simple derived values and conditional rendering.
- Must NOT perform:
  - API calls
  - persistence / storage access
  - complex domain transformations
- Must call services/hooks for external data and side effects.

### Domain Layer (Pure Logic)
- Contains reusable pure functions.
- Handles transformations, mapping, normalization, merging.
- Must not depend on React or UI concerns.
- Should be easy to test in isolation.

### State Layer (Hooks / Reducers)
- Encapsulates state transitions and orchestration.
- Exposes clear actions or functions.
- Must not contain rendering logic.
- Should avoid mixing unrelated concerns.

### Data Layer (Services)
- Handles persistence, APIs, filesystem, storage.
- Must be isolated from UI.
- No business logic inside services beyond transport concerns.

---

## React Rules

- Functional components only.
- Each component owns its own local logic.
- Extract logic into hooks only when:
  - reused across components OR
  - it meaningfully reduces complexity
- Avoid “god hooks” that aggregate unrelated concerns.
- Keep props explicit and minimal.
- Prefer local state unless sharing is required.

### Derived State
- Prefer computed values over duplicated state.
- Do not store values that can be derived reliably.

### Effects
- All side effects must live in:
  - useEffect
  - custom hooks
  - service layer
- Never run side effects during render.

---

## CSS & Styling System Rules

### Core Principle
The styling system must remain composable and minimal. Do not grow a second design system in CSS.

### Tailwind vs CSS
- Tailwind is the default styling tool.
- Custom CSS is allowed only for:
  - complex selectors
  - animation/state coupling
  - layout patterns not reasonably expressible in Tailwind

### Prohibited Patterns
- Do not recreate Tailwind utilities in CSS.
- Do not introduce new CSS classes that duplicate existing utilities.
- Do not create new `.ui-*`, `.btn-*`, `.page-*` classes unless they:
  - replace multiple existing classes OR
  - reduce overall complexity

---

## Variant System Rules (Critical)

Avoid variant explosion.

### Rules:
- Do NOT add new variant props casually.
- Each new variant axis must be justified by real reuse.
- Prefer composition over adding variants.

### Before adding a new variant:
- Check if behavior can be achieved by:
  - combining existing variants
  - conditional class composition
  - minor layout adjustment
- New variants should exist only if:
  - used in multiple places OR
  - represent a clear semantic role (not visual tweak)

### Component design goal:
Keep variant axes minimal and orthogonal.

---

## Component Design Rules

### Ownership
- Each component owns:
  - its rendering
  - its small internal UI logic
  - its styling composition
- Components should NOT rely on external hidden behavior.

### Structure
- Prefer small functions inside files for local logic.
- Extract only reusable logic into shared modules.

### Avoid
- “god components”
- deeply nested conditional styling logic
- prop-driven styling systems with many dimensions

---

## State Management Rules

- Keep state close to where it is used.
- Avoid global state unless necessary.
- Do not duplicate state across multiple sources.
- If multiple sources exist, define a single source of truth.

---

## Data & Side Effects

- All external interactions go through services.
- UI must never directly access persistence or APIs.
- Side effects must be isolated and explicit.

---

## Refactoring Rules

- Do not refactor unrelated code.
- Prefer incremental cleanup over large rewrites.
- Only abstract when duplication is stable and proven.

---

## TypeScript Rules

- Avoid `any`.
- Use explicit types for public interfaces.
- Narrow types instead of asserting.
- Prefer discriminated unions for complex states.

---

## Output Rules

- Provide minimal, targeted changes.
- Avoid unnecessary restructuring.
- Do not introduce new abstractions unless required to solve a real problem.