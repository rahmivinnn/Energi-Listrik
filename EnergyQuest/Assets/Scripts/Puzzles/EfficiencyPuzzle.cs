using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;
using EnergyQuest.Core;
using EnergyQuest.UI;
using EnergyQuest.Audio;

namespace EnergyQuest.Puzzles
{
    [System.Serializable]
    public class KitchenAppliance
    {
        [Header("Appliance Info")]
        public string applianceName;
        public ComponentType applianceType;
        public float powerConsumption; // in Watts
        public bool isEssential; // Can't be turned off
        public bool isCurrentlyOn;

        [Header("Visual Elements")]
        public GameObject applianceObject;
        public Light applianceLight;
        public Button toggleButton;
        public Text statusText;

        [Header("Efficiency Settings")]
        public float optimalUsageHours; // Hours per day for optimal usage
        public float currentUsageHours;

        public KitchenAppliance(string name, float power, bool essential = false)
        {
            applianceName = name;
            powerConsumption = power;
            isEssential = essential;
            isCurrentlyOn = essential; // Essential appliances start on
            optimalUsageHours = essential ? 24f : 2f; // Essential devices run 24/7
            currentUsageHours = 0f;
        }

        public float GetCurrentConsumption()
        {
            return isCurrentlyOn ? powerConsumption : 0f;
        }

        public float GetDailyEnergyUsage()
        {
            return EnergyCalculator.CalculateEnergyConsumption(powerConsumption, currentUsageHours);
        }

        public bool IsUsageOptimal()
        {
            if (isEssential) return isCurrentlyOn;
            return currentUsageHours <= optimalUsageHours;
        }
    }

    public class EfficiencyPuzzle : MonoBehaviour
    {
        [Header("Puzzle Configuration")]
        public float targetEfficiency = 0.7f; // 70% efficiency target
        public float maxAllowedConsumption = 2000f; // Watts
        public bool isCompleted = false;

        [Header("Kitchen Appliances")]
        public List<KitchenAppliance> appliances = new List<KitchenAppliance>();

        [Header("Environmental Controls")]
        public Button lightSwitchButton;
        public Button windowButton;
        public Slider fridgeDoorSlider;
        public bool isWindowOpen = false;
        public bool isLightOn = true;
        public float fridgeDoorOpenTime = 0f;

        [Header("Visual Elements")]
        public Light kitchenLight;
        public Light naturalLight;
        public GameObject windowObject;
        public GameObject fridgeObject;
        public ParticleSystem steamEffect; // For cooking appliances

        [Header("Feedback")]
        public float currentEfficiency = 0.5f;
        public float currentTotalConsumption = 0f;

        private float fridgeDoorTimer = 0f;
        private bool fridgeDoorOpen = false;
        private const float maxFridgeDoorOpenTime = 10f; // Seconds before efficiency drops

        private void Start()
        {
            SetupKitchenAppliances();
            SetupEnvironmentalControls();
            CalculateInitialEfficiency();
        }

        private void Update()
        {
            UpdateFridgeDoorTimer();
            UpdateEfficiency();
            UpdateVisualFeedback();
        }

        private void SetupKitchenAppliances()
        {
            // Initialize common kitchen appliances
            appliances.Clear();
            
            appliances.Add(new KitchenAppliance("Kulkas", 150f, true)); // Essential
            appliances.Add(new KitchenAppliance("Rice Cooker", 400f, false));
            appliances.Add(new KitchenAppliance("Microwave", 800f, false));
            appliances.Add(new KitchenAppliance("Blender", 300f, false));
            appliances.Add(new KitchenAppliance("Kipas Angin", 75f, false));
            appliances.Add(new KitchenAppliance("Setrika", 1000f, false));

            // Setup button listeners for each appliance
            for (int i = 0; i < appliances.Count; i++)
            {
                int index = i; // Capture for closure
                var appliance = appliances[i];
                
                if (appliance.toggleButton != null)
                {
                    appliance.toggleButton.onClick.AddListener(() => ToggleAppliance(index));
                }
            }
        }

        private void SetupEnvironmentalControls()
        {
            // Light switch
            if (lightSwitchButton != null)
            {
                lightSwitchButton.onClick.AddListener(ToggleKitchenLight);
            }

            // Window control
            if (windowButton != null)
            {
                windowButton.onClick.AddListener(ToggleWindow);
            }

            // Fridge door slider
            if (fridgeDoorSlider != null)
            {
                fridgeDoorSlider.onValueChanged.AddListener(OnFridgeDoorChanged);
            }
        }

        private void CalculateInitialEfficiency()
        {
            UpdateEfficiency();
        }

        public void ToggleAppliance(int applianceIndex)
        {
            if (applianceIndex < 0 || applianceIndex >= appliances.Count) return;

            var appliance = appliances[applianceIndex];

            // Can't turn off essential appliances
            if (appliance.isEssential && appliance.isCurrentlyOn)
            {
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowFeedback($"{appliance.applianceName} tidak bisa dimatikan karena penting untuk dapur.", false);
                }
                return;
            }

            // Toggle appliance state
            appliance.isCurrentlyOn = !appliance.isCurrentlyOn;

            // Update usage hours based on state
            if (appliance.isCurrentlyOn)
            {
                appliance.currentUsageHours = appliance.optimalUsageHours;
            }
            else
            {
                appliance.currentUsageHours = 0f;
            }

            // Update visual state
            UpdateApplianceVisual(appliance);

            // Play sound
            if (AudioManager.Instance != null)
            {
                string soundName = appliance.isCurrentlyOn ? "appliance_on" : "appliance_off";
                AudioManager.Instance.PlaySFX(soundName);
            }

            // Show feedback based on efficiency
            ShowApplianceEfficiencyFeedback(appliance);
        }

        private void UpdateApplianceVisual(KitchenAppliance appliance)
        {
            // Update appliance light
            if (appliance.applianceLight != null)
            {
                appliance.applianceLight.enabled = appliance.isCurrentlyOn;
            }

            // Update status text
            if (appliance.statusText != null)
            {
                appliance.statusText.text = appliance.isCurrentlyOn ? "ON" : "OFF";
                appliance.statusText.color = appliance.isCurrentlyOn ? Color.green : Color.red;
            }

            // Update button appearance
            if (appliance.toggleButton != null)
            {
                var buttonColors = appliance.toggleButton.colors;
                buttonColors.normalColor = appliance.isCurrentlyOn ? Color.green : Color.gray;
                appliance.toggleButton.colors = buttonColors;
            }

            // Special effects for certain appliances
            if (appliance.applianceName == "Rice Cooker" && appliance.isCurrentlyOn)
            {
                if (steamEffect != null)
                {
                    steamEffect.transform.position = appliance.applianceObject.transform.position + Vector3.up;
                    steamEffect.Play();
                }
            }
        }

        private void ShowApplianceEfficiencyFeedback(KitchenAppliance appliance)
        {
            string message = "";
            bool isEfficient = false;

            if (appliance.isCurrentlyOn)
            {
                if (appliance.IsUsageOptimal())
                {
                    message = $"{appliance.applianceName} dinyalakan dengan efisien.";
                    isEfficient = true;
                }
                else
                {
                    message = $"{appliance.applianceName} mengonsumsi banyak energi. Gunakan seperlunya.";
                    isEfficient = false;
                }
            }
            else
            {
                message = $"{appliance.applianceName} dimatikan untuk menghemat energi.";
                isEfficient = true;
            }

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback(message, isEfficient, 2f);
            }
        }

        public void ToggleKitchenLight()
        {
            isLightOn = !isLightOn;

            if (kitchenLight != null)
            {
                kitchenLight.enabled = isLightOn;
            }

            // Efficiency feedback
            if (isWindowOpen && !isLightOn)
            {
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowFeedback("Bagus! Menggunakan cahaya alami menghemat energi listrik.", true);
                }
            }
            else if (!isWindowOpen && isLightOn)
            {
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowFeedback("Lampu menyala. Pertimbangkan untuk membuka jendela di siang hari.", false);
                }
            }

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("light_switch");
            }
        }

        public void ToggleWindow()
        {
            isWindowOpen = !isWindowOpen;

            // Update natural light
            if (naturalLight != null)
            {
                naturalLight.enabled = isWindowOpen;
            }

            // Update window visual
            if (windowObject != null)
            {
                var windowRenderer = windowObject.GetComponent<Renderer>();
                if (windowRenderer != null)
                {
                    windowRenderer.material.color = isWindowOpen ? Color.white : new Color(0.5f, 0.5f, 0.8f);
                }
            }

            // Efficiency feedback
            if (isWindowOpen)
            {
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowFeedback("Jendela dibuka! Cahaya alami masuk, bisa matikan lampu.", true);
                }
            }

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("window_open");
            }
        }

        private void OnFridgeDoorChanged(float value)
        {
            fridgeDoorOpen = value > 0.1f;
            
            if (fridgeDoorOpen)
            {
                fridgeDoorTimer += Time.deltaTime;
            }
            else
            {
                fridgeDoorTimer = 0f;
                
                // Feedback for closing fridge quickly
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowFeedback("Menutup kulkas dengan cepat menghemat energi.", true, 2f);
                }
            }

            // Update fridge door visual
            if (fridgeObject != null)
            {
                var fridgeDoor = fridgeObject.transform.Find("Door");
                if (fridgeDoor != null)
                {
                    Vector3 doorRotation = fridgeDoor.eulerAngles;
                    doorRotation.y = value * 90f; // 0-90 degree rotation
                    fridgeDoor.eulerAngles = doorRotation;
                }
            }
        }

        private void UpdateFridgeDoorTimer()
        {
            if (fridgeDoorOpen)
            {
                fridgeDoorTimer += Time.deltaTime;
                
                // Warning if door is open too long
                if (fridgeDoorTimer > maxFridgeDoorOpenTime)
                {
                    if (UIManager.Instance != null)
                    {
                        UIManager.Instance.ShowFeedback("Pintu kulkas terlalu lama terbuka! Energi terbuang.", false, 1f);
                    }
                }
            }
        }

        private void UpdateEfficiency()
        {
            // Calculate total power consumption
            currentTotalConsumption = 0f;
            float optimalConsumption = 0f;

            foreach (var appliance in appliances)
            {
                currentTotalConsumption += appliance.GetCurrentConsumption();
                
                if (appliance.isEssential)
                {
                    optimalConsumption += appliance.powerConsumption;
                }
                else if (appliance.IsUsageOptimal())
                {
                    optimalConsumption += appliance.powerConsumption * 0.5f; // Optimal usage factor
                }
            }

            // Add environmental factors
            if (isLightOn && isWindowOpen)
            {
                // Penalty for using artificial light when natural light is available
                currentTotalConsumption += 60f; // 60W penalty
            }

            if (fridgeDoorOpen && fridgeDoorTimer > 5f)
            {
                // Penalty for keeping fridge door open
                currentTotalConsumption += 100f * (fridgeDoorTimer / maxFridgeDoorOpenTime);
            }

            // Calculate efficiency percentage
            currentEfficiency = EnergyCalculator.CalculateEfficiencyPercentage(currentTotalConsumption, optimalConsumption);

            // Clamp efficiency between 0 and 1 for UI
            currentEfficiency = Mathf.Clamp01(currentEfficiency / 100f);

            // Update UI
            if (UIManager.Instance != null)
            {
                UIManager.Instance.UpdatePowerMeter(currentEfficiency);
            }

            // Check for puzzle completion
            if (!isCompleted && currentEfficiency >= targetEfficiency && IsOptimalConfiguration())
            {
                CompletePuzzle();
            }
        }

        private bool IsOptimalConfiguration()
        {
            // Check if configuration meets optimal criteria
            bool windowOptimal = isWindowOpen && !isLightOn; // Using natural light
            bool fridgeOptimal = !fridgeDoorOpen || fridgeDoorTimer < 3f; // Fridge door closed or quickly used
            bool appliancesOptimal = true;

            // Check non-essential appliances are used optimally
            foreach (var appliance in appliances)
            {
                if (!appliance.isEssential && appliance.isCurrentlyOn && !appliance.IsUsageOptimal())
                {
                    appliancesOptimal = false;
                    break;
                }
            }

            return windowOptimal && fridgeOptimal && appliancesOptimal;
        }

        private void UpdateVisualFeedback()
        {
            // Update overall kitchen lighting based on efficiency
            Color efficiencyColor = EnergyCalculator.GetEfficiencyColor(currentTotalConsumption * 0.1f);
            
            // Update kitchen ambient light color
            if (kitchenLight != null)
            {
                kitchenLight.color = Color.Lerp(Color.red, Color.green, currentEfficiency);
            }
        }

        private void CompletePuzzle()
        {
            isCompleted = true;

            // Play success sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySuccessSound();
            }

            // Show completion feedback
            if (UIManager.Instance != null)
            {
                string completionMessage = $"Efisiensi tercapai! Konsumsi: {currentTotalConsumption:F0}W, Efisiensi: {(currentEfficiency * 100):F0}%";
                UIManager.Instance.ShowFeedback(completionMessage, true, 5f);
            }

            // Play radio message
            StartCoroutine(PlayRadioMessage());

            // Award energy key
            if (GameManager.Instance != null)
            {
                GameManager.Instance.CollectEnergyKey(1); // Second energy key
            }
        }

        private IEnumerator PlayRadioMessage()
        {
            yield return new WaitForSeconds(2f);

            // Play radio static first
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("radio_static");
            }

            yield return new WaitForSeconds(1f);

            // Play scientist message through radio
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayNarration("scientist_radio_message");
            }

            // Show radio message text
            if (UIManager.Instance != null)
            {
                string radioMessage = "Efisiensi adalah kunci. Jangan boros, karena energi terbatas. " +
                                    "Kamu telah memahami pentingnya menghemat energi. Lanjutkan ke laboratorium.";
                
                UIManager.Instance.ShowEducationalInfo("Pesan Radio dari Ilmuwan", radioMessage);
            }
        }

        // Efficiency tips and educational content
        public void ShowEfficiencyTips()
        {
            string tips = "TIPS HEMAT ENERGI DI DAPUR:\n\n" +
                         "1. Manfaatkan cahaya alami dengan membuka jendela\n" +
                         "2. Matikan lampu saat cahaya alami cukup\n" +
                         "3. Tutup pintu kulkas dengan cepat\n" +
                         "4. Gunakan peralatan listrik seperlunya\n" +
                         "5. Matikan peralatan yang tidak digunakan\n" +
                         "6. Gunakan mode hemat energi pada rice cooker\n\n" +
                         "Setiap tindakan kecil berkontribusi pada penghematan energi!";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Tips Hemat Energi", tips);
            }
        }

        // Button event handlers
        private void ToggleAppliance(int index)
        {
            if (index >= 0 && index < appliances.Count)
            {
                var appliance = appliances[index];
                
                if (appliance.isEssential && appliance.isCurrentlyOn)
                {
                    // Show why essential appliances can't be turned off
                    if (UIManager.Instance != null)
                    {
                        UIManager.Instance.ShowFeedback($"{appliance.applianceName} harus tetap menyala untuk menjaga kesegaran makanan.", false);
                    }
                    return;
                }

                appliance.isCurrentlyOn = !appliance.isCurrentlyOn;
                UpdateApplianceVisual(appliance);
                
                // Educational feedback
                ShowApplianceEducationalFeedback(appliance);
            }
        }

        private void UpdateApplianceVisual(KitchenAppliance appliance)
        {
            // Update appliance object visual
            if (appliance.applianceObject != null)
            {
                var renderer = appliance.applianceObject.GetComponent<Renderer>();
                if (renderer != null)
                {
                    renderer.material.color = appliance.isCurrentlyOn ? Color.white : Color.gray;
                }
            }

            // Update light
            if (appliance.applianceLight != null)
            {
                appliance.applianceLight.enabled = appliance.isCurrentlyOn;
            }

            // Update status text
            if (appliance.statusText != null)
            {
                appliance.statusText.text = appliance.isCurrentlyOn ? "MENYALA" : "MATI";
                appliance.statusText.color = appliance.isCurrentlyOn ? Color.green : Color.red;
            }
        }

        private void ShowApplianceEducationalFeedback(KitchenAppliance appliance)
        {
            string message = "";
            bool isEfficient = false;

            switch (appliance.applianceName)
            {
                case "Rice Cooker":
                    if (appliance.isCurrentlyOn)
                    {
                        message = "Rice cooker menyala. Gunakan mode hemat energi jika tersedia.";
                        isEfficient = true;
                    }
                    else
                    {
                        message = "Rice cooker dimatikan untuk menghemat energi.";
                        isEfficient = true;
                    }
                    break;

                case "Setrika":
                    if (appliance.isCurrentlyOn)
                    {
                        message = "Setrika mengonsumsi energi tinggi (1000W). Gunakan seperlunya.";
                        isEfficient = false;
                    }
                    else
                    {
                        message = "Setrika dimatikan. Hemat energi yang baik!";
                        isEfficient = true;
                    }
                    break;

                case "Kipas Angin":
                    if (appliance.isCurrentlyOn)
                    {
                        message = "Kipas angin hemat energi (75W). Alternatif yang baik untuk AC.";
                        isEfficient = true;
                    }
                    break;

                case "Microwave":
                    if (appliance.isCurrentlyOn)
                    {
                        message = "Microwave konsumsi tinggi (800W). Matikan setelah digunakan.";
                        isEfficient = false;
                    }
                    else
                    {
                        message = "Microwave dimatikan. Hemat energi!";
                        isEfficient = true;
                    }
                    break;

                default:
                    message = $"{appliance.applianceName} {(appliance.isCurrentlyOn ? "menyala" : "mati")}.";
                    isEfficient = !appliance.isCurrentlyOn || appliance.IsUsageOptimal();
                    break;
            }

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback(message, isEfficient, 2f);
            }
        }

        public bool IsPuzzleCompleted()
        {
            return isCompleted;
        }

        public void ResetPuzzleState()
        {
            isCompleted = false;
            currentEfficiency = 0.5f;
            
            // Reset all appliances to initial state
            foreach (var appliance in appliances)
            {
                appliance.isCurrentlyOn = appliance.isEssential;
                appliance.currentUsageHours = appliance.isEssential ? appliance.optimalUsageHours : 0f;
                UpdateApplianceVisual(appliance);
            }

            // Reset environmental controls
            isWindowOpen = false;
            isLightOn = true;
            fridgeDoorTimer = 0f;
            fridgeDoorOpen = false;

            CalculateInitialEfficiency();
        }

        private void OnDestroy()
        {
            // Remove all button listeners
            foreach (var appliance in appliances)
            {
                if (appliance.toggleButton != null)
                    appliance.toggleButton.onClick.RemoveAllListeners();
            }

            if (lightSwitchButton != null)
                lightSwitchButton.onClick.RemoveAllListeners();

            if (windowButton != null)
                windowButton.onClick.RemoveAllListeners();

            if (fridgeDoorSlider != null)
                fridgeDoorSlider.onValueChanged.RemoveAllListeners();
        }
    }
}