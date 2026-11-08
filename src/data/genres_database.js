// =========================================================================
// CATÁLOGO COMPLETO DE GÉNEROS (GENRES_DATABASE)
// Clasificación por Eras, Costes de I+D, Sinergias y Requerimientos Técnicos
// =========================================================================

export const GENRES_DATABASE = [
    // --- A. GÉNEROS BASE (Año 1982 | 0 RP | Desbloqueados por Defecto) ---
    {
        id: 'action',
        aliases: ['Action', 'accion', 'Acción'],
        name: 'Acción',
        era: 'base',
        unlockedYear: 1982,
        costRP: 0,
        requiredTech: [],
        synergies: ['medieval', 'military', 'space', 'martial_arts'],
        idealStage1: { engine: 0.90, gameplay: 0.85, story: 0.30 },
        idealStage2: { dialogues: 0.30, levelDesign: 0.85, ai: 0.85 },
        idealStage3: { worldDesign: 0.55, graphics: 0.95, sound: 0.85 },
        architectureProfile: { engine: 0.25, gameplay: 0.35, net: 0.10, art: 0.20, qa: 0.10 },
        description: 'Reflejos y combate directo.'
    },
    {
        id: 'adventure',
        aliases: ['Adventure', 'aventura', 'Aventura'],
        name: 'Aventura',
        era: 'base',
        unlockedYear: 1982,
        costRP: 0,
        requiredTech: [],
        synergies: ['detective', 'pirates', 'horror'],
        idealStage1: { engine: 0.45, gameplay: 0.70, story: 0.95 },
        idealStage2: { dialogues: 0.95, levelDesign: 0.80, ai: 0.40 },
        idealStage3: { worldDesign: 0.90, graphics: 0.85, sound: 0.85 },
        architectureProfile: { engine: 0.10, gameplay: 0.25, net: 0.05, art: 0.40, qa: 0.20 },
        description: 'Exploración y resolución de acertijos.'
    },
    {
        id: 'rpg',
        aliases: ['RPG', 'rol', 'Rol'],
        name: 'Rol',
        era: 'base',
        unlockedYear: 1982,
        costRP: 0,
        requiredTech: [],
        synergies: ['medieval', 'cyberpunk', 'apocalypse'],
        idealStage1: { engine: 0.60, gameplay: 0.85, story: 0.95 },
        idealStage2: { dialogues: 0.95, levelDesign: 0.75, ai: 0.65 },
        idealStage3: { worldDesign: 0.95, graphics: 0.80, sound: 0.80 },
        architectureProfile: { engine: 0.15, gameplay: 0.30, net: 0.05, art: 0.35, qa: 0.15 },
        description: 'Progresión y narrativa profunda.'
    },
    {
        id: 'strategy',
        aliases: ['Strategy', 'estrategia', 'Estrategia'],
        name: 'Estrategia',
        era: 'base',
        unlockedYear: 1982,
        costRP: 0,
        requiredTech: [],
        synergies: ['military', 'space', 'city', 'hospital'],
        idealStage1: { engine: 0.80, gameplay: 0.95, story: 0.40 },
        idealStage2: { dialogues: 0.40, levelDesign: 0.95, ai: 0.95 },
        idealStage3: { worldDesign: 0.70, graphics: 0.60, sound: 0.65 },
        architectureProfile: { engine: 0.20, gameplay: 0.35, net: 0.15, art: 0.10, qa: 0.20 },
        description: 'Planificación táctica y gestión.'
    },
    {
        id: 'simulation',
        aliases: ['Simulation', 'simulacion', 'Simulación'],
        name: 'Simulación',
        era: 'base',
        unlockedYear: 1982,
        costRP: 0,
        requiredTech: [],
        synergies: ['sports', 'racing', 'city', 'farming'],
        idealStage1: { engine: 0.95, gameplay: 0.90, story: 0.20 },
        idealStage2: { dialogues: 0.25, levelDesign: 0.85, ai: 0.90 },
        idealStage3: { worldDesign: 0.85, graphics: 0.80, sound: 0.70 },
        architectureProfile: { engine: 0.35, gameplay: 0.25, net: 0.05, art: 0.15, qa: 0.20 },
        description: 'Recreación de sistemas reales.'
    },
    {
        id: 'casual',
        aliases: ['Casual', 'arcade', 'Casual / Arcade'],
        name: 'Casual',
        era: 'base',
        unlockedYear: 1982,
        costRP: 0,
        requiredTech: [],
        synergies: ['sports', 'pets', 'comedy'],
        idealStage1: { engine: 0.40, gameplay: 0.95, story: 0.20 },
        idealStage2: { dialogues: 0.20, levelDesign: 0.85, ai: 0.40 },
        idealStage3: { worldDesign: 0.60, graphics: 0.80, sound: 0.85 },
        architectureProfile: { engine: 0.15, gameplay: 0.40, net: 0.10, art: 0.20, qa: 0.15 },
        description: 'Mecánicas accesibles e inmediatas.'
    },

    // --- B. GÉNEROS CLÁSICOS Y 3D (1985 - 1999 | Desbloqueo por I+D y Año) ---
    {
        id: 'platformer',
        aliases: ['Platformer', 'plataformas', 'Plataformas'],
        name: 'Plataformas',
        era: 'classic',
        unlockedYear: 1985,
        costRP: 15,
        requiredTech: [],
        synergies: ['comedy', 'superheroes', 'space'],
        idealStage1: { engine: 0.85, gameplay: 0.95, story: 0.20 },
        idealStage2: { dialogues: 0.15, levelDesign: 0.95, ai: 0.60 },
        idealStage3: { worldDesign: 0.75, graphics: 0.85, sound: 0.80 },
        architectureProfile: { engine: 0.20, gameplay: 0.40, net: 0.05, art: 0.25, qa: 0.10 },
        description: 'Saltos de precisión y diseño de niveles vertical.'
    },
    {
        id: 'fighting',
        aliases: ['Fighting', 'lucha', 'Lucha'],
        name: 'Lucha',
        era: 'classic',
        unlockedYear: 1991,
        costRP: 25,
        requiredTech: [],
        synergies: ['martial_arts', 'superheroes', 'multiverse'],
        idealStage1: { engine: 0.90, gameplay: 0.95, story: 0.25 },
        idealStage2: { dialogues: 0.20, levelDesign: 0.70, ai: 0.90 },
        idealStage3: { worldDesign: 0.60, graphics: 0.95, sound: 0.90 },
        architectureProfile: { engine: 0.30, gameplay: 0.40, net: 0.10, art: 0.10, qa: 0.10 },
        description: 'Duelos directos, cancelaciones de combos y frame data.'
    },
    {
        id: 'shooter',
        aliases: ['Shooter', 'disparos', 'FPS'],
        name: 'Shooter',
        era: 'classic',
        unlockedYear: 1992,
        costRP: 35,
        requiredTech: ['tech_3d'],
        synergies: ['military', 'space', 'cyberpunk', 'zombies'],
        idealStage1: { engine: 0.95, gameplay: 0.85, story: 0.40 },
        idealStage2: { dialogues: 0.30, levelDesign: 0.90, ai: 0.85 },
        idealStage3: { worldDesign: 0.70, graphics: 0.95, sound: 0.90 },
        architectureProfile: { engine: 0.35, gameplay: 0.30, net: 0.10, art: 0.15, qa: 0.10 },
        description: 'Puntería en primera o tercera persona. Requiere tecnología de Gráficos 3D.'
    },
    {
        id: 'survival_horror',
        aliases: ['Survival Horror', 'survival', 'terror_supervivencia'],
        name: 'Survival Horror',
        era: 'classic',
        unlockedYear: 1996,
        costRP: 40,
        requiredTech: [],
        synergies: ['horror', 'zombies', 'apocalypse', 'backrooms'],
        idealStage1: { engine: 0.70, gameplay: 0.80, story: 0.90 },
        idealStage2: { dialogues: 0.60, levelDesign: 0.95, ai: 0.80 },
        idealStage3: { worldDesign: 0.95, graphics: 0.90, sound: 0.95 },
        architectureProfile: { engine: 0.20, gameplay: 0.25, net: 0.05, art: 0.35, qa: 0.15 },
        description: 'Gestión de munición, cámaras angustiosas y atmósfera de pavor.'
    },
    {
        id: 'mmo',
        aliases: ['MMO', 'MMORPG', 'mmo_rpg'],
        name: 'MMO',
        era: 'classic',
        unlockedYear: 1997,
        costRP: 60,
        requiredTech: ['network_servers'],
        synergies: ['medieval', 'space', 'cyberpunk'],
        idealStage1: { engine: 0.90, gameplay: 0.85, story: 0.75 },
        idealStage2: { dialogues: 0.70, levelDesign: 0.85, ai: 0.75 },
        idealStage3: { worldDesign: 0.95, graphics: 0.80, sound: 0.80 },
        architectureProfile: { engine: 0.25, gameplay: 0.25, net: 0.30, art: 0.10, qa: 0.10 },
        description: 'Mundo persistente multijugador masivo en línea. Requiere Servidores de Red.'
    },
    {
        id: 'stealth',
        aliases: ['Stealth', 'sigilo', 'Sigilo'],
        name: 'Sigilo',
        era: 'classic',
        unlockedYear: 1998,
        costRP: 45,
        requiredTech: [],
        synergies: ['espionage', 'cyberpunk', 'military'],
        idealStage1: { engine: 0.80, gameplay: 0.90, story: 0.70 },
        idealStage2: { dialogues: 0.50, levelDesign: 0.95, ai: 0.95 },
        idealStage3: { worldDesign: 0.80, graphics: 0.85, sound: 0.90 },
        architectureProfile: { engine: 0.25, gameplay: 0.30, net: 0.05, art: 0.20, qa: 0.20 },
        description: 'Infiltración táctica, manipulación de sombras y rutinas de patrulla.'
    },

    // --- C. GÉNEROS MODERNOS (2010 en adelante | Era Digital e I+D Avanzado) ---
    {
        id: 'roguelike',
        aliases: ['Roguelike', 'rogue_lite', 'Rogue'],
        name: 'Roguelike',
        era: 'modern',
        unlockedYear: 2011,
        costRP: 60,
        requiredTech: [],
        synergies: ['medieval', 'mythology', 'space', 'horror'],
        idealStage1: { engine: 0.75, gameplay: 0.95, story: 0.40 },
        idealStage2: { dialogues: 0.30, levelDesign: 0.95, ai: 0.85 },
        idealStage3: { worldDesign: 0.70, graphics: 0.75, sound: 0.80 },
        architectureProfile: { engine: 0.20, gameplay: 0.45, net: 0.05, art: 0.15, qa: 0.15 },
        description: 'Generación procedural de mazmorras, sinergias de objetos y muerte permanente.'
    },
    {
        id: 'soulslike',
        aliases: ['Soulslike', 'souls_like', 'Souls'],
        name: 'Soulslike',
        era: 'modern',
        unlockedYear: 2011,
        costRP: 70,
        requiredTech: ['tech_3d'],
        synergies: ['medieval', 'mythology', 'horror', 'folklore'],
        idealStage1: { engine: 0.90, gameplay: 0.95, story: 0.70 },
        idealStage2: { dialogues: 0.40, levelDesign: 0.95, ai: 0.95 },
        idealStage3: { worldDesign: 0.95, graphics: 0.90, sound: 0.90 },
        architectureProfile: { engine: 0.30, gameplay: 0.35, net: 0.05, art: 0.20, qa: 0.10 },
        description: 'Desafío implacable, combate metódico con stamina y diseño intrincado.'
    },
    {
        id: 'deckbuilder',
        aliases: ['Deckbuilder', 'deck_builder', 'cartas_roguelike'],
        name: 'Deckbuilder',
        era: 'modern',
        unlockedYear: 2014,
        costRP: 65,
        requiredTech: [],
        synergies: ['mythology', 'medieval', 'cyberpunk'],
        idealStage1: { engine: 0.65, gameplay: 0.95, story: 0.35 },
        idealStage2: { dialogues: 0.30, levelDesign: 0.90, ai: 0.90 },
        idealStage3: { worldDesign: 0.60, graphics: 0.75, sound: 0.75 },
        architectureProfile: { engine: 0.15, gameplay: 0.50, net: 0.05, art: 0.15, qa: 0.15 },
        description: 'Construcción y refinamiento de barajas estratégicas por turnos.'
    },
    {
        id: 'cozy',
        aliases: ['Cozy', 'cozy_game', 'relajante'],
        name: 'Cozy',
        era: 'modern',
        unlockedYear: 2016,
        costRP: 55,
        requiredTech: [],
        synergies: ['farming', 'pets', 'school', 'cleaning'],
        idealStage1: { engine: 0.50, gameplay: 0.85, story: 0.75 },
        idealStage2: { dialogues: 0.75, levelDesign: 0.85, ai: 0.60 },
        idealStage3: { worldDesign: 0.90, graphics: 0.90, sound: 0.95 },
        architectureProfile: { engine: 0.15, gameplay: 0.30, net: 0.05, art: 0.35, qa: 0.15 },
        description: 'Atmósferas cálidas, actividades cotidianas satisfactorias y ausencia de estrés.'
    },
    {
        id: 'battle_royale',
        aliases: ['Battle Royale', 'battle_royale', 'BR'],
        name: 'Battle Royale',
        era: 'modern',
        unlockedYear: 2017,
        costRP: 90,
        requiredTech: ['mass_multiplayer', 'network_servers'],
        synergies: ['military', 'apocalypse', 'cyberpunk'],
        idealStage1: { engine: 0.95, gameplay: 0.90, story: 0.10 },
        idealStage2: { dialogues: 0.10, levelDesign: 0.95, ai: 0.70 },
        idealStage3: { worldDesign: 0.85, graphics: 0.85, sound: 0.90 },
        architectureProfile: { engine: 0.30, gameplay: 0.30, net: 0.30, art: 0.05, qa: 0.05 },
        description: 'Supervivencia masiva de 100 jugadores en mapa decreciente. Requiere Servidores Masivos.'
    },
    {
        id: 'extraction',
        aliases: ['Extracción', 'Extraction', 'extraction_shooter'],
        name: 'Extracción',
        era: 'modern',
        unlockedYear: 2017,
        costRP: 85,
        requiredTech: ['network_servers'],
        synergies: ['military', 'apocalypse', 'espionage', 'tactical'],
        idealStage1: { engine: 0.95, gameplay: 0.90, story: 0.40 },
        idealStage2: { dialogues: 0.25, levelDesign: 0.95, ai: 0.85 },
        idealStage3: { worldDesign: 0.85, graphics: 0.90, sound: 0.95 },
        architectureProfile: { engine: 0.30, gameplay: 0.30, net: 0.25, art: 0.10, qa: 0.05 },
        description: 'Incursiones tácticas PvPvE con botín permanente en riesgo. Requiere Servidores de Red.'
    },
    {
        id: 'auto_battler',
        aliases: ['Auto-Battler', 'Auto Battler', 'autochess'],
        name: 'Auto-Battler',
        era: 'modern',
        unlockedYear: 2019,
        costRP: 75,
        requiredTech: [],
        synergies: ['mythology', 'medieval', 'anime', 'multiverse'],
        idealStage1: { engine: 0.75, gameplay: 0.95, story: 0.20 },
        idealStage2: { dialogues: 0.20, levelDesign: 0.80, ai: 0.95 },
        idealStage3: { worldDesign: 0.70, graphics: 0.85, sound: 0.80 },
        architectureProfile: { engine: 0.20, gameplay: 0.45, net: 0.15, art: 0.10, qa: 0.10 },
        description: 'Gestión económica de tropas y sinergias con combate automatizado en tablero.'
    }
];

export const GENRES_MAP = new Map(GENRES_DATABASE.map(g => [g.id, g]));

export function findGenre(idOrName) {
    if (!idOrName) return GENRES_DATABASE[0];
    if (typeof idOrName === 'object' && idOrName.id) return findGenre(idOrName.id);
    const query = String(idOrName).toLowerCase().trim();
    return GENRES_DATABASE.find(g =>
        g.id.toLowerCase() === query ||
        g.name.toLowerCase() === query ||
        (g.aliases && g.aliases.some(a => a.toLowerCase() === query))
    ) || GENRES_DATABASE[0];
}

