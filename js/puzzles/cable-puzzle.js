// Energy Quest: Cable Puzzle Implementation
// Level 1 - Drag & Connect Cable Puzzle

class CablePuzzle {
    constructor() {
        this.isCompleted = false;
        this.isActive = false;
        this.components = new Map();
        this.cables = [];
        this.connections = new Map();
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        
        this.setupComponents();
        this.setupEventListeners();
    }

    setupComponents() {
        // Define electrical components with connection points
        this.components.set('battery', {
            element: null,
            type: 'source',
            terminals: ['positive', 'negative'],
            connected: { positive: null, negative: null },
            position: { x: 100, y: 200 }
        });

        this.components.set('switch', {
            element: null,
            type: 'control',
            terminals: ['in', 'out'],
            connected: { in: null, out: null },
            position: { x: 300, y: 200 },
            state: 'off' // on/off
        });

        this.components.set('lamp', {
            element: null,
            type: 'load',
            terminals: ['positive', 'negative'],
            connected: { positive: null, negative: null },
            position: { x: 500, y: 200 },
            isOn: false
        });

        // Create cables for connections
        this.cables = [
            { id: 'cable1', from: null, to: null, element: null },
            { id: 'cable2', from: null, to: null, element: null },
            { id: 'cable3', from: null, to: null, element: null }
        ];
    }

    setupEventListeners() {
        // Will be setup when puzzle is activated
    }

    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.createPuzzleUI();
        this.setupInteractions();
        
        // Show tutorial
        this.showTutorial();
        
        console.log('Cable puzzle activated');
    }

    deactivate() {
        this.isActive = false;
        this.removePuzzleUI();
        console.log('Cable puzzle deactivated');
    }

    createPuzzleUI() {
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (!puzzleOverlay) return;

        puzzleOverlay.style.display = 'flex';
        puzzleOverlay.innerHTML = `
            <div class="cable-puzzle-container">
                <div class="puzzle-header">
                    <h3>🔌 Puzzle Kabel Listrik</h3>
                    <p>Hubungkan komponen untuk membuat rangkaian tertutup</p>
                </div>
                
                <div class="circuit-board">
                    <div class="component battery" id="battery-component">
                        <div class="component-body">
                            <div class="battery-symbol">🔋</div>
                            <div class="component-label">Baterai</div>
                        </div>
                        <div class="terminal positive" data-terminal="positive" data-component="battery">+</div>
                        <div class="terminal negative" data-terminal="negative" data-component="battery">-</div>
                    </div>

                    <div class="component switch" id="switch-component">
                        <div class="component-body">
                            <div class="switch-symbol" id="switch-visual">⚡</div>
                            <div class="component-label">Saklar</div>
                            <div class="switch-state" id="switch-state">OFF</div>
                        </div>
                        <div class="terminal in" data-terminal="in" data-component="switch">IN</div>
                        <div class="terminal out" data-terminal="out" data-component="switch">OUT</div>
                    </div>

                    <div class="component lamp" id="lamp-component">
                        <div class="component-body">
                            <div class="lamp-symbol" id="lamp-visual">💡</div>
                            <div class="component-label">Lampu</div>
                        </div>
                        <div class="terminal positive" data-terminal="positive" data-component="lamp">+</div>
                        <div class="terminal negative" data-terminal="negative" data-component="lamp">-</div>
                    </div>
                </div>

                <div class="cable-tools">
                    <div class="available-cables">
                        <h4>Kabel Tersedia:</h4>
                        <div class="cable-item draggable" data-cable="cable1">
                            <div class="cable-visual">📏</div>
                            <span>Kabel 1</span>
                        </div>
                        <div class="cable-item draggable" data-cable="cable2">
                            <div class="cable-visual">📏</div>
                            <span>Kabel 2</span>
                        </div>
                        <div class="cable-item draggable" data-cable="cable3">
                            <div class="cable-visual">📏</div>
                            <span>Kabel 3</span>
                        </div>
                    </div>
                </div>

                <div class="puzzle-controls">
                    <button id="test-circuit-btn" class="puzzle-btn primary">🔬 Test Rangkaian</button>
                    <button id="reset-circuit-btn" class="puzzle-btn secondary">🔄 Reset</button>
                    <button id="hint-btn" class="puzzle-btn secondary">💡 Petunjuk</button>
                </div>

                <div class="connection-feedback" id="connection-feedback">
                    <p>Hubungkan: (+) Baterai → Saklar → Lampu → (-) Baterai</p>
                </div>
            </div>
        `;

        // Add CSS for cable puzzle
        this.addPuzzleStyles();
    }

    addPuzzleStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .cable-puzzle-container {
                background: rgba(26, 26, 46, 0.95);
                border: 2px solid rgba(0, 255, 255, 0.5);
                border-radius: 15px;
                padding: 30px;
                max-width: 90%;
                max-height: 90%;
                overflow-y: auto;
                text-align: center;
            }

            .puzzle-header h3 {
                color: #00ffff;
                margin-bottom: 10px;
                text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            }

            .circuit-board {
                display: flex;
                justify-content: space-around;
                align-items: center;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(0, 255, 255, 0.2);
                border-radius: 10px;
                padding: 40px 20px;
                margin: 20px 0;
                position: relative;
                min-height: 200px;
            }

            .component {
                position: relative;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                min-width: 120px;
            }

            .component-body {
                margin-bottom: 15px;
            }

            .component-symbol {
                font-size: 2rem;
                margin-bottom: 10px;
            }

            .component-label {
                font-size: 0.9rem;
                color: #cccccc;
                margin-bottom: 5px;
            }

            .terminal {
                position: absolute;
                width: 25px;
                height: 25px;
                background: #333;
                border: 2px solid #666;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .terminal:hover {
                border-color: #00ffff;
                background: rgba(0, 255, 255, 0.2);
            }

            .terminal.connected {
                background: #00ff00;
                border-color: #00ff00;
                box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
            }

            /* Terminal positions */
            .battery .terminal.positive { top: -12px; right: 10px; }
            .battery .terminal.negative { bottom: -12px; right: 10px; }
            .switch .terminal.in { left: -12px; top: 50%; transform: translateY(-50%); }
            .switch .terminal.out { right: -12px; top: 50%; transform: translateY(-50%); }
            .lamp .terminal.positive { top: -12px; left: 10px; }
            .lamp .terminal.negative { bottom: -12px; left: 10px; }

            .cable-tools {
                margin: 20px 0;
            }

            .available-cables {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-top: 10px;
            }

            .cable-item {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 8px;
                padding: 10px;
                cursor: grab;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }

            .cable-item:hover {
                background: rgba(0, 255, 255, 0.1);
                border-color: rgba(0, 255, 255, 0.6);
                transform: translateY(-2px);
            }

            .cable-item.dragging {
                cursor: grabbing;
                opacity: 0.7;
                transform: scale(1.1);
            }

            .cable-item.used {
                opacity: 0.3;
                cursor: not-allowed;
            }

            .cable-visual {
                font-size: 1.5rem;
            }

            .puzzle-controls {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin: 20px 0;
            }

            .puzzle-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .puzzle-btn.primary {
                background: linear-gradient(135deg, #00ffff, #0099cc);
                color: #000;
            }

            .puzzle-btn.secondary {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                border: 1px solid rgba(0, 255, 255, 0.3);
            }

            .puzzle-btn:hover {
                transform: translateY(-2px);
            }

            .connection-feedback {
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin-top: 20px;
                font-size: 0.9rem;
            }

            .connection-feedback.success {
                border-color: rgba(0, 255, 0, 0.5);
                color: #00ff00;
            }

            .connection-feedback.error {
                border-color: rgba(255, 0, 0, 0.5);
                color: #ff4444;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .cable-puzzle-container {
                    padding: 20px;
                }
                
                .circuit-board {
                    flex-direction: column;
                    gap: 30px;
                    padding: 30px 15px;
                }
                
                .component {
                    min-width: 100px;
                }
                
                .available-cables {
                    flex-wrap: wrap;
                }
                
                .puzzle-controls {
                    flex-wrap: wrap;
                }
                
                .puzzle-btn {
                    min-width: 120px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupInteractions() {
        // Setup drag and drop for cables
        const cableItems = document.querySelectorAll('.cable-item');
        const terminals = document.querySelectorAll('.terminal');

        cableItems.forEach(cable => {
            this.setupCableDragAndDrop(cable);
        });

        terminals.forEach(terminal => {
            this.setupTerminalInteraction(terminal);
        });

        // Setup control buttons
        const testBtn = document.getElementById('test-circuit-btn');
        const resetBtn = document.getElementById('reset-circuit-btn');
        const hintBtn = document.getElementById('hint-btn');

        if (testBtn) testBtn.addEventListener('click', () => this.testCircuit());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetPuzzle());
        if (hintBtn) hintBtn.addEventListener('click', () => this.showHint());

        // Setup switch interaction
        const switchComponent = document.getElementById('switch-component');
        if (switchComponent) {
            switchComponent.addEventListener('click', () => this.toggleSwitch());
        }
    }

    setupCableDragAndDrop(cableElement) {
        let isDragging = false;
        let startPos = { x: 0, y: 0 };

        const onStart = (e) => {
            if (cableElement.classList.contains('used')) return;
            
            isDragging = true;
            cableElement.classList.add('dragging');
            
            const rect = cableElement.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            startPos.x = clientX - rect.left;
            startPos.y = clientY - rect.top;
            
            window.audioManager.playSFX('CLICK');
            e.preventDefault();
        };

        const onMove = (e) => {
            if (!isDragging) return;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            cableElement.style.position = 'fixed';
            cableElement.style.left = (clientX - startPos.x) + 'px';
            cableElement.style.top = (clientY - startPos.y) + 'px';
            cableElement.style.zIndex = '1000';
            
            e.preventDefault();
        };

        const onEnd = (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            cableElement.classList.remove('dragging');
            
            // Check for drop target
            const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
            const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
            
            if (clientX && clientY) {
                const elementBelow = document.elementFromPoint(clientX, clientY);
                this.handleCableDrop(cableElement, elementBelow);
            }
            
            // Reset cable position
            cableElement.style.position = '';
            cableElement.style.left = '';
            cableElement.style.top = '';
            cableElement.style.zIndex = '';
            
            e.preventDefault();
        };

        // Mouse events
        cableElement.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);

        // Touch events
        cableElement.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd, { passive: false });
    }

    setupTerminalInteraction(terminal) {
        terminal.addEventListener('click', () => {
            this.highlightTerminal(terminal);
        });
    }

    handleCableDrop(cableElement, dropTarget) {
        if (!dropTarget || !dropTarget.classList.contains('terminal')) {
            this.showFeedback('Kabel harus dihubungkan ke terminal komponen', 'error');
            return;
        }

        const cableId = cableElement.dataset.cable;
        const component = dropTarget.dataset.component;
        const terminal = dropTarget.dataset.terminal;

        // Check if terminal is already connected
        if (dropTarget.classList.contains('connected')) {
            this.showFeedback('Terminal sudah terhubung', 'error');
            return;
        }

        // Make connection
        this.makeConnection(cableId, component, terminal, dropTarget);
    }

    makeConnection(cableId, component, terminal, terminalElement) {
        // Find the cable
        const cable = this.cables.find(c => c.id === cableId);
        if (!cable) return;

        // Check if cable already has this end connected
        if (!cable.from) {
            cable.from = { component, terminal, element: terminalElement };
        } else if (!cable.to) {
            cable.to = { component, terminal, element: terminalElement };
            
            // Cable is now fully connected
            this.completeCableConnection(cable);
        } else {
            this.showFeedback('Kabel sudah terhubung penuh', 'error');
            return;
        }

        // Update visual state
        terminalElement.classList.add('connected');
        this.updateCableVisual(cable);
        
        // Mark cable as used
        const cableElement = document.querySelector(`[data-cable="${cableId}"]`);
        if (cableElement) {
            cableElement.classList.add('used');
        }

        window.audioManager.playSFX('SWITCH_ON');
        this.showFeedback(`Kabel ${cableId} terhubung ke ${component} (${terminal})`, 'success');
    }

    completeCableConnection(cable) {
        // Store connection in components
        const fromComp = this.components.get(cable.from.component);
        const toComp = this.components.get(cable.to.component);

        if (fromComp && toComp) {
            fromComp.connected[cable.from.terminal] = {
                component: cable.to.component,
                terminal: cable.to.terminal
            };
            
            toComp.connected[cable.to.terminal] = {
                component: cable.from.component,
                terminal: cable.from.terminal
            };
        }

        this.showFeedback('Kabel berhasil menghubungkan dua komponen!', 'success');
    }

    updateCableVisual(cable) {
        // In a real implementation, this would draw SVG lines between terminals
        // For this demo, we'll use CSS to show connection
        if (cable.from && cable.to) {
            cable.from.element.style.background = '#00ff00';
            cable.to.element.style.background = '#00ff00';
        }
    }

    toggleSwitch() {
        const switchComp = this.components.get('switch');
        if (!switchComp) return;

        switchComp.state = switchComp.state === 'off' ? 'on' : 'off';
        
        const switchVisual = document.getElementById('switch-visual');
        const switchState = document.getElementById('switch-state');
        
        if (switchVisual && switchState) {
            if (switchComp.state === 'on') {
                switchVisual.textContent = '⚡';
                switchVisual.style.color = '#00ff00';
                switchState.textContent = 'ON';
                switchState.style.color = '#00ff00';
                window.audioManager.playSwitchOn();
            } else {
                switchVisual.textContent = '⚡';
                switchVisual.style.color = '#666';
                switchState.textContent = 'OFF';
                switchState.style.color = '#666';
                window.audioManager.playSwitchOff();
            }
        }

        // Test circuit if switch is turned on
        if (switchComp.state === 'on') {
            setTimeout(() => this.testCircuit(), 500);
        }
    }

    testCircuit() {
        const isComplete = this.validateCircuit();
        
        if (isComplete) {
            this.completeCircuit();
        } else {
            this.showCircuitError();
        }
    }

    validateCircuit() {
        // Check if circuit is complete: Battery(+) → Switch → Lamp → Battery(-)
        const battery = this.components.get('battery');
        const switchComp = this.components.get('switch');
        const lamp = this.components.get('lamp');

        // Check if switch is on
        if (switchComp.state !== 'on') {
            this.showFeedback('Nyalakan saklar terlebih dahulu!', 'error');
            return false;
        }

        // Check connections
        const hasPositiveConnection = battery.connected.positive?.component === 'switch';
        const hasSwitchToLamp = switchComp.connected.out?.component === 'lamp';
        const hasNegativeConnection = lamp.connected.negative?.component === 'battery';

        return hasPositiveConnection && hasSwitchToLamp && hasNegativeConnection;
    }

    completeCircuit() {
        // Turn on the lamp
        const lampVisual = document.getElementById('lamp-visual');
        if (lampVisual) {
            lampVisual.textContent = '💡';
            lampVisual.style.color = '#ffff00';
            lampVisual.style.filter = 'drop-shadow(0 0 15px #ffff00)';
        }

        window.audioManager.playSuccessSound();
        this.showFeedback(GAME_CONSTANTS.MESSAGES.SUCCESS.CIRCUIT_COMPLETE, 'success');

        // Show educational content
        setTimeout(() => {
            this.showEducationalContent();
        }, 2000);

        // Mark as completed
        this.isCompleted = true;

        // Award energy key
        setTimeout(() => {
            window.uiManager.collectEnergyKey(0);
        }, 3000);
    }

    showCircuitError() {
        window.audioManager.playErrorSound();
        this.showFeedback(GAME_CONSTANTS.MESSAGES.ERRORS.CIRCUIT_OPEN, 'error');
        
        // Add error visual effect
        const components = document.querySelectorAll('.component');
        components.forEach(comp => {
            comp.style.borderColor = 'rgba(255, 0, 0, 0.5)';
            setTimeout(() => {
                comp.style.borderColor = 'rgba(0, 255, 255, 0.3)';
            }, 1000);
        });
    }

    showEducationalContent() {
        const content = EDUCATIONAL_CONTENT.BASIC_ELECTRICITY.content;
        window.uiManager.showEducationalPanel(
            'Pembelajaran: Rangkaian Listrik',
            content
        );
    }

    resetPuzzle() {
        // Reset all connections
        this.connections.clear();
        this.cables.forEach(cable => {
            cable.from = null;
            cable.to = null;
        });

        // Reset component connections
        this.components.forEach(component => {
            Object.keys(component.connected).forEach(terminal => {
                component.connected[terminal] = null;
            });
        });

        // Reset visual state
        document.querySelectorAll('.terminal').forEach(terminal => {
            terminal.classList.remove('connected');
            terminal.style.background = '#333';
            terminal.style.borderColor = '#666';
        });

        document.querySelectorAll('.cable-item').forEach(cable => {
            cable.classList.remove('used');
        });

        // Reset lamp
        const lampVisual = document.getElementById('lamp-visual');
        if (lampVisual) {
            lampVisual.style.color = '#666';
            lampVisual.style.filter = 'none';
        }

        // Reset switch
        const switchComp = this.components.get('switch');
        if (switchComp) {
            switchComp.state = 'off';
            const switchVisual = document.getElementById('switch-visual');
            const switchState = document.getElementById('switch-state');
            
            if (switchVisual && switchState) {
                switchVisual.style.color = '#666';
                switchState.textContent = 'OFF';
                switchState.style.color = '#666';
            }
        }

        this.isCompleted = false;
        this.showFeedback('Puzzle direset. Coba lagi!', 'info');
    }

    showHint() {
        const hints = [
            'Hubungkan kutub positif (+) baterai ke input saklar',
            'Hubungkan output saklar ke kutub positif (+) lampu',
            'Hubungkan kutub negatif (-) lampu ke kutub negatif (-) baterai',
            'Nyalakan saklar untuk mengalirkan listrik'
        ];

        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        this.showFeedback(`💡 Petunjuk: ${randomHint}`, 'info', 5000);
    }

    showTutorial() {
        const tutorial = `
            <h3>Tutorial Puzzle Kabel</h3>
            <p>Tujuan: Buat rangkaian listrik tertutup agar lampu menyala</p>
            
            <h4>Langkah-langkah:</h4>
            <ol>
                <li>Drag kabel ke terminal komponen</li>
                <li>Hubungkan sesuai urutan: (+) Baterai → Saklar → Lampu → (-) Baterai</li>
                <li>Nyalakan saklar dengan mengklik</li>
                <li>Test rangkaian untuk melihat hasilnya</li>
            </ol>
            
            <h4>Tips:</h4>
            <ul>
                <li>Terminal yang terhubung akan berubah warna hijau</li>
                <li>Gunakan tombol "Petunjuk" jika kesulitan</li>
                <li>Klik "Reset" untuk memulai ulang</li>
            </ul>
        `;

        window.uiManager.showEducationalPanel('Tutorial Rangkaian Listrik', tutorial);
    }

    showFeedback(message, type, duration = 3000) {
        const feedbackElement = document.getElementById('connection-feedback');
        if (feedbackElement) {
            feedbackElement.textContent = message;
            feedbackElement.className = `connection-feedback ${type}`;
        }

        window.uiManager.showToast(message, type, duration);
    }

    highlightTerminal(terminal) {
        // Remove previous highlights
        document.querySelectorAll('.terminal').forEach(t => {
            t.style.boxShadow = '';
        });

        // Highlight selected terminal
        terminal.style.boxShadow = '0 0 15px #00ffff';
        
        setTimeout(() => {
            terminal.style.boxShadow = '';
        }, 2000);
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
        // Remove event listeners
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
    }
}

// Export for global access
window.CablePuzzle = CablePuzzle;