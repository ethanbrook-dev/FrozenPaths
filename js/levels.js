import { loadMap } from './utils.js';

export async function getLevel(levelNumber) {
  const map = await loadMap(`maps/map${levelNumber}.txt`);
  return map;
}
