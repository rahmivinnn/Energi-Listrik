using UnityEngine;
using UnityEngine.UI;
using EnergyQuest.Core;
using EnergyQuest.Audio;

namespace EnergyQuest.GameStates
{
    public class MainMenuHandler : MonoBehaviour, IGameState
    {
        [Header("Main Menu UI")]
        public Canvas mainMenuCanvas;
        public Button startGameButton;
        public Button continueButton;
        public Button settingsButton;
        public Button aboutButton;
        public Button quitButton;

        [Header("Background Elements")]
        public GameObject mysteriousHouseBackground;
        public Light glowingDoorLight;
        public ParticleSystem ambientParticles;

        [Header("Title")]
        public Text gameTitle;
        public Text gameSubtitle;

        [Header("Continue Game")]
        public GameObject continueGamePanel;
        public Text progressText;

        private AudioManager audioManager;
        private bool hasExistingSave;

        private void Awake()
        {
            audioManager = FindObjectOfType<AudioManager>();
            SetupButtonListeners();
            CheckForExistingSave();
        }

        public void OnStateEnter()
        {
            // Activate main menu canvas
            if (mainMenuCanvas != null)
                mainMenuCanvas.gameObject.SetActive(true);

            // Play ambient background music
            if (audioManager != null)
            {
                audioManager.PlayBackgroundMusic("main_menu_ambient");
            }

            // Animate glowing door
            if (glowingDoorLight != null)
            {
                StartCoroutine(AnimateGlowingDoor());
            }

            // Start ambient particles
            if (ambientParticles != null)
            {
                ambientParticles.Play();
            }

            // Update continue button state
            UpdateContinueButtonState();

            // Animate title entrance
            AnimateTitle();
        }

        public void OnStateUpdate()
        {
            // Handle keyboard shortcuts
            if (Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.Space))
            {
                StartNewGame();
            }
            else if (Input.GetKeyDown(KeyCode.Escape))
            {
                QuitGame();
            }
        }

        public void OnStateExit()
        {
            // Deactivate main menu canvas
            if (mainMenuCanvas != null)
                mainMenuCanvas.gameObject.SetActive(false);

            // Stop ambient effects
            if (ambientParticles != null)
                ambientParticles.Stop();

            StopAllCoroutines();
        }

        private void SetupButtonListeners()
        {
            if (startGameButton != null)
                startGameButton.onClick.AddListener(StartNewGame);

            if (continueButton != null)
                continueButton.onClick.AddListener(ContinueGame);

            if (settingsButton != null)
                settingsButton.onClick.AddListener(OpenSettings);

            if (aboutButton != null)
                aboutButton.onClick.AddListener(OpenAbout);

            if (quitButton != null)
                quitButton.onClick.AddListener(QuitGame);
        }

        private void CheckForExistingSave()
        {
            hasExistingSave = PlayerPrefs.HasKey("CurrentLevel");
            
            if (hasExistingSave)
            {
                int savedLevel = PlayerPrefs.GetInt("CurrentLevel", 1);
                int collectedKeys = 0;
                
                for (int i = 0; i < 4; i++)
                {
                    if (PlayerPrefs.GetInt($"EnergyKey_{i}", 0) == 1)
                        collectedKeys++;
                }

                if (progressText != null)
                {
                    progressText.text = $"Level {savedLevel}\nKunci Energi: {collectedKeys}/4";
                }
            }
        }

        private void UpdateContinueButtonState()
        {
            if (continueButton != null)
            {
                continueButton.interactable = hasExistingSave;
                
                // Visual feedback for disabled button
                var buttonColors = continueButton.colors;
                buttonColors.disabledColor = new Color(0.5f, 0.5f, 0.5f, 0.5f);
                continueButton.colors = buttonColors;
            }
        }

        private void AnimateTitle()
        {
            if (gameTitle != null)
            {
                StartCoroutine(ElectricalTextEffect(gameTitle));
            }
        }

        private System.Collections.IEnumerator AnimateGlowingDoor()
        {
            if (glowingDoorLight == null) yield break;

            float baseIntensity = glowingDoorLight.intensity;

            while (true)
            {
                // Breathing light effect
                float time = Time.time * 2f;
                float intensity = baseIntensity + Mathf.Sin(time) * 0.3f;
                glowingDoorLight.intensity = Mathf.Max(0.1f, intensity);

                yield return null;
            }
        }

        private System.Collections.IEnumerator ElectricalTextEffect(Text textComponent)
        {
            Color originalColor = textComponent.color;

            while (true)
            {
                // Random electrical flicker
                if (Random.Range(0f, 1f) < 0.05f)
                {
                    textComponent.color = new Color(0.8f, 0.9f, 1f, 1f); // Electric blue
                    yield return new WaitForSeconds(0.1f);
                    textComponent.color = originalColor;
                    yield return new WaitForSeconds(Random.Range(2f, 5f));
                }

                yield return null;
            }
        }

        // Button event handlers
        public void StartNewGame()
        {
            if (audioManager != null)
            {
                audioManager.PlaySFX("button_click");
            }

            // Reset game progress
            GameManager.Instance.ResetGameProgress();
            
            // Start from Level 1
            FiniteStateMachine.Instance.ChangeState(GameState.Level1_LivingRoom);
        }

        public void ContinueGame()
        {
            if (!hasExistingSave) return;

            if (audioManager != null)
            {
                audioManager.PlaySFX("button_click");
            }

            // Load saved progress
            GameManager.Instance.LoadGameProgress();

            // Continue from saved level
            int savedLevel = PlayerPrefs.GetInt("CurrentLevel", 1);
            GameState targetState = GameState.Level1_LivingRoom;

            switch (savedLevel)
            {
                case 1: targetState = GameState.Level1_LivingRoom; break;
                case 2: targetState = GameState.Level2_Kitchen; break;
                case 3: targetState = GameState.Level3_Laboratory; break;
                case 4: targetState = GameState.Level4_Basement; break;
                default: targetState = GameState.Level1_LivingRoom; break;
            }

            FiniteStateMachine.Instance.ChangeState(targetState);
        }

        public void OpenSettings()
        {
            if (audioManager != null)
            {
                audioManager.PlaySFX("button_click");
            }

            FiniteStateMachine.Instance.ChangeState(GameState.Settings);
        }

        public void OpenAbout()
        {
            if (audioManager != null)
            {
                audioManager.PlaySFX("button_click");
            }

            FiniteStateMachine.Instance.ChangeState(GameState.About);
        }

        public void QuitGame()
        {
            if (audioManager != null)
            {
                audioManager.PlaySFX("button_click");
            }

            // Save current progress before quitting
            GameManager.Instance.SaveGameProgress();

            #if UNITY_EDITOR
                UnityEditor.EditorApplication.isPlaying = false;
            #else
                Application.Quit();
            #endif
        }

        private void OnDestroy()
        {
            // Remove button listeners to prevent memory leaks
            if (startGameButton != null) startGameButton.onClick.RemoveAllListeners();
            if (continueButton != null) continueButton.onClick.RemoveAllListeners();
            if (settingsButton != null) settingsButton.onClick.RemoveAllListeners();
            if (aboutButton != null) aboutButton.onClick.RemoveAllListeners();
            if (quitButton != null) quitButton.onClick.RemoveAllListeners();
        }
    }
}