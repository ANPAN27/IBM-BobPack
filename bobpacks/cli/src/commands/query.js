import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const REGISTRY_CACHE = path.join(os.homedir(), '.bob', 'bobpacks-cache', 'registry.json');

async function loadRegistry() {
  const localRegistry = path.resolve(process.cwd(), '..', 'registry.json');
  if (fs.existsSync(localRegistry)) {
    return JSON.parse(fs.readFileSync(localRegistry, 'utf8'));
  }
  if (fs.existsSync(REGISTRY_CACHE)) {
    return JSON.parse(fs.readFileSync(REGISTRY_CACHE, 'utf8'));
  }
  throw new Error('Registry not available offline. Connect to the network to refresh it.');
}

export async function list(_flags) {
  const registry = await loadRegistry();
  console.log(`\nAvailable packs (${registry.packs.length}):\n`);
  for (const pack of registry.packs) {
    const score = pack.score.total ?? '–';
    console.log(`  ${pack.name.padEnd(30)} ${pack.audience.padEnd(10)} ${pack.level.padEnd(14)} score: ${score}`);
  }
  console.log('');
}

export async function search(term, _flags) {
  const registry = await loadRegistry();
  const q = term.toLowerCase();
  const matches = registry.packs.filter(p =>
    p.name.includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.tags?.some(t => t.includes(q)) ||
    p.audience.includes(q) ||
    p.ibmProducts?.some(p => p.includes(q))
  );

  if (matches.length === 0) {
    console.log(`\nNo packs found matching "${term}".\n`);
    return;
  }

  console.log(`\nPacks matching "${term}" (${matches.length}):\n`);
  for (const pack of matches) {
    console.log(`  ${pack.name}`);
    console.log(`    ${pack.description}`);
    console.log(`    npx bobpacks add ${pack.name}\n`);
  }
}

export async function info(packName, _flags) {
  const registry = await loadRegistry();
  const pack = registry.packs.find(p => p.name === packName);

  if (!pack) {
    throw new Error(`Pack "${packName}" not found. Run "bobpacks list" to see available packs.`);
  }

  console.log(`\n${pack.name} v${pack.version}`);
  console.log(`  ${pack.description}\n`);
  console.log(`  Audience:   ${pack.audience} (${pack.level})`);
  console.log(`  Author:     ${pack.author}`);
  console.log(`  License:    ${pack.license}`);
  if (pack.integrityStance) {
    console.log(`  Integrity:  ${pack.integrityStance}`);
  }
  if (pack.ibmProducts?.length) {
    console.log(`  Products:   ${pack.ibmProducts.join(', ')}`);
  }
  if (pack.tags?.length) {
    console.log(`  Tags:       ${pack.tags.join(', ')}`);
  }
  console.log(`  Components: ${pack.components.join(', ')}`);
  console.log(`\n  Quality score: ${pack.score.total}/100`);
  console.log(`    Schema:        ${pack.score.schema}/20`);
  console.log(`    Safety lint:   ${pack.score.safetyLint}/25`);
  console.log(`    Content:       ${pack.score.contentQuality}/20`);
  console.log(`    Scenarios:     ${pack.score.scenarioTests ?? 'unverified'}/25`);
  console.log(`    Maintenance:   ${pack.score.maintenance}/10`);
  console.log(`    Status: ${pack.score.scenarioTestStatus}\n`);
  console.log(`  Install: npx bobpacks add ${pack.name}\n`);
}
