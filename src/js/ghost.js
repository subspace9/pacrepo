class Ghost {
    constructor(name, x, y, color) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.color = color;
        this.direction = 'left';
        this.speed = 1.5;
        this.size = 18;
        this.isVulnerable = false;
        this.isEaten = false;
        this.vulnerableTimer = 0;
        this.startPosition = { x, y };
        this.scatterMode = false;
        this.scatterTarget = this.getScatterTarget();
        this.updateCounter = 0;
    }

    getScatterTarget() {
        // Different scatter corners for each ghost
        const targets = {
            'blinky': { x: 25, y: 1 },
            'pinky': { x: 2, y: 1 },
            'inky': { x: 27, y: 30 },
            'clyde': { x: 0, y: 30 }
        };
        return targets[this.name] || { x: 0, y: 0 };
    }

    update(deltaTime, pacman, maze) {
        if (this.isEaten) {
            this.returnToHome(maze);
            return;
        }

        if (this.isVulnerable) {
            this.vulnerableTimer -= deltaTime;
            if (this.vulnerableTimer <= 0) {
                this.isVulnerable = false;
                this.speed = 1.5;
            }
        }

        // Update less frequently for performance
        this.updateCounter++;
        if (this.updateCounter % 3 === 0) {
            this.updateDirection(pacman, maze);
        }

        this.move(maze);
        this.handleWrapping(maze);
    }

    updateDirection(pacman, maze) {
        if (this.isVulnerable) {
            this.moveAway(pacman, maze);
        } else if (this.scatterMode) {
            this.moveToTarget(this.scatterTarget.x, this.scatterTarget.y, maze);
        } else {
            this.chase(pacman, maze);
        }
    }

    chase(pacman, maze) {
        // Different chase behaviors for each ghost
        switch(this.name) {
            case 'blinky':
                this.directChase(pacman, maze);
                break;
            case 'pinky':
                this.ambushChase(pacman, maze);
                break;
            case 'inky':
                this.patrolChase(pacman, maze);
                break;
            case 'clyde':
                this.randomChase(maze);
                break;
        }
    }

    directChase(pacman, maze) {
        // Direct chase behavior (Blinky) - chase Pac-Man's current position
        const pacCol = Math.floor(pacman.x / maze.tileSize);
        const pacRow = Math.floor(pacman.y / maze.tileSize);
        this.moveToTarget(pacCol, pacRow, maze);
    }

    ambushChase(pacman, maze) {
        // Ambush behavior (Pinky) - target ahead of Pac-Man
        const pacCol = Math.floor(pacman.x / maze.tileSize);
        const pacRow = Math.floor(pacman.y / maze.tileSize);
        
        let targetCol = pacCol;
        let targetRow = pacRow;
        
        switch(pacman.direction) {
            case 'up':
                targetRow -= 4;
                break;
            case 'down':
                targetRow += 4;
                break;
            case 'left':
                targetCol -= 4;
                break;
            case 'right':
                targetCol += 4;
                break;
        }
        
        this.moveToTarget(targetCol, targetRow, maze);
    }

    patrolChase(pacman, maze) {
        // Patrol behavior (Inky) - uses a vector from Blinky to Pac-Man
        const pacCol = Math.floor(pacman.x / maze.tileSize);
        const pacRow = Math.floor(pacman.y / maze.tileSize);
        
        // Create an offset pattern
        const offset = Math.floor(Date.now() / 2000) % 4;
        const offsets = [
            { col: 2, row: 0 },
            { col: 0, row: 2 },
            { col: -2, row: 0 },
            { col: 0, row: -2 }
        ];
        
        this.moveToTarget(pacCol + offsets[offset].col, pacRow + offsets[offset].row, maze);
    }

    randomChase(maze) {
        // Random movement (Clyde) with occasional direction changes
        if (Math.random() < 0.05) { // 5% chance to change direction
            const directions = this.getValidDirections(maze);
            if (directions.length > 0) {
                this.direction = directions[Math.floor(Math.random() * directions.length)];
            }
        }
    }

    moveAway(pacman, maze) {
        // Move away from Pac-Man when vulnerable
        const pacCol = Math.floor(pacman.x / maze.tileSize);
        const pacRow = Math.floor(pacman.y / maze.tileSize);
        const myCol = Math.floor(this.x / maze.tileSize);
        const myRow = Math.floor(this.y / maze.tileSize);
        
        // Move in opposite direction
        const dx = myCol - pacCol;
        const dy = myRow - pacRow;
        
        const targetCol = myCol + Math.sign(dx) * 5;
        const targetRow = myRow + Math.sign(dy) * 5;
        
        this.moveToTarget(targetCol, targetRow, maze);
    }

    moveToTarget(targetCol, targetRow, maze) {
        const myCol = Math.floor(this.x / maze.tileSize);
        const myRow = Math.floor(this.y / maze.tileSize);
        
        // Simple pathfinding: choose direction that gets closer to target
        const directions = this.getValidDirections(maze);
        let bestDirection = this.direction;
        let bestDistance = Infinity;
        
        for (const dir of directions) {
            // Don't reverse direction
            if (this.isOppositeDirection(dir, this.direction)) continue;
            
            const nextPos = this.getNextPosition(dir);
            const nextCol = Math.floor(nextPos.x / maze.tileSize);
            const nextRow = Math.floor(nextPos.y / maze.tileSize);
            
            const distance = Math.abs(nextCol - targetCol) + Math.abs(nextRow - targetRow);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestDirection = dir;
            }
        }
        
        this.direction = bestDirection;
    }

    getValidDirections(maze) {
        const directions = [];
        const testDirs = ['up', 'down', 'left', 'right'];
        
        for (const dir of testDirs) {
            const nextPos = this.getNextPosition(dir);
            if (!maze.checkWallCollision(nextPos.x, nextPos.y, this.size)) {
                directions.push(dir);
            }
        }
        
        return directions;
    }

    getNextPosition(direction) {
        let x = this.x;
        let y = this.y;
        const step = this.speed * 2;
        
        switch (direction) {
            case 'up': y -= step; break;
            case 'down': y += step; break;
            case 'left': x -= step; break;
            case 'right': x += step; break;
        }
        
        return { x, y };
    }

    isOppositeDirection(dir1, dir2) {
        return (dir1 === 'up' && dir2 === 'down') ||
               (dir1 === 'down' && dir2 === 'up') ||
               (dir1 === 'left' && dir2 === 'right') ||
               (dir1 === 'right' && dir2 === 'left');
    }

    move(maze) {
        const nextX = this.getNextX();
        const nextY = this.getNextY();
        
        if (!maze.checkWallCollision(nextX, nextY, this.size)) {
            this.x = nextX;
            this.y = nextY;
        }
    }

    getNextX() {
        let nextX = this.x;
        if (this.direction === 'left') nextX -= this.speed;
        if (this.direction === 'right') nextX += this.speed;
        return nextX;
    }

    getNextY() {
        let nextY = this.y;
        if (this.direction === 'up') nextY -= this.speed;
        if (this.direction === 'down') nextY += this.speed;
        return nextY;
    }

    handleWrapping(maze) {
        const mazeWidth = maze.width * maze.tileSize;
        if (this.x < -this.size) {
            this.x = mazeWidth;
        } else if (this.x > mazeWidth + this.size) {
            this.x = 0;
        }
    }

    makeVulnerable(duration = 10000) {
        this.isVulnerable = true;
        this.vulnerableTimer = duration;
        this.speed = 1; // Slower when vulnerable
    }

    eat() {
        this.isEaten = true;
        this.isVulnerable = false;
        this.speed = 3; // Faster when returning home
    }

    reset() {
        this.x = this.startPosition.x;
        this.y = this.startPosition.y;
        this.isVulnerable = false;
        this.isEaten = false;
        this.speed = 1.5;
        this.direction = 'left';
    }

    returnToHome(maze) {
        const homePos = maze.getGhostHousePosition();
        const dx = homePos.x - this.x;
        const dy = homePos.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            this.isEaten = false;
            this.speed = 1.5;
            return;
        }
        
        const homeCol = Math.floor(homePos.x / maze.tileSize);
        const homeRow = Math.floor(homePos.y / maze.tileSize);
        this.moveToTarget(homeCol, homeRow, maze);
        this.move(maze);
    }

    setScatterMode(enabled) {
        this.scatterMode = enabled;
    }

    draw(ctx) {
        if (this.isEaten) {
            // Draw eyes only
            this.drawEyes(ctx);
        } else if (this.isVulnerable) {
            // Draw vulnerable ghost (blue)
            const flash = this.vulnerableTimer < 2000 && Math.floor(Date.now() / 200) % 2 === 0;
            ctx.fillStyle = flash ? '#FFFFFF' : '#2121DE';
            this.drawBody(ctx);
            this.drawEyes(ctx, '#FFFFFF');
        } else {
            // Draw normal ghost
            ctx.fillStyle = this.color;
            this.drawBody(ctx);
            this.drawEyes(ctx);
        }
    }

    drawBody(ctx) {
        const radius = this.size / 2;
        
        // Body
        ctx.beginPath();
        ctx.arc(this.x, this.y - radius / 2, radius, Math.PI, 0, false);
        ctx.lineTo(this.x + radius, this.y + radius);
        
        // Wavy bottom
        const waveCount = 3;
        const waveWidth = (radius * 2) / waveCount;
        for (let i = 0; i < waveCount; i++) {
            const waveX = this.x + radius - (i * waveWidth) - waveWidth / 2;
            ctx.lineTo(waveX, this.y + radius - radius / 4);
            ctx.lineTo(waveX - waveWidth / 2, this.y + radius);
        }
        
        ctx.lineTo(this.x - radius, this.y + radius);
        ctx.closePath();
        ctx.fill();
    }

    drawEyes(ctx, color = '#FFFFFF') {
        const eyeRadius = this.size / 8;
        const eyeOffset = this.size / 6;
        const pupilOffset = this.size / 10;
        
        // Determine pupil position based on direction
        let pupilX = 0, pupilY = 0;
        switch (this.direction) {
            case 'left': pupilX = -pupilOffset; break;
            case 'right': pupilX = pupilOffset; break;
            case 'up': pupilY = -pupilOffset; break;
            case 'down': pupilY = pupilOffset; break;
        }
        
        // Left eye
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x - eyeOffset, this.y - this.size / 6, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(this.x + eyeOffset, this.y - this.size / 6, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        if (!this.isEaten) {
            ctx.fillStyle = '#2121DE';
            ctx.beginPath();
            ctx.arc(this.x - eyeOffset + pupilX, this.y - this.size / 6 + pupilY, eyeRadius / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x + eyeOffset + pupilX, this.y - this.size / 6 + pupilY, eyeRadius / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}