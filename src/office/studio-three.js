import { createModernPeripherals } from './peripherals.js';

// The third studio has ten independent workstations, including the founder.
export function buildStudioThree(world, THREE) {
    const room = new THREE.Group();
    room.name = 'Estudio de desarrollo';
    world.officeGroup.add(room);

    const material = (color, roughness = 0.8) => new THREE.MeshStandardMaterial({ color, roughness });
    const wall = material(0xe8e1d2);
    const wallDark = material(0x46675e);
    const wood = material(0xaa7950);
    const woodDark = material(0x745339);
    const metal = material(0x344a49);
    const white = material(0xf1ede3);
    const textile = material(0x566d63);
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
    box(room, 'Suelo de madera', wood, [18.85, .08, 17.85], [0, -.02, 0]);
    for (let x = -9; x <= 9; x += .75) {
        box(room, 'Junta de madera', woodDark, [.012, .005, 17.8], [x, .024, 0]);
    }
    box(room, 'Pared principal', wall, [19, 4.8, .22], [0, 2.4, -8.9]);
    box(room, 'Pared lateral', wall, [.22, 4.8, 6], [-9.4, 2.4, -5.9]);
    box(room, 'Rodapié', woodDark, [18.8, .16, .12], [0, .08, -8.75]);

    // The founder's alcove and side storage frame the working area.
    box(room, 'Panel del fundador', wallDark, [5.2, 2.8, .12], [0, 2.55, -8.72]);
    for (let x = -2.3; x <= 2.3; x += .42) {
        box(room, 'Listón acústico', woodDark, [.08, 2.55, .08], [x, 2.55, -8.62]);
    }
    box(room, 'Panel de proyectos', white, [3.1, 1.55, .12], [-5.6, 2.65, -8.68]);
    box(room, 'Línea de pizarra', wallDark, [2.7, .045, .025], [-5.6, 3.0, -8.6]);
    for (let i = 0; i < 4; i++) {
        box(room, 'Nota de proyecto', i % 2 ? wood : wallDark, [.42, .28, .025], [-6.55 + i * .62, 2.45, -8.59]);
    }
    box(room, 'Mueble de café', woodDark, [2.8, 1.1, .75], [6.5, .55, -8.18], true);
    box(room, 'Encimera', white, [2.9, .08, .84], [6.5, 1.14, -8.18]);
    for (const x of [5.6, 6.5, 7.4]) {
        box(room, 'Puerta del mueble', wood, [.84, .86, .04], [x, .55, -7.78]);
        box(room, 'Tirador', metal, [.18, .035, .035], [x, .85, -7.74]);
    }
    world.addRadio(room, 5.7, 1.2, -8.1, true);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.08, .065, .15, 10), white);
    cup.position.set(7.2, 1.25, -8.0);
    room.add(cup);
    world.coffeeMugPos = cup.position.clone().add(new THREE.Vector3(0, .08, 0));

    // Soft rugs define each team without isolating the workstations.
    for (const x of [-5.1, 0, 5.1]) {
        box(room, 'Alfombra de equipo', textile, [3.35, .025, 10.55], [x, .035, .55]);
    }
    box(room, 'Alfombra del fundador', wallDark, [3.7, .026, 2.7], [0, .035, -6.15]);

    // Low planters and a lounge occupy the edges while leaving aisles open.
    function plant(x, z, size = 1) {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(.28 * size, .22 * size, .48 * size, 10), white);
        pot.position.set(x, .24 * size, z);
        pot.castShadow = true;
        room.add(pot);
        for (let i = 0; i < 7; i++) {
            const angle = i * Math.PI * 2 / 7;
            const foliage = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), i % 2 ? leaf : leafLight);
            foliage.scale.set(.13 * size, .38 * size, .10 * size);
            foliage.position.set(x + Math.sin(angle) * .14 * size, (.68 + (i % 3) * .08) * size, z + Math.cos(angle) * .14 * size);
            foliage.rotation.z = Math.sin(angle) * .35;
            foliage.rotation.x = Math.cos(angle) * .35;
            room.add(foliage);
        }
    }
    for (const [x, z, size] of [[-8.45, -7.4, 1.2], [8.45, -7.3, 1.15], [-8.35, 6.7, 1], [8.35, 6.7, 1]]) plant(x, z, size);
    box(room, 'Banco de descanso', woodDark, [2.5, .35, .8], [-7.1, .4, 7.6], true);
    box(room, 'Cojín de descanso', textile, [2.4, .17, .72], [-7.1, .65, 7.6]);
    box(room, 'Mesa baja', wood, [1.5, .12, .75], [7.1, .55, 7.5], true);
    for (const x of [6.5, 7.7]) box(room, 'Pata de mesa baja', metal, [.08, .5, .08], [x, .25, 7.5]);

    for (const x of [-5.1, 0, 5.1]) {
        const lamp = new THREE.PointLight(0xffefd5, .75, 17, 1);
        lamp.name = 'Luz de trabajo';
        lamp.position.set(x, 5.4, 0);
        room.add(lamp);
    }

    const slots = [{ x: 0, z: -6.6, role: 'founder' }];
    for (const z of [-3.1, .35, 3.8]) {
        for (const x of [-5.1, 0, 5.1]) slots.push({ x, z, role: 'employee' });
    }
    slots.forEach((slot, index) => {
        const desk = new THREE.Group();
        desk.name = slot.role === 'founder' ? 'Puesto del fundador' : `Puesto de equipo ${index}`;
        desk.position.set(slot.x, 0, slot.z);
        const width = slot.role === 'founder' ? 2.65 : 2.3;
        box(desk, 'Tablero de madera', wood, [width, .1, 1.2], [0, 1.35, 0], true);
        for (const x of [-width / 2 + .13, width / 2 - .13]) {
            for (const z of [-.43, .43]) box(desk, 'Pata de mesa', metal, [.07, 1.3, .07], [x, .65, z], true);
        }
        box(desk, 'Marco del monitor', black, [1.1, .61, .07], [0, 1.8, -.33]);
        box(desk, 'Soporte del monitor', metal, [.08, .22, .08], [0, 1.5, -.33]);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.02, .53),
            new THREE.MeshBasicMaterial({ map: world.createAnimatedMonitorCanvas('code') }));
        screen.name = 'Pantalla de desarrollo';
        screen.position.set(0, 1.8, -.29);
        desk.add(screen);
        desk.add(createModernPeripherals(THREE, { tabletop: 1.4 }));

        const chair = world.createChair(0x435e55);
        chair.name = 'Silla de trabajo';
        chair.position.z = .85;
        desk.add(chair);
        world.registerDesk(desk, index, { id: slot.role === 'founder' ? 'founder' : `team-${index}`, role: slot.role }, room);
        world.monitors[index] = { mesh: screen, lightPos: screen.getWorldPosition(new THREE.Vector3()) };
    });
}
