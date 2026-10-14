// js/map-editor.js
import { loadEndTileImage, loadImage, serializeMap, validateMapMarkers } from './utils.js';
import { calculateViewTileCount, TILE_SIZE } from './game.js';
import { updateCursor } from './cursor.js';
import { createTool } from './createTool.js';
import { getSeasonFromLocation } from './seasons.js';

const canvas = document.getElementById("editorCanvas");
const ctx = canvas.getContext("2d");
const paletteDiv = document.getElementById("tilePalette");
const saveBtn = document.getElementById("saveMapBtn");
const mapNameInput = document.getElementById("mapName");
const season = getSeasonFromLocation();
document.querySelector(".editor-title").textContent += ` · ${season.label}`;

// Map initialization
let grid = [];        // will be filled after modal
let gridWidth = 0;
let gridHeight = 0;

// Tile images
const tileImages = {};

// Currently selected tile
let selectedTile = null;

// Modal elements
const modal = document.getElementById("mapSizeModal");
const sizeInput = document.getElementById("mapSizeInput");
const createBtn = document.getElementById("createMapBtn");

// ====== CONFIG ======
const viewTileCount = calculateViewTileCount();
let viewWidth = viewTileCount;
let viewHeight = viewTileCount;

// Camera position (top-left tile)
let cameraX = 0;
let cameraY = 0;

// Camera scroll settings
const scrollSpeed = 1; // tiles per tick

// ====== Draw Grid with Camera ======
function drawGrid() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#ddd";
  for (let y = 0; y < viewHeight; y++) {
    for (let x = 0; x < viewWidth; x++) {
      const mapX = x + cameraX;
      const mapY = y + cameraY;
      if (mapX >= gridWidth || mapY >= gridHeight) continue;
      ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      const tile = grid[mapY][mapX];
      if (tile !== 0 && tileImages[tile]) {
        ctx.drawImage(tileImages[tile], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // Draw scroll buttons/arrows
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  scrollButtons.forEach(btn => {
    const x = typeof btn.x === 'function' ? btn.x() : btn.x;
    const y = typeof btn.y === 'function' ? btn.y() : btn.y;
    const w = typeof btn.w === 'function' ? btn.w() : btn.w;
    const h = typeof btn.h === 'function' ? btn.h() : btn.h;
    ctx.fillRect(x, y, w, h);

    // Draw simple arrows
    ctx.fillStyle = "white";
    ctx.beginPath();
    if (btn.dir === 'up') {
      ctx.moveTo(x + w / 2, y + 5);
      ctx.lineTo(x + w / 2 - 5, y + 15);
      ctx.lineTo(x + w / 2 + 5, y + 15);
    }
    if (btn.dir === 'down') {
      ctx.moveTo(x + w / 2, y + h - 5);
      ctx.lineTo(x + w / 2 - 5, y + h - 15);
      ctx.lineTo(x + w / 2 + 5, y + h - 15);
    }
    if (btn.dir === 'left') {
      ctx.moveTo(x + 5, y + h / 2);
      ctx.lineTo(x + 15, y + h / 2 - 5);
      ctx.lineTo(x + 15, y + h / 2 + 5);
    }
    if (btn.dir === 'right') {
      ctx.moveTo(x + w - 5, y + h / 2);
      ctx.lineTo(x + w - 15, y + h / 2 - 5);
      ctx.lineTo(x + w - 15, y + h / 2 + 5);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.2)";
  });
}

// ====== Scroll Buttons Config ======
const scrollButtons = [
  { dir: 'up', x: 0, y: 0, w: () => canvas.width, h: () => TILE_SIZE },
  { dir: 'down', x: 0, y: () => canvas.height - TILE_SIZE, w: () => canvas.width, h: () => TILE_SIZE },
  { dir: 'left', x: 0, y: 0, w: () => TILE_SIZE, h: () => canvas.height },
  { dir: 'right', x: () => canvas.width - TILE_SIZE, y: 0, w: () => TILE_SIZE, h: () => canvas.height }
];

let scrollInterval = null;
function startScrolling(direction) {
  if (scrollInterval) clearInterval(scrollInterval);
  scrollInterval = setInterval(() => {
    if (direction === 'up') cameraY = Math.max(0, cameraY - scrollSpeed);
    if (direction === 'down') cameraY = Math.min(gridHeight - viewHeight, cameraY + scrollSpeed);
    if (direction === 'left') cameraX = Math.max(0, cameraX - scrollSpeed);
    if (direction === 'right') cameraX = Math.min(gridWidth - viewWidth, cameraX + scrollSpeed);
    drawGrid();
  }, 30);
}
function stopScrolling() { if (scrollInterval) clearInterval(scrollInterval); }

// Mouse for scroll buttons
canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  for (const btn of scrollButtons) {
    const x = typeof btn.x === 'function' ? btn.x() : btn.x;
    const y = typeof btn.y === 'function' ? btn.y() : btn.y;
    const w = typeof btn.w === 'function' ? btn.w() : btn.w;
    const h = typeof btn.h === 'function' ? btn.h() : btn.h;
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) startScrolling(btn.dir);
  }
});
canvas.addEventListener("mouseup", stopScrolling);
canvas.addEventListener("mouseleave", stopScrolling);

// ====== Load Palette ======
async function loadPalette() {
  for (const [num, path] of Object.entries(season.tileMapping || {})) {
    const container = document.createElement("div");
    container.className = "tileOption";
    container.dataset.tile = num;
    const img = num === "98"
      ? await loadEndTileImage(season.tileMapping[season.defaultTile], path, TILE_SIZE)
      : await loadImage(path);
    tileImages[num] = img;
    const tileImg = document.createElement("img");
    tileImg.src = num === "98" ? img.toDataURL() : path;
    tileImg.width = TILE_SIZE;
    tileImg.height = TILE_SIZE;
    const label = document.createElement("p");
    label.innerText = (season.tileNames && season.tileNames[num]) || `Tile ${num}`;
    container.appendChild(tileImg);
    container.appendChild(label);
    container.addEventListener("click", () => {
      document.querySelectorAll(".tileOption").forEach(opt => opt.classList.remove("selected"));
      container.classList.add("selected");
      selectedTile = parseInt(num, 10);
      updateCursor(canvas, path);
    });
    paletteDiv.appendChild(container);
  }

  createTool(canvas, paletteDiv, "Cursor", "assets/map-editor/cursor.png", null, tile => selectedTile = tile);
  createTool(canvas, paletteDiv, "Eraser", "assets/map-editor/eraser.png", 0, tile => selectedTile = tile);
}

// ====== Handle Painting ======
let isMouseDown = false;
canvas.addEventListener("mousedown", e => { isMouseDown = true; paintAtEvent(e); });
canvas.addEventListener("mouseup", () => (isMouseDown = false));
canvas.addEventListener("mousemove", e => { if (isMouseDown) paintAtEvent(e); });

function paintAtEvent(e) {
  if (selectedTile === null) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
  const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
  const mapX = x + cameraX;
  const mapY = y + cameraY;
  if (mapX >= 0 && mapX < gridWidth && mapY >= 0 && mapY < gridHeight) {
    if (selectedTile === 99 || selectedTile === 98) {
      for (let row = 0; row < gridHeight; row++)
        for (let col = 0; col < gridWidth; col++)
          if (grid[row][col] === selectedTile) grid[row][col] = 0;
    }
    grid[mapY][mapX] = selectedTile;
    drawGrid();
  }
}

// ====== Save Map ======
saveBtn.addEventListener("click", () => {
  try {
    validateMapMarkers(grid);
  } catch (error) {
    alert(error.message);
    return;
  }
  const defaultTile = season.defaultTile;
  const emptyTiles = grid.flat().filter(n => n === 0).length;
  if (emptyTiles > 0) {
    const confirmSwap = confirm(`There are ${emptyTiles} empty tiles. They will be replaced with default tile. Continue?`);
    if (!confirmSwap) return;
    for (let y = 0; y < grid.length; y++)
      for (let x = 0; x < grid[y].length; x++)
        if (grid[y][x] === 0) grid[y][x] = defaultTile;
  }
  saveMapAndDownload();
});

function saveMapAndDownload() {
  const name = mapNameInput.value.trim() || "untitled";
  const text = serializeMap(grid, season.key);
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${season.key}-${name}.txt`;
  link.click();
}

function getTileLabel(num) {
  const n = parseInt(num, 10);
  if (n === 1) return "Frozen Flower 1";
  if (n === 2) return "Frozen Flower 2";
  if (n === 3) return "Ice Crack 1";
  if (n === 4) return "Ice Crack 2";
  if (n === 5) return "Ice Tile";
  if (n >= 6 && n <= 11) return `Rock ${n - 5}`;
  if (n >= 12 && n <= 14) return `Tree ${n - 11}`;
  if (n === 15) return "Snowman";
  if (n === 99) return "Start";
  if (n === 98) return "End";
  return `Tile ${num}`;
}

// ====== Init ======
createBtn.addEventListener("click", async () => {
  console.log("Map created ...");
  const size = parseInt(sizeInput.value, 10);
  if (isNaN(size) || size < viewTileCount || size > 10000) {
    alert(`Map size must be between ${viewTileCount} and 10000`); return;
  }
  gridWidth = size; gridHeight = size;
  canvas.width = viewWidth * TILE_SIZE;
  canvas.height = viewHeight * TILE_SIZE;
  grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));
  modal.style.display = "none";
  await loadPalette();
  drawGrid();
});
