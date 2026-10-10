# COBOL Modernizer

**Audience:** Developers · **Level:** Advanced · **IBM Products:** COBOL, Mainframe, z/OS

A domain-specific mode for IBM mainframe COBOL modernization. Switch to 🖥 COBOL Modernizer and Bob understands COBOL idioms, z/OS context and IBM i, explains legacy constructs in plain language, and guides you through safe, incremental migration to Java or Python.

## What's included

| Component | What it does |
|---|---|
| `🖥 COBOL Modernizer` mode | Mainframe-aware persona with z/OS, CICS and DB2 context |
| `cobol-modernizer` skill | Auto-triggers when COBOL code or modernization questions are shared |
| `AGENTS.snippet.md` | Adds project-specific COBOL context to AGENTS.md |

## Install

```bash
npx bobpacks add cobol-modernizer
```

Edit the `<!-- bobpacks:cobol-modernizer -->` block in `AGENTS.md` to specify your COBOL dialect and target platform.

## Usage

Paste COBOL source:

```
PERFORM VARYING WS-IDX FROM 1 BY 1 UNTIL WS-IDX > WS-MAX
    MOVE WS-TABLE(WS-IDX) TO WS-CURRENT
    ...
END-PERFORM
```

Bob explains the construct, maps it to a Python/Java equivalent, and flags any modernization risks.

You can also ask for a full migration plan:

```
Here is our main COBOL program. Give me a modernization plan.
```

## Uninstall

```bash
npx bobpacks remove cobol-modernizer
```
