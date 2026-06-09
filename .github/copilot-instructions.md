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
- no alternatives or exploration

---

## Output
- minimal changes only
- no unrelated code
- no explanation unless requested

---

## Core Rules
- prefer deletion over addition
- avoid abstraction unless clearly required
- no new systems unless replacing existing
- reuse existing components before creating new ones
- keep changes small and consistent
- group related state and props into single objects when possible

---

## File Responsibility
- .tsx → UI only
- .ts → hooks, logic, services, types
- no JSX in hooks
- domain logic must be pure
- services contain no UI logic
- components do not contain heavy business logic

---

## Structure
- one concept = one component
- no similar components with small differences
- shared behavior exists once
- prefer composition using children over specialized components
- avoid wrapper components with no unique behavior

---

## State
- prefer grouped state over multiple independent fields
- avoid excessive value/onChange prop pairs
- pass state as a single object for one concept

---

## Architecture
UI (.tsx):
- rendering and local interaction only

Domain (.ts):
- pure functions only

State (.ts):
- hooks manage state and effects

Data (.ts):
- IO and persistence only

---

## Styling

Component owns its styling.

Order:
1. inline Tailwind
2. component reuse
3. CSS only when required

### Tailwind
- use inline by default
- keep styling local and readable
- do not extract className into constants
- do not create styling abstraction or variant systems

### Component Reuse
- extract repeated UI into components, not style constants

### CSS
Use only when:
- complex selectors required
- structural or markdown/system styling

Rules:
- scoped to one component
- no shared/global CSS
- prefer deletion over extension

### className
- inline usage only
- no reusable style constants or mapping systems

---

## Refactor
Allowed only if:
- duplication removed
- system simplified

Rules:
- no abstraction layers
- no expanding variants
- identify all affected files
- apply changes in one pass

---

## TypeScript
- avoid any
- prefer explicit types
- use narrowing over assertions

---

## Constraints
- avoid hidden coupling between components

---

## Modes Behavior

Refactor:
- remove duplication and complexity

Feature:
- extend existing components
- keep changes isolated

Bugfix:
- fix root cause with minimal change

Minimal:
- smallest possible change
- no restructuring