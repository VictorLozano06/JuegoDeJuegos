const messages = {
    es: {
        brandLine: 'Simulador de estudios',
        tagline: 'Todo empieza en un garaje.',
        navigation: 'Menú principal',
        continue: 'Continuar',
        noContinue: 'No hay una partida guardada',
        newGame: 'Nueva partida',
        loadGame: 'Cargar partida',
        options: 'Opciones',
        credits: 'Créditos',
        version: 'Versión',
        close: 'Cerrar',
        session: 'Partida y opciones',
        year: 'Año',
        month: 'Mes',
        week: 'Semana',
        lastGame: 'Último lanzamiento',
        noGame: 'Sin lanzamientos',
        noSlots: 'Tus partidas guardadas aparecerán aquí.',
        load: 'Cargar',
        remove: 'Borrar',
        confirmRemove: 'Confirmar borrado',
        cancel: 'Cancelar',
        soundVolume: 'Volumen de efectos',
        musicVolume: 'Volumen de música',
        resolution: 'Resolución 3D',
        shadows: 'Calidad de sombras',
        language: 'Idioma del menú',
        languageHelp: 'Las pantallas de gestión están disponibles en español.',
        autosave: 'Guardado automático',
        weekly: 'Semanal',
        monthly: 'Mensual',
        off: 'Desactivado',
        low: 'Baja',
        medium: 'Media',
        high: 'Alta',
        saveName: 'Nombre de la partida',
        save: 'Guardar partida',
        saved: 'Partida guardada.',
        returnToMenu: 'Volver al menú principal',
        unsavedWarning: 'El autoguardado está desactivado. Puedes perder los cambios desde el último guardado manual.',
        confirmReturn: 'Volver de todos modos',
        creditsDescription: 'Un simulador de estudios de videojuegos del equipo de JuegoDeJuegos.',
        creditsTechnology: 'Escena y animación con Three.js. Música y efectos sintetizados con Web Audio.',
        error: 'No se pudo completar la acción.'
    },
    en: {
        brandLine: 'Game studio simulator',
        tagline: 'It all starts in a garage.',
        navigation: 'Main menu',
        continue: 'Continue',
        noContinue: 'No saved game',
        newGame: 'New game',
        loadGame: 'Load game',
        options: 'Options',
        credits: 'Credits',
        version: 'Version',
        close: 'Close',
        session: 'Game and options',
        year: 'Year',
        month: 'Month',
        week: 'Week',
        lastGame: 'Latest release',
        noGame: 'No releases yet',
        noSlots: 'Your saved games will appear here.',
        load: 'Load',
        remove: 'Delete',
        confirmRemove: 'Confirm deletion',
        cancel: 'Cancel',
        soundVolume: 'Sound effects volume',
        musicVolume: 'Music volume',
        resolution: '3D resolution',
        shadows: 'Shadow quality',
        language: 'Menu language',
        languageHelp: 'The management screens are available in Spanish.',
        autosave: 'Autosave',
        weekly: 'Weekly',
        monthly: 'Monthly',
        off: 'Off',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        saveName: 'Save name',
        save: 'Save game',
        saved: 'Game saved.',
        returnToMenu: 'Return to main menu',
        unsavedWarning: 'Autosave is off. Changes since your last manual save may be lost.',
        confirmReturn: 'Return anyway',
        creditsDescription: 'A game studio simulator by the JuegoDeJuegos team.',
        creditsTechnology: 'Scene and animation with Three.js. Music and effects synthesized with Web Audio.',
        error: 'The action could not be completed.'
    }
};

const defaultSettings = {
    soundVolume: 0.6,
    musicVolume: 0.3,
    resolution: 'high',
    shadows: 'medium',
    language: 'es',
    autosave: 'weekly'
};

function element(tag, label = '', className = '') {
    const node = document.createElement(tag);
    node.textContent = label;
    node.className = className;
    return node;
}

export function createMainMenu({
    version,
    getSlots,
    onContinue,
    onNewGame,
    onLoad,
    onDelete,
    onSettingsChange,
    onSave,
    onReturnToMenu,
    initialSettings
}) {
    const root = document.getElementById('main-menu');
    const hud = document.getElementById('ui-overlay');
    const dialog = document.getElementById('main-menu-dialog');
    const dialogTitle = document.getElementById('main-menu-dialog-title');
    const dialogContent = document.getElementById('main-menu-dialog-content');
    const dialogMessage = document.getElementById('main-menu-dialog-message');
    const menuMessage = document.getElementById('main-menu-message');
    const continueButton = root.querySelector('[data-menu-action="continue"]');
    const continueDetail = document.getElementById('main-menu-continue-detail');
    const navigation = root.querySelector('nav');
    const actionButtons = root.querySelectorAll('[data-menu-action]');
    const settings = { ...defaultSettings, ...initialSettings };
    let latestSlot = null;
    let activeScreen = null;
    let busy = false;
    let hasShown = false;
    let panelFocus = null;

    document.getElementById('main-menu-version').textContent = version;
    const onlineLink = document.getElementById('main-menu-online');
    if (import.meta.env.DEV && window.parent === window) {
        fetch('/__dev_empire_online').then(response => response.ok ? response.json() : null).then(result => {
            if (!result?.available) return;
            onlineLink.href = result.url;
            onlineLink.hidden = false;
            const joinLink = document.getElementById('main-menu-join-online');
            joinLink.href = new URL('/', result.url).href;
            joinLink.hidden = false;
        }).catch(() => {});
    }

    function t(key) {
        return (messages[settings.language] || messages.es)[key];
    }

    function sortedSlots() {
        return [...getSlots()].sort((left, right) => right.timestamp - left.timestamp);
    }

    function gameDate({ year, month, week }, full = false) {
        const yearLabel = `${t('year')} ${year}`;
        return full ? `${yearLabel} · ${t('month')} ${month} · ${t('week')} ${week}` : yearLabel;
    }

    function refresh() {
        latestSlot = sortedSlots()[0] || null;
        for (const node of document.querySelectorAll('[data-menu-text]')) {
            node.textContent = t(node.dataset.menuText);
        }
        for (const node of document.querySelectorAll('[data-menu-label]')) {
            const label = t(node.dataset.menuLabel);
            node.setAttribute('aria-label', label);
            if (node.hasAttribute('title')) node.title = label;
        }
        navigation.setAttribute('aria-label', t('navigation'));
        root.lang = settings.language;
        dialog.lang = settings.language;
        continueDetail.textContent = latestSlot
            ? `${latestSlot.studioName} · ${gameDate(latestSlot.inGameDate)}`
            : t('noContinue');
        for (const button of actionButtons) {
            button.disabled = busy || (button === continueButton && !latestSlot);
        }
    }

    function report(message = '') {
        const output = dialog.open ? dialogMessage : menuMessage;
        output.textContent = message;
    }

    async function invoke(action, ...args) {
        report();
        try {
            return await action?.(...args);
        } catch (error) {
            console.error(error);
            report(t('error'));
            return false;
        }
    }

    function button(label, onClick, className = '') {
        const control = element('button', label, className);
        control.type = 'button';
        control.addEventListener('click', onClick);
        return control;
    }

    function renderSlots() {
        const slots = sortedSlots();
        if (!slots.length) {
            dialogContent.append(element('p', t('noSlots'), 'menu-help'));
            return;
        }

        const dateFormatter = new Intl.DateTimeFormat(settings.language, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
        const moneyFormatter = new Intl.NumberFormat(settings.language, {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        });
        for (const slot of slots) {
            const card = element('article', '', 'menu-slot');
            const actions = element('div', '', 'menu-slot-actions');
            const savedOn = dateFormatter.format(slot.timestamp);
            const lastGame = slot.lastGame || slot.gamesHistory?.[0]?.name || t('noGame');
            const load = button(t('load'), async () => {
                load.disabled = true;
                const result = await invoke(onLoad, slot.id);
                if (result !== false && dialog.open) dialog.close();
                load.disabled = false;
            });
            const remove = button(t('remove'), () => {
                const confirm = button(t('confirmRemove'), async () => {
                    confirm.disabled = true;
                    const result = await invoke(onDelete, slot.id);
                    confirm.disabled = false;
                    if (result === false) return;
                    refresh();
                    renderScreen();
                    dialog.querySelector('.menu-close').focus();
                }, 'menu-delete');
                const cancel = button(t('cancel'), () => {
                    actions.replaceChildren(load, remove);
                    remove.focus();
                });
                actions.replaceChildren(confirm, cancel);
                cancel.focus();
            }, 'menu-delete');
            actions.append(load, remove);
            card.append(
                element('h3', slot.saveName),
                element('p', `${slot.studioName} · ${gameDate(slot.inGameDate, true)}`),
                element('p', `${savedOn} · ${moneyFormatter.format(slot.balance)}`),
                element('p', `${t('lastGame')} · ${lastGame}`),
                actions
            );
            dialogContent.append(card);
        }
    }

    function addSetting(key, options) {
        const row = element('label', '', 'menu-setting');
        const input = options ? element('select') : element('input');
        input.name = key;
        if (options) {
            for (const [value, text] of options) {
                const option = element('option', text);
                option.value = value;
                input.append(option);
            }
        } else {
            input.type = 'range';
            input.min = '0';
            input.max = '1';
            input.step = '0.05';
        }
        input.value = settings[key];
        input.addEventListener('change', () => {
            settings[key] = options ? input.value : Number(input.value);
            if (key === 'language') {
                refresh();
                renderScreen();
                dialogContent.querySelector('[name="language"]').focus();
            }
            invoke(onSettingsChange, { ...settings });
        });
        row.append(element('span', t(key)), input);
        dialogContent.append(row);
    }

    function renderSessionActions() {
        const form = element('form', '', 'menu-session-actions');
        const name = element('input');
        name.type = 'text';
        name.maxLength = 60;
        name.placeholder = t('saveName');
        name.setAttribute('aria-label', t('saveName'));
        const submit = element('button', t('save'));
        submit.type = 'submit';
        form.addEventListener('submit', async event => {
            event.preventDefault();
            submit.disabled = true;
            const result = await invoke(onSave, name.value.trim());
            submit.disabled = false;
            if (result !== false) {
                name.value = '';
                report(t('saved'));
            }
        });
        async function returnToMenu(control) {
            control.disabled = true;
            const result = await invoke(onReturnToMenu);
            control.disabled = false;
            if (result !== false && dialog.open) dialog.close();
        }

        const returnButton = button(t('returnToMenu'), () => {
            if (settings.autosave !== 'off') {
                void returnToMenu(returnButton);
                return;
            }
            const warning = element('div', '', 'menu-return-warning');
            warning.append(
                element('p', t('unsavedWarning'), 'menu-help'),
                button(t('confirmReturn'), event => returnToMenu(event.currentTarget), 'menu-delete'),
                button(t('cancel'), () => {
                    warning.replaceWith(returnButton);
                    returnButton.focus();
                })
            );
            returnButton.replaceWith(warning);
            warning.lastElementChild.focus();
        });
        form.append(name, submit, returnButton);
        dialogContent.append(form);
    }

    function renderScreen() {
        dialogContent.replaceChildren();
        dialogTitle.textContent = t(activeScreen);
        if (activeScreen === 'loadGame') {
            renderSlots();
        } else if (activeScreen === 'credits') {
            dialogContent.append(
                element('p', t('creditsDescription')),
                element('p', t('creditsTechnology'), 'menu-help')
            );
        } else {
            const qualities = ['low', 'medium', 'high'].map(key => [key, t(key)]);
            addSetting('soundVolume');
            addSetting('musicVolume');
            addSetting('resolution', qualities);
            addSetting('shadows', [['off', t('off')], ...qualities]);
            addSetting('language', [['es', 'Español'], ['en', 'English']]);
            addSetting('autosave', ['off', 'weekly', 'monthly'].map(key => [key, t(key)]));
            dialogContent.append(element('p', t('languageHelp'), 'menu-help'));
            if (activeScreen === 'session') renderSessionActions();
        }
    }

    function openScreen(screen) {
        activeScreen = screen;
        dialogMessage.textContent = '';
        renderScreen();
        if (!dialog.open) dialog.showModal();
    }

    function openOptions() {
        openScreen(document.body.classList.contains('menu-active') ? 'options' : 'session');
    }

    root.addEventListener('click', event => {
        switch (event.target.closest('[data-menu-action]')?.dataset.menuAction) {
            case 'continue': if (latestSlot) invoke(onContinue, latestSlot.id); break;
            case 'new': invoke(onNewGame); break;
            case 'load': openScreen('loadGame'); break;
            case 'options': openOptions(); break;
            case 'credits': openScreen('credits'); break;
        }
    });
    document.getElementById('btn-session-options').addEventListener('click', openOptions);
    hud.addEventListener('animationend', event => {
        if (event.target === hud && event.animationName === 'menu-hud-reveal') {
            hud.classList.remove('menu-hud-enter');
        }
    });

    return {
        show() {
            if (dialog.open) dialog.close();
            document.body.classList.add('menu-active');
            hud.classList.remove('menu-hud-enter');
            hud.inert = true;
            root.hidden = false;
            refresh();
            if (hasShown) {
                const fallback = latestSlot ? continueButton : root.querySelector('[data-menu-action="new"]');
                (panelFocus && !panelFocus.disabled ? panelFocus : fallback).focus();
            }
            hasShown = true;
            panelFocus = null;
        },
        hide() {
            if (dialog.open) dialog.close();
            root.hidden = true;
            menuMessage.textContent = '';
            panelFocus = null;
            document.body.classList.remove('menu-active');
            hud.inert = false;
            hud.classList.add('menu-hud-enter');
        },
        hidePanel() {
            const active = document.activeElement;
            if (root.contains(active) && active.matches('[data-menu-action]')) panelFocus = active;
            if (dialog.open) dialog.close();
            root.hidden = true;
        },
        refresh,
        setBusy(value) {
            busy = value;
            refresh();
        },
        report,
        getSettings: () => ({ ...settings }),
        openOptions
    };
}
