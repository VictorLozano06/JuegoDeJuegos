import { handValue, playBlackjack, spinRoulette, spinSlots, startBlackjack } from './casino.js';
import './casino.css';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const cash = value => `${Math.floor(value || 0).toLocaleString('es-ES')} €`;

export function renderCasinoApp(container, game) {
    let tab = game.casinoState?.hand ? 'blackjack' : 'slots';
    let message = '', selection = 'cash', ipId = '', amount = '1000', roulette = 'red', number = '0';
    function render() {
        const hand = game.casinoState?.hand;
        const ips = (game.ipState?.properties || []).filter(ip => ip.ownerId === 'player' && !ip.forSale && game.currentProject?.ipId !== ip.id);
        if (!ips.some(ip => ip.id === ipId)) ipId = ips[0]?.id || '';
        const activeIP = ips.find(ip => ip.id === ipId);
        const result = message || game.casinoState?.history?.[0]?.message || 'Elige una mesa y prepara tu apuesta.';
        container.innerHTML = `<div class="casino-app">
            <header class="casino-head"><div><p>UWUNTU · SALÓN PRIVADO</p><h2>Casino Royale</h2><span>Tres mesas. Una decisión.</span></div><div class="casino-balance"><small>Saldo del estudio</small><strong>${cash(game.funds)}</strong></div></header>
            <nav class="casino-tabs" aria-label="Mesas del casino">${[['slots','Tragaperras'],['blackjack','Blackjack'],['roulette','Ruleta']].map(([id,label]) => `<button type="button" data-tab="${id}" class="${tab === id ? 'active' : ''}" ${hand && id !== 'blackjack' ? 'disabled' : ''}>${label}</button>`).join('')}</nav>
            <div class="casino-layout"><section class="casino-table" aria-live="polite">
                ${tab === 'slots' ? `<p class="casino-eyebrow">TRAGAPERRAS · 3 RODILLOS</p><h3>La gran tirada</h3><div class="casino-reels" aria-label="Rodillos">${(game.casinoState?.lastReels || ['7','BAR','7']).map(x => `<span>${esc(x)}</span>`).join('')}</div><p>Tres símbolos iguales pagan 8 veces la apuesta. Dos iguales devuelven lo apostado.</p>` : ''}
                ${tab === 'roulette' ? `<p class="casino-eyebrow">RULETA EUROPEA · 0–36</p><h3>Elige tu apuesta</h3><div class="casino-wheel" aria-hidden="true"><span>0</span></div><div class="casino-choice"><label for="casino-roulette">Apostar a</label><select id="casino-roulette"><option value="red" ${roulette === 'red' ? 'selected' : ''}>Rojo · paga 2×</option><option value="black" ${roulette === 'black' ? 'selected' : ''}>Negro · paga 2×</option><option value="number" ${roulette === 'number' ? 'selected' : ''}>Número exacto · paga 36×</option></select>${roulette === 'number' ? `<label for="casino-number">Número del 0 al 36</label><input id="casino-number" type="number" min="0" max="36" step="1" value="${esc(number)}">` : ''}</div><p>El cero es verde y hace perder las apuestas a rojo y negro.</p>` : ''}
                ${tab === 'blackjack' ? `<p class="casino-eyebrow">BLACKJACK · LA BANCA SE PLANTA EN 17</p><h3>La mesa de cartas</h3>${hand ? `<div class="casino-hands"><div><small>Tu mano · ${handValue(hand.player)}</small><div class="casino-cards">${hand.player.map(card => `<span>${esc(card)}</span>`).join('')}</div></div><div><small>Banca</small><div class="casino-cards"><span>${esc(hand.dealer[0])}</span><span class="back">?</span></div></div></div><div class="casino-play-actions"><button type="button" data-action="hit">Pedir carta</button><button type="button" data-action="stand">Plantarse</button></div>` : `<p>Acércate a 21 sin pasarte. El blackjack natural paga 2,5 veces la apuesta; una victoria normal paga 2 veces y el empate la devuelve.</p><div class="casino-cards casino-sample"><span>A</span><span>K</span></div>`}` : ''}
                <div class="casino-result" role="status">${esc(result)}</div>
            </section><aside class="casino-bet"><p class="casino-eyebrow">TU APUESTA</p><h3>${hand ? 'Mano en curso' : 'Prepara la jugada'}</h3>
                ${hand ? `<p>En juego: <strong>${hand.stake.type === 'ip' ? esc(hand.stake.name) : cash(hand.stake.value)}</strong></p><p>La mano queda guardada con la partida hasta que termine.</p>` : `<label for="casino-stake-type">Apostar</label><select id="casino-stake-type"><option value="cash" ${selection === 'cash' ? 'selected' : ''}>Dinero del estudio</option><option value="ip" ${selection === 'ip' ? 'selected' : ''}>Franquicia propia</option></select>
                    ${selection === 'cash' ? `<label for="casino-amount">Cantidad (€)</label><input id="casino-amount" type="number" min="1" step="1" value="${esc(amount)}">` : `<label for="casino-ip">Franquicia</label><select id="casino-ip" ${!ips.length ? 'disabled' : ''}>${ips.length ? ips.map(ip => `<option value="${esc(ip.id)}" ${ip.id === ipId ? 'selected' : ''}>${esc(ip.name)}</option>`).join('') : '<option>Sin franquicias disponibles</option>'}</select><p>Valor de referencia: <strong>${activeIP ? cash(game.getIPValue(activeIP.id)) : '—'}</strong></p><p>Al perder, la propiedad pasa al casino. Una victoria conserva la franquicia y paga el beneficio según su valor.</p>`}
                    <p class="casino-risk">Puedes perder toda la apuesta. Agotar el saldo puede poner en riesgo al estudio.</p><button class="casino-primary" type="button" data-action="bet" ${selection === 'ip' && !ips.length ? 'disabled' : ''}>${tab === 'slots' ? 'Girar rodillos' : tab === 'roulette' ? 'Girar ruleta' : 'Repartir cartas'}</button>`}
            </aside></div><details class="casino-history"><summary>Últimos resultados</summary>${(game.casinoState?.history || []).length ? `<ul>${game.casinoState.history.map(row => `<li>${esc(row.year)} · ${esc(row.message)}</li>`).join('')}</ul>` : '<p>Todavía no has jugado ninguna ronda.</p>'}</details>
        </div>`;
        container.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => { tab = btn.dataset.tab; message = ''; render(); }));
        container.querySelector('#casino-stake-type')?.addEventListener('change', e => { selection = e.target.value; render(); });
        container.querySelector('#casino-ip')?.addEventListener('change', e => { ipId = e.target.value; render(); });
        container.querySelector('#casino-amount')?.addEventListener('input', e => { amount = e.target.value; });
        container.querySelector('#casino-number')?.addEventListener('input', e => { number = e.target.value; });
        container.querySelector('#casino-roulette')?.addEventListener('change', e => { roulette = e.target.value; render(); });
        container.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => {
            if (btn.dataset.action !== 'bet') { const result = playBlackjack(game, btn.dataset.action); message = result.message; render(); return; }
            const stake = selection === 'ip' ? { type: 'ip', ipId } : { type: 'cash', amount: Number(amount) };
            const play = () => {
                const result = tab === 'slots' ? spinSlots(game, stake) : tab === 'roulette' ? spinRoulette(game, stake, { kind: roulette, number: Number(number) }) : startBlackjack(game, stake);
                if (result.reels) game.casinoState.lastReels = result.reels;
                message = result.message; render();
            };
            if (selection === 'ip') confirmFranchise(container, activeIP, play);
            else play();
        }));
    }
    render();
}

function confirmFranchise(container, ip, onConfirm) {
    if (!ip) return;
    const origin = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'casino-confirm';
    dialog.setAttribute('aria-labelledby', 'casino-confirm-title');
    dialog.innerHTML = `<p class="casino-eyebrow">APUESTA DE PROPIEDAD</p><h2 id="casino-confirm-title">Apostar franquicia</h2><p>Si pierdes, <strong></strong> pasará a ser propiedad del casino. Si ganas o empatas, la conservarás.</p><div><button type="button" data-cancel>Cancelar</button><button type="button" data-confirm>Apostar franquicia</button></div>`;
    dialog.querySelector('strong').textContent = ip.name;
    dialog.querySelector('[data-cancel]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-confirm]').addEventListener('click', () => { dialog.close(); onConfirm(); }, { once: true });
    dialog.addEventListener('close', () => { dialog.remove(); if (origin?.isConnected) origin.focus(); else container.querySelector('[data-action="bet"]')?.focus(); }, { once: true });
    document.body.appendChild(dialog); dialog.showModal(); dialog.querySelector('[data-cancel]').focus();
}
