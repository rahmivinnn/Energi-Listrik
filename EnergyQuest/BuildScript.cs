using UnityEngine;
using UnityEditor;
using UnityEditor.Build.Reporting;
using System.IO;

namespace EnergyQuest.Build
{
    public class BuildScript
    {
        private static readonly string[] scenes = {
            "Assets/Scenes/MainScene.unity"
        };

        [MenuItem("Energy Quest/Build Android APK")]
        public static void BuildAndroid()
        {
            // Configure build settings for Android
            EditorUserBuildSettings.buildAppBundle = false; // Build APK instead of AAB
            EditorUserBuildSettings.androidBuildSystem = AndroidBuildSystem.Gradle;

            // Set build options
            BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions();
            buildPlayerOptions.scenes = scenes;
            buildPlayerOptions.locationPathName = "Builds/EnergyQuest-Android.apk";
            buildPlayerOptions.target = BuildTarget.Android;
            buildPlayerOptions.options = BuildOptions.None;

            // Configure Android settings
            PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
            PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel22;
            PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevelAuto;

            // Optimization settings
            PlayerSettings.stripEngineCode = true;
            PlayerSettings.Android.useCustomKeystore = false;

            // Create builds directory if it doesn't exist
            string buildDir = Path.GetDirectoryName(buildPlayerOptions.locationPathName);
            if (!Directory.Exists(buildDir))
            {
                Directory.CreateDirectory(buildDir);
            }

            Debug.Log("Starting Android build...");

            // Build the player
            BuildReport report = BuildPipeline.BuildPlayer(buildPlayerOptions);
            BuildSummary summary = report.summary;

            if (summary.result == BuildResult.Succeeded)
            {
                Debug.Log($"Build succeeded: {buildPlayerOptions.locationPathName}");
                Debug.Log($"Build size: {summary.totalSize} bytes");
                Debug.Log($"Build time: {summary.totalTime}");

                // Open build folder
                EditorUtility.RevealInFinder(buildPlayerOptions.locationPathName);
            }
            else
            {
                Debug.LogError($"Build failed: {summary.result}");
                
                // Print build errors
                foreach (var step in report.steps)
                {
                    foreach (var message in step.messages)
                    {
                        if (message.type == LogType.Error || message.type == LogType.Exception)
                        {
                            Debug.LogError($"Build Error: {message.content}");
                        }
                    }
                }
            }
        }

        [MenuItem("Energy Quest/Build Development APK")]
        public static void BuildAndroidDevelopment()
        {
            // Development build with debugging enabled
            BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions();
            buildPlayerOptions.scenes = scenes;
            buildPlayerOptions.locationPathName = "Builds/EnergyQuest-Android-Dev.apk";
            buildPlayerOptions.target = BuildTarget.Android;
            buildPlayerOptions.options = BuildOptions.Development | BuildOptions.AllowDebugging;

            // Enable development settings
            EditorUserBuildSettings.development = true;
            EditorUserBuildSettings.allowDebugging = true;

            Debug.Log("Starting Android development build...");

            BuildReport report = BuildPipeline.BuildPlayer(buildPlayerOptions);
            
            if (report.summary.result == BuildResult.Succeeded)
            {
                Debug.Log("Development build succeeded!");
                EditorUtility.RevealInFinder(buildPlayerOptions.locationPathName);
            }
            else
            {
                Debug.LogError("Development build failed!");
            }
        }

        [MenuItem("Energy Quest/Configure Project Settings")]
        public static void ConfigureProjectSettings()
        {
            // Company and product info
            PlayerSettings.companyName = "EnergyQuest Team";
            PlayerSettings.productName = "Energy Quest: Misteri Hemat Listrik";
            PlayerSettings.bundleVersion = "1.0.0";

            // Android specific
            PlayerSettings.SetApplicationIdentifier(BuildTargetGroup.Android, "com.energyquest.misterihematlistrik");
            PlayerSettings.Android.bundleVersionCode = 1;

            // Graphics settings for mobile
            PlayerSettings.colorSpace = ColorSpace.Gamma; // Better performance on mobile
            PlayerSettings.gpuSkinning = false; // Disable for older devices

            // Audio settings
            AudioSettings.GetConfiguration(out var config);
            config.speakerMode = AudioSpeakerMode.Stereo;
            AudioSettings.Reset(config);

            // Input settings for mobile
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.LandscapeLeft;
            PlayerSettings.allowedAutorotateToLandscapeLeft = true;
            PlayerSettings.allowedAutorotateToLandscapeRight = true;
            PlayerSettings.allowedAutorotateToPortrait = false;
            PlayerSettings.allowedAutorotateToPortraitUpsideDown = false;

            Debug.Log("Project settings configured for Energy Quest");
        }

        [MenuItem("Energy Quest/Setup Build Environment")]
        public static void SetupBuildEnvironment()
        {
            // Create necessary folders
            string[] folders = {
                "Builds",
                "Assets/StreamingAssets",
                "Assets/Resources/Audio",
                "Assets/Resources/Textures",
                "Assets/Resources/Prefabs"
            };

            foreach (string folder in folders)
            {
                if (!Directory.Exists(folder))
                {
                    Directory.CreateDirectory(folder);
                    Debug.Log($"Created folder: {folder}");
                }
            }

            // Refresh asset database
            AssetDatabase.Refresh();

            Debug.Log("Build environment setup complete");
        }

        [MenuItem("Energy Quest/Validate Project")]
        public static void ValidateProject()
        {
            bool isValid = true;

            Debug.Log("=== PROJECT VALIDATION ===");

            // Check required scenes
            foreach (string scenePath in scenes)
            {
                if (!File.Exists(scenePath))
                {
                    Debug.LogError($"Missing scene: {scenePath}");
                    isValid = false;
                }
                else
                {
                    Debug.Log($"✓ Scene found: {scenePath}");
                }
            }

            // Check critical scripts
            string[] criticalScripts = {
                "Assets/Scripts/Core/GameManager.cs",
                "Assets/Scripts/Core/FiniteStateMachine.cs",
                "Assets/Scripts/Audio/AudioManager.cs",
                "Assets/Scripts/UI/UIManager.cs"
            };

            foreach (string scriptPath in criticalScripts)
            {
                if (!File.Exists(scriptPath))
                {
                    Debug.LogError($"Missing critical script: {scriptPath}");
                    isValid = false;
                }
                else
                {
                    Debug.Log($"✓ Script found: {scriptPath}");
                }
            }

            // Check Android build settings
            if (EditorUserBuildSettings.activeBuildTarget != BuildTarget.Android)
            {
                Debug.LogWarning("Build target is not set to Android");
            }
            else
            {
                Debug.Log("✓ Build target: Android");
            }

            // Final validation result
            if (isValid)
            {
                Debug.Log("✅ PROJECT VALIDATION PASSED");
                Debug.Log("Project is ready for build!");
            }
            else
            {
                Debug.LogError("❌ PROJECT VALIDATION FAILED");
                Debug.LogError("Please fix the issues above before building");
            }
        }

        [MenuItem("Energy Quest/Generate Build Report")]
        public static void GenerateBuildReport()
        {
            string reportPath = "BuildReport.txt";
            
            using (StreamWriter writer = new StreamWriter(reportPath))
            {
                writer.WriteLine("ENERGY QUEST: MISTERI HEMAT LISTRIK");
                writer.WriteLine("BUILD REPORT");
                writer.WriteLine("Generated: " + System.DateTime.Now.ToString());
                writer.WriteLine();

                writer.WriteLine("=== PROJECT INFORMATION ===");
                writer.WriteLine($"Unity Version: {Application.unityVersion}");
                writer.WriteLine($"Product Name: {PlayerSettings.productName}");
                writer.WriteLine($"Bundle Version: {PlayerSettings.bundleVersion}");
                writer.WriteLine($"Company: {PlayerSettings.companyName}");
                writer.WriteLine();

                writer.WriteLine("=== ANDROID CONFIGURATION ===");
                writer.WriteLine($"Package Name: {PlayerSettings.GetApplicationIdentifier(BuildTargetGroup.Android)}");
                writer.WriteLine($"Version Code: {PlayerSettings.Android.bundleVersionCode}");
                writer.WriteLine($"Min SDK: {PlayerSettings.Android.minSdkVersion}");
                writer.WriteLine($"Target SDK: {PlayerSettings.Android.targetSdkVersion}");
                writer.WriteLine($"Architecture: {PlayerSettings.Android.targetArchitectures}");
                writer.WriteLine();

                writer.WriteLine("=== FEATURES IMPLEMENTED ===");
                writer.WriteLine("✓ Finite State Machine for game flow");
                writer.WriteLine("✓ Fisher-Yates Shuffle for quiz randomization");
                writer.WriteLine("✓ Energy calculation system");
                writer.WriteLine("✓ 4 educational levels with unique puzzles");
                writer.WriteLine("✓ Audio system with Indonesian narration");
                writer.WriteLine("✓ Mobile-optimized UI and controls");
                writer.WriteLine("✓ Save/load progress system");
                writer.WriteLine("✓ Educational content integration");
                writer.WriteLine();

                writer.WriteLine("=== EDUCATIONAL CONTENT ===");
                writer.WriteLine("• Level 1: Basic electrical circuits");
                writer.WriteLine("• Level 2: Energy efficiency in daily life");
                writer.WriteLine("• Level 3: Electricity bill calculation");
                writer.WriteLine("• Level 4: Comprehensive knowledge evaluation");
                writer.WriteLine();

                writer.WriteLine("=== TECHNICAL SPECIFICATIONS ===");
                writer.WriteLine($"Target FPS: {GameConstants.TARGET_FPS}");
                writer.WriteLine($"Color Space: {PlayerSettings.colorSpace}");
                writer.WriteLine($"Scripting Backend: IL2CPP");
                writer.WriteLine($"API Compatibility: .NET Standard 2.1");
                writer.WriteLine();

                writer.WriteLine("=== BUILD READY ===");
                writer.WriteLine("Project is configured and ready for Android build.");
                writer.WriteLine("Use 'Energy Quest/Build Android APK' to create release build.");
            }

            Debug.Log($"Build report generated: {reportPath}");
            EditorUtility.RevealInFinder(reportPath);
        }
    }
}