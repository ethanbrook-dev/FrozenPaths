// Load a single image and return a Promise
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Unable to load image: ${src}`));
  });
}

//Resize image to new size using canvas
export function resizeImage(img, newSize) {
  const canvas = document.createElement('canvas');
  canvas.width = newSize;
  canvas.height = newSize;
  const ctx = canvas.getContext('2d');
  
  // Disable smoothing for pixel art
  ctx.imageSmoothingEnabled = false;
  
  ctx.drawImage(img, 0, 0, newSize, newSize);
  
  const resizedImg = new Image();
  resizedImg.src = canvas.toDataURL();
  return resizedImg;
}

// Load a text file (map) and parse into 2D array
export async function loadMap(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Unable to load map (${res.status}): ${url}`);
  }
  const text = await res.text();
  return parseMapText(text).map;
}

export function parseMapText(text) {
  let seasonKey = null;
  const rows = [];

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    const seasonMatch = trimmed.match(/^#\s*FrozenPaths\s+season:\s*([a-z]+)\s*$/i);
    if (seasonMatch) {
      seasonKey = seasonMatch[1].toLowerCase();
      continue;
    }
    if (!trimmed || trimmed.startsWith('#')) continue;

    const row = trimmed.split(/\s+/).map(Number);
    if (row.some(tile => !Number.isInteger(tile))) {
      throw new Error('Map contains a tile value that is not a whole number.');
    }
    rows.push(row);
  }

  if (rows.length === 0 || rows[0].length === 0) {
    throw new Error('Map is empty.');
  }
  if (rows.some(row => row.length !== rows[0].length)) {
    throw new Error('Map rows must all have the same number of tiles.');
  }

  return { map: rows, seasonKey };
}

export function serializeMap(map, seasonKey) {
  const rows = map.map(row => row.map(tile => String(tile).padStart(2, '0')).join(' '));
  return [`# FrozenPaths season: ${seasonKey}`, ...rows].join('\n');
}

export function validateMapMarkers(map) {
  const startCount = map.flat().filter(tile => tile === 99).length;
  const endCount = map.flat().filter(tile => tile === 98).length;
  if (startCount !== 1 || endCount !== 1) {
    throw new Error('Map must contain exactly one start tile (99) and one end tile (98).');
  }
}
