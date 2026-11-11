/** Conversiones y ventas por plataforma. Estado serializable en la partida. */
const num = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const week = game => game.getIndustryWeek();
const year = game => game.getHistoricalYear();
const platformsOf = title => new Set([title.platformId, ...(title.platformIds || []), ...(title.ports || []).map(port => port.platformId)].filter(Boolean));
const projectsOf = game => game.portProjects || [];
const isActive = (platform, game) => platform && platform.status !== 'RETIRED' && (platform.releaseYear == null || year(game) >= platform.releaseYear) && (platform.retireYear == null || year(game) < platform.retireYear);
const age = (game, title) => Number.isFinite(title.releaseIndustryWeek) ? week(game) - title.releaseIndustryWeek : Math.max(num(title.weeksOnMarket), title.releaseYear ? (year(game) - title.releaseYear) * 48 : 0);

export function getPortOptions(game, gameId) {
    const title = (game.gamesHistory || []).find(item => item.id === gameId);
    if (!title) return { title: null, platforms: [], employees: [], reason: 'Juego no encontrado.' };
    let reason = '';
    if (num(title.score) <= 6) reason = 'El juego necesita una nota superior a 6.';
    else if (age(game, title) < 12) reason = 'El juego debe llevar al menos 12 semanas en el mercado.';
    else if (title.isEarlyAccess && !title.officialReleased) reason = 'Publica primero la versión definitiva.';
    const owned = new Set(game.ownedDevKits || []);
    const released = platformsOf(title);
    const activePorts = projectsOf(game);
    const platforms = (game.getPlatforms?.() || []).filter(p => isActive(p, game) && owned.has(p.id) && !released.has(p.id) && !activePorts.some(port => port.gameId === gameId && port.platformId === p.id));
    const employees = (game.employees || []).filter(e => !activePorts.some(port => port.employeeId === e.id) && !(e.sickWeeksRemaining > 0));
    const cost = Math.ceil(Math.max(0, num(title.devCost)) * 0.2);
    return { title, platforms, employees, cost, reason };
}

export function startPortProject(game, gameId, platformId, employeeId) {
    if (game.financeState?.bankruptcy?.confirmed || ['INSOLVENT', 'SEVERE'].includes(game.financeState?.status) || game.financeState?.procedurePending) return { success: false, message: 'La situación financiera impide iniciar inversiones.' };
    const options = getPortOptions(game, gameId);
    if (options.reason) return { success: false, message: options.reason };
    const platform = options.platforms.find(p => p.id === platformId);
    const employee = options.employees.find(e => e.id === employeeId);
    if (!platform) return { success: false, message: 'La plataforma no está activa, ya tiene versión o no tienes su DevKit.' };
    if (!employee) return { success: false, message: 'Selecciona un empleado disponible.' };
    if (num(game.funds) < options.cost) return { success: false, message: 'Fondos insuficientes para el port.' };
    const duration = Math.max(4, Math.min(8, 8 - Math.floor(num(employee.tech) / 25)));
    const project = { gameId, platformId, platformName: platform.name, employeeId, employeeName: employee.name, cost: options.cost, totalWeeks: duration, weeksRemaining: duration, startedWeek: week(game) };
    game.funds -= options.cost;
    (game.portProjects ||= []).push(project);
    game.notify?.();
    return { success: true, project, message: `Porteo a ${platform.name} iniciado.` };
}

/** Ejecutar una vez por semana, tras las ventas principales y antes del informe financiero. */
export function tickPorting(game) {
    let income = 0;
    // Solo los ports publicados antes de esta semana venden: el estreno empieza la semana siguiente.
    for (const title of game.gamesHistory || []) for (const port of title.ports || []) {
        if (port.retired || port.releaseIndustryWeek >= week(game)) continue;
        port.weeksOnMarket++;
        const curve = port.weeksOnMarket === 1 ? 0.75 : port.weeksOnMarket === 2 ? 1 : port.weeksOnMarket <= 4 ? (port.weeksOnMarket === 3 ? .84 : .72) : Math.max(.006, .72 * Math.pow(.72, port.weeksOnMarket - 4));
        const industry = game.getIndustrySalesMultiplier?.(port.platformId, title.genreId) ?? 1;
        const units = Math.max(0, Math.floor(port.salesPotential / 4.1 * curve * industry));
        const service = ['f2p', 'live_service'].includes(title.businessModel);
        const gross = Math.floor(units * port.price * (service ? (num(title.conversionRate) || .02) * .55 : 1));
        const royalty = Math.max(0, Math.min(1, num(port.platformRoyaltyRate) + num(title.royaltyRate) + num(title.publisherRevenueShare) + num(title.subscriptionRevenueShare)));
        const revenue = Math.floor(gross * (1 - royalty));
        port.unitsSoldLastWeek = units; port.unitsSoldTotal += units; port.revenueTotal += revenue;
        if (service) title.installationsTotal = num(title.installationsTotal) + units;
        else title.unitsSoldTotal = num(title.unitsSoldTotal) + units;
        title.revenueTotal = num(title.revenueTotal) + revenue;
        title.profit = num(title.profit) + revenue;
        const active = (game.activeSales || []).find(item => item.id === title.id);
        if (active && active !== title) Object.assign(active, { ports: title.ports, unitsSoldTotal: title.unitsSoldTotal, installationsTotal: title.installationsTotal, revenueTotal: title.revenueTotal, profit: title.profit });
        game.funds += revenue; income += revenue;
    }
    game.lastWeeklySalesIncome = num(game.lastWeeklySalesIncome) + income;
    const completed = [];
    const remaining = [];
    for (const project of projectsOf(game)) {
        const title = (game.gamesHistory || []).find(item => item.id === project.gameId);
        const platform = game.getPlatformById?.(project.platformId);
        const employee = (game.employees || []).find(item => item.id === project.employeeId);
        if (!title || !employee || !isActive(platform, game)) {
            game.funds += project.cost;
            game.onPortProjectCancelled?.(project);
            continue;
        }
        if (employee.sickWeeksRemaining > 0) { remaining.push(project); continue; }
        project.weeksRemaining--;
        if (project.weeksRemaining > 0) { remaining.push(project); continue; }
        const launchShare = Math.max(.05, num(title.launchMarketShare) || .1);
        const targetShare = Math.max(.01, num(platform.marketShare));
        const scoreFactor = Math.max(.3, Math.min(1.5, num(title.score) / 8));
        const potential = Math.max(20, Math.floor(num(title.salesPotential) * .55 * targetShare / launchShare * scoreFactor));
        const port = { platformId: platform.id, platformName: platform.name, releaseIndustryWeek: week(game), releaseYear: year(game), weeksOnMarket: 0, salesPotential: potential, price: num(title.basePrice || title.referencePrice), platformRoyaltyRate: num(platform.royaltyRate), unitsSoldLastWeek: 0, unitsSoldTotal: 0, revenueTotal: 0, cost: project.cost };
        (title.ports ||= []).push(port);
        title.platformIds = [...platformsOf(title)];
        title.portDevelopmentCosts = num(title.portDevelopmentCosts) + project.cost;
        title.profit = num(title.profit) - project.cost;
        const active = (game.activeSales || []).find(item => item.id === title.id);
        if (active && active !== title) Object.assign(active, { ports: title.ports, platformIds: title.platformIds, portDevelopmentCosts: title.portDevelopmentCosts, profit: title.profit });
        completed.push({ project, title, port });
        game.onPortProjectCompleted?.(project, title, port);
    }
    game.portProjects = remaining;
    return { completed, income };
}
