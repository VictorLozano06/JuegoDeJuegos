export const PARK_BUILDINGS = Object.freeze({
    studio: { name: 'Oficina 3', detail: 'Estudio de desarrollo', color: 0x74d6b2, angle: Math.PI * 1.68 },
    consoles: { name: 'Constructor de consolas', detail: 'Próximamente', color: 0xffbf7a, angle: Math.PI * 1.12 },
    lab: { name: 'Laboratorio de I+D', detail: 'Próximamente', color: 0xb7a2ff, angle: Math.PI * 0.12 }
});

const INNER = 15.5;
const OUTER = 20.3;

// Small, repeatable textures keep the landscaping detailed even when zoomed in.
function parkTexture(THREE, kind) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    let seed = kind === 'grass' ? 1982 : kind === 'stone' ? 1984 : 1986;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    const palettes = {
        grass: ['#719766', '#5e8555', '#82a36f', '#678c5a', '#91aa79'],
        stone: ['#d4c6ae', '#bfb39f', '#ded1bc', '#cbbda7', '#e3d7c5'],
        water: ['#71b9b3', '#65aaa7', '#87c4ba', '#5a9d9d', '#9ccdc2']
    };
    const colors = palettes[kind];
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, 512, 512);
    const marks = kind === 'grass' ? 15000 : kind === 'stone' ? 6000 : 2200;
    for (let i = 0; i < marks; i++) {
        ctx.fillStyle = colors[Math.floor(random() * colors.length)];
        ctx.globalAlpha = kind === 'water' ? 0.22 : 0.35;
        const x = random() * 512;
        const y = random() * 512;
        if (kind === 'grass') ctx.fillRect(x, y, 1 + random() * 2, 2 + random() * 5);
        else if (kind === 'water') ctx.fillRect(x, y, 3 + random() * 14, 0.7 + random());
        else ctx.fillRect(x, y, 1 + random() * 3, 1 + random() * 3);
    }
    ctx.globalAlpha = 1;
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(kind === 'grass' ? 8 : kind === 'stone' ? 4 : 2, kind === 'grass' ? 8 : kind === 'stone' ? 4 : 2);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 4;
    return texture;
}

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
    const { matte, light, mesh, box } = surfaces(THREE, park);
    const grassMap = parkTexture(THREE, 'grass');
    const stoneMap = parkTexture(THREE, 'stone');
    const waterMap = parkTexture(THREE, 'water');
    const lawn = new THREE.MeshStandardMaterial({ color: grassMap ? 0xffffff : 0x719766, map: grassMap, roughness: 1 });
    const paving = new THREE.MeshStandardMaterial({ color: stoneMap ? 0xffffff : 0xd4c6ae, map: stoneMap, roughness: 0.92 });
    const buildingFoundation = matte(0xc5b399);
    const aluminum = matte(0xe2e9e9);
    const glass = new THREE.MeshStandardMaterial({
        color: 0x295e88, roughness: 0.27, metalness: 0.4, side: THREE.DoubleSide
    });
    const roof = matte(0x426b8b);
    const solar = matte(0x243b58);
    const ring = (name, material, inner, outer, y, start = 0, length = Math.PI * 2) => {
        const object = mesh(name, new THREE.RingGeometry(inner, outer, 128, 1, start, length), material, 0, y, 0);
        object.rotation.x = -Math.PI / 2;
        return object;
    };

    box('Terreno del campus', lawn, 0, -0.23, 1, 56, 0.46, 56);
    ring('Paseo exterior', paving, OUTER, OUTER + 1.3, 0.022);
    ring('Paseo del jardín', paving, 12.9, 13.55, 0.025);
    box('Camino central', paving, 0, 0.018, 0, 1.05, 0.04, 25.8);
    box('Camino transversal', paving, 0, 0.018, -4.0, 23, 0.04, 1.05);
    box('Camino de acceso', paving, 0, 0.015, 23, 2.15, 0.03, 6);

    for (const radius of [INNER, OUTER]) {
        mesh('Fachada de cristal', new THREE.CylinderGeometry(radius, radius, 2.68, 128, 1, true), glass, 0, 1.42, 0);
        for (const height of [0.13, 1.0, 1.9, 2.8]) ring('Banda de aluminio', aluminum, radius - 0.08, radius + 0.08, height);
    }
    ring('Cubierta circular', roof, INNER, OUTER, 2.86);
    ring('Paneles solares', solar, INNER + 0.68, OUTER - 0.67, 2.89);
    ring('Borde interior', aluminum, INNER - 0.08, INNER + 0.44, 2.91);
    ring('Borde exterior', aluminum, OUTER - 0.44, OUTER + 0.08, 2.91);

    // The colored wings and the separate buildings both lead to the same interiors.
    for (const [id, building] of Object.entries(PARK_BUILDINGS)) {
        const entry = light(building.color);
        const wing = ring(building.name, entry, INNER + 0.6, OUTER - 0.6, 2.92, building.angle - 0.25, 0.5);
        wing.userData.parkDestination = id;
        world.interactiveParkEntrances.push(wing);
        const entrance = box(`Entrada · ${building.name}`, entry, Math.cos(building.angle) * OUTER, 1.45, -Math.sin(building.angle) * OUTER, 2.05, 2.9, 0.34);
        entrance.rotation.y = building.angle + Math.PI / 2;
        entrance.userData.parkDestination = id;
        world.interactiveParkEntrances.push(entrance);
    }

    const pondEdge = mesh('Orilla del estanque', new THREE.CircleGeometry(1.65, 48), paving, 3.6, 0.029, 2.3);
    pondEdge.rotation.x = -Math.PI / 2;
    const pond = mesh('Estanque del jardín', new THREE.CircleGeometry(1.47, 48), new THREE.MeshStandardMaterial({ color: waterMap ? 0xffffff : 0x71b9b3, map: waterMap, roughness: 0.22, metalness: 0.28 }), 3.6, 0.032, 2.3);
    pond.rotation.x = -Math.PI / 2;
    pond.scale.y = 0.82;

    // These plots hold the two buildings reserved for future features.
    for (const x of [-6.5, 6.5]) {
        box('Parcela de expansión', lawn, x, 0.021, 7.2, 4.2, 0.04, 3.4);
        box('Sendero de expansión', paving, x / 2, 0.023, 9.5, Math.abs(x), 0.035, 0.65);
    }

    const buildingPositions = {
        studio: [0, -8.9],
        consoles: [-8.3, -4.1],
        lab: [8.3, -4.1]
    };
    const towers = [
        ...Object.entries(PARK_BUILDINGS).map(([id, building]) => ({ id, building, position: buildingPositions[id] })),
        { id: null, building: { color: 0x94aaa1 }, position: [-6.5, 7.2] },
        { id: null, building: { color: 0x94aaa1 }, position: [6.5, 7.2] }
    ];
    for (const { id, building, position: [x, z] } of towers) {
        const buildingGroup = new THREE.Group();
        buildingGroup.name = id ? `Edificio · ${building.name}` : 'Edificio futuro';
        buildingGroup.position.set(x, 0, z);
        park.add(buildingGroup);
        const addPart = (name, material, width, height, depth, px, py, pz) => {
            const part = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
            part.name = name;
            part.position.set(px, py, pz);
            if (id) part.userData.parkDestination = id;
            part.receiveShadow = true;
            buildingGroup.add(part);
            if (id) world.interactiveParkEntrances.push(part);
            return part;
        };
        const frame = matte(0x293e46);
        const canopy = matte(0xf2eee4);
        const tintedGlass = new THREE.MeshStandardMaterial({ color: 0x507e88, roughness: 0.24, metalness: 0.35 });
        const height = id === 'studio' ? 6.2 : id === 'lab' ? 5.6 : 5.2;
        addPart('Cimentación', buildingFoundation, 4, 0.18, 3.3, 0, 0.09, 0);
        addPart('Volumen del edificio', tintedGlass, 3.6, height, 2.7, 0, height / 2 + 0.18, 0);
        addPart('Cubierta del edificio', canopy, 4, 0.22, 3.05, 0, height + 0.29, 0);
        addPart('Alero de entrada', canopy, 2, 0.13, 0.7, 0, 2.15, 1.64);
        addPart('Entrada del edificio', frame, 1.2, 1.88, 0.12, 0, 1.11, 1.41);
        addPart('Cristal de la puerta', tintedGlass, 0.98, 1.55, 0.05, 0, 1.18, 1.49);
        if (id) addPart('Identidad del edificio', light(building.color), 1.6, 0.09, 0.08, 0, 2.36, 1.44);
        for (const column of [-1.72, -1.13, -0.57, 0.57, 1.13, 1.72]) {
            addPart('Montante acristalado', frame, 0.07, height, 0.07, column, height / 2 + 0.18, 1.38);
        }
        for (let level = 1; level < height; level += 1.15) {
            addPart('Separación de plantas', canopy, 3.66, 0.08, 2.76, 0, level, 0);
        }
        for (const side of [-1, 1]) {
            addPart('Panel lateral', frame, 0.07, height, 2.7, side * 1.79, height / 2 + 0.18, 0);
            addPart('Jardinera de entrada', matte(0x596b53), 0.5, 0.35, 0.46, side * 1.45, 0.35, 1.7);
            addPart('Planta de entrada', matte(0x679369), 0.35, 0.4, 0.3, side * 1.45, 0.72, 1.7);
        }
        if (id === 'studio') {
            addPart('Ventana superior del estudio', frame, 2.3, 0.28, 1.0, 0, height + 0.5, -0.35);
        } else if (id === 'consoles') {
            addPart('Panel solar del constructor', solar, 2.5, 0.06, 1.5, 0, height + 0.42, -0.25);
        } else if (id === 'lab') {
            addPart('Lucernario del laboratorio', tintedGlass, 2.2, 0.2, 1.5, 0, height + 0.45, -0.2);
        }
        if (id && typeof document !== 'undefined') {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 112;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#112a31';
            ctx.fillRect(0, 0, 512, 112);
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.font = 'bold 29px sans-serif';
            ctx.fillText(building.name, 256, 46, 490);
            ctx.font = '22px sans-serif';
            ctx.fillStyle = '#cce6d9';
            ctx.fillText(building.detail, 256, 83, 490);
            const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false }));
            label.name = `Rótulo · ${building.name}`;
            label.position.set(0, height + 1.15, 0);
            label.scale.set(4.2, 0.92, 1);
            label.renderOrder = 20;
            label.userData.parkDestination = id;
            buildingGroup.add(label);
            world.interactiveParkEntrances.push(label);
        }
    }

    const positions = Array.from({ length: 60 }, (_, index) => {
        const angle = index * 2.39996;
        const radius = 3.1 + (index % 10) * 1.04;
        return [Math.cos(angle) * radius, Math.sin(angle) * radius];
    }).filter(([x, z]) => Math.abs(x) > 1.2 && Math.abs(z + 4) > 1.2
        && Math.hypot(x - 3.6, z - 2.3) > 2.2
        && Object.values(buildingPositions).every(([bx, bz]) => Math.abs(x - bx) > 3.2 || Math.abs(z - bz) > 2.7)
        && !([-6.5, 6.5].some(px => Math.abs(x - px) < 2.8 && Math.abs(z - 7.2) < 2.4)));
    for (const x of [-25.5, 25.5]) {
        for (const z of [-18, -12, -6, 0, 6, 12, 18]) positions.push([x, z]);
    }
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.13, 0.85, 6), matte(0x64472f), positions.length);
    const leaves = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.65, 1), matte(0xffffff), positions.length);
    const tree = new THREE.Object3D();
    positions.forEach(([x, z], index) => {
        const size = 0.8 + (index % 5) * 0.12;
        tree.scale.setScalar(size);
        tree.position.set(x, 0.42 * size, z);
        tree.updateMatrix();
        trunks.setMatrixAt(index, tree.matrix);
        tree.scale.set(size, size * 1.18, size);
        tree.position.y = 1.17 * size;
        tree.updateMatrix();
        leaves.setMatrixAt(index, tree.matrix);
        leaves.setColorAt(index, new THREE.Color([0x325f45, 0x487143, 0x709b54][index % 3]));
    });
    park.add(trunks, leaves);
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
