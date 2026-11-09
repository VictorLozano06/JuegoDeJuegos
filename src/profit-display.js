// A missing marker is an older record whose production costs cannot be verified.
export function profitCompleteness(game) {
    if (game?.productionCostCompleteness === 'complete' && Number.isFinite(game.productionPayrollCost) && game.productionPayrollCost >= 0) return 'complete';
    if (game?.productionCostCompleteness === 'incomplete') return 'incomplete';
    return 'unknown';
}
export function profitWarning(game) {
    const state = profitCompleteness(game);
    if (state === 'complete') return '';
    return state === 'incomplete'
        ? 'Rentabilidad incompleta: se usan los costes disponibles; faltan costes históricos que no pudieron reconstruirse.'
        : 'Rentabilidad histórica no verificada: se usan los costes disponibles y pueden faltar costes históricos que no pudieron reconstruirse.';
}
export function formatGameProfit(game) {
    if (!Number.isFinite(game?.profit)) return 'Sin datos';
    const value = Math.floor(game.profit);
    return `${value >= 0 ? '+' : ''}$${value.toLocaleString('es-ES')}`;
}
