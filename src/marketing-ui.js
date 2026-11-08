const numberFormat = new Intl.NumberFormat('es-ES');
export const marketingNumber = value => numberFormat.format(Math.round(Number(value) || 0));
export const marketingMoney = value => '$' + marketingNumber(value);
export const marketingText = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const channelDesigns = {
    magazine_ad: {
        category: 'Prensa impresa', audience: 'Lectores de prensa especializada',
        art: 'M3 4h13v14H3z M16 7h5v11h-5 M6 7h7v4H6z M6 14h7 M6 16h5',
        condition: 'La reputación de la prensa influye en la expectación final.'
    },
    local_fair: {
        category: 'Encuentro presencial', audience: 'Público del mercado local',
        art: 'M3 10l3-5h12l3 5H3z M5 10v9m14-9v9M5 16h14 M10 7v3m4-3v3'
    },
    cd_demo: {
        category: 'Demo física', audience: 'Lectores que reciben el CD de la revista',
        art: 'M3 4h18v16H3z M12 6a6 6 0 1 1 0 12 6 6 0 1 1 0-12z M12 10a2 2 0 1 1 0 4 2 2 0 1 1 0-4z',
        condition: 'El acabado de la demo afecta a la conversión y a la expectación.', needsDemo: true
    },
    e3_trailer: {
        category: 'Presentación internacional', audience: 'Público de la feria internacional',
        art: 'M4 9h16v11H4z M4 9l-1-4 16-3 1 4-16 3z M8 4l3 3m2-4 3 3 M10 12l5 3-5 3z',
        condition: 'El tráiler puede generar rechazo si el juego final no cumple lo mostrado.', needsDemo: true
    },
    digital_demo: {
        category: 'Festival digital', audience: 'Visitantes del festival de demos',
        art: 'M3 4h18v12H3z M8 20h8m-4-4v4 M10 7l5 3-5 3z',
        condition: 'La demo genera listas de deseos. El acabado influye en la conversión.', needsDemo: true
    }
};

const channelArt = option => {
    const design = channelDesigns[option.id];
    return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><path d="${design?.art || 'M3 17h4l4-10 4 10h6'}"/></svg>`;
};

export function marketingChannelState(option, project, funds) {
    if (!option.available) return { kind: 'locked', label: `Desde ${option.year}` };
    if (!project) return { kind: 'idle', label: 'Requiere proyecto' };
    if (project.marketingActions?.some(action => action.id === option.id)) return { kind: 'done', label: 'Ejecutada' };
    if (channelDesigns[option.id]?.needsDemo && project.overallProgress < 50) return { kind: 'progress', label: 'Requiere 50% de avance' };
    if (funds < option.cost) return { kind: 'funds', label: 'Fondos insuficientes' };
    return { kind: 'ready', label: 'Disponible' };
}

export function renderMarketingChannels(options, selected, project, funds) {
    return options.map(option => {
        const state = marketingChannelState(option, project, funds);
        return `<button class="mkt-channel" type="button" data-mkt-channel="${marketingText(option.id)}" data-state="${state.kind}" aria-pressed="${option.id === selected}" aria-controls="mkt-inspector">
            <span class="mkt-channel-icon">${channelArt(option)}</span>
            <span class="mkt-channel-copy"><strong>${marketingText(option.label)}</strong><small>${channelDesigns[option.id]?.category || 'Promoción'}</small></span>
            <span class="mkt-channel-state">${state.label}</span>
        </button>`;
    }).join('');
}

export function renderMarketingInspector(option, state) {
    if (!option) return '<p class="empire-empty">No hay canales registrados para esta edición.</p>';
    const design = channelDesigns[option.id];
    return `<div class="mkt-inspector-head">
        <span class="mkt-inspector-icon">${channelArt(option)}</span>
        <div><span class="empire-label">Ficha de campaña</span><h3>${marketingText(option.label)}</h3></div>
    </div>
    <p>${marketingText(option.detail)}</p>
    <dl class="mkt-facts">
        <div><dt>Público</dt><dd>${design?.audience || 'Público del juego'}</dd></div>
        <div><dt>Expectación base</dt><dd>+${marketingNumber(option.hype)} pts</dd></div>
        ${option.awareness ? `<div><dt>Reconocimiento base</dt><dd>+${marketingNumber(option.awareness)} pts</dd></div>` : ''}
        <div><dt>Disponibilidad</dt><dd>Desde ${option.year}${design?.needsDemo ? ' · 50% de desarrollo' : ''}</dd></div>
    </dl>
    ${design?.condition ? `<p class="mkt-condition">${design.condition}</p>` : ''}
    <footer class="mkt-inspector-action">
        <div><span class="empire-label">Coste</span><strong class="empire-number">${marketingMoney(option.cost)}</strong></div>
        <div><button class="empire-button empire-button--primary btn-run-marketing" type="button" data-method-id="${marketingText(option.id)}" ${state.kind === 'ready' ? '' : 'disabled'}>${state.kind === 'done' ? 'Ejecutada' : 'Lanzar campaña'}</button>
        <small class="mkt-action-status" data-state="${state.kind}">${state.label}</small></div>
    </footer>`;
}

export function renderMarketingHistory(project, history) {
    const records = [project, ...history].filter(item => item?.marketingActions?.length || item?.marketingCostTotal);
    if (!records.length) return '';
    return `<details class="mkt-history"><summary>Historial de campañas <span>${records.length} ${records.length === 1 ? 'proyecto' : 'proyectos'}</span></summary>
        ${records.map(item => {
            const actions = item.marketingActions || [];
            const spent = item.marketingCostTotal ?? actions.reduce((total, action) => total + (Number(action.cost) || 0), 0);
            return `<section><h4>${marketingText(item.name)} <small>Inversión total ${marketingMoney(spent)}</small></h4>
                ${actions.length ? `<ul class="mkt-history-table">${[...actions].reverse().map(action => {
                    const results = [];
                    if (action.wishlistsGenerated != null) results.push(`${marketingNumber(action.wishlistsGenerated)} listas de deseos`);
                    if (action.trailerQuality != null) results.push(`Calidad del tráiler: ${Number(action.trailerQuality).toFixed(1)}/10`);
                    if (action.demoPolished != null) results.push(action.demoPolished ? 'Demo pulida' : 'Demo con fallos');
                    return `<li><strong>${marketingText(action.label || action.id)}</strong><span>${marketingText(action.year)} · Semana ${marketingText(action.week)}</span><span>${marketingMoney(action.cost)}</span>${results.length ? `<small>${results.join(' · ')}</small>` : ''}</li>`;
                }).join('')}</ul>` : '<p>Gasto promocional registrado sin campañas del catálogo.</p>'}</section>`;
        }).join('')}
    </details>`;
}

export function marketingEdition(year) {
    if (year < 1990) return ['Prensa y ferias', 'print'];
    if (year < 2000) return ['Expansión multimedia', 'disc'];
    if (year < 2010) return ['Escena digital', 'signal'];
    if (year < 2020) return ['Plataformas y creadores', 'signal'];
    return ['Audiencia global', 'signal'];
}

export function marketingBriefArt(edition) {
    const art = {
        print: '<path d="M54 22h75v94H54z M129 34h16v82h-16 M65 33h52v10H65z M65 53h52v28H65z M65 92h52m-52 10h36"/><path d="m66 80 16-18 11 12 8-8 15 14"/>',
        disc: '<circle cx="98" cy="68" r="48"/><circle cx="98" cy="68" r="9"/><circle cx="98" cy="68" r="35" stroke-dasharray="2 5"/><path d="m98 20 0 17m48 31h-17m-31 48v-17m-48-31h17"/>',
        signal: '<path d="M48 31h101v72H48z M48 48h101 M62 79h12l8-15 10 27 14-34 9 22h20"/><path d="M60 39h12m5 0h4m5 0h4"/>'
    };
    return `<svg class="mkt-brief-art" viewBox="0 0 194 136" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 25V5h22m140 0h22v20m0 86v20h-22m-140 0H5v-20" opacity=".45"/>${art[edition]}</svg>`;
}
