const ROOT = '/models/pera-park';
const models = new Map();

function loadModel(THREE, name) {
    if (!models.has(name)) {
        const pending = new Promise((resolve, reject) => {
            const file = name.endsWith('.gltf') ? name : `${name}.glb`;
            const manager = new THREE.LoadingManager();
            let failedAsset;
            manager.onError = url => { failedAsset = url; };
            new THREE.GLTFLoader(manager).load(`${ROOT}/${file}`, asset => {
                if (failedAsset) reject(new Error(`No se pudo cargar ${failedAsset}`));
                else resolve(asset);
            }, undefined, reject);
        });
        models.set(name, pending);
        pending.catch(() => models.delete(name));
    }
    return models.get(name);
}

export function createParkAssets(THREE, world, park) {
    const batches = new Map();
    const materials = new Map();
    const textures = new Map();
    const geometries = new Map();
    const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const isCurrent = () => park.parent === world.officeGroup;
    const animations = [];
    const pending = [];

    function ownedMaterial(source) {
        if (!materials.has(source)) {
            const material = source.clone();
            for (const [key, value] of Object.entries(source)) {
                if (!value?.isTexture) continue;
                if (!textures.has(value)) {
                    const texture = value.clone();
                    texture.needsUpdate = true;
                    textures.set(value, texture);
                }
                material[key] = textures.get(value);
            }
            materials.set(source, material);
        }
        return materials.get(source);
    }

    function transformFor(bounds, placement) {
        const { x = 0, y = 0, z = 0, yaw = 0, width, height, depth } = placement;
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = width ? width / size.x : height ? height / size.y : depth ? depth / size.z : 1;
        const object = new THREE.Object3D();
        object.position.set(x, y, z);
        object.rotation.y = yaw;
        object.scale.set(width ? width / size.x : scale, height ? height / size.y : scale, depth ? depth / size.z : scale);
        object.updateMatrix();
        return object.matrix.multiply(new THREE.Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z));
    }

    function load(name, install) {
        if (!THREE.GLTFLoader) return;
        pending.push(loadModel(THREE, name).then(asset => {
            if (!isCurrent()) return;
            asset.scene.updateMatrixWorld(true);
            const bounds = new THREE.Box3().setFromObject(asset.scene);
            install(asset, bounds);
            world.nextShadowRefresh = 0;
        }).catch(error => { throw new Error(`No se pudo cargar el modelo ${name}`, { cause: error }); }));
    }

    function staticModel(name, placement) {
        if (!batches.has(name)) batches.set(name, []);
        batches.get(name).push(placement);
    }

    function movingModel(name, parent, placement, animate = false) {
        load(name, (asset, bounds) => {
            const wrapper = new THREE.Group();
            wrapper.matrix.copy(transformFor(bounds, placement));
            wrapper.matrixAutoUpdate = false;
            const model = asset.scene.clone(true);
            const paintMaterials = new Map();
            const materialForVehicle = source => {
                const material = ownedMaterial(source);
                if (placement.paint == null || !/^(blue|paint)$/i.test(source.name)) return material;
                if (!paintMaterials.has(source)) {
                    const paint = material.clone();
                    paint.color.setHex(placement.paint);
                    paintMaterials.set(source, paint);
                }
                return paintMaterials.get(source);
            };
            model.traverse(object => {
                if (!object.isMesh) return;
                if (!geometries.has(object.geometry)) geometries.set(object.geometry, object.geometry.clone());
                object.geometry = geometries.get(object.geometry);
                object.material = Array.isArray(object.material) ? object.material.map(materialForVehicle) : materialForVehicle(object.material);
                object.receiveShadow = true;
            });
            wrapper.add(model);
            parent.add(wrapper);
            if (animate && !reducedMotion && asset.animations.length) {
                const mixer = new THREE.AnimationMixer(model);
                mixer.clipAction(asset.animations[0]).play();
                animations.push(mixer);
            }
        });
    }

    function finish(texturesReady) {
        for (const [name, placements] of batches) {
            load(name, (asset, bounds) => {
                const transforms = placements.map(placement => transformFor(bounds, placement));
                const matrix = new THREE.Matrix4();
                asset.scene.traverse(object => {
                    if (!object.isMesh) return;
                    const material = Array.isArray(object.material) ? object.material.map(ownedMaterial) : ownedMaterial(object.material);
                    const batch = new THREE.InstancedMesh(object.geometry.clone(), material, placements.length);
                    batch.name = name;
                    batch.castShadow = placements.some(placement => placement.shadow);
                    batch.receiveShadow = true;
                    transforms.forEach((transform, index) => {
                        batch.setMatrixAt(index, matrix.multiplyMatrices(transform, object.matrixWorld));
                    });
                    park.add(batch);
                });
            });
        }
        park.userData.assetsReady = Promise.all([...pending, ...texturesReady]);
    }

    function animate(time) {
        for (const mixer of animations) mixer.setTime(time);
    }

    return { staticModel, movingModel, finish, animate };
}

export async function loadParkSurface(THREE, park, material, name, repeat, tint) {
    if (typeof document === 'undefined') return;
    const texture = await new THREE.TextureLoader().loadAsync(`${ROOT}/${name}.jpg`);
    if (!park.parent) {
        texture.dispose();
        return;
    }
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.setScalar(repeat);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 4;
    material.map = texture;
    material.color.setHex(tint);
    material.needsUpdate = true;
}
