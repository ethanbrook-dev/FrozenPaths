import { Game } from './game.js';
import { Player } from './player.js';
import { Ender } from './ender.js';
import { loadMap, parseMapText, validateMapMarkers } from './utils.js';
import { getSeason, getSeasonFromLocation } from './seasons.js';

const canvas = document.getElementById('gameCanvas');
const status = document.getElementById('seasonStatus');
const createMapBtn = document.getElementById('createMapBtn');
const editMapBtn = document.getElementById('editMapBtn');
const loadMapLabel = document.getElementById('loadMapLabel');
const customMapInput = document.getElementById('customMapInput');
const FPS = 60;

const GameState = Object.freeze({
  SETUP: 0,
  RUNNING: 1,
  WON: 2,
  GAME_OVER: 3,
});

let gameState = GameState.SETUP;
let winTimer = 0;
let game;
let player;
let ender;
let activeSeason = getSeasonFromLocation();
let seasonLoadId = 0;
let activeDirection = null;
let moveCooldown = 0;
const MOVE_DELAY = 10;

for (const button of document.querySelectorAll('.season-btn')) {
  button.addEventListener('click', () => selectSeason(button.dataset.season));
}

createMapBtn.addEventListener('click', () => {
  window.location.href = `map-creator.html?season=${activeSeason.key}`;
});
editMapBtn.addEventListener('click', () => {
  window.location.href = `map-editor.html?season=${activeSeason.key}`;
});

customMapInput.addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  const season = activeSeason;
  const requestId = ++seasonLoadId;
  if (!season.configured) {
    alert(`${season.label} is not set up yet.`);
    return;
  }

  try {
    const { map, seasonKey } = parseMapText(await file.text());
    if (requestId !== seasonLoadId) return;
    if (seasonKey && seasonKey !== season.key) {
      const mapSeason = getSeason(seasonKey);
      if (mapSeason.key !== seasonKey) throw new Error(`Unknown map season: ${seasonKey}.`);
      throw new Error(`This map is for ${mapSeason.label}, not ${season.label}.`);
    }
    if (!seasonKey && season.key !== 'winter') {
      throw new Error('This map has no season tag. Load legacy maps in Winter or save it from the matching season editor.');
    }
    validateMapMarkers(map);
    gameState = GameState.SETUP;
    activeDirection = null;
    game = null;
    player = null;
    ender = null;
    status.textContent = `Loading ${season.label} map...`;
    await initializeGame(map, season, requestId);
  } catch (error) {
    if (requestId !== seasonLoadId) return;
    console.error(error);
    status.textContent = `Could not load map: ${error.message}`;
    alert(`Could not load map: ${error.message}`);
  } finally {
    customMapInput.value = '';
  }
});

document.addEventListener('keydown', event => {
  if (gameState !== GameState.RUNNING) return;
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;

  if (activeDirection !== event.key) {
    activeDirection = event.key;
    doMove();
    moveCooldown = MOVE_DELAY;
  }
  event.preventDefault();
});

document.addEventListener('keyup', event => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
      && activeDirection === event.key) {
    activeDirection = null;
  }
});

function getEndPosition(map) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 98) return { x, y };
    }
  }
  throw new Error('Map is missing its end tile (98).');
}

async function selectSeason(key) {
  const nextSeason = getSeason(key);
  if (gameState === GameState.RUNNING && nextSeason.key !== activeSeason.key
      && !confirm(`Switching to ${nextSeason.label} will restart your current map. Continue?`)) {
    return;
  }
  activeSeason = nextSeason;
  const requestId = ++seasonLoadId;
  activeDirection = null;
  gameState = GameState.SETUP;
  game = null;
  player = null;
  ender = null;

  for (const button of document.querySelectorAll('.season-btn')) {
    const selected = button.dataset.season === activeSeason.key;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }

  const available = activeSeason.configured;
  createMapBtn.disabled = !available;
  editMapBtn.disabled = !available;
  customMapInput.disabled = !available;
  loadMapLabel.classList.toggle('disabled', !available);

  if (!available) {
    status.textContent = `${activeSeason.label} is not set up yet. Add its sprites and tile map configuration in js/seasons.js to enable it.`;
    return;
  }

  status.textContent = `Loading ${activeSeason.label}...`;
  try {
    const map = await loadMap(activeSeason.mapPath);
    validateMapMarkers(map);
    await initializeGame(map, activeSeason, requestId);
  } catch (error) {
    if (requestId !== seasonLoadId) return;
    console.error(error);
    status.textContent = `Could not load ${activeSeason.label}: ${error.message}`;
    document.getElementById('loadingScreen').style.display = 'none';
  }
}

async function initializeGame(map, season, requestId) {
  if (!season.playerSpriteDirectory || !season.enderSprites?.length
      || !season.tileMapping || !season.walkableTiles?.length
      || !season.tileMapping[98] || !season.tileMapping[99]) {
    throw new Error(`${season.label} is marked as configured but is missing required asset configuration.`);
  }
  const nextGame = new Game(canvas, map, season);
  await nextGame.loadTiles();

  const nextPlayer = new Player(nextGame, season.playerSpriteDirectory);
  const endPosition = getEndPosition(map);
  const nextEnder = new Ender(nextGame, endPosition.x, endPosition.y, season.enderSprites);
  await Promise.all([nextPlayer.loadSprites(), nextEnder.loadSprites()]);

  if (requestId !== seasonLoadId) return;

  game = nextGame;
  player = nextPlayer;
  ender = nextEnder;
  canvas.width = game.viewWidth * game.tileSize;
  canvas.height = game.viewHeight * game.tileSize;
  gameState = GameState.RUNNING;
  moveCooldown = 0;
  status.textContent = `${season.icon} ${season.label} selected. Reach the ${season.label.toLowerCase()} end character!`;
  document.getElementById('loadingScreen').style.display = 'none';
}

function doMove() {
  let dx = 0;
  let dy = 0;
  if (activeDirection === 'ArrowUp') dy = -1;
  else if (activeDirection === 'ArrowDown') dy = 1;
  else if (activeDirection === 'ArrowLeft') dx = -1;
  else if (activeDirection === 'ArrowRight') dx = 1;
  if (dx !== 0 || dy !== 0) player.move(dx, dy);
}

function drawSetupScreen() {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#effaff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#31546a';
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px Arial';
  ctx.fillText(`${activeSeason.icon} ${activeSeason.label}`, canvas.width / 2, canvas.height / 2 - 18);
  ctx.font = '16px Arial';
  ctx.fillText(
    activeSeason.configured ? 'Loading season assets...' : 'Season assets have not been added yet.',
    canvas.width / 2,
    canvas.height / 2 + 18
  );
}

function gameLoop() {
  if (gameState === GameState.RUNNING) {
    game.updateCamera(player.x, player.y);
    if (activeDirection) {
      if (moveCooldown > 0) moveCooldown--;
      else {
        doMove();
        moveCooldown = MOVE_DELAY;
      }
    }

    ender.updateAnimation();
    game.drawMap();
    game.drawEntities([ender]);
    player.draw(game.ctx);

    if (player.collidedWith(ender)) {
      gameState = GameState.WON;
      winTimer = 3 * FPS;
    }
  } else if (gameState === GameState.SETUP) {
    drawSetupScreen();
  } else if (gameState === GameState.WON) {
    game.ctx.fillStyle = 'rgba(0,0,0,0.6)';
    game.ctx.fillRect(0, 0, canvas.width, canvas.height);
    game.ctx.fillStyle = 'white';
    game.ctx.font = '24px Arial';
    game.ctx.textAlign = 'center';
    game.ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
    game.ctx.fillText('Reload to play again.', canvas.width / 2, canvas.height / 2 + 30);
    winTimer--;
    if (winTimer <= 0) gameState = GameState.GAME_OVER;
  } else if (gameState === GameState.GAME_OVER) {
    game.ctx.fillStyle = 'black';
    game.ctx.fillRect(0, 0, canvas.width, canvas.height);
    game.ctx.fillStyle = 'yellow';
    game.ctx.font = '28px Arial';
    game.ctx.textAlign = 'center';
    game.ctx.fillText('You finished the map!', canvas.width / 2, canvas.height / 2);
    game.ctx.fillText('Reload to play again.', canvas.width / 2, canvas.height / 2 + 30);
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
selectSeason(activeSeason.key);
