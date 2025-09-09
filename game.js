// Realistic 3D Game Simulation
class Game3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.objects = [];
        this.clock = new THREE.Clock();
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupLighting();
        this.createWorld();
        this.setupControls();
        this.setupEventListeners();
        this.hideLoading();
        this.animate();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 0);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
        
        this.controls = new THREE.PointerLockControls(this.camera, document.body);
        this.scene.add(this.controls.getObject());
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        
        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0xff6b6b, 0.8, 30);
        pointLight1.position.set(20, 5, 20);
        pointLight1.castShadow = true;
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.6, 25);
        pointLight2.position.set(-20, 8, -20);
        pointLight2.castShadow = true;
        this.scene.add(pointLight2);
        
        // Hemisphere light for sky
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x98FB98, 0.4);
        this.scene.add(hemisphereLight);
    }
    
    createWorld() {
        this.createTerrain();
        this.createBuildings();
        this.createVehicles();
        this.createCharacters();
        this.createEnvironment();
    }
    
    createTerrain() {
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.objects.push(ground);
        
        // Add grass patches
        for (let i = 0; i < 50; i++) {
            const grassGeometry = new THREE.ConeGeometry(0.5, 2, 6);
            const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            grass.position.set(
                (Math.random() - 0.5) * 180,
                1,
                (Math.random() - 0.5) * 180
            );
            grass.castShadow = true;
            this.scene.add(grass);
            this.objects.push(grass);
        }
    }
    
    createBuildings() {
        for (let i = 0; i < 15; i++) {
            const width = 8 + Math.random() * 12;
            const height = 15 + Math.random() * 25;
            const depth = 8 + Math.random() * 12;
            
            const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
            const buildingMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.2, 0.4 + Math.random() * 0.3)
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            building.position.set(
                (Math.random() - 0.5) * 150,
                height / 2,
                (Math.random() - 0.5) * 150
            );
            
            building.castShadow = true;
            building.receiveShadow = true;
            this.scene.add(building);
            this.objects.push(building);
        }
    }
    
    createVehicles() {
        for (let i = 0; i < 8; i++) {
            const carGeometry = new THREE.BoxGeometry(4, 2, 8);
            const carMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
            });
            const car = new THREE.Mesh(carGeometry, carMaterial);
            
            car.position.set(
                (Math.random() - 0.5) * 100,
                1,
                (Math.random() - 0.5) * 100
            );
            
            car.castShadow = true;
            car.receiveShadow = true;
            this.scene.add(car);
            this.objects.push(car);
        }
    }
    
    createCharacters() {
        for (let i = 0; i < 10; i++) {
            const character = new THREE.Group();
            
            const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
            const bodyMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.3, 0.7)
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            
            const headGeometry = new THREE.SphereGeometry(0.6, 12, 8);
            const headMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.4, 0.8)
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            
            body.position.y = 1.5;
            head.position.y = 3.5;
            
            character.add(body);
            character.add(head);
            
            character.position.set(
                (Math.random() - 0.5) * 120,
                0,
                (Math.random() - 0.5) * 120
            );
            
            character.castShadow = true;
            character.receiveShadow = true;
            this.scene.add(character);
            this.objects.push(character);
        }
    }
    
    createEnvironment() {
        for (let i = 0; i < 30; i++) {
            const treeGroup = new THREE.Group();
            
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 8, 8);
            const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 4;
            trunk.castShadow = true;
            
            const leavesGeometry = new THREE.SphereGeometry(3, 12, 8);
            const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 10;
            leaves.castShadow = true;
            
            treeGroup.add(trunk);
            treeGroup.add(leaves);
            
            treeGroup.position.set(
                (Math.random() - 0.5) * 160,
                0,
                (Math.random() - 0.5) * 160
            );
            
            this.scene.add(treeGroup);
            this.objects.push(treeGroup);
        }
    }
    
    setupControls() {
        document.addEventListener('click', () => {
            if (!this.controls.isLocked) {
                this.controls.lock();
            }
        });
        
        this.controls.addEventListener('lock', () => {
            console.log('Controls locked');
        });
        
        this.controls.addEventListener('unlock', () => {
            console.log('Controls unlocked');
        });
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate some objects for animation
        this.objects.forEach((obj, index) => {
            if (index % 7 === 0) {
                obj.rotation.y += 0.01;
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    new Game3D();
});
