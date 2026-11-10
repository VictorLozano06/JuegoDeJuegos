// Casino stakes are fictional studio assets and are settled against the save.
const fail = message => ({ success: false, message });
const pick = (items, random) => items[Math.floor(random() * items.length)];
const rank = random => pick(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'], random);
export function handValue(cards) {
    let total = 0, aces = 0;
    for (const card of cards) {
        if (card === 'A') { total += 11; aces++; }
        else total += ['J', 'Q', 'K'].includes(card) ? 10 : Number(card);
    }
    while (total > 21 && aces) { total -= 10; aces--; }
    return total;
}
function state(game) {
    return game.casinoState ||= { hand: null, history: [] };
}
function available(game) {
    if (game.getHistoricalYear() < 2010) return 'El casino estará disponible a partir de 2010.';
    if (game.financeState?.bankruptcy?.confirmed || game.financeState?.procedurePending) return 'El casino no está disponible durante el procedimiento de bancarrota.';
    return null;
}
function recordOwner(game, ip, ownerId, ownerName, reason) {
    ip.ownerId = ownerId; ip.ownerName = ownerName; ip.forSale = false; ip.askingPrice = null;
    ip.ownershipHistory ||= [];
    ip.ownershipHistory.push({ ownerId, ownerName, year: game.getHistoricalYear(), date: new Date().toISOString(), reason });
    game.ipState.history ||= [];
    game.ipState.history.push({ id: `casino_${Date.now()}_${Math.random().toString(36).slice(2)}`, ipId: ip.id, type: 'CASINO_TRANSFER', ownerId, year: game.getHistoricalYear(), date: new Date().toISOString(), reason });
}
function reserve(game, stake) {
    const error = available(game);
    if (error) return fail(error);
    if (state(game).hand) return fail('Termina primero la mano de blackjack.');
    if (stake.type === 'ip') {
        const ip = game.ipState?.properties?.find(item => item.id === stake.ipId && item.ownerId === 'player');
        if (!ip) return fail('La franquicia ya no pertenece al estudio.');
        if (ip.forSale || game.currentProject?.ipId === ip.id) return fail('Retira la franquicia del mercado y termina su proyecto antes de apostarla.');
        const value = Math.floor(game.getIPValue(ip.id));
        if (!Number.isSafeInteger(value) || value <= 0) return fail('No se puede calcular el valor de la franquicia.');
        recordOwner(game, ip, 'casino_escrow', 'Casino · depósito', 'casino_stake');
        return { success: true, stake: { type: 'ip', ipId: ip.id, name: ip.name, value } };
    }
    const amount = Number(stake.amount);
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > game.funds) return fail('Introduce una cantidad entera positiva que no supere el saldo disponible.');
    game.funds -= amount;
    return { success: true, stake: { type: 'cash', value: amount } };
}
function settle(game, stake, multiplier, description) {
    const profit = Math.floor(stake.value * Math.max(0, multiplier - 1));
    if (stake.type === 'ip') {
        const ip = game.ipState?.properties?.find(item => item.id === stake.ipId && item.ownerId === 'casino_escrow');
        if (ip) recordOwner(game, ip, multiplier ? 'player' : 'casino', multiplier ? game.companyName : 'Casino', multiplier ? 'casino_return' : 'casino_loss');
        game.funds += profit;
    } else game.funds += Math.floor(stake.value * multiplier);
    const outcome = multiplier === 0 ? 'Derrota' : multiplier === 1 ? 'Empate' : 'Victoria';
    const message = `${description} · ${outcome}. ${stake.type === 'ip' ? (multiplier ? `Conservas ${stake.name}${profit ? ` y ganas ${profit.toLocaleString('es-ES')} €` : ''}.` : `Pierdes la franquicia ${stake.name}.`) : `Resultado neto: ${(Math.floor(stake.value * multiplier) - stake.value).toLocaleString('es-ES')} €.`}`;
    state(game).history.unshift({ message, year: game.getHistoricalYear() });
    state(game).history.length = Math.min(state(game).history.length, 12);
    game.notify?.();
    return { success: true, message };
}
export function spinSlots(game, stake, random = Math.random) {
    const reserved = reserve(game, stake); if (!reserved.success) return reserved;
    const reels = Array.from({ length: 3 }, () => pick(['7', 'DIAMANTE', 'CEREZA', 'CAMPANA', 'ESTRELLA', 'BAR'], random));
    const matches = new Set(reels).size;
    return { ...settle(game, reserved.stake, matches === 1 ? 8 : matches === 2 ? 1 : 0, `Tragaperras: ${reels.join(' · ')}`), reels };
}
const red = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
export function spinRoulette(game, stake, choice, random = Math.random) {
    if (!['red', 'black', 'number'].includes(choice?.kind) || (choice.kind === 'number' && (!Number.isInteger(choice.number) || choice.number < 0 || choice.number > 36))) return fail('Elige rojo, negro o un número del 0 al 36.');
    const reserved = reserve(game, stake); if (!reserved.success) return reserved;
    const number = Math.floor(random() * 37), color = number === 0 ? 'verde' : red.has(number) ? 'rojo' : 'negro';
    const won = choice.kind === 'number' ? number === choice.number : (choice.kind === 'red' ? color === 'rojo' : color === 'negro');
    return { ...settle(game, reserved.stake, won ? (choice.kind === 'number' ? 36 : 2) : 0, `Ruleta: ${number} ${color}`), number, color };
}
export function startBlackjack(game, stake, random = Math.random) {
    const reserved = reserve(game, stake); if (!reserved.success) return reserved;
    const hand = { stake: reserved.stake, player: [rank(random), rank(random)], dealer: [rank(random), rank(random)] };
    state(game).hand = hand;
    const playerNatural = handValue(hand.player) === 21, dealerNatural = handValue(hand.dealer) === 21;
    if (playerNatural || dealerNatural) {
        state(game).hand = null;
        return settle(game, hand.stake, playerNatural && dealerNatural ? 1 : playerNatural ? 2.5 : 0, `Blackjack: tú ${hand.player.join(' + ')} · banca ${hand.dealer.join(' + ')}`);
    }
    game.notify?.();
    return { success: true, message: 'Elige pedir carta o plantarte.' };
}
export function playBlackjack(game, action, random = Math.random) {
    const hand = state(game).hand;
    if (!hand || !['hit', 'stand'].includes(action)) return fail('No hay una mano activa.');
    if (action === 'hit') {
        hand.player.push(rank(random));
        if (handValue(hand.player) <= 21) { game.notify?.(); return { success: true, message: 'Carta repartida.' }; }
    } else while (handValue(hand.dealer) < 17) hand.dealer.push(rank(random));
    const p = handValue(hand.player), d = handValue(hand.dealer);
    const multiplier = p > 21 ? 0 : d > 21 || p > d ? 2 : p === d ? 1 : 0;
    state(game).hand = null;
    return settle(game, hand.stake, multiplier, `Blackjack: tú ${p} · banca ${d}`);
}
