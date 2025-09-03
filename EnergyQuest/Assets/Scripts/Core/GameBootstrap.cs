using UnityEngine;
using UnityEngine.SceneManagement;
using EnergyQuest.Utils;

namespace EnergyQuest.Core
{
    /// <summary>
    /// Bootstrap script that ensures the game is properly initialized
    /// This should be the first script to run in the game
    /// </summary>
    public class GameBootstrap : MonoBehaviour
    {
        [Header("Bootstrap Configuration")]
        public bool autoInitialize = true;
        public bool showSplashScreen = true;
        public float splashDuration = 3f;

        [Header("Required Scenes")]
        public string mainSceneName = "MainScene";

        private static bool gameInitialized = false;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void Bootstrap()
        {
            if (gameInitialized) return;

            // Create bootstrap object
            GameObject bootstrapObj = new GameObject("GameBootstrap");
            DontDestroyOnLoad(bootstrapObj);
            
            GameBootstrap bootstrap = bootstrapObj.AddComponent<GameBootstrap>();
            bootstrap.InitializeGame();

            gameInitialized = true;
        }

        private void InitializeGame()
        {
            Debug.Log("=== ENERGY QUEST: MISTERI HEMAT LISTRIK ===");
            Debug.Log("Initializing game systems...");

            // Set up mobile configuration
            ConfigureMobile();

            // Load main scene if not already loaded
            if (SceneManager.GetActiveScene().name != mainSceneName)
            {
                SceneManager.LoadScene(mainSceneName);
            }

            if (showSplashScreen)
            {
                StartCoroutine(ShowSplashScreen());
            }
        }

        private void ConfigureMobile()
        {
            // Mobile-specific settings
            #if UNITY_ANDROID && !UNITY_EDITOR
            
            // Performance settings
            Application.targetFrameRate = GameConstants.TARGET_FPS;
            QualitySettings.vSyncCount = 0; // Disable VSync for mobile
            
            // Screen settings
            Screen.sleepTimeout = SleepTimeout.NeverSleep;
            Screen.orientation = ScreenOrientation.LandscapeLeft;
            
            // Memory settings
            QualitySettings.masterTextureLimit = 1; // Half resolution for mobile
            QualitySettings.anisotropicFiltering = AnisotropicFiltering.Disable;
            QualitySettings.antiAliasing = 0;
            
            Debug.Log("Mobile configuration applied");
            
            #endif
        }

        private System.Collections.IEnumerator ShowSplashScreen()
        {
            // Create simple splash screen
            GameObject splashObj = new GameObject("SplashScreen");
            Canvas splashCanvas = splashObj.AddComponent<Canvas>();
            splashCanvas.renderMode = RenderMode.ScreenSpaceOverlay;
            splashCanvas.sortingOrder = 1000;

            // Add splash image/text
            GameObject splashText = new GameObject("SplashText");
            splashText.transform.SetParent(splashCanvas.transform, false);

            UnityEngine.UI.Text text = splashText.AddComponent<UnityEngine.UI.Text>();
            text.text = GameConstants.GAME_TITLE;
            text.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            text.fontSize = 32;
            text.color = Color.white;
            text.alignment = TextAnchor.MiddleCenter;

            RectTransform textRect = splashText.GetComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;

            // Show for specified duration
            yield return new WaitForSeconds(splashDuration);

            // Destroy splash screen
            Destroy(splashObj);
        }

        private void OnApplicationPause(bool pauseStatus)
        {
            // Handle app pause/resume on mobile
            if (pauseStatus)
            {
                // Game paused - save progress
                if (GameManager.Instance != null)
                {
                    GameManager.Instance.SaveGameProgress();
                }
                
                Debug.Log("Game paused - progress saved");
            }
            else
            {
                // Game resumed
                Debug.Log("Game resumed");
            }
        }

        private void OnApplicationFocus(bool hasFocus)
        {
            // Handle app focus changes
            if (!hasFocus)
            {
                // Lost focus - pause game
                if (FiniteStateMachine.Instance != null && 
                    FiniteStateMachine.Instance.GetCurrentState() != GameState.Paused &&
                    FiniteStateMachine.Instance.GetCurrentState() != GameState.MainMenu)
                {
                    FiniteStateMachine.Instance.PauseGame();
                }
            }
        }

        private void OnDestroy()
        {
            gameInitialized = false;
        }
    }
}