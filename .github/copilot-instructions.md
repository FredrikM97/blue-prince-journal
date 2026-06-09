# Agent Instructions (High Efficiency)

## Goal
Maintain and improve a TypeScript + React + Tailwind codebase by reducing complexity, duplication, and maintenance cost.

Avoid unnecessary abstraction. Prefer practical simplification.

## Modes (CRITICAL)
Refactor / Feature / Bugfix / Minimal
Do not mix modes. Default = Minimal.

## Execution (CRITICAL)
- Continue multi-step changes
- Do not ask for confirmation
- Choose simplest safe option
- Identify all affected files before modifying
- Only pause if behavior cannot be preserved

## Context (CRITICAL)
- Use provided code as primary context
- Modify other files only when clearly required
- Do not infer unrelated system parts
- Avoid repetition or speculation

## Decisions (CRITICAL)
- Do not list alternatives
- Do not explore multiple approaches
- Choose one solution and proceed

## Output (CRITICAL)
- Prefer minimal, focused changes
- Avoid unnecessary code
- Do not include unrelated parts
- No explanations unless requested

## General
- Prefer deletion over addition
- Preserve behavior unless instructed
- Avoid unnecessary abstraction
- No new systems unless replacing existing
- Avoid overengineering
- Follow existing patterns
- Reuse existing components and logic by default
- Keep structure consistent across similar components

## Refactor
Allow rewrites only if:
- duplication removed
- concepts reduced
- system simplified

Do NOT:
- add abstraction layers
- expand variants/config

Strategy:
- identify affected files first
- apply in one pass

## Context Isolation (CRITICAL)
- Changes affect smallest unit possible
- Prefer hooks, pure functions, services
- Single responsibility per file

## Multi-file Changes
- Keep changes minimal and consistent
- Modify additional files only when required
- Ensure consistency across all affected files

## File Responsibility
- .tsx -> UI only
- .ts -> hooks, logic, services, types
- Hooks must not return JSX
- Domain logic must be pure
- Services contain no UI logic
- Components should not contain heavy business logic

## Reuse & Structure (CRITICAL)
- One concept = one component
- Do not create similar components with small differences
- Reuse existing components before creating new ones

### Shell
- Use shared shells (Dialog, Panel, Preview)
- Layout + behavior defined in shell
- Content via props/children

### Composition
- Prefer composition over specialization
- Pass UI/actions/content via props

### Behavior
- Shared logic exists once (hooks/flags)
- No duplicated interaction logic

## Architecture

UI (.tsx):
- render + local interaction only
- no API access

Domain (.ts):
- pure functions only

State (.ts):
- hooks manage state/effects

Data (.ts):
- services for external access only

## React & Styling (CRITICAL)
- Functional components only
- Keep components small
- Extract complex/reusable logic into hooks

### State
- Prefer derived values over duplicated state

### Effects
- Only in hooks

### Tailwind
- Avoid unique styling per usage
- Prefer existing patterns
- Reuse layout/spacing systems

### Reuse
- Extract repeated patterns into components or props

### Variants
- Semantic only
- No layout/spacing variants

### className
- Allowed, but no reusable patterns inline

### CSS
- Component-owned styling
- No cross-component dependencies
- Prefer removing CSS over adding

## TypeScript
- Avoid any
- Prefer explicit types
- Use discriminated unions where useful
- Prefer narrowing over assertions

## Additional Constraint
- Avoid hidden coupling between components

## Mode Behavior

Refactor:
- Reduce duplication and complexity
- Consolidate components and logic

Feature:
- Extend existing components first
- Use composition instead of duplication
- Keep feature isolated

Bugfix:
- Fix root cause
- Minimal change only

Minimal:
- Smallest possible change
- No restructuring
