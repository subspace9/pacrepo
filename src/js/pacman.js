class PacMan {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.speed = 2;
        this.size = 18;
        this.mouthAngle = 0.2;
        this.mouthSpeed = 0.1;
        this.mouthOpen = true;
        this.isDead = false;
        this.deathAnimationFrame = 0;
        this.deathAnimationSpeed = 5;
    }

    update(deltaTime, maze) {
        if (this.isDead) {
            this.updateDeathAnimation(deltaTime);
            return;
        }

        // Try to change direction if next direction is set
        if (this.nextDirection !== this.direction) {
            if (this.canMove(this.nextDirection, maze)) {
                this.direction = this.nextDirection;
            }
        }

        // Move in current direction
        if (this.canMove(this.direction, maze)) {
            this.move();
        }

        // Update mouth animation
        this.animate(deltaTime);

        // Handle screen wrapping at tunnel
        this.handleWrapping(maze);
    }

    canMove(direction, maze) {
        const nextX = this.getNextX(direction);
        const nextY = this.getNextY(direction);
        return !maze.checkWallCollision(nextX, nextY, this.size);
    }

    getNextX(direction) {
        let nextX = this.x;
        if (direction === 'left') nextX -= this.speed;
        if (direction === 'right') nextX += this.speed;
        return nextX;
    }

    getNextY(direction) {
        let nextY = this.y;
        if (direction === 'up') nextY -= this.speed;
        if (direction === 'down') nextY += this.speed;
        return nextY;
    }

    move() {
        switch (this.direction) {
            case 'up':
                this.y -= this.speed;
                break;
            case 'down':
                this.y += this.speed;
                break;
            case 'left':
                this.x -= this.speed;
                break;
            case 'right':
                this.x += this.speed;
                break;
        }
    }

    animate(deltaTime) {
        // Animate mouth opening and closing
        if (this.mouthOpen) {
            this.mouthAngle += this.mouthSpeed;
            if (this.mouthAngle >= 0.8) {
                this.mouthOpen = false;
            }
        } else {
            this.mouthAngle -= this.mouthSpeed;
            if (this.mouthAngle <= 0.2) {
                this.mouthOpen = true;
            }
        }
    }

    handleWrapping(maze) {
        const mazeWidth = maze.width * maze.tileSize;
        if (this.x < -this.size) {
            this.x = mazeWidth;
        } else if (this.x > mazeWidth + this.size) {
            this.x = 0;
        }
    }

    setDirection(newDirection) {
        this.nextDirection = newDirection;
    }

    getGridPosition(tileSize) {
        return {
            row: Math.floor(this.y / tileSize),
            col: Math.floor(this.x / tileSize)
        };
    }

    die() {
        this.isDead = true;
        this.deathAnimationFrame = 0;
    }

    updateDeathAnimation(deltaTime) {
        this.deathAnimationFrame += this.deathAnimationSpeed * (deltaTime / 16.67);
    }

    isDeathAnimationComplete() {
        return this.deathAnimationFrame >= 60; // 60 frames for death animation
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.isDead = false;
        this.deathAnimationFrame = 0;
        this.mouthAngle = 0.2;
        this.mouthOpen = true;
    }

    draw(ctx) {
        if (this.isDead) {
            this.drawDeathAnimation(ctx);
        } else {
            this.drawNormal(ctx);
        }
    }

    drawNormal(ctx) {
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();

        // Calculate mouth angle based on direction
        let startAngle, endAngle;
        const baseAngle = this.mouthAngle * Math.PI;

        switch (this.direction) {
            case 'right':
                startAngle = baseAngle;
                endAngle = 2 * Math.PI - baseAngle;
                break;
            case 'left':
                startAngle = Math.PI + baseAngle;
                endAngle = Math.PI - baseAngle;
                break;
            case 'up':
                startAngle = Math.PI * 1.5 + baseAngle;
                endAngle = Math.PI * 1.5 - baseAngle;
                break;
            case 'down':
                startAngle = Math.PI * 0.5 + baseAngle;
                endAngle = Math.PI * 0.5 - baseAngle;
                break;
        }

        ctx.arc(this.x, this.y, this.size / 2, startAngle, endAngle);
        ctx.lineTo(this.x, this.y);
        ctx.fill();
    }

    drawDeathAnimation(ctx) {
        // Death animation: shrinking circle that opens wider
        const progress = Math.min(this.deathAnimationFrame / 60, 1);
        const size = (this.size / 2) * (1 - progress);
        const angle = progress * Math.PI;

        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, angle, 2 * Math.PI - angle);
        ctx.lineTo(this.x, this.y);
        ctx.fill();
    }
}