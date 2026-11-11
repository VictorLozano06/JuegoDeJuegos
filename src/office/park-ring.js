export const PARK_RING_INNER = 15.5;
export const PARK_RING_OUTER = 20.4;
export const PARK_PATHS = {
    inner: { radius: PARK_RING_INNER - 1.75, width: 1.03 },
    outer: { radius: PARK_RING_OUTER + 0.86, width: 0.90 }
};
const GATES = [0.08, -1.39, 1.39];
export const COURTYARD_BUILDINGS = [
    { id: 'studio', x: 0, z: -10.1, width: 6.1, depth: 3.65, height: 4.55 },
    { id: 'consoles', x: -10.4, z: -2.45, width: 4.6, depth: 4.1, height: 3.65 },
    { id: 'lab', x: 10.4, z: -2.45, width: 4.65, depth: 4.05, height: 4.1 },
    { x: -6.8, z: 4.42, width: 3.35, depth: 2.85, height: 2.9 },
    { x: 6.8, z: 4.42, width: 3.35, depth: 2.85, height: 2.9 }
];
const LEVELS = [0.31, 1.81, 3.31, 4.81];

export function buildParkRing(THREE, park, kit) {
    const { block, mat } = kit;
    const concrete = mat(0xcac6b8);
    const eaves = mat(0xe6e4da, 'metal');
    const fascia = mat(0x939b9a, 'metal');
    const roof = mat(0x777c76);
    const solar = mat(0x263c49, 'glass');
    const screen = mat(0x6d7c7b, 'metal');
    const glass = new THREE.MeshStandardMaterial({
        color: 0xffffff, vertexColors: true, roughness: 0.24, metalness: 0.23, side: THREE.DoubleSide
    });
    const add = (name, geometry, material, y) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = name;
        mesh.position.y = y;
        mesh.receiveShadow = true;
        park.add(mesh);
        return mesh;
    };
    const deck = (name, material, inner, outer, y) => {
        const geometry = new THREE.RingGeometry(inner, outer, 192);
        geometry.rotateX(-Math.PI / 2);
        return add(name, geometry, material, y);
    };
    function face(name, radius, bottom, height, material, tinted = false) {
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 192, 1, true);
        if (tinted) {
            const position = geometry.attributes.position;
            const colors = [];
            const tint = new THREE.Color();
            for (let i = 0; i < position.count; i++) {
                const azimuth = Math.atan2(position.getX(i), position.getZ(i));
                const intensity = 0.47 + Math.cos(azimuth - 0.55) * 0.13 + Math.sin(azimuth * 7) * 0.018;
                tint.setRGB(intensity * 0.76, intensity * 0.93, intensity);
                if (position.getY(i) < 0) tint.multiplyScalar(0.64);
                colors.push(tint.r, tint.g, tint.b);
            }
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        }
        return add(name, geometry, material, bottom + height / 2);
    }

    deck('Zócalo de piedra del anillo', concrete, PARK_RING_INNER - 0.8, PARK_RING_OUTER + 0.88, 0.12);
    for (const radius of [PARK_RING_INNER, PARK_RING_OUTER]) {
        face('Base de la fachada', radius, 0.12, 0.21, concrete);
        LEVELS.slice(0, -1).forEach((bottom, index) => {
            face('Fachada curva acristalada', radius, bottom, 1.43, glass, true).castShadow = true;
            const edge = radius + (radius === PARK_RING_OUTER ? 0.11 : -0.11);
            face('Canto de forjado', edge, bottom + 1.38, 0.13, eaves);
            for (let pane = 0; pane < 96; pane++) {
                const angle = pane * 2 * Math.PI / 96;
                block(screen, Math.sin(angle) * radius, bottom + 0.7, Math.cos(angle) * radius,
                    0.031, 1.38, 0.046, angle);
            }
            if (index === 0) face('Franja inferior del vidrio', edge, bottom, 0.06, fascia);
        });
    }

    const roofY = 5.05;
    face('Fascia exterior blanca', PARK_RING_OUTER + 0.52, 4.76, 0.29, eaves);
    face('Fascia interior blanca', PARK_RING_INNER - 0.53, 4.76, 0.29, eaves);
    deck('Cubierta circular', roof, PARK_RING_INNER - 0.53, PARK_RING_OUTER + 0.52, roofY);
    deck('Alero interior', eaves, PARK_RING_INNER - 0.53, PARK_RING_INNER + 0.38, roofY + 0.012);
    deck('Alero exterior', eaves, PARK_RING_OUTER - 0.35, PARK_RING_OUTER + 0.52, roofY + 0.012);
    for (let row = 0; row < 6; row++) {
        const radius = PARK_RING_INNER + 0.49 + row * 0.65;
        deck('Banda fotovoltaica', solar, radius, radius + 0.59, roofY + 0.02);
    }
    for (let i = 0; i < 192; i++) {
        const angle = i * Math.PI / 96;
        const radius = (PARK_RING_INNER + PARK_RING_OUTER) / 2 - 0.11;
        block(fascia, Math.sin(angle) * radius, roofY + 0.024, Math.cos(angle) * radius,
            0.022, 0.012, 3.89, angle);
    }

    for (const angle of GATES) {
        const radius = PARK_RING_OUTER + 0.32;
        const entry = new THREE.Group();
        entry.name = 'Acceso al anillo';
        entry.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
        entry.rotation.y = angle;
        park.add(entry);
        const portal = (name, material, x, y, z, w, h, d) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
            mesh.name = name;
            mesh.position.set(x, y, z);
            mesh.receiveShadow = true;
            entry.add(mesh);
            return mesh;
        };
        portal('Umbral de granito', concrete, 0, 0.10, 0.53, 3.35, 0.20, 1.48);
        portal('Cristal del vestíbulo', mat(0x33474c, 'glass'), 0, 1.16, 0.18, 2.65, 1.98, 0.14);
        portal('Marquesina', eaves, 0, 2.34, 0.56, 3.40, 0.15, 1.48);
        portal('Señal de acceso', mat(0x759e92), 0, 2.26, 1.25, 3.1, 0.053, 0.054);
        for (const x of [-1.39, 0, 1.39]) portal('Carpintería del vestíbulo', fascia, x, 1.14, 0.26, 0.075, 2, 0.10);
    }
}

function courtyardTexture(THREE, kind) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    let seed = kind === 'stone' ? 104 : kind === 'wood' ? 205 : 306;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    if (kind === 'glass') {
        const shade = ctx.createLinearGradient(0, 0, 256, 256);
        shade.addColorStop(0, 'rgba(255,255,255,.2)');
        shade.addColorStop(.35, 'rgba(58,85,93,.32)');
        shade.addColorStop(.55, 'rgba(220,239,226,.12)');
        shade.addColorStop(1, 'rgba(40,62,68,.42)');
        ctx.fillStyle = shade;
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = 'rgba(220,244,238,.10)';
        ctx.beginPath();
        ctx.moveTo(145, 0); ctx.lineTo(195, 0); ctx.lineTo(85, 256); ctx.lineTo(40, 256);
        ctx.fill();
    } else {
        for (let i = 0; i < (kind === 'stone' ? 4500 : 950); i++) {
            ctx.fillStyle = random() > .5 ? 'rgba(79,58,37,.08)' : 'rgba(255,255,255,.38)';
            const x = random() * 256;
            const y = random() * 256;
            ctx.fillRect(x, y, kind === 'wood' ? 18 + random() * 60 : 1 + random() * 2, kind === 'wood' ? .7 + random() : 1 + random() * 2);
        }
        if (kind === 'wood') {
            ctx.fillStyle = 'rgba(65,44,28,.16)';
            for (let y = 0; y < 256; y += 32) ctx.fillRect(0, y, 256, 1);
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 4;
    return texture;
}

export function buildCourtyardBuilding(THREE, group, kit, plot, color) {
    const { mat } = kit;
    const { width, depth, height } = plot;
    const metal = mat(0x465358, 'metal');
    const stone = mat(0xc0b9a9).clone();
    const dark = mat(0x333f42);
    const roof = mat(0x737c74);
    const cedar = mat(0x8a6e57).clone();
    const glass = [0x496367, 0x688384, 0x405961].map(tint => mat(tint, 'glass').clone());
    stone.map = courtyardTexture(THREE, 'stone');
    cedar.map = courtyardTexture(THREE, 'wood');
    const glassMap = courtyardTexture(THREE, 'glass');
    glass.forEach(material => { material.map = glassMap; });
    const place = (material, x, y, z, w, h, d, shadow = false) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
        mesh.position.set(x, y, z);
        mesh.castShadow = shadow;
        mesh.receiveShadow = true;
        group.add(mesh);
        return mesh;
    };
    const base = place(plot.id ? dark : cedar, 0, height / 2 + 0.13, 0, width, height, depth, true);
    place(stone, 0, 0.07, 0, width + 0.45, 0.14, depth + 0.45);
    place(plot.id === 'consoles' ? cedar : stone, 0, height + 0.21, 0, width + 0.31, 0.20, depth + 0.31);
    place(roof, 0, height + 0.34, 0, width - 0.1, 0.06, depth - 0.1);
    // Recessed bands, sills and projecting canopies give each level depth.
    for (const side of [-1, 1]) {
        place(metal, side * (width / 2 - 0.12), height / 2 + .17, depth / 2 + .07, .09, height - .15, .12);
        place(stone, 0, height + .11, side * (depth / 2 + .04), width + .2, .12, .13);
    }
    const rows = plot.id ? 2 : 1;
    const cols = plot.id === 'studio' ? 6 : plot.id ? 4 : 2;
    const pitch = (width - 0.30) / cols;
    const floor = height / rows;
    for (let row = 0; row < rows; row++) {
        const y = 0.17 + (row + 0.48) * floor;
        for (let col = 0; col < cols; col++) {
            for (const side of [-1, 1]) {
                place(glass[(col + row + side + 4) % 3], (col - (cols - 1) / 2) * pitch, y, side * (depth / 2 + 0.023),
                    pitch - 0.052, floor * 0.75, 0.058);
            }
        }
        for (const side of [-1, 1]) {
            place(glass[row % 3], side * (width / 2 + 0.018), y, 0, 0.043, floor * 0.75, depth - 0.46);
            for (const z of [-0.48, 0.48]) place(metal, side * (width / 2 + 0.044), y, z, 0.054, floor * 0.77, 0.055);
        }
        if (row < rows - 1) {
            for (const side of [-1, 1]) {
                place(stone, 0, .17 + (row + 1) * floor, side * (depth / 2 + .065), width + .04, .10, .12);
            }
        }
    }
    place(metal, 0, 0.99, depth / 2 + 0.073, 1.05, 1.82, 0.075);
    place(glass[1], 0, 0.99, depth / 2 + 0.113, 0.85, 1.63, 0.042);
    place(stone, 0, 2.05, depth / 2 + 0.30, 1.64, 0.11, 0.70);
    place(metal, .27, 1, depth / 2 + .14, .045, .45, .045);
    for (const side of [-1, 1]) {
        place(cedar, side * (width / 2 - .27), .37, depth / 2 + .30, .40, .48, .42);
        place(mat(0x66865a), side * (width / 2 - .27), .73, depth / 2 + .30, .30, .30, .30);
    }
    if (plot.id) place(mat(color), 0, 2.05, depth / 2 + 0.66, 1.63, 0.05, 0.025);
    if (plot.id === 'studio') {
        place(mat(0x607152), -width * 0.23, height + 0.41, 0, width * 0.39, 0.08, depth * 0.70);
        place(glass[0], width * 0.20, height + 0.55, -0.10, width * 0.39, 0.36, depth * 0.61);
    } else if (plot.id === 'lab') {
        place(glass[1], 0, height + 0.48, 0, width * 0.58, 0.24, depth * 0.54);
    }
    return base;
}
