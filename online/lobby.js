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
const frameHost = $('#game-frame');
const savedSessionKey = 'dev-empire-online-session';

function showGame(show) {
    $('#game-shell').hidden = !show;
    document.querySelector('main').inert = show;
}

function closeGame() {
    frame?.remove();
    frame = null;
    window.onlineGameBridge = null;
    showGame(false);
}

function openGame(match) {
    window.onlineGameBridge = { snapshot: match.snapshot, mode: match.mode, seat: session.seat };
    frame = document.createElement('iframe');
    frame.title = 'Dev Empire 3D';
    frame.src = '/play/';
    frameHost.append(frame);
    inRoom = false;
    showGame(true);
}

function renderMatch(state) {
    playing = state.match;
    $('#host-controls').hidden = !session.host || Boolean(playing);
    if (!playing) return;
    revision = playing.revision;
    $('#match-title').textContent = 'Competición de estudios';
    $('#game-mode').textContent = 'Competitivo';
    $('#match-status').textContent = 'La partida ha comenzado.';
    $('#back-to-game').hidden = false;
    if (!frame && !inRoom) openGame(playing);
    $('#ranking').hidden = false;
    $('#scores').replaceChildren(...playing.ranking.map(entry => {
        const item = document.createElement('li');
        item.textContent = `${entry.studio} (${entry.player}) · ${entry.funds.toLocaleString('es-ES')} € · ${entry.releases} publicados`;
        return item;
    }));
}

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
            const encoded = new TextEncoder().encode(JSON.stringify({ address: room.address, key: room.inviteKey }));
            const legacyCode = 'DE1-' + btoa(String.fromCharCode(...encoded)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            destination = decodeRoomCode(legacyCode);
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
    const response = await fetch(`/api/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(8000)
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
            $('#game-status').textContent = '';
            if (frame && !inRoom) {
                frame.inert = false;
                window.onlineGameBridge?.suspend?.(false);
            }
            if (playing && frame && !inRoom) await publish();
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
        session = await request('join', { name: $('#player-name').value, hostKey, inviteKey: invitation });
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
    $('#back-to-game').focus();
});
$('#back-to-game').addEventListener('click', () => {
    inRoom = false;
    if (!frame) openGame(playing);
    window.onlineGameBridge?.suspend?.(false);
    showGame(true);
    $('#back-to-room').focus();
});

async function publish() {
    const data = window.onlineGameBridge?.read?.();
    if (data) await request('score', { id: session.id, ...data.score });
}

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
        catch (error) {
            $('#room-message').textContent = error.message;
            busy = false;
            return;
        }
    }
    showJoin();
    if (current) try { await request('leave', { id: current.id }); } catch { /* La sesión caducará automáticamente. */ }
    busy = false;
}

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
    if (session) void enterRoom();
}
