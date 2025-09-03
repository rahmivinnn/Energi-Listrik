using UnityEngine;
using EnergyQuest.Core;
using EnergyQuest.Audio;
using EnergyQuest.UI;

namespace EnergyQuest.Core
{
    public class GameInitializer : MonoBehaviour
    {
        [Header("Core Systems")]
        public GameManager gameManagerPrefab;
        public FiniteStateMachine fsmPrefab;
        public AudioManager audioManagerPrefab;
        public UIManager uiManagerPrefab;

        [Header("Initialization Settings")]
        public bool initializeOnAwake = true;
        public bool debugInitialization = true;

        private void Awake()
        {
            if (initializeOnAwake)
            {
                InitializeGame();
            }
        }

        public void InitializeGame()
        {
            if (debugInitialization)
            {
                Debug.Log("Initializing Energy Quest: Misteri Hemat Listrik...");
            }

            // Initialize core systems in order
            InitializeGameManager();
            InitializeFiniteStateMachine();
            InitializeAudioManager();
            InitializeUIManager();

            // Setup mobile-specific configurations
            ConfigureForMobile();

            // Set initial game state
            SetInitialGameState();

            if (debugInitialization)
            {
                Debug.Log("Game initialization completed successfully!");
            }
        }

        private void InitializeGameManager()
        {
            if (GameManager.Instance == null)
            {
                if (gameManagerPrefab != null)
                {
                    Instantiate(gameManagerPrefab);
                }
                else
                {
                    // Create GameManager if no prefab provided
                    GameObject gmObject = new GameObject("GameManager");
                    gmObject.AddComponent<GameManager>();
                }

                if (debugInitialization)
                {
                    Debug.Log("GameManager initialized");
                }
            }
        }

        private void InitializeFiniteStateMachine()
        {
            if (FiniteStateMachine.Instance == null)
            {
                if (fsmPrefab != null)
                {
                    Instantiate(fsmPrefab);
                }
                else
                {
                    // Create FSM if no prefab provided
                    GameObject fsmObject = new GameObject("FiniteStateMachine");
                    fsmObject.AddComponent<FiniteStateMachine>();
                }

                if (debugInitialization)
                {
                    Debug.Log("FiniteStateMachine initialized");
                }
            }
        }

        private void InitializeAudioManager()
        {
            if (AudioManager.Instance == null)
            {
                if (audioManagerPrefab != null)
                {
                    Instantiate(audioManagerPrefab);
                }
                else
                {
                    // Create AudioManager if no prefab provided
                    GameObject audioObject = new GameObject("AudioManager");
                    audioObject.AddComponent<AudioManager>();
                }

                if (debugInitialization)
                {
                    Debug.Log("AudioManager initialized");
                }
            }
        }

        private void InitializeUIManager()
        {
            if (UIManager.Instance == null)
            {
                if (uiManagerPrefab != null)
                {
                    Instantiate(uiManagerPrefab);
                }
                else
                {
                    // Create UIManager if no prefab provided
                    GameObject uiObject = new GameObject("UIManager");
                    uiObject.AddComponent<UIManager>();
                }

                if (debugInitialization)
                {
                    Debug.Log("UIManager initialized");
                }
            }
        }

        private void ConfigureForMobile()
        {
            // Set target frame rate for mobile optimization
            Application.targetFrameRate = 60;

            // Prevent screen from sleeping during gameplay
            Screen.sleepTimeout = SleepTimeout.NeverSleep;

            // Set quality settings for mobile
            QualitySettings.SetQualityLevel(2); // Medium-High quality

            // Configure input for touch
            Input.multiTouchEnabled = true;

            // Set screen orientation
            Screen.orientation = ScreenOrientation.LandscapeLeft;

            if (debugInitialization)
            {
                Debug.Log("Mobile configuration applied");
            }
        }

        private void SetInitialGameState()
        {
            // Check if this is first launch or returning player
            bool isFirstLaunch = !PlayerPrefs.HasKey("GameLaunched");

            if (isFirstLaunch)
            {
                // First launch - start with opening scene
                PlayerPrefs.SetInt("GameLaunched", 1);
                PlayerPrefs.Save();

                if (FiniteStateMachine.Instance != null)
                {
                    FiniteStateMachine.Instance.ChangeState(GameState.OpeningScene);
                }
            }
            else
            {
                // Returning player - start with main menu
                if (FiniteStateMachine.Instance != null)
                {
                    FiniteStateMachine.Instance.ChangeState(GameState.MainMenu);
                }
            }

            if (debugInitialization)
            {
                Debug.Log($"Initial game state set: {(isFirstLaunch ? "OpeningScene" : "MainMenu")}");
            }
        }

        // Utility methods for testing
        [ContextMenu("Reset Game Data")]
        public void ResetGameData()
        {
            PlayerPrefs.DeleteAll();
            
            if (GameManager.Instance != null)
            {
                GameManager.Instance.ResetGameProgress();
            }

            Debug.Log("Game data reset completed");
        }

        [ContextMenu("Skip to Main Menu")]
        public void SkipToMainMenu()
        {
            if (FiniteStateMachine.Instance != null)
            {
                FiniteStateMachine.Instance.ChangeState(GameState.MainMenu);
            }
        }

        [ContextMenu("Skip to Level 1")]
        public void SkipToLevel1()
        {
            if (FiniteStateMachine.Instance != null)
            {
                FiniteStateMachine.Instance.ChangeState(GameState.Level1_LivingRoom);
            }
        }

        [ContextMenu("Unlock All Levels")]
        public void UnlockAllLevels()
        {
            if (GameManager.Instance != null)
            {
                // Collect all energy keys
                for (int i = 0; i < 4; i++)
                {
                    GameManager.Instance.CollectEnergyKey(i);
                }

                // Set max level
                GameManager.Instance.currentLevel = 4;
                GameManager.Instance.SaveGameProgress();
            }

            Debug.Log("All levels unlocked for testing");
        }
    }
}