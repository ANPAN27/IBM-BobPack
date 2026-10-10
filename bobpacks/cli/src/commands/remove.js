import { removePack } from '../installer.js';

export async function remove(packName, flags) {
  await removePack(packName, flags);
}
