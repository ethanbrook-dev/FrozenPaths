import { Game } from './game.js';
import { Player } from './player.js';
import { Bear } from './bear.js';
import { loadMap } from './utils.js';

const canvas = document.getElementById('gameCanvas');

const FPS = 60; // 60 frames per second
let playerUpdateTimer = 0;
const playerUpdateInterval = FPS / 3;

// Track pressed keys
const keysPressed = new Set();

// Define enum-like states
const GameState = Object.freeze({
  RUNNING: 0,
  WON: 1,
  NEXT_LEVEL: 2,
  GAME_OVER: 3,
});

let gameState = GameState.RUNNING;
let winTimer = 0;

// Define levels
const levels = ["maps/map1.txt"];
let currentLevel = 0;

let game, player, bear;

// Load the first level
await loadLevel(currentLevel);

// Start game loop
gameLoop();

document.addEventListener("keydown", e => keysPressed.add(e.key));
document.addEventListener("keyup", e => keysPressed.delete(e.key));

function getBearStartTile(map) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 98) {
        return { x, y };
      }
    }
  }
  // fallback default
  return { x: 10, y: 10 };
}

async function loadLevel(levelIndex) {
  const map = await loadMap(levels[levelIndex]);
  game = new Game(canvas, map);

  canvas.width = game.viewWidth * game.tileSize;
  canvas.height = game.viewHeight * game.tileSize;

  await game.loadTiles();

  player = new Player(game); // auto-uses findStartTile()
  const bearStart = getBearStartTile(map);
  bear = new Bear(game, bearStart.x, bearStart.y);

  gameState = GameState.RUNNING;
}

function updatePlayer() {

  let dx = 0;
  let dy = 0;

  if (keysPressed.has('ArrowUp')) dy -= 1;
  if (keysPressed.has('ArrowDown')) dy += 1;
  if (keysPressed.has('ArrowLeft')) dx -= 1;
  if (keysPressed.has('ArrowRight')) dx += 1;

  if (dx !== 0 || dy !== 0) {
    player.move(dx, dy);
  }
}

function gameLoop() {
  if (gameState === GameState.RUNNING) {
    game.updateCamera(player.x, player.y);

    // Only update player once every interval
    playerUpdateTimer++;
    if (playerUpdateTimer >= playerUpdateInterval) {
      updatePlayer(); // moves player based on keys pressed
      playerUpdateTimer = 0;
    }

    bear.updateAnimation();

    game.drawMap();
    game.drawEntities([bear]);
    player.draw(game.ctx);

    if (player.collidedWith(bear)) {
      gameState = GameState.WON;
      winTimer = 2 * FPS;
    }
  }
  else if (gameState === GameState.WON) {
    game.ctx.fillStyle = "rgba(0,0,0,0.6)";
    game.ctx.fillRect(0, 0, canvas.width, canvas.height);

    game.ctx.fillStyle = "white";
    game.ctx.font = "24px Arial";
    game.ctx.textAlign = "center";
    game.ctx.fillText("You Win!", canvas.width / 2, canvas.height / 2);

    winTimer--;
    if (winTimer <= 0) {
      currentLevel++;
      if (currentLevel < levels.length) {
        (async () => {
          await loadLevel(currentLevel);
        })();
      } else {
        gameState = GameState.GAME_OVER;
      }
    }
  }

  if (gameState === GameState.GAME_OVER) {
    game.ctx.fillStyle = "black";
    game.ctx.fillRect(0, 0, canvas.width, canvas.height);

    game.ctx.fillStyle = "yellow";
    game.ctx.font = "28px Arial";
    game.ctx.textAlign = "center";
    game.ctx.fillText("You finished all levels!", canvas.width / 2, canvas.height / 2);
  }

  requestAnimationFrame(gameLoop);
}
