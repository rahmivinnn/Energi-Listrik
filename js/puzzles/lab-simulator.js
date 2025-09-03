// Energy Quest: Laboratory Simulator Implementation
// Level 3 - Electricity Bill Simulation

class LabSimulator {
    constructor() {
        this.isCompleted = false;
        this.isActive = false;
        this.targetBill = GAME_CONSTANTS.TARGET_MONTHLY_BILL; // Rp 300,000
        this.currentBill = 0;
        this.currentKwh = 0;
        
        this.houseAppliances = [];
        this.simulationRunning = false;
        
        this.initializeAppliances();
        console.log('Lab Simulator initialized');
    }

    initializeAppliances() {
        const appliances = GAME_CONSTANTS.APPLIANCES;
        
        this.houseAppliances = [
            { ...appliances.REFRIGERATOR, isOn: true, hours: 24 }, // Essential
            { ...appliances.LED_LAMP, name: 'Lampu Ruang Tamu', isOn: false, hours: 8 },
            { ...appliances.LED_LAMP, name: 'Lampu Kamar', power: 40, isOn: false, hours: 6 },
            { ...appliances.AIR_CONDITIONER, isOn: false, hours: 8 },
            { ...appliances.TV, isOn: false, hours: 6 },
            { ...appliances.RICE_COOKER, isOn: false, hours: 2 },
            { ...appliances.IRON, isOn: false, hours: 1 },
            { ...appliances.FAN, isOn: false, hours: 10 },
            { ...appliances.MICROWAVE, isOn: false, hours: 0.5 },
            { ...appliances.PHONE_CHARGER, isOn: false, hours: 4 }
        ];
    }

    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.createSimulatorUI();
        this.setupInteractions();
        this.calculateInitialBill();
        this.showTutorial();
        
        console.log('Lab Simulator activated');
    }

    deactivate() {
        this.isActive = false;
        this.removePuzzleUI();
        console.log('Lab Simulator deactivated');
    }

    createSimulatorUI() {
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (!puzzleOverlay) return;

        puzzleOverlay.style.display = 'flex';
        puzzleOverlay.innerHTML = `
            <div class="lab-simulator-container">
                <div class="simulator-header">
                    <h3>🧪 Simulator Tagihan Listrik</h3>
                    <p>Atur penggunaan perangkat rumah untuk mencapai target ≤ Rp 300,000/bulan</p>
                </div>
                
                <div class="simulator-layout">
                    <div class="appliances-panel">
                        <h4>🏠 Perangkat Rumah Tangga</h4>
                        <div class="appliances-list" id="appliances-list">
                            <!-- Appliances will be populated by JavaScript -->
                        </div>
                    </div>

                    <div class="calculation-panel">
                        <div class="formula-section">
                            <h4>📐 Formula Energi</h4>
                            <div class="formula-display">
                                <div class="formula-main">E = (P × t) / 1000</div>
                                <div class="formula-explanation">
                                    <div><strong>E</strong> = Energi (kWh)</div>
                                    <div><strong>P</strong> = Daya (Watt)</div>
                                    <div><strong>t</strong> = Waktu (jam/hari)</div>
                                </div>
                            </div>
                            <button id="show-formula-detail" class="info-btn">📖 Detail Formula</button>
                        </div>

                        <div class="results-section">
                            <h4>📊 Hasil Simulasi</h4>
                            <div class="results-display">
                                <div class="result-item major">
                                    <div class="result-label">Konsumsi Bulanan</div>
                                    <div class="result-value" id="monthly-kwh">0 kWh</div>
                                </div>
                                <div class="result-item major">
                                    <div class="result-label">Tagihan Bulanan</div>
                                    <div class="result-value" id="monthly-bill">Rp 0</div>
                                </div>
                                <div class="result-item">
                                    <div class="result-label">Target</div>
                                    <div class="result-value target">≤ Rp 300,000</div>
                                </div>
                                <div class="result-item">
                                    <div class="result-label">Status</div>
                                    <div class="result-value" id="bill-status">-</div>
                                </div>
                            </div>
                            
                            <div class="bill-meter">
                                <div class="meter-track">
                                    <div class="meter-progress" id="bill-meter-progress"></div>
                                    <div class="meter-target-line"></div>
                                </div>
                                <div class="meter-labels">
                                    <span>Rp 0</span>
                                    <span class="target-label">Target: Rp 300k</span>
                                    <span>Rp 500k+</span>
                                </div>
                            </div>
                        </div>

                        <div class="control-section">
                            <div class="simulator-controls">
                                <button id="calculate-btn" class="sim-btn primary">🧮 Hitung Tagihan</button>
                                <button id="optimize-btn" class="sim-btn secondary">💡 Optimasi</button>
                                <button id="reset-sim-btn" class="sim-btn secondary">🔄 Reset</button>
                            </div>
                            
                            <div class="quick-scenarios">
                                <h5>Skenario Cepat:</h5>
                                <button id="scenario-minimal" class="scenario-btn">🟢 Minimal</button>
                                <button id="scenario-normal" class="scenario-btn">🟡 Normal</button>
                                <button id="scenario-comfort" class="scenario-btn">🔴 Nyaman</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="optimization-panel" id="optimization-panel" style="display: none;">
                    <h4>💡 Saran Optimasi</h4>
                    <div id="optimization-content">
                        <!-- Optimization suggestions will be populated here -->
                    </div>
                    <button id="close-optimization" class="close-btn">Tutup</button>
                </div>
            </div>
        `;

        this.addLabSimulatorStyles();
        this.populateAppliancesList();
    }

    addLabSimulatorStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .lab-simulator-container {
                background: rgba(26, 26, 46, 0.95);
                border: 2px solid rgba(0, 255, 255, 0.5);
                border-radius: 15px;
                padding: 30px;
                max-width: 95%;
                max-height: 95%;
                overflow-y: auto;
            }

            .simulator-layout {
                display: flex;
                gap: 30px;
                margin: 20px 0;
            }

            .appliances-panel {
                flex: 1;
            }

            .appliances-list {
                max-height: 400px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(0, 255, 255, 0.2);
                border-radius: 8px;
                padding: 15px;
            }

            .appliance-simulator-item {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(0, 255, 255, 0.2);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .appliance-sim-icon {
                font-size: 1.8rem;
                width: 40px;
                text-align: center;
            }

            .appliance-sim-info {
                flex: 1;
            }

            .appliance-sim-name {
                font-weight: bold;
                color: #ffffff;
                margin-bottom: 5px;
            }

            .appliance-sim-power {
                font-size: 0.9rem;
                color: #cccccc;
                margin-bottom: 5px;
            }

            .appliance-sim-consumption {
                font-size: 0.8rem;
                color: #00ffff;
            }

            .appliance-sim-controls {
                display: flex;
                flex-direction: column;
                gap: 8px;
                align-items: center;
            }

            .appliance-sim-toggle {
                background: #660000;
                border: 1px solid #ff0000;
                color: #fff;
                padding: 5px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                min-width: 60px;
            }

            .appliance-sim-toggle.on {
                background: #006600;
                border-color: #00ff00;
            }

            .appliance-sim-toggle:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .hours-control {
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .hours-slider {
                width: 60px;
            }

            .hours-display {
                font-size: 0.8rem;
                color: #cccccc;
                min-width: 35px;
            }

            .calculation-panel {
                flex: 1;
            }

            .formula-section, .results-section, .control-section {
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(0, 255, 255, 0.2);
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 20px;
            }

            .formula-display {
                text-align: center;
                margin-bottom: 15px;
            }

            .formula-main {
                font-size: 1.5rem;
                font-weight: bold;
                color: #00ffff;
                margin-bottom: 15px;
                font-family: monospace;
            }

            .formula-explanation {
                display: flex;
                justify-content: space-around;
                font-size: 0.9rem;
                color: #cccccc;
            }

            .info-btn {
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                color: #00ffff;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
            }

            .results-display {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }

            .result-item {
                text-align: center;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }

            .result-item.major {
                grid-column: span 2;
                background: rgba(0, 255, 255, 0.1);
            }

            .result-label {
                font-size: 0.9rem;
                color: #cccccc;
                margin-bottom: 5px;
            }

            .result-value {
                font-size: 1.2rem;
                font-weight: bold;
                color: #00ffff;
            }

            .result-value.target {
                color: #ffff44;
            }

            .bill-meter {
                margin-top: 15px;
            }

            .meter-track {
                width: 100%;
                height: 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                position: relative;
                overflow: hidden;
            }

            .meter-progress {
                height: 100%;
                background: linear-gradient(90deg, #44ff44, #ffff44, #ff4444);
                border-radius: 10px;
                width: 0%;
                transition: width 0.5s ease;
            }

            .meter-target-line {
                position: absolute;
                left: 60%; /* 300k out of 500k max */
                top: 0;
                width: 2px;
                height: 100%;
                background: #ffffff;
                box-shadow: 0 0 5px #ffffff;
            }

            .meter-labels {
                display: flex;
                justify-content: space-between;
                margin-top: 5px;
                font-size: 0.8rem;
                color: #cccccc;
            }

            .target-label {
                color: #ffffff !important;
                font-weight: bold;
            }

            .simulator-controls {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-bottom: 20px;
            }

            .sim-btn {
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 120px;
            }

            .sim-btn.primary {
                background: linear-gradient(135deg, #00ffff, #0099cc);
                color: #000;
            }

            .sim-btn.secondary {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                border: 1px solid rgba(0, 255, 255, 0.3);
            }

            .sim-btn:hover {
                transform: translateY(-2px);
            }

            .sim-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none !important;
            }

            .quick-scenarios {
                text-align: center;
            }

            .quick-scenarios h5 {
                color: #cccccc;
                margin-bottom: 10px;
            }

            .scenario-btn {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: #fff;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                margin: 0 5px;
                transition: all 0.3s ease;
            }

            .scenario-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(0, 255, 255, 0.5);
            }

            .optimization-panel {
                background: rgba(0, 100, 0, 0.1);
                border: 2px solid rgba(0, 255, 0, 0.3);
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
            }

            .optimization-panel h4 {
                color: #00ff00;
                margin-bottom: 15px;
                text-align: center;
            }

            .optimization-suggestion {
                background: rgba(255, 255, 255, 0.05);
                border-left: 3px solid #00ff00;
                padding: 10px 15px;
                margin-bottom: 10px;
                border-radius: 5px;
            }

            .suggestion-appliance {
                font-weight: bold;
                color: #00ffff;
            }

            .suggestion-saving {
                color: #00ff00;
                font-size: 0.9rem;
                margin-top: 5px;
            }

            .close-btn {
                background: #ff4444;
                border: none;
                color: #fff;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                display: block;
                margin: 15px auto 0;
            }

            .calculation-progress {
                text-align: center;
                padding: 20px;
                background: rgba(0, 255, 255, 0.1);
                border-radius: 10px;
                margin: 20px 0;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                overflow: hidden;
                margin: 10px 0;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #00ffff, #0099cc);
                width: 0%;
                transition: width 0.3s ease;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .simulator-layout {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .appliances-list {
                    max-height: 300px;
                }
                
                .appliance-simulator-item {
                    flex-direction: column;
                    text-align: center;
                    gap: 10px;
                }
                
                .results-display {
                    grid-template-columns: 1fr;
                }
                
                .result-item.major {
                    grid-column: span 1;
                }
                
                .simulator-controls {
                    flex-direction: column;
                    align-items: center;
                }
                
                .sim-btn {
                    width: 100%;
                    max-width: 200px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    populateAppliancesList() {
        const appliancesList = document.getElementById('appliances-list');
        if (!appliancesList) return;

        appliancesList.innerHTML = '';

        this.houseAppliances.forEach((appliance, index) => {
            const applianceElement = document.createElement('div');
            applianceElement.className = 'appliance-simulator-item';
            applianceElement.innerHTML = `
                <div class="appliance-sim-icon">${this.getApplianceIcon(appliance.name)}</div>
                <div class="appliance-sim-info">
                    <div class="appliance-sim-name">${appliance.name}</div>
                    <div class="appliance-sim-power">${appliance.power}W</div>
                    <div class="appliance-sim-consumption" id="consumption-${index}">0 kWh/bulan</div>
                </div>
                <div class="appliance-sim-controls">
                    <button class="appliance-sim-toggle ${appliance.isOn ? 'on' : ''}" 
                            data-index="${index}" 
                            ${appliance.essential ? 'disabled' : ''}>
                        ${appliance.isOn ? 'ON' : 'OFF'}
                    </button>
                    <div class="hours-control">
                        <input type="range" class="hours-slider" 
                               min="0" max="24" step="0.5" 
                               value="${appliance.defaultHours}"
                               data-index="${index}"
                               ${appliance.isOn ? '' : 'disabled'}>
                        <span class="hours-display" id="hours-${index}">${appliance.defaultHours}h</span>
                    </div>
                </div>
            `;
            
            appliancesList.appendChild(applianceElement);
        });
    }

    getApplianceIcon(name) {
        const icons = {
            'Kulkas': '🧊',
            'Lampu Ruang Tamu': '💡',
            'Lampu Kamar': '💡',
            'AC': '❄️',
            'TV': '📺',
            'Rice Cooker': '🍚',
            'Setrika': '👔',
            'Kipas Angin': '🌀',
            'Microwave': '📦',
            'Charger HP': '🔌'
        };
        return icons[name] || '⚡';
    }

    setupInteractions() {
        // Appliance toggles
        document.querySelectorAll('.appliance-sim-toggle').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    this.toggleAppliance(index);
                });
            }
        });

        // Hours sliders
        document.querySelectorAll('.hours-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const hours = parseFloat(e.target.value);
                this.updateApplianceHours(index, hours);
            });
        });

        // Control buttons
        const calculateBtn = document.getElementById('calculate-btn');
        const optimizeBtn = document.getElementById('optimize-btn');
        const resetBtn = document.getElementById('reset-sim-btn');
        const showFormulaBtn = document.getElementById('show-formula-detail');

        if (calculateBtn) calculateBtn.addEventListener('click', () => this.calculateBill());
        if (optimizeBtn) optimizeBtn.addEventListener('click', () => this.showOptimization());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetSimulator());
        if (showFormulaBtn) showFormulaBtn.addEventListener('click', () => this.showFormulaDetail());

        // Scenario buttons
        const scenarioButtons = ['scenario-minimal', 'scenario-normal', 'scenario-comfort'];
        scenarioButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => this.applyScenario(id.split('-')[1]));
            }
        });

        // Optimization panel close
        const closeOptimization = document.getElementById('close-optimization');
        if (closeOptimization) {
            closeOptimization.addEventListener('click', () => this.hideOptimization());
        }
    }

    toggleAppliance(index) {
        const appliance = this.houseAppliances[index];
        if (!appliance || appliance.essential) return;

        appliance.isOn = !appliance.isOn;
        
        // Update visual
        this.updateApplianceVisual(index);
        
        // Recalculate immediately
        this.calculateBill();
        
        // Show feedback
        this.showApplianceFeedback(appliance);
        
        // Play sound
        if (appliance.isOn) {
            window.audioManager.playApplianceOn();
        } else {
            window.audioManager.playSwitchOff();
        }
    }

    updateApplianceHours(index, hours) {
        const appliance = this.houseAppliances[index];
        if (!appliance) return;

        appliance.defaultHours = hours;
        
        // Update display
        const hoursDisplay = document.getElementById(`hours-${index}`);
        if (hoursDisplay) {
            hoursDisplay.textContent = `${hours}h`;
        }

        // Update consumption display
        this.updateApplianceConsumption(index);
        
        // Recalculate if appliance is on
        if (appliance.isOn) {
            this.calculateBill();
        }
    }

    updateApplianceVisual(index) {
        const appliance = this.houseAppliances[index];
        const toggle = document.querySelector(`[data-index="${index}"].appliance-sim-toggle`);
        const slider = document.querySelector(`[data-index="${index}"].hours-slider`);
        
        if (toggle) {
            toggle.textContent = appliance.isOn ? 'ON' : 'OFF';
            toggle.className = `appliance-sim-toggle ${appliance.isOn ? 'on' : ''}`;
        }
        
        if (slider) {
            slider.disabled = !appliance.isOn;
        }

        this.updateApplianceConsumption(index);
    }

    updateApplianceConsumption(index) {
        const appliance = this.houseAppliances[index];
        const consumptionElement = document.getElementById(`consumption-${index}`);
        
        if (consumptionElement && appliance) {
            if (appliance.isOn) {
                const monthlyKwh = window.energyCalculator.calculateEnergyConsumption(
                    appliance.power, 
                    appliance.defaultHours
                ) * 30;
                consumptionElement.textContent = `${monthlyKwh.toFixed(1)} kWh/bulan`;
                consumptionElement.style.color = '#00ffff';
            } else {
                consumptionElement.textContent = '0 kWh/bulan';
                consumptionElement.style.color = '#666';
            }
        }
    }

    async calculateBill() {
        if (this.simulationRunning) return;

        this.simulationRunning = true;
        
        // Show calculation progress
        this.showCalculationProgress();
        
        // Simulate calculation time for realism
        await this.delay(1500);
        
        // Calculate actual consumption
        const activeAppliances = this.houseAppliances
            .filter(app => app.isOn)
            .map(app => ({
                name: app.name,
                power: app.power,
                hours: app.defaultHours,
                isOn: app.isOn
            }));

        const result = window.energyCalculator.calculateTotalConsumption(activeAppliances);
        
        this.currentKwh = result.totalMonthlyKwh;
        this.currentBill = result.totalMonthlyBill;
        
        // Update display
        this.updateResultsDisplay(result);
        
        // Hide progress
        this.hideCalculationProgress();
        
        // Check completion
        this.checkSimulatorCompletion();
        
        this.simulationRunning = false;
    }

    showCalculationProgress() {
        const calculationProgress = document.createElement('div');
        calculationProgress.id = 'calculation-progress';
        calculationProgress.className = 'calculation-progress';
        calculationProgress.innerHTML = `
            <h4>🧮 Menghitung Tagihan...</h4>
            <div class="progress-bar">
                <div class="progress-fill" id="calc-progress-fill"></div>
            </div>
            <div id="calc-status">Memproses data perangkat...</div>
        `;

        const container = document.querySelector('.lab-simulator-container');
        if (container) {
            container.appendChild(calculationProgress);
        }

        // Animate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            const progressFill = document.getElementById('calc-progress-fill');
            const calcStatus = document.getElementById('calc-status');
            
            if (progressFill) progressFill.style.width = `${progress}%`;
            
            if (calcStatus) {
                const statuses = [
                    'Memproses data perangkat...',
                    'Menghitung konsumsi harian...',
                    'Mengkalkulasi biaya bulanan...',
                    'Menganalisis efisiensi...',
                    'Selesai!'
                ];
                calcStatus.textContent = statuses[Math.floor(progress / 20)] || 'Memproses...';
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
            }
        }, 150);
    }

    hideCalculationProgress() {
        const progressElement = document.getElementById('calculation-progress');
        if (progressElement) {
            progressElement.remove();
        }
    }

    updateResultsDisplay(result) {
        const monthlyKwhElement = document.getElementById('monthly-kwh');
        const monthlyBillElement = document.getElementById('monthly-bill');
        const billStatusElement = document.getElementById('bill-status');
        const billMeterProgress = document.getElementById('bill-meter-progress');

        if (monthlyKwhElement) {
            monthlyKwhElement.textContent = GAME_UTILS.formatEnergy(result.totalMonthlyKwh);
        }

        if (monthlyBillElement) {
            monthlyBillElement.textContent = GAME_UTILS.formatCurrency(result.totalMonthlyBill);
        }

        if (billStatusElement) {
            const rating = GAME_UTILS.getEfficiencyRating(result.totalMonthlyBill);
            billStatusElement.textContent = rating.label;
            billStatusElement.style.color = rating.color;
        }

        if (billMeterProgress) {
            const percentage = Math.min(100, (result.totalMonthlyBill / 500000) * 100);
            billMeterProgress.style.width = `${percentage}%`;
        }

        // Play calculation sound
        window.audioManager.playCalculation();
    }

    checkSimulatorCompletion() {
        if (this.currentBill <= this.targetBill && !this.isCompleted) {
            this.completeSimulator();
        } else if (this.currentBill > this.targetBill) {
            this.showBillTooHigh();
        }
    }

    completeSimulator() {
        this.isCompleted = true;
        
        window.audioManager.playSuccessSound();
        
        const completionMessage = `
            <div class="completion-message">
                <h3>🎉 Simulator Berhasil!</h3>
                <p><strong>Tagihan:</strong> ${GAME_UTILS.formatCurrency(this.currentBill)}</p>
                <p><strong>Target:</strong> ≤ ${GAME_UTILS.formatCurrency(this.targetBill)}</p>
                <p><strong>Efisiensi:</strong> ${GAME_UTILS.getEfficiencyRating(this.currentBill).label}</p>
                
                <div class="blueprint-found">
                    <h4>📋 Blueprint Ditemukan!</h4>
                    <p>Kamu menemukan blueprint alat rahasia ilmuwan:</p>
                    <p><strong>"ENERGY EFFICIENCY ANALYZER"</strong></p>
                    <p>Alat ini dapat menganalisis efisiensi energi rumah secara otomatis.</p>
                </div>
                
                <p>🚪 Pintu rahasia ke ruang bawah tanah terbuka!</p>
            </div>
        `;

        this.showFeedback(completionMessage, 'success', 10000);

        // Award energy key
        setTimeout(() => {
            window.uiManager.collectEnergyKey(2);
        }, 3000);

        // Show educational content
        setTimeout(() => {
            this.showEducationalContent();
        }, 5000);
    }

    showBillTooHigh() {
        const excess = this.currentBill - this.targetBill;
        const message = `Tagihan terlalu tinggi! Kelebihan: ${GAME_UTILS.formatCurrency(excess)}. Coba matikan perangkat yang tidak perlu atau kurangi waktu pemakaian.`;
        
        this.showFeedback(message, 'error', 5000);
        
        // Auto-show optimization
        setTimeout(() => {
            this.showOptimization();
        }, 2000);
    }

    showOptimization() {
        const activeAppliances = this.houseAppliances
            .filter(app => app.isOn)
            .map(app => ({
                name: app.name,
                power: app.power,
                hours: app.defaultHours,
                isOn: app.isOn
            }));

        const suggestions = window.energyCalculator.getOptimizationSuggestions(activeAppliances);
        
        const optimizationPanel = document.getElementById('optimization-panel');
        const optimizationContent = document.getElementById('optimization-content');
        
        if (optimizationPanel && optimizationContent) {
            optimizationContent.innerHTML = '';
            
            if (suggestions.length === 0) {
                optimizationContent.innerHTML = `
                    <div class="optimization-suggestion">
                        <div class="suggestion-appliance">Konfigurasi Sudah Optimal!</div>
                        <p>Penggunaan energi kamu sudah sangat efisien. Pertahankan kebiasaan hemat energi ini!</p>
                    </div>
                `;
            } else {
                suggestions.forEach(suggestion => {
                    const suggestionElement = document.createElement('div');
                    suggestionElement.className = 'optimization-suggestion';
                    suggestionElement.innerHTML = `
                        <div class="suggestion-appliance">${suggestion.appliance || 'Umum'}</div>
                        <p>${suggestion.message}</p>
                        ${suggestion.potentialSaving ? 
                            `<div class="suggestion-saving">Potensi penghematan: ${GAME_UTILS.formatCurrency(suggestion.potentialSaving)}/bulan</div>` 
                            : ''}
                    `;
                    optimizationContent.appendChild(suggestionElement);
                });
            }
            
            optimizationPanel.style.display = 'block';
        }
    }

    hideOptimization() {
        const optimizationPanel = document.getElementById('optimization-panel');
        if (optimizationPanel) {
            optimizationPanel.style.display = 'none';
        }
    }

    showFormulaDetail() {
        const formulaContent = EDUCATIONAL_CONTENT.ENERGY_CALCULATION.content;
        window.uiManager.showEducationalPanel('Formula Perhitungan Energi', formulaContent);
    }

    applyScenario(scenarioType) {
        const scenarios = {
            minimal: {
                description: 'Penggunaan minimal - hanya perangkat esensial',
                appliances: { essential: true, hours: 'minimal' }
            },
            normal: {
                description: 'Penggunaan normal - kebutuhan sehari-hari',
                appliances: { essential: true, hours: 'normal' }
            },
            comfort: {
                description: 'Penggunaan nyaman - semua perangkat aktif',
                appliances: { essential: false, hours: 'maximum' }
            }
        };

        const scenario = scenarios[scenarioType];
        if (!scenario) return;

        this.houseAppliances.forEach((appliance, index) => {
            switch (scenarioType) {
                case 'minimal':
                    appliance.isOn = appliance.essential;
                    appliance.defaultHours = appliance.essential ? 24 : 0;
                    break;
                case 'normal':
                    appliance.isOn = appliance.essential || appliance.power < 400;
                    appliance.defaultHours = appliance.essential ? 24 : Math.min(appliance.defaultHours, 6);
                    break;
                case 'comfort':
                    appliance.isOn = true;
                    appliance.defaultHours = appliance.essential ? 24 : Math.max(appliance.defaultHours, 8);
                    break;
            }
            
            this.updateApplianceVisual(index);
        });

        this.calculateBill();
        this.showFeedback(`Skenario ${scenarioType} diterapkan`, 'info');
    }

    showApplianceFeedback(appliance) {
        const monthlyConsumption = window.energyCalculator.calculateEnergyConsumption(appliance.power, appliance.defaultHours) * 30;
        const monthlyCost = window.energyCalculator.calculateMonthlyBill(monthlyConsumption);

        let message = '';
        let type = 'info';

        if (appliance.isOn) {
            if (appliance.power > 1000) {
                message = `${appliance.name} konsumsi TINGGI (${appliance.power}W). Biaya: ${GAME_UTILS.formatCurrency(monthlyCost)}/bulan`;
                type = 'warning';
            } else if (appliance.power < 100) {
                message = `${appliance.name} hemat energi (${appliance.power}W). Biaya: ${GAME_UTILS.formatCurrency(monthlyCost)}/bulan`;
                type = 'success';
            } else {
                message = `${appliance.name} konsumsi sedang (${appliance.power}W). Biaya: ${GAME_UTILS.formatCurrency(monthlyCost)}/bulan`;
                type = 'info';
            }
        } else {
            message = `${appliance.name} dimatikan. Penghematan: ${GAME_UTILS.formatCurrency(monthlyCost)}/bulan`;
            type = 'success';
        }

        this.showFeedback(message, type, 3000);
    }

    calculateInitialBill() {
        this.calculateBill();
    }

    resetSimulator() {
        // Reset to initial state
        this.houseAppliances.forEach((appliance, index) => {
            appliance.isOn = appliance.essential;
            appliance.defaultHours = appliance.essential ? 24 : 2;
            this.updateApplianceVisual(index);
        });

        this.isCompleted = false;
        this.calculateBill();
        
        this.showFeedback('Simulator direset ke pengaturan awal', 'info');
    }

    showTutorial() {
        const tutorial = `
            <h3>Tutorial Simulator Tagihan</h3>
            <p>Gunakan simulator untuk mencapai target tagihan ≤ Rp 300,000/bulan</p>
            
            <h4>Cara Menggunakan:</h4>
            <ol>
                <li><strong>Toggle Perangkat:</strong> Klik ON/OFF untuk menyalakan/mematikan</li>
                <li><strong>Atur Waktu:</strong> Geser slider untuk mengatur jam pemakaian/hari</li>
                <li><strong>Hitung:</strong> Klik "Hitung Tagihan" untuk melihat hasil</li>
                <li><strong>Optimasi:</strong> Gunakan saran untuk mencapai target</li>
            </ol>
            
            <h4>Formula yang Digunakan:</h4>
            <p><strong>E = (P × t) / 1000</strong></p>
            <p>Biaya = E × Rp 1,467.28 (tarif PLN 2024)</p>
            
            <h4>Tips:</h4>
            <ul>
                <li>Perangkat esensial (kulkas) tidak bisa dimatikan</li>
                <li>Kurangi waktu pemakaian perangkat berdaya tinggi</li>
                <li>Matikan perangkat yang tidak perlu</li>
                <li>Gunakan skenario cepat untuk eksperimen</li>
            </ul>
        `;

        window.uiManager.showEducationalPanel('Tutorial Simulator', tutorial);
    }

    showEducationalContent() {
        const content = `
            <h3>Pembelajaran: Simulasi Tagihan Listrik</h3>
            
            <h4>Yang telah dipelajari:</h4>
            <ul>
                <li><strong>Formula Energi:</strong> E = (P × t) / 1000</li>
                <li><strong>Tarif Listrik:</strong> Rp 1,467.28/kWh (PLN 2024)</li>
                <li><strong>Pengaruh Daya:</strong> Semakin tinggi watt, semakin besar biaya</li>
                <li><strong>Pengaruh Waktu:</strong> Durasi pemakaian mempengaruhi tagihan</li>
                <li><strong>Optimasi:</strong> Strategi mengelola konsumsi energi</li>
            </ul>
            
            <h4>Aplikasi Nyata:</h4>
            <ul>
                <li>Gunakan perangkat hemat energi</li>
                <li>Matikan perangkat saat tidak digunakan</li>
                <li>Atur waktu pemakaian perangkat berdaya tinggi</li>
                <li>Monitor tagihan listrik secara berkala</li>
            </ul>
            
            <h4>Hasil Simulasi Kamu:</h4>
            <p><strong>Konsumsi:</strong> ${GAME_UTILS.formatEnergy(this.currentKwh)}</p>
            <p><strong>Tagihan:</strong> ${GAME_UTILS.formatCurrency(this.currentBill)}</p>
            <p><strong>Rating:</strong> ${GAME_UTILS.getEfficiencyRating(this.currentBill).label}</p>
        `;

        window.uiManager.showEducationalPanel('Simulasi Selesai', content);
    }

    showFeedback(message, type, duration = 3000) {
        if (typeof message === 'string') {
            window.uiManager.showToast(message, type, duration);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
        this.resetSimulator();
    }

    getCurrentBill() {
        return this.currentBill;
    }

    getTargetBill() {
        return this.targetBill;
    }

    destroy() {
        this.deactivate();
    }
}

// Export for global access
window.LabSimulator = LabSimulator;