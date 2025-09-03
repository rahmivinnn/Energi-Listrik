using UnityEngine;
using UnityEngine.SceneManagement;
using System.Collections.Generic;

namespace EnergyQuest.Core
{
    public class GameManager : MonoBehaviour
    {
        [Header("Game Configuration")]
        public float gameVersion = 1.0f;
        public bool debugMode = false;

        [Header("Energy Keys")]
        public int totalEnergyKeys = 4;
        public List<bool> collectedKeys = new List<bool>();

        [Header("Game Progress")]
        public int currentLevel = 1;
        public bool gameCompleted = false;

        // Singleton pattern
        public static GameManager Instance { get; private set; }

        // Events
        public System.Action<int> OnEnergyKeyCollected;
        public System.Action<int> OnLevelCompleted;
        public System.Action OnGameCompleted;

        private void Awake()
        {
            // Singleton implementation
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                InitializeGame();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void InitializeGame()
        {
            // Initialize energy keys collection
            collectedKeys.Clear();
            for (int i = 0; i < totalEnergyKeys; i++)
            {
                collectedKeys.Add(false);
            }

            // Set target frame rate for mobile
            Application.targetFrameRate = 60;
            
            // Don't allow screen to sleep during gameplay
            Screen.sleepTimeout = SleepTimeout.NeverSleep;

            if (debugMode)
            {
                Debug.Log("GameManager initialized - Energy Quest: Misteri Hemat Listrik");
            }
        }

        public void CollectEnergyKey(int keyIndex)
        {
            if (keyIndex >= 0 && keyIndex < totalEnergyKeys && !collectedKeys[keyIndex])
            {
                collectedKeys[keyIndex] = true;
                OnEnergyKeyCollected?.Invoke(keyIndex);

                if (debugMode)
                {
                    Debug.Log($"Energy Key {keyIndex + 1} collected!");
                }

                // Check if all keys are collected
                if (AllKeysCollected())
                {
                    UnlockFinalLevel();
                }
            }
        }

        public bool AllKeysCollected()
        {
            foreach (bool key in collectedKeys)
            {
                if (!key) return false;
            }
            return true;
        }

        public int GetCollectedKeysCount()
        {
            int count = 0;
            foreach (bool key in collectedKeys)
            {
                if (key) count++;
            }
            return count;
        }

        private void UnlockFinalLevel()
        {
            if (debugMode)
            {
                Debug.Log("All Energy Keys collected! Final level unlocked!");
            }
        }

        public void CompleteLevel(int levelNumber)
        {
            currentLevel = Mathf.Max(currentLevel, levelNumber + 1);
            OnLevelCompleted?.Invoke(levelNumber);

            if (debugMode)
            {
                Debug.Log($"Level {levelNumber} completed! Current level: {currentLevel}");
            }
        }

        public void CompleteGame()
        {
            gameCompleted = true;
            OnGameCompleted?.Invoke();

            if (debugMode)
            {
                Debug.Log("Game completed! Congratulations!");
            }
        }

        public void LoadScene(string sceneName)
        {
            SceneManager.LoadScene(sceneName);
        }

        public void QuitGame()
        {
            Application.Quit();
        }

        // Save/Load functionality for mobile
        public void SaveGameProgress()
        {
            PlayerPrefs.SetInt("CurrentLevel", currentLevel);
            PlayerPrefs.SetInt("GameCompleted", gameCompleted ? 1 : 0);
            
            for (int i = 0; i < totalEnergyKeys; i++)
            {
                PlayerPrefs.SetInt($"EnergyKey_{i}", collectedKeys[i] ? 1 : 0);
            }
            
            PlayerPrefs.Save();
        }

        public void LoadGameProgress()
        {
            currentLevel = PlayerPrefs.GetInt("CurrentLevel", 1);
            gameCompleted = PlayerPrefs.GetInt("GameCompleted", 0) == 1;
            
            for (int i = 0; i < totalEnergyKeys; i++)
            {
                collectedKeys[i] = PlayerPrefs.GetInt($"EnergyKey_{i}", 0) == 1;
            }
        }

        public void ResetGameProgress()
        {
            currentLevel = 1;
            gameCompleted = false;
            
            for (int i = 0; i < totalEnergyKeys; i++)
            {
                collectedKeys[i] = false;
            }
            
            PlayerPrefs.DeleteAll();
        }
    }
}