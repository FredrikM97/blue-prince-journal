# Copilot Setup for VS Code (React + TypeScript + Tailwind)

This package gives you:

- a repository-wide Copilot instruction file
- reusable Copilot slash prompts
- examples of **good** and **bad** prompt usage for each mode

The setup is intentionally designed for:

- reusable React primitives
- strong TypeScript boundaries
- Tailwind consistency
- low duplication across components, hooks, and services

---

## Included Files

```text
.github/
  copilot-instructions.md
  prompts/
    feature.prompt.md
    refactor.prompt.md
    bugfix.prompt.md
    minimal.prompt.md
    compose.prompt.md
README.md
```

---

## Why this structure

Use **custom instructions** for always-on project rules and coding standards. In VS Code, a single `.github/copilot-instructions.md` file is automatically applied to all chat requests in the workspace. Prompt files (`*.prompt.md`) are reusable slash-commands you invoke manually in chat for common tasks. Workspace prompt files belong in `.github/prompts`. citeturn31search9turn31search19

Prompt files support YAML frontmatter such as `name`, `description`, `argument-hint`, and `agent`, and they are invoked in chat as `/promptName` (or by filename if `name` is omitted). Prompt files are currently in public preview. citeturn31search19turn31search20

---

## How to add this to your project in VS Code

1. Copy the `.github/copilot-instructions.md` file into the root of your repository under `.github/`. VS Code treats this as repository-wide custom instructions and includes it automatically in Copilot Chat requests for that workspace. citeturn31search9turn31search10
2. Copy the `.github/prompts/*.prompt.md` files into your repository. Workspace prompt files are discovered from `.github/prompts` by default. citeturn31search19turn31search10
3. Open Copilot Chat in VS Code and type `/`. You should see your prompt files appear as slash commands, such as `/feature`, `/refactor`, or `/bugfix`. Prompt files are specifically intended for reusable, task-focused prompts in chat. citeturn31search19turn31search18
4. If you want to manage customizations from the UI, use the Command Palette and run **Chat: Open Customizations**. VS Code documents this editor as the place to discover, create, and manage instructions and prompt files. citeturn31search9turn31search19

> Important: repository custom instructions influence Copilot Chat behavior, but they are **not used for inline suggestions while typing**. citeturn31search9

---

## Recommended workflow

- Use `/feature` when adding or extending functionality.
- Use `/refactor` when you want to simplify, consolidate, or remove duplication.
- Use `/bugfix` when broken behavior needs a minimal safe fix.
- Use `/minimal` for tiny, scoped changes.
- Use `/compose` when building a reusable shell such as a dialog, preview, drawer, or panel.

The instruction file stays always-on. The prompt you choose tells Copilot **what type of task** you are doing, while the instruction file tells it **how your codebase should be changed**. This matches VS Code and GitHub’s guidance: instructions provide ongoing rules, while prompt files are reusable task templates. citeturn31search9turn31search10turn31search19

---

## Prompt simulations: good vs bad usage

These are written exactly like a developer would type them into Copilot Chat.

### `/feature`

**Good:**

```text
/feature Add keyboard navigation to the existing PreviewDialog using the current hook pattern. Do not create a new preview component.
```

Why it works:
- clear goal
- points to an existing component
- explicitly asks for reuse
- avoids duplication

**Good:**

```text
/feature Extend Button to support a loading state using existing button styling and current prop patterns.
```

Why it works:
- extends an existing primitive
- references existing patterns
- encourages consistency

**Bad:**

```text
/feature Create ImagePreviewDialog and VideoPreviewDialog with their own styles and custom controls.
```

Why it is bad:
- duplicates behavior
- duplicates styling
- creates specialized components for one concept

**Bad:**

```text
/feature Add upload support and also redesign the dialog system to be more scalable in the future.
```

Why it is bad:
- mixes feature work and refactor work
- invites speculative architecture changes

---

### `/refactor`

**Good:**

```text
/refactor Merge duplicate preview logic in ImagePreview and FilePreview into one reusable PreviewDialog and move shared interactions into a hook.
```

Why it works:
- identifies duplication
- consolidates one concept into one component
- keeps behavior centralized

**Good:**

```text
/refactor Standardize repeated Tailwind spacing and layout patterns across dialog actions without changing behavior.
```

Why it works:
- targets duplication and inconsistency
- preserves behavior

**Bad:**

```text
/refactor Rewrite the UI layer with a more flexible architecture for potential future growth.
```

Why it is bad:
- too vague
- future-oriented overengineering
- likely to add abstractions instead of removing them

**Bad:**

```text
/refactor Clean this up and add the missing export feature while you are there.
```

Why it is bad:
- mixes refactor and feature work
- increases chance of broad, noisy changes

---

### `/bugfix`

**Good:**

```text
/bugfix Fix the bug where zoom resets after the PreviewDialog rerenders. Keep existing controls and UI behavior unchanged.
```

Why it works:
- describes current bug precisely
- constrains the change
- preserves unrelated behavior

**Good:**

```text
/bugfix Fix the race condition in useUpload where the optimistic state is cleared before the request settles.
```

Why it works:
- points at a likely root cause
- keeps scope tight

**Bad:**

```text
/bugfix Rebuild the preview flow from scratch so the bug cannot happen anymore.
```

Why it is bad:
- overreacts to a bug
- invites a rewrite instead of a focused fix

**Bad:**

```text
/bugfix Fix the upload bug and clean up the dialog, buttons, and styles too.
```

Why it is bad:
- mixes bugfix with unrelated refactor/styling work

---

### `/minimal`

**Good:**

```text
/minimal Rename the prop from isOpen to open in PreviewDialog and update usages only where required.
```

Why it works:
- explicitly minimal
- clear target
- constrained blast radius

**Good:**

```text
/minimal Correct the type of onSelect in FileListItem so it accepts null.
```

Why it works:
- tiny, targeted TypeScript change

**Bad:**

```text
/minimal Refactor the dialog state into a new hook and standardize the styles while you are at it.
```

Why it is bad:
- not minimal
- bundles multiple structural tasks

---

### `/compose`

**Good:**

```text
/compose Create a reusable PreviewDialog shell. Keep zoom and drag configurable with flags, and pass the action buttons via props.
```

Why it works:
- uses a shared shell
- keeps behavior configurable
- small visual differences are handled through composition

**Good:**

```text
/compose Extend the existing Modal shell so the footer actions and header content can be injected as children instead of creating a specialized ExportModal.
```

Why it works:
- reinforces composition over specialization
- avoids duplicate shells

**Bad:**

```text
/compose Create a separate dialog for image preview and another one for file preview because the buttons are slightly different.
```

Why it is bad:
- creates duplicate shells for minor UI differences
- ignores configurable props/children

---

## Writing prompts well

A strong prompt usually includes:

1. **What should change**
2. **Where it belongs** (component, hook, service, etc.)
3. **What constraints matter** (reuse existing component, do not create a new shell, keep change minimal, preserve behavior)

Good general structure:

```text
/<mode> <change> in <target> using <existing pattern/constraint>.
```

Examples:

```text
/feature Add drag-to-pan to PreviewDialog using the existing event handling pattern. Do not create a new preview component.
```

```text
/refactor Consolidate duplicate button variants into the existing Button primitive and remove repeated Tailwind combinations.
```

```text
/bugfix Fix the stale state bug in useSelection without changing the component API.
```

---

## When not to use a prompt

Do **not** use prompt files as a replacement for Git operations or editor features. For example, `/rebase` is not a good Copilot prompt for this package, because rebase is a Git workflow operation, not a code-generation pattern for React/TypeScript/Tailwind changes.

If you need Git help, ask directly in chat or use Git tooling. Keep prompt files focused on repeatable development tasks. Prompt files are intended for lightweight, reusable tasks in chat. citeturn31search19

---

## Final recommendation

Keep the instruction file stable. Most long-term gains will come from:

- writing tighter prompts
- scoping changes to the right file or component
- keeping reusable logic in hooks/services and UI in components

That combination gives Copilot the strongest signal with the least noise. This matches documented guidance to start with a single repository-wide instruction file and add prompt files for common workflows. citeturn31search9turn31search10
