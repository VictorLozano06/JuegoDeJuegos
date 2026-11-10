const stepTitles = ['Identidad', 'Concepto', 'Plataformas', 'Motor', 'Financiación', 'Confirmación'];
const descriptions = [
    'Define el juego y la franquicia a la que pertenecerá.',
    'Elige la idea, el género y a quién quieres llegar.',
    'Escoge el hardware en el que debutará el juego.',
    'Elige el motor con el que desarrollarás el proyecto.',
    'Decide cómo se financiará y venderá el proyecto.',
    'Autoriza la producción con todos los costes y riesgos a la vista.'
];

export function initializePreproductionWizard({ game, getPipeline, getScope, getHistoricalTechs, getTechnologyNames, onChange }) {
    const modal = document.getElementById('modal-new-game');
    const form = document.getElementById('form-new-game');
    const window = modal.querySelector('.preprod-window');
    const header = window.querySelector('.preprod-header');
    const original = [...form.children];
    const [nameGroup, conceptFields, ipFields, synergy, platformFields, pipelineSection, financeSection, dagSection, submitWrap] = original;
    const progress = document.createElement('nav');
    progress.className = 'preprod-progress';
    progress.setAttribute('aria-label', 'Etapas de preproducción');
    const body = document.createElement('div');
    body.className = 'preprod-body';
    const footer = document.createElement('div');
    footer.className = 'preprod-footer';
    const actions = document.createElement('div');
    actions.className = 'preprod-actions';
    const back = document.createElement('button');
    back.type = 'button'; back.className = 'preprod-back'; back.textContent = 'Atrás';
    const next = document.createElement('button');
    next.type = 'button'; next.className = 'preprod-next'; next.textContent = 'Continuar';
    const submit = submitWrap.querySelector('button[type="submit"]');
    submit.removeAttribute('style');
    submit.classList.add('preprod-next');
    const error = document.createElement('p');
    error.className = 'preprod-error'; error.setAttribute('role', 'alert'); error.hidden = true;
    actions.append(back, next, submit);
    footer.append(error, actions);
    header.insertAdjacentHTML('afterbegin', '<div class="preprod-kicker">DEV EMPIRE / DIRECCIÓN DE PRODUCCIÓN</div>');
    header.after(progress);
    form.replaceChildren(body, footer);

    const steps = stepTitles.map((title, index) => {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = `${String(index + 1).padStart(2, '0')} ${title}`;
        progress.append(button);
        const section = document.createElement('section');
        section.className = 'preprod-step';
        section.hidden = index !== 0;
        section.id = `preprod-step-${index + 1}`;
        section.setAttribute('aria-labelledby', `preprod-heading-${index + 1}`);
        section.innerHTML = `<div class="preprod-step-heading"><div><h3 id="preprod-heading-${index + 1}">${title}</h3><p>${descriptions[index]}</p></div></div>`;
        section.querySelector('h3').tabIndex = -1;
        body.append(section);
        button.addEventListener('click', () => { if (index <= current || completed.has(index)) show(index); });
        return { button, section };
    });

    steps[0].section.append(nameGroup);
    const ipMode = document.createElement('div');
    ipMode.className = 'form-group';
    ipMode.innerHTML = '<label class="form-label" for="preprod-ip-mode">Propiedad intelectual</label><select class="form-select" id="preprod-ip-mode"><option value="independent">Juego independiente</option><option value="existing">Franquicia del estudio</option><option value="new">Registrar nueva IP al iniciar</option></select>';
    steps[0].section.append(ipMode, ipFields);
    const newIP = document.createElement('div');
    newIP.className = 'form-group'; newIP.hidden = true;
    const registrationCost = game.ipState?.settings?.registrationCost || 0;
    newIP.innerHTML = `<label class="form-label" for="preprod-new-ip-name">Nombre de la nueva IP</label><input id="preprod-new-ip-name" class="form-input" type="text" maxlength="100" autocomplete="off"><p class="preprod-help">Se registrará al iniciar el desarrollo. Coste: $${registrationCost.toLocaleString('es-ES')}.</p>`;
    steps[0].section.append(newIP);
    const ipSelect = document.getElementById('select-ip');
    const installment = document.getElementById('select-ip-installment');
    const mode = ipMode.querySelector('select');
    const choiceControls = [];
    function makeChoices(select, className = '') {
        const catalog = document.createElement('div');
        catalog.className = `preprod-options ${className}`;
        catalog.setAttribute('role', 'group');
        const label = select.parentElement?.querySelector('label');
        if (label) {
            catalog.setAttribute('aria-label', label.textContent.trim());
            label.removeAttribute('for');
        }
        select.after(catalog);
        select.classList.add('preprod-native-select');
        select.tabIndex = -1;
        select.setAttribute('aria-hidden', 'true');
        let signature = '';
        const render = () => {
            const options = [...select.options];
            const nextSignature = options.map(option => `${option.value}:${option.textContent}:${option.disabled}`).join('|');
            if (signature !== nextSignature) {
                signature = nextSignature;
                catalog.replaceChildren();
                for (const option of options) {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'preprod-choice';
                    button.textContent = option.textContent.replace(/\[\[DE_ICON_\d+\]\]/g, '').trim();
                    button.dataset.value = option.value;
                    button.disabled = option.disabled;
                    button.addEventListener('click', () => {
                        select.value = option.value;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        render();
                    });
                    catalog.append(button);
                }
            }
            for (const button of catalog.children) {
                button.setAttribute('aria-pressed', String(button.dataset.value === select.value));
            }
        };
        choiceControls.push(render);
        render();
        return catalog;
    }
    makeChoices(mode, 'preprod-options--three');
    makeChoices(ipSelect, 'preprod-options--two');
    makeChoices(installment, 'preprod-options--three');
    function updateIPMode() {
        const existing = mode.value === 'existing';
        ipFields.hidden = !existing;
        newIP.hidden = mode.value !== 'new';
        if (!existing) { ipSelect.value = ''; installment.value = 'original'; installment.disabled = true; }
        else installment.disabled = !ipSelect.value;
        sync();
    }
    mode.addEventListener('change', updateIPMode);
    ipSelect.addEventListener('change', () => { installment.disabled = !ipSelect.value; sync(); });
    steps[1].section.append(conceptFields, synergy);
    conceptFields.querySelectorAll('.form-label')[0].textContent = 'Temática';
    conceptFields.querySelectorAll('.form-label')[1].textContent = 'Género';
    const audienceGroup = platformFields.querySelectorAll('.form-group')[1];
    steps[1].section.insertBefore(audienceGroup, synergy);
    makeChoices(document.getElementById('select-topic'), 'preprod-options--two');
    makeChoices(document.getElementById('select-genre'), 'preprod-options--two');
    makeChoices(document.getElementById('select-audience'), 'preprod-options--three');
    steps[2].section.append(platformFields);
    const platformCatalog = document.createElement('div');
    platformCatalog.className = 'preprod-catalog preprod-platforms';
    const platformSearch = document.createElement('input');
    platformSearch.type = 'text';
    platformSearch.setAttribute('role', 'searchbox');
    platformSearch.className = 'form-input preprod-platform-search';
    platformSearch.placeholder = 'Buscar plataforma por nombre';
    platformSearch.setAttribute('aria-label', 'Buscar plataforma');
    platformFields.after(platformSearch, platformCatalog);
    const platformEmpty = document.createElement('p');
    platformEmpty.className = 'preprod-help';
    platformEmpty.hidden = true;
    platformEmpty.textContent = 'No hay plataformas que coincidan con la búsqueda.';
    platformCatalog.after(platformEmpty);
    const platformSelect = document.getElementById('select-platform');
    platformSelect.classList.add('preprod-native-select');
    platformSelect.tabIndex = -1;
    platformSelect.setAttribute('aria-hidden', 'true');
    let platformSignature = '';
    function renderPlatforms() {
        const platforms = game.getPlatforms();
        const signature = [...platformSelect.options].map(option => {
            const platform = platforms.find(item => item.id === option.value);
            return `${option.value}:${option.disabled}:${platform?.marketShare}:${platform ? game.getDevKitCost(platform) : ''}`;
        }).join('|');
        if (signature !== platformSignature) {
            platformSignature = signature;
            platformCatalog.replaceChildren();
            for (const option of platformSelect.options) {
                const platform = platforms.find(item => item.id === option.value);
                if (!platform) continue;
                const cost = game.getDevKitCost(platform);
                const card = document.createElement('button');
                card.type = 'button'; card.className = 'preprod-choice';
                card.disabled = option.disabled;
                card.dataset.value = platform.id;
                const label = document.createElement('strong'); label.textContent = platform.name;
                const detail = document.createElement('small');
                const royalty = Math.round((platform.royaltyRate ?? platform.royalty ?? 0) * 100);
                detail.textContent = `${platform.releaseYear || '—'} · DevKit $${cost.toLocaleString('es-ES')} · Regalías ${royalty}%${Number.isFinite(Number(platform.marketShare)) ? ` · Mercado ${(Number(platform.marketShare) * 100).toFixed(1)}%` : ''}${option.disabled ? ' · Retirada' : ''}`;
                card.append(label, detail);
                card.addEventListener('click', () => {
                    platformSelect.value = platform.id;
                    platformSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    renderPlatforms(); sync();
                });
                platformCatalog.append(card);
            }
        }
        const query = platformSearch.value.trim().toLocaleLowerCase('es');
        let visibleCount = 0;
        for (const card of platformCatalog.children) {
            card.hidden = !!query && !card.querySelector('strong').textContent.toLocaleLowerCase('es').includes(query);
            if (!card.hidden) visibleCount++;
            card.setAttribute('aria-pressed', String(card.dataset.value === platformSelect.value));
        }
        platformEmpty.hidden = visibleCount !== 0;
    }
    platformSearch.addEventListener('input', renderPlatforms);
    steps[3].section.append(pipelineSection);
    if (dagSection) dagSection.style.display = 'none';
    pipelineSection.querySelector('h3').textContent = 'Motor de desarrollo';
    steps[4].section.append(financeSection);
    financeSection.querySelector('h3').textContent = 'Acuerdo de publicación';
    makeChoices(document.getElementById('select-post-launch-content'), 'preprod-options--two');
    makeChoices(document.getElementById('select-monetization-style'), 'preprod-options--two');
    const summary = document.createElement('div');
    summary.className = 'preprod-summary';
    steps[5].section.append(summary);

    let current = 0;
    const completed = new Set();
    const invalid = new Set();
    let submitting = false;
    function selectedOption(id) {
        const select = document.getElementById(id);
        return [...select.options].find(option => option.value === select.value && !option.disabled);
    }
    function validate(index) {
        if (index === 0) {
            if (!document.getElementById('input-game-name').value.trim()) return 'Escribe el nombre del videojuego.';
            if (mode.value === 'existing' && !ipSelect.value) return 'Selecciona una franquicia del estudio.';
            if (mode.value === 'new') {
                const name = document.getElementById('preprod-new-ip-name').value.trim();
                if (!name) return 'Escribe el nombre de la nueva IP.';
                if (game.ipState.properties.some(ip => ip.name.toLocaleLowerCase('es') === name.toLocaleLowerCase('es'))) return 'Ya existe una IP con ese nombre.';
            }
        }
        if (index === 1) {
            if (!selectedOption('select-topic')) return 'Selecciona una temática investigada.';
            if (!selectedOption('select-genre')) return 'Selecciona un género investigado.';
            if (!selectedOption('select-audience')) return 'Selecciona el público objetivo.';
        }
        if (index === 2 && !selectedOption('select-platform')) return 'Selecciona una plataforma disponible.';
        if (index === 3) {
            if (!getPipeline()) return 'Necesitas un motor disponible. Desarróllalo en I+D si aún no tienes uno.';
            const genreCheck = game.validateGenreTechRequirements(document.getElementById('select-genre').value, {
                selectedNodeIds: [...getScope().selectedNodeIds], dagConfig: { pipeline: getPipeline() }
            });
            if (!genreCheck.valid) return genreCheck.message.replace(/\[\[DE_ICON_\d+\]\]/g, '').trim();
            const techIds = [...getHistoricalTechs(), ...(getPipeline().historicalTechIds || [])];
            const result = game.techTreeManager.validateSelection([...new Set(techIds)], game.getHistoricalYear());
            if (!result.valid) return result.errors.join(' ');
        }
        if (index === 4) {
            const businessModel = document.querySelector('input[name="business-model"]:checked')?.value;
            if (!businessModel || !game.getBusinessModelOptions([...getScope().selectedNodeIds]).some(item => item.id === businessModel && item.available)) return 'El modelo comercial elegido no está disponible.';
            if (!document.querySelector('input[name="publishing-contract"]:checked')) return 'Elige un acuerdo de publicación.';
        }
        return '';
    }
    function estimate() {
        const platform = game.getPlatforms().find(item => item.id === platformSelect.value);
        const engine = getPipeline();
        const base = game.era === 1 ? 4000 : game.era === 2 ? 14000 : 35000;
        const ipCost = mode.value === 'new' ? Number(game.ipState?.settings?.registrationCost || 0) : 0;
        const cost = (platform ? game.getDevKitCost(platform) : 0) + (engine?.licenseCost || 0) + base + ipCost;
        const contract = document.querySelector('input[name="publishing-contract"]:checked')?.value || 'self_publishing';
        const advance = contract === 'publisher_advance' ? Math.max(15000, Math.round((cost - ipCost) * .65)) : contract === 'platform_exclusive' ? Math.max(10000, Math.round((cost - ipCost) * .4)) : 0;
        return { cost, ipCost, advance, funds: game.funds, remaining: game.funds - cost + advance };
    }
    function addSummary(label, value, edit) {
        const row = document.createElement('div'); row.className = 'preprod-summary-row';
        const name = document.createElement('span'); name.textContent = label;
        const content = document.createElement('strong'); content.textContent = value;
        const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Editar';
        button.addEventListener('click', () => show(edit));
        row.append(name, content, button); summary.append(row);
    }
    function renderSummary() {
        summary.replaceChildren();
        const text = id => document.getElementById(id)?.selectedOptions[0]?.textContent || '—';
        const money = amount => `$${Math.round(amount).toLocaleString('es-ES')}`;
        const pipe = getPipeline();
        const budget = estimate();
        addSummary('Proyecto', document.getElementById('input-game-name').value.trim(), 0);
        addSummary('Propiedad intelectual', mode.value === 'new' ? `Nueva IP: ${document.getElementById('preprod-new-ip-name').value.trim()}` : mode.value === 'existing' ? `${text('select-ip')} · ${text('select-ip-installment')}` : 'Juego independiente', 0);
        addSummary('Concepto', `${text('select-topic')} · ${text('select-genre')} · ${text('select-audience')}`, 1);
        addSummary('Lanzamiento', text('select-platform'), 2);
        addSummary('Motor de desarrollo', pipe?.name || 'Sin motor', 3);
        addSummary('Tecnologías', getTechnologyNames?.(getHistoricalTechs())?.join(', ') || 'Sin módulos históricos adicionales', 3);
        addSummary('Publicación', `${document.querySelector('input[name="publishing-contract"]:checked')?.closest('label')?.querySelector('strong')?.textContent || 'Autopublicación'} · ${document.querySelector('input[name="business-model"]:checked')?.closest('label')?.querySelector('.business-model-title')?.textContent || 'Premium'}`, 4);
        addSummary('Postlanzamiento', `${text('select-post-launch-content')} · Parches ${document.getElementById('toggle-postlaunch-patches').checked ? 'sí' : 'no'} · Monetización ${text('select-monetization-style')}`, 4);
        addSummary('Coste inicial', money(budget.cost), 4);
        addSummary('Fondos disponibles', money(budget.funds), 4);
        addSummary('Anticipo / saldo previsto', `${money(budget.advance)} / ${money(budget.remaining)}`, 4);
        addSummary('Deuda técnica base', `${pipe?.baseDebtFloor || 0} pts`, 3);
        addSummary('Requisitos pendientes', [0, 1, 2, 3, 4].map(validate).filter(Boolean).join(' · ') || 'Ninguno', 3);
        const warning = document.createElement('p'); warning.className = 'preprod-help';
        warning.textContent = budget.funds < budget.cost ? 'Fondos insuficientes para autorizar la producción. El anticipo se abona después del pago inicial.' : 'Todos los costes se aplicarán al iniciar el desarrollo.';
        summary.append(warning);
    }
    function show(index) {
        current = index;
        for (let i = 0; i < steps.length; i++) {
            const { button, section } = steps[i];
            section.hidden = i !== index;
            button.classList.toggle('is-current', i === index);
            button.classList.toggle('is-complete', completed.has(i));
            button.classList.toggle('is-error', invalid.has(i));
            button.setAttribute('aria-current', i === index ? 'step' : 'false');
            button.disabled = i > current && !completed.has(i);
        }
        back.hidden = index === 0;
        next.hidden = index === 5;
        submit.hidden = index !== 5;
        error.hidden = true;
        if (index === 2) renderPlatforms();
        if (index === 5) renderSummary();
        steps[index].section.scrollTop = 0;
        if (progress.scrollWidth > progress.clientWidth) {
            const activeButton = steps[index].button;
            progress.scrollLeft = activeButton.offsetLeft - progress.offsetLeft - (progress.clientWidth - activeButton.offsetWidth) / 2;
        }
        steps[index].section.querySelector('h3').focus({ preventScroll: true });
    }
    function sync() {
        choiceControls.forEach(render => render());
        if (current === 5) renderSummary();
        for (let i = 0; i < 5; i++) {
            if (completed.has(i) && validate(i)) { completed.delete(i); invalid.add(i); }
            else if (!validate(i)) invalid.delete(i);
            steps[i].button.classList.toggle('is-error', invalid.has(i));
            steps[i].button.classList.toggle('is-complete', completed.has(i));
        }
        onChange?.();
    }
    function setError(message, index = current) {
        if (index !== current) show(index);
        invalid.add(index); error.textContent = message; error.hidden = false;
        steps[index].button.classList.add('is-error');
    }
    next.addEventListener('click', () => {
        const message = validate(current);
        if (message) return setError(message);
        completed.add(current); invalid.delete(current); show(current + 1);
    });
    back.addEventListener('click', () => show(Math.max(0, current - 1)));
    form.addEventListener('input', sync);
    form.addEventListener('change', sync);
    form.addEventListener('keydown', event => {
        if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            if (current < 5) next.click();
        }
    });
    function open() {
        if (mode.value === 'existing' && !ipSelect.value) mode.value = 'independent';
        updateIPMode();
        choiceControls.forEach(render => render());
        renderPlatforms();
        show(current);
    }
    function validateAll() {
        for (let index = 0; index < 5; index++) {
            const message = validate(index);
            if (message) { setError(message, index); return { valid: false, message }; }
        }
        const budget = estimate();
        if (budget.funds < budget.cost) {
            const message = 'Fondos insuficientes para pagar el coste inicial.';
            setError(message, 5); return { valid: false, message };
        }
        return { valid: true, newIPName: mode.value === 'new' ? document.getElementById('preprod-new-ip-name').value.trim() : null };
    }
    function reset() {
        current = 0; completed.clear(); invalid.clear(); submitting = false;
        form.reset(); mode.value = 'independent'; updateIPMode(); show(0);
    }
    show(0);
    return { open, validateAll, reset, setError, isFinal: () => current === 5, markSubmitting: () => { if (submitting) return false; submitting = true; submit.disabled = true; return true; }, doneSubmitting: () => { submitting = false; submit.disabled = false; }, get mode() { return mode.value; } };
}
