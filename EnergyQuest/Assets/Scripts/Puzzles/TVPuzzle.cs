using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using EnergyQuest.Core;
using EnergyQuest.UI;
using EnergyQuest.Audio;

namespace EnergyQuest.Puzzles
{
    public class TVPuzzle : MonoBehaviour
    {
        [Header("TV Components")]
        public GameObject tvObject;
        public GameObject cableObject;
        public GameObject powerOutlet;
        public GameObject mainSwitchObject;
        public Light tvScreenLight;
        public Renderer tvScreenRenderer;

        [Header("TV Controls")]
        public Button powerButton;
        public Button channelUpButton;
        public Button channelDownButton;
        public Button volumeUpButton;
        public Button volumeDownButton;

        [Header("Interactive Elements")]
        public Button plugCableButton;
        public Button mainSwitchButton;

        [Header("TV Screen")]
        public RenderTexture tvScreenTexture;
        public Camera tvCamera;
        public GameObject scientistRecording;

        [Header("Puzzle State")]
        public bool isCablePlugged = false;
        public bool isMainSwitchOn = false;
        public bool isTVOn = false;
        public bool isChannelSet = false;
        public bool isCompleted = false;

        [Header("Visual Feedback")]
        public Material tvOnMaterial;
        public Material tvOffMaterial;
        public Material cableConnectedMaterial;
        public Material cableDisconnectedMaterial;

        private int currentChannel = 0;
        private int correctChannel = 3; // Channel where scientist recording plays
        private float currentVolume = 0.5f;

        // Step tracking for sequential puzzle
        private int currentStep = 0;
        private readonly string[] stepInstructions = {
            "Colokkan kabel TV ke stop kontak",
            "Nyalakan saklar utama listrik",
            "Tekan tombol power TV",
            "Atur channel ke channel 3"
        };

        private void Start()
        {
            SetupTVPuzzle();
            ResetPuzzle();
        }

        private void SetupTVPuzzle()
        {
            // Setup button listeners
            if (plugCableButton != null)
                plugCableButton.onClick.AddListener(PlugCable);

            if (mainSwitchButton != null)
                mainSwitchButton.onClick.AddListener(ToggleMainSwitch);

            if (powerButton != null)
                powerButton.onClick.AddListener(ToggleTVPower);

            if (channelUpButton != null)
                channelUpButton.onClick.AddListener(ChannelUp);

            if (channelDownButton != null)
                channelDownButton.onClick.AddListener(ChannelDown);

            if (volumeUpButton != null)
                volumeUpButton.onClick.AddListener(VolumeUp);

            if (volumeDownButton != null)
                volumeDownButton.onClick.AddListener(VolumeDown);

            // Setup TV camera for screen content
            if (tvCamera != null && tvScreenTexture != null)
            {
                tvCamera.targetTexture = tvScreenTexture;
            }

            // Initially hide scientist recording
            if (scientistRecording != null)
                scientistRecording.SetActive(false);
        }

        public void ResetPuzzle()
        {
            currentStep = 0;
            isCablePlugged = false;
            isMainSwitchOn = false;
            isTVOn = false;
            isChannelSet = false;
            isCompleted = false;
            currentChannel = 0;

            UpdateVisualStates();
            UpdateInstructions();
        }

        private void UpdateVisualStates()
        {
            // Update cable visual
            if (cableObject != null)
            {
                var cableRenderer = cableObject.GetComponent<Renderer>();
                if (cableRenderer != null)
                {
                    cableRenderer.material = isCablePlugged ? cableConnectedMaterial : cableDisconnectedMaterial;
                }
            }

            // Update TV visual
            if (tvScreenRenderer != null)
            {
                tvScreenRenderer.material = isTVOn ? tvOnMaterial : tvOffMaterial;
            }

            // Update TV screen light
            if (tvScreenLight != null)
            {
                tvScreenLight.enabled = isTVOn;
            }

            // Update main switch visual
            UpdateMainSwitchVisual();

            // Update TV controls accessibility
            UpdateTVControlsAccessibility();
        }

        private void UpdateMainSwitchVisual()
        {
            if (mainSwitchObject != null)
            {
                // Rotate switch based on state
                Vector3 rotation = mainSwitchObject.transform.eulerAngles;
                rotation.z = isMainSwitchOn ? 0f : 180f;
                mainSwitchObject.transform.eulerAngles = rotation;

                // Update material/color
                var renderer = mainSwitchObject.GetComponent<Renderer>();
                if (renderer != null)
                {
                    renderer.material.color = isMainSwitchOn ? Color.green : Color.red;
                }
            }
        }

        private void UpdateTVControlsAccessibility()
        {
            // TV controls only work if TV is powered on
            bool controlsEnabled = isCablePlugged && isMainSwitchOn;

            if (powerButton != null)
                powerButton.interactable = controlsEnabled;

            bool tvControlsEnabled = controlsEnabled && isTVOn;
            if (channelUpButton != null) channelUpButton.interactable = tvControlsEnabled;
            if (channelDownButton != null) channelDownButton.interactable = tvControlsEnabled;
            if (volumeUpButton != null) volumeUpButton.interactable = tvControlsEnabled;
            if (volumeDownButton != null) volumeDownButton.interactable = tvControlsEnabled;
        }

        private void UpdateInstructions()
        {
            if (UIManager.Instance != null && currentStep < stepInstructions.Length)
            {
                UIManager.Instance.SetLevelInfo("Level 1: Ruang Tamu - Puzzle TV", stepInstructions[currentStep]);
            }
        }

        // Button event handlers
        public void PlugCable()
        {
            if (currentStep != 0) 
            {
                ShowStepError("Ikuti urutan yang benar! " + stepInstructions[currentStep]);
                return;
            }

            isCablePlugged = true;
            currentStep++;

            if (AudioManager.Instance != null)
                AudioManager.Instance.PlaySFX("cable_plug");

            if (UIManager.Instance != null)
                UIManager.Instance.ShowFeedback("Kabel berhasil dicolokkan!", true);

            UpdateVisualStates();
            UpdateInstructions();
        }

        public void ToggleMainSwitch()
        {
            if (currentStep != 1)
            {
                ShowStepError("Ikuti urutan yang benar! " + stepInstructions[currentStep]);
                return;
            }

            isMainSwitchOn = !isMainSwitchOn;
            
            if (isMainSwitchOn)
            {
                currentStep++;
                
                if (AudioManager.Instance != null)
                    AudioManager.Instance.PlaySFX("switch_on");

                if (UIManager.Instance != null)
                    UIManager.Instance.ShowFeedback("Saklar utama dinyalakan! Listrik mengalir.", true);
            }
            else
            {
                if (AudioManager.Instance != null)
                    AudioManager.Instance.PlaySFX("switch_off");
            }

            UpdateVisualStates();
            UpdateInstructions();
        }

        public void ToggleTVPower()
        {
            if (currentStep != 2)
            {
                ShowStepError("Ikuti urutan yang benar! " + stepInstructions[currentStep]);
                return;
            }

            if (!isCablePlugged || !isMainSwitchOn)
            {
                ShowStepError("Pastikan kabel tercolok dan saklar utama menyala!");
                return;
            }

            isTVOn = !isTVOn;

            if (isTVOn)
            {
                currentStep++;
                
                if (AudioManager.Instance != null)
                    AudioManager.Instance.PlaySFX("tv_power_on");

                if (UIManager.Instance != null)
                    UIManager.Instance.ShowFeedback("TV berhasil dinyalakan!", true);

                StartCoroutine(TVTurnOnEffect());
            }
            else
            {
                if (AudioManager.Instance != null)
                    AudioManager.Instance.PlaySFX("tv_power_off");
                
                currentChannel = 0;
            }

            UpdateVisualStates();
            UpdateInstructions();
        }

        public void ChannelUp()
        {
            if (!isTVOn) return;

            currentChannel = (currentChannel + 1) % 10; // 10 channels (0-9)
            UpdateTVChannel();
        }

        public void ChannelDown()
        {
            if (!isTVOn) return;

            currentChannel = (currentChannel - 1 + 10) % 10;
            UpdateTVChannel();
        }

        public void VolumeUp()
        {
            if (!isTVOn) return;

            currentVolume = Mathf.Clamp01(currentVolume + 0.1f);
            UpdateTVVolume();
        }

        public void VolumeDown()
        {
            if (!isTVOn) return;

            currentVolume = Mathf.Clamp01(currentVolume - 0.1f);
            UpdateTVVolume();
        }

        private void UpdateTVChannel()
        {
            if (AudioManager.Instance != null)
                AudioManager.Instance.PlaySFX("tv_channel_change");

            // Check if correct channel
            if (currentChannel == correctChannel && currentStep == 3)
            {
                isChannelSet = true;
                CompleteTVPuzzle();
            }
            else
            {
                // Show channel number briefly
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowFeedback($"Channel {currentChannel}", true, 1f);
                }
            }

            UpdateTVScreenContent();
        }

        private void UpdateTVVolume()
        {
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("tv_volume_change");
            }

            // Update audio volume for TV content
            if (AudioManager.Instance != null && isChannelSet)
            {
                // Adjust scientist recording volume
                AudioManager.Instance.narrationSource.volume = currentVolume;
            }
        }

        private void UpdateTVScreenContent()
        {
            if (tvCamera == null) return;

            // Hide all content first
            if (scientistRecording != null)
                scientistRecording.SetActive(false);

            // Show content based on channel
            if (currentChannel == correctChannel)
            {
                if (scientistRecording != null)
                    scientistRecording.SetActive(true);
            }
        }

        private void CompleteTVPuzzle()
        {
            isCompleted = true;

            // Play scientist recording
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayNarration("scientist_tv_recording");
            }

            // Show scientist recording on TV screen
            if (scientistRecording != null)
            {
                scientistRecording.SetActive(true);
            }

            // Show completion feedback
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Channel yang tepat! Rekaman ilmuwan ditemukan.", true, 5f);
            }

            // Start scientist message coroutine
            StartCoroutine(PlayScientistMessage());
        }

        private IEnumerator PlayScientistMessage()
        {
            // Wait for narration to finish
            yield return new WaitForSeconds(5f);

            // Show scientist message as text
            string scientistMessage = "Jika kau menemukan ini, berarti kau berhasil menghidupkan ruang tamuku. " +
                                    "Carilah kunci energi, hanya itu yang bisa membuka jalanmu ke ruangan lain. " +
                                    "Ingat, gunakan listrik dengan bijak!";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Pesan dari Ilmuwan", scientistMessage);
            }

            // Award energy key after message
            yield return new WaitForSeconds(3f);
            AwardEnergyKey();
        }

        private void AwardEnergyKey()
        {
            // Collect first energy key
            if (GameManager.Instance != null)
            {
                GameManager.Instance.CollectEnergyKey(0); // First key (index 0)
            }

            // Play key collection effect
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayKeyCollected();
            }

            // Show key collection feedback
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback("Kunci Energi Pertama didapat! Pintu ke dapur terbuka.", true, 4f);
            }
        }

        private IEnumerator TVTurnOnEffect()
        {
            // Screen flicker effect when turning on
            for (int i = 0; i < 3; i++)
            {
                if (tvScreenLight != null)
                    tvScreenLight.enabled = false;
                
                yield return new WaitForSeconds(0.1f);
                
                if (tvScreenLight != null)
                    tvScreenLight.enabled = true;
                
                yield return new WaitForSeconds(0.1f);
            }
        }

        private void ShowStepError(string message)
        {
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback(message, false);
            }

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayErrorSound();
            }
        }

        public bool IsPuzzleCompleted()
        {
            return isCompleted;
        }

        public void ResetPuzzleState()
        {
            ResetPuzzle();
        }

        private void OnDestroy()
        {
            // Remove all button listeners
            if (powerButton != null) powerButton.onClick.RemoveAllListeners();
            if (channelUpButton != null) channelUpButton.onClick.RemoveAllListeners();
            if (channelDownButton != null) channelDownButton.onClick.RemoveAllListeners();
            if (volumeUpButton != null) volumeUpButton.onClick.RemoveAllListeners();
            if (volumeDownButton != null) volumeDownButton.onClick.RemoveAllListeners();
            if (plugCableButton != null) plugCableButton.onClick.RemoveAllListeners();
            if (mainSwitchButton != null) mainSwitchButton.onClick.RemoveAllListeners();
        }
    }
}