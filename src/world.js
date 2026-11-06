import { animateEmployee, initializeEmployeeAnimation } from './characters/animation.js';
import { createEmployeeFace } from './characters/face.js';
import { createEmployeeModel } from './characters/model.js';
import { soundEngine } from './audio.js';
import { DAG_CATALOG as SCOPE_NODES_CATALOG } from './dag_engine.js';
import { game } from './simulation.js';

const THREE = window.THREE;
const MAX_RENDER_PIXELS = 1_500_000;
const SHADOW_REFRESH_INTERVAL = 1 / 20;

/**
 * Dev Empire 3D - Three.js Visual World Engine (AAA Polished Edition)
 * Diorama Isometric Framing, Rich Visual Storytelling Props, PBR Materials,
 * Real Tungsten & CRT Lighting, Dynamic Particles, and UnrealBloom Post-Processing.
 */

// Senior Graphics Engineer - Safe Three.js CubicBezierCurve3D Polyfill / Alias
if (typeof THREE !== 'undefined') {
    if (typeof THREE.CubicBezierCurve3D === 'undefined' && typeof THREE.CubicBezierCurve3 !== 'undefined') {
        THREE.CubicBezierCurve3D = THREE.CubicBezierCurve3;
    }
}

// 3D Architecture Scope Node Tree (DAG) Specifications
const SCOPE_ARCHITECTURE_NODES = [
    // --- 1. NODOS BASE ---
    {
        id: 'render_core',
        name: 'Render 3D Core',
        icon: '👁️',
        category: 'base',
        categoryName: 'NODO BASE',
        desc: 'Pipeline de rasterización, mallas poligonales y texturizado UV.',
        pos: [-3.8, 1.8, 2.4],
        state: 'completed',
        dependencies: []
    },
    {
        id: 'physics_core',
        name: 'Motor Físico',
        icon: '⚛️',
        category: 'base',
        categoryName: 'NODO BASE',
        desc: 'Colisiones rígidas, masa, fricción y simulación cinemática.',
        pos: [-1.9, 1.8, 2.4],
        state: 'completed',
        dependencies: []
    },
    {
        id: 'netcode_core',
        name: 'Netcode & Sockets',
        icon: '🌐',
        category: 'base',
        categoryName: 'NODO BASE',
        desc: 'Replicación UDP cliente-servidor, tickrates y sincronización.',
        pos: [0.0, 1.8, 2.4],
        state: 'active',
        dependencies: []
    },
    {
        id: 'ai_core',
        name: 'IA & Lógica Core',
        icon: '🧠',
        category: 'base',
        categoryName: 'NODO BASE',
        desc: 'Árboles de comportamiento, máquinas de estados y pathfinding A*.',
        pos: [1.9, 1.8, 2.4],
        state: 'completed',
        dependencies: []
    },
    {
        id: 'audio_core',
        name: 'Audio Espacial 3D',
        icon: '🔊',
        category: 'base',
        categoryName: 'NODO BASE',
        desc: 'Mezcla espacial binaural, síntesis procedural y reverberación.',
        pos: [3.8, 1.8, 2.4],
        state: 'available',
        dependencies: []
    },

    // --- 2. NODOS DE CONTENIDO ---
    {
        id: 'open_world',
        name: 'Mundo Abierto',
        icon: '🗺️',
        category: 'content',
        categoryName: 'CONTENIDO',
        desc: 'Streaming dinámico de chunks, LODs continuos y biomas.',
        pos: [-3.0, 3.3, 0.2],
        state: 'in_progress',
        dependencies: ['render_core', 'physics_core']
    },
    {
        id: 'combat_system',
        name: 'Sistema de Combate',
        icon: '⚔️',
        category: 'content',
        categoryName: 'CONTENIDO',
        desc: 'Hitboxes volumétricas, encadenamiento de combos y timings.',
        pos: [-1.0, 3.3, 0.2],
        state: 'regression', // Tech debt / bugs alert!
        dependencies: ['physics_core', 'ai_core']
    },
    {
        id: 'multiplayer_lobby',
        name: 'Lobby & Matchmaking',
        icon: '👥',
        category: 'content',
        categoryName: 'CONTENIDO',
        desc: 'Salas de espera online, emparejamiento por MMR y handshake.',
        pos: [0.0, 3.5, 0.8],
        state: 'active',
        dependencies: ['netcode_core']
    },
    {
        id: 'procedural_gen',
        name: 'Generación Procedural',
        icon: '🎲',
        category: 'content',
        categoryName: 'CONTENIDO',
        desc: 'Algoritmos generativos de dungeons y distribución sintáctica.',
        pos: [1.0, 3.3, 0.2],
        state: 'available',
        dependencies: ['render_core', 'ai_core']
    },
    {
        id: 'quest_engine',
        name: 'Motor de Misiones',
        icon: '📜',
        category: 'content',
        categoryName: 'CONTENIDO',
        desc: 'Grafos no lineales de objetivos, diálogos ramificados y karma.',
        pos: [3.0, 3.3, 0.2],
        state: 'available',
        dependencies: ['ai_core']
    },
    {
        id: 'soundtrack_adaptive',
        name: 'Banda Sonora Viva',
        icon: '🎼',
        category: 'content',
        categoryName: 'CONTENIDO',
        desc: 'Capas orquestales reactivas según nivel de adrenalina.',
        pos: [4.4, 3.3, 0.8],
        state: 'locked',
        dependencies: ['audio_core']
    },

    // --- 3. NODOS DE SISTEMAS ---
    {
        id: 'weather_system',
        name: 'Clima Dinámico',
        icon: '⛈️',
        category: 'systems',
        categoryName: 'SISTEMAS',
        desc: 'Simulación de borrascas, precipitaciones y acumulación de nieve.',
        pos: [-3.4, 4.8, -2.0],
        state: 'locked',
        dependencies: ['open_world', 'physics_core']
    },
    {
        id: 'day_night_cycle',
        name: 'Ciclo Día/Noche',
        icon: '🌓',
        category: 'systems',
        categoryName: 'SISTEMAS',
        desc: 'Órbita solar-lunar volumétrica, sombras dinámicas y crepúsculo.',
        pos: [-1.4, 4.8, -2.0],
        state: 'locked',
        dependencies: ['open_world', 'render_core']
    },
    {
        id: 'destruction_physics',
        name: 'Físicas Destructibles',
        icon: '💥',
        category: 'systems',
        categoryName: 'SISTEMAS',
        desc: 'Fragmentación Voronoi en tiempo real y debris con masa.',
        pos: [0.6, 4.8, -2.0],
        state: 'locked',
        dependencies: ['physics_core', 'combat_system']
    },
    {
        id: 'neural_npcs',
        name: 'NPCs Neuronales',
        icon: '🤖',
        category: 'systems',
        categoryName: 'SISTEMAS',
        desc: 'Redes neuronales ligeras de decisión y conductas emergentes.',
        pos: [2.5, 4.8, -2.0],
        state: 'locked',
        dependencies: ['ai_core', 'procedural_gen']
    },
    {
        id: 'modding_sdk',
        name: 'Modding & SDK',
        icon: '🛠️',
        category: 'systems',
        categoryName: 'SISTEMAS',
        desc: 'API Lua expuesta para scripts comunitarios y carga de mods.',
        pos: [4.3, 4.8, -2.0],
        state: 'locked',
        dependencies: ['open_world', 'multiplayer_lobby']
    }
];

export class WorldEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
        this.bloomPass = null;

        this.officeGroup = new THREE.Group();
        this.charactersGroup = new THREE.Group();
        this.particlesGroup = new THREE.Group();
        this.confettiGroup = new THREE.Group();
        this.steamGroup = new THREE.Group();

        // 3D Holographic Scope Architecture DAG Subsystem
        this.scopeDagGroup = new THREE.Group();
        this.dagHologramTableGroup = new THREE.Group();
        this.dagNodesGroup = new THREE.Group();
        this.dagEdgesGroup = new THREE.Group();
        this.dagParticlesGroup = new THREE.Group();

        this.scopeDagGroup.add(this.dagHologramTableGroup);
        this.scopeDagGroup.add(this.dagEdgesGroup);
        this.scopeDagGroup.add(this.dagNodesGroup);
        this.scopeDagGroup.add(this.dagParticlesGroup);

        this.viewMode = 'office'; // 'office' or 'dag_hologram'
        this.dagNodesMap = new Map();
        this.dagNodesList = [];
        this.dagEdgesList = [];
        this.dagInteractiveMeshes = [];
        this.dagParticlePoints = null;
        this.dagParticleData = [];
        this.hoveredDagNode = null;
        this.selectedDagNode = null;

        // Cinematic Camera Interpolation Targets
        this.cameraOfficePos = new THREE.Vector3(16, 9, -7);
        this.cameraOfficeTarget = new THREE.Vector3(0, 1.0, 0);
        this.cameraDagPos = new THREE.Vector3(0.0, 13.5, 14.5);
        this.cameraDagTarget = new THREE.Vector3(0, 3.2, 0);
        this.targetCamPos = null;
        this.targetLookAt = null;
        this.isTransitioningCamera = false;
        this.dagOrbitAngle = 0;
        this.dagOrbitEnabled = false;

        this.onNodeClickCallback = null;
        this.onNodeHoverCallback = null;

        this.dynamicTextures = [];
        this.characters = [];
        this.desks = [];
        this.monitors = [];
        this.serverLeds = [];
        this.confettiParticles = [];
        this.activeParticles = [];
        this.steamParticles = [];

        this.currentEra = 1;
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0c10);
        this.scene.fog = new THREE.FogExp2(0x0a0c10, 0.02);

        this.scene.add(this.officeGroup);
        this.scene.add(this.charactersGroup);
        this.scene.add(this.particlesGroup);
        this.scene.add(this.confettiGroup);
        this.scene.add(this.steamGroup);
        this.scene.add(this.scopeDagGroup);

        // Intimate Diorama Isometric Camera Setup (FOV 32° for tilt-shift model feel)
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(32, aspect, 0.5, 100);
        this.camera.position.copy(this.cameraOfficePos);
        this.camera.lookAt(0, 1.0, 0);

        // Limit the drawing buffer independently of the CSS canvas size.
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.resizeRenderer(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = false;
        this.nextShadowRefresh = 0;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.container.appendChild(this.renderer.domElement);

        // OrbitControls smoothly clamped
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.maxPolarAngle = Math.PI / 2.2;
        this.controls.minDistance = 6;
        this.controls.maxDistance = 35;
        this.controls.target.set(0, 1.0, 0);

        // Setup Post-processing with UnrealBloom
        this.setupPostProcessing();

        // Setup Lighting (Warm Tungsten Atmosphere)
        this.setupLighting();

        // Build Initial Era (Garage Diorama)
        this.buildOffice(1);

        // Build Initial Holographic 3D Scope Architecture Tree (Default Hidden in Office)
        this.initScopeDag();
        this.scopeDagGroup.visible = false;

        // Window resize handler
        window.addEventListener('resize', () => this.onWindowResize());

        // Raycasting for interactive clicking
        this.setupInteraction();

        // Start render loop
        this.animate();
    }

    setupPostProcessing() {
        try {
            if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') {
                const renderScene = new THREE.RenderPass(this.scene, this.camera);
                this.bloomPass = new THREE.UnrealBloomPass(
                    new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
                    0.55, // strength
                    0.4,  // radius
                    0.88  // threshold
                );

                this.composer = new THREE.EffectComposer(this.renderer);
                this.composer.addPass(renderScene);
                this.composer.addPass(this.bloomPass);
                this.composer.setPixelRatio(this.renderer.getPixelRatio() * 0.75);
            }
        } catch (e) {
            console.warn("Postprocessing fallback:", e);
            this.composer = null;
        }
    }

    setupLighting() {
        // Deep twilight ambient fill (warm-purple baseline to contrast with tungsten)
        this.ambientLight = new THREE.AmbientLight(0x2d2432, 0.55);
        this.scene.add(this.ambientLight);

        // Main Golden Sunlight streaming through the garage window/door cracks
        this.sunLight = new THREE.DirectionalLight(0xffdfba, 1.25);
        this.sunLight.position.set(14, 18, 10);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 50;
        const shadowDist = 10;
        this.sunLight.shadow.camera.left = -shadowDist;
        this.sunLight.shadow.camera.right = shadowDist;
        this.sunLight.shadow.camera.top = shadowDist;
        this.sunLight.shadow.camera.bottom = -shadowDist;
        this.sunLight.shadow.bias = -0.0004;
        this.scene.add(this.sunLight);

        // Soft secondary cyan rim light for volumetric depth
        const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
        rimLight.position.set(-12, 12, -12);
        this.scene.add(rimLight);
    }

    // --- PROCEDURAL TEXTURES (PBR AAA CRAFTSMANSHIP) ---

    createBrickWallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Mortar base
        ctx.fillStyle = '#4a4440';
        ctx.fillRect(0, 0, 1024, 1024);

        const brickW = 128;
        const brickH = 52;
        const mortar = 6;

        for (let y = 0; y < 1024; y += brickH + mortar) {
            const row = Math.floor(y / (brickH + mortar));
            const offsetX = (row % 2) * (brickW / 2);

            for (let x = -brickW; x < 1024 + brickW; x += brickW + mortar) {
                const px = x + offsetX;
                // Rich terracotta and aged clay variations
                const r = 145 + Math.floor(Math.sin(px * 0.05 + y * 0.07) * 25 + Math.random() * 15);
                const g = 65 + Math.floor(Math.sin(px * 0.08 + y * 0.03) * 15 + Math.random() * 10);
                const b = 45 + Math.floor(Math.random() * 12);

                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(px, y, brickW, brickH);

                // Texture speckles and wear
                ctx.fillStyle = 'rgba(0,0,0,0.12)';
                for (let s = 0; s < 18; s++) {
                    ctx.fillRect(px + Math.random() * brickW, y + Math.random() * brickH, 3, 2);
                }
                ctx.fillStyle = 'rgba(255,255,255,0.06)';
                for (let s = 0; s < 12; s++) {
                    ctx.fillRect(px + Math.random() * brickW, y + Math.random() * brickH, 2, 2);
                }
            }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        return tex;
    }

    createGarageDoorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Galvanized painted steel
        ctx.fillStyle = '#64748b';
        ctx.fillRect(0, 0, 1024, 1024);

        const panelH = 256;
        for (let y = 0; y < 1024; y += panelH) {
            // Panel separation seam
            ctx.fillStyle = '#334155';
            ctx.fillRect(0, y, 1024, 10);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(0, y + 10, 1024, 3);

            // Horizontal corrugations (embossed ridges)
            for (let r = 40; r < panelH - 40; r += 45) {
                ctx.fillStyle = '#475569';
                ctx.fillRect(30, y + r, 964, 18);
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(30, y + r, 964, 3);
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(30, y + r + 15, 964, 3);
            }

            // Top panel frosted windows
            if (y === 0) {
                for (let w = 80; w < 1024; w += 230) {
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(w - 6, 74, 152, 92);
                    ctx.fillStyle = '#bae6fd';
                    ctx.fillRect(w, 80, 140, 80);
                    // Window cross frame
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(w + 68, 80, 4, 80);
                    ctx.fillRect(w, 118, 140, 4);
                }
            }
        }

        return new THREE.CanvasTexture(canvas);
    }

    createConcreteFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Garage industrial concrete base
        ctx.fillStyle = '#52525b';
        ctx.fillRect(0, 0, 1024, 1024);

        // Subtle concrete mottling & speckles
        for (let i = 0; i < 3500; i++) {
            const val = 70 + Math.floor(Math.random() * 30);
            ctx.fillStyle = `rgba(${val}, ${val}, ${val}, 0.25)`;
            const size = 2 + Math.random() * 6;
            ctx.fillRect(Math.random() * 1024, Math.random() * 1024, size, size);
        }

        // Concrete expansion joint grid lines
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(512, 0); ctx.lineTo(512, 1024);
        ctx.moveTo(0, 512); ctx.lineTo(1024, 512);
        ctx.stroke();

        // Subtle oil smudge in one spot
        const grad = ctx.createRadialGradient(720, 680, 10, 720, 680, 90);
        grad.addColorStop(0, 'rgba(24, 24, 27, 0.45)');
        grad.addColorStop(1, 'rgba(24, 24, 27, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(720, 680, 90, 0, Math.PI * 2);
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
    }

    createVintageRugTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Warm woven bohemian / Persian style pattern
        ctx.fillStyle = '#831843'; // deep crimson border
        ctx.fillRect(0, 0, 512, 512);

        ctx.fillStyle = '#b45309'; // amber border
        ctx.fillRect(20, 20, 472, 472);

        ctx.fillStyle = '#1e3a5f'; // navy field
        ctx.fillRect(40, 40, 432, 432);

        // Center medallion
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(256, 256, 110, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.arc(256, 256, 65, 0, Math.PI * 2);
        ctx.fill();

        // Geometric diamonds
        ctx.fillStyle = '#fef08a';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = 256 + Math.cos(angle) * 85;
            const y = 256 + Math.sin(angle) * 85;
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
        }

        // Fringes on ends
        ctx.fillStyle = '#fef3c7';
        for (let x = 0; x < 512; x += 8) {
            ctx.fillRect(x, 0, 4, 12);
            ctx.fillRect(x, 500, 4, 12);
        }

        return new THREE.CanvasTexture(canvas);
    }

    createAnimatedMonitorCanvas(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 192;
        const ctx = canvas.getContext('2d');

        const dynTex = {
            canvas: canvas,
            ctx: ctx,
            texture: new THREE.CanvasTexture(canvas),
            type: type || 'retro',
            lastScroll: -1,
            lines: []
        };

        // Retro CRT syntax lines
        const colors = type === 'retro' 
            ? ['#34d399', '#10b981', '#059669', '#a7f3d0'] // Monochromatic green phosphor
            : ['#00d2ff', '#a855f7', '#10b981', '#f59e0b', '#ec4899'];

        for (let i = 0; i < 20; i++) {
            dynTex.lines.push({
                w: 35 + Math.random() * 150,
                color: colors[Math.floor(Math.random() * colors.length)],
                indent: Math.floor(Math.random() * 4) * 14
            });
        }

        this.dynamicTextures.push(dynTex);
        return dynTex.texture;
    }

    createWhiteboardTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Whiteboard surface
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, 512, 256);

        // Architecture flowchart
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3;
        ctx.strokeRect(30, 35, 120, 55);
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('MAIN_LOOP()', 42, 68);

        // Arrow
        ctx.beginPath();
        ctx.moveTo(150, 62); ctx.lineTo(215, 62);
        ctx.stroke();

        ctx.strokeStyle = '#7c3aed';
        ctx.strokeRect(215, 35, 120, 55);
        ctx.fillStyle = '#7c3aed';
        ctx.fillText('PHYSICS_2D', 228, 68);

        // Arrow down
        ctx.beginPath();
        ctx.moveTo(275, 90); ctx.lineTo(275, 140);
        ctx.stroke();

        ctx.strokeStyle = '#10b981';
        ctx.strokeRect(215, 140, 120, 55);
        ctx.fillStyle = '#10b981';
        ctx.fillText('SHIP_GAME()', 228, 172);

        // Yellow Sticky notes
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(360, 40, 75, 75);
        ctx.fillStyle = '#854d0e';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('BUGS TO SQUASH', 365, 60);
        ctx.font = '9px sans-serif';
        ctx.fillText('• Memory Leak', 365, 78);
        ctx.fillText('• Sound Clipping', 365, 94);

        // Pink Sticky note
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(360, 135, 75, 75);
        ctx.fillStyle = '#9d174d';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('GOTY 1985!', 368, 158);
        ctx.fillText('★ 10/10 Score', 368, 178);

        return new THREE.CanvasTexture(canvas);
    }

    createArcadePosterTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, 256, 360);

        // Pixel Invader Graphic
        ctx.fillStyle = '#00ff66';
        const invader = [
            [0,0,1,0,0,0,0,0,1,0,0],
            [0,0,0,1,0,0,0,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,0,0],
            [0,1,1,0,1,1,1,0,1,1,0],
            [1,1,1,1,1,1,1,1,1,1,1],
            [1,0,1,1,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,1,0,1],
            [0,0,0,1,1,0,1,1,0,0,0]
        ];
        const sz = 14;
        const startX = 50;
        const startY = 120;
        for (let r = 0; r < invader.length; r++) {
            for (let c = 0; c < invader[r].length; c++) {
                if (invader[r][c]) {
                    ctx.fillRect(startX + c * sz, startY + r * sz, sz - 1, sz - 1);
                }
            }
        }

        // Title
        ctx.fillStyle = '#f43f5e';
        ctx.font = '900 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SPACE INVADERS', 128, 60);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('INSERT COIN TO PLAY', 128, 280);
        ctx.fillText('HI-SCORE: 99990', 128, 310);

        return new THREE.CanvasTexture(canvas);
    }

    createCalendarTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#fefefe';
        ctx.fillRect(0, 0, 180, 240);

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, 0, 180, 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('1985', 90, 32);

        // Crossed days grid
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        for (let y = 60; y < 220; y += 30) {
            ctx.beginPath();
            ctx.moveTo(10, y); ctx.lineTo(170, y);
            ctx.stroke();
        }
        for (let x = 10; x <= 170; x += 26) {
            ctx.beginPath();
            ctx.moveTo(x, 60); ctx.lineTo(x, 210);
            ctx.stroke();
        }

        // Red X on launch day
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(65, 125); ctx.lineTo(85, 145);
        ctx.moveTo(85, 125); ctx.lineTo(65, 145);
        ctx.stroke();

        return new THREE.CanvasTexture(canvas);
    }

    // --- PROCEDURAL 3D ARCHITECTURE & STORYTELLING PROPS ---

    buildOffice(era) {
        this.currentEra = era;

        // All props and maps in this group belong to the previous office.
        const resources = new Set();
        this.officeGroup.traverse(object => {
            if (object.geometry) resources.add(object.geometry);
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            for (const material of materials) {
                if (!material) continue;
                resources.add(material);
                if (material.map) resources.add(material.map);
            }
        });
        for (const resource of resources) resource.dispose();
        this.officeGroup.clear();
        this.dynamicTextures = [];
        this.nextShadowRefresh = 0;
        this.desks = [];
        this.monitors = [];
        this.serverLeds = [];

        if (era === 1) {
            this.buildGarageEra();
        } else if (era === 2) {
            this.buildLoftEra();
        } else {
            this.buildCyberCampusEra();
        }

        this.updateCharacterPositions();
    }

    buildGarageEra() {
        const roomW = 12;
        const roomD = 12;

        // 1. Concrete Floor
        const floorGeo = new THREE.PlaneGeometry(roomW, roomD);
        const floorMat = new THREE.MeshStandardMaterial({
            map: this.createConcreteFloorTexture(),
            roughness: 0.65,
            metalness: 0.15
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.officeGroup.add(floor);

        // 2. Vintage Persian / Bohemian Rug under the workstations
        const rugGeo = new THREE.PlaneGeometry(6.5, 5.0);
        const rugMat = new THREE.MeshStandardMaterial({
            map: this.createVintageRugTexture(),
            roughness: 0.9,
            metalness: 0.05
        });
        const rug = new THREE.Mesh(rugGeo, rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(0, 0.015, -1.0);
        rug.receiveShadow = true;
        this.officeGroup.add(rug);

        // 3. Back Wall = Exposed Brick
        const brickMat = new THREE.MeshStandardMaterial({
            map: this.createBrickWallTexture(),
            roughness: 0.85,
            metalness: 0.08
        });
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, 5.5, 0.4), brickMat);
        backWall.position.set(0, 2.75, -roomD / 2);
        backWall.receiveShadow = true;
        this.officeGroup.add(backWall);

        // 4. Left Wall = Industrial Sectional Overhead Garage Door
        const doorMat = new THREE.MeshStandardMaterial({
            map: this.createGarageDoorTexture(),
            roughness: 0.45,
            metalness: 0.55
        });
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.5, roomD), doorMat);
        leftWall.position.set(-roomW / 2, 2.75, 0);
        leftWall.receiveShadow = true;
        this.officeGroup.add(leftWall);

        // Overhead garage door ceiling guide tracks
        const trackMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
        [-3.5, 3.5].forEach(zPos => {
            const track = new THREE.Mesh(new THREE.BoxGeometry(7, 0.08, 0.08), trackMat);
            track.position.set(-2.5, 5.2, zPos);
            this.officeGroup.add(track);
        });

        // 5. Wooden Baseboards & Ceiling Beam
        const timberMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.7 });
        const baseboard = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.25, 0.45), timberMat);
        baseboard.position.set(0, 0.125, -roomD / 2 + 0.15);
        this.officeGroup.add(baseboard);

        const ceilingBeam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, roomD), timberMat);
        ceilingBeam.position.set(0, 5.3, 0);
        this.officeGroup.add(ceilingBeam);

        // 6. Pegboard with Hanging Workshop Tools
        this.createPegboard(4.2, 3.2, -roomD / 2 + 0.25);

        // 7. Posters & 1985 Calendar
        const posterMat = new THREE.MeshBasicMaterial({ map: this.createArcadePosterTexture() });
        const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.5), posterMat);
        poster.position.set(-3.2, 3.4, -roomD / 2 + 0.22);
        this.officeGroup.add(poster);

        const calMat = new THREE.MeshBasicMaterial({ map: this.createCalendarTexture() });
        const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2), calMat);
        cal.position.set(-1.4, 3.6, -roomD / 2 + 0.22);
        this.officeGroup.add(cal);

        // 8. Whiteboard with System Architecture
        const wbMat = new THREE.MeshStandardMaterial({ map: this.createWhiteboardTexture(), roughness: 0.2 });
        const wb = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.9, 0.08), wbMat);
        wb.position.set(1.2, 3.4, -roomD / 2 + 0.25);
        this.officeGroup.add(wb);

        // 9. Workstations: 2 Solid Timber Sawhorse Desks
        this.createDesk(-1.8, 0, -1.2, 'retro', 0);
        this.createDesk(1.8, 0, -1.2, 'retro', 1);

        // 10. Narrative Props (Pizza Box, Soda Cans, Cardboard Boxes, Power Strip, Boombox, Trash Can)
        this.createPizzaBox(-1.8, 0, 0.6); // Pizza on stool next to coder
        this.createCardboardBoxStack(-4.8, 0, -4.8); // Stack of 3 boxes in corner
        this.createPowerStrip(0, 0.02, -1.2); // Power strip on floor with red LED
        this.createTrashCan(3.2, 0, 0.2); // Wire bin with crumpled papers
        this.createBoombox(-4.6, 1.2, -1.5); // 80s boombox on workshop table
        this.createCoffeeStation(4.6, 0, -3.2); // Drip coffee brewer
        this.coffeeMugPos = new THREE.Vector3(5.0, 1.35, -3.1);
    }

    buildLoftEra() {
        const roomW = 14;
        const roomD = 14;

        // Hardwood / Polished concrete floor
        const floorGeo = new THREE.PlaneGeometry(roomW, roomD);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x27272a,
            roughness: 0.45,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.officeGroup.add(floor);

        // Brick loft back wall
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(roomW, 6.0, 0.4),
            new THREE.MeshStandardMaterial({ map: this.createBrickWallTexture(), roughness: 0.85 })
        );
        backWall.position.set(0, 3.0, -roomD / 2);
        this.officeGroup.add(backWall);

        // Left glass partition wall
        const glassWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 6.0, roomD),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25, roughness: 0.1, metalness: 0.8 })
        );
        glassWall.position.set(-roomW / 2, 3.0, 0);
        this.officeGroup.add(glassWall);

        // 4 Modern Workstations
        this.createDesk(-2.4, 0, -2.0, 'modern', 0);
        this.createDesk(2.4, 0, -2.0, 'modern', 1);
        this.createDesk(-2.4, 0, 1.8, 'modern', 2);
        this.createDesk(2.4, 0, 1.8, 'modern', 3);

        this.createCoffeeStation(5.2, 0, -4.5);
        this.coffeeMugPos = new THREE.Vector3(5.6, 1.35, -4.4);
    }

    buildCyberCampusEra() {
        const roomW = 16;
        const roomD = 16;

        // High-tech reflective carbon cyber floor
        const floorGeo = new THREE.PlaneGeometry(roomW, roomD);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x090d16,
            roughness: 0.15,
            metalness: 0.85
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.officeGroup.add(floor);

        // Cyber Grid Lines on floor
        const grid = new THREE.GridHelper(roomW, 16, 0x00f3ff, 0x1e293b);
        grid.position.y = 0.01;
        this.officeGroup.add(grid);

        // Panoramic city night back wall
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(roomW, 7.0, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 })
        );
        backWall.position.set(0, 3.5, -roomD / 2);
        this.officeGroup.add(backWall);

        // 6 Cyber Workstations arranged symmetrically
        this.createDesk(-3.2, 0, -3.0, 'cyber', 0);
        this.createDesk(0.0, 0, -3.8, 'cyber', 1);
        this.createDesk(3.2, 0, -3.0, 'cyber', 2);
        this.createDesk(-3.2, 0, 2.2, 'cyber', 3);
        this.createDesk(0.0, 0, 2.8, 'cyber', 4);
        this.createDesk(3.2, 0, 2.2, 'cyber', 5);

        this.createCoffeeStation(6.0, 0, -5.0);
        this.coffeeMugPos = new THREE.Vector3(6.4, 1.35, -4.9);
    }

    createDesk(x, y, z, style, index) {
        const deskGroup = new THREE.Group();
        deskGroup.position.set(x, y, z);

        const isRetro = style === 'retro';
        const isCyber = style === 'cyber';

        // Heavy solid timber tabletop
        const topGeo = new THREE.BoxGeometry(2.3, 0.1, 1.2);
        const topMat = new THREE.MeshStandardMaterial({
            color: isRetro ? 0x6d4c41 : (isCyber ? 0x1f2937 : 0xf8fafc),
            roughness: isRetro ? 0.7 : 0.3,
            metalness: isCyber ? 0.6 : 0.1
        });
        const tableTop = new THREE.Mesh(topGeo, topMat);
        tableTop.position.y = 1.35;
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        deskGroup.add(tableTop);

        // Wooden Sawhorse legs for Retro Garage
        if (isRetro) {
            const legMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.8 });
            [-0.85, 0.85].forEach(xOff => {
                const beamTop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 1.0), legMat);
                beamTop.position.set(xOff, 1.28, 0);
                deskGroup.add(beamTop);

                // A-frame angled legs
                [-0.4, 0.4].forEach(zOff => {
                    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.35, 0.08), legMat);
                    leg.position.set(xOff, 0.65, zOff);
                    leg.rotation.z = (xOff > 0 ? -1 : 1) * 0.12;
                    leg.castShadow = true;
                    deskGroup.add(leg);
                });
            });
        } else {
            const steelMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.3 });
            [[-1.0, -0.48], [1.0, -0.48], [-1.0, 0.48], [1.0, 0.48]].forEach(pos => {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.35, 8), steelMat);
                leg.position.set(pos[0], 0.675, pos[1]);
                leg.castShadow = true;
                deskGroup.add(leg);
            });
        }

        // Chunky CRT Computer & Screen
        if (isRetro) {
            const crtGroup = new THREE.Group();
            crtGroup.position.set(0, 1.82, -0.2);

            // Beige computer case
            const crtCase = new THREE.Mesh(
                new THREE.BoxGeometry(0.95, 0.78, 0.75),
                new THREE.MeshStandardMaterial({ color: 0xd8cca3, roughness: 0.65 })
            );
            crtCase.castShadow = true;
            crtGroup.add(crtCase);

            // Screen frame bevel
            const screenTex = this.createAnimatedMonitorCanvas('retro');
            const screen = new THREE.Mesh(
                new THREE.PlaneGeometry(0.72, 0.54),
                new THREE.MeshBasicMaterial({ map: screenTex })
            );
            screen.position.set(0, 0.02, 0.38);
            crtGroup.add(screen);

            // Floppy drive slot
            const driveSlot = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.03, 0.05),
                new THREE.MeshStandardMaterial({ color: 0x111111 })
            );
            driveSlot.position.set(0.2, -0.28, 0.38);
            crtGroup.add(driveSlot);

            deskGroup.add(crtGroup);

            // CRT Screen Phosphor Glow Light (Greenish-cyan spotlight onto keyboard and dev)
            const crtLight = new THREE.PointLight(0x34d399, 0.85, 2.2);
            crtLight.position.set(0, 1.85, 0.1);
            deskGroup.add(crtLight);
            this.monitors.push({ mesh: screen, lightPos: new THREE.Vector3(x, 1.85, z + 0.2), pointLight: crtLight });

            // Joystick retro on side
            const joyBase = new THREE.Mesh(
                new THREE.BoxGeometry(0.18, 0.06, 0.18),
                new THREE.MeshStandardMaterial({ color: 0x111111 })
            );
            joyBase.position.set(0.86, 1.38, -0.25);
            deskGroup.add(joyBase);

            const joyStick = new THREE.Mesh(
                new THREE.CylinderGeometry(0.018, 0.018, 0.22),
                new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 })
            );
            joyStick.position.set(0.86, 1.49, -0.25);
            joyStick.rotation.z = 0.15;
            deskGroup.add(joyStick);

            // Anglepoise Retro Desk Lamp (Tungsten Warm Light Cone)
            this.createAnglepoiseLamp(deskGroup, 0.88, 1.4, -0.3);

            // Soda Can on desk
            this.createSodaCan(deskGroup, -0.85, 1.4, 0.25);

        } else {
            // Modern / Cyber Dual Monitors
            [-0.45, 0.45].forEach((offset, idx) => {
                const mon = new THREE.Mesh(
                    new THREE.BoxGeometry(0.75, 0.5, 0.04),
                    new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.7 })
                );
                mon.position.set(offset, 1.8, -0.25);
                mon.rotation.y = idx === 0 ? 0.12 : -0.12;
                deskGroup.add(mon);

                const screenTex = this.createAnimatedMonitorCanvas('code');
                const screen = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.7, 0.45),
                    new THREE.MeshBasicMaterial({ map: screenTex })
                );
                screen.position.set(offset, 1.8, -0.225);
                screen.rotation.y = idx === 0 ? 0.12 : -0.12;
                deskGroup.add(screen);

                if (idx === 0) {
                    this.monitors.push({ mesh: screen, lightPos: new THREE.Vector3(x, 1.8, z) });
                }
            });

            // Alfombrilla y ratón modernos.
            const modernPad = new THREE.Mesh(
                new THREE.BoxGeometry(0.25, 0.005, 0.25),
                new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 })
            );
            modernPad.position.set(0.46, 1.353, 0.22);
            deskGroup.add(modernPad);

            const modernMouse = new THREE.Mesh(
                new THREE.BoxGeometry(0.075, 0.028, 0.11),
                new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.6 })
            );
            modernMouse.position.set(0.46, 1.37, 0.22);
            deskGroup.add(modernMouse);
        }

        // Keep the keyboard under the seated rig's wrist targets in every office.
        const keyboard = new THREE.Mesh(
            new THREE.BoxGeometry(0.76, 0.04, 0.30),
            new THREE.MeshStandardMaterial({ color: isRetro ? 0xd1c7a7 : 0x293448, roughness: 0.7 })
        );
        keyboard.position.set(0, 1.42, 0.42);
        keyboard.receiveShadow = true;
        deskGroup.add(keyboard);

        // Office Chair
        const chair = this.createChair(isRetro ? 0x8d6e63 : 0x0284c7);
        chair.position.set(0, 0, 0.85);
        deskGroup.add(chair);

        deskGroup.userData = { type: 'desk', index };
        this.officeGroup.add(deskGroup);
        this.desks.push({ index: index, group: deskGroup, worldPos: new THREE.Vector3(x, y, z) });
    }

    createAnglepoiseLamp(parent, x, y, z) {
        const lamp = new THREE.Group();
        lamp.position.set(x, y, z);

        const metalMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 }); // Amber-orange enamel

        // Base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 16), metalMat);
        lamp.add(base);

        // Lower arm
        const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35), metalMat);
        arm1.position.set(-0.06, 0.18, 0.06);
        arm1.rotation.z = 0.35;
        lamp.add(arm1);

        // Upper arm
        const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35), metalMat);
        arm2.position.set(-0.16, 0.45, 0.12);
        arm2.rotation.z = -0.45;
        lamp.add(arm2);

        // Shade cone
        const shade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 16, 1, true), metalMat);
        shade.position.set(-0.25, 0.52, 0.16);
        shade.rotation.z = -Math.PI / 2.8;
        lamp.add(shade);

        // Glowing tungsten bulb inside
        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xfffbeb })
        );
        bulb.position.set(-0.25, 0.52, 0.16);
        lamp.add(bulb);

        parent.add(lamp);

        // The sun supplies soft shadows. A point light shadow would redraw
        // the scene in six directions for every desk lamp.
        const lampLight = new THREE.PointLight(0xffa733, 1.4, 4.5);
        lampLight.position.copy(bulb.position);
        lamp.add(lampLight);
    }

    createPizzaBox(x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        // Wooden stool
        const stoolMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16), stoolMat);
        seat.position.y = 0.8;
        group.add(seat);
        for (let l = 0; l < 4; l++) {
            const angle = (l / 4) * Math.PI * 2;
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8), stoolMat);
            leg.position.set(Math.cos(angle) * 0.25, 0.4, Math.sin(angle) * 0.25);
            group.add(leg);
        }

        // Cardboard Pizza Box
        const cardMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 }); // cardboard brown
        const boxBase = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.55), cardMat);
        boxBase.position.y = 0.86;
        boxBase.castShadow = true;
        group.add(boxBase);

        // Open Lid leaning back
        const boxLid = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.55), cardMat);
        boxLid.position.set(0, 1.1, -0.25);
        boxLid.rotation.x = -Math.PI / 3;
        group.add(boxLid);

        // Pizza with slice cut out
        const crustMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.9 });
        const pizza = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16, 1, false, 0, Math.PI * 1.6), crustMat);
        pizza.position.set(0, 0.9, 0);
        group.add(pizza);

        // Red pepperoni dots
        const pepMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c });
        for (let p = 0; p < 5; p++) {
            const angle = (p / 5) * Math.PI * 1.5;
            const pep = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.022, 8), pepMat);
            pep.position.set(Math.cos(angle) * 0.12, 0.91, Math.sin(angle) * 0.12);
            group.add(pep);
        }

        this.officeGroup.add(group);
    }

    createSodaCan(parent, x, y, z) {
        const canGroup = new THREE.Group();
        canGroup.position.set(x, y, z);

        // Retro Red Cola Can
        const canMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.7, roughness: 0.3 });
        const can = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 12), canMat);
        can.position.y = 0.07;
        canGroup.add(can);

        // Silver rim & pull tab
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.015, 12), rimMat);
        rim.position.y = 0.145;
        canGroup.add(rim);

        parent.add(canGroup);
    }

    createPowerStrip(x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        const stripMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.6), stripMat);
        group.add(strip);

        // Illuminated red rocker switch
        const switchMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.02, 0.08),
            new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        switchMesh.position.set(0, 0.025, -0.22);
        group.add(switchMesh);

        // Sockets
        const socketMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
        [-0.08, 0.06, 0.2].forEach(zOff => {
            const sock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.08), socketMat);
            sock.position.set(0, 0.022, zOff);
            group.add(sock);
        });

        this.officeGroup.add(group);
    }

    createCardboardBoxStack(x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        const boxMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });
        const tapeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });

        // Bottom Box 1
        const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), boxMat);
        b1.position.y = 0.45;
        b1.castShadow = true;
        group.add(b1);
        const tape1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.91, 1.22), tapeMat);
        tape1.position.y = 0.45;
        group.add(tape1);

        // Middle Box 2
        const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 1.0), boxMat);
        b2.position.set(0.05, 1.3, 0.05);
        b2.rotation.y = 0.15;
        b2.castShadow = true;
        group.add(b2);

        // Top Box 3
        const b3 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), boxMat);
        b3.position.set(-0.05, 2.0, -0.05);
        b3.rotation.y = -0.2;
        b3.castShadow = true;
        group.add(b3);

        this.officeGroup.add(group);
    }

    createPegboard(x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        // Perforated Board
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 });
        const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 0.04), boardMat);
        group.add(board);

        // Hanging Wrench
        const wrenchMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
        const wrench = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.02), wrenchMat);
        wrench.position.set(-0.6, 0.2, 0.04);
        wrench.rotation.z = 0.2;
        group.add(wrench);

        // Hanging Hammer
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x854d0e });
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6), handleMat);
        handle.position.set(0.1, 0.1, 0.04);
        group.add(handle);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.06), wrenchMat);
        head.position.set(0.1, 0.4, 0.04);
        group.add(head);

        // Screwdrivers
        [-0.2, 0.5, 0.7].forEach((xOff, i) => {
            const sdHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18), new THREE.MeshStandardMaterial({ color: i === 0 ? 0xef4444 : 0x3b82f6 }));
            sdHandle.position.set(xOff, 0.3, 0.04);
            group.add(sdHandle);
            const sdShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.35), wrenchMat);
            sdShaft.position.set(xOff, 0.05, 0.04);
            group.add(sdShaft);
        });

        this.officeGroup.add(group);
    }

    createTrashCan(x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        // Wire mesh cylinder
        const meshMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3, wireframe: true });
        const can = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.6, 12, 6, true), meshMat);
        can.position.y = 0.3;
        group.add(can);

        // Crumpled white paper balls inside
        const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
        for (let i = 0; i < 7; i++) {
            const paper = new THREE.Mesh(new THREE.DodecahedronGeometry(0.07 + Math.random() * 0.03), paperMat);
            paper.position.set(
                (Math.random() - 0.5) * 0.25,
                0.15 + (i * 0.06),
                (Math.random() - 0.5) * 0.25
            );
            group.add(paper);
        }

        this.officeGroup.add(group);
    }

    createBoombox(x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.25), bodyMat);
        body.position.y = 0.225;
        group.add(body);

        // Twin Speakers
        const spkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
        [-0.26, 0.26].forEach(xOff => {
            const spk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 16), spkMat);
            spk.rotation.x = Math.PI / 2;
            spk.position.set(xOff, 0.225, 0.13);
            group.add(spk);
        });

        // Cassette Deck door in center
        const deck = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.16, 0.02),
            new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
        );
        deck.position.set(0, 0.225, 0.13);
        group.add(deck);

        // Chrome Handle
        const handleMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95 });
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.04), handleMat);
        handle.position.set(0, 0.52, 0);
        group.add(handle);

        this.officeGroup.add(group);
    }

    createChair(color) {
        const chair = new THREE.Group();
        const seatMat = new THREE.MeshStandardMaterial({ color: color || 0x4a3b32, roughness: 0.7 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.7, roughness: 0.4 });

        // Base & 5 casters
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 5), blackMat);
        base.position.y = 0.15;
        chair.add(base);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5), blackMat);
        stem.position.y = 0.45;
        chair.add(stem);

        // Thick seat cushion
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.6), seatMat);
        seat.position.y = 0.72;
        seat.receiveShadow = true;
        chair.add(seat);

        // Backrest with curve
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.08), seatMat);
        back.position.set(0, 1.15, 0.28);
        back.rotation.x = 0.08;
        back.receiveShadow = true;
        chair.add(back);

        return chair;
    }

    createCoffeeStation(x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        // Small wooden credenza
        const cabinet = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 1.2, 0.9),
            new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 })
        );
        cabinet.position.y = 0.6;
        cabinet.castShadow = true;
        group.add(cabinet);

        // Retro Drip Coffee Machine
        const machine = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.6, 0.45),
            new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 })
        );
        machine.position.set(0, 1.5, 0);
        group.add(machine);

        // Glass Carafe with dark brown coffee
        const carafe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.16, 0.28, 12),
            new THREE.MeshPhysicalMaterial({ color: 0x3d2010, transparent: true, opacity: 0.85, roughness: 0.1 })
        );
        carafe.position.set(0, 1.34, 0.12);
        group.add(carafe);

        // Coffee Mug with rising steam
        const mug = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.06, 0.14, 12),
            new THREE.MeshStandardMaterial({ color: 0xf1f5f9 })
        );
        mug.position.set(0.4, 1.27, 0.1);
        group.add(mug);

        this.officeGroup.add(group);
    }

    // --- ANIMATED 3D STYLIZED CHARACTERS ---

    syncEmployees(employeeList) {
        while (this.characters.length > employeeList.length) {
            this.removeCharacter(this.characters.pop());
        }
        employeeList.forEach((employee, index) => {
            const previous = this.characters[index];
            if (previous?.employee === employee) return;
            if (previous) this.removeCharacter(previous);
            const character = this.buildCharacterMesh(employee, index);
            this.charactersGroup.add(character.group);
            this.characters[index] = character;
        });
        this.updateCharacterPositions();
    }

    buildCharacterMesh(employee, index) {
        const model = createEmployeeModel(THREE, employee, index);
        const face = createEmployeeFace(THREE, model.faceAnchor, model.faceSize, model.skinColor, model.seed);

        const bulbGroup = new THREE.Group();
        bulbGroup.position.set(0, 2.18, 0);
        bulbGroup.visible = false;
        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 12, 8),
            new THREE.MeshBasicMaterial({ color: 0xfacc15 })
        );
        bulbGroup.add(bulb);
        model.group.add(bulbGroup);

        const character = {
            ...model, employee, index, face, bulbGroup, state: 'typing', stateUntil: 0,
            dispose() {
                face.dispose();
                model.dispose();
                bulb.geometry.dispose();
                bulb.material.dispose();
            },
        };
        initializeEmployeeAnimation(character);
        return character;
    }

    removeCharacter(character) {
        if (this.hoveredCharacter === character) this.hoveredCharacter = null;
        this.charactersGroup.remove(character.group);
        character.dispose();
    }

    updateCharacterMesh(index, customConfig) {
        const previous = this.characters[index];
        if (!previous) return;

        const employee = game.employees[index];
        if (customConfig) {
            employee.customization = { ...employee.customization, ...customConfig };
        }
        const character = this.buildCharacterMesh(employee, index);
        character.state = previous.state;
        character.stateUntil = previous.stateUntil;
        this.removeCharacter(previous);
        this.charactersGroup.add(character.group);
        this.characters[index] = character;
        this.updateCharacterPositions();
    }

    updateCharacterPositions() {
        this.characters.forEach((character, index) => {
            const desk = this.desks[index];
            character.group.visible = Boolean(desk);
            if (!desk) return;
            const { x, y, z } = desk.worldPos;
            character.group.position.set(x, y, z + 0.85);
        });
    }

    // --- PARTICLE PHYSICS & DYNAMIC FX ---

    spawnCodeParticle(type, empIndex) {
        let origin = new THREE.Vector3(0, 1.85, 0);
        if (this.monitors[empIndex]) {
            origin.copy(this.monitors[empIndex].lightPos);
        }

        let color = 0x00d2ff; // tech cyan
        if (type === 'design') color = 0xf59e0b; // design amber
        if (type === 'bug') color = 0xef4444; // bug red
        if (type === 'research') color = 0xa855f7; // research purple

        const geo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
        const mat = new THREE.MeshBasicMaterial({ color: color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(origin);
        this.particlesGroup.add(mesh);

        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 1.6,
            2.2 + Math.random() * 1.1,
            (Math.random() - 0.5) * 1.6
        );

        this.activeParticles.push({
            mesh, velocity, life: 1.0, decay: 0.032,
            rotSpeed: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6)
        });
    }

    triggerLaunchConfetti() {
        const colors = [0xff0055, 0x00d2ff, 0xffd700, 0x00ff88, 0xa855f7, 0xff8800];
        for (let i = 0; i < 90; i++) {
            const geo = new THREE.PlaneGeometry(0.18, 0.12);
            const mat = new THREE.MeshBasicMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set((Math.random() - 0.5) * 7, 6.5 + Math.random() * 2, (Math.random() - 0.5) * 7);
            this.confettiGroup.add(mesh);

            this.confettiParticles.push({
                mesh,
                velocity: new THREE.Vector3((Math.random() - 0.5) * 2, -1.2 - Math.random() * 1.5, (Math.random() - 0.5) * 2),
                rotSpeed: new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8),
                life: 1.0, decay: 0.008
            });
        }

        this.characters.forEach(char => {
            char.state = 'celebrating';
            char.stateUntil = this.clock.elapsedTime + 6;
        });
    }

    // --- ANIMATION LOOP ---

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.elapsedTime;

        if (this.controls) this.controls.update();

        // Upload the CRT canvas only when its scrolling content changes.
        const scroll = Math.floor(time * 20) % 20;
        for (const monitor of this.dynamicTextures) {
            if (monitor.lastScroll === scroll) continue;
            monitor.lastScroll = scroll;
            const { ctx, lines, texture } = monitor;
            ctx.fillStyle = '#051b11';
            ctx.fillRect(0, 0, 256, 192);
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                ctx.fillStyle = line.color;
                ctx.fillRect(16 + line.indent, 14 + ((i + scroll) % 20) * 8.5, line.w, 4);
            }
            texture.needsUpdate = true;
        }
        this.monitors.forEach(({ pointLight }, index) => {
            if (pointLight) pointLight.intensity = 0.8 + Math.sin(time * 18 + index) * 0.12;
        });

        // Spawn and update Coffee Steam Particles
        if (this.coffeeMugPos && Math.random() < 0.25) {
            const steamGeo = new THREE.PlaneGeometry(0.06, 0.06);
            const steamMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.35,
                depthWrite: false
            });
            const steamMesh = new THREE.Mesh(steamGeo, steamMat);
            steamMesh.position.copy(this.coffeeMugPos);
            steamMesh.position.x += (Math.random() - 0.5) * 0.06;
            steamMesh.position.z += (Math.random() - 0.5) * 0.06;
            this.steamGroup.add(steamMesh);
            this.steamParticles.push({
                mesh: steamMesh,
                vy: 0.25 + Math.random() * 0.15,
                life: 1.0,
                decay: 0.02
            });
        }

        for (let s = this.steamParticles.length - 1; s >= 0; s--) {
            const st = this.steamParticles[s];
            st.mesh.position.y += st.vy * delta;
            st.mesh.position.x += Math.sin(time * 4 + s) * 0.003;
            st.life -= st.decay;
            st.mesh.material.opacity = st.life * 0.3;
            st.mesh.scale.setScalar(1 + (1 - st.life) * 1.5);
            if (st.life <= 0) {
                this.steamGroup.remove(st.mesh);
                st.mesh.geometry.dispose();
                st.mesh.material.dispose();
                this.steamParticles.splice(s, 1);
            }
        }

        for (const character of this.characters) {
            if (!character.group.visible) continue;
            if (time >= character.stateUntil) character.state = 'typing';
            character.bulbGroup.visible = character.state === 'thinking';
            animateEmployee(character, time);
            character.face.update(time, character.state);
        }

        // Animate Development Particles
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const p = this.activeParticles[i];
            p.mesh.position.addScaledVector(p.velocity, delta);
            p.mesh.rotation.x += p.rotSpeed.x * delta;
            p.mesh.rotation.y += p.rotSpeed.y * delta;
            p.velocity.y -= 2.2 * delta;

            p.life -= p.decay;
            p.mesh.scale.setScalar(Math.max(0.01, p.life));
            if (p.life <= 0) {
                this.particlesGroup.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.activeParticles.splice(i, 1);
            }
        }

        // Animate Confetti
        for (let c = this.confettiParticles.length - 1; c >= 0; c--) {
            const conf = this.confettiParticles[c];
            conf.mesh.position.addScaledVector(conf.velocity, delta);
            conf.mesh.rotation.x += conf.rotSpeed.x * delta;
            conf.mesh.rotation.y += conf.rotSpeed.y * delta;
            if (conf.mesh.position.y <= 0.05) {
                conf.velocity.set(0, 0, 0);
            }
            conf.life -= conf.decay;
            if (conf.life <= 0) {
                this.confettiGroup.remove(conf.mesh);
                conf.mesh.geometry.dispose();
                conf.mesh.material.dispose();
                this.confettiParticles.splice(c, 1);
            }
        }

        // Update 3D Holographic Scope Architecture DAG Subsystem
        this.updateScopeDag(delta, time);

        // Camera Smooth Lerp Transition between Office and Hologram DAG
        if (this.targetCamPos) {
            this.camera.position.lerp(this.targetCamPos, Math.min(1.0, delta * 4.5));
            if (this.camera.position.distanceTo(this.targetCamPos) < 0.05) {
                this.targetCamPos = null;
                this.isTransitioningCamera = false;
            }
        }
        if (this.targetLookAt && this.controls) {
            this.controls.target.lerp(this.targetLookAt, Math.min(1.0, delta * 4.5));
            if (this.controls.target.distanceTo(this.targetLookAt) < 0.05) {
                this.targetLookAt = null;
            }
        }

        if (time >= this.nextShadowRefresh) {
            this.renderer.shadowMap.needsUpdate = true;
            this.nextShadowRefresh = time + SHADOW_REFRESH_INTERVAL;
        }

        // Bloom is used for the hologram; the office renders in a single pass.
        if (this.composer && this.viewMode === 'dag_hologram') {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onWindowResize() {
        if (!this.container) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.resizeRenderer(width, height);
    }

    resizeRenderer(width, height) {
        const pixelRatio = Math.min(1, window.devicePixelRatio, Math.sqrt(MAX_RENDER_PIXELS / (width * height)));
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(width, height);
        if (this.composer) {
            this.composer.setPixelRatio(pixelRatio * 0.75);
            this.composer.setSize(width, height);
        }
    }

    // =========================================================================
    // --- 3D HOLOGRAPHIC SCOPE ARCHITECTURE DAG SUBSYSTEM (60 FPS OPTIMIZED) ---
    // =========================================================================

    initScopeDag(customCatalog = null) {
        this.buildHologramTable();
        this.renderScopeDAG3D(customCatalog);
    }

    buildHologramTable() {
        while (this.dagHologramTableGroup.children.length > 0) {
            this.dagHologramTableGroup.remove(this.dagHologramTableGroup.children[0]);
        }

        const tableGroup = new THREE.Group();

        // 1. Dark Slate Octagonal Cyber Pedestal
        const baseGeo = new THREE.CylinderGeometry(4.6, 5.0, 0.22, 16);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x111827,
            metalness: 0.88,
            roughness: 0.35
        });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = 0.11;
        baseMesh.receiveShadow = true;
        tableGroup.add(baseMesh);

        // 2. Cyan Neon Trim Ring on Pedestal Rim
        const ringGeo = new THREE.TorusGeometry(4.7, 0.035, 8, 36);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x00d2ff,
            emissive: 0x00f3ff,
            emissiveIntensity: 1.4,
            roughness: 0.2,
            metalness: 0.9
        });
        const rimMesh = new THREE.Mesh(ringGeo, ringMat);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = 0.22;
        tableGroup.add(rimMesh);

        // 3. Holographic Concentric Rotating Emitter Discs
        const outerDiscGeo = new THREE.RingGeometry(3.6, 4.4, 32);
        const outerDiscMat = new THREE.MeshBasicMaterial({
            color: 0x00f3ff,
            transparent: true,
            opacity: 0.28,
            side: THREE.DoubleSide,
            wireframe: true
        });
        this.tableOuterRing = new THREE.Mesh(outerDiscGeo, outerDiscMat);
        this.tableOuterRing.rotation.x = -Math.PI / 2;
        this.tableOuterRing.position.y = 0.23;
        tableGroup.add(this.tableOuterRing);

        // Inner Holographic Reticle Ring
        const innerDiscGeo = new THREE.RingGeometry(1.4, 3.2, 24);
        const innerDiscMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.22,
            side: THREE.DoubleSide
        });
        this.tableInnerRing = new THREE.Mesh(innerDiscGeo, innerDiscMat);
        this.tableInnerRing.rotation.x = -Math.PI / 2;
        this.tableInnerRing.position.y = 0.235;
        tableGroup.add(this.tableInnerRing);

        // 4. Hologram Cyber Polar Grid Floor
        const polarGrid = new THREE.PolarGridHelper(5.2, 16, 8, 32, 0x00f3ff, 0x0369a1);
        polarGrid.position.y = 0.24;
        tableGroup.add(polarGrid);

        // 5. Volumetric Cyan Projector Light Cone
        const coneGeo = new THREE.CylinderGeometry(5.4, 2.0, 5.2, 32, 1, true);
        const coneMat = new THREE.MeshBasicMaterial({
            color: 0x00d2ff,
            transparent: true,
            opacity: 0.075,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const coneMesh = new THREE.Mesh(coneGeo, coneMat);
        coneMesh.position.y = 2.8;
        tableGroup.add(coneMesh);

        // 6. Central Projector Focal Point Light
        const holoPoint = new THREE.PointLight(0x00f3ff, 1.2, 9);
        holoPoint.position.set(0, 1.2, 0);
        tableGroup.add(holoPoint);

        this.dagHologramTableGroup.add(tableGroup);
    }

    createGlowParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.25, 'rgba(120, 230, 255, 0.9)');
        grad.addColorStop(0.6, 'rgba(0, 160, 255, 0.4)');
        grad.addColorStop(1.0, 'rgba(0, 40, 120, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);

        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }

    renderScopeDAG3D(customNodes = null, customEdges = null) {
        // Clear previous nodes, pipes, and particles
        while (this.dagNodesGroup.children.length > 0) {
            this.dagNodesGroup.remove(this.dagNodesGroup.children[0]);
        }
        while (this.dagEdgesGroup.children.length > 0) {
            this.dagEdgesGroup.remove(this.dagEdgesGroup.children[0]);
        }
        while (this.dagParticlesGroup.children.length > 0) {
            this.dagParticlesGroup.remove(this.dagParticlesGroup.children[0]);
        }

        this.dagNodesMap.clear();
        this.dagNodesList = [];
        this.dagEdgesList = [];
        this.dagInteractiveMeshes = [];
        this.dagParticleData = [];

        // Determine nodes catalog & external edges
        let rawNodes = SCOPE_ARCHITECTURE_NODES;
        let externalEdges = null;

        const techMgr = game.techTreeManager;

        if (Array.isArray(customNodes) && customNodes.length > 0) {
            // Filter strictly to unlocked technologies if TechTreeManager is active
            rawNodes = (techMgr && typeof techMgr.isUnlocked === 'function')
                ? customNodes.filter(n => techMgr.isUnlocked(n.id))
                : customNodes;
            if (Array.isArray(customEdges)) externalEdges = customEdges;
        } else if (customNodes && (typeof customNodes.getDirectedEdges === 'function' || customNodes.nodes instanceof Map)) {
            // Compatible with ScopeDAG instance
            const dagInstance = customNodes;
            const activeSet = dagInstance.selectedNodeIds || new Set(dagInstance.nodes ? dagInstance.nodes.keys() : []);
            const nodeStates = dagInstance.nodeStates || new Map();
            const catalog = typeof SCOPE_NODES_CATALOG !== 'undefined' ? SCOPE_NODES_CATALOG : SCOPE_ARCHITECTURE_NODES;
            
            // Filter strictly to unlocked technologies
            const eligibleCatalog = (techMgr && typeof techMgr.isUnlocked === 'function')
                ? catalog.filter(n => techMgr.isUnlocked(n.id))
                : catalog;

            rawNodes = eligibleCatalog.map(node => {
                const isActive = activeSet.has(node.id);
                const s = nodeStates.get(node.id);
                let status = (s && s.status) ? s.status : (isActive ? 'active' : 'available');
                return {
                    ...node,
                    state: status
                };
            });

            if (typeof dagInstance.getDirectedEdges === 'function') {
                externalEdges = dagInstance.getDirectedEdges();
            } else if (Array.isArray(dagInstance.edges)) {
                externalEdges = dagInstance.edges;
            }
        }

        // Build 3D Prisms / Cylinders for each node
        rawNodes.forEach(nodeData => {
            const nodeObj = this.createDagNodeMesh(nodeData);
            this.dagNodesGroup.add(nodeObj.group);
            this.dagNodesMap.set(nodeObj.id, nodeObj);
            this.dagNodesList.push(nodeObj);
            this.dagInteractiveMeshes.push(nodeObj.hitMesh);
        });

        // Build 3D Cubic Bézier Cables connecting DAG dependencies
        this.createDagPipes(externalEdges);

        // Build Unified 60 FPS Particle Stream
        this.initDagParticles();
    }

    getDagNodeMaterial(state) {
        // Material craftsmanship matching the 6 required states:
        // 1. locked: Gris oscuro metálico con opacidad 0.4.
        // 2. available: Azul cian translúcido con borde resplandeciente.
        // 3. active: Oro/ámbar brillante con halo de luz.
        // 4. in_progress: Naranja con pulso dinámico en tiempo real.
        // 5. completed: Verde esmeralda resplandeciente con UnrealBloom.
        // 6. regression: Rojo carmesí parpadeante que avisa de deuda técnica / bugs.
        switch (state) {
            case 'locked':
                return new THREE.MeshStandardMaterial({
                    color: 0x1e242e,
                    metalness: 0.88,
                    roughness: 0.50,
                    transparent: true,
                    opacity: 0.40,
                    emissive: 0x07090e,
                    emissiveIntensity: 0.10
                });
            case 'available':
                return new THREE.MeshStandardMaterial({
                    color: 0x00b4d8,
                    metalness: 0.25,
                    roughness: 0.20,
                    transparent: true,
                    opacity: 0.82,
                    emissive: 0x00f3ff,
                    emissiveIntensity: 0.85
                });
            case 'active':
                return new THREE.MeshStandardMaterial({
                    color: 0xf59e0b,
                    metalness: 0.55,
                    roughness: 0.12,
                    transparent: false,
                    opacity: 1.0,
                    emissive: 0xffb703,
                    emissiveIntensity: 1.45
                });
            case 'in_progress':
                return new THREE.MeshStandardMaterial({
                    color: 0xff6b00,
                    metalness: 0.40,
                    roughness: 0.20,
                    transparent: false,
                    opacity: 1.0,
                    emissive: 0xff5500,
                    emissiveIntensity: 1.10
                });
            case 'completed':
                return new THREE.MeshStandardMaterial({
                    color: 0x10b981,
                    metalness: 0.35,
                    roughness: 0.10,
                    transparent: false,
                    opacity: 1.0,
                    emissive: 0x05f082,
                    emissiveIntensity: 2.20 // Pass through UnrealBloom threshold 0.88!
                });
            case 'regression':
                return new THREE.MeshStandardMaterial({
                    color: 0xef4444,
                    metalness: 0.50,
                    roughness: 0.20,
                    transparent: false,
                    opacity: 1.0,
                    emissive: 0xff1744,
                    emissiveIntensity: 1.80
                });
            default:
                return new THREE.MeshStandardMaterial({
                    color: 0x00b4d8,
                    metalness: 0.3,
                    roughness: 0.2,
                    emissive: 0x00d2ff,
                    emissiveIntensity: 0.5
                });
        }
    }

    createDagNodeMesh(data) {
        const defaultCoords = {
            'render_raster': [-5.5, 2.2, 2.4],
            'render_raytracing': [-5.2, 2.6, 1.4],
            'render_pixel': [-5.8, 1.8, 3.4],
            'physics_basic': [-3.3, 1.8, 3.4],
            'physics_ragdoll': [-3.0, 2.2, 2.4],
            'physics_destructible': [-2.7, 2.6, 1.4],
            'net_singleplayer': [-0.8, 1.8, 3.4],
            'net_p2p': [-0.5, 2.2, 2.4],
            'net_dedicated': [-0.2, 2.6, 1.4],
            'ai_scripts': [1.8, 1.8, 3.4],
            'ai_behavior': [2.1, 2.2, 2.4],
            'ai_neural': [2.4, 2.6, 1.4],
            'audio_stereo': [4.3, 1.8, 3.0],
            'audio_spatial': [4.6, 2.4, 2.0],
            'content_linear': [-2.5, 3.5, 0.2],
            'content_procedural': [0.0, 3.5, 0.2],
            'content_openworld': [2.5, 3.5, 0.2],
            'sys_daynight': [-2.2, 4.8, -2.2],
            'sys_weather': [0.0, 4.8, -2.2],
            'sys_rpg_tree': [-4.4, 4.8, -2.2],
            'sys_photomode': [2.2, 4.8, -2.2],
            'sys_modding': [4.4, 4.8, -2.2],
            'render_core': [-3.8, 1.8, 2.4],
            'physics_core': [-1.9, 1.8, 2.4],
            'netcode_core': [0.0, 1.8, 2.4],
            'ai_core': [1.9, 1.8, 2.4],
            'audio_core': [3.8, 1.8, 2.4],
            'open_world': [-3.0, 3.3, 0.2],
            'combat_system': [-1.0, 3.3, 0.2],
            'multiplayer_lobby': [0.0, 3.5, 0.8],
            'procedural_gen': [1.0, 3.3, 0.2],
            'quest_engine': [3.0, 3.3, 0.2],
            'soundtrack_adaptive': [4.4, 3.3, 0.8],
            'weather_system': [-3.4, 4.8, -2.0],
            'day_night_cycle': [-1.4, 4.8, -2.0],
            'destruction_physics': [0.6, 4.8, -2.0],
            'neural_npcs': [2.5, 4.8, -2.0],
            'modding_sdk': [4.3, 4.8, -2.0]
        };

        const defaultIcons = {
            render_raster: '🖥️', render_raytracing: '✨', render_pixel: '👾', render_core: '👁️',
            physics_basic: '📐', physics_ragdoll: '🤸', physics_destructible: '💥', physics_core: '⚛️',
            net_singleplayer: '👤', net_p2p: '🔗', net_dedicated: '🌐', netcode_core: '🌐',
            ai_scripts: '📜', ai_behavior: '🧠', ai_neural: '🤖', ai_core: '🧠',
            audio_stereo: '🎧', audio_spatial: '🔊', audio_core: '🔊',
            content_linear: '🛤️', content_procedural: '🎲', content_openworld: '🗺️', open_world: '🗺️',
            combat_system: '⚔️', multiplayer_lobby: '👥', procedural_gen: '🎲', quest_engine: '📜',
            soundtrack_adaptive: '🎼', sys_daynight: '🌓', sys_weather: '⛈️', sys_rpg_tree: '🌲',
            sys_photomode: '📸', sys_modding: '🛠️', weather_system: '⛈️', day_night_cycle: '🌓',
            destruction_physics: '💥', neural_npcs: '🤖', modding_sdk: '🛠️'
        };

        const group = new THREE.Group();
        const posArr = data.pos || defaultCoords[data.id] || [0, 2.5, 0];
        const basePos = new THREE.Vector3(posArr[0], posArr[1], posArr[2]);
        group.position.copy(basePos);

        const nodeCat = (data.category === 'base' || ['render', 'physics', 'netcode', 'ai', 'audio'].includes(data.category)) ? 'base' : (data.category === 'content' ? 'content' : 'systems');
        const nodeIcon = data.icon || defaultIcons[data.id] || '🔷';
        const categoryName = data.categoryName || (nodeCat === 'base' ? 'NODO BASE' : (nodeCat === 'content' ? 'CONTENIDO' : 'SISTEMAS'));

        data.pos = posArr;
        data.category = nodeCat;
        data.icon = nodeIcon;
        data.categoryName = categoryName;

        // Category-specific Stylized Prism / Cylinder Geometry
        let bodyGeo;
        if (nodeCat === 'base') {
            // Hexagonal Prism for Foundation
            bodyGeo = new THREE.CylinderGeometry(0.55, 0.62, 0.38, 6);
        } else if (nodeCat === 'content') {
            // Octagonal Prism for Content
            bodyGeo = new THREE.CylinderGeometry(0.52, 0.58, 0.40, 8);
        } else {
            // 12-sided Cylindrical Prism for Advanced Systems
            bodyGeo = new THREE.CylinderGeometry(0.50, 0.55, 0.44, 12);
        }

        const bodyMat = this.getDagNodeMaterial(data.state);
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.castShadow = true;
        group.add(bodyMesh);

        // Top Glowing Energy Core Cap
        const coreGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 8);
        const coreMat = new THREE.MeshStandardMaterial({
            color: bodyMat.color,
            emissive: bodyMat.emissive,
            emissiveIntensity: Math.max(0.6, bodyMat.emissiveIntensity * 0.9),
            roughness: 0.1,
            metalness: 0.8
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.y = 0.21;
        group.add(coreMesh);

        // Orbital Waist Halo Ring (Rotates continuously)
        const haloGeo = new THREE.TorusGeometry(0.72, 0.026, 8, 24);
        const haloMat = new THREE.MeshStandardMaterial({
            color: bodyMat.color,
            emissive: bodyMat.emissive,
            emissiveIntensity: Math.min(2.0, bodyMat.emissiveIntensity * 1.1),
            roughness: 0.2,
            metalness: 0.8
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        haloMesh.rotation.x = Math.PI / 2;
        group.add(haloMesh);

        // Projected Base Light Ring
        const discGeo = new THREE.RingGeometry(0.25, 0.65, 16);
        const discMat = new THREE.MeshBasicMaterial({
            color: bodyMat.emissive,
            transparent: true,
            opacity: 0.32,
            side: THREE.DoubleSide
        });
        const discMesh = new THREE.Mesh(discGeo, discMat);
        discMesh.rotation.x = -Math.PI / 2;
        discMesh.position.y = -0.20;
        group.add(discMesh);

        // Local Dynamic PointLight for Glowing Active Nodes
        let pointLight = null;
        if (['active', 'in_progress', 'completed', 'regression'].includes(data.state)) {
            pointLight = new THREE.PointLight(bodyMat.emissive, bodyMat.emissiveIntensity * 0.7, 3.2);
            pointLight.position.set(0, 0.3, 0);
            group.add(pointLight);
        }

        // Floating High-DPI Billboard Canvas Sprite Label (Faces Camera)
        const { canvas, ctx, tex } = this.createDagSpriteTexture(data);
        const spriteMat = new THREE.SpriteMaterial({
            map: tex,
            depthTest: false,
            transparent: true
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(1.7, 0.85, 1.0);
        sprite.position.set(0, 0.96, 0);
        group.add(sprite);

        // Invisible Raycasting Hit Box Mesh
        const hitGeo = new THREE.CylinderGeometry(0.75, 0.75, 1.2, 8);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.position.y = 0.4;
        group.add(hitMesh);

        const nodeObj = {
            id: data.id,
            data: { ...data },
            group,
            bodyMesh,
            coreMesh,
            haloMesh,
            discMesh,
            pointLight,
            sprite,
            spriteCanvas: canvas,
            spriteCtx: ctx,
            spriteTex: tex,
            hitMesh,
            basePos,
            currentScale: 1.0,
            targetScale: 1.0,
            state: data.state,
            phase: Math.random() * Math.PI * 2
        };

        hitMesh.userData = { nodeId: data.id, nodeObj, isDagNode: true };
        return nodeObj;
    }

    createDagSpriteTexture(data) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        this.drawDagSpriteCanvas(ctx, data);

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        return { canvas, ctx, tex };
    }

    drawDagSpriteCanvas(ctx, data) {
        ctx.clearRect(0, 0, 512, 256);

        // State-driven Glow & Accent Colors
        let strokeColor = '#00f3ff';
        let statusBadge = 'DISPONIBLE';
        let statusBg = 'rgba(0, 210, 255, 0.25)';

        if (data.state === 'completed') {
            strokeColor = '#05f082';
            statusBadge = '✔ COMPLETADO';
            statusBg = 'rgba(16, 185, 129, 0.35)';
        } else if (data.state === 'active') {
            strokeColor = '#ffb703';
            statusBadge = '⚡ ACTIVO';
            statusBg = 'rgba(245, 158, 11, 0.35)';
        } else if (data.state === 'in_progress') {
            strokeColor = '#ff6b00';
            statusBadge = '⚙ EN PROGRESO';
            statusBg = 'rgba(255, 107, 0, 0.35)';
        } else if (data.state === 'regression') {
            strokeColor = '#ff1744';
            statusBadge = '⚠ REGRESIÓN / BUG';
            statusBg = 'rgba(239, 68, 68, 0.35)';
        } else if (data.state === 'locked') {
            strokeColor = '#475569';
            statusBadge = '🔒 BLOQUEADO';
            statusBg = 'rgba(71, 85, 105, 0.30)';
        }

        if (!ctx.roundRect) {
            ctx.roundRect = function(rx, ry, rw, rh, rr) {
                this.beginPath();
                this.moveTo(rx + rr, ry);
                this.arcTo(rx + rw, ry, rx + rw, ry + rh, rr);
                this.arcTo(rx + rw, ry + rh, rx, ry + rh, rr);
                this.arcTo(rx, ry + rh, rx, ry, rr);
                this.arcTo(rx, ry, rx + rw, ry, rr);
                this.closePath();
            };
        }

        // 1. Dark Glass Card Container with Rounded Corners
        ctx.save();
        ctx.beginPath();
        const r = 24;
        const x = 12, y = 12, w = 488, h = 232;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();

        // Dark glass background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
        bgGrad.addColorStop(0, 'rgba(10, 16, 28, 0.94)');
        bgGrad.addColorStop(1, 'rgba(14, 22, 38, 0.88)');
        ctx.fillStyle = bgGrad;
        ctx.fill();

        // Glowing Border Stroke
        ctx.lineWidth = 5;
        ctx.strokeStyle = strokeColor;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.restore();

        // 2. Category Tag Pill (Top Left)
        ctx.save();
        let catColor = '#0284c7';
        if (data.category === 'content') catColor = '#9333ea';
        if (data.category === 'systems') catColor = '#d97706';

        ctx.fillStyle = catColor;
        ctx.beginPath();
        ctx.roundRect(32, 28, 140, 32, 8);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data.categoryName || 'NODO', 102, 50);

        // 3. Status Badge Pill (Top Right)
        ctx.fillStyle = statusBg;
        ctx.beginPath();
        ctx.roundRect(280, 28, 200, 32, 8);
        ctx.fill();

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = strokeColor;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(statusBadge, 380, 50);
        ctx.restore();

        // 4. Large Icon
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(data.icon || '🔷', 36, 128);

        // 5. Node Name Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(data.name || 'Nodo', 104, 118);

        // 6. Subtitle / Capability Description
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        const descText = (data.desc || '').length > 44 ? data.desc.slice(0, 41) + '...' : data.desc;
        ctx.fillText(descText, 36, 178);

        // 7. Mini Footer Accent Line
        ctx.fillStyle = strokeColor;
        ctx.fillRect(36, 200, 440, 3);
    }

    createDagPipes(customEdges = null) {
        this.dagEdgesList = [];
        const edgesToBuild = [];

        // 1. External edges (e.g. from ScopeDAG)
        if (Array.isArray(customEdges) && customEdges.length > 0) {
            customEdges.forEach(e => {
                const fromId = e.from || e.sourceId || e.source;
                const toId = e.to || e.targetId || e.target;
                if (fromId && toId) {
                    edgesToBuild.push({ from: fromId, to: toId });
                }
            });
        }

        // 2. Extracted dependencies / prerequisites from active nodes
        this.dagNodesList.forEach(targetNode => {
            const deps = targetNode.data.dependencies || targetNode.data.prerequisites || [];
            deps.forEach(sourceId => {
                edgesToBuild.push({ from: sourceId, to: targetNode.id });
            });
        });

        // 3. Deduplicate edges
        const edgeKeys = new Set();
        const uniqueEdges = [];
        edgesToBuild.forEach(e => {
            const k = `${e.from}->${e.to}`;
            if (!edgeKeys.has(k)) {
                edgeKeys.add(k);
                uniqueEdges.push(e);
            }
        });

        uniqueEdges.forEach(edge => {
            const sourceNode = this.dagNodesMap.get(edge.from);
            const targetNode = this.dagNodesMap.get(edge.to);
            if (!sourceNode || !targetNode) return;

            const p0 = sourceNode.basePos.clone();
            const p3 = targetNode.basePos.clone();

            // Compute elegant 3D Cubic Bézier control points
            const dy = p3.y - p0.y;
            const v1 = new THREE.Vector3(p0.x, p0.y + Math.max(0.7, dy * 0.45), p0.z);
            const v2 = new THREE.Vector3(p3.x, p3.y - Math.max(0.7, dy * 0.45), p3.z);

            // Safe Cubic Bézier Curve 3D construction
            const curve = new THREE.CubicBezierCurve3D(p0, v1, v2, p3);

            // Pipe Tube Mesh
            const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.038, 8, false);

            // Pipe emissive reflects source node status
            let pipeColor = 0x00d2ff;
            let pipeEmissive = 0x0099cc;
            let baseEmissiveInt = 0.45;

            if (sourceNode.state === 'completed') {
                pipeColor = 0x10b981;
                pipeEmissive = 0x00ff88;
                baseEmissiveInt = 0.85;
            } else if (sourceNode.state === 'active') {
                pipeColor = 0xf59e0b;
                pipeEmissive = 0xffb703;
                baseEmissiveInt = 0.95;
            } else if (sourceNode.state === 'in_progress') {
                pipeColor = 0xff6b00;
                pipeEmissive = 0xff6b00;
                baseEmissiveInt = 1.10;
            } else if (sourceNode.state === 'regression') {
                pipeColor = 0xef4444;
                pipeEmissive = 0xff1744;
                baseEmissiveInt = 1.40;
            } else if (sourceNode.state === 'locked') {
                pipeColor = 0x334155;
                pipeEmissive = 0x0f172a;
                baseEmissiveInt = 0.15;
            }

            const tubeMat = new THREE.MeshStandardMaterial({
                color: 0x0f172a,
                emissive: pipeEmissive,
                emissiveIntensity: baseEmissiveInt,
                roughness: 0.25,
                metalness: 0.85,
                transparent: true,
                opacity: 0.80
            });

            const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
            this.dagEdgesGroup.add(tubeMesh);

            this.dagEdgesList.push({
                sourceId: sourceNode.id,
                targetId: targetNode.id,
                sourceNode,
                targetNode,
                curve,
                tubeMesh,
                tubeMat,
                baseEmissive: baseEmissiveInt,
                highlighted: false
            });
        });
    }

    initDagParticles() {
        this.dagParticleData = [];
        const particlesPerEdge = 6;
        const totalParticles = this.dagEdgesList.length * particlesPerEdge;

        if (totalParticles === 0) return;

        const positions = new Float32Array(totalParticles * 3);
        const colors = new Float32Array(totalParticles * 3);

        let pIdx = 0;
        this.dagEdgesList.forEach(edge => {
            for (let i = 0; i < particlesPerEdge; i++) {
                const t = (i / particlesPerEdge) + Math.random() * 0.08;
                const speed = 0.35 + Math.random() * 0.20;

                this.dagParticleData.push({
                    edge,
                    curve: edge.curve,
                    t: t % 1.0,
                    speed,
                    index: pIdx
                });

                pIdx++;
            }
        });

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.22,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            map: this.createGlowParticleTexture()
        });

        this.dagParticlePoints = new THREE.Points(geom, mat);
        this.dagParticlesGroup.add(this.dagParticlePoints);
    }

    updateScopeDag(delta, time) {
        if (!this.scopeDagGroup || !this.scopeDagGroup.visible) return;

        // 1. Dynamic Floating Node Bobbing & Halo Torus Spin
        this.dagNodesList.forEach(node => {
            // Gentle floating vertical sine wave
            node.group.position.y = node.basePos.y + Math.sin(time * 2.2 + node.phase) * 0.06;

            // Halo ring continuous rotation in 3D
            node.haloMesh.rotation.y = time * 1.8;
            node.haloMesh.rotation.x = Math.sin(time + node.phase) * 0.2;

            // Real-time Dynamic Shader Pulses for In-Progress & Regression
            if (node.state === 'in_progress') {
                const pulse = 0.8 + Math.sin(time * 5.0 + node.phase) * 0.7;
                node.bodyMesh.material.emissiveIntensity = pulse;
                if (node.pointLight) node.pointLight.intensity = pulse * 0.8;
            } else if (node.state === 'regression') {
                const flash = Math.sin(time * 12.0) > 0 ? 2.5 : 0.3;
                node.bodyMesh.material.emissiveIntensity = flash;
                if (node.pointLight) node.pointLight.intensity = flash * 0.9;
            }

            // Spring interpolation for Hover Scale (1.15x)
            node.currentScale += (node.targetScale - node.currentScale) * 0.18;
            node.group.scale.setScalar(node.currentScale);
        });

        // 2. Rotate Holographic Concentric Table Reticles
        if (this.tableOuterRing) {
            this.tableOuterRing.rotation.z = time * 0.35;
        }
        if (this.tableInnerRing) {
            this.tableInnerRing.rotation.z = -time * 0.65;
        }

        // 3. Dynamic Particle Travel Along Cubic Bézier Curves (1 single draw-call 60 FPS)
        if (this.dagParticlePoints && this.dagParticleData.length > 0) {
            const posAttr = this.dagParticlePoints.geometry.attributes.position;
            const colAttr = this.dagParticlePoints.geometry.attributes.color;
            const posArray = posAttr.array;
            const colArray = colAttr.array;
            const tempVec = new THREE.Vector3();

            this.dagParticleData.forEach((p, idx) => {
                const speedMult = p.edge.highlighted ? 2.2 : (p.edge.sourceNode.state === 'in_progress' ? 1.4 : 1.0);
                p.t = (p.t + p.speed * speedMult * delta) % 1.0;
                p.curve.getPoint(p.t, tempVec);

                // Micro lateral energetic oscillation
                tempVec.x += Math.sin(time * 6.0 + idx) * 0.015;
                tempVec.y += Math.cos(time * 6.0 + idx) * 0.015;

                const base = idx * 3;
                posArray[base] = tempVec.x;
                posArray[base + 1] = tempVec.y;
                posArray[base + 2] = tempVec.z;

                // Color based on source node state
                const sState = p.edge.sourceNode.state;
                if (sState === 'completed') {
                    colArray[base] = 0.05; colArray[base + 1] = 1.0; colArray[base + 2] = 0.55;
                } else if (sState === 'regression') {
                    colArray[base] = 1.0; colArray[base + 1] = 0.1; colArray[base + 2] = 0.2;
                } else if (sState === 'in_progress') {
                    colArray[base] = 1.0; colArray[base + 1] = 0.45; colArray[base + 2] = 0.0;
                } else if (sState === 'active') {
                    colArray[base] = 1.0; colArray[base + 1] = 0.75; colArray[base + 2] = 0.05;
                } else if (sState === 'available') {
                    colArray[base] = 0.0; colArray[base + 1] = 0.85; colArray[base + 2] = 1.0;
                } else {
                    colArray[base] = 0.25; colArray[base + 1] = 0.3; colArray[base + 2] = 0.4;
                }
            });

            posAttr.needsUpdate = true;
            colAttr.needsUpdate = true;
        }

        // 4. Aerial DAG Orbital Rotation (When enabled)
        if (this.viewMode === 'dag_hologram' && this.dagOrbitEnabled && !this.targetCamPos) {
            this.dagOrbitAngle += delta * 0.15;
            this.camera.position.x = Math.sin(this.dagOrbitAngle) * 15.0;
            this.camera.position.z = Math.cos(this.dagOrbitAngle) * 15.0;
            this.camera.position.y = 13.5;
            if (this.controls) this.controls.target.copy(this.cameraDagTarget);
        }
    }

    setupInteraction() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let pointerDownPos = new THREE.Vector2();
        let pointerDownTime = 0;

        // Pointer Move for Hover Raycasting (Punto 2: Hover con outline / luminosidad brillante)
        this.renderer.domElement.addEventListener('pointermove', (e) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);

            // 1. Check DAG 3D Nodes Raycasting
            if (this.scopeDagGroup && this.scopeDagGroup.visible && this.dagInteractiveMeshes.length > 0) {
                const hits = raycaster.intersectObjects(this.dagInteractiveMeshes, false);
                if (hits.length > 0) {
                    const hitNode = hits[0].object.userData.nodeObj;
                    if (this.hoveredDagNode !== hitNode) {
                        this.hoveredDagNode = hitNode;
                        this.container.style.cursor = 'pointer';

                        // Scale Hovered Node to 1.15x
                        hitNode.targetScale = 1.15;

                        // Highlight Connected Bézier Dependency Pipes
                        this.highlightDependencies(hitNode.id, true);

                        // Non-hovered nodes return to 1.0x
                        this.dagNodesList.forEach(n => {
                            if (n !== hitNode) n.targetScale = 1.0;
                        });

                        if (typeof this.onNodeHoverCallback === 'function') {
                            this.onNodeHoverCallback(hitNode.id, hitNode.data, true);
                        }
                    }
                    return;
                }
            }

            // No DAG node hovered
            if (this.hoveredDagNode) {
                this.hoveredDagNode = null;
                this.container.style.cursor = 'default';
                this.dagNodesList.forEach(n => { n.targetScale = 1.0; });
                this.highlightDependencies(null, false);

                if (typeof this.onNodeHoverCallback === 'function') {
                    this.onNodeHoverCallback(null, null, false);
                }
            }

            // 2. Raycast Characters & Workstations (Hover de personajes al estilo Game Dev Tycoon)
            const officeTargets = [...this.charactersGroup.children, ...this.desks.map(d => d.group)];
            const officeHits = raycaster.intersectObjects(officeTargets, true);

            if (officeHits.length > 0) {
                const hitObj = officeHits[0].object;
                let targetChar = null;

                for (const char of this.characters) {
                    if (char.group.getObjectById(hitObj.id)) {
                        targetChar = char;
                        break;
                    }
                }
                if (!targetChar) {
                    for (const desk of this.desks) {
                        if (desk.group.getObjectById(hitObj.id)) {
                            targetChar = this.characters[desk.index] || this.characters[0];
                            break;
                        }
                    }
                }

                if (targetChar) {
                    if (this.hoveredCharacter !== targetChar) {
                        if (this.hoveredCharacter) {
                            this.unhighlightCharacter(this.hoveredCharacter);
                        }
                        this.hoveredCharacter = targetChar;
                        this.highlightCharacter(targetChar);
                    }
                    this.container.style.cursor = 'pointer';
                    return;
                }
            }

            if (this.hoveredCharacter) {
                this.unhighlightCharacter(this.hoveredCharacter);
                this.hoveredCharacter = null;
                this.container.style.cursor = 'default';
            }
        });

        // Pointer Down to record drag origin
        this.renderer.domElement.addEventListener('pointerdown', (e) => {
            pointerDownPos.set(e.clientX, e.clientY);
            pointerDownTime = performance.now();
        });

        // Pointer Up to detect Click (Distinguish from OrbitControls pan/rotation)
        this.renderer.domElement.addEventListener('pointerup', (e) => {
            const dragDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
            const elapsed = performance.now() - pointerDownTime;
            if (dragDist > 6 || elapsed > 450) return; // Ignore drags

            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);

            // 1. Raycast Interactive DAG Nodes
            if (this.scopeDagGroup && this.scopeDagGroup.visible && this.dagInteractiveMeshes.length > 0) {
                const dagHits = raycaster.intersectObjects(this.dagInteractiveMeshes, false);
                if (dagHits.length > 0) {
                    const nodeObj = dagHits[0].object.userData.nodeObj;

                    // Click Punch Animation (Jumps to 1.28x and spring-returns to 1.15x)
                    nodeObj.currentScale = 1.28;

                    if (soundEngine) {
                        soundEngine.playBubble('tech');
                    }

                    // Cycle or Toggle Node State
                    this.cycleNodeState(nodeObj.id);

                    // Callback & DOM Custom Event emission
                    if (typeof this.onNodeClickCallback === 'function') {
                        this.onNodeClickCallback(nodeObj.id, nodeObj.data);
                    }
                    window.dispatchEvent(new CustomEvent('scope-node-selected', {
                        detail: { nodeId: nodeObj.id, node: nodeObj.data }
                    }));

                    return;
                }
            }

            // A workstation selects its employee, just like clicking the character.
            const visibleCharacters = this.characters.filter(character => character.group.visible);
            const officeTargets = [...visibleCharacters.map(character => character.group), ...this.desks.map(desk => desk.group)];
            const officeHits = raycaster.intersectObjects(officeTargets, true);
            if (officeHits.length > 0) {
                const hit = officeHits[0].object;
                let character = visibleCharacters.find(item => item.group.getObjectById(hit.id));
                if (!character) {
                    const desk = this.desks.find(item => item.group.getObjectById(hit.id));
                    character = desk ? this.characters[desk.index] : null;
                }
                if (character) {
                    soundEngine.playKeyboardTap();
                    character.state = 'thinking';
                    character.stateUntil = this.clock.elapsedTime + 2.5;
                    const position = new THREE.Vector3();
                    character.group.getWorldPosition(position);
                    position.y += 1.35;
                    position.project(this.camera);
                    window.dispatchEvent(new CustomEvent('developer-selected', {
                        detail: {
                            index: character.index,
                            screenX: Math.round(rect.left + (position.x * 0.5 + 0.5) * rect.width),
                            screenY: Math.round(rect.top + (-position.y * 0.5 + 0.5) * rect.height),
                            charObj: character
                        }
                    }));
                    return;
                }
            }

            // Clic en el suelo o espacio vacío: cerrar menú contextual
            window.dispatchEvent(new CustomEvent('world-clicked-empty'));
        });
    }

    highlightCharacter(character) {
        const material = character?.torso.children.find(child => child.isMesh)?.material;
        if (material?.emissive) {
            material.emissive.setHex(0x00d2ff);
            material.emissiveIntensity = 0.25;
        }
    }

    unhighlightCharacter(character) {
        const material = character?.torso.children.find(child => child.isMesh)?.material;
        if (material?.emissive) {
            material.emissive.setHex(0x000000);
            material.emissiveIntensity = 0;
        }
    }

    highlightDependencies(nodeId, highlight = true) {
        this.dagEdgesList.forEach(edge => {
            if (highlight && nodeId && (edge.sourceId === nodeId || edge.targetId === nodeId)) {
                edge.highlighted = true;
                edge.tubeMesh.material.emissiveIntensity = 2.20; // High UnrealBloom glow!
            } else {
                edge.highlighted = false;
                edge.tubeMesh.material.emissiveIntensity = edge.baseEmissive;
            }
        });
    }

    setNodeState(nodeId, newState) {
        const nodeObj = this.dagNodesMap.get(nodeId);
        if (!nodeObj) return;

        nodeObj.state = newState;
        nodeObj.data.state = newState;

        // Update body material
        const newMat = this.getDagNodeMaterial(newState);
        nodeObj.bodyMesh.material = newMat;
        nodeObj.coreMesh.material.color = newMat.color;
        nodeObj.coreMesh.material.emissive = newMat.emissive;
        nodeObj.haloMesh.material.color = newMat.color;
        nodeObj.haloMesh.material.emissive = newMat.emissive;
        nodeObj.discMesh.material.color = newMat.emissive;

        // Update PointLight
        if (nodeObj.pointLight) {
            nodeObj.pointLight.color.copy(newMat.emissive);
            nodeObj.pointLight.intensity = newMat.emissiveIntensity * 0.7;
        }

        // Redraw high-DPI canvas sprite
        this.drawDagSpriteCanvas(nodeObj.spriteCtx, nodeObj.data);
        nodeObj.spriteTex.needsUpdate = true;

        // Refresh connected pipes emissive
        this.dagEdgesList.forEach(edge => {
            if (edge.sourceId === nodeId) {
                let pipeEmissive = newMat.emissive;
                let baseEmissiveInt = Math.max(0.3, newMat.emissiveIntensity * 0.7);
                edge.tubeMesh.material.emissive.copy(pipeEmissive);
                edge.baseEmissive = baseEmissiveInt;
                edge.tubeMesh.material.emissiveIntensity = edge.highlighted ? 2.20 : baseEmissiveInt;
            }
        });
    }

    cycleNodeState(nodeId) {
        const nodeObj = this.dagNodesMap.get(nodeId);
        if (!nodeObj) return;

        // Cycle through states: available -> in_progress -> completed -> active -> regression -> completed
        const stateOrder = ['available', 'in_progress', 'completed', 'active', 'regression'];
        let nextState;

        if (nodeObj.state === 'locked') {
            nextState = 'available';
        } else {
            const currIdx = stateOrder.indexOf(nodeObj.state);
            nextState = stateOrder[(currIdx + 1) % stateOrder.length];
        }

        this.setNodeState(nodeId, nextState);
    }

    getNode(nodeId) {
        const obj = this.dagNodesMap.get(nodeId);
        return obj ? obj.data : null;
    }

    getAllNodes() {
        return this.dagNodesList.map(n => n.data);
    }

    onNodeClick(callback) {
        this.onNodeClickCallback = callback;
    }

    onNodeHover(callback) {
        this.onNodeHoverCallback = callback;
    }

    setDagOrbit(enabled) {
        this.dagOrbitEnabled = Boolean(enabled);
        if (this.dagOrbitEnabled) {
            this.dagOrbitAngle = Math.atan2(this.camera.position.x, this.camera.position.z);
        }
    }

    setViewMode(mode) {
        this.viewMode = (mode === 'office' || mode === 'isometric') ? 'office' : 'dag_hologram';
        this.isTransitioningCamera = true;
        this.nextShadowRefresh = 0;

        if (this.viewMode === 'dag_hologram') {
            this.scopeDagGroup.visible = true;
            this.targetCamPos = this.cameraDagPos.clone();
            this.targetLookAt = this.cameraDagTarget.clone();

            if (this.ambientLight) this.ambientLight.intensity = 0.35;
            if (this.sunLight) this.sunLight.intensity = 0.35;
        } else {
            this.scopeDagGroup.visible = false;
            this.targetCamPos = this.cameraOfficePos.clone();
            this.targetLookAt = this.cameraOfficeTarget.clone();

            if (this.ambientLight) this.ambientLight.intensity = 0.55;
            if (this.sunLight) this.sunLight.intensity = 1.25;
        }
        return this.viewMode;
    }

    showScopeDAG(customCatalog = null, pipeline = null) {
        if (customCatalog) {
            this.renderScopeDAG3D(customCatalog, pipeline);
        }
        this.scopeDagGroup.visible = true;
        this.setViewMode('dag_hologram');
    }

    hideScopeDAG() {
        this.scopeDagGroup.visible = false;
        this.setViewMode('office');
        if (this.hoveredDagNode) {
            this.hoveredDagNode.targetScale = 1.0;
            this.hoveredDagNode = null;
        }
        if (this.container) {
            this.container.style.cursor = 'default';
        }
    }

    clearScopeDAG() {
        this.hideScopeDAG();
        while (this.dagNodesGroup.children.length > 0) {
            this.dagNodesGroup.remove(this.dagNodesGroup.children[0]);
        }
        while (this.dagEdgesGroup.children.length > 0) {
            this.dagEdgesGroup.remove(this.dagEdgesGroup.children[0]);
        }
        while (this.dagParticlesGroup.children.length > 0) {
            this.dagParticlesGroup.remove(this.dagParticlesGroup.children[0]);
        }
        this.dagNodesMap.clear();
        this.dagNodesList = [];
        this.dagEdgesList = [];
        this.dagInteractiveMeshes = [];
        this.dagParticleData = [];
    }

    toggleGraphView() {
        const nextMode = this.viewMode === 'office' ? 'dag_hologram' : 'office';
        return this.setViewMode(nextMode);
    }

    toggleViewMode(mode = null) {
        if (mode !== null) return this.setViewMode(mode);
        return this.toggleGraphView();
    }
}

