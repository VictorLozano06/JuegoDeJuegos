import { soundEngine } from './audio.js';
import { DAG_CATALOG as SCOPE_NODES_CATALOG, EnginePipelineManager, REVERSE_ENGINEERING_CATALOG, ScopeDAG, TechnicalDebtModel } from './dag_engine.js';
import { game, GENRES, PLATFORMS, TOPICS } from './simulation.js';
import { WorldEngine } from './world.js';

/**
 * DEV EMPIRE 3D - Main Application Controller
 * Seamless bridge connecting Simulation Logic, Three.js 3D World Engine,
 * Procedural Web Audio, and High-Performance Glassmorphism UI.
 */

let world = null;
let devInterval = null;
let calendarInterval = null;
let lastExpoYearTriggered = 0;

const techTreeManager = game.techTreeManager;
const scopeDAG = new ScopeDAG(null, { techTreeManager });
const debtManager = new TechnicalDebtModel();
const pipelineManager = new EnginePipelineManager();

game.onResearchCompleted = (name) => {
    showToast(`🎉 ¡I+D COMPLETADA! Módulo "${name}" investigado y desbloqueado para tus videojuegos.`, 'success');
    renderDAGNodes();
    renderTechTree();
};

// Legacy HTML onclick attributes call these UI actions by name.
window.closeAllModals = closeAllModals;

document.addEventListener('DOMContentLoaded', () => {
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

    // 3. Populate Modal Dropdowns & DAG Architecture
    populateProjectWizard();
    initDAGArchitectureUI();
    initCompanyCreatorModal();

    // 4. Bind Game State Listeners
    game.onStateChange((state) => {
        renderHUD(state);
    });

    // 5. Initial Render
    renderHUD(game);

    // 6. Start Simulation Loops
    startSimulationLoops();

    // Show Welcome Toast & Auto-open Character/Company Creator if new game
    setTimeout(() => {
        showToast("🚀 ¡Bienvenido a DEV EMPIRE 3D! Comienza en tu garaje retro y crea tu primer videojuego.", "info");
    }, 600);

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
    } else if (!game.hasCustomizedProfile) {
        setTimeout(() => {
            openCompanyCreatorModal();
        }, 700);
    }
});

// --- SIMULATION LOOP CONTROLLER ---

function startSimulationLoops() {
    clearInterval(devInterval);
    clearInterval(calendarInterval);

    // Development tick loop (for active projects)
    devInterval = setInterval(() => {
        if (game.gameSpeed > 0 && game.currentProject) {
            game.advanceDevTick(world);
        }
    }, 120);

    // Calendar tick loop (advances weeks and processes economic simulation)
    calendarInterval = setInterval(() => {
        if (game.gameSpeed > 0) {
            game.advanceCalendar();
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
        // Ignore if user is currently typing inside an input or textarea
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            return;
        }

        const key = e.key.toLowerCase();

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
            document.getElementById('audio-toggle').innerText = isMuted ? '🔇' : '🔊';
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
        document.getElementById('audio-toggle').innerText = isMuted ? '🔇' : '🔊';
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
                showToast(`🧹 ${res.message}`, 'success');
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
                showToast('🏢 Proyección 3D apagada. Vista de oficina restaurada.', 'info');
            } else {
                const pipe = pipelineManager.getActivePipeline();
                world.showScopeDAG(scopeDAG, pipe);
                const holoHud = document.getElementById('hologram-overlay-bar');
                if (holoHud) holoHud.style.display = 'flex';
                showToast('🌐 Mesa Holográfica 3D activada.', 'info');
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
        const releasedGame = game.finishAndReleaseGame();
        if (releasedGame) {
            world.triggerLaunchConfetti();
            showReviewModal(releasedGame);
        }
    });

    // Toggle Refactor Mode (Punto 4: [🛠 Refactorizar Código])
    const refactorBtn = document.getElementById('btn-toggle-refactor');
    if (refactorBtn) {
        refactorBtn.addEventListener('click', () => {
            if (!game.currentProject) {
                showToast('No hay ningún proyecto en marcha para refactorizar.', 'warn');
                return;
            }
            const res = game.refactorTechDebt();
            if (res.mode === 'refactor') {
                showToast('🛠️ Modo Refactorizar Activado: El avance de características se detiene (Progreso = 0%) para pagar deuda técnica.', 'success');
            } else {
                showToast('▶️ Modo Normal Reanudado: El equipo continúa implementando características del juego.', 'info');
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
                showToast('🛠️ Refactorización de emergencia activada para sanear el módulo desestabilizado.', 'warn');
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
                menuAvatar.textContent = r.includes('arte') || r.includes('diseño') ? '🎨' : (r.includes('qa') || r.includes('tester') ? '🛡️' : (r.includes('sonido') || r.includes('audio') ? '🎵' : '👨‍💻'));
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
        const menuHeight = 310;
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
            renderPipelineSelector();
            openModal('modal-tech-pipeline');
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
                emp.stamina = emp.maxStamina || 100;
                emp.crunchActive = false;

                if (world && world.characters && world.characters[selectedDevIndex]) {
                    const charObj = world.characters[selectedDevIndex];
                    charObj.state = 'celebrating';
                    if (charObj.bulbGroup) {
                        charObj.bulbGroup.visible = true;
                        charObj.bulbGlow.intensity = 1.8;
                    }
                    setTimeout(() => {
                        charObj.state = 'typing';
                        if (charObj.bulbGroup) {
                            charObj.bulbGroup.visible = false;
                            charObj.bulbGlow.intensity = 0;
                        }
                    }, 2400);
                }

                if (world && world.triggerLaunchConfetti) {
                    world.triggerLaunchConfetti();
                }
                if (soundEngine && soundEngine.playLevelUp) {
                    soundEngine.playLevelUp();
                }

                showToast(`☕ ¡${emp.name} ha descansado y recuperó el 100% de energía!`, 'success');
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
    topicSelect.innerHTML = '';
    TOPICS.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.innerText = `${t.name} [Target: ${t.idealAudience}]`;
        topicSelect.appendChild(opt);
    });

    const genreSelect = document.getElementById('select-genre');
    genreSelect.innerHTML = '';
    GENRES.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.innerText = g.name;
        genreSelect.appendChild(opt);
    });

    updatePlatformOptions();
    updateEngineOptions();
}

function initDAGArchitectureUI() {
    renderPipelineSelector();
    renderDAGNodes();
    updateDAGMetricsUI();

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
            showToast('🌐 Mesa Holográfica 3D encendida. Haz clic en los nodos para configurarlos.', 'info');
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
            showToast('🌐 Mesa Holográfica 3D encendida.', 'info');
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
            showToast('🏢 Proyección apagada. Vista normal de oficina restaurada.', 'info');
            if (soundEngine && soundEngine.playClick) soundEngine.playClick();
        });
    }
}

window.selectPipelineFromModal = function(pipeId) {
    pipelineManager.selectPipeline(pipeId);
    const activePipe = pipelineManager.getActivePipeline();
    debtManager.setBaseDebt(activePipe.baseDebtFloor);
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
    const selectedId = pipelineManager.selectedPipelineId;

    if (container) {
        container.innerHTML = '';
        pipelineManager.availablePipelines.forEach(pipe => {
            const card = document.createElement('div');
            const isCommercial = pipe.type === 'commercial';
            const isSelected = pipe.id === selectedId;
            card.className = 'pipeline-card' + (isSelected ? ' active' : '');
            card.innerHTML = `
                <div>
                    <span class="pipeline-badge ${isCommercial ? 'badge-commercial' : 'badge-inhouse'}">
                        ${isCommercial ? '⚡ Motor Comercial' : '💎 Motor Propio (In-House)'}
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

    // Also synchronize cards in #modal-tech-pipeline
    const commCard = document.getElementById('pipe-card-commercial');
    const inhouseCard = document.getElementById('pipe-card-inhouse');
    const btnComm = document.getElementById('btn-select-commercial');
    const btnInhouse = document.getElementById('btn-select-inhouse');

    if (commCard && inhouseCard) {
        const isComm = selectedId === 'commercial_unreal';
        commCard.classList.toggle('active', isComm);
        inhouseCard.classList.toggle('active', !isComm);

        if (btnComm) {
            btnComm.innerText = isComm ? '✓ Motor Comercial Activo' : 'Seleccionar Motor Comercial';
            btnComm.className = 'dock-btn btn-pipeline-select' + (isComm ? ' btn-primary-action' : '');
        }
        if (btnInhouse) {
            btnInhouse.innerText = !isComm ? '✓ Motor Propio Activo' : 'Seleccionar Motor Propio';
            btnInhouse.className = 'dock-btn btn-pipeline-select' + (!isComm ? ' btn-primary-action' : '');
        }
    }
}

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

function renderDAGNodes() {
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
                statusHtml = isRegression ? '<span class="node-status-badge badge-regression">⚠️ REGRESIÓN</span>' : '<span class="node-status-badge badge-active">✓ ACTIVADO</span>';
            } else if (isAvailable) {
                statusHtml = '<span class="node-status-badge badge-available">+ DISPONIBLE</span>';
            } else {
                statusHtml = '<span class="node-status-badge badge-locked">🔒 BLOQUEADO</span>';
            }

            // Disciplines breakdown chips
            const netVal = node.workload.net !== undefined ? node.workload.net : (node.workload.network || 0);
            const disciplinesHtml = `
                <div class="node-disciplines-row">
                    <span class="node-chip chip-eng" title="Carga Engine">💻 ${node.workload.engine}</span>
                    <span class="node-chip chip-game" title="Carga Gameplay">🎮 ${node.workload.gameplay}</span>
                    <span class="node-chip chip-net" title="Carga Red">🌐 ${netVal}</span>
                    <span class="node-chip chip-art" title="Carga Arte">🎨 ${node.workload.art}</span>
                    <span class="node-chip chip-qa" title="Carga QA">🛡️ ${node.workload.qa}</span>
                    <span class="node-chip chip-friction" title="Fricción Añadida">⚡ +${node.baseFriction}%</span>
                </div>
            `;

            // Requirements row
            let reqsHtml = '';
            if (prereqs.length > 0) {
                const pills = prereqs.map(pId => {
                    const pDef = SCOPE_NODES_CATALOG.find(n => n.id === pId);
                    const pName = pDef ? pDef.name : pId;
                    const met = scopeDAG.selectedNodeIds.has(pId);
                    return `<span class="req-pill ${met ? 'req-ok' : 'req-missing'}">${met ? '✓' : '✗'} ${pName}</span>`;
                }).join(' ');
                reqsHtml = `<div class="node-req-row"><span style="opacity: 0.7;">Req:</span> ${pills}</div>`;
            } else {
                reqsHtml = `<div class="node-req-row"><span class="req-pill req-ok">🌿 Base / Sin requisitos</span></div>`;
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
                    showToast(`🔒 "${node.name}" está bloqueado. Requiere: ${missingNames.join(', ')}`, 'warn');
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
    const pipe = pipelineManager.getActivePipeline();
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
        ? `🔴 Fricción Crítica (+${friction.frictionPercent}%)`
        : (friction.frictionPercent >= 25 ? `🟡 Fricción Moderada (+${friction.frictionPercent}%)` : `🟢 Acoplamiento Óptimo`);

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
        ? '🔴 Deuda Crítica (Riesgo Regresiones)'
        : (currentDebt > 15 ? '🟡 Deuda Moderada (Riesgo Medio)' : '🟢 Código Limpio (Riesgo Nulo)');

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
    showToast(`🌐 Nodo "${nodeObj ? nodeObj.name : nodeId}" modificado en el DAG.`, 'info');
}

function setupStageTabs() {
    // Legacy support fallback
}

function updatePlatformOptions() {
    const platformSelect = document.getElementById('select-platform');
    if (!platformSelect) return;
    platformSelect.innerHTML = '';
    PLATFORMS.filter(p => p.eraUnlocked <= game.era).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.innerText = `${p.icon} ${p.name} ($${p.devCost.toLocaleString()})`;
        platformSelect.appendChild(opt);
    });
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

    const activePipeline = pipelineManager.getActivePipeline();
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
        name, topicId, genreId, platformId, targetAudience, dagConfig
    });

    if (result.success) {
        if (world) {
            world.hideScopeDAG();
        }
        const holoHud = document.getElementById('hologram-overlay-bar');
        if (holoHud) holoHud.style.display = 'none';
        closeAllModals();
        showToast(`🛠️ Comenzando desarrollo con arquitectura DAG de: "${name}"`, 'success');
        document.getElementById('input-game-name').value = '';
    } else {
        showToast(result.message, 'warn');
    }
}

// --- HUD & STATUS BAR RENDERING ---

function renderHUD(state) {
    // Studio Title & Logo
    const titleEl = document.getElementById('studio-title');
    if (titleEl) titleEl.innerHTML = `${state.companyName} <span class="studio-edit-hint">✏️</span>`;
    const logoEl = document.getElementById('studio-logo');
    if (logoEl) logoEl.innerText = state.companyLogo;

    // Top Bar Stats
    document.getElementById('stat-funds').innerText = `$${Math.floor(state.funds).toLocaleString()}`;
    document.getElementById('stat-fans').innerText = state.fans.toLocaleString();
    document.getElementById('stat-rp').innerText = state.researchPoints;
    const histYear = state.getHistoricalYear ? state.getHistoricalYear() : (1981 + state.year);
    document.getElementById('stat-calendar').innerHTML = `📅 <strong>${histYear}</strong> (Año ${state.year}), M<strong>${state.month}</strong> S<strong>${state.week}</strong>`;

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
            healthIcon.innerText = healthStatus === 'clean' ? '🟢' : (healthStatus === 'moderate' ? '🟡' : '🔴');
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

        // Refactor toggle button state (Punto 4: [🛠 Refactorizar Código])
        const refactorBtn = document.getElementById('btn-toggle-refactor');
        if (refactorBtn) {
            if (proj.devMode === 'refactor') {
                refactorBtn.classList.add('active');
                refactorBtn.innerHTML = '🛠️ Refactorizando... (Click para Normal)';
            } else {
                refactorBtn.classList.remove('active');
                refactorBtn.innerHTML = '🛠️ Refactorizar Código';
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
        if (proj.stage === 4) {
            releaseBtn.style.display = 'block';
            if (healthStatus === 'clean') {
                releaseBtn.innerText = `🚀 Lanzar Videojuego (Código Limpio: ${visibleDebt} pts)`;
                releaseBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            } else if (healthStatus === 'moderate') {
                releaseBtn.innerText = `🚀 Lanzar Videojuego (Fricción Media: ${visibleDebt} pts)`;
                releaseBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            } else {
                releaseBtn.innerText = `⚠️ Lanzar con Riesgo (¡Deuda Crítica: ${visibleDebt} pts!)`;
                releaseBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            }
        } else {
            releaseBtn.style.display = 'none';
        }
    } else {
        projBar.style.display = 'none';
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
        upgradeBtn.innerHTML = `🏢 ${check.name} ($${check.cost.toLocaleString()})`;
        upgradeBtn.disabled = !check.canUpgrade;
        upgradeBtn.title = check.canUpgrade ? '¡Listo para expandirte a una sede mayor!' : 'Requiere más fondos y juegos exitosos publicados.';
    } else {
        upgradeBtn.style.display = 'none';
    }
}

function handleOfficeUpgrade() {
    const res = game.upgradeOffice();
    if (res.success) {
        world.buildOffice(res.newEra);
        world.syncEmployees(game.employees);
        updatePlatformOptions();
        showToast(`🎉 ¡ENHORABUENA! Tu empresa se ha mudado a: ${res.name}`, 'success');
        if (soundEngine) soundEngine.playFanfare(9.5);
    } else {
        showToast(res.message, 'warn');
    }
}

// --- REVIEWS MODAL ---

function showReviewModal(gameData) {
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

// --- RECRUITMENT & STAFF MANAGEMENT MODAL ---

function renderRecruitment() {
    const currentList = document.getElementById('current-team-list');
    currentList.innerHTML = '';

    const maxStaff = game.getMaxStaffCapacity();
    document.getElementById('hire-capacity').innerText = `Capacidad del Estudio: ${game.employees.length}/${maxStaff} miembros`;

    // 1. Current Active Team with live Stamina bars
    game.employees.forEach(emp => {
        const staminaPct = Math.round((emp.stamina / emp.maxStamina) * 100);
        const staminaClass = staminaPct > 50 ? '' : (staminaPct > 25 ? 'warn' : 'crit');
        const statusLabel = staminaPct > 50 ? 'Óptimo' : (staminaPct > 25 ? 'Cansado' : 'Fatigado');

        const card = document.createElement('div');
        card.className = 'candidate-card';
        card.innerHTML = `
            <div style="flex-grow: 1;">
                <strong style="font-size: 15px; color: #fff;">${emp.name}</strong> 
                <span style="font-size: 11px; color: var(--accent-cyan);">[${emp.trait}]</span>
                <div style="font-size: 12px; color: var(--text-secondary); margin: 3px 0;">
                    ${emp.role} • 💻 Tech: <strong>${emp.tech}</strong> | 🎨 Design: <strong>${emp.design}</strong> | ⚡ Vel: <strong>${emp.speed}x</strong>
                </div>
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
                <div style="display: flex; gap: 6px;">
                    <button class="staff-action-btn" onclick="sendOnVacation('${emp.id}')" title="Restaura 100% de energía">🏖️ Vacaciones ($2k)</button>
                    <button class="staff-action-btn" onclick="trainEmployee('${emp.id}', 'tech')" title="+8 Tech permanentemente">💻 +8 Tech</button>
                    <button class="staff-action-btn" onclick="trainEmployee('${emp.id}', 'design')" title="+8 Design permanentemente">🎨 +8 Des</button>
                </div>
            </div>
        `;
        currentList.appendChild(card);
    });

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
                    ${c.role} • 💻 Tech: <strong>${c.tech}</strong> | 🎨 Design: <strong>${c.design}</strong> | ⚡ Vel: <strong>${c.speed}x</strong>
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
        showToast(`🎉 ¡${candidate.name} se ha unido al equipo de desarrollo!`, 'success');
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

window.refreshCandidates = function() {
    const res = game.refreshCandidatePool();
    if (res.success) {
        renderRecruitment();
        showToast("🔄 Bolsa de empleo actualizada con nuevos candidatos.", 'info');
    } else {
        showToast(res.message, 'warn');
    }
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
            if (toggleIcon) toggleIcon.innerText = isHidden ? 'Plegar ▲' : 'Desplegar ▼';
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
                                    ⏱️ Quedan ${ar.weeksRemaining} semana${ar.weeksRemaining === 1 ? '' : 's'} para concluir el desarrollo
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
                        💡 No hay ningún proyecto de I+D activo. Selecciona un módulo <strong>INVESTIGABLE</strong> para iniciar el desarrollo con tu equipo.
                    </span>
                    <span class="node-status-badge badge-available">Equipo Listo</span>
                </div>
            `;
        }
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
                actionHtml = `<span style="font-size: 11px; font-weight: 700; color: var(--accent-green);">✓ Desmantelado (+${item.rpGain} RP)</span>`;
            } else if (!isAvailableByYear) {
                actionHtml = `<span style="font-size: 11px; color: var(--accent-red); font-weight: 700;">🔒 Bloqueado (Año ${item.minYear})</span>`;
            } else {
                actionHtml = `
                    <button class="dock-btn btn-primary-action" style="padding: 5px 12px; font-size: 11px;" ${!canAfford ? 'disabled style="opacity:0.5;"' : ''} onclick="dismantleHardware('${item.id}')">
                        🔧 Desmantelar ($${item.costMoney.toLocaleString()})
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
            { id: 'render', name: 'Motor Gráfico & Renderizado', icon: '🖥️' },
            { id: 'physics', name: 'Físicas & Colisiones Cinemáticas', icon: '⚛️' },
            { id: 'netcode', name: 'Netcode & Sincronización de Red', icon: '🌐' },
            { id: 'ai', name: 'Inteligencia Artificial & Lógica', icon: '🧠' },
            { id: 'audio', name: 'Pipeline Acústico & Audio Espacial', icon: '🎧' },
            { id: 'content', name: 'Contenido & Estructura de Mundo', icon: '🗺️' },
            { id: 'systems', name: 'Sistemas Avanzados & Jugabilidad', icon: '⚙️' }
        ];

        branchDefs.forEach(branch => {
            if (activeTechBranchFilter !== 'all' && activeTechBranchFilter !== branch.id) {
                return;
            }

            const branchNodes = SCOPE_NODES_CATALOG.filter(n => {
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
                let badgeLabel = '🔒 Bloqueado';
                if (isUnlocked) {
                    badgeClass = 'badge-unlocked';
                    badgeLabel = '✓ Desbloqueado';
                } else if (isInvestigable) {
                    badgeClass = 'badge-investigable';
                    badgeLabel = '⚡ Investigable';
                }

                // Requirements preview
                const prereqs = node.prerequisites || [];
                let prereqHtml = '';
                if (prereqs.length > 0) {
                    const pills = prereqs.map(pId => {
                        const pDef = SCOPE_NODES_CATALOG.find(x => x.id === pId);
                        const pName = pDef ? pDef.name : pId;
                        const met = mgr.isUnlocked(pId);
                        return `<span class="req-pill ${met ? 'req-ok' : 'req-missing'}">${met ? '✓' : '✗'} ${pName}</span>`;
                    }).join(' ');
                    prereqHtml = `<div class="tech-prereq-row"><span style="opacity: 0.7;">Req:</span> ${pills}</div>`;
                } else {
                    prereqHtml = `<div class="tech-prereq-row"><span class="req-pill req-ok">🌿 Fundación Base</span></div>`;
                }

                // Action button or status description
                let actionArea = '';
                if (isUnlocked) {
                    actionArea = `
                        <div style="text-align: right; font-size: 11px; font-weight: 700; color: var(--accent-green); padding: 8px 0;">
                            ✓ Integrado en el catálogo de producción
                        </div>
                    `;
                } else if (isInvestigable) {
                    const canAffordRP = game.researchPoints >= (node.costRP || 30);
                    const isBusy = game.activeResearch !== null;
                    const disabled = !canAffordRP || isBusy;
                    const btnText = isBusy ? '⏳ Equipo Ocupado en I+D' : (!canAffordRP ? `RP Insuficiente (${node.costRP} RP)` : `🔬 Iniciar Investigación (${node.costRP} RP)`);

                    actionArea = `
                        <button class="btn-start-research" ${disabled ? 'disabled' : ''} onclick="startTechResearch('${node.id}')">
                            ${btnText}
                        </button>
                    `;
                } else {
                    // Locked: show exact reason
                    let reasonText = stateInfo.reason;
                    if (stateInfo.isHistoricalLock) {
                        reasonText = `🔒 Tecnología Desconocida (Aparición: Año ${stateInfo.minYear})`;
                    }
                    actionArea = `
                        <div style="font-size: 11px; color: var(--accent-red); padding: 8px 0; line-height: 1.3;">
                            ${reasonText}
                        </div>
                    `;
                }

                // Name: if historical lock, display "Tecnología Desconocida" according to requirements!
                const displayName = stateInfo.isHistoricalLock ? `🔒 Tecnología Desconocida (Tier ${node.tier})` : `${node.icon} ${node.name}`;
                const displayDesc = stateInfo.isHistoricalLock ? `Esta tecnología aún no ha sido descubierta por la industria de los videojuegos. Estará disponible a partir del año histórico ${stateInfo.minYear}.` : node.desc;

                card.innerHTML = `
                    <div>
                        <div class="tech-node-header">
                            <span class="tech-node-title">${displayName}</span>
                            <span class="tech-status-badge ${badgeClass}">${badgeLabel}</span>
                        </div>
                        <div class="tech-meta-row">
                            <span class="tech-meta-item">📅 ${node.eraName || 'Era 8-bit'}</span>
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
        SCOPE_NODES_CATALOG.filter(node => mgr.isUnlocked(node.id)).forEach(node => {
            const lbl = document.createElement('label');
            lbl.style.display = 'flex';
            lbl.style.alignItems = 'center';
            lbl.style.gap = '8px';
            lbl.style.fontSize = '12px';
            lbl.style.margin = '4px 0';
            lbl.style.color = '#fff';
            lbl.innerHTML = `<input type="checkbox" name="engine-feat" value="${node.id}" checked> ${node.icon} ${node.name} (+${node.bonusTech}T/+${node.bonusDesign}D)`;
            checkContainer.appendChild(lbl);
        });
    }
}

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

    const res = game.createCustomEngine(name, checked);
    if (res.success) {
        updateEngineOptions();
        renderTechTree();
        showToast(`⚙️ ¡Nuevo motor "${name}" compilado con éxito!`, 'success');
        document.getElementById('input-engine-name').value = '';
    } else {
        showToast(res.message, 'warn');
    }
});

// --- CHARTS & HISTORY MODAL (WITH TOP 10 RIVAL LEADERBOARD) ---

function renderHistoryAndCharts() {
    renderTop10Leaderboard();

    const historyList = document.getElementById('games-history-list');
    historyList.innerHTML = '';

    if (game.gamesHistory.length === 0) {
        historyList.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Aún no has publicado ningún videojuego.</p>`;
        return;
    }

    game.gamesHistory.forEach(g => {
        const card = document.createElement('div');
        card.className = 'history-card';
        const isProfitable = g.profit >= 0;
        card.innerHTML = `
            <div>
                <strong style="font-size: 16px; color: #fff;">${g.name}</strong> 
                <span class="score-badge ${g.score >= 8 ? 'high' : (g.score >= 6 ? 'med' : 'low')}" style="font-size: 12px; margin-left: 6px;">★ ${g.score}</span>
                <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                    ${g.topic} • ${g.genre} • Plataforma: ${g.platform} [Aud: ${g.targetAudience}]
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: #fff;">${g.unitsSoldTotal.toLocaleString()} copias</div>
                    <div style="font-size: 13px; font-weight: 700; color: ${isProfitable ? 'var(--accent-green)' : 'var(--accent-red)'};">
                        ${isProfitable ? '+' : ''}$${Math.floor(g.profit).toLocaleString()}
                    </div>
                </div>
                <div>
                    <button class="staff-action-btn" ${g.reported ? 'disabled' : ''} onclick="generateReport('${g.id}')">
                        ${g.reported ? '✓ Analizado' : '📊 Informe (+RP)'}
                    </button>
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
        if (item.trend === 'up') trendIcon = '<span class="trend-arrow up">▲</span>';
        if (item.trend === 'down') trendIcon = '<span class="trend-arrow down">▼</span>';
        if (item.trend === 'new') trendIcon = '<span class="trend-arrow new">★</span>';

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

window.generateReport = function(gameId) {
    const res = game.generateGameReport(gameId);
    if (res.success) {
        document.getElementById('pm-rp-gain').innerText = `+${res.rpGained} Puntos de Investigación Obtenidos`;
        document.getElementById('pm-synergy-text').innerText = res.synergy;
        document.getElementById('pm-audience-text').innerText = res.audience;

        renderHistoryAndCharts();
        openModal('modal-postmortem');
    } else {
        showToast(res.message, 'warn');
    }
};

// --- MEGA GAME EXPO EVENT ---

window.attendExpo = function(tier) {
    let cost = 5000;
    let fanGain = 60;
    let hypeGain = 15;

    if (tier === 2) {
        cost = 22000;
        fanGain = 280;
        hypeGain = 45;
    } else if (tier === 3) {
        cost = 65000;
        fanGain = 850;
        hypeGain = 90;
    }

    if (game.funds < cost) {
        showToast("Fondos insuficientes para este stand de exhibición.", "warn");
        return;
    }

    game.funds -= cost;
    game.fans += fanGain;

    // Boost potential on current active sales
    game.activeSales.forEach(g => {
        g.salesPotential += Math.floor(hypeGain * 40 * (game.era === 1 ? 1 : (game.era === 2 ? 3 : 8)));
    });

    closeAllModals();
    showToast(`🎪 ¡Éxito en la Mega Game Expo! +${fanGain} Fans y un impulso de ventas global.`, 'success');
    if (soundEngine) soundEngine.playLevelUp();
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
const COMPANY_LOGOS = ['🎮', '🚀', '🕹️', '👾', '💾', '⚡', '💻', '👑', '🛡️', '💎'];

let localCustomization = {
    skin: '#ffdfc4',
    hairStyle: 'mop',
    hairColor: '#3d2314',
    shirtStyle: 'flannel',
    shirtColor: '#2563eb',
    pantsColor: '#1e293b',
    accessory: 'glasses_retro'
};
let localLogo = '🎮';

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

            game.updateCompanyProfile({
                companyName: companyName,
                companyLogo: localLogo,
                founderName: founderName,
                founderTrait: founderTrait,
                characterCustomization: { ...localCustomization }
            });

            if (world) world.updateCharacterMesh(0, localCustomization);
            closeAllModals();
            showToast(`🎉 ¡Estudio "${companyName}" y personaje guardados con éxito!`, 'success');
            if (soundEngine) soundEngine.playLevelUp();
        });
    }
}

function openCompanyCreatorModal() {
    localCustomization = { ...game.characterCustomization };
    localLogo = game.companyLogo;

    const inputComp = document.getElementById('input-company-name');
    if (inputComp) inputComp.value = game.companyName;

    const inputFounder = document.getElementById('input-founder-name');
    if (inputFounder) inputFounder.value = game.founder.name;

    const traitSelect = document.getElementById('select-founder-trait');
    if (traitSelect) traitSelect.value = game.founder.trait;

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
}

// --- MODAL HELPERS ---

function openModal(id) {
    closeAllModals();
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        if (soundEngine) soundEngine.playClick();
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => {
        m.style.display = 'none';
        m.classList.remove('active');
    });
    const devMenu = document.getElementById('developer-context-menu');
    if (devMenu) devMenu.style.display = 'none';
}

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
