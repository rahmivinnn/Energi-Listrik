// Energy Quest: Level 4 - Basement Handler
// Implements final quiz with Fisher-Yates shuffle

class Level4Handler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initialized = false;
        this.levelCompleted = false;
        this.gateActivated = false;
        this.allKeysValidated = false;
        
        // Puzzle instance
        this.quizSystem = null;
    }

    initialize() {
        if (this.initialized) return;

        console.log('🕳️ Level 4: Ruang Bawah Tanah - Initializing...');
        
        // Create puzzle instance
        this.quizSystem = new QuizSystem();
        
        // Setup level
        this.setupLevel();
        this.checkEnergyKeysStatus();
        this.showLevelIntroduction();
        
        this.initialized = true;
        console.log('✅ Level 4 initialized');
    }

    setupLevel() {
        // Update level info
        const levelData = LEVEL_DATA[4];
        window.uiManager.updateLevelInfo(4, levelData.title, levelData.objective);
        
        // Hide power meter (not needed for this level)
        window.uiManager.hidePowerMeter();
        
        // Show energy gate
        this.showEnergyGate();
    }

    update(deltaTime) {
        if (!this.initialized) return;

        // Check quiz completion
        if (!this.levelCompleted && this.quizSystem && this.quizSystem.isPuzzleCompleted()) {
            this.completeLevel();
        }

        // Update mystical atmosphere
        this.updateMysticalAtmosphere();
    }

    showLevelIntroduction() {
        const progress = window.uiManager.loadGameProgress();
        const collectedKeys = progress.energyKeys ? progress.energyKeys.filter(key => key).length : 0;
        
        const introContent = `
            <h3>🕳️ Ruang Bawah Tanah Misterius</h3>
            <p>Kamu telah mencapai ruang bawah tanah yang penuh misteri!</p>
            
            <div class="basement-atmosphere">
                <div class="mysterious-glow">🌟</div>
                <p><em>Di depanmu berdiri Gerbang Evaluasi Akhir yang bercahaya biru...</em></p>
            </div>
            
            <h4>🎯 Misi Final:</h4>
            <ul>
                <li>Kumpulkan semua 4 Kunci Energi</li>
                <li>Aktifkan Gerbang Evaluasi Akhir</li>
                <li>Selesaikan kuis pengetahuan energi</li>
                <li>Selamatkan ilmuwan yang hilang</li>
            </ul>
            
            <h4>📊 Status Kunci Energi:</h4>
            <div class="keys-status">
                <div class="key-item ${progress.energyKeys?.[0] ? 'collected' : 'missing'}">
                    <span class="key-icon">🔑</span>
                    <span class="key-label">Kunci 1: Ruang Tamu</span>
                    <span class="key-status">${progress.energyKeys?.[0] ? '✅' : '❌'}</span>
                </div>
                <div class="key-item ${progress.energyKeys?.[1] ? 'collected' : 'missing'}">
                    <span class="key-icon">🔑</span>
                    <span class="key-label">Kunci 2: Dapur</span>
                    <span class="key-status">${progress.energyKeys?.[1] ? '✅' : '❌'}</span>
                </div>
                <div class="key-item ${progress.energyKeys?.[2] ? 'collected' : 'missing'}">
                    <span class="key-icon">🔑</span>
                    <span class="key-label">Kunci 3: Laboratorium</span>
                    <span class="key-status">${progress.energyKeys?.[2] ? '✅' : '❌'}</span>
                </div>
                <div class="key-item ${progress.energyKeys?.[3] ? 'collected' : 'missing'}">
                    <span class="key-icon">🔑</span>
                    <span class="key-label">Kunci 4: Quiz Final</span>
                    <span class="key-status">${progress.energyKeys?.[3] ? '✅' : '❌'}</span>
                </div>
            </div>
            
            <div class="current-status">
                <h4>📍 Status Saat Ini:</h4>
                <p><strong>Kunci Terkumpul:</strong> ${collectedKeys}/4</p>
                <p><strong>Status Gerbang:</strong> ${collectedKeys >= 3 ? '🔓 SIAP DIAKTIFKAN' : '🔒 MEMBUTUHKAN LEBIH BANYAK KUNCI'}</p>
            </div>
        `;

        window.uiManager.showEducationalPanel('Gerbang Evaluasi Akhir', introContent);
        
        // Play level intro narration
        window.audioManager.playNarration('LEVEL_4_INTRO');
    }

    checkEnergyKeysStatus() {
        const progress = window.uiManager.loadGameProgress();
        const collectedKeys = progress.energyKeys ? progress.energyKeys.filter(key => key).length : 0;
        
        this.allKeysValidated = collectedKeys >= 3; // Need at least 3 keys to start final challenge
        
        console.log(`🔑 Energy keys status: ${collectedKeys}/4 collected`);
        
        return collectedKeys;
    }

    showEnergyGate() {
        setTimeout(() => {
            const gateContent = `
                <div class="energy-gate-chamber">
                    <h3>⚡ Gerbang Evaluasi Akhir</h3>
                    
                    <div class="gate-visual">
                        <div class="gate-structure">
                            <div class="gate-frame">🌀</div>
                            <div class="gate-energy-field">
                                <div class="energy-particle">✨</div>
                                <div class="energy-particle">⭐</div>
                                <div class="energy-particle">💫</div>
                                <div class="energy-particle">🌟</div>
                            </div>
                            <div class="gate-core">🔮</div>
                        </div>
                    </div>
                    
                    <div class="gate-status">
                        <h4 id="gate-status-title">Status Gerbang</h4>
                        <p id="gate-status-message">Menganalisis kunci energi...</p>
                        
                        <div class="key-slots">
                            <div class="key-slot" data-key="0">
                                <div class="slot-visual">🔑</div>
                                <div class="slot-label">Ruang Tamu</div>
                            </div>
                            <div class="key-slot" data-key="1">
                                <div class="slot-visual">🔑</div>
                                <div class="slot-label">Dapur</div>
                            </div>
                            <div class="key-slot" data-key="2">
                                <div class="slot-visual">🔑</div>
                                <div class="slot-label">Laboratorium</div>
                            </div>
                            <div class="key-slot" data-key="3">
                                <div class="slot-visual">🔑</div>
                                <div class="slot-label">Quiz Final</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="gate-controls">
                        <button id="activate-gate-btn" class="gate-btn" ${this.allKeysValidated ? '' : 'disabled'}>
                            ${this.allKeysValidated ? '⚡ Aktifkan Gerbang' : '🔒 Kumpulkan Kunci Dulu'}
                        </button>
                    </div>
                    
                    <div class="chamber-atmosphere">
                        <p><em>Ruang bawah tanah dipenuhi aura mistis...</em></p>
                        <p><em>Kristal-kristal energi berkilauan di dinding...</em></p>
                        <p><em>Gerbang menunggu untuk diaktifkan...</em></p>
                    </div>
                </div>
            `;

            const puzzleOverlay = document.getElementById('puzzle-overlay');
            if (puzzleOverlay) {
                puzzleOverlay.style.display = 'flex';
                puzzleOverlay.innerHTML = `
                    <div class="gate-chamber-container">
                        ${gateContent}
                    </div>
                `;

                this.addGateStyles();
                this.setupGateInteractions();
                this.updateKeySlots();
            }
        }, 1000);
    }

    addGateStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .gate-chamber-container {
                background: rgba(10, 10, 30, 0.98);
                border: 2px solid rgba(100, 0, 255, 0.5);
                border-radius: 15px;
                padding: 30px;
                max-width: 90%;
                max-height: 90%;
                overflow-y: auto;
                text-align: center;
                position: relative;
            }

            .gate-chamber-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle at center, rgba(100, 0, 255, 0.1) 0%, transparent 70%);
                border-radius: 15px;
                animation: chamber-pulse 4s infinite;
            }

            @keyframes chamber-pulse {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.7; }
            }

            .energy-gate-chamber h3 {
                color: #9966ff;
                margin-bottom: 30px;
                text-shadow: 0 0 20px rgba(150, 100, 255, 0.6);
                font-size: 2rem;
            }

            .gate-visual {
                margin: 30px 0;
                position: relative;
                z-index: 1;
            }

            .gate-structure {
                position: relative;
                width: 200px;
                height: 200px;
                margin: 0 auto;
            }

            .gate-frame {
                font-size: 12rem;
                color: #6644aa;
                animation: gate-rotation 10s linear infinite;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            @keyframes gate-rotation {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }

            .gate-energy-field {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }

            .energy-particle {
                position: absolute;
                font-size: 1.5rem;
                animation: particle-float 3s infinite;
                opacity: 0.7;
            }

            .energy-particle:nth-child(1) { 
                top: 20%; 
                left: 20%; 
                animation-delay: 0s; 
            }
            .energy-particle:nth-child(2) { 
                top: 20%; 
                right: 20%; 
                animation-delay: 0.5s; 
            }
            .energy-particle:nth-child(3) { 
                bottom: 20%; 
                left: 20%; 
                animation-delay: 1s; 
            }
            .energy-particle:nth-child(4) { 
                bottom: 20%; 
                right: 20%; 
                animation-delay: 1.5s; 
            }

            @keyframes particle-float {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-10px) scale(1.1); }
            }

            .gate-core {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 3rem;
                color: #aa66ff;
                animation: core-pulse 2s infinite;
            }

            @keyframes core-pulse {
                0%, 100% { 
                    filter: drop-shadow(0 0 10px #aa66ff);
                    transform: translate(-50%, -50%) scale(1);
                }
                50% { 
                    filter: drop-shadow(0 0 30px #aa66ff);
                    transform: translate(-50%, -50%) scale(1.2);
                }
            }

            .gate-status {
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(100, 0, 255, 0.3);
                border-radius: 10px;
                padding: 25px;
                margin: 30px 0;
                position: relative;
                z-index: 1;
            }

            .gate-status h4 {
                color: #9966ff;
                margin-bottom: 15px;
            }

            .key-slots {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin: 20px 0;
            }

            .key-slot {
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(100, 0, 255, 0.3);
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                min-width: 80px;
                transition: all 0.3s ease;
            }

            .key-slot.collected {
                border-color: #ffff00;
                background: rgba(255, 255, 0, 0.1);
                animation: key-slot-glow 2s infinite;
            }

            @keyframes key-slot-glow {
                0%, 100% { 
                    box-shadow: 0 0 10px rgba(255, 255, 0, 0.3);
                }
                50% { 
                    box-shadow: 0 0 20px rgba(255, 255, 0, 0.6);
                }
            }

            .slot-visual {
                font-size: 2rem;
                margin-bottom: 8px;
                opacity: 0.3;
            }

            .key-slot.collected .slot-visual {
                opacity: 1;
                filter: drop-shadow(0 0 10px #ffff00);
            }

            .slot-label {
                font-size: 0.8rem;
                color: #cccccc;
            }

            .gate-btn {
                background: linear-gradient(135deg, #9966ff, #6644aa);
                color: #ffffff;
                border: none;
                padding: 15px 40px;
                border-radius: 10px;
                font-size: 1.2rem;
                font-weight: bold;
                cursor: pointer;
                margin: 20px 0;
                transition: all 0.3s ease;
                position: relative;
                z-index: 1;
            }

            .gate-btn:enabled {
                animation: gate-btn-ready 2s infinite;
            }

            @keyframes gate-btn-ready {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(150, 100, 255, 0.4);
                }
                50% { 
                    box-shadow: 0 0 40px rgba(150, 100, 255, 0.8);
                }
            }

            .gate-btn:hover:enabled {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 15px 30px rgba(150, 100, 255, 0.5);
            }

            .gate-btn:disabled {
                background: #444;
                color: #888;
                cursor: not-allowed;
                animation: none;
            }

            .chamber-atmosphere {
                background: rgba(100, 0, 100, 0.1);
                border: 1px solid rgba(150, 0, 150, 0.2);
                border-radius: 10px;
                padding: 20px;
                margin: 25px 0;
                font-style: italic;
                color: #bb99dd;
                position: relative;
                z-index: 1;
            }

            .chamber-atmosphere p {
                margin-bottom: 8px;
                line-height: 1.4;
            }

            .keys-status {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin: 20px 0;
                text-align: left;
            }

            .key-item {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(100, 0, 255, 0.2);
                border-radius: 8px;
                padding: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .key-item.collected {
                border-color: rgba(255, 255, 0, 0.5);
                background: rgba(255, 255, 0, 0.1);
            }

            .key-item.missing {
                opacity: 0.5;
            }

            .key-icon {
                font-size: 1.2rem;
            }

            .key-item.collected .key-icon {
                filter: drop-shadow(0 0 5px #ffff00);
            }

            .key-label {
                flex: 1;
                font-size: 0.9rem;
            }

            .key-status {
                font-weight: bold;
            }

            .mysterious-glow {
                font-size: 3rem;
                animation: mysterious-glow 3s infinite;
                margin-bottom: 20px;
            }

            @keyframes mysterious-glow {
                0%, 100% { 
                    filter: drop-shadow(0 0 15px #9966ff);
                    transform: scale(1);
                }
                50% { 
                    filter: drop-shadow(0 0 30px #9966ff);
                    transform: scale(1.1);
                }
            }

            @media (max-width: 768px) {
                .keys-status {
                    grid-template-columns: 1fr;
                }
                
                .gate-structure {
                    width: 150px;
                    height: 150px;
                }
                
                .gate-frame {
                    font-size: 8rem;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    setupGateInteractions() {
        const activateBtn = document.getElementById('activate-gate-btn');
        if (activateBtn) {
            activateBtn.addEventListener('click', () => {
                this.tryActivateGate();
            });
        }
    }

    updateKeySlots() {
        const progress = window.uiManager.loadGameProgress();
        
        document.querySelectorAll('.key-slot').forEach((slot, index) => {
            const hasKey = progress.energyKeys && progress.energyKeys[index];
            
            if (hasKey) {
                slot.classList.add('collected');
            } else {
                slot.classList.remove('collected');
            }
        });

        // Update gate status message
        const collectedKeys = progress.energyKeys ? progress.energyKeys.filter(key => key).length : 0;
        const statusMessage = document.getElementById('gate-status-message');
        
        if (statusMessage) {
            if (collectedKeys >= 3) {
                statusMessage.textContent = 'GERBANG SIAP DIAKTIFKAN! Klik tombol untuk memulai evaluasi akhir.';
                statusMessage.style.color = '#00ff00';
            } else {
                const needed = 4 - collectedKeys;
                statusMessage.textContent = `Masih membutuhkan ${needed} kunci energi lagi.`;
                statusMessage.style.color = '#ffff00';
            }
        }
    }

    tryActivateGate() {
        const collectedKeys = this.checkEnergyKeysStatus();
        
        if (collectedKeys < 3) {
            const needed = 4 - collectedKeys;
            window.uiManager.showToast(`${GAME_CONSTANTS.MESSAGES.ERRORS.MISSING_KEYS} ${needed} kunci lagi.`, 'error');
            window.audioManager.playErrorSound();
            return;
        }

        this.activateEnergyGate();
    }

    async activateEnergyGate() {
        this.gateActivated = true;
        
        console.log('⚡ Activating Energy Gate...');
        
        // Play gate activation sound
        window.audioManager.playSuccessSound();
        
        // Show gate activation sequence
        await this.playGateActivationSequence();
        
        // Start quiz
        this.startFinalQuiz();
    }

    async playGateActivationSequence() {
        // Animate key consumption
        window.uiManager.showToast('🔑 Kunci energi diserap oleh gerbang...', 'info', 3000);
        await this.delay(2000);
        
        // Gate opening effect
        window.uiManager.showToast('⚡ Gerbang terbuka! Terminal kuis muncul...', 'success', 4000);
        await this.delay(3000);
        
        // Quiz terminal appears
        this.showQuizTerminal();
    }

    showQuizTerminal() {
        const terminalContent = `
            <div class="quiz-terminal">
                <h3>🖥️ Terminal Evaluasi Akhir</h3>
                <p>Terminal kuis telah muncul dari dalam gerbang!</p>
                
                <div class="terminal-visual">
                    <div class="terminal-screen">
                        <div class="terminal-header">
                            <span class="terminal-title">ENERGY KNOWLEDGE ASSESSMENT SYSTEM</span>
                        </div>
                        <div class="terminal-body">
                            <p>► Sistem evaluasi siap</p>
                            <p>► Database soal dimuat: 20+ pertanyaan</p>
                            <p>► Algoritma Fisher-Yates aktif</p>
                            <p>► Tingkat kesulitan: SMP</p>
                            <p class="ready-prompt">► Tekan ENTER untuk memulai evaluasi...</p>
                        </div>
                    </div>
                </div>
                
                <div class="quiz-preparation">
                    <h4>🧠 Persiapan Evaluasi Akhir</h4>
                    <div class="quiz-specs">
                        <div class="spec-item">
                            <span class="spec-icon">🔀</span>
                            <span class="spec-text">Soal diacak dengan Fisher-Yates Shuffle</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-icon">⏰</span>
                            <span class="spec-text">30 detik per pertanyaan</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-icon">🎯</span>
                            <span class="spec-text">Minimal 70% untuk lulus</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-icon">📚</span>
                            <span class="spec-text">5 kategori: Listrik, Efisiensi, Perhitungan, Keamanan, Energi Terbarukan</span>
                        </div>
                    </div>
                </div>
                
                <div class="final-warning">
                    <h4>⚠️ Peringatan</h4>
                    <p>Ini adalah evaluasi terakhir. Pastikan kamu siap!</p>
                    <p>Nasib ilmuwan yang hilang ada di tanganmu!</p>
                </div>
                
                <div class="start-evaluation">
                    <button id="start-final-quiz" class="final-quiz-btn">
                        🧠 Mulai Evaluasi Akhir
                    </button>
                </div>
            </div>
        `;

        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.innerHTML = `
                <div class="quiz-terminal-container">
                    ${terminalContent}
                </div>
            `;

            this.addTerminalStyles();
            
            // Setup quiz start interaction
            const startQuizBtn = document.getElementById('start-final-quiz');
            if (startQuizBtn) {
                startQuizBtn.addEventListener('click', () => {
                    this.startFinalQuiz();
                });
            }
        }
    }

    addTerminalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .quiz-terminal-container {
                background: rgba(10, 10, 30, 0.98);
                border: 2px solid rgba(0, 255, 255, 0.5);
                border-radius: 15px;
                padding: 30px;
                max-width: 90%;
                max-height: 90%;
                overflow-y: auto;
                text-align: center;
            }

            .terminal-visual {
                margin: 30px 0;
            }

            .terminal-screen {
                background: #000;
                border: 3px solid #333;
                border-radius: 10px;
                padding: 20px;
                margin: 20px auto;
                max-width: 500px;
                font-family: 'Courier New', monospace;
                text-align: left;
            }

            .terminal-header {
                border-bottom: 1px solid #333;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }

            .terminal-title {
                color: #00ffff;
                font-weight: bold;
                font-size: 0.9rem;
            }

            .terminal-body p {
                color: #00ff00;
                margin-bottom: 5px;
                font-size: 0.9rem;
            }

            .ready-prompt {
                color: #ffff00 !important;
                animation: terminal-blink 1.5s infinite;
                margin-top: 10px !important;
            }

            @keyframes terminal-blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
            }

            .quiz-specs {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin: 20px 0;
                text-align: left;
            }

            .spec-item {
                display: flex;
                align-items: center;
                gap: 15px;
                background: rgba(0, 255, 255, 0.05);
                border: 1px solid rgba(0, 255, 255, 0.2);
                border-radius: 8px;
                padding: 12px;
            }

            .spec-icon {
                font-size: 1.3rem;
                min-width: 25px;
                text-align: center;
            }

            .spec-text {
                color: #cccccc;
                line-height: 1.3;
            }

            .final-warning {
                background: rgba(255, 100, 0, 0.1);
                border: 2px solid rgba(255, 100, 0, 0.3);
                border-radius: 10px;
                padding: 20px;
                margin: 25px 0;
            }

            .final-warning h4 {
                color: #ff6600;
                margin-bottom: 15px;
            }

            .final-warning p {
                color: #ffccaa;
                margin-bottom: 8px;
                line-height: 1.4;
            }

            .final-quiz-btn {
                background: linear-gradient(135deg, #ff6600, #cc4400);
                color: #ffffff;
                border: none;
                padding: 18px 50px;
                border-radius: 12px;
                font-size: 1.3rem;
                font-weight: bold;
                cursor: pointer;
                margin-top: 30px;
                transition: all 0.3s ease;
                animation: final-btn-pulse 3s infinite;
            }

            @keyframes final-btn-pulse {
                0%, 100% { 
                    box-shadow: 0 0 25px rgba(255, 100, 0, 0.4);
                    transform: scale(1);
                }
                50% { 
                    box-shadow: 0 0 50px rgba(255, 100, 0, 0.8);
                    transform: scale(1.08);
                }
            }

            .final-quiz-btn:hover {
                transform: translateY(-5px) scale(1.1);
                box-shadow: 0 20px 40px rgba(255, 100, 0, 0.6);
            }

            @media (max-width: 768px) {
                .quiz-specs {
                    gap: 10px;
                }
                
                .spec-item {
                    flex-direction: column;
                    text-align: center;
                    gap: 8px;
                }
                
                .terminal-screen {
                    padding: 15px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    startFinalQuiz() {
        console.log('🧠 Starting Final Quiz...');
        
        // Hide terminal, start quiz
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.style.display = 'none';
        }
        
        // Activate quiz system
        if (this.quizSystem) {
            this.quizSystem.activate();
        }
        
        // Show dramatic message
        window.uiManager.showToast('🧠 Evaluasi akhir dimulai! Tunjukkan pemahamanmu!', 'warning', 4000);
    }

    completeLevel() {
        this.levelCompleted = true;
        
        console.log('🎉 Level 4 completed!');
        
        // Deactivate quiz
        if (this.quizSystem) {
            this.quizSystem.deactivate();
        }

        // Complete level in game engine
        if (this.gameEngine) {
            this.gameEngine.completeLevel(4);
        }

        // Show scientist rescue sequence
        setTimeout(() => {
            this.showScientistRescue();
        }, 2000);

        // Mark game as completed
        const progress = window.uiManager.loadGameProgress();
        progress.gameCompleted = true;
        progress.currentLevel = 5; // Beyond final level
        window.uiManager.saveGameProgress(progress);

        // Transition to ending
        setTimeout(() => {
            window.gameFSM.completeGame();
        }, 8000);
    }

    showScientistRescue() {
        const rescueContent = `
            <div class="scientist-rescue">
                <h3>🔬 Ilmuwan Ditemukan!</h3>
                
                <div class="rescue-scene">
                    <div class="scientist-visual">
                        <div class="scientist-figure">👨‍🔬</div>
                        <div class="rescue-glow"></div>
                    </div>
                    <div class="rescue-dialogue">
                        <h4>Ilmuwan Berkata:</h4>
                        <p><em>"Selamat, kamu telah menyelamatkanku! Perjalananmu mengajarkan pentingnya efisiensi energi."</em></p>
                        <p><em>"Gunakan pengetahuan ini untuk masa depan yang lebih baik. Jadilah generasi yang hemat energi!"</em></p>
                    </div>
                </div>
                
                <div class="final-achievement">
                    <h4>🏆 MISI SELESAI!</h4>
                    <div class="achievement-badge">
                        <div class="badge-visual">🎖️</div>
                        <div class="badge-title">PENELITI MUDA ENERGI</div>
                        <div class="badge-subtitle">Master of Energy Efficiency</div>
                    </div>
                </div>
                
                <div class="completion-stats">
                    <h4>📊 Pencapaian Kamu:</h4>
                    <ul>
                        <li>✅ Memahami rangkaian listrik dasar</li>
                        <li>✅ Menguasai efisiensi energi</li>
                        <li>✅ Menghitung tagihan listrik</li>
                        <li>✅ Lulus evaluasi pengetahuan (${this.quizSystem ? Math.round(this.quizSystem.getScore()) : 85}%)</li>
                        <li>✅ Menyelamatkan ilmuwan</li>
                    </ul>
                </div>
                
                <p><strong>🌟 Kamu telah menjadi ahli efisiensi energi!</strong></p>
            </div>
        `;

        window.uiManager.showEducationalPanel('Ilmuwan Diselamatkan!', rescueContent);
        
        // Play rescue narration
        window.audioManager.playNarration('SCIENTIST_MESSAGE');
        
        // Play success fanfare
        setTimeout(() => {
            window.audioManager.playSuccessSound();
        }, 2000);
    }

    updateMysticalAtmosphere() {
        // Update mystical visual effects (if any canvas elements exist)
        const gameCanvas = document.getElementById('game-canvas');
        if (gameCanvas && this.gateActivated) {
            // Add mystical glow effect to canvas
            gameCanvas.style.background = `
                radial-gradient(circle at center, 
                    rgba(150, 100, 255, 0.2) 0%, 
                    rgba(10, 10, 30, 0.8) 70%,
                    #1a1a2e 100%
                )
            `;
        }
    }

    // Debug methods
    debugActivateGate() {
        this.allKeysValidated = true;
        this.activateEnergyGate();
    }

    debugCompleteQuiz() {
        if (this.quizSystem) {
            this.quizSystem.isCompleted = true;
            this.completeLevel();
        }
    }

    debugCollectAllKeys() {
        for (let i = 0; i < 4; i++) {
            window.uiManager.collectEnergyKey(i);
        }
        this.checkEnergyKeysStatus();
        this.updateKeySlots();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    destroy() {
        if (this.quizSystem) {
            this.quizSystem.destroy();
        }
        
        // Hide any open panels
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.style.display = 'none';
        }
        
        this.initialized = false;
        
        console.log('🗑️ Level 4 destroyed');
    }
}

// Export for global access
window.Level4Handler = Level4Handler;