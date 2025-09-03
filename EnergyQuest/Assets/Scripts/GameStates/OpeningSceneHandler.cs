using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using EnergyQuest.Core;
using EnergyQuest.Audio;

namespace EnergyQuest.GameStates
{
    public class OpeningSceneHandler : MonoBehaviour, IGameState
    {
        [Header("Opening Animation Configuration")]
        public float totalAnimationDuration = 30f;
        public bool allowSkip = false; // Non-skippable as per requirements

        [Header("Visual Elements")]
        public Camera mainCamera;
        public GameObject houseExterior;
        public GameObject tvScreen;
        public GameObject playerCharacter;
        public Light houseLight;
        public ParticleSystem electricalEffects;

        [Header("UI Elements")]
        public Canvas openingCanvas;
        public Text narratorText;
        public Text subtitleText;
        public Image fadePanel;
        public Button skipButton;

        [Header("Animation Sequences")]
        public AnimationCurve cameraZoomCurve;
        public AnimationCurve lightFlickerCurve;

        private bool animationCompleted = false;
        private AudioManager audioManager;

        // Animation sequence data
        private struct AnimationSequence
        {
            public float startTime;
            public float duration;
            public string narratorAudio;
            public string subtitleText;
            public System.Action visualAction;

            public AnimationSequence(float start, float dur, string audio, string subtitle, System.Action visual = null)
            {
                startTime = start;
                duration = dur;
                narratorAudio = audio;
                subtitleText = subtitle;
                visualAction = visual;
            }
        }

        private AnimationSequence[] animationSequences;

        private void Awake()
        {
            audioManager = FindObjectOfType<AudioManager>();
            SetupAnimationSequences();
            
            // Initially hide skip button since it's non-skippable
            if (skipButton != null)
                skipButton.gameObject.SetActive(allowSkip);
        }

        private void SetupAnimationSequences()
        {
            animationSequences = new AnimationSequence[]
            {
                // Visual 1 – Night Sky & TV News (0-8 seconds)
                new AnimationSequence(0f, 8f, "reporter_news", 
                    "Ilmuwan listrik terkenal menghilang misterius. Rumahnya penuh teka-teki listrik.",
                    () => StartNightSkySequence()),

                // Visual 2 – Dim & Mysterious House (8-16 seconds)
                new AnimationSequence(8f, 8f, "scientist_recording", 
                    "Jika kau mendengar ini... maka aku butuh bantuanmu. Carilah kunci energi...",
                    () => StartMysteriousHouseSequence()),

                // Visual 3 – Player Character Introduction (16-24 seconds)
                new AnimationSequence(16f, 8f, "narrator_intro", 
                    "Kamu adalah seorang siswa dengan rasa ingin tahu besar. Tugasmu mengungkap rahasia ini.",
                    () => StartPlayerIntroSequence()),

                // Visual 4 – Game Title (24-30 seconds)
                new AnimationSequence(24f, 6f, "narrator_welcome", 
                    "Selamat datang di Energy Quest: Misteri Hemat Listrik. Perjalananmu dimulai sekarang.",
                    () => StartGameTitleSequence())
            };
        }

        public void OnStateEnter()
        {
            if (!animationCompleted)
            {
                StartCoroutine(PlayOpeningAnimation());
            }
            else
            {
                // Skip to main menu if already played
                FiniteStateMachine.Instance.ChangeState(GameState.MainMenu);
            }
        }

        public void OnStateUpdate()
        {
            // Handle skip input (if allowed)
            if (allowSkip && Input.GetKeyDown(KeyCode.Escape))
            {
                SkipAnimation();
            }
        }

        public void OnStateExit()
        {
            // Clean up any ongoing animations
            StopAllCoroutines();
        }

        private IEnumerator PlayOpeningAnimation()
        {
            float elapsedTime = 0f;
            int currentSequenceIndex = 0;

            // Fade in from black
            yield return StartCoroutine(FadeIn(1f));

            while (elapsedTime < totalAnimationDuration && currentSequenceIndex < animationSequences.Length)
            {
                var sequence = animationSequences[currentSequenceIndex];

                // Check if it's time to start this sequence
                if (elapsedTime >= sequence.startTime)
                {
                    // Execute visual action
                    sequence.visualAction?.Invoke();

                    // Play narrator audio
                    if (audioManager != null && !string.IsNullOrEmpty(sequence.narratorAudio))
                    {
                        audioManager.PlayNarration(sequence.narratorAudio);
                    }

                    // Display subtitle
                    if (subtitleText != null)
                    {
                        subtitleText.text = sequence.subtitleText;
                        StartCoroutine(TypewriterEffect(subtitleText, sequence.subtitleText, 0.05f));
                    }

                    currentSequenceIndex++;
                }

                elapsedTime += Time.deltaTime;
                yield return null;
            }

            // Animation completed
            animationCompleted = true;

            // Fade out and transition to main menu
            yield return StartCoroutine(FadeOut(1f));
            FiniteStateMachine.Instance.ChangeState(GameState.MainMenu);
        }

        private void StartNightSkySequence()
        {
            // Camera zoom to house
            StartCoroutine(CameraZoomToHouse(8f));
            
            // Show TV with news
            if (tvScreen != null)
            {
                tvScreen.SetActive(true);
                StartCoroutine(FlickerTVScreen());
            }
        }

        private void StartMysteriousHouseSequence()
        {
            // Flicker house lights
            if (houseLight != null)
            {
                StartCoroutine(FlickerHouseLights(8f));
            }

            // Show electrical effects
            if (electricalEffects != null)
            {
                electricalEffects.Play();
            }

            // Show scientist shadow briefly
            StartCoroutine(ShowScientistShadow());
        }

        private void StartPlayerIntroSequence()
        {
            // Show player character
            if (playerCharacter != null)
            {
                playerCharacter.SetActive(true);
                StartCoroutine(PlayerWalkToGate());
            }

            // Open gate slowly
            StartCoroutine(OpenHouseGate());
        }

        private void StartGameTitleSequence()
        {
            // Show game title with electrical effects
            StartCoroutine(ShowGameTitle());
            
            // Play theme music
            if (audioManager != null)
            {
                audioManager.PlayThemeMusic();
            }
        }

        private IEnumerator CameraZoomToHouse(float duration)
        {
            if (mainCamera == null) yield break;

            Vector3 startPos = mainCamera.transform.position;
            Vector3 endPos = startPos + Vector3.forward * 10f; // Zoom closer to house
            float startFOV = mainCamera.fieldOfView;
            float endFOV = 45f;

            float elapsedTime = 0f;
            while (elapsedTime < duration)
            {
                float progress = elapsedTime / duration;
                float curveValue = cameraZoomCurve.Evaluate(progress);

                mainCamera.transform.position = Vector3.Lerp(startPos, endPos, curveValue);
                mainCamera.fieldOfView = Mathf.Lerp(startFOV, endFOV, curveValue);

                elapsedTime += Time.deltaTime;
                yield return null;
            }
        }

        private IEnumerator FlickerHouseLights(float duration)
        {
            if (houseLight == null) yield break;

            float elapsedTime = 0f;
            float originalIntensity = houseLight.intensity;

            while (elapsedTime < duration)
            {
                float progress = elapsedTime / duration;
                float flickerValue = lightFlickerCurve.Evaluate(progress);
                
                houseLight.intensity = originalIntensity * flickerValue;
                
                // Random flicker effect
                if (Random.Range(0f, 1f) < 0.1f)
                {
                    houseLight.intensity = 0f;
                    yield return new WaitForSeconds(0.1f);
                }

                elapsedTime += Time.deltaTime;
                yield return null;
            }

            houseLight.intensity = originalIntensity;
        }

        private IEnumerator FlickerTVScreen()
        {
            if (tvScreen == null) yield break;

            var renderer = tvScreen.GetComponent<Renderer>();
            if (renderer == null) yield break;

            for (int i = 0; i < 5; i++)
            {
                renderer.enabled = !renderer.enabled;
                yield return new WaitForSeconds(0.2f);
            }
            renderer.enabled = true;
        }

        private IEnumerator ShowScientistShadow()
        {
            // Create a temporary shadow silhouette
            GameObject shadow = new GameObject("ScientistShadow");
            shadow.transform.position = new Vector3(0, 2, 5); // Window position

            var shadowRenderer = shadow.AddComponent<SpriteRenderer>();
            shadowRenderer.color = Color.black;

            // Show shadow briefly
            yield return new WaitForSeconds(2f);
            
            // Fade out shadow
            float fadeTime = 1f;
            float elapsedTime = 0f;
            Color startColor = shadowRenderer.color;

            while (elapsedTime < fadeTime)
            {
                float alpha = Mathf.Lerp(1f, 0f, elapsedTime / fadeTime);
                shadowRenderer.color = new Color(startColor.r, startColor.g, startColor.b, alpha);
                elapsedTime += Time.deltaTime;
                yield return null;
            }

            Destroy(shadow);
        }

        private IEnumerator PlayerWalkToGate()
        {
            if (playerCharacter == null) yield break;

            Vector3 startPos = playerCharacter.transform.position;
            Vector3 endPos = startPos + Vector3.forward * 3f;

            float walkDuration = 3f;
            float elapsedTime = 0f;

            while (elapsedTime < walkDuration)
            {
                float progress = elapsedTime / walkDuration;
                playerCharacter.transform.position = Vector3.Lerp(startPos, endPos, progress);
                elapsedTime += Time.deltaTime;
                yield return null;
            }
        }

        private IEnumerator OpenHouseGate()
        {
            // Find gate object and animate opening
            GameObject gate = GameObject.FindWithTag("HouseGate");
            if (gate == null) yield break;

            Vector3 startRotation = gate.transform.eulerAngles;
            Vector3 endRotation = startRotation + new Vector3(0, 90, 0);

            float openDuration = 2f;
            float elapsedTime = 0f;

            while (elapsedTime < openDuration)
            {
                float progress = elapsedTime / openDuration;
                gate.transform.eulerAngles = Vector3.Lerp(startRotation, endRotation, progress);
                elapsedTime += Time.deltaTime;
                yield return null;
            }
        }

        private IEnumerator ShowGameTitle()
        {
            // Create game title text
            GameObject titleObject = new GameObject("GameTitle");
            titleObject.transform.SetParent(openingCanvas.transform, false);

            Text titleText = titleObject.AddComponent<Text>();
            titleText.text = "ENERGY QUEST:\nMISTERI HEMAT LISTRIK";
            titleText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            titleText.fontSize = 48;
            titleText.color = Color.white;
            titleText.alignment = TextAnchor.MiddleCenter;

            RectTransform titleRect = titleObject.GetComponent<RectTransform>();
            titleRect.anchorMin = Vector2.zero;
            titleRect.anchorMax = Vector2.one;
            titleRect.offsetMin = Vector2.zero;
            titleRect.offsetMax = Vector2.zero;

            // Electrical effect animation
            yield return StartCoroutine(ElectricalTitleEffect(titleText, 4f));
            
            // Keep title visible for remaining time
            yield return new WaitForSeconds(2f);

            Destroy(titleObject);
        }

        private IEnumerator ElectricalTitleEffect(Text titleText, float duration)
        {
            float elapsedTime = 0f;
            Color originalColor = titleText.color;

            while (elapsedTime < duration)
            {
                // Electric flicker effect
                if (Random.Range(0f, 1f) < 0.3f)
                {
                    titleText.color = new Color(0.8f, 0.9f, 1f, 1f); // Electric blue
                    yield return new WaitForSeconds(0.05f);
                    titleText.color = originalColor;
                }

                elapsedTime += Time.deltaTime;
                yield return null;
            }
        }

        private IEnumerator TypewriterEffect(Text textComponent, string fullText, float charDelay)
        {
            textComponent.text = "";
            
            foreach (char c in fullText)
            {
                textComponent.text += c;
                yield return new WaitForSeconds(charDelay);
            }
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

        private IEnumerator FadeOut(float duration)
        {
            if (fadePanel == null) yield break;

            fadePanel.gameObject.SetActive(true);
            Color startColor = new Color(0, 0, 0, 0);
            Color endColor = new Color(0, 0, 0, 1);

            float elapsedTime = 0f;
            while (elapsedTime < duration)
            {
                float progress = elapsedTime / duration;
                fadePanel.color = Color.Lerp(startColor, endColor, progress);
                elapsedTime += Time.deltaTime;
                yield return null;
            }
        }

        public void SkipAnimation()
        {
            if (!allowSkip) return;

            StopAllCoroutines();
            animationCompleted = true;
            FiniteStateMachine.Instance.ChangeState(GameState.MainMenu);
        }

        // Button event handlers
        public void OnSkipButtonClicked()
        {
            SkipAnimation();
        }
    }
}