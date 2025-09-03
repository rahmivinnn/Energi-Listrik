using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using EnergyQuest.Core;
using EnergyQuest.UI;
using EnergyQuest.Audio;

namespace EnergyQuest.GameStates
{
    public class EndingSceneHandler : MonoBehaviour, IGameState
    {
        [Header("Ending Scene Configuration")]
        public float totalEndingDuration = 20f;

        [Header("Visual Elements")]
        public Camera endingCamera;
        public GameObject houseExterior;
        public GameObject scientist;
        public GameObject player;
        public Light[] houseEfficientLights;
        public ParticleSystem celebrationEffect;

        [Header("UI Elements")]
        public Canvas endingCanvas;
        public Text endingTitle;
        public Text endingNarration;
        public Text gameStatsText;
        public Image fadePanel;

        [Header("Final Rewards")]
        public GameObject youngResearcherBadge;
        public Text badgeText;

        [Header("Credits")]
        public GameObject creditsPanel;
        public Text creditsText;
        public ScrollRect creditsScrollRect;

        [Header("Final Buttons")]
        public Button playAgainButton;
        public Button mainMenuButton;
        public Button quitButton;

        private bool endingCompleted = false;

        private void Awake()
        {
            SetupButtonListeners();
        }

        public void OnStateEnter()
        {
            if (!endingCompleted)
            {
                StartCoroutine(PlayEndingSequence());
            }
            else
            {
                ShowFinalButtons();
            }
        }

        public void OnStateUpdate()
        {
            // Handle input for skipping (if desired)
            if (Input.GetKeyDown(KeyCode.Space) || Input.GetKeyDown(KeyCode.Return))
            {
                // Allow skipping to final buttons
                if (!endingCompleted)
                {
                    StopAllCoroutines();
                    endingCompleted = true;
                    ShowFinalButtons();
                }
            }
        }

        public void OnStateExit()
        {
            StopAllCoroutines();
        }

        private void SetupButtonListeners()
        {
            if (playAgainButton != null)
                playAgainButton.onClick.AddListener(PlayAgain);

            if (mainMenuButton != null)
                mainMenuButton.onClick.AddListener(ReturnToMainMenu);

            if (quitButton != null)
                quitButton.onClick.AddListener(QuitGame);
        }

        private IEnumerator PlayEndingSequence()
        {
            // Fade in from black
            yield return StartCoroutine(FadeIn(2f));

            // Show ending title
            yield return StartCoroutine(ShowEndingTitle());

            // Play final narration
            yield return StartCoroutine(PlayFinalNarration());

            // Show scientist and player together
            yield return StartCoroutine(ShowScientistAndPlayer());

            // Show house with efficient lighting
            yield return StartCoroutine(ShowEfficientHouse());

            // Display game statistics
            yield return StartCoroutine(ShowGameStatistics());

            // Award final badge
            yield return StartCoroutine(AwardResearcherBadge());

            // Show credits
            yield return StartCoroutine(ShowCredits());

            // Show final message
            yield return StartCoroutine(ShowFinalMessage());

            endingCompleted = true;
            ShowFinalButtons();
        }

        private IEnumerator FadeIn(float duration)
        {
            if (fadePanel == null) yield break;

            fadePanel.gameObject.SetActive(true);
            Color startColor = new Color(0, 0, 0, 1);
            Color endColor = new Color(0, 0, 0, 0);

            float elapsedTime = 0f;
            while (elapsedTime < duration)
            {
                float progress = elapsedTime / duration;
                fadePanel.color = Color.Lerp(startColor, endColor, progress);
                elapsedTime += Time.deltaTime;
                yield return null;
            }

            fadePanel.gameObject.SetActive(false);
        }

        private IEnumerator ShowEndingTitle()
        {
            if (endingTitle != null)
            {
                endingTitle.gameObject.SetActive(true);
                endingTitle.text = "MISI SELESAI!";

                // Title animation
                Vector3 startScale = Vector3.zero;
                Vector3 endScale = Vector3.one;

                float animTime = 1f;
                float elapsedTime = 0f;

                while (elapsedTime < animTime)
                {
                    float progress = elapsedTime / animTime;
                    endingTitle.transform.localScale = Vector3.Lerp(startScale, endScale, progress);
                    elapsedTime += Time.deltaTime;
                    yield return null;
                }
            }

            yield return new WaitForSeconds(2f);
        }

        private IEnumerator PlayFinalNarration()
        {
            string[] narrationParts = {
                "Misteri ilmuwan listrik telah terpecahkan.",
                "Kamu telah menyelamatkan sang ilmuwan dan memahami pentingnya efisiensi energi.",
                "Rumah ini kini terang dengan energi yang digunakan secara bijak.",
                "Namun, tanggung jawabmu tidak berhenti di sini.",
                "Gunakanlah pengetahuan ini dalam kehidupan nyata.",
                "Jadilah generasi yang hemat energi untuk masa depan yang berkelanjutan."
            };

            foreach (string part in narrationParts)
            {
                if (endingNarration != null)
                {
                    yield return StartCoroutine(TypewriterEffect(endingNarration, part, 0.05f));
                }

                // Play narration audio
                if (AudioManager.Instance != null)
                {
                    AudioManager.Instance.PlayNarration("ending_narration");
                }

                yield return new WaitForSeconds(3f);
            }
        }

        private IEnumerator ShowScientistAndPlayer()
        {
            // Show scientist and player standing together
            if (scientist != null)
            {
                scientist.SetActive(true);
                
                // Scientist appearance animation
                Vector3 scientistStartPos = scientist.transform.position + Vector3.left * 5f;
                Vector3 scientistEndPos = scientist.transform.position;

                float moveTime = 2f;
                float elapsedTime = 0f;

                while (elapsedTime < moveTime)
                {
                    float progress = elapsedTime / moveTime;
                    scientist.transform.position = Vector3.Lerp(scientistStartPos, scientistEndPos, progress);
                    elapsedTime += Time.deltaTime;
                    yield return null;
                }
            }

            if (player != null)
            {
                player.SetActive(true);
            }

            // Play reunion sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("reunion");
            }

            yield return new WaitForSeconds(2f);
        }

        private IEnumerator ShowEfficientHouse()
        {
            // Show house with efficient lighting (not all lights on)
            foreach (var light in houseEfficientLights)
            {
                if (light != null)
                {
                    light.enabled = true;
                    
                    // Gentle turn-on animation
                    float targetIntensity = light.intensity;
                    light.intensity = 0f;

                    float fadeTime = 1f;
                    float elapsedTime = 0f;

                    while (elapsedTime < fadeTime)
                    {
                        light.intensity = Mathf.Lerp(0f, targetIntensity, elapsedTime / fadeTime);
                        elapsedTime += Time.deltaTime;
                        yield return null;
                    }

                    yield return new WaitForSeconds(0.3f);
                }
            }

            // Show efficient house message
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Rumah kini terang dengan penggunaan energi yang efisien!", true, 3f);
            }

            yield return new WaitForSeconds(2f);
        }

        private IEnumerator ShowGameStatistics()
        {
            if (gameStatsText == null || GameManager.Instance == null) yield break;

            // Calculate game statistics
            int totalKeysCollected = GameManager.Instance.GetCollectedKeysCount();
            int levelsCompleted = GameManager.Instance.currentLevel - 1;
            bool gameCompleted = GameManager.Instance.gameCompleted;

            string statsText = "STATISTIK PERMAINAN:\n\n" +
                             $"✓ Level diselesaikan: {levelsCompleted}/4\n" +
                             $"✓ Kunci Energi dikumpulkan: {totalKeysCollected}/4\n" +
                             $"✓ Status: {(gameCompleted ? "SELESAI" : "BELUM SELESAI")}\n\n" +
                             "PENCAPAIAN:\n" +
                             "✓ Memahami rangkaian listrik dasar\n" +
                             "✓ Menguasai efisiensi energi\n" +
                             "✓ Menghitung tagihan listrik\n" +
                             "✓ Lulus evaluasi pengetahuan\n\n" +
                             "Selamat! Kamu adalah Peneliti Muda Energi!";

            gameStatsText.gameObject.SetActive(true);
            yield return StartCoroutine(TypewriterEffect(gameStatsText, statsText, 0.03f));

            yield return new WaitForSeconds(3f);
        }

        private IEnumerator AwardResearcherBadge()
        {
            if (youngResearcherBadge == null) yield break;

            youngResearcherBadge.SetActive(true);

            // Badge appearance animation
            Vector3 startScale = Vector3.zero;
            Vector3 endScale = Vector3.one;

            float animTime = 1.5f;
            float elapsedTime = 0f;

            while (elapsedTime < animTime)
            {
                float progress = elapsedTime / animTime;
                youngResearcherBadge.transform.localScale = Vector3.Lerp(startScale, endScale, progress);
                elapsedTime += Time.deltaTime;
                yield return null;
            }

            // Play badge award sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("badge_awarded");
            }

            // Show badge text
            if (badgeText != null)
            {
                badgeText.text = "LENCANA PENELITI MUDA ENERGI";
                badgeText.gameObject.SetActive(true);
            }

            // Celebration effect
            if (celebrationEffect != null)
            {
                celebrationEffect.transform.position = youngResearcherBadge.transform.position;
                celebrationEffect.Play();
            }

            yield return new WaitForSeconds(3f);
        }

        private IEnumerator ShowCredits()
        {
            if (creditsPanel == null) yield break;

            string creditsContent = "ENERGY QUEST: MISTERI HEMAT LISTRIK\n\n" +
                                  "DIKEMBANGKAN UNTUK EDUKASI ENERGI\n\n" +
                                  "TUJUAN:\n" +
                                  "Meningkatkan kesadaran penggunaan energi listrik yang efisien\n" +
                                  "melalui media game edukasi berbasis petualangan dan puzzle.\n\n" +
                                  "TARGET AUDIENS:\n" +
                                  "Siswa SMP (usia 12-15 tahun)\n\n" +
                                  "TEKNOLOGI:\n" +
                                  "Unity Engine 3D\n" +
                                  "Platform Android\n\n" +
                                  "ALGORITMA YANG DIGUNAKAN:\n" +
                                  "• Finite State Machine (FSM)\n" +
                                  "• Fisher-Yates Shuffle\n" +
                                  "• Perhitungan Energi Listrik\n\n" +
                                  "MATERI EDUKASI:\n" +
                                  "• Rangkaian Listrik Dasar\n" +
                                  "• Efisiensi Energi\n" +
                                  "• Perhitungan Tagihan Listrik\n" +
                                  "• Keamanan Kelistrikan\n\n" +
                                  "TERIMA KASIH TELAH BERMAIN!\n" +
                                  "Mari bersama-sama hemat energi untuk masa depan!";

            creditsPanel.SetActive(true);
            
            if (creditsText != null)
            {
                yield return StartCoroutine(TypewriterEffect(creditsText, creditsContent, 0.02f));
            }

            // Auto-scroll credits
            if (creditsScrollRect != null)
            {
                yield return StartCoroutine(AutoScrollCredits());
            }

            yield return new WaitForSeconds(2f);
        }

        private IEnumerator AutoScrollCredits()
        {
            if (creditsScrollRect == null) yield break;

            float scrollTime = 8f;
            float elapsedTime = 0f;

            while (elapsedTime < scrollTime)
            {
                float progress = elapsedTime / scrollTime;
                creditsScrollRect.verticalNormalizedPosition = 1f - progress;
                elapsedTime += Time.deltaTime;
                yield return null;
            }
        }

        private IEnumerator ShowFinalMessage()
        {
            string finalMessage = "Misteri ilmuwan listrik telah terpecahkan.\n\n" +
                                 "Namun, tanggung jawabmu tidak berhenti di sini.\n\n" +
                                 "Gunakanlah pengetahuan ini dalam kehidupan nyata,\n" +
                                 "dan jadilah generasi yang hemat energi.";

            if (endingNarration != null)
            {
                yield return StartCoroutine(TypewriterEffect(endingNarration, finalMessage, 0.05f));
            }

            // Play final theme music
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayBackgroundMusic("ending_theme");
            }

            yield return new WaitForSeconds(3f);
        }

        private void ShowFinalButtons()
        {
            // Show final action buttons
            if (playAgainButton != null)
                playAgainButton.gameObject.SetActive(true);

            if (mainMenuButton != null)
                mainMenuButton.gameObject.SetActive(true);

            if (quitButton != null)
                quitButton.gameObject.SetActive(true);

            // Animate buttons appearance
            StartCoroutine(AnimateButtonsAppearance());
        }

        private IEnumerator AnimateButtonsAppearance()
        {
            Button[] buttons = { playAgainButton, mainMenuButton, quitButton };

            foreach (var button in buttons)
            {
                if (button != null)
                {
                    Vector3 startScale = Vector3.zero;
                    Vector3 endScale = Vector3.one;

                    float animTime = 0.5f;
                    float elapsedTime = 0f;

                    while (elapsedTime < animTime)
                    {
                        float progress = elapsedTime / animTime;
                        button.transform.localScale = Vector3.Lerp(startScale, endScale, progress);
                        elapsedTime += Time.deltaTime;
                        yield return null;
                    }

                    yield return new WaitForSeconds(0.2f);
                }
            }
        }

        private IEnumerator TypewriterEffect(Text textComponent, string fullText, float charDelay)
        {
            textComponent.text = "";
            textComponent.gameObject.SetActive(true);

            foreach (char c in fullText)
            {
                textComponent.text += c;
                yield return new WaitForSeconds(charDelay);
            }
        }

        // Button event handlers
        public void PlayAgain()
        {
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("button_click");
            }

            // Reset entire game
            if (GameManager.Instance != null)
            {
                GameManager.Instance.ResetGameProgress();
            }

            // Return to opening scene
            FiniteStateMachine.Instance.ChangeState(GameState.OpeningScene);
        }

        public void ReturnToMainMenu()
        {
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("button_click");
            }

            // Save completion status
            if (GameManager.Instance != null)
            {
                GameManager.Instance.SaveGameProgress();
            }

            // Return to main menu
            FiniteStateMachine.Instance.ChangeState(GameState.MainMenu);
        }

        public void QuitGame()
        {
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("button_click");
            }

            // Save completion status
            if (GameManager.Instance != null)
            {
                GameManager.Instance.SaveGameProgress();
            }

            // Quit application
            #if UNITY_EDITOR
                UnityEditor.EditorApplication.isPlaying = false;
            #else
                Application.Quit();
            #endif
        }

        // Called by basement handler when quiz is completed
        public void OnGameCompleted()
        {
            // Mark game as completed
            if (GameManager.Instance != null)
            {
                GameManager.Instance.CompleteGame();
            }

            // Show immediate completion feedback
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Selamat! Kamu telah menyelesaikan Energy Quest!", true, 5f);
            }
        }

        // Achievement system
        private void UnlockAchievements()
        {
            // Save achievements to PlayerPrefs
            PlayerPrefs.SetInt("Achievement_GameCompleted", 1);
            PlayerPrefs.SetInt("Achievement_AllKeysCollected", 1);
            PlayerPrefs.SetInt("Achievement_QuizPassed", 1);
            PlayerPrefs.SetInt("Achievement_EnergyEfficient", 1);
            PlayerPrefs.Save();

            Debug.Log("All achievements unlocked!");
        }

        // Statistics calculation
        private string CalculateGameStatistics()
        {
            if (GameManager.Instance == null) return "Statistik tidak tersedia";

            int keysCollected = GameManager.Instance.GetCollectedKeysCount();
            int levelsCompleted = GameManager.Instance.currentLevel - 1;
            bool gameCompleted = GameManager.Instance.gameCompleted;

            // Calculate completion percentage
            float completionPercentage = (float)levelsCompleted / 4f * 100f;

            return $"STATISTIK AKHIR:\n\n" +
                   $"Kunci Energi: {keysCollected}/4\n" +
                   $"Level Selesai: {levelsCompleted}/4\n" +
                   $"Persentase: {completionPercentage:F0}%\n" +
                   $"Status: {(gameCompleted ? "SELESAI" : "DALAM PROGRESS")}";
        }

        private void OnDestroy()
        {
            // Remove button listeners
            if (playAgainButton != null) playAgainButton.onClick.RemoveAllListeners();
            if (mainMenuButton != null) mainMenuButton.onClick.RemoveAllListeners();
            if (quitButton != null) quitButton.onClick.RemoveAllListeners();
        }
    }
}