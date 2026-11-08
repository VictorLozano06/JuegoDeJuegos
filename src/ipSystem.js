/**
 * Franchise assets. Plain data only: compatible with SaveSystem's object graph.
 * Values are deliberately tunable game parameters, not valuations of real IP.
 * Company arguments must be persistent entities or adapters with writable funds.
 */
export const IP_DEFAULTS = Object.freeze({
    registrationCost: 5000,
    baseValue: 12000,
    popularityValue: 850,
    prestigeValue: 650,
    loyaltyValue: 500,
    salesValuePerUnit: 0.15,
    relevanceDecayPerYear: 1.5,
    saturationDecayPerYear: 5,
    inactivityGraceYears: 3,
    rapidReleaseYears: 2,
    rapidReleaseSaturation: 18,
    normalReleaseSaturation: 7,
    statMin: 0,
    statMax: 100,
    prestigeScoreEffect: 12,
    loyaltyScoreEffect: 9,
    popularityReleaseBase: 3,
    popularityScoreEffect: 4,
    salesMilestonePopularity: 5,
    salesMilestoneLoyaltyHit: 3,
    salesMilestoneLoyaltyMiss: 1,
    salesMilestoneExpectations: 3
});
export const IP_RELEASE_TYPES = Object.freeze(['original', 'sequel', 'prequel', 'spin_off', 'remake', 'remaster']);
const finite = n => typeof n === 'number' && Number.isFinite(n);
const clamp = (n, low=0, high=100) => Math.max(low, Math.min(high, Number(n) || 0));
const ok = (extra = {}) => ({success:true, ...extra});
const fail = message => ({success:false, message});
const id = prefix => `${prefix}_${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`}`;
const yearOf = context => Number.isInteger(context?.year) ? context.year : null;
const timeOf = context => typeof context?.date === 'string' ? context.date : new Date().toISOString();
const settings = state => ({...IP_DEFAULTS, ...(state.settings || {})});
const normalizeName = value => String(value || '').trim().toLocaleLowerCase('es');
const find = (state, ipId) => state?.properties?.find(ip => ip.id === ipId);
const event = (state, ip, type, context, details = {}) => {
    const entry = {id:id('iph'), ipId:ip.id, type, year:yearOf(context), date:timeOf(context), ...details};
    state.history.push(entry);
    return entry;
};

export function createIPState(options = {}) {
    return {properties:[], history:[], transactions:[], settings:{...IP_DEFAULTS, ...options}};
}

/** Owners must expose a real numeric funds property. Game ownership is checked by caller. */
export function registerIP(state, owner, details = {}, context = {}) {
    const name = String(details.name || '').trim();
    const year = yearOf(context);
    const cfg = settings(state);
    const cost = Number(cfg.registrationCost);
    if (!state || !Array.isArray(state.properties) || !Array.isArray(state.history)) return fail('Estado de propiedad intelectual inválido.');
    if (!owner || !owner.id || !finite(owner.funds) || !name || year === null) return fail('Faltan datos válidos de propietario, nombre o año.');
    if (!finite(cost) || cost < 0) return fail('El coste de registro no es válido.');
    if (state.properties.some(ip => normalizeName(ip.name) === normalizeName(name))) return fail('Ya existe una franquicia registrada con ese nombre.');
    if (owner.funds < cost) return fail(`Fondos insuficientes: registrar esta franquicia cuesta $${cost.toLocaleString()}.`);
    const original = details.originalGame;
    if (original && (!original.id || original.ipId || !Array.isArray(context.ownedGames) || !context.ownedGames.includes(original))) return fail('El juego original debe pertenecer a la empresa y no estar vinculado a otra franquicia.');
    const property = {
        id:id('ip'), name, ownerId:owner.id, ownerName:String(owner.name || owner.id),
        createdAt:timeOf(context), registeredYear:year,
        originalGenre:String(details.originalGenre || original?.genreId || original?.genre || ''),
        originalTopic:String(details.originalTopic || original?.topicId || original?.topic || ''),
        description:String(details.description || '').trim(), brandIdentity:String(details.brandIdentity || '').trim(),
        popularity:0, prestige:50, loyalty:0, expectations:0, saturation:0,
        gameIds:[], publishedGameIds:[], salesMilestones:{}, lastReleaseYear:null, lastEvolutionYear:year,
        ownershipHistory:[{ownerId:owner.id, ownerName:String(owner.name || owner.id), year, date:timeOf(context), reason:'registration'}],
        status:'OWNED', forSale:false, askingPrice:null
    };
    owner.funds -= cost;
    state.properties.push(property);
    event(state,property,'CREATED',context,{ownerId:owner.id,name});
    event(state,property,'REGISTERED',context,{ownerId:owner.id,cost});
    if (original) {
        original.ipId = property.id;
        original.ipReleaseType = 'original';
        property.gameIds.push(original.id);
        event(state,property,'GAME_LINKED',context,{gameId:original.id, gameName:original.name || '', releaseType:'original'});
        // Existing published titles contribute their already known score and sales.
        const releaseContext = {...context, year:Number.isInteger(original.releaseYear) ? original.releaseYear : year};
        recordRelease(state,property.id,original,context.ownedGames,releaseContext);
    }
    return ok({ip:property, cost});
}

/** Attach one published game, or a project object: callers retain the game as source of truth. */
export function linkGame(state, ownerId, ipId, game, context = {}) {
    const ip = find(state,ipId);
    const releaseType = context.releaseType || 'sequel';
    if (!ip || ip.ownerId !== ownerId) return fail('La franquicia no pertenece a esta empresa.');
    if (!game || !game.id) return fail('El videojuego debe tener un identificador válido.');
    if (!IP_RELEASE_TYPES.includes(releaseType)) return fail('El tipo de entrega no es válido.');
    if (game.ipId || state.properties.some(other => other.gameIds.includes(game.id))) return fail('El videojuego ya está vinculado a una franquicia.');
    game.ipId = ipId;
    game.ipReleaseType = releaseType;
    ip.gameIds.push(game.id);
    event(state,ip,'GAME_LINKED',context,{gameId:game.id,gameName:game.name || '',releaseType});
    return ok({ip,game});
}

/** Update quality once per published game; measured sales milestones can evolve later. */
export function recordRelease(state, ipId, game, games = [], context = {}) {
    const ip = find(state,ipId);
    if (!ip || !game || game.ipId !== ip.id || !game.id) return fail('El videojuego no está vinculado a la franquicia.');
    if (ip.publishedGameIds.includes(game.id)) return fail('La publicación ya se ha registrado.');
    const year = yearOf(context);
    if (year === null) return fail('Falta el año de publicación.');
    if (!ip.gameIds.includes(game.id)) {
        if (state.properties.some(other => other.id !== ipId && other.gameIds.includes(game.id))) return fail('El videojuego ya está vinculado a otra franquicia.');
        ip.gameIds.push(game.id);
        event(state,ip,'GAME_LINKED',context,{gameId:game.id,gameName:game.name || '',releaseType:game.ipReleaseType || 'sequel'});
    }
    const cfg = settings(state);
    const score = clamp(finite(game.score) ? game.score : (finite(game.pressScore) ? game.pressScore : 5),0,10);
    const satisfaction = (score - 5) / 5;
    ip.prestige = clamp(ip.prestige + satisfaction * cfg.prestigeScoreEffect, cfg.statMin, cfg.statMax);
    ip.loyalty = clamp(ip.loyalty + satisfaction * cfg.loyaltyScoreEffect, cfg.statMin, cfg.statMax);
    ip.popularity = clamp(ip.popularity + Math.max(1, cfg.popularityReleaseBase + satisfaction * cfg.popularityScoreEffect), cfg.statMin, cfg.statMax);
    ip.expectations = clamp(ip.expectations + Math.max(0, score - 5) * 2 + ip.popularity * .025, cfg.statMin, cfg.statMax);
    const gap = ip.lastReleaseYear === null ? Infinity : year - ip.lastReleaseYear;
    ip.saturation = clamp(ip.saturation + (gap <= cfg.rapidReleaseYears ? cfg.rapidReleaseSaturation : cfg.normalReleaseSaturation), cfg.statMin, cfg.statMax);
    ip.lastReleaseYear = year;
    ip.publishedGameIds.push(game.id);
    event(state,ip,'GAME_RELEASED',context,{gameId:game.id,gameName:game.name || '',releaseType:game.ipReleaseType || 'sequel'});
    updateIPSales(state,ipId,game,context);
    return ok({ip});
}

/** Apply each actual sales threshold once, without copying sales data into the IP. */
export function updateIPSales(state, ipId, game, context = {}) {
    const ip = find(state,ipId);
    if (!ip || !game || game.ipId !== ipId || !ip.publishedGameIds.includes(game.id)) return false;
    const cfg = settings(state);
    const milestones = [1000,10000,50000,250000,1000000];
    const volume = Math.max(0, Number(game.unitsSoldTotal) || 0, Number(game.installationsTotal) || 0);
    const previous = ip.salesMilestones[game.id] || 0;
    const reached = milestones.filter(n => volume >= n).length;
    const delta = Math.max(0,reached - previous);
    if (delta) {
        ip.popularity = clamp(ip.popularity + delta * cfg.salesMilestonePopularity, cfg.statMin, cfg.statMax);
        ip.loyalty = clamp(ip.loyalty + delta * (Number(game.score) >= 7 ? cfg.salesMilestoneLoyaltyHit : cfg.salesMilestoneLoyaltyMiss), cfg.statMin, cfg.statMax);
        ip.expectations = clamp(ip.expectations + delta * cfg.salesMilestoneExpectations, cfg.statMin, cfg.statMax);
        ip.salesMilestones[game.id] = reached;
        event(state,ip,'SALES_MILESTONE',context,{gameId:game.id, milestone:reached});
    }
    return delta > 0;
}

export function getIPBenefits(ip) {
    if (!ip) return {salesMultiplier:1, hypeBonus:0, expectationPenalty:0};
    const salesMultiplier = clamp(1 + ip.popularity / 400 + ip.loyalty / 600 + (ip.prestige - 50) / 700 - ip.saturation / 250, .55, 1.4);
    return {salesMultiplier, hypeBonus:Math.round(ip.popularity * .12 + ip.loyalty * .08), expectationPenalty:Math.max(0,(ip.expectations - 50) / 100)};
}

export function advanceIPYear(state, year) {
    if (!Number.isInteger(year)) return;
    const cfg=settings(state);
    for (const ip of state.properties) {
        const from=Number.isInteger(ip.lastEvolutionYear) ? ip.lastEvolutionYear : ip.registeredYear;
        for(let y=from+1;y<=year;y++) {
            ip.saturation=clamp(ip.saturation-cfg.saturationDecayPerYear,cfg.statMin,cfg.statMax);
            if (ip.lastReleaseYear !== null && y-ip.lastReleaseYear>cfg.inactivityGraceYears) {
                ip.popularity=clamp(ip.popularity-cfg.relevanceDecayPerYear,cfg.statMin,cfg.statMax);
                ip.loyalty=clamp(ip.loyalty-cfg.relevanceDecayPerYear*.35,cfg.statMin,cfg.statMax);
                ip.expectations=clamp(ip.expectations-.5,cfg.statMin,cfg.statMax);
            }
        }
        ip.lastEvolutionYear=Math.max(from,year);
    }
}

export function getIPValue(ip, games = [], year = ip?.registeredYear, options = {}) {
    if (!ip) return 0;
    const cfg = {...IP_DEFAULTS, ...options};
    const ids = new Set(ip.publishedGameIds || []);
    const sales = games.filter(game => ids.has(game.id)).reduce((total,game) => total + Math.max(0,Number(game.unitsSoldTotal)||0,Number(game.installationsTotal)||0),0);
    const age = Math.max(0,(Number(year)||ip.registeredYear)-ip.registeredYear);
    const relevance = ip.lastReleaseYear === null ? .8 : Math.max(.5,1-Math.max(0,(Number(year)||ip.lastReleaseYear)-ip.lastReleaseYear-3)*.025);
    return Math.max(0,Math.round((cfg.baseValue + ip.popularity*cfg.popularityValue + ip.prestige*cfg.prestigeValue + ip.loyalty*cfg.loyaltyValue + sales*cfg.salesValuePerUnit + Math.min(age,30)*150) * relevance * (1-ip.saturation*.004)));
}

export function setIPForSale(state,ownerId,ipId,askingPrice,context={}) {
    const ip=find(state,ipId);
    if (!ip || ip.ownerId!==ownerId) return fail('Solo el propietario puede poner esta franquicia a la venta.');
    if (askingPrice === null) { ip.forSale=false; ip.askingPrice=null; event(state,ip,'DELISTED',context,{ownerId}); return ok({ip}); }
    if (!finite(askingPrice) || askingPrice<=0) return fail('El precio solicitado debe ser positivo.');
    ip.forSale=true; ip.askingPrice=Math.round(askingPrice);
    event(state,ip,'LISTED',context,{ownerId,askingPrice:ip.askingPrice});
    return ok({ip});
}

/** Atomic transfer. Both counterparties must be real, distinct entities with funded wallets. */
export function transferIP(state,ipId,seller,buyer,price,context={}) {
    const ip=find(state,ipId);
    if (!ip || !seller || !buyer || !seller.id || !buyer.id || seller.id===buyer.id || ip.ownerId!==seller.id) return fail('La empresa vendedora no es propietaria de esta franquicia.');
    if (!finite(seller.funds) || !finite(buyer.funds) || !finite(price) || price<=0 || !Number.isSafeInteger(price)) return fail('Las cuentas o el precio de la operación no son válidos.');
    if (!ip.forSale || ip.askingPrice!==price) return fail('La franquicia no está anunciada a ese precio.');
    if (buyer.funds<price) return fail('La empresa compradora no dispone de fondos suficientes.');
    const date=timeOf(context), year=yearOf(context);
    if (year===null) return fail('Falta el año de la operación.');
    buyer.funds-=price; seller.funds+=price;
    const transaction={id:id('ipt'),ipId, sellerId:seller.id,sellerName:String(seller.name||seller.id),buyerId:buyer.id,buyerName:String(buyer.name||buyer.id),price,year,date};
    state.transactions.push(transaction);
    ip.ownerId=buyer.id; ip.ownerName=transaction.buyerName; ip.forSale=false; ip.askingPrice=null;
    ip.ownershipHistory.push({ownerId:buyer.id,ownerName:ip.ownerName,year,date,reason:'purchase',transactionId:transaction.id});
    event(state,ip,'TRANSFER',context,{transactionId:transaction.id,sellerId:seller.id,buyerId:buyer.id,price});
    return ok({ip,transaction});
}
