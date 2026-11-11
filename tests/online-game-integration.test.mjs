import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer as createVite } from 'vite';
import { createServer as createSocket } from 'node:net';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HostCommandProcessor } from '../src/online/host-command-processor.js';

const vite = await createVite({ server: { middlewareMode: true, ws: false } });
after(() => vite.close());
const { game: template } = await vite.ssrLoadModule('/src/simulation.js');
const { SaveSystem } = await vite.ssrLoadModule('/src/SaveSystem.js');

test('una acción del invitado modifica el juego del anfitrión y llega en la copia compartida', async () => {
    const socket = createSocket();
    socket.listen(0, '127.0.0.1');
    await once(socket, 'listening');
    const port = socket.address().port;
    await new Promise(resolve => socket.close(resolve));
    const folder = await mkdtemp(join(tmpdir(), 'dev-empire-game-'));
    const file = join(folder, 'coop.json');
    const child = spawn(process.execPath, ['online/server.mjs'], { env: { ...process.env, DEV_EMPIRE_ONLINE_PORT: String(port), DEV_EMPIRE_ONLINE_SAVE: file }, stdio: ['ignore', 'pipe', 'pipe'] });
    try {
        const hostKey = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('El servidor no ha arrancado')), 5000);
            child.stdout.on('data', data => {
                const match = String(data).match(/#host=([\w-]+)/);
                if (match) { clearTimeout(timeout); resolve(match[1]); }
            });
            child.once('error', reject);
            child.once('exit', code => reject(new Error(`Servidor finalizado: ${code}`)));
        });
        const request = async (route, payload) => {
            const response = await fetch(`http://127.0.0.1:${port}/api/${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            return result;
        };
        const host = await request('join', { name: 'Anfitrión', hostKey });
        const guest = await request('join', { name: 'Invitado', inviteKey: host.inviteKey });
        const game = new template.constructor();
        const saves = new SaveSystem();
        const initial = await request('publish', { id: host.id, revision: 0, snapshot: saves.exportSnapshot(game) });
        const processor = new HostCommandProcessor({ game, saves, request, sessionId: host.id, revision: initial.revision });
        await request('command', { id: guest.id, commandId: 'integration_command_001', action: 'setWorkMode', args: ['relaxed'] });
        await processor.process();
        assert.equal(game.workMode, 'relaxed');
        assert.equal((await request('command-result', { id: guest.id, commandId: 'integration_command_001' })).status, 'completed');
        const snapshot = (await request('game', { id: guest.id })).snapshot;
        const guestGame = new template.constructor();
        saves.importSnapshot(snapshot, guestGame);
        assert.equal(guestGame.workMode, 'relaxed');
        await request('start', { id: host.id, mode: 'competitive' });
        await request('score', { id: host.id, studio: game.companyName, funds: game.funds, releases: game.gamesHistory.length });
        assert.equal((await request('state', { id: guest.id })).match.ranking[0].studio, game.companyName);
    } finally {
        child.kill();
        await rm(folder, { recursive: true, force: true });
    }
});
