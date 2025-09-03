// Energy Quest: Main Game Engine
class GameEngine {
    constructor() {
        this.isInitialized = false;
        this.currentLevel = null;
        this.gameProgress = null;
        this.loadingProgress = 0;
        this.openingAnimationRunning = false;
        
        // Canvas contexts
        this.openingCanvas = null;
        this.openingCtx = null;
        this.gameCanvas = null;
        this.gameCtx = null;
        
        // Game state
        this.puzzles = new Map();
        this.levelHandlers = new Map();
        
        // Animation frame
        this.animationFrameId = null;
        this.lastFrameTime = 0;
        
        console.log('Game Engine initialized');
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize canvases
            this.initializeCanvases();
            
            // Load game progress
            this.gameProgress = window.uiManager.loadGameProgress();
            
            // Initialize audio
            await this.initializeAudio();
            
            // Setup level handlers
            this.setupLevelHandlers();
            
            // Setup puzzle systems
            this.setupPuzzles();
            
            // Start game loop
            this.startGameLoop();
            
            // Complete initialization
            this.isInitialized = true;
            
            // Transition to appropriate screen
            await this.completeLoading();
            
        } catch (error) {
            console.error('Game Engine initialization failed:', error);
            this.showErrorMessage('Gagal memuat game. Silakan refresh halaman.');
        }
    }

    showLoadingScreen() {
        window.gameFSM.changeState(GAME_CONSTANTS.GAME_STATES.LOADING);
        this.updateLoadingProgress(0, 'Memuat game...');
    }

    initializeCanvases() {
        // Opening animation canvas
        this.openingCanvas = document.getElementById('opening-canvas');
        if (this.openingCanvas) {
            this.openingCtx = GAME_UTILS.getCanvasContext(this.openingCanvas);
        }

        // Main game canvas
        this.gameCanvas = document.getElementById('game-canvas');
        if (this.gameCanvas) {
            this.gameCtx = GAME_UTILS.getCanvasContext(this.gameCanvas);
        }

        this.updateLoadingProgress(20, 'Canvas diinisialisasi...');
    }

    async initializeAudio() {
        await window.audioManager.initialize();
        
        // Preload critical audio files
        await window.audioManager.preloadAudio();
        
        this.updateLoadingProgress(50, 'Audio dimuat...');
    }

    setupLevelHandlers() {
        // Level handlers akan diimplementasikan sebagai objek terpisah
        this.levelHandlers.set(1, new Level1Handler(this));
        this.levelHandlers.set(2, new Level2Handler(this));
        this.levelHandlers.set(3, new Level3Handler(this));
        this.levelHandlers.set(4, new Level4Handler(this));
        
        this.updateLoadingProgress(70, 'Level dimuat...');
    }

    setupPuzzles() {
        // Puzzle systems
        this.puzzles.set('cable', new CablePuzzle());
        this.puzzles.set('tv', new TVPuzzle());
        this.puzzles.set('kitchen', new KitchenPuzzle());
        this.puzzles.set('simulator', new LabSimulator());
        this.puzzles.set('quiz', new QuizSystem());
        
        this.updateLoadingProgress(90, 'Puzzle dimuat...');
    }

    updateLoadingProgress(progress, message) {
        this.loadingProgress = progress;
        
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (loadingText) {
            loadingText.textContent = message;
        }
    }

    async completeLoading() {
        this.updateLoadingProgress(100, 'Game siap!');
        
        // Wait a bit to show completion
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if this is first launch
        const isFirstLaunch = !localStorage.getItem(GAME_CONSTANTS.STORAGE_KEYS.FIRST_LAUNCH);
        
        if (isFirstLaunch) {
            localStorage.setItem(GAME_CONSTANTS.STORAGE_KEYS.FIRST_LAUNCH, 'true');
            window.gameFSM.changeState(GAME_CONSTANTS.GAME_STATES.OPENING);
        } else {
            window.gameFSM.changeState(GAME_CONSTANTS.GAME_STATES.MAIN_MENU);
        }
    }

    // Opening Animation
    startOpeningAnimation() {
        if (this.openingAnimationRunning) return;
        
        this.openingAnimationRunning = true;
        window.audioManager.playOpeningMusic();
        
        this.playOpeningSequence();
    }

    async playOpeningSequence() {
        const script = OPENING_SCRIPT;
        let currentSceneIndex = 0;
        const startTime = Date.now();

        const animationLoop = () => {
            const elapsed = Date.now() - startTime;
            
            // Check if we should move to next scene
            while (currentSceneIndex < script.length && elapsed >= script[currentSceneIndex].time) {
                this.playOpeningScene(script[currentSceneIndex]);
                currentSceneIndex++;
            }

            // Continue animation or finish
            if (currentSceneIndex < script.length) {
                requestAnimationFrame(animationLoop);
            } else {
                // Animation complete
                setTimeout(() => {
                    this.completeOpeningAnimation();
                }, 1000);
            }
        };

        animationLoop();
    }

    playOpeningScene(scene) {
        // Update subtitles
        const subtitles = document.getElementById('subtitles');
        if (subtitles) {
            subtitles.textContent = scene.subtitle;
            subtitles.style.opacity = '1';
        }

        // Play narration
        if (scene.narration) {
            window.audioManager.playNarration(scene.visual, () => {
                if (subtitles) subtitles.style.opacity = '0.7';
            });
        }

        // Draw visual scene
        this.drawOpeningVisual(scene.visual);
    }

    drawOpeningVisual(visualType) {
        if (!this.openingCtx) return;

        const ctx = this.openingCtx;
        const canvas = this.openingCanvas;
        
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        switch (visualType) {
            case 'night_sky_news':
                this.drawNightSkyScene(ctx, canvas);
                break;
            case 'mysterious_house':
                this.drawMysteriousHouseScene(ctx, canvas);
                break;
            case 'player_intro':
                this.drawPlayerIntroScene(ctx, canvas);
                break;
            case 'game_title':
                this.drawGameTitleScene(ctx, canvas);
                break;
        }
    }

    drawNightSkyScene(ctx, canvas) {
        // Dark night sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // House silhouette
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(canvas.width * 0.3, canvas.height * 0.4, canvas.width * 0.4, canvas.height * 0.4);
        
        // TV glow from window
        ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
        ctx.fillRect(canvas.width * 0.45, canvas.height * 0.5, canvas.width * 0.1, canvas.height * 0.15);

        // Text: "BREAKING NEWS"
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BREAKING NEWS', canvas.width / 2, canvas.height * 0.8);
    }

    drawMysteriousHouseScene(ctx, canvas) {
        // Dark background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // House outline
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.6, canvas.height * 0.5);

        // Flickering lights effect
        const flicker = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 0, ${flicker * 0.3})`;
        ctx.fillRect(canvas.width * 0.35, canvas.height * 0.4, canvas.width * 0.1, canvas.height * 0.1);
        ctx.fillRect(canvas.width * 0.55, canvas.height * 0.4, canvas.width * 0.1, canvas.height * 0.1);

        // Electrical sparks
        for (let i = 0; i < 5; i++) {
            const x = canvas.width * (0.3 + Math.random() * 0.4);
            const y = canvas.height * (0.3 + Math.random() * 0.4);
            ctx.fillStyle = `rgba(0, 255, 255, ${Math.random()})`;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    drawPlayerIntroScene(ctx, canvas) {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Player silhouette
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(canvas.width * 0.4, canvas.height * 0.3, canvas.width * 0.2, canvas.height * 0.5);
        
        // Player head
        ctx.beginPath();
        ctx.arc(canvas.width * 0.5, canvas.height * 0.25, canvas.width * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Gate opening effect
        ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.fillRect(canvas.width * 0.7, canvas.height * 0.2, canvas.width * 0.25, canvas.height * 0.6);
    }

    drawGameTitleScene(ctx, canvas) {
        // Electric background
        const time = Date.now() * 0.005;
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width / 2
        );
        gradient.addColorStop(0, `rgba(0, 255, 255, ${0.1 + Math.sin(time) * 0.05})`);
        gradient.addColorStop(1, '#0a0a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Game title
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillText('ENERGY QUEST', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Misteri Hemat Listrik', canvas.width / 2, canvas.height / 2 + 20);
        ctx.shadowBlur = 0;
    }

    completeOpeningAnimation() {
        this.openingAnimationRunning = false;
        window.gameFSM.changeState(GAME_CONSTANTS.GAME_STATES.MAIN_MENU);
    }

    // Main Menu
    updateMainMenu() {
        window.audioManager.playMenuMusic();
        window.uiManager.updateContinueButton();
        window.uiManager.updateEnergyKeysDisplay();
    }

    // Level Management
    startLevel(levelNumber) {
        this.currentLevel = levelNumber;
        
        const levelData = LEVEL_DATA[levelNumber];
        if (!levelData) {
            console.error(`Level ${levelNumber} data not found`);
            return;
        }

        // Update UI
        window.uiManager.updateLevelInfo(levelNumber, levelData.title, levelData.objective);
        
        // Play level music
        window.audioManager.playLevelMusic(levelNumber);
        
        // Initialize level handler
        const handler = this.levelHandlers.get(levelNumber);
        if (handler) {
            handler.initialize();
        }

        // Show appropriate power meter for kitchen level
        if (levelNumber === 2) {
            window.uiManager.updatePowerMeter(0.5); // Start at 50%
        } else {
            window.uiManager.hidePowerMeter();
        }

        console.log(`Level ${levelNumber} started: ${levelData.title}`);
    }

    updateLevel(levelNumber, deltaTime) {
        const handler = this.levelHandlers.get(levelNumber);
        if (handler) {
            handler.update(deltaTime);
        }
    }

    completeLevel(levelNumber) {
        const levelData = LEVEL_DATA[levelNumber];
        if (!levelData) return;

        // Award energy key
        window.uiManager.collectEnergyKey(levelData.energyKeyReward);
        
        // Show completion message
        window.uiManager.showToast(levelData.completionMessage, 'success', 5000);
        
        // Show educational summary
        setTimeout(() => {
            this.showEducationalSummary(levelNumber);
        }, 2000);

        // Update progress
        const progress = window.uiManager.loadGameProgress();
        progress.currentLevel = Math.max(progress.currentLevel, levelNumber + 1);
        window.uiManager.saveGameProgress(progress);

        console.log(`Level ${levelNumber} completed`);
    }

    showEducationalSummary(levelNumber) {
        const levelData = LEVEL_DATA[levelNumber];
        const content = `
            <h3>Level ${levelNumber} Selesai!</h3>
            <h4>Yang telah dipelajari:</h4>
            <ul>
                ${levelData.educationalTopics.map(topic => `<li>${topic}</li>`).join('')}
            </ul>
            <p><strong>Pesan:</strong> ${levelData.completionMessage}</p>
        `;
        
        window.uiManager.showEducationalPanel(`Ringkasan ${levelData.title}`, content);
    }

    // Game Loop
    startGameLoop() {
        const gameLoop = (currentTime) => {
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;

            // Update FSM
            window.gameFSM.update(deltaTime);

            // Update current level
            if (this.currentLevel) {
                this.updateLevel(this.currentLevel, deltaTime);
            }

            // Continue loop
            this.animationFrameId = requestAnimationFrame(gameLoop);
        };

        this.animationFrameId = requestAnimationFrame(gameLoop);
    }

    stopGameLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    // Ending sequence
    startEndingSequence() {
        window.audioManager.playEndingMusic();
        this.showGameStatistics();
    }

    showGameStatistics() {
        const progress = window.uiManager.loadGameProgress();
        const collectedKeys = progress.energyKeys ? progress.energyKeys.filter(key => key).length : 0;
        
        const stats = `
            <div class="stat-item">
                <span class="stat-label">Level Diselesaikan:</span>
                <span class="stat-value">${progress.currentLevel - 1}/4</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Kunci Energi Dikumpulkan:</span>
                <span class="stat-value">${collectedKeys}/4</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Status:</span>
                <span class="stat-value">${progress.gameCompleted ? 'SELESAI' : 'DALAM PROGRESS'}</span>
            </div>
            <div class="achievement">
                <h4>🏆 LENCANA PENELITI MUDA ENERGI 🏆</h4>
                <p>Selamat! Kamu telah menguasai efisiensi energi listrik!</p>
            </div>
        `;

        const statsElement = document.getElementById('ending-stats');
        if (statsElement) {
            statsElement.innerHTML = stats;
        }
    }

    // Error handling
    showErrorMessage(message) {
        window.uiManager.showToast(message, 'error', 10000);
    }

    // Cleanup
    destroy() {
        this.stopGameLoop();
        
        // Clear timeouts and intervals
        this.puzzles.forEach(puzzle => {
            if (puzzle.destroy) puzzle.destroy();
        });
        
        this.levelHandlers.forEach(handler => {
            if (handler.destroy) handler.destroy();
        });

        console.log('Game Engine destroyed');
    }
}

// Placeholder level handlers (akan diimplementasikan di file terpisah)
class Level1Handler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        console.log('Level 1 (Living Room) initialized');
        this.initialized = true;
    }

    update(deltaTime) {
        // Level 1 update logic
    }

    destroy() {
        this.initialized = false;
    }
}

class Level2Handler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        console.log('Level 2 (Kitchen) initialized');
        this.initialized = true;
    }

    update(deltaTime) {
        // Level 2 update logic
    }

    destroy() {
        this.initialized = false;
    }
}

class Level3Handler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        console.log('Level 3 (Laboratory) initialized');
        this.initialized = true;
    }

    update(deltaTime) {
        // Level 3 update logic
    }

    destroy() {
        this.initialized = false;
    }
}

class Level4Handler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        console.log('Level 4 (Basement) initialized');
        this.initialized = true;
    }

    update(deltaTime) {
        // Level 4 update logic
    }

    destroy() {
        this.initialized = false;
    }
}

// Placeholder puzzle classes (akan diimplementasikan di file terpisah)
class CablePuzzle {
    constructor() {
        this.completed = false;
    }
}

class TVPuzzle {
    constructor() {
        this.completed = false;
    }
}

class KitchenPuzzle {
    constructor() {
        this.completed = false;
    }
}

class LabSimulator {
    constructor() {
        this.completed = false;
    }
}

class QuizSystem {
    constructor() {
        this.completed = false;
    }
}

// Create global game engine instance
window.gameEngine = new GameEngine();