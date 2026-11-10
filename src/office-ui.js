const dollars = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
});

const statuses = {
    active: 'Activa',
    owned: 'Comprada',
    available: 'Disponible',
    locked: 'Bloqueada'
};

function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function buildOfficeCard(office, occupied, onAction) {
    const card = element('article', 'office-card');
    card.dataset.officeId = office.id;
    card.dataset.status = office.status;

    const header = element('header', 'office-card-header');
    header.append(
        element('span', 'office-eyebrow', `Nivel ${office.tier}`),
        element('span', 'office-status', statuses[office.status])
    );
    const heading = element('h3', 'office-name', office.name);
    heading.tabIndex = -1;
    const description = element('p', 'office-description', office.description);

    const details = element('dl', 'office-details');
    details.append(
        element('dt', null, 'Precio'),
        element('dd', null, office.cost ? dollars.format(office.cost) : 'Incluida'),
        element('dt', null, 'Capacidad'),
        element('dd', null, `${office.maxEmployees} puestos`)
    );
    const staffSlots = office.maxEmployees - 1;
    const staffLabel = staffSlots === 1 ? 'empleado' : 'empleados';
    const capacity = element('p', 'office-capacity', `1 fundador + ${staffSlots} ${staffLabel}`);
    if (office.isActive && Number.isFinite(occupied)) {
        capacity.append(` · ${occupied}/${office.maxEmployees} ocupados`);
    }

    const action = element('button', 'dock-btn office-action');
    action.type = 'button';
    if (office.isActive) {
        action.textContent = 'Sede activa';
        action.disabled = true;
    } else if (office.isUnlocked) {
        action.textContent = 'Activar oficina';
        action.disabled = !office.canActivate;
        action.addEventListener('click', () => onAction(office.id, 'activate'));
    } else {
        action.textContent = office.cost ? 'Comprar y activar' : 'Activar sede gratis';
        action.disabled = !office.canPurchase;
        action.addEventListener('click', () => onAction(office.id, 'purchase'));
    }

    const footer = element('footer', 'office-card-footer');
    if (action.disabled && !office.isActive && office.message) {
        const reason = element('p', 'office-reason', office.message);
        reason.id = `office-reason-${office.id}`;
        action.setAttribute('aria-describedby', reason.id);
        footer.append(reason);
    }
    footer.append(action);
    card.append(header, heading, description, details, capacity, footer);
    return card;
}

export function renderOfficeManager({ offices, funds, occupied, feedback, onAction }) {
    const catalog = document.getElementById('office-catalog');
    const focusedOffice = catalog.contains(document.activeElement)
        ? document.activeElement.closest('[data-office-id]')?.dataset.officeId
        : undefined;
    const cards = offices.map(office => buildOfficeCard(office, occupied, onAction));
    catalog.replaceChildren(...cards);

    document.getElementById('office-balance').textContent = dollars.format(funds);
    if (feedback !== undefined) {
        const status = document.getElementById('office-feedback');
        status.textContent = feedback?.message ?? '';
        status.dataset.result = feedback ? (feedback.success ? 'success' : 'error') : '';
    }
    if (focusedOffice) {
        const card = cards.find(item => item.dataset.officeId === focusedOffice);
        (card?.querySelector('button:not(:disabled)') ?? card?.querySelector('h3'))?.focus();
    }
}
