import { soundEngine } from './audio.js';
import { CommercialEngineCatalog, InHouseEngine, REVERSE_ENGINEERING_CATALOG, ScopeDAG, TechnicalDebtModel, TechTreeManager } from './dag_engine.js';
import INDUSTRY_EVENT_CATALOG from './data/events.json';
import { PLATFORMS_DATABASE as PLATFORMS, getPlatformsByYear } from './data/platformsData.js';
import { TECH_TREE_NODES, calculateTechIncompatibility } from './data/techTreeData.js';
import CREATOR_PROFILES from './data/streamers.json';
import { GENRES_DATABASE, findGenre } from './data/genres_database.js';
import { THEMES_DATABASE, findTheme, calculateSynergy } from './data/themes_database.js';

/**
 * DEV EMPIRE 3D - Complete Tycoon Simulation Engine
 * Deep, balanced mathematical systems inspired by Game Dev Tycoon & Software Inc.
 * 36 Themes x 19 Genres synergy matrix, 4 specialized press critics,
 * true Top 10 rival leaderboard, 3-stage slider balance, procedural recruitment,
 * stamina/fatigue model, research tree with prerequisites, and emergent market events.
 */

// Backward-compatible references
const GENRES = GENRES_DATABASE;
const TOPICS = THEMES_DATABASE;

// --- 2. GENRES & IDEAL ARCHITECTURE / 3-STAGE SLIDER DISTRIBUTIONS ---
// --- 2.1 ARCHITECTURE DAG NODES CATALOG (16 NODES, 4 TIERS, 5 DISCIPLINES) ---
const ARCHITECTURE_NODES = [
    // TIER 1: FUNDACIONES
    {
        id: 'core_loop',
        name: 'Core Loop & Frame Scheduler',
        tier: 1,
        icon: '[[DE_ICON_075]]',
        category: 'core',
        discipline: { engine: 20, gameplay: 10, net: 0, art: 5, qa: 10 },
        friction: 0,
        requires: [],
        desc: 'Bucle principal determinista a 60 FPS y orquestación del ciclo de vida.'
    },
    {
        id: 'entity_component',
        name: 'ECS (Entity Component System)',
        tier: 1,
        icon: '[[DE_ICON_034]]',
        category: 'core',
        discipline: { engine: 25, gameplay: 20, net: 5, art: 5, qa: 15 },
        friction: 8,
        requires: ['core_loop'],
        desc: 'Arquitectura orientada a datos de alto rendimiento y cache locality.'
    },
    {
        id: 'forward_renderer',
        name: 'Pipeline Gráfico Básico',
        tier: 1,
        icon: '[[DE_ICON_019]]',
        category: 'art',
        discipline: { engine: 15, gameplay: 5, net: 0, art: 30, qa: 10 },
        friction: 5,
        requires: ['core_loop'],
        desc: 'Rasterización directa de mallas, sprites 2D y mapas de texturas.'
    },
    {
        id: 'unit_test_suite',
        name: 'Harness de Tests Unitarios',
        tier: 1,
        icon: '[[DE_ICON_094]]',
        category: 'qa',
        discipline: { engine: 10, gameplay: 10, net: 5, art: 0, qa: 35 },
        friction: -12,
        requires: ['core_loop'],
        desc: 'Batería de pruebas unitarias automáticas para blindar la lógica base.'
    },

    // TIER 2: MECÁNICAS & CAPA MEDIA
    {
        id: 'state_machine',
        name: 'Máquina de Estados Finita (FSM)',
        tier: 2,
        icon: '[[DE_ICON_037]]',
        category: 'gameplay',
        discipline: { engine: 10, gameplay: 35, net: 5, art: 10, qa: 15 },
        friction: 6,
        requires: ['core_loop'],
        desc: 'Control robusto de inputs, animaciones del héroe y transiciones de estados.'
    },
    {
        id: 'physics_2d3d',
        name: 'Motor Físico Cinemático & Colisiones',
        tier: 2,
        icon: '[[DE_ICON_055]]',
        category: 'core',
        discipline: { engine: 30, gameplay: 25, net: 10, art: 5, qa: 20 },
        friction: 14,
        requires: ['core_loop'],
        desc: 'Detección continua de colisiones, gravedad y dinámicas de cuerpos rígidos.'
    },
    {
        id: 'net_socket_sync',
        name: 'Capa de Sockets UDP / Red Base',
        tier: 2,
        icon: '[[DE_ICON_020]]',
        category: 'net',
        discipline: { engine: 25, gameplay: 10, net: 45, art: 0, qa: 25 },
        friction: 15,
        requires: ['core_loop'],
        desc: 'Serialización binaria de paquetes y sincronización cliente-servidor.'
    },
    {
        id: 'automated_ci',
        name: 'Pipeline CI/CD y Build Runner',
        tier: 2,
        icon: '[[DE_ICON_049]]',
        category: 'qa',
        discipline: { engine: 15, gameplay: 5, net: 15, art: 5, qa: 40 },
        friction: -16,
        requires: ['unit_test_suite'],
        desc: 'Compilación continua y comprobación de regresiones con cada commit.'
    },

    // TIER 3: SISTEMAS AVANZADOS
    {
        id: 'ai_behavior_trees',
        name: 'Árboles de Decisión IA & Blackboards',
        tier: 3,
        icon: '[[DE_ICON_056]]',
        category: 'gameplay',
        discipline: { engine: 15, gameplay: 40, net: 5, art: 5, qa: 25 },
        friction: 18,
        requires: ['state_machine'],
        desc: 'Comportamientos emergentes y tácticas complejas para PNJs y enemigos.'
    },
    {
        id: 'pbr_lighting',
        name: 'Iluminación PBR & Materiales Shaders',
        tier: 3,
        icon: '[[DE_ICON_068]]',
        category: 'art',
        discipline: { engine: 25, gameplay: 5, net: 0, art: 55, qa: 15 },
        friction: 16,
        requires: ['forward_renderer'],
        desc: 'Renderizado físicamente basado con reflejos dieléctricos y oclusión ambiental.'
    },
    {
        id: 'client_prediction',
        name: 'Predicción del Cliente & Reconciliación',
        tier: 3,
        icon: '[[DE_ICON_022]]',
        category: 'net',
        discipline: { engine: 30, gameplay: 25, net: 50, art: 0, qa: 35 },
        friction: 28,
        requires: ['net_socket_sync', 'state_machine'],
        desc: 'Eliminación del lag perceptible en pantalla mediante interpolación temporal.'
    },
    {
        id: 'memory_manager',
        name: 'Gestor de Memoria & Memory Pools',
        tier: 3,
        icon: '[[DE_ICON_048]]',
        category: 'core',
        discipline: { engine: 40, gameplay: 5, net: 10, art: 10, qa: 20 },
        friction: 12,
        requires: ['core_loop', 'entity_component'],
        desc: 'Elimina pausas de Garbage Collector mediante buffers preasignados.'
    },

    // TIER 4: CÚSPIDE AAA
    {
        id: 'combat_combos',
        name: 'Motor de Combate & Frame Data',
        tier: 4,
        icon: '[[DE_ICON_076]]',
        category: 'gameplay',
        discipline: { engine: 20, gameplay: 55, net: 15, art: 20, qa: 30 },
        friction: 22,
        requires: ['state_machine', 'physics_2d3d'],
        desc: 'Ventanas de frames milimétricas, cancelaciones de combos y hitboxes activas.'
    },
    {
        id: 'deferred_raytracing',
        name: 'Ray Tracing en Tiempo Real & GI',
        tier: 4,
        icon: '[[DE_ICON_095]]',
        category: 'art',
        discipline: { engine: 50, gameplay: 5, net: 0, art: 70, qa: 35 },
        friction: 34,
        requires: ['pbr_lighting', 'memory_manager'],
        desc: 'Trazado de rayos físico por hardware para iluminación global y reflejos fotorrealistas.'
    },
    {
        id: 'rollback_netcode',
        name: 'Rollback Netcode Determinista (GGPO)',
        tier: 4,
        icon: '[[DE_ICON_062]]',
        category: 'net',
        discipline: { engine: 45, gameplay: 35, net: 70, art: 0, qa: 45 },
        friction: 38,
        requires: ['client_prediction', 'memory_manager'],
        desc: 'Simulación con rebobinado para respuestas a 0ms en combates multijugador.'
    },
    {
        id: 'smoke_bots',
        name: 'Flota de Bots de Pruebas de Estrés',
        tier: 4,
        icon: '[[DE_ICON_021]]',
        category: 'qa',
        discipline: { engine: 20, gameplay: 20, net: 30, art: 0, qa: 60 },
        friction: -22,
        requires: ['automated_ci', 'ai_behavior_trees'],
        desc: 'Simula miles de partidas simultáneas cazando fugas de memoria y desyncs.'
    }
];

// --- 2.2 PIPELINE SPECIFICATIONS (COMMERCIAL VS IN-HOUSE) ---
const PIPELINE_TYPES = {
    commercial: {
        id: 'commercial',
        name: 'Motor Comercial AAA (ej. Unreal / Unity)',
        shortName: 'Motor Comercial',
        badge: '7% Regalías',
        royaltyRate: 0.07,
        baseDebt: 20, // Bloatware floor
        baseFriction: 15,
        unlockedNodes: ['forward_renderer', 'pbr_lighting', 'physics_2d3d', 'deferred_raytracing'],
        pros: [
            'Nodos avanzados gráficos y de físicas desbloqueados desde el Día 1',
            'Menor tiempo inicial para prototipar gráficos y físicas de última generación'
        ],
        cons: [
            '7% de regalías sobre ventas brutas para siempre',
            'Deuda técnica mínima inamovible del +20% (bloatware base del fabricante)'
        ]
    },
    inhouse: {
        id: 'inhouse',
        name: 'Motor Propio de la Casa (In-House Engine)',
        shortName: 'Motor In-House',
        badge: '0% Regalías',
        royaltyRate: 0.00,
        baseDebt: 0,
        baseFriction: 0,
        genreFrictionReduction: 0.50, // -50% fricción en géneros afines
        pros: [
            '0% de regalías: 100% de la facturación neta para tu estudio',
            '-50% de fricción acoplada en el género afín del motor',
            'Opción de licenciar a terceros para generar ingresos pasivos'
        ],
        cons: [
            'Debes investigar módulos manualmente en I+D',
            'Alerta de obsolescencia anual si no se actualiza o refactoriza'
        ]
    }
};

const ARCHITECTURE_PRESETS = {
    indie: {
        id: 'indie',
        name: '[[DE_ICON_022]] Indie Ágil',
        desc: 'Scope ligero, desarrollo veloz y código limpio.',
        nodes: ['core_loop', 'state_machine', 'forward_renderer', 'unit_test_suite']
    },
    aa: {
        id: 'aa',
        name: '[[DE_ICON_001]] AA Equilibrado',
        desc: 'Físicas, networking base y pipeline de shaders.',
        nodes: ['core_loop', 'entity_component', 'state_machine', 'physics_2d3d', 'forward_renderer', 'pbr_lighting', 'net_socket_sync', 'unit_test_suite', 'automated_ci']
    },
    aaa: {
        id: 'aaa',
        name: '[[DE_ICON_024]] AAA Ambicioso',
        desc: 'Ray Tracing, Rollback Netcode y combate avanzado.',
        nodes: ['core_loop', 'entity_component', 'forward_renderer', 'unit_test_suite', 'state_machine', 'physics_2d3d', 'net_socket_sync', 'automated_ci', 'ai_behavior_trees', 'pbr_lighting', 'client_prediction', 'memory_manager', 'combat_combos', 'deferred_raytracing', 'rollback_netcode', 'smoke_bots']
    },
    qa_master: {
        id: 'qa_master',
        name: '[[DE_ICON_021]] Robustez QA Máxima',
        desc: 'Foco en estabilidad extrema y deuda técnica cero.',
        nodes: ['core_loop', 'entity_component', 'forward_renderer', 'unit_test_suite', 'state_machine', 'automated_ci', 'ai_behavior_trees', 'memory_manager', 'smoke_bots']
    }
};

function calculateArchitectureMetrics(selectedNodeIds, pipelineId = 'inhouse', genreId = 'Action') {
    const pipeline = PIPELINE_TYPES[pipelineId] || PIPELINE_TYPES.inhouse;
    const selected = ARCHITECTURE_NODES.filter(n => selectedNodeIds.includes(n.id));

    // 1. Workload calculation
    const workload = { engine: 0, gameplay: 0, net: 0, art: 0, qa: 0, total: 0 };
    selected.forEach(node => {
        workload.engine += node.discipline.engine;
        workload.gameplay += node.discipline.gameplay;
        workload.net += node.discipline.net;
        workload.art += node.discipline.art;
        workload.qa += node.discipline.qa;
    });
    workload.total = workload.engine + workload.gameplay + workload.net + workload.art + workload.qa;

    // 2. Friction calculation
    let posFriction = 0;
    let negFriction = 0;
    let dependencyCouplings = 0;

    selected.forEach(node => {
        if (node.friction > 0) {
            posFriction += node.friction;
        } else {
            negFriction += Math.abs(node.friction);
        }
        if (node.requires.length > 1) {
            dependencyCouplings += (node.requires.length - 1) * 4;
        }
    });

    // In-house genre affinity reduction (-50% on positive friction)
    if (pipeline.id === 'inhouse') {
        posFriction = posFriction * (1 - pipeline.genreFrictionReduction);
    }

    const basePipelineFriction = pipeline.baseFriction;
    let netFriction = basePipelineFriction + posFriction + dependencyCouplings - negFriction;
    netFriction = Math.max(0, Math.min(100, Math.round(netFriction)));

    // 3. Tech Debt level
    const minDebt = pipeline.baseDebt;
    let estimatedDebt = minDebt + Math.round(netFriction * 0.35);
    estimatedDebt = Math.max(minDebt, Math.min(100, estimatedDebt));

    return {
        workload,
        friction: netFriction,
        techDebt: estimatedDebt,
        minDebt,
        pipeline,
        selectedCount: selected.length
    };
}

// --- 4. EXPANDED RESEARCH TREE WITH TIERS & PREREQUISITES ---
const ENGINE_TECH_CATALOG = [
    // Tier 1 (Garage Era)
    { id: 'graphics2d_v1', name: 'Gráficos 2D Básicos', tier: 1, costRP: 10, bonusTech: 12, bonusDesign: 8, bonusScore: 0.15, requires: null, researched: true, desc: 'Sprites en 16 colores y scroll suave.' },
    { id: 'sound_chiptune', name: 'Sonido Chiptune 8-Bit', tier: 1, costRP: 15, bonusTech: 6, bonusDesign: 14, bonusScore: 0.15, requires: null, researched: true, desc: 'Sintetizador FM y canales de ruido retro.' },
    { id: 'branching_story', name: 'Narrativa Ramificada', tier: 1, costRP: 25, bonusTech: 8, bonusDesign: 24, bonusScore: 0.25, requires: null, researched: false, desc: 'Árbol de decisiones y múltiples finales.' },

    // Tier 2 (Indie Loft Era)
    { id: 'physics_engine', name: 'Motor Físico Cinemático', tier: 2, costRP: 40, bonusTech: 28, bonusDesign: 12, bonusScore: 0.35, requires: 'graphics2d_v1', researched: false, desc: 'Colisiones realistas y trayectorias dinámicas.' },
    { id: 'graphics3d_v1', name: 'Gráficos 3D Poligonales', tier: 2, costRP: 55, bonusTech: 38, bonusDesign: 22, bonusScore: 0.40, requires: 'graphics2d_v1', researched: false, desc: 'Mallas poligonales en tiempo real y texturas UV.' },
    { id: 'smart_ai', name: 'IA Enemiga Adaptativa', tier: 2, costRP: 65, bonusTech: 40, bonusDesign: 18, bonusScore: 0.35, requires: null, researched: false, desc: 'Patrones tácticos y máquinas de estados fintas.' },
    { id: 'sound_surround', name: 'Audio Envolvente Estéreo', tier: 2, costRP: 50, bonusTech: 18, bonusDesign: 35, bonusScore: 0.30, requires: 'sound_chiptune', researched: false, desc: 'Muestreo estéreo y reverberación ambiental.' },
    { id: 'multiplayer', name: 'Conectividad Multijugador', tier: 2, costRP: 75, bonusTech: 46, bonusDesign: 20, bonusScore: 0.40, requires: null, researched: false, desc: 'Sockets de red, sincronización y lobby online.' },

    // Tier 3 (Cyber Campus Era)
    { id: 'sys_modding', name: 'Herramientas de Modding / SDK Comunitario', tier: 3, costRP: 80, bonusTech: 45, bonusDesign: 35, bonusScore: 0.40, minYear: 2000, requires: 'branching_story', researched: false, desc: 'Entorno de ejecución aislado y SDK para mods, mapas y expansiones comunitarias.' },
    { id: 'open_world', name: 'Mundo Abierto Dinámico', tier: 3, costRP: 95, bonusTech: 50, bonusDesign: 45, bonusScore: 0.50, requires: 'graphics3d_v1', researched: false, desc: 'Streaming procedural de mapas sin pantallas de carga.' },
    { id: 'raytracing', name: 'Iluminación Ray Tracing RTX', tier: 3, costRP: 130, bonusTech: 65, bonusDesign: 35, bonusScore: 0.55, requires: 'graphics3d_v1', researched: false, desc: 'Trazado de rayos físico y reflejos fotorrealistas.' },
    { id: 'neural_npc', name: 'NPCs con IA Generativa', tier: 3, costRP: 160, bonusTech: 70, bonusDesign: 50, bonusScore: 0.60, requires: 'smart_ai', researched: false, desc: 'Diálogos no guionados y conductas emergentes.' },
    { id: 'cloud_streaming', name: 'Arquitectura Cloud Híbrida', tier: 3, costRP: 180, bonusTech: 75, bonusDesign: 35, bonusScore: 0.55, requires: 'multiplayer', researched: false, desc: 'Cómputo en la nube e interoperabilidad cruzada.' }
];

// --- 5. INITIAL CANDIDATES POOL & PROCEDURAL GENERATOR ---
const BASE_CANDIDATE_POOL = [
    { name: 'Alex Vance', role: 'Programador Senior', tech: 48, design: 22, speed: 1.25, salary: 2800, trait: 'Code Ninja', desc: 'Genera puntos Tech con rapidez excepcional.' },
    { name: 'Elena Rostova', role: 'Diseñadora de Niveles', tech: 24, design: 52, speed: 1.15, salary: 2900, trait: 'Pixel Wizard', desc: 'Maestra del balance estético y level design.' },
    { name: 'Kenji Sato', role: 'Ingeniero de Motores', tech: 55, design: 16, speed: 1.30, salary: 3400, trait: 'Bug Hunter', desc: 'Depura bugs al doble de velocidad en la fase de pulido.' },
    { name: 'Sarah Connor', role: 'Especialista en IA & Sonido', tech: 40, design: 44, speed: 1.18, salary: 3200, trait: 'Full Stack', desc: 'Aporta de manera equilibrada a código y arte.' },
    { name: 'Marcus Brody', role: 'Director Creativo', tech: 18, design: 60, speed: 1.05, salary: 3600, trait: 'Story Crafter', desc: 'Maximiza las notas de guion y coherencia de mundo.' },
    { name: 'Maya Lin', role: 'Artista Técnica 3D', tech: 44, design: 50, speed: 1.25, salary: 3900, trait: 'Aesthetic Guru', desc: 'Potencia el impacto visual y reduce penalizaciones.' }
];

// --- 6. RIVAL STUDIOS & TOP 10 CHART DATA ---
const RIVAL_STUDIOS = [
    { name: 'Nin-Tendo', style: 'Casual/Aventura familiar', baseQuality: 9.2 },
    { name: 'RetroSoft', style: 'Estrategia y simulación histórica', baseQuality: 8.7 },
    { name: 'iD-Studio', style: 'Acción visceral 3D y shooters', baseQuality: 8.9 },
    { name: 'Square-Art', style: 'Grandes epopeyas RPG cinematográficas', baseQuality: 9.0 },
    { name: 'Max-Gaming', style: 'Simuladores y gestión urbana', baseQuality: 8.5 },
    { name: 'Sega-Bit', style: 'Arcade frenético y velocidad', baseQuality: 8.6 },
    { name: 'Valve-HQ', style: 'Innovación jugable y puzzles físicos', baseQuality: 9.3 },
    { name: 'BioWare-X', style: 'Rol narrativo y decisiones complejas', baseQuality: 8.8 },
    { name: 'Blizz-Craft', style: 'Estrategia competitiva y fantasía', baseQuality: 9.1 },
    { name: 'RockStar-Games', style: 'Mundos abiertos y acción cinematográfica', baseQuality: 9.4 }
];

const RIVAL_GAME_NAMES = [
    'Super Marioid 64', 'DoomCraft 3D', 'CyberQuest 2000', 'Final Chrono Fantasy', 'Simropolis 2000',
    'Sonic Cheetah', 'Half-Counter Strike', 'Mass Galaxy Citadel', 'StarCraft Command', 'Grand Heist Auto',
    'The Legend of Zorda', 'QuakeZone Arena', 'Dragon Quest Odyssey', 'Age of Castles IV', 'Warcraft Reign',
    'Red Dead Outlaws', 'Portal Shift', 'Fallout Horizon', 'Baldur Fortress', 'Street Fighter Turbo'
];

// --- 7. CORE TYCOON GAME ENGINE ---
class TycoonGame {
    constructor() {
        this.funds = 75000;
        this.fans = 25;
        this.researchPoints = 30;
        this.year = 1;
        this.month = 1;
        this.week = 1;
        this.gameSpeed = 1; // 0 = pause, 1 = normal, 2 = fast, 4 = ultra
        this.isPaused = false; // Session lifecycle pause, independent of player speed
        this.era = 1; // 1: Garage, 2: Indie Loft, 3: Cyber Campus
        this.workMode = 'normal';
        this.employeeEvents = [];

        // Company & Founder Profile
        this.companyName = 'PixelForge Interactive';
        this.companyLogo = '[[DE_ICON_001]]';
        this.hasCustomizedProfile = false;
        this.founder = {
            name: 'Raúl Vance',
            trait: 'Visionario'
        };
        this.characterCustomization = {
            skin: '#f0b884',
            hairStyle: 'mop',
            hairColor: '#3d2314',
            shirtStyle: 'flannel',
            shirtColor: '#367b70',
            pantsColor: '#1e293b',
            accessory: 'none'
        };

        this.employees = [
            {
                id: 'player',
                name: this.founder.name,
                role: 'Desarrollador Líder',
                tech: 34,
                design: 34,
                speed: 1.20,
                stamina: 100,
                maxStamina: 100,
                energy: 100,
                morale: 78,
                stress: 0,
                stressResistance: 58,
                continuousCrunchWeeks: 0,
                sickWeeksRemaining: 0,
                burnoutState: 'none',
                burnoutWeeks: 0,
                traits: [this.founder.trait],
                salary: 1200,
                trait: this.founder.trait,
                customization: { ...this.characterCustomization }
            }
        ];

        this.currentProject = null;
        this.gamesHistory = [];
        this.activeSales = [];
        this.platforms = Array.isArray(PLATFORMS) ? JSON.parse(JSON.stringify(PLATFORMS)) : [];
        // Array simple: también se puede serializar con el resto de la partida.
        this.ownedDevKits = [];
        this.genres = Array.isArray(GENRES_DATABASE) ? JSON.parse(JSON.stringify(GENRES_DATABASE)) : [];
        this.creatorProfiles = Array.isArray(CREATOR_PROFILES) ? JSON.parse(JSON.stringify(CREATOR_PROFILES)) : [];
        this.industryEventsCatalog = Array.isArray(INDUSTRY_EVENT_CATALOG) ? JSON.parse(JSON.stringify(INDUSTRY_EVENT_CATALOG)) : [];
        this.installedSimulatorMods = [];
        this.researchedTechs = ['graphics2d_v1', 'sound_chiptune'];

        // Research & Development (I+D) Tech Tree System & Topic/Genre Progression
        this.techTreeManager = new TechTreeManager();
        this.activeResearch = null; // { techId, nodeName, icon, costRP, totalWeeks, weeksRemaining, progress }
        this.activeEngineRD = null;
        this.unlockedGenreIds = ['action', 'Action', 'adventure', 'Adventure', 'rpg', 'RPG', 'strategy', 'Strategy', 'simulation', 'Simulation', 'casual', 'Casual'];
        this.activeGenreResearch = null; // { genreId, genreName, costRP, totalWeeks, weeksRemaining, progress, employeeIndex, employeeName }
        this.unlockedTopicIds = ['medieval', 'fantasy', 'sports', 'space', 'martial_arts', 'ninja']; // Starting topics for Era 80s
        this.activeTopicResearch = null; // { topicId, topicName, costRP, totalWeeks, weeksRemaining, progress, employeeIndex, employeeName }
        this.marketingPressArchive = []; // Archive of retro/digital press covers and magazine clippings

        this.customEngines = [
            {
                id: 'engine_v1',
                name: 'Starter Voxel Engine',
                features: ['graphics2d_v1', 'sound_chiptune'],
                bonusTech: 18,
                bonusDesign: 22,
                bonusScore: 0.30
            }
        ];

        // Technology Pipelines (Commercial Engines vs Proprietary In-House Engines)
        this.commercialEngines = (typeof CommercialEngineCatalog !== 'undefined') ? CommercialEngineCatalog : [];
        // The studio starts without a proprietary engine. One must be funded through R&D.
        this.inHouseEngines = [];
        this.lastPassiveRoyaltiesEarned = 0;

        this.availableCandidates = BASE_CANDIDATE_POOL.map((candidate, index) => ({
            ...candidate,
            id: `candidate_initial_${index}`,
            primaryRole: candidate.role,
            experience: /director|senior|ingeniero/i.test(candidate.role) ? 'Senior' : 'Mid',
            speedRating: Math.max(1, Math.min(100, Math.round(candidate.speed * 75))),
            stressResistance: 55 + (index % 4) * 8,
            salaryExpectation: candidate.salary,
            traits: [candidate.trait]
        }));
        this.pendingHeadhunts = [];
        this.simulationDay = 0;
        this.headhuntedEmployeeIds = new Set();
        this.top10Chart = [];
        this.marketTrend = null;
        this.activePublisherContract = null;
        this.discoveredInsights = []; // Unlocked post-mortem insights
        // Industry crisis and community event state (catalog-driven, transient runtime state).
        this.pendingIndustryEvents = [];
        this.industryEventHistory = [];
        this.platformSupplyShocks = [];
        this.industryEventCooldowns = {};
        this.lastIndustryEventWeek = -Infinity;

        // Subsistema de Deuda Técnica: Alertas de Crisis y Modo Parche de Emergencia Post-Lanzamiento
        this.isEmergencyPatchActive = false;
        this.emergencyPatchData = null; // { gameId, gameName, currentDebt, targetDebt: 20, refundRate, serverCrash, flaws, debtModel }

        this.initTop10Leaderboard();
        this.rollNewMarketTrend();

        this.listeners = [];
    }

    updateCompanyProfile(config) {
        if (config.companyName) this.companyName = config.companyName.trim();
        if (config.companyLogo) this.companyLogo = config.companyLogo;
        if (config.founderName) {
            this.founder.name = config.founderName.trim();
            if (this.employees[0]) this.employees[0].name = this.founder.name;
        }
        if (config.founderTrait) {
            this.founder.trait = config.founderTrait;
            if (this.employees[0]) {
                this.employees[0].trait = config.founderTrait;
                // Apply trait specialization
                if (config.founderTrait === 'Mago del Código') {
                    this.employees[0].tech = 42;
                    this.employees[0].design = 30;
                } else if (config.founderTrait === 'Diseñador Maestro') {
                    this.employees[0].tech = 30;
                    this.employees[0].design = 42;
                } else if (config.founderTrait === 'Cazador de Bugs') {
                    this.employees[0].speed = 1.35;
                } else if (config.founderTrait === 'Finanzas Ágiles') {
                    if (!this.hasCustomizedProfile) this.funds += 15000;
                }
            }
        }
        if (config.characterCustomization) {
            this.characterCustomization = { ...this.characterCustomization, ...config.characterCustomization };
            if (this.employees[0]) {
                this.employees[0].customization = { ...this.characterCustomization };
            }
        }

        this.hasCustomizedProfile = true;

        // Update active sales company name
        this.top10Chart.forEach(item => {
            if (item.isPlayer) item.dev = this.companyName;
        });

        if (soundEngine) soundEngine.playLevelUp();
        this.notify();
        return { success: true };
    }

    getHistoricalYear() {
        return 1981 + this.year;
    }

    getIndustryWeek() {
        return (this.year - 1) * 48 + (this.month - 1) * 4 + this.week;
    }

    hasBasicSecurityForProject(project = this.currentProject) {
        if (!project) return false;
        const researchIds = [
            ...(this.researchedTechs || []),
            ...Array.from(this.techTreeManager?.unlockedTechs || [])
        ];
        const scopedNodeNames = project.scopeDAG?.getActiveNodes?.().map(node => `${node.id} ${node.name || ''}`) || [];
        return [...researchIds, ...scopedNodeNames].some(value => /security|firewall|encrypt|cyber|firewall|seguridad|cifrado/i.test(String(value)));
    }

    // --- DATA-DRIVEN ARCHITECTURE & SIMULATOR EXTENSIBILITY (MODDING API) ---
    getPlatforms() {
        const historical = getPlatformsByYear(this.getHistoricalYear());
        const mods = (this.platforms || []).filter(p => p.isModded &&
            (p.releaseYear == null ? (p.eraUnlocked || 1) <= this.era : this.getHistoricalYear() >= p.releaseYear));
        const overridden = new Set(mods.map(p => p.id));
        return [...historical.filter(p => !overridden.has(p.id)), ...mods.map(p => ({
            ...p, status: p.retireYear != null && this.getHistoricalYear() >= p.retireYear ? 'RETIRED' : 'ACTIVE'
        }))];
    }

    getPlatformById(id) {
        return this.getPlatforms().find(p => p.id === id) || null;
    }

    getDevKitCost(platform) {
        if (!platform || (this.ownedDevKits || []).includes(platform.id)) return 0;
        const year = this.getHistoricalYear();
        const multiplier = year < 1990 ? 1 : (year < 2000 ? 1.2 : 1.45);
        return Math.ceil(Math.max(0, Number(platform.devKitCost ?? platform.devCost) || 0) * multiplier);
    }

    registerPlatform(platformData) {
        if (!platformData || !platformData.id || !platformData.name) {
            return { success: false, message: 'La consola requiere identificador (id) y nombre (name).' };
        }
        this.platforms = this.platforms || [];
        const existingIndex = this.platforms.findIndex(p => p.id === platformData.id);
        const cleanPlatform = {
            id: String(platformData.id).trim(),
            name: String(platformData.name).trim(),
            devCost: Number(platformData.devCost ?? platformData.devKitCost ?? 20000),
            royaltyRate: Math.max(0, Math.min(1, Number(platformData.royaltyRate ?? platformData.royalty ?? 0))),
            releaseYear: platformData.releaseYear == null ? null : Number(platformData.releaseYear),
            retireYear: platformData.retireYear == null ? null : Number(platformData.retireYear),
            marketShare: Number(platformData.marketShare ?? 0.65),
            eraUnlocked: Number(platformData.eraUnlocked) || 1,
            audience: platformData.audience || 'Everyone',
            icon: platformData.icon || '[[DE_ICON_001]]',
            audienceFit: platformData.audienceFit || { Everyone: 1.1, Young: 1.0, Mature: 1.0 },
            isModded: true
        };
        if (existingIndex >= 0) {
            this.platforms[existingIndex] = cleanPlatform;
        } else {
            this.platforms.push(cleanPlatform);
        }
        this.notify();
        return { success: true, platform: cleanPlatform, message: `Plataforma "${cleanPlatform.name}" registrada con éxito.` };
    }

    registerStreamer(streamerData) {
        if (!streamerData || !streamerData.id || !streamerData.name) {
            return { success: false, message: 'El streamer requiere id y nombre.' };
        }
        this.creatorProfiles = this.creatorProfiles || [];
        const existingIndex = this.creatorProfiles.findIndex(s => s.id === streamerData.id);
        const cleanStreamer = {
            id: String(streamerData.id).trim(),
            name: String(streamerData.name).trim(),
            platform: streamerData.platform || 'StreamBox Live',
            audience: streamerData.audience || 'top',
            followers: Number(streamerData.followers) || 500000,
            genres: Array.isArray(streamerData.genres) ? [...streamerData.genres] : ['Action', 'RPG', 'Adventure'],
            fee: Number(streamerData.fee) || 2500,
            isModded: true
        };
        if (existingIndex >= 0) {
            this.creatorProfiles[existingIndex] = cleanStreamer;
        } else {
            this.creatorProfiles.push(cleanStreamer);
        }
        this.notify();
        return { success: true, streamer: cleanStreamer, message: `Creador de contenido "${cleanStreamer.name}" registrado.` };
    }

    registerIndustryEvent(eventData) {
        if (!eventData || !eventData.id || !eventData.title || !eventData.type) {
            return { success: false, message: 'El evento requiere id, type y title.' };
        }
        this.industryEventsCatalog = this.industryEventsCatalog || [];
        const existingIndex = this.industryEventsCatalog.findIndex(e => e.id === eventData.id);
        const cleanEvent = {
            id: String(eventData.id).trim(),
            type: eventData.type,
            title: eventData.title,
            category: eventData.category || 'market_crisis',
            minYear: Number(eventData.minYear) || 1982,
            maxYear: Number(eventData.maxYear) || 9999,
            weight: Number(eventData.weight) || 1,
            trigger: eventData.trigger || { kind: 'random_industry_event' },
            choices: Array.isArray(eventData.choices) ? eventData.choices : [],
            retroHeadline: eventData.retroHeadline || eventData.headline || eventData.title,
            modernHeadline: eventData.modernHeadline || eventData.headline || eventData.title,
            description: eventData.description || eventData.title,
            isModded: true
        };
        if (existingIndex >= 0) {
            this.industryEventsCatalog[existingIndex] = cleanEvent;
        } else {
            this.industryEventsCatalog.push(cleanEvent);
        }
        this.notify();
        return { success: true, event: cleanEvent, message: `Evento de la industria "${cleanEvent.title}" registrado.` };
    }

    loadModPackage(pkg) {
        try {
            const data = typeof pkg === 'string' ? JSON.parse(pkg) : pkg;
            if (!data || typeof data !== 'object') {
                return { success: false, message: 'El paquete de mod debe ser un objeto JSON válido.' };
            }
            let platformsCount = 0;
            let streamersCount = 0;
            let eventsCount = 0;

            if (Array.isArray(data.platforms)) {
                data.platforms.forEach(p => {
                    const res = this.registerPlatform(p);
                    if (res.success) platformsCount++;
                });
            }
            if (Array.isArray(data.streamers)) {
                data.streamers.forEach(s => {
                    const res = this.registerStreamer(s);
                    if (res.success) streamersCount++;
                });
            }
            if (Array.isArray(data.events)) {
                data.events.forEach(e => {
                    const res = this.registerIndustryEvent(e);
                    if (res.success) eventsCount++;
                });
            }

            const modRecord = {
                id: data.metadata?.id || `mod_${Date.now()}`,
                name: data.metadata?.name || 'Paquete de Modding Comunitario',
                author: data.metadata?.author || 'Comunidad',
                version: data.metadata?.version || '1.0.0',
                description: data.metadata?.description || 'Expansión de datos de plataformas, creadores y eventos.',
                platformsCount,
                streamersCount,
                eventsCount,
                installedAt: new Date().toLocaleDateString()
            };
            this.installedSimulatorMods = (this.installedSimulatorMods || []).filter(m => m.id !== modRecord.id);
            this.installedSimulatorMods.push(modRecord);
            this.notify();
            return {
                success: true,
                modRecord,
                message: `[[DE_ICON_096]] Mod "${modRecord.name}" cargado: +${platformsCount} consolas, +${streamersCount} streamers y +${eventsCount} eventos.`
            };
        } catch (err) {
            return { success: false, message: `Error al procesar el paquete JSON de mod: ${err.message}` };
        }
    }

    exportModPackageTemplate() {
        return JSON.stringify({
            metadata: {
                id: "custom_expansion_pack",
                name: "Expansión Personalizada de la Comunidad",
                author: "Tu Nombre o Estudio",
                version: "1.0.0",
                description: "Nuevas consolas de época, streamers emergentes y crisis contextuales."
            },
            platforms: [
                {
                    id: "custom_handheld_1",
                    name: "Neo Portable 16-Bit",
                    devCost: 24000,
                    marketShare: 0.68,
                    eraUnlocked: 2,
                    audience: "Young",
                    icon: "[[DE_ICON_083]]",
                    audienceFit: { Everyone: 1.15, Young: 1.30, Mature: 0.85 }
                }
            ],
            streamers: [
                {
                    id: "custom_streamer_1",
                    name: "GamerProLive",
                    platform: "StreamBox Live",
                    audience: "top",
                    followers: 2800000,
                    genres: ["Action", "RPG", "Strategy"],
                    fee: 4500
                }
            ],
            events: [
                {
                    id: "custom_market_surge",
                    type: "platform_supply_shock",
                    title: "Auge del Cartucho Coleccionista",
                    retroHeadline: "PRENSA RETRO: FIEBRE DEL COLECCIONISMO DISPARA LA DEMANDA",
                    modernHeadline: "RETRO COLLECTING BOOM INCREASES CARTRIDGE VALUATIONS",
                    category: "market_crisis",
                    minYear: 1985,
                    maxYear: 2005,
                    weight: 1.0,
                    trigger: { kind: "random_industry_event" },
                    choices: [
                        { id: "wait_supply", label: "Mantener producción estándar", description: "Sin coste directo." },
                        { id: "reserve_stock", label: "Tirada especial de lujo", costFraction: 0.08 }
                    ]
                }
            ]
        }, null, 2);
    }

    // --- PROCEDURAL CONTEXTUAL INDUSTRY CRISIS & CONTINGENCY ENGINE ---
    getIndustryEventDefinition(eventId) {
        return (this.industryEventsCatalog || INDUSTRY_EVENT_CATALOG).find(item => item.id === eventId) || null;
    }

    createIndustryEvent(eventId, context = {}) {
        const definition = this.getIndustryEventDefinition(eventId);
        if (!definition) return null;
        const createdWeek = this.getIndustryWeek();
        const year = this.getHistoricalYear();
        const headline = context.headline || (year <= 2004 ? definition.retroHeadline : definition.modernHeadline) || definition.title;

        const choices = (definition.choices || []).map(choice => {
            const dynamic = {};
            if (choice.costFraction) {
                const budget = this.currentProject?.devCostTotal || context.referenceBudget || Math.max(30000, Math.floor(this.funds * 0.12));
                dynamic.cost = Math.max(choice.minCost || 5000, Math.round(budget * choice.costFraction));
            } else if (choice.cost !== undefined) {
                dynamic.cost = choice.cost;
            }
            return {
                ...choice,
                detail: choice.description,
                risks: choice.risks || [],
                timeWeeks: choice.timeWeeks || choice.delayWeeks || (choice.durationMonths ? choice.durationMonths * 4 : 0),
                ...dynamic
            };
        });

        const event = {
            id: `${definition.id}_${createdWeek}_${Math.floor(Math.random() * 100000)}`,
            type: definition.type,
            catalogId: definition.id,
            title: definition.title,
            headline,
            body: context.body || definition.description || definition.choices[0]?.description || 'La industria afronta un acontecimiento imprevisto.',
            category: definition.category,
            createdWeek,
            createdYear: year,
            expiresAtWeek: createdWeek + 2,
            choices,
            ...context
        };
        this.pendingIndustryEvents.push(event);
        this.industryEventHistory.push({ id: event.id, type: event.type, title: event.title, createdWeek, status: 'pending' });
        this.industryEventHistory = this.industryEventHistory.slice(-50);
        this.lastIndustryEventWeek = createdWeek;
        this.notify();
        return event;
    }

    checkIndustryEvents() {
        const currentWeek = this.getIndustryWeek();
        this.platformSupplyShocks = (this.platformSupplyShocks || []).filter(shock => shock.expiresAtWeek > currentWeek);
        this.genreDemandShocks = (this.genreDemandShocks || []).filter(shock => shock.expiresAtWeek > currentWeek);

        // Unanswered events resolve to their low-cost/default option after two weeks.
        const expiredEvents = (this.pendingIndustryEvents || []).filter(event => currentWeek >= event.expiresAtWeek);
        for (const event of expiredEvents) {
            const defaultChoice = event.type === 'platform_supply_shock' ? 'wait_supply'
                : (event.type === 'code_breach' ? 'legal_audit'
                    : (event.type === 'patent_lawsuit' ? 'settle' : 'delay'));
            this.resolveIndustryEvent(event.id, defaultChoice, { automatic: true });
        }

        // 1. Periodo de Gracia / Cooldown Obligatorio (16 meses = 64 semanas de protección mínima entre crisis)
        const CRISIS_GRACE_PERIOD_WEEKS = 64;
        if (this.pendingIndustryEvents?.length || (currentWeek - this.lastIndustryEventWeek < CRISIS_GRACE_PERIOD_WEEKS)) {
            return null;
        }

        // 2. Tirada Excepcional Mensual: Solo se evalúa en la Semana 1 de cada mes ficticio con probabilidad reducida (1%-3%)
        if (this.week !== 1) return null;
        if (Math.random() > 0.025) return null; // 2.5% de probabilidad mensual de crisis de mercado

        const year = this.getHistoricalYear();
        const catalog = this.industryEventsCatalog || INDUSTRY_EVENT_CATALOG;
        const definitions = catalog.filter(event => year >= (event.minYear || 1982) && year <= (event.maxYear || 9999));
        const candidates = [];
        const project = this.currentProject;

        // Factores lógicos de activación:
        // - Fuga de código: Exclusivo si Hype > 70 y sin seguridad básica
        const accumulatedHype = Math.max(project?.marketingHype || 0, project?.hype || 0);
        const hasLeakRisk = Boolean(project && project.overallProgress >= 50 && accumulatedHype > 70 && !this.hasBasicSecurityForProject(project));

        // - Demandas: NUNCA en el garaje (Era 1). Solo con más de 4 juegos, éxito masivo (>8.8 nota o >80k copias) y fondos holgados
        const isGarageEra = this.era === 1;
        const releasedCount = (this.gamesHistory || []).length;
        const hasMassiveHit = (this.gamesHistory || []).some(g => (g.score || 0) >= 8.8 || (g.unitsSoldTotal || 0) >= 80000);
        const isLawsuitEligible = !isGarageEra && releasedCount >= 4 && hasMassiveHit && this.funds >= 150000;

        // - Desplome de tendencia: Solo si el estudio ha sobreexplotado el género (3 o más lanzamientos idénticos)
        const genreOccurrences = (this.gamesHistory || []).filter(g => (g.genreId || g.genre) === project?.genre?.id).length;
        const hasTrendExposure = Boolean(project && genreOccurrences >= 3);

        for (const definition of definitions) {
            const type = definition.type;
            if ((this.industryEventCooldowns[type] || 0) > currentWeek) continue;

            if (type === 'platform_supply_shock') {
                const availableTitles = [...(this.activeSales || []), ...(project ? [project] : [])];
                const uniquePlatforms = [...new Map(availableTitles.filter(item => item.platform?.id).map(item => [item.platform.id, item.platform])).values()];
                if (!uniquePlatforms.length) continue;
                const affectedPlatform = uniquePlatforms[Math.floor(Math.random() * uniquePlatforms.length)];
                if (this.platformSupplyShocks.some(shock => shock.platformId === affectedPlatform.id && shock.expiresAtWeek > currentWeek)) continue;
                
                // Crisis de Fabricación / Escasez de Chips: Reduce ventas 30%-50% durante 3 a 6 meses (12-24 semanas)
                const durationWeeks = 12 + Math.floor(Math.random() * 13);
                const baseSalesMultiplier = 0.50 + Math.random() * 0.20;
                const reductionPercent = Math.round((1 - baseSalesMultiplier) * 100);

                candidates.push({ definition, context: {
                    platformId: affectedPlatform.id,
                    platformName: affectedPlatform.name,
                    headline: year <= 2004
                        ? `CRISIS DE FABRICACIÓN: ESCASEAN LOS CHIPS PARA ${affectedPlatform.name.toUpperCase()}`
                        : `CADENA DE SUMINISTRO GLOBAL BAJO PRESIÓN EN ${affectedPlatform.name.toUpperCase()}`,
                    body: `La escasez de componentes electrónicos y obleas de silicio reducirá las ventas de juegos para ${affectedPlatform.name} en un ${reductionPercent}% durante los próximos ${Math.round(durationWeeks / 4)} meses (${durationWeeks} semanas).`,
                    durationWeeks,
                    baseSalesMultiplier
                }});
            } else if (type === 'code_breach' && hasLeakRisk) {
                candidates.push({ definition, context: {
                    headline: year <= 2004
                        ? `ESCÁNDALO: DISQUETES CONFIDENCIALES DE "${project.name.toUpperCase()}" EN LA CALLE`
                        : `CYBER ALERT: CÓDIGO FUENTE DE "${project.name.toUpperCase()}" FILTRADO EN LA RED`,
                    body: `El estudio no cuenta con infraestructura de seguridad básica y el gran Hype de "${project.name}" (${accumulatedHype} pts) ha atraído filtradores. Parte del código circula en foros piratas. Puedes forzar el lanzamiento incompleto (asumiendo más Deuda Técnica) o financiar una auditoría legal y rehacer módulos (+2 meses de desarrollo).`,
                    projectName: project.name,
                    referenceBudget: project.devCostTotal || 35000,
                    defaultChoiceId: 'legal_audit'
                }});
            } else if (type === 'patent_lawsuit' && isLawsuitEligible) {
                const basis = this.gamesHistory.find(game => (game.score || 0) >= 8.5) || this.gamesHistory[0];
                candidates.push({ definition, context: {
                    headline: year <= 2004
                        ? 'LITIGIO MERCANTIL: DEMANDA DE PATENTES CONTRA EL ESTUDIO'
                        : 'BREAKING: TROLL DE PATENTES IMPUGNA TECNOLOGÍAS DEL ESTUDIO',
                    body: `Un consorcio legal rival demanda a tu empresa alegando infracción de algoritmos en el éxito comercial "${basis?.name || 'tu catálogo'}". Puedes pactar un acuerdo extrajudicial inmediato o contratar un bufete para litigar en tribunales (55% de probabilidad de ganar).`,
                    referenceBudget: basis?.devCostTotal || basis?.devCost || 60000,
                    defaultChoiceId: 'settle'
                }});
            } else if (type === 'genre_trend_crash' && hasTrendExposure) {
                candidates.push({ definition, context: {
                    headline: year <= 2004
                        ? `CAMBIO DE CICLO: EL PÚBLICO SE ENFRÍA ANTE EL GÉNERO ${project.genre.name.toUpperCase()}`
                        : `MARKET FATIGUE: DESPLOME REPENTINO DEL INTERÉS POR ${project.genre.name.toUpperCase()}`,
                    body: `La saturación de mercado tras varios lanzamientos seguidos ha enfriado temporalmente el interés del público por ${project.genre.name}. Puedes pivotar el proyecto hacia otro género o retrasar el lanzamiento 2 meses (+8 semanas) a que se disipe la sobreoferta.`,
                    projectGenreId: project.genre.id,
                    projectGenreName: project.genre.name,
                    defaultChoiceId: 'delay'
                }});
            }
        }

        if (!candidates.length) return null;
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        const event = this.createIndustryEvent(chosen.definition.id, chosen.context);
        this.lastIndustryEventWeek = currentWeek;
        // Cooldown por tipo: 96 semanas (24 meses ficticios)
        this.industryEventCooldowns[event.type] = currentWeek + 96;
        return event;
    }

    resolveIndustryEvent(eventId, choiceId, options = {}) {
        const index = (this.pendingIndustryEvents || []).findIndex(event => event.id === eventId);
        if (index < 0) return { success: false, message: 'La noticia ya no está pendiente.' };
        const event = this.pendingIndustryEvents[index];
        const choice = event.choices.find(item => item.id === choiceId);
        if (!choice) return { success: false, message: 'Esa opción no está disponible para esta crisis.' };
        const currentWeek = this.getIndustryWeek();
        const project = event.projectName && this.currentProject?.name !== event.projectName ? null : this.currentProject;
        const cost = Math.max(0, Math.floor(choice.cost || 0));
        if (cost > this.funds) return { success: false, message: `Fondos insuficientes ($${cost.toLocaleString()}) para ejecutar esa decisión.` };
        let message = '';
        let releasedGame = null;

        if (event.type === 'platform_supply_shock') {
            if (choiceId === 'reserve_stock') {
                this.funds -= cost;
                this.platformSupplyShocks.push({
                    eventId: event.id,
                    platformId: event.platformId,
                    platformName: event.platformName,
                    multiplier: 0.90, // Reduce impacto a solo -10%
                    expiresAtWeek: currentWeek + 4, // Duración reducida a 4 semanas
                    source: 'reserved_supply'
                });
                message = `[[DE_ICON_013]] Inventario reservado por $${cost.toLocaleString()} para ${event.platformName}; el impacto se limita a un leve 10% durante solo cuatro semanas.`;
            } else {
                const duration = event.durationWeeks || 16;
                const multiplier = event.baseSalesMultiplier || 0.60;
                this.platformSupplyShocks.push({
                    eventId: event.id,
                    platformId: event.platformId,
                    platformName: event.platformName,
                    multiplier,
                    expiresAtWeek: currentWeek + duration,
                    source: 'chip_shortage'
                });
                const reduction = Math.round((1 - multiplier) * 100);
                message = `[[DE_ICON_060]] Decidiste esperar sin desembolso. Las ventas en ${event.platformName} sufrirán una reducción del ${reduction}% durante las próximas ${duration} semanas.`;
            }
        } else if (event.type === 'code_breach') {
            if (!project) return { success: false, message: 'El proyecto afectado ya no se encuentra en desarrollo activo.' };
            if (choiceId === 'rush_release') {
                project.bugs = (project.bugs || 0) + (choice.bugsIncrease || 5);
                const debtAdd = choice.debtIncrease || 15;
                if (project.techDebtModel) {
                    project.techDebtModel.rawDebt = Math.max(project.techDebtModel.baseBloatwareDebt || 0, (project.techDebtModel.rawDebt || 0) + debtAdd);
                    project.techDebtModel.totalDebtGenerated = (project.techDebtModel.totalDebtGenerated || 0) + debtAdd;
                }
                project.leakForcedRelease = true;
                if (project.businessModel === 'early_access' && project.overallProgress >= 50 && project.overallProgress <= 80) {
                    const launch = this.launchEarlyAccess();
                    if (!launch.success) return launch;
                    releasedGame = launch.game;
                } else {
                    releasedGame = this.finishAndReleaseGame({ forcedLaunch: true });
                }
                message = `[[DE_ICON_022]] Lanzamiento adelantado en estado incompleto. Se añadieron +${debtAdd} de Deuda Técnica y +5 bugs críticos al juego publicado.`;
            } else {
                this.funds -= cost;
                const delay = choice.delayWeeks || 8;
                project.developmentDelayWeeks = (project.developmentDelayWeeks || 0) + delay;
                project.modulesReworkRequired = (project.modulesReworkRequired || 0) + 2;
                project.marketingHype = Math.max(0, (project.marketingHype || 0) - (choice.hypePenalty || 10));
                project.leakAudited = true;
                message = `[[DE_ICON_021]] Auditoría legal completada por $${cost.toLocaleString()}. Se aíslan las brechas y se reprograman los módulos afectados (+${delay} semanas de desarrollo).`;
            }
        } else if (event.type === 'patent_lawsuit') {
            if (choiceId === 'settle') {
                this.funds -= cost;
                message = `[[DE_ICON_025]] Acuerdo extrajudicial cerrado: se abonaron $${cost.toLocaleString()} a los demandantes. El litigio queda archivado sin impacto en la reputación.`;
            } else {
                this.funds -= cost;
                const winChance = choice.winChance || 0.55;
                const won = Math.random() < winChance;
                if (won) {
                    this.fans += 35;
                    message = `[[DE_ICON_097]] ¡VICTORIA JUDICIAL! El tribunal desestimó la demanda de patentes por falta de mérito. Ganas prestigio en la industria (+35 Fans).`;
                } else {
                    const penalty = Math.max(cost, Math.round((event.referenceBudget || 30000) * (choice.penaltyFraction || 0.25)));
                    this.funds = Math.max(0, this.funds - penalty);
                    this.fans = Math.max(0, this.fans - 20);
                    message = `[[DE_ICON_047]] FALLO JUDICIAL EN CONTRA: Además de los $${cost.toLocaleString()} de procuradores, el juzgado impuso una indemnización de $${penalty.toLocaleString()} (-20 Fans).`;
                }
            }
        } else if (event.type === 'genre_trend_crash') {
            if (!project) return { success: false, message: 'El proyecto afectado ya no se encuentra en desarrollo activo.' };
            this.genreDemandShocks = this.genreDemandShocks || [];
            const shockWeeks = 8;
            if (choiceId === 'pivot') {
                const availableGenres = this.genres || GENRES;
                const alternatives = availableGenres.filter(genre => genre.id !== project.genre.id);
                const replacement = this.marketTrend?.genreId && this.marketTrend.genreId !== project.genre.id
                    ? availableGenres.find(genre => genre.id === this.marketTrend.genreId)
                    : alternatives[Math.floor(Math.random() * alternatives.length)];
                if (replacement) {
                    project.genre = replacement;
                    if (project.scopeDAG) project.synergies = project.scopeDAG.calculateSynergies(replacement.id);
                    project.industryPivoted = true;
                }
                this.genreDemandShocks.push({ genreId: event.projectGenreId, multiplier: 0.70, expiresAtWeek: currentWeek + shockWeeks, eventId: event.id });
                message = `[[DE_ICON_062]] Proyecto pivotado exitosamente a "${replacement?.name || 'nuevo género'}". El antiguo género pierde un 30% de tracción temporal.`;
            } else {
                const delay = choice.delayWeeks || 8;
                project.developmentDelayWeeks = (project.developmentDelayWeeks || 0) + delay;
                project.industryDelayWeeks = (project.industryDelayWeeks || 0) + delay;
                this.genreDemandShocks.push({ genreId: event.projectGenreId, multiplier: 0.65, expiresAtWeek: currentWeek + shockWeeks, eventId: event.id });
                message = `[[DE_ICON_098]] Lanzamiento retrasado ${delay} semanas (+2 meses ficticios). Esperas a que el público recupere el apetito mientras asumes la nómina.`;
            }
        }

        this.pendingIndustryEvents.splice(index, 1);
        const history = this.industryEventHistory.find(item => item.id === event.id);
        if (history) Object.assign(history, { status: options.automatic ? 'auto_resolved' : 'resolved', choiceId, resolvedWeek: currentWeek, result: message });
        this.notify();
        return { success: true, message, event, choice, releasedGame, automatic: Boolean(options.automatic) };
    }

    getIndustrySalesMultiplier(platformId, genreId = null) {
        const currentWeek = this.getIndustryWeek();
        const platformMultiplier = (this.platformSupplyShocks || [])
            .filter(shock => shock.platformId === platformId && shock.expiresAtWeek > currentWeek)
            .reduce((multiplier, shock) => multiplier * shock.multiplier, 1);
        const genreMultiplier = (this.genreDemandShocks || [])
            .filter(shock => genreId && shock.genreId === genreId && shock.expiresAtWeek > currentWeek)
            .reduce((multiplier, shock) => multiplier * shock.multiplier, 1);
        return Math.max(0.10, platformMultiplier * genreMultiplier);
    }

    getBusinessModelOptions(selectedNodeIds = []) {
        const year = this.getHistoricalYear();
        const onlineNode = selectedNodeIds.some(id => ['net_p2p', 'net_dedicated'].includes(id)) &&
            selectedNodeIds.some(id => ['net_p2p', 'net_dedicated'].includes(id) && this.techTreeManager.isUnlocked(id));
        return [
            { id: 'premium', label: year < 1995 ? 'Premium físico (cartucho, casete o disquete)' : 'Premium tradicional', available: true, year: 1982, detail: 'Precio fijo y venta tradicional; soporte post lanzamiento opcional.' },
            { id: 'early_access', label: 'Acceso Anticipado', available: year >= 2013, year: 2013, detail: 'Beta de 8 semanas con precio reducido; lanzamiento 1.0 posterior.' },
            { id: 'f2p', label: 'Free-to-Play', available: year >= 2005 && onlineNode, year: 2005, requirement: onlineNode ? '' : 'Requiere un nodo online investigado y seleccionado', detail: 'Gratis; ingresos por compras dentro del juego y costes de servidores.' },
            { id: 'live_service', label: 'Juego como Servicio', available: year >= 2013 && onlineNode, year: 2013, requirement: onlineNode ? '' : 'Requiere un nodo online investigado y seleccionado', detail: 'Temporadas trimestrales, pase de batalla y operación continua.' }
        ].map(option => ({ ...option, lockedYear: year < option.year }));
    }

    getMarketingOptions() {
        const year = this.getHistoricalYear();
        const options = [
            { id: 'magazine_ad', label: 'Anuncio en revista especializada', year: 1982, cost: 2500, hype: 9, detail: 'Hype moderado; funciona mejor con revistas de buena reputación.' },
            { id: 'local_fair', label: 'Stand en feria local', year: 1982, cost: 5000, hype: 5, awareness: 22, detail: 'Aumenta el conocimiento del estudio en el mercado local.' },
            { id: 'cd_demo', label: 'Demo en CD de revista', year: 1995, cost: 9000, hype: 13, detail: 'Una demo pulida mejora la conversión de compradores.' },
            { id: 'e3_trailer', label: 'Trailer en feria internacional', year: 1995, cost: 24000, hype: 25, detail: 'Hype alto con riesgo de downgrade si el juego final no cumple lo prometido.' },
            { id: 'digital_demo', label: 'Festival digital de demos / Next Fest', year: 2006, cost: 12000, hype: 16, detail: 'Demo temporal que genera wishlists y conversiones.' }
        ];
        return options.map(option => ({ ...option, available: year >= option.year, lockedYear: year < option.year }));
    }

    runProjectMarketing(methodId) {
        const project = this.currentProject;
        if (!project) return { success: false, message: 'No hay un proyecto activo para promocionar.' };
        const option = this.getMarketingOptions().find(item => item.id === methodId);
        if (!option || !option.available) return { success: false, message: option ? `Este canal se desbloquea en ${option.year}.` : 'Canal de marketing desconocido.' };
        if ((project.marketingActions || []).some(item => item.id === methodId)) return { success: false, message: 'Ya has usado este canal para el proyecto.' };
        if (['cd_demo', 'e3_trailer', 'digital_demo'].includes(methodId) && project.overallProgress < 50) return { success: false, message: 'Completa al menos la mitad del desarrollo antes de presentar una demo o trailer.' };
        if (this.funds < option.cost) return { success: false, message: `Fondos insuficientes para esta campaña ($${option.cost.toLocaleString()}).` };

        const releasedGames = this.gamesHistory || [];
        const reputation = releasedGames.length
            ? releasedGames.reduce((sum, game) => sum + (game.score || 0), 0) / releasedGames.length
            : 5;
        const polished = project.bugs <= 2 && project.stage >= 3;
        const action = { id: option.id, label: option.label, year: this.getHistoricalYear(), week: this.week, cost: option.cost };
        this.funds -= option.cost;
        project.marketingCostTotal = (project.marketingCostTotal || 0) + option.cost;
        project.marketingActions = project.marketingActions || [];
        project.marketingActions.push(action);
        project.marketingHype = Math.min(100, (project.marketingHype || 0) + option.hype);
        project.brandAwareness = Math.min(100, (project.brandAwareness || 0) + (option.awareness || 0));

        if (methodId === 'magazine_ad') {
            const magazineFactor = Math.max(0.65, Math.min(1.4, 0.7 + reputation * 0.07));
            project.marketingHype = Math.min(100, project.marketingHype + Math.round(option.hype * (magazineFactor - 1)));
            action.publicationReputation = Math.round(magazineFactor * 100);
        } else if (methodId === 'cd_demo') {
            project.demoConversionBonus = polished ? 0.18 : 0.04;
            project.marketingHype = Math.min(100, project.marketingHype + (polished ? 4 : 0));
            action.demoPolished = polished;
        } else if (methodId === 'e3_trailer') {
            const eraTarget = this.era === 1 ? 75 : (this.era === 2 ? 220 : 520);
            project.trailerQuality = Math.max(2, Math.min(10, 5.5 + ((project.techPoints + project.designPoints) / eraTarget) * 2.2 - project.bugs * 0.3));
            project.downgradeRisk = true;
            action.trailerQuality = project.trailerQuality;
        } else if (methodId === 'digital_demo') {
            const wishlistBase = Math.max(120, Math.floor((this.fans * 3 + project.techPoints * 2 + project.designPoints * 2) * (polished ? 1.2 : 0.65)));
            project.wishlists = (project.wishlists || 0) + wishlistBase;
            project.demoConversionBonus = polished ? 0.22 : 0.06;
            action.wishlistsGenerated = wishlistBase;
            action.demoPolished = polished;
        }

        project.marketingFeed = project.marketingFeed || [];
        const campaignPost = {
            author: methodId === 'magazine_ad' ? 'Pixel Games Monthly' : (methodId === 'local_fair' ? 'Feria Local' : (methodId === 'e3_trailer' ? 'Game Expo Live' : (methodId === 'cd_demo' ? 'Revista PC Plus' : 'Festival Digital'))),
            icon: methodId === 'digital_demo' ? '[[DE_ICON_001]]' : '[[DE_ICON_099]]',
            text: methodId === 'digital_demo'
                ? `La demo de "${project.name}" ya está disponible. Se han añadido ${Number(action.wishlistsGenerated || 0).toLocaleString()} jugadores a la lista de deseados.`
                : (methodId === 'cd_demo'
                    ? `La demo de "${project.name}" llega con ${polished ? 'buen acabado y controles sólidos' : 'bugs visibles que dejan dudas'}.`
                    : `${project.name} aparece en ${option.label.toLowerCase()}. El estudio gana visibilidad antes del lanzamiento.`),
            time: `${this.getHistoricalYear()} · Semana ${this.week}`,
            kind: 'campaign'
        };
        project.marketingFeed.push(campaignPost);
        project.marketingFeed = project.marketingFeed.slice(-8);

        // Generar Portada de Revista Retro / Portal Web Digital (Subagente 4)
        let pressCover = null;
        if (['magazine_ad', 'cd_demo', 'e3_trailer', 'digital_demo'].includes(methodId)) {
            pressCover = this.generateMarketingPressCover(project, methodId);
            if (pressCover) {
                project.marketingPressCovers = project.marketingPressCovers || [];
                project.marketingPressCovers.push(pressCover);
                this.marketingPressArchive = this.marketingPressArchive || [];
                this.marketingPressArchive.unshift(pressCover);
            }
        }

        this.notify();
        return {
            success: true,
            message: `${option.label}: campaña lanzada por $${option.cost.toLocaleString()}.`,
            project,
            pressCover
        };
    }

    generateMarketingPressCover(project, methodId = 'magazine_ad') {
        const year = this.getHistoricalYear();
        const pName = (project?.name || 'Nuevo Videojuego').toUpperCase();
        const genreName = project?.genre?.name || project?.genre || 'Videojuego';
        const company = this.companyName || 'PixelForge Studio';

        let cover = null;

        if (year < 1990) {
            // Pool 80s: Micromaníacos (formato gigante satinado), Power Play, Sinclair & Spectrum User
            const pool = [
                {
                    id: 'micromaniacos_' + Date.now(),
                    period: '80s',
                    styleClass: 'cover-micromaniacos',
                    publicationName: 'MICRO-MANÍACOS',
                    tagline: 'REVISTA MENSUAL DEL SOFTWARE Y LOS MICROS DE 8 BITS',
                    issue: `AÑO I · Nº ${Math.max(1, (year - 1982) * 12 + this.month)}`,
                    priceBadge: '375 PTS / 2.50$',
                    headline: `¡EXCLUSIVA MUNDIAL! PRIMERAS IMÁGENES DE "${pName}"`,
                    subheadline: `El estudio ${company} revoluciona los ordenadores de cinta con una ambiciosa propuesta de ${genreName}.`,
                    badgeTop: '[[DE_ICON_148]] PÓSTER GIGANTE EN EL INTERIOR [[DE_ICON_148]]',
                    featureBadge: '¡GRÁFICOS ALUCINANTES!',
                    quote: '«Una producción nacional que no tiene nada que envidiar a las superproducciones de software internacional»',
                    tags: ['8-BIT GLORY', 'ESPECTRO CASSETTE', 'JOYSTICK COMPATIBLE'],
                    gameName: project?.name,
                    studioName: company,
                    year: year
                },
                {
                    id: 'powerplay_' + Date.now(),
                    period: '80s',
                    styleClass: 'cover-powerplay',
                    publicationName: 'POWER PLAY',
                    tagline: 'OFFICIAL MONTHLY PLAYER’S STRATEGY GUIDE',
                    issue: `VOL. ${year - 1981} · ISSUE #${this.month}`,
                    priceBadge: '$3.50 US / $4.25 CAN',
                    headline: `THE NEXT HIT: "${pName}"`,
                    subheadline: `${company} reveals its top-secret project. Is this the definitive cartridge of the generation?`,
                    badgeTop: '[[DE_ICON_148]] CLASSIFIED SNEAK PEEK [[DE_ICON_148]]',
                    featureBadge: 'PRO-TIPS & SECRET CODES',
                    quote: '«Jaw-dropping action and tight control response that will keep you glued to the CRT monitor screen»',
                    tags: ['HIGH SCORE', 'NES TESTED', 'SEAL OF APPROVAL'],
                    gameName: project?.name,
                    studioName: company,
                    year: year
                },
                {
                    id: 'spectrumuser_' + Date.now(),
                    period: '80s',
                    styleClass: 'cover-spectrumuser',
                    publicationName: 'SPECTRUM USER',
                    tagline: 'THE ESSENTIAL MONTHLY FOR MICRO ENTHUSIASTS',
                    issue: `VOL. 2 · UK £1.20`,
                    priceBadge: '£1.20 / 350 PTS',
                    headline: `BREAKING THE 48K BARRIER: "${pName}"`,
                    subheadline: `How ${company} squeezed maximum scrolling speed and arcade action into limited RAM.`,
                    badgeTop: '[[DE_ICON_148]] COVER TAPE CASSETTE INCLUDED [[DE_ICON_148]]',
                    featureBadge: '100% MACHINE CODE',
                    quote: '«Smooth raster routines and addictive gameplay loops. An outstanding technical accomplishment»',
                    tags: ['48K RAM', 'NO ATTRIBUTE CLASH', 'KEMPSTON READY'],
                    gameName: project?.name,
                    studioName: company,
                    year: year
                }
            ];
            cover = pool[Math.floor(Math.random() * pool.length)];
        } else if (year < 2000) {
            // Pool 90s: PC Gamer Ultra, Super Consoles
            const pool = [
                {
                    id: 'pcgamerultra_' + Date.now(),
                    period: '90s',
                    styleClass: 'cover-pcgamerultra',
                    publicationName: 'PC GAMER ULTRA',
                    tagline: 'LA GUÍA DEFINITIVA DEL HARDWARE Y JUEGOS EN CD-ROM',
                    issue: `AÑO VII · EJEMPLAR #${(year - 1990) * 12 + this.month}`,
                    priceBadge: '595 PTS / $3.99',
                    headline: `EL SALTO A LAS 3D: "${pName}"`,
                    subheadline: `Probamos en primicia la tecnología puntera que ${company} prepara para cambiar los estándares.`,
                    badgeTop: '[[DE_ICON_148]] CD-ROM 650MB CON DEMO JUGABLE [[DE_ICON_148]]',
                    featureBadge: 'ACELERACIÓN 3D GL / SOUND BLASTER 16',
                    quote: '«Texturas de alta resolución, sonido envolvente y una física que redefine por completo el género»',
                    tags: ['CD-ROM EXCLUSIVO', 'SVGA 640x480', 'MULTIPLAYER LAN'],
                    gameName: project?.name,
                    studioName: company,
                    year: year
                },
                {
                    id: 'superconsole_' + Date.now(),
                    period: '90s',
                    styleClass: 'cover-superconsole',
                    publicationName: 'SUPER CONSOLES',
                    tagline: 'TODAS LAS NOVEDADES DE 16 Y 32 BITS AL DETALLE',
                    issue: `Nº ${(year - 1990) * 8 + this.month}`,
                    priceBadge: '495 PTS / $3.50',
                    headline: `SUPER AVANCE EXCLUSIVO: "${pName}"`,
                    subheadline: `${company} muestra músculo técnico con un derroche de sprites, polígonos y diversión directa.`,
                    badgeTop: '[[DE_ICON_148]] MEGA REPORTAJE 8 PÁGINAS [[DE_ICON_148]]',
                    featureBadge: 'IMPORT ALERT / PREVIEW 95%',
                    quote: '«Si el juego final mantiene este nivel de ritmo, será candidato indiscutible al título del año»',
                    tags: ['ARCADE PERFECT', 'SURROUND AUDIO', 'POSTER CENTRAL'],
                    gameName: project?.name,
                    studioName: company,
                    year: year
                }
            ];
            cover = pool[Math.floor(Math.random() * pool.length)];
        } else {
            // Pool 2000+: Portales Web Digitales Modernos (IGNite, EuroPixel)
            const pool = [
                {
                    id: 'ignite_' + Date.now(),
                    period: '2000s',
                    styleClass: 'cover-ignite',
                    publicationName: 'IGNite.com',
                    tagline: 'REVIEWS • PREVIEWS • NEWS • GUIDES • ESPORTS',
                    issue: `ACTUALIZADO EN DIRECTO // PORTADA PRINCIPAL`,
                    priceBadge: 'WEB EXCLUSIVE',
                    headline: `FIRST LOOK: Why "${pName}" Could Define This Gaming Generation`,
                    subheadline: `We went hands-on with ${company}'s latest build. Here is everything you need to know about its ground-breaking design.`,
                    badgeTop: '[[DE_ICON_003]] TRENDING ARTICLE #1',
                    featureBadge: 'HYPE INDEX: 9.6 / 10',
                    quote: '«An ambitious showcase of mechanics that proves independent vision can rival major blockbusters»',
                    tags: ['4K READY', 'DAY ONE PREVIEW', 'WISHLIST BOOM'],
                    gameName: project?.name,
                    studioName: company,
                    year: year
                },
                {
                    id: 'europixel_' + Date.now(),
                    period: '2000s',
                    styleClass: 'cover-europixel',
                    publicationName: 'EuroPixel.net',
                    tagline: 'EUROPE’S INDEPENDENT VOICE IN VIDEO GAME CULTURE',
                    issue: `MONTHLY IN-DEPTH ESSAY & INTERVIEW`,
                    priceBadge: 'DIGITAL EDITION',
                    headline: `INSIDE THE WORKSHOP: How ${company} Is Crafting "${pName}"`,
                    subheadline: `A deep dive into the architecture, systemic synergy and world-building powering this anticipated release.`,
                    badgeTop: '[[DE_ICON_148]] ESSENTIAL DEV DIARY [[DE_ICON_148]]',
                    featureBadge: 'EDITOR’S ANTICIPATED PICK',
                    quote: '«Smart, elegant, and packed with personality. A masterclass in focused creative direction»',
                    tags: ['DEEP DIVE', 'SYSTEMIC DESIGN', 'COMMUNITY DRIVEN'],
                    gameName: project?.name,
                    studioName: company,
                    year: year
                }
            ];
            cover = pool[Math.floor(Math.random() * pool.length)];
        }

        return cover;
    }

    getCreatorProfiles(gameId = null) {
        const year = this.getHistoricalYear();
        const projectNameTarget = typeof gameId === 'string' && gameId.startsWith('project:') ? gameId.slice(8) : null;
        const target = projectNameTarget
            ? (this.currentProject?.name === projectNameTarget ? this.currentProject : null)
            : (gameId && gameId !== 'project'
                ? (this.gamesHistory.find(item => item.id === gameId) || (this.currentProject?.name === gameId ? this.currentProject : null))
                : this.currentProject);
        const genreId = target?.genreId || target?.genre?.id;
        const sentIds = target?.creatorKeyCampaign?.map(item => item.creatorId) || [];
        return this.creatorProfiles.map(profile => ({
            ...profile,
            genres: [...profile.genres],
            available: year >= 2006,
            yearUnlocked: 2006,
            genreMatch: Boolean(genreId && profile.genres.includes(genreId)),
            alreadySent: sentIds.includes(profile.id)
        }));
    }

    sendStreamerKeys(gameId, creatorId, keyCount = 1) {
        if (this.getHistoricalYear() < 2006) return { success: false, message: 'Los envíos de claves a creadores se desbloquean en 2006.' };
        const projectNameTarget = typeof gameId === 'string' && gameId.startsWith('project:') ? gameId.slice(8) : null;
        const isProject = !gameId || gameId === 'project' || gameId === this.currentProject?.id || gameId === this.currentProject?.name || projectNameTarget === this.currentProject?.name;
        const target = isProject
            ? this.currentProject
            : (this.gamesHistory.find(item => item.id === gameId) || null);
        if (!target) return { success: false, message: 'Selecciona un proyecto o juego válido para enviar claves.' };
        const creator = this.creatorProfiles.find(profile => profile.id === creatorId);
        if (!creator) return { success: false, message: 'No se encontró ese creador de contenido.' };
        target.creatorKeyCampaign = target.creatorKeyCampaign || [];
        if (target.creatorKeyCampaign.some(item => item.creatorId === creatorId)) {
            return { success: false, message: `Ya enviaste claves a ${creator.name} para este juego.` };
        }
        const count = Math.max(1, Math.min(5, Math.floor(Number(keyCount) || 1)));
        const cost = creator.fee + count * 25;
        if (this.funds < cost) return { success: false, message: `Fondos insuficientes para contactar a ${creator.name} ($${cost.toLocaleString()}).` };
        this.funds -= cost;
        target.creatorKeyCampaign.push({
            creatorId: creator.id, creatorName: creator.name, platform: creator.platform,
            audience: creator.audience, followers: creator.followers, genres: [...creator.genres],
            keyCount: count, campaignCost: cost,
            sentYear: this.getHistoricalYear(),
            sentWeek: this.year * 48 + (this.month - 1) * 4 + this.week,
            resolved: false
        });
        target.creatorCampaignCost = (target.creatorCampaignCost || 0) + cost;
        target.marketingCostTotal = (target.marketingCostTotal || 0) + cost;
        target.marketingCampaign = target.marketingCampaign || { hype: 0, wishlists: 0 };
        if (!isProject) this.resolveCreatorCampaign(target);
        this.notify();
        return { success: true, message: `Enviadas ${count} clave(s) a ${creator.name} en ${creator.platform}. Coste: $${cost.toLocaleString()}.`, creator, cost };
    }

    resolveCreatorCampaign(game) {
        if (!game?.creatorKeyCampaign?.length) return [];
        game.streamerBroadcasts = game.streamerBroadcasts || [];
        game.viralMultiplier = Math.max(1, game.viralMultiplier || 1);
        game.viralWeeksRemaining = Math.max(0, game.viralWeeksRemaining || 0);
        const genreId = game.genreId || game.genre;
        const resolution = [];
        game.creatorKeyCampaign.forEach(key => {
            if (key.resolved) return;
            const profile = this.creatorProfiles.find(item => item.id === key.creatorId) || key;
            const genreMatch = (profile.genres || []).includes(genreId);
            const hasCriticalBugs = (game.bugsAtRelease || 0) > 2 || (game.techDebtAtRelease || 0) > 45;
            const enjoymentChance = Math.max(0.05, Math.min(0.95,
                0.20 + (game.score || 5) * 0.05 + (genreMatch ? 0.20 : 0) - (hasCriticalBugs ? 0.45 : 0)
            ));
            const enjoyed = !hasCriticalBugs && Math.random() < enjoymentChance;
            const audienceLift = profile.audience === 'top' ? 0.36 : (profile.audience === 'medium' ? 0.22 : 0.11);
            const viralLift = enjoyed ? audienceLift * (genreMatch ? 1 : 0.55) : 0;
            const viewers = Math.floor((profile.followers || key.followers || 0) * (enjoyed ? 0.18 : 0.08));
            const broadcast = {
                creatorId: key.creatorId, creatorName: key.creatorName || profile.name,
                platform: key.platform || profile.platform, viewers, enjoyed, genreMatch, viralLift,
                viralWeeksRemaining: enjoyed ? 3 : 0,
                reaction: enjoyed ? 'Le encantó el juego y lo recomienda a su audiencia.' : (hasCriticalBugs ? 'La deuda técnica y los bugs arruinaron la retransmisión.' : 'La retransmisión tuvo una respuesta discreta.')
            };
            key.resolved = true;
            key.response = { enjoyed, viewers, genreMatch, viralLift };
            game.streamerBroadcasts.push(broadcast);
            if (enjoyed) {
                game.viralMultiplier = Math.min(2.2, game.viralMultiplier + viralLift);
                game.viralWeeksRemaining = Math.max(game.viralWeeksRemaining, 3);
            }
            resolution.push(broadcast);
        });
        if (resolution.length) this.notify();
        return resolution;
    }

    applyWeeklyViralEffect(game) {
        if (!game || (game.viralWeeksRemaining || 0) <= 0) return 1;
        const multiplier = Math.max(1, game.viralMultiplier || 1);
        game.viralWeeksRemaining = Math.max(0, game.viralWeeksRemaining - 1);
        if (game.viralWeeksRemaining === 0) game.viralMultiplier = 1;
        return multiplier;
    }

    onStateChange(cb) {
        this.listeners.push(cb);
    }

    notify() {
        this.listeners.forEach(cb => {
            try { cb(this); } catch (e) { console.error("Notification listener error:", e); }
        });
    }

    // --- MARKET TRENDS & RANDOM EVENTS ---
    rollNewMarketTrend() {
        const randTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const randGenre = GENRES[Math.floor(Math.random() * GENRES.length)];
        this.marketTrend = {
            topicId: randTopic.id,
            topicName: randTopic.name,
            genreId: randGenre.id,
            genreName: randGenre.name,
            durationWeeks: 12 + Math.floor(Math.random() * 16),
            weeksRemaining: 12 + Math.floor(Math.random() * 16),
            bonusMultiplier: 1.35
        };
    }

    // --- RIVAL TOP 10 LEADERBOARD SIMULATION ---
    initTop10Leaderboard() {
        this.top10Chart = [];
        const usedNames = new Set();

        for (let i = 0; i < 10; i++) {
            const studio = RIVAL_STUDIOS[i % RIVAL_STUDIOS.length];
            let name = RIVAL_GAME_NAMES[i % RIVAL_GAME_NAMES.length];
            if (usedNames.has(name)) name = `${name} II`;
            usedNames.add(name);

            const score = Math.round((studio.baseQuality - (i * 0.15) + (Math.random() * 0.4 - 0.2)) * 10) / 10;
            const rankBase = 10 - i;
            const weeklySales = Math.floor(3500 * rankBase + Math.random() * 2000);
            const totalSales = Math.floor(weeklySales * (4 + Math.random() * 6));

            this.top10Chart.push({
                rank: i + 1,
                lastRank: i + 1,
                trend: 'same', // 'up', 'down', 'same', 'new'
                isPlayer: false,
                title: name,
                dev: studio.name,
                weeklySales: weeklySales,
                totalSales: totalSales,
                score: score,
                weeksOnChart: Math.floor(Math.random() * 6) + 1,
                decayRate: 0.82
            });
        }
        this.top10Chart.sort((a, b) => b.weeklySales - a.weeklySales);
        this.updateRanks();
    }

    updateRanks() {
        this.top10Chart.forEach((item, index) => {
            const newRank = index + 1;
            if (item.lastRank > newRank) item.trend = 'up';
            else if (item.lastRank < newRank) item.trend = 'down';
            else item.trend = 'same';
            item.rank = newRank;
            item.lastRank = newRank;
        });
    }

    cycleRivalMarket() {
        // Age rival games and simulate weekly decay
        this.top10Chart.forEach(item => {
            if (!item.isPlayer) {
                item.weeksOnChart++;
                item.weeklySales = Math.floor(item.weeklySales * item.decayRate);
                item.totalSales += item.weeklySales;
            }
        });

        // If an AI game decays below threshold or stays > 10 weeks, release a new challenger
        const replaceIdx = this.top10Chart.findIndex(item => !item.isPlayer && (item.weeksOnChart > 10 || item.weeklySales < 400));
        if (replaceIdx !== -1) {
            const studio = RIVAL_STUDIOS[Math.floor(Math.random() * RIVAL_STUDIOS.length)];
            const rawTitle = RIVAL_GAME_NAMES[Math.floor(Math.random() * RIVAL_GAME_NAMES.length)];
            const releaseTitle = `${rawTitle} ${Math.floor(Math.random() * 90 + 10)}`;
            const score = Math.round((studio.baseQuality + (Math.random() * 0.6 - 0.3)) * 10) / 10;
            const initialSales = Math.floor(Math.pow(score / 2.2, 3.6) * 180 * (this.era === 1 ? 1 : (this.era === 2 ? 3.5 : 9)));

            this.top10Chart[replaceIdx] = {
                rank: 10,
                lastRank: 10,
                trend: 'new',
                isPlayer: false,
                title: releaseTitle,
                dev: studio.name,
                weeklySales: initialSales,
                totalSales: initialSales,
                score: score,
                weeksOnChart: 1,
                decayRate: 0.80 + Math.random() * 0.08
            };
        }

        // Integrate player's active games
        this.activeSales.forEach(playerGame => {
            const existingEntry = this.top10Chart.find(item => item.isPlayer && item.gameId === playerGame.id);
            if (existingEntry) {
                existingEntry.weeklySales = playerGame.unitsSoldLastWeek || 0;
                existingEntry.totalSales = playerGame.unitsSoldTotal;
            } else if ((playerGame.unitsSoldLastWeek || 0) > 0) {
                this.top10Chart.push({
                    rank: 11,
                    lastRank: 11,
                    trend: 'new',
                    isPlayer: true,
                    gameId: playerGame.id,
                    title: playerGame.name,
                    dev: this.companyName,
                    weeklySales: playerGame.unitsSoldLastWeek,
                    totalSales: playerGame.unitsSoldTotal,
                    score: playerGame.score,
                    weeksOnChart: playerGame.weeksOnMarket,
                    decayRate: playerGame.decayRate
                });
            }
        });

        // Remove retired player games
        for (let i = this.top10Chart.length - 1; i >= 0; i--) {
            if (this.top10Chart[i].isPlayer && !this.activeSales.some(g => g.id === this.top10Chart[i].gameId)) {
                this.top10Chart.splice(i, 1);
            }
        }

        // Sort descending by weekly sales and slice top 10
        this.top10Chart.sort((a, b) => b.weeklySales - a.weeklySales);
        if (this.top10Chart.length > 10) {
            this.top10Chart = this.top10Chart.slice(0, 10);
        }
        this.updateRanks();
    }

    // --- GÉNEROS Y REQUISITOS TÉCNICOS (SUBAGENTE 4) ---
    validateGenreTechRequirements(genreId, config = {}) {
        const genre = findGenre(genreId);
        if (!genre) return { valid: true };

        const reqs = genre.requiredTech || [];
        if (!reqs.length) return { valid: true };

        const dagPipeline = config.dagConfig ? config.dagConfig.pipeline : null;
        let engine = null;
        if (dagPipeline) {
            engine = (this.commercialEngines && this.commercialEngines.find(e => e.id === dagPipeline.id)) ||
                     (CommercialEngineCatalog && CommercialEngineCatalog.find(e => e.id === dagPipeline.id)) ||
                     (this.inHouseEngines && this.inHouseEngines.find(e => e.id === dagPipeline.id)) ||
                     dagPipeline;
        } else if (config.engineId) {
            engine = (this.commercialEngines && this.commercialEngines.find(e => e.id === config.engineId)) ||
                     (CommercialEngineCatalog && CommercialEngineCatalog.find(e => e.id === config.engineId)) ||
                     (this.inHouseEngines && this.inHouseEngines.find(e => e.id === config.engineId)) ||
                     (this.customEngines && this.customEngines.find(e => e.id === config.engineId));
        }

        const selectedNodes = config.selectedNodeIds || (config.dagConfig ? (config.dagConfig.selectedNodes || config.dagConfig.selectedNodeIds) : []) || [];
        const engineNodes = (engine && (engine.bakedNodes || engine.unlockedNodes)) || [];
        const activeNodeSet = new Set([...selectedNodes, ...engineNodes]);

        const missing = [];
        const missingTech = [];

        for (const req of reqs) {
            if (req === 'tech_3d') {
                const has3D = activeNodeSet.has('render_3d') ||
                              activeNodeSet.has('render_raytracing') ||
                              activeNodeSet.has('pbr_lighting') ||
                              activeNodeSet.has('deferred_raytracing') ||
                              activeNodeSet.has('physics_2d3d') ||
                              (engine && (engine.tier >= 2 || engine.id === 'commercial_unreal_pro' || engine.id === 'commercial_unity_apex')) ||
                              (this.researchedTechs && this.researchedTechs.includes('graphics3d_v1')) ||
                              (this.techTreeManager && (this.techTreeManager.isUnlocked('render_raytracing') || this.techTreeManager.isUnlocked('render_3d')));
                if (!has3D) {
                    missing.push('Gráficos 3D (Renderizado Poligonal / Raytracing)');
                    missingTech.push('tech_3d');
                }
            } else if (req === 'network_servers') {
                const hasNet = activeNodeSet.has('net_p2p') ||
                               activeNodeSet.has('net_dedicated') ||
                               activeNodeSet.has('net_socket_sync') ||
                               activeNodeSet.has('client_prediction') ||
                               activeNodeSet.has('rollback_netcode') ||
                               (engine && engine.id === 'commercial_unreal_pro') ||
                               (this.techTreeManager && (this.techTreeManager.isUnlocked('net_dedicated') || this.techTreeManager.isUnlocked('net_p2p')));
                if (!hasNet) {
                    missing.push('Red y Servidores (Sockets UDP / P2P / Servidores Dedicados)');
                    missingTech.push('network_servers');
                }
            } else if (req === 'mass_multiplayer') {
                const hasMass = activeNodeSet.has('net_dedicated') ||
                                activeNodeSet.has('rollback_netcode') ||
                                activeNodeSet.has('net_socket_sync') ||
                                (engine && engine.id === 'commercial_unreal_pro') ||
                                (this.techTreeManager && this.techTreeManager.isUnlocked('net_dedicated'));
                if (!hasMass) {
                    missing.push('Servidores Masivos Dedicados (Capacidad 100+ jugadores simultáneos)');
                    missingTech.push('mass_multiplayer');
                }
            }
        }

        if (missing.length > 0) {
            return {
                valid: false,
                missing,
                missingTech,
                message: `[[DE_ICON_016]] El género "${genre.name}" requiere infraestructura técnica avanzada: ${missing.join(' y ')}. Selecciona un motor o arquitectura compatible antes de comenzar.`
            };
        }

        return { valid: true, missingTech: [] };
    }

    // --- PROJECT CREATION & DEV CYCLES ---
    startNewGameProject(config) {
        // Validación de Modo Parche de Emergencia Post-Lanzamiento (Punto 5)
        if (this.isEmergencyPatchActive && this.emergencyPatchData) {
            return {
                success: false,
                message: `[[DE_ICON_014]] ¡PROYECTO BLOQUEADO! Tu estudio está bajo Alerta de Crisis por el colapso técnico de "${this.emergencyPatchData.gameName}". Debes estabilizar el juego con un [Parche de Emergencia] antes de arrancar otro proyecto.`
            };
        }

        // config: { name, topicId, genreId, platformId, targetAudience, engineId, pipelineType, selectedNodeIds, sliders }
        const topic = findTheme(config.topicId) || TOPICS[0];
        const genre = findGenre(config.genreId) || GENRES[0];
        const platform = this.getPlatformById(config.platformId);
        if (!platform) return { success: false, message: 'La plataforma seleccionada aún no está disponible.' };
        if (platform.status === 'RETIRED') return { success: false, message: `${platform.name} ya está retirada y no admite nuevos proyectos.` };

        const allowLocked = Boolean(config.force || config.forced || config.bypassUnlockCheck);

        // 0. Validación de Desbloqueo de Temática y Género
        if (!allowLocked) {
            const genreUnlocked = !this.unlockedGenreIds || this.unlockedGenreIds.some(id => id.toLowerCase() === genre.id.toLowerCase() || (genre.aliases && genre.aliases.some(a => a.toLowerCase() === id.toLowerCase())));
            if (!genreUnlocked) {
                return {
                    success: false,
                    message: `[[DE_ICON_093]] El género "${genre.name}" aún no ha sido investigado en el laboratorio de I+D (${genre.costRP} RP).`
                };
            }

            const topicUnlocked = !this.unlockedTopicIds || this.unlockedTopicIds.some(id => id.toLowerCase() === topic.id.toLowerCase() || (topic.aliases && topic.aliases.some(a => a.toLowerCase() === id.toLowerCase())));
            if (!topicUnlocked) {
                return {
                    success: false,
                    message: `[[DE_ICON_093]] La temática "${topic.name}" aún no ha sido investigada en el laboratorio de I+D (${topic.costRP || 20} RP).`
                };
            }
        }

        // 0b. Validación de Requisitos Técnicos de Infraestructura (Subagente 4)
        const techValidation = this.validateGenreTechRequirements(genre.id, config);
        if (!techValidation.valid) {
            return {
                success: false,
                message: techValidation.message
            };
        }

        // 1. Resolve Technological Pipeline (Commercial vs In-House vs Legacy Custom)
        const dagPipeline = config.dagConfig ? config.dagConfig.pipeline : null;
        const pipelineType = config.pipelineType || (dagPipeline ? dagPipeline.type : (config.engineId && config.engineId.startsWith('commercial_') ? 'commercial' : 'inhouse'));
        let engine = null;
        if (dagPipeline) {
            engine = (this.commercialEngines && this.commercialEngines.find(e => e.id === dagPipeline.id)) ||
                     (CommercialEngineCatalog && CommercialEngineCatalog.find(e => e.id === dagPipeline.id)) ||
                     (this.inHouseEngines && this.inHouseEngines.find(e => e.id === dagPipeline.id)) ||
                     dagPipeline;
        } else if (pipelineType === 'commercial') {
            engine = (this.commercialEngines && this.commercialEngines.find(e => e.id === config.engineId)) ||
                     (CommercialEngineCatalog && CommercialEngineCatalog.find(e => e.id === config.engineId)) ||
                     (this.commercialEngines && this.commercialEngines[0]);
        } else {
            engine = (this.inHouseEngines && this.inHouseEngines.find(e => e.id === config.engineId)) ||
                     (this.customEngines && this.customEngines.find(e => e.id === config.engineId)) ||
                     (this.inHouseEngines && this.inHouseEngines[0]) ||
                     (this.customEngines && this.customEngines[0]);
        }

        if (pipelineType === 'commercial' && engine && this.getHistoricalYear() < (engine.minYear || 1990)) {
            return { success: false, message: `Los motores comerciales generalistas estarán disponibles a partir de ${engine.minYear || 1990}. Desarrolla un motor propio para esta época.` };
        }

        const businessModel = config.businessModel || 'premium';
        const selectedNodesForBusiness = config.selectedNodeIds || (config.dagConfig && config.dagConfig.selectedNodeIds) || [];
        if (this.getHistoricalYear() < 1995 && selectedNodesForBusiness.some(id => ['net_p2p', 'net_dedicated'].includes(id))) {
            return { success: false, message: 'El juego online todavía no está disponible antes de 1995; elimina los nodos de red avanzada del alcance.' };
        }
        const businessOption = this.getBusinessModelOptions(selectedNodesForBusiness).find(option => option.id === businessModel);
        if (!businessOption || !businessOption.available) {
            return { success: false, message: businessOption?.requirement || `${businessOption?.label || 'Ese modelo'} estará disponible en ${businessOption?.year || 1982}.` };
        }
        const postLaunchContent = config.postLaunchContent || 'none';
        if (['f2p', 'live_service'].includes(businessModel) && postLaunchContent !== 'none') {
            return { success: false, message: 'Los juegos gratuitos usan su tienda de microtransacciones y las temporadas Live-Ops como contenido de pago.' };
        }
        if (postLaunchContent === 'expansion' && this.getHistoricalYear() < 1995) {
            return { success: false, message: 'Las expansiones en disco se desbloquean en 1995.' };
        }
        if (['dlc', 'season_pass'].includes(postLaunchContent) && this.getHistoricalYear() < 2005) {
            return { success: false, message: 'DLC y Season Pass estarán disponibles a partir de 2005.' };
        }
        if (businessModel === 'live_service' && !selectedNodesForBusiness.some(id => ['net_p2p', 'net_dedicated'].includes(id))) {
            return { success: false, message: 'Live-Service necesita un nodo de red online dentro del alcance del juego.' };
        }

        const historicalTechIds = [...new Set([...(config.historicalTechIds || []), ...((engine && engine.historicalTechIds) || [])])];
        const historicalValidation = this.techTreeManager.validateSelection(historicalTechIds, this.getHistoricalYear());
        if (!historicalValidation.valid) return { success: false, message: historicalValidation.errors.join(' ') };
        const historicalIncompatibility = calculateTechIncompatibility(historicalTechIds);
        const historicalBaseDebt = TECH_TREE_NODES.filter(node => historicalTechIds.includes(node.id)).reduce((sum, node) => sum + node.baseDebt, 0);
        const engineUpfrontCost = (engine && engine.licenseCost) ? engine.licenseCost : 0;
        const devKitCost = this.getDevKitCost(platform);
        const totalDevCost = devKitCost + engineUpfrontCost + (this.era === 1 ? 4000 : (this.era === 2 ? 14000 : 35000));
        if (this.funds < totalDevCost) {
            return { success: false, message: '¡Fondos insuficientes para costear el kit de desarrollo y licencias!' };
        }

        this.funds -= totalDevCost;
        this.ownedDevKits = this.ownedDevKits || [];
        if (!this.ownedDevKits.includes(platform.id)) this.ownedDevKits.push(platform.id);

        // Custom engine bonuses
        const engineTechBonus = engine ? (engine.bonusTech || 10) : 0;
        const engineDesignBonus = engine ? (engine.bonusDesign || 10) : 0;

        // 2. Scope Node DAG & Technical Debt Model Setup
        const defaultNodeIds = config.selectedNodeIds || (config.dagConfig && config.dagConfig.selectedNodeIds) || [
            'render_raster',
            'physics_basic',
            'net_singleplayer',
            'ai_scripts',
            'audio_stereo',
            'content_linear'
        ];

        let scopeDAG = null;
        let frictionMultiplier = 1.0;
        let frictionData = null;

        if (typeof ScopeDAG !== 'undefined') {
            scopeDAG = new ScopeDAG(defaultNodeIds, { techTreeManager: this.techTreeManager });
            if (engine && typeof engine.getFrictionMultiplier === 'function') {
                // In-House engine halves friction in affine genres
                frictionMultiplier = engine.getFrictionMultiplier(genre.id, this.year, this.week);
            } else if (engine && engine.baseDevTimeReduction) {
                // Commercial engine speed boost equivalent to reduced base friction
                frictionMultiplier = (1.0 - engine.baseDevTimeReduction);
            }
            frictionData = scopeDAG.calculateWorkload({ frictionMultiplier });
        }

        let techDebtModel = null;
        if (typeof TechnicalDebtModel !== 'undefined') {
            const bloatwareFloor = (dagPipeline && dagPipeline.baseDebtFloor !== undefined) ? dagPipeline.baseDebtFloor : ((engine && engine.bloatwareDebtFloor) ? engine.bloatwareDebtFloor : 0);
            techDebtModel = new TechnicalDebtModel({
                initialDebt: (bloatwareFloor + historicalBaseDebt) * historicalIncompatibility.multiplier,
                baseBloatwareDebt: bloatwareFloor
            });
        }

        // Backward compatibility sliders
        const sliders = config.sliders || {
            stage1: { engine: 0.70, gameplay: 0.80, story: 0.60 },
            stage2: { dialogues: 0.60, levelDesign: 0.75, ai: 0.65 },
            stage3: { worldDesign: 0.70, graphics: 0.80, sound: 0.75 }
        };

        // 3. Modelo de Financiación y Contrato Pactado en Preproducción (Paso 3)
        const contractType = config.publishingContractType || config.publishingContract || 'self_publishing';
        let contractInfo = null;
        let upfrontCashAdvance = 0;

        if (contractType === 'publisher_advance') {
            // Anticipo de fondos inmediato otorgado por la distribuidora
            const baseAdvance = Math.round(totalDevCost * 0.65);
            upfrontCashAdvance = Math.max(15000, baseAdvance);
            const deadlineWeeks = 48;
            contractInfo = {
                id: 'publisher_advance',
                type: 'publisher_advance',
                title: this.getHistoricalYear() <= 1994 ? 'Contrato de Distribución Física' : 'Contrato de Publisher Internacional',
                company: this.getHistoricalYear() <= 1994 ? 'Distribuidora Nacional' : 'Global Interactive Publishing',
                amount: upfrontCashAdvance,
                revenueShare: 0.50, // 50% royalties para la distribuidora
                deadlineWeeks: deadlineWeeks,
                signedAtWeek: this.getIndustryWeek(),
                detail: `Anticipo de $${upfrontCashAdvance.toLocaleString()} transferido al estudio. Retiene 50% de royalties en ventas y fija entrega en ${deadlineWeeks} semanas.`
            };
            this.funds += upfrontCashAdvance;
        } else if (contractType === 'platform_exclusive') {
            // Fondo de marketing y exclusividad de consola/tienda
            const baseGrant = Math.round(totalDevCost * 0.40);
            upfrontCashAdvance = Math.max(10000, baseGrant);
            contractInfo = {
                id: 'platform_exclusive',
                type: 'platform_exclusive',
                title: 'Acuerdo de Exclusividad de Plataforma',
                company: `${platform.name} Strategic Publishing`,
                amount: upfrontCashAdvance,
                marketingMultiplier: 1.65,
                platformRestriction: platform.name,
                permittedPlatforms: [platform.name],
                exclusivityWeeks: 24,
                revenueShare: 0.15,
                signedAtWeek: this.getIndustryWeek(),
                detail: `Fondo de marketing y desarrollo de $${upfrontCashAdvance.toLocaleString()} con +65% de ventas exclusivas en ${platform.name}.`
            };
            this.funds += upfrontCashAdvance;
        } else {
            // Autopublicación
            contractInfo = {
                id: 'self_publishing',
                type: 'self_publishing',
                title: 'Autopublicación Indie',
                company: this.companyName || 'Estudio Propio',
                amount: 0,
                revenueShare: 0,
                deadlineWeeks: null,
                signedAtWeek: this.getIndustryWeek(),
                detail: 'El estudio asume el 100% de los costes y retiene el 100% de los ingresos netos sin plazos forzados.'
            };
        }

        this.currentProject = {
            name: config.name || 'Juego Sin Nombre',
            topic: topic,
            genre: genre,
            platform: platform,
            targetAudience: config.targetAudience || 'Everyone',
            engine: engine,
            engineObj: engine,
            pipelineType: pipelineType,
            stage: 1, // 1, 2, 3, 4 (polish/bugfix)
            stageProgress: 0,
            overallProgress: 0,
            techPoints: engineTechBonus,
            designPoints: engineDesignBonus,
            bugs: 0,
            sliders: sliders,
            devCostTotal: totalDevCost,
            businessModel,
            monetizationStyle: config.monetizationStyle === 'aggressive' ? 'aggressive' : 'cosmetic',
            postLaunchContent,
            supportsPatches: this.getHistoricalYear() >= 1995 && config.supportsPatches !== false,
            moddingApiIncluded: (defaultNodeIds || []).includes('sys_modding') || !!config.moddingApiIncluded,
            // Contrato de Publicación y Financiación pactado desde el Día 1
            publishingContract: contractInfo,
            acceptedOffer: contractInfo,
            publisherRevenueShare: contractInfo.revenueShare || 0,
            offerRevenue: upfrontCashAdvance,
            contractDeadlineWeek: contractInfo.deadlineWeeks ? (this.getIndustryWeek() + contractInfo.deadlineWeeks) : null,
            contractLatePenaltyPerWeek: contractInfo.deadlineWeeks ? Math.max(500, Math.floor(totalDevCost * 0.02)) : 0,
            contractLatePenaltyCap: contractInfo.deadlineWeeks ? Math.floor(totalDevCost * 0.40) : 0,
            platformMarketingMultiplier: contractInfo.marketingMultiplier || 1.0,
            offers: [], // Sin ofertas pendientes innecesarias ni modales forzados en autopublicación
            offersGenerated: true, // Bloquea ofertas aleatorias desordenadas a mitad del desarrollo
            marketingHype: 0,
            brandAwareness: 0,
            wishlists: 0,
            marketingActions: [],
            marketingCostTotal: 0,
            demoConversionBonus: 0,
            downgradeRisk: false,
            // DAG & Technical Debt Engine Fields
            scopeDAG: scopeDAG,
            techDebtModel: techDebtModel,
            historicalTechIds,
            historicalIncompatibility,
            devMode: 'normal', // 'normal', 'crunch', 'refactor'
            disciplineWorkloads: frictionData ? frictionData.effectiveWorkload : { engine: 30, gameplay: 30, network: 0, art: 30, qa: 15, totalSum: 105 },
            disciplineProgress: { engine: 0, gameplay: 0, network: 0, art: 0, qa: 0 },
            friction: frictionData ? frictionData.friction : 22,
            synergies: scopeDAG ? scopeDAG.calculateSynergies(genre.id) : { synergies: [], synergyScoreBonus: 0 },
            regressionsCount: 0,
            lastRegression: null
        };

        if (soundEngine) {
            soundEngine.playLevelUp();
        }

        this.notify();
        return { success: true, project: this.currentProject, contract: contractInfo };
    }

    updateDevSliders(stage, sliders) {
        if (this.currentProject && this.currentProject.sliders[`stage${stage}`]) {
            this.currentProject.sliders[`stage${stage}`] = { ...this.currentProject.sliders[`stage${stage}`], ...sliders };
        }
    }

    generateProjectOffers() {
        // En el nuevo flujo de preproducción, las condiciones financieras y contratos
        // se pactan en el Paso 3 antes de comenzar el desarrollo.
        const project = this.currentProject;
        if (project) project.offersGenerated = true;
        return;
    }

    acceptProjectOffer(offerId) {
        const project = this.currentProject;
        if (!project || project.acceptedOffer) return { success: false, message: 'No hay una oferta pendiente o ya aceptaste otra.' };
        const offer = project.offers.find(item => item.id === offerId);
        if (!offer) return { success: false, message: 'La oferta ya no está disponible.' };
        const year = this.getHistoricalYear();
        const amount = Math.max(0, Math.floor(offer.amount || 0));
        const revenueShare = Math.max(0, Math.min(0.8, Number(offer.revenueShare) || 0));
        const signature = {
            ...offer,
            amount,
            revenueShare,
            acceptedYear: year,
            acceptedWeek: this.week,
            signedAtWeek: this.year * 48 + (this.month - 1) * 4 + this.week,
            status: 'signed',
            latePenaltyPaid: 0
        };
        project.acceptedOffer = signature;
        project.offerRevenue = amount;
        this.funds += amount;
        if (offer.type === 'publisher_advance') {
            project.publisherRevenueShare = revenueShare;
            const deadlineWeeks = Math.max(8, Number(offer.deadlineWeeks) || 48);
            project.contractDeadlineWeek = signature.signedAtWeek + deadlineWeeks;
            project.contractLatePenaltyPerWeek = Math.max(0, Math.floor(offer.latePenaltyPerWeek || project.devCostTotal * 0.015));
            project.contractLatePenaltyCap = Math.max(project.contractLatePenaltyPerWeek, Math.floor(offer.latePenaltyCap || project.devCostTotal * 0.3));
        }
        if (offer.type === 'console_exclusive' || offer.type === 'digital_exclusive') {
            project.exclusiveWeeks = Math.max(0, Number(offer.exclusivityWeeks || offer.weeks) || 48);
            project.exclusiveStore = offer.company || offer.platformName || (offer.type === 'console_exclusive' ? 'Fabricante de consola' : 'Tienda Digital Exclusiva');
            project.exclusivePlatformId = offer.platformId || project.platform.id;
            project.platformRestriction = offer.platformRestriction || project.exclusiveStore;
            project.permittedPlatforms = offer.permittedPlatforms || offer.platforms || [project.platform.name];
            project.platformMarketingMultiplier = Math.max(1, Number(offer.marketingMultiplier) || (offer.type === 'console_exclusive' ? 1.35 : 1.15));
            if (offer.type === 'digital_exclusive') project.exclusivityReviewPenalty = 0.15;
        }
        if (offer.type === 'day_one_subscription') {
            project.directSalesMultiplier = Math.max(0, Math.min(1, Number(offer.directSalesMultiplier) || 0.2));
            project.subscriptionRevenueShare = revenueShare;
        }
        project.offers = [];
        this.notify();
        return { success: true, message: `Acuerdo firmado: ${offer.title}. Pago inmediato de $${amount.toLocaleString()}.` };
    }

    negotiateProjectOffer(offerId) {
        const project = this.currentProject;
        if (!project || project.acceptedOffer) return { success: false, message: 'No hay una oferta negociable.' };
        const offerIndex = project.offers.findIndex(item => item.id === offerId);
        if (offerIndex < 0) return { success: false, message: 'La oferta ya no está disponible.' };
        const offer = project.offers[offerIndex];
        const studioReputation = Math.max(0, Math.min(100, this.reputation || 50));
        const chance = Math.min(0.8, 0.2 + studioReputation / 200 + (project.overallProgress >= 80 ? 0.1 : 0));
        if (Math.random() > chance) {
            project.offers.splice(offerIndex, 1);
            this.notify();
            return { success: true, withdrawn: true, message: `${offer.company || 'La empresa'} retiró la oferta tras la negociación.` };
        }
        const boost = 1.08 + Math.random() * 0.12;
        offer.amount = Math.round((offer.amount || 0) * boost);
        if (offer.revenueShare) offer.revenueShare = Math.max(0, offer.revenueShare - 0.04);
        if (offer.latePenaltyPerWeek) offer.latePenaltyPerWeek = Math.max(0, Math.floor(offer.latePenaltyPerWeek * 0.85));
        offer.negotiated = true;
        offer.detail = `${offer.detail || ''} Términos renegociados: pago +${Math.round((boost - 1) * 100)}%.`;
        this.notify();
        return { success: true, withdrawn: false, message: 'La empresa acepta mejorar los términos. Revisa la oferta actualizada antes de firmar.' };
    }

    rejectProjectOffer(offerId) {
        const project = this.currentProject;
        if (!project || project.acceptedOffer) return { success: false, message: 'No hay una oferta pendiente.' };
        const count = project.offers.length;
        project.offers = project.offers.filter(item => item.id !== offerId);
        if (project.offers.length === count) return { success: false, message: 'La oferta ya no está disponible.' };
        project.rejectedOffers = project.rejectedOffers || [];
        project.rejectedOffers.push(offerId);
        this.notify();
        return { success: true, message: 'Oferta rechazada; el estudio conserva su independencia.' };
    }

    advanceDevTick(worldRef) {
        if (this.isPaused || !this.currentProject) return;

        const proj = this.currentProject;
        const speedMultiplier = this.gameSpeed;
        const workMode = this.workMode || 'normal';
        const isCrunch = proj.devMode === 'crunch' || (workMode === 'crunch' && proj.devMode !== 'refactor');
        const isRelaxed = workMode === 'relaxed';
        this.applyEmployeeWorkTick(workMode);
        const workingEmployees = this.employees.filter(emp => (emp.sickWeeksRemaining || 0) <= 0);

        // Current stage sliders focus (for backward-compatibility)
        const currentStageKey = proj.stage <= 3 ? `stage${proj.stage}` : 'stage3';
        const currentSliders = proj.sliders[currentStageKey] || {};

        let stageTechWeight = 0.5;
        let stageDesignWeight = 0.5;

        if (proj.stage === 1) {
            const eng = currentSliders.engine || 0.7;
            const sty = currentSliders.story || 0.5;
            stageTechWeight = 0.35 + (eng * 0.45);
            stageDesignWeight = 0.35 + (sty * 0.45);
        } else if (proj.stage === 2) {
            const ai = currentSliders.ai || 0.6;
            const dia = currentSliders.dialogues || 0.6;
            stageTechWeight = 0.35 + (ai * 0.45);
            stageDesignWeight = 0.35 + (dia * 0.45);
        } else if (proj.stage === 3) {
            const gfx = currentSliders.graphics || 0.8;
            const wld = currentSliders.worldDesign || 0.7;
            const snd = currentSliders.sound || 0.7;
            stageTechWeight = 0.35 + (gfx * 0.35);
            stageDesignWeight = 0.35 + ((wld + snd) * 0.25);
        }

        // --- TECHNICAL DEBT & DEV MODE PROCESSING ---
        let devSpeedMultiplier = 1.0;
        let debtTickResult = null;

        if (proj.techDebtModel) {
            if (proj.devMode === 'refactor') {
                proj.techDebtModel.setRefactorMode(true);
            } else if (isCrunch) {
                proj.techDebtModel.setCrunchMode(true);
            } else {
                proj.techDebtModel.setCrunchMode(false);
                proj.techDebtModel.setRefactorMode(false);
            }

            const activeNodesList = proj.scopeDAG ? proj.scopeDAG.getActiveNodes() : [];
            const inHouseEngine = proj.engineObj;
            const engineModifier = proj.pipelineType === 'inhouse'
                ? ((inHouseEngine && typeof inHouseEngine.isAffineGenre === 'function' && inHouseEngine.isAffineGenre(proj.genre.id)) ? 0.5 : 1.0)
                : 1.0;
            const qaPower = workingEmployees.reduce((acc, emp) => {
                let p = 0;
                if (emp.trait === 'Bug Hunter' || emp.trait === 'Cazador de Bugs') p += 25;
                if (emp.role && (emp.role.toLowerCase().includes('qa') || emp.role.toLowerCase().includes('tester'))) p += 35;
                return acc + p;
            }, 0);

            const burnoutRiskActive = this.employees.some(emp => (emp.energy ?? emp.stamina ?? 100) < 30);
            const perfectionistShare = workingEmployees.length
                ? workingEmployees.filter(emp => emp.trait === 'Perfeccionista' || emp.traits?.includes('Perfeccionista')).length / workingEmployees.length
                : 0;
            debtTickResult = proj.techDebtModel.simulateTick({
                staff: workingEmployees,
                activeNodes: activeNodesList,
                dagComplexity: proj.friction || 25,
                connectedCount: activeNodesList.length || 6,
                isLateStage: proj.stage >= 3,
                engineModifier: engineModifier * (proj.historicalIncompatibility?.multiplier || 1) * (1 - perfectionistShare) * (burnoutRiskActive ? 3 : 1),
                qaPower: qaPower,
                extraHours: isCrunch ? 3.0 : 0
            });

            // Punto 3.1: Penalización de velocidad y fricción acumulada
            devSpeedMultiplier = debtTickResult.speedMultiplier / (proj.historicalIncompatibility?.multiplier || 1); // 1.0 / accumulatedFriction
            proj.accumulatedFriction = debtTickResult.accumulatedFriction;
            proj.regressionRisk = debtTickResult.regressionRisk;
            proj.burnoutDebtMultiplier = burnoutRiskActive ? 3 : 1;

            // Punto 3.2: Gestión de eventos de regresión
            if (debtTickResult.regression) {
                proj.regressionsCount = (proj.regressionsCount || 0) + 1;
                proj.bugs += debtTickResult.regression.newBugs;
                proj.lastRegression = debtTickResult.regression;
                proj.lastRegressionTime = Date.now();
                if (worldRef && worldRef.spawnCodeParticle) worldRef.spawnCodeParticle('bug', 0);
                if (soundEngine) soundEngine.playBubble('bug');
            }
        }

        // Punto 4: Acción Activa "Refactorizar / Limpiar Código"
        // Mientras está activo, el equipo deja de avanzar en las características del juego (Progreso = 0%)
        if (proj.devMode === 'refactor') {
            if (Math.random() < 0.45 * speedMultiplier) {
                proj.bugs = Math.max(0, proj.bugs - 1);
                if (worldRef && worldRef.spawnCodeParticle) worldRef.spawnCodeParticle('research', 0);
            }
            this.employees.forEach(emp => {
                emp.stamina = Math.max(10, emp.stamina - 0.08 * speedMultiplier);
                emp.energy = emp.stamina;
            });
            this.notify();
            return;
        }

        // Effective Speed calculation with Crunch Time Boost & Technical Debt Penalties
        const crunchBoost = isCrunch ? 1.4 : 1.0;
        const workPaceMultiplier = isRelaxed ? 0.8 : 1.0;
        const staffPresenceMultiplier = Math.max(0.25, workingEmployees.length / Math.max(1, this.employees.length));
        const effectiveProgressSpeed = speedMultiplier * devSpeedMultiplier * crunchBoost * workPaceMultiplier * staffPresenceMultiplier;

        // Employees contribute points and progress across disciplines
        workingEmployees.forEach((emp, index) => {
            const isFatigued = (emp.energy ?? emp.stamina ?? 100) < 50;
            const isExhausted = emp.stamina < 10;

            if (!isExhausted) {
                // Stamina burn: crunch accelerates fatigue at 2.2x rate
                // Speed modifier drops if fatigued
                const isPerfectionist = emp.trait === 'Perfeccionista' || emp.traits?.includes('Perfeccionista');
                const juniorCount = workingEmployees.filter(member => member.experience === 'Junior').length;
                const isIsolated = (emp.trait === 'Lobo Solitario' || emp.traits?.includes('Lobo Solitario')) && juniorCount >= 2;
                const traitSpeedMultiplier = (isPerfectionist ? 0.8 : 1) * (isIsolated ? 0.8 : 1);
                const effectiveSpeed = (isFatigued ? emp.speed * 0.55 : emp.speed) * traitSpeedMultiplier;

                // Tech Points generation
                const techChance = 0.32 * effectiveSpeed * stageTechWeight;
                if (Math.random() < techChance) {
                    const techGained = Math.max(1, Math.ceil(emp.tech * 0.075 * stageTechWeight));
                    proj.techPoints += techGained;
                    if (worldRef && worldRef.spawnCodeParticle) worldRef.spawnCodeParticle('tech', index);
                    if (soundEngine && Math.random() < 0.18) soundEngine.playBubble('tech');
                }

                // Design Points generation
                const designChance = 0.32 * effectiveSpeed * stageDesignWeight;
                if (Math.random() < designChance) {
                    const designGained = Math.max(1, Math.ceil(emp.design * 0.075 * stageDesignWeight));
                    proj.designPoints += designGained;
                    if (worldRef && worldRef.spawnCodeParticle) worldRef.spawnCodeParticle('design', index);
                    if (soundEngine && Math.random() < 0.18) soundEngine.playBubble('design');
                }

                // DAG Discipline Progress contribution
                if (proj.scopeDAG) {
                    const uncompletedNodes = proj.scopeDAG.getActiveNodes().filter(n => !n.completed);
                    if (uncompletedNodes.length > 0) {
                        const targetNode = uncompletedNodes[0];
                        targetNode.disciplineProgress.engine += (emp.tech * 0.05 * effectiveProgressSpeed);
                        targetNode.disciplineProgress.gameplay += (emp.design * 0.05 * effectiveProgressSpeed);
                        targetNode.disciplineProgress.network += (emp.tech * 0.03 * effectiveProgressSpeed);
                        targetNode.disciplineProgress.art += (emp.design * 0.04 * effectiveProgressSpeed);
                        targetNode.disciplineProgress.qa += ((emp.tech + emp.design) * 0.02 * effectiveProgressSpeed);
                        targetNode.updateCompletionState();
                    }
                }

                // Bug Generation (Stages 1-3)
                if (proj.stage < 4) {
                    let bugChance = (0.16 / (1 + emp.tech * 0.025));
                    if (isFatigued) bugChance *= 2.0;
                    if (emp.trait === 'Bug Hunter') bugChance *= 0.6;
                    if (isCrunch) bugChance *= 1.8; // Crunch generates bugs faster

                    if (Math.random() < bugChance) {
                        proj.bugs += 1;
                        if (worldRef && worldRef.spawnCodeParticle) worldRef.spawnCodeParticle('bug', index);
                        if (soundEngine && Math.random() < 0.15) soundEngine.playBubble('bug');
                    }
                }

                // Bug Squashing during Stage 4 (Polish & Bugfix)
                if (proj.stage === 4 && proj.bugs > 0) {
                    let fixChance = 0.40 * effectiveSpeed;
                    if (emp.trait === 'Bug Hunter') fixChance *= 2.2;

                    if (Math.random() < fixChance) {
                        proj.bugs = Math.max(0, proj.bugs - 1);
                        if (worldRef && worldRef.spawnCodeParticle) worldRef.spawnCodeParticle('research', index);
                        if (soundEngine && Math.random() < 0.20) soundEngine.playBubble('research');
                    }
                }

                // Trickle Research Points
                if (Math.random() < 0.09) {
                    this.researchPoints += 1;
                }
            } else {
                // Employee is exhausted and takes a break
                emp.stamina = Math.min(emp.maxStamina, emp.stamina + 1.6 * speedMultiplier);
                emp.energy = emp.stamina;
            }
        });

        // Stage progress progression governed by technical debt speed multipliers
        proj.stageProgress += 2.2 * effectiveProgressSpeed;

        if (proj.scopeDAG) {
            const dagProgress = proj.scopeDAG.getOverallProgress();
            proj.overallProgress = Math.max(dagProgress, Math.min(100, Math.floor(((proj.stage - 1) * 33.3) + (proj.stageProgress / 3))));
        } else {
            proj.overallProgress = Math.min(100, Math.floor(((proj.stage - 1) * 33.3) + (proj.stageProgress / 3)));
        }

        if (proj.stageProgress >= 100) {
            proj.stageProgress = 0;
            if (proj.stage < 3) {
                proj.stage += 1;
                if (soundEngine) soundEngine.playClick();
            } else if (proj.stage === 3) {
                proj.stage = 4; // Polish & bugfix stage
                if (soundEngine) soundEngine.playClick();
            }
        }

        if (proj.overallProgress >= 50) this.generateProjectOffers();

        this.notify();
    }

    // --- REVIEW CALCULATION & GAME LAUNCH ---
    finishAndReleaseGame(options = {}) {
        if (!this.currentProject) return null;
        const proj = this.currentProject;
        const existingEarlyAccessGame = options.existingGameId
            ? this.gamesHistory.find(item => item.id === options.existingGameId)
            : null;
        if (proj.businessModel === 'early_access' && proj.launchPhase !== 'early_access' && !existingEarlyAccessGame) {
            return null;
        }

        // 1. Topic-Genre Synergy (0.60 to 1.35) via calculateSynergy matrix
        const synergyEvaluation = calculateSynergy(proj.genre.id, proj.topic.id);
        const topicSynergy = synergyEvaluation ? synergyEvaluation.multiplier : ((proj.topic.genreFit && proj.topic.genreFit[proj.genre.id]) || 1.0);

        // 2. Audience Compatibility
        // Topic target audience match
        const topicAudienceMatch = proj.topic.idealAudience === proj.targetAudience ? 1.15 : 0.90;
        // Platform target audience affinity
        const platformAudienceFit = (proj.platform.audienceFit && proj.platform.audienceFit[proj.targetAudience]) || 1.0;
        const audienceFactor = (topicAudienceMatch + platformAudienceFit) / 2; // ~0.85 to 1.20

        // 3. 3-Stage Slider Allocation Accuracy vs Genre Ideals
        const ideal = proj.genre;
        let sliderAccuracy = 0;
        let count = 0;

        ['stage1', 'stage2', 'stage3'].forEach((sKey) => {
            const idealStage = ideal[`ideal${sKey.charAt(0).toUpperCase() + sKey.slice(1)}`];
            const actualStage = proj.sliders[sKey] || {};
            for (let k in idealStage) {
                const diff = Math.abs(idealStage[k] - (actualStage[k] || 0.7));
                sliderAccuracy += Math.max(0, 1.0 - diff * 1.25);
                count++;
            }
        });
        const sliderScoreFactor = count > 0 ? (sliderAccuracy / count) : 0.8;

        // 4. Points Accumulation vs Era Target Expectation
        const pointsSum = proj.techPoints + proj.designPoints;
        const eraTarget = this.era === 1 ? 75 : (this.era === 2 ? 220 : 520);
        const pointsFactor = Math.min(1.45, pointsSum / eraTarget);

        // Current market trends give a small, temporary boost.
        let trendBoost = 0;
        let isTrendMatch = false;
        if (this.marketTrend && (this.marketTrend.topicId === proj.topic.id || this.marketTrend.genreId === proj.genre.id)) {
            trendBoost = 0.50;
            isTrendMatch = true;
        }

        // 8. DAG Architecture Synergies & Genre Fits
        let synergyBonus = 0;
        let synergyQualityMultiplier = 1.0;
        let activeSynergiesList = [];
        if (proj.scopeDAG) {
            const syn = proj.scopeDAG.calculateSynergies(proj.genre.id);
            synergyBonus = syn.synergyScoreBonus || 0;
            synergyQualityMultiplier = syn.qualityMultiplier || 1.0;
            activeSynergiesList = syn.synergies || [];
        }

        // 9. Technical Debt Launch Penalties & Server Stability (Punto 5)
        let debtPenalties = {
            reviewScoreBonus: 0,
            reviewScorePenalty: 0,
            fpsDrops: false,
            serverCrashRisk: 0,
            desktopCrashes: false,
            refundRate: 0.0,
            requiresEmergencyPatch: false,
            criticalFlaws: [],
            launchStabilityStatus: 'smooth'
        };
        if (proj.techDebtModel) {
            const netcodeNode = proj.scopeDAG ? proj.scopeDAG.getActiveNodes().find(n => n.category === 'netcode') : null;
            const netcodeId = netcodeNode ? netcodeNode.id : 'net_singleplayer';
            debtPenalties = proj.techDebtModel.calculateLaunchPenalties(netcodeId, proj.platform.id);
        }

        // Each reviewer sees the same underlying quality, but has an independent opinion.
        const currentRawDebt = Math.max(0, proj.techDebtModel?.rawDebt || 0);
        const year = this.getHistoricalYear();
        const engineYear = proj.engineObj?.releaseYear ?? (proj.engineObj?.createdYear != null ? 1981 + proj.engineObj.createdYear : null);
        const engineAge = engineYear == null ? Infinity : Math.max(0, year - engineYear);
        const previous = (this.gamesHistory || []).find(game => game.id !== options.existingGameId);
        const repeated = previous && (previous.genreId === proj.genre.id || previous.genre === proj.genre.name) &&
            (previous.topicId === proj.topic.id || previous.topic === proj.topic.name);
        const successes = (this.gamesHistory || []).filter(game => game.id !== options.existingGameId && game.score >= 8).length;
        const expectationPenalty = Math.min(1.5, successes * 0.18 + Math.max(0, year - 1981) * 0.012) +
            (previous?.score >= 8.5 ? 0.8 : 0);
        const debtPenalty = currentRawDebt <= 15 ? 0 : currentRawDebt <= 35 ? 1 : Math.min(5, 3 + (currentRawDebt - 35) * 0.04);
        const enginePenalty = Number.isFinite(engineAge) ? Math.min(1.5, Math.max(0, engineAge - 2) * 0.2) : 0.5;
        const engineObsolescencePenalty = enginePenalty;
        const repetitionPenalty = repeated ? 1.8 : 0;
        const quality = Math.min(1.45, pointsFactor) * 1.6 + sliderScoreFactor * 0.9;
        const affinity = (topicSynergy - 0.8) * 1.8 + (audienceFactor - 1) * 0.8;
        const baseScore = 5 + quality + affinity + Math.min(0.3, synergyBonus) + Math.min(0.15, trendBoost) -
            debtPenalty - enginePenalty - repetitionPenalty - expectationPenalty - Math.min(2, Math.max(0, proj.bugs || 0) * 0.08);
        const masterpiece = topicSynergy >= 1.25 && engineAge < 2 && proj.bugs === 0 && currentRawDebt < 5 &&
            !repeated && baseScore > Math.max(8.8, (previous?.score || 0) + 0.2);
        const gaussian = () => {
            const u = Math.max(Number.MIN_VALUE, Math.random());
            return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()) * 0.6;
        };
        const weakness = debtPenalty ? `Los bugs y la falta de optimización empañan la experiencia (deuda ${Math.round(currentRawDebt)}: -${debtPenalty.toFixed(1)} puntos).`
            : enginePenalty >= 0.4 ? `El motor gráfico se siente anticuado para los estándares actuales (-${enginePenalty.toFixed(1)} puntos).`
            : repeated ? `La combinación de temática y género se repite y pierde originalidad (-${repetitionPenalty.toFixed(1)} puntos).`
            : topicSynergy < 1 ? 'La combinación de temática y género resulta confusa y poco atractiva.'
            : expectationPenalty >= 0.5 ? `El juego no supera las expectativas del mercado (-${expectationPenalty.toFixed(1)} puntos).`
            : 'La producción y el diseño necesitan más pulido para destacar.';
        const calculateReviews = () => [
            ['GameByte Tech', '⚡'], ['Polygon Star', '⭐'], ['AllGames Hub', '🎮'], ['Digital Forge', '🔥']
        ].map(([critic, avatar]) => {
            const score = Math.max(0, Math.min(masterpiece ? 10 : 9.4, Math.round((baseScore + gaussian()) * 10) / 10));
            return { critic, avatar, score, comment: score < 7 ? weakness : score < 9.5
                ? 'Un título sólido y divertido, aunque le falta un punto de innovación para ser legendario.'
                : 'Una obra excepcional que supera las expectativas del estudio.' };
        });
        const reviews = calculateReviews();

        const reputationDelta = ['f2p', 'live_service'].includes(proj.businessModel)
            ? (proj.monetizationStyle === 'aggressive' ? -0.8 : 0.45)
            : 0;
        if (reputationDelta) {
            reviews.forEach(review => { review.score = Math.max(2, Math.min(10, Math.round((review.score + reputationDelta) * 10) / 10)); });
        }
        if (proj.exclusivityReviewPenalty) {
            reviews.forEach(review => { review.score = Math.max(2, Math.min(10, Math.round((review.score - proj.exclusivityReviewPenalty) * 10) / 10)); });
        }
        reviews.forEach(review => { review.score = Math.min(masterpiece ? 10 : 9.4, review.score); });
        const scoreBeforeDowngrade = reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length;
        const trailerDowngradePenalty = proj.trailerQuality && scoreBeforeDowngrade < proj.trailerQuality - 1.5 ? 0.6 : 0;
        if (trailerDowngradePenalty) {
            reviews.forEach(review => {
                review.score = Math.max(2, Math.round((review.score - trailerDowngradePenalty) * 10) / 10);
            });
        }
        reviews.forEach((review, index) => {
            if (review.score < 7) review.comment = ['Análisis técnico: ', 'Diseño y temática: ', 'Experiencia de juego: ', 'Valoración general: '][index] + weakness;
            else if (review.score < 9.5) review.comment = 'Un título sólido y divertido, aunque le falta un punto de innovación para ser legendario.';
        });
        const finalScore = Math.round((reviews.reduce((acc, review) => acc + review.score, 0) / 4) * 10) / 10;
        const reviewBombReasons = [];
        if (currentRawDebt > 35) reviewBombReasons.push('Deuda técnica crítica superior a 35 puntos');
        if (proj.businessModel === 'f2p' && proj.monetizationStyle === 'aggressive') reviewBombReasons.push('Microtransacciones Pay-to-Win agresivas');
        const userApproval = Math.max(0, Math.min(100, Math.round(
            50 + (finalScore - 5) * 8 + (proj.demoConversionBonus ? 3 : 0) -
            (reviewBombReasons.length * 28) - (proj.bugs > 8 ? 12 : 0)
        )));
        const reviewBombing = reviewBombReasons.length > 0;
        const socialFeed = [];
        const addSocialPost = (author, icon, text, sentiment) => socialFeed.push({
            author, icon, text, sentiment, time: `${this.getHistoricalYear()} · Lanzamiento`, kind: 'launch_reaction'
        });
        const sample = messages => messages[Math.floor(Math.random() * messages.length)];
        if (reviewBombing) {
            addSocialPost('@PatchPlease', '[[DE_ICON_014]]', sample([
                `El lanzamiento de ${proj.name} está lleno de problemas. No lo recomiendo hasta que arreglen esto.`,
                `La comunidad está dejando reseñas negativas a ${proj.name}: ${reviewBombReasons.join(' y ').toLowerCase()}.`,
                `Mucho hype para ${proj.name}, pero los problemas técnicos/monetización nos echaron del juego.`
            ]), 'negative');
            addSocialPost('@PlayersFirst', '[[DE_ICON_100]]', sample([
                `Las reseñas de usuarios de ${proj.name} caen en picado tras el lanzamiento.`,
                `No gasten su dinero todavía: ${proj.name} necesita cambios urgentes.`
            ]), 'negative');
        } else if (userApproval >= 80) {
            addSocialPost('@RetroFan', '[[DE_ICON_005]]', sample([
                `${proj.name} cumple lo prometido. Ya se lo recomendé a mis amigos.`,
                `Llevo horas con ${proj.name}; gran lanzamiento y una comunidad muy contenta.`,
                `Las reseñas de usuarios de ${proj.name} son muy positivas. ¡Se nota el cuidado!`
            ]), 'positive');
            addSocialPost('@GameShelf', '[[DE_ICON_101]]', sample([
                `${proj.name} tiene potencial para quedarse en mi biblioteca mucho tiempo.`,
                `Buen rendimiento y una idea fresca: ${proj.name} merece más atención.`
            ]), 'positive');
        } else if (userApproval < 70) {
            addSocialPost('@MixedReviews', '[[DE_ICON_102]]', sample([
                `Las reseñas de ${proj.name} están divididas; esperábamos más del lanzamiento.`,
                `${proj.name} tiene buenas ideas, pero hay problemas que frenan la recomendación.`,
                `Por ahora, las reseñas de usuarios de ${proj.name} son mixtas.`
            ]), 'mixed');
        } else {
            addSocialPost('@PlayerOne', '[[DE_ICON_103]]', `${proj.name} es entretenido; veremos cómo responde el estudio a los comentarios.`, 'mixed');
        }
        if (trailerDowngradePenalty) {
            addSocialPost('@TrailerVsGame', '[[DE_ICON_104]]', `El trailer de ${proj.name} se veía mejor que la versión final. La comunidad habla de downgrade.`, 'negative');
        }
        const marketingFeed = [...(proj.marketingFeed || [])];
        if ((proj.marketingHype || 0) >= 10) {
            marketingFeed.push({
                author: 'Redacción GameWire', icon: '[[DE_ICON_033]]',
                text: `${proj.name} llega con ${Math.round(proj.marketingHype)} puntos de hype y ${Number(proj.wishlists || 0).toLocaleString()} wishlists.`,
                time: `${this.getHistoricalYear()} · Lanzamiento`, kind: 'launch_campaign'
            });
        }
        if (proj.wishlists > 0) {
            marketingFeed.push({
                author: 'Festival Digital', icon: '[[DE_ICON_001]]',
                text: `La demo de ${proj.name} convirtió parte de sus ${Number(proj.wishlists).toLocaleString()} wishlists en compras durante el lanzamiento.`,
                time: `${this.getHistoricalYear()} · Lanzamiento`, kind: 'wishlist_conversion'
            });
        }
        if (trailerDowngradePenalty) {
            marketingFeed.push({
                author: 'Game Expo Live', icon: '[[DE_ICON_104]]',
                text: `Downgrade detectado: ${proj.name} no alcanzó la calidad que prometía el trailer.`,
                time: `${this.getHistoricalYear()} · Lanzamiento`, kind: 'trailer_downgrade'
            });
        }

        // A physical publisher contract has a firm delivery date. Late fees are
        // charged once at the 1.0 release and capped to keep the clause survivable.
        const contractLateWeeks = proj.contractDeadlineWeek
            ? Math.max(0, this.year * 48 + (this.month - 1) * 4 + this.week - proj.contractDeadlineWeek)
            : 0;
        const contractLatePenalty = !existingEarlyAccessGame && contractLateWeeks
            ? Math.min(proj.contractLatePenaltyCap || 0, contractLateWeeks * (proj.contractLatePenaltyPerWeek || 0))
            : 0;
        if (contractLatePenalty) this.funds -= contractLatePenalty;

        // --- REALISTIC SALES PROJECTIONS & ERA SCALING ---
        const referencePrice = this.era === 1 ? 12 : (this.era === 2 ? 28 : 55);
        const basePrice = proj.businessModel === 'f2p' || proj.businessModel === 'live_service' ? 0 : referencePrice;
        const eraSalesFactor = this.era === 1 ? 85 : (this.era === 2 ? 280 : 950);
        const launchPlatform = this.getPlatformById(proj.platform.id) || proj.platform;
        const marketShareBonus = (launchPlatform.marketShare ?? 0.1) + 0.25;
        const trendSalesMultiplier = isTrendMatch ? 1.35 : 1.0;

        let totalSalesPotential = Math.floor(
            Math.pow(finalScore / 2.2, 3.85) * eraSalesFactor * marketShareBonus * trendSalesMultiplier * synergyQualityMultiplier
        );
        const marketingHype = Math.max(0, Math.min(100, proj.marketingHype || 0));
        const marketingMultiplier = 1 + Math.min(0.35, marketingHype / 250) + Math.min(0.1, (proj.brandAwareness || 0) / 1000) + Math.max(0, proj.demoConversionBonus || 0);
        totalSalesPotential = Math.floor(totalSalesPotential * marketingMultiplier);
        const convertedWishlists = Math.floor((proj.wishlists || 0) * (proj.demoConversionBonus > 0.15 ? 0.22 : 0.12));
        totalSalesPotential += convertedWishlists;
        const userReviewSalesMultiplier = reviewBombing ? 0.55 : (userApproval >= 80 ? 1.2 : (userApproval < 70 ? 0.72 : 1));
        totalSalesPotential = Math.floor(totalSalesPotential * userReviewSalesMultiplier);

        // Technical debt crash penalty on sales & purchase refunds (Punto 5)
        let refundsLost = 0;
        if (debtPenalties.refundRate > 0) {
            refundsLost = Math.floor(totalSalesPotential * debtPenalties.refundRate);
            totalSalesPotential = Math.max(10, totalSalesPotential - refundsLost);
        }
        if (debtPenalties.serverCrashRisk > 0.40) {
            totalSalesPotential = Math.floor(totalSalesPotential * 0.70);
        }

        // Fanbase loyalty multiplier
        totalSalesPotential += Math.floor(this.fans * (this.era === 1 ? 1.8 : (this.era === 2 ? 3.5 : 8.0)));

        // Poor reviews also suppress loyal-fan purchases and wishlist conversions.
        if (finalScore < 6) {
            totalSalesPotential = Math.floor(totalSalesPotential * Math.max(0.18, 0.30 + (finalScore - 4) * 0.10));
        }

        // In the physical era, a small studio can self-publish locally, but has
        // to finance manufacturing and distribution stock itself. A publisher
        // advance covers that burden; only independent releases pay this cost.
        const historicalYear = this.getHistoricalYear();
        const physicalSelfPublished = historicalYear >= 1982 && historicalYear <= 1994 &&
            proj.acceptedOffer?.type !== 'publisher_advance';
        const physicalManufacturingCost = physicalSelfPublished
            ? Math.floor(proj.devCostTotal * 0.15 + totalSalesPotential * 0.45 * referencePrice * 0.25)
            : 0;
        if (physicalSelfPublished) {
            totalSalesPotential = Math.floor(totalSalesPotential * 0.45);
            // The studio fronts the full manufacturing bill at release; the
            // balance is intentionally allowed to go negative to model risk.
            this.funds -= physicalManufacturingCost;
        }

        const postLaunchReleaseWeek = proj.postLaunchContent === 'expansion' ? 24 : (proj.postLaunchContent === 'dlc' ? 12 : (proj.postLaunchContent === 'season_pass' ? 4 : 0));

        const releasedGame = {
            id: 'game_' + Date.now(),
            name: proj.name,
            topic: proj.topic.name,
            topicId: proj.topic.id,
            genre: proj.genre.name,
            genreId: proj.genre.id,
            platform: proj.platform.name,
            platformId: proj.platform.id,
            targetAudience: proj.targetAudience,
            engine: (proj.engineObj && proj.engineObj.name) || (proj.engine && proj.engine.name) || 'Custom Engine',
            techPoints: proj.techPoints,
            designPoints: proj.designPoints,
            bugsAtRelease: proj.bugs,
            score: finalScore,
            synergyFit: synergyEvaluation ? synergyEvaluation.fit : 'NORMAL',
            synergyMultiplier: topicSynergy,
            reviews: reviews,
            pressScore: finalScore,
            masterpieceEligible: masterpiece,
            userApproval,
            communityLoyalty: userApproval,
            reviewBombing,
            reviewBombReasons,
            socialFeed: socialFeed.slice(-8),
            marketingFeed: marketingFeed.slice(-8),
            moddingApiIncluded: Boolean(
                proj.moddingApiIncluded ||
                (this.getHistoricalYear() >= 2004 && !!this.techTreeManager?.isUnlocked('sys_modding') &&
                    !!proj.scopeDAG?.getActiveNodes?.().some(node => node.id === 'sys_modding'))
            ),
            workshop: {
                enabled: false,
                popularMods: 0,
                totalConversions: 0,
                engagement: 0,
                compatibilityBroken: false,
                nextModEventWeek: 8,
                weeksRemaining: 0,
                mods: []
            },
            marketingHype,
            marketingMultiplier,
            brandAwareness: proj.brandAwareness || 0,
            wishlists: proj.wishlists || 0,
            wishlistsConverted: convertedWishlists,
            marketingActions: proj.marketingActions || [],
            marketingCostTotal: proj.marketingCostTotal || 0,
            trailerQuality: proj.trailerQuality || null,
            downgradeRisk: !!proj.downgradeRisk,
            trailerDowngradePenalty,
            creatorKeyCampaign: proj.creatorKeyCampaign || [],
            creatorCampaignCost: proj.creatorCampaignCost || 0,
            basePrice: basePrice,
            referencePrice,
            businessModel: proj.businessModel || 'premium',
            monetizationStyle: proj.monetizationStyle || 'cosmetic',
            postLaunchContent: proj.postLaunchContent || 'none',
            supportsPatches: proj.supportsPatches !== false,
            lifecycleState: proj.businessModel === 'early_access' ? 'early_access' : ((proj.businessModel === 'f2p' || proj.businessModel === 'live_service') ? 'live' : 'premium'),
            isEarlyAccess: proj.businessModel === 'early_access',
            officialReleased: false,
            betaPotential: proj.businessModel === 'early_access' ? Math.floor(totalSalesPotential * 0.4) : 0,
            officialPotential: proj.businessModel === 'early_access' ? totalSalesPotential - Math.floor(totalSalesPotential * 0.4) : 0,
            officialWeeksOnMarket: 0,
            communityPatience: 100,
            weeksWithoutContentPatch: 0,
            installationsTotal: 0,
            mau: 0,
            conversionRate: proj.monetizationStyle === 'aggressive' ? 0.04 : 0.02,
            monthlyNetBalance: 0,
            monthlyServiceRevenue: 0,
            monthlyServiceCosts: 0,
            lifetimeServiceRevenue: 0,
            lifetimeServiceCosts: 0,
            serviceBaseMonthlyCost: proj.businessModel === 'live_service' ? 25000 : ((proj.businessModel === 'f2p') ? 9000 : 0),
            servicePerUserMonthlyCost: 0.03,
            supportMonthlyCost: this.employees.reduce((sum, employee) => sum + (employee.salary || 0), 0) * 0.25,
            serversClosed: false,
            nextSeasonWeek: 12,
            season: 0,
            directSalesMultiplier: proj.directSalesMultiplier || 1,
            publisherRevenueShare: proj.publisherRevenueShare || 0,
            subscriptionRevenueShare: proj.subscriptionRevenueShare || 0,
            exclusiveWeeks: proj.exclusiveWeeks || 0,
            exclusiveStore: proj.exclusiveStore || null,
            exclusivePlatformId: proj.exclusivePlatformId || null,
            platformRestriction: proj.platformRestriction || null,
            permittedPlatforms: proj.permittedPlatforms || [proj.platform.name],
            platformMarketingMultiplier: proj.platformMarketingMultiplier || 1,
            exclusivityReviewPenalty: proj.exclusivityReviewPenalty || 0,
            acceptedOffer: proj.acceptedOffer || null,
            upfrontOfferRevenue: proj.offerRevenue || 0,
            distributionModel: physicalSelfPublished ? 'self_published_physical' : (proj.acceptedOffer?.type === 'publisher_advance' ? 'publisher_physical' : null),
            physicalManufacturingCost,
            contractDeadlineWeek: proj.contractDeadlineWeek || null,
            contractLateWeeks,
            contractLatePenalty,
            unitsSoldTotal: 0,
            unitsSoldLastWeek: 0,
            revenueTotal: 0,
            devCost: proj.devCostTotal,
            profit: (proj.offerRevenue || 0) - proj.devCostTotal - contractLatePenalty - physicalManufacturingCost - (proj.marketingCostTotal || 0),
            weeksOnMarket: 0,
            maxWeeks: Math.max(10 + (finalScore >= 8.5 ? 4 : 0), postLaunchReleaseWeek + 4),
            salesPotential: totalSalesPotential,
            decayRate: finalScore >= 8.5 ? 0.78 : (finalScore >= 7.0 ? 0.72 : 0.62),
            reported: false,
            // Pipeline & Tech Debt Record
            pipelineType: proj.pipelineType || 'inhouse',
            royaltyRate: (proj.engineObj && proj.engineObj.royaltyRate) || 0,
            platformRoyaltyRate: proj.platform.royaltyRate || 0,
            launchMarketShare: launchPlatform.marketShare ?? 0.1,
            platformRoyaltiesPaidTotal: 0,
            engineObsolescencePenalty,
            royaltiesPaidTotal: 0,
            techDebtAtRelease: proj.techDebtModel ? Math.round(proj.techDebtModel.accumulatedDebt * 10) / 10 : 0,
            regressionsSuffered: proj.regressionsCount || 0,
            synergies: activeSynergiesList,
            launchStabilityStatus: debtPenalties.launchStabilityStatus,
            refundsLost: refundsLost,
            refundRate: debtPenalties.refundRate || 0
        };

        if (existingEarlyAccessGame) {
            const reservedOfficialPotential = existingEarlyAccessGame.officialPotential;
            Object.assign(existingEarlyAccessGame, {
                score: releasedGame.score,
                pressScore: releasedGame.pressScore,
                reviews: releasedGame.reviews,
                userApproval: releasedGame.userApproval,
                communityLoyalty: releasedGame.communityLoyalty,
                reviewBombing: releasedGame.reviewBombing,
                reviewBombReasons: releasedGame.reviewBombReasons,
                socialFeed: [...(existingEarlyAccessGame.socialFeed || []), ...(releasedGame.socialFeed || [])].slice(-10),
                marketingFeed: [...(existingEarlyAccessGame.marketingFeed || []), ...(releasedGame.marketingFeed || [])].slice(-10),
                moddingApiIncluded: releasedGame.moddingApiIncluded || existingEarlyAccessGame.moddingApiIncluded,
                marketingHype: releasedGame.marketingHype,
                marketingActions: releasedGame.marketingActions,
                wishlists: releasedGame.wishlists,
                wishlistsConverted: releasedGame.wishlistsConverted,
                marketingCostTotal: releasedGame.marketingCostTotal,
                techPoints: releasedGame.techPoints,
                designPoints: releasedGame.designPoints,
                bugsAtRelease: releasedGame.bugsAtRelease,
                officialPotential: Math.max(reservedOfficialPotential || 0, releasedGame.officialPotential || 0),
                officialReleased: true,
                lifecycleState: 'live',
                officialWeeksOnMarket: 0,
                officialReleaseYear: this.getHistoricalYear(),
                weeksWithoutContentPatch: 0,
                communityPatience: Math.min(100, (existingEarlyAccessGame.communityPatience || 100) + 20)
            });
            this.currentProject = null;
            this.notify();
            return existingEarlyAccessGame;
        }

        // Activación del Modo Parche de Emergencia Post-Lanzamiento si deuda crítica
        if (debtPenalties.requiresEmergencyPatch) {
            this.isEmergencyPatchActive = true;
            this.emergencyPatchData = {
                gameId: releasedGame.id,
                gameName: releasedGame.name,
                currentDebt: currentRawDebt,
                targetDebt: 20,
                refundRate: debtPenalties.refundRate,
                serverCrash: debtPenalties.serverCrashRisk > 0,
                flaws: debtPenalties.criticalFlaws,
                debtModel: proj.techDebtModel
            };
        }

        if (['f2p', 'live_service'].includes(releasedGame.businessModel)) {
            const activeServiceTitles = this.activeSales.filter(item => ['f2p', 'live_service'].includes(item.businessModel) && !item.serversClosed);
            const studioSupportBudget = this.employees.reduce((sum, employee) => sum + (employee.salary || 0), 0) * 0.25;
            const supportShare = studioSupportBudget / (activeServiceTitles.length + 1);
            activeServiceTitles.forEach(item => { item.supportMonthlyCost = supportShare; });
            releasedGame.supportMonthlyCost = supportShare;
        }
        if (typeof this.resolveCreatorCampaign === 'function') {
            const creatorReactions = this.resolveCreatorCampaign(releasedGame);
            creatorReactions.forEach(reaction => {
                releasedGame.socialFeed.push({
                    author: reaction.creatorName || 'Creador de contenido',
                    icon: reaction.enjoyed ? '[[DE_ICON_003]]' : '[[DE_ICON_105]]',
                    text: reaction.reaction || `${reaction.creatorName || 'Un creador'} probó el juego y reunió ${Number(reaction.viewers || 0).toLocaleString()} espectadores.`,
                    sentiment: reaction.enjoyed ? 'positive' : 'mixed',
                    time: `${this.getHistoricalYear()} · Lanzamiento`,
                    kind: 'streamer_reaction'
                });
            });
            releasedGame.socialFeed = releasedGame.socialFeed.slice(-10);
        }
        this.gamesHistory.unshift(releasedGame);
        this.activeSales.push(releasedGame);

        // Fan growth based on score
        const loyaltyMultiplier = userApproval >= 80 ? 1.2 : (userApproval < 70 ? 0.65 : 1);
        const newFans = Math.floor(Math.max(0, (finalScore - 4.5) * (this.era === 1 ? 25 : (this.era === 2 ? 65 : 180))) * loyaltyMultiplier);
        this.fans += newFans;

        // Launch learning RP bonus based on score and technical scope
        const launchRP = Math.max(12, Math.floor(10 + (finalScore * 2.5) + (proj.techPoints / 15)));
        this.researchPoints += launchRP;
        releasedGame.launchRPGain = launchRP;

        // Sound fanfare
        if (soundEngine) {
            soundEngine.playFanfare(finalScore);
        }

        if (proj.businessModel === 'early_access' && proj.launchPhase === 'early_access') {
            proj.launchPhase = 'beta_live';
            proj.earlyAccessGameId = releasedGame.id;
        } else {
            this.currentProject = null;
        }
        this.notify();

        return releasedGame;
    }

    // --- WEEKLY SALES & ECONOMIC SIMULATION ---
    launchEarlyAccess() {
        const project = this.currentProject;
        if (!project || project.businessModel !== 'early_access') return { success: false, message: 'Este proyecto no está configurado para Acceso Anticipado.' };
        if (project.overallProgress < 50 || project.overallProgress > 80) return { success: false, message: 'El Acceso Anticipado se desbloquea entre el 50% y el 80% de progreso.' };
        project.launchPhase = 'early_access';
        const game = this.finishAndReleaseGame();
        return game ? { success: true, game, message: `Beta de "${game.name}" publicada.` } : { success: false, message: 'No se pudo publicar la beta.' };
    }

    launchOfficialVersion(gameId) {
        const game = this.gamesHistory.find(item => item.id === gameId);
        if (!game || !game.isEarlyAccess || game.officialReleased) return { success: false, message: 'No hay una beta pendiente para lanzar.' };
        if (game.weeksOnMarket < 8) return { success: false, message: 'La comunidad debe probar la beta durante al menos 8 semanas.' };
        if (!this.currentProject || this.currentProject.earlyAccessGameId !== gameId || this.currentProject.stage < 4) {
            return { success: false, message: 'Completa la producción y el pulido de la versión 1.0 antes de cerrar la beta.' };
        }
        const finished = this.finishAndReleaseGame({ existingGameId: gameId });
        return finished ? { success: true, game: finished, message: `[[DE_ICON_024]] ¡"${game.name}" ya está en su versión 1.0!` } : { success: false, message: 'No se pudo publicar la versión 1.0.' };
    }

    getModdingStatus(gameId) {
        const game = this.gamesHistory.find(item => item.id === gameId);
        if (!game) return { success: false, available: false, eligible: false, enabled: false, requiresApiNode: true, yearRequired: 2000, status: 'Juego no encontrado', workshop: null };
        const year = this.getHistoricalYear();
        const nodeResearched = !!this.techTreeManager?.isUnlocked('sys_modding') || (this.researchedTechs || []).includes('sys_modding');
        const eligible = year >= 2000 && nodeResearched;
        const workshop = game.workshop || {
            enabled: false, popularMods: 0, totalConversions: 0, engagement: 0,
            compatibilityBroken: false, nextModEventWeek: (game.weeksOnMarket || 0) + 8,
            weeksRemaining: 0, mods: []
        };
        let status = 'Requiere herramientas investigadas y año 2000 o posterior';
        if (year < 2000) status = '[[DE_ICON_093]] Bloqueado: El modding formal con soporte oficial no existía en los 80/90. Disponible a partir del año 2000';
        else if (!nodeResearched) status = '[[DE_ICON_093]] Requiere investigar "Herramientas de Modding / SDK Comunitario" en I+D';
        else if (workshop.enabled && workshop.compatibilityBroken) status = '[[DE_ICON_016]] Compatibilidad rota por el último parche; publica herramientas de actualización';
        else if (workshop.enabled) status = '[[DE_ICON_149]] Workshop comunitario activo (+150% ventas residuales)';
        else if (game.serversClosed) status = 'El juego está discontinuado';
        else if (game.moddingApiIncluded) status = 'Listo para activar Workshop oficial (Arquitectura integrada)';
        else status = 'Listo para integrar API oficial de Workshop';

        return {
            success: true,
            available: eligible,
            eligible,
            enabled: !!workshop.enabled,
            requiresApiNode: !game.moddingApiIncluded,
            yearRequired: 2000,
            status,
            workshop
        };
    }

    enableCommunityWorkshop(gameId) {
        const game = this.gamesHistory.find(item => item.id === gameId);
        if (!game) return { success: false, message: 'Juego no encontrado.' };
        const status = this.getModdingStatus(gameId);
        if (!status.eligible) return { success: false, message: status.status };
        if (game.serversClosed) return { success: false, message: 'No se puede activar el Workshop con los servidores cerrados.' };
        if (game.workshop?.enabled) return { success: false, message: 'El Workshop de la comunidad ya está activo.' };

        const baseIntegrationCost = game.moddingApiIncluded ? 8000 : 15000;
        const cost = baseIntegrationCost + (this.employees.length * 1000);
        if (this.funds < cost) return { success: false, message: `Fondos insuficientes para publicar las herramientas de modding ($${cost.toLocaleString()}).` };
        this.funds -= cost;

        game.moddingApiIncluded = true;
        game.workshop = {
            enabled: true,
            popularMods: 0,
            totalConversions: 0,
            engagement: Math.max(25, Math.min(65, Math.round((game.userApproval || (game.score || 5) * 10) * 0.45))),
            compatibilityBroken: false,
            nextModEventWeek: Math.max(4, (game.weeksOnMarket || 0) + 4),
            weeksRemaining: 156, // 3 años ficticios de vida útil extendida garantizada
            mods: [],
            originalMaxWeeks: game.maxWeeks || 14,
            activatedYear: this.getHistoricalYear()
        };
        game.maxWeeks = Math.max(game.maxWeeks || 0, game.weeksOnMarket + 156);
        if (!this.activeSales.some(item => item.id === game.id)) this.activeSales.push(game);
        game.lifecycleState = 'community_supported';
        game.marketingFeed = [...(game.marketingFeed || []), {
            author: 'Community Workshop', icon: '[[DE_ICON_015]]',
            text: `El estudio publicó la API y herramientas oficiales de modding para ${game.name}. ¡La comunidad arranca con fuerza!`,
            time: `${this.getHistoricalYear()} · Workshop`, kind: 'workshop_enabled'
        }].slice(-10);

        if (soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
        this.notify();
        return {
            success: true,
            message: `[[DE_ICON_034]] ¡Workshop oficial activado para "${game.name}"! Coste: $${cost.toLocaleString()}. La comunidad prolongará la vida útil durante 3 años de juego.`,
            game
        };
    }

    publishModToolsUpdate(gameId) {
        const game = this.gamesHistory.find(item => item.id === gameId);
        if (!game?.workshop?.enabled) return { success: false, message: 'Este juego no tiene Workshop activo.' };
        if (!game.workshop.compatibilityBroken) return { success: false, message: 'La compatibilidad de los mods con la versión actual ya está intacta.' };
        const cost = 6000 + Math.max(0, game.workshop.popularMods || 0) * 1200;
        if (this.funds < cost) return { success: false, message: `Fondos insuficientes para actualizar el SDK de herramientas ($${cost.toLocaleString()}).` };
        this.funds -= cost;

        game.workshop.compatibilityBroken = false;
        game.workshop.engagement = Math.min(100, (game.workshop.engagement || 0) + 20);
        game.workshop.mods = (game.workshop.mods || []).map(mod => ({ ...mod, compatible: true, updatedAtWeek: game.weeksOnMarket }));
        this.adjustGameReviews(game, 0.15);
        game.socialFeed = [...(game.socialFeed || []), {
            author: '@ModdersUnited', icon: '[[DE_ICON_106]]',
            text: `El estudio publicó el SDK y herramientas de actualización para los mods de ${game.name}. ¡Compatibilidad restaurada al 100%!`,
            sentiment: 'positive', time: `${this.getHistoricalYear()} · Workshop`, kind: 'mod_tools_update'
        }].slice(-10);

        if (soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
        this.notify();
        return {
            success: true,
            message: `[[DE_ICON_015]] Herramientas de actualización publicadas para "${game.name}" por $${cost.toLocaleString()}. Compatibilidad de mods restaurada y moral comunitaria recuperada.`,
            game
        };
    }

    processCommunityWorkshopWeek(game) {
        const workshop = game?.workshop;
        if (!workshop?.enabled || workshop.weeksRemaining <= 0) return { multiplier: 1, active: false };
        workshop.weeksRemaining = Math.max(0, workshop.weeksRemaining - 1);
        const ageWeeks = game.weeksOnMarket || 0;

        // Crecimiento orgánico de mods cada 8-12 semanas
        if (ageWeeks >= workshop.nextModEventWeek) {
            workshop.nextModEventWeek = ageWeeks + 10;
            const quality = Math.max(0, Math.min(1, ((game.userApproval || 50) / 100) * 0.65 + ((game.score || 5) / 10) * 0.35));
            if (Math.random() < 0.45 + quality * 0.40) {
                const modNumber = (workshop.mods || []).length + 1;
                const isPopular = Math.random() < 0.38 + quality * 0.38;
                const modNames = isPopular
                    ? ['Community Overhaul Expansion', 'Enhanced Graphic Overhaul HD', 'Unofficial Balance & Bugfix Patch', 'New Realm Questline', 'Total Weapon & Skill Rebalance']
                    : [`Minor Cosmetic Pack #${modNumber}`, `UI Tweaks v${modNumber}.0`, `Custom Sound Pack`, `Speedrun Utilities`];
                const creatorNames = ['PixelSmith', 'NoraBuilds', 'RetroModder', 'WorkshopCollective', 'CyberForge', 'GamerCraft'];

                const mod = {
                    id: `mod_${game.id}_${modNumber}`,
                    name: modNames[Math.floor(Math.random() * modNames.length)],
                    creator: creatorNames[Math.floor(Math.random() * creatorNames.length)],
                    createdAtWeek: ageWeeks,
                    popular: isPopular,
                    downloads: isPopular ? 15000 + Math.floor(Math.random() * 45000) : 1200 + Math.floor(Math.random() * 3000),
                    compatible: !workshop.compatibilityBroken
                };
                workshop.mods = [...(workshop.mods || []), mod].slice(-30);

                if (isPopular) {
                    workshop.popularMods = (workshop.popularMods || 0) + 1;
                    workshop.engagement = Math.min(100, (workshop.engagement || 0) + 12 + Math.floor(Math.random() * 8));
                    game.socialFeed = [...(game.socialFeed || []), {
                        author: `@${mod.creator}`, icon: '[[DE_ICON_034]]',
                        text: `¡El mod "${mod.name}" se ha vuelto viral! Miles de jugadores vuelven a jugar a ${game.name}.`,
                        sentiment: 'positive', time: `${this.getHistoricalYear()} · Workshop`, kind: 'popular_mod'
                    }].slice(-10);
                } else {
                    workshop.engagement = Math.min(100, (workshop.engagement || 0) + 3);
                }
            }
        }

        // 'Conversión Total (Total Conversion Mod)': Evento extraordinario post-lanzamiento
        if (!workshop.totalConversionTriggered && ageWeeks >= 48 && workshop.popularMods > 0 && Math.random() < 0.015) {
            workshop.totalConversionTriggered = true;
            workshop.totalConversions = (workshop.totalConversions || 0) + 1;
            workshop.engagement = 100;
            workshop.weeksRemaining = Math.max(workshop.weeksRemaining, 52); // +1 año garantizado
            game.maxWeeks = Math.max(game.maxWeeks || 0, ageWeeks + 52);
            game.salesPotential = Math.floor((game.salesPotential || 30000) * 1.60); // +60% de potencial de ventas
            game.decayRate = 0.90; // Resetea el decaimiento acelerado
            if (!this.activeSales.some(item => item.id === game.id)) this.activeSales.push(game);

            game.socialFeed = [...(game.socialFeed || []), {
                author: '@TotalConversionTeam', icon: '[[DE_ICON_040]]',
                text: `¡INCREÍBLE! Una Conversión Total comunitaria gratuita transforma ${game.name} en un fenómeno viral mundial. ¡El juego entra de nuevo al Top de ventas!`,
                sentiment: 'positive', time: `${this.getHistoricalYear()} · Workshop`, kind: 'total_conversion'
            }].slice(-10);

            if (soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
        }

        // 'Mods Populares' prolongan las ventas mensuales residuales en un +150% (multiplicador 2.5x)
        const residualMultiplier = (workshop.popularMods > 0 && !workshop.compatibilityBroken) ? 2.50 : 1.0;
        return { multiplier: residualMultiplier, active: workshop.weeksRemaining > 0 };
    }

    deployContentPatch(gameId, options = {}) {
        const game = this.gamesHistory.find(item => item.id === gameId);
        if (!game || game.serversClosed) return { success: false, message: 'El juego no está en mantenimiento activo.' };
        if (this.getHistoricalYear() < 1995) return { success: false, message: 'Los parches de software se desbloquean a partir de 1995.' };
        if (game.businessModel === 'premium' && !game.supportsPatches) return { success: false, message: 'Este juego se publicó sin contrato de soporte post-lanzamiento.' };
        const cost = 6000 + Math.max(0, this.employees.length - 1) * 1500;
        if (this.funds < cost) return { success: false, message: `Fondos insuficientes para el parche ($${cost.toLocaleString()}).` };
        this.funds -= cost;
        game.weeksWithoutContentPatch = 0;
        game.communityPatience = Math.min(100, (game.communityPatience || 100) + 20);
        game.patchCount = (game.patchCount || 0) + 1;
        if (['f2p', 'live_service'].includes(game.businessModel)) game.mau = Math.floor((game.mau || 0) * 1.08);
        else this.adjustGameReviews(game, 0.1);

        let modCompatibilityBroken = false;
        // Mantenimiento de API: Un parche oficial puede romper compatibilidad si hay mods populares
        if (game.workshop?.enabled && game.workshop.popularMods > 0) {
            modCompatibilityBroken = options.breaksMods === undefined ? (Math.random() < 0.35) : !!options.breaksMods;
            if (modCompatibilityBroken) {
                game.workshop.compatibilityBroken = true;
                game.workshop.mods = (game.workshop.mods || []).map(mod => ({ ...mod, compatible: false }));
                this.adjustGameReviews(game, -0.25);
                game.workshop.engagement = Math.max(0, (game.workshop.engagement || 0) - 22);
                game.socialFeed = [...(game.socialFeed || []), {
                    author: '@WorkshopCreators', icon: '[[DE_ICON_016]]',
                    text: `¡ALERTA! El nuevo parche oficial de ${game.name} rompió la compatibilidad de los mods. La comunidad exige que el estudio publique herramientas de actualización.`,
                    sentiment: 'negative', time: `${this.getHistoricalYear()} · Parche`, kind: 'mod_compatibility_broken'
                }].slice(-10);
            }
        }
        this.notify();
        const compatibilityMessage = modCompatibilityBroken ? ' [[DE_ICON_016]] AVISO: El parche rompió la compatibilidad de los mods. Publica herramientas de actualización en el Workshop para restaurarla.' : '';
        return { success: true, message: `Parche oficial desplegado en "${game.name}" por $${cost.toLocaleString()}.${compatibilityMessage}` };
    }

    launchBattlePass(gameId, programmers = 1) {
        const game = this.gamesHistory.find(item => item.id === gameId);
        if (!game || game.businessModel !== 'live_service' || game.serversClosed) return { success: false, message: 'El juego no tiene un servicio activo.' };
        if (game.weeksOnMarket < game.nextSeasonWeek) return { success: false, message: `La próxima temporada se abre en la semana ${game.nextSeasonWeek}.` };
        const assigned = Math.max(1, Math.min(this.employees.length, Math.floor(programmers) || 1));
        const averageSalary = this.employees.reduce((sum, employee) => sum + (employee.salary || 0), 0) / Math.max(1, this.employees.length);
        const cost = 12000 + Math.round(averageSalary * assigned * 3);
        if (this.funds < cost) return { success: false, message: `Fondos insuficientes para asignar ${assigned} programador(es) ($${cost.toLocaleString()}).` };
        const monthKey = this.year * 12 + this.month;
        if (game.serviceMonthKey !== monthKey) {
            game.serviceMonthKey = monthKey;
            game.monthlyServiceRevenue = 0;
            game.monthlyServiceCosts = 0;
            game.monthlyNetBalance = 0;
        }
        this.funds -= cost;
        const conversion = game.monetizationStyle === 'aggressive' ? 0.04 : 0.02;
        const grossRevenue = Math.floor(game.mau * conversion * game.referencePrice * 0.9);
        const engineRate = Math.max(0, Math.min(1, game.royaltyRate || 0));
        const platformRate = Math.max(0, Math.min(1 - engineRate, game.platformRoyaltyRate || 0));
        const publisherRate = Math.max(0, Math.min(1 - engineRate - platformRate, (game.publisherRevenueShare || 0) + (game.subscriptionRevenueShare || 0)));
        const combinedFeeRate = engineRate + platformRate + publisherRate;
        const fees = Math.floor(grossRevenue * combinedFeeRate);
        const revenue = grossRevenue - fees;
        game.royaltiesPaidTotal += Math.floor(grossRevenue * (game.royaltyRate || 0));
        game.platformRoyaltiesPaidTotal = (game.platformRoyaltiesPaidTotal || 0) + Math.floor(grossRevenue * platformRate);
        game.publisherSharePaid += Math.floor(grossRevenue * publisherRate);
        game.season++;
        game.nextSeasonWeek = Math.max(game.nextSeasonWeek, game.weeksOnMarket) + 12;
        game.weeksWithoutContentPatch = 0;
        game.mau = Math.floor(game.mau * 1.18);
        game.lifetimeServiceRevenue += revenue;
        game.lifetimeServiceCosts += cost;
        game.monthlyServiceRevenue += revenue;
        game.monthlyServiceCosts += cost;
        game.monthlyNetBalance += revenue - cost;
        game.revenueTotal += revenue;
        game.grossRevenueTotal = (game.grossRevenueTotal || 0) + grossRevenue;
        game.profit += revenue - cost;
        game.lastSeasonProgrammers = assigned;
        this.funds += revenue;
        this.notify();
        return { success: true, message: `Pase de Batalla S${game.season}: +$${revenue.toLocaleString()} de ingresos; coste de contenido $${cost.toLocaleString()}.` };
    }

    closeGameServers(gameId) {
        const game = this.gamesHistory.find(item => item.id === gameId);
        if (!game || !['f2p', 'live_service'].includes(game.businessModel) || game.serversClosed) return { success: false, message: 'No hay servidores activos que cerrar.' };
        game.serversClosed = true;
        game.lifecycleState = 'closed';
        game.mau = 0;
        game.serversClosedYear = this.getHistoricalYear();
        this.activeSales = this.activeSales.filter(item => item.id !== gameId);
        const remainingServiceTitles = this.activeSales.filter(item => ['f2p', 'live_service'].includes(item.businessModel) && !item.serversClosed);
        const studioSupportBudget = this.employees.reduce((sum, employee) => sum + (employee.salary || 0), 0) * 0.25;
        const supportShare = remainingServiceTitles.length ? studioSupportBudget / remainingServiceTitles.length : 0;
        remainingServiceTitles.forEach(item => { item.supportMonthlyCost = supportShare; });
        this.notify();
        return { success: true, message: `Servidores de "${game.name}" cerrados. Se detuvieron los costes y los ingresos recurrentes.` };
    }

    adjustGameReviews(game, delta) {
        game.reviews = (game.reviews || []).map(review => ({ ...review, score: Math.max(2, Math.min(game.masterpieceEligible ? 10 : 9.4, Math.round((review.score + delta) * 10) / 10)) }));
        game.score = Math.round((game.reviews.reduce((sum, review) => sum + review.score, 0) / Math.max(1, game.reviews.length)) * 10) / 10;
    }

    processWeeklySales() {
        let weeklyIncomeTotal = 0;

        for (let i = this.activeSales.length - 1; i >= 0; i--) {
            const game = this.activeSales[i];
            game.weeksOnMarket++;
            if (game.serversClosed) continue;
            const isService = ['f2p', 'live_service'].includes(game.businessModel);
            const isEarlyAccess = game.businessModel === 'early_access';
            const saleWeek = isEarlyAccess && game.officialReleased ? game.officialWeeksOnMarket + 1 : game.weeksOnMarket;
            let peakCurve = saleWeek === 1 ? 0.75 : (saleWeek === 2 ? 1 : (saleWeek <= 4 ? [0, 0, 0, 0.84, 0.72][saleWeek] : Math.pow(game.decayRate, saleWeek - 4) * 0.72));
            const workshopWeek = this.processCommunityWorkshopWeek(game);
            if (saleWeek > 4) peakCurve *= workshopWeek.multiplier;
            let unitsThisWeek = 0;
            let serviceCostsThisWeek = 0;

            if (isEarlyAccess) {
                if (!game.officialReleased && game.weeksOnMarket <= 8) {
                    game.lifecycleState = 'early_access_beta';
                    unitsThisWeek = Math.floor((game.betaPotential / 4.1) * peakCurve);
                } else if (game.officialReleased && game.officialWeeksOnMarket < 12) {
                    game.officialWeeksOnMarket++;
                    game.lifecycleState = 'peak';
                    unitsThisWeek = Math.floor((game.officialPotential / 4.1) * peakCurve);
                } else if (game.officialReleased) {
                    game.lifecycleState = 'long_tail';
                    const baseResidual = Math.max(2, Math.floor((game.officialPotential || game.salesPotential || 500) * 0.002));
                    const scoreFactor = Math.max(0.4, (game.score || 6.0) / 7.0);
                    const fanFactor = Math.min(2.5, 1.0 + (this.fans / 25000));
                    unitsThisWeek = Math.floor(baseResidual * scoreFactor * fanFactor * (0.85 + Math.random() * 0.3));
                }
                if (!game.officialReleased && game.weeksOnMarket > 8) {
                    game.lifecycleState = 'awaiting_1_0';
                    unitsThisWeek = Math.max(1, Math.floor((game.betaPotential / 25) * (0.8 + Math.random() * 0.4)));
                }
            } else if (game.weeksOnMarket <= game.maxWeeks) {
                game.lifecycleState = 'peak';
                unitsThisWeek = Math.floor((game.salesPotential / 4.1) * peakCurve);
            } else {
                // Long-Tail Phase: Continuous residual sales without auto-removal from stores
                game.lifecycleState = 'long_tail';
                const baseResidual = Math.max(3, Math.floor((game.salesPotential || 500) * 0.0022));
                const scoreFactor = Math.max(0.4, (game.score || 6.0) / 7.0);
                const fanFactor = Math.min(2.5, 1.0 + (this.fans / 25000));
                unitsThisWeek = Math.floor(baseResidual * scoreFactor * fanFactor * (0.85 + Math.random() * 0.3));
            }

            // Popular mods create a small but durable long-tail audience (+150% boost)
            const workshop = game.workshop;
            if (workshopWeek.active && workshop?.popularMods > 0 && !workshop?.compatibilityBroken) {
                if (game.weeksOnMarket > (workshop.originalMaxWeeks || 14)) {
                    unitsThisWeek = Math.max(unitsThisWeek, Math.floor(unitsThisWeek * workshopWeek.multiplier));
                }
            }

            const weeklyViralMultiplier = typeof this.applyWeeklyViralEffect === 'function'
                ? this.applyWeeklyViralEffect(game)
                : 1;
            const industryMultiplier = typeof this.getIndustrySalesMultiplier === 'function'
                ? this.getIndustrySalesMultiplier(game.platformId || game.platform?.id, game.genre?.id || game.genreId)
                : 1;
            if (unitsThisWeek > 0) unitsThisWeek = Math.floor(unitsThisWeek * weeklyViralMultiplier * industryMultiplier);
            const currentPlatform = this.getPlatformById(game.platformId || game.platform?.id);
            if (currentPlatform && game.launchMarketShare != null) {
                // El mercado evoluciona con el año; al retirarse persiste una cola residual.
                const shareFactor = Math.max(0.15, Math.min(2, (currentPlatform.marketShare + 0.05) / (game.launchMarketShare + 0.05)));
                unitsThisWeek = Math.max(unitsThisWeek > 0 ? 1 : 0, Math.floor(unitsThisWeek * shareFactor));
            }

            let grossRevenueThisWeek = 0;
            if (isService) {
                if (game.weeksOnMarket <= game.maxWeeks) game.installationsTotal += unitsThisWeek;
                const baseRetention = game.monetizationStyle === 'aggressive' ? 0.79 : 0.89;
                const retention = Math.min(0.98, baseRetention + ((game.workshop?.popularMods > 0 && !game.workshop?.compatibilityBroken) ? 0.03 : 0));
                game.mau = Math.max(0, Math.floor((game.mau || 0) * retention + unitsThisWeek * 0.68));
                game.unitsSoldLastWeek = 0;
                const priorHistory = game.mauHistory || [];
                const previousMau = priorHistory.length ? priorHistory[priorHistory.length - 1] : 0;
                const dailySamples = Array.from({ length: 7 }, (_, day) => Math.floor(previousMau + (game.mau - previousMau) * ((day + 1) / 7)));
                game.dailyActiveUsers = [...(game.dailyActiveUsers || []), ...dailySamples].slice(-56);
                game.mauHistory = [...priorHistory, game.mau].slice(-12);
            } else {
                game.unitsSoldLastWeek = unitsThisWeek;
                game.unitsSoldTotal += unitsThisWeek;
                const unitPrice = isEarlyAccess && !game.officialReleased ? game.referencePrice * 0.65 : game.basePrice;
                const exclusiveMarketing = game.weeksOnMarket <= game.exclusiveWeeks ? (game.platformMarketingMultiplier || 1) : 1;
                grossRevenueThisWeek = Math.floor(unitsThisWeek * unitPrice * exclusiveMarketing * (game.directSalesMultiplier || 1));
            }

            // Paid post-launch content available only after its historical unlock date.
            if (!isService && !isEarlyAccess && game.postLaunchContent === 'season_pass' && game.weeksOnMarket === 4) {
                grossRevenueThisWeek += Math.floor(game.salesPotential * 0.12 * game.referencePrice * 0.6);
            } else if (!isService && !isEarlyAccess && game.postLaunchContent === 'dlc' && game.weeksOnMarket === 12) {
                grossRevenueThisWeek += Math.floor(game.salesPotential * 0.08 * game.referencePrice * 0.3);
            } else if (!isService && !isEarlyAccess && game.postLaunchContent === 'expansion' && game.weeksOnMarket === 24) {
                grossRevenueThisWeek += Math.floor(game.salesPotential * 0.10 * game.referencePrice * 0.55);
            }

            if (isService) {
                const monthKey = this.year * 12 + this.month;
                if (game.serviceMonthKey !== monthKey) {
                    game.serviceMonthKey = monthKey;
                    game.monthlyServiceRevenue = 0;
                    game.monthlyServiceCosts = 0;
                    game.monthlyNetBalance = 0;
                }
                serviceCostsThisWeek = Math.ceil((game.serviceBaseMonthlyCost + Math.floor(game.mau * game.servicePerUserMonthlyCost) + game.supportMonthlyCost) / 4);
                game.monthlyServiceCosts += serviceCostsThisWeek;
                game.monthlyNetBalance -= serviceCostsThisWeek;
                game.lifetimeServiceCosts += serviceCostsThisWeek;
                this.funds -= serviceCostsThisWeek;
                if (this.week === 4) {
                    const conversion = game.conversionRate || 0.02;
                    const aggressionMultiplier = game.monetizationStyle === 'aggressive' ? 1.5 : 1;
                    grossRevenueThisWeek += Math.floor(game.mau * conversion * game.referencePrice * 0.55 * aggressionMultiplier);
                }
            }

            const engineRate = Math.max(0, Math.min(1, game.royaltyRate || 0));
            const platformRate = Math.max(0, Math.min(1 - engineRate, game.platformRoyaltyRate || 0));
            const royalty = Math.floor(grossRevenueThisWeek * engineRate);
            const platformRoyalty = Math.floor(grossRevenueThisWeek * platformRate);
            const publisherShareRate = Math.max(0, Math.min(1 - engineRate - platformRate, (game.publisherRevenueShare || 0) + (game.subscriptionRevenueShare || 0)));
            const publisherShare = Math.floor(grossRevenueThisWeek * publisherShareRate);
            const netRevenueThisWeek = grossRevenueThisWeek - royalty - platformRoyalty - publisherShare;
            game.royaltiesPaidTotal = (game.royaltiesPaidTotal || 0) + royalty;
            game.platformRoyaltiesPaidTotal = (game.platformRoyaltiesPaidTotal || 0) + platformRoyalty;
            game.publisherSharePaid = (game.publisherSharePaid || 0) + publisherShare;
            game.revenueTotal += netRevenueThisWeek;
            game.grossRevenueTotal = (game.grossRevenueTotal || 0) + grossRevenueThisWeek;
            game.profit = (game.upfrontOfferRevenue || 0) + game.revenueTotal - game.devCost - game.lifetimeServiceCosts - (game.contractLatePenalty || 0) - (game.physicalManufacturingCost || 0) - (game.marketingCostTotal || 0);
            this.funds += netRevenueThisWeek;
            weeklyIncomeTotal += netRevenueThisWeek;
            if (isService && this.week === 4) {
                game.monthlyServiceRevenue += netRevenueThisWeek;
                game.monthlyNetBalance += netRevenueThisWeek;
                game.lifetimeServiceRevenue += netRevenueThisWeek;
            }

            if (isEarlyAccess && !game.officialReleased) {
                game.weeksWithoutContentPatch++;
                if (game.weeksWithoutContentPatch > 8) {
                    this.adjustGameReviews(game, -0.12);
                    game.communityPatience = Math.max(0, game.communityPatience - 5);
                }
            }

            // Record weekly sales history for interactive data visualization
            if (!game.weeklySalesHistory) game.weeklySalesHistory = [];
            let chartRank = null;
            if (this.top10Chart) {
                const foundEntry = this.top10Chart.findIndex(item => item.isPlayer && item.gameId === game.id);
                if (foundEntry !== -1) chartRank = foundEntry + 1;
            }
            if (!chartRank) {
                chartRank = unitsThisWeek > 3000 ? Math.max(1, 10 - Math.floor(unitsThisWeek / 1500)) : (unitsThisWeek > 1000 ? 12 : (unitsThisWeek > 300 ? 19 : 35));
            }

            game.weeklySalesHistory.push({
                weekNumber: game.weeksOnMarket,
                calendarYear: this.getHistoricalYear(),
                calendarWeek: this.week,
                unitsSold: unitsThisWeek,
                grossRevenue: grossRevenueThisWeek,
                netRevenue: netRevenueThisWeek,
                cumulativeUnits: game.unitsSoldTotal || game.installationsTotal || 0,
                cumulativeRevenue: game.revenueTotal || 0,
                rank: chartRank,
                lifecycleState: game.lifecycleState || 'long_tail',
                viralMultiplier: weeklyViralMultiplier,
                industryMultiplier: industryMultiplier,
                hasPopularMods: !!(game.workshop?.popularMods > 0 && !game.workshop?.compatibilityBroken)
            });

            // Synchronize with gamesHistory record
            const histGame = this.gamesHistory.find(g => g.id === game.id);
            if (histGame) {
                histGame.weeklySalesHistory = game.weeklySalesHistory;
                histGame.lifecycleState = game.lifecycleState;
                histGame.unitsSoldTotal = game.unitsSoldTotal;
                histGame.installationsTotal = game.installationsTotal;
                histGame.revenueTotal = game.revenueTotal;
                histGame.profit = game.profit;
            }

            // NOTE: Games persist in the market (Long Tail phase) and will NOT be automatically
            // removed. The player retains full manual control to retire them via retireGameFromMarket().
        }

        // Collect passive monthly royalties from in-house engines licensed to external rival studios
        let passiveRoyaltiesTotal = 0;
        if (this.inHouseEngines && this.inHouseEngines.length > 0) {
            this.inHouseEngines.forEach(eng => {
                if (typeof eng.collectWeeklyPassiveRoyalties === 'function') {
                    passiveRoyaltiesTotal += eng.collectWeeklyPassiveRoyalties();
                }
            });
        }
        if (passiveRoyaltiesTotal > 0) {
            this.funds += passiveRoyaltiesTotal;
            this.lastPassiveRoyaltiesEarned = passiveRoyaltiesTotal;
            weeklyIncomeTotal += passiveRoyaltiesTotal;
        }

        // The calendar has four weeks per month. Charge payroll and recurring
        // office costs weekly so long projects cannot defer their expenses.
        const totalSalaries = this.employees.reduce((acc, e) => acc + (Number(e.salary) || 0), 0);
        const year = this.getHistoricalYear();
        const officeCost = this.era === 1 ? 300 : (this.era === 2 ? 6000 : 28000);
        const utilities = year < 1990 ? 100 : (year < 2000 ? 700 : 1800);
        const network = year >= 1995 ? (this.era === 3 ? 3000 : 600) : 0;
        this.lastMonthlyOperatingCosts = { salaries: totalSalaries, office: officeCost, utilities, network };
        this.funds -= (totalSalaries + officeCost + utilities + network) / 4;

        // Passive stamina recovery for employees when not in an active project
        if (!this.currentProject) {
            this.employees.forEach(emp => {
                emp.stamina = Math.min(emp.maxStamina, emp.stamina + 3.5 * this.gameSpeed);
                emp.energy = emp.stamina;
            });
        }

        if (weeklyIncomeTotal > 0 && soundEngine) {
            soundEngine.playCash();
        }

        // Cycle competitor market and update top 10 leaderboard
        this.cycleRivalMarket();

        // Advance market trend counter
        if (this.marketTrend) {
            this.marketTrend.weeksRemaining--;
            if (this.marketTrend.weeksRemaining <= 0) {
                this.rollNewMarketTrend();
            }
        }

        this.notify();
    }

    setWorkMode(mode) {
        if (!['normal', 'relaxed', 'crunch'].includes(mode)) {
            return { success: false, message: 'Modo de trabajo inválido.' };
        }
        this.workMode = mode;
        if (this.currentProject && this.currentProject.devMode !== 'refactor') {
            this.currentProject.devMode = mode === 'crunch' ? 'crunch' : 'normal';
        }
        this.notify();
        const labels = { normal: 'Normal (40 h)', relaxed: 'Relajado (30 h)', crunch: 'Crunch' };
        return { success: true, mode, message: `Ritmo de trabajo actualizado: ${labels[mode]}.` };
    }

    applyEmployeeWorkTick(mode = this.workMode || 'normal') {
        const isCrunch = this.currentProject
            ? (this.currentProject.devMode === 'crunch' || (mode === 'crunch' && this.currentProject.devMode !== 'refactor'))
            : mode === 'crunch';
        for (const employee of this.employees) {
            if ((employee.sickWeeksRemaining || 0) > 0) continue;
            const energy = Math.max(0, Math.min(100, Number(employee.energy ?? employee.stamina ?? 100)));
            const resistance = Math.max(1, Math.min(100, Number(employee.stressResistance || 50)));
            let nextEnergy = energy;
            let nextStress = Number(employee.stress || 0);
            let nextMorale = Number(employee.morale ?? 70);
            if (isCrunch) {
                const burn = (employee.trait === 'Workaholic' ? 0.55 : 0.72) + Math.max(0, 60 - resistance) * 0.004;
                nextEnergy -= burn * Math.max(1, this.gameSpeed || 1);
                nextStress += (0.42 + (100 - resistance) * 0.003) * Math.max(1, this.gameSpeed || 1);
                nextMorale -= 0.16 * Math.max(1, this.gameSpeed || 1);
            } else if (mode === 'relaxed') {
                nextEnergy += 0.18 * Math.max(1, this.gameSpeed || 1);
                nextStress -= 0.35 * Math.max(1, this.gameSpeed || 1);
                nextMorale += 0.24 * Math.max(1, this.gameSpeed || 1);
            } else {
                nextEnergy -= 0.035 * Math.max(1, this.gameSpeed || 1);
                nextStress -= 0.04 * Math.max(1, this.gameSpeed || 1);
                nextMorale += 0.015 * Math.max(1, this.gameSpeed || 1);
            }
            employee.energy = Math.max(0, Math.min(100, nextEnergy));
            employee.stamina = employee.energy;
            employee.stress = Math.max(0, Math.min(100, nextStress));
            employee.morale = Math.max(0, Math.min(100, nextMorale));
            if (employee.burnoutState !== 'total') {
                employee.burnoutState = employee.energy < 30 ? 'risk' : 'none';
            }
        }
    }

    processEmployeeWeeklyWellbeing() {
        const crunching = Boolean(this.currentProject) && (this.currentProject.devMode === 'crunch' || (this.workMode === 'crunch' && this.currentProject.devMode !== 'refactor'));
        const events = [];
        for (const employee of [...this.employees]) {
            if ((employee.sickWeeksRemaining || 0) > 0) {
                employee.sickWeeksRemaining--;
                if (employee.sickWeeksRemaining === 0) events.push({ type: 'returned', employeeId: employee.id, employeeName: employee.name, message: `${employee.name} volvió de su baja médica.` });
            }
            if (crunching) {
                employee.continuousCrunchWeeks = (employee.continuousCrunchWeeks || 0) + 1;
                employee.stress = Math.min(100, (employee.stress || 0) + Math.max(2, 8 - (employee.stressResistance || 50) * 0.045));
                employee.morale = Math.max(0, (employee.morale ?? 70) - 3);
                if (employee.continuousCrunchWeeks > 3 && employee.burnoutState !== 'total') {
                    employee.burnoutState = 'total';
                    employee.burnoutWeeks = (employee.burnoutWeeks || 0) + 1;
                    employee.morale = Math.max(0, employee.morale - 20);
                    events.push({ type: 'burnout', employeeId: employee.id, employeeName: employee.name, message: `${employee.name} sufrió burnout total tras ${employee.continuousCrunchWeeks} semanas de crunch.` });
                } else if (employee.burnoutState === 'total') {
                    employee.burnoutWeeks = (employee.burnoutWeeks || 0) + 1;
                }
                if (employee.energy < 30 && employee.sickWeeksRemaining <= 0) {
                    employee.burnoutState = employee.burnoutState === 'total' ? 'total' : 'risk';
                    const illnessChance = Math.min(0.30, 0.04 + (100 - employee.energy) * 0.0015 + employee.stress * 0.001);
                    if (Math.random() < illnessChance) {
                        employee.sickWeeksRemaining = 1 + (Math.random() < 0.35 ? 1 : 0);
                        events.push({ type: 'sick', employeeId: employee.id, employeeName: employee.name, message: `${employee.name} cayó enfermo/a por agotamiento y estará ${employee.sickWeeksRemaining} semana(s) de baja.` });
                    }
                }
                if (employee.burnoutState === 'total' && employee.id !== 'player') {
                    const resignationChance = Math.min(0.45, 0.06 + employee.stress * 0.002 + (100 - employee.morale) * 0.002);
                    if (Math.random() < resignationChance) {
                        this.employees = this.employees.filter(item => item.id !== employee.id);
                        events.push({ type: 'resigned', employeeId: employee.id, employeeName: employee.name, message: `${employee.name} dimitió irrevocablemente por burnout.` });
                    }
                }
            } else {
                employee.continuousCrunchWeeks = 0;
                if (employee.energy >= 30 && employee.burnoutState === 'risk') employee.burnoutState = 'none';
                const recovery = this.workMode === 'relaxed' ? 8 : 2;
                employee.energy = Math.min(100, Number(employee.energy ?? employee.stamina ?? 100) + recovery);
                employee.stamina = employee.energy;
                employee.stress = Math.max(0, (employee.stress || 0) - (this.workMode === 'relaxed' ? 12 : 4));
                employee.morale = Math.min(100, (employee.morale ?? 70) + (this.workMode === 'relaxed' ? 10 : 2));
            }
        }
        if (events.length) {
            this.employeeEvents = [...(this.employeeEvents || []), ...events].slice(-30);
            events.forEach(event => this.onEmployeeEvent?.(event));
        }
    }

    mentorEmployee(mentorId, juniorId, currency = 'funds') {
        if (this.currentProject) return { success: false, message: 'La mentoría solo se puede programar cuando el estudio está inactivo.' };
        if (!['funds', 'researchPoints'].includes(currency)) return { success: false, message: 'Elige fondos o puntos de I+D.' };
        const mentor = this.employees.find(employee => employee.id === mentorId);
        const junior = this.employees.find(employee => employee.id === juniorId);
        if (!mentor || !junior || mentor.id === junior.id) return { success: false, message: 'Selecciona dos empleados distintos.' };
        if (!['Senior', 'Lead'].includes(mentor.experience) && (mentor.tech || 0) < 55 && (mentor.design || 0) < 55) {
            return { success: false, message: 'Hace falta un mentor Senior/Lead o con habilidad 55+.' };
        }
        if (junior.experience !== 'Junior') return { success: false, message: 'La formación interna está destinada a empleados Junior.' };
        if (currency === 'funds' && this.funds < 4000) return { success: false, message: 'Fondos insuficientes ($4.000) para la formación.' };
        if (currency === 'researchPoints' && this.researchPoints < 18) return { success: false, message: 'Puntos de I+D insuficientes (18 RP).'};
        if (currency === 'funds') this.funds -= 4000;
        else this.researchPoints -= 18;
        const traitBonus = (mentor.trait === 'Mentor' || mentor.traits?.includes('Mentor')) ? 3 : 0;
        const techIncrease = Math.min(100 - (junior.tech || 0), 6 + traitBonus);
        const designIncrease = Math.min(100 - (junior.design || 0), 6 + traitBonus);
        junior.tech = (junior.tech || 0) + techIncrease;
        junior.design = (junior.design || 0) + designIncrease;
        junior.morale = Math.min(100, (junior.morale ?? 70) + 8);
        this.notify();
        return { success: true, message: `${mentor.name} formó a ${junior.name}: +${techIncrease} Técnica y +${designIncrease} Diseño.` };
    }

    advanceCalendar() {
        if (this.isPaused) return;
        this.week++;
        if (this.week > 4) {
            this.week = 1;
            this.month++;
            if (this.month > 12) {
                this.month = 1;
                this.year++;
                this.triggerAnnualAwards();
            }
        }
        this.processEmployeeWeeklyWellbeing();
        if (typeof this.processHeadhunters === 'function') this.processHeadhunters();
        // Annual obsolescence check for proprietary in-house engines (-15% per year)
        if (this.inHouseEngines && this.inHouseEngines.length > 0) {
            this.inHouseEngines.forEach(eng => {
                if (typeof eng.getEfficiency === 'function') {
                    eng.currentEfficiency = eng.getEfficiency(this.year, this.week);
                }
            });
        }

        // Advance active R&D research project
        if (this.activeResearch) {
            this.activeResearch.weeksRemaining--;
            const completedWeeks = this.activeResearch.totalWeeks - this.activeResearch.weeksRemaining;
            this.activeResearch.progress = Math.min(100, Math.floor((completedWeeks / this.activeResearch.totalWeeks) * 100));

            if (this.activeResearch.weeksRemaining <= 0) {
                const finishedTechId = this.activeResearch.techId;
                const finishedTechName = this.activeResearch.nodeName;
                if (this.techTreeManager) {
                    this.techTreeManager.unlockTech(finishedTechId, this.getHistoricalYear());
                }
                this.activeResearch = null;

                if (soundEngine && soundEngine.playLevelUp) {
                    soundEngine.playLevelUp();
                }
                this.onResearchCompleted?.(finishedTechName);
            }
        }

        // Advance active Topic R&D research project (Subagente 2)
        if (this.activeTopicResearch) {
            this.activeTopicResearch.weeksRemaining--;
            const completedWeeks = this.activeTopicResearch.totalWeeks - this.activeTopicResearch.weeksRemaining;
            this.activeTopicResearch.progress = Math.min(100, Math.floor((completedWeeks / this.activeTopicResearch.totalWeeks) * 100));

            if (this.activeTopicResearch.weeksRemaining <= 0) {
                const finishedTopicId = this.activeTopicResearch.topicId;
                const finishedTopicName = this.activeTopicResearch.topicName;
                if (!this.unlockedTopicIds) this.unlockedTopicIds = ['medieval', 'fantasy', 'sports', 'space', 'martial_arts', 'ninja'];
                if (!this.unlockedTopicIds.includes(finishedTopicId)) {
                    this.unlockedTopicIds.push(finishedTopicId);
                }
                const completedTopic = { ...this.activeTopicResearch };
                this.activeTopicResearch = null;

                if (soundEngine && soundEngine.playLevelUp) {
                    soundEngine.playLevelUp();
                }
                if (typeof this.onTopicResearchCompleted === 'function') {
                    this.onTopicResearchCompleted(finishedTopicName, finishedTopicId, completedTopic);
                }
            }
        }

        // Advance active Genre R&D research project (Subagente 1 & 2)
        if (this.activeGenreResearch) {
            this.activeGenreResearch.weeksRemaining--;
            const completedWeeks = this.activeGenreResearch.totalWeeks - this.activeGenreResearch.weeksRemaining;
            this.activeGenreResearch.progress = Math.min(100, Math.floor((completedWeeks / this.activeGenreResearch.totalWeeks) * 100));

            if (this.activeGenreResearch.weeksRemaining <= 0) {
                const finishedGenreId = this.activeGenreResearch.genreId;
                const finishedGenreName = this.activeGenreResearch.genreName;
                if (!this.unlockedGenreIds) {
                    this.unlockedGenreIds = ['action', 'Action', 'adventure', 'Adventure', 'rpg', 'RPG', 'strategy', 'Strategy', 'simulation', 'Simulation', 'casual', 'Casual'];
                }
                if (!this.unlockedGenreIds.some(id => id.toLowerCase() === finishedGenreId.toLowerCase())) {
                    this.unlockedGenreIds.push(finishedGenreId);
                }
                const completedGenre = { ...this.activeGenreResearch };
                this.activeGenreResearch = null;

                if (soundEngine && soundEngine.playLevelUp) {
                    soundEngine.playLevelUp();
                }
                if (typeof this.onGenreResearchCompleted === 'function') {
                    this.onGenreResearchCompleted(finishedGenreName, finishedGenreId, completedGenre);
                }
            }
        }

        if (this.activeEngineRD) {
            this.activeEngineRD.weeksRemaining--;
            const completed = this.activeEngineRD.totalWeeks - this.activeEngineRD.weeksRemaining;
            this.activeEngineRD.progress = Math.min(100, Math.floor(completed / this.activeEngineRD.totalWeeks * 100));

            // Technical R&D feedback: lead programmer earns +2 to +4 RP per week through architecture research
            const leadEmp = this.employees[this.activeEngineRD.leadProgrammerIndex] || this.employees[0];
            const rpGain = Math.max(2, Math.floor(2 + ((leadEmp?.tech || 30) / 35)));
            this.researchPoints += rpGain;
            if (typeof this.onEngineRPTick === 'function') {
                this.onEngineRPTick(rpGain, this.activeEngineRD.leadProgrammerIndex, this.activeEngineRD);
            }

            if (this.activeEngineRD.weeksRemaining <= 0) {
                const cfg = this.activeEngineRD;
                const engine = new InHouseEngine({
                    name: cfg.name,
                    tier: this.era,
                    affineGenres: cfg.affineGenres,
                    bakedNodes: cfg.bakedNodes,
                    createdYear: this.year,
                    createdWeek: this.week,
                    releaseYear: this.getHistoricalYear()
                });
                engine.historicalTechIds = cfg.historicalTechIds || [];
                engine.historicalIncompatibility = cfg.historicalIncompatibility;
                cfg.bakedNodes.forEach(nodeId => this.techTreeManager?.unlockTech(nodeId, this.getHistoricalYear()));
                this.inHouseEngines.push(engine);
                this.activeEngineRD = null;
                if (soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
                this.onEngineRDCompleted?.(engine);
            }
        }

        // Advance active Post-Mortem Game Report analysis (2 weeks study by assigned staff)
        if (this.activePostMortem) {
            this.activePostMortem.weeksRemaining--;
            const completedWeeks = this.activePostMortem.totalWeeks - this.activePostMortem.weeksRemaining;
            this.activePostMortem.progress = Math.min(100, Math.floor((completedWeeks / this.activePostMortem.totalWeeks) * 100));
            if (this.activePostMortem.weeksRemaining <= 0) {
                const reportResult = this.completePostMortemAnalysis(this.activePostMortem.gameId);
                const assignedIdx = this.activePostMortem.employeeIndex;
                this.activePostMortem = null;
                if (typeof this.onPostMortemCompleted === 'function') {
                    this.onPostMortemCompleted(reportResult, assignedIdx);
                }
            }
        }

        // Passive R&D study points generated by employees when studio is idle (no active game)
        if (this.currentProject === null) {
            const totalTech = this.employees.reduce((acc, e) => acc + (e.tech || 20), 0);
            const weeklyRP = Math.max(1, Math.floor(totalTech / 45));
            this.researchPoints += weeklyRP;
        }

        this.processWeeklySales();
        this.checkIndustryEvents();
    }

    triggerAnnualAwards() {
        const candidates = [...this.gamesHistory.filter(g => g.score >= 8.8)];
        if (candidates.length > 0) {
            const winner = candidates[0];
            const prizeMoney = this.era === 1 ? 50000 : (this.era === 2 ? 180000 : 500000);
            const prizeFans = this.era === 1 ? 300 : (this.era === 2 ? 900 : 2500);

            this.fans += prizeFans;
            this.funds += prizeMoney;

            if (soundEngine) soundEngine.playLevelUp();
            return {
                won: true,
                game: winner.name,
                message: `[[DE_ICON_107]] ¡GLORIA TOTAL! "${winner.name}" ha ganado el galardón de JUEGO DEL AÑO (GOTY)! Recibes +$${prizeMoney.toLocaleString()} y +${prizeFans} fans devotos.`
            };
        }
        return null;
    }

    // --- ERA UPGRADE SYSTEM (GARAGE -> LOFT -> CYBER CAMPUS) ---
    canUpgradeOffice() {
        if (this.era === 1) {
            const meetsFunds = this.funds >= 150000;
            const meetsGames = this.gamesHistory.length >= 2;
            const meetsScore = this.gamesHistory.some(g => g.score >= 7.0);
            return {
                canUpgrade: meetsFunds && meetsGames && meetsScore,
                cost: 75000,
                targetEra: 2,
                name: 'Loft Indie Moderno',
                maxStaff: 4,
                meetsFunds,
                meetsGames,
                meetsScore
            };
        } else if (this.era === 2) {
            const meetsFunds = this.funds >= 1200000;
            const meetsGames = this.gamesHistory.length >= 6;
            const meetsScore = this.gamesHistory.some(g => g.score >= 8.5);
            return {
                canUpgrade: meetsFunds && meetsGames && meetsScore,
                cost: 450000,
                targetEra: 3,
                name: 'Campus Tecnológico Cyberpunk AAA',
                maxStaff: 8,
                meetsFunds,
                meetsGames,
                meetsScore
            };
        }
        return { canUpgrade: false, message: 'Ya posees el complejo tecnológico más avanzado del mundo.' };
    }

    upgradeOffice() {
        const check = this.canUpgradeOffice();
        if (!check.canUpgrade) {
            return { success: false, message: 'No cumples con los requisitos de fondos o historial de juegos exitosos.' };
        }

        this.funds -= check.cost;
        this.era = check.targetEra;

        if (soundEngine) soundEngine.playLevelUp();
        this.notify();
        return { success: true, newEra: this.era, name: check.name };
    }

    // --- STAFF MANAGEMENT & PROCEDURAL RECRUITMENT ---
    getMaxStaffCapacity() {
        return this.era === 1 ? 2 : (this.era === 2 ? 4 : 8);
    }

    hireEmployee(candidate) {
        if (this.employees.length >= this.getMaxStaffCapacity()) {
            return { success: false, message: '¡No hay escritorios libres en esta oficina! Amplía tu sede para contratar más personal.' };
        }
        if (this.funds < candidate.salary) {
            return { success: false, message: '¡Fondos insuficientes para cubrir la prima de contratación inicial!' };
        }

        this.funds -= candidate.salary;
        this.employees.push({
            id: 'emp_' + Date.now(),
            name: candidate.name,
            role: candidate.role || candidate.primaryRole || 'Programador de Gameplay',
            primaryRole: candidate.primaryRole || candidate.role || 'Programador de Gameplay',
            experience: candidate.experience || 'Mid',
            tech: Math.max(1, Math.min(100, Number(candidate.tech) || 30)),
            design: Math.max(1, Math.min(100, Number(candidate.design) || 30)),
            speed: Number(candidate.speed) > 4 ? Number(candidate.speed) / 100 : (Number(candidate.speed) || 1),
            speedRating: Math.max(1, Math.min(100, Number(candidate.speedRating) || Math.round((Number(candidate.speed) || 1) * 75))),
            stressResistance: Math.max(1, Math.min(100, Number(candidate.stressResistance) || 50)),
            stamina: 100,
            maxStamina: 100,
            energy: 100,
            morale: 75,
            stress: 0,
            continuousCrunchWeeks: 0,
            sickWeeksRemaining: 0,
            burnoutState: 'none',
            salary: candidate.salary,
            salaryExpectation: candidate.salaryExpectation || candidate.salary,
            trait: candidate.trait,
            traits: candidate.traits || [candidate.trait].filter(Boolean),
            desc: candidate.desc
        });

        // Remove from available candidates
        const cIdx = this.availableCandidates.findIndex(c => c.name === candidate.name);
        if (cIdx !== -1) this.availableCandidates.splice(cIdx, 1);

        if (soundEngine) soundEngine.playClick();
        this.notify();
        return { success: true };
    }

    refreshCandidatePool(budget = 2500) {
        const cost = Math.max(1000, Math.min(25000, Math.floor(Number(budget) || 2500)));
        if (this.funds < cost) {
            return { success: false, message: `Fondos insuficientes ($${cost.toLocaleString()}) para publicar anuncios de reclutamiento.` };
        }
        this.funds -= cost;

        const firstNames = ['Carlos', 'Lucía', 'David', 'Sonia', 'Guillermo', 'Mireia', 'Raúl', 'Beatriz', 'Javier', 'Clara', 'Viktor', 'Aya'];
        const lastNames = ['Gómez', 'Navarro', 'Sánchez', 'Vázquez', 'Romero', 'Kowalski', 'Tanaka', 'Morales', 'Méndez', 'Vogel'];
        const roles = [
            { role: 'Programador de Motor', techBi: 1.35, desBi: 0.7 },
            { role: 'Programador de Gameplay', techBi: 1.15, desBi: 1.0 },
            { role: 'Programador de Red', techBi: 1.3, desBi: 0.75 },
            { role: 'Artista 2D/3D', techBi: 0.75, desBi: 1.35 },
            { role: 'Artista UI', techBi: 0.8, desBi: 1.25 },
            { role: 'Diseñador de Juego', techBi: 0.85, desBi: 1.3 },
            { role: 'Tester de QA', techBi: 1.05, desBi: 0.85 }
        ];
        const traits = ['Perfeccionista', 'Lobo Solitario', 'Mentor', 'Cazador de Bugs', 'Creativo', 'Resistente al Estrés'];
        const reputation = this.gamesHistory.length
            ? this.gamesHistory.reduce((sum, game) => sum + (game.score || 0), 0) / this.gamesHistory.length
            : 5;
        const prestige = Math.max(0, Math.min(1, (reputation - 5) / 4));
        const budgetQuality = Math.max(0, Math.min(1, (cost - 1000) / 24000));
        const scale = this.era === 1 ? 1 : (this.era === 2 ? 1.25 : 1.5);
        const newPool = [];

        for (let i = 0; i < 4; i++) {
            const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
            const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
            const r = roles[Math.floor(Math.random() * roles.length)];
            const seniorChance = Math.min(0.55, 0.12 + prestige * 0.18 + budgetQuality * 0.25);
            const roll = Math.random();
            const experience = roll < seniorChance * 0.12 ? 'Lead' : (roll < seniorChance * 0.42 ? 'Senior' : (roll < 0.68 + prestige * 0.08 + budgetQuality * 0.08 ? 'Mid' : 'Junior'));
            const experienceMultiplier = { Junior: 0.72, Mid: 1, Senior: 1.32, Lead: 1.55 }[experience];
            const baseStat = Math.floor((20 + Math.random() * 32 + budgetQuality * 12 + prestige * 8) * scale * experienceMultiplier);
            const tech = Math.max(1, Math.min(100, Math.floor(baseStat * r.techBi)));
            const design = Math.max(1, Math.min(100, Math.floor(baseStat * r.desBi)));
            const speedRating = Math.max(1, Math.min(100, Math.floor(48 + Math.random() * 34 + (experienceMultiplier - 1) * 20)));
            const speed = Math.round((speedRating / 75) * 100) / 100;
            const stressResistance = Math.max(10, Math.min(100, Math.floor(35 + Math.random() * 50 + (experience === 'Senior' || experience === 'Lead' ? 8 : 0))));
            const salary = Math.floor((tech + design) * (this.era === 1 ? 20 : (this.era === 2 ? 28 : 38)) * experienceMultiplier);
            const trait = traits[Math.floor(Math.random() * traits.length)];

            newPool.push({
                id: `candidate_${this.simulationDay}_${i}_${Math.floor(Math.random() * 100000)}`,
                name: `${fn} ${ln}`,
                role: r.role,
                primaryRole: r.role,
                experience,
                tech,
                design,
                speed,
                speedRating,
                stressResistance,
                salary,
                salaryExpectation: salary,
                trait,
                traits: [trait],
                desc: `${experience} especializado en ${r.role}; perfil generado según reputación y presupuesto de búsqueda.`,
                campaignBudget: cost
            });
        }

        this.availableCandidates = newPool;
        if (soundEngine) soundEngine.playClick();
        this.notify();
        return { success: true };
    }

    adjustEmployeeSalary(employeeId, salary) {
        const employee = this.employees.find(item => item.id === employeeId);
        if (!employee) return { success: false, message: 'Empleado no encontrado.' };
        const nextSalary = Math.max(500, Math.floor(Number(salary) || 0));
        const increase = nextSalary - (employee.salary || 0);
        if (increase > 0 && this.funds < increase) return { success: false, message: `Fondos insuficientes para cubrir el aumento de $${increase.toLocaleString()}.` };
        employee.salary = nextSalary;
        employee.salaryExpectation = Math.max(employee.salaryExpectation || 0, nextSalary);
        employee.morale = Math.min(100, (employee.morale ?? 70) + (increase > 0 ? 8 : -10));
        if (increase > 0) this.funds -= increase;
        this.notify();
        return { success: true, message: `Salario de ${employee.name} actualizado a $${nextSalary.toLocaleString()} al mes.` };
    }

    assignLeadership(employeeId) {
        const employee = this.employees.find(item => item.id === employeeId);
        if (!employee) return { success: false, message: 'Empleado no encontrado.' };
        this.employees.forEach(item => { item.isLead = item.id === employeeId; });
        employee.role = 'Líder de Equipo';
        employee.primaryRole = employee.primaryRole || 'Programador de Gameplay';
        employee.morale = Math.min(100, (employee.morale ?? 70) + 5);
        this.notify();
        return { success: true, message: `${employee.name} ahora lidera el equipo.` };
    }

    processHeadhunters() {
        this.simulationDay = (this.simulationDay || 0) + 7;
        this.pendingHeadhunts = this.pendingHeadhunts || [];
        this.pendingHeadhunts.forEach(item => {
            item.deadlineDaysRemaining = Math.max(0, item.deadlineDay - this.simulationDay);
            item.deadlineWeeksRemaining = Math.ceil(item.deadlineDaysRemaining / 7);
        });
        const expired = this.pendingHeadhunts.filter(item => this.simulationDay >= item.deadlineDay);
        expired.forEach(offer => {
            const employeeIndex = this.employees.findIndex(employee => employee.id === offer.employeeId);
            if (employeeIndex >= 0) this.employees.splice(employeeIndex, 1);
            this.pendingHeadhunts = this.pendingHeadhunts.filter(item => item.employeeId !== offer.employeeId);
            this.notify();
        });

        const recentSuccess = this.gamesHistory.find(game => game.score >= 8);
        if (!recentSuccess) return;
        const pendingIds = new Set(this.pendingHeadhunts.map(item => item.employeeId));
        const eligible = this.employees.filter(employee => {
            const senior = ['Senior', 'Lead'].includes(employee.experience) || (employee.tech || 0) >= 45;
            const marketSalary = Math.floor(((employee.tech || 25) + (employee.design || 25)) * (this.era === 1 ? 20 : (this.era === 2 ? 28 : 38)) * (employee.experience === 'Lead' ? 1.55 : 1.32));
            const underpaid = (employee.salary || 0) < marketSalary * 0.82;
            const lowMorale = (employee.morale ?? 70) < 35;
            return senior && !pendingIds.has(employee.id) && !this.headhuntedEmployeeIds.has(employee.id) && (underpaid || lowMorale);
        });
        if (!eligible.length || Math.random() > 0.12) return;
        const employee = eligible[Math.floor(Math.random() * eligible.length)];
        const increaseRate = 0.3 + Math.random() * 0.2;
        this.pendingHeadhunts.push({
            employeeId: employee.id,
            employeeName: employee.name,
            rivalStudio: ['Silver Pixel Studios', 'Neon Forge', 'Northstar Games'][Math.floor(Math.random() * 3)],
            currentSalary: employee.salary,
            offeredSalary: Math.floor(employee.salary * (1 + increaseRate)),
            increaseRate,
            createdDay: this.simulationDay,
            // The campaign calendar advances in weekly steps, so three in-game
            // days cannot be represented as an interactive deadline. Use three
            // calendar weeks (21 game days) and expose the exact remaining time.
            deadlineDay: this.simulationDay + 21,
            deadlineDaysRemaining: 21,
            deadlineWeeksRemaining: 3,
            gameId: recentSuccess.id,
            gameName: recentSuccess.name
        });
        this.headhuntedEmployeeIds.add(employee.id);
        this.notify();
    }

    resolveHeadhunt(employeeId, action, bonus = 0) {
        const offerIndex = (this.pendingHeadhunts || []).findIndex(item => item.employeeId === employeeId);
        if (offerIndex < 0) return { success: false, message: 'La contraoferta ya no está disponible.' };
        const offer = this.pendingHeadhunts[offerIndex];
        const employee = this.employees.find(item => item.id === employeeId);
        if (!employee) {
            this.pendingHeadhunts.splice(offerIndex, 1);
            this.notify();
            return { success: false, message: 'El empleado ya no está en el estudio.' };
        }
        if (action === 'match') {
            const increase = offer.offeredSalary - employee.salary;
            if (increase > 0 && this.funds < increase) return { success: false, message: `Necesitas $${increase.toLocaleString()} para igualar el salario.` };
            if (increase > 0) this.funds -= increase;
            employee.salary = offer.offeredSalary;
            employee.salaryExpectation = Math.max(employee.salaryExpectation || 0, offer.offeredSalary);
            employee.morale = Math.min(100, (employee.morale ?? 70) + 15);
            this.pendingHeadhunts.splice(offerIndex, 1);
            this.notify();
            return { success: true, message: `${employee.name} acepta quedarse con el nuevo salario de $${offer.offeredSalary.toLocaleString()}.` };
        }
        if (action === 'bonus') {
            const bonusAmount = Math.max(0, Math.floor(Number(bonus) || employee.salary * 2));
            if (this.funds < bonusAmount) return { success: false, message: `Fondos insuficientes para el bonus de $${bonusAmount.toLocaleString()}.` };
            this.funds -= bonusAmount;
            employee.morale = Math.min(100, (employee.morale ?? 70) + 20);
            this.pendingHeadhunts.splice(offerIndex, 1);
            this.notify();
            return { success: true, message: `Bonus de $${bonusAmount.toLocaleString()} pagado; ${employee.name} se queda.` };
        }
        if (action === 'let_go') {
            this.employees = this.employees.filter(item => item.id !== employeeId);
            this.pendingHeadhunts.splice(offerIndex, 1);
            this.notify();
            return { success: true, message: `${employee.name} deja el estudio para unirse a ${offer.rivalStudio}.` };
        }
        return { success: false, message: 'Acción de contraoferta no reconocida.' };
    }

    // --- STAFF ACTIONS (COFFEE, VACATION, TRAINING) ---
    orderTeamCoffee() {
        const cost = 500;
        if (this.funds < cost) return { success: false, message: 'Fondos insuficientes para el café express.' };
        this.funds -= cost;

        this.employees.forEach(emp => {
            emp.stamina = Math.min(emp.maxStamina, emp.stamina + 35);
            emp.energy = emp.stamina;
        });

        if (soundEngine) soundEngine.playClick();
        this.notify();
        return { success: true, message: '[[DE_ICON_029]] ¡Café de alta calidad para el equipo! +35 de energía para todos.' };
    }

    sendOnVacation(empId) {
        const cost = 2000;
        if (this.funds < cost) return { success: false, message: 'Fondos insuficientes para el paquete de vacaciones ($2,000).' };
        const emp = this.employees.find(e => e.id === empId);
        if (!emp) return { success: false, message: 'Empleado no encontrado.' };

        this.funds -= cost;
        emp.stamina = emp.maxStamina;
        emp.energy = emp.stamina;

        if (soundEngine) soundEngine.playLevelUp();
        this.notify();
        return { success: true, message: `[[DE_ICON_108]] ¡${emp.name} vuelve de vacaciones totalmente renovado al 100%!` };
    }

    trainEmployee(empId, skillType) {
        // skillType: 'tech' or 'design'
        const costMoney = 3500;
        const costRP = 20;

        if (this.funds < costMoney) return { success: false, message: 'Fondos insuficientes ($3,500) para el curso intensivo.' };
        if (this.researchPoints < costRP) return { success: false, message: 'Puntos de Investigación insuficientes (20 RP).' };

        const emp = this.employees.find(e => e.id === empId);
        if (!emp) return { success: false, message: 'Empleado no encontrado.' };

        this.funds -= costMoney;
        this.researchPoints -= costRP;

        if (skillType === 'tech') {
            emp.tech += 8;
        } else {
            emp.design += 8;
        }

        if (soundEngine) soundEngine.playLevelUp();
        this.notify();
        return { success: true, message: `[[DE_ICON_109]] ¡${emp.name} ha completado la capacitación! +8 en ${skillType === 'tech' ? 'Tecnología' : 'Diseño'}.` };
    }

    // --- POST-MORTEM GAME REPORT & DESIGN INSIGHTS ---
    startPostMortemAnalysis(gameId, employeeIndex = 0) {
        const game = this.gamesHistory.find(g => g.id === gameId);
        if (!game) return { success: false, message: 'Juego no encontrado en el historial.' };
        if (game.postMortemReport || game.reported) {
            return { success: false, message: 'Este juego ya cuenta con un informe post-mortem completado.' };
        }
        if (game.postMortemInProgress) {
            return { success: false, message: 'El análisis de este videojuego ya está en curso.' };
        }
        if (this.activePostMortem) {
            return { success: false, message: `Ya hay un análisis en marcha para "${this.activePostMortem.gameName}". Espera a que concluya.` };
        }

        const staff = this.employees[employeeIndex] || this.employees[0];
        game.postMortemInProgress = true;
        this.activePostMortem = {
            gameId: game.id,
            gameName: game.name,
            employeeIndex: employeeIndex >= 0 ? employeeIndex : 0,
            employeeName: staff ? staff.name : 'Analista del Estudio',
            totalWeeks: 2,
            weeksRemaining: 2,
            progress: 0
        };

        if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        this.notify();
        return {
            success: true,
            activePostMortem: this.activePostMortem,
            message: `[[DE_ICON_011]] Análisis post-mortem iniciado para "${game.name}". ${this.activePostMortem.employeeName} analizará aciertos y errores durante 2 semanas.`
        };
    }

    completePostMortemAnalysis(gameId) {
        const game = this.gamesHistory.find(g => g.id === gameId);
        if (!game) return { success: false, message: 'Juego no encontrado.' };

        game.reported = true;
        game.postMortemInProgress = false;

        const rpGained = 28 + Math.floor((game.score || 7.0) * 2.5);
        this.researchPoints += rpGained;

        // 1. Synergy assessment (Topic + Genre) via calculateSynergy
        const topicObj = findTheme(game.topicId) || TOPICS.find(t => t.id === game.topicId);
        const synEval = calculateSynergy(game.genreId, game.topicId);
        let synergyFeedback = '';
        if (synEval.fit === 'OPTIMAL') {
            synergyFeedback = `[[DE_ICON_040]] Sinergia Extraordinaria (1.35x): La unión de ${game.topic} con ${game.genre} es magistral. Impulsó las notas de la crítica y multiplicó las ventas iniciales.`;
        } else if (synEval.fit === 'NORMAL') {
            synergyFeedback = `[[DE_ICON_097]] Afinidad Estándar (1.00x): ${game.topic} encaja de forma adecuada con el género ${game.genre}, ofreciendo una experiencia sólida y equilibrada.`;
        } else {
            synergyFeedback = `[[DE_ICON_016]] Incompatibilidad Marcada (0.60x): ${game.topic} no resuena con los seguidores de ${game.genre}. Generó descontento en los análisis y castigó las ventas.`;
        }

        // 2. Target audience hint
        const audienceHint = `[[DE_ICON_069]] Audiencia Ideal: Para ${game.topic}, el target demográfico óptimo es "${topicObj ? topicObj.idealAudience : 'Everyone'}".`;

        // 3. Technical architecture, DAG friction & code debt
        let architectureFeedback = '';
        const rawDebt = game.techDebt !== undefined ? game.techDebt : (game.bugs || 0);
        const frictionMult = game.friction ? (game.friction / 100 + 1) : 1.0;
        if (rawDebt > 25 || frictionMult > 1.25) {
            architectureFeedback = `[[DE_ICON_016]] Lastre de Deuda Técnica: La deuda técnica acumulada (${Math.round(rawDebt)} pts) generó fricción notable que desestabilizó el juego y ralentizó las ventas iniciales en la semana 1.`;
        } else if (rawDebt <= 10) {
            architectureFeedback = `[[DE_ICON_023]] Código Limpio & Modular: Arquitectura robusta sin deuda técnica crítica. El motor y los módulos rindieron de forma estable durante el pico inicial.`;
        } else {
            architectureFeedback = `[[DE_ICON_110]] Balance Técnico Equilibrado: Se detectó deuda técnica moderada (${Math.round(rawDebt)} pts), pero no causó regresiones catastróficas tras el lanzamiento.`;
        }

        const engineFeedback = (game.pipelineType === 'in_house' || (game.engine && game.engine.isProprietary))
            ? `[[DE_ICON_049]] Motor Propio: La arquitectura in-house proporcionó independencia tecnológica y mejor adaptabilidad para ${game.genre}.`
            : `[[DE_ICON_049]] Motor Comercial: La solución de terceros permitió una salida al mercado rápida con costes de I+D contenidos.`;

        // 4. Optimal design slider calibration learned for this genre
        const genreRules = {
            Action: 'Fase 1: Enfoque 50% Jugabilidad y 30% Motor; Fase 2: 45% Diseño de Niveles e IA; Fase 3: 45% Gráficos y 35% Sonido.',
            RPG: 'Fase 1: Enfoque 50% Historia y Guion; Fase 2: 45% Diálogos y Quests; Fase 3: 45% Construcción del Mundo.',
            Strategy: 'Fase 1: Enfoque 45% Motor y Reglas; Fase 2: 50% Inteligencia Artificial y Mapas; Fase 3: 40% World & Balance.',
            Simulation: 'Fase 1: Enfoque 45% Física y Mecánicas; Fase 2: 45% Sistemas e IA; Fase 3: 35% Sonido y Feedback.',
            Adventure: 'Fase 1: Enfoque 45% Guion y Enigmas; Fase 2: 45% Puzzles y Diálogos; Fase 3: 45% Gráficos Atmosféricos.',
            Casual: 'Fase 1: Enfoque 60% Jugabilidad Inmediata; Fase 2: 50% Curva de Dificultad; Fase 3: 45% Pulido Visual y Sonido.'
        };
        const sliderCalibration = genreRules[game.genre] || 'Equilibra el peso entre Jugabilidad y Fidelidad Visual según el público objetivo.';

        const report = {
            gameId: game.id,
            gameName: game.name,
            score: game.score,
            rpGained,
            synergy: synergyFeedback,
            audience: audienceHint,
            architecture: `${architectureFeedback} ${engineFeedback}`,
            sliderCalibration,
            completedYear: this.getHistoricalYear(),
            completedWeek: this.week
        };

        game.postMortemReport = report;

        this.discoveredInsights.push({
            title: game.name,
            synergy: synergyFeedback,
            audience: audienceHint,
            architecture: architectureFeedback,
            sliderCalibration
        });

        if (soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
        this.notify();

        return {
            success: true,
            rpGained,
            report,
            message: `[[DE_ICON_030]] Informe post-mortem de "${game.name}" finalizado. +${rpGained} RP obtenidos para I+D.`
        };
    }

    generateGameReport(gameId) {
        return this.completePostMortemAnalysis(gameId);
    }

    // --- MANUAL RETIREMENT FROM MARKET (END OF LIFE) ---
    retireGameFromMarket(gameId) {
        const gameIndex = this.activeSales.findIndex(g => g.id === gameId);
        const game = gameIndex >= 0 ? this.activeSales[gameIndex] : this.gamesHistory.find(g => g.id === gameId);
        if (!game) return { success: false, message: 'Videojuego no encontrado en el catálogo.' };
        if (game.retired) return { success: false, message: 'Este videojuego ya ha sido retirado del mercado.' };

        game.retired = true;
        game.status = 'RETIRED';
        game.lifecycleState = 'retired';
        game.retiredYear = this.getHistoricalYear();
        game.retiredWeek = this.week;

        // If Live-Service or Free-to-Play, stop servers and cease all ongoing maintenance costs
        if (['f2p', 'live_service'].includes(game.businessModel)) {
            game.serversClosed = true;
            game.mau = 0;
            game.dailyActiveUsers = [];
        }

        // Remove from active weekly loop
        if (gameIndex >= 0) {
            this.activeSales.splice(gameIndex, 1);
        }

        // Synchronize and lock totals in gamesHistory
        const histRef = this.gamesHistory.find(g => g.id === gameId);
        if (histRef) {
            histRef.retired = true;
            histRef.status = 'RETIRED';
            histRef.lifecycleState = 'retired';
            histRef.retiredYear = game.retiredYear;
            histRef.retiredWeek = game.retiredWeek;
            histRef.finalProfit = game.profit;
            histRef.finalUnitsSold = game.unitsSoldTotal || game.installationsTotal || 0;
            histRef.finalRevenue = game.revenueTotal;
        }

        if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        this.notify();
        return {
            success: true,
            game,
            message: `[[DE_ICON_013]] "${game.name}" ha sido retirado oficialmente del mercado. Se detienen los costes de soporte y se congelan sus cifras definitivas en el catálogo.`
        };
    }

    // --- MEGA GAME EXPO INTERACTIVE LOGIC ---
    executeExpoAttendance(tier = 1, merchBonus = false, interviewBonus = false) {
        let baseCost = 5000;
        let baseFans = 65;
        let baseHype = 18;
        let basePress = 4;
        let tierName = 'Stand Pequeño Indie';

        if (tier === 2) {
            baseCost = 22000;
            baseFans = 290;
            baseHype = 48;
            basePress = 12;
            tierName = 'Gran Expositor Central';
        } else if (tier === 3) {
            baseCost = 65000;
            baseFans = 890;
            baseHype = 95;
            basePress = 28;
            tierName = 'Keynote Principal / Mega Pabellón AAA';
        }

        let totalCost = baseCost + (merchBonus ? 600 : 0);
        if (this.funds < totalCost) {
            return { success: false, message: `Fondos insuficientes ($${totalCost.toLocaleString()}) para cubrir los costes de la feria.` };
        }

        this.funds -= totalCost;

        // Quality scaling based on recent games catalog
        const recentScores = this.gamesHistory.slice(-3).map(g => g.score || 6.5);
        const avgScore = recentScores.length ? (recentScores.reduce((a, b) => a + b, 0) / recentScores.length) : 7.0;
        const qualityMultiplier = Math.max(0.75, avgScore / 7.2);

        const finalFans = Math.floor(baseFans * qualityMultiplier * (merchBonus ? 1.3 : 1.0));
        const finalHype = Math.floor(baseHype * qualityMultiplier * (interviewBonus ? 1.35 : 1.0));
        const finalPress = Math.floor(basePress * (interviewBonus ? 1.6 : 1.0));

        this.fans += finalFans;

        // Boost active sales potential
        const eraMultiplier = this.era === 1 ? 1 : (this.era === 2 ? 3 : 8);
        this.activeSales.forEach(g => {
            g.salesPotential = (g.salesPotential || 1000) + Math.floor(finalHype * 40 * eraMultiplier);
        });

        if (soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
        this.notify();

        return {
            success: true,
            tier,
            tierName,
            cost: totalCost,
            fansGained: finalFans,
            hypeGained: finalHype,
            pressMentions: finalPress,
            message: `[[DE_ICON_074]] ¡Éxito en la convención! Tu stand (${tierName}) cosechó +${finalFans} nuevos fans, +${finalPress} menciones en prensa y +${finalHype} de Hype global.`
        };
    }

    // --- TOPIC PROGRESSION & RESEARCH (SUBAGENTE 2) ---
    getUnlockedTopics() {
        if (!this.unlockedTopicIds || !this.unlockedTopicIds.length) {
            this.unlockedTopicIds = ['medieval', 'fantasy', 'sports', 'space', 'martial_arts', 'ninja'];
        }
        return THEMES_DATABASE.filter(t => this.unlockedTopicIds.some(id => id.toLowerCase() === t.id.toLowerCase() || (t.aliases && t.aliases.some(a => a.toLowerCase() === id.toLowerCase()))));
    }

    getLockedTopics(historicalYear = this.getHistoricalYear()) {
        const unlocked = this.getUnlockedTopics();
        const unlockedIds = new Set(unlocked.map(t => t.id.toLowerCase()));
        return THEMES_DATABASE.filter(t => !unlockedIds.has(t.id.toLowerCase()) && (t.unlockedYear <= historicalYear));
    }

    getFutureTopics(historicalYear = this.getHistoricalYear()) {
        return THEMES_DATABASE.filter(t => t.unlockedYear > historicalYear);
    }

    startTopicResearch(topicId, employeeIndex = 0) {
        if (this.activeTopicResearch) {
            return {
                success: false,
                message: `Ya se está investigando la temática "${this.activeTopicResearch.topicName}". Espera a que finalice.`
            };
        }
        const topicDef = findTheme(topicId) || TOPICS.find(t => t.id === topicId);
        if (!topicDef) return { success: false, message: 'Temática no encontrada en el catálogo.' };
        if (this.getUnlockedTopics().some(t => t.id.toLowerCase() === topicDef.id.toLowerCase())) {
            return { success: false, message: `La temática "${topicDef.name}" ya está desbloqueada.` };
        }
        const historicalYear = this.getHistoricalYear();
        if (topicDef.unlockedYear > historicalYear) {
            return { success: false, message: `La temática "${topicDef.name}" pertenece a una era posterior (${topicDef.unlockedYear}).` };
        }
        const costRP = topicDef.costRP || 20;
        if (this.researchPoints < costRP) {
            return { success: false, message: `Puntos de I+D insuficientes. Requiere ${costRP} RP (disponibles: ${this.researchPoints} RP).` };
        }

        const dev = this.employees[employeeIndex] || this.employees[0];
        this.researchPoints -= costRP;
        const totalWeeks = 2; // 2 semanas de estudio del empleado

        this.activeTopicResearch = {
            topicId: topicDef.id,
            topicName: topicDef.name,
            totalWeeks,
            weeksRemaining: totalWeeks,
            progress: 0,
            employeeIndex: employeeIndex >= 0 ? employeeIndex : 0,
            employeeName: dev ? dev.name : 'Desarrollador'
        };

        if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        this.notify();
        return {
            success: true,
            totalWeeks,
            costRP,
            message: `[[DE_ICON_028]] Investigación de temática iniciada: "${topicDef.name}". ${this.activeTopicResearch.employeeName} la estudiará durante 2 semanas.`
        };
    }

    // --- GENRE PROGRESSION & RESEARCH (SUBAGENTE 1 & 2) ---
    getUnlockedGenres() {
        if (!this.unlockedGenreIds || !this.unlockedGenreIds.length) {
            this.unlockedGenreIds = ['action', 'Action', 'adventure', 'Adventure', 'rpg', 'RPG', 'strategy', 'Strategy', 'simulation', 'Simulation', 'casual', 'Casual'];
        }
        return GENRES_DATABASE.filter(g => this.unlockedGenreIds.some(id => id.toLowerCase() === g.id.toLowerCase() || (g.aliases && g.aliases.some(a => a.toLowerCase() === id.toLowerCase()))));
    }

    getLockedGenres(historicalYear = this.getHistoricalYear()) {
        const unlocked = this.getUnlockedGenres();
        const unlockedIds = new Set(unlocked.map(g => g.id.toLowerCase()));
        return GENRES_DATABASE.filter(g => !unlockedIds.has(g.id.toLowerCase()) && (g.unlockedYear <= historicalYear));
    }

    getFutureGenres(historicalYear = this.getHistoricalYear()) {
        return GENRES_DATABASE.filter(g => g.unlockedYear > historicalYear);
    }

    startGenreResearch(genreId, employeeIndex = 0) {
        if (this.activeGenreResearch) {
            return {
                success: false,
                message: `Ya se está investigando el género "${this.activeGenreResearch.genreName}". Espera a que finalice.`
            };
        }
        const genreDef = findGenre(genreId) || GENRES.find(g => g.id === genreId);
        if (!genreDef) return { success: false, message: 'Género no encontrado en el catálogo.' };
        if (this.getUnlockedGenres().some(g => g.id.toLowerCase() === genreDef.id.toLowerCase())) {
            return { success: false, message: `El género "${genreDef.name}" ya está desbloqueado.` };
        }
        const historicalYear = this.getHistoricalYear();
        if (genreDef.unlockedYear > historicalYear) {
            return { success: false, message: `El género "${genreDef.name}" pertenece a una era posterior (${genreDef.unlockedYear}).` };
        }
        const costRP = genreDef.costRP || 30;
        if (this.researchPoints < costRP) {
            return { success: false, message: `Puntos de I+D insuficientes. Requiere ${costRP} RP (disponibles: ${this.researchPoints} RP).` };
        }

        const dev = this.employees[employeeIndex] || this.employees[0];
        this.researchPoints -= costRP;
        const totalWeeks = 3; // 3 semanas de estudio de género

        this.activeGenreResearch = {
            genreId: genreDef.id,
            genreName: genreDef.name,
            totalWeeks,
            weeksRemaining: totalWeeks,
            progress: 0,
            employeeIndex: employeeIndex >= 0 ? employeeIndex : 0,
            employeeName: dev ? dev.name : 'Desarrollador'
        };

        if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        this.notify();
        return {
            success: true,
            totalWeeks,
            costRP,
            message: `[[DE_ICON_001]] Investigación de género iniciada: "${genreDef.name}". ${this.activeGenreResearch.employeeName} lo estudiará durante 3 semanas.`
        };
    }

    // --- RESEARCH & DEVELOPMENT (I+D / TECH TREE) ---
    startTechResearch(techId) {
        if (!this.techTreeManager) return { success: false, message: 'Gestor de árbol tecnológico no inicializado.' };

        const historicalYear = this.getHistoricalYear();
        const stateInfo = this.techTreeManager.getNodeState(techId, historicalYear);

        if (stateInfo.state === 'DESBLOQUEADO') {
            return { success: false, message: 'Esta tecnología ya ha sido investigada y desbloqueada.' };
        }

        if (stateInfo.state === 'BLOQUEADO') {
            return { success: false, message: stateInfo.reason };
        }

        const nodeDef = this.techTreeManager.catalogMap.get(techId);
        if (!nodeDef) return { success: false, message: 'Tecnología no encontrada en el catálogo.' };

        const costRP = nodeDef.costRP ?? nodeDef.researchCost ?? 30;
        if (this.researchPoints < costRP) {
            return { success: false, message: `Puntos de I+D insuficientes. Requiere ${costRP} RP (disponibles: ${this.researchPoints} RP).` };
        }

        if (this.activeResearch) {
            return { success: false, message: `Ya hay un proyecto de investigación activo ("${this.activeResearch.nodeName}"). Espera a que finalice.` };
        }

        // Deduct RP immediately upon starting research
        this.researchPoints -= costRP;

        // Duration in weeks: 2 to 6 weeks based on RP cost
        const totalWeeks = Math.max(2, Math.min(6, Math.floor(costRP / 30) + 1));

        this.activeResearch = {
            techId: nodeDef.id,
            nodeName: nodeDef.name,
            icon: nodeDef.icon || '[[DE_ICON_006]]',
            costRP: costRP,
            totalWeeks: totalWeeks,
            weeksRemaining: totalWeeks,
            progress: 0
        };

        if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        this.notify();
        return {
            success: true,
            totalWeeks,
            costRP,
            message: `[[DE_ICON_006]] Proyecto de I+D iniciado: "${nodeDef.name}". El equipo comenzará la investigación durante ${totalWeeks} semanas.`
        };
    }

    reverseEngineerHardware(hwId) {
        if (typeof REVERSE_ENGINEERING_CATALOG === 'undefined') {
            return { success: false, message: 'Catálogo de hardware rival no disponible.' };
        }

        const item = REVERSE_ENGINEERING_CATALOG.find(h => h.id === hwId);
        if (!item) return { success: false, message: 'Dispositivo no encontrado en el mercado.' };

        const historicalYear = this.getHistoricalYear();
        if (historicalYear < item.minYear) {
            return { success: false, message: `Este dispositivo de la competencia no existe en el mercado aún (Aparición estimada: Año ${item.minYear}).` };
        }

        if (this.techTreeManager && this.techTreeManager.dismantledHardware.has(hwId)) {
            return { success: false, message: `Ya has desmantelado y analizado este dispositivo previamente.` };
        }

        if (this.funds < item.costMoney) {
            return { success: false, message: `Fondos insuficientes ($${item.costMoney.toLocaleString()} requeridos para comprar el hardware).` };
        }

        this.funds -= item.costMoney;
        this.researchPoints += item.rpGain;
        if (this.techTreeManager) {
            this.techTreeManager.dismantledHardware.add(hwId);
        }

        if (soundEngine && soundEngine.playCash) soundEngine.playCash();
        if (soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
        this.notify();

        return {
            success: true,
            rpGain: item.rpGain,
            message: `[[DE_ICON_106]] ¡Ingeniería Inversa completada! Has desmantelado "${item.name}" y obtenido +${item.rpGain} Puntos de I+D.`
        };
    }

    researchTechnology(techId) {
        // Compatibility bridge: if techId exists in Scope DAG Tech Tree, route to startTechResearch
        if (this.techTreeManager && this.techTreeManager.catalogMap.has(techId)) {
            return this.startTechResearch(techId);
        }
        const tech = (typeof ENGINE_TECH_CATALOG !== 'undefined') ? ENGINE_TECH_CATALOG.find(t => t.id === techId) : null;
        if (!tech || tech.researched) return { success: false, message: 'Tecnología ya investigada o inválida' };

        // Check prerequisites
        if (tech.requires && !this.researchedTechs.includes(tech.requires)) {
            const reqTech = ENGINE_TECH_CATALOG.find(t => t.id === tech.requires);
            return { success: false, message: `Requiere investigar previamente: "${reqTech ? reqTech.name : tech.requires}".` };
        }

        if (this.researchPoints < tech.costRP) return { success: false, message: `Puntos de Investigación insuficientes (${tech.costRP} RP requeridos)` };

        this.researchPoints -= tech.costRP;
        tech.researched = true;
        this.researchedTechs.push(tech.id);

        if (soundEngine) soundEngine.playLevelUp();
        this.notify();
        return { success: true };
    }

    createCustomEngine(name, selectedTechIds) {
        const cost = 22000 + selectedTechIds.length * 6000;
        if (this.funds < cost) {
            return { success: false, message: `Fondos insuficientes ($${cost.toLocaleString()}) para compilar y registrar el motor.` };
        }
        this.funds -= cost;

        let totalBonusTech = 0;
        let totalBonusDesign = 0;
        let totalBonusScore = 0.20;

        selectedTechIds.forEach(id => {
            const t = ENGINE_TECH_CATALOG.find(x => x.id === id);
            if (t) {
                totalBonusTech += t.bonusTech || 10;
                totalBonusDesign += t.bonusDesign || 10;
                totalBonusScore += t.bonusScore || 0.15;
            }
        });

        const newEngine = {
            id: 'engine_' + Date.now(),
            name: name || 'Custom Engine v' + (this.customEngines.length + 1),
            features: [...selectedTechIds],
            bonusTech: totalBonusTech,
            bonusDesign: totalBonusDesign,
            bonusScore: totalBonusScore
        };
        this.customEngines.push(newEngine);

        if (soundEngine) soundEngine.playCash();
        this.notify();
        return { success: true, engine: newEngine };
    }

    // --- IN-HOUSE ENGINE R&D, UPGRADE & LICENSING PIPELINE ---
    startInHouseEngineRD(config = {}) {
        // config: { name, affineGenres, bakedNodes }
        const bakedNodes = config.bakedNodes || ['render_raster', 'physics_basic', 'net_singleplayer', 'content_linear'];
        const historicalTechIds = [...new Set(config.historicalTechIds || [])];
        const validation = this.techTreeManager.validateSelection(historicalTechIds, this.getHistoricalYear());
        if (!validation.valid) return { success: false, message: validation.errors.join(' ') };
        const incompatibility = calculateTechIncompatibility(historicalTechIds);
        const engineWeeks = Math.ceil(8 * incompatibility.multiplier);
        const affineGenres = config.affineGenres || ['Action', 'RPG'];
        if (this.activeEngineRD) return { success: false, message: 'Ya hay un proyecto de I+D de motor en curso.' };
        const costMoney = 18000 + (bakedNodes.length * 2000);
        const costRP = 10 + (bakedNodes.length * 3);

        if (this.funds < costMoney) {
            return { success: false, message: `Fondos insuficientes ($${costMoney.toLocaleString()}) para financiar el I+D del motor propio.` };
        }
        if (this.researchPoints < costRP) {
            return { success: false, message: `Puntos de investigación insuficientes (${costRP} RP) para la arquitectura de I+D.` };
        }

        this.funds -= costMoney;
        this.researchPoints -= costRP;
        const seniorProgrammers = this.employees.filter(e => (e.tech || 0) >= 30 && (!e.role || /program|desarroll|ingenier|líder/i.test(e.role)));
        if (seniorProgrammers.length === 0) {
            this.funds += costMoney;
            this.researchPoints += costRP;
            return { success: false, message: 'Necesitas al menos un programador con 30+ de habilidad técnica para liderar el motor.' };
        }
        const leadSenior = seniorProgrammers[0];
        const leadIndex = this.employees.indexOf(leadSenior);
        this.activeEngineRD = {
            name: config.name || 'Proprietary Core v' + (this.inHouseEngines.length + 1),
            affineGenres,
            bakedNodes,
            historicalTechIds,
            historicalIncompatibility: incompatibility,
            totalWeeks: engineWeeks,
            weeksRemaining: engineWeeks,
            progress: 0,
            leadProgrammerIndex: leadIndex >= 0 ? leadIndex : 0,
            leadProgrammerName: leadSenior.name
        };
        this.notify();
        return { success: true, project: this.activeEngineRD, message: `[[DE_ICON_094]] Proyecto de I+D iniciado: "${this.activeEngineRD.name}". ${leadSenior.name} lidera la arquitectura durante ${engineWeeks} semanas.` };
    }

    upgradeInHouseEngine(engineId, newNodes = [], historicalNodes = []) {
        const engine = this.inHouseEngines.find(e => e.id === engineId);
        if (!engine) return { success: false, message: 'Motor no encontrado.' };
        const historicalTechIds = [...new Set([...(engine.historicalTechIds || []), ...historicalNodes])];
        const validation = this.techTreeManager.validateSelection(historicalTechIds, this.getHistoricalYear());
        if (!validation.valid) return { success: false, message: validation.errors.join(' ') };

        const costMoney = 20000 + (newNodes.length * 4000);
        const costRP = 25;
        if (this.funds < costMoney) return { success: false, message: `Fondos insuficientes ($${costMoney.toLocaleString()}) para actualizar la tecnología del motor.` };
        if (this.researchPoints < costRP) return { success: false, message: `Puntos de investigación insuficientes (${costRP} RP) para actualizar el motor.` };

        this.funds -= costMoney;
        this.researchPoints -= costRP;

        let res = null;
        if (typeof engine.upgradeEngine === 'function') {
            res = engine.upgradeEngine(newNodes, this.year, this.week);
        } else {
            engine.lastUpdatedYear = this.year;
            engine.lastUpdatedWeek = this.week;
            res = { success: true, message: `Motor ${engine.name} actualizado con éxito.` };
        }

        if (res?.success) {
            engine.historicalTechIds = historicalTechIds;
            engine.historicalIncompatibility = calculateTechIncompatibility(historicalTechIds);
        }
        if (soundEngine) soundEngine.playLevelUp();
        this.notify();
        return res;
    }

    licenseInHouseEngineToStudio(engineId, studioName, monthlyFee = 4500) {
        const engine = this.inHouseEngines.find(e => e.id === engineId);
        if (!engine) return { success: false, message: 'Motor no encontrado.' };

        if (typeof engine.licenseToStudio === 'function') {
            const res = engine.licenseToStudio(studioName, monthlyFee);
            if (res.success && soundEngine) soundEngine.playCash();
            this.notify();
            return res;
        }

        engine.licensees = engine.licensees || [];
        engine.licensees.push({ studioName, monthlyRoyalty: monthlyFee });
        this.notify();
        return { success: true, message: `Licencia concedida a ${studioName} por $${monthlyFee}/mes.` };
    }

    setProjectDevMode(mode) {
        // mode: 'normal' | 'crunch' | 'refactor'
        if (!this.currentProject) return { success: false, message: 'No hay proyecto activo.' };
        this.currentProject.devMode = mode;
        if (mode === 'normal' || mode === 'crunch') this.workMode = mode;
        if (mode === 'refactor') this.workMode = 'normal';
        if (this.currentProject.techDebtModel) {
            if (mode === 'crunch') {
                this.currentProject.techDebtModel.setCrunchMode(true);
            } else if (mode === 'refactor') {
                this.currentProject.techDebtModel.setRefactorMode(true);
            } else {
                this.currentProject.techDebtModel.setCrunchMode(false);
                this.currentProject.techDebtModel.setRefactorMode(false);
            }
        }
        this.notify();
        return { success: true, mode };
    }

    refactorCodebase() {
        return this.setProjectDevMode('refactor');
    }

    // Acción Activa: "Refactorizar / Limpiar Código" (Punto 4)
    refactorTechDebt() {
        if (!this.currentProject) {
            return { success: false, message: 'No hay proyecto en desarrollo para refactorizar.' };
        }
        const newMode = (this.currentProject.devMode === 'refactor') ? 'normal' : 'refactor';
        this.setProjectDevMode(newMode);
        const msg = (newMode === 'refactor')
            ? 'Refactorización activa: el equipo frena el avance de características (Progreso = 0%) para pagar deuda técnica y sanear código.'
            : 'Refactorización finalizada: el equipo reanuda la producción regular de nodos.';
        return { success: true, mode: newMode, message: msg };
    }

    // Acción Post-Lanzamiento: "Parche de Emergencia" (Punto 5)
    deployEmergencyPatch() {
        if (!this.isEmergencyPatchActive || !this.emergencyPatchData) {
            return { success: false, message: 'No hay ninguna crisis post-lanzamiento activa en este momento.' };
        }
        const patchCost = 4500;
        if (this.funds < patchCost) {
            return {
                success: false,
                message: `Fondos insuficientes para costear el hotfix de emergencia ($${patchCost.toLocaleString()} requeridos).`
            };
        }
        this.funds -= patchCost;

        // Estabilizar deuda del título por debajo de umbral bajo (<= 20)
        if (this.emergencyPatchData.debtModel) {
            this.emergencyPatchData.debtModel.rawDebt = 14;
            this.emergencyPatchData.debtModel.updateDerivedMetrics();
        }
        this.emergencyPatchData.currentDebt = 14;
        this.isEmergencyPatchActive = false;

        // Recuperación de buena voluntad en la comunidad
        this.fans += 180;

        if (soundEngine) {
            soundEngine.playFanfare(8.5);
        }
        this.notify();

        return {
            success: true,
            message: `[[DE_ICON_015]] ¡Parche de Emergencia Hotfix v1.1 desplegado con éxito! La deuda técnica ha descendido a 14 pts (Código Limpio). Los servidores se han estabilizado y la comunidad te recompensa con +180 fans.`
        };
    }
}

// Global game instance
const game = new TycoonGame();

export {
    game,
    GENRES,
    GENRES_DATABASE,
    findGenre,
    PLATFORMS,
    TOPICS,
    THEMES_DATABASE,
    findTheme,
    calculateSynergy
};
