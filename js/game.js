import { tileMapping, loadImage } from './utils.js';

export class Game {
    constructor(canvas, map) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 32;

        // Real map from main.js (50x50)
        this.map = map;

        this.tileImages = {};

        this.viewWidth = 10;
        this.viewHeight = 10;
        this.cameraX = 0;
        this.cameraY = 0;
    }

    async loadTiles() {
        const uniqueTiles = new Set();
        this.map.forEach(row => row.forEach(tile => uniqueTiles.add(tile)));

        for (let tile of uniqueTiles) {
            if (tileMapping[tile]) {
                const img = await loadImage(tileMapping[tile]);
                const canvasImg = document.createElement('canvas');
                canvasImg.width = this.tileSize;
                canvasImg.height = this.tileSize;
                const ctx = canvasImg.getContext('2d');
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, 0, 0, this.tileSize, this.tileSize);

                const finalImg = new Image();
                finalImg.src = canvasImg.toDataURL();
                this.tileImages[tile] = finalImg;
            }
        }
    }

    updateCamera(playerX, playerY) {
        // Center camera on player position
        this.cameraX = playerX - Math.floor(this.viewWidth / 2);
        this.cameraY = playerY - Math.floor(this.viewHeight / 2);

        // Clamp to map bounds
        this.cameraX = Math.max(0, Math.min(this.cameraX, this.map[0].length - this.viewWidth));
        this.cameraY = Math.max(0, Math.min(this.cameraY, this.map.length - this.viewHeight));
    }

    drawMap() {
        for (let y = 0; y < this.viewHeight; y++) {
            for (let x = 0; x < this.viewWidth; x++) {
                const mapX = x + this.cameraX;
                const mapY = y + this.cameraY;

                // Safety check
                if (mapY >= this.map.length || mapX >= this.map[0].length) continue;

                const tile = this.map[mapY][mapX];
                const img = this.tileImages[tile];

                this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);

                // Draw tile image on top
                if (img) {
                    this.ctx.drawImage(img, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }

    drawPlayer(player) {
        this.updateCamera(player.x, player.y);
        player.draw(this.ctx);
    }

    drawEntities(entities = []) {
        for (let e of entities) {
            e.draw(this.ctx);
        }
    }
}
