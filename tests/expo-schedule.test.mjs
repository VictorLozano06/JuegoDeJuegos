import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';
import { CALENDAR_WEEK_MS, DEVELOPMENT_TICK_MS, hasExpoInvitation, resolveExpoInvitation, updateExpoSchedule } from '../src/expo-schedule.js';

const vite = await createServer({ server: { middlewareMode: true, ws: false } });
after(() => vite.close());
const { game: template } = await vite.ssrLoadModule('/src/simulation.js');
const { SaveSystem } = await vite.ssrLoadModule('/src/SaveSystem.js');
function storage() { const data = new Map(); return { get length() { return data.size; }, key(i) { return [...data.keys()][i] ?? null; }, getItem(k) { return data.get(k) ?? null; }, setItem(k, v) { data.set(k, String(v)); } }; }

test('el calendario y el desarrollo avanzan a la mitad de velocidad manteniendo su proporción', () => {
    assert.equal(CALENDAR_WEEK_MS, 5600);
    assert.equal(DEVELOPMENT_TICK_MS, 240);
    assert.equal(CALENDAR_WEEK_MS / DEVELOPMENT_TICK_MS, 2800 / 120);
});

test('se anuncia una sola feria por año y no se vuelve a ofrecer tras resolverla', () => {
    const game = { year: 1, month: 6, week: 1 };
    assert.equal(updateExpoSchedule(game), true);
    assert.equal(hasExpoInvitation(game), true);
    assert.equal(updateExpoSchedule(game), false);
    assert.equal(resolveExpoInvitation(game), true);
    assert.equal(resolveExpoInvitation(game), false);
    assert.equal(updateExpoSchedule(game), false);
    game.year = 2;
    assert.equal(updateExpoSchedule(game), true);
    assert.equal(hasExpoInvitation(game), true);
});

test('una invitación pendiente se mantiene durante el año y caduca al siguiente', () => {
    const game = { year: 1, month: 6, week: 1 };
    updateExpoSchedule(game);
    game.month = 12; game.week = 4;
    assert.equal(updateExpoSchedule(game), false);
    assert.equal(hasExpoInvitation(game), true);
    game.year = 2; game.month = 1; game.week = 1;
    assert.equal(updateExpoSchedule(game), false);
    assert.equal(hasExpoInvitation(game), false);
    game.month = 6;
    assert.equal(updateExpoSchedule(game), true);
});

test('la invitación y el año resuelto sobreviven al guardado y la carga', () => {
    const saves = new SaveSystem(storage());
    const game = new template.constructor(); game.month = 6; game.week = 1;
    updateExpoSchedule(game); saves.save(game, { id: 'pendiente' });
    const loaded = new template.constructor(); saves.load('pendiente', loaded);
    assert.equal(hasExpoInvitation(loaded), true);
    assert.equal(updateExpoSchedule(loaded), false);
    resolveExpoInvitation(loaded); saves.save(loaded, { id: 'resuelta' });
    const resolved = new template.constructor(); saves.load('resuelta', resolved);
    assert.equal(hasExpoInvitation(resolved), false);
    assert.equal(updateExpoSchedule(resolved), false);
});
