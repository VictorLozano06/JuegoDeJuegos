/** Gala anual: nominaciones reproducibles y recompensas aplicadas una sola vez. */
export const AWARD_CATEGORIES = [
    { id: 'goty', name: 'Juego del Año', fans: 5000, reputation: 8, rp: 100, multiplier: 3, weeks: 6 },
    { id: 'graphics', name: 'Mejor Apartado Gráfico', fans: 2500, reputation: 4, rp: 60, multiplier: 2, weeks: 4 },
    { id: 'audio', name: 'Mejor Banda Sonora / Audio', fans: 2500, reputation: 4, rp: 60, multiplier: 2, weeks: 4 },
    { id: 'narrative', name: 'Mejor Narrativa / Guion', fans: 2500, reputation: 4, rp: 60, multiplier: 2, weeks: 4 },
    { id: 'debut', name: 'Estudio Revelación / Mejor Debut Indie', fans: 3000, reputation: 5, rp: 75, multiplier: 2, weeks: 4 }
];

const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const currentWeek = game => typeof game.getIndustryWeek === 'function' ? game.getIndustryWeek() : (number(game.year) - 1) * 48 + (number(game.month) - 1) * 4 + number(game.week);
const currentYear = game => typeof game.getHistoricalYear === 'function' ? game.getHistoricalYear() : 1981 + number(game.year);

function isRecent(title, game, year, week) {
    if (Number.isFinite(title.releaseIndustryWeek)) {
        const age = week - title.releaseIndustryWeek;
        return age >= 0 && age < 48;
    }
    // Las partidas antiguas no guardaban la semana de lanzamiento.
    return title.releaseYear === year || (title.releaseYear == null && number(title.weeksOnMarket) < 48);
}

function candidate(title, studio, isPlayer, smallStudio) {
    const technologies = [...(title.historicalTechIds || []), ...(title.scopeNodeIds || []), ...(title.technologies || [])].join(' ').toLowerCase();
    const work = title.production?.work || {};
    return {
        id: title.id, name: title.name || 'Sin título', studio, isPlayer,
        score: number(title.score || title.pressScore), sales: number(title.unitsSoldTotal),
        tech: number(title.techPoints), graphics: number(work.graphics), audio: number(work.sound),
        narrative: number(work.story) + number(work.dialogues), technologies, smallStudio
    };
}

function fallbackCandidates(year) {
    const era = year < 1995 ? ['Pixel', 'Arcade', 'Turbo', 'Quest', 'Space', 'Digital'] : year < 2010 ? ['Cyber', 'Shadow', 'Crystal', 'Nova', 'Infinity', 'Virtual'] : ['Quantum', 'Horizon', 'Echo', 'Neon', 'Eclipse', 'Beyond'];
    const studios = ['Aurora Interactive', 'Atlas Games', 'Northern Pixel', 'Estudio Prisma', 'Silver Arcade', 'Luna Digital'];
    const suffix = ['Odyssey', 'Legends', 'World', 'Chronicles', 'Adventure', 'Dreams'];
    return studios.map((studio, i) => ({
        id: `gala-${year}-${i}`, name: `${era[(i + year) % era.length]} ${suffix[i]}`, studio, isPlayer: false,
        score: 8.9 + ((year + i * 3) % 10) / 10, sales: 3000 + ((year * (i + 5)) % 20000),
        tech: 25 + i * 8, graphics: 7 + (i * 5 % 18), audio: 6 + (i * 7 % 19),
        narrative: 6 + (i * 11 % 20), technologies: i % 2 ? 'graphics audio' : 'story dialogue', smallStudio: i < 4
    }));
}

function ranking(c, id) {
    const sales = Math.log10(1 + Math.max(0, c.sales));
    const work = value => Math.log1p(Math.max(0, value));
    const techMatches = pattern => (c.technologies.match(pattern) || []).length;
    switch (id) {
        case 'goty': return c.score * 10 + sales * 3;
        case 'graphics': return c.score * 5 + work(c.graphics) * 7 + work(c.tech) * 2 + techMatches(/graphics|ray.?trac|pbr|3d/g) * 3;
        case 'audio': return c.score * 5 + work(c.audio) * 9 + techMatches(/audio|sound|music|orchestral/g) * 4;
        case 'narrative': return c.score * 5 + work(c.narrative) * 7 + techMatches(/story|dialog|narrativ|quest/g) * 4;
        case 'debut': return c.score * 8 + sales * 2;
        default: return 0;
    }
}

/** Construye la gala sin modificar el estado de la partida. */
export function createAnnualCeremony(game, { includeFallbacks = true } = {}) {
    const year = currentYear(game), week = currentWeek(game);
    const titles = (game.gamesHistory || []).filter(title => isRecent(title, game, year, week))
        .map(title => candidate(title, game.companyName || 'Tu estudio', true,
            number(title.officeTierAtRelease ?? game.getActiveOffice?.()?.tier ?? game.era) <= 1 || number(title.studioAgeYears ?? game.year) <= 1));
    for (const company of game.ipCompanies || []) {
        for (const title of company.games || []) {
            if (isRecent(title, game, year, week)) titles.push(candidate(title, company.name || company.legalName || 'Estudio rival', false,
                (company.employees || []).length <= 4 || year - number(company.foundedYear) <= 1));
        }
    }
    const fallbacks = includeFallbacks ? fallbackCandidates(year) : [];
    const categories = AWARD_CATEGORIES.map(category => {
        const eligible = c => category.id === 'goty' ? c.score > 8.8 && c.sales >= 500 : category.id === 'debut' ? c.smallStudio && c.score > 8 : c.score > 0;
        const pool = titles.filter(eligible);
        // Se añaden competidores de relleno solo si los lanzamientos reales no alcanzan cuatro.
        for (const rival of fallbacks.filter(eligible)) {
            if (pool.length >= 4) break;
            pool.push(rival);
        }
        const nominees = pool.sort((a, b) => ranking(b, category.id) - ranking(a, category.id) || String(a.id).localeCompare(String(b.id))).slice(0, 4);
        const winner = nominees[0];
        // No colocar siempre la tarjeta ganadora en primer lugar.
        const rotation = nominees.length ? (year + AWARD_CATEGORIES.indexOf(category)) % nominees.length : 0;
        nominees.push(...nominees.splice(0, rotation));
        const reward = winner?.isPlayer ? { fans: category.fans, reputation: category.reputation, rp: category.rp, studioValue: category.reputation * 10000, salesMultiplier: category.multiplier, salesWeeks: category.weeks } : null;
        return { id: category.id, name: category.name, nominees, winner, reward };
    });
    const rewards = categories.filter(c => c.reward).map(c => c.reward);
    return { year, categories, summary: { wins: rewards.length, fans: rewards.reduce((n, r) => n + r.fans, 0), reputation: rewards.reduce((n, r) => n + r.reputation, 0), rp: rewards.reduce((n, r) => n + r.rp, 0), studioValue: rewards.reduce((n, r) => n + r.studioValue, 0) } };
}

/** Idempotente, también después de guardar y cargar durante la ceremonia. */
export function applyAnnualAwards(game, ceremony) {
    if (!Array.isArray(game.awardsWon)) game.awardsWon = [];
    for (const category of ceremony.categories || []) {
        if (!category.winner?.isPlayer || !category.reward || game.awardsWon.some(a => a.year === ceremony.year && a.categoryId === category.id)) continue;
        const reward = category.reward;
        game.awardsWon.push({ year: ceremony.year, categoryId: category.id, categoryName: category.name, gameId: category.winner.id, gameName: category.winner.name });
        game.fans = number(game.fans) + reward.fans;
        game.researchPoints = number(game.researchPoints) + reward.rp;
        game.awardsPrestige = number(game.awardsPrestige) + reward.reputation;
        game.awardsStudioValue = number(game.awardsStudioValue) + number(reward.studioValue);
        if (game.vreadState) game.vreadState.reputation = Math.min(100, number(game.vreadState.reputation) + reward.reputation);
        if (game.reputation != null) game.reputation = Math.min(100, number(game.reputation) + reward.reputation);
        const title = (game.activeSales || []).find(item => item.id === category.winner.id);
        if (title) {
            const previous = title.awardsSalesBoost || {};
            title.awardsSalesBoost = { multiplier: Math.max(number(previous.multiplier), reward.salesMultiplier), weeksRemaining: Math.max(number(previous.weeksRemaining), reward.salesWeeks) };
        }
    }
    return ceremony;
}
