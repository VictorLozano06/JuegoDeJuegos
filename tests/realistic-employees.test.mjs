import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { realisticEmployeeUrl } from '../src/characters/realistic.js';

test('los dos empleados realistas incluyen la pose sentada y texturas integradas', async () => {
    const urls = new Set([realisticEmployeeUrl(0), realisticEmployeeUrl(1)]);
    assert.equal(urls.size, 2);
    for (const url of urls) {
        const file = await readFile(new URL(`../public${url}`, import.meta.url));
        assert.equal(file.subarray(0, 4).toString(), 'glTF');
        assert.equal(file.readUInt32LE(8), file.length);
        const json = JSON.parse(file.subarray(20, 20 + file.readUInt32LE(12)));
        const sit = json.animations.find(animation => animation.name === 'Sit idle (chair)');
        assert.ok(sit, url);
        for (const name of ['LeftArm', 'RightArm']) {
            const index = json.nodes.findIndex(node => node.name === name);
            assert.ok(index >= 0 && sit.channels.some(channel => channel.target.node === index), `${url}: ${name}`);
        }
        assert.ok(json.images.length > 0 && json.images.every(image => Number.isInteger(image.bufferView)), url);
    }
});
