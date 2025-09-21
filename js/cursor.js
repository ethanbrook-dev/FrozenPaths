// js/cursor.js
import { TILE_SIZE } from "./game.js";

export function updateCursor(canvas, imgPath, size = TILE_SIZE) {
  if (!imgPath) { canvas.style.cursor = "default"; return; }
  const img = new Image();
  img.src = imgPath;
  img.onload = () => {
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = size;
    tmpCanvas.height = size;
    tmpCanvas.getContext("2d").drawImage(img, 0, 0, size, size);
    canvas.style.cursor = `url(${tmpCanvas.toDataURL()}) ${size / 2} ${size / 2}, auto`;
  };
}