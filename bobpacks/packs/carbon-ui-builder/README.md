# Carbon UI Builder

**Audience:** Developers · **Level:** Intermediate · **IBM Products:** Carbon Design System

Build IBM Carbon Design System React UIs with Bob ensuring you use the right component APIs, design tokens and accessibility patterns every time.

## What's included

| Component | What it does |
|---|---|
| `carbon-ui-builder` skill | Auto-triggers when you ask about Carbon components, tokens or layout |

## Install

```bash
npx bobpacks add carbon-ui-builder
```

## Requirements

```bash
npm install @carbon/react
```

## Usage

Ask Bob to build or review any Carbon UI:

```
Build a data table that shows order history with search and a filter toolbar
```
```
Review this form for Carbon accessibility issues
```
```
What's the correct Carbon token for a disabled button label?
```

Bob always imports from `@carbon/react`, uses design tokens instead of hardcoded values, and includes required accessibility props.

## Uninstall

```bash
npx bobpacks remove carbon-ui-builder
```
