import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { createServer } from 'vite';
const vite = await createServer({ server: { middlewareMode: true, ws: false } });
after(() => vite.close());
const { game: template } = await vite.ssrLoadModule('/src/simulation.js');
const { generateVreadFeed } = await vite.ssrLoadModule('/src/vread-engine.js');
function release(price, businessModel = 'premium') {
    const sim = new template.constructor();
    const result = sim.startNewGameProject({ name: 'Proyecto Precio', platformId: 'pc', force: true,
        dagConfig: { pipeline: { id: 'engine_v1', type: 'inhouse' }, selectedNodeIds: [] } });
    assert.equal(result.success, true, result.message);
    const project = sim.currentProject;
    project.stage = 4; project.overallProgress = 100; project.techPoints = 60; project.designPoints = 60; project.bugs = 0;
    project.launchPrice = price; project.businessModel = businessModel;
    const previous = Math.random; Math.random = () => 0.5;
    try { return { sim, title: sim.finishAndReleaseGame() }; } finally { Math.random = previous; }
}
test('el precio escogido afecta al potencial, al ingreso unitario y a las reacciones', () => {
    const cheap = release(8); const expensive = release(60);
    assert.equal(cheap.title.basePrice, 8); assert.equal(expensive.title.basePrice, 60);
    assert.ok(cheap.title.pricing.isBargain); assert.ok(expensive.title.pricing.isOverpriced);
    assert.ok(cheap.title.salesPotential > expensive.title.salesPotential);
    assert.ok(cheap.sim.fans > expensive.sim.fans);
    assert.equal(cheap.sim.vreadState.reputation, 51);
    assert.equal(expensive.sim.vreadState.reputation, 48);
    assert.ok(expensive.title.socialFeed.some(post => post.author === '@PrecioJusto'));
    assert.ok(expensive.title.marketingFeed.some(post => post.kind === 'price_reaction'));
    assert.ok(generateVreadFeed(expensive.sim, () => 0.5).some(post => post.handle === 'preciojusto'));
});
test('el juego gratuito conserva precio cero y no aplica elasticidad premium', () => {
    const { title } = release(60, 'f2p');
    assert.equal(title.basePrice, 0); assert.equal(title.pricing, null);
});
test('un precio inválido no publica ni modifica fondos', () => {
    const sim = new template.constructor(); const started = sim.startNewGameProject({ name: 'Inválido', platformId: 'pc', force: true });
    assert.equal(started.success, true); sim.currentProject.launchPrice = 1000;
    const funds = sim.funds; assert.equal(sim.finishAndReleaseGame(), null);
    assert.equal(sim.funds, funds); assert.equal(sim.gamesHistory.length, 0); assert.ok(sim.currentProject);
});
