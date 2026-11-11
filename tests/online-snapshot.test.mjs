import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true, ws: false } });
after(() => vite.close());
const { game: template } = await vite.ssrLoadModule('/src/simulation.js');
const { SaveSystem } = await vite.ssrLoadModule('/src/SaveSystem.js');

test('el estado transferido conserva datos de la partida y rechaza versiones incompatibles', () => {
    const saves = new SaveSystem();
    const host = new template.constructor();
    host.companyName = 'Estudio compartido';
    host.funds = 123456;
    const receiver = new template.constructor();
    const snapshot = JSON.parse(JSON.stringify(saves.exportSnapshot(host)));
    saves.importSnapshot(snapshot, receiver);
    assert.equal(receiver.companyName, host.companyName);
    assert.equal(receiver.funds, host.funds);
    assert.ok(receiver.techTreeManager.unlockedTechs instanceof Set);
    assert.throws(() => saves.importSnapshot({ ...snapshot, version: 999 }, receiver));
    assert.equal(receiver.funds, host.funds);
});
