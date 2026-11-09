/**
 * DEV EMPIRE 3D - Modal de Creación de Motor (EngineCreationModal)
 * Modal vertical interactivo con scroll, filtro de categorías, contador dinámico
 * y sustitución progresiva automática al estilo exacto de Game Dev Tycoon.
 */

import {
    ENGINE_PARTS_DATABASE,
    ENGINE_CATEGORIES,
    calculateEngineCost,
    resolveBranchReplacement,
    getPartById
} from './EngineDatabase.js';

// SVGs originales del catálogo (0 emojis del sistema según agentes/iconografia.md)
const CATEGORY_SVGS = {
    screen: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    book: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
    gamepad: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>',
    map: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>',
    brain: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>'
};

const CHECK_ICON_SVG = '<svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6"/></svg>';
const INACTIVE_ICON_SVG = '<svg viewBox="0 0 16 16" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>';
const CLOSE_ICON_SVG = '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>';
const LOCK_ICON_SVG = '<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden="true"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>';

export class EngineCreationModal {
    /**
     * Entry point unificado para instanciar y abrir el modal.
     * Garantiza que no queden dos modales superpuestos en el DOM.
     */
    static open(options = {}) {
        // Purgar cualquier modal previo u huérfano en el DOM
        const existing = document.getElementById('engine-creation-modal-backdrop');
        if (existing) {
            existing.remove();
        }

        const activeGame = options.game || (typeof window !== 'undefined' ? window.game : null);
        const modal = new EngineCreationModal({
            game: activeGame,
            onCreated: options.onCreated || ((newEngine) => {
                if (typeof window !== 'undefined') {
                    if (typeof window.showToast === 'function') {
                        window.showToast(`[[DE_ICON_024]] ¡Motor "${newEngine.name}" creado con éxito!`, 'success');
                    }
                    if (typeof window.renderHUD === 'function' && window.game) {
                        window.renderHUD(window.game);
                    }
                    if (typeof window.renderTechTree === 'function') {
                        window.renderTechTree();
                    }
                }
            }),
            onClose: options.onClose,
            container: options.container
        });

        modal.render();
        return modal;
    }

    constructor({ game, onCreated, onClose, container = null }) {
        this.game = game;
        this.onCreated = onCreated || (() => {});
        this.onClose = onClose || (() => {});
        this.container = container || (typeof document !== 'undefined' ? document.body : null);
        this.element = null;
        this._keyListener = null;

        const defaultParts = ['graphics_2d_v1', 'engine_save_game'].filter(id => !this.game?.techTreeManager || this.game.techTreeManager.isUnlocked(id));
        this.selectedPartIds = new Set(defaultParts);
        this.activeCategory = 'all';
        this.engineName = '';
        this.cardElements = new Map();
        this.costValueEl = null;
        this.fundsValueEl = null;
        this.submitBtn = null;
    }

    render() {
        if (!this.container || typeof document === 'undefined') return null;

        // Limpiar modal previo si existiera
        const existing = document.getElementById('engine-creation-modal-backdrop');
        if (existing) existing.remove();

        // Autogenerar nombre por defecto sugerido
        const engineCount = (this.game?.customEngines?.length || this.game?.inHouseEngines?.length || 0) + 1;
        this.engineName = `Motor v${engineCount}.0`;

        const backdrop = document.createElement('div');
        backdrop.id = 'engine-creation-modal-backdrop';
        backdrop.className = 'engine-modal-backdrop';
        backdrop.setAttribute('role', 'dialog');
        backdrop.setAttribute('aria-modal', 'true');

        const windowEl = document.createElement('div');
        windowEl.className = 'engine-modal-window';

        // 1. CABECERA
        const header = document.createElement('header');
        header.className = 'engine-modal-header';

        const headerTop = document.createElement('div');
        headerTop.className = 'engine-header-top';

        const title = document.createElement('h2');
        title.className = 'engine-modal-title';
        title.innerHTML = `
            <span class="engine-title-icon">${CATEGORY_SVGS.gear}</span>
            <span>Crear Motor de Videojuegos</span>
        `;

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'engine-modal-close-btn';
        closeBtn.title = 'Cerrar ventana';
        closeBtn.innerHTML = CLOSE_ICON_SVG;
        closeBtn.addEventListener('click', () => this.close());

        headerTop.append(title, closeBtn);

        // Fila de Input de Nombre y Coste Total
        const nameCostRow = document.createElement('div');
        nameCostRow.className = 'engine-name-cost-row';

        const nameGroup = document.createElement('div');
        nameGroup.className = 'engine-name-group';

        const nameLabel = document.createElement('label');
        nameLabel.htmlFor = 'engine-name-input-field';
        nameLabel.className = 'engine-name-label';
        nameLabel.textContent = 'Nombre del Motor';

        const nameInput = document.createElement('input');
        nameInput.id = 'engine-name-input-field';
        nameInput.type = 'text';
        nameInput.className = 'engine-name-input';
        nameInput.value = this.engineName;
        nameInput.maxLength = 40;
        nameInput.placeholder = 'Ej: Apex Engine v1';
        nameInput.autofocus = true;

        nameInput.addEventListener('input', (e) => {
            this.engineName = e.target.value.trim();
            this.updateSubmitState();
        });

        nameGroup.append(nameLabel, nameInput);

        const costBadge = document.createElement('div');
        costBadge.className = 'engine-cost-badge';

        const costLabel = document.createElement('span');
        costLabel.className = 'engine-cost-label';
        costLabel.textContent = 'Costo Total';

        const costVal = document.createElement('span');
        costVal.className = 'engine-cost-value';
        costVal.textContent = 'Costo: 0K Cr.';
        this.costValueEl = costVal;

        costBadge.append(costLabel, costVal);
        nameCostRow.append(nameGroup, costBadge);

        // Fila de Chips de Categorías
        const chipsRow = document.createElement('nav');
        chipsRow.className = 'engine-category-chips';

        const allChip = document.createElement('button');
        allChip.type = 'button';
        allChip.className = 'engine-chip is-active';
        allChip.textContent = 'Todas';
        allChip.dataset.cat = 'all';
        chipsRow.append(allChip);

        Object.values(ENGINE_CATEGORIES).forEach(cat => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'engine-chip';
            chip.textContent = cat.label;
            chip.dataset.cat = cat.id;
            chipsRow.append(chip);
        });

        chipsRow.addEventListener('click', (e) => {
            const targetChip = e.target.closest('.engine-chip');
            if (!targetChip) return;
            chipsRow.querySelectorAll('.engine-chip').forEach(c => c.classList.remove('is-active'));
            targetChip.classList.add('is-active');
            this.activeCategory = targetChip.dataset.cat;
            this.filterCardsByCategory(this.activeCategory);
        });

        header.append(headerTop, nameCostRow, chipsRow);
        windowEl.append(header);

        // 2. LISTA SCROLLEABLE DE CARACTERÍSTICAS
        const scrollWrap = document.createElement('div');
        scrollWrap.className = 'engine-parts-scroll-wrap';

        Object.values(ENGINE_CATEGORIES).forEach(cat => {
            const catParts = ENGINE_PARTS_DATABASE.filter(p => p.category === cat.id);
            if (!catParts.length) return;

            const groupSec = document.createElement('section');
            groupSec.className = 'engine-group-section';
            groupSec.dataset.category = cat.id;

            const groupHeading = document.createElement('div');
            groupHeading.className = 'engine-group-heading';

            const catSvg = CATEGORY_SVGS[cat.icon] || CATEGORY_SVGS.gear;
            groupHeading.innerHTML = `
                <span class="engine-group-heading-icon" style="background-color: ${cat.color}">${catSvg}</span>
                <span>${cat.label}</span>
            `;

            const cardsGrid = document.createElement('div');
            cardsGrid.className = 'engine-cards-grid';

            catParts.forEach(part => {
                const card = this.createPartCard(part, cat);
                cardsGrid.append(card);
            });

            groupSec.append(groupHeading, cardsGrid);
            scrollWrap.append(groupSec);
        });

        windowEl.append(scrollWrap);

        // 3. PIE DE MODAL (FONDOS & BOTONES DE ACCIÓN)
        const footer = document.createElement('footer');
        footer.className = 'engine-modal-footer';

        const fundsInfo = document.createElement('div');
        fundsInfo.className = 'engine-footer-funds';

        const fundsLabel = document.createElement('span');
        fundsLabel.className = 'engine-funds-label';
        fundsLabel.textContent = 'Presupuesto Disponible';

        const fundsVal = document.createElement('span');
        fundsVal.className = 'engine-funds-value';
        const currentFunds = Math.floor(Number(this.game?.funds) || 0);
        fundsVal.textContent = `$${currentFunds.toLocaleString()}`;
        this.fundsValueEl = fundsVal;

        fundsInfo.append(fundsLabel, fundsVal);

        const actions = document.createElement('div');
        actions.className = 'engine-footer-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'engine-btn-cancel';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.addEventListener('click', () => this.close());

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'engine-btn-submit';
        submitBtn.textContent = 'Desarrollar Motor';
        this.submitBtn = submitBtn;

        submitBtn.addEventListener('click', () => {
            this.handleDevelopEngine();
        });

        actions.append(cancelBtn, submitBtn);
        footer.append(fundsInfo, actions);
        windowEl.append(footer);

        backdrop.append(windowEl);

        // Cerrar al pulsar en el fondo fuera de la ventana modal
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                this.close();
            }
        });

        // Cerrar accesible con tecla Escape (agentes/dialogos.md)
        this._keyListener = (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this._keyListener);
        }

        this.container.append(backdrop);
        this.element = backdrop;

        // Inicializar costes y estados de tarjetas
        this.updateCostAndUI();

        return backdrop;
    }

    /**
     * Crea un elemento de tarjeta con la estructura estricta solicitada:
     * - Icono de categoría a la izquierda.
     * - Nombre corto y limpio en texto plano (sin barras, paréntesis ni subtítulos largos).
     * - Coste formateado a la derecha en rojo: [X]K Cr.
     * - Indicador circular de estado (flecha inactiva / check verde activo).
     */
    createPartCard(part, category) {
        const card = document.createElement('div');
        const isUnlocked = !this.game?.techTreeManager || this.game.techTreeManager.isUnlocked(part.id);
        const isSelected = isUnlocked && this.selectedPartIds.has(part.id);

        let cardClasses = 'engine-part-card';
        if (!isUnlocked) {
            cardClasses += ' is-locked';
        } else if (isSelected) {
            cardClasses += ' is-selected';
        }
        card.className = cardClasses;
        card.dataset.partId = part.id;
        card.setAttribute('role', 'checkbox');
        card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        if (!isUnlocked) {
            card.setAttribute('aria-disabled', 'true');
            card.title = 'Requiere investigar en Laboratorio de I+D';
        }
        card.tabIndex = 0;

        const left = document.createElement('div');
        left.className = 'engine-card-left';

        const iconEl = document.createElement('span');
        iconEl.className = 'engine-card-cat-icon';
        iconEl.style.backgroundColor = category.color;
        iconEl.innerHTML = CATEGORY_SVGS[category.icon] || CATEGORY_SVGS.gear;

        const nameEl = document.createElement('span');
        nameEl.className = 'engine-card-name';
        nameEl.textContent = part.name;

        left.append(iconEl, nameEl);

        const right = document.createElement('div');
        right.className = 'engine-card-right';

        const costEl = document.createElement('span');
        costEl.className = 'engine-card-cost';
        costEl.textContent = part.costLabel || `${part.costK}K Cr.`;

        const indicator = document.createElement('span');
        indicator.className = 'engine-status-indicator';
        indicator.innerHTML = !isUnlocked ? LOCK_ICON_SVG : (isSelected ? CHECK_ICON_SVG : INACTIVE_ICON_SVG);

        right.append(costEl, indicator);
        card.append(left, right);

        // Al hacer clic, conmuta y aplica sustitución progresiva si corresponde
        const handleToggle = () => {
            const currentlyUnlocked = !this.game?.techTreeManager || this.game.techTreeManager.isUnlocked(part.id);
            if (!currentlyUnlocked) {
                if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
                    window.showToast(`[[DE_ICON_093]] Debes investigar "${part.name}" en el Laboratorio de I+D antes de incluirla en tu motor.`, 'warn');
                }
                return;
            }
            this.togglePart(part.id);
        };

        card.addEventListener('click', handleToggle);
        card.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleToggle();
            }
        });

        this.cardElements.set(part.id, { card, indicator, part });
        return card;
    }

    togglePart(partId) {
        // Ejecutar regla de sustitución progresiva (Subagente 4)
        const { nextIds, replacedId } = resolveBranchReplacement(this.selectedPartIds, partId);
        this.selectedPartIds = nextIds;

        // Actualizar visualmente la tarjeta pulsada
        this.updateCardVisual(partId);

        // Si se reemplazó una versión anterior de la misma rama, actualizar también la anterior
        if (replacedId) {
            this.updateCardVisual(replacedId);
        }

        this.updateCostAndUI();
    }

    updateCardVisual(partId) {
        const item = this.cardElements.get(partId);
        if (!item) return;

        const isUnlocked = !this.game?.techTreeManager || this.game.techTreeManager.isUnlocked(partId);
        if (!isUnlocked) {
            item.card.classList.add('is-locked');
            item.card.classList.remove('is-selected');
            item.card.setAttribute('aria-checked', 'false');
            item.indicator.innerHTML = LOCK_ICON_SVG;
            return;
        }

        const isSelected = this.selectedPartIds.has(partId);
        item.card.classList.remove('is-locked');
        item.card.classList.toggle('is-selected', isSelected);
        item.card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        item.indicator.innerHTML = isSelected ? CHECK_ICON_SVG : INACTIVE_ICON_SVG;
    }

    updateCostAndUI() {
        const totalCost = calculateEngineCost(Array.from(this.selectedPartIds));
        const totalK = Math.round(totalCost / 1000);

        if (this.costValueEl) {
            this.costValueEl.textContent = `Costo: ${totalK}K Cr.`;
        }

        const playerFunds = Number(this.game?.funds) || 0;
        const hasEnoughFunds = playerFunds >= totalCost;

        if (this.fundsValueEl) {
            this.fundsValueEl.classList.toggle('is-insufficient', !hasEnoughFunds);
        }

        this.updateSubmitState(totalCost, hasEnoughFunds);
    }

    updateSubmitState(totalCost = null, hasEnoughFunds = null) {
        if (!this.submitBtn) return;

        if (totalCost === null) {
            totalCost = calculateEngineCost(Array.from(this.selectedPartIds));
        }
        if (hasEnoughFunds === null) {
            const playerFunds = Number(this.game?.funds) || 0;
            hasEnoughFunds = playerFunds >= totalCost;
        }

        const hasName = Boolean(this.engineName && this.engineName.length >= 2);
        const hasParts = this.selectedPartIds.size > 0;

        if (this.game?.currentProject) {
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = 'Juego en Desarrollo';
        } else if (this.game?.activeEngineRD) {
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = 'Motor en Desarrollo';
        } else if (!hasEnoughFunds) {
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = 'Fondos Insuficientes';
        } else if (!hasName) {
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = 'Escribe un Nombre';
        } else if (!hasParts) {
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = 'Selecciona Módulos';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Desarrollar Motor';
        }
    }

    filterCardsByCategory(categoryId) {
        if (!this.element) return;
        const sections = this.element.querySelectorAll('.engine-group-section');
        sections.forEach(sec => {
            if (categoryId === 'all' || sec.dataset.category === categoryId) {
                sec.style.display = '';
            } else {
                sec.style.display = 'none';
            }
        });
    }

    handleDevelopEngine() {
        const totalCost = calculateEngineCost(Array.from(this.selectedPartIds));
        const playerFunds = Number(this.game?.funds) || 0;

        if (playerFunds < totalCost) {
            return;
        }

        if (!this.engineName || this.engineName.length < 2) {
            return;
        }

        if (this.game?.currentProject) {
            if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
                window.showToast('[[DE_ICON_093]] Ya tienes un videojuego en desarrollo. Termínalo antes de iniciar el motor.', 'warn');
            }
            return;
        }

        if (this.game?.activeEngineRD) {
            if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
                window.showToast(`[[DE_ICON_093]] Ya hay un motor en desarrollo ("${this.game.activeEngineRD.name}").`, 'warn');
            }
            return;
        }

        // Deducción real de créditos del estudio
        if (this.game && Number.isFinite(this.game.funds)) {
            this.game.funds = Math.max(0, this.game.funds - totalCost);
        }

        // Creación limpia del objeto de Motor de Videojuegos (Subagente 3)
        const engineCount = (this.game?.customEngines?.length || this.game?.inHouseEngines?.length || 0) + 1;
        const currentYear = this.game?.getHistoricalYear ? this.game.getHistoricalYear() : (this.game?.year ? 1981 + this.game.year : 1982);
        const currentWeek = this.game?.week || 1;
        const engineId = 'engine_' + Date.now();
        const finalName = this.engineName.trim() || `Motor v${engineCount}.0`;

        // Duración en semanas según volumen de módulos (mínimo 3, máximo 10 semanas)
        const featureCount = this.selectedPartIds.size;
        const totalWeeks = Math.max(3, Math.min(10, Math.ceil(featureCount / 2) + 1));

        const seniorProgrammers = (this.game?.employees || []).filter(e => (e.tech || 0) >= 20);
        const leadEmp = seniorProgrammers[0] || (this.game?.employees || [])[0] || { name: 'Fundador' };
        const leadIndex = (this.game?.employees || []).indexOf(leadEmp);

        const newEngine = {
            id: engineId,
            name: finalName,
            version: `${engineCount}.0`,
            features: Array.from(this.selectedPartIds),
            cost: totalCost,
            createdAt: currentYear,
            createdYear: currentYear,
            createdWeek: currentWeek,
            totalWeeks,
            weeksRemaining: totalWeeks,
            progress: 0,
            techPoints: 0,
            designPoints: 0,
            bugs: 0,
            leadProgrammerIndex: leadIndex >= 0 ? leadIndex : 0,
            leadProgrammerName: leadEmp.name,
            isProprietary: true,
            isCustom: true,
            isDeveloping: true,
            efficiency: 1.0,
            getEfficiency: () => 1.0,
            getFrictionMultiplier: () => 0.5,
            bakedNodes: Array.from(this.selectedPartIds),
            isEngineProject: true
        };

        // Iniciar como proyecto activo de motor en el juego
        if (this.game) {
            this.game.activeEngineRD = newEngine;

            if (!Array.isArray(this.game.customEngines)) {
                this.game.customEngines = [];
            }
            this.game.customEngines.push(newEngine);

            if (!Array.isArray(this.game.inHouseEngines)) {
                this.game.inHouseEngines = [];
            }
            this.game.inHouseEngines.push(newEngine);

            if (typeof this.game.notify === 'function') {
                this.game.notify();
            }
        }

        if (typeof window !== 'undefined') {
            if (typeof window.showToast === 'function') {
                window.showToast(`[[DE_ICON_015]] ¡Iniciado el proyecto de motor "${finalName}"! Duración estimada: ${totalWeeks} semanas.`, 'success');
            }
            if (window.gameDevFlow && typeof window.gameDevFlow.updateTopHUD === 'function') {
                window.gameDevFlow.updateTopHUD();
            }
            if (typeof window.renderHUD === 'function' && this.game) {
                window.renderHUD(this.game);
            }
        }

        // Ejecutar callback si existe
        if (typeof this.onCreated === 'function') {
            this.onCreated(newEngine);
        }

        this.close();
    }

    close() {
        this.destroy();
    }

    destroy() {
        if (this._keyListener && typeof window !== 'undefined') {
            window.removeEventListener('keydown', this._keyListener);
            this._keyListener = null;
        }
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
        const existing = document.getElementById('engine-creation-modal-backdrop');
        if (existing) {
            existing.remove();
        }
        if (typeof this.onClose === 'function') {
            this.onClose();
        }
    }
}

/**
 * Sanitiza cualquier estructura de motor para asegurar que cumple con los
 * metadatos limpios y sin estructuras obsoletas (Subagente 3).
 */
export function sanitizeEngineData(engine) {
    if (!engine) return null;
    const features = Array.isArray(engine.features)
        ? engine.features
        : (Array.isArray(engine.appliedFeatures)
            ? engine.appliedFeatures
            : (Array.isArray(engine.partIds)
                ? engine.partIds
                : (Array.isArray(engine.bakedNodes) ? engine.bakedNodes : [])));
    const currentYear = engine.createdAt || engine.createdYear || 1982;
    return {
        id: engine.id || 'engine_' + Date.now(),
        name: engine.name || 'Motor Personalizado',
        version: typeof engine.version === 'string' ? engine.version : `${engine.version || 1}.0`,
        features: [...features],
        cost: typeof engine.cost === 'number' ? engine.cost : 0,
        createdAt: currentYear,
        isProprietary: true,
        isCustom: true,
        efficiency: typeof engine.efficiency === 'number' ? engine.efficiency : 1.0,
        getEfficiency: typeof engine.getEfficiency === 'function' ? engine.getEfficiency : () => 1.0,
        getFrictionMultiplier: typeof engine.getFrictionMultiplier === 'function' ? engine.getFrictionMultiplier : () => 0.5,
        bakedNodes: [...features]
    };
}

if (typeof window !== 'undefined') {
    window.EngineCreationModal = EngineCreationModal;
}


