// Energy Quest: Level 2 - Kitchen Handler
// Implements energy efficiency puzzle

class Level2Handler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initialized = false;
        this.levelCompleted = false;
        
        // Puzzle instance
        this.kitchenPuzzle = null;
    }

    initialize() {
        if (this.initialized) return;

        console.log('🍳 Level 2: Dapur - Initializing...');
        
        // Create puzzle instance
        this.kitchenPuzzle = new KitchenPuzzle();
        
        // Setup level
        this.setupLevel();
        this.showLevelIntroduction();
        
        this.initialized = true;
        console.log('✅ Level 2 initialized');
    }

    setupLevel() {
        // Update level info
        const levelData = LEVEL_DATA[2];
        window.uiManager.updateLevelInfo(2, levelData.title, levelData.objective);
        
        // Show power meter for this level
        window.uiManager.updatePowerMeter(0.5); // Start at 50%
        
        // Start kitchen puzzle
        this.startKitchenPuzzle();
    }

    update(deltaTime) {
        if (!this.initialized) return;

        // Check puzzle completion
        if (!this.levelCompleted && this.kitchenPuzzle && this.kitchenPuzzle.isPuzzleCompleted()) {
            this.completeLevel();
        }

        // Update power meter based on kitchen efficiency
        if (this.kitchenPuzzle) {
            const efficiency = this.kitchenPuzzle.getCurrentEfficiency();
            window.uiManager.updatePowerMeter(efficiency);
        }
    }

    showLevelIntroduction() {
        const introContent = `
            <h3>🍳 Selamat Datang di Dapur</h3>
            <p>Dapur ini penuh dengan peralatan listrik. Gunakanlah dengan bijak agar energi tidak terbuang!</p>
            
            <h4>🎯 Misi Level 2:</h4>
            <ul>
                <li>Kelola perangkat dapur secara efisien</li>
                <li>Jaga Power Meter tetap di zona HIJAU (≥70%)</li>
                <li>Pelajari strategi hemat energi</li>
                <li>Dapatkan Kunci Energi Kedua</li>
            </ul>
            
            <h4>📚 Yang akan dipelajari:</h4>
            <ul>
                <li>Efisiensi penggunaan energi dalam kehidupan sehari-hari</li>
                <li>Pemanfaatan cahaya alami untuk menghemat listrik</li>
                <li>Pengelolaan perangkat rumah tangga yang bijak</li>
                <li>Dampak kebiasaan kecil terhadap konsumsi energi</li>
            </ul>
            
            <h4>💡 Strategi Sukses:</h4>
            <ul>
                <li><strong>Pencahayaan:</strong> Buka jendela di siang hari, matikan lampu</li>
                <li><strong>Kulkas:</strong> Buka seperlunya, tutup dengan cepat</li>
                <li><strong>Peralatan:</strong> Nyalakan hanya saat dibutuhkan</li>
                <li><strong>Monitoring:</strong> Perhatikan Power Meter di kanan atas</li>
            </ul>
            
            <div class="level-goal">
                <h4>🎯 Target: Efisiensi ≥ 70% (ZONA HIJAU)</h4>
                <p>Capai dan pertahankan efisiensi tinggi untuk menyelesaikan level!</p>
            </div>
        `;

        window.uiManager.showEducationalPanel('Level 2: Dapur', introContent);
        
        // Play level intro narration
        window.audioManager.playNarration('LEVEL_2_INTRO');
    }

    startKitchenPuzzle() {
        console.log('🍳 Starting Kitchen Efficiency Puzzle...');
        
        // Activate kitchen puzzle
        if (this.kitchenPuzzle) {
            this.kitchenPuzzle.activate();
        }
    }

    completeLevel() {
        this.levelCompleted = true;
        
        console.log('🎉 Level 2 completed!');
        
        // Hide power meter
        window.uiManager.hidePowerMeter();
        
        // Deactivate kitchen puzzle
        if (this.kitchenPuzzle) {
            this.kitchenPuzzle.deactivate();
        }

        // Complete level in game engine
        if (this.gameEngine) {
            this.gameEngine.completeLevel(2);
        }

        // Show level completion
        const finalEfficiency = this.kitchenPuzzle ? this.kitchenPuzzle.getCurrentEfficiency() : 0.7;
        const efficiencyPercentage = Math.round(finalEfficiency * 100);
        
        window.uiManager.showToast(
            `Level 2 Selesai! Efisiensi akhir: ${efficiencyPercentage}% - Kamu telah menguasai efisiensi energi di dapur!`, 
            'success', 
            6000
        );

        // Show radio message
        setTimeout(() => {
            this.showRadioMessage();
        }, 3000);

        // Update game progress
        const progress = window.uiManager.loadGameProgress();
        progress.currentLevel = Math.max(progress.currentLevel, 3);
        window.uiManager.saveGameProgress(progress);

        // Show continue prompt
        setTimeout(() => {
            this.showContinuePrompt();
        }, 8000);
    }

    showRadioMessage() {
        const radioContent = `
            <div class="radio-transmission">
                <h3>📻 Transmisi Radio Misterius</h3>
                <div class="radio-static-effect">
                    <p><em>*kresek kresek*</em> 📻</p>
                </div>
                
                <div class="scientist-voice">
                    <h4>🔬 Suara Ilmuwan:</h4>
                    <p><em>"Efisiensi adalah kunci. Jangan boros, karena energi terbatas. 
                    Kamu telah memahami pentingnya menghemat energi. 
                    Sekarang, lanjutkan ke laboratoriumku untuk tantangan yang lebih kompleks."</em></p>
                </div>
                
                <div class="transmission-end">
                    <p><em>*transmisi berakhir*</em></p>
                    <p><strong>🚪 Pintu laboratorium terbuka!</strong></p>
                </div>
            </div>
        `;

        window.uiManager.showEducationalPanel('Pesan Radio', radioContent);
        
        // Play radio transmission sound
        window.audioManager.playNarration('SCIENTIST_MESSAGE');
    }

    showContinuePrompt() {
        const continueContent = `
            <div class="level-transition">
                <h3>🎓 Level 2: Dapur Selesai!</h3>
                
                <div class="level-summary">
                    <h4>📊 Ringkasan Pembelajaran:</h4>
                    <ul>
                        <li>✅ Efisiensi energi sangat penting dalam kehidupan sehari-hari</li>
                        <li>✅ Cahaya alami dapat menggantikan lampu di siang hari</li>
                        <li>✅ Kulkas yang dibuka terlalu lama membuang energi</li>
                        <li>✅ Peralatan listrik harus digunakan seperlunya</li>
                        <li>✅ Setiap tindakan kecil berkontribusi pada penghematan</li>
                    </ul>
                </div>
                
                <div class="performance-stats">
                    <h4>📈 Performa Kamu:</h4>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-value">${this.kitchenPuzzle ? Math.round(this.kitchenPuzzle.getCurrentEfficiency() * 100) : 70}%</div>
                            <div class="stat-label">Efisiensi Akhir</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${this.kitchenPuzzle ? Math.round(this.kitchenPuzzle.totalConsumption) : 200}W</div>
                            <div class="stat-label">Konsumsi Total</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">HEMAT</div>
                            <div class="stat-label">Rating</div>
                        </div>
                    </div>
                </div>
                
                <div class="next-level-preview">
                    <h4>🔬 Level Berikutnya: Laboratorium</h4>
                    <p>Siap untuk belajar perhitungan tagihan listrik yang lebih mendalam?</p>
                    <p>Di laboratorium, kamu akan menggunakan simulator canggih untuk menghitung dan mengoptimalkan penggunaan energi rumah!</p>
                </div>
                
                <div class="continue-section">
                    <button id="continue-to-lab" class="continue-level-btn">
                        🧪 Lanjut ke Laboratorium
                    </button>
                </div>
            </div>
        `;

        // Create continue prompt
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.style.display = 'flex';
            puzzleOverlay.innerHTML = `
                <div class="level-complete-container">
                    ${continueContent}
                </div>
            `;

            // Add continue prompt styles
            this.addContinuePromptStyles();
            
            // Setup continue interaction
            const continueBtn = document.getElementById('continue-to-lab');
            if (continueBtn) {
                continueBtn.addEventListener('click', () => {
                    this.proceedToNextLevel();
                });
            }
        }
    }

    addContinuePromptStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .level-complete-container {
                background: rgba(26, 26, 46, 0.98);
                border: 2px solid rgba(0, 255, 0, 0.5);
                border-radius: 15px;
                padding: 30px;
                max-width: 90%;
                max-height: 90%;
                overflow-y: auto;
                text-align: center;
            }

            .level-summary {
                background: rgba(0, 255, 0, 0.1);
                border: 1px solid rgba(0, 255, 0, 0.3);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }

            .level-summary h4 {
                color: #00ff00;
                margin-bottom: 15px;
                text-align: center;
            }

            .level-summary ul {
                margin-left: 20px;
            }

            .level-summary li {
                color: #cccccc;
                margin-bottom: 8px;
                line-height: 1.4;
            }

            .performance-stats {
                margin: 25px 0;
            }

            .performance-stats h4 {
                color: #00ffff;
                margin-bottom: 20px;
            }

            .stats-grid {
                display: flex;
                justify-content: space-around;
                gap: 20px;
                margin: 20px 0;
            }

            .stat-box {
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                padding: 15px;
                min-width: 100px;
            }

            .stat-value {
                font-size: 1.8rem;
                font-weight: bold;
                color: #00ffff;
                margin-bottom: 5px;
            }

            .stat-label {
                font-size: 0.9rem;
                color: #cccccc;
            }

            .next-level-preview {
                background: rgba(0, 0, 255, 0.1);
                border: 1px solid rgba(0, 100, 255, 0.3);
                border-radius: 10px;
                padding: 20px;
                margin: 25px 0;
            }

            .next-level-preview h4 {
                color: #0099ff;
                margin-bottom: 15px;
            }

            .next-level-preview p {
                color: #cccccc;
                line-height: 1.5;
                margin-bottom: 10px;
            }

            .continue-level-btn {
                background: linear-gradient(135deg, #0099ff, #0066cc);
                color: #ffffff;
                border: none;
                padding: 15px 40px;
                border-radius: 10px;
                font-size: 1.2rem;
                font-weight: bold;
                cursor: pointer;
                margin-top: 20px;
                transition: all 0.3s ease;
            }

            .continue-level-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(0, 150, 255, 0.3);
            }

            .radio-transmission {
                background: rgba(0, 0, 0, 0.4);
                border: 2px solid rgba(0, 255, 0, 0.3);
                border-radius: 15px;
                padding: 25px;
                margin: 20px 0;
            }

            .radio-static-effect {
                color: #888;
                font-style: italic;
                margin-bottom: 15px;
            }

            .scientist-voice {
                background: rgba(0, 255, 0, 0.1);
                border: 1px solid rgba(0, 255, 0, 0.2);
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
            }

            .scientist-voice h4 {
                color: #00ff00;
                margin-bottom: 10px;
            }

            .transmission-end {
                color: #888;
                font-style: italic;
                margin-top: 15px;
            }

            @media (max-width: 768px) {
                .stats-grid {
                    flex-direction: column;
                    align-items: center;
                }
                
                .stat-box {
                    width: 100%;
                    max-width: 200px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    startKitchenPuzzle() {
        console.log('🍳 Starting Kitchen Efficiency Puzzle...');
        
        // Activate kitchen puzzle
        if (this.kitchenPuzzle) {
            this.kitchenPuzzle.activate();
        }
    }

    completeLevel() {
        this.levelCompleted = true;
        
        console.log('🎉 Level 2 completed!');
        
        // Complete level in game engine
        if (this.gameEngine) {
            this.gameEngine.completeLevel(2);
        }

        // Update game progress
        const progress = window.uiManager.loadGameProgress();
        progress.currentLevel = Math.max(progress.currentLevel, 3);
        window.uiManager.saveGameProgress(progress);
    }

    proceedToNextLevel() {
        // Hide any open panels
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.style.display = 'none';
        }
        
        // Show transition message
        window.uiManager.showToast('🚶 Menuju laboratorium...', 'info', 2000);
        
        // Transition to Level 3
        setTimeout(() => {
            window.gameFSM.nextLevel();
        }, 2500);
    }

    // Debug methods
    debugCompleteLevel() {
        if (this.kitchenPuzzle) {
            this.kitchenPuzzle.isCompleted = true;
        }
        this.completeLevel();
    }

    debugSetEfficiency(efficiency) {
        if (this.kitchenPuzzle) {
            this.kitchenPuzzle.currentEfficiency = efficiency;
            this.kitchenPuzzle.updateEfficiencyDisplay();
        }
    }

    destroy() {
        if (this.kitchenPuzzle) {
            this.kitchenPuzzle.destroy();
        }
        
        // Hide power meter
        window.uiManager.hidePowerMeter();
        
        this.initialized = false;
        
        console.log('🗑️ Level 2 destroyed');
    }
}

// Export for global access
window.Level2Handler = Level2Handler;