// js/map-editor.js
import { tileMapping, loadImage } from './utils.js';

const canvas = document.getElementById("editorCanvas");
const ctx = canvas.getContext("2d");
const paletteDiv = document.getElementById("tilePalette");
const saveBtn = document.getElementById("saveMapBtn");
const mapNameInput = document.getElementById("mapName");

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
const widthInput = document.getElementById("mapWidthInput");
const heightInput = document.getElementById("mapHeightInput");
const createBtn = document.getElementById("createMapBtn");

// ====== CONFIG ======
const tileSize = 32;
const viewTileCount = Math.floor(Math.min(window.innerHeight, window.innerWidth) / (tileSize * 1.2));
let viewWidth = viewTileCount;
let viewHeight = viewTileCount;

// Camera position (top-left tile)
let cameraX = 0;
let cameraY = 0;

// Camera scroll settings
const scrollSpeed = 1; // tiles per tick
const edgeThreshold = 10; // px near edge where scrolling starts

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

      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);

      const tile = grid[mapY][mapX];
      if (tile !== 0 && tileImages[tile]) {
        ctx.drawImage(tileImages[tile], x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

// Camera scrolling (horiz and vertic)
canvas.addEventListener("mousemove", e => {
  if (isMouseDown) paintAtEvent(e);

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Scroll if cursor is near left/right edge
  if (mouseX < edgeThreshold) {
    cameraX = Math.max(0, cameraX - scrollSpeed);
    drawGrid();
  } else if (mouseX > canvas.width - edgeThreshold) {
    cameraX = Math.min(gridWidth - viewWidth, cameraX + scrollSpeed);
    drawGrid();
  }

  // Scroll if cursor is near top/bottom edge
  if (mouseY < edgeThreshold) {
    cameraY = Math.max(0, cameraY - scrollSpeed);
    drawGrid();
  } else if (mouseY > canvas.height - edgeThreshold) {
    cameraY = Math.min(gridHeight - viewHeight, cameraY + scrollSpeed);
    drawGrid();
  }
});

// ====== Load Palette ======
async function loadPalette() {
  for (const [num, path] of Object.entries(tileMapping)) {
    const container = document.createElement("div");
    container.className = "tileOption";
    container.dataset.tile = num;

    const img = await loadImage(path);
    tileImages[num] = img;

    const tileImg = document.createElement("img");
    tileImg.src = path;
    tileImg.width = tileSize;
    tileImg.height = tileSize;

    const label = document.createElement("p");
    label.innerText = getTileLabel(num);

    container.appendChild(tileImg);
    container.appendChild(label);

    container.addEventListener("click", () => {
      document.querySelectorAll(".tileOption").forEach(opt => opt.classList.remove("selected"));
      container.classList.add("selected");
      selectedTile = parseInt(num, 10);
      updateCursor(path);
    });

    paletteDiv.appendChild(container);
  }

  // Eraser
  const eraser = document.createElement("div");
  eraser.className = "tileOption eraser";
  eraser.dataset.tile = "0";

  const eraserImg = document.createElement("img");
  eraserImg.src = "assets/map-editor/eraser.png";
  eraserImg.width = tileSize;
  eraserImg.height = tileSize;

  const eraserLabel = document.createElement("p");
  eraserLabel.innerText = "Eraser";

  eraser.appendChild(eraserImg);
  eraser.appendChild(eraserLabel);

  eraser.addEventListener("click", () => {
    document.querySelectorAll(".tileOption").forEach(opt => opt.classList.remove("selected"));
    eraser.classList.add("selected");
    selectedTile = 0;
    updateCursor(null);
  });

  paletteDiv.appendChild(eraser);
}

// ====== Handle Painting ======
let isMouseDown = false;

canvas.addEventListener("mousedown", e => {
  isMouseDown = true;
  paintAtEvent(e);
});
canvas.addEventListener("mouseup", () => (isMouseDown = false));
canvas.addEventListener("mousemove", e => {
  if (isMouseDown) paintAtEvent(e);
});

function paintAtEvent(e) {
  if (selectedTile === null) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tileSize);
  const y = Math.floor((e.clientY - rect.top) / tileSize);

  const mapX = x + cameraX;
  const mapY = y + cameraY;

  if (mapX >= 0 && mapX < gridWidth && mapY >= 0 && mapY < gridHeight) {

    // Prevent multiple Start (99) or End (98)
    if (selectedTile === 99 || selectedTile === 98) {
      for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
          if (grid[row][col] === selectedTile) {
            grid[row][col] = 0; // clear the previous tile
          }
        }
      }
    }

    grid[mapY][mapX] = selectedTile;
    drawGrid();
  }
}

saveBtn.addEventListener("click", () => {
  const defaultTile = 5; // Tile to replace empty ones (walkable)
  const emptyTiles = grid.flat().filter(n => n === 0).length;

  if (emptyTiles > 0) {
    const confirmSwap = confirm(
      `There are ${emptyTiles} empty tiles. ` +
      `They will be replaced with the default walkable tile before saving. Continue?`
    );
    if (!confirmSwap) return; // stop saving if user cancels

    // Swap all empty tiles
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === 0) grid[y][x] = defaultTile;
      }
    }
  }

  saveMapAndDownload();
});

// ====== Helpers ======
function saveMapAndDownload() {
  const name = mapNameInput.value.trim() || "untitled";
  const text = grid
    .map(row => row.map(n => String(n).padStart(2, "0")).join(" "))
    .join("\n");

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${name}.txt`;
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

function updateCursor(imgPath, size = tileSize) {
  if (!imgPath) {
    canvas.style.cursor = "default";
    return;
  }

  const img = new Image();
  img.src = imgPath;
  img.onload = () => {
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = size;
    tmpCanvas.height = size;
    const ctx2 = tmpCanvas.getContext("2d");
    ctx2.drawImage(img, 0, 0, size, size);
    canvas.style.cursor = `url(${tmpCanvas.toDataURL()}) ${size / 2} ${size / 2}, auto`;
  };
}

// ====== Init ======
// Show modal until user defines map size
createBtn.addEventListener("click", async () => {
  const w = parseInt(widthInput.value, 10);
  const h = parseInt(heightInput.value, 10);

  if (isNaN(w) || isNaN(h) || w < 1 || h < 1 || w > 10000 || h > 10000) {
    alert("Width and height must be between 1 and 10000");
    return;
  }

  gridWidth = w;
  gridHeight = h;

  // Resize canvas
  canvas.width = viewWidth * tileSize;
  canvas.height = viewHeight * tileSize;

  // Init empty grid
  grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

  modal.style.display = "none"; // hide modal

  await loadPalette();
  drawGrid();
});
