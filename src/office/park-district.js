import { buildParkCity } from './park-city.js';
import { PARK_BYPASS as bypass, PARK_SIDEWALK_HALF, PARK_STREET as street, PARK_STREET_TILE as tile, PARKING_LOT } from './park-streets.js';

/** Streets are laid out on the original Kenney tile grid. */
export function buildParkDistrict(THREE, park, kit, assets) {
    const { mat, block } = kit;
    const walk = mat(0xb9b8ac);
    const roadPaint = mat(0xd9e0d5);
    const road = (name, x, z, yaw = 0) => assets.staticModel(`city-kit-roads/${name}`,
        { x, y: 0.065, z, yaw, width: tile, height: 0.08, depth: tile });
    const streetProp = (name, x, z, yaw, height) => assets.staticModel(`city-kit-roads/${name}`,
        { x, y: 0.064, z, yaw, height, shadow: true });
    const pavementWidth = PARK_SIDEWALK_HALF * 2;
    const outerIndex = Math.round(bypass / tile);
    const junctionIndex = Math.round(street / tile);
    for (const side of [-1, 1]) {
        const at = side * street;
        block(walk, 0, 0.032, at, 2 * bypass, 0.064, pavementWidth);
        block(walk, at, 0.032, 0, pavementWidth, 0.064, 2 * bypass);
        const edge = side * bypass;
        block(walk, 0, 0.033, edge, 2 * bypass + pavementWidth, 0.066, pavementWidth);
        block(walk, edge, 0.033, 0, pavementWidth, 0.066, 2 * bypass - pavementWidth);
        for (let index = 1 - outerIndex; index < outerIndex; index++) {
            const coordinate = index * tile;
            if (Math.abs(index) === junctionIndex) {
                road('road-intersection-path', coordinate, edge, side < 0 ? 0 : Math.PI);
                road('road-intersection-path', edge, coordinate, -side * Math.PI / 2);
            } else {
                road('road-straight', coordinate, edge);
                road('road-straight', edge, coordinate, Math.PI / 2);
            }
        }
        for (let i = 1 - outerIndex; i < outerIndex; i++) {
            const coordinate = i * tile;
            if (Math.abs(i) === junctionIndex) {
                road('road-crossroad-path', coordinate, at);
                streetProp('traffic-light-hanging', coordinate - 3.05, at + 3.05, Math.PI / 2, 2.6);
                continue;
            }
            const piece = i === -3 || i === 0 || i === 3 ? 'road-crossing' : 'road-straight';
            road(piece, coordinate, at);
            road(piece, at, coordinate, Math.PI / 2);
        }
        for (const t of [-20.8, -10.4, 5.2, 15.6, 20.8]) {
            const foot = at - side * 3.03;
            streetProp('light-square', t, foot, side > 0 ? Math.PI : 0, 2.8);
            streetProp('light-curved', foot, t, -side * Math.PI / 2, 2.95);
        }
    }

    road('road-bend-square', -bypass, -bypass, Math.PI / 2);
    road('road-bend-square', bypass, -bypass);
    road('road-bend-square', -bypass, bypass, Math.PI);
    road('road-bend-square', bypass, bypass, -Math.PI / 2);

    buildParkCity(kit, assets);

    const moving = [];
    const makeRoute = (limit, radius, reverse) => {
        const corner = limit - radius;
        const points = [];
        for (let turn = 0; turn < 4; turn++) {
            const angle = turn * Math.PI / 2;
            const cx = (turn < 2 ? 1 : -1) * corner;
            const cz = (turn === 0 || turn === 3 ? 1 : -1) * corner;
            for (let i = 0; i <= 6; i++) {
                const a = angle + i * Math.PI / 12;
                points.push(new THREE.Vector3(cx + Math.sin(a) * radius, 0.146, cz + Math.cos(a) * radius));
            }
        }
        if (reverse) points.reverse();
        // Linear segments preserve the straight lanes. Short segments round the four corners.
        const segments = [];
        let length = 0;
        for (let i = 0; i < points.length; i++) {
            const start = points[i];
            const end = points[(i + 1) % points.length];
            const span = start.distanceTo(end);
            segments.push({ start, end, offset: length, span, heading: Math.atan2(end.x - start.x, end.z - start.z) });
            length += span;
        }
        return { segments, length };
    };
    const clockwise = makeRoute(street - 0.91, 2.15, false);
    const counterclockwise = makeRoute(street + 0.91, 2.55, true);
    const perimeter = makeRoute(bypass - 0.91, 1.85, false);
    function car(name, paint, x, z, yaw, route = null, speed = 0, phase = 0) {
        const vehicle = new THREE.Group();
        vehicle.name = route ? 'Coche en circulación' : 'Coche aparcado';
        vehicle.position.set(x, route ? 0.146 : 0.089, z);
        vehicle.rotation.y = yaw;
        park.add(vehicle);
        const orientation = name === 'sedan' ? { depth: 2.38 } : { width: 2.40, yaw: Math.PI / 2 };
        assets.movingModel(`innerscene/${name}`, vehicle, { ...orientation, paint });
        if (route) moving.push({ vehicle, route, speed, phase });
    }
    car('sedan', 0x514d45, -16, street - 0.91, Math.PI / 2, clockwise, 3.5, 0.06);
    car('sedan', 0x35505b, 8, street + 0.91, -Math.PI / 2, counterclockwise, 3.3, 0.22);
    car('sedan', 0xa3a19a, -street - 0.91, 14, Math.PI, counterclockwise, 3.3, 0.64);
    car('hatchback', 0x5b6267, street - 0.91, -12, 0, clockwise, 3.5, 0.56);
    car('sedan', 0x65524b, 10, -bypass + 0.91, Math.PI / 2, perimeter, 4.1, 0.33);
    const { x: lotX, z: lotZ, width: lotWidth } = PARKING_LOT;
    assets.staticModel('city-kit-roads/road-square', { ...PARKING_LOT, y: 0.03, height: 0.058 });
    const bayCount = 5;
    const bayWidth = (lotWidth - 0.8) / bayCount;
    const firstLine = lotX - bayCount * bayWidth / 2;
    for (let i = 0; i <= bayCount; i++) {
        block(roadPaint, firstLine + i * bayWidth, 0.091, lotZ, 0.06, 0.012, 2.95);
    }
    car('graphite-sedan', 0x4c5157, firstLine + 0.5 * bayWidth, lotZ, Math.PI);
    car('sedan', 0x80776b, firstLine + 2.5 * bayWidth, lotZ, Math.PI);
    car('sedan', 0x49595b, firstLine + 4.5 * bayWidth, lotZ, Math.PI);
    return time => {
        for (const { vehicle, route, speed, phase } of moving) {
            const distance = (phase * route.length + time * speed) % route.length;
            const segment = route.segments.find(({ offset, span }) => distance < offset + span);
            vehicle.position.copy(segment.start).lerp(segment.end, (distance - segment.offset) / segment.span);
            const angle = Math.atan2(Math.sin(segment.heading - vehicle.rotation.y), Math.cos(segment.heading - vehicle.rotation.y));
            vehicle.rotation.y += angle * 0.33;
        }
    };
}
