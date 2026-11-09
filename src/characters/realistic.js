export function realisticEmployeeUrl(seed) {
    return `/models/realistic-employees/employee-${seed % 2 ? 'woman' : 'man'}.glb`;
}

export function installRealisticEmployee(THREE, character, gltf, seed = character.seed) {
    const model = gltf.scene;
    const clip = gltf.animations.find(animation => animation.name === 'Sit idle (chair)');
    if (!model || !clip) throw new Error('El personaje no incluye la animación de estar sentado.');
    const mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(clip).play();
    // Sample the seated clip once. The chair and keyboard determine the pose
    // after this, so motion from the source chair cannot slide the employee.
    mixer.setTime(0.3);
    model.rotation.y = Math.PI;
    const isWoman = seed % 2 !== 0;
    model.scale.setScalar(isWoman ? 1.50 : 1.45);
    const chains = names => ['Left', 'Right'].map(side => names.map(name => model.getObjectByName(side + name)));
    const arms = chains(['Arm', 'ForeArm', 'Hand']);
    const legs = chains(['UpLeg', 'Leg', 'Foot']);
    const hips = model.getObjectByName('Hips');
    const spineBones = ['Spine', 'Spine1', 'Spine2'].map(name => model.getObjectByName(name)).filter(Boolean);
    const bones = [...arms.flat(), ...legs.flat(), ...spineBones];
    if (!hips || bones.some(bone => !bone)) throw new Error('El personaje no tiene el esqueleto esperado.');

    // Pose fingers in a natural, relaxed typing curvature over the keyboard
    for (const side of ['Left', 'Right']) {
        const sign = side === 'Left' ? 1 : -1;
        for (const finger of ['Index', 'Middle', 'Ring', 'Pinky']) {
            const j1 = model.getObjectByName(`${side}Hand${finger}1`);
            const j2 = model.getObjectByName(`${side}Hand${finger}2`);
            const j3 = model.getObjectByName(`${side}Hand${finger}3`);
            if (j1) {
                j1.quaternion.set(0, 0, 0, 1);
                j1.rotateZ(-0.28 * sign);
                const spread = (finger === 'Index' ? 0.05 : (finger === 'Pinky' ? -0.06 : (finger === 'Ring' ? -0.03 : 0))) * sign;
                j1.rotateX(spread);
            }
            if (j2) {
                j2.quaternion.set(0, 0, 0, 1);
                j2.rotateZ(-0.36 * sign);
            }
            if (j3) {
                j3.quaternion.set(0, 0, 0, 1);
                j3.rotateZ(-0.22 * sign);
            }
        }
        // Thumbs: resting alongside index near spacebar
        const t1 = model.getObjectByName(`${side}HandThumb1`);
        const t2 = model.getObjectByName(`${side}HandThumb2`);
        const t3 = model.getObjectByName(`${side}HandThumb3`);
        if (t1) {
            t1.quaternion.set(0, 0, 0, 1);
            t1.rotateX(0.12 * sign);
            t1.rotateY(-0.35 * sign);
            t1.rotateZ(-0.25 * sign);
        }
        if (t2) {
            t2.quaternion.set(0, 0, 0, 1);
            t2.rotateZ(-0.20 * sign);
        }
        if (t3) {
            t3.quaternion.set(0, 0, 0, 1);
            t3.rotateZ(-0.15 * sign);
        }
    }
    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    character.pelvis.visible = false;
    character.group.add(model);
    character.realistic = {
        model, mixer, hips, arms, legs, isWoman,
        rest: bones.map(bone => [bone, bone.quaternion.clone()]),
        wrists: [],
    };
}

function setWorldRotation(bone, rotation) {
    const inverseParent = bone.parent.getWorldQuaternion(rotation.clone()).invert();
    bone.quaternion.copy(inverseParent.multiply(rotation));
}

// Bend a limb toward its pole while keeping the original bone lengths.
function reach(THREE, [upper, lower, end], target, pole) {
    const start = upper.getWorldPosition(new THREE.Vector3());
    const joint = lower.getWorldPosition(new THREE.Vector3());
    const tip = end.getWorldPosition(new THREE.Vector3());
    const a = start.distanceTo(joint);
    const b = joint.distanceTo(tip);
    const direction = target.clone().sub(start);
    const length = THREE.MathUtils.clamp(direction.length(), Math.abs(a - b) + 0.001, a + b - 0.001);
    direction.normalize();
    const along = (a * a - b * b + length * length) / (2 * length);
    const bend = pole.sub(start);
    bend.addScaledVector(direction, -bend.dot(direction)).normalize();
    const elbow = start.clone().addScaledVector(direction, along).addScaledVector(bend, Math.sqrt(Math.max(0, a * a - along * along)));
    const goal = start.clone().addScaledVector(direction, length);

    function aim(bone, from, to) {
        const rotation = new THREE.Quaternion().setFromUnitVectors(from.normalize(), to.normalize());
        rotation.multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
        setWorldRotation(bone, rotation);
    }

    aim(upper, joint.sub(start), elbow.clone().sub(start));
    const newJoint = lower.getWorldPosition(new THREE.Vector3());
    aim(lower, end.getWorldPosition(new THREE.Vector3()).sub(newJoint), goal.sub(newJoint));
}

export function fitRealisticEmployee(THREE, character, desk) {
    const npc = character.realistic;
    if (!npc) return;
    const { seatTop, chairZ, keysTop, keysZ } = desk.posture;
    const point = (x, y, z) => desk.group.localToWorld(new THREE.Vector3(x, y, z));
    const { model } = npc;
    for (const [bone, rotation] of npc.rest) bone.quaternion.copy(rotation);
    model.position.set(0, 0, 0);
    model.updateWorldMatrix(true, true);

    // 1. Upright developer working posture
    // The Mixamo 'Sit idle' clip reclines back. Straightening the spine
    // ensures the character's back sits cleanly in front of the chair backrest.
    const spine = model.getObjectByName('Spine');
    const spine1 = model.getObjectByName('Spine1');
    const spine2 = model.getObjectByName('Spine2');
    if (spine) spine.rotateX(-0.16);
    if (spine1) spine1.rotateX(-0.10);
    if (spine2) spine2.rotateX(-0.06);

    // 2. Position hips cleanly on the seat cushion with front clearance from backrest
    const cushionOffset = (npc.isWoman ? 0.115 : 0.112) * model.scale.y;
    const forwardClearance = npc.isWoman ? -0.070 : -0.075;
    const contact = point(0, seatTop + cushionOffset, chairZ + forwardClearance);
    const hips = npc.hips.getWorldPosition(new THREE.Vector3());
    model.position.copy(character.group.worldToLocal(contact).sub(character.group.worldToLocal(hips)));
    model.updateWorldMatrix(true, true);

    // 3. Legs and feet
    npc.legs.forEach((leg, i) => {
        const side = i === 0 ? -1 : 1;
        const foot = leg[2];
        const footRotation = foot.getWorldQuaternion(new THREE.Quaternion());
        reach(THREE, leg, point(side * 0.22, npc.isWoman ? 0.13 : 0.12, chairZ - 0.49), point(side * 0.28, seatTop, chairZ - 0.63));
        setWorldRotation(foot, footRotation);
    });

    // 4. Arms and hands - ergonomic typing posture with natural hanging elbows
    const deskRotation = desk.group.getWorldQuaternion(new THREE.Quaternion());
    npc.wrists = npc.arms.map((arm, i) => {
        const side = i === 0 ? -1 : 1;
        const wristY = keysTop + (npc.isWoman ? 0.035 : 0.038);
        const wristZ = keysZ + (npc.isWoman ? 0.11 : 0.105);
        const wristX = side * (npc.isWoman ? 0.135 : 0.145);
        const elbowX = side * (npc.isWoman ? 0.23 : 0.25);
        const elbowY = seatTop + 0.32;
        const elbowZ = chairZ - 0.08;

        reach(THREE, arm, point(wristX, wristY, wristZ), point(elbowX, elbowY, elbowZ));

        const hand = arm[2];
        const forwardDir = new THREE.Vector3(-side * 0.14, 0.02, -0.98).normalize();
        const boneX = (side === -1 ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(0, 1, 0));
        const boneY = forwardDir;
        const boneZ = new THREE.Vector3().crossVectors(boneX, boneY).normalize();

        const basis = new THREE.Matrix4().makeBasis(boneX, boneY, boneZ);
        const quat = new THREE.Quaternion().setFromRotationMatrix(basis).premultiply(deskRotation);
        setWorldRotation(hand, quat);

        const indexBone = model.getObjectByName((i === 0 ? 'Left' : 'Right') + 'HandIndex1');
        const middleBone = model.getObjectByName((i === 0 ? 'Left' : 'Right') + 'HandMiddle1');

        return {
            hand,
            rest: hand.quaternion.clone(),
            tap: new THREE.Quaternion(),
            axis: new THREE.Vector3(0, 0, -side),
            indexBone,
            indexRest: indexBone?.quaternion.clone(),
            middleBone,
            middleRest: middleBone?.quaternion.clone(),
            sign: side === -1 ? 1 : -1
        };
    });
}

export function animateRealisticEmployee(character, time) {
    character.realistic?.wrists.forEach(({ hand, rest, tap, axis, indexBone, indexRest, middleBone, middleRest, sign }, i) => {
        const lift = 0.012 * (1 + Math.sin(time * 8 + i * Math.PI + character.index));
        hand.quaternion.copy(rest).multiply(tap.setFromAxisAngle(axis, lift));

        if (indexBone && indexRest) {
            const tapAngle = 0.045 * Math.sin(time * 12 + i * 2.5 + character.index);
            indexBone.quaternion.copy(indexRest).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, sign), tapAngle));
        }
        if (middleBone && middleRest) {
            const tapAngle = 0.038 * Math.sin(time * 11 + i * 1.8 + character.index + 1.2);
            middleBone.quaternion.copy(middleRest).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, sign), tapAngle));
        }
    });
}

export function disposeRealisticEmployee(character) {
    const npc = character.realistic;
    if (!npc) return;
    npc.mixer?.stopAllAction();
    const geometries = new Set(), materials = new Set(), textures = new Set();
    npc.model.traverse(child => {
        if (!child.isMesh) return;
        geometries.add(child.geometry);
        for (const material of (Array.isArray(child.material) ? child.material : [child.material])) {
            materials.add(material);
            for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
        }
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    textures.forEach(texture => texture.dispose());
}
