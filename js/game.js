import { loadEndTileImage, loadImage } from './utils.js';

export const TILE_SIZE = 32;

export function calculateViewTileCount() {
    return Math.floor(Math.min(window.innerHeight, window.innerWidth) / (TILE_SIZE * 1.2)) - 2;
}

export class Game {
    constructor(canvas, map, season) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = TILE_SIZE;

        this.map = map;
        this.tileMapping = season.tileMapping;
        this.walkableTiles = season.walkableTiles;
        this.defaultTile = season.defaultTile;

        this.tileImages = {};

        const viewTileCount = calculateViewTileCount();

        this.viewWidth = viewTileCount;
        this.viewHeight = viewTileCount;
        this.cameraX = 0;
        this.cameraY = 0;
    }

    async loadTiles() {
        const uniqueTiles = new Set();
        this.map.forEach(row => row.forEach(tile => uniqueTiles.add(tile)));

        for (const tile of uniqueTiles) {
            const path = this.tileMapping[tile];
            if (!path) {
                throw new Error(`Tile ${tile} has no image in this season's tile mapping.`);
            }

            if (tile === 98) {
                const groundPath = this.tileMapping[this.defaultTile];
                if (!groundPath) {
                    throw new Error(`Default ground tile ${this.defaultTile} has no image in this season's tile mapping.`);
                }
                this.tileImages[tile] = await loadEndTileImage(groundPath, path, this.tileSize);
                continue;
            }

            const img = await loadImage(path);
            const canvasImg = document.createElement('canvas');
            canvasImg.width = this.tileSize;
            canvasImg.height = this.tileSize;
            const ctx = canvasImg.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, this.tileSize, this.tileSize);
            this.tileImages[tile] = canvasImg;
        }
    }

    updateCamera(playerX, playerY) {
        this.cameraX = playerX - Math.floor(this.viewWidth / 2);
        this.cameraY = playerY - Math.floor(this.viewHeight / 2);

        this.cameraX = Math.max(0, Math.min(this.cameraX, this.map[0].length - this.viewWidth));
        this.cameraY = Math.max(0, Math.min(this.cameraY, this.map.length - this.viewHeight));
    }

    drawMap() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = "#ddd";

        for (let y = 0; y < this.viewHeight; y++) {
            for (let x = 0; x < this.viewWidth; x++) {
                const mapX = x + this.cameraX;
                const mapY = y + this.cameraY;

                if (mapY >= this.map.length || mapX >= this.map[0].length) continue;

                this.ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);

                const tile = this.map[mapY][mapX];

                const img = this.tileImages[tile];

                if (!img) {
                    // Skip drawing if image missing
                    continue;
                }

                this.ctx.drawImage(img, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
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
