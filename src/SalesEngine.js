// Reglas puras para promociones; el estado vive en cada juego y se guarda con él.
export const DISCOUNT_DURATION_WEEKS = 2;
export const DISCOUNT_MAX_DURATION_WEEKS = 8;
export const DISCOUNT_COOLDOWN_WEEKS = 5;

export function discountVolumeMultiplier(percent, previousCampaigns = 0) {
    const points = [[10, 1.3], [20, 1.3], [30, 1.8], [50, 2.5], [60, 4], [75, 4]];
    const amount = Math.max(10, Math.min(75, Number(percent) || 10));
    let multiplier = points[points.length - 1][1];
    for (let i = 1; i < points.length; i++) {
        if (amount <= points[i][0]) {
            const [x0, y0] = points[i - 1], [x1, y1] = points[i];
            multiplier = y0 + (y1 - y0) * ((amount - x0) / (x1 - x0));
            break;
        }
    }
    // La saturación reduce solo el incremento, nunca convierte una oferta en penalización.
    return 1 + (multiplier - 1) * Math.max(0.35, Math.pow(0.85, Math.max(0, previousCampaigns)));
}

export function discountStatus(game) {
    if (!game || game.retired || game.status === 'RETIRED' || game.serversClosed) return { success: false, eligible: false, reason: 'Este juego no está a la venta.' };
    const history = Array.isArray(game.weeklySalesHistory) ? game.weeklySalesHistory : [];
    const initialSales = history.filter(entry => entry.weekNumber <= 4 && !entry.discountPercent).map(entry => Math.max(0, Number(entry.unitsSold) || 0));
    const peakSales = Math.max(0, Number(game.initialPeakSales) || 0, ...initialSales);
    const lastSales = Math.max(0, Number(game.unitsSoldLastWeek) || 0);
    const active = game.discountCampaign || null;
    const cooldownWeeks = Math.max(0, Number(game.discountCooldownWeeks) || 0);
    const engineRate = Math.max(0, Math.min(1, Number(game.royaltyRate) || 0));
    const platformRate = Math.max(0, Math.min(1 - engineRate, Number(game.platformRoyaltyRate) || 0));
    const publisherRate = Math.max(0, Math.min(1 - engineRate - platformRate, (Number(game.publisherRevenueShare) || 0) + (Number(game.subscriptionRevenueShare) || 0)));
    const netPriceFactor = 1 - engineRate - platformRate - publisherRate;
    let reason = '';
    if (['f2p', 'live_service'].includes(game.businessModel) || !(Number(game.basePrice) > 0)) reason = 'Los juegos gratuitos no admiten descuentos sobre el precio.';
    else if (game.businessModel === 'early_access' && !game.officialReleased) reason = 'La oferta estará disponible tras el lanzamiento oficial.';
    else if (active) reason = 'Ya hay una oferta activa.';
    else if (cooldownWeeks > 0) reason = `Espera ${cooldownWeeks} semana(s) antes de iniciar otra oferta.`;
    else if ((Number(game.weeksOnMarket) || 0) < 2 || peakSales <= 0) reason = 'Necesitas al menos dos semanas de ventas para medir el descenso.';
    else if (lastSales >= peakSales * 0.2) reason = 'Disponible cuando las ventas semanales bajen del 20 % del pico inicial.';
    return { success: true, eligible: !reason, reason, peakSales, lastSales, active, cooldownWeeks, netPriceFactor };
}

export function beginDiscountCampaign(game, percent, durationWeeks = DISCOUNT_DURATION_WEEKS) {
    const status = discountStatus(game);
    if (!status.eligible) return { success: false, message: status.reason };
    const amount = Number(percent);
    if (!Number.isInteger(amount) || amount < 10 || amount > 75) return { success: false, message: 'El descuento debe estar entre el 10 % y el 75 %.' };
    const duration = Number(durationWeeks);
    if (!Number.isInteger(duration) || duration < 1 || duration > DISCOUNT_MAX_DURATION_WEEKS) return { success: false, message: `Elige una duración de 1 a ${DISCOUNT_MAX_DURATION_WEEKS} semanas.` };
    const previous = Math.max(0, Number(game.discountCampaignCount) || 0);
    game.discountCampaign = { percent: amount, weeksRemaining: duration, durationWeeks: duration, multiplier: discountVolumeMultiplier(amount, previous) };
    game.discountCampaignCount = previous + 1;
    return { success: true, message: `Oferta del ${amount} % iniciada durante ${duration} ${duration === 1 ? 'semana' : 'semanas'}.`, campaign: game.discountCampaign };
}
