import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { TrophyManager } from '../src/TrophyManager.js';

const context = { console };
runInNewContext(readFileSync(new URL('../public/vendor/three.min.js', import.meta.url), 'utf8'), context);
const THREE = context.THREE;

test('los trofeos se sincronizan y cambian con la oficina y la partida', () => {
    const office = new THREE.Group();
    const manager = new TrophyManager(THREE, office);
    const awards = [{ year: 1984, categoryId: 'goty', categoryName: 'Juego del Año', gameName: 'A' }];
    manager.sync(awards, 1, null);
    const trophy = office.getObjectByName('Trofeo · Juego del Año · 1984');
    assert.ok(trophy);
    assert.ok(trophy.children.some(mesh => mesh.material.metalness === 0.9 && mesh.material.roughness === 0.2));
    manager.sync(awards, 2, null);
    assert.ok(office.getObjectByName('Cristal de vitrina'));
    assert.equal(office.children.length, 1);
    manager.sync([], 2, null);
    assert.equal(office.children.length, 0);
});
