import assert from 'node:assert/strict';
import { test } from 'node:test';
import { game } from '../src/simulation.js';
import { SaveSystem } from '../src/SaveSystem.js';
import { startPortProject } from '../src/PortingPipeline.js';

class Store {
    constructor() { this.data = new Map(); }
    get length() { return this.data.size; }
    key(i) { return [...this.data.keys()][i] ?? null; }
    getItem(k) { return this.data.get(k) ?? null; }
    setItem(k, v) { this.data.set(k, String(v)); }
    removeItem(k) { this.data.delete(k); }
}

test('un port guardado continúa en el calendario y genera ingresos al publicarse', () => {
    const studio = new game.constructor();
    studio.funds = 1000000; studio.isPaused = false; studio.month = 4; studio.week = 2;
    studio.ownedDevKits = ['pc', 'g64'];
    studio.gamesHistory = [{ id: 'original', name: 'Juego', score: 8, releaseYear: 1982, releaseIndustryWeek: 1,
        platformId: 'pc', platformIds: ['pc'], devCost: 10000, salesPotential: 10000,
        launchMarketShare: .1, basePrice: 20, revenueTotal: 0, unitsSoldTotal: 0, profit: -10000 }];
    const started = startPortProject(studio, 'original', 'g64', studio.employees[0].id);
    assert.equal(started.success, true);
    const saves = new SaveSystem(new Store());
    saves.save(studio, { id: 'port' });
    const loaded = new game.constructor();
    saves.load('port', loaded); loaded.isPaused = false;
    assert.equal(loaded.portProjects.length, 1);
    for (let i = 0; i < started.project.totalWeeks + 1; i++) loaded.advanceCalendar();
    assert.equal(loaded.portProjects.length, 0);
    assert.equal(loaded.gamesHistory[0].ports.length, 1);
    assert.ok(loaded.gamesHistory[0].ports[0].unitsSoldTotal > 0);
    assert.equal(loaded.gamesHistory[0].portDevelopmentCosts, 2000);
});
