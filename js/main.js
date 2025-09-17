import { Game } from './game.js';
import { Player } from './player.js';
import { Bear } from './bear.js';
import { loadMap } from './utils.js';

const canvas = document.getElementById('gameCanvas');
const map = await loadMap('maps/map1.txt');

const game = new Game(canvas, map);
const player = new Player(game);
const bear = new Bear(game, 10, 10); // place at tile (10,10)

canvas.width = game.viewWidth * game.tileSize;
canvas.height = game.viewHeight * game.tileSize;

await game.loadTiles();

// Start game loop
gameLoop();

// Draw player
game.drawPlayer(player);

// Track pressed keys
const keysPressed = new Set();

document.addEventListener('keydown', e => {
    keysPressed.add(e.key);
    updatePlayer();
});

document.addEventListener('keyup', e => {
    keysPressed.delete(e.key);
});

function updatePlayer() {
    let dx = 0;
    let dy = 0;

    if (keysPressed.has('ArrowUp')) dy -= 1;
    if (keysPressed.has('ArrowDown')) dy += 1;
    if (keysPressed.has('ArrowLeft')) dx -= 1;
    if (keysPressed.has('ArrowRight')) dx += 1;

    if (dx !== 0 || dy !== 0) {
        player.move(dx, dy); // handled in player.js
        game.drawPlayer(player);
    }
}

function gameLoop() {

  // Redraw map and bear
  game.drawMap();
  game.drawPlayer(player);
  game.drawEntities([bear]);

  requestAnimationFrame(gameLoop);
}
