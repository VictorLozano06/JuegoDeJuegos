import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true, ws: false } });
after(() => vite.close());
const { game: template } = await vite.ssrLoadModule('/src/simulation.js');
const { SaveSystem } = await vite.ssrLoadModule('/src/SaveSystem.js');
function storage() { const data = new Map(); return { get length() { return data.size; }, key(i) { return [...data.keys()][i] ?? null; }, getItem(k) { return data.get(k) ?? null; }, setItem(k, v) { data.set(k, String(v)); } }; }

test('Basics está disponible gratis desde el comienzo y permite iniciar un proyecto', () => {
    const game = new template.constructor();
    assert.equal(game.customEngines[0].name, 'Basics');
    const funds = game.funds;
    const result = game.startNewGameProject({ name: 'Primer juego', platformId: 'pc', force: true,
        dagConfig: { pipeline: { id: 'engine_v1', type: 'inhouse' }, selectedNodeIds: [] } });
    assert.equal(result.success, true, result.message);
    assert.equal(game.currentProject.engine.name, 'Basics');
    assert.ok(game.funds <= funds);
});

test('las partidas antiguas recuperan Basics sin perder motores creados', () => {
    const saves = new SaveSystem(storage());
    const old = new template.constructor();
    old.customEngines = [{ id: 'engine_custom', name: 'Mi motor' }];
    saves.save(old, { id: 'legacy' });
    const loaded = new template.constructor();
    saves.load('legacy', loaded);
    assert.deepEqual(loaded.customEngines.map(engine => engine.name), ['Basics', 'Mi motor']);
    saves.save(loaded, { id: 'again' });
    saves.load('again', loaded);
    assert.equal(loaded.customEngines.filter(engine => engine.id === 'engine_v1').length, 1);
});

test('el antiguo motor inicial conserva su identificador y se llama Basics', () => {
    const saves = new SaveSystem(storage());
    const old = new template.constructor();
    old.customEngines[0].name = 'Starter Voxel Engine';
    saves.save(old, { id: 'legacy-name' });
    const loaded = new template.constructor();
    saves.load('legacy-name', loaded);
    assert.equal(loaded.customEngines[0].id, 'engine_v1');
    assert.equal(loaded.customEngines[0].name, 'Basics');
});
