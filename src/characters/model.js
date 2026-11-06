const SHIRTS = [0x2563eb, 0xad3552, 0x168570, 0x7c3aed, 0xba6526, 0xb34287];
const HAIR = [0x2a1a17, 0x853b24, 0x211f2b, 0x674229, 0x39282b];
const SKIN = [0xffdfc4, 0xb97758, 0xe8b08a, 0x8f563e, 0xf2c8a1];
const HAIRSTYLES = ['mop', 'short', 'curly', 'ponytail', 'quiff'];

function appearanceSeed(employee, index) {
    let seed = 2166136261;
    for (const character of String(employee.id ?? employee.name ?? index)) {
        seed = Math.imul(seed ^ character.codePointAt(0), 16777619);
    }
    return seed >>> 0;
}

function defaultAccessory(role = '') {
    if (/diseñ|artist|creativ|guion/i.test(role)) return 'glasses_modern';
    if (/program|ingenier|desarroll|sonido|músic/i.test(role)) return 'headphones';
    return 'none';
}

/**
 * The actor sits in chair space, with the floor at y=0 and the desk toward -Z.
 * Each arm uses shoulder > elbow > wrist, pointing down local -Y along each
 * segment in its rest pose. The face anchor instead faces out along local +Z.
 */
export function createEmployeeModel(THREE, employee = {}, index = 0) {
    const seed = appearanceSeed(employee, index);
    const customization = employee.customization ?? {};
    const skinColor = customization.skin ?? SKIN[seed % SKIN.length];
    const hairColor = customization.hairColor ?? HAIR[(seed >>> 5) % HAIR.length];
    const shirtColor = customization.shirtColor ?? SHIRTS[(seed >>> 10) % SHIRTS.length];
    const pantsColor = customization.pantsColor ?? 0x29354a;
    const hairStyle = customization.hairStyle ?? HAIRSTYLES[(seed >>> 16) % HAIRSTYLES.length];
    const shirtStyle = customization.shirtStyle ?? ['tshirt', 'flannel', 'hoodie'][(seed >>> 21) % 3];
    const accessory = customization.accessory ?? defaultAccessory(employee.role);

    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        vertexColors: true,
        roughness: 0.7,
        metalness: 0.1,
    });
    const geometries = [];
    const batches = new Map();
    const down = new THREE.Vector3(0, -1, 0);
    const shade = (color, multiplier) => new THREE.Color(color).multiplyScalar(multiplier);

    function pivot(parent, x, y, z) {
        const joint = new THREE.Group();
        joint.position.set(x, y, z);
        parent.add(joint);
        return joint;
    }

    function piece(parent, geometry, color, x, y, z) {
        geometry.translate(x, y, z);
        if (!batches.has(parent)) batches.set(parent, []);
        batches.get(parent).push({ geometry, color: new THREE.Color(color) });
    }

    function ball(parent, color, x, y, z, rx, ry, rz, tilt = 0) {
        const isDetail = Math.max(rx, ry, rz) < 0.075;
        const geometry = new THREE.SphereGeometry(1, isDetail ? 8 : 10, isDetail ? 5 : 7);
        geometry.scale(rx, ry, rz);
        geometry.rotateZ(tilt);
        piece(parent, geometry, color, x, y, z);
    }

    function beam(parent, color, start, end, startRadius, endRadius = startRadius) {
        const a = new THREE.Vector3(...start);
        const b = new THREE.Vector3(...end);
        const axis = b.clone().sub(a);
        const geometry = new THREE.CylinderGeometry(startRadius, endRadius, axis.length(), 8);
        const rotation = new THREE.Quaternion().setFromUnitVectors(down, axis.normalize());
        geometry.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(rotation));
        const center = a.add(b).multiplyScalar(0.5);
        piece(parent, geometry, color, center.x, center.y, center.z);
    }

    function ring(parent, color, x, y, z, radius, tube, scaleX = 1, scaleY = 1, arc = Math.PI * 2) {
        const geometry = new THREE.TorusGeometry(radius, tube, 5, 16, arc);
        geometry.scale(scaleX, scaleY, 1);
        piece(parent, geometry, color, x, y, z);
    }

    function taperedBody(parent, color, points, depthRatio, y, z) {
        const profile = points.map(([radius, height]) => new THREE.Vector2(radius, height));
        const geometry = new THREE.LatheGeometry(profile, 14);
        geometry.scale(1, 1, depthRatio);
        piece(parent, geometry, color, 0, y, z);
    }

    // Bake the forward thighs, flexed shins and flat shoes into a single
    // seated mesh. The pelvis is the rig root so a pose can move it as a unit.
    const pelvis = pivot(group, 0, 0.87, 0.008);
    const inPelvis = (x, y, z) => [x, y - pelvis.position.y, z - pelvis.position.z];
    ball(pelvis, pantsColor, 0, 0, 0, 0.19, 0.09, 0.141);
    for (const side of [-1, 1]) {
        const hip = inPelvis(side * 0.115, 0.865, -0.012);
        const knee = inPelvis(side * 0.139, 0.835, -0.347);
        const ankle = inPelvis(side * 0.144, 0.1, -0.414);
        beam(pelvis, pantsColor, hip, knee, 0.085, 0.071);
        ball(pelvis, pantsColor, ...knee, 0.072, 0.075, 0.074);
        beam(pelvis, pantsColor, knee, ankle, 0.071, 0.052);
        ball(pelvis, 0x292a35, ...inPelvis(side * 0.144, 0.068, -0.456), 0.064, 0.058, 0.115);
        ball(pelvis, 0x777781, ...inPelvis(side * 0.144, 0.023, -0.471), 0.065, 0.023, 0.116);
    }

    const torso = pivot(pelvis, ...inPelvis(0, 0.885, 0.015));
    const collarColor = shade(shirtColor, 0.62);
    const sleeveColor = shade(shirtColor, 0.8);
    taperedBody(torso, shirtColor, [
        [0, 0], [0.15, 0.008], [0.172, 0.11], [0.175, 0.26],
        [0.208, 0.49], [0.215, 0.56], [0.19, 0.625], [0.095, 0.662], [0, 0.664],
    ], 0.64, 0, 0);
    ball(torso, collarColor, 0, 0.652, -0.004, 0.106, 0.033, 0.078);
    ball(torso, skinColor, 0, 0.683, -0.008, 0.067, 0.082, 0.062);

    if (shirtStyle === 'hoodie') {
        ball(torso, collarColor, 0, 0.617, 0.096, 0.138, 0.071, 0.076);
        for (const side of [-1, 1]) {
            beam(torso, 0xddd2bb, [side * 0.041, 0.59, -0.123], [side * 0.048, 0.447, -0.137], 0.007);
        }
    } else if (shirtStyle === 'flannel') {
        for (const side of [-1, 1]) {
            beam(torso, collarColor, [side * 0.075, 0.64, -0.073], [side * 0.029, 0.528, -0.137], 0.018, 0.009);
        }
        for (const y of [0.45, 0.37, 0.29, 0.21]) {
            ball(torso, 0xf1d7a9, 0, y, -0.129 + (0.45 - y) * 0.08, 0.009, 0.009, 0.008);
        }
    }

    const arms = [-1, 1].map(side => {
        const shoulderPosition = new THREE.Vector3(side * 0.198, 0.596, -0.014);
        const elbowPosition = new THREE.Vector3(side * 0.205, 0.57, -0.182);
        const wristPosition = new THREE.Vector3(side * 0.154, 0.589, -0.369);
        const shoulder = pivot(torso, ...shoulderPosition.toArray());
        const upperAxis = elbowPosition.clone().sub(shoulderPosition);
        const upperLength = upperAxis.length();
        shoulder.quaternion.setFromUnitVectors(down, upperAxis.normalize());
        beam(shoulder, sleeveColor, [0, 0, 0], [0, -upperLength, 0], 0.076, 0.049);
        ball(shoulder, sleeveColor, 0, 0, 0, 0.067, 0.068, 0.07);

        const elbow = pivot(shoulder, 0, -upperLength, 0);
        const lowerAxis = wristPosition.clone().sub(elbowPosition);
        const lowerLength = lowerAxis.length();
        const toShoulderSpace = shoulder.quaternion.clone().invert();
        lowerAxis.applyQuaternion(toShoulderSpace).normalize();
        elbow.quaternion.setFromUnitVectors(down, lowerAxis);
        beam(elbow, skinColor, [0, 0, 0], [0, -lowerLength, 0], 0.047, 0.031);
        ball(elbow, skinColor, 0, 0, 0, 0.046, 0.045, 0.042);

        const wrist = pivot(elbow, 0, -lowerLength, 0);
        // The wrist cancels the arm bend so the palm sits parallel to the keys.
        wrist.quaternion.copy(shoulder.quaternion).multiply(elbow.quaternion).invert();
        wrist.rotateX(Math.PI / 2);
        ball(wrist, skinColor, 0, -0.034, 0, 0.036, 0.043, 0.018);
        ball(wrist, skinColor, -side * 0.031, -0.042, 0.002, 0.013, 0.028, 0.013, side * 0.37);
        for (let finger = 0; finger < 4; finger++) {
            ball(wrist, skinColor, (finger - 1.5) * 0.016, -0.075, 0.006,
                0.0085, 0.027 - 0.004 * Math.abs(finger - 1), 0.012);
        }
        return { shoulder, elbow, wrist };
    });

    const head = pivot(torso, 0, 0.697, -0.009);
    const faceSize = { width: 0.24, height: 0.215 };
    const faceAnchor = pivot(head, 0, 0.157, -0.153);
    faceAnchor.rotation.y = Math.PI;

    // Flatten a small central patch so the painted features hug the face.
    const skull = new THREE.SphereGeometry(1, 20, 15);
    skull.scale(0.158, 0.178, 0.182);
    const vertices = skull.getAttribute('position');
    for (let i = 0; i < vertices.count; i++) {
        vertices.setZ(i, Math.max(vertices.getZ(i), -0.15));
    }
    skull.computeVertexNormals();
    piece(head, skull, skinColor, 0, 0.143, 0);
    for (const side of [-1, 1]) {
        ball(head, skinColor, side * 0.151, 0.135, -0.004, 0.031, 0.05, 0.034);
        ball(head, shade(skinColor, 0.77), side * 0.171, 0.134, -0.014, 0.013, 0.024, 0.019);
    }

    const hairHighlight = shade(hairColor, 1.28);
    const hairShadow = shade(hairColor, 0.76);
    if (hairStyle === 'cap') {
        ball(head, shirtColor, 0, 0.277, 0.005, 0.171, 0.076, 0.181);
        ball(head, collarColor, 0, 0.25, -0.157, 0.128, 0.019, 0.111);
        ball(head, 0xf5e5c3, 0, 0.295, -0.152, 0.029, 0.023, 0.012);
        ball(head, hairShadow, 0, 0.224, 0.09, 0.151, 0.075, 0.089);
    } else {
        ball(head, hairShadow, 0, 0.227, 0.073, 0.161, 0.105, 0.121);
        ball(head, hairColor, 0, 0.277, -0.006, 0.166, 0.086, 0.183);
        if (hairStyle === 'curly') {
            for (let i = 0; i < 9; i++) {
                const angle = i * Math.PI * 2 / 9;
                ball(head, i % 2 ? hairColor : hairHighlight,
                    Math.sin(angle) * 0.116, 0.287 + (i % 3) * 0.016, Math.cos(angle) * 0.129,
                    0.063, 0.075, 0.065);
            }
        } else if (hairStyle === 'ponytail') {
            ball(head, hairHighlight, 0, 0.239, 0.175, 0.048, 0.055, 0.038);
            ball(head, hairColor, 0.034, 0.134, 0.194, 0.062, 0.117, 0.069, 0.18);
            ball(head, 0xa8638f, 0, 0.222, 0.189, 0.047, 0.015, 0.045);
        } else {
            const sweep = hairStyle === 'quiff' ? 0.058 : 0;
            const fringe = hairStyle === 'mop' ? 0.059 : 0.037;
            for (let i = 0; i < 4; i++) {
                ball(head, i % 2 ? hairColor : hairHighlight, (i - 1.5) * 0.061,
                    0.263 + i * 0.009 + sweep, -0.137, 0.059, fringe + sweep, 0.056, -0.48);
            }
        }
    }

    if (accessory === 'glasses_retro' || accessory === 'glasses_modern') {
        const retro = accessory === 'glasses_retro';
        const frame = retro ? 0x69412d : 0x303a4b;
        for (const side of [-1, 1]) {
            ring(head, frame, side * 0.054, 0.178, -0.171, 0.041, 0.006,
                retro ? 1.02 : 1.17, retro ? 0.84 : 0.65);
            beam(head, frame, [side * 0.095, 0.184, -0.17], [side * 0.155, 0.176, -0.015], 0.005);
        }
        beam(head, frame, [-0.016, 0.184, -0.17], [0.016, 0.184, -0.17], 0.006);
    } else if (accessory === 'headphones') {
        ring(head, 0x424450, 0, 0.16, 0.005, 0.181, 0.014, 1, 1.25, Math.PI);
        for (const side of [-1, 1]) {
            ball(head, 0x323944, side * 0.174, 0.14, 0.006, 0.038, 0.074, 0.066);
            ball(head, 0xd46e37, side * 0.194, 0.14, 0.006, 0.027, 0.061, 0.053);
        }
    } else if (accessory === 'beard') {
        ball(head, hairShadow, 0, 0.026, -0.11, 0.102, 0.048, 0.071);
        for (const side of [-1, 1]) {
            ball(head, hairColor, side * 0.029, 0.112, -0.156, 0.04, 0.012, 0.016, side * 0.25);
        }
    }

    // Bake opaque pieces into one indexed draw per joint. Vertex colors let
    // hair, skin and clothing share the same matte material across the rig.
    for (const [parent, parts] of batches) {
        const vertexCount = parts.reduce((count, { geometry }) => count + geometry.getAttribute('position').count, 0);
        const indexCount = parts.reduce((count, { geometry }) => count + geometry.index.count, 0);
        const positions = new Float32Array(vertexCount * 3);
        const normals = new Float32Array(vertexCount * 3);
        const colors = new Float32Array(vertexCount * 3);
        const indices = new Uint16Array(indexCount);
        let vertexOffset = 0;
        let indexOffset = 0;
        for (const { geometry, color } of parts) {
            const sourcePositions = geometry.getAttribute('position');
            positions.set(sourcePositions.array, vertexOffset * 3);
            normals.set(geometry.getAttribute('normal').array, vertexOffset * 3);
            for (let i = 0; i < sourcePositions.count; i++) {
                color.toArray(colors, (vertexOffset + i) * 3);
            }
            for (const index of geometry.index.array) indices[indexOffset++] = index + vertexOffset;
            vertexOffset += sourcePositions.count;
            geometry.dispose();
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        geometries.push(geometry);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
    }

    return {
        group, pelvis, torso, head, arms, faceAnchor, faceSize, skinColor, seed,
        dispose() {
            for (const geometry of geometries) geometry.dispose();
            material.dispose();
        },
    };
}
