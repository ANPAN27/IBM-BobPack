#!/usr/bin/env node
/**
 * validate.js — CI validation script for BobPacks
 *
 * Runs three layers of checks against every pack in the packs/ directory:
 *
 *   Layer 1 — Schema (20 pts, required to list)
 *     • pack.json is valid against schemas/pack.schema.json
 *     • version is semver
 *     • name matches the folder name
 *     • all declared component paths exist
 *     • skill names match the ^[a-z0-9]+(-[a-z0-9]+)*$ pattern
 *     • mode slugs match the same pattern
 *     • student/educator packs declare integrityStance
 *
 *   Layer 2 — Safety lint (25 pts, required to list)
 *     • No secret-looking strings (API keys, tokens, passwords) in any file
 *     • No destructive shell commands in SKILL.md bodies
 *     • MCP fragment servers are pinned to a version or commit (not "latest")
 *
 *   Layer 3 — Content quality (20 pts, advisory)
 *     • SKILL.md description field is non-empty and >20 chars
 *     • README.md exists and contains "Install" and "Usage" (or "How to use")
 *     • Student/educator packs mention integrityStance in README
 *     • No individual file exceeds 200 KB
 *
 * Exit code 0 if all required checks pass.
 * Exit code 1 if any required check fails.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parse as parseYaml } from 'yaml';
import semver from 'semver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PACKS_DIR = path.join(REPO_ROOT, 'packs');
const SCHEMA_FILE = path.join(REPO_ROOT, 'schemas', 'pack.schema.json');

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/,                            // AWS access key
  /sk-[A-Za-z0-9]{32,}/,                         // OpenAI-style secret key
  /gh[pousr]_[A-Za-z0-9]{36,}/,                  // GitHub token
  /(?:password|passwd|secret|api[_-]?key)\s*[:=]\s*["'][^"']{8,}/i,
  /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

const DESTRUCTIVE_COMMANDS = [
  /\brm\s+-rf\b/,
  /\bformat\s+[a-z]:/i,       // Windows format
  /\bdd\s+if=/,               // dd to block device
  /\bmkfs\b/,
  /\bshred\b/,
  /\b>\s*\/dev\/(s|h|nv)d/,   // writing to block devices
];

const SKILL_NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const schema = JSON.parse(fs.readFileSync(SCHEMA_FILE, 'utf8'));
const validateSchema = ajv.compile(schema);

const packDirs = fs.readdirSync(PACKS_DIR, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => path.join(PACKS_DIR, e.name));

let totalFailed = 0;
let totalPassed = 0;

for (const packDir of packDirs) {
  const result = validatePack(packDir);
  if (result.failed > 0) {
    totalFailed += result.failed;
    process.exitCode = 1;
  }
  totalPassed += result.passed;
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);
if (totalFailed > 0) {
  console.log('✗ Validation failed — fix required errors before submitting.\n');
} else {
  console.log('✓ All packs passed required checks.\n');
}

// ---------------------------------------------------------------------------
// Per-pack validation
// ---------------------------------------------------------------------------

function validatePack(packDir) {
  const packName = path.basename(packDir);
  const issues = { required: [], advisory: [] };
  let score = 0;

  console.log(`\n▸ ${packName}`);

  // ── Layer 1: Schema ─────────────────────────────────────────────────────
  const manifestPath = path.join(packDir, 'pack.json');
  if (!fs.existsSync(manifestPath)) {
    issues.required.push('pack.json not found');
    printIssues(issues);
    return { passed: 0, failed: issues.required.length };
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    issues.required.push('pack.json is not valid JSON');
    printIssues(issues);
    return { passed: 0, failed: 1 };
  }

  if (!validateSchema(manifest)) {
    for (const err of validateSchema.errors ?? []) {
      issues.required.push(`Schema: ${err.instancePath} ${err.message}`);
    }
  } else {
    score += 20;
  }

  if (!semver.valid(manifest.version)) {
    issues.required.push(`version "${manifest.version}" is not valid semver`);
  }

  if (manifest.name !== packName) {
    issues.required.push(`pack.json "name" (${manifest.name}) does not match folder name (${packName})`);
  }

  // Check all declared component paths exist
  for (const skill of manifest.components?.skills ?? []) {
    const p = path.join(packDir, skill.path);
    if (!fs.existsSync(p)) issues.required.push(`Skill path not found: ${skill.path}`);
    if (!SKILL_NAME_RE.test(skill.name)) issues.required.push(`Skill name "${skill.name}" is invalid (must be lowercase-with-hyphens)`);
    const skillMd = path.join(p, 'SKILL.md');
    if (!fs.existsSync(skillMd)) issues.required.push(`SKILL.md not found in ${skill.path}`);
  }

  for (const mode of manifest.components?.modes ?? []) {
    const p = path.join(packDir, mode.path);
    if (!fs.existsSync(p)) issues.required.push(`Mode path not found: ${mode.path}`);
    if (!SKILL_NAME_RE.test(mode.slug)) issues.required.push(`Mode slug "${mode.slug}" is invalid (must be lowercase-with-hyphens)`);
    if (fs.existsSync(p)) {
      const modeYaml = parseYaml(fs.readFileSync(p, 'utf8'));
      const modes = modeYaml?.customModes ?? [];
      if (!modes.some(m => m.slug === mode.slug)) {
        issues.required.push(`Mode file ${mode.path} does not contain a mode with slug "${mode.slug}"`);
      }
    }
  }

  for (const rule of manifest.components?.rules ?? []) {
    const p = path.join(packDir, rule.path);
    if (!fs.existsSync(p)) issues.required.push(`Rule path not found: ${rule.path}`);
  }

  if (manifest.components?.mcp) {
    const p = path.join(packDir, manifest.components.mcp.path);
    if (!fs.existsSync(p)) issues.required.push(`MCP fragment not found: ${manifest.components.mcp.path}`);
  }

  if (manifest.components?.agents) {
    const p = path.join(packDir, manifest.components.agents.path);
    if (!fs.existsSync(p)) issues.required.push(`AGENTS snippet not found: ${manifest.components.agents.path}`);
  }

  if (['student', 'educator'].includes(manifest.audience) && !manifest.integrityStance) {
    issues.required.push('integrityStance is required for student and educator packs');
  }

  // ── Layer 2: Safety lint ────────────────────────────────────────────────
  const allFiles = collectFiles(packDir);
  let safetyClean = true;

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = path.relative(packDir, file);

    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(content)) {
        issues.required.push(`Possible secret in ${rel} (matched ${pattern})`);
        safetyClean = false;
      }
    }

    if (file.endsWith('SKILL.md')) {
      for (const pattern of DESTRUCTIVE_COMMANDS) {
        if (pattern.test(content)) {
          issues.required.push(`Destructive shell command in ${rel} (matched ${pattern})`);
          safetyClean = false;
        }
      }
    }
  }

  if (manifest.components?.mcp) {
    const fragmentPath = path.join(packDir, manifest.components.mcp.path);
    if (fs.existsSync(fragmentPath)) {
      const fragment = JSON.parse(fs.readFileSync(fragmentPath, 'utf8'));
      for (const [key, server] of Object.entries(fragment.mcpServers ?? {})) {
        const args = server.args ?? [];
        const hasLatest = args.some(a => typeof a === 'string' && a.endsWith(':latest'));
        const hasUnpinned = typeof server.command === 'string' &&
          !/@[0-9]+\.[0-9]+|@sha|#[0-9a-f]{7}/.test(JSON.stringify(server));
        if (hasLatest || hasUnpinned) {
          issues.required.push(`MCP server "${key}" appears unpinned — use a specific version or commit`);
          safetyClean = false;
        }
      }
    }
  }

  if (safetyClean) score += 25;

  // ── Layer 3: Content quality ────────────────────────────────────────────
  let contentScore = 0;

  // SKILL.md description check
  for (const skill of manifest.components?.skills ?? []) {
    const skillMd = path.join(packDir, skill.path, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      const fm = parseFrontmatter(fs.readFileSync(skillMd, 'utf8'));
      if (!fm.description || fm.description.length < 20) {
        // Promoted to required: a skill with no description is silently ignored by Bob
        issues.required.push(`SKILL.md for "${skill.name}" has no description or description is too short (<20 chars) — Bob will silently ignore skills without a description`);
      } else {
        contentScore += 7;
      }
    }
  }

  const readmePath = path.join(packDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    issues.advisory.push('README.md not found');
  } else {
    const readme = fs.readFileSync(readmePath, 'utf8').toLowerCase();
    if (!readme.includes('install')) issues.advisory.push('README.md does not mention installation');
    else contentScore += 5;
    if (!readme.includes('usage') && !readme.includes('how to use')) issues.advisory.push('README.md does not describe usage');
    else contentScore += 5;
    if (['student', 'educator'].includes(manifest.audience) && !readme.includes('integrity')) {
      issues.advisory.push('README.md for student/educator pack should mention integrity stance');
    } else if (['student', 'educator'].includes(manifest.audience)) {
      contentScore += 3;
    }
  }

  for (const file of allFiles) {
    const stat = fs.statSync(file);
    if (stat.size > 200 * 1024) {
      issues.advisory.push(`${path.relative(packDir, file)} exceeds 200 KB (${Math.round(stat.size / 1024)} KB)`);
    }
  }

  score += Math.min(contentScore, 20);

  // ── Output ───────────────────────────────────────────────────────────────
  printIssues(issues);
  console.log(`  Score: ${score}/65 (scenario tests and maintenance not run in static check)`);

  return { passed: issues.required.length === 0 ? 1 : 0, failed: issues.required.length };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        collectFiles(full, files);
      }
    } else {
      files.push(full);
    }
  }
  return files;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  try {
    return parseYaml(match[1]) ?? {};
  } catch {
    return {};
  }
}

function printIssues(issues) {
  for (const msg of issues.required) {
    console.log(`  ✗ [required] ${msg}`);
  }
  for (const msg of issues.advisory) {
    console.log(`  ⚠ [advisory] ${msg}`);
  }
  if (issues.required.length === 0 && issues.advisory.length === 0) {
    console.log('  ✓ all checks passed');
  }
}
