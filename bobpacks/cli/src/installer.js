/**
 * installer.js — installs all components of a pack into the current project
 * or the user's home .bob/ directory when --global is set.
 *
 * Bob V2 file locations (verified against IBM docs):
 *   Skills        project: <cwd>/.bob/skills/<name>/
 *                 global:  ~/.bob/skills/<name>/
 *   Custom modes  project: <cwd>/.bob/custom_modes.yaml
 *                 global:  ~/.bob/settings/custom_modes.yaml
 *   Rules         project: <cwd>/.bob/rules[-<mode-slug>]/<file>
 *                 global:  ~/.bob/rules[-<mode-slug>]/<file>
 *   MCP config    project: <cwd>/.bob/mcp.json
 *                 global:  ~/.bob/mcp.json
 *   AGENTS.md     project: <cwd>/AGENTS.md (root)
 *                 global:  ~/.bob/AGENTS.md
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { readLockfile, writeLockfile } from './lockfile.js';

const REGISTRY_URL = 'https://registry.bobpacks.dev/registry.json';
const REGISTRY_CACHE = path.join(os.homedir(), '.bob', 'bobpacks-cache', 'registry.json');

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Install a pack by name into the project (or globally).
 * @param {string} packName
 * @param {{ global: boolean, force: boolean, yes: boolean }} flags
 */
export async function installPack(packName, flags) {
  const registry = await loadRegistry();
  const entry = registry.packs.find(p => p.name === packName);
  if (!entry) {
    throw new Error(`Pack "${packName}" not found in registry. Run "bobpacks list" to see available packs.`);
  }

  const packDir = await downloadPack(entry);
  const manifest = readManifest(packDir);

  const roots = resolveRoots(flags.global);

  console.log(`\nInstalling ${manifest.name}@${manifest.version}…\n`);
  printInstallSummary(manifest, roots);

  const lockfile = readLockfile(process.cwd());
  if (lockfile.packs[packName] && !flags.force) {
    throw new Error(`"${packName}" is already installed. Use --force to reinstall.`);
  }

  const installed = { files: [], modesAdded: [], mcpKeysAdded: [], agentsBlocks: [] };

  if (manifest.components.skills) {
    for (const skill of manifest.components.skills) {
      installSkill(packDir, skill, roots, flags, installed);
    }
  }

  if (manifest.components.modes) {
    for (const mode of manifest.components.modes) {
      await installMode(packDir, mode, roots, flags, installed);
    }
  }

  if (manifest.components.rules) {
    for (const rule of manifest.components.rules) {
      installRule(packDir, rule, roots, flags, installed);
    }
  }

  if (manifest.components.mcp) {
    await installMcp(packDir, manifest.components.mcp, roots, flags, installed);
  }

  if (manifest.components.agents) {
    await installAgents(packDir, manifest.components.agents, roots, flags, installed);
  }

  lockfile.packs[packName] = {
    version: manifest.version,
    installedAt: new Date().toISOString(),
    global: flags.global,
    ...installed,
  };
  writeLockfile(process.cwd(), lockfile);

  console.log(`\n✓ ${manifest.name}@${manifest.version} installed.\n`);
  printNextSteps(manifest);
}

/**
 * Remove a previously installed pack using the lockfile.
 * @param {string} packName
 * @param {{ global: boolean }} flags
 */
export async function removePack(packName, flags) {
  const lockfile = readLockfile(process.cwd());
  const entry = lockfile.packs[packName];
  if (!entry) {
    throw new Error(`"${packName}" is not installed (not found in bobpacks.lock.json).`);
  }

  console.log(`\nRemoving ${packName}@${entry.version}…`);

  // Remove copied files
  for (const filePath of entry.files) {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath);
      console.log(`  ✗ removed ${relCwd(filePath)}`);
      // Remove empty parent directories up to .bob/
      pruneEmptyDirs(path.dirname(filePath));
    }
  }

  // Remove mode entries from custom_modes.yaml
  if (entry.modesAdded?.length) {
    const roots = resolveRoots(entry.global);
    removeModeEntries(entry.modesAdded, roots);
  }

  // Remove MCP server entries
  if (entry.mcpKeysAdded?.length) {
    const roots = resolveRoots(entry.global);
    removeMcpEntries(entry.mcpKeysAdded, roots);
  }

  // Remove AGENTS.md blocks
  if (entry.agentsBlocks?.length) {
    const roots = resolveRoots(entry.global);
    removeAgentsBlocks(entry.agentsBlocks, roots, packName);
  }

  delete lockfile.packs[packName];
  writeLockfile(process.cwd(), lockfile);

  console.log(`\n✓ ${packName} removed.\n`);
}

// ---------------------------------------------------------------------------
// Component installers
// ---------------------------------------------------------------------------

function installSkill(packDir, skill, roots, flags, installed) {
  const src = path.join(packDir, skill.path);
  const dest = path.join(roots.skills, skill.name);

  if (fs.existsSync(dest) && !flags.force) {
    throw new Error(
      `Skill "${skill.name}" already exists at ${relCwd(dest)}. Use --force to overwrite.`
    );
  }

  copyDir(src, dest, installed);

  // If autoInvoke is explicitly false, patch the SKILL.md frontmatter
  if (skill.autoInvoke === false) {
    const skillMd = path.join(dest, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      patchSkillAutoInvoke(skillMd, false);
    }
  }

  console.log(`  ✓ skill  → ${relCwd(dest)}`);
}

async function installMode(packDir, mode, roots, flags, installed) {
  const srcFile = path.join(packDir, mode.path);
  const srcYaml = parseYaml(fs.readFileSync(srcFile, 'utf8'));
  const srcModes = srcYaml.customModes ?? [];

  const modesFile = roots.modesFile;
  let existingDoc = { customModes: [] };
  if (fs.existsSync(modesFile)) {
    existingDoc = parseYaml(fs.readFileSync(modesFile, 'utf8')) ?? { customModes: [] };
  }
  existingDoc.customModes ??= [];

  const existingSlugs = new Set(existingDoc.customModes.map(m => m.slug));

  for (const modeEntry of srcModes) {
    if (existingSlugs.has(modeEntry.slug) && !flags.force) {
      throw new Error(
        `Mode slug "${modeEntry.slug}" already exists in ${relCwd(modesFile)}. Use --force to overwrite.`
      );
    }
    if (existingSlugs.has(modeEntry.slug)) {
      existingDoc.customModes = existingDoc.customModes.filter(m => m.slug !== modeEntry.slug);
    }
    existingDoc.customModes.push(modeEntry);
    installed.modesAdded.push(modeEntry.slug);
  }

  fs.mkdirSync(path.dirname(modesFile), { recursive: true });
  fs.writeFileSync(modesFile, stringifyYaml(existingDoc));
  console.log(`  ✓ mode   → ${relCwd(modesFile)} (slug: ${srcModes.map(m => m.slug).join(', ')})`);
}

function installRule(packDir, rule, roots, flags, installed) {
  const src = path.join(packDir, rule.path);
  const destDir = path.join(roots.bob, rule.installTo);
  const destFile = path.join(destDir, path.basename(rule.path));

  if (fs.existsSync(destFile) && !flags.force) {
    throw new Error(
      `Rule "${path.basename(rule.path)}" already exists at ${relCwd(destFile)}. Use --force to overwrite.`
    );
  }

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, destFile);
  installed.files.push(destFile);
  console.log(`  ✓ rule   → ${relCwd(destFile)}`);
}

async function installMcp(packDir, mcpComponent, roots, flags, installed) {
  const fragmentFile = path.join(packDir, mcpComponent.path);
  const fragment = JSON.parse(fs.readFileSync(fragmentFile, 'utf8'));
  const mcpFile = roots.mcpFile;

  let existing = { mcpServers: {} };
  if (fs.existsSync(mcpFile)) {
    existing = JSON.parse(fs.readFileSync(mcpFile, 'utf8'));
  }
  existing.mcpServers ??= {};

  const conflicts = Object.keys(fragment.mcpServers ?? {}).filter(k => existing.mcpServers[k]);
  if (conflicts.length && !flags.force) {
    console.log('\n  MCP server name conflicts:');
    conflicts.forEach(k => console.log(`    • "${k}" already exists`));
  }

  const diff = buildMcpDiff(existing.mcpServers, fragment.mcpServers ?? {});
  console.log('\n  MCP changes to be written to ' + relCwd(mcpFile) + ':');
  console.log(diff);

  if (!flags.yes) {
    await confirm('Apply MCP changes? [y/N] ');
  }

  Object.assign(existing.mcpServers, fragment.mcpServers ?? {});
  fs.mkdirSync(path.dirname(mcpFile), { recursive: true });
  fs.writeFileSync(mcpFile, JSON.stringify(existing, null, 2) + '\n');
  installed.mcpKeysAdded.push(...Object.keys(fragment.mcpServers ?? {}));
  console.log(`  ✓ mcp    → ${relCwd(mcpFile)}`);
}

async function installAgents(packDir, agentsComponent, roots, flags, installed) {
  const snippetFile = path.join(packDir, agentsComponent.path);
  const snippet = fs.readFileSync(snippetFile, 'utf8');
  const agentsFile = roots.agentsFile;

  let existing = '';
  if (fs.existsSync(agentsFile)) {
    existing = fs.readFileSync(agentsFile, 'utf8');
  }

  const packName = path.basename(packDir);
  const openMarker = `<!-- bobpacks:${packName} -->`;
  const closeMarker = `<!-- /bobpacks:${packName} -->`;

  if (existing.includes(openMarker)) {
    if (!flags.force) {
      throw new Error(
        `AGENTS.md already contains a "${packName}" block. Use --force to replace it.`
      );
    }
    existing = removeMarkedBlock(existing, openMarker, closeMarker);
  }

  // Ensure snippet is wrapped in markers (it should be, but guard anyway)
  const toAppend = snippet.includes(openMarker) ? snippet : `${openMarker}\n${snippet}\n${closeMarker}\n`;

  console.log('\n  AGENTS.md addition:');
  console.log('  ' + toAppend.split('\n').slice(0, 5).join('\n  ') + '\n  …');

  if (!flags.yes) {
    await confirm('Append to AGENTS.md? [y/N] ');
  }

  const separator = existing.endsWith('\n') ? '\n' : '\n\n';
  fs.writeFileSync(agentsFile, existing + separator + toAppend);
  installed.agentsBlocks.push(packName);
  console.log(`  ✓ agents → ${relCwd(agentsFile)}`);
}

// ---------------------------------------------------------------------------
// Remove helpers
// ---------------------------------------------------------------------------

function removeModeEntries(slugs, roots) {
  const modesFile = roots.modesFile;
  if (!fs.existsSync(modesFile)) return;

  const doc = parseYaml(fs.readFileSync(modesFile, 'utf8')) ?? { customModes: [] };
  doc.customModes = (doc.customModes ?? []).filter(m => !slugs.includes(m.slug));
  fs.writeFileSync(modesFile, stringifyYaml(doc));
  console.log(`  ✗ removed modes [${slugs.join(', ')}] from ${relCwd(modesFile)}`);
}

function removeMcpEntries(keys, roots) {
  const mcpFile = roots.mcpFile;
  if (!fs.existsSync(mcpFile)) return;

  const doc = JSON.parse(fs.readFileSync(mcpFile, 'utf8'));
  for (const key of keys) {
    delete doc.mcpServers?.[key];
  }
  fs.writeFileSync(mcpFile, JSON.stringify(doc, null, 2) + '\n');
  console.log(`  ✗ removed MCP servers [${keys.join(', ')}] from ${relCwd(mcpFile)}`);
}

function removeAgentsBlocks(packNames, roots, _packName) {
  const agentsFile = roots.agentsFile;
  if (!fs.existsSync(agentsFile)) return;

  let content = fs.readFileSync(agentsFile, 'utf8');
  for (const name of packNames) {
    content = removeMarkedBlock(content, `<!-- bobpacks:${name} -->`, `<!-- /bobpacks:${name} -->`);
  }
  fs.writeFileSync(agentsFile, content);
  console.log(`  ✗ removed AGENTS.md block(s) for [${packNames.join(', ')}]`);
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Resolve the install root paths for project vs global.
 * All verified Bob V2 paths from IBM docs.
 */
function resolveRoots(isGlobal) {
  const home = os.homedir();
  const cwd = process.cwd();

  if (isGlobal) {
    return {
      bob: path.join(home, '.bob'),
      skills: path.join(home, '.bob', 'skills'),
      modesFile: path.join(home, '.bob', 'settings', 'custom_modes.yaml'),
      mcpFile: path.join(home, '.bob', 'mcp.json'),
      agentsFile: path.join(home, '.bob', 'AGENTS.md'),
    };
  }

  return {
    bob: path.join(cwd, '.bob'),
    skills: path.join(cwd, '.bob', 'skills'),
    modesFile: path.join(cwd, '.bob', 'custom_modes.yaml'),
    mcpFile: path.join(cwd, '.bob', 'mcp.json'),
    agentsFile: path.join(cwd, 'AGENTS.md'),
  };
}

function copyDir(src, dest, installed) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, installed);
    } else {
      fs.copyFileSync(srcPath, destPath);
      installed.files.push(destPath);
    }
  }
}

function patchSkillAutoInvoke(skillMdPath, autoInvoke) {
  let content = fs.readFileSync(skillMdPath, 'utf8');
  const disableValue = !autoInvoke;
  if (content.includes('disable-model-invocation:')) {
    content = content.replace(
      /disable-model-invocation:\s*.+/,
      `disable-model-invocation: ${disableValue}`
    );
  } else {
    // Insert after the closing --- of frontmatter
    content = content.replace(/^(---\n[\s\S]*?---\n)/, (match) => {
      return match.replace(/---\n$/, `metadata:\n  disable-model-invocation: ${disableValue}\n---\n`);
    });
  }
  fs.writeFileSync(skillMdPath, content);
}

function pruneEmptyDirs(dir) {
  const bobRoot = path.join(process.cwd(), '.bob');
  while (dir !== bobRoot && dir !== os.homedir()) {
    try {
      if (fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
        dir = path.dirname(dir);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
}

function removeMarkedBlock(content, openMarker, closeMarker) {
  const start = content.indexOf(openMarker);
  if (start === -1) return content;
  const end = content.indexOf(closeMarker, start);
  if (end === -1) return content;
  return (content.slice(0, start) + content.slice(end + closeMarker.length)).replace(/\n{3,}/g, '\n\n');
}

function buildMcpDiff(existing, incoming) {
  const lines = [];
  for (const [key, value] of Object.entries(incoming)) {
    if (existing[key]) {
      lines.push(`  ~ ${key} (will overwrite)`);
    } else {
      lines.push(`  + ${key}`);
    }
    lines.push('    ' + JSON.stringify(value, null, 2).split('\n').join('\n    '));
  }
  return lines.join('\n');
}

function readManifest(packDir) {
  const manifestPath = path.join(packDir, 'pack.json');
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function relCwd(p) {
  return path.relative(process.cwd(), p) || p;
}

function printInstallSummary(manifest, roots) {
  const parts = [];
  if (manifest.components.skills) parts.push(`${manifest.components.skills.length} skill(s)`);
  if (manifest.components.modes) parts.push(`${manifest.components.modes.length} mode(s)`);
  if (manifest.components.rules) parts.push(`${manifest.components.rules.length} rule file(s)`);
  if (manifest.components.mcp) parts.push('MCP config fragment');
  if (manifest.components.agents) parts.push('AGENTS.md snippet');

  console.log(`  Components: ${parts.join(', ')}`);
  console.log(`  Target:     ${roots.bob}\n`);
}

function printNextSteps(manifest) {
  if (manifest.components.modes?.length) {
    const slugs = manifest.components.modes.map(m => m.slug).join(', ');
    console.log(`  → Switch to the new mode in the Bob panel: ${slugs}`);
  }
  if (manifest.requires?.length) {
    console.log('\n  Requirements:');
    for (const req of manifest.requires) {
      console.log(`    • [${req.type}] ${req.name}${req.description ? ' — ' + req.description : ''}`);
    }
  }
}

async function confirm(prompt) {
  process.stdout.write(prompt);
  const answer = await new Promise(resolve => {
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', chunk => resolve(chunk.trim().toLowerCase()));
  });
  if (answer !== 'y' && answer !== 'yes') {
    throw new Error('Aborted by user.');
  }
}

// ---------------------------------------------------------------------------
// Registry fetching (placeholder — real impl would fetch from REGISTRY_URL)
// ---------------------------------------------------------------------------

async function loadRegistry() {
  // In production: fetch REGISTRY_URL and cache to REGISTRY_CACHE
  // For local development: read registry.json from the repo root
  const localRegistry = path.resolve(process.cwd(), '..', 'registry.json');
  if (fs.existsSync(localRegistry)) {
    return JSON.parse(fs.readFileSync(localRegistry, 'utf8'));
  }
  if (fs.existsSync(REGISTRY_CACHE)) {
    return JSON.parse(fs.readFileSync(REGISTRY_CACHE, 'utf8'));
  }
  throw new Error('Registry not available. Run with a network connection to fetch it.');
}

async function downloadPack(entry) {
  // In production: download and extract the pack bundle from the release URL.
  // For local development: resolve directly to the packs/ folder in the repo.
  const localPackDir = path.resolve(process.cwd(), '..', entry.sourcePath);
  if (fs.existsSync(localPackDir)) {
    return localPackDir;
  }
  throw new Error(`Pack source not found at ${localPackDir}. Ensure the registry bundle is downloaded.`);
}
