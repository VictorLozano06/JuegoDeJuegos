import { createModernPeripherals } from './peripherals.js';

// The third studio has ten independent workstations, including the founder.
export function buildStudioThree(world, THREE) {
    const room = new THREE.Group();
    room.name = 'Estudio de desarrollo';
    world.officeGroup.add(room);
    const workstations = [];
    const plants = [];

    const material = (color, roughness = 0.8) => new THREE.MeshStandardMaterial({ color, roughness });
    const wall = material(0xe8e1d2);
    const wallDark = material(0x46675e);
    const wood = material(0xaa7950);
    const woodDark = material(0x745339);
    const metal = material(0x344a49);
    const white = material(0xf1ede3);
    const textile = material(0x978576);
    const black = material(0x273335);
    const leaf = material(0x5e8660);
    const leafLight = material(0x86a56e);
    const box = (parent, name, mat, size, position, shadow = false) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
        mesh.name = name;
        mesh.position.set(...position);
        mesh.castShadow = shadow;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
    };

    // Warm timber planks create scale without a heavy grid across the floor.
    box(room, 'Base de la oficina', woodDark, [19, .16, 18], [0, -.14, 0]);
    const floorMaterial = material(0xffffff);
    box(room, 'Suelo de madera', floorMaterial, [18.85, .08, 17.85], [0, -.02, 0]);
    box(room, 'Pared principal izquierda', wall, [6.2, 4.8, .22], [-6.4, 2.4, -8.9]);
    box(room, 'Pared principal derecha', wall, [6.2, 4.8, .22], [6.4, 2.4, -8.9]);
    box(room, 'Pared bajo ventana', wall, [6.6, 1.05, .22], [0, .525, -8.9]);
    box(room, 'Pared sobre ventana', wall, [6.6, .75, .22], [0, 4.425, -8.9]);
    box(room, 'Pared lateral', wall, [.22, 4.8, 6], [-9.4, 2.4, -5.9]);
    box(room, 'Rodapié', woodDark, [18.8, .16, .12], [0, .08, -8.75]);

    // The founder's alcove and side storage frame the working area.
    const cabinetFallback = new THREE.Group();
    room.add(cabinetFallback);
    box(cabinetFallback, 'Mueble de café', woodDark, [2.8, 1.1, .75], [6.5, .55, -8.18], true);
    box(cabinetFallback, 'Encimera', white, [2.9, .08, .84], [6.5, 1.14, -8.18]);
    for (const x of [5.6, 6.5, 7.4]) {
        box(cabinetFallback, 'Puerta del mueble', wood, [.84, .86, .04], [x, .55, -7.78]);
        box(cabinetFallback, 'Tirador', metal, [.18, .035, .035], [x, .85, -7.74]);
    }
    world.addRadio(room, 5.7, 1.2, -8.1, true);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.08, .065, .15, 10), white);
    cup.position.set(7.2, 1.25, -8.0);
    room.add(cup);
    world.coffeeMugPos = cup.position.clone().add(new THREE.Vector3(0, .08, 0));

    // Soft rugs define each team without isolating the workstations.
    for (const x of [-5.1, 0, 5.1]) box(room, 'Alfombra de equipo', textile, [3.4, .025, 10.5], [x, .035, .6]);
    box(room, 'Alfombra del fundador', textile, [3.7, .026, 2.7], [0, .035, -6.15]);

    // Low planters and a lounge occupy the edges while leaving aisles open.
    function plant(x, z, size = 1) {
        const placeholder = new THREE.Group();
        room.add(placeholder);
        plants.push({ x, z, size, placeholder });
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(.28 * size, .22 * size, .48 * size, 10), white);
        pot.position.set(x, .24 * size, z);
        pot.castShadow = true;
        placeholder.add(pot);
        for (let i = 0; i < 7; i++) {
            const angle = i * Math.PI * 2 / 7;
            const foliage = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), i % 2 ? leaf : leafLight);
            foliage.scale.set(.13 * size, .38 * size, .10 * size);
            foliage.position.set(x + Math.sin(angle) * .14 * size, (.68 + (i % 3) * .08) * size, z + Math.cos(angle) * .14 * size);
            foliage.rotation.z = Math.sin(angle) * .35;
            foliage.rotation.x = Math.cos(angle) * .35;
            placeholder.add(foliage);
        }
    }
    for (const [x, z, size] of [[-8.45, -7.4, 1.2], [8.45, -7.3, 1.15], [-8.35, 6.7, 1], [8.35, 6.7, 1]]) plant(x, z, size);

    for (const x of [-5.1, 0, 5.1]) {
        const lamp = new THREE.PointLight(0xffefd5, .75, 17, 1);
        lamp.name = 'Luz de trabajo';
        lamp.position.set(x, 5.4, 0);
        room.add(lamp);
    }

    const slots = [{ x: 0, z: -6.6, role: 'founder' }];
    for (const z of [-3.2, .45, 4.1]) {
        for (const x of [-5.1, 0, 5.1]) slots.push({ x, z, role: 'employee' });
    }
    slots.forEach((slot, index) => {
        const desk = new THREE.Group();
        desk.name = slot.role === 'founder' ? 'Puesto del fundador' : `Puesto de equipo ${index}`;
        desk.position.set(slot.x, 0, slot.z);
        const width = slot.role === 'founder' ? 2.65 : 2.3;
        const deskFallback = new THREE.Group();
        desk.add(deskFallback);
        box(deskFallback, 'Tablero de madera', wood, [width, .1, 1.2], [0, 1.35, 0], true);
        for (const x of [-width / 2 + .13, width / 2 - .13]) {
            for (const z of [-.43, .43]) box(deskFallback, 'Pata de mesa', metal, [.07, 1.3, .07], [x, .65, z], true);
        }
        const frame = box(desk, 'Marco del monitor', black, [1.1, .61, .07], [0, 1.8, -.33]);
        const stand = box(desk, 'Soporte del monitor', metal, [.08, .22, .08], [0, 1.5, -.33]);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.02, .53),
            new THREE.MeshBasicMaterial({ map: world.createAnimatedMonitorCanvas('code') }));
        screen.name = 'Pantalla de desarrollo';
        screen.position.set(0, 1.8, -.29);
        desk.add(screen);
        const peripherals = createModernPeripherals(THREE, { tabletop: 1.4 });
        desk.add(peripherals);

        const chair = world.createChair(0x435e55);
        chair.name = 'Silla de trabajo';
        chair.position.z = .85;
        desk.add(chair);
        workstations.push({ desk, deskFallback, width, chair, frame, stand, screen, peripherals });
        world.registerDesk(desk, index, { id: slot.role === 'founder' ? 'founder' : `team-${index}`, role: slot.role }, room);
        world.monitors[index] = { mesh: screen, lightPos: screen.getWorldPosition(new THREE.Vector3()) };
    });

    if (!THREE.GLTFLoader) return;
    const loader = new THREE.GLTFLoader(world.officeAssetManager);
    const textures = new THREE.TextureLoader(world.officeAssetManager);
    for (const [target, name, repeat] of [[floorMaterial, 'wood_floor', 8], [wall, 'white_plaster_02', 4]]) {
        for (const [suffix, property] of [['diff', 'map'], ['nor_gl', 'normalMap']]) {
            textures.load(`/models/studio-three/${name}-${suffix}.jpg`, texture => {
                if (!room.parent) { texture.dispose(); return; }
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(repeat, repeat);
                if (property === 'map') texture.encoding = THREE.sRGBEncoding;
                target[property] = texture;
                target.color.setHex(0xffffff);
                target.needsUpdate = true;
            });
        }
    }
    for (const [suffix, property] of [['diff', 'map'], ['normal', 'normalMap']]) {
        textures.load(`/models/studio-three/rug-${suffix}.jpg`, texture => {
            if (!room.parent) { texture.dispose(); return; }
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 8);
            if (property === 'map') texture.encoding = THREE.sRGBEncoding;
            textile[property] = texture;
            textile.needsUpdate = true;
        });
    }
    const fit = (source, width, height, depth) => {
        const model = source.clone(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        if (!size.x || !size.y || !size.z) throw new Error('Modelo de oficina sin dimensiones válidas.');
        model.scale.set(width / size.x, height / size.y, depth / size.z);
        model.position.set(-center.x * model.scale.x, -bounds.min.y * model.scale.y, -center.z * model.scale.z);
        model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
        return model;
    };
    loader.load('/models/garage-window/window.glb', gltf => {
        if (!room.parent) return;
        for (const x of [-2.475, -.825, .825, 2.475]) {
            const model = fit(gltf.scene, 1.65, 3, .18);
            model.name = 'Ventana panorámica';
            model.position.add(new THREE.Vector3(x, 1.05, -8.86));
            room.add(model);
        }
        world.nextShadowRefresh = 0;
    });
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(6.58, 2.98),
        new THREE.MeshBasicMaterial({ color: 0x9abcc1, side: THREE.DoubleSide }));
    sky.name = 'Vista exterior';
    sky.position.set(0, 2.55, -9.03);
    room.add(sky);
    loader.load('/models/garage-station/dresser.glb', gltf => {
        if (!room.parent) return;
        const model = fit(gltf.scene, 2.8, 1.18, .75);
        model.name = 'Armario de oficina';
        model.position.add(new THREE.Vector3(6.5, 0, -8.18));
        room.add(model);
        cabinetFallback.visible = false;
        world.nextShadowRefresh = 0;
    });
    if (typeof document !== 'undefined') {
        for (const [index, x] of [-5.6, 6.5].entries()) {
            const canvas = document.createElement('canvas');
            canvas.width = 768;
            canvas.height = 432;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#15262b'; ctx.fillRect(0, 0, 768, 432);
            ctx.fillStyle = '#acc5b4'; ctx.font = '600 22px sans-serif';
            ctx.fillText(index ? 'IDEAS DE EQUIPO' : 'PROYECTOS EN CURSO', 40, 48);
            ctx.fillStyle = '#4c6a64'; ctx.fillRect(40, 66, 688, 2);
            const columns = index ? ['IDEAS', 'PROTOTIPOS', 'SIGUIENTE'] : ['PLANIFICADO', 'EN CURSO', 'COMPLETADO'];
            columns.forEach((title, col) => {
                const left = 40 + col * 231;
                ctx.fillStyle = '#9bb7ad'; ctx.font = '600 15px sans-serif'; ctx.fillText(title, left, 105);
                for (let row = 0; row < (col === 1 ? 2 : 3); row++) {
                    const top = 123 + row * 84;
                    ctx.fillStyle = ['#345047', '#51483e', '#3d5154'][(col + row + index) % 3];
                    ctx.fillRect(left, top, 207, 68);
                    ctx.fillStyle = '#b6c8b9'; ctx.fillRect(left + 12, top + 14, 68 + row * 12, 4);
                    ctx.fillStyle = '#76918a'; ctx.fillRect(left + 12, top + 31, 155, 3);
                    ctx.fillRect(left + 12, top + 43, 110, 3);
                }
            });
            const map = new THREE.CanvasTexture(canvas);
            map.encoding = THREE.sRGBEncoding;
            box(room, 'Marco del panel de equipo', black, [2.9, 1.68, .10], [x, 2.72, -8.68]);
            const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.73, 1.52), new THREE.MeshBasicMaterial({ map }));
            panel.name = 'Panel de equipo';
            panel.position.set(x, 2.72, -8.62);
            room.add(panel);
        }
    }
    loader.load('/models/modern-office/planta.glb', gltf => {
        if (!room.parent) return;
        for (const plant of plants) {
            const model = fit(gltf.scene, .72 * plant.size, 1.2 * plant.size, .72 * plant.size);
            model.position.x += plant.x;
            model.position.z += plant.z;
            room.add(model);
            plant.placeholder.visible = false;
        }
        world.nextShadowRefresh = 0;
    });
    for (const type of ['chair', 'desk']) {
        loader.load(`/models/studio-three/${type}.glb`, gltf => {
            if (!room.parent) return;
            const batches = [];
            for (const [index, station] of workstations.entries()) {
                const chair = type === 'chair';
                const model = fit(gltf.scene, chair ? .83 : station.width, chair ? 1.53 : 1.4, chair ? .83 : 1.2);
                const placement = new THREE.Group();
                if (chair) {
                    placement.position.z = .85;
                    placement.rotation.y = Math.PI;
                }
                placement.add(model);
                placement.updateMatrixWorld(true);
                station.desk.updateMatrix();
                let meshIndex = 0;
                model.traverse(child => {
                    if (!child.isMesh) return;
                    if (!batches[meshIndex]) {
                        const material = Array.isArray(child.material)
                            ? child.material.map(item => item.clone()) : child.material.clone();
                        const batch = new THREE.InstancedMesh(child.geometry.clone(), material, workstations.length);
                        batch.name = chair ? 'Sillas ergonómicas' : 'Escritorios de nogal';
                        batch.castShadow = batch.receiveShadow = true;
                        batch.frustumCulled = false;
                        room.add(batch);
                        batches[meshIndex] = batch;
                    }
                    const matrix = new THREE.Matrix4().multiplyMatrices(station.desk.matrix, child.matrixWorld);
                    batches[meshIndex++].setMatrixAt(index, matrix);
                });
                if (chair) station.chair.visible = false;
                else station.deskFallback.visible = false;
            }
            for (const batch of batches) {
                batch.instanceMatrix.needsUpdate = true;
            }
            world.nextShadowRefresh = 0;
        });
    }
    for (const spec of [
        { file: 'monitor', width: 1.1, height: .70, depth: .25, x: 0, z: -.33 },
        { file: 'teclado-nuevo', width: .74, height: .06, depth: .255, x: 0, z: .39 },
        { file: 'raton-nuevo', width: .095, height: .048, depth: .14, x: .64, z: .30 }
    ]) {
        loader.load(`/models/modern-office/${spec.file}.glb`, gltf => {
            if (!room.parent) return;
            for (const station of workstations) {
                const model = fit(gltf.scene, spec.width, spec.height, spec.depth);
                model.position.add(new THREE.Vector3(spec.x, 1.4, spec.z));
                station.desk.add(model);
                if (spec.file === 'monitor') {
                    station.frame.visible = station.stand.visible = false;
                    station.desk.updateWorldMatrix(true, true);
                    let display;
                    model.traverse(child => { if (child.isMesh && child.material?.name === 'screen') display = child; });
                    if (!display) throw new Error('El monitor no contiene una superficie de pantalla.');
                    const bounds = new THREE.Box3().setFromObject(display);
                    const center = station.desk.worldToLocal(bounds.getCenter(new THREE.Vector3()));
                    const size = bounds.getSize(new THREE.Vector3());
                    station.screen.position.set(center.x, center.y, center.z + size.z / 2 + .003);
                    station.screen.scale.set(size.x * .98 / 1.02, size.y * .98 / .53, 1);
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
}
