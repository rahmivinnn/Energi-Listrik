// Energy Quest: Level 1 - Living Room Handler
// Implements cable puzzle and TV puzzle

class Level1Handler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initialized = false;
        this.cablePuzzleCompleted = false;
        this.tvPuzzleCompleted = false;
        this.levelCompleted = false;
        
        // Puzzle instances
        this.cablePuzzle = null;
        this.tvPuzzle = null;
    }

    initialize() {
        if (this.initialized) return;

        console.log('🏠 Level 1: Ruang Tamu - Initializing...');
        
        // Create puzzle instances
        this.cablePuzzle = new CablePuzzle();
        this.tvPuzzle = new TVPuzzle();
        
        // Setup level
        this.setupLevel();
        this.showLevelIntroduction();
        
        this.initialized = true;
        console.log('✅ Level 1 initialized');
    }

    setupLevel() {
        // Update level info
        const levelData = LEVEL_DATA[1];
        window.uiManager.updateLevelInfo(1, levelData.title, levelData.objective);
        
        // Start with cable puzzle
        this.startCablePuzzle();
    }

    update(deltaTime) {
        if (!this.initialized) return;

        // Check puzzle completion status
        this.checkPuzzleProgress();
        
        // Handle level completion
        if (!this.levelCompleted && this.cablePuzzleCompleted && this.tvPuzzleCompleted) {
            this.completeLevel();
        }
    }

    showLevelIntroduction() {
        const introContent = `
            <h3>🏠 Selamat Datang di Ruang Tamu</h3>
            <p>Kamu memasuki rumah yang gelap gulita. Hanya diterangi cahaya dari luar.</p>
            
            <h4>🎯 Misi Level 1:</h4>
            <ul>
                <li>Perbaiki rangkaian listrik yang berantakan</li>
                <li>Nyalakan TV dan cari petunjuk ilmuwan</li>
                <li>Dapatkan Kunci Energi Pertama</li>
            </ul>
            
            <h4>📚 Yang akan dipelajari:</h4>
            <ul>
                <li>Rangkaian listrik dasar (tertutup vs terbuka)</li>
                <li>Fungsi komponen listrik (baterai, saklar, lampu)</li>
                <li>Urutan pengoperasian perangkat elektronik</li>
            </ul>
            
            <p><strong>💡 Tips:</strong> Untuk melanjutkan eksplorasi, kamu harus menyelesaikan kedua puzzle di ruang tamu ini.</p>
        `;

        window.uiManager.showEducationalPanel('Level 1: Ruang Tamu', introContent);
        
        // Play level intro narration
        window.audioManager.playNarration('LEVEL_1_INTRO');
    }

    startCablePuzzle() {
        console.log('🔌 Starting Cable Puzzle...');
        
        // Show puzzle selection or directly start
        this.showPuzzleSelection();
    }

    showPuzzleSelection() {
        const selectionContent = `
            <div class="puzzle-selection">
                <h3>🎯 Pilih Puzzle untuk Diselesaikan</h3>
                <p>Di ruang tamu ini ada 2 puzzle yang harus diselesaikan:</p>
                
                <div class="puzzle-options">
                    <div class="puzzle-option">
                        <div class="puzzle-icon">🔌</div>
                        <h4>Puzzle Kabel Listrik</h4>
                        <p>Hubungkan komponen untuk membuat rangkaian tertutup</p>
                        <div class="puzzle-status" id="cable-puzzle-status">
                            ${this.cablePuzzleCompleted ? '✅ SELESAI' : '⏳ BELUM SELESAI'}
                        </div>
                        <button id="start-cable-puzzle" class="puzzle-select-btn" 
                                ${this.cablePuzzleCompleted ? 'disabled' : ''}>
                            ${this.cablePuzzleCompleted ? 'Sudah Selesai' : 'Mulai Puzzle'}
                        </button>
                    </div>
                    
                    <div class="puzzle-option">
                        <div class="puzzle-icon">📺</div>
                        <h4>Puzzle TV Tua</h4>
                        <p>Ikuti urutan yang benar untuk menyalakan TV</p>
                        <div class="puzzle-status" id="tv-puzzle-status">
                            ${this.tvPuzzleCompleted ? '✅ SELESAI' : this.cablePuzzleCompleted ? '🔓 TERSEDIA' : '🔒 TERKUNCI'}
                        </div>
                        <button id="start-tv-puzzle" class="puzzle-select-btn" 
                                ${this.tvPuzzleCompleted || !this.cablePuzzleCompleted ? 'disabled' : ''}>
                            ${this.tvPuzzleCompleted ? 'Sudah Selesai' : this.cablePuzzleCompleted ? 'Mulai Puzzle' : 'Selesaikan Puzzle Kabel Dulu'}
                        </button>
                    </div>
                </div>
                
                ${this.cablePuzzleCompleted && this.tvPuzzleCompleted ? `
                    <div class="level-complete-section">
                        <h4>🎉 Kedua Puzzle Selesai!</h4>
                        <p>Kamu siap melanjutkan ke Level 2: Dapur</p>
                        <button id="continue-to-level2" class="continue-btn">🚪 Lanjut ke Dapur</button>
                    </div>
                ` : ''}
            </div>
        `;

        // Create temporary selection UI
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.style.display = 'flex';
            puzzleOverlay.innerHTML = `
                <div class="puzzle-selection-container">
                    ${selectionContent}
                </div>
            `;

            // Add selection styles
            this.addPuzzleSelectionStyles();
            
            // Setup selection interactions
            this.setupPuzzleSelectionInteractions();
        }
    }

    addPuzzleSelectionStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .puzzle-selection-container {
                background: rgba(26, 26, 46, 0.95);
                border: 2px solid rgba(0, 255, 255, 0.5);
                border-radius: 15px;
                padding: 30px;
                max-width: 90%;
                max-height: 90%;
                text-align: center;
            }

            .puzzle-options {
                display: flex;
                gap: 30px;
                justify-content: center;
                margin: 30px 0;
            }

            .puzzle-option {
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(0, 255, 255, 0.3);
                border-radius: 15px;
                padding: 25px;
                min-width: 250px;
                transition: all 0.3s ease;
            }

            .puzzle-option:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(0, 255, 255, 0.6);
                transform: translateY(-5px);
            }

            .puzzle-icon {
                font-size: 3rem;
                margin-bottom: 15px;
            }

            .puzzle-option h4 {
                color: #00ffff;
                margin-bottom: 15px;
            }

            .puzzle-option p {
                color: #cccccc;
                margin-bottom: 20px;
                line-height: 1.4;
            }

            .puzzle-status {
                font-weight: bold;
                margin-bottom: 20px;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 0.9rem;
            }

            .puzzle-select-btn {
                background: linear-gradient(135deg, #00ffff, #0099cc);
                color: #000;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                width: 100%;
            }

            .puzzle-select-btn:hover:not(:disabled) {
                transform: translateY(-2px);
            }

            .puzzle-select-btn:disabled {
                background: #666;
                color: #999;
                cursor: not-allowed;
            }

            .level-complete-section {
                background: rgba(0, 255, 0, 0.1);
                border: 2px solid rgba(0, 255, 0, 0.3);
                border-radius: 15px;
                padding: 25px;
                margin-top: 30px;
            }

            .level-complete-section h4 {
                color: #00ff00;
                margin-bottom: 15px;
            }

            .continue-btn {
                background: linear-gradient(135deg, #00ff00, #00cc00);
                color: #000;
                border: none;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                margin-top: 20px;
                transition: all 0.3s ease;
            }

            .continue-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(0, 255, 0, 0.3);
            }

            @media (max-width: 768px) {
                .puzzle-options {
                    flex-direction: column;
                    align-items: center;
                }
                
                .puzzle-option {
                    min-width: 200px;
                    width: 100%;
                    max-width: 300px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    setupPuzzleSelectionInteractions() {
        const startCableBtn = document.getElementById('start-cable-puzzle');
        const startTVBtn = document.getElementById('start-tv-puzzle');
        const continueBtn = document.getElementById('continue-to-level2');

        if (startCableBtn && !this.cablePuzzleCompleted) {
            startCableBtn.addEventListener('click', () => {
                this.hidePuzzleSelection();
                this.cablePuzzle.activate();
            });
        }

        if (startTVBtn && this.cablePuzzleCompleted && !this.tvPuzzleCompleted) {
            startTVBtn.addEventListener('click', () => {
                this.hidePuzzleSelection();
                this.tvPuzzle.activate();
            });
        }

        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.proceedToNextLevel();
            });
        }
    }

    hidePuzzleSelection() {
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.style.display = 'none';
        }
    }

    checkPuzzleProgress() {
        // Check cable puzzle completion
        if (!this.cablePuzzleCompleted && this.cablePuzzle && this.cablePuzzle.isPuzzleCompleted()) {
            this.onCablePuzzleCompleted();
        }

        // Check TV puzzle completion
        if (!this.tvPuzzleCompleted && this.tvPuzzle && this.tvPuzzle.isPuzzleCompleted()) {
            this.onTVPuzzleCompleted();
        }
    }

    onCablePuzzleCompleted() {
        this.cablePuzzleCompleted = true;
        
        console.log('🔌 Cable puzzle completed!');
        
        // Deactivate cable puzzle
        if (this.cablePuzzle) {
            this.cablePuzzle.deactivate();
        }

        // Show success message
        window.uiManager.showToast('Puzzle Kabel selesai! Lampu menyala dan ruangan terang.', 'success', 5000);
        
        // Show room lighting effect
        this.simulateRoomLighting();
        
        // Show puzzle selection again
        setTimeout(() => {
            this.showPuzzleSelection();
        }, 3000);
    }

    onTVPuzzleCompleted() {
        this.tvPuzzleCompleted = true;
        
        console.log('📺 TV puzzle completed!');
        
        // Deactivate TV puzzle
        if (this.tvPuzzle) {
            this.tvPuzzle.deactivate();
        }

        // Show success message
        window.uiManager.showToast('Puzzle TV selesai! Rekaman ilmuwan ditemukan.', 'success', 5000);
        
        // Show door opening effect
        this.simulateDoorOpening();
        
        // Show puzzle selection again (now with continue option)
        setTimeout(() => {
            this.showPuzzleSelection();
        }, 3000);
    }

    simulateRoomLighting() {
        // Simulate room getting brighter
        const gameCanvas = document.getElementById('game-canvas');
        if (gameCanvas) {
            gameCanvas.style.background = 'linear-gradient(135deg, #3c4e60, #4a5e7a)';
            gameCanvas.style.transition = 'background 2s ease';
            
            setTimeout(() => {
                gameCanvas.style.background = 'linear-gradient(135deg, #2c3e50, #34495e)';
            }, 5000);
        }

        // Play lighting sound effect
        window.audioManager.playSFX('SWITCH_ON');
        
        // Show lighting message
        window.uiManager.showToast('💡 Lampu menyala! Ruang tamu kini terang.', 'success');
    }

    simulateDoorOpening() {
        // Play door opening sound
        window.audioManager.playSFX('SWITCH_ON'); // Using available sound
        
        // Show door opening message
        window.uiManager.showToast('🚪 Pintu ke dapur terbuka! Kamu bisa melanjutkan.', 'success');
    }

    completeLevel() {
        this.levelCompleted = true;
        
        console.log('🎉 Level 1 completed!');
        
        // Complete level in game engine
        if (this.gameEngine) {
            this.gameEngine.completeLevel(1);
        }

        // Show level completion
        window.uiManager.showToast('Level 1 Selesai! Kamu telah memahami dasar-dasar rangkaian listrik.', 'success', 6000);

        // Update game progress
        const progress = window.uiManager.loadGameProgress();
        progress.currentLevel = Math.max(progress.currentLevel, 2);
        window.uiManager.saveGameProgress(progress);
    }

    proceedToNextLevel() {
        this.hidePuzzleSelection();
        
        // Show transition message
        window.uiManager.showToast('🚶 Berjalan ke dapur...', 'info', 2000);
        
        // Transition to Level 2
        setTimeout(() => {
            window.gameFSM.nextLevel();
        }, 2500);
    }

    // Debug methods
    debugCompleteCablePuzzle() {
        if (this.cablePuzzle) {
            this.cablePuzzle.isCompleted = true;
            this.onCablePuzzleCompleted();
        }
    }

    debugCompleteTVPuzzle() {
        if (this.tvPuzzle) {
            this.tvPuzzle.isCompleted = true;
            this.onTVPuzzleCompleted();
        }
    }

    debugCompleteLevel() {
        this.cablePuzzleCompleted = true;
        this.tvPuzzleCompleted = true;
        this.completeLevel();
    }

    destroy() {
        if (this.cablePuzzle) {
            this.cablePuzzle.destroy();
        }
        if (this.tvPuzzle) {
            this.tvPuzzle.destroy();
        }
        
        this.hidePuzzleSelection();
        this.initialized = false;
        
        console.log('🗑️ Level 1 destroyed');
    }
}

// Export for global access
window.Level1Handler = Level1Handler;