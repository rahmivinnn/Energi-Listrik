using System;
using System.Collections.Generic;
using UnityEngine;

namespace EnergyQuest.Core
{
    // Game state enumeration
    public enum GameState
    {
        OpeningScene,
        MainMenu,
        Level1_LivingRoom,
        Level2_Kitchen,
        Level3_Laboratory,
        Level4_Basement,
        EndingScene,
        Settings,
        About,
        Paused
    }

    // State machine implementation
    public class FiniteStateMachine : MonoBehaviour
    {
        [Header("State Machine Configuration")]
        public GameState initialState = GameState.OpeningScene;
        public bool debugStateChanges = true;

        // Current state
        private GameState currentState;
        private GameState previousState;

        // State handlers
        private Dictionary<GameState, IGameState> stateHandlers = new Dictionary<GameState, IGameState>();

        // Events
        public Action<GameState, GameState> OnStateChanged;

        // Singleton
        public static FiniteStateMachine Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                InitializeStateMachine();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void Start()
        {
            // Start with initial state
            ChangeState(initialState);
        }

        private void InitializeStateMachine()
        {
            // Register state handlers
            RegisterStateHandlers();

            if (debugStateChanges)
            {
                Debug.Log("Finite State Machine initialized");
            }
        }

        private void RegisterStateHandlers()
        {
            // Find and register all state handlers in the scene
            var stateComponents = FindObjectsOfType<MonoBehaviour>();
            
            foreach (var component in stateComponents)
            {
                if (component is IGameState stateHandler)
                {
                    var stateType = GetStateTypeFromHandler(component);
                    if (stateType.HasValue)
                    {
                        stateHandlers[stateType.Value] = stateHandler;
                    }
                }
            }
        }

        private GameState? GetStateTypeFromHandler(MonoBehaviour handler)
        {
            // Map handler types to game states
            var handlerType = handler.GetType().Name;
            
            switch (handlerType)
            {
                case "OpeningSceneHandler": return GameState.OpeningScene;
                case "MainMenuHandler": return GameState.MainMenu;
                case "LivingRoomHandler": return GameState.Level1_LivingRoom;
                case "KitchenHandler": return GameState.Level2_Kitchen;
                case "LaboratoryHandler": return GameState.Level3_Laboratory;
                case "BasementHandler": return GameState.Level4_Basement;
                case "EndingSceneHandler": return GameState.EndingScene;
                case "SettingsHandler": return GameState.Settings;
                case "AboutHandler": return GameState.About;
                default: return null;
            }
        }

        public void ChangeState(GameState newState)
        {
            if (currentState == newState) return;

            previousState = currentState;

            // Exit current state
            if (stateHandlers.ContainsKey(currentState))
            {
                stateHandlers[currentState].OnStateExit();
            }

            // Change state
            currentState = newState;

            // Enter new state
            if (stateHandlers.ContainsKey(currentState))
            {
                stateHandlers[currentState].OnStateEnter();
            }

            // Fire event
            OnStateChanged?.Invoke(previousState, currentState);

            if (debugStateChanges)
            {
                Debug.Log($"State changed: {previousState} -> {currentState}");
            }
        }

        public GameState GetCurrentState()
        {
            return currentState;
        }

        public GameState GetPreviousState()
        {
            return previousState;
        }

        public bool IsInState(GameState state)
        {
            return currentState == state;
        }

        public void RegisterStateHandler(GameState state, IGameState handler)
        {
            stateHandlers[state] = handler;
        }

        private void Update()
        {
            // Update current state
            if (stateHandlers.ContainsKey(currentState))
            {
                stateHandlers[currentState].OnStateUpdate();
            }
        }

        // Transition methods for specific game flow
        public void StartGame()
        {
            ChangeState(GameState.Level1_LivingRoom);
        }

        public void ReturnToMainMenu()
        {
            ChangeState(GameState.MainMenu);
        }

        public void OpenSettings()
        {
            ChangeState(GameState.Settings);
        }

        public void OpenAbout()
        {
            ChangeState(GameState.About);
        }

        public void PauseGame()
        {
            ChangeState(GameState.Paused);
        }

        public void ResumeGame()
        {
            ChangeState(previousState);
        }

        public void NextLevel()
        {
            switch (currentState)
            {
                case GameState.Level1_LivingRoom:
                    ChangeState(GameState.Level2_Kitchen);
                    break;
                case GameState.Level2_Kitchen:
                    ChangeState(GameState.Level3_Laboratory);
                    break;
                case GameState.Level3_Laboratory:
                    ChangeState(GameState.Level4_Basement);
                    break;
                case GameState.Level4_Basement:
                    ChangeState(GameState.EndingScene);
                    break;
                default:
                    Debug.LogWarning("No next level available from current state: " + currentState);
                    break;
            }
        }
    }

    // Interface for state handlers
    public interface IGameState
    {
        void OnStateEnter();
        void OnStateUpdate();
        void OnStateExit();
    }
}