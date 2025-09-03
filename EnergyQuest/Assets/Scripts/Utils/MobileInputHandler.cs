using UnityEngine;
using UnityEngine.EventSystems;

namespace EnergyQuest.Utils
{
    public class MobileInputHandler : MonoBehaviour
    {
        [Header("Touch Configuration")]
        public float touchSensitivity = 1f;
        public float doubleTapTime = 0.3f;
        public float longPressTime = 1f;

        [Header("Camera Control")]
        public Camera playerCamera;
        public float cameraRotationSpeed = 100f;
        public float cameraZoomSpeed = 2f;
        public float minZoom = 3f;
        public float maxZoom = 10f;

        [Header("Object Interaction")]
        public LayerMask interactableLayer = 1;
        public float maxInteractionDistance = 5f;

        // Touch state
        private Vector2 lastTouchPosition;
        private float lastTouchTime;
        private bool isDragging = false;
        private float currentTouchTime = 0f;

        // Events
        public System.Action<Vector3> OnTouchTap;
        public System.Action<Vector3> OnTouchDoubleTap;
        public System.Action<Vector3> OnTouchLongPress;
        public System.Action<Vector2> OnTouchDrag;
        public System.Action<float> OnPinchZoom;

        private void Start()
        {
            if (playerCamera == null)
                playerCamera = Camera.main;
        }

        private void Update()
        {
            HandleTouchInput();
            HandleKeyboardInput(); // For testing in editor
        }

        private void HandleTouchInput()
        {
            // Single touch handling
            if (Input.touchCount == 1)
            {
                Touch touch = Input.GetTouch(0);
                HandleSingleTouch(touch);
            }
            // Multi-touch handling (pinch zoom)
            else if (Input.touchCount == 2)
            {
                HandlePinchZoom();
            }
        }

        private void HandleSingleTouch(Touch touch)
        {
            switch (touch.phase)
            {
                case TouchPhase.Began:
                    OnTouchBegan(touch.position);
                    break;

                case TouchPhase.Moved:
                    OnTouchMoved(touch.position);
                    break;

                case TouchPhase.Stationary:
                    OnTouchStationary(touch.position);
                    break;

                case TouchPhase.Ended:
                    OnTouchEnded(touch.position);
                    break;

                case TouchPhase.Canceled:
                    OnTouchCanceled();
                    break;
            }
        }

        private void OnTouchBegan(Vector2 touchPosition)
        {
            lastTouchPosition = touchPosition;
            lastTouchTime = Time.time;
            currentTouchTime = 0f;
            isDragging = false;
        }

        private void OnTouchMoved(Vector2 touchPosition)
        {
            if (!isDragging)
            {
                float distance = Vector2.Distance(touchPosition, lastTouchPosition);
                if (distance > 10f) // Start dragging threshold
                {
                    isDragging = true;
                }
            }

            if (isDragging)
            {
                Vector2 deltaPosition = touchPosition - lastTouchPosition;
                OnTouchDrag?.Invoke(deltaPosition * touchSensitivity);
                
                // Rotate camera based on drag
                if (playerCamera != null)
                {
                    float rotationX = -deltaPosition.y * cameraRotationSpeed * Time.deltaTime;
                    float rotationY = deltaPosition.x * cameraRotationSpeed * Time.deltaTime;
                    
                    playerCamera.transform.Rotate(rotationX, rotationY, 0);
                }
            }

            lastTouchPosition = touchPosition;
        }

        private void OnTouchStationary(Vector2 touchPosition)
        {
            currentTouchTime += Time.deltaTime;

            // Check for long press
            if (currentTouchTime >= longPressTime && !isDragging)
            {
                Vector3 worldPosition = GetWorldPosition(touchPosition);
                OnTouchLongPress?.Invoke(worldPosition);
                currentTouchTime = 0f; // Prevent multiple long press events
            }
        }

        private void OnTouchEnded(Vector2 touchPosition)
        {
            if (!isDragging)
            {
                float touchDuration = Time.time - lastTouchTime;
                Vector3 worldPosition = GetWorldPosition(touchPosition);

                // Check for double tap
                if (touchDuration < doubleTapTime)
                {
                    // Check if this is a second tap (simple double tap detection)
                    if (Time.time - lastTouchTime < doubleTapTime * 2)
                    {
                        OnTouchDoubleTap?.Invoke(worldPosition);
                    }
                    else
                    {
                        OnTouchTap?.Invoke(worldPosition);
                    }
                }
                else
                {
                    OnTouchTap?.Invoke(worldPosition);
                }

                // Handle object interaction
                HandleObjectInteraction(touchPosition);
            }

            ResetTouchState();
        }

        private void OnTouchCanceled()
        {
            ResetTouchState();
        }

        private void ResetTouchState()
        {
            isDragging = false;
            currentTouchTime = 0f;
        }

        private void HandlePinchZoom()
        {
            Touch touch1 = Input.GetTouch(0);
            Touch touch2 = Input.GetTouch(1);

            // Calculate current distance between touches
            float currentDistance = Vector2.Distance(touch1.position, touch2.position);

            // Calculate previous distance
            Vector2 touch1PrevPos = touch1.position - touch1.deltaPosition;
            Vector2 touch2PrevPos = touch2.position - touch2.deltaPosition;
            float prevDistance = Vector2.Distance(touch1PrevPos, touch2PrevPos);

            // Calculate zoom factor
            float deltaDistance = currentDistance - prevDistance;
            float zoomFactor = deltaDistance * cameraZoomSpeed * Time.deltaTime;

            OnPinchZoom?.Invoke(zoomFactor);

            // Apply zoom to camera
            if (playerCamera != null)
            {
                float newSize = playerCamera.orthographicSize - zoomFactor;
                playerCamera.orthographicSize = Mathf.Clamp(newSize, minZoom, maxZoom);
            }
        }

        private void HandleObjectInteraction(Vector2 screenPosition)
        {
            if (playerCamera == null) return;

            // Raycast from camera to touch position
            Ray ray = playerCamera.ScreenPointToRay(screenPosition);
            RaycastHit hit;

            if (Physics.Raycast(ray, out hit, maxInteractionDistance, interactableLayer))
            {
                GameObject hitObject = hit.collider.gameObject;
                
                // Check for interactive components
                var interactable = hitObject.GetComponent<IInteractable>();
                if (interactable != null)
                {
                    interactable.OnInteract();
                }

                // Check for energy key
                var energyKey = hitObject.GetComponent<EnergyKey>();
                if (energyKey != null)
                {
                    energyKey.CollectKey();
                }

                // Check for puzzle components
                var puzzleComponent = hitObject.GetComponent<IPuzzleComponent>();
                if (puzzleComponent != null)
                {
                    puzzleComponent.OnInteract();
                }

                // Visual feedback for interaction
                ShowInteractionFeedback(hit.point);
            }
        }

        private void ShowInteractionFeedback(Vector3 worldPosition)
        {
            // Create temporary interaction effect
            GameObject effect = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            effect.transform.position = worldPosition;
            effect.transform.localScale = Vector3.one * 0.2f;

            // Make it glow
            var renderer = effect.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = Color.yellow;
            }

            // Remove collider
            var collider = effect.GetComponent<Collider>();
            if (collider != null)
            {
                Destroy(collider);
            }

            // Animate and destroy
            StartCoroutine(AnimateInteractionEffect(effect));
        }

        private System.Collections.IEnumerator AnimateInteractionEffect(GameObject effect)
        {
            Vector3 startScale = effect.transform.localScale;
            Vector3 endScale = startScale * 3f;

            float animTime = 0.5f;
            float elapsedTime = 0f;

            var renderer = effect.GetComponent<Renderer>();

            while (elapsedTime < animTime)
            {
                float progress = elapsedTime / animTime;
                
                // Scale up
                effect.transform.localScale = Vector3.Lerp(startScale, endScale, progress);
                
                // Fade out
                if (renderer != null)
                {
                    Color color = renderer.material.color;
                    color.a = 1f - progress;
                    renderer.material.color = color;
                }

                elapsedTime += Time.deltaTime;
                yield return null;
            }

            Destroy(effect);
        }

        private Vector3 GetWorldPosition(Vector2 screenPosition)
        {
            if (playerCamera == null) return Vector3.zero;

            // Convert screen position to world position
            Vector3 worldPos = playerCamera.ScreenToWorldPoint(new Vector3(screenPosition.x, screenPosition.y, 5f));
            return worldPos;
        }

        private void HandleKeyboardInput()
        {
            // Keyboard shortcuts for testing in editor
            #if UNITY_EDITOR
            if (Input.GetKeyDown(KeyCode.Alpha1))
            {
                FiniteStateMachine.Instance?.ChangeState(GameState.Level1_LivingRoom);
            }
            else if (Input.GetKeyDown(KeyCode.Alpha2))
            {
                FiniteStateMachine.Instance?.ChangeState(GameState.Level2_Kitchen);
            }
            else if (Input.GetKeyDown(KeyCode.Alpha3))
            {
                FiniteStateMachine.Instance?.ChangeState(GameState.Level3_Laboratory);
            }
            else if (Input.GetKeyDown(KeyCode.Alpha4))
            {
                FiniteStateMachine.Instance?.ChangeState(GameState.Level4_Basement);
            }
            else if (Input.GetKeyDown(KeyCode.M))
            {
                FiniteStateMachine.Instance?.ChangeState(GameState.MainMenu);
            }
            else if (Input.GetKeyDown(KeyCode.R))
            {
                GameManager.Instance?.ResetGameProgress();
            }
            #endif
        }

        // Public utility methods
        public void ForceInitialize()
        {
            InitializeGame();
        }

        public bool AreAllSystemsReady()
        {
            return GameManager.Instance != null &&
                   FiniteStateMachine.Instance != null &&
                   AudioManager.Instance != null &&
                   UIManager.Instance != null;
        }

        public void ShowSystemStatus()
        {
            Debug.Log("=== ENERGY QUEST SYSTEM STATUS ===");
            Debug.Log($"GameManager: {(GameManager.Instance != null ? "✓" : "✗")}");
            Debug.Log($"FiniteStateMachine: {(FiniteStateMachine.Instance != null ? "✓" : "✗")}");
            Debug.Log($"AudioManager: {(AudioManager.Instance != null ? "✓" : "✗")}");
            Debug.Log($"UIManager: {(UIManager.Instance != null ? "✓" : "✗")}");
            Debug.Log("================================");
        }
    }

    // Interfaces for interactive objects
    public interface IInteractable
    {
        void OnInteract();
    }

    public interface IPuzzleComponent
    {
        void OnInteract();
        bool IsCompleted();
    }
}