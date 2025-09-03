using UnityEngine;
using UnityEngine.UI;
using EnergyQuest.Core;
using EnergyQuest.Audio;
using EnergyQuest.UI;

namespace EnergyQuest.GameStates
{
    public class SettingsHandler : MonoBehaviour, IGameState
    {
        [Header("Settings UI")]
        public Canvas settingsCanvas;
        public Text settingsTitle;

        [Header("Audio Settings")]
        public Slider masterVolumeSlider;
        public Slider musicVolumeSlider;
        public Slider sfxVolumeSlider;
        public Slider narrationVolumeSlider;
        public Text masterVolumeText;
        public Text musicVolumeText;
        public Text sfxVolumeText;
        public Text narrationVolumeText;

        [Header("Graphics Settings")]
        public Dropdown qualityDropdown;
        public Toggle fullscreenToggle;
        public Dropdown resolutionDropdown;

        [Header("Gameplay Settings")]
        public Toggle subtitlesToggle;
        public Slider textSpeedSlider;
        public Text textSpeedText;
        public Toggle tutorialToggle;

        [Header("Control Buttons")]
        public Button backButton;
        public Button resetButton;
        public Button applyButton;

        [Header("Reset Confirmation")]
        public GameObject resetConfirmationPanel;
        public Button confirmResetButton;
        public Button cancelResetButton;

        private bool settingsChanged = false;

        private void Awake()
        {
            SetupSettingsUI();
        }

        public void OnStateEnter()
        {
            // Activate settings canvas
            if (settingsCanvas != null)
                settingsCanvas.gameObject.SetActive(true);

            // Load current settings
            LoadCurrentSettings();

            // Play settings background music
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayBackgroundMusic("settings_ambient");
            }
        }

        public void OnStateUpdate()
        {
            // Handle escape key to return to main menu
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                ReturnToMainMenu();
            }
        }

        public void OnStateExit()
        {
            // Deactivate settings canvas
            if (settingsCanvas != null)
                settingsCanvas.gameObject.SetActive(false);

            // Save settings if changed
            if (settingsChanged)
            {
                SaveSettings();
            }
        }

        private void SetupSettingsUI()
        {
            // Audio sliders
            if (masterVolumeSlider != null)
                masterVolumeSlider.onValueChanged.AddListener(OnMasterVolumeChanged);

            if (musicVolumeSlider != null)
                musicVolumeSlider.onValueChanged.AddListener(OnMusicVolumeChanged);

            if (sfxVolumeSlider != null)
                sfxVolumeSlider.onValueChanged.AddListener(OnSFXVolumeChanged);

            if (narrationVolumeSlider != null)
                narrationVolumeSlider.onValueChanged.AddListener(OnNarrationVolumeChanged);

            // Graphics settings
            if (qualityDropdown != null)
            {
                qualityDropdown.ClearOptions();
                qualityDropdown.AddOptions(new System.Collections.Generic.List<string>
                {
                    "Rendah", "Sedang", "Tinggi", "Ultra"
                });
                qualityDropdown.onValueChanged.AddListener(OnQualityChanged);
            }

            if (fullscreenToggle != null)
                fullscreenToggle.onValueChanged.AddListener(OnFullscreenToggle);

            // Gameplay settings
            if (subtitlesToggle != null)
                subtitlesToggle.onValueChanged.AddListener(OnSubtitlesToggle);

            if (textSpeedSlider != null)
                textSpeedSlider.onValueChanged.AddListener(OnTextSpeedChanged);

            if (tutorialToggle != null)
                tutorialToggle.onValueChanged.AddListener(OnTutorialToggle);

            // Control buttons
            if (backButton != null)
                backButton.onClick.AddListener(ReturnToMainMenu);

            if (resetButton != null)
                resetButton.onClick.AddListener(ShowResetConfirmation);

            if (applyButton != null)
                applyButton.onClick.AddListener(ApplySettings);

            // Reset confirmation
            if (confirmResetButton != null)
                confirmResetButton.onClick.AddListener(ConfirmReset);

            if (cancelResetButton != null)
                cancelResetButton.onClick.AddListener(CancelReset);

            // Initially hide reset confirmation
            if (resetConfirmationPanel != null)
                resetConfirmationPanel.SetActive(false);
        }

        private void LoadCurrentSettings()
        {
            // Load audio settings
            if (AudioManager.Instance != null)
            {
                if (masterVolumeSlider != null)
                {
                    masterVolumeSlider.value = AudioManager.Instance.masterVolume;
                    UpdateVolumeText(masterVolumeText, AudioManager.Instance.masterVolume);
                }

                if (musicVolumeSlider != null)
                {
                    musicVolumeSlider.value = AudioManager.Instance.musicVolume;
                    UpdateVolumeText(musicVolumeText, AudioManager.Instance.musicVolume);
                }

                if (sfxVolumeSlider != null)
                {
                    sfxVolumeSlider.value = AudioManager.Instance.sfxVolume;
                    UpdateVolumeText(sfxVolumeText, AudioManager.Instance.sfxVolume);
                }

                if (narrationVolumeSlider != null)
                {
                    narrationVolumeSlider.value = AudioManager.Instance.narrationVolume;
                    UpdateVolumeText(narrationVolumeText, AudioManager.Instance.narrationVolume);
                }
            }

            // Load graphics settings
            if (qualityDropdown != null)
            {
                qualityDropdown.value = QualitySettings.GetQualityLevel();
            }

            if (fullscreenToggle != null)
            {
                fullscreenToggle.isOn = Screen.fullScreen;
            }

            // Load gameplay settings
            if (subtitlesToggle != null)
            {
                subtitlesToggle.isOn = PlayerPrefs.GetInt("SubtitlesEnabled", 1) == 1;
            }

            if (textSpeedSlider != null)
            {
                float textSpeed = PlayerPrefs.GetFloat("TextSpeed", 1f);
                textSpeedSlider.value = textSpeed;
                UpdateTextSpeedText(textSpeed);
            }

            if (tutorialToggle != null)
            {
                tutorialToggle.isOn = PlayerPrefs.GetInt("TutorialEnabled", 1) == 1;
            }

            settingsChanged = false;
        }

        // Audio settings handlers
        private void OnMasterVolumeChanged(float value)
        {
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.SetMasterVolume(value);
            }
            UpdateVolumeText(masterVolumeText, value);
            settingsChanged = true;
        }

        private void OnMusicVolumeChanged(float value)
        {
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.SetMusicVolume(value);
            }
            UpdateVolumeText(musicVolumeText, value);
            settingsChanged = true;
        }

        private void OnSFXVolumeChanged(float value)
        {
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.SetSFXVolume(value);
                // Play test sound
                AudioManager.Instance.PlaySFX("button_click");
            }
            UpdateVolumeText(sfxVolumeText, value);
            settingsChanged = true;
        }

        private void OnNarrationVolumeChanged(float value)
        {
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.SetNarrationVolume(value);
            }
            UpdateVolumeText(narrationVolumeText, value);
            settingsChanged = true;
        }

        private void UpdateVolumeText(Text volumeText, float value)
        {
            if (volumeText != null)
            {
                volumeText.text = $"{(value * 100):F0}%";
            }
        }

        // Graphics settings handlers
        private void OnQualityChanged(int qualityIndex)
        {
            QualitySettings.SetQualityLevel(qualityIndex);
            settingsChanged = true;

            // Show quality change feedback
            string[] qualityNames = { "Rendah", "Sedang", "Tinggi", "Ultra" };
            if (qualityIndex < qualityNames.Length)
            {
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowFeedback($"Kualitas grafis: {qualityNames[qualityIndex]}", true, 2f);
                }
            }
        }

        private void OnFullscreenToggle(bool isFullscreen)
        {
            Screen.fullScreen = isFullscreen;
            settingsChanged = true;
        }

        // Gameplay settings handlers
        private void OnSubtitlesToggle(bool enabled)
        {
            PlayerPrefs.SetInt("SubtitlesEnabled", enabled ? 1 : 0);
            settingsChanged = true;

            if (UIManager.Instance != null)
            {
                string message = enabled ? "Subtitle diaktifkan" : "Subtitle dinonaktifkan";
                UIManager.Instance.ShowFeedback(message, true, 2f);
            }
        }

        private void OnTextSpeedChanged(float speed)
        {
            PlayerPrefs.SetFloat("TextSpeed", speed);
            UpdateTextSpeedText(speed);
            settingsChanged = true;
        }

        private void UpdateTextSpeedText(float speed)
        {
            if (textSpeedText != null)
            {
                string speedName = "Normal";
                if (speed < 0.5f) speedName = "Lambat";
                else if (speed > 1.5f) speedName = "Cepat";

                textSpeedText.text = speedName;
            }
        }

        private void OnTutorialToggle(bool enabled)
        {
            PlayerPrefs.SetInt("TutorialEnabled", enabled ? 1 : 0);
            settingsChanged = true;

            if (UIManager.Instance != null)
            {
                string message = enabled ? "Tutorial diaktifkan" : "Tutorial dinonaktifkan";
                UIManager.Instance.ShowFeedback(message, true, 2f);
            }
        }

        // Button handlers
        public void ReturnToMainMenu()
        {
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("button_click");
            }

            FiniteStateMachine.Instance.ChangeState(GameState.MainMenu);
        }

        public void ShowResetConfirmation()
        {
            if (resetConfirmationPanel != null)
            {
                resetConfirmationPanel.SetActive(true);
            }

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("warning");
            }
        }

        public void ConfirmReset()
        {
            // Reset all settings to default
            ResetToDefaults();

            if (resetConfirmationPanel != null)
                resetConfirmationPanel.SetActive(false);

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("reset_confirmed");
            }

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Pengaturan direset ke default", true, 3f);
            }
        }

        public void CancelReset()
        {
            if (resetConfirmationPanel != null)
                resetConfirmationPanel.SetActive(false);

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("button_click");
            }
        }

        public void ApplySettings()
        {
            SaveSettings();

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("settings_applied");
            }

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Pengaturan disimpan", true, 2f);
            }
        }

        private void ResetToDefaults()
        {
            // Reset audio settings
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.SetMasterVolume(1f);
                AudioManager.Instance.SetMusicVolume(0.7f);
                AudioManager.Instance.SetSFXVolume(1f);
                AudioManager.Instance.SetNarrationVolume(1f);
            }

            // Reset graphics settings
            QualitySettings.SetQualityLevel(2); // High quality

            // Reset gameplay settings
            PlayerPrefs.SetInt("SubtitlesEnabled", 1);
            PlayerPrefs.SetFloat("TextSpeed", 1f);
            PlayerPrefs.SetInt("TutorialEnabled", 1);

            // Reload settings display
            LoadCurrentSettings();
            settingsChanged = true;
        }

        private void SaveSettings()
        {
            // Audio settings are automatically saved by AudioManager
            
            // Save graphics settings
            PlayerPrefs.SetInt("QualityLevel", QualitySettings.GetQualityLevel());
            PlayerPrefs.SetInt("Fullscreen", Screen.fullScreen ? 1 : 0);

            // Gameplay settings are saved as they change

            PlayerPrefs.Save();
            settingsChanged = false;
        }

        // Mobile-specific settings
        public void OptimizeForMobile()
        {
            // Set mobile-optimized settings
            QualitySettings.SetQualityLevel(1); // Medium quality for mobile
            Application.targetFrameRate = 60;
            
            if (qualityDropdown != null)
                qualityDropdown.value = 1;

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Pengaturan dioptimalkan untuk mobile", true, 3f);
            }

            settingsChanged = true;
        }

        // Accessibility features
        public void IncreaseTextSize()
        {
            // Increase all text sizes by 20%
            Text[] allTexts = FindObjectsOfType<Text>();
            foreach (var text in allTexts)
            {
                text.fontSize = Mathf.RoundToInt(text.fontSize * 1.2f);
            }

            PlayerPrefs.SetFloat("TextSizeMultiplier", 1.2f);
            settingsChanged = true;

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Ukuran teks diperbesar", true, 2f);
            }
        }

        public void DecreaseTextSize()
        {
            // Decrease all text sizes by 20%
            Text[] allTexts = FindObjectsOfType<Text>();
            foreach (var text in allTexts)
            {
                text.fontSize = Mathf.RoundToInt(text.fontSize * 0.8f);
            }

            PlayerPrefs.SetFloat("TextSizeMultiplier", 0.8f);
            settingsChanged = true;

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Ukuran teks diperkecil", true, 2f);
            }
        }

        public void ResetTextSize()
        {
            PlayerPrefs.DeleteKey("TextSizeMultiplier");
            
            // Reload scene to reset text sizes
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Ukuran teks direset", true, 2f);
            }
        }

        private void OnDestroy()
        {
            // Remove all listeners
            if (masterVolumeSlider != null) masterVolumeSlider.onValueChanged.RemoveAllListeners();
            if (musicVolumeSlider != null) musicVolumeSlider.onValueChanged.RemoveAllListeners();
            if (sfxVolumeSlider != null) sfxVolumeSlider.onValueChanged.RemoveAllListeners();
            if (narrationVolumeSlider != null) narrationVolumeSlider.onValueChanged.RemoveAllListeners();
            
            if (qualityDropdown != null) qualityDropdown.onValueChanged.RemoveAllListeners();
            if (fullscreenToggle != null) fullscreenToggle.onValueChanged.RemoveAllListeners();
            if (resolutionDropdown != null) resolutionDropdown.onValueChanged.RemoveAllListeners();
            
            if (subtitlesToggle != null) subtitlesToggle.onValueChanged.RemoveAllListeners();
            if (textSpeedSlider != null) textSpeedSlider.onValueChanged.RemoveAllListeners();
            if (tutorialToggle != null) tutorialToggle.onValueChanged.RemoveAllListeners();
            
            if (backButton != null) backButton.onClick.RemoveAllListeners();
            if (resetButton != null) resetButton.onClick.RemoveAllListeners();
            if (applyButton != null) applyButton.onClick.RemoveAllListeners();
            if (confirmResetButton != null) confirmResetButton.onClick.RemoveAllListeners();
            if (cancelResetButton != null) cancelResetButton.onClick.RemoveAllListeners();
        }
    }
}