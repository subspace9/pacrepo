/**
 * Sound System Implementation with 16-bit audio processing
 */
class SoundManager {
    constructor() {
        this.context = null;
        this.sounds = new Map();
        this.soundPool = new Map();
        this.isMuted = false;
        this.volume = 0.5;
        this.backgroundMusic = null;
        this.initialized = false;
    }

    /**
     * Initialize audio context (must be called after user interaction)
     */
    async init() {
        if (this.initialized) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            await this.loadAllSounds();
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
        }
    }

    /**
     * Load a sound file
     */
    async loadSound(name, url) {
        if (!this.context) return;
        
        try {
            // Try to load from URL, fall back to generated sound if not found
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
                this.sounds.set(name, audioBuffer);
            } catch (fetchError) {
                // Generate fallback sound
                console.warn(`Could not load ${name}, generating fallback sound`);
                this.sounds.set(name, this.generateSound(name));
            }
        } catch (error) {
            console.error(`Error loading sound ${name}:`, error);
        }
    }

    /**
     * Generate synthetic 16-bit sounds as fallbacks
     */
    generateSound(type) {
        const sampleRate = this.context.sampleRate;
        let duration, frequency, waveType;

        switch (type) {
            case 'chomp':
                duration = 0.1;
                frequency = 400;
                waveType = 'square';
                break;
            case 'death':
                duration = 1.5;
                frequency = 200;
                waveType = 'sawtooth';
                break;
            case 'ghost':
                duration = 0.5;
                frequency = 150;
                waveType = 'sine';
                break;
            case 'powerup':
                duration = 0.3;
                frequency = 600;
                waveType = 'square';
                break;
            case 'eatghost':
                duration = 0.5;
                frequency = 800;
                waveType = 'sine';
                break;
            default:
                duration = 0.2;
                frequency = 440;
                waveType = 'sine';
        }

        const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            let sample = 0;

            switch (waveType) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * frequency * t);
                    break;
                case 'square':
                    sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
                    break;
                case 'sawtooth':
                    sample = 2 * ((t * frequency) % 1) - 1;
                    break;
            }

            // Apply envelope for smoother sound
            const envelope = Math.exp(-3 * t / duration);
            data[i] = sample * envelope;
        }

        return buffer;
    }

    /**
     * Play a sound with optional looping
     */
    play(name, loop = false) {
        if (!this.initialized || this.isMuted || !this.sounds.has(name)) {
            return null;
        }

        const source = this.context.createBufferSource();
        source.buffer = this.sounds.get(name);
        
        // Create gain node for volume control
        const gainNode = this.context.createGain();
        gainNode.gain.value = this.volume;

        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(this.context.destination);

        source.loop = loop;
        source.start(0);
        
        return source;
    }

    /**
     * Play sound from pool (for frequently played sounds)
     */
    playPooled(name) {
        if (!this.initialized || this.isMuted || !this.sounds.has(name)) {
            return;
        }

        // Use sound pooling to prevent too many simultaneous sounds
        const now = Date.now();
        const lastPlayed = this.soundPool.get(name) || 0;
        
        // Minimum time between same sound (prevents audio glitches)
        if (now - lastPlayed < 50) {
            return;
        }

        this.soundPool.set(name, now);
        this.play(name, false);
    }

    /**
     * Play background music
     */
    playBackgroundMusic() {
        if (this.backgroundMusic) {
            this.stopBackgroundMusic();
        }
        this.backgroundMusic = this.play('background', true);
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.stop();
            } catch (e) {
                // Ignore if already stopped
            }
            this.backgroundMusic = null;
        }
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        }
        return this.isMuted;
    }

    /**
     * Load all game sounds
     */
    async loadAllSounds() {
        const soundFiles = {
            'chomp': 'assets/sounds/chomp.wav',
            'death': 'assets/sounds/death.wav',
            'ghost': 'assets/sounds/ghost.wav',
            'powerup': 'assets/sounds/powerup.wav',
            'eatghost': 'assets/sounds/eatghost.wav',
            'background': 'assets/sounds/background.wav'
        };

        const loadPromises = Object.entries(soundFiles).map(([name, url]) =>
            this.loadSound(name, url)
        );

        await Promise.all(loadPromises);
    }

    /**
     * Check if sound system is ready
     */
    isReady() {
        return this.initialized && this.sounds.size > 0;
    }
}

