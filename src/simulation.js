import { soundEngine } from './audio.js';
import { CommercialEngineCatalog, InHouseEngine, REVERSE_ENGINEERING_CATALOG, ScopeDAG, TechnicalDebtModel, TechTreeManager } from './dag_engine.js';

/**
 * DEV EMPIRE 3D - Complete Tycoon Simulation Engine
 * Deep, balanced mathematical systems inspired by Game Dev Tycoon & Software Inc.
 * 24 Topics x 6 Genres synergy matrix, 4 specialized press critics,
 * true Top 10 rival leaderboard, 3-stage slider balance, procedural recruitment,
 * stamina/fatigue model, research tree with prerequisites, and emergent market events.
 */

// --- 1. TOPICS (24 Rich Themes with Genre Fits & Target Audiences) ---
const TOPICS = [
    { id: 'scifi', name: 'Ciencia Ficción', idealAudience: 'Everyone', genreFit: { Action: 1.25, RPG: 1.30, Strategy: 1.35, Simulation: 1.10, Adventure: 1.15, Casual: 0.65 } },
    { id: 'cyberpunk', name: 'Cyberpunk', idealAudience: 'Mature', genreFit: { Action: 1.35, RPG: 1.35, Strategy: 1.00, Simulation: 0.85, Adventure: 1.20, Casual: 0.60 } },
    { id: 'fantasy', name: 'Fantasía Medieval', idealAudience: 'Everyone', genreFit: { Action: 1.15, RPG: 1.35, Strategy: 1.30, Simulation: 0.75, Adventure: 1.25, Casual: 0.70 } },
    { id: 'space', name: 'Exploración Espacial', idealAudience: 'Everyone', genreFit: { Action: 0.95, RPG: 1.15, Strategy: 1.30, Simulation: 1.35, Adventure: 1.20, Casual: 0.70 } },
    { id: 'zombie', name: 'Supervivencia Zombie', idealAudience: 'Mature', genreFit: { Action: 1.35, RPG: 1.20, Strategy: 1.15, Simulation: 1.00, Adventure: 1.15, Casual: 0.65 } },
    { id: 'dungeon', name: 'Dungeon Crawler', idealAudience: 'Everyone', genreFit: { Action: 1.25, RPG: 1.35, Strategy: 1.15, Simulation: 0.70, Adventure: 1.10, Casual: 0.80 } },
    { id: 'citybuilder', name: 'Constructor de Ciudades', idealAudience: 'Everyone', genreFit: { Action: 0.50, RPG: 0.70, Strategy: 1.35, Simulation: 1.35, Adventure: 0.60, Casual: 0.95 } },
    { id: 'hospital', name: 'Gestor de Hospital', idealAudience: 'Everyone', genreFit: { Action: 0.50, RPG: 0.75, Strategy: 1.25, Simulation: 1.35, Adventure: 0.70, Casual: 1.15 } },
    { id: 'racing', name: 'Carreras Callejeras', idealAudience: 'Everyone', genreFit: { Action: 1.30, RPG: 0.70, Strategy: 0.75, Simulation: 1.35, Adventure: 0.70, Casual: 1.20 } },
    { id: 'virtualpet', name: 'Mascota Virtual', idealAudience: 'Young', genreFit: { Action: 0.55, RPG: 0.80, Strategy: 0.80, Simulation: 1.30, Adventure: 0.85, Casual: 1.35 } },
    { id: 'hacking', name: 'Simulador Hacker', idealAudience: 'Mature', genreFit: { Action: 0.90, RPG: 1.10, Strategy: 1.30, Simulation: 1.35, Adventure: 1.20, Casual: 0.65 } },
    { id: 'military', name: 'Guerra Táctica', idealAudience: 'Mature', genreFit: { Action: 1.30, RPG: 0.90, Strategy: 1.35, Simulation: 1.20, Adventure: 0.75, Casual: 0.60 } },
    { id: 'postapoc', name: 'Post-Apocalipsis', idealAudience: 'Mature', genreFit: { Action: 1.30, RPG: 1.35, Strategy: 1.15, Simulation: 1.00, Adventure: 1.20, Casual: 0.60 } },
    { id: 'comedy', name: 'Comedia Absurda', idealAudience: 'Everyone', genreFit: { Action: 0.85, RPG: 0.95, Strategy: 0.75, Simulation: 0.95, Adventure: 1.35, Casual: 1.30 } },
    { id: 'mystery', name: 'Misterio Detective', idealAudience: 'Mature', genreFit: { Action: 0.80, RPG: 1.15, Strategy: 0.90, Simulation: 0.85, Adventure: 1.35, Casual: 0.85 } },
    { id: 'superhero', name: 'Superhéroes', idealAudience: 'Young', genreFit: { Action: 1.35, RPG: 1.25, Strategy: 0.90, Simulation: 0.70, Adventure: 1.20, Casual: 0.85 } },
    { id: 'horror', name: 'Terror Psicológico', idealAudience: 'Mature', genreFit: { Action: 1.20, RPG: 1.15, Strategy: 0.60, Simulation: 0.80, Adventure: 1.35, Casual: 0.60 } },
    { id: 'sports', name: 'Deportes & Fútbol', idealAudience: 'Everyone', genreFit: { Action: 1.25, RPG: 0.75, Strategy: 1.20, Simulation: 1.35, Adventure: 0.60, Casual: 1.25 } },
    { id: 'ninja', name: 'Artes Marciales & Ninja', idealAudience: 'Young', genreFit: { Action: 1.35, RPG: 1.20, Strategy: 0.90, Simulation: 0.70, Adventure: 1.10, Casual: 0.85 } },
    { id: 'western', name: 'Viejo Oeste & Forajidos', idealAudience: 'Mature', genreFit: { Action: 1.35, RPG: 1.30, Strategy: 1.10, Simulation: 0.85, Adventure: 1.25, Casual: 0.70 } },
    { id: 'pirate', name: 'Piratas & Corsarios', idealAudience: 'Everyone', genreFit: { Action: 1.25, RPG: 1.25, Strategy: 1.25, Simulation: 0.90, Adventure: 1.30, Casual: 0.80 } },
    { id: 'farming', name: 'Vida Rural & Granja', idealAudience: 'Everyone', genreFit: { Action: 0.50, RPG: 1.15, Strategy: 1.10, Simulation: 1.35, Adventure: 0.95, Casual: 1.35 } },
    { id: 'anime', name: 'Anime & Novela Visual', idealAudience: 'Young', genreFit: { Action: 1.05, RPG: 1.35, Strategy: 0.80, Simulation: 0.85, Adventure: 1.35, Casual: 1.05 } },
    { id: 'espionage', name: 'Espionaje & Infiltración', idealAudience: 'Mature', genreFit: { Action: 1.30, RPG: 1.15, Strategy: 1.25, Simulation: 1.05, Adventure: 1.30, Casual: 0.65 } }
];

// --- 2. GENRES & IDEAL ARCHITECTURE / 3-STAGE SLIDER DISTRIBUTIONS ---
const GENRES = [
    {
        id: 'Action',
        name: 'Acción',
        idealStage1: { engine: 0.90, gameplay: 0.85, story: 0.30 },
        idealStage2: { dialogues: 0.30, levelDesign: 0.85, ai: 0.85 },
        idealStage3: { worldDesign: 0.55, graphics: 0.95, sound: 0.85 },
        architectureProfile: { engine: 0.25, gameplay: 0.35, net: 0.10, art: 0.20, qa: 0.10 }
    },
    {
        id: 'RPG',
        name: 'RPG (Rol)',
        idealStage1: { engine: 0.60, gameplay: 0.85, story: 0.95 },
        idealStage2: { dialogues: 0.95, levelDesign: 0.75, ai: 0.65 },
        idealStage3: { worldDesign: 0.95, graphics: 0.80, sound: 0.80 },
        architectureProfile: { engine: 0.15, gameplay: 0.30, net: 0.05, art: 0.35, qa: 0.15 }
    },
    {
        id: 'Strategy',
        name: 'Estrategia',
        idealStage1: { engine: 0.80, gameplay: 0.95, story: 0.40 },
        idealStage2: { dialogues: 0.40, levelDesign: 0.95, ai: 0.95 },
        idealStage3: { worldDesign: 0.70, graphics: 0.60, sound: 0.65 },
        architectureProfile: { engine: 0.20, gameplay: 0.35, net: 0.15, art: 0.10, qa: 0.20 }
    },
    {
        id: 'Simulation',
        name: 'Simulación',
        idealStage1: { engine: 0.95, gameplay: 0.90, story: 0.20 },
        idealStage2: { dialogues: 0.25, levelDesign: 0.85, ai: 0.90 },
        idealStage3: { worldDesign: 0.85, graphics: 0.80, sound: 0.70 },
        architectureProfile: { engine: 0.35, gameplay: 0.25, net: 0.05, art: 0.15, qa: 0.20 }
    },
    {
        id: 'Adventure',
        name: 'Aventura Gráfica',
        idealStage1: { engine: 0.45, gameplay: 0.70, story: 0.95 },
        idealStage2: { dialogues: 0.95, levelDesign: 0.80, ai: 0.40 },
        idealStage3: { worldDesign: 0.90, graphics: 0.85, sound: 0.85 },
        architectureProfile: { engine: 0.10, gameplay: 0.25, net: 0.05, art: 0.40, qa: 0.20 }
    },
    {
        id: 'Casual',
        name: 'Casual / Arcade',
        idealStage1: { engine: 0.40, gameplay: 0.95, story: 0.20 },
        idealStage2: { dialogues: 0.20, levelDesign: 0.85, ai: 0.40 },
        idealStage3: { worldDesign: 0.60, graphics: 0.80, sound: 0.85 },
        architectureProfile: { engine: 0.15, gameplay: 0.40, net: 0.10, art: 0.20, qa: 0.15 }
    }
];

// --- 2.1 ARCHITECTURE DAG NODES CATALOG (16 NODES, 4 TIERS, 5 DISCIPLINES) ---
const ARCHITECTURE_NODES = [
    // TIER 1: FUNDACIONES
    {
        id: 'core_loop',
        name: 'Core Loop & Frame Scheduler',
        tier: 1,
        icon: '⏱️',
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
        icon: '🧩',
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
        icon: '🎨',
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
        icon: '🧪',
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
        icon: '🕹️',
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
        icon: '⚛️',
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
        icon: '🌐',
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
        icon: '⚙️',
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
        icon: '🧠',
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
        icon: '✨',
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
        icon: '⚡',
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
        icon: '💾',
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
        icon: '⚔️',
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
        icon: '🔮',
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
        icon: '🔄',
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
        icon: '🛡️',
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
        name: '⚡ Indie Ágil',
        desc: 'Scope ligero, desarrollo veloz y código limpio.',
        nodes: ['core_loop', 'state_machine', 'forward_renderer', 'unit_test_suite']
    },
    aa: {
        id: 'aa',
        name: '🎮 AA Equilibrado',
        desc: 'Físicas, networking base y pipeline de shaders.',
        nodes: ['core_loop', 'entity_component', 'state_machine', 'physics_2d3d', 'forward_renderer', 'pbr_lighting', 'net_socket_sync', 'unit_test_suite', 'automated_ci']
    },
    aaa: {
        id: 'aaa',
        name: '🚀 AAA Ambicioso',
        desc: 'Ray Tracing, Rollback Netcode y combate avanzado.',
        nodes: ['core_loop', 'entity_component', 'forward_renderer', 'unit_test_suite', 'state_machine', 'physics_2d3d', 'net_socket_sync', 'automated_ci', 'ai_behavior_trees', 'pbr_lighting', 'client_prediction', 'memory_manager', 'combat_combos', 'deferred_raytracing', 'rollback_netcode', 'smoke_bots']
    },
    qa_master: {
        id: 'qa_master',
        name: '🛡️ Robustez QA Máxima',
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

// --- 3. PLATFORMS & AUDIENCE AFFINITIES ---
const PLATFORMS = [
    { id: 'pc', name: 'PC (Ordenador)', devCost: 8000, marketShare: 0.45, eraUnlocked: 1, audience: 'Everyone', icon: '💻', audienceFit: { Everyone: 1.10, Young: 0.95, Mature: 1.15 } },
    { id: 'g64', name: 'Commodore 64', devCost: 5000, marketShare: 0.35, eraUnlocked: 1, audience: 'Everyone', icon: '📼', audienceFit: { Everyone: 1.05, Young: 1.05, Mature: 0.90 } },
    { id: 'nes', name: 'Master System 8-Bit', devCost: 12000, marketShare: 0.50, eraUnlocked: 1, audience: 'Young', icon: '🕹️', audienceFit: { Everyone: 1.10, Young: 1.25, Mature: 0.75 } },
    { id: 'snes', name: 'Super 16-Bit', devCost: 22000, marketShare: 0.65, eraUnlocked: 2, audience: 'Everyone', icon: '🎮', audienceFit: { Everyone: 1.20, Young: 1.15, Mature: 0.90 } },
    { id: 'playbox', name: 'PlayStation 32-Bit', devCost: 35000, marketShare: 0.80, eraUnlocked: 2, audience: 'Mature', icon: '💿', audienceFit: { Everyone: 1.05, Young: 0.85, Mature: 1.25 } },
    { id: 'mobile', name: 'SmartPhone OS', devCost: 25000, marketShare: 0.75, eraUnlocked: 2, audience: 'Everyone', icon: '📱', audienceFit: { Everyone: 1.25, Young: 1.10, Mature: 0.95 } },
    { id: 'ninswitch', name: 'Hybrid Console', devCost: 45000, marketShare: 0.85, eraUnlocked: 3, audience: 'Everyone', icon: '⚡', audienceFit: { Everyone: 1.25, Young: 1.20, Mature: 0.90 } },
    { id: 'vrhelmet', name: 'VR Matrix Headset', devCost: 65000, marketShare: 0.60, eraUnlocked: 3, audience: 'Mature', icon: '🥽', audienceFit: { Everyone: 0.95, Young: 0.75, Mature: 1.30 } }
];

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
        this.era = 1; // 1: Garage, 2: Indie Loft, 3: Cyber Campus

        // Company & Founder Profile
        this.companyName = 'PixelForge Interactive';
        this.companyLogo = '🎮';
        this.hasCustomizedProfile = false;
        this.founder = {
            name: 'Raúl Vance',
            trait: 'Visionario'
        };
        this.characterCustomization = {
            skin: '#ffdfc4',
            hairStyle: 'mop',
            hairColor: '#3d2314',
            shirtStyle: 'flannel',
            shirtColor: '#2563eb',
            pantsColor: '#1e293b',
            accessory: 'glasses_retro'
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
                salary: 1200,
                trait: this.founder.trait,
                customization: { ...this.characterCustomization }
            }
        ];

        this.currentProject = null;
        this.gamesHistory = [];
        this.activeSales = [];
        this.researchedTechs = ['graphics2d_v1', 'sound_chiptune'];

        // Research & Development (I+D) Tech Tree System
        this.techTreeManager = new TechTreeManager();
        this.activeResearch = null; // { techId, nodeName, icon, costRP, totalWeeks, weeksRemaining, progress }

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
        this.inHouseEngines = (typeof InHouseEngine !== 'undefined') ? [
            new InHouseEngine({
                id: 'inhouse_v1',
                name: 'Forge Core In-House v1',
                tier: 1,
                affineGenres: ['Action', 'RPG'],
                bakedNodes: ['render_raster', 'physics_basic', 'net_singleplayer', 'audio_stereo', 'content_linear'],
                createdYear: 1,
                createdWeek: 1
            })
        ] : [];
        this.lastPassiveRoyaltiesEarned = 0;

        this.availableCandidates = [...BASE_CANDIDATE_POOL];
        this.top10Chart = [];
        this.marketTrend = null;
        this.activePublisherContract = null;
        this.discoveredInsights = []; // Unlocked post-mortem insights

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

    // --- PROJECT CREATION & DEV CYCLES ---
    startNewGameProject(config) {
        // Validación de Modo Parche de Emergencia Post-Lanzamiento (Punto 5)
        if (this.isEmergencyPatchActive && this.emergencyPatchData) {
            return {
                success: false,
                message: `🚨 ¡PROYECTO BLOQUEADO! Tu estudio está bajo Alerta de Crisis por el colapso técnico de "${this.emergencyPatchData.gameName}". Debes estabilizar el juego con un [Parche de Emergencia] antes de arrancar otro proyecto.`
            };
        }

        // config: { name, topicId, genreId, platformId, targetAudience, engineId, pipelineType, selectedNodeIds, sliders }
        const topic = TOPICS.find(t => t.id === config.topicId) || TOPICS[0];
        const genre = GENRES.find(g => g.id === config.genreId) || GENRES[0];
        const platform = PLATFORMS.find(p => p.id === config.platformId) || PLATFORMS[0];

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

        const engineUpfrontCost = (engine && engine.licenseCost) ? engine.licenseCost : 0;
        const totalDevCost = platform.devCost + engineUpfrontCost + (this.era === 1 ? 4000 : (this.era === 2 ? 14000 : 35000));
        if (this.funds < totalDevCost) {
            return { success: false, message: '¡Fondos insuficientes para costear el kit de desarrollo y licencias!' };
        }

        this.funds -= totalDevCost;

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
                initialDebt: bloatwareFloor,
                baseBloatwareDebt: bloatwareFloor
            });
        }

        // Backward compatibility sliders
        const sliders = config.sliders || {
            stage1: { engine: 0.70, gameplay: 0.80, story: 0.60 },
            stage2: { dialogues: 0.60, levelDesign: 0.75, ai: 0.65 },
            stage3: { worldDesign: 0.70, graphics: 0.80, sound: 0.75 }
        };

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
            // DAG & Technical Debt Engine Fields
            scopeDAG: scopeDAG,
            techDebtModel: techDebtModel,
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
        return { success: true, project: this.currentProject };
    }

    updateDevSliders(stage, sliders) {
        if (this.currentProject && this.currentProject.sliders[`stage${stage}`]) {
            this.currentProject.sliders[`stage${stage}`] = { ...this.currentProject.sliders[`stage${stage}`], ...sliders };
        }
    }

    advanceDevTick(worldRef) {
        if (!this.currentProject) return;

        const proj = this.currentProject;
        const speedMultiplier = this.gameSpeed;

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
            } else if (proj.devMode === 'crunch') {
                proj.techDebtModel.setCrunchMode(true);
            } else {
                proj.techDebtModel.setCrunchMode(false);
                proj.techDebtModel.setRefactorMode(false);
            }

            const activeNodesList = proj.scopeDAG ? proj.scopeDAG.getActiveNodes() : [];
            const engineModifier = (proj.pipelineType === 'inhouse') ? 0.6 : 1.0;
            const qaPower = this.employees.reduce((acc, emp) => {
                let p = 0;
                if (emp.trait === 'Bug Hunter' || emp.trait === 'Cazador de Bugs') p += 25;
                if (emp.role && (emp.role.toLowerCase().includes('qa') || emp.role.toLowerCase().includes('tester'))) p += 35;
                return acc + p;
            }, 0);

            debtTickResult = proj.techDebtModel.simulateTick({
                staff: this.employees,
                activeNodes: activeNodesList,
                dagComplexity: proj.friction || 25,
                connectedCount: activeNodesList.length || 6,
                isLateStage: proj.stage >= 3,
                engineModifier: engineModifier,
                qaPower: qaPower,
                extraHours: (proj.devMode === 'crunch') ? 3.0 : 0
            });

            // Punto 3.1: Penalización de velocidad y fricción acumulada
            devSpeedMultiplier = debtTickResult.speedMultiplier; // 1.0 / accumulatedFriction
            proj.accumulatedFriction = debtTickResult.accumulatedFriction;
            proj.regressionRisk = debtTickResult.regressionRisk;

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
            });
            this.notify();
            return;
        }

        // Effective Speed calculation with Crunch Time Boost & Technical Debt Penalties
        const crunchBoost = (proj.devMode === 'crunch') ? 1.75 : 1.0;
        const effectiveProgressSpeed = speedMultiplier * devSpeedMultiplier * crunchBoost;

        // Employees contribute points and progress across disciplines
        this.employees.forEach((emp, index) => {
            const isFatigued = emp.stamina < 25;
            const isExhausted = emp.stamina < 10;

            if (!isExhausted) {
                // Stamina burn: crunch accelerates fatigue at 2.2x rate
                const crunchBurnMult = (proj.devMode === 'crunch') ? 2.2 : 1.0;
                const staminaBurn = (emp.trait === 'Workaholic' ? 0.18 : 0.28) * speedMultiplier * crunchBurnMult;
                emp.stamina = Math.max(5, emp.stamina - staminaBurn);

                // Speed modifier drops if fatigued
                const effectiveSpeed = isFatigued ? emp.speed * 0.55 : emp.speed;

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
                    if (proj.devMode === 'crunch') bugChance *= 1.8; // Crunch generates bugs faster

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

        this.notify();
    }

    // --- REVIEW CALCULATION & GAME LAUNCH ---
    finishAndReleaseGame() {
        if (!this.currentProject) return null;
        const proj = this.currentProject;

        // 1. Topic-Genre Synergy (0.50 to 1.35)
        const topicSynergy = (proj.topic.genreFit && proj.topic.genreFit[proj.genre.id]) || 1.0;

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

        // 5. Engine Tech Bonus
        const engineBonus = proj.engine ? (proj.engine.bonusScore || 0.25) : 0.15;

        // 6. Market Trend Boost
        let trendBoost = 0;
        let isTrendMatch = false;
        if (this.marketTrend && (this.marketTrend.topicId === proj.topic.id || this.marketTrend.genreId === proj.genre.id)) {
            trendBoost = 0.50;
            isTrendMatch = true;
        }

        // 7. Bug Impact & Bug-Free Bonus
        let bugImpact = 0;
        if (proj.bugs === 0) {
            bugImpact = 0.40; // Bonus for a pristine bug-free master release!
        } else {
            bugImpact = -Math.min(3.6, proj.bugs * 0.35);
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

        // --- RAW BASE SCORE (1.5 to 10.0) ---
        let rawScore = (pointsFactor * 3.8) + (sliderScoreFactor * 3.2) + ((topicSynergy - 0.7) * 2.8) + ((audienceFactor - 1.0) * 1.8) + engineBonus + trendBoost + bugImpact + synergyBonus + (debtPenalties.reviewScoreBonus || 0) - (debtPenalties.reviewScorePenalty || 0);
        rawScore = Math.max(1.8, Math.min(10.0, rawScore));

        // --- 4 SPECIALIZED PRESS CRITICS WITH DISTINCT BIASES & PERSONALITIES ---
        // Critic 1: GameByte Tech (⚡) - Focuses on tech, engine, physics, bugs, tech debt & servers
        const techWeight = proj.techPoints >= proj.designPoints ? 0.35 : -0.20;
        const techBugPenalty = proj.bugs > 0 ? proj.bugs * 0.25 : 0.20;
        const scoreTech = Math.min(10, Math.max(2, Math.round((rawScore + techWeight - techBugPenalty - (debtPenalties.reviewScorePenalty * 0.5) + (debtPenalties.reviewScoreBonus * 0.5) + (Math.random() * 0.6 - 0.3)) * 10) / 10));

        // Critic 2: Polygon Star (⭐) - Focuses on story, world, dialogues, mature themes
        const storyWeight = (proj.genre.id === 'RPG' || proj.genre.id === 'Adventure') ? 0.40 : 0.05;
        const topicBonus = topicSynergy >= 1.25 ? 0.30 : -0.25;
        const scoreStar = Math.min(10, Math.max(2, Math.round((rawScore + storyWeight + topicBonus + (Math.random() * 0.6 - 0.3)) * 10) / 10));

        // Critic 3: AllGames Hub (🎮) - Focuses on pure gameplay, fun factor, audience fit
        const gameFunBonus = (audienceFactor >= 1.1) ? 0.35 : -0.25;
        const scoreHub = Math.min(10, Math.max(2, Math.round((rawScore + gameFunBonus - (debtPenalties.reviewScorePenalty * 0.3) + (Math.random() * 0.6 - 0.3)) * 10) / 10));

        // Critic 4: Digital Forge (🔥) - Hardcore industry vet, looks at engine tier, graphics/sound polish & synergies
        const enginePower = (proj.engine && ((proj.engine.features && proj.engine.features.length >= 3) || proj.engine.tier >= 2)) ? 0.40 : -0.15;
        const scoreForge = Math.min(10, Math.max(2, Math.round((rawScore + enginePower + (synergyBonus * 0.4) + (Math.random() * 0.6 - 0.3)) * 10) / 10));

        const reviews = [
            {
                critic: 'GameByte Tech',
                avatar: '⚡',
                score: scoreTech,
                comment: ''
            },
            {
                critic: 'Polygon Star',
                avatar: '⭐',
                score: scoreStar,
                comment: ''
            },
            {
                critic: 'AllGames Hub',
                avatar: '🎮',
                score: scoreHub,
                comment: ''
            },
            {
                critic: 'Digital Forge',
                avatar: '🔥',
                score: scoreForge,
                comment: ''
            }
        ];

        // Tailored comments per outlet governed by Technical Debt stability
        const currentRawDebt = proj.techDebtModel ? Math.round(proj.techDebtModel.rawDebt) : 0;
        if (debtPenalties.launchStabilityStatus === 'smooth') {
            reviews[0].comment = scoreTech >= 9.0
                ? "¡Prodigio de ingeniería técnica! Código impecable, 60 FPS rocosos y cero fricción. La arquitectura técnica vuela sin fisuras."
                : (scoreTech >= 7.0 ? "Optimización ejemplar y código extraordinariamente limpio. Es un alivio disfrutar de un lanzamiento tan fluido." : "El código es estable y libre de bugs, aunque el motor base carece de ambición técnica.");
        } else if (debtPenalties.launchStabilityStatus === 'rough') {
            reviews[0].comment = `Apartado técnico aceptable pero con tirones evidentes de framerate, micro-stuttering y caídas de FPS. La deuda técnica acumulada (${currentRawDebt} pts) empieza a pasar factura en el rendimiento.`;
        } else {
            // Critical
            const isOnline = debtPenalties.serverCrashRisk > 0;
            reviews[0].comment = isOnline
                ? `¡COLAPSO TOTAL! Cuelgues continuos al escritorio (CTD) y caída absoluta de los servidores multijugador el Día 1. La deuda crítica (${currentRawDebt} pts) vuelve el juego injugable.`
                : `¡DESASTRE TÉCNICO! Crashes masivos al escritorio, corrupción de memoria y rendimiento pésimo por código espagueti (${currentRawDebt} pts). Injugable el Día 1.`;
            reviews[2].comment = `Una pesadilla de optimización. La comunidad está solicitando reembolsos masivos (${Math.round(debtPenalties.refundRate * 100)}% de devoluciones el Día 1).`;
        }

        reviews[1].comment = scoreStar >= 9.0
            ? `¡Una obra de arte! El universo de ${proj.topic.name} tratado con una madurez narrativa sobrecogedora.`
            : (scoreStar >= 7.0 ? "Guion cautivador y personajes con carisma. Una propuesta artística con verdadera personalidad." : (topicSynergy < 0.95 ? `La temática de ${proj.topic.name} no termina de cuajar con el formato ${proj.genre.name}.` : "Falta alma en la ambientación y los diálogos caen en lugares comunes."));

        if (!reviews[2].comment) {
            reviews[2].comment = scoreHub >= 9.0
                ? "¡Diversión pura y adictiva! Desde que tomas el mando no puedes soltarlo. Candidato clarísimo a Juego del Año."
                : (scoreHub >= 7.0 ? "Jugabilidad directa, niveles bien diseñados y controles sumamente satisfactorios." : (audienceFactor < 1.0 ? "Desconecta de su público objetivo; el diseño de niveles resulta confuso y tosco." : "Se deja jugar pero no aporta nada memorable al catálogo."));
        }

        reviews[3].comment = scoreForge >= 9.0
            ? (activeSynergiesList.length > 0 ? `Valores de producción de élite. Las sinergias tecnológicas de ${activeSynergiesList.map(s => s.name).join(', ')} deslumbran por completo.` : `Valores de producción de élite. La combinación de ${proj.genre.name} con ${proj.topic.name} es la cumbre de la temporada.`)
            : (scoreForge >= 7.0 ? "Un producto redondo y bien calibrado. Justifica plenamente el precio de lanzamiento." : "Le ha faltado ambición y pulido general. Se siente como una oportunidad a medio gas.");

        const avgScore = Math.round((reviews.reduce((acc, r) => acc + r.score, 0) / 4) * 10) / 10;

        // --- REALISTIC SALES PROJECTIONS & ERA SCALING ---
        const basePrice = this.era === 1 ? 12 : (this.era === 2 ? 28 : 55);
        const eraSalesFactor = this.era === 1 ? 85 : (this.era === 2 ? 280 : 950);
        const marketShareBonus = proj.platform.marketShare + 0.25;
        const trendSalesMultiplier = isTrendMatch ? 1.35 : 1.0;

        let totalSalesPotential = Math.floor(
            Math.pow(avgScore / 2.2, 3.85) * eraSalesFactor * marketShareBonus * trendSalesMultiplier * synergyQualityMultiplier
        );

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
            score: avgScore,
            reviews: reviews,
            basePrice: basePrice,
            unitsSoldTotal: 0,
            unitsSoldLastWeek: 0,
            revenueTotal: 0,
            devCost: proj.devCostTotal,
            profit: -proj.devCostTotal,
            weeksOnMarket: 0,
            maxWeeks: 10 + (avgScore >= 8.5 ? 4 : 0),
            salesPotential: totalSalesPotential,
            decayRate: avgScore >= 8.5 ? 0.78 : (avgScore >= 7.0 ? 0.72 : 0.62),
            reported: false,
            // Pipeline & Tech Debt Record
            pipelineType: proj.pipelineType || 'inhouse',
            royaltyRate: (proj.engineObj && proj.engineObj.royaltyRate) || 0,
            royaltiesPaidTotal: 0,
            techDebtAtRelease: proj.techDebtModel ? Math.round(proj.techDebtModel.accumulatedDebt * 10) / 10 : 0,
            regressionsSuffered: proj.regressionsCount || 0,
            synergies: activeSynergiesList,
            launchStabilityStatus: debtPenalties.launchStabilityStatus,
            refundsLost: refundsLost,
            refundRate: debtPenalties.refundRate || 0
        };

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

        this.gamesHistory.unshift(releasedGame);
        this.activeSales.push(releasedGame);

        // Fan growth based on score
        const newFans = Math.floor(Math.max(0, (avgScore - 4.5) * (this.era === 1 ? 25 : (this.era === 2 ? 65 : 180))));
        this.fans += newFans;

        // Launch learning RP bonus based on score and technical scope
        const launchRP = Math.max(12, Math.floor(10 + (avgScore * 2.5) + (proj.techPoints / 15)));
        this.researchPoints += launchRP;
        releasedGame.launchRPGain = launchRP;

        // Sound fanfare
        if (soundEngine) {
            soundEngine.playFanfare(avgScore);
        }

        this.currentProject = null;
        this.notify();

        return releasedGame;
    }

    // --- WEEKLY SALES & ECONOMIC SIMULATION ---
    processWeeklySales() {
        let weeklyIncomeTotal = 0;

        for (let i = this.activeSales.length - 1; i >= 0; i--) {
            const game = this.activeSales[i];
            game.weeksOnMarket++;

            if (game.weeksOnMarket <= game.maxWeeks) {
                // Realistic Gamma-distribution sales curve: Peak at Week 2
                const peakCurve = game.weeksOnMarket === 1
                    ? 0.75
                    : (game.weeksOnMarket === 2 ? 1.0 : Math.pow(game.decayRate, game.weeksOnMarket - 2));

                const unitsThisWeek = Math.floor((game.salesPotential / 4.1) * peakCurve);
                let revenueThisWeek = unitsThisWeek * game.basePrice;

                // Commercial Engine Royalties Deduction (5% - 10%)
                let royaltiesDeductedThisWeek = 0;
                if (game.royaltyRate && game.royaltyRate > 0) {
                    royaltiesDeductedThisWeek = Math.floor(revenueThisWeek * game.royaltyRate);
                    game.royaltiesPaidTotal = (game.royaltiesPaidTotal || 0) + royaltiesDeductedThisWeek;
                    revenueThisWeek -= royaltiesDeductedThisWeek;
                }

                game.unitsSoldLastWeek = unitsThisWeek;
                game.unitsSoldTotal += unitsThisWeek;
                game.revenueTotal += revenueThisWeek;
                game.profit = game.revenueTotal - game.devCost;
                this.funds += revenueThisWeek;
                weeklyIncomeTotal += revenueThisWeek;
            } else {
                // Retired from market
                game.unitsSoldLastWeek = 0;
                this.activeSales.splice(i, 1);
            }
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

        // Deduct staff monthly salaries prorated weekly (/ 4)
        const totalSalaries = this.employees.reduce((acc, e) => acc + (e.salary / 4), 0);
        this.funds -= totalSalaries;

        // Passive stamina recovery for employees when not in an active project
        if (!this.currentProject) {
            this.employees.forEach(emp => {
                emp.stamina = Math.min(emp.maxStamina, emp.stamina + 3.5 * this.gameSpeed);
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

    advanceCalendar() {
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
                    this.techTreeManager.unlockTech(finishedTechId);
                }
                this.activeResearch = null;

                if (soundEngine && soundEngine.playLevelUp) {
                    soundEngine.playLevelUp();
                }
                this.onResearchCompleted?.(finishedTechName);
            }
        }

        // Passive R&D study points generated by employees when studio is idle (no active game)
        if (this.currentProject === null) {
            const totalTech = this.employees.reduce((acc, e) => acc + (e.tech || 20), 0);
            const weeklyRP = Math.max(1, Math.floor(totalTech / 45));
            this.researchPoints += weeklyRP;
        }

        this.processWeeklySales();
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
                message: `🏆 ¡GLORIA TOTAL! "${winner.name}" ha ganado el galardón de JUEGO DEL AÑO (GOTY)! Recibes +$${prizeMoney.toLocaleString()} y +${prizeFans} fans devotos.`
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
            role: candidate.role,
            tech: candidate.tech,
            design: candidate.design,
            speed: candidate.speed,
            stamina: 100,
            maxStamina: 100,
            salary: candidate.salary,
            trait: candidate.trait,
            desc: candidate.desc
        });

        // Remove from available candidates
        const cIdx = this.availableCandidates.findIndex(c => c.name === candidate.name);
        if (cIdx !== -1) this.availableCandidates.splice(cIdx, 1);

        if (soundEngine) soundEngine.playClick();
        this.notify();
        return { success: true };
    }

    refreshCandidatePool() {
        const cost = 2500;
        if (this.funds < cost) {
            return { success: false, message: 'Fondos insuficientes ($2,500) para publicar anuncios de reclutamiento.' };
        }
        this.funds -= cost;

        const firstNames = ['Carlos', 'Lucía', 'David', 'Sonia', 'Guillermo', 'Mireia', 'Raúl', 'Beatriz', 'Javier', 'Clara', 'Viktor', 'Aya'];
        const lastNames = ['Gómez', 'Navarro', 'Sánchez', 'Vázquez', 'Romero', 'Kowalski', 'Tanaka', 'Morales', 'Méndez', 'Vogel'];
        const roles = [
            { role: 'Ingeniero de Motores', techBi: 1.4, desBi: 0.7, trait: 'Bug Hunter' },
            { role: 'Diseñador de Niveles', techBi: 0.7, desBi: 1.4, trait: 'Pixel Wizard' },
            { role: 'Programador de Sistemas', techBi: 1.3, desBi: 0.8, trait: 'Code Ninja' },
            { role: 'Guionista Creativo', techBi: 0.6, desBi: 1.5, trait: 'Story Crafter' },
            { role: 'Desarrollador Full Stack', techBi: 1.1, desBi: 1.1, trait: 'Workaholic' },
            { role: 'Artista Técnico', techBi: 1.0, desBi: 1.3, trait: 'Aesthetic Guru' }
        ];

        const scale = this.era === 1 ? 1.0 : (this.era === 2 ? 1.7 : 2.6);
        const newPool = [];

        for (let i = 0; i < 4; i++) {
            const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
            const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
            const r = roles[Math.floor(Math.random() * roles.length)];

            const baseStat = Math.floor((22 + Math.random() * 15) * scale);
            const tech = Math.floor(baseStat * r.techBi);
            const design = Math.floor(baseStat * r.desBi);
            const speed = Math.round((1.05 + Math.random() * 0.3) * 100) / 100;
            const salary = Math.floor((tech + design) * (this.era === 1 ? 38 : (this.era === 2 ? 45 : 55)));

            newPool.push({
                name: `${fn} ${ln}`,
                role: r.role,
                tech,
                design,
                speed,
                salary,
                trait: r.trait,
                desc: 'Candidato prometedor evaluado por la agencia de cazatalentos.'
            });
        }

        this.availableCandidates = newPool;
        if (soundEngine) soundEngine.playClick();
        this.notify();
        return { success: true };
    }

    // --- STAFF ACTIONS (COFFEE, VACATION, TRAINING) ---
    orderTeamCoffee() {
        const cost = 500;
        if (this.funds < cost) return { success: false, message: 'Fondos insuficientes para el café express.' };
        this.funds -= cost;

        this.employees.forEach(emp => {
            emp.stamina = Math.min(emp.maxStamina, emp.stamina + 35);
        });

        if (soundEngine) soundEngine.playClick();
        this.notify();
        return { success: true, message: '☕ ¡Café de alta calidad para el equipo! +35 de energía para todos.' };
    }

    sendOnVacation(empId) {
        const cost = 2000;
        if (this.funds < cost) return { success: false, message: 'Fondos insuficientes para el paquete de vacaciones ($2,000).' };
        const emp = this.employees.find(e => e.id === empId);
        if (!emp) return { success: false, message: 'Empleado no encontrado.' };

        this.funds -= cost;
        emp.stamina = emp.maxStamina;

        if (soundEngine) soundEngine.playLevelUp();
        this.notify();
        return { success: true, message: `🏖️ ¡${emp.name} vuelve de vacaciones totalmente renovado al 100%!` };
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
        return { success: true, message: `📚 ¡${emp.name} ha completado la capacitación! +8 en ${skillType === 'tech' ? 'Tecnología' : 'Diseño'}.` };
    }

    // --- POST-MORTEM GAME REPORT ---
    generateGameReport(gameId) {
        const game = this.gamesHistory.find(g => g.id === gameId);
        if (!game || game.reported) {
            return { success: false, message: 'Juego ya analizado o inválido.' };
        }

        game.reported = true;
        const rpGained = 25 + Math.floor(game.score * 2);
        this.researchPoints += rpGained;

        // Synergy assessment
        const topicObj = TOPICS.find(t => t.id === game.topicId);
        const fitVal = (topicObj && topicObj.genreFit[game.genreId]) || 1.0;
        let synergyFeedback = '';
        if (fitVal >= 1.30) {
            synergyFeedback = `✨ Conclusión: La unión de ${game.topic} con ${game.genre} es una sinergia estelar indiscutible.`;
        } else if (fitVal >= 1.10) {
            synergyFeedback = `👍 Conclusión: Buena afinidad entre ${game.topic} y ${game.genre}.`;
        } else {
            synergyFeedback = `⚠️ Advertencia: ${game.topic} no encaja de forma natural con ${game.genre}; penaliza el potencial de ventas.`;
        }

        const audienceHint = `🎯 Público: El target ideal para ${game.topic} es "${topicObj ? topicObj.idealAudience : 'Everyone'}".`;

        this.discoveredInsights.push({
            title: game.name,
            synergy: synergyFeedback,
            audience: audienceHint
        });

        if (soundEngine) soundEngine.playLevelUp();
        this.notify();
        return {
            success: true,
            rpGained,
            synergy: synergyFeedback,
            audience: audienceHint
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

        const costRP = nodeDef.costRP || 30;
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
            icon: nodeDef.icon || '🔬',
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
            message: `🔬 Proyecto de I+D iniciado: "${nodeDef.name}". El equipo comenzará la investigación durante ${totalWeeks} semanas.`
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
            message: `🔧 ¡Ingeniería Inversa completada! Has desmantelado "${item.name}" y obtenido +${item.rpGain} Puntos de I+D.`
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
        const affineGenres = config.affineGenres || ['Action', 'RPG'];
        const costMoney = 35000 + (bakedNodes.length * 6000);
        const costRP = 40 + (bakedNodes.length * 10);

        if (this.funds < costMoney) {
            return { success: false, message: `Fondos insuficientes ($${costMoney.toLocaleString()}) para financiar el I+D del motor propio.` };
        }
        if (this.researchPoints < costRP) {
            return { success: false, message: `Puntos de investigación insuficientes (${costRP} RP) para la arquitectura de I+D.` };
        }

        this.funds -= costMoney;
        this.researchPoints -= costRP;

        const newEngine = (typeof InHouseEngine !== 'undefined') ? new InHouseEngine({
            name: config.name || 'Proprietary Core v' + (this.inHouseEngines.length + 1),
            tier: this.era === 1 ? 1 : (this.era === 2 ? 2 : 3),
            affineGenres: affineGenres,
            bakedNodes: bakedNodes,
            createdYear: this.year,
            createdWeek: this.week
        }) : {
            id: 'inhouse_' + Date.now(),
            name: config.name || 'In-House Engine',
            tier: this.era,
            affineGenres: affineGenres,
            bakedNodes: bakedNodes,
            isProprietary: true,
            royaltyRate: 0,
            bloatwareDebtFloor: 0,
            licensees: [],
            createdYear: this.year,
            createdWeek: this.week,
            getEfficiency: () => 1.0,
            getFrictionMultiplier: () => 0.5,
            collectWeeklyPassiveRoyalties: () => 0
        };

        this.inHouseEngines.push(newEngine);
        if (soundEngine) soundEngine.playLevelUp();
        this.notify();
        return { success: true, engine: newEngine, message: `🚀 ¡Proyecto de I+D concluido! Motor propio "${newEngine.name}" listo para producción con 0% royalties.` };
    }

    upgradeInHouseEngine(engineId, newNodes = []) {
        const engine = this.inHouseEngines.find(e => e.id === engineId);
        if (!engine) return { success: false, message: 'Motor no encontrado.' };

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
            message: `🛠️ ¡Parche de Emergencia Hotfix v1.1 desplegado con éxito! La deuda técnica ha descendido a 14 pts (Código Limpio). Los servidores se han estabilizado y la comunidad te recompensa con +180 fans.`
        };
    }
}

// Global game instance
const game = new TycoonGame();

export { game, GENRES, PLATFORMS, TOPICS };
