<img width="1147" height="361" alt="image" src="https://github.com/user-attachments/assets/2f7b266e-6e08-4eee-8331-a63386a0099b" />

A client-first notes and todo tracker for Blue Prince. Blue Prince Journal is currently hosted on [Cloudflare Pages](https://blue-prince-journal.pages.dev/). It is local-first and supports downloading or uploading your data.

# Environment Setup

## Option 1: Dev Container (recommended)

This repository includes a dev container configuration in `.devcontainer/devcontainer.json`.

1. Open this repository in VS Code.
2. Run **Dev Containers: Rebuild and Reopen in Container**.
3. Wait for post-create tasks to finish.

What happens automatically:

- `ripgrep` is installed (if missing)
- `npm ci` runs to install project dependencies

After the container is ready:

```bash
npm run dev
```

The app will be available at the URL shown by Vite in the terminal (typically `http://localhost:5173`).

## Option 2: Local Machine Setup

Install dependencies:

```bash
npm ci
```

Start development server:

```bash
npm run dev
```

## Useful Commands

```bash
# Type check
npm run check:types

# Lint
npm run lint

# Unit + integration tests (Vitest)
npm test

# Playwright end-to-end tests
npm run test:e2e

# Production build
npm run build
```

## Troubleshooting

- `npm run dev` fails with command not found or exit code 127:
	Run `npm ci` first so local binaries (such as Vite) are installed.
- Dependency resolution issues:
	Remove `node_modules` and run `npm ci` again.
- Playwright test failures on first run:
	Install browsers with `npx playwright install`.

# Features

- Track notes, rooms and the story of the world of blue prince
- Graph to connect clues and story
- Track todos and mark them as completed when finished
- Upload images with the notes to help and remember the context
- Backup and upload your progress or activate sync to local folder to keep your progress secure
- Dark/Light mode

# Gallery

## Track the notes:

<img width="1260" height="502" alt="image" src="https://github.com/user-attachments/assets/f38e752c-6f93-413d-b7e1-b38653a36788" />

## Keep logs on the map:

<img width="1254" height="834" alt="image" src="https://github.com/user-attachments/assets/5fea20d3-3e3b-46c7-b0a1-138a68cfe18b" />

## Create detailed connections through the notes documentation with `@room`, `#tag` and more

<img width="1270" height="795" alt="image" src="https://github.com/user-attachments/assets/678dec61-e114-4b13-bc33-cfd2099e7135" />

## Easier tracking of todo list and what is finished and what to begin with!

<img width="1259" height="341" alt="image" src="https://github.com/user-attachments/assets/7d854301-1963-446d-a3de-3dea1822b060" />
