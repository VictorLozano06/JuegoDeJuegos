import { preloadedModels } from '../loading-screen.js';
import { createModernPeripherals } from './peripherals.js';

export const MODERN_OFFICE_LAYOUT = Object.freeze([
    Object.freeze({ id: 'founder', role: 'founder', x: 0, z: -2.65 }),
    Object.freeze({ id: 'team-1', role: 'employee', x: -3.3, z: -0.35 }),
    Object.freeze({ id: 'team-2', role: 'employee', x: 3.3, z: -0.35 }),
    Object.freeze({ id: 'team-3', role: 'employee', x: -3.3, z: 2.65 }),
    Object.freeze({ id: 'team-4', role: 'employee', x: 3.3, z: 2.65 })
]);

const WIDTH = 13;
const DEPTH = 10.6;
const BACK = -DEPTH / 2;
const LEFT = -WIDTH / 2;

/** Uses the same seated rig, screen animation and desk targets as the garage. */
export function buildModernOffice(world, THREE) {
    const room = new THREE.Group();
    room.name = 'Oficina Moderna';
    world.officeGroup.add(room);
    const chairs = [];
    const workstations = [];
    const plants = [];

    const matte = (color, roughness = 0.82) => new THREE.MeshStandardMaterial({ color, roughness });
    const floor = matte(0x777b76);
    const walls = matte(0xe3ddd0);
    const timber = matte(0xb48759);
    const walnut = matte(0x76573d);
    const aluminum = matte(0x343c41, 0.58);
    const teal = matte(0x3b7068);
    const felt = matte(0x465e5a);
    const ceramic = matte(0xd6c0a2);
    const warmWhite = matte(0xf2efe7);
    const graphite = matte(0x242d33);
    const screen = new THREE.MeshBasicMaterial({ map: world.createAnimatedMonitorCanvas('code') });
    const wallBoard = new THREE.MeshStandardMaterial({ map: world.createWhiteboardTexture(), roughness: 0.8 });
    const frosted = new THREE.MeshStandardMaterial({
        color: 0xa9cbc4, transparent: true, opacity: 0.29, roughness: 0.43, depthWrite: false
    });

    function box(parent, name, material, width, height, depth, x, y, z, shadow = false) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
        mesh.name = name;
        mesh.position.set(x, y, z);
        mesh.castShadow = shadow;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
    }

    box(room, 'Base del estudio', graphite, WIDTH, 0.18, DEPTH, 0, -0.13, 0);
    box(room, 'Suelo de hormigón', floor, WIDTH - 0.12, 0.04, DEPTH - 0.12, 0, -0.02, 0);
    box(room, 'Pared del fondo', walls, WIDTH, 3.5, 0.20, 0, 1.75, BACK);
    box(room, 'Pared lateral', walls, 0.20, 3.5, 4.6, LEFT, 1.75, BACK + 2.3);
    box(room, 'Rodapié', aluminum, WIDTH, 0.13, 0.06, 0, 0.065, BACK + 0.12);
    box(room, 'Panel acústico del fundador', teal, 3.4, 1.62, 0.10, 0, 2.22, BACK + 0.14);
    for (let i = -3; i <= 3; i++) {
        box(room, 'Listón acústico', walnut, 0.055, 1.58, 0.055, i * 0.44, 2.22, BACK + 0.22);
    }

    // Two open ends keep the route to the desks clear.
    for (const z of [0.55, 2.15]) {
        box(room, 'Mampara translúcida', frosted, 0.04, 1.33, 1.55, LEFT + 0.13, 1.43, z);
        box(room, 'Marco de mampara', aluminum, 0.09, 0.055, 1.55, LEFT + 0.13, 2.12, z);
    }
    for (const z of [-0.25, 1.35, 2.95]) {
        box(room, 'Montante de mampara', aluminum, 0.09, 2.17, 0.09, LEFT + 0.13, 1.085, z);
    }
    box(room, 'Alfombra del fundador', felt, 3.55, 0.024, 2.4, 0, 0.012, -2.27);
    for (const x of [-3.3, 3.3]) {
        box(room, 'Zona de trabajo del equipo', felt, 3.05, 0.016, 5.35, x, 0.008, 1.58);
    }

    box(room, 'Marco de pizarra', aluminum, 2.53, 1.33, 0.10, -3.8, 2.25, BACK + 0.14);
    box(room, 'Pizarra de producción', wallBoard, 2.40, 1.2, 0.025, -3.8, 2.25, BACK + 0.20);
    box(room, 'Archivador del equipo', walnut, 2.38, 1.18, 0.64, -3.8, 0.59, BACK + 0.56, true);
    box(room, 'Encimera del archivador', timber, 2.47, 0.08, 0.69, -3.8, 1.20, BACK + 0.56);
    for (const x of [-4.56, -3.8, -3.04]) {
        box(room, 'Puerta de almacenamiento', warmWhite, 0.73, 0.97, 0.035, x, 0.59, BACK + 0.9);
        box(room, 'Tirador de archivador', aluminum, 0.14, 0.04, 0.035, x, 0.97, BACK + 0.927);
    }
    box(room, 'Aparador de café', walnut, 2.35, 1.12, 0.72, 3.9, 0.56, BACK + 0.62, true);
    box(room, 'Encimera de café', timber, 2.43, 0.09, 0.76, 3.9, 1.16, BACK + 0.62);
    world.addRadio(room, 3.04, 1.205, BACK + 0.61, true);
    const applianceBody = box(room, 'Cuerpo de cafetera', aluminum, 0.49, 0.43, 0.39, 4.18, 1.42, BACK + 0.61);
    const applianceFront = box(room, 'Frente de cafetera', graphite, 0.42, 0.24, 0.04, 4.18, 1.43, BACK + 0.83);
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.081, 0.07, 0.14, 10), ceramic);
    mug.name = 'Taza de café';
    mug.position.set(3.68, 1.275, BACK + 0.83);
    room.add(mug);
    world.coffeeMugPos = mug.position.clone().add(new THREE.Vector3(0, 0.07, 0));

    const leaf = matte(0x547a55);
    const leafLight = matte(0x6c9366);
    for (const [x, z] of [[-5.68, -3.8], [5.76, -3.45]]) {
        const placeholder = new THREE.Group();
        room.add(placeholder);
        plants.push({ x, z, placeholder });
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.21, 0.47, 10), ceramic);
        pot.name = 'Maceta';
        pot.position.set(x, 0.235, z);
        placeholder.add(pot);
        for (let i = 0; i < 5; i++) {
            const angle = i * Math.PI * 2 / 5;
            const frond = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 5), i % 2 ? leaf : leafLight);
            frond.name = 'Hoja';
            frond.scale.set(0.12, 0.36, 0.075);
            frond.position.set(x + Math.sin(angle) * 0.15, 0.68 + (i % 3) * 0.055, z + Math.cos(angle) * 0.15);
            frond.rotation.set(Math.cos(angle) * 0.55, angle, -Math.sin(angle) * 0.55);
            placeholder.add(frond);
        }
    }

    for (const [index, slot] of MODERN_OFFICE_LAYOUT.entries()) {
        const boss = slot.role === 'founder';
        const desk = new THREE.Group();
        desk.name = boss ? 'Puesto del fundador' : 'Puesto de equipo ' + index;
        desk.position.set(slot.x, 0, slot.z);
        const width = boss ? 2.9 : 2.25;
        box(desk, 'Tablero', boss ? walnut : timber, width, 0.095, 1.19, 0, 1.35, 0, true);
        for (const x of [-width / 2 + 0.15, width / 2 - 0.15]) {
            box(desk, 'Pata delantera', aluminum, 0.07, 1.30, 0.07, x, 0.65, 0.43, true);
            box(desk, 'Pata trasera', aluminum, 0.07, 1.30, 0.07, x, 0.65, -0.43, true);
            box(desk, 'Travesaño', aluminum, 0.07, 0.07, 0.92, x, 0.035, 0);
        }
        const monitorWidth = boss ? 1.31 : 0.99;
        const monitorZ = -0.34;
        const frame = box(desk, 'Marco del monitor', graphite, monitorWidth, 0.59, 0.055, 0, 1.80, monitorZ, true);
        const stand = box(desk, 'Soporte del monitor', aluminum, 0.085, 0.22, 0.075, 0, 1.51, monitorZ);
        const base = box(desk, 'Pie del monitor', aluminum, 0.40, 0.035, 0.25, 0, 1.416, monitorZ);
        const display = new THREE.Mesh(new THREE.PlaneGeometry(monitorWidth - 0.07, 0.51), screen);
        display.name = 'Pantalla de desarrollo';
        display.position.set(0, 1.81, monitorZ + 0.03);
        desk.add(display);
        const peripherals = createModernPeripherals(THREE, { tabletop: 1.3975 });
        desk.add(peripherals);
        workstations.push({ desk, display, frame, stand, base, peripherals, monitorWidth });
        if (boss) {
            box(desk, 'Organizador del fundador', graphite, 0.62, 0.08, 0.32, -0.96, 1.44, -0.20);
            box(desk, 'Cuaderno del fundador', warmWhite, 0.39, 0.032, 0.29, -0.83, 1.418, 0.30);
        }

        const chair = world.createChair(boss ? 0x435b52 : 0x525e63);
        chair.position.z = 0.85;
        desk.add(chair);
        chairs.push({ desk, chair });
        world.registerDesk(desk, index, slot, room);
        world.monitors[index] = { mesh: display, lightPos: display.getWorldPosition(new THREE.Vector3()) };
    }

    // Models are loaded once per office instance; the procedural chairs remain as
    // a fallback while the files load or if an asset cannot be retrieved.
    if (!THREE.GLTFLoader) return;
    const loader = new THREE.GLTFLoader(world.officeAssetManager);
    loader.load('/models/modern-office/planta.glb', gltf => {
        if (!room.parent) return;
        const bounds = new THREE.Box3().setFromObject(gltf.scene);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        if (!size.x || !size.y || !size.z) return;
        const scale = 1.12 / size.y;
        for (const { x, z, placeholder } of plants) {
            const model = gltf.scene.clone(true);
            model.scale.setScalar(scale);
            model.position.set(x - center.x * scale, -bounds.min.y * scale, z - center.z * scale);
            model.traverse(child => {
                if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
            });
            room.add(model);
            placeholder.visible = false;
        }
        world.nextShadowRefresh = 0;
    }, undefined, error => console.warn('No se ha podido cargar la planta de oficina:', error));
    const models = [
        { file: 'monitor', width: 0.99, height: 0.70, depth: 0.25, x: 0, z: -0.34 },
        { file: 'teclado-nuevo', width: 0.74, height: 0.06, depth: 0.255, x: 0, z: 0.39 },
        { file: 'raton-nuevo', width: 0.095, height: 0.048, depth: 0.14, x: 0.64, z: 0.30 },
    ];
    for (const spec of models) {
        loader.load('/models/modern-office/' + spec.file + '.glb', gltf => {
            if (!room.parent) return;
            for (const station of workstations) {
                const model = gltf.scene.clone(true);
                const bounds = new THREE.Box3().setFromObject(model);
                const size = bounds.getSize(new THREE.Vector3());
                const center = bounds.getCenter(new THREE.Vector3());
                if (!size.x || !size.y || !size.z) throw new Error('Modelo de oficina sin dimensiones válidas');
                const width = spec.file === 'monitor' ? station.monitorWidth : spec.width;
                model.scale.set(width / size.x, spec.height / size.y, spec.depth / size.z);
                model.position.set(spec.x - center.x * model.scale.x, 1.3975 - bounds.min.y * model.scale.y, spec.z - center.z * model.scale.z);
                model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
                station.desk.add(model);
                if (spec.file === 'monitor') {
                    station.frame.visible = station.stand.visible = station.base.visible = false;
                    station.desk.updateWorldMatrix(true, true);
                    let displayMesh;
                    model.traverse(child => { if (child.isMesh && child.material?.name === 'screen') displayMesh = child; });
                    if (!displayMesh) throw new Error('El monitor no contiene una superficie de pantalla.');
                    const screenBounds = new THREE.Box3().setFromObject(displayMesh);
                    const screenCenter = station.desk.worldToLocal(screenBounds.getCenter(new THREE.Vector3()));
                    const screenSize = screenBounds.getSize(new THREE.Vector3());
                    station.display.position.set(screenCenter.x, screenCenter.y, screenCenter.z + screenSize.z / 2 + 0.003);
                    station.display.scale.set(screenSize.x * 0.98 / (station.monitorWidth - 0.07), screenSize.y * 0.98 / 0.51, 1);
                } else {
                    for (const child of station.peripherals.children) {
                        if (spec.file === 'teclado-nuevo' && ['Carcasa de teclado', 'Teclas'].includes(child.name)) child.visible = false;
                        if (spec.file === 'raton-nuevo' && ['Ratón', 'Rueda del ratón'].includes(child.name)) child.visible = false;
                    }
                }
            }
            world.nextShadowRefresh = 0;
        });
    }

    for (const spec of [
        { file: 'microondas', x: 4.18, z: BACK + 0.61, width: 0.64, height: 0.38, depth: 0.43 },
        { file: 'taza', x: 3.68, z: BACK + 0.83, width: 0.20, height: 0.14, depth: 0.16 },
    ]) {
        loader.load('/models/modern-office/' + spec.file + '.glb', gltf => {
            if (!room.parent) return;
            const model = gltf.scene;
            const bounds = new THREE.Box3().setFromObject(model);
            const size = bounds.getSize(new THREE.Vector3());
            const center = bounds.getCenter(new THREE.Vector3());
            if (!size.x || !size.y || !size.z) throw new Error('Modelo de cocina sin dimensiones válidas');
            model.scale.set(spec.width / size.x, spec.height / size.y, spec.depth / size.z);
            model.position.set(spec.x - center.x * model.scale.x, 1.205 - bounds.min.y * model.scale.y, spec.z - center.z * model.scale.z);
            model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
            room.add(model);
            if (spec.file === 'microondas') applianceBody.visible = applianceFront.visible = false;
            else mug.visible = false;
            world.nextShadowRefresh = 0;
        });
    }

    const installChair = source => {
        if (!room.parent) return;
        const model = source.clone(true);
        // Each office owns its GPU resources; the cached template survives office changes.
        model.traverse(object => {
            if (!object.isMesh) return;
            object.geometry = object.geometry.clone();
            object.material = Array.isArray(object.material) ? object.material.map(material => material.clone()) : object.material.clone();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            for (const material of materials) for (const key of Object.keys(material)) {
                if (material[key]?.isTexture) material[key] = material[key].clone();
            }
        });
        // The source chair's back faces +X; turn it away from the desk.
        model.rotation.y = -Math.PI / 2;
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        if (!size.x || !size.y || !size.z) return;
        // Fit the model to the seated rig: the seat is about 0.8 units above
        // the floor and the front edge must stay behind the character's knees.
        const horizontalScale = 0.64 / Math.max(size.x, size.z);
        const verticalScale = 1.31 / size.y;
        const center = bounds.getCenter(new THREE.Vector3());
        model.scale.set(horizontalScale, verticalScale, horizontalScale);
        model.position.set(-center.x * horizontalScale, -bounds.min.y * verticalScale + 0.02, -center.z * horizontalScale);
        model.traverse(object => {
            if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; }
        });
        for (const { desk, chair } of chairs) {
            const replacement = new THREE.Group();
            replacement.name = 'Silla de oficina';
            replacement.position.z = 0.91;
            replacement.add(model.clone(true));
            desk.remove(chair);
            desk.add(replacement);
            chair.traverse(object => {
                object.geometry?.dispose();
                if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
            });
        }
        world.nextShadowRefresh = 0;
    };
    const cachedChair = preloadedModels.get('/models/silla.glb?v=3');
    if (cachedChair) installChair(cachedChair);
    else loader.load('/models/silla.glb?v=3', gltf => installChair(gltf.scene), undefined, error => console.warn('No se pudo cargar la silla:', error));

    loader.load('/models/mando-nes.glb', gltf => {
        if (!room.parent) return;
        const model = gltf.scene;
        const prop = new THREE.Group();
        prop.name = 'Mando NES';
        prop.add(model);
        // The front of the source model faces +X; turn it toward the room.
        model.rotation.y = -Math.PI / 2;
        prop.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const scale = 0.90 / size.x;
        const center = bounds.getCenter(new THREE.Vector3());
        prop.scale.setScalar(scale);
        prop.position.set(3.9 - center.x * scale, 2.46 - center.y * scale, BACK + 0.105 - bounds.min.z * scale);
        model.traverse(object => {
            if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; }
        });
        room.add(prop);
        world.nextShadowRefresh = 0;
    }, undefined, error => console.warn('No se pudo cargar el mando:', error));

    loader.load('/models/primibot.glb?v=2', gltf => {
        if (!room.parent) return;
        const model = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        if (!size.y) return;
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 0.32 / size.y;
        model.scale.setScalar(scale);
        model.position.set(-0.82 - center.x * scale, 1.398 - bounds.min.y * scale, -0.27 - center.z * scale);
        model.name = 'Figura de acción Primibot';
        model.traverse(object => {
            if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; }
        });
        chairs[1].desk.add(model);
        world.nextShadowRefresh = 0;
    }, undefined, error => console.warn('No se pudo cargar Primibot:', error));
}
