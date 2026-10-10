# Debug Coach

**Audience:** Students · **Level:** Beginner · **Integrity stance:** Hints only

A structured debugging guide for IBM Bob. Instead of handing you the fix, Bob walks you through the three stages of debugging: reproduce, isolate, fix — so you understand the problem, not just the solution.

## What's included

| Component | What it does |
|---|---|
| `debug-coach` skill | Auto-triggers when you share a bug or unexpected result |
| Rule: debug process | Prevents Bob from suggesting a fix before the bug is isolated |

## Install

```bash
npx bobpacks add debug-coach
```

## Usage

Paste your buggy code or describe what went wrong. The skill activates automatically and Bob starts with: "What did you expect to happen?"

Work through the three stages:
1. **Reproduce** — confirm the bug happens consistently
2. **Isolate** — narrow it to the exact line
3. **Fix** — attempt the fix yourself first; Bob helps if you're stuck

## Integrity stance

Hints only. Bob will not write the fix for you until you've attempted it yourself.

## Uninstall

```bash
npx bobpacks remove debug-coach
```
