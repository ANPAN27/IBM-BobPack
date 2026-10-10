# watsonx Orchestrate Developer

**Audience:** Developers · **Level:** Intermediate · **IBM Products:** watsonx Orchestrate

Build IBM watsonx Orchestrate agents, tools, skills and flows with Bob guiding you through the platform's conventions and common pitfalls.

## What's included

| Component | What it does |
|---|---|
| `watsonx-orchestrate` skill | Auto-triggers when you ask about Orchestrate tools, skills, flows or agents |
| Rule: Orchestrate conventions | Enforces correct tool definition patterns and pinned MCP versions |

## Install

```bash
npx bobpacks add watsonx-orchestrate
```

## Requirements

- An IBM Cloud account with watsonx Orchestrate access
- `WATSONX_API_KEY` environment variable (optional — needed for live API calls)

## Usage

Ask Bob about any Orchestrate concept:

```
Build a tool that looks up a customer's order status from our API
```
```
What's wrong with this tool definition? [paste JSON]
```
```
Create a flow that: gets customer data → checks their tier → sends a discount if they're premium
```

## Uninstall

```bash
npx bobpacks remove watsonx-orchestrate
```
