class PacMan {
    constructor(x, y) {
        this.x = x; // Current x position
        this.y = y; // Current y position
        this.direction = 'right'; // Current direction
        this.speed = 5; // Movement speed
        this.isAnimating = false; // Animation state
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
        this.animate();
    }

    animate() {
        this.isAnimating = true;
        // Animation logic (e.g., change sprite or position)
        // This is a placeholder for actual animation code
        console.log(`Animating Pac-Man at (${this.x}, ${this.y}) facing ${this.direction}`);
    }

    detectCollision(other) {
        // Simple collision detection logic (e.g., bounding box)
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }

    setDirection(newDirection) {
        this.direction = newDirection;
    }
}