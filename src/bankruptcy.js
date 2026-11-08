/** Reorganisation and liquidation operate on the existing company, payroll,
 * loan and IP data. No assets are sold unless a real counterparty pays. */
import { setIPForSale, transferIP } from './ipSystem.js';
import { getFinanceMetrics, getCreditOffer } from './financeSystem.js';

const failure = message => ({ success: false, message });
const success = (message, data = {}) => ({ success: true, message, ...data });
const date = game => ({ year: game.getHistoricalYear(), week: game.getIndustryWeek() });
const available = game => !!game.financeState && !game.financeState.bankruptcy?.confirmed;
const addEvent = (game, type, detail = {}) => {
    const event = { type, ...date(game), ...detail };
    (game.financeState.history ||= []).push(event);
    return event;
};
const archived = game => (game.financeState.archivedProjects ||= []);

export function cancelPlayerProject(game) {
    if (!available(game)) return failure('La empresa ya está liquidada.');
    if (!game.currentProject) return failure('No hay ningún proyecto activo.');
    const project = game.currentProject;
    archived(game).push({ kind: 'game', project, reason: 'cancelled', ...date(game) });
    game.currentProject = null;
    addEvent(game, 'PROJECT_CANCELLED', { name: project.name, projectId: project.id || null });
    return success('Proyecto cancelado; se conserva su historial, sin reembolsar los gastos ya realizados.');
}

export function reduceStaff(game, employeeId) {
    if (!available(game)) return failure('La empresa ya está liquidada.');
    const index = game.employees.findIndex(employee => employee.id === employeeId);
    if (index <= 0 || game.employees[index]?.id === 'player') return failure('Selecciona un empleado distinto del fundador.');
    const employee = game.employees[index];
    // Initial severance is one monthly salary; its coefficient is configurable.
    const severance = Math.max(0, Math.round((Number(employee.salary) || 0) * (game.financeState.settings?.severanceMonths ?? 1)));
    if (game.funds < severance) return failure('Fondos insuficientes para pagar la indemnización.');
    game.funds -= severance;
    game.employees.splice(index, 1);
    (game.availableCandidates ||= []).push({ ...employee, salaryExpectation: employee.salary });
    addEvent(game, 'STAFF_REDUCTION', { employeeId, name: employee.name, severance });
    return success('Empleado desvinculado y disponible en el mercado laboral.', { severance, employee });
}

export function stopResearch(game) {
    if (!available(game)) return failure('La empresa ya está liquidada.');
    const fields = ['activeResearch', 'activeTopicResearch', 'activeGenreResearch', 'activeEngineRD'];
    const cancelled = fields.filter(key => game[key]);
    if (!cancelled.length) return failure('No hay investigaciones activas.');
    for (const key of cancelled) {
        archived(game).push({ kind: key, project: game[key], reason: 'cancelled', ...date(game) });
        game[key] = null;
    }
    addEvent(game, 'RESEARCH_CANCELLED', { projects: cancelled });
    return success('Investigaciones detenidas; los costes anteriores no se devuelven.', { cancelled });
}

export function restructureCompany(game) {
    if (!available(game)) return failure('La empresa ya está liquidada.');
    if (game.financeState.restructuring?.active) return failure('Ya hay un plan de reestructuración activo.');
    const multiplier = Number(game.financeState.settings?.restructureOfficeMultiplier ?? 0.8);
    if (!Number.isFinite(multiplier) || multiplier <= 0 || multiplier > 1) return failure('El parámetro de reducción de costes no es válido.');
    game.financeState.restructuring = { active: true, officeMultiplier: multiplier, ...date(game) };
    addEvent(game, 'RESTRUCTURING', { officeMultiplier: multiplier });
    return success(`Plan activado: costes de oficina al ${Math.round(multiplier * 100)}%. No garantiza la recuperación.`);
}

/** This is only a preview: no funds, assets or personnel change. */
export function prepareBankruptcy(game) {
    const finance = game.financeState;
    if (!available(game)) return failure('La empresa ya está liquidada.');
    const graceWeeks = finance.settings?.bankruptcyGraceWeeks ?? 8;
    if (finance.status !== 'SEVERE' || (finance.severeWeeks || 0) < graceWeeks)
        return failure(`La bancarrota requiere ${graceWeeks} semanas consecutivas de insolvencia grave.`);
    const metrics = getFinanceMetrics(game);
    if (metrics.cash >= metrics.due + metrics.arrears + metrics.weeklyCosts * 4)
        return failure('La liquidez disponible cubre las obligaciones próximas; revisa el plan de recuperación.');
    const shortfall = Math.max(1000, Math.max(0, -metrics.cash) + metrics.due + metrics.arrears + metrics.weeklyCosts * 4 - metrics.weeklyIncome * 4);
    const offer = getCreditOffer(game, 'emergency');
    if (offer.available && offer.limit >= shortfall)
        return failure('Hay financiación de emergencia suficiente para cubrir las obligaciones inmediatas. Revísala antes de liquidar.');
    if (metrics.cashFlow > 0 && metrics.cash + metrics.cashFlow * 4 >= metrics.due + metrics.arrears)
        return failure('El flujo de caja actual permite afrontar las obligaciones próximas; sigue el plan de recuperación.');
    const loans = (finance.loans || []).filter(loan => (Number(loan.remaining) || 0) + (Number(loan.arrears) || 0) > 0);
    const debt = loans.reduce((sum, loan) => sum + Math.max(0, Number(loan.remaining) || 0) + Math.max(0, Number(loan.arrears) || 0), 0) + Math.max(0, -game.funds);
    return success('La liquidación requiere confirmación. Los activos sin comprador no producen ingresos.', {
        summary: { cash: game.funds, debt, employees: Math.max(0, game.employees.length - 1),
            severance: game.employees.slice(1).reduce((sum, employee) => sum + Math.max(0, Math.round((Number(employee.salary) || 0) * (finance.settings?.severanceMonths ?? 1))), 0),
            franchises: (game.ipState?.properties || []).filter(ip => ip.ownerId === 'player').length,
            projects: game.currentProject ? 1 : 0, loans: loans.length }
    });
}

/** Explicit final action, guarded and idempotent. */
export function confirmBankruptcy(game, options = {}) {
    const eligibility = prepareBankruptcy(game);
    if (!eligibility.success) return eligibility;
    const mode = options.mode ?? 'end';
    if (!['end', 'spectator'].includes(mode)) return failure('El modo de continuación no es válido.');
    const finance = game.financeState;
    const year = game.getHistoricalYear();
    const startedFunds = game.funds;
    const archivedProject = game.currentProject?.name || null;
    if (game.currentProject) cancelPlayerProject(game);
    if (['activeResearch', 'activeTopicResearch', 'activeGenreResearch', 'activeEngineRD'].some(key => game[key])) stopResearch(game);

    const soldIPs = [], unsoldIPs = [];
    for (const ip of (game.ipState?.properties || []).filter(item => item.ownerId === 'player')) {
        const valuation = Math.max(1, Math.round(game.getIPValue(ip.id) * (finance.settings?.liquidationIPFraction ?? 0.65)));
        // Only active businesses with genuine spare cash and a franchise strategy can buy.
        const buyers = (game.ipCompanies || []).filter(company => !['CLOSED', 'BANKRUPT', 'ACQUISITION'].includes(company.status) &&
            Number.isFinite(company.funds) && (company.decisionWeights?.franchise ?? 0) >= 0.3 &&
            company.funds - valuation >= (company.employees || []).reduce((sum, employee) => sum + Math.max(0, Number(employee.salary) || 0), 0) * 2)
            .sort((a, b) => (b.decisionWeights?.franchise || 0) - (a.decisionWeights?.franchise || 0));
        const buyer = buyers[0];
        if (!buyer) {
            if (ip.forSale) setIPForSale(game.ipState, 'player', ip.id, null, { year });
            unsoldIPs.push({ id: ip.id, name: ip.name });
            continue;
        }
        const listing = setIPForSale(game.ipState, 'player', ip.id, valuation, { year });
        const result = listing.success ? transferIP(game.ipState, ip.id, game.getIPOwner(), buyer, valuation, { year }) : listing;
        if (!result.success) {
            if (ip.forSale) setIPForSale(game.ipState, 'player', ip.id, null, { year });
            unsoldIPs.push({ id: ip.id, name: ip.name });
            continue;
        }
        buyer.totalExpenses = (buyer.totalExpenses || 0) + valuation;
        soldIPs.push({ id: ip.id, name: ip.name, buyerId: buyer.id, buyerName: buyer.name, price: valuation, transactionId: result.transaction.id });
    }

    const payments = [];
    for (const loan of finance.loans || []) {
        const principal = Math.max(0, Number(loan.remaining) || 0);
        const arrears = Math.max(0, Number(loan.arrears) || 0);
        const outstanding = principal + arrears;
        if (!outstanding) continue;
        const paid = Math.min(Math.max(0, game.funds), outstanding);
        game.funds -= paid;
        const paidArrears = Math.min(arrears, paid);
        loan.arrears = arrears - paidArrears;
        loan.remaining = principal - (paid - paidArrears);
        const unpaid = loan.remaining + loan.arrears;
        loan.status = unpaid > 0 ? 'DEFAULTED' : 'PAID';
        (loan.paymentHistory ||= []).push({ ...date(game), type: 'LIQUIDATION', paid, remaining: loan.remaining, arrears: loan.arrears });
        payments.push({ loanId: loan.id, lender: loan.lender, paid, remaining: unpaid });
    }

    const dismissed = game.employees.slice(1);
    const severanceDue = dismissed.reduce((sum, employee) => sum + Math.max(0, Math.round((Number(employee.salary) || 0) * (finance.settings?.severanceMonths ?? 1))), 0);
    const severancePaid = Math.min(Math.max(0, game.funds), severanceDue);
    game.funds -= severancePaid;
    for (const employee of dismissed) (game.availableCandidates ||= []).push({ ...employee, salaryExpectation: employee.salary });
    game.employees = game.employees.slice(0, 1);
    if (game.employees[0]) game.employees[0].salary = 0;
    const estateAssets = { engines: game.inHouseEngines || [], customEngines: game.customEngines || [], devKits: game.ownedDevKits || [] };
    game.inHouseEngines = []; game.customEngines = []; game.ownedDevKits = [];
    finance.status = 'BANKRUPT';
    const bankruptcy = finance.bankruptcy = { confirmed: true, mode, ...date(game), reason: 'Insolvencia grave sostenida',
        initialFunds: startedFunds, finalFunds: game.funds, loanPayments: payments,
        unpaidLoans: payments.reduce((sum, item) => sum + item.remaining, 0), negativeCash: Math.max(0, -game.funds),
        employeeSeverance: { due: severanceDue, paid: severancePaid, unpaid: severanceDue - severancePaid },
        soldIPs, unsoldIPs, employeesAffected: dismissed.map(({id,name}) => ({id,name})), archivedProject, estateAssets };
    addEvent(game, 'BANKRUPTCY', { mode, soldIPs: soldIPs.length, unsoldIPs: unsoldIPs.length, employees: dismissed.length });
    if (mode === 'end') game.isPaused = true;
    return success('Procedimiento de liquidación completado.', { bankruptcy });
}
