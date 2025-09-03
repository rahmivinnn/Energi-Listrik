using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using EnergyQuest.Core;

namespace EnergyQuest.UI
{
    public class UIManager : MonoBehaviour
    {
        [Header("Common UI Elements")]
        public Canvas gameCanvas;
        public Text levelTitle;
        public Text objectiveText;
        public GameObject energyKeyPanel;
        public Image[] energyKeySlots;
        public Sprite energyKeySprite;
        public Sprite emptyKeySprite;

        [Header("Power Meter")]
        public Slider powerMeter;
        public Text powerMeterText;
        public Image powerMeterFill;
        public Color efficientColor = Color.green;
        public Color wastefulColor = Color.red;
        public Color neutralColor = Color.yellow;

        [Header("Feedback UI")]
        public GameObject feedbackPanel;
        public Text feedbackText;
        public Image feedbackIcon;
        public Sprite successIcon;
        public Sprite errorIcon;

        [Header("Progress UI")]
        public GameObject progressPanel;
        public Slider progressBar;
        public Text progressText;

        [Header("Educational Info")]
        public GameObject educationalPanel;
        public Text educationalTitle;
        public Text educationalContent;
        public Button educationalCloseButton;

        // Singleton
        public static UIManager Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                InitializeUI();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void Start()
        {
            // Subscribe to game events
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnEnergyKeyCollected += UpdateEnergyKeyDisplay;
                GameManager.Instance.OnLevelCompleted += OnLevelCompleted;
            }

            // Setup button listeners
            if (educationalCloseButton != null)
            {
                educationalCloseButton.onClick.AddListener(CloseEducationalPanel);
            }
        }

        private void InitializeUI()
        {
            // Initialize energy key display
            UpdateEnergyKeyDisplay(-1); // Update all keys

            // Initialize power meter
            if (powerMeter != null)
            {
                powerMeter.value = 0.5f; // Start at neutral
                UpdatePowerMeter(0.5f);
            }

            // Hide panels initially
            HideAllPanels();
        }

        private void HideAllPanels()
        {
            if (feedbackPanel != null) feedbackPanel.SetActive(false);
            if (progressPanel != null) progressPanel.SetActive(false);
            if (educationalPanel != null) educationalPanel.SetActive(false);
        }

        public void SetLevelInfo(string title, string objective)
        {
            if (levelTitle != null)
                levelTitle.text = title;

            if (objectiveText != null)
                objectiveText.text = objective;
        }

        public void UpdateEnergyKeyDisplay(int keyIndex)
        {
            if (energyKeySlots == null || GameManager.Instance == null) return;

            for (int i = 0; i < energyKeySlots.Length; i++)
            {
                if (energyKeySlots[i] != null)
                {
                    bool hasKey = i < GameManager.Instance.collectedKeys.Count && 
                                 GameManager.Instance.collectedKeys[i];
                    
                    energyKeySlots[i].sprite = hasKey ? energyKeySprite : emptyKeySprite;
                    energyKeySlots[i].color = hasKey ? Color.white : new Color(1f, 1f, 1f, 0.3f);
                }
            }

            // Animate the newly collected key
            if (keyIndex >= 0 && keyIndex < energyKeySlots.Length)
            {
                StartCoroutine(AnimateKeyCollection(energyKeySlots[keyIndex]));
            }
        }

        private IEnumerator AnimateKeyCollection(Image keySlot)
        {
            Vector3 originalScale = keySlot.transform.localScale;
            
            // Scale up animation
            float animTime = 0.5f;
            float elapsedTime = 0f;

            while (elapsedTime < animTime)
            {
                float progress = elapsedTime / animTime;
                float scale = Mathf.Lerp(1f, 1.3f, Mathf.Sin(progress * Mathf.PI));
                keySlot.transform.localScale = originalScale * scale;
                
                elapsedTime += Time.deltaTime;
                yield return null;
            }

            keySlot.transform.localScale = originalScale;
        }

        public void UpdatePowerMeter(float efficiency)
        {
            if (powerMeter == null) return;

            powerMeter.value = efficiency;

            // Update color based on efficiency
            Color targetColor;
            string efficiencyText;

            if (efficiency >= 0.7f)
            {
                targetColor = efficientColor;
                efficiencyText = "HEMAT";
            }
            else if (efficiency >= 0.4f)
            {
                targetColor = neutralColor;
                efficiencyText = "SEDANG";
            }
            else
            {
                targetColor = wastefulColor;
                efficiencyText = "BOROS";
            }

            if (powerMeterFill != null)
                powerMeterFill.color = targetColor;

            if (powerMeterText != null)
                powerMeterText.text = efficiencyText;
        }

        public void ShowFeedback(string message, bool isSuccess, float displayTime = 3f)
        {
            if (feedbackPanel == null) return;

            feedbackPanel.SetActive(true);

            if (feedbackText != null)
                feedbackText.text = message;

            if (feedbackIcon != null)
            {
                feedbackIcon.sprite = isSuccess ? successIcon : errorIcon;
                feedbackIcon.color = isSuccess ? Color.green : Color.red;
            }

            // Auto-hide after delay
            StartCoroutine(HideFeedbackAfterDelay(displayTime));

            // Play appropriate sound
            if (AudioManager.Instance != null)
            {
                if (isSuccess)
                    AudioManager.Instance.PlaySuccessSound();
                else
                    AudioManager.Instance.PlayErrorSound();
            }
        }

        private IEnumerator HideFeedbackAfterDelay(float delay)
        {
            yield return new WaitForSeconds(delay);
            
            if (feedbackPanel != null)
                feedbackPanel.SetActive(false);
        }

        public void ShowEducationalInfo(string title, string content)
        {
            if (educationalPanel == null) return;

            educationalPanel.SetActive(true);

            if (educationalTitle != null)
                educationalTitle.text = title;

            if (educationalContent != null)
            {
                StartCoroutine(TypewriterEffect(educationalContent, content, 0.03f));
            }

            // Pause game time
            Time.timeScale = 0f;
        }

        public void CloseEducationalPanel()
        {
            if (educationalPanel != null)
                educationalPanel.SetActive(false);

            // Resume game time
            Time.timeScale = 1f;

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("button_click");
            }
        }

        private IEnumerator TypewriterEffect(Text textComponent, string fullText, float charDelay)
        {
            textComponent.text = "";
            
            foreach (char c in fullText)
            {
                textComponent.text += c;
                yield return new WaitForSecondsRealtime(charDelay); // Use realtime for paused game
            }
        }

        public void UpdateProgress(float progress, string description = "")
        {
            if (progressPanel == null) return;

            progressPanel.SetActive(true);

            if (progressBar != null)
                progressBar.value = progress;

            if (progressText != null && !string.IsNullOrEmpty(description))
                progressText.text = description;
        }

        public void HideProgress()
        {
            if (progressPanel != null)
                progressPanel.SetActive(false);
        }

        private void OnLevelCompleted(int levelNumber)
        {
            ShowFeedback($"Level {levelNumber} Selesai!", true, 3f);
            
            // Show educational summary
            string educationalContent = GetLevelEducationalSummary(levelNumber);
            if (!string.IsNullOrEmpty(educationalContent))
            {
                StartCoroutine(ShowLevelSummaryAfterDelay(educationalContent, 3.5f));
            }
        }

        private IEnumerator ShowLevelSummaryAfterDelay(string content, float delay)
        {
            yield return new WaitForSeconds(delay);
            ShowEducationalInfo("Ringkasan Pembelajaran", content);
        }

        private string GetLevelEducationalSummary(int levelNumber)
        {
            switch (levelNumber)
            {
                case 1:
                    return "Listrik mengalir dalam rangkaian tertutup. Saklar berfungsi untuk memutus atau menghubungkan arus listrik. Pastikan semua komponen terhubung dengan benar.";
                case 2:
                    return "Efisiensi energi sangat penting. Matikan perangkat yang tidak digunakan, manfaatkan cahaya alami, dan tutup kulkas dengan cepat untuk menghemat energi.";
                case 3:
                    return "Tagihan listrik dihitung berdasarkan konsumsi energi (kWh). Formula: Energi = (Daya × Waktu) / 1000. Kelola penggunaan perangkat untuk mengontrol tagihan.";
                case 4:
                    return "Selamat! Kamu telah menyelesaikan semua tantangan. Gunakan pengetahuan ini dalam kehidupan sehari-hari untuk menjadi generasi yang hemat energi.";
                default:
                    return "";
            }
        }

        // Mobile-specific UI adjustments
        public void AdjustForMobile()
        {
            // Increase button sizes for touch
            Button[] buttons = FindObjectsOfType<Button>();
            foreach (var button in buttons)
            {
                RectTransform rect = button.GetComponent<RectTransform>();
                if (rect != null)
                {
                    // Ensure minimum touch size (44x44 points)
                    if (rect.sizeDelta.x < 44f) rect.sizeDelta = new Vector2(44f, rect.sizeDelta.y);
                    if (rect.sizeDelta.y < 44f) rect.sizeDelta = new Vector2(rect.sizeDelta.x, 44f);
                }
            }

            // Adjust text sizes for mobile readability
            Text[] texts = FindObjectsOfType<Text>();
            foreach (var text in texts)
            {
                if (text.fontSize < 14)
                    text.fontSize = 14;
            }
        }

        private void OnDestroy()
        {
            // Unsubscribe from events
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnEnergyKeyCollected -= UpdateEnergyKeyDisplay;
                GameManager.Instance.OnLevelCompleted -= OnLevelCompleted;
            }

            // Remove button listeners
            if (educationalCloseButton != null)
                educationalCloseButton.onClick.RemoveAllListeners();
        }
    }
}