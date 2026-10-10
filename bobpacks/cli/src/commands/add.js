import { installPack } from '../installer.js';

export async function add(packName, flags) {
  await installPack(packName, flags);
}
