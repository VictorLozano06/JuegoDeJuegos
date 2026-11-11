/**
 * Precio y demanda para lanzamientos premium. No modifica el proyecto: quien
 * publica guarda el resultado y aplica `multiplier` una sola vez al potencial.
 * Los importes se expresan en la moneda del juego, por copia.
 */
export const PRICE_LIMITS = Object.freeze({ min: 5, max: 70 });

const TIERS = Object.freeze({
    indie: Object.freeze({ label: 'Indie / Garaje', recommendedMin: 10, recommendedMax: 20, base: 15, psychologicalLimit: 25, alpha: 0.85 }),
    medium: Object.freeze({ label: 'Mediano', recommendedMin: 25, recommendedMax: 40, base: 32.5, psychologicalLimit: 45, alpha: 0.7 }),
    aaa: Object.freeze({ label: 'Grande / AAA', recommendedMin: 50, recommendedMax: 70, base: 60, psychologicalLimit: 70, alpha: 0.6 })
});

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const finiteOr = (value, fallback) => value == null || !Number.isFinite(Number(value)) ? fallback : Number(value);

function countTechnologies(project) {
    const historical = Array.isArray(project?.historicalTechIds) ? project.historicalTechIds : [];
    const engine = project?.engineObj || project?.engine || {};
    const parts = Array.isArray(engine.features) ? engine.features : Array.isArray(engine.parts) ? engine.parts : Array.isArray(engine.selectedParts) ? engine.selectedParts : [];
    // Legacy saves may contain a ScopeDAG; its ids are still valid scope evidence.
    const scoped = project?.scopeDAG?.selectedNodeIds;
    const ids = [...historical, ...parts.map(item => typeof item === 'string' ? item : item?.id), ...(scoped && typeof scoped[Symbol.iterator] === 'function' ? scoped : [])];
    return new Set(ids.filter(Boolean)).size;
}

/** Deriva la envergadura a partir del equipo, sede y tecnologías del proyecto. */
export function getPricingContext({ project = {}, employeeCount = 1, officeTier = 1, reputation = 50, reviewScore = 7, technologyCount } = {}) {
    const team = Math.max(1, Math.floor(finiteOr(employeeCount, 1)));
    const office = Math.max(1, Math.floor(finiteOr(officeTier, 1)));
    const technologies = Math.max(0, Math.floor(finiteOr(technologyCount, countTechnologies(project))));
    const score = clamp(finiteOr(reviewScore, 7), 1, 10);
    const studioReputation = clamp(finiteOr(reputation, 50), 0, 100);
    // An empty campus alone must never make a one-person project AAA.
    const tier = team >= 6 && office >= 3 && technologies >= 5 ? 'aaa'
        : team >= 3 || (team >= 2 && office >= 2 && technologies >= 2) ? 'medium' : 'indie';
    const config = TIERS[tier];
    const reputationAdjustment = (studioReputation - 50) / 500;
    const reviewAdjustment = (score - 7) / 30;
    const expectedPrice = Math.round(clamp(config.base * (1 + reputationAdjustment + reviewAdjustment), config.recommendedMin, config.recommendedMax) * 100) / 100;
    return { tier, label: config.label, recommendedMin: config.recommendedMin, recommendedMax: config.recommendedMax,
        psychologicalLimit: config.psychologicalLimit, expectedPrice, reviewScore: score,
        reputation: studioReputation, employeeCount: team, officeTier: office, technologyCount: technologies };
}

/** El multiplicador incluye el factor de reseña indicado en el diseño. */
export function evaluateLaunchPrice({ price, ...input } = {}) {
    const context = getPricingContext(input);
    const numericPrice = price === '' || price == null ? NaN : Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < PRICE_LIMITS.min || numericPrice > PRICE_LIMITS.max) {
        return { ...context, valid: false, error: `El precio debe estar entre ${PRICE_LIMITS.min} y ${PRICE_LIMITS.max}.` };
    }
    const ratio = numericPrice / context.expectedPrice;
    const exceptional = context.reputation >= 75 && context.reviewScore >= 8.5;
    const psychologicalOverprice = context.tier !== 'aaa' && numericPrice > context.psychologicalLimit && !exceptional;
    const isOverpriced = ratio > 1.3 || psychologicalOverprice;
    const isBargain = ratio < 0.8 && !isOverpriced;
    const qualityFactor = 1 + (context.reviewScore - 7) / 10;
    let multiplier = Math.pow(context.expectedPrice / numericPrice, TIERS[context.tier].alpha) * qualityFactor;
    // Limit the boost to a readable, bounded effect; quality can still affect it.
    if (isBargain) multiplier = clamp(multiplier, 1.25 * qualityFactor, 1.4 * qualityFactor);
    if (isOverpriced) {
        const severe = context.tier === 'indie' && !exceptional;
        multiplier = Math.min(multiplier, severe ? 0.3 : 0.5);
    }
    multiplier = clamp(multiplier, 0.1, 1.8);
    const category = isOverpriced ? 'overpriced' : isBargain ? 'affordable' : 'standard';
    return { ...context, valid: true, price: numericPrice, ratio, multiplier, qualityFactor,
        isOverpriced, isBargain, psychologicalOverprice, category };
}
