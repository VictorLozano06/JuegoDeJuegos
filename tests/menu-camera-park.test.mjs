import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { MenuCamera } from '../src/menuCamera.js';

const sandbox = {};
vm.runInNewContext(await readFile(new URL('../public/vendor/three.min.js', import.meta.url), 'utf8'), sandbox);
const { THREE } = sandbox;

test('Pera Park menu approaches the ring from outside and reduced motion stays still', () => {
    let reduced = false;
    globalThis.window = {
        innerWidth: 1280, innerHeight: 720,
        matchMedia: () => ({ get matches() { return reduced; } }),
        addEventListener() {}
    };
    try {
        const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.5, 210);
        const controls = { target: new THREE.Vector3(), domElement: { style: {} } };
        const menu = new MenuCamera(THREE, camera, controls);
        menu.enter(null, 100, { park: true });
        const first = camera.position.clone();
        menu.update(0.016, 102);
        assert.ok(camera.position.distanceTo(first) > 0.1, 'the camera drifts while holding a shot');
        menu.update(0.016, 111);
        assert.ok(camera.position.distanceTo(first) > 3);
        for (let second = 0; second < 70; second++) {
            menu.update(0.016, 100 + second);
            assert.ok(Math.hypot(camera.position.x, camera.position.z) > 21, 'the drone stays outside the ring');
        }
        reduced = true;
        menu.update(0.016, 120);
        assert.ok(camera.position.distanceTo(first) < 0.001);
    } finally {
        delete globalThis.window;
    }
});
