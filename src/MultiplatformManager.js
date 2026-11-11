/** Costes y requisitos compartidos entre la preproducción y la simulación. */
export const ADAPTATION_COST_PER_PLATFORM = 3000;

export function getMultiplatformQuote(game, platformIds = [], engine = null, selectedNodeIds = []) {
    const ids = [...new Set(platformIds.filter(Boolean))];
    const platforms = ids.map(id => game.getPlatformById(id));
    const year = game.getHistoricalYear();
    const invalid = ids.find((id, i) => !platforms[i] || platforms[i].status === 'RETIRED' ||
        (platforms[i].releaseYear != null && year < platforms[i].releaseYear) ||
        (platforms[i].retireYear != null && year >= platforms[i].retireYear));
    const missingDevKits = ids.slice(1).filter(id => !(game.ownedDevKits || []).includes(id));
    const secondaryCount = Math.max(0, ids.length - 1);
    const tech = [engine?.name, ...(engine?.features || []), ...(engine?.bakedNodes || []),
        ...(engine?.historicalTechIds || []), ...selectedNodeIds].map(v => typeof v === 'object' ? `${v.id || ''} ${v.name || ''}` : String(v || '')).join(' ');
    const compatible = /cross.?play|cross.?platform|multiplatform|multiplataforma|compatib/i.test(tech) || !!engine?.crossPlatform;
    const senior = (game.employees || []).some(e => /program|engine|ingenier|optimiz|desarroll/i.test(e.role || '') &&
        (['Senior', 'Lead'].includes(e.experience) || /senior|lead/i.test(e.role || '')));
    return {
        ids, platforms, invalid, missingDevKits, secondaryCount,
        adaptationCost: secondaryCount * ADAPTATION_COST_PER_PLATFORM,
        leadDevKitCost: platforms[0] ? game.getDevKitCost(platforms[0]) : 0,
        timeMultiplier: 1 + 0.15 * secondaryCount,
        additionalDebt: compatible ? 0 : secondaryCount * (senior ? 10 : 15),
        compatible, senior
    };
}
