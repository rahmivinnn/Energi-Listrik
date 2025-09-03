// Energy Quest: Level 3 - Laboratory Handler
// Implements electricity bill simulator

class Level3Handler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initialized = false;
        this.levelCompleted = false;
        this.simulatorActivated = false;
        
        // Puzzle instance
        this.labSimulator = null;
    }

    initialize() {
        if (this.initialized) return;

        console.log('🧪 Level 3: Laboratorium - Initializing...');
        
        // Create puzzle instance
        this.labSimulator = new LabSimulator();
        
        // Setup level
        this.setupLevel();
        this.showLevelIntroduction();
        
        this.initialized = true;
        console.log('✅ Level 3 initialized');
    }

    setupLevel() {
        // Update level info
        const levelData = LEVEL_DATA[3];
        window.uiManager.updateLevelInfo(3, levelData.title, levelData.objective);
        
        // Hide power meter (not needed for this level)
        window.uiManager.hidePowerMeter();
        
        // Show simulator activation prompt
        this.showSimulatorActivation();
    }

    update(deltaTime) {
        if (!this.initialized) return;

        // Check simulator completion
        if (!this.levelCompleted && this.labSimulator && this.labSimulator.isPuzzleCompleted()) {
            this.completeLevel();
        }
    }

    showLevelIntroduction() {
        const introContent = `
            <h3>🧪 Selamat Datang di Laboratorium</h3>
            <p>Kamu memasuki laboratorium ilmuwan yang penuh dengan peralatan canggih!</p>
            
            <h4>🎯 Misi Level 3:</h4>
            <ul>
                <li>Aktifkan simulator tagihan listrik</li>
                <li>Atur konsumsi energi rumah agar tagihan ≤ Rp 300,000/bulan</li>
                <li>Pelajari formula perhitungan energi: E = (P × t) / 1000</li>
                <li>Temukan blueprint alat rahasia ilmuwan</li>
                <li>Dapatkan Kunci Energi Ketiga</li>
            </ul>
            
            <h4>📚 Yang akan dipelajari:</h4>
            <ul>
                <li>Formula perhitungan konsumsi energi listrik</li>
                <li>Cara menghitung tagihan PLN berdasarkan kWh</li>
                <li>Strategi optimasi penggunaan listrik rumah tangga</li>
                <li>Pengaruh daya dan waktu terhadap biaya listrik</li>
            </ul>
            
            <h4>🧮 Formula Penting:</h4>
            <div class="formula-highlight">
                <p><strong>E = (P × t) / 1000</strong></p>
                <ul>
                    <li><strong>E</strong> = Energi konsumsi (kWh)</li>
                    <li><strong>P</strong> = Daya perangkat (Watt)</li>
                    <li><strong>t</strong> = Waktu pemakaian (jam)</li>
                </ul>
                <p><strong>Biaya = E × Rp 1,467.28</strong> (tarif PLN 2024)</p>
            </div>
            
            <div class="lab-objective">
                <h4>🎯 Target: Tagihan ≤ Rp 300,000/bulan</h4>
                <p>Gunakan simulator untuk mencapai target efisiensi!</p>
            </div>
        `;

        window.uiManager.showEducationalPanel('Level 3: Laboratorium', introContent);
        
        // Play level intro narration
        window.audioManager.playNarration('LEVEL_3_INTRO');
    }

    showSimulatorActivation() {
        setTimeout(() => {
            const activationContent = `
                <div class="simulator-activation">
                    <h3>🖥️ Simulator Tagihan Listrik</h3>
                    <p>Di depanmu terdapat komputer canggih dengan simulator tagihan listrik!</p>
                    
                    <div class="computer-visual">
                        <div class="computer-screen">
                            <div class="screen-glow">💻</div>
                            <div class="boot-sequence">
                                <p>ENERGY EFFICIENCY ANALYZER v2.1</p>
                                <p>Sistem siap digunakan...</p>
                                <p class="blinking-cursor">█</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="activation-info">
                        <h4>Fitur Simulator:</h4>
                        <ul>
                            <li>🏠 10+ perangkat rumah tangga realistis</li>
                            <li>🧮 Perhitungan real-time dengan formula E = (P × t) / 1000</li>
                            <li>💰 Simulasi tagihan berdasarkan tarif PLN 2024</li>
                            <li>📊 Analisis efisiensi dan optimasi</li>
                            <li>💡 Saran penghematan yang praktis</li>
                        </ul>
                    </div>
                    
                    <div class="activation-controls">
                        <button id="activate-simulator" class="activation-btn">
                            ⚡ Aktifkan Simulator
                        </button>
                    </div>
                </div>
            `;

            const puzzleOverlay = document.getElementById('puzzle-overlay');
            if (puzzleOverlay) {
                puzzleOverlay.style.display = 'flex';
                puzzleOverlay.innerHTML = `
                    <div class="simulator-activation-container">
                        ${activationContent}
                    </div>
                `;

                this.addActivationStyles();
                this.setupActivationInteraction();
            }
        }, 2000);
    }

    addActivationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .simulator-activation-container {
                background: rgba(26, 26, 46, 0.95);
                border: 2px solid rgba(0, 255, 255, 0.5);
                border-radius: 15px;
                padding: 30px;
                max-width: 90%;
                max-height: 90%;
                text-align: center;
                overflow-y: auto;
            }

            .computer-visual {
                margin: 30px 0;
            }

            .computer-screen {
                background: #000;
                border: 3px solid #333;
                border-radius: 10px;
                padding: 20px;
                margin: 20px auto;
                max-width: 400px;
                font-family: monospace;
                position: relative;
            }

            .screen-glow {
                font-size: 3rem;
                margin-bottom: 15px;
                filter: drop-shadow(0 0 15px #00ffff);
            }

            .boot-sequence p {
                color: #00ff00;
                margin-bottom: 8px;
                font-size: 0.9rem;
            }

            .blinking-cursor {
                animation: cursor-blink 1s infinite;
                color: #00ff00;
            }

            @keyframes cursor-blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }

            .activation-info {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                padding: 20px;
                margin: 25px 0;
                text-align: left;
            }

            .activation-info h4 {
                color: #00ffff;
                margin-bottom: 15px;
                text-align: center;
            }

            .activation-info ul {
                margin-left: 20px;
            }

            .activation-info li {
                color: #cccccc;
                margin-bottom: 8px;
                line-height: 1.4;
            }

            .activation-btn {
                background: linear-gradient(135deg, #00ffff, #0099cc);
                color: #000;
                border: none;
                padding: 15px 40px;
                border-radius: 10px;
                font-size: 1.2rem;
                font-weight: bold;
                cursor: pointer;
                margin-top: 30px;
                transition: all 0.3s ease;
                animation: activation-pulse 2s infinite;
            }

            @keyframes activation-pulse {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                    transform: scale(1);
                }
                50% { 
                    box-shadow: 0 0 40px rgba(0, 255, 255, 0.6);
                    transform: scale(1.05);
                }
            }

            .activation-btn:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 15px 30px rgba(0, 255, 255, 0.4);
            }
        `;
        
        document.head.appendChild(style);
    }

    setupActivationInteraction() {
        const activateBtn = document.getElementById('activate-simulator');
        if (activateBtn) {
            activateBtn.addEventListener('click', () => {
                this.activateSimulator();
            });
        }
    }

    async activateSimulator() {
        if (this.simulatorActivated) return;
        
        this.simulatorActivated = true;
        
        // Play activation sound
        window.audioManager.playSFX('SUCCESS');
        
        // Show boot sequence
        await this.showBootSequence();
        
        // Start simulator
        if (this.labSimulator) {
            this.labSimulator.activate();
        }
    }

    async showBootSequence() {
        const bootMessages = [
            'Inisialisasi sistem...',
            'Memuat database perangkat...',
            'Kalibrasi sensor energi...',
            'Menghubungkan ke jaringan PLN...',
            'Sistem siap digunakan!'
        ];

        for (let i = 0; i < bootMessages.length; i++) {
            window.uiManager.showToast(bootMessages[i], 'info', 1000);
            await this.delay(1200);
        }

        window.uiManager.showToast('🧪 Simulator aktif! Gunakan untuk menghitung tagihan listrik.', 'success', 4000);
    }

    completeLevel() {
        this.levelCompleted = true;
        
        console.log('🎉 Level 3 completed!');
        
        // Deactivate simulator
        if (this.labSimulator) {
            this.labSimulator.deactivate();
        }

        // Complete level in game engine
        if (this.gameEngine) {
            this.gameEngine.completeLevel(3);
        }

        // Show blueprint discovery
        setTimeout(() => {
            this.showBlueprintDiscovery();
        }, 2000);

        // Update game progress
        const progress = window.uiManager.loadGameProgress();
        progress.currentLevel = Math.max(progress.currentLevel, 4);
        window.uiManager.saveGameProgress(progress);

        // Show continue prompt
        setTimeout(() => {
            this.showContinuePrompt();
        }, 8000);
    }

    showBlueprintDiscovery() {
        const blueprintContent = `
            <div class="blueprint-discovery">
                <h3>📋 Blueprint Ditemukan!</h3>
                <p>Kamu menemukan blueprint alat rahasia ilmuwan!</p>
                
                <div class="blueprint-visual">
                    <div class="blueprint-paper">
                        <h4>📐 BLUEPRINT: ENERGY EFFICIENCY ANALYZER</h4>
                        <div class="blueprint-specs">
                            <p><strong>Fungsi:</strong> Menganalisis efisiensi energi rumah secara otomatis</p>
                            <p><strong>Teknologi:</strong> AI-powered energy optimization</p>
                            <p><strong>Output:</strong> Rekomendasi penghematan real-time</p>
                        </div>
                        
                        <div class="blueprint-diagram">
                            <pre>
    ┌─────────────────────────┐
    │  ENERGY ANALYZER v3.0   │
    │                         │
    │  [Sensor] → [AI] → [UI] │
    │     ↓        ↓      ↓   │
    │  Monitor  Analyze Save  │
    └─────────────────────────┘
                            </pre>
                        </div>
                    </div>
                </div>
                
                <div class="discovery-achievement">
                    <h4>🏆 Pencapaian Unlocked:</h4>
                    <ul>
                        <li>✅ Formula energi: E = (P × t) / 1000</li>
                        <li>✅ Perhitungan tagihan PLN yang akurat</li>
                        <li>✅ Strategi optimasi energi rumah tangga</li>
                        <li>✅ Pemahaman pengaruh daya dan waktu</li>
                    </ul>
                </div>
                
                <div class="secret-door">
                    <h4>🚪 Pintu Rahasia Terbuka!</h4>
                    <p>Blueprint mengaktifkan mekanisme rahasia...</p>
                    <p><strong>Akses ke ruang bawah tanah tersedia!</strong></p>
                </div>
            </div>
        `;

        window.uiManager.showEducationalPanel('Blueprint Discovered!', blueprintContent);
        
        // Play blueprint discovery sound
        window.audioManager.playSuccessSound();
    }

    showContinuePrompt() {
        const continueContent = `
            <div class="lab-completion">
                <h3>🎓 Level 3: Laboratorium Selesai!</h3>
                
                <div class="level-summary">
                    <h4>📊 Ringkasan Pembelajaran:</h4>
                    <ul>
                        <li>✅ Formula energi: E = (P × t) / 1000</li>
                        <li>✅ Tarif listrik PLN: Rp 1,467.28/kWh</li>
                        <li>✅ Pengaruh daya perangkat terhadap tagihan</li>
                        <li>✅ Pengaruh waktu pemakaian terhadap biaya</li>
                        <li>✅ Strategi optimasi untuk mencapai target</li>
                    </ul>
                </div>
                
                <div class="simulation-results">
                    <h4>📈 Hasil Simulasi Kamu:</h4>
                    <div class="results-grid">
                        <div class="result-item">
                            <div class="result-value">${this.labSimulator ? GAME_UTILS.formatCurrency(this.labSimulator.getCurrentBill()) : 'Rp 280,000'}</div>
                            <div class="result-label">Tagihan Akhir</div>
                        </div>
                        <div class="result-item">
                            <div class="result-value">≤ ${GAME_UTILS.formatCurrency(this.labSimulator ? this.labSimulator.getTargetBill() : 300000)}</div>
                            <div class="result-label">Target</div>
                        </div>
                        <div class="result-item">
                            <div class="result-value">HEMAT</div>
                            <div class="result-label">Rating</div>
                        </div>
                    </div>
                </div>
                
                <div class="next-level-preview">
                    <h4>🕳️ Level Terakhir: Ruang Bawah Tanah</h4>
                    <p>Tantangan final menantimu di ruang bawah tanah yang misterius!</p>
                    <p>Gunakan semua 4 Kunci Energi untuk membuka Gerbang Evaluasi Akhir dan menyelamatkan ilmuwan!</p>
                    
                    <div class="final-challenge-preview">
                        <h5>🧠 Evaluasi Akhir:</h5>
                        <ul>
                            <li>🔀 Kuis dengan soal teracak (Fisher-Yates Shuffle)</li>
                            <li>⏰ 10 pertanyaan, 30 detik per soal</li>
                            <li>🎯 Minimal 70% untuk lulus</li>
                            <li>🏆 Penyelamatan ilmuwan sebagai hadiah</li>
                        </ul>
                    </div>
                </div>
                
                <div class="continue-section">
                    <p><strong>Siap untuk tantangan terakhir?</strong></p>
                    <button id="continue-to-basement" class="continue-final-btn">
                        🕳️ Masuki Ruang Bawah Tanah
                    </button>
                </div>
            </div>
        `;

        // Create continue prompt
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.style.display = 'flex';
            puzzleOverlay.innerHTML = `
                <div class="lab-complete-container">
                    ${continueContent}
                </div>
            `;

            this.addLabCompleteStyles();
            
            // Setup continue interaction
            const continueBtn = document.getElementById('continue-to-basement');
            if (continueBtn) {
                continueBtn.addEventListener('click', () => {
                    this.proceedToFinalLevel();
                });
            }
        }
    }

    addLabCompleteStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .lab-complete-container {
                background: rgba(26, 26, 46, 0.98);
                border: 2px solid rgba(0, 100, 255, 0.5);
                border-radius: 15px;
                padding: 30px;
                max-width: 90%;
                max-height: 90%;
                overflow-y: auto;
                text-align: center;
            }

            .lab-completion h3 {
                color: #0099ff;
                margin-bottom: 25px;
                text-shadow: 0 0 15px rgba(0, 150, 255, 0.5);
            }

            .results-grid {
                display: flex;
                justify-content: space-around;
                gap: 20px;
                margin: 20px 0;
            }

            .result-item {
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                padding: 15px;
                min-width: 120px;
            }

            .result-value {
                font-size: 1.5rem;
                font-weight: bold;
                color: #00ffff;
                margin-bottom: 5px;
            }

            .result-label {
                font-size: 0.9rem;
                color: #cccccc;
            }

            .final-challenge-preview {
                background: rgba(100, 0, 0, 0.2);
                border: 1px solid rgba(255, 100, 100, 0.3);
                border-radius: 10px;
                padding: 15px;
                margin: 20px 0;
            }

            .final-challenge-preview h5 {
                color: #ff6666;
                margin-bottom: 10px;
            }

            .final-challenge-preview ul {
                text-align: left;
                margin-left: 20px;
            }

            .final-challenge-preview li {
                color: #cccccc;
                margin-bottom: 5px;
            }

            .continue-final-btn {
                background: linear-gradient(135deg, #ff6600, #cc4400);
                color: #ffffff;
                border: none;
                padding: 15px 40px;
                border-radius: 10px;
                font-size: 1.2rem;
                font-weight: bold;
                cursor: pointer;
                margin-top: 20px;
                transition: all 0.3s ease;
                animation: final-challenge-glow 3s infinite;
            }

            @keyframes final-challenge-glow {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(255, 100, 0, 0.3);
                }
                50% { 
                    box-shadow: 0 0 40px rgba(255, 100, 0, 0.6);
                }
            }

            .continue-final-btn:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 15px 30px rgba(255, 100, 0, 0.4);
            }

            @media (max-width: 768px) {
                .results-grid {
                    flex-direction: column;
                    align-items: center;
                }
                
                .result-item {
                    width: 100%;
                    max-width: 200px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    proceedToFinalLevel() {
        // Hide continue prompt
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.style.display = 'none';
        }
        
        // Show dramatic transition
        window.uiManager.showToast('🕳️ Memasuki ruang bawah tanah yang misterius...', 'warning', 3000);
        
        // Play mysterious sound
        window.audioManager.playSFX('ERROR'); // Using available sound for mysterious effect
        
        // Transition to Level 4
        setTimeout(() => {
            window.gameFSM.nextLevel();
        }, 3500);
    }

    // Debug methods
    debugActivateSimulator() {
        this.activateSimulator();
    }

    debugCompleteLevel() {
        if (this.labSimulator) {
            this.labSimulator.isCompleted = true;
        }
        this.completeLevel();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    destroy() {
        if (this.labSimulator) {
            this.labSimulator.destroy();
        }
        
        // Hide any open panels
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.style.display = 'none';
        }
        
        this.initialized = false;
        
        console.log('🗑️ Level 3 destroyed');
    }
}

// Export for global access
window.Level3Handler = Level3Handler;