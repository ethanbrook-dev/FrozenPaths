function createSeason({ key, label, icon, mapPath, enderSprites, obstacles, walkable }) {
  const startTilePath = `assets/${key}/${key}-startTile.png`;
  const tileMapping = { 99: startTilePath };
  const tileNames = { 98: 'End', 99: 'Start' };
  const walkableTiles = [5, 98, 99];
  let nextTile = 1;

  for (const tile of obstacles) {
    if (nextTile === 5) nextTile++;
    tileMapping[nextTile] = tile.path;
    tileNames[nextTile] = tile.name;
    nextTile++;
  }

  tileMapping[5] = walkable.ground.path;
  tileNames[5] = walkable.ground.name;

  for (const tile of walkable.additional) {
    if (nextTile === 5) nextTile++;
    tileMapping[nextTile] = tile.path;
    tileNames[nextTile] = tile.name;
    walkableTiles.push(nextTile);
    nextTile++;
  }

  tileMapping[98] = enderSprites[0];

  return {
    key,
    label,
    icon,
    configured: true,
    mapPath,
    playerSpriteDirectory: `assets/${key}/player`,
    enderSprites,
    tileMapping,
    tileNames,
    defaultTile: 5,
    walkableTiles,
  };
}

export const seasons = {
  winter: {
    key: 'winter',
    label: 'Winter',
    icon: '❄️',
    configured: true,
    mapPath: 'maps/winter-map.txt',
    playerSpriteDirectory: 'assets/winter/player',
    enderSprites: [
      'assets/winter/characters/bear1.png',
      'assets/winter/characters/bear2.png',
      'assets/winter/characters/bear3.png',
    ],
    tileMapping: {
      1: 'assets/winter/tiles/frozenflowers/frozenflower1.png',
      2: 'assets/winter/tiles/frozenflowers/frozenflower2.png',
      3: 'assets/winter/tiles/icecracks/icecrack1.png',
      4: 'assets/winter/tiles/icecracks/icecrack2.png',
      5: 'assets/winter/tiles/icetiles/icetile1.png',
      6: 'assets/winter/tiles/rocks/rock1.png',
      7: 'assets/winter/tiles/rocks/rock2.png',
      8: 'assets/winter/tiles/rocks/rock3.png',
      9: 'assets/winter/tiles/rocks/rock4.png',
      10: 'assets/winter/tiles/rocks/rock5.png',
      11: 'assets/winter/tiles/rocks/rock6.png',
      12: 'assets/winter/tiles/trees/tree1.png',
      13: 'assets/winter/tiles/trees/tree2.png',
      14: 'assets/winter/tiles/trees/tree3.png',
      15: 'assets/winter/tiles/snowman.png',
      98: 'assets/winter/characters/bear1.png',
      99: 'assets/winter/winter-startTile.png',
    },
    tileNames: {
      1: 'Frozen Flower 1',
      2: 'Frozen Flower 2',
      3: 'Ice Crack 1',
      4: 'Ice Crack 2',
      5: 'Ice Tile',
      6: 'Rock 1',
      7: 'Rock 2',
      8: 'Rock 3',
      9: 'Rock 4',
      10: 'Rock 5',
      11: 'Rock 6',
      12: 'Tree 1',
      13: 'Tree 2',
      14: 'Tree 3',
      15: 'Snowman',
      98: 'End',
      99: 'Start',
    },
    defaultTile: 5,
    walkableTiles: [5, 98, 99],
  },
  spring: createSeason({
    key: 'spring',
    label: 'Spring',
    icon: '🌷',
    mapPath: 'maps/spring-map.txt',
    enderSprites: [
      'assets/spring/characters/egg1.png',
      'assets/spring/characters/egg2.png',
      'assets/spring/characters/egg3.png',
    ],
    obstacles: [
      { name: 'Bush', path: 'assets/spring/tiles/obstacles/bush.png' },
      { name: 'Fence', path: 'assets/spring/tiles/obstacles/fence.png' },
      { name: 'Tree Stump', path: 'assets/spring/tiles/obstacles/tree_stump.png' },
      { name: 'Rock', path: 'assets/spring/tiles/obstacles/rock.png' },
      { name: 'Pond', path: 'assets/spring/tiles/obstacles/pond.png' },
      { name: 'Log', path: 'assets/spring/tiles/obstacles/log.png' },
      { name: 'Flower', path: 'assets/spring/tiles/obstacles/flower.png' },
    ],
    walkable: {
      ground: { name: 'Grass', path: 'assets/spring/tiles/walkable/grass.png' },
      additional: [{ name: 'Dirt Patch', path: 'assets/spring/tiles/walkable/dirt_patch.png' }],
    },
  }),
  summer: createSeason({
    key: 'summer',
    label: 'Summer',
    icon: '☀️',
    mapPath: 'maps/summer-map.txt',
    enderSprites: [
      'assets/summer/characters/sandCastle1.png',
      'assets/summer/characters/sandCastle2.png',
      'assets/summer/characters/sandCastle3.png',
    ],
    obstacles: [
      { name: 'Gate', path: 'assets/summer/tiles/obstacles/gate.png' },
      { name: 'Log', path: 'assets/summer/tiles/obstacles/log.png' },
      { name: 'Palm Tree', path: 'assets/summer/tiles/obstacles/plamtree.png' },
      { name: 'Rock', path: 'assets/summer/tiles/obstacles/rock.png' },
      { name: 'Umbrella', path: 'assets/summer/tiles/obstacles/umbrella.png' },
    ],
    walkable: {
      ground: { name: 'Sand', path: 'assets/summer/tiles/walkable/ground.png' },
      additional: [{ name: 'Flower', path: 'assets/summer/tiles/walkable/flower.png' }],
    },
  }),
  autumn: createSeason({
    key: 'autumn',
    label: 'Autumn',
    icon: '🍂',
    mapPath: 'maps/autumn-map.txt',
    enderSprites: [
      'assets/autumn/characters/scarecrow1.png',
      'assets/autumn/characters/scarecrow2.png',
      'assets/autumn/characters/scarecrow3.png',
    ],
    obstacles: [
      { name: 'Fence', path: 'assets/autumn/tiles/obstacles/fence.png' },
      { name: 'Hay', path: 'assets/autumn/tiles/obstacles/hay.png' },
      { name: 'Pond', path: 'assets/autumn/tiles/obstacles/pond.png' },
      { name: 'Pumpkins', path: 'assets/autumn/tiles/obstacles/pumpkins.png' },
      { name: 'Rock', path: 'assets/autumn/tiles/obstacles/rock.png' },
      { name: 'Sign', path: 'assets/autumn/tiles/obstacles/sign.png' },
      { name: 'Tree Stump', path: 'assets/autumn/tiles/obstacles/tree_stump.png' },
    ],
    walkable: {
      ground: { name: 'Ground', path: 'assets/autumn/tiles/walkable/ground.png' },
      additional: [{ name: 'Leaves', path: 'assets/autumn/tiles/walkable/leaves.png' }],
    },
  }),
};

export function getSeason(key) {
  return seasons[key] || seasons.winter;
}

export function getSeasonFromLocation() {
  return getSeason(new URLSearchParams(window.location.search).get('season'));
}
