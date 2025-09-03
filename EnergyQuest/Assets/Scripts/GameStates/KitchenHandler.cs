using UnityEngine;
using System.Collections;
using EnergyQuest.Core;
using EnergyQuest.Puzzles;
using EnergyQuest.UI;
using EnergyQuest.Audio;

namespace EnergyQuest.GameStates
{
    public class KitchenHandler : MonoBehaviour, IGameState
    {
        [Header("Level Configuration")]
        public string levelTitle = "Level 2: Dapur";
        public string levelObjective = "Kelola perangkat dapur secara efisien untuk menjaga Power Meter tetap hijau";

        [Header("Kitchen Puzzle")]
        public EfficiencyPuzzle efficiencyPuzzle;

        [Header("Room Environment")]
        public GameObject[] kitchenObjects;
        public GameObject doorToLaboratory;
        public ParticleSystem cookingSmoke;
        public Light morningLight;

        [Header("Tutorial")]
        public bool showTutorial = true;
        public GameObject tutorialPanel;

        private bool levelCompleted = false;
        private bool tutorialShown = false;

        public void OnStateEnter()
        {
            // Set level information
            if (UIManager.Instance != null)
            {
                UIManager.Instance.SetLevelInfo(levelTitle, levelObjective);
            }

            // Play kitchen background music
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayBackgroundMusic("kitchen_ambient");
            }

            // Initialize kitchen environment
            InitializeKitchen();

            // Show tutorial if first time
            if (showTutorial && !tutorialShown)
            {
                ShowKitchenTutorial();
            }

            // Setup efficiency puzzle
            if (efficiencyPuzzle != null)
            {
                efficiencyPuzzle.ResetPuzzleState();
            }
        }

        public void OnStateUpdate()
        {
            // Check if efficiency puzzle is completed
            if (!levelCompleted && efficiencyPuzzle != null && efficiencyPuzzle.IsPuzzleCompleted())
            {
                CompleteLevel();
            }

            // Update morning light (simulates time progression)
            UpdateMorningLight();
        }

        public void OnStateExit()
        {
            // Clean up
            StopAllCoroutines();

            // Save progress
            if (GameManager.Instance != null)
            {
                GameManager.Instance.SaveGameProgress();
            }
        }

        private void InitializeKitchen()
        {
            // Activate kitchen objects
            foreach (var obj in kitchenObjects)
            {
                if (obj != null)
                    obj.SetActive(true);
            }

            // Door to laboratory is initially locked
            if (doorToLaboratory != null)
            {
                doorToLaboratory.SetActive(false);
            }

            // Start cooking smoke effects
            if (cookingSmoke != null)
            {
                cookingSmoke.Play();
            }

            // Set morning light
            if (morningLight != null)
            {
                morningLight.enabled = true;
                morningLight.intensity = 0.3f; // Start dim, will brighten
            }
        }

        private void ShowKitchenTutorial()
        {
            tutorialShown = true;

            string tutorialContent = "SELAMAT DATANG DI DAPUR!\n\n" +
                                   "Di dapur ini, kamu harus mengelola penggunaan energi dengan bijak.\n\n" +
                                   "TUJUAN:\n" +
                                   "• Jaga Power Meter tetap HIJAU (efisien)\n" +
                                   "• Manfaatkan cahaya alami dari jendela\n" +
                                   "• Gunakan peralatan seperlunya\n" +
                                   "• Tutup kulkas dengan cepat\n\n" +
                                   "KONTROL:\n" +
                                   "• Tap tombol untuk menyalakan/mematikan perangkat\n" +
                                   "• Geser slider pintu kulkas untuk membuka/menutup\n" +
                                   "• Gunakan tombol jendela untuk cahaya alami";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Tutorial Dapur", tutorialContent);
            }

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayNarration("kitchen_tutorial");
            }
        }

        private void UpdateMorningLight()
        {
            // Simulate morning light getting brighter over time
            if (morningLight != null)
            {
                float time = Time.time * 0.1f; // Slow progression
                float intensity = Mathf.Lerp(0.3f, 1f, Mathf.Sin(time) * 0.5f + 0.5f);
                morningLight.intensity = intensity;
            }
        }

        private void CompleteLevel()
        {
            levelCompleted = true;

            // Complete level in game manager
            if (GameManager.Instance != null)
            {
                GameManager.Instance.CompleteLevel(2);
            }

            // Show level completion
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Level 2 Selesai! Kamu telah menguasai efisiensi energi di dapur.", true, 5f);
            }

            // Open door to laboratory
            StartCoroutine(OpenDoorToLaboratory());

            // Show educational summary
            ShowLevelSummary();
        }

        private IEnumerator OpenDoorToLaboratory()
        {
            yield return new WaitForSeconds(3f);

            if (doorToLaboratory != null)
            {
                doorToLaboratory.SetActive(true);

                // Animate door opening
                Vector3 startRotation = doorToLaboratory.transform.eulerAngles;
                Vector3 endRotation = startRotation + new Vector3(0, 90, 0);

                float openDuration = 2f;
                float elapsedTime = 0f;

                while (elapsedTime < openDuration)
                {
                    float progress = elapsedTime / openDuration;
                    doorToLaboratory.transform.eulerAngles = Vector3.Lerp(startRotation, endRotation, progress);
                    elapsedTime += Time.deltaTime;
                    yield return null;
                }

                // Play door open sound
                if (AudioManager.Instance != null)
                {
                    AudioManager.Instance.PlaySFX("door_open");
                }

                // Show transition message
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowFeedback("Pintu laboratorium terbuka! Siap untuk tantangan berikutnya?", true, 4f);
                }

                // Show continue prompt
                yield return new WaitForSeconds(5f);
                ShowContinuePrompt();
            }
        }

        private void ShowLevelSummary()
        {
            string summary = "RINGKASAN PEMBELAJARAN LEVEL 2:\n\n" +
                           "✓ Efisiensi energi sangat penting dalam kehidupan sehari-hari\n" +
                           "✓ Cahaya alami dapat menggantikan lampu di siang hari\n" +
                           "✓ Kulkas yang dibuka terlalu lama membuang energi\n" +
                           "✓ Peralatan listrik harus digunakan seperlunya\n" +
                           "✓ Setiap tindakan kecil berkontribusi pada penghematan\n\n" +
                           "Konsumsi akhir: " + (efficiencyPuzzle?.currentTotalConsumption.ToString("F0") ?? "0") + "W\n" +
                           "Efisiensi: " + ((efficiencyPuzzle?.currentEfficiency * 100 ?? 0).ToString("F0")) + "%";

            StartCoroutine(ShowSummaryAfterDelay(summary, 7f));
        }

        private IEnumerator ShowSummaryAfterDelay(string summary, float delay)
        {
            yield return new WaitForSeconds(delay);
            
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Pembelajaran Selesai", summary);
            }
        }

        private void ShowContinuePrompt()
        {
            // Create continue prompt
            GameObject promptPanel = new GameObject("ContinuePrompt");
            promptPanel.transform.SetParent(UIManager.Instance.gameCanvas.transform, false);

            // Add background
            Image bgImage = promptPanel.AddComponent<Image>();
            bgImage.color = new Color(0, 0, 0, 0.8f);

            RectTransform bgRect = promptPanel.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;

            // Add continue button
            GameObject continueButton = new GameObject("ContinueButton");
            continueButton.transform.SetParent(promptPanel.transform, false);

            Button button = continueButton.AddComponent<Button>();
            Image buttonImage = continueButton.AddComponent<Image>();
            buttonImage.color = Color.blue;

            // Add button text
            GameObject buttonText = new GameObject("ButtonText");
            buttonText.transform.SetParent(continueButton.transform, false);

            Text text = buttonText.AddComponent<Text>();
            text.text = "Lanjut ke Laboratorium";
            text.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            text.fontSize = 24;
            text.color = Color.white;
            text.alignment = TextAnchor.MiddleCenter;

            RectTransform textRect = buttonText.GetComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;

            // Position button
            RectTransform buttonRect = continueButton.GetComponent<RectTransform>();
            buttonRect.anchorMin = new Vector2(0.3f, 0.4f);
            buttonRect.anchorMax = new Vector2(0.7f, 0.6f);
            buttonRect.offsetMin = Vector2.zero;
            buttonRect.offsetMax = Vector2.zero;

            // Button click handler
            button.onClick.AddListener(() => {
                Destroy(promptPanel);
                FiniteStateMachine.Instance.NextLevel();
            });
        }

        // Debug methods
        [ContextMenu("Show Efficiency Tips")]
        private void DebugShowTips()
        {
            if (efficiencyPuzzle != null)
            {
                efficiencyPuzzle.ShowEfficiencyTips();
            }
        }

        [ContextMenu("Complete Level")]
        private void DebugCompleteLevel()
        {
            if (efficiencyPuzzle != null)
            {
                // Force complete the puzzle
                CompleteLevel();
            }
        }
    }
}