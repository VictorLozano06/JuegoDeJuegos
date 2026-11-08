/** Desk-local keyboard and mouse. Coordinates are measured from the tabletop. */
export function createModernPeripherals(THREE, { tabletop = 1.4, cyber = false } = {}) {
    const group = new THREE.Group();
    group.name = 'Teclado y ratón';
    const housing = new THREE.MeshStandardMaterial({ color: cyber ? 0x172735 : 0x303b40, roughness: 0.76, metalness: 0.08 });
    const keyMaterial = new THREE.MeshStandardMaterial({ color: cyber ? 0x98d6da : 0xb8c3c0, roughness: 0.83 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x182229, roughness: 0.82 });
    const pad = new THREE.MeshStandardMaterial({ color: cyber ? 0x214452 : 0x3b7068, roughness: 0.95 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.035, 0.255), housing);
    body.name = 'Carcasa de teclado';
    body.position.set(0, tabletop + 0.0175, 0.39);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // One instanced draw for all keys instead of dozens of separate meshes.
    const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(0.041, 0.009, 0.038), keyMaterial, 48);
    keys.name = 'Teclas';
    const transform = new THREE.Object3D();
    let i = 0;
    for (let row = 0; row < 4; row++) {
        for (let column = 0; column < 12; column++) {
            transform.position.set(-0.315 + column * 0.057, tabletop + 0.0395, 0.304 + row * 0.052);
            transform.updateMatrix();
            keys.setMatrixAt(i++, transform.matrix);
        }
    }
    keys.instanceMatrix.needsUpdate = true;
    keys.receiveShadow = true;
    group.add(keys);

    const mousepad = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.008, 0.24), pad);
    mousepad.name = 'Alfombrilla';
    mousepad.position.set(0.64, tabletop + 0.004, 0.30);
    mousepad.receiveShadow = true;
    group.add(mousepad);
    const mouse = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), dark);
    mouse.name = 'Ratón';
    mouse.scale.set(0.048, 0.024, 0.070);
    mouse.position.set(0.64, tabletop + 0.032, 0.30);
    mouse.castShadow = true;
    mouse.receiveShadow = true;
    group.add(mouse);
    const wheel = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.004, 0.024), keyMaterial);
    wheel.name = 'Rueda del ratón';
    wheel.position.set(0.64, tabletop + 0.055, 0.284);
    group.add(wheel);
    return group;
}
