import { getPortOptions, startPortProject } from './PortingPipeline.js';
import './port-project.css';

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => `${Number(n || 0).toLocaleString('es-ES')} €`;

/** Abre la planificación para un título del catálogo. */
export function showPortProjectModal(game, gameId, { onStarted = () => {} } = {}) {
    document.querySelector('.port-project-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'port-project-overlay';
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-labelledby', 'port-project-title');
    const options = getPortOptions(game, gameId);
    const warning = options.reason || (!options.platforms.length ? 'No hay plataformas activas con DevKit adquirido a las que puedas portarlo.' : !options.employees.length ? 'No hay empleados disponibles.' : '');
    overlay.innerHTML = `<section class="port-project-panel"><header><div><span class="port-project-kicker">CATÁLOGO · NUEVA VERSIÓN</span><h2 id="port-project-title">Porteo de ${esc(options.title?.name || 'juego')}</h2></div><button class="port-project-close" type="button" aria-label="Cerrar">×</button></header><p>Asigna un desarrollador a la conversión. Las ventas de las versiones anteriores continuarán.</p><form><label>Consola de destino<select name="platform" required><option value="">Selecciona una plataforma</option>${options.platforms.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></label><label>Desarrollador asignado<select name="employee" required><option value="">Selecciona un empleado</option>${options.employees.map(e => `<option value="${esc(e.id)}">${esc(e.name)} · técnica ${Number(e.tech) || 0}</option>`).join('')}</select></label><div class="port-project-cost"><span>Coste estimado · 20 % del presupuesto original</span><strong>${money(options.cost)}</strong><small>Duración estimada: 4–8 semanas según la habilidad del desarrollador.</small></div><p class="port-project-message" aria-live="polite">${esc(warning)}</p><div class="port-project-actions"><button type="button" class="port-project-cancel">Cancelar</button><button type="submit" ${warning ? 'disabled' : ''}>Iniciar porteo</button></div></form></section>`;
    const close = () => { overlay.remove(); document.removeEventListener('keydown', handleKey); };
    const handleKey = event => { if (event.key === 'Escape') close(); };
    overlay.querySelector('.port-project-close').addEventListener('click', close);
    overlay.querySelector('.port-project-cancel').addEventListener('click', close);
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    overlay.querySelector('form').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const result = startPortProject(game, gameId, form.elements.platform.value, form.elements.employee.value);
        if (!result.success) { overlay.querySelector('.port-project-message').textContent = result.message; return; }
        close(); onStarted(result);
    });
    document.addEventListener('keydown', handleKey);
    document.body.append(overlay);
    overlay.querySelector('.port-project-close').focus();
    return overlay;
}
