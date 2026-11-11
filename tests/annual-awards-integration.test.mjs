import assert from 'node:assert/strict';
import { test } from 'node:test';
import { game } from '../src/simulation.js';
import { SaveSystem } from '../src/SaveSystem.js';

class Store {
    constructor() { this.data = new Map(); }
    get length() { return this.data.size; }
    key(i) { return [...this.data.keys()][i] ?? null; }
    getItem(k) { return this.data.get(k) ?? null; }
    setItem(k, v) { this.data.set(k, String(v)); }
    removeItem(k) { this.data.delete(k); }
}

test('la semana 48 pausa una sola gala y permite recuperarla al cargar', () => {
    const studio = new game.constructor();
    studio.isPaused = false;
    studio.month = 12;
    studio.week = 3;
    studio.funds = 1000000;
    let calls = 0;
    studio.onAnnualAwards = () => calls++;
    studio.advanceCalendar();
    assert.equal(calls, 1);
    assert.equal(studio.week, 4);
    assert.equal(studio.isPaused, true);
    assert.equal(studio.pendingAnnualCeremony.categories.length, 5);
    studio.advanceCalendar();
    assert.equal(calls, 1);
    const saves = new SaveSystem(new Store());
    saves.save(studio, { id: 'gala' });
    const loaded = new game.constructor();
    saves.load('gala', loaded);
    assert.equal(loaded.pendingAnnualCeremony.year, studio.pendingAnnualCeremony.year);
    assert.equal(loaded.lastAnnualAwardsYear, studio.lastAnnualAwardsYear);
});

test('el efecto de gala multiplica las ventas durante el número de semanas indicado', () => {
    const studio = new game.constructor();
    studio.isPaused = false;
    studio.funds = 1000000;
    const result = studio.startNewGameProject({ name: 'Prueba', platformId: 'pc', genreId: 'action', topicId: 'medieval' });
    assert.equal(result.success, true);
    for (let i = 0; i < 200 && studio.currentProject.stage < 4; i++) studio.advanceCalendar();
    const title = studio.finishAndReleaseGame();
    const saves = new SaveSystem(new Store());
    saves.save(studio, { id: 'ventas' });
    const baseline = new game.constructor();
    saves.load('ventas', baseline);
    title.awardsSalesBoost = { multiplier: 2, weeksRemaining: 4 };
    const oldRandom = Math.random;
    Math.random = () => 0.5;
    try {
        studio.processWeeklySales();
        baseline.processWeeklySales();
        assert.equal(title.unitsSoldLastWeek, baseline.activeSales[0].unitsSoldLastWeek * 2);
        assert.equal(title.awardsSalesBoost.weeksRemaining, 3);
        for (let i = 0; i < 3; i++) studio.processWeeklySales();
        assert.equal(title.awardsSalesBoost.weeksRemaining, 0);
    } finally { Math.random = oldRandom; }
});
