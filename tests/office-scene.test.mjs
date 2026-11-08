import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import vm from 'node:vm';
import { createServer } from 'vite';

const vendor = await readFile(new URL('../public/vendor/three.min.js', import.meta.url), 'utf8');
const sandbox = {};
vm.runInNewContext(vendor, sandbox);
const { THREE } = sandbox;
globalThis.window = { THREE };
const vite = await createServer({ server: { middlewareMode: true, ws: false } });
after(async () => {
    await vite.close();
    delete globalThis.window;
});

const { WorldEngine } = await vite.ssrLoadModule('/src/world.js');

function buildScene() {
    // Exercise the real scene builder and placement logic without a WebGL context.
    const world = Object.assign(Object.create(WorldEngine.prototype), {
        currentEra: 1,
        viewMode: 'office',
        menuCamera: { active: false },
        officeGroup: new THREE.Group(),
        characters: [],
        ambientLight: new THREE.AmbientLight(),
        sunLight: new THREE.DirectionalLight(),
        rimLight: new THREE.PointLight(),
        cameraOfficePos: new THREE.Vector3(),
        cameraOfficeTarget: new THREE.Vector3(),
        createAnimatedMonitorCanvas: () => new THREE.Texture(),
        createWhiteboardTexture: () => new THREE.Texture(),
        clearComputerHover: () => {}
    });
    world.buildOffice(2);
    return world;
}

test('the modern scene builds one founder workstation and four separate team workstations', () => {
    const world = buildScene();
    assert.equal(world.currentEra, 2);
    assert.ok(world.officeGroup.getObjectByName('Oficina Moderna'));
    assert.equal(world.desks.filter(desk => desk.role === 'founder').length, 1);
    assert.equal(world.desks.filter(desk => desk.role === 'employee').length, 4);
    assert.equal(world.monitors.filter(Boolean).length, 5);
    assert.equal(new Set(world.desks.map(desk => desk.seatPos.toArray().join(','))).size, 5);
    assert.ok(world.desks.every(desk => desk.occupant === null));
});

test('the founder keeps their desk and extra characters never overlap occupied seats', () => {
    const world = buildScene();
    world.characters = ['team-1', 'team-2', 'player', 'team-3', 'team-4', 'extra'].map(id => ({
        employee: { id },
        group: new THREE.Group()
    }));
    world.updateCharacterPositions();
    const founder = world.desks.find(desk => desk.role === 'founder');
    assert.equal(founder.occupant.employee.id, 'player');
    for (const desk of world.desks) {
        assert.ok(desk.occupant.group.visible);
        assert.ok(desk.occupant.group.position.equals(desk.seatPos));
    }
    assert.equal(world.characters.at(-1).group.visible, false);
    world.characters = [founder.occupant];
    world.updateCharacterPositions();
    assert.equal(world.desks.filter(desk => desk.occupant === null).length, 4);
});
