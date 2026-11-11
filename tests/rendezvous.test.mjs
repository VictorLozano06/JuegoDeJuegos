import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { spawn } from 'node:child_process';

test('registra, busca, renueva y cierra una sala con credenciales privadas', async () => {
    const socket = createServer().listen(0, '127.0.0.1');
    await once(socket, 'listening');
    const port = socket.address().port;
    await new Promise(resolve => socket.close(resolve));
    const child = spawn(process.execPath, ['online/rendezvous.mjs'], { env: { ...process.env, RENDEZVOUS_PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
    try {
        await Promise.race([once(child.stdout, 'data'), new Promise((_, reject) => setTimeout(() => reject(new Error('No arrancó')), 5000))]);
        const post = async (path, data) => {
            const result = await fetch(`http://127.0.0.1:${port}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            return { status: result.status, body: await result.json() };
        };
        const inviteKey = 'A'.repeat(32);
        const registered = await post('register', { port: 3210, protocol: 'http', inviteKey });
        assert.equal(registered.status, 200);
        const { code, lease } = registered.body;
        assert.match(code, /^[A-HJ-NP-Z2-9]{8}$/);
        assert.deepEqual((await post('lookup', { code: code.toLowerCase() })).body, { address: 'http://127.0.0.1:3210/', inviteKey });
        assert.equal((await post('refresh', { code, lease: 'incorrecta' })).status, 403);
        assert.equal((await post('refresh', { code, lease })).status, 200);
        assert.equal((await post('close', { code, lease })).status, 200);
        assert.equal((await post('lookup', { code })).status, 404);
    } finally { child.kill(); }
});

test('dos servidores de juego encuentran la misma sala por código', async () => {
    const reserve = async () => {
        const listener = createServer().listen(0, '127.0.0.1');
        await once(listener, 'listening');
        const port = listener.address().port;
        await new Promise(resolve => listener.close(resolve));
        return port;
    };
    const ports = [];
    for (let i = 0; i < 3; i++) ports.push(await reserve());
    const children = [];
    const launch = async (file, env) => {
        const child = spawn(process.execPath, [file], { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
        children.push(child);
        const [output] = await once(child.stdout, 'data');
        return String(output);
    };
    const post = async (port, path, data) => {
        const response = await fetch(`http://127.0.0.1:${port}/api/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        assert.equal(response.status, 200);
        return response.json();
    };
    try {
        await launch('online/rendezvous.mjs', { RENDEZVOUS_PORT: String(ports[0]) });
        const env = { DEV_EMPIRE_RENDEZVOUS_URL: `http://127.0.0.1:${ports[0]}` };
        const output = await launch('online/server.mjs', { ...env, DEV_EMPIRE_ONLINE_PORT: String(ports[1]) });
        const hostKey = output.match(/#host=([\w-]+)/)[1];
        await launch('online/server.mjs', { ...env, DEV_EMPIRE_ONLINE_PORT: String(ports[2]) });
        const host = await post(ports[1], 'join', { name: 'Anfitrión', hostKey });
        const { code } = await post(ports[1], 'room-code', { id: host.id });
        const room = await post(ports[2], 'find-room', { code });
        assert.equal(new URL(room.address).port, String(ports[1]));
        const guest = await post(ports[1], 'join', { name: 'Invitado', inviteKey: room.inviteKey });
        assert.ok(guest.id);
    } finally { for (const child of children) child.kill(); }
});
