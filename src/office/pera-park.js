import { PARK_BYPASS, PARK_SIDEWALK_HALF, PARK_STREET } from './park-streets.js';
import { createParkKit } from './park-models.js';
import { buildParkDistrict } from './park-district.js';
import { createParkAssets, loadParkSurface } from './park-assets.js';
import { buildCourtyardBuilding, buildParkRing, COURTYARD_BUILDINGS, PARK_PATHS } from './park-ring.js';
import { addParkBench, buildParkGrass, buildParkTerrain, buildParkTrees } from './park-landscape.js';

export const PARK_BUILDINGS = Object.freeze({
    studio: { name: 'Oficina 3', detail: 'Estudio de desarrollo', color: 0x74d6b2 },
    consoles: { name: 'Constructor de consolas', detail: 'Próximamente', color: 0xffbf7a },
    lab: { name: 'Laboratorio de I+D', detail: 'Próximamente', color: 0xb7a2ff }
});

function surfaces(THREE, group) {
    const matte = color => new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const light = color => new THREE.MeshBasicMaterial({ color });
    const mesh = (name, geometry, material, x, y, z) => {
        const object = new THREE.Mesh(geometry, material);
        object.name = name;
        object.position.set(x, y, z);
        object.receiveShadow = true;
        group.add(object);
        return object;
    };
    const box = (name, material, x, y, z, width, height, depth) =>
        mesh(name, new THREE.BoxGeometry(width, height, depth), material, x, y, z);
    return { matte, light, mesh, box };
}

export function buildPeraPark(world, THREE) {
    const park = new THREE.Group();
    park.name = 'Pera Park';
    world.officeGroup.add(park);
    const { mesh, box } = surfaces(THREE, park);
    const kit = createParkKit(THREE, park);
    const { mat } = kit;
    const assets = createParkAssets(THREE, world, park);
    const lawn = new THREE.MeshStandardMaterial({ color: 0x5b7350, roughness: 1 });
    const turfReady = loadParkSurface(THREE, park, lawn, 'turf', 76, 0x9cc77d);
    const paving = mat(0xbbb8a6);
    const stone = mat(0xd3cdbd);
    const soil = mat(0x4b473b);
    const groundCover = mat(0x657451);
    const { block } = kit;
    park.userData.refreshShadows = () => { world.nextShadowRefresh = 0; };
    buildParkTerrain(THREE, park, lawn);

    const pavingRing = (name, radius, width, y) => {
        const geometry = new THREE.RingGeometry(radius, radius + width, 144);
        geometry.rotateX(-Math.PI / 2);
        mesh(name, geometry, paving, 0, y, 0);
    };
    pavingRing('Paseo interior', PARK_PATHS.inner.radius, PARK_PATHS.inner.width, 0.025);
    pavingRing('Paseo perimetral', PARK_PATHS.outer.radius, PARK_PATHS.outer.width, 0.026);
    mesh('Plaza central', new THREE.CylinderGeometry(4.82, 4.88, 0.12, 72), stone, 0, 0.056, 0.9);
    box('Paseo norte-sur', paving, 0, 0.026, 0, 2.06, 0.052, 29.3);
    box('Paseo este-oeste', paving, 0, 0.025, 0.9, 29.3, 0.05, 1.74);
    box('Acceso desde la avenida', stone, 1.7, 0.034, 21.26, 3.30, 0.068, 4.15);
    for (const x of [-20.3, 20.3]) {
        box('Acceso lateral', stone, x, 0.034, 3.78, 5.35, 0.068, 2.65);
    }
    for (const side of [-1, 1]) {
        box('Parcela de expansión', soil, side * 6.75, 0.045, -4.95, 4.7, 0.09, 2.3);
        for (let row = 0; row < 3; row++) {
            block(groundCover, side * 6.75, 0.105, -5.62 + 0.63 * row, 4.22, 0.14, 0.28);
        }
        for (const z of [-2.9, 4.95, 7.25]) {
            addParkBench(kit, side * (z === 7.25 ? 5.05 : 4.32), z, Math.PI / 2 * -side);
        }
        box('Terraza del jardín', paving, side * 7.8, 0.038, 8, 3.5, 0.076, 2.5);
        box('Sendero de la caseta', paving, side * 6.8, 0.028, 2.29, 1.17, 0.056, 2.25);
        assets.staticModel('picnic-table/table.gltf', { x: side * 7.8, y: 0.028, z: 8.0, width: 1.95, yaw: side * Math.PI / 2, shadow: true });
    }

    buildParkRing(THREE, park, kit);
    for (const plot of COURTYARD_BUILDINGS) {
        const id = plot.id;
        const building = id && PARK_BUILDINGS[id];
        const group = new THREE.Group();
        group.name = building ? `Edificio · ${building.name}` : 'Caseta junto a la fuente';
        group.position.set(plot.x, 0, plot.z);
        park.add(group);
        const base = buildCourtyardBuilding(THREE, group, kit, plot, building?.color);
        if (!building) continue;
        base.userData.parkDestination = id;
        world.interactiveParkEntrances.push(base);
        if (typeof document === 'undefined') continue;
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 112;
        const ctx = canvas.getContext('2d');
        const accent = '#' + building.color.toString(16).padStart(6, '0');
        ctx.fillStyle = '#152731';
        ctx.beginPath();
        ctx.roundRect(3, 3, 634, 106, 16);
        ctx.fill();
        ctx.fillStyle = accent;
        ctx.fillRect(25, 26, 7, 60);
        ctx.fillStyle = '#f4f3ed';
        ctx.font = '650 45px system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(building.name, 50, 57, 562);
        const map = new THREE.CanvasTexture(canvas);
        map.encoding = THREE.sRGBEncoding;
        const label = new THREE.Sprite(new THREE.SpriteMaterial({
            map, depthTest: false, depthWrite: false, fog: false, toneMapped: false
        }));
        label.name = `Rótulo · ${building.name}`;
        label.position.set(0, plot.height + 1.12, 0);
        label.scale.set(5.95, 1.04, 1);
        label.renderOrder = 20;
        label.userData.parkDestination = id;
        label.userData.parkLabel = true;
        group.add(label);
        world.interactiveParkEntrances.push(label);
    }
    world.updateParkDetail = buildParkGrass(THREE, park);

    const trees = [
        [-4.0,-6.4,4.6,1.36], [4.5,-6.85,5.05,1.38], [-11.7,-6.4,4.25,1.2], [11.7,-6.40,4.55,1.31],
        [-10.65,6.4,4.75,1.34], [10.65,6.6,4.5,1.29], [-10.1,8.8,3.65,1.05], [10.0,8.7,3.8,1.12],
        [-3.4,11.3,2.75,0.85], [3.45,11.4,2.95,0.89], [-5.6,-10.8,3.5,1], [5.65,-10.7,3.5,1],
        [-8.2,21.1,3.8,0.98], [5.85,21.15,3.6,0.94], [-15.2,16.0,4.15,1.13], [15.6,-16.7,4.35,1.10],
        [-17.4,-14.3,4.3,1.03], [-14.0,-17.6,3.9,0.94], [17.1,-14.9,3.6,0.92]
    ];
    for (const x of [-30.4, 30.4]) {
        for (let z = -19; z <= 19; z += 6.4) trees.push([x, z, 3.5 + Math.cos(z) * 0.54, 0.94]);
    }
    for (const z of [-30.4, 30.4]) {
        for (let x = -44; x <= 44; x += 7.3) {
            if (Math.abs(x - 26) < 4 || Math.abs(x + 26) < 4) continue;
            trees.push([x, z, 4.25 + Math.sin(x) * 0.75, 1.05]);
        }
    }
    // Wooded outer slopes lead into the city blocks.
    for (let i = 0; i < 104; i++) {
        const angle = i * 2.39996;
        const radius = 51 + (i % 13) * 2.45;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const edge = Math.max(Math.abs(x), Math.abs(z));
        if (edge < 46 || Math.abs(edge - PARK_BYPASS) < PARK_SIDEWALK_HALF + 1.05) continue;
        if (edge < PARK_BYPASS && Math.min(Math.abs(Math.abs(x) - PARK_STREET), Math.abs(Math.abs(z) - PARK_STREET)) < 4.65) continue;
        trees.push([x, z, 4.1 + (i % 7) * 0.42, 1.04 + (i % 5) * 0.14]);
    }
    const foliageReady = buildParkTrees(THREE, park, trees);

    const fountain = new THREE.Group();
    fountain.name = 'Fuente de la plaza';
    fountain.position.set(0, 0.12, 0.9);
    park.add(fountain);
    assets.movingModel('fountain', fountain, { width: 4.6 }, true);
    const animateTraffic = buildParkDistrict(THREE, park, kit, assets);
    kit.flush();
    assets.finish([turfReady, foliageReady]);
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    world.animatePark = reduceMotion ? null : time => {
        assets.animate(time);
        animateTraffic(time);
    };
}


export function buildParkReception(world, THREE, destination) {
    const building = PARK_BUILDINGS[destination];
    const room = new THREE.Group();
    room.name = building.name;
    world.officeGroup.add(room);
    const { matte, light, box } = surfaces(THREE, room);
    const stone = matte(0xddd8ce);
    const steel = matte(0x303f4e);
    const trim = light(building.color);
    box('Suelo de recepción', stone, 0, -0.11, 0, 12, 0.22, 9);
    box('Pared de recepción', steel, 0, 1.7, -4.5, 12, 3.4, 0.22);
    box('Línea de luz', trim, 0, 2.84, -4.35, 10.5, 0.06, 0.09);
    box('Mostrador', steel, 0, 0.63, 0.25, 3.3, 1.26, 0.85);
    box('Encimera', stone, 0, 1.28, 0.25, 3.45, 0.12, 0.96);
    box('Frente iluminado', trim, 0, 0.66, 0.7, 2.8, 0.07, 0.05);
    for (const x of [-3.7, 0, 3.7]) {
        box('Vitrina', steel, x, 0.55, -3.08, 1.55, 1.1, 0.98);
        if (destination === 'consoles') {
            box('Prototipo de consola', matte(0x576377), x, 1.29, -3.08, 0.95, 0.38, 0.58);
            box('Indicador del prototipo', trim, x + 0.27, 1.27, -2.78, 0.17, 0.04, 0.025);
        } else {
            box('Módulo de pruebas', matte(0x627878), x, 1.42, -3.08, 0.58, 0.64, 0.58);
            box('Núcleo del módulo', trim, x, 1.42, -2.77, 0.25, 0.32, 0.05);
        }
    }
}
