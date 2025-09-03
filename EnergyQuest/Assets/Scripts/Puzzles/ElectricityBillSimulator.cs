using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using System.Collections;
using EnergyQuest.Core;
using EnergyQuest.UI;
using EnergyQuest.Audio;

namespace EnergyQuest.Puzzles
{
    [System.Serializable]
    public class HouseAppliance
    {
        [Header("Appliance Configuration")]
        public string name;
        public float powerWatts;
        public float defaultHoursPerDay;
        public bool isEssential;
        public bool isCurrentlyEnabled;

        [Header("UI Elements")]
        public GameObject applianceObject;
        public Button toggleButton;
        public Slider usageSlider; // Hours per day
        public Text nameText;
        public Text powerText;
        public Text consumptionText;
        public Text statusText;

        [Header("Visual Feedback")]
        public Light indicatorLight;
        public Material onMaterial;
        public Material offMaterial;

        public HouseAppliance(string applianceName, float power, float defaultHours, bool essential = false)
        {
            name = applianceName;
            powerWatts = power;
            defaultHoursPerDay = defaultHours;
            isEssential = essential;
            isCurrentlyEnabled = essential;
        }

        public float GetDailyConsumption()
        {
            if (!isCurrentlyEnabled) return 0f;
            float actualHours = usageSlider != null ? usageSlider.value : defaultHoursPerDay;
            return EnergyCalculator.CalculateEnergyConsumption(powerWatts, actualHours);
        }

        public float GetMonthlyConsumption()
        {
            return GetDailyConsumption() * 30f;
        }

        public float GetMonthlyCost()
        {
            return EnergyCalculator.CalculateMonthlyBill(GetMonthlyConsumption());
        }

        public void UpdateVisualState()
        {
            // Update object material
            if (applianceObject != null)
            {
                var renderer = applianceObject.GetComponent<Renderer>();
                if (renderer != null)
                {
                    renderer.material = isCurrentlyEnabled ? onMaterial : offMaterial;
                }
            }

            // Update indicator light
            if (indicatorLight != null)
            {
                indicatorLight.enabled = isCurrentlyEnabled;
                indicatorLight.color = isCurrentlyEnabled ? Color.green : Color.red;
            }

            // Update UI texts
            if (nameText != null)
                nameText.text = name;

            if (powerText != null)
                powerText.text = $"{powerWatts}W";

            if (statusText != null)
            {
                statusText.text = isCurrentlyEnabled ? "MENYALA" : "MATI";
                statusText.color = isCurrentlyEnabled ? Color.green : Color.red;
            }

            if (consumptionText != null)
            {
                float dailyKwh = GetDailyConsumption();
                consumptionText.text = $"{dailyKwh:F2} kWh/hari";
            }

            // Update slider interactability
            if (usageSlider != null)
            {
                usageSlider.interactable = isCurrentlyEnabled;
                usageSlider.value = isCurrentlyEnabled ? defaultHoursPerDay : 0f;
            }
        }
    }

    public class ElectricityBillSimulator : MonoBehaviour
    {
        [Header("Simulator Configuration")]
        public float targetMonthlyBill = 300000f; // Rp 300,000 target
        public float maxAllowedBill = 500000f; // Rp 500,000 maximum
        public bool isCompleted = false;

        [Header("House Appliances")]
        public List<HouseAppliance> houseAppliances = new List<HouseAppliance>();

        [Header("Simulator Display")]
        public Text totalConsumptionText;
        public Text monthlyBillText;
        public Text efficiencyRatingText;
        public Slider billMeter;
        public Image billMeterFill;

        [Header("Control Panel")]
        public Button calculateButton;
        public Button resetButton;
        public Button optimizeButton;

        [Header("Results Panel")]
        public GameObject resultsPanel;
        public Text resultsTitle;
        public Text resultsContent;
        public Button resultsCloseButton;

        [Header("Educational Info")]
        public GameObject formulaPanel;
        public Text formulaText;
        public Button showFormulaButton;

        private float currentMonthlyBill = 0f;
        private float currentTotalKwh = 0f;
        private bool simulationRunning = false;

        private void Start()
        {
            SetupHouseAppliances();
            SetupUIElements();
            InitializeSimulator();
        }

        private void SetupHouseAppliances()
        {
            // Initialize realistic house appliances
            houseAppliances.Clear();

            houseAppliances.Add(new HouseAppliance("Kulkas", 150f, 24f, true)); // Essential - always on
            houseAppliances.Add(new HouseAppliance("Lampu Ruang Tamu", 60f, 8f));
            houseAppliances.Add(new HouseAppliance("Lampu Kamar", 40f, 6f));
            houseAppliances.Add(new HouseAppliance("AC Ruang Tamu", 1500f, 8f));
            houseAppliances.Add(new HouseAppliance("TV", 200f, 6f));
            houseAppliances.Add(new HouseAppliance("Rice Cooker", 400f, 2f));
            houseAppliances.Add(new HouseAppliance("Setrika", 1000f, 1f));
            houseAppliances.Add(new HouseAppliance("Kipas Angin", 75f, 10f));
            houseAppliances.Add(new HouseAppliance("Microwave", 800f, 0.5f));
            houseAppliances.Add(new HouseAppliance("Charger HP", 20f, 4f));

            // Setup button listeners for each appliance
            for (int i = 0; i < houseAppliances.Count; i++)
            {
                int index = i; // Capture for closure
                var appliance = houseAppliances[i];

                if (appliance.toggleButton != null)
                {
                    appliance.toggleButton.onClick.AddListener(() => ToggleAppliance(index));
                }

                if (appliance.usageSlider != null)
                {
                    appliance.usageSlider.onValueChanged.AddListener((value) => OnUsageSliderChanged(index, value));
                }

                // Initialize visual state
                appliance.UpdateVisualState();
            }
        }

        private void SetupUIElements()
        {
            // Setup main control buttons
            if (calculateButton != null)
                calculateButton.onClick.AddListener(CalculateBill);

            if (resetButton != null)
                resetButton.onClick.AddListener(ResetSimulator);

            if (optimizeButton != null)
                optimizeButton.onClick.AddListener(ShowOptimizationSuggestions);

            if (showFormulaButton != null)
                showFormulaButton.onClick.AddListener(ShowEnergyFormula);

            if (resultsCloseButton != null)
                resultsCloseButton.onClick.AddListener(CloseResultsPanel);

            // Initialize bill meter
            if (billMeter != null)
            {
                billMeter.minValue = 0f;
                billMeter.maxValue = maxAllowedBill;
                billMeter.value = 0f;
            }

            // Hide panels initially
            if (resultsPanel != null)
                resultsPanel.SetActive(false);

            if (formulaPanel != null)
                formulaPanel.SetActive(false);
        }

        private void InitializeSimulator()
        {
            // Calculate initial bill with default settings
            CalculateBill();
        }

        public void ToggleAppliance(int applianceIndex)
        {
            if (applianceIndex < 0 || applianceIndex >= houseAppliances.Count) return;

            var appliance = houseAppliances[applianceIndex];

            // Can't turn off essential appliances
            if (appliance.isEssential && appliance.isCurrentlyEnabled)
            {
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowFeedback($"{appliance.name} tidak bisa dimatikan - peralatan penting!", false);
                }

                if (AudioManager.Instance != null)
                {
                    AudioManager.Instance.PlayErrorSound();
                }
                return;
            }

            // Toggle state
            appliance.isCurrentlyEnabled = !appliance.isCurrentlyEnabled;
            appliance.UpdateVisualState();

            // Play sound
            if (AudioManager.Instance != null)
            {
                string soundName = appliance.isCurrentlyEnabled ? "appliance_on" : "appliance_off";
                AudioManager.Instance.PlaySFX(soundName);
            }

            // Recalculate immediately
            CalculateBill();

            // Show educational feedback
            ShowApplianceEfficiencyFeedback(appliance);
        }

        private void OnUsageSliderChanged(int applianceIndex, float hours)
        {
            if (applianceIndex < 0 || applianceIndex >= houseAppliances.Count) return;

            var appliance = houseAppliances[applianceIndex];
            appliance.defaultHoursPerDay = hours;

            // Update consumption text
            appliance.UpdateVisualState();

            // Recalculate bill
            CalculateBill();
        }

        public void CalculateBill()
        {
            if (simulationRunning) return;

            StartCoroutine(SimulateBillCalculation());
        }

        private IEnumerator SimulateBillCalculation()
        {
            simulationRunning = true;

            // Show calculation progress
            if (UIManager.Instance != null)
            {
                UIManager.Instance.UpdateProgress(0f, "Menghitung konsumsi energi...");
            }

            currentTotalKwh = 0f;
            
            // Calculate each appliance consumption with visual feedback
            for (int i = 0; i < houseAppliances.Count; i++)
            {
                var appliance = houseAppliances[i];
                float applianceKwh = appliance.GetMonthlyConsumption();
                currentTotalKwh += applianceKwh;

                // Show progress
                float progress = (float)(i + 1) / houseAppliances.Count;
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.UpdateProgress(progress, $"Menghitung {appliance.name}...");
                }

                yield return new WaitForSeconds(0.3f); // Simulate calculation time
            }

            // Calculate monthly bill
            currentMonthlyBill = EnergyCalculator.CalculateMonthlyBill(currentTotalKwh);

            // Hide progress
            if (UIManager.Instance != null)
            {
                UIManager.Instance.HideProgress();
            }

            // Update display
            UpdateBillDisplay();

            // Check for completion
            CheckSimulatorCompletion();

            simulationRunning = false;
        }

        private void UpdateBillDisplay()
        {
            // Update total consumption text
            if (totalConsumptionText != null)
            {
                totalConsumptionText.text = EnergyCalculator.FormatEnergy(currentTotalKwh);
            }

            // Update monthly bill text
            if (monthlyBillText != null)
            {
                monthlyBillText.text = EnergyCalculator.FormatCurrency(currentMonthlyBill);
            }

            // Update efficiency rating
            if (efficiencyRatingText != null)
            {
                string rating = EnergyCalculator.GetEfficiencyRating(currentMonthlyBill);
                efficiencyRatingText.text = rating;
                efficiencyRatingText.color = EnergyCalculator.GetEfficiencyColor(currentMonthlyBill);
            }

            // Update bill meter
            if (billMeter != null)
            {
                billMeter.value = currentMonthlyBill;
                
                if (billMeterFill != null)
                {
                    billMeterFill.color = EnergyCalculator.GetEfficiencyColor(currentMonthlyBill);
                }
            }

            // Play calculation complete sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("calculation_complete");
            }
        }

        private void CheckSimulatorCompletion()
        {
            if (currentMonthlyBill <= targetMonthlyBill && !isCompleted)
            {
                CompleteSimulator();
            }
            else if (currentMonthlyBill > targetMonthlyBill)
            {
                ShowBillTooHighFeedback();
            }
        }

        private void ShowBillTooHighFeedback()
        {
            float excess = currentMonthlyBill - targetMonthlyBill;
            string message = $"Tagihan terlalu tinggi! Kelebihan: {EnergyCalculator.FormatCurrency(excess)}. Coba matikan perangkat yang tidak perlu.";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback(message, false, 4f);
            }

            // Suggest optimization
            ShowOptimizationSuggestions();
        }

        private void CompleteSimulator()
        {
            isCompleted = true;

            // Play success sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySuccessSound();
            }

            // Show completion message
            if (UIManager.Instance != null)
            {
                string message = $"Simulator berhasil! Tagihan: {EnergyCalculator.FormatCurrency(currentMonthlyBill)} ≤ Target: {EnergyCalculator.FormatCurrency(targetMonthlyBill)}";
                UIManager.Instance.ShowFeedback(message, true, 5f);
            }

            // Award energy key
            if (GameManager.Instance != null)
            {
                GameManager.Instance.CollectEnergyKey(2); // Third energy key
            }

            // Show blueprint and secret door
            StartCoroutine(ShowBlueprintAndSecretDoor());
        }

        private IEnumerator ShowBlueprintAndSecretDoor()
        {
            yield return new WaitForSeconds(3f);

            // Show scientist's blueprint
            string blueprintMessage = "Kamu menemukan blueprint alat rahasia ilmuwan!\n\n" +
                                    "BLUEPRINT: ENERGY EFFICIENCY ANALYZER\n" +
                                    "Alat ini dapat menganalisis efisiensi energi rumah secara otomatis.\n\n" +
                                    "Dengan menyelesaikan simulator ini, kamu telah memahami:\n" +
                                    "• Formula perhitungan energi: E = (P × t) / 1000\n" +
                                    "• Pengaruh daya dan waktu pemakaian terhadap tagihan\n" +
                                    "• Strategi penghematan energi yang efektif";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Blueprint Ditemukan!", blueprintMessage);
            }

            // Play blueprint found sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("blueprint_found");
            }

            yield return new WaitForSeconds(5f);

            // Show secret door opening
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Pintu rahasia ke ruang bawah tanah terbuka!", true, 4f);
            }
        }

        public void ResetSimulator()
        {
            // Reset all appliances to default state
            foreach (var appliance in houseAppliances)
            {
                appliance.isCurrentlyEnabled = appliance.isEssential;
                appliance.defaultHoursPerDay = appliance.isEssential ? 24f : 2f;
                
                if (appliance.usageSlider != null)
                {
                    appliance.usageSlider.value = appliance.defaultHoursPerDay;
                }

                appliance.UpdateVisualState();
            }

            isCompleted = false;
            CalculateBill();

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("reset");
            }
        }

        public void ShowOptimizationSuggestions()
        {
            if (resultsPanel == null) return;

            List<string> suggestions = new List<string>();

            // Analyze each appliance and provide suggestions
            foreach (var appliance in houseAppliances)
            {
                if (appliance.isCurrentlyEnabled && !appliance.isEssential)
                {
                    if (appliance.powerWatts > 500f) // High power devices
                    {
                        suggestions.Add($"• {appliance.name} ({appliance.powerWatts}W) - Pertimbangkan untuk mengurangi waktu pemakaian");
                    }
                    
                    float hours = appliance.usageSlider != null ? appliance.usageSlider.value : appliance.defaultHoursPerDay;
                    if (hours > 8f && appliance.powerWatts > 100f)
                    {
                        suggestions.Add($"• {appliance.name} - Kurangi pemakaian dari {hours:F1} jam/hari");
                    }
                }
            }

            // General suggestions
            if (currentMonthlyBill > targetMonthlyBill)
            {
                suggestions.Add("• Matikan perangkat yang tidak sedang digunakan");
                suggestions.Add("• Gunakan perangkat hemat energi");
                suggestions.Add("• Manfaatkan cahaya alami di siang hari");
            }

            string suggestionsText = "SARAN OPTIMASI ENERGI:\n\n" + string.Join("\n", suggestions);

            if (suggestions.Count == 0)
            {
                suggestionsText = "KONFIGURASI SUDAH OPTIMAL!\n\nPenggunaan energi kamu sudah sangat efisien. Pertahankan kebiasaan hemat energi ini!";
            }

            ShowResultsPanel("Optimasi Energi", suggestionsText);
        }

        public void ShowEnergyFormula()
        {
            if (formulaPanel == null) return;

            formulaPanel.SetActive(true);

            string formulaContent = "RUMUS PERHITUNGAN ENERGI LISTRIK:\n\n" +
                                  "E = (P × t) / 1000\n\n" +
                                  "Dimana:\n" +
                                  "E = Energi (kWh)\n" +
                                  "P = Daya perangkat (Watt)\n" +
                                  "t = Waktu pemakaian (jam)\n\n" +
                                  "CONTOH PERHITUNGAN:\n" +
                                  "Lampu 60W menyala 8 jam/hari:\n" +
                                  "E = (60 × 8) / 1000 = 0,48 kWh/hari\n" +
                                  "E bulanan = 0,48 × 30 = 14,4 kWh\n" +
                                  "Biaya = 14,4 × Rp1.467 = Rp21.125\n\n" +
                                  "TIPS: Kurangi P (gunakan perangkat hemat energi) atau kurangi t (matikan saat tidak digunakan)";

            if (formulaText != null)
            {
                formulaText.text = formulaContent;
            }

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("formula_show");
            }
        }

        private void ShowResultsPanel(string title, string content)
        {
            if (resultsPanel == null) return;

            resultsPanel.SetActive(true);

            if (resultsTitle != null)
                resultsTitle.text = title;

            if (resultsContent != null)
                resultsContent.text = content;

            // Pause time while showing results
            Time.timeScale = 0f;
        }

        public void CloseResultsPanel()
        {
            if (resultsPanel != null)
                resultsPanel.SetActive(false);

            if (formulaPanel != null)
                formulaPanel.SetActive(false);

            // Resume time
            Time.timeScale = 1f;

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("button_click");
            }
        }

        private void ShowApplianceEfficiencyFeedback(HouseAppliance appliance)
        {
            string message = "";
            bool isEfficient = false;

            float monthlyCost = appliance.GetMonthlyCost();

            if (appliance.isCurrentlyEnabled)
            {
                if (appliance.powerWatts > 1000f)
                {
                    message = $"{appliance.name} konsumsi tinggi ({appliance.powerWatts}W). Biaya bulanan: {EnergyCalculator.FormatCurrency(monthlyCost)}";
                    isEfficient = false;
                }
                else if (appliance.powerWatts < 100f)
                {
                    message = $"{appliance.name} hemat energi ({appliance.powerWatts}W). Biaya bulanan: {EnergyCalculator.FormatCurrency(monthlyCost)}";
                    isEfficient = true;
                }
                else
                {
                    message = $"{appliance.name} konsumsi sedang ({appliance.powerWatts}W). Biaya bulanan: {EnergyCalculator.FormatCurrency(monthlyCost)}";
                    isEfficient = true;
                }
            }
            else
            {
                message = $"{appliance.name} dimatikan. Penghematan bulanan: {EnergyCalculator.FormatCurrency(monthlyCost)}";
                isEfficient = true;
            }

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback(message, isEfficient, 3f);
            }
        }

        // Public methods for level handler
        public bool IsPuzzleCompleted()
        {
            return isCompleted;
        }

        public void ResetPuzzleState()
        {
            ResetSimulator();
        }

        public float GetCurrentBill()
        {
            return currentMonthlyBill;
        }

        public float GetTargetBill()
        {
            return targetMonthlyBill;
        }

        public string GetEfficiencyReport()
        {
            float efficiency = EnergyCalculator.CalculateEfficiencyPercentage(currentMonthlyBill, targetMonthlyBill);
            string rating = EnergyCalculator.GetEfficiencyRating(currentMonthlyBill);
            
            return $"Konsumsi: {EnergyCalculator.FormatEnergy(currentTotalKwh)}\n" +
                   $"Tagihan: {EnergyCalculator.FormatCurrency(currentMonthlyBill)}\n" +
                   $"Rating: {rating}\n" +
                   $"Efisiensi: {efficiency:F1}%";
        }

        private void OnDestroy()
        {
            // Remove all listeners
            foreach (var appliance in houseAppliances)
            {
                if (appliance.toggleButton != null)
                    appliance.toggleButton.onClick.RemoveAllListeners();

                if (appliance.usageSlider != null)
                    appliance.usageSlider.onValueChanged.RemoveAllListeners();
            }

            if (calculateButton != null) calculateButton.onClick.RemoveAllListeners();
            if (resetButton != null) resetButton.onClick.RemoveAllListeners();
            if (optimizeButton != null) optimizeButton.onClick.RemoveAllListeners();
            if (showFormulaButton != null) showFormulaButton.onClick.RemoveAllListeners();
            if (resultsCloseButton != null) resultsCloseButton.onClick.RemoveAllListeners();
        }
    }
}