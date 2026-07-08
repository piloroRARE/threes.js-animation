/**
 * Animation 3D avec Three.js
 * Génération procédurale de terrain + Texture Ouattée (Worley Noise)
 * 
 * Concepts clés:
 * - Perlin Noise pour le terrain
 * - Worley Noise pour la texture ouattée (effet nuage/marbre)
 * - Génération procédurale
 * - Animation fluide
 */

// ============================================
// CONFIGURATION & VARIABLES GLOBALES
// ============================================

let scene, camera, renderer, controls;
let terrainMesh, cloudMesh;
let isAnimating = true;
let time = 0;
let terrainScale = 50;
let animationSpeed = 1;
let seed = Math.random() * 10000;

// ============================================
// IMPLEMENTATION DU NOISE
// ============================================

/**
 * Implémentation simplifiée du Perlin Noise pour la génération du terrain
 * Basé sur l'algorithme de Ken Perlin
 */
class PerlinNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.permutation = this.generatePermutation();
        this.gradients = {};
        
        // Pré-calculer les gradients
        for (let i = 0; i < 256; i++) {
            this.gradients[i] = {
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1,
                z: Math.random() * 2 - 1
            };
        }
    }
    
    generatePermutation() {
        const p = [];
        for (let i = 0; i < 256; i++) p[i] = i;
        
        // Mélanger avec le seed
        for (let i = 255; i > 0; i--) {
            const j = Math.floor((this.seed + i) * 16807 % (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        
        return [...p, ...p]; // Dupliquer pour éviter les modulo
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(a, b, t) {
        return a + t * (b - a);
    }
    
    grad(hash, x, y, z) {
        const g = this.gradients[hash % 256];
        return g.x * x + g.y * y + g.z * z;
    }
    
    noise3D(x, y, z) {
        // Trouver la cellule unitaire
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        
        // Coordonnées relatives
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        
        // Fonction de fade
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        
        // Hash des coins
        const A = this.permutation[X] + Y;
        const AA = this.permutation[A] + Z;
        const AB = this.permutation[A + 1] + Z;
        const B = this.permutation[X + 1] + Y;
        const BA = this.permutation[B] + Z;
        const BB = this.permutation[B + 1] + Z;
        
        // Calculer les contributions
        return this.lerp(
            this.lerp(
                this.lerp(
                    this.grad(this.permutation[AA], x, y, z),
                    this.grad(this.permutation[BA], x - 1, y, z),
                    u
                ),
                this.lerp(
                    this.grad(this.permutation[AB], x, y - 1, z),
                    this.grad(this.permutation[BB], x - 1, y - 1, z),
                    u
                ),
                v
            ),
            this.lerp(
                this.lerp(
                    this.grad(this.permutation[AA + 1], x, y, z - 1),
                    this.grad(this.permutation[BA + 1], x - 1, y, z - 1),
                    u
                ),
                this.lerp(
                    this.grad(this.permutation[AB + 1], x, y - 1, z - 1),
                    this.grad(this.permutation[BB + 1], x - 1, y - 1, z - 1),
                    u
                ),
                v
            ),
            w
        );
    }
    
    // Octave noise pour plus de détails
    octaveNoise(x, y, z, octaves = 4, persistence = 0.5) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }
        
        return total / maxValue;
    }
}

/**
 * Implémentation du Worley Noise pour la texture ouattée
 * Crée un effet de cellules organiques (comme des nuages ou du marbre)
 */
class WorleyNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.points = [];
        this.size = 100; // Taille de la grille de points
    }
    
    // Générer des points aléatoires
    generatePoints(count = 50) {
        this.points = [];
        for (let i = 0; i < count; i++) {
            this.points.push({
                x: Math.random() * this.size - this.size / 2,
                y: Math.random() * this.size - this.size / 2,
                z: Math.random() * this.size - this.size / 2
            });
        }
    }
    
    // Distance euclidienne
    distance(p1, p2) {
        return Math.sqrt(
            Math.pow(p1.x - p2.x, 2) +
            Math.pow(p1.y - p2.y, 2) +
            Math.pow(p1.z - p2.z, 2)
        );
    }
    
    // Worley Noise F1 (distance au point le plus proche)
    noise3D(x, y, z) {
        let minDist = Infinity;
        
        for (const point of this.points) {
            const dx = x - point.x;
            const dy = y - point.y;
            const dz = z - point.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < minDist) {
                minDist = dist;
            }
        }
        
        return minDist / (this.size / 2); // Normaliser
    }
    
    // Worley Noise F1-F2 (différence entre premier et deuxième plus proche)
    noise3D_F1F2(x, y, z) {
        let dist1 = Infinity;
        let dist2 = Infinity;
        
        for (const point of this.points) {
            const dx = x - point.x;
            const dy = y - point.y;
            const dz = z - point.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < dist1) {
                dist2 = dist1;
                dist1 = dist;
            } else if (dist < dist2) {
                dist2 = dist;
            }
        }
        
        return dist2 - dist1; // Différence normalisée
    }
    
    // Générer une texture de bruit
    generateTexture(width = 512, height = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const nx = (x / width) * this.size - this.size / 2;
                const ny = (y / height) * this.size - this.size / 2;
                
                // Utiliser F1-F2 pour un effet plus intéressant
                const value = this.noise3D_F1F2(nx, ny, 0);
                
                // Normaliser et mapper sur une couleur
                const normalized = (value + 0.5) * 2; // 0-1
                const colorValue = Math.pow(normalized, 0.5); // Gamma correction
                
                const idx = (y * width + x) * 4;
                data[idx] = colorValue * 255;     // R
                data[idx + 1] = colorValue * 200; // G
                data[idx + 2] = colorValue * 255; // B
                data[idx + 3] = 255;              // A
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }
}

// ============================================
// INITIALISATION DE LA SCÈNE
// ============================================

function initScene() {
    // Créer la scène
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 50, 200);
    
    // Créer la caméra
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 30, 60);
    camera.lookAt(0, 0, 0);
    
    // Créer le renderer
    const container = document.getElementById('scene-container');
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Ajouter OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2.1;
    
    // Ajouter les lumières
    setupLights();
    
    // Générer le terrain et les nuages
    generateTerrain();
    generateClouds();
    
    // Gérer le redimensionnement
    window.addEventListener('resize', onWindowResize);
    
    // Gérer les contrôles UI
    setupUI();
}

// ============================================
// CONFIGURATION DES LUMIÈRES
// ============================================

function setupLights() {
    // Lumière ambiante
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    // Lumière directionnelle (soleil)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
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
    scene.add(directionalLight);
    
    // Lumière de remplissage
    const fillLight = new THREE.PointLight(0x87CEEB, 0.3);
    fillLight.position.set(-50, 30, -50);
    scene.add(fillLight);
    
    // Lumière de contour (rim light)
    const rimLight = new THREE.PointLight(0xFFD700, 0.2);
    rimLight.position.set(0, 50, -80);
    scene.add(rimLight);
}

// ============================================
// GÉNÉRATION DU TERRAIN PROCÉDURAL
// ============================================

function generateTerrain() {
    // Supprimer l'ancien terrain si il existe
    if (terrainMesh) {
        scene.remove(terrainMesh);
        terrainMesh.geometry.dispose();
        terrainMesh.material.dispose();
    }
    
    // Créer le bruit Perlin
    const perlin = new PerlinNoise(seed);
    
    // Paramètres du terrain
    const size = 100;
    const segments = 200;
    
    // Créer la géométrie
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    
    // Modifier les vertices pour créer le terrain
    const position = geometry.attributes.position;
    
    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const z = position.getZ(i);
        
        // Calculer la hauteur avec plusieurs octaves de Perlin Noise
        const height = perlin.octaveNoise(
            x * 0.1, 
            z * 0.1, 
            0,
            6,  // octaves
            0.5 // persistence
        );
        
        // Appliquer l'échelle
        const scaledHeight = height * terrainScale * 0.1;
        position.setY(i, scaledHeight);
    }
    
    // Calculer les normales
    geometry.computeVertexNormals();
    
    // Créer le matériau
    const material = new THREE.MeshStandardMaterial({
        color: 0x3a5f0b,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    
    // Créer le mesh
    terrainMesh = new THREE.Mesh(geometry, material);
    terrainMesh.rotation.x = -Math.PI / 2; // Tourner pour que ce soit horizontal
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    scene.add(terrainMesh);
}

// ============================================
// GÉNÉRATION DES NUAGES (TEXTURE OUATTÉE)
// ============================================

function generateClouds() {
    // Supprimer les anciens nuages si ils existent
    if (cloudMesh) {
        scene.remove(cloudMesh);
        cloudMesh.geometry.dispose();
        cloudMesh.material.dispose();
    }
    
    // Créer le bruit Worley pour la texture ouattée
    const worley = new WorleyNoise(seed + 1000);
    worley.generatePoints(100);
    
    // Créer une texture à partir du Worley Noise
    const textureCanvas = worley.generateTexture(512, 512);
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    // Créer la géométrie des nuages (sphère déformée)
    const geometry = new THREE.SphereGeometry(30, 64, 64);
    
    // Déformer la sphère avec du Perlin Noise
    const perlin = new PerlinNoise(seed + 2000);
    const position = geometry.attributes.position;
    
    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const z = position.getZ(i);
        
        // Calculer la déformation
        const noise = perlin.octaveNoise(x * 0.1, y * 0.1, z * 0.1, 4, 0.5);
        const deformation = 5 + noise * 10;
        
        position.set(
            i,
            x * deformation * 0.1,
            y * deformation * 0.1,
            z * deformation * 0.1
        );
    }
    
    geometry.computeVertexNormals();
    
    // Créer le matériau avec la texture ouattée
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        emissive: 0x87CEEB,
        emissiveIntensity: 0.3
    });
    
    // Créer le mesh
    cloudMesh = new THREE.Mesh(geometry, material);
    cloudMesh.position.y = 20;
    cloudMesh.rotation.y = Math.PI / 4;
    scene.add(cloudMesh);
}

// ============================================
// CONFIGURATION DE L'INTERFACE UTILISATEUR
// ============================================

function setupUI() {
    // Bouton de régénération
    document.getElementById('regenerate-btn').addEventListener('click', () => {
        seed = Math.random() * 10000;
        generateTerrain();
        generateClouds();
    });
    
    // Bouton pause/play
    document.getElementById('animate-btn').addEventListener('click', () => {
        isAnimating = !isAnimating;
    });
    
    // Slider pour l'échelle du terrain
    const scaleSlider = document.getElementById('scale-slider');
    scaleSlider.addEventListener('input', (e) => {
        terrainScale = parseInt(e.target.value);
        generateTerrain();
    });
    
    // Slider pour la vitesse
    const speedSlider = document.getElementById('speed-slider');
    speedSlider.addEventListener('input', (e) => {
        animationSpeed = parseFloat(e.target.value);
    });
}

// ============================================
// GESTION DU REDIMENSIONNEMENT
// ============================================

function onWindowResize() {
    const container = document.getElementById('scene-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// ============================================
// BOUCLE D'ANIMATION
// ============================================

function animate() {
    requestAnimationFrame(animate);
    
    if (isAnimating) {
        time += 0.01 * animationSpeed;
        
        // Rotation des nuages
        if (cloudMesh) {
            cloudMesh.rotation.y += 0.001 * animationSpeed;
            cloudMesh.rotation.x += 0.0005 * animationSpeed;
            
            // Animation de pulsation subtile
            cloudMesh.scale.set(
                1 + Math.sin(time * 0.5) * 0.02,
                1 + Math.sin(time * 0.5) * 0.02,
                1 + Math.sin(time * 0.5) * 0.02
            );
        }
        
        // Animation du terrain (vagues subtiles)
        if (terrainMesh) {
            const position = terrainMesh.geometry.attributes.position;
            const perlin = new PerlinNoise(seed);
            
            for (let i = 0; i < position.count; i++) {
                const x = position.getX(i);
                const z = position.getZ(i);
                
                // Ajouter une animation d'onde
                const wave = Math.sin(x * 0.1 + time * 2) * Math.cos(z * 0.1 + time * 1.5) * 0.5;
                const originalHeight = perlin.octaveNoise(x * 0.1, z * 0.1, 0, 6, 0.5) * terrainScale * 0.1;
                
                position.setY(i, originalHeight + wave * 0.3);
            }
            
            terrainMesh.geometry.attributes.position.needsUpdate = true;
            terrainMesh.geometry.computeVertexNormals();
        }
    }
    
    // Mettre à jour les contrôles
    controls.update();
    
    // Rendre la scène
    renderer.render(scene, camera);
}

// ============================================
// DÉMARRAGE DE L'APPLICATION
// ============================================

// Attendre que le DOM soit chargé
window.addEventListener('DOMContentLoaded', () => {
    initScene();
    animate();
});

// Gérer le redimensionnement initial
window.addEventListener('load', onWindowResize);
