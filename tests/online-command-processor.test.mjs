import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HostCommandProcessor } from '../src/online/host-command-processor.js';

test('reintenta la confirmación sin ejecutar dos veces una acción', async () => {
    let executions = 0;
    let attempts = 0;
    const game = { setWorkMode(mode) { executions++; return { success: true, message: mode }; } };
    const request = async (route, payload) => {
        if (route === 'commands') return { commands: attempts >= 2 ? [] : [{ id: 'one', action: 'setWorkMode', args: ['normal'] }] };
        assert.equal(payload.snapshot.mode, 'normal');
        if (++attempts === 1) throw new Error('conexión perdida');
        return { revision: 1 };
    };
    const processor = new HostCommandProcessor({ game, saves: { exportSnapshot: () => ({ mode: 'normal' }) }, request, sessionId: 'host' });
    await assert.rejects(processor.process());
    await processor.process();
    assert.equal(executions, 1);
    assert.equal(processor.revision, 1);
});

test('rechaza métodos no autorizados y argumentos inválidos', async () => {
    let dangerous = false;
    const game = { destroyEverything() { dangerous = true; } };
    const results = [];
    const request = async (route, payload) => {
        if (route === 'commands') return { commands: [{ id: 'one', action: 'destroyEverything', args: [] }, { id: 'two', action: 'setWorkMode', args: ['invalid'] }] };
        results.push(payload);
        return { revision: 0 };
    };
    const processor = new HostCommandProcessor({ game, saves: {}, request, sessionId: 'host' });
    await processor.process();
    assert.equal(dangerous, false);
    assert.deepEqual(results.map(item => item.success), [false, false]);
});
