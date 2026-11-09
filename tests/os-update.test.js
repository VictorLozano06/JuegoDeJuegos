import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';
import eventsCatalog from '../src/data/events.json' with { type: 'json' };

const vite = await createServer({ server: { middlewareMode: true, ws: false } });
after(() => vite.close());

const { game } = await vite.ssrLoadModule('/src/simulation.js');
const { SaveSystem } = await vite.ssrLoadModule('/src/SaveSystem.js');
const { UWUNTU_APPS, APP_ICONS, renderOSUpdateAppContent } = await vite.ssrLoadModule('/src/uwuntu-os.js');

class MemoryStorage {
    constructor() { this.data = new Map(); }
    get length() { return this.data.size; }
    key(index) { return [...this.data.keys()][index] ?? null; }
    getItem(key) { return this.data.get(key) ?? null; }
    setItem(key, value) { this.data.set(key, String(value)); }
    removeItem(key) { this.data.delete(key); }
    clear() { this.data.clear(); }
}

test('events.json define el evento de lanzamiento del SO de 2006 sin emojis', () => {
    const event = eventsCatalog.find(e => e.id === 'os_launch_2006');
    assert.ok(event, 'El evento os_launch_2006 debe existir en events.json');
    assert.strictEqual(event.type, 'os_update_announcement');
    assert.strictEqual(event.minYear, 2006);
    assert.strictEqual(event.choices.length, 2);
    assert.ok(event.choices.some(c => c.id === 'open_update_center'));
    assert.ok(event.choices.some(c => c.id === 'update_later'));

    // Verificar prohibición de emojis (agentes/iconografia.md)
    const jsonStr = JSON.stringify(event);
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    assert.strictEqual(emojiRegex.test(jsonStr), false, 'No deben existir emojis en la definición del evento');
});

test('Al llegar al año histórico 2006, la simulación genera la noticia del periódico y evento de SO', () => {
    // Restaura estado inicial
    game.year = 24; // 2005 (1981 + 24)
    game.week = 4;
    game.month = 12;
    delete game.osUpdate2006Announced;
    game.pendingIndustryEvents = [];

    assert.strictEqual(game.getHistoricalYear(), 2005);
    assert.strictEqual(game.osUpdate2006Announced, undefined);

    // Avanza el calendario para cambiar a 2006
    game.advanceCalendar();

    assert.strictEqual(game.getHistoricalYear(), 2006);
    assert.strictEqual(game.osUpdate2006Announced, true, 'Debe marcarse como anunciado');
    assert.ok(game.pendingIndustryEvents.length >= 1, 'Debe haber un evento de industria pendiente');

    const osEvent = game.pendingIndustryEvents.find(e => e.type === 'os_update_announcement');
    assert.ok(osEvent, 'El evento pendiente debe ser de tipo os_update_announcement');
    assert.ok(osEvent.headline.includes('2006') || osEvent.title.includes('2006'));
});

test('La resolución de la noticia permite abrir el centro de actualizaciones o posponerlo', () => {
    game.pendingIndustryEvents = [];
    game.createIndustryEvent('os_launch_2006');

    const pending = game.pendingIndustryEvents.find(e => e.type === 'os_update_announcement');
    assert.ok(pending);

    const result = game.resolveIndustryEvent(pending.id, 'open_update_center');
    assert.strictEqual(result.success, true);
    assert.ok(result.message.includes('Centro de Actualizaciones'));
    assert.strictEqual(game.pendingIndustryEvents.length, 0);
});

test('El sistema de guardado persiste el estado del anuncio y la actualización del SO', () => {
    const storage = new MemoryStorage();
    const saveSystem = new SaveSystem(storage);

    game.year = 25;
    game.osUpdate2006Announced = true;
    game.osUpdated2006 = true;

    saveSystem.save(game, { id: 'test_os' });

    // Resetea
    game.osUpdate2006Announced = false;
    game.osUpdated2006 = false;

    saveSystem.load('test_os', game);

    assert.strictEqual(game.osUpdate2006Announced, true);
    assert.strictEqual(game.osUpdated2006, true);
});

test('El catálogo de apps de Uwuntu OS incluye Centro de Actualizaciones y renderiza sin errores', () => {
    const updateApp = UWUNTU_APPS.find(a => a.id === 'app-os-update');
    assert.ok(updateApp, 'app-os-update debe estar en UWUNTU_APPS');
    assert.strictEqual(updateApp.category, 'Sistema');
    assert.ok(APP_ICONS.osUpdate, 'Icono SVG osUpdate debe estar definido');

    // Probar render pre-actualización
    const container = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
    const fakeOS = {
        is2006Updated: false,
        getHistoricalYear: () => 2006,
        forceUpdateAvailable: false
    };
    const fakeGame = { year: 25 };

    renderOSUpdateAppContent(container, fakeGame, fakeOS);
    assert.ok(container.innerHTML.includes('Uwuntu XD 2006 · Crystal Aero'));
    assert.ok(container.innerHTML.includes('Instalar y Reiniciar Escritorio'));

    // Probar render post-actualización
    fakeOS.is2006Updated = true;
    renderOSUpdateAppContent(container, fakeGame, fakeOS);
    assert.ok(container.innerHTML.includes('SISTEMA AL DÍA'));
    assert.ok(container.innerHTML.includes('Buscar actualizaciones'));
});
