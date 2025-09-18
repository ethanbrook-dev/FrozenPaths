export class Player {
    constructor(game) {
        this.game = game;
        const start = this.findStartTile();
        this.x = start.x;
        this.y = start.y;

        this.direction = 'forward';
        this.frame = 1;
        this.frameTimer = 0;
        this.frameInterval = 1;

        this.moving = false;

        // Preload sprites
        this.sprites = {};
        const moves = ['forward', 'backwards', 'left', 'right'];
        for (let move of moves) {
            this.sprites[move] = [];
            for (let i = 1; i <= 3; i++) {
                const img = new Image();
                img.src = `assets/penguin/walk-${move}-${i}.png`;
                this.sprites[move].push(img);
            }
        }
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
        // fallback to first ice tile if no 99 in map file
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === 5) return { x, y };
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
            if (map[this.y + dy][this.x] !== 5 || map[this.y][this.x + dx] !== 5) {
                this.moving = false;
                return;
            }
        }

        // Only move if tile 5 or 98
        if (map[newY][newX] === 5 || map[newY][newX] === 98) {
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
