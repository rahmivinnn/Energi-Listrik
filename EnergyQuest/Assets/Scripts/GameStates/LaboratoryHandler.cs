using UnityEngine;
using System.Collections;
using EnergyQuest.Core;
using EnergyQuest.Puzzles;
using EnergyQuest.UI;
using EnergyQuest.Audio;

namespace EnergyQuest.GameStates
{
    public class LaboratoryHandler : MonoBehaviour, IGameState
    {
        [Header("Level Configuration")]
        public string levelTitle = "Level 3: Laboratorium Kecil";
        public string levelObjective = "Gunakan simulator untuk mengatur penggunaan energi rumah dengan efisien";

        [Header("Laboratory Puzzle")]
        public ElectricityBillSimulator billSimulator;

        [Header("Laboratory Environment")]
        public GameObject[] labEquipment;
        public GameObject computerTerminal;
        public GameObject secretDoor;
        public Light[] labLights;
        public ParticleSystem hologramEffect;

        [Header("Interactive Elements")]
        public Button simulatorStartButton;
        public GameObject simulatorScreen;

        private bool levelCompleted = false;
        private bool simulatorActivated = false;

        public void OnStateEnter()
        {
            // Set level information
            if (UIManager.Instance != null)
            {
                UIManager.Instance.SetLevelInfo(levelTitle, levelObjective);
            }

            // Play laboratory background music
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayBackgroundMusic("laboratory_ambient");
            }

            // Initialize laboratory
            InitializeLaboratory();

            // Show level introduction
            ShowLaboratoryIntroduction();
        }

        public void OnStateUpdate()
        {
            // Check if bill simulator is completed
            if (!levelCompleted && billSimulator != null && billSimulator.IsPuzzleCompleted())
            {
                CompleteLevel();
            }

            // Update laboratory ambiance
            UpdateLaboratoryAmbiance();
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

        private void InitializeLaboratory()
        {
            // Activate laboratory equipment
            foreach (var equipment in labEquipment)
            {
                if (equipment != null)
                    equipment.SetActive(true);
            }

            // Setup simulator start button
            if (simulatorStartButton != null)
            {
                simulatorStartButton.onClick.AddListener(ActivateSimulator);
            }

            // Initially hide simulator screen
            if (simulatorScreen != null)
            {
                simulatorScreen.SetActive(false);
            }

            // Secret door is initially hidden
            if (secretDoor != null)
            {
                secretDoor.SetActive(false);
            }

            // Start lab lights with science ambiance
            StartCoroutine(AnimateLabLights());

            // Start hologram effect
            if (hologramEffect != null)
            {
                hologramEffect.Play();
            }
        }

        private void ShowLaboratoryIntroduction()
        {
            string introMessage = "Selamat datang di laboratorium ilmuwan!\n\n" +
                                "Di sini terdapat simulator canggih untuk menghitung penggunaan energi listrik rumah.\n\n" +
                                "MISI:\n" +
                                "• Gunakan simulator untuk mengatur konsumsi listrik\n" +
                                "• Jaga tagihan bulanan ≤ Rp 300.000\n" +
                                "• Pelajari formula perhitungan energi\n" +
                                "• Temukan blueprint alat rahasia ilmuwan\n\n" +
                                "Klik tombol simulator untuk memulai!";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Laboratorium Energi", introMessage);
            }

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayNarration("laboratory_intro");
            }
        }

        public void ActivateSimulator()
        {
            if (simulatorActivated) return;

            simulatorActivated = true;

            // Play activation sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("computer_startup");
            }

            // Show simulator screen with boot-up effect
            StartCoroutine(BootUpSimulator());
        }

        private IEnumerator BootUpSimulator()
        {
            if (simulatorScreen != null)
            {
                simulatorScreen.SetActive(true);
            }

            // Simulate computer boot-up
            if (UIManager.Instance != null)
            {
                UIManager.Instance.UpdateProgress(0f, "Mengaktifkan simulator...");
            }

            // Boot-up sequence
            string[] bootMessages = {
                "Inisialisasi sistem...",
                "Memuat database perangkat...",
                "Kalibrasi sensor energi...",
                "Sistem siap digunakan!"
            };

            for (int i = 0; i < bootMessages.Length; i++)
            {
                if (UIManager.Instance != null)
                {
                    float progress = (float)(i + 1) / bootMessages.Length;
                    UIManager.Instance.UpdateProgress(progress, bootMessages[i]);
                }

                // Boot-up sound effects
                if (AudioManager.Instance != null)
                {
                    AudioManager.Instance.PlaySFX("computer_beep");
                }

                yield return new WaitForSeconds(1f);
            }

            // Hide progress and show simulator ready message
            if (UIManager.Instance != null)
            {
                UIManager.Instance.HideProgress();
                UIManager.Instance.ShowFeedback("Simulator energi siap digunakan! Atur perangkat untuk mencapai efisiensi optimal.", true, 4f);
            }

            // Initialize bill simulator
            if (billSimulator != null)
            {
                billSimulator.ResetPuzzleState();
            }

            // Show energy formula tutorial
            yield return new WaitForSeconds(2f);
            ShowEnergyFormulaTutorial();
        }

        private void ShowEnergyFormulaTutorial()
        {
            string formulaTutorial = "TUTORIAL PERHITUNGAN ENERGI\n\n" +
                                   "Formula dasar: E = (P × t) / 1000\n\n" +
                                   "E = Energi konsumsi (kWh)\n" +
                                   "P = Daya perangkat (Watt)\n" +
                                   "t = Waktu pemakaian (jam)\n\n" +
                                   "CONTOH:\n" +
                                   "AC 1500W menyala 8 jam/hari\n" +
                                   "E = (1500 × 8) / 1000 = 12 kWh/hari\n" +
                                   "E bulanan = 12 × 30 = 360 kWh\n" +
                                   "Biaya = 360 × Rp1.467 = Rp528.120\n\n" +
                                   "Coba atur perangkat di simulator untuk mencapai target Rp300.000!";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Tutorial Energi", formulaTutorial);
            }
        }

        private IEnumerator AnimateLabLights()
        {
            while (true)
            {
                foreach (var light in labLights)
                {
                    if (light != null)
                    {
                        // Science lab flickering effect
                        float baseIntensity = 1f;
                        float flicker = Mathf.PerlinNoise(Time.time * 2f, 0f) * 0.2f;
                        light.intensity = baseIntensity + flicker;
                    }
                }

                yield return new WaitForSeconds(0.1f);
            }
        }

        private void UpdateLaboratoryAmbiance()
        {
            // Update hologram effect based on simulator progress
            if (hologramEffect != null && billSimulator != null)
            {
                if (simulatorActivated)
                {
                    var emission = hologramEffect.emission;
                    emission.rateOverTime = 50f; // More particles when active
                }
            }
        }

        private void CompleteLevel()
        {
            levelCompleted = true;

            // Complete level in game manager
            if (GameManager.Instance != null)
            {
                GameManager.Instance.CompleteLevel(3);
            }

            // Show level completion
            if (UIManager.Instance != null)
            {
                string completionMessage = "Level 3 Selesai! Kamu telah menguasai perhitungan dan simulasi tagihan listrik.";
                UIManager.Instance.ShowFeedback(completionMessage, true, 5f);
            }

            // Open secret door to basement
            StartCoroutine(OpenSecretDoor());

            // Show laboratory completion summary
            ShowLaboratorySummary();
        }

        private IEnumerator OpenSecretDoor()
        {
            yield return new WaitForSeconds(3f);

            if (secretDoor != null)
            {
                secretDoor.SetActive(true);

                // Play secret door sound
                if (AudioManager.Instance != null)
                {
                    AudioManager.Instance.PlaySFX("secret_door_open");
                }

                // Dramatic door opening animation
                Vector3 startPos = secretDoor.transform.position;
                Vector3 endPos = startPos + Vector3.down * 3f; // Door slides down

                float openDuration = 3f;
                float elapsedTime = 0f;

                while (elapsedTime < openDuration)
                {
                    float progress = elapsedTime / openDuration;
                    secretDoor.transform.position = Vector3.Lerp(startPos, endPos, progress);
                    elapsedTime += Time.deltaTime;
                    yield return null;
                }

                // Show mysterious basement entrance
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowFeedback("Pintu rahasia terbuka! Ruang bawah tanah terungkap...", true, 4f);
                }

                // Mysterious atmosphere
                if (AudioManager.Instance != null)
                {
                    AudioManager.Instance.PlaySFX("mysterious_ambiance");
                }

                // Show continue prompt
                yield return new WaitForSeconds(5f);
                ShowContinuePrompt();
            }
        }

        private void ShowLaboratorySummary()
        {
            string summary = "RINGKASAN PEMBELAJARAN LEVEL 3:\n\n" +
                           "✓ Formula energi: E = (P × t) / 1000\n" +
                           "✓ Daya perangkat mempengaruhi konsumsi energi\n" +
                           "✓ Waktu pemakaian berpengaruh pada tagihan\n" +
                           "✓ Simulasi membantu merencanakan penggunaan energi\n" +
                           "✓ Target efisiensi dapat dicapai dengan perencanaan\n\n" +
                           "HASIL SIMULASI:\n" +
                           (billSimulator?.GetEfficiencyReport() ?? "Data tidak tersedia") + "\n\n" +
                           "Kamu siap untuk tantangan akhir di ruang bawah tanah!";

            StartCoroutine(ShowSummaryAfterDelay(summary, 8f));
        }

        private IEnumerator ShowSummaryAfterDelay(string summary, float delay)
        {
            yield return new WaitForSeconds(delay);
            
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Laboratorium Selesai", summary);
            }
        }

        private void ShowContinuePrompt()
        {
            // Create continue prompt for basement
            GameObject promptPanel = new GameObject("ContinuePrompt");
            promptPanel.transform.SetParent(UIManager.Instance.gameCanvas.transform, false);

            // Add background
            Image bgImage = promptPanel.AddComponent<Image>();
            bgImage.color = new Color(0.1f, 0.1f, 0.3f, 0.9f); // Dark mysterious background

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
            buttonImage.color = new Color(0.8f, 0.2f, 0.2f); // Dark red for mysterious theme

            // Add button text
            GameObject buttonText = new GameObject("ButtonText");
            buttonText.transform.SetParent(continueButton.transform, false);

            Text text = buttonText.AddComponent<Text>();
            text.text = "Masuki Ruang Bawah Tanah";
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
            buttonRect.anchorMin = new Vector2(0.25f, 0.4f);
            buttonRect.anchorMax = new Vector2(0.75f, 0.6f);
            buttonRect.offsetMin = Vector2.zero;
            buttonRect.offsetMax = Vector2.zero;

            // Button click handler
            button.onClick.AddListener(() => {
                Destroy(promptPanel);
                FiniteStateMachine.Instance.NextLevel();
            });
        }

        // Debug methods
        [ContextMenu("Activate Simulator")]
        private void DebugActivateSimulator()
        {
            ActivateSimulator();
        }

        [ContextMenu("Complete Level")]
        private void DebugCompleteLevel()
        {
            CompleteLevel();
        }

        private void ActivateSimulator()
        {
            if (simulatorActivated) return;

            simulatorActivated = true;

            if (simulatorStartButton != null)
            {
                simulatorStartButton.gameObject.SetActive(false);
            }

            if (simulatorScreen != null)
            {
                simulatorScreen.SetActive(true);
            }

            // Play computer activation sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("computer_activate");
            }
        }
    }
}