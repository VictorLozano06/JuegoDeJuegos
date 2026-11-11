const $ = selector => document.querySelector(selector);
const fragment = new URLSearchParams(location.hash.slice(1));
const hostKey = fragment.get('host');
const invitation = fragment.get('invite');
history.replaceState(null, '', location.pathname);
let session = null;
let timer = null;
let polling = false;
let playing = null;
let frame = null;
let revision = -1;
let busy = false;
let inRoom = false;
let relayCode = null;
let relayInvite = null;
let relayRoomId = null;
const frameHost = $('#game-frame');
const savedSessionKey = 'dev-empire-online-session';

function showGame(show) {
    $('#game-shell').hidden = !show;
    document.querySelector('main').inert = show;
}

function closeGame() {
    window.onlineGameBridge?.save?.();
    frame?.remove();
    frame = null;
    window.onlineGameBridge = null;
    showGame(false);
    if (galaDialog.open) galaDialog.close();
}

function openGame(match) {
    window.onlineGameBridge = { mode: match.mode, seat: session.seat, saveId: match.saveId, messages: match.messages,
        sendMessage: (channel, text) => request('message', { id: session.id, channel, text }) };
    frame = document.createElement('iframe');
    frame.title = 'Dev Empire 3D';
    frame.src = '/play/';
    frameHost.append(frame);
    inRoom = false;
    showGame(true);
}

function renderMatch(state) {
    if (frame && playing?.saveId !== state.match?.saveId) closeGame();
    playing = state.match;
    $('#host-controls').hidden = !session.host || Boolean(playing);
    $('#new-match').hidden = !session.host || !playing;
    if (!playing) return;
    revision = playing.revision;
    $('#match-title').textContent = 'Competición de estudios';
    $('#game-mode').textContent = `Competitivo · Semana ${playing.week}`;
    $('#match-status').textContent = 'La partida ha comenzado.';
    $('#back-to-game').hidden = false;
    if (!frame && !inRoom) openGame(playing);
    $('#ranking').hidden = false;
    $('#scores').replaceChildren(...playing.ranking.map(entry => {
        const item = document.createElement('li');
        item.textContent = `${entry.studio} (${entry.player}) · ${entry.points} pts · ${entry.rating.toFixed(1)}/10 · ${entry.sales.toLocaleString('es-ES')} ventas · ${entry.fans.toLocaleString('es-ES')} fans · ${entry.awards} premios · ${entry.funds.toLocaleString('es-ES')} €`;
        return item;
    }));
    const releases = playing.ranking.flatMap(entry => entry.titles.map(title => ({ ...title, studio: entry.studio })));
    releases.sort((a, b) => b.releaseIndustryWeek - a.releaseIndustryWeek);
    $('#released-games').replaceChildren(...(releases.length ? releases : [{ name: 'Aún no hay lanzamientos.' }]).map(title => {
        const item = document.createElement('li');
        item.textContent = title.studio ? `${title.name} · ${title.studio} · ${title.score.toFixed(1)}/10 · ${title.unitsSoldTotal.toLocaleString('es-ES')} ventas` : title.name;
        return item;
    }));
    $('#clock-controls').hidden = !session.host;
    $('#match-speed').value = String(playing.speed);
    $('#match-speed').disabled = Boolean(playing.gala);
    const bridge = window.onlineGameBridge;
    if (bridge) {
        bridge.messages = playing.messages;
        bridge.sync?.(playing);
        frame.contentWindow?.dispatchEvent(new Event('online-messages'));
    }
    renderGala();
}

const galaDialog = $('#gala-dialog');
let lastGala = '';
function renderGala() {
    const gala = playing?.gala;
    if (!gala || inRoom || !playing.hostPresent) {
        if (galaDialog.open) galaDialog.close();
        lastGala = '';
        return;
    }
    const key = `${gala.year}:${gala.step}`;
    if (lastGala === key && galaDialog.open) return;
    lastGala = key;
    const category = gala.categories[Math.floor(gala.step / 2)];
    const revealed = gala.step % 2 === 1;
    $('#gala-title').textContent = category?.name ?? `Resultados de la gala de ${gala.year}`;
    $('#gala-nominees').replaceChildren(...(category ? category.nominees : gala.categories.map(item => item.winner)).map(title => {
        const item = document.createElement('li');
        item.textContent = `${title.name} · ${title.studio}`;
        return item;
    }));
    $('#gala-result').textContent = revealed && category ? `Gana ${category.winner.name}, de ${category.winner.studio}.` :
        session.host ? '' : 'Esperando al anfitrión.';
    $('#gala-next').hidden = !session.host;
    $('#gala-next').textContent = category ? revealed ? 'Continuar' : 'Abrir el sobre' : 'Cerrar la gala';
    if (!galaDialog.open) galaDialog.showModal();
}

async function controlMatch(data, control) {
    control.disabled = true;
    try { await request('match-control', { id: session.id, ...data }); return true; }
    catch (error) {
        $(inRoom ? '#room-message' : '#game-status').textContent = error.message;
        return false;
    }
    finally { control.disabled = false; void refresh(); }
}
$('#match-speed').addEventListener('change', event => void controlMatch({ action: 'speed', speed: Number(event.target.value) }, event.target));
$('#gala-next').addEventListener('click', event => void controlMatch({ action: 'gala' }, event.target));
$('#gala-back').addEventListener('click', () => $('#back-to-room').click());
galaDialog.addEventListener('cancel', event => { event.preventDefault(); $('#back-to-room').click(); });

const codeEntry = !hostKey && !invitation;
$('#code-form').hidden = !codeEntry;
$('#join-form').hidden = codeEntry;
$('#role-description').textContent = hostKey ? 'Entra como anfitrión para crear tu sala.' : invitation ? 'Te han invitado a esta sala. Introduce tu nombre para entrar.' : 'Pega el código que te ha pasado el anfitrión.';

function decodeRoomCode(value) {
    if (!/^DE1-[A-Za-z0-9_-]{20,600}$/.test(value)) throw new Error('Comprueba el código de sala.');
    const encoded = value.slice(4).replace(/-/g, '+').replace(/_/g, '/');
    let data;
    try { data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(encoded), char => char.charCodeAt(0)))); }
    catch { throw new Error('El código de sala no es válido.'); }
    let address;
    try { address = new URL(data.address); } catch { throw new Error('La dirección del código no es válida.'); }
    if (!['http:', 'https:'].includes(address.protocol) || address.username || address.password || address.pathname !== '/' || address.search || address.hash ||
        typeof data.key !== 'string' || !/^[A-Za-z0-9_-]{32}$/.test(data.key)) throw new Error('El código de sala no es válido.');
    address.hash = `invite=${data.key}`;
    return address.href;
}

$('#code-form').addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button');
    button.disabled = true;
    try {
        const code = $('#room-code').value.trim();
        let destination;
        if (/^[A-HJ-NP-Z2-9]{8}$/i.test(code)) {
            const room = await request('find-room', { code });
            relayCode = code.toUpperCase();
            relayInvite = room.inviteKey;
            relayRoomId = room.roomId;
            $('#code-form').hidden = true;
            $('#join-form').hidden = false;
            $('#role-description').textContent = 'Sala encontrada. Introduce tu nombre para entrar.';
            $('#player-name').focus();
            return;
        } else destination = decodeRoomCode(code);
        $('#code-error').textContent = '';
        const target = new URL(destination);
        if (target.origin === location.origin && target.pathname === location.pathname) {
            location.hash = target.hash;
            location.reload();
        } else location.assign(destination);
    }
    catch (error) { $('#code-error').textContent = error.message; }
    finally { button.disabled = false; }
});
$('#return-to-menu').addEventListener('click', () => {
    window.close();
    $('#join-error').textContent = 'Puedes cerrar esta pestaña para volver al juego.';
});

async function request(path, data) {
    const throughRelay = relayCode && ['join', 'state', 'score', 'leave', 'message'].includes(path);
    const response = await fetch(throughRelay ? '/api/relay' : `/api/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(throughRelay ? { code: relayCode, action: path, data } : data),
        signal: AbortSignal.timeout(12000)
    });
    const result = await response.json();
    if (!response.ok) {
        const error = new Error(result.error || 'No se ha podido completar la operación.');
        error.status = response.status;
        throw error;
    }
    return result;
}

function render(state) {
    const list = $('#players');
    list.replaceChildren();
    for (const player of state.players) {
        const item = document.createElement('li');
        const name = document.createElement('span');
        name.textContent = player.name;
        item.append(name);
        if (player.host) {
            const role = document.createElement('small');
            role.textContent = 'ANFITRIÓN';
            item.append(role);
        }
        list.append(item);
    }
    renderMatch(state);
    $('#connection-status').textContent = 'Conectado';
    $('#room-message').textContent = '';
}

function showJoin(message = '') {
    clearInterval(timer);
    timer = null;
    session = null;
    playing = null;
    revision = -1;
    inRoom = false;
    sessionStorage.removeItem(savedSessionKey);
    closeGame();
    $('#room-panel').hidden = true;
    $('#join-panel').hidden = false;
    if (codeEntry) {
        $('#code-form').hidden = false;
        $('#join-form').hidden = true;
        $('#role-description').textContent = 'Pega el código que te ha pasado el anfitrión.';
    }
    $('#join-error').textContent = message;
    (codeEntry ? $('#room-code') : $('#player-name')).focus();
}

async function refresh() {
    if (!session || polling || busy) return;
    polling = true;
    const current = session;
    try {
        const state = await request('state', { id: current.id, revision: frame ? revision : -1 });
        if (session === current) {
            render(state);
            $('#game-status').textContent = playing && !playing.hostPresent ? 'Esperando al anfitrión…' : '';
            if (frame && !inRoom) {
                frame.inert = Boolean(playing && !playing.hostPresent);
                window.onlineGameBridge?.suspend?.(frame.inert);
            }
            if (playing?.hostPresent && frame) await publish();
        }
    } catch (error) {
        if (session !== current) return;
        if (error.status === 401) showJoin(error.message);
        else {
            $('#connection-status').textContent = 'Reconectando';
            $('#room-message').textContent = 'Se ha perdido la conexión. Intentando volver a conectar…';
            $('#game-status').textContent = 'Reconectando…';
            if (frame) {
                frame.inert = true;
                window.onlineGameBridge?.suspend?.(true);
            }
        }
    } finally { polling = false; }
}

function enterRoom() {
    $('#join-panel').hidden = true;
    $('#room-panel').hidden = false;
    $('#invite-panel').hidden = !session.host;
    if (session.host) {
        $('#public-address').value = ['localhost', '127.0.0.1'].includes(location.hostname) ? '' : location.host;
        updateInvite();
        request('room-code', { id: session.id }).then(result => {
            if (!session?.host) return;
            $('#invite-link').value = result.code;
            $('#manual-address').hidden = true;
        }).catch(() => { $('#manual-address').hidden = false; });
    }
    timer = setInterval(refresh, 2000);
    return refresh();
}

$('#join-form').addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button');
    button.disabled = true;
    $('#join-error').textContent = '';
    try {
        const resumeKey = relayRoomId ? localStorage.getItem('dev-empire-member:' + relayRoomId) : null;
        session = await request('join', { name: $('#player-name').value, hostKey, inviteKey: relayInvite || invitation, resumeKey });
        if (session.roomId) localStorage.setItem('dev-empire-member:' + session.roomId, session.resumeKey);
        if (relayCode) session.relayCode = relayCode;
        sessionStorage.setItem(savedSessionKey, JSON.stringify(session));
        await enterRoom();
    } catch (error) { $('#join-error').textContent = error.message || 'No se ha podido conectar.'; }
    finally { button.disabled = false; }
});

async function startMatch(mode, resume = false) {
    if (!session || busy) return;
    busy = true;
    try { render(await request('start', { id: session.id, mode, resume, revision: -1 })); }
    catch (error) { $('#room-message').textContent = error.message; }
    finally { busy = false; }
}
$('#start-competitive').addEventListener('click', () => startMatch('competitive'));
$('#back-to-room').addEventListener('click', () => {
    inRoom = true;
    window.onlineGameBridge?.suspend?.(true);
    showGame(false);
    renderGala();
    $('#back-to-game').focus();
});
$('#back-to-game').addEventListener('click', () => {
    inRoom = false;
    if (!frame) openGame(playing);
    window.onlineGameBridge?.suspend?.(false);
    showGame(true);
    renderGala();
    $('#back-to-room').focus();
});

async function publish() {
    const data = window.onlineGameBridge?.read?.();
    if (data) await request('score', { id: session.id, matchId: playing.saveId, ...data.score });
}

const newMatchDialog = $('#new-match-dialog');
$('#new-match').addEventListener('click', () => newMatchDialog.showModal());
$('#cancel-new-match').addEventListener('click', () => newMatchDialog.close());
$('#confirm-new-match').addEventListener('click', async event => {
    if (await controlMatch({ action: 'new' }, event.target)) newMatchDialog.close();
});

const leaveDialog = $('#leave-dialog');
const leaveButton = $('#leave-room');
leaveButton.addEventListener('click', () => {
    if (frame && playing) {
        leaveDialog.showModal();
        $('#cancel-leave').focus();
    } else {
        void leaveRoom();
    }
});
$('#cancel-leave').addEventListener('click', () => leaveDialog.close());
leaveDialog.addEventListener('close', () => leaveButton.focus());
$('#confirm-leave').addEventListener('click', () => { leaveDialog.close(); void leaveRoom(); });
async function leaveRoom() {
    const current = session;
    if (busy) return;
    busy = true;
    if (current && frame && playing) {
        try { await publish(); }
        catch { /* El cierre también funciona si el anfitrión está desconectado. */ }
    }
    showJoin();
    if (current) try { await request('leave', { id: current.id }); } catch { /* La sesión caducará automáticamente. */ }
    relayCode = null;
    relayInvite = null;
    relayRoomId = null;
    busy = false;
}
window.addEventListener('pagehide', event => {
    window.onlineGameBridge?.save?.();
    if (!event.persisted && session?.host) {
        navigator.sendBeacon('/api/leave', new Blob([JSON.stringify({ id: session.id })], { type: 'application/json' }));
    }
});

function updateInvite() {
    const value = $('#public-address').value.trim();
    const output = $('#invite-link');
    output.value = '';
    if (!value || !session?.inviteKey) return;
    try {
        const explicitScheme = value.includes('://');
        const address = new URL(explicitScheme ? value : `${location.protocol}//${value}`);
        if (!['http:', 'https:'].includes(address.protocol) || address.username || address.password || address.pathname !== '/' || address.search || address.hash) return;
        if (!explicitScheme && !address.port && location.port) address.port = location.port;
        const bytes = new TextEncoder().encode(JSON.stringify({ address: address.origin + '/', key: session.inviteKey }));
        output.value = 'DE1-' + btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch { /* Esperar a que la dirección esté completa. */ }
}
$('#public-address').addEventListener('input', updateInvite);
$('#copy-invite').addEventListener('click', async () => {
    const input = $('#invite-link');
    if (!input.value) { $('#room-message').textContent = 'Introduce una dirección válida para crear el código.'; return; }
    try {
        await navigator.clipboard.writeText(input.value);
        $('#room-message').textContent = 'Código copiado.';
    } catch {
        input.focus();
        input.select();
        $('#room-message').textContent = 'Selecciona el código y cópialo para compartirlo.';
    }
});

if (!hostKey && !invitation) {
    try { session = JSON.parse(sessionStorage.getItem(savedSessionKey)); } catch { /* Invalid session data. */ }
    if (session) { relayCode = session.relayCode || null; void enterRoom(); }
}
