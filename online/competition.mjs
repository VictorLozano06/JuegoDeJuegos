import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createAnnualCeremony } from '../src/AnnualAwardsSystem.js';

const number = (value, max = Number.MAX_SAFE_INTEGER) => Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : 0;
const label = (value, length) => typeof value === 'string' ? value.trim().slice(0, length) : '';

export function createCompetition() {
    return { mode: 'competitive', week: 1, speed: 0, scores: new Map(), members: new Map(), messages: [], ceremonies: [], gala: null };
}

export function readCompetition(file) {
    try {
        const saved = JSON.parse(readFileSync(file, 'utf8'));
        return { ...createCompetition(), ...saved, speed: 0, scores: new Map(saved.scores), members: new Map(saved.members) };
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        return null;
    }
}

export function saveCompetition(file, match) {
    mkdirSync(dirname(file), { recursive: true });
    const temp = file + '.tmp';
    writeFileSync(temp, JSON.stringify({ ...match, scores: [...match.scores], members: [...match.members] }), { mode: 0o600 });
    renameSync(temp, file);
}

export function reportScore(match, player, input) {
    const titles = Array.isArray(input.titles) ? input.titles.slice(0, 100).flatMap(title => {
        if (!title || typeof title !== 'object' || !label(title.id, 80) || !label(title.name, 80)) return [];
        return [{
            id: label(title.id, 80), name: label(title.name, 80), score: number(title.score, 10),
            unitsSoldTotal: number(title.unitsSoldTotal), releaseIndustryWeek: number(title.releaseIndustryWeek),
            officeTierAtRelease: number(title.officeTierAtRelease, 4),
            techPoints: number(title.techPoints), production: { work: {
                graphics: number(title.graphics), sound: number(title.sound), story: number(title.narrative)
            } }
        }];
    }) : [];
    match.scores.set(player.seat, {
        seat: player.seat, player: player.name, studio: label(input.studio, 48),
        funds: input.funds, releases: input.releases, fans: number(input.fans), sales: number(input.sales),
        rating: number(input.rating, 10), titles
    });
}

export function ranking(match) {
    return [...match.scores.values()].map(score => {
        const awards = match.ceremonies.reduce((n, gala) => n + gala.categories.filter(category => category.winner?.seat === score.seat).length, 0);
        const points = Math.round(score.rating * 10 + Math.log10(1 + score.sales) * 12 +
            Math.log10(1 + score.fans) * 8 + Math.log10(1 + Math.max(0, score.funds)) * 3 + awards * 15);
        return { ...score, awards, points };
    }).sort((a, b) => b.points - a.points || b.rating - a.rating || b.sales - a.sales || a.seat.localeCompare(b.seat));
}

export function openCompetitionGala(match) {
    const studios = [...match.scores.values()];
    const year = 1982 + Math.floor((match.week - 1) / 48);
    const entries = new Map();
    const ceremony = createAnnualCeremony({
        getHistoricalYear: () => year, getIndustryWeek: () => match.week,
        ipCompanies: studios.map(studio => ({
            name: studio.studio, employees: [],
            games: studio.titles.map(title => {
                const id = studio.seat + ':' + title.id;
                entries.set(id, { seat: studio.seat, gameId: title.id });
                return { ...title, id };
            })
        }))
    }, { includeFallbacks: false });
    ceremony.categories = ceremony.categories.filter(category => category.nominees.length).map(category => ({
        ...category, nominees: category.nominees.map(nominee => ({ ...nominee, ...entries.get(nominee.id) })),
        winner: { ...category.winner, ...entries.get(category.winner.id) }
    }));
    if (ceremony.categories.length) match.gala = { ...ceremony, step: 0 };
}

export function visibleGala(gala) {
    if (!gala) return null;
    return {
        year: gala.year, step: gala.step,
        categories: gala.categories.map(({ winner, ...category }, index) => ({
            ...category, ...(gala.step > index * 2 ? { winner } : {})
        }))
    };
}
