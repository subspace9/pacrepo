class Ghost {
    constructor(name, x, y, color) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.color = color;
        this.direction = 'left';
        this.speed = 4;
        this.isVulnerable = false;
        this.isEaten = false;
        this.vulnerableTimer = 0;
        this.startPosition = { x, y };
    }

    update(deltaTime, pacman) {
        if (this.isEaten) {
            this.returnToHome();
            return;
        }

        if (this.isVulnerable) {
            this.vulnerableTimer -= deltaTime;
            if (this.vulnerableTimer <= 0) {
                this.isVulnerable = false;
            }
            this.moveAway(pacman);
        } else {
            this.chase(pacman);
        }
    }

    chase(pacman) {
        // Different chase behaviors for each ghost
        switch(this.name) {
            case 'blinky':
                this.directChase(pacman);
                break;
            case 'pinky':
                this.ambushChase(pacman);
                break;
            case 'inky':
                this.patrolChase(pacman);
                break;
            case 'clyde':
                this.randomChase(pacman);
                break;
        }
    }

    directChase(pacman) {
        // Direct chase behavior (Blinky)
        const dx = pacman.x - this.x;
        const dy = pacman.y - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
        } else {
            this.direction = dy > 0 ? 'down' : 'up';
        }
        this.move();
    }

    ambushChase(pacman) {
        // Ambush behavior (Pinky)
        // Tries to get in front of Pacman
        let targetX = pacman.x;
        let targetY = pacman.y;
        
        switch(pacman.direction) {
            case 'up':
                targetY -= 4;
                break;
            case 'down':
                targetY += 4;
                break;
            case 'left':
                targetX -= 4;
                break;
            case 'right':
                targetX += 4;
                break;
        }
        
        this.moveTowards(targetX, targetY);
    }

    patrolChase(pacman) {
        // Patrol behavior (Inky)
        // Moves in a pattern while keeping distance from Pacman
        const time = Date.now() / 1000;
        const patrolRadius = 100;
        
        const targetX = this.startPosition.x + Math.cos(time) * patrolRadius;
        const targetY = this.startPosition.y + Math.sin(time) * patrolRadius;
        
        this.moveTowards(targetX, targetY);
    }

    randomChase(pacman) {
        // Random movement (Clyde)
        if (Math.random() < 0.02) { // 2% chance to change direction
            const directions = ['up', 'down', 'left', 'right'];
            this.direction = directions[Math.floor(Math.random() * directions.length)];
        }
        this.move();
    }

    moveAway(pacman) {
        // Move away from Pacman when vulnerable
        const dx = this.x - pacman.x;
        const dy = this.y - pacman.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
        } else {
            this.direction = dy > 0 ? 'down' : 'up';
        }
        this.move();
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

    moveTowards(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
        } else {
            this.direction = dy > 0 ? 'down' : 'up';
        }
        this.move();
    }

    makeVulnerable() {
        this.isVulnerable = true;
        this.vulnerableTimer = 10000; // 10 seconds
        this.speed = 3; // Slower when vulnerable
    }

    reset() {
        this.x = this.startPosition.x;
        this.y = this.startPosition.y;
        this.isVulnerable = false;
        this.isEaten = false;
        this.speed = 4;
    }

    returnToHome() {
        const dx = this.startPosition.x - this.x;
        const dy = this.startPosition.y - this.y;
        
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
            this.reset();
            return;
        }
        
        this.moveTowards(this.startPosition.x, this.startPosition.y);
    }
}