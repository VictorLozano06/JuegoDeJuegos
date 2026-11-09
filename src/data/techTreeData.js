/**
 * DEV EMPIRE 3D - Catálogo de Investigación Tecnológica (I+D)
 * Integrado al 100% con el catálogo de características del Motor de Videojuegos (ENGINE_PARTS_DATABASE).
 * Sustituye completamente las antiguas tecnologías obsoletas por las 82 características del motor.
 */

// id, nombre, categoría, año aparición, coste RP, riesgo deuda, prerrequisitos, coste en motor (K Cr.), isLegacyAlias
const rows = [
    // ----------------------------------------------------
    // 1. GRÁFICO (graphics) - 16 características
    // ----------------------------------------------------
    ['graphics_2d_v1', 'Gráficos 2D V.1', 'graphics', 1982, 0, 0, [], 10],
    ['graphics_2d_v2', 'Gráficos 2D V.2', 'graphics', 1984, 25, 1, ['graphics_2d_v1'], 50],
    ['graphics_2d_v3', 'Gráficos 2D V.3', 'graphics', 1988, 50, 2, ['graphics_2d_v2'], 100],
    ['graphics_2d_v4', 'Gráficos 2D V.4', 'graphics', 1993, 80, 3, ['graphics_2d_v3'], 140],
    ['graphics_2d_v5', 'Gráficos 2D V.5', 'graphics', 1998, 120, 4, ['graphics_2d_v4'], 180],
    ['graphics_3d_v1', 'Gráficos 3D V.1', 'graphics', 1992, 45, 3, ['graphics_2d_v2'], 30],
    ['graphics_3d_v2', 'Gráficos 3D V.2', 'graphics', 1995, 65, 4, ['graphics_3d_v1'], 50],
    ['graphics_3d_v3', 'Gráficos 3D V.3', 'graphics', 2000, 90, 5, ['graphics_3d_v2'], 100],
    ['graphics_3d_v4', 'Gráficos 3D V.4', 'graphics', 2005, 120, 6, ['graphics_3d_v3'], 140],
    ['graphics_3d_v5', 'Gráficos 3D V.5', 'graphics', 2011, 150, 7, ['graphics_3d_v4'], 180],
    ['graphics_3d_v6', 'Gráficos 3D V.6', 'graphics', 2016, 190, 8, ['graphics_3d_v5'], 220],
    ['graphics_3d_v7', 'Gráficos 3D V.7', 'graphics', 2021, 240, 10, ['graphics_3d_v6'], 300],
    ['graphics_3d_stereoscopic', '3D estereoscópica avanzada', 'graphics', 2010, 85, 4, ['graphics_3d_v3'], 50],
    ['graphics_ray_tracing', 'Ray Tracing', 'graphics', 2019, 220, 10, ['graphics_3d_v5'], 280],
    ['graphics_ai_upscaling', 'Escalado por I.A.', 'graphics', 2020, 180, 8, ['graphics_3d_v5'], 160],
    ['graphics_vr', 'Realidad Virtual', 'graphics', 2016, 160, 8, ['graphics_3d_v4'], 120],

    // ----------------------------------------------------
    // 2. HISTORIA / MISIONES (story) - 11 características
    // ----------------------------------------------------
    ['story_linear', 'Historia lineal', 'story', 1982, 0, 0, [], 30],
    ['story_branching', 'Historia ramificada', 'story', 1985, 25, 1, ['story_linear'], 50],
    ['story_cutscenes_simple', 'Escenas sencillas', 'story', 1987, 25, 1, ['story_linear'], 30],
    ['story_cutscenes_advanced', 'Escenas avanzadas', 'story', 1993, 50, 2, ['story_cutscenes_simple'], 50],
    ['story_fmv', 'Vídeo de movimiento completo', 'story', 1994, 65, 3, ['story_cutscenes_advanced'], 100],
    ['story_interactive', 'Historia interactiva', 'story', 1997, 75, 4, ['story_branching'], 100],
    ['story_moral_choices', 'Elecciones morales', 'story', 2001, 85, 4, ['story_interactive'], 100],
    ['story_immersive_narrative', 'Narrativa inmersiva', 'story', 2007, 110, 5, ['story_interactive'], 140],
    ['story_reactive_quests', 'Misiones reactivas', 'story', 2012, 140, 6, ['story_branching'], 180],
    ['story_nemesis_system', 'Sistema Némesis', 'story', 2015, 180, 8, ['story_reactive_quests'], 210],
    ['story_procedural_quests', 'Misiones procedurales', 'story', 2018, 160, 7, ['story_reactive_quests'], 150],

    // ----------------------------------------------------
    // 3. MOTOR (engine) - 11 características
    // ----------------------------------------------------
    ['engine_save_game', 'Guardar Partida', 'engine', 1982, 0, 0, [], 10],
    ['engine_local_multiplayer', 'Multijugador local', 'engine', 1984, 20, 1, ['engine_save_game'], 30],
    ['engine_physics_basic', 'Física básica', 'engine', 1983, 20, 1, [], 50],
    ['engine_video_playback', 'Reproducción de vídeo', 'engine', 1993, 45, 2, [], 50],
    ['engine_physics_advanced', 'Física avanzada', 'engine', 1997, 70, 4, ['engine_physics_basic'], 140],
    ['engine_mod_support', 'Soporte de mods', 'engine', 1999, 50, 3, [], 30],
    ['engine_online_play', 'Juego online', 'engine', 1998, 80, 5, ['engine_local_multiplayer'], 100],
    ['engine_fast_loading', 'Carga Ultrarrápida', 'engine', 2003, 85, 4, [], 140],
    ['engine_dedicated_servers', 'Servidores Dedicados', 'engine', 2004, 110, 6, ['engine_online_play'], 180],
    ['engine_rollback_netcode', 'Rollback Netcode', 'engine', 2012, 130, 7, ['engine_online_play'], 130],
    ['engine_crossplay', 'Juego Cruzado', 'engine', 2018, 150, 6, ['engine_dedicated_servers'], 160],

    // ----------------------------------------------------
    // 4. JUGABILIDAD (gameplay) - 8 características
    // ----------------------------------------------------
    ['gameplay_tutorials', 'Tutoriales del juego', 'gameplay', 1984, 15, 1, [], 30],
    ['gameplay_better_ux', 'Mejor experiencia de usuario', 'gameplay', 1986, 20, 1, ['gameplay_tutorials'], 30],
    ['gameplay_character_progression', 'Progreso de personaje', 'gameplay', 1987, 30, 2, [], 50],
    ['gameplay_skill_tree', 'Árbol de habilidades', 'gameplay', 1994, 55, 3, ['gameplay_character_progression'], 100],
    ['gameplay_coop', 'Juego cooperativo', 'gameplay', 1998, 75, 4, ['engine_local_multiplayer'], 140],
    ['gameplay_physics_combat', 'Combate por físicas', 'gameplay', 2008, 100, 5, ['engine_physics_advanced'], 150],
    ['gameplay_photo_mode', 'Modo Foto', 'gameplay', 2014, 60, 2, [], 40],
    ['gameplay_haptic_feedback', 'Vibración háptica', 'gameplay', 2019, 90, 4, [], 70],

    // ----------------------------------------------------
    // 5. DIÁLOGOS (dialogues) - 9 características
    // ----------------------------------------------------
    ['dialogues_improved', 'Diálogos mejorados', 'dialogues', 1984, 15, 1, [], 10],
    ['dialogues_tree', 'Árbol de diálogos', 'dialogues', 1988, 35, 2, ['dialogues_improved'], 50],
    ['dialogues_voice_acting', 'Doblaje de voz', 'dialogues', 1995, 65, 4, ['dialogues_tree'], 100],
    ['dialogues_body_lang_simple', 'Lenguaje corporal sencillo', 'dialogues', 1997, 65, 3, ['dialogues_tree'], 100],
    ['dialogues_celebrity_voices', 'Voces de famosos', 'dialogues', 2000, 80, 4, ['dialogues_voice_acting'], 100],
    ['dialogues_body_lang_adv', 'Lenguaje corporal avanzado', 'dialogues', 2004, 95, 5, ['dialogues_body_lang_simple'], 140],
    ['dialogues_lip_sync', 'Sincronía Labial', 'dialogues', 2007, 90, 4, ['dialogues_voice_acting'], 120],
    ['dialogues_body_lang_real', 'Lenguaje corporal realista', 'dialogues', 2013, 130, 6, ['dialogues_body_lang_adv'], 180],
    ['dialogues_facial_capture', 'Captura Facial', 'dialogues', 2016, 150, 7, ['dialogues_lip_sync'], 170],

    // ----------------------------------------------------
    // 6. DISEÑO DE NIVEL (level_design) - 7 características
    // ----------------------------------------------------
    ['level_editor', 'Editor de niveles', 'level_design', 1984, 15, 1, [], 10],
    ['level_easter_eggs', 'Huevos de Pascua', 'level_design', 1985, 15, 1, [], 30],
    ['level_minigames', 'Mini-juegos', 'level_design', 1987, 30, 2, [], 50],
    ['level_dynamic_environment', 'Entorno dinámico', 'level_design', 1996, 70, 4, ['level_minigames'], 100],
    ['level_seamless_loading', 'Sin pantallas de carga', 'level_design', 2002, 85, 4, ['engine_fast_loading'], 140],
    ['level_parkour', 'Sistema de Parkour', 'level_design', 2008, 85, 4, ['level_dynamic_environment'], 110],
    ['level_procedural', 'Niveles procedurales', 'level_design', 2013, 120, 6, ['level_dynamic_environment'], 150],

    // ----------------------------------------------------
    // 7. INTELIGENCIA ARTIFICIAL (ai) - 6 características
    // ----------------------------------------------------
    ['ai_improved', 'I.A. Mejorada', 'ai', 1984, 25, 1, [], 50],
    ['ai_companions', 'Compañeros I.A.', 'ai', 1993, 50, 3, ['ai_improved'], 50],
    ['ai_squad_tactics', 'Tácticas de escuadrón', 'ai', 2000, 85, 4, ['ai_companions'], 130],
    ['ai_dynamic_crowds', 'Multitudes dinámicas', 'ai', 2007, 110, 5, ['ai_improved'], 160],
    ['ai_self_learning', 'I.A. con autoaprendizaje', 'ai', 2016, 160, 7, ['ai_squad_tactics'], 180],
    ['ai_living_npcs', 'PNJs con IA viva', 'ai', 2022, 230, 9, ['ai_self_learning'], 240],

    // ----------------------------------------------------
    // 8. DISEÑO DE MUNDO (world_design) - 7 características
    // ----------------------------------------------------
    ['world_open_world', 'Mundo abierto', 'world_design', 1988, 35, 2, [], 30],
    ['world_day_night', 'Ciclo día y noche', 'world_design', 1991, 35, 2, ['world_open_world'], 30],
    ['world_virtual_economy', 'Economía virtual', 'world_design', 1994, 50, 3, ['world_open_world'], 50],
    ['world_realistic_weather', 'Climatología realista', 'world_design', 2000, 80, 4, ['world_day_night'], 100],
    ['world_dynamic_world', 'Mundo dinámico', 'world_design', 2006, 105, 5, ['world_realistic_weather'], 140],
    ['world_destruction', 'Destrucción de entorno', 'world_design', 2011, 140, 7, ['world_dynamic_world'], 200],
    ['world_living_ecosystems', 'Ecosistemas vivos', 'world_design', 2017, 130, 6, ['world_dynamic_world'], 130],

    // ----------------------------------------------------
    // 9. SONIDO (sound) - 7 características
    // ----------------------------------------------------
    ['sound_mono', 'Sonido Mono', 'sound', 1982, 0, 0, [], 30],
    ['sound_stereo', 'Sonido Estéreo', 'sound', 1985, 25, 1, ['sound_mono'], 50],
    ['sound_soundtrack_basic', 'Banda sonora', 'sound', 1987, 30, 2, ['sound_stereo'], 50],
    ['sound_surround', 'Sonido envolvente', 'sound', 1996, 65, 3, ['sound_stereo'], 100],
    ['sound_soundtrack_orchestral', 'Banda sonora orquestal', 'sound', 2002, 90, 4, ['sound_soundtrack_basic'], 140],
    ['sound_spatial_3d', 'Audio 3D espacial', 'sound', 2006, 85, 4, ['sound_surround'], 110],
    ['sound_adaptive_music', 'Música adaptativa', 'sound', 2012, 100, 5, ['sound_soundtrack_orchestral'], 100],

    // ----------------------------------------------------
    // Alias de compatibilidad retroactiva para tests existentes
    // ----------------------------------------------------
    ['tech_graphics_text_ascii', 'Modo Texto & ASCII', 'graphics', 1982, 0, 0, [], 10, true],
    ['tech_graphics_2d_sprites', 'Sprites 2D por Hardware', 'graphics', 1983, 15, 2, ['tech_graphics_text_ascii'], 20, true],
    ['tech_graphics_fixed_palette', 'Paleta de Color Fija (16c)', 'graphics', 1983, 10, 1, [], 20, true],
    ['tech_graphics_parallax_scroll', 'Scroll Parallax Básico', 'graphics', 1986, 25, 4, ['tech_graphics_2d_sprites'], 30, true],
    ['tech_graphics_mode7', 'Modo 7 & Escalado 2D', 'graphics', 1990, 35, 5, ['tech_graphics_parallax_scroll'], 40, true],
    ['tech_graphics_early_3d_polygons', '3D Poligonal (Flat Shading)', 'graphics', 1993, 55, 9, ['tech_graphics_mode7'], 50, true],
    ['tech_code_pure_asm', 'Código en Ensamblador Puro', 'engine', 1982, 0, 8, [], 10, true],
    ['tech_code_real_mode_mem', 'Gestión de Memoria en Modo Real', 'engine', 1983, 15, 6, ['tech_code_pure_asm'], 20, true],
    ['tech_net_lan_ipx', 'Conexión Local LAN / IPX', 'engine', 2000, 70, 6, [], 30, true],
    ['tech_net_dedicated_client_server', 'Arquitectura Cliente-Servidor Dedicado', 'engine', 2003, 110, 10, ['tech_net_lan_ipx'], 180, true],
    ['tech_net_matchmaking_leaderboards', 'Matchmaking Centralizado & Marcadores', 'engine', 2006, 125, 8, ['tech_net_dedicated_client_server'], 100, true],
    ['tech_net_cloud_virtualization', 'Arquitectura Servidores en la Nube', 'engine', 2012, 160, 12, ['tech_net_matchmaking_leaderboards'], 140, true],
    ['tech_net_massive_spatial_sharding', 'Instancias Masivas para Battle Royale/MMO', 'engine', 2020, 240, 16, ['tech_net_cloud_virtualization'], 180, true]
];

const categoryIndex = {
    graphics: 0,
    story: 1,
    engine: 2,
    gameplay: 3,
    dialogues: 4,
    level_design: 5,
    ai: 6,
    world_design: 7,
    sound: 8,
    // Compatibilidad con categorías antiguas
    Graphics: 0,
    Audio: 8,
    Engine: 2,
    Physics: 3,
    AI: 6,
    Network: 2
};

const slots = new Map();

export const TECH_TREE_NODES = rows.map(([id, name, category, eraYear, researchCost, baseDebt, requiredNodes, costK = 10, isLegacyAlias = false]) => {
    const key = `${eraYear}:${category}`;
    const slot = slots.get(key) || 0;
    slots.set(key, slot + 1);
    const catIdx = categoryIndex[category] ?? 0;
    return {
        id,
        name,
        category,
        eraYear,
        minYear: eraYear,
        researchCost,
        costRP: researchCost,
        baseDebt,
        requiredNodes,
        prerequisites: requiredNodes,
        costK,
        costMoney: costK * 1000,
        isLegacyAlias,
        position: {
            x: (eraYear - 1982) * 3,
            y: (4 - catIdx) * 6,
            z: slot * 5
        }
    };
});

const byId = new Map(TECH_TREE_NODES.map(node => [node.id, node]));

/** Compara años de tecnologías seleccionadas; ignora identificadores no reconocidos. */
export function calculateTechIncompatibility(selectedNodes = []) {
    const nodes = Array.from(selectedNodes, item => typeof item === 'string' ? byId.get(item) : item).filter(node => node && Number.isFinite(node.eraYear));
    if (nodes.length < 2) return { gapYears: 0, multiplier: 1, incompatible: false };
    const years = nodes.map(node => node.eraYear);
    const gapYears = Math.max(...years) - Math.min(...years);
    return { gapYears, multiplier: gapYears > 12 ? 1 + (gapYears - 12) * 0.08 : 1, incompatible: gapYears > 12 };
}

export default TECH_TREE_NODES;
