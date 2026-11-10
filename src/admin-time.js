// Admin changes the calendar date without running the weekly simulation.
export function jumpToYear(game, targetYear) {
    const current = game.getHistoricalYear();
    if (!Number.isSafeInteger(targetYear) || targetYear < 1982 || targetYear === current || targetYear > 2200) {
        return { success: false, message: `Elige un año distinto de ${current}, entre 1982 y 2200.` };
    }
    if (game.financeState?.bankruptcy?.confirmed || game.financeState?.procedurePending) {
        return { success: false, message: 'Resuelve primero el procedimiento de bancarrota.' };
    }
    game.year = targetYear - 1981;
    if (targetYear < 2006) game.osUpdated2006 = false;
    if (current < 2006 && targetYear >= 2006 && !game.osUpdate2006Announced) {
        game.osUpdate2006Announced = true;
        game.createIndustryEvent?.('os_launch_2006');
    }
    game.notify?.();
    return { success: true, message: `Fecha cambiada de ${current} a ${targetYear}. La partida conserva sus avances y no se simulan semanas.` };
}
