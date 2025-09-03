// Energy Quest: UI Manager Implementation
class UIManager {
    constructor() {
        this.currentScreen = null;
        this.toastQueue = [];
        this.isToastShowing = false;
        this.typewriterTimeouts = [];
        
        this.setupEventListeners();
        this.initializeUI();
    }

    initializeUI() {
        // Initialize energy key display
        this.updateEnergyKeysDisplay();
        
        // Setup volume sliders
        this.setupVolumeControls();
        
        // Setup settings
        this.loadSettings();
        
        console.log('UI Manager initialized');
    }

    setupEventListeners() {
        // Main menu buttons
        const startGameBtn = document.getElementById('start-game-btn');
        const continueGameBtn = document.getElementById('continue-game-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const aboutBtn = document.getElementById('about-btn');

        if (startGameBtn) startGameBtn.addEventListener('click', () => this.startNewGame());
        if (continueGameBtn) continueGameBtn.addEventListener('click', () => this.continueGame());
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.openSettings());
        if (aboutBtn) aboutBtn.addEventListener('click', () => this.openAbout());

        // Game controls
        const pauseBtn = document.getElementById('pause-btn');
        const menuBtn = document.getElementById('menu-btn');

        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseGame());
        if (menuBtn) menuBtn.addEventListener('click', () => this.goToMainMenu());

        // Settings controls
        const closeSettings = document.getElementById('close-settings');
        const closeAbout = document.getElementById('close-about');

        if (closeSettings) closeSettings.addEventListener('click', () => this.closeSettings());
        if (closeAbout) closeAbout.addEventListener('click', () => this.closeAbout());

        // Educational panel
        const closeEduPanel = document.getElementById('close-edu-panel');
        if (closeEduPanel) closeEduPanel.addEventListener('click', () => this.closeEducationalPanel());

        // Ending screen buttons
        const playAgainBtn = document.getElementById('play-again-btn');
        const backToMenuBtn = document.getElementById('back-to-menu-btn');

        if (playAgainBtn) playAgainBtn.addEventListener('click', () => this.playAgain());
        if (backToMenuBtn) backToMenuBtn.addEventListener('click', () => this.goToMainMenu());

        // Touch/click feedback
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                this.playButtonClickFeedback(e.target);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Prevent context menu on mobile
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Screen management
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    // Game flow methods
    startNewGame() {
        window.audioManager.playClickSound();
        window.gameFSM.startGame();
        this.resetGameProgress();
    }

    continueGame() {
        window.audioManager.playClickSound();
        const savedLevel = this.loadGameProgress();
        if (savedLevel > 1) {
            window.gameFSM.changeState(`level_${savedLevel}`);
        } else {
            window.gameFSM.startGame();
        }
    }

    pauseGame() {
        window.audioManager.playClickSound();
        // Implement pause functionality
        this.showToast('Game paused', 'info');
    }

    goToMainMenu() {
        window.audioManager.playClickSound();
        window.gameFSM.goToMainMenu();
        this.saveGameProgress();
    }

    playAgain() {
        window.audioManager.playClickSound();
        this.resetGameProgress();
        window.gameFSM.restartGame();
    }

    openSettings() {
        window.audioManager.playClickSound();
        window.gameFSM.goToSettings();
    }

    closeSettings() {
        window.audioManager.playClickSound();
        window.gameFSM.goToMainMenu();
        this.saveSettings();
    }

    openAbout() {
        window.audioManager.playClickSound();
        window.gameFSM.goToAbout();
    }

    closeAbout() {
        window.audioManager.playClickSound();
        window.gameFSM.goToMainMenu();
    }

    // Level UI updates
    updateLevelInfo(levelNumber, title, objective) {
        const levelTitle = document.getElementById('level-title');
        const levelObjective = document.getElementById('level-objective');

        if (levelTitle) levelTitle.textContent = title;
        if (levelObjective) levelObjective.textContent = objective;

        // Update energy keys display
        this.updateEnergyKeysDisplay();
    }

    // Energy keys management
    updateEnergyKeysDisplay() {
        const gameProgress = this.loadGameProgress();
        const collectedKeys = gameProgress.energyKeys || [];

        // Update main menu keys
        document.querySelectorAll('.key-slot').forEach((slot, index) => {
            if (collectedKeys[index]) {
                slot.classList.add('collected');
            } else {
                slot.classList.remove('collected');
            }
        });

        // Update HUD keys
        document.querySelectorAll('.key-icon').forEach((icon, index) => {
            if (collectedKeys[index]) {
                icon.classList.add('collected');
            } else {
                icon.classList.remove('collected');
            }
        });
    }

    collectEnergyKey(keyIndex) {
        const gameProgress = this.loadGameProgress();
        if (!gameProgress.energyKeys) gameProgress.energyKeys = [false, false, false, false];
        
        if (!gameProgress.energyKeys[keyIndex]) {
            gameProgress.energyKeys[keyIndex] = true;
            this.saveGameProgress(gameProgress);
            this.updateEnergyKeysDisplay();
            
            // Show collection animation
            this.animateKeyCollection(keyIndex);
            
            // Play sound and show feedback
            window.audioManager.playKeyCollectedSound();
            this.showToast(`Kunci Energi ${keyIndex + 1} dikumpulkan!`, 'success');
        }
    }

    animateKeyCollection(keyIndex) {
        const keyElements = document.querySelectorAll(`[data-key="${keyIndex}"]`);
        keyElements.forEach(element => {
            element.style.animation = 'key-glow 1s ease-in-out';
            setTimeout(() => {
                element.style.animation = '';
            }, 1000);
        });
    }

    // Power meter (for kitchen level)
    updatePowerMeter(efficiency) {
        const powerMeter = document.getElementById('power-meter');
        const meterFill = document.getElementById('meter-fill');
        const meterStatus = document.getElementById('meter-status');

        if (!powerMeter || !meterFill || !meterStatus) return;

        powerMeter.style.display = 'block';
        
        // Update meter fill
        const percentage = Math.max(0, Math.min(100, efficiency * 100));
        meterFill.style.width = `${percentage}%`;
        
        // Update color based on efficiency
        let color, status;
        if (percentage >= 70) {
            color = '#44ff44';
            status = 'HEMAT';
        } else if (percentage >= 40) {
            color = '#ffff44';
            status = 'SEDANG';
        } else {
            color = '#ff4444';
            status = 'BOROS';
        }
        
        meterFill.style.background = color;
        meterStatus.textContent = status;
        meterStatus.style.color = color;
    }

    hidePowerMeter() {
        const powerMeter = document.getElementById('power-meter');
        if (powerMeter) {
            powerMeter.style.display = 'none';
        }
    }

    // Toast notifications
    showToast(message, type = 'info', duration = GAME_CONSTANTS.TOAST_DISPLAY_TIME) {
        this.toastQueue.push({ message, type, duration });
        
        if (!this.isToastShowing) {
            this.processToastQueue();
        }
    }

    processToastQueue() {
        if (this.toastQueue.length === 0) {
            this.isToastShowing = false;
            return;
        }

        this.isToastShowing = true;
        const toast = this.toastQueue.shift();
        
        const toastElement = document.getElementById('feedback-toast');
        const toastIcon = document.getElementById('toast-icon');
        const toastMessage = document.getElementById('toast-message');

        if (!toastElement || !toastIcon || !toastMessage) return;

        // Set toast content
        toastMessage.textContent = toast.message;
        
        // Set icon based on type
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        toastIcon.textContent = icons[toast.type] || icons.info;

        // Set toast class
        toastElement.className = `toast ${toast.type} show`;

        // Auto-hide after duration
        setTimeout(() => {
            toastElement.classList.remove('show');
            setTimeout(() => {
                this.processToastQueue();
            }, 300); // Wait for hide animation
        }, toast.duration);
    }

    // Educational panel
    showEducationalPanel(title, content) {
        const panel = document.getElementById('educational-panel');
        const titleElement = document.getElementById('edu-title');
        const contentElement = document.getElementById('edu-content');

        if (!panel || !titleElement || !contentElement) return;

        titleElement.textContent = title;
        
        // Clear previous content
        contentElement.innerHTML = '';
        
        // Add content with typewriter effect
        this.typewriterEffect(contentElement, content, 30);
        
        panel.style.display = 'flex';
    }

    closeEducationalPanel() {
        const panel = document.getElementById('educational-panel');
        if (panel) {
            panel.style.display = 'none';
        }
        
        // Clear any ongoing typewriter effects
        this.clearTypewriterEffects();
    }

    // Typewriter effect
    typewriterEffect(element, text, speed = 50) {
        element.textContent = '';
        let index = 0;
        
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(typeInterval);
            }
        }, speed);
        
        this.typewriterTimeouts.push(typeInterval);
    }

    clearTypewriterEffects() {
        this.typewriterTimeouts.forEach(timeout => clearInterval(timeout));
        this.typewriterTimeouts = [];
    }

    // Volume controls
    setupVolumeControls() {
        const masterVolumeSlider = document.getElementById('master-volume');
        const musicVolumeSlider = document.getElementById('music-volume');
        const sfxVolumeSlider = document.getElementById('sfx-volume');

        if (masterVolumeSlider) {
            masterVolumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                window.audioManager.setMasterVolume(volume);
                this.updateVolumeDisplay('master-volume-value', volume);
            });
        }

        if (musicVolumeSlider) {
            musicVolumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                window.audioManager.setMusicVolume(volume);
                this.updateVolumeDisplay('music-volume-value', volume);
            });
        }

        if (sfxVolumeSlider) {
            sfxVolumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                window.audioManager.setSFXVolume(volume);
                this.updateVolumeDisplay('sfx-volume-value', volume);
                
                // Play test sound
                window.audioManager.playClickSound();
            });
        }

        // Initialize volume displays
        this.updateAllVolumeDisplays();
    }

    updateVolumeDisplay(elementId, volume) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = `${Math.round(volume * 100)}%`;
        }
    }

    updateAllVolumeDisplays() {
        const audioStatus = window.audioManager.getStatus();
        this.updateVolumeDisplay('master-volume-value', audioStatus.masterVolume);
        this.updateVolumeDisplay('music-volume-value', audioStatus.musicVolume);
        this.updateVolumeDisplay('sfx-volume-value', audioStatus.sfxVolume);
    }

    // Button click feedback
    playButtonClickFeedback(button) {
        // Visual feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);

        // Audio feedback
        window.audioManager.playClickSound();
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        switch (e.code) {
            case 'Escape':
                if (this.currentScreen === 'game-screen') {
                    this.pauseGame();
                } else if (this.currentScreen === 'settings-screen') {
                    this.closeSettings();
                } else if (this.currentScreen === 'about-screen') {
                    this.closeAbout();
                }
                break;
            
            case 'Space':
                if (this.currentScreen === 'main-menu-screen') {
                    this.startNewGame();
                }
                break;
                
            case 'KeyM':
                if (e.ctrlKey) {
                    window.audioManager.setMuted(!window.audioManager.isMuted);
                }
                break;
        }
    }

    // Game progress management
    saveGameProgress(progress = null) {
        const gameProgress = progress || {
            currentLevel: 1,
            energyKeys: [false, false, false, false],
            gameCompleted: false,
            lastSaved: new Date().toISOString()
        };

        localStorage.setItem('energyQuestProgress', JSON.stringify(gameProgress));
    }

    loadGameProgress() {
        try {
            const saved = localStorage.getItem('energyQuestProgress');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load game progress:', error);
        }

        // Return default progress
        return {
            currentLevel: 1,
            energyKeys: [false, false, false, false],
            gameCompleted: false
        };
    }

    resetGameProgress() {
        const defaultProgress = {
            currentLevel: 1,
            energyKeys: [false, false, false, false],
            gameCompleted: false
        };
        
        this.saveGameProgress(defaultProgress);
        this.updateEnergyKeysDisplay();
        this.showToast('Progress direset', 'info');
    }

    // Settings management
    saveSettings() {
        const settings = {
            subtitlesEnabled: document.getElementById('subtitles-enabled')?.checked || true,
            tutorialEnabled: document.getElementById('tutorial-enabled')?.checked || true
        };

        localStorage.setItem('energyQuestSettings', JSON.stringify(settings));
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('energyQuestSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                const subtitlesCheckbox = document.getElementById('subtitles-enabled');
                const tutorialCheckbox = document.getElementById('tutorial-enabled');

                if (subtitlesCheckbox) subtitlesCheckbox.checked = settings.subtitlesEnabled !== false;
                if (tutorialCheckbox) tutorialCheckbox.checked = settings.tutorialEnabled !== false;
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    // Update continue button state
    updateContinueButton() {
        const continueBtn = document.getElementById('continue-game-btn');
        if (continueBtn) {
            const progress = this.loadGameProgress();
            const hasProgress = progress.currentLevel > 1 || progress.energyKeys.some(key => key);
            
            continueBtn.disabled = !hasProgress;
            continueBtn.style.opacity = hasProgress ? '1' : '0.5';
        }
    }

    // Mobile-specific UI adjustments
    adjustForMobile() {
        const isMobile = GAME_UTILS.isMobile();
        
        if (isMobile) {
            // Adjust button sizes
            document.querySelectorAll('.menu-btn').forEach(btn => {
                btn.style.minHeight = '44px';
                btn.style.fontSize = '16px';
            });

            // Adjust text sizes
            document.querySelectorAll('p, span').forEach(text => {
                const currentSize = window.getComputedStyle(text).fontSize;
                const newSize = Math.max(14, parseInt(currentSize));
                text.style.fontSize = `${newSize}px`;
            });
        }
    }

    // Initialize UI after DOM is loaded
    init() {
        this.adjustForMobile();
        this.updateContinueButton();
        this.updateEnergyKeysDisplay();
    }
}

// Create global UI manager instance
window.uiManager = new UIManager();

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.uiManager.init();
    });
} else {
    window.uiManager.init();
}