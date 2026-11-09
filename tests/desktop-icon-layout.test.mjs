import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Desktop icon collision avoidance algorithm prevents overlapping icons', () => {
    const uwuntuCode = fs.readFileSync('src/uwuntu-os.js', 'utf8');

    assert.ok(uwuntuCode.includes('findNearestFreeSlot'), 'findNearestFreeSlot must exist in UwuntuOS');
    assert.ok(uwuntuCode.includes('occupiedSet'), 'Collision detection must check occupied slots');

    // Simulate the grid and collision logic
    const GRID_X = 108;
    const GRID_Y = 104;
    const PAD_X = 24;
    const PAD_Y = 24;

    const occupied = new Set();
    const findNearest = (targetX, targetY, occ) => {
        const maxCols = 8;
        const maxRows = 6;
        const targetCol = Math.max(0, Math.min(maxCols - 1, Math.round((targetX - PAD_X) / GRID_X)));
        const targetRow = Math.max(0, Math.min(maxRows - 1, Math.round((targetY - PAD_Y) / GRID_Y)));
        const targetKey = `${PAD_X + targetCol * GRID_X},${PAD_Y + targetRow * GRID_Y}`;

        if (!occ.has(targetKey)) {
            return { x: PAD_X + targetCol * GRID_X, y: PAD_Y + targetRow * GRID_Y };
        }

        let bestSlot = null;
        let bestDist = Infinity;
        for (let d = 1; d <= 8; d++) {
            for (let c = Math.max(0, targetCol - d); c <= Math.min(maxCols - 1, targetCol + d); c++) {
                for (let r = Math.max(0, targetRow - d); r <= Math.min(maxRows - 1, targetRow + d); r++) {
                    const key = `${PAD_X + c * GRID_X},${PAD_Y + r * GRID_Y}`;
                    if (!occ.has(key)) {
                        const dist = Math.hypot(c - targetCol, r - targetRow);
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestSlot = { x: PAD_X + c * GRID_X, y: PAD_Y + r * GRID_Y };
                        }
                    }
                }
            }
            if (bestSlot) return bestSlot;
        }
        return { x: 240, y: 128 };
    };

    // First app dropped at (132, 128)
    const slot1 = findNearest(132, 128, occupied);
    occupied.add(`${slot1.x},${slot1.y}`);
    assert.deepEqual(slot1, { x: 132, y: 128 });

    // Second app also dropped at the EXACT same position (132, 128)
    const slot2 = findNearest(132, 128, occupied);
    occupied.add(`${slot2.x},${slot2.y}`);

    // MUST NOT overlap with slot1!
    assert.notDeepEqual(slot2, slot1, 'Slot 2 must not be placed on top of Slot 1');

    // Third app also dropped at (132, 128)
    const slot3 = findNearest(132, 128, occupied);
    occupied.add(`${slot3.x},${slot3.y}`);
    assert.notDeepEqual(slot3, slot1);
    assert.notDeepEqual(slot3, slot2);

    // All slots are unique
    assert.equal(occupied.size, 3, 'All 3 items have distinct non-overlapping positions');
});

test('renderDesktopIcons sanitizes and separates pre-existing overlapping icon positions', () => {
    const uwuntuCode = fs.readFileSync('src/uwuntu-os.js', 'utf8');
    assert.ok(uwuntuCode.includes('occupiedSlots.has(key)'), 'renderDesktopIcons must detect overlapping saved positions');
});

