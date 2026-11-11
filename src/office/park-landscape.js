import { PARK_BYPASS, PARK_SIDEWALK_HALF, PARK_STREET, PARKING_LOT } from './park-streets.js';
import { COURTYARD_BUILDINGS, PARK_PATHS } from './park-ring.js';

function randomSequence(seed) {
    return () => {
        seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
}

const hills = [
    [-61,-58,12,25,28], [-24,-72,14,29,24], [17,-77,15,27,27], [58,-69,10,23,28],
    [-75,-10,10,26,31], [-72,30,8,27,29], [69,-22,9,25,28], [75,28,8,29,29]
];

export function parkGroundHeight(x, z) {
    const edge = Math.max(Math.abs(x), Math.abs(z));
    // The district extends beyond the bypass. Keep its building lots level
    // and start the hills beyond the outermost lots.
    if (edge < 72) return 0;
    const roadEdge = Math.abs(edge - PARK_BYPASS) - (PARK_SIDEWALK_HALF + 0.6);
    const t = Math.max(0, Math.min((edge - 72) / 15, roadEdge / 11, 1));
    if (!t) return 0;
    let height = 0;
    for (const [hx, hz, peak, width, depth] of hills) {
        const dx = (x - hx) / width;
        const dz = (z - hz) / depth;
        height += peak * Math.exp(-dx * dx - dz * dz);
    }
    return height * t * t * (3 - 2 * t) + Math.sin(x * 0.23 + z * 0.17) * t * 0.48;
}

export function buildParkTerrain(THREE, park, material) {
    const geometry = new THREE.PlaneGeometry(196, 196, 104, 104);
    geometry.rotateX(-Math.PI / 2);
    const points = geometry.attributes.position;
    for (let i = 0; i < points.count; i++) points.setY(i, parkGroundHeight(points.getX(i), points.getZ(i)));
    geometry.computeVertexNormals();
    const ground = new THREE.Mesh(geometry, material);
    ground.name = 'Terreno del distrito';
    ground.receiveShadow = true;
    park.add(ground);
}

export function buildParkGrass(THREE, park) {
    const random = randomSequence(91417);
    const points = [];
    const colors = [];
    // Each patch has four curved, upright blades. Keep the roots darker than the tips.
    for (let blade = 0; blade < 4; blade++) {
        const angle = blade * 2.399963;
        const h = 0.13 + random() * 0.12;
        const w = 0.016 + random() * 0.015;
        const lean = 0.034 + random() * 0.026;
        const x = Math.cos(angle) * 0.05;
        const z = Math.sin(angle) * 0.05;
        const stem = (side, level, width) => [
            x + Math.cos(angle) * (side * width + lean * level * level),
            h * level,
            z + Math.sin(angle) * (side * width + lean * level * level)
        ];
        points.push(...stem(-1, 0, w), ...stem(1, 0, w), ...stem(-1, 0.53, w * 0.66),
            ...stem(-1, 0.53, w * 0.66), ...stem(1, 0, w), ...stem(1, 0.53, w * 0.66),
            ...stem(-1, 0.53, w * 0.66), ...stem(1, 0.53, w * 0.66), ...stem(0, 1, 0));
        for (const brightness of [0.40, 0.43, 0.75, 0.75, 0.43, 0.73, 0.75, 0.73, 1]) {
            colors.push(brightness * 0.50, brightness * 0.73, brightness * 0.35);
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1, color: 0xc3d7af });
    const matrix = new THREE.Object3D();
    const patches = [];
    const viewProjection = new THREE.Matrix4();
    const frustum = new THREE.Frustum();

    for (let tileX = -3; tileX <= 3; tileX++) {
        for (let tileZ = -3; tileZ <= 3; tileZ++) {
            const placements = [];
            const inner = Math.abs(tileX) <= 1 && Math.abs(tileZ) <= 1;
            const spacing = inner ? 0.235 : 0.52;
            for (let u = -8; u < 8; u += spacing) {
                for (let v = -8; v < 8; v += spacing) {
                    const x = tileX * 16 + u + random() * spacing;
                    const z = tileZ * 16 + v + random() * spacing;
                    const radius = Math.hypot(x, z);
                    const buffer = 0.15;
                    const courtyard = radius < PARK_PATHS.inner.radius - buffer;
                    const verge = radius > PARK_PATHS.outer.radius + PARK_PATHS.outer.width + buffer &&
                        Math.max(Math.abs(x), Math.abs(z)) < PARK_STREET - PARK_SIDEWALK_HALF - buffer;
                    const edge = Math.max(Math.abs(x), Math.abs(z));
                    const meadow = edge > 47 && Math.abs(edge - PARK_BYPASS) > PARK_SIDEWALK_HALF + buffer &&
                        (edge > PARK_BYPASS || Math.min(Math.abs(Math.abs(x) - PARK_STREET), Math.abs(Math.abs(z) - PARK_STREET)) > PARK_SIDEWALK_HALF + buffer);
                    if (!(courtyard || verge || meadow)) continue;
                    if (courtyard && (Math.hypot(x, z - 0.9) < 4.97 || Math.abs(x) < 1.03 + buffer || Math.abs(z - 0.9) < 0.87 + buffer)) continue;
                    if (courtyard && COURTYARD_BUILDINGS.some(plot =>
                        Math.abs(x - plot.x) < plot.width / 2 + 0.22 && Math.abs(z - plot.z) < plot.depth / 2 + 0.22)) continue;
                    if (courtyard && Math.abs(Math.abs(x) - 7.8) < 1.78 && Math.abs(z - 8) < 1.28) continue;
                    if (courtyard && Math.abs(Math.abs(x) - 6.8) < 0.61 && Math.abs(z - 2.29) < 1.15) continue;
                    if (verge && Math.abs(x - 1.7) < 1.65 + buffer && z > 19.18 - buffer) continue;
                    if (verge && Math.abs(Math.abs(x) - 20.3) < 2.675 + buffer && Math.abs(z - 3.78) < 1.325 + buffer) continue;
                    if (verge && Math.abs(x - PARKING_LOT.x) < PARKING_LOT.width / 2 + buffer &&
                        Math.abs(z - PARKING_LOT.z) < PARKING_LOT.depth / 2 + buffer) continue;
                    const size = (courtyard ? 0.69 : 1.04) * (0.74 + random() * 0.68);
                    placements.push([x, parkGroundHeight(x, z) - 0.005, z, size, random() * Math.PI * 2]);
                }
            }
            if (!placements.length) continue;
            // The reduced densities must remain evenly distributed within a tile.
            for (let i = placements.length - 1; i > 0; i--) {
                const j = Math.floor(random() * (i + 1));
                [placements[i], placements[j]] = [placements[j], placements[i]];
            }
            const grass = new THREE.InstancedMesh(geometry, material, placements.length);
            grass.name = 'Césped 3D';
            grass.receiveShadow = true;
            const bounds = new THREE.Box3();
            placements.forEach(([x, y, z, size, yaw], i) => {
                matrix.position.set(x, y, z);
                matrix.rotation.y = yaw;
                matrix.scale.set(0.88 + size * 0.20, size, 0.88 + size * 0.20);
                matrix.updateMatrix();
                grass.setMatrixAt(i, matrix.matrix);
                bounds.min.x = Math.min(bounds.min.x, x - 0.15);
                bounds.min.y = Math.min(bounds.min.y, y);
                bounds.min.z = Math.min(bounds.min.z, z - 0.15);
                bounds.max.x = Math.max(bounds.max.x, x + 0.15);
                bounds.max.y = Math.max(bounds.max.y, y + size * 0.3);
                bounds.max.z = Math.max(bounds.max.z, z + 0.15);
            });
            park.add(grass);
            patches.push({ grass, count: placements.length, sphere: bounds.getBoundingSphere(new THREE.Sphere()) });
        }
    }

    return (camera, moving) => {
        camera.updateMatrixWorld();
        frustum.setFromProjectionMatrix(viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
        for (const { grass, count, sphere } of patches) {
            grass.visible = frustum.intersectsSphere(sphere);
            if (!grass.visible) continue;
            const distance = Math.max(0, camera.position.distanceTo(sphere.center) - sphere.radius);
            const density = distance < 18 ? 1 : distance < 34 ? 0.62 : distance < 58 ? 0.32 : 0.10;
            grass.count = Math.max(1, Math.round(count * density * (moving && distance > 18 ? 0.60 : 1)));
        }
    };
}

export function buildParkTrees(THREE, park, positions) {
    const random = randomSequence(2029);
    const leafGeometry = new THREE.PlaneGeometry(1, 1);
    const uv = leafGeometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.524 + uv.getX(i) * 0.317, 0.393 + uv.getY(i) * 0.565);
    const foliage = new THREE.MeshStandardMaterial({
        color: 0x4e6740, side: THREE.DoubleSide, roughness: 0.94
    });
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5c5144, roughness: 0.93 });
    const leavesPerTree = 175;
    const branchesPerTree = 8;
    const leaves = new THREE.InstancedMesh(leafGeometry, foliage, positions.length * leavesPerTree);
    const branches = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.5, 1, 7), trunkMaterial, positions.length * branchesPerTree);
    leaves.name = 'Copas con follaje';
    branches.name = 'Troncos y ramas';
    leaves.castShadow = leaves.receiveShadow = branches.castShadow = branches.receiveShadow = true;
    park.add(branches, leaves);

    let foliageReady;
    if (typeof document !== 'undefined') {
        leaves.visible = false;
        const loader = new THREE.TextureLoader();
        const load = name => loader.loadAsync(`/models/pera-park/${name}`);
        foliageReady = Promise.allSettled([load('leaf-color.jpg'), load('leaf-alpha.png')]).then(([color, alpha]) => {
            if (!park.parent || color.status === 'rejected' || alpha.status === 'rejected') {
                for (const asset of [color, alpha]) if (asset.status === 'fulfilled') asset.value.dispose();
                if (park.parent) throw new Error('No se pudieron cargar las texturas del arbolado.');
                return;
            }
            color.value.encoding = THREE.sRGBEncoding;
            foliage.map = color.value;
            foliage.alphaMap = alpha.value;
            foliage.alphaTest = 0.41;
            foliage.color.setHex(0xdde6be);
            foliage.needsUpdate = true;
            leaves.visible = true;
            park.userData.refreshShadows?.();
        });
    }

    const dummy = new THREE.Object3D();
    const from = new THREE.Vector3();
    const to = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    let branchIndex = 0;
    let leafIndex = 0;
    const branch = (x, y, z, endX, endY, endZ, width) => {
        from.set(x, y, z);
        to.set(endX, endY, endZ);
        direction.subVectors(to, from);
        const length = direction.length();
        dummy.position.copy(from).lerp(to, 0.5);
        dummy.quaternion.setFromUnitVectors(up, direction.normalize());
        dummy.scale.set(width, length, width);
        dummy.updateMatrix();
        branches.setMatrixAt(branchIndex++, dummy.matrix);
    };
    for (const [x, z, height, spread] of positions) {
        const base = parkGroundHeight(x, z);
        const lean = (random() - 0.5) * height * 0.17;
        branch(x, base, z, x + lean * 0.5, base + height * 0.52, z, height * 0.063);
        branch(x + lean * 0.5, base + height * 0.5, z, x + lean, base + height * 0.94, z, height * 0.034);
        const clusters = [];
        for (let i = 0; i < 6; i++) {
            const angle = i * 2.39996 + random() * 0.6;
            const fraction = 0.36 + i * 0.095;
            const radius = spread * (0.64 + random() * 0.33) * (1 - i * 0.069);
            const tx = x + Math.cos(angle) * radius + lean * 0.5;
            const tz = z + Math.sin(angle) * radius;
            const ty = base + height * (fraction + 0.21);
            branch(x + lean * fraction, base + height * fraction, z, tx, ty, tz, height * (0.019 - i * 0.0016));
            clusters.push([tx, ty, tz]);
        }
        clusters.push([x + lean, base + height * 0.92, z]);
        for (let i = 0; i < leavesPerTree; i++) {
            const [cx, cy, cz] = clusters[i % clusters.length];
            const angle = random() * 2 * Math.PI;
            const tilt = random() * 2 - 1;
            const radius = Math.cbrt(random()) * spread * 0.56;
            const scale = spread * (0.36 + random() * 0.31);
            dummy.position.set(cx + Math.cos(angle) * radius, cy + tilt * radius * 0.85, cz + Math.sin(angle) * radius);
            dummy.rotation.set((random() - 0.5) * Math.PI, angle, (random() - 0.5) * 2.7);
            dummy.scale.set(scale, scale * 1.49, scale);
            dummy.updateMatrix();
            leaves.setMatrixAt(leafIndex++, dummy.matrix);
        }
    }
    return foliageReady;
}

export function addParkBench(kit, x, z, yaw) {
    const { block, mat } = kit;
    const timber = mat(0x7b533a);
    const steel = mat(0x394247, 'metal');
    const part = (material, dx, dy, dz, w, h, d) => {
        block(material, x + dx * Math.cos(yaw) + dz * Math.sin(yaw), dy,
            z - dx * Math.sin(yaw) + dz * Math.cos(yaw), w, h, d, yaw);
    };
    for (const leg of [-0.74, 0.74]) {
        part(steel, leg, 0.23, 0, 0.085, 0.45, 0.46);
        part(steel, leg, 0.56, -0.2, 0.064, 0.67, 0.068);
        part(steel, leg, 0.61, 0.01, 0.075, 0.048, 0.44);
    }
    for (let slat = 0; slat < 5; slat++) part(timber, 0, 0.455, (slat - 2) * 0.086, 1.76, 0.045, 0.071);
    for (let slat = 0; slat < 3; slat++) part(timber, 0, 0.61 + slat * 0.092, -0.18, 1.76, 0.074, 0.041);
}
