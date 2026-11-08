export const CALENDAR_WEEK_MS = 5600;
export const DEVELOPMENT_TICK_MS = 240;

export function ensureExpoState(game) {
    if (!game.expoState || typeof game.expoState !== 'object') game.expoState = {};
    const state = game.expoState;
    if (!Number.isInteger(state.lastAnnouncedYear)) state.lastAnnouncedYear = 0;
    if (!Number.isInteger(state.pendingYear)) state.pendingYear = null;
    if (!Number.isInteger(state.resolvedYear)) state.resolvedYear = null;
    return state;
}

/** The invitation belongs to one game year and never opens a window itself. */
export function updateExpoSchedule(game) {
    const state = ensureExpoState(game);
    if (state.pendingYear !== null && state.pendingYear !== game.year) state.pendingYear = null;
    if (game.month !== 6 || game.week !== 1 || state.lastAnnouncedYear === game.year || state.resolvedYear === game.year) return false;
    state.lastAnnouncedYear = game.year;
    state.pendingYear = game.year;
    return true;
}

export function hasExpoInvitation(game) {
    return ensureExpoState(game).pendingYear === game.year;
}

export function resolveExpoInvitation(game) {
    const state = ensureExpoState(game);
    if (state.pendingYear !== game.year) return false;
    state.pendingYear = null;
    state.resolvedYear = game.year;
    return true;
}
