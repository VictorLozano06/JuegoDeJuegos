import { getFranchiseStatus, validateFranchiseRegistration } from './FranchiseSystem.js';
// Interfaz de gestión de IP; los datos y las validaciones pertenecen a la simulación.
let context;
let activeTab = 'own';
let selectedIP = null;
const playerId = 'player';
const text = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => '$' + Math.round(Number(value) || 0).toLocaleString('es-ES');
const metric = value => Math.round(Number(value) || 0);
const properties = () => context.game.ipState?.properties || [];
const owned = () => properties().filter(ip => ip.ownerId === playerId);
const title = game => game?.name || 'Juego no disponible';
const ipValue = ip => context.game.getIPValue(ip.id);
const releaseLabels = { original:'Original', sequel:'Entrega principal / Secuela', prequel:'Precuela', spin_off:'Spin-off', remake:'Remake', remaster:'Remasterización' };
const stat = (label, value) => `<div>${text(label)}<strong>${text(value)}</strong></div>`;
const stats = ip => `<div class="ip-stats">${stat('Popularidad',metric(ip.popularity))}${stat('Prestigio',metric(ip.prestige))}${stat('Fidelidad',metric(ip.loyalty))}${stat('Expectativas',metric(ip.expectations))}${stat('Saturación',metric(ip.saturation))}${stat('Entregas publicadas',ip.publishedGameIds?.length || 0)}</div>`;
const gameOptions = (games, placeholder = 'Selecciona un videojuego') => `<option value="">${text(placeholder)}</option>` + games.map(g => `<option value="${text(g.id)}">${text(g.name)}</option>`).join('');
const options = list => list.map(item => `<option value="${text(item.id)}">${text(item.name)}</option>`).join('');

export function refreshIPWizard(game) {
    const select = document.getElementById('select-ip');
    const type = document.getElementById('select-ip-installment');
    if (!select || !type) return;
    const previous = select.value;
    select.replaceChildren(new Option('Juego independiente', ''));
    (game.ipState?.properties || []).filter(ip => ip.ownerId === playerId).forEach(ip => select.add(new Option(ip.name, ip.id)));
    if ([...select.options].some(o => o.value === previous)) select.value = previous;
    type.disabled = !select.value;
    const originalOption = [...type.options].find(option => option.value === 'original');
    if (originalOption) originalOption.disabled = !!select.value;
    if (select.value && type.value === 'original') type.value = 'sequel';
}

export function initializeIPUI({ game, openModal, showToast, genres = [], topics = [] }) {
    context = { game, openModal, showToast, genres, topics };
    const modal = document.createElement('div');
    modal.id = 'modal-intellectual-property';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `<div class="modal-window" style="max-width:960px"><div class="modal-header"><h2 class="modal-title">Empresa / Propiedad intelectual</h2><button type="button" class="modal-close" aria-label="Cerrar">&times;</button></div><nav class="ip-tabs" aria-label="Propiedad intelectual"><button class="dock-btn ip-tab" type="button" data-ip-tab="own">Mis IP</button><button class="dock-btn ip-tab" type="button" data-ip-tab="market">Mercado</button><button class="dock-btn ip-tab" type="button" data-ip-tab="history">Historial</button></nav><div id="ip-view"></div></div>`;
    document.body.appendChild(modal);
    const windowElement = modal.querySelector('.modal-window');
    document.getElementById('btn-company-ip')?.addEventListener('click', () => {
        activeTab = 'own';
        selectedIP = null;
        render();
        if (window.studioPhoneNav?.openIP) window.studioPhoneNav.openIP();
        else openModal(modal.id);
    });
    windowElement.addEventListener('click', event => {
        if (event.target.closest('.modal-close')) {
            if (windowElement.closest('#phone-view-ip')) window.studioPhoneNav?.returnHome();
            else { modal.style.display = 'none'; modal.classList.remove('active'); }
            return;
        }
        onClick(event);
    });
    windowElement.addEventListener('submit', onSubmit);
    windowElement.addEventListener('change', event => {
        if (event.target.id !== 'ip-original') return;
        const original = (game.gamesHistory || []).find(g => g.id === event.target.value);
        if (!original) return;
        const name = document.getElementById('ip-name');
        if (name && !name.value.trim()) name.value = original.name;
        for (const [field, value] of [['ip-genre',original.genreId], ['ip-topic',original.topicId]]) {
            const select = document.getElementById(field);
            if (select && [...select.options].some(o => o.value === value)) select.value = value;
        }
    });
    document.getElementById('select-ip')?.addEventListener('change', e => {
        const type = document.getElementById('select-ip-installment');
        type.disabled = !e.target.value;
        const original = [...type.options].find(option => option.value === 'original');
        if (original) original.disabled = !!e.target.value;
        type.value = e.target.value ? 'sequel' : 'original';
    });
    window.refreshIPPanel = render;
}

function registerForm() {
    const games = (context.game.gamesHistory || []).filter(g => validateFranchiseRegistration(g).success);
    const cost = context.game.ipState?.settings?.registrationCost ?? 0;
    return `<section class="ip-panel"><h3>Registrar franquicia oficial</h3><p>Selecciona un juego publicado sin franquicia con nota mínima de 7,5. Coste: ${money(cost)}.</p><form class="ip-form" data-ip-form="register"><div class="ip-form-grid"><div class="form-group"><label for="ip-name">Nombre</label><input id="ip-name" class="form-input" name="name" maxlength="100" required></div><div class="form-group"><label for="ip-original">Videojuego original</label><select id="ip-original" name="originalGameId" class="form-select" required>${gameOptions(games)}</select></div><div class="form-group"><label for="ip-genre">Género original</label><select id="ip-genre" name="originalGenre" class="form-select">${options(context.genres)}</select></div><div class="form-group"><label for="ip-topic">Temática original</label><select id="ip-topic" name="originalTopic" class="form-select">${options(context.topics)}</select></div><div class="form-group"><label for="ip-brand">Identidad de marca</label><input id="ip-brand" class="form-input" name="brandIdentity" maxlength="120" placeholder="Ej.: aventura y exploración"></div><div class="form-group"><label for="ip-description">Descripción</label><textarea id="ip-description" class="form-input" name="description" maxlength="500"></textarea></div></div><button class="dock-btn btn-primary-action" type="submit" ${games.length ? '' : 'disabled'}>Registrar por ${money(cost)}</button></form></section>`;
}

function renderOwn() {
    const all = owned();
    const cards = all.map(ip => { const state = getFranchiseStatus(context.game, ip); const color = state.status === 'saturado' ? '#f87171' : state.status === 'listo' ? '#86efac' : '#fcd34d'; return `<article class="ip-card"><h3>${text(ip.name)}</h3><p>${text(ip.brandIdentity || 'Sin identidad de marca definida')}</p><p style="color:${color}">● ${state.status === 'saturado' ? 'Mercado saturado' : state.status === 'listo' ? 'Lista para secuela' : state.status === 'descansando' ? 'Descansando' : 'Sin estrenar'} · ${state.weeksSince === null ? 'Sin lanzamiento' : `${state.weeksSince} semanas desde el último lanzamiento`}</p><p>Fans acumulados de la saga: ${state.fans.toLocaleString('es-ES')}</p>${stats(ip)}<p>Valor estimado: <strong>${money(ipValue(ip))}</strong></p><div class="ip-actions"><button type="button" class="dock-btn" data-ip-action="detail" data-id="${text(ip.id)}">Ver ficha</button></div></article>`; }).join('');
    const ip = all.find(p => p.id === selectedIP);
    return `<div class="ip-layout">${registerForm()}<section><h3>Mis franquicias</h3>${cards ? `<div class="ip-list">${cards}</div>` : '<div class="ip-empty">Todavía no tienes propiedades intelectuales registradas.</div>'}</section>${ip ? renderDetail(ip) : ''}</div>`;
}

function renderDetail(ip) {
    const catalog = [...(context.game.gamesHistory || []), ...(context.game.ipCompanies || []).flatMap(company => company.games || [])];
    const games = (ip.gameIds || []).map(id => catalog.find(g => g.id === id)).filter(Boolean);
    const unlinked = (context.game.gamesHistory || []).filter(g => !g.ipId);
    return `<section class="ip-panel"><h3>${text(ip.name)}</h3><p>${text(ip.description || 'Sin descripción.')}</p><p>Propietario: ${text(ip.ownerName || context.game.companyName)} · Registrada: ${text(ip.registeredYear)} · Género: ${text(ip.originalGenre || 'Sin definir')} · Temática: ${text(ip.originalTopic || 'Sin definir')}</p>${stats(ip)}<p>Valor estimado: <strong>${money(ipValue(ip))}</strong></p><h4>Entregas publicadas</h4>${games.length ? `<ul class="ip-event-list">${games.map(g => `<li>${text(title(g))}<small>Nota: ${text(g.score ?? '—')} · ${text(Number((g.businessModel === 'f2p' || g.businessModel === 'live_service') ? (g.installationsTotal || 0) : (g.unitsSoldTotal || 0)).toLocaleString('es-ES'))}${g.businessModel === 'f2p' || g.businessModel === 'live_service' ? ' instalaciones' : ' ventas'} · ${text(releaseLabels[g.ipReleaseType || g.ipInstallmentType] || 'Original')}</small></li>`).join('')}</ul>` : '<p>No hay entregas publicadas.</p>'}${unlinked.length ? `<form class="ip-form" data-ip-form="link" data-id="${text(ip.id)}"><label>Vincular un juego publicado sin franquicia</label><select class="form-select" name="gameId" required>${gameOptions(unlinked)}</select><div class="ip-actions"><button class="dock-btn" type="submit">Vincular juego</button></div></form>` : ''}<h4>Historial de propiedad</h4><ul class="ip-event-list">${(ip.ownershipHistory || []).map(event => `<li>${text(event.ownerName || event.toName || event.ownerId || event.toOwnerId || 'Propietario')}<small>${text(event.year ?? event.registeredYear ?? '')}</small></li>`).join('') || '<li>Sin cambios de propietario.</li>'}</ul></section>`;
}

function renderMarket() {
    const listings = context.game.getIPMarket() || [];
    const companies = (context.game.ipCompanies || []).filter(c => c.id !== playerId);
    const marketCards = listings.map(ip => `<article class="ip-card"><h3>${text(ip.name)}</h3><p>Propietario: ${text(ip.ownerName)}</p><p>Antigüedad: ${Math.max(0, context.game.getHistoricalYear() - (ip.registeredYear || context.game.getHistoricalYear()))} años</p>${stats(ip)}<p>Precio solicitado: <strong>${money(ip.askingPrice)}</strong></p><p>Valor estimado: ${money(ipValue(ip))}</p><button type="button" class="dock-btn btn-primary-action" data-ip-action="buy" data-id="${text(ip.id)}">Comprar</button></article>`).join('');
    const saleCards = owned().map(ip => `<article class="ip-card"><h3>${text(ip.name)}</h3><p>Valor estimado: ${money(ipValue(ip))}</p><p>${ip.forSale ? 'Anunciada por ' + money(ip.askingPrice) : 'No está anunciada.'}</p><form class="ip-form" data-ip-form="listing" data-id="${text(ip.id)}"><label>Precio solicitado</label><input class="form-input" name="askingPrice" type="number" min="1" step="1" value="${text(ip.askingPrice || ipValue(ip))}" required><div class="ip-actions"><button class="dock-btn" type="submit">${ip.forSale ? 'Actualizar anuncio' : 'Poner a la venta'}</button>${ip.forSale ? `<button type="button" class="dock-btn" data-ip-action="delist" data-id="${text(ip.id)}">Retirar anuncio</button>` : ''}</div></form>${companies.length && ip.forSale ? `<form class="ip-form" data-ip-form="sell" data-id="${text(ip.id)}"><label>Empresa compradora</label><select name="buyerId" class="form-select" required><option value="">Selecciona una empresa</option>${companies.map(c=>`<option value="${text(c.id)}">${text(c.name)}</option>`).join('')}</select><div class="ip-actions"><button class="dock-btn" type="submit">Vender por ${money(ip.askingPrice)}</button></div></form>` : companies.length ? '<p>Publica un precio para habilitar la venta.</p>' : '<p>No hay empresas compradoras con fondos disponibles.</p>'}</article>`).join('');
    return `<div class="ip-layout"><section><h3>IP disponibles para comprar</h3>${marketCards ? `<div class="ip-list">${marketCards}</div>` : '<div class="ip-empty">No hay IP de otras empresas a la venta en este momento.</div>'}</section><section><h3>Vender mis IP</h3><p class="ip-muted">Las ventas requieren una empresa compradora con fondos suficientes.</p>${saleCards ? `<div class="ip-list">${saleCards}</div>` : '<div class="ip-empty">No tienes IP para vender.</div>'}</section></div>`;
}

function renderHistory() {
    const state = context.game.ipState;
    const history = [...(state?.history || [])].reverse();
    const labels = { CREATED:'Creación', REGISTERED:'Registro', GAME_LINKED:'Videojuego vinculado', GAME_RELEASED:'Entrega publicada', SALES_MILESTONE:'Hito de ventas', LISTED:'Puesta a la venta', DELISTED:'Anuncio retirado', TRANSFER:'Compra y venta · Cambio de propietario' };
    return history.length ? `<ul class="ip-event-list">${history.map(e => {
        const ip = (state.properties || []).find(p => p.id === e.ipId);
        const tx = (state.transactions || []).find(t => t.id === e.transactionId);
        const owner = e.ownerId === playerId ? context.game.companyName : (context.game.ipCompanies || []).find(c => c.id === e.ownerId)?.name || e.ownerId;
        let detail = '';
        if (tx) detail = `${tx.sellerName} vendió a ${tx.buyerName} por ${money(tx.price)}`;
        else if (e.type === 'CREATED') detail = owner ? 'Propietaria: ' + owner : '';
        else if (e.type === 'REGISTERED') detail = 'Coste de registro: ' + money(e.cost);
        else if (e.type === 'GAME_LINKED' || e.type === 'GAME_RELEASED') detail = [e.gameName, releaseLabels[e.releaseType] || e.releaseType].filter(Boolean).join(' · ');
        else if (e.type === 'SALES_MILESTONE') detail = (context.game.gamesHistory || []).find(g => g.id === e.gameId)?.name || '';
        else if (e.type === 'LISTED') detail = 'Precio solicitado: ' + money(e.askingPrice);
        return `<li>${text(labels[e.type] || e.type || 'Operación')} · ${text(ip?.name || e.name || 'Franquicia')}<small>${text(e.year ?? '')}${detail ? ' · ' + text(detail) : ''}</small></li>`;
    }).join('')}</ul>` : '<div class="ip-empty">Todavía no hay operaciones ni entregas registradas.</div>';
}

function render() {
    const view = document.getElementById('ip-view');
    if (!view) return;
    document.querySelectorAll('[data-ip-tab]').forEach(button => button.setAttribute('aria-selected', button.dataset.ipTab === activeTab ? 'true' : 'false'));
    view.innerHTML = activeTab === 'own' ? renderOwn() : activeTab === 'market' ? renderMarket() : renderHistory();
}

function resultMessage(result, fallback) {
    if (result?.success) { context.showToast(result.message || fallback, 'success'); refreshIPWizard(context.game); render(); }
    else context.showToast(result?.message || result?.error || 'No se ha podido completar la operación.', 'warn');
}

function onClick(event) {
    const tab = event.target.closest('[data-ip-tab]');
    if (tab) { activeTab = tab.dataset.ipTab; render(); return; }
    const action = event.target.closest('[data-ip-action]');
    if (!action) return;
    const id = action.dataset.id;
    if (action.dataset.ipAction === 'detail') { selectedIP = id; render(); document.querySelector('#ip-view .ip-layout > .ip-panel:last-child')?.scrollIntoView({block:'nearest'}); }
    if (action.dataset.ipAction === 'delist') resultMessage(context.game.setIPForSale(id, null), 'Anuncio retirado.');
    if (action.dataset.ipAction === 'buy') resultMessage(context.game.buyIP(id), 'Propiedad intelectual adquirida.');
}

function onSubmit(event) {
    const form = event.target.closest('[data-ip-form]');
    if (!form) return;
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    if (form.dataset.ipForm === 'register') resultMessage(context.game.registerIP(values), 'Propiedad intelectual registrada.');
    if (form.dataset.ipForm === 'link') resultMessage(context.game.linkGameToIP(form.dataset.id, values.gameId), 'Videojuego vinculado.');
    if (form.dataset.ipForm === 'listing') resultMessage(context.game.setIPForSale(form.dataset.id, Number(values.askingPrice)), 'Anuncio actualizado.');
    if (form.dataset.ipForm === 'sell') resultMessage(context.game.sellIP(form.dataset.id, values.buyerId), 'Propiedad intelectual vendida.');
}
