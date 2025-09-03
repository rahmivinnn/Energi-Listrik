using UnityEngine;
using System.Collections.Generic;
using System.Collections;

namespace EnergyQuest.Audio
{
    [System.Serializable]
    public class AudioClipData
    {
        public string name;
        public AudioClip clip;
        public float volume = 1f;
        public bool loop = false;
    }

    public class AudioManager : MonoBehaviour
    {
        [Header("Audio Sources")]
        public AudioSource musicSource;
        public AudioSource sfxSource;
        public AudioSource narrationSource;

        [Header("Audio Clips")]
        public List<AudioClipData> musicClips = new List<AudioClipData>();
        public List<AudioClipData> sfxClips = new List<AudioClipData>();
        public List<AudioClipData> narrationClips = new List<AudioClipData>();

        [Header("Volume Settings")]
        [Range(0f, 1f)] public float masterVolume = 1f;
        [Range(0f, 1f)] public float musicVolume = 0.7f;
        [Range(0f, 1f)] public float sfxVolume = 1f;
        [Range(0f, 1f)] public float narrationVolume = 1f;

        // Audio clip dictionaries for quick lookup
        private Dictionary<string, AudioClipData> musicDict = new Dictionary<string, AudioClipData>();
        private Dictionary<string, AudioClipData> sfxDict = new Dictionary<string, AudioClipData>();
        private Dictionary<string, AudioClipData> narrationDict = new Dictionary<string, AudioClipData>();

        // Current playing tracks
        private string currentMusicTrack = "";
        private bool isMusicFading = false;

        // Singleton
        public static AudioManager Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                InitializeAudio();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void InitializeAudio()
        {
            // Create audio sources if not assigned
            if (musicSource == null)
            {
                GameObject musicObj = new GameObject("MusicSource");
                musicObj.transform.SetParent(transform);
                musicSource = musicObj.AddComponent<AudioSource>();
                musicSource.loop = true;
                musicSource.playOnAwake = false;
            }

            if (sfxSource == null)
            {
                GameObject sfxObj = new GameObject("SFXSource");
                sfxObj.transform.SetParent(transform);
                sfxSource = sfxObj.AddComponent<AudioSource>();
                sfxSource.loop = false;
                sfxSource.playOnAwake = false;
            }

            if (narrationSource == null)
            {
                GameObject narrationObj = new GameObject("NarrationSource");
                narrationObj.transform.SetParent(transform);
                narrationSource = narrationObj.AddComponent<AudioSource>();
                narrationSource.loop = false;
                narrationSource.playOnAwake = false;
            }

            // Build dictionaries
            BuildAudioDictionaries();

            // Load saved volume settings
            LoadVolumeSettings();

            Debug.Log("AudioManager initialized with " + 
                     $"{musicClips.Count} music clips, " + 
                     $"{sfxClips.Count} SFX clips, " + 
                     $"{narrationClips.Count} narration clips");
        }

        private void BuildAudioDictionaries()
        {
            // Build music dictionary
            musicDict.Clear();
            foreach (var clipData in musicClips)
            {
                if (!string.IsNullOrEmpty(clipData.name))
                {
                    musicDict[clipData.name] = clipData;
                }
            }

            // Build SFX dictionary
            sfxDict.Clear();
            foreach (var clipData in sfxClips)
            {
                if (!string.IsNullOrEmpty(clipData.name))
                {
                    sfxDict[clipData.name] = clipData;
                }
            }

            // Build narration dictionary
            narrationDict.Clear();
            foreach (var clipData in narrationClips)
            {
                if (!string.IsNullOrEmpty(clipData.name))
                {
                    narrationDict[clipData.name] = clipData;
                }
            }
        }

        // Music methods
        public void PlayBackgroundMusic(string musicName, bool fadeIn = true)
        {
            if (musicDict.ContainsKey(musicName))
            {
                var clipData = musicDict[musicName];
                
                if (currentMusicTrack == musicName && musicSource.isPlaying)
                    return; // Already playing this track

                if (fadeIn && musicSource.isPlaying)
                {
                    StartCoroutine(CrossfadeMusic(clipData));
                }
                else
                {
                    PlayMusicDirectly(clipData);
                }

                currentMusicTrack = musicName;
            }
            else
            {
                Debug.LogWarning($"Music clip '{musicName}' not found!");
            }
        }

        public void PlayThemeMusic()
        {
            PlayBackgroundMusic("theme_music", true);
        }

        private void PlayMusicDirectly(AudioClipData clipData)
        {
            musicSource.clip = clipData.clip;
            musicSource.volume = clipData.volume * musicVolume * masterVolume;
            musicSource.loop = clipData.loop;
            musicSource.Play();
        }

        private IEnumerator CrossfadeMusic(AudioClipData newClipData)
        {
            if (isMusicFading) yield break;

            isMusicFading = true;
            float fadeTime = 1f;
            float originalVolume = musicSource.volume;

            // Fade out current music
            for (float t = 0; t < fadeTime; t += Time.deltaTime)
            {
                musicSource.volume = Mathf.Lerp(originalVolume, 0f, t / fadeTime);
                yield return null;
            }

            // Switch to new music
            PlayMusicDirectly(newClipData);

            // Fade in new music
            float targetVolume = newClipData.volume * musicVolume * masterVolume;
            for (float t = 0; t < fadeTime; t += Time.deltaTime)
            {
                musicSource.volume = Mathf.Lerp(0f, targetVolume, t / fadeTime);
                yield return null;
            }

            musicSource.volume = targetVolume;
            isMusicFading = false;
        }

        public void StopMusic(bool fadeOut = true)
        {
            if (fadeOut)
            {
                StartCoroutine(FadeOutMusic());
            }
            else
            {
                musicSource.Stop();
            }
            currentMusicTrack = "";
        }

        private IEnumerator FadeOutMusic()
        {
            float fadeTime = 1f;
            float originalVolume = musicSource.volume;

            for (float t = 0; t < fadeTime; t += Time.deltaTime)
            {
                musicSource.volume = Mathf.Lerp(originalVolume, 0f, t / fadeTime);
                yield return null;
            }

            musicSource.Stop();
        }

        // SFX methods
        public void PlaySFX(string sfxName)
        {
            if (sfxDict.ContainsKey(sfxName))
            {
                var clipData = sfxDict[sfxName];
                sfxSource.PlayOneShot(clipData.clip, clipData.volume * sfxVolume * masterVolume);
            }
            else
            {
                Debug.LogWarning($"SFX clip '{sfxName}' not found!");
            }
        }

        public void PlayElectricalBuzz()
        {
            PlaySFX("electrical_buzz");
        }

        public void PlaySuccessSound()
        {
            PlaySFX("success_ding");
        }

        public void PlayErrorSound()
        {
            PlaySFX("error_buzz");
        }

        public void PlayKeyCollected()
        {
            PlaySFX("key_collected");
        }

        // Narration methods
        public void PlayNarration(string narrationName)
        {
            if (narrationDict.ContainsKey(narrationName))
            {
                var clipData = narrationDict[narrationName];
                
                // Stop current narration if playing
                if (narrationSource.isPlaying)
                {
                    narrationSource.Stop();
                }

                narrationSource.clip = clipData.clip;
                narrationSource.volume = clipData.volume * narrationVolume * masterVolume;
                narrationSource.loop = clipData.loop;
                narrationSource.Play();
            }
            else
            {
                Debug.LogWarning($"Narration clip '{narrationName}' not found!");
            }
        }

        public void StopNarration()
        {
            narrationSource.Stop();
        }

        public bool IsNarrationPlaying()
        {
            return narrationSource.isPlaying;
        }

        // Volume control methods
        public void SetMasterVolume(float volume)
        {
            masterVolume = Mathf.Clamp01(volume);
            UpdateAllVolumes();
            SaveVolumeSettings();
        }

        public void SetMusicVolume(float volume)
        {
            musicVolume = Mathf.Clamp01(volume);
            UpdateMusicVolume();
            SaveVolumeSettings();
        }

        public void SetSFXVolume(float volume)
        {
            sfxVolume = Mathf.Clamp01(volume);
            SaveVolumeSettings();
        }

        public void SetNarrationVolume(float volume)
        {
            narrationVolume = Mathf.Clamp01(volume);
            UpdateNarrationVolume();
            SaveVolumeSettings();
        }

        private void UpdateAllVolumes()
        {
            UpdateMusicVolume();
            UpdateNarrationVolume();
        }

        private void UpdateMusicVolume()
        {
            if (musicSource.clip != null && currentMusicTrack != "")
            {
                var clipData = musicDict.ContainsKey(currentMusicTrack) ? musicDict[currentMusicTrack] : null;
                if (clipData != null)
                {
                    musicSource.volume = clipData.volume * musicVolume * masterVolume;
                }
            }
        }

        private void UpdateNarrationVolume()
        {
            if (narrationSource.clip != null)
            {
                narrationSource.volume = narrationVolume * masterVolume;
            }
        }

        // Save/Load volume settings
        private void SaveVolumeSettings()
        {
            PlayerPrefs.SetFloat("MasterVolume", masterVolume);
            PlayerPrefs.SetFloat("MusicVolume", musicVolume);
            PlayerPrefs.SetFloat("SFXVolume", sfxVolume);
            PlayerPrefs.SetFloat("NarrationVolume", narrationVolume);
            PlayerPrefs.Save();
        }

        private void LoadVolumeSettings()
        {
            masterVolume = PlayerPrefs.GetFloat("MasterVolume", 1f);
            musicVolume = PlayerPrefs.GetFloat("MusicVolume", 0.7f);
            sfxVolume = PlayerPrefs.GetFloat("SFXVolume", 1f);
            narrationVolume = PlayerPrefs.GetFloat("NarrationVolume", 1f);
            
            UpdateAllVolumes();
        }
    }
}