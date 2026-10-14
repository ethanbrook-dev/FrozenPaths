import { loadImage } from './utils.js';

export class Player {
    constructor(game, spriteDirectory) {
        this.game = game;
        this.spriteDirectory = spriteDirectory;
        const start = this.findStartTile();
        this.x = start.x;
        this.y = start.y;

        this.direction = 'forward';
        this.frame = 1;
        this.frameTimer = 0;
        this.frameInterval = 1;

        this.moving = false;

        this.sprites = {};
    }

    async loadSprites() {
        const moves = ['forward', 'backwards', 'left', 'right'];
        await Promise.all(moves.map(async move => {
            this.sprites[move] = await Promise.all(
                [1, 2, 3].map(frame => loadImage(`${this.spriteDirectory}/walk-${move}-${frame}.png`))
            );
        }));
    }

    findStartTile() {
        const map = this.game.map;
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === 99) {  // <-- start tile marker ('99' in map file)
                    return { x, y };
                }
            }
        }
        // Fall back to the season's ground tile if no start marker exists.
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (this.game.walkableTiles.includes(map[y][x])) return { x, y };
            }
        }
        return { x: 0, y: 0 };
    }

    // dx/dy can be 0 if player is blocked
    move(dx, dy) {
        const map = this.game.map;
        const newX = this.x + dx;
        const newY = this.y + dy;

        // Update facing direction immediately
        if (dx > 0) this.direction = 'right';
        else if (dx < 0) this.direction = 'left';
        else if (dy > 0) this.direction = 'forward';
        else if (dy < 0) this.direction = 'backwards';

        // Check bounds
        if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) {
            this.moving = false;
            return;
        }

        // Diagonal move: prevent corner-cutting
        if (dx !== 0 && dy !== 0) {
            if (!this.game.walkableTiles.includes(map[this.y + dy][this.x])
                || !this.game.walkableTiles.includes(map[this.y][this.x + dx])) {
                this.moving = false;
                return;
            }
        }

        if (this.game.walkableTiles.includes(map[newY][newX])) {
            this.x = newX;
            this.y = newY;
            this.moving = true;
            this.updateAnimation();
        } else {
            this.moving = false;
        }
    }

    collidedWith(entity) {
        return this.x === entity.x && this.y === entity.y;
    }

    updateAnimation() {
        // Only advance frames if currently moving or holding a key
        if (this.moving) {
            this.frameTimer++;
            if (this.frameTimer >= this.frameInterval) {
                this.frame = this.frame < 3 ? this.frame + 1 : 1;
                this.frameTimer = 0;
            }
        } else {
            // reset to first frame when idle
            this.frame = 1;
            this.frameTimer = 0;
        }
    }

    draw(ctx) {
        const tileSize = this.game.tileSize;
        const screenX = (this.x - this.game.cameraX) * tileSize;
        const screenY = (this.y - this.game.cameraY) * tileSize;

        const img = this.sprites[this.direction][this.frame - 1];
        ctx.drawImage(img, screenX, screenY, tileSize, tileSize);
    }
}
