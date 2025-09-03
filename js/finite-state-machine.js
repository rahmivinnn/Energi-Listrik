// Energy Quest: Finite State Machine Implementation
class FiniteStateMachine {
    constructor() {
        this.currentState = null;
        this.previousState = null;
        this.states = new Map();
        this.transitions = new Map();
        this.stateHistory = [];
        this.eventListeners = new Map();
        
        // Debug mode
        this.debug = false;
        
        this.log('Finite State Machine initialized');
    }

    // Register a state with its handler
    addState(stateName, stateHandler) {
        if (typeof stateHandler !== 'object') {
            throw new Error(`State handler for '${stateName}' must be an object`);
        }

        // Ensure required methods exist
        const requiredMethods = ['onEnter', 'onUpdate', 'onExit'];
        requiredMethods.forEach(method => {
            if (typeof stateHandler[method] !== 'function') {
                stateHandler[method] = () => {}; // Default empty function
            }
        });

        this.states.set(stateName, stateHandler);
        this.transitions.set(stateName, new Set());
        
        this.log(`State '${stateName}' registered`);
        return this;
    }

    // Add allowed transition between states
    addTransition(fromState, toState) {
        if (!this.states.has(fromState)) {
            throw new Error(`State '${fromState}' not registered`);
        }
        if (!this.states.has(toState)) {
            throw new Error(`State '${toState}' not registered`);
        }

        this.transitions.get(fromState).add(toState);
        this.log(`Transition added: ${fromState} -> ${toState}`);
        return this;
    }

    // Add bidirectional transition
    addBidirectionalTransition(stateA, stateB) {
        this.addTransition(stateA, stateB);
        this.addTransition(stateB, stateA);
        return this;
    }

    // Change to new state
    changeState(newState) {
        if (!this.states.has(newState)) {
            throw new Error(`State '${newState}' not registered`);
        }

        // Check if transition is allowed
        if (this.currentState && !this.transitions.get(this.currentState).has(newState)) {
            this.log(`Warning: Transition from '${this.currentState}' to '${newState}' not explicitly allowed`);
        }

        // Exit current state
        if (this.currentState) {
            this.log(`Exiting state: ${this.currentState}`);
            this.states.get(this.currentState).onExit();
            this.emit('stateExit', this.currentState);
        }

        // Update state tracking
        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateHistory.push({
            state: newState,
            timestamp: Date.now(),
            from: this.previousState
        });

        // Keep history manageable
        if (this.stateHistory.length > 50) {
            this.stateHistory.shift();
        }

        // Enter new state
        this.log(`Entering state: ${newState}`);
        this.states.get(newState).onEnter();
        this.emit('stateEnter', newState);
        this.emit('stateChange', { from: this.previousState, to: newState });

        return this;
    }

    // Update current state
    update(deltaTime = 0) {
        if (this.currentState && this.states.has(this.currentState)) {
            this.states.get(this.currentState).onUpdate(deltaTime);
        }
    }

    // Get current state
    getCurrentState() {
        return this.currentState;
    }

    // Get previous state
    getPreviousState() {
        return this.previousState;
    }

    // Check if currently in specific state
    isInState(stateName) {
        return this.currentState === stateName;
    }

    // Go back to previous state
    goToPreviousState() {
        if (this.previousState) {
            this.changeState(this.previousState);
        }
        return this;
    }

    // Get state history
    getStateHistory() {
        return [...this.stateHistory];
    }

    // Get time spent in current state
    getTimeInCurrentState() {
        if (this.stateHistory.length === 0) return 0;
        const lastEntry = this.stateHistory[this.stateHistory.length - 1];
        return Date.now() - lastEntry.timestamp;
    }

    // Event system for state changes
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
        return this;
    }

    // Remove event listener
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
        return this;
    }

    // Emit event
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in FSM event listener for '${event}':`, error);
                }
            });
        }
    }

    // Enable/disable debug logging
    setDebug(enabled) {
        this.debug = enabled;
        this.log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
        return this;
    }

    // Log function
    log(message) {
        if (this.debug) {
            console.log(`[FSM] ${message}`);
        }
    }

    // Get state machine statistics
    getStats() {
        return {
            currentState: this.currentState,
            previousState: this.previousState,
            totalStates: this.states.size,
            totalTransitions: Array.from(this.transitions.values()).reduce((sum, set) => sum + set.size, 0),
            historyLength: this.stateHistory.length,
            timeInCurrentState: this.getTimeInCurrentState(),
            registeredStates: Array.from(this.states.keys()),
            stateHistory: this.getStateHistory().slice(-10) // Last 10 states
        };
    }

    // Reset state machine
    reset() {
        // Exit current state
        if (this.currentState) {
            this.states.get(this.currentState).onExit();
        }

        this.currentState = null;
        this.previousState = null;
        this.stateHistory = [];
        
        this.log('State machine reset');
        return this;
    }

    // Validate state machine configuration
    validate() {
        const issues = [];

        // Check if any states are registered
        if (this.states.size === 0) {
            issues.push('No states registered');
        }

        // Check for unreachable states
        const reachableStates = new Set();
        if (this.states.size > 0) {
            // Start from first state as initial
            const initialState = Array.from(this.states.keys())[0];
            const stack = [initialState];
            
            while (stack.length > 0) {
                const current = stack.pop();
                if (!reachableStates.has(current)) {
                    reachableStates.add(current);
                    const transitions = this.transitions.get(current);
                    if (transitions) {
                        stack.push(...Array.from(transitions));
                    }
                }
            }

            // Find unreachable states
            const allStates = new Set(this.states.keys());
            const unreachable = new Set([...allStates].filter(state => !reachableStates.has(state)));
            
            if (unreachable.size > 0) {
                issues.push(`Unreachable states: ${Array.from(unreachable).join(', ')}`);
            }
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }

    // Create a visual representation of the state machine
    visualize() {
        let output = 'State Machine Visualization:\n';
        output += '================================\n\n';

        for (const [state, transitions] of this.transitions) {
            output += `${state}:\n`;
            if (transitions.size === 0) {
                output += '  (no transitions)\n';
            } else {
                for (const target of transitions) {
                    output += `  -> ${target}\n`;
                }
            }
            output += '\n';
        }

        if (this.currentState) {
            output += `Current State: ${this.currentState}\n`;
        }

        return output;
    }
}

// Game-specific FSM implementation
class EnergyQuestFSM extends FiniteStateMachine {
    constructor() {
        super();
        this.setupStates();
        this.setupTransitions();
        
        // Enable debug mode in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.setDebug(true);
        }
    }

    setupStates() {
        const states = GAME_CONSTANTS.GAME_STATES;

        // Loading State
        this.addState(states.LOADING, {
            onEnter: () => {
                console.log('Entering loading state');
                document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
                document.getElementById('loading-screen').classList.add('active');
            },
            onUpdate: (deltaTime) => {
                // Loading progress is handled by the game engine
            },
            onExit: () => {
                document.getElementById('loading-screen').classList.remove('active');
            }
        });

        // Opening State
        this.addState(states.OPENING, {
            onEnter: () => {
                console.log('Entering opening state');
                document.getElementById('opening-screen').classList.add('active');
                if (window.gameEngine) {
                    window.gameEngine.startOpeningAnimation();
                }
            },
            onUpdate: (deltaTime) => {
                // Opening animation is handled by the game engine
            },
            onExit: () => {
                document.getElementById('opening-screen').classList.remove('active');
            }
        });

        // Main Menu State
        this.addState(states.MAIN_MENU, {
            onEnter: () => {
                console.log('Entering main menu state');
                document.getElementById('main-menu-screen').classList.add('active');
                if (window.gameEngine) {
                    window.gameEngine.updateMainMenu();
                }
            },
            onUpdate: (deltaTime) => {
                // Menu updates handled by UI manager
            },
            onExit: () => {
                document.getElementById('main-menu-screen').classList.remove('active');
            }
        });

        // Game Levels
        [1, 2, 3, 4].forEach(level => {
            const levelState = `level_${level}`;
            this.addState(states[levelState.toUpperCase()], {
                onEnter: () => {
                    console.log(`Entering level ${level} state`);
                    document.getElementById('game-screen').classList.add('active');
                    if (window.gameEngine) {
                        window.gameEngine.startLevel(level);
                    }
                },
                onUpdate: (deltaTime) => {
                    if (window.gameEngine) {
                        window.gameEngine.updateLevel(level, deltaTime);
                    }
                },
                onExit: () => {
                    document.getElementById('game-screen').classList.remove('active');
                }
            });
        });

        // Settings State
        this.addState(states.SETTINGS, {
            onEnter: () => {
                console.log('Entering settings state');
                document.getElementById('settings-screen').classList.add('active');
            },
            onUpdate: (deltaTime) => {
                // Settings handled by UI manager
            },
            onExit: () => {
                document.getElementById('settings-screen').classList.remove('active');
            }
        });

        // About State
        this.addState(states.ABOUT, {
            onEnter: () => {
                console.log('Entering about state');
                document.getElementById('about-screen').classList.add('active');
            },
            onUpdate: (deltaTime) => {
                // About screen is static
            },
            onExit: () => {
                document.getElementById('about-screen').classList.remove('active');
            }
        });

        // Ending State
        this.addState(states.ENDING, {
            onEnter: () => {
                console.log('Entering ending state');
                document.getElementById('ending-screen').classList.add('active');
                if (window.gameEngine) {
                    window.gameEngine.startEndingSequence();
                }
            },
            onUpdate: (deltaTime) => {
                // Ending animation handled by game engine
            },
            onExit: () => {
                document.getElementById('ending-screen').classList.remove('active');
            }
        });
    }

    setupTransitions() {
        const states = GAME_CONSTANTS.GAME_STATES;

        // Loading can go to opening or main menu
        this.addTransition(states.LOADING, states.OPENING);
        this.addTransition(states.LOADING, states.MAIN_MENU);

        // Opening goes to main menu
        this.addTransition(states.OPENING, states.MAIN_MENU);

        // Main menu can go to levels, settings, about
        this.addTransition(states.MAIN_MENU, states.LEVEL_1);
        this.addTransition(states.MAIN_MENU, states.SETTINGS);
        this.addTransition(states.MAIN_MENU, states.ABOUT);

        // Levels can go to next level or back to menu
        this.addTransition(states.LEVEL_1, states.LEVEL_2);
        this.addTransition(states.LEVEL_1, states.MAIN_MENU);
        
        this.addTransition(states.LEVEL_2, states.LEVEL_3);
        this.addTransition(states.LEVEL_2, states.MAIN_MENU);
        
        this.addTransition(states.LEVEL_3, states.LEVEL_4);
        this.addTransition(states.LEVEL_3, states.MAIN_MENU);
        
        this.addTransition(states.LEVEL_4, states.ENDING);
        this.addTransition(states.LEVEL_4, states.MAIN_MENU);

        // Settings and About can return to main menu
        this.addTransition(states.SETTINGS, states.MAIN_MENU);
        this.addTransition(states.ABOUT, states.MAIN_MENU);

        // Ending can go back to main menu or restart
        this.addTransition(states.ENDING, states.MAIN_MENU);
        this.addTransition(states.ENDING, states.OPENING);
    }

    // Game-specific methods
    startGame() {
        this.changeState(GAME_CONSTANTS.GAME_STATES.LEVEL_1);
    }

    goToMainMenu() {
        this.changeState(GAME_CONSTANTS.GAME_STATES.MAIN_MENU);
    }

    goToSettings() {
        this.changeState(GAME_CONSTANTS.GAME_STATES.SETTINGS);
    }

    goToAbout() {
        this.changeState(GAME_CONSTANTS.GAME_STATES.ABOUT);
    }

    nextLevel() {
        const states = GAME_CONSTANTS.GAME_STATES;
        const currentState = this.getCurrentState();
        
        switch (currentState) {
            case states.LEVEL_1:
                this.changeState(states.LEVEL_2);
                break;
            case states.LEVEL_2:
                this.changeState(states.LEVEL_3);
                break;
            case states.LEVEL_3:
                this.changeState(states.LEVEL_4);
                break;
            case states.LEVEL_4:
                this.changeState(states.ENDING);
                break;
            default:
                console.warn(`Cannot go to next level from state: ${currentState}`);
        }
    }

    restartGame() {
        this.changeState(GAME_CONSTANTS.GAME_STATES.OPENING);
    }

    completeGame() {
        this.changeState(GAME_CONSTANTS.GAME_STATES.ENDING);
    }
}

// Create global FSM instance
window.gameFSM = new EnergyQuestFSM();