// Energy Quest: Misteri Hemat Listrik - Game Constants
const GAME_CONSTANTS = {
    // Game Information
    GAME_TITLE: "Energy Quest: Misteri Hemat Listrik",
    GAME_VERSION: "1.0.0",
    COMPANY_NAME: "EnergyQuest Team",

    // Level Configuration
    TOTAL_LEVELS: 4,
    TOTAL_ENERGY_KEYS: 4,

    // Energy Calculation
    PLN_TARIFF_PER_KWH: 1467.28, // Rupiah per kWh (2024)
    TARGET_MONTHLY_BILL: 300000, // Rp 300,000
    MAX_MONTHLY_BILL: 500000, // Rp 500,000

    // Quiz Configuration
    QUIZ_QUESTIONS_PER_SESSION: 10,
    TOTAL_QUIZ_QUESTIONS: 20,
    QUIZ_TIME_PER_QUESTION: 30, // seconds
    QUIZ_PASSING_SCORE: 70, // percentage

    // UI Configuration
    TYPEWRITER_SPEED: 50, // milliseconds per character
    FEEDBACK_DISPLAY_TIME: 3000, // milliseconds
    TOAST_DISPLAY_TIME: 4000, // milliseconds

    // Audio
    DEFAULT_MASTER_VOLUME: 1.0,
    DEFAULT_MUSIC_VOLUME: 0.7,
    DEFAULT_SFX_VOLUME: 1.0,

    // Game States
    GAME_STATES: {
        LOADING: 'loading',
        OPENING: 'opening',
        MAIN_MENU: 'main_menu',
        LEVEL_1: 'level_1',
        LEVEL_2: 'level_2',
        LEVEL_3: 'level_3',
        LEVEL_4: 'level_4',
        SETTINGS: 'settings',
        ABOUT: 'about',
        ENDING: 'ending'
    },

    // Storage Keys
    STORAGE_KEYS: {
        CURRENT_LEVEL: 'currentLevel',
        ENERGY_KEYS: 'energyKeys',
        GAME_COMPLETED: 'gameCompleted',
        MASTER_VOLUME: 'masterVolume',
        MUSIC_VOLUME: 'musicVolume',
        SFX_VOLUME: 'sfxVolume',
        SUBTITLES_ENABLED: 'subtitlesEnabled',
        TUTORIAL_ENABLED: 'tutorialEnabled',
        FIRST_LAUNCH: 'firstLaunch'
    },

    // Appliance Power Ratings (Watts)
    APPLIANCES: {
        REFRIGERATOR: { name: 'Kulkas', power: 150, essential: true, defaultHours: 24 },
        LED_LAMP: { name: 'Lampu LED', power: 10, essential: false, defaultHours: 8 },
        TV: { name: 'TV', power: 200, essential: false, defaultHours: 6 },
        AIR_CONDITIONER: { name: 'AC', power: 1500, essential: false, defaultHours: 8 },
        RICE_COOKER: { name: 'Rice Cooker', power: 400, essential: false, defaultHours: 2 },
        MICROWAVE: { name: 'Microwave', power: 800, essential: false, defaultHours: 0.5 },
        IRON: { name: 'Setrika', power: 1000, essential: false, defaultHours: 1 },
        FAN: { name: 'Kipas Angin', power: 75, essential: false, defaultHours: 10 },
        PHONE_CHARGER: { name: 'Charger HP', power: 20, essential: false, defaultHours: 4 },
        BLENDER: { name: 'Blender', power: 300, essential: false, defaultHours: 0.3 }
    },

    // Efficiency Ratings
    EFFICIENCY: {
        VERY_EFFICIENT: { threshold: 200000, label: 'SANGAT HEMAT', color: '#00ff00' },
        EFFICIENT: { threshold: 300000, label: 'HEMAT', color: '#66ff66' },
        MODERATE: { threshold: 500000, label: 'SEDANG', color: '#ffff00' },
        WASTEFUL: { threshold: 800000, label: 'BOROS', color: '#ff6600' },
        VERY_WASTEFUL: { threshold: Infinity, label: 'SANGAT BOROS', color: '#ff0000' }
    },

    // Animation Durations (milliseconds)
    ANIMATIONS: {
        FADE_IN: 500,
        FADE_OUT: 500,
        SLIDE_UP: 300,
        TOAST_SLIDE: 300,
        LOADING_BAR: 100,
        STATE_TRANSITION: 500
    },

    // Canvas Dimensions
    CANVAS: {
        WIDTH: 1280,
        HEIGHT: 720,
        ASPECT_RATIO: 16/9
    },

    // Colors
    COLORS: {
        PRIMARY: '#00ffff',
        SECONDARY: '#0099cc',
        SUCCESS: '#44ff44',
        ERROR: '#ff4444',
        WARNING: '#ffff44',
        BACKGROUND: '#1a1a2e',
        TEXT: '#ffffff',
        TEXT_SECONDARY: '#cccccc'
    },

    // Educational Content Categories
    EDUCATIONAL_CATEGORIES: {
        BASIC_ELECTRICITY: 'Dasar Kelistrikan',
        ENERGY_EFFICIENCY: 'Efisiensi Energi',
        ENERGY_CALCULATION: 'Perhitungan Energi',
        ELECTRICAL_SAFETY: 'Keamanan Listrik',
        RENEWABLE_ENERGY: 'Energi Terbarukan'
    },

    // Error Messages
    MESSAGES: {
        ERRORS: {
            CIRCUIT_OPEN: 'Rangkaian terbuka atau salah sambung. Arus tidak mengalir.',
            POWER_NOT_CONNECTED: 'Pastikan semua perangkat mendapat aliran listrik dengan benar.',
            FOLLOW_SEQUENCE: 'Ikuti urutan yang benar!',
            ESSENTIAL_APPLIANCE: 'tidak bisa dimatikan karena penting',
            MISSING_KEYS: 'Kunci Energi tidak lengkap! Masih perlu',
            BILL_TOO_HIGH: 'Tagihan terlalu tinggi! Coba matikan perangkat yang tidak perlu.',
            LOAD_ERROR: 'Gagal memuat resource. Periksa koneksi internet.',
            SAVE_ERROR: 'Gagal menyimpan progress.'
        },
        SUCCESS: {
            CIRCUIT_COMPLETE: 'Listrik mengalir dalam rangkaian tertutup.',
            EFFICIENT_USAGE: 'Penggunaan energi yang efisien!',
            NATURAL_LIGHT: 'Bagus! Menggunakan cahaya alami menghemat energi listrik.',
            QUICK_FRIDGE_CLOSE: 'Menutup kulkas dengan cepat menghemat energi.',
            LEVEL_COMPLETE: 'Level selesai! Pemahaman energi meningkat.',
            KEY_COLLECTED: 'Kunci Energi dikumpulkan!',
            GAME_SAVED: 'Progress tersimpan.',
            QUIZ_PASSED: 'Quiz berhasil diselesaikan!'
        },
        INFO: {
            LOADING: 'Memuat game...',
            CALCULATING: 'Menghitung...',
            CONNECTING: 'Menghubungkan...',
            PROCESSING: 'Memproses...'
        }
    },

    // Level Objectives
    LEVEL_OBJECTIVES: {
        1: 'Nyalakan listrik di ruang tamu dan temukan petunjuk pertama',
        2: 'Kelola perangkat dapur secara efisien untuk menjaga Power Meter tetap hijau',
        3: 'Gunakan simulator untuk mengatur penggunaan energi rumah dengan efisien',
        4: 'Gunakan 4 Kunci Energi untuk membuka Gerbang Evaluasi Akhir'
    },

    // Audio Files
    AUDIO: {
        BACKGROUND_MUSIC: {
            THEME: 'audio/theme-music.mp3',
            OPENING: 'audio/opening-music.mp3',
            LEVEL_1: 'audio/level1-ambient.mp3',
            LEVEL_2: 'audio/level2-ambient.mp3',
            LEVEL_3: 'audio/level3-ambient.mp3',
            LEVEL_4: 'audio/level4-ambient.mp3',
            ENDING: 'audio/ending-music.mp3'
        },
        SFX: {
            CLICK: 'audio/sfx/click.mp3',
            SUCCESS: 'audio/sfx/success.mp3',
            ERROR: 'audio/sfx/error.mp3',
            KEY_COLLECTED: 'audio/sfx/key-collected.mp3',
            ELECTRICAL_BUZZ: 'audio/sfx/electrical-buzz.mp3',
            SWITCH_ON: 'audio/sfx/switch-on.mp3',
            SWITCH_OFF: 'audio/sfx/switch-off.mp3',
            TV_ON: 'audio/sfx/tv-on.mp3',
            APPLIANCE_ON: 'audio/sfx/appliance-on.mp3',
            CALCULATION: 'audio/sfx/calculation.mp3',
            QUIZ_CORRECT: 'audio/sfx/quiz-correct.mp3',
            QUIZ_WRONG: 'audio/sfx/quiz-wrong.mp3'
        },
        NARRATION: {
            OPENING_INTRO: 'audio/narration/opening-intro.mp3',
            LEVEL_1_INTRO: 'audio/narration/level1-intro.mp3',
            LEVEL_2_INTRO: 'audio/narration/level2-intro.mp3',
            LEVEL_3_INTRO: 'audio/narration/level3-intro.mp3',
            LEVEL_4_INTRO: 'audio/narration/level4-intro.mp3',
            SCIENTIST_MESSAGE: 'audio/narration/scientist-message.mp3',
            ENDING_MESSAGE: 'audio/narration/ending-message.mp3'
        }
    }
};

// Utility Functions
const GAME_UTILS = {
    // Format currency for Indonesian Rupiah
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    // Format energy consumption
    formatEnergy: (kwh) => {
        return `${kwh.toFixed(2)} kWh`;
    },

    // Get efficiency rating based on bill amount
    getEfficiencyRating: (monthlyBill) => {
        const efficiency = GAME_CONSTANTS.EFFICIENCY;
        if (monthlyBill <= efficiency.VERY_EFFICIENT.threshold) return efficiency.VERY_EFFICIENT;
        if (monthlyBill <= efficiency.EFFICIENT.threshold) return efficiency.EFFICIENT;
        if (monthlyBill <= efficiency.MODERATE.threshold) return efficiency.MODERATE;
        if (monthlyBill <= efficiency.WASTEFUL.threshold) return efficiency.WASTEFUL;
        return efficiency.VERY_WASTEFUL;
    },

    // Calculate efficiency percentage
    calculateEfficiencyPercentage: (actual, optimal) => {
        if (actual <= 0) return 100;
        if (optimal <= 0) return 0;
        return Math.min(100, (optimal / actual) * 100);
    },

    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for performance
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Generate unique ID
    generateId: () => {
        return '_' + Math.random().toString(36).substr(2, 9);
    },

    // Clamp value between min and max
    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },

    // Linear interpolation
    lerp: (start, end, factor) => {
        return start + (end - start) * factor;
    },

    // Map value from one range to another
    map: (value, inMin, inMax, outMin, outMax) => {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    // Check if device is mobile
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Check if device supports touch
    isTouchDevice: () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // Get canvas context with proper scaling
    getCanvasContext: (canvas) => {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        // Scale canvas for high DPI displays
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        return ctx;
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GAME_CONSTANTS, GAME_UTILS };
}