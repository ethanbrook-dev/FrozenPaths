import { Game } from './game.js';
import { Player } from './player.js';
import { Bear } from './bear.js';
import { loadMap } from './utils.js';

const canvas = document.getElementById('gameCanvas');

const FPS = 60;

const GameState = Object.freeze({
  RUNNING: 0,
  WON: 1,
  GAME_OVER: 2,
});

let gameState = GameState.RUNNING;
let winTimer = 0;

let game, player, bear;

// Movement state
let activeDirection = null;    // currently held key
let moveCooldown = 0;          // frames until next allowed step
const MOVE_DELAY = 10;         // smaller = faster repeat (10 = ~6 steps per second)

// Handle custom map upload
document.getElementById("customMapInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  const map = text.trim().split('\n').map(line =>
    line.trim().split(' ').map(num => parseInt(num, 10))
  );

  const hasStart = map.some(row => row.includes(99));
  const hasEnd = map.some(row => row.includes(98));
  if (!hasStart || !hasEnd) {
    alert("Invalid map: must contain start (99) and end (98).");
    return;
  }

  initGame(map);
});

// Load pre-generated map
const pregenMap = await loadMap("maps/map1.txt");
await initGame(pregenMap);

// Handle key press (start moving)
document.addEventListener("keydown", e => {
  if (gameState !== GameState.RUNNING) return;
  if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;

  if (activeDirection !== e.key) {
    activeDirection = e.key;
    doMove();
    moveCooldown = MOVE_DELAY;
  }
  e.preventDefault();
});

// Handle key release (stop moving)
document.addEventListener("keyup", e => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    if (activeDirection === e.key) {
      activeDirection = null;
    }
  }
});

function doMove() {
  let dx = 0, dy = 0;
  if (activeDirection === "ArrowUp") dy = -1;
  else if (activeDirection === "ArrowDown") dy = 1;
  else if (activeDirection === "ArrowLeft") dx = -1;
  else if (activeDirection === "ArrowRight") dx = 1;

  if (dx !== 0 || dy !== 0) {
    player.move(dx, dy);
  }
}

function getBearStartTile(map) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 98) return { x, y };
    }
  }
  return { x: 10, y: 10 };
}

async function initGame(map) {
  game = new Game(canvas, map);
  canvas.width = game.viewWidth * game.tileSize;
  canvas.height = game.viewHeight * game.tileSize;
  await game.loadTiles();

  player = new Player(game);
  const bearStart = getBearStartTile(map);
  bear = new Bear(game, bearStart.x, bearStart.y);

  gameState = GameState.RUNNING;

  // Hide loader once everything is ready
  document.getElementById("loadingScreen").style.display = "none";
}

function gameLoop() {
  if (gameState === GameState.RUNNING) {
    game.updateCamera(player.x, player.y);

    // Handle hold-to-move
    if (activeDirection) {
      if (moveCooldown > 0) {
        moveCooldown--;
      } else {
        doMove();
        moveCooldown = MOVE_DELAY;
      }
    }

    bear.updateAnimation();

    game.drawMap();
    game.drawEntities([bear]);
    player.draw(game.ctx);

    if (player.collidedWith(bear)) {
      gameState = GameState.WON;
      winTimer = 3 * FPS; // show win message for 3 seconds
    }
  } 
  else if (gameState === GameState.WON) {
    game.ctx.fillStyle = "rgba(0,0,0,0.6)";
    game.ctx.fillRect(0, 0, canvas.width, canvas.height);

    game.ctx.fillStyle = "white";
    game.ctx.font = "24px Arial";
    game.ctx.textAlign = "center";
    game.ctx.fillText("You Win!", canvas.width / 2, canvas.height / 2);
    game.ctx.fillText("Reload to play again.", canvas.width / 2, canvas.height / 2 + 30);

    winTimer--;
    if (winTimer <= 0) {
      gameState = GameState.GAME_OVER;
    }
  }

  if (gameState === GameState.GAME_OVER) {
    game.ctx.fillStyle = "black";
    game.ctx.fillRect(0, 0, canvas.width, canvas.height);

    game.ctx.fillStyle = "yellow";
    game.ctx.font = "28px Arial";
    game.ctx.textAlign = "center";
    game.ctx.fillText("You finished the map!", canvas.width / 2, canvas.height / 2);
    game.ctx.fillText("Reload to play again.", canvas.width / 2, canvas.height / 2 + 30);
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
