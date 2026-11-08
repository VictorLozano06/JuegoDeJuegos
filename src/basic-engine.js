export const BASIC_ENGINE_ID = 'engine_v1';

// Keep the legacy ID so existing projects and saves continue to resolve it.
export function ensureBasicEngine(game) {
    if (!Array.isArray(game.customEngines)) game.customEngines = [];
    let engine = game.customEngines.find(item => item?.id === BASIC_ENGINE_ID);
    if (!engine) {
        engine = {
            id: BASIC_ENGINE_ID,
            features: ['graphics2d_v1', 'sound_chiptune'],
            bonusTech: 18,
            bonusDesign: 22,
            bonusScore: 0.30
        };
        game.customEngines.unshift(engine);
    }
    engine.name = 'Basics';
    return engine;
}
