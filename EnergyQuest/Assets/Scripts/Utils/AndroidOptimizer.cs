using UnityEngine;

namespace EnergyQuest.Utils
{
    public class AndroidOptimizer : MonoBehaviour
    {
        [Header("Performance Settings")]
        public int targetFrameRate = 60;
        public bool optimizeForBattery = true;
        public bool enableVSync = false;

        [Header("Graphics Optimization")]
        public bool reduceShadowDistance = true;
        public float mobileShadowDistance = 50f;
        public bool optimizeTextureQuality = true;
        public int mobileTextureQuality = 1; // 0 = full, 1 = half, 2 = quarter

        [Header("Audio Optimization")]
        public bool compressAudio = true;
        public AudioCompressionFormat audioCompression = AudioCompressionFormat.Vorbis;

        private void Awake()
        {
            // Only optimize on Android devices
            #if UNITY_ANDROID && !UNITY_EDITOR
                OptimizeForAndroid();
            #endif
        }

        private void OptimizeForAndroid()
        {
            // Performance optimization
            Application.targetFrameRate = targetFrameRate;
            QualitySettings.vSyncCount = enableVSync ? 1 : 0;

            // Graphics optimization
            if (reduceShadowDistance)
            {
                QualitySettings.shadowDistance = mobileShadowDistance;
            }

            if (optimizeTextureQuality)
            {
                QualitySettings.masterTextureLimit = mobileTextureQuality;
            }

            // Memory optimization
            QualitySettings.antiAliasing = 0; // Disable AA for better performance
            QualitySettings.anisotropicFiltering = AnisotropicFiltering.Disable;

            // Particle optimization
            QualitySettings.particleRaycastBudget = 64; // Reduce particle raycast budget

            // Shadow optimization
            QualitySettings.shadowCascades = 2; // Reduce shadow cascades
            QualitySettings.shadowResolution = ShadowResolution.Low;

            // LOD optimization
            QualitySettings.lodBias = 0.7f; // Use lower LOD levels sooner

            // Texture streaming
            QualitySettings.streamingMipmapsActive = true;

            // Battery optimization
            if (optimizeForBattery)
            {
                Screen.sleepTimeout = SleepTimeout.SystemSetting;
                Application.targetFrameRate = 30; // Lower frame rate for battery saving
            }
            else
            {
                Screen.sleepTimeout = SleepTimeout.NeverSleep;
            }

            Debug.Log("Android optimization applied");
        }

        // Runtime optimization methods
        public void SetPerformanceMode(PerformanceMode mode)
        {
            switch (mode)
            {
                case PerformanceMode.PowerSaving:
                    Application.targetFrameRate = 30;
                    QualitySettings.SetQualityLevel(0); // Fastest
                    break;

                case PerformanceMode.Balanced:
                    Application.targetFrameRate = 45;
                    QualitySettings.SetQualityLevel(2); // Good
                    break;

                case PerformanceMode.HighPerformance:
                    Application.targetFrameRate = 60;
                    QualitySettings.SetQualityLevel(3); // Beautiful
                    break;
            }
        }

        // Memory management
        public void OptimizeMemory()
        {
            // Force garbage collection
            System.GC.Collect();

            // Unload unused assets
            Resources.UnloadUnusedAssets();

            Debug.Log("Memory optimization performed");
        }

        // Battery monitoring
        public void CheckBatteryLevel()
        {
            float batteryLevel = SystemInfo.batteryLevel;
            BatteryStatus batteryStatus = SystemInfo.batteryStatus;

            if (batteryLevel < 0.2f && batteryStatus != BatteryStatus.Charging)
            {
                // Switch to power saving mode
                SetPerformanceMode(PerformanceMode.PowerSaving);
                
                Debug.Log("Low battery detected - switching to power saving mode");
            }
        }

        // Device-specific optimization
        public void OptimizeForDevice()
        {
            // Get device specs
            int systemMemoryMB = SystemInfo.systemMemorySize;
            string deviceModel = SystemInfo.deviceModel;
            int processorCount = SystemInfo.processorCount;

            // Optimize based on device capabilities
            if (systemMemoryMB < 3000) // Less than 3GB RAM
            {
                SetPerformanceMode(PerformanceMode.PowerSaving);
                QualitySettings.masterTextureLimit = 2; // Quarter resolution textures
            }
            else if (systemMemoryMB < 6000) // 3-6GB RAM
            {
                SetPerformanceMode(PerformanceMode.Balanced);
                QualitySettings.masterTextureLimit = 1; // Half resolution textures
            }
            else // 6GB+ RAM
            {
                SetPerformanceMode(PerformanceMode.HighPerformance);
                QualitySettings.masterTextureLimit = 0; // Full resolution textures
            }

            Debug.Log($"Optimized for device: {deviceModel}, RAM: {systemMemoryMB}MB, Cores: {processorCount}");
        }

        // Thermal management
        private void MonitorThermalState()
        {
            #if UNITY_ANDROID && !UNITY_EDITOR
            // Monitor device temperature (Android specific)
            if (Application.platform == RuntimePlatform.Android)
            {
                // This would require Android native plugin for real implementation
                // For now, we'll use a simplified approach
                
                if (Application.targetFrameRate > 30 && Time.time % 30f < 1f) // Check every 30 seconds
                {
                    // If running high performance for extended time, reduce to prevent overheating
                    SetPerformanceMode(PerformanceMode.Balanced);
                }
            }
            #endif
        }

        private void Update()
        {
            // Periodic optimization checks
            if (Time.time % 10f < 1f) // Every 10 seconds
            {
                CheckBatteryLevel();
            }

            if (Time.time % 60f < 1f) // Every minute
            {
                MonitorThermalState();
            }
        }
    }

    public enum PerformanceMode
    {
        PowerSaving,
        Balanced,
        HighPerformance
    }
}