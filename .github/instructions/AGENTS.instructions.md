---
description: Core coding rules for this repository
applyTo: "src/**/*.{ts,tsx,css},tests/**/*.{ts,tsx},.github/instructions/*.md"
---

# Core Rules

- Prioritize simplification over backward compatibility unless explicitly requested.
- Prefer deletion and replacement over compatibility wrappers.
- Keep solutions small, direct, and reusable.

# Scope By File Type

- `*.tsx`: component composition, behavior, and state ownership rules apply.
- `*.css`: named-class styling rules apply.
- `tests/**/*.tsx`: keep assertions behavior-focused and update snapshots only when changes are intentional.
- `*.md` instruction files: keep guidance concise, non-contradictory, and current.

# JSX / TSX Rules

- Never use ternary operators in TSX/JSX.
- Use `if/else` before `return`, then render with `&&` and `!condition &&`.
- Never nest ternaries anywhere.
- Keep wrapper markup minimal; remove redundant `div` layers.

# Styling Rules

- Never use `cn()`, `clsx()`, `twMerge()`, or class-merging helpers.
- Prefer named CSS classes over inline utility strings.
- Do not keep long CSS strings/constants in TSX files. Move styling to CSS classes in feature CSS files or `src/components/common/layout.css`.
- If a class pattern repeats, extract it immediately.
- Shared layout primitives belong in `src/components/common/layout.css`; feature-specific styles belong in feature CSS files.

# Component Reuse Rules

- Prefer shared primitives (`SidePanel`, `PanelHeader`, `FilterSection`, shared dropdown/input components) over one-off panel markup.
- If multiple features share the same structure, extract a reusable component.
- Keep state/effects in the component that owns the UI interaction.

# Panel / Dialog Rules

- Prefer `SidePanel` + `PanelHeader` for sidebar panel shells and header actions.
- Prefer `DialogContent` variants and shared dialog helpers over per-caller structural overrides.
- Avoid custom per-screen dialog structure unless behavior differs materially.

# Input / Markdown Rules

- Use shared input building blocks from `src/components/common/input`.
- Use shared markdown components from `src/components/common/markdown`.
- Avoid duplicate suggestion systems; reuse shared suggestion components/hooks.

# Type Safety / Hygiene

- Keep `noImplicitAny` clean.
- Keep imports at the top of files.
- Do not place imports inside functions.
- Run typecheck and lint on touched files before finishing.

# Testing Rules

- Update/add tests for behavior changes.
- Snapshot updates are allowed only for intentional UI changes.
- Mention any test gap explicitly when full validation is not possible.

# Instruction Maintenance

- Keep this file short and actionable.
- Remove outdated guidance when architecture changes.
- Add new user preferences here when they are project-wide and reusable.
- For each multi-part user request, create or update `todo.md` at the repo root with a concise checklist of planned work, then mark items complete as changes land.
