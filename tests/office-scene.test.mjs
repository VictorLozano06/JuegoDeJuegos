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

function buildScene(tier = 2) {
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
    world.buildOffice(tier);
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

test('the campus seats the founder and nine employees at distinct workstations', () => {
    const world = buildScene(3);
    assert.equal(world.ambientLight.color.getHex(), 0xc7d8e0);
    assert.equal(world.ambientLight.intensity, 0.85);
    assert.equal(world.desks.length, 10);
    assert.equal(world.desks.filter(desk => desk.role === 'founder').length, 1);
    assert.equal(world.desks.filter(desk => desk.role === 'employee').length, 9);
    assert.equal(world.monitors.length, 10);
    assert.equal(new Set(world.desks.map(desk => desk.seatPos.toArray().join(','))).size, 10);
    world.characters = Array.from({ length: 10 }, (_, i) => ({
        employee: { id: i === 0 ? 'player' : `employee-${i}` }, group: new THREE.Group()
    }));
    world.updateCharacterPositions();
    assert.equal(world.desks.filter(desk => desk.occupant?.group.visible).length, 10);
    assert.equal(world.desks[0].occupant.employee.id, 'player');
});

test('Pera Park connects three entrances to interiors and reuses the tier-three studio', () => {
    const world = buildScene(3);
    const studioSeats = world.desks.map(desk => desk.seatPos.toArray());
    world.buildOffice(4);
    assert.equal(world.parkLocation, 'grounds');
    assert.deepEqual([...new Set(world.interactiveParkEntrances.map(mesh => mesh.userData.parkDestination))],
        ['studio', 'consoles', 'lab']);
    assert.equal(world.desks.length, 0);
    assert.equal(world.officeGroup.children[0].children.filter(mesh => mesh.name === 'Parcela de expansión').length, 2);

    world.buildOffice(4, 'studio');
    assert.deepEqual(world.desks.map(desk => desk.seatPos.toArray()), studioSeats);
    assert.equal(world.ambientLight.color.getHex(), 0xc7d8e0);
    assert.equal(world.ambientLight.intensity, 0.85);
    assert.equal(world.interactiveParkEntrances.length, 0);

    world.buildOffice(4, 'consoles');
    assert.ok(world.officeGroup.getObjectByName('Prototipo de consola'));
    world.buildOffice(4, 'lab');
    assert.ok(world.officeGroup.getObjectByName('Módulo de pruebas'));
    world.buildOffice(4, 'grounds');
    assert.ok(world.officeGroup.getObjectByName('Cubierta circular'));
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
