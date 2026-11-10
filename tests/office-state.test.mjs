import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true, ws: false } });
after(() => vite.close());

const { game: gameTemplate } = await vite.ssrLoadModule('/src/simulation.js');
const { SaveSystem } = await vite.ssrLoadModule('/src/SaveSystem.js');
const newGame = () => new gameTemplate.constructor();
const modernOffice = game => game.getOffices().find(office => office.id === 'modern');

function storageForTests() {
    const entries = new Map();
    return {
        get length() { return entries.size; },
        key(index) { return Array.from(entries.keys())[index] ?? null; },
        getItem(key) { return entries.get(key) ?? null; },
        setItem(key, value) { entries.set(key, value); }
    };
}

test('the garage is active and the modern office costs exactly 500,000', () => {
    const game = newGame();
    assert.equal(game.getActiveOffice().id, 'garage');
    assert.equal(game.getMaxStaffCapacity(), 2);
    assert.equal(modernOffice(game).cost, 500000);
    assert.equal(modernOffice(game).status, 'locked');
    game.funds = 499999;
    const failed = game.purchaseOffice('modern');
    assert.equal(failed.success, false);
    assert.match(failed.message, /Fondos insuficientes/);
    assert.equal(game.funds, 499999);
    assert.equal(game.getActiveOffice().id, 'garage');
    assert.deepEqual(game.unlockedOfficeIds, ['garage']);
});

test('the purchase charges once, unlocks the modern office and makes it active', () => {
    const game = newGame();
    game.funds = 500000;
    assert.equal(modernOffice(game).status, 'available');
    assert.equal(game.purchaseOffice('modern').success, true);
    assert.equal(game.funds, 0);
    assert.equal(game.era, 2);
    assert.equal(game.getActiveOffice().id, 'modern');
    assert.equal(modernOffice(game).isUnlocked, true);
    assert.equal(modernOffice(game).status, 'active');
    assert.equal(game.purchaseOffice('modern').success, false);
    assert.equal(game.funds, 0);
    assert.equal(game.getMaxStaffCapacity(), 5);
});

test('four employees fit alongside the founder and a smaller office cannot evict them', () => {
    const game = newGame();
    game.funds = 501000;
    game.purchaseOffice('modern');
    for (let i = 1; i <= 4; i++) {
        assert.equal(game.hireEmployee({ name: `Employee ${i}`, salary: 100 }).success, true);
    }
    assert.equal(game.employees.length, 5);
    assert.equal(game.hireEmployee({ name: 'Employee 5', salary: 100 }).success, false);
    assert.equal(game.activateOffice('garage').success, false);
    assert.equal(game.getActiveOffice().id, 'modern');
    assert.equal(game.funds, 600);
});

test('reopening an unlocked office is free', () => {
    const game = newGame();
    game.funds = 500000;
    game.purchaseOffice('modern');
    assert.equal(game.activateOffice('garage').success, true);
    assert.equal(modernOffice(game).status, 'owned');
    assert.equal(game.activateOffice('modern').success, true);
    assert.equal(game.getActiveOffice().id, 'modern');
    assert.equal(game.funds, 0);
});

test('campus is available from the start without cost or progression requirements', () => {
    const game = newGame();
    game.funds = 0;
    game.gamesHistory = [];
    assert.equal(game.getOffices().find(office => office.id === 'campus').canPurchase, true);
    assert.equal(game.purchaseOffice('campus').success, true);
    assert.equal(game.era, 3);
    assert.equal(game.funds, 0);
    assert.equal(game.getMaxStaffCapacity(), 10);
    game.funds = 1000;
    for (let i = 1; i <= 9; i++) {
        assert.equal(game.hireEmployee({ name: `Employee ${i}`, salary: 100 }).success, true);
    }
    assert.equal(game.employees.length, 10);
    assert.equal(game.hireEmployee({ name: 'Employee 10', salary: 100 }).success, false);
    assert.equal(game.activateOffice('garage').success, false);
    const saves = new SaveSystem(storageForTests());
    saves.save(game, { id: 'campus' });
    const restored = newGame();
    saves.load('campus', restored);
    assert.equal(restored.getActiveOffice().id, 'campus');
    assert.equal(restored.employees.length, 10);
    assert.equal(restored.getMaxStaffCapacity(), 10);
});

test('save and load round trip the active office and ownership', () => {
    const game = newGame();
    const saves = new SaveSystem(storageForTests());
    game.funds = 520000;
    game.purchaseOffice('modern');
    saves.save(game, { id: 'modern' });

    const restored = newGame();
    assert.equal(saves.list()[0].activeOfficeId, 'modern');
    saves.load('modern', restored);
    assert.equal(restored.getActiveOffice().id, 'modern');
    assert.deepEqual(restored.unlockedOfficeIds, ['garage', 'modern']);
    assert.equal(restored.era, 2);
    assert.equal(restored.funds, 20000);
    assert.equal(restored.purchaseOffice('modern').success, false);
});

test('Pera Park is available for a visit and persists as office four without a fourth production era', () => {
    const game = newGame();
    game.funds = 0;
    assert.equal(game.purchaseOffice('pera-park').success, true);
    assert.equal(game.getActiveOffice().tier, 4);
    assert.equal(game.era, 3);
    const saves = new SaveSystem(storageForTests());
    saves.save(game, { id: 'park' });
    const restored = newGame();
    assert.equal(saves.list()[0].currentOffice, 4);
    saves.load('park', restored);
    assert.equal(restored.getActiveOffice().id, 'pera-park');
    assert.equal(restored.era, 3);
});

test('version-one saves without office fields default to the garage or preserve known eras', () => {
    const game = newGame();
    const storage = storageForTests();
    const saves = new SaveSystem(storage);
    const key = 'dev-empire:save:legacy';
    saves.save(game, { id: 'legacy' });
    const slot = JSON.parse(storage.getItem(key));
    delete slot.activeOfficeId;
    delete slot.unlockedOfficeIds;
    const state = slot.state.objects[slot.state.root.ref];
    state.items = state.items.filter(([key]) => key !== 'activeOfficeId' && key !== 'unlockedOfficeIds');

    const restored = newGame();
    storage.setItem(key, JSON.stringify(slot));
    saves.load('legacy', restored);
    assert.equal(restored.getActiveOffice().id, 'garage');
    assert.deepEqual(restored.unlockedOfficeIds, ['garage']);

    state.items.find(([key]) => key === 'era')[1] = 2;
    storage.setItem(key, JSON.stringify(slot));
    saves.load('legacy', restored);
    assert.equal(restored.getActiveOffice().id, 'modern');
    assert.deepEqual(restored.unlockedOfficeIds, ['garage', 'modern']);
});
