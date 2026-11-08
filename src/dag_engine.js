import { TECH_TREE_NODES } from './data/techTreeData.js';

/**
 * DEV EMPIRE 3D - DAG Engine & Technical Debt Architecture
 * Complete mathematical and logical implementation for:
 * 1. Scope Node Tree (Directed Acyclic Graph) eliminating traditional sliders.
 * 2. Dynamic Technical Debt Model with differential equations of crunch, skill gap, coupling & regressions.
 * 3. Technological Pipeline Economy: Commercial Engines (royalties + bloatware) vs In-House Proprietary Engines (R&D, licensing, obsolescence).
 */

// =========================================================================
// 1. SCOPE NODE CATALOG (22 Specialized Nodes)
// =========================================================================

const DAG_CATALOG = [
    // --- 1.1 Renderizado (Base Rendering Architecture) ---
    {
        id: 'render_raster',
        name: 'Rasterizado Básico',
        category: 'render',
        group: 'render_arch',
        tier: 1,
        icon: '[[DE_ICON_054]]',
        desc: 'Canal de renderizado estándar por rasterización directa. Rápido, ligero y compatible con hardware modesto.',
        workload: { engine: 25, gameplay: 5, network: 0, net: 0, art: 20, qa: 10 },
        complexity: 20,
        baseFriction: 8,
        prerequisites: [],
        incompatibilities: [],
        bonusTech: 15,
        bonusDesign: 10,
        qualityScore: 0.15,
        genreAffinities: { Action: 1.0, RPG: 1.0, Strategy: 1.0, Simulation: 1.0, Adventure: 1.0, Casual: 1.2 },
        requiresEngineTier: 1,
        commercialUnlocked: true,
        minYear: 1982,
        eraName: 'Era 8-bit (1982-1989)',
        costRP: 0,
        unlockedByDefault: true
    },
    {
        id: 'render_raytracing',
        name: 'Ray Tracing RTX',
        category: 'render',
        group: 'render_arch',
        tier: 3,
        icon: '[[DE_ICON_068]]',
        desc: 'Trazado de rayos físico en tiempo real con reflejos fotorrealistas e iluminación global volumétrica.',
        workload: { engine: 90, gameplay: 10, network: 0, net: 0, art: 75, qa: 45 },
        complexity: 80,
        baseFriction: 34,
        prerequisites: ['render_raster'],
        incompatibilities: ['render_pixel'],
        bonusTech: 65,
        bonusDesign: 45,
        qualityScore: 0.55,
        genreAffinities: { Action: 1.35, RPG: 1.30, Strategy: 0.9, Simulation: 1.25, Adventure: 1.2, Casual: 0.6 },
        requiresEngineTier: 3,
        commercialUnlocked: true,
        minYear: 2018,
        eraName: 'Era Moderna (2015+)',
        costRP: 180,
        unlockedByDefault: false
    },
    {
        id: 'render_pixel',
        name: 'Pixel Art Optimizado',
        category: 'render',
        group: 'render_arch',
        tier: 1,
        icon: '[[DE_ICON_083]]',
        desc: 'Shader de escalado de píxeles nítidos con paletas indexadas y atlas de sprites optimizados.',
        workload: { engine: 15, gameplay: 10, network: 0, net: 0, art: 35, qa: 10 },
        complexity: 15,
        baseFriction: 5,
        prerequisites: [],
        incompatibilities: ['render_raytracing'],
        bonusTech: 10,
        bonusDesign: 25,
        qualityScore: 0.20,
        genreAffinities: { Action: 1.1, RPG: 1.2, Strategy: 1.05, Simulation: 0.8, Adventure: 1.25, Casual: 1.35 },
        requiresEngineTier: 1,
        commercialUnlocked: true,
        minYear: 1982,
        eraName: 'Era 8-bit (1982-1989)',
        costRP: 0,
        unlockedByDefault: true
    },

    // --- 1.2 Física (Physics Architecture) ---
    {
        id: 'physics_basic',
        name: 'Cinemática Simple',
        category: 'physics',
        group: 'physics_arch',
        tier: 1,
        icon: '[[DE_ICON_097]]',
        desc: 'Detección de colisiones mediante AABB y trigonometría básica sin cálculo inercial de cuerpos rígidos.',
        workload: { engine: 20, gameplay: 25, network: 0, net: 0, art: 5, qa: 10 },
        complexity: 18,
        baseFriction: 7,
        prerequisites: [],
        incompatibilities: [],
        bonusTech: 12,
        bonusDesign: 12,
        qualityScore: 0.12,
        genreAffinities: { Action: 0.9, RPG: 1.0, Strategy: 1.1, Simulation: 0.8, Adventure: 1.1, Casual: 1.25 },
        requiresEngineTier: 1,
        commercialUnlocked: true,
        minYear: 1982,
        eraName: 'Era 8-bit (1982-1989)',
        costRP: 0,
        unlockedByDefault: true
    },
    {
        id: 'physics_ragdoll',
        name: 'Cuerpos Rígidos & Ragdoll',
        category: 'physics',
        group: 'physics_arch',
        tier: 2,
        icon: '[[DE_ICON_084]]',
        desc: 'Solucionador de impulsos cinéticos y articulaciones dinámicas para personajes y colisiones creíbles.',
        workload: { engine: 45, gameplay: 40, network: 5, net: 5, art: 15, qa: 25 },
        complexity: 45,
        baseFriction: 18,
        prerequisites: ['physics_basic'],
        incompatibilities: [],
        bonusTech: 32,
        bonusDesign: 24,
        qualityScore: 0.35,
        genreAffinities: { Action: 1.35, RPG: 1.15, Strategy: 1.0, Simulation: 1.25, Adventure: 1.0, Casual: 0.85 },
        requiresEngineTier: 2,
        commercialUnlocked: true,
        minYear: 1995,
        eraName: 'Era 16/32-bit (1990-1999)',
        costRP: 60,
        unlockedByDefault: false
    },
    {
        id: 'physics_destructible',
        name: 'Física Destructible Volumétrica',
        category: 'physics',
        group: 'physics_arch',
        tier: 3,
        icon: '[[DE_ICON_081]]',
        desc: 'Fractura procedural de mallas y cálculo de tensión estructural en tiempo real con escombros persistentes.',
        workload: { engine: 85, gameplay: 50, network: 15, net: 15, art: 40, qa: 45 },
        complexity: 82,
        baseFriction: 36,
        prerequisites: ['physics_ragdoll'],
        incompatibilities: [],
        bonusTech: 60,
        bonusDesign: 35,
        qualityScore: 0.52,
        genreAffinities: { Action: 1.45, RPG: 1.05, Strategy: 1.2, Simulation: 1.35, Adventure: 0.95, Casual: 0.6 },
        requiresEngineTier: 3,
        commercialUnlocked: true,
        minYear: 2008,
        eraName: 'Era 2000+ (2000-2014)',
        costRP: 130,
        unlockedByDefault: false
    },

    // --- 1.3 Netcode (Network Architecture) ---
    {
        id: 'net_singleplayer',
        name: 'Monojugador Offline',
        category: 'netcode',
        group: 'netcode_arch',
        tier: 1,
        icon: '[[DE_ICON_039]]',
        desc: 'Bucle de ejecución local sin hilos de sincronización de red ni validación de paquetes remotos.',
        workload: { engine: 10, gameplay: 15, network: 0, net: 0, art: 0, qa: 10 },
        complexity: 10,
        baseFriction: 4,
        prerequisites: [],
        incompatibilities: [],
        bonusTech: 8,
        bonusDesign: 15,
        qualityScore: 0.10,
        genreAffinities: { Action: 0.95, RPG: 1.25, Strategy: 1.0, Simulation: 1.1, Adventure: 1.35, Casual: 1.15 },
        requiresEngineTier: 1,
        commercialUnlocked: true,
        minYear: 1982,
        eraName: 'Era 8-bit (1982-1989)',
        costRP: 0,
        unlockedByDefault: true
    },
    {
        id: 'net_p2p',
        name: 'P2P Sincrónico',
        category: 'netcode',
        group: 'netcode_arch',
        tier: 2,
        icon: '[[DE_ICON_031]]',
        desc: 'Topología peer-to-peer con predicción de entrada (rollback netcode) para cooperativo y partidas casuales.',
        workload: { engine: 40, gameplay: 25, network: 55, net: 55, art: 5, qa: 35 },
        complexity: 52,
        baseFriction: 22,
        prerequisites: ['net_singleplayer'],
        incompatibilities: [],
        bonusTech: 35,
        bonusDesign: 18,
        qualityScore: 0.32,
        genreAffinities: { Action: 1.15, RPG: 1.1, Strategy: 1.25, Simulation: 1.15, Adventure: 1.05, Casual: 1.2 },
        requiresEngineTier: 2,
        commercialUnlocked: true,
        minYear: 1994,
        eraName: 'Era 16/32-bit (1990-1999)',
        costRP: 50,
        unlockedByDefault: false
    },
    {
        id: 'net_dedicated',
        name: 'Servidores Autoritativos Dedicados',
        category: 'netcode',
        group: 'netcode_arch',
        tier: 3,
        icon: '[[DE_ICON_020]]',
        desc: 'Servidor headless con autoridad total, compensación de lag, tickrate de 128Hz y detección de trampas.',
        workload: { engine: 75, gameplay: 35, network: 95, net: 95, art: 5, qa: 60 },
        complexity: 86,
        baseFriction: 40,
        prerequisites: ['net_p2p'],
        incompatibilities: [],
        bonusTech: 68,
        bonusDesign: 25,
        qualityScore: 0.58,
        genreAffinities: { Action: 1.4, RPG: 1.25, Strategy: 1.35, Simulation: 1.2, Adventure: 0.8, Casual: 0.55 },
        requiresEngineTier: 3,
        commercialUnlocked: true,
        minYear: 2001,
        eraName: 'Era 2000+ (2000-2014)',
        costRP: 90,
        unlockedByDefault: false
    },

    // --- 1.4 Inteligencia Artificial (AI Architecture) ---
    {
        id: 'ai_scripts',
        name: 'Scripts Finitos FSM',
        category: 'ai',
        group: 'ai_arch',
        tier: 1,
        icon: '[[DE_ICON_077]]',
        desc: 'Máquinas de estados finitos deterministas. Respuestas directas y predecibles por evento.',
        workload: { engine: 15, gameplay: 25, network: 0, net: 0, art: 0, qa: 10 },
        complexity: 16,
        baseFriction: 6,
        prerequisites: [],
        incompatibilities: [],
        bonusTech: 12,
        bonusDesign: 15,
        qualityScore: 0.12,
        genreAffinities: { Action: 1.0, RPG: 1.0, Strategy: 0.85, Simulation: 0.9, Adventure: 1.1, Casual: 1.2 },
        requiresEngineTier: 1,
        commercialUnlocked: true,
        minYear: 1982,
        eraName: 'Era 8-bit (1982-1989)',
        costRP: 0,
        unlockedByDefault: true
    },
    {
        id: 'ai_behavior',
        name: 'Árboles de Comportamiento',
        category: 'ai',
        group: 'ai_arch',
        tier: 2,
        icon: '[[DE_ICON_056]]',
        desc: 'Behavior Trees jerárquicos con nodos selectores, secuencias, decoradores y memoria sensorial.',
        workload: { engine: 35, gameplay: 55, network: 5, net: 5, art: 0, qa: 25 },
        complexity: 44,
        baseFriction: 16,
        prerequisites: ['ai_scripts'],
        incompatibilities: [],
        bonusTech: 32,
        bonusDesign: 30,
        qualityScore: 0.35,
        genreAffinities: { Action: 1.25, RPG: 1.3, Strategy: 1.35, Simulation: 1.3, Adventure: 1.15, Casual: 0.8 },
        requiresEngineTier: 2,
        commercialUnlocked: true,
        minYear: 1997,
        eraName: 'Era 16/32-bit (1990-1999)',
        costRP: 65,
        unlockedByDefault: false
    },
    {
        id: 'ai_neural',
        name: 'NPCs con IA Generativa',
        category: 'ai',
        group: 'ai_arch',
        tier: 3,
        icon: '[[DE_ICON_082]]',
        desc: 'Modelos de lenguaje y redes neuronales inferidas en local para diálogos dinámicos y objetivos emergentes.',
        workload: { engine: 80, gameplay: 70, network: 25, net: 25, art: 10, qa: 50 },
        complexity: 88,
        baseFriction: 38,
        prerequisites: ['ai_behavior'],
        incompatibilities: [],
        bonusTech: 72,
        bonusDesign: 52,
        qualityScore: 0.62,
        genreAffinities: { Action: 1.1, RPG: 1.45, Strategy: 1.35, Simulation: 1.4, Adventure: 1.4, Casual: 0.6 },
        requiresEngineTier: 3,
        commercialUnlocked: true,
        minYear: 2022,
        eraName: 'Era Moderna (2015+)',
        costRP: 200,
        unlockedByDefault: false
    },

    // --- 1.5 Audio (Audio Architecture) ---
    {
        id: 'audio_stereo',
        name: 'Estéreo Directo',
        category: 'audio',
        group: 'audio_arch',
        tier: 1,
        icon: '[[DE_ICON_008]]',
        desc: 'Mezcla básica de pistas duales con atenuación lineal por distancia y balance izquierda/derecha.',
        workload: { engine: 10, gameplay: 10, network: 0, net: 0, art: 20, qa: 5 },
        complexity: 12,
        baseFriction: 5,
        prerequisites: [],
        incompatibilities: [],
        bonusTech: 10,
        bonusDesign: 15,
        qualityScore: 0.12,
        genreAffinities: { Action: 1.0, RPG: 1.0, Strategy: 1.0, Simulation: 1.0, Adventure: 1.0, Casual: 1.2 },
        requiresEngineTier: 1,
        commercialUnlocked: true,
        minYear: 1982,
        eraName: 'Era 8-bit (1982-1989)',
        costRP: 0,
        unlockedByDefault: true
    },
    {
        id: 'audio_spatial',
        name: 'Audio Espacial 3D Binaural',
        category: 'audio',
        group: 'audio_arch',
        tier: 2,
        icon: '[[DE_ICON_045]]',
        desc: 'Simulación de propagación acústica HRTF, oclusión física volumétrica y reverberación en tiempo real.',
        workload: { engine: 35, gameplay: 15, network: 5, net: 5, art: 45, qa: 20 },
        complexity: 40,
        baseFriction: 15,
        prerequisites: ['audio_stereo'],
        incompatibilities: [],
        bonusTech: 28,
        bonusDesign: 35,
        qualityScore: 0.35,
        genreAffinities: { Action: 1.3, RPG: 1.25, Strategy: 1.0, Simulation: 1.3, Adventure: 1.35, Casual: 0.8 },
        requiresEngineTier: 2,
        commercialUnlocked: true,
        minYear: 1996,
        eraName: 'Era 16/32-bit (1990-1999)',
        costRP: 55,
        unlockedByDefault: false
    },

    // --- 1.6 Contenido y Estructura de Mundo (Content & World Architecture) ---
    {
        id: 'content_linear',
        name: 'Niveles Lineales',
        category: 'content',
        group: 'content_arch',
        tier: 1,
        icon: '[[DE_ICON_086]]',
        desc: 'Secuencia estricta de salas o fases diseñadas artesanalmente con puntos de control determinados.',
        workload: { engine: 15, gameplay: 35, network: 0, net: 0, art: 30, qa: 15 },
        complexity: 18,
        baseFriction: 6,
        prerequisites: [],
        incompatibilities: [],
        bonusTech: 12,
        bonusDesign: 22,
        qualityScore: 0.15,
        genreAffinities: { Action: 1.2, RPG: 0.9, Strategy: 0.85, Simulation: 0.7, Adventure: 1.3, Casual: 1.25 },
        requiresEngineTier: 1,
        commercialUnlocked: true,
        minYear: 1982,
        eraName: 'Era 8-bit (1982-1989)',
        costRP: 0,
        unlockedByDefault: true
    },
    {
        id: 'content_procedural',
        name: 'Generación Procedural',
        category: 'content',
        group: 'content_arch',
        tier: 2,
        icon: '[[DE_ICON_038]]',
        desc: 'Algoritmos de ruido Perlin, autómatas celulares y gramáticas generativas para niveles infinitos.',
        workload: { engine: 50, gameplay: 55, network: 10, net: 10, art: 25, qa: 40 },
        complexity: 55,
        baseFriction: 22,
        prerequisites: ['content_linear'],
        incompatibilities: [],
        bonusTech: 42,
        bonusDesign: 32,
        qualityScore: 0.38,
        genreAffinities: { Action: 1.15, RPG: 1.25, Strategy: 1.4, Simulation: 1.35, Adventure: 1.0, Casual: 1.25 },
        requiresEngineTier: 2,
        commercialUnlocked: true,
        minYear: 1992,
        eraName: 'Era 16/32-bit (1990-1999)',
        costRP: 45,
        unlockedByDefault: false
    },
    {
        id: 'content_openworld',
        name: 'Mundo Abierto Continuo',
        category: 'content',
        group: 'content_arch',
        tier: 3,
        icon: '[[DE_ICON_057]]',
        desc: 'Streaming de niveles asíncrono en cuadrícula con jerarquía LOD dinámica y sin pantallas de carga.',
        workload: { engine: 95, gameplay: 75, network: 20, net: 20, art: 85, qa: 65 },
        complexity: 88,
        baseFriction: 42,
        prerequisites: ['content_linear'],
        incompatibilities: [],
        bonusTech: 75,
        bonusDesign: 60,
        qualityScore: 0.65,
        genreAffinities: { Action: 1.35, RPG: 1.5, Strategy: 1.1, Simulation: 1.3, Adventure: 1.4, Casual: 0.5 },
        requiresEngineTier: 3,
        commercialUnlocked: true,
        minYear: 2001,
        eraName: 'Era 2000+ (2000-2014)',
        costRP: 110,
        unlockedByDefault: false
    },

    // --- 1.7 Sistemas Adicionales y Gameplay (Systems & Gameplay Modules) ---
    {
        id: 'sys_daynight',
        name: 'Ciclo Día/Noche',
        category: 'systems',
        group: 'sys_daynight',
        tier: 2,
        icon: '[[DE_ICON_140]]',
        desc: 'Posicionamiento solar astronómico con sombras proyectadas en tiempo real y rutinas temporales de NPCs.',
        workload: { engine: 25, gameplay: 15, network: 5, net: 5, art: 35, qa: 15 },
        complexity: 30,
        baseFriction: 12,
        prerequisites: ['render_raster', 'content_linear'],
        incompatibilities: ['render_pixel'],
        bonusTech: 20,
        bonusDesign: 26,
        qualityScore: 0.25,
        genreAffinities: { Action: 1.15, RPG: 1.3, Strategy: 1.1, Simulation: 1.35, Adventure: 1.25, Casual: 0.9 },
        requiresEngineTier: 2,
        commercialUnlocked: true,
        minYear: 1996,
        eraName: 'Era 16/32-bit (1990-1999)',
        costRP: 50,
        unlockedByDefault: false
    },
    {
        id: 'sys_weather',
        name: 'Clima Dinámico Volumétrico',
        category: 'systems',
        group: 'sys_weather',
        tier: 2,
        icon: '[[DE_ICON_141]]',
        desc: 'Simulación de fluidos atmosféricos: lluvia con acumulación de charcos, niebla volumétrica y viento.',
        workload: { engine: 45, gameplay: 20, network: 10, net: 10, art: 50, qa: 25 },
        complexity: 50,
        baseFriction: 20,
        prerequisites: ['sys_daynight'],
        incompatibilities: ['render_pixel'],
        bonusTech: 35,
        bonusDesign: 32,
        qualityScore: 0.35,
        genreAffinities: { Action: 1.2, RPG: 1.35, Strategy: 1.2, Simulation: 1.4, Adventure: 1.3, Casual: 0.8 },
        requiresEngineTier: 2,
        commercialUnlocked: true,
        minYear: 2002,
        eraName: 'Era 2000+ (2000-2014)',
        costRP: 85,
        unlockedByDefault: false
    },
    {
        id: 'sys_rpg_tree',
        name: 'Árbol de Habilidades RPG',
        category: 'systems',
        group: 'sys_rpg_tree',
        tier: 2,
        icon: '[[DE_ICON_142]]',
        desc: 'Sistema nodal de estadísticas, sinergias de atributos, desbloqueo de talentos y progresión de personaje.',
        workload: { engine: 20, gameplay: 60, network: 5, net: 5, art: 25, qa: 25 },
        complexity: 35,
        baseFriction: 14,
        prerequisites: ['content_linear'],
        incompatibilities: [],
        bonusTech: 18,
        bonusDesign: 44,
        qualityScore: 0.32,
        genreAffinities: { Action: 1.2, RPG: 1.55, Strategy: 1.25, Simulation: 1.1, Adventure: 1.15, Casual: 0.75 },
        requiresEngineTier: 2,
        commercialUnlocked: true,
        minYear: 1990,
        eraName: 'Era 16/32-bit (1990-1999)',
        costRP: 35,
        unlockedByDefault: false
    },
    {
        id: 'sys_photomode',
        name: 'Modo Foto',
        category: 'systems',
        group: 'sys_photomode',
        tier: 2,
        icon: '[[DE_ICON_088]]',
        desc: 'Cámara libre cinemática con ajuste de apertura focal, bokeh, filtros cromáticos y poses para personajes.',
        workload: { engine: 30, gameplay: 15, network: 0, net: 0, art: 40, qa: 15 },
        complexity: 28,
        baseFriction: 10,
        prerequisites: ['render_raster'],
        incompatibilities: [],
        bonusTech: 20,
        bonusDesign: 30,
        qualityScore: 0.22,
        genreAffinities: { Action: 1.15, RPG: 1.25, Strategy: 0.9, Simulation: 1.2, Adventure: 1.3, Casual: 1.1 },
        requiresEngineTier: 2,
        commercialUnlocked: true,
        minYear: 2014,
        eraName: 'Era 2000+ (2000-2014)',
        costRP: 75,
        unlockedByDefault: false
    },
    {
        id: 'sys_modding',
        name: 'Herramientas de Modding / SDK Comunitario',
        category: 'systems',
        group: 'sys_modding',
        tier: 3,
        icon: '[[DE_ICON_106]]',
        desc: 'Entorno de ejecución aislado con enlaces Lua/WASM para creación comunitaria de mapas, scripts y mallas.',
        workload: { engine: 70, gameplay: 35, network: 25, net: 25, art: 10, qa: 50 },
        complexity: 72,
        baseFriction: 28,
        prerequisites: ['content_linear'],
        incompatibilities: [],
        bonusTech: 55,
        bonusDesign: 35,
        qualityScore: 0.45,
        genreAffinities: { Action: 1.15, RPG: 1.4, Strategy: 1.45, Simulation: 1.5, Adventure: 1.1, Casual: 1.2 },
        requiresEngineTier: 3,
        commercialUnlocked: false,
        minYear: 2000,
        eraName: 'Era 2000+ (2000-2014)',
        costRP: 80,
        unlockedByDefault: false
    }
];

// =========================================================================
// 1.8 REVERSE ENGINEERING HARDWARE CATALOG (Competitor Hardware Teardown)
// =========================================================================

const REVERSE_ENGINEERING_CATALOG = [
    {
        id: 'rev_rom_cartridge',
        name: 'Cartucho ROM & Bus de Datos Rival',
        era: 'Era 8-bit',
        minYear: 1982,
        costMoney: 12000,
        rpGain: 35,
        icon: '[[DE_ICON_048]]',
        desc: 'Desoldar memorias ROM y trazar los buses de direccionamiento multiplexado para entender la arquitectura de hardware rival.'
    },
    {
        id: 'rev_sound_synthesizer',
        name: 'Sintetizador FM YM2612 Competencia',
        era: 'Era 16-bit',
        minYear: 1986,
        costMoney: 25000,
        rpGain: 65,
        icon: '[[DE_ICON_143]]',
        desc: 'Analizar osciladores de modulación por frecuencia y canales estéreo para replicar calidad acústica de consola de 16 bits.'
    },
    {
        id: 'rev_arcade_coprocessor',
        name: 'Coprocesador Gráfico Blitter Rival',
        era: 'Era 16/32-bit',
        minYear: 1990,
        costMoney: 48000,
        rpGain: 110,
        icon: '[[DE_ICON_022]]',
        desc: 'Estudiar transferencias DMA directas y aceleración por hardware de sprites y scroll multicapa de salones recreativos.'
    },
    {
        id: 'rev_cdrom_controller',
        name: 'Controladora CD-ROM & Buffer DSP',
        era: 'Era 32-bit',
        minYear: 1994,
        costMoney: 95000,
        rpGain: 175,
        icon: '[[DE_ICON_144]]',
        desc: 'Desensamblar procesadores de señal digital (DSP) y búferes de lectura de alta velocidad para juegos en disco óptico.'
    },
    {
        id: 'rev_gpu_architecture',
        name: 'Aceleradora 3D Voodoo & Chip T&L',
        era: 'Era 2000+',
        minYear: 1999,
        costMoney: 180000,
        rpGain: 260,
        icon: '[[DE_ICON_001]]',
        desc: 'Ingeniería inversa de rasterizado 3D por hardware, memoria Z-Buffer dedicada y aceleración por hardware de geometría.'
    },
    {
        id: 'rev_cloud_blade_server',
        name: 'Servidor Blade Clúster Rival de Red',
        era: 'Era Moderna',
        minYear: 2012,
        costMoney: 350000,
        rpGain: 420,
        icon: '[[DE_ICON_054]]',
        desc: 'Desmontar racks de servidores autoritativos concurrentes con balanceo de carga en la nube de gigantes del sector.'
    }
];

// =========================================================================
// 1.9 TECH TREE MANAGER (Historical Progression & Prerequisites)
// =========================================================================

function validateTechTree(catalog) {
    const byId = new Map(), errors = [], colors = new Map();
    for (const node of catalog) {
        if (!node || !node.id || byId.has(node.id)) errors.push(`ID inválido o duplicado: ${node?.id}`);
        else byId.set(node.id, node);
    }
    const visit = id => {
        if (colors.get(id) === 1) { errors.push(`Ciclo de dependencias en ${id}`); return; }
        if (colors.get(id) === 2) return;
        colors.set(id, 1);
        for (const required of byId.get(id).requiredNodes || byId.get(id).prerequisites || []) {
            if (!byId.has(required)) errors.push(`${id} requiere un nodo inexistente: ${required}`);
            else visit(required);
        }
        colors.set(id, 2);
    };
    for (const id of byId.keys()) visit(id);
    return { valid: errors.length === 0, errors };
}

class TechTreeManager {
    constructor(catalog = DAG_CATALOG, unlockedIds = null) {
        const categories = { Graphics:'render', Physics:'physics', Network:'netcode', AI:'ai', Audio:'audio', Engine:'systems' };
        const historical = TECH_TREE_NODES.map(node => ({
            ...node, historicalCategory: node.category, category: categories[node.category] || node.category,
            prerequisites: node.requiredNodes, minYear: node.eraYear, costRP: node.researchCost,
            icon: '[[DE_ICON_006]]', tier: 1, eraName: 'Tecnología histórica', desc: `Riesgo base de deuda técnica: ${node.baseDebt}.`
        }));
        this.catalog = [...catalog, ...historical.filter(n => !catalog.some(existing => existing.id === n.id))];
        const validation = validateTechTree(this.catalog);
        if (!validation.valid) throw new Error(`Árbol tecnológico inválido: ${validation.errors.join('; ')}`);
        this.catalogMap = new Map();
        this.catalog.forEach(n => this.catalogMap.set(n.id, n));

        // Default foundation technologies unlocked in Era 8-bit (1982)
        const defaultUnlocked = [
            'render_raster',
            'render_pixel',
            'physics_basic',
            'net_singleplayer',
            'ai_scripts',
            'audio_stereo',
            'content_linear',
            ...historical.filter(n => n.researchCost === 0 && n.eraYear <= 1982 && n.requiredNodes.length === 0).map(n => n.id)
        ];

        this.unlockedTechs = new Set(Array.isArray(unlockedIds) && unlockedIds.length > 0 ? unlockedIds : defaultUnlocked);
        this.dismantledHardware = new Set();
    }

    isUnlocked(nodeId) {
        return this.unlockedTechs.has(nodeId);
    }

    unlockTech(nodeId, historicalYear = 1982) {
        const node = this.catalogMap.get(nodeId);
        if (node) {
            if (node.requiredNodes && !this.isUnlocked(nodeId) && !this.getNodeState(nodeId, historicalYear).canResearch) return false;
            this.unlockedTechs.add(nodeId);
            return true;
        }
        return false;
    }

    getNodeState(nodeId, historicalYear = 1982) {
        if (this.unlockedTechs.has(nodeId)) {
            return {
                state: 'DESBLOQUEADO',
                label: 'Desbloqueado',
                canResearch: false,
                reason: 'Tecnología ya investigada e integrada en la arquitectura del estudio.'
            };
        }

        const node = this.catalogMap.get(nodeId);
        if (!node) {
            return { state: 'BLOQUEADO', label: 'Desconocido', canResearch: false, reason: 'Nodo no encontrado en catálogo.' };
        }

        // Condition 1: Historical Minimum Year
        const minYear = node.minYear ?? 1982;
        if (historicalYear < minYear) {
            return {
                state: 'BLOQUEADO',
                label: 'Tecnología Desconocida',
                canResearch: false,
                isHistoricalLock: true,
                minYear: minYear,
                reason: `Aparición histórica estimada: Año ${minYear} (Año actual: ${historicalYear}).`
            };
        }

        // Condition 2: Tree Prerequisites
        const prereqs = node.requiredNodes || node.prerequisites || [];
        const missingPrereqs = prereqs.filter(pId => !this.unlockedTechs.has(pId));
        if (missingPrereqs.length > 0) {
            const missingNames = missingPrereqs.map(pId => {
                const p = this.catalogMap.get(pId);
                return p ? p.name : pId;
            });
            return {
                state: 'BLOQUEADO',
                label: 'Prerrequisitos Pendientes',
                canResearch: false,
                isPrereqLock: true,
                missingPrereqs: missingPrereqs,
                missingNames: missingNames,
                reason: `Requiere investigar previamente: ${missingNames.join(', ')}.`
            };
        }

        // Both conditions satisfied! Ready to be researched with RP
        return {
            state: 'INVESTIGABLE',
            label: 'Investigable',
            canResearch: true,
            costRP: node.costRP ?? 30,
            reason: `Lista para investigar por ${node.costRP ?? 30} RP.`
        };
    }

    validateSelection(ids, historicalYear = 1982) {
        const errors = [];
        for (const id of ids || []) {
            const node = this.catalogMap.get(id);
            if (!node) { errors.push(`Tecnología desconocida: ${id}.`); continue; }
            if (historicalYear < (node.minYear ?? 1982)) errors.push(`${node.name} aún no existe en ${historicalYear}.`);
            if (!this.isUnlocked(id)) errors.push(`${node.name} no está investigada.`);
            for (const req of node.requiredNodes || node.prerequisites || []) {
                if (!this.isUnlocked(req)) errors.push(`${node.name} requiere ${this.catalogMap.get(req)?.name || req}.`);
            }
        }
        return { valid: errors.length === 0, errors };
    }

    getUnlockedCount() {
        return this.unlockedTechs.size;
    }

    getTotalCount() {
        return this.catalog.length;
    }

    getUnlockedCatalog() {
        return this.catalog.filter(n => this.isUnlocked(n.id));
    }

    getNodesByBranch(category) {
        return this.catalog.filter(n => {
            if (category === 'net' || category === 'netcode') {
                return n.category === 'net' || n.category === 'netcode';
            }
            return n.category === category;
        });
    }
}

// =========================================================================
// 2. SCOPE NODE CLASS & GRAPH (DAG)
// =========================================================================

class ScopeNode {
    constructor(def) {
        this.id = def.id;
        this.name = def.name;
        this.category = def.category;
        this.group = def.group;
        this.tier = def.tier;
        this.desc = def.desc;
        this.workload = { ...def.workload };
        this.complexity = def.complexity;
        this.baseFriction = def.baseFriction;
        this.prerequisites = [...def.prerequisites];
        this.incompatibilities = [...def.incompatibilities];
        this.bonusTech = def.bonusTech || 0;
        this.bonusDesign = def.bonusDesign || 0;
        this.qualityScore = def.qualityScore || 0;
        this.genreAffinities = { ...def.genreAffinities };
        this.requiresEngineTier = def.requiresEngineTier || 1;
        this.commercialUnlocked = !!def.commercialUnlocked;

        // Runtime tracking during development
        this.progress = 0; // 0 to 100%
        this.disciplineProgress = {
            engine: 0,
            gameplay: 0,
            network: 0,
            art: 0,
            qa: 0
        };
        this.completed = false;
        this.isRegression = false;
        this.regressedCount = 0;
    }

    get status() {
        if (this.isRegression) return 'regression';
        if (this.completed) return 'completed';
        return this.progress > 0 ? 'in_progress' : 'active';
    }

    getTotalWorkload() {
        return (
            this.workload.engine +
            this.workload.gameplay +
            this.workload.network +
            this.workload.art +
            this.workload.qa
        );
    }

    getCurrentProgressTotal() {
        const totalRequired = this.getTotalWorkload();
        if (totalRequired === 0) return 100;
        const currentTotal =
            this.disciplineProgress.engine +
            this.disciplineProgress.gameplay +
            this.disciplineProgress.network +
            this.disciplineProgress.art +
            this.disciplineProgress.qa;
        return Math.min(100, Math.floor((currentTotal / totalRequired) * 100));
    }

    updateCompletionState() {
        this.progress = this.getCurrentProgressTotal();
        this.completed = this.progress >= 100;
        if (this.completed) this.isRegression = false;
        return this.completed;
    }

    applyRegression(lossRatio = 0.25) {
        if (this.progress <= 15) return 0;
        const previousProgress = this.progress;
        this.isRegression = true;
        // Roll back discipline progress
        for (let d in this.disciplineProgress) {
            this.disciplineProgress[d] = Math.max(0, this.disciplineProgress[d] * (1.0 - lossRatio));
        }
        this.completed = false;
        this.regressedCount++;
        this.updateCompletionState();
        return previousProgress - this.progress;
    }
}

class ScopeDAG {
    constructor(selectedNodeIds = null, options = {}) {
        this.nodes = new Map();
        this.edges = []; // Directed pairs: [{ from, to }]
        this.options = { ...options }; // e.g. enginePipeline, inHouseAffinities

        // Catalog lookup map
        this.catalogMap = new Map();
        DAG_CATALOG.forEach(nodeDef => {
            this.catalogMap.set(nodeDef.id, nodeDef);
        });

        // Populate initial nodes: if array provided with elements, use it; otherwise default to 6 baseline nodes
        const initialIds = (Array.isArray(selectedNodeIds) && selectedNodeIds.length > 0)
            ? selectedNodeIds
            : ['render_raster', 'physics_basic', 'net_singleplayer', 'ai_scripts', 'audio_stereo', 'content_linear'];

        initialIds.forEach(id => {
            this.addNode(id);
        });

        this.autoBuildDependencies();
    }

    addNode(nodeId) {
        if (this.nodes.has(nodeId)) return false;
        // Validate TechTreeManager unlocked status if present
        const mgr = this.options.techTreeManager;
        if (mgr && typeof mgr.isUnlocked === 'function') {
            if (!mgr.isUnlocked(nodeId)) {
                console.warn(`[ScopeDAG] Nodo no desbloqueado en I+D: ${nodeId}`);
                return false;
            }
        }
        const def = this.catalogMap.get(nodeId);
        if (!def) {
            console.warn(`[ScopeDAG] Nodo no encontrado en catálogo: ${nodeId}`);
            return false;
        }
        const nodeInstance = new ScopeNode(def);
        this.nodes.set(nodeId, nodeInstance);
        this.autoBuildDependencies();
        return true;
    }

    get selectedNodeIds() {
        return new Set(this.nodes.keys());
    }

    get nodeStates() {
        const states = new Map();
        this.nodes.forEach((val, key) => {
            states.set(key, { status: val.isRegression ? 'regression' : 'active' });
        });
        return states;
    }

    toggleNode(nodeId) {
        if (this.nodes.has(nodeId)) {
            // If removing, check if other active nodes depend on it
            const dependents = [];
            this.nodes.forEach(n => {
                if (n.prerequisites && n.prerequisites.includes(nodeId)) {
                    dependents.push(n.name);
                }
            });
            if (dependents.length > 0) {
                return { success: false, reason: `No se puede desactivar: [${dependents.join(', ')}] dependen de este nodo.` };
            }
            this.removeNode(nodeId);
            return { success: true, action: 'removed' };
        } else {
            const def = this.catalogMap.get(nodeId);
            if (!def) return { success: false, reason: 'Nodo no encontrado en catálogo.' };
            // Validate TechTreeManager unlocked status if present
            const mgr = this.options.techTreeManager;
            if (mgr && typeof mgr.isUnlocked === 'function') {
                if (!mgr.isUnlocked(nodeId)) {
                    return { success: false, reason: `[[DE_ICON_093]] Tecnología bloqueada: Debes investigarla en el Laboratorio de I+D antes de incorporarla al videojuego.` };
                }
            }
            // Check prerequisites
            const missing = (def.prerequisites || []).filter(p => !this.nodes.has(p));
            if (missing.length > 0) {
                const missingNames = missing.map(m => {
                    const mDef = this.catalogMap.get(m);
                    return mDef ? mDef.name : m;
                });
                return { success: false, reason: `Requiere activar previamente: ${missingNames.join(', ')}` };
            }
            this.addNode(nodeId);
            return { success: true, action: 'added' };
        }
    }

    removeNode(nodeId) {
        if (!this.nodes.has(nodeId)) return false;
        this.nodes.delete(nodeId);
        this.edges = this.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
        this.autoBuildDependencies();
        return true;
    }

    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }

    getActiveNodes() {
        return Array.from(this.nodes.values());
    }

    getActiveNodeIds() {
        return Array.from(this.nodes.keys());
    }

    hasNode(nodeId) {
        return this.nodes.has(nodeId);
    }

    getDirectedEdges() {
        return this.edges.map(e => ({ from: e.from, to: e.to }));
    }

    // Automatic construction of Directed Acyclic Graph edges based on prerequisite linkages
    autoBuildDependencies() {
        this.edges = [];
        const activeIds = new Set(this.nodes.keys());

        activeIds.forEach(targetId => {
            const node = this.nodes.get(targetId);
            node.prerequisites.forEach(prereqId => {
                // Direct prerequisite or architectural grouping fallback
                if (activeIds.has(prereqId)) {
                    this.edges.push({ from: prereqId, to: targetId });
                } else {
                    // Check if an equivalent node from the same group is present
                    const prereqDef = this.catalogMap.get(prereqId);
                    if (prereqDef && prereqDef.group) {
                        activeIds.forEach(altId => {
                            const altDef = this.catalogMap.get(altId);
                            if (altDef && altDef.group === prereqDef.group && altDef.id !== targetId) {
                                this.edges.push({ from: altId, to: targetId });
                            }
                        });
                    }
                }
            });
        });

        // Remove any duplicate edges
        const edgeKeys = new Set();
        this.edges = this.edges.filter(edge => {
            const k = `${edge.from}->${edge.to}`;
            if (edgeKeys.has(k)) return false;
            edgeKeys.add(k);
            return true;
        });
    }

    // Cycle Detection & Topological Sort (Kahn's Algorithm)
    validateGraph() {
        const inDegree = new Map();
        const adj = new Map();
        const activeIds = Array.from(this.nodes.keys());

        activeIds.forEach(id => {
            inDegree.set(id, 0);
            adj.set(id, []);
        });

        this.edges.forEach(e => {
            if (adj.has(e.from) && inDegree.has(e.to)) {
                adj.get(e.from).push(e.to);
                inDegree.set(e.to, inDegree.get(e.to) + 1);
            }
        });

        const queue = [];
        inDegree.forEach((deg, id) => {
            if (deg === 0) queue.push(id);
        });

        const topoOrder = [];
        while (queue.length > 0) {
            const u = queue.shift();
            topoOrder.push(u);
            (adj.get(u) || []).forEach(v => {
                inDegree.set(v, inDegree.get(v) - 1);
                if (inDegree.get(v) === 0) {
                    queue.push(v);
                }
            });
        }

        const isAcyclic = topoOrder.length === activeIds.length;
        const errors = [];
        const warnings = [];

        if (!isAcyclic) {
            errors.push("El grafo contiene dependencias cíclicas prohibidas (Violación DAG).");
        }

        // Check mutually exclusive groups
        const groupCounts = {};
        this.nodes.forEach(n => {
            if (n.group && n.category !== 'systems') {
                groupCounts[n.group] = (groupCounts[n.group] || 0) + 1;
                if (groupCounts[n.group] > 1) {
                    errors.push(`Conflicto de arquitectura: Múltiples nodos seleccionados en la categoría exclusiva "${n.group}".`);
                }
            }
        });

        // Check mandatory architecture coverage for a full release
        const requiredGroups = ['render_arch', 'physics_arch', 'netcode_arch', 'ai_arch', 'audio_arch', 'content_arch'];
        const missingGroups = requiredGroups.filter(g => !groupCounts[g] || groupCounts[g] === 0);
        if (missingGroups.length > 0) {
            warnings.push(`Arquitectura base incompleta: Faltan módulos en [${missingGroups.join(', ')}].`);
        }

        // Check missing prerequisites
        this.nodes.forEach(n => {
            n.prerequisites.forEach(prereqId => {
                const prereqDef = this.catalogMap.get(prereqId);
                let satisfied = this.nodes.has(prereqId);
                if (!satisfied && prereqDef && prereqDef.group) {
                    // Check if alternative from same group is selected
                    satisfied = Array.from(this.nodes.values()).some(activeNode => activeNode.group === prereqDef.group);
                }
                if (!satisfied) {
                    errors.push(`El nodo "${n.name}" requiere como prerrequisito "${prereqDef ? prereqDef.name : prereqId}".`);
                }
            });

            // Check incompatibilities
            n.incompatibilities.forEach(incId => {
                if (this.nodes.has(incId)) {
                    const incDef = this.catalogMap.get(incId);
                    errors.push(`Incompatibilidad técnica insalvable: "${n.name}" entra en conflicto con "${incDef ? incDef.name : incId}".`);
                }
            });
        });

        return {
            valid: isAcyclic && errors.length === 0,
            isAcyclic,
            errors,
            warnings,
            topoOrder,
            nodeCount: this.nodes.size,
            edgeCount: this.edges.length
        };
    }

    // Real-Time Total Workload in 5 Disciplines
    calculateWorkload(modifiers = {}) {
        const totals = {
            engine: 0,
            gameplay: 0,
            network: 0,
            art: 0,
            qa: 0
        };

        this.nodes.forEach(n => {
            totals.engine += n.workload.engine;
            totals.gameplay += n.workload.gameplay;
            totals.network += n.workload.network;
            totals.art += n.workload.art;
            totals.qa += n.workload.qa;
        });

        // Apply friction overhead to effective workload
        const friction = this.calculateTechnicalFriction(modifiers);
        const frictionMultiplier = 1.0 + (friction / 400); // Friction inflation factor

        const effectiveWorkload = {
            engine: Math.round(totals.engine * frictionMultiplier),
            gameplay: Math.round(totals.gameplay * frictionMultiplier),
            network: Math.round(totals.network * frictionMultiplier),
            art: Math.round(totals.art * frictionMultiplier),
            qa: Math.round(totals.qa * frictionMultiplier)
        };

        effectiveWorkload.totalSum =
            effectiveWorkload.engine +
            effectiveWorkload.gameplay +
            effectiveWorkload.network +
            effectiveWorkload.art +
            effectiveWorkload.qa;

        totals.net = totals.network;
        effectiveWorkload.net = effectiveWorkload.network;

        return {
            rawWorkload: totals,
            totals,
            effectiveWorkload,
            friction,
            frictionMultiplier: Math.round(frictionMultiplier * 100) / 100
        };
    }

    calculateFriction(multiplier = 1.0) {
        const rawFriction = this.calculateTechnicalFriction({ frictionMultiplier: multiplier });
        const coupling = Math.round(Math.pow(1 + 0.18 * this.nodes.size, 2) * 10) / 10;
        const percent = Math.min(100, Math.round(rawFriction / 10));
        const warningLevel = percent >= 55 ? 'critical' : (percent >= 25 ? 'moderate' : 'low');
        return {
            rawFriction,
            frictionPercent: percent,
            couplingFactor: coupling,
            warningLevel
        };
    }

    // Real-Time Technical Friction:
    // Formula: friction = baseFriction * Math.pow(1 + 0.18 * connectedCount, 2)
    calculateTechnicalFriction(modifiers = {}) {
        let baseFrictionSum = 0;
        this.nodes.forEach(n => {
            baseFrictionSum += n.baseFriction;
        });

        const connectedCount = this.nodes.size;
        if (connectedCount === 0) return 0;

        // Exponential coupling curve as dictated by project specifications
        let calculatedFriction = baseFrictionSum * Math.pow(1 + 0.18 * connectedCount, 2);

        // Modifiers: e.g. In-house engine with affine genre halves friction (factor: 0.5)
        if (modifiers.frictionMultiplier) {
            calculatedFriction *= modifiers.frictionMultiplier;
        }

        return Math.round(calculatedFriction * 10) / 10;
    }

    // Synergies & Genre Fits Calculation
    calculateSynergies(genreId = 'RPG') {
        const activeIds = new Set(this.nodes.keys());
        const synergies = [];
        let synergyScoreBonus = 0;
        let qualityMultiplier = 1.0;

        // 1. Raytracing + Photo Mode ("Fotorealismo Inmortal")
        if (activeIds.has('render_raytracing') && activeIds.has('sys_photomode')) {
            synergies.push({
                id: 'synergy_photo_rtx',
                name: 'Fotorealismo Inmortal',
                desc: 'El trazado de rayos con el Modo Foto desata el boca a boca y screenshots virales en redes.',
                scoreBonus: 0.35,
                artBonus: 30
            });
            synergyScoreBonus += 0.35;
        }

        // 2. Day/Night + Dynamic Weather ("Inmersión Atmosférica Dinámica")
        if (activeIds.has('sys_daynight') && activeIds.has('sys_weather')) {
            synergies.push({
                id: 'synergy_weather_cycle',
                name: 'Inmersión Atmosférica Dinámica',
                desc: 'El ciclo solar combinado con lluvia volumétrica y tormentas transforma el mundo en un ente vivo.',
                scoreBonus: 0.30,
                artBonus: 25
            });
            synergyScoreBonus += 0.30;
        }

        // 3. Open World + Day/Night + Weather ("Tríada de Mundo Vivo")
        if (activeIds.has('content_openworld') && activeIds.has('sys_daynight') && activeIds.has('sys_weather')) {
            synergies.push({
                id: 'synergy_openworld_living',
                name: 'Tríada de Mundo Vivo Continuo',
                desc: 'Exploración sin fisuras con ciclos climatológicos completos. Cautiva a los analistas de RPG y Aventura.',
                scoreBonus: 0.45,
                qualityMultiplier: 1.15
            });
            synergyScoreBonus += 0.45;
            qualityMultiplier *= 1.15;
        }

        // 4. Dedicated Server + Destructible Physics ("Caos Multijugador Sincrónico")
        if (activeIds.has('net_dedicated') && activeIds.has('physics_destructible')) {
            synergies.push({
                id: 'synergy_dedicated_destruction',
                name: 'Caos Multijugador Sincrónico',
                desc: 'Física destructiva compartida y autoritativa en red. Éxito rotundo en géneros de Acción y Shooters.',
                scoreBonus: 0.40,
                gameplayBonus: 35
            });
            synergyScoreBonus += 0.40;
        }

        // 5. RPG Skill Tree + Open World ("Odisea Progresiva")
        if (activeIds.has('sys_rpg_tree') && activeIds.has('content_openworld')) {
            synergies.push({
                id: 'synergy_rpg_openworld',
                name: 'Odisea Progresiva',
                desc: 'Progresión profunda en un mapa titánico. Retención récord de jugadores en RPG.',
                scoreBonus: 0.40,
                gameplayBonus: 40
            });
            synergyScoreBonus += 0.40;
        }

        // 6. Procedural Generation + Modding API ("Rejugabilidad Eterna")
        if (activeIds.has('content_procedural') && activeIds.has('sys_modding')) {
            synergies.push({
                id: 'synergy_procedural_modding',
                name: 'Rejugabilidad Eterna de Comunidad',
                desc: 'Mapas infinitos ampliables por mods. Ventas constantes durante años.',
                scoreBonus: 0.35,
                salesMultiplier: 1.30
            });
            synergyScoreBonus += 0.35;
        }

        // 7. Generative AI + RPG Tree ("NPCs con Conciencia")
        if (activeIds.has('ai_neural') && activeIds.has('sys_rpg_tree')) {
            synergies.push({
                id: 'synergy_neural_rpg',
                name: 'NPCs con Conciencia & Roles',
                desc: 'Los habitantes del mundo reaccionan a las habilidades y decisiones del jugador de manera orgánica.',
                scoreBonus: 0.45,
                innovationBonus: 50
            });
            synergyScoreBonus += 0.45;
        }

        // 8. Retro Pixel Art + Linear + Stereo ("Pureza Clásica 16-Bit")
        if (activeIds.has('render_pixel') && activeIds.has('content_linear') && activeIds.has('audio_stereo')) {
            synergies.push({
                id: 'synergy_retro_classic',
                name: 'Pureza Clásica 16-Bit',
                desc: 'Nostalgia perfeccionada: desarrollo hiper-rápido con costes mínimos de QA y devoción del público indie.',
                scoreBonus: 0.25,
                frictionDiscount: 0.20
            });
            synergyScoreBonus += 0.25;
        }

        // Genre Affinity Matching
        let genreFitSum = 0;
        let nodeCount = 0;
        this.nodes.forEach(n => {
            const fit = (n.genreAffinities && n.genreAffinities[genreId]) || 1.0;
            genreFitSum += fit;
            nodeCount++;
        });
        const averageGenreFit = nodeCount > 0 ? (genreFitSum / nodeCount) : 1.0;

        return {
            synergies,
            synergyScoreBonus,
            qualityMultiplier,
            averageGenreFit: Math.round(averageGenreFit * 100) / 100
        };
    }

    // Overall Project Completion Status
    getOverallProgress() {
        let totalPossibleWorkload = 0;
        let currentWorkload = 0;

        this.nodes.forEach(n => {
            const req = n.getTotalWorkload();
            totalPossibleWorkload += req;
            currentWorkload += (
                n.disciplineProgress.engine +
                n.disciplineProgress.gameplay +
                n.disciplineProgress.network +
                n.disciplineProgress.art +
                n.disciplineProgress.qa
            );
        });

        if (totalPossibleWorkload === 0) return 100;
        return Math.min(100, Math.floor((currentWorkload / totalPossibleWorkload) * 100));
    }

    isFullyCompleted() {
        if (this.nodes.size === 0) return false;
        let allDone = true;
        this.nodes.forEach(n => {
            if (!n.completed) allDone = false;
        });
        return allDone;
    }
}

// =========================================================================
// 3. SUBSISTEMA DE DEUDA TÉCNICA Y MANTENIBILIDAD (TechnicalDebtManager)
// =========================================================================

class TechnicalDebtManager {
    constructor(config = {}) {
        // 1. Core Data Structure Properties (Punto 1)
        this.rawDebt = config.initialDebt !== undefined ? config.initialDebt : (config.rawDebt || 0); // Valor numérico acumulado
        this.baseBloatwareDebt = config.baseBloatwareDebt || 0; // Deuda mínima no eliminable del motor
        this.hiddenDebt = config.hiddenDebt || 0; // Deuda oculta que no se detecta sin testers de QA
        this.accumulatedFriction = 1.0; // Multiplicador que encarece el coste de los siguientes días
        this.regressionRisk = 0.0; // Probabilidad (0.0 a 1.0) de romper nodos conectados

        // Modos operativos
        this.crunchActive = false;
        this.refactorModeActive = false;
        this.emergencyPatchActive = false;

        // Historial y auditoría de eventos
        this.totalDebtGenerated = this.rawDebt;
        this.totalDebtPaid = 0;
        this.regressionHistory = [];
        this.lastRegressionTick = 0;
        this.totalRegressions = 0;

        this.updateDerivedMetrics(6);
    }

    // Compatibilidad hacia atrás
    get accumulatedDebt() {
        return this.rawDebt;
    }
    set accumulatedDebt(val) {
        this.rawDebt = val;
    }

    get visibleDebt() {
        return Math.max(0, Math.round((this.rawDebt - this.hiddenDebt) * 10) / 10);
    }

    get healthStatus() {
        if (this.rawDebt <= 20) return 'clean';
        if (this.rawDebt <= 45) return 'moderate';
        return 'critical';
    }

    setCrunchMode(enabled) {
        this.crunchActive = !!enabled;
        if (this.crunchActive) {
            this.refactorModeActive = false;
        }
    }

    setRefactorMode(enabled) {
        this.refactorModeActive = !!enabled;
        if (this.refactorModeActive) {
            this.crunchActive = false;
        }
    }

    setBaseDebt(floor) {
        this.baseBloatwareDebt = floor || 0;
        this.rawDebt = Math.max(this.baseBloatwareDebt, this.rawDebt || 0);
        this.updateDerivedMetrics();
    }

    /**
     * Punto 3.1 & 1: Actualiza la fricción acumulada y el riesgo de regresiones
     * ProgresoEfectivo = ProgresoTeórico / (1 + (rawDebt / 100) * 0.5)
     */
    updateDerivedMetrics(connectedCount = 6) {
        // Multiplicador de fricción que ralentiza el avance de características
        this.accumulatedFriction = Math.max(1.0, 1.0 + (this.rawDebt / 100.0) * 0.5);

        // Riesgo de regresión (0.0 a 1.0)
        if (this.rawDebt <= 12) {
            this.regressionRisk = 0.0;
        } else {
            const couplingScale = Math.pow(1.0 + 0.04 * Math.max(1, connectedCount), 1.30);
            const baseProb = (this.rawDebt - 10.0) / 140.0;
            this.regressionRisk = Math.min(0.85, Math.max(0.02, baseProb * couplingScale * 0.25));
        }
    }

    /**
     * Punto 2: Generación de Deuda por Tick (Fórmulas de Inyección)
     */
    simulateTick(params = {}) {
        const {
            staff = [],
            activeNodes = [],
            dagComplexity = 20,
            connectedCount = activeNodes.length || 6,
            isLateStage = false,
            engineModifier = 1.0, // Motor propio: reduce tasa (0.55-0.65x); Comercial: tasa estándar (0.85-1.0x)
            qaPower = 0,          // Capacidad de detección de QA
            extraHours = 0        // Horas extra si crunch activo
        } = params;

        let gapDebt = 0;
        let crunchDebt = 0;
        let couplingDebt = 0;
        let refactorDebtPaid = 0;
        let hiddenDebtDiscovered = 0;

        const staffCount = Math.max(1, staff.length);
        const avgStaffTech = staff.reduce((acc, e) => acc + (e.tech || 25), 0) / staffCount;
        const avgStaffStamina = staff.reduce((acc, e) => acc + (e.stamina || 100), 0) / staffCount;
        const avgFatigue = Math.max(0, (100 - avgStaffStamina) / 100);

        if (!this.refactorModeActive) {
            // 1. Desajuste de Habilidad (Skill Gap):
            // Si la habilidad media del programador asignado es inferior al nivel del nodo:
            // gapDebt = (NivelNodo - HabilidadDev) * FactorComplejidad
            const uncompletedNodes = activeNodes.filter(n => !n.completed);
            if (uncompletedNodes.length > 0) {
                const targetNode = uncompletedNodes[0];
                const nodeTierLevel = (targetNode.tier || 1) * 18; // Tier 1=18, Tier 2=36, Tier 3=54
                const complexityFactor = Math.max(0.6, (targetNode.complexity || 25) / 28.0);
                if (nodeTierLevel > avgStaffTech) {
                    const skillGap = nodeTierLevel - avgStaffTech;
                    gapDebt = (skillGap / 10.0) * complexityFactor * 0.22;
                }
            }

            // 2. Presión y Fatiga (Crunch Penalty):
            // Si se activa el modo "Crunch" o el cansancio del empleado supera el 70% (stamina < 30):
            // crunchDebt = HorasExtra * MultiplicadorFatiga
            const isCrunch = this.crunchActive;
            const isHighFatigue = avgStaffStamina < 30; // cansancio supera 70%
            if (isCrunch || isHighFatigue) {
                const hours = isCrunch ? (extraHours > 0 ? extraHours : 2.0) : 1.2;
                const fatigueMultiplier = 1.0 + (avgFatigue * 2.2);
                crunchDebt = (hours * fatigueMultiplier) * (staffCount * 0.28);
            }

            // 3. Fricción por Grafos y Dependencias:
            // Cuantos más nodos estén interconectados sin capas intermedias de abstracción:
            // couplingDebt = NodosConectados * 0.15
            if (connectedCount > 3) {
                couplingDebt = (connectedCount - 3) * 0.15 * 0.30;
            }
        } else {
            // Punto 4: Acción Activa "Refactorizar / Limpiar Código"
            // Todo el esfuerzo diario se destina a reducir rawDebt:
            // DeudaReducida = Suma(HabilidadProgramadores) * 1.5
            const programmersTechSum = staff.reduce((acc, e) => acc + (e.tech || 22), 0);
            refactorDebtPaid = (programmersTechSum * 1.5) * 0.055; // Ajustado por tick diario

            // Curar nodos en regresión durante la refactorización
            activeNodes.forEach(n => {
                if (n.isRegression) {
                    n.isRegression = false;
                }
            });
        }

        // Deuda total del tick: rawDebt += (gapDebt + crunchDebt + couplingDebt) * ModificadorMotor
        const generatedTickDebt = (gapDebt + crunchDebt + couplingDebt) * engineModifier;
        const deltaDebt = generatedTickDebt - refactorDebtPaid;

        // Distribución de Deuda Oculta (Hidden Debt):
        // Si no hay suficientes testers de QA, una fracción importante no es detectada
        if (generatedTickDebt > 0) {
            const hasDedicatedQA = staff.some(e => (e.role && e.role.toLowerCase().includes('qa')) || e.trait === 'Bug Hunter') || qaPower > 25;
            const hiddenFraction = hasDedicatedQA ? 0.05 : Math.max(0.15, 0.65 - (qaPower / 40.0));
            this.hiddenDebt += generatedTickDebt * hiddenFraction;
        }

        // Descubrimiento de deuda oculta por el equipo de QA
        if (this.hiddenDebt > 0 && (qaPower > 0 || staff.length > 0)) {
            const qaDiscoveryRate = (qaPower * 0.05) + (staffCount * 0.15);
            hiddenDebtDiscovered = Math.min(this.hiddenDebt, qaDiscoveryRate);
            this.hiddenDebt = Math.max(0, this.hiddenDebt - hiddenDebtDiscovered);
        }

        // Aplicar a rawDebt respetando piso base de bloatware
        this.rawDebt = Math.max(this.baseBloatwareDebt, this.rawDebt + deltaDebt);
        if (this.hiddenDebt > this.rawDebt) this.hiddenDebt = this.rawDebt;

        if (deltaDebt > 0) {
            this.totalDebtGenerated += deltaDebt;
        } else if (deltaDebt < 0) {
            this.totalDebtPaid += Math.abs(deltaDebt);
        }

        this.updateDerivedMetrics(connectedCount);

        // Punto 3.1: ProgresoEfectivo = ProgresoTeórico / (1 + (rawDebt / 100) * 0.5)
        const speedMultiplier = 1.0 / this.accumulatedFriction;

        // Punto 3.2: Tirada de regresión de código
        let regressionEvent = null;
        if (!this.refactorModeActive && activeNodes.length > 0) {
            regressionEvent = this.checkRegressionRoll(activeNodes);
        }

        return {
            rawDebt: Math.round(this.rawDebt * 10) / 10,
            currentDebt: Math.round(this.rawDebt * 10) / 10,
            visibleDebt: this.visibleDebt,
            hiddenDebt: Math.round(this.hiddenDebt * 10) / 10,
            accumulatedFriction: Math.round(this.accumulatedFriction * 100) / 100,
            regressionRisk: Math.round(this.regressionRisk * 1000) / 1000,
            speedMultiplier: Math.round(speedMultiplier * 100) / 100,
            speedPenalty: Math.round((1.0 - speedMultiplier) * 100) / 100,
            deltaDebt: Math.round(deltaDebt * 100) / 100,
            gapDebt: Math.round(gapDebt * 100) / 100,
            crunchDebt: Math.round(crunchDebt * 100) / 100,
            couplingDebt: Math.round(couplingDebt * 100) / 100,
            refactorDebtPaid: Math.round(refactorDebtPaid * 100) / 100,
            hiddenDebtDiscovered: Math.round(hiddenDebtDiscovered * 100) / 100,
            baseBloatwareDebt: this.baseBloatwareDebt,
            regression: regressionEvent
        };
    }

    tick(params) {
        return this.simulateTick(params);
    }

    /**
     * Punto 3.2: Eventos de Regresión (Código Roto)
     */
    checkRegressionRoll(nodes = []) {
        if (this.rawDebt <= 12 || nodes.length === 0 || this.refactorModeActive) {
            return null;
        }

        // Tirada diaria de probabilidad gobernada por regressionRisk
        const tickProb = Math.min(0.20, this.regressionRisk * 0.12);
        if (Math.random() < tickProb) {
            const candidates = nodes.filter(n => n.progress > 20);
            if (candidates.length === 0) return null;

            const targetNode = candidates[Math.floor(Math.random() * candidates.length)];
            // Pierde un 15-25% de su progreso terminado
            const lossRatio = 0.15 + (Math.random() * 0.10);
            const progressLost = targetNode.applyRegression(lossRatio);
            targetNode.isRegression = true;

            const regressionEvent = {
                nodeId: targetNode.id,
                nodeName: targetNode.name,
                progressLost: Math.round(progressLost),
                remainingProgress: targetNode.progress,
                lossPercentage: Math.round(lossRatio * 100),
                newBugs: 2 + Math.floor(this.rawDebt / 30),
                message: `[[DE_ICON_016]] Regresión de código: el módulo de "${targetNode.name}" se ha desestabilizado perdiendo un ${Math.round(lossRatio * 100)}% de avance.`
            };

            this.regressionHistory.unshift(regressionEvent);
            this.totalRegressions++;
            return regressionEvent;
        }
        return null;
    }

    /**
     * Punto 5: Impacto en el Lanzamiento y Post-Lanzamiento
     */
    calculateLaunchPenalties(netcodeNodeId = 'net_singleplayer', platformId = 'pc') {
        const penalties = {
            reviewScoreBonus: 0,
            reviewScorePenalty: 0,
            fpsDrops: false,
            serverCrashRisk: 0,
            desktopCrashes: false,
            refundRate: 0.0,
            requiresEmergencyPatch: false,
            criticalFlaws: [],
            launchStabilityStatus: 'smooth' // 'smooth', 'rough', 'critical'
        };

        const debt = this.rawDebt;

        // Umbral Bajo: rawDebt <= 20 -> Lanzamiento fluido, críticas elogian fluidez (+Reviews)
        if (debt <= 20) {
            penalties.launchStabilityStatus = 'smooth';
            penalties.reviewScoreBonus = 0.6;
        }
        // Umbral Medio: 20 < rawDebt <= 45 -> Caídas de FPS, bugs menores, penalización moderada
        else if (debt <= 45) {
            penalties.launchStabilityStatus = 'rough';
            penalties.fpsDrops = true;
            penalties.reviewScorePenalty = Math.min(1.4, Math.round(((debt - 20) / 25.0 * 1.2) * 10) / 10);
            penalties.criticalFlaws.push('Tirones de framerate, micro-stuttering y pequeñas asperezas en el rendimiento.');
        }
        // Umbral Crítico: rawDebt > 45 -> Cuelgues masivos, servidores colapsados, ola de críticas y devoluciones
        else {
            penalties.launchStabilityStatus = 'critical';
            penalties.desktopCrashes = true;
            penalties.reviewScorePenalty = Math.min(3.5, Math.round((1.5 + (debt - 45) / 20.0 * 1.5) * 10) / 10);
            penalties.refundRate = Math.min(0.40, 0.25 + (debt - 45) * 0.003); // 25% a 40% devoluciones

            const isOnline = netcodeNodeId === 'net_dedicated' || netcodeNodeId === 'net_p2p';
            if (isOnline) {
                penalties.serverCrashRisk = Math.min(0.95, 0.50 + (debt - 45) * 0.015);
                penalties.criticalFlaws.push('Colapso total de servidores de autenticación y partidas multijugador el Día 1.');
            }

            penalties.criticalFlaws.push('Cuelgues masivos al escritorio (CTD), corrupción de partidas guardadas y optimización deficiente.');
            penalties.requiresEmergencyPatch = true;
            this.emergencyPatchActive = true;
        }

        return penalties;
    }

    /**
     * Post-lanzamiento: Realiza un ciclo de parche de emergencia para estabilizar el juego
     */
    performEmergencyPatchTick(staff = []) {
        const staffCount = Math.max(1, staff.length);
        const totalTech = staff.reduce((acc, e) => acc + (e.tech || 25), 0);
        const debtPaid = Math.max(2.5, (totalTech / 15.0));
        this.rawDebt = Math.max(this.baseBloatwareDebt, this.rawDebt - debtPaid);
        this.hiddenDebt = Math.max(0, this.hiddenDebt - debtPaid);
        this.updateDerivedMetrics();

        const isStabilized = this.rawDebt <= 20;
        if (isStabilized) {
            this.emergencyPatchActive = false;
        }
        return {
            remainingDebt: Math.round(this.rawDebt * 10) / 10,
            debtPaid: Math.round(debtPaid * 10) / 10,
            isStabilized
        };
    }
}

const TechnicalDebtModel = TechnicalDebtManager;

// =========================================================================
// 4. COMMERCIAL ENGINES VS IN-HOUSE PROPRIETARY PIPELINE
// =========================================================================

const CommercialEngineCatalog = [
    {
        id: 'commercial_unreal_pro',
        name: 'Unreal Engine Pro',
        vendor: 'Epic Commercial Systems',
        tier: 3,
        minYear: 1990,
        royaltyRate: 0.08, // 8% gross sales royalty
        baseDevTimeReduction: 0.25, // 25% faster base time
        bloatwareDebtFloor: 15, // Unremovable base tech debt
        licenseCost: 35000,
        unlockedNodes: [
            'render_raytracing',
            'physics_destructible',
            'net_dedicated',
            'sys_weather',
            'audio_spatial'
        ],
        desc: 'Motor comercial AAA de máxima gama. Desbloquea de inmediato nodos de élite y reduce el tiempo base un 25%, con 8% de royalties de por vida y 15 puntos de deuda técnica fija (bloatware).'
    },
    {
        id: 'commercial_unity_apex',
        name: 'Unity Apex',
        vendor: 'Unity Technologies',
        tier: 2,
        minYear: 1990,
        royaltyRate: 0.05, // 5% gross sales royalty
        baseDevTimeReduction: 0.20, // 20% faster base time
        bloatwareDebtFloor: 15, // Unremovable base tech debt
        licenseCost: 15000,
        unlockedNodes: [
            'physics_ragdoll',
            'net_p2p',
            'content_procedural',
            'audio_spatial',
            'sys_daynight'
        ],
        desc: 'Motor comercial ágil y multiplataforma. Desbloquea nodos de nivel 2 y agiliza el desarrollo un 20%, con 5% de royalties perpetuos y 15 puntos de bloatware inamovible.'
    },
    {
        id: 'commercial_godot_open',
        name: 'CyberForge Open (Godot Core)',
        vendor: 'Open Community Collective',
        tier: 1,
        minYear: 1990,
        royaltyRate: 0.05, // 5% gross sales royalty
        baseDevTimeReduction: 0.10, // 10% faster
        bloatwareDebtFloor: 15, // Commercial license floor
        licenseCost: 0,
        unlockedNodes: [
            'render_raster',
            'physics_basic',
            'net_singleplayer',
            'audio_stereo',
            'content_linear'
        ],
        desc: 'Motor de licencia comunitaria. Cobra 5% de royalties, reduce el tiempo base un 10% y mantiene 15 puntos de deuda técnica mínima.'
    }
];

class InHouseEngine {
    constructor(config = {}) {
        this.id = config.id || 'inhouse_' + Date.now();
        this.name = config.name || 'Proprietary Core v1';
        this.version = config.version || 1;
        this.tier = config.tier || 2;
        this.isProprietary = true;
        this.royaltyRate = 0.0; // 0% royalties! Keep 100% of revenue.
        this.bloatwareDebtFloor = 0; // Pristine codebase with no commercial bloatware!
        this.affineGenres = [...(config.affineGenres || ['Action', 'RPG'])];
        this.bakedNodes = [...(config.bakedNodes || ['render_raster', 'physics_basic'])];

        // Obsolescence & Maintenance Tracking
        this.createdYear = config.createdYear || 1;
        this.createdWeek = config.createdWeek || 1;
        this.releaseYear = config.releaseYear || (1981 + this.createdYear);
        this.lastUpdatedYear = config.lastUpdatedYear || this.createdYear;
        this.lastUpdatedWeek = config.lastUpdatedWeek || this.createdWeek;

        // Third-party studio licensing contracts (passive monthly royalties)
        this.licensees = config.licensees || []; // Array of { studioName, monthlyRoyalty, signedYear, signedWeek }
        this.totalPassiveRoyaltiesEarned = config.totalPassiveRoyaltiesEarned || 0;
    }

    isAffineGenre(genreId) {
        return this.affineGenres.includes(genreId);
    }

    /**
     * Annual Obsolescence Calculation:
     * Suffers -15% efficiency per year without updates/maintenance (48 weeks per year).
     * efficiency = max(0.35, 1.0 - 0.15 * yearsElapsedWithoutUpdate)
     */
    getEfficiency(currentYear, currentWeek) {
        const elapsedYears = Math.max(0, currentYear - this.lastUpdatedYear);
        return Math.max(0, (100 - Math.max(0, (elapsedYears - 2) * 1.5)) / 100);
    }

    /**
     * Technical Friction Modifier:
     * Reduces friction to half (0.5x) for affine genres, adjusted by current engine efficiency.
     */
    getFrictionMultiplier(genreId, currentYear, currentWeek) {
        const efficiency = this.getEfficiency(currentYear, currentWeek);
        let multiplier = 1.0;

        if (this.isAffineGenre(genreId)) {
            // Halves technical friction in affine genres
            multiplier = 0.5;
        }

        // Obsolescence increases friction if engine is neglected:
        // When efficiency is 1.0 -> no penalty. If efficiency drops to 0.70 -> friction increases (1 / 0.70)
        return Math.round(multiplier * (1.0 + (1.0 - efficiency)) * 100) / 100;
    }

    /**
     * Upgrade / Update R&D Cycle:
     * Resets obsolescence clock to 100% efficiency and integrates newly researched nodes.
     */
    upgradeEngine(newBakedNodes, currentYear, currentWeek) {
        this.lastUpdatedYear = currentYear !== undefined ? currentYear : this.createdYear;
        this.lastUpdatedWeek = currentWeek || 1;
        this.releaseYear = 1981 + this.lastUpdatedYear;
        const nodeSet = new Set(this.bakedNodes);
        newBakedNodes.forEach(n => nodeSet.add(n));
        this.bakedNodes = Array.from(nodeSet);
        this.version++;
        return {
            success: true,
            newEfficiency: 1.0,
            bakedNodesCount: this.bakedNodes.length,
            version: this.version,
            message: `[[DE_ICON_024]] Motor in-house "${this.name}" actualizado a v${this.version}.0. Obsolescencia reseteada al 100% de eficiencia.`
        };
    }

    /**
     * Third-Party Studio Licensing:
     * License proprietary engine technology to external rival studios for passive monthly royalties.
     */
    licenseToStudio(studioName, monthlyFee) {
        if (typeof studioName !== 'string' || !studioName.trim()) {
            return { success: false, message: 'Indica un nombre válido para el estudio licenciatario.' };
        }
        if (!Number.isFinite(monthlyFee) || monthlyFee <= 0) {
            return { success: false, message: 'La regalía mensual debe ser un importe positivo y válido.' };
        }
        if (this.licensees.some(l => l.studioName === studioName)) {
            return { success: false, message: `El estudio ${studioName} ya posee una licencia activa de este motor.` };
        }
        const contract = {
            studioName,
            monthlyRoyalty: monthlyFee,
            signedDate: Date.now()
        };
        this.licensees.push(contract);
        return {
            success: true,
            contract,
            message: `[[DE_ICON_025]] ¡Contrato de Licenciamiento firmado! ${studioName} pagará $${monthlyFee.toLocaleString()}/mes por utilizar tu tecnología.`
        };
    }

    collectWeeklyPassiveRoyalties() {
        let weeklyTotal = 0;
        this.licensees.forEach(lic => {
            const weeklyPortion = Math.floor(lic.monthlyRoyalty / 4.0);
            weeklyTotal += weeklyPortion;
        });
        this.totalPassiveRoyaltiesEarned += weeklyTotal;
        return weeklyTotal;
    }
}

class EnginePipelineManager {
    constructor() {
        this.commercialCatalog = CommercialEngineCatalog;
        this.inHouseEngines = [];
        this.availablePipelines = [
            {
                id: 'commercial_unreal',
                type: 'commercial',
                name: 'Motor Comercial AAA (Unreal / Unity)',
                desc: '7% de regalías sobre ventas brutas. +20 pts de deuda técnica fija inamovible (bloatware base). Desbloquea Ray Tracing, PBR y Físicas avanzadas desde el Día 1.',
                royaltyPercent: 7,
                baseDebtFloor: 15,
                frictionMultiplier: 0.85,
                unlockedNodes: ['render_raytracing', 'physics_destructible', 'net_client_pred']
            },
            {
                id: 'inhouse_custom',
                type: 'inhouse',
                name: 'Motor Propio de la Casa (In-House Engine)',
                desc: '0% de regalías: el estudio conserva el 100% de la facturación. -50% de fricción en géneros afines. Permite licenciar tecnología a terceros (+$ pasivos). Sujeto a obsolescencia anual.',
                royaltyPercent: 0,
                baseDebtFloor: 0,
                frictionMultiplier: 0.50,
                unlockedNodes: []
            }
        ];
        this.selectedPipelineId = 'inhouse_custom';
    }

    selectPipeline(id) {
        this.selectedPipelineId = id;
    }

    getActivePipeline() {
        return this.availablePipelines.find(p => p.id === this.selectedPipelineId) || this.availablePipelines[0];
    }

    getCommercialEngine(id) {
        return this.commercialCatalog.find(e => e.id === id);
    }

    getInHouseEngine(id) {
        return this.inHouseEngines.find(e => e.id === id);
    }

    createInHouseEngine(config) {
        const engine = new InHouseEngine(config);
        this.inHouseEngines.push(engine);
        return engine;
    }
}

// =========================================================================
// 5. HIGH-LEVEL FACADE (DAGEngine Integration)
// =========================================================================

const DAGEngine = {
    catalog: DAG_CATALOG,
    CommercialCatalog: CommercialEngineCatalog,
    ReverseEngineeringCatalog: REVERSE_ENGINEERING_CATALOG,
    TechTreeManager,
    ScopeNode,
    ScopeDAG,
    TechnicalDebtManager,
    TechnicalDebtModel,
    InHouseEngine,
    EnginePipelineManager,

    createDAG(selectedNodeIds, options) {
        return new ScopeDAG(selectedNodeIds, options);
    },

    createDebtModel(config) {
        return new TechnicalDebtModel(config);
    },

    createPipelineManager() {
        return new EnginePipelineManager();
    },

    createTechTreeManager(unlockedIds) {
        return new TechTreeManager(DAG_CATALOG, unlockedIds);
    },

    getNodeById(id) {
        return DAG_CATALOG.find(n => n.id === id);
    },

    getNodesByCategory(cat) {
        return DAG_CATALOG.filter(n => n.category === cat);
    }
};

export { validateTechTree, DAG_CATALOG, REVERSE_ENGINEERING_CATALOG, TechTreeManager, ScopeNode, ScopeDAG, TechnicalDebtManager, TechnicalDebtModel, CommercialEngineCatalog, InHouseEngine, EnginePipelineManager, DAGEngine };
