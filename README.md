# You Can Quote Me

This is a small, static GitHub Pages app. It is plain HTML/CSS/JS with no build
step.

## What It Does

Turns raw lists into SQL-friendly quoted output so you can quickly build
`IN (...)` lists or `AND/OR` predicates without manual quoting.

Examples:

- Input list:

```text
apple
banana
cherry
```

- `IN` mode output:

```sql
('apple', 'banana', 'cherry')
```

- `AND/OR` mode output (column: `fruit`, joiner: `OR`):

```sql
fruit = 'apple'
OR fruit = 'banana'
OR fruit = 'cherry'
```

## Why It Exists

It keeps everyday data cleanup fast and copy-pasteable: drop in values from a
spreadsheet, pick a mode, and get ready-to-use SQL fragments in one click.

## Local Run

Option 1: open `index.html` directly in your browser.

Option 2: run a simple local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Deploy to GitHub Pages (root)

1. Push this repo to GitHub.
2. In GitHub: Settings -> Pages -> Source: Deploy from a branch.
3. Select your branch (for example, `main`) and set Folder to `/ (root)`.

Tip: `.nojekyll` is included so Pages serves files from the root without
Jekyll processing.
