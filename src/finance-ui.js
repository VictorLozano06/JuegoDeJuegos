// Company finance UI. All amounts and decisions come from the simulation.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => Number.isFinite(Number(n)) ? '$' + Math.round(Number(n)).toLocaleString('es-ES') : '—';
const num = n => Number.isFinite(Number(n)) ? Math.round(Number(n)).toLocaleString('es-ES') : '—';
const pct = n => Number.isFinite(Number(n)) ? `${Math.round(Number(n) * (Number(n) <= 1 ? 100 : 1))}%` : '—';
const statusNames = { HEALTHY:'Saludable', WATCH:'Vigilancia financiera', DIFFICULTIES:'Dificultades económicas', INSOLVENT:'Insolvencia técnica', SEVERE:'Insolvencia grave', BANKRUPT:'Bancarrota' };
const notices = { WATCH:'La liquidez requiere seguimiento y conviene vigilar los gastos.', DIFFICULTIES:'La empresa atraviesa dificultades. Revisa los gastos y las opciones de financiación.', INSOLVENT:'Hay obligaciones que la empresa podría no poder afrontar.', SEVERE:'Riesgo elevado de bancarrota. Consulta las alternativas de recuperación y la situación de los acreedores.', BANKRUPT:'La empresa está en bancarrota. Consulta el resultado de la liquidación.' };
const metric = (label,value) => `<div class="finance-card"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
const attrs = o => Object.entries(o || {}).filter(([,v]) => ['string','number'].includes(typeof v)).map(([k,v])=>`${esc(k)}: ${esc(v)}`).join(' · ');

function graph(history) {
    const data = (history || []).slice(-24).map(p => ({cash:Number(p.cash ?? p.funds), flow:Number(p.cashFlow ?? p.flow)})).filter(p => Number.isFinite(p.cash));
    if (data.length < 2) return '<p class="finance-muted">La gráfica aparecerá cuando haya al menos dos semanas registradas.</p>';
    const vals = data.flatMap(p => [p.cash, ...(Number.isFinite(p.flow) ? [p.flow] : [])]);
    const min = Math.min(0,...vals), max = Math.max(1,...vals), span = Math.max(1,max-min);
    const points = key => data.map((p,i)=>`${(12+i*676/(data.length-1)).toFixed(1)},${(130-110*((Number.isFinite(p[key]) ? p[key] : 0)-min)/span).toFixed(1)}`).join(' ');
    return `<svg class="finance-graph" viewBox="0 0 700 145" role="img" aria-label="Evolución de liquidez y flujo de caja en las últimas semanas" preserveAspectRatio="none"><line x1="12" y1="130" x2="688" y2="130" stroke="#52677a"/><polyline fill="none" stroke="#40d4df" stroke-width="3" points="${points('cash')}"/><polyline fill="none" stroke="#f7b968" stroke-width="3" points="${points('flow')}"/></svg><div class="finance-legend"><span>Liquidez: ${money(data.at(-1).cash)}</span><span>Flujo semanal: ${money(data.at(-1).flow)}</span><span>Últimas ${data.length} semanas</span></div>`;
}

export function initializeFinanceUI({ game, openModal, showToast, resumeRecovery, onBankruptcyCommitted }) {
    const modal = document.createElement('div');
    modal.id = 'modal-company-finance'; modal.className = 'modal-backdrop';
    modal.innerHTML = `<div class="modal-window finance-window"><div class="modal-header"><h2 class="modal-title">Empresa / Finanzas / Salud financiera</h2><button type="button" class="modal-close" aria-label="Cerrar">&times;</button></div><div id="finance-view"></div></div>`;
    document.body.appendChild(modal);
    let prepared = null;
    const getState = () => game.financeState || {};
    const report = () => game.getFinancialReport();
    const action = (result, message) => {
        if (!result?.success) { showToast(result?.message || 'No se pudo completar la operación.', 'warn'); return; }
        showToast(result.message || message, 'success'); prepared = null; render();
    };
    const render = () => {
        const state=getState(), m=report(), s=state.status || 'HEALTHY', loans=state.loans || [], history=state.weeklyHistory || [];
        const openLoans=loans.filter(l=>l.status !== 'PAID' && l.status !== 'REFINANCED');
        const active = s !== 'BANKRUPT';
        const staff = (game.employees || []).slice(1);
        const loansHtml=openLoans.map(l=>`<div class="finance-loan"><strong>${esc(l.lender || 'Acreedor')}</strong><p>Capital pendiente ${money(l.remaining)} · Cuota ${money(l.installment)} · Atrasos ${money(l.arrears)} · Próximo pago: semana ${esc(l.nextDueWeek ?? '—')} · Interés anual ${pct(l.annualInterestRate)} · Impagos ${num(l.missedPayments)}</p>${active ? `<button type="button" class="dock-btn" data-finance-action="refinance" data-id="${esc(l.id)}">Solicitar refinanciación</button>` : ''}</div>`).join('');
        const b=state.bankruptcy;
        const sold = (b?.soldIPs || []).map(ip => `<li>${esc(ip.name)} · ${esc(ip.buyerName)} · ${money(ip.price)}</li>`).join('');
        const unsold = (b?.unsoldIPs || []).map(ip => `<li>${esc(ip.name)}</li>`).join('');
        const affected = (b?.employeesAffected || []).map(employee => esc(employee.name)).join(', ');
        const bankruptcyResult = s === 'BANKRUPT' ? `<section class="finance-panel finance-danger"><h3>Resultado de la bancarrota</h3><p>Motivo: ${esc(b?.reason || 'Insolvencia grave sostenida')} · Resultado: ${b?.mode === 'spectator' ? 'Modo histórico' : 'Partida finalizada'}</p><p>Saldo inicial: ${money(b?.initialFunds)} · Saldo final: ${money(b?.finalFunds)} · Deuda de préstamos sin pagar: ${money(b?.unpaidLoans)} · Saldo negativo: ${money(b?.negativeCash)} · Indemnizaciones pendientes: ${money(b?.employeeSeverance?.unpaid)}</p><p>Proyecto archivado: ${esc(b?.archivedProject || 'Ninguno')} · Empleados afectados: ${num((b?.employeesAffected || []).length)}${affected ? ` (${affected})` : ''}</p><p>Franquicias transferidas:</p>${sold ? `<ul>${sold}</ul>` : '<p>Ninguna.</p>'}<p>Franquicias sin comprador, en el patrimonio de liquidación:</p>${unsold ? `<ul>${unsold}</ul>` : '<p>Ninguna.</p>'}<p>Activos conservados en liquidación: ${num(b?.estateAssets?.engines?.length)} motores propios, ${num(b?.estateAssets?.customEngines?.length)} motores personalizados y ${num(b?.estateAssets?.devKits?.length)} kits de desarrollo.</p><p>El historial y los videojuegos publicados permanecen en la partida.</p></section>` : '';
        const recovery = active ? `<section class="finance-panel"><h3>Recuperación y reestructuración</h3><p>Las medidas afectan al proyecto y a los recursos reales del estudio; no garantizan la recuperación.</p><div class="finance-actions"><button type="button" class="dock-btn" data-finance-action="ip">Gestionar venta de IP</button><button type="button" class="dock-btn" data-finance-action="cancel" ${game.currentProject?'':'disabled'}>Cancelar proyecto activo</button><button type="button" class="dock-btn" data-finance-action="stop-research" ${game.activeResearch || game.activeTopicResearch || game.activeGenreResearch || game.activeEngineRD ? '' : 'disabled'}>Detener investigación</button><button type="button" class="dock-btn" data-finance-action="restructure">Iniciar reestructuración</button>${state.procedurePending ? '<button type="button" class="dock-btn" data-finance-action="resume">Revisar y continuar</button>' : ''}</div>${staff.length ? `<form class="finance-actions" data-finance-form="staff"><label>Reducir plantilla<select name="employeeId" class="form-select" required><option value="">Selecciona un empleado</option>${staff.map(e=>`<option value="${esc(e.id)}">${esc(e.name)} · ${money(e.salary)}/mes</option>`).join('')}</select></label><button type="submit" class="dock-btn">Reducir plantilla</button></form>` : '<p>No hay empleados adicionales para reducir.</p>'}</section>` : '';
        const bankOffer = active ? game.getFinanceCreditOffer('bank') : null, emergencyOffer = active ? game.getFinanceCreditOffer('emergency') : null;
        const explainOffer = (name,offer) => `${name}: ${offer.available ? `hasta ${money(offer.limit)}, interés anual ${pct(offer.annualInterestRate)}, ${num(offer.installments)} cuotas` : esc(offer.reason || 'No disponible')}.`;
        const loanForm=active ? `<section class="finance-panel"><h3>Solicitar financiación</h3><p>${explainOffer('Préstamo bancario',bankOffer)}<br>${explainOffer('Emergencia',emergencyOffer)}</p><form class="finance-actions" data-finance-form="loan"><label>Modalidad<select name="type" class="form-select"><option value="bank">Préstamo bancario</option><option value="emergency">Financiación de emergencia</option></select></label><label>Importe<input name="amount" class="form-input" type="number" min="1000" step="1" required></label><button type="submit" class="dock-btn btn-primary-action">Solicitar</button></form><p>La aprobación y las condiciones dependen de la situación financiera y del límite de crédito.</p></section>` : '';
        const prep = prepared?.summary;
        const finalProcedure = active ? `<section class="finance-panel finance-danger"><h3>Procedimiento de bancarrota</h3><p>La declaración definitiva detiene las operaciones y aplica la liquidación de activos y deudas. La partida no se elimina.</p><button type="button" class="dock-btn" data-finance-action="prepare">Consultar situación y elegibilidad</button>${prep ? `<div class="finance-alert finance-danger"><p>Revisión final: liquidez ${money(prep.cash)} · Deuda ${money(prep.debt)} · Empleados ${num(prep.employees)} · Indemnizaciones ${money(prep.severance)} · Franquicias ${num(prep.franchises)} · Proyectos ${num(prep.projects)}.</p><form class="finance-actions" data-finance-form="bankruptcy"><label>Resultado de partida<select name="mode" class="form-select"><option value="end">Finalizar partida</option><option value="spectator">Continuar en modo histórico</option></select></label><button type="submit" class="dock-btn">Confirmar bancarrota</button></form></div>` : ''}</section>` : '';
        document.getElementById('finance-view').innerHTML = `<div class="finance-alert ${s==='SEVERE'||s==='BANKRUPT'?'finance-danger':''}"><strong>${esc(statusNames[s] || s)}</strong>${notices[s] ? `<p>${esc(notices[s])}</p>` : ''}</div><div class="finance-grid">${metric('Dinero disponible',money(m.cash))}${metric('Deuda pendiente',money(m.debt))}${metric('Cuotas próximas',money(m.due))}${metric('Impagos acumulados',money(m.arrears))}${metric('Ingresos comerciales',money(m.weeklyIncome))}${metric('Gastos recurrentes',money(m.weeklyCosts))}${metric('Gastos estimados',money(m.expenses))}${metric('Resultado estimado',money(m.profitability))}${metric('Flujo de caja',money(m.cashFlow))}${metric('Ratio de liquidez',Number.isFinite(m.liquidity)?m.liquidity.toFixed(2):'—')}${metric('Endeudamiento',Number.isFinite(m.debtRatio)?m.debtRatio.toFixed(2):'—')}${metric('Riesgo',`${num(m.risk)}%`)}${metric('Salud financiera',num(m.health))}${metric('Activos estimados',money(m.assetValue))}${metric('Reputación crediticia',num(state.creditScore))}</div><section class="finance-panel"><h3>Evolución financiera</h3>${graph(history)}</section>${loanForm}<section class="finance-panel"><h3>Préstamos y acreedores</h3>${loansHtml ? `<div class="finance-loans">${loansHtml}</div>` : '<p>No hay préstamos pendientes.</p>'}</section>${recovery}${finalProcedure}${bankruptcyResult}`;
    };
    const open = () => { prepared=null;render();openModal(modal.id); };
    document.getElementById('btn-company-finance')?.addEventListener('click',open);
    modal.addEventListener('click',event=>{
        if(event.target===modal || event.target.closest('.modal-close')) { modal.style.display='none';modal.classList.remove('active');return; }
        const button=event.target.closest('[data-finance-action]'); if(!button)return;
        switch(button.dataset.financeAction) {
            case 'ip': document.getElementById('btn-company-ip')?.click(); break;
            case 'refinance': action(game.refinanceFinanceLoan(button.dataset.id),'Refinanciación registrada.'); break;
            case 'cancel': action(game.cancelProjectForFinance(),'Proyecto cancelado.'); break;
            case 'stop-research': action(game.stopFinanceResearch(),'Investigación detenida.'); break;
            case 'restructure': action(game.beginRestructuring(),'Reestructuración iniciada.'); break;
            case 'resume': action(resumeRecovery?.(), 'Plan revisado; simulación reanudada.'); break;
            case 'prepare': { const result=game.prepareBankruptcy();if(result?.success){prepared=result;render();}else showToast(result?.message||'El procedimiento no está disponible.','warn'); break; }
        }
    });
    modal.addEventListener('submit',event=>{
        const form=event.target.closest('[data-finance-form]');if(!form)return;event.preventDefault();
        const values=Object.fromEntries(new FormData(form).entries());
        if(form.dataset.financeForm==='loan') action(game.requestFinanceLoan({type:values.type,amount:Number(values.amount)}),'Préstamo concedido.');
        if(form.dataset.financeForm==='staff') action(game.reduceFinanceStaff(values.employeeId),'Plantilla reducida.');
        if(form.dataset.financeForm==='bankruptcy') {
            const result=game.confirmBankruptcy({mode:values.mode});
            if (result?.success) onBankruptcyCommitted?.();
            action(result,'Bancarrota registrada.');
        }
    });
    game.onFinanceStatusChanged = status => { const next=typeof status==='object' ? (status.status || status.to) : status; if(notices[next]) showToast(notices[next], next==='HEALTHY'?'success':'warn'); if(modal.classList.contains('active')) render(); };
    game.onBankruptcyProcedureRequired = () => {
        prepared = game.prepareBankruptcy();
        render();
        openModal(modal.id);
        showToast('Insolvencia grave sostenida. Revisa la situación y las opciones antes de continuar.', 'warn');
    };
    return { open };
}
