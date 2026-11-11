import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

const port = Number(process.env.PORT || process.env.RENDEZVOUS_PORT || 3220);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Puerto inválido.');
const rooms = new Map();
const requests = new Map();
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const lifetime = 90_000;
const secret = () => randomBytes(24).toString('base64url');
function makeCode() {
    const bytes = randomBytes(8);
    return [...bytes].map(byte => alphabet[byte % alphabet.length]).join('');
}
function reply(res, status, value) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(JSON.stringify(value));
}
function equal(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const left = Buffer.from(a), right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
}
function prune() {
    const now = Date.now();
    for (const [code, room] of rooms) if (room.expires <= now) rooms.delete(code);
    for (const [address, entry] of requests) if (entry.until <= now) requests.delete(address);
}
const server = createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') return reply(res, 200, { service: 'dev-empire-online', status: 'ok' });
    if (req.method !== 'POST' || !['/register', '/refresh', '/lookup', '/close', '/relay', '/poll', '/reply'].includes(req.url)) return reply(res, 404, { error: 'Ruta desconocida.' });
    const source = req.socket.remoteAddress;
    const now = Date.now();
    const counter = requests.get(source);
    if (!counter || counter.until <= now) requests.set(source, { count: 1, until: now + 60000 });
    else if (++counter.count > 1200) return reply(res, 429, { error: 'Demasiadas solicitudes. Inténtalo más tarde.' });
    try {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
            size += chunk.length;
            if (size > 65536) return reply(res, 413, { error: 'Solicitud demasiado grande.' });
            chunks.push(chunk);
        }
        const input = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        prune();
        if (req.url === '/register') {
            if (rooms.size >= 10000) return reply(res, 503, { error: 'Servicio ocupado.' });
            const ip = req.socket.remoteAddress?.replace(/^::ffff:/, '');
            if (!isIP(ip) || !Number.isInteger(input.port) || input.port < 1 || input.port > 65535 ||
                !['http', 'https'].includes(input.protocol) || !/^[A-Za-z0-9_-]{32}$/.test(input.inviteKey || '')) return reply(res, 400, { error: 'Datos de sala no válidos.' });
            let code;
            do { code = makeCode(); } while (rooms.has(code));
            const lease = secret();
            const hostname = isIP(ip) === 6 ? `[${ip}]` : ip;
            rooms.set(code, { address: `${input.protocol}://${hostname}:${input.port}/`, inviteKey: input.inviteKey, lease, expires: Date.now() + lifetime, pending: new Map() });
            return reply(res, 200, { code, lease, expiresIn: lifetime });
        }
        const code = typeof input.code === 'string' ? input.code.toUpperCase() : '';
        if (!/^[A-HJ-NP-Z2-9]{8}$/.test(code)) return reply(res, 400, { error: 'Código de sala no válido.' });
        const room = rooms.get(code);
        if (!room) return reply(res, 404, { error: 'Sala no encontrada o caducada.' });
        if (req.url === '/lookup') return reply(res, 200, { address: room.address, inviteKey: room.inviteKey });
        if (req.url === '/relay') {
            if (!['join', 'state', 'score', 'leave'].includes(input.action) || !input.data || typeof input.data !== 'object' || Array.isArray(input.data)) return reply(res, 400, { error: 'Solicitud no válida.' });
            if (room.pending.size >= 50) return reply(res, 429, { error: 'La sala está ocupada.' });
            const id = secret();
            const timeout = setTimeout(() => {
                room.pending.delete(id);
                if (!res.writableEnded) reply(res, 504, { error: 'El anfitrión no responde.' });
            }, 7000);
            room.pending.set(id, { id, action: input.action, data: input.data, res, timeout, sent: 0 });
            res.on('close', () => { clearTimeout(timeout); room.pending.delete(id); });
            return;
        }
        if (!equal(input.lease, room.lease)) return reply(res, 403, { error: 'Acceso no autorizado.' });
        if (req.url === '/poll') {
            const pending = [...room.pending.values()].filter(item => Date.now() - item.sent > 2000);
            for (const item of pending) item.sent = Date.now();
            return reply(res, 200, { requests: pending.map(({ id, action, data }) => ({ id, action, data })) });
        }
        if (req.url === '/reply') {
            const item = room.pending.get(input.requestId);
            if (!item) return reply(res, 404, { error: 'Solicitud caducada.' });
            if (!Number.isInteger(input.status) || input.status < 200 || input.status > 599 || !input.data || typeof input.data !== 'object') return reply(res, 400, { error: 'Respuesta no válida.' });
            clearTimeout(item.timeout);
            room.pending.delete(input.requestId);
            if (!item.res.writableEnded) reply(item.res, 200, { status: input.status, data: input.data });
            return reply(res, 200, { ok: true });
        }
        if (req.url === '/close') rooms.delete(code);
        else room.expires = Date.now() + lifetime;
        return reply(res, 200, { ok: true });
    } catch { return reply(res, 400, { error: 'Solicitud no válida.' }); }
});
const cleanup = setInterval(prune, lifetime);
cleanup.unref();
server.listen(port, '0.0.0.0', () => console.log(`Servicio de encuentro escuchando en el puerto ${port}.`));
