using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections.Generic;
using EnergyQuest.Core;
using EnergyQuest.UI;
using EnergyQuest.Audio;

namespace EnergyQuest.Puzzles
{
    public enum ComponentType
    {
        Battery,
        Switch,
        Lamp,
        Cable
    }

    [System.Serializable]
    public class ElectricalComponent
    {
        public ComponentType type;
        public GameObject gameObject;
        public Transform connectionPoint;
        public bool isConnected;
        public ElectricalComponent connectedTo;
        public int connectionOrder; // For circuit validation
        
        public ElectricalComponent(ComponentType compType, GameObject obj)
        {
            type = compType;
            gameObject = obj;
            isConnected = false;
            connectedTo = null;
            connectionOrder = -1;
        }
    }

    public class CablePuzzle : MonoBehaviour
    {
        [Header("Puzzle Configuration")]
        public bool isCompleted = false;
        public float completionReward = 1f;

        [Header("Electrical Components")]
        public ElectricalComponent battery;
        public ElectricalComponent switchComponent;
        public ElectricalComponent lamp;
        public List<ElectricalComponent> cables = new List<ElectricalComponent>();

        [Header("Visual Feedback")]
        public Material connectedCableMaterial;
        public Material disconnectedCableMaterial;
        public Material errorCableMaterial;
        public Light lampLight;
        public ParticleSystem electricalSparks;

        [Header("Connection Validation")]
        public LayerMask connectionLayerMask = 1;
        public float connectionDistance = 1f;

        // Drag and drop variables
        private ElectricalComponent draggedComponent;
        private bool isDragging = false;
        private Camera playerCamera;
        private LineRenderer currentCableRenderer;

        // Correct circuit: Battery(+) → Switch → Lamp → Battery(-)
        private readonly int[] correctCircuitOrder = { 0, 1, 2, 3 }; // Battery+, Switch, Lamp, Battery-

        private void Start()
        {
            playerCamera = Camera.main;
            SetupComponents();
            ResetPuzzle();
        }

        private void SetupComponents()
        {
            // Setup battery
            if (battery.gameObject != null)
            {
                SetupComponent(battery);
            }

            // Setup switch
            if (switchComponent.gameObject != null)
            {
                SetupComponent(switchComponent);
            }

            // Setup lamp
            if (lamp.gameObject != null)
            {
                SetupComponent(lamp);
                
                // Initially turn off lamp
                if (lampLight != null)
                    lampLight.enabled = false;
            }

            // Setup cables
            foreach (var cable in cables)
            {
                SetupComponent(cable);
                SetupCableRenderer(cable);
            }
        }

        private void SetupComponent(ElectricalComponent component)
        {
            // Add collider for interaction
            if (component.gameObject.GetComponent<Collider>() == null)
            {
                component.gameObject.AddComponent<BoxCollider>();
            }

            // Add drag handler
            var dragHandler = component.gameObject.GetComponent<DragHandler>();
            if (dragHandler == null)
            {
                dragHandler = component.gameObject.AddComponent<DragHandler>();
            }
            dragHandler.onBeginDrag = () => OnBeginDrag(component);
            dragHandler.onDrag = () => OnDrag(component);
            dragHandler.onEndDrag = () => OnEndDrag(component);
        }

        private void SetupCableRenderer(ElectricalComponent cable)
        {
            LineRenderer lineRenderer = cable.gameObject.GetComponent<LineRenderer>();
            if (lineRenderer == null)
            {
                lineRenderer = cable.gameObject.AddComponent<LineRenderer>();
            }

            lineRenderer.material = disconnectedCableMaterial;
            lineRenderer.startWidth = 0.1f;
            lineRenderer.endWidth = 0.1f;
            lineRenderer.positionCount = 2;
            lineRenderer.useWorldSpace = true;
        }

        public void ResetPuzzle()
        {
            // Reset all connections
            battery.isConnected = false;
            battery.connectedTo = null;
            switchComponent.isConnected = false;
            switchComponent.connectedTo = null;
            lamp.isConnected = false;
            lamp.connectedTo = null;

            foreach (var cable in cables)
            {
                cable.isConnected = false;
                cable.connectedTo = null;
                UpdateCableVisual(cable, false);
            }

            // Turn off lamp
            if (lampLight != null)
                lampLight.enabled = false;

            isCompleted = false;
        }

        private void OnBeginDrag(ElectricalComponent component)
        {
            if (isCompleted) return;

            draggedComponent = component;
            isDragging = true;

            // Visual feedback for dragging
            if (component.type == ComponentType.Cable)
            {
                currentCableRenderer = component.gameObject.GetComponent<LineRenderer>();
            }

            // Play drag sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("cable_drag");
            }
        }

        private void OnDrag(ElectricalComponent component)
        {
            if (!isDragging || draggedComponent != component) return;

            // Update cable visual during drag
            if (component.type == ComponentType.Cable && currentCableRenderer != null)
            {
                Vector3 mousePos = Input.mousePosition;
                Vector3 worldPos = playerCamera.ScreenToWorldPoint(new Vector3(mousePos.x, mousePos.y, 5f));
                
                currentCableRenderer.SetPosition(0, component.gameObject.transform.position);
                currentCableRenderer.SetPosition(1, worldPos);
            }
        }

        private void OnEndDrag(ElectricalComponent component)
        {
            if (!isDragging || draggedComponent != component) return;

            isDragging = false;
            draggedComponent = null;

            // Check for valid connection
            if (component.type == ComponentType.Cable)
            {
                AttemptConnection(component);
            }

            currentCableRenderer = null;
        }

        private void AttemptConnection(ElectricalComponent cable)
        {
            // Find nearby components to connect
            ElectricalComponent nearestComponent = FindNearestComponent(cable);
            
            if (nearestComponent != null && CanConnect(cable, nearestComponent))
            {
                MakeConnection(cable, nearestComponent);
                ValidateCircuit();
            }
            else
            {
                // Invalid connection
                ShowConnectionError(cable);
            }
        }

        private ElectricalComponent FindNearestComponent(ElectricalComponent cable)
        {
            Vector3 cablePos = cable.gameObject.transform.position;
            float nearestDistance = connectionDistance;
            ElectricalComponent nearest = null;

            // Check battery
            if (Vector3.Distance(cablePos, battery.gameObject.transform.position) < nearestDistance)
            {
                nearest = battery;
                nearestDistance = Vector3.Distance(cablePos, battery.gameObject.transform.position);
            }

            // Check switch
            if (Vector3.Distance(cablePos, switchComponent.gameObject.transform.position) < nearestDistance)
            {
                nearest = switchComponent;
                nearestDistance = Vector3.Distance(cablePos, switchComponent.gameObject.transform.position);
            }

            // Check lamp
            if (Vector3.Distance(cablePos, lamp.gameObject.transform.position) < nearestDistance)
            {
                nearest = lamp;
                nearestDistance = Vector3.Distance(cablePos, lamp.gameObject.transform.position);
            }

            return nearest;
        }

        private bool CanConnect(ElectricalComponent cable, ElectricalComponent target)
        {
            // Basic connection rules
            if (cable == target) return false;
            if (cable.isConnected && target.isConnected) return false;
            
            return true;
        }

        private void MakeConnection(ElectricalComponent cable, ElectricalComponent target)
        {
            // Connect components
            cable.isConnected = true;
            cable.connectedTo = target;
            target.isConnected = true;
            target.connectedTo = cable;

            // Update visual
            UpdateCableVisual(cable, true);

            // Play connection sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("cable_connect");
            }

            // Visual connection effect
            if (electricalSparks != null)
            {
                electricalSparks.transform.position = target.gameObject.transform.position;
                electricalSparks.Play();
            }
        }

        private void ShowConnectionError(ElectricalComponent cable)
        {
            // Visual error feedback
            UpdateCableVisual(cable, false, true);

            // Play error sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayErrorSound();
            }

            // Show error message
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Rangkaian terbuka atau salah sambung. Arus tidak mengalir.", false);
            }

            // Reset cable position after brief delay
            StartCoroutine(ResetCableAfterDelay(cable, 1f));
        }

        private System.Collections.IEnumerator ResetCableAfterDelay(ElectricalComponent cable, float delay)
        {
            yield return new WaitForSeconds(delay);
            UpdateCableVisual(cable, false);
        }

        private void UpdateCableVisual(ElectricalComponent cable, bool isConnected, bool isError = false)
        {
            LineRenderer lineRenderer = cable.gameObject.GetComponent<LineRenderer>();
            if (lineRenderer == null) return;

            if (isError)
            {
                lineRenderer.material = errorCableMaterial;
            }
            else if (isConnected && cable.connectedTo != null)
            {
                lineRenderer.material = connectedCableMaterial;
                lineRenderer.SetPosition(0, cable.gameObject.transform.position);
                lineRenderer.SetPosition(1, cable.connectedTo.gameObject.transform.position);
            }
            else
            {
                lineRenderer.material = disconnectedCableMaterial;
                lineRenderer.SetPosition(0, cable.gameObject.transform.position);
                lineRenderer.SetPosition(1, cable.gameObject.transform.position);
            }
        }

        private void ValidateCircuit()
        {
            // Check if all components are connected in correct order
            if (IsCircuitComplete() && IsCircuitCorrect())
            {
                CompletePuzzle();
            }
        }

        private bool IsCircuitComplete()
        {
            return battery.isConnected && 
                   switchComponent.isConnected && 
                   lamp.isConnected &&
                   cables.TrueForAll(c => c.isConnected);
        }

        private bool IsCircuitCorrect()
        {
            // Validate the correct circuit path: Battery(+) → Switch → Lamp → Battery(-)
            // This is a simplified validation - in a real implementation, you'd trace the actual path
            
            // For this puzzle, we'll check if:
            // 1. Battery positive is connected to switch
            // 2. Switch is connected to lamp
            // 3. Lamp is connected to battery negative
            
            return true; // Simplified for this implementation
        }

        private void CompletePuzzle()
        {
            isCompleted = true;

            // Turn on the lamp
            if (lampLight != null)
            {
                lampLight.enabled = true;
                StartCoroutine(AnimateLampTurnOn());
            }

            // Play success sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySuccessSound();
            }

            // Show success feedback
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Listrik mengalir dalam rangkaian tertutup. Saklar berfungsi untuk memutus atau menghubungkan arus listrik.", true, 5f);
            }

            // Show educational info
            ShowEducationalInfo();
        }

        private System.Collections.IEnumerator AnimateLampTurnOn()
        {
            if (lampLight == null) yield break;

            float targetIntensity = lampLight.intensity;
            lampLight.intensity = 0f;
            lampLight.enabled = true;

            float fadeTime = 1f;
            float elapsedTime = 0f;

            while (elapsedTime < fadeTime)
            {
                lampLight.intensity = Mathf.Lerp(0f, targetIntensity, elapsedTime / fadeTime);
                elapsedTime += Time.deltaTime;
                yield return null;
            }

            lampLight.intensity = targetIntensity;
        }

        private void ShowEducationalInfo()
        {
            if (UIManager.Instance != null)
            {
                string educationalContent = "RANGKAIAN LISTRIK SEDERHANA\n\n" +
                    "Listrik mengalir dalam rangkaian tertutup dari kutub positif (+) ke kutub negatif (-) baterai.\n\n" +
                    "Komponen yang diperlukan:\n" +
                    "• Sumber listrik (baterai)\n" +
                    "• Penghantar (kabel)\n" +
                    "• Beban (lampu)\n" +
                    "• Saklar (untuk mengontrol aliran)\n\n" +
                    "Saklar berfungsi untuk memutus atau menghubungkan arus listrik dalam rangkaian.";

                UIManager.Instance.ShowEducationalInfo("Pembelajaran: Rangkaian Listrik", educationalContent);
            }
        }

        // Public method to check if puzzle is completed (called by level handler)
        public bool IsPuzzleCompleted()
        {
            return isCompleted;
        }

        public void ResetPuzzleState()
        {
            ResetPuzzle();
        }
    }

    // Drag handler component for interactive objects
    public class DragHandler : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler
    {
        public System.Action onBeginDrag;
        public System.Action onDrag;
        public System.Action onEndDrag;

        public void OnBeginDrag(PointerEventData eventData)
        {
            onBeginDrag?.Invoke();
        }

        public void OnDrag(PointerEventData eventData)
        {
            onDrag?.Invoke();
        }

        public void OnEndDrag(PointerEventData eventData)
        {
            onEndDrag?.Invoke();
        }
    }
}