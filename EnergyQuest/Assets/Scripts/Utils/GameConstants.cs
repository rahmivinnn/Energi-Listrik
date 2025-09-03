namespace EnergyQuest.Utils
{
    public static class GameConstants
    {
        // Game Information
        public const string GAME_TITLE = "Energy Quest: Misteri Hemat Listrik";
        public const string GAME_VERSION = "1.0.0";
        public const string COMPANY_NAME = "EnergyQuest Team";

        // Level Configuration
        public const int TOTAL_LEVELS = 4;
        public const int TOTAL_ENERGY_KEYS = 4;

        // Energy Calculation
        public const float PLN_TARIFF_PER_KWH = 1467.28f; // Rupiah per kWh
        public const float TARGET_MONTHLY_BILL = 300000f; // Rp 300,000
        public const float MAX_MONTHLY_BILL = 500000f; // Rp 500,000

        // Quiz Configuration
        public const int QUIZ_QUESTIONS_PER_SESSION = 10;
        public const int TOTAL_QUIZ_QUESTIONS = 20;
        public const float QUIZ_TIME_PER_QUESTION = 30f; // seconds
        public const float QUIZ_PASSING_SCORE = 70f; // percentage

        // UI Configuration
        public const float MIN_BUTTON_SIZE = 44f; // points (iOS HIG standard)
        public const float TYPEWRITER_SPEED = 0.05f; // seconds per character
        public const float FEEDBACK_DISPLAY_TIME = 3f; // seconds

        // Performance
        public const int TARGET_FPS = 60;
        public const int FALLBACK_FPS = 30;
        public const int MAX_PARTICLES = 100;

        // Audio
        public const float DEFAULT_MASTER_VOLUME = 1f;
        public const float DEFAULT_MUSIC_VOLUME = 0.7f;
        public const float DEFAULT_SFX_VOLUME = 1f;
        public const float DEFAULT_NARRATION_VOLUME = 1f;

        // Input
        public const float TOUCH_SENSITIVITY = 1f;
        public const float DOUBLE_TAP_TIME = 0.3f;
        public const float LONG_PRESS_TIME = 1f;

        // Scene Names
        public const string MAIN_SCENE = "MainScene";
        public const string OPENING_SCENE = "OpeningScene";
        public const string LEVEL1_SCENE = "Level1_LivingRoom";
        public const string LEVEL2_SCENE = "Level2_Kitchen";
        public const string LEVEL3_SCENE = "Level3_Laboratory";
        public const string LEVEL4_SCENE = "Level4_Basement";
        public const string ENDING_SCENE = "EndingScene";

        // PlayerPrefs Keys
        public const string PREF_CURRENT_LEVEL = "CurrentLevel";
        public const string PREF_GAME_COMPLETED = "GameCompleted";
        public const string PREF_ENERGY_KEY_PREFIX = "EnergyKey_";
        public const string PREF_MASTER_VOLUME = "MasterVolume";
        public const string PREF_MUSIC_VOLUME = "MusicVolume";
        public const string PREF_SFX_VOLUME = "SFXVolume";
        public const string PREF_NARRATION_VOLUME = "NarrationVolume";
        public const string PREF_SUBTITLES_ENABLED = "SubtitlesEnabled";
        public const string PREF_TEXT_SPEED = "TextSpeed";
        public const string PREF_TUTORIAL_ENABLED = "TutorialEnabled";
        public const string PREF_GAME_LAUNCHED = "GameLaunched";

        // Tags
        public const string TAG_PLAYER = "Player";
        public const string TAG_INTERACTABLE = "Interactable";
        public const string TAG_ENERGY_KEY = "EnergyKey";
        public const string TAG_PUZZLE_COMPONENT = "PuzzleComponent";
        public const string TAG_HOUSE_GATE = "HouseGate";

        // Layers
        public const int LAYER_DEFAULT = 0;
        public const int LAYER_UI = 5;
        public const int LAYER_INTERACTABLE = 8;
        public const int LAYER_PUZZLE = 9;

        // Educational Content Categories
        public static class EducationalTopics
        {
            public const string BASIC_ELECTRICITY = "Dasar Kelistrikan";
            public const string ENERGY_EFFICIENCY = "Efisiensi Energi";
            public const string ENERGY_CALCULATION = "Perhitungan Energi";
            public const string ELECTRICAL_SAFETY = "Keamanan Listrik";
            public const string RENEWABLE_ENERGY = "Energi Terbarukan";
        }

        // Common Appliance Power Ratings (Watts)
        public static class AppliancePower
        {
            public const float REFRIGERATOR = 150f;
            public const float LED_LAMP = 10f;
            public const float INCANDESCENT_LAMP = 60f;
            public const float TV = 200f;
            public const float AIR_CONDITIONER = 1500f;
            public const float RICE_COOKER = 400f;
            public const float MICROWAVE = 800f;
            public const float IRON = 1000f;
            public const float FAN = 75f;
            public const float PHONE_CHARGER = 20f;
            public const float BLENDER = 300f;
        }

        // Efficiency Ratings
        public static class EfficiencyRatings
        {
            public const float VERY_EFFICIENT_THRESHOLD = 200000f; // Rp
            public const float EFFICIENT_THRESHOLD = 300000f; // Rp
            public const float MODERATE_THRESHOLD = 500000f; // Rp
            public const float WASTEFUL_THRESHOLD = 800000f; // Rp
            // Above 800k = Very Wasteful
        }

        // Animation Durations
        public static class AnimationDurations
        {
            public const float FADE_IN = 1f;
            public const float FADE_OUT = 1f;
            public const float DOOR_OPEN = 2f;
            public const float KEY_COLLECTION = 2f;
            public const float LEVEL_TRANSITION = 3f;
            public const float UI_POPUP = 0.5f;
        }

        // Error Messages
        public static class ErrorMessages
        {
            public const string CIRCUIT_OPEN = "Rangkaian terbuka atau salah sambung. Arus tidak mengalir.";
            public const string POWER_NOT_CONNECTED = "Pastikan semua perangkat mendapat aliran listrik dengan benar.";
            public const string FOLLOW_SEQUENCE = "Ikuti urutan yang benar!";
            public const string ESSENTIAL_APPLIANCE = "tidak bisa dimatikan karena penting untuk";
            public const string MISSING_KEYS = "Kunci Energi tidak lengkap! Masih perlu";
            public const string BILL_TOO_HIGH = "Tagihan terlalu tinggi! Coba matikan perangkat yang tidak perlu.";
        }

        // Success Messages
        public static class SuccessMessages
        {
            public const string CIRCUIT_COMPLETE = "Listrik mengalir dalam rangkaian tertutup.";
            public const string EFFICIENT_USAGE = "Penggunaan energi yang efisien!";
            public const string NATURAL_LIGHT = "Bagus! Menggunakan cahaya alami menghemat energi listrik.";
            public const string QUICK_FRIDGE_CLOSE = "Menutup kulkas dengan cepat menghemat energi.";
            public const string LEVEL_COMPLETE = "Level selesai! Pemahaman energi meningkat.";
            public const string KEY_COLLECTED = "Kunci Energi dikumpulkan!";
        }
    }
}