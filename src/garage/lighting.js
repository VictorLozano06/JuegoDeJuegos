function canvasTexture(THREE, width, height, paint) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    paint(canvas.getContext('2d'), width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
}

function seededNoise(seed) {
    return () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 0x100000000;
    };
}

function brickTexture(THREE, wallWidth, wallHeight) {
    const noise = seededNoise(84);
    return canvasTexture(THREE, 1024, 512, (ctx, width, height) => {
        // Courses correspond to roughly 30 x 11 cm including mortar joints.
        const brickWidth = width / Math.round(wallWidth / 0.30);
        const brickHeight = height / Math.round(wallHeight / 0.11);
        const jointX = width * 0.012 / wallWidth;
        const jointY = height * 0.012 / wallHeight;
        ctx.fillStyle = '#7c6657';
        ctx.fillRect(0, 0, width, height);

        for (let row = 0, y = 0; y < height - 0.01; row++, y += brickHeight) {
            const offset = row % 2 ? -brickWidth * 0.5 : 0;
            for (let x = offset; x < width - 0.01; x += brickWidth) {
                const edgeX = x + jointX * 0.5;
                const edgeY = y + jointY * 0.5;
                const faceWidth = brickWidth - jointX;
                const faceHeight = brickHeight - jointY;
                const hue = 15 + Math.floor(noise() * 14);
                const saturation = 28 + Math.floor(noise() * 20);
                const lightness = 42 + Math.floor(noise() * 15);
                const glaze = ctx.createLinearGradient(0, edgeY, 0, edgeY + faceHeight);
                glaze.addColorStop(0, `hsl(${hue}, ${saturation}%, ${lightness + 7}%)`);
                glaze.addColorStop(0.17, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
                glaze.addColorStop(0.85, `hsl(${hue}, ${saturation}%, ${lightness - 2}%)`);
                glaze.addColorStop(1, `hsl(${hue}, ${saturation}%, ${lightness - 9}%)`);
                ctx.fillStyle = glaze;
                ctx.fillRect(edgeX, edgeY, faceWidth, faceHeight);
                for (let grain = 0; grain < 14; grain++) {
                    ctx.fillStyle = grain % 2 ? 'rgba(60,30,20,.12)' : 'rgba(255,225,190,.15)';
                    ctx.fillRect(edgeX + noise() * (faceWidth - 2), edgeY + noise() * (faceHeight - 1), 1.8, 0.8);
                }
            }
        }
    });
}

function doorTexture(THREE, doorWidth, doorHeight) {
    return canvasTexture(THREE, 512, 512, (ctx, width, height) => {
        const spacing = height / Math.round(doorHeight / 0.12);
        const rib = ctx.createLinearGradient(0, 0, 0, spacing);
        rib.addColorStop(0, '#46595b');
        rib.addColorStop(0.21, '#6b8382');
        rib.addColorStop(0.37, '#8ba39f');
        rib.addColorStop(0.56, '#728a88');
        rib.addColorStop(0.78, '#586d6e');
        rib.addColorStop(1, '#46595b');
        for (let y = 0; y < height - 0.01; y += spacing) {
            ctx.save();
            ctx.translate(0, y);
            ctx.fillStyle = rib;
            ctx.fillRect(0, 0, width, spacing + 0.5);
            ctx.restore();
        }

        const rail = width * 0.055 / doorWidth;
        ctx.fillStyle = '#425657';
        ctx.fillRect(0, 0, rail, height);
        ctx.fillRect(width - rail, 0, rail, height);

        const wear = ctx.createLinearGradient(0, height * 0.7, 0, height);
        wear.addColorStop(0, 'rgba(65, 43, 30, 0)');
        wear.addColorStop(1, 'rgba(65, 43, 30, .30)');
        ctx.fillStyle = wear;
        ctx.fillRect(0, height * 0.7, width, height * 0.3);
    });
}

function concreteTexture(THREE) {
    const noise = seededNoise(1986);
    return canvasTexture(THREE, 512, 512, (ctx, width, height) => {
        const base = ctx.createLinearGradient(0, 0, width, height);
        base.addColorStop(0, '#9a8d7e');
        base.addColorStop(0.6, '#aaa096');
        base.addColorStop(1, '#9c8d7e');
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, width, height);
        for (let grain = 0; grain < 4200; grain++) {
            ctx.fillStyle = grain % 2 ? 'rgba(69,55,40,.12)' : 'rgba(253,242,217,.15)';
            const size = 0.5 + noise() * 3;
            ctx.fillRect(noise() * width, noise() * height, size, size * 0.7);
        }

        ctx.strokeStyle = 'rgba(69,55,40,.27)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, 0);
        ctx.lineTo(width * 0.5, height);
        ctx.moveTo(0, height * 0.45);
        ctx.lineTo(width, height * 0.45);
        ctx.stroke();
    });
}

/** The room owns these materials and their textures. Dimensions are in scene units. */
export function createGarageShellMaterials(THREE, {
    backWidth = 10.8, backHeight = 4, doorWidth = 4.8, doorHeight = 3.2,
} = {}) {
    const bricks = brickTexture(THREE, backWidth, backHeight);
    const shutter = doorTexture(THREE, doorWidth, doorHeight);
    return {
        brick: new THREE.MeshStandardMaterial({
            map: bricks, bumpMap: bricks, bumpScale: 0.021, roughness: 0.89,
        }),
        door: new THREE.MeshStandardMaterial({
            map: shutter, bumpMap: shutter, bumpScale: 0.026, metalness: 0.4, roughness: 0.6,
        }),
        floor: new THREE.MeshStandardMaterial({
            map: concreteTexture(THREE), roughness: 0.9, metalness: 0.04,
        }),
        timber: new THREE.MeshStandardMaterial({ color: 0x67452f, roughness: 0.84 }),
        trim: new THREE.MeshStandardMaterial({ color: 0x435254, metalness: 0.32, roughness: 0.65 }),
    };
}

/** Reuse the world's three lights and keep the sun as the only shadow caster. */
export function applyOfficeLighting(world) {
    const { ambientLight, sunLight, rimLight } = world;
    const hologram = world.viewMode === 'dag_hologram';
    const garage = world.currentEra === 1 && !hologram;

    ambientLight.color.setHex(garage ? 0xffd5ab : 0x2d2432);
    ambientLight.intensity = garage ? 0.64 : hologram ? 0.35 : 0.55;

    sunLight.color.setHex(garage ? 0xffe6c4 : 0xffdfba);
    sunLight.intensity = garage ? 1.18 : hologram ? 0.35 : 1.25;
    if (garage) {
        // The high window is on the right side of the back wall.
        sunLight.position.set(5, 8, -5.5);
    } else {
        sunLight.position.set(14, 18, 10);
    }
    sunLight.shadow.normalBias = garage ? 0.018 : 0;

    rimLight.color.setHex(garage ? 0xffbf91 : 0x38bdf8);
    rimLight.intensity = garage ? 0.17 : 0.35;
    rimLight.position.set(garage ? 8 : -12, garage ? 4 : 12, garage ? 7 : -12);
    world.nextShadowRefresh = 0;
}
