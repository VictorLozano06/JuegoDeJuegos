import { profitWarning, formatGameProfit } from './profit-display.js';
import { formatHistoryAllocation } from './production-history-display.js';
import { AREAS, ensureProduction } from './production.js';
import { initializeUwuntuOS } from './uwuntu-os.js';
import { initializePreproductionWizard } from './preproduction-wizard.js';
import { commitPreproduction } from './project-transaction.js';
import './ui-icons.js';
import { initializeIPUI, refreshIPWizard } from './ip-ui.js';
import { initializeRivalUI } from './rival-ui.js';
import {
    marketingBriefArt, marketingChannelState, marketingEdition, marketingMoney, marketingNumber,
    marketingText, renderMarketingChannels, renderMarketingHistory, renderMarketingInspector
} from './marketing-ui.js';
import { initializeFinanceUI } from './finance-ui.js';
import { soundEngine } from './audio.js';
import { DAG_CATALOG as SCOPE_NODES_CATALOG, EnginePipelineManager, REVERSE_ENGINEERING_CATALOG, ScopeDAG, TechnicalDebtModel } from './dag_engine.js';
import { game, GENRES, GENRES_DATABASE, findGenre, PLATFORMS, TOPICS, THEMES_DATABASE, findTheme, calculateSynergy } from './simulation.js';
import REAL_BRANDS_MOD_PACK from './data/mod_sample_real_brands.json';
import { WorldEngine } from './world.js';
import { createMainMenu } from './main-menu.js';
import { prepareCompanyLogo, renderCompanyLogo } from './company-logo.js';
import { ensureBasicEngine } from './basic-engine.js';
import { CALENDAR_WEEK_MS, DEVELOPMENT_TICK_MS, updateExpoSchedule, hasExpoInvitation, resolveExpoInvitation } from './expo-schedule.js';
import { renderOfficeManager } from './office-ui.js';
import { resetGame, saveSystem } from './SaveSystem.js';
import { version } from '../package.json';
import { TECH_TREE_NODES, calculateTechIncompatibility } from './data/techTreeData.js';
import { LoadingScreen, AssetPreloader } from './loading-screen.js';
import { GameDevFlowController, ProductionLifecycleState } from './GameDevFlowController.js';

/**
 * DEV EMPIRE 3D - Main Application Controller
 * Seamless bridge connecting Simulation Logic, Three.js 3D World Engine,
 * Procedural Web Audio, and High-Performance Glassmorphism UI.
 */

let gameDevFlow = null;

let world = null;
let currentLiveSalesWidgetGameId = null;
let isLiveSalesWidgetMinimized = false;
const STATE_MAIN_MENU = 'main-menu';
const STATE_TRANSITION = 'transition';
const STATE_PLAYING = 'playing';
window.game = game;
let appState = STATE_MAIN_MENU;
let mainMenu;
let financeUI;
let creatingNewGame = false;
let studioPreviewDirty = false;
let compactMenuTrigger = null;
let appliedSettings;
const initialProfile = {
    officeTier: game.getActiveOffice().tier,
    companyName: game.companyName,
    companyLogo: game.companyLogo,
    founder: { ...game.founder },
    characterCustomization: { ...game.characterCustomization }
};
let devInterval = null;
let calendarInterval = null;
let expoSession = null;
let expoPedestrianInterval = null;
let lastNotifiedProjectOfferKey = null;
let lastRenderedEmployeeCount = null;
let lastOfficeManagerSnapshot = null;
const notifiedHeadhuntEmployeeIds = new Set();

const techTreeManager = game.techTreeManager;
let scopeDAG = new ScopeDAG(null, { techTreeManager });
let debtManager = new TechnicalDebtModel();
let pipelineManager = new EnginePipelineManager();
const selectedHistoricalTechs = new Set();
let preproductionWizard;

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

let loadingScreenInstance = null;

async function bootGameApp() {
    try {
        game.isPaused = true;

        const urlParams = new URLSearchParams(window.location.search);
        const skipLoading = urlParams.get('skip_loading') === '1' || window.__SKIP_LOADING_SCREEN__;

        if (!skipLoading && document.getElementById('game-loading-screen')) {
            loadingScreenInstance = new LoadingScreen();
            loadingScreenInstance.start();
        }

        // 1. Initialize 3D World Engine
        world = new WorldEngine('canvas-container');
        world.onNodeClick(on3DNodeClicked);

        // Initialize Game Dev Tycoon Sequential Production Flow Controller
        gameDevFlow = new GameDevFlowController({
            game,
            world,
            setGameSpeed,
            onRelease: () => {
                const releaseBtn = document.getElementById('btn-release-game');
                if (releaseBtn) releaseBtn.click();
            }
        });
        window.gameDevFlow = gameDevFlow;
        if (appState === STATE_MAIN_MENU) {
            gameDevFlow.hideTopHUD();
        }

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
        initializeUwuntuOS(game, world);

        // 3. Populate Modal Dropdowns & DAG Architecture
        populateProjectWizard();
        initDAGArchitectureUI();
        preproductionWizard = initializePreproductionWizard({
            game,
            getPipeline: () => pipelineManager.getActivePipeline(),
            getScope: () => scopeDAG,
            getHistoricalTechs: () => [...selectedHistoricalTechs],
            getTechnologyNames: ids => ids.map(id => TECH_TREE_NODES.find(node => node.id === id)?.name || id)
        });
        initCompactMenuControls();
        initGameDialogs();
        initializeMainMenu();

        // 4. Bind Game State Listeners
        game.onStateChange((state) => {
            if (appState !== STATE_PLAYING) return;
            syncStudioScene(state);
            queuePersonnelRefresh();
            for (const employee of state.employees || []) {
                if (employee.id !== 'player' && [8, 4, 1].includes(employee.contractWeeksRemaining)) {
                    const key = `${employee.id}:${employee.contractWeeksRemaining}:${state.year}:${state.month}:${state.week}`;
                    if (window.__lastContractWarning !== key) {
                        window.__lastContractWarning = key;
                        showToast(`El contrato de ${employee.name} termina en ${employee.contractWeeksRemaining} semana(s). Puedes renovarlo en Personal.`, 'warn');
                    }
                }
            }
            renderHUD(state);
            syncExpoInvitation();
            const officesPhoneView = document.getElementById('phone-view-offices');
            if (document.getElementById('modal-offices')?.classList.contains('active') || (officesPhoneView && !officesPhoneView.hidden)) refreshOfficeManager();
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

        // 6. Preload 3D assets, textures, and warmup WebGL shaders
        if (loadingScreenInstance) {
            const preloader = new AssetPreloader({
                onProgress: (ratio, label) => {
                    loadingScreenInstance.setProgress(ratio, label);
                }
            });

            await preloader.loadAll(world);
            loadingScreenInstance.setComplete('¡Llegada al almacén de videojuegos! Texturas y modelos 3D preparados.');
            await loadingScreenInstance.waitForCompletion();
            loadingScreenInstance.hide();
        }

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
    } catch (e) {
        console.error('CRITICAL BOOT ERROR:', e);
        window.__bootError = e.stack || e.message;
        if (loadingScreenInstance) loadingScreenInstance.setError();
    }
}

window.testLoadingScreen = async () => {
    const ls = new LoadingScreen();
    ls.start();
    const preloader = new AssetPreloader({
        onProgress: (ratio, label) => ls.setProgress(ratio, label)
    });
    await preloader.loadAll(world);
    ls.setComplete('¡Llegada al almacén de videojuegos! Texturas y modelos 3D preparados.');
    await ls.waitForCompletion();
    ls.hide();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootGameApp);
} else {
    bootGameApp();
}

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
            showMenuOffice(initialProfile.officeTier, game.employees.slice(0, 1));
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

function showMenuOffice(tier, employees) {
    if (world.currentEra !== tier) world.buildOffice(tier);
    world.syncEmployees(employees);
    world.enterMainMenu();
}

function syncStudioScene(state) {
    const office = state.getActiveOffice();
    const changedOffice = world.currentEra !== office.tier;
    if (changedOffice) {
        world.hideScopeDAG();
        const holoHud = document.getElementById('hologram-overlay-bar');
        if (holoHud) holoHud.style.display = 'none';
        world.buildOffice(office.tier);
        updatePlatformOptions();
    }
    if (changedOffice || state.employees.length !== lastRenderedEmployeeCount) {
        world.syncEmployees(state.employees);
        lastRenderedEmployeeCount = state.employees.length;
    }
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
    lastNotifiedProjectOfferKey = null;
    notifiedHeadhuntEmployeeIds.clear();
    selectedHistoricalTechs.clear();
    window._pausedSpeedForNews = 0;
    if (game.pendingIndustryEvents?.length && game.gameSpeed === 0) game.gameSpeed = 1;

    try {
        const office = game.getActiveOffice();
        lastRenderedEmployeeCount = game.employees.length;
        if (world.currentEra === office.tier) {
            world.syncEmployees(game.employees);
            await world.transitionToGameplay();
        } else {
            await world.transitionToGameplay({
                era: office.tier,
                revealOffice: () => {
                    world.buildOffice(office.tier);
                    world.syncEmployees(game.employees);
                }
            });
        }
        populateProjectWizard();
        updateSpeedButtonsUI(game.gameSpeed);
    } catch (error) {
        appState = STATE_MAIN_MENU;
        showMenuOffice(game.getActiveOffice().tier, game.employees);
        mainMenu.setBusy(false);
        mainMenu.show();
        mainMenu.report(error.message);
        return;
    }
    appState = STATE_PLAYING;
    document.getElementById('ui-overlay')?.removeAttribute('inert');
    if (gameDevFlow) {
        gameDevFlow.showTopHUD();
    }
    game.isPaused = Boolean(game.financeState?.procedurePending || (game.financeState?.bankruptcy?.confirmed && game.financeState.bankruptcy.mode === 'end'));
    checkCalendarEvents();
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
    document.getElementById('ui-overlay')?.setAttribute('inert', '');
    if (gameDevFlow) {
        gameDevFlow.hideTopHUD();
    }
    game.isPaused = true;
    clearInterval(devInterval);
    clearInterval(calendarInterval);
    clearInterval(expoPedestrianInterval);
    closeAllModals();
    world.hideScopeDAG();
    const holoHud = document.getElementById('hologram-overlay-bar');
    if (holoHud) holoHud.style.display = 'none';
    showMenuOffice(game.getActiveOffice().tier, game.employees);
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

    // Calendar tick loop (advances weeks and processes economic simulation)
    calendarInterval = setInterval(() => {
        if (!game.isPaused && game.gameSpeed > 0 && !document.getElementById('modal-expo-scene')?.classList.contains('active')) {
            game.advanceCalendar();
            checkCalendarEvents();
            const cadence = appliedSettings.autosave;
            if (cadence === 'weekly' || (cadence === 'monthly' && game.week === 1)) autosaveCurrentGame();
            if (typeof updateLiveSalesWidget === 'function') updateLiveSalesWidget();
            const liveOpsModal = document.getElementById('modal-liveops');
            if (liveOpsModal?.classList.contains('active') || liveOpsPhoneTarget) renderLiveOps();
        }
    }, CALENDAR_WEEK_MS / (game.gameSpeed || 1));
}

function checkCalendarEvents() {
    const announced = updateExpoSchedule(game);
    syncExpoInvitation();
    if (announced) showToast('La feria anual ya está disponible. Abre la invitación cuando quieras.', 'info');
}

function syncExpoInvitation() {
    const button = document.getElementById('expo-invitation');
    if (!button) return;
    button.hidden = appState !== STATE_PLAYING || !hasExpoInvitation(game);
    if (!button.hidden) button.querySelector('small').textContent = `${game.getHistoricalYear()} · Ver opciones`;
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
        if (e.defaultPrevented || document.querySelector('dialog[open]')) return;
        const expoModal = document.getElementById('modal-expo');
        if (expoModal?.classList.contains('active')) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeAllModals();
            } else if (e.key === 'Tab') {
                const controls = [...expoModal.querySelectorAll('button:not(:disabled)')];
                const first = controls[0], last = controls.at(-1);
                if (!expoModal.contains(document.activeElement) || (e.shiftKey ? document.activeElement === first : document.activeElement === last)) {
                    e.preventDefault();
                    (e.shiftKey ? last : first)?.focus();
                }
            }
            return;
        }
        const officeModal = document.getElementById('modal-offices');
        if (officeModal?.classList.contains('active')) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeAllModals();
            } else if (e.key === 'Tab') {
                const controls = [...officeModal.querySelectorAll('button:not(:disabled)')];
                const first = controls[0];
                const last = controls.at(-1);
                if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
                    e.preventDefault();
                    (e.shiftKey ? last : first)?.focus();
                }
            }
            return;
        }
        if (document.querySelector('.modal-backdrop.active .compact-menu')) return;
        if (appState !== STATE_PLAYING) {
            if (e.key === 'Escape' && creatingNewGame) closeAllModals();
            return;
        }
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
            openPersonnelPanel();
            if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        } else if (key === 'c' || key === 'v') {
            openSalesPanel();
            if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        } else if (key === 'g') {
            const modalDag = document.getElementById('modal-scope-dag');
            if (window.studioPhoneNav?.isArchitectureOpen?.()) {
                window.studioPhoneNav.returnHome();
            } else if (modalDag && modalDag.classList.contains('active')) {
                closeAllModals();
            } else {
                openArchitecturePanel();
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
    });

    document.getElementById('expo-invitation').addEventListener('click', () => {
        if (!hasExpoInvitation(game)) return;
        if (window.uwuntuOS?.isOpen || document.querySelector('.modal-backdrop.active') || document.querySelector('dialog[open]')) {
            showToast('Cierra la ventana actual para consultar la feria.', 'info');
            return;
        }
        openModal('modal-expo');
        document.querySelector('#modal-expo .modal-close')?.focus();
    });

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
        btnOpenDag.addEventListener('click', openArchitecturePanel);
    }

    const btnHudOpenDag = document.getElementById('btn-hud-open-dag');
    if (btnHudOpenDag) {
        btnHudOpenDag.addEventListener('click', openArchitecturePanel);
    }

    // Top Bar Quick Actions for Personnel & Sales (Direct Game Panels, Not PC)
    const hudBtnPersonnel = document.getElementById('hud-btn-personnel');
    if (hudBtnPersonnel) {
        hudBtnPersonnel.addEventListener('click', (e) => {
            e.preventDefault();
            openPersonnelPanel();
        });
    }

    const hudBtnStats = document.getElementById('hud-btn-stats');
    if (hudBtnStats) {
        hudBtnStats.addEventListener('click', (e) => {
            e.preventDefault();
            openSalesPanel();
        });
    }

    const hudBtnPc = document.getElementById('hud-btn-pc');
    if (hudBtnPc) {
        hudBtnPc.addEventListener('click', () => {
            if (window.uwuntuOS) {
                if (window.uwuntuOS.isOpen) window.uwuntuOS.close();
                else window.uwuntuOS.open();
            }
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
        openPersonnelPanel();
    });

    const btnHistory = document.getElementById('btn-history');
    if (btnHistory) {
        btnHistory.addEventListener('click', () => {
            openSalesPanel();
        });
    }

    document.getElementById('btn-liveops').addEventListener('click', () => {
        renderLiveOps();
        openModal('modal-liveops');
    });

    const mktBtn = document.getElementById('btn-marketing');
    if (mktBtn) {
        mktBtn.addEventListener('click', () => {
            if (window.studioPhoneNav?.openMarketing) {
                window.studioPhoneNav.openMarketing();
            } else {
                renderMarketingHub();
                openModal('modal-marketing');
            }
        });
    }

    document.getElementById('btn-community-workshop').addEventListener('click', () => {
        openWorkshopPanel();
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
        const cover = e.target.closest('[data-press-cover]');
        if (cover) {
            window.showMarketingPressCover(cover.dataset.pressCover);
            return;
        }
        const channel = e.target.closest('[data-mkt-channel]');
        if (channel) {
            selectedMarketingChannel = channel.dataset.mktChannel;
            updateMarketingChannelSelection();
            return;
        }
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
        openOfficePanel();
        document.querySelector('#modal-offices .modal-close')?.focus();
    });

    const adminModal = document.getElementById('modal-admin');
    const adminForm = document.getElementById('admin-funds-form');
    const adminAmount = document.getElementById('admin-funds-amount');
    const adminFunds = document.getElementById('admin-current-funds');
    const adminFeedback = document.getElementById('admin-feedback');
    const formatAdminFunds = value => `$${Math.floor(value).toLocaleString('es-ES')}`;
    const openAdmin = () => {
        adminFunds.textContent = formatAdminFunds(game.funds);
        adminFeedback.textContent = '';
        adminFeedback.dataset.result = '';
        openModal('modal-admin');
        adminAmount.focus();
    };
    document.getElementById('btn-admin-mode').addEventListener('click', openAdmin);
    const applyAdminFunds = (action) => {
        const amount = Number(adminAmount.value);
        if (!Number.isSafeInteger(amount) || amount < 0) {
            adminFeedback.textContent = 'Introduce una cantidad válida (número entero igual o superior a cero).';
            adminFeedback.dataset.result = 'error';
            adminAmount.focus();
            return;
        }
        const nextFunds = action === 'set' ? amount : game.funds + amount;
        if (!Number.isSafeInteger(nextFunds)) {
            adminFeedback.textContent = 'La cantidad supera el límite numérico admitido.';
            adminFeedback.dataset.result = 'error';
            return;
        }
        game.funds = nextFunds;
        renderHUD(game);
        refreshOfficeManager();
        autosaveCurrentGame();
        adminFunds.textContent = formatAdminFunds(game.funds);
        adminFeedback.textContent = action === 'set'
            ? `Saldo actualizado a ${formatAdminFunds(game.funds)}.`
            : `Se han añadido ${formatAdminFunds(amount)}. Nuevo saldo: ${formatAdminFunds(game.funds)}.`;
        adminFeedback.dataset.result = 'success';
        if (soundEngine?.playClick) soundEngine.playClick();
    };
    adminForm.addEventListener('submit', event => {
        event.preventDefault();
        applyAdminFunds('add');
    });
    adminModal.querySelector('[data-admin-action="set"]').addEventListener('click', () => applyAdminFunds('set'));

    // Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach(elem => {
        elem.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close')) {
                if (e.target.closest('#phone-view-architecture')) {
                    window.studioPhoneNav?.returnHome();
                    return;
                }
                if (e.target.closest('[id^="phone-view-"]')) {
                    window.studioPhoneNav?.returnHome();
                    return;
                }
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
        if (!preproductionWizard?.isFinal()) return;
        startProjectFromWizard();
    });

    document.getElementById('production-allocation')?.addEventListener('input', e => {
        if (!e.target.dataset.productionArea) return;
        game.updateProductionAllocation(e.target.dataset.productionArea, e.target.value);
        const production = game.currentProject.production;
        e.currentTarget.querySelectorAll('[data-production-area]').forEach(input => {
            const value = production.allocations[game.currentProject.stage][input.dataset.productionArea];
            input.value = value;
            input.closest('label').querySelector('strong').textContent = value + '%';
            input.style.setProperty('--value', value + '%');
            const segment = e.currentTarget.querySelector('[data-production-segment="' + input.dataset.productionArea + '"]');
            if (segment) { segment.style.width = value + '%'; segment.firstElementChild.textContent = value >= 8 ? value + '%' : ''; }
        });
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
            if (gameDevFlow) {
                if (typeof gameDevFlow.removeWidget === 'function') {
                    gameDevFlow.removeWidget();
                }
                gameDevFlow.closeCurrentModal?.();
                gameDevFlow.state = ProductionLifecycleState.STATE_SETUP;
                gameDevFlow.updateTopHUD?.();
            }
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
            openPersonnelPanel();
            const selectedEmployeeId = game.employees[selectedDevIndex]?.id;
            const selectedCard = selectedEmployeeId ? document.querySelector(`#current-team-list [data-employee-id="${selectedEmployeeId}"]`) : null;
            personnelEmployeeId = selectedEmployeeId; setPersonnelTab('staff'); renderRecruitment();
            document.getElementById('personnel-employee-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    const basic = ensureBasicEngine(game);
    pipelineManager.availablePipelines = [
        {
            ...basic,
            type: 'inhouse',
            isBasic: true,
            desc: 'Motor inicial gratuito para crear tus primeros juegos en 2D. Disponible desde el principio.',
            royaltyPercent: 0,
            royaltyRate: 0,
            baseDebtFloor: 0,
            frictionMultiplier: 1,
            unlockedNodes: []
        },
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
                        ${isCommercial ? '[[DE_ICON_022]] Motor Comercial' : pipe.isBasic ? '[[DE_ICON_059]] Motor inicial' : '[[DE_ICON_059]] Motor Propio (In-House)'}
                    </span>
                    <strong style="display: block; font-size: 14px; color: #fff; margin-bottom: 4px;">${pipe.name}</strong>
                    <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">${pipe.desc}</p>
                </div>
                <div style="margin-top: 10px; font-size: 12px; font-weight: 700; color: ${isCommercial ? 'var(--accent-gold)' : 'var(--accent-green)'};">
                    ${isCommercial ? `Royalties: ${pipe.royaltyPercent}% | Deuda Base: ${pipe.baseDebtFloor} pts (Bloatware)` : pipe.isBasic ? 'Gratis | 0% royalties' : '0% Royalties | -50% Fricción | Licencias a Terceros'}
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
            card.dataset.nodeId = node.id;
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-pressed', String(isActive));
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
    const check = preproductionWizard?.validateAll();
    if (!check?.valid || !preproductionWizard.markSubmitting()) return;
    if (game.currentProject) {
        preproductionWizard.setError('Ya hay otro videojuego en desarrollo.', 5);
        preproductionWizard.doneSubmitting();
        return;
    }
    const name = document.getElementById('input-game-name').value.trim();
    const topicId = document.getElementById('select-topic').value;
    const genreId = document.getElementById('select-genre').value;
    const platformId = document.getElementById('select-platform').value;
    const targetAudience = document.getElementById('select-audience').value;
    const publishingContractType = document.querySelector('input[name="publishing-contract"]:checked')?.value || 'self_publishing';
    const businessModel = document.querySelector('input[name="business-model"]:checked')?.value || 'premium';
    const postLaunchContent = document.getElementById('select-post-launch-content').value || 'none';
    const monetizationStyle = document.getElementById('select-monetization-style').value || 'cosmetic';
    const supportsPatches = document.getElementById('toggle-postlaunch-patches').checked;

    const activePipeline = pipelineManager.getActivePipeline();
    if (!activePipeline) {
        preproductionWizard.setError('No hay motores disponibles. Completa un motor propio en I+D.', 3);
        preproductionWizard.doneSubmitting();
        return;
    }
    const friction = scopeDAG.calculateFriction(activePipeline.frictionMultiplier);
    const workload = scopeDAG.calculateWorkload(activePipeline.frictionMultiplier);

    if (scopeDAG.selectedNodeIds.size < 3) {
        preproductionWizard.setError('Selecciona al menos tres nodos de arquitectura.', 3);
        preproductionWizard.doneSubmitting();
        return;
    }

    const dagConfig = {
        selectedNodeIds: Array.from(scopeDAG.selectedNodeIds),
        friction: friction,
        workload: workload,
        pipeline: activePipeline
    };

    const result = commitPreproduction(game, {
        name, topicId, genreId, platformId, targetAudience, dagConfig,
        historicalTechIds: [...selectedHistoricalTechs],
        ipId: document.getElementById('select-ip').value || null,
        ipInstallmentType: document.getElementById('select-ip-installment').value,
        publishingContractType,
        businessModel, postLaunchContent, monetizationStyle, supportsPatches
    }, check.newIPName);

    if (result.success) {
        debtManager.setBaseDebt(activePipeline.baseDebtFloor);
        if (activePipeline.type === 'commercial') {
            (activePipeline.unlockedNodes || []).forEach(nodeId => techTreeManager.unlockTech(nodeId));
        }
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
        preproductionWizard.reset();
        if (gameDevFlow && game.currentProject) {
            gameDevFlow.initProject(game.currentProject);
        }
    } else {
        preproductionWizard.setError(result.message, check.newIPName && /franquicia|registro|nombre/i.test(result.message) ? 0 : 5);
    }
    preproductionWizard.doneSubmitting();
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
    const titleEl = document.getElementById('studio-title-text');
    if (titleEl && titleEl.textContent !== state.companyName) titleEl.textContent = state.companyName;
    const logoEl = document.getElementById('studio-logo');
    if (logoEl.dataset.logo !== state.companyLogo) {
        logoEl.dataset.logo = state.companyLogo;
        renderCompanyLogo(logoEl, state.companyLogo);
    }

    // Top Bar Stats
    const fundsEl = document.getElementById('stat-funds');
    if (fundsEl) fundsEl.innerText = `$${Math.floor(state.funds).toLocaleString()}`;
    const flowEl = document.getElementById('stat-funds-flow');
    if (flowEl) {
        const weeklyCosts = Math.round(((state.employees?.reduce((s, e) => s + (Number(e.salary) || 0), 0) || 0) + (state.getActiveOffice?.().monthlyCost || 0)) / 4);
        const weeklyRevenue = Math.round(state.releasedGames?.filter(g => g.weeksOnMarket <= (g.shelfLifeWeeks || 12)).reduce((s, g) => s + (g.weeklyRevenue || 0), 0) || 0);
        const netFlow = weeklyRevenue - weeklyCosts;
        flowEl.textContent = `${netFlow >= 0 ? '+' : '-'}$${Math.abs(netFlow).toLocaleString()}/sem`;
        flowEl.classList.toggle('negative', netFlow < 0);
    }
    const fansEl = document.getElementById('stat-fans');
    if (fansEl) fansEl.innerText = state.fans?.toLocaleString() || '0';
    const rpEl = document.getElementById('stat-rp');
    if (rpEl) rpEl.innerText = state.researchPoints ?? 0;

    const histYear = state.getHistoricalYear ? state.getHistoricalYear() : (1981 + state.year);
    const calendarEl = document.getElementById('stat-calendar');
    if (calendarEl) {
        const calendarKey = `${histYear}:${state.month}:${state.week}`;
        if (calendarEl.dataset.date !== calendarKey) {
            calendarEl.dataset.date = calendarKey;
            calendarEl.innerHTML = `<strong>${histYear}</strong> · Mes <strong>${state.month}</strong> · Sem <strong>${state.week}</strong>`;
        }
    }

    const empCountEl = document.getElementById('hud-employee-count');
    if (empCountEl) {
        empCountEl.textContent = state.employees?.length || 1;
    }

    // Refresh research modal live counters if open
    const modalResearch = document.getElementById('modal-research');
    if (modalResearch && modalResearch.classList.contains('active')) {
        renderTechTree();
    }

    // Era Badge
    const eraEl = document.getElementById('badge-era');
    if (eraEl) eraEl.textContent = state.getActiveOffice?.().name || '';

    // Market Trend Pill
    const trendText = document.getElementById('trend-text');
    if (trendText && state.marketTrend) {
        trendText.innerText = `Tendencia: ${state.marketTrend.topicName} + ${state.marketTrend.genreName} (${state.marketTrend.weeksRemaining} sem)`;
    }

    // Active Project Bar & GameDevFlowController Sync
    const projBar = document.getElementById('active-project-bar');
    if (state.currentProject) {
        if (gameDevFlow) {
            gameDevFlow.syncWithProject(state.currentProject);
        }
        if (projBar) projBar.style.display = 'none';
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

        document.getElementById('pts-tech').innerText = Number(proj.techPoints || 0).toFixed(1);
        document.getElementById('pts-design').innerText = Number(proj.designPoints || 0).toFixed(1);

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
            healthPill.className = `pill-debt-health status-${healthStatus}`;
        }
        if (debtStatus) {
            debtStatus.innerText = healthStatus === 'clean' ? 'Limpio' : (healthStatus === 'moderate' ? 'Fricción Moderada' : 'Deuda Crítica');
        }
        if (debtEl) {
            debtEl.innerText = visibleDebt;
        }
        if (hiddenBadge && hiddenVal) {
            if (hiddenDebt > 0.5) {
                hiddenBadge.hidden = false;
                hiddenVal.innerText = hiddenDebt;
                hiddenBadge.title = `Deuda técnica oculta detectada gradualmente por testers de QA (+${hiddenDebt} pts)`;
            } else {
                hiddenBadge.hidden = true;
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
            const active = proj.devMode === 'refactor';
            refactorBtn.setAttribute('aria-pressed', String(active));
            const label = active ? 'Volver a desarrollo' : 'Refactorizar';
            if (refactorBtn.textContent !== label) refactorBtn.textContent = label;
        }

        const progress = Math.max(0, Math.min(100, proj.overallProgress || 0));
        document.getElementById('proj-progress-fill').style.width = progress + '%';
        document.getElementById('proj-progress-value').textContent = Math.floor(progress) + '%';
        projBar.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', String(Math.floor(progress)));

        const stageNames = {
            1: 'Fase 1: Diseño',
            2: 'Fase 2: Desarrollo',
            3: 'Fase 3: Pulido',
            4: 'Proyecto listo para publicar'
        };
        document.getElementById('stage-label').innerText = stageNames[proj.stage];
        const allocationPanel = document.getElementById('production-allocation');
        if (allocationPanel) {
            const production = ensureProduction(proj);
            const activeStage = Math.min(3, proj.stage);
            const focused = document.activeElement?.dataset?.productionArea;
            if (!focused || allocationPanel.dataset.renderWeek !== String(production.weeks) || allocationPanel.dataset.renderStage !== String(proj.stage)) {
                const openSections = [...allocationPanel.querySelectorAll('details[open]')].map(el => el.dataset.section);
                allocationPanel.dataset.renderWeek = String(production.weeks); allocationPanel.dataset.renderStage = String(proj.stage);
                const allocation = production.allocations[activeStage];
                const phaseLabels = ['Diseño', 'Desarrollo', 'Pulido'];
                allocationPanel.innerHTML = '<div class="production-phases" aria-label="Fases de producción">' + phaseLabels.map((label, index) => '<span class="production-phase ' + (index + 1 === activeStage && proj.stage < 4 ? 'is-current' : index + 1 < proj.stage ? 'is-done' : '') + '" ' + (index + 1 === activeStage && proj.stage < 4 ? 'aria-current="step"' : '') + '><b>0' + (index + 1) + '</b> ' + label + '</span>').join('') + '</div>' +
                    '<div class="production-intro"><span>Distribución de esfuerzo</span><small>Semana ' + production.weeks + '</small></div>' +
                    '<div class="production-columns">' + Object.entries(AREAS[activeStage]).map(([key,label], index) => '<label class="production-column production-color-' + index + '"><span class="production-slider-wrap"><input class="production-slider" type="range" min="0" max="100" step="1" value="' + allocation[key] + '" data-production-area="' + key + '" style="--value:' + allocation[key] + '%" ' + (proj.stage===4 ? 'disabled' : '') + ' aria-label="Esfuerzo: ' + label + '"></span><strong>' + allocation[key] + '%</strong><span class="production-area-name">' + label + '</span><small>Trabajo ' + (production.work[key] || 0).toFixed(1) + '<br>Semana +' + (production.lastAreaWork?.[key] || 0).toFixed(1) + '</small></label>').join('') + '</div>' +
                    '<div class="production-allocation-label"><span>Reparto del equipo</span><span>100%</span></div><div class="production-allocation-bar" aria-label="Reparto del esfuerzo">' + Object.keys(AREAS[activeStage]).map((key,index) => '<span class="production-segment production-color-' + index + '" data-production-segment="' + key + '" style="width:' + allocation[key] + '%"><span>' + (allocation[key] >= 8 ? allocation[key] + '%' : '') + '</span></span>').join('') + '</div>' +
                    '<p class="production-weekly">Productividad semanal: ' + (production.lastProductivity || 0).toFixed(1) + ' · Bugs: ' + (proj.bugs || 0).toFixed(1) + '</p>';
                const summary = document.createElement('p');
                const costs = production.costs || {initial:proj.devCostTotal || 0,payroll:0};
                summary.textContent = 'Nómina semanal: ' + Math.round(production.history.at(-1)?.salaries || 0).toLocaleString() + ' · Coste inicial y nóminas: ' + Math.round(costs.initial + costs.payroll).toLocaleString() + ' · Fondos disponibles: ' + Math.round(state.funds).toLocaleString();
                allocationPanel.appendChild(summary);
                const team = document.createElement('details'); team.dataset.section='team'; team.open=openSections.includes('team');
                const heading = document.createElement('summary'); heading.textContent = 'Aportación del equipo'; team.appendChild(heading);
                for (const member of production.lastContributions || []) {
                    const line = document.createElement('p');
                    line.textContent = member.name + ' · ' + member.role + ' · energía ' + Math.round(member.energy) + '% · estrés ' + Math.round(member.stress) + '% · ' + Object.entries(member.areas).map(([key,value]) => (Object.values(AREAS).find(areas => key in areas)?.[key] || key) + ': ' + value.toFixed(1)).join(', ');
                    team.appendChild(line);
                }
                allocationPanel.appendChild(team);
                const finances = document.createElement('p');
                finances.textContent = 'Nóminas por fase: ' + [1,2,3].map(n => n + ': ' + Math.round(costs.phases?.[n] || 0).toLocaleString()).join(' · ') + ' · Deuda técnica: ' + (proj.techDebtModel?.rawDebt || 0).toFixed(1) + ' · Corrección QA acumulada: ' + (production.work.bugs || 0).toFixed(1) + ' · Optimización: ' + (production.work.optimization || 0).toFixed(1);
                allocationPanel.appendChild(finances);
                const history = document.createElement('details'); history.dataset.section='history'; history.open=openSections.includes('history');
                const historyTitle=document.createElement('summary'); historyTitle.textContent='Historial de producción'; history.appendChild(historyTitle);
                for (const entry of [...production.history].reverse()) {
                    const line=document.createElement('p');
                    line.textContent='Semana ' + entry.week + ' · fase ' + entry.stage + ' · avance ' + Math.floor(entry.progress || 0) + '% · trabajo ' + (entry.effort || 0).toFixed(1) + ' · nómina ' + Math.round(entry.salaries || 0).toLocaleString() + ' · bugs ' + (entry.bugs || 0).toFixed(1) + ' · ' + formatHistoryAllocation(entry);
                    history.appendChild(line);
                }
                allocationPanel.appendChild(history);
            }
        }


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
        if (gameDevFlow) {
            gameDevFlow.syncWithProject(null);
        }
        if (projBar) projBar.style.display = 'none';
    }

    const offersContainer = document.getElementById('project-offers-container');
    const offersList = document.getElementById('project-offers-list');
    const funding = document.getElementById('project-funding');
    const offer = state.currentProject?.acceptedOffer;
    const fundingLabel = offer ? 'Financiación: ' + offer.title + (offer.amount ? ' · Anticipo $' + offer.amount.toLocaleString('es-ES') : '') : '';
    funding.hidden = !offer;
    if (funding.textContent !== fundingLabel) funding.textContent = fundingLabel;
    offersContainer.hidden = !pendingOffers.length;
    if (!pendingOffers.length) offersContainer.open = false;
    const offersKey = JSON.stringify(pendingOffers.map(({ id, title, detail }) => [id, title, detail]));
    if (offersList.dataset.offers !== offersKey) {
        offersList.dataset.offers = offersKey;
        document.getElementById('project-offers-label').textContent = 'Propuestas comerciales (' + pendingOffers.length + ')';
        offersList.replaceChildren(...pendingOffers.map(offer => {
            const row = document.createElement('article');
            row.className = 'contract-offer-card';
            const description = document.createElement('div');
            const title = document.createElement('b');
            const detail = document.createElement('p');
            title.textContent = offer.title;
            detail.textContent = offer.detail;
            description.append(title, detail);
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Revisar términos';
            button.addEventListener('click', () => window.reviewBusinessOffer(offer.id));
            row.append(description, button);
            return row;
        }));
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

let liveOpsPhoneTarget = null;

function renderLiveOps() {
    const container = liveOpsPhoneTarget || document.getElementById('liveops-games-container');
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

window.setLiveOpsPhoneTarget = function(container) {
    liveOpsPhoneTarget = container;
    if (container) renderLiveOps();
};

let marketingContext;
let selectedMarketingChannel;

function updateMarketingChannelSelection() {
    const { options, project } = marketingContext;
    const option = options.find(item => item.id === selectedMarketingChannel);
    const state = option && marketingChannelState(option, project, game.funds);
    const inspector = document.getElementById('mkt-inspector');
    const viewKey = option ? option.id + ':' + state.kind : 'empty';
    if (inspector.dataset.view !== viewKey) {
        const restoreFocus = inspector.contains(document.activeElement);
        inspector.innerHTML = renderMarketingInspector(option, state);
        inspector.dataset.view = viewKey;
        if (restoreFocus) {
            const selected = [...document.querySelectorAll('[data-mkt-channel]')].find(button => button.dataset.mktChannel === selectedMarketingChannel);
            selected?.focus({ preventScroll: true });
        }
    }
    document.querySelectorAll('#mkt-campaigns [data-mkt-channel]').forEach(button => {
        const pressed = String(button.dataset.mktChannel === selectedMarketingChannel);
        if (button.getAttribute('aria-pressed') !== pressed) button.setAttribute('aria-pressed', pressed);
    });
}


function renderMarketingHub() {
    const container = document.getElementById('marketing-hub-content');
    if (!container) return;
    const project = game.currentProject;
    const year = game.getHistoricalYear();
    const modal = container.closest('.modal-backdrop') || container.closest('.modal-window') || container.closest('.uwuntu-window') || document.getElementById('modal-marketing');
    const selectedTab = (modal && modal.querySelector('[role="tab"][aria-selected="true"]')) || document.getElementById('mkt-tab-campaigns');
    const focusedAction = container.contains(document.activeElement) ? document.activeElement : null;
    const scrollTop = container.scrollTop;
    const historyOpen = container.querySelector('.mkt-history')?.open;
    const options = game.getMarketingOptions();
    marketingContext = { project, year, options };
    if (!options.some(option => option.id === selectedMarketingChannel)) {
        selectedMarketingChannel = (options.find(option => option.available) || options[0])?.id;
    }
    const [editionLabel, editionArt] = marketingEdition(year);
    if (modal) {
        const editionEl = modal.querySelector('.mkt-edition');
        if (editionEl) editionEl.textContent = year + ' / ' + editionLabel;
    }
    const priorTargetId = document.getElementById('marketing-key-game')?.value;
    const targetGames = [ ...(project ? [{ id: project.id || `project:${project.name}`, name: `${project.name} (en desarrollo)`, isProject: true }] : []), ...game.gamesHistory.map(item => ({ id: item.id, name: item.name })) ];
    const selectedTargetId = targetGames.some(item => String(item.id) === String(priorTargetId)) ? priorTargetId : targetGames[0]?.id;
    const creators = typeof game.getCreatorProfiles === 'function'
        ? (game.getCreatorProfiles(selectedTargetId) || [])
        : (game.creatorProfiles || game.streamerProfiles || game.creators || []);
    const targetSelect = targetGames.length
        ? `<label class="marketing-key-target">Juego para las claves <select id="marketing-key-game" class="form-select" onchange="window.refreshMarketingHub()">${targetGames.map(item => `<option value="${marketingText(item.id)}" ${String(item.id) === String(selectedTargetId) ? 'selected' : ''}>${marketingText(item.name)}</option>`).join('')}</select></label>`
        : '<p class="marketing-empty">Crea o lanza un juego para enviar claves promocionales.</p>';
    const creatorCards = creators.length ? creators.map(creator => {
        const followers = Number(creator.followers || creator.audience || creator.viewers || 0);
        const genres = creator.genres || creator.preferences || creator.genrePreferences || [];
        const unavailable = creator.available === false || creator.alreadySent;
        const availability = creator.alreadySent ? 'Clave ya enviada a este creador' : (creator.available === false ? `[[DE_ICON_093]] Disponible en ${creator.yearUnlocked || 'una era posterior'}` : `Coste del paquete: $${marketingNumber(Number(creator.fee || 0) + 25)}`);
        return `<article class="marketing-creator-card"><span class="mkt-creator-icon" aria-hidden="true">[[DE_ICON_115]]</span><div><b>${marketingText(creator.name || 'Creador')}</b><p>${marketingText(creator.platform || 'Plataforma de streaming')} · ${followers.toLocaleString('es-ES')} seguidores</p><small>Preferencias: ${marketingText(Array.isArray(genres) ? genres.join(', ') : genres || 'Variadas')} · ${availability}</small></div><button type="button" class="empire-button btn-send-streamer-key" data-creator-id="${marketingText(creator.id)}" ${unavailable || !targetGames.length ? 'disabled' : ''}>${creator.alreadySent ? 'Enviada' : 'Enviar clave'}</button></article>`;
    }).join('') : '<p class="marketing-empty">Los perfiles de creadores aparecerán cuando se desbloquee el streaming.</p>';
    const futureCreators = creators.length && creators.every(creator => creator.available === false);
    const earliestYear = Math.min(...creators.map(creator => Number(creator.yearUnlocked) || Infinity));
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
    const feedMarkup = feed.length ? feed.map((post, index) => {
        const author = String(post.author || post.handle || post.source || 'Comunidad');
        const handle = String(post.handle || author).normalize('NFD').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
        const replies = Array.isArray(post.replies) ? post.replies : [];
        return `<article class="v-post">
            <div class="v-avatar v-avatar-${index % 3}" aria-hidden="true">${marketingText(author.slice(0, 2).toUpperCase())}</div>
            <div class="v-post-body"><header><strong>${marketingText(author)}</strong>${handle ? `<span>@${marketingText(handle)}</span>` : ''}</header>
                <p>${marketingText(post.text || post.message || post.content || '')}</p>
                <div class="v-post-meta">${marketingText(post.time || post.date || '')}</div>
                ${replies.length ? `<details class="v-replies"><summary>Respuestas · ${replies.length}</summary>${replies.map(reply => `<div class="v-reply"><strong>${marketingText(reply.author)}</strong><p>${marketingText(reply.text)}</p></div>`).join('')}</details>` : ''}
            </div>
        </article>`;
    }).join('') : '<p class="empire-empty">Aún no hay publicaciones. Aquí aparecerán las reacciones a tus campañas y lanzamientos.</p>';
    const broadcasts = [...(game.streamerBroadcasts || []), ...game.gamesHistory.flatMap(item => (item.streamerBroadcasts || []).map(show => ({ ...show, gameName: item.name })))];
    const broadcastMarkup = broadcasts.length ? broadcasts.slice(-6).reverse().map(show => `<li><span>[[DE_ICON_115]]</span><div><b>${marketingText(show.creatorName || show.name || 'Creador')}</b><p>${marketingText(show.gameName || 'Tu juego')} · ${Number(show.viewers || show.retainedViewers || 0).toLocaleString()} espectadores</p></div></li>`).join('') : '<li class="marketing-empty">Las retransmisiones aparecerán cuando los creadores prueben tus juegos.</li>';
    const approvalGames = game.gamesHistory.filter(item => item.userApproval !== undefined || item.reviewBombing);
    const reviewsMarkup = approvalGames.length ? approvalGames.slice(0, 5).map(item => `<div class="marketing-review-row"><b>${marketingText(item.name)}</b><span>${item.pressScore !== undefined ? `Prensa ${Number(item.pressScore).toFixed(1)}/10 · ` : ''}${item.userApproval !== undefined ? `${Math.round(item.userApproval)}% aprobación` : ''}${item.reviewBombing ? ' · [[DE_ICON_016]] Review bombing' : ''}</span></div>`).join('') : '<p class="marketing-empty">Las reseñas de prensa y usuarios se registrarán al publicar un juego.</p>';

    const archive = game.marketingPressArchive || [];
    const pressArchiveMarkup = archive.length ? `<section class="marketing-section">
        <h3>Archivo de prensa</h3><p class="marketing-section-note">Selecciona una portada para ampliarla.</p>
        <div class="marketing-press-gallery">${archive.map(cover => `<button type="button" class="press-gallery-card ${marketingText(cover.period)}" data-press-cover="${marketingText(cover.id)}">
            <span class="press-gallery-badge">${marketingText(cover.priceBadge)}</span><span class="press-gallery-pub">${marketingText(cover.publicationName)}</span>
            <strong class="press-gallery-head">${marketingText(cover.headline)}</strong>
            <span class="press-gallery-footer"><span>${marketingText(cover.gameName || 'Juego')}</span><span>Año ${marketingText(cover.year)}</span></span>
        </button>`).join('')}</div>
    </section>` : '';


    container.innerHTML = `
        <section id="mkt-campaigns" role="tabpanel" aria-labelledby="mkt-tab-campaigns" hidden>
            <header class="mkt-brief">
                <div class="mkt-brief-copy">
                    <span class="empire-label">Proyecto en promoción</span>
                    <h3>${marketingText(project?.name || 'Sin proyecto activo')}</h3>
                    <p>${project ? [project.genre?.name, project.platform?.name].filter(Boolean).map(marketingText).join(' · ') : 'Inicia un juego para lanzar tu primera campaña.'}</p>
                    <span class="empire-status" id="mkt-summary-state"></span>
                </div>
                ${marketingBriefArt(editionArt)}
                <div class="mkt-brief-metrics">
                    <div><span>Expectación</span><strong class="empire-number" id="mkt-summary-hype"></strong></div>
                    <div><span>Reconocimiento</span><strong class="empire-number" id="mkt-summary-awareness"></strong></div>
                    ${options.some(option => option.id === 'digital_demo' && option.available) ? '<div><span>Lista de deseos</span><strong class="empire-number" id="mkt-summary-wishlists"></strong></div>' : ''}
                    <div><span>Tesorería disponible</span><strong class="empire-number" id="mkt-summary-funds"></strong></div>
                </div>
            </header>
            <div class="mkt-operation">
                <section class="mkt-catalog"><h3>Canales de difusión</h3>
                    <div class="mkt-channel-list">${renderMarketingChannels(options, selectedMarketingChannel, project, game.funds)}</div>
                </section>
                <section class="mkt-inspector" id="mkt-inspector" aria-label="Detalle de campaña"></section>
            </div>
            ${renderMarketingHistory(project, game.gamesHistory)}
        </section>
        <section id="mkt-creators" role="tabpanel" aria-labelledby="mkt-tab-creators" hidden>
            <header class="mkt-subhead"><span class="empire-label">Relaciones con creadores</span><h3>Claves promocionales</h3><p>Elige un juego y busca creadores afines a su género.</p></header>
            ${futureCreators ? `<div class="creator-era"><span>EN EL HORIZONTE</span><strong>El streaming aún no ha llegado</strong><p>${Number.isFinite(earliestYear) ? 'Primeros creadores disponibles en ' + earliestYear + '.' : 'Disponible en una era posterior.'}</p></div>
                <details class="future-creators"><summary>Ver próximos creadores (${creators.length})</summary><div class="marketing-creator-list">${creatorCards}</div></details>` : `${targetSelect}<div class="marketing-creator-list">${creatorCards}</div>`}
            ${pressArchiveMarkup}<section class="marketing-section"><h3>Prensa y archivo editorial</h3>${reviewsMarkup}</section>
        </section>`;
    selectCompactMenuTab(selectedTab);
    if (historyOpen && container.querySelector('.mkt-history')) container.querySelector('.mkt-history').open = true;
    updateMarketingChannelSelection();
    container.scrollTop = scrollTop;
    if (focusedAction) {
        const actions = [...container.querySelectorAll('button, select')];
        const replacement = actions.find(action => (
            (focusedAction.id && action.id === focusedAction.id) ||
            (focusedAction.dataset.creatorId && action.dataset.creatorId === focusedAction.dataset.creatorId) ||
            (focusedAction.dataset.methodId && action.dataset.methodId === focusedAction.dataset.methodId) ||
            (focusedAction.dataset.mktChannel && action.dataset.mktChannel === focusedAction.dataset.mktChannel)
        ));
        (replacement && !replacement.disabled ? replacement : selectedTab)?.focus({ preventScroll: true });
    }
    updateMarketingHubCounters();
}

function updateMarketingHubCounters() {
    const project = game.currentProject;
    const year = game.getHistoricalYear();
    if (marketingContext?.project !== project || marketingContext?.year !== year) {
        renderMarketingHub();
        return;
    }
    const actionCount = project?.marketingActions?.length || 0;
    const counters = {
        state: !project ? 'En espera' : actionCount ? actionCount + (actionCount === 1 ? ' campaña ejecutada' : ' campañas ejecutadas') : 'Sin campañas ejecutadas',
        hype: project ? marketingNumber(project.marketingHype || project.hype) + ' pts' : '—',
        awareness: project ? marketingNumber(project.brandAwareness) + ' / 100' : '—',
        wishlists: project ? marketingNumber(project.wishlists) : '—',
        funds: marketingMoney(Math.floor(game.funds))
    };
    Object.entries(counters).forEach(([key, value]) => {
        const field = document.getElementById('mkt-summary-' + key);
        if (field && field.textContent !== value) field.textContent = value;
    });
    const stateKey = [game.funds, project?.overallProgress >= 50, actionCount].join(':');
    if (marketingContext.stateKey !== stateKey) {
        marketingContext.stateKey = stateKey;
        document.querySelectorAll('#mkt-campaigns [data-mkt-channel]').forEach((button, index) => {
            const state = marketingChannelState(marketingContext.options[index], project, game.funds);
            if (button.dataset.state === state.kind) return;
            button.dataset.state = state.kind;
            button.querySelector('.mkt-channel-state').textContent = state.label;
        });
        updateMarketingChannelSelection();
    }
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

function openWorkshopPanel() {
    renderCommunityWorkshop();
    if (window.studioPhoneNav?.openWorkshop) window.studioPhoneNav.openWorkshop();
    else openModal('modal-community-workshop');
}

window.refreshWorkshopPanel = renderCommunityWorkshop;

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
            <header class="workshop-package-head">
                <div><h3>Biblioteca de paquetes</h3><p>Instala contenido oficial o añade tus propios archivos.</p></div>
                <strong>${installed.length} instalados</strong>
            </header>
            <div class="sim-mod-actions-toolbar">
                <button type="button" class="dock-btn btn-primary-action" onclick="window.loadSimulatorModSample()">
                    [[DE_ICON_022]] Instalar pack oficial
                </button>
                <button type="button" class="dock-btn" onclick="document.getElementById('sim-mod-file-input').click()">
                    [[DE_ICON_121]] Importar JSON
                </button>
                <button type="button" class="dock-btn" onclick="window.exportSimulatorModTemplate()">
                    [[DE_ICON_048]] Descargar plantilla
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
                    <p class="workshop-empty">Todavía no has instalado paquetes. Puedes empezar con el pack oficial o importar el tuyo.</p>
                `}
            </div>

            <details class="active-catalog-preview">
                <summary>Catálogo · ${platforms.length} plataformas (${moddedPlatforms.length} de mods), ${streamers.length} creadores (${moddedStreamers.length} de mods), ${events.length} eventos</summary>
                <div class="platforms-pill-grid">
                    ${platforms.map(p => `
                        <span class="platform-chip ${p.isModded ? 'chip-mod' : ''}">
                            ${p.icon || '[[DE_ICON_001]]'} ${p.name} ${p.releaseYear ? `· ${p.releaseYear}` : p.eraUnlocked ? `· Era ${p.eraUnlocked}` : ''} ${p.isModded ? '<b>[MOD]</b>' : ''}
                        </span>
                    `).join('')}
                </div>
            </details>
        </div>
    `;
}

window.switchWorkshopTab = function(tabName) {
    selectCompactMenuTab(document.getElementById(tabName === 'simulator' ? 'tab-workshop-simulator' : 'tab-workshop-games'));
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
        if (window.studioPhoneNav?.refreshMarketing) {
            window.studioPhoneNav.refreshMarketing();
        }
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
        if (window.studioPhoneNav?.refreshMarketing) {
            window.studioPhoneNav.refreshMarketing();
        }
    } else {
        showToast(result?.message || 'No se pudo enviar la clave.', 'warn');
    }
};

function refreshOfficeManager(feedback) {
    const offices = game.getOffices();
    const funds = Math.floor(game.funds);
    const occupied = game.employees.length;
    const snapshot = JSON.stringify([funds, occupied, offices]);
    if (feedback === undefined && snapshot === lastOfficeManagerSnapshot) return;
    lastOfficeManagerSnapshot = snapshot;
    renderOfficeManager({ offices, funds, occupied, feedback, onAction: changeOffice });
}

function openOfficePanel() {
    refreshOfficeManager(null);
    if (window.studioPhoneNav?.openOffices) window.studioPhoneNav.openOffices();
    else {
        openModal('modal-offices');
        document.querySelector('#modal-offices .modal-close')?.focus();
    }
}

window.refreshOfficePanel = () => refreshOfficeManager(null);

function changeOffice(id, action) {
    const result = action === 'activate' ? game.activateOffice(id) : game.purchaseOffice(id);
    refreshOfficeManager(result);
    if (result.success && appliedSettings.autosave !== 'off') autosaveCurrentGame();
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

function openPersonnelPanel() {
    const modal = document.getElementById('modal-hire');
    if (modal && modal.classList.contains('active')) {
        closeAllModals();
        return;
    }
    if (window.uwuntuOS && window.uwuntuOS.isOpen) {
        window.uwuntuOS.close();
    }
    renderRecruitment();
    openModal('modal-hire');
}

function refreshArchitecturePanel() {
    renderDAGNodes();
    updateDAGMetricsUI();
}

function openArchitecturePanel() {
    refreshArchitecturePanel();
    if (window.studioPhoneNav?.openArchitecture) window.studioPhoneNav.openArchitecture();
    else openModal('modal-scope-dag');
}

window.refreshArchitecturePanel = refreshArchitecturePanel;

let personnelRefreshTimer = null;
let personnelLastSnapshot = '';
function queuePersonnelRefresh() {
    if (!document.querySelector('#modal-hire.active, #phone-view-personnel:not([hidden])')) return;
    const snapshot = JSON.stringify([
        game.employees.map(e => [e.id, e.salary, e.energy ?? e.stamina, e.morale, e.stress, e.tech, e.design, e.contractWeeksRemaining, e.sickWeeksRemaining, e.isLead, e.burnoutState]),
        game.availableCandidates.map(c => [c.name, c.salary]),
        game.workMode, game.funds, game.researchPoints, !!game.currentProject, game.pendingHeadhunts
    ]);
    if (snapshot === personnelLastSnapshot || personnelRefreshTimer) return;
    personnelRefreshTimer = setTimeout(() => {
        personnelRefreshTimer = null;
        if (!document.querySelector('#modal-hire.active, #phone-view-personnel:not([hidden])')) return;
        const focused = document.activeElement;
        if (focused?.closest('.staff-window') && focused.matches('input, select, button')) return;
        personnelLastSnapshot = JSON.stringify([
            game.employees.map(e => [e.id, e.salary, e.energy ?? e.stamina, e.morale, e.stress, e.tech, e.design, e.contractWeeksRemaining, e.sickWeeksRemaining, e.isLead, e.burnoutState]),
            game.availableCandidates.map(c => [c.name, c.salary]),
            game.workMode, game.funds, game.researchPoints, !!game.currentProject, game.pendingHeadhunts
        ]);
        renderRecruitment();
    }, 1000);
}

let personnelTab = 'staff';
let personnelEmployeeId = null;
let personnelCandidateName = null;

window.setPersonnelTab = function(tab) {
    const names = ['staff', 'recruitment', 'training', 'conditions', 'statistics'];
    if (!names.includes(tab)) return;
    personnelTab = tab;
    document.querySelectorAll('[data-personnel-tab]').forEach(button => {
        const active = button.dataset.personnelTab === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
    });
    names.forEach(name => {
        const panel = document.getElementById(`personnel-panel-${name}`);
        if (panel) panel.hidden = name !== tab;
    });
};

document.addEventListener('click', event => {
    const button = event.target.closest('[data-personnel-tab]');
    if (button) setPersonnelTab(button.dataset.personnelTab);
});
document.addEventListener('keydown', event => {
    const button = event.target.closest?.('[data-personnel-tab]');
    if (!button || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...button.parentElement.querySelectorAll('[data-personnel-tab]')];
    let index = tabs.indexOf(button);
    if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else index = (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault();
    setPersonnelTab(tabs[index].dataset.personnelTab);
    tabs[index].focus();
});

function renderRecruitment() {
    const maxStaff = game.getMaxStaffCapacity();
    const capacityEl = document.getElementById('hire-capacity');
    if (capacityEl) capacityEl.textContent = `${game.employees.length} / ${maxStaff} puestos ocupados`;

    const oldMentor = document.getElementById('mentor-select')?.value;
    const oldMentee = document.getElementById('mentee-select')?.value;

    // Headhunt notices
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
            return `<article class="hr-headhunt-card"><div><b>[[DE_ICON_056]] Oferta rival por ${name}</b><small>Salario propuesto: $${Number(proposedSalary).toLocaleString()}/mes · ${deadlineLabel} para responder</small></div><div><button type="button" class="staff-action-btn" onclick="resolveHeadhuntAction('${employeeId}','match')">Igualar oferta</button><button type="button" class="staff-action-btn" onclick="resolveHeadhuntAction('${employeeId}','bonus')">Bonus puntual ($1.500)</button><button type="button" class="staff-action-btn hr-danger-btn" onclick="resolveHeadhuntAction('${employeeId}','let_go')">Dejar marchar</button></div></article>`;
        }).join('');
    }

    if (personnelEmployeeId && !game.employees.some(emp => emp.id === personnelEmployeeId)) {
        personnelEmployeeId = null;
    }
    if (personnelCandidateName && !game.availableCandidates.some(c => c.name === personnelCandidateName)) {
        personnelCandidateName = null;
    }

    // --- 1. DETAILED EMPLOYEE PROFILE ---
    const employeeDetail = document.getElementById('personnel-employee-detail');
    if (employeeDetail) {
        employeeDetail.replaceChildren();
        const selectedEmp = game.employees.find(e => e.id === personnelEmployeeId);
        if (selectedEmp) {
            employeeDetail.hidden = false;
            const energy = selectedEmp.energy ?? selectedEmp.stamina ?? 100;
            const staminaPct = Math.round((energy / (selectedEmp.maxStamina || 100)) * 100);
            const staminaClass = staminaPct > 50 ? '' : (staminaPct > 25 ? 'warn' : 'crit');
            const statusLabel = selectedEmp.burnoutState === 'total' ? 'Burnout total' : (selectedEmp.burnoutState === 'risk' ? 'Riesgo burnout' : (staminaPct > 50 ? 'Óptimo' : (staminaPct > 25 ? 'Cansado' : 'Fatigado')));
            const experience = selectedEmp.experience || selectedEmp.level || 'Mid';
            const stressResistance = selectedEmp.stressResistance ?? 50;
            const morale = selectedEmp.morale ?? 70;
            const stress = selectedEmp.stress ?? 0;
            const speedRating = selectedEmp.speedRating ?? Math.round((selectedEmp.speed || 1) * 75);
            const isFounder = selectedEmp.id === 'player';
            const isLead = !!selectedEmp.isLead;

            let currentStateText = 'Disponible en el estudio';
            if (selectedEmp.sickWeeksRemaining > 0) currentStateText = `Baja médica (${selectedEmp.sickWeeksRemaining} sem)`;
            else if (selectedEmp.burnoutState === 'total') currentStateText = 'Agotamiento extremo (Burnout)';
            else if (selectedEmp.burnoutState === 'risk') currentStateText = 'En riesgo severo de burnout';
            else if (game.currentProject) currentStateText = `En desarrollo: ${game.currentProject.name}`;

            const contractText = isFounder ? 'Socio fundador (Vitalicio)' : `${selectedEmp.contractWeeksRemaining ?? 48} semanas restantes`;
            const severanceText = isFounder ? 'No aplicable' : `$${game.getEmployeeSeverance(selectedEmp).toLocaleString()}`;

            employeeDetail.innerHTML = `
                <div class="hr-profile-header">
                    <div>
                        <h3>[[DE_ICON_031]] Ficha de Empleado · ${selectedEmp.name}</h3>
                        <div class="hr-person-name-row" style="margin-top:4px;">
                            ${isFounder ? '<span class="hr-badge hr-badge-founder">Fundador</span>' : ''}
                            ${isLead ? '<span class="hr-badge hr-badge-lead">[[DE_ICON_005]] Líder</span>' : ''}
                            <span class="hr-badge hr-badge-trait">[${selectedEmp.trait || 'Estándar'}]</span>
                        </div>
                    </div>
                    <button type="button" class="staff-action-btn" id="close-employee-profile-btn">Cerrar ficha</button>
                </div>
                <div class="hr-profile-grid">
                    <div class="hr-profile-section">
                        <h4>Información general</h4>
                        <div class="hr-profile-row"><span>Especialidad:</span><strong>${selectedEmp.role}</strong></div>
                        <div class="hr-profile-row"><span>Nivel:</span><strong>${experience}</strong></div>
                        <div class="hr-profile-row"><span>Salario:</span><strong style="color:var(--accent-green, #94dbc4);">$${selectedEmp.salary.toLocaleString()}/mes</strong></div>
                        <div class="hr-profile-row"><span>Estado actual:</span><strong>${currentStateText}</strong></div>
                        <div class="hr-profile-row"><span>Contrato:</span><strong>${contractText}</strong></div>
                        <div class="hr-profile-row"><span>Indemnización:</span><strong>${severanceText}</strong></div>
                    </div>
                    <div class="hr-profile-section">
                        <h4>Habilidades</h4>
                        <div class="hr-profile-meter-row">
                            <div class="hr-profile-meter-header"><span>[[DE_ICON_018]] Tecnología</span><strong>${selectedEmp.tech} / 100</strong></div>
                            <div class="hr-meter"><span style="width:${Math.min(100, selectedEmp.tech)}%"></span></div>
                        </div>
                        <div class="hr-profile-meter-row">
                            <div class="hr-profile-meter-header"><span>[[DE_ICON_019]] Diseño</span><strong>${selectedEmp.design} / 100</strong></div>
                            <div class="hr-meter"><span style="width:${Math.min(100, selectedEmp.design)}%"></span></div>
                        </div>
                        <div class="hr-profile-meter-row">
                            <div class="hr-profile-meter-header"><span>[[DE_ICON_022]] Velocidad</span><strong>${speedRating} / 100</strong></div>
                            <div class="hr-meter"><span style="width:${Math.min(100, speedRating)}%"></span></div>
                        </div>
                        <div class="hr-profile-meter-row">
                            <div class="hr-profile-meter-header"><span>[[DE_ICON_021]] Resistencia al estrés</span><strong>${stressResistance} / 100</strong></div>
                            <div class="hr-meter"><span style="width:${Math.min(100, stressResistance)}%"></span></div>
                        </div>
                    </div>
                    <div class="hr-profile-section">
                        <h4>Bienestar y salud</h4>
                        <div class="hr-profile-meter-row">
                            <div class="hr-profile-meter-header"><span>[[DE_ICON_029]] Energía</span><strong>${staminaPct}%</strong></div>
                            <div class="hr-meter"><span class="${staminaClass}" style="width:${staminaPct}%"></span></div>
                        </div>
                        <div class="hr-profile-meter-row">
                            <div class="hr-profile-meter-header"><span>[[DE_ICON_124]] Moral</span><strong>${Math.round(morale)}%</strong></div>
                            <div class="hr-meter"><span style="width:${Math.min(100, Math.round(morale))}%"></span></div>
                        </div>
                        <div class="hr-profile-meter-row">
                            <div class="hr-profile-meter-header"><span>[[DE_ICON_022]] Estrés acumulado</span><strong>${Math.round(stress)}%</strong></div>
                            <div class="hr-meter"><span class="${stress > 60 ? 'crit' : (stress > 30 ? 'warn' : '')}" style="width:${Math.min(100, Math.round(stress))}%"></span></div>
                        </div>
                        <div class="hr-profile-row" style="margin-top:4px;"><span>Diagnóstico:</span><strong>${statusLabel}</strong></div>
                        <div class="hr-profile-row"><span>Semanas crunch:</span><strong>${selectedEmp.continuousCrunchWeeks || 0} sem</strong></div>
                    </div>
                </div>
                <div class="hr-profile-actions">
                    <span class="hr-profile-actions-label">Acciones de gestión</span>
                    <button type="button" class="staff-action-btn" onclick="adjustEmployeeSalary('${selectedEmp.id}', ${Math.round(selectedEmp.salary * 0.9)})">−10% Salario ($${Math.round(selectedEmp.salary * 0.9).toLocaleString()})</button>
                    <button type="button" class="staff-action-btn" onclick="adjustEmployeeSalary('${selectedEmp.id}', ${Math.round(selectedEmp.salary * 1.1)})">+10% Salario ($${Math.round(selectedEmp.salary * 1.1).toLocaleString()})</button>
                    <button type="button" class="staff-action-btn" onclick="sendOnVacation('${selectedEmp.id}')" ${game.funds < 2000 || staminaPct >= 100 ? 'disabled' : ''} title="Restaura 100% de energía">[[DE_ICON_108]] Vacaciones ($2.000)</button>
                    <button type="button" class="staff-action-btn" onclick="trainEmployee('${selectedEmp.id}', 'tech')" ${game.funds < 3500 || game.researchPoints < 20 ? 'disabled' : ''} title="+8 Tech permanente">[[DE_ICON_018]] Curso Tech +8 ($3.500, 20 RP)</button>
                    <button type="button" class="staff-action-btn" onclick="trainEmployee('${selectedEmp.id}', 'design')" ${game.funds < 3500 || game.researchPoints < 20 ? 'disabled' : ''} title="+8 Diseño permanente">[[DE_ICON_019]] Curso Des +8 ($3.500, 20 RP)</button>
                    ${isLead ? '<button type="button" class="staff-action-btn" disabled>[[DE_ICON_005]] Líder Asignado</button>' : `<button type="button" class="staff-action-btn" onclick="assignEmployeeLead('${selectedEmp.id}')">[[DE_ICON_005]] Asignar Líder</button>`}
                    ${!isFounder ? `
                        <button type="button" class="staff-action-btn" onclick="renewStaffContract('${selectedEmp.id}', 0.05)">Renovar +5% ($${Math.round(selectedEmp.salary * 1.05).toLocaleString()})</button>
                        <button type="button" class="staff-action-btn" onclick="renewStaffContract('${selectedEmp.id}', 0.10)">Renovar +10% ($${Math.round(selectedEmp.salary * 1.10).toLocaleString()})</button>
                        <button type="button" class="staff-action-btn hr-danger-btn" onclick="confirmStaffDismissal('${selectedEmp.id}')">[[DE_ICON_015]] Despedir</button>
                    ` : ''}
                </div>
            `;
            employeeDetail.querySelector('#close-employee-profile-btn')?.addEventListener('click', () => {
                personnelEmployeeId = null;
                renderRecruitment();
            });
        } else {
            employeeDetail.hidden = true;
        }
    }

    // --- COMPACT EMPLOYEE LIST ---
    const currentList = document.getElementById('current-team-list');
    if (currentList) {
        currentList.replaceChildren();
        game.employees.forEach(emp => {
            const energy = emp.energy ?? emp.stamina ?? 100;
            const staminaPct = Math.round((energy / (emp.maxStamina || 100)) * 100);
            const staminaClass = staminaPct > 50 ? '' : (staminaPct > 25 ? 'warn' : 'crit');
            const experience = emp.experience || emp.level || 'Mid';
            const morale = emp.morale ?? 70;
            const stress = emp.stress ?? 0;
            const speedRating = emp.speedRating ?? Math.round((emp.speed || 1) * 75);
            const isFounder = emp.id === 'player';
            const isLead = !!emp.isLead;
            const isSelected = personnelEmployeeId === emp.id;

            let stateBadgeClass = '';
            let stateBadgeText = 'Disponible';
            if (emp.sickWeeksRemaining > 0) {
                stateBadgeClass = 'is-sick';
                stateBadgeText = `Baja médica (${emp.sickWeeksRemaining} sem)`;
            } else if (emp.burnoutState === 'total') {
                stateBadgeClass = 'is-burnout';
                stateBadgeText = 'Burnout total';
            } else if (emp.burnoutState === 'risk') {
                stateBadgeClass = 'is-burnout';
                stateBadgeText = 'Riesgo burnout';
            } else if (game.currentProject) {
                stateBadgeText = `Trabajando en ${game.currentProject.name}`;
            }

            const card = document.createElement('article');
            card.className = `hr-person-card${isSelected ? ' is-selected' : ''}`;
            card.dataset.employeeId = emp.id;
            card.innerHTML = `
                <div class="hr-person-top">
                    <div class="hr-person-identity">
                        <div class="hr-person-name-row">
                            <strong>${emp.name}</strong>
                            ${isFounder ? '<span class="hr-badge hr-badge-founder">Fundador</span>' : ''}
                            ${isLead ? '<span class="hr-badge hr-badge-lead">[[DE_ICON_005]] Líder</span>' : ''}
                            <span class="hr-badge hr-badge-trait">[${emp.trait || 'Estándar'}]</span>
                        </div>
                        <span class="hr-person-role">${emp.role} · ${experience}</span>
                    </div>
                    <div class="hr-person-salary">$${emp.salary.toLocaleString()}/mes</div>
                </div>
                <div class="hr-metrics">
                    <div class="hr-metric is-energy">
                        <span>Energía <b>${staminaPct}%</b></span>
                        <div class="hr-meter"><span class="${staminaClass}" style="width:${staminaPct}%"></span></div>
                    </div>
                    <div class="hr-metric">
                        <span>Moral <b>${Math.round(morale)}%</b></span>
                        <div class="hr-meter"><span style="width:${Math.min(100, Math.round(morale))}%"></span></div>
                    </div>
                    <div class="hr-metric is-stress">
                        <span>Estrés <b>${Math.round(stress)}%</b></span>
                        <div class="hr-meter"><span class="${stress > 60 ? 'crit' : (stress > 30 ? 'warn' : '')}" style="width:${Math.min(100, Math.round(stress))}%"></span></div>
                    </div>
                </div>
                <div class="hr-person-bottom">
                    <div class="hr-person-skills-summary">
                        <span>[[DE_ICON_018]] Tech: <b>${emp.tech}</b></span>
                        <span>[[DE_ICON_019]] Des: <b>${emp.design}</b></span>
                        <span>[[DE_ICON_022]] Vel: <b>${speedRating}</b></span>
                        <span class="hr-status-badge ${stateBadgeClass}">${stateBadgeText}</span>
                    </div>
                    <button type="button" class="staff-action-btn ${isSelected ? 'staff-action-highlight' : ''}" data-action="toggle-profile">
                        ${isSelected ? 'Ficha abierta' : 'Ver perfil y gestionar'}
                    </button>
                </div>
            `;
            card.querySelector('[data-action="toggle-profile"]').addEventListener('click', () => {
                personnelEmployeeId = isSelected ? null : emp.id;
                renderRecruitment();
                if (personnelEmployeeId) {
                    document.getElementById('personnel-employee-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
            currentList.appendChild(card);
        });
    }

    // --- 2. CANDIDATE DETAILED PROFILE & POOL ---
    const candidateDetail = document.getElementById('personnel-candidate-detail');
    if (candidateDetail) {
        candidateDetail.replaceChildren();
        const selectedCand = game.availableCandidates.find(c => c.name === personnelCandidateName);
        if (selectedCand) {
            candidateDetail.hidden = false;
            const speedRating = selectedCand.speedRating ?? Math.round((selectedCand.speed || 1) * 75);
            const stressResistance = selectedCand.stressResistance ?? 50;
            const canAfford = game.funds >= selectedCand.salary;
            const hasDesk = game.employees.length < maxStaff;
            candidateDetail.innerHTML = `
                <div class="hr-profile-header">
                    <div>
                        <h3>[[DE_ICON_062]] Ficha de Candidato · ${selectedCand.name}</h3>
                        <div class="hr-person-name-row" style="margin-top:4px;">
                            <span class="hr-badge hr-badge-trait">[${selectedCand.trait || 'Estándar'}]</span>
                            <span class="hr-badge hr-badge-lead">${selectedCand.experience || selectedCand.level || 'Mid'}</span>
                        </div>
                    </div>
                    <button type="button" class="staff-action-btn" id="close-candidate-profile-btn">Cerrar ficha</button>
                </div>
                <div class="hr-profile-grid">
                    <div class="hr-profile-section">
                        <h4>Datos del candidato</h4>
                        <div class="hr-profile-row"><span>Especialidad:</span><strong>${selectedCand.role}</strong></div>
                        <div class="hr-profile-row"><span>Nivel:</span><strong>${selectedCand.experience || selectedCand.level || 'Mid'}</strong></div>
                        <div class="hr-profile-row"><span>Salario solicitado:</span><strong style="color:var(--accent-green, #94dbc4);">$${selectedCand.salary.toLocaleString()}/mes</strong></div>
                        <p style="font-size:12px;color:#a8bdc7;line-height:1.45;margin-top:6px;">${selectedCand.desc || 'Profesional motivado para incorporarse al equipo de desarrollo.'}</p>
                    </div>
                    <div class="hr-profile-section">
                        <h4>Habilidades</h4>
                        <div class="hr-profile-meter-row">
                            <div class="hr-profile-meter-header"><span>[[DE_ICON_018]] Tecnología</span><strong>${selectedCand.tech} / 100</strong></div>
                            <div class="hr-meter"><span style="width:${Math.min(100, selectedCand.tech)}%"></span></div>
                        </div>
                        <div class="hr-profile-meter-row">
                            <div class="hr-profile-meter-header"><span>[[DE_ICON_019]] Diseño</span><strong>${selectedCand.design} / 100</strong></div>
                            <div class="hr-meter"><span style="width:${Math.min(100, selectedCand.design)}%"></span></div>
                        </div>
                        <div class="hr-profile-meter-row">
                            <div class="hr-profile-meter-header"><span>[[DE_ICON_022]] Velocidad</span><strong>${speedRating} / 100</strong></div>
                            <div class="hr-meter"><span style="width:${Math.min(100, speedRating)}%"></span></div>
                        </div>
                        <div class="hr-profile-meter-row">
                            <div class="hr-profile-meter-header"><span>[[DE_ICON_021]] Resistencia al estrés</span><strong>${stressResistance} / 100</strong></div>
                            <div class="hr-meter"><span style="width:${Math.min(100, stressResistance)}%"></span></div>
                        </div>
                    </div>
                    <div class="hr-profile-section">
                        <h4>Viabilidad financiera</h4>
                        <div class="hr-profile-row"><span>Fondos disponibles:</span><strong>$${game.funds.toLocaleString()}</strong></div>
                        <div class="hr-profile-row"><span>Espacio en oficina:</span><strong>${hasDesk ? `${game.employees.length}/${maxStaff} escritorios` : 'Oficina llena (0 escritorios)'}</strong></div>
                        <div style="margin-top:8px;">
                            ${canAfford ? '<span class="hr-candidate-affordability is-affordable">Fondos disponibles para contratar</span>' : '<span class="hr-candidate-affordability not-affordable">Fondos insuficientes para el salario</span>'}
                        </div>
                    </div>
                </div>
                <div class="hr-profile-actions">
                    <button type="button" class="staff-action-btn staff-action-highlight" id="hire-from-detail-btn" ${!canAfford || !hasDesk ? 'disabled' : ''}>
                        [[DE_ICON_073]] Contratar a ${selectedCand.name} ($${selectedCand.salary.toLocaleString()}/mes)
                    </button>
                </div>
            `;
            candidateDetail.querySelector('#close-candidate-profile-btn')?.addEventListener('click', () => {
                personnelCandidateName = null;
                renderRecruitment();
            });
            candidateDetail.querySelector('#hire-from-detail-btn')?.addEventListener('click', () => {
                const candName = selectedCand.name;
                personnelCandidateName = null;
                hireCandidate(candName);
            });
        } else {
            candidateDetail.hidden = true;
        }
    }

    const candidatesList = document.getElementById('candidates-list');
    if (candidatesList) {
        candidatesList.replaceChildren();
        if (game.availableCandidates.length === 0) {
            candidatesList.innerHTML = `<p style="color:var(--text-secondary,#a8bdc7);padding:14px;">No hay candidatos disponibles en este momento. Utiliza el botón "Buscar nuevos talentos" para sondear el mercado de trabajo.</p>`;
        } else {
            game.availableCandidates.forEach(c => {
                const canAfford = game.funds >= c.salary;
                const hasDesk = game.employees.length < maxStaff;
                const speedRating = c.speedRating ?? Math.round((c.speed || 1) * 75);
                const stressResistance = c.stressResistance ?? 50;
                const experience = c.experience || c.level || 'Mid';

                const card = document.createElement('article');
                card.className = 'hr-candidate-card';
                card.innerHTML = `
                    <div class="hr-person-top">
                        <div class="hr-person-identity">
                            <div class="hr-person-name-row">
                                <strong>${c.name}</strong>
                                <span class="hr-badge hr-badge-trait">[${c.trait || 'Estándar'}]</span>
                            </div>
                            <span class="hr-person-role">${c.role} · ${experience}</span>
                        </div>
                        <div class="hr-person-salary">$${c.salary.toLocaleString()}/mes</div>
                    </div>
                    <div class="hr-person-skills-summary">
                        <span>[[DE_ICON_018]] Tech: <b>${c.tech}</b></span>
                        <span>[[DE_ICON_019]] Des: <b>${c.design}</b></span>
                        <span>[[DE_ICON_022]] Vel: <b>${speedRating}</b></span>
                        <span>[[DE_ICON_021]] Res: <b>${stressResistance}</b></span>
                    </div>
                    <div class="hr-person-bottom">
                        <span class="hr-candidate-affordability ${canAfford ? 'is-affordable' : 'not-affordable'}">
                            ${canAfford ? 'Fondos disponibles' : 'Fondos insuficientes'}
                        </span>
                        <div style="display:flex;gap:8px;">
                            <button type="button" class="staff-action-btn" data-action="inspect">Ver ficha</button>
                            <button type="button" class="staff-action-btn staff-action-highlight" data-action="hire" ${!canAfford || !hasDesk ? 'disabled' : ''}>Contratar</button>
                        </div>
                    </div>
                `;
                card.querySelector('[data-action="inspect"]').addEventListener('click', () => {
                    personnelCandidateName = (personnelCandidateName === c.name ? null : c.name);
                    renderRecruitment();
                    if (personnelCandidateName) {
                        document.getElementById('personnel-candidate-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                });
                card.querySelector('[data-action="hire"]').addEventListener('click', () => {
                    hireCandidate(c.name);
                });
                candidatesList.appendChild(card);
            });
        }
    }

    // --- 3. TRAINING & MENTORING TAB ---
    const seniorStaff = game.employees.filter(emp => (['Senior', 'Lead'].includes(emp.experience) || (emp.tech || 0) >= 55 || (emp.design || 0) >= 55));
    const juniorStaff = game.employees.filter(emp => emp.experience === 'Junior');
    const banner = document.getElementById('training-status-banner');
    if (banner) {
        if (game.currentProject) {
            banner.className = 'hr-training-alert is-warning';
            banner.innerHTML = `<span>[[DE_ICON_022]]</span><div><strong>Formación pausada:</strong> El estudio está desarrollando actualmente "${game.currentProject.name}". El mentoring requiere dedicación exclusiva y solo está disponible cuando no hay videojuegos en producción.</div>`;
        } else if (!seniorStaff.length) {
            banner.className = 'hr-training-alert is-warning';
            banner.innerHTML = `<span>[[DE_ICON_022]]</span><div><strong>Mentor no disponible:</strong> Necesitas al menos un empleado Sénior, Líder o con habilidad 55+ en Tecnología o Diseño para ejercer de mentor.</div>`;
        } else if (!juniorStaff.length) {
            banner.className = 'hr-training-alert is-warning';
            banner.innerHTML = `<span>[[DE_ICON_022]]</span><div><strong>Aprendiz no disponible:</strong> Necesitas al menos un empleado Júnior en plantilla para recibir formación.</div>`;
        } else {
            banner.className = 'hr-training-alert is-success';
            banner.innerHTML = `<span>[[DE_ICON_028]]</span><div><strong>Condiciones óptimas:</strong> Selecciona un mentor y un aprendiz para iniciar la sesión de formación interna.</div>`;
        }
    }
    const mentorSelect = document.getElementById('mentor-select');
    const menteeSelect = document.getElementById('mentee-select');
    if (mentorSelect) {
        mentorSelect.innerHTML = seniorStaff.length
            ? seniorStaff.map(emp => `<option value="${emp.id}">${emp.name} · ${emp.role} (Tech ${emp.tech}, Des ${emp.design})</option>`).join('')
            : '<option value="">No hay mentor sénior disponible</option>';
        if (oldMentor && [...mentorSelect.options].some(o => o.value === oldMentor)) mentorSelect.value = oldMentor;
    }
    if (menteeSelect) {
        menteeSelect.innerHTML = juniorStaff.length
            ? juniorStaff.map(emp => `<option value="${emp.id}">${emp.name} · ${emp.role} (Tech ${emp.tech}, Des ${emp.design})</option>`).join('')
            : '<option value="">No hay aprendiz júnior disponible</option>';
        if (oldMentee && [...menteeSelect.options].some(o => o.value === oldMentee)) menteeSelect.value = oldMentee;
    }
    const trainingBtn = document.querySelector('#personnel-panel-training button[onclick="startEmployeeMentoring()"]');
    if (trainingBtn) {
        trainingBtn.disabled = !seniorStaff.length || !juniorStaff.length || !!game.currentProject;
    }

    // --- 4. WORK CONDITIONS TAB ---
    const workMode = game.workMode || 'normal';
    const modeStatus = document.getElementById('work-mode-status');
    const modeCopy = {
        normal: 'Modo activo: Ritmo Normal · Jornada de 40 horas, balance entre productividad y fatiga.',
        relaxed: 'Modo activo: Ritmo Relajado · Jornada de 30 horas, mayor descanso, recuperación de energía y alivio de estrés.',
        crunch: 'Modo activo: Horas Extra / Crunch · Máxima aceleración del desarrollo (+40%), con severo desgaste, estrés y acumulación de bugs.'
    };
    if (modeStatus) modeStatus.innerHTML = `<span>${modeCopy[workMode] || modeCopy.normal}</span>`;
    document.querySelectorAll('.hr-mode-buttons button').forEach(button => {
        const selected = button.getAttribute('onclick')?.includes(`'${workMode}'`);
        button.classList.toggle('active', Boolean(selected));
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    const modeComparison = document.getElementById('work-mode-comparison');
    if (modeComparison) {
        modeComparison.innerHTML = `
            <div class="hr-mode-card${workMode === 'relaxed' ? ' is-active' : ''}">
                <div class="hr-mode-card-header">
                    <strong>[[DE_ICON_064]] Relajado</strong>
                    <span class="hr-mode-card-badge">30 h/semana</span>
                </div>
                <div class="hr-mode-card-effects">
                    <div class="hr-mode-effect-row"><span>Productividad:</span><b>80% (ritmo suave)</b></div>
                    <div class="hr-mode-effect-row"><span>Energía:</span><b style="color:#8ee3be">+0.18 / semana</b></div>
                    <div class="hr-mode-effect-row"><span>Estrés:</span><b style="color:#8ee3be">−0.35 / semana</b></div>
                    <div class="hr-mode-effect-row"><span>Moral:</span><b style="color:#8ee3be">+0.24 / semana</b></div>
                    <div class="hr-mode-effect-row"><span>Riesgo burnout:</span><b>Muy bajo</b></div>
                    <div class="hr-mode-effect-row"><span>Deuda técnica:</span><b>Mínima</b></div>
                </div>
            </div>
            <div class="hr-mode-card${workMode === 'normal' ? ' is-active' : ''}">
                <div class="hr-mode-card-header">
                    <strong>[[DE_ICON_063]] Normal</strong>
                    <span class="hr-mode-card-badge">40 h/semana</span>
                </div>
                <div class="hr-mode-card-effects">
                    <div class="hr-mode-effect-row"><span>Productividad:</span><b>100% estándar</b></div>
                    <div class="hr-mode-effect-row"><span>Energía:</span><b>Desgaste moderado</b></div>
                    <div class="hr-mode-effect-row"><span>Estrés:</span><b>Equilibrado</b></div>
                    <div class="hr-mode-effect-row"><span>Moral:</span><b>Estable</b></div>
                    <div class="hr-mode-effect-row"><span>Riesgo burnout:</span><b>Bajo</b></div>
                    <div class="hr-mode-effect-row"><span>Deuda técnica:</span><b>Tasa estándar</b></div>
                </div>
            </div>
            <div class="hr-mode-card${workMode === 'crunch' ? ' is-active' : ''}">
                <div class="hr-mode-card-header">
                    <strong>[[DE_ICON_022]] Crunch</strong>
                    <span class="hr-mode-card-badge" style="background:rgba(240,100,80,0.2);color:#ff9e9e;">Horas extra</span>
                </div>
                <div class="hr-mode-card-effects">
                    <div class="hr-mode-effect-row"><span>Productividad:</span><b style="color:#ffd86b">+40% avance</b></div>
                    <div class="hr-mode-effect-row"><span>Energía:</span><b style="color:#ff8e8e">−0.72 / semana</b></div>
                    <div class="hr-mode-effect-row"><span>Estrés:</span><b style="color:#ff8e8e">+0.42 / semana</b></div>
                    <div class="hr-mode-effect-row"><span>Moral:</span><b style="color:#ff8e8e">−0.16 / semana</b></div>
                    <div class="hr-mode-effect-row"><span>Riesgo burnout:</span><b style="color:#ff8e8e">Crítico</b></div>
                    <div class="hr-mode-effect-row"><span>Deuda técnica:</span><b style="color:#ff8e8e">Muy alta</b></div>
                </div>
            </div>
        `;
    }
    const coffeeAffordability = document.getElementById('coffee-affordability');
    if (coffeeAffordability) {
        coffeeAffordability.textContent = game.funds >= 500 ? `Fondos disponibles ($${game.funds.toLocaleString()})` : `Fondos insuficientes (requiere $500)`;
    }
    const coffeeBtn = document.querySelector('#personnel-panel-conditions button[onclick="orderTeamCoffee()"]');
    if (coffeeBtn) coffeeBtn.disabled = game.funds < 500;

    // --- 5. TEAM STATISTICS TAB ---
    const statsContainer = document.getElementById('personnel-statistics');
    if (statsContainer) {
        const team = game.employees;
        const average = fn => team.length ? Math.round(team.reduce((total, emp) => total + fn(emp), 0) / team.length) : 0;
        const totalPayroll = team.reduce((sum, emp) => sum + Number(emp.salary || 0), 0);
        const avgMorale = average(emp => emp.morale ?? 70);
        const avgStress = average(emp => emp.stress ?? 0);
        const avgEnergy = average(emp => emp.energy ?? emp.stamina ?? 100);
        const avgTech = average(emp => Number(emp.tech) || 0);
        const avgDesign = average(emp => Number(emp.design) || 0);
        const burnoutCases = team.filter(emp => emp.burnoutState === 'risk' || emp.burnoutState === 'total' || (emp.stress ?? 0) >= 70).length;

        const roleCounts = new Map();
        team.forEach(emp => {
            const role = emp.role || 'Sin rol';
            roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
        });

        const expCounts = new Map([['Junior', 0], ['Mid', 0], ['Senior', 0], ['Lead', 0]]);
        team.forEach(emp => {
            const exp = emp.experience || emp.level || 'Mid';
            expCounts.set(exp, (expCounts.get(exp) || 0) + 1);
        });

        statsContainer.innerHTML = `
            <div class="hr-stats-grid">
                <div class="hr-stat-card">
                    <span>Plantilla activa</span>
                    <strong>${team.length} / ${maxStaff}</strong>
                    <small>Escritorios ocupados</small>
                </div>
                <div class="hr-stat-card">
                    <span>Nómina mensual</span>
                    <strong style="color:var(--accent-green, #94dbc4);">$${totalPayroll.toLocaleString()}</strong>
                    <small>Gasto recurrente</small>
                </div>
                <div class="hr-stat-card">
                    <span>Moral media</span>
                    <strong>${avgMorale}%</strong>
                    <small>${avgMorale >= 75 ? 'Excelente ambiente' : (avgMorale >= 50 ? 'Ambiente normal' : 'Moral deprimida')}</small>
                </div>
                <div class="hr-stat-card">
                    <span>Estrés medio</span>
                    <strong style="${avgStress > 50 ? 'color:#f28b82;' : ''}">${avgStress}%</strong>
                    <small>${avgStress > 50 ? 'Alerta por fatiga' : 'Estrés controlado'}</small>
                </div>
                <div class="hr-stat-card">
                    <span>Energía media</span>
                    <strong>${avgEnergy}%</strong>
                    <small>${avgEnergy > 50 ? 'Equipo descansado' : 'Equipo fatigado'}</small>
                </div>
                <div class="hr-stat-card">
                    <span>Nivel tecnológico</span>
                    <strong>${avgTech} pts</strong>
                    <small>Capacidad técnica media</small>
                </div>
                <div class="hr-stat-card">
                    <span>Nivel de diseño</span>
                    <strong>${avgDesign} pts</strong>
                    <small>Creatividad media</small>
                </div>
                <div class="hr-stat-card">
                    <span>Riesgo de burnout</span>
                    <strong style="${burnoutCases > 0 ? 'color:#f28b82;' : ''}">${burnoutCases} ${burnoutCases === 1 ? 'caso' : 'casos'}</strong>
                    <small>${burnoutCases === 0 ? 'Sin incidencias' : 'Requiere descanso'}</small>
                </div>
            </div>
            <div class="hr-stat-breakdowns">
                <div class="hr-stat-list">
                    <h4>Distribución por especialidad</h4>
                    ${[...roleCounts.entries()].map(([role, count]) => {
                        const pct = Math.round((count / (team.length || 1)) * 100);
                        return `
                            <div class="hr-stat-list-row">
                                <span>${role}</span>
                                <b>${count} (${pct}%)</b>
                                <div class="hr-stat-list-meter"><span style="width:${pct}%"></span></div>
                            </div>
                        `;
                    }).join('') || '<p style="color:#a8bdc7;font-size:13px;">No hay miembros en plantilla.</p>'}
                </div>
                <div class="hr-stat-list">
                    <h4>Nivel de experiencia</h4>
                    ${[...expCounts.entries()].map(([exp, count]) => {
                        const pct = Math.round((count / (team.length || 1)) * 100);
                        return `
                            <div class="hr-stat-list-row">
                                <span>${exp}</span>
                                <b>${count} (${pct}%)</b>
                                <div class="hr-stat-list-meter"><span style="width:${pct}%"></span></div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    setPersonnelTab(personnelTab);
}

window.renewStaffContract = function(id, increase) {
    const result = game.renewEmployeeContract(id, increase);
    showToast(result.message, result.success ? 'success' : 'warn');
    renderRecruitment();
};

window.confirmStaffDismissal = function(id) {
    const employee = game.employees.find(item => item.id === id);
    if (!employee || id === 'player') return;
    const dialog = document.createElement('dialog');
    dialog.className = 'game-dialog dismissal-dialog';
    dialog.setAttribute('aria-labelledby', 'dismiss-staff-title');
    dialog.setAttribute('aria-describedby', 'dismiss-staff-description');
    dialog.innerHTML = `<div class="dismissal-topline"><span>GESTIÓN DE PERSONAL</span><span class="dismissal-step">DECISIÓN DE PLANTILLA</span></div>
        <div class="dismissal-heading"><div class="dismissal-symbol" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><circle cx="13" cy="10" r="5"/><path d="M4 25v-2c0-4 4-7 9-7 2 0 4 .5 5.5 1.4M22 20l6 6m0-6-6 6"/></svg></div><div><h2 id="dismiss-staff-title">Confirmar despido</h2><p id="dismiss-staff-description">Esta decisión finaliza el contrato de <strong data-employee-name></strong>.</p></div></div>
        <div class="dismissal-cost"><div><span>INDEMNIZACIÓN</span><small>Pago único al confirmar</small></div><strong data-severance></strong></div>
        <div class="dismissal-effects"><span class="dismissal-effects-title">CONSECUENCIAS</span><p>El empleado dejará el estudio y se liberará su puesto.</p><p>La moral del resto del equipo disminuirá 5 puntos.</p></div>
        <div class="dismissal-actions"><button type="button" class="dismissal-cancel">Mantener empleado</button><button type="button" class="dismissal-confirm">Pagar y despedir</button></div>`;
    dialog.querySelector('[data-employee-name]').textContent = employee.name;
    dialog.querySelector('[data-severance]').textContent = `$${game.getEmployeeSeverance(employee).toLocaleString()}`;
    const cancel = dialog.querySelector('.dismissal-cancel');
    const confirm = dialog.querySelector('.dismissal-confirm');
    cancel.addEventListener('click', () => dialog.close());
    confirm.addEventListener('click', () => {
        const result = game.dismissEmployee(id);
        showToast(result.message, result.success ? 'success' : 'warn');
        if (result.success) world.syncEmployees(game.employees);
        renderRecruitment(); dialog.close();
    });
    dialog.addEventListener('close', () => { dialog.remove(); document.querySelector(`[data-employee-id="${CSS.escape(id)}"] button`)?.focus(); });
    document.body.appendChild(dialog); dialog.showModal(); cancel.focus();
};

window.refreshPersonnelPanel = renderRecruitment;

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

let activeResearchTab = 'summary';

window.switchLabTab = function(tabName) {
    activeResearchTab = tabName;
    const nav = document.getElementById('research-nav');
    if (nav) {
        nav.querySelectorAll('.research-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
    }
    const panes = {
        summary: document.getElementById('research-tab-summary'),
        map: document.getElementById('research-tab-map'),
        labs: document.getElementById('research-tab-labs'),
        hardware: document.getElementById('research-tab-hardware')
    };
    for (const [key, pane] of Object.entries(panes)) {
        if (pane) {
            pane.classList.toggle('active', key === tabName);
        }
    }
    renderTechTree();
};

function setupResearchSections() {
    const nav = document.getElementById('research-nav');
    if (!nav || nav.dataset.initialized === 'true') return;
    nav.dataset.initialized = 'true';

    nav.addEventListener('click', event => {
        const btn = event.target.closest('.research-nav-btn');
        if (btn && btn.dataset.tab) {
            window.switchLabTab(btn.dataset.tab);
        }
    });
}

function renderResearchSummary(mgr, historicalYear) {
    const strategicBar = document.getElementById('rd-strategic-bar');
    const heroContainer = document.getElementById('rd-hero-container');
    const availableContainer = document.getElementById('rd-available-container');
    const progressionContainer = document.getElementById('rd-progression-container');
    if (!strategicBar || !heroContainer || !availableContainer || !progressionContainer) return;

    // 1. Strategic Telemetry Bar
    const totalTech = (game.employees || []).reduce((acc, e) => acc + (e.tech || 20), 0);
    const weeklyRP = Math.max(1, Math.floor(totalTech / 45));

    let eraTag = 'Era 8-bit';
    let nextEraInfo = '1990 (Era 16/32-bit)';
    if (historicalYear >= 2015) {
        eraTag = 'Era Moderna';
        nextEraInfo = 'Era Actual';
    } else if (historicalYear >= 2000) {
        eraTag = 'Era 2000+';
        nextEraInfo = '2015 (Era Moderna)';
    } else if (historicalYear >= 1990) {
        eraTag = 'Era 16/32-bit';
        nextEraInfo = '2000 (Era 2000+)';
    }

    const unlockedCount = mgr.getUnlockedCount();
    const totalCount = mgr.getTotalCount();
    const masteryPercent = Math.round((unlockedCount / totalCount) * 100);
    const activeRes = game.activeResearch;

    strategicBar.innerHTML = `
        <div class="rd-stat-card">
            <div class="rd-stat-icon">[[DE_ICON_006]]</div>
            <div class="rd-stat-info">
                <div class="rd-stat-label">Puntos de I+D</div>
                <div class="rd-stat-value">${game.researchPoints.toLocaleString()} RP</div>
                <div class="rd-stat-sub">+${weeklyRP} RP/semana pasivo</div>
            </div>
        </div>
        <div class="rd-stat-card">
            <div class="rd-stat-icon gold">[[DE_ICON_066]]</div>
            <div class="rd-stat-info">
                <div class="rd-stat-label">Línea Temporal</div>
                <div class="rd-stat-value">Año ${historicalYear}</div>
                <div class="rd-stat-sub">${eraTag}</div>
            </div>
        </div>
        <div class="rd-stat-card">
            <div class="rd-stat-icon green">[[DE_ICON_059]]</div>
            <div class="rd-stat-info">
                <div class="rd-stat-label">Dominio Tecnológico</div>
                <div class="rd-stat-value">${unlockedCount} / ${totalCount}</div>
                <div class="rd-stat-sub">${masteryPercent}% dominado</div>
            </div>
        </div>
        <div class="rd-stat-card">
            <div class="rd-stat-icon purple">${activeRes ? '[[DE_ICON_075]]' : '[[DE_ICON_149]]'}</div>
            <div class="rd-stat-info">
                <div class="rd-stat-label">Estado del Laboratorio</div>
                <div class="rd-stat-value">${activeRes ? 'En Desarrollo' : 'Equipo Listo'}</div>
                <div class="rd-stat-sub">${activeRes ? `"${activeRes.nodeName}" (${activeRes.weeksRemaining} sem)` : 'Listo para nuevo avance'}</div>
            </div>
        </div>
    `;

    // 2. Compute downstream unlocks map
    const downstreamMap = new Map();
    mgr.catalog.forEach(node => {
        const reqs = node.requiredNodes || node.prerequisites || [];
        reqs.forEach(reqId => {
            if (!downstreamMap.has(reqId)) downstreamMap.set(reqId, []);
            downstreamMap.get(reqId).push(node);
        });
    });

    // 3. Available nodes to research RIGHT NOW
    const availableNodes = mgr.catalog
        .filter(n => {
            const st = mgr.getNodeState(n.id, historicalYear);
            return st.canResearch;
        })
        .sort((a, b) => {
            const downA = (downstreamMap.get(a.id) || []).length;
            const downB = (downstreamMap.get(b.id) || []).length;
            if (downB !== downA) return downB - downA;
            return (a.costRP || 30) - (b.costRP || 30);
        });

    // 4. Hero Next Advance
    let heroNode = availableNodes[0];
    if (!heroNode) {
        heroNode = mgr.catalog
            .filter(n => !mgr.isUnlocked(n.id))
            .sort((a, b) => (a.minYear || 1982) - (b.minYear || 1982))[0];
    }

    if (heroNode) {
        const heroState = mgr.getNodeState(heroNode.id, historicalYear);
        const heroDownstream = downstreamMap.get(heroNode.id) || [];
        const heroUnlocksHtml = heroDownstream.length > 0
            ? heroDownstream.slice(0, 3).map(n => `<span class="rd-unlock-chip">Habilita: ${n.name}</span>`).join('')
            : '<span class="rd-unlock-chip">Módulo de producción de alta calidad</span>';

        const branchNames = {
            render: 'Render & Gráficos', physics: 'Físicas & Dinámica', netcode: 'Netcode & Red', net: 'Netcode & Red',
            ai: 'Inteligencia Artificial', audio: 'Audio & Sonido', content: 'Contenido & Narrativa',
            systems: 'Sistemas & Motor'
        };
        const branchLabel = branchNames[heroNode.category] || heroNode.category;
        const canAfford = game.researchPoints >= (heroNode.costRP || 30);
        const isBusy = !!game.activeResearch;

        let actionBtnText = `[[DE_ICON_006]] Investigar avance (${heroNode.costRP || 30} RP)`;
        let actionDisabled = false;

        if (isBusy) {
            actionBtnText = `[[DE_ICON_075]] Laboratorio en curso (${activeRes.weeksRemaining} sem)`;
            actionDisabled = true;
        } else if (!heroState.canResearch) {
            actionBtnText = heroState.isHistoricalLock
                ? `[[DE_ICON_093]] Bloqueada hasta Año ${heroNode.minYear}`
                : `[[DE_ICON_093]] Prerrequisitos pendientes`;
            actionDisabled = true;
        } else if (!canAfford) {
            actionBtnText = `[[DE_ICON_006]] Faltan RP (${game.researchPoints} / ${heroNode.costRP || 30} RP)`;
            actionDisabled = true;
        }

        heroContainer.innerHTML = `
            <div class="rd-hero-card">
                <div class="rd-hero-kicker">
                    [[DE_ICON_006]] Recomendación Estratégica del Laboratorio
                </div>
                <div class="rd-hero-layout">
                    <div class="rd-hero-main">
                        <div class="rd-hero-title-row">
                            <span class="rd-hero-branch-badge">${branchLabel}</span>
                            <h2 class="rd-hero-title">${heroNode.name}</h2>
                        </div>
                        <p class="rd-hero-desc">
                            ${heroNode.desc || 'Optimiza el rendimiento del motor, amplía el alcance de los proyectos y desbloquea nuevas capacidades de producción.'}
                        </p>
                        <div class="rd-hero-unlocks">
                            <strong style="color: #cbd5e1;">Impacto en I+D:</strong>
                            ${heroUnlocksHtml}
                        </div>
                        <div class="rd-hero-meta-row">
                            <div class="rd-hero-meta-item">Coste: <strong>${heroNode.costRP || 30} RP</strong></div>
                            <div class="rd-hero-meta-item">Riesgo deuda: <strong>Base ${heroNode.baseDebt ?? 2}</strong></div>
                            <div class="rd-hero-meta-item">Aparición histórica: <strong>Año ${heroNode.minYear || 1982}</strong></div>
                        </div>
                    </div>
                    <div class="rd-hero-action">
                        <button type="button" class="rd-btn-hero" id="btn-hero-research" ${actionDisabled ? 'disabled' : ''} onclick="window.startTechResearch('${heroNode.id}')">
                            ${actionBtnText}
                        </button>
                        <small style="color: #94a3b8; font-size: 11px;">
                            ${canAfford && !isBusy && heroState.canResearch ? 'Inicia la investigación inmediata con tu equipo' : 'Requiere finalizar el proyecto actual y tener RP suficientes'}
                        </small>
                    </div>
                </div>
            </div>
        `;
    } else {
        heroContainer.innerHTML = `
            <div class="rd-hero-card">
                <div class="rd-hero-kicker">[[DE_ICON_149]] Catálogo Completo Dominado</div>
                <h2 class="rd-hero-title">¡Liderazgo Tecnológico Absoluto!</h2>
                <p class="rd-hero-desc">Has investigado todas las tecnologías conocidas hasta la fecha. El estudio está a la vanguardia de la industria.</p>
            </div>
        `;
    }

    // 5. Available Technologies Grid
    if (availableNodes.length === 0) {
        availableContainer.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 24px; text-align: center; background: rgba(15, 23, 42, 0.5); border: 1px dashed rgba(255, 255, 255, 0.1); border-radius: 10px;">
                <p style="color: #94a3b8; font-size: 13px; margin: 0 0 10px 0;">
                    No hay otras tecnologías listas para investigar en este momento histórico (${historicalYear}).
                </p>
                <button type="button" class="dock-btn btn-primary-action" onclick="window.switchLabTab('map')" style="font-weight: 700; margin: 0 auto;">
                    [[DE_ICON_020]] Explorar Mapa Tecnológico para ver Prerrequisitos
                </button>
            </div>
        `;
    } else {
        availableContainer.innerHTML = availableNodes.map(node => {
            const down = downstreamMap.get(node.id) || [];
            const unlocksSnippet = down.length > 0
                ? `<div class="rd-card-unlocks">Habilita: <strong>${down.map(d => d.name).slice(0, 2).join(', ')}${down.length > 2 ? ` (+${down.length - 2})` : ''}</strong></div>`
                : '';
            const canAfford = game.researchPoints >= (node.costRP || 30);
            const isBusy = !!game.activeResearch;
            const branchNames = {
                render: 'Render', physics: 'Físicas', netcode: 'Netcode', net: 'Netcode',
                ai: 'IA', audio: 'Audio', content: 'Contenido', systems: 'Sistemas'
            };
            const branch = branchNames[node.category] || node.category;

            return `
                <div class="rd-card branch-${node.category}">
                    <div>
                        <div class="rd-card-top">
                            <span class="rd-card-branch">[[DE_ICON_006]] ${branch}</span>
                            <span class="rd-card-cost">${node.costRP || 30} RP</span>
                        </div>
                        <h4 class="rd-card-title">${node.name}</h4>
                        <p class="rd-card-desc">${node.desc || 'Módulo arquitectónico para videojuegos y motores.'}</p>
                        ${unlocksSnippet}
                    </div>
                    <div class="rd-card-footer">
                        <span class="rd-card-debt">Deuda: <span>+${node.baseDebt ?? 2}</span></span>
                        <button type="button" class="rd-btn-investigate" ${!canAfford || isBusy ? 'disabled' : ''} onclick="window.startTechResearch('${node.id}')">
                            ${isBusy ? 'Ocupado' : !canAfford ? 'Faltan RP' : 'Investigar'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 6. Studio Technology Progression
    const branches = [
        { id: 'render', name: 'Render & Gráficos', icon: '[[DE_ICON_054]]', match: ['render', 'Graphics'] },
        { id: 'physics', name: 'Físicas & Dinámica', icon: '[[DE_ICON_055]]', match: ['physics', 'Physics'] },
        { id: 'netcode', name: 'Netcode & Red', icon: '[[DE_ICON_020]]', match: ['net', 'netcode', 'Network'] },
        { id: 'ai', name: 'Inteligencia Artificial', icon: '[[DE_ICON_056]]', match: ['ai', 'AI'] },
        { id: 'audio', name: 'Audio & Sonido', icon: '[[DE_ICON_045]]', match: ['audio', 'Audio'] },
        { id: 'content', name: 'Contenido & Diseño', icon: '[[DE_ICON_057]]', match: ['content'] },
        { id: 'systems', name: 'Sistemas & Motor', icon: '[[DE_ICON_049]]', match: ['systems', 'Engine'] }
    ];

    let leadingBranch = null;
    let maxUnlocked = -1;

    const branchCardsHtml = branches.map(b => {
        const inBranch = mgr.catalog.filter(n => b.match.includes(n.category));
        const total = inBranch.length || 1;
        const unlocked = inBranch.filter(n => mgr.isUnlocked(n.id)).length;
        const pct = Math.round((unlocked / total) * 100);

        if (unlocked > maxUnlocked) {
            maxUnlocked = unlocked;
            leadingBranch = b.name;
        }

        return `
            <div class="rd-branch-bar-card branch-${b.id}">
                <div class="rd-branch-bar-header">
                    <span class="rd-branch-bar-name">${b.icon} ${b.name}</span>
                    <span class="rd-branch-bar-count">${unlocked}/${total} (${pct}%)</span>
                </div>
                <div class="rd-progress-track">
                    <div class="rd-progress-fill" style="width: ${pct}%;"></div>
                </div>
            </div>
        `;
    }).join('');

    progressionContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div>
                <h4 style="font-size: 15px; font-weight: 800; color: #fff; margin: 0;">
                    [[DE_ICON_059]] Progreso del Imperio Tecnológico
                </h4>
                <p style="font-size: 12px; color: #94a3b8; margin: 2px 0 0 0;">
                    Especialización del estudio. Rama destacada: <strong style="color: #38bdf8;">${leadingBranch || 'Equilibrado'}</strong>.
                </p>
            </div>
            <div style="font-size: 11px; padding: 4px 10px; border-radius: 20px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                Próxima Gran Era: ${nextEraInfo}
            </div>
        </div>

        <div class="rd-branches-progress-grid">
            ${branchCardsHtml}
        </div>

        <div class="rd-map-cta-banner">
            <div class="rd-map-cta-text">
                ¿Quieres explorar todo el mapa de dependencias y planificar tu estrategia a largo plazo?
            </div>
            <button type="button" class="rd-btn-map-cta" onclick="window.switchLabTab('map')">
                [[DE_ICON_020]] Explorar Mapa Tecnológico Completo →
            </button>
        </div>
    `;
}

function renderTechTree() {
    setupResearchSections();
    setupTechBranchFilterTabs();

    const mgr = techTreeManager || (game && game.techTreeManager);
    if (!game || !mgr) return;

    const historicalYear = game.getHistoricalYear ? game.getHistoricalYear() : (1981 + game.year);

    // 1. Render Summary View (Always kept fresh)
    renderResearchSummary(mgr, historicalYear);

    // 2. Render Secondary DAG Map
    renderResearchMap(mgr, historicalYear);

    // 3. Render In-house Engine Management
    const enginePanel = document.getElementById('engine-management-container');
    if (enginePanel) {
        const rd = game.activeEngineRD;
        const engineCards = (game.inHouseEngines || []).map(engine => {
            const efficiency = engine.getEfficiency ? Math.round(engine.getEfficiency(game.year, game.week) * 100) : 100;
            return `<div class="active-research-card" style="margin-bottom:8px"><strong>${engine.name}</strong><span style="margin-left:10px;color:${efficiency < 80 ? 'var(--accent-gold)' : 'var(--accent-green)'}">Modernidad ${efficiency}%</span><div style="font-size:11px;color:var(--text-secondary);margin:4px 0">Especialidad: ${(engine.affineGenres || []).join(', ') || 'general' } · Licencias activas: ${(engine.licensees || []).length}</div><button type="button" class="dock-btn" onclick="upgradeStudioEngine('${engine.id}')">Actualizar e integrar los módulos seleccionados ($20.000 + $4.000/módulo, 25 RP)</button> <button type="button" class="dock-btn" onclick="licenseStudioEngine('${engine.id}')">Licenciar a estudio</button></div>`;
        }).join('');
        enginePanel.innerHTML = `${rd ? `<div class="active-research-card" style="margin-bottom:10px"><strong>[[DE_ICON_015]] I+D de motor: ${rd.name}</strong><div style="font-size:12px;color:var(--accent-cyan)">Quedan ${rd.weeksRemaining} semanas · ${rd.progress}%</div><div class="research-progress-bar"><div class="research-progress-fill" style="width:${rd.progress}%"></div></div></div>` : ''}${engineCards ? `<h3 style="font-size:14px;color:var(--accent-gold);margin:10px 0">Motores de la empresa</h3>${engineCards}` : ''}`;
    }

    // 4. Asistente Visual de Construcción de Motores
    renderEngineWorkshop(mgr, historicalYear);

    // 5. Banco de Análisis de Hardware Rival (Ingeniería Inversa)
    renderHardwareWorkbench(mgr, historicalYear);
}

/* =========================================================================
   ASISTENTE VISUAL DE CONSTRUCCIÓN DE MOTORES (ENGINE WORKSHOP)
   ========================================================================= */

const engineWorkshopState = {
    currentStage: 1, // 1: Identidad, 2: Especializaciones, 3: Arquitectura Blueprint, 4: Revisión
    name: 'Titan Forge',
    version: 'v1.0',
    selectedGenres: new Set(['Action', 'RPG']),
    selectedModules: new Set(),
    paletteBranchFilter: 'all',
    initialized: false
};

const ENGINE_RANDOM_NAMES = [
    'Titan Forge', 'Apex Velocity', 'Vanguard Core', 'CyberPulse',
    'Nova Engine', 'Aether Tech', 'Matrix Core', 'Quantum Strike',
    'RetroGrid Pro', 'OmniVision', 'HyperDrive 3D', 'Zenith Engine',
    'Chrono Shift', 'Hydra System', 'Solaris FX', 'Pulse Dynamic'
];

const ENGINE_GENRE_DEFINITIONS = [
    { id: 'Action', label: 'Acción & Arcade', icon: '[[DE_ICON_070]]', desc: 'Optimizado para alta tasa de FPS, latencia nula de mandos y cálculo rápido de colisiones.' },
    { id: 'RPG', label: 'Rol & Aventura Gráfica', icon: '[[DE_ICON_071]]', desc: 'Gestión masiva de árboles de estadísticas, inventarios dinámicos y persistencia de mundos.' },
    { id: 'Strategy', label: 'Estrategia & Táctica', icon: '[[DE_ICON_072]]', desc: 'Simulación multihilo de agentes concurrentes, cálculo de rutas e IA táctica.' },
    { id: 'Simulation', label: 'Simulación Continua', icon: '[[DE_ICON_073]]', desc: 'Modelado vehicular y físico de precisión, telemetría y ecuaciones de variables complejas.' },
    { id: 'Adventure', label: 'Aventura Narrativa', icon: '[[DE_ICON_074]]', desc: 'Manejo cinemático de cámaras, sincronización de diálogos y máquinas de estado para puzzles.' },
    { id: 'Casual', label: 'Casual & Accesible', icon: '[[DE_ICON_075]]', desc: 'Carga instantánea, bajo consumo de memoria y ejecución perfecta en hardware modesto.' }
];

const BAY_DEFINITIONS = [
    { id: 'render', label: 'Render & Gráficos', match: ['render', 'Graphics'], icon: '[[DE_ICON_020]]' },
    { id: 'physics', label: 'Físicas & Colisiones', match: ['physics', 'Physics'], icon: '[[DE_ICON_021]]' },
    { id: 'netcode', label: 'Red & Multijugador', match: ['net', 'netcode', 'Network'], icon: '[[DE_ICON_023]]' },
    { id: 'ai', label: 'Inteligencia Artificial', match: ['ai', 'AI'], icon: '[[DE_ICON_024]]' },
    { id: 'audio', label: 'Audio & Acústica', match: ['audio', 'Audio'], icon: '[[DE_ICON_025]]' },
    { id: 'systems', label: 'Contenido & Sistemas', match: ['content', 'systems', 'Engine'], icon: '[[DE_ICON_026]]' }
];

window.setEngineWorkshopStage = function(stage) {
    if (stage < 1 || stage > 4) return;
    const nameInput = document.getElementById('workshop-engine-name');
    if (nameInput && nameInput.value.trim()) {
        engineWorkshopState.name = nameInput.value.trim();
    }
    engineWorkshopState.currentStage = stage;
    const mgr = techTreeManager || (game && game.techTreeManager);
    const historicalYear = game.getHistoricalYear ? game.getHistoricalYear() : (1981 + game.year);
    renderEngineWorkshop(mgr, historicalYear);
};

window.randomizeEngineName = function() {
    const randomName = ENGINE_RANDOM_NAMES[Math.floor(Math.random() * ENGINE_RANDOM_NAMES.length)];
    engineWorkshopState.name = randomName;
    const input = document.getElementById('workshop-engine-name');
    if (input) input.value = randomName;
    const mgr = techTreeManager || (game && game.techTreeManager);
    const historicalYear = game.getHistoricalYear ? game.getHistoricalYear() : (1981 + game.year);
    renderEngineWorkshop(mgr, historicalYear);
};

window.setEngineVersion = function(version) {
    engineWorkshopState.version = version;
    const mgr = techTreeManager || (game && game.techTreeManager);
    const historicalYear = game.getHistoricalYear ? game.getHistoricalYear() : (1981 + game.year);
    renderEngineWorkshop(mgr, historicalYear);
};

window.toggleEngineGenre = function(genreId) {
    if (engineWorkshopState.selectedGenres.has(genreId)) {
        if (engineWorkshopState.selectedGenres.size <= 1) {
            showToast('El motor debe tener al menos una especialización de género.', 'warn');
            return;
        }
        engineWorkshopState.selectedGenres.delete(genreId);
    } else {
        engineWorkshopState.selectedGenres.add(genreId);
    }
    const mgr = techTreeManager || (game && game.techTreeManager);
    const historicalYear = game.getHistoricalYear ? game.getHistoricalYear() : (1981 + game.year);
    renderEngineWorkshop(mgr, historicalYear);
};

window.filterEnginePalette = function(filter) {
    engineWorkshopState.paletteBranchFilter = filter;
    const mgr = techTreeManager || (game && game.techTreeManager);
    const historicalYear = game.getHistoricalYear ? game.getHistoricalYear() : (1981 + game.year);
    renderEngineWorkshop(mgr, historicalYear);
};

window.toggleEngineModule = function(moduleId) {
    if (engineWorkshopState.selectedModules.has(moduleId)) {
        engineWorkshopState.selectedModules.delete(moduleId);
    } else {
        engineWorkshopState.selectedModules.add(moduleId);
    }
    const mgr = techTreeManager || (game && game.techTreeManager);
    const historicalYear = game.getHistoricalYear ? game.getHistoricalYear() : (1981 + game.year);
    renderEngineWorkshop(mgr, historicalYear);
};

window.removeEngineModule = function(moduleId) {
    engineWorkshopState.selectedModules.delete(moduleId);
    const mgr = techTreeManager || (game && game.techTreeManager);
    const historicalYear = game.getHistoricalYear ? game.getHistoricalYear() : (1981 + game.year);
    renderEngineWorkshop(mgr, historicalYear);
};

window.submitEngineWorkshop = function() {
    if (!game) return;
    const input = document.getElementById('workshop-engine-name');
    if (input && input.value.trim()) {
        engineWorkshopState.name = input.value.trim();
    }
    const fullName = `${engineWorkshopState.name.trim()} ${engineWorkshopState.version}`.trim();
    const modules = Array.from(engineWorkshopState.selectedModules);
    if (modules.length === 0) {
        showToast('Debes seleccionar al menos un módulo tecnológico para el motor.', 'warn');
        return;
    }
    const affineGenres = Array.from(engineWorkshopState.selectedGenres);
    const historicalTechIds = modules.filter(id => id.startsWith('tech_'));
    const bakedNodes = modules.filter(id => !id.startsWith('tech_'));

    const res = game.startInHouseEngineRD({
        name: fullName,
        bakedNodes,
        historicalTechIds,
        affineGenres
    });

    if (res.success) {
        if (typeof updateEngineOptions === 'function') updateEngineOptions();
        if (typeof renderTechTree === 'function') renderTechTree();
        if (typeof renderPipelineSelector === 'function') renderPipelineSelector();
        showToast(res.message || `[[DE_ICON_049]] ¡Proyecto de motor "${fullName}" iniciado con éxito!`, 'success');
        if (soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
    } else {
        showToast(res.message, 'warn');
        if (soundEngine && soundEngine.playDebtAlert) soundEngine.playDebtAlert();
    }
};

function renderEngineWorkshop(mgr, year) {
    const container = document.getElementById('engine-workshop-container');
    if (!container || !mgr || !game) return;

    // Initialize default unlocked modules if empty
    if (!engineWorkshopState.initialized) {
        const unlocked = mgr.catalog.filter(n => mgr.isUnlocked(n.id));
        unlocked.slice(0, 4).forEach(n => engineWorkshopState.selectedModules.add(n.id));
        engineWorkshopState.initialized = true;
    }

    const seniorProgrammers = (game.employees || []).filter(e => (e.tech || 0) >= 30 && (!e.role || /program|desarroll|ingenier|líder/i.test(e.role)));
    const leadSenior = seniorProgrammers.length > 0 ? seniorProgrammers[0] : null;

    const moduleCount = engineWorkshopState.selectedModules.size;
    const costMoney = 18000 + (moduleCount * 2000);
    const costRP = 10 + (moduleCount * 3);
    const historicalTechIds = Array.from(engineWorkshopState.selectedModules).filter(id => id.startsWith('tech_'));
    const incompatibility = typeof calculateTechIncompatibility === 'function' ? calculateTechIncompatibility(historicalTechIds) : { multiplier: 1, debt: 0 };
    const engineWeeks = Math.ceil(8 * (incompatibility.multiplier || 1));
    const canAfford = game.funds >= costMoney && game.researchPoints >= costRP && !!leadSenior && moduleCount > 0;

    const stage = engineWorkshopState.currentStage;
    const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    // Stepper HTML
    const stepperSteps = [
        { num: 1, title: 'Identidad', sub: 'Nombre y versión' },
        { num: 2, title: 'Especialización', sub: 'Géneros optimizados' },
        { num: 3, title: 'Arquitectura', sub: 'Plano tecnológico' },
        { num: 4, title: 'Revisión & I+D', sub: 'Presupuesto final' }
    ];

    const stepperHtml = `
        <div class="engine-stepper">
            ${stepperSteps.map(s => `
                <button type="button" class="engine-step-btn ${stage === s.num ? 'active' : ''}" onclick="window.setEngineWorkshopStage(${s.num})">
                    <span class="step-num">0${s.num}</span>
                    <div class="step-info">
                        <strong>${s.title}</strong>
                        <small>${s.sub}</small>
                    </div>
                </button>
            `).join('')}
        </div>
    `;

    // Stage 1: Identity
    const versionPills = ['v1.0', 'v1.5', 'v2.0 Pro', 'v3.0 Ultra'];
    const stage1Html = `
        <div class="engine-stage-panel ${stage === 1 ? 'active' : ''}">
            <div class="engine-identity-grid">
                <div class="engine-badge-preview">
                    <div class="engine-badge-icon">[[DE_ICON_015]]</div>
                    <div style="font-weight: 800; font-size: 15px; color: #fff; text-align: center;">${safe(engineWorkshopState.name)}</div>
                    <span class="engine-badge-tag">${safe(engineWorkshopState.version)}</span>
                </div>
                <div>
                    <div class="form-group" style="margin-bottom: 14px;">
                        <label class="form-label" style="font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px; display: block;">
                            Nombre del Motor Tecnológico
                        </label>
                        <div class="engine-name-input-wrap">
                            <input type="text" id="workshop-engine-name" class="form-input" value="${safe(engineWorkshopState.name)}" placeholder="Ej: Titan Forge" style="flex: 1;" onchange="engineWorkshopState.name = this.value">
                            <button type="button" class="dock-btn" onclick="window.randomizeEngineName()" style="gap: 6px; font-weight: 700;">
                                [[DE_ICON_028]] Generar Nombre
                            </button>
                        </div>
                    </div>

                    <label class="form-label" style="font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px; display: block;">
                        Generación de Versión
                    </label>
                    <div class="engine-version-pills">
                        ${versionPills.map(v => `
                            <button type="button" class="engine-version-pill ${engineWorkshopState.version === v ? 'active' : ''}" onclick="window.setEngineVersion('${v}')">
                                ${v}
                            </button>
                        `).join('')}
                    </div>

                    <div style="margin-top: 14px; padding: 12px 14px; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 4px;">
                            Ingeniero Jefe de Arquitectura
                        </div>
                        ${leadSenior ? `
                            <div style="font-size: 13px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 8px;">
                                <span>[[DE_ICON_059]]</span> ${safe(leadSenior.name)} (Habilidad Técnica: ${leadSenior.tech}) · Asignado automáticamente al proyecto.
                            </div>
                        ` : `
                            <div style="font-size: 12px; font-weight: 700; color: #ef4444; display: flex; align-items: center; gap: 8px;">
                                <span>[[DE_ICON_093]]</span> Se requiere al menos un desarrollador con 30+ de Habilidad Técnica para liderar el motor.
                            </div>
                        `}
                    </div>
                </div>
            </div>
            <div class="engine-stage-actions">
                <span style="font-size: 12px; color: #94a3b8;">Coste base inicial: $18.000 y 10 RP.</span>
                <button type="button" class="dock-btn btn-primary-action" onclick="window.setEngineWorkshopStage(2)" style="font-weight: 700; padding: 10px 20px;">
                    Siguiente: Elegir Especialización →
                </button>
            </div>
        </div>
    `;

    // Stage 2: Genres
    const stage2Html = `
        <div class="engine-stage-panel ${stage === 2 ? 'active' : ''}">
            <div style="margin-bottom: 14px;">
                <h4 style="font-size: 15px; font-weight: 800; color: #fff; margin: 0 0 4px 0;">Especializaciones de Género</h4>
                <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                    Selecciona los géneros para los que este motor brindará bonificaciones automáticas de puntuación y rendimiento técnico.
                </p>
            </div>
            <div class="engine-genres-grid">
                ${ENGINE_GENRE_DEFINITIONS.map(g => {
                    const isSelected = engineWorkshopState.selectedGenres.has(g.id);
                    return `
                        <div class="engine-genre-card ${isSelected ? 'selected' : ''}" onclick="window.toggleEngineGenre('${g.id}')">
                            <div class="engine-genre-icon">${g.icon}</div>
                            <div>
                                <h5 class="engine-genre-title">${g.label}</h5>
                                <p class="engine-genre-desc">${g.desc}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="engine-stage-actions">
                <button type="button" class="dock-btn" onclick="window.setEngineWorkshopStage(1)" style="font-weight: 700;">
                    ← Volver a Identidad
                </button>
                <button type="button" class="dock-btn btn-primary-action" onclick="window.setEngineWorkshopStage(3)" style="font-weight: 700; padding: 10px 20px;">
                    Siguiente: Arquitectura Tecnológica →
                </button>
            </div>
        </div>
    `;

    // Stage 3: Architecture Blueprint
    const branchFilter = engineWorkshopState.paletteBranchFilter;
    const filterCategories = {
        all: null,
        render: ['render', 'Graphics'],
        physics: ['physics', 'Physics'],
        netcode: ['net', 'netcode', 'Network'],
        ai: ['ai', 'AI'],
        audio: ['audio', 'Audio'],
        systems: ['content', 'systems', 'Engine']
    };

    const unlockedCatalog = mgr.catalog.filter(n => mgr.isUnlocked(n.id));
    const filteredCatalog = unlockedCatalog.filter(n => {
        if (branchFilter === 'all') return true;
        const valid = filterCategories[branchFilter];
        return valid ? valid.includes(n.category) : true;
    });

    const stage3Html = `
        <div class="engine-stage-panel ${stage === 3 ? 'active' : ''}">
            <div class="engine-blueprint-layout">
                <!-- Left Palette -->
                <div class="engine-palette-panel">
                    <div class="engine-palette-header">
                        <span>Módulos Desbloqueados</span>
                        <span style="color: #38bdf8;">${unlockedCatalog.length} disp.</span>
                    </div>
                    <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 8px; flex-shrink: 0;">
                        ${['all', 'render', 'physics', 'netcode', 'ai', 'audio', 'systems'].map(b => `
                            <button type="button" class="dock-btn" style="padding: 3px 8px; font-size: 10px; ${branchFilter === b ? 'background:#0284c7;color:#fff;border-color:#38bdf8;' : ''}" onclick="window.filterEnginePalette('${b}')">
                                ${b.toUpperCase()}
                            </button>
                        `).join('')}
                    </div>
                    <div class="engine-palette-list">
                        ${filteredCatalog.length === 0 ? `<div style="font-size:11px;color:#94a3b8;text-align:center;padding:12px;">Sin módulos en esta categoría</div>` : ''}
                        ${filteredCatalog.map(node => {
                            const isSlotted = engineWorkshopState.selectedModules.has(node.id);
                            return `
                                <div class="engine-palette-item ${isSlotted ? 'integrated' : ''}" onclick="window.toggleEngineModule('${node.id}')">
                                    <div class="engine-palette-item-name">
                                        <span>${node.icon}</span>
                                        <span>${safe(node.name)}</span>
                                    </div>
                                    <button type="button" class="engine-palette-item-btn">
                                        ${isSlotted ? '[[DE_ICON_149]] En Plano' : '[[DE_ICON_015]] Añadir'}
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Center Blueprint Canvas -->
                <div class="engine-blueprint-canvas">
                    <div class="engine-core-hub">
                        <span>[[DE_ICON_049]]</span>
                        <span>${safe(engineWorkshopState.name)} CORE</span>
                        <span style="font-size: 10px; opacity: 0.8; margin-left: 6px;">(${moduleCount} Módulos)</span>
                    </div>

                    <div class="engine-bays-grid">
                        ${BAY_DEFINITIONS.map(bay => {
                            const bayModules = Array.from(engineWorkshopState.selectedModules)
                                .map(id => mgr.catalogMap.get(id))
                                .filter(Boolean)
                                .filter(node => bay.match.includes(node.category));

                            return `
                                <div class="engine-bay-box">
                                    <div class="engine-bay-title">
                                        <span>${bay.icon}</span> ${bay.label}
                                    </div>
                                    <div class="engine-bay-slots">
                                        ${bayModules.length === 0 ? `
                                            <div class="engine-empty-slot">Sin módulos asignados</div>
                                        ` : bayModules.map(node => `
                                            <div class="engine-slotted-chip">
                                                <span style="display:flex;align-items:center;gap:6px;">
                                                    <span>${node.icon}</span> ${safe(node.name)}
                                                </span>
                                                <button type="button" class="chip-remove" onclick="event.stopPropagation(); window.removeEngineModule('${node.id}')" title="Quitar módulo">&times;</button>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Right Telemetry -->
                <div class="engine-telemetry-panel">
                    <div class="engine-telemetry-header">
                        <span>Telemetría & Costes</span>
                        <span style="color: #fbbf24;">[[DE_ICON_059]]</span>
                    </div>

                    <div class="engine-telemetry-item">
                        <div class="engine-telemetry-label">Módulos Instalados</div>
                        <div class="engine-telemetry-value" style="color: #38bdf8;">${moduleCount} <span style="font-size:12px;color:#94a3b8;">subsistemas</span></div>
                    </div>

                    <div class="engine-telemetry-item">
                        <div class="engine-telemetry-label">Presupuesto de Fabricación</div>
                        <div class="engine-telemetry-value" style="color: ${game.funds >= costMoney ? '#10b981' : '#ef4444'};">
                            $${costMoney.toLocaleString()}
                        </div>
                        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
                            Estudio: $${game.funds.toLocaleString()}
                        </div>
                    </div>

                    <div class="engine-telemetry-item">
                        <div class="engine-telemetry-label">Puntos de I+D Requeridos</div>
                        <div class="engine-telemetry-value" style="color: ${game.researchPoints >= costRP ? '#38bdf8' : '#ef4444'};">
                            ${costRP} RP
                        </div>
                        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
                            Disponibles: ${game.researchPoints} RP
                        </div>
                    </div>

                    <div class="engine-telemetry-item">
                        <div class="engine-telemetry-label">Compilación Estimada</div>
                        <div class="engine-telemetry-value" style="color: #f8fafc;">
                            ${engineWeeks} semanas
                        </div>
                    </div>

                    ${incompatibility.debt > 0 ? `
                        <div class="engine-telemetry-warning">
                            [[DE_ICON_093]] Deuda Técnica Proyectada: +${incompatibility.debt} pts de riesgo.
                        </div>
                    ` : ''}

                    <div style="margin-top: auto; padding-top: 10px;">
                        ${moduleCount === 0 ? `
                            <div style="font-size: 11px; color: #ef4444; font-weight: 700;">Debe añadir al menos 1 módulo al plano.</div>
                        ` : (game.funds < costMoney ? `
                            <div style="font-size: 11px; color: #ef4444; font-weight: 700;">Fondos insuficientes para compilar.</div>
                        ` : (game.researchPoints < costRP ? `
                            <div style="font-size: 11px; color: #ef4444; font-weight: 700;">RP insuficientes para compilar.</div>
                        ` : `
                            <div style="font-size: 11px; color: #10b981; font-weight: 700;">[[DE_ICON_149]] Arquitectura validada y lista.</div>
                        `))}
                    </div>
                </div>
            </div>
            <div class="engine-stage-actions">
                <button type="button" class="dock-btn" onclick="window.setEngineWorkshopStage(2)" style="font-weight: 700;">
                    ← Volver a Especialización
                </button>
                <button type="button" class="dock-btn btn-primary-action" onclick="window.setEngineWorkshopStage(4)" style="font-weight: 700; padding: 10px 20px;">
                    Siguiente: Revisión y Financiación →
                </button>
            </div>
        </div>
    `;

    // Stage 4: Review
    const stage4Html = `
        <div class="engine-stage-panel ${stage === 4 ? 'active' : ''}">
            <div class="engine-review-dossier">
                <div class="engine-review-header">
                    <div>
                        <span style="font-size: 11px; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.08em;">
                            Dossier de Fabricación de Software
                        </span>
                        <h4 style="font-size: 20px; font-weight: 800; color: #fff; margin: 4px 0 2px 0;">
                            ${safe(engineWorkshopState.name)} ${safe(engineWorkshopState.version)}
                        </h4>
                        <div style="font-size: 12px; color: #94a3b8;">
                            Especializaciones: <strong style="color: #38bdf8;">${Array.from(engineWorkshopState.selectedGenres).join(', ')}</strong>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span class="engine-lead-badge">
                            [[DE_ICON_059]] ${leadSenior ? safe(leadSenior.name) : 'Sin líder asignado'}
                        </span>
                    </div>
                </div>

                <div style="font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px;">
                    Módulos Ensamblados en Arquitectura (${moduleCount}):
                </div>
                <div class="engine-review-modules-summary">
                    ${Array.from(engineWorkshopState.selectedModules).map(id => {
                        const node = mgr.catalogMap.get(id);
                        if (!node) return '';
                        return `
                            <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.06); padding: 8px 10px; border-radius: 6px; font-size: 11px; display: flex; align-items: center; gap: 8px;">
                                <span>${node.icon}</span>
                                <span style="color: #e2e8f0; font-weight: 600;">${safe(node.name)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="engine-review-finance-box">
                    <div>
                        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Inversión Monetaria</div>
                        <div style="font-size: 18px; font-weight: 900; color: ${game.funds >= costMoney ? '#10b981' : '#ef4444'};">
                            $${costMoney.toLocaleString()}
                        </div>
                    </div>
                    <div style="width: 1px; height: 35px; background: rgba(255,255,255,0.1);"></div>
                    <div>
                        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Coste de Investigación</div>
                        <div style="font-size: 18px; font-weight: 900; color: ${game.researchPoints >= costRP ? '#38bdf8' : '#ef4444'};">
                            ${costRP} RP
                        </div>
                    </div>
                    <div style="width: 1px; height: 35px; background: rgba(255,255,255,0.1);"></div>
                    <div>
                        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Tiempo de Compilación</div>
                        <div style="font-size: 18px; font-weight: 900; color: #f8fafc;">
                            ${engineWeeks} semanas
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 12px; align-items: center;">
                <button type="button" class="dock-btn" onclick="window.setEngineWorkshopStage(3)" style="font-weight: 700;">
                    ← Volver a Arquitectura
                </button>
                <button type="button" class="dock-btn btn-primary-action" id="btn-submit-engine-workshop" style="flex: 1; justify-content: center; padding: 14px; font-size: 15px; font-weight: 800;" ${!canAfford ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} onclick="window.submitEngineWorkshop()">
                    [[DE_ICON_015]] INICIAR DESARROLLO DEL MOTOR
                </button>
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="engine-workshop-header">
            <div>
                <span class="engine-workshop-kicker">[[DE_ICON_015]] Taller de Ingeniería In-House</span>
                <h3 class="engine-workshop-title">Asistente de Construcción de Motores</h3>
                <p class="engine-workshop-subtitle">Diseña la arquitectura técnica de tu próximo motor gráfico y de simulación modular.</p>
            </div>
            ${leadSenior ? `
                <div class="engine-lead-badge">
                    [[DE_ICON_059]] Ingeniero Jefe: ${safe(leadSenior.name)} (${leadSenior.tech} Tech)
                </div>
            ` : `
                <div class="engine-lead-badge" style="border-color: #ef4444; color: #ef4444; background: rgba(239, 68, 68, 0.1);">
                    [[DE_ICON_093]] Falta Programador Senior
                </div>
            `}
        </div>
        ${stepperHtml}
        ${stage1Html}
        ${stage2Html}
        ${stage3Html}
        ${stage4Html}
    `;
}

/* =========================================================================
   BANCO DE ANÁLISIS DE HARDWARE RIVAL (INGENIERÍA INVERSA EN 3 ZONAS)
   ========================================================================= */

const hardwareWorkbenchState = {
    selectedHwId: 'rev_rom_cartridge',
    isScanning: false
};

const HARDWARE_ORIGINS = {
    rev_rom_cartridge: {
        manufacturer: 'Atari / Nintendo Standards',
        origin: 'Kioto / California · 1982',
        summary: 'Arquitectura de cartucho con doble ROM en encapsulado DIP. Permite direccionamiento directo sobre el bus de memoria sin latencia de carga.',
        subsystems: ['Bus multiplexado de 8 bits', 'Mapeo directo de memoria PRG/CHR', 'Conector de borde chapado en oro']
    },
    rev_sound_synthesizer: {
        manufacturer: 'Yamaha / Mega Circuits',
        origin: 'Hamamatsu, Japón · 1986',
        summary: 'Procesador de sonido con síntesis FM pura de 6 canales. Proporciona modulación de frecuencia armónica y conversión estéreo digital-analógica.',
        subsystems: ['6 operadores FM independientes', 'Generador de onda sinusoidal y LFO', 'Convertidor DAC estéreo de 16 bits']
    },
    rev_arcade_coprocessor: {
        manufacturer: 'Namco / Commodore Micro-Arcade',
        origin: 'Tokio / West Chester · 1990',
        summary: 'Coprocesador dedicado a transferencias masivas de bits (Bit-Blt) por hardware con acceso directo a memoria (DMA), liberando a la CPU.',
        subsystems: ['Canal DMA paralelo de 16 bits a 16MHz', 'Acelerador de scroll multicapa', 'Búfer de composición de sprites por hardware']
    },
    rev_cdrom_controller: {
        manufacturer: 'Sony & Philips Optical Alliance',
        origin: 'Eindhoven / Tokio · 1994',
        summary: 'Unidad de lectura óptica de disco con servomecanismo de alta precisión, corrección de errores en tiempo real y memoria búfer FIFO para streaming continuo.',
        subsystems: ['Lente óptica láser semiconductora', 'Controladora DSP de flujo a 300 KB/s', 'Búfer FIFO antidesbordamiento de 128KB']
    },
    rev_gpu_architecture: {
        manufacturer: '3dfx Glide Graphics',
        origin: 'San José, California · 1999',
        summary: 'Arquitectura de rasterizado 3D por aceleración de silicio. Integra motor de Transform & Lighting, memoria Z-Buffer de 16 bits y filtrado bilineal de texturas.',
        subsystems: ['Die de silicio GPU con tuberías paralelas', '4 módulos SGRAM a 100MHz en estrella', 'Bus AGP de 4X con ancho de banda ultra-rápido']
    },
    rev_cloud_blade_server: {
        manufacturer: 'Apex Cloud Clúster Systems',
        origin: 'Seattle / Estocolmo · 2012',
        summary: 'Servidor blade para arquitectura de juego en la nube distribuida. Procesamiento masivo paralelo multihilo con enlaces Ethernet de 10 Gigabits.',
        subsystems: ['Sockets duales Intel Xeon de 8 núcleos', '64GB de memoria DDR3 ECC registrada', 'Controladoras de red dual SFP+ 10GbE']
    }
};

function getHardwareCircuitSvg(hwId) {
    switch (hwId) {
        case 'rev_rom_cartridge':
            return `
                <svg viewBox="0 0 380 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="20" width="340" height="180" rx="8" fill="#032b1b" stroke="#059669" stroke-width="2"/>
                    <rect x="50" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="70" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="90" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="110" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="130" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="150" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="170" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="190" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="210" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="230" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="250" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="270" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="290" y="188" width="12" height="12" fill="#f59e0b" rx="2"/><rect x="310" y="188" width="12" height="12" fill="#f59e0b" rx="2"/>
                    <path d="M 56 188 L 56 130 L 90 130 L 90 90" stroke="#10b981" stroke-width="2" fill="none" opacity="0.6"/>
                    <path d="M 116 188 L 116 140 L 150 140 L 150 90" stroke="#10b981" stroke-width="2" fill="none" opacity="0.6"/>
                    <path d="M 236 188 L 236 140 L 260 140 L 260 90" stroke="#10b981" stroke-width="2" fill="none" opacity="0.6"/>
                    <path d="M 296 188 L 296 130 L 310 130 L 310 90" stroke="#10b981" stroke-width="2" fill="none" opacity="0.6"/>
                    <rect x="45" y="45" width="130" height="75" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
                    <text x="110" y="75" fill="#f8fafc" font-size="11" font-weight="bold" font-family="monospace" text-anchor="middle">ROM-PRG 32KB</text>
                    <text x="110" y="92" fill="#38bdf8" font-size="9" font-family="monospace" text-anchor="middle">DIP-28 // 8-BIT BUS</text>
                    <circle cx="55" cy="55" r="3" fill="#38bdf8"/>
                    <rect x="205" y="45" width="130" height="75" rx="4" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5"/>
                    <text x="270" y="75" fill="#f8fafc" font-size="11" font-weight="bold" font-family="monospace" text-anchor="middle">ROM-CHR 16KB</text>
                    <text x="270" y="92" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle">TILE PATTERN VRAM</text>
                    <circle cx="215" cy="55" r="3" fill="#f59e0b"/>
                    <text x="190" y="165" fill="#94a3b8" font-size="10" font-family="monospace" text-anchor="middle">NES/ATARI ROM ARCHITECTURE - 1982</text>
                </svg>
            `;
        case 'rev_sound_synthesizer':
            return `
                <svg viewBox="0 0 380 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="20" width="340" height="180" rx="8" fill="#1e1b4b" stroke="#6366f1" stroke-width="2"/>
                    <rect x="115" y="45" width="150" height="90" rx="6" fill="#090d16" stroke="#c084fc" stroke-width="2"/>
                    <text x="190" y="80" fill="#ffffff" font-size="12" font-weight="bold" font-family="monospace" text-anchor="middle">YM2612 FM-CORE</text>
                    <text x="190" y="98" fill="#c084fc" font-size="9" font-family="monospace" text-anchor="middle">6-CH 4-OPERATOR FM</text>
                    <text x="190" y="114" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="middle">FM FREQ SYNTHESIS</text>
                    <path d="M 40 85 Q 55 60 70 85 T 100 85" stroke="#38bdf8" stroke-width="2" fill="none"/>
                    <text x="70" y="105" fill="#38bdf8" font-size="8" font-family="monospace" text-anchor="middle">OSC LFO</text>
                    <rect x="140" y="150" width="100" height="38" rx="4" fill="#0f172a" stroke="#ec4899" stroke-width="1.5"/>
                    <text x="190" y="172" fill="#ec4899" font-size="9" font-weight="bold" font-family="monospace" text-anchor="middle">YM3012 STEREO DAC</text>
                    <circle cx="310" cy="70" r="12" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/><text x="310" y="74" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">L</text>
                    <circle cx="310" cy="115" r="12" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/><text x="310" y="119" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">R</text>
                    <path d="M 240 168 L 290 168 L 290 92 L 298 92" stroke="#ec4899" stroke-width="2" fill="none" opacity="0.7"/>
                    <line x1="190" y1="135" x2="190" y2="150" stroke="#c084fc" stroke-width="2"/>
                </svg>
            `;
        case 'rev_arcade_coprocessor':
            return `
                <svg viewBox="0 0 380 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="20" width="340" height="180" rx="8" fill="#082f49" stroke="#0284c7" stroke-width="2"/>
                    <rect x="120" y="40" width="140" height="95" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
                    <text x="190" y="75" fill="#f8fafc" font-size="12" font-weight="bold" font-family="monospace" text-anchor="middle">BLITTER ASIC-2D</text>
                    <text x="190" y="94" fill="#fbbf24" font-size="9" font-family="monospace" text-anchor="middle">HARDWARE BIT-BLT 16MHz</text>
                    <text x="190" y="110" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="middle">DMA CHANNEL CONTROLLER</text>
                    <rect x="35" y="45" width="65" height="40" rx="3" fill="#034e7b" stroke="#38bdf8" stroke-width="1.2"/><text x="67" y="68" fill="#e0f2fe" font-size="8" font-weight="bold" font-family="monospace" text-anchor="middle">VRAM-0</text>
                    <rect x="35" y="95" width="65" height="40" rx="3" fill="#034e7b" stroke="#38bdf8" stroke-width="1.2"/><text x="67" y="118" fill="#e0f2fe" font-size="8" font-weight="bold" font-family="monospace" text-anchor="middle">VRAM-1</text>
                    <rect x="280" y="45" width="65" height="40" rx="3" fill="#034e7b" stroke="#38bdf8" stroke-width="1.2"/><text x="312" y="68" fill="#e0f2fe" font-size="8" font-weight="bold" font-family="monospace" text-anchor="middle">SPRITE-BUF</text>
                    <rect x="280" y="95" width="65" height="40" rx="3" fill="#034e7b" stroke="#38bdf8" stroke-width="1.2"/><text x="312" y="118" fill="#e0f2fe" font-size="8" font-weight="bold" font-family="monospace" text-anchor="middle">TILE-PALETTE</text>
                    <path d="M 100 65 L 120 65" stroke="#38bdf8" stroke-width="2"/><path d="M 100 115 L 120 115" stroke="#38bdf8" stroke-width="2"/><path d="M 260 65 L 280 65" stroke="#38bdf8" stroke-width="2"/><path d="M 260 115 L 280 115" stroke="#38bdf8" stroke-width="2"/>
                    <rect x="70" y="155" width="240" height="30" rx="4" fill="#032b43" stroke="#10b981" stroke-width="1.5"/><text x="190" y="174" fill="#10b981" font-size="10" font-weight="bold" font-family="monospace" text-anchor="middle">16-BIT PARALLEL SYSTEM BUS (DMA)</text>
                </svg>
            `;
        case 'rev_cdrom_controller':
            return `
                <svg viewBox="0 0 380 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="20" width="340" height="180" rx="8" fill="#090f1d" stroke="#3b82f6" stroke-width="2"/>
                    <circle cx="95" cy="110" r="65" fill="#0f172a" stroke="#64748b" stroke-width="2"/><circle cx="95" cy="110" r="40" fill="#1e293b" stroke="#38bdf8" stroke-dasharray="3,3"/><circle cx="95" cy="110" r="14" fill="#334155" stroke="#f1f5f9" stroke-width="2"/>
                    <circle cx="115" cy="100" r="8" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5"/><line x1="115" y1="100" x2="180" y2="80" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,2"/>
                    <rect x="180" y="45" width="160" height="65" rx="5" fill="#020617" stroke="#38bdf8" stroke-width="2"/>
                    <text x="260" y="72" fill="#ffffff" font-size="11" font-weight="bold" font-family="monospace" text-anchor="middle">CXD2500Q DSP CORE</text>
                    <text x="260" y="90" fill="#38bdf8" font-size="8" font-family="monospace" text-anchor="middle">ERROR CORRECTION (CIRC/EDC)</text>
                    <text x="260" y="102" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">300 KB/s 2X OPTICAL STREAM</text>
                    <rect x="180" y="125" width="160" height="55" rx="5" fill="#020617" stroke="#10b981" stroke-width="1.5"/>
                    <text x="260" y="150" fill="#10b981" font-size="10" font-weight="bold" font-family="monospace" text-anchor="middle">128KB FIFO DATA BUFFER</text>
                    <text x="260" y="168" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="middle">SCSI / ATAPI PACKET BUS</text>
                </svg>
            `;
        case 'rev_gpu_architecture':
            return `
                <svg viewBox="0 0 380 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="20" width="340" height="180" rx="8" fill="#18181b" stroke="#71717a" stroke-width="2"/>
                    <rect x="130" y="55" width="120" height="100" rx="6" fill="#09090b" stroke="#38bdf8" stroke-width="2"/>
                    <text x="190" y="90" fill="#ffffff" font-size="11" font-weight="bold" font-family="monospace" text-anchor="middle">VOODOO 3D-ENGINE</text>
                    <text x="190" y="110" fill="#38bdf8" font-size="8" font-family="monospace" text-anchor="middle">GEOMETRY T&L ENGINE</text>
                    <text x="190" y="125" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle">16-BIT HARDWARE Z-BUFFER</text>
                    <text x="190" y="140" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">TEXTURE FILTERING MIPMAP</text>
                    <rect x="45" y="45" width="60" height="35" rx="3" fill="#27272a" stroke="#a1a1aa" stroke-width="1"/><text x="75" y="66" fill="#f4f4f5" font-size="8" font-family="monospace" text-anchor="middle">SGRAM 4MB</text>
                    <rect x="45" y="120" width="60" height="35" rx="3" fill="#27272a" stroke="#a1a1aa" stroke-width="1"/><text x="75" y="141" fill="#f4f4f5" font-size="8" font-family="monospace" text-anchor="middle">SGRAM 4MB</text>
                    <rect x="275" y="45" width="60" height="35" rx="3" fill="#27272a" stroke="#a1a1aa" stroke-width="1"/><text x="305" y="66" fill="#f4f4f5" font-size="8" font-family="monospace" text-anchor="middle">SGRAM 4MB</text>
                    <rect x="275" y="120" width="60" height="35" rx="3" fill="#27272a" stroke="#a1a1aa" stroke-width="1"/><text x="305" y="141" fill="#f4f4f5" font-size="8" font-family="monospace" text-anchor="middle">SGRAM 4MB</text>
                    <rect x="110" y="185" width="160" height="12" fill="#eab308" rx="2"/><text x="190" y="178" fill="#eab308" font-size="8" font-weight="bold" font-family="monospace" text-anchor="middle">AGP 4X HIGH SPEED BUS</text>
                </svg>
            `;
        case 'rev_cloud_blade_server':
        default:
            return `
                <svg viewBox="0 0 380 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="20" width="340" height="180" rx="8" fill="#042f2e" stroke="#0d9488" stroke-width="2"/>
                    <rect x="65" y="45" width="100" height="75" rx="6" fill="#021f1e" stroke="#14b8a6" stroke-width="1.8"/>
                    <text x="115" y="75" fill="#f0fdfa" font-size="10" font-weight="bold" font-family="monospace" text-anchor="middle">XEON-X1 8-CORE</text>
                    <text x="115" y="93" fill="#14b8a6" font-size="8" font-family="monospace" text-anchor="middle">L3 CACHE 20MB</text>
                    <text x="115" y="107" fill="#99f6e4" font-size="7" font-family="monospace" text-anchor="middle">2.8 GHz MULTITHREAD</text>
                    <rect x="215" y="45" width="100" height="75" rx="6" fill="#021f1e" stroke="#14b8a6" stroke-width="1.8"/>
                    <text x="265" y="75" fill="#f0fdfa" font-size="10" font-weight="bold" font-family="monospace" text-anchor="middle">XEON-X2 8-CORE</text>
                    <text x="265" y="93" fill="#14b8a6" font-size="8" font-family="monospace" text-anchor="middle">L3 CACHE 20MB</text>
                    <text x="265" y="107" fill="#99f6e4" font-size="7" font-family="monospace" text-anchor="middle">2.8 GHz MULTITHREAD</text>
                    <line x1="165" y1="82" x2="215" y2="82" stroke="#38bdf8" stroke-width="3" stroke-dasharray="2,2"/>
                    <rect x="40" y="140" width="300" height="45" rx="5" fill="#021817" stroke="#38bdf8" stroke-width="1.5"/>
                    <text x="190" y="160" fill="#38bdf8" font-size="10" font-weight="bold" font-family="monospace" text-anchor="middle">DUAL 10-GIGABIT SFP+ CLOUD FABRIC</text>
                    <text x="190" y="174" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="middle">64GB REGISTERED ECC DDR3 // LOW LATENCY NETWORKING</text>
                </svg>
            `;
    }
}

window.selectWorkbenchHardware = function(hwId) {
    hardwareWorkbenchState.selectedHwId = hwId;
    const mgr = techTreeManager || (game && game.techTreeManager);
    const historicalYear = game.getHistoricalYear ? game.getHistoricalYear() : (1981 + game.year);
    renderHardwareWorkbench(mgr, historicalYear);
};

window.workbenchDismantleHardware = function(hwId) {
    if (!game) return;
    hardwareWorkbenchState.isScanning = true;
    const mgr = techTreeManager || (game && game.techTreeManager);
    const historicalYear = game.getHistoricalYear ? game.getHistoricalYear() : (1981 + game.year);
    renderHardwareWorkbench(mgr, historicalYear);

    setTimeout(() => {
        const res = game.reverseEngineerHardware(hwId);
        hardwareWorkbenchState.isScanning = false;
        if (res.success) {
            renderTechTree();
            renderHUD(game);
            showToast(res.message, 'success');
        } else {
            showToast(res.message, 'warn');
            if (soundEngine && soundEngine.playDebtAlert) soundEngine.playDebtAlert();
            renderHardwareWorkbench(mgr, historicalYear);
        }
    }, 600);
};

function renderHardwareWorkbench(mgr, year) {
    const container = document.getElementById('hardware-workbench-container');
    if (!container || !mgr || !game || typeof REVERSE_ENGINEERING_CATALOG === 'undefined') return;

    let selectedHw = REVERSE_ENGINEERING_CATALOG.find(h => h.id === hardwareWorkbenchState.selectedHwId);
    if (!selectedHw) {
        selectedHw = REVERSE_ENGINEERING_CATALOG[0];
        hardwareWorkbenchState.selectedHwId = selectedHw.id;
    }

    const isDismantled = mgr.dismantledHardware.has(selectedHw.id);
    const isAvailableByYear = year >= selectedHw.minYear;
    const canAfford = game.funds >= selectedHw.costMoney;
    const originInfo = HARDWARE_ORIGINS[selectedHw.id] || { manufacturer: 'Competencia Internacional', origin: 'Mundial', summary: selectedHw.desc, subsystems: [] };
    const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    // Zone A: Inventory
    const inventoryHtml = `
        <div class="workbench-inventory">
            <div class="inventory-header">
                <h4>Dispositivos Rival</h4>
                <span style="font-size: 11px; color: #fbbf24; font-weight: 700;">${REVERSE_ENGINEERING_CATALOG.length} modelos</span>
            </div>
            <div class="inventory-list">
                ${REVERSE_ENGINEERING_CATALOG.map(item => {
                    const itemDismantled = mgr.dismantledHardware.has(item.id);
                    const itemAvailable = year >= item.minYear;
                    const isSelected = item.id === selectedHw.id;

                    let badgeColor = '#fbbf24';
                    let badgeText = `$${item.costMoney.toLocaleString()}`;
                    if (itemDismantled) {
                        badgeColor = '#10b981';
                        badgeText = 'ANALIZADO';
                    } else if (!itemAvailable) {
                        badgeColor = '#ef4444';
                        badgeText = `AÑO ${item.minYear}`;
                    }

                    return `
                        <div class="hw-device-item ${isSelected ? 'selected' : ''} ${itemDismantled ? 'dismantled' : ''}" onclick="window.selectWorkbenchHardware('${item.id}')">
                            <div class="hw-device-item-title">
                                <span>${item.icon}</span>
                                <span>${safe(item.name)}</span>
                            </div>
                            <div class="hw-device-item-meta">
                                <span>${item.era}</span>
                                <span class="hw-device-item-price" style="color: ${badgeColor};">${badgeText}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    // Zone B: Bench
    const benchHtml = `
        <div class="workbench-bench">
            <div class="bench-toolbar">
                <span class="bench-device-tag">[[DE_ICON_067]] ${safe(selectedHw.name)}</span>
                <div class="bench-telemetry">
                    <span>CIRCUIT: OK</span>
                    <span>BUS: 16-BIT</span>
                    <span style="color: ${isDismantled ? '#10b981' : (isAvailableByYear ? '#38bdf8' : '#ef4444')};">
                        STATUS: ${isDismantled ? 'ANALYZED' : (isAvailableByYear ? 'READY' : 'LOCKED')}
                    </span>
                </div>
            </div>

            <div class="bench-canvas-wrap">
                <div class="bench-scanner-beam ${hardwareWorkbenchState.isScanning ? 'active' : ''}"></div>
                <div class="bench-circuit-display">
                    ${getHardwareCircuitSvg(selectedHw.id)}
                </div>

                ${isDismantled ? `
                    <div class="bench-analysis-overlay">
                        <div class="analysis-card">
                            <span class="analysis-status-badge">[[DE_ICON_149]] HARDWARE DESMANTELADO</span>
                            <h3>Análisis Completado</h3>
                            <p>Los ingenieros del estudio han extraído y asimilado la arquitectura técnica de este dispositivo rival.</p>
                            <div class="analysis-reward-pill">
                                +${selectedHw.rpGain} Puntos de I+D Obtenidos
                            </div>
                            <div style="font-size: 11px; color: #94a3b8;">Tecnología integrada permanentemente en el laboratorio.</div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // Zone C: Report
    let actionBtnHtml = '';
    if (isDismantled) {
        actionBtnHtml = `
            <button type="button" class="dock-btn" disabled style="width: 100%; justify-content: center; padding: 12px; font-weight: 700; background: rgba(16, 185, 129, 0.15); border-color: #10b981; color: #10b981; cursor: default;">
                [[DE_ICON_149]] Análisis Ya Completado (+${selectedHw.rpGain} RP)
            </button>
        `;
    } else if (!isAvailableByYear) {
        actionBtnHtml = `
            <button type="button" class="dock-btn" disabled style="width: 100%; justify-content: center; padding: 12px; font-weight: 700; background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #ef4444; cursor: not-allowed;">
                [[DE_ICON_093]] Bloqueado hasta el Año ${selectedHw.minYear}
            </button>
        `;
    } else if (!canAfford) {
        actionBtnHtml = `
            <button type="button" class="dock-btn" disabled style="width: 100%; justify-content: center; padding: 12px; font-weight: 700; opacity: 0.5; cursor: not-allowed;">
                Fondos Insuficientes ($${selectedHw.costMoney.toLocaleString()} requeridos)
            </button>
        `;
    } else {
        actionBtnHtml = `
            <button type="button" class="dock-btn btn-primary-action" style="width: 100%; justify-content: center; padding: 12px; font-size: 13px; font-weight: 800;" onclick="window.workbenchDismantleHardware('${selectedHw.id}')">
                [[DE_ICON_106]] INICIAR ANÁLISIS & DESMONTAJE ($${selectedHw.costMoney.toLocaleString()})
            </button>
        `;
    }

    const reportHtml = `
        <div class="workbench-report">
            <div>
                <span class="report-section-kicker">[[DE_ICON_067]] Informe de Inteligencia Técnica</span>
                <h3 class="report-title">${safe(selectedHw.name)}</h3>
                <div class="report-origin-row">
                    <span class="report-origin-pill">Fabricante: ${safe(originInfo.manufacturer)}</span>
                    <span class="report-origin-pill">${safe(originInfo.origin)}</span>
                </div>
                <p class="report-desc">${safe(originInfo.summary)}</p>

                <div class="report-rewards-box">
                    <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 6px; font-weight: 700;">
                        Subsistemas Detectados:
                    </div>
                    <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #cbd5e1; line-height: 1.5;">
                        ${originInfo.subsystems.map(sub => `<li>${safe(sub)}</li>`).join('')}
                    </ul>
                </div>

                <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 8px; padding: 10px 12px; margin-bottom: 16px;">
                    <div style="font-size: 11px; color: #fbbf24; font-weight: 800; text-transform: uppercase;">
                        Inyección de Puntos de I+D:
                    </div>
                    <div style="font-size: 18px; font-weight: 900; color: #ffffff; margin-top: 2px;">
                        +${selectedHw.rpGain} RP <span style="font-size: 12px; font-weight: normal; color: #94a3b8;">inmediatos</span>
                    </div>
                </div>
            </div>

            <div>
                ${actionBtnHtml}
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="workbench-header">
            <div>
                <span class="workbench-kicker">[[DE_ICON_067]] Banco de Análisis Electrónico</span>
                <h3 class="workbench-title">Ingeniería Inversa de Hardware Rival</h3>
                <p class="workbench-subtitle">Adquiere prototipos de la competencia en el mercado negro tecnológico y desmantela su silicio para ganar RP.</p>
            </div>
            <div class="workbench-status-pill">
                [[DE_ICON_106]] ${mgr.dismantledHardware.size} / ${REVERSE_ENGINEERING_CATALOG.length} Hardware Analizado
            </div>
        </div>
        <div class="workbench-layout">
            ${inventoryHtml}
            ${benchHtml}
            ${reportHtml}
        </div>
    `;
}

let researchSelectedId = null;
const researchMapTransform = { x: 0, y: 0, scale: 0.85, initialized: false };

function renderResearchMap(mgr, year, centerSelection = false) {
    const host = document.getElementById('tech-tree-branches-container');
    if (!host) return;
    const priorSearch = host.querySelector('#research-map-search')?.value || '';
    const categoryFilter = {render:['render','Graphics'],physics:['physics','Physics'],netcode:['net','netcode','Network'],ai:['ai','AI'],audio:['audio','Audio'],content:['content'],systems:['systems','Engine']};
    const historical = mgr.catalog.filter(n => activeTechBranchFilter === 'all' || (categoryFilter[activeTechBranchFilter] || []).includes(n.category));
    const selected = historical.find(n => n.id === researchSelectedId) || historical.find(n => mgr.getNodeState(n.id, year).canResearch) || historical[0];
    if (!selected) return;
    const selectionChanged = selected.id !== researchSelectedId;
    researchSelectedId = selected.id;
    const categories = [...new Set(historical.map(n => n.category))];
    const state = mgr.getNodeState(selected.id, year);
    const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const positions = new Map();
    historical.forEach((node, i) => { const lane = categories.indexOf(node.category); const same = historical.slice(0, i).filter(n => n.category === node.category && n.minYear === node.minYear).length; positions.set(node.id, {x: 30 + ((node.minYear || 1982) - 1982) * 165, y: 35 + lane * 150 + same * 60}); });
    const height = categories.length * 150 + 80;
    const width = Math.max(2000, ...[...positions.values()].map(p => p.x + 170));
    const lines = historical.flatMap(node => (node.requiredNodes || node.prerequisites || []).map(id => { const a = positions.get(id), b = positions.get(node.id); return a && b ? `<path class="${mgr.isUnlocked(id) ? 'completed' : ''}" d="M${a.x+145} ${a.y+25} C${a.x+170} ${a.y+25},${b.x-25} ${b.y+25},${b.x} ${b.y+25}"/>` : ''; })).join('');
    const nodes = historical.map(node => { const p = positions.get(node.id), status = mgr.getNodeState(node.id, year); return `<button type="button" class="research-node ${status.state.toLowerCase()} ${node.id === selected.id ? 'selected' : ''}" style="left:${p.x}px;top:${p.y}px" data-research-node="${safe(node.id)}"><strong>${status.isHistoricalLock ? 'Tecnología futura' : safe(node.name)}</strong><small>${node.minYear || 1982} · ${status.isHistoricalLock ? 'Bloqueada por época' : safe(status.label)}</small></button>`; }).join('');
    const pending = new Map();
    const visit = (node, seen = new Set()) => { if (!node || seen.has(node.id)) return; seen.add(node.id); for (const id of node.requiredNodes || node.prerequisites || []) { const dependency = mgr.catalogMap.get(id); visit(dependency, seen); if (dependency && !mgr.isUnlocked(id) && !pending.has(id)) pending.set(id, dependency); } };
    visit(selected);
    const plan = [...pending.values()];
    const planText = plan.length ? plan.map(n => n.minYear > year ? 'Tecnología futura (' + n.minYear + ')' : safe(n.name)).join(' → ') + ' · ' + plan.reduce((sum, n) => sum + (n.costRP || 0), 0) + ' RP pendientes' : 'No hay dependencias pendientes.';
    const requirements = (selected.requiredNodes || selected.prerequisites || []).map(id => mgr.catalogMap.get(id)).filter(Boolean).map(n => `${mgr.isUnlocked(n.id) ? '[[DE_ICON_149]] Investigada' : '[[DE_ICON_093]] Pendiente'}: ${n.minYear > year ? 'Tecnología futura' : safe(n.name)}`).join('<br>') || 'Sin requisitos previos';

    // Downstream unlocks
    const unlocks = mgr.catalog.filter(n => (n.requiredNodes || n.prerequisites || []).includes(selected.id));
    const unlocksHtml = unlocks.length > 0
        ? `<div class="research-detail-section-title">Tecnologías que habilita</div><div class="research-detail-unlocks-list">${unlocks.map(u => `<span class="research-detail-unlock-pill">${safe(u.name)}</span>`).join('')}</div>`
        : '';

    let statusClass = 'locked';
    let statusText = state.label;
    if (mgr.isUnlocked(selected.id)) {
        statusClass = 'unlocked';
        statusText = '[[DE_ICON_149]] Dominada e Integrada';
    } else if (state.canResearch) {
        statusClass = 'available';
        statusText = '[[DE_ICON_006]] Lista para Investigar';
    } else if (state.isHistoricalLock) {
        statusClass = 'locked';
        statusText = `[[DE_ICON_093]] Bloqueada (Año ${selected.minYear})`;
    } else {
        statusClass = 'locked';
        statusText = '[[DE_ICON_093]] Prerrequisitos Pendientes';
    }

    let btnText = 'Investigar tecnología';
    let btnDisabled = !state.canResearch || !!game.activeResearch || game.researchPoints < (selected.costRP ?? 0);
    if (mgr.isUnlocked(selected.id)) {
        btnText = 'Tecnología ya dominada';
        btnDisabled = true;
    } else if (game.activeResearch) {
        btnText = `Investigación en curso (${game.activeResearch.weeksRemaining} sem)`;
        btnDisabled = true;
    } else if (state.canResearch && game.researchPoints < (selected.costRP ?? 0)) {
        btnText = `Faltan RP (${game.researchPoints} / ${selected.costRP} RP)`;
        btnDisabled = true;
    } else if (!state.canResearch) {
        btnText = state.isHistoricalLock ? `Disponible en Año ${selected.minYear}` : 'Prerrequisitos pendientes';
        btnDisabled = true;
    }

    host.innerHTML = `
        <div class="research-map-tools">
            <label style="display:flex;align-items:center;gap:8px;">
                <span>Buscar:</span>
                <input id="research-map-search" placeholder="Nombre de tecnología...">
            </label>
            <div class="research-map-zoom" role="group" aria-label="Controles del mapa">
                <button type="button" id="research-map-zoom-out" aria-label="Alejar mapa">−</button>
                <output id="research-map-zoom-value" aria-live="polite">85%</output>
                <button type="button" id="research-map-zoom-in" aria-label="Acercar mapa">+</button>
                <button type="button" id="research-map-reset">Centrar selección</button>
            </div>
        </div>
        <div class="research-map-layout">
            <div class="research-map-viewport" tabindex="0" aria-label="Mapa tecnológico. Arrastra para desplazarte, usa la rueda para acercar y alejar, o las flechas del teclado para mover el mapa">
                <div class="research-map-canvas" style="width:${width}px;height:${height}px;transform-origin:0 0">
                    <svg width="${width}" height="${height}" aria-hidden="true">${lines}</svg>
                    ${nodes}
                </div>
            </div>
            <aside class="research-detail">
                <div>
                    <span class="research-detail-kicker">${safe(selected.category)} · Año ${selected.minYear || 1982}</span>
                    <h3>${state.isHistoricalLock ? 'Tecnología futura' : safe(selected.name)}</h3>
                    <div class="research-detail-status ${statusClass}">${statusText}</div>
                    ${state.isHistoricalLock ? `<p style="color:#94a3b8;font-size:12px;">${safe(state.reason)}</p>` : `
                        <p style="font-size:12px;color:#cbd5e1;line-height:1.4;">${safe(selected.desc || 'Módulo técnico para videojuegos y motores de juego.')}</p>
                        <div class="research-detail-section-title">Parámetros de I+D</div>
                        <p style="font-size:12px;margin:4px 0;"><b>Coste:</b> ${selected.costRP ?? 0} RP · <b>Disponibles:</b> ${game.researchPoints} RP</p>
                        <p style="font-size:12px;margin:4px 0;"><b>Deuda técnica base:</b> ${selected.baseDebt ?? 2}</p>
                        
                        <div class="research-detail-section-title">Prerrequisitos</div>
                        <div style="font-size:11px;color:#94a3b8;line-height:1.4;">${requirements}</div>

                        ${unlocksHtml}

                        <div class="research-detail-section-title">Ruta estratégica</div>
                        <div style="font-size:11px;color:#64748b;line-height:1.4;">${planText}</div>
                    `}
                </div>
                <div class="research-detail-btn-wrap">
                    <button type="button" class="dock-btn btn-primary-action" id="research-map-start" ${btnDisabled ? 'disabled' : ''}>
                        ${btnText}
                    </button>
                </div>
            </aside>
        </div>
    `;

    const viewport = host.querySelector('.research-map-viewport');
    const canvas = host.querySelector('.research-map-canvas');
    const zoomValue = host.querySelector('#research-map-zoom-value');
    const clampScale = scale => Math.min(1.8, Math.max(0.4, scale));
    const applyTransform = () => {
        canvas.style.transform = `translate(${researchMapTransform.x}px, ${researchMapTransform.y}px) scale(${researchMapTransform.scale})`;
        zoomValue.value = `${Math.round(researchMapTransform.scale * 100)}%`;
        zoomValue.textContent = zoomValue.value;
    };
    const centerNode = (nodeId, resetZoom = false) => {
        const point = positions.get(nodeId);
        if (!point) return;
        if (resetZoom) researchMapTransform.scale = 0.85;
        const scale = clampScale(researchMapTransform.scale);
        researchMapTransform.scale = scale;
        researchMapTransform.x = viewport.clientWidth / 2 - (point.x + 72) * scale;
        researchMapTransform.y = viewport.clientHeight / 2 - (point.y + 26) * scale;
        applyTransform();
    };
    if (!researchMapTransform.initialized) {
        researchMapTransform.initialized = true;
        centerNode(selected.id, true);
    } else if (centerSelection || selectionChanged) {
        centerNode(selected.id);
    } else {
        applyTransform();
    }

    let drag = null;
    viewport.addEventListener('pointerdown', event => {
        if (event.button !== 0 || event.target.closest('[data-research-node]')) return;
        drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: researchMapTransform.x, y: researchMapTransform.y };
        viewport.classList.add('dragging');
        viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener('pointermove', event => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        researchMapTransform.x = drag.x + event.clientX - drag.startX;
        researchMapTransform.y = drag.y + event.clientY - drag.startY;
        applyTransform();
    });
    const endDrag = event => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        drag = null;
        viewport.classList.remove('dragging');
    };
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    const zoomAt = (scale, x = viewport.clientWidth / 2, y = viewport.clientHeight / 2) => {
        const nextScale = clampScale(scale);
        const worldX = (x - researchMapTransform.x) / researchMapTransform.scale;
        const worldY = (y - researchMapTransform.y) / researchMapTransform.scale;
        researchMapTransform.scale = nextScale;
        researchMapTransform.x = x - worldX * nextScale;
        researchMapTransform.y = y - worldY * nextScale;
        applyTransform();
    };
    viewport.addEventListener('wheel', event => {
        event.preventDefault();
        const rect = viewport.getBoundingClientRect();
        zoomAt(researchMapTransform.scale * (event.deltaY < 0 ? 1.12 : 0.89), event.clientX - rect.left, event.clientY - rect.top);
    }, { passive: false });
    viewport.addEventListener('keydown', event => {
        if (event.target !== viewport) return;
        const step = 48;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            researchMapTransform.x += event.key === 'ArrowLeft' ? step : event.key === 'ArrowRight' ? -step : 0;
            researchMapTransform.y += event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0;
            applyTransform();
        } else if (event.key === '+' || event.key === '=') zoomAt(researchMapTransform.scale * 1.12);
        else if (event.key === '-') zoomAt(researchMapTransform.scale * 0.89);
    });

    const search = host.querySelector('#research-map-search');
    search.value = priorSearch;
    host.querySelectorAll('[data-research-node]').forEach(button => {
        button.classList.toggle('dimmed', !!priorSearch && !button.textContent.toLocaleLowerCase('es').includes(priorSearch.toLocaleLowerCase('es')));
        button.addEventListener('click', () => {
            const nodeId = button.dataset.researchNode;
            researchSelectedId = nodeId;
            renderResearchMap(mgr, year, true);
        });
    });
    host.querySelector('#research-map-start')?.addEventListener('click', () => window.startTechResearch(selected.id));
    host.querySelector('#research-map-reset').addEventListener('click', () => centerNode(researchSelectedId));
    host.querySelector('#research-map-zoom-in').addEventListener('click', () => zoomAt(researchMapTransform.scale * 1.2));
    host.querySelector('#research-map-zoom-out').addEventListener('click', () => zoomAt(researchMapTransform.scale / 1.2));
    host.querySelector('#research-map-search').addEventListener('input', event => { const query = event.target.value.toLocaleLowerCase('es'); host.querySelectorAll('[data-research-node]').forEach(button => { button.classList.toggle('dimmed', !!query && !button.textContent.toLocaleLowerCase('es').includes(query)); }); });
    search.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        const match = [...host.querySelectorAll('[data-research-node]')].find(button => !button.classList.contains('dimmed'));
        if (!match) return;
        event.preventDefault();
        const nodeId = match.dataset.researchNode;
        researchSelectedId = nodeId;
        renderResearchMap(mgr, year, true);
    });
}

window.upgradeStudioEngine = function(engineId) {
    const selectedNodes = Array.from(document.querySelectorAll('input[name="engine-feat"]:checked')).map(el => el.value);
    const result = game.upgradeInHouseEngine(engineId, selectedNodes.filter(id => !id.startsWith('tech_')), selectedNodes.filter(id => id.startsWith('tech_')));
    showToast(result.message, result.success ? 'success' : 'warn');
    if (result.success) renderTechTree();
};

let engineToLicense;
let gameToRetire;

function initGameDialogs() {
    for (const dialog of document.querySelectorAll('.game-dialog')) {
        dialog.querySelector('[data-dialog-cancel]').addEventListener('click', () => dialog.close());
    }
    document.getElementById('retire-game-form').addEventListener('submit', event => {
        event.preventDefault();
        const gameId = gameToRetire;
        document.getElementById('retire-game-dialog').close();
        retireConfirmedGame(gameId);
    });
    document.getElementById('license-engine-form').addEventListener('submit', event => {
        event.preventDefault();
        const studioInput = document.getElementById('license-studio-name');
        const feeInput = document.getElementById('license-monthly-fee');
        const error = document.getElementById('license-form-error');
        const studio = studioInput.value.trim();
        const fee = feeInput.valueAsNumber;
        if (!studio || !Number.isFinite(fee) || fee <= 0) {
            error.textContent = !studio ? 'Introduce el nombre del estudio.' : 'La regalía mensual debe ser mayor que cero.';
            (!studio ? studioInput : feeInput).focus();
            return;
        }
        const result = game.licenseInHouseEngineToStudio(engineToLicense, studio, fee);
        if (!result.success) {
            error.textContent = result.message;
            return;
        }
        document.getElementById('license-engine-dialog').close();
        showToast(result.message, 'success');
        renderTechTree();
        if (document.activeElement === document.body) {
            document.querySelector('#modal-research.active .modal-close')?.focus({ preventScroll: true });
        }
    });
}

window.licenseStudioEngine = function(engineId) {
    engineToLicense = engineId;
    document.getElementById('license-engine-form').reset();
    document.getElementById('license-form-error').textContent = '';
    document.getElementById('license-engine-dialog').showModal();
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

const legacyEngineForm = document.getElementById('form-custom-engine');
if (legacyEngineForm) {
    legacyEngineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        window.submitEngineWorkshop();
    });
}

// --- CHARTS & HISTORY MODAL (WITH TOP 10 RIVAL LEADERBOARD) ---

function openSalesPanel() {
    const modal = document.getElementById('modal-history');
    if (modal && modal.classList.contains('active')) {
        closeAllModals();
        return;
    }
    if (window.uwuntuOS && window.uwuntuOS.isOpen) {
        window.uwuntuOS.close();
    }
    renderHistoryAndCharts();
    openModal('modal-history');
}
window.openSalesPanel = openSalesPanel;
window.renderHistoryAndCharts = renderHistoryAndCharts;
window.renderResearchLabUI = () => { renderTechTree(); };
window.renderMarketingHub = renderMarketingHub;
window.renderLiveOps = renderLiveOps;
window.openStudioPanel = () => openCompanyCreatorModal(false, true);
window.renderRecruitment = renderRecruitment;
window.refreshOfficeManager = refreshOfficeManager;
window.renderCommunityWorkshop = renderCommunityWorkshop;
window.renderAdminConsole = () => {
    const adminFunds = document.getElementById('admin-current-funds');
    if (adminFunds && typeof game !== 'undefined') {
        adminFunds.textContent = `$${Math.floor(game.funds).toLocaleString('es-ES')}`;
    }
};
window.renderHUD = renderHUD;
window.autosaveCurrentGame = autosaveCurrentGame;

let currentLeaderboardLimit = 5;

window.setLeaderboardLimit = function(limit) {
    currentLeaderboardLimit = limit;
    const btn5 = document.getElementById('btn-chart-top5');
    const btn10 = document.getElementById('btn-chart-top10');
    const title = document.getElementById('chart-section-title');
    if (btn5) btn5.classList.toggle('active', limit === 5);
    if (btn10) btn10.classList.toggle('active', limit === 10);
    if (title) title.textContent = limit === 5 ? 'Top 5 de la semana' : 'Top 10 de la semana';
    renderTop10Leaderboard();
};

function renderHistoryAndCharts() {
    renderTop10Leaderboard();

    const historyList = document.getElementById('games-history-list');
    const studioStats = document.getElementById('studio-library-stats');
    if (!historyList) return;
    historyList.innerHTML = '';

    if (studioStats) {
        if (game.gamesHistory.length > 0) {
            const totalCopies = game.gamesHistory.reduce((sum, g) => sum + (g.unitsSoldTotal || g.installationsTotal || 0), 0);
            const totalProfit = game.gamesHistory.reduce((sum, g) => sum + (Number.isFinite(g.profit) ? g.profit : 0), 0);
            studioStats.innerHTML = `
                <div class="studio-stat-pill">Títulos: <strong>${game.gamesHistory.length}</strong></div>
                <div class="studio-stat-pill">Ventas: <strong>${totalCopies.toLocaleString()}</strong></div>
                <div class="studio-stat-pill">Balance: <strong style="color: ${totalProfit >= 0 ? '#34d399' : '#f87171'}">${totalProfit >= 0 ? '+' : ''}$${Math.round(totalProfit).toLocaleString()}</strong></div>
            `;
        } else {
            studioStats.innerHTML = '';
        }
    }

    if (game.gamesHistory.length === 0) {
        historyList.innerHTML = `
            <div class="sales-studio-empty-state">
                <div class="empty-state-icon-wrap" aria-hidden="true">
                    <svg viewBox="0 0 64 64" width="38" height="38" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="18" y="10" width="28" height="24" rx="3" stroke="#00f3ff" fill="rgba(0, 243, 255, 0.08)"/>
                        <line x1="24" y1="18" x2="40" y2="18" stroke="#00f3ff"/>
                        <line x1="24" y1="24" x2="36" y2="24" stroke="#00f3ff"/>
                        <rect x="12" y="44" width="40" height="12" rx="2" stroke="#64748b" fill="#1e293b"/>
                        <line x1="8" y1="56" x2="56" y2="56" stroke="#475569"/>
                        <path d="M26 34 L32 44 L38 34" stroke="#94a3b8" stroke-width="1.5"/>
                    </svg>
                </div>
                <h4>Tu vitrina de ventas está esperando tu primer gran éxito</h4>
                <p>Los rivales de la industria lideran el ranking semanal. Diseña y lanza tu primer videojuego en el garaje para irrumpir en el Top 10 y disputar el liderato de ventas.</p>
                <button type="button" class="empty-state-cta-btn" onclick="openModal('modal-new-game');">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Comenzar nuevo proyecto
                </button>
            </div>
        `;
        return;
    }

    game.gamesHistory.forEach(g => {
        const card = document.createElement('div');
        card.className = 'history-card';
        const isProfitable = Number.isFinite(g.profit) && g.profit >= 0;
        const historicalProfitWarning = profitWarning(g);

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
                        ${formatGameProfit(g)}
                    </div>
                    ${historicalProfitWarning ? `<p class="profit-history-warning">${historicalProfitWarning}</p>` : ''}
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

    if (!game.top10Chart?.length && typeof game.cycleRivalMarket === 'function') game.cycleRivalMarket();
    const allEntries = game.top10Chart || [];
    const entries = allEntries.slice(0, currentLeaderboardLimit);

    // Actualizar barra KPI del mercado
    const kpiLeader = document.getElementById('kpi-leader-name');
    const kpiTotal = document.getElementById('kpi-total-sales');
    const kpiPlayer = document.getElementById('kpi-player-rank');

    if (kpiLeader) {
        if (allEntries.length > 0) {
            kpiLeader.textContent = `${allEntries[0].title} (${Number(allEntries[0].weeklySales || 0).toLocaleString()} uds)`;
        } else {
            kpiLeader.textContent = '—';
        }
    }

    if (kpiTotal) {
        const totalTopSales = allEntries.reduce((sum, item) => sum + (Number(item.weeklySales) || 0), 0);
        kpiTotal.textContent = `${totalTopSales.toLocaleString()} uds`;
    }

    if (kpiPlayer) {
        const playerIdx = allEntries.findIndex(item => item.isPlayer);
        kpiPlayer.textContent = playerIdx !== -1 ? `#${playerIdx + 1} (${allEntries[playerIdx].title})` : 'Sin clasificar';
    }

    container.replaceChildren();
    if (!entries.length) {
        const empty = document.createElement('p');
        empty.className = 'sales-chart-empty';
        empty.textContent = 'La clasificación aparecerá cuando termine el primer ciclo comercial.';
        container.appendChild(empty);
        return;
    }

    const list = document.createElement('ol');
    list.className = 'sales-top-five';

    const TREND_CONFIG = {
        up: {
            cls: 'trend-up',
            text: 'SUBE',
            svg: `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`
        },
        down: {
            cls: 'trend-down',
            text: 'BAJA',
            svg: `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`
        },
        new: {
            cls: 'trend-new',
            text: 'NUEVA ENTRADA',
            svg: `<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
        },
        same: {
            cls: 'trend-same',
            text: 'ESTABLE',
            svg: `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`
        }
    };

    entries.forEach((item, index) => {
        const row = document.createElement('li');
        const rankNum = item.rank || index + 1;
        const rankCls = rankNum === 1 ? 'is-leader rank-1' : (rankNum === 2 ? 'rank-2' : (rankNum === 3 ? 'rank-3' : `rank-${rankNum}`));
        row.className = `sales-chart-entry ${rankCls}${item.isPlayer ? ' is-player' : ''}`;

        let rankBadgeHeader = 'POSICIÓN';
        let rankIcon = '';
        if (rankNum === 1) {
            rankBadgeHeader = 'LÍDER';
            rankIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 2px;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`;
        } else if (rankNum === 2) {
            rankIcon = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 2px;"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`;
        } else if (rankNum === 3) {
            rankIcon = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fb923c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 2px;"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`;
        }

        const scoreVal = typeof item.score === 'number' ? item.score.toFixed(1) : (item.score ?? '—');
        const scoreClass = typeof item.score === 'number' ? (item.score >= 8.5 ? 'score-high' : (item.score >= 7.0 ? 'score-mid' : 'score-low')) : 'score-low';
        const scoreHtml = `<span class="sales-score-pill ${scoreClass}"><svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${scoreVal}</span>`;

        const trendCfg = TREND_CONFIG[item.trend] || TREND_CONFIG.same;
        const trendHtml = `<span class="trend-pill ${trendCfg.cls}">${trendCfg.svg} ${trendCfg.text}</span>`;

        const playerTag = item.isPlayer ? `<span class="player-studio-tag"><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg> TU ESTUDIO</span>` : '';
        const leaderBadge = rankNum === 1 ? `<span class="leader-badge-pill">CAMPEÓN SEMANAL</span>` : '';

        row.innerHTML = `
            <div class="sales-rank">
                ${rankIcon}
                <span>${rankBadgeHeader}</span>
                <strong>${String(rankNum).padStart(2, '0')}</strong>
            </div>
            <div class="sales-entry-main">
                <div class="sales-entry-title-row">
                    <span class="sales-entry-name">${item.title}</span>
                    ${leaderBadge}
                    ${playerTag}
                </div>
                <div class="sales-entry-studio">${item.dev}</div>
            </div>
            <div class="sales-entry-stats">
                <div class="sales-stat-col">
                    <span>ESTA SEMANA</span>
                    <strong class="sales-weekly">${Number(item.weeklySales || 0).toLocaleString()} <small style="font-size: 10px; font-weight: normal; color: #94a3b8;">uds</small></strong>
                </div>
                <div class="sales-stat-col">
                    <span>TOTAL</span>
                    <strong class="sales-total">${Number(item.totalSales || 0).toLocaleString()} <small style="font-size: 10px; font-weight: normal; color: #94a3b8;">uds</small></strong>
                </div>
                <div class="sales-stat-col">
                    <span>NOTA</span>
                    <div style="margin-top: 2px;">${scoreHtml}</div>
                </div>
            </div>
            <div class="sales-entry-trend">
                ${trendHtml}
            </div>
        `;
        list.appendChild(row);
    });
    container.appendChild(list);
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
    gameToRetire = gameId;
    document.getElementById('retire-game-name').textContent = g.name;
    document.getElementById('retire-game-dialog').showModal();
};

function retireConfirmedGame(gameId) {
    const res = game.retireGameFromMarket(gameId);
    if (res.success) {
        showToast(res.message, 'info');
        renderHistoryAndCharts();

        // 1. Desmontar y cerrar el modal emergente de la gráfica de ventas si está activo
        const chartModal = document.getElementById('modal-sales-chart');
        if (chartModal?.classList.contains('active')) {
            closeAllModals();
        }

        // 2. Si el juego retirado era el activo en el HUD widget, reasignar al siguiente activo o desmontar
        if (currentLiveSalesWidgetGameId === gameId) {
            const activeRemaining = (game.activeSales || []).filter(item => !item.retired && item.status !== 'RETIRED');
            currentLiveSalesWidgetGameId = activeRemaining.length ? activeRemaining[0].id : null;
        }

        // 3. Actualizar o desmontar widget del HUD en vivo
        if (typeof updateLiveSalesWidget === 'function') updateLiveSalesWidget();
        if (document.activeElement === document.body) {
            (document.querySelector('#modal-history.active .modal-close') || document.getElementById('btn-history'))
                ?.focus({ preventScroll: true });
        }
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
    const profitEl = document.getElementById('hud-sales-profit');
    profitEl.innerText = formatGameProfit(target);
    profitEl.className = Number.isFinite(target.profit) && target.profit >= 0 ? 'val-green' : 'val-red';
    const warning = document.getElementById('hud-sales-profit-warning');
    warning.textContent = profitWarning(target);
    warning.hidden = !warning.textContent;

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

window.dismissExpoInvitation = function() {
    if (resolveExpoInvitation(game)) {
        syncExpoInvitation();
        if (saveSystem.getSettings().autosave !== 'off') autosaveCurrentGame();
    }
    closeAllModals();
};

window.attendExpo = function(tier) {
    if (!hasExpoInvitation(game) || expoSession || ![1, 2, 3].includes(tier)) return;
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
    renderCompanyLogo(document.getElementById('expo-booth-logo'), game.companyLogo);

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

        const variant = Math.floor(Math.random() * avatars.length);
        const avatar = avatars[variant];
        const startX = -30;
        const targetX = 890;
        const duration = 2800 + Math.random() * 1200;
        const pauseTime = 900 + Math.random() * 600;

        const jackets = ['#b5745d', '#6c8e9f', '#be9663', '#7e8d6a', '#927d9f'];
        const skin = ['#deb391', '#aa7453', '#e4bf9d', '#84573f'][variant % 4];
        p.innerHTML = `<svg class="expo-visitor-art" viewBox="0 0 18 26" aria-hidden="true" shape-rendering="crispEdges">
            <path d="M5 18h8v6H5z M4 24h4v2H4z M10 24h4v2h-4z" fill="#202832"/>
            <path d="M4 10h10v3h2v7H2v-7h2z" fill="${jackets[variant % jackets.length]}"/>
            <path d="M5 3h8v7H5z M7 10h4v2H7z" fill="${skin}"/>
            <path d="M5 2h8v2h1v3h-2V5H5z" fill="#302526"/>
            <path d="M8 13h2v7H8z" fill="#16191e" opacity=".35"/>
        </svg>`;
        floor.appendChild(p);

        // Animate pedestrian walking from left to right
        const startTime = Date.now();
        const pauseAt = duration * (.40 + Math.random() * .18); // Middle booth area

        const step = () => {
            const elapsed = Date.now() - startTime;
            if (!p.isConnected || elapsed > duration + pauseTime) {
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

            p.style.transform = `translateX(${curX}px)`;
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
                    summaryText.textContent = 'La feria ha terminado. Aplica los resultados para volver al estudio.';
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
    const standCost = [0, 5000, 22000, 65000][expoSession.tier];
    if (game.funds < standCost + 600) {
        showToast('Fondos insuficientes para el stand y el merchandising ($600).', 'warn');
        return;
    }
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
        expoSession = null;
        if (result.success) {
            resolveExpoInvitation(game);
            syncExpoInvitation();
            if (saveSystem.getSettings().autosave !== 'off') autosaveCurrentGame();
        }
        closeAllModals();
        showToast(result.message, result.success ? 'success' : 'warn');
        if (result.success && soundEngine && soundEngine.playLevelUp) soundEngine.playLevelUp();
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
let logoUploadSequence = 0;
studioPreviewDirty = false;

initCompanyCreatorModal();

function previewStudioAppearance() {
    studioPreviewDirty = true;
    world?.updateCharacterMesh(0, localCustomization, { preview: true });
}

function initCompanyCreatorModal() {
    // Populate Logo Picker
    const logoContainer = document.getElementById('company-logo-picker');
    if (logoContainer) {
        logoContainer.innerHTML = '';
        const names = ['Mando', 'Cohete', 'Arcade', 'Robot', 'Disquete', 'Rayo', 'Monitor', 'Corona', 'Escudo', 'Diamante'];
        COMPANY_LOGOS.forEach((logo, index) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.dataset.logo = logo;
            item.setAttribute('aria-label', names[index]);
            item.className = 'logo-option' + (logo === game.companyLogo ? ' active' : '');
            item.innerText = logo;
            item.addEventListener('click', () => {
                logoUploadSequence++;
                document.querySelector('#form-company-creator button[type="submit"]').disabled = false;
                document.getElementById('company-logo-file').value = '';
                document.getElementById('company-logo-feedback').textContent = '';
                document.querySelectorAll('.logo-option').forEach(l => l.classList.remove('active'));
                item.classList.add('active');
                localLogo = logo;
                renderCompanyLogo(document.getElementById('company-logo-preview'), localLogo);
                if (soundEngine) soundEngine.playClick();
            });
            logoContainer.appendChild(item);
        });
    }

    const logoFile = document.getElementById('company-logo-file');
    logoFile.addEventListener('click', () => { logoFile.value = ''; });
    logoFile.addEventListener('change', async () => {
        const file = logoFile.files?.[0];
        if (!file) return;
        const sequence = ++logoUploadSequence;
        const feedback = document.getElementById('company-logo-feedback');
        const submit = document.querySelector('#form-company-creator button[type="submit"]');
        feedback.dataset.result = '';
        feedback.textContent = 'Preparando imagen…';
        submit.disabled = true;
        try {
            const image = await prepareCompanyLogo(file);
            if (sequence !== logoUploadSequence) return;
            localLogo = image;
            document.querySelectorAll('.logo-option').forEach(option => option.classList.remove('active'));
            syncStudioSelection();
            renderCompanyLogo(document.getElementById('company-logo-preview'), localLogo);
            feedback.textContent = 'Imagen seleccionada para el emblema.';
            feedback.dataset.result = 'success';
        } catch (error) {
            if (sequence === logoUploadSequence) {
                feedback.dataset.result = 'error';
                feedback.textContent = error.message;
            }
        } finally {
            if (sequence === logoUploadSequence) submit.disabled = false;
        }
    });

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
            previewStudioAppearance();
            if (soundEngine) soundEngine.playClick();
        });
    });

    // Hair Style Pills
    document.querySelectorAll('#picker-hair-style .pill-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#picker-hair-style .pill-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localCustomization.hairStyle = btn.dataset.style;
            previewStudioAppearance();
            if (soundEngine) soundEngine.playClick();
        });
    });

    // Hair Color Swatches
    document.querySelectorAll('#picker-hair-color .color-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            document.querySelectorAll('#picker-hair-color .color-swatch').forEach(s => s.classList.remove('active'));
            sw.classList.add('active');
            localCustomization.hairColor = sw.dataset.color;
            previewStudioAppearance();
            if (soundEngine) soundEngine.playClick();
        });
    });

    // Shirt Style Pills
    document.querySelectorAll('#picker-shirt-style .pill-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#picker-shirt-style .pill-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localCustomization.shirtStyle = btn.dataset.shirt;
            previewStudioAppearance();
            if (soundEngine) soundEngine.playClick();
        });
    });

    // Shirt Color Swatches
    document.querySelectorAll('#picker-shirt-color .color-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            document.querySelectorAll('#picker-shirt-color .color-swatch').forEach(s => s.classList.remove('active'));
            sw.classList.add('active');
            localCustomization.shirtColor = sw.dataset.color;
            previewStudioAppearance();
            if (soundEngine) soundEngine.playClick();
        });
    });

    // Accessories Pills
    document.querySelectorAll('#picker-accessory .pill-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#picker-accessory .pill-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localCustomization.accessory = btn.dataset.acc;
            previewStudioAppearance();
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

            if (!startsNewGame && saveSystem.getSettings().autosave !== 'off') autosaveCurrentGame();

            studioPreviewDirty = false;
            if (startsNewGame) {
                creatingNewGame = false;
                void enterGameplay({ checkpoint: true });
                soundEngine.playLevelUp();
                return;
            }
            if (world) world.updateCharacterMesh(0, localCustomization);
            const winEl = formCreator.closest('.uwuntu-window');
            if (winEl && window.uwuntuOS) {
                window.uwuntuOS.closeWindow('app-studio');
            } else if (formCreator.closest('#phone-view-studio')) {
                window.studioPhoneNav?.returnHome();
            } else {
                closeAllModals();
            }
            showToast(`[[DE_ICON_073]] ¡Estudio "${companyName}" y personaje guardados con éxito!`, 'success');
            if (soundEngine) soundEngine.playLevelUp();
        });
    }
}

function syncStudioFormValues(newGame = false) {
    const profile = newGame ? initialProfile : (typeof game !== 'undefined' ? game : initialProfile);
    if (!profile) return;
    localCustomization = { ...profile.characterCustomization };
    localLogo = profile.companyLogo;
    logoUploadSequence++;
    document.getElementById('company-logo-feedback').textContent = '';
    document.getElementById('company-logo-file').value = '';
    renderCompanyLogo(document.getElementById('company-logo-preview'), localLogo);

    const inputComp = document.getElementById('input-company-name');
    if (inputComp) inputComp.value = profile.companyName;

    const inputFounder = document.getElementById('input-founder-name');
    if (inputFounder) inputFounder.value = profile.founder?.name || 'Raúl Vance';

    const traitSelect = document.getElementById('select-founder-trait');
    if (traitSelect) traitSelect.value = profile.founder?.trait || 'balanced';
    const submit = document.querySelector('#form-company-creator button[type="submit"]');
    if (submit) {
        submit.disabled = false;
        submit.textContent = newGame ? 'Empezar partida' : 'Guardar perfil de estudio y personaje';
    }

    // Sync active classes
    document.querySelectorAll('.logo-option').forEach(l => {
        l.classList.toggle('active', l.dataset.logo === localLogo);
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

    selectCompactMenuTab(document.getElementById('studio-tab-identity'));
    syncStudioSelection();
}
window.syncStudioFormValues = syncStudioFormValues;
window.openStudioPanel = () => syncStudioFormValues(false);

function openCompanyCreatorModal(newGame = false) {
    syncStudioFormValues(newGame);
    if (newGame) {
        window.studioPhoneNav?.detachStudioModal();
        openModal('modal-company-creator');
        if (world) world.updateCharacterMesh(0, localCustomization);
        document.getElementById('input-company-name')?.focus();
    } else if (window.uwuntuOS) {
        window.uwuntuOS.openStudio();
    } else {
        openModal('modal-company-creator');
    }
}

window.openCompanyStudioPanel = () => openCompanyCreatorModal(false);

// --- MODAL HELPERS ---

function selectCompactMenuTab(tab) {
    if (!tab) return;
    const modal = tab.closest('.compact-menu');
    for (const button of modal.querySelectorAll('[role="tab"]')) {
        const selected = button === tab;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
    }
    modal.querySelector('.menu-scroll').scrollTop = 0;
    const preview = modal.querySelector('#studio-preview-toggle');
    if (preview) preview.hidden = tab.id !== 'studio-tab-look';
}

function syncStudioSelection() {
    document.querySelectorAll('.studio-menu :is(.logo-option, .pill-option, .color-swatch)').forEach(button => {
        button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    });
}

function toggleOfficePreview(visible) {
    const button = document.getElementById('studio-preview-toggle');
    button.closest('.modal-backdrop').classList.toggle('office-preview', visible);
    button.textContent = visible ? 'Volver a editar' : 'Ver en la oficina';
    button.setAttribute('aria-pressed', String(visible));
}

function initCompactMenuControls() {
    for (const menu of document.querySelectorAll('.compact-menu')) {
        menu.addEventListener('click', event => {
            const tab = event.target.closest('[role="tab"]');
            if (tab) selectCompactMenuTab(tab);
            if (event.target.closest('#studio-preview-toggle')) {
                const backdrop = menu.closest('.modal-backdrop') || menu.closest('.uwuntu-window');
                toggleOfficePreview(!backdrop?.classList.contains('office-preview'));
            }
            if (event.target.closest('.studio-menu :is(.logo-option, .pill-option, .color-swatch)')) syncStudioSelection();
        });
    }
    document.getElementById('form-company-creator').addEventListener('invalid', event => {
        if (event.target.closest('#studio-identity')) selectCompactMenuTab(document.getElementById('studio-tab-identity'));
    }, true);
    document.addEventListener('keydown', event => {
        if (document.querySelector('.game-dialog[open]')) return;
        const pressCover = document.getElementById('modal-marketing-press-cover');
        if (event.key === 'Escape' && pressCover.classList.contains('active')) {
            event.preventDefault();
            event.stopPropagation();
            window.closePressCoverModal(true);
            return;
        }
        const menu = document.querySelector('.modal-backdrop.active .compact-menu');
        if (!menu) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            if (menu.closest('.office-preview')) toggleOfficePreview(false);
            else closeAllModals();
        } else if (event.key === 'Tab') {
            const focusable = [...menu.querySelectorAll('button, input, select, summary, a[href], [tabindex]')].filter(item =>
                item.tabIndex >= 0 && !item.disabled && item.getClientRects().length);
            const first = focusable[0], last = focusable.at(-1);
            if (!menu.contains(document.activeElement) || (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
                event.preventDefault();
                (event.shiftKey ? last : first)?.focus();
            }
        } else if (event.target.matches('[role="tab"]') && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            const tabs = [...menu.querySelectorAll('[role="tab"]')];
            const index = tabs.indexOf(event.target);
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
                (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
            selectCompactMenuTab(tabs[next]);
            tabs[next].focus();
        }
    }, true);
}

function openModal(id) {
    closeAllModals();
    if (id === 'modal-new-game') {
        refreshIPWizard(game);
        updatePlatformOptions();
        renderPipelineSelector();
        renderPublishingContractSelector();
        renderBusinessModelSelector();
        preproductionWizard?.open();
    }
    const modal = document.getElementById(id);
    if (modal) {
        const opener = document.activeElement;
        modal.style.display = 'flex';
        modal.classList.add('active');
        if (modal.querySelector('.compact-menu')) {
            compactMenuTrigger = opener;
            modal.querySelector('.modal-close, [data-workspace-back]')?.focus({ preventScroll: true });
        }
        if (soundEngine) soundEngine.playClick();
    }
}

function closeAllModals() {
    const closedExpo = document.getElementById('modal-expo')?.classList.contains('active');
    if (document.getElementById('modal-expo-scene')?.classList.contains('active') && expoSession) {
        clearInterval(expoPedestrianInterval);
        expoPedestrianInterval = null;
        expoSession = null;
    }
    const cancelNewGame = creatingNewGame && document.getElementById('modal-company-creator').classList.contains('active');
    const closedOffices = document.getElementById('modal-offices')?.classList.contains('active');
    if (studioPreviewDirty) {
        world?.updateCharacterMesh(0, game.characterCustomization, { preview: true });
        studioPreviewDirty = false;
    }
    if (document.getElementById('modal-company-creator').classList.contains('office-preview')) toggleOfficePreview(false);
    document.querySelectorAll('.modal-backdrop').forEach(m => {
        m.style.display = 'none';
        m.classList.remove('active');
    });
    compactMenuTrigger?.focus({ preventScroll: true });
    compactMenuTrigger = null;
    if (closedExpo && hasExpoInvitation(game)) document.getElementById('expo-invitation')?.focus({ preventScroll: true });
    const devMenu = document.getElementById('developer-context-menu');
    if (devMenu) devMenu.style.display = 'none';
    if (closedOffices) (document.getElementById('device-launcher') || document.getElementById('btn-upgrade-office')).focus();
    if (cancelNewGame) {
        creatingNewGame = false;
        world.updateCharacterMesh(0, game.characterCustomization);
        showMenuOffice(game.getActiveOffice().tier, game.employees);
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
            const selected = mktModal.querySelector('#mkt-campaigns:not([hidden]) .mkt-channel[aria-pressed="true"]');
            (selected || mktModal.querySelector('[role="tab"][aria-selected="true"]'))?.focus({ preventScroll: true });
            compactMenuTrigger = document.getElementById('device-launcher') || document.getElementById('btn-marketing');
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
            <div class="press-cover-card cover-80s-retro ${marketingText(cover.styleClass)}">
                <div class="cover-80s-masthead">
                    <div class="cover-80s-issue-line">
                        <span>${marketingText(cover.issue)}</span>
                        <span>${marketingText(cover.tagline)}</span>
                        <span class="cover-price-tag">${marketingText(cover.priceBadge)}</span>
                    </div>
                    <div class="cover-80s-title">${marketingText(cover.publicationName)}</div>
                </div>
                <div class="cover-80s-content">
                    <div class="cover-star-burst">${marketingText(cover.badgeTop)}</div>
                    <div class="cover-feature-box">
                        <div class="cover-pill-badge">${marketingText(cover.featureBadge)}</div>
                        <h1 class="cover-big-headline">${marketingText(cover.headline)}</h1>
                        <p class="cover-lead-summary">${marketingText(cover.subheadline)}</p>
                        <div class="cover-quote-banner">${marketingText(cover.quote)}</div>
                    </div>
                    <div class="cover-80s-tags">
                        ${(cover.tags || []).map(tag => `<span class="cover-tag-item">[[DE_ICON_153]] ${marketingText(tag)}</span>`).join('')}
                    </div>
                    <div class="cover-bottom-bar">
                        <span class="cover-barcode">||| | |||| ||| ||||||| | |||</span>
                        <span>DEP. LEGAL B-${marketingText(cover.year)}92 · EDICIÓN NACIONAL</span>
                    </div>
                </div>
            </div>
        `;
    } else if (cover.period === '90s') {
        coverHtml = `
            <div class="press-cover-card cover-90s-retro ${marketingText(cover.styleClass)}">
                <div class="cover-90s-masthead">
                    <div class="cover-90s-issue-line">
                        <span>${marketingText(cover.issue)}</span>
                        <span>${marketingText(cover.tagline)}</span>
                        <span class="cover-price-tag gold">${marketingText(cover.priceBadge)}</span>
                    </div>
                    <div class="cover-90s-title">${marketingText(cover.publicationName)}</div>
                </div>
                <div class="cover-90s-content">
                    <div class="cover-cd-burst">${marketingText(cover.badgeTop)}</div>
                    <div class="cover-feature-box-90s">
                        <div class="cover-pill-badge neon">${marketingText(cover.featureBadge)}</div>
                        <h1 class="cover-big-headline-90s">${marketingText(cover.headline)}</h1>
                        <p class="cover-lead-summary">${marketingText(cover.subheadline)}</p>
                        <div class="cover-quote-banner-90s">${marketingText(cover.quote)}</div>
                    </div>
                    <div class="cover-90s-tags">
                        ${(cover.tags || []).map(tag => `<span class="cover-tag-item-90s">[[DE_ICON_148]] ${marketingText(tag)}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    } else {
        // Modern Digital 2000s Web Portal Article Layout
        coverHtml = `
            <div class="press-cover-card cover-2000s-portal ${marketingText(cover.styleClass)}">
                <div class="portal-header-browser">
                    <div class="portal-dots"><span></span><span></span><span></span></div>
                    <div class="portal-url">https://www.${marketingText(String(cover.publicationName || 'prensa').toLowerCase())}/previews/${marketingText(cover.year)}/exclusive</div>
                </div>
                <div class="portal-masthead">
                    <div class="portal-brand">${marketingText(cover.publicationName)}</div>
                    <div class="portal-sub-text">${marketingText(cover.tagline)}</div>
                    <div class="portal-live-pill">${marketingText(cover.priceBadge)}</div>
                </div>
                <div class="portal-body">
                    <div class="portal-status-row">
                        <span class="portal-trending-badge">${marketingText(cover.badgeTop)}</span>
                        <span class="portal-date-stamp">${marketingText(cover.issue)}</span>
                    </div>
                    <h1 class="portal-title">${marketingText(cover.headline)}</h1>
                    <div class="portal-author-strip">
                        <span>Por Redacción Internacional · Periodismo del Videojuego</span>
                        <span class="portal-score-badge">${marketingText(cover.featureBadge)}</span>
                    </div>
                    <p class="portal-lead">${marketingText(cover.subheadline)}</p>
                    <div class="portal-quote-box">${marketingText(cover.quote)}</div>
                    <div class="portal-tags-list">
                        ${(cover.tags || []).map(tag => `<span class="portal-tag-pill">#${marketingText(tag)}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = coverHtml;
    openModal('modal-marketing-press-cover');
    modal.querySelector('button')?.focus({ preventScroll: true });
};


window.openModal = openModal;
window.closeAllModals = closeAllModals;
window.renderTechTree = renderTechTree;
