export class Bear {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;

        this.frame = 1;
        this.sprites = [];

        // Preload idle frames (bear1, bear2, bear3)
        for (let i = 1; i <= 3; i++) {
            const img = new Image();
            img.src = `assets/bear/bear${i}.png`;
            this.sprites.push(img);
        }

        this.frameTimer = 0;
        this.frameInterval = 20; // adjust for slower/idle breathing animation
    }

    updateAnimation() {
        this.frameTimer++;
        if (this.frameTimer >= this.frameInterval) {
            this.frame = this.frame < 3 ? this.frame + 1 : 1;
            this.frameTimer = 0;
        }
    }

    draw(ctx) {
        this.updateAnimation();

        const tileSize = this.game.tileSize;
        const screenX = (this.x - this.game.cameraX) * tileSize;
        const screenY = (this.y - this.game.cameraY) * tileSize;

        const img = this.sprites[this.frame - 1];
        ctx.drawImage(img, screenX, screenY, tileSize, tileSize);
    }
}
