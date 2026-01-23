# AGENTS.md

This repository is a small, static GitHub Pages app. It is plain HTML/CSS/JS
with no build system, dependencies, or test runner. Use this file as the
operational guide for agentic tools editing this repo.

## Repo overview
- Single-page app: `index.html`
- Styles: `styles.css`
- Logic: `app.js`
- Persistence: `localStorage` under key `sql-quoter-settings`

## Build, lint, test
There is no build, lint, or test tooling in this repo.

### Local run options
- Open directly in a browser: double-click `index.html`
- Optional simple local server:
  - `python3 -m http.server 8000`
  - Then open `http://localhost:8000/`

### Single test
- No test framework is present.
- If you add tests later, document the command here.

## Rules from Cursor/Copilot
- No Cursor rules were found (`.cursor/rules/` or `.cursorrules` missing).
- No Copilot rules were found (`.github/copilot-instructions.md` missing).

## Code style guidelines
This is intentionally minimal and should stay that way.

### JavaScript
- Use modern, readable ES2015+ syntax (const/let, arrow functions).
- Prefer small, pure helper functions for transforms.
- Avoid classes unless clearly beneficial.
- Keep DOM access centralized (currently in `ui`).
- Keep `compute()` as the main pipeline entry point.
- Avoid external libraries; keep logic vanilla and portable.
- Do not introduce a build step unless requested.
- Use single quotes only for SQL quoting, not for JS strings; follow current
  double-quote JS string style for consistency.
- Prefer template strings for interpolated output (already used in warnings).

### Imports and modules
- No ES modules are used. Keep all JS in `app.js`.
- If you need to split, prefer separate files with simple `<script src=...>`
  tags rather than bundlers.

### Formatting
- Two-space indentation.
- One statement per line; avoid overly long lines where feasible.
- Keep functions separated by a blank line.
- Keep logic blocks short and readable.

### Naming conventions
- DOM element references live in the `ui` object.
- Use `camelCase` for functions and variables.
- Use explicit names: `formatInList`, `formatLogic`, `parseLines`.
- Use constants for shared keys (e.g., `settingsKey`).

### Error handling
- Handle user input safely and defensively.
- Fail softly (e.g., empty input -> empty output).
- Use non-blocking UI feedback (status line) for warnings.
- Avoid throwing errors for user mistakes; instead show a warning string.

### State and persistence
- `localStorage` is the only persistent state.
- Keep `loadSettings`, `saveSettings`, and `resetSettings` the only functions
  that touch storage.
- When adding new controls, update the settings object and defaults handling.

### UI and UX
- Minimal, black/white palette; avoid color noise.
- Keep the control bar compact and scannable.
- Keep copy/reset/clear actions as primary and instant.
- Hide irrelevant controls based on mode (`IN` vs `AND/OR`).
- Avoid intrusive alerts or modals.

### HTML
- Keep the markup semantic and minimal.
- IDs must be unique and match the `ui` mapping in `app.js`.
- Prefer single source of truth for labels and control text.

### CSS
- Keep styles in `styles.css`.
- Use CSS variables for palette and shared tokens.
- Prefer utility-like class names already in use (`wrap`, `card`, `ctrl`).
- Keep layout responsive; maintain the two-column grid on desktop.
- Avoid heavy animations or external fonts.

## Functional behavior expectations
- `IN` mode:
  - With column -> `column IN (...)`
  - Without column -> `(...)`
  - Single-line list uses commas without trailing comma.
  - Multi-line list respects comma style and never adds comma to last item.
- `AND/OR` mode:
  - One predicate per line.
  - First line has no joiner; subsequent lines have leading joiner.
  - Blank column defaults to `col` for all values.
  - Multiple columns only pair when counts match.

## Safe changes checklist
- Preserve output formats for existing modes.
- Keep defaults stable unless explicitly asked to change.
- Update `resetSettings` and `saveSettings` when adding controls.
- Ensure `updateVisibility()` toggles new controls correctly.
- Keep HTML ids aligned with JS mappings.

## Files to update when adding features
- `index.html`: new controls and structure changes.
- `styles.css`: style updates for new controls.
- `app.js`: behavior, parsing, formatting, storage.

## Deployment
- GitHub Pages can serve `index.html` directly.
- No build artifacts are required.
- Keep all assets in repo root unless a directory is added intentionally.
