import { registerIP } from './ipSystem.js';

export function commitPreproduction(game, config, newIPName = null) {
    if (game.currentProject) return { success: false, message: 'Ya hay otro videojuego en desarrollo.' };
    const snapshot = {
        ipState: structuredClone(game.ipState),
        funds: game.funds,
        ownedDevKits: [...(game.ownedDevKits || [])],
        currentProject: game.currentProject
    };
    let ipId = config.ipId;
    if (newIPName) {
        const registration = registerIP(game.ipState, game.getIPOwner(), {
            name: newIPName,
            originalGenre: config.genreId,
            originalTopic: config.topicId
        }, { year: game.getHistoricalYear(), ownedGames: game.gamesHistory });
        if (!registration.success) return registration;
        ipId = registration.ip.id;
    }
    let result;
    try {
        result = game.startNewGameProject({
            ...config,
            ipId,
            ipInstallmentType: newIPName ? 'original' : config.ipInstallmentType
        });
    } catch (error) {
        result = { success: false, message: error?.message || 'No se pudo iniciar el proyecto.' };
    }
    if (!result.success) {
        game.ipState = snapshot.ipState;
        game.funds = snapshot.funds;
        game.ownedDevKits = snapshot.ownedDevKits;
        game.currentProject = snapshot.currentProject;
    }
    return result;
}
