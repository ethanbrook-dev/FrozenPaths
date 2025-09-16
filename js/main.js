import { Game } from './game.js';
import { Player } from './player.js';
import { loadMap } from './utils.js';

const canvas = document.getElementById('gameCanvas');
const map = await loadMap('maps/map1.txt');

const game = new Game(canvas, map);
const player = new Player(game);

canvas.width = game.viewWidth * game.tileSize;
canvas.height = game.viewHeight * game.tileSize;

await game.loadTiles();
game.draw(player);

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
        game.draw(player);
    }
}
