/**
 * Main Game Engine for Pac-Man
 * 60 FPS game loop with state management
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.state = 'menu'; // menu, playing, paused, gameover, levelcomplete
        this.score = 0;
        this.highScore = StorageHelper.getHighScore();
        this.lives = 3;
        this.level = 1;
        this.ghostEatenMultiplier = 1;
        
        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        
        // Game objects
        this.maze = null;
        this.pacman = null;
        this.ghosts = [];
        
        // Managers
        this.soundManager = new SoundManager();
        this.fpsCounter = new FPSCounter();
        
        // Input
        this.keys = {};
        this.lastDirection = null;
        
        // Mode timers
        this.scatterTimer = 0;
        this.scatterDuration = 7000; // 7 seconds
        this.chaseDuration = 20000; // 20 seconds
        this.inScatterMode = true;
        
        // State transition timers
        this.deathTimer = 0;
        this.deathDuration = 2000; // 2 seconds
        this.levelCompleteTimer = 0;
        this.levelCompleteDuration = 2000; // 2 seconds;
        
        this.init();
    }

    async init() {
        // Set canvas size
        this.canvas.width = 560;
        this.canvas.height = 620;
        
        // Initialize sound
        await this.soundManager.init();
        
        // Setup input handlers
        this.setupInput();
        
        // Initialize game objects
        this.initGameObjects();
        
        // Show menu
        this.showMenu();
    }

    initGameObjects() {
        // Create maze
        this.maze = new Maze();
        
        // Create Pac-Man
        const pacPos = this.maze.getPacmanStartPosition();
        this.pacman = new PacMan(pacPos.x, pacPos.y);
        
        // Create ghosts
        const ghostHouse = this.maze.getGhostHousePosition();
        this.ghosts = [
            new Ghost('blinky', ghostHouse.x, ghostHouse.y - 60, '#FF0000'),
            new Ghost('pinky', ghostHouse.x - 40, ghostHouse.y, '#FFB8FF'),
            new Ghost('inky', ghostHouse.x, ghostHouse.y, '#00FFFF'),
            new Ghost('clyde', ghostHouse.x + 40, ghostHouse.y, '#FFB851')
        ];
    }

    setupInput() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Handle direction changes
            if (this.state === 'playing') {
                switch (e.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                        this.pacman.setDirection('up');
                        e.preventDefault();
                        break;
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                        this.pacman.setDirection('down');
                        e.preventDefault();
                        break;
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        this.pacman.setDirection('left');
                        e.preventDefault();
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        this.pacman.setDirection('right');
                        e.preventDefault();
                        break;
                    case 'p':
                    case 'P':
                    case 'Escape':
                        this.togglePause();
                        break;
                }
            } else if (this.state === 'menu' || this.state === 'gameover') {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.startGame();
                }
            } else if (this.state === 'paused') {
                if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                    this.togglePause();
                }
            }
            
            // Mute toggle
            if (e.key === 'm' || e.key === 'M') {
                this.soundManager.toggleMute();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Touch/click controls for mobile
        this.setupTouchControls();
    }

    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;

            // Start game on touch if in menu
            if (this.state === 'menu' || this.state === 'gameover') {
                this.startGame();
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.state !== 'playing') return;

            const touch = e.changedTouches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            const threshold = 30;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > threshold) {
                    this.pacman.setDirection(dx > 0 ? 'right' : 'left');
                }
            } else {
                if (Math.abs(dy) > threshold) {
                    this.pacman.setDirection(dy > 0 ? 'down' : 'up');
                }
            }
        });

        // Click to start
        this.canvas.addEventListener('click', () => {
            if (this.state === 'menu' || this.state === 'gameover') {
                this.startGame();
            }
        });
    }

    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.resetLevel();
        this.soundManager.playBackgroundMusic();
    }

    resetLevel() {
        this.maze.reset();
        
        const pacPos = this.maze.getPacmanStartPosition();
        this.pacman.reset();
        this.pacman.x = pacPos.x;
        this.pacman.y = pacPos.y;
        
        this.ghosts.forEach(ghost => ghost.reset());
        
        this.scatterTimer = 0;
        this.inScatterMode = true;
        this.ghostEatenMultiplier = 1;
    }

    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.soundManager.stopBackgroundMusic();
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.soundManager.playBackgroundMusic();
        }
    }

    update(currentTime) {
        // Calculate delta time
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap delta time to prevent large jumps
        this.deltaTime = Math.min(this.deltaTime, 100);

        if (this.state === 'playing') {
            this.updateGame();
        } else if (this.state === 'dying') {
            this.updateDeathState();
        } else if (this.state === 'levelcomplete') {
            this.updateLevelCompleteState();
        }

        this.fpsCounter.update();
    }

    updateDeathState() {
        this.deathTimer += this.deltaTime;
        
        if (this.deathTimer >= this.deathDuration) {
            this.deathTimer = 0;
            this.lives--;
            
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.state = 'playing';
                this.resetLevel();
            }
        }
    }

    updateLevelCompleteState() {
        this.levelCompleteTimer += this.deltaTime;
        
        if (this.levelCompleteTimer >= this.levelCompleteDuration) {
            this.levelCompleteTimer = 0;
            this.state = 'playing';
            this.resetLevel();
        }
    }

    updateGame() {
        // Update ghost behavior mode (scatter vs chase)
        this.updateGhostMode();
        
        // Update Pac-Man
        this.pacman.update(this.deltaTime, this.maze);
        
        // Check pellet collection
        this.checkPelletCollection();
        
        // Update ghosts
        this.ghosts.forEach(ghost => {
            ghost.update(this.deltaTime, this.pacman, this.maze);
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Check win condition
        if (this.maze.allPelletsEaten()) {
            this.levelComplete();
        }
    }

    updateGhostMode() {
        this.scatterTimer += this.deltaTime;
        
        const cycleDuration = this.scatterDuration + this.chaseDuration;
        const timeInCycle = this.scatterTimer % cycleDuration;
        
        const shouldBeScatter = timeInCycle < this.scatterDuration;
        
        if (shouldBeScatter !== this.inScatterMode) {
            this.inScatterMode = shouldBeScatter;
            this.ghosts.forEach(ghost => ghost.setScatterMode(this.inScatterMode));
        }
    }

    checkPelletCollection() {
        const gridPos = this.pacman.getGridPosition(this.maze.tileSize);
        const scoreGained = this.maze.eatPellet(gridPos.row, gridPos.col);
        
        if (scoreGained > 0) {
            this.score += scoreGained;
            
            if (scoreGained === 10) {
                // Regular pellet
                this.soundManager.playPooled('chomp');
            } else if (scoreGained === 50) {
                // Power pellet
                this.soundManager.play('powerup');
                this.activatePowerMode();
            }
            
            // Update high score
            if (this.score > this.highScore) {
                this.highScore = this.score;
                StorageHelper.setHighScore(this.highScore);
            }
        }
    }

    activatePowerMode() {
        this.ghostEatenMultiplier = 1;
        this.ghosts.forEach(ghost => {
            if (!ghost.isEaten) {
                ghost.makeVulnerable(8000); // 8 seconds
            }
        });
    }

    checkCollisions() {
        if (this.pacman.isDead) return;
        
        for (const ghost of this.ghosts) {
            if (ghost.isEaten) continue;
            
            const dx = this.pacman.x - ghost.x;
            const dy = this.pacman.y - ghost.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < (this.pacman.size + ghost.size) / 2) {
                if (ghost.isVulnerable) {
                    // Eat ghost
                    this.eatGhost(ghost);
                } else {
                    // Pac-Man dies
                    this.pacmanDeath();
                    break;
                }
            }
        }
    }

    eatGhost(ghost) {
        ghost.eat();
        const points = 200 * this.ghostEatenMultiplier;
        this.score += points;
        this.ghostEatenMultiplier *= 2;
        this.soundManager.play('eatghost');
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            StorageHelper.setHighScore(this.highScore);
        }
    }

    pacmanDeath() {
        this.state = 'dying';
        this.deathTimer = 0;
        this.pacman.die();
        this.soundManager.play('death');
        this.soundManager.stopBackgroundMusic();
    }

    levelComplete() {
        this.state = 'levelcomplete';
        this.levelCompleteTimer = 0;
        this.level++;
    }

    gameOver() {
        this.state = 'gameover';
        this.soundManager.stopBackgroundMusic();
    }

    showMenu() {
        this.state = 'menu';
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.state === 'menu') {
            this.drawMenu();
        } else if (this.state === 'gameover') {
            this.drawGameOver();
        } else {
            this.drawGame();
        }

        // Draw FPS (optional, for debugging)
        // this.drawFPS();
    }

    drawGame() {
        // Draw maze
        this.maze.draw(this.ctx);
        
        // Draw ghosts
        this.ghosts.forEach(ghost => ghost.draw(this.ctx));
        
        // Draw Pac-Man
        this.pacman.draw(this.ctx);
        
        // Draw HUD
        this.drawHUD();
        
        // Draw pause overlay if paused
        if (this.state === 'paused') {
            this.drawPauseOverlay();
        }
        
        // Draw level complete overlay
        if (this.state === 'levelcomplete') {
            this.drawLevelCompleteOverlay();
        }
        
        // Continue drawing during death animation
        if (this.state === 'dying') {
            // Game continues to render normally during death
        }
    }

    drawHUD() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px Arial';
        
        // Score
        this.ctx.fillText(`Score: ${this.score}`, 10, this.canvas.height - 30);
        
        // High Score
        this.ctx.fillText(`High: ${this.highScore}`, 200, this.canvas.height - 30);
        
        // Level
        this.ctx.fillText(`Level: ${this.level}`, 380, this.canvas.height - 30);
        
        // Lives
        for (let i = 0; i < this.lives; i++) {
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.beginPath();
            this.ctx.arc(480 + i * 25, this.canvas.height - 25, 8, 0.2 * Math.PI, 1.8 * Math.PI);
            this.ctx.lineTo(480 + i * 25, this.canvas.height - 25);
            this.ctx.fill();
        }
    }

    drawMenu() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAC-MAN', this.canvas.width / 2, 200);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press ENTER or Click to Start', this.canvas.width / 2, 300);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Controls:', this.canvas.width / 2, 360);
        this.ctx.fillText('Arrow Keys or WASD to Move', this.canvas.width / 2, 390);
        this.ctx.fillText('P or ESC to Pause', this.canvas.width / 2, 420);
        this.ctx.fillText('M to Mute', this.canvas.width / 2, 450);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, 520);
        
        this.ctx.textAlign = 'left';
    }

    drawGameOver() {
        // Draw final game state
        this.drawGame();
        
        // Overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        if (this.score >= this.highScore) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillText('NEW HIGH SCORE!', this.canvas.width / 2, this.canvas.height / 2 + 60);
        }
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press ENTER to Play Again', this.canvas.width / 2, this.canvas.height / 2 + 120);
        
        this.ctx.textAlign = 'left';
    }

    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press P or ESC to Resume', this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        this.ctx.textAlign = 'left';
    }

    drawLevelCompleteOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Starting Level ${this.level}...`, this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        this.ctx.textAlign = 'left';
    }

    drawFPS() {
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`FPS: ${this.fpsCounter.getFPS()}`, 10, 20);
    }

    gameLoop(currentTime) {
        this.update(currentTime);
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
});
