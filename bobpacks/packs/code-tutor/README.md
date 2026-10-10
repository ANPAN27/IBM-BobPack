# Code Tutor

**Audience:** Students · **Level:** Beginner · **Integrity stance:** Hints only

A Socratic tutor pack for IBM Bob. Instead of handing you the answer, Bob asks you a guiding question or gives you a targeted hint so you learn by doing.

## What's included

| Component | What it does |
|---|---|
| `🎓 Code Tutor` mode | Sets Bob's persona and teaching protocol for the session |
| `code-tutor` skill | Auto-triggers when you share an error or ask why your code doesn't work |
| Rule: hints not solutions | Prevents Bob from pasting a full fix before you've tried |
| Rule: explain errors first | Makes Bob explain what an error means before suggesting where it is |

## Install

```bash
npx bobpacks add code-tutor
```

After installing, switch to **🎓 Code Tutor** mode in the Bob panel.

## Usage

Just work normally. When you paste an error or ask a debugging question, the `code-tutor` skill activates automatically and Bob shifts into tutoring mode.

To ask for a hint explicitly:

```
/code-tutor I'm stuck on this loop
```

If you've tried multiple times and want the answer directly, say:

> I've tried three times — can you just show me the fix?

Bob will give you the corrected code and explain why it works.

## Integrity stance

This pack is **hints-only**. Bob will not write your graded assignment for you. It is designed to help you understand your own code, not to complete work on your behalf. Instructors can verify this by reading the rules files installed to `.bob/rules-code-tutor/`.

## Uninstall

```bash
npx bobpacks remove code-tutor
```

This removes only the files this pack added. Your other Bob settings are untouched.
