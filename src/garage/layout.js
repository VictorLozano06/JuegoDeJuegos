import { createGarageShellMaterials } from './lighting.js';
import { preloadedModels } from '../loading-screen.js';

const ROOM_WIDTH = 8.8;
const ROOM_DEPTH = 6.8;
const WALL_HEIGHT = 3.4;
const BACK = -ROOM_DEPTH / 2;
const LEFT = -ROOM_WIDTH / 2;

function canvasMap(THREE, width, height, paint) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    paint(canvas.getContext('2d'));
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
}

function rugMap(THREE) {
    return canvasMap(THREE, 512, 256, ctx => {
        ctx.fillStyle = '#a36f4f';
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = '#433e39';
        ctx.fillRect(8, 8, 496, 240);
        ctx.fillStyle = '#85714e';
        ctx.fillRect(14, 14, 484, 228);
        ctx.fillStyle = '#384d4b';
        ctx.fillRect(23, 24, 466, 208);

        for (let x = 56; x <= 456; x += 80) {
            for (const y of [75, 181]) {
                ctx.beginPath();
                ctx.moveTo(x, y - 28);
                ctx.lineTo(x + 30, y);
                ctx.lineTo(x, y + 28);
                ctx.lineTo(x - 30, y);
                ctx.closePath();
                ctx.strokeStyle = '#af8a62';
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.fillStyle = '#936147';
                ctx.fillRect(x - 8, y - 8, 16, 16);
            }
        }
        ctx.fillStyle = 'rgba(23,17,12,0.10)';
        for (let y = 0; y < 256; y += 3) ctx.fillRect(0, y, 512, 1);
        for (let x = 0; x < 512; x += 4) ctx.fillRect(x, 0, 1, 256);
    });
}

function windowMap(THREE) {
    return canvasMap(THREE, 256, 128, ctx => {
        const sky = ctx.createLinearGradient(0, 0, 0, 128);
        sky.addColorStop(0, '#71999f');
        sky.addColorStop(0.6, '#c1bca2');
        sky.addColorStop(1, '#e9bb79');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 256, 128);
        ctx.fillStyle = 'rgba(76,100,99,0.32)';
        ctx.beginPath();
        ctx.moveTo(0, 110);
        ctx.lineTo(45, 85);
        ctx.lineTo(108, 103);
        ctx.lineTo(163, 78);
        ctx.lineTo(256, 108);
        ctx.lineTo(256, 128);
        ctx.lineTo(0, 128);
        ctx.fill();
    });
}

function labelMap(THREE) {
    return canvasMap(THREE, 128, 64, ctx => {
        ctx.fillStyle = '#e8d7a8';
        ctx.fillRect(0, 0, 128, 64);
        ctx.fillStyle = '#583929';
        ctx.font = 'bold 21px monospace';
        ctx.fillText('ARCHIVO', 17, 27);
        ctx.fillRect(15, 34, 98, 2);
        for (let i = 0; i < 18; i++) {
            ctx.fillRect(15 + i * 5, 42, 1 + i % 3, 13);
        }
    });
}

/** Construct the cutaway garage. All structural coordinates are in metres. */
export function buildGarageLayout(world, THREE) {
    // Keep asynchronous garage assets attached to this scene instance, so a
    // late load cannot add garage props to the next office.
    const room = new THREE.Group();
    room.name = 'Garaje';
    world.officeGroup.add(room);
    const {
        brick, door, floor, timber, trim
    } = createGarageShellMaterials(THREE, {
        backWidth: ROOM_WIDTH,
        backHeight: WALL_HEIGHT,
        doorWidth: ROOM_DEPTH,
        doorHeight: WALL_HEIGHT,
        floorWidth: ROOM_WIDTH,
        floorDepth: ROOM_DEPTH,
    });

    const matte = color => new THREE.MeshStandardMaterial({ color, roughness: 0.82 });
    function mesh(parent, name, geometry, material, x, y, z, castShadow = false) {
        const object = new THREE.Mesh(geometry, material);
        object.name = name;
        object.position.set(x, y, z);
        object.receiveShadow = true;
        object.castShadow = castShadow;
        parent.add(object);
        return object;
    }
    // Boxes are specified by their bottom edge so contact with supports is explicit.
    function box(parent, name, material, w, h, d, x, bottom, z, castShadow = false) {
        return mesh(parent, name, new THREE.BoxGeometry(w, h, d), material, x, bottom + h / 2, z, castShadow);
    }
    function plane(parent, name, material, w, h, x, y, z) {
        return mesh(parent, name, new THREE.PlaneGeometry(w, h), material, x, y, z);
    }

    box(room, 'Canto de la solera', trim, ROOM_WIDTH, 0.14, ROOM_DEPTH, 0, -0.142, 0);
    plane(room, 'Suelo del garaje', floor, ROOM_WIDTH, ROOM_DEPTH, 0, 0, 0).rotation.x = -Math.PI / 2;
    const rug = new THREE.MeshStandardMaterial({ map: rugMap(THREE), roughness: 0.96 });
    plane(room, 'Alfombra del equipo', rug, 5.4, 2.36, 0, 0.003, 0.60).rotation.x = -Math.PI / 2;

    box(room, 'Grosor del muro trasero', trim, ROOM_WIDTH, WALL_HEIGHT, 0.14, 0, 0, BACK + 0.07);
    plane(room, 'Cara interior de ladrillo', brick, ROOM_WIDTH, WALL_HEIGHT, 0, WALL_HEIGHT / 2, BACK + 0.141);
    box(room, 'Grosor del portón', trim, 0.14, WALL_HEIGHT, ROOM_DEPTH - 0.14, LEFT + 0.07, 0, 0.07);
    const shutter = plane(room, 'Chapa acanalada', door, ROOM_DEPTH - 0.14, WALL_HEIGHT, LEFT + 0.141, WALL_HEIGHT / 2, 0.07);
    shutter.rotation.y = Math.PI / 2;
    const shutterUrl = '/models/garage-shell/shutter/rollershutter_window_01_1k.gltf';
    const installShutter = source => {
        const model = source.clone(true);
        const graffiti = model.getObjectByName('rollershutter_window_01_graffiti');
        if (graffiti) graffiti.visible = false;
        model.name = 'Portón metálico';
        model.rotation.y = Math.PI / 2;
        model.scale.set((ROOM_DEPTH - 0.20) / 2.1, WALL_HEIGHT / 1.8507, 0.35);
        model.position.set(LEFT + 0.15, 0, 0.07);
        room.add(model);
        shutter.visible = false;
    };
    const cachedShutter = preloadedModels.get(shutterUrl);
    if (cachedShutter) installShutter(cachedShutter);
    else if (THREE.GLTFLoader) new THREE.GLTFLoader().load(shutterUrl, gltf => installShutter(gltf.scene));

    box(room, 'Rodapié trasero', timber, ROOM_WIDTH - 0.15, 0.13, 0.055, 0.06, 0, BACK + 0.16);
    box(room, 'Dintel del portón', trim, 0.16, 0.15, ROOM_DEPTH - 0.16, LEFT + 0.17, WALL_HEIGHT - 0.15, 0.08);
    for (const z of [BACK + 0.19, -BACK - 0.05]) {
        box(room, 'Guía vertical del portón', trim, 0.15, WALL_HEIGHT, 0.10, LEFT + 0.17, 0, z);
    }

    // Wall-mounted window, notice board and framed arcade print.
    const wallFace = BACK + 0.141;
    const landscape = windowMap(THREE);
    const glass = new THREE.MeshStandardMaterial({
        map: landscape,
        emissive: 0xf2c18b,
        emissiveIntensity: 0.12,
        roughness: 0.48,
    });
    new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}textures/garage/lot-01.jpg`, texture => {
        texture.encoding = THREE.sRGBEncoding;
        glass.map = texture;
        glass.needsUpdate = true;
        landscape.dispose();
    });
    const oldWindowFrame = box(room, 'Marco de ventana', timber, 1.95, 0.84, 0.10, 2.74, 2.40, wallFace + 0.05);
    const windowView = plane(room, 'Cristal de ventana', glass, 1.77, 0.66, 2.74, 2.82, wallFace + 0.101);
    const oldWindowDivider = box(room, 'Parteluz', timber, 0.07, 0.68, 0.025, 2.74, 2.48, wallFace + 0.11);
    const oldWindowSill = box(room, 'Alféizar', timber, 2.03, 0.08, 0.22, 2.74, 2.39, wallFace + 0.11);
    const windowUrl = '/models/garage-window/window.glb';
    const installWindow = source => {
        for (const x of [2.25, 3.23]) {
            const frame = source.clone(true);
            frame.name = 'Ventana de madera';
            frame.scale.set(1.08, 0.53, 0.75);
            // The imported frame extends 0.105 units behind its origin.
            // Place that rear face against the brick after scaling its depth.
            frame.position.set(x, 2.40, wallFace + 0.105 * 0.75);
            room.add(frame);
        }
        windowView.position.z = wallFace + 0.002;
        oldWindowFrame.visible = false;
        oldWindowDivider.visible = false;
        oldWindowSill.visible = false;
    };
    const cachedWindow = preloadedModels.get(windowUrl);
    if (cachedWindow) installWindow(cachedWindow);
    else if (THREE.GLTFLoader) new THREE.GLTFLoader().load(windowUrl, gltf => installWindow(gltf.scene));

    const print = new THREE.MeshStandardMaterial({ map: world.createArcadePosterTexture(), roughness: 0.89 });
    const oldPosterFrame = box(room, 'Marco del póster', timber, 1.03, 1.39, 0.055, -2.67, 1.66, wallFace + 0.0275);
    const posterArt = plane(room, 'Póster de recreativa', print, 0.89, 1.25, -2.67, 2.355, wallFace + 0.056);
    const board = new THREE.MeshStandardMaterial({ map: world.createWhiteboardTexture(), roughness: 0.8 });
    const oldBoardFrame = box(room, 'Marco de la pizarra', timber, 1.85, 1.12, 0.060, -0.65, 1.79, wallFace + 0.03);
    const boardArt = plane(room, 'Planificación del estudio', board, 1.74, 1.01, -0.65, 2.35, wallFace + 0.061);
    const installDecor = (url, install) => {
        const cached = preloadedModels.get(url);
        if (cached) install(cached);
        else if (THREE.GLTFLoader) new THREE.GLTFLoader().load(url, gltf => install(gltf.scene));
    };
    installDecor('/models/garage-wall-decor/frame/frame.gltf', source => {
        const frame = source.clone(true);
        frame.traverse(object => {
            if (object.isMesh && /artwork|glass/i.test(object.material?.name || '')) object.visible = false;
        });
        frame.name = 'Marco del póster 3D';
        frame.scale.set(1.73, 1.65, 1);
        frame.position.set(-2.67, 2.355, wallFace + 0.002);
        room.add(frame);
        posterArt.position.z = wallFace + 0.012;
        oldPosterFrame.visible = false;
    });
    installDecor('/models/garage-wall-decor/whiteboard.glb', source => {
        const model = source.clone(true);
        model.name = 'Pizarra 3D';
        model.scale.set(0.925, 0.85, 1);
        model.position.set(-0.65, 1.79, wallFace + 0.002);
        room.add(model);
        // Keep the diagram inside the frame, behind its front edge.
        boardArt.scale.set(0.93, 0.88, 1);
        boardArt.position.set(-0.65, 2.35, wallFace + 0.065);
        oldBoardFrame.visible = false;
    });

    world.createDesk(-1.45, 0, 0.25, 'retro', 0);
    world.createDesk(1.45, 0, 0.25, 'retro', 1);

    // Keep the carton faces aligned and seat each box directly on the one below.
    const storage = new THREE.Group();
    storage.name = 'Archivo y material de mudanza';
    storage.position.set(-3.59, 0, -2.56);
    room.add(storage);
    const cardboard = [matte(0xad7c50), matte(0xbf9366), matte(0xb48359)];
    const tape = matte(0xd2b27d);
    const label = new THREE.MeshStandardMaterial({ map: labelMap(THREE), roughness: 0.94 });
    let level = 0;
    const sizes = [[0.94, 0.58, 0.96], [0.79, 0.46, 0.77], [0.58, 0.35, 0.56]];
    const boxPlaceholders = [];
    sizes.forEach(([w, h, d], index) => {
        const carton = new THREE.Group();
        carton.rotation.y = 0;
        carton.position.set([0, 0.022, -0.018][index], level, [0, -0.018, 0.014][index]);
        storage.add(carton);
        const placeholder = new THREE.Group();
        placeholder.name = 'Caja provisional';
        carton.add(placeholder);
        box(placeholder, 'Caja de cartón', cardboard[index], w, h, d, 0, 0, 0, true);
        plane(placeholder, 'Precinto', tape, 0.09, d, 0, h + 0.001, 0).rotation.x = -Math.PI / 2;
        plane(placeholder, 'Precinto transversal', tape, w, 0.07, 0, h + 0.002, 0).rotation.x = -Math.PI / 2;
        plane(placeholder, 'Etiqueta de archivo', label, 0.22, 0.11, w * 0.19, h * 0.64, d / 2 + 0.001);
        boxPlaceholders.push({ carton, placeholder, w, h, d });
        level += h;
    });
    if (THREE.GLTFLoader) {
        new THREE.GLTFLoader().load('/models/cardboard/polyfork-cardboard-delivery-box.glb', gltf => {
            if (!room.parent) return;
            const source = gltf.scene;
            // The published GLB defaults to the open state. Fold its four flap
            // groups into the creator's sealed pose before measuring or cloning it.
            const boardThickness = 0.013 + (0.006 - 0.013) * 0.65;
            let closedFlaps = 0;
            source.traverse(flap => {
                if (!['flap-front', 'flap-back', 'flap-left', 'flap-right'].includes(flap.name)) return;
                flap.rotation.set(0, 0, 0);
                flap.position.y = flap.name === 'flap-front' || flap.name === 'flap-back'
                    ? 0.30 + boardThickness * 2 + 0.005
                    : 0.30 + 0.0015;
                closedFlaps++;
            });
            if (closedFlaps !== 4) {
                console.warn('No se encontraron las cuatro solapas de la caja.');
                return;
            }
            const sourceBounds = new THREE.Box3().setFromObject(source);
            const sourceSize = sourceBounds.getSize(new THREE.Vector3());
            const sourceCenter = sourceBounds.getCenter(new THREE.Vector3());
            if (!sourceSize.x || !sourceSize.y || !sourceSize.z) return;
            for (const { carton, placeholder, w, h, d } of boxPlaceholders) {
                const model = source.clone(true);
                model.scale.set(w / sourceSize.x, h / sourceSize.y, d / sourceSize.z);
                model.position.set(-sourceCenter.x * model.scale.x, -sourceBounds.min.y * model.scale.y, -sourceCenter.z * model.scale.z);
                model.name = 'Caja de cartón cerrada';
                model.traverse(object => {
                    if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; }
                });
                carton.add(model);
                placeholder.visible = false;
            }
            world.nextShadowRefresh = 0;
        }, undefined, error => console.warn('No se pudo cargar el modelo de las cajas:', error));
    }

    const bin = new THREE.Group();
    bin.name = 'Papelera entre los escritorios';
    bin.position.set(0, 0, 0.36);
    room.add(bin);
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x555751, metalness: 0.35, roughness: 0.58 });
    const wire = new THREE.MeshStandardMaterial({ color: 0x626961, metalness: 0.35, roughness: 0.65, wireframe: true });
    mesh(bin, 'Base de la papelera', new THREE.CylinderGeometry(0.15, 0.15, 0.035, 12), darkMetal, 0, 0.0175, 0);
    mesh(bin, 'Rejilla', new THREE.CylinderGeometry(0.205, 0.15, 0.43, 12, 4, true), wire, 0, 0.25, 0);
    const rim = mesh(bin, 'Aro superior', new THREE.TorusGeometry(0.203, 0.014, 6, 16), darkMetal, 0, 0.465, 0);
    rim.rotation.x = -Math.PI / 2;
    const paper = matte(0xd5cbb4);
    for (const [x, z, radius] of [[-0.055, 0.04, 0.072], [0.057, -0.03, 0.075]]) {
        const geometry = new THREE.DodecahedronGeometry(radius, 0);
        geometry.computeBoundingBox();
        mesh(bin, 'Papel arrugado', geometry, paper, x, 0.035 - geometry.boundingBox.min.y, z);
    }

    // A short sideboard anchors the radio and brewing station under the window.
    const station = new THREE.Group();
    station.name = 'Estación de café y música';
    station.position.set(2.56, 0, -2.72);
    room.add(station);
    const cabinetFallback = new THREE.Group();
    station.add(cabinetFallback);
    box(cabinetFallback, 'Zócalo del aparador', trim, 1.76, 0.10, 0.55, 0, 0, 0);
    box(cabinetFallback, 'Aparador', timber, 1.88, 0.94, 0.63, 0, 0.10, 0, true);
    box(cabinetFallback, 'Encimera del aparador', timber, 1.99, 0.08, 0.72, 0, 1.04, 0, true);
    const drawer = matte(0x79553f);
    const brass = new THREE.MeshStandardMaterial({ color: 0xc2a06e, roughness: 0.63, metalness: 0.34 });
    for (const y of [0.18, 0.48, 0.78]) {
        box(cabinetFallback, 'Frente del cajón', drawer, 1.74, 0.23, 0.03, 0, y, 0.327);
        box(cabinetFallback, 'Tirador', brass, 0.18, 0.023, 0.035, 0, y + 0.10, 0.350);
    }

    const radio = new THREE.Group();
    radio.name = 'Radiocasete';
    radio.position.set(-0.49, 1.12, -0.035);
    station.add(radio);
    world.addRadio(station, -0.49, 1.12, -0.035);
    const radioBody = matte(0x464c48);
    const speaker = matte(0x292c29);
    const cassette = matte(0x8c7960);
    box(radio, 'Carcasa del radiocasete', radioBody, 0.77, 0.29, 0.21, 0, 0, 0);
    for (const x of [-0.24, 0.24]) {
        const cone = mesh(radio, 'Altavoz', new THREE.CylinderGeometry(0.097, 0.097, 0.014, 12), speaker, x, 0.135, 0.108);
        cone.rotation.x = Math.PI / 2;
        box(radio, 'Soporte del asa', brass, 0.035, 0.064, 0.026, x, 0.29, -0.02);
    }
    box(radio, 'Asa del radiocasete', brass, 0.51, 0.025, 0.026, 0, 0.354, -0.02);
    box(radio, 'Tapa del casete', cassette, 0.20, 0.11, 0.018, 0, 0.084, 0.110);
    box(radio, 'Dial de frecuencia', brass, 0.19, 0.024, 0.014, 0, 0.21, 0.109);

    const coffee = matte(0x7e3d33);
    const coffeeFallback = new THREE.Group();
    station.add(coffeeFallback);
    box(coffeeFallback, 'Bandeja de la cafetera', darkMetal, 0.34, 0.045, 0.33, 0.36, 1.12, -0.06);
    box(coffeeFallback, 'Depósito de la cafetera', coffee, 0.29, 0.42, 0.12, 0.36, 1.165, -0.16);
    box(coffeeFallback, 'Cabezal de la cafetera', coffee, 0.30, 0.11, 0.29, 0.36, 1.49, -0.07);
    const carafe = matte(0x594237);
    mesh(coffeeFallback, 'Jarra de café', new THREE.CylinderGeometry(0.090, 0.105, 0.20, 12), carafe, 0.36, 1.265, 0.02);
    const mug = matte(0xd5b78a);
    const mugFallback = new THREE.Group();
    station.add(mugFallback);
    mesh(mugFallback, 'Taza de cerámica', new THREE.CylinderGeometry(0.058, 0.049, 0.12, 12), mug, 0.73, 1.18, 0.14);
    mesh(mugFallback, 'Asa de la taza', new THREE.TorusGeometry(0.039, 0.009, 6, 12), mug, 0.783, 1.18, 0.14);
    world.coffeeMugPos = new THREE.Vector3(3.29, 1.24, -2.58);

    const props = [
        { url: '/models/garage-station/dresser.glb', name: 'Aparador', fallback: cabinetFallback, width: 1.88, height: 1.12, depth: 0.63, x: 0, y: 0, z: 0 },
        { url: '/models/garage-station/boombox.glb', name: 'Radiocasete', fallback: radio, width: 0.72, height: 0.45, depth: 0.21, x: -0.49, y: 1.12, z: -0.035 },
        { url: '/models/garage-station/coffee-maker.glb', name: 'Cafetera', fallback: coffeeFallback, width: 0.34, height: 0.48, depth: 0.33, x: 0.36, y: 1.12, z: -0.06 },
        { url: '/models/modern-office/taza.glb', name: 'Taza', fallback: mugFallback, width: 0.15, height: 0.12, depth: 0.13, x: 0.73, y: 1.12, z: 0.14 }
    ];
    if (THREE.GLTFLoader) {
        const loader = new THREE.GLTFLoader();
        for (const prop of props) {
            const install = source => {
                if (station.parent !== room) return;
                const model = source.clone(true);
                const bounds = new THREE.Box3().setFromObject(model);
                const size = bounds.getSize(new THREE.Vector3());
                const center = bounds.getCenter(new THREE.Vector3());
                if (!size.x || !size.y || !size.z) return;
                model.scale.set(prop.width / size.x, prop.height / size.y, prop.depth / size.z);
                model.position.set(prop.x - center.x * model.scale.x, prop.y - bounds.min.y * model.scale.y, prop.z - center.z * model.scale.z);
                model.name = prop.name;
                model.traverse(child => {
                    if (!child.isMesh) return;
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (prop.name === 'Radiocasete') {
                        const softenMaterial = material => {
                            const adjusted = material.clone();
                            if (adjusted.isMeshStandardMaterial) {
                                adjusted.metalness = Math.min(adjusted.metalness, 0.2);
                                adjusted.roughness = Math.max(adjusted.roughness, 0.65);
                                adjusted.emissive.setHex(0x555555);
                                adjusted.emissiveMap = adjusted.map;
                                adjusted.emissiveIntensity = 0.35;
                            }
                            return adjusted;
                        };
                        child.material = Array.isArray(child.material) ? child.material.map(softenMaterial) : softenMaterial(child.material);
                    }
                });
                station.add(model);
                prop.fallback.visible = false;
                world.nextShadowRefresh = 0;
            };
            const cached = preloadedModels.get(prop.url);
            if (cached) install(cached);
            else loader.load(prop.url, gltf => install(gltf.scene), undefined, error => console.warn(`No se pudo cargar ${prop.name}:`, error));
        }
    }

}
