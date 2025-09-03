// Energy Quest: Misteri Hemat Listrik - Main Entry Point

// Global game state
window.ENERGY_QUEST = {
    version: '1.0.0',
    initialized: false,
    startTime: Date.now()
};

// Main initialization function
async function initializeGame() {
    try {
        console.log('🚀 Starting Energy Quest: Misteri Hemat Listrik');
        console.log('📱 Platform:', GAME_UTILS.isMobile() ? 'Mobile' : 'Desktop');
        console.log('👆 Touch Support:', GAME_UTILS.isTouchDevice() ? 'Yes' : 'No');

        // Initialize core systems
        await window.gameEngine.initialize();
        
        // Mark as initialized
        window.ENERGY_QUEST.initialized = true;
        
        console.log('✅ Game initialization completed');
        console.log(`⏱️ Initialization time: ${Date.now() - window.ENERGY_QUEST.startTime}ms`);

    } catch (error) {
        console.error('❌ Game initialization failed:', error);
        showCriticalError('Gagal memuat game. Silakan refresh halaman.');
    }
}

// Critical error handler
function showCriticalError(message) {
    document.body.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
        ">
            <div>
                <h1 style="color: #ff4444; margin-bottom: 20px;">⚠️ Error</h1>
                <p style="font-size: 1.2rem; margin-bottom: 30px;">${message}</p>
                <button onclick="location.reload()" style="
                    background: linear-gradient(135deg, #00ffff, #0099cc);
                    color: #000;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    font-weight: bold;
                ">🔄 Muat Ulang</button>
            </div>
        </div>
    `;
}

// Performance monitoring
function monitorPerformance() {
    if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark('game-start');
        
        window.addEventListener('load', () => {
            performance.mark('game-loaded');
            performance.measure('game-load-time', 'game-start', 'game-loaded');
            
            const measure = performance.getEntriesByName('game-load-time')[0];
            console.log(`📊 Game load time: ${measure.duration.toFixed(2)}ms`);
        });
    }
}

// Mobile-specific optimizations
function optimizeForMobile() {
    if (GAME_UTILS.isMobile()) {
        // Prevent zoom on double tap
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Prevent pull-to-refresh
        document.body.style.overscrollBehavior = 'none';
        
        // Lock orientation to landscape if possible
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {
                console.log('Orientation lock not supported');
            });
        }

        console.log('📱 Mobile optimizations applied');
    }
}

// PWA installation prompt
function setupPWAInstall() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button or banner
        showInstallPrompt(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
        console.log('📱 PWA installed successfully');
        deferredPrompt = null;
    });
}

function showInstallPrompt(deferredPrompt) {
    // Create install button
    const installButton = document.createElement('button');
    installButton.textContent = '📱 Install Game';
    installButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #00ffff, #0099cc);
        color: #000;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1001;
        font-size: 0.9rem;
    `;

    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('📱 User accepted PWA install');
            }
            
            deferredPrompt = null;
            installButton.remove();
        }
    });

    document.body.appendChild(installButton);

    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (installButton.parentNode) {
            installButton.remove();
        }
    }, 10000);
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('🚨 Global error:', e.error);
    
    // Don't show critical error for minor issues
    if (e.error && e.error.name !== 'TypeError') {
        window.uiManager?.showToast('Terjadi kesalahan. Game mungkin tidak berfungsi dengan normal.', 'error');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Unhandled promise rejection:', e.reason);
    e.preventDefault(); // Prevent default browser behavior
});

// Visibility change handling (for mobile)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Game is now hidden/minimized
        if (window.gameEngine && window.gameEngine.currentLevel) {
            window.uiManager?.saveGameProgress();
        }
        
        // Pause audio
        window.audioManager?.setMuted(true);
        
        console.log('🔇 Game minimized - audio muted');
    } else {
        // Game is now visible again
        window.audioManager?.setMuted(false);
        console.log('🔊 Game restored - audio unmuted');
    }
});

// Online/offline detection
window.addEventListener('online', () => {
    console.log('🌐 Connection restored');
    window.uiManager?.showToast('Koneksi internet tersedia', 'success', 2000);
});

window.addEventListener('offline', () => {
    console.log('📡 Connection lost');
    window.uiManager?.showToast('Mode offline - beberapa fitur mungkin terbatas', 'warning', 3000);
});

// Battery API (if supported)
if ('getBattery' in navigator) {
    navigator.getBattery().then((battery) => {
        function updateBatteryInfo() {
            const level = Math.round(battery.level * 100);
            
            if (level < 20 && !battery.charging) {
                console.log('🔋 Low battery detected');
                // Could implement power saving mode here
            }
        }

        battery.addEventListener('chargingchange', updateBatteryInfo);
        battery.addEventListener('levelchange', updateBatteryInfo);
        updateBatteryInfo();
    });
}

// Debug mode activation
function enableDebugMode() {
    window.ENERGY_QUEST.debug = true;
    window.gameFSM.setDebug(true);
    
    // Add debug info to UI
    const debugInfo = document.createElement('div');
    debugInfo.id = 'debug-info';
    debugInfo.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: #00ff00;
        font-family: monospace;
        font-size: 12px;
        padding: 10px;
        border-radius: 5px;
        z-index: 9999;
        max-width: 300px;
    `;
    document.body.appendChild(debugInfo);

    // Update debug info periodically
    setInterval(() => {
        if (window.gameFSM && debugInfo) {
            const stats = window.gameFSM.getStats();
            const audioStatus = window.audioManager?.getStatus() || {};
            
            debugInfo.innerHTML = `
                <strong>DEBUG INFO</strong><br>
                State: ${stats.currentState || 'None'}<br>
                Previous: ${stats.previousState || 'None'}<br>
                Time in State: ${Math.round(stats.timeInCurrentState / 1000)}s<br>
                Audio: ${audioStatus.musicPlaying ? '🎵' : '🔇'}<br>
                FPS: ${Math.round(1000 / (performance.now() - window.ENERGY_QUEST.lastFrame))}<br>
                Level: ${window.gameEngine?.currentLevel || 'None'}
            `;
            window.ENERGY_QUEST.lastFrame = performance.now();
        }
    }, 1000);

    console.log('🔧 Debug mode enabled');
}

// Check for debug mode
if (window.location.search.includes('debug=true') || 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1') {
    enableDebugMode();
}

// Keyboard shortcuts for debug
document.addEventListener('keydown', (e) => {
    if (window.ENERGY_QUEST.debug) {
        switch (e.code) {
            case 'Digit1':
                if (e.ctrlKey) window.gameFSM.changeState(GAME_CONSTANTS.GAME_STATES.LEVEL_1);
                break;
            case 'Digit2':
                if (e.ctrlKey) window.gameFSM.changeState(GAME_CONSTANTS.GAME_STATES.LEVEL_2);
                break;
            case 'Digit3':
                if (e.ctrlKey) window.gameFSM.changeState(GAME_CONSTANTS.GAME_STATES.LEVEL_3);
                break;
            case 'Digit4':
                if (e.ctrlKey) window.gameFSM.changeState(GAME_CONSTANTS.GAME_STATES.LEVEL_4);
                break;
            case 'KeyR':
                if (e.ctrlKey) window.uiManager.resetGameProgress();
                break;
            case 'KeyC':
                if (e.ctrlKey) {
                    // Collect all energy keys (debug)
                    for (let i = 0; i < 4; i++) {
                        window.uiManager.collectEnergyKey(i);
                    }
                }
                break;
        }
    }
});

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        monitorPerformance();
        optimizeForMobile();
        setupPWAInstall();
        initializeGame();
    });
} else {
    // DOM already loaded
    monitorPerformance();
    optimizeForMobile();
    setupPWAInstall();
    initializeGame();
}

// Export for debugging
window.initializeGame = initializeGame;
window.enableDebugMode = enableDebugMode;