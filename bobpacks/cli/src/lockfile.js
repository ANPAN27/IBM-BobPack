/**
 * lockfile.js — reads and writes bobpacks.lock.json
 *
 * The lockfile records every file, mode slug, MCP key and AGENTS.md block
 * that a pack installation wrote, so "bobpacks remove" can undo exactly that
 * set without touching anything else.
 *
 * Schema:
 * {
 *   "version": "1",
 *   "packs": {
 *     "<pack-name>": {
 *       "version": "1.0.0",
 *       "installedAt": "<ISO 8601>",
 *       "global": false,
 *       "files": ["<absolute path>", ...],
 *       "modesAdded": ["<slug>", ...],
 *       "mcpKeysAdded": ["<server-key>", ...],
 *       "agentsBlocks": ["<pack-name>", ...]
 *     }
 *   }
 * }
 */

import fs from 'node:fs';
import path from 'node:path';

const LOCKFILE_NAME = 'bobpacks.lock.json';

/**
 * Read the lockfile from the project directory.
 * Returns an empty structure if the file does not exist.
 * @param {string} projectDir absolute path to the project root
 * @returns {{ version: string, packs: Record<string, object> }}
 */
export function readLockfile(projectDir) {
  const lockPath = path.join(projectDir, LOCKFILE_NAME);
  if (!fs.existsSync(lockPath)) {
    return { version: '1', packs: {} };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    // Ensure structure is sound even if the file was hand-edited
    return {
      version: raw.version ?? '1',
      packs: raw.packs ?? {},
    };
  } catch {
    throw new Error(`Could not parse ${LOCKFILE_NAME}. Fix or delete it and try again.`);
  }
}

/**
 * Write the lockfile to the project directory.
 * @param {string} projectDir absolute path to the project root
 * @param {{ version: string, packs: Record<string, object> }} lockfile
 */
export function writeLockfile(projectDir, lockfile) {
  const lockPath = path.join(projectDir, LOCKFILE_NAME);
  fs.writeFileSync(lockPath, JSON.stringify(lockfile, null, 2) + '\n');
}
