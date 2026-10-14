const unavailableSeason = (key, label, icon) => ({
  key,
  label,
  icon,
  configured: false,
});

export const seasons = {
  winter: {
    key: 'winter',
    label: 'Winter',
    icon: '❄️',
    configured: true,
    mapPath: 'maps/map1.txt',
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
      99: 'assets/map-editor/startTile.png',
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
    walkableTiles: [5, 98],
  },
  spring: unavailableSeason('spring', 'Spring', '🌷'),
  summer: unavailableSeason('summer', 'Summer', '☀️'),
  autumn: unavailableSeason('autumn', 'Autumn', '🍂'),
};

export function getSeason(key) {
  return seasons[key] || seasons.winter;
}

export function getSeasonFromLocation() {
  return getSeason(new URLSearchParams(window.location.search).get('season'));
}
