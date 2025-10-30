// Sound System Implementation
class SoundManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = new Map();
        this.isMuted = false;
        this.volume = 1.0;
    }

    async loadSound(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            this.sounds.set(name, audioBuffer);
        } catch (error) {
            console.error(`Error loading sound ${name}:`, error);
        }
    }

    play(name, loop = false) {
        if (this.isMuted || !this.sounds.has(name)) return null;

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

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
    }

    // Initialize all game sounds
    async initializeSounds() {
        const soundFiles = {
            'chomp': 'sounds/chomp.wav',
            'death': 'sounds/death.wav',
            'ghost': 'sounds/ghost.wav',
            'powerup': 'sounds/powerup.wav',
            'victory': 'sounds/victory.wav',
            'background': 'sounds/background.wav'
        };

        for (const [name, url] of Object.entries(soundFiles)) {
            await this.loadSound(name, url);
        }
    }
}

// Create global sound manager instance
const soundManager = new SoundManager();
