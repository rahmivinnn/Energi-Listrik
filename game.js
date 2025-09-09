// ELECTRICAL FLOW SIMULATOR 3D
class ElectricalFlowSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
        
        // Electrical components
        this.generators = [];
        this.transformers = [];
        this.switches = [];
        this.resistors = [];
        this.capacitors = [];
        this.wires = [];
        this.loads = [];
        this.electricalFlow = [];
        
        // Electrical properties
        this.electricalState = {
            voltage: 0,
            current: 0,
            power: 0,
            resistance: 0,
            efficiency: 0,
            circuitClosed: false,
            frequency: 50 // Hz
        };
        
        // Performance tracking
        this.clock = new THREE.Clock();
        this.stats = {
            fps: 0,
            frameCount: 0,
            lastTime: 0
        };
        
        // Player state
        this.player = {
            velocity: new THREE.Vector3(),
            onGround: false,
            speed: 8,
            runSpeed: 15,
            jumpForce: 20
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
            await this.createElectricalWorld();
            await this.setupPostProcessing();
            this.setupControls();
            this.setupEventListeners();
            this.hideLoading();
            this.animate();
        } catch (error) {
            console.error('Failed to initialize electrical simulator:', error);
        }
    }
    
    async setupScene() {
        // Create scene with electrical atmosphere
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a1a, 20, 100);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 15, 20);
        
        // Create renderer with electrical theme
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
        this.renderer.toneMappingExposure = 1.8;
        
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
        
        // Setup controls
        this.controls = new THREE.PointerLockControls(this.camera, document.body);
        this.scene.add(this.controls.getObject());
    }
    
    async setupLighting() {
        // Electrical ambient light
        const ambientLight = new THREE.AmbientLight(0x404080, 0.3);
        this.scene.add(ambientLight);
        
        // Main electrical light (like a power station)
        const mainLight = new THREE.DirectionalLight(0x00ffff, 2);
        mainLight.position.set(0, 50, 0);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        
        // Electrical point lights
        this.electricalLights = [];
        for (let i = 0; i < 8; i++) {
            const pointLight = new THREE.PointLight(
                new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.8, 0.8),
                2, 
                30
            );
            pointLight.position.set(
                (Math.random() - 0.5) * 100,
                5 + Math.random() * 10,
                (Math.random() - 0.5) * 100
            );
            pointLight.castShadow = true;
            this.scene.add(pointLight);
            this.electricalLights.push(pointLight);
        }
        
        // Electrical atmosphere
        const hemisphereLight = new THREE.HemisphereLight(0x004080, 0x001040, 0.5);
        this.scene.add(hemisphereLight);
    }
    
    async setupAudio() {
        this.audioListener = new THREE.AudioListener();
        this.camera.add(this.audioListener);
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    async createElectricalWorld() {
        await this.createPowerStation();
        await this.createGenerators();
        await this.createTransformers();
        await this.createSwitches();
        await this.createResistors();
        await this.createCapacitors();
        await this.createWires();
        await this.createLoads();
        await this.createElectricalFlow();
    }
    
    async createPowerStation() {
        // Main power station building
        const stationGeometry = new THREE.BoxGeometry(20, 15, 20);
        const stationMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2a2a2a,
            shininess: 50
        });
        const station = new THREE.Mesh(stationGeometry, stationMaterial);
        station.position.set(0, 7.5, 0);
        station.castShadow = true;
        station.receiveShadow = true;
        this.scene.add(station);
        
        // Power station lights
        for (let i = 0; i < 4; i++) {
            const lightGeometry = new THREE.SphereGeometry(0.5, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(
                (i % 2 === 0 ? -8 : 8),
                12,
                (i < 2 ? -8 : 8)
            );
            this.scene.add(light);
        }
    }
    
    async createGenerators() {
        // Create electrical generators
        for (let i = 0; i < 5; i++) {
            const generatorGroup = new THREE.Group();
            
            // Generator body
            const bodyGeometry = new THREE.CylinderGeometry(2, 2, 4, 12);
            const bodyMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x444444,
                shininess: 100
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            
            // Generator rotor
            const rotorGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 8);
            const rotorMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x888888,
                shininess: 100
            });
            const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
            rotor.position.y = 2.25;
            
            generatorGroup.add(body);
            generatorGroup.add(rotor);
            
            generatorGroup.position.set(
                -30 + i * 15,
                2,
                0
            );
            
            generatorGroup.castShadow = true;
            generatorGroup.receiveShadow = true;
            this.scene.add(generatorGroup);
            
            generatorGroup.userData = {
                type: 'generator',
                voltage: 220,
                frequency: 50,
                isActive: true,
                rotor: rotor
            };
            
            this.generators.push(generatorGroup);
        }
    }
    
    async createTransformers() {
        // Create electrical transformers
        for (let i = 0; i < 8; i++) {
            const transformerGroup = new THREE.Group();
            
            // Transformer core
            const coreGeometry = new THREE.BoxGeometry(3, 6, 2);
            const coreMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x333333,
                shininess: 30
            });
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            
            // Transformer coils
            const coilGeometry = new THREE.TorusGeometry(1.5, 0.3, 8, 16);
            const coilMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x666666,
                shininess: 80
            });
            
            const coil1 = new THREE.Mesh(coilGeometry, coilMaterial);
            coil1.position.y = 2;
            coil1.rotation.x = Math.PI / 2;
            
            const coil2 = new THREE.Mesh(coilGeometry, coilMaterial);
            coil2.position.y = -2;
            coil2.rotation.x = Math.PI / 2;
            
            transformerGroup.add(core);
            transformerGroup.add(coil1);
            transformerGroup.add(coil2);
            
            transformerGroup.position.set(
                (Math.random() - 0.5) * 80,
                3,
                (Math.random() - 0.5) * 80
            );
            
            transformerGroup.castShadow = true;
            transformerGroup.receiveShadow = true;
            this.scene.add(transformerGroup);
            
            transformerGroup.userData = {
                type: 'transformer',
                inputVoltage: 220,
                outputVoltage: 12,
                isActive: true,
                coils: [coil1, coil2]
            };
            
            this.transformers.push(transformerGroup);
        }
    }
    
    async createSwitches() {
        // Create electrical switches
        for (let i = 0; i < 12; i++) {
            const switchGroup = new THREE.Group();
            
            // Switch base
            const baseGeometry = new THREE.BoxGeometry(2, 0.5, 1);
            const baseMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x222222,
                shininess: 50
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            
            // Switch lever
            const leverGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
            const leverMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x666666,
                shininess: 80
            });
            const lever = new THREE.Mesh(leverGeometry, leverMaterial);
            lever.position.y = 1;
            
            switchGroup.add(base);
            switchGroup.add(lever);
            
            switchGroup.position.set(
                (Math.random() - 0.5) * 60,
                0.25,
                (Math.random() - 0.5) * 60
            );
            
            switchGroup.castShadow = true;
            switchGroup.receiveShadow = true;
            this.scene.add(switchGroup);
            
            switchGroup.userData = {
                type: 'switch',
                isOn: false,
                lever: lever
            };
            
            this.switches.push(switchGroup);
        }
    }
    
    async createResistors() {
        // Create electrical resistors
        for (let i = 0; i < 15; i++) {
            const resistorGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
            const resistorMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.8, 0.5),
                shininess: 100
            });
            const resistor = new THREE.Mesh(resistorGeometry, resistorMaterial);
            
            resistor.position.set(
                (Math.random() - 0.5) * 70,
                1,
                (Math.random() - 0.5) * 70
            );
            resistor.rotation.z = Math.PI / 2;
            
            resistor.castShadow = true;
            resistor.receiveShadow = true;
            this.scene.add(resistor);
            
            resistor.userData = {
                type: 'resistor',
                resistance: 100 + Math.random() * 900, // 100-1000 ohms
                isActive: true
            };
            
            this.resistors.push(resistor);
        }
    }
    
    async createCapacitors() {
        // Create electrical capacitors
        for (let i = 0; i < 10; i++) {
            const capacitorGroup = new THREE.Group();
            
            // Capacitor body
            const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
            const bodyMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x444444,
                shininess: 100
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            
            // Capacitor terminals
            const terminalGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
            const terminalMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x888888,
                shininess: 100
            });
            
            const terminal1 = new THREE.Mesh(terminalGeometry, terminalMaterial);
            terminal1.position.set(-0.3, 0.75, 0);
            
            const terminal2 = new THREE.Mesh(terminalGeometry, terminalMaterial);
            terminal2.position.set(0.3, 0.75, 0);
            
            capacitorGroup.add(body);
            capacitorGroup.add(terminal1);
            capacitorGroup.add(terminal2);
            
            capacitorGroup.position.set(
                (Math.random() - 0.5) * 50,
                0.5,
                (Math.random() - 0.5) * 50
            );
            
            capacitorGroup.castShadow = true;
            capacitorGroup.receiveShadow = true;
            this.scene.add(capacitorGroup);
            
            capacitorGroup.userData = {
                type: 'capacitor',
                capacitance: 0.001 + Math.random() * 0.009, // 1-10 mF
                isActive: true
            };
            
            this.capacitors.push(capacitorGroup);
        }
    }
    
    async createWires() {
        // Create electrical wires connecting components
        for (let i = 0; i < 20; i++) {
            const wireGeometry = new THREE.CylinderGeometry(0.05, 0.05, 10, 8);
            const wireMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x888888,
                shininess: 100
            });
            const wire = new THREE.Mesh(wireGeometry, wireMaterial);
            
            wire.position.set(
                (Math.random() - 0.5) * 80,
                1,
                (Math.random() - 0.5) * 80
            );
            wire.rotation.z = Math.random() * Math.PI;
            
            wire.castShadow = true;
            wire.receiveShadow = true;
            this.scene.add(wire);
            
            wire.userData = {
                type: 'wire',
                resistance: 0.1,
                isActive: true,
                current: 0
            };
            
            this.wires.push(wire);
        }
    }
    
    async createLoads() {
        // Create electrical loads (lights, motors, etc.)
        for (let i = 0; i < 20; i++) {
            const loadGroup = new THREE.Group();
            
            // Load base
            const baseGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 8);
            const baseMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x333333,
                shininess: 50
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            
            // Load indicator (light)
            const lightGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x000000,
                transparent: true,
                opacity: 0.8
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.y = 0.5;
            
            loadGroup.add(base);
            loadGroup.add(light);
            
            loadGroup.position.set(
                (Math.random() - 0.5) * 60,
                0.25,
                (Math.random() - 0.5) * 60
            );
            
            loadGroup.castShadow = true;
            loadGroup.receiveShadow = true;
            this.scene.add(loadGroup);
            
            loadGroup.userData = {
                type: 'load',
                power: 10 + Math.random() * 90, // 10-100W
                isActive: false,
                light: light
            };
            
            this.loads.push(loadGroup);
        }
    }
    
    async createElectricalFlow() {
        // Create visual representation of electrical flow
        for (let i = 0; i < 50; i++) {
            const flowGeometry = new THREE.SphereGeometry(0.1, 4, 4);
            const flowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8
            });
            const flow = new THREE.Mesh(flowGeometry, flowMaterial);
            
            flow.position.set(
                (Math.random() - 0.5) * 100,
                Math.random() * 10,
                (Math.random() - 0.5) * 100
            );
            
            flow.userData = {
                type: 'flow',
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 5,
                    0,
                    (Math.random() - 0.5) * 5
                ),
                life: 1.0
            };
            
            this.scene.add(flow);
            this.electricalFlow.push(flow);
        }
    }
    
    async setupPostProcessing() {
        // Setup electrical-themed post-processing
        this.composer = new THREE.EffectComposer(this.renderer);
        
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Electrical bloom effect
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            2.5, 0.4, 0.85
        );
        this.composer.addPass(bloomPass);
        
        // Film grain for electrical atmosphere
        const filmPass = new THREE.FilmPass(0.25, 0.025, 648, false);
        this.composer.addPass(filmPass);
        
        // FXAA for anti-aliasing
        const fxaaPass = new THREE.FXAAPass();
        this.composer.addPass(fxaaPass);
    }
    
    setupControls() {
        document.addEventListener('click', () => {
            if (!this.controls.isLocked) {
                this.controls.lock();
            }
        });
        
        this.controls.addEventListener('lock', () => {
            console.log('⚡ Electrical simulator controls locked!');
        });
        
        this.controls.addEventListener('unlock', () => {
            console.log('⚡ Electrical simulator controls unlocked');
        });
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            // Electrical controls
            if (event.code === 'KeyR') {
                this.resetCircuit();
            } else if (event.code === 'KeyT') {
                this.toggleTransformers();
            } else if (event.code === 'KeyG') {
                this.generatePower();
            } else if (event.code === 'Tab') {
                this.showCircuitDiagram();
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
                this.toggleSwitch();
            } else if (event.button === 2) { // Right click
                this.mouse.buttons.right = true;
                this.adjustResistor();
            }
        });
        
        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.mouse.buttons.left = false;
            } else if (event.button === 2) {
                this.mouse.buttons.right = false;
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
        if (!this.controls.isLocked) return;
        
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
    }
    
    updateElectricalSystem() {
        const delta = this.clock.getDelta();
        
        // Update generators
        this.generators.forEach(generator => {
            if (generator.userData.isActive) {
                generator.userData.rotor.rotation.y += delta * 10;
            }
        });
        
        // Update transformers
        this.transformers.forEach(transformer => {
            if (transformer.userData.isActive) {
                transformer.userData.coils.forEach(coil => {
                    coil.rotation.y += delta * 5;
                });
            }
        });
        
        // Update electrical flow
        this.electricalFlow.forEach(flow => {
            flow.position.add(flow.userData.velocity.clone().multiplyScalar(delta));
            flow.userData.life -= delta;
            
            if (flow.userData.life <= 0) {
                flow.position.set(
                    (Math.random() - 0.5) * 100,
                    Math.random() * 10,
                    (Math.random() - 0.5) * 100
                );
                flow.userData.life = 1.0;
            }
        });
        
        // Calculate electrical properties
        this.calculateElectricalProperties();
    }
    
    calculateElectricalProperties() {
        // Simple electrical calculations
        let totalResistance = 0;
        let totalVoltage = 0;
        let activeLoads = 0;
        
        // Calculate total resistance
        this.resistors.forEach(resistor => {
            if (resistor.userData.isActive) {
                totalResistance += resistor.userData.resistance;
            }
        });
        
        // Calculate total voltage from generators
        this.generators.forEach(generator => {
            if (generator.userData.isActive) {
                totalVoltage += generator.userData.voltage;
            }
        });
        
        // Count active loads
        this.loads.forEach(load => {
            if (load.userData.isActive) {
                activeLoads++;
            }
        });
        
        // Apply Ohm's Law: V = I * R, P = V * I
        if (totalResistance > 0) {
            this.electricalState.current = totalVoltage / totalResistance;
            this.electricalState.power = totalVoltage * this.electricalState.current;
        } else {
            this.electricalState.current = 0;
            this.electricalState.power = 0;
        }
        
        this.electricalState.voltage = totalVoltage;
        this.electricalState.resistance = totalResistance;
        this.electricalState.efficiency = activeLoads > 0 ? (activeLoads / this.loads.length) * 100 : 0;
        this.electricalState.circuitClosed = totalResistance > 0 && totalVoltage > 0;
        
        this.updateUI();
    }
    
    toggleSwitch() {
        // Find nearest switch and toggle it
        const playerPos = this.controls.getObject().position;
        let nearestSwitch = null;
        let minDistance = Infinity;
        
        this.switches.forEach(switchObj => {
            const distance = playerPos.distanceTo(switchObj.position);
            if (distance < minDistance && distance < 5) {
                minDistance = distance;
                nearestSwitch = switchObj;
            }
        });
        
        if (nearestSwitch) {
            nearestSwitch.userData.isOn = !nearestSwitch.userData.isOn;
            
            // Animate switch lever
            if (nearestSwitch.userData.isOn) {
                nearestSwitch.userData.lever.rotation.z = Math.PI / 4;
            } else {
                nearestSwitch.userData.lever.rotation.z = -Math.PI / 4;
            }
            
            this.playSound('switch');
            console.log(`🔌 Switch ${nearestSwitch.userData.isOn ? 'ON' : 'OFF'}`);
        }
    }
    
    adjustResistor() {
        // Find nearest resistor and adjust its value
        const playerPos = this.controls.getObject().position;
        let nearestResistor = null;
        let minDistance = Infinity;
        
        this.resistors.forEach(resistor => {
            const distance = playerPos.distanceTo(resistor.position);
            if (distance < minDistance && distance < 5) {
                minDistance = distance;
                nearestResistor = resistor;
            }
        });
        
        if (nearestResistor) {
            // Adjust resistance value
            nearestResistor.userData.resistance = Math.max(10, 
                nearestResistor.userData.resistance + (Math.random() - 0.5) * 200
            );
            
            // Change color based on resistance
            const hue = Math.min(0.1, nearestResistor.userData.resistance / 10000);
            nearestResistor.material.color.setHSL(hue, 0.8, 0.5);
            
            this.playSound('adjust');
            console.log(`🔧 Resistor adjusted to ${nearestResistor.userData.resistance.toFixed(1)}Ω`);
        }
    }
    
    resetCircuit() {
        // Reset all electrical components
        this.switches.forEach(switchObj => {
            switchObj.userData.isOn = false;
            switchObj.userData.lever.rotation.z = -Math.PI / 4;
        });
        
        this.loads.forEach(load => {
            load.userData.isActive = false;
            load.userData.light.material.color.setHex(0x000000);
        });
        
        this.electricalState.voltage = 0;
        this.electricalState.current = 0;
        this.electricalState.power = 0;
        
        this.playSound('reset');
        console.log('🔄 Circuit reset');
    }
    
    toggleTransformers() {
        this.transformers.forEach(transformer => {
            transformer.userData.isActive = !transformer.userData.isActive;
        });
        
        this.playSound('transformer');
        console.log('⚡ Transformers toggled');
    }
    
    generatePower() {
        this.generators.forEach(generator => {
            generator.userData.isActive = !generator.userData.isActive;
        });
        
        this.playSound('generator');
        console.log('🔋 Power generation toggled');
    }
    
    showCircuitDiagram() {
        console.log('📊 Circuit Status:');
        console.log(`⚡ Voltage: ${this.electricalState.voltage.toFixed(1)}V`);
        console.log(`🔌 Current: ${this.electricalState.current.toFixed(2)}A`);
        console.log(`💡 Power: ${this.electricalState.power.toFixed(1)}W`);
        console.log(`🔧 Resistance: ${this.electricalState.resistance.toFixed(1)}Ω`);
        console.log(`📊 Efficiency: ${this.electricalState.efficiency.toFixed(1)}%`);
    }
    
    togglePause() {
        console.log('⏸️ Simulation paused/resumed');
    }
    
    playSound(type) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch(type) {
            case 'switch':
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
                break;
            case 'adjust':
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.2);
                break;
            case 'generator':
                oscillator.frequency.setValueAtTime(50, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
                break;
            case 'transformer':
                oscillator.frequency.setValueAtTime(120, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(60, this.audioContext.currentTime + 0.3);
                break;
            case 'reset':
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.4);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    updateUI() {
        document.getElementById('voltage').textContent = `⚡ Voltage: ${this.electricalState.voltage.toFixed(1)}V`;
        document.getElementById('current').textContent = `🔌 Current: ${this.electricalState.current.toFixed(2)}A`;
        document.getElementById('power').textContent = `💡 Power: ${this.electricalState.power.toFixed(1)}W`;
        document.getElementById('resistance').textContent = `🔧 Resistance: ${this.electricalState.resistance.toFixed(1)}Ω`;
        document.getElementById('efficiency').textContent = `📊 Efficiency: ${this.electricalState.efficiency.toFixed(1)}%`;
        
        const circuitStatus = document.getElementById('circuit-status');
        if (this.electricalState.circuitClosed) {
            circuitStatus.textContent = '🟢 Circuit Closed';
            circuitStatus.className = 'circuit-closed';
        } else {
            circuitStatus.textContent = '🔴 Circuit Open';
            circuitStatus.className = '';
        }
    }
    
    updateStats() {
        this.stats.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.stats.lastTime >= 1000) {
            this.stats.fps = Math.round((this.stats.frameCount * 1000) / (currentTime - this.stats.lastTime));
            this.stats.frameCount = 0;
            this.stats.lastTime = currentTime;
        }
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updatePlayer();
        this.updateElectricalSystem();
        this.updateStats();
        
        // Animate electrical lights
        this.electricalLights.forEach((light, index) => {
            light.intensity = 1 + Math.sin(Date.now() * 0.003 + index) * 0.5;
            light.position.y += Math.sin(Date.now() * 0.002 + index) * 0.01;
        });
        
        // Render
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize the electrical flow simulator
window.addEventListener('load', () => {
    new ElectricalFlowSimulator();
});