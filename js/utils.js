// Load a single image and return a Promise
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
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
  const text = await res.text();
  return text.trim().split('\n').map(line => 
    line.trim().split(' ').map(num => parseInt(num, 10))
  );
}

// Tile number -> image path mapping
export const tileMapping = {
  1: 'assets/tiles/frozenflowers/frozenflower1.png',
  2: 'assets/tiles/frozenflowers/frozenflower2.png',
  3: 'assets/tiles/icecracks/icecrack1.png',
  4: 'assets/tiles/icecracks/icecrack2.png',
  5: 'assets/tiles/icetiles/icetile1.png',
  6: 'assets/tiles/rocks/rock1.png',
  7: 'assets/tiles/rocks/rock2.png',
  8: 'assets/tiles/rocks/rock3.png',
  9: 'assets/tiles/rocks/rock4.png',
  10: 'assets/tiles/rocks/rock5.png',
  11: 'assets/tiles/rocks/rock6.png',
  12: 'assets/tiles/trees/tree1.png',
  13: 'assets/tiles/trees/tree2.png',
  14: 'assets/tiles/trees/tree3.png',
  15: 'assets/tiles/snowman.png',
  98: 'assets/bear/bear1.png', // end tile
  99: 'assets/map-editor/startTile.png' // start tile
};
