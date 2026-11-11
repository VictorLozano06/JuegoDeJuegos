import { createServer } from 'node:http';
import { createServer as createTlsServer } from 'node:https';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { homedir, networkInterfaces } from 'node:os';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CALENDAR_WEEK_MS } from '../src/expo-schedule.js';
import { createCompetition, readCompetition, saveCompetition, reportScore, ranking, openCompetitionGala, visibleGala } from './competition.mjs';

const port = Number(process.env.DEV_EMPIRE_ONLINE_PORT || 3210);
const tlsKey = process.env.DEV_EMPIRE_ONLINE_TLS_KEY;
const tlsCert = process.env.DEV_EMPIRE_ONLINE_TLS_CERT;
const rendezvousUrl = process.env.DEV_EMPIRE_RENDEZVOUS_URL || 'https://palegoldenrod-cod-367689.hostingersite.com';
let roomLease = null;
let leaseTimer = null;
let relayTimer = null;
const relayResults = new Map();
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
const matchFile = process.env.DEV_EMPIRE_ONLINE_SAVE || resolve(homedir(), '.dev-empire', 'online-' + port + '.json');
let match = null;
try { match = readCompetition(matchFile); }
catch (error) { console.error('No se pudo leer la partida online:', error.message); }
let nextWeekAt = 0;
function checkpoint() {
    if (match) saveCompetition(matchFile, match);
}
function hostPresent() {
    return [...players.values()].some(player => player.host);
}
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
    if (match?.speed && !hostPresent()) {
        match.speed = 0;
        checkpoint();
    }

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
        const input = await body(req, largeRequest ? 16_000_000 : 65_536);
        prune();
        if (url.pathname === '/api/find-room') {
            try { return send(res, 200, await rendezvous('lookup', { code: input.code })); }
            catch (error) { return send(res, 503, { error: error.message }); }
        }
        if (url.pathname === '/api/relay') {
            if (!['join', 'state', 'score', 'leave', 'message'].includes(input.action) || !input.data || typeof input.data !== 'object' || Array.isArray(input.data)) return send(res, 400, { error: 'Solicitud no válida.' });
            if (input.action === 'join' && input.data.hostKey) return send(res, 403, { error: 'Acción no permitida.' });
            try {
                const result = await rendezvous('relay', { code: input.code, action: input.action, data: input.data });
                return send(res, result.status, result.data);
            } catch (error) { return send(res, 503, { error: error.message }); }
        }
        if (url.pathname === '/api/join') {
            const host = equal(input.hostKey, hostKey);
            if (!host && !equal(input.inviteKey, inviteKey)) return send(res, 403, { error: 'Invitación no válida.' });
            if (!host && match && !hostPresent()) return send(res, 409, { error: 'Esperando al anfitrión.' });
            if (host && [...players.values()].some(player => player.host)) return send(res, 409, { error: 'El anfitrión ya está conectado.' });
            const name = typeof input.name === 'string' ? input.name.trim().replace(/[\x00-\x1f\x7f]/g, '').slice(0, 24) : '';
            if (!name) return send(res, 400, { error: 'Escribe un nombre.' });
            const capacity = 4;
            if (players.size >= capacity) return send(res, 409, { error: `La sala está completa (máximo ${capacity} jugadores).` });
            const id = token();
            const member = [...(match?.members.values() ?? [])].find(saved => host ? saved.host : !saved.host && equal(input.resumeKey, saved.resumeKey));
            if (match && !member && match.members.size >= capacity) return send(res, 409, { error: 'Los cuatro puestos de esta competición están reservados.' });
            if (member && [...players.values()].some(player => player.seat === member.seat)) return send(res, 409, { error: 'Ese jugador ya está conectado.' });
            const seat = member?.seat ?? token();
            const resumeKey = member?.resumeKey ?? token();
            const player = { name, host, seat, resumeKey, seen: Date.now() };
            players.set(id, player);
            if (match) {
                match.members.set(seat, { name, host, seat, resumeKey });
                checkpoint();
            }
            return send(res, 200, { id, seat, host, resumeKey, roomId: match?.id ?? hostKey.slice(0, 12), inviteKey: host ? inviteKey : undefined });
        }
        const player = players.get(input.id);
        if (!player) return send(res, 401, { error: 'La sesión ha caducado. Vuelve a entrar.' });
        player.seen = Date.now();
        if (url.pathname === '/api/room-code') {
            if (!player.host) return send(res, 403, { error: 'Solo el anfitrión puede crear un código.' });
            try {
                if (!roomLease) {
                    roomLease = await rendezvous('register', { port, protocol: tlsKey ? 'https' : 'http', inviteKey, roomId: match?.id ?? hostKey.slice(0, 12) });
                    const lease = roomLease;
                    const poll = async () => {
                        if (roomLease !== lease) return;
                        try {
                            const batch = await rendezvous('poll', lease);
                            for (const item of batch.requests) {
                                if (!['join', 'state', 'score', 'leave', 'message'].includes(item.action)) continue;
                                let result = relayResults.get(item.id);
                                if (!result) {
                                    const response = await fetch(`http://127.0.0.1:${port}/api/${item.action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item.data), signal: AbortSignal.timeout(5000) });
                                    result = { status: response.status, data: await response.json() };
                                    relayResults.set(item.id, result);
                                    if (relayResults.size > 200) relayResults.delete(relayResults.keys().next().value);
                                }
                                try { await rendezvous('reply', { ...lease, requestId: item.id, ...result }); } catch { /* The guest may have disconnected. */ }
                            }
                        } catch { /* Reintentar mientras la sala siga abierta. */ }
                        if (roomLease === lease) relayTimer = setTimeout(poll, 500);
                    };
                    void poll();
                    leaseTimer = setInterval(async () => {
                        try { await rendezvous('refresh', roomLease); }
                        catch { clearInterval(leaseTimer); clearTimeout(relayTimer); leaseTimer = null; roomLease = null; }
                    }, 30000);
                }
                return send(res, 200, { code: roomLease.code });
            } catch (error) { return send(res, 503, { error: error.message }); }
        }
        if (url.pathname === '/api/start') {
            if (!player.host) return send(res, 403, { error: 'Solo el anfitrión puede iniciar.' });
            if (match || input.mode !== 'competitive') return send(res, 409, { error: 'La partida ya ha empezado o el modo no es válido.' });
            match = { ...createCompetition(), id: hostKey.slice(0, 12), saveId: token() };
            for (const { name, host, seat, resumeKey } of players.values()) match.members.set(seat, { name, host, seat, resumeKey });
            checkpoint();
        } else if (url.pathname === '/api/score') {
            if (match?.mode !== 'competitive') return send(res, 409, { error: 'No hay competición.' });
            if (typeof input.studio !== 'string' || !Number.isFinite(input.funds) || !Number.isSafeInteger(input.releases) || input.releases < 0) return send(res, 400, { error: 'Resultado no válido.' });
            if (!hostPresent()) return send(res, 409, { error: 'Esperando al anfitrión.' });
            if (input.matchId && input.matchId !== match.saveId) return send(res, 409, { error: 'El anfitrión ha iniciado otra competición.' });
            reportScore(match, player, input);
            player.week = Number.isSafeInteger(input.week) ? input.week : null;
            checkpoint();
            return send(res, 200, { ok: true });
        }
        if (url.pathname === '/api/message') {
            if (!match || !hostPresent()) return send(res, 409, { error: 'La sala está en pausa.' });
            const message = typeof input.text === 'string' ? input.text.trim().slice(0, 280) : '';
            if (!message || !['chat', 'vread'].includes(input.channel)) return send(res, 400, { error: 'Mensaje no válido.' });
            if (Date.now() - (player.lastMessageAt || 0) < 1500) return send(res, 429, { error: 'Espera un momento antes de enviar otro mensaje.' });
            player.lastMessageAt = Date.now();
            match.messages.push({ id: token(), author: player.name, text: message, channel: input.channel });
            match.messages = match.messages.slice(-100);
            checkpoint();
            return send(res, 200, { ok: true });
        }
        if (url.pathname === '/api/match-control') {
            if (!match || !player.host) return send(res, 403, { error: 'Solo el anfitrión puede controlar la partida.' });
            if (input.action === 'new') {
                match = { ...createCompetition(), id: match.id, saveId: token() };
                for (const participant of players.values()) {
                    const { name, host, seat, resumeKey } = participant;
                    match.members.set(seat, { name, host, seat, resumeKey });
                    participant.week = null;
                }
            } else if (input.action === 'gala' && match.gala) {
                match.gala.step++;
                if (match.gala.step > match.gala.categories.length * 2) {
                    match.ceremonies.push(match.gala);
                    match.gala = null;
                }
            } else if (input.action === 'speed' && !match.gala && [0, 1, 2, 4].includes(input.speed)) {
                match.speed = input.speed;
                nextWeekAt = Date.now() + CALENDAR_WEEK_MS / (match.speed || 1);
            } else return send(res, 409, { error: 'El control no está disponible.' });
            checkpoint();
            return send(res, 200, { ok: true });
        }
        if (url.pathname === '/api/leave') {
            players.delete(input.id);
            if (player.host && match) { match.speed = 0; checkpoint(); }
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
                id: match.id, saveId: match.saveId, mode: match.mode, week: match.week, speed: match.speed, hostPresent: hostPresent(),
                ranking: ranking(match), messages: match.messages, gala: visibleGala(match.gala), ceremonies: match.ceremonies
            }
        });
    } catch { return send(res, 400, { error: 'Solicitud no válida.' }); }
}
const server = tlsKey
    ? createTlsServer({ key: await readFile(tlsKey), cert: await readFile(tlsCert) }, handleRequest)
    : createServer(handleRequest);
export const onlineServer = server;
export const hostUrl = `${process.env.DEV_EMPIRE_ONLINE_ORIGIN || `${tlsKey ? 'https' : 'http'}://localhost:${port}`}/#host=${hostKey}`;
const timer = setInterval(() => {
    try {
        prune();
        if (!match?.speed || !hostPresent() || match.gala || Date.now() < nextWeekAt) return;
        const host = [...players.values()].find(player => player.host);
        if (!Number.isSafeInteger(host?.week) || host.week < match.week) return;
        if (match.week % 48 === 0 && match.ceremonies.at(-1)?.year !== 1982 + Math.floor((match.week - 1) / 48)) {
            openCompetitionGala(match);
            if (match.gala) { checkpoint(); return; }
        }
        match.week++;
        nextWeekAt = Date.now() + CALENDAR_WEEK_MS / match.speed;
        checkpoint();
    } catch (error) { console.error('No se pudo guardar la partida online:', error.message); }
}, 250);
server.on('close', () => { clearInterval(timer); clearInterval(leaseTimer); clearTimeout(relayTimer); if (roomLease) void rendezvous('close', roomLease).catch(() => {}); });
server.listen(port, '0.0.0.0', () => {
    const addresses = Object.values(networkInterfaces()).flat().filter(item => item && item.family === 'IPv4' && !item.internal);
    const origin = process.env.DEV_EMPIRE_ONLINE_ORIGIN || `${tlsKey ? 'https' : 'http'}://localhost:${port}`;
    console.log(`Sala lista en ${origin.replace(/\/$/, '')}/#host=${hostKey}`);
    console.log(`Para invitar, abre la sala y comparte el enlace con la dirección alcanzable por tus amigos. Puerto TCP: ${port}.`);
    for (const address of addresses) console.log(`Dirección local disponible: ${address.address}`);
});
