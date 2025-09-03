using UnityEngine;
using System.Collections;
using EnergyQuest.Core;
using EnergyQuest.Puzzles;
using EnergyQuest.UI;
using EnergyQuest.Audio;

namespace EnergyQuest.GameStates
{
    public class BasementHandler : MonoBehaviour, IGameState
    {
        [Header("Level Configuration")]
        public string levelTitle = "Level 4: Ruang Bawah Tanah";
        public string levelObjective = "Gunakan 4 Kunci Energi untuk membuka Gerbang Evaluasi Akhir";

        [Header("Basement Environment")]
        public GameObject[] basementObjects;
        public GameObject energyGate;
        public GameObject[] energyKeySlots;
        public Light[] mysticalLights;
        public ParticleSystem energyAura;

        [Header("Quiz System")]
        public QuizSystem quizSystem;
        public GameObject quizTerminal;

        [Header("Energy Gate")]
        public Button activateGateButton;
        public Text gateStatusText;

        [Header("Atmospheric Effects")]
        public AudioSource mysticalAmbience;
        public GameObject[] crystalFormations;
        public Light centralLight;

        private bool gateActivated = false;
        private bool levelCompleted = false;
        private bool allKeysValidated = false;

        public void OnStateEnter()
        {
            // Set level information
            if (UIManager.Instance != null)
            {
                UIManager.Instance.SetLevelInfo(levelTitle, levelObjective);
            }

            // Play mysterious basement music
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayBackgroundMusic("basement_mysterious");
            }

            // Initialize basement
            InitializeBasement();

            // Check energy keys status
            CheckEnergyKeysStatus();

            // Show level introduction
            ShowBasementIntroduction();
        }

        public void OnStateUpdate()
        {
            // Update mystical atmosphere
            UpdateMysticalAtmosphere();

            // Check for level completion
            if (!levelCompleted && quizSystem != null && quizSystem.IsPuzzleCompleted())
            {
                CompleteLevel();
            }
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

        private void InitializeBasement()
        {
            // Activate basement objects
            foreach (var obj in basementObjects)
            {
                if (obj != null)
                    obj.SetActive(true);
            }

            // Setup gate activation button
            if (activateGateButton != null)
            {
                activateGateButton.onClick.AddListener(TryActivateGate);
            }

            // Initially hide quiz terminal
            if (quizTerminal != null)
            {
                quizTerminal.SetActive(false);
            }

            // Start mystical ambience
            if (mysticalAmbience != null)
            {
                mysticalAmbience.Play();
            }

            // Initialize energy aura effect
            if (energyAura != null)
            {
                energyAura.Play();
            }

            // Animate crystal formations
            StartCoroutine(AnimateCrystals());
        }

        private void CheckEnergyKeysStatus()
        {
            if (GameManager.Instance == null) return;

            int collectedKeys = GameManager.Instance.GetCollectedKeysCount();
            bool hasAllKeys = GameManager.Instance.AllKeysCollected();

            // Update gate status
            if (gateStatusText != null)
            {
                if (hasAllKeys)
                {
                    gateStatusText.text = "SEMUA KUNCI ENERGI TERKUMPUL!\nGerbang siap diaktifkan.";
                    gateStatusText.color = Color.green;
                    allKeysValidated = true;
                }
                else
                {
                    gateStatusText.text = $"Kunci Energi: {collectedKeys}/4\nKumpulkan semua kunci untuk melanjutkan.";
                    gateStatusText.color = Color.yellow;
                }
            }

            // Update energy key slots visual
            UpdateEnergyKeySlots();

            // Enable gate activation if all keys collected
            if (activateGateButton != null)
            {
                activateGateButton.interactable = hasAllKeys;
            }
        }

        private void UpdateEnergyKeySlots()
        {
            if (energyKeySlots == null || GameManager.Instance == null) return;

            for (int i = 0; i < energyKeySlots.Length; i++)
            {
                if (energyKeySlots[i] != null)
                {
                    bool hasKey = i < GameManager.Instance.collectedKeys.Count && 
                                 GameManager.Instance.collectedKeys[i];

                    // Update visual state
                    var renderer = energyKeySlots[i].GetComponent<Renderer>();
                    if (renderer != null)
                    {
                        renderer.material.color = hasKey ? Color.cyan : Color.gray;
                    }

                    // Update light
                    var light = energyKeySlots[i].GetComponent<Light>();
                    if (light != null)
                    {
                        light.enabled = hasKey;
                        light.color = Color.cyan;
                    }

                    // Animate collected keys
                    if (hasKey)
                    {
                        StartCoroutine(AnimateEnergyKey(energyKeySlots[i]));
                    }
                }
            }
        }

        private IEnumerator AnimateEnergyKey(GameObject keySlot)
        {
            Vector3 originalPosition = keySlot.transform.position;
            
            while (true)
            {
                // Floating animation
                float time = Time.time * 2f;
                float yOffset = Mathf.Sin(time) * 0.2f;
                keySlot.transform.position = originalPosition + Vector3.up * yOffset;

                // Rotation animation
                keySlot.transform.Rotate(Vector3.up, 30f * Time.deltaTime);

                yield return null;
            }
        }

        private void ShowBasementIntroduction()
        {
            string introMessage = "Kamu telah mencapai ruang bawah tanah misterius!\n\n" +
                                "Di depanmu terdapat Gerbang Evaluasi Akhir yang bercahaya biru.\n\n" +
                                "UNTUK MEMBUKA GERBANG:\n" +
                                "• Kumpulkan semua 4 Kunci Energi\n" +
                                "• Selesaikan kuis pengetahuan listrik\n" +
                                "• Buktikan pemahamanmu tentang energi\n\n" +
                                $"Status saat ini: {GameManager.Instance?.GetCollectedKeysCount() ?? 0}/4 Kunci Energi terkumpul";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Gerbang Evaluasi Akhir", introMessage);
            }

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayNarration("basement_intro");
            }
        }

        public void TryActivateGate()
        {
            if (!allKeysValidated)
            {
                // Show missing keys message
                int missing = 4 - (GameManager.Instance?.GetCollectedKeysCount() ?? 0);
                string message = $"Kunci Energi tidak lengkap! Masih perlu {missing} kunci lagi.";

                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowFeedback(message, false);
                }

                if (AudioManager.Instance != null)
                {
                    AudioManager.Instance.PlayErrorSound();
                }

                return;
            }

            // Activate the energy gate
            StartCoroutine(ActivateEnergyGate());
        }

        private IEnumerator ActivateEnergyGate()
        {
            gateActivated = true;

            // Play gate activation sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("gate_activation");
            }

            // Animate energy keys being consumed
            yield return StartCoroutine(ConsumeEnergyKeys());

            // Animate gate opening
            yield return StartCoroutine(OpenEnergyGate());

            // Reveal quiz terminal
            yield return StartCoroutine(RevealQuizTerminal());

            // Start the quiz
            if (quizSystem != null)
            {
                quizSystem.StartQuiz();
            }
        }

        private IEnumerator ConsumeEnergyKeys()
        {
            // Animate each energy key being absorbed into the gate
            for (int i = 0; i < energyKeySlots.Length; i++)
            {
                if (energyKeySlots[i] != null)
                {
                    GameObject keySlot = energyKeySlots[i];
                    Vector3 startPos = keySlot.transform.position;
                    Vector3 gatePos = energyGate.transform.position;

                    float moveTime = 1f;
                    float elapsedTime = 0f;

                    // Create energy beam effect
                    LineRenderer beam = keySlot.AddComponent<LineRenderer>();
                    beam.material = new Material(Shader.Find("Sprites/Default"));
                    beam.color = Color.cyan;
                    beam.startWidth = 0.1f;
                    beam.endWidth = 0.1f;
                    beam.positionCount = 2;

                    while (elapsedTime < moveTime)
                    {
                        float progress = elapsedTime / moveTime;
                        
                        // Update beam
                        beam.SetPosition(0, startPos);
                        beam.SetPosition(1, Vector3.Lerp(startPos, gatePos, progress));

                        elapsedTime += Time.deltaTime;
                        yield return null;
                    }

                    // Key absorbed effect
                    if (AudioManager.Instance != null)
                    {
                        AudioManager.Instance.PlaySFX("key_absorbed");
                    }

                    // Remove beam
                    Destroy(beam);

                    yield return new WaitForSeconds(0.5f);
                }
            }

            // Show all keys consumed message
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Semua Kunci Energi diserap oleh gerbang! Kekuatan gerbang menguat.", true, 3f);
            }
        }

        private IEnumerator OpenEnergyGate()
        {
            if (energyGate == null) yield break;

            // Gate opening animation
            Vector3 startScale = energyGate.transform.localScale;
            Vector3 endScale = startScale * 1.5f;

            // Light intensity animation
            Light gateLight = energyGate.GetComponent<Light>();
            float startIntensity = gateLight != null ? gateLight.intensity : 1f;
            float endIntensity = startIntensity * 3f;

            float openTime = 3f;
            float elapsedTime = 0f;

            while (elapsedTime < openTime)
            {
                float progress = elapsedTime / openTime;
                
                // Scale animation
                energyGate.transform.localScale = Vector3.Lerp(startScale, endScale, progress);
                
                // Light animation
                if (gateLight != null)
                {
                    gateLight.intensity = Mathf.Lerp(startIntensity, endIntensity, progress);
                }

                elapsedTime += Time.deltaTime;
                yield return null;
            }

            // Play gate opened sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("gate_opened");
            }

            // Show gate opened message
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Gerbang Evaluasi terbuka! Terminal kuis muncul.", true, 3f);
            }
        }

        private IEnumerator RevealQuizTerminal()
        {
            if (quizTerminal == null) yield break;

            quizTerminal.SetActive(true);

            // Terminal rise animation
            Vector3 startPos = quizTerminal.transform.position;
            Vector3 endPos = startPos + Vector3.up * 2f;

            float riseTime = 2f;
            float elapsedTime = 0f;

            while (elapsedTime < riseTime)
            {
                float progress = elapsedTime / riseTime;
                quizTerminal.transform.position = Vector3.Lerp(startPos, endPos, progress);
                elapsedTime += Time.deltaTime;
                yield return null;
            }

            // Play terminal activation sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("terminal_activate");
            }

            // Show quiz instructions
            yield return new WaitForSeconds(1f);
            ShowQuizInstructions();
        }

        private void ShowQuizInstructions()
        {
            string instructions = "EVALUASI AKHIR - KUIS PENGETAHUAN ENERGI\n\n" +
                                "Selamat! Kamu telah mengumpulkan semua Kunci Energi.\n\n" +
                                "ATURAN KUIS:\n" +
                                "• 10 pertanyaan acak tentang listrik dan energi\n" +
                                "• Waktu 30 detik per pertanyaan\n" +
                                "• Minimal 70% jawaban benar untuk lulus\n" +
                                "• Pertanyaan diacak setiap sesi (Fisher-Yates Shuffle)\n\n" +
                                "TOPIK KUIS:\n" +
                                "• Dasar-dasar kelistrikan\n" +
                                "• Efisiensi energi\n" +
                                "• Perhitungan konsumsi listrik\n" +
                                "• Keamanan listrik\n\n" +
                                "Siap untuk tantangan akhir?";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Evaluasi Akhir", instructions);
            }

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayNarration("quiz_instructions");
            }
        }

        private IEnumerator AnimateCrystals()
        {
            if (crystalFormations == null) yield break;

            while (true)
            {
                foreach (var crystal in crystalFormations)
                {
                    if (crystal != null)
                    {
                        // Glowing crystal effect
                        var renderer = crystal.GetComponent<Renderer>();
                        if (renderer != null)
                        {
                            float glow = Mathf.Sin(Time.time * 2f) * 0.5f + 0.5f;
                            Color glowColor = new Color(0.5f, 0.8f, 1f, glow);
                            renderer.material.SetColor("_EmissionColor", glowColor);
                        }

                        // Rotation
                        crystal.transform.Rotate(Vector3.up, 10f * Time.deltaTime);
                    }
                }

                yield return null;
            }
        }

        private void UpdateMysticalAtmosphere()
        {
            // Update central light based on quiz progress
            if (centralLight != null && quizSystem != null)
            {
                if (gateActivated)
                {
                    float progress = (float)quizSystem.GetCorrectAnswersCount() / quizSystem.GetTotalQuestionsCount();
                    centralLight.intensity = 1f + progress * 2f;
                    centralLight.color = Color.Lerp(Color.blue, Color.white, progress);
                }
            }

            // Update mystical lights
            foreach (var light in mysticalLights)
            {
                if (light != null)
                {
                    float flicker = Mathf.PerlinNoise(Time.time * 3f, 0f);
                    light.intensity = 0.5f + flicker * 0.5f;
                }
            }
        }

        public void OnQuizCompleted()
        {
            // This is called by the quiz system when player passes
            StartCoroutine(HandleQuizCompletion());
        }

        private IEnumerator HandleQuizCompletion()
        {
            yield return new WaitForSeconds(2f);

            // Show quiz completion celebration
            if (UIManager.Instance != null)
            {
                float score = quizSystem?.GetScorePercentage() ?? 0f;
                string message = $"KUIS SELESAI!\nSkor: {score:F1}%\n\nGerbang Evaluasi terbuka sepenuhnya!";
                UIManager.Instance.ShowFeedback(message, true, 5f);
            }

            // Play completion fanfare
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("quiz_completed");
            }

            // Final gate opening effect
            yield return StartCoroutine(FinalGateOpening());

            // Reveal the scientist
            yield return StartCoroutine(RevealScientist());
        }

        private IEnumerator FinalGateOpening()
        {
            if (energyGate == null) yield break;

            // Dramatic final opening
            Vector3 startScale = energyGate.transform.localScale;
            Vector3 endScale = startScale * 2f;

            // Intense light effect
            Light gateLight = energyGate.GetComponent<Light>();
            float startIntensity = gateLight != null ? gateLight.intensity : 1f;

            float openTime = 4f;
            float elapsedTime = 0f;

            while (elapsedTime < openTime)
            {
                float progress = elapsedTime / openTime;
                
                // Scale and light animation
                energyGate.transform.localScale = Vector3.Lerp(startScale, endScale, progress);
                
                if (gateLight != null)
                {
                    gateLight.intensity = startIntensity + Mathf.Sin(progress * Mathf.PI) * 5f;
                }

                elapsedTime += Time.deltaTime;
                yield return null;
            }

            // Play gate fully opened sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("gate_fully_opened");
            }
        }

        private IEnumerator RevealScientist()
        {
            // Create scientist appearance
            GameObject scientist = new GameObject("Scientist");
            scientist.transform.position = energyGate.transform.position + Vector3.forward * 2f;

            // Add scientist visual (placeholder)
            var scientistRenderer = scientist.AddComponent<MeshRenderer>();
            var scientistMesh = scientist.AddComponent<MeshFilter>();
            scientistMesh.mesh = CreateScientistMesh();

            // Scientist appearance animation
            Vector3 startScale = Vector3.zero;
            Vector3 endScale = Vector3.one;

            float appearTime = 2f;
            float elapsedTime = 0f;

            while (elapsedTime < appearTime)
            {
                float progress = elapsedTime / appearTime;
                scientist.transform.localScale = Vector3.Lerp(startScale, endScale, progress);
                elapsedTime += Time.deltaTime;
                yield return null;
            }

            // Play scientist found sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("scientist_found");
            }

            // Scientist speaks
            yield return new WaitForSeconds(1f);
            
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayNarration("scientist_final_message");
            }

            string scientistMessage = "Selamat, kamu telah menyelamatkanku!\n\n" +
                                    "Perjalananmu mengajarkan pentingnya:\n" +
                                    "• Memahami dasar-dasar kelistrikan\n" +
                                    "• Menggunakan energi secara efisien\n" +
                                    "• Menghitung dan mengelola konsumsi energi\n" +
                                    "• Menjadi generasi yang peduli lingkungan\n\n" +
                                    "Gunakan pengetahuan ini untuk masa depan yang lebih baik!";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Ilmuwan Ditemukan!", scientistMessage);
            }

            yield return new WaitForSeconds(5f);

            // Complete the game
            CompleteLevel();
        }

        private Mesh CreateScientistMesh()
        {
            // Create a simple scientist representation (placeholder)
            // In a real game, this would be a proper 3D model
            Mesh mesh = new Mesh();
            
            Vector3[] vertices = {
                new Vector3(-0.5f, 0, 0), new Vector3(0.5f, 0, 0),
                new Vector3(-0.5f, 2, 0), new Vector3(0.5f, 2, 0)
            };
            
            int[] triangles = { 0, 2, 1, 2, 3, 1 };
            
            mesh.vertices = vertices;
            mesh.triangles = triangles;
            mesh.RecalculateNormals();
            
            return mesh;
        }

        private void CompleteLevel()
        {
            levelCompleted = true;

            // Complete level in game manager
            if (GameManager.Instance != null)
            {
                GameManager.Instance.CompleteLevel(4);
                GameManager.Instance.CompleteGame();
            }

            // Transition to ending scene
            StartCoroutine(TransitionToEnding());
        }

        private IEnumerator TransitionToEnding()
        {
            yield return new WaitForSeconds(3f);

            // Fade to ending
            FiniteStateMachine.Instance.ChangeState(GameState.EndingScene);
        }

        // Debug methods
        [ContextMenu("Force Activate Gate")]
        private void DebugForceActivateGate()
        {
            allKeysValidated = true;
            TryActivateGate();
        }

        [ContextMenu("Complete Quiz")]
        private void DebugCompleteQuiz()
        {
            if (quizSystem != null)
            {
                OnQuizCompleted();
            }
        }

        private void OnDestroy()
        {
            if (activateGateButton != null)
                activateGateButton.onClick.RemoveAllListeners();
        }
    }
}