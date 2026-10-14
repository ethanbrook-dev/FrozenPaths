import { loadImage } from "./utils.js";

export class Ender {
    constructor(game, x, y, spritePaths) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.spritePaths = spritePaths;
        this.sprites = [];
        this.frame = 0;
        this.frameTimer = 0;
        this.frameInterval = 20;
    }

    async loadSprites() {
        this.sprites = await Promise.all(this.spritePaths.map(loadImage));
    }

    updateAnimation() {
        this.frameTimer++;
        if (this.frameTimer >= this.frameInterval) {
            this.frame = (this.frame + 1) % this.sprites.length;
            this.frameTimer = 0;
        }
    }

    draw(ctx) {
        const tileSize = this.game.tileSize;
        const screenX = (this.x - this.game.cameraX) * tileSize;
        const screenY = (this.y - this.game.cameraY) * tileSize;
        ctx.drawImage(this.sprites[this.frame], screenX, screenY, tileSize, tileSize);
    }
}
