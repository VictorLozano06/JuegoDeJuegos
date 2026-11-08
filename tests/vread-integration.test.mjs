import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true, ws: false } });
after(() => vite.close());
const { game: template } = await vite.ssrLoadModule('/src/simulation.js');
const { SaveSystem } = await vite.ssrLoadModule('/src/SaveSystem.js');
const { getVreadSalesMultiplier } = await vite.ssrLoadModule('/src/vread-engine.js');
function newGame() { return new template.constructor(); }
function addTitle(game) {
    const title = { id: 'test-game', name: 'Luz Solar', score: 7, businessModel: 'premium', weeksOnMarket: 0, maxWeeks: 12, decayRate: .8, salesPotential: 41000, unitsSoldTotal: 0, revenueTotal: 0, devCost: 0, lifetimeServiceCosts: 0, basePrice: 10, referencePrice: 10, royaltyRate: 0, platformRoyaltyRate: 0 };
    game.activeSales = [title]; game.gamesHistory = [title];
    game.cycleRivalMarket = () => {};
    game.getIndustrySalesMultiplier = () => 1;
    return title;
}
function storage() { const data = new Map(); return { get length() {return data.size;}, key(i) {return [...data.keys()][i] ?? null;}, getItem(k) {return data.get(k) ?? null;}, setItem(k,v) {data.set(k,String(v));} }; }

test('el efecto de Vread se refleja en unidades, ingresos e historial de ventas', () => {
    const baseline = newGame(), affected = newGame();
    const baseTitle = addTitle(baseline), title = addTitle(affected);
    const result = affected.publishVreadPost('Anunciamos un parche para Luz Solar');
    assert.equal(result.success, true);
    baseline.week = 2; affected.week = 2;
    baseline.processWeeklySales(); affected.processWeeklySales();
    assert.ok(title.unitsSoldLastWeek > baseTitle.unitsSoldLastWeek);
    assert.ok(title.revenueTotal > baseTitle.revenueTotal);
    assert.ok(title.weeklySalesHistory[0].vreadMultiplier > 1);
});

test('las publicaciones y sus efectos sobreviven al guardado y partidas anteriores se migran', () => {
    const game = newGame(); const title = addTitle(game);
    game.publishVreadPost('Los jugadores son idiotas');
    const saves = new SaveSystem(storage());
    saves.save(game, { id: 'social' });
    const loaded = newGame(); saves.load('social', loaded);
    assert.equal(loaded.vreadState.posts[0].text, 'Los jugadores son idiotas');
    assert.equal(loaded.vreadState.reputation, 38);
    assert.ok(getVreadSalesMultiplier(loaded, loaded.activeSales[0], 2) < 1);
    const old = newGame(); delete old.vreadState;
    saves.save(old, { id: 'old-social' });
    const migrated = newGame(); saves.load('old-social', migrated);
    assert.equal(migrated.vreadState.reputation, 50);
    assert.equal(migrated.vreadState.posts.length, 0);
});
