/**
 * DEV EMPIRE 3D - Base de Datos de Características del Motor de Videojuegos
 * Catálogo completo de 82 características agrupadas en 9 categorías al estilo Game Dev Tycoon.
 * Nombres cortos (1 a 3 palabras) legibles de un vistazo en la tarjeta.
 */

export const ENGINE_CATEGORIES = {
    graphics: { id: 'graphics', label: 'Gráfico', icon: 'screen', color: '#0284c7' },
    story: { id: 'story', label: 'Historia / Misiones', icon: 'book', color: '#8b5cf6' },
    engine: { id: 'engine', label: 'Motor', icon: 'gear', color: '#f97316' },
    gameplay: { id: 'gameplay', label: 'Jugabilidad', icon: 'gamepad', color: '#10b981' },
    dialogues: { id: 'dialogues', label: 'Diálogos', icon: 'chat', color: '#ec4899' },
    level_design: { id: 'level_design', label: 'Diseño de Nivel', icon: 'map', color: '#06b6d4' },
    ai: { id: 'ai', label: 'Inteligencia Artificial', icon: 'brain', color: '#6366f1' },
    world_design: { id: 'world_design', label: 'Diseño de Mundo', icon: 'globe', color: '#14b8a6' },
    sound: { id: 'sound', label: 'Sonido', icon: 'speaker', color: '#3b82f6' }
};

export const ENGINE_PARTS_DATABASE = Object.freeze([
    // ==========================================
    // 1. GRÁFICO (16 características)
    // ==========================================
    {
        id: 'graphics_2d_v1',
        name: 'Gráficos 2D V.1',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 10000,
        costK: 10,
        costLabel: '10K Cr.',
        techBranch: 'graphics_2d',
        tier: 1,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_2d_v2',
        name: 'Gráficos 2D V.2',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: 'graphics_2d',
        tier: 2,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_2d_v3',
        name: 'Gráficos 2D V.3',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: 'graphics_2d',
        tier: 3,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_2d_v4',
        name: 'Gráficos 2D V.4',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 140000,
        costK: 140,
        costLabel: '140K Cr.',
        techBranch: 'graphics_2d',
        tier: 4,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_2d_v5',
        name: 'Gráficos 2D V.5',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 180000,
        costK: 180,
        costLabel: '180K Cr.',
        techBranch: 'graphics_2d',
        tier: 5,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_3d_v1',
        name: 'Gráficos 3D V.1',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 30000,
        costK: 30,
        costLabel: '30K Cr.',
        techBranch: 'graphics_3d',
        tier: 1,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_3d_v2',
        name: 'Gráficos 3D V.2',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: 'graphics_3d',
        tier: 2,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_3d_v3',
        name: 'Gráficos 3D V.3',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: 'graphics_3d',
        tier: 3,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_3d_v4',
        name: 'Gráficos 3D V.4',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 140000,
        costK: 140,
        costLabel: '140K Cr.',
        techBranch: 'graphics_3d',
        tier: 4,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_3d_v5',
        name: 'Gráficos 3D V.5',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 180000,
        costK: 180,
        costLabel: '180K Cr.',
        techBranch: 'graphics_3d',
        tier: 5,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_3d_v6',
        name: 'Gráficos 3D V.6',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 220000,
        costK: 220,
        costLabel: '220K Cr.',
        techBranch: 'graphics_3d',
        tier: 6,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_3d_v7',
        name: 'Gráficos 3D V.7',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 300000,
        costK: 300,
        costLabel: '300K Cr.',
        techBranch: 'graphics_3d',
        tier: 7,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_3d_stereoscopic',
        name: '3D estereoscópica avanzada',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_ray_tracing',
        name: 'Ray Tracing',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 280000,
        costK: 280,
        costLabel: '280K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_ai_upscaling',
        name: 'Escalado por I.A.',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 160000,
        costK: 160,
        costLabel: '160K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'screen'
    },
    {
        id: 'graphics_vr',
        name: 'Realidad Virtual',
        category: 'graphics',
        categoryLabel: 'Gráfico',
        cost: 120000,
        costK: 120,
        costLabel: '120K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'screen'
    },

    // ==========================================
    // 2. HISTORIA / MISIONES (11 características)
    // ==========================================
    {
        id: 'story_linear',
        name: 'Historia lineal',
        category: 'story',
        categoryLabel: 'Historia / Misiones',
        cost: 30000,
        costK: 30,
        costLabel: '30K Cr.',
        techBranch: 'story_structure',
        tier: 1,
        stage: 1,
        icon: 'book'
    },
    {
        id: 'story_branching',
        name: 'Historia ramificada',
        category: 'story',
        categoryLabel: 'Historia / Misiones',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: 'story_structure',
        tier: 2,
        stage: 1,
        icon: 'book'
    },
    {
        id: 'story_cutscenes_simple',
        name: 'Escenas sencillas',
        category: 'story',
        categoryLabel: 'Historia / Misiones',
        cost: 30000,
        costK: 30,
        costLabel: '30K Cr.',
        techBranch: 'cutscenes',
        tier: 1,
        stage: 1,
        icon: 'book'
    },
    {
        id: 'story_cutscenes_advanced',
        name: 'Escenas avanzadas',
        category: 'story',
        categoryLabel: 'Historia / Misiones',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: 'cutscenes',
        tier: 2,
        stage: 1,
        icon: 'book'
    },
    {
        id: 'story_fmv',
        name: 'Vídeo de movimiento completo',
        category: 'story',
        categoryLabel: 'Historia / Misiones',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'book'
    },
    {
        id: 'story_interactive',
        name: 'Historia interactiva',
        category: 'story',
        categoryLabel: 'Historia / Misiones',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'book'
    },
    {
        id: 'story_moral_choices',
        name: 'Elecciones morales',
        category: 'story',
        categoryLabel: 'Historia / Misiones',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'book'
    },
    {
        id: 'story_immersive_narrative',
        name: 'Narrativa inmersiva',
        category: 'story',
        categoryLabel: 'Historia / Misiones',
        cost: 140000,
        costK: 140,
        costLabel: '140K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'book'
    },
    {
        id: 'story_reactive_quests',
        name: 'Misiones reactivas',
        category: 'story',
        categoryLabel: 'Historia / Misiones',
        cost: 180000,
        costK: 180,
        costLabel: '180K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'book'
    },
    {
        id: 'story_nemesis_system',
        name: 'Sistema Némesis',
        category: 'story',
        categoryLabel: 'Historia / Misiones',
        cost: 210000,
        costK: 210,
        costLabel: '210K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'book'
    },
    {
        id: 'story_procedural_quests',
        name: 'Misiones procedurales',
        category: 'story',
        categoryLabel: 'Historia / Misiones',
        cost: 150000,
        costK: 150,
        costLabel: '150K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'book'
    },

    // ==========================================
    // 3. MOTOR (11 características)
    // ==========================================
    {
        id: 'engine_save_game',
        name: 'Guardar Partida',
        category: 'engine',
        categoryLabel: 'Motor',
        cost: 10000,
        costK: 10,
        costLabel: '10K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gear'
    },
    {
        id: 'engine_local_multiplayer',
        name: 'Multijugador local',
        category: 'engine',
        categoryLabel: 'Motor',
        cost: 30000,
        costK: 30,
        costLabel: '30K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gear'
    },
    {
        id: 'engine_video_playback',
        name: 'Reproducción de vídeo',
        category: 'engine',
        categoryLabel: 'Motor',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gear'
    },
    {
        id: 'engine_physics_basic',
        name: 'Física básica',
        category: 'engine',
        categoryLabel: 'Motor',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: 'physics',
        tier: 1,
        stage: 1,
        icon: 'gear'
    },
    {
        id: 'engine_online_play',
        name: 'Juego online',
        category: 'engine',
        categoryLabel: 'Motor',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gear'
    },
    {
        id: 'engine_physics_advanced',
        name: 'Física avanzada',
        category: 'engine',
        categoryLabel: 'Motor',
        cost: 140000,
        costK: 140,
        costLabel: '140K Cr.',
        techBranch: 'physics',
        tier: 2,
        stage: 1,
        icon: 'gear'
    },
    {
        id: 'engine_mod_support',
        name: 'Soporte de mods',
        category: 'engine',
        categoryLabel: 'Motor',
        cost: 30000,
        costK: 30,
        costLabel: '30K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gear'
    },
    {
        id: 'engine_rollback_netcode',
        name: 'Rollback Netcode',
        category: 'engine',
        categoryLabel: 'Motor',
        cost: 130000,
        costK: 130,
        costLabel: '130K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gear'
    },
    {
        id: 'engine_dedicated_servers',
        name: 'Servidores Dedicados',
        category: 'engine',
        categoryLabel: 'Motor',
        cost: 180000,
        costK: 180,
        costLabel: '180K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gear'
    },
    {
        id: 'engine_crossplay',
        name: 'Juego Cruzado',
        category: 'engine',
        categoryLabel: 'Motor',
        cost: 160000,
        costK: 160,
        costLabel: '160K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gear'
    },
    {
        id: 'engine_fast_loading',
        name: 'Carga Ultrarrápida',
        category: 'engine',
        categoryLabel: 'Motor',
        cost: 140000,
        costK: 140,
        costLabel: '140K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gear'
    },

    // ==========================================
    // 4. JUGABILIDAD (8 características)
    // ==========================================
    {
        id: 'gameplay_tutorials',
        name: 'Tutoriales del juego',
        category: 'gameplay',
        categoryLabel: 'Jugabilidad',
        cost: 30000,
        costK: 30,
        costLabel: '30K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gamepad'
    },
    {
        id: 'gameplay_better_ux',
        name: 'Mejor experiencia de usuario',
        category: 'gameplay',
        categoryLabel: 'Jugabilidad',
        cost: 30000,
        costK: 30,
        costLabel: '30K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gamepad'
    },
    {
        id: 'gameplay_character_progression',
        name: 'Progreso de personaje',
        category: 'gameplay',
        categoryLabel: 'Jugabilidad',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gamepad'
    },
    {
        id: 'gameplay_skill_tree',
        name: 'Árbol de habilidades',
        category: 'gameplay',
        categoryLabel: 'Jugabilidad',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gamepad'
    },
    {
        id: 'gameplay_coop',
        name: 'Juego cooperativo',
        category: 'gameplay',
        categoryLabel: 'Jugabilidad',
        cost: 140000,
        costK: 140,
        costLabel: '140K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gamepad'
    },
    {
        id: 'gameplay_physics_combat',
        name: 'Combate por físicas',
        category: 'gameplay',
        categoryLabel: 'Jugabilidad',
        cost: 150000,
        costK: 150,
        costLabel: '150K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gamepad'
    },
    {
        id: 'gameplay_photo_mode',
        name: 'Modo Foto',
        category: 'gameplay',
        categoryLabel: 'Jugabilidad',
        cost: 40000,
        costK: 40,
        costLabel: '40K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gamepad'
    },
    {
        id: 'gameplay_haptic_feedback',
        name: 'Vibración háptica',
        category: 'gameplay',
        categoryLabel: 'Jugabilidad',
        cost: 70000,
        costK: 70,
        costLabel: '70K Cr.',
        techBranch: null,
        tier: 1,
        stage: 1,
        icon: 'gamepad'
    },

    // ==========================================
    // 5. DIÁLOGOS (9 características)
    // ==========================================
    {
        id: 'dialogues_improved',
        name: 'Diálogos mejorados',
        category: 'dialogues',
        categoryLabel: 'Diálogos',
        cost: 10000,
        costK: 10,
        costLabel: '10K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'chat'
    },
    {
        id: 'dialogues_tree',
        name: 'Árbol de diálogos',
        category: 'dialogues',
        categoryLabel: 'Diálogos',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'chat'
    },
    {
        id: 'dialogues_voice_acting',
        name: 'Doblaje de voz',
        category: 'dialogues',
        categoryLabel: 'Diálogos',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'chat'
    },
    {
        id: 'dialogues_body_lang_simple',
        name: 'Lenguaje corporal sencillo',
        category: 'dialogues',
        categoryLabel: 'Diálogos',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: 'body_language',
        tier: 1,
        stage: 2,
        icon: 'chat'
    },
    {
        id: 'dialogues_body_lang_adv',
        name: 'Lenguaje corporal avanzado',
        category: 'dialogues',
        categoryLabel: 'Diálogos',
        cost: 140000,
        costK: 140,
        costLabel: '140K Cr.',
        techBranch: 'body_language',
        tier: 2,
        stage: 2,
        icon: 'chat'
    },
    {
        id: 'dialogues_celebrity_voices',
        name: 'Voces de famosos',
        category: 'dialogues',
        categoryLabel: 'Diálogos',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'chat'
    },
    {
        id: 'dialogues_body_lang_real',
        name: 'Lenguaje corporal realista',
        category: 'dialogues',
        categoryLabel: 'Diálogos',
        cost: 180000,
        costK: 180,
        costLabel: '180K Cr.',
        techBranch: 'body_language',
        tier: 3,
        stage: 2,
        icon: 'chat'
    },
    {
        id: 'dialogues_facial_capture',
        name: 'Captura Facial',
        category: 'dialogues',
        categoryLabel: 'Diálogos',
        cost: 170000,
        costK: 170,
        costLabel: '170K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'chat'
    },
    {
        id: 'dialogues_lip_sync',
        name: 'Sincronía Labial',
        category: 'dialogues',
        categoryLabel: 'Diálogos',
        cost: 120000,
        costK: 120,
        costLabel: '120K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'chat'
    },

    // ==========================================
    // 6. DISEÑO DE NIVEL (7 características)
    // ==========================================
    {
        id: 'level_editor',
        name: 'Editor de niveles',
        category: 'level_design',
        categoryLabel: 'Diseño de Nivel',
        cost: 10000,
        costK: 10,
        costLabel: '10K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'map'
    },
    {
        id: 'level_easter_eggs',
        name: 'Huevos de Pascua',
        category: 'level_design',
        categoryLabel: 'Diseño de Nivel',
        cost: 30000,
        costK: 30,
        costLabel: '30K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'map'
    },
    {
        id: 'level_minigames',
        name: 'Mini-juegos',
        category: 'level_design',
        categoryLabel: 'Diseño de Nivel',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'map'
    },
    {
        id: 'level_dynamic_environment',
        name: 'Entorno dinámico',
        category: 'level_design',
        categoryLabel: 'Diseño de Nivel',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'map'
    },
    {
        id: 'level_seamless_loading',
        name: 'Sin pantallas de carga',
        category: 'level_design',
        categoryLabel: 'Diseño de Nivel',
        cost: 140000,
        costK: 140,
        costLabel: '140K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'map'
    },
    {
        id: 'level_procedural',
        name: 'Niveles procedurales',
        category: 'level_design',
        categoryLabel: 'Diseño de Nivel',
        cost: 150000,
        costK: 150,
        costLabel: '150K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'map'
    },
    {
        id: 'level_parkour',
        name: 'Sistema de Parkour',
        category: 'level_design',
        categoryLabel: 'Diseño de Nivel',
        cost: 110000,
        costK: 110,
        costLabel: '110K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'map'
    },

    // ==========================================
    // 7. INTELIGENCIA ARTIFICIAL (6 características)
    // ==========================================
    {
        id: 'ai_improved',
        name: 'I.A. Mejorada',
        category: 'ai',
        categoryLabel: 'Inteligencia Artificial',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'brain'
    },
    {
        id: 'ai_companions',
        name: 'Compañeros I.A.',
        category: 'ai',
        categoryLabel: 'Inteligencia Artificial',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'brain'
    },
    {
        id: 'ai_self_learning',
        name: 'I.A. con autoaprendizaje',
        category: 'ai',
        categoryLabel: 'Inteligencia Artificial',
        cost: 180000,
        costK: 180,
        costLabel: '180K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'brain'
    },
    {
        id: 'ai_squad_tactics',
        name: 'Tácticas de escuadrón',
        category: 'ai',
        categoryLabel: 'Inteligencia Artificial',
        cost: 130000,
        costK: 130,
        costLabel: '130K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'brain'
    },
    {
        id: 'ai_dynamic_crowds',
        name: 'Multitudes dinámicas',
        category: 'ai',
        categoryLabel: 'Inteligencia Artificial',
        cost: 160000,
        costK: 160,
        costLabel: '160K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'brain'
    },
    {
        id: 'ai_living_npcs',
        name: 'PNJs con IA viva',
        category: 'ai',
        categoryLabel: 'Inteligencia Artificial',
        cost: 240000,
        costK: 240,
        costLabel: '240K Cr.',
        techBranch: null,
        tier: 1,
        stage: 2,
        icon: 'brain'
    },

    // ==========================================
    // 8. DISEÑO DE MUNDO (7 características)
    // ==========================================
    {
        id: 'world_open_world',
        name: 'Mundo abierto',
        category: 'world_design',
        categoryLabel: 'Diseño de Mundo',
        cost: 30000,
        costK: 30,
        costLabel: '30K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'globe'
    },
    {
        id: 'world_day_night',
        name: 'Ciclo día y noche',
        category: 'world_design',
        categoryLabel: 'Diseño de Mundo',
        cost: 30000,
        costK: 30,
        costLabel: '30K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'globe'
    },
    {
        id: 'world_virtual_economy',
        name: 'Economía virtual',
        category: 'world_design',
        categoryLabel: 'Diseño de Mundo',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'globe'
    },
    {
        id: 'world_realistic_weather',
        name: 'Climatología realista',
        category: 'world_design',
        categoryLabel: 'Diseño de Mundo',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'globe'
    },
    {
        id: 'world_dynamic_world',
        name: 'Mundo dinámico',
        category: 'world_design',
        categoryLabel: 'Diseño de Mundo',
        cost: 140000,
        costK: 140,
        costLabel: '140K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'globe'
    },
    {
        id: 'world_destruction',
        name: 'Destrucción de entorno',
        category: 'world_design',
        categoryLabel: 'Diseño de Mundo',
        cost: 200000,
        costK: 200,
        costLabel: '200K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'globe'
    },
    {
        id: 'world_living_ecosystems',
        name: 'Ecosistemas vivos',
        category: 'world_design',
        categoryLabel: 'Diseño de Mundo',
        cost: 130000,
        costK: 130,
        costLabel: '130K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'globe'
    },

    // ==========================================
    // 9. SONIDO (7 características)
    // ==========================================
    {
        id: 'sound_mono',
        name: 'Sonido Mono',
        category: 'sound',
        categoryLabel: 'Sonido',
        cost: 30000,
        costK: 30,
        costLabel: '30K Cr.',
        techBranch: 'sound_channels',
        tier: 1,
        stage: 3,
        icon: 'speaker'
    },
    {
        id: 'sound_stereo',
        name: 'Sonido Estéreo',
        category: 'sound',
        categoryLabel: 'Sonido',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: 'sound_channels',
        tier: 2,
        stage: 3,
        icon: 'speaker'
    },
    {
        id: 'sound_soundtrack_basic',
        name: 'Banda sonora',
        category: 'sound',
        categoryLabel: 'Sonido',
        cost: 50000,
        costK: 50,
        costLabel: '50K Cr.',
        techBranch: 'soundtrack',
        tier: 1,
        stage: 3,
        icon: 'speaker'
    },
    {
        id: 'sound_surround',
        name: 'Sonido envolvente',
        category: 'sound',
        categoryLabel: 'Sonido',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: 'sound_channels',
        tier: 3,
        stage: 3,
        icon: 'speaker'
    },
    {
        id: 'sound_soundtrack_orchestral',
        name: 'Banda sonora orquestal',
        category: 'sound',
        categoryLabel: 'Sonido',
        cost: 140000,
        costK: 140,
        costLabel: '140K Cr.',
        techBranch: 'soundtrack',
        tier: 2,
        stage: 3,
        icon: 'speaker'
    },
    {
        id: 'sound_spatial_3d',
        name: 'Audio 3D espacial',
        category: 'sound',
        categoryLabel: 'Sonido',
        cost: 110000,
        costK: 110,
        costLabel: '110K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'speaker'
    },
    {
        id: 'sound_adaptive_music',
        name: 'Música adaptativa',
        category: 'sound',
        categoryLabel: 'Sonido',
        cost: 100000,
        costK: 100,
        costLabel: '100K Cr.',
        techBranch: null,
        tier: 1,
        stage: 3,
        icon: 'speaker'
    }
]);

// Map rápido por ID para búsquedas O(1)
const PARTS_BY_ID = new Map(ENGINE_PARTS_DATABASE.map(part => [part.id, part]));

/**
 * Obtiene una característica por su identificador único.
 */
export function getPartById(id) {
    return PARTS_BY_ID.get(id) || null;
}

/**
 * Obtiene todas las características pertenecientes a una categoría.
 */
export function getPartsByCategory(category) {
    return ENGINE_PARTS_DATABASE.filter(p => p.category === category);
}

/**
 * Retorna las 9 categorías disponibles.
 */
export function getCategories() {
    return Object.values(ENGINE_CATEGORIES);
}

/**
 * Calcula el coste total en créditos de un conjunto de IDs seleccionados.
 */
export function calculateEngineCost(selectedPartIds) {
    if (!selectedPartIds || !selectedPartIds.length) return 0;
    let sum = 0;
    for (const id of selectedPartIds) {
        const part = PARTS_BY_ID.get(id);
        if (part) sum += part.cost;
    }
    return sum;
}

/**
 * Regla de sustitución progresiva automática (Subagente 4):
 * Si se selecciona una nueva característica con rama técnica (techBranch),
 * elimina automáticamente cualquier versión previa o alternativa de esa misma rama.
 *
 * @param {Set<string>|Array<string>} currentIds Colección de IDs actualmente seleccionados
 * @param {string} incomingId El ID de la característica que se desea conmutar/añadir
 * @returns {{ nextIds: Set<string>, replacedId: string|null }}
 */
export function resolveBranchReplacement(currentIds, incomingId) {
    const next = new Set(currentIds);
    const incomingPart = getPartById(incomingId);

    if (!incomingPart) {
        return { nextIds: next, replacedId: null };
    }

    // Si ya estaba seleccionada, simplemente la deseleccionamos (toggle off)
    if (next.has(incomingId)) {
        next.delete(incomingId);
        return { nextIds: next, replacedId: null };
    }

    let replacedId = null;

    // Si pertenece a una rama técnica progresiva, deselecciona las versiones hermanas
    if (incomingPart.techBranch) {
        for (const existingId of next) {
            const existingPart = getPartById(existingId);
            if (existingPart && existingPart.techBranch === incomingPart.techBranch && existingId !== incomingId) {
                next.delete(existingId);
                replacedId = existingId;
            }
        }
    }

    next.add(incomingId);
    return { nextIds: next, replacedId };
}

