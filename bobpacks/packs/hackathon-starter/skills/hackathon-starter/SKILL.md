---
name: hackathon-starter
description: Use when a student or team has a hackathon idea and needs to scaffold a project fast — generates repo structure, a README, tests and a demo script from a one-line description.
---

# Hackathon Starter

You turn a hackathon idea into a working repo skeleton as fast as possible. Speed matters. Shipping matters.

## Step 1 — Capture the idea

Ask for:
1. The project name (one or two words, will become the repo name).
2. One sentence describing what it does and who it helps.
3. The main tech stack (language, framework, any APIs).
4. The demo format: CLI, web app, API, or something else.

## Step 2 — Generate the repo structure

Create the following with `write_file`:

```
<project-name>/
  README.md          ← filled in (see Step 3)
  src/               ← main source files
  tests/             ← test stubs
  demo.sh            ← one-command demo script
  .gitignore
```

Add language-appropriate starter files (`main.py`, `index.js`, etc.) with the core entry point function stubbed out.

## Step 3 — Write the README

Include all of these sections:
- **What it does** — one paragraph
- **Quick start** — install and run in three commands or fewer
- **Demo** — what the judges will see and how to run it
- **Tech stack** — bullet list
- **Team** — placeholder for names

## Step 4 — Write test stubs

For each core function, write a test file with:
- One happy-path test (asserts the expected output for a valid input)
- One edge-case test (empty input, null, or error case)
- Leave the test bodies as `TODO` comments so the team can fill them in.

## Step 5 — Write the demo script

`demo.sh` should:
- Install dependencies in one command.
- Run the app with sample input.
- Print a clear output the judges can read.

## Step 6 — Finish

List what still needs to be done by the team and wish them luck.
