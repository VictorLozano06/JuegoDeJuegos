import { createServer } from 'node:http';
import { createServer as createTlsServer } from 'node:https';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.DEV_EMPIRE_ONLINE_PORT || 3210);
const tlsKey = process.env.DEV_EMPIRE_ONLINE_TLS_KEY;
const tlsCert = process.env.DEV_EMPIRE_ONLINE_TLS_CERT;
const rendezvousUrl = process.env.DEV_EMPIRE_RENDEZVOUS_URL;
let roomLease = null;
let leaseTimer = null;
async function rendezvous(action, data) {
    if (!rendezvousUrl) throw new Error('El servicio de encuentro no está configurado.');
    const base = new URL(rendezvousUrl);
    if (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname))) throw new Error('El servicio de encuentro debe usar HTTPS.');
    const response = await fetch(new URL(`/${action}`, base), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(8000) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'El servicio de encuentro no responde.');
    return result;
}
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Puerto inválido.');
if (Boolean(tlsKey) !== Boolean(tlsCert)) throw new Error('Configura tanto el certificado como la clave TLS.');
const token = () => randomBytes(24).toString('base64url');
const inviteKey = token();
const hostKey = token();
const players = new Map();
const state = { week: 1, running: false };
// The host is the sole writer. Revisions prevent an older request from
// silently overwriting a newer snapshot when network requests arrive out of order.
let gameSnapshot = null;
let gameRevision = 0;
let match = null;
const gameRoot = fileURLToPath(new URL('../dist', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.mp4': 'video/mp4', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.woff2': 'font/woff2' };
const commands = new Map();
const maxPendingCommands = 100;
const lifetime = 45_000;
const assets = new Map([
    ['/', ['index.html', 'text/html; charset=utf-8']],
    ['/lobby.js', ['lobby.js', 'text/javascript; charset=utf-8']],
    ['/lobby.css', ['lobby.css', 'text/css; charset=utf-8']]
]);
const equal = (a, b) => {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const left = Buffer.from(a), right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
};
function prune() {
    const now = Date.now();
    for (const [id, player] of players) if (now - player.seen > lifetime) players.delete(id);
    for (const [id, command] of commands) if (now - command.created > 300_000) commands.delete(id);
    if (![...players.values()].some(player => player.host)) state.running = false;

}
function send(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(JSON.stringify(data));
}
async function body(req, limit) {
    const chunks = [];
    let length = 0;
    for await (const chunk of req) {
        length += chunk.length;
        if (length > limit) throw new Error('Solicitud demasiado grande.');
        chunks.push(chunk);
    }
    return JSON.parse(length ? Buffer.concat(chunks, length).toString('utf8') : '{}');
}
async function handleRequest(req, res) {
    let url;
    try { url = new URL(req.url, 'http://localhost'); }
    catch { return send(res, 400, { error: 'Ruta no válida.' }); }
    if (req.method === 'GET' && url.pathname !== '/' && !assets.has(url.pathname) && !url.pathname.startsWith('/api/')) {
        try {
            const root = await realpath(gameRoot);
            const relative = url.pathname.startsWith('/play/') ? url.pathname.slice(6) : url.pathname.slice(1);
            const requested = resolve(root, decodeURIComponent(relative) || 'index.html');
            if (!requested.startsWith(root + sep)) return send(res, 404, { error: 'Archivo no encontrado.' });
            const file = await realpath(requested);
            if (!file.startsWith(root + sep)) return send(res, 404, { error: 'Archivo no encontrado.' });
            const info = await stat(file);
            if (!info.isFile()) return send(res, 404, { error: 'Archivo no encontrado.' });
            res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Content-Length': info.size, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
            const stream = createReadStream(file);
            stream.on('error', () => res.destroy());
            res.on('close', () => stream.destroy());
            stream.pipe(res);
        } catch { return send(res, 404, { error: 'No se encontró el juego. Ejecuta npm run build.' }); }
        return;
    }
    const asset = assets.get(url.pathname);
    if (req.method === 'GET' && asset) {
        try {
            const contents = await readFile(new URL(asset[0], import.meta.url));
            res.writeHead(200, { 'Content-Type': asset[1], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; connect-src 'self'; style-src 'self'; script-src 'self'; frame-src 'self'; frame-ancestors 'none'" });
            res.end(contents);
        } catch { res.writeHead(500); res.end(); }
        return;
    }
    if (req.method !== 'POST' || !url.pathname.startsWith('/api/')) return send(res, 404, { error: 'Ruta desconocida.' });
    const protocol = tlsKey ? 'https' : 'http';
    if (req.headers.origin && req.headers.origin !== `${protocol}://${req.headers.host}`) return send(res, 403, { error: 'Origen no permitido.' });
    try {
        const largeRequest = ['/api/publish', '/api/command-complete'].includes(url.pathname);
        const input = await body(req, largeRequest ? 16_000_000 : 32_768);
        prune();
        if (url.pathname === '/api/find-room') {
            try { return send(res, 200, await rendezvous('lookup', { code: input.code })); }
            catch (error) { return send(res, 503, { error: error.message }); }
        }
        if (url.pathname === '/api/join') {
            const host = equal(input.hostKey, hostKey);
            if (!host && !equal(input.inviteKey, inviteKey)) return send(res, 403, { error: 'Invitación no válida.' });
            if (host && [...players.values()].some(player => player.host)) return send(res, 409, { error: 'El anfitrión ya está conectado.' });
            const name = typeof input.name === 'string' ? input.name.trim().replace(/[\x00-\x1f\x7f]/g, '').slice(0, 24) : '';
            if (!name) return send(res, 400, { error: 'Escribe un nombre.' });
            const capacity = 4;
            if (players.size >= capacity) return send(res, 409, { error: `La sala está completa (máximo ${capacity} jugadores).` });
            const id = token();
            const seat = token();
            players.set(id, { name, host, seat, seen: Date.now() });
            return send(res, 200, { id, seat, host, inviteKey: host ? inviteKey : undefined });
        }
        const player = players.get(input.id);
        if (!player) return send(res, 401, { error: 'La sesión ha caducado. Vuelve a entrar.' });
        player.seen = Date.now();
        if (url.pathname === '/api/room-code') {
            if (!player.host) return send(res, 403, { error: 'Solo el anfitrión puede crear un código.' });
            try {
                if (!roomLease) {
                    roomLease = await rendezvous('register', { port, protocol: tlsKey ? 'https' : 'http', inviteKey });
                    leaseTimer = setInterval(async () => {
                        try { await rendezvous('refresh', roomLease); }
                        catch { clearInterval(leaseTimer); leaseTimer = null; roomLease = null; }
                    }, 30000);
                }
                return send(res, 200, { code: roomLease.code });
            } catch (error) { return send(res, 503, { error: error.message }); }
        }
        if (url.pathname === '/api/start') {
            if (!player.host) return send(res, 403, { error: 'Solo el anfitrión puede iniciar.' });
            if (match || input.mode !== 'competitive') return send(res, 409, { error: 'La partida ya ha empezado o el modo no es válido.' });
            match = { mode: 'competitive', scores: new Map() };
        } else if (url.pathname === '/api/score') {
            if (match?.mode !== 'competitive') return send(res, 409, { error: 'No hay competición.' });
            if (typeof input.studio !== 'string' || !Number.isFinite(input.funds) || !Number.isSafeInteger(input.releases) || input.releases < 0) return send(res, 400, { error: 'Resultado no válido.' });
            match.scores.set(player.seat, { player: player.name, studio: input.studio.slice(0, 48), funds: input.funds, releases: input.releases });
            return send(res, 200, { ok: true });
        }
        if (url.pathname === '/api/leave') {
            players.delete(input.id);
            if (player.host && roomLease) {
                clearInterval(leaseTimer);
                void rendezvous('close', roomLease).catch(() => {});
                roomLease = null;
                leaseTimer = null;
            }
            prune();
            return send(res, 200, { ok: true });
        }
        if (url.pathname === '/api/game') {
            return send(res, 200, { revision: gameRevision, snapshot: gameSnapshot });
        }
        if (url.pathname === '/api/publish') {
            if (!player.host) return send(res, 403, { error: 'Solo el anfitrión puede publicar la partida.' });
            if (input.revision !== gameRevision) return send(res, 409, { error: 'La partida ha cambiado; actualiza el estado.', revision: gameRevision });
            if (!input.snapshot || typeof input.snapshot !== 'object' || Array.isArray(input.snapshot)) return send(res, 400, { error: 'Estado de partida no válido.' });
            gameSnapshot = input.snapshot;
            gameRevision++;
            return send(res, 200, { revision: gameRevision });
        }
        // Guests submit intentions; only the host may apply them to the game.
        if (url.pathname === '/api/command') {
            if (player.host) return send(res, 403, { error: 'El anfitrión ya controla la partida.' });
            if (typeof input.commandId !== 'string' || !/^[a-zA-Z0-9_-]{16,80}$/.test(input.commandId) ||
                typeof input.action !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(input.action) ||
                !Array.isArray(input.args) || JSON.stringify(input.args).length > 16_384) {
                return send(res, 400, { error: 'Acción no válida.' });
            }
            const existing = commands.get(input.commandId);
            if (existing) {
                if (existing.owner !== input.id) return send(res, 409, { error: 'Identificador de acción ya utilizado.' });
                if (existing.action !== input.action || JSON.stringify(existing.args) !== JSON.stringify(input.args)) return send(res, 409, { error: 'La acción no coincide con la solicitud original.' });
                return send(res, 200, { status: existing.status, result: existing.result });
            }
            if ([...commands.values()].filter(command => command.status === 'pending').length >= maxPendingCommands || commands.size >= 1000) return send(res, 429, { error: 'Hay demasiadas acciones pendientes.' });
            commands.set(input.commandId, { owner: input.id, name: player.name, action: input.action, args: input.args, status: 'pending', created: Date.now() });
            return send(res, 200, { status: 'pending' });
        }
        if (url.pathname === '/api/commands') {
            if (!player.host) return send(res, 403, { error: 'Solo el anfitrión puede consultar las acciones.' });
            const pending = [...commands].filter(([, command]) => command.status === 'pending')
                .map(([id, { name, action, args }]) => ({ id, name, action, args }));
            return send(res, 200, { commands: pending });
        }
        if (url.pathname === '/api/command-result') {
            const command = commands.get(input.commandId);
            if (!command || command.owner !== input.id) return send(res, 404, { error: 'Acción desconocida.' });
            const result = { status: command.status, result: command.result };
            return send(res, 200, result);
        }
        if (url.pathname === '/api/command-complete') {
            if (!player.host) return send(res, 403, { error: 'Solo el anfitrión puede confirmar acciones.' });
            const command = commands.get(input.commandId);
            if (!command) return send(res, 404, { error: 'Acción desconocida.' });
            if (command.status !== 'pending') return send(res, 200, { ok: true, revision: command.committedRevision });
            if (typeof input.success !== 'boolean' || typeof input.message !== 'string' || input.message.length > 500) return send(res, 400, { error: 'Resultado no válido.' });
            if (input.success) {
                if (input.revision !== gameRevision) return send(res, 409, { error: 'La partida ha cambiado; actualiza el estado.', revision: gameRevision });
                if (!input.snapshot || typeof input.snapshot !== 'object' || Array.isArray(input.snapshot)) return send(res, 400, { error: 'Estado de partida no válido.' });
                gameSnapshot = input.snapshot;
                gameRevision++;
            }
            command.status = input.success ? 'completed' : 'rejected';
            command.result = { message: input.message };
            command.committedRevision = gameRevision;
            return send(res, 200, { ok: true, revision: gameRevision });
        }
        if (url.pathname === '/api/control') {
            if (!player.host) return send(res, 403, { error: 'Solo el anfitrión controla el calendario.' });
            if (input.action === 'toggle') state.running = !state.running;
            else if (input.action === 'advance' && !state.running) state.week++;
            else return send(res, 400, { error: 'Acción no disponible.' });
        } else if (!['/api/state', '/api/start'].includes(url.pathname)) return send(res, 404, { error: 'Ruta desconocida.' });
        return send(res, 200, {
            week: state.week, running: state.running,
            players: [...players.values()].map(({ name, host, seat }) => ({ name, host, seat })),
            match: match && {
                mode: match.mode,
                ranking: [...match.scores.values()].sort((a, b) => b.funds - a.funds || b.releases - a.releases)
            }
        });
    } catch { return send(res, 400, { error: 'Solicitud no válida.' }); }
}
const server = tlsKey
    ? createTlsServer({ key: await readFile(tlsKey), cert: await readFile(tlsCert) }, handleRequest)
    : createServer(handleRequest);
export const onlineServer = server;
export const hostUrl = `${process.env.DEV_EMPIRE_ONLINE_ORIGIN || `${tlsKey ? 'https' : 'http'}://localhost:${port}`}/#host=${hostKey}`;
const timer = setInterval(() => { prune(); if (state.running) state.week++; }, 5000);
server.on('close', () => { clearInterval(timer); clearInterval(leaseTimer); if (roomLease) void rendezvous('close', roomLease).catch(() => {}); });
server.listen(port, '0.0.0.0', () => {
    const addresses = Object.values(networkInterfaces()).flat().filter(item => item && item.family === 'IPv4' && !item.internal);
    const origin = process.env.DEV_EMPIRE_ONLINE_ORIGIN || `${tlsKey ? 'https' : 'http'}://localhost:${port}`;
    console.log(`Sala lista en ${origin.replace(/\/$/, '')}/#host=${hostKey}`);
    console.log(`Para invitar, abre la sala y comparte el enlace con la dirección alcanzable por tus amigos. Puerto TCP: ${port}.`);
    for (const address of addresses) console.log(`Dirección local disponible: ${address.address}`);
});
