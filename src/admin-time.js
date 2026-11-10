// Admin changes the calendar date without running the weekly simulation.
export function jumpToYear(game, targetYear) {
    const current = game.getHistoricalYear();
    if (!Number.isSafeInteger(targetYear) || targetYear <= current || targetYear > 2200) {
        return { success: false, message: `Elige un año posterior a ${current} y hasta 2200.` };
    }
    if (game.financeState?.bankruptcy?.confirmed || game.financeState?.procedurePending) {
        return { success: false, message: 'Resuelve primero el procedimiento de bancarrota.' };
    }
    game.year = targetYear - 1981;
    if (current < 2006 && targetYear >= 2006 && !game.osUpdate2006Announced) {
        game.osUpdate2006Announced = true;
        game.createIndustryEvent?.('os_launch_2006');
    }
    game.notify?.();
    return { success: true, message: `Fecha adelantada de ${current} a ${targetYear}. Las semanas intermedias no se han simulado.` };
}
