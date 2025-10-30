/**
 * Utility functions for Pac-Man game
 */

/**
 * Asset loader for images and sounds
 */
class AssetLoader {
    constructor() {
        this.assets = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    /**
     * Load an image asset
     */
    async loadImage(name, url) {
        this.totalCount++;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.set(name, img);
                this.loadedCount++;
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    /**
     * Get a loaded asset
     */
    get(name) {
        return this.assets.get(name);
    }

    /**
     * Get loading progress
     */
    getProgress() {
        return this.totalCount === 0 ? 1 : this.loadedCount / this.totalCount;
    }
}

/**
 * Animation helper
 */
class AnimationHelper {
    constructor(frameCount, frameDelay) {
        this.frameCount = frameCount;
        this.frameDelay = frameDelay;
        this.currentFrame = 0;
        this.frameTimer = 0;
    }

    update(deltaTime) {
        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameDelay) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }
    }

    getCurrentFrame() {
        return this.currentFrame;
    }

    reset() {
        this.currentFrame = 0;
        this.frameTimer = 0;
    }
}

/**
 * Collision detection utilities
 */
class CollisionUtils {
    /**
     * Check circle collision
     */
    static circleCollision(obj1, obj2, radius1, radius2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (radius1 + radius2);
    }

    /**
     * Check rectangle collision
     */
    static rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
               x1 + w1 > x2 &&
               y1 < y2 + h2 &&
               y1 + h1 > y2;
    }

    /**
     * Check point in rectangle
     */
    static pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    /**
     * Get distance between two points
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

/**
 * Grid utilities for maze navigation
 */
class GridUtils {
    /**
     * Convert pixel coordinates to grid coordinates
     */
    static pixelToGrid(x, y, tileSize) {
        return {
            col: Math.floor(x / tileSize),
            row: Math.floor(y / tileSize)
        };
    }

    /**
     * Convert grid coordinates to pixel coordinates
     */
    static gridToPixel(row, col, tileSize) {
        return {
            x: col * tileSize + tileSize / 2,
            y: row * tileSize + tileSize / 2
        };
    }

    /**
     * Check if position is centered on tile
     */
    static isCentered(x, y, tileSize, threshold = 3) {
        const centerX = Math.floor(x / tileSize) * tileSize + tileSize / 2;
        const centerY = Math.floor(y / tileSize) * tileSize + tileSize / 2;
        return Math.abs(x - centerX) < threshold && Math.abs(y - centerY) < threshold;
    }
}

/**
 * Local storage helper for high scores
 */
class StorageHelper {
    static KEY_HIGH_SCORE = 'pacman_high_score';
    static KEY_SETTINGS = 'pacman_settings';

    static getHighScore() {
        return parseInt(localStorage.getItem(this.KEY_HIGH_SCORE) || '0', 10);
    }

    static setHighScore(score) {
        localStorage.setItem(this.KEY_HIGH_SCORE, score.toString());
    }

    static getSettings() {
        const settings = localStorage.getItem(this.KEY_SETTINGS);
        return settings ? JSON.parse(settings) : { volume: 0.5, soundEnabled: true };
    }

    static setSettings(settings) {
        localStorage.setItem(this.KEY_SETTINGS, JSON.stringify(settings));
    }
}

/**
 * FPS counter
 */
class FPSCounter {
    constructor() {
        this.fps = 60;
        this.frames = 0;
        this.lastTime = performance.now();
    }

    update() {
        this.frames++;
        const currentTime = performance.now();
        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
            this.frames = 0;
            this.lastTime = currentTime;
        }
    }

    getFPS() {
        return this.fps;
    }
}

/**
 * Direction utilities
 */
class DirectionUtils {
    static DIRECTIONS = {
        UP: { x: 0, y: -1, name: 'up' },
        DOWN: { x: 0, y: 1, name: 'down' },
        LEFT: { x: -1, y: 0, name: 'left' },
        RIGHT: { x: 1, y: 0, name: 'right' }
    };

    static getOpposite(direction) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        return opposites[direction];
    }

    static getVector(direction) {
        return Object.values(this.DIRECTIONS).find(d => d.name === direction);
    }
}
