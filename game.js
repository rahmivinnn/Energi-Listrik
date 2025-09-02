// Global Three.js Setup
let scene, camera, renderer, controls;
let ambientLight, directionalLight;
let audioListener, backgroundMusic, audioLoader;
let currentScene = 'loading';
let sceneObjects = {};
let audioContext;
let sounds = {};
let isTransitioning = false;
let fadeElement = null;

// Texture loader and materials
let textureLoader;
let materials = {};

// Performance optimization variables
let performanceMonitor = {
    frameCount: 0,
    lastTime: 0,
    fps: 0,
    renderTime: 0
};
let frustumCullingUpdate = null;
let objectPools = {};
let lodObjects = [];

// Scene Management
const scenes = {
    opening: null,
    houseReveal: null,
    characterIntro: null,
    mainMenu: null,
    livingRoom: null,
    kitchen: null,
    lab: null,
    quiz: null,
    ending: null
};

// Game state variables
let gameState = {
    energyKeys: 0,
    currentLevel: 0,
    puzzlesSolved: [],
    score: 0,
    quizStarted: false,
    currentQuestionIndex: 0,
    quizQuestions: []
};

// Puzzle state
let puzzleState = {
    wiringComplete: false,
    tvPowered: false,
    kitchenEfficiency: 0,
    billAmount: 0,
    quizAnswers: []
};

// Initialize the game
function init() {
    try {
        console.log('Initializing game...');
        
        // Setup renderer with enhanced settings for cinematic quality
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000);
        
        // Enhanced shadow mapping for cinematic lighting
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.shadowMap.autoUpdate = true;
        
        // Enable tone mapping for realistic lighting
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        
        // Enable physically based rendering
        renderer.physicallyCorrectLights = true;
        
        const gameContainer = document.getElementById('gameContainer');
        if (!gameContainer) {
            throw new Error('gameContainer element not found!');
        }
        
        console.log('Adding renderer to gameContainer:', gameContainer);
        gameContainer.appendChild(renderer.domElement);
        console.log('Renderer canvas added:', renderer.domElement);
        console.log('Canvas size:', renderer.domElement.width, 'x', renderer.domElement.height);
        
        // Setup camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);
        
        // Setup audio listener
        audioListener = new THREE.AudioListener();
        camera.add(audioListener);
        
        // Setup audio loader
        audioLoader = new THREE.AudioLoader();
        
        // Initialize audio context (for web audio policy)
        initAudioSystem();
        
        // Setup controls (for debugging, disabled in production)
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enabled = false; // Disabled for production
        
        // Initialize textures and materials
        console.log('Initializing textures...');
        initTextures();
        
        // Initialize all scenes
        console.log('Initializing scenes...');
        initScenes();
        
        // Initialize performance optimizations
        initPerformanceOptimizations();
        
        // Setup fade overlay
        fadeElement = document.getElementById('fade-overlay');
        
        console.log('Game initialization complete');
        
        // Start with opening scene
        setTimeout(() => {
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            console.log('Starting opening scene...');
            startOpeningScene();
        }, 2000);
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
        
        // Start render loop
        animate();
        
    } catch (error) {
        console.error('Error during initialization:', error);
        alert('Error initializing game: ' + error.message);
    }
}

// Initialize audio system
function initAudioSystem() {
    // Create audio context for web browsers
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create placeholder sounds (in real implementation, load actual audio files)
        createPlaceholderSounds();
    } catch (error) {
        console.warn('Audio not supported:', error);
    }
}

// Create placeholder audio effects
function createPlaceholderSounds() {
    // Mystery background music
    sounds.mysteryMusic = createTone(220, 'sine', 0.1, 4); // Low A note
    sounds.thunderSound = createTone(80, 'sawtooth', 0.3, 1); // Thunder effect
    sounds.electricBuzz = createTone(440, 'square', 0.05, 0.5); // Electric buzz
    sounds.doorCreak = createTone(150, 'triangle', 0.2, 2); // Door creak
    sounds.adventureMusic = createTone(330, 'sine', 0.08, 3); // Adventure theme
}

// Create simple tone for placeholder audio
function createTone(frequency, type, volume, duration) {
    return {
        frequency: frequency,
        type: type,
        volume: volume,
        duration: duration,
        play: function() {
            if (!audioContext) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(this.frequency, audioContext.currentTime);
            oscillator.type = this.type;
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + this.duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + this.duration);
        }
    };
}

// Play background music for scene
function playSceneMusic(sceneType) {
    if (!audioContext) return;
    
    // Resume audio context if suspended (browser policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    switch(sceneType) {
        case 'opening':
        case 'houseReveal':
            sounds.mysteryMusic.play();
            setTimeout(() => sounds.thunderSound.play(), 2000);
            break;
        case 'characterIntro':
            sounds.adventureMusic.play();
            setTimeout(() => sounds.doorCreak.play(), 3000);
            break;
        case 'mainMenu':
            sounds.mysteryMusic.play();
            break;
    }
}

// Play sound effect
function playSoundEffect(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].play();
    }
}

// Initialize texture loader and create materials
function initTextures() {
    textureLoader = new THREE.TextureLoader();
    
    // Create procedural textures
    materials.brick = createBrickMaterial();
    materials.wood = createWoodMaterial();
    materials.grass = createGrassMaterial();
    materials.concrete = createConcreteMaterial();
    materials.roof = createRoofMaterial();
    materials.fabric = createFabricMaterial();
    materials.metal = createMetalMaterial();
    materials.glass = createGlassMaterial();
}

// Create brick texture material
function createBrickMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Create brick pattern
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.fillStyle = '#A0522D';
    for (let y = 0; y < 256; y += 32) {
        for (let x = 0; x < 256; x += 64) {
            const offsetX = (y / 32) % 2 === 0 ? 0 : 32;
            ctx.fillRect(x + offsetX, y, 60, 28);
        }
    }
    
    // Add mortar lines
    ctx.strokeStyle = '#D2B48C';
    ctx.lineWidth = 2;
    for (let y = 0; y <= 256; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    
    return new THREE.MeshLambertMaterial({
        map: texture,
        roughness: 0.8
    });
}

// Create wood texture material
function createWoodMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Create wood grain pattern
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.3, '#A0522D');
    gradient.addColorStop(0.6, '#8B4513');
    gradient.addColorStop(1, '#654321');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Add wood grain lines
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
        const y = Math.random() * 256;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y + Math.sin(i) * 10);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return new THREE.MeshLambertMaterial({
        map: texture,
        roughness: 0.7
    });
}

// Create grass texture material
function createGrassMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base grass color
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add grass texture
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const shade = Math.random() * 0.3;
        ctx.fillStyle = `rgb(${34 + shade * 100}, ${139 + shade * 50}, ${34 + shade * 100})`;
        ctx.fillRect(x, y, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    
    return new THREE.MeshLambertMaterial({
        map: texture,
        roughness: 0.9
    });
}

// Create concrete texture material
function createConcreteMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base concrete color
    ctx.fillStyle = '#696969';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add concrete texture
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const shade = Math.random() * 0.4 - 0.2;
        ctx.fillStyle = `rgb(${105 + shade * 100}, ${105 + shade * 100}, ${105 + shade * 100})`;
        ctx.fillRect(x, y, 3, 3);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return new THREE.MeshLambertMaterial({
        map: texture,
        roughness: 0.8
    });
}

// Create roof tile material
function createRoofMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base roof color
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add tile pattern
    ctx.fillStyle = '#A52A2A';
    for (let y = 0; y < 256; y += 16) {
        for (let x = 0; x < 256; x += 32) {
            const offsetX = (y / 16) % 2 === 0 ? 0 : 16;
            ctx.fillRect(x + offsetX, y, 30, 14);
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    return new THREE.MeshLambertMaterial({
        map: texture,
        roughness: 0.9
    });
}

// Create fabric material
function createFabricMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Base fabric color
    ctx.fillStyle = '#DC143C';
    ctx.fillRect(0, 0, 128, 128);
    
    // Add fabric weave pattern
    ctx.strokeStyle = '#B22222';
    ctx.lineWidth = 1;
    for (let i = 0; i < 128; i += 4) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 128);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(128, i);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return new THREE.MeshLambertMaterial({
        map: texture,
        roughness: 0.8
    });
}

// Create metal material
function createMetalMaterial() {
    return new THREE.MeshPhongMaterial({
        color: 0x708090,
        shininess: 100,
        reflectivity: 0.8
    });
}

// Create glass material
function createGlassMaterial() {
    return new THREE.MeshPhongMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.3,
        reflectivity: 0.9,
        shininess: 100
    });
}

// Enhanced lighting functions for cinematic effects
function createVolumetricLight(color, intensity, distance, position) {
    const light = new THREE.SpotLight(color, intensity, distance, Math.PI / 6, 0.5, 2);
    light.position.copy(position);
    light.castShadow = true;
    
    // Enhanced shadow settings for cinematic quality
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = distance;
    light.shadow.bias = -0.0001;
    light.shadow.radius = 4;
    
    return light;
}

function createAtmosphericFog(scene, color = 0x404040, near = 10, far = 100) {
    scene.fog = new THREE.Fog(color, near, far);
    return scene.fog;
}

function createGodRays(scene, sunPosition, intensity = 0.5) {
    // Create god rays effect using multiple spot lights
    const rayCount = 8;
    const rays = new THREE.Group();
    
    for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const rayLight = new THREE.SpotLight(0xFFFFAA, intensity * 0.3, 50, Math.PI / 12, 0.8, 1.5);
        
        rayLight.position.copy(sunPosition);
        rayLight.position.x += Math.cos(angle) * 2;
        rayLight.position.z += Math.sin(angle) * 2;
        
        const target = new THREE.Object3D();
        target.position.set(
            Math.cos(angle) * 20,
            -5,
            Math.sin(angle) * 20
        );
        
        scene.add(target);
        rayLight.target = target;
        
        rays.add(rayLight);
    }
    
    return rays;
}

// Enhanced landscape functions
// Performance optimization functions
function createLODSystem(object, distances = [10, 30, 60]) {
    const lod = new THREE.LOD();
    
    // High detail version (close)
    const highDetail = object.clone();
    lod.addLevel(highDetail, 0);
    
    // Medium detail version (medium distance)
    const mediumDetail = object.clone();
    mediumDetail.traverse(child => {
        if (child.isMesh && child.geometry) {
            // Reduce geometry complexity for medium detail
            if (child.geometry.attributes.position.count > 1000) {
                const simplified = child.geometry.clone();
                simplified.setIndex(null);
                child.geometry = simplified;
            }
        }
    });
    lod.addLevel(mediumDetail, distances[0]);
    
    // Low detail version (far distance)
    const lowDetail = object.clone();
    lowDetail.traverse(child => {
        if (child.isMesh && child.geometry) {
            // Further reduce complexity for low detail
            if (child.geometry.attributes.position.count > 500) {
                const simplified = child.geometry.clone();
                simplified.setIndex(null);
                child.geometry = simplified;
            }
        }
    });
    lod.addLevel(lowDetail, distances[1]);
    
    // Very low detail or billboard (very far)
    const billboard = new THREE.Sprite(new THREE.SpriteMaterial({
        map: textureLoader.load('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiM0Njc0NEEiLz4KPC9zdmc+'),
        color: 0x467A4A
    }));
    billboard.scale.set(2, 2, 1);
    lod.addLevel(billboard, distances[2]);
    
    return lod;
}

function createObjectPool(createFunction, initialSize = 10) {
    const pool = {
        objects: [],
        activeObjects: [],
        createFunction: createFunction,
        
        get: function() {
            let obj;
            if (this.objects.length > 0) {
                obj = this.objects.pop();
            } else {
                obj = this.createFunction();
            }
            this.activeObjects.push(obj);
            return obj;
        },
        
        release: function(obj) {
            const index = this.activeObjects.indexOf(obj);
            if (index > -1) {
                this.activeObjects.splice(index, 1);
                this.objects.push(obj);
                // Reset object state
                obj.position.set(0, 0, 0);
                obj.rotation.set(0, 0, 0);
                obj.scale.set(1, 1, 1);
                obj.visible = false;
            }
        },
        
        releaseAll: function() {
            while (this.activeObjects.length > 0) {
                this.release(this.activeObjects[0]);
            }
        }
    };
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
        pool.objects.push(createFunction());
    }
    
    return pool;
}

function optimizeGeometry(geometry) {
    // Compute vertex normals for smooth shading
    geometry.computeVertexNormals();
    
    // Compute bounding sphere for frustum culling
    geometry.computeBoundingSphere();
    
    return geometry;
}

function enableFrustumCulling(scene, camera) {
    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4();
    
    return function updateCulling() {
        matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(matrix);
        
        scene.traverse(object => {
            if (object.isMesh && object.geometry.boundingSphere) {
                object.visible = frustum.intersectsSphere(object.geometry.boundingSphere);
            }
        });
    };
}

function createDetailedTree(scale = 1, type = 'oak') {
    const treeGroup = new THREE.Group();
    
    // Create more realistic trunk with texture variation
    const trunkGeometry = new THREE.CylinderGeometry(
        0.3 * scale, 
        0.6 * scale, 
        8 * scale, 
        8
    );
    const trunkMaterial = materials.wood;
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(0, 4 * scale, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);
    
    // Create layered foliage for more realistic appearance
    const leafColors = {
        oak: [0x228B22, 0x32CD32, 0x006400],
        pine: [0x013220, 0x228B22, 0x006400],
        maple: [0xFF6347, 0xFF4500, 0x8B4513]
    };
    
    const colors = leafColors[type] || leafColors.oak;
    
    for (let i = 0; i < 3; i++) {
        const leavesGeometry = new THREE.SphereGeometry(
            (3 - i * 0.5) * scale, 
            12, 
            12
        );
        const leavesMaterial = new THREE.MeshLambertMaterial({ 
            color: colors[i % colors.length]
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(
            (Math.random() - 0.5) * 0.5 * scale,
            (8.5 + i * 0.8) * scale,
            (Math.random() - 0.5) * 0.5 * scale
        );
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        treeGroup.add(leaves);
    }
    
    // Add some branches
    for (let i = 0; i < 4; i++) {
        const branchGeometry = new THREE.CylinderGeometry(
            0.05 * scale, 
            0.1 * scale, 
            2 * scale
        );
        const branch = new THREE.Mesh(branchGeometry, trunkMaterial);
        const angle = (i / 4) * Math.PI * 2;
        branch.position.set(
            Math.cos(angle) * 1.5 * scale,
            6 * scale,
            Math.sin(angle) * 1.5 * scale
        );
        branch.rotation.z = Math.cos(angle) * 0.5;
        branch.rotation.x = Math.sin(angle) * 0.5;
        branch.castShadow = true;
        treeGroup.add(branch);
    }
    
    return treeGroup;
}

function createDetailedFence(length = 20, height = 2, scale = 1) {
    const fenceGroup = new THREE.Group();
    
    const postCount = Math.floor(length / 2) + 1;
    
    // Create fence posts
    for (let i = 0; i < postCount; i++) {
        const postGeometry = new THREE.BoxGeometry(
            0.2 * scale, 
            height * scale, 
            0.2 * scale
        );
        const post = new THREE.Mesh(postGeometry, materials.wood);
        post.position.set(
            (i * 2 - length / 2) * scale,
            height * scale / 2,
            0
        );
        post.castShadow = true;
        post.receiveShadow = true;
        fenceGroup.add(post);
    }
    
    // Create horizontal rails
    for (let rail = 0; rail < 3; rail++) {
        const railGeometry = new THREE.BoxGeometry(
            length * scale, 
            0.1 * scale, 
            0.15 * scale
        );
        const railMesh = new THREE.Mesh(railGeometry, materials.wood);
        railMesh.position.set(
            0,
            (0.5 + rail * 0.6) * height * scale,
            0
        );
        railMesh.castShadow = true;
        railMesh.receiveShadow = true;
        fenceGroup.add(railMesh);
    }
    
    return fenceGroup;
}

function createBushCluster(count = 5, scale = 1) {
    const clusterGroup = new THREE.Group();
    
    for (let i = 0; i < count; i++) {
        const bushGeometry = new THREE.SphereGeometry(
            (0.8 + Math.random() * 0.4) * scale,
            8,
            6
        );
        const bushMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22 
        });
        const bush = new THREE.Mesh(bushGeometry, bushMaterial);
        
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const radius = Math.random() * 2 * scale;
        
        bush.position.set(
            Math.cos(angle) * radius,
            (0.8 + Math.random() * 0.4) * scale,
            Math.sin(angle) * radius
        );
        bush.scale.y = 0.6 + Math.random() * 0.4;
        bush.castShadow = true;
        bush.receiveShadow = true;
        
        clusterGroup.add(bush);
    }
    
    return clusterGroup;
}

function createFlowerPatch(count = 10, scale = 1) {
    const patchGroup = new THREE.Group();
    
    const flowerColors = [0xFF69B4, 0xFF1493, 0xFFFFE0, 0x9370DB, 0xFF6347];
    
    for (let i = 0; i < count; i++) {
        const stemGeometry = new THREE.CylinderGeometry(
            0.02 * scale,
            0.02 * scale,
            0.5 * scale
        );
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        
        const flowerGeometry = new THREE.SphereGeometry(0.1 * scale, 6, 6);
        const flowerMaterial = new THREE.MeshLambertMaterial({ 
            color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
        });
        const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
        
        const x = (Math.random() - 0.5) * 4 * scale;
        const z = (Math.random() - 0.5) * 4 * scale;
        
        stem.position.set(x, 0.25 * scale, z);
        flower.position.set(x, 0.5 * scale, z);
        
        patchGroup.add(stem);
        patchGroup.add(flower);
    }
    
    return patchGroup;
}

function createRock(scale = 1) {
    const rockGeometry = new THREE.DodecahedronGeometry(scale);
    const rockMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x696969,
        roughness: 0.9
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    
    // Random rotation and slight scaling variation
    rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    rock.scale.set(
        0.8 + Math.random() * 0.4,
        0.6 + Math.random() * 0.3,
        0.8 + Math.random() * 0.4
    );
    
    rock.castShadow = true;
    rock.receiveShadow = true;
    
    return rock;
}

// Initialize all scenes
function initScenes() {
    scenes.opening = createOpeningScene();
    scenes.houseReveal = createHouseRevealScene();
    scenes.characterIntro = createCharacterIntroScene();
    scenes.mainMenu = createMainMenuScene();
    scenes.livingRoom = createLivingRoomScene();
    scenes.kitchen = createKitchenScene();
    scenes.lab = createLabScene();
    scenes.quiz = createQuizScene();
    scenes.ending = createEndingScene();
}

function initPerformanceOptimizations() {
    // Initialize object pools for commonly used objects
    objectPools.trees = createObjectPool(() => createDetailedTree(1, 'oak'), 5);
    objectPools.bushes = createObjectPool(() => createBushCluster(3, 0.8), 3);
    objectPools.flowers = createObjectPool(() => createFlowerPatch(6, 0.6), 3);
    objectPools.rocks = createObjectPool(() => createRock(0.5), 8);
    
    // Initialize performance monitor
    performanceMonitor.lastTime = performance.now();
    
    // Optimize existing geometries in all scenes
    Object.values(scenes).forEach(scene => {
        if (scene) {
            scene.traverse(object => {
                if (object.isMesh && object.geometry) {
                    optimizeGeometry(object.geometry);
                }
            });
        }
    });
    
    console.log('Performance optimizations initialized');
}

// Create realistic house model
function createRealisticHouse(scale = 1, position = { x: 0, y: 0, z: 0 }) {
    const houseGroup = new THREE.Group();
    
    // Foundation
    const foundationGeometry = new THREE.BoxGeometry(10 * scale, 0.5 * scale, 8 * scale);
    const foundationMaterial = materials.concrete;
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.set(0, 0.25 * scale, 0);
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    houseGroup.add(foundation);
    
    // Main house structure
    const houseGeometry = new THREE.BoxGeometry(9 * scale, 6 * scale, 7 * scale);
    const houseMaterial = materials.brick;
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.set(0, 3.5 * scale, 0);
    house.castShadow = true;
    house.receiveShadow = true;
    houseGroup.add(house);
    
    // Roof structure with realistic shape
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-5.5 * scale, 0);
    roofShape.lineTo(5.5 * scale, 0);
    roofShape.lineTo(4.5 * scale, 2.5 * scale);
    roofShape.lineTo(-4.5 * scale, 2.5 * scale);
    roofShape.lineTo(-5.5 * scale, 0);
    
    const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
        depth: 8 * scale,
        bevelEnabled: false
    });
    const roofMaterial = materials.roof;
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 6.5 * scale, -4 * scale);
    roof.rotation.x = -Math.PI / 2;
    roof.castShadow = true;
    houseGroup.add(roof);
    
    // Chimney
    const chimneyGeometry = new THREE.BoxGeometry(0.8 * scale, 3 * scale, 0.8 * scale);
    const chimneyMaterial = materials.brick;
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(2 * scale, 8.5 * scale, -1 * scale);
    chimney.castShadow = true;
    houseGroup.add(chimney);
    
    // Front door with frame
    const doorFrameGeometry = new THREE.BoxGeometry(2.2 * scale, 4.2 * scale, 0.2 * scale);
    const doorFrameMaterial = materials.wood;
    const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
    doorFrame.position.set(0, 2.6 * scale, 3.6 * scale);
    houseGroup.add(doorFrame);
    
    const doorGeometry = new THREE.BoxGeometry(2 * scale, 4 * scale, 0.15 * scale);
    const doorMaterial = materials.wood;
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2.5 * scale, 3.65 * scale);
    houseGroup.add(door);
    
    // Door handle
    const handleGeometry = new THREE.SphereGeometry(0.1 * scale);
    const handleMaterial = materials.metal;
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0.7 * scale, 2.5 * scale, 3.7 * scale);
    houseGroup.add(handle);
    
    // Windows with detailed frames
    const windows = [];
    const windowPositions = [
        { x: -2.5 * scale, y: 3.5 * scale, z: 3.6 * scale },
        { x: 2.5 * scale, y: 3.5 * scale, z: 3.6 * scale },
        { x: -4.6 * scale, y: 3.5 * scale, z: 0 },
        { x: 4.6 * scale, y: 3.5 * scale, z: 0 }
    ];
    
    windowPositions.forEach((pos, index) => {
        // Window frame
        const frameGeometry = new THREE.BoxGeometry(1.8 * scale, 1.8 * scale, 0.2 * scale);
        const frameMaterial = materials.wood;
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(pos.x, pos.y, pos.z);
        
        if (index >= 2) { // Side windows
            frame.rotation.y = pos.x > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
        
        houseGroup.add(frame);
        
        // Window glass
        const glassGeometry = new THREE.PlaneGeometry(1.6 * scale, 1.6 * scale);
        const glassMaterial = materials.glass;
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.set(pos.x, pos.y, pos.z + 0.05 * scale);
        
        if (index >= 2) {
            glass.rotation.y = pos.x > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
        
        houseGroup.add(glass);
        windows.push(glass);
        
        // Window cross pattern
        const crossMaterial = materials.wood;
        
        // Vertical cross
        const vCrossGeometry = new THREE.BoxGeometry(0.05 * scale, 1.6 * scale, 0.05 * scale);
        const vCross = new THREE.Mesh(vCrossGeometry, crossMaterial);
        vCross.position.copy(glass.position);
        vCross.position.z += 0.02 * scale;
        if (index >= 2) {
            vCross.rotation.y = glass.rotation.y;
        }
        houseGroup.add(vCross);
        
        // Horizontal cross
        const hCrossGeometry = new THREE.BoxGeometry(1.6 * scale, 0.05 * scale, 0.05 * scale);
        const hCross = new THREE.Mesh(hCrossGeometry, crossMaterial);
        hCross.position.copy(glass.position);
        hCross.position.z += 0.02 * scale;
        if (index >= 2) {
            hCross.rotation.y = glass.rotation.y;
        }
        houseGroup.add(hCross);
    });
    
    // Porch/entrance steps
    for (let i = 0; i < 3; i++) {
        const stepGeometry = new THREE.BoxGeometry(3 * scale, 0.2 * scale, 0.8 * scale);
        const stepMaterial = materials.concrete;
        const step = new THREE.Mesh(stepGeometry, stepMaterial);
        step.position.set(0, 0.1 * scale + i * 0.2 * scale, 2.8 * scale + i * 0.3 * scale);
        step.castShadow = true;
        step.receiveShadow = true;
        houseGroup.add(step);
    }
    
    // Gutters
    const gutterGeometry = new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 9 * scale);
    const gutterMaterial = materials.metal;
    
    const gutter1 = new THREE.Mesh(gutterGeometry, gutterMaterial);
    gutter1.position.set(0, 6.3 * scale, 3.5 * scale);
    gutter1.rotation.z = Math.PI / 2;
    houseGroup.add(gutter1);
    
    const gutter2 = new THREE.Mesh(gutterGeometry, gutterMaterial);
    gutter2.position.set(0, 6.3 * scale, -3.5 * scale);
    gutter2.rotation.z = Math.PI / 2;
    houseGroup.add(gutter2);
    
    // Position the entire house
    houseGroup.position.set(position.x, position.y, position.z);
    
    return { group: houseGroup, windows: windows };
}

// SCREEN 1 - Opening Scene: Berita Misteri
function createOpeningScene() {
    const openingScene = new THREE.Scene();
    
    // Add atmospheric fog for cinematic depth
    createAtmosphericFog(openingScene, 0x000033, 20, 80);
    
    // Setup enhanced cinematic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.15);
    openingScene.add(ambientLight);
    
    // Enhanced moonlight with volumetric effects
    const moonLight = new THREE.DirectionalLight(0x9999FF, 0.8);
    moonLight.position.set(-10, 15, 5);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 4096;
    moonLight.shadow.mapSize.height = 4096;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 50;
    moonLight.shadow.camera.left = -25;
    moonLight.shadow.camera.right = 25;
    moonLight.shadow.camera.top = 25;
    moonLight.shadow.camera.bottom = -25;
    moonLight.shadow.bias = -0.0001;
    moonLight.shadow.radius = 6;
    openingScene.add(moonLight);
    
    // Add volumetric street light
    const streetLight = createVolumetricLight(
        0xFFAA44, 
        2, 
        30, 
        new THREE.Vector3(8, 12, -5)
    );
    streetLight.target.position.set(0, 0, -10);
    openingScene.add(streetLight);
    openingScene.add(streetLight.target);
    
    // Create night sky with stars
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x000033,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    openingScene.add(sky);
    
    // Add stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 1000;
        starPositions[i + 1] = Math.random() * 200 + 50;
        starPositions[i + 2] = (Math.random() - 0.5) * 1000;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ 
        color: 0xFFFFFF,
        size: 2,
        sizeAttenuation: false
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    openingScene.add(stars);
    
    // Create realistic ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = materials.grass;
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    openingScene.add(ground);
    
    // Add some dark silhouette trees for night atmosphere
    const nightTreePositions = [
        { x: -25, z: -15, type: 'pine' },
        { x: 30, z: -10, type: 'oak' },
        { x: -20, z: 10, type: 'maple' },
        { x: 25, z: 15, type: 'pine' },
        { x: -35, z: 0, type: 'oak' }
    ];
    
    nightTreePositions.forEach(pos => {
        const tree = createDetailedTree(1.2 + Math.random() * 0.6, pos.type);
        tree.position.set(pos.x, 0, pos.z);
        // Make trees darker for night atmosphere
        tree.traverse(child => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
                child.material.color.multiplyScalar(0.3);
            }
        });
        openingScene.add(tree);
    });
    
    // Add some bushes around the scene
    const bushCluster1 = createBushCluster(3, 0.8);
    bushCluster1.position.set(-15, 0, 5);
    bushCluster1.traverse(child => {
        if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.color.multiplyScalar(0.4);
        }
    });
    openingScene.add(bushCluster1);
    
    const bushCluster2 = createBushCluster(2, 0.6);
    bushCluster2.position.set(18, 0, -5);
    bushCluster2.traverse(child => {
        if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.color.multiplyScalar(0.4);
        }
    });
    openingScene.add(bushCluster2);
    
    // Create realistic house
    const houseData = createRealisticHouse(1, { x: 0, y: 0, z: -20 });
    const houseGroup = houseData.group;
    const windows = houseData.windows;
    
    openingScene.add(houseGroup);
    
    // TV glow effect from first window
    const tvLight = new THREE.PointLight(0x00BFFF, 3, 15);
    tvLight.position.set(-2.5, 4, -16);
    tvLight.castShadow = true;
    openingScene.add(tvLight);
    
    // Flickering TV light animation
    const tvFlicker = () => {
        tvLight.intensity = 2 + Math.random() * 2;
        setTimeout(tvFlicker, 100 + Math.random() * 200);
    };
    tvFlicker();
    
    // Store references
    openingScene.userData = {
        house: houseGroup,
        tvLight: tvLight,
        windows: windows,
        stars: stars
    };
    
    return openingScene;
}

// Create detailed furniture for interior
function createFurniture() {
    const furniture = new THREE.Group();
    
    // Living room sofa
    const sofaGeometry = new THREE.BoxGeometry(4, 1.5, 1.8);
    const sofaMaterial = materials.wood;
    const sofa = new THREE.Mesh(sofaGeometry, sofaMaterial);
    sofa.position.set(-2, 0.75, -2);
    furniture.add(sofa);
    
    // Sofa cushions
    for (let i = 0; i < 3; i++) {
        const cushionGeometry = new THREE.BoxGeometry(1.2, 0.3, 1.5);
        const cushionMaterial = materials.fabric;
        const cushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
        cushion.position.set(-3 + i * 1.3, 1.65, -2);
        furniture.add(cushion);
    }
    
    // Coffee table
    const tableGeometry = new THREE.BoxGeometry(2.5, 0.2, 1.5);
    const tableMaterial = materials.wood;
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(-2, 1, 0.5);
    furniture.add(table);
    
    // Table legs
    for (let i = 0; i < 4; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8);
        const legMaterial = materials.wood;
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        const x = i % 2 === 0 ? -3 : -1;
        const z = i < 2 ? 0 : 1;
        leg.position.set(x, 0.5, z);
        furniture.add(leg);
    }
    
    // TV and TV stand
    const tvStandGeometry = new THREE.BoxGeometry(3, 1, 1);
    const tvStandMaterial = materials.wood;
    const tvStand = new THREE.Mesh(tvStandGeometry, tvStandMaterial);
    tvStand.position.set(2, 0.5, -4.5);
    furniture.add(tvStand);
    
    const tvGeometry = new THREE.BoxGeometry(2.5, 1.5, 0.2);
    const tvMaterial = new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 100 });
    const tv = new THREE.Mesh(tvGeometry, tvMaterial);
    tv.position.set(2, 1.75, -4.4);
    furniture.add(tv);
    
    // TV screen
    const screenGeometry = new THREE.PlaneGeometry(2.2, 1.2);
    const screenMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x0066FF,
        emissive: 0x003366
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(2, 1.75, -4.35);
    furniture.add(screen);
    
    // Dining table
    const diningTableGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1);
    const diningTableMaterial = materials.wood;
    const diningTable = new THREE.Mesh(diningTableGeometry, diningTableMaterial);
    diningTable.position.set(3, 1.5, 2);
    furniture.add(diningTable);
    
    // Dining table leg
    const diningLegGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.4);
    const diningLegMaterial = materials.wood;
    const diningLeg = new THREE.Mesh(diningLegGeometry, diningLegMaterial);
    diningLeg.position.set(3, 0.75, 2);
    furniture.add(diningLeg);
    
    // Chairs around dining table
    for (let i = 0; i < 4; i++) {
        const chairGroup = new THREE.Group();
        
        // Chair seat
        const seatGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.8);
        const seatMaterial = materials.wood;
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(0, 0.9, 0);
        chairGroup.add(seat);
        
        // Chair back
        const backGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.1);
        const backMaterial = materials.wood;
        const back = new THREE.Mesh(backGeometry, backMaterial);
        back.position.set(0, 1.5, -0.35);
        chairGroup.add(back);
        
        // Chair legs
        for (let j = 0; j < 4; j++) {
            const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.8);
            const legMaterial = materials.wood;
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            const legX = j % 2 === 0 ? -0.3 : 0.3;
            const legZ = j < 2 ? -0.3 : 0.3;
            leg.position.set(legX, 0.45, legZ);
            chairGroup.add(leg);
        }
        
        const angle = (i * Math.PI) / 2;
        const radius = 2.5;
        chairGroup.position.set(
            3 + Math.cos(angle) * radius,
            0,
            2 + Math.sin(angle) * radius
        );
        chairGroup.rotation.y = angle + Math.PI;
        furniture.add(chairGroup);
    }
    
    // Bookshelf
    const shelfGeometry = new THREE.BoxGeometry(0.4, 4, 2);
    const shelfMaterial = materials.wood;
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.set(-4.5, 2, 3);
    furniture.add(shelf);
    
    // Books on shelf
    for (let i = 0; i < 8; i++) {
        const bookGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.05);
        const bookColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFA500, 0x800080];
        const bookMaterial = new THREE.MeshLambertMaterial({ color: bookColors[i] });
        const book = new THREE.Mesh(bookGeometry, bookMaterial);
        book.position.set(-4.3, 1 + (i % 4) * 0.5, 2.5 + Math.floor(i / 4) * 0.8);
        furniture.add(book);
    }
    
    return furniture;
}

// SCREEN 2 - House Reveal Scene
function createHouseRevealScene() {
    const houseScene = new THREE.Scene();
    
    // Add atmospheric fog for depth
    createAtmosphericFog(houseScene, 0x87CEEB, 50, 150);
    
    // Setup enhanced cinematic daytime lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    houseScene.add(ambientLight);
    
    // Enhanced sun light with god rays
    const sunLight = new THREE.DirectionalLight(0xFFFFE0, 1.5);
    sunLight.position.set(15, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -35;
    sunLight.shadow.camera.right = 35;
    sunLight.shadow.camera.top = 35;
    sunLight.shadow.camera.bottom = -35;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.radius = 8;
    houseScene.add(sunLight);
    
    // Add god rays effect
    const godRays = createGodRays(houseScene, sunLight.position, 0.3);
    houseScene.add(godRays);
    
    // Create realistic day sky with clouds
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    houseScene.add(sky);
    
    // Add clouds
    for (let i = 0; i < 20; i++) {
        const cloudGeometry = new THREE.SphereGeometry(Math.random() * 10 + 5, 8, 8);
        const cloudMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.8
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(
            (Math.random() - 0.5) * 400,
            Math.random() * 50 + 100,
            (Math.random() - 0.5) * 400
        );
        houseScene.add(cloud);
    }
    
    // Create realistic ground with grass texture
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = materials.grass;
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    houseScene.add(ground);
    
    // Create detailed house with interior visible
    const houseData = createRealisticHouse(1.5, { x: 0, y: 0, z: -10 });
    const houseGroup = houseData.group;
    const windows = houseData.windows;
    
    // Make windows more transparent to show interior
    windows.forEach(window => {
        window.material.opacity = 0.3;
        window.material.transparent = true;
    });
    
    houseScene.add(houseGroup);
    
    // Add interior furniture
    const furniture = createFurniture();
    furniture.position.set(0, 1, -10);
    furniture.scale.set(1.5, 1.5, 1.5);
    houseScene.add(furniture);
    
    // Interior lighting
    const interiorLight1 = new THREE.PointLight(0xFFFF88, 2, 25);
    interiorLight1.position.set(-3, 6, -8);
    interiorLight1.castShadow = true;
    houseScene.add(interiorLight1);
    
    const interiorLight2 = new THREE.PointLight(0xFFFF88, 1.5, 20);
    interiorLight2.position.set(3, 6, -12);
    interiorLight2.castShadow = true;
    houseScene.add(interiorLight2);
    
    // TV screen glow
    const tvGlow = new THREE.PointLight(0x0066FF, 1, 8);
    tvGlow.position.set(3, 4, -7);
    houseScene.add(tvGlow);
    
    // Add detailed trees around the house
    const treeTypes = ['oak', 'pine', 'maple'];
    for (let i = 0; i < 8; i++) {
        const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
        const tree = createDetailedTree(1 + Math.random() * 0.5, treeType);
        
        const angle = (i * Math.PI) / 4;
        const radius = 25 + Math.random() * 15;
        tree.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius - 10
        );
        
        houseScene.add(tree);
    }
    
    // Add decorative fence around property
    const frontFence = createDetailedFence(30, 1.5, 1);
    frontFence.position.set(0, 0, 15);
    houseScene.add(frontFence);
    
    const leftFence = createDetailedFence(25, 1.5, 1);
    leftFence.rotation.y = Math.PI / 2;
    leftFence.position.set(-20, 0, 0);
    houseScene.add(leftFence);
    
    const rightFence = createDetailedFence(25, 1.5, 1);
    rightFence.rotation.y = Math.PI / 2;
    rightFence.position.set(20, 0, 0);
    houseScene.add(rightFence);
    
    // Add bush clusters for landscaping
    for (let i = 0; i < 4; i++) {
        const bushCluster = createBushCluster(3 + Math.random() * 3, 0.8);
        const angle = (i * Math.PI) / 2;
        const radius = 12 + Math.random() * 8;
        bushCluster.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius - 5
        );
        houseScene.add(bushCluster);
    }
    
    // Add flower patches near the house
    for (let i = 0; i < 3; i++) {
        const flowerPatch = createFlowerPatch(8 + Math.random() * 5, 0.8);
        flowerPatch.position.set(
            (Math.random() - 0.5) * 15,
            0,
            -5 + Math.random() * 8
        );
        houseScene.add(flowerPatch);
    }
    
    // Add decorative rocks
    for (let i = 0; i < 6; i++) {
        const rock = createRock(0.5 + Math.random() * 0.8);
        rock.position.set(
            (Math.random() - 0.5) * 40,
            0,
            (Math.random() - 0.5) * 40
        );
        houseScene.add(rock);
    }
    
    // Store references
    houseScene.userData = {
        house: houseGroup,
        furniture: furniture,
        interiorLights: [interiorLight1, interiorLight2],
        tvGlow: tvGlow,
        windows: windows
    };
    
    return houseScene;
}

// Create realistic student character
function createRealisticStudent() {
    const studentGroup = new THREE.Group();
    
    // Head with better proportions
    const headGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const headMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xFFDBB5,
        roughness: 0.8
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 6.8, 0);
    head.castShadow = true;
    head.receiveShadow = true;
    studentGroup.add(head);
    
    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.6);
    const neckMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB5 });
    const neck = new THREE.Mesh(neckGeometry, neckMaterial);
    neck.position.set(0, 6, 0);
    neck.castShadow = true;
    studentGroup.add(neck);
    
    // Torso (more realistic shape)
    const torsoGeometry = new THREE.BoxGeometry(1.6, 2.2, 0.8);
    const torsoMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.set(0, 4.6, 0);
    torso.castShadow = true;
    torso.receiveShadow = true;
    studentGroup.add(torso);
    
    // School uniform details
    const collarGeometry = new THREE.BoxGeometry(1.7, 0.3, 0.85);
    const collarMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const collar = new THREE.Mesh(collarGeometry, collarMaterial);
    collar.position.set(0, 5.5, 0);
    studentGroup.add(collar);
    
    // School tie
    const tieGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.05);
    const tieMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
    const tie = new THREE.Mesh(tieGeometry, tieMaterial);
    tie.position.set(0, 4.8, 0.42);
    studentGroup.add(tie);
    
    // Arms with joints
    const upperArmGeometry = new THREE.CylinderGeometry(0.25, 0.3, 1.2);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB5 });
    
    // Left upper arm
    const leftUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
    leftUpperArm.position.set(-1.2, 5.2, 0);
    leftUpperArm.castShadow = true;
    studentGroup.add(leftUpperArm);
    
    // Right upper arm
    const rightUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
    rightUpperArm.position.set(1.2, 5.2, 0);
    rightUpperArm.castShadow = true;
    studentGroup.add(rightUpperArm);
    
    // Forearms
    const forearmGeometry = new THREE.CylinderGeometry(0.2, 0.25, 1.1);
    
    const leftForearm = new THREE.Mesh(forearmGeometry, armMaterial);
    leftForearm.position.set(-1.2, 3.8, 0);
    leftForearm.castShadow = true;
    studentGroup.add(leftForearm);
    
    const rightForearm = new THREE.Mesh(forearmGeometry, armMaterial);
    rightForearm.position.set(1.2, 3.8, 0);
    rightForearm.castShadow = true;
    studentGroup.add(rightForearm);
    
    // Hands
    const handGeometry = new THREE.SphereGeometry(0.18, 16, 16);
    
    const leftHand = new THREE.Mesh(handGeometry, armMaterial);
    leftHand.position.set(-1.2, 3.1, 0);
    leftHand.castShadow = true;
    studentGroup.add(leftHand);
    
    const rightHand = new THREE.Mesh(handGeometry, armMaterial);
    rightHand.position.set(1.2, 3.1, 0);
    rightHand.castShadow = true;
    studentGroup.add(rightHand);
    
    // Legs with better proportions
    const thighGeometry = new THREE.CylinderGeometry(0.35, 0.4, 1.8);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x000080 });
    
    // Left thigh
    const leftThigh = new THREE.Mesh(thighGeometry, legMaterial);
    leftThigh.position.set(-0.4, 2.6, 0);
    leftThigh.castShadow = true;
    studentGroup.add(leftThigh);
    
    // Right thigh
    const rightThigh = new THREE.Mesh(thighGeometry, legMaterial);
    rightThigh.position.set(0.4, 2.6, 0);
    rightThigh.castShadow = true;
    studentGroup.add(rightThigh);
    
    // Shins
    const shinGeometry = new THREE.CylinderGeometry(0.25, 0.3, 1.6);
    
    const leftShin = new THREE.Mesh(shinGeometry, legMaterial);
    leftShin.position.set(-0.4, 0.9, 0);
    leftShin.castShadow = true;
    studentGroup.add(leftShin);
    
    const rightShin = new THREE.Mesh(shinGeometry, legMaterial);
    rightShin.position.set(0.4, 0.9, 0);
    rightShin.castShadow = true;
    studentGroup.add(rightShin);
    
    // Shoes
    const shoeGeometry = new THREE.BoxGeometry(0.6, 0.3, 1.2);
    const shoeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    
    const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    leftShoe.position.set(-0.4, 0.15, 0.2);
    leftShoe.castShadow = true;
    studentGroup.add(leftShoe);
    
    const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    rightShoe.position.set(0.4, 0.15, 0.2);
    rightShoe.castShadow = true;
    studentGroup.add(rightShoe);
    
    // Realistic hair with texture
    const hairGeometry = new THREE.SphereGeometry(0.85, 32, 32);
    const hairMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x2F2F2F,
        roughness: 0.9
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.set(0, 7.2, -0.1);
    hair.scale.set(1.1, 0.9, 1);
    hair.castShadow = true;
    studentGroup.add(hair);
    
    // Hair bangs
    const bangsGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const bangs = new THREE.Mesh(bangsGeometry, hairMaterial);
    bangs.position.set(0, 7.3, 0.6);
    bangs.scale.set(1.5, 0.6, 0.8);
    studentGroup.add(bangs);
    
    // Detailed eyes
    const eyeWhiteGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    leftEyeWhite.position.set(-0.25, 6.9, 0.75);
    leftEyeWhite.scale.set(0.8, 1, 0.5);
    studentGroup.add(leftEyeWhite);
    
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    rightEyeWhite.position.set(0.25, 6.9, 0.75);
    rightEyeWhite.scale.set(0.8, 1, 0.5);
    studentGroup.add(rightEyeWhite);
    
    // Eye pupils
    const pupilGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.25, 6.9, 0.8);
    studentGroup.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.25, 6.9, 0.8);
    studentGroup.add(rightPupil);
    
    // Eyebrows
    const eyebrowGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.1);
    const eyebrowMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
    
    const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    leftEyebrow.position.set(-0.25, 7.1, 0.75);
    studentGroup.add(leftEyebrow);
    
    const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    rightEyebrow.position.set(0.25, 7.1, 0.75);
    studentGroup.add(rightEyebrow);
    
    // Nose
    const noseGeometry = new THREE.ConeGeometry(0.08, 0.2, 8);
    const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB5 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 6.7, 0.8);
    nose.rotation.x = Math.PI;
    studentGroup.add(nose);
    
    // Mouth
    const mouthGeometry = new THREE.SphereGeometry(0.15, 16, 8);
    const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B6B });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 6.4, 0.75);
    mouth.scale.set(1, 0.3, 0.5);
    studentGroup.add(mouth);
    
    // Realistic backpack
    const backpackMainGeometry = new THREE.BoxGeometry(1.2, 1.8, 0.6);
    const backpackMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
    const backpackMain = new THREE.Mesh(backpackMainGeometry, backpackMaterial);
    backpackMain.position.set(0, 4.8, -0.7);
    backpackMain.castShadow = true;
    studentGroup.add(backpackMain);
    
    // Backpack straps
    const strapGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2);
    const strapMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    
    const leftStrap = new THREE.Mesh(strapGeometry, strapMaterial);
    leftStrap.position.set(-0.4, 5.2, -0.3);
    leftStrap.rotation.x = Math.PI / 6;
    studentGroup.add(leftStrap);
    
    const rightStrap = new THREE.Mesh(strapGeometry, strapMaterial);
    rightStrap.position.set(0.4, 5.2, -0.3);
    rightStrap.rotation.x = Math.PI / 6;
    studentGroup.add(rightStrap);
    
    // Backpack pocket
    const pocketGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.1);
    const pocket = new THREE.Mesh(pocketGeometry, backpackMaterial);
    pocket.position.set(0, 4.2, -0.35);
    studentGroup.add(pocket);
    
    // Store animation references
    studentGroup.userData = {
        leftUpperArm: leftUpperArm,
        rightUpperArm: rightUpperArm,
        leftForearm: leftForearm,
        rightForearm: rightForearm,
        leftThigh: leftThigh,
        rightThigh: rightThigh,
        head: head,
        torso: torso
    };
    
    return studentGroup;
}

// SCREEN 3 - Character Intro Scene
function createCharacterIntroScene() {
    const introScene = new THREE.Scene();
    
    // Add atmospheric fog for cinematic depth
    createAtmosphericFog(introScene, 0x87CEEB, 30, 120);
    
    // Setup enhanced cinematic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    introScene.add(ambientLight);
    
    // Enhanced main light with better shadows
    const mainLight = new THREE.DirectionalLight(0xFFFFE0, 1.8);
    mainLight.position.set(8, 12, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -20;
    mainLight.shadow.camera.right = 20;
    mainLight.shadow.camera.top = 20;
    mainLight.shadow.camera.bottom = -20;
    mainLight.shadow.bias = -0.0001;
    mainLight.shadow.radius = 6;
    introScene.add(mainLight);
    
    // Enhanced rim lighting for character
    const rimLight = new THREE.DirectionalLight(0x9999FF, 1.0);
    rimLight.position.set(-5, 8, -3);
    rimLight.castShadow = true;
    rimLight.shadow.mapSize.width = 2048;
    rimLight.shadow.mapSize.height = 2048;
    introScene.add(rimLight);
    
    // Add volumetric lighting for atmosphere
    const volumetricLight = createVolumetricLight(0xFFE4B5, 0.4, 25, new THREE.Vector3(5, 10, 3));
    introScene.add(volumetricLight);
    
    // Create realistic sky
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    introScene.add(sky);
    
    // Create realistic student character
    const student = createRealisticStudent();
    student.position.set(0, 0, 2);
    introScene.add(student);
    
    // Create detailed ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = materials.grass;
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    introScene.add(ground);
    
    // Gate
    const gateGeometry = new THREE.BoxGeometry(0.2, 4, 8);
    const gateMaterial = materials.wood;
    const gate = new THREE.Mesh(gateGeometry, gateMaterial);
    gate.position.set(0, 2, -5);
    introScene.add(gate);
    
    // House in background
    const houseGeometry = new THREE.BoxGeometry(10, 8, 8);
    const houseMaterial = materials.brick;
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.set(0, 4, -15);
    introScene.add(house);
    
    // Glowing door
    const doorGeometry = new THREE.PlaneGeometry(2, 4);
    const doorMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 4, -10.9);
    introScene.add(door);
    
    // Add some environmental details
    // School building in background
    const schoolGeometry = new THREE.BoxGeometry(20, 12, 8);
    const schoolMaterial = materials.concrete;
    const school = new THREE.Mesh(schoolGeometry, schoolMaterial);
    school.position.set(0, 6, -25);
    school.castShadow = true;
    school.receiveShadow = true;
    introScene.add(school);
    
    // School windows
    for (let i = 0; i < 6; i++) {
        const windowGeometry = new THREE.PlaneGeometry(2, 2.5);
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.7
        });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(-7.5 + i * 2.5, 7, -20.9);
        introScene.add(window);
    }
    
    // Enhanced trees around the scene
    const positions = [
        { x: -15, z: -10, type: 'oak' },
        { x: 15, z: -8, type: 'pine' },
        { x: -12, z: 12, type: 'maple' },
        { x: 18, z: 15, type: 'oak' },
        { x: -20, z: 5, type: 'pine' },
        { x: 22, z: -15, type: 'maple' }
    ];
    
    positions.forEach(pos => {
        const tree = createDetailedTree(0.8 + Math.random() * 0.4, pos.type);
        tree.position.set(pos.x, 0, pos.z);
        introScene.add(tree);
    });
    
    // Add garden fence near the house
    const gardenFence = createDetailedFence(12, 1.2, 0.8);
    gardenFence.position.set(0, 0, -8);
    introScene.add(gardenFence);
    
    // Add landscaping around the character area
    const bushCluster1 = createBushCluster(4, 0.6);
    bushCluster1.position.set(-8, 0, 8);
    introScene.add(bushCluster1);
    
    const bushCluster2 = createBushCluster(3, 0.7);
    bushCluster2.position.set(10, 0, 6);
    introScene.add(bushCluster2);
    
    // Add flower patches for color
    const flowerPatch1 = createFlowerPatch(6, 0.6);
    flowerPatch1.position.set(-5, 0, 3);
    introScene.add(flowerPatch1);
    
    const flowerPatch2 = createFlowerPatch(8, 0.7);
    flowerPatch2.position.set(7, 0, -2);
    introScene.add(flowerPatch2);
    
    // Add some decorative rocks
    for (let i = 0; i < 4; i++) {
        const rock = createRock(0.3 + Math.random() * 0.4);
        rock.position.set(
            (Math.random() - 0.5) * 30,
            0,
            (Math.random() - 0.5) * 25
        );
        introScene.add(rock);
    }
    
    // Simple walking animation
    let walkTime = 0;
    const animateWalk = () => {
        walkTime += 0.05;
        
        const armSwing = Math.sin(walkTime) * 0.3;
        const legSwing = Math.sin(walkTime + Math.PI) * 0.2;
        
        if (student.userData.leftUpperArm) {
            student.userData.leftUpperArm.rotation.x = armSwing;
            student.userData.rightUpperArm.rotation.x = -armSwing;
            student.userData.leftThigh.rotation.x = legSwing;
            student.userData.rightThigh.rotation.x = -legSwing;
        }
        
        // Slight head bob
        if (student.userData.head) {
            student.userData.head.position.y = 6.8 + Math.sin(walkTime * 2) * 0.05;
        }
        
        requestAnimationFrame(animateWalk);
    };
    animateWalk();
    
    // Store references
    introScene.userData = {
        student: student,
        gate: gate,
        door: door,
        walkAnimation: animateWalk
    };
    
    return introScene;
}

// SCREEN 5 - Main Menu Scene
function createMainMenuScene() {
    const menuScene = new THREE.Scene();
    
    // Add atmospheric fog for mysterious atmosphere
    createAtmosphericFog(menuScene, 0x1a1a2e, 20, 80);
    
    // Enhanced ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    menuScene.add(ambientLight);
    
    // Add mysterious volumetric lighting
    const mysteriousLight = createVolumetricLight(0x00FFFF, 0.6, 30, new THREE.Vector3(0, 8, -5));
    menuScene.add(mysteriousLight);
    
    // Mysterious house with realistic material
    const houseGeometry = new THREE.BoxGeometry(12, 10, 10);
    const houseMaterial = materials.brick;
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.set(0, 5, -10);
    menuScene.add(house);
    
    // Enhanced glowing door with rim lighting
    const doorGeometry = new THREE.PlaneGeometry(3, 6);
    const doorMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.8,
        emissive: 0x003333
    });
    const glowingDoor = new THREE.Mesh(doorGeometry, doorMaterial);
    glowingDoor.position.set(0, 5, -4.9);
    menuScene.add(glowingDoor);
    
    // Add spotlight for door glow effect
    const doorSpotlight = new THREE.SpotLight(0x00FFFF, 2, 15, Math.PI / 6, 0.5);
    doorSpotlight.position.set(0, 8, -2);
    doorSpotlight.target = glowingDoor;
    doorSpotlight.castShadow = true;
    doorSpotlight.shadow.mapSize.width = 1024;
    doorSpotlight.shadow.mapSize.height = 1024;
    menuScene.add(doorSpotlight);
    
    // Animated logo particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = Math.random() * 10;
        positions[i + 2] = (Math.random() - 0.5) * 20;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({ 
        color: 0xFFD700,
        size: 0.1
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    menuScene.add(particles);
    
    // Store references
    menuScene.userData = {
        house: house,
        glowingDoor: glowingDoor,
        particles: particles
    };
    
    return menuScene;
}

// SCREEN 6 - Living Room Scene (Level 1: Basic Electricity Puzzle)
function createLivingRoomScene() {
    const livingRoomScene = new THREE.Scene();
    
    // Dark atmosphere - room needs electricity
    const ambientLight = new THREE.AmbientLight(0x202020, 0.1);
    livingRoomScene.add(ambientLight);
    
    // Create room walls
    const roomGroup = new THREE.Group();
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);
    
    // Walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
    
    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(20, 10);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 5, -10);
    roomGroup.add(backWall);
    
    // Side walls
    const sideWallGeometry = new THREE.PlaneGeometry(20, 10);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-10, 5, 0);
    leftWall.rotation.y = Math.PI / 2;
    roomGroup.add(leftWall);
    
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(10, 5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    roomGroup.add(rightWall);
    
    livingRoomScene.add(roomGroup);
    
    // Create wiring puzzle components
    const wiringGroup = new THREE.Group();
    
    // Power source (battery)
    const batteryGeometry = new THREE.BoxGeometry(2, 1, 1);
    const batteryMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const battery = new THREE.Mesh(batteryGeometry, batteryMaterial);
    battery.position.set(-6, 2, -8);
    battery.userData = { type: 'battery', connected: false };
    wiringGroup.add(battery);
    
    // Switch
    const switchGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.2);
    const switchMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const electricSwitch = new THREE.Mesh(switchGeometry, switchMaterial);
    electricSwitch.position.set(0, 3, -8);
    electricSwitch.userData = { type: 'switch', isOn: false };
    wiringGroup.add(electricSwitch);
    
    // Light bulb
    const bulbGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const bulbMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.3
    });
    const lightBulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    lightBulb.position.set(6, 6, -8);
    lightBulb.userData = { type: 'bulb', powered: false };
    wiringGroup.add(lightBulb);
    
    // Wires (initially disconnected)
    const wirePositions = [
        { start: [-6, 2, -8], end: [0, 3, -8], connected: false },
        { start: [0, 3, -8], end: [6, 6, -8], connected: false }
    ];
    
    wirePositions.forEach((wire, index) => {
        const wireGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1);
        const wireMaterial = new THREE.MeshLambertMaterial({ 
            color: wire.connected ? 0x00FF00 : 0xFF0000 
        });
        const wireObject = new THREE.Mesh(wireGeometry, wireMaterial);
        
        const midX = (wire.start[0] + wire.end[0]) / 2;
        const midY = (wire.start[1] + wire.end[1]) / 2;
        const midZ = (wire.start[2] + wire.end[2]) / 2;
        
        wireObject.position.set(midX, midY, midZ);
        wireObject.userData = { type: 'wire', index: index, connected: wire.connected };
        wiringGroup.add(wireObject);
    });
    
    livingRoomScene.add(wiringGroup);
    
    // Create old TV
    const tvGroup = new THREE.Group();
    
    // TV body
    const tvGeometry = new THREE.BoxGeometry(4, 3, 2);
    const tvMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
    const tv = new THREE.Mesh(tvGeometry, tvMaterial);
    tv.position.set(0, 2, 5);
    
    // TV screen
    const screenGeometry = new THREE.PlaneGeometry(3, 2);
    const screenMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x000000,
        transparent: true,
        opacity: 0.8
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 2, 6.1);
    
    tvGroup.add(tv);
    tvGroup.add(screen);
    tvGroup.userData = { type: 'tv', powered: false };
    
    livingRoomScene.add(tvGroup);
    
    // Store scene objects for interaction
    sceneObjects.livingRoom = {
        wiringGroup: wiringGroup,
        tvGroup: tvGroup,
        lightBulb: lightBulb,
        switch: electricSwitch,
        battery: battery,
        wires: wirePositions
    };
    
    return livingRoomScene;
}

function createKitchenScene() {
    const kitchenScene = new THREE.Scene();
    kitchenScene.fog = new THREE.Fog(0x404040, 10, 50);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    kitchenScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    kitchenScene.add(directionalLight);
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    kitchenScene.add(floor);
    
    // Walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
    
    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(20, 10);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 5, -10);
    kitchenScene.add(backWall);
    
    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(20, 10);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-10, 5, 0);
    leftWall.rotation.y = Math.PI / 2;
    kitchenScene.add(leftWall);
    
    // Kitchen appliances and furniture
    const kitchenObjects = {};
    
    // Refrigerator
    const fridgeGeometry = new THREE.BoxGeometry(2, 4, 2);
    const fridgeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const fridge = new THREE.Mesh(fridgeGeometry, fridgeMaterial);
    fridge.position.set(-7, 2, -8);
    fridge.userData = { type: 'fridge', isOpen: false, efficiency: 0 };
    fridge.castShadow = true;
    kitchenScene.add(fridge);
    kitchenObjects.fridge = fridge;
    
    // Stove
    const stoveGeometry = new THREE.BoxGeometry(2, 1, 2);
    const stoveMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const stove = new THREE.Mesh(stoveGeometry, stoveMaterial);
    stove.position.set(-3, 0.5, -8);
    stove.userData = { type: 'stove', isOn: false };
    stove.castShadow = true;
    kitchenScene.add(stove);
    kitchenObjects.stove = stove;
    
    // Lights (ceiling lamp)
    const lampGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8);
    const lampMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00, opacity: 0.3, transparent: true });
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
    lamp.position.set(0, 8, -3);
    lamp.userData = { type: 'lamp', isOn: true };
    kitchenScene.add(lamp);
    kitchenObjects.lamp = lamp;
    
    // Fan
    const fanBaseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
    const fanBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const fanBase = new THREE.Mesh(fanBaseGeometry, fanBaseMaterial);
    fanBase.position.set(5, 7, -3);
    
    const fanBladeGeometry = new THREE.BoxGeometry(2, 0.1, 0.3);
    const fanBladeMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const fanBlade1 = new THREE.Mesh(fanBladeGeometry, fanBladeMaterial);
    const fanBlade2 = new THREE.Mesh(fanBladeGeometry, fanBladeMaterial);
    fanBlade2.rotation.z = Math.PI / 2;
    
    const fanGroup = new THREE.Group();
    fanGroup.add(fanBase);
    fanGroup.add(fanBlade1);
    fanGroup.add(fanBlade2);
    fanGroup.position.copy(fanBase.position);
    fanGroup.userData = { type: 'fan', isOn: true, blades: [fanBlade1, fanBlade2] };
    kitchenScene.add(fanGroup);
    kitchenObjects.fan = fanGroup;
    
    // Window
    const windowFrameGeometry = new THREE.BoxGeometry(3, 3, 0.2);
    const windowFrameMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const windowFrame = new THREE.Mesh(windowFrameGeometry, windowFrameMaterial);
    windowFrame.position.set(3, 5, -9.9);
    kitchenScene.add(windowFrame);
    
    const windowGlassGeometry = new THREE.PlaneGeometry(2.5, 2.5);
    const windowGlassMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x87CEEB, 
        opacity: 0.3, 
        transparent: true 
    });
    const windowGlass = new THREE.Mesh(windowGlassGeometry, windowGlassMaterial);
    windowGlass.position.set(3, 5, -9.8);
    windowGlass.userData = { type: 'window', isOpen: false };
    kitchenScene.add(windowGlass);
    kitchenObjects.window = windowGlass;
    
    // Store objects for interaction
    sceneObjects.kitchen = kitchenObjects;
    
    return kitchenScene;
}

function createLabScene() {
    const labScene = new THREE.Scene();
    labScene.fog = new THREE.Fog(0x202020, 10, 50);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    labScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    labScene.add(directionalLight);
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(25, 25);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    labScene.add(floor);
    
    // Walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    
    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(25, 12);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 6, -12);
    labScene.add(backWall);
    
    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(25, 12);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-12, 6, 0);
    leftWall.rotation.y = Math.PI / 2;
    labScene.add(leftWall);
    
    // Lab equipment
    const labObjects = {};
    
    // Main computer/simulator
    const computerGeometry = new THREE.BoxGeometry(4, 3, 1);
    const computerMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const computer = new THREE.Mesh(computerGeometry, computerMaterial);
    computer.position.set(0, 1.5, -10);
    computer.userData = { type: 'computer' };
    computer.castShadow = true;
    labScene.add(computer);
    labObjects.computer = computer;
    
    // Computer screen
    const screenGeometry = new THREE.PlaneGeometry(3.5, 2.5);
    const screenMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x004400, 
        opacity: 0.8, 
        transparent: true 
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 1.5, -9.4);
    screen.userData = { type: 'screen', active: false };
    labScene.add(screen);
    labObjects.screen = screen;
    
    // Control panel
    const panelGeometry = new THREE.BoxGeometry(6, 1, 2);
    const panelMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(0, 0.5, -8);
    panel.userData = { type: 'panel' };
    panel.castShadow = true;
    labScene.add(panel);
    labObjects.panel = panel;
    
    // Energy usage sliders (represented as boxes)
    const sliderPositions = [
        { x: -2, label: 'AC', value: 50 },
        { x: -0.5, label: 'Lights', value: 30 },
        { x: 1, label: 'TV', value: 40 },
        { x: 2.5, label: 'Fridge', value: 60 }
    ];
    
    labObjects.sliders = [];
    
    sliderPositions.forEach((pos, index) => {
        // Slider base
        const sliderBaseGeometry = new THREE.BoxGeometry(0.3, 0.1, 1);
        const sliderBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const sliderBase = new THREE.Mesh(sliderBaseGeometry, sliderBaseMaterial);
        sliderBase.position.set(pos.x, 1, -7.5);
        labScene.add(sliderBase);
        
        // Slider handle
        const sliderHandleGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.2);
        const sliderHandleMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6600 });
        const sliderHandle = new THREE.Mesh(sliderHandleGeometry, sliderHandleMaterial);
        sliderHandle.position.set(pos.x, 1.2, -7.5);
        sliderHandle.userData = { 
            type: 'slider', 
            index: index, 
            label: pos.label, 
            value: pos.value,
            minValue: 0,
            maxValue: 100
        };
        labScene.add(sliderHandle);
        
        labObjects.sliders.push({
            base: sliderBase,
            handle: sliderHandle,
            label: pos.label,
            value: pos.value
        });
    });
    
    // Calculate button
    const buttonGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8);
    const buttonMaterial = new THREE.MeshLambertMaterial({ color: 0x00AA00 });
    const calculateButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
    calculateButton.position.set(4, 1, -7.5);
    calculateButton.userData = { type: 'calculate' };
    calculateButton.castShadow = true;
    labScene.add(calculateButton);
    labObjects.calculateButton = calculateButton;
    
    // Store objects for interaction
    sceneObjects.lab = labObjects;
    
    return labScene;
}

function createQuizScene() {
    const quizScene = new THREE.Scene();
    quizScene.fog = new THREE.Fog(0x101010, 10, 50);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x202020, 0.3);
    quizScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    quizScene.add(directionalLight);
    
    // Floor (underground basement)
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    quizScene.add(floor);
    
    // Walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    
    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(30, 15);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 7.5, -15);
    quizScene.add(backWall);
    
    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(30, 15);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-15, 7.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    quizScene.add(leftWall);
    
    // Right wall
    const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    rightWall.position.set(15, 7.5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    quizScene.add(rightWall);
    
    // Quiz objects
    const quizObjects = {};
    
    // Central pedestal for energy keys
    const pedestalGeometry = new THREE.CylinderGeometry(2, 2.5, 3, 8);
    const pedestalMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.set(0, 1.5, 0);
    pedestal.castShadow = true;
    quizScene.add(pedestal);
    quizObjects.pedestal = pedestal;
    
    // Energy key slots
    const keySlots = [];
    for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const x = Math.cos(angle) * 1.5;
        const z = Math.sin(angle) * 1.5;
        
        const slotGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
        const slotMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const slot = new THREE.Mesh(slotGeometry, slotMaterial);
        slot.position.set(x, 3.1, z);
        slot.userData = { type: 'keySlot', index: i, filled: false };
        quizScene.add(slot);
        keySlots.push(slot);
    }
    quizObjects.keySlots = keySlots;
    
    // Quiz display screen
    const screenGeometry = new THREE.PlaneGeometry(8, 6);
    const screenMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x000066, 
        opacity: 0.9, 
        transparent: true 
    });
    const quizScreen = new THREE.Mesh(screenGeometry, screenMaterial);
    quizScreen.position.set(0, 6, -13);
    quizScreen.userData = { type: 'quizScreen', active: false };
    quizScene.add(quizScreen);
    quizObjects.quizScreen = quizScreen;
    
    // Answer buttons (A, B, C, D)
    const buttonPositions = [
        { x: -6, y: 2, label: 'A' },
        { x: -2, y: 2, label: 'B' },
        { x: 2, y: 2, label: 'C' },
        { x: 6, y: 2, label: 'D' }
    ];
    
    quizObjects.answerButtons = [];
    
    buttonPositions.forEach((pos, index) => {
        const buttonGeometry = new THREE.BoxGeometry(1.5, 1, 0.5);
        const buttonMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.position.set(pos.x, pos.y, -12);
        button.userData = { 
            type: 'answerButton', 
            index: index, 
            label: pos.label,
            selected: false
        };
        button.castShadow = true;
        quizScene.add(button);
        quizObjects.answerButtons.push(button);
    });
    
    // Scientist (trapped)
    const scientistGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
    const scientistMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const scientist = new THREE.Mesh(scientistGeometry, scientistMaterial);
    scientist.position.set(8, 2, -10);
    scientist.userData = { type: 'scientist', rescued: false };
    scientist.castShadow = true;
    quizScene.add(scientist);
    quizObjects.scientist = scientist;
    
    // Cage around scientist
    const cageGeometry = new THREE.BoxGeometry(3, 4, 3);
    const cageMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x888888, 
        opacity: 0.3, 
        transparent: true,
        wireframe: true
    });
    const cage = new THREE.Mesh(cageGeometry, cageMaterial);
    cage.position.set(8, 2, -10);
    cage.userData = { type: 'cage', locked: true };
    quizScene.add(cage);
    quizObjects.cage = cage;
    
    // Store objects for interaction
    sceneObjects.quiz = quizObjects;
    
    return quizScene;
}

function createEndingScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    
    // Victory pedestal
    const pedestalGeometry = new THREE.CylinderGeometry(2, 3, 1, 8);
    const pedestalMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.set(0, 0.5, 0);
    scene.add(pedestal);
    
    // Badge/Trophy
    const badgeGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 8);
    const badgeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const badge = new THREE.Mesh(badgeGeometry, badgeMaterial);
    badge.position.set(0, 1.2, 0);
    scene.add(badge);
    
    // Rescued scientist
    const scientistGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
    const scientistMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
    const scientist = new THREE.Mesh(scientistGeometry, scientistMaterial);
    scientist.position.set(-3, 1.5, 0);
    scene.add(scientist);
    
    // Celebration particles (simple spheres)
    for (let i = 0; i < 20; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 6);
        const particleMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 1, 0.5) 
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(
            (Math.random() - 0.5) * 20,
            Math.random() * 10 + 2,
            (Math.random() - 0.5) * 20
        );
        scene.add(particle);
    }
    
    // Store scene objects
    sceneObjects.ending = {
        pedestal: pedestal,
        badge: badge,
        scientist: scientist
    };
    
    return scene;
}

function startEndingScene() {
    hideAllUI();
    
    if (!scenes.ending) {
        scenes.ending = createEndingScene();
    }
    
    currentScene = 'ending';
    scene = scenes.ending;
    camera.position.set(0, 5, 10);
    
    // Show ending narrative
    showSubtitle("🏅 Lencana Peneliti Muda diperoleh!");
    
    setTimeout(() => {
        showSubtitle("Misteri ilmuwan listrik telah terpecahkan. Namun, tanggung jawabmu tidak berhenti di sini.");
    }, 3000);
    
    setTimeout(() => {
        showSubtitle("Gunakanlah pengetahuan ini dalam kehidupan nyata... Dan jadilah generasi yang hemat energi.");
    }, 8000);
    
    setTimeout(() => {
        showSubtitle("🎉 Selamat! Kamu telah menyelesaikan Energy Quest!");
        
        // Show restart button
        setTimeout(() => {
            const restartBtn = document.createElement('button');
            restartBtn.textContent = 'Main Lagi';
            restartBtn.style.position = 'absolute';
            restartBtn.style.top = '70%';
            restartBtn.style.left = '50%';
            restartBtn.style.transform = 'translateX(-50%)';
            restartBtn.style.padding = '15px 30px';
            restartBtn.style.fontSize = '18px';
            restartBtn.style.backgroundColor = '#4CAF50';
            restartBtn.style.color = 'white';
            restartBtn.style.border = 'none';
            restartBtn.style.borderRadius = '5px';
            restartBtn.style.cursor = 'pointer';
            restartBtn.onclick = () => {
                location.reload();
            };
            document.body.appendChild(restartBtn);
        }, 3000);
    }, 13000);
    
    playSoundEffect('success');
}

// Scene transition with fade effect
function transitionToScene(sceneFunction, delay = 0) {
    if (isTransitioning) return;
    
    isTransitioning = true;
    
    // Fade out
    if (fadeElement) fadeElement.style.opacity = '1';
    
    setTimeout(() => {
        // Hide all UI elements
        hideAllUI();
        
        // Execute scene function
        sceneFunction();
        
        // Fade in
        setTimeout(() => {
            if (fadeElement) fadeElement.style.opacity = '0';
            isTransitioning = false;
        }, 500);
    }, 1000 + delay);
}

// Hide all UI elements
function hideAllUI() {
    document.getElementById('subtitle').style.opacity = '0';
    document.getElementById('title').style.opacity = '0';
    document.getElementById('menu').style.opacity = '0';
}

// Scene transition functions
function startOpeningScene() {
    try {
        console.log('Starting Opening Scene...');
        
        if (!scenes.opening) {
            throw new Error('Opening scene not initialized!');
        }
        
        currentScene = 'opening';
        scene = scenes.opening;
        camera.position.set(0, 5, 15);
        
        console.log('Opening scene set:', scene);
        console.log('Scene children count:', scene.children.length);
        
        // Hide UI elements
        hideAllUI();
        
        // Play scene music
        playSceneMusic('opening');
        
        // Animate camera zoom to house
        animateCamera({ x: 0, y: 5, z: 5 }, 3000);
        
        // Show subtitle after delay
        setTimeout(() => {
            showSubtitle("Seorang ilmuwan listrik terkenal telah menghilang secara misterius.");
        }, 1000);
        
        setTimeout(() => {
            showSubtitle("Rumahnya kini dipenuhi teka-teki yang belum terpecahkan.");
        }, 4000);
        
        setTimeout(() => {
            showSubtitle("Polisi menyerah... namun katanya, hanya mereka yang memahami energi listrik yang bisa mengungkap kebenarannya.");
        }, 7000);
        
        setTimeout(() => {
            transitionToScene(startHouseRevealScene);
        }, 11000);
        
        console.log('Opening scene started successfully');
        
    } catch (error) {
        console.error('Error starting opening scene:', error);
        alert('Error starting opening scene: ' + error.message);
    }
}

function startHouseRevealScene() {
    currentScene = 'houseReveal';
    scene = scenes.houseReveal;
    camera.position.set(0, 5, 10);
    
    // Debug log
    console.log('Starting House Reveal Scene', scene);
    
    // Hide UI elements
    hideAllUI();
    
    // Play scene music and effects
    playSceneMusic('houseReveal');
    setTimeout(() => playSoundEffect('electricBuzz'), 1000);
    
    // Animate flickering lights
    animateFlickeringLights();
    
    // Show scientist shadow animation
    setTimeout(() => {
        animateScientistShadow();
    }, 2000);
    
    // Show subtitle
    setTimeout(() => {
        showSubtitle("Jika kau mendengar ini… maka aku butuh bantuanmu.");
    }, 1000);
    
    setTimeout(() => {
        showSubtitle("Carilah Kunci Energi... hanya itu jalanmu.");
    }, 4000);
    
    setTimeout(() => {
        showSubtitle("Hanya mereka yang memahami listrik yang bisa mengungkap misteri ini.");
    }, 7000);
    
    setTimeout(() => {
        transitionToScene(startCharacterIntroScene);
    }, 11000);
}

function startCharacterIntroScene() {
    currentScene = 'characterIntro';
    scene = scenes.characterIntro;
    camera.position.set(0, 3, 8);
    
    // Play scene music
    playSceneMusic('characterIntro');
    
    // Animate gate opening
    setTimeout(() => {
        animateGateOpening();
    }, 1000);
    
    // Show narration
    setTimeout(() => {
        showSubtitle("Kamu adalah seorang siswa dengan rasa ingin tahu besar.");
    }, 2000);
    
    setTimeout(() => {
        showSubtitle("Kini, tugasmu adalah menyelidiki rumah ini dan mengungkap rahasia yang tersembunyi di dalamnya.");
    }, 5000);
    
    setTimeout(() => {
        showTitle("⚡ Energy Quest: Misteri Hemat Listrik");
    }, 9000);
    
    setTimeout(() => {
        showSubtitle("Selamat datang di Energy Quest: Misteri Hemat Listrik. Perjalananmu dimulai sekarang.");
    }, 12000);
    
    setTimeout(() => {
        transitionToScene(startMainMenuScene);
    }, 16000);
}

function startMainMenuScene() {
    currentScene = 'mainMenu';
    scene = scenes.mainMenu;
    camera.position.set(0, 5, 5);
    
    // Play menu music
    playSceneMusic('mainMenu');
    
    // Show menu
    document.getElementById('menu').style.opacity = '1';
    
    // Animate particles
    animateMenuParticles();
}

function startLivingRoomScene() {
    hideAllUI();
    
    if (!scenes.livingRoom) {
        scenes.livingRoom = createLivingRoomScene();
    }
    
    currentScene = 'livingRoom';
    scene = scenes.livingRoom;
    camera.position.set(0, 5, 10);
    
    // Show narrative text
    showSubtitle("Ruang tamu gelap... Kamu harus menyalakan listrik agar bisa menjelajah lebih jauh.");
    
    // Reset puzzle state
    puzzleState.wiringComplete = false;
    puzzleState.tvPowered = false;
    
    // Setup click interactions for puzzle
    setupLivingRoomInteractions();
}

function setupLivingRoomInteractions() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onMouseClick(event) {
        if (currentScene !== 'livingRoom') return;
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            handleLivingRoomClick(clickedObject);
        }
    }
    
    window.addEventListener('click', onMouseClick);
}

function handleLivingRoomClick(object) {
    const userData = object.userData;
    
    if (userData.type === 'wire') {
        // Toggle wire connection
        const wireIndex = userData.index;
        const wire = sceneObjects.livingRoom.wires[wireIndex];
        wire.connected = !wire.connected;
        
        // Update wire color
        object.material.color.setHex(wire.connected ? 0x00FF00 : 0xFF0000);
        
        // Check if circuit is complete
        checkCircuitComplete();
        
        playSoundEffect('click');
        
    } else if (userData.type === 'switch') {
        // Toggle switch
        userData.isOn = !userData.isOn;
        
        // Update switch appearance
        object.material.color.setHex(userData.isOn ? 0x00FF00 : 0x808080);
        
        // Check if circuit is complete
        checkCircuitComplete();
        
        playSoundEffect('click');
        
    } else if (userData.type === 'tv' && puzzleState.wiringComplete) {
        // Try to power TV
        if (!puzzleState.tvPowered) {
            powerOnTV();
        }
    }
}

function checkCircuitComplete() {
    const allWiresConnected = sceneObjects.livingRoom.wires.every(wire => wire.connected);
    const switchOn = sceneObjects.livingRoom.switch.userData.isOn;
    
    if (allWiresConnected && switchOn) {
        puzzleState.wiringComplete = true;
        
        // Light up the bulb
        const bulb = sceneObjects.livingRoom.lightBulb;
        bulb.material.color.setHex(0xFFFF00);
        bulb.material.opacity = 1.0;
        bulb.userData.powered = true;
        
        // Add light source
        const bulbLight = new THREE.PointLight(0xFFFF00, 1, 10);
        bulbLight.position.copy(bulb.position);
        scene.add(bulbLight);
        
        // Show success message
        showSubtitle("Listrik mengalir dalam rangkaian tertutup. Saklar berfungsi untuk memutus atau menghubungkan arus listrik.");
        
        playSoundEffect('success');
        
    } else {
        puzzleState.wiringComplete = false;
        
        // Turn off bulb
        const bulb = sceneObjects.livingRoom.lightBulb;
        bulb.material.color.setHex(0xFFFFFF);
        bulb.material.opacity = 0.3;
        bulb.userData.powered = false;
        
        // Show error message
        showSubtitle("Rangkaian terbuka atau salah sambung. Arus tidak mengalir.");
    }
}

function powerOnTV() {
    const tvGroup = sceneObjects.livingRoom.tvGroup;
    puzzleState.tvPowered = true;
    
    // Change TV screen to show content
    const screen = tvGroup.children[1]; // screen is second child
    screen.material.color.setHex(0x0066CC);
    screen.material.opacity = 1.0;
    
    // Show TV message
    setTimeout(() => {
        showSubtitle("Jika kau menemukan ini, berarti kau berhasil menghidupkan ruang tamuku. Carilah kunci energi, hanya itu yang bisa membuka jalanmu.");
        
        // Award first energy key
        setTimeout(() => {
            gameState.energyKeys++;
            showSubtitle("🎉 Kunci Energi Pertama ditemukan!");
            
            // Transition to next level after delay
            setTimeout(() => {
                startKitchenScene();
            }, 3000);
        }, 3000);
    }, 2000);
    
    playSoundEffect('success');
}

function startKitchenScene() {
    hideAllUI();
    
    if (!scenes.kitchen) {
        scenes.kitchen = createKitchenScene();
    }
    
    currentScene = 'kitchen';
    scene = scenes.kitchen;
    camera.position.set(0, 5, 10);
    
    // Show narrative text
    showSubtitle("Dapur ini penuh peralatan listrik. Gunakanlah dengan bijak agar energi tidak terbuang.");
    
    // Reset kitchen efficiency
    puzzleState.kitchenEfficiency = 0;
    
    // Setup click interactions for kitchen
    setupKitchenInteractions();
}

function setupKitchenInteractions() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onMouseClick(event) {
        if (currentScene !== 'kitchen') return;
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            handleKitchenClick(clickedObject);
        }
    }
    
    window.addEventListener('click', onMouseClick);
}

function handleKitchenClick(object) {
    const userData = object.userData;
    
    if (userData.type === 'lamp') {
        // Toggle lamp
        userData.isOn = !userData.isOn;
        
        if (userData.isOn) {
            object.material.opacity = 0.8;
            object.material.color.setHex(0xFFFF00);
            puzzleState.kitchenEfficiency -= 5; // Using light reduces efficiency
        } else {
            object.material.opacity = 0.1;
            object.material.color.setHex(0x666666);
            puzzleState.kitchenEfficiency += 10; // Turning off light improves efficiency
            showSubtitle("Gunakan cahaya alami untuk menghemat energi.");
        }
        
        playSoundEffect('click');
        
    } else if (userData.type === 'window') {
        // Toggle window
        userData.isOpen = !userData.isOpen;
        
        if (userData.isOpen) {
            object.material.opacity = 0.1;
            puzzleState.kitchenEfficiency += 15; // Opening window improves efficiency
            showSubtitle("Gunakan cahaya alami untuk menghemat energi.");
        } else {
            object.material.opacity = 0.3;
            puzzleState.kitchenEfficiency -= 5;
        }
        
        playSoundEffect('click');
        
    } else if (userData.type === 'fridge') {
        // Quick fridge interaction
        if (!userData.isOpen) {
            userData.isOpen = true;
            object.material.color.setHex(0xFFFFAA);
            
            // Auto close after short time
            setTimeout(() => {
                userData.isOpen = false;
                object.material.color.setHex(0xFFFFFF);
                puzzleState.kitchenEfficiency += 10;
                showSubtitle("Menutup kulkas dengan cepat menghemat energi.");
            }, 1000);
        }
        
        playSoundEffect('click');
        
    } else if (userData.type === 'fan') {
        // Toggle fan
        userData.isOn = !userData.isOn;
        
        if (userData.isOn) {
            puzzleState.kitchenEfficiency -= 10;
            showSubtitle("Gunakan perangkat listrik sesuai kebutuhan.");
        } else {
            puzzleState.kitchenEfficiency += 15;
        }
        
        playSoundEffect('click');
    }
    
    // Check if efficiency target is reached
    checkKitchenEfficiency();
}

function checkKitchenEfficiency() {
    if (puzzleState.kitchenEfficiency >= 30) {
        // Award second energy key
        gameState.energyKeys++;
        showSubtitle("🎉 Kunci Energi Kedua ditemukan!");
        
        // Transition to lab scene after delay
        setTimeout(() => {
            startLabScene();
        }, 3000);
        
        playSoundEffect('success');
    }
}

function startLabScene() {
    hideAllUI();
    
    if (!scenes.lab) {
        scenes.lab = createLabScene();
    }
    
    currentScene = 'lab';
    scene = scenes.lab;
    camera.position.set(0, 5, 10);
    
    // Show narrative text
    showSubtitle("Gunakan simulator ini untuk mengatur penggunaan energi rumah dengan efisien. Selesaikan tantangan agar pintu rahasia terbuka.");
    
    // Reset bill amount
    puzzleState.billAmount = 0;
    
    // Setup click interactions for lab
    setupLabInteractions();
}

function setupLabInteractions() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onMouseClick(event) {
        if (currentScene !== 'lab') return;
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            handleLabClick(clickedObject);
        }
    }
    
    window.addEventListener('click', onMouseClick);
}

function handleLabClick(object) {
    const userData = object.userData;
    
    if (userData.type === 'slider') {
        // Adjust slider value
        const slider = sceneObjects.lab.sliders[userData.index];
        
        // Cycle through values: 25%, 50%, 75%, 100%
        const values = [25, 50, 75, 100];
        const currentIndex = values.indexOf(userData.value);
        const nextIndex = (currentIndex + 1) % values.length;
        userData.value = values[nextIndex];
        slider.value = userData.value;
        
        // Update slider handle color based on value
        const intensity = userData.value / 100;
        object.material.color.setRGB(intensity, 1 - intensity, 0);
        
        playSoundEffect('click');
        
    } else if (userData.type === 'calculate') {
        // Calculate total bill
        calculateEnergyBill();
        playSoundEffect('click');
    }
}

function calculateEnergyBill() {
    const sliders = sceneObjects.lab.sliders;
    let totalCost = 0;
    
    // Calculate cost based on each appliance usage
    sliders.forEach(slider => {
        const usage = slider.value;
        let cost = 0;
        
        switch(slider.label) {
            case 'AC':
                cost = usage * 2.5; // AC is expensive
                break;
            case 'Lights':
                cost = usage * 0.8;
                break;
            case 'TV':
                cost = usage * 1.2;
                break;
            case 'Fridge':
                cost = usage * 1.5;
                break;
        }
        
        totalCost += cost;
    });
    
    // Convert to Rupiah (simplified)
    puzzleState.billAmount = Math.round(totalCost * 1000);
    
    // Update screen display
    const screen = sceneObjects.lab.screen;
    screen.userData.active = true;
    screen.material.color.setHex(0x0066CC);
    
    // Show bill result
    if (puzzleState.billAmount > 300000) {
        showSubtitle(`Tagihan: Rp${puzzleState.billAmount.toLocaleString()}. Tagihan terlalu tinggi. Kurangi konsumsi energi!`);
        screen.material.color.setHex(0xFF0000); // Red for high bill
    } else {
        showSubtitle(`Tagihan: Rp${puzzleState.billAmount.toLocaleString()}. Bagus! Kamu sudah mengelola energi dengan bijak.`);
        screen.material.color.setHex(0x00FF00); // Green for good bill
        
        // Award third energy key
        setTimeout(() => {
            gameState.energyKeys++;
            showSubtitle("🎉 Kunci Energi Ketiga ditemukan! Pintu menuju ruang bawah tanah terbuka…");
            
            // Transition to quiz scene after delay
            setTimeout(() => {
                startQuizScene();
            }, 3000);
        }, 2000);
        
        playSoundEffect('success');
    }
}

function startQuizScene() {
    hideAllUI();
    
    if (!scenes.quiz) {
        scenes.quiz = createQuizScene();
    }
    
    currentScene = 'quiz';
    scene = scenes.quiz;
    camera.position.set(0, 8, 15);
    
    // Show narrative text
    showSubtitle("Gunakan tiga Kunci Energi untuk membuka pintu. Hanya mereka yang memahami listrik dengan baik yang bisa menyelamatkan sang ilmuwan.");
    
    // Reset quiz state
    puzzleState.quizAnswers = [];
    gameState.currentQuestionIndex = 0;
    
    // Setup quiz questions
    setupQuizQuestions();
    
    // Setup click interactions for quiz
    setupQuizInteractions();
    
    // Place energy keys if player has them
    placeEnergyKeys();
}

function setupQuizQuestions() {
    gameState.quizQuestions = [
        {
            question: "Apa yang terjadi jika rangkaian listrik terbuka?",
            options: ["Arus mengalir normal", "Arus tidak mengalir", "Arus meningkat", "Lampu menyala"],
            correct: 1
        },
        {
            question: "Fungsi utama saklar dalam rangkaian listrik adalah?",
            options: ["Menambah tegangan", "Memutus/menghubungkan arus", "Mengurangi arus", "Menyimpan energi"],
            correct: 1
        },
        {
            question: "Cara terbaik menghemat energi di dapur adalah?",
            options: ["Biarkan kulkas terbuka", "Nyalakan semua lampu", "Gunakan cahaya alami", "Hidupkan kipas terus"],
            correct: 2
        },
        {
            question: "Peralatan rumah tangga yang paling boros energi?",
            options: ["Lampu LED", "AC (Air Conditioner)", "Radio", "Jam dinding"],
            correct: 1
        },
        {
            question: "Satuan yang digunakan untuk mengukur daya listrik?",
            options: ["Volt", "Ampere", "Watt", "Ohm"],
            correct: 2
        }
    ];
}

function setupQuizInteractions() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onMouseClick(event) {
        if (currentScene !== 'quiz') return;
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            handleQuizClick(clickedObject);
        }
    }
    
    window.addEventListener('click', onMouseClick);
}

function handleQuizClick(object) {
    const userData = object.userData;
    
    if (userData.type === 'answerButton' && gameState.quizStarted) {
        // Select answer
        selectAnswer(userData.index);
        playSoundEffect('click');
        
    } else if (userData.type === 'pedestal' && gameState.energyKeys >= 3) {
        // Start quiz if all keys are placed
        startQuiz();
        playSoundEffect('click');
    }
}

function placeEnergyKeys() {
    const keySlots = sceneObjects.quiz.keySlots;
    
    for (let i = 0; i < Math.min(gameState.energyKeys, 3); i++) {
        const slot = keySlots[i];
        slot.userData.filled = true;
        slot.material.color.setHex(0xFFD700); // Gold color for filled slots
        
        // Add energy key visual
        const keyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8);
        const keyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        const key = new THREE.Mesh(keyGeometry, keyMaterial);
        key.position.copy(slot.position);
        key.position.y += 0.3;
        scene.add(key);
    }
    
    if (gameState.energyKeys >= 3) {
        showSubtitle("Semua kunci energi terkumpul! Klik pedestal untuk memulai kuis.");
    }
}

function startQuiz() {
    gameState.quizStarted = true;
    gameState.currentQuestionIndex = 0;
    showCurrentQuestion();
}

function showCurrentQuestion() {
    const question = gameState.quizQuestions[gameState.currentQuestionIndex];
    const screen = sceneObjects.quiz.quizScreen;
    
    screen.userData.active = true;
    screen.material.color.setHex(0x0066CC);
    
    // Show question text
    showSubtitle(`Soal ${gameState.currentQuestionIndex + 1}: ${question.question}`);
    
    // Update button labels (simulate showing options)
    const buttons = sceneObjects.quiz.answerButtons;
    buttons.forEach((button, index) => {
        button.material.color.setHex(0x666666);
        button.userData.selected = false;
    });
}

function selectAnswer(answerIndex) {
    const question = gameState.quizQuestions[gameState.currentQuestionIndex];
    const buttons = sceneObjects.quiz.answerButtons;
    
    // Reset all button colors
    buttons.forEach(button => {
        button.material.color.setHex(0x666666);
        button.userData.selected = false;
    });
    
    // Highlight selected button
    buttons[answerIndex].material.color.setHex(0x0066CC);
    buttons[answerIndex].userData.selected = true;
    
    // Check answer after delay
    setTimeout(() => {
        checkAnswer(answerIndex);
    }, 1000);
}

function checkAnswer(answerIndex) {
    const question = gameState.quizQuestions[gameState.currentQuestionIndex];
    const buttons = sceneObjects.quiz.answerButtons;
    
    if (answerIndex === question.correct) {
        // Correct answer
        buttons[answerIndex].material.color.setHex(0x00FF00);
        showSubtitle("Tepat! Listrik mulai menyala...");
        puzzleState.quizAnswers.push(true);
        playSoundEffect('success');
        
    } else {
        // Wrong answer
        buttons[answerIndex].material.color.setHex(0xFF0000);
        buttons[question.correct].material.color.setHex(0x00FF00);
        showSubtitle("Jawaban salah. Coba lagi.");
        puzzleState.quizAnswers.push(false);
        
        // Reset question after delay
        setTimeout(() => {
            showCurrentQuestion();
            return;
        }, 2000);
        return;
    }
    
    // Move to next question or finish quiz
    setTimeout(() => {
        gameState.currentQuestionIndex++;
        
        if (gameState.currentQuestionIndex < gameState.quizQuestions.length) {
            showCurrentQuestion();
        } else {
            finishQuiz();
        }
    }, 2000);
}

function finishQuiz() {
    showSubtitle("🎉 Semua soal berhasil dijawab! Pintu utama terbuka... Ilmuwan ditemukan!");
    
    // Open cage
    const cage = sceneObjects.quiz.cage;
    cage.userData.locked = false;
    cage.material.opacity = 0.1;
    
    // Free scientist
    const scientist = sceneObjects.quiz.scientist;
    scientist.userData.rescued = true;
    scientist.material.color.setHex(0x00FF00);
    
    // Transition to ending scene
    setTimeout(() => {
        startEndingScene();
    }, 4000);
    
    playSoundEffect('success');
}

// Animation functions
function animateCamera(targetPosition, duration) {
    const startPosition = camera.position.clone();
    const startTime = Date.now();
    
    function updateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        camera.position.lerpVectors(startPosition, new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z), progress);
        
        if (progress < 1) {
            requestAnimationFrame(updateCamera);
        }
    }
    
    updateCamera();
}

function animateFlickeringLights() {
    const flickerLight = scene.userData.flickerLight;
    
    function flicker() {
        flickerLight.intensity = Math.random() * 2 + 0.5;
        setTimeout(flicker, Math.random() * 200 + 100);
    }
    
    flicker();
}

function animateScientistShadow() {
    const shadow = scene.userData.scientistShadow;
    
    // Make shadow appear and disappear
    setTimeout(() => {
        shadow.material.opacity = 0.8;
    }, 500);
    
    setTimeout(() => {
        shadow.material.opacity = 0;
    }, 2000);
}

function animateGateOpening() {
    const gate = scene.userData.gate;
    
    // Rotate gate to open
    const startRotation = gate.rotation.y;
    const targetRotation = -Math.PI / 2;
    const duration = 2000;
    const startTime = Date.now();
    
    function updateGate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        gate.rotation.y = startRotation + (targetRotation - startRotation) * progress;
        
        if (progress < 1) {
            requestAnimationFrame(updateGate);
        }
    }
    
    updateGate();
}

function animateMenuParticles() {
    const particles = scene.userData.particles;
    
    function updateParticles() {
        particles.rotation.y += 0.01;
        
        if (currentScene === 'mainMenu') {
            requestAnimationFrame(updateParticles);
        }
    }
    
    updateParticles();
}

// UI functions
function showSubtitle(text) {
    const subtitle = document.getElementById('subtitle');
    subtitle.textContent = text;
    subtitle.style.opacity = '1';
    
    setTimeout(() => {
        subtitle.style.opacity = '0';
    }, 3000);
}

function showTitle(text) {
    const title = document.getElementById('title');
    title.textContent = text;
    title.style.opacity = '1';
    
    setTimeout(() => {
        title.style.opacity = '0';
    }, 4000);
}

// Menu functions
function startGame() {
    // Enable audio context on user interaction
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // Reset game state
    gameState.energyKeys = 0;
    gameState.currentLevel = 1;
    gameState.puzzlesSolved = [];
    gameState.score = 0;
    gameState.quizStarted = false;
    
    // Reset puzzle state
    puzzleState.wiringComplete = false;
    puzzleState.tvPowered = false;
    puzzleState.kitchenEfficiency = 0;
    puzzleState.billAmount = 0;
    puzzleState.quizAnswers = [];
    
    showSubtitle('Permainan dimulai! Selamat datang di Energy Quest!');
    
    // Start with Living Room Scene (Level 1)
    setTimeout(() => {
        startLivingRoomScene();
    }, 3000);
}

function continueGame() {
    showSubtitle('Fitur lanjutkan permainan akan dikembangkan dalam versi selanjutnya!');
}

function showSettings() {
    showSubtitle('Menu pengaturan: Audio ON/OFF, Kualitas Grafis, Kontrol');
    
    // Simple settings toggle
    setTimeout(() => {
        const audioEnabled = confirm('Aktifkan audio? (OK = Ya, Cancel = Tidak)');
        if (!audioEnabled && audioContext) {
            audioContext.suspend();
        } else if (audioEnabled && audioContext) {
            audioContext.resume();
        }
    }, 2000);
}

function showAbout() {
    showSubtitle('Energy Quest: Misteri Hemat Listrik - Game edukasi tentang penghematan energi listrik. Dikembangkan dengan Three.js');
}

// Add keyboard controls
function setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
        if (isTransitioning) return;
        
        switch(event.code) {
            case 'Space':
                if (currentScene === 'mainMenu') {
                    startGame();
                }
                break;
            case 'Escape':
                if (currentScene !== 'mainMenu') {
                    transitionToScene(startMainMenuScene);
                }
                break;
            case 'KeyR':
                // Restart current scene
                switch(currentScene) {
                    case 'opening':
                        transitionToScene(startOpeningScene);
                        break;
                    case 'houseReveal':
                        transitionToScene(startHouseRevealScene);
                        break;
                    case 'characterIntro':
                        transitionToScene(startCharacterIntroScene);
                        break;
                    case 'mainMenu':
                        transitionToScene(startMainMenuScene);
                        break;
                }
                break;
        }
    });
}

// Utility functions
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Performance monitoring
    const currentTime = performance.now();
    const deltaTime = currentTime - performanceMonitor.lastTime;
    
    if (deltaTime >= 1000) { // Update FPS every second
        performanceMonitor.fps = Math.round((performanceMonitor.frameCount * 1000) / deltaTime);
        performanceMonitor.frameCount = 0;
        performanceMonitor.lastTime = currentTime;
        
        // Debug: Display FPS and scene info
        console.log('FPS:', performanceMonitor.fps, 'Scene:', currentScene, 'Scene children:', scene ? scene.children.length : 'no scene');
    }
    performanceMonitor.frameCount++;
    
    if (controls && controls.enabled) {
        controls.update();
    }
    
    if (scene && camera) {
        const renderStart = performance.now();
        
        // Debug: Log camera position occasionally
        if (performanceMonitor.frameCount % 60 === 0) {
            console.log('Camera position:', camera.position, 'Scene children:', scene.children.length);
        }
        
        // Update LOD objects
        lodObjects.forEach(lod => {
            if (lod.update) {
                lod.update(camera);
            }
        });
        
        // Apply frustum culling if enabled
        if (frustumCullingUpdate) {
            frustumCullingUpdate();
        }
        
        renderer.render(scene, camera);
        
        performanceMonitor.renderTime = performance.now() - renderStart;
    } else {
        console.log('No scene or camera available for rendering');
    }
}

// Initialize the game when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, starting game initialization...');
    alert('Game is starting...'); // Debug alert
    try {
        init();
        setupKeyboardControls();
        console.log('Game initialization completed');
    } catch (error) {
        console.error('Error during game initialization:', error);
        alert('Error during initialization: ' + error.message);
    }
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
    } else {
        // Resume animations when tab becomes visible
    }
});