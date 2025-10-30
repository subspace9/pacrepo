/**
 * Maze system for Pac-Man game
 */

class Maze {
    constructor() {
        this.tileSize = 20;
        this.width = 28;
        this.height = 31;
        
        // Tile types: 0 = empty, 1 = wall, 2 = pellet, 3 = power pellet, 4 = ghost house
        this.layout = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
            [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1,1],
            [0,0,0,0,0,0,2,0,0,0,1,4,4,4,4,4,4,1,0,0,0,2,0,0,0,0,0,0],
            [1,1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
            [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
            [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
            [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
            [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.pellets = new Set();
        this.powerPellets = new Set();
        this.initPellets();
    }

    initPellets() {
        this.pellets.clear();
        this.powerPellets.clear();
        
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const tile = this.layout[row][col];
                if (tile === 2) {
                    this.pellets.add(`${row},${col}`);
                } else if (tile === 3) {
                    this.powerPellets.add(`${row},${col}`);
                }
            }
        }
    }

    getTile(row, col) {
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
            return 1; // Wall outside bounds
        }
        return this.layout[row][col];
    }

    isWall(row, col) {
        return this.getTile(row, col) === 1;
    }

    isWalkable(row, col) {
        const tile = this.getTile(row, col);
        return tile !== 1;
    }

    hasPellet(row, col) {
        return this.pellets.has(`${row},${col}`);
    }

    hasPowerPellet(row, col) {
        return this.powerPellets.has(`${row},${col}`);
    }

    eatPellet(row, col) {
        const key = `${row},${col}`;
        if (this.pellets.has(key)) {
            this.pellets.delete(key);
            return 10; // Score for regular pellet
        }
        if (this.powerPellets.has(key)) {
            this.powerPellets.delete(key);
            return 50; // Score for power pellet
        }
        return 0;
    }

    allPelletsEaten() {
        return this.pellets.size === 0 && this.powerPellets.size === 0;
    }

    getRemainingPellets() {
        return this.pellets.size + this.powerPellets.size;
    }

    reset() {
        this.initPellets();
    }

    /**
     * Check if position collides with wall
     */
    checkWallCollision(x, y, size) {
        // Check four corners of the entity
        const halfSize = size / 2;
        const corners = [
            { x: x - halfSize, y: y - halfSize }, // Top-left
            { x: x + halfSize, y: y - halfSize }, // Top-right
            { x: x - halfSize, y: y + halfSize }, // Bottom-left
            { x: x + halfSize, y: y + halfSize }  // Bottom-right
        ];

        for (const corner of corners) {
            const col = Math.floor(corner.x / this.tileSize);
            const row = Math.floor(corner.y / this.tileSize);
            if (this.isWall(row, col)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get valid neighboring tiles
     */
    getNeighbors(row, col) {
        const neighbors = [];
        const directions = [
            { row: -1, col: 0, dir: 'up' },
            { row: 1, col: 0, dir: 'down' },
            { row: 0, col: -1, dir: 'left' },
            { row: 0, col: 1, dir: 'right' }
        ];

        for (const dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;
            if (this.isWalkable(newRow, newCol)) {
                neighbors.push({
                    row: newRow,
                    col: newCol,
                    direction: dir.dir
                });
            }
        }
        return neighbors;
    }

    /**
     * Draw maze
     */
    draw(ctx) {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const x = col * this.tileSize;
                const y = row * this.tileSize;
                const tile = this.layout[row][col];

                // Draw walls
                if (tile === 1) {
                    ctx.fillStyle = '#2121DE';
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    ctx.strokeStyle = '#4B4BFF';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, this.tileSize, this.tileSize);
                }
                // Draw pellets
                else if (this.hasPellet(row, col)) {
                    ctx.fillStyle = '#FFB897';
                    ctx.beginPath();
                    ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Draw power pellets
                else if (this.hasPowerPellet(row, col)) {
                    ctx.fillStyle = '#FFB897';
                    ctx.beginPath();
                    ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    /**
     * Get ghost house position
     */
    getGhostHousePosition() {
        return {
            x: 13.5 * this.tileSize,
            y: 14 * this.tileSize
        };
    }

    /**
     * Get starting position for Pac-Man
     */
    getPacmanStartPosition() {
        return {
            x: 13.5 * this.tileSize,
            y: 23 * this.tileSize
        };
    }
}
