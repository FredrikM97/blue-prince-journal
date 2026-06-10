# Agent Instructions

## Goal
Maintain and improve a TypeScript + React + Tailwind codebase by reducing complexity, duplication, and maintenance cost.

---

## Modes
Refactor / Feature / Bugfix / Minimal  
Do not mix modes. Default = Minimal.

---

## Execution
- continue multi-step changes
- do not ask for confirmation
- choose simplest safe solution
- identify all affected files before modifying
- stop only if behavior cannot be preserved

---

## Context
- use provided code as primary context
- modify other files only when required
- do not assume unrelated system parts

---

## Decisions
- choose one solution
- no alternatives
- avoid exploration

---

## Output
- minimal changes only
- no unrelated code
- no explanations unless requested

---

## Core Rules
- prefer deletion over addition
- avoid abstraction unless clearly required
- no new systems unless replacing existing
- reuse existing components before creating new ones
- keep changes small and consistent

---

## File Responsibility
- .tsx → UI only
- .ts → logic, hooks, services, types

Rules:
- no JSX in hooks
- domain logic must be pure
- services contain no UI logic
- components must not contain heavy business logic

---

## Structure
- one concept = one component
- no similar components with small differences
- shared behavior must exist in one place
- prefer composition (children) over specialization
- avoid wrapper components without unique behavior

---

## State
- group related state into objects
- avoid many independent state fields
- avoid value/onChange prop duplication

---

## Architecture

UI (.tsx):
- rendering + interaction only

Domain (.ts):
- pure functions

State (.ts):
- hooks and effects

Data (.ts):
- IO only

---

## Styling

### Ownership (CRITICAL)

- Each component MUST own its styling
- Styling MUST be defined inside the component using className
- Components MUST NOT depend on global CSS for layout or structure

---

### Primary Approach (Tailwind First)

- use Tailwind directly in className
- layout, spacing, and alignment MUST be defined inline
- styling MUST be visible in the component

---

### Forbidden Patterns

- shared CSS files
- global component styling
- CSS controlling layout across components
- CSS import chains
- reference layers or style hubs
- Tailwind abstraction layers
- variant systems or config-driven styling

---

### CSS Usage (LIMITED)

Use CSS ONLY when:

- complex selectors are required
- cannot be expressed using Tailwind
- defining tokens or base styles

Rules:

- scoped to one component
- imported ONLY by that component
- MUST NOT affect other components

---

### Theme / Tokens

- tokens must have a single source (e.g. :root and .dark)
- components consume tokens only

Rules:

- use tokens directly (var(--background))
- Tailwind may map tokens (bg-background, text-foreground)
- keep token system flat

Forbidden:

- multi-layer token mapping
- duplicated token systems
- inline theme systems

---

### Global Styles (STRICTLY LIMITED)

Allowed ONLY for:

- html/body background and color
- typography defaults
- reset/normalization

MUST NOT:

- control layout
- affect spacing or alignment
- modify width, overflow, or centering
- influence component structure

---

### CSS Dependency Safety (CRITICAL)

- component CSS MUST NOT import another component CSS
- no indirect chains (A → B → C)
- no shared CSS hubs
- styles.css MUST NOT import component CSS

Goal:

- each component must render correctly in isolation
- removing a component MUST NOT break another

---

### Principles

- explicit over implicit
- local over global
- duplication over hidden coupling
- if styling is not visible in the component, it is a problem

---

## Refactor

Allowed only if:
- duplication reduced
- system simplified

Rules:
- no abstraction layers
- no expanding variants
- update all affected files in one pass

---

## TypeScript

- avoid any
- prefer explicit types
- prefer narrowing over assertions

---

## Constraints

- avoid hidden coupling between components

---

## Modes Behavior

Refactor:
- reduce complexity and duplication

Feature:
- extend existing components
- keep changes isolated

Bugfix:
- fix root cause with minimal change

Minimal:
- smallest possible change
- no restructuring