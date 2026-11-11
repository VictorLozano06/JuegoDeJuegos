import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('sala, permisos y versiones de partida', async () => {
    const socket = createServer();
    socket.listen(0, '127.0.0.1');
    await once(socket, 'listening');
    const port = socket.address().port;
    await new Promise(resolve => socket.close(resolve));
    const folder = await mkdtemp(join(tmpdir(), 'dev-empire-test-'));
    const child = spawn(process.execPath, ['online/server.mjs'], { env: { ...process.env, DEV_EMPIRE_ONLINE_PORT: String(port), DEV_EMPIRE_ONLINE_SAVE: join(folder, 'coop.json') }, stdio: ['ignore', 'pipe', 'pipe'] });
    try {
        const key = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('El servidor no ha arrancado')), 5000);
            child.stdout.on('data', chunk => {
                const match = String(chunk).match(/#host=([\w-]+)/);
                if (match) { clearTimeout(timeout); resolve(match[1]); }
            });
            child.once('error', reject);
            child.once('exit', code => reject(new Error(`Servidor finalizado: ${code}`)));
        });
        const base = `http://127.0.0.1:${port}`;
        const post = async (path, data) => {
            const response = await fetch(`${base}/api/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            return { status: response.status, body: await response.json() };
        };
        assert.equal((await fetch(base)).status, 200);
        assert.equal((await fetch(`${base}/lobby.js`)).status, 200);
        const host = (await post('join', { name: 'Anfitrión', hostKey: key })).body;
        const guest = (await post('join', { name: 'Invitado', inviteKey: host.inviteKey })).body;
        assert.ok(host.host && guest.id);
        assert.equal((await post('join', { name: 'Desconocido', inviteKey: 'incorrecta' })).status, 403);
        assert.equal((await post('control', { id: guest.id, action: 'advance' })).status, 403);
        assert.equal((await post('control', { id: host.id, action: 'advance' })).body.week, 2);
        assert.equal((await post('state', { id: guest.id })).body.week, 2);
        const snapshot = { companyName: 'Estudio', funds: 1000 };
        assert.equal((await post('publish', { id: guest.id, revision: 0, snapshot })).status, 403);
        assert.equal((await post('publish', { id: host.id, revision: 0, snapshot })).body.revision, 1);
        assert.equal((await post('publish', { id: host.id, revision: 0, snapshot })).status, 409);
        assert.deepEqual((await post('game', { id: guest.id })).body, { revision: 1, snapshot });
        const commandId = 'command_test_123456789';
        const command = { id: guest.id, commandId, action: 'setWorkMode', args: ['normal'] };
        assert.equal((await post('command', command)).body.status, 'pending');
        assert.equal((await post('command', command)).body.status, 'pending');
        assert.equal((await post('command', { ...command, args: ['crunch'] })).status, 409);
        assert.equal((await post('commands', { id: guest.id })).status, 403);
        assert.equal((await post('commands', { id: host.id })).body.commands.length, 1);
        assert.equal((await post('command-complete', { id: guest.id, commandId, success: true, message: 'Listo' })).status, 403);
        const updated = { companyName: 'Estudio', funds: 900 };
        assert.equal((await post('command-complete', { id: host.id, commandId, success: true, message: 'Listo', revision: 0, snapshot: updated })).status, 409);
        assert.equal((await post('command-complete', { id: host.id, commandId, success: true, message: 'Listo', revision: 1, snapshot: updated })).body.revision, 2);
        assert.deepEqual((await post('game', { id: guest.id })).body, { revision: 2, snapshot: updated });
        assert.equal((await post('command-complete', { id: host.id, commandId, success: true, message: 'Listo' })).body.revision, 2);
        assert.equal((await post('command-result', { id: guest.id, commandId })).body.status, 'completed');
        assert.equal((await post('commands', { id: host.id })).body.commands.length, 0);
        const third = (await post('join', { name: 'Tercero', inviteKey: host.inviteKey })).body;
        const fourth = (await post('join', { name: 'Cuarto', inviteKey: host.inviteKey })).body;
        assert.ok(third.id && fourth.id);
        assert.equal((await post('join', { name: 'Quinto', inviteKey: host.inviteKey })).status, 409);
        assert.equal((await post('start', { id: host.id, mode: 'coop' })).status, 409);
        await post('leave', { id: third.id });
        await post('leave', { id: fourth.id });
        assert.equal((await post('start', { id: guest.id, mode: 'coop' })).status, 403);
        assert.equal((await post('start', { id: host.id, mode: 'competitive' })).status, 200);
        await post('leave', { id: guest.id });
        assert.equal((await post('state', { id: host.id })).body.players.length, 1);
    } finally {
        child.kill();
        await rm(folder, { recursive: true, force: true });
    }
});

test('la partida competitiva admite cuatro jugadores', async () => {
    const socket = createServer();
    socket.listen(0, '127.0.0.1');
    await once(socket, 'listening');
    const port = socket.address().port;
    await new Promise(resolve => socket.close(resolve));
    const child = spawn(process.execPath, ['online/server.mjs'], { env: { ...process.env, DEV_EMPIRE_ONLINE_PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
    try {
        const key = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('El servidor no ha arrancado')), 5000);
            child.stdout.on('data', chunk => {
                const match = String(chunk).match(/#host=([\w-]+)/);
                if (match) { clearTimeout(timeout); resolve(match[1]); }
            });
            child.once('error', reject);
        });
        const post = async (path, data) => {
            const response = await fetch(`http://127.0.0.1:${port}/api/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            return { status: response.status, body: await response.json() };
        };
        const host = (await post('join', { name: 'Anfitrión', hostKey: key })).body;
        assert.equal((await post('start', { id: host.id, mode: 'competitive' })).status, 200);
        for (let i = 0; i < 3; i++) assert.equal((await post('join', { name: `Jugador ${i}`, inviteKey: host.inviteKey })).status, 200);
        assert.equal((await post('join', { name: 'Quinto', inviteKey: host.inviteKey })).status, 409);
    } finally { child.kill(); }
});
