# Security Reviewer

**Audience:** Developers, advanced students · **Level:** Advanced

A full security review bundle. Switch to the 🔒 Security Reviewer mode and Bob becomes a systematic security auditor — checking auth, input validation, secrets, dependencies and error handling, and producing a findings table with severity levels.

## What's included

| Component | What it does |
|---|---|
| `🔒 Security Reviewer` mode | Dedicated security auditor persona with structured findings output |
| `security-reviewer` skill | Auto-triggers on review requests; covers five security categories |
| Rule: security checklist | Enforces all five categories are checked every review |

## Install

```bash
npx bobpacks add security-reviewer
```

Switch to **🔒 Security Reviewer** mode in the Bob panel after installing.

## Usage

Paste code, a PR diff or a system design description:

```
Review this Express.js auth middleware for security issues
```

Bob produces a findings table:

| # | Severity | Category | Location | Finding | Recommendation |
|---|---|---|---|---|---|
| 1 | Critical | Secrets | line 12 | API key hardcoded | Move to env var |

Followed by an overall security posture summary.

## Uninstall

```bash
npx bobpacks remove security-reviewer
```
