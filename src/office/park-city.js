import { parkGroundHeight } from './park-landscape.js';
import { PARK_BYPASS, PARK_SIDEWALK_HALF, PARK_STREET } from './park-streets.js';

/** A mix of masonry offices, glass towers, and stepped residential blocks. */
export function buildParkCity(kit, assets) {
    const { mat, block } = kit;
    const stone = mat(0xbdb5a5);
    const warmStone = mat(0x9a8370);
    const concrete = mat(0xaeb5ad);
    const dark = mat(0x414b50, 'metal');
    const roof = mat(0x777d79);
    const glazing = [0x48606a, 0x59717a, 0x6c7e7e, 0x7b8d8d].map(color => mat(color, 'glass'));
    const blocks = [
        [-38,-38,7.2,7,7.2,0], [-26,-38,6.2,7.3,5.8,1], [-16,-38.5,7.4,8,9.0,0],
        [-4.5,-39.8,9.2,8.7,14.8,2], [7.6,-38.6,8.1,7.4,6.8,1], [18.6,-40.5,8.4,8.6,11,2],
        [31,-39,8.3,7.6,14.3,2], [43,-38.6,8.5,8.4,10,0],
        [-39,-24,7.3,7.1,6.9,1], [-39,-13,8,8.6,10.8,2], [-39.5,-2.1,8.5,7.8,7.5,0],
        [-37.6,10,7.4,8,6.9,1], [-39,22.4,8.7,8.5,6.0,0],
        [38.9,-24,7.5,7.3,8.7,2], [39.5,-12.8,7.8,7.8,10,0], [39.7,-0.5,8,8,7.2,1],
        [39.1,11,7.5,7.8,5.5,0], [39.9,22.4,7.8,7.8,6.1,1],
        [-18.5,37.2,8.6,7.5,4.5,1], [-7.3,37.6,9.1,6.8,4.4,0], [11.3,37.8,9.2,7.4,4.7,1],
        [22.1,38.1,6.2,7.1,5.0,0], [-39.1,35.5,8.3,7.4,5.2,1], [42,36,7.9,8,5.9,0]
    ];
    const sourcedBuildings = new Map([
        [0, 'office-low'], [2, 'office-mid'], [5, 'office-mid'], [8, 'office-low'],
        [12, 'office-low'], [13, 'office-mid'], [16, 'office-low'], [17, 'office-mid'],
        [18, 'office-low'], [20, 'office-mid'], [22, 'office-low']
    ]);
    const occupied = [];
    const roads = [-PARK_BYPASS, -PARK_STREET, PARK_STREET, PARK_BYPASS];
    const locate = (x, z, width, depth) => {
        const halfWidth = width / 2 + 0.9;
        const halfDepth = depth / 2 + 0.95;
        const clear = (a, b) => Math.max(Math.abs(a) - halfWidth, Math.abs(b) - halfDepth) > PARK_STREET + PARK_SIDEWALK_HALF && roads.every(road =>
            Math.abs(a - road) >= PARK_SIDEWALK_HALF + halfWidth &&
            Math.abs(b - road) >= PARK_SIDEWALK_HALF + halfDepth) &&
            occupied.every(plot => Math.abs(a - plot.x) >= halfWidth + plot.halfWidth + 0.3 ||
                Math.abs(b - plot.z) >= halfDepth + plot.halfDepth + 0.3);
        const candidates = [];
        for (let dx = -32; dx <= 32; dx += 1) {
            for (let dz = -32; dz <= 32; dz += 1) {
                if (clear(x + dx, z + dz)) candidates.push([x + dx, z + dz, dx * dx + dz * dz]);
            }
        }
        candidates.sort((a, b) => a[2] - b[2]);
        if (!candidates.length) throw new Error('No hay espacio para un edificio del barrio.');
        const [placedX, placedZ] = candidates[0];
        occupied.push({ x: placedX, z: placedZ, halfWidth, halfDepth });
        return [placedX, placedZ];
    };
    for (const [index, [originalX, originalZ, width, depth, height, type]] of blocks.entries()) {
        const [x, z] = locate(originalX, originalZ, width, depth);
        const sourced = sourcedBuildings.get(index);
        if (sourced) {
            block(stone, x, 0.031, z, width + 1.25, 0.061, depth + 1.4);
            const facing = z > 30 ? Math.PI : Math.abs(x) > 34 && z > -34 ? -Math.sign(x) * Math.PI / 2 : 0;
            const sideways = Math.abs(facing) === Math.PI / 2;
            assets.staticModel(`innerscene/${sourced}`, {
                x, y: 0.062, z, width: sideways ? depth : width,
                depth: sideways ? width : depth, height: height * 0.84, yaw: facing
            });
            continue;
        }
        const shell = [stone, warmStone, concrete][type];
        const stories = Math.max(3, Math.round(height / 1.31));
        const storyHeight = height / stories;
        const stepped = type === 2;
        const podiumHeight = stepped ? storyHeight * 1.6 : storyHeight;
        block(stone, x, 0.05, z, width + 1.65, 0.1, depth + 1.8);
        block(shell, x, 0.1 + podiumHeight / 2, z, width, podiumHeight, depth);
        const towerWidth = stepped ? width * 0.79 : width;
        const towerDepth = stepped ? depth * 0.83 : depth;
        block(type === 2 ? dark : shell, x, (height + podiumHeight) / 2 + 0.1, z,
            towerWidth, height - podiumHeight, towerDepth);
        block(concrete, x, height + 0.16, z, towerWidth + 0.15, 0.20, towerDepth + 0.15);
        block(roof, x, height + 0.273, z, towerWidth - 0.20, 0.04, towerDepth - 0.20);
        block(shell, x - towerWidth * 0.19, height + 0.57, z - towerDepth * 0.12, 1.35, 0.61, 1.2);
        for (const side of [-1, 1]) {
            block(glazing[0], x, 0.72, z + side * (depth / 2 + 0.024), width * 0.74, 0.98, 0.06);
            block(glazing[0], x + side * (width / 2 + 0.024), 0.72, z, 0.06, 0.98, depth * 0.74);
        }
        for (let floor = stepped ? 2 : 1; floor < stories; floor++) {
            const y = (floor + 0.57) * storyHeight;
            const inset = type === 1 ? 0.48 : 0.23;
            const dividers = type === 1 ? 5 : 7;
            const paneW = (towerWidth - inset * 2) / dividers;
            const paneD = (towerDepth - inset * 2) / dividers;
            for (const side of [-1, 1]) {
                for (let pane = 0; pane < dividers; pane++) {
                    const offset = pane - (dividers - 1) / 2;
                    const glass = glazing[(index + floor + pane + side + 4) % glazing.length];
                    const gap = type === 1 ? 0.29 : type === 0 ? 0.16 : 0.059;
                    block(glass, x + offset * paneW, y, z + side * (towerDepth / 2 + 0.025),
                        paneW - gap, storyHeight * (type === 2 ? 0.81 : 0.64), 0.06);
                    block(glass, x + side * (towerWidth / 2 + 0.025), y, z + offset * paneD,
                        0.06, storyHeight * (type === 2 ? 0.81 : 0.64), paneD - gap);
                }
            }
        }
    }
    const [towerX, towerZ] = locate(-11.7, -55.4, 8.9, 7.2);
    assets.staticModel('innerscene/office-tower', {
        x: towerX, y: parkGroundHeight(towerX, towerZ), z: towerZ, width: 8.9, height: 19.2, depth: 7.2
    });
}
