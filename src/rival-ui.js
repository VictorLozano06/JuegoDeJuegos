// The directory renders only persistent competitors supplied by the simulation.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => Number.isFinite(Number(value)) ? '$' + Math.round(Number(value)).toLocaleString('es-ES') : '—';
const amount = value => Number.isFinite(Number(value)) ? Math.round(Number(value)).toLocaleString('es-ES') : '—';
const text = value => value == null || value === '' ? '—' : esc(value);
const profiles = {indie:'Independiente',medium:'Mediana',large:'Gran compañía',experimental:'Experimental',conservative:'Conservadora'};
const statuses = {ACTIVE:'Independiente',EXPANDING:'En expansión',CRISIS:'En crisis',RESTRUCTURING:'En reestructuración',ACQUISITION:'En adquisición',BANKRUPT:'En bancarrota',CLOSED:'Cerrada'};
const historyTypes = {FOUNDED:'Fundación',STATUS:'Cambio de situación',RESEARCH:'Investigación',LAYOFF:'Reducción de plantilla',HIRE:'Contratación',IP_LISTED:'Franquicia en venta',IP_BUY:'Compra de franquicia',PROJECT_START:'Inicio de proyecto',GAME_RELEASED:'Publicación'};
const metric = (label, value) => `<div class="rival-metric"><span>${esc(label)}</span><strong>${text(value)}</strong></div>`;
const list = value => Array.isArray(value) ? value : [];
const companies = game => list(game.ipCompanies);
const label = value => typeof value === 'object' && value ? value.name || value.id || '' : value;
const listNames = values => list(values).map(label).filter(Boolean).map(esc).join(', ') || '—';
const titleOf = entity => esc(entity.name || entity.title || 'Sin nombre');

function detailsText(value) {
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (!value || typeof value !== 'object') return '';
    return Object.entries(value).filter(([,v]) => ['string','number'].includes(typeof v)).map(([key,v]) => `${key}: ${v}`).join(' · ');
}

function companyCard(company, game) {
    const ownedIPs = list(game.ipState?.properties).filter(ip => ip.ownerId === company.id).length;
    return `<article class="rival-card"><div class="rival-card-head"><h3>${titleOf(company)}</h3><span class="rival-badge">${text(statuses[company.status] || company.status)}</span></div><p>${text(profiles[company.profile] || company.profile)} · ${text(company.country)}</p><div class="rival-metrics">${metric('Capital',money(company.funds))}${metric('Reputación',amount(company.reputation))}${metric('Empleados',list(company.employees).length)}${metric('Juegos publicados',list(company.games).length)}${metric('Proyectos',list(company.projects).length)}${metric('Franquicias',ownedIPs)}</div><button class="dock-btn" type="button" data-rival-action="detail" data-id="${esc(company.id)}">Ver empresa</button></article>`;
}

function projectsSection(company) {
    const projects = list(company.projects);
    if (!projects.length) return '<p class="rival-empty">No tiene proyectos activos.</p>';
    return `<ul class="rival-list">${projects.map(project => `<li><strong>${titleOf(project)}</strong><span>${text(label(project.genre) || project.genreId)} · ${text(label(project.topic) || project.topicId)} · Avance ${amount((Number(project.progress) || 0) * 100)}%</span><span>Presupuesto ${money(project.budget)} · Marketing ${money(project.marketingBudget)} · Equipo ${list(project.teamIds).length}</span></li>`).join('')}</ul>`;
}

function gamesSection(company, game) {
    const games = list(company.games);
    if (!games.length) return '<p class="rival-empty">Todavía no ha publicado juegos.</p>';
    return `<ul class="rival-list">${games.map(g => {
        const ip = list(game.ipState?.properties).find(item => item.id === g.ipId);
        return `<li><strong>${titleOf(g)}</strong><span>${text(g.releaseYear)} · ${text(label(g.genre) || g.genreId)} · Nota ${text(g.score)}</span><span>Ventas ${amount(g.unitsSoldTotal)}${ip ? ` · Franquicia ${esc(ip.name)}` : ''}</span></li>`;
    }).join('')}</ul>`;
}

function historySection(company) {
    const history = list(company.history);
    if (!history.length) return '<p class="rival-empty">Aún no hay acontecimientos registrados.</p>';
    return `<ul class="rival-list">${[...history].reverse().slice(0,40).map(event => `<li><strong>${text(historyTypes[event.type] || event.type)}</strong><span>${text(event.year)}${event.week != null ? ` · Semana ${text(event.week)}` : ''}${event.description ? ` · ${esc(event.description)}` : ''}${detailsText(event.details) ? ` · ${esc(detailsText(event.details))}` : ''}</span></li>`).join('')}</ul>`;
}

function companyDetail(company, game) {
    const ips = list(game.ipState?.properties).filter(ip => ip.ownerId === company.id);
    const salary = Number(company.salaryCosts ?? company.salaryExpenses ?? 0);
    return `<section class="rival-detail"><div class="rival-detail-title"><div><h3>${titleOf(company)}</h3><p>${text(company.legalName)} · Fundada en ${text(company.foundedYear)} · ${text(company.headquarters)}, ${text(company.country)}</p></div><button class="dock-btn" type="button" data-rival-action="back">Volver al directorio</button></div><p class="rival-description">${text(company.description)}</p><p class="rival-description">Perfil: ${text(profiles[company.profile] || company.profile)} · Personalidad: ${text(label(company.personality))} · Estrategia: ${text(label(company.strategy))}</p><div class="rival-metrics rival-metrics-detail">${metric('Capital',money(company.funds))}${metric('Ingresos acumulados',money(company.totalRevenue))}${metric('Gastos acumulados',money(company.totalExpenses))}${metric('Deuda',money(company.debt))}${metric('Salarios acumulados',money(salary))}${metric('Beneficio acumulado',money(Number(company.totalRevenue || 0) - Number(company.totalExpenses || 0)))}${metric('Valoración',company.valuation == null ? '—' : money(company.valuation))}${metric('Inversión disponible',money(company.investmentCapacity))}${metric('Desarrollo',money(company.developmentBudget))}${metric('Marketing',money(company.marketingBudget))}${metric('Reputación',amount(company.reputation))}${metric('Prestigio',amount(company.prestige))}${metric('Puntos de investigación',amount(company.researchPoints))}${metric('Plantilla',list(company.employees).length)}</div><div class="rival-sections"><section><h4>Especialización y tecnología</h4><p>Géneros: ${listNames(company.genreSpecialties)}</p><p>Tecnologías: ${listNames(company.technologies)}</p><p>Motores: ${listNames(company.engines)}</p></section><section><h4>Franquicias propias</h4>${ips.length ? `<ul class="rival-list">${ips.map(ip=>`<li><strong>${titleOf(ip)}</strong><span>Popularidad ${amount(ip.popularity)} · Prestigio ${amount(ip.prestige)} · Entregas ${list(ip.publishedGameIds).length}</span></li>`).join('')}</ul>` : '<p class="rival-empty">No tiene franquicias registradas.</p>'}</section><section><h4>Proyectos activos</h4>${projectsSection(company)}</section><section><h4>Videojuegos publicados</h4>${gamesSection(company,game)}</section><section class="rival-history"><h4>Historial empresarial</h4>${historySection(company)}</section></div></section>`;
}

export function initializeRivalUI({game,openModal}) {
    const modal=document.createElement('div');
    modal.id='modal-rival-companies'; modal.className='modal-backdrop';
    modal.innerHTML='<div class="modal-window rival-window"><div class="modal-header"><h2 class="modal-title">Industria / Empresas rivales</h2><button class="modal-close" type="button" aria-label="Cerrar">&times;</button></div><div id="rival-directory-view"></div></div>';
    document.body.appendChild(modal);
    let selectedId=null;
    const render=()=>{
        const view=modal.querySelector('#rival-directory-view');
        const all=companies(game); const selected=all.find(company => company.id===selectedId);
        if(selectedId && !selected) selectedId=null;
        view.innerHTML=selected ? companyDetail(selected,game) : `<div class="rival-toolbar"><p>Estudios que compiten en el mercado y evolucionan durante la partida.</p><button type="button" class="dock-btn" data-rival-action="refresh">Actualizar</button></div>${all.length ? `<div class="rival-grid">${all.map(company=>companyCard(company,game)).join('')}</div>` : '<div class="rival-empty">Todavía no hay empresas rivales en esta partida.</div>'}`;
    };
    document.getElementById('btn-rival-companies')?.addEventListener('click',()=>{selectedId=null;render();openModal(modal.id)});
    modal.addEventListener('click',event=>{
        if(event.target===modal || event.target.closest('.modal-close')){modal.style.display='none';modal.classList.remove('active');return;}
        const button=event.target.closest('[data-rival-action]'); if(!button)return;
        if(button.dataset.rivalAction==='detail') selectedId=button.dataset.id;
        if(button.dataset.rivalAction==='back') selectedId=null;
        render();
    });
}
