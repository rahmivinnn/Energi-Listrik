// Energy Quest: Kitchen Efficiency Puzzle Implementation
// Level 2 - Energy Efficiency Management

class KitchenPuzzle {
    constructor() {
        this.isCompleted = false;
        this.isActive = false;
        this.targetEfficiency = 0.7; // 70%
        this.currentEfficiency = 0.5;
        this.totalConsumption = 0;
        
        // Kitchen state
        this.appliances = new Map();
        this.environmentalFactors = {
            isLightOn: true,
            isWindowOpen: false,
            fridgeDoorOpenTime: 0,
            fridgeDoorTimer: 0
        };
        
        this.setupAppliances();
        this.updateTimer = null;
        
        console.log('Kitchen Puzzle initialized');
    }

    setupAppliances() {
        const applianceData = GAME_CONSTANTS.APPLIANCES;
        
        this.appliances.set('refrigerator', {
            ...applianceData.REFRIGERATOR,
            isOn: true, // Always on
            isEssential: true,
            element: null
        });
        
        this.appliances.set('rice_cooker', {
            ...applianceData.RICE_COOKER,
            isOn: false,
            isEssential: false,
            element: null
        });
        
        this.appliances.set('microwave', {
            ...applianceData.MICROWAVE,
            isOn: false,
            isEssential: false,
            element: null
        });
        
        this.appliances.set('blender', {
            ...applianceData.BLENDER,
            isOn: false,
            isEssential: false,
            element: null
        });
        
        this.appliances.set('fan', {
            ...applianceData.FAN,
            isOn: false,
            isEssential: false,
            element: null
        });
        
        this.appliances.set('lamp', {
            ...applianceData.LED_LAMP,
            name: 'Lampu Dapur',
            isOn: true,
            isEssential: false,
            element: null
        });
    }

    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.createPuzzleUI();
        this.setupInteractions();
        this.startEfficiencyMonitoring();
        this.showTutorial();
        
        console.log('Kitchen puzzle activated');
    }

    deactivate() {
        this.isActive = false;
        this.stopEfficiencyMonitoring();
        this.removePuzzleUI();
        console.log('Kitchen puzzle deactivated');
    }

    createPuzzleUI() {
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (!puzzleOverlay) return;

        puzzleOverlay.style.display = 'flex';
        puzzleOverlay.innerHTML = `
            <div class="kitchen-puzzle-container">
                <div class="puzzle-header">
                    <h3>🍳 Manajemen Efisiensi Dapur</h3>
                    <p>Kelola perangkat dapur untuk mencapai efisiensi optimal</p>
                </div>
                
                <div class="kitchen-layout">
                    <div class="appliances-section">
                        <h4>Peralatan Dapur</h4>
                        <div class="appliance-grid">
                            <div class="appliance-item" data-appliance="refrigerator">
                                <div class="appliance-icon">🧊</div>
                                <div class="appliance-info">
                                    <div class="appliance-name">Kulkas</div>
                                    <div class="appliance-power">150W</div>
                                    <div class="appliance-status on">WAJIB HIDUP</div>
                                </div>
                                <button class="appliance-toggle" disabled>ON</button>
                            </div>
                            
                            <div class="appliance-item" data-appliance="rice_cooker">
                                <div class="appliance-icon">🍚</div>
                                <div class="appliance-info">
                                    <div class="appliance-name">Rice Cooker</div>
                                    <div class="appliance-power">400W</div>
                                    <div class="appliance-status off">MATI</div>
                                </div>
                                <button class="appliance-toggle" data-appliance="rice_cooker">ON/OFF</button>
                            </div>
                            
                            <div class="appliance-item" data-appliance="microwave">
                                <div class="appliance-icon">📦</div>
                                <div class="appliance-info">
                                    <div class="appliance-name">Microwave</div>
                                    <div class="appliance-power">800W</div>
                                    <div class="appliance-status off">MATI</div>
                                </div>
                                <button class="appliance-toggle" data-appliance="microwave">ON/OFF</button>
                            </div>
                            
                            <div class="appliance-item" data-appliance="blender">
                                <div class="appliance-icon">🥤</div>
                                <div class="appliance-info">
                                    <div class="appliance-name">Blender</div>
                                    <div class="appliance-power">300W</div>
                                    <div class="appliance-status off">MATI</div>
                                </div>
                                <button class="appliance-toggle" data-appliance="blender">ON/OFF</button>
                            </div>
                            
                            <div class="appliance-item" data-appliance="fan">
                                <div class="appliance-icon">🌀</div>
                                <div class="appliance-info">
                                    <div class="appliance-name">Kipas Angin</div>
                                    <div class="appliance-power">75W</div>
                                    <div class="appliance-status off">MATI</div>
                                </div>
                                <button class="appliance-toggle" data-appliance="fan">ON/OFF</button>
                            </div>
                            
                            <div class="appliance-item" data-appliance="lamp">
                                <div class="appliance-icon">💡</div>
                                <div class="appliance-info">
                                    <div class="appliance-name">Lampu Dapur</div>
                                    <div class="appliance-power">10W</div>
                                    <div class="appliance-status on">HIDUP</div>
                                </div>
                                <button class="appliance-toggle" data-appliance="lamp">ON/OFF</button>
                            </div>
                        </div>
                    </div>

                    <div class="environmental-controls">
                        <h4>Kontrol Lingkungan</h4>
                        
                        <div class="control-group">
                            <div class="control-item">
                                <div class="control-icon">🪟</div>
                                <div class="control-info">
                                    <div class="control-name">Jendela</div>
                                    <div class="control-benefit">Cahaya alami gratis</div>
                                </div>
                                <button id="window-toggle" class="control-btn">Buka</button>
                            </div>
                            
                            <div class="control-item">
                                <div class="control-icon">🚪</div>
                                <div class="control-info">
                                    <div class="control-name">Pintu Kulkas</div>
                                    <div class="control-benefit">Tutup cepat = hemat energi</div>
                                </div>
                                <div class="fridge-control">
                                    <input type="range" id="fridge-door-slider" min="0" max="100" value="0">
                                    <span id="fridge-status">Tertutup</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="efficiency-display">
                    <div class="efficiency-meter">
                        <h4>Efisiensi Energi</h4>
                        <div class="meter-container">
                            <div class="meter-bar">
                                <div class="meter-fill" id="kitchen-meter-fill" style="width: 50%"></div>
                            </div>
                            <div class="meter-labels">
                                <span class="label-left">BOROS</span>
                                <span class="label-center">SEDANG</span>
                                <span class="label-right">HEMAT</span>
                            </div>
                        </div>
                        <div class="efficiency-status" id="kitchen-efficiency-status">SEDANG (50%)</div>
                    </div>
                    
                    <div class="consumption-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total Konsumsi:</span>
                            <span class="stat-value" id="total-consumption">160W</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Efisiensi:</span>
                            <span class="stat-value" id="efficiency-percentage">50%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Target:</span>
                            <span class="stat-value">≥70% (HEMAT)</span>
                        </div>
                    </div>
                </div>

                <div class="kitchen-tips">
                    <h4>💡 Tips Hemat Energi:</h4>
                    <ul>
                        <li>Buka jendela untuk cahaya alami, matikan lampu</li>
                        <li>Tutup pintu kulkas dengan cepat</li>
                        <li>Gunakan peralatan seperlunya</li>
                        <li>Matikan peralatan yang tidak digunakan</li>
                    </ul>
                </div>
            </div>
        `;

        this.addKitchenPuzzleStyles();
    }

    addKitchenPuzzleStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .kitchen-puzzle-container {
                background: rgba(26, 26, 46, 0.95);
                border: 2px solid rgba(0, 255, 255, 0.5);
                border-radius: 15px;
                padding: 30px;
                max-width: 95%;
                max-height: 95%;
                overflow-y: auto;
            }

            .kitchen-layout {
                display: flex;
                gap: 30px;
                margin: 20px 0;
            }

            .appliances-section {
                flex: 2;
            }

            .appliance-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }

            .appliance-item {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                transition: all 0.3s ease;
            }

            .appliance-item:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(0, 255, 255, 0.5);
            }

            .appliance-icon {
                font-size: 2.5rem;
                margin-bottom: 10px;
            }

            .appliance-name {
                font-weight: bold;
                color: #ffffff;
                margin-bottom: 5px;
            }

            .appliance-power {
                font-size: 0.9rem;
                color: #cccccc;
                margin-bottom: 8px;
            }

            .appliance-status {
                font-size: 0.9rem;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .appliance-status.on {
                color: #00ff00;
            }

            .appliance-status.off {
                color: #ff4444;
            }

            .appliance-toggle {
                background: #444;
                border: 1px solid #666;
                color: #fff;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                width: 100%;
            }

            .appliance-toggle:enabled:hover {
                background: #555;
                border-color: #00ffff;
            }

            .appliance-toggle:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .appliance-toggle.on {
                background: #006600;
                border-color: #00ff00;
            }

            .environmental-controls {
                flex: 1;
            }

            .control-group {
                margin-top: 15px;
            }

            .control-item {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .control-icon {
                font-size: 2rem;
            }

            .control-info {
                flex: 1;
            }

            .control-name {
                font-weight: bold;
                color: #ffffff;
                margin-bottom: 5px;
            }

            .control-benefit {
                font-size: 0.8rem;
                color: #cccccc;
            }

            .control-btn {
                background: #444;
                border: 1px solid #666;
                color: #fff;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 80px;
            }

            .control-btn:hover {
                background: #555;
                border-color: #00ffff;
            }

            .control-btn.active {
                background: #006600;
                border-color: #00ff00;
            }

            .fridge-control {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .fridge-control input[type="range"] {
                flex: 1;
                min-width: 100px;
            }

            .fridge-control span {
                min-width: 80px;
                font-size: 0.9rem;
            }

            .efficiency-display {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
            }

            .efficiency-meter h4 {
                color: #00ffff;
                text-align: center;
                margin-bottom: 15px;
            }

            .meter-container {
                margin-bottom: 15px;
            }

            .meter-bar {
                width: 100%;
                height: 25px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                overflow: hidden;
                position: relative;
            }

            .meter-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff4444 0%, #ffff44 50%, #44ff44 100%);
                border-radius: 12px;
                transition: width 0.5s ease;
                position: relative;
            }

            .meter-labels {
                display: flex;
                justify-content: space-between;
                margin-top: 5px;
                font-size: 0.8rem;
                color: #cccccc;
            }

            .efficiency-status {
                text-align: center;
                font-size: 1.2rem;
                font-weight: bold;
                margin-top: 10px;
            }

            .consumption-stats {
                display: flex;
                justify-content: space-around;
                text-align: center;
            }

            .stat-item {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .stat-label {
                font-size: 0.9rem;
                color: #cccccc;
            }

            .stat-value {
                font-size: 1.1rem;
                font-weight: bold;
                color: #00ffff;
            }

            .kitchen-tips {
                background: rgba(0, 100, 0, 0.1);
                border: 1px solid rgba(0, 255, 0, 0.3);
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
            }

            .kitchen-tips h4 {
                color: #00ff00;
                margin-bottom: 15px;
            }

            .kitchen-tips ul {
                margin-left: 20px;
            }

            .kitchen-tips li {
                color: #cccccc;
                margin-bottom: 8px;
                line-height: 1.4;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .kitchen-layout {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .appliance-grid {
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                }
                
                .appliance-item {
                    padding: 10px;
                }
                
                .appliance-icon {
                    font-size: 2rem;
                }
                
                .control-item {
                    flex-direction: column;
                    text-align: center;
                    gap: 10px;
                }
                
                .consumption-stats {
                    flex-direction: column;
                    gap: 10px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    setupInteractions() {
        // Setup appliance toggles
        document.querySelectorAll('.appliance-toggle').forEach(button => {
            if (!button.disabled) {
                const appliance = button.dataset.appliance;
                button.addEventListener('click', () => this.toggleAppliance(appliance));
            }
        });

        // Setup environmental controls
        const windowToggle = document.getElementById('window-toggle');
        const fridgeSlider = document.getElementById('fridge-door-slider');

        if (windowToggle) {
            windowToggle.addEventListener('click', () => this.toggleWindow());
        }

        if (fridgeSlider) {
            fridgeSlider.addEventListener('input', (e) => this.updateFridgeDoor(e.target.value));
        }

        // Setup lamp toggle (special case - affected by window)
        const lampItem = document.querySelector('[data-appliance="lamp"]');
        if (lampItem) {
            lampItem.addEventListener('click', () => this.toggleLamp());
        }

        this.updateAllVisuals();
    }

    toggleAppliance(applianceKey) {
        const appliance = this.appliances.get(applianceKey);
        if (!appliance) return;

        if (appliance.isEssential && appliance.isOn) {
            this.showFeedback(`${appliance.name} ${GAME_CONSTANTS.MESSAGES.ERRORS.ESSENTIAL_APPLIANCE} dapur.`, 'error');
            return;
        }

        appliance.isOn = !appliance.isOn;
        this.updateApplianceVisual(applianceKey);
        this.calculateEfficiency();
        
        // Play sound
        if (appliance.isOn) {
            window.audioManager.playApplianceOn();
        } else {
            window.audioManager.playSwitchOff();
        }

        // Show educational feedback
        this.showApplianceFeedback(appliance);
    }

    toggleLamp() {
        const lamp = this.appliances.get('lamp');
        if (!lamp) return;

        lamp.isOn = !lamp.isOn;
        this.updateApplianceVisual('lamp');
        this.calculateEfficiency();
        
        // Special feedback for lamp + window combination
        if (!lamp.isOn && this.environmentalFactors.isWindowOpen) {
            this.showFeedback(GAME_CONSTANTS.MESSAGES.SUCCESS.NATURAL_LIGHT, 'success');
        } else if (lamp.isOn && this.environmentalFactors.isWindowOpen) {
            this.showFeedback('Jendela terbuka tapi lampu masih menyala. Pertimbangkan untuk mematikan lampu.', 'warning');
        }

        window.audioManager.playSwitchOn();
    }

    toggleWindow() {
        this.environmentalFactors.isWindowOpen = !this.environmentalFactors.isWindowOpen;
        
        const windowBtn = document.getElementById('window-toggle');
        if (windowBtn) {
            if (this.environmentalFactors.isWindowOpen) {
                windowBtn.textContent = 'Tutup';
                windowBtn.classList.add('active');
                this.showFeedback('Jendela dibuka! Cahaya alami masuk, bisa matikan lampu.', 'success');
            } else {
                windowBtn.textContent = 'Buka';
                windowBtn.classList.remove('active');
                this.showFeedback('Jendela ditutup. Mungkin perlu menyalakan lampu.', 'info');
            }
        }

        this.calculateEfficiency();
        window.audioManager.playSFX('CLICK');
    }

    updateFridgeDoor(value) {
        const fridgeOpenPercentage = parseInt(value);
        const fridgeStatus = document.getElementById('fridge-status');
        
        if (fridgeOpenPercentage === 0) {
            if (fridgeStatus) fridgeStatus.textContent = 'Tertutup';
            if (this.environmentalFactors.fridgeDoorOpenTime > 0) {
                this.showFeedback(GAME_CONSTANTS.MESSAGES.SUCCESS.QUICK_FRIDGE_CLOSE, 'success');
            }
            this.environmentalFactors.fridgeDoorOpenTime = 0;
        } else {
            if (fridgeStatus) fridgeStatus.textContent = `Terbuka ${fridgeOpenPercentage}%`;
            this.environmentalFactors.fridgeDoorOpenTime += 0.1; // Simulate time passing
            
            if (this.environmentalFactors.fridgeDoorOpenTime > 5) {
                this.showFeedback('Pintu kulkas terlalu lama terbuka! Energi terbuang.', 'error');
            }
        }

        this.calculateEfficiency();
    }

    updateApplianceVisual(applianceKey) {
        const appliance = this.appliances.get(applianceKey);
        const element = document.querySelector(`[data-appliance="${applianceKey}"]`);
        
        if (!appliance || !element) return;

        const status = element.querySelector('.appliance-status');
        const toggle = element.querySelector('.appliance-toggle');
        const icon = element.querySelector('.appliance-icon');

        if (status) {
            status.textContent = appliance.isOn ? 'HIDUP' : 'MATI';
            status.className = `appliance-status ${appliance.isOn ? 'on' : 'off'}`;
        }

        if (toggle && !toggle.disabled) {
            toggle.className = `appliance-toggle ${appliance.isOn ? 'on' : ''}`;
        }

        if (icon) {
            icon.style.filter = appliance.isOn ? 'drop-shadow(0 0 10px #ffff00)' : 'none';
        }
    }

    updateAllVisuals() {
        this.appliances.forEach((appliance, key) => {
            this.updateApplianceVisual(key);
        });
    }

    calculateEfficiency() {
        // Calculate total power consumption
        this.totalConsumption = 0;
        let optimalConsumption = 0;

        this.appliances.forEach(appliance => {
            if (appliance.isOn) {
                this.totalConsumption += appliance.power;
            }
            
            if (appliance.isEssential) {
                optimalConsumption += appliance.power;
            }
        });

        // Environmental factors
        if (this.environmentalFactors.isLightOn && this.environmentalFactors.isWindowOpen) {
            this.totalConsumption += 10; // Penalty for unnecessary lighting
        }

        if (this.environmentalFactors.fridgeDoorOpenTime > 3) {
            this.totalConsumption += 50 * (this.environmentalFactors.fridgeDoorOpenTime / 10);
        }

        // Calculate efficiency
        optimalConsumption += 50; // Base optimal consumption
        this.currentEfficiency = GAME_UTILS.calculateEfficiencyPercentage(this.totalConsumption, optimalConsumption) / 100;

        // Update UI
        this.updateEfficiencyDisplay();

        // Check for completion
        if (this.currentEfficiency >= this.targetEfficiency && this.isOptimalConfiguration()) {
            this.completePuzzle();
        }
    }

    isOptimalConfiguration() {
        const lamp = this.appliances.get('lamp');
        
        // Optimal: window open + lamp off, or window closed + lamp on
        const lightingOptimal = (this.environmentalFactors.isWindowOpen && !lamp.isOn) || 
                               (!this.environmentalFactors.isWindowOpen && lamp.isOn);
        
        // Fridge door should be closed or quickly used
        const fridgeOptimal = this.environmentalFactors.fridgeDoorOpenTime < 3;
        
        // Non-essential appliances should be used reasonably
        let appliancesOptimal = true;
        this.appliances.forEach(appliance => {
            if (!appliance.isEssential && appliance.isOn && appliance.power > 500) {
                appliancesOptimal = false;
            }
        });

        return lightingOptimal && fridgeOptimal && appliancesOptimal;
    }

    updateEfficiencyDisplay() {
        const meterFill = document.getElementById('kitchen-meter-fill');
        const efficiencyStatus = document.getElementById('kitchen-efficiency-status');
        const totalConsumptionElement = document.getElementById('total-consumption');
        const efficiencyPercentageElement = document.getElementById('efficiency-percentage');

        if (meterFill) {
            const percentage = this.currentEfficiency * 100;
            meterFill.style.width = `${percentage}%`;
        }

        if (efficiencyStatus) {
            const percentage = Math.round(this.currentEfficiency * 100);
            let status, color;
            
            if (percentage >= 70) {
                status = 'HEMAT';
                color = '#44ff44';
            } else if (percentage >= 40) {
                status = 'SEDANG';
                color = '#ffff44';
            } else {
                status = 'BOROS';
                color = '#ff4444';
            }
            
            efficiencyStatus.textContent = `${status} (${percentage}%)`;
            efficiencyStatus.style.color = color;
        }

        if (totalConsumptionElement) {
            totalConsumptionElement.textContent = `${Math.round(this.totalConsumption)}W`;
        }

        if (efficiencyPercentageElement) {
            efficiencyPercentageElement.textContent = `${Math.round(this.currentEfficiency * 100)}%`;
        }

        // Update main game power meter
        window.uiManager.updatePowerMeter(this.currentEfficiency);
    }

    showApplianceFeedback(appliance) {
        let message = '';
        let type = 'info';

        if (appliance.isOn) {
            if (appliance.power > 500) {
                message = `${appliance.name} mengonsumsi daya tinggi (${appliance.power}W). Gunakan seperlunya.`;
                type = 'warning';
            } else if (appliance.power < 100) {
                message = `${appliance.name} hemat energi (${appliance.power}W). Pilihan yang baik!`;
                type = 'success';
            } else {
                message = `${appliance.name} dinyalakan (${appliance.power}W).`;
                type = 'info';
            }
        } else {
            message = `${appliance.name} dimatikan untuk menghemat energi.`;
            type = 'success';
        }

        this.showFeedback(message, type);
    }

    completePuzzle() {
        if (this.isCompleted) return;
        
        this.isCompleted = true;
        
        window.audioManager.playSuccessSound();
        
        const completionMessage = `
            <div class="completion-message">
                <h3>🎉 Dapur Efisien Tercapai!</h3>
                <p><strong>Efisiensi:</strong> ${Math.round(this.currentEfficiency * 100)}%</p>
                <p><strong>Konsumsi:</strong> ${Math.round(this.totalConsumption)}W</p>
                
                <h4>Strategi yang berhasil:</h4>
                <ul>
                    <li>${this.environmentalFactors.isWindowOpen ? '✅' : '❌'} Memanfaatkan cahaya alami</li>
                    <li>${this.environmentalFactors.fridgeDoorOpenTime < 3 ? '✅' : '❌'} Mengelola kulkas dengan baik</li>
                    <li>✅ Menggunakan perangkat seperlunya</li>
                </ul>
                
                <p>🎵 <em>Mendengar suara radio...</em></p>
            </div>
        `;

        this.showFeedback(completionMessage, 'success', 8000);

        // Play radio message
        setTimeout(() => {
            this.playRadioMessage();
        }, 3000);

        // Award energy key
        setTimeout(() => {
            window.uiManager.collectEnergyKey(1);
        }, 6000);
    }

    playRadioMessage() {
        const radioMessage = `
            <div class="radio-message">
                <h3>📻 Pesan Radio dari Ilmuwan</h3>
                <div class="radio-static">📻 *kresek kresek*</div>
                <p><em>"Efisiensi adalah kunci. Jangan boros, karena energi terbatas. 
                Kamu telah memahami pentingnya menghemat energi. Lanjutkan ke laboratorium untuk tantangan berikutnya."</em></p>
                <p><strong>Pintu ke laboratorium terbuka!</strong></p>
            </div>
        `;

        this.showFeedback(radioMessage, 'success', 10000);
        window.audioManager.playNarration('SCIENTIST_MESSAGE');
    }

    startEfficiencyMonitoring() {
        this.updateTimer = setInterval(() => {
            if (this.environmentalFactors.fridgeDoorOpenTime > 0) {
                this.environmentalFactors.fridgeDoorTimer += 0.1;
            }
            this.calculateEfficiency();
        }, 100);
    }

    stopEfficiencyMonitoring() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    showTutorial() {
        const tutorial = `
            <h3>Tutorial Efisiensi Dapur</h3>
            <p>Kelola perangkat dapur untuk mencapai efisiensi ≥70%</p>
            
            <h4>Tujuan:</h4>
            <ul>
                <li>Jaga Power Meter tetap di zona HIJAU (≥70%)</li>
                <li>Manfaatkan cahaya alami dengan membuka jendela</li>
                <li>Gunakan perangkat seperlunya</li>
                <li>Tutup kulkas dengan cepat</li>
            </ul>
            
            <h4>Strategi Hemat Energi:</h4>
            <ul>
                <li><strong>Pencahayaan:</strong> Buka jendela di siang hari, matikan lampu</li>
                <li><strong>Kulkas:</strong> Buka seperlunya, tutup dengan cepat</li>
                <li><strong>Peralatan:</strong> Nyalakan hanya saat dibutuhkan</li>
                <li><strong>Prioritas:</strong> Kulkas harus tetap menyala (esensial)</li>
            </ul>
            
            <p><strong>Target:</strong> Capai efisiensi ≥70% untuk melanjutkan ke level berikutnya!</p>
        `;

        window.uiManager.showEducationalPanel('Tutorial Dapur', tutorial);
    }

    showFeedback(message, type, duration = 3000) {
        const feedbackElement = document.querySelector('.kitchen-puzzle-container .puzzle-feedback');
        if (feedbackElement) {
            feedbackElement.innerHTML = typeof message === 'string' ? `<p>${message}</p>` : message;
        }

        if (typeof message === 'string') {
            window.uiManager.showToast(message, type, duration);
        }
    }

    resetPuzzle() {
        // Reset appliances
        this.appliances.forEach(appliance => {
            appliance.isOn = appliance.isEssential;
        });

        // Reset environmental factors
        this.environmentalFactors = {
            isLightOn: true,
            isWindowOpen: false,
            fridgeDoorOpenTime: 0,
            fridgeDoorTimer: 0
        };

        // Reset UI
        const fridgeSlider = document.getElementById('fridge-door-slider');
        const windowBtn = document.getElementById('window-toggle');

        if (fridgeSlider) fridgeSlider.value = 0;
        if (windowBtn) {
            windowBtn.textContent = 'Buka';
            windowBtn.classList.remove('active');
        }

        this.updateAllVisuals();
        this.calculateEfficiency();
        this.isCompleted = false;
        
        this.showFeedback('Dapur direset. Coba strategi baru!', 'info');
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

    getCurrentEfficiency() {
        return this.currentEfficiency;
    }

    destroy() {
        this.stopEfficiencyMonitoring();
        this.deactivate();
    }
}

// Export for global access
window.KitchenPuzzle = KitchenPuzzle;