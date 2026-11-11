import './annual-awards.css';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
const number = value => Number(value || 0).toLocaleString('es-ES');

/** Presenta los resultados ya calculados, sin alterar el estado de la simulación. */
export function showAnnualAwardsCeremony(ceremony, { onClose = () => {} } = {}) {
    const previous = document.querySelector('.annual-awards-overlay');
    if (previous) return previous;

    const categories = Array.isArray(ceremony?.categories) ? ceremony.categories : [];
    const overlay = document.createElement('div');
    overlay.className = 'annual-awards-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'annual-awards-title');
    let index = 0;
    let revealed = false;
    let revealTimer;
    let closed = false;
    const previousFocus = document.activeElement;

    function close() {
        if (closed) return;
        closed = true;
        clearTimeout(revealTimer);
        document.removeEventListener('keydown', trapFocus);
        overlay.remove();
        previousFocus?.focus?.();
        onClose();
    }

    function trapFocus(event) {
        if (event.key !== 'Tab') return;
        const focusable = [...overlay.querySelectorAll('button:not([disabled])')];
        if (!focusable.length) { event.preventDefault(); return; }
        if (event.shiftKey && document.activeElement === focusable[0]) {
            event.preventDefault(); focusable[focusable.length - 1].focus();
        } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
            event.preventDefault(); focusable[0].focus();
        }
    }

    function rewardText(reward) {
        if (!reward) return '';
        const parts = [];
        if (reward.fans) parts.push(`+${number(reward.fans)} fans`);
        if (reward.reputation) parts.push(`+${number(reward.reputation)} reputación`);
        if (reward.rp) parts.push(`+${number(reward.rp)} RP`);
        if (reward.studioValue) parts.push(`+${number(reward.studioValue)} € de valor del estudio`);
        if (reward.salesMultiplier && reward.salesWeeks) parts.push(`ventas ×${number(reward.salesMultiplier)} durante ${number(reward.salesWeeks)} semanas`);
        return parts.join(' · ');
    }

    function shell(content) {
        overlay.innerHTML = `<section class="annual-awards-panel"><div class="annual-awards-ornament" aria-hidden="true">✦</div><header class="annual-awards-header"><span class="annual-awards-eyebrow">LA INDUSTRIA SE VISTE DE GALA</span><h1 id="annual-awards-title">Premios Anuales <span>${escapeHtml(ceremony?.year)}</span></h1></header>${content}</section>`;
    }

    function renderCategory() {
        const category = categories[index];
        const winner = category.winner;
        const nominees = Array.isArray(category.nominees) ? category.nominees : [];
        const winnerIndex = nominees.findIndex(nominee => nominee === winner || (winner?.id != null && nominee.id === winner.id));
        const playerWon = revealed && winner?.isPlayer;
        const confetti = playerWon ? `<div class="annual-awards-confetti" aria-hidden="true">${Array.from({ length: 32 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>` : '';
        shell(`${confetti}<div class="annual-awards-progress">CATEGORÍA ${index + 1} DE ${categories.length}</div><h2 class="annual-awards-category">${escapeHtml(category.name)}</h2><p class="annual-awards-intro">${revealed ? 'Y el premio es para…' : 'Los nominados son'}</p><div class="annual-awards-nominees">${nominees.map((nominee, i) => `<article class="annual-awards-card ${revealed && i === winnerIndex ? 'is-winner' : ''} ${revealed && i !== winnerIndex ? 'is-muted' : ''}"><span class="annual-awards-card-mark" aria-hidden="true">${revealed && i === winnerIndex ? '✦' : '◇'}</span><strong>${escapeHtml(nominee.name)}</strong><span>${escapeHtml(nominee.studio)}</span>${nominee.isPlayer ? '<small>TU ESTUDIO</small>' : ''}${revealed && i === winnerIndex ? '<em>GANADOR</em>' : ''}</article>`).join('')}</div>${revealed && winnerIndex < 0 && winner ? `<p class="annual-awards-announcement">Ganador: <strong>${escapeHtml(winner.name)}</strong> · ${escapeHtml(winner.studio)}</p>` : ''}${playerWon ? `<p class="annual-awards-congratulations">¡Enhorabuena! Tu estudio se lleva el premio.</p><p class="annual-awards-reward">${escapeHtml(rewardText(category.reward))}</p>` : ''}<div class="annual-awards-actions">${revealed ? `<button type="button" class="annual-awards-button" data-action="next">${index + 1 < categories.length ? 'Siguiente categoría' : 'Ver resumen'}</button>` : '<button type="button" class="annual-awards-button annual-awards-envelope" data-action="reveal"><span aria-hidden="true">✉</span> Abrir el sobre</button>'}</div>`);
        overlay.querySelector('button')?.focus();
    }

    function renderSummary() {
        const wins = categories.filter(category => category.winner?.isPlayer);
        const summary = ceremony.summary || {};
        shell(`<div class="annual-awards-progress">LA GALA HA TERMINADO</div><h2 class="annual-awards-category">Una noche para recordar</h2><p class="annual-awards-intro">${wins.length ? `Tu estudio ha conseguido ${wins.length} ${wins.length === 1 ? 'premio' : 'premios'}.` : 'La industria celebra otro año de grandes videojuegos.'}</p>${wins.length ? `<ul class="annual-awards-wins">${wins.map(category => `<li><span>✦</span><strong>${escapeHtml(category.name)}</strong><small>${escapeHtml(category.winner?.name)}</small></li>`).join('')}</ul><p class="annual-awards-reward">${escapeHtml(rewardText(summary))}</p>` : '<div class="annual-awards-empty" aria-hidden="true">✧</div>'}<div class="annual-awards-actions"><button type="button" class="annual-awards-button" data-action="close">Volver al estudio</button></div>`);
        overlay.querySelector('button')?.focus();
    }

    overlay.addEventListener('click', event => {
        const button = event.target.closest('button[data-action]');
        if (!button || button.disabled) return;
        if (button.dataset.action === 'reveal') {
            button.disabled = true;
            button.classList.add('is-opening');
            button.innerHTML = '<span aria-hidden="true">✉</span> Y el premio es…';
            revealTimer = setTimeout(() => { revealed = true; renderCategory(); }, 850);
        } else if (button.dataset.action === 'next') {
            index++;
            revealed = false;
            if (index < categories.length) renderCategory(); else renderSummary();
        } else if (button.dataset.action === 'close') close();
    });
    document.addEventListener('keydown', trapFocus);
    document.body.appendChild(overlay);
    if (categories.length) renderCategory(); else renderSummary();
    return overlay;
}
