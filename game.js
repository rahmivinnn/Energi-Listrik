// EPIC 3D ADVENTURE GAME
class EpicGame3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
        this.objects = [];
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.explosions = [];
        
        // Game state
        this.gameState = {
            health: 100,
            score: 0,
            ammo: 30,
            maxAmmo: 30,
            isPaused: false,
            isAiming: false,
            isReloading: false,
            wave: 1,
            enemiesKilled: 0
        };
        
        // Player state
        this.player = {
            velocity: new THREE.Vector3(),
            onGround: false,
            speed: 8,
            runSpeed: 15,
            jumpForce: 20,
            position: new THREE.Vector3(0, 10, 0)
        };
        
        // Performance tracking
        this.clock = new THREE.Clock();
        this.stats = {
            fps: 0,
            frameCount: 0,
            lastTime: 0
        };
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0, buttons: { left: false, right: false } };
        
        // Audio
        this.audioListener = null;
        this.sounds = {};
        
        this.init();
    }
    
    async init() {
        try {
            await this.setupScene();
            await this.setupLighting();
            await this.setupAudio();
            await this.createWorld();
            await this.setupPostProcessing();
            await this.setupPhysics();
            this.setupControls();
            this.setupEventListeners();
            this.spawnEnemies();
            this.hideLoading();
            this.animate();
        } catch (error) {
            console.error('Failed to initialize game:', error);
        }
    }
    
    async setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x1a1a2e, 30, 150);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 10, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
        
        // Setup controls
        this.controls = new THREE.PointerLockControls(this.camera, document.body);
        this.scene.add(this.controls.getObject());
    }
    
    async setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 300;
        directionalLight.shadow.camera.left = -150;
        directionalLight.shadow.camera.right = 150;
        directionalLight.shadow.camera.top = 150;
        directionalLight.shadow.camera.bottom = -150;
        this.scene.add(directionalLight);
        
        // Dynamic point lights
        this.pointLights = [];
        for (let i = 0; i < 5; i++) {
            const pointLight = new THREE.PointLight(
                new THREE.Color().setHSL(Math.random(), 0.8, 0.8),
                1.5, 
                50
            );
            pointLight.position.set(
                (Math.random() - 0.5) * 200,
                5 + Math.random() * 10,
                (Math.random() - 0.5) * 200
            );
            pointLight.castShadow = true;
            this.scene.add(pointLight);
            this.pointLights.push(pointLight);
        }
        
        // Hemisphere light for atmosphere
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x98FB98, 0.6);
        this.scene.add(hemisphereLight);
    }
    
    async setupAudio() {
        this.audioListener = new THREE.AudioListener();
        this.camera.add(this.audioListener);
        
        // Create audio context for sound effects
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    async createWorld() {
        await this.createTerrain();
        await this.createBuildings();
        await this.createVehicles();
        await this.createCharacters();
        await this.createEnvironment();
        await this.createWeapons();
        await this.createPowerUps();
    }
    
    async createTerrain() {
        // Create detailed terrain
        const groundGeometry = new THREE.PlaneGeometry(300, 300, 200, 200);
        
        // Add height variation
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] = Math.random() * 3 - 1.5; // z coordinate (height)
        }
        groundGeometry.attributes.position.needsUpdate = true;
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2d5016,
            shininess: 10
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.objects.push(ground);
        
        // Add detailed grass
        for (let i = 0; i < 200; i++) {
            const grassGeometry = new THREE.ConeGeometry(0.3, 1.5, 6);
            const grassMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(0.3, 0.8, 0.4 + Math.random() * 0.3)
            });
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            grass.position.set(
                (Math.random() - 0.5) * 280,
                0.75,
                (Math.random() - 0.5) * 280
            );
            grass.castShadow = true;
            this.scene.add(grass);
            this.objects.push(grass);
        }
    }
    
    async createBuildings() {
        // Create epic buildings
        for (let i = 0; i < 25; i++) {
            const width = 10 + Math.random() * 20;
            const height = 20 + Math.random() * 40;
            const depth = 10 + Math.random() * 20;
            
            const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
            const buildingMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.3, 0.3 + Math.random() * 0.4),
                shininess: 50
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            building.position.set(
                (Math.random() - 0.5) * 250,
                height / 2,
                (Math.random() - 0.5) * 250
            );
            
            building.castShadow = true;
            building.receiveShadow = true;
            this.scene.add(building);
            this.objects.push(building);
            
            // Add glowing windows
            for (let j = 0; j < 5; j++) {
                const windowGeometry = new THREE.PlaneGeometry(1.5, 2);
                const windowMaterial = new THREE.MeshBasicMaterial({ 
                    color: new THREE.Color().setHSL(0.6, 0.8, 0.8),
                    transparent: true,
                    opacity: 0.8
                });
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(
                    building.position.x + (Math.random() - 0.5) * width,
                    building.position.y + (Math.random() - 0.5) * height,
                    building.position.z + depth / 2 + 0.01
                );
                this.scene.add(window);
                this.objects.push(window);
            }
        }
    }
    
    async createVehicles() {
        // Create epic vehicles
        for (let i = 0; i < 15; i++) {
            const carGroup = new THREE.Group();
            
            // Car body
            const carGeometry = new THREE.BoxGeometry(5, 2.5, 10);
            const carMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
                shininess: 100
            });
            const car = new THREE.Mesh(carGeometry, carMaterial);
            
            // Wheels
            for (let j = 0; j < 4; j++) {
                const wheelGeometry = new THREE.CylinderGeometry(1, 1, 1, 12);
                const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
                const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                
                const wheelPositions = [
                    [-2, -1, -4], [2, -1, -4],
                    [-2, -1, 4], [2, -1, 4]
                ];
                
                wheel.position.set(wheelPositions[j][0], wheelPositions[j][1], wheelPositions[j][2]);
                wheel.rotation.z = Math.PI / 2;
                carGroup.add(wheel);
            }
            
            carGroup.add(car);
            carGroup.position.set(
                (Math.random() - 0.5) * 200,
                1.25,
                (Math.random() - 0.5) * 200
            );
            
            carGroup.castShadow = true;
            carGroup.receiveShadow = true;
            this.scene.add(carGroup);
            this.objects.push(carGroup);
        }
    }
    
    async createCharacters() {
        // Create NPCs
        for (let i = 0; i < 20; i++) {
            const character = new THREE.Group();
            
            // Body
            const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.6, 3.5, 8);
            const bodyMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.4, 0.6)
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            
            // Head
            const headGeometry = new THREE.SphereGeometry(0.7, 12, 8);
            const headMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.5, 0.8)
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            
            body.position.y = 1.75;
            head.position.y = 4;
            
            character.add(body);
            character.add(head);
            
            character.position.set(
                (Math.random() - 0.5) * 200,
                0,
                (Math.random() - 0.5) * 200
            );
            
            character.castShadow = true;
            character.receiveShadow = true;
            this.scene.add(character);
            this.objects.push(character);
        }
    }
    
    async createEnvironment() {
        // Create epic trees
        for (let i = 0; i < 50; i++) {
            const treeGroup = new THREE.Group();
            
            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 12, 8);
            const trunkMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.6, 0.3)
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 6;
            trunk.castShadow = true;
            
            // Leaves
            const leavesGeometry = new THREE.SphereGeometry(4, 12, 8);
            const leavesMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(0.3, 0.8, 0.4)
            });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 14;
            leaves.castShadow = true;
            
            treeGroup.add(trunk);
            treeGroup.add(leaves);
            
            treeGroup.position.set(
                (Math.random() - 0.5) * 250,
                0,
                (Math.random() - 0.5) * 250
            );
            
            this.scene.add(treeGroup);
            this.objects.push(treeGroup);
        }
        
        // Create rocks and obstacles
        for (let i = 0; i < 30; i++) {
            const rockGeometry = new THREE.DodecahedronGeometry(2 + Math.random() * 3);
            const rockMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.2, 0.4),
                shininess: 5
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            
            rock.position.set(
                (Math.random() - 0.5) * 220,
                1,
                (Math.random() - 0.5) * 220
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);
            this.objects.push(rock);
        }
    }
    
    async createWeapons() {
        // Create weapon pickup points
        for (let i = 0; i < 10; i++) {
            const weaponGeometry = new THREE.BoxGeometry(1, 0.5, 4);
            const weaponMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x444444,
                shininess: 100
            });
            const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
            
            weapon.position.set(
                (Math.random() - 0.5) * 200,
                1,
                (Math.random() - 0.5) * 200
            );
            
            weapon.castShadow = true;
            weapon.receiveShadow = true;
            this.scene.add(weapon);
            this.objects.push(weapon);
        }
    }
    
    async createPowerUps() {
        // Create power-up items
        for (let i = 0; i < 15; i++) {
            const powerUpGeometry = new THREE.SphereGeometry(0.8, 12, 8);
            const powerUpMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.7),
                shininess: 100
            });
            const powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
            
            powerUp.position.set(
                (Math.random() - 0.5) * 200,
                1,
                (Math.random() - 0.5) * 200
            );
            
            powerUp.castShadow = true;
            powerUp.receiveShadow = true;
            this.scene.add(powerUp);
            this.objects.push(powerUp);
        }
    }
    
    spawnEnemies() {
        // Create enemy AI
        for (let i = 0; i < 10; i++) {
            const enemy = this.createEnemy();
            this.enemies.push(enemy);
        }
    }
    
    createEnemy() {
        const enemyGroup = new THREE.Group();
        
        // Enemy body
        const bodyGeometry = new THREE.CylinderGeometry(0.7, 0.7, 4, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            shininess: 30
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Enemy head
        const headGeometry = new THREE.SphereGeometry(0.8, 12, 8);
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B0000
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        
        body.position.y = 2;
        head.position.y = 4.5;
        
        enemyGroup.add(body);
        enemyGroup.add(head);
        
        enemyGroup.position.set(
            (Math.random() - 0.5) * 200,
            0,
            (Math.random() - 0.5) * 200
        );
        
        enemyGroup.castShadow = true;
        enemyGroup.receiveShadow = true;
        this.scene.add(enemyGroup);
        
        // Enemy AI properties
        enemyGroup.userData = {
            health: 100,
            speed: 2 + Math.random() * 3,
            attackRange: 15,
            lastAttack: 0,
            target: this.camera.position,
            isAlive: true
        };
        
        return enemyGroup;
    }
    
    async setupPostProcessing() {
        // Setup epic post-processing effects
        this.composer = new THREE.EffectComposer(this.renderer);
        
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom effect for epic visuals
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            2.0, 0.4, 0.85
        );
        this.composer.addPass(bloomPass);
        
        // Film grain for cinematic effect
        const filmPass = new THREE.FilmPass(0.35, 0.025, 648, false);
        this.composer.addPass(filmPass);
        
        // FXAA for anti-aliasing
        const fxaaPass = new THREE.FXAAPass();
        this.composer.addPass(fxaaPass);
    }
    
    async setupPhysics() {
        // Simple physics for bullets and explosions
        this.physicsObjects = [];
    }
    
    setupControls() {
        document.addEventListener('click', () => {
            if (!this.controls.isLocked) {
                this.controls.lock();
            }
        });
        
        this.controls.addEventListener('lock', () => {
            console.log('🎮 Controls locked - Ready for action!');
        });
        
        this.controls.addEventListener('unlock', () => {
            console.log('🎮 Controls unlocked');
        });
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            // Game controls
            if (event.code === 'KeyR' && !this.gameState.isReloading) {
                this.reload();
            } else if (event.code === 'KeyG') {
                this.throwGrenade();
            } else if (event.code === 'KeyE') {
                this.interact();
            } else if (event.code === 'Tab') {
                this.showScoreboard();
            } else if (event.code === 'Escape') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Mouse events
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left click
                this.mouse.buttons.left = true;
                this.shoot();
            } else if (event.button === 2) { // Right click
                this.mouse.buttons.right = true;
                this.aim();
            }
        });
        
        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.mouse.buttons.left = false;
            } else if (event.button === 2) {
                this.mouse.buttons.right = false;
                this.stopAim();
            }
        });
        
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.composer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    updatePlayer() {
        if (!this.controls.isLocked || this.gameState.isPaused) return;
        
        const delta = this.clock.getDelta();
        const moveSpeed = this.keys['ShiftLeft'] ? this.player.runSpeed : this.player.speed;
        
        // Movement
        const direction = new THREE.Vector3();
        
        if (this.keys['KeyW']) direction.z -= 1;
        if (this.keys['KeyS']) direction.z += 1;
        if (this.keys['KeyA']) direction.x -= 1;
        if (this.keys['KeyD']) direction.x += 1;
        
        if (direction.length() > 0) {
            direction.normalize();
            direction.applyQuaternion(this.camera.quaternion);
            direction.y = 0;
            
            this.controls.getObject().position.add(direction.multiplyScalar(moveSpeed * delta));
        }
        
        // Jumping
        if (this.keys['Space'] && this.player.onGround) {
            this.player.velocity.y = this.player.jumpForce;
            this.player.onGround = false;
        }
        
        // Apply gravity
        this.player.velocity.y -= 25 * delta;
        this.controls.getObject().position.y += this.player.velocity.y * delta;
        
        // Ground collision
        if (this.controls.getObject().position.y <= 1) {
            this.controls.getObject().position.y = 1;
            this.player.velocity.y = 0;
            this.player.onGround = true;
        }
        
        // Update player position
        this.player.position.copy(this.controls.getObject().position);
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            if (!enemy.userData.isAlive) return;
            
            const delta = this.clock.getDelta();
            const playerPos = this.player.position;
            const enemyPos = enemy.position;
            
            // Calculate distance to player
            const distance = playerPos.distanceTo(enemyPos);
            
            if (distance < enemy.userData.attackRange) {
                // Attack player
                if (Date.now() - enemy.userData.lastAttack > 1000) {
                    this.enemyAttack(enemy);
                    enemy.userData.lastAttack = Date.now();
                }
            } else if (distance < 50) {
                // Move towards player
                const direction = playerPos.clone().sub(enemyPos).normalize();
                enemy.position.add(direction.multiplyScalar(enemy.userData.speed * delta));
                
                // Rotate enemy to face player
                enemy.lookAt(playerPos);
            }
        });
    }
    
    enemyAttack(enemy) {
        // Reduce player health
        this.gameState.health -= 10;
        this.updateUI();
        
        // Create attack effect
        this.createExplosion(enemy.position, 0xff0000, 2);
        
        // Play attack sound
        this.playSound('attack');
    }
    
    shoot() {
        if (this.gameState.ammo <= 0 || this.gameState.isReloading) return;
        
        this.gameState.ammo--;
        this.updateUI();
        
        // Create bullet
        const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        
        bullet.position.copy(this.camera.position);
        
        // Calculate bullet direction
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        
        bullet.userData = {
            velocity: direction.multiplyScalar(100),
            life: 2.0
        };
        
        this.scene.add(bullet);
        this.bullets.push(bullet);
        
        // Play shoot sound
        this.playSound('shoot');
        
        // Create muzzle flash
        this.createMuzzleFlash();
    }
    
    updateBullets() {
        const delta = this.clock.getDelta();
        
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Update position
            bullet.position.add(bullet.userData.velocity.clone().multiplyScalar(delta));
            
            // Reduce life
            bullet.userData.life -= delta;
            
            // Check collision with enemies
            this.enemies.forEach(enemy => {
                if (enemy.userData.isAlive && bullet.position.distanceTo(enemy.position) < 2) {
                    this.hitEnemy(enemy, bullet);
                }
            });
            
            // Remove bullet if life expired
            if (bullet.userData.life <= 0) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }
    
    hitEnemy(enemy, bullet) {
        enemy.userData.health -= 25;
        
        if (enemy.userData.health <= 0) {
            enemy.userData.isAlive = false;
            this.scene.remove(enemy);
            this.gameState.score += 100;
            this.gameState.enemiesKilled++;
            this.createExplosion(enemy.position, 0xff6b6b, 5);
            this.playSound('explosion');
        } else {
            this.createExplosion(enemy.position, 0xff0000, 2);
        }
        
        // Remove bullet
        this.scene.remove(bullet);
        this.bullets.splice(this.bullets.indexOf(bullet), 1);
        
        this.updateUI();
    }
    
    createExplosion(position, color, size) {
        const explosionGroup = new THREE.Group();
        
        for (let i = 0; i < 20; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: color,
                transparent: true,
                opacity: 1
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            particle.position.copy(position);
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 20,
                    Math.random() * 15,
                    (Math.random() - 0.5) * 20
                ),
                life: 1.0,
                gravity: -10
            };
            
            explosionGroup.add(particle);
        }
        
        this.scene.add(explosionGroup);
        this.explosions.push(explosionGroup);
    }
    
    updateExplosions() {
        const delta = this.clock.getDelta();
        
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            
            explosion.children.forEach(particle => {
                // Update position
                particle.position.add(particle.userData.velocity.clone().multiplyScalar(delta));
                
                // Apply gravity
                particle.userData.velocity.y += particle.userData.gravity * delta;
                
                // Reduce life
                particle.userData.life -= delta;
                particle.material.opacity = particle.userData.life;
                
                // Scale down
                particle.scale.multiplyScalar(0.95);
            });
            
            // Remove explosion if all particles are dead
            if (explosion.children.length === 0 || explosion.children[0].userData.life <= 0) {
                this.scene.remove(explosion);
                this.explosions.splice(i, 1);
            }
        }
    }
    
    createMuzzleFlash() {
        const flashGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const flashMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 0.8
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        
        flash.position.copy(this.camera.position);
        flash.position.add(new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion));
        
        this.scene.add(flash);
        
        // Remove flash after short time
        setTimeout(() => {
            this.scene.remove(flash);
        }, 100);
    }
    
    reload() {
        if (this.gameState.isReloading) return;
        
        this.gameState.isReloading = true;
        this.playSound('reload');
        
        setTimeout(() => {
            this.gameState.ammo = this.gameState.maxAmmo;
            this.gameState.isReloading = false;
            this.updateUI();
        }, 2000);
    }
    
    aim() {
        this.gameState.isAiming = true;
        this.camera.fov = 45; // Zoom in
        this.camera.updateProjectionMatrix();
    }
    
    stopAim() {
        this.gameState.isAiming = false;
        this.camera.fov = 75; // Zoom out
        this.camera.updateProjectionMatrix();
    }
    
    throwGrenade() {
        // Create grenade
        const grenadeGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const grenadeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const grenade = new THREE.Mesh(grenadeGeometry, grenadeMaterial);
        
        grenade.position.copy(this.camera.position);
        
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        
        grenade.userData = {
            velocity: direction.multiplyScalar(30),
            gravity: -15,
            life: 3.0
        };
        
        this.scene.add(grenade);
        this.bullets.push(grenade);
        
        this.playSound('grenade');
    }
    
    interact() {
        // Check for nearby interactable objects
        console.log('🔍 Interacting...');
    }
    
    showScoreboard() {
        console.log(`🏆 Score: ${this.gameState.score} | Enemies Killed: ${this.gameState.enemiesKilled}`);
    }
    
    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        console.log(this.gameState.isPaused ? '⏸️ Game Paused' : '▶️ Game Resumed');
    }
    
    playSound(type) {
        // Simple sound generation using Web Audio API
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch(type) {
            case 'shoot':
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
                break;
            case 'explosion':
                oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
                break;
            case 'reload':
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
                break;
            case 'attack':
                oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                break;
            case 'grenade':
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    updateUI() {
        document.getElementById('health').textContent = `❤️ Health: ${this.gameState.health}`;
        document.getElementById('score').textContent = `⭐ Score: ${this.gameState.score}`;
        document.getElementById('ammo').textContent = `🔫 Ammo: ${this.gameState.ammo}`;
        document.getElementById('objects').textContent = `Objects: ${this.objects.length}`;
    }
    
    updateStats() {
        this.stats.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.stats.lastTime >= 1000) {
            this.stats.fps = Math.round((this.stats.frameCount * 1000) / (currentTime - this.stats.lastTime));
            this.stats.frameCount = 0;
            this.stats.lastTime = currentTime;
            
            document.getElementById('fps').textContent = `FPS: ${this.stats.fps}`;
        }
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.gameState.isPaused) {
            this.updatePlayer();
            this.updateEnemies();
            this.updateBullets();
            this.updateExplosions();
            this.updateStats();
            
            // Animate point lights
            this.pointLights.forEach((light, index) => {
                light.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
                light.intensity = 1 + Math.sin(Date.now() * 0.002 + index) * 0.5;
            });
            
            // Rotate some objects
            this.objects.forEach((obj, index) => {
                if (index % 11 === 0) {
                    obj.rotation.y += 0.005;
                }
            });
        }
        
        // Render
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize the epic game when the page loads
window.addEventListener('load', () => {
    new EpicGame3D();
});