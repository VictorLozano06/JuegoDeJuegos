import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import { createModernPeripherals } from '../src/office/peripherals.js';

const vendor = await readFile(new URL('../public/vendor/three.min.js', import.meta.url), 'utf8');
const sandbox = {};
vm.runInNewContext(vendor, sandbox);
const { THREE } = sandbox;

for (const [name, tabletop] of [['modern', 1.3975], ['campus', 1.4]]) {
    test(`${name} peripherals rest on the desktop and keep the keys instanced`, () => {
        const group = createModernPeripherals(THREE, { tabletop, cyber: name === 'campus' });
        group.updateMatrixWorld(true);
        for (const part of ['Carcasa de teclado', 'Alfombrilla', 'Ratón']) {
            const bounds = new THREE.Box3().setFromObject(group.getObjectByName(part));
            assert.ok(bounds.min.y >= tabletop - 0.0001, `${part} is below the tabletop`);
            assert.ok(bounds.max.z <= 0.6, `${part} extends beyond the desk`);
        }
        const keys = group.getObjectByName('Teclas');
        assert.equal(keys.count, 48);
        assert.equal(keys.isInstancedMesh, true);
    });
}
