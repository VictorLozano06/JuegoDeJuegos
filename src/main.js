import './ui-icons.js';
import { initializeIPUI, refreshIPWizard } from './ip-ui.js';
import { initializeRivalUI } from './rival-ui.js';
import { initializeFinanceUI } from './finance-ui.js';
import { soundEngine } from './audio.js';
import { DAG_CATALOG as SCOPE_NODES_CATALOG, EnginePipelineManager, REVERSE_ENGINEERING_CATALOG, ScopeDAG, TechnicalDebtModel } from './dag_engine.js';
import { game, GENRES, GENRES_DATABASE, findGenre, PLATFORMS, TOPICS, THEMES_DATABASE, findTheme, calculateSynergy } from './simulation.js';
import REAL_BRANDS_MOD_PACK from './data/mod_sample_real_brands.json';
import { WorldEngine } from './world.js';
import { createMainMenu } from './main-menu.js';
import { resetGame, saveSystem } from './SaveSystem.js';
import { version } from '../package.json';
import { TECH_TREE_NODES, calculateTechIncompatibility } from './data/techTreeData.js';

/**
 * DEV EMPIRE 3D - Main Application Controller
 * Seamless bridge connecting Simulation Logic, Three.js 3D World Engine,
 * Procedural Web Audio, and High-Performance Glassmorphism UI.
 */

let world = null;
const STATE_MAIN_MENU = 'main-menu';
const STATE_TRANSITION = 'transition';
const STATE_PLAYING = 'playing';
let appState = STATE_MAIN_MENU;
let mainMenu;
let financeUI;
let creatingNewGame = false;
let appliedSettings;
const initialProfile = {
    companyName: game.companyName,
    companyLogo: game.companyLogo,
    founder: { ...game.founder },
    characterCustomization: { ...game.characterCustomization }
};
let devInterval = null;
let calendarInterval = null;
let lastExpoYearTriggered = 0;
let lastNotifiedProjectOfferKey = null;
let lastRenderedEmployeeCount = null;
const notifiedHeadhuntEmployeeIds = new Set();

const techTreeManager = game.techTreeManager;
let scopeDAG = new ScopeDAG(null, { techTreeManager });
let debtManager = new TechnicalDebtModel();
let pipelineManager = new EnginePipelineManager();
const selectedHistoricalTechs = new Set();

game.onResearchCompleted = (name) => {
    showToast(`[[DE_ICON_073]] ¡I+D COMPLETADA! Módulo "${name}" investigado y desbloqueado para tus videojuegos.`, 'success');
    renderDAGNodes();
    renderTechTree();
};
game.onEmployeeEvent = (event) => {
    if (event?.message) showToast(event.message, event.type === 'returned' ? 'success' : 'warn');
};
game.onEngineRDCompleted = (engine) => {
    renderPipelineSelector();
    renderTechTree();
    showToast(`[[DE_ICON_024]] Motor "${engine.name}" compilado y añadido al selector de proyectos.`, 'success');
};
game.onEngineRPTick = (rpGain, leadIndex) => {
    if (world && typeof world.spawnFloatingRP === 'function') {
        world.spawnFloatingRP(leadIndex || 0, rpGain);
    }
};
game.onPostMortemCompleted = (result, assignedIndex) => {
    if (result && result.success) {
        showToast(`[[DE_ICON_030]] ¡Análisis Post-Mortem de "${result.report.gameName}" finalizado! (+${result.rpGained} RP)`, 'success');
        if (world && typeof world.spawnFloatingRP === 'function') {
            world.spawnFloatingRP(assignedIndex || 0, result.rpGained);
        }
        renderHistoryAndCharts();
        const salesModal = document.getElementById('modal-sales-chart');
        if (salesModal && salesModal.classList.contains('active')) {
            renderSelectedGameSalesChart();
        }
    }
};
game.onTopicResearchCompleted = (topicName, topicId, completedTopic) => {
    showToast(`[[DE_ICON_073]] ¡Temática Desbloqueada! "${topicName}" ya está disponible para nuevos videojuegos.`, 'success');
    if (world && typeof world.spawnFloatingRP === 'function') {
        world.spawnFloatingRP(completedTopic?.employeeIndex || 0, 5);
    }
    populateProjectWizard();
    renderHUD(game);
    if (typeof window.renderTopicResearchGrid === 'function') {
        window.renderTopicResearchGrid();
    }
};

game.onGenreResearchCompleted = (genreName, genreId, completedGenre) => {
    showToast(`[[DE_ICON_001]] ¡Género Desbloqueado! "${genreName}" ya está disponible para nuevos videojuegos.`, 'success');
    if (world && typeof world.spawnFloatingRP === 'function') {
        world.spawnFloatingRP(completedGenre?.employeeIndex || 0, 8);
    }
    populateProjectWizard();
    renderHUD(game);
    if (typeof window.renderTopicResearchGrid === 'function') {
        window.renderTopicResearchGrid();
    }
};

// Legacy HTML onclick attributes call these UI actions by name.
window.closeAllModals = closeAllModals;
window.showToast = showToast;
window.populateProjectWizard = populateProjectWizard;
window.updateWizardSynergyBadge = updateWizardSynergyBadge;
window.updateLiveSalesWidget = updateLiveSalesWidget;

document.addEventListener('DOMContentLoaded', () => {
    game.isPaused = true;
    // 1. Initialize 3D World Engine
    world = new WorldEngine('canvas-container');
    world.onNodeClick(on3DNodeClicked);

    // Sync initial character
    world.syncEmployees(game.employees);

    // Initial 3D DAG render
    world.renderScopeDAG3D(scopeDAG, pipelineManager.getActivePipeline());

    // 2. Setup UI Event Listeners & Keyboard Shortcuts
    setupUIControls();
    setupKeyboardShortcuts();
    initializeIPUI({ game, openModal, showToast, genres: GENRES_DATABASE, topics: THEMES_DATABASE });
    initializeRivalUI({ game, openModal });
    financeUI = initializeFinanceUI({ game, openModal, showToast,
        resumeRecovery: () => {
            if (game.prepareBankruptcy().success) return { success:false, message:'La insolvencia sigue sin una solución viable. Revisa las medidas o el procedimiento.' };
            game.financeState.procedurePending = false;
            game.isPaused = false;
            if (game.gameSpeed === 0) game.gameSpeed = 1;
            startSimulationLoops();
            return { success:true, message:'Plan revisado; simulación reanudada.' };
        },
        onBankruptcyCommitted: () => {
            game.financeState.procedurePending = false;
            if (game.financeState.bankruptcy.mode === 'spectator') { game.isPaused = false; startSimulationLoops(); }
            if (saveSystem.getSettings().autosave !== 'off') autosaveCurrentGame();
        }
    });

    // 3. Populate Modal Dropdowns & DAG Architecture
    populateProjectWizard();
    initDAGArchitectureUI();
    initCompanyCreatorModal();
    initializeMainMenu();

    // 4. Bind Game State Listeners
    game.onStateChange((state) => {
        if (appState !== STATE_PLAYING) return;
        renderHUD(state);
        if (world && state.employees.length !== lastRenderedEmployeeCount) {
            lastRenderedEmployeeCount = state.employees.length;
            world.syncEmployees(state.employees);
        }
        (state.pendingHeadhunts || []).forEach(offer => {
            if (notifiedHeadhuntEmployeeIds.has(offer.employeeId)) return;
            notifiedHeadhuntEmployeeIds.add(offer.employeeId);
            showToast(`[[DE_ICON_056]] ${offer.rivalStudio} quiere fichar a ${offer.employeeName}. Responde en ${offer.deadlineWeeksRemaining ?? 3} semanas desde Gestión de Personal.`, 'warn');
        });
        const marketingModal = document.getElementById('modal-marketing');
        if (marketingModal?.classList.contains('active')) updateMarketingHubCounters();
        renderIndustryNews(state);
        updateLiveSalesWidget();
    });

    // 5. Initial Render
    renderHUD(game);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
        game.startNewGameProject({
            name: 'Neon Matrix 1985',
            topicId: 'cyberpunk',
            genreId: 'RPG',
            platformId: 'g64',
            engineId: 'engine_v1',
            targetAudience: 'Mature'
        });
        void enterGameplay();
    }
});

function initializeMainMenu() {
    const settings = saveSystem.getSettings();
    mainMenu = createMainMenu({
        version,
        initialSettings: settings,
        getSlots: () => saveSystem.list(),
        onContinue: loadSavedGame,
        onLoad: loadSavedGame,
        onDelete: id => saveSystem.remove(id),
        onNewGame: () => {
            closeAllModals();
            creatingNewGame = true;
            mainMenu.hidePanel();
            openCompanyCreatorModal(true);
        },
        onSave: saveName => saveSystem.save(game, { saveName }),
        onSettingsChange: patch => applyMenuSettings(saveSystem.updateSettings(patch)),
        onReturnToMenu: returnToMainMenu
    });
    applyMenuSettings(settings);
    world.enterMainMenu();
    mainMenu.show();
}

function applyMenuSettings(settings) {
    if (settings.soundVolume !== appliedSettings?.soundVolume || settings.musicVolume !== appliedSettings?.musicVolume) {
        soundEngine.setVolumes(settings.soundVolume, settings.musicVolume);
    }
    if (settings.resolution !== appliedSettings?.resolution || settings.shadows !== appliedSettings?.shadows) {
        world.setGraphicsSettings(settings);
    }
    appliedSettings = settings;
}

function loadSavedGame(id) {
    if (appState !== STATE_MAIN_MENU) return;
    saveSystem.load(id, game);
    return enterGameplay();
}

async function enterGameplay({ checkpoint = false } = {}) {
    if (appState !== STATE_MAIN_MENU) return;
    appState = STATE_TRANSITION;
    mainMenu.setBusy(true);
    mainMenu.hidePanel();
    closeAllModals();
    scopeDAG = new ScopeDAG(null, { techTreeManager });
    debtManager = new TechnicalDebtModel();
    pipelineManager = new EnginePipelineManager();
    lastExpoYearTriggered = 0;
    lastNotifiedProjectOfferKey = null;
    notifiedHeadhuntEmployeeIds.clear();
    selectedHistoricalTechs.clear();
    window._pausedSpeedForNews = 0;
    if (game.pendingIndustryEvents?.length && game.gameSpeed === 0) game.gameSpeed = 1;

    try {
        lastRenderedEmployeeCount = game.employees.length;
        if (world.currentEra === game.era) {
            world.syncEmployees(game.employees);
            await world.transitionToGameplay();
        } else {
            await world.transitionToGameplay({
                era: game.era,
                revealOffice: () => {
                    world.buildOffice(game.era);
                    world.syncEmployees(game.employees);
                }
            });
        }
        populateProjectWizard();
        updateSpeedButtonsUI(game.gameSpeed);
    } catch (error) {
        appState = STATE_MAIN_MENU;
        if (world.currentEra !== 1) world.buildOffice(1);
        world.syncEmployees(game.employees.slice(0, 1));
        world.enterMainMenu();
        mainMenu.setBusy(false);
        mainMenu.show();
        mainMenu.report(error.message);
        return;
    }
    appState = STATE_PLAYING;
    game.isPaused = Boolean(game.financeState?.procedurePending || (game.financeState?.bankruptcy?.confirmed && game.financeState.bankruptcy.mode === 'end'));
    game.notify();
    mainMenu.hide();
    mainMenu.setBusy(false);
    if (checkpoint && saveSystem.getSettings().autosave !== 'off') autosaveCurrentGame();
    startSimulationLoops();
    if (game.financeState?.procedurePending && !game.financeState?.bankruptcy?.confirmed) game.onBankruptcyProcedureRequired?.();
    else if (game.financeState?.bankruptcy?.confirmed) financeUI?.open();
}

function returnToMainMenu() {
    if (appState !== STATE_PLAYING) return;
    if (saveSystem.getSettings().autosave !== 'off') saveSystem.autosave(game);
    appState = STATE_MAIN_MENU;
    game.isPaused = true;
    clearInterval(devInterval);
    clearInterval(calendarInterval);
    clearInterval(expoPedestrianInterval);
    closeAllModals();
    world.hideScopeDAG();
    const holoHud = document.getElementById('hologram-overlay-bar');
    if (holoHud) holoHud.style.display = 'none';
    if (world.currentEra !== 1) world.buildOffice(1);
    world.syncEmployees(game.employees.slice(0, 1));
    world.enterMainMenu();
    mainMenu.show();
}

let autosaveFailed = false;
function autosaveCurrentGame() {
    try {
        saveSystem.autosave(game);
        autosaveFailed = false;
    } catch (error) {
        if (!autosaveFailed) showToast(error.message, 'warn');
        autosaveFailed = true;
    }
}

// --- SIMULATION LOOP CONTROLLER ---

function startSimulationLoops() {
    clearInterval(devInterval);
    clearInterval(calendarInterval);
    if (game.isPaused) return;

    // Development tick loop (for active projects)
    devInterval = setInterval(() => {
        if (!game.isPaused && game.gameSpeed > 0 && game.currentProject) {
            game.advanceDevTick(world);
        }
    }, 120);

    // Calendar tick loop (advances weeks and processes economic simulation)
    calendarInterval = setInterval(() => {
        if (!game.isPaused && game.gameSpeed > 0) {
            game.advanceCalendar();
            const cadence = appliedSettings.autosave;
            if (cadence === 'weekly' || (cadence === 'monthly' && game.week === 1)) autosaveCurrentGame();
            if (typeof updateLiveSalesWidget === 'function') updateLiveSalesWidget();
            const liveOpsModal = document.getElementById('modal-liveops');
            if (liveOpsModal?.classList.contains('active')) renderLiveOps();
            checkCalendarEvents();
        }
    }, 2800 / (game.gameSpeed || 1));
}

function checkCalendarEvents() {
    // Annual Mega Game Expo in Month 6 (June), Week 1
    if (game.month === 6 && game.week === 1 && lastExpoYearTriggered !== game.year) {
        lastExpoYearTriggered = game.year;
        openModal('modal-expo');
        if (soundEngine) soundEngine.playFanfare(8.5);
    }
}

function setGameSpeed(speed) {
    game.gameSpeed = speed;
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
    });
    startSimulationLoops();
    if (soundEngine) soundEngine.playClick();
}

// --- KEYBOARD SHORTCUTS CONTROLLER ---

function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        if (appState !== STATE_PLAYING) {
            if (e.key === 'Escape' && creatingNewGame) closeAllModals();
            return;
        }
        if (e.defaultPrevented || document.querySelector('dialog[open]')) return;
        // Ignore if user is currently typing inside an input or textarea
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            return;
        }

        const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';

        if (e.code === 'Space') {
            e.preventDefault();
            // Toggle pause / 1x speed
            const newSpeed = game.gameSpeed === 0 ? 1 : 0;
            setGameSpeed(newSpeed);
        } else if (key === '1') {
            setGameSpeed(1);
        } else if (key === '2') {
            setGameSpeed(2);
        } else if (key === '3' || key === '4') {
            setGameSpeed(4);
        } else if (key === 'n') {
            if (!game.currentProject) {
                openModal('modal-new-game');
            } else {
                showToast('Ya tienes un proyecto en desarrollo.', 'warn');
            }
        } else if (key === 'r') {
            renderTechTree();
            openModal('modal-research');
        } else if (key === 'h') {
            renderRecruitment();
            openModal('modal-hire');
        } else if (key === 'c' || key === 'v') {
            renderHistoryAndCharts();
            openModal('modal-history');
        } else if (key === 'g') {
            const modalDag = document.getElementById('modal-scope-dag');
            if (modalDag && modalDag.classList.contains('active')) {
                closeAllModals();
            } else {
                renderDAGNodes();
                updateDAGMetricsUI();
                openModal('modal-scope-dag');
                if (soundEngine && soundEngine.playClick) soundEngine.playClick();
            }
        } else if (key === 'p') {
            openCompanyCreatorModal();
        } else if (key === 'm') {
            const isMuted = soundEngine.toggleMute();
            document.getElementById('audio-toggle').innerText = isMuted ? '[[DE_ICON_111]]' : '[[DE_ICON_008]]';
            showToast(isMuted ? 'Sonido silenciado' : 'Sonido activado', 'info');
        } else if (e.key === 'Escape') {
            closeAllModals();
            if (world && world.scopeDagGroup && world.scopeDagGroup.visible) {
                world.hideScopeDAG();
                const holoHud = document.getElementById('hologram-overlay-bar');
                if (holoHud) holoHud.style.display = 'none';
            }
        }
    });
}

// --- UI EVENT BINDINGS ---

function setupUIControls() {
    // Audio user gesture init
    document.body.addEventListener('click', () => {
        if (soundEngine) soundEngine.resume();
    }, { once: true });

    // Audio Mute toggle
    document.getElementById('audio-toggle').addEventListener('click', () => {
        const isMuted = soundEngine.toggleMute();
        document.getElementById('audio-toggle').innerText = isMuted ? '[[DE_ICON_111]]' : '[[DE_ICON_008]]';
        showToast(isMuted ? 'Sonido silenciado' : 'Sonido activado', 'info');
    });

    // Speed Controls
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const speed = parseInt(e.target.dataset.speed);
            setGameSpeed(speed);
        });
    });

    // Bottom Dock Modals
    document.getElementById('btn-new-game').addEventListener('click', () => {
        if (game.currentProject) {
            showToast('¡Ya tienes un proyecto en desarrollo!', 'warn');
            return;
        }
        if (world) {
            world.hideScopeDAG();
        }
        const holoHud = document.getElementById('hologram-overlay-bar');
        if (holoHud) holoHud.style.display = 'none';
        renderDAGNodes();
        updateDAGMetricsUI();
        openModal('modal-new-game');
    });

    const btnOpenDag = document.getElementById('btn-open-dag');
    if (btnOpenDag) {
        btnOpenDag.addEventListener('click', () => {
            renderDAGNodes();
            updateDAGMetricsUI();
            openModal('modal-scope-dag');
        });
    }

    const btnHudOpenDag = document.getElementById('btn-hud-open-dag');
    if (btnHudOpenDag) {
        btnHudOpenDag.addEventListener('click', () => {
            renderDAGNodes();
            updateDAGMetricsUI();
            openModal('modal-scope-dag');
        });
    }

    const btnOpenPipelineModal = document.getElementById('btn-open-pipeline-modal');
    if (btnOpenPipelineModal) {
        btnOpenPipelineModal.addEventListener('click', () => {
            renderPipelineSelector();
            openModal('modal-tech-pipeline');
        });
    }

    const btnDagModalRefactor = document.getElementById('btn-dag-modal-refactor');
    if (btnDagModalRefactor) {
        btnDagModalRefactor.addEventListener('click', () => {
            if (!game.currentProject) {
                showToast('Inicia un proyecto para refactorizar deuda técnica activa durante el desarrollo.', 'warn');
                return;
            }
            const res = game.refactorTechDebt();
            if (res && res.success) {
                renderHUD(game);
                updateDAGMetricsUI();
                showToast(`[[DE_ICON_058]] ${res.message}`, 'success');
            } else if (res && !res.success) {
                showToast(res.message, 'warn');
            }
        });
    }

    document.getElementById('btn-research').addEventListener('click', () => {
        renderTechTree();
        openModal('modal-research');
    });

    document.getElementById('btn-hire').addEventListener('click', () => {
        renderRecruitment();
        openModal('modal-hire');
    });

    document.getElementById('btn-history').addEventListener('click', () => {
        renderHistoryAndCharts();
        openModal('modal-history');
    });

    document.getElementById('btn-liveops').addEventListener('click', () => {
        renderLiveOps();
        openModal('modal-liveops');
    });

    document.getElementById('btn-marketing').addEventListener('click', () => {
        renderMarketingHub();
        openModal('modal-marketing');
    });

    document.getElementById('btn-community-workshop').addEventListener('click', () => {
        renderCommunityWorkshop();
        openModal('modal-community-workshop');
    });

    const businessOptions = document.getElementById('business-model-options');
    if (businessOptions) businessOptions.addEventListener('change', renderBusinessModelSelector);
    const projectTopic = document.getElementById('select-topic');
    if (projectTopic) projectTopic.addEventListener('change', () => {
        updateWizardSynergyBadge();
    });
    const projectGenre = document.getElementById('select-genre');
    if (projectGenre) projectGenre.addEventListener('change', () => {
        renderPipelineSelector();
        renderPublishingContractSelector();
        renderBusinessModelSelector();
        updateWizardSynergyBadge();
    });
    const projectPlatform = document.getElementById('select-platform');
    if (projectPlatform) projectPlatform.addEventListener('change', () => {
        updatePlatformDetails();
        renderPublishingContractSelector();
    });

    // Delegación de eventos para botones de Marketing y Streamers (evita desenganche al repintar)
    document.addEventListener('click', (e) => {
        const mktBtn = e.target.closest('.btn-run-marketing');
        if (mktBtn && !mktBtn.hasAttribute('onclick')) {
            e.preventDefault();
            e.stopPropagation();
            const methodId = mktBtn.dataset.methodId;
            if (methodId && typeof window.runMarketingMethod === 'function') {
                window.runMarketingMethod(methodId);
            }
            return;
        }

        const keyBtn = e.target.closest('.btn-send-streamer-key');
        if (keyBtn) {
            e.preventDefault();
            e.stopPropagation();
            const creatorId = keyBtn.dataset.creatorId || keyBtn.getAttribute('onclick')?.match(/sendMarketingKeys\(['"]([^'"]+)['"]\)/)?.[1];
            if (creatorId && typeof window.sendMarketingKeys === 'function') {
                window.sendMarketingKeys(creatorId);
            }
            return;
        }
    });

    const studioInfoBtn = document.getElementById('studio-info-btn');
    if (studioInfoBtn) {
        studioInfoBtn.addEventListener('click', () => {
            openCompanyCreatorModal();
        });
    }

    const editProfileBtn = document.getElementById('btn-edit-profile');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            openCompanyCreatorModal();
        });
    }

    const toggleHoloBtn = document.getElementById('btn-toggle-hologram');
    if (toggleHoloBtn) {
        toggleHoloBtn.addEventListener('click', () => {
            if (!world) return;
            if (world.scopeDagGroup && world.scopeDagGroup.visible) {
                world.hideScopeDAG();
                const holoHud = document.getElementById('hologram-overlay-bar');
                if (holoHud) holoHud.style.display = 'none';
                showToast('[[DE_ICON_035]] Proyección 3D apagada. Vista de oficina restaurada.', 'info');
            } else {
                const pipe = pipelineManager.getActivePipeline();
                world.showScopeDAG(scopeDAG, pipe);
                const holoHud = document.getElementById('hologram-overlay-bar');
                if (holoHud) holoHud.style.display = 'flex';
                showToast('[[DE_ICON_020]] Mesa Holográfica 3D activada.', 'info');
            }
            if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        });
    }

    document.getElementById('btn-upgrade-office').addEventListener('click', () => {
        handleOfficeUpgrade();
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(elem => {
        elem.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
                closeAllModals();
                if (world && world.scopeDagGroup && world.scopeDagGroup.visible) {
                    world.hideScopeDAG();
                    const holoHud = document.getElementById('hologram-overlay-bar');
                    if (holoHud) holoHud.style.display = 'none';
                }
            }
        });
    });

    // Project Wizard Form Submission
    document.getElementById('form-new-game').addEventListener('submit', (e) => {
        e.preventDefault();
        startProjectFromWizard();
    });

    // Dev Sliders Live Update (Across all 3 stages)
    ['stage1', 'stage2', 'stage3'].forEach(stage => {
        const sliders = document.querySelectorAll(`[data-stage="${stage}"]`);
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                const valLabel = document.getElementById(`val-${e.target.name}`);
                if (valLabel) {
                    valLabel.innerText = Math.round(val * 100) + '%';
                }
                if (game.currentProject) {
                    const currentSliders = game.currentProject.sliders[stage];
                    if (currentSliders) {
                        currentSliders[e.target.name] = val;
                    }
                }
            });
        });
    });

    // Finish / Release Button
    document.getElementById('btn-release-game').addEventListener('click', () => {
        if (world) {
            world.hideScopeDAG();
        }
        const holoHud = document.getElementById('hologram-overlay-bar');
        if (holoHud) holoHud.style.display = 'none';
        let releasedGame;
        if (game.currentProject?.businessModel === 'early_access') {
            if (game.currentProject.launchPhase === 'beta_live') {
                const result = game.launchOfficialVersion(game.currentProject.earlyAccessGameId);
                if (!result.success) { showToast(result.message, 'warn'); return; }
                releasedGame = result.game;
            } else if (game.currentProject.overallProgress >= 50 && game.currentProject.overallProgress <= 80) {
                const result = game.launchEarlyAccess();
                if (!result.success) { showToast(result.message, 'warn'); return; }
                releasedGame = result.game;
            } else if (game.currentProject.stage === 4) {
                game.currentProject.businessModel = 'premium';
                releasedGame = game.finishAndReleaseGame();
            }
        } else {
            releasedGame = game.finishAndReleaseGame();
        }
        if (releasedGame) {
            world.triggerLaunchConfetti();
            updateLiveSalesWidget();
            showReviewModal(releasedGame);
        }
    });

    // Toggle Refactor Mode (Punto 4: [[[DE_ICON_112]] Refactorizar Código])
    const refactorBtn = document.getElementById('btn-toggle-refactor');
    if (refactorBtn) {
        refactorBtn.addEventListener('click', () => {
            if (!game.currentProject) {
                showToast('No hay ningún proyecto en marcha para refactorizar.', 'warn');
                return;
            }
            const res = game.refactorTechDebt();
            if (res.mode === 'refactor') {
                showToast('[[DE_ICON_015]] Modo Refactorizar Activado: El avance de características se detiene (Progreso = 0%) para pagar deuda técnica.', 'success');
            } else {
                showToast('[[DE_ICON_113]] Modo Normal Reanudado: El equipo continúa implementando características del juego.', 'info');
            }
            if (soundEngine) soundEngine.playClick();
            renderHUD(game);
        });
    }

    // Fix Regression Emergency Button
    const fixRegBtn = document.getElementById('btn-fix-regression-now');
    if (fixRegBtn) {
        fixRegBtn.addEventListener('click', () => {
            if (game.currentProject) {
                game.setProjectDevMode('refactor');
                showToast('[[DE_ICON_015]] Refactorización de emergencia activada para sanear el módulo desestabilizado.', 'warn');
                renderHUD(game);
            }
        });
    }

    // Post-Launch Emergency Patch Action Button (Punto 5)
    const btnDeployPatch = document.getElementById('btn-deploy-emergency-patch');
    if (btnDeployPatch) {
        btnDeployPatch.addEventListener('click', () => {
            const res = game.deployEmergencyPatch();
            if (res.success) {
                showToast(res.message, 'success');
                if (world && world.triggerLaunchConfetti) world.triggerLaunchConfetti();
            } else {
                showToast(res.message, 'warn');
            }
            renderHUD(game);
        });
    }

    // Initialize Game Dev Tycoon Contextual Developer Menu
    setupDeveloperContextMenu();
}

// --- GAME DEV TYCOON DEVELOPER CONTEXT MENU CONTROLLER ---

let selectedDevIndex = 0;

function setupDeveloperContextMenu() {
    const contextMenu = document.getElementById('developer-context-menu');
    if (!contextMenu) return;

    const menuName = document.getElementById('gdt-menu-name');
    const menuRole = document.getElementById('gdt-menu-role');
    const menuAvatar = document.getElementById('gdt-menu-avatar');
    const staminaVal = document.getElementById('gdt-menu-stamina-val');
    const staminaFill = document.getElementById('gdt-menu-stamina-fill');
    const btnClose = document.getElementById('gdt-menu-close');

    const btnNewGame = document.getElementById('gdt-btn-new-game');
    const btnResearch = document.getElementById('gdt-btn-research');
    const btnTopicResearch = document.getElementById('gdt-btn-topic-research');
    const btnEngine = document.getElementById('gdt-btn-engine');
    const btnRest = document.getElementById('gdt-btn-rest');
    const btnStats = document.getElementById('gdt-btn-stats');

    // 1. Listen for 3D raycast developer selection event
    window.addEventListener('developer-selected', (e) => {
        const { index, screenX, screenY } = e.detail;
        selectedDevIndex = (typeof index === 'number') ? index : 0;
        const emp = (game.employees && game.employees[selectedDevIndex]) ? game.employees[selectedDevIndex] : (game.employees ? game.employees[0] : null);

        if (emp) {
            if (menuName) menuName.textContent = emp.name || 'Desarrollador';
            if (menuRole) menuRole.textContent = emp.role || 'Desarrollador General';
            if (menuAvatar) {
                const r = emp.role ? emp.role.toLowerCase() : '';
                menuAvatar.textContent = r.includes('arte') || r.includes('diseño') ? '[[DE_ICON_019]]' : (r.includes('qa') || r.includes('tester') ? '[[DE_ICON_021]]' : (r.includes('sonido') || r.includes('audio') ? '[[DE_ICON_114]]' : '[[DE_ICON_026]]'));
            }

            const currentStamina = typeof emp.stamina === 'number' ? emp.stamina : 100;
            const maxStamina = typeof emp.maxStamina === 'number' ? emp.maxStamina : 100;
            const staminaPct = Math.max(0, Math.min(100, Math.round((currentStamina / maxStamina) * 100)));

            if (staminaVal) staminaVal.textContent = `${staminaPct}%`;
            if (staminaFill) {
                staminaFill.style.width = `${staminaPct}%`;
                if (staminaPct > 55) {
                    staminaFill.style.background = 'linear-gradient(90deg, #10b981, #05f082)';
                } else if (staminaPct > 25) {
                    staminaFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
                } else {
                    staminaFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
                }
            }
        }

        // Clamp menu coordinates into viewport bounds
        const menuWidth = 270;
        const menuHeight = 370;
        let left = screenX - (menuWidth / 2);
        let top = screenY - menuHeight - 14; // Float slightly above character

        if (top < 70) {
            top = screenY + 24; // If too close to top bar, open below
        }

        left = Math.max(16, Math.min(window.innerWidth - menuWidth - 16, left));
        top = Math.max(64, Math.min(window.innerHeight - menuHeight - 60, top));

        contextMenu.style.left = `${left}px`;
        contextMenu.style.top = `${top}px`;
        contextMenu.style.display = 'block';

        if (soundEngine && soundEngine.playClick) {
            soundEngine.playClick();
        }
    });

    // 2. Close on click on empty 3D space
    window.addEventListener('world-clicked-empty', () => {
        contextMenu.style.display = 'none';
    });

    // 3. Close button
    if (btnClose) {
        btnClose.addEventListener('click', (e) => {
            e.stopPropagation();
            contextMenu.style.display = 'none';
        });
    }

    // 4. Action: Nuevo Proyecto / Desarrollar Juego
    if (btnNewGame) {
        btnNewGame.addEventListener('click', (e) => {
            e.stopPropagation();
            contextMenu.style.display = 'none';
            if (game.currentProject) {
                showToast('¡Ya tienes un proyecto en desarrollo!', 'warn');
                return;
            }
            if (world) {
                world.hideScopeDAG();
            }
            const holoHud = document.getElementById('hologram-overlay-bar');
            if (holoHud) holoHud.style.display = 'none';
            renderPipelineSelector();
            renderDAGNodes();
            updateDAGMetricsUI();
            openModal('modal-new-game');
            if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        });
    }

    // 5. Action: Investigar Tecnología (I+D)
    if (btnResearch) {
        btnResearch.addEventListener('click', (e) => {
            e.stopPropagation();
            contextMenu.style.display = 'none';
            renderTechTree();
            openModal('modal-research');
            if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        });
    }

    // 6. Action: Desarrollar / Mantener Motor Propio
    if (btnEngine) {
        btnEngine.addEventListener('click', (e) => {
            e.stopPropagation();
            contextMenu.style.display = 'none';
            renderTechTree();
            openModal('modal-research');
            if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        });
    }

    // 6b. Action: Investigar Temática Nueva (Subagente 2)
    if (btnTopicResearch) {
        btnTopicResearch.addEventListener('click', (e) => {
            e.stopPropagation();
            contextMenu.style.display = 'none';
            window.openTopicResearchModal();
            if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        });
    }

    // 7. Action: Tomar Descanso / Enviar de Vacaciones
    if (btnRest) {
        btnRest.addEventListener('click', (e) => {
            e.stopPropagation();
            contextMenu.style.display = 'none';
            const emp = (game.employees && game.employees[selectedDevIndex]) ? game.employees[selectedDevIndex] : (game.employees ? game.employees[0] : null);
            if (emp) {
                const restResult = game.sendOnVacation(emp.id);
                if (!restResult.success) {
                    showToast(restResult.message, 'warn');
                    return;
                }
                emp.crunchActive = false;

                if (world && world.characters && world.characters[selectedDevIndex]) {
                    const charObj = world.characters[selectedDevIndex];
                    charObj.state = 'celebrating';
                    charObj.stateUntil = world.clock.elapsedTime + 2.4;
                }

                if (world && world.triggerLaunchConfetti) {
                    world.triggerLaunchConfetti();
                }
                if (soundEngine && soundEngine.playLevelUp) {
                    soundEngine.playLevelUp();
                }

                showToast(restResult.message, 'success');
                renderHUD(game);
            }
        });
    }

    // 8. Action: Ver Habilidades y Estado del Empleado
    if (btnStats) {
        btnStats.addEventListener('click', (e) => {
            e.stopPropagation();
            contextMenu.style.display = 'none';
            renderRecruitment();
            openModal('modal-hire');
            const selectedEmployeeId = game.employees[selectedDevIndex]?.id;
            const selectedCard = selectedEmployeeId ? document.querySelector(`#current-team-list [data-employee-id="${selectedEmployeeId}"]`) : null;
            selectedCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            selectedCard?.classList.add('hr-selected-employee');
            if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        });
    }

    // Close when clicking outside of the menu
    document.addEventListener('pointerdown', (e) => {
        if (contextMenu.style.display !== 'none' && !contextMenu.contains(e.target)) {
            const canvasEl = document.getElementById('canvas-container');
            if (!canvasEl || !canvasEl.contains(e.target)) {
                contextMenu.style.display = 'none';
            }
        }
    });
}

// --- POPULATE WIZARDS & DROPDOWNS ---

function populateProjectWizard() {
    const topicSelect = document.getElementById('select-topic');
    if (!topicSelect) return;
    const currentYear = game.getHistoricalYear ? game.getHistoricalYear() : 1982;
    const priorTopicVal = topicSelect.value;
    topicSelect.innerHTML = '';

    const unlockedTopicList = (game.unlockedTopicIds || []).map(id => id.toLowerCase());

    THEMES_DATABASE.forEach(t => {
        // Subagente 3: Ocultar temáticas que pertenezcan a eras futuras
        if (t.unlockedYear > currentYear) return;

        const opt = document.createElement('option');
        opt.value = t.id;
        const isUnlocked = unlockedTopicList.includes(t.id.toLowerCase()) || (t.aliases && t.aliases.some(a => unlockedTopicList.includes(a.toLowerCase())));
        if (isUnlocked) {
            opt.innerText = `${t.name} [Target: ${t.idealAudience}]`;
        } else {
            opt.innerText = `[[DE_ICON_093]] ${t.name} (I+D: ${t.costRP || 20} RP)`;
            opt.disabled = true;
        }
        topicSelect.appendChild(opt);
    });

    if (priorTopicVal && Array.from(topicSelect.options).some(o => o.value === priorTopicVal && !o.disabled)) {
        topicSelect.value = priorTopicVal;
    } else {
        const firstActive = Array.from(topicSelect.options).find(o => !o.disabled);
        if (firstActive) topicSelect.value = firstActive.value;
    }

    const genreSelect = document.getElementById('select-genre');
    if (!genreSelect) return;
    const priorGenreVal = genreSelect.value;
    genreSelect.innerHTML = '';

    const unlockedGenreList = (game.unlockedGenreIds || []).map(id => id.toLowerCase());

    GENRES_DATABASE.forEach(g => {
        // Subagente 3: Ocultar géneros que pertenezcan a eras futuras
        if (g.unlockedYear > currentYear) return;

        const opt = document.createElement('option');
        opt.value = g.id;
        const isUnlocked = unlockedGenreList.includes(g.id.toLowerCase()) || (g.aliases && g.aliases.some(a => unlockedGenreList.includes(a.toLowerCase())));
        if (isUnlocked) {
            opt.innerText = g.name;
        } else {
            opt.innerText = `[[DE_ICON_093]] ${g.name} (I+D: ${g.costRP || 30} RP)`;
            opt.disabled = true;
        }
        genreSelect.appendChild(opt);
    });

    if (priorGenreVal && Array.from(genreSelect.options).some(o => o.value === priorGenreVal && !o.disabled)) {
        genreSelect.value = priorGenreVal;
    } else {
        const firstActive = Array.from(genreSelect.options).find(o => !o.disabled);
        if (firstActive) genreSelect.value = firstActive.value;
    }

    updatePlatformOptions();
    updateEngineOptions();
    updateWizardSynergyBadge();
}

function updateWizardSynergyBadge() {
    const indicator = document.getElementById('wizard-synergy-indicator');
    if (!indicator) return;
    const topicSelect = document.getElementById('select-topic');
    const genreSelect = document.getElementById('select-genre');
    if (!topicSelect || !genreSelect) return;

    const topicId = topicSelect.value;
    const genreId = genreSelect.value;
    if (!topicId || !genreId) {
        indicator.innerHTML = '';
        return;
    }

    const topicObj = findTheme(topicId);
    const genreObj = findGenre(genreId);
    const syn = calculateSynergy(genreId, topicId);

    // Tech requirement check
    const activeNodeIds = scopeDAG
        ? (typeof scopeDAG.getActiveNodeIds === 'function'
            ? scopeDAG.getActiveNodeIds()
            : (typeof scopeDAG.getActiveNodes === 'function'
                ? scopeDAG.getActiveNodes().map(n => n.id)
                : Array.from(scopeDAG.nodes ? scopeDAG.nodes.keys() : [])))
        : [];

    const techCheck = typeof game.validateGenreTechRequirements === 'function' ? game.validateGenreTechRequirements(genreId, {
        dagConfig: pipelineManager?.getActivePipeline ? { pipeline: pipelineManager.getActivePipeline() } : null,
        selectedNodeIds: activeNodeIds
    }) : { valid: true };

    let pillClass = 'pill-normal';
    let pillIcon = '[[DE_ICON_097]]';
    let pillText = `Sinergia Estándar (1.0x): Combinación neutral entre ${topicObj?.name || topicId} y ${genreObj?.name || genreId}.`;

    if (syn.fit === 'OPTIMAL') {
        pillClass = 'pill-optimal';
        pillIcon = '[[DE_ICON_040]]';
        pillText = `Sinergia Óptima (+35% Ventas y Hype): ¡${topicObj?.name || topicId} y ${genreObj?.name || genreId} encajan a la perfección!`;
    } else if (syn.fit === 'BAD') {
        pillClass = 'pill-bad';
        pillIcon = '[[DE_ICON_016]]';
        pillText = `Mala Sinergia (-40% Penalización): ${topicObj?.name || topicId} no conecta con la audiencia de ${genreObj?.name || genreId}.`;
    }

    let techWarning = '';
    if (!techCheck.valid) {
        techWarning = `<div class="wizard-tech-warning">[[DE_ICON_093]] ${techCheck.message}</div>`;
    }

    indicator.innerHTML = `
        <div class="synergy-pill ${pillClass}">
            <span class="synergy-pill-icon">${pillIcon}</span>
            <div class="synergy-pill-content">
                <strong>${pillText}</strong>
                <small>Público Ideal del Tema: <b>${topicObj?.idealAudience || 'General'}</b></small>
            </div>
        </div>
        ${techWarning}
    `;
}

function renderHistoricalGraph(frame = false) {
    const available = TECH_TREE_NODES.filter(n => n.eraYear <= game.getHistoricalYear() && techTreeManager.isUnlocked(n.id));
    if (!available.length) return false;
    const minYear = Math.min(...available.map(n => n.eraYear));
    const maxYear = Math.max(...available.map(n => n.eraYear));
    const centerYear = (minYear + maxYear) / 2;
    const categories = ['Graphics', 'Audio', 'Engine', 'Physics', 'AI', 'Network'];
    const nodes = available.map(n => ({
        ...n,
        // 2.4 units per year exceeds the width of the 1.7-unit labels.
        // Simultaneous nodes occupy separate vertical lanes within the category.
        pos: [(n.eraYear - centerYear) * 2.4, 2 + categories.indexOf(n.category) * 3 + (n.position.z / 5) * 1.2, 0],
        prerequisites: n.requiredNodes,
        state: selectedHistoricalTechs.has(n.id) ? 'active' : 'available'
    }));
    world.renderScopeDAG3D(nodes, []);
    if (frame) {
        const width = Math.max(8, (maxYear - minYear) * 2.4 + 4);
        const height = 21;
        const halfFov = world.camera.fov * Math.PI / 360;
        const distance = Math.max(height / (2 * Math.tan(halfFov)), width / (2 * Math.tan(halfFov) * world.camera.aspect)) + 10;
        world.camera.far = Math.max(world.camera.far, distance + 80);
        world.camera.updateProjectionMatrix();
        world.controls.maxDistance = Math.max(35, distance + 20);
        world.targetCamPos = world.cameraDagPos.clone().set(0, 10.5, distance);
        world.targetLookAt = world.cameraDagTarget.clone().set(0, 10.5, 0);
    }
    return true;
}

function initDAGArchitectureUI() {
    renderPipelineSelector();
    renderDAGNodes();
    updateDAGMetricsUI();

    document.getElementById('btn-historical-graph')?.addEventListener('click', () => {
        if (!world) return;
        if (!TECH_TREE_NODES.some(n => n.eraYear <= game.getHistoricalYear() && techTreeManager.isUnlocked(n.id))) { showToast('Investiga tecnologías históricas para verlas en el grafo.', 'warn'); return; }
        closeAllModals();
        world.showScopeDAG();
        renderHistoricalGraph(true);
        const hud = document.getElementById('hologram-overlay-bar');
        if (hud) hud.style.display = 'flex';
        showToast('Grafo histórico: selecciona módulos haciendo clic en ellos.', 'info');
    });

    // Preset buttons binding (works in both #modal-new-game and #modal-scope-dag)
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const presetId = e.currentTarget.getAttribute('data-preset') || e.currentTarget.dataset.preset;
            if (presetId) {
                applyDAGPreset(presetId);
            }
        });
    });

    const btn3D = document.getElementById('btn-dag-preview-3d');
    if (btn3D) {
        btn3D.addEventListener('click', () => {
            closeAllModals();
            const activePipe = pipelineManager.getActivePipeline();
            if (world) {
                world.showScopeDAG(scopeDAG, activePipe);
            }
            const holoHud = document.getElementById('hologram-overlay-bar');
            if (holoHud) holoHud.style.display = 'flex';
            showToast('[[DE_ICON_020]] Mesa Holográfica 3D encendida. Haz clic en los nodos para configurarlos.', 'info');
            if (soundEngine && soundEngine.playNodeToggle) {
                soundEngine.playNodeToggle(true);
            }
        });
    }

    const btnModal3D = document.getElementById('btn-dag-modal-view-3d');
    if (btnModal3D) {
        btnModal3D.addEventListener('click', () => {
            closeAllModals();
            const activePipe = pipelineManager.getActivePipeline();
            if (world) {
                world.showScopeDAG(scopeDAG, activePipe);
            }
            const holoHud = document.getElementById('hologram-overlay-bar');
            if (holoHud) holoHud.style.display = 'flex';
            showToast('[[DE_ICON_020]] Mesa Holográfica 3D encendida.', 'info');
            if (soundEngine && soundEngine.playNodeToggle) {
                soundEngine.playNodeToggle(true);
            }
        });
    }

    const btnReturnEditor = document.getElementById('btn-holo-return-editor');
    if (btnReturnEditor) {
        btnReturnEditor.addEventListener('click', () => {
            if (world) world.hideScopeDAG();
            const holoHud = document.getElementById('hologram-overlay-bar');
            if (holoHud) holoHud.style.display = 'none';
            renderDAGNodes();
            updateDAGMetricsUI();
            openModal('modal-new-game');
            if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        });
    }

    const btnHoloClose = document.getElementById('btn-holo-close');
    if (btnHoloClose) {
        btnHoloClose.addEventListener('click', () => {
            if (world) world.hideScopeDAG();
            const holoHud = document.getElementById('hologram-overlay-bar');
            if (holoHud) holoHud.style.display = 'none';
            showToast('[[DE_ICON_035]] Proyección apagada. Vista normal de oficina restaurada.', 'info');
            if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        });
    }
}

window.selectPipelineFromModal = function(pipeId) {
    const picked = pipelineManager.availablePipelines.find(p => p.id === pipeId);
    if (picked && picked.type === 'commercial' && game.getHistoricalYear() < (picked.minYear || 1990)) {
        showToast(`Los motores comerciales estarán disponibles a partir de ${picked.minYear || 1990}.`, 'warn');
        return;
    }
    pipelineManager.selectPipeline(pipeId);
    const activePipe = pipelineManager.getActivePipeline();
    if (!activePipe) return;
    debtManager.setBaseDebt(activePipe.baseDebtFloor);
    if (activePipe.type === 'commercial') {
        (activePipe.unlockedNodes || []).forEach(nodeId => techTreeManager.unlockTech(nodeId));
    }
    renderPipelineSelector();
    renderDAGNodes();
    updateDAGMetricsUI();
    if (world && world.renderScopeDAG3D) {
        world.renderScopeDAG3D(scopeDAG, activePipe);
    }
    if (soundEngine && soundEngine.playClick) {
        soundEngine.playClick();
    }
    showToast(`Pipeline configurado: ${activePipe.name}`, 'success');
};

function renderPipelineSelector() {
    const container = document.getElementById('pipeline-selector-container');
    const historicalYear = game && game.getHistoricalYear ? game.getHistoricalYear() : 1982;
    const owned = (game && game.inHouseEngines) || [];
    const commercial = (game && game.commercialEngines) || [];
    pipelineManager.availablePipelines = [
        ...owned.map(engine => ({
            ...engine,
            type: 'inhouse',
            desc: `Motor propio v${engine.version || 1}.0. 0% royalties; especialidades: ${(engine.affineGenres || []).join(', ') || 'generalista'}; modernidad ${Math.round(engine.getEfficiency ? engine.getEfficiency(game.year, game.week) * 100 : 100)}%.`,
            royaltyPercent: 0,
            royaltyRate: 0,
            baseDebtFloor: 0,
            frictionMultiplier: engine.getFrictionMultiplier
                ? engine.getFrictionMultiplier(document.getElementById('select-genre')?.value || 'Action', game.year, game.week)
                : 0.5,
            unlockedNodes: engine.bakedNodes || []
        })),
        ...commercial.filter(engine => historicalYear >= (engine.minYear || 1990)).map(engine => ({
            ...engine,
            type: 'commercial',
            royaltyPercent: Math.round((engine.royaltyRate || 0) * 100),
            baseDebtFloor: engine.bloatwareDebtFloor || 15,
            frictionMultiplier: 1 - (engine.baseDevTimeReduction || 0.2),
            unlockedNodes: engine.unlockedNodes || []
        }))
    ];
    if (!pipelineManager.availablePipelines.some(p => p.id === pipelineManager.selectedPipelineId)) {
        pipelineManager.selectedPipelineId = pipelineManager.availablePipelines[0]?.id || null;
    }
    const selectedId = pipelineManager.selectedPipelineId;

    if (container) {
        container.innerHTML = '';
        if (pipelineManager.availablePipelines.length === 0) {
            container.innerHTML = `<div class="pipeline-card"><strong>[[DE_ICON_094]] Aún no tienes un motor propio</strong><p style="font-size:12px;color:var(--text-secondary)">En esta época no hay motores comerciales. Abre I+D y completa un proyecto de motor propio antes de iniciar un juego.</p></div>`;
        }
        pipelineManager.availablePipelines.forEach(pipe => {
            const card = document.createElement('div');
            const isCommercial = pipe.type === 'commercial';
            const isSelected = pipe.id === selectedId;
            card.className = 'pipeline-card' + (isSelected ? ' active' : '');
            card.innerHTML = `
                <div>
                    <span class="pipeline-badge ${isCommercial ? 'badge-commercial' : 'badge-inhouse'}">
                        ${isCommercial ? '[[DE_ICON_022]] Motor Comercial' : '[[DE_ICON_059]] Motor Propio (In-House)'}
                    </span>
                    <strong style="display: block; font-size: 14px; color: #fff; margin-bottom: 4px;">${pipe.name}</strong>
                    <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">${pipe.desc}</p>
                </div>
                <div style="margin-top: 10px; font-size: 12px; font-weight: 700; color: ${isCommercial ? 'var(--accent-gold)' : 'var(--accent-green)'};">
                    ${isCommercial ? `Royalties: ${pipe.royaltyPercent}% | Deuda Base: ${pipe.baseDebtFloor} pts (Bloatware)` : `0% Royalties | -50% Fricción | Licencias a Terceros`}
                </div>
            `;
            card.addEventListener('click', () => {
                window.selectPipelineFromModal(pipe.id);
            });
            container.appendChild(card);
        });
    }

    const modalContainer = document.querySelector('#modal-tech-pipeline .pipeline-modal-grid');
    if (modalContainer && container) {
        modalContainer.innerHTML = container.innerHTML;
        modalContainer.querySelectorAll('.pipeline-card').forEach((card, index) => {
            const pipe = pipelineManager.availablePipelines[index];
            if (pipe) card.addEventListener('click', () => window.selectPipelineFromModal(pipe.id));
        });
    }

    // Also synchronize cards in #modal-tech-pipeline
    const commCard = document.getElementById('pipe-card-commercial');
    const inhouseCard = document.getElementById('pipe-card-inhouse');
    const btnComm = document.getElementById('btn-select-commercial');
    const btnInhouse = document.getElementById('btn-select-inhouse');

    if (commCard && inhouseCard) {
        const isComm = pipelineManager.availablePipelines.find(p => p.id === selectedId)?.type === 'commercial';
        commCard.classList.toggle('active', isComm);
        inhouseCard.classList.toggle('active', !isComm);

        if (btnComm) {
            btnComm.innerText = isComm ? '[[DE_ICON_149]] Motor Comercial Activo' : 'Seleccionar Motor Comercial';
            btnComm.className = 'dock-btn btn-pipeline-select' + (isComm ? ' btn-primary-action' : '');
        }
        if (btnInhouse) {
            btnInhouse.innerText = !isComm ? '[[DE_ICON_149]] Motor Propio Activo' : 'Seleccionar Motor Propio';
            btnInhouse.className = 'dock-btn btn-pipeline-select' + (!isComm ? ' btn-primary-action' : '');
        }
    }
}

function renderBusinessModelSelector() {
    const container = document.getElementById('business-model-options');
    if (!container || !game || !scopeDAG) return;
    let selectedModel = document.querySelector('input[name="business-model"]:checked')?.value || 'premium';
    const selectedNodes = Array.from(scopeDAG.selectedNodeIds);
    const options = game.getBusinessModelOptions(selectedNodes);
    if (!options.some(option => option.id === selectedModel && option.available)) selectedModel = 'premium';
    const year = game.getHistoricalYear();
    const note = document.getElementById('business-model-year-note');
    if (note) note.textContent = `Año ${year}. Las opciones futuras muestran su fecha de desbloqueo; F2P exige nodo de red online investigado y seleccionado.`;
    container.innerHTML = options.map(option => {
        const selected = selectedModel === option.id;
        const unavailable = !option.available;
        const lock = unavailable ? (option.lockedYear ? `[[DE_ICON_093]] Disponible en ${option.year}` : `[[DE_ICON_093]] ${option.requirement || `Disponible en ${option.year}`}`) : 'Disponible';
        return `<label class="business-model-card ${selected ? 'selected' : ''} ${unavailable ? 'locked' : ''}"><input type="radio" name="business-model" value="${option.id}" ${selected ? 'checked' : ''} ${unavailable ? 'disabled' : ''}><span class="business-model-title">${option.label}</span><span class="business-model-description">${option.detail}</span><span class="business-model-lock">${lock}</span></label>`;
    }).join('');

    const contentSelect = document.getElementById('select-post-launch-content');
    if (contentSelect) {
        const prior = contentSelect.value || 'none';
        const allContentOptions = [
            { id: 'none', title: 'Sin contenido de pago', year: 1982 },
            { id: 'expansion', title: 'Expansión grande en disco', year: 1995 },
            { id: 'dlc', title: 'DLC digital menor', year: 2005 },
            { id: 'season_pass', title: 'Pase de Temporada', year: 2005 }
        ];
        const contentOptions = ['f2p', 'live_service'].includes(selectedModel) ? [allContentOptions[0]] : allContentOptions;
        contentSelect.innerHTML = contentOptions.map(item => {
            const locked = year < item.year;
            return `<option value="${item.id}" ${locked ? 'disabled' : ''}>${locked ? '[[DE_ICON_093]] ' : ''}${item.title}${item.year > 1982 ? ` · ${item.year}` : ''}</option>`;
        }).join('');
        const priorOption = contentOptions.find(item => item.id === prior);
        contentSelect.value = priorOption && priorOption.year <= year ? prior : 'none';
    }
    const monetization = document.getElementById('f2p-monetization-options');
    if (monetization) monetization.style.display = ['f2p', 'live_service'].includes(selectedModel) ? 'block' : 'none';
    const patchSupport = document.getElementById('toggle-postlaunch-patches');
    if (patchSupport) {
        patchSupport.disabled = year < 1995;
        if (year < 1995) patchSupport.checked = false;
        const patchLabel = patchSupport.closest('label');
        if (patchLabel) patchLabel.lastChild.textContent = year < 1995
            ? ' [[DE_ICON_093]] Parches rudimentarios disponibles desde 1995'
            : ' Mantener soporte post-lanzamiento con parches';
    }
}

function renderPublishingContractSelector() {
    const container = document.getElementById('publishing-contract-options');
    if (!container || !game) return;

    const year = game.getHistoricalYear();
    const currentSelected = document.querySelector('input[name="publishing-contract"]:checked')?.value || 'self_publishing';

    // Estimación dinámica de costes y anticipos según época y plataforma
    const platformSelect = document.getElementById('select-platform');
    const platformId = platformSelect ? platformSelect.value : (game.platforms[0]?.id || 'pc_compatibles');
    const platform = (game.platforms || []).find(p => p.id === platformId) || game.platforms[0] || { devCost: 5000, name: 'PC' };
    const kitCost = typeof game.getDevKitCost === 'function' ? game.getDevKitCost(platform) : platform.devCost;
    const baseDevCost = kitCost + (game.era === 1 ? 4000 : (game.era === 2 ? 14000 : 35000));

    // Anticipos calculados
    const publisherAdvance = Math.max(15000, Math.round(baseDevCost * 0.65));
    const platformGrant = Math.max(10000, Math.round(baseDevCost * 0.40));
    const publisherName = year <= 1994 ? 'Distribuidora Nacional de Cartuchos' : (year <= 2012 ? 'Global Interactive Media' : 'Titan Digital Publishing');
    const exclusiveTitle = year <= 2012 ? `Exclusividad en ${platform.name}` : `Acuerdo Día Uno (Suscripción/Tienda)`;

    const options = [
        {
            id: 'self_publishing',
            title: 'Opción A: Autopublicación Indie',
            icon: '[[DE_ICON_059]]',
            desc: 'Tu estudio asume el 100% de los costes de producción y el riesgo comercial del proyecto.',
            terms: [
                { text: '[[DE_ICON_149]] 100% de los beneficios netos para tu estudio', type: 'term-benefit' },
                { text: '[[DE_ICON_149]] Sin fechas límite impuestas ni penalizaciones por retraso', type: 'term-benefit' },
                { text: `Coste estimado: ~$${baseDevCost.toLocaleString()} (fondos propios)`, type: 'term-neutral' }
            ]
        },
        {
            id: 'publisher_advance',
            title: `Opción B: Contrato con ${publisherName}`,
            icon: '[[DE_ICON_035]]',
            desc: 'Un distribuidor adelanta fondos de desarrollo y asume la distribución física o digital masiva.',
            terms: [
                { text: `+$${publisherAdvance.toLocaleString()} de anticipo financiero inmediato`, type: 'term-benefit' },
                { text: '[[DE_ICON_060]] Fecha límite de entrega fijada: 48 semanas', type: 'term-caution' },
                { text: 'El publisher retiene el 50% de royalties en ventas', type: 'term-cost' }
            ]
        },
        {
            id: 'platform_exclusive',
            title: `Opción C: ${exclusiveTitle}`,
            icon: '[[DE_ICON_040]]',
            desc: `Acuerdo con el fabricante para impulsar las ventas en ${platform.name} a cambio de exclusividad.`,
            terms: [
                { text: `+$${platformGrant.toLocaleString()} de fondo de desarrollo garantizado`, type: 'term-benefit' },
                { text: '+65% de ventas e impulso de marketing en la plataforma', type: 'term-benefit' },
                { text: 'Exclusividad temporal de 24 semanas (15% comisión)', type: 'term-caution' }
            ]
        }
    ];

    container.innerHTML = options.map(opt => {
        const isChecked = currentSelected === opt.id;
        const termsHtml = opt.terms.map(t => `<span class="${t.type}">${t.text}</span>`).join('');
        return `
            <label class="publishing-contract-card ${isChecked ? 'selected' : ''}" data-contract-id="${opt.id}">
                <input type="radio" name="publishing-contract" value="${opt.id}" ${isChecked ? 'checked' : ''}>
                <div class="contract-header">
                    <span style="font-size: 18px;">${opt.icon}</span>
                    <strong>${opt.title}</strong>
                </div>
                <p class="contract-desc">${opt.desc}</p>
                <div class="contract-terms-box">
                    ${termsHtml}
                </div>
            </label>
        `;
    }).join('');

    container.querySelectorAll('.publishing-contract-card').forEach(card => {
        card.addEventListener('click', () => {
            container.querySelectorAll('.publishing-contract-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });
}
window.renderPublishingContractSelector = renderPublishingContractSelector;

function applyDAGPreset(presetId) {
    let targetNodes = [];
    if (presetId === 'indie') {
        targetNodes = ['render_raster', 'physics_basic', 'net_singleplayer', 'ai_scripts', 'audio_stereo', 'content_linear'];
    } else if (presetId === 'aa') {
        targetNodes = ['render_raster', 'physics_ragdoll', 'net_p2p', 'ai_behavior', 'audio_spatial', 'content_procedural', 'sys_daynight'];
    } else if (presetId === 'aaa') {
        targetNodes = ['render_raytracing', 'physics_destructible', 'net_dedicated', 'ai_neural', 'audio_spatial', 'content_openworld', 'sys_daynight', 'sys_weather', 'sys_photomode'];
    } else if (presetId === 'qa') {
        targetNodes = ['render_raster', 'physics_basic', 'net_singleplayer', 'ai_scripts', 'audio_stereo', 'content_linear', 'sys_modding'];
    }

    const mgr = techTreeManager || (game && game.techTreeManager);
    const initialCount = targetNodes.length;
    if (mgr && typeof mgr.isUnlocked === 'function') {
        targetNodes = targetNodes.filter(id => mgr.isUnlocked(id));
    }

    scopeDAG.nodes.clear();
    scopeDAG.edges = [];
    targetNodes.forEach(id => {
        scopeDAG.addNode(id);
    });

    // Update preset buttons visual active state
    document.querySelectorAll('.preset-btn').forEach(btn => {
        const p = btn.getAttribute('data-preset') || btn.dataset.preset;
        btn.classList.toggle('active', p === presetId);
    });

    renderDAGNodes();
    updateDAGMetricsUI();
    const pipe = pipelineManager.getActivePipeline();
    if (world && world.renderScopeDAG3D && world.scopeDagGroup && world.scopeDagGroup.visible) {
        world.renderScopeDAG3D(scopeDAG, pipe);
    }
    if (soundEngine && soundEngine.playNodeToggle) {
        soundEngine.playNodeToggle(true);
    }
    const filteredNotice = targetNodes.length < initialCount ? ` (${targetNodes.length}/${initialCount} módulos investigados)` : '';
    showToast(`Preset "${presetId.toUpperCase()}" aplicado al Árbol de Arquitectura${filteredNotice}`, 'success');
}

function updateHistoricalWarning(elementId, ids) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const result = calculateTechIncompatibility(ids);
    el.style.display = result.incompatible ? 'block' : 'none';
    el.textContent = result.incompatible
        ? `Incompatibilidad Tecnológica Severa: Intentar acoplar tecnologías de eras tan distantes disparará los fallos y ralentizará el desarrollo. Brecha: ${result.gapYears} años · multiplicador: ×${result.multiplier.toFixed(2)}`
        : '';
}

function renderHistoricalTechOptions() {
    const container = document.getElementById('historical-tech-options');
    if (!container) return;
    container.replaceChildren();
    const year = game.getHistoricalYear();
    const nodes = TECH_TREE_NODES.filter(n => n.eraYear <= year && techTreeManager.isUnlocked(n.id));
    for (const id of selectedHistoricalTechs) if (!nodes.some(n => n.id === id)) selectedHistoricalTechs.delete(id);
    if (!nodes.length) container.textContent = 'Todavía no hay tecnologías históricas investigadas.';
    nodes.forEach(node => {
        const label = document.createElement('label');
        label.style.cssText = 'display:flex;align-items:center;gap:7px;color:#fff;font-size:12px';
        const input = document.createElement('input');
        input.type = 'checkbox'; input.checked = selectedHistoricalTechs.has(node.id);
        input.addEventListener('change', () => {
            if (input.checked) selectedHistoricalTechs.add(node.id); else selectedHistoricalTechs.delete(node.id);
            updateHistoricalWarning('historical-tech-warning', [...selectedHistoricalTechs, ...(pipelineManager.getActivePipeline()?.historicalTechIds || [])]);
        });
        label.append(input, document.createTextNode(`${node.name} (${node.eraYear})`));
        container.appendChild(label);
    });
    updateHistoricalWarning('historical-tech-warning', [...selectedHistoricalTechs, ...(pipelineManager.getActivePipeline()?.historicalTechIds || [])]);
}

function renderDAGNodes() {
    renderHistoricalTechOptions();
    const containerGroups = [
        {
            render: document.getElementById('dag-nodes-render'),
            physics: document.getElementById('dag-nodes-physics'),
            net: document.getElementById('dag-nodes-net'),
            ai: document.getElementById('dag-nodes-ai'),
            audio: document.getElementById('dag-nodes-audio'),
            content: document.getElementById('dag-nodes-content'),
            systems: document.getElementById('dag-nodes-systems'),
            base: document.getElementById('dag-nodes-base')
        },
        {
            render: document.getElementById('dag-modal-nodes-render'),
            physics: document.getElementById('dag-modal-nodes-physics'),
            net: document.getElementById('dag-modal-nodes-net'),
            ai: document.getElementById('dag-modal-nodes-ai'),
            audio: document.getElementById('dag-modal-nodes-audio'),
            content: document.getElementById('dag-modal-nodes-content'),
            systems: document.getElementById('dag-modal-nodes-systems'),
            base: document.getElementById('dag-modal-nodes-base')
        }
    ];

    containerGroups.forEach(group => {
        for (let k in group) {
            if (group[k]) group[k].innerHTML = '';
        }
    });

    renderBusinessModelSelector();

    const pipe = pipelineManager.getActivePipeline();
    const mgr = techTreeManager || (game && game.techTreeManager);

    // Strict hygiene: purge any locked node from active scopeDAG
    if (mgr && typeof mgr.isUnlocked === 'function') {
        const activeKeys = Array.from(scopeDAG.nodes.keys());
        activeKeys.forEach(k => {
            if (!mgr.isUnlocked(k)) {
                scopeDAG.removeNode(k);
            }
        });
    }

    // Filter strictly: In the game creation wizard ONLY nodes with state DESBLOQUEADO may appear!
    const availableNodes = SCOPE_NODES_CATALOG.filter(node => {
        if (game && game.getHistoricalYear() < 1995 && ['net_p2p', 'net_dedicated'].includes(node.id)) return false;
        if (mgr && typeof mgr.isUnlocked === 'function') {
            return mgr.isUnlocked(node.id);
        }
        return true;
    });

    availableNodes.forEach(node => {
        const isActive = scopeDAG.selectedNodeIds.has(node.id);
        const state = scopeDAG.nodeStates.get(node.id) || {};
        const isRegression = state.status === 'regression';

        // Check prerequisites among unlocked nodes
        const prereqs = node.prerequisites || [];
        const missing = prereqs.filter(p => !scopeDAG.selectedNodeIds.has(p));
        const isAvailable = !isActive && missing.length === 0;
        const isLocked = !isActive && missing.length > 0;

        // Build node card DOM element for each container group
        containerGroups.forEach(group => {
            // Find destination container
            let targetEl = null;
            if (node.category === 'render') {
                targetEl = group.render || group.base;
            } else if (node.category === 'physics') {
                targetEl = group.physics || group.base;
            } else if (node.category === 'netcode' || node.category === 'net') {
                targetEl = group.net || group.base;
            } else if (node.category === 'ai') {
                targetEl = group.ai || group.base;
            } else if (node.category === 'audio') {
                targetEl = group.audio || group.base;
            } else if (node.category === 'content') {
                targetEl = group.content;
            } else {
                targetEl = group.systems;
            }

            if (!targetEl) return;

            const card = document.createElement('div');
            card.className = 'dag-node-card' +
                (isActive ? ' active' : '') +
                (isAvailable ? ' available' : '') +
                (isLocked ? ' locked' : '') +
                (isRegression ? ' regression' : '');

            // Status Badge
            let statusHtml = '';
            if (isActive) {
                statusHtml = isRegression ? '<span class="node-status-badge badge-regression">[[DE_ICON_016]] REGRESIÓN</span>' : '<span class="node-status-badge badge-active">[[DE_ICON_149]] ACTIVADO</span>';
            } else if (isAvailable) {
                statusHtml = '<span class="node-status-badge badge-available">+ DISPONIBLE</span>';
            } else {
                statusHtml = '<span class="node-status-badge badge-locked">[[DE_ICON_093]] BLOQUEADO</span>';
            }

            // Disciplines breakdown chips
            const netVal = node.workload.net !== undefined ? node.workload.net : (node.workload.network || 0);
            const disciplinesHtml = `
                <div class="node-disciplines-row">
                    <span class="node-chip chip-eng" title="Carga Engine">[[DE_ICON_018]] ${node.workload.engine}</span>
                    <span class="node-chip chip-game" title="Carga Gameplay">[[DE_ICON_001]] ${node.workload.gameplay}</span>
                    <span class="node-chip chip-net" title="Carga Red">[[DE_ICON_020]] ${netVal}</span>
                    <span class="node-chip chip-art" title="Carga Arte">[[DE_ICON_019]] ${node.workload.art}</span>
                    <span class="node-chip chip-qa" title="Carga QA">[[DE_ICON_021]] ${node.workload.qa}</span>
                    <span class="node-chip chip-friction" title="Fricción Añadida">[[DE_ICON_022]] +${node.baseFriction}%</span>
                </div>
            `;

            // Requirements row
            let reqsHtml = '';
            if (prereqs.length > 0) {
                const pills = prereqs.map(pId => {
                    const pDef = SCOPE_NODES_CATALOG.find(n => n.id === pId);
                    const pName = pDef ? pDef.name : pId;
                    const met = scopeDAG.selectedNodeIds.has(pId);
                    return `<span class="req-pill ${met ? 'req-ok' : 'req-missing'}">${met ? '[[DE_ICON_149]]' : '[[DE_ICON_150]]'} ${pName}</span>`;
                }).join(' ');
                reqsHtml = `<div class="node-req-row"><span style="opacity: 0.7;">Req:</span> ${pills}</div>`;
            } else {
                reqsHtml = `<div class="node-req-row"><span class="req-pill req-ok">[[DE_ICON_064]] Base / Sin requisitos</span></div>`;
            }

            card.innerHTML = `
                <div>
                    <div class="node-card-header">
                        <span class="node-card-title">${node.icon} ${node.name} <small style="font-size: 10px; opacity: 0.6;">T${node.tier}</small></span>
                        ${statusHtml}
                    </div>
                    <p class="node-card-desc">${node.desc}</p>
                    ${disciplinesHtml}
                </div>
                ${reqsHtml}
            `;

            card.addEventListener('click', () => {
                if (isLocked) {
                    const missingNames = missing.map(m => {
                        const mDef = SCOPE_NODES_CATALOG.find(n => n.id === m);
                        return mDef ? mDef.name : m;
                    });
                    showToast(`[[DE_ICON_093]] "${node.name}" está bloqueado. Requiere: ${missingNames.join(', ')}`, 'warn');
                    if (soundEngine && soundEngine.playDebtAlert) soundEngine.playDebtAlert();
                    return;
                }

                const toggleRes = scopeDAG.toggleNode(node.id);
                if (!toggleRes.success) {
                    showToast(toggleRes.reason, 'warn');
                    if (soundEngine && soundEngine.playDebtAlert) soundEngine.playDebtAlert();
                    return;
                }

                if (soundEngine && soundEngine.playNodeToggle) {
                    soundEngine.playNodeToggle(toggleRes.action === 'added');
                }

                renderDAGNodes();
                updateDAGMetricsUI();
                if (world && world.renderScopeDAG3D && world.scopeDagGroup && world.scopeDagGroup.visible) {
                    world.renderScopeDAG3D(scopeDAG, pipe);
                }
            });

            targetEl.appendChild(card);
        });
    });
}

function updateRadarChart(polyId, dotsPrefix, workload) {
    const poly = document.getElementById(polyId);
    if (!poly) return;

    const maxVal = Math.max(workload.totals.engine, workload.totals.gameplay, workload.totals.net, workload.totals.art, workload.totals.qa, 50);
    const cx = 80, cy = 80;
    const maxR = 55;
    const minR = 12;

    const rEng = minR + (workload.totals.engine / maxVal) * (maxR - minR);
    const rGame = minR + (workload.totals.gameplay / maxVal) * (maxR - minR);
    const rNet = minR + (workload.totals.net / maxVal) * (maxR - minR);
    const rArt = minR + (workload.totals.art / maxVal) * (maxR - minR);
    const rQA = minR + (workload.totals.qa / maxVal) * (maxR - minR);

    // Angles:
    // 0: Engine = -90°
    // 1: Gameplay = -18° (cos = 0.951, sin = -0.309)
    // 2: Net = 54° (cos = 0.588, sin = 0.809)
    // 3: Art = 126° (cos = -0.588, sin = 0.809)
    // 4: QA = 198° (cos = -0.951, sin = -0.309)
    const p0 = { x: Math.round(cx), y: Math.round(cy - rEng) };
    const p1 = { x: Math.round(cx + 0.951 * rGame), y: Math.round(cy - 0.309 * rGame) };
    const p2 = { x: Math.round(cx + 0.588 * rNet), y: Math.round(cy + 0.809 * rNet) };
    const p3 = { x: Math.round(cx - 0.588 * rArt), y: Math.round(cy + 0.809 * rArt) };
    const p4 = { x: Math.round(cx - 0.951 * rQA), y: Math.round(cy - 0.309 * rQA) };

    const ptsStr = `${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`;
    poly.setAttribute('points', ptsStr);

    // Update dots if present
    const dEng = document.getElementById(`radar-dot-eng-${dotsPrefix}`);
    if (dEng) { dEng.setAttribute('cx', p0.x); dEng.setAttribute('cy', p0.y); }
    const dGame = document.getElementById(`radar-dot-game-${dotsPrefix}`);
    if (dGame) { dGame.setAttribute('cx', p1.x); dGame.setAttribute('cy', p1.y); }
    const dNet = document.getElementById(`radar-dot-net-${dotsPrefix}`);
    if (dNet) { dNet.setAttribute('cx', p2.x); dNet.setAttribute('cy', p2.y); }
    const dArt = document.getElementById(`radar-dot-art-${dotsPrefix}`);
    if (dArt) { dArt.setAttribute('cx', p3.x); dArt.setAttribute('cy', p3.y); }
    const dQA = document.getElementById(`radar-dot-qa-${dotsPrefix}`);
    if (dQA) { dQA.setAttribute('cx', p4.x); dQA.setAttribute('cy', p4.y); }
}

function updateDAGMetricsUI() {
    const pipe = pipelineManager.getActivePipeline() || { type: 'none', frictionMultiplier: 1, baseDebtFloor: 0, royaltyPercent: 0 };
    const friction = scopeDAG.calculateFriction(pipe.frictionMultiplier);
    const workload = scopeDAG.calculateWorkload(pipe.frictionMultiplier);

    const totalRaw = workload.totals.engine + workload.totals.gameplay + workload.totals.net + workload.totals.art + workload.totals.qa;
    const totalEffective = workload.effectiveWorkload.totalSum;

    // Total Workload Points Text
    const totNewGame = document.getElementById('workload-total-pts');
    if (totNewGame) totNewGame.innerText = `Total: ${totalRaw} pts (${totalEffective} pts efectivo)`;
    const totModal = document.getElementById('dag-modal-total-pts');
    if (totModal) totModal.innerText = `Total: ${totalRaw} pts (${totalEffective} pts efectivo)`;

    // Friction Counter
    const fricNewGame = document.getElementById('metric-friction');
    if (fricNewGame) {
        fricNewGame.innerText = `+${friction.frictionPercent}%`;
        fricNewGame.className = 'friction-val ' + friction.warningLevel;
    }
    const fricModal = document.getElementById('dag-modal-friction');
    if (fricModal) {
        fricModal.innerText = `+${friction.frictionPercent}%`;
        fricModal.className = 'friction-val ' + friction.warningLevel;
    }

    const coupText = `Acoplamiento: ${friction.couplingFactor}x (${scopeDAG.nodes.size} nodos)`;
    const coupNewGame = document.getElementById('metric-coupling');
    if (coupNewGame) coupNewGame.innerText = coupText;
    const coupModal = document.getElementById('dag-modal-coupling');
    if (coupModal) coupModal.innerText = coupText;

    // Friction Badges
    const badgeClass = friction.frictionPercent >= 50 ? 'pill-critico' : (friction.frictionPercent >= 25 ? 'pill-moderado' : 'pill-optimo');
    const badgeText = friction.frictionPercent >= 50
        ? `[[DE_ICON_115]] Fricción Crítica (+${friction.frictionPercent}%)`
        : (friction.frictionPercent >= 25 ? `[[DE_ICON_116]] Fricción Moderada (+${friction.frictionPercent}%)` : `[[DE_ICON_023]] Acoplamiento Óptimo`);

    const badgeNewGame = document.getElementById('metric-friction-badge');
    if (badgeNewGame) {
        badgeNewGame.className = 'friction-badge-pill ' + badgeClass;
        badgeNewGame.innerText = badgeText;
    }
    const badgeModal = document.getElementById('dag-modal-friction-badge');
    if (badgeModal) {
        badgeModal.className = 'friction-badge-pill ' + badgeClass;
        badgeModal.innerText = badgeText;
    }

    // Tech Debt Gauge: Calculate Value & Tacometer Needle Angle
    const currentDebt = (game && game.currentProject && game.currentProject.techDebtModel)
        ? Math.round(game.currentProject.techDebtModel.accumulatedDebt)
        : pipe.baseDebtFloor;

    const clampedDebt = Math.min(100, Math.max(0, currentDebt));
    const needleDeg = -90 + (clampedDebt / 100) * 180;
    const needleColor = currentDebt > 40 ? '#ef4444' : (currentDebt > 15 ? '#f59e0b' : '#10b981');

    const needleNewGame = document.getElementById('tech-debt-needle');
    if (needleNewGame) {
        needleNewGame.style.transform = `rotate(${needleDeg}deg)`;
        needleNewGame.setAttribute('stroke', needleColor);
    }
    const needleModal = document.getElementById('dag-modal-debt-needle');
    if (needleModal) {
        needleModal.style.transform = `rotate(${needleDeg}deg)`;
        needleModal.setAttribute('stroke', needleColor);
    }

    const debtValNewGame = document.getElementById('metric-base-debt');
    if (debtValNewGame) {
        debtValNewGame.innerText = `${currentDebt} pts`;
        debtValNewGame.style.color = needleColor;
    }
    const debtValModal = document.getElementById('dag-modal-debt-val');
    if (debtValModal) {
        debtValModal.innerText = `${currentDebt} pts`;
        debtValModal.style.color = needleColor;
    }

    // Tech Debt Status Tag
    const tagClass = currentDebt > 40 ? 'tag-critical' : (currentDebt > 15 ? 'tag-moderate' : 'tag-clean');
    const tagText = currentDebt > 40
        ? '[[DE_ICON_115]] Deuda Crítica (Riesgo Regresiones)'
        : (currentDebt > 15 ? '[[DE_ICON_116]] Deuda Moderada (Riesgo Medio)' : '[[DE_ICON_023]] Código Limpio (Riesgo Nulo)');

    const tagNewGame = document.getElementById('metric-debt-status');
    if (tagNewGame) {
        tagNewGame.className = 'debt-status-tag ' + tagClass;
        tagNewGame.innerText = tagText;
    }
    const tagModal = document.getElementById('dag-modal-debt-status');
    if (tagModal) {
        tagModal.className = 'debt-status-tag ' + tagClass;
        tagModal.innerText = tagText;
    }

    const royEl = document.getElementById('metric-royalties');
    if (royEl) {
        royEl.innerText = pipe.type === 'commercial'
            ? `Royalties: ${pipe.royaltyPercent}% | Bloatware: ${pipe.baseDebtFloor} pts`
            : '0% Royalties | 0 Bloatware Base';
    }

    // Workload Breakdown Bars in both Modals
    const maxVal = Math.max(workload.totals.engine, workload.totals.gameplay, workload.totals.net, workload.totals.art, workload.totals.qa, 100);

    const updateBar = (barId, numId, val) => {
        const bar = document.getElementById(barId);
        if (bar) bar.style.width = `${Math.min(100, (val / maxVal) * 100)}%`;
        const num = document.getElementById(numId);
        if (num) num.innerText = `${val} pts`;
    };

    updateBar('bar-eng', 'num-eng', workload.totals.engine);
    updateBar('dag-modal-bar-eng', 'dag-modal-num-eng', workload.totals.engine);

    updateBar('bar-game', 'num-game', workload.totals.gameplay);
    updateBar('dag-modal-bar-game', 'dag-modal-num-game', workload.totals.gameplay);

    updateBar('bar-net', 'num-net', workload.totals.net);
    updateBar('dag-modal-bar-net', 'dag-modal-num-net', workload.totals.net);

    updateBar('bar-art', 'num-art', workload.totals.art);
    updateBar('dag-modal-bar-art', 'dag-modal-num-art', workload.totals.art);

    updateBar('bar-qa', 'num-qa', workload.totals.qa);
    updateBar('dag-modal-bar-qa', 'dag-modal-num-qa', workload.totals.qa);

    // Update Discipline Balance Radar Charts
    updateRadarChart('dag-radar-poly', '1', workload);
    updateRadarChart('dag-modal-radar-poly', '2', workload);
}

function on3DNodeClicked(nodeId) {
    if (nodeId.startsWith('tech_')) {
        if (!techTreeManager.isUnlocked(nodeId)) return;
        if (selectedHistoricalTechs.has(nodeId)) selectedHistoricalTechs.delete(nodeId); else selectedHistoricalTechs.add(nodeId);
        renderHistoricalTechOptions();
        const node = world.dagNodesMap.get(nodeId);
        if (node) showToast(`${node.data.name}: ${selectedHistoricalTechs.has(nodeId) ? 'seleccionado' : 'retirado de la selección'}`, 'info');
        renderHistoricalGraph();
        return;
    }
    const toggleRes = scopeDAG.toggleNode(nodeId);
    if (!toggleRes.success) {
        showToast(toggleRes.reason, 'warn');
        return;
    }
    renderDAGNodes();
    updateDAGMetricsUI();
    const pipe = pipelineManager.getActivePipeline();
    world.renderScopeDAG3D(scopeDAG, pipe);
    const nodeObj = scopeDAG.getNode(nodeId);
    showToast(`[[DE_ICON_020]] Nodo "${nodeObj ? nodeObj.name : nodeId}" modificado en el DAG.`, 'info');
}

function setupStageTabs() {
    // Legacy support fallback
}

function updatePlatformOptions() {
    const platformSelect = document.getElementById('select-platform');
    if (!platformSelect) return;
    const previous = platformSelect.value;
    const year = game.getHistoricalYear();
    const platforms = typeof game.getPlatforms === 'function'
        ? game.getPlatforms()
        : (game.platforms || PLATFORMS);
    platformSelect.replaceChildren();
    platforms.forEach(p => {
        if (p.releaseYear != null && year < p.releaseYear) return;
        if (p.releaseYear == null && (p.eraUnlocked || 1) > game.era) return;
        const retired = p.status === 'RETIRED' || (p.retireYear != null && year >= p.retireYear);
        const kitCost = typeof game.getDevKitCost === 'function' ? game.getDevKitCost(p) : (p.devKitCost ?? p.devCost ?? 0);
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.disabled = retired;
        opt.textContent = `${p.name} · ${retired ? 'Retirada' : `DevKit $${kitCost.toLocaleString()}`}${p.isModded ? ' [MOD]' : ''}`;
        platformSelect.appendChild(opt);
    });
    if ([...platformSelect.options].some(option => option.value === previous && !option.disabled)) {
        platformSelect.value = previous;
    }
    updatePlatformDetails();
}

function updatePlatformDetails() {
    const details = document.getElementById('platform-details');
    const select = document.getElementById('select-platform');
    if (!details || !select) return;
    const platforms = typeof game.getPlatforms === 'function' ? game.getPlatforms() : (game.platforms || PLATFORMS);
    const platform = platforms.find(p => p.id === select.value);
    if (!platform) {
        details.textContent = 'No hay plataformas disponibles para este año.';
        return;
    }
    const cost = typeof game.getDevKitCost === 'function' ? game.getDevKitCost(platform) : (platform.devKitCost ?? platform.devCost ?? 0);
    const royalty = platform.royaltyRate ?? platform.royalty ?? 0;
    const share = Number(platform.marketShare);
    details.textContent = `DevKit: $${cost.toLocaleString()} · Regalías: ${(royalty * 100).toLocaleString()}%${Number.isFinite(share) ? ` · Índice de mercado: ${(share * 100).toFixed(1)}%` : ''}${platform.type ? ` · ${platform.type}` : ''}`;
}

function updateEngineOptions() {
    // Maintained for backward compatibility
}

function startProjectFromWizard() {
    const name = document.getElementById('input-game-name').value.trim() || 'Juego ' + (game.gamesHistory.length + 1);
    const topicId = document.getElementById('select-topic').value;
    const genreId = document.getElementById('select-genre').value;
    const platformId = document.getElementById('select-platform').value;
    const targetAudience = document.getElementById('select-audience').value;
    const publishingContractType = document.querySelector('input[name="publishing-contract"]:checked')?.value || 'self_publishing';
    const businessModel = document.querySelector('input[name="business-model"]:checked')?.value || 'premium';
    const postLaunchContent = document.getElementById('select-post-launch-content').value || 'none';
    const monetizationStyle = document.getElementById('select-monetization-style').value || 'cosmetic';
    const supportsPatches = document.getElementById('toggle-postlaunch-patches').checked;

    renderPipelineSelector();
    const activePipeline = pipelineManager.getActivePipeline();
    if (!activePipeline) {
        showToast('No hay motores disponibles. Inicia un proyecto de I+D desde el menú del estudio.', 'warn');
        return;
    }
    if (activePipeline.type === 'commercial') {
        (activePipeline.unlockedNodes || []).forEach(nodeId => techTreeManager.unlockTech(nodeId));
    }
    const friction = scopeDAG.calculateFriction(activePipeline.frictionMultiplier);
    const workload = scopeDAG.calculateWorkload(activePipeline.frictionMultiplier);

    if (scopeDAG.selectedNodeIds.size < 3) {
        showToast('Debes seleccionar al menos 3 nodos de arquitectura para estructurar el juego.', 'warn');
        return;
    }

    const dagConfig = {
        selectedNodeIds: Array.from(scopeDAG.selectedNodeIds),
        friction: friction,
        workload: workload,
        pipeline: activePipeline
    };

    debtManager.setBaseDebt(activePipeline.baseDebtFloor);

    const result = game.startNewGameProject({
        name, topicId, genreId, platformId, targetAudience, dagConfig,
        historicalTechIds: [...selectedHistoricalTechs],
        ipId: document.getElementById("select-ip").value || null,
        ipInstallmentType: document.getElementById("select-ip-installment").value,
        publishingContractType,
        businessModel, postLaunchContent, monetizationStyle, supportsPatches
    });

    if (result.success) {
        if (world) {
            world.hideScopeDAG();
        }
        const holoHud = document.getElementById('hologram-overlay-bar');
        if (holoHud) holoHud.style.display = 'none';
        closeAllModals();

        if (result.contract && result.contract.amount > 0) {
            showToast(`[[DE_ICON_025]] ¡Acuerdo firmado con ${result.contract.company}! Recibes un anticipo de +$${result.contract.amount.toLocaleString()}.`, 'success');
        }
        showToast(`[[DE_ICON_015]] Comenzando desarrollo con arquitectura DAG de: "${name}"`, 'success');
        document.getElementById('input-game-name').value = '';
    } else {
        showToast(result.message, 'warn');
    }
}

// --- HUD & STATUS BAR RENDERING ---

function renderHUD(state) {
    const pendingOffers = state.currentProject?.offers || [];
    if (pendingOffers.length) {
        const offerKey = `${state.currentProject.name}:${pendingOffers.map(offer => offer.id).join(',')}`;
        if (offerKey !== lastNotifiedProjectOfferKey) {
            lastNotifiedProjectOfferKey = offerKey;
            showToast(`[[DE_ICON_117]] Nueva propuesta comercial para "${state.currentProject.name}". Revisa sus términos en el panel del proyecto.`, 'info');
        }
    } else {
        lastNotifiedProjectOfferKey = null;
    }

    // Studio Title & Logo
    const titleEl = document.getElementById('studio-title');
    if (titleEl) {
        const hint = document.createElement('span');
        hint.className = 'studio-edit-hint';
        hint.textContent = '[[DE_ICON_002]]';
        titleEl.replaceChildren(`${state.companyName} `, hint);
    }
    const logoEl = document.getElementById('studio-logo');
    if (logoEl) logoEl.innerText = state.companyLogo;

    // Top Bar Stats
    document.getElementById('stat-funds').innerText = `$${Math.floor(state.funds).toLocaleString()}`;
    document.getElementById('stat-fans').innerText = state.fans.toLocaleString();
    document.getElementById('stat-rp').innerText = state.researchPoints;
    const histYear = state.getHistoricalYear ? state.getHistoricalYear() : (1981 + state.year);
    document.getElementById('stat-calendar').innerHTML = `[[DE_ICON_066]] <strong>${histYear}</strong> (Año ${state.year}), M<strong>${state.month}</strong> S<strong>${state.week}</strong>`;

    // Refresh research modal live counters if open
    const modalResearch = document.getElementById('modal-research');
    if (modalResearch && modalResearch.classList.contains('active')) {
        renderTechTree();
    }

    // Era Badge
    const eraNames = { 1: 'Garaje Retro (Años 80)', 2: 'Loft Indie Moderno', 3: 'Campus Cyberpunk AAA' };
    document.getElementById('badge-era').innerText = eraNames[state.era];

    // Market Trend Pill
    const trendText = document.getElementById('trend-text');
    if (state.marketTrend) {
        trendText.innerText = `Tendencia: ${state.marketTrend.topicName} + ${state.marketTrend.genreName} (${state.marketTrend.weeksRemaining} sem)`;
    }

    // Active Project Bar
    const projBar = document.getElementById('active-project-bar');
    if (state.currentProject) {
        projBar.style.display = 'flex';
        const proj = state.currentProject;

        document.getElementById('proj-title').innerText = proj.name;
        document.getElementById('proj-tag-topic').innerText = proj.topic.name;
        document.getElementById('proj-tag-genre').innerText = proj.genre.name;
        document.getElementById('proj-tag-platform').innerText = proj.platform.name;
        const businessTag = document.getElementById('proj-tag-business');
        if (businessTag) businessTag.innerText = ({ premium: 'Premium', early_access: 'Acceso Anticipado', f2p: 'Free-to-Play', live_service: 'Live-Service' })[proj.businessModel] || 'Premium';

        const pipeTag = document.getElementById('proj-tag-pipeline');
        if (pipeTag) {
            const pipeName = (proj.engineObj && proj.engineObj.name) || (proj.engine && proj.engine.name) || (proj.pipelineType === 'commercial' ? 'Motor Comercial' : 'In-House Propio');
            pipeTag.innerText = pipeName;
        }

        document.getElementById('pts-tech').innerText = proj.techPoints;
        document.getElementById('pts-design').innerText = proj.designPoints;

        // Dynamic 5-Discipline Workload & Progress
        let netPoints = 0;
        let qaPoints = 0;
        if (proj.scopeDAG) {
            proj.scopeDAG.getActiveNodes().forEach(n => {
                netPoints += Math.round(n.disciplineProgress.network || n.disciplineProgress.net || 0);
                qaPoints += Math.round(n.disciplineProgress.qa || 0);
            });
        }
        const netEl = document.getElementById('pts-net');
        if (netEl) netEl.innerText = netPoints;

        const qaEl = document.getElementById('pts-qa');
        if (qaEl) qaEl.innerText = qaPoints;

        // Subsistema de Deuda Técnica & Medidor de Salud del Código (Puntos 1, 3 y 6)
        const debtMgr = proj.techDebtModel;
        const rawDebt = debtMgr ? Math.round(debtMgr.rawDebt * 10) / 10 : (proj.bugs || 0);
        const visibleDebt = debtMgr ? debtMgr.visibleDebt : rawDebt;
        const hiddenDebt = debtMgr ? Math.round(debtMgr.hiddenDebt * 10) / 10 : 0;
        const frictionMult = debtMgr ? debtMgr.accumulatedFriction : (1.0 + (proj.friction || 18) / 100);
        const frictionPercent = Math.round((frictionMult - 1.0) * 100);
        const regRiskPercent = debtMgr ? Math.round(debtMgr.regressionRisk * 100) : 0;
        const healthStatus = debtMgr ? debtMgr.healthStatus : (rawDebt <= 20 ? 'clean' : (rawDebt <= 45 ? 'moderate' : 'critical'));

        // Actualizar Medidor Compacto de "Salud del Código / Deuda Técnica"
        const healthPill = document.getElementById('pill-debt-health');
        const healthIcon = document.getElementById('debt-health-icon');
        const debtStatus = document.getElementById('pts-debt-status');
        const debtEl = document.getElementById('pts-debt');
        const hiddenBadge = document.getElementById('pts-hidden-debt-badge');
        const hiddenVal = document.getElementById('pts-hidden-debt');

        if (healthPill) {
            healthPill.className = `point-pill pill-debt-health status-${healthStatus}`;
        }
        if (healthIcon) {
            healthIcon.innerText = healthStatus === 'clean' ? '[[DE_ICON_023]]' : (healthStatus === 'moderate' ? '[[DE_ICON_116]]' : '[[DE_ICON_115]]');
        }
        if (debtStatus) {
            debtStatus.innerText = healthStatus === 'clean' ? 'Limpio' : (healthStatus === 'moderate' ? 'Fricción Moderada' : 'Deuda Crítica');
        }
        if (debtEl) {
            debtEl.innerText = visibleDebt;
        }
        if (hiddenBadge && hiddenVal) {
            if (hiddenDebt > 0.5) {
                hiddenBadge.style.display = 'inline-block';
                hiddenVal.innerText = hiddenDebt;
                hiddenBadge.title = `Deuda técnica oculta detectada gradualmente por testers de QA (+${hiddenDebt} pts)`;
            } else {
                hiddenBadge.style.display = 'none';
            }
        }

        // Fricción Acumulada
        const fricEl = document.getElementById('pts-friction');
        if (fricEl) {
            fricEl.innerText = `${frictionMult.toFixed(2)}x (+${frictionPercent}%)`;
        }

        // Riesgo de Regresión
        const riskEl = document.getElementById('pts-regression-risk');
        if (riskEl) {
            riskEl.innerText = `${regRiskPercent}%`;
            riskEl.style.color = regRiskPercent > 35 ? 'var(--accent-red)' : (regRiskPercent > 15 ? 'var(--accent-gold)' : 'var(--text-secondary)');
        }

        // Regression alert banner
        const regBanner = document.getElementById('regression-alert-banner');
        if (regBanner) {
            if (proj.lastRegression && (Date.now() - (proj.lastRegressionTime || 0)) < 8000) {
                regBanner.style.display = 'flex';
                const regText = document.getElementById('regression-alert-text');
                if (regText) {
                    const nodeName = proj.lastRegression.nodeName || 'módulo';
                    const lost = proj.lastRegression.progressLost ? Math.round(proj.lastRegression.progressLost) : 20;
                    regText.innerText = `¡Regresión en "${nodeName}"! Retroceso del ${lost}% y desestabilización por deuda técnica.`;
                }
            } else {
                regBanner.style.display = 'none';
            }
        }

        // Refactor toggle button state (Punto 4: [[[DE_ICON_112]] Refactorizar Código])
        const refactorBtn = document.getElementById('btn-toggle-refactor');
        if (refactorBtn) {
            if (proj.devMode === 'refactor') {
                refactorBtn.classList.add('active');
                refactorBtn.innerHTML = '[[DE_ICON_015]] Refactorizando... (Click para Normal)';
            } else {
                refactorBtn.classList.remove('active');
                refactorBtn.innerHTML = '[[DE_ICON_015]] Refactorizar Código';
            }
        }

        document.getElementById('proj-progress-fill').style.width = `${proj.overallProgress}%`;

        const stageNames = {
            1: 'Fase 1: Motor Gráfico & Guion',
            2: 'Fase 2: Diseño de Niveles & IA',
            3: 'Fase 3: Gráficos, Mundo & Sonido',
            4: 'Fase 4: Depuración de Bugs & Pulido'
        };
        document.getElementById('stage-label').innerText = stageNames[proj.stage];

        const releaseBtn = document.getElementById('btn-release-game');
        const canLaunchBeta = proj.businessModel === 'early_access' && proj.overallProgress >= 50 && proj.overallProgress <= 80;
        if (proj.stage === 4 || canLaunchBeta) {
            releaseBtn.style.display = 'block';
            releaseBtn.disabled = false;
            if (canLaunchBeta) {
                releaseBtn.innerText = '[[DE_ICON_024]] Publicar en Acceso Anticipado (50–80%)';
                releaseBtn.style.background = 'linear-gradient(135deg, #38bdf8, #2563eb)';
            } else if (proj.businessModel === 'early_access') {
                if (proj.launchPhase === 'beta_live') {
                    const betaGame = state.gamesHistory.find(item => item.id === proj.earlyAccessGameId);
                    const weeksLeft = Math.max(0, 8 - (betaGame?.weeksOnMarket || 0));
                    releaseBtn.innerText = weeksLeft ? `[[DE_ICON_024]] Lanzamiento 1.0 Oficial · ${weeksLeft} sem de beta` : '[[DE_ICON_024]] Lanzamiento 1.0 Oficial';
                    releaseBtn.disabled = weeksLeft > 0;
                } else {
                    releaseBtn.innerText = '[[DE_ICON_024]] Lanzar 1.0 (sin beta pública)';
                }
                releaseBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            } else if (healthStatus === 'clean') {
                releaseBtn.innerText = `[[DE_ICON_024]] Lanzar Videojuego (Código Limpio: ${visibleDebt} pts)`;
                releaseBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            } else if (healthStatus === 'moderate') {
                releaseBtn.innerText = `[[DE_ICON_024]] Lanzar Videojuego (Fricción Media: ${visibleDebt} pts)`;
                releaseBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            } else {
                releaseBtn.innerText = `[[DE_ICON_016]] Lanzar con Riesgo (¡Deuda Crítica: ${visibleDebt} pts!)`;
                releaseBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            }
        } else {
            releaseBtn.style.display = 'none';
        }
    } else {
        projBar.style.display = 'none';
    }

    const offersContainer = document.getElementById('project-offers-container');
    if (offersContainer) {
        const project = state.currentProject;
        if (project?.offers?.length) {
            offersContainer.style.display = 'block';
            offersContainer.innerHTML = `<div class="business-offer-panel"><strong>[[DE_ICON_117]] Propuestas comerciales (${state.getHistoricalYear()})</strong><p>Revisa el anticipo, las comisiones y las restricciones antes de firmar. Solo puedes aceptar un acuerdo por proyecto.</p><div class="contract-offer-list">${project.offers.map(offer => `<article class="contract-offer-card"><div><b>${offer.title}</b><p>${offer.detail}</p></div><button class="dock-btn btn-primary-action" onclick="reviewBusinessOffer('${offer.id}')">Revisar términos</button></article>`).join('')}</div></div>`;
        } else if (project?.acceptedOffer) {
            offersContainer.style.display = 'block';
            offersContainer.innerHTML = `<div class="business-offer-panel">[[DE_ICON_096]] Acuerdo aceptado: ${project.acceptedOffer.title} · Anticipo $${project.acceptedOffer.amount.toLocaleString()}</div>`;
        } else {
            offersContainer.style.display = 'none';
        }
    }
    // Post-Launch Emergency Patch Crisis Banner (Punto 5)
    const patchBanner = document.getElementById('emergency-patch-banner');
    if (patchBanner) {
        if (state.isEmergencyPatchActive && state.emergencyPatchData) {
            patchBanner.style.display = 'flex';
            const msgEl = document.getElementById('emergency-patch-msg');
            if (msgEl) {
                msgEl.innerText = `El lanzamiento de "${state.emergencyPatchData.gameName}" sufre cuelgues masivos y colapso técnico por deuda crítica (${state.emergencyPatchData.currentDebt} pts). El estudio no puede iniciar nuevos proyectos hasta estabilizar el código con un hotfix.`;
            }
        } else {
            patchBanner.style.display = 'none';
        }
    }

    // Office Upgrade Button availability
    const upgradeBtn = document.getElementById('btn-upgrade-office');
    const check = state.canUpgradeOffice();
    if (state.era < 3) {
        upgradeBtn.style.display = 'flex';
        upgradeBtn.innerHTML = `[[DE_ICON_035]] ${check.name} ($${check.cost.toLocaleString()})`;
        upgradeBtn.disabled = !check.canUpgrade;
        upgradeBtn.title = check.canUpgrade ? '¡Listo para expandirte a una sede mayor!' : 'Requiere más fondos y juegos exitosos publicados.';
    } else {
        upgradeBtn.style.display = 'none';
    }

    if (typeof updateLiveSalesWidget === 'function') updateLiveSalesWidget();
}

window.acceptBusinessOffer = function(offerId) {
    const result = game.acceptProjectOffer(offerId);
    if (result.success) closeAllModals();
    showToast(result.message, result.success ? 'success' : 'warn');
};

window.reviewBusinessOffer = function(offerId) {
    const project = game.currentProject;
    const offer = project?.offers?.find(item => item.id === offerId);
    if (!offer) return showToast('Esta oferta ya no está disponible.', 'warn');
    const content = document.getElementById('contract-negotiation-content');
    const money = Number(offer.amount || 0).toLocaleString();
    const allowed = offer.allowedPlatforms || offer.platforms || (offer.type === 'console_exclusive' ? [offer.platform || 'Plataforma ofertante'] : ['Todas las plataformas']);
    const restrictions = offer.restriction || offer.restrictions || offer.detail || 'Sin restricciones adicionales.';
    const deliveryDeadline = offer.deliveryDeadline || (offer.deadlineWeeks ? `${offer.deadlineWeeks} semanas desde la firma` : 'Sin fecha límite');
    const delayPenalty = offer.delayPenalty || offer.latePenaltyPerWeek;
    const upfrontLabel = offer.type === 'publisher_advance' ? 'Anticipo de producción' : 'Pago garantizado';
    const royalty = Math.round((offer.revenueShare || offer.royaltyRate || 0) * 100);
    content.innerHTML = `<div class="contract-issuer">${offer.company || offer.publisher || offer.platformName || 'Socio comercial'} · ${offer.typeLabel || offer.title}</div><p class="contract-description">${offer.detail || 'Propuesta de financiación para este proyecto.'}</p><dl class="contract-terms"><div><dt>${upfrontLabel}</dt><dd>$${money}</dd></div><div><dt>Parte de ingresos retenida</dt><dd>${royalty}%</dd></div><div><dt>Plataformas permitidas</dt><dd>${allowed.join(', ')}</dd></div><div><dt>Plazo y restricciones</dt><dd>${restrictions}</dd></div>${offer.type === 'publisher_advance' ? `<div><dt>Fecha de entrega</dt><dd>${deliveryDeadline}</dd></div><div><dt>Penalización por retraso</dt><dd>$${Number(delayPenalty || 0).toLocaleString()} por semana (con tope)</dd></div>` : ''}</dl><div class="contract-negotiation-actions"><button class="dock-btn btn-primary-action" onclick="acceptBusinessOffer('${offer.id}')">Aceptar Acuerdo</button><button class="dock-btn" onclick="negotiateBusinessOffer('${offer.id}')">Negociar Mejores Términos</button><button class="dock-btn contract-reject" onclick="rejectBusinessOffer('${offer.id}')">Rechazar y Mantener Independencia</button></div><small class="contract-risk-note">La negociación puede hacer que el ofertante retire la propuesta.</small>`;
    openModal('modal-contract-negotiation');
};

window.negotiateBusinessOffer = function(offerId) {
    const result = typeof game.negotiateProjectOffer === 'function'
        ? game.negotiateProjectOffer(offerId)
        : { success: false, message: 'La negociación de contraofertas aún no está disponible.' };
    closeAllModals();
    showToast(result.message, result.success ? 'success' : 'warn');
};

window.rejectBusinessOffer = function(offerId) {
    const result = typeof game.rejectProjectOffer === 'function'
        ? game.rejectProjectOffer(offerId)
        : { success: false, message: 'El rechazo de ofertas aún no está disponible.' };
    closeAllModals();
    showToast(result.message, result.success ? 'success' : 'warn');
};

window.launchOfficialGameVersion = function(gameId) {
    const result = game.launchOfficialVersion(gameId);
    showToast(result.message, result.success ? 'success' : 'warn');
    renderLiveOps();
};

window.deployGameContentPatch = function(gameId) {
    const result = game.deployContentPatch(gameId);
    showToast(result.message, result.success ? 'success' : 'warn');
    renderLiveOps();
};

window.launchGameBattlePass = function(gameId) {
    const input = document.getElementById(`season-programmers-${gameId}`);
    const result = game.launchBattlePass(gameId, input ? Number(input.value) : 1);
    showToast(result.message, result.success ? 'success' : 'warn');
    renderLiveOps();
};

window.closeGameLiveServers = function(gameId) {
    const result = game.closeGameServers(gameId);
    showToast(result.message, result.success ? 'success' : 'warn');
    renderLiveOps();
};

function renderLiveOps() {
    const container = document.getElementById('liveops-games-container');
    if (!container) return;
    const activeGames = game.gamesHistory.filter(item => ['f2p', 'live_service', 'early_access'].includes(item.businessModel) || (item.businessModel === 'premium' && item.supportsPatches));
    if (!activeGames.length) {
        container.innerHTML = '<div class="business-offer-panel">Aún no hay juegos F2P, Live-Service o en Acceso Anticipado. Estarán disponibles según la línea temporal y los nodos de red investigados.</div>';
        return;
    }
    const previousAssignments = new Map(Array.from(container.querySelectorAll('select[id^="season-programmers-"]')).map(select => [select.id, select.value]));
    container.innerHTML = activeGames.map(item => {
        const values = item.dailyActiveUsers || [];
        const maxMau = Math.max(1, ...values);
        const points = values.map((value, index) => `${values.length <= 1 ? 300 : index * (600 / (values.length - 1))},${105 - (value / maxMau) * 90}`).join(' ');
        const graph = values.length > 1
            ? `<svg viewBox="0 0 600 120" class="liveops-chart" role="img" aria-label="Usuarios activos diarios"><polyline points="${points}" fill="none" stroke="#38bdf8" stroke-width="3"/><line x1="0" y1="106" x2="600" y2="106" stroke="rgba(255,255,255,.18)"/></svg>`
            : '<div class="liveops-chart-empty">El gráfico de retención se poblará durante las próximas semanas.</div>';
        const modelName = item.businessModel === 'f2p' ? 'Free-to-Play' : (item.businessModel === 'live_service' ? 'Live-Service' : (item.businessModel === 'early_access' ? 'Acceso Anticipado' : 'Premium con parches'));
        const eaProject = game.currentProject?.earlyAccessGameId === item.id ? game.currentProject : null;
        const officialReady = item.weeksOnMarket >= 8 && eaProject?.stage >= 4;
        const officialButton = item.isEarlyAccess && !item.officialReleased
            ? `<button class="dock-btn btn-primary-action" onclick="launchOfficialGameVersion('${item.id}')" ${!officialReady ? 'disabled' : ''}>[[DE_ICON_024]] Lanzamiento 1.0 Oficial${item.weeksOnMarket < 8 ? ` · ${8 - item.weeksOnMarket} sem de beta` : (eaProject?.stage < 4 ? ' · termina el pulido' : '')}</button>` : '';
        const priorAssignment = previousAssignments.get(`season-programmers-${item.id}`) || '1';
        const seasonButton = item.businessModel === 'live_service' && !item.serversClosed
            ? `<div class="liveops-actions"><label>Programadores para la temporada <select id="season-programmers-${item.id}" class="form-select" style="width:auto;display:inline-block">${Array.from({ length: Math.max(1, game.employees.length) }, (_, i) => `<option value="${i + 1}" ${Number(priorAssignment) === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></label><button class="dock-btn" onclick="launchGameBattlePass('${item.id}')" ${item.weeksOnMarket < item.nextSeasonWeek ? 'disabled' : ''}>[[DE_ICON_118]] Pase de Batalla ${item.weeksOnMarket >= item.nextSeasonWeek ? 'disponible' : `en ${item.nextSeasonWeek - item.weeksOnMarket} sem`}</button></div>` : '';
        return `<article class="liveops-game-card"><div class="liveops-card-header"><div><h3>${item.name}</h3><span>${modelName} · Estado: ${item.lifecycleState}</span></div><strong>${(item.mau || 0).toLocaleString()} MAU</strong></div>${graph}<div class="liveops-metrics"><span>Instalaciones: ${(item.installationsTotal || 0).toLocaleString()}</span><span>Conversión: ${Math.round((item.conversionRate || 0) * 100)}%</span><span>Ingreso mensual: $${(item.monthlyServiceRevenue || 0).toLocaleString()}</span><span>Coste mensual: $${(item.monthlyServiceCosts || 0).toLocaleString()}</span><b>Balance neto: $${(item.monthlyNetBalance || 0).toLocaleString()}</b><span>Paciencia: ${item.communityPatience ?? 100}% · Sin parche: ${item.weeksWithoutContentPatch || 0} sem</span></div><div class="liveops-actions">${officialButton}<button class="dock-btn" onclick="deployGameContentPatch('${item.id}')">[[DE_ICON_034]] Publicar parche ($6.000+)</button>${seasonButton}${['f2p', 'live_service'].includes(item.businessModel) && !item.serversClosed ? `<button class="dock-btn btn-refactor" onclick="closeGameLiveServers('${item.id}')">[[DE_ICON_119]] Cerrar Servidores / Descontinuar Juego</button>` : ''}</div></article>`;
    }).join('');
}

function renderMarketingHub() {
    const container = document.getElementById('marketing-hub-content');
    if (!container) return;
    const project = game.currentProject;
    const year = game.getHistoricalYear();
    const options = typeof game.getMarketingOptions === 'function' ? (game.getMarketingOptions() || []) : [];
    const priorTargetId = document.getElementById('marketing-key-game')?.value;
    const campaigns = options.map(option => {
        const locked = option.available === false;
        const title = option.label || option.name || option.title || option.id;
        const note = locked ? `[[DE_ICON_093]] Disponible en ${option.year || 'una era posterior'}` : (option.description || option.detail || 'Promoción de prelanzamiento');
        const cost = Number(option.cost || 0);
        return `<article class="marketing-action-card"><div><b>${title}</b><p>${note}</p>${!locked && cost ? `<small>Coste: $${cost.toLocaleString()}</small>` : ''}</div><button type="button" class="dock-btn btn-primary-action btn-run-marketing ${locked || !project ? 'btn-soft-disabled' : ''}" data-method-id="${option.id}" onclick="window.runMarketingMethod('${option.id}')">${locked ? '[[DE_ICON_093]] Bloqueado' : '[[DE_ICON_099]] Lanzar campaña'}</button></article>`;
    }).join('');
    const targetGames = [ ...(project ? [{ id: project.id || `project:${project.name}`, name: `${project.name} (en desarrollo)`, isProject: true }] : []), ...game.gamesHistory.map(item => ({ id: item.id, name: item.name })) ];
    const selectedTargetId = targetGames.some(item => String(item.id) === String(priorTargetId)) ? priorTargetId : targetGames[0]?.id;
    const creators = typeof game.getCreatorProfiles === 'function'
        ? (game.getCreatorProfiles(selectedTargetId) || [])
        : (game.creatorProfiles || game.streamerProfiles || game.creators || []);
    const targetSelect = targetGames.length
        ? `<label class="marketing-key-target">Juego para las claves <select id="marketing-key-game" class="form-select" onchange="window.refreshMarketingHub()">${targetGames.map(item => `<option value="${item.id}" ${String(item.id) === String(selectedTargetId) ? 'selected' : ''}>${item.name}</option>`).join('')}</select></label>`
        : '<p class="marketing-empty">Crea o lanza un juego para enviar claves promocionales.</p>';
    const creatorCards = creators.length ? creators.map(creator => {
        const followers = Number(creator.followers || creator.audience || creator.viewers || 0);
        const genres = creator.genres || creator.preferences || creator.genrePreferences || [];
        const unavailable = creator.available === false || creator.alreadySent;
        const availability = creator.alreadySent ? 'Clave ya enviada a este creador' : (creator.available === false ? `[[DE_ICON_093]] Disponible en ${creator.yearUnlocked || 'una era posterior'}` : `Coste del paquete: $${Number(creator.fee || 0).toLocaleString()}`);
        return `<article class="marketing-creator-card"><div><b>${creator.name || 'Creador'}</b><span>${creator.platform || 'Plataforma de streaming'} · ${followers.toLocaleString()} seguidores</span><small>Preferencias: ${Array.isArray(genres) ? genres.join(', ') : genres || 'Variadas'}</small><small>${availability}</small></div><button type="button" class="dock-btn btn-send-streamer-key ${unavailable ? 'btn-soft-disabled' : ''}" data-creator-id="${creator.id}" onclick="window.sendMarketingKeys('${creator.id}')">[[DE_ICON_001]] Enviar clave</button></article>`;
    }).join('') : '<p class="marketing-empty">Los perfiles de creadores aparecerán cuando se desbloquee el streaming.</p>';
    const recentGameFeed = game.gamesHistory.slice(0, 5).flatMap(item => [
        ...(item.marketingFeed || []),
        ...(item.socialFeed || [])
    ]);
    const feed = [
        ...recentGameFeed,
        ...(project?.marketingFeed || []),
        ...(game.marketingFeed || []),
        ...(game.socialFeed || [])
    ].slice(-10).reverse();
    const feedMarkup = feed.length ? feed.map(post => `<li><span>${post.icon || '[[DE_ICON_103]]'}</span><div><b>${post.author || post.handle || post.source || 'Comunidad'}</b><p>${post.text || post.message || post.content || ''}</p><small>${post.time || post.date || ''}</small></div></li>`).join('') : '<li class="marketing-empty">Aún no hay comentarios. El feed reaccionará a tus campañas y lanzamientos.</li>';
    const broadcasts = game.streamerBroadcasts || [];
    const broadcastMarkup = broadcasts.length ? broadcasts.slice(-6).reverse().map(show => `<li><span>[[DE_ICON_115]]</span><div><b>${show.creatorName || show.name || 'Creador'} está retransmitiendo</b><p>${show.gameName || 'Tu juego'} · ${Number(show.viewers || show.retainedViewers || 0).toLocaleString()} espectadores</p></div></li>`).join('') : '<li class="marketing-empty">Las retransmisiones aparecerán cuando los creadores prueben tus juegos.</li>';
    const approvalGames = game.gamesHistory.filter(item => item.userApproval !== undefined || item.reviewBombing);
    const reviewsMarkup = approvalGames.length ? approvalGames.slice(0, 5).map(item => `<div class="marketing-review-row"><b>${item.name}</b><span>${item.pressScore !== undefined ? `Prensa ${Number(item.pressScore).toFixed(1)}/10 · ` : ''}${item.userApproval !== undefined ? `${Math.round(item.userApproval)}% aprobación` : ''}${item.reviewBombing ? ' · [[DE_ICON_016]] Review bombing' : ''}</span></div>`).join('') : '<p class="marketing-empty">Las reseñas de prensa y usuarios se registrarán al publicar un juego.</p>';

    const archive = game.marketingPressArchive || [];
    const pressArchiveMarkup = archive.length ? `<section class="marketing-section"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"><h3 style="margin: 0;">[[DE_ICON_061]] Archivo de Cobertura y Portadas de Prensa (${archive.length})</h3><span style="font-size: 11px; color: var(--accent-gold);">Colección Histórica</span></div><p class="marketing-section-note">Haz clic en cualquier portada histórica para ampliarla en detalle.</p><div class="marketing-press-gallery">${archive.map(cover => `<div class="press-gallery-card ${cover.period}" onclick="window.showMarketingPressCover('${cover.id}')"><div class="press-gallery-badge">${cover.priceBadge}</div><div class="press-gallery-pub">${cover.publicationName}</div><strong class="press-gallery-head">${cover.headline}</strong><div class="press-gallery-footer"><span>[[DE_ICON_001]] ${cover.gameName || 'Juego'}</span><span>Año ${cover.year}</span></div></div>`).join('')}</div></section>` : '';

    container.innerHTML = `<div class="marketing-summary"><span id="mkt-summary-year">[[DE_ICON_066]] Era ${year}</span><span id="mkt-summary-project">Proyecto: <b>${project?.name || 'ninguno activo'}</b></span><span id="mkt-summary-hype">Hype: <b>${Math.round(project?.marketingHype || project?.hype || 0)}</b></span><span id="mkt-summary-wishlists">Wishlists: <b>${Number(project?.wishlists || 0).toLocaleString()}</b></span></div><section class="marketing-section"><h3>[[DE_ICON_099]] Campaña de prelanzamiento</h3><p class="marketing-section-note">Los canales y efectos cambian según la época. Las campañas solo se pueden ejecutar con un proyecto activo.</p><div class="marketing-actions-grid">${campaigns || '<p class="marketing-empty">No hay canales disponibles en esta época.</p>'}</div></section><section class="marketing-section"><h3>[[DE_ICON_105]] Creadores y claves</h3>${targetSelect}<div class="marketing-creator-list">${creatorCards}</div></section><div class="marketing-columns"><section class="marketing-section"><h3>[[DE_ICON_115]] En directo</h3><ul class="marketing-feed-list">${broadcastMarkup}</ul></section><section class="marketing-section"><h3>[[DE_ICON_103]] Feed de comunidad</h3><ul class="marketing-feed-list">${feedMarkup}</ul></section></div>${pressArchiveMarkup}<section class="marketing-section"><h3>[[DE_ICON_005]] Prensa y reseñas de usuarios</h3>${reviewsMarkup}</section>`;
}

function updateMarketingHubCounters() {
    const yearEl = document.getElementById('mkt-summary-year');
    const projEl = document.getElementById('mkt-summary-project');
    const hypeEl = document.getElementById('mkt-summary-hype');
    const wishEl = document.getElementById('mkt-summary-wishlists');
    const project = game.currentProject;
    if (yearEl) yearEl.textContent = `[[DE_ICON_066]] Era ${game.getHistoricalYear()}`;
    if (projEl) projEl.innerHTML = `Proyecto: <b>${project?.name || 'ninguno activo'}</b>`;
    if (hypeEl) hypeEl.innerHTML = `Hype: <b>${Math.round(project?.marketingHype || project?.hype || 0)}</b>`;
    if (wishEl) wishEl.innerHTML = `Wishlists: <b>${Number(project?.wishlists || 0).toLocaleString()}</b>`;
}

function renderIndustryNews(state = game) {
    if (appState !== STATE_PLAYING) return;
    const modal = document.getElementById('modal-industry-news');
    const windowEl = document.getElementById('industry-news-window');
    const content = document.getElementById('industry-news-content');
    if (!modal || !content) return;
    const event = (state.pendingIndustryEvents || [])[0];
    if (!event) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        return;
    }

    // Auto-pausa la simulación para que el jugador tome su decisión táctica sin presión de tiempo
    if (game.gameSpeed > 0 && !window._pausedSpeedForNews) {
        window._pausedSpeedForNews = game.gameSpeed;
        if (typeof game.setGameSpeed === 'function') game.setGameSpeed(0);
        else game.gameSpeed = 0;
        updateSpeedButtonsUI(0);
    }

    const year = Number(event.createdYear) || state.getHistoricalYear();
    const isRetro = year <= 2004;
    windowEl?.classList.toggle('retro-news', isRetro);
    windowEl?.classList.toggle('modern-news', !isRetro);

    const choices = (event.choices || []).map(choice => {
        const cost = choice.cost !== undefined
            ? (typeof choice.cost === 'number' ? `$${Number(choice.cost).toLocaleString()}` : choice.cost)
            : '';
        const risks = Array.isArray(choice.risks) && choice.risks.length
            ? choice.risks.map(r => `<span class="choice-risk-tag">[[DE_ICON_016]] ${r}</span>`).join(' ')
            : '';
        const time = choice.timeWeeks ? `<span class="choice-time-tag">[[DE_ICON_075]] +${choice.timeWeeks} sem</span>` : '';
        const costTag = cost ? `<span class="choice-cost-tag">[[DE_ICON_042]] ${cost}</span>` : '<span class="choice-cost-tag gratis">[[DE_ICON_042]] Sin coste</span>';

        return `
            <article class="industry-choice-card">
                <div class="choice-main-info">
                    <div class="choice-header-row">
                        <h3>${choice.label || choice.title || 'Opción táctica'}</h3>
                        <div class="choice-badges">${costTag} ${time}</div>
                    </div>
                    <p>${choice.detail || choice.description || ''}</p>
                    ${risks ? `<div class="choice-risks-row">${risks}</div>` : ''}
                </div>
                <div class="choice-action-col">
                    <button type="button" class="dock-btn btn-primary-action" onclick="resolveIndustryChoice('${event.id}','${choice.id}')">
                        ${isRetro ? '[[DE_ICON_120]] Firmar Decisión' : '[[DE_ICON_022]] Ejecutar Orden'}
                    </button>
                </div>
            </article>
        `;
    }).join('');

    const kicker = isRetro
        ? `[[DE_ICON_061]] THE GAMING GAZETTE · EDICIÓN EXTRAORDINARIA DE PRENSA · AÑO ${year}`
        : `[[DE_ICON_115]] BREAKING NEWS WIRE · MERCADOS GLOBALES EN VIVO · AÑO ${year}`;

    content.innerHTML = `
        <div class="industry-news-kicker">${kicker}</div>
        <h2 class="industry-news-headline">${event.headline || event.title || 'La industria afronta una noticia urgente'}</h2>
        <p class="industry-news-body">${event.body || event.description || 'Una noticia inesperada puede afectar al proyecto y al mercado.'}</p>
        ${event.platformName ? `<div class="industry-news-context">Plataforma directamente afectada: <b>${event.platformName}</b></div>` : ''}
        <div class="industry-choice-list">${choices || '<p class="marketing-empty">No hay opciones disponibles.</p>'}</div>
    `;

    const anotherModalOpen = Array.from(document.querySelectorAll('.modal-backdrop.active')).some(item => item !== modal);
    if (!modal.classList.contains('active') && !anotherModalOpen) openModal('modal-industry-news');
}

window.resolveIndustryChoice = function(eventId, choiceId) {
    const result = typeof game.resolveIndustryEvent === 'function'
        ? game.resolveIndustryEvent(eventId, choiceId)
        : { success: false, message: 'La resolución de crisis todavía no está disponible.' };
    
    showToast(result.message || 'Decisión registrada.', result.success === false ? 'warn' : 'success');
    
    // Si la simulación fue auto-pausada por la noticia, restaurar la velocidad
    if (window._pausedSpeedForNews) {
        const resumeSpeed = window._pausedSpeedForNews;
        window._pausedSpeedForNews = 0;
        if (typeof game.setGameSpeed === 'function') game.setGameSpeed(resumeSpeed);
        else game.gameSpeed = resumeSpeed;
        updateSpeedButtonsUI(resumeSpeed);
    }

    renderIndustryNews();
    if (typeof updatePlatformOptions === 'function') updatePlatformOptions();
};

function renderCommunityWorkshop() {
    const gamesContainer = document.getElementById('community-workshop-games');
    if (!gamesContainer) return;
    const titles = game.gamesHistory || [];
    if (!titles.length) {
        gamesContainer.innerHTML = `
            <div class="business-offer-panel" style="text-align: center; padding: 30px;">
                <span style="font-size: 38px;">[[DE_ICON_034]]</span>
                <h3 style="margin: 10px 0;">Aún no has publicado ningún videojuego</h3>
                <p style="color: var(--text-secondary); font-size: 13px;">Lanza tu primer juego en el mercado para poder integrar la API oficial de modding y activar su Workshop comunitario.</p>
            </div>
        `;
        renderSimulatorMods();
        return;
    }

    const cards = titles.map(title => {
        const result = typeof game.getModdingStatus === 'function'
            ? game.getModdingStatus(title.id)
            : { available: false, eligible: false, enabled: Boolean(title.workshop?.enabled), workshop: title.workshop || {} };
        const workshop = result.workshop || title.workshop || {};
        const mods = Array.isArray(workshop.mods) ? workshop.mods : [];
        const popularMods = Number(workshop.popularMods ?? 0);
        const enabled = Boolean(result.enabled ?? workshop.enabled);
        const eligible = Boolean(result.eligible);
        const canEnable = Boolean(result.available && eligible && !enabled);

        let statusBadge = '';
        if (enabled) {
            statusBadge = workshop.compatibilityBroken
                ? '<span class="workshop-badge badge-broken">[[DE_ICON_016]] Compatibilidad rota por parche</span>'
                : '<span class="workshop-badge badge-active">[[DE_ICON_149]] API y mods compatibles</span>';
        } else if (eligible) {
            statusBadge = '<span class="workshop-badge badge-ready">[[DE_ICON_022]] API Investigada · Listo para activar</span>';
        } else {
            statusBadge = `<span class="workshop-badge badge-locked">[[DE_ICON_093]] ${result.status}</span>`;
        }

        const engagementVal = Number(workshop.engagement || 0);
        const engagementBar = `
            <div class="workshop-engagement-bar-container">
                <div class="workshop-engagement-bar" style="width: ${Math.min(100, engagementVal)}%;"></div>
            </div>
        `;

        const modList = mods.length
            ? `<ul class="workshop-mod-list">${mods.slice(0, 4).map(mod => `
                <li class="${mod.popular ? 'popular-mod-item' : ''}">
                    <div>
                        <b>${mod.popular ? '[[DE_ICON_040]] ' : '[[DE_ICON_034]] '}${mod.name || 'Mod comunitario'}</b>
                        <small style="display:block; color:var(--text-secondary);">Creador: @${mod.creator || 'Modder'} · ${mod.compatible ? '[[DE_ICON_149]] Compatible' : '[[DE_ICON_016]] Roto'}</small>
                    </div>
                    <span>${Number(mod.downloads || 0).toLocaleString()} descargas</span>
                </li>`).join('')}</ul>`
            : '<p class="workshop-empty">La comunidad empezará a publicar mods y expansiones cuando el Workshop esté en marcha.</p>';

        const action = !enabled
            ? `<button type="button" class="dock-btn btn-primary-action" onclick="enableGameWorkshop('${title.id}')" ${!canEnable ? 'disabled' : ''}>
                [[DE_ICON_034]] Activar Soporte Workshop (${title.moddingApiIncluded ? '$8,000+' : '$15,000+'})
               </button>`
            : (workshop.compatibilityBroken
                ? `<button type="button" class="dock-btn btn-primary-action btn-danger" onclick="updateGameModTools('${title.id}')">
                    [[DE_ICON_015]] Publicar Herramientas de Actualización (Restaurar compatibilidad)
                   </button>`
                : '<span class="workshop-compatible">[[DE_ICON_149]] Ecosistema Comunitario Óptimo</span>');

        return `
            <article class="workshop-game-card ${workshop.compatibilityBroken ? 'card-warning' : ''}">
                <div class="workshop-game-heading">
                    <div>
                        <h3>${title.name}</h3>
                        <p>${title.genre || 'Juego'} · Plataforma: ${title.platform || 'PC'}</p>
                    </div>
                    <div>${statusBadge}</div>
                </div>
                <div class="workshop-metrics">
                    <div class="metric-box">
                        <small>Engagement Comunitario</small>
                        <strong>${engagementVal}%</strong>
                        ${engagementBar}
                    </div>
                    <div class="metric-box">
                        <small>Mods Populares (+150% Ventas)</small>
                        <strong style="color: var(--accent-gold);">${popularMods}</strong>
                    </div>
                    <div class="metric-box">
                        <small>Conversiones Totales</small>
                        <strong style="color: var(--accent-cyan);">${Number(workshop.totalConversions || 0)}</strong>
                    </div>
                    <div class="metric-box">
                        <small>Vida Útil Extendida</small>
                        <strong style="color: var(--accent-green);">+${Number(workshop.weeksRemaining || 0)} sem</strong>
                    </div>
                </div>
                <div class="workshop-mods-section">
                    <h4 style="margin: 8px 0; font-size: 13px; color: #cbd5e1;">Mods Destacados de la Comunidad</h4>
                    ${modList}
                </div>
                <div class="workshop-actions">${action}</div>
            </article>
        `;
    }).join('');

    gamesContainer.innerHTML = cards;
    renderSimulatorMods();
}

function renderSimulatorMods() {
    const container = document.getElementById('community-simulator-mods');
    if (!container) return;

    const platforms = game.platforms || PLATFORMS;
    const streamers = game.creatorProfiles || [];
    const events = game.industryEventsCatalog || [];
    const installed = game.installedSimulatorMods || [];

    const moddedPlatforms = platforms.filter(p => p.isModded);
    const moddedStreamers = streamers.filter(s => s.isModded);

    container.innerHTML = `
        <div class="simulator-mods-dashboard">
            <div class="sim-stats-grid">
                <div class="sim-stat-card">
                    <span class="stat-icon">[[DE_ICON_001]]</span>
                    <div>
                        <strong>${platforms.length}</strong> Consolas Activas
                        <small style="display:block;color:var(--text-secondary);">${moddedPlatforms.length} consolas por mods</small>
                    </div>
                </div>
                <div class="sim-stat-card">
                    <span class="stat-icon">[[DE_ICON_105]]</span>
                    <div>
                        <strong>${streamers.length}</strong> Creadores de Contenido
                        <small style="display:block;color:var(--text-secondary);">${moddedStreamers.length} creadores por mods</small>
                    </div>
                </div>
                <div class="sim-stat-card">
                    <span class="stat-icon">[[DE_ICON_061]]</span>
                    <div>
                        <strong>${events.length}</strong> Crisis y Eventos Dinámicos
                        <small style="display:block;color:var(--text-secondary);">Catálogo Data-Driven JSON</small>
                    </div>
                </div>
                <div class="sim-stat-card">
                    <span class="stat-icon">[[DE_ICON_013]]</span>
                    <div>
                        <strong>${installed.length}</strong> Paquetes Instalados
                        <small style="display:block;color:var(--text-secondary);">Ecosistema de modding vivo</small>
                    </div>
                </div>
            </div>

            <div class="sim-mod-actions-toolbar">
                <button type="button" class="dock-btn btn-primary-action" onclick="window.loadSimulatorModSample()">
                    [[DE_ICON_022]] Cargar Pack Oficial: Marcas Reales & Creadores Famosos
                </button>
                <button type="button" class="dock-btn" onclick="document.getElementById('sim-mod-file-input').click()">
                    [[DE_ICON_121]] Importar Mod Personalizado (.JSON)
                </button>
                <button type="button" class="dock-btn" onclick="window.exportSimulatorModTemplate()">
                    [[DE_ICON_048]] Exportar Plantilla JSON de Modding
                </button>
                <input type="file" id="sim-mod-file-input" accept=".json" style="display:none;" onchange="window.importSimulatorModFile(event)">
            </div>

            <div class="installed-packages-section">
                <h3 style="margin: 14px 0 8px; font-size: 15px; color: #e2e8f0;">[[DE_ICON_013]] Paquetes de Comunidad Instalados</h3>
                ${installed.length ? `
                    <div class="installed-mod-list">
                        ${installed.map(pkg => `
                            <div class="installed-mod-card">
                                <div>
                                    <b style="color:var(--accent-cyan); font-size:14px;">${pkg.name}</b> <small style="color:var(--text-secondary);">v${pkg.version} por ${pkg.author}</small>
                                    <p style="margin:4px 0 0; color:#cbd5e1; font-size:12px;">${pkg.description}</p>
                                </div>
                                <div style="text-align:right;">
                                    <span class="workshop-badge badge-active">+${pkg.platformsCount} consolas · +${pkg.streamersCount} streamers</span>
                                    <small style="display:block;color:var(--text-secondary);margin-top:4px;">Instalado: ${pkg.installedAt}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p class="workshop-empty">No hay paquetes externos instalados todavía. Pulsa <b>"Cargar Pack Oficial"</b> o importa tu propio archivo JSON para expandir consolas reales (Sega Genesis, GBC, PS5 Pro, Switch 2, Steam Deck) y streamers (Ibai, Auronplay, Rubius).</p>
                `}
            </div>

            <div class="active-catalog-preview">
                <h3 style="margin: 16px 0 8px; font-size: 15px; color: #e2e8f0;">[[DE_ICON_037]] Plataformas y Consolas Disponibles en el Motor</h3>
                <div class="platforms-pill-grid">
                    ${platforms.map(p => `
                        <span class="platform-chip ${p.isModded ? 'chip-mod' : ''}">
                            ${p.icon || '[[DE_ICON_001]]'} ${p.name} (Era ${p.eraUnlocked}) ${p.isModded ? '<b>[MOD]</b>' : ''}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

window.switchWorkshopTab = function(tabName) {
    const gamesView = document.getElementById('workshop-games-view');
    const simView = document.getElementById('workshop-simulator-view');
    const tabGames = document.getElementById('tab-workshop-games');
    const tabSim = document.getElementById('tab-workshop-simulator');

    if (tabName === 'simulator') {
        if (gamesView) gamesView.style.display = 'none';
        if (simView) simView.style.display = 'block';
        tabGames?.classList.remove('active');
        tabSim?.classList.add('active');
        renderSimulatorMods();
    } else {
        if (gamesView) gamesView.style.display = 'block';
        if (simView) simView.style.display = 'none';
        tabGames?.classList.add('active');
        tabSim?.classList.remove('active');
    }
};

window.loadSimulatorModSample = function() {
    if (typeof game.loadModPackage !== 'function') return showToast('El motor de mods no está disponible.', 'warn');
    const res = game.loadModPackage(REAL_BRANDS_MOD_PACK);
    showToast(res.message, res.success ? 'success' : 'warn');
    renderSimulatorMods();
    updatePlatformOptions();
    if (soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
};

window.importSimulatorModFile = function(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            const res = game.loadModPackage(json);
            showToast(res.message, res.success ? 'success' : 'warn');
            renderSimulatorMods();
            updatePlatformOptions();
            if (soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
        } catch (err) {
            showToast(`Error al leer el archivo JSON: ${err.message}`, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
};

window.exportSimulatorModTemplate = function() {
    if (typeof game.exportModPackageTemplate !== 'function') return showToast('Función de exportación no disponible.', 'warn');
    const template = game.exportModPackageTemplate();
    const blob = new Blob([template], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'community_mod_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Plantilla oficial de modding descargada como "community_mod_template.json".', 'success');
};

window.enableGameWorkshop = function(gameId) {
    const result = typeof game.enableCommunityWorkshop === 'function'
        ? game.enableCommunityWorkshop(gameId)
        : { success: false, message: 'La API de Workshop todavía no está disponible.' };
    showToast(result.message || 'Workshop actualizado.', result.success === false ? 'warn' : 'success');
    renderCommunityWorkshop();
};

window.updateGameModTools = function(gameId) {
    const result = typeof game.publishModToolsUpdate === 'function'
        ? game.publishModToolsUpdate(gameId)
        : { success: false, message: 'Las herramientas de actualización todavía no están disponibles.' };
    showToast(result.message || 'Herramientas publicadas.', result.success === false ? 'warn' : 'success');
    renderCommunityWorkshop();
};

function updateSpeedButtonsUI(speed) {
    const btnPause = document.getElementById('btn-speed-pause');
    const btn1x = document.getElementById('btn-speed-1x');
    const btn2x = document.getElementById('btn-speed-2x');
    const btn3x = document.getElementById('btn-speed-3x');
    [btnPause, btn1x, btn2x, btn3x].forEach(btn => btn?.classList.remove('active'));
    if (speed === 0) btnPause?.classList.add('active');
    else if (speed === 1) btn1x?.classList.add('active');
    else if (speed === 2) btn2x?.classList.add('active');
    else if (speed === 3) btn3x?.classList.add('active');
}

window.refreshMarketingHub = renderMarketingHub;

window.runMarketingMethod = function(methodId) {
    if (!game.currentProject) {
        showToast('[[DE_ICON_016]] Se requiere un proyecto en desarrollo activo para lanzar campañas publicitarias.', 'warn');
        return;
    }
    const option = (game.getMarketingOptions ? game.getMarketingOptions() : []).find(item => item.id === methodId);
    if (!option) {
        showToast('Canal publicitario no reconocido.', 'warn');
        return;
    }
    if (option.available === false) {
        showToast(`[[DE_ICON_093]] Este canal publicitario estará disponible a partir del año ${option.year || 'una era posterior'}.`, 'warn');
        return;
    }
    if ((game.currentProject.marketingActions || []).some(item => item.id === methodId)) {
        showToast('[[DE_ICON_016]] Ya has utilizado este canal publicitario para tu proyecto actual.', 'warn');
        return;
    }
    if (['cd_demo', 'e3_trailer', 'digital_demo'].includes(methodId) && game.currentProject.overallProgress < 50) {
        showToast('[[DE_ICON_060]] Se requiere completar al menos el 50% del desarrollo antes de publicar demos o trailers jugables.', 'warn');
        return;
    }
    const cost = Number(option.cost || 0);
    if (game.funds < cost) {
        showToast(`[[DE_ICON_122]] Fondos insuficientes: La campaña requiere $${cost.toLocaleString()} y dispones de $${Math.floor(game.funds).toLocaleString()}.`, 'warn');
        return;
    }

    if (typeof game.runProjectMarketing !== 'function') {
        showToast('Las campañas todavía no están disponibles.', 'warn');
        return;
    }

    const result = game.runProjectMarketing(methodId);
    if (result && result.success !== false) {
        showToast(result.message || '[[DE_ICON_099]] ¡Campaña de marketing lanzada con éxito!', 'success');
        if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        renderMarketingHub();
        renderHUD(game);
        if (result.pressCover) {
            window.showMarketingPressCover(result.pressCover);
        }
    } else {
        showToast(result?.message || 'No se pudo ejecutar la campaña.', 'warn');
    }
};

window.sendMarketingKeys = function(creatorId) {
    if (window._isMarketingKeysRunning) return;
    window._isMarketingKeysRunning = true;
    setTimeout(() => { window._isMarketingKeysRunning = false; }, 350);

    const targetGames = [ ...(game.currentProject ? [{ id: game.currentProject.id || `project:${game.currentProject.name}`, name: `${game.currentProject.name} (en desarrollo)` }] : []), ...game.gamesHistory.map(item => ({ id: item.id, name: item.name })) ];
    if (!targetGames.length) {
        showToast('[[DE_ICON_016]] Debes tener un juego activo en desarrollo o lanzado para enviar claves.', 'warn');
        return;
    }
    const targetSelect = document.getElementById('marketing-key-game');
    const targetId = targetSelect?.value || targetGames[0]?.id;
    const creators = typeof game.getCreatorProfiles === 'function' ? game.getCreatorProfiles(targetId) : (game.creatorProfiles || []);
    const creator = creators.find(c => c.id === creatorId);
    if (creator && creator.alreadySent) {
        showToast(`[[DE_ICON_123]] Ya le has enviado claves promocionales a ${creator.name} para este juego.`, 'info');
        return;
    }
    if (creator && creator.available === false) {
        showToast(`[[DE_ICON_093]] Este creador estará disponible en ${creator.yearUnlocked || 'una era posterior'}.`, 'warn');
        return;
    }
    const fee = Number(creator?.fee || 0);
    if (game.funds < fee) {
        showToast(`[[DE_ICON_122]] Fondos insuficientes: El envío a ${creator?.name || 'este creador'} cuesta $${fee.toLocaleString()} y dispones de $${Math.floor(game.funds).toLocaleString()}.`, 'warn');
        return;
    }

    if (typeof game.sendStreamerKeys !== 'function') {
        showToast('El envío de claves todavía no están disponibles.', 'warn');
        return;
    }

    const result = game.sendStreamerKeys(targetId, creatorId, 1);
    if (result && result.success !== false) {
        showToast(result.message || '[[DE_ICON_001]] Clave promocional enviada.', 'success');
        if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        renderMarketingHub();
        renderHUD(game);
    } else {
        showToast(result?.message || 'No se pudo enviar la clave.', 'warn');
    }
};

function handleOfficeUpgrade() {
    const res = game.upgradeOffice();
    if (res.success) {
        world.buildOffice(res.newEra);
        world.syncEmployees(game.employees);
        updatePlatformOptions();
        showToast(`[[DE_ICON_073]] ¡ENHORABUENA! Tu empresa se ha mudado a: ${res.name}`, 'success');
        if (soundEngine) soundEngine.playFanfare(9.5);
    } else {
        showToast(res.message, 'warn');
    }
}

// --- REVIEWS MODAL ---

let lastReleasedGameId = null;

function showReviewModal(gameData) {
    lastReleasedGameId = gameData.id;
    currentLiveSalesWidgetGameId = gameData.id;
    if (typeof updateLiveSalesWidget === 'function') updateLiveSalesWidget();
    const container = document.getElementById('reviews-container');
    container.innerHTML = '';

    document.getElementById('review-game-title').innerText = `Lanzamiento: "${gameData.name}"`;
    document.getElementById('overall-score-num').innerText = gameData.score.toFixed(1);

    const banner = document.getElementById('overall-score-banner');
    if (gameData.score >= 9.0) {
        banner.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(0, 210, 255, 0.35))';
    } else if (gameData.score >= 7.0) {
        banner.style.background = 'linear-gradient(135deg, rgba(0, 210, 255, 0.25), rgba(168, 85, 247, 0.25))';
    } else {
        banner.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(168, 85, 247, 0.2))';
    }

    gameData.reviews.forEach(r => {
        const card = document.createElement('div');
        card.className = 'review-card';
        const scoreClass = r.score >= 8.0 ? 'high' : (r.score >= 6.0 ? 'med' : 'low');
        card.innerHTML = `
            <div class="critic-row">
                <span class="critic-name">${r.avatar} ${r.critic}</span>
                <span class="score-badge ${scoreClass}">${r.score.toFixed(1)}/10</span>
            </div>
            <p class="review-comment">"${r.comment}"</p>
        `;
        container.appendChild(card);
    });

    openModal('modal-reviews');
}

window.openCurrentReleasedGameChart = function() {
    closeAllModals();
    if (lastReleasedGameId) {
        window.openSalesChartModal(lastReleasedGameId);
    } else {
        window.openSalesChartModal();
    }
};

// --- RECRUITMENT & STAFF MANAGEMENT MODAL ---

function renderRecruitment() {
    const currentList = document.getElementById('current-team-list');
    currentList.innerHTML = '';

    const maxStaff = game.getMaxStaffCapacity();
    document.getElementById('hire-capacity').innerText = `Capacidad del Estudio: ${game.employees.length}/${maxStaff} miembros`;
    const modeStatus = document.getElementById('work-mode-status');
    const workMode = game.workMode || 'normal';
    const modeCopy = {
        normal: 'Activo: Ritmo normal · 40 horas, recuperación equilibrada y desgaste mínimo.',
        relaxed: 'Activo: Ritmo relajado · 30 horas, velocidad al 80% y recuperación de moral.',
        crunch: 'Activo: Crunch · +40% de avance, desgaste acelerado y riesgo de burnout.'
    };
    if (modeStatus) modeStatus.innerHTML = `<span>${modeCopy[workMode] || modeCopy.normal}</span>`;
    document.querySelectorAll('.hr-mode-buttons button').forEach(button => {
        const selected = button.getAttribute('onclick')?.includes(`'${workMode}'`);
        button.classList.toggle('active', Boolean(selected));
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    const headhuntPanel = document.getElementById('headhunt-notices');
    const headhunts = game.pendingHeadhunts || [];
    if (headhuntPanel) {
        headhuntPanel.style.display = headhunts.length ? 'grid' : 'none';
        headhuntPanel.innerHTML = headhunts.map(offer => {
            const employeeId = offer.employeeId || offer.id;
            const employee = game.employees.find(item => item.id === employeeId);
            const name = offer.employeeName || employee?.name || 'Empleado';
            const weeksRemaining = offer.deadlineWeeksRemaining;
            const deadlineLabel = weeksRemaining !== undefined ? `${weeksRemaining} semanas` : `${offer.deadlineDaysRemaining ?? offer.daysRemaining ?? 21} días`;
            const proposedSalary = offer.offeredSalary || offer.counterofferSalary || 0;
            return `<article class="hr-headhunt-card"><div><b>[[DE_ICON_056]] Oferta rival por ${name}</b><small>Salario propuesto: $${Number(proposedSalary).toLocaleString()}/mes · ${deadlineLabel} para responder</small></div><div><button class="staff-action-btn" onclick="resolveHeadhuntAction('${employeeId}','match')">Igualar oferta</button><button class="staff-action-btn" onclick="resolveHeadhuntAction('${employeeId}','bonus')">Bonus puntual</button><button class="staff-action-btn hr-danger-btn" onclick="resolveHeadhuntAction('${employeeId}','let_go')">Dejar marchar</button></div></article>`;
        }).join('');
    }

    // 1. Current Active Team with live Stamina bars
    game.employees.forEach(emp => {
        const energy = emp.energy ?? emp.stamina ?? 100;
        const staminaPct = Math.round((energy / (emp.maxStamina || 100)) * 100);
        const staminaClass = staminaPct > 50 ? '' : (staminaPct > 25 ? 'warn' : 'crit');
        const statusLabel = emp.burnoutState === 'total' ? 'Burnout total' : (emp.burnoutState === 'risk' ? 'Riesgo burnout' : (staminaPct > 50 ? 'Óptimo' : (staminaPct > 25 ? 'Cansado' : 'Fatigado')));
        const experience = emp.experience || emp.level || 'Mid';
        const stressResistance = emp.stressResistance ?? 50;
        const morale = emp.morale ?? 70;
        const stress = emp.stress ?? 0;
        const statusIcon = emp.burnoutState === 'total' ? '[[DE_ICON_003]]' : (emp.burnoutState === 'risk' ? '[[DE_ICON_022]]' : (staminaPct < 40 ? '[[DE_ICON_029]]' : (morale >= 80 ? '[[DE_ICON_028]]' : '')));
        const speedRating = emp.speedRating ?? Math.round((emp.speed || 1) * 75);

        const card = document.createElement('div');
        card.className = 'candidate-card';
        card.dataset.employeeId = emp.id;
        card.innerHTML = `
            <div style="flex-grow: 1;">
                <strong style="font-size: 15px; color: #fff;">${emp.name}</strong> 
                <span style="font-size: 11px; color: var(--accent-cyan);">[${emp.trait}]</span>
                <span class="hr-status-icon">${statusIcon}</span>
                <div style="font-size: 12px; color: var(--text-secondary); margin: 3px 0;">
                    ${emp.role} · ${experience} • [[DE_ICON_018]] Tech: <strong>${emp.tech}</strong> | [[DE_ICON_019]] Design: <strong>${emp.design}</strong> | [[DE_ICON_022]] Vel: <strong>${speedRating}</strong>
                </div>
                <div class="hr-employee-metrics"><span>[[DE_ICON_124]] Moral: ${Math.round(morale)}%</span><span>[[DE_ICON_022]] Estrés: ${Math.round(stress)}%</span><span>[[DE_ICON_021]] Resistencia: ${stressResistance}</span><span>[[DE_ICON_125]] Baja: ${emp.sickWeeksRemaining || 0} sem</span><span>[[DE_ICON_126]] Crunch: ${emp.continuousCrunchWeeks || 0} sem</span></div>
                <div class="stamina-container">
                    <span style="font-size: 11px; color: var(--text-secondary);">Energía:</span>
                    <div class="stamina-bar">
                        <div class="stamina-fill ${staminaClass}" style="width: ${staminaPct}%;"></div>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: ${staminaPct > 25 ? '#fff' : 'var(--accent-red)'};">
                        ${staminaPct}% (${statusLabel})
                    </span>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
                <span style="font-weight: 700; color: var(--accent-green); font-size: 13px;">$${emp.salary.toLocaleString()}/mes</span>
                <div class="hr-salary-controls"><button type="button" class="staff-action-btn" onclick="adjustEmployeeSalary('${emp.id}',${Math.round(emp.salary * 0.9)})">−10%</button><button type="button" class="staff-action-btn" onclick="adjustEmployeeSalary('${emp.id}',${Math.round(emp.salary * 1.1)})">+10%</button>${emp.isLead ? '<b class="hr-lead-badge">[[DE_ICON_005]] Líder</b>' : `<button type="button" class="staff-action-btn" onclick="assignEmployeeLead('${emp.id}')">[[DE_ICON_005]] Liderazgo</button>`}</div>
                <div style="display: flex; gap: 6px;">
                    <button class="staff-action-btn" onclick="sendOnVacation('${emp.id}')" title="Restaura 100% de energía">[[DE_ICON_108]] Vacaciones ($2k)</button>
                    <button class="staff-action-btn" onclick="trainEmployee('${emp.id}', 'tech')" title="+8 Tech permanentemente">[[DE_ICON_018]] +8 Tech</button>
                    <button class="staff-action-btn" onclick="trainEmployee('${emp.id}', 'design')" title="+8 Design permanentemente">[[DE_ICON_019]] +8 Des</button>
                </div>
            </div>
        `;
        currentList.appendChild(card);
    });

    const mentorSelect = document.getElementById('mentor-select');
    const menteeSelect = document.getElementById('mentee-select');
    const seniorStaff = game.employees.filter(emp => ['senior', 'lead'].includes(String(emp.experience || emp.level || '').toLowerCase()));
    const juniorStaff = game.employees.filter(emp => ['junior', 'entry'].includes(String(emp.experience || emp.level || '').toLowerCase()));
    if (mentorSelect) mentorSelect.innerHTML = (seniorStaff.length ? seniorStaff : []).map(emp => `<option value="${emp.id}">${emp.name} · ${emp.role}</option>`).join('') || '<option value="">No hay mentor senior disponible</option>';
    if (menteeSelect) menteeSelect.innerHTML = (juniorStaff.length ? juniorStaff : []).map(emp => `<option value="${emp.id}">${emp.name} · ${emp.role}</option>`).join('') || '<option value="">No hay aprendiz junior disponible</option>';
    const trainingButton = document.querySelector('.hr-training-panel button[onclick="startEmployeeMentoring()"]');
    if (trainingButton) trainingButton.disabled = !seniorStaff.length || !juniorStaff.length || game.currentProject !== null;
    const trainingHint = document.querySelector('.hr-training-panel small');
    if (trainingHint) trainingHint.textContent = game.currentProject
        ? 'Disponible cuando el estudio esté inactivo, sin un juego en producción.'
        : 'Asigna un mentor senior a un junior durante el tiempo inactivo del estudio.';

    // 2. Available Candidates Pool
    const candidatesList = document.getElementById('candidates-list');
    candidatesList.innerHTML = '';

    if (game.availableCandidates.length === 0) {
        candidatesList.innerHTML = `<p style="color: var(--text-secondary); padding: 10px;">No hay candidatos disponibles en este momento. Haz clic en "Buscar Nuevos Talentos".</p>`;
        return;
    }

    game.availableCandidates.forEach(c => {
        const card = document.createElement('div');
        card.className = 'candidate-card';
        card.innerHTML = `
            <div>
                <strong style="font-size: 15px; color: #fff;">${c.name}</strong> 
                <span style="font-size: 12px; color: var(--accent-cyan);">[${c.trait}]</span>
                <div style="font-size: 13px; color: var(--text-secondary); margin-top: 3px;">
                    ${c.role} · ${c.experience || c.level || 'Mid'} • [[DE_ICON_018]] Tech: <strong>${c.tech}</strong> | [[DE_ICON_019]] Design: <strong>${c.design}</strong> | [[DE_ICON_022]] Vel: <strong>${c.speedRating ?? Math.round((c.speed || 1) * 75)}</strong> | [[DE_ICON_021]] Estrés: <strong>${c.stressResistance ?? 50}</strong>
                </div>
                <div style="font-size: 11px; color: var(--text-secondary); font-style: italic; margin-top: 2px;">
                    ${c.desc || ''}
                </div>
            </div>
            <div>
                <span style="font-weight: 700; color: var(--accent-green); margin-right: 12px;">$${c.salary.toLocaleString()}/mes</span>
                <button class="release-btn" onclick="hireCandidate('${c.name}')">Contratar</button>
            </div>
        `;
        candidatesList.appendChild(card);
    });
}

window.hireCandidate = function(name) {
    const candidate = game.availableCandidates.find(c => c.name === name);
    if (!candidate) return;

    const res = game.hireEmployee(candidate);
    if (res.success) {
        world.syncEmployees(game.employees);
        renderRecruitment();
        showToast(`[[DE_ICON_073]] ¡${candidate.name} se ha unido al equipo de desarrollo!`, 'success');
    } else {
        showToast(res.message, 'warn');
    }
};

window.orderTeamCoffee = function() {
    const res = game.orderTeamCoffee();
    if (res.success) {
        renderRecruitment();
        showToast(res.message, 'success');
    } else {
        showToast(res.message, 'warn');
    }
};

window.setTeamWorkMode = function(mode) {
    const result = typeof game.setWorkMode === 'function'
        ? game.setWorkMode(mode)
        : { success: false, message: 'El selector de ritmo todavía no está disponible.' };
    showToast(result.message || `Ritmo de trabajo: ${mode}.`, result.success === false ? 'warn' : 'success');
    renderRecruitment();
};

window.refreshCandidates = function() {
    const budget = Number(document.getElementById('recruitment-budget')?.value || 2500);
    const res = typeof game.refreshCandidatePool === 'function'
        ? game.refreshCandidatePool(budget)
        : game.refreshCandidates(budget);
    if (res.success) {
        renderRecruitment();
        showToast("[[DE_ICON_062]] Bolsa de empleo actualizada con nuevos candidatos.", 'info');
    } else {
        showToast(res.message, 'warn');
    }
};

window.adjustEmployeeSalary = function(empId, change) {
    const result = typeof game.adjustEmployeeSalary === 'function'
        ? game.adjustEmployeeSalary(empId, change)
        : { success: false, message: 'El ajuste salarial todavía no está disponible.' };
    showToast(result.message, result.success ? 'success' : 'warn');
    renderRecruitment();
};

window.adjustSelectedEmployeeSalary = function(change) {
    const employee = game.employees[selectedDevIndex];
    if (!employee) return;
    window.adjustEmployeeSalary(employee.id, Math.round(employee.salary * (1 + Number(change || 0))));
};

window.assignEmployeeLead = function(empId) {
    const result = typeof game.assignLeadership === 'function'
        ? game.assignLeadership(empId)
        : { success: false, message: 'La asignación de liderazgo todavía no está disponible.' };
    showToast(result.message, result.success ? 'success' : 'warn');
    renderRecruitment();
};

window.assignSelectedEmployeeLead = function() {
    const employee = game.employees[selectedDevIndex];
    if (employee) window.assignEmployeeLead(employee.id);
};

window.resolveHeadhuntAction = function(empId, action) {
    const result = typeof game.resolveHeadhunt === 'function'
        ? game.resolveHeadhunt(empId, action)
        : { success: false, message: 'La respuesta a headhunters todavía no está disponible.' };
    showToast(result.message, result.success ? 'success' : 'warn');
    renderRecruitment();
};

window.startEmployeeMentoring = function() {
    const mentorId = document.getElementById('mentor-select')?.value;
    const menteeId = document.getElementById('mentee-select')?.value;
    const currency = document.getElementById('mentoring-currency')?.value || 'funds';
    const result = typeof game.mentorEmployee === 'function'
        ? game.mentorEmployee(mentorId, menteeId, currency)
        : { success: false, message: 'La mentoría estará disponible cuando el estudio esté inactivo.' };
    showToast(result.message, result.success ? 'success' : 'warn');
    renderRecruitment();
};

window.sendOnVacation = function(empId) {
    const res = game.sendOnVacation(empId);
    if (res.success) {
        renderRecruitment();
        showToast(res.message, 'success');
    } else {
        showToast(res.message, 'warn');
    }
};

window.trainEmployee = function(empId, skillType) {
    const res = game.trainEmployee(empId, skillType);
    if (res.success) {
        renderRecruitment();
        showToast(res.message, 'success');
    } else {
        showToast(res.message, 'warn');
    }
};

// --- TECH TREE & R&D SYSTEM ---

let activeTechBranchFilter = 'all';

function setupTechBranchFilterTabs() {
    const tabsContainer = document.getElementById('branch-filter-tabs');
    if (!tabsContainer || tabsContainer.dataset.initialized === 'true') return;
    tabsContainer.dataset.initialized = 'true';

    tabsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.branch-tab-btn');
        if (!btn) return;
        activeTechBranchFilter = btn.dataset.branch || 'all';

        tabsContainer.querySelectorAll('.branch-tab-btn').forEach(b => {
            b.classList.toggle('active', b === btn);
        });

        renderTechTree();
    });

    // Wire collapsible toggle for reverse engineering hardware
    const toggleBtn = document.getElementById('btn-toggle-rev-hardware');
    const panel = document.getElementById('reverse-engineering-panel');
    const toggleIcon = document.getElementById('rev-hardware-toggle-icon');
    if (toggleBtn && panel) {
        toggleBtn.onclick = () => {
            const isHidden = panel.style.display === 'none' || panel.style.display === '';
            panel.style.display = isHidden ? 'block' : 'none';
            if (toggleIcon) toggleIcon.innerText = isHidden ? 'Plegar [[DE_ICON_151]]' : 'Desplegar [[DE_ICON_152]]';
        };
    }
}

function renderTechTree() {
    setupTechBranchFilterTabs();

    const mgr = techTreeManager || (game && game.techTreeManager);
    if (!game || !mgr) return;

    const historicalYear = game.getHistoricalYear ? game.getHistoricalYear() : (1981 + game.year);

    // 1. Top Economy & Status Indicators
    const rpEl = document.getElementById('research-rp-val');
    if (rpEl) rpEl.innerText = game.researchPoints.toLocaleString();

    const yearEl = document.getElementById('research-year-val');
    if (yearEl) {
        let eraTag = 'Era 8-bit';
        if (historicalYear >= 2015) eraTag = 'Era Moderna';
        else if (historicalYear >= 2000) eraTag = 'Era 2000+';
        else if (historicalYear >= 1990) eraTag = 'Era 16/32-bit';
        yearEl.innerText = `Año ${historicalYear} (${eraTag})`;
    }

    const passiveEl = document.getElementById('research-passive-val');
    if (passiveEl) {
        const totalTech = game.employees.reduce((acc, e) => acc + (e.tech || 20), 0);
        const weeklyRP = Math.max(1, Math.floor(totalTech / 45));
        passiveEl.innerText = `+${weeklyRP} RP/semana`;
    }

    const countEl = document.getElementById('research-unlocked-count');
    if (countEl) {
        countEl.innerText = `${mgr.getUnlockedCount()} / ${mgr.getTotalCount()} Módulos`;
    }

    // 2. Active Research Project Countdown Banner
    const activeContainer = document.getElementById('active-research-container');
    if (activeContainer) {
        if (game.activeResearch) {
            const ar = game.activeResearch;
            activeContainer.innerHTML = `
                <div class="active-research-card">
                    <div class="active-research-header">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">${ar.icon}</span>
                            <div>
                                <strong style="font-size: 15px; color: #fff;">Proyecto en Curso: "${ar.nodeName}"</strong>
                                <div style="font-size: 12px; color: var(--accent-cyan); margin-top: 2px;">
                                    [[DE_ICON_075]] Quedan ${ar.weeksRemaining} semana${ar.weeksRemaining === 1 ? '' : 's'} para concluir el desarrollo
                                </div>
                            </div>
                        </div>
                        <div style="font-size: 16px; font-weight: 800; color: var(--accent-cyan);">${ar.progress}%</div>
                    </div>
                    <div class="research-progress-bar">
                        <div class="research-progress-fill" style="width: ${ar.progress}%;"></div>
                    </div>
                </div>
            `;
        } else {
            activeContainer.innerHTML = `
                <div style="background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.12); border-radius: 10px; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                    <span style="font-size: 12px; color: var(--text-secondary);">
                        [[DE_ICON_028]] No hay ningún proyecto de I+D activo. Selecciona un módulo <strong>INVESTIGABLE</strong> para iniciar el desarrollo con tu equipo.
                    </span>
                    <span class="node-status-badge badge-available">Equipo Listo</span>
                </div>
            `;
        }
    }

    const enginePanel = document.getElementById('engine-management-container');
    if (enginePanel) {
        const rd = game.activeEngineRD;
        const engineCards = game.inHouseEngines.map(engine => {
            const efficiency = engine.getEfficiency ? Math.round(engine.getEfficiency(game.year, game.week) * 100) : 100;
            return `<div class="active-research-card" style="margin-bottom:8px"><strong>${engine.name}</strong><span style="margin-left:10px;color:${efficiency < 80 ? 'var(--accent-gold)' : 'var(--accent-green)'}">Modernidad ${efficiency}%</span><div style="font-size:11px;color:var(--text-secondary);margin:4px 0">Especialidad: ${(engine.affineGenres || []).join(', ') || 'general' } · Licencias activas: ${(engine.licensees || []).length}</div><button type="button" class="dock-btn" onclick="upgradeStudioEngine('${engine.id}')">Actualizar e integrar los módulos seleccionados ($20.000 + $4.000/módulo, 25 RP)</button> <button type="button" class="dock-btn" onclick="licenseStudioEngine('${engine.id}')">Licenciar a estudio</button></div>`;
        }).join('');
        enginePanel.innerHTML = `${rd ? `<div class="active-research-card" style="margin-bottom:10px"><strong>[[DE_ICON_015]] I+D de motor: ${rd.name}</strong><div style="font-size:12px;color:var(--accent-cyan)">Quedan ${rd.weeksRemaining} semanas · ${rd.progress}%</div><div class="research-progress-bar"><div class="research-progress-fill" style="width:${rd.progress}%"></div></div></div>` : ''}${engineCards ? `<h3 style="font-size:14px;color:var(--accent-gold);margin:10px 0">Motores de la empresa</h3>${engineCards}` : ''}`;
    }

    // 3. Competitor Hardware Reverse Engineering Grid
    const revGrid = document.getElementById('reverse-engineering-grid');
    if (revGrid && typeof REVERSE_ENGINEERING_CATALOG !== 'undefined') {
        revGrid.innerHTML = '';
        REVERSE_ENGINEERING_CATALOG.forEach(item => {
            const isDismantled = mgr.dismantledHardware.has(item.id);
            const isAvailableByYear = historicalYear >= item.minYear;
            const canAfford = game.funds >= item.costMoney;

            const card = document.createElement('div');
            card.className = 'rev-card' + (isDismantled ? ' dismantled' : '');
            
            let actionHtml = '';
            if (isDismantled) {
                actionHtml = `<span style="font-size: 11px; font-weight: 700; color: var(--accent-green);">[[DE_ICON_149]] Desmantelado (+${item.rpGain} RP)</span>`;
            } else if (!isAvailableByYear) {
                actionHtml = `<span style="font-size: 11px; color: var(--accent-red); font-weight: 700;">[[DE_ICON_093]] Bloqueado (Año ${item.minYear})</span>`;
            } else {
                actionHtml = `
                    <button class="dock-btn btn-primary-action" style="padding: 5px 12px; font-size: 11px;" ${!canAfford ? 'disabled style="opacity:0.5;"' : ''} onclick="dismantleHardware('${item.id}')">
                        [[DE_ICON_106]] Desmantelar ($${item.costMoney.toLocaleString()})
                    </button>
                `;
            }

            card.innerHTML = `
                <div>
                    <div class="rev-card-title">
                        <span>${item.icon}</span> ${item.name}
                    </div>
                    <div style="font-size: 11px; color: var(--accent-gold); margin: 3px 0 6px 0;">
                        ${item.era} • Año min: ${item.minYear} • +${item.rpGain} RP
                    </div>
                    <div class="rev-card-desc">${item.desc}</div>
                </div>
                <div class="rev-card-footer">
                    <span style="font-size: 12px; font-weight: 700; color: #fff;">$${item.costMoney.toLocaleString()}</span>
                    ${actionHtml}
                </div>
            `;
            revGrid.appendChild(card);
        });
    }

    // 4. Tech Tree Branches Container (22 Specialized Nodes)
    const branchesContainer = document.getElementById('tech-tree-branches-container');
    if (branchesContainer) {
        branchesContainer.innerHTML = '';

        const branchDefs = [
            { id: 'render', name: 'Motor Gráfico & Renderizado', icon: '[[DE_ICON_054]]' },
            { id: 'physics', name: 'Físicas & Colisiones Cinemáticas', icon: '[[DE_ICON_055]]' },
            { id: 'netcode', name: 'Netcode & Sincronización de Red', icon: '[[DE_ICON_020]]' },
            { id: 'ai', name: 'Inteligencia Artificial & Lógica', icon: '[[DE_ICON_056]]' },
            { id: 'audio', name: 'Pipeline Acústico & Audio Espacial', icon: '[[DE_ICON_045]]' },
            { id: 'content', name: 'Contenido & Estructura de Mundo', icon: '[[DE_ICON_057]]' },
            { id: 'systems', name: 'Sistemas Avanzados & Jugabilidad', icon: '[[DE_ICON_049]]' }
        ];

        branchDefs.forEach(branch => {
            if (activeTechBranchFilter !== 'all' && activeTechBranchFilter !== branch.id) {
                return;
            }

            const branchNodes = mgr.catalog.filter(n => {
                if (branch.id === 'netcode') return n.category === 'netcode' || n.category === 'net';
                return n.category === branch.id;
            });

            if (branchNodes.length === 0) return;

            const block = document.createElement('div');
            block.className = 'tech-tree-branch-block';
            block.innerHTML = `<div class="tech-tree-branch-title"><span>${branch.icon}</span> ${branch.name} (${branchNodes.length} módulos)</div>`;

            const grid = document.createElement('div');
            grid.className = 'tech-tree-branch-grid';

            branchNodes.forEach(node => {
                const stateInfo = mgr.getNodeState(node.id, historicalYear);
                const isUnlocked = stateInfo.state === 'DESBLOQUEADO';
                const isInvestigable = stateInfo.state === 'INVESTIGABLE';
                const isLocked = stateInfo.state === 'BLOQUEADO';

                const card = document.createElement('div');
                card.className = 'tech-node-card' +
                    (isUnlocked ? ' unlocked' : '') +
                    (isInvestigable ? ' investigable' : '') +
                    (isLocked ? ' locked' : '');

                // Status Badge
                let badgeClass = 'badge-locked';
                let badgeLabel = '[[DE_ICON_093]] Bloqueado';
                if (isUnlocked) {
                    badgeClass = 'badge-unlocked';
                    badgeLabel = '[[DE_ICON_149]] Desbloqueado';
                } else if (isInvestigable) {
                    badgeClass = 'badge-investigable';
                    badgeLabel = '[[DE_ICON_022]] Investigable';
                }

                // Requirements preview
                const prereqs = node.prerequisites || [];
                let prereqHtml = '';
                if (prereqs.length > 0) {
                    const pills = prereqs.map(pId => {
                        const pDef = mgr.catalogMap.get(pId);
                        const pName = pDef ? pDef.name : pId;
                        const met = mgr.isUnlocked(pId);
                        return `<span class="req-pill ${met ? 'req-ok' : 'req-missing'}">${met ? '[[DE_ICON_149]]' : '[[DE_ICON_150]]'} ${pName}</span>`;
                    }).join(' ');
                    prereqHtml = `<div class="tech-prereq-row"><span style="opacity: 0.7;">Req:</span> ${pills}</div>`;
                } else {
                    prereqHtml = `<div class="tech-prereq-row"><span class="req-pill req-ok">[[DE_ICON_064]] Fundación Base</span></div>`;
                }

                // Action button or status description
                let actionArea = '';
                if (isUnlocked) {
                    actionArea = `
                        <div style="text-align: right; font-size: 11px; font-weight: 700; color: var(--accent-green); padding: 8px 0;">
                            [[DE_ICON_149]] Integrado en el catálogo de producción
                        </div>
                    `;
                } else if (isInvestigable) {
                    const canAffordRP = game.researchPoints >= (node.costRP ?? 30);
                    const isBusy = game.activeResearch !== null;
                    const disabled = !canAffordRP || isBusy;
                    const btnText = isBusy ? '[[DE_ICON_060]] Equipo Ocupado en I+D' : (!canAffordRP ? `RP Insuficiente (${node.costRP} RP)` : `[[DE_ICON_006]] Iniciar Investigación (${node.costRP} RP)`);

                    actionArea = `
                        <button class="btn-start-research" ${disabled ? 'disabled' : ''} onclick="startTechResearch('${node.id}')">
                            ${btnText}
                        </button>
                    `;
                } else {
                    // Locked: show exact reason
                    let reasonText = stateInfo.reason;
                    if (stateInfo.isHistoricalLock) {
                        reasonText = `[[DE_ICON_093]] Tecnología Desconocida (Aparición: Año ${stateInfo.minYear})`;
                    }
                    actionArea = `
                        <div style="font-size: 11px; color: var(--accent-red); padding: 8px 0; line-height: 1.3;">
                            ${reasonText}
                        </div>
                    `;
                }

                // Name: if historical lock, display "Tecnología Desconocida" according to requirements!
                const displayName = stateInfo.isHistoricalLock ? `[[DE_ICON_093]] Tecnología Desconocida (Tier ${node.tier})` : `${node.icon} ${node.name}`;
                const displayDesc = stateInfo.isHistoricalLock ? `Esta tecnología aún no ha sido descubierta por la industria de los videojuegos. Estará disponible a partir del año histórico ${stateInfo.minYear}.` : node.desc;

                card.innerHTML = `
                    <div>
                        <div class="tech-node-header">
                            <span class="tech-node-title">${displayName}</span>
                            <span class="tech-status-badge ${badgeClass}">${badgeLabel}</span>
                        </div>
                        <div class="tech-meta-row">
                            <span class="tech-meta-item">[[DE_ICON_066]] ${node.eraName || 'Era 8-bit'}</span>
                            <span class="tech-meta-item">Año min: ${node.minYear || 1982}</span>
                            <span class="tech-meta-item" style="color: var(--accent-cyan); font-weight: 700;">Coste: ${node.costRP || 0} RP</span>
                        </div>
                        <p class="tech-node-desc">${displayDesc}</p>
                    </div>
                    <div>
                        ${prereqHtml}
                        ${actionArea}
                    </div>
                `;

                grid.appendChild(card);
            });

            block.appendChild(grid);
            branchesContainer.appendChild(block);
        });
    }

    // 5. Populate Engine Feature Checkboxes (Only for Unlocked Nodes)
    const checkContainer = document.getElementById('engine-features-checkboxes');
    if (checkContainer) {
        checkContainer.innerHTML = '';
        mgr.catalog.filter(node => mgr.isUnlocked(node.id)).forEach((node, index) => {
            const lbl = document.createElement('label');
            lbl.style.display = 'flex';
            lbl.style.alignItems = 'center';
            lbl.style.gap = '8px';
            lbl.style.fontSize = '12px';
            lbl.style.margin = '4px 0';
            lbl.style.color = '#fff';
            lbl.innerHTML = `<input type="checkbox" name="engine-feat" value="${node.id}" ${index < 3 ? 'checked' : ''}> ${node.icon} ${node.name}`;
            checkContainer.appendChild(lbl);
        });
        const refreshWarning = () => updateHistoricalWarning('engine-historical-warning', Array.from(checkContainer.querySelectorAll('input[name="engine-feat"]:checked')).map(el => el.value).filter(id => id.startsWith('tech_')));
        checkContainer.onchange = refreshWarning;
        refreshWarning();
    }
    const genreContainer = document.getElementById('engine-specialty-genres');
    if (genreContainer && !genreContainer.dataset.rendered) {
        const genres = [['Action', 'Acción'], ['RPG', 'RPG'], ['Strategy', 'Estrategia'], ['Simulation', 'Simulación'], ['Adventure', 'Aventura'], ['Casual', 'Casual']];
        genreContainer.innerHTML = genres.map(([id, label], i) => `<label style="font-size:12px;color:#fff"><input type="checkbox" name="engine-genre" value="${id}" ${i < 2 ? 'checked' : ''}> ${label}</label>`).join('');
        genreContainer.dataset.rendered = 'true';
    }
}

window.upgradeStudioEngine = function(engineId) {
    const selectedNodes = Array.from(document.querySelectorAll('input[name="engine-feat"]:checked')).map(el => el.value);
    const result = game.upgradeInHouseEngine(engineId, selectedNodes.filter(id => !id.startsWith('tech_')), selectedNodes.filter(id => id.startsWith('tech_')));
    showToast(result.message, result.success ? 'success' : 'warn');
    if (result.success) renderTechTree();
};

window.licenseStudioEngine = function(engineId) {
    const studio = window.prompt('Nombre del estudio que recibirá la licencia:');
    if (!studio) return;
    const fee = Number(window.prompt('Regalía mensual ($):', '4500'));
    if (!Number.isFinite(fee) || fee <= 0) {
        showToast('Introduce una regalía mensual mayor que cero.', 'warn');
        return;
    }
    const result = game.licenseInHouseEngineToStudio(engineId, studio.trim(), fee);
    showToast(result.message, result.success ? 'success' : 'warn');
    if (result.success) renderTechTree();
};

window.startTechResearch = function(techId) {
    if (!game) return;
    const res = game.startTechResearch(techId);
    if (res.success) {
        renderTechTree();
        renderHUD(game);
        showToast(res.message, 'success');
    } else {
        showToast(res.message, 'warn');
        if (soundEngine && soundEngine.playDebtAlert) soundEngine.playDebtAlert();
    }
};

window.dismantleHardware = function(hwId) {
    if (!game) return;
    const res = game.reverseEngineerHardware(hwId);
    if (res.success) {
        renderTechTree();
        renderHUD(game);
        showToast(res.message, 'success');
    } else {
        showToast(res.message, 'warn');
        if (soundEngine && soundEngine.playDebtAlert) soundEngine.playDebtAlert();
    }
};

window.researchTech = function(id) {
    window.startTechResearch(id);
};

document.getElementById('form-custom-engine').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('input-engine-name').value.trim() || 'Motor Pro v' + (game.customEngines.length + 1);
    const checked = Array.from(document.querySelectorAll('input[name="engine-feat"]:checked')).map(el => el.value);

    if (checked.length === 0) {
        showToast("Debes seleccionar al menos un módulo tecnológico.", "warn");
        return;
    }

    const affineGenres = Array.from(document.querySelectorAll('input[name="engine-genre"]:checked')).map(el => el.value);
    const historicalTechIds = checked.filter(id => id.startsWith('tech_'));
    const res = game.startInHouseEngineRD({ name, bakedNodes: checked.filter(id => !id.startsWith('tech_')), historicalTechIds, affineGenres });
    if (res.success) {
        updateEngineOptions();
        renderTechTree();
        renderPipelineSelector();
        showToast(res.message || `[[DE_ICON_049]] ¡Nuevo motor "${name}" compilado con éxito!`, 'success');
        document.getElementById('input-engine-name').value = '';
    } else {
        showToast(res.message, 'warn');
    }
});

// --- CHARTS & HISTORY MODAL (WITH TOP 10 RIVAL LEADERBOARD) ---

function renderHistoryAndCharts() {
    renderTop10Leaderboard();

    const historyList = document.getElementById('games-history-list');
    if (!historyList) return;
    historyList.innerHTML = '';

    if (game.gamesHistory.length === 0) {
        historyList.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Aún no has publicado ningún videojuego.</p>`;
        return;
    }

    game.gamesHistory.forEach(g => {
        const card = document.createElement('div');
        card.className = 'history-card';
        const isProfitable = g.profit >= 0;

        let statusPill = '';
        if (g.retired) {
            statusPill = `<span style="display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(148, 163, 184, 0.2); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.4);">[[DE_ICON_013]] Retirado (${g.retiredYear || ''})</span>`;
        } else if (g.lifecycleState === 'long_tail') {
            statusPill = `<span style="display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(251, 191, 36, 0.18); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.45);">[[DE_ICON_060]] Cola Larga</span>`;
        } else {
            statusPill = `<span style="display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(56, 189, 248, 0.18); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.45);">[[DE_ICON_003]] En Pico de Ventas</span>`;
        }

        let postMortemBtn = '';
        if (g.postMortemReport) {
            postMortemBtn = `<button class="staff-action-btn" style="border-color: #a855f7; color: #d8b4fe;" onclick="showPostMortemModal('${g.id}')">[[DE_ICON_030]] Ver Informe</button>`;
        } else if (g.postMortemInProgress) {
            postMortemBtn = `<button class="staff-action-btn" disabled style="opacity: 0.7; border-color: rgba(255,255,255,0.2);">[[DE_ICON_060]] Analizando...</button>`;
        } else {
            postMortemBtn = `<button class="staff-action-btn" onclick="startPostMortem('${g.id}')">[[DE_ICON_011]] Crear Informe (+RP)</button>`;
        }

        const retireBtn = !g.retired
            ? `<button class="staff-action-btn" style="border-color: #ef4444; color: #f87171;" onclick="retireGameFromHistory('${g.id}')" title="Retirar permanentemente del mercado">[[DE_ICON_013]] Retirar</button>`
            : '';

        card.innerHTML = `
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <strong style="font-size: 16px; color: #fff;">${g.name}</strong> 
                    <span class="score-badge ${g.score >= 8 ? 'high' : (g.score >= 6 ? 'med' : 'low')}" style="font-size: 12px;">[[DE_ICON_148]] ${g.score}</span>
                    ${statusPill}
                </div>
                <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                    ${g.topic} • ${g.genre} • Plataforma: ${g.platform} [Aud: ${g.targetAudience}]
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap; justify-content: flex-end;">
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: #fff;">${g.businessModel === 'f2p' || g.businessModel === 'live_service' ? `${(g.installationsTotal || 0).toLocaleString()} instalaciones` : `${(g.unitsSoldTotal || 0).toLocaleString()} copias`}</div>
                    <div style="font-size: 13px; font-weight: 700; color: ${isProfitable ? 'var(--accent-green)' : 'var(--accent-red)'};">
                        ${isProfitable ? '+' : ''}$${Math.floor(g.profit).toLocaleString()}
                    </div>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button class="staff-action-btn" onclick="focusGameInLiveWidget('${g.id}')" title="Fijar y ver en el widget flotante del HUD">[[DE_ICON_127]] HUD</button>
                    <button class="staff-action-btn" onclick="openSalesChartModal('${g.id}')" title="Ver gráfica interactiva de ventas semanales">[[DE_ICON_012]] Gráfica</button>
                    ${postMortemBtn}
                    ${retireBtn}
                </div>
            </div>
        `;
        historyList.appendChild(card);
    });
}

function renderTop10Leaderboard() {
    const container = document.getElementById('chart-leaderboard-container');
    if (!container) return;

    let html = `
        <table class="leaderboard-table">
            <thead>
                <tr>
                    <th style="width: 50px;">Pos</th>
                    <th>Título del Juego</th>
                    <th>Estudio Desarrollador</th>
                    <th style="text-align: right;">Ventas Semanales</th>
                    <th style="text-align: right;">Ventas Totales</th>
                    <th style="text-align: center; width: 60px;">Nota</th>
                </tr>
            </thead>
            <tbody>
    `;

    game.top10Chart.slice(0, 10).forEach(item => {
        let trendIcon = '<span class="trend-arrow same">▬</span>';
        if (item.trend === 'up') trendIcon = '<span class="trend-arrow up">[[DE_ICON_151]]</span>';
        if (item.trend === 'down') trendIcon = '<span class="trend-arrow down">[[DE_ICON_152]]</span>';
        if (item.trend === 'new') trendIcon = '<span class="trend-arrow new">[[DE_ICON_148]]</span>';

        const rowClass = item.isPlayer ? 'leaderboard-row player-row' : 'leaderboard-row';
        const rankColor = item.rank === 1 ? 'var(--accent-gold)' : (item.rank <= 3 ? 'var(--accent-cyan)' : '#fff');

        html += `
            <tr class="${rowClass}">
                <td style="font-weight: 900; color: ${rankColor};">${trendIcon} #${item.rank}</td>
                <td><strong style="color: #fff;">${item.title}</strong></td>
                <td style="color: var(--text-secondary); font-size: 13px;">${item.dev}</td>
                <td style="text-align: right; font-weight: 700; color: var(--accent-cyan);">${item.weeklySales.toLocaleString()}</td>
                <td style="text-align: right; color: #fff;">${item.totalSales.toLocaleString()}</td>
                <td style="text-align: center;"><span class="score-badge ${item.score >= 8 ? 'high' : (item.score >= 6 ? 'med' : 'low')}" style="font-size: 11px; padding: 2px 6px;">${item.score}</span></td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// --- POST-MORTEM GAME REPORT CONTROLLER ---

window.startPostMortem = function(gameId) {
    const res = game.startPostMortemAnalysis(gameId, 0);
    if (res.success) {
        showToast(res.message, 'success');
        renderHistoryAndCharts();
        const chartModal = document.getElementById('modal-sales-chart');
        if (chartModal && chartModal.classList.contains('active')) {
            renderSelectedGameSalesChart();
        }
    } else {
        showToast(res.message, 'warn');
    }
};

window.showPostMortemModal = function(gameId) {
    const targetGame = game.gamesHistory.find(g => g.id === gameId);
    if (!targetGame) return showToast('Juego no encontrado.', 'warn');

    let report = targetGame.postMortemReport;
    if (!report) {
        const res = game.completePostMortemAnalysis(gameId);
        report = res.report;
    }

    if (!report) return showToast('No se pudo cargar el informe.', 'warn');

    document.getElementById('pm-title').innerHTML = `<span>[[DE_ICON_030]]</span> Informe Post-Mortem: "${report.gameName}"`;
    document.getElementById('pm-rp-gain').innerText = `+${report.rpGained} Puntos de Investigación Obtenidos`;
    document.getElementById('pm-synergy-text').innerText = report.synergy || '';
    document.getElementById('pm-audience-text').innerText = report.audience || '';
    document.getElementById('pm-architecture-text').innerText = report.architecture || '';
    document.getElementById('pm-sliders-text').innerText = report.sliderCalibration || '';

    openModal('modal-postmortem');
};

window.generateReport = function(gameId) {
    const targetGame = game.gamesHistory.find(g => g.id === gameId);
    if (targetGame && targetGame.postMortemReport) {
        window.showPostMortemModal(gameId);
    } else {
        window.startPostMortem(gameId);
    }
};

window.retireGameFromHistory = function(gameId) {
    const g = game.gamesHistory.find(item => item.id === gameId);
    if (!g) return;
    if (!confirm(`¿Estás seguro de que deseas retirar "${g.name}" de las tiendas? Se detendrán costes recurrentes y se congelarán sus cifras definitivas.`)) {
        return;
    }
    const res = game.retireGameFromMarket(gameId);
    if (res.success) {
        showToast(res.message, 'info');
        renderHistoryAndCharts();

        // 1. Desmontar y cerrar el modal emergente de la gráfica de ventas si está activo
        const chartModal = document.getElementById('modal-sales-chart');
        if (chartModal && (chartModal.classList.contains('active') || chartModal.style.display !== 'none')) {
            closeModal('modal-sales-chart');
        }

        // 2. Si el juego retirado era el activo en el HUD widget, reasignar al siguiente activo o desmontar
        if (currentLiveSalesWidgetGameId === gameId) {
            const activeRemaining = (game.activeSales || []).filter(item => !item.retired && item.status !== 'RETIRED');
            currentLiveSalesWidgetGameId = activeRemaining.length ? activeRemaining[0].id : null;
        }

        // 3. Actualizar o desmontar widget del HUD en vivo
        if (typeof updateLiveSalesWidget === 'function') updateLiveSalesWidget();
    } else {
        showToast(res.message, 'warn');
    }
};

// --- INTERACTIVE WEEKLY SALES CHART CONTROLLER ---

window.openSalesChartModal = function(gameId) {
    const select = document.getElementById('select-chart-game');
    if (!select) return;
    select.innerHTML = '';

    const games = game.gamesHistory || [];
    if (games.length === 0) {
        showToast('Aún no has publicado ningún videojuego para consultar su gráfica.', 'warn');
        return;
    }

    games.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        const tag = g.retired ? ' [Retirado]' : (g.lifecycleState === 'long_tail' ? ' [Cola Larga]' : ' [Pico]');
        opt.textContent = `${g.name} (${g.genre} - ${g.platform})${tag}`;
        select.appendChild(opt);
    });

    if (gameId && games.some(g => g.id === gameId)) {
        select.value = gameId;
    } else {
        select.value = games[games.length - 1].id;
    }

    renderSelectedGameSalesChart();
    openModal('modal-sales-chart');
};

window.renderSelectedGameSalesChart = function() {
    const select = document.getElementById('select-chart-game');
    if (!select) return;
    const gameId = select.value;
    const g = game.activeSales.find(item => item.id === gameId) || game.gamesHistory.find(item => item.id === gameId);
    if (!g) return;

    // 1. Update KPI summary cards
    const totalUnits = g.unitsSoldTotal || g.installationsTotal || 0;
    const totalNet = g.revenueTotal || 0;
    const grossRev = g.grossRevenueTotal || totalNet;
    const lastUnits = g.unitsSoldLastWeek || 0;

    document.getElementById('kpi-total-units').innerText = `${totalUnits.toLocaleString()} copias`;
    document.getElementById('kpi-current-velocity').innerText = `${lastUnits.toLocaleString()} / semana`;
    document.getElementById('kpi-total-net').innerText = `$${Math.floor(totalNet).toLocaleString()}`;
    document.getElementById('kpi-gross-revenue').innerText = `Bruto: $${Math.floor(grossRev).toLocaleString()}`;

    const history = g.weeklySalesHistory || [];
    let bestRank = 1;
    let currentRank = 1;
    if (history.length > 0) {
        bestRank = Math.min(...history.map(h => h.rank || 10));
        currentRank = history[history.length - 1].rank || 1;
    }
    document.getElementById('kpi-top-rank').innerText = `#${currentRank}`;
    document.getElementById('kpi-peak-rank').innerText = `Mejor puesto: #${bestRank}`;

    const lifecycleNames = {
        peak: '[[DE_ICON_003]] En Pico de Ventas',
        long_tail: '[[DE_ICON_060]] Cola Larga (Residual)',
        retired: '[[DE_ICON_013]] Retirado del Mercado',
        early_access_beta: '[[DE_ICON_094]] Acceso Anticipado'
    };
    const stateLabel = g.retired ? 'Retirado' : (g.lifecycleState === 'long_tail' ? 'Cola Larga' : 'Pico de Ventas');
    document.getElementById('kpi-lifecycle-state').innerText = stateLabel;
    document.getElementById('kpi-weeks-count').innerText = `Semana ${g.weeksOnMarket || 1}`;

    const pill = document.getElementById('chart-game-status-pill');
    if (pill) {
        pill.innerText = lifecycleNames[g.lifecycleState] || (g.retired ? '[[DE_ICON_013]] Retirado' : '[[DE_ICON_003]] Activo');
        pill.style.background = g.retired ? 'rgba(148,163,184,0.18)' : (g.lifecycleState === 'long_tail' ? 'rgba(251,191,36,0.18)' : 'rgba(56,189,248,0.18)');
        pill.style.color = g.retired ? '#94a3b8' : (g.lifecycleState === 'long_tail' ? '#fbbf24' : '#38bdf8');
        pill.style.borderColor = g.retired ? 'rgba(148,163,184,0.4)' : (g.lifecycleState === 'long_tail' ? 'rgba(251,191,36,0.45)' : 'rgba(56,189,248,0.45)');
    }

    const retireInfo = document.getElementById('chart-retirement-info');
    if (retireInfo) {
        if (g.retired) {
            retireInfo.innerText = `Este título fue retirado en el año ${g.retiredYear || ''} (semana ${g.retiredWeek || ''}). Ventas congeladas.`;
        } else if (g.lifecycleState === 'long_tail') {
            retireInfo.innerText = 'El juego genera ingresos residuales constantes en fase de Cola Larga.';
        } else {
            retireInfo.innerText = 'El juego se encuentra en su ventana de ventas principal de máximo impacto.';
        }
    }

    const retireBtn = document.getElementById('btn-chart-retire');
    if (retireBtn) {
        retireBtn.disabled = Boolean(g.retired);
        retireBtn.innerText = g.retired ? '[[DE_ICON_149]] Retirado del Mercado' : '[[DE_ICON_013]] Retirar Juego del Mercado';
        retireBtn.style.opacity = g.retired ? '0.5' : '1';
    }

    const pmBtn = document.getElementById('btn-chart-postmortem');
    if (pmBtn) {
        if (g.postMortemReport) {
            pmBtn.innerText = '[[DE_ICON_030]] Ver Informe Post-Mortem';
            pmBtn.disabled = false;
        } else if (g.postMortemInProgress) {
            pmBtn.innerText = '[[DE_ICON_060]] Analizando datos...';
            pmBtn.disabled = true;
        } else {
            pmBtn.innerText = '[[DE_ICON_011]] Crear Informe del Juego';
            pmBtn.disabled = false;
        }
    }

    // 2. Render Canvas 2D Chart
    const canvas = document.getElementById('sales-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Padding
    const padL = 60;
    const padR = 60;
    const padT = 30;
    const padB = 40;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    // Data points fallback if game was just launched
    const dataPoints = history.length > 0 ? history : [
        { weekNumber: 1, unitsSold: g.unitsSoldTotal || 500, netRevenue: g.revenueTotal || 8000, rank: 1, viralMultiplier: 1, industryMultiplier: 1 }
    ];

    const maxUnits = Math.max(100, ...dataPoints.map(d => d.unitsSold || 0)) * 1.18;
    const maxRevenue = Math.max(1000, ...dataPoints.map(d => d.netRevenue || 0)) * 1.18;
    const count = Math.max(8, dataPoints.length);

    // Horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let i = 0; i <= 4; i++) {
        const y = padT + (chartH * (i / 4));
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(width - padR, y);
        ctx.stroke();

        // Left axis labels (Units)
        const unitVal = Math.round(maxUnits * (1 - i / 4));
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px "Segoe UI", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(unitVal.toLocaleString(), padL - 8, y + 4);

        // Right axis labels (Revenue)
        const revVal = Math.round(maxRevenue * (1 - i / 4));
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'left';
        ctx.fillText(`$${(revVal >= 1000 ? Math.round(revVal / 1000) + 'k' : revVal)}`, width - padR + 8, y + 4);
    }
    ctx.setLineDash([]);

    // Week X ticks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';
    for (let i = 0; i < count; i++) {
        const x = padL + (chartW * (i / (count - 1)));
        ctx.fillText(`S${i + 1}`, x, height - 14);
    }

    // Helper coordinates
    const getX = (idx) => padL + (chartW * (idx / (count - 1)));
    const getYUnits = (val) => padT + chartH - ((val / maxUnits) * chartH);
    const getYRev = (val) => padT + chartH - ((val / maxRevenue) * chartH);

    // Draw Revenue Area & Line (Emerald)
    ctx.beginPath();
    dataPoints.forEach((d, idx) => {
        const x = getX(idx);
        const y = getYRev(d.netRevenue || 0);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Draw Units Area & Line (Cyan)
    ctx.beginPath();
    dataPoints.forEach((d, idx) => {
        const x = getX(idx);
        const y = getYUnits(d.unitsSold || 0);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    // Fill area under units curve
    const lastX = getX(dataPoints.length - 1);
    const firstX = getX(0);
    ctx.lineTo(lastX, padT + chartH);
    ctx.lineTo(firstX, padT + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    grad.addColorStop(0, 'rgba(0, 210, 255, 0.28)');
    grad.addColorStop(1, 'rgba(0, 210, 255, 0.01)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke Units Line
    ctx.beginPath();
    dataPoints.forEach((d, idx) => {
        const x = getX(idx);
        const y = getYUnits(d.unitsSold || 0);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw point markers and milestone event icons
    dataPoints.forEach((d, idx) => {
        const x = getX(idx);
        const yUnits = getYUnits(d.unitsSold || 0);
        const yRev = getYRev(d.netRevenue || 0);

        // Dot for Revenue
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(x, yRev, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Dot for Units
        ctx.fillStyle = '#00d2ff';
        ctx.beginPath();
        ctx.arc(x, yUnits, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Milestone Badges
        if (d.viralMultiplier > 1.25) {
            ctx.font = '14px sans-serif';
            ctx.fillText('[[DE_ICON_005]]', x, yUnits - 14);
        } else if (d.industryMultiplier < 0.8) {
            ctx.font = '14px sans-serif';
            ctx.fillText('[[DE_ICON_016]]', x, yUnits + 20);
        } else if (d.hasPopularMods) {
            ctx.font = '14px sans-serif';
            ctx.fillText('[[DE_ICON_034]]', x, yUnits - 14);
        }
    });

    // Tooltip Interactivity
    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

        let closestIdx = -1;
        let minDist = 35;

        dataPoints.forEach((d, idx) => {
            const x = getX(idx);
            const dist = Math.abs(mouseX - x);
            if (dist < minDist) {
                minDist = dist;
                closestIdx = idx;
            }
        });

        const tooltip = document.getElementById('chart-tooltip');
        if (closestIdx !== -1 && tooltip) {
            const point = dataPoints[closestIdx];
            tooltip.style.display = 'block';
            tooltip.style.left = `${(e.clientX - rect.left) + 12}px`;
            tooltip.style.top = `${(e.clientY - rect.top) - 10}px`;

            let eventNotes = '';
            if (point.viralMultiplier > 1.25) eventNotes += '<div>[[DE_ICON_005]] Impulso viral de streamers</div>';
            if (point.industryMultiplier < 0.8) eventNotes += '<div>[[DE_ICON_016]] Impacto de crisis en el mercado</div>';
            if (point.hasPopularMods) eventNotes += '<div>[[DE_ICON_034]] +150% boost por mods populares</div>';

            tooltip.innerHTML = `
                <div style="font-weight: 800; color: #38bdf8; margin-bottom: 4px;">Semana ${point.weekNumber} (${point.calendarYear || ''})</div>
                <div>Copias vendidas: <b style="color: #fff;">${(point.unitsSold || 0).toLocaleString()}</b></div>
                <div>Ingresos netos: <b style="color: #10b981;">$${Math.floor(point.netRevenue || 0).toLocaleString()}</b></div>
                <div>Ranking Top 10: <b style="color: #fbbf24;">#${point.rank || 'N/A'}</b></div>
                ${eventNotes}
            `;
        } else if (tooltip) {
            tooltip.style.display = 'none';
        }
    };

    canvas.onmouseleave = () => {
        const tooltip = document.getElementById('chart-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    };
};

window.confirmRetireSelectedGame = function() {
    const select = document.getElementById('select-chart-game');
    if (!select) return;
    const gameId = select.value;
    window.retireGameFromHistory(gameId);
};

window.openGamePostMortemFromChart = function() {
    const select = document.getElementById('select-chart-game');
    if (!select) return;
    const gameId = select.value;
    const g = game.gamesHistory.find(item => item.id === gameId);
    if (!g) return;
    if (g.postMortemReport) {
        window.showPostMortemModal(gameId);
    } else {
        window.startPostMortem(gameId);
    }
};

// --- ON-SCREEN LIVE SALES WIDGET CONTROLLER (REAL-TIME EVOLVING SALES REPORT) ---

let currentLiveSalesWidgetGameId = null;
let isLiveSalesWidgetMinimized = false;

function updateLiveSalesWidget() {
    const widget = document.getElementById('hud-live-sales-widget');
    if (!widget) return;

    // Active selling titles in stores (strictly ON_SALE and not retired)
    const activeGames = (game.activeSales || []).filter(g => !g.retired && g.status !== 'RETIRED');

    // La gráfica de ventas solo debe permanecer visible en el HUD mientras el juego esté activo en tiendas
    if (activeGames.length === 0) {
        widget.style.display = 'none';
        currentLiveSalesWidgetGameId = null;
        return;
    }

    // Determine target game to display
    let target = null;
    if (currentLiveSalesWidgetGameId) {
        target = activeGames.find(g => g.id === currentLiveSalesWidgetGameId);
    }
    if (!target) {
        target = activeGames[activeGames.length - 1];
        if (target) currentLiveSalesWidgetGameId = target.id;
    }

    if (!target) {
        widget.style.display = 'none';
        currentLiveSalesWidgetGameId = null;
        return;
    }

    widget.style.display = 'block';

    // Navigation controls between active selling titles
    const navControls = document.getElementById('hud-sales-nav-controls');
    const availableList = activeGames;
    if (availableList.length > 1) {
        navControls.style.display = 'flex';
        const curIdx = availableList.findIndex(g => g.id === target.id);
        const displayIdx = curIdx >= 0 ? curIdx + 1 : 1;
        document.getElementById('hud-sales-page-indicator').innerText = `${displayIdx}/${availableList.length}`;
    } else {
        navControls.style.display = 'none';
    }

    // Header score ring & metadata
    const scoreNum = typeof target.score === 'number' ? target.score.toFixed(1) : '7.0';
    document.getElementById('hud-sales-score-val').innerText = scoreNum;
    const ring = document.getElementById('hud-sales-score-badge');
    if (ring) {
        ring.className = `hud-sales-score-ring ${target.score >= 8.0 ? 'score-high' : (target.score >= 6.5 ? 'score-med' : 'score-low')}`;
    }

    document.getElementById('hud-sales-title').innerText = target.name || 'Videojuego';
    document.getElementById('hud-sales-genre-topic').innerText = `${target.genre || ''} • ${target.topic || ''} (${target.platform || 'PC'})`;

    // Metrics
    const totalUnits = target.unitsSoldTotal || target.installationsTotal || 0;
    const unitsStr = totalUnits >= 1000000 ? (totalUnits / 1000000).toFixed(1) + 'M copias' :
                     (totalUnits >= 1000 ? (totalUnits / 1000).toFixed(1) + 'K copias' : totalUnits.toLocaleString() + ' copias');
    document.getElementById('hud-sales-units').innerText = unitsStr;

    // Top 10 Rank
    let rank = null;
    if (game.top10Chart) {
        const found = game.top10Chart.findIndex(item => item.isPlayer && item.gameId === target.id);
        if (found !== -1) rank = found + 1;
    }
    if (!rank && target.weeklySalesHistory?.length) {
        rank = target.weeklySalesHistory[target.weeklySalesHistory.length - 1].rank;
    }
    document.getElementById('hud-sales-rank').innerText = `#${rank || (target.weeksOnMarket <= 4 ? 3 : 28)}`;

    // Financials
    const profitVal = Math.floor(target.profit || 0);
    const profitEl = document.getElementById('hud-sales-profit');
    profitEl.innerText = `${profitVal >= 0 ? '+' : ''}$${profitVal.toLocaleString()}`;
    profitEl.className = profitVal >= 0 ? 'val-green' : 'val-red';

    document.getElementById('hud-sales-revenue').innerText = `$${Math.floor(target.revenueTotal || 0).toLocaleString()}`;
    document.getElementById('hud-sales-cost').innerText = `$${Math.floor(target.devCost || 0).toLocaleString()}`;
    const fansVal = target.fansGained || Math.floor((target.score || 7) * 20);
    document.getElementById('hud-sales-fans').innerText = `+${fansVal.toLocaleString()} [[DE_ICON_005]]`;
    document.getElementById('hud-sales-hype').innerText = `${Math.round(target.marketingHype || target.hype || 0)}`;

    // Week label & weekly velocity
    const weekLabelEl = document.getElementById('hud-sales-week-label');
    if (target.retired) {
        weekLabelEl.innerText = `[[DE_ICON_013]] Retirado del mercado`;
    } else if (target.lifecycleState === 'long_tail') {
        weekLabelEl.innerText = `[[DE_ICON_060]] Cola Larga · Sem ${target.weeksOnMarket}`;
    } else {
        weekLabelEl.innerText = `[[DE_ICON_003]] Semana ${target.weeksOnMarket} de ventas`;
    }

    const lastWeekSales = target.unitsSoldLastWeek || 0;
    document.getElementById('hud-sales-last-week-sales').innerText = `+${lastWeekSales.toLocaleString()} / sem`;

    // Action buttons
    const pmBtn = document.getElementById('hud-sales-pm-btn');
    if (pmBtn) {
        if (target.postMortemReport) {
            pmBtn.innerText = '[[DE_ICON_030]] Ver Informe';
            pmBtn.disabled = false;
        } else if (target.postMortemInProgress) {
            pmBtn.innerText = '[[DE_ICON_060]] Analizando...';
            pmBtn.disabled = true;
        } else {
            pmBtn.innerText = '[[DE_ICON_011]] Informe (+RP)';
            pmBtn.disabled = false;
        }
    }

    const retireBtn = document.getElementById('hud-sales-retire-btn');
    if (retireBtn) {
        retireBtn.disabled = Boolean(target.retired);
        retireBtn.innerText = target.retired ? '[[DE_ICON_149]] Retirado' : '[[DE_ICON_013]] Retirar';
        retireBtn.style.opacity = target.retired ? '0.5' : '1';
    }

    // Render Canvas 2D weekly bar graph
    renderLiveSalesCanvas(target);
}
window.updateLiveSalesWidget = updateLiveSalesWidget;

function renderLiveSalesCanvas(target) {
    const canvas = document.getElementById('hud-sales-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const history = target.weeklySalesHistory || [];
    const count = Math.max(1, history.length);
    const dataPoints = history.length > 0 ? history : [
        { weekNumber: 1, unitsSold: target.unitsSoldTotal || 500, lifecycleState: 'peak' }
    ];

    const maxUnits = Math.max(100, ...dataPoints.map(d => d.unitsSold || 0)) * 1.15;

    // Dotted baseline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(8, height - 16);
    ctx.lineTo(width - 8, height - 16);
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate dynamic bar sizing
    const availableW = width - 16;
    const barGap = count > 12 ? 2 : (count > 8 ? 3 : 4);
    const barWidth = Math.max(6, Math.min(22, Math.floor((availableW - (count - 1) * barGap) / count)));
    const totalBarsW = count * barWidth + (count - 1) * barGap;
    const startX = Math.max(8, Math.floor((width - totalBarsW) / 2));

    dataPoints.forEach((d, i) => {
        const x = startX + i * (barWidth + barGap);
        const units = d.unitsSold || 0;
        const barH = Math.max(4, Math.floor((units / maxUnits) * (height - 30)));
        const y = height - 16 - barH;

        // Gradient & styling per bar type
        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        if (d.viralMultiplier > 1.25) {
            // Viral hit / Streamer boost (Gold)
            grad.addColorStop(0, '#fbbf24');
            grad.addColorStop(1, '#b45309');
        } else if (d.industryMultiplier < 0.8) {
            // Market crisis (Crimson)
            grad.addColorStop(0, '#f87171');
            grad.addColorStop(1, '#991b1b');
        } else if (d.hasPopularMods) {
            // Popular mods boost (Purple)
            grad.addColorStop(0, '#c084fc');
            grad.addColorStop(1, '#6b21a8');
        } else if (d.lifecycleState === 'long_tail') {
            // Long-tail residual (Cyan-blue)
            grad.addColorStop(0, '#38bdf8');
            grad.addColorStop(1, '#0369a1');
        } else {
            // Peak initial sales (Electric Cyan)
            grad.addColorStop(0, '#00d2ff');
            grad.addColorStop(1, '#0284c7');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, barWidth, barH, [3, 3, 0, 0]);
        } else {
            ctx.rect(x, y, barWidth, barH);
        }
        ctx.fill();

        // Highlight latest week bar with pulse border
        if (i === dataPoints.length - 1 && !target.retired) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(x, y, barWidth, barH, [3, 3, 0, 0]);
            } else {
                ctx.rect(x, y, barWidth, barH);
            }
            ctx.stroke();

            // Tiny glowing dot on top
            ctx.fillStyle = '#00d2ff';
            ctx.beginPath();
            ctx.arc(x + barWidth / 2, y - 4, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // X tick labels (S1, S2...)
        const showLabel = count <= 8 || (i % Math.ceil(count / 6) === 0) || (i === count - 1);
        if (showLabel) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '9px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`S${d.weekNumber || (i + 1)}`, x + barWidth / 2, height - 4);
        }
    });
}

window.cycleLiveSalesGame = function(direction) {
    const activeGames = (game.activeSales || []).filter(g => !g.retired && g.status !== 'RETIRED');
    if (!activeGames.length) return;

    let curIdx = activeGames.findIndex(g => g.id === currentLiveSalesWidgetGameId);
    if (curIdx === -1) curIdx = 0;
    let nextIdx = (curIdx + direction + activeGames.length) % activeGames.length;
    currentLiveSalesWidgetGameId = activeGames[nextIdx].id;
    updateLiveSalesWidget();
};

window.focusGameInLiveWidget = function(gameId) {
    if (!gameId) return;
    const target = (game.activeSales || []).find(g => g.id === gameId && !g.retired && g.status !== 'RETIRED');
    if (!target) {
        showToast('El juego seleccionado ya no se encuentra activo a la venta.', 'info');
        return;
    }
    currentLiveSalesWidgetGameId = gameId;
    isLiveSalesWidgetMinimized = false;
    const widget = document.getElementById('hud-live-sales-widget');
    if (widget) {
        widget.classList.remove('minimized');
        widget.style.display = 'block';
    }
    updateLiveSalesWidget();
    closeAllModals();
};

window.toggleLiveSalesWidgetMin = function() {
    isLiveSalesWidgetMinimized = !isLiveSalesWidgetMinimized;
    const widget = document.getElementById('hud-live-sales-widget');
    const minBtn = document.getElementById('hud-sales-min-btn');
    if (!widget || !minBtn) return;

    if (isLiveSalesWidgetMinimized) {
        widget.classList.add('minimized');
        minBtn.innerText = '+';
        minBtn.title = 'Expandir widget de ventas';
    } else {
        widget.classList.remove('minimized');
        minBtn.innerText = '—';
        minBtn.title = 'Minimizar widget de ventas';
    }
};

window.triggerPostMortemFromWidget = function() {
    if (!currentLiveSalesWidgetGameId) return;
    const g = game.gamesHistory.find(item => item.id === currentLiveSalesWidgetGameId);
    if (!g) return;
    if (g.postMortemReport) {
        window.showPostMortemModal(currentLiveSalesWidgetGameId);
    } else {
        window.startPostMortem(currentLiveSalesWidgetGameId);
    }
};

window.openFullChartFromWidget = function() {
    if (!currentLiveSalesWidgetGameId) return;
    window.openSalesChartModal(currentLiveSalesWidgetGameId);
};

window.retireGameFromWidget = function() {
    if (!currentLiveSalesWidgetGameId) return;
    window.retireGameFromHistory(currentLiveSalesWidgetGameId);
};

// --- MEGA GAME EXPO INTERACTIVE CONVENTION SCENE ---

let expoSession = null;
let expoPedestrianInterval = null;

window.attendExpo = function(tier) {
    const cost = tier === 1 ? 5000 : (tier === 2 ? 22000 : 65000);
    if (game.funds < cost) {
        showToast(`Fondos insuficientes ($${cost.toLocaleString()}) para contratar este stand.`, 'warn');
        return;
    }

    closeAllModals();

    // Setup visual convention modal
    const sceneModal = document.getElementById('modal-expo-scene');
    if (!sceneModal) return;

    const titles = {
        1: { name: 'Stand Pequeño Indie', badge: '[[DE_ICON_001]] PABELLÓN INDIE', sub: 'Pasillo de Novedades Emergentes' },
        2: { name: 'Gran Expositor Central', badge: '[[DE_ICON_074]] EXPOSITOR DESTACADO', sub: 'Zona de Prensa y Stands Principales' },
        3: { name: 'Keynote Magistral AAA', badge: '[[DE_ICON_024]] MEGACONFERENCIA GLOBAL', sub: 'Auditorio Central Retransmitido al Mundo' }
    };
    const info = titles[tier] || titles[1];

    document.getElementById('expo-scene-badge').innerText = info.badge;
    document.getElementById('expo-scene-title').innerText = `Mega Games Expo (${game.getHistoricalYear()})`;
    document.getElementById('expo-booth-subtitle').innerText = `${info.name} · ${info.sub}`;

    const boothStage = document.getElementById('expo-booth-stage');
    boothStage.className = `expo-booth-stage tier-${tier}`;

    document.getElementById('expo-booth-name').innerText = game.companyName;
    document.getElementById('expo-booth-logo').innerText = game.companyLogo;

    const featuredGame = game.activeSales.length ? game.activeSales[0] : (game.gamesHistory.length ? game.gamesHistory[game.gamesHistory.length - 1] : null);
    document.getElementById('expo-showcased-game').innerText = featuredGame ? `Presentando: "${featuredGame.name}" (${featuredGame.genre})` : 'Exhibiendo catálogo del estudio';
    document.getElementById('expo-screen-content').innerText = featuredGame ? `[[DE_ICON_001]] DEMO: "${featuredGame.name.toUpperCase()}"` : '[[DE_ICON_037]] EXPERIENCIAS JUGABLES';

    // Reset metric counters
    document.getElementById('expo-stat-visitors').innerText = '0';
    document.getElementById('expo-stat-fans').innerText = '+0';
    document.getElementById('expo-stat-press').innerText = '0';
    document.getElementById('expo-stat-hype').innerText = '+0';

    // Buttons
    const btnMerch = document.getElementById('btn-expo-merch');
    const btnInterview = document.getElementById('btn-expo-interview');
    if (btnMerch) { btnMerch.disabled = false; btnMerch.innerText = '[[DE_ICON_071]] Repartir Merchandising ($600)'; }
    if (btnInterview) { btnInterview.disabled = false; btnInterview.innerText = '[[DE_ICON_072]] Conceder Entrevista Relámpago'; }

    const summaryFooter = document.getElementById('expo-summary-footer');
    if (summaryFooter) summaryFooter.style.display = 'none';

    // Clear floor
    const floor = document.getElementById('expo-floor');
    if (floor) floor.innerHTML = '';

    expoSession = {
        tier,
        merchUsed: false,
        interviewUsed: false,
        visitors: 0,
        fans: 0,
        press: 0,
        hype: 0,
        targetFans: tier === 1 ? 70 : (tier === 2 ? 310 : 920),
        targetHype: tier === 1 ? 20 : (tier === 2 ? 50 : 98),
        targetPress: tier === 1 ? 5 : (tier === 2 ? 14 : 32),
        startTime: Date.now(),
        avgQuality: featuredGame ? featuredGame.score : 7.2
    };

    openModal('modal-expo-scene');
    if (soundEngine && soundEngine.playClick) soundEngine.playClick();

    // Start pedestrian crowd generation
    startExpoVisitorLoop();
};

function startExpoVisitorLoop() {
    if (expoPedestrianInterval) clearInterval(expoPedestrianInterval);

    const floor = document.getElementById('expo-floor');
    if (!floor) return;

    const avatars = ['[[DE_ICON_128]]', '[[DE_ICON_129]]', '[[DE_ICON_130]]', '[[DE_ICON_131]]', '[[DE_ICON_132]]', '[[DE_ICON_044]]', '[[DE_ICON_088]]', '[[DE_ICON_133]]', '[[DE_ICON_134]]', '[[DE_ICON_001]]'];
    let waveCount = 0;

    expoPedestrianInterval = setInterval(() => {
        if (!expoSession) {
            clearInterval(expoPedestrianInterval);
            return;
        }

        waveCount++;
        const p = document.createElement('div');
        p.className = 'expo-visitor';

        const avatar = avatars[Math.floor(Math.random() * avatars.length)];
        const startX = -30;
        const targetX = 890;
        const duration = 2800 + Math.random() * 1200;
        const pauseTime = 900 + Math.random() * 600;

        p.innerHTML = `<span class="expo-visitor-avatar">${avatar}</span>`;
        floor.appendChild(p);

        // Animate pedestrian walking from left to right
        const startTime = Date.now();
        const pauseAt = 280 + Math.random() * 260; // Middle booth area

        const step = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration + pauseTime) {
                if (p.parentNode) p.parentNode.removeChild(p);
                return;
            }

            let curX = startX;
            if (elapsed < pauseAt) {
                curX = startX + (elapsed / duration) * (targetX - startX);
            } else if (elapsed < pauseAt + pauseTime) {
                curX = startX + (pauseAt / duration) * (targetX - startX);
                // Trigger emoji reaction bubble if not already triggered
                if (!p.hasBubble) {
                    p.hasBubble = true;
                    showVisitorBubble(p, avatar);
                }
            } else {
                const postPause = elapsed - pauseTime;
                curX = startX + (postPause / duration) * (targetX - startX);
            }

            p.style.left = `${curX}px`;
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);

        // Update live metrics smoothly
        expoSession.visitors += Math.floor(1 + Math.random() * 3);
        const fraction = Math.min(1, waveCount / 14);
        expoSession.fans = Math.floor(expoSession.targetFans * fraction * (expoSession.merchUsed ? 1.3 : 1.0));
        expoSession.hype = Math.floor(expoSession.targetHype * fraction * (expoSession.interviewUsed ? 1.35 : 1.0));
        expoSession.press = Math.floor(expoSession.targetPress * fraction * (expoSession.interviewUsed ? 1.5 : 1.0));

        document.getElementById('expo-stat-visitors').innerText = expoSession.visitors.toLocaleString();
        document.getElementById('expo-stat-fans').innerText = `+${expoSession.fans.toLocaleString()}`;
        document.getElementById('expo-stat-press').innerText = expoSession.press.toLocaleString();
        document.getElementById('expo-stat-hype').innerText = `+${expoSession.hype}`;

        // Stop after ~6.5 seconds and display final summary
        if (waveCount >= 14) {
            clearInterval(expoPedestrianInterval);
            const footer = document.getElementById('expo-summary-footer');
            if (footer) {
                footer.style.display = 'block';
                const summaryText = document.getElementById('expo-summary-text');
                if (summaryText) {
                    summaryText.innerHTML = `[[DE_ICON_040]] <b>¡Convención finalizada con éxito rotundo!</b><br>Tu stand acogió a <b>${expoSession.visitors.toLocaleString()}</b> visitantes, sumó <b>+${expoSession.fans.toLocaleString()} nuevos fans devotos</b>, generó <b>${expoSession.press} artículos de prensa</b> y disparó el Hype global en <b>+${expoSession.hype}</b>.`;
                }
                if (soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
            }
        }
    }, 420);
}

function showVisitorBubble(pedestrianEl, avatar) {
    const bubble = document.createElement('div');
    bubble.className = 'expo-visitor-bubble';

    const quality = expoSession ? expoSession.avgQuality : 7.0;
    let emoji = '[[DE_ICON_001]]';
    const rand = Math.random();

    if (avatar === '[[DE_ICON_088]]' || avatar === '[[DE_ICON_133]]') {
        emoji = '[[DE_ICON_088]]';
    } else if (expoSession?.merchUsed || rand < 0.35) {
        emoji = quality >= 8.0 ? '[[DE_ICON_135]]' : (quality >= 6.5 ? '[[DE_ICON_003]]' : '[[DE_ICON_110]]');
    } else if (rand < 0.7) {
        emoji = '[[DE_ICON_001]]';
    } else if (rand < 0.9) {
        emoji = quality >= 7.5 ? '[[DE_ICON_005]]' : '[[DE_ICON_136]]';
    } else {
        emoji = quality < 6.0 ? '[[DE_ICON_137]]' : '[[DE_ICON_138]]';
    }

    bubble.innerText = emoji;
    pedestrianEl.appendChild(bubble);
}

window.expoDistributeMerch = function() {
    if (!expoSession || expoSession.merchUsed) return;
    if (game.funds < 600) {
        showToast('Fondos insuficientes para repartir merchandising ($600).', 'warn');
        return;
    }
    game.funds -= 600;
    expoSession.merchUsed = true;
    const btn = document.getElementById('btn-expo-merch');
    if (btn) {
        btn.disabled = true;
        btn.innerText = '[[DE_ICON_149]] Merchandising Repartido (-$600)';
    }

    // Convert all active bubbles on floor to gifts and hearts
    const floor = document.getElementById('expo-floor');
    if (floor) {
        const bubbles = floor.querySelectorAll('.expo-visitor-bubble');
        bubbles.forEach(b => {
            b.innerText = Math.random() > 0.5 ? '[[DE_ICON_071]]' : '[[DE_ICON_135]]';
            b.style.borderColor = '#10b981';
        });
    }

    showToast('[[DE_ICON_071]] ¡Regalos repartidos entre los asistentes! Se disparan las sonrisas y el Hype.', 'success');
    if (soundEngine && soundEngine.playClick) soundEngine.playClick();
};

window.expoGivePressInterview = function() {
    if (!expoSession || expoSession.interviewUsed) return;
    expoSession.interviewUsed = true;
    const btn = document.getElementById('btn-expo-interview');
    if (btn) {
        btn.disabled = true;
        btn.innerText = '[[DE_ICON_149]] Entrevista Flash Concedida';
    }

    showToast('[[DE_ICON_072]] Declaraciones en directo ante los corresponsales de la prensa especializada (+Prensa & +Hype).', 'info');
    if (soundEngine && soundEngine.playClick) soundEngine.playClick();
};

window.finishExpoScene = function() {
    if (expoPedestrianInterval) clearInterval(expoPedestrianInterval);

    if (expoSession) {
        const result = game.executeExpoAttendance(expoSession.tier, expoSession.merchUsed, expoSession.interviewUsed);
        closeAllModals();
        showToast(result.message, 'success');
        if (soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
    } else {
        closeAllModals();
    }
    expoSession = null;
};

// --- COMPANY & CHARACTER CREATOR CONTROLLER ---

const RANDOM_STUDIO_NAMES = [
    'PixelForge Games', 'NeonByte Studios', 'RetroCraft Interactive', 'Vortex Reality',
    'ChronoPixel', 'CyberDream Labs', 'BitMatrix Games', 'Infinity Loop Studios',
    'Quantum Code', 'HyperDrive Games', 'Arcade Core', 'DreamWeaver Studios',
    'ByteWave Studios', 'NovaSpark Games', 'IronPixel Interactive'
];
const RANDOM_FOUNDER_NAMES = [
    'Raúl Vance', 'Elena Rostova', 'Kenji Sato', 'Lucas Miller', 'Sam Vega', 'Maya Lin', 'David Thorne'
];
const COMPANY_LOGOS = ['[[DE_ICON_001]]', '[[DE_ICON_024]]', '[[DE_ICON_037]]', '[[DE_ICON_083]]', '[[DE_ICON_048]]', '[[DE_ICON_022]]', '[[DE_ICON_018]]', '[[DE_ICON_139]]', '[[DE_ICON_021]]', '[[DE_ICON_059]]'];

let localCustomization = {
    skin: '#ffdfc4',
    hairStyle: 'mop',
    hairColor: '#3d2314',
    shirtStyle: 'flannel',
    shirtColor: '#2563eb',
    pantsColor: '#1e293b',
    accessory: 'glasses_retro'
};
let localLogo = '[[DE_ICON_001]]';

function initCompanyCreatorModal() {
    // Populate Logo Picker
    const logoContainer = document.getElementById('company-logo-picker');
    if (logoContainer) {
        logoContainer.innerHTML = '';
        COMPANY_LOGOS.forEach(logo => {
            const item = document.createElement('div');
            item.className = 'logo-option' + (logo === game.companyLogo ? ' active' : '');
            item.innerText = logo;
            item.addEventListener('click', () => {
                document.querySelectorAll('.logo-option').forEach(l => l.classList.remove('active'));
                item.classList.add('active');
                localLogo = logo;
                if (soundEngine) soundEngine.playClick();
            });
            logoContainer.appendChild(item);
        });
    }

    // Random company name generator
    const rndBtn = document.getElementById('btn-random-company-name');
    if (rndBtn) {
        rndBtn.addEventListener('click', () => {
            const rnd = RANDOM_STUDIO_NAMES[Math.floor(Math.random() * RANDOM_STUDIO_NAMES.length)];
            document.getElementById('input-company-name').value = rnd;
            if (soundEngine) soundEngine.playClick();
        });
    }

    // Skin Swatches
    document.querySelectorAll('#picker-skin .color-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            document.querySelectorAll('#picker-skin .color-swatch').forEach(s => s.classList.remove('active'));
            sw.classList.add('active');
            localCustomization.skin = sw.dataset.skin;
            if (world) world.updateCharacterMesh(0, localCustomization);
            if (soundEngine) soundEngine.playClick();
        });
    });

    // Hair Style Pills
    document.querySelectorAll('#picker-hair-style .pill-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#picker-hair-style .pill-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localCustomization.hairStyle = btn.dataset.style;
            if (world) world.updateCharacterMesh(0, localCustomization);
            if (soundEngine) soundEngine.playClick();
        });
    });

    // Hair Color Swatches
    document.querySelectorAll('#picker-hair-color .color-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            document.querySelectorAll('#picker-hair-color .color-swatch').forEach(s => s.classList.remove('active'));
            sw.classList.add('active');
            localCustomization.hairColor = sw.dataset.color;
            if (world) world.updateCharacterMesh(0, localCustomization);
            if (soundEngine) soundEngine.playClick();
        });
    });

    // Shirt Style Pills
    document.querySelectorAll('#picker-shirt-style .pill-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#picker-shirt-style .pill-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localCustomization.shirtStyle = btn.dataset.shirt;
            if (world) world.updateCharacterMesh(0, localCustomization);
            if (soundEngine) soundEngine.playClick();
        });
    });

    // Shirt Color Swatches
    document.querySelectorAll('#picker-shirt-color .color-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            document.querySelectorAll('#picker-shirt-color .color-swatch').forEach(s => s.classList.remove('active'));
            sw.classList.add('active');
            localCustomization.shirtColor = sw.dataset.color;
            if (world) world.updateCharacterMesh(0, localCustomization);
            if (soundEngine) soundEngine.playClick();
        });
    });

    // Accessories Pills
    document.querySelectorAll('#picker-accessory .pill-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#picker-accessory .pill-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localCustomization.accessory = btn.dataset.acc;
            if (world) world.updateCharacterMesh(0, localCustomization);
            if (soundEngine) soundEngine.playClick();
        });
    });

    // Form Submit
    const formCreator = document.getElementById('form-company-creator');
    if (formCreator) {
        formCreator.addEventListener('submit', (e) => {
            e.preventDefault();
            const companyName = document.getElementById('input-company-name').value.trim() || 'PixelForge Games';
            const founderName = document.getElementById('input-founder-name').value.trim() || 'Raúl Vance';
            const founderTrait = document.getElementById('select-founder-trait').value;

            const startsNewGame = creatingNewGame;
            if (startsNewGame) {
                try {
                    if (saveSystem.getSettings().autosave !== 'off') saveSystem.archiveAutosave();
                    resetGame(game);
                } catch (error) {
                    closeAllModals();
                    mainMenu.report(error.message);
                    return;
                }
            }
            game.updateCompanyProfile({
                companyName: companyName,
                companyLogo: localLogo,
                founderName: founderName,
                founderTrait: founderTrait,
                characterCustomization: { ...localCustomization }
            });

            if (startsNewGame) {
                creatingNewGame = false;
                void enterGameplay({ checkpoint: true });
                soundEngine.playLevelUp();
                return;
            }
            world.updateCharacterMesh(0, localCustomization);
            closeAllModals();
            showToast(`[[DE_ICON_073]] ¡Estudio "${companyName}" y personaje guardados con éxito!`, 'success');
            if (soundEngine) soundEngine.playLevelUp();
        });
    }
}

function openCompanyCreatorModal(newGame = false) {
    const profile = newGame ? initialProfile : game;
    localCustomization = { ...profile.characterCustomization };
    localLogo = profile.companyLogo;

    const inputComp = document.getElementById('input-company-name');
    if (inputComp) inputComp.value = profile.companyName;

    const inputFounder = document.getElementById('input-founder-name');
    if (inputFounder) inputFounder.value = profile.founder.name;

    const traitSelect = document.getElementById('select-founder-trait');
    if (traitSelect) traitSelect.value = profile.founder.trait;
    const submit = document.querySelector('#form-company-creator button[type="submit"]');
    if (submit) submit.textContent = newGame ? 'Empezar partida' : 'Guardar perfil de estudio y personaje';

    // Sync active classes
    document.querySelectorAll('.logo-option').forEach(l => {
        l.classList.toggle('active', l.innerText === localLogo);
    });
    document.querySelectorAll('#picker-skin .color-swatch').forEach(s => {
        s.classList.toggle('active', s.dataset.skin === localCustomization.skin);
    });
    document.querySelectorAll('#picker-hair-style .pill-option').forEach(b => {
        b.classList.toggle('active', b.dataset.style === localCustomization.hairStyle);
    });
    document.querySelectorAll('#picker-hair-color .color-swatch').forEach(s => {
        s.classList.toggle('active', s.dataset.color === localCustomization.hairColor);
    });
    document.querySelectorAll('#picker-shirt-style .pill-option').forEach(b => {
        b.classList.toggle('active', b.dataset.shirt === localCustomization.shirtStyle);
    });
    document.querySelectorAll('#picker-shirt-color .color-swatch').forEach(s => {
        s.classList.toggle('active', s.dataset.color === localCustomization.shirtColor);
    });
    document.querySelectorAll('#picker-accessory .pill-option').forEach(b => {
        b.classList.toggle('active', b.dataset.acc === localCustomization.accessory);
    });

    openModal('modal-company-creator');
    if (newGame) {
        world.updateCharacterMesh(0, localCustomization);
        inputComp?.focus();
    }
}

// --- MODAL HELPERS ---

function openModal(id) {
    closeAllModals();
    if (id === 'modal-new-game') {
        refreshIPWizard(game);
        updatePlatformOptions();
        renderPipelineSelector();
        renderPublishingContractSelector();
        renderBusinessModelSelector();
    }
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        if (soundEngine) soundEngine.playClick();
    }
}

function closeAllModals() {
    const cancelNewGame = creatingNewGame && document.getElementById('modal-company-creator').classList.contains('active');
    document.querySelectorAll('.modal-backdrop').forEach(m => {
        m.style.display = 'none';
        m.classList.remove('active');
    });
    const devMenu = document.getElementById('developer-context-menu');
    if (devMenu) devMenu.style.display = 'none';
    if (cancelNewGame) {
        creatingNewGame = false;
        world.updateCharacterMesh(0, game.characterCustomization);
        mainMenu.show();
    }
    if (game.pendingIndustryEvents?.length) setTimeout(() => renderIndustryNews(game), 0);
}

window.closePressCoverModal = function(returnToMarketing = true) {
    const coverModal = document.getElementById('modal-marketing-press-cover');
    if (coverModal) {
        coverModal.style.display = 'none';
        coverModal.classList.remove('active');
    }
    if (returnToMarketing) {
        renderMarketingHub();
        const mktModal = document.getElementById('modal-marketing');
        if (mktModal) {
            mktModal.style.display = 'flex';
            mktModal.classList.add('active');
        }
    } else {
        closeAllModals();
    }
    if (typeof showToast === 'function') {
        showToast('[[DE_ICON_048]] Portada guardada en tu Archivo de Prensa Histórico.', 'success');
    }
};

// --- TOAST NOTIFICATIONS ---

function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'success') toast.style.borderLeftColor = 'var(--accent-green)';
    if (type === 'warn') toast.style.borderLeftColor = 'var(--accent-red)';
    toast.innerText = msg;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(() => toast.remove(), 400);
    }, 4200);
}
window.showToast = showToast;

// --- TOPIC RESEARCH (I+D DE TEMÁTICAS) CONTROLLER (SUBAGENTE 2) ---

window.openTopicResearchModal = function() {
    window.renderTopicResearchGrid();
    openModal('modal-topic-research');
};

let currentResearchTab = 'topics';

window.switchResearchTab = function(tab) {
    currentResearchTab = tab;
    const tabTopicsBtn = document.getElementById('tab-research-topics');
    const tabGenresBtn = document.getElementById('tab-research-genres');
    if (tabTopicsBtn) tabTopicsBtn.classList.toggle('active', tab === 'topics');
    if (tabGenresBtn) tabGenresBtn.classList.toggle('active', tab === 'genres');
    window.renderTopicResearchGrid();
};

window.renderTopicResearchGrid = function() {
    const container = document.getElementById('topic-research-grid');
    const activeBox = document.getElementById('active-topic-research-status');
    const rpBadge = document.getElementById('topic-research-available-rp');
    const timeVal = document.getElementById('research-time-requirement-val');
    if (rpBadge) rpBadge.innerText = `${game.researchPoints} RP`;

    const currentYear = game.getHistoricalYear ? game.getHistoricalYear() : 1982;

    if (currentResearchTab === 'genres') {
        if (timeVal) timeVal.innerText = '3 semanas / estudio';
        if (activeBox) {
            if (game.activeGenreResearch) {
                const gr = game.activeGenreResearch;
                activeBox.style.display = 'block';
                activeBox.innerHTML = `
                    <div class="active-research-card" style="background: rgba(15, 23, 42, 0.85); border: 1px solid #10b981; border-left: 5px solid #10b981; border-radius: 8px; padding: 12px 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: #fff; font-size: 14px;">[[DE_ICON_001]] Investigando Género: "${gr.genreName}"</strong>
                            <span style="font-size: 12px; color: var(--accent-gold); font-weight: 700;">${gr.weeksRemaining} sem restantes</span>
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary); margin: 4px 0;">Investigador asignado: <b>${gr.employeeName}</b></div>
                        <div class="progress-bar-track" style="margin-top: 8px; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                            <div class="progress-bar-fill" style="width: ${gr.progress}%; height: 100%; background: linear-gradient(90deg, #10b981, #34d399); transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            } else {
                activeBox.style.display = 'none';
            }
        }

        if (!container) return;
        const lockedGenres = game.getLockedGenres ? game.getLockedGenres(currentYear) : [];
        if (lockedGenres.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 24px;">¡Todos los géneros históricos hasta ${currentYear} han sido investigados y dominados!</div>`;
            return;
        }

        const isBusy = Boolean(game.activeGenreResearch);

        container.innerHTML = lockedGenres.map(g => {
            const cost = g.costRP || 30;
            const canAfford = game.researchPoints >= cost;
            const techReq = (g.requiredTech && g.requiredTech.length > 0) ? g.requiredTech.join(', ') : 'Ninguno';

            return `
                <div class="topic-research-card ${canAfford && !isBusy ? 'can-research' : 'cannot-research'}">
                    <div class="topic-card-header">
                        <span class="topic-icon">[[DE_ICON_001]]</span>
                        <div>
                            <strong class="topic-name">${g.name}</strong>
                            <div class="topic-target">Era: ${g.unlockedYear} · Público: ${g.idealAudience || 'General'}</div>
                        </div>
                    </div>
                    <p class="topic-desc">${g.desc || 'Nuevo género de juego para tu catálogo.'}</p>
                    <div style="font-size: 11px; color: #94a3b8; margin: 4px 0 8px 0;">Requisitos técnicos: <b style="color: #38bdf8;">${techReq}</b></div>
                    <div class="topic-cost-bar">
                        <span style="font-size: 11px; color: var(--text-secondary);">Coste: <b style="color: var(--accent-gold);">${cost} RP</b> (3 sem)</span>
                        <button type="button" class="dock-btn btn-primary-action btn-research-topic" 
                                onclick="startGenreResearchFromUI('${g.id}')"
                                ${!canAfford || isBusy ? 'disabled' : ''}>
                            ${isBusy ? '[[DE_ICON_060]] Ocupado' : (!canAfford ? '[[DE_ICON_006]] Faltan RP' : '[[DE_ICON_001]] Investigar')}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        if (timeVal) timeVal.innerText = '2 semanas / estudio';
        if (activeBox) {
            if (game.activeTopicResearch) {
                const tr = game.activeTopicResearch;
                activeBox.style.display = 'block';
                activeBox.innerHTML = `
                    <div class="active-research-card" style="background: rgba(15, 23, 42, 0.85); border: 1px solid var(--accent-cyan); border-left: 5px solid var(--accent-cyan); border-radius: 8px; padding: 12px 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: #fff; font-size: 14px;">[[DE_ICON_028]] Investigando Temática: "${tr.topicName}"</strong>
                            <span style="font-size: 12px; color: var(--accent-gold); font-weight: 700;">${tr.weeksRemaining} sem restantes</span>
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary); margin: 4px 0;">Investigador asignado: <b>${tr.employeeName}</b></div>
                        <div class="progress-bar-track" style="margin-top: 8px; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                            <div class="progress-bar-fill fill-cyan" style="width: ${tr.progress}%; height: 100%; background: linear-gradient(90deg, #00d2ff, #38bdf8); transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            } else {
                activeBox.style.display = 'none';
            }
        }

        if (!container) return;
        const lockedTopics = game.getLockedTopics ? game.getLockedTopics(currentYear) : [];
        if (lockedTopics.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 24px;">¡Todas las temáticas históricas hasta ${currentYear} han sido investigadas y dominadas!</div>`;
            return;
        }

        const isBusy = Boolean(game.activeTopicResearch);

        container.innerHTML = lockedTopics.map(t => {
            const cost = t.costRP || 20;
            const canAfford = game.researchPoints >= cost;
            const bestGenres = (t.synergies || []).join(', ');

            return `
                <div class="topic-research-card ${canAfford && !isBusy ? 'can-research' : 'cannot-research'}">
                    <div class="topic-card-header">
                        <span class="topic-icon">[[DE_ICON_028]]</span>
                        <div>
                            <strong class="topic-name">${t.name}</strong>
                            <div class="topic-target">Era: ${t.unlockedYear} · Público: ${t.idealAudience}</div>
                        </div>
                    </div>
                    <p class="topic-desc">Sinergia con: <strong style="color: var(--accent-cyan);">${bestGenres || 'Múltiples géneros'}</strong></p>
                    <div class="topic-cost-bar">
                        <span style="font-size: 11px; color: var(--text-secondary);">Coste: <b style="color: var(--accent-gold);">${cost} RP</b> (2 sem)</span>
                        <button type="button" class="dock-btn btn-primary-action btn-research-topic" 
                                onclick="startTopicResearchFromUI('${t.id}')"
                                ${!canAfford || isBusy ? 'disabled' : ''}>
                            ${isBusy ? '[[DE_ICON_060]] Ocupado' : (!canAfford ? '[[DE_ICON_006]] Faltan RP' : '[[DE_ICON_028]] Investigar')}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
};

window.startTopicResearchFromUI = function(topicId) {
    const res = game.startTopicResearch(topicId);
    if (res.success) {
        showToast(res.message, 'success');
        window.renderTopicResearchGrid();
        renderHUD(game);
        populateProjectWizard();
    } else {
        showToast(res.message, 'warn');
    }
};

window.startGenreResearchFromUI = function(genreId) {
    const res = game.startGenreResearch(genreId);
    if (res.success) {
        showToast(res.message, 'success');
        window.renderTopicResearchGrid();
        renderHUD(game);
        populateProjectWizard();
    } else {
        showToast(res.message, 'warn');
    }
};

// --- VISUAL MARKETING PRESS COVERS & REVIEWS CONTROLLER (SUBAGENTE 4) ---

window.showMarketingPressCover = function(coverOrId) {
    let cover = null;
    if (typeof coverOrId === 'string') {
        cover = (game.marketingPressArchive || []).find(c => c.id === coverOrId);
    } else {
        cover = coverOrId;
    }
    if (!cover) return;

    const modal = document.getElementById('modal-marketing-press-cover');
    const container = document.getElementById('press-cover-display-container');
    if (!modal || !container) return;

    let coverHtml = '';
    if (cover.period === '80s') {
        coverHtml = `
            <div class="press-cover-card cover-80s-retro ${cover.styleClass || ''}">
                <div class="cover-80s-masthead">
                    <div class="cover-80s-issue-line">
                        <span>${cover.issue}</span>
                        <span>${cover.tagline}</span>
                        <span class="cover-price-tag">${cover.priceBadge}</span>
                    </div>
                    <div class="cover-80s-title">${cover.publicationName}</div>
                </div>
                <div class="cover-80s-content">
                    <div class="cover-star-burst">${cover.badgeTop}</div>
                    <div class="cover-feature-box">
                        <div class="cover-pill-badge">${cover.featureBadge}</div>
                        <h1 class="cover-big-headline">${cover.headline}</h1>
                        <p class="cover-lead-summary">${cover.subheadline}</p>
                        <div class="cover-quote-banner">${cover.quote}</div>
                    </div>
                    <div class="cover-80s-tags">
                        ${(cover.tags || []).map(tag => `<span class="cover-tag-item">[[DE_ICON_153]] ${tag}</span>`).join('')}
                    </div>
                    <div class="cover-bottom-bar">
                        <span class="cover-barcode">||| | |||| ||| ||||||| | |||</span>
                        <span>DEP. LEGAL B-${cover.year}92 · EDICIÓN NACIONAL</span>
                    </div>
                </div>
            </div>
        `;
    } else if (cover.period === '90s') {
        coverHtml = `
            <div class="press-cover-card cover-90s-retro ${cover.styleClass || ''}">
                <div class="cover-90s-masthead">
                    <div class="cover-90s-issue-line">
                        <span>${cover.issue}</span>
                        <span>${cover.tagline}</span>
                        <span class="cover-price-tag gold">${cover.priceBadge}</span>
                    </div>
                    <div class="cover-90s-title">${cover.publicationName}</div>
                </div>
                <div class="cover-90s-content">
                    <div class="cover-cd-burst">${cover.badgeTop}</div>
                    <div class="cover-feature-box-90s">
                        <div class="cover-pill-badge neon">${cover.featureBadge}</div>
                        <h1 class="cover-big-headline-90s">${cover.headline}</h1>
                        <p class="cover-lead-summary">${cover.subheadline}</p>
                        <div class="cover-quote-banner-90s">${cover.quote}</div>
                    </div>
                    <div class="cover-90s-tags">
                        ${(cover.tags || []).map(tag => `<span class="cover-tag-item-90s">[[DE_ICON_148]] ${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    } else {
        // Modern Digital 2000s Web Portal Article Layout
        coverHtml = `
            <div class="press-cover-card cover-2000s-portal ${cover.styleClass || ''}">
                <div class="portal-header-browser">
                    <div class="portal-dots"><span></span><span></span><span></span></div>
                    <div class="portal-url">https://www.${cover.publicationName.toLowerCase()}/previews/${cover.year}/exclusive</div>
                </div>
                <div class="portal-masthead">
                    <div class="portal-brand">${cover.publicationName}</div>
                    <div class="portal-sub-text">${cover.tagline}</div>
                    <div class="portal-live-pill">${cover.priceBadge}</div>
                </div>
                <div class="portal-body">
                    <div class="portal-status-row">
                        <span class="portal-trending-badge">${cover.badgeTop}</span>
                        <span class="portal-date-stamp">${cover.issue}</span>
                    </div>
                    <h1 class="portal-title">${cover.headline}</h1>
                    <div class="portal-author-strip">
                        <span>Por Redacción Internacional · Periodismo del Videojuego</span>
                        <span class="portal-score-badge">${cover.featureBadge}</span>
                    </div>
                    <p class="portal-lead">${cover.subheadline}</p>
                    <div class="portal-quote-box">${cover.quote}</div>
                    <div class="portal-tags-list">
                        ${(cover.tags || []).map(tag => `<span class="portal-tag-pill">#${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = coverHtml;
    openModal('modal-marketing-press-cover');
};
