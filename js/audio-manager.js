// Energy Quest: Audio Manager Implementation
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.music = new Map();
        this.currentMusic = null;
        this.musicVolume = GAME_CONSTANTS.DEFAULT_MUSIC_VOLUME;
        this.sfxVolume = GAME_CONSTANTS.DEFAULT_SFX_VOLUME;
        this.masterVolume = GAME_CONSTANTS.DEFAULT_MASTER_VOLUME;
        this.isMuted = false;
        this.isInitialized = false;
        
        // Audio elements
        this.backgroundMusicElement = document.getElementById('background-music');
        this.sfxElement = document.getElementById('sfx-audio');
        
        this.loadSettings();
        this.setupAudioElements();
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Create audio context (required for web audio)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context if suspended (required by browser policies)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.isInitialized = true;
            console.log('Audio Manager initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            // Fallback to HTML5 audio only
            this.isInitialized = true;
        }
    }

    setupAudioElements() {
        if (this.backgroundMusicElement) {
            this.backgroundMusicElement.volume = this.musicVolume * this.masterVolume;
            this.backgroundMusicElement.addEventListener('ended', () => {
                this.onMusicEnded();
            });
        }

        if (this.sfxElement) {
            this.sfxElement.volume = this.sfxVolume * this.masterVolume;
        }
    }

    // Load audio settings from localStorage
    loadSettings() {
        const keys = GAME_CONSTANTS.STORAGE_KEYS;
        this.masterVolume = parseFloat(localStorage.getItem(keys.MASTER_VOLUME)) || GAME_CONSTANTS.DEFAULT_MASTER_VOLUME;
        this.musicVolume = parseFloat(localStorage.getItem(keys.MUSIC_VOLUME)) || GAME_CONSTANTS.DEFAULT_MUSIC_VOLUME;
        this.sfxVolume = parseFloat(localStorage.getItem(keys.SFX_VOLUME)) || GAME_CONSTANTS.DEFAULT_SFX_VOLUME;
    }

    // Save audio settings to localStorage
    saveSettings() {
        const keys = GAME_CONSTANTS.STORAGE_KEYS;
        localStorage.setItem(keys.MASTER_VOLUME, this.masterVolume.toString());
        localStorage.setItem(keys.MUSIC_VOLUME, this.musicVolume.toString());
        localStorage.setItem(keys.SFX_VOLUME, this.sfxVolume.toString());
    }

    // Set master volume
    setMasterVolume(volume) {
        this.masterVolume = GAME_UTILS.clamp(volume, 0, 1);
        this.updateAllVolumes();
        this.saveSettings();
    }

    // Set music volume
    setMusicVolume(volume) {
        this.musicVolume = GAME_UTILS.clamp(volume, 0, 1);
        if (this.backgroundMusicElement) {
            this.backgroundMusicElement.volume = this.musicVolume * this.masterVolume;
        }
        this.saveSettings();
    }

    // Set SFX volume
    setSFXVolume(volume) {
        this.sfxVolume = GAME_UTILS.clamp(volume, 0, 1);
        if (this.sfxElement) {
            this.sfxElement.volume = this.sfxVolume * this.masterVolume;
        }
        this.saveSettings();
    }

    // Update all volume levels
    updateAllVolumes() {
        if (this.backgroundMusicElement) {
            this.backgroundMusicElement.volume = this.musicVolume * this.masterVolume;
        }
        if (this.sfxElement) {
            this.sfxElement.volume = this.sfxVolume * this.masterVolume;
        }
    }

    // Mute/unmute all audio
    setMuted(muted) {
        this.isMuted = muted;
        
        if (this.backgroundMusicElement) {
            this.backgroundMusicElement.muted = muted;
        }
        if (this.sfxElement) {
            this.sfxElement.muted = muted;
        }
    }

    // Play background music
    async playBackgroundMusic(musicKey, loop = true, fadeIn = false) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const musicFile = GAME_CONSTANTS.AUDIO.BACKGROUND_MUSIC[musicKey];
        if (!musicFile) {
            console.warn(`Music file not found: ${musicKey}`);
            return;
        }

        // Stop current music if playing
        if (this.currentMusic) {
            if (fadeIn) {
                await this.fadeOutCurrentMusic();
            } else {
                this.stopBackgroundMusic();
            }
        }

        if (this.backgroundMusicElement) {
            this.backgroundMusicElement.src = musicFile;
            this.backgroundMusicElement.loop = loop;
            this.backgroundMusicElement.volume = fadeIn ? 0 : (this.musicVolume * this.masterVolume);
            
            try {
                await this.backgroundMusicElement.play();
                this.currentMusic = musicKey;
                
                if (fadeIn) {
                    this.fadeInMusic();
                }
                
                console.log(`Playing background music: ${musicKey}`);
            } catch (error) {
                console.warn(`Failed to play background music: ${error}`);
            }
        }
    }

    // Stop background music
    stopBackgroundMusic(fadeOut = false) {
        if (this.backgroundMusicElement) {
            if (fadeOut) {
                this.fadeOutCurrentMusic();
            } else {
                this.backgroundMusicElement.pause();
                this.backgroundMusicElement.currentTime = 0;
            }
        }
        this.currentMusic = null;
    }

    // Fade in music
    fadeInMusic(duration = 2000) {
        if (!this.backgroundMusicElement) return;

        const targetVolume = this.musicVolume * this.masterVolume;
        const steps = 50;
        const stepDuration = duration / steps;
        const volumeStep = targetVolume / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            currentStep++;
            this.backgroundMusicElement.volume = Math.min(volumeStep * currentStep, targetVolume);
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
            }
        }, stepDuration);
    }

    // Fade out current music
    fadeOutCurrentMusic(duration = 1000) {
        return new Promise((resolve) => {
            if (!this.backgroundMusicElement) {
                resolve();
                return;
            }

            const startVolume = this.backgroundMusicElement.volume;
            const steps = 50;
            const stepDuration = duration / steps;
            const volumeStep = startVolume / steps;
            let currentStep = 0;

            const fadeInterval = setInterval(() => {
                currentStep++;
                this.backgroundMusicElement.volume = Math.max(startVolume - (volumeStep * currentStep), 0);
                
                if (currentStep >= steps) {
                    clearInterval(fadeInterval);
                    this.backgroundMusicElement.pause();
                    this.backgroundMusicElement.currentTime = 0;
                    resolve();
                }
            }, stepDuration);
        });
    }

    // Play sound effect
    async playSFX(sfxKey, volume = 1.0) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const sfxFile = GAME_CONSTANTS.AUDIO.SFX[sfxKey];
        if (!sfxFile) {
            console.warn(`SFX file not found: ${sfxKey}`);
            return;
        }

        if (this.sfxElement) {
            this.sfxElement.src = sfxFile;
            this.sfxElement.volume = (this.sfxVolume * this.masterVolume * volume);
            
            try {
                await this.sfxElement.play();
                console.log(`Playing SFX: ${sfxKey}`);
            } catch (error) {
                console.warn(`Failed to play SFX: ${error}`);
            }
        }
    }

    // Play multiple sound effects
    async playMultipleSFX(sfxKeys, delay = 100) {
        for (let i = 0; i < sfxKeys.length; i++) {
            await this.playSFX(sfxKeys[i]);
            if (i < sfxKeys.length - 1) {
                await this.delay(delay);
            }
        }
    }

    // Play narration (using background music element with different settings)
    async playNarration(narrationKey, onComplete = null) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const narrationFile = GAME_CONSTANTS.AUDIO.NARRATION[narrationKey];
        if (!narrationFile) {
            console.warn(`Narration file not found: ${narrationKey}`);
            return;
        }

        // Create temporary audio element for narration
        const narrationElement = new Audio(narrationFile);
        narrationElement.volume = this.masterVolume; // Full volume for narration
        
        if (onComplete) {
            narrationElement.addEventListener('ended', onComplete, { once: true });
        }

        try {
            await narrationElement.play();
            console.log(`Playing narration: ${narrationKey}`);
        } catch (error) {
            console.warn(`Failed to play narration: ${error}`);
        }
    }

    // Game-specific audio methods
    playMenuMusic() {
        this.playBackgroundMusic('THEME', true, true);
    }

    playLevelMusic(levelNumber) {
        const musicKeys = ['', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4'];
        const musicKey = musicKeys[levelNumber];
        if (musicKey) {
            this.playBackgroundMusic(musicKey, true, true);
        }
    }

    playOpeningMusic() {
        this.playBackgroundMusic('OPENING', false);
    }

    playEndingMusic() {
        this.playBackgroundMusic('ENDING', false);
    }

    // Common SFX shortcuts
    playClickSound() {
        this.playSFX('CLICK');
    }

    playSuccessSound() {
        this.playSFX('SUCCESS');
    }

    playErrorSound() {
        this.playSFX('ERROR');
    }

    playKeyCollectedSound() {
        this.playSFX('KEY_COLLECTED');
    }

    playElectricalBuzz() {
        this.playSFX('ELECTRICAL_BUZZ');
    }

    playSwitchOn() {
        this.playSFX('SWITCH_ON');
    }

    playSwitchOff() {
        this.playSFX('SWITCH_OFF');
    }

    playTVOn() {
        this.playSFX('TV_ON');
    }

    playApplianceOn() {
        this.playSFX('APPLIANCE_ON');
    }

    playCalculation() {
        this.playSFX('CALCULATION');
    }

    playQuizCorrect() {
        this.playSFX('QUIZ_CORRECT');
    }

    playQuizWrong() {
        this.playSFX('QUIZ_WRONG');
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onMusicEnded() {
        console.log('Background music ended');
        this.currentMusic = null;
    }

    // Preload audio files for better performance
    async preloadAudio() {
        const audioFiles = [
            ...Object.values(GAME_CONSTANTS.AUDIO.BACKGROUND_MUSIC),
            ...Object.values(GAME_CONSTANTS.AUDIO.SFX),
            ...Object.values(GAME_CONSTANTS.AUDIO.NARRATION)
        ];

        const preloadPromises = audioFiles.map(file => {
            return new Promise((resolve) => {
                const audio = new Audio();
                audio.addEventListener('canplaythrough', resolve, { once: true });
                audio.addEventListener('error', resolve, { once: true }); // Resolve even on error
                audio.src = file;
                audio.load();
            });
        });

        try {
            await Promise.all(preloadPromises);
            console.log('Audio preloading completed');
        } catch (error) {
            console.warn('Some audio files failed to preload:', error);
        }
    }

    // Get current audio status
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isMuted: this.isMuted,
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            currentMusic: this.currentMusic,
            musicPlaying: this.backgroundMusicElement && !this.backgroundMusicElement.paused,
            musicCurrentTime: this.backgroundMusicElement ? this.backgroundMusicElement.currentTime : 0,
            musicDuration: this.backgroundMusicElement ? this.backgroundMusicElement.duration : 0
        };
    }

    // Enable audio (required for user interaction)
    async enableAudio() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Resume audio context if suspended
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        console.log('Audio enabled by user interaction');
    }

    // Disable audio
    disableAudio() {
        this.stopBackgroundMusic();
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
        console.log('Audio disabled');
    }
}

// Create global audio manager instance
window.audioManager = new AudioManager();

// Auto-enable audio on first user interaction
let audioEnabled = false;
const enableAudioOnInteraction = async () => {
    if (!audioEnabled) {
        await window.audioManager.enableAudio();
        audioEnabled = true;
        
        // Remove listeners after first interaction
        document.removeEventListener('click', enableAudioOnInteraction);
        document.removeEventListener('touchstart', enableAudioOnInteraction);
        document.removeEventListener('keydown', enableAudioOnInteraction);
    }
};

document.addEventListener('click', enableAudioOnInteraction);
document.addEventListener('touchstart', enableAudioOnInteraction);
document.addEventListener('keydown', enableAudioOnInteraction);