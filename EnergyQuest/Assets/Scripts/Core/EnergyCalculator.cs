using UnityEngine;

namespace EnergyQuest.Core
{
    [System.Serializable]
    public class ElectricalDevice
    {
        [Header("Device Information")]
        public string deviceName;
        public float powerWatts;
        public bool isOn;
        public float hoursUsedPerDay;

        [Header("Visual Representation")]
        public GameObject deviceObject;
        public Material onMaterial;
        public Material offMaterial;

        public ElectricalDevice(string name, float power)
        {
            deviceName = name;
            powerWatts = power;
            isOn = false;
            hoursUsedPerDay = 0f;
        }

        public float GetDailyEnergyConsumption()
        {
            if (!isOn) return 0f;
            return (powerWatts * hoursUsedPerDay) / 1000f; // Convert to kWh
        }

        public float GetMonthlyEnergyConsumption()
        {
            return GetDailyEnergyConsumption() * 30f; // Approximate monthly usage
        }

        public void ToggleDevice()
        {
            isOn = !isOn;
            UpdateVisualState();
        }

        public void SetDeviceState(bool state)
        {
            isOn = state;
            UpdateVisualState();
        }

        private void UpdateVisualState()
        {
            if (deviceObject != null)
            {
                var renderer = deviceObject.GetComponent<Renderer>();
                if (renderer != null)
                {
                    renderer.material = isOn ? onMaterial : offMaterial;
                }

                // Add glow effect for devices that are on
                var light = deviceObject.GetComponent<Light>();
                if (light != null)
                {
                    light.enabled = isOn;
                }
            }
        }
    }

    public static class EnergyCalculator
    {
        // Indonesian electricity tariff (approximate)
        private const float TARIFF_PER_KWH = 1467.28f; // Rupiah per kWh (tariff R1/900VA)

        /// <summary>
        /// Calculate energy consumption using the formula: Energy (kWh) = (P × t) / 1000
        /// Where P = power in Watts, t = time in hours
        /// </summary>
        /// <param name="powerWatts">Device power consumption in Watts</param>
        /// <param name="timeHours">Usage time in hours</param>
        /// <returns>Energy consumption in kWh</returns>
        public static float CalculateEnergyConsumption(float powerWatts, float timeHours)
        {
            return (powerWatts * timeHours) / 1000f;
        }

        /// <summary>
        /// Calculate monthly electricity bill based on energy consumption
        /// </summary>
        /// <param name="monthlyKwh">Monthly energy consumption in kWh</param>
        /// <returns>Monthly bill in Rupiah</returns>
        public static float CalculateMonthlyBill(float monthlyKwh)
        {
            return monthlyKwh * TARIFF_PER_KWH;
        }

        /// <summary>
        /// Calculate total energy consumption from multiple devices
        /// </summary>
        /// <param name="devices">Array of electrical devices</param>
        /// <returns>Total monthly energy consumption in kWh</returns>
        public static float CalculateTotalMonthlyConsumption(ElectricalDevice[] devices)
        {
            float totalKwh = 0f;
            
            foreach (var device in devices)
            {
                if (device.isOn)
                {
                    totalKwh += device.GetMonthlyEnergyConsumption();
                }
            }
            
            return totalKwh;
        }

        /// <summary>
        /// Calculate efficiency percentage based on optimal vs actual usage
        /// </summary>
        /// <param name="actualConsumption">Actual energy consumption in kWh</param>
        /// <param name="optimalConsumption">Optimal energy consumption in kWh</param>
        /// <returns>Efficiency percentage (0-100)</returns>
        public static float CalculateEfficiencyPercentage(float actualConsumption, float optimalConsumption)
        {
            if (actualConsumption <= 0f) return 100f;
            if (optimalConsumption <= 0f) return 0f;
            
            float efficiency = (optimalConsumption / actualConsumption) * 100f;
            return Mathf.Clamp(efficiency, 0f, 100f);
        }

        /// <summary>
        /// Determine efficiency rating based on consumption
        /// </summary>
        /// <param name="monthlyBill">Monthly electricity bill in Rupiah</param>
        /// <returns>Efficiency rating string</returns>
        public static string GetEfficiencyRating(float monthlyBill)
        {
            if (monthlyBill <= 200000f) return "SANGAT HEMAT";
            if (monthlyBill <= 300000f) return "HEMAT";
            if (monthlyBill <= 500000f) return "SEDANG";
            if (monthlyBill <= 800000f) return "BOROS";
            return "SANGAT BOROS";
        }

        /// <summary>
        /// Get efficiency color for UI representation
        /// </summary>
        /// <param name="monthlyBill">Monthly electricity bill in Rupiah</param>
        /// <returns>Color representing efficiency level</returns>
        public static Color GetEfficiencyColor(float monthlyBill)
        {
            if (monthlyBill <= 200000f) return Color.green;
            if (monthlyBill <= 300000f) return Color.yellow;
            if (monthlyBill <= 500000f) return Color.orange;
            return Color.red;
        }

        /// <summary>
        /// Calculate potential savings if efficiency is improved
        /// </summary>
        /// <param name="currentBill">Current monthly bill</param>
        /// <param name="targetEfficiencyPercentage">Target efficiency (0-100)</param>
        /// <returns>Potential monthly savings in Rupiah</returns>
        public static float CalculatePotentialSavings(float currentBill, float targetEfficiencyPercentage)
        {
            float targetBill = currentBill * (targetEfficiencyPercentage / 100f);
            return Mathf.Max(0f, currentBill - targetBill);
        }

        /// <summary>
        /// Format currency for Indonesian Rupiah display
        /// </summary>
        /// <param name="amount">Amount in Rupiah</param>
        /// <returns>Formatted currency string</returns>
        public static string FormatCurrency(float amount)
        {
            return $"Rp {amount:N0}";
        }

        /// <summary>
        /// Format energy consumption for display
        /// </summary>
        /// <param name="kwh">Energy in kWh</param>
        /// <returns>Formatted energy string</returns>
        public static string FormatEnergy(float kwh)
        {
            return $"{kwh:F2} kWh";
        }
    }
}