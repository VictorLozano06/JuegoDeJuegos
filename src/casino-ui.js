import { handValue, playBlackjack, rouletteColor, SLOT_SYMBOLS, spinRoulette, spinSlots, startBlackjack } from './casino.js';
import { casinoIcon, POCKET_ANGLE, reelFace, wheelArt, WHEEL_ORDER } from './casino-art.js';
import './casino.css';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const cash = value => `${Math.floor(value || 0).toLocaleString('es-ES')} €`;
const tables = [
    { id: 'slots', label: 'Tragaperras', name: 'Neón 777', icon: 'slots', action: 'Girar rodillos', rules: 'Tres iguales pagan ×8. Una pareja devuelve la apuesta.' },
    { id: 'blackjack', label: 'Blackjack', name: 'Club 21', icon: 'spade', action: 'Repartir cartas', rules: 'La banca se planta en 17. Victoria ×2, blackjack natural ×2,5 y empate ×1.' },
    { id: 'roulette', label: 'Ruleta', name: 'Ruleta europea', icon: 'wheel', action: 'Lanzar la bola', rules: 'Rojo o negro pagan ×2. Un pleno paga ×36. El 0 es verde.' }
];
const animations = { slots: 1370, roulette: 2280, blackjack: 480 };
const suits = ['spade', 'heart', 'club', 'diamond'];

function slotMachine(reels, spinning) {
    return `<div class="royale-machine ${spinning ? 'is-spinning' : ''}">
        <div class="royale-marquee"><i></i><strong>NEÓN <em>777</em></strong><i></i></div>
        <div class="royale-reels" role="img" aria-label="${spinning ? 'Rodillos en giro' : `Rodillos: ${reels.join(', ')}`}">${reels.map((symbol, i) => {
            const track = spinning ? [...Array.from({ length: 10 + i * 3 }, (_, step) =>
                SLOT_SYMBOLS[(step + i * 2) % SLOT_SYMBOLS.length]), symbol] : [symbol];
            return `<div class="royale-reel"><div class="reel-strip" style="--duration:${830 + i * 245}ms">${track.map(reelFace).join('')}</div></div>`;
        }).join('')}</div>
        <div class="royale-paytable"><span><b>×8</b> Trío</span><span><b>×1</b> Pareja</span></div>
    </div>`;
}

function rouletteTable(choice, wheel, busy, disabled) {
    return `<div class="royale-roulette">
        <div class="royale-wheel-wrap">
            <div class="royale-wheel ${busy ? 'is-spinning' : ''}" style="--from:${wheel.from}deg;--to:${wheel.to}deg">${wheelArt}</div>
            <span class="royale-ball-orbit" aria-hidden="true"><span class="royale-ball"></span></span>
            <output class="royale-pocket ${busy || wheel.number === null ? '' : `pocket-${rouletteColor(wheel.number)}`}">${busy ? 'En giro' : wheel.number ?? '–'}</output>
        </div>
        <div class="royale-felt" aria-label="Tapete de apuestas">
            <div class="royale-colors">${['red', 'black'].map((color, i) => `<button type="button" data-pick="${color}" class="pocket-${i === 0 ? 'rojo' : 'negro'}" aria-pressed="${choice.kind === color}" ${disabled}>${i === 0 ? 'Rojo' : 'Negro'} <small>×2</small></button>`).join('')}</div>
            <div class="royale-numbers">${Array.from({ length: 37 }, (_, number) => `<button type="button" data-pick="${number}" class="pocket-${rouletteColor(number)}" aria-pressed="${choice.kind === 'number' && choice.number === number}" ${disabled}>${number}</button>`).join('')}</div>
        </div>
    </div>`;
}

function cardsMarkup(cards, seat, faceDown, motion) {
    return cards.map((rank, index) => {
        const hidden = faceDown && index === 1;
        const suit = suits[(index + (seat === 'dealer' ? 2 : 0)) % suits.length];
        const fresh = motion === 'deal' || (motion === 'hit' && seat === 'player' && index === cards.length - 1) || (motion === 'reveal' && seat === 'dealer' && index > 1);
        const flip = motion === 'reveal' && seat === 'dealer' && index === 1;
        const delay = motion === 'deal' ? index * 100 + (seat === 'dealer' ? 50 : 0) : motion === 'reveal' ? Math.min(200, Math.max(0, index - 1) * 65) : 0;
        return `<span class="royale-card ${hidden ? 'card-back' : ''} ${fresh ? 'card-deal' : ''} ${flip ? 'card-flip' : ''} suit-${suit}" style="--delay:${delay}ms" aria-label="${hidden ? 'Carta oculta' : esc(rank)}">${hidden ? casinoIcon('diamond') : `<b>${esc(rank)}</b>${casinoIcon(suit)}`}</span>`;
    }).join('');
}

function blackjackTable(hand, finalCards, motion, disabled) {
    const cards = hand || finalCards;
    return `<div class="royale-blackjack">
        <div class="royale-seat"><small>Banca${finalCards && !hand ? ` · ${handValue(finalCards.dealer)}` : ''}</small>
            <div class="royale-cards">${cards ? cardsMarkup(cards.dealer, 'dealer', Boolean(hand), motion) : '<span class="card-outline"></span><span class="card-outline"></span>'}</div></div>
        <div class="royale-felt-mark">BLACKJACK <span>PAGA 3 A 2</span></div>
        <div class="royale-seat"><small>Tu mano${cards ? ` · ${handValue(cards.player)}` : ''}</small>
            <div class="royale-cards">${cards ? cardsMarkup(cards.player, 'player', false, motion) : '<span class="card-outline"></span><span class="card-outline"></span>'}</div></div>
        ${hand ? `<div class="royale-hand-actions"><button type="button" data-action="hit" ${disabled}>Pedir carta</button><button type="button" data-action="stand" ${disabled}>Plantarse</button></div>` : ''}
    </div>`;
}

export function renderCasinoApp(container, game) {
    let tab = game.casinoState?.hand ? 'blackjack' : 'slots';
    let selection = 'cash', ipId = '', amount = '1000';
    let choice = { kind: 'red' };
    let result = null, busy = false, motion = '', finalCards = null;
    let settledBalance = game.funds, visibleHistory = [];
    let reels = (game.casinoState?.lastReels || ['7', 'DIAMANTE', '7']).map(symbol => SLOT_SYMBOLS.includes(symbol) ? symbol : '7');
    let wheel = { from: 0, to: 0, number: null };

    function render(focusSelector) {
        const hand = game.casinoState?.hand;
        const table = tables.find(item => item.id === tab);
        const ips = (game.ipState?.properties || []).filter(ip => ip.ownerId === 'player' && !ip.forSale && game.currentProject?.ipId !== ip.id);
        if (!ips.some(ip => ip.id === ipId)) ipId = ips[0]?.id || '';
        const activeIP = ips.find(ip => ip.id === ipId);
        const history = busy ? visibleHistory : (game.casinoState?.history || []);
        const disabled = busy ? 'disabled' : '';
        const tone = result?.outcome === 'Victoria' ? 'win' : result?.outcome === 'Derrota' ? 'loss' : result?.success === false ? 'error' : '';
        const status = busy ? (tab === 'blackjack' ? 'En mesa…' : 'En giro…') : (result?.outcome || 'En mesa');
        const scroll = container.querySelector('.casino-app')?.scrollTop || 0;
        const historyOpen = container.querySelector('.casino-history')?.open;
        container.innerHTML = `<div class="casino-app">
            <header class="royale-header">
                <div class="royale-brand"><span class="royale-logo">${casinoIcon('diamond')}</span><div><p>ROYALE DIGITAL · UWUNTU</p><h2>Casino Royale</h2></div></div>
                <div class="royale-balance"><small>Saldo del estudio</small><strong>${cash(busy ? settledBalance : game.funds)}</strong></div>
            </header>
            <nav class="royale-tabs" aria-label="Mesas del casino">${tables.map(item => `<button type="button" data-tab="${item.id}" aria-pressed="${tab === item.id}" ${busy || (hand && item.id !== 'blackjack') ? 'disabled' : ''}>${casinoIcon(item.icon)}<span>${item.label}</span></button>`).join('')}</nav>
            <div class="royale-layout">
                <section class="royale-table table-${tab}">
                    <div class="royale-table-title"><div><p>${table.label}</p><h3>${table.name}</h3></div><span class="royale-state ${busy ? 'busy' : ''} ${busy ? '' : tone}">${status}</span></div>
                    ${tab === 'slots' ? slotMachine(reels, busy) : tab === 'roulette' ? rouletteTable(choice, wheel, busy, disabled) : blackjackTable(hand, finalCards, motion, disabled)}
                    <p class="royale-rules">${table.rules}</p>
                    <div class="royale-result ${busy ? '' : tone}" role="status">${esc(busy ? 'La jugada está en curso.' : result?.message || (hand ? 'Pide carta o plántate.' : 'Prepara una apuesta para jugar.'))}</div>
                </section>
                <aside class="royale-bet" aria-label="Apuesta">
                    <p class="royale-kicker">CAJA DEL ESTUDIO</p><h3>${hand ? 'Mano en curso' : 'Tu apuesta'}</h3>
                    ${hand ? `<p>En juego</p><strong>${hand.stake.type === 'ip' ? esc(hand.stake.name) : cash(hand.stake.value)}</strong>` :
                    `<label for="casino-stake-type">Tipo de apuesta</label><select id="casino-stake-type" ${disabled}><option value="cash">Dinero del estudio</option><option value="ip" ${selection === 'ip' ? 'selected' : ''}>Franquicia propia</option></select>
                    ${selection === 'cash' ? `<label for="casino-amount">Importe en euros</label><input id="casino-amount" type="number" min="1" step="1" value="${esc(amount)}" ${disabled}><div class="royale-chips">${[100, 1000, 10000].map(value => `<button type="button" data-chip="${value}" aria-label="Apostar ${cash(value)}" ${disabled}>${value >= 1000 ? `${value / 1000}k` : value}</button>`).join('')}</div>` :
                    `<label for="casino-ip">Franquicia</label><select id="casino-ip" ${!ips.length || busy ? 'disabled' : ''}>${ips.length ? ips.map(ip => `<option value="${esc(ip.id)}" ${ip.id === ipId ? 'selected' : ''}>${esc(ip.name)}</option>`).join('') : '<option>Sin franquicias disponibles</option>'}</select><p>Valor de referencia <strong>${activeIP ? cash(game.getIPValue(activeIP.id)) : '–'}</strong></p>`}
                    ${tab === 'roulette' ? `<p class="royale-selection">Selección <strong>${choice.kind === 'number' ? `Pleno al ${choice.number}` : choice.kind === 'red' ? 'Rojo' : 'Negro'}</strong></p>` : ''}
                    <button class="royale-primary" type="button" data-action="bet" ${busy || (selection === 'ip' && !activeIP) ? 'disabled' : ''}>${busy ? 'Jugando…' : table.action}</button>`}
                    <p class="royale-risk">${selection === 'ip' ? 'Si pierdes, el casino se queda con la franquicia.' : 'La apuesta sale de los fondos del estudio.'}</p>
                </aside>
            </div>
            <details class="casino-history" ${historyOpen ? 'open' : ''}><summary>Historial de jugadas <span>${history.length}</span></summary>${history.length ? `<ul>${history.map(row => `<li><time>${esc(row.year)}</time><span>${esc(row.message)}</span></li>`).join('')}</ul>` : '<p>Aún no hay jugadas registradas.</p>'}</details>
        </div>`;
        container.querySelector('.casino-app').scrollTop = scroll;
        if (focusSelector) container.querySelector(focusSelector)?.focus({ preventScroll: true });

        container.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
            tab = button.dataset.tab;
            result = null;
            render(`[data-tab="${tab}"]`);
        }));
        container.querySelector('#casino-stake-type')?.addEventListener('change', event => {
            selection = event.target.value;
            render('#casino-stake-type');
        });
        container.querySelector('#casino-ip')?.addEventListener('change', event => {
            ipId = event.target.value;
            render('#casino-ip');
        });
        const amountInput = container.querySelector('#casino-amount');
        amountInput?.addEventListener('input', event => { amount = event.target.value; });
        container.querySelectorAll('[data-chip]').forEach(button => button.addEventListener('click', () => {
            amountInput.value = amount = button.dataset.chip;
        }));
        container.querySelectorAll('[data-pick]').forEach(button => button.addEventListener('click', () => {
            const pick = button.dataset.pick;
            choice = pick === 'red' || pick === 'black' ? { kind: pick } : { kind: 'number', number: Number(pick) };
            render(`[data-pick="${pick}"]`);
        }));
        container.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
            if (busy) return;
            const action = button.dataset.action;
            if (action !== 'bet') {
                play(() => playBlackjack(game, action), action);
                return;
            }
            const stake = selection === 'ip' ? { type: 'ip', ipId } : { type: 'cash', amount: Number(amount) };
            const run = () => play(() => {
                if (tab === 'slots') return spinSlots(game, stake);
                if (tab === 'roulette') return spinRoulette(game, stake, choice);
                return startBlackjack(game, stake);
            }, action);
            if (selection === 'ip') confirmFranchise(container, activeIP, run);
            else run();
        }));
    }

    function play(run, action) {
        if (busy || !container.isConnected) return;
        const restoreFocus = container.contains(document.activeElement) || document.activeElement === document.body;
        settledBalance = game.funds;
        visibleHistory = [...(game.casinoState?.history || [])];
        result = run();
        const focusAfter = game.casinoState?.hand ? '[data-action="hit"]' : '[data-action="bet"]';
        if (!result.success) {
            render(focusAfter);
            return;
        }
        if (result.reels) reels = game.casinoState.lastReels = result.reels;
        if (result.number !== undefined) {
            const from = (wheel.to % 360 + 360) % 360;
            const target = (360 - WHEEL_ORDER.indexOf(result.number) * POCKET_ANGLE) % 360;
            wheel = { from, to: from + 1440 + (target - from + 360) % 360, number: result.number };
        }
        if (tab === 'blackjack') {
            finalCards = result.cards || null;
            motion = action === 'bet' ? 'deal' : action === 'hit' && !finalCards ? 'hit' : 'reveal';
        }
        const finish = () => {
            busy = false;
            motion = '';
            if (container.isConnected) {
                const currentFocus = document.activeElement;
                render(restoreFocus && (container.contains(currentFocus) || currentFocus === document.body) ? focusAfter : undefined);
            }
        };
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            finish();
        } else {
            busy = true;
            render();
            setTimeout(finish, animations[tab]);
        }
    }

    render();
}

function confirmFranchise(container, ip, onConfirm) {
    if (!ip) return;
    const origin = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'casino-confirm';
    dialog.setAttribute('aria-labelledby', 'casino-confirm-title');
    dialog.innerHTML = `<p class="royale-kicker">APUESTA DE PROPIEDAD</p><h2 id="casino-confirm-title">Apostar franquicia</h2><p>Si pierdes, <strong></strong> pasará a ser propiedad del casino. Si ganas o empatas, la conservarás.</p><div><button type="button" data-cancel>Cancelar</button><button type="button" data-confirm>Apostar franquicia</button></div>`;
    dialog.querySelector('strong').textContent = ip.name;
    dialog.querySelector('[data-cancel]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-confirm]').addEventListener('click', () => {
        dialog.close();
        onConfirm();
    }, { once: true });
    dialog.addEventListener('close', () => {
        dialog.remove();
        if (origin?.isConnected) origin.focus();
    }, { once: true });
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.querySelector('[data-cancel]').focus();
}
