using UnityEngine;
using System.Collections;
using EnergyQuest.Core;
using EnergyQuest.Puzzles;
using EnergyQuest.UI;
using EnergyQuest.Audio;

namespace EnergyQuest.GameStates
{
    public class LivingRoomHandler : MonoBehaviour, IGameState
    {
        [Header("Level Configuration")]
        public string levelTitle = "Level 1: Ruang Tamu";
        public string levelObjective = "Nyalakan listrik di ruang tamu dan temukan petunjuk pertama";

        [Header("Puzzles")]
        public CablePuzzle cablePuzzle;
        public TVPuzzle tvPuzzle;

        [Header("Room Environment")]
        public GameObject[] roomLights;
        public GameObject doorToKitchen;
        public ParticleSystem dustParticles;
        public AudioSource ambientAudioSource;

        [Header("Interactive Objects")]
        public GameObject[] interactableObjects;

        private bool cablePuzzleCompleted = false;
        private bool tvPuzzleCompleted = false;
        private bool levelCompleted = false;

        public void OnStateEnter()
        {
            // Set level information
            if (UIManager.Instance != null)
            {
                UIManager.Instance.SetLevelInfo(levelTitle, levelObjective);
            }

            // Play level background music
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayBackgroundMusic("living_room_ambient");
            }

            // Initialize room state
            InitializeRoom();

            // Setup puzzle event listeners
            SetupPuzzleEvents();

            // Show intro narration
            ShowLevelIntroduction();
        }

        public void OnStateUpdate()
        {
            // Check puzzle completion status
            CheckPuzzleProgress();

            // Handle level completion
            if (!levelCompleted && cablePuzzleCompleted && tvPuzzleCompleted)
            {
                CompleteLevel();
            }

            // Handle input for mobile
            HandleMobileInput();
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

        private void InitializeRoom()
        {
            // Room starts dark (lights off)
            foreach (var light in roomLights)
            {
                if (light != null)
                    light.SetActive(false);
            }

            // Door to kitchen is initially locked
            if (doorToKitchen != null)
            {
                doorToKitchen.SetActive(false);
            }

            // Start ambient dust particles
            if (dustParticles != null)
            {
                dustParticles.Play();
            }

            // Play ambient room sounds
            if (ambientAudioSource != null)
            {
                ambientAudioSource.Play();
            }

            // Reset puzzle states
            if (cablePuzzle != null)
                cablePuzzle.ResetPuzzleState();

            if (tvPuzzle != null)
                tvPuzzle.ResetPuzzleState();
        }

        private void SetupPuzzleEvents()
        {
            // Enable interactive objects
            foreach (var obj in interactableObjects)
            {
                if (obj != null)
                    obj.SetActive(true);
            }
        }

        private void ShowLevelIntroduction()
        {
            string introMessage = "Kamu memasuki rumah yang gelap gulita. " +
                                "Untuk melanjutkan eksplorasi, kamu harus memperbaiki rangkaian listrik yang berantakan. " +
                                "Selesaikan puzzle kabel terlebih dahulu, lalu nyalakan TV untuk mencari petunjuk.";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Selamat Datang di Ruang Tamu", introMessage);
            }

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayNarration("living_room_intro");
            }
        }

        private void CheckPuzzleProgress()
        {
            // Check cable puzzle
            if (!cablePuzzleCompleted && cablePuzzle != null && cablePuzzle.IsPuzzleCompleted())
            {
                OnCablePuzzleCompleted();
            }

            // Check TV puzzle
            if (!tvPuzzleCompleted && tvPuzzle != null && tvPuzzle.IsPuzzleCompleted())
            {
                OnTVPuzzleCompleted();
            }
        }

        private void OnCablePuzzleCompleted()
        {
            cablePuzzleCompleted = true;

            // Turn on room lights
            StartCoroutine(TurnOnRoomLights());

            // Play success narration
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayNarration("cable_puzzle_success");
            }

            // Show next objective
            if (UIManager.Instance != null)
            {
                UIManager.Instance.SetLevelInfo(levelTitle, "Bagus! Sekarang nyalakan TV dan cari channel yang tepat");
            }
        }

        private void OnTVPuzzleCompleted()
        {
            tvPuzzleCompleted = true;

            // Play completion narration
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayNarration("tv_puzzle_success");
            }

            // Open door to kitchen
            if (doorToKitchen != null)
            {
                StartCoroutine(OpenDoorToKitchen());
            }
        }

        private IEnumerator TurnOnRoomLights()
        {
            // Turn on lights one by one with delay
            foreach (var light in roomLights)
            {
                if (light != null)
                {
                    light.SetActive(true);
                    
                    // Play light switch sound
                    if (AudioManager.Instance != null)
                        AudioManager.Instance.PlaySFX("light_switch");

                    yield return new WaitForSeconds(0.5f);
                }
            }

            // Stop dust particles (room is now lit)
            if (dustParticles != null)
            {
                dustParticles.Stop();
            }
        }

        private IEnumerator OpenDoorToKitchen()
        {
            if (doorToKitchen == null) yield break;

            // Show door opening animation
            doorToKitchen.SetActive(true);

            // Play door opening sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("door_open");
            }

            // Animate door opening
            Vector3 startRotation = doorToKitchen.transform.eulerAngles;
            Vector3 endRotation = startRotation + new Vector3(0, 90, 0);

            float openDuration = 2f;
            float elapsedTime = 0f;

            while (elapsedTime < openDuration)
            {
                float progress = elapsedTime / openDuration;
                doorToKitchen.transform.eulerAngles = Vector3.Lerp(startRotation, endRotation, progress);
                elapsedTime += Time.deltaTime;
                yield return null;
            }

            // Show door opened message
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Pintu ke dapur terbuka! Kamu bisa melanjutkan ke level berikutnya.", true, 4f);
            }
        }

        private void CompleteLevel()
        {
            levelCompleted = true;

            // Complete level in game manager
            if (GameManager.Instance != null)
            {
                GameManager.Instance.CompleteLevel(1);
            }

            // Show level completion
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Level 1 Selesai! Kamu telah memahami dasar-dasar rangkaian listrik.", true, 5f);
            }

            // Transition to next level after delay
            StartCoroutine(TransitionToNextLevel());
        }

        private IEnumerator TransitionToNextLevel()
        {
            yield return new WaitForSeconds(6f);

            // Ask player if they want to continue to next level
            ShowContinuePrompt();
        }

        private void ShowContinuePrompt()
        {
            // Create continue prompt UI
            GameObject promptPanel = new GameObject("ContinuePrompt");
            promptPanel.transform.SetParent(UIManager.Instance.gameCanvas.transform, false);

            // Add background panel
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
            buttonImage.color = Color.green;

            // Add button text
            GameObject buttonText = new GameObject("ButtonText");
            buttonText.transform.SetParent(continueButton.transform, false);

            Text text = buttonText.AddComponent<Text>();
            text.text = "Lanjut ke Dapur";
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

        private void HandleMobileInput()
        {
            // Handle touch input for mobile
            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);
                
                if (touch.phase == TouchPhase.Began)
                {
                    HandleTouchInput(touch.position);
                }
            }

            // Handle mouse input for testing in editor
            if (Input.GetMouseButtonDown(0))
            {
                HandleTouchInput(Input.mousePosition);
            }
        }

        private void HandleTouchInput(Vector2 screenPosition)
        {
            // Convert screen position to world position
            Ray ray = Camera.main.ScreenPointToRay(screenPosition);
            RaycastHit hit;

            if (Physics.Raycast(ray, out hit))
            {
                // Handle interaction with objects
                GameObject hitObject = hit.collider.gameObject;
                
                // Check if it's an interactable object
                if (IsInteractableObject(hitObject))
                {
                    InteractWithObject(hitObject);
                }
            }
        }

        private bool IsInteractableObject(GameObject obj)
        {
            // Check if object is in interactable objects list
            foreach (var interactable in interactableObjects)
            {
                if (interactable == obj || obj.transform.IsChildOf(interactable.transform))
                    return true;
            }
            return false;
        }

        private void InteractWithObject(GameObject obj)
        {
            // Play interaction sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("object_interact");
            }

            // Add visual feedback (highlight effect)
            StartCoroutine(HighlightObject(obj));
        }

        private IEnumerator HighlightObject(GameObject obj)
        {
            Renderer renderer = obj.GetComponent<Renderer>();
            if (renderer == null) yield break;

            Color originalColor = renderer.material.color;
            Color highlightColor = Color.yellow;

            // Highlight effect
            float highlightTime = 0.3f;
            float elapsedTime = 0f;

            while (elapsedTime < highlightTime)
            {
                float progress = elapsedTime / highlightTime;
                renderer.material.color = Color.Lerp(originalColor, highlightColor, Mathf.Sin(progress * Mathf.PI));
                elapsedTime += Time.deltaTime;
                yield return null;
            }

            renderer.material.color = originalColor;
        }

        // Debug methods
        [ContextMenu("Complete Cable Puzzle")]
        private void DebugCompleteCablePuzzle()
        {
            if (cablePuzzle != null)
            {
                // Simulate cable puzzle completion
                OnCablePuzzleCompleted();
            }
        }

        [ContextMenu("Complete TV Puzzle")]
        private void DebugCompleteTVPuzzle()
        {
            if (tvPuzzle != null)
            {
                // Simulate TV puzzle completion
                OnTVPuzzleCompleted();
            }
        }

        [ContextMenu("Complete Level")]
        private void DebugCompleteLevel()
        {
            cablePuzzleCompleted = true;
            tvPuzzleCompleted = true;
            CompleteLevel();
        }
    }
}