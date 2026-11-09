import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import vm from 'node:vm';
import { createServer } from 'vite';

const sandbox = {};
vm.runInNewContext(await readFile(new URL('../public/vendor/three.min.js', import.meta.url), 'utf8'), sandbox);
const { THREE } = sandbox;
globalThis.window = { THREE };
const vite = await createServer({ server: { middlewareMode: true, ws: false } });
const { WorldEngine } = await vite.ssrLoadModule('/src/world.js');
after(async () => { await vite.close(); delete globalThis.window; });

test('la escena espera a que todos los modelos se hayan incorporado', async () => {
    const requests = [];
    THREE.GLTFLoader = class { load(url, success, progress, failure) { requests.push({ url, success, failure }); } };
    const world = Object.assign(Object.create(WorldEngine.prototype), { officeLoadTasks: [] });
    const installed = [];
    world.loadOfficeAsset('/models/a.glb', () => installed.push('a'));
    world.loadOfficeAsset('/models/b.glb', () => installed.push('b'));
    let ready = false;
    const waiting = world.waitForOfficeReady().then(() => { ready = true; });
    requests[0].success({});
    await Promise.resolve();
    assert.equal(ready, false);
    requests[1].success({});
    await waiting;
    assert.deepEqual(installed, ['a', 'b']);
    assert.equal(ready, true);
});

test('un recurso fallido impide mostrar la escena como lista', async () => {
    let fail;
    THREE.GLTFLoader = class { load(url, success, progress, failure) { fail = failure; } };
    const world = Object.assign(Object.create(WorldEngine.prototype), { officeLoadTasks: [] });
    world.loadOfficeAsset('/models/falta.glb', () => {});
    const waiting = world.waitForOfficeReady();
    fail(new Error('error de red'));
    await assert.rejects(waiting, /falta\.glb/);
});
