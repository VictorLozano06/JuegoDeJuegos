/**
 * Build a complete retro workstation in desk-local coordinates. All opaque
 * parts that share a finish and shadow policy are baked into a single mesh.
 * The animated CRT screen and the lamp light remain separate scene objects.
 */
export function createRetroWorkstation(THREE, { index, screenTexture, chair }) {
    const group = new THREE.Group();
    group.name = `workstation_${index + 1}`;
    const batches = new Map();
    const worldUp = new THREE.Vector3(0, 1, 0);

    const wood = { roughness: 0.85, metalness: 0 };
    const plastic = { roughness: 0.8, metalness: 0 };
    const enamel = { roughness: 0.62, metalness: 0.18 };
    const lit = { basic: true };
    const honey = 0x97603b;
    const walnut = 0x63402d;
    const ivory = 0xd5c2a0;
    const taupe = 0xa89776;
    const charcoal = 0x302f29;
    const lampColor = index === 0 ? 0xa14d32 : 0x356260;

    function part(geometry, color, finish, center, casts = false, rotation = null) {
        if (rotation) {
            geometry.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(rotation));
        }
        geometry.translate(...center);

        let finishes = batches.get(finish);
        if (!finishes) {
            finishes = new Map();
            batches.set(finish, finishes);
        }
        if (!finishes.has(casts)) finishes.set(casts, []);
        finishes.get(casts).push({ geometry, color: new THREE.Color(color) });
    }

    function box(size, center, color, finish = plastic, casts = false) {
        part(new THREE.BoxGeometry(...size), color, finish, center, casts);
    }

    // Extrude a rectangular panel with a small chamfer around its front and back.
    function bevelBox([width, height, depth], center, radius, color, finish = plastic) {
        const x = width / 2 - radius;
        const y = height / 2 - radius;
        const shape = new THREE.Shape();
        shape.moveTo(-x, -y);
        shape.lineTo(x, -y);
        shape.lineTo(x, y);
        shape.lineTo(-x, y);
        shape.closePath();
        const thickness = depth - 2 * radius;
        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: thickness, steps: 1, bevelEnabled: true, bevelSize: radius,
            bevelThickness: radius, bevelSegments: 1,
        });
        geometry.translate(0, 0, -thickness / 2);
        part(geometry, color, finish, center, true);
    }

    function cylinder(top, bottom, height, center, color, finish = enamel, casts = false, rotation = null) {
        part(new THREE.CylinderGeometry(top, bottom, height, 12), color, finish, center, casts, rotation);
    }

    function rod(from, to, radius, color, finish, casts = false) {
        const start = new THREE.Vector3(...from);
        const end = new THREE.Vector3(...to);
        const axis = end.clone().sub(start);
        const rotation = new THREE.Quaternion().setFromUnitVectors(worldUp, axis.clone().normalize());
        cylinder(radius, radius, axis.length(), start.lerp(end, 0.5).toArray(), color, finish, casts, rotation);
    }

    // Timber top at y=1.40; feet and cross braces share one wood batch.
    bevelBox([2.30, 0.12, 1.20], [0, 1.34, 0], 0.025, honey, wood);
    for (const x of [-1.0, 1.0]) {
        for (const z of [-0.46, 0.46]) {
            box([0.105, 1.28, 0.105], [x, 0.64, z], walnut, wood, true);
        }
        box([0.09, 0.10, 0.94], [x, 1.19, 0], honey, wood, true);
    }
    box([2.05, 0.13, 0.09], [0, 0.91, -0.46], walnut, wood, true);
    box([1.92, 0.12, 0.09], [0, 1.20, -0.48], honey, wood, true);
    for (const z of [-0.555, 0.555]) {
        box([2.20, 0.025, 0.008], [0, 1.325, z + Math.sign(z) * 0.044], 0xb4794d, wood);
    }
    cylinder(0.045, 0.045, 0.006, [-0.68, 1.403, -0.47], charcoal, plastic);
    box([0.49, 0.062, 0.085], [-0.60, 1.24, -0.47], charcoal);
    const lead = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.43, 1.47, -0.35),
        new THREE.Vector3(-0.55, 1.416, -0.42),
        new THREE.Vector3(-0.68, 1.407, -0.47),
    ]);
    part(new THREE.TubeGeometry(lead, 8, 0.008, 5, false), charcoal, plastic, [0, 0, 0]);

    // Stacked external floppy drive and CRT with shallow chamfers and vents.
    bevelBox([0.96, 0.16, 0.55], [0, 1.48, -0.27], 0.016, taupe);
    box([0.79, 0.104, 0.009], [0, 1.48, 0.009], ivory);
    box([0.46, 0.016, 0.006], [-0.075, 1.487, 0.016], charcoal);
    box([0.075, 0.032, 0.008], [0.208, 1.48, 0.016], charcoal);
    box([0.028, 0.012, 0.008], [0.332, 1.477, 0.016], 0x76bf70, lit);
    box([0.092, 0.014, 0.008], [-0.309, 1.449, 0.016], 0x7a5440);

    bevelBox([0.88, 0.61, 0.53], [0, 1.865, -0.27], 0.044, ivory);
    bevelBox([0.77, 0.50, 0.07], [0, 1.873, 0.007], 0.023, taupe);
    box([0.685, 0.405, 0.014], [0, 1.885, 0.043], charcoal);
    for (let i = 0; i < 10; i++) {
        box([0.032, 0.006, 0.135], [-0.236 + i * 0.052, 2.171, -0.31], 0x79715c);
    }
    box([0.024, 0.011, 0.005], [0.31, 1.64, 0.0435], 0x9fc561, lit);

    // Curve the CRT surface while keeping the procedural canvas UVs.
    const screenGeometry = new THREE.PlaneGeometry(0.635, 0.355, 12, 8);
    const screenVertices = screenGeometry.getAttribute('position');
    for (let i = 0; i < screenVertices.count; i++) {
        const x = screenVertices.getX(i) / 0.3175;
        const y = screenVertices.getY(i) / 0.1775;
        screenVertices.setZ(i, 0.018 * (1 - (x * x + y * y) * 0.48));
    }
    screenGeometry.computeVertexNormals();
    const screen = new THREE.Mesh(screenGeometry, new THREE.MeshBasicMaterial({ map: screenTexture }));
    screen.name = 'curved_crt_screen';
    screen.position.set(0, 1.885, 0.052);
    screen.receiveShadow = true;
    group.add(screen);

    // Hands sit over the key field in both office eras at y=1.44.
    bevelBox([0.76, 0.024, 0.30], [0, 1.412, 0.42], 0.007, taupe);
    for (let row = 0; row < 3; row++) {
        for (let key = 0; key < 13; key++) {
            box([0.041, 0.016, 0.043], [-0.316 + key * 0.052, 1.432, 0.318 + row * 0.055],
                key === 0 || key === 12 ? 0x726350 : ivory);
        }
    }
    box([0.31, 0.016, 0.039], [0, 1.432, 0.491], ivory);
    for (const x of [-0.25, 0.25]) box([0.12, 0.016, 0.039], [x, 1.432, 0.491], 0x726350);

    box([0.245, 0.008, 0.24], [0.61, 1.404, 0.393], 0x535e58);
    bevelBox([0.089, 0.047, 0.125], [0.61, 1.4315, 0.39], 0.011, ivory);
    box([0.007, 0.002, 0.047], [0.61, 1.456, 0.36], taupe);
    box([0.009, 0.004, 0.016], [0.61, 1.458, 0.372], charcoal);
    const mouseLead = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.61, 1.425, 0.326),
        new THREE.Vector3(0.62, 1.409, 0.25),
        new THREE.Vector3(0.55, 1.409, 0.16),
        new THREE.Vector3(0.50, 1.409, 0.07),
    ]);
    part(new THREE.TubeGeometry(mouseLead, 12, 0.004, 5, false), charcoal, plastic, [0, 0, 0]);

    // Porcelain coffee cup with a small torus handle.
    cylinder(0.067, 0.053, 0.104, [-0.78, 1.452, 0.37], 0xddd0ad, plastic, true);
    cylinder(0.059, 0.059, 0.003, [-0.78, 1.5048, 0.37], 0x4b2f23, plastic);
    part(new THREE.TorusGeometry(0.036, 0.010, 5, 10), 0xddd0ad, plastic, [-0.85, 1.454, 0.37]);

    // Connected Anglepoise: two arm segments share physical hinges with the base and shade.
    const base = [0.86, 1.422, -0.35];
    cylinder(0.115, 0.143, 0.044, base, lampColor, enamel, true);
    const shoulder = [0.86, 1.50, -0.35];
    const elbow = [0.93, 1.84, -0.39];
    const shadeHinge = [0.68, 2.02, -0.11];
    rod([0.86, 1.44, -0.35], shoulder, 0.035, lampColor, enamel, true);
    rod(shoulder, elbow, 0.017, lampColor, enamel, true);
    rod(elbow, shadeHinge, 0.017, lampColor, enamel, true);
    const hingeAxis = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    for (const hinge of [shoulder, elbow, shadeHinge]) {
        cylinder(0.036, 0.036, 0.052, hinge, 0x40392e, enamel, true, hingeAxis);
    }

    const towardKeys = new THREE.Vector3(0.27, 1.44, 0.38).sub(new THREE.Vector3(...shadeHinge)).normalize();
    const shadeRotation = new THREE.Quaternion().setFromUnitVectors(worldUp, towardKeys.clone().negate());
    const shadeCenter = new THREE.Vector3(...shadeHinge).addScaledVector(towardKeys, 0.066);
    part(new THREE.CylinderGeometry(0.042, 0.128, 0.132, 16, 1, true),
        lampColor, enamel, shadeCenter.toArray(), true, shadeRotation);
    cylinder(0.043, 0.047, 0.012, shadeHinge, lampColor, enamel, true, shadeRotation);
    cylinder(0.103, 0.103, 0.008, shadeCenter.clone().addScaledVector(towardKeys, 0.049).toArray(),
        0xffd99a, lit, false, shadeRotation);
    const lampLight = new THREE.PointLight(0xffbc72, 1.4, 2.4);
    lampLight.name = 'flexo_bulb';
    lampLight.position.copy(shadeCenter).addScaledVector(towardKeys, 0.057);
    group.add(lampLight);

    // Bake rigid parts per finish and shadow policy. Preserve the authored normals.
    for (const [finish, shadows] of batches) {
        for (const [casts, parts] of shadows) {
            const positions = [];
            const normals = [];
            const colors = [];
            for (const { geometry, color } of parts) {
                const position = geometry.getAttribute('position');
                const normal = geometry.getAttribute('normal');
                const index = geometry.getIndex();
                const length = index ? index.count : position.count;
                for (let i = 0; i < length; i++) {
                    const vertex = index ? index.getX(i) : i;
                    positions.push(position.getX(vertex), position.getY(vertex), position.getZ(vertex));
                    normals.push(normal.getX(vertex), normal.getY(vertex), normal.getZ(vertex));
                    colors.push(color.r, color.g, color.b);
                }
                geometry.dispose();
            }
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            const material = finish.basic
                ? new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })
                : new THREE.MeshStandardMaterial({ ...finish, vertexColors: true });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = casts ? 'shadow_casting_hardware' : 'surface_details';
            mesh.castShadow = casts;
            mesh.receiveShadow = true;
            group.add(mesh);
        }
    }

    chair.name = 'workstation_chair';
    chair.position.set(0, 0, 0.85);
    chair.traverse(object => {
        if (object.isMesh) object.receiveShadow = true;
    });
    group.add(chair);
    return { group, screen };
}
