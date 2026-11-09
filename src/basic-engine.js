export const BASIC_ENGINE_ID = 'engine_v1';

// Keep the legacy ID so existing projects and saves continue to resolve it.
export function ensureBasicEngine(game) {
    if (!Array.isArray(game.customEngines)) game.customEngines = [];
    let engine = game.customEngines.find(item => item?.id === BASIC_ENGINE_ID);
    if (!engine) {
        engine = {
            id: BASIC_ENGINE_ID,
            name: 'Basics',
            version: '1.0',
            features: ['graphics_2d_v1', 'sound_mono'],
            cost: 0,
            createdAt: 1982,
            bonusTech: 18,
            bonusDesign: 22,
            bonusScore: 0.30
        };
        game.customEngines.unshift(engine);
    }
    engine.name = 'Basics';
    if (!engine.version) engine.version = '1.0';
    if (!engine.createdAt) engine.createdAt = 1982;
    if (!Array.isArray(engine.features)) engine.features = ['graphics_2d_v1', 'sound_mono'];
    return engine;
}
