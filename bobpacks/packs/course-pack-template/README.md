# Course Pack Template

**Audience:** Educators · **Level:** Beginner · **Integrity stance:** Course policy

An instructor-ready starter pack for IBM Bob. Commit it to your course assignment repository and every student who opens it automatically gets the same Bob rules, tone and scope — no installation step required for students.

## What's included

| Component | What it does |
|---|---|
| `📚 Course Assistant` mode | Sets Bob's persona to follow the course's integrity policy |
| Rule: `01-integrity.md` | States what Bob will and will not do for students (edit to match your syllabus) |
| Rule: `02-tone.md` | Sets Bob's communication level and style for the course |
| Rule: `03-scope.md` | Limits Bob to the topics and tools covered in the course |
| `AGENTS.snippet.md` | Adds a course context block to AGENTS.md with a template for instructors to fill in |

## Two ways to use this pack

## Usage

After installing and customizing, switch to **📚 Course Assistant** mode in the Bob panel. Students working in a repo that contains `.bob/` will have the course rules applied automatically in any mode.

See the [Customization](#customization-required-before-using-in-a-real-course) section to edit the rules files before committing.

## Two ways to use this pack

### Option A — Commit to a course repo (recommended for classrooms)

Students get the full setup the moment they clone the assignment repo. No `npx` command needed.

1. Install the pack into your course repository:
   ```bash
   npx bobpacks add course-pack-template
   ```
2. Edit the installed files to match your course (see Customization below).
3. Commit `.bob/` and `AGENTS.md` to the repository.
4. Students clone the repo and open it — Bob is automatically configured.

### Option B — Install individually

```bash
npx bobpacks add course-pack-template
```

## Customization (required before using in a real course)

After installing, edit these files to match your course:

| File | What to change |
|---|---|
| `AGENTS.md` (the `<!-- bobpacks:course-pack-template -->` block) | Course name, institution, term, assignment structure |
| `.bob/rules/01-integrity.md` | Your specific policy — what Bob may and may not help with |
| `.bob/rules/03-scope.md` | Topics and frameworks covered in your course |

The `02-tone.md` rule works as-is for most courses but can be adjusted for level.

## Integrity stance

This pack uses `course-policy`: the installed rules define what Bob will and will not do, and instructors decide the policy. The pack itself does not set policy for any institution.

## Uninstall

```bash
npx bobpacks remove course-pack-template
```

Removes only the files this pack added. AGENTS.md content added inside the `<!-- bobpacks:course-pack-template -->` markers is also removed.
