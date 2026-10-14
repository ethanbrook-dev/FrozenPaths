# FrozenPaths

FrozenPaths is a top-down maze game and map editor built with HTML Canvas and plain JavaScript modules. It is a static site and can be deployed on Netlify.

Live site: <https://frozenpaths.netlify.app>

## Play

- Choose a season using the buttons below the title. Changing seasons restarts the current map.
- Use the arrow keys to move from the Start tile to the End character.
- Use **Create Map** to make a map or **Edit Map** to load and modify a `.txt` map.
- Maps saved by either editor include a season tag. Load a map only while its matching season is selected.
- Older maps without a season tag are treated as Winter maps.

Winter, Spring, Summer, and Autumn each have their own character sprites, tile palette, collision rules, and starter map.

## Adding a season

Each season's character sprites, tiles, movement rules, and starter map are configured in [`js/seasons.js`](./js/seasons.js). The existing seasons are examples for adding another season.

Suggested folder layout:

```text
assets/
  winter/
    player/
      walk-forward-1.png
      walk-forward-2.png
      walk-forward-3.png
      walk-backwards-1.png
      walk-backwards-2.png
      walk-backwards-3.png
      walk-left-1.png
      walk-left-2.png
      walk-left-3.png
      walk-right-1.png
      walk-right-2.png
      walk-right-3.png
    characters/
      bear1.png
      bear2.png
      bear3.png
    tiles/
      snowman.png
      frozenflower1.png
      ...
  spring/
    player/...
    characters/...
    tiles/...
  summer/
    player/...
    characters/...
    tiles/...
  autumn/
    player/...
    characters/...
    tiles/...
maps/
  spring-map.txt
```

All season-specific character, tile, and start-marker assets belong under that season's folder: `assets/winter/`, `assets/spring/`, `assets/summer/`, or `assets/autumn/`. Each season uses its own `<season>-startTile.png` for tile ID `99`. The cursor and eraser remain shared in `assets/map-editor/`.

### Normalize asset image sizes (Windows)

Run the included PowerShell script from the repository root after adding or replacing season images:

```powershell
.\scripts\normalize-season-assets.ps1 -WhatIf
.\scripts\normalize-season-assets.ps1
```

The first command previews which files would change. The second overwrites PNGs inside the four season folders. Player sprites are fitted proportionally onto transparent 72 × 72 canvases; end-character, tile, and season start-marker images use transparent 66 × 66 canvases. Artwork is centered and never stretched or cropped. The shared `assets/map-editor/` images are not modified. Commit or back up new artwork before normalizing, since the original files are replaced.

Player animation uses **12 transparent PNGs**: three frames for each direction. Filenames and direction words must match the list above exactly. Use square images designed for a single tile (32 × 32 pixels is recommended); the game scales them to the tile size.

The end character can have one or more transparent, square PNG frames. List their paths in `enderSprites` in animation order; the filenames are otherwise up to you. Tile ID `98` is rendered over that season's default ground tile, so keep end-character backgrounds transparent to let the ground show through. Tile images should also be square PNGs and are scaled to 32 × 32 pixels.

Example season configuration:

```js
spring: {
  key: 'spring',
  label: 'Spring',
  icon: '🌷',
  mapPath: 'maps/spring-map.txt',
  playerSpriteDirectory: 'assets/spring/player',
  enderSprites: [
    'assets/spring/characters/cow-1.png',
    'assets/spring/characters/cow-2.png',
    'assets/spring/characters/cow-3.png',
  ],
  tileMapping: {
    1: 'assets/spring/tiles/flowers.png',
    5: 'assets/spring/tiles/grass.png',
    6: 'assets/spring/tiles/tree.png',
    98: 'assets/spring/characters/cow-1.png',
    99: 'assets/spring/spring-startTile.png',
  },
  tileNames: {
    1: 'Flowers',
    5: 'Grass',
    6: 'Tree',
    98: 'End',
    99: 'Start',
  },
  defaultTile: 5,
  walkableTiles: [5, 98],
},
```

For Spring, Summer, and Autumn, tile IDs `1` through `4`, then `6` upward, are assigned to the images in `tiles/obstacles`. The ground image uses tile ID `5`, and additional images in `tiles/walkable` get IDs after the obstacles. Obstacle IDs are omitted from `walkableTiles`, so collision prevents the player entering them. Both ground and additional walkable tile IDs belong in `walkableTiles`.

Keep the marker IDs consistent:

- `5` is the default ground tile and should be in `walkableTiles`.
- `98` is the end marker. It is also walkable so the player can reach the end.
- `99` is the start marker.
- Use other IDs from `1` to `97` for that season's scenery. Only include a tile in `walkableTiles` if the player may move onto it.

Tile IDs are interpreted using the selected season's `tileMapping`, so the same ID can use different artwork in different seasons. Every tile ID used by a map must have an image path in that season's mapping. The editor builds its palette from the same mapping.

## Map file format

Maps are whitespace-separated tile IDs, with one row per line. New maps start with a season header:

```text
# FrozenPaths season: spring
05 05 05
99 05 98
05 05 05
```

The map must be rectangular and contain exactly one `99` start and one `98` end. The season header is written by both editors and prevents a map from being loaded into the wrong tile set. Existing untagged maps remain supported as Winter maps.

Each season has a starter map in `maps/`. To add or replace a built-in map, put its `.txt` file under `maps/` and set `mapPath` in that season's configuration.

## Project files

- `index.html` and `js/main.js` — game and season selection.
- `js/seasons.js` — season assets, tile palettes, movement rules, and default maps.
- `js/game.js`, `js/player.js`, and `js/ender.js` — canvas rendering and characters.
- `map-creator.html` and `map-editor.html` — map authoring pages.
