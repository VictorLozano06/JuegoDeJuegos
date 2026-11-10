/**
 * DEV EMPIRE 3D - Game Dev Tycoon Sequential Production Flow Controller & HUD
 * Faithfully matches the Game Dev Tycoon top status HUD (Images 1 & 2)
 * and the vertical equalizer stage modals with features side panel (Images 3 & 4).
 */

export const ProductionLifecycleState = {
    STATE_SETUP: 'STATE_SETUP',
    STAGE_1_INPUT: 'STAGE_1_INPUT',
    STAGE_1_WORK: 'STAGE_1_WORK',
    STAGE_2_INPUT: 'STAGE_2_INPUT',
    STAGE_2_WORK: 'STAGE_2_WORK',
    STAGE_3_INPUT: 'STAGE_3_INPUT',
    STAGE_3_WORK: 'STAGE_3_WORK',
    STAGE_BUG_FIXING: 'STAGE_BUG_FIXING'
};

export const STAGE_CONFIGS = {
    1: {
        title: 'Stage 1',
        sliders: [
            { id: 'engine', label: 'Motor', default: 80, tech: true },
            { id: 'gameplay', label: 'Jugabilidad', default: 100, tech: false },
            { id: 'story', label: 'Historia/Misiones', default: 20, tech: false }
        ],
        featureGroups: [] // By default, Stage 1 has no extra features (matches Image 3)
    },
    2: {
        title: 'Stage 2',
        sliders: [
            { id: 'dialogues', label: 'Diálogos', default: 60, tech: false },
            { id: 'levelDesign', label: 'Diseño de Niveles', default: 75, tech: false },
            { id: 'ai', label: 'IA', default: 65, tech: true }
        ],
        featureGroups: []
    },
    3: {
        title: 'Stage 3',
        sliders: [
            { id: 'worldDesign', label: 'Diseño de Mundo', default: 79, tech: false },
            { id: 'graphics', label: 'Gráfico', default: 83, tech: true },
            { id: 'sound', label: 'Sonido', default: 16, tech: false }
        ],
        featureGroups: [
            {
                category: 'Gráfico',
                icon: 'screen',
                features: [
                    { id: 'feat_graphics_2d_v1', name: 'Gráficos 2D V.1', cost: 0, costLabel: '', checked: true }
                ]
            },
            {
                category: 'Sonido',
                icon: 'sound',
                features: [
                    { id: 'feat_basic_sounds', name: 'Sonidos básicos', cost: 5000, costLabel: '5K Cr.', checked: true }
                ]
            }
        ]
    }
};

/**
 * Reusable dynamic Stage Modal (matching Images 3 & 4) with vertical sliders & side panel.
 */
export class DevelopmentStageModal {
    constructor({ stage, project, onConfirm, container = null }) {
        this.stage = stage;
        this.project = project;
        this.onConfirm = onConfirm;
        this.container = container || (typeof document !== 'undefined' ? document.body : null);
        this.element = null;
        
        // Base config clone
        const base = STAGE_CONFIGS[stage] || STAGE_CONFIGS[1];
        this.config = {
            title: base.title,
            sliders: base.sliders.map(s => ({ ...s })),
            featureGroups: (base.featureGroups || []).map(g => ({
                category: g.category,
                icon: g.icon,
                features: g.features.map(f => ({ ...f }))
            }))
        };

        // If custom project engine features exist for this stage, incorporate them
        if (this.project?.customFeatures?.[`stage${stage}`]?.length) {
            this.config.featureGroups.push(...this.project.customFeatures[`stage${stage}`]);
        }

        this.sliderValues = {};
        this.selectedFeatures = new Set();
        this.totalFeaturesCost = 0;
    }

    render() {
        if (!this.container || typeof document === 'undefined') return null;

        const existing = document.getElementById('dev-stage-modal-backdrop');
        if (existing) existing.remove();

        const backdrop = document.createElement('div');
        backdrop.id = 'dev-stage-modal-backdrop';
        backdrop.className = 'dev-modal-backdrop';
        backdrop.setAttribute('role', 'dialog');
        backdrop.setAttribute('aria-modal', 'true');

        const container = document.createElement('div');
        container.className = 'dev-modal-container';

        // 1. MAIN EQUALIZER WINDOW (Image 3)
        const windowEl = document.createElement('div');
        windowEl.className = 'dev-modal-window';

        // Header
        const header = document.createElement('header');
        header.className = 'dev-modal-header';

        const title = document.createElement('h2');
        title.className = 'dev-modal-title';
        title.innerHTML = `Desarrollo: <span class="dev-modal-bold-title">${this.project?.name || 'Juego'}</span>`;

        const sub = document.createElement('p');
        sub.className = 'dev-modal-subtitle';
        const topicName = this.project?.topic?.name || 'Tema';
        const genreName = this.project?.genre?.name || 'Género';
        sub.textContent = `${topicName}/${genreName}`;

        header.append(title, sub);

        // Stage Breadcrumb Tabs
        const tabs = document.createElement('nav');
        tabs.className = 'dev-modal-tabs';
        [1, 2, 3].forEach(step => {
            const tab = document.createElement('div');
            tab.className = `dev-stage-tab ${step === this.stage ? 'is-active' : ''}`;
            tab.textContent = `Stage ${step}`;
            tabs.append(tab);
        });

        // 3 Vertical Faders Row
        const fadersRow = document.createElement('div');
        fadersRow.className = 'dev-faders-row';

        const faderElements = [];

        this.config.sliders.forEach((sliderConfig, idx) => {
            const col = document.createElement('div');
            col.className = `dev-fader-column is-col-${idx + 1}`;

            // Initial value from project or config
            let initialVal = sliderConfig.default;
            const stageKey = `stage${this.stage}`;
            if (this.project?.sliders?.[stageKey]?.[sliderConfig.id] !== undefined) {
                const raw = this.project.sliders[stageKey][sliderConfig.id];
                initialVal = raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
            }
            this.sliderValues[sliderConfig.id] = initialVal;

            const trackWrap = document.createElement('div');
            trackWrap.className = 'dev-fader-track-wrap';

            const fill = document.createElement('div');
            fill.className = 'dev-fader-fill';
            fill.style.height = `${initialVal}%`;

            const arrows = document.createElement('div');
            arrows.className = 'dev-fader-arrows';
            arrows.style.bottom = `${initialVal}%`;

            // Clean SVG Inward Carets: left points right (>), right points left (<)
            const arrowLeft = document.createElement('span');
            arrowLeft.className = 'dev-fader-arrow-left';
            arrowLeft.innerHTML = `
                <svg viewBox="0 0 8 12" width="7" height="11" fill="#64748b" aria-hidden="true">
                    <path d="M1 1 L7 6 L1 11 Z"/>
                </svg>
            `;

            const arrowRight = document.createElement('span');
            arrowRight.className = 'dev-fader-arrow-right';
            arrowRight.innerHTML = `
                <svg viewBox="0 0 8 12" width="7" height="11" fill="#64748b" aria-hidden="true">
                    <path d="M7 1 L1 6 L7 11 Z"/>
                </svg>
            `;

            arrows.append(arrowLeft, arrowRight);
            trackWrap.append(fill, arrows);

            const percentLabel = document.createElement('span');
            percentLabel.className = 'dev-fader-percent';
            percentLabel.textContent = `${initialVal}%`;

            const pillarLabel = document.createElement('span');
            pillarLabel.className = 'dev-fader-label';
            pillarLabel.textContent = sliderConfig.label;

            col.append(trackWrap, percentLabel, pillarLabel);
            fadersRow.append(col);

            const faderData = {
                id: sliderConfig.id,
                trackWrap,
                fill,
                arrows,
                percentLabel,
                val: initialVal
            };
            faderElements.push(faderData);

            // Drag / click handling for vertical equalizer
            const updateSliderFromEvent = (clientY) => {
                const rect = trackWrap.getBoundingClientRect();
                const clampedY = Math.max(rect.top, Math.min(rect.bottom, clientY));
                const percent = Math.round(((rect.bottom - clampedY) / rect.height) * 100);
                this.sliderValues[sliderConfig.id] = percent;
                faderData.val = percent;
                fill.style.height = `${percent}%`;
                arrows.style.bottom = `${percent}%`;
                percentLabel.textContent = `${percent}%`;
                this.updateTimeAllocationBar(timeBarSegments);
            };

            let isDragging = false;
            trackWrap.addEventListener('pointerdown', (e) => {
                isDragging = true;
                trackWrap.setPointerCapture?.(e.pointerId);
                updateSliderFromEvent(e.clientY);
            });
            trackWrap.addEventListener('pointermove', (e) => {
                if (isDragging) updateSliderFromEvent(e.clientY);
            });
            const stopDrag = (e) => {
                if (isDragging) {
                    isDragging = false;
                    trackWrap.releasePointerCapture?.(e.pointerId);
                }
            };
            trackWrap.addEventListener('pointerup', stopDrag);
            trackWrap.addEventListener('pointercancel', stopDrag);
        });

        // Time Allocation Segmented Bar
        const timeAllocWrap = document.createElement('div');
        timeAllocWrap.className = 'dev-time-allocation-wrap';

        const timeTitle = document.createElement('div');
        timeTitle.className = 'dev-time-allocation-title';
        timeTitle.textContent = 'Time Allocation';

        const timeBar = document.createElement('div');
        timeBar.className = 'dev-time-bar';

        const timeBarSegments = [
            document.createElement('div'),
            document.createElement('div'),
            document.createElement('div')
        ];
        timeBarSegments[0].className = 'dev-time-segment is-seg-1';
        timeBarSegments[1].className = 'dev-time-segment is-seg-2';
        timeBarSegments[2].className = 'dev-time-segment is-seg-3';

        timeBar.append(...timeBarSegments);
        timeAllocWrap.append(timeTitle, timeBar);
        this.updateTimeAllocationBar(timeBarSegments);

        // Actions: [ OK ] Button
        const actions = document.createElement('div');
        actions.className = 'dev-modal-actions';

        const okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.className = 'dev-btn-ok';
        okBtn.textContent = 'OK';
        okBtn.autofocus = true;

        okBtn.addEventListener('click', () => {
            this.handleConfirm();
        });

        actions.append(okBtn);
        windowEl.append(header, tabs, fadersRow, timeAllocWrap, actions);
        container.append(windowEl);

        // 2. FEATURES SIDE PANEL (Image 4) - only rendered if options exist!
        if (this.config.featureGroups && this.config.featureGroups.length > 0) {
            const sidePanel = document.createElement('aside');
            sidePanel.className = 'dev-modal-side-panel';

            const sideHeader = document.createElement('div');
            sideHeader.className = 'dev-side-header';

            const sideTitle = document.createElement('div');
            sideTitle.className = 'dev-side-title';

            // SVG Checkmark in gray rounded square
            const checkSquareSvg = `
                <span class="dev-side-title-icon">
                    <svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M4 10.5l4 4L16 5.5"/>
                    </svg>
                </span>
            `;
            sideTitle.innerHTML = `${checkSquareSvg} <span>Características</span>`;

            const sideCostRow = document.createElement('div');
            sideCostRow.className = 'dev-side-cost-row';

            const sideCostLabel = document.createElement('span');
            sideCostLabel.className = 'dev-side-cost-label';
            sideCostLabel.textContent = 'Costo:';

            const sideCostVal = document.createElement('span');
            sideCostVal.className = 'dev-side-cost-val';
            sideCostVal.textContent = 'Cr. 0';

            sideCostRow.append(sideCostLabel, sideCostVal);
            sideHeader.append(sideTitle, sideCostRow);

            const featuresList = document.createElement('div');
            featuresList.className = 'dev-features-list';

            this.config.featureGroups.forEach(group => {
                const groupEl = document.createElement('div');
                groupEl.className = 'dev-feature-group';

                const groupTitle = document.createElement('div');
                groupTitle.className = 'dev-group-title';

                // Original SVGs for Category (display/monitor for graphic, speaker for sound, gear for motor)
                let catIconSvg = '';
                let catClass = 'is-graphic';
                if (group.icon === 'sound' || /sonido/i.test(group.category)) {
                    catClass = 'is-sound';
                    catIconSvg = '<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5zm4.5 3a5 5 0 010 8v-2a3 3 0 000-4v-2zm2.5-3a8 8 0 010 14v-2a6 6 0 000-10V5z"/></svg>';
                } else if (group.icon === 'gear' || /motor/i.test(group.category)) {
                    catClass = 'is-motor';
                    catIconSvg = '<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';
                } else {
                    catClass = 'is-graphic';
                    catIconSvg = '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>';
                }

                groupTitle.innerHTML = `<span class="dev-group-icon ${catClass}">${catIconSvg}</span> <span>${group.category}</span>`;
                groupEl.append(groupTitle);

                group.features.forEach(feat => {
                    const card = document.createElement('div');
                    const isInitiallyChecked = feat.checked !== false;
                    card.className = `dev-feature-card ${isInitiallyChecked ? '' : 'is-unselected'}`;

                    if (isInitiallyChecked) {
                        this.selectedFeatures.add(feat.id);
                        this.totalFeaturesCost += feat.cost || 0;
                    }

                    const cardLeft = document.createElement('div');
                    cardLeft.className = 'dev-feature-card-left';

                    const greenCheckSvg = `
                        <span class="dev-feature-check">
                            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="#10b981" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M4 10.5l4 4L16 5.5"/>
                            </svg>
                        </span>
                    `;
                    cardLeft.innerHTML = `
                        ${greenCheckSvg}
                        <span class="dev-feature-name">${feat.name}</span>
                    `;

                    const cardRight = document.createElement('div');
                    cardRight.className = 'dev-feature-cost';
                    cardRight.textContent = feat.costLabel || (feat.cost > 0 ? `${Math.round(feat.cost / 1000)}K Cr.` : '');

                    card.append(cardLeft, cardRight);

                    card.addEventListener('click', () => {
                        const isSelected = this.selectedFeatures.has(feat.id);
                        if (isSelected) {
                            this.selectedFeatures.delete(feat.id);
                            this.totalFeaturesCost = Math.max(0, this.totalFeaturesCost - (feat.cost || 0));
                            card.classList.add('is-unselected');
                        } else {
                            this.selectedFeatures.add(feat.id);
                            this.totalFeaturesCost += feat.cost || 0;
                            card.classList.remove('is-unselected');
                        }
                        const costK = Math.round(this.totalFeaturesCost / 1000);
                        sideCostVal.textContent = costK > 0 ? `Cr. ${costK}K` : 'Cr. 0';
                    });

                    groupEl.append(card);
                });

                featuresList.append(groupEl);
            });

            const initialCostK = Math.round(this.totalFeaturesCost / 1000);
            sideCostVal.textContent = initialCostK > 0 ? `Cr. ${initialCostK}K` : 'Cr. 0';

            sidePanel.append(sideHeader, featuresList);
            container.append(sidePanel);
        }

        backdrop.append(container);
        this.container.append(backdrop);
        this.element = backdrop;

        setTimeout(() => {
            okBtn.focus();
        }, 30);

        return backdrop;
    }

    updateTimeAllocationBar(segments) {
        if (!segments || segments.length < 3) return;
        const keys = this.config.sliders.map(s => s.id);
        const v1 = Math.max(1, this.sliderValues[keys[0]] || 1);
        const v2 = Math.max(1, this.sliderValues[keys[1]] || 1);
        const v3 = Math.max(1, this.sliderValues[keys[2]] || 1);
        const total = v1 + v2 + v3;

        const s1 = (v1 / total) * 100;
        const s2 = (v2 / total) * 100;
        const s3 = Math.max(0, 100 - s1 - s2);

        const formatPct = (val) => {
            const rounded = Math.round(val);
            if (Math.abs(val - rounded) < 0.1) return `${rounded}%`;
            return `${val.toFixed(1)}%`;
        };

        segments[0].style.width = `${s1.toFixed(1)}%`;
        segments[0].textContent = formatPct(s1);

        segments[1].style.width = `${s2.toFixed(1)}%`;
        segments[1].textContent = formatPct(s2);

        segments[2].style.width = `${s3.toFixed(1)}%`;
        segments[2].textContent = formatPct(s3);
    }

    handleConfirm() {
        const values = { ...this.sliderValues };
        const techs = Array.from(this.selectedFeatures);
        this.destroy();
        if (typeof this.onConfirm === 'function') {
            this.onConfirm(values, techs, this.totalFeaturesCost);
        }
    }

    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

/**
 * Main Controller orchestrating project production flow and persistent GDT Top Status HUD.
 */
export class GameDevFlowController {
    constructor({ game, world, setGameSpeed, onRelease }) {
        this.game = game;
        this.world = world;
        this.setGameSpeed = setGameSpeed || ((s) => { if (this.game) this.game.gameSpeed = s; });
        this.onRelease = onRelease || (() => {});
        this.state = ProductionLifecycleState.STATE_SETUP;
        this.project = null;
        this.savedSpeed = 1;
        this.currentModal = null;
        this.hudEl = null;

        this.lastTech = 0;
        this.lastDesign = 0;
        this.lastBugs = 0;
        this.pendingBubble = null;

        // Ensure top HUD is initialized on creation
        this.renderTopHUD();
    }

    /**
     * Initializes flow when a new project is created in preproduction.
     */
    initProject(project) {
        if (!project) return;
        this.pendingBubble = null;
        this.project = project;
        this.project.lifecycleState = ProductionLifecycleState.STAGE_1_INPUT;
        this.state = ProductionLifecycleState.STAGE_1_INPUT;
        this.project.stage = 1;
        this.project.stageProgress = 0;
        this.project.overallProgress = 0;
        this.lastTech = Math.round(Number(project.techPoints) || 0);
        this.lastDesign = Math.round(Number(project.designPoints) || 0);
        this.lastBugs = Math.round(Number(project.bugs) || 0);

        this.closeCurrentModal();

        // Pause simulation and open Stage 1 Modal
        this.pauseGame();
        this.openStageModal(1);
        this.updateTopHUD();
    }

    pauseGame() {
        if (this.game) {
            if (this.game.gameSpeed > 0) {
                this.savedSpeed = this.game.gameSpeed;
            }
            this.setGameSpeed(0);
        }
    }

    resumeGame() {
        if (this.game) {
            const speedToRestore = this.savedSpeed > 0 ? this.savedSpeed : 1;
            this.setGameSpeed(speedToRestore);
        }
    }

    openStageModal(stage) {
        this.closeCurrentModal();
        this.currentModal = new DevelopmentStageModal({
            stage,
            project: this.project,
            onConfirm: (values, techs, extraCost) => {
                this.onStageConfirmed(stage, values, techs, extraCost);
            }
        });
        this.currentModal.render();
    }

    closeCurrentModal() {
        if (this.currentModal) {
            this.currentModal.destroy();
            this.currentModal = null;
        }
        if (typeof document !== 'undefined') {
            const existing = document.getElementById('dev-stage-modal-backdrop');
            if (existing) existing.remove();
        }
    }

    onStageConfirmed(stage, values, techs, extraCost = 0) {
        if (!this.project) return;

        // Charge feature cost if applicable
        if (extraCost > 0 && this.game && Number.isFinite(this.game.funds)) {
            this.game.funds -= extraCost;
        }

        // Save slider percentages in project
        const stageKey = `stage${stage}`;
        this.project.sliders = this.project.sliders || {};
        this.project.sliders[stageKey] = {};

        for (const [key, val] of Object.entries(values)) {
            this.project.sliders[stageKey][key] = val / 100;
        }

        if (this.project.production && this.project.production.allocations) {
            this.project.production.allocations[stage] = { ...values };
        }

        if (techs && techs.length) {
            this.project.appliedFeatures = [...new Set([...(this.project.appliedFeatures || []), ...techs])];
        }

        // Transition from INPUT to WORK
        if (stage === 1) {
            this.state = ProductionLifecycleState.STAGE_1_WORK;
            this.project.lifecycleState = ProductionLifecycleState.STAGE_1_WORK;
            this.project.stage = 1;
        } else if (stage === 2) {
            this.state = ProductionLifecycleState.STAGE_2_WORK;
            this.project.lifecycleState = ProductionLifecycleState.STAGE_2_WORK;
            this.project.stage = 2;
        } else if (stage === 3) {
            this.state = ProductionLifecycleState.STAGE_3_WORK;
            this.project.lifecycleState = ProductionLifecycleState.STAGE_3_WORK;
            this.project.stage = 3;
        }

        this.closeCurrentModal();
        this.updateTopHUD();
        this.resumeGame();
    }

    /**
     * Synchronizes HUD and stage gates with simulation progress.
     */
    syncWithProject(project) {
        if (project !== this.project) {
            this.pendingBubble = null;
            this.lastTech = Math.round(Number(project?.techPoints) || 0);
            this.lastDesign = Math.round(Number(project?.designPoints) || 0);
            this.lastBugs = Math.round(Number(project?.bugs) || 0);
        }
        this.project = project;

        if (!project) {
            this.state = ProductionLifecycleState.STATE_SETUP;
            this.updateTopHUD();
            return;
        }

        if (!this.project.lifecycleState) {
            this.project.lifecycleState = this.state;
        }

        const overall = Math.min(100, Math.max(0, Number(project.overallProgress) || 0));

        const currentTech = Math.round(Number(project.techPoints) || 0);
        const currentDesign = Math.round(Number(project.designPoints) || 0);
        const currentBugs = Math.round(Number(project.bugs) || 0);
        this.emitPointBubbles(currentTech - this.lastTech, currentDesign - this.lastDesign, currentBugs - this.lastBugs);
        this.lastTech = currentTech;
        this.lastDesign = currentDesign;
        this.lastBugs = currentBugs;

        // Progress threshold checks
        if (this.state === ProductionLifecycleState.STAGE_1_WORK && overall >= 33.3) {
            this.project.stage = 2;
            this.project.stageProgress = 0;
            this.project.overallProgress = 33.3;
            this.state = ProductionLifecycleState.STAGE_2_INPUT;
            this.project.lifecycleState = ProductionLifecycleState.STAGE_2_INPUT;
            this.pauseGame();
            this.openStageModal(2);
            this.updateTopHUD();
            return;
        }

        if (this.state === ProductionLifecycleState.STAGE_2_WORK && overall >= 66.6) {
            this.project.stage = 3;
            this.project.stageProgress = 0;
            this.project.overallProgress = 66.6;
            this.state = ProductionLifecycleState.STAGE_3_INPUT;
            this.project.lifecycleState = ProductionLifecycleState.STAGE_3_INPUT;
            this.pauseGame();
            this.openStageModal(3);
            this.updateTopHUD();
            return;
        }

        if (this.state === ProductionLifecycleState.STAGE_3_WORK && overall >= 99.5) {
            this.project.stage = 4;
            this.project.stageProgress = 100;
            this.project.overallProgress = 100;
            this.state = ProductionLifecycleState.STAGE_BUG_FIXING;
            this.project.lifecycleState = ProductionLifecycleState.STAGE_BUG_FIXING;
            this.updateTopHUD();
            return;
        }

        this.updateTopHUD();
    }

    emitPointBubbles(techDelta, designDelta, bugDelta) {
        if (!this.world || typeof this.world.spawnDevelopmentBubble !== 'function') return;
        if (this.pendingBubble) return;

        const empCount = (this.game?.employees?.length) || 1;
        const targetEmp = Math.floor(Math.random() * Math.max(1, empCount));

        const changed = [['tech', techDelta], ['design', designDelta], ['bug', bugDelta]]
            .filter(([, delta]) => delta > 0);
        if (!changed.length) return;
        const next = (this.nextBubbleIndex || 0) % changed.length;
        const type = changed[next][0];
        const previous = { tech: this.lastTech, design: this.lastDesign, bug: this.lastBugs };
        const pending = { type, value: previous[type], project: this.project };
        this.pendingBubble = pending;
        this.world.spawnDevelopmentBubble(type, targetEmp, () => {
            if (this.pendingBubble !== pending || this.project !== pending.project) return;
            this.pendingBubble = null;
            this.updateTopHUD();
        });
        this.nextBubbleIndex = next + 1;
    }

    /**
     * Renders or updates the persistent GDT Top Status HUD (Images 1 & 2).
     */
    renderTopHUD() {
        if (typeof document === 'undefined') return;

        let hud = document.getElementById('gdt-top-status-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'gdt-top-status-hud';
            hud.className = 'gdt-top-hud';
            const targetContainer = document.getElementById('ui-overlay') || document.body;
            targetContainer.append(hud);
        }
        this.hudEl = hud;
        this.updateTopHUD();
    }

    showTopHUD() {
        if (this.hudEl) this.hudEl.classList.remove('is-hidden');
    }

    hideTopHUD() {
        if (this.hudEl) this.hudEl.classList.add('is-hidden');
    }

    updateTopHUD() {
        if (!this.hudEl || typeof document === 'undefined') return;

        const p = this.project;
        const isGameActive = Boolean(p && this.state !== ProductionLifecycleState.STATE_SETUP);
        const engineRD = this.game?.activeEngineRD;
        const isEngineActive = Boolean(engineRD && !isGameActive);
        const isActive = isGameActive || isEngineActive;
        const rp = Math.round(Number(this.game?.researchPoints) || 0);

        let bugs = 0;
        let design = 0;
        let tech = 0;

        let statusText = 'Iniciando...';
        const isBugFixing = isGameActive && (this.state === ProductionLifecycleState.STAGE_BUG_FIXING || p.stage >= 4);

        if (isGameActive) {
            bugs = Math.max(0, Math.round(Number(p.bugs) || 0));
            design = Math.round(Number(p.designPoints) || 0);
            tech = Math.round(Number(p.techPoints) || 0);
            if (this.pendingBubble?.project === p) {
                if (this.pendingBubble.type === 'bug') bugs = this.pendingBubble.value;
                if (this.pendingBubble.type === 'design') design = this.pendingBubble.value;
                if (this.pendingBubble.type === 'tech') tech = this.pendingBubble.value;
            }

            if (isBugFixing) {
                statusText = 'Fase de depuración';
            } else if (p.stage === 1) {
                statusText = `Etapa 1: Motor (${Math.floor(p.overallProgress || 0)}%)`;
            } else if (p.stage === 2) {
                statusText = `Etapa 2: Contenido (${Math.floor(p.overallProgress || 0)}%)`;
            } else if (p.stage === 3) {
                statusText = `Etapa 3: Audiovisual (${Math.floor(p.overallProgress || 0)}%)`;
            }
        } else if (isEngineActive) {
            bugs = Math.max(0, Math.round(Number(engineRD.bugs) || 0));
            design = Math.round(Number(engineRD.designPoints) || 0);
            tech = Math.round(Number(engineRD.techPoints) || 0);
            const prog = Math.floor(engineRD.progress || 0);
            statusText = `I+D de Arquitectura (${prog}%)`;
        }

        const enginePartsCount = isEngineActive ? ((engineRD.features || engineRD.bakedNodes || []).length) : 0;

        this.hudEl.innerHTML = `
            <!-- Errores -->
            <div class="gdt-hud-node ${isActive ? '' : 'is-dimmed-node'}">
                <div class="gdt-hud-circle is-bugs ${isActive ? 'is-active' : 'is-dimmed'}">
                    <span class="gdt-hud-val" id="gdt-val-bugs">${bugs}</span>
                </div>
                <span class="gdt-hud-pill">Errores</span>
            </div>

            <!-- Diseño -->
            <div class="gdt-hud-node ${isActive ? '' : 'is-dimmed-node'}">
                <div class="gdt-hud-circle is-design ${isActive ? 'is-active' : 'is-dimmed'}">
                    <span class="gdt-hud-val" id="gdt-val-design">${design}</span>
                </div>
                <span class="gdt-hud-pill">Diseño</span>
            </div>

            <!-- Central Card (overlapped by Diseño on left & Tecnología on right) -->
            <div class="gdt-hud-card ${isActive ? 'is-active' : 'is-idle'}">
                ${isGameActive ? `
                    <div class="gdt-hud-proj-title">${p.name || 'Juego'}</div>
                    <div class="gdt-hud-proj-sub">${p.topic?.name || 'Tema'} / ${p.genre?.name || 'Género'}</div>
                    <div class="gdt-hud-proj-status">${statusText}</div>
                    ${isBugFixing ? `<button type="button" id="gdt-btn-publish" class="gdt-hud-publish-btn">Publicar Juego</button>` : ''}
                ` : isEngineActive ? `
                    <div class="gdt-hud-proj-title">${engineRD.name}</div>
                    <div class="gdt-hud-proj-sub">Desarrollando Motor · ${enginePartsCount} Módulos</div>
                    <div class="gdt-hud-proj-status">${statusText} · Quedan ${engineRD.weeksRemaining} sem</div>
                    <div class="gdt-hud-prog-bar-wrap">
                        <div class="gdt-hud-prog-bar-fill" style="width: ${engineRD.progress || 0}%;"></div>
                    </div>
                ` : `
                    <span class="gdt-hud-idle-text">Ningun proyecto</span>
                `}
            </div>

            <!-- Tecnología -->
            <div class="gdt-hud-node ${isActive ? '' : 'is-dimmed-node'}">
                <div class="gdt-hud-circle is-tech ${isActive ? 'is-active' : 'is-dimmed'}">
                    <span class="gdt-hud-val" id="gdt-val-tech">${tech}</span>
                </div>
                <span class="gdt-hud-pill">Tecnología</span>
            </div>

            <!-- Investigación (Always active in blue!) -->
            <div class="gdt-hud-node">
                <div class="gdt-hud-circle is-rp">
                    <span class="gdt-hud-val" id="gdt-val-rp">${rp}</span>
                </div>
                <span class="gdt-hud-pill">Investigación</span>
            </div>
        `;

        if (isBugFixing) {
            const pubBtn = this.hudEl.querySelector('#gdt-btn-publish');
            if (pubBtn) {
                pubBtn.onclick = () => {
                    this.releaseProject();
                };
            }
        }
    }

    removeWidget() {
        this.closeCurrentModal();
        this.project = null;
        this.state = ProductionLifecycleState.STATE_SETUP;
        this.updateTopHUD();
    }

    releaseProject() {
        this.closeCurrentModal();
        if (typeof this.onRelease === 'function') {
            this.onRelease();
        }
        this.project = null;
        this.state = ProductionLifecycleState.STATE_SETUP;
        this.updateTopHUD();
    }
}
