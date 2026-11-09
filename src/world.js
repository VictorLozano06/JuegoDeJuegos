import { buildGarageLayout } from './garage/layout.js';
import { applyOfficeLighting } from './garage/lighting.js';
import { createRetroWorkstation } from './garage/workstation.js';
import { buildModernOffice } from './office/modern.js';
import { createModernPeripherals } from './office/peripherals.js';
import { OFFICE_CATALOG, STARTING_OFFICE } from './data/offices.js';
import { animateEmployee, initializeEmployeeAnimation } from './characters/animation.js';
import { createEmployeeFace } from './characters/face.js';
import { createEmployeeModel } from './characters/model.js';
import { MenuCamera } from './menuCamera.js';
import { soundEngine } from './audio.js';
import { DAG_CATALOG as SCOPE_NODES_CATALOG } from './dag_engine.js';
import { game } from './simulation.js';

const THREE = window.THREE;
const MAX_RENDER_PIXELS = 1_500_000;
const SHADOW_REFRESH_INTERVAL = 1 / 20;
const OFFICE_SCENES = {
    garage: { build: buildGarageLayout, position: [11, 7.3, 8], target: [0, 1, 0] },
    modern: { build: buildModernOffice, position: [13, 14, 16], target: [0, 0.95, -0.45] },
    campus: { build: world => world.buildCyberCampusEra(), position: [16, 9, -7], target: [0, 1, 0] }
};
const officeAtTier = tier => OFFICE_CATALOG.find(office => office.tier === tier) ?? STARTING_OFFICE;
const CRT_CODE = [
    '> RUN DEV_EMPIRE.BAS', '10 GOSUB INIT', '20 IF KEY$="" THEN 40',
    '30 GOSUB HANDLE_KEY', '40 GOSUB DRAW_FRAME', '50 GOTO 20',
    '100 REM LOAD SPRITES', '110 FOR I=0 TO 15', '120 READ PIXEL',
    '130 NEXT I', '140 RETURN', 'READY.',
];

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
        icon: '[[DE_ICON_053]]',
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
        icon: '[[DE_ICON_055]]',
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
        icon: '[[DE_ICON_020]]',
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
        icon: '[[DE_ICON_056]]',
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
        icon: '[[DE_ICON_008]]',
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
        icon: '[[DE_ICON_057]]',
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
        icon: '[[DE_ICON_076]]',
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
        icon: '[[DE_ICON_031]]',
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
        icon: '[[DE_ICON_038]]',
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
        icon: '[[DE_ICON_077]]',
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
        icon: '[[DE_ICON_078]]',
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
        icon: '[[DE_ICON_079]]',
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
        icon: '[[DE_ICON_080]]',
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
        icon: '[[DE_ICON_081]]',
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
        icon: '[[DE_ICON_082]]',
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
        icon: '[[DE_ICON_015]]',
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
        this.cameraOfficePos = new THREE.Vector3(...OFFICE_SCENES[STARTING_OFFICE.sceneId].position);
        this.cameraOfficeTarget = new THREE.Vector3(...OFFICE_SCENES[STARTING_OFFICE.sceneId].target);
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
        this.floatingRPs = [];
        this.steamParticles = [];
        this.steamGeometry = new THREE.PlaneGeometry(0.06, 0.06);
        this.interactiveComputers = [];
        this.hoveredComputer = null;
        this.previousCameraPos = null;
        this.previousControlsTarget = null;

        this.currentEra = 1;
        this.resolution = 'medium';
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
        this.menuCamera = new MenuCamera(THREE, this.camera, this.controls);

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

    warmupRenderer() {
        if (!this.renderer || !this.scene || !this.camera) return;
        try {
            this.renderer.compile(this.scene, this.camera);
            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        } catch (e) {
            console.warn('Compilación inicial de shaders:', e);
        }
    }

    enterMainMenu() {
        this.setViewMode('office');
        this.targetCamPos = null;
        this.targetLookAt = null;
        this.isTransitioningCamera = false;
        if (this.hoveredCharacter) {
            this.unhighlightCharacter(this.hoveredCharacter);
            this.hoveredCharacter = null;
        }
        this.container.style.cursor = 'default';
        this.menuCamera.enter(this.desks[0]?.worldPos, this.clock.elapsedTime);
    }

    transitionToGameplay({ era = this.currentEra, revealOffice } = {}) {
        this.targetCamPos = null;
        this.targetLookAt = null;
        this.isTransitioningCamera = false;
        const framing = OFFICE_SCENES[officeAtTier(era).sceneId];
        return this.menuCamera.play(
            new THREE.Vector3(...framing.position), new THREE.Vector3(...framing.target), revealOffice
        );
    }

    setGraphicsSettings({ resolution = this.resolution, shadows } = {}) {
        this.resolution = resolution;
        this.onWindowResize();
        const shadowSize = { off: 0, low: 512, medium: 1024, high: 2048 }[shadows];
        if (shadowSize === undefined) return;
        this.renderer.shadowMap.enabled = shadowSize > 0;
        const shadow = this.sunLight.shadow;
        if (shadowSize && shadow.mapSize.x !== shadowSize) {
            shadow.map?.dispose();
            shadow.map = null;
            shadow.mapSize.set(shadowSize, shadowSize);
        }
        this.nextShadowRefresh = 0;
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
        this.rimLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
        this.rimLight.position.set(-12, 12, -12);
        this.scene.add(this.rimLight);
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
        ctx.fillText('[[DE_ICON_148]] 10/10 Score', 368, 178);

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

    // --- PROCEDURAL 3D ARCHITECTURE & STORYTELLING PROPS ---

    buildOffice(era) {
        const office = officeAtTier(era);
        const eraChanged = office.tier !== this.currentEra;
        this.currentEra = office.tier;

        // All props and maps in this group belong to the previous office.
        const resources = new Set();
        this.officeGroup.traverse(object => {
            if (object.geometry) resources.add(object.geometry);
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            for (const material of materials) {
                if (!material) continue;
                resources.add(material);
                for (const value of Object.values(material)) {
                    if (value?.isTexture) resources.add(value);
                }
            }
        });
        for (const resource of resources) resource.dispose();
        this.officeGroup.clear();
        this.dynamicTextures = [];
        this.nextShadowRefresh = 0;
        this.desks = [];
        this.monitors = [];
        this.serverLeds = [];
        this.interactiveComputers = [];
        this.clearComputerHover();

        const framing = OFFICE_SCENES[office.sceneId];
        framing.build(this, THREE);
        applyOfficeLighting(this);
        this.cameraOfficePos.set(...framing.position);
        this.cameraOfficeTarget.set(...framing.target);
        if (eraChanged && this.viewMode === 'office' && !this.menuCamera.active) {
            this.isTransitioningCamera = true;
            this.targetCamPos = this.cameraOfficePos.clone();
            this.targetLookAt = this.cameraOfficeTarget.clone();
        }
        this.updateCharacterPositions();
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
        if (style === 'retro') {
            const chair = this.createChair(index === 0 ? 0x8d624b : 0x536d62);
            const screenTexture = this.createAnimatedMonitorCanvas('retro');
            const { group, screen, monitorFallback, keyboardFallback, mouseFallback } = createRetroWorkstation(THREE, { index, screenTexture, chair });
            group.position.set(x, y, z);
            this.registerDesk(group, index);
            const lamp = group.getObjectByName('flexo_bulb');
            this.monitors.push({
                mesh: screen,
                lightPos: screen.getWorldPosition(new THREE.Vector3()),
                lamp,
                lampIntensity: lamp?.intensity,
            });
            if (THREE.GLTFLoader) {
                const loadFittedModel = (url, fallback, options) => {
                    new THREE.GLTFLoader().load(url, gltf => {
                        if (!group.parent) return;
                        const model = gltf.scene;
                        if (options.rotation) model.rotation.y = options.rotation;
                        if (options.removeName) {
                            const extra = model.getObjectByName(options.removeName);
                            if (extra?.parent) extra.parent.remove(extra);
                        }
                        const container = new THREE.Group();
                        container.add(model);
                        container.updateMatrixWorld(true);
                        const bounds = new THREE.Box3().setFromObject(container);
                        const size = bounds.getSize(new THREE.Vector3());
                        if (!size.x || !size.y || !size.z) throw new Error(`El modelo ${options.name} no tiene dimensiones válidas.`);
                        const center = bounds.getCenter(new THREE.Vector3());
                        let sx = options.width / size.x, sy = options.height / size.y, sz = options.depth / size.z;
                        if (options.uniform) sx = sy = sz = options.height / size.y;
                        if (options.preserveHorizontal) sx = sz = options.width / Math.max(size.x, size.z);
                        container.scale.set(sx, sy, sz);
                        container.position.set(options.x - center.x * sx, options.bottom - bounds.min.y * sy, options.z - center.z * sz);
                        container.name = options.name;
                        let animatedScreenAssigned = false;
                        model.traverse(object => {
                            if (!object.isMesh) return;
                            object.castShadow = true;
                            object.receiveShadow = true;
                            const materialName = object.material?.name || '';
                            if (options.animatedScreen && /screen.?surface/i.test(materialName)) {
                                object.visible = false;
                            } else if (options.animatedScreen && /win.?98.?screen/i.test(materialName)) {
                                // The downloaded screen uses an atlas. Project the animated canvas
                                // onto its own curved surface so it stays inside the CRT bezel.
                                object.geometry = object.geometry.clone();
                                object.geometry.computeBoundingBox();
                                const { min, max } = object.geometry.boundingBox;
                                const position = object.geometry.getAttribute('position');
                                const uv = new Float32Array(position.count * 2);
                                for (let i = 0; i < position.count; i++) {
                                    uv[i * 2] = (position.getY(i) - min.y) / (max.y - min.y);
                                    uv[i * 2 + 1] = (position.getZ(i) - min.z) / (max.z - min.z);
                                }
                                object.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
                                object.material = new THREE.MeshBasicMaterial({ map: screenTexture, side: THREE.DoubleSide });
                                animatedScreenAssigned = true;
                            }
                        });
                        group.add(container);
                        fallback.visible = false;
                        if (animatedScreenAssigned) screen.visible = false;
                        this.nextShadowRefresh = 0;
                    });
                };
                loadFittedModel('/models/retro-monitor.glb', monitorFallback, { name: 'Ordenador retro', width: 0.92, height: 0.78, depth: 0.58, x: 0, bottom: 1.40, z: -0.26, rotation: -Math.PI / 2, animatedScreen: true });
                loadFittedModel('/models/retro-keyboard.glb', keyboardFallback, { name: 'Teclado retro', width: 0.76, height: 0.05, depth: 0.30, x: 0.15, bottom: 1.40, z: 0.42, rotation: -Math.PI / 2 });
                loadFittedModel('/models/retro-mouse.glb', mouseFallback, { name: 'Ratón retro', width: 0.09, height: 0.05, depth: 0.13, x: 0.61, bottom: 1.405, z: 0.39, rotation: -Math.PI / 2 });
            }
            return;
        }

        const deskGroup = new THREE.Group();
        deskGroup.position.set(x, y, z);
        const isCyber = style === 'cyber';

        // Heavy solid timber tabletop
        const topGeo = new THREE.BoxGeometry(2.3, 0.1, 1.2);
        const topMat = new THREE.MeshStandardMaterial({
            color: isCyber ? 0x1f2937 : 0xf8fafc,
            roughness: 0.3,
            metalness: isCyber ? 0.6 : 0.1
        });
        const tableTop = new THREE.Mesh(topGeo, topMat);
        tableTop.position.y = 1.35;
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        deskGroup.add(tableTop);

        const steelMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.3 });
        [[-1.0, -0.48], [1.0, -0.48], [-1.0, 0.48], [1.0, 0.48]].forEach(pos => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.35, 8), steelMat);
            leg.position.set(pos[0], 0.675, pos[1]);
            leg.castShadow = true;
            deskGroup.add(leg);
        });

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

        deskGroup.add(createModernPeripherals(THREE, { tabletop: 1.40, cyber: isCyber }));

        // Office Chair
        const chair = this.createChair(0x0284c7);
        chair.position.set(0, 0, 0.85);
        deskGroup.add(chair);

        this.registerDesk(deskGroup, index);
    }

    registerDesk(group, index, slot = {}, parent = this.officeGroup) {
        group.userData = { type: 'desk', index };
        parent.add(group);

        // Find CRT or monitor screen mesh
        let screen = group.getObjectByName('curved_crt_screen') || 
                     group.getObjectByName('Pantalla de desarrollo');
        if (!screen) {
            group.traverse(child => {
                if (!screen && child.isMesh && (child.name?.includes('screen') || child.name?.includes('Pantalla') || child.geometry?.type === 'PlaneGeometry')) {
                    screen = child;
                }
            });
        }

        // Invisible Raycasting Hit Box Mesh for comfortable clicking
        const compHitbox = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.8, 0.7),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        compHitbox.name = `comp_hitbox_${index}`;
        compHitbox.position.set(0, 1.82, -0.15);
        compHitbox.userData = { isComputer: true, deskIndex: index, deskGroup: group, screenMesh: screen };
        group.add(compHitbox);
        this.interactiveComputers.push(compHitbox);

        if (screen) {
            screen.userData = { isComputer: true, deskIndex: index, deskGroup: group };
            this.interactiveComputers.push(screen);
        }

        this.desks.push({
            id: slot.id ?? 'desk-' + index,
            role: slot.role ?? (index === 0 ? 'founder' : 'employee'),
            index,
            group,
            screen,
            compHitbox,
            worldPos: group.getWorldPosition(new THREE.Vector3()),
            seatPos: group.localToWorld(new THREE.Vector3(0, 0, 0.85)),
            occupant: null
        });
    }

    createChair(color) {
        const chair = new THREE.Group();
        const seatMat = new THREE.MeshStandardMaterial({ color: color || 0x4a3b32, roughness: 0.7 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.7, roughness: 0.4 });

        // Weighted pedestal resting on the floor
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.32, 0.09, 10), blackMat);
        base.position.y = 0.045;
        base.receiveShadow = true;
        chair.add(base);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.58), blackMat);
        stem.position.y = 0.37;
        stem.receiveShadow = true;
        chair.add(stem);

        // Thick seat cushion
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.6), seatMat);
        seat.position.y = 0.72;
        seat.receiveShadow = true;
        seat.castShadow = true;
        chair.add(seat);

        // Backrest with curve
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.08), seatMat);
        back.position.set(0, 1.15, 0.28);
        back.rotation.x = 0.08;
        back.receiveShadow = true;
        back.castShadow = true;
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

        const statusBubbleCanvas = document.createElement('canvas');
        statusBubbleCanvas.width = 128;
        statusBubbleCanvas.height = 28;
        const statusBubbleContext = statusBubbleCanvas.getContext('2d');
        const statusBubbleTexture = new THREE.CanvasTexture(statusBubbleCanvas);
        const statusBubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: statusBubbleTexture, transparent: true, depthTest: false }));
        statusBubble.position.set(0, 2.55, 0);
        statusBubble.scale.set(0.82, 0.12, 1);
        statusBubble.renderOrder = 20;
        statusBubble.visible = false;
        model.group.add(statusBubble);

        // 3D Engine R&D Progress Bar Sprite
        const engineProgressCanvas = document.createElement('canvas');
        engineProgressCanvas.width = 256;
        engineProgressCanvas.height = 72;
        const engineProgressContext = engineProgressCanvas.getContext('2d');
        const engineProgressTexture = new THREE.CanvasTexture(engineProgressCanvas);
        const engineProgressSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: engineProgressTexture, transparent: true, depthTest: false }));
        engineProgressSprite.position.set(0, 3.25, 0);
        engineProgressSprite.scale.set(1.4, 0.40, 1);
        engineProgressSprite.renderOrder = 25;
        engineProgressSprite.visible = false;
        model.group.add(engineProgressSprite);

        const character = {
            ...model, employee, index, face, bulbGroup, statusBubble, statusBubbleCanvas, statusBubbleContext, statusBubbleTexture, statusBubbleProgress: -1,
            engineProgressSprite, engineProgressCanvas, engineProgressContext, engineProgressTexture, engineProgressVal: -1,
            state: 'typing', stateUntil: 0,
            dispose() {
                face.dispose();
                model.dispose();
                bulb.geometry.dispose();
                bulb.material.dispose();
                statusBubbleTexture.dispose();
                statusBubble.material.dispose();
                engineProgressTexture.dispose();
                engineProgressSprite.material.dispose();
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

    updateCharacterMesh(index, customConfig, { preview = false } = {}) {
        const previous = this.characters[index];
        if (!previous) return;

        const employee = game.employees[index];
        if (customConfig && !preview) {
            employee.customization = { ...employee.customization, ...customConfig };
        }
        const character = this.buildCharacterMesh(preview ? { ...employee, customization: { ...employee.customization, ...customConfig } } : employee, index);
        character.state = previous.state;
        character.stateUntil = previous.stateUntil;
        this.removeCharacter(previous);
        this.charactersGroup.add(character.group);
        this.characters[index] = character;
        this.updateCharacterPositions();
        this.needsStaticFrame = true;
    }

    updateCharacterPositions() {
        const founderIndex = Math.max(0, this.characters.findIndex(character => character.employee.id === 'player'));
        const staffDesks = this.desks.filter(desk => desk.role === 'employee');
        const founderDesk = this.desks.find(desk => desk.role === 'founder');
        this.desks.forEach(desk => { desk.occupant = null; });
        let staffIndex = 0;
        this.characters.forEach((character, index) => {
            const desk = index === founderIndex ? founderDesk : staffDesks[staffIndex++];
            character.deskIndex = desk?.index;
            character.group.visible = Boolean(desk);
            if (!desk) return;
            desk.occupant = character;
            character.group.position.copy(desk.seatPos);
        });
    }

    // --- PARTICLE PHYSICS & DYNAMIC FX ---

    spawnCodeParticle(type, empIndex) {
        let origin = new THREE.Vector3(0, 1.85, 0);
        const monitor = this.monitors[this.characters[empIndex]?.deskIndex];
        if (monitor) {
            origin.copy(monitor.lightPos);
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

    spawnDevelopmentBubble(type, empIndex = 0) {
        let origin = new THREE.Vector3(0, 1.85, 0);
        const char = this.characters && this.characters[empIndex];
        if (char) {
            char.state = 'typing';
            origin.copy(char.group.position);
            origin.y += 1.8;
            origin.z += (char.deskIndex === 0 ? -0.3 : 0.3);
        }
        const monitor = this.monitors && this.monitors[char?.deskIndex || 0];
        if (monitor) {
            origin.copy(monitor.lightPos);
        }

        let color = 0x00d2ff; // Tech cyan/blue
        if (type === 'design') color = 0xf59e0b; // Design amber/orange
        if (type === 'bug') color = 0xef4444; // Bug red

        const geo = new THREE.SphereGeometry(0.12, 12, 12);
        const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.88 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(origin);
        mesh.position.x += (Math.random() - 0.5) * 0.3;
        mesh.position.z += (Math.random() - 0.5) * 0.3;
        this.particlesGroup.add(mesh);

        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            1.5 + Math.random() * 0.8,
            (Math.random() - 0.5) * 0.5
        );

        this.activeParticles.push({
            mesh, velocity, life: 1.0, decay: 0.018,
            isBubble: true,
            rotSpeed: new THREE.Vector3(0, Math.random() * 2, 0)
        });
    }

    spawnParticle(arg1, arg2) {
        if (typeof this.spawnCodeParticle === 'function') {
            if (typeof arg1 === 'string') {
                this.spawnCodeParticle(arg1, arg2 || 0);
            } else {
                this.spawnCodeParticle(arg2 || 'tech', arg1 || 0);
            }
        }
    }

    spawnFloatingRP(empIndex = 0, amount = 3) {
        if (!this.particlesGroup || !this.floatingRPs) return;
        try {
            const origin = new THREE.Vector3(0, 2.8, 0);
            if (this.characters && this.characters[empIndex]) {
                origin.copy(this.characters[empIndex].group.position);
                origin.y += 2.9;
            }

            const canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 56;
            const ctx = canvas.getContext('2d');

            // Dark pill background with neon purple/gold border
            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(4, 4, 152, 48, 14);
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 22px "Segoe UI", sans-serif';
            ctx.fillStyle = '#facc15';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`+${amount} RP [[DE_ICON_028]]`, 80, 28);

            const texture = new THREE.CanvasTexture(canvas);
            const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
            const sprite = new THREE.Sprite(mat);
            sprite.position.copy(origin);
            sprite.position.x += (Math.random() - 0.5) * 0.4;
            sprite.scale.set(1.05, 0.38, 1);
            sprite.renderOrder = 30;
            this.particlesGroup.add(sprite);

            this.floatingRPs.push({
                sprite,
                mat,
                texture,
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.25, 1.2 + Math.random() * 0.4, (Math.random() - 0.5) * 0.25),
                life: 1.0,
                decay: 0.016
            });

            // Also emit small purple research particle cubes
            for (let p = 0; p < 3; p++) {
                if (typeof this.spawnCodeParticle === 'function') {
                    this.spawnCodeParticle('research', empIndex);
                }
            }
        } catch (e) {
            console.warn('[spawnFloatingRP] Failed to render floating RP:', e);
        }
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

        const menuShot = this.menuCamera.active;
        // Keep the last office frame while these menus are open. Redraw on demand
        // for appearance changes and resizes without advancing the visual effects.
        if (!menuShot && document.querySelector('.modal-backdrop.active > .compact-menu, #modal-expo-scene.active, .game-dialog[open]')) {
            if (this.needsStaticFrame) {
                this.renderer.shadowMap.needsUpdate = true;
                this.renderFrame();
                this.needsStaticFrame = false;
            }
            return;
        }
        this.needsStaticFrame = false;

        if (menuShot) this.menuCamera.update(delta, time, this.desks[0]?.worldPos);
        else this.controls.update();
        this.particlesGroup.visible = !menuShot;
        this.confettiGroup.visible = !menuShot;

        // Upload the CRT canvas only when its scrolling content changes.
        for (const monitor of this.dynamicTextures) {
            const retro = monitor.type === 'retro';
            const cursor = Math.floor(time * 2) % 2;
            const scroll = retro ? Math.floor(time * 2.5) % CRT_CODE.length : Math.floor(time * 20) % 20;
            if (monitor.lastScroll === scroll && (!retro || monitor.lastCursor === cursor)) continue;
            monitor.lastScroll = scroll;
            monitor.lastCursor = cursor;
            const { ctx, lines, texture } = monitor;
            ctx.fillStyle = '#051b11';
            ctx.fillRect(0, 0, 256, 192);
            if (retro) {
                ctx.font = 'bold 12px monospace';
                for (let row = 0; row < 10; row++) {
                    ctx.fillStyle = row === 9 ? '#bbffaf' : '#5ad68b';
                    ctx.fillText(CRT_CODE[(row + scroll) % CRT_CODE.length], 16, 18 + row * 16);
                }
                if (cursor) ctx.fillRect(16, 172, 9, 9);
                ctx.fillStyle = '#071a123d';
                for (let y = 1; y < 192; y += 3) ctx.fillRect(0, y, 256, 1);
            } else {
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    ctx.fillStyle = line.color;
                    ctx.fillRect(16 + line.indent, 14 + ((i + scroll) % 20) * 8.5, line.w, 4);
                }
            }
            texture.needsUpdate = true;
        }
        this.monitors.forEach(({ pointLight, lamp, lampIntensity }, index) => {
            if (pointLight) pointLight.intensity = 0.8 + Math.sin(time * 18 + index) * 0.12;
            if (lamp) lamp.intensity = lampIntensity * (menuShot ? 1.55 + Math.sin(time * 5 + index) * 0.035 : 1);
        });

        // Spawn and update Coffee Steam Particles
        if (this.coffeeMugPos && Math.random() < 0.25) {
            const steamMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.35,
                depthWrite: false
            });
            const steamMesh = new THREE.Mesh(this.steamGeometry, steamMat);
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
                st.mesh.material.dispose();
                this.steamParticles.splice(s, 1);
            }
        }

        for (const character of this.characters) {
            if (!character.group.visible) continue;
            if (menuShot) {
                character.state = 'typing';
                character.bulbGroup.visible = false;
                character.statusBubble.visible = false;
                character.statusBubbleProgress = -1;
                character.engineProgressSprite.visible = false;
                animateEmployee(character, time, character.deskIndex === 0 ? -0.51 : 0);
                character.face.update(time, character.state);
                continue;
            }
            if (time >= character.stateUntil) character.state = 'typing';
            character.bulbGroup.visible = character.state === 'thinking';
            const projectProgress = game?.currentProject
                ? Math.max(0, Math.min(100, Number(game.currentProject.overallProgress) || 0))
                : null;
            if (projectProgress !== character.statusBubbleProgress) {
                character.statusBubbleProgress = projectProgress;
                const ctx = character.statusBubbleContext;
                ctx.clearRect(0, 0, 128, 28);
                if (projectProgress !== null) {
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.58)';
                    ctx.beginPath();
                    ctx.roundRect(2, 5, 124, 18, 9);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.25)';
                    ctx.beginPath();
                    ctx.roundRect(8, 11, 112, 6, 3);
                    ctx.fill();
                    if (projectProgress > 0) {
                        ctx.fillStyle = '#78d6bd';
                        ctx.beginPath();
                        ctx.roundRect(8, 11, Math.max(3, 112 * projectProgress / 100), 6, 3);
                        ctx.fill();
                    }
                }
                character.statusBubbleTexture.needsUpdate = true;
                character.statusBubble.visible = projectProgress !== null;
            }

            // Floating 3D Engine R&D Progress Bar (Apartado 1)
            const isEngineLead = game?.activeEngineRD && (game.activeEngineRD.leadProgrammerIndex === character.index || (character.index === 0 && game.activeEngineRD.leadProgrammerIndex === undefined));
            if (isEngineLead && character.engineProgressSprite) {
                const prog = game.activeEngineRD.progress || 0;
                if (prog !== character.engineProgressVal) {
                    character.engineProgressVal = prog;
                    const ctx = character.engineProgressContext;
                    ctx.clearRect(0, 0, 256, 72);

                    // Background card
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
                    ctx.strokeStyle = '#38bdf8';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.roundRect(6, 4, 244, 62, 12);
                    ctx.fill();
                    ctx.stroke();

                    // Text: [[DE_ICON_049]] Motor: Name (X%)
                    ctx.font = 'bold 15px "Segoe UI", sans-serif';
                    ctx.fillStyle = '#38bdf8';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'top';
                    const engineShort = (game.activeEngineRD.name || 'Proprietary Core').substring(0, 16);
                    ctx.fillText(`[[DE_ICON_049]] ${engineShort}`, 14, 10);

                    ctx.font = 'bold 15px "Segoe UI", sans-serif';
                    ctx.fillStyle = '#c084fc';
                    ctx.textAlign = 'right';
                    ctx.fillText(`${prog}%`, 240, 10);

                    // Mini Progress Track
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.beginPath();
                    ctx.roundRect(14, 38, 228, 16, 8);
                    ctx.fill();

                    // Progress Fill (Gradient Cyan -> Violet)
                    if (prog > 0) {
                        const fillWidth = Math.max(10, Math.floor((228 * prog) / 100));
                        const grad = ctx.createLinearGradient(14, 0, 242, 0);
                        grad.addColorStop(0, '#00d2ff');
                        grad.addColorStop(1, '#a855f7');
                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.roundRect(14, 38, fillWidth, 16, 8);
                        ctx.fill();
                    }

                    character.engineProgressTexture.needsUpdate = true;
                }
                character.engineProgressSprite.visible = true;
            } else if (character.engineProgressSprite && character.engineProgressSprite.visible) {
                character.engineProgressSprite.visible = false;
                character.engineProgressVal = -1;
            }

            animateEmployee(character, time);
            character.face.update(time, character.state);
        }

        // Animate Development Particles
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const p = this.activeParticles[i];
            p.mesh.position.addScaledVector(p.velocity, delta);
            if (p.isBubble) {
                p.velocity.y += 0.25 * delta;
                p.mesh.position.x += Math.sin((p.life * 8) + i) * 0.008;
                p.mesh.scale.setScalar(Math.max(0.05, Math.min(1.3, 1.25 - p.life * 0.35)));
            } else {
                p.mesh.rotation.x += p.rotSpeed.x * delta;
                p.mesh.rotation.y += p.rotSpeed.y * delta;
                p.velocity.y -= 2.2 * delta;
                p.mesh.scale.setScalar(Math.max(0.01, p.life));
            }

            p.life -= p.decay;
            if (p.life <= 0) {
                this.particlesGroup.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.activeParticles.splice(i, 1);
            }
        }

        // Animate Floating RP Numbers & Orbs
        for (let r = this.floatingRPs.length - 1; r >= 0; r--) {
            const frp = this.floatingRPs[r];
            frp.sprite.position.addScaledVector(frp.velocity, delta);
            frp.life -= frp.decay;
            frp.mat.opacity = Math.max(0, frp.life);
            frp.sprite.scale.multiplyScalar(1 + 0.12 * delta);
            if (frp.life <= 0) {
                this.particlesGroup.remove(frp.sprite);
                frp.texture.dispose();
                frp.mat.dispose();
                this.floatingRPs.splice(r, 1);
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
        if (!menuShot && this.targetCamPos) {
            this.camera.position.lerp(this.targetCamPos, Math.min(1.0, delta * 4.5));
            if (this.camera.position.distanceTo(this.targetCamPos) < 0.05) {
                this.targetCamPos = null;
                this.isTransitioningCamera = false;
            }
        }
        if (!menuShot && this.targetLookAt && this.controls) {
            this.controls.target.lerp(this.targetLookAt, Math.min(1.0, delta * 4.5));
            if (this.controls.target.distanceTo(this.targetLookAt) < 0.05) {
                this.targetLookAt = null;
            }
        }

        if (time >= this.nextShadowRefresh) {
            this.renderer.shadowMap.needsUpdate = true;
            this.nextShadowRefresh = time + SHADOW_REFRESH_INTERVAL;
        }

        this.renderFrame();
    }

    renderFrame() {
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
        this.camera.aspect = width / Math.max(1, height);
        this.camera.updateProjectionMatrix();
        this.resizeRenderer(width, height);
        this.needsStaticFrame = true;
    }

    resizeRenderer(width, height) {
        const { ratio, pixelBudget } = {
            low: { ratio: 0.65, pixelBudget: 750_000 },
            medium: { ratio: 1, pixelBudget: MAX_RENDER_PIXELS },
            high: { ratio: 1.5, pixelBudget: 2_750_000 },
        }[this.resolution] || { ratio: 1, pixelBudget: MAX_RENDER_PIXELS };
        const pixelRatio = Math.min(ratio, window.devicePixelRatio, Math.sqrt(pixelBudget / Math.max(1, width * height)));
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
            render_raster: '[[DE_ICON_054]]', render_raytracing: '[[DE_ICON_068]]', render_pixel: '[[DE_ICON_083]]', render_core: '[[DE_ICON_053]]',
            physics_basic: '[[DE_ICON_070]]', physics_ragdoll: '[[DE_ICON_084]]', physics_destructible: '[[DE_ICON_081]]', physics_core: '[[DE_ICON_055]]',
            net_singleplayer: '[[DE_ICON_039]]', net_p2p: '[[DE_ICON_085]]', net_dedicated: '[[DE_ICON_020]]', netcode_core: '[[DE_ICON_020]]',
            ai_scripts: '[[DE_ICON_077]]', ai_behavior: '[[DE_ICON_056]]', ai_neural: '[[DE_ICON_082]]', ai_core: '[[DE_ICON_056]]',
            audio_stereo: '[[DE_ICON_045]]', audio_spatial: '[[DE_ICON_008]]', audio_core: '[[DE_ICON_008]]',
            content_linear: '[[DE_ICON_086]]', content_procedural: '[[DE_ICON_038]]', content_openworld: '[[DE_ICON_057]]', open_world: '[[DE_ICON_057]]',
            combat_system: '[[DE_ICON_076]]', multiplayer_lobby: '[[DE_ICON_031]]', procedural_gen: '[[DE_ICON_038]]', quest_engine: '[[DE_ICON_077]]',
            soundtrack_adaptive: '[[DE_ICON_078]]', sys_daynight: '[[DE_ICON_080]]', sys_weather: '[[DE_ICON_079]]', sys_rpg_tree: '[[DE_ICON_087]]',
            sys_photomode: '[[DE_ICON_088]]', sys_modding: '[[DE_ICON_015]]', weather_system: '[[DE_ICON_079]]', day_night_cycle: '[[DE_ICON_080]]',
            destruction_physics: '[[DE_ICON_081]]', neural_npcs: '[[DE_ICON_082]]', modding_sdk: '[[DE_ICON_015]]'
        };

        const group = new THREE.Group();
        const posArr = data.pos || defaultCoords[data.id] || [0, 2.5, 0];
        const basePos = new THREE.Vector3(posArr[0], posArr[1], posArr[2]);
        group.position.copy(basePos);

        const nodeCat = (data.category === 'base' || ['render', 'physics', 'netcode', 'ai', 'audio'].includes(data.category)) ? 'base' : (data.category === 'content' ? 'content' : 'systems');
        const nodeIcon = data.icon || defaultIcons[data.id] || '[[DE_ICON_089]]';
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
            statusBadge = '[[DE_ICON_090]] COMPLETADO';
            statusBg = 'rgba(16, 185, 129, 0.35)';
        } else if (data.state === 'active') {
            strokeColor = '#ffb703';
            statusBadge = '[[DE_ICON_022]] ACTIVO';
            statusBg = 'rgba(245, 158, 11, 0.35)';
        } else if (data.state === 'in_progress') {
            strokeColor = '#ff6b00';
            statusBadge = '[[DE_ICON_091]] EN PROGRESO';
            statusBg = 'rgba(255, 107, 0, 0.35)';
        } else if (data.state === 'regression') {
            strokeColor = '#ff1744';
            statusBadge = '[[DE_ICON_092]] REGRESIÓN / BUG';
            statusBg = 'rgba(239, 68, 68, 0.35)';
        } else if (data.state === 'locked') {
            strokeColor = '#475569';
            statusBadge = '[[DE_ICON_093]] BLOQUEADO';
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
        ctx.fillText(data.icon || '[[DE_ICON_089]]', 36, 128);

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
        const updatePointerHover = (e) => {
            if (this.menuCamera.active) return;
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

            // 1.5. Raycast Interactive Workstation Computers (Uwuntu XD Access)
            if (this.viewMode === 'office' && this.interactiveComputers.length > 0) {
                const compHits = raycaster.intersectObjects(this.interactiveComputers, false);
                if (compHits.length > 0) {
                    this.container.style.cursor = 'pointer';
                    this.setComputerHover(compHits[0].object, e.clientX, e.clientY);
                    if (this.hoveredCharacter) {
                        this.unhighlightCharacter(this.hoveredCharacter);
                        this.hoveredCharacter = null;
                    }
                    return;
                } else if (this.hoveredComputer) {
                    this.clearComputerHover();
                }
            }

            // 2. Raycast Characters & Workstations (Hover de personajes al estilo Game Dev Tycoon)
            const visibleCharacters = this.characters.filter(character => character.group.visible);
            const officeTargets = [...visibleCharacters.map(character => character.group), ...this.desks.map(d => d.group)];
            const officeHits = raycaster.intersectObjects(officeTargets, true);

            if (officeHits.length > 0) {
                const hitObj = officeHits[0].object;
                let targetChar = null;

                for (const char of visibleCharacters) {
                    if (char.group.getObjectById(hitObj.id)) {
                        targetChar = char;
                        break;
                    }
                }
                if (!targetChar) {
                    for (const desk of this.desks) {
                        if (desk.group.getObjectById(hitObj.id)) {
                            targetChar = desk.occupant;
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
        };
        let pendingPointer = null;
        let pointerFramePending = false;
        this.renderer.domElement.addEventListener('pointermove', event => {
            pendingPointer = { clientX: event.clientX, clientY: event.clientY };
            if (pointerFramePending) return;
            pointerFramePending = true;
            requestAnimationFrame(() => {
                pointerFramePending = false;
                updatePointerHover(pendingPointer);
            });
        });

        // Pointer Down to record drag origin
        this.renderer.domElement.addEventListener('pointerdown', (e) => {
            if (this.menuCamera.active) return;
            pointerDownPos.set(e.clientX, e.clientY);
            pointerDownTime = performance.now();
        });

        // Pointer Up to detect Click (Distinguish from OrbitControls pan/rotation)
        this.renderer.domElement.addEventListener('pointerup', (e) => {
            if (this.menuCamera.active) return;
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

            // 1.5. Raycast Click on Workstation Computers -> Open Uwuntu XD
            if (this.viewMode === 'office' && this.interactiveComputers.length > 0) {
                const compHits = raycaster.intersectObjects(this.interactiveComputers, false);
                if (compHits.length > 0) {
                    const hitObj = compHits[0].object;
                    const deskIndex = hitObj.userData.deskIndex ?? 0;
                    this.focusComputer(deskIndex);
                    if (window.uwuntuOS) {
                        window.uwuntuOS.open();
                    }
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
                    character = desk?.occupant;
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

    setComputerHover(hitObj, clientX, clientY) {
        this.hoveredComputer = hitObj;
        this.showComputerTooltip(clientX, clientY);
        const screenMesh = hitObj.userData.screenMesh || (hitObj.userData.isComputer ? hitObj : null);
        if (screenMesh && screenMesh.material && screenMesh.material.color) {
            if (!screenMesh.userData.origColor) {
                screenMesh.userData.origColor = screenMesh.material.color.clone();
            }
            screenMesh.material.color.setHex(0xa5f3fc);
        }
    }

    clearComputerHover() {
        if (this.hoveredComputer) {
            const screenMesh = this.hoveredComputer.userData.screenMesh || this.hoveredComputer;
            if (screenMesh && screenMesh.material && screenMesh.userData.origColor) {
                screenMesh.material.color.copy(screenMesh.userData.origColor);
            }
            this.hoveredComputer = null;
        }
        this.hideComputerTooltip();
    }

    showComputerTooltip(x, y) {
        let tooltip = document.getElementById('computer-hover-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'computer-hover-tooltip';
            tooltip.className = 'computer-hover-tooltip';
            tooltip.innerHTML = `
                <div class="tooltip-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                </div>
                <div class="tooltip-text">
                    <strong>Uwuntu XD</strong>
                    <span>Clic para acceder al SO [O]</span>
                </div>
            `;
            document.body.appendChild(tooltip);
        }
        tooltip.style.left = `${x + 16}px`;
        tooltip.style.top = `${y + 16}px`;
        tooltip.style.display = 'flex';
    }

    hideComputerTooltip() {
        const tooltip = document.getElementById('computer-hover-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    }

    focusComputer(deskIndex = 0) {
        if (!this.controls) return;
        const desk = this.desks.find(d => d.index === deskIndex) || this.desks[0];
        if (!desk) return;
        this.previousCameraPos = this.camera.position.clone();
        this.previousControlsTarget = this.controls.target.clone();
        const deskWorldPos = new THREE.Vector3();
        desk.group.getWorldPosition(deskWorldPos);
        
        // Smooth camera lerp towards the computer monitor
        this.targetCamPos = new THREE.Vector3(deskWorldPos.x, deskWorldPos.y + 1.85, deskWorldPos.z + 1.35);
        this.targetLookAt = new THREE.Vector3(deskWorldPos.x, deskWorldPos.y + 1.82, deskWorldPos.z - 0.25);
        this.isTransitioningCamera = true;
        this.controls.enabled = false;
        this.clearComputerHover();
    }

    returnFromComputer() {
        if (!this.controls) return;
        this.targetCamPos = this.previousCameraPos ? this.previousCameraPos.clone() : this.cameraOfficePos.clone();
        this.targetLookAt = this.previousControlsTarget ? this.previousControlsTarget.clone() : this.cameraOfficeTarget.clone();
        this.isTransitioningCamera = true;
        this.controls.enabled = true;
        this.clearComputerHover();
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
        } else {
            this.scopeDagGroup.visible = false;
            this.targetCamPos = this.cameraOfficePos.clone();
            this.targetLookAt = this.cameraOfficeTarget.clone();
        }
        applyOfficeLighting(this);
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

