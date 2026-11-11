import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAnnualCeremony, applyAnnualAwards } from '../src/AnnualAwardsSystem.js';

const studio = () => ({ year: 2, era: 1, companyName: 'Mi estudio', fans: 10, researchPoints: 30,
    vreadState: { reputation: 50 }, gamesHistory: [], activeSales: [], ipCompanies: [],
    getHistoricalYear: () => 1983, getIndustryWeek: () => 96 });

test('la gala sucede sin juegos del jugador y anuncia cuatro nominados', () => {
    const ceremony = createAnnualCeremony(studio());
    assert.equal(ceremony.categories.length, 5);
    for (const category of ceremony.categories) {
        assert.equal(category.nominees.length, 4);
        assert.ok(category.nominees.includes(category.winner));
        assert.equal(category.winner.isPlayer, false);
    }
});

test('ventana de 48 semanas y umbrales de GOTY y debut', () => {
    const game = studio();
    game.gamesHistory = [
        { id: 'old', name: 'Antiguo', score: 10, unitsSoldTotal: 90000, releaseIndustryWeek: 48 },
        { id: 'low', name: 'Aceptable', score: 8, unitsSoldTotal: 90000, releaseIndustryWeek: 49 },
        { id: 'hit', name: 'Éxito', score: 9.9, unitsSoldTotal: 900000, releaseIndustryWeek: 49 }
    ];
    const ceremony = createAnnualCeremony(game);
    assert.equal(ceremony.categories[0].winner.id, 'hit');
    for (const category of ceremony.categories) assert.ok(!category.nominees.some(c => c.id === 'old'));
    assert.ok(!ceremony.categories.find(c => c.id === 'debut').nominees.some(c => c.id === 'low'));
});

test('las recompensas son persistentes, idempotentes y el impulso solo afecta a ventas activas', () => {
    const game = studio();
    const title = { id: 'hit', name: 'Éxito', score: 10, unitsSoldTotal: 10000000, releaseIndustryWeek: 96, techPoints: 100000, production: { work: { graphics: 100000, sound: 100000, story: 100000 } } };
    game.gamesHistory.push(title); game.activeSales.push(title);
    const ceremony = createAnnualCeremony(game);
    applyAnnualAwards(game, ceremony);
    assert.ok(game.awardsWon.length > 0);
    assert.equal(game.fans, 10 + ceremony.summary.fans);
    assert.equal(game.researchPoints, 30 + ceremony.summary.rp);
    assert.equal(title.awardsSalesBoost.multiplier, 3);
    assert.equal(title.awardsSalesBoost.weeksRemaining, 6);
    const snapshot = JSON.stringify(game);
    applyAnnualAwards(game, ceremony);
    assert.equal(JSON.stringify(game), snapshot);
});
