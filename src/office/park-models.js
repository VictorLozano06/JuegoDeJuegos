/** Shared geometry for repeated architectural details, street furniture and vegetation. */
export function createParkKit(THREE, park) {
    const shapes = {
        block: new THREE.BoxGeometry(1, 1, 1)
    };
    const materials = new Map();
    const batches = new Map();
    const mat = (color, finish = 'stone') => {
        const key = finish + color;
        if (!materials.has(key)) {
            const glass = finish === 'glass';
            materials.set(key, new THREE.MeshStandardMaterial({
                color, roughness: glass ? 0.26 : finish === 'metal' ? 0.48 : 0.83,
                metalness: glass ? 0.29 : finish === 'metal' ? 0.32 : 0.02
            }));
        }
        return materials.get(key);
    };
    const place = (shape, material, x, y, z, w, h, d, yaw = 0, roll = 0) => {
        const key = shape + material.id;
        if (!batches.has(key)) batches.set(key, { shape, material, items: [] });
        batches.get(key).items.push([x, y, z, w, h, d, yaw, roll]);
    };
    const block = (material, ...args) => place('block', material, ...args);
    const flush = () => {
        const transform = new THREE.Object3D();
        for (const { shape, material, items } of batches.values()) {
            const mesh = new THREE.InstancedMesh(shapes[shape], material, items.length);
            mesh.name = 'Detalles del distrito';
            mesh.receiveShadow = true;
            items.forEach(([x, y, z, w, h, d, yaw, roll], i) => {
                transform.position.set(x, y, z);
                transform.rotation.set(0, yaw, roll);
                transform.scale.set(w, h, d);
                transform.updateMatrix();
                mesh.setMatrixAt(i, transform.matrix);
            });
            park.add(mesh);
        }
    };
    return { mat, block, flush };
}
