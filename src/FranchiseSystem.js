/** Reglas de franquicias sobre el registro de IP existente; no guarda una segunda copia de la saga. */
const value = n => Number.isFinite(Number(n)) ? Number(n) : 0;
const typeOf = project => project.ipInstallmentType || project.ipReleaseType || 'original';
const weekOf = game => game.getIndustryWeek();
const releaseWeek = (game, title) => Number.isFinite(title.releaseIndustryWeek)
    ? title.releaseIndustryWeek
    : Number.isFinite(title.weeksOnMarket) ? weekOf(game) - title.weeksOnMarket
    : Number.isFinite(title.releaseYear) ? (title.releaseYear - 1982) * 48 + 1 : null;

export function franchiseTitles(game, ip) {
    const ids = new Set(ip?.publishedGameIds || []);
    return [...(game.gamesHistory || []), ...(game.ipCompanies || []).flatMap(company => company.games || [])].filter(title => ids.has(title.id));
}

export function getFranchiseStatus(game, ip) {
    const titles = franchiseTitles(game, ip);
    const dated = titles.map(title => ({ title, week: releaseWeek(game, title) }))
        .filter(item => item.week !== null).sort((a, b) => b.week - a.week);
    const previous = dated[0]?.title || null;
    const weeksSince = previous ? Math.max(0, weekOf(game) - dated[0].week) : null;
    return {
        previous, weeksSince, count: ip?.publishedGameIds?.length || 0,
        fans: titles.reduce((sum, title) => sum + value(title.franchiseFansGained), 0),
        status: weeksSince === null ? 'sin estrenar' : weeksSince < 40 ? 'saturado' : weeksSince < 60 ? 'descansando' : 'listo',
        lastReleaseWeek: dated[0]?.week ?? null
    };
}

export function validateFranchiseRegistration(original) {
    if (!original || original.ipId || value(original.score ?? original.pressScore) < 7.5)
        return { success: false, message: 'Para registrar una franquicia, selecciona un juego original sin franquicia con nota mínima de 7,5.' };
    return { success: true };
}

export function validateFranchiseProject(game, config) {
    if (!config.ipId) return { success: true };
    const ip = game.ipState?.properties?.find(item => item.id === config.ipId && item.ownerId === 'player');
    if (!ip) return { success: false, message: 'La franquicia seleccionada no pertenece al estudio.' };
    if (typeOf(config) === 'original') return { success: false, message: 'Selecciona el tipo de entrega de la franquicia.' };
    if (['remake', 'remaster'].includes(typeOf(config))) {
        const original = franchiseTitles(game, ip).find(t => (t.ipReleaseType || t.ipInstallmentType) === 'original') || franchiseTitles(game, ip).at(-1);
        const originalWeek = original && releaseWeek(game, original);
        if (originalWeek == null || weekOf(game) - originalWeek < 8 * 48)
            return { success: false, message: 'Los remakes y remasterizaciones requieren un juego original de al menos 8 años.' };
    }
    return { success: true };
}

/** Snapshot estable de tecnologías realmente incluidas en el motor y el juego. */
export function franchiseTechnologyIds(project) {
    const engine = project.engineObj || project.engine || {};
    return [...new Set([
        ...(project.historicalTechIds || []), ...(project.scopeNodeIds || []),
        ...(project.scopeDAG?.getActiveNodes?.().map(node => node.id) || []),
        ...(engine.historicalTechIds || []), ...(engine.bakedNodes || []), ...(engine.features || [])
    ].map(item => typeof item === 'string' ? item : item?.id).filter(Boolean))];
}

export function evaluateFranchiseRelease(game, project) {
    const ip = game.ipState?.properties?.find(item => item.id === project.ipId);
    const kind = typeOf(project);
    if (!ip || kind === 'original') return { salesMultiplier: 1, firstWeekMultiplier: 1, reviewPenalty: 0, messages: [], newTechnologies: 0 };
    const status = getFranchiseStatus(game, ip);
    const gap = status.weeksSince;
    const prior = status.previous;
    const previousTech = new Set(prior?.franchiseTechnologyIds || franchiseTechnologyIds(prior || {}));
    const newTechnologies = franchiseTechnologyIds(project).filter(id => !previousTech.has(id)).length;
    const saturated = gap !== null && gap < 40;
    const ready = gap !== null && gap >= 60 && gap <= 120;
    const reviewPenalty = kind === 'sequel' && prior && newTechnologies < 2 ? 1 : 0;
    const messages = [];
    if (saturated) messages.push('Lanzar otra entrega tan pronto huele a explotación comercial.');
    if (reviewPenalty) messages.push('Pocas novedades visuales y jugables, parece una simple expansión.');
    return { weeksSince: gap, saturated, salesMultiplier: saturated ? 0.6 : 1,
        firstWeekMultiplier: ready ? 1.3 : 1, reviewPenalty, newTechnologies, messages };
}
