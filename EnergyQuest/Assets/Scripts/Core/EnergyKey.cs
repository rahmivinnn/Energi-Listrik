using UnityEngine;
using System.Collections;
using EnergyQuest.UI;
using EnergyQuest.Audio;

namespace EnergyQuest.Core
{
    public class EnergyKey : MonoBehaviour
    {
        [Header("Energy Key Configuration")]
        public int keyIndex = 0;
        public string keyName = "Kunci Energi";
        public string keyDescription = "Kunci energi yang diperlukan untuk membuka gerbang evaluasi";

        [Header("Visual Elements")]
        public GameObject keyModel;
        public Light keyLight;
        public ParticleSystem keyAura;
        public Material keyMaterial;

        [Header("Animation")]
        public float rotationSpeed = 30f;
        public float floatAmplitude = 0.5f;
        public float floatSpeed = 2f;
        public AnimationCurve collectionCurve;

        [Header("Collection Effects")]
        public GameObject collectionEffect;
        public AudioClip collectionSound;

        private Vector3 originalPosition;
        private bool isCollected = false;
        private bool isAnimating = false;

        private void Start()
        {
            originalPosition = transform.position;
            InitializeKey();
        }

        private void Update()
        {
            if (!isCollected && !isAnimating)
            {
                AnimateKey();
            }
        }

        private void InitializeKey()
        {
            // Setup key visual
            if (keyLight != null)
            {
                keyLight.color = GetKeyColor();
                keyLight.intensity = 1f;
            }

            // Setup key aura
            if (keyAura != null)
            {
                var main = keyAura.main;
                main.startColor = GetKeyColor();
                keyAura.Play();
            }

            // Setup key material
            if (keyMaterial != null && keyModel != null)
            {
                var renderer = keyModel.GetComponent<Renderer>();
                if (renderer != null)
                {
                    renderer.material = keyMaterial;
                    renderer.material.color = GetKeyColor();
                }
            }
        }

        private void AnimateKey()
        {
            // Rotation animation
            transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);

            // Floating animation
            float time = Time.time * floatSpeed;
            float yOffset = Mathf.Sin(time) * floatAmplitude;
            transform.position = originalPosition + Vector3.up * yOffset;

            // Pulsing light
            if (keyLight != null)
            {
                keyLight.intensity = 1f + Mathf.Sin(time * 2f) * 0.3f;
            }
        }

        private Color GetKeyColor()
        {
            // Different colors for different keys
            switch (keyIndex)
            {
                case 0: return Color.red;     // Living Room - Red
                case 1: return Color.green;   // Kitchen - Green
                case 2: return Color.blue;    // Laboratory - Blue
                case 3: return Color.yellow;  // Basement - Yellow
                default: return Color.white;
            }
        }

        public void CollectKey()
        {
            if (isCollected) return;

            isCollected = true;
            isAnimating = true;

            // Start collection animation
            StartCoroutine(CollectionAnimation());

            // Collect key in game manager
            if (GameManager.Instance != null)
            {
                GameManager.Instance.CollectEnergyKey(keyIndex);
            }

            // Play collection sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayKeyCollected();
            }

            // Show collection feedback
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowFeedback($"{keyName} dikumpulkan!", true, 3f);
            }
        }

        private IEnumerator CollectionAnimation()
        {
            // Spawn collection effect
            if (collectionEffect != null)
            {
                GameObject effect = Instantiate(collectionEffect, transform.position, Quaternion.identity);
                Destroy(effect, 3f);
            }

            // Collection animation sequence
            float animationTime = 2f;
            float elapsedTime = 0f;

            Vector3 startPosition = transform.position;
            Vector3 endPosition = startPosition + Vector3.up * 5f; // Float upward
            Vector3 startScale = transform.localScale;
            Vector3 endScale = Vector3.zero;

            // Intense light effect
            if (keyLight != null)
            {
                keyLight.intensity = 3f;
            }

            // Intense aura effect
            if (keyAura != null)
            {
                var emission = keyAura.emission;
                emission.rateOverTime = 100f;
            }

            while (elapsedTime < animationTime)
            {
                float progress = elapsedTime / animationTime;
                float curveValue = collectionCurve.Evaluate(progress);

                // Move upward and shrink
                transform.position = Vector3.Lerp(startPosition, endPosition, curveValue);
                transform.localScale = Vector3.Lerp(startScale, endScale, progress);

                // Fade light
                if (keyLight != null)
                {
                    keyLight.intensity = Mathf.Lerp(3f, 0f, progress);
                }

                elapsedTime += Time.deltaTime;
                yield return null;
            }

            // Disable key object
            gameObject.SetActive(false);
        }

        // Trigger detection for automatic collection
        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player"))
            {
                CollectKey();
            }
        }

        // Manual collection method (for UI buttons)
        public void OnKeyClicked()
        {
            CollectKey();
        }

        // Static method to create energy key
        public static GameObject CreateEnergyKey(int index, Vector3 position, string name = "")
        {
            GameObject keyObj = new GameObject($"EnergyKey_{index}");
            keyObj.transform.position = position;

            EnergyKey keyScript = keyObj.AddComponent<EnergyKey>();
            keyScript.keyIndex = index;
            keyScript.keyName = string.IsNullOrEmpty(name) ? $"Kunci Energi {index + 1}" : name;

            // Add visual components
            GameObject keyModel = GameObject.CreatePrimitive(PrimitiveType.Cube);
            keyModel.transform.SetParent(keyObj.transform);
            keyModel.transform.localPosition = Vector3.zero;
            keyModel.transform.localScale = new Vector3(0.5f, 0.1f, 1f); // Key shape

            keyScript.keyModel = keyModel;

            // Add light
            GameObject lightObj = new GameObject("KeyLight");
            lightObj.transform.SetParent(keyObj.transform);
            lightObj.transform.localPosition = Vector3.zero;

            Light light = lightObj.AddComponent<Light>();
            light.type = LightType.Point;
            light.range = 3f;
            light.intensity = 1f;
            keyScript.keyLight = light;

            // Add particle system
            GameObject auraObj = new GameObject("KeyAura");
            auraObj.transform.SetParent(keyObj.transform);
            auraObj.transform.localPosition = Vector3.zero;

            ParticleSystem aura = auraObj.AddComponent<ParticleSystem>();
            var main = aura.main;
            main.startLifetime = 2f;
            main.startSpeed = 1f;
            main.maxParticles = 20;
            keyScript.keyAura = aura;

            // Add trigger collider
            SphereCollider trigger = keyObj.AddComponent<SphereCollider>();
            trigger.isTrigger = true;
            trigger.radius = 1.5f;

            return keyObj;
        }
    }

    // Energy Key Manager - manages all keys in the game
    public class EnergyKeyManager : MonoBehaviour
    {
        [Header("Key Spawn Locations")]
        public Transform[] keySpawnPoints;

        [Header("Key Prefabs")]
        public GameObject[] keyPrefabs;

        private GameObject[] spawnedKeys;

        private void Start()
        {
            SpawnAllKeys();
        }

        private void SpawnAllKeys()
        {
            if (keySpawnPoints == null || keySpawnPoints.Length == 0) return;

            spawnedKeys = new GameObject[keySpawnPoints.Length];

            for (int i = 0; i < keySpawnPoints.Length; i++)
            {
                if (keySpawnPoints[i] != null)
                {
                    // Use prefab if available, otherwise create procedurally
                    if (keyPrefabs != null && i < keyPrefabs.Length && keyPrefabs[i] != null)
                    {
                        spawnedKeys[i] = Instantiate(keyPrefabs[i], keySpawnPoints[i].position, Quaternion.identity);
                    }
                    else
                    {
                        spawnedKeys[i] = EnergyKey.CreateEnergyKey(i, keySpawnPoints[i].position);
                    }

                    // Set key index
                    EnergyKey keyScript = spawnedKeys[i].GetComponent<EnergyKey>();
                    if (keyScript != null)
                    {
                        keyScript.keyIndex = i;
                    }
                }
            }

            Debug.Log($"Spawned {spawnedKeys.Length} energy keys");
        }

        public void RespawnKey(int keyIndex)
        {
            if (keyIndex < 0 || keyIndex >= spawnedKeys.Length) return;

            if (spawnedKeys[keyIndex] != null)
            {
                Destroy(spawnedKeys[keyIndex]);
            }

            if (keySpawnPoints[keyIndex] != null)
            {
                spawnedKeys[keyIndex] = EnergyKey.CreateEnergyKey(keyIndex, keySpawnPoints[keyIndex].position);
            }
        }

        public void CollectAllKeys()
        {
            for (int i = 0; i < spawnedKeys.Length; i++)
            {
                if (spawnedKeys[i] != null)
                {
                    EnergyKey keyScript = spawnedKeys[i].GetComponent<EnergyKey>();
                    if (keyScript != null)
                    {
                        keyScript.CollectKey();
                    }
                }
            }
        }
    }
}