// Energy Quest: TV Puzzle Implementation
// Level 1 - Sequential TV Operation Puzzle

class TVPuzzle {
    constructor() {
        this.isCompleted = false;
        this.isActive = false;
        this.currentStep = 0;
        this.currentChannel = 0;
        this.correctChannel = 3;
        
        // TV state
        this.isCablePlugged = false;
        this.isMainSwitchOn = false;
        this.isTVOn = false;
        this.isChannelSet = false;
        
        // Steps sequence
        this.steps = [
            { action: 'plug_cable', instruction: 'Colokkan kabel TV ke stop kontak', buttonId: 'plug-cable-btn' },
            { action: 'main_switch', instruction: 'Nyalakan saklar utama listrik', buttonId: 'main-switch-btn' },
            { action: 'tv_power', instruction: 'Tekan tombol power TV', buttonId: 'tv-power-btn' },
            { action: 'set_channel', instruction: 'Atur channel ke channel 3', buttonId: 'channel-controls' }
        ];
        
        console.log('TV Puzzle initialized');
    }

    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.createPuzzleUI();
        this.setupInteractions();
        this.showTutorial();
        
        console.log('TV puzzle activated');
    }

    deactivate() {
        this.isActive = false;
        this.removePuzzleUI();
        console.log('TV puzzle deactivated');
    }

    createPuzzleUI() {
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (!puzzleOverlay) return;

        puzzleOverlay.style.display = 'flex';
        puzzleOverlay.innerHTML = `
            <div class="tv-puzzle-container">
                <div class="puzzle-header">
                    <h3>📺 Puzzle TV Tua</h3>
                    <p>Ikuti urutan yang benar untuk menyalakan TV</p>
                </div>
                
                <div class="tv-setup">
                    <div class="tv-unit">
                        <div class="tv-screen" id="tv-screen">
                            <div class="tv-static" id="tv-static" style="display: none;">
                                <div class="static-lines"></div>
                                <div class="static-noise">📺</div>
                            </div>
                            <div class="tv-content" id="tv-content" style="display: none;">
                                <div class="channel-display">
                                    <h4>Channel <span id="channel-display">0</span></h4>
                                    <div class="channel-content" id="channel-content">
                                        <p>Tidak ada sinyal</p>
                                    </div>
                                </div>
                            </div>
                            <div class="tv-off-screen" id="tv-off-screen">
                                <div class="screen-reflection">📺</div>
                                <p>TV Mati</p>
                            </div>
                        </div>
                        
                        <div class="tv-controls-panel">
                            <div class="power-indicator" id="power-indicator">⭕</div>
                            <div class="tv-buttons">
                                <button id="tv-power-btn" class="tv-control-btn power" disabled>
                                    <span class="btn-icon">⏻</span>
                                    <span class="btn-label">POWER</span>
                                </button>
                                <div class="channel-controls">
                                    <button id="channel-up-btn" class="tv-control-btn small" disabled>CH+</button>
                                    <div class="channel-display-small">
                                        <span id="current-channel-display">0</span>
                                    </div>
                                    <button id="channel-down-btn" class="tv-control-btn small" disabled>CH-</button>
                                </div>
                                <div class="volume-controls">
                                    <button id="volume-up-btn" class="tv-control-btn small" disabled>VOL+</button>
                                    <div class="volume-display">
                                        <span id="current-volume-display">50</span>
                                    </div>
                                    <button id="volume-down-btn" class="tv-control-btn small" disabled>VOL-</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="electrical-setup">
                        <div class="power-outlet">
                            <div class="outlet-visual">🔌</div>
                            <div class="outlet-label">Stop Kontak</div>
                        </div>
                        
                        <div class="main-switch">
                            <div class="switch-visual" id="main-switch-visual">⚡</div>
                            <div class="switch-label">Saklar Utama</div>
                            <div class="switch-state" id="main-switch-state">OFF</div>
                        </div>
                        
                        <div class="tv-cable" id="tv-cable">
                            <div class="cable-visual">🔌➖➖➖</div>
                            <div class="cable-status" id="cable-status">Terlepas</div>
                        </div>
                    </div>
                </div>

                <div class="sequence-controls">
                    <div class="current-step">
                        <h4>Langkah <span id="step-number">1</span>/4</h4>
                        <p id="step-instruction">${this.steps[0].instruction}</p>
                    </div>
                    
                    <div class="action-buttons">
                        <button id="plug-cable-btn" class="sequence-btn primary">
                            🔌 Colok Kabel
                        </button>
                        <button id="main-switch-btn" class="sequence-btn" disabled>
                            ⚡ Saklar Utama
                        </button>
                    </div>
                </div>

                <div class="puzzle-feedback" id="tv-puzzle-feedback">
                    <p>Ikuti urutan yang benar untuk menyalakan TV dan menemukan rekaman ilmuwan</p>
                </div>
            </div>
        `;

        this.addTVPuzzleStyles();
    }

    addTVPuzzleStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .tv-puzzle-container {
                background: rgba(26, 26, 46, 0.95);
                border: 2px solid rgba(0, 255, 255, 0.5);
                border-radius: 15px;
                padding: 30px;
                max-width: 95%;
                max-height: 95%;
                overflow-y: auto;
            }

            .tv-setup {
                display: flex;
                justify-content: space-around;
                align-items: flex-start;
                margin: 20px 0;
                gap: 30px;
            }

            .tv-unit {
                flex: 2;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .tv-screen {
                width: 300px;
                height: 200px;
                background: #1a1a1a;
                border: 8px solid #333;
                border-radius: 15px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
                overflow: hidden;
            }

            .tv-off-screen {
                color: #666;
                text-align: center;
            }

            .screen-reflection {
                font-size: 3rem;
                opacity: 0.3;
                margin-bottom: 10px;
            }

            .tv-static {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 255, 255, 0.1) 2px,
                    rgba(255, 255, 255, 0.1) 4px
                );
                animation: static-noise 0.1s infinite;
            }

            @keyframes static-noise {
                0% { transform: translateY(0); }
                100% { transform: translateY(4px); }
            }

            .static-noise {
                font-size: 4rem;
                opacity: 0.5;
                animation: flicker 0.2s infinite;
            }

            @keyframes flicker {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 0.8; }
            }

            .tv-content {
                width: 100%;
                height: 100%;
                padding: 20px;
                text-align: center;
                background: #000066;
            }

            .channel-display h4 {
                color: #00ffff;
                margin-bottom: 15px;
            }

            .channel-content {
                color: #ffffff;
                font-size: 0.9rem;
                line-height: 1.4;
            }

            .scientist-recording {
                background: rgba(0, 100, 0, 0.2);
                border: 1px solid #00ff00;
                border-radius: 5px;
                padding: 15px;
            }

            .tv-controls-panel {
                background: #2a2a2a;
                border: 2px solid #444;
                border-radius: 10px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 15px;
            }

            .power-indicator {
                font-size: 1.5rem;
                color: #ff0000;
            }

            .power-indicator.on {
                color: #00ff00;
                filter: drop-shadow(0 0 10px #00ff00);
            }

            .tv-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
                align-items: center;
            }

            .tv-control-btn {
                background: #444;
                border: 2px solid #666;
                color: #fff;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                min-width: 80px;
                justify-content: center;
            }

            .tv-control-btn:enabled:hover {
                background: #555;
                border-color: #00ffff;
            }

            .tv-control-btn:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }

            .tv-control-btn.power {
                background: #660000;
                border-color: #ff0000;
                min-width: 100px;
            }

            .tv-control-btn.power:enabled {
                background: #006600;
                border-color: #00ff00;
            }

            .channel-controls, .volume-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .tv-control-btn.small {
                min-width: 50px;
                padding: 5px 8px;
                font-size: 0.8rem;
            }

            .channel-display-small, .volume-display {
                background: #000;
                color: #00ff00;
                padding: 5px 10px;
                border-radius: 3px;
                font-family: monospace;
                font-weight: bold;
                min-width: 30px;
                text-align: center;
            }

            .electrical-setup {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 20px;
                align-items: center;
            }

            .power-outlet, .main-switch, .tv-cable {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                min-width: 120px;
            }

            .outlet-visual, .switch-visual, .cable-visual {
                font-size: 2rem;
                margin-bottom: 10px;
            }

            .switch-visual.on {
                color: #00ff00;
                filter: drop-shadow(0 0 10px #00ff00);
            }

            .cable-visual.connected {
                color: #00ff00;
            }

            .outlet-label, .switch-label, .cable-status {
                font-size: 0.9rem;
                color: #cccccc;
            }

            .switch-state {
                font-weight: bold;
                margin-top: 5px;
            }

            .switch-state.on {
                color: #00ff00;
            }

            .sequence-controls {
                margin: 20px 0;
                text-align: center;
            }

            .current-step {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 20px;
            }

            .current-step h4 {
                color: #00ffff;
                margin-bottom: 10px;
            }

            .current-step p {
                color: #ffffff;
                font-size: 1.1rem;
            }

            .action-buttons {
                display: flex;
                justify-content: center;
                gap: 15px;
                flex-wrap: wrap;
            }

            .sequence-btn {
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 140px;
            }

            .sequence-btn.primary {
                background: linear-gradient(135deg, #00ffff, #0099cc);
                color: #000;
            }

            .sequence-btn:enabled:hover {
                transform: translateY(-2px);
            }

            .sequence-btn:disabled {
                background: #333;
                color: #666;
                cursor: not-allowed;
                opacity: 0.5;
            }

            .puzzle-feedback {
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin-top: 20px;
                text-align: center;
            }

            .scientist-message {
                background: rgba(0, 100, 0, 0.2);
                border: 2px solid #00ff00;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                animation: message-glow 2s infinite;
            }

            @keyframes message-glow {
                0%, 100% { 
                    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
                }
                50% { 
                    box-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
                }
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .tv-setup {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .tv-screen {
                    width: 250px;
                    height: 150px;
                }
                
                .action-buttons {
                    flex-direction: column;
                    align-items: center;
                }
                
                .sequence-btn {
                    width: 100%;
                    max-width: 200px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    setupInteractions() {
        // Setup step buttons
        const plugCableBtn = document.getElementById('plug-cable-btn');
        const mainSwitchBtn = document.getElementById('main-switch-btn');
        const tvPowerBtn = document.getElementById('tv-power-btn');
        const channelUpBtn = document.getElementById('channel-up-btn');
        const channelDownBtn = document.getElementById('channel-down-btn');
        const volumeUpBtn = document.getElementById('volume-up-btn');
        const volumeDownBtn = document.getElementById('volume-down-btn');

        if (plugCableBtn) plugCableBtn.addEventListener('click', () => this.plugCable());
        if (mainSwitchBtn) mainSwitchBtn.addEventListener('click', () => this.toggleMainSwitch());
        if (tvPowerBtn) tvPowerBtn.addEventListener('click', () => this.toggleTVPower());
        if (channelUpBtn) channelUpBtn.addEventListener('click', () => this.channelUp());
        if (channelDownBtn) channelDownBtn.addEventListener('click', () => this.channelDown());
        if (volumeUpBtn) volumeUpBtn.addEventListener('click', () => this.volumeUp());
        if (volumeDownBtn) volumeDownBtn.addEventListener('click', () => this.volumeDown());

        // Setup main switch interaction
        const mainSwitchElement = document.querySelector('.main-switch');
        if (mainSwitchElement) {
            mainSwitchElement.addEventListener('click', () => this.toggleMainSwitch());
        }

        this.updateStepInstruction();
    }

    plugCable() {
        if (this.currentStep !== 0) {
            this.showStepError();
            return;
        }

        this.isCablePlugged = true;
        this.currentStep++;
        
        // Update cable visual
        const cableVisual = document.querySelector('.cable-visual');
        const cableStatus = document.getElementById('cable-status');
        
        if (cableVisual) {
            cableVisual.textContent = '🔌➖➖🔌';
            cableVisual.style.color = '#00ff00';
        }
        
        if (cableStatus) {
            cableStatus.textContent = 'Terhubung';
            cableStatus.style.color = '#00ff00';
        }

        window.audioManager.playSFX('CLICK');
        this.showFeedback('Kabel berhasil dicolokkan ke stop kontak!', 'success');
        
        // Enable main switch button
        const mainSwitchBtn = document.getElementById('main-switch-btn');
        if (mainSwitchBtn) {
            mainSwitchBtn.disabled = false;
            mainSwitchBtn.classList.add('primary');
        }

        this.updateStepInstruction();
    }

    toggleMainSwitch() {
        if (this.currentStep !== 1) {
            this.showStepError();
            return;
        }

        if (!this.isCablePlugged) {
            this.showFeedback('Colokkan kabel terlebih dahulu!', 'error');
            return;
        }

        this.isMainSwitchOn = !this.isMainSwitchOn;
        
        if (this.isMainSwitchOn) {
            this.currentStep++;
            
            // Update switch visual
            const switchVisual = document.getElementById('main-switch-visual');
            const switchState = document.getElementById('main-switch-state');
            
            if (switchVisual) {
                switchVisual.style.color = '#00ff00';
                switchVisual.style.filter = 'drop-shadow(0 0 10px #00ff00)';
            }
            
            if (switchState) {
                switchState.textContent = 'ON';
                switchState.style.color = '#00ff00';
            }

            // Update power indicator
            const powerIndicator = document.getElementById('power-indicator');
            if (powerIndicator) {
                powerIndicator.textContent = '🟢';
                powerIndicator.classList.add('on');
            }

            window.audioManager.playSwitchOn();
            this.showFeedback('Saklar utama dinyalakan! Listrik mengalir ke TV.', 'success');
            
            // Enable TV power button
            const tvPowerBtn = document.getElementById('tv-power-btn');
            if (tvPowerBtn) {
                tvPowerBtn.disabled = false;
            }

            this.updateStepInstruction();
        } else {
            // Switch turned off
            const switchVisual = document.getElementById('main-switch-visual');
            const switchState = document.getElementById('main-switch-state');
            
            if (switchVisual) {
                switchVisual.style.color = '#666';
                switchVisual.style.filter = 'none';
            }
            
            if (switchState) {
                switchState.textContent = 'OFF';
                switchState.style.color = '#666';
            }

            window.audioManager.playSwitchOff();
        }
    }

    toggleTVPower() {
        if (this.currentStep !== 2) {
            this.showStepError();
            return;
        }

        if (!this.isCablePlugged || !this.isMainSwitchOn) {
            this.showFeedback('Pastikan kabel tercolok dan saklar utama menyala!', 'error');
            return;
        }

        this.isTVOn = !this.isTVOn;
        
        if (this.isTVOn) {
            this.currentStep++;
            this.turnOnTV();
            this.updateStepInstruction();
        } else {
            this.turnOffTV();
        }
    }

    turnOnTV() {
        // Hide off screen, show static
        const offScreen = document.getElementById('tv-off-screen');
        const staticScreen = document.getElementById('tv-static');
        
        if (offScreen) offScreen.style.display = 'none';
        if (staticScreen) staticScreen.style.display = 'block';

        // Enable channel controls
        const channelUpBtn = document.getElementById('channel-up-btn');
        const channelDownBtn = document.getElementById('channel-down-btn');
        const volumeUpBtn = document.getElementById('volume-up-btn');
        const volumeDownBtn = document.getElementById('volume-down-btn');

        [channelUpBtn, channelDownBtn, volumeUpBtn, volumeDownBtn].forEach(btn => {
            if (btn) btn.disabled = false;
        });

        window.audioManager.playTVOn();
        this.showFeedback('TV berhasil dinyalakan! Sekarang cari channel yang tepat.', 'success');
    }

    turnOffTV() {
        // Show off screen, hide others
        const offScreen = document.getElementById('tv-off-screen');
        const staticScreen = document.getElementById('tv-static');
        const contentScreen = document.getElementById('tv-content');
        
        if (offScreen) offScreen.style.display = 'flex';
        if (staticScreen) staticScreen.style.display = 'none';
        if (contentScreen) contentScreen.style.display = 'none';

        // Disable channel controls
        const controls = ['channel-up-btn', 'channel-down-btn', 'volume-up-btn', 'volume-down-btn'];
        controls.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = true;
        });

        this.currentChannel = 0;
        this.updateChannelDisplay();
    }

    channelUp() {
        if (!this.isTVOn) return;

        this.currentChannel = (this.currentChannel + 1) % 10;
        this.updateChannelDisplay();
        this.checkCorrectChannel();
        
        window.audioManager.playSFX('CLICK');
    }

    channelDown() {
        if (!this.isTVOn) return;

        this.currentChannel = (this.currentChannel - 1 + 10) % 10;
        this.updateChannelDisplay();
        this.checkCorrectChannel();
        
        window.audioManager.playSFX('CLICK');
    }

    volumeUp() {
        if (!this.isTVOn) return;
        // Volume control implementation
        window.audioManager.playSFX('CLICK');
    }

    volumeDown() {
        if (!this.isTVOn) return;
        // Volume control implementation
        window.audioManager.playSFX('CLICK');
    }

    updateChannelDisplay() {
        const channelDisplays = ['channel-display', 'current-channel-display'];
        channelDisplays.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = this.currentChannel;
        });
    }

    checkCorrectChannel() {
        if (this.currentChannel === this.correctChannel && this.currentStep === 3) {
            this.showCorrectChannel();
        } else {
            this.showChannelContent();
        }
    }

    showChannelContent() {
        const staticScreen = document.getElementById('tv-static');
        const contentScreen = document.getElementById('tv-content');
        const channelContent = document.getElementById('channel-content');
        
        if (staticScreen) staticScreen.style.display = 'none';
        if (contentScreen) contentScreen.style.display = 'block';

        if (channelContent) {
            const channelContents = [
                'Tidak ada sinyal',
                'Program berita lokal',
                'Acara musik',
                'REKAMAN RAHASIA ILMUWAN', // Correct channel
                'Film dokumenter',
                'Program olahraga',
                'Acara anak-anak',
                'Program masak',
                'Berita internasional',
                'Program edukasi'
            ];

            channelContent.textContent = channelContents[this.currentChannel] || 'Tidak ada sinyal';
            
            if (this.currentChannel === this.correctChannel) {
                channelContent.innerHTML = `
                    <div class="scientist-recording">
                        <h4>🔬 REKAMAN ILMUWAN</h4>
                        <p>"Jika kau menemukan ini, berarti kau berhasil menghidupkan ruang tamuku. 
                        Carilah kunci energi, hanya itu yang bisa membuka jalanmu ke ruangan lain. 
                        Ingat, gunakan listrik dengan bijak!"</p>
                    </div>
                `;
            }
        }
    }

    showCorrectChannel() {
        this.isChannelSet = true;
        this.showChannelContent();
        
        // Play scientist recording
        window.audioManager.playNarration('SCIENTIST_MESSAGE');
        
        // Show success feedback
        this.showFeedback('Channel yang tepat! Rekaman ilmuwan ditemukan.', 'success');
        
        // Complete puzzle after message
        setTimeout(() => {
            this.completePuzzle();
        }, 5000);
    }

    completePuzzle() {
        this.isCompleted = true;
        
        window.audioManager.playSuccessSound();
        
        const completionMessage = `
            <div class="completion-message">
                <h3>🎉 Puzzle TV Selesai!</h3>
                <p>Kamu telah berhasil:</p>
                <ul>
                    <li>✅ Mencolokkan kabel dengan benar</li>
                    <li>✅ Menyalakan saklar utama</li>
                    <li>✅ Mengoperasikan TV</li>
                    <li>✅ Menemukan channel rahasia</li>
                </ul>
                <p><strong>Pesan Ilmuwan:</strong> Carilah kunci energi untuk membuka jalan ke ruangan lain!</p>
            </div>
        `;

        this.showFeedback(completionMessage, 'success', 8000);

        // Award energy key and show educational content
        setTimeout(() => {
            this.showEducationalContent();
        }, 3000);
    }

    showEducationalContent() {
        const content = `
            <h3>Pembelajaran: Pengoperasian Perangkat Listrik</h3>
            <h4>Yang telah dipelajari:</h4>
            <ul>
                <li><strong>Urutan Pengoperasian:</strong> Kabel → Saklar Utama → Power → Kontrol</li>
                <li><strong>Keamanan Listrik:</strong> Pastikan semua perangkat mendapat aliran listrik dengan benar</li>
                <li><strong>Troubleshooting:</strong> Periksa koneksi jika perangkat tidak menyala</li>
            </ul>
            
            <h4>Aplikasi di Kehidupan Nyata:</h4>
            <ul>
                <li>Selalu periksa koneksi listrik sebelum menggunakan perangkat</li>
                <li>Ikuti urutan yang benar saat menyalakan perangkat elektronik</li>
                <li>Matikan perangkat dari saklar utama untuk keamanan</li>
            </ul>
            
            <p><strong>Pesan Penting:</strong> Pemahaman urutan pengoperasian perangkat listrik sangat penting untuk keamanan dan efisiensi energi.</p>
        `;

        window.uiManager.showEducationalPanel('Pembelajaran TV Puzzle', content);
    }

    updateStepInstruction() {
        const stepNumber = document.getElementById('step-number');
        const stepInstruction = document.getElementById('step-instruction');
        
        if (stepNumber) stepNumber.textContent = this.currentStep + 1;
        if (stepInstruction && this.currentStep < this.steps.length) {
            stepInstruction.textContent = this.steps[this.currentStep].instruction;
        }
    }

    showStepError() {
        const currentInstruction = this.steps[this.currentStep]?.instruction || 'Ikuti urutan yang benar!';
        this.showFeedback(`${GAME_CONSTANTS.MESSAGES.ERRORS.FOLLOW_SEQUENCE} ${currentInstruction}`, 'error');
        window.audioManager.playErrorSound();
    }

    showTutorial() {
        const tutorial = `
            <h3>Tutorial TV Puzzle</h3>
            <p>Ikuti urutan yang benar untuk menyalakan TV dan menemukan rekaman ilmuwan</p>
            
            <h4>Urutan Langkah:</h4>
            <ol>
                <li><strong>Colok Kabel:</strong> Hubungkan TV ke stop kontak</li>
                <li><strong>Saklar Utama:</strong> Nyalakan aliran listrik utama</li>
                <li><strong>Power TV:</strong> Tekan tombol power untuk menyalakan TV</li>
                <li><strong>Cari Channel:</strong> Gunakan CH+ dan CH- untuk mencari channel 3</li>
            </ol>
            
            <h4>Tips:</h4>
            <ul>
                <li>Ikuti urutan dengan tepat - tidak bisa melompat langkah</li>
                <li>Perhatikan indikator visual untuk konfirmasi setiap langkah</li>
                <li>Channel 3 berisi rekaman rahasia ilmuwan</li>
            </ul>
        `;

        window.uiManager.showEducationalPanel('Tutorial TV', tutorial);
    }

    showFeedback(message, type, duration = 3000) {
        const feedbackElement = document.getElementById('tv-puzzle-feedback');
        if (feedbackElement) {
            feedbackElement.innerHTML = typeof message === 'string' ? `<p>${message}</p>` : message;
            feedbackElement.className = `puzzle-feedback ${type}`;
        }

        if (typeof message === 'string') {
            window.uiManager.showToast(message, type, duration);
        }
    }

    resetPuzzle() {
        this.currentStep = 0;
        this.isCablePlugged = false;
        this.isMainSwitchOn = false;
        this.isTVOn = false;
        this.isChannelSet = false;
        this.isCompleted = false;
        this.currentChannel = 0;

        // Reset all visuals
        this.resetVisualState();
        this.updateStepInstruction();
        
        this.showFeedback('Puzzle TV direset. Mulai dari awal!', 'info');
    }

    resetVisualState() {
        // Reset cable
        const cableVisual = document.querySelector('.cable-visual');
        const cableStatus = document.getElementById('cable-status');
        if (cableVisual) {
            cableVisual.textContent = '🔌➖➖➖';
            cableVisual.style.color = '#666';
        }
        if (cableStatus) {
            cableStatus.textContent = 'Terlepas';
            cableStatus.style.color = '#666';
        }

        // Reset switch
        const switchVisual = document.getElementById('main-switch-visual');
        const switchState = document.getElementById('main-switch-state');
        if (switchVisual) {
            switchVisual.style.color = '#666';
            switchVisual.style.filter = 'none';
        }
        if (switchState) {
            switchState.textContent = 'OFF';
            switchState.style.color = '#666';
        }

        // Reset TV
        this.turnOffTV();
        
        // Reset power indicator
        const powerIndicator = document.getElementById('power-indicator');
        if (powerIndicator) {
            powerIndicator.textContent = '⭕';
            powerIndicator.classList.remove('on');
        }

        // Disable buttons
        const buttonsToDisable = ['main-switch-btn', 'tv-power-btn', 'channel-up-btn', 'channel-down-btn', 'volume-up-btn', 'volume-down-btn'];
        buttonsToDisable.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = true;
                btn.classList.remove('primary');
            }
        });

        // Enable only plug cable button
        const plugCableBtn = document.getElementById('plug-cable-btn');
        if (plugCableBtn) {
            plugCableBtn.disabled = false;
            plugCableBtn.classList.add('primary');
        }
    }

    removePuzzleUI() {
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.style.display = 'none';
            puzzleOverlay.innerHTML = '';
        }
    }

    // Public interface
    isPuzzleCompleted() {
        return this.isCompleted;
    }

    resetPuzzleState() {
        this.resetPuzzle();
    }

    destroy() {
        this.deactivate();
    }
}

// Export for global access
window.TVPuzzle = TVPuzzle;