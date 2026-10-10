# BobPacks

Install a complete, tested IBM Bob setup with one command.

```bash
npx bobpacks add code-tutor
```

**BobPacks** is an open registry of packs — each pack bundles skills, custom modes, rules, MCP config and AGENTS.md into a single versioned unit. Every pack is validated in CI before it can be listed.

→ **[bobpacks.dev](https://bobpacks.dev)** · Browse, filter and find packs on the website.

---

## Quick start

```bash
# Install a pack into the current project
npx bobpacks add code-tutor

# Install globally (skills and modes available in every project)
npx bobpacks add code-tutor --global

# Remove a pack (only removes what it added)
npx bobpacks remove code-tutor

# Browse packs offline
npx bobpacks list
npx bobpacks search debugging
npx bobpacks info code-tutor
```

## Available packs

| Pack | Audience | Level | Components |
|---|---|---|---|
| [`code-tutor`](packs/code-tutor/) | Student | Beginner | Mode, skill, rules |
| [`course-pack-template`](packs/course-pack-template/) | Educator | Beginner | Mode, rules, AGENTS.md |

More packs are on the roadmap — see [Launch pack catalog](#launch-pack-catalog).

## How packs work

A pack is a folder in `packs/` with a `pack.json` manifest and up to five component types:

| Component | Installed to | Notes |
|---|---|---|
| Skills | `.bob/skills/<name>/` | Activates automatically based on `description` in SKILL.md |
| Custom modes | `.bob/custom_modes.yaml` | Merged by `slug`; never overwrites an existing mode |
| Rules | `.bob/rules[-<mode-slug>]/` | Loaded alphabetically; files use numeric prefixes |
| MCP config | `.bob/mcp.json` | Merged by server key; shows a diff and asks for confirmation |
| AGENTS.md snippet | `AGENTS.md` | Appended inside `<!-- bobpacks:<name> -->` markers |

The CLI writes a `bobpacks.lock.json` file that records everything a pack added. `bobpacks remove` uses it to undo exactly those changes.

## Bob V2 file locations

All paths are verified against [IBM Bob documentation](https://bob.ibm.com/docs):

| Component | Project path | Global path (`--global`) |
|---|---|---|
| Skills | `.bob/skills/<name>/` | `~/.bob/skills/<name>/` |
| Custom modes | `.bob/custom_modes.yaml` | `~/.bob/settings/custom_modes.yaml` |
| Rules | `.bob/rules[-<slug>]/` | `~/.bob/rules[-<slug>]/` |
| MCP config | `.bob/mcp.json` | `~/.bob/mcp.json` |
| AGENTS.md | `AGENTS.md` (project root) | `~/.bob/AGENTS.md` |

## Pack format

```
my-pack/
  pack.json              # manifest — name, version, audience, components
  README.md
  skills/
    my-skill/SKILL.md    # SKILL.md: name + description frontmatter required
  modes/
    my-mode.yaml         # customModes: array; slug must match pack.json
  rules/
    my-pack/01-rule.md   # numeric prefix controls load order
  mcp/
    mcp.fragment.json    # { "mcpServers": { ... } } — servers must be pinned
  agents/
    AGENTS.snippet.md    # wrapped in <!-- bobpacks:<name> --> markers
  tests/
    scenarios.yaml       # used for the quality score
```

See [`schemas/pack.schema.json`](schemas/pack.schema.json) for the full manifest schema.

## Quality score

Every listed pack has a score from 0–100:

| Layer | Weight | Required to list |
|---|---|---|
| Schema | 20 | ✓ |
| Safety lint | 25 | ✓ |
| Content quality | 20 | — |
| Scenario tests | 25 | — (v1 ships "unverified runtime") |
| Maintenance | 10 | — |

Run the validator locally:

```bash
cd bobpacks
node scripts/validate.js
```

## Contributing a pack

1. Fork this repository.
2. Create a folder in `packs/<your-pack-name>/` and add `pack.json`, component files and `README.md`.
3. Run `node scripts/validate.js` — all required checks must pass.
4. Open a pull request. CI runs validation automatically.
5. A maintainer reviews and merges. The pack appears in the registry on the next tagged release.

The pack name must be unique, lowercase with hyphens only, and match the folder name exactly (`^[a-z0-9]+(-[a-z0-9]+)*$`).

### Student and educator packs

- Must include `integrityStance` in `pack.json`: `hints-only`, `full-solutions` or `course-policy`.
- Must mention the integrity stance in `README.md`.
- Skills must have a `description` field in `SKILL.md` of at least 20 characters — Bob silently ignores skills without one.

### Security rules

- No secret values anywhere in the pack (API keys, tokens, passwords).
- No destructive shell commands in skill bodies.
- MCP servers must be pinned to a specific version or commit — not `:latest`.

## Launch pack catalog

The 10 packs planned for launch:

| Pack | Audience | Status |
|---|---|---|
| Code Tutor | Student, beginner | ✓ Shipped |
| Debug Coach | Student | Planned |
| Assignment Planner | Student | Planned |
| Study Buddy | Student | Planned |
| Hackathon Starter | Student builder | Planned |
| Course Pack Template | Educator | ✓ Shipped |
| watsonx Orchestrate Developer | Developer | Planned |
| Security Reviewer | Developer | Planned |
| COBOL Modernizer | Developer | Planned |
| Carbon UI Builder | Developer | Planned |

## Repository structure

```
bobpacks/
  packs/               # one folder per pack
  schemas/             # pack.schema.json and registry.schema.json
  scripts/             # validate.js, sync.js, package.js (CI)
  cli/                 # npm package — bobpacks add/remove/list/search/info
  registry.json        # generated registry — do not edit by hand
  .github/workflows/   # CI: validate on PR, publish on tag
```

## License

MIT — see [LICENSE](LICENSE).

Packs declare their own open licenses in `pack.json`. The registry code is MIT.
