#!/usr/bin/env node
/**
 * bobpacks CLI entry point
 * Usage:
 *   bobpacks add <pack> [--global] [--force] [--yes]
 *   bobpacks remove <pack>
 *   bobpacks list
 *   bobpacks search <term>
 *   bobpacks info <pack>
 */

import { add } from './commands/add.js';
import { remove } from './commands/remove.js';
import { list, search, info } from './commands/query.js';

const [,, command, ...args] = process.argv;

const flags = {
  global: args.includes('--global'),
  force: args.includes('--force'),
  yes: args.includes('--yes'),
};
const positional = args.filter(a => !a.startsWith('--'));

async function main() {
  switch (command) {
    case 'add': {
      const packName = positional[0];
      if (!packName) {
        console.error('Usage: bobpacks add <pack> [--global] [--force] [--yes]');
        process.exit(1);
      }
      await add(packName, flags);
      break;
    }
    case 'remove': {
      const packName = positional[0];
      if (!packName) {
        console.error('Usage: bobpacks remove <pack>');
        process.exit(1);
      }
      await remove(packName, flags);
      break;
    }
    case 'list':
      await list(flags);
      break;
    case 'search': {
      const term = positional[0];
      if (!term) {
        console.error('Usage: bobpacks search <term>');
        process.exit(1);
      }
      await search(term, flags);
      break;
    }
    case 'info': {
      const packName = positional[0];
      if (!packName) {
        console.error('Usage: bobpacks info <pack>');
        process.exit(1);
      }
      await info(packName, flags);
      break;
    }
    default:
      console.error(`Unknown command: ${command ?? '(none)'}`);
      console.error('Commands: add, remove, list, search, info');
      process.exit(1);
  }
}

main().catch(err => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
