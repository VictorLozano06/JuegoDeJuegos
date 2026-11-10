import { game } from './simulation.js';
import { syncStudioAvatars } from './company-logo.js';
import { ensureVreadState, generateVreadFeed, getCommunitySentiment, classifyVreadPost } from './vread-engine.js';
import { renderCasinoApp } from './casino-ui.js';

/**
 * DEV EMPIRE 3D - UWUNTU XD OPERATING SYSTEM
 * Complete interactive PC desktop environment & multi-window manager
 * featuring 5 historical eras (1982 to 2020+), window dragging,
 * taskbar, start menu, system tray, and seamless 3D workstation integration.
 */

// 1. UWUNTU XD LOGO (Original geometric vector - ZERO third party / OS logos)
export const UWUNTU_LOGO_SVG = `
<svg class="uwuntu-os-logo" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="18" cy="18" r="16" fill="url(#uwuntu-bg-grad)" stroke="#38bdf8" stroke-width="1.8"/>
    <!-- Outer orbiting energy nodes -->
    <circle cx="18" cy="5" r="2.4" fill="#38bdf8"/>
    <circle cx="29.2" cy="24.5" r="2.4" fill="#06b6d4"/>
    <circle cx="6.8" cy="24.5" r="2.4" fill="#818cf8"/>
    <!-- Central stylized XD monogram / core -->
    <path d="M12 11v10a6 6 0 0 0 12 0V11" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15 15l6 6M21 15l-6 6" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <defs>
        <linearGradient id="uwuntu-bg-grad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stop-color="#091b2e"/>
            <stop offset="1" stop-color="#030812"/>
        </linearGradient>
    </defs>
</svg>`;

// 2. VECTOR ICONS CATALOG (All original SVG, no emojis)
export const APP_ICONS = {
    casino: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="16" r="12" fill="#8d4e2b" fill-opacity=".28"/><circle cx="16" cy="16" r="8"/><circle cx="16" cy="16" r="2" fill="currentColor"/><path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M24.5 7.5l-2.8 2.8M10.3 21.7l-2.8 2.8"/></svg>`,
    newGame: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="8" width="26" height="16" rx="6" fill="#0284c7" fill-opacity="0.25"/>
        <line x1="9" y1="16" x2="15" y2="16"/>
        <line x1="12" y1="13" x2="12" y2="19"/>
        <circle cx="20.5" cy="14" r="1.5" fill="currentColor"/>
        <circle cx="23.5" cy="17" r="1.5" fill="currentColor"/>
    </svg>`,
    architecture: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="5" width="9" height="8" rx="2" fill="#6366f1" fill-opacity="0.25"/>
        <rect x="19" y="5" width="9" height="8" rx="2" fill="#6366f1" fill-opacity="0.25"/>
        <rect x="11.5" y="19" width="9" height="8" rx="2" fill="#4338ca" fill-opacity="0.25"/>
        <path d="M8.5 13v3.5h7.5M23.5 13v3.5H16"/>
        <circle cx="16" cy="16.5" r="1.8" fill="#38bdf8"/>
    </svg>`,
    graph3d: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 4l11 6v12l-11 6-11-6V10l11-6z" fill="#06b6d4" fill-opacity="0.2"/>
        <path d="M5 10l11 6 11-6M16 16v12"/>
        <circle cx="16" cy="4" r="2" fill="#67e8f9"/>
        <circle cx="27" cy="10" r="2" fill="#67e8f9"/>
        <circle cx="27" cy="22" r="2" fill="#67e8f9"/>
        <circle cx="16" cy="28" r="2" fill="#67e8f9"/>
        <circle cx="5" cy="22" r="2" fill="#67e8f9"/>
        <circle cx="5" cy="10" r="2" fill="#67e8f9"/>
        <circle cx="16" cy="16" r="2.5" fill="#22d3ee"/>
    </svg>`,
    research: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 5h6M14 5v7l-7 12a2 2 0 0 0 1.7 3h14.6a2 2 0 0 0 1.7-3l-7-12V5" fill="#10b981" fill-opacity="0.2"/>
        <path d="M10 19h12"/>
        <circle cx="13" cy="23" r="1.5" fill="#34d399"/>
        <circle cx="18" cy="22" r="1" fill="#34d399"/>
    </svg>`,
    marketing: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12v8h5l9 6V6l-9 6H5z" fill="#f43f5e" fill-opacity="0.25"/>
        <path d="M9 20l1.5 7h4l-2-7"/>
        <path d="M22 11c2 2.5 2 7.5 0 10M25 8c4 4.5 4 11.5 0 16"/>
    </svg>`,
    sales: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="5" y="18" width="5" height="10" rx="1.2" fill="#f59e0b" fill-opacity="0.3"/>
        <rect x="13.5" y="12" width="5" height="16" rx="1.2" fill="#f59e0b" fill-opacity="0.3"/>
        <rect x="22" y="6" width="5" height="22" rx="1.2" fill="#f59e0b" fill-opacity="0.3"/>
        <path d="M5 15l7-6 7 3 8-7M23 5h4v4" stroke="#fbbf24" stroke-width="2.2"/>
    </svg>`,
    liveops: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="5" y="13" width="22" height="7" rx="2" fill="#0ea5e9" fill-opacity="0.25"/>
        <rect x="5" y="22" width="22" height="7" rx="2" fill="#0ea5e9" fill-opacity="0.25"/>
        <circle cx="9.5" cy="16.5" r="1.2" fill="#4ade80"/>
        <circle cx="9.5" cy="25.5" r="1.2" fill="#4ade80"/>
        <path d="M16 13V8m-5 2.5a6 6 0 0 1 10 0" stroke="#7dd3fc" stroke-width="1.8"/>
        <circle cx="16" cy="7.5" r="1.6" fill="#38bdf8"/>
    </svg>`,
    rivals: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 27V12l6-3v18M11 27V6l10-3v24M22 27V15l6-2v14" fill="#475569" fill-opacity="0.3"/>
        <path d="M3 27h26"/>
        <rect x="14" y="9" width="1.8" height="1.8" fill="#facc15"/>
        <rect x="14" y="14" width="1.8" height="1.8" fill="#38bdf8"/>
        <rect x="14" y="19" width="1.8" height="1.8" fill="#facc15"/>
    </svg>`,
    studio: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 27V10l9-5 9 5v17H7z" fill="#0284c7" fill-opacity="0.25"/>
        <rect x="11" y="13" width="3.5" height="3.5" rx="0.8" fill="#7dd3fc"/>
        <rect x="17.5" y="13" width="3.5" height="3.5" rx="0.8" fill="#7dd3fc"/>
        <rect x="11" y="19" width="3.5" height="3.5" rx="0.8" fill="#7dd3fc"/>
        <rect x="17.5" y="19" width="3.5" height="3.5" rx="0.8" fill="#7dd3fc"/>
        <path d="M14 27v-5h4v5" fill="#0369a1"/>
    </svg>`,
    personnel: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="21" cy="11" r="3.2" fill="#047857" fill-opacity="0.3"/>
        <path d="M17 22c0-2.5 2-4.5 5-4.5s5 2 5 4.5"/>
        <circle cx="12" cy="12" r="4.2" fill="#10b981" fill-opacity="0.3"/>
        <path d="M5 26c0-4 3.5-7 8-7s8 3 8 7H5z"/>
        <polygon points="13,20 14,21.8 16,22 14.5,23.3 14.9,25.2 13,24.2 11.1,25.2 11.5,23.3 10,22 12,21.8" fill="#facc15"/>
    </svg>`,
    offices: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 27V9h14v18" fill="#6366f1" fill-opacity="0.25"/>
        <path d="M20 15h6v12h-6"/>
        <path d="M3 27h26"/>
        <path d="M10 13h6M10 17h6M10 21h6M22 19h2M22 23h2" stroke="#c7d2fe"/>
        <circle cx="18" cy="5" r="1.6" fill="#38bdf8"/>
    </svg>`,
    ip: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 4l10 4v9c0 7-5 11.5-10 13.5C11 28.5 6 24 6 17V8l10-4z" fill="#ca8a04" fill-opacity="0.25"/>
        <polygon points="16,10 17.8,13.8 22,14.4 19,17.4 19.7,21.6 16,19.6 12.3,21.6 13,17.4 10,14.4 14.2,13.8" fill="#fef08a"/>
    </svg>`,
    workshop: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M23 8a4 4 0 0 0-4.8.8l-1.4 1.4 5 5 1.4-1.4a4 4 0 0 0 .8-4.8l-1.6 1.6-1.6-.8.8-1.6h2.8z" fill="#ea580c" fill-opacity="0.3"/>
        <path d="M16.5 14.5l-9.5 9.5a1.8 1.8 0 0 0 0 2.5l1 1a1.8 1.8 0 0 0 2.5 0l9.5-9.5-3.5-3.5z"/>
        <rect x="18" y="18" width="8" height="8" rx="2" fill="#ffedd5" stroke="#ea580c"/>
    </svg>`,
    vread: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="7" fill="#030812"/>
        <path d="M5 8h7l5.5 13L23 8h6L19.5 25h-7L5 8z" fill="url(#uw-vread-grad)"/>
        <path d="M12 8l5.5 13 5.5-13" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <defs>
            <linearGradient id="uw-vread-grad" x1="5" y1="8" x2="29" y2="25" gradientUnits="userSpaceOnUse">
                <stop stop-color="#38bdf8"/>
                <stop offset="1" stop-color="#06b6d4"/>
            </linearGradient>
        </defs>
    </svg>`,
    guide: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 10c3-1.5 7-1.5 10 .8v14.5c-3-2.3-7-2.3-10-.8V10z" fill="#2563eb" fill-opacity="0.25"/>
        <path d="M26 10c-3-1.5-7-1.5-10 .8v14.5c3-2.3 7-2.3 10-.8V10z" fill="#1d4ed8" fill-opacity="0.25"/>
        <circle cx="16" cy="6.5" r="2.2" fill="#facc15"/>
    </svg>`,
    admin: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="6" width="24" height="20" rx="3.5" fill="#0f172a" stroke="#38bdf8"/>
        <path d="M4 11h24"/>
        <circle cx="7.5" cy="8.5" r="1.1" fill="#f43f5e"/>
        <circle cx="11" cy="8.5" r="1.1" fill="#facc15"/>
        <circle cx="14.5" cy="8.5" r="1.1" fill="#4ade80"/>
        <path d="M8 16l3 3-3 3M13 22h5" stroke="#38bdf8" stroke-width="2"/>
    </svg>`,
    trash: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9h20M11 9V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M9 9l1.5 17a2 2 0 0 0 2 1.9h7a2 2 0 0 0 2-1.9L23 9" fill="#0284c7" fill-opacity="0.25"/>
        <line x1="13" y1="14" x2="13" y2="22" stroke="#38bdf8"/>
        <line x1="19" y1="14" x2="19" y2="22" stroke="#38bdf8"/>
    </svg>`,
    folder: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 8a2 2 0 0 1 2-2h6l3 3h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" fill="#f59e0b" fill-opacity="0.25" stroke="#f59e0b"/>
        <line x1="4" y1="13" x2="28" y2="13" stroke="#fbbf24"/>
    </svg>`,
    store: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 10l2-5h16l2 5v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z" fill="#06b6d4" fill-opacity="0.25"/>
        <path d="M6 10h20"/>
        <path d="M12 14a4 4 0 0 0 8 0"/>
        <line x1="16" y1="18" x2="16" y2="24" stroke="#38bdf8" stroke-width="2"/>
        <polyline points="13 21 16 24 19 21" stroke="#38bdf8" stroke-width="2"/>
    </svg>`,
    synth: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="8" width="24" height="16" rx="2.5" fill="#8b5cf6" fill-opacity="0.25"/>
        <line x1="9" y1="8" x2="9" y2="18"/>
        <line x1="14" y1="8" x2="14" y2="18"/>
        <line x1="18" y1="8" x2="18" y2="18"/>
        <line x1="23" y1="8" x2="23" y2="18"/>
        <rect x="7" y="8" width="3.2" height="6" fill="#c4b5fd"/>
        <rect x="12" y="8" width="3.2" height="6" fill="#c4b5fd"/>
        <rect x="21" y="8" width="3.2" height="6" fill="#c4b5fd"/>
    </svg>`,
    calc: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="5" width="20" height="22" rx="3" fill="#10b981" fill-opacity="0.25"/>
        <rect x="9" y="8" width="14" height="5" rx="1.2" fill="#064e3b" stroke="#34d399"/>
        <circle cx="10.5" cy="17" r="1.3" fill="currentColor"/>
        <circle cx="16" cy="17" r="1.3" fill="currentColor"/>
        <circle cx="21.5" cy="17" r="1.3" fill="currentColor"/>
        <circle cx="10.5" cy="22" r="1.3" fill="currentColor"/>
        <circle cx="16" cy="22" r="1.3" fill="currentColor"/>
        <circle cx="21.5" cy="22" r="1.3" fill="currentColor"/>
    </svg>`,
    osUpdate: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M26 12A11 11 0 0 0 7 10" stroke="#38bdf8"/>
        <polyline points="7 4 7 10 13 10" stroke="#38bdf8"/>
        <path d="M6 20a11 11 0 0 0 19 2" stroke="#0ea5e9"/>
        <polyline points="25 28 25 22 19 22" stroke="#0ea5e9"/>
        <circle cx="16" cy="16" r="3" fill="#38bdf8" fill-opacity="0.3"/>
    </svg>`
};

// 3. COMPLETE APPLICATIONS DIRECTORY
export const UWUNTU_APPS = [
    // PRODUCCIÓN
    {
        id: 'app-architecture',
        title: 'Arquitectura & Deuda Técnica',
        shortTitle: 'Arquitectura',
        category: 'Producción',
        modalId: 'modal-scope-dag',
        icon: APP_ICONS.architecture,
        badgeColor: '#6366f1',
        defaultWidth: 960,
        defaultHeight: 680,
        onOpen: () => {
            window.refreshArchitecturePanel?.();
        }
    },
    {
        id: 'app-graph-3d',
        title: 'Visualizador Grafo 3D',
        shortTitle: 'Grafo 3D',
        category: 'Producción',
        isDirectAction: true,
        icon: APP_ICONS.graph3d,
        badgeColor: '#06b6d4',
        action: () => {
            window.uwuntuOS?.close();
            const btn = document.getElementById('btn-toggle-hologram');
            if (btn) btn.click();
        }
    },

    // MERCADO
    {
        id: 'app-marketing',
        title: 'Marketing & Comunidad',
        shortTitle: 'Marketing',
        category: 'Mercado',
        modalId: 'modal-marketing',
        icon: APP_ICONS.marketing,
        badgeColor: '#f43f5e',
        defaultWidth: 1040,
        defaultHeight: 700,
        onOpen: () => {
            window.renderMarketingHub?.();
        }
    },
    {
        id: 'app-liveops',
        title: 'Live Ops & Servicios en Vivo',
        shortTitle: 'Live Ops',
        category: 'Mercado',
        modalId: 'modal-liveops',
        icon: APP_ICONS.liveops,
        badgeColor: '#0ea5e9',
        defaultWidth: 920,
        defaultHeight: 640,
        onOpen: () => {
            window.renderLiveOps?.();
        }
    },
    {
        id: 'app-rivals',
        title: 'Empresas Rivales & Competencia',
        shortTitle: 'Rivales',
        category: 'Mercado',
        modalId: 'modal-rival-companies',
        icon: APP_ICONS.rivals,
        badgeColor: '#475569',
        defaultWidth: 920,
        defaultHeight: 640,
        onOpen: () => {
            window.refreshRivalsPanel?.();
        }
    },

    // ESTUDIO
    {
        id: 'app-studio',
        title: 'Perfil del Estudio & Fundador',
        shortTitle: 'Estudio',
        category: 'Estudio',
        modalId: 'modal-company-creator',
        icon: APP_ICONS.studio,
        badgeColor: '#0284c7',
        defaultWidth: 720,
        defaultHeight: 600,
        onOpen: () => {
            window.syncStudioFormValues?.(false);
        }
    },
    {
        id: 'app-offices',
        title: 'Sede & Oficinas del Estudio',
        shortTitle: 'Oficinas',
        category: 'Estudio',
        modalId: 'modal-offices',
        icon: APP_ICONS.offices,
        badgeColor: '#6366f1',
        defaultWidth: 900,
        defaultHeight: 620,
        onOpen: () => {
            window.refreshOfficeManager?.();
        }
    },
    {
        id: 'app-ip',
        title: 'Propiedad Intelectual & Franquicias',
        shortTitle: 'Propiedad IP',
        category: 'Estudio',
        modalId: 'modal-intellectual-property',
        icon: APP_ICONS.ip,
        badgeColor: '#ca8a04',
        defaultWidth: 920,
        defaultHeight: 640,
        onOpen: () => {
            window.refreshIPPanel?.();
        }
    },
    {
        id: 'app-workshop',
        title: 'Simulador Workshop & Mods',
        shortTitle: 'Workshop',
        category: 'Estudio',
        modalId: 'modal-community-workshop',
        icon: APP_ICONS.workshop,
        badgeColor: '#ea580c',
        defaultWidth: 900,
        defaultHeight: 620,
        onOpen: () => {
            window.renderCommunityWorkshop?.();
        }
    },

    // SISTEMA
    {
        id: 'app-casino', title: 'Casino Royale · Salón privado', shortTitle: 'Casino',
        category: 'Mercado', isCustomApp: true, requiresInstall: true, availableYear: 2010,
        icon: APP_ICONS.casino, badgeColor: '#c49543', defaultWidth: 960, defaultHeight: 680,
        renderContent: (container, gameInstance) => renderCasinoApp(container, gameInstance)
    },
    {
        id: 'app-store',
        title: 'Uwuntu Store · Software Hub',
        shortTitle: 'Store',
        category: 'Sistema',
        isCustomApp: true,
        icon: APP_ICONS.store,
        badgeColor: '#06b6d4',
        defaultWidth: 940,
        defaultHeight: 640,
        renderContent: (container, gameInstance) => {
            renderStoreAppContent(container, gameInstance);
        }
    },
    {
        id: 'app-vread',
        title: 'Vread · Red Social y Comunidad',
        shortTitle: 'Vread',
        category: 'Sistema',
        isCustomApp: true,
        requiresInstall: true,
        icon: APP_ICONS.vread,
        badgeColor: '#0ea5e9',
        defaultWidth: 960,
        defaultHeight: 680,
        renderContent: (container, gameInstance) => {
            renderVreadAppContent(container, gameInstance);
        }
    },
    {
        id: 'app-store-synth',
        title: 'AudioSynthesizer 84 · Chiptune FX',
        shortTitle: 'AudioSynth',
        category: 'Producción',
        isCustomApp: true,
        requiresInstall: true,
        icon: APP_ICONS.synth,
        badgeColor: '#8b5cf6',
        defaultWidth: 760,
        defaultHeight: 520,
        renderContent: (container) => {
            renderSynthAppContent(container);
        }
    },
    {
        id: 'app-store-calc',
        title: 'Calculadora de Regalías & Break-Even',
        shortTitle: 'Calc Regalías',
        category: 'Mercado',
        isCustomApp: true,
        requiresInstall: true,
        icon: APP_ICONS.calc,
        badgeColor: '#10b981',
        defaultWidth: 700,
        defaultHeight: 520,
        renderContent: (container, gameInstance) => {
            renderCalcAppContent(container, gameInstance);
        }
    },
    {
        id: 'app-guide',
        title: 'Manual de Estudio & Atajos',
        shortTitle: 'Guía',
        category: 'Sistema',
        isCustomApp: true,
        icon: APP_ICONS.guide,
        badgeColor: '#2563eb',
        defaultWidth: 780,
        defaultHeight: 580,
        renderContent: (container) => {
            renderGuideAppContent(container);
        }
    },
    {
        id: 'app-admin',
        title: 'Terminal de Administración',
        shortTitle: 'Admin',
        category: 'Sistema',
        isCustomApp: true,
        icon: APP_ICONS.admin,
        badgeColor: '#38bdf8',
        defaultWidth: 860,
        defaultHeight: 620,
        renderContent: (container, gameInstance, osInstance) => {
            renderAdminAppContent(container, gameInstance);
        }
    },
    {
        id: 'app-os-update',
        title: 'Centro de Actualizaciones de Sistema',
        shortTitle: 'Actualizaciones',
        category: 'Sistema',
        isCustomApp: true,
        icon: APP_ICONS.osUpdate,
        badgeColor: '#0ea5e9',
        defaultWidth: 880,
        defaultHeight: 640,
        renderContent: (container, gameInstance, osInstance) => {
            renderOSUpdateAppContent(container, gameInstance, osInstance);
        }
    }
];

// 4. HISTORICAL ERAS CATALOG
export const UWUNTU_ERAS = [
    {
        id: 'classic',
        minYear: 1982,
        maxYear: 1989,
        className: 'uwuntu-era-classic',
        versionName: 'Uwuntu XD Classic v1.08',
        brandSubtitle: 'Sistema Operativo de Estudio 8-bit',
        startLabel: 'INICIO',
        desktopFont: '"Courier New", Courier, monospace',
        ditherEffect: true
    },
    {
        id: 'desktop',
        minYear: 1990,
        maxYear: 1999,
        className: 'uwuntu-era-desktop',
        versionName: 'Uwuntu XD 95 Workstation',
        brandSubtitle: 'Edición Profesional 32-bit',
        startLabel: 'Inicio',
        desktopFont: '"Segoe UI", Tahoma, Geneva, sans-serif',
        ditherEffect: false
    },
    {
        id: 'fusion',
        minYear: 2000,
        maxYear: 2009,
        className: 'uwuntu-era-fusion',
        versionName: 'Uwuntu XD Fusion Millennium',
        brandSubtitle: 'Multimedia Studio Environment',
        startLabel: 'Uwuntu',
        desktopFont: '"Segoe UI", "Trebuchet MS", sans-serif',
        ditherEffect: false
    },
    {
        id: 'modern',
        minYear: 2010,
        maxYear: 2019,
        className: 'uwuntu-era-modern',
        versionName: 'Uwuntu XD 10 Professional',
        brandSubtitle: 'Cloud Connected Studio OS',
        startLabel: 'Inicio',
        desktopFont: 'system-ui, -apple-system, sans-serif',
        ditherEffect: false
    },
    {
        id: 'next',
        minYear: 2020,
        maxYear: 2099,
        className: 'uwuntu-era-next',
        versionName: 'Uwuntu XD Next Horizon',
        brandSubtitle: 'Neural Neural Computing Platform',
        startLabel: 'Uwuntu',
        desktopFont: 'system-ui, -apple-system, sans-serif',
        ditherEffect: false
    }
];

// 5. OFFICIAL UWUNTU XD WALLPAPERS CATALOG (5 Original High-Res Wallpapers)
export const UWUNTU_WALLPAPERS = [
    {
        id: 'wp_synthwave',
        name: 'Cyber Grid 1984',
        category: 'Retro Synthwave & Wireframe',
        url: '/wallpapers/wp_synthwave.jpg',
        description: 'Horizonte retrofuturista con cuadrícula de neón cian, montañas wireframe y sol digital sintetizado.',
        accent: '#38bdf8'
    },
    {
        id: 'wp_silicon',
        name: 'Silicon Matrix',
        category: 'Hardware & Microcircuitos',
        url: '/wallpapers/wp_silicon.jpg',
        description: 'Microprocesador central iluminado con pistas de circuito impreso en azul cobalto y fibra óptica.',
        accent: '#06b6d4'
    },
    {
        id: 'wp_nebula',
        name: 'Cosmic Nebula',
        category: 'Cosmos & Coordenadas Orbit',
        url: '/wallpapers/wp_nebula.jpg',
        description: 'Nebulosa estelar profunda en azul zafiro e índigo con órbitas geométricas y planeta anillado.',
        accent: '#818cf8'
    },
    {
        id: 'wp_cybercity',
        name: 'Neon Metropolis',
        category: 'Metrópolis Isométrica Low-Poly',
        url: '/wallpapers/wp_cybercity.jpg',
        description: 'Rascacielos geométricos iluminados, puentes aéreos y neblina volumétrica al anochecer digital.',
        accent: '#2dd4bf'
    },
    {
        id: 'wp_quantum',
        name: 'Quantum Core',
        category: 'Núcleo Cuántico Minimalista',
        url: '/wallpapers/wp_quantum.jpg',
        description: 'Hipercubo de cristal ahumado y obsidiana pulida con anillos láser cian concéntricos en suspensión.',
        accent: '#67e8f9'
    }
];

export function getEraForYear(year) {
    const y = Number(year) || 1982;
    return UWUNTU_ERAS.find(era => y >= era.minYear && y <= era.maxYear) || UWUNTU_ERAS[0];
}

/**
 * Main Operating System Environment Manager
 */
export class UwuntuOS {
    constructor(gameInstance, worldInstance) {
        this.game = gameInstance;
        this.world = worldInstance;
        this.isOpen = false;
        this.openWindows = new Map(); // appId -> { winEl, taskTab, app, isMinimized, isMaximized }
        this.activeWindowId = null;
        this.nextZIndex = 110;
        this.currentEra = getEraForYear(this.getHistoricalYear());

        // Wallpaper state & persistence
        this.wallpapers = UWUNTU_WALLPAPERS;
        this.currentWallpaper = null;
        this.isAutoRandomWallpaper = localStorage.getItem('uwuntu_wp_auto_random') !== 'false';
        this.savedWallpaperId = localStorage.getItem('uwuntu_wp_selected_id') || null;

        // Desktop items, free dragging, folders & trash
        this.iconPositions = JSON.parse(localStorage.getItem('uwuntu_icon_positions') || '{}');
        this.folders = JSON.parse(localStorage.getItem('uwuntu_desktop_folders') || 'null');
        if (!this.folders) {
            this.folders = [
                { id: 'folder_docs', name: 'Documentos', files: [{ name: 'GDD_Proyecto_Alpha.txt', text: 'Notas preliminares de diseño del próximo lanzamiento.' }] }
            ];
        }
        this.trashItems = JSON.parse(localStorage.getItem('uwuntu_trash_items') || '[]');
        this.selectedDesktopIds = new Set();
        this.folderDialogTargetId = null;

        // Store installed apps catalog (Vread starts NOT installed until downloaded from Store)
        const defaultInstalled = [
            'app-store', 'app-architecture', 'app-graph-3d', 'app-marketing',
            'app-liveops', 'app-rivals', 'app-studio', 'app-offices',
            'app-ip', 'app-workshop', 'app-guide', 'app-admin', 'app-os-update'
        ];
        const savedInstalled = localStorage.getItem('uwuntu_installed_apps');
        this.installedApps = new Set(savedInstalled ? JSON.parse(savedInstalled) : defaultInstalled);
        this.installedApps.add('app-os-update');
        this.vreadNotificationDismissed = sessionStorage.getItem('uwuntu_vread_dismissed') === 'true';

        // OS Update status (2006 Crystal Aero)
        this.is2006Updated = localStorage.getItem('uwuntu_os_updated_2006') === 'true' || Boolean(this.game?.osUpdated2006);

        this.initDOM();
        this.setupEventListeners();
        this.subscribeToGame();
    }

    getHistoricalYear() {
        return this.game.getHistoricalYear ? this.game.getHistoricalYear() : (1981 + (this.game.year || 1));
    }

    isOSUpdateAvailable() {
        const year = this.getHistoricalYear();
        return (year >= 2006 || this.forceUpdateAvailable) && !this.is2006Updated;
    }

    initDOM() {
        // Remove old device-launcher or studio-device if present
        document.getElementById('device-launcher')?.remove();
        document.getElementById('studio-device')?.remove();

        // 1. Create desktop container
        this.container = document.createElement('div');
        this.container.id = 'uwuntu-desktop-environment';
        this.container.className = `uwuntu-os ${this.currentEra.className} ${this.is2006Updated ? 'os-updated-2006' : ''}`;
        this.container.hidden = true;
        this.container.setAttribute('aria-label', 'Escritorio del sistema operativo Uwuntu XD');

        this.container.innerHTML = `
            <!-- CRT Screen Effects (scanlines, vignette, screen glare) -->
            <div class="uwuntu-screen-effects" aria-hidden="true">
                <div class="uwuntu-scanlines"></div>
                <div class="uwuntu-vignette"></div>
                <div class="uwuntu-screen-reflection"></div>
            </div>

            <!-- Desktop Viewport -->
            <div class="uwuntu-desktop" id="uwuntu-desktop">
                <!-- Wallpaper Layer -->
                <div class="uwuntu-wallpaper" id="uwuntu-wallpaper" aria-hidden="true">
                    <div class="uwuntu-wp-image" id="uwuntu-wp-image"></div>
                    <div class="uwuntu-wp-overlay"></div>
                    <div class="uwuntu-wp-mesh"></div>
                    <div class="uwuntu-wp-glow-orb-left"></div>
                    <div class="uwuntu-wp-glow-orb-right"></div>
                    <div class="uwuntu-wp-branding">
                        <div class="uwuntu-wp-badge">
                            <div class="uwuntu-wp-logo-wrap">${UWUNTU_LOGO_SVG}</div>
                            <div class="uwuntu-wp-text">
                                <h2 class="uwuntu-brand-title">Uwuntu XD</h2>
                                <p class="uwuntu-brand-version" id="uwuntu-os-version-label">${this.currentEra.versionName}</p>
                                <span class="uwuntu-brand-subtitle" id="uwuntu-os-subtitle-label">${this.currentEra.brandSubtitle}</span>
                            </div>
                        </div>
                        <div class="uwuntu-wp-controls" role="toolbar" aria-label="Personalización de fondo">
                            <button type="button" class="uwuntu-wp-ctrl-btn" id="uwuntu-wp-btn-random" title="Fondo aleatorio (Atajo: F)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="wp-ctrl-svg"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
                                <span>Fondo aleatorio</span>
                            </button>
                            <button type="button" class="uwuntu-wp-ctrl-btn" id="uwuntu-wp-btn-gallery" title="Galería de fondos (5 temas)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="wp-ctrl-svg"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                <span id="uwuntu-wp-active-label">Fondos</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Wallpaper Feedback Toast -->
                <div class="uwuntu-wp-toast" id="uwuntu-wp-toast" hidden aria-live="polite">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="wp-toast-svg"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    <span id="uwuntu-wp-toast-text">Fondo aplicado</span>
                </div>

                <!-- Wallpaper Gallery Popover -->
                <div class="uwuntu-wp-gallery-popover" id="uwuntu-wp-gallery-popover" hidden role="dialog" aria-label="Galería de fondos de pantalla">
                    <div class="wp-gallery-header">
                        <div class="wp-gallery-title-box">
                            <span class="wp-gallery-kicker">DEV EMPIRE · PERSONALIZACIÓN</span>
                            <h3 class="wp-gallery-title">Fondos de Pantalla Uwuntu XD</h3>
                        </div>
                        <button type="button" class="wp-gallery-close" id="wp-gallery-close" aria-label="Cerrar galería">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                    <div class="wp-gallery-actions">
                        <button type="button" class="wp-gallery-action-btn primary" id="wp-gallery-random-now">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
                            <span>Elegir fondo al azar (F)</span>
                        </button>
                        <label class="wp-gallery-toggle">
                            <input type="checkbox" id="wp-gallery-auto-random" ${this.isAutoRandomWallpaper ? 'checked' : ''}>
                            <span class="wp-toggle-label">Cambiar al azar en cada inicio</span>
                        </label>
                    </div>
                    <div class="wp-gallery-grid" id="wp-gallery-grid"></div>
                </div>

                <!-- Marquee Selection Rectangle -->
                <div class="uwuntu-selection-marquee" id="uwuntu-selection-marquee" hidden></div>

                <!-- Desktop Application Icons Grid -->
                <div class="uwuntu-icons-grid" id="uwuntu-icons-grid" role="region" aria-label="Iconos de escritorio"></div>

                <!-- Windows Container Layer -->
                <div class="uwuntu-windows-container" id="uwuntu-windows-container"></div>

                <!-- Desktop Context Menu (Right Click) -->
                <div class="uwuntu-context-menu" id="uwuntu-context-menu" hidden role="menu" aria-label="Menú contextual del escritorio">
                    <button type="button" class="ctx-item" data-action="new-folder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8a2 2 0 0 1 2-2h6l3 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                        <span>Nueva Carpeta</span>
                    </button>
                    <button type="button" class="ctx-item" data-action="auto-arrange">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        <span>Organizar Iconos</span>
                    </button>
                    <div class="ctx-divider"></div>
                    <button type="button" class="ctx-item" data-action="open-wallpapers">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        <span>Cambiar Fondo (F)</span>
                    </button>
                    <button type="button" class="ctx-item" data-action="random-wallpaper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
                        <span>Fondo Aleatorio</span>
                    </button>
                    <div class="ctx-divider"></div>
                    <button type="button" class="ctx-item" data-action="open-trash">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        <span>Abrir Papelera</span>
                    </button>
                    <button type="button" class="ctx-item" data-action="empty-trash">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        <span>Vaciar Papelera</span>
                    </button>
                    <div class="ctx-divider"></div>
                    <button type="button" class="ctx-item ctx-exit" data-action="exit-pc">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        <span>Salir a la Oficina</span>
                    </button>
                </div>

                <!-- Folder Creation / Rename Modal Dialog -->
                <div class="uwuntu-modal-dialog" id="uwuntu-folder-dialog" hidden role="dialog" aria-label="Crear o renombrar carpeta">
                    <div class="uwuntu-dialog-card">
                        <div class="uwuntu-dialog-header">
                            <div class="uwuntu-dialog-icon">${APP_ICONS.folder}</div>
                            <div class="uwuntu-dialog-meta">
                                <span class="uwuntu-dialog-kicker">SISTEMA DE ARCHIVOS</span>
                                <h3 class="uwuntu-dialog-title" id="uwuntu-folder-dialog-title">Nueva Carpeta</h3>
                            </div>
                            <button type="button" class="uwuntu-dialog-close" id="uwuntu-folder-close" aria-label="Cerrar">✕</button>
                        </div>
                        <div class="uwuntu-dialog-body">
                            <label for="uwuntu-folder-input" class="uwuntu-dialog-label">Nombre de la carpeta:</label>
                            <input type="text" id="uwuntu-folder-input" class="uwuntu-dialog-input" maxlength="28" autocomplete="off" placeholder="Ej: Diseños y Guiones">
                        </div>
                        <div class="uwuntu-dialog-footer">
                            <button type="button" class="uwuntu-dialog-btn secondary" id="uwuntu-folder-cancel">Cancelar</button>
                            <button type="button" class="uwuntu-dialog-btn primary" id="uwuntu-folder-confirm">Guardar Carpeta</button>
                        </div>
                    </div>
                </div>

                <!-- Start Menu Launcher (Modern AAA Workstation Hub) -->
                <div class="uwuntu-start-menu" id="uwuntu-start-menu" hidden role="dialog" aria-label="Lanzador de aplicaciones Uwuntu XD">
                    <!-- Top Studio Header -->
                    <div class="start-menu-topbar">
                        <div class="start-menu-studio">
                            <div class="start-studio-avatar" id="start-menu-avatar" data-studio-avatar></div>
                            <div class="start-studio-meta">
                                <strong class="start-studio-name" id="start-menu-studio-name">${this.game.companyName || 'PixelForge Interactive'}</strong>
                                <div class="start-studio-tags">
                                    <span class="start-tag-office" id="start-menu-office-name">${this.game.getActiveOffice?.().name || 'Garaje Retro'}</span>
                                    <span class="start-tag-sep">·</span>
                                    <span class="start-tag-year">Año ${this.getHistoricalYear()}</span>
                                </div>
                            </div>
                        </div>
                        <div class="start-menu-system-badge">
                            <div class="start-badge-logo">${UWUNTU_LOGO_SVG}</div>
                            <div class="start-badge-text">
                                <span class="start-badge-name">Uwuntu XD</span>
                                <span class="start-badge-status"><span class="status-dot"></span> Operativo</span>
                            </div>
                        </div>
                    </div>

                    <!-- Search Bar & Category Filters -->
                    <div class="start-menu-toolbar">
                        <div class="start-search-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input type="text" id="start-menu-search-input" placeholder="Buscar herramientas del estudio..." autocomplete="off">
                            <kbd class="start-search-kbd">Esc</kbd>
                        </div>
                        <div class="start-filter-pills" id="start-filter-pills">
                            <button type="button" class="start-filter-pill is-active" data-category="all">Todas (12)</button>
                            <button type="button" class="start-filter-pill" data-category="Producción">Producción</button>
                            <button type="button" class="start-filter-pill" data-category="Mercado">Mercado</button>
                            <button type="button" class="start-filter-pill" data-category="Estudio">Estudio</button>
                        </div>
                    </div>

                    <!-- Apps Grid (Tactile Studio Tiles) -->
                    <div class="start-apps-viewport">
                        <div class="start-apps-grid" id="start-apps-grid" role="grid"></div>
                    </div>

                    <!-- Bottom Action Footer -->
                    <div class="start-menu-footer">
                        <div class="start-footer-left">
                            <button type="button" class="start-footer-btn" id="start-wallpaper-btn" title="Personalizar fondos de pantalla (F)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <path d="M21 15l-5-5L5 21"></path>
                                </svg>
                                <span>Fondos (F)</span>
                            </button>
                            <span class="start-footer-hint">12 Herramientas activas</span>
                        </div>
                        <button type="button" class="start-exit-btn" id="start-power-btn" title="Volver a la oficina 3D (Esc)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span>Salir a la oficina</span>
                        </button>
                    </div>
                </div>

                <!-- System Tray Balloon Notification (e.g. New App Available in Store) -->
                <div class="uwuntu-system-toast" id="uwuntu-system-notification" hidden role="alert" aria-live="assertive">
                    <div class="sys-toast-header">
                        <div class="sys-toast-badge-wrap">
                            <span class="sys-toast-icon">${APP_ICONS.store}</span>
                            <div class="sys-toast-meta">
                                <span class="sys-toast-kicker">UWUNTU SOFTWARE HUB</span>
                                <strong class="sys-toast-title">¡Nueva aplicación disponible!</strong>
                            </div>
                        </div>
                        <button type="button" class="sys-toast-close" id="sys-toast-close" aria-label="Cerrar notificación">✕</button>
                    </div>
                    <div class="sys-toast-body">
                        <div class="sys-toast-app-card">
                            <div class="sys-toast-app-icon">${APP_ICONS.vread}</div>
                            <div class="sys-toast-app-details">
                                <div class="sys-toast-app-title-row">
                                    <strong class="sys-toast-app-name">Vread</strong>
                                    <span class="sys-toast-app-badge">Comunidad & Red Social</span>
                                </div>
                                <p class="sys-toast-app-desc">La comunidad ha creado una app para comentar videojuegos en directo. ¡Ya está disponible para descargar en la Uwuntu Store!</p>
                            </div>
                        </div>
                    </div>
                    <div class="sys-toast-footer">
                        <button type="button" class="sys-toast-btn primary" id="sys-toast-open-store">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Descargar en Store</span>
                        </button>
                        <button type="button" class="sys-toast-btn secondary" id="sys-toast-dismiss">Más tarde</button>
                    </div>
                </div>
            </div>

            <!-- Balloon Notification for OS Update -->
            <div class="uwuntu-update-balloon" id="uwuntu-update-balloon" hidden role="alert" aria-live="polite">
                <div class="balloon-header">
                    <div class="balloon-title-row">
                        <span class="balloon-icon">${APP_ICONS.osUpdate}</span>
                        <strong class="balloon-title">Actualización de sistema</strong>
                    </div>
                    <button type="button" class="balloon-close-btn" id="uwuntu-balloon-close-btn" aria-label="Cerrar notificación">&times;</button>
                </div>
                <p class="balloon-text">¡<strong>Uwuntu XD 2006 Crystal Aero</strong> está disponible! Interfaz translúcida ultranítida, mayor velocidad y aceleración de motores.</p>
                <div class="balloon-actions">
                    <button type="button" class="balloon-btn-primary" id="uwuntu-balloon-open-btn">Actualizar ahora</button>
                    <button type="button" class="balloon-btn-secondary" id="uwuntu-balloon-later-btn">Más tarde</button>
                </div>
            </div>

            <!-- Fullscreen Reboot Overlay for Interactive Installation -->
            <div class="uwuntu-reboot-overlay" id="uwuntu-reboot-overlay" hidden>
                <div class="reboot-card">
                    <div class="reboot-spinner-ring"></div>
                    <div class="reboot-brand-logo">${UWUNTU_LOGO_SVG}</div>
                    <h3 class="reboot-heading" id="uwuntu-reboot-title">Reiniciando Uwuntu XD...</h3>
                    <p class="reboot-caption" id="uwuntu-reboot-desc">Aplicando nueva interfaz ultranítida Crystal Aero 2006</p>
                </div>
            </div>

            <!-- Taskbar / Desktop Panel -->
            <footer class="uwuntu-taskbar" id="uwuntu-taskbar">
                <!-- Start Button -->
                <button type="button" class="uwuntu-start-btn" id="uwuntu-start-btn" aria-haspopup="true" aria-expanded="false">
                    <span class="start-logo-pill">${UWUNTU_LOGO_SVG}</span>
                    <span class="start-text" id="uwuntu-start-label">${this.currentEra.startLabel}</span>
                </button>

                <!-- Active Tasks / Windows Buttons Bar -->
                <div class="uwuntu-taskbar-tasks" id="uwuntu-taskbar-tasks" role="tablist" aria-label="Aplicaciones activas"></div>

                <!-- System Tray -->
                <div class="uwuntu-tray" id="uwuntu-tray">
                    <button type="button" class="tray-icon-btn tray-update-btn ${this.isOSUpdateAvailable() ? 'has-update' : ''}" id="uwuntu-tray-update-btn" title="${this.isOSUpdateAvailable() ? 'Actualización de sistema disponible: Uwuntu XD 2006 Crystal Aero' : 'Sistema al día: Uwuntu XD 2006'}" aria-label="Actualizaciones del sistema">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 8A6.5 6.5 0 0 0 4.5 7"></path>
                            <polyline points="4.5 3 4.5 7 8.5 7"></polyline>
                            <path d="M4 12a6.5 6.5 0 0 0 11.5 1"></path>
                            <polyline points="15.5 17 15.5 13 11.5 13"></polyline>
                        </svg>
                        <span class="tray-update-badge" id="uwuntu-tray-update-badge" ${this.isOSUpdateAvailable() ? '' : 'hidden'}></span>
                    </button>
                    <div class="tray-led" id="uwuntu-disk-led" title="Actividad de disco"></div>
                    <div class="tray-date-info">
                        <span class="tray-time" id="uwuntu-clock-time">10:42</span>
                        <span class="tray-year" id="uwuntu-tray-year">${this.getHistoricalYear()}</span>
                    </div>
                    <button type="button" class="tray-exit-btn" id="uwuntu-tray-exit-btn" title="Volver a la oficina (Esc)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Oficina</span>
                    </button>
                </div>
            </footer>
        `;

        document.body.appendChild(this.container);

        // Build Desktop Icons & Setup Interactivity
        this.renderDesktopIcons();
        this.setupDesktopInteractions();

        // Build Start Menu Items
        this.renderStartMenuItems();

        // Build Wallpaper & Gallery Layer
        this.applyInitialWallpaper();
        this.renderWallpaperGallery();
    }

    getDefaultSlotPosition(index) {
        const GRID_X = 108;
        const GRID_Y = 104;
        const PAD_X = 24;
        const PAD_Y = 24;
        const desk = this.container ? this.container.querySelector('#uwuntu-desktop') : null;
        const deskHeight = desk ? desk.clientHeight : (window.innerHeight - 120);
        const rowsPerCol = Math.max(4, Math.floor((deskHeight - PAD_Y) / GRID_Y));
        const col = Math.floor(index / rowsPerCol);
        const row = index % rowsPerCol;
        return {
            x: PAD_X + col * GRID_X,
            y: PAD_Y + row * GRID_Y
        };
    }

    findNextFreeSlot(occupied = null) {
        const occupiedSet = occupied || new Set();
        if (!occupied) {
            Object.values(this.iconPositions).forEach(pos => {
                if (pos && typeof pos.x === 'number') {
                    occupiedSet.add(`${Math.round(pos.x)},${Math.round(pos.y)}`);
                }
            });
        }
        for (let i = 0; i < 120; i++) {
            const pos = this.getDefaultSlotPosition(i);
            const key = `${Math.round(pos.x)},${Math.round(pos.y)}`;
            if (!occupiedSet.has(key)) {
                return pos;
            }
        }
        return { x: 240, y: 128 };
    }

    findNearestFreeSlot(targetX, targetY, occupied = null) {
        const GRID_X = 108;
        const GRID_Y = 104;
        const PAD_X = 24;
        const PAD_Y = 24;

        const occupiedSet = occupied || new Set();
        if (!occupied) {
            Object.values(this.iconPositions).forEach(pos => {
                if (pos && typeof pos.x === 'number') {
                    occupiedSet.add(`${Math.round(pos.x)},${Math.round(pos.y)}`);
                }
            });
        }

        const desk = this.container ? this.container.querySelector('#uwuntu-desktop') : null;
        const deskRect = desk ? desk.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight - 50 };
        const maxCols = Math.max(1, Math.floor((deskRect.width - PAD_X) / GRID_X));
        const maxRows = Math.max(1, Math.floor((deskRect.height - PAD_Y - 40) / GRID_Y));

        const targetCol = Math.max(0, Math.min(maxCols - 1, Math.round((targetX - PAD_X) / GRID_X)));
        const targetRow = Math.max(0, Math.min(maxRows - 1, Math.round((targetY - PAD_Y) / GRID_Y)));
        const targetKey = `${PAD_X + targetCol * GRID_X},${PAD_Y + targetRow * GRID_Y}`;

        if (!occupiedSet.has(targetKey)) {
            return { x: PAD_X + targetCol * GRID_X, y: PAD_Y + targetRow * GRID_Y };
        }

        let bestSlot = null;
        let bestDist = Infinity;
        const maxDist = Math.max(maxCols, maxRows, 15);

        for (let d = 1; d <= maxDist; d++) {
            for (let c = Math.max(0, targetCol - d); c <= Math.min(maxCols - 1, targetCol + d); c++) {
                for (let r = Math.max(0, targetRow - d); r <= Math.min(maxRows - 1, targetRow + d); r++) {
                    const key = `${PAD_X + c * GRID_X},${PAD_Y + r * GRID_Y}`;
                    if (!occupiedSet.has(key)) {
                        const dist = Math.hypot(c - targetCol, r - targetRow);
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestSlot = { x: PAD_X + c * GRID_X, y: PAD_Y + r * GRID_Y };
                        }
                    }
                }
            }
            if (bestSlot) return bestSlot;
        }

        return this.findNextFreeSlot(occupiedSet);
    }

    renderDesktopIcons() {
        const grid = this.container.querySelector('#uwuntu-icons-grid');
        if (!grid) return;
        grid.innerHTML = '';

        // 1. Build unified items catalog
        const items = [];

        // Papelera (Trash Bin)
        items.push({
            id: 'desktop_trash',
            type: 'trash',
            title: 'Papelera',
            icon: APP_ICONS.trash,
            accent: '#38bdf8',
            badgeText: this.trashItems.length ? String(this.trashItems.length) : null,
            onOpen: () => this.openTrashWindow()
        });

        // Workstation Tools (Filter apps that require installation from Store)
        UWUNTU_APPS.forEach(app => {
            if (app.availableYear && this.getHistoricalYear() < app.availableYear) return;
            if (app.requiresInstall && !this.installedApps.has(app.id)) {
                return;
            }
            items.push({
                id: `desktop_app_${app.id}`,
                type: 'app',
                appId: app.id,
                title: app.shortTitle || app.title,
                icon: app.icon,
                accent: app.badgeColor,
                onOpen: () => this.launchApp(app.id)
            });
        });

        // User Folders
        this.folders.forEach(folder => {
            items.push({
                id: `desktop_folder_${folder.id}`,
                type: 'folder',
                folderId: folder.id,
                title: folder.name,
                icon: APP_ICONS.folder,
                accent: '#f59e0b',
                onOpen: () => this.openFolderWindow(folder.id)
            });
        });

        // Render each item with collision-free coordinate and snap support
        const occupiedSlots = new Set();
        items.forEach((item, index) => {
            let savedPos = this.iconPositions[item.id];
            let pos = null;
            if (savedPos && typeof savedPos.x === 'number') {
                const snappedX = Math.max(24, Math.round((savedPos.x - 24) / 108) * 108 + 24);
                const snappedY = Math.max(24, Math.round((savedPos.y - 24) / 104) * 104 + 24);
                const key = `${snappedX},${snappedY}`;
                if (!occupiedSlots.has(key)) {
                    pos = { x: snappedX, y: snappedY };
                }
            }
            if (!pos) {
                pos = this.findNextFreeSlot(occupiedSlots);
            }
            this.iconPositions[item.id] = { ...pos };
            occupiedSlots.add(`${Math.round(pos.x)},${Math.round(pos.y)}`);

            const itemEl = document.createElement('div');
            itemEl.className = `uwuntu-desktop-item uwuntu-desktop-icon item-${item.type} ${this.selectedDesktopIds.has(item.id) ? 'is-selected' : ''}`;
            itemEl.id = item.id === 'desktop_trash' ? 'desktop-item-trash' : item.id;
            itemEl.dataset.itemId = item.id;
            itemEl.dataset.itemType = item.type;
            if (item.appId) itemEl.dataset.appId = item.appId;
            if (item.folderId) itemEl.dataset.folderId = item.folderId;
            itemEl.setAttribute('role', 'button');
            itemEl.setAttribute('tabindex', '0');
            itemEl.setAttribute('aria-label', item.title);

            itemEl.style.position = 'absolute';
            itemEl.style.left = `${pos.x}px`;
            itemEl.style.top = `${pos.y}px`;

            itemEl.innerHTML = `
                <div class="desktop-icon-frame" style="--app-accent: ${item.accent};">
                    <div class="icon-inner-art">${item.icon}</div>
                    <span class="icon-glare" aria-hidden="true"></span>
                    ${item.badgeText ? `<span class="icon-counter-badge">${item.badgeText}</span>` : ''}
                </div>
                <span class="desktop-icon-label">${item.title}</span>
            `;

            this.bindDesktopItemEvents(itemEl, item);
            grid.appendChild(itemEl);
        });

        localStorage.setItem('uwuntu_icon_positions', JSON.stringify(this.iconPositions));
    }

    bindDesktopItemEvents(itemEl, item) {
        let isPointerDown = false;
        let isDragging = false;
        let startClientX = 0;
        let startClientY = 0;
        let startLeft = 0;
        let startTop = 0;
        const dragOffsets = new Map();

        const onPointerMove = (e) => {
            if (!isPointerDown) return;
            const dx = e.clientX - startClientX;
            const dy = e.clientY - startClientY;

            if (!isDragging && Math.hypot(dx, dy) > 5) {
                isDragging = true;
                itemEl.classList.add('is-dragging');

                dragOffsets.clear();
                this.selectedDesktopIds.forEach(selId => {
                    const el = this.container.querySelector(`.uwuntu-desktop-item[data-item-id="${selId}"]`);
                    if (el) {
                        el.classList.add('is-dragging');
                        dragOffsets.set(selId, {
                            initX: parseFloat(el.style.left) || 0,
                            initY: parseFloat(el.style.top) || 0,
                            el
                        });
                    }
                });
            }

            if (isDragging) {
                const desk = this.container.querySelector('#uwuntu-desktop');
                const deskRect = desk ? desk.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight - 50 };

                if (dragOffsets.size > 0) {
                    dragOffsets.forEach(({ initX, initY, el }) => {
                        const nx = Math.max(10, Math.min(deskRect.width - 96, initX + dx));
                        const ny = Math.max(10, Math.min(deskRect.height - 100, initY + dy));
                        el.style.left = `${nx}px`;
                        el.style.top = `${ny}px`;
                    });
                } else {
                    const nx = Math.max(10, Math.min(deskRect.width - 96, startLeft + dx));
                    const ny = Math.max(10, Math.min(deskRect.height - 100, startTop + dy));
                    itemEl.style.left = `${nx}px`;
                    itemEl.style.top = `${ny}px`;
                }

                // Drag over trash detection
                if (item.type === 'folder') {
                    const trashEl = this.container.querySelector('#desktop-item-trash');
                    if (trashEl) {
                        const tRect = trashEl.getBoundingClientRect();
                        const isOverTrash = (
                            e.clientX >= tRect.left && e.clientX <= tRect.right &&
                            e.clientY >= tRect.top && e.clientY <= tRect.bottom
                        );
                        trashEl.classList.toggle('drop-target-active', isOverTrash);
                    }
                }
            }
        };

        const onPointerUp = (e) => {
            if (!isPointerDown) return;
            isPointerDown = false;
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);

            const trashEl = this.container.querySelector('#desktop-item-trash');
            const isDroppedOnTrash = trashEl && trashEl.classList.contains('drop-target-active');
            trashEl?.classList.remove('drop-target-active');

            if (isDragging) {
                isDragging = false;
                itemEl.classList.remove('is-dragging');
                dragOffsets.forEach(({ el }) => el.classList.remove('is-dragging'));

                if (item.type === 'folder' && isDroppedOnTrash) {
                    this.moveFolderToTrash(item.folderId);
                    return;
                }

                // Snap to nearest free slot on the 108x104 grid, preventing overlapping
                const movingIds = new Set(dragOffsets.size > 0 ? dragOffsets.keys() : [item.id]);
                const currentOccupied = new Set();
                Object.entries(this.iconPositions).forEach(([id, p]) => {
                    if (!movingIds.has(id) && p && typeof p.x === 'number') {
                        currentOccupied.add(`${Math.round(p.x)},${Math.round(p.y)}`);
                    }
                });

                const snapAndAssign = (el, id) => {
                    const curX = parseFloat(el.style.left) || 24;
                    const curY = parseFloat(el.style.top) || 24;
                    const slot = this.findNearestFreeSlot(curX, curY, currentOccupied);
                    currentOccupied.add(`${Math.round(slot.x)},${Math.round(slot.y)}`);
                    el.style.left = `${slot.x}px`;
                    el.style.top = `${slot.y}px`;
                    this.iconPositions[id] = { x: slot.x, y: slot.y };

                    if (id.startsWith('desktop_folder_')) {
                        const folderId = id.replace('desktop_folder_', '');
                        const folder = this.folders.find(f => f.id === folderId);
                        if (folder) {
                            folder.x = slot.x;
                            folder.y = slot.y;
                        }
                    }
                };

                if (dragOffsets.size > 0) {
                    dragOffsets.forEach(({ el }, id) => snapAndAssign(el, id));
                } else {
                    snapAndAssign(itemEl, item.id);
                }

                localStorage.setItem('uwuntu_icon_positions', JSON.stringify(this.iconPositions));
                localStorage.setItem('uwuntu_desktop_folders', JSON.stringify(this.folders));
            } else {
                // Click (not drag) -> open
                item.onOpen?.();
            }
        };

        itemEl.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return; // Left click only
            e.stopPropagation();

            if (!this.selectedDesktopIds.has(item.id)) {
                if (!e.shiftKey && !e.ctrlKey) {
                    this.selectedDesktopIds.clear();
                    this.container.querySelectorAll('.uwuntu-desktop-item').forEach(el => el.classList.remove('is-selected'));
                }
                this.selectedDesktopIds.add(item.id);
                itemEl.classList.add('is-selected');
            }

            isPointerDown = true;
            isDragging = false;
            startClientX = e.clientX;
            startClientY = e.clientY;
            startLeft = parseFloat(itemEl.style.left) || itemEl.offsetLeft;
            startTop = parseFloat(itemEl.style.top) || itemEl.offsetTop;

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        });

        // Folder-specific context menu on right click
        if (item.type === 'folder') {
            itemEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showContextMenu(e.clientX, e.clientY, item.folderId);
            });
        }
    }

    renderStartMenuItems(searchFilter = '', categoryFilter = 'all') {
        const grid = this.container.querySelector('#start-apps-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const filterLower = searchFilter.toLowerCase();
        const filteredApps = UWUNTU_APPS.filter(app => {
            if (app.availableYear && this.getHistoricalYear() < app.availableYear) return false;
            if (app.requiresInstall && !this.installedApps.has(app.id)) {
                return false;
            }
            const matchesCat = categoryFilter === 'all' || app.category === categoryFilter;
            const matchesSearch = !filterLower || 
                app.title.toLowerCase().includes(filterLower) || 
                app.shortTitle.toLowerCase().includes(filterLower) ||
                (app.category && app.category.toLowerCase().includes(filterLower));
            return matchesCat && matchesSearch;
        });

        if (filteredApps.length === 0) {
            grid.innerHTML = `
                <div class="start-empty-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <p>No se encontraron herramientas con «${searchFilter}»</p>
                </div>
            `;
            return;
        }

        filteredApps.forEach(app => {
            const tileBtn = document.createElement('button');
            tileBtn.type = 'button';
            tileBtn.className = 'start-app-tile';
            tileBtn.dataset.appId = app.id;
            tileBtn.setAttribute('aria-label', app.title);

            tileBtn.innerHTML = `
                <div class="start-tile-icon-box" style="--tile-accent: ${app.badgeColor};">
                    <div class="start-tile-icon">${app.icon}</div>
                </div>
                <div class="start-tile-content">
                    <strong class="start-tile-title">${app.shortTitle || app.title}</strong>
                    <span class="start-tile-cat">${app.category}</span>
                </div>
            `;

            tileBtn.addEventListener('click', () => {
                this.toggleStartMenu(false);
                this.launchApp(app.id);
            });

            grid.appendChild(tileBtn);
        });
    }

    setupEventListeners() {
        // Start button toggle
        const startBtn = this.container.querySelector('#uwuntu-start-btn');
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleStartMenu();
        });

        // Close start menu when clicking outside
        this.container.querySelector('#uwuntu-desktop').addEventListener('click', (e) => {
            if (!e.target.closest('#uwuntu-start-menu') && !e.target.closest('#uwuntu-start-btn')) {
                this.toggleStartMenu(false);
            }
        });

        // Search input and category filter in start menu
        const searchInput = this.container.querySelector('#start-menu-search-input');
        const filterPills = this.container.querySelectorAll('.start-filter-pill');

        searchInput?.addEventListener('input', (e) => {
            const activePill = this.container.querySelector('.start-filter-pill.is-active');
            const cat = activePill ? activePill.dataset.category : 'all';
            this.renderStartMenuItems(e.target.value.trim(), cat);
        });

        filterPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                filterPills.forEach(p => p.classList.remove('is-active'));
                pill.classList.add('is-active');
                const cat = pill.dataset.category;
                const searchVal = searchInput ? searchInput.value.trim() : '';
                this.renderStartMenuItems(searchVal, cat);
            });
        });

        // Exit buttons
        this.container.querySelector('#uwuntu-tray-exit-btn').addEventListener('click', () => this.close());
        this.container.querySelector('#start-power-btn').addEventListener('click', () => {
            this.toggleStartMenu(false);
            this.close();
        });

        // System update tray button
        const trayUpdateBtn = this.container.querySelector('#uwuntu-tray-update-btn');
        trayUpdateBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.launchApp('app-os-update');
        });

        // OS update balloon notification events
        const balloon = this.container.querySelector('#uwuntu-update-balloon');
        const balloonCloseBtn = this.container.querySelector('#uwuntu-balloon-close-btn');
        const balloonLaterBtn = this.container.querySelector('#uwuntu-balloon-later-btn');
        const balloonOpenBtn = this.container.querySelector('#uwuntu-balloon-open-btn');

        const dismissBalloon = () => {
            if (balloon) balloon.hidden = true;
            sessionStorage.setItem('uwuntu_os_balloon_dismissed', 'true');
        };

        balloonCloseBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissBalloon();
        });
        balloonLaterBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissBalloon();
        });
        balloonOpenBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissBalloon();
            this.launchApp('app-os-update');
        });

        // Wallpaper Controls
        this.container.querySelector('#uwuntu-wp-btn-random')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.pickRandomWallpaper(true, true);
        });

        this.container.querySelector('#uwuntu-wp-btn-gallery')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleWallpaperGallery();
        });

        this.container.querySelector('#wp-gallery-close')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleWallpaperGallery(false);
        });

        this.container.querySelector('#wp-gallery-random-now')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.pickRandomWallpaper(true, true);
        });

        this.container.querySelector('#wp-gallery-auto-random')?.addEventListener('change', (e) => {
            this.isAutoRandomWallpaper = e.target.checked;
            localStorage.setItem('uwuntu_wp_auto_random', String(this.isAutoRandomWallpaper));
            this.showWallpaperToast(this.isAutoRandomWallpaper ? 'Fondo aleatorio activado al iniciar' : 'Fondo actual fijado');
        });

        this.container.querySelector('#start-wallpaper-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleStartMenu(false);
            this.toggleWallpaperGallery(true);
        });

        // Close wallpaper gallery popover when clicking elsewhere on desktop
        this.container.querySelector('#uwuntu-desktop')?.addEventListener('click', (e) => {
            if (!e.target.closest('#uwuntu-wp-gallery-popover') && !e.target.closest('#uwuntu-wp-btn-gallery')) {
                this.toggleWallpaperGallery(false);
            }
        });

        // System Notification Toast Events
        const sysToastClose = this.container.querySelector('#sys-toast-close');
        const sysToastDismiss = this.container.querySelector('#sys-toast-dismiss');
        const sysToastOpenStore = this.container.querySelector('#sys-toast-open-store');

        sysToastClose?.addEventListener('click', () => this.dismissSystemNotification());
        sysToastDismiss?.addEventListener('click', () => this.dismissSystemNotification());
        sysToastOpenStore?.addEventListener('click', () => {
            this.dismissSystemNotification();
            this.openStore('app-vread');
        });

        // Global Keyboard Handler for OS
        window.addEventListener('keydown', (e) => {
            if (this.isOpen && e.key === 'Escape') {
                const folderDialog = this.container.querySelector('#uwuntu-folder-dialog');
                if (folderDialog && !folderDialog.hidden) {
                    this.closeFolderDialog();
                    return;
                }
                const ctxMenu = this.container.querySelector('#uwuntu-context-menu');
                if (ctxMenu && !ctxMenu.hidden) {
                    ctxMenu.hidden = true;
                    return;
                }
                const galleryPopover = this.container.querySelector('#uwuntu-wp-gallery-popover');
                if (galleryPopover && !galleryPopover.hidden) {
                    this.toggleWallpaperGallery(false);
                    return;
                }
                if (this.activeWindowId) {
                    this.closeWindow(this.activeWindowId);
                } else {
                    this.close();
                }
            } else if (this.isOpen && (e.key === 'f' || e.key === 'F')) {
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
                    this.pickRandomWallpaper(true, true);
                }
            } else if (this.isOpen && (e.key === 'n' || e.key === 'N')) {
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) && !this.activeWindowId) {
                    e.preventDefault();
                    this.openFolderDialog();
                }
            } else if (this.isOpen && (e.key === 'Delete' || e.key === 'Backspace')) {
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) && this.selectedDesktopIds.size > 0) {
                    const toDelete = [];
                    let hasSystemApp = false;
                    this.selectedDesktopIds.forEach(id => {
                        const itemEl = this.container.querySelector(`.uwuntu-desktop-item[data-item-id="${id}"]`);
                        if (itemEl?.dataset.itemType === 'folder') {
                            toDelete.push(itemEl.dataset.folderId);
                        } else if (itemEl?.dataset.itemType === 'app') {
                            hasSystemApp = true;
                        }
                    });
                    if (toDelete.length > 0) {
                        e.preventDefault();
                        toDelete.forEach(fId => this.moveFolderToTrash(fId));
                    } else if (hasSystemApp) {
                        this.showWallpaperToast('Las aplicaciones del sistema no se pueden eliminar');
                    }
                }
            } else if (!this.isOpen && (e.key === 'o' || e.key === 'O')) {
                // If not typing in input
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
                    this.open();
                }
            }
        });
    }

    // --- WALLPAPER MANAGEMENT ---

    applyInitialWallpaper() {
        if (this.isAutoRandomWallpaper || !this.savedWallpaperId) {
            this.pickRandomWallpaper(false, false);
        } else {
            this.setWallpaper(this.savedWallpaperId, false, false);
        }
    }

    pickRandomWallpaper(excludeCurrent = true, showToast = true) {
        let pool = this.wallpapers;
        if (excludeCurrent && this.currentWallpaper && pool.length > 1) {
            pool = pool.filter(w => w.id !== this.currentWallpaper.id);
        }
        const picked = pool[Math.floor(Math.random() * pool.length)] || pool[0];
        this.setWallpaper(picked.id, false, showToast);
    }

    setWallpaper(wallpaperId, saveAsFixed = true, showToast = false) {
        const wp = this.wallpapers.find(w => w.id === wallpaperId) || this.wallpapers[0];
        this.currentWallpaper = wp;

        if (saveAsFixed) {
            this.isAutoRandomWallpaper = false;
            this.savedWallpaperId = wp.id;
            localStorage.setItem('uwuntu_wp_auto_random', 'false');
            localStorage.setItem('uwuntu_wp_selected_id', wp.id);
            const autoBox = this.container.querySelector('#wp-gallery-auto-random');
            if (autoBox) autoBox.checked = false;
        }

        const imgEl = this.container.querySelector('#uwuntu-wp-image');
        if (imgEl) {
            imgEl.style.opacity = '0.3';
            imgEl.style.backgroundImage = `url("${wp.url}")`;
            requestAnimationFrame(() => {
                imgEl.style.opacity = '0.92';
            });
        }

        const labelEl = this.container.querySelector('#uwuntu-wp-active-label');
        if (labelEl) {
            labelEl.textContent = wp.name;
        }

        // Update active class in gallery
        this.container.querySelectorAll('.wp-card').forEach(card => {
            const isMatch = card.dataset.wallpaperId === wp.id;
            card.classList.toggle('is-active', isMatch);
            const checkEl = card.querySelector('.wp-card-check');
            if (checkEl) checkEl.hidden = !isMatch;
        });

        if (showToast) {
            this.showWallpaperToast(`Fondo de pantalla: ${wp.name}`);
        }
    }

    showWallpaperToast(text) {
        const toast = this.container.querySelector('#uwuntu-wp-toast');
        const textEl = this.container.querySelector('#uwuntu-wp-toast-text');
        if (!toast || !textEl) return;
        textEl.textContent = text;
        toast.hidden = false;
        toast.classList.add('is-visible');
        clearTimeout(this._wpToastTimer);
        this._wpToastTimer = setTimeout(() => {
            toast.classList.remove('is-visible');
            setTimeout(() => { toast.hidden = true; }, 300);
        }, 2200);
    }

    renderWallpaperGallery() {
        const grid = this.container.querySelector('#wp-gallery-grid');
        if (!grid) return;
        grid.innerHTML = '';

        this.wallpapers.forEach(wp => {
            const isCurrent = this.currentWallpaper && this.currentWallpaper.id === wp.id;
            const card = document.createElement('button');
            card.type = 'button';
            card.className = `wp-card ${isCurrent ? 'is-active' : ''}`;
            card.dataset.wallpaperId = wp.id;
            card.innerHTML = `
                <div class="wp-card-thumb" style="background-image: url('${wp.url}')">
                    <span class="wp-card-badge">${wp.category}</span>
                    <span class="wp-card-check" ${isCurrent ? '' : 'hidden'}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                </div>
                <div class="wp-card-info">
                    <strong class="wp-card-name">${wp.name}</strong>
                    <p class="wp-card-desc">${wp.description}</p>
                </div>
            `;
            card.addEventListener('click', () => {
                this.setWallpaper(wp.id, true, true);
                window.soundEngine?.playClick?.();
            });
            grid.appendChild(card);
        });
    }

    toggleWallpaperGallery(forceState) {
        const popover = this.container.querySelector('#uwuntu-wp-gallery-popover');
        if (!popover) return;
        const nextState = forceState !== undefined ? forceState : popover.hidden;
        popover.hidden = !nextState;
        if (nextState) {
            this.renderWallpaperGallery();
        }
    }

    toggleStartMenu(forceState) {
        const startMenu = this.container.querySelector('#uwuntu-start-menu');
        const startBtn = this.container.querySelector('#uwuntu-start-btn');
        const nextState = forceState !== undefined ? forceState : startMenu.hidden;
        startMenu.hidden = !nextState;
        startBtn.setAttribute('aria-expanded', String(nextState));
        if (nextState) {
            this.container.querySelector('#start-menu-search-input')?.focus();
        }
    }

    launchApp(appId) {
        const app = UWUNTU_APPS.find(a => a.id === appId);
        if (!app) return;
        if (app.availableYear && this.getHistoricalYear() < app.availableYear) {
            this.showWallpaperToast(`«${app.shortTitle}» estará disponible en ${app.availableYear}.`);
            return;
        }

        // If direct action (e.g. 3D Hologram toggle)
        if (app.isDirectAction && typeof app.action === 'function') {
            app.action();
            return;
        }

        // If app requires installation and is not yet installed
        if (app.requiresInstall && !this.installedApps.has(app.id)) {
            this.showWallpaperToast(`«${app.shortTitle || app.title}» no está instalada. Abriendo Store...`);
            this.openStore(app.id);
            return;
        }

        // If already open
        if (this.openWindows.has(appId)) {
            const winData = this.openWindows.get(appId);
            if (winData.isMinimized) {
                this.restoreWindow(appId);
            } else {
                this.bringToFront(appId);
            }
            app.onOpen?.(this.game, winData.winEl);
            return;
        }

        // Create new window
        this.createWindow(app);
    }

    createWindow(app) {
        const windowsContainer = this.container.querySelector('#uwuntu-windows-container');
        const tasksContainer = this.container.querySelector('#uwuntu-taskbar-tasks');

        const winEl = document.createElement('div');
        winEl.id = `uwuntu-win-${app.id}`;
        winEl.className = 'uwuntu-window active-window';
        winEl.dataset.appId = app.id;

        // Stagger position
        const count = this.openWindows.size;
        const offset = (count * 24) % 140;
        const startLeft = Math.max(20, Math.min(window.innerWidth - app.defaultWidth - 20, 80 + offset));
        const startTop = Math.max(20, Math.min(window.innerHeight - app.defaultHeight - 60, 40 + offset));

        winEl.style.width = `${Math.min(window.innerWidth - 30, app.defaultWidth)}px`;
        winEl.style.height = `${Math.min(window.innerHeight - 80, app.defaultHeight)}px`;
        winEl.style.left = `${startLeft}px`;
        winEl.style.top = `${startTop}px`;
        winEl.style.zIndex = ++this.nextZIndex;

        winEl.innerHTML = `
            <div class="uwuntu-window-titlebar">
                <div class="window-title-group">
                    <span class="window-icon" style="color: ${app.badgeColor}">${app.icon}</span>
                    <strong class="window-title-text">${app.title}</strong>
                </div>
                <div class="window-controls">
                    <button type="button" class="win-btn win-btn-minimize" aria-label="Minimizar" title="Minimizar">—</button>
                    <button type="button" class="win-btn win-btn-maximize" aria-label="Maximizar" title="Maximizar / Restaurar">□</button>
                    <button type="button" class="win-btn win-btn-close" aria-label="Cerrar" title="Cerrar">✕</button>
                </div>
            </div>
            <div class="uwuntu-window-body" id="body-${app.id}"></div>
        `;

        // Taskbar Tab
        const taskTab = document.createElement('button');
        taskTab.type = 'button';
        taskTab.className = 'taskbar-tab active';
        taskTab.dataset.appId = app.id;
        taskTab.innerHTML = `
            <span class="task-icon">${app.icon}</span>
            <span class="task-title">${app.shortTitle || app.title}</span>
        `;

        // Mount modal window or custom content
        const bodyEl = winEl.querySelector(`#body-${app.id}`);
        if (app.modalId) {
            const modalBackdrop = document.getElementById(app.modalId);
            const modalWindow = modalBackdrop?.querySelector('.modal-window');
            if (modalWindow) {
                // Ensure modal is attached into window body
                bodyEl.appendChild(modalWindow);
                // Also hide the close button of the inner modal if titlebar close handles it
                const innerClose = modalWindow.querySelector('.modal-close');
                if (innerClose) {
                    innerClose.style.display = 'none';
                }
                modalBackdrop.style.display = 'none';
            }
        } else if (app.isCustomApp && typeof app.renderContent === 'function') {
            app.renderContent(bodyEl, this.game, this);
        }

        // Setup Window Events
        this.setupWindowInteractions(winEl, app);

        // Taskbar tab click
        taskTab.addEventListener('click', () => {
            const winData = this.openWindows.get(app.id);
            if (!winData) return;
            if (winData.isMinimized) {
                this.restoreWindow(app.id);
            } else if (this.activeWindowId === app.id) {
                this.minimizeWindow(app.id);
            } else {
                this.bringToFront(app.id);
            }
        });

        // Save reference
        const winRecord = {
            winEl,
            taskTab,
            app,
            isMinimized: false,
            isMaximized: false
        };

        this.openWindows.set(app.id, winRecord);
        windowsContainer.appendChild(winEl);
        tasksContainer.appendChild(taskTab);

        this.bringToFront(app.id);

        // Run onOpen hook
        app.onOpen?.(this.game, winEl);
    }

    setupWindowInteractions(winEl, app) {
        const titlebar = winEl.querySelector('.uwuntu-window-titlebar');
        const minBtn = winEl.querySelector('.win-btn-minimize');
        const maxBtn = winEl.querySelector('.win-btn-maximize');
        const closeBtn = winEl.querySelector('.win-btn-close');

        // Click brings to front
        winEl.addEventListener('pointerdown', () => {
            this.bringToFront(app.id);
        });

        minBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimizeWindow(app.id);
        });

        maxBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMaximize(app.id);
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(app.id);
        });

        // Draggable Titlebar Logic
        let isDragging = false;
        let startX, startY, origLeft, origTop;

        titlebar.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.win-btn')) return;
            const winData = this.openWindows.get(app.id);
            if (winData?.isMaximized) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            origLeft = winEl.offsetLeft;
            origTop = winEl.offsetTop;
            winEl.classList.add('is-dragging');
            titlebar.setPointerCapture(e.pointerId);
        });

        titlebar.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const newLeft = Math.max(10, Math.min(window.innerWidth - 100, origLeft + dx));
            const newTop = Math.max(10, Math.min(window.innerHeight - 60, origTop + dy));
            winEl.style.left = `${newLeft}px`;
            winEl.style.top = `${newTop}px`;
        });

        const stopDrag = (e) => {
            if (isDragging) {
                isDragging = false;
                winEl.classList.remove('is-dragging');
                try { titlebar.releasePointerCapture(e.pointerId); } catch {}
            }
        };

        titlebar.addEventListener('pointerup', stopDrag);
        titlebar.addEventListener('pointercancel', stopDrag);
    }

    bringToFront(appId) {
        const winData = this.openWindows.get(appId);
        if (!winData) return;

        this.activeWindowId = appId;
        winData.winEl.style.zIndex = ++this.nextZIndex;

        // Update active classes
        this.openWindows.forEach((item, id) => {
            const isActive = id === appId;
            item.winEl.classList.toggle('active-window', isActive);
            item.taskTab.classList.toggle('active', isActive);
        });
    }

    minimizeWindow(appId) {
        const winData = this.openWindows.get(appId);
        if (!winData) return;

        winData.isMinimized = true;
        winData.winEl.classList.add('is-minimized');
        winData.winEl.classList.remove('active-window');
        winData.taskTab.classList.remove('active');
        winData.taskTab.classList.add('minimized');

        // Focus next window
        if (this.activeWindowId === appId) {
            const remaining = Array.from(this.openWindows.entries())
                .filter(([id, d]) => id !== appId && !d.isMinimized)
                .sort((a, b) => Number(a[1].winEl.style.zIndex) - Number(b[1].winEl.style.zIndex));

            if (remaining.length) {
                this.bringToFront(remaining[remaining.length - 1][0]);
            } else {
                this.activeWindowId = null;
            }
        }
    }

    restoreWindow(appId) {
        const winData = this.openWindows.get(appId);
        if (!winData) return;

        winData.isMinimized = false;
        winData.winEl.classList.remove('is-minimized');
        winData.taskTab.classList.remove('minimized');
        this.bringToFront(appId);
    }

    toggleMaximize(appId) {
        const winData = this.openWindows.get(appId);
        if (!winData) return;

        winData.isMaximized = !winData.isMaximized;
        winData.winEl.classList.toggle('is-maximized', winData.isMaximized);
    }

    closeWindow(appId) {
        const winData = this.openWindows.get(appId);
        if (!winData) return;

        const { winEl, taskTab, app } = winData;

        // If modal was mounted into window, return it back to its original backdrop
        if (app.modalId) {
            const modalBackdrop = document.getElementById(app.modalId);
            const modalWindow = winEl.querySelector('.modal-window');
            if (modalBackdrop && modalWindow) {
                const innerClose = modalWindow.querySelector('.modal-close');
                if (innerClose) innerClose.style.display = '';
                modalBackdrop.appendChild(modalWindow);
                modalBackdrop.style.display = 'none';
                modalBackdrop.classList.remove('active');
            }
        }

        winEl.remove();
        taskTab.remove();
        this.openWindows.delete(appId);

        if (this.activeWindowId === appId) {
            const remaining = Array.from(this.openWindows.entries())
                .filter(([, d]) => !d.isMinimized)
                .sort((a, b) => Number(a[1].winEl.style.zIndex) - Number(b[1].winEl.style.zIndex));

            if (remaining.length) {
                this.bringToFront(remaining[remaining.length - 1][0]);
            } else {
                this.activeWindowId = null;
            }
        }
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.container.hidden = false;
        this.container.classList.add('is-open');

        // Refresh era theme on open
        this.syncEraTheme();

        // Check for eligible store app notifications
        this.checkSystemNotifications();

        // Pick random wallpaper if enabled
        if (this.isAutoRandomWallpaper) {
            this.pickRandomWallpaper(true, false);
        }

        // Pause/adjust camera orbit controls
        if (this.world && this.world.controls) {
            this.world.controls.enabled = false;
        }

        // Sound feedback
        window.soundEngine?.playClick?.();
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.toggleStartMenu(false);
        this.container.classList.remove('is-open');
        setTimeout(() => {
            if (!this.isOpen) this.container.hidden = true;
        }, 300);

        // Restore camera and 3D orbit controls
        if (this.world) {
            if (this.world.controls) this.world.controls.enabled = true;
            if (this.world.returnFromComputer) {
                this.world.returnFromComputer();
            } else if (this.world.camera && this.world.cameraOfficePos) {
                this.world.targetCamPos = this.world.cameraOfficePos.clone();
                this.world.targetLookAt = new (this.world.THREE || window.THREE).Vector3(0, 1.0, 0);
            }
        }

        window.soundEngine?.playClick?.();
    }

    syncEraTheme() {
        const era = getEraForYear(this.getHistoricalYear());
        if (this.currentEra.id !== era.id) {
            this.container.classList.remove(this.currentEra.className);
            this.currentEra = era;
            this.container.classList.add(era.className);

            const vLabel = this.container.querySelector('#uwuntu-os-version-label');
            if (vLabel) vLabel.textContent = era.versionName;
            const sLabel = this.container.querySelector('#uwuntu-os-subtitle-label');
            if (sLabel) sLabel.textContent = era.brandSubtitle;
            const startLabel = this.container.querySelector('#uwuntu-start-label');
            if (startLabel) startLabel.textContent = era.startLabel;
        }

        const trayYear = this.container.querySelector('#uwuntu-tray-year');
        if (trayYear) trayYear.textContent = this.getHistoricalYear();

        const studioName = this.container.querySelector('#start-menu-studio-name');
        if (studioName) studioName.textContent = this.game.companyName || 'Dev Studio';
        syncStudioAvatars(this.container, this.game.companyLogo);

        const officeName = this.container.querySelector('#start-menu-office-name');
        if (officeName) officeName.textContent = this.game.getActiveOffice?.().name || 'Garaje';

        // Sync OS Update status in tray & balloon
        const hasOSUpdate = this.isOSUpdateAvailable();
        const trayUpdateBtn = this.container.querySelector('#uwuntu-tray-update-btn');
        const trayUpdateBadge = this.container.querySelector('#uwuntu-tray-update-badge');
        if (trayUpdateBtn) {
            trayUpdateBtn.classList.toggle('has-update', hasOSUpdate);
            trayUpdateBtn.title = hasOSUpdate
                ? 'Actualización de sistema disponible: Uwuntu XD 2006 Crystal Aero'
                : 'Sistema al día: Uwuntu XD 2006 Crystal Aero';
        }
        if (trayUpdateBadge) {
            trayUpdateBadge.hidden = !hasOSUpdate;
        }

        const balloon = this.container.querySelector('#uwuntu-update-balloon');
        if (balloon) {
            const balloonDismissed = sessionStorage.getItem('uwuntu_os_balloon_dismissed') === 'true';
            if (hasOSUpdate && !balloonDismissed && !this.is2006Updated) {
                balloon.hidden = false;
            } else {
                balloon.hidden = true;
            }
        }
    }

    checkSystemNotifications() {
        const toast = this.container.querySelector('#uwuntu-system-notification');
        if (!toast) return;

        // Condition for Vread to be available:
        // historical year >= 1990 OR game has >= 1 released games OR forced unlock
        const year = this.getHistoricalYear();
        const hasReleasedGame = this.game.gamesHistory && this.game.gamesHistory.length > 0;
        const isEligible = year >= 1990 || hasReleasedGame || localStorage.getItem('uwuntu_force_vread_unlock') === 'true';

        const isAlreadyInstalled = this.installedApps.has('app-vread');

        if (isEligible && !isAlreadyInstalled && !this.vreadNotificationDismissed) {
            toast.hidden = false;
            toast.classList.add('is-visible');
        } else {
            toast.classList.remove('is-visible');
            toast.hidden = true;
        }
    }

    dismissSystemNotification() {
        const toast = this.container.querySelector('#uwuntu-system-notification');
        if (toast) {
            toast.classList.remove('is-visible');
            setTimeout(() => { toast.hidden = true; }, 300);
        }
        this.vreadNotificationDismissed = true;
        sessionStorage.setItem('uwuntu_vread_dismissed', 'true');
    }

    executeOSUpdate(onDone) {
        const overlay = this.container.querySelector('#uwuntu-reboot-overlay');
        const title = this.container.querySelector('#uwuntu-reboot-title');
        const desc = this.container.querySelector('#uwuntu-reboot-desc');

        if (overlay) {
            overlay.hidden = false;
            overlay.classList.add('is-visible');
        }

        if (window.soundEngine && typeof window.soundEngine.playLevelUp === 'function') {
            window.soundEngine.playLevelUp();
        }

        setTimeout(() => {
            if (title) title.textContent = 'Iniciando Uwuntu XD 2006...';
            if (desc) desc.textContent = 'Cargando interfaz ultranítida Crystal Aero';
        }, 850);

        setTimeout(() => {
            this.is2006Updated = true;
            if (this.game) this.game.osUpdated2006 = true;
            localStorage.setItem('uwuntu_os_updated_2006', 'true');
            this.container.classList.add('os-updated-2006');

            // Update tray
            const updateBtn = this.container.querySelector('#uwuntu-tray-update-btn');
            const updateBadge = this.container.querySelector('#uwuntu-tray-update-badge');
            if (updateBtn) {
                updateBtn.classList.remove('has-update');
                updateBtn.title = 'Sistema al día: Uwuntu XD 2006 Crystal Aero';
            }
            if (updateBadge) updateBadge.hidden = true;

            const balloon = this.container.querySelector('#uwuntu-update-balloon');
            if (balloon) balloon.hidden = true;

            // Fade overlay out
            if (overlay) {
                overlay.classList.remove('is-visible');
                setTimeout(() => { overlay.hidden = true; }, 400);
            }

            window.showToast?.('[[DE_ICON_073]] ¡Sistema Operativo actualizado con éxito a Uwuntu XD 2006 Crystal Aero!', 'success');

            if (typeof onDone === 'function') onDone();
        }, 1700);
    }

    installApp(appId, onComplete) {
        const app = UWUNTU_APPS.find(item => item.id === appId);
        if (app?.availableYear && this.getHistoricalYear() < app.availableYear) {
            this.showWallpaperToast(`«${app.shortTitle}» estará disponible en ${app.availableYear}.`);
            onComplete?.();
            return;
        }
        this.installedApps.add(appId);
        localStorage.setItem('uwuntu_installed_apps', JSON.stringify(Array.from(this.installedApps)));

        // If Vread was installed, dismiss notification balloon
        if (appId === 'app-vread') {
            this.dismissSystemNotification();
        }

        this.renderDesktopIcons();
        this.renderStartMenuItems();
        this.showWallpaperToast('¡Aplicación instalada con éxito en el escritorio!');
        window.soundEngine?.playClick?.();
        onComplete?.();
    }

    uninstallApp(appId, onComplete) {
        this.installedApps.delete(appId);
        localStorage.setItem('uwuntu_installed_apps', JSON.stringify(Array.from(this.installedApps)));

        if (this.openWindows.has(appId)) {
            this.closeWindow(appId);
        }

        this.renderDesktopIcons();
        this.renderStartMenuItems();
        this.showWallpaperToast('Aplicación desinstalada');
        window.soundEngine?.playClick?.();
        onComplete?.();
    }

    openStore(focusAppId = null) {
        this.open();
        this.launchApp('app-store');
        if (focusAppId) {
            setTimeout(() => {
                const card = this.container.querySelector(`.store-app-card[data-app-id="${focusAppId}"]`);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.classList.add('is-highlighted');
                    setTimeout(() => card.classList.remove('is-highlighted'), 2500);
                }
            }, 300);
        }
    }

    subscribeToGame() {
        const handler = () => {
            if (this.isOpen) {
                this.syncEraTheme();
                this.container.querySelector('#body-app-vread')?._refreshVreadForWeek?.();
                this.checkSystemNotifications();
                // Random subtle LED blink on activity
                const led = this.container.querySelector('#uwuntu-disk-led');
                if (led && Math.random() < 0.3) {
                    led.classList.add('blink');
                    setTimeout(() => led.classList.remove('blink'), 200);
                }
            }
        };

        if (typeof this.game.onStateChange === 'function') {
            this.game.onStateChange(handler);
        } else if (typeof this.game.subscribe === 'function') {
            this.game.subscribe(handler);
        }
    }

    // Direct Bridge API Methods for backwards-compatibility
    openApp(appId) {
        this.open();
        this.launchApp(appId);
    }

    openSales() {
        if (this.isOpen) this.close();
        window.openSalesPanel?.();
    }
    isSalesOpen() {
        return Boolean(document.getElementById('modal-history')?.classList.contains('active'));
    }
    openMarketing() { this.openApp('app-marketing'); }
    openArchitecture() { this.openApp('app-architecture'); }
    isArchitectureOpen() { return this.openWindows.has('app-architecture') && !this.openWindows.get('app-architecture').isMinimized; }
    openPersonnel() {
        if (this.isOpen) this.close();
        window.openPersonnelPanel?.();
    }
    isPersonnelOpen() {
        return Boolean(document.getElementById('modal-hire')?.classList.contains('active'));
    }
    openIP() { this.openApp('app-ip'); }
    openOffices() { this.openApp('app-offices'); }
    openRivals() { this.openApp('app-rivals'); }
    openWorkshop() { this.openApp('app-workshop'); }
    openStudio() { this.openApp('app-studio'); }
    openVread() { this.openApp('app-vread'); }
    openGuide() { this.openApp('app-guide'); }
    openAdmin() { this.openApp('app-admin'); }
    returnHome() { this.close(); }
    detachStudioModal() {}
    refreshMarketing() {
        if (this.openWindows.has('app-marketing')) {
            window.renderMarketingHub?.();
        }
    }

    // --- DESKTOP INTERACTIVITY: MARQUEE SELECTION, CONTEXT MENU & MODALS ---

    setupDesktopInteractions() {
        const desktop = this.container.querySelector('#uwuntu-desktop');
        const marquee = this.container.querySelector('#uwuntu-selection-marquee');
        const ctxMenu = this.container.querySelector('#uwuntu-context-menu');
        const folderDialog = this.container.querySelector('#uwuntu-folder-dialog');

        let isSelecting = false;
        let startX = 0;
        let startY = 0;

        const onMarqueeMove = (e) => {
            if (!isSelecting) return;
            const currentX = e.clientX;
            const currentY = e.clientY;
            const deskRect = desktop.getBoundingClientRect();

            const x1 = Math.max(0, Math.min(deskRect.width, Math.min(startX, currentX) - deskRect.left));
            const y1 = Math.max(0, Math.min(deskRect.height, Math.min(startY, currentY) - deskRect.top));
            const x2 = Math.max(0, Math.min(deskRect.width, Math.max(startX, currentX) - deskRect.left));
            const y2 = Math.max(0, Math.min(deskRect.height, Math.max(startY, currentY) - deskRect.top));

            const w = x2 - x1;
            const h = y2 - y1;

            if (w > 4 || h > 4) {
                marquee.hidden = false;
                marquee.style.left = `${x1}px`;
                marquee.style.top = `${y1}px`;
                marquee.style.width = `${w}px`;
                marquee.style.height = `${h}px`;

                const mRect = {
                    left: deskRect.left + x1,
                    top: deskRect.top + y1,
                    right: deskRect.left + x2,
                    bottom: deskRect.top + y2
                };

                const items = this.container.querySelectorAll('.uwuntu-desktop-item');
                items.forEach(itemEl => {
                    const iRect = itemEl.getBoundingClientRect();
                    const intersects = (
                        iRect.left < mRect.right &&
                        iRect.right > mRect.left &&
                        iRect.top < mRect.bottom &&
                        iRect.bottom > mRect.top
                    );

                    const itemId = itemEl.dataset.itemId;
                    if (intersects) {
                        this.selectedDesktopIds.add(itemId);
                        itemEl.classList.add('is-selected');
                    } else if (!e.shiftKey && !e.ctrlKey) {
                        this.selectedDesktopIds.delete(itemId);
                        itemEl.classList.remove('is-selected');
                    }
                });
            }
        };

        const onMarqueeUp = () => {
            if (isSelecting) {
                isSelecting = false;
                marquee.hidden = true;
                marquee.style.width = '0px';
                marquee.style.height = '0px';
                window.removeEventListener('pointermove', onMarqueeMove);
                window.removeEventListener('pointerup', onMarqueeUp);
            }
        };

        desktop.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return; // Left click only
            if (
                e.target.closest('.uwuntu-desktop-item') ||
                e.target.closest('.uwuntu-window') ||
                e.target.closest('.uwuntu-context-menu') ||
                e.target.closest('.uwuntu-modal-dialog') ||
                e.target.closest('.uwuntu-wp-gallery-popover') ||
                e.target.closest('.uwuntu-start-menu') ||
                e.target.closest('.uwuntu-wp-controls')
            ) {
                return;
            }

            // Close context menu & popovers
            if (ctxMenu) ctxMenu.hidden = true;
            this.toggleStartMenu(false);
            this.toggleWallpaperGallery(false);

            if (!e.shiftKey && !e.ctrlKey) {
                this.selectedDesktopIds.clear();
                this.container.querySelectorAll('.uwuntu-desktop-item').forEach(el => el.classList.remove('is-selected'));
            }

            isSelecting = true;
            startX = e.clientX;
            startY = e.clientY;

            window.addEventListener('pointermove', onMarqueeMove);
            window.addEventListener('pointerup', onMarqueeUp);
        });

        // Desktop right-click context menu
        desktop.addEventListener('contextmenu', (e) => {
            if (
                e.target.closest('.uwuntu-window') ||
                e.target.closest('.uwuntu-modal-dialog') ||
                e.target.closest('.uwuntu-wp-gallery-popover') ||
                e.target.closest('.uwuntu-start-menu')
            ) {
                return;
            }

            const folderItem = e.target.closest('.uwuntu-desktop-item[data-item-type="folder"]');
            if (folderItem) {
                e.preventDefault();
                this.showContextMenu(e.clientX, e.clientY, folderItem.dataset.folderId);
                return;
            }

            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY, null);
        });

        // Context menu click delegation
        ctxMenu?.addEventListener('click', (e) => {
            const itemBtn = e.target.closest('.ctx-item');
            if (!itemBtn) return;
            const action = itemBtn.dataset.action;
            const targetFolderId = ctxMenu.dataset.folderId;
            ctxMenu.hidden = true;

            switch (action) {
                case 'new-folder':
                    this.openFolderDialog();
                    break;
                case 'auto-arrange':
                    this.autoArrangeDesktopIcons();
                    break;
                case 'open-wallpapers':
                    this.toggleWallpaperGallery(true);
                    break;
                case 'random-wallpaper':
                    this.pickRandomWallpaper(true, true);
                    break;
                case 'open-trash':
                    this.openTrashWindow();
                    break;
                case 'empty-trash':
                    this.emptyTrash();
                    break;
                case 'open-folder':
                    if (targetFolderId) this.openFolderWindow(targetFolderId);
                    break;
                case 'rename-folder':
                    if (targetFolderId) this.openFolderDialog(targetFolderId);
                    break;
                case 'trash-folder':
                    if (targetFolderId) this.moveFolderToTrash(targetFolderId);
                    break;
                case 'exit-pc':
                    this.close();
                    break;
            }
        });

        // Folder Dialog button events
        const closeDialogBtn = folderDialog?.querySelector('#uwuntu-folder-close');
        const cancelDialogBtn = folderDialog?.querySelector('#uwuntu-folder-cancel');
        const confirmDialogBtn = folderDialog?.querySelector('#uwuntu-folder-confirm');
        const dialogInput = folderDialog?.querySelector('#uwuntu-folder-input');

        closeDialogBtn?.addEventListener('click', () => this.closeFolderDialog());
        cancelDialogBtn?.addEventListener('click', () => this.closeFolderDialog());
        confirmDialogBtn?.addEventListener('click', () => this.submitFolderDialog());

        dialogInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.submitFolderDialog();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.closeFolderDialog();
            }
        });
    }

    showContextMenu(clientX, clientY, folderId = null) {
        const ctxMenu = this.container.querySelector('#uwuntu-context-menu');
        if (!ctxMenu) return;

        ctxMenu.dataset.folderId = folderId || '';

        if (folderId) {
            const folder = this.folders.find(f => f.id === folderId);
            const folderName = folder ? folder.name : 'Carpeta';
            ctxMenu.innerHTML = `
                <div class="ctx-header">
                    <span class="ctx-header-title">${folderName}</span>
                </div>
                <button type="button" class="ctx-item" data-action="open-folder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8a2 2 0 0 1 2-2h6l3 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/></svg>
                    <span>Abrir Carpeta</span>
                </button>
                <button type="button" class="ctx-item" data-action="rename-folder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    <span>Renombrar</span>
                </button>
                <div class="ctx-divider"></div>
                <button type="button" class="ctx-item ctx-danger" data-action="trash-folder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    <span>Mover a la Papelera</span>
                </button>
            `;
        } else {
            ctxMenu.innerHTML = `
                <button type="button" class="ctx-item" data-action="new-folder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8a2 2 0 0 1 2-2h6l3 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    <span>Nueva Carpeta (N)</span>
                </button>
                <button type="button" class="ctx-item" data-action="auto-arrange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    <span>Organizar Iconos</span>
                </button>
                <div class="ctx-divider"></div>
                <button type="button" class="ctx-item" data-action="open-wallpapers">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    <span>Cambiar Fondo (F)</span>
                </button>
                <button type="button" class="ctx-item" data-action="random-wallpaper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
                    <span>Fondo Aleatorio</span>
                </button>
                <div class="ctx-divider"></div>
                <button type="button" class="ctx-item" data-action="open-trash">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    <span>Abrir Papelera</span>
                </button>
                <button type="button" class="ctx-item" data-action="empty-trash">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    <span>Vaciar Papelera</span>
                </button>
                <div class="ctx-divider"></div>
                <button type="button" class="ctx-item ctx-exit" data-action="exit-pc">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    <span>Salir a la Oficina</span>
                </button>
            `;
        }

        ctxMenu.hidden = false;
        const menuWidth = 200;
        const menuHeight = ctxMenu.offsetHeight || 220;
        const posX = Math.max(10, Math.min(window.innerWidth - menuWidth - 10, clientX));
        const posY = Math.max(10, Math.min(window.innerHeight - menuHeight - 50, clientY));
        ctxMenu.style.left = `${posX}px`;
        ctxMenu.style.top = `${posY}px`;
    }

    openFolderDialog(folderId = null) {
        this.folderDialogTargetId = folderId;
        const dialog = this.container.querySelector('#uwuntu-folder-dialog');
        const titleEl = this.container.querySelector('#uwuntu-folder-dialog-title');
        const inputEl = this.container.querySelector('#uwuntu-folder-input');
        const confirmBtn = this.container.querySelector('#uwuntu-folder-confirm');

        if (!dialog || !inputEl) return;

        if (folderId) {
            const folder = this.folders.find(f => f.id === folderId);
            if (titleEl) titleEl.textContent = 'Renombrar Carpeta';
            if (confirmBtn) confirmBtn.textContent = 'Actualizar Nombre';
            inputEl.value = folder ? folder.name : 'Carpeta';
        } else {
            if (titleEl) titleEl.textContent = 'Nueva Carpeta';
            if (confirmBtn) confirmBtn.textContent = 'Guardar Carpeta';
            const num = this.folders.length + 1;
            inputEl.value = `Carpeta ${num}`;
        }

        dialog.hidden = false;
        requestAnimationFrame(() => {
            inputEl.focus();
            inputEl.select();
        });
    }

    closeFolderDialog() {
        const dialog = this.container.querySelector('#uwuntu-folder-dialog');
        if (dialog) dialog.hidden = true;
        this.folderDialogTargetId = null;
    }

    submitFolderDialog() {
        const inputEl = this.container.querySelector('#uwuntu-folder-input');
        const name = inputEl ? inputEl.value.trim() : '';
        const finalName = name || (this.folderDialogTargetId ? 'Carpeta' : `Carpeta ${this.folders.length + 1}`);

        if (this.folderDialogTargetId) {
            const folder = this.folders.find(f => f.id === this.folderDialogTargetId);
            if (folder) {
                folder.name = finalName;
                this.showWallpaperToast(`Carpeta renombrada: ${finalName}`);
                // Update open window if any
                const winData = this.openWindows.get(`folder_${folder.id}`);
                if (winData) {
                    const titleText = winData.winEl.querySelector('.window-title-text');
                    if (titleText) titleText.textContent = finalName;
                    const crumbText = winData.winEl.querySelector('.crumb-current');
                    if (crumbText) crumbText.textContent = finalName;
                }
            }
        } else {
            const slot = this.findNextFreeSlot();
            const newFolder = {
                id: `folder_${Date.now()}`,
                name: finalName,
                x: slot.x,
                y: slot.y,
                files: [
                    { name: 'Notas_Proyecto.txt', text: `Documento de planificación creado en ${finalName}.` }
                ]
            };
            this.folders.push(newFolder);
            this.iconPositions[`desktop_folder_${newFolder.id}`] = { x: slot.x, y: slot.y };
            this.showWallpaperToast(`Carpeta creada: ${finalName}`);
        }

        localStorage.setItem('uwuntu_desktop_folders', JSON.stringify(this.folders));
        localStorage.setItem('uwuntu_icon_positions', JSON.stringify(this.iconPositions));
        this.renderDesktopIcons();
        this.closeFolderDialog();
        window.soundEngine?.playClick?.();
    }

    moveFolderToTrash(folderId) {
        const idx = this.folders.findIndex(f => f.id === folderId);
        if (idx === -1) return;

        const [folder] = this.folders.splice(idx, 1);
        this.trashItems.push({
            ...folder,
            deletedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        delete this.iconPositions[`desktop_folder_${folder.id}`];

        localStorage.setItem('uwuntu_desktop_folders', JSON.stringify(this.folders));
        localStorage.setItem('uwuntu_trash_items', JSON.stringify(this.trashItems));
        localStorage.setItem('uwuntu_icon_positions', JSON.stringify(this.iconPositions));

        this.renderDesktopIcons();

        if (this.openWindows.has(`folder_${folderId}`)) {
            this.closeWindow(`folder_${folderId}`);
        }

        if (this.openWindows.has('app-trash')) {
            const winData = this.openWindows.get('app-trash');
            const bodyEl = winData?.winEl.querySelector('#body-app-trash');
            if (bodyEl) this.renderTrashWindowBody(bodyEl);
        }

        this.showWallpaperToast(`«${folder.name}» movida a la papelera`);
        window.soundEngine?.playClick?.();
    }

    emptyTrash() {
        if (this.trashItems.length === 0) {
            this.showWallpaperToast('La papelera ya está vacía');
            return;
        }
        const count = this.trashItems.length;
        this.trashItems = [];
        localStorage.setItem('uwuntu_trash_items', '[]');
        this.renderDesktopIcons();

        if (this.openWindows.has('app-trash')) {
            const winData = this.openWindows.get('app-trash');
            const bodyEl = winData?.winEl.querySelector('#body-app-trash');
            if (bodyEl) this.renderTrashWindowBody(bodyEl);
        }

        this.showWallpaperToast(`Papelera vaciada (${count} elemento${count > 1 ? 's' : ''})`);
        window.soundEngine?.playClick?.();
    }

    restoreTrashItem(itemId) {
        const idx = this.trashItems.findIndex(item => item.id === itemId);
        if (idx === -1) return;

        const [item] = this.trashItems.splice(idx, 1);
        const slot = this.findNextFreeSlot();
        item.x = slot.x;
        item.y = slot.y;
        delete item.deletedAt;

        this.folders.push(item);
        this.iconPositions[`desktop_folder_${item.id}`] = { x: slot.x, y: slot.y };

        localStorage.setItem('uwuntu_desktop_folders', JSON.stringify(this.folders));
        localStorage.setItem('uwuntu_trash_items', JSON.stringify(this.trashItems));
        localStorage.setItem('uwuntu_icon_positions', JSON.stringify(this.iconPositions));

        this.renderDesktopIcons();

        if (this.openWindows.has('app-trash')) {
            const winData = this.openWindows.get('app-trash');
            const bodyEl = winData?.winEl.querySelector('#body-app-trash');
            if (bodyEl) this.renderTrashWindowBody(bodyEl);
        }

        this.showWallpaperToast(`«${item.name}» restaurada al escritorio`);
        window.soundEngine?.playClick?.();
    }

    autoArrangeDesktopIcons() {
        const items = this.container.querySelectorAll('.uwuntu-desktop-item');
        items.forEach((itemEl, index) => {
            const id = itemEl.dataset.itemId;
            const pos = this.getDefaultSlotPosition(index);
            itemEl.style.left = `${pos.x}px`;
            itemEl.style.top = `${pos.y}px`;
            this.iconPositions[id] = { ...pos };
        });
        localStorage.setItem('uwuntu_icon_positions', JSON.stringify(this.iconPositions));
        this.showWallpaperToast('Iconos organizados en cuadrícula');
        window.soundEngine?.playClick?.();
    }

    openTrashWindow() {
        const appId = 'app-trash';
        if (this.openWindows.has(appId)) {
            const winData = this.openWindows.get(appId);
            if (winData.isMinimized) this.restoreWindow(appId);
            else this.bringToFront(appId);
            const bodyEl = winData.winEl.querySelector(`#body-${appId}`);
            if (bodyEl) this.renderTrashWindowBody(bodyEl);
            return;
        }

        const trashApp = {
            id: appId,
            title: 'Papelera de Reciclaje',
            shortTitle: 'Papelera',
            icon: APP_ICONS.trash,
            badgeColor: '#38bdf8',
            defaultWidth: 720,
            defaultHeight: 480,
            isCustomApp: true,
            renderContent: (bodyEl) => {
                this.renderTrashWindowBody(bodyEl);
            }
        };

        this.createWindow(trashApp);
    }

    renderTrashWindowBody(bodyEl) {
        const isEmpty = this.trashItems.length === 0;
        bodyEl.innerHTML = `
            <div class="trash-window-view">
                <header class="trash-toolbar">
                    <div class="trash-toolbar-left">
                        <button type="button" class="trash-tool-btn danger" id="trash-empty-btn" ${isEmpty ? 'disabled' : ''}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            <span>Vaciar papelera</span>
                        </button>
                        <button type="button" class="trash-tool-btn" id="trash-restore-all-btn" ${isEmpty ? 'disabled' : ''}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                            <span>Restaurar todo</span>
                        </button>
                    </div>
                    <div class="trash-toolbar-status">
                        <span>${isEmpty ? '0 elementos' : `${this.trashItems.length} elemento${this.trashItems.length > 1 ? 's' : ''}`}</span>
                    </div>
                </header>
                <div class="trash-content">
                    ${isEmpty ? `
                        <div class="trash-empty-state">
                            <div class="trash-empty-icon">${APP_ICONS.trash}</div>
                            <h3>La papelera está vacía</h3>
                            <p>Los archivos y carpetas que arrastres o envíes a la papelera aparecerán aquí.</p>
                        </div>
                    ` : `
                        <div class="trash-items-table">
                            <div class="trash-table-header">
                                <span class="col-name">Nombre</span>
                                <span class="col-type">Tipo</span>
                                <span class="col-date">Eliminado</span>
                                <span class="col-actions">Acción</span>
                            </div>
                            <div class="trash-table-body">
                                ${this.trashItems.map(item => `
                                    <div class="trash-table-row" data-item-id="${item.id}">
                                        <div class="col-name">
                                            <span class="row-icon">${APP_ICONS.folder}</span>
                                            <strong>${item.name}</strong>
                                        </div>
                                        <div class="col-type">Carpeta de usuario</div>
                                        <div class="col-date">${item.deletedAt || 'Reciente'}</div>
                                        <div class="col-actions">
                                            <button type="button" class="trash-restore-single-btn" data-restore-id="${item.id}">
                                                Restaurar
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;

        bodyEl.querySelector('#trash-empty-btn')?.addEventListener('click', () => this.emptyTrash());
        bodyEl.querySelector('#trash-restore-all-btn')?.addEventListener('click', () => {
            const ids = this.trashItems.map(t => t.id);
            ids.forEach(id => this.restoreTrashItem(id));
        });

        bodyEl.querySelectorAll('.trash-restore-single-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.restoreId;
                if (id) this.restoreTrashItem(id);
            });
        });
    }

    openFolderWindow(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;

        const winId = `folder_${folderId}`;
        if (this.openWindows.has(winId)) {
            const winData = this.openWindows.get(winId);
            if (winData.isMinimized) this.restoreWindow(winId);
            else this.bringToFront(winId);
            return;
        }

        const folderApp = {
            id: winId,
            title: folder.name,
            shortTitle: folder.name,
            icon: APP_ICONS.folder,
            badgeColor: '#f59e0b',
            defaultWidth: 680,
            defaultHeight: 460,
            isCustomApp: true,
            renderContent: (bodyEl) => {
                this.renderFolderWindowBody(bodyEl, folder);
            }
        };

        this.createWindow(folderApp);
    }

    renderFolderWindowBody(bodyEl, folder) {
        const files = folder.files || [];
        bodyEl.innerHTML = `
            <div class="folder-window-view">
                <!-- Address Bar & Toolbar -->
                <header class="folder-header-bar">
                    <div class="folder-breadcrumbs">
                        <span class="crumb-root">Uwuntu XD</span>
                        <span class="crumb-sep">/</span>
                        <span class="crumb-desktop">Escritorio</span>
                        <span class="crumb-sep">/</span>
                        <span class="crumb-current">${folder.name}</span>
                    </div>
                    <div class="folder-toolbar-actions">
                        <button type="button" class="folder-action-btn primary" id="folder-new-note-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            <span>Nueva Nota (.txt)</span>
                        </button>
                        <button type="button" class="folder-action-btn" id="folder-rename-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            <span>Renombrar</span>
                        </button>
                        <button type="button" class="folder-action-btn danger" id="folder-trash-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            <span>Papelera</span>
                        </button>
                    </div>
                </header>

                <div class="folder-body-area">
                    <div class="folder-files-grid" id="folder-files-grid">
                        ${files.length === 0 ? `
                            <div class="folder-empty-state">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                                <p>Esta carpeta no contiene archivos aún.</p>
                                <span>Haz clic en «Nueva Nota» para redactar un documento de diseño.</span>
                            </div>
                        ` : files.map((file, idx) => `
                            <div class="folder-file-tile" data-file-index="${idx}" tabindex="0">
                                <div class="file-tile-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                                </div>
                                <span class="file-tile-name">${file.name}</span>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Note Preview Pane -->
                    <div class="folder-note-viewer" id="folder-note-viewer" hidden>
                        <div class="note-viewer-header">
                            <strong class="note-viewer-title" id="note-viewer-title">Documento.txt</strong>
                            <button type="button" class="note-viewer-close" id="note-viewer-close">✕</button>
                        </div>
                        <div class="note-viewer-body" id="note-viewer-body"></div>
                    </div>
                </div>
            </div>
        `;

        bodyEl.querySelector('#folder-new-note-btn')?.addEventListener('click', () => {
            const num = (folder.files?.length || 0) + 1;
            if (!folder.files) folder.files = [];
            folder.files.push({
                name: `GDD_Nota_${num}.txt`,
                text: `Registro de diseño #${num} creado en ${new Date().toLocaleDateString()}.\nConcepto de mecánicas, diseño de niveles y afinidad de géneros.`
            });
            localStorage.setItem('uwuntu_desktop_folders', JSON.stringify(this.folders));
            this.renderFolderWindowBody(bodyEl, folder);
            this.showWallpaperToast(`Archivo añadido: GDD_Nota_${num}.txt`);
        });

        bodyEl.querySelector('#folder-rename-btn')?.addEventListener('click', () => {
            this.openFolderDialog(folder.id);
        });

        bodyEl.querySelector('#folder-trash-btn')?.addEventListener('click', () => {
            this.moveFolderToTrash(folder.id);
        });

        const noteViewer = bodyEl.querySelector('#folder-note-viewer');
        const noteTitle = bodyEl.querySelector('#note-viewer-title');
        const noteBody = bodyEl.querySelector('#note-viewer-body');
        const noteClose = bodyEl.querySelector('#note-viewer-close');

        noteClose?.addEventListener('click', () => {
            if (noteViewer) noteViewer.hidden = true;
        });

        bodyEl.querySelectorAll('.folder-file-tile').forEach(tile => {
            tile.addEventListener('click', () => {
                const idx = Number(tile.dataset.fileIndex);
                const file = folder.files[idx];
                if (file && noteViewer && noteTitle && noteBody) {
                    noteTitle.textContent = file.name;
                    noteBody.textContent = file.text;
                    noteViewer.hidden = false;
                }
            });
        });
    }
}

// 5. CUSTOM APP: VREAD SOCIAL NETWORK (TWITTER / X CLONE FOR DESKTOP)
export const VREAD_USER_AVATARS = [
    '/avatars/avatar_1.jpg', // SpeedyStreamer / streamer con auriculares RGB
    '/avatars/avatar_2.jpg', // PixelMaster_X / gamer expresivo con headset
    '/avatars/avatar_3.jpg', // RetroNerd_99 / fan retro con chaqueta synthwave y CRT
    '/avatars/avatar_4.jpg', // Clara_Dev / desarrolladora indie con gafas
    '/avatars/avatar_5.jpg', // AnalistaVideojuegos / crítico y periodista en estudio
    '/avatars/avatar_6.jpg', // Niko_Play / pro player esports
    '/avatars/avatar_7.jpg', // Lara_Quest / jugadora con pelo teñido rojo
    '/avatars/avatar_8.jpg'  // CodeDoctor / programador tech con reflejos en gafas
];

export function getVreadUserAvatar(author = '', handle = '') {
    const key = (handle || author || 'user').toLowerCase().trim();
    const knownMap = {
        'speedystreamer': '/avatars/avatar_1.jpg',
        'speedy_live': '/avatars/avatar_1.jpg',
        'pixelmaster_x': '/avatars/avatar_2.jpg',
        'pixelmaster': '/avatars/avatar_2.jpg',
        'retronerd_99': '/avatars/avatar_3.jpg',
        'retronerd': '/avatars/avatar_3.jpg',
        'clara_dev': '/avatars/avatar_4.jpg',
        'claradev': '/avatars/avatar_4.jpg',
        'indieradar': '/avatars/avatar_4.jpg',
        'alex_reviews': '/avatars/avatar_5.jpg',
        'criticosinfiltro': '/avatars/avatar_5.jpg',
        'analistavideojuegos': '/avatars/avatar_5.jpg',
        'industry_analyst': '/avatars/avatar_5.jpg',
        'niko_play': '/avatars/avatar_6.jpg',
        'kikegamer': '/avatars/avatar_6.jpg',
        'lara_quest': '/avatars/avatar_7.jpg',
        'sofi_pixel': '/avatars/avatar_7.jpg',
        'comunidadgamer': '/avatars/avatar_7.jpg',
        'comunidad_gamer': '/avatars/avatar_7.jpg',
        'codedoctor': '/avatars/avatar_8.jpg',
        'dani_byte': '/avatars/avatar_8.jpg',
        'gamervance': '/avatars/avatar_2.jpg',
        'arcadefan': '/avatars/avatar_3.jpg',
        'neogamer': '/avatars/avatar_6.jpg',
        'hatersupremo': '/avatars/avatar_6.jpg',
        'toxicgamer99': '/avatars/avatar_8.jpg',
        'hatebot3000': '/avatars/avatar_2.jpg',
        'trollmaster': '/avatars/avatar_3.jpg',
        'antifan_real': '/avatars/avatar_5.jpg',
        'refund_warrior': '/avatars/avatar_7.jpg',
        'drama_queen': '/avatars/avatar_1.jpg',
        'nerd_rabioso': '/avatars/avatar_4.jpg',
        'critico_implacable': '/avatars/avatar_5.jpg'
    };

    if (knownMap[key]) return knownMap[key];

    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
    }
    // Synthetic profiles get stable, distinct illustrations without external assets.
    const seed = hash >>> 0;
    const isEdgyHater = key.includes('hate') || key.includes('toxic') || key.includes('troll') || key.includes('anti');
    const backgrounds = isEdgyHater
        ? ['#3b0d14', '#450a0a', '#2d0f19', '#3f1022']
        : ['#274958', '#5b3d59', '#665235', '#39584c', '#3a476d', '#6a3c45'];
    const skins = ['#f2c7a3', '#c88362', '#88553f', '#e5b389', '#623e34'];
    const hair = isEdgyHater
        ? ['#1f0a0e', '#7f1d1d', '#991b1b', '#18181b']
        : ['#252328', '#633b2b', '#b96b38', '#d0ad70', '#4b335c', '#243e46'];
    const bg = backgrounds[seed % backgrounds.length];
    const skin = skins[(seed >>> 4) % skins.length];
    const hairColor = hair[(seed >>> 8) % hair.length];
    const shirt = isEdgyHater ? '#991b1b' : backgrounds[(seed >>> 12) % backgrounds.length];
    const fringe = (seed & 1) ? 'M12 19 Q14 5 25 7 Q37 6 39 19 L37 24 Q30 19 27 14 Q21 20 13 22Z' : 'M12 22 Q10 7 25 7 Q40 7 39 22 L35 17 Q25 11 15 19Z';
    const glasses = (seed & 2) ? '<path d="M15 25h8v5h-8z M27 25h8v5h-8z M23 27h4" fill="none" stroke="#1c2731" stroke-width="1.4"/>' : '';
    const haterGlow = isEdgyHater ? '<circle cx="20" cy="27" r="2.2" fill="#ef4444"/><circle cx="30" cy="27" r="2.2" fill="#ef4444"/>' : '<circle cx="20" cy="27" r="1.2" fill="#20252b"/><circle cx="30" cy="27" r="1.2" fill="#20252b"/>';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><rect width="50" height="50" fill="${bg}"/><path d="M3 50 Q5 36 18 36h14 Q45 36 47 50" fill="${shirt}"/><ellipse cx="25" cy="25" rx="12" ry="15" fill="${skin}"/><path d="${fringe}" fill="${hairColor}"/>${haterGlow}${glasses}<path d="M22 33 Q25 35 28 33" fill="none" stroke="#743f39" stroke-linecap="round"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

let currentVreadFilter = 'all';
let currentVreadTag = null;
let currentVreadSearch = '';
let currentVreadMutedHandles = new Set();

function formatVreadNumber(num) {
    const n = Number(num) || 0;
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
}

function escapeVread(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function getVreadLiveTickerItems(gameInstance) {
    const studioName = gameInstance.companyName || 'Tu Estudio';
    const trend = gameInstance.marketTrend;
    const trendTopic = trend?.topicId || trend?.topicName || 'Cyberpunk';
    const trendGenre = trend?.genreId || trend?.genreName || 'RPG';
    return [
        `TENDENCIA: #${trendTopic} bate récords de debates y ecos en redes`,
        `POLÉMICA: @hatersupremo lanza duras críticas contra los lanzamientos sin pulir`,
        `MERCADO: Los analistas pronostican gran demanda para producciones de ${trendGenre}`,
        `SALSEO: Ola de debates caldeados entre fans y haters en la comunidad`,
        `COMUNIDAD: ${studioName} monitoriza las reacciones de sus seguidores en directo`,
        `INDUSTRIA: Desarrolladores independientes revolucionan las mecánicas de juego`
    ];
}

function renderVreadAppContent(container, gameInstance) {
    const studioName = gameInstance.companyName || 'Tu Estudio';
    const studioHandle = studioName.normalize('NFD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'estudio';
    const year = gameInstance.getHistoricalYear ? gameInstance.getHistoricalYear() : 1982;
    const history = gameInstance.gamesHistory || [];
    const trend = gameInstance.marketTrend;
    const trendTopicName = trend?.topicId || trend?.topicName || 'Cyberpunk';
    const trendGenreName = trend?.genreId || trend?.genreName || 'RPG';
    const initialSentiment = getCommunitySentiment(gameInstance);
    const tickerItems = getVreadLiveTickerItems(gameInstance);

    let allPosts = generateVreadFeed(gameInstance);
    const maxFeedPosts = 500;

    container.innerHTML = `
        <div class="uwuntu-vread-client">
            <!-- Main Timeline Column -->
            <div class="vread-main-col">
                <header class="vread-app-header">
                    <div class="vread-brand-title">
                        <span class="vread-v-icon">V</span>
                        <div class="vread-brand-text">
                            <span class="vread-name">Vread</span>
                            <span class="vread-subtag">La conversación del videojuego</span>
                        </div>
                    </div>
                    <div class="vread-header-right">
                        <button type="button" class="vread-refresh-btn" id="vread-refresh-btn" title="Actualizar publicaciones">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                        </button>
                    </div>
                </header>

                <!-- Live Ticker Bar -->
                <div class="vread-live-ticker" aria-label="Noticias y actualidad en directo">
                    <div class="vread-ticker-badge">
                        <span class="ticker-live-dot"></span>
                        <span class="ticker-live-text">EN VIVO</span>
                    </div>
                    <div class="vread-ticker-marquee">
                        <span class="vread-ticker-content" id="vread-ticker-text">${escapeVread(tickerItems[0])}</span>
                    </div>
                </div>

                <!-- Composer Box -->
                <div class="vread-composer-box">
                    <div class="vread-avatar vread-avatar--player" title="${escapeVread(studioName)}">
                        <div class="vread-studio-avatar-inner" data-studio-avatar></div>
                    </div>
                    <div class="vread-composer-main">
                        <textarea maxlength="500" id="vread-compose-input" placeholder="¿Qué está pasando en ${escapeVread(studioName)}? Comparte un anuncio, responde a las críticas o aviva el debate..." rows="2"></textarea>
                        <div class="vread-composer-toolbar">
                            <div class="vread-composer-tags">
                                <button type="button" class="composer-tag-pill" data-insert="#${escapeVread(studioName.replace(/\s+/g, ''))}">#${escapeVread(studioName.replace(/\s+/g, ''))}</button>
                                <button type="button" class="composer-tag-pill" data-insert="#Goty${year}">#Goty${year}</button>
                                <button type="button" class="composer-tag-pill" data-insert="#DevUpdate">#DevUpdate</button>
                                <button type="button" class="composer-tag-pill" data-insert="#PatchNotes">#PatchNotes</button>
                                <button type="button" class="composer-tag-pill" data-insert="#Hype">#Hype</button>
                                <button type="button" class="composer-tag-pill" data-insert="#Salseo">#Salseo</button>
                            </div>
                            <div class="vread-composer-actions">
                                <span class="vread-tone-badge tone-neutral" id="vread-tone-badge" title="Tono detectado según el texto escrito">Tono: General</span>
                                <div class="vread-char-counter-wrap" title="Caracteres escritos">
                                    <svg class="vread-counter-ring" viewBox="0 0 28 28" width="20" height="20">
                                        <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255, 255, 255, 0.12)" stroke-width="2.2"/>
                                        <circle id="vread-counter-circle" cx="14" cy="14" r="11" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-dasharray="69.1" stroke-dashoffset="69.1" stroke-linecap="round"/>
                                    </svg>
                                    <span id="vread-char-count" class="vread-char-count">0 / 500</span>
                                </div>
                                <button type="button" class="vread-publish-btn" id="vread-publish-btn">Publicar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <p class="vread-impact-message" id="vread-impact-message" role="status" aria-live="polite"></p>
                <p class="vread-update-notice" id="vread-update-notice" role="status" hidden>Hay publicaciones nuevas. Pulsa actualizar para verlas.</p>

                <!-- Feed Navigation Tabs -->
                <div class="vread-feed-tabs" role="tablist">
                    <button type="button" class="vread-tab ${currentVreadFilter === 'all' ? 'active' : ''}" data-vread-tab="all">Para ti</button>
                    <button type="button" class="vread-tab ${currentVreadFilter === 'reviews' ? 'active' : ''}" data-vread-tab="reviews">Opiniones & Críticas</button>
                    <button type="button" class="vread-tab ${currentVreadFilter === 'hater' ? 'active' : ''}" data-vread-tab="hater">
                        <span class="tab-hater-indicator"></span> Haters & Salseo
                    </button>
                    <button type="button" class="vread-tab ${currentVreadFilter === 'live' ? 'active' : ''}" data-vread-tab="live">En directo (Twich)</button>
                    <button type="button" class="vread-tab ${currentVreadFilter === 'trend' ? 'active' : ''}" data-vread-tab="trend">Tendencias</button>
                </div>

                <!-- Trending Hashtag Chips Scroller -->
                <div class="vread-trends-bar">
                    <div class="vread-trends-scroller" id="vread-trends-chips"></div>
                </div>

                <!-- Timeline Posts -->
                <div class="vread-feed-timeline" id="vread-feed-timeline" tabindex="0" aria-label="Publicaciones de Vread">
                    <div class="vread-posts-container" id="vread-posts-container"></div>
                    <button type="button" class="vread-load-more" id="vread-load-more">Cargar más publicaciones</button>
                </div>
            </div>

            <!-- Right Sidebar Column -->
            <aside class="vread-sidebar-col">
                <div class="vread-search-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vread-search-icon">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="vread-search-input" placeholder="Buscar en Vread..." value="${escapeVread(currentVreadSearch)}">
                </div>

                <!-- Studio Profile Card -->
                <div class="vread-side-card vread-pulse-card">
                    <div class="pulse-card-header">
                        <span class="vread-profile-avatar" data-studio-avatar aria-label="Logo del estudio"></span>
                        <strong>@${studioHandle}</strong>
                        <span class="vread-verified-badge-mini">
                            <svg viewBox="0 0 20 20" fill="#38bdf8" width="14" height="14"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                        </span>
                        <span class="vread-studio-badge">Estudio Oficial</span>
                    </div>
                    <div class="vread-reputation">Reputación en Vread <strong id="vread-reputation">${ensureVreadState(gameInstance).reputation}/100</strong></div>
                    <div class="pulse-metrics">
                        <div class="pulse-metric-item">
                            <span class="metric-num">${gameInstance.fans ? gameInstance.fans.toLocaleString() : '25'}</span>
                            <span class="metric-label">Seguidores</span>
                        </div>
                        <div class="pulse-metric-item">
                            <span class="metric-num">${history.length}</span>
                            <span class="metric-label">Lanzamientos</span>
                        </div>
                    </div>
                </div>

                <!-- Community Sentiment Card -->
                <div class="vread-side-card vread-sentiment-card" id="vread-sentiment-card">
                    <div class="sentiment-card-header">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sentiment-icon">
                            <path d="M18 20V10M12 20V4M6 20v-6"/>
                        </svg>
                        <h3 class="side-card-title">Termómetro de Comunidad</h3>
                    </div>
                    <div class="sentiment-meter-wrap">
                        <div class="sentiment-meter-bar" id="vread-sentiment-bar">
                            <div class="sentiment-bar-segment segment-fans" style="width: ${initialSentiment.fans}%;"></div>
                            <div class="sentiment-bar-segment segment-neutral" style="width: ${initialSentiment.neutral}%;"></div>
                            <div class="sentiment-bar-segment segment-haters" style="width: ${initialSentiment.haters}%;"></div>
                        </div>
                        <div class="sentiment-legend" id="vread-sentiment-legend">
                            <span class="legend-item legend-fans"><span class="dot-fans"></span> ${initialSentiment.fans}% Fans</span>
                            <span class="legend-item legend-neutral"><span class="dot-neutral"></span> ${initialSentiment.neutral}% Neutro</span>
                            <span class="legend-item legend-haters"><span class="dot-haters"></span> ${initialSentiment.haters}% Haters</span>
                        </div>
                    </div>
                    <div class="sentiment-status-pill ${initialSentiment.haters > 35 ? 'status-hostile' : initialSentiment.fans > 50 ? 'status-hype' : 'status-balanced'}" id="vread-sentiment-status">
                        <span class="sentiment-status-dot"></span>
                        <span class="sentiment-status-text">${escapeVread(initialSentiment.label)}</span>
                    </div>
                </div>

                <!-- Industry Trends Card -->
                <div class="vread-side-card">
                    <h3 class="side-card-title">Tendencias de la industria</h3>
                    <div class="vread-side-trends">
                        <div class="side-trend-item" data-tag="#${escapeVread(trendTopicName)}">
                            <span class="side-trend-cat">Temática en auge</span>
                            <strong>#${escapeVread(trendTopicName)}</strong>
                            <span class="side-trend-count">38.4k ecos</span>
                        </div>
                        <div class="side-trend-item" data-tag="#${escapeVread(trendGenreName)}">
                            <span class="side-trend-cat">Género del momento</span>
                            <strong>#${escapeVread(trendGenreName)}</strong>
                            <span class="side-trend-count">29.1k ecos</span>
                        </div>
                        <div class="side-trend-item" data-tag="#${escapeVread(studioName.replace(/\s+/g, ''))}">
                            <span class="side-trend-cat">En tu órbita</span>
                            <strong>#${escapeVread(studioName.replace(/\s+/g, ''))}</strong>
                            <span class="side-trend-count">14.6k ecos</span>
                        </div>
                        <div class="side-trend-item" data-tag="#HatersVsFans">
                            <span class="side-trend-cat">Polémica comunitaria</span>
                            <strong>#HatersVsFans</strong>
                            <span class="side-trend-count">22.4k ecos</span>
                        </div>
                        <div class="side-trend-item" data-tag="#TwichGaming">
                            <span class="side-trend-cat">Retransmisión en directo</span>
                            <strong>#TwichGaming</strong>
                            <span class="side-trend-count">19.8k ecos</span>
                        </div>
                        <div class="side-trend-item" data-tag="#GOTY">
                            <span class="side-trend-cat">Comunidad global</span>
                            <strong>#GOTY</strong>
                            <span class="side-trend-count">48.2k ecos</span>
                        </div>
                    </div>
                </div>

                <!-- Who to follow card (with Hater Supremo) -->
                <div class="vread-side-card">
                    <h3 class="side-card-title">A quién seguir</h3>
                    <div class="vread-follow-list">
                        <div class="vread-follow-item">
                            <div class="vread-avatar vread-avatar--user">
                                <img src="/avatars/avatar_1.jpg" alt="SpeedyStreamer" class="vread-avatar-img" />
                            </div>
                            <div class="vread-follow-info">
                                <strong>SpeedyStreamer</strong>
                                <span>@speedy_live</span>
                            </div>
                            <button type="button" class="vread-follow-btn">Seguir</button>
                        </div>
                        <div class="vread-follow-item">
                            <div class="vread-avatar vread-avatar--user">
                                <img src="/avatars/avatar_2.jpg" alt="PixelMaster_X" class="vread-avatar-img" />
                            </div>
                            <div class="vread-follow-info">
                                <strong>PixelMaster_X</strong>
                                <span>@pixelmaster</span>
                            </div>
                            <button type="button" class="vread-follow-btn">Seguir</button>
                        </div>
                        <div class="vread-follow-item is-hater-item">
                            <div class="vread-avatar vread-avatar--hater">
                                <img src="/avatars/avatar_6.jpg" alt="Hater Supremo" class="vread-avatar-img" />
                            </div>
                            <div class="vread-follow-info">
                                <div class="follow-name-row">
                                    <strong>Hater Supremo</strong>
                                    <span class="vread-mini-hater-tag">Hater</span>
                                </div>
                                <span>@hatersupremo</span>
                            </div>
                            <button type="button" class="vread-follow-btn vread-block-hater-btn" data-handle="hatersupremo">Silenciar</button>
                        </div>
                        <div class="vread-follow-item">
                            <div class="vread-avatar vread-avatar--user">
                                <img src="/avatars/avatar_5.jpg" alt="AnalistaVideojuegos" class="vread-avatar-img" />
                            </div>
                            <div class="vread-follow-info">
                                <strong>AnalistaVideojuegos</strong>
                                <span>@industry_analyst</span>
                            </div>
                            <button type="button" class="vread-follow-btn">Seguir</button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    `;

    syncStudioAvatars(container, gameInstance.companyLogo);

    // Dynamic ticker cycler
    const tickerEl = container.querySelector('#vread-ticker-text');
    let tickerIndex = 0;
    const tickerInterval = setInterval(() => {
        if (!container.isConnected) {
            clearInterval(tickerInterval);
            return;
        }
        tickerIndex = (tickerIndex + 1) % tickerItems.length;
        if (tickerEl) {
            tickerEl.style.opacity = '0';
            setTimeout(() => {
                if (tickerEl) {
                    tickerEl.textContent = tickerItems[tickerIndex];
                    tickerEl.style.opacity = '1';
                }
            }, 200);
        }
    }, 6500);

    // Update community sentiment card in sidebar
    function updateSentimentDisplay() {
        const sentiment = getCommunitySentiment(gameInstance);
        const bar = container.querySelector('#vread-sentiment-bar');
        const legend = container.querySelector('#vread-sentiment-legend');
        const status = container.querySelector('#vread-sentiment-status');
        if (!bar || !legend || !status) return;

        bar.innerHTML = `
            <div class="sentiment-bar-segment segment-fans" style="width: ${sentiment.fans}%;"></div>
            <div class="sentiment-bar-segment segment-neutral" style="width: ${sentiment.neutral}%;"></div>
            <div class="sentiment-bar-segment segment-haters" style="width: ${sentiment.haters}%;"></div>
        `;
        legend.innerHTML = `
            <span class="legend-item legend-fans"><span class="dot-fans"></span> ${sentiment.fans}% Fans</span>
            <span class="legend-item legend-neutral"><span class="dot-neutral"></span> ${sentiment.neutral}% Neutro</span>
            <span class="legend-item legend-haters"><span class="dot-haters"></span> ${sentiment.haters}% Haters</span>
        `;
        const statusClass = sentiment.haters > 35 ? 'status-hostile' : sentiment.fans > 50 ? 'status-hype' : 'status-balanced';
        status.className = `sentiment-status-pill ${statusClass}`;
        status.innerHTML = `
            <span class="sentiment-status-dot"></span>
            <span class="sentiment-status-text">${escapeVread(sentiment.label)}</span>
        `;
    }

    // Render chips
    function renderChips() {
        const chipsContainer = container.querySelector('#vread-trends-chips');
        if (!chipsContainer) return;

        const tags = [
            `#${studioName.replace(/\s+/g, '')}`,
            `#Goty${year}`,
            `#${trendTopicName}`,
            `#${trendGenreName}`,
            '#HatersVsFans',
            '#TwichGaming',
            '#GameDev',
            '#GOTY'
        ];

        chipsContainer.innerHTML = tags.map(tag => `
            <button type="button" class="vread-chip ${currentVreadTag === tag ? 'active' : ''}" data-tag="${escapeVread(tag)}">
                ${escapeVread(tag)}
            </button>
        `).join('');

        chipsContainer.querySelectorAll('.vread-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const tag = chip.dataset.tag;
                currentVreadTag = currentVreadTag === tag ? null : tag;
                renderChips();
                renderTimeline();
            });
        });
    }

    // Render timeline posts
    function renderTimeline(appendPosts = null) {
        const postsContainer = container.querySelector('#vread-posts-container');
        if (!postsContainer) return;

        let filtered = appendPosts ?? allPosts;

        // Filter by tab
        if (currentVreadFilter === 'reviews') {
            filtered = filtered.filter(p => p.type === 'reviews');
        } else if (currentVreadFilter === 'hater') {
            filtered = filtered.filter(p => p.isHater || p.type === 'hater' || (p.impact && p.impact.backlash));
        } else if (currentVreadFilter === 'live') {
            filtered = filtered.filter(p => p.type === 'live');
        } else if (currentVreadFilter === 'trend') {
            filtered = filtered.filter(p => p.type === 'trend');
        }

        // Filter out muted handles
        if (currentVreadMutedHandles.size > 0) {
            filtered = filtered.filter(p => !currentVreadMutedHandles.has((p.handle || '').toLowerCase()));
        }

        // Filter by hashtag chip
        if (currentVreadTag) {
            const cleanTag = currentVreadTag.replace('#', '').toLowerCase();
            filtered = filtered.filter(p => p.text.toLowerCase().includes(cleanTag));
        }

        // Filter by search
        if (currentVreadSearch.trim()) {
            const q = currentVreadSearch.trim().toLowerCase();
            filtered = filtered.filter(p => p.text.toLowerCase().includes(q) || p.author.toLowerCase().includes(q) || (p.handle && p.handle.toLowerCase().includes(q)));
        }

        if (!filtered.length) {
            if (!appendPosts) postsContainer.innerHTML = `
                <div class="vread-empty"><p>No se encontraron publicaciones con los filtros seleccionados. Prueba a cargar más o cambiar de pestaña.</p></div>`;
            return;
        }

        if (appendPosts) postsContainer.querySelector('.vread-empty')?.remove();
        const previousCount = appendPosts ? postsContainer.children.length : 0;
        const markup = filtered.map((post) => {
            const isStudio = post.isStudio === true;
            const isHater = post.isHater === true || post.type === 'hater';
            const isRatioed = post.isRatioed === true;
            const avatarUrl = isStudio ? null : getVreadUserAvatar(post.author, post.handle);
            const highlightedText = escapeVread(post.text)
                .replace(/#\{([^}]+)\}/g, '<span class="vread-mention">#$1</span>')
                .replace(/#([a-zA-Z0-9_]+)/g, '<span class="vread-hashtag">#$1</span>')
                .replace(/@([a-zA-Z0-9_]+)/g, '<span class="vread-handle-mention">@$1</span>');

            return `
                <article class="vread-post ${isHater ? 'is-hater' : ''} ${isRatioed ? 'is-ratioed' : ''}" data-post-id="${escapeVread(post.id)}">
                    <div class="vread-avatar ${isStudio ? 'vread-avatar--player' : isHater ? 'vread-avatar--hater' : 'vread-avatar--user'}" aria-hidden="true">
                        ${isStudio ? `
                            <div class="vread-studio-avatar-inner" data-studio-avatar></div>
                        ` : `
                            <img src="${avatarUrl}" alt="${escapeVread(post.author)}" class="vread-avatar-img" loading="lazy" />
                        `}
                    </div>
                    <div class="vread-post-main">
                        <header class="vread-post-head">
                            <span class="vread-author-name">${escapeVread(post.author)}</span>
                            ${isHater ? `
                                <span class="vread-hater-badge" title="Perfil hater de la comunidad">
                                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    HATER
                                </span>
                            ` : ''}
                            ${post.verified ? `
                                <svg class="vread-verified-badge" viewBox="0 0 20 20" fill="#38bdf8" width="14" height="14" aria-label="Verificado">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                </svg>
                            ` : ''}
                            <span class="vread-author-handle">@${escapeVread(post.handle)}</span>
                            <span class="vread-post-time">· ${escapeVread(post.time)}</span>
                            ${post.isLive ? `<span class="vread-live-pill"><span class="live-dot"></span> EN DIRECTO</span>` : ''}
                        </header>
                        <p class="vread-post-text">${highlightedText}</p>
                        ${isRatioed ? `
                            <div class="vread-ratio-banner">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01"/></svg>
                                <span><strong>RATIOED POR LA COMUNIDAD</strong> · Las réplicas superan ampliamente el apoyo recibido</span>
                            </div>
                        ` : ''}
                        ${post.impact ? `<p class="vread-post-impact ${post.impact.backlash ? 'is-backlash' : ''}">${post.impact.backlash ? 'Polémica · ' : ''}${post.impact.sales > 0 ? '+' : ''}${post.impact.sales}% ventas${post.impact.targetName ? ` · ${escapeVread(post.impact.targetName)}` : ' · catálogo'} · ${post.impact.reputation > 0 ? '+' : ''}${post.impact.reputation} reputación${post.impact.repeated ? ' · mensaje repetido' : ''}</p>` : ''}
                        
                        <!-- Actions bar -->
                        <div class="vread-actions-bar">
                            <button type="button" class="vread-action-btn vread-action-reply" title="Comentarios">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span class="vread-replies-count">${post.replies?.length || 0}</span>
                            </button>
                            <button type="button" class="vread-action-btn vread-action-repost" title="Republicar" data-reposts="${post.reposts || 0}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="17 1 21 5 17 9"></polyline>
                                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                    <polyline points="7 23 3 19 7 15"></polyline>
                                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                                </svg>
                                <span class="vread-reposts-count">${formatVreadNumber(post.reposts || 0)}</span>
                            </button>
                            <button type="button" class="vread-action-btn vread-action-like" title="Me gusta" data-likes="${post.likes || 0}">
                                <svg class="vread-heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span class="vread-likes-count">${formatVreadNumber(post.likes || 0)}</span>
                            </button>
                            <button type="button" class="vread-action-btn vread-action-share" title="Compartir">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="18" cy="5" r="3"></circle>
                                    <circle cx="6" cy="12" r="3"></circle>
                                    <circle cx="18" cy="19" r="3"></circle>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                </svg>
                            </button>
                        </div>

                        ${post.replies?.length ? `
                            <details class="vread-replies-accordion" ${isStudio ? 'open' : ''}>
                                <summary>Ver ${post.replies.length} respuestas</summary>
                                <div class="vread-replies-list">
                                    ${post.replies.map(r => {
                                        const isHaterReply = r.isHater || (r.handle && r.handle.toLowerCase().includes('hate'));
                                        return `
                                            <div class="vread-reply-item ${isHaterReply ? 'is-hater-reply' : ''}">
                                                <div class="vread-avatar-mini ${isHaterReply ? 'is-hater' : ''}">
                                                    <img src="${getVreadUserAvatar(r.author, r.handle || r.author)}" alt="${escapeVread(r.author)}" class="vread-avatar-img" loading="lazy" />
                                                </div>
                                                <div class="vread-reply-body">
                                                    <div class="vread-reply-author-line">
                                                        <strong class="vread-reply-author">@${escapeVread(r.handle || r.author.toLowerCase().replace(/[^a-z0-9]/g, ''))}:</strong>
                                                        ${isHaterReply ? `<span class="vread-mini-hater-tag">Hater</span>` : ''}
                                                    </div>
                                                    <span class="vread-reply-text">${escapeVread(r.text)}</span>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}

                                    <!-- Interactive Studio Response Drawer -->
                                    <div class="vread-inline-reply-box" data-target-id="${escapeVread(post.id)}">
                                        <div class="inline-reply-chips">
                                            <button type="button" class="vread-smart-reply-chip" data-quick="fact" title="Responder con datos contrastados (+1 Rep)">
                                                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                                Zasca con datos (+Rep)
                                            </button>
                                            <button type="button" class="vread-smart-reply-chip" data-quick="salseo" title="Avivar el debate y aumentar alcance (+Ecos)">
                                                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                                Avivar salseo (+Ecos)
                                            </button>
                                            ${isHater ? `
                                            <button type="button" class="vread-smart-reply-chip vread-chip-mute" data-mute="${escapeVread(post.handle)}" title="Silenciar a este usuario hater">
                                                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                                Silenciar @${escapeVread(post.handle)}
                                            </button>
                                            ` : ''}
                                        </div>
                                        <div class="inline-reply-input-row">
                                            <input type="text" class="vread-inline-input" placeholder="Responder como ${escapeVread(studioName)}..." maxlength="200" />
                                            <button type="button" class="vread-inline-send-btn">Responder</button>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        ` : ''}
                    </div>
                </article>
            `;
        }).join('');

        if (appendPosts) postsContainer.insertAdjacentHTML('beforeend', markup);
        else postsContainer.innerHTML = markup;

        syncStudioAvatars(postsContainer, gameInstance.companyLogo);
        const newPosts = [...postsContainer.children].slice(previousCount);

        // Wire likes microinteraction
        newPosts.flatMap(post => [...post.querySelectorAll('.vread-action-like')]).forEach(likeBtn => {
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isLiked = likeBtn.classList.toggle('is-liked');
                let count = parseInt(likeBtn.dataset.likes, 10) || 0;
                count = isLiked ? count + 1 : Math.max(0, count - 1);
                likeBtn.dataset.likes = count;
                likeBtn.querySelector('.vread-likes-count').textContent = formatVreadNumber(count);
                likeBtn.classList.add('heart-burst');
                setTimeout(() => likeBtn.classList.remove('heart-burst'), 300);
            });
        });

        // Wire repost microinteraction
        newPosts.flatMap(post => [...post.querySelectorAll('.vread-action-repost')]).forEach(repostBtn => {
            repostBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isReposted = repostBtn.classList.toggle('is-reposted');
                let count = parseInt(repostBtn.dataset.reposts, 10) || 0;
                count = isReposted ? count + 1 : Math.max(0, count - 1);
                repostBtn.dataset.reposts = count;
                repostBtn.querySelector('.vread-reposts-count').textContent = formatVreadNumber(count);
            });
        });

        // Wire inline response quick chips & custom reply
        newPosts.flatMap(post => [...post.querySelectorAll('.vread-inline-reply-box')]).forEach(replyBox => {
            const postId = replyBox.dataset.targetId;
            const inlineInput = replyBox.querySelector('.vread-inline-input');
            const inlineBtn = replyBox.querySelector('.vread-inline-send-btn');

            // Quick Fact chip
            replyBox.querySelector('[data-quick="fact"]')?.addEventListener('click', () => {
                const targetPost = allPosts.find(p => p.id === postId);
                if (targetPost) {
                    targetPost.replies = targetPost.replies || [];
                    targetPost.replies.push({
                        author: studioName,
                        handle: studioHandle,
                        text: 'Datos oficiales: auditamos rigurosamente cada mecánica y tomamos nota de cada sugerencia constructiva. ¡Gracias a la comunidad!',
                        isStudio: true
                    });
                    const vstate = ensureVreadState(gameInstance);
                    vstate.reputation = Math.min(100, vstate.reputation + 1);
                    const repEl = container.querySelector('#vread-reputation');
                    if (repEl) repEl.textContent = `${vstate.reputation}/100`;
                    updateSentimentDisplay();
                    renderTimeline();
                    const fb = container.querySelector('#vread-impact-message');
                    fb.textContent = 'Respuesta corporativa enviada con éxito: +1 Reputación en Vread.';
                    fb.dataset.kind = 'positive';
                    if (window.soundEngine?.playClick) window.soundEngine.playClick();
                }
            });

            // Quick Salseo chip
            replyBox.querySelector('[data-quick="salseo"]')?.addEventListener('click', () => {
                const targetPost = allPosts.find(p => p.id === postId);
                if (targetPost) {
                    targetPost.replies = targetPost.replies || [];
                    targetPost.replies.push({
                        author: studioName,
                        handle: studioHandle,
                        text: 'Agradecemos el debate... pero esperad a ver la próxima build. Os vais a quedar sin palabras ;) #GameDev',
                        isStudio: true
                    });
                    targetPost.reposts = (targetPost.reposts || 0) + 16;
                    targetPost.likes = (targetPost.likes || 0) + 48;
                    updateSentimentDisplay();
                    renderTimeline();
                    const fb = container.querySelector('#vread-impact-message');
                    fb.textContent = 'Has avivado el debate: la publicación gana repercusión y ecos en la comunidad.';
                    fb.dataset.kind = 'positive';
                    if (window.soundEngine?.playClick) window.soundEngine.playClick();
                }
            });

            // Quick Mute chip
            replyBox.querySelector('[data-mute]')?.addEventListener('click', (e) => {
                const muteTarget = e.currentTarget.dataset.mute.toLowerCase();
                currentVreadMutedHandles.add(muteTarget);
                renderTimeline();
                const fb = container.querySelector('#vread-impact-message');
                fb.textContent = `Has silenciado a @${muteTarget}. Ya no verás sus comentarios en Vread.`;
                fb.dataset.kind = 'positive';
                if (window.soundEngine?.playClick) window.soundEngine.playClick();
            });

            // Custom inline send
            const doInlineReply = () => {
                if (!inlineInput) return;
                const text = inlineInput.value.trim();
                if (!text) return;
                const targetPost = allPosts.find(p => p.id === postId);
                if (targetPost) {
                    targetPost.replies = targetPost.replies || [];
                    targetPost.replies.push({
                        author: studioName,
                        handle: studioHandle,
                        text,
                        isStudio: true
                    });
                    inlineInput.value = '';
                    renderTimeline();
                    const fb = container.querySelector('#vread-impact-message');
                    fb.textContent = 'Respuesta enviada a la conversación.';
                    fb.dataset.kind = 'positive';
                    if (window.soundEngine?.playClick) window.soundEngine.playClick();
                }
            };

            inlineBtn?.addEventListener('click', doInlineReply);
            inlineInput?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    doInlineReply();
                }
            });
        });
    }

    // Attach Tab events
    container.querySelectorAll('.vread-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            container.querySelectorAll('.vread-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentVreadFilter = tab.dataset.vreadTab;
            renderTimeline();
        });
    });

    // Attach Search events
    const searchInput = container.querySelector('#vread-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentVreadSearch = e.target.value;
            renderTimeline();
        });
    }

    // Attach Sidebar trend clicks
    container.querySelectorAll('.side-trend-item').forEach(item => {
        item.addEventListener('click', () => {
            const tag = item.dataset.tag;
            currentVreadTag = currentVreadTag === tag ? null : tag;
            renderChips();
            renderTimeline();
        });
    });

    // Attach Follow buttons
    container.querySelectorAll('.vread-follow-btn:not(.vread-block-hater-btn)').forEach(btn => {
        btn.addEventListener('click', () => {
            const isFollowing = btn.classList.toggle('following');
            btn.textContent = isFollowing ? 'Siguiendo' : 'Seguir';
        });
    });

    // Attach Hater block/mute toggle button
    container.querySelectorAll('.vread-block-hater-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const handle = (btn.dataset.handle || 'hatersupremo').toLowerCase();
            const isMuted = currentVreadMutedHandles.has(handle);
            if (isMuted) {
                currentVreadMutedHandles.delete(handle);
                btn.textContent = 'Silenciar';
                btn.classList.remove('is-muted');
            } else {
                currentVreadMutedHandles.add(handle);
                btn.textContent = 'Silenciado';
                btn.classList.add('is-muted');
            }
            renderTimeline();
            const fb = container.querySelector('#vread-impact-message');
            fb.textContent = isMuted ? `Has cancelado el silencio de @${handle}.` : `Has silenciado a @${handle}.`;
            fb.dataset.kind = 'positive';
            if (window.soundEngine?.playClick) window.soundEngine.playClick();
        });
    });

    // Real-time character counter and tone analysis in composer
    const composeInput = container.querySelector('#vread-compose-input');
    const updateComposerStatus = () => {
        if (!composeInput) return;
        const text = composeInput.value;
        const len = text.length;
        const countEl = container.querySelector('#vread-char-count');
        const circleEl = container.querySelector('#vread-counter-circle');
        const toneBadge = container.querySelector('#vread-tone-badge');

        if (countEl) countEl.textContent = `${len} / 500`;
        if (circleEl) {
            const circumference = 69.115;
            const progress = Math.min(1, len / 500);
            const offset = circumference - progress * circumference;
            circleEl.style.strokeDashoffset = offset;
            if (len >= 480) {
                circleEl.setAttribute('stroke', '#f43f5e');
            } else if (len >= 400) {
                circleEl.setAttribute('stroke', '#f59e0b');
            } else {
                circleEl.setAttribute('stroke', '#38bdf8');
            }
        }

        if (toneBadge) {
            if (!text.trim()) {
                toneBadge.textContent = 'Tono: General';
                toneBadge.className = 'vread-tone-badge tone-neutral';
            } else {
                const analysis = classifyVreadPost(text);
                const toneLabels = {
                    hype: 'Tono: Hype & Anuncio',
                    humor: 'Tono: Humor & Comunidad',
                    tech: 'Tono: Dev & Técnico',
                    apology: 'Tono: Disculpa Oficial',
                    neutral: 'Tono: General'
                };
                toneBadge.textContent = toneLabels[analysis.tone] || 'Tono: General';
                toneBadge.className = `vread-tone-badge tone-${analysis.tone}`;
            }
        }
    };
    composeInput?.addEventListener('input', updateComposerStatus);

    // Tag inserters in composer
    container.querySelectorAll('.composer-tag-pill').forEach(tagBtn => {
        tagBtn.addEventListener('click', () => {
            const tag = tagBtn.dataset.insert;
            if (composeInput) {
                composeInput.value = (composeInput.value + ' ' + tag).trim() + ' ';
                composeInput.focus();
                updateComposerStatus();
            }
        });
    });

    // Attach Composer publish
    const publishBtn = container.querySelector('#vread-publish-btn');
    if (publishBtn && composeInput) {
        const doPublish = () => {
            const text = composeInput.value.trim();
            if (!text) return;

            const result = gameInstance.publishVreadPost(text);
            const feedback = container.querySelector('#vread-impact-message');
            if (!result.success) {
                feedback.textContent = result.message;
                feedback.dataset.kind = 'error';
                return;
            }
            const impact = result.impact;
            const target = impact.targetName ? ` en ${impact.targetName}` : ' en el catálogo';
            const effect = impact.sales ? `${impact.sales > 0 ? '+' : ''}${impact.sales}% de ventas${target} durante ${impact.duration} semanas, con efecto decreciente.` : 'Sin efecto inmediato en ventas.';
            const reputation = `${impact.reputation > 0 ? '+' : ''}${impact.reputation} de reputación.`;
            const noSales = impact.sales && !gameInstance.activeSales?.length ? ' No hay juegos a la venta ahora mismo.' : '';
            feedback.textContent = `${impact.backlash ? 'Polémica: ' : ''}${effect} ${reputation}${noSales}${impact.repeated ? ' Mensaje repetido: sin nuevo impacto.' : ''}`;
            feedback.dataset.kind = impact.backlash || impact.sales < 0 ? 'negative' : 'positive';
            const repEl = container.querySelector('#vread-reputation');
            if (repEl) repEl.textContent = `${ensureVreadState(gameInstance).reputation}/100`;

            updateSentimentDisplay();

            const reactions = impact.backlash
                ? generateVreadFeed(gameInstance).filter(post => post.id.startsWith('backlash-'))
                : [];
            allPosts = [result.post, ...reactions, ...allPosts].slice(0, maxFeedPosts);
            composeInput.value = '';
            updateComposerStatus();
            renderTimeline();
            const timelineEl = container.querySelector('#vread-feed-timeline');
            if (timelineEl) timelineEl.scrollTop = 0;

            if (window.soundEngine?.playClick) window.soundEngine.playClick();
        };

        publishBtn.addEventListener('click', doPublish);

        composeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
                e.preventDefault();
                doPublish();
            }
        });
    }

    // Attach Refresh button
    const refreshBtn = container.querySelector('#vread-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.classList.add('spinning');
            setTimeout(() => {
                refreshBtn.classList.remove('spinning');
                const fresh = generateVreadFeed(gameInstance).filter(post => !post.isStudio);
                const older = allPosts.length >= maxFeedPosts ? [] : allPosts.filter(post => !post.isStudio);
                allPosts = [...allPosts.filter(post => post.isStudio), ...fresh, ...older].slice(0, maxFeedPosts);
                container.querySelector('#vread-update-notice').hidden = true;
                updateSentimentDisplay();
                updateLoadMore();
                renderChips();
                renderTimeline();
                const timelineEl = container.querySelector('#vread-feed-timeline');
                if (timelineEl) timelineEl.scrollTop = 0;
            }, 300);
        });
    }

    let lastFeedWeek = gameInstance.getIndustryWeek?.();
    container._refreshVreadForWeek = () => {
        const currentWeek = gameInstance.getIndustryWeek?.();
        if (currentWeek == null || lastFeedWeek == null || currentWeek - lastFeedWeek < 4) return;
        lastFeedWeek = currentWeek;
        const reputation = container.querySelector('#vread-reputation');
        if (reputation) reputation.textContent = `${ensureVreadState(gameInstance).reputation}/100`;
        updateSentimentDisplay();
        container.querySelector('#vread-update-notice').hidden = false;
    };

    const timeline = container.querySelector('#vread-feed-timeline');
    const loadMore = container.querySelector('#vread-load-more');
    function updateLoadMore() {
        const full = allPosts.length >= maxFeedPosts;
        loadMore.disabled = full;
        loadMore.textContent = full ? 'Actualiza para ver publicaciones más recientes' : 'Cargar más publicaciones';
    }
    function appendMorePosts() {
        if (loadMore.disabled) return;
        const room = maxFeedPosts - allPosts.length;
        const batch = generateVreadFeed(gameInstance)
            .filter(post => !post.isStudio && !post.id.startsWith('backlash-'))
            .slice(0, room);
        allPosts.push(...batch);
        renderTimeline(batch);
        updateLoadMore();
    }
    loadMore.addEventListener('click', appendMorePosts);
    timeline.addEventListener('scroll', () => {
        if (timeline.scrollHeight - timeline.scrollTop - timeline.clientHeight < 80) appendMorePosts();
    }, { passive: true });

    // Initial render of chips & timeline
    renderChips();
    renderTimeline();
    updateLoadMore();
}

// 6. CUSTOM APP: GUIDE APP FOR DESKTOP
function renderGuideAppContent(container) {
    container.innerHTML = `
        <div class="uwuntu-guide-client">
            <header class="guide-client-header">
                <h2>Manual del Estudio — Dev Empire</h2>
                <p>Guía de sistemas, progresión y atajos del simulador.</p>
            </header>
            <div class="guide-client-body">
                <section class="guide-section">
                    <h3>1. Desarrollo de Videojuegos</h3>
                    <p>Combina temas y géneros con alta afinidad temática. Planifica la arquitectura técnica equilibrando características con la deuda de código.</p>
                </section>
                <section class="guide-section">
                    <h3>2. Laboratorio de I+D</h3>
                    <p>Investiga nodos en el Árbol Tecnológico, diseña motores propios con el Asistente Visual y desmonta hardware rival en el Banco de Ingeniería Inversa.</p>
                </section>
                <section class="guide-section">
                    <h3>3. Atajos de Teclado</h3>
                    <ul class="guide-shortcuts">
                        <li><kbd>O</kbd> <span>Abrir / Cerrar Uwuntu XD</span></li>
                        <li><kbd>N</kbd> <span>Nuevo Videojuego</span></li>
                        <li><kbd>G</kbd> <span>Arquitectura DAG</span></li>
                        <li><kbd>R</kbd> <span>Investigación (I+D)</span></li>
                        <li><kbd>H</kbd> <span>Personal y Equipo</span></li>
                        <li><kbd>C</kbd> <span>Ventas y Top 10</span></li>
                        <li><kbd>Espacio</kbd> <span>Pausar / Reanudar simulación</span></li>
                        <li><kbd>Esc</kbd> <span>Cerrar ventana / Salir a la oficina</span></li>
                    </ul>
                </section>
            </div>
        </div>
    `;
}

// 7. CUSTOM APP: TERMINAL DE ADMINISTRACIÓN (ADMIN CONSOLE)
function renderAdminAppContent(container, gameInstance) {
    const getFundsFormatted = () => `${Math.floor(gameInstance.funds || 0).toLocaleString('es-ES')} €`;
    const getRP = () => Math.floor(gameInstance.researchPoints || 0);
    const getEmployeesCount = () => (gameInstance.employees ? gameInstance.employees.length : 1);
    const getAvgEnergy = () => {
        if (!gameInstance.employees || !gameInstance.employees.length) return 100;
        const sum = gameInstance.employees.reduce((acc, e) => acc + (e.energy ?? e.stamina ?? 100), 0);
        return Math.round(sum / gameInstance.employees.length);
    };
    const getHistoricalDate = () => {
        const y = gameInstance.getHistoricalYear ? gameInstance.getHistoricalYear() : (1981 + (gameInstance.year || 1));
        const m = gameInstance.month || 1;
        const w = gameInstance.week || 1;
        return `Año ${y} · M${m} · S${w}`;
    };

    container.innerHTML = `
        <div class="uwuntu-admin-terminal">
            <!-- Top Status Strip -->
            <div class="admin-topbar">
                <div class="admin-topbar-left">
                    <div class="admin-term-badge">
                        <span class="term-status-dot"></span>
                        <span class="term-status-text">ROOT @ UWUNTU XD // DEBUG PRIVILEGES</span>
                    </div>
                    <span class="admin-studio-label">${gameInstance.companyName || 'PixelForge Interactive'}</span>
                </div>
                <div class="admin-date-badge" id="admin-live-date">${getHistoricalDate()}</div>
            </div>

            <!-- Real-time Stats Cards -->
            <div class="admin-stats-grid">
                <div class="admin-stat-card">
                    <span class="stat-kicker">FONDOS DISPONIBLES</span>
                    <strong class="stat-value text-emerald" id="admin-stat-funds">${getFundsFormatted()}</strong>
                </div>
                <div class="admin-stat-card">
                    <span class="stat-kicker">INVESTIGACIÓN (I+D)</span>
                    <strong class="stat-value text-cyan" id="admin-stat-rp">${getRP()} RP</strong>
                </div>
                <div class="admin-stat-card">
                    <span class="stat-kicker">ENERGÍA DEL EQUIPO</span>
                    <strong class="stat-value text-amber" id="admin-stat-energy">${getAvgEnergy()}%</strong>
                </div>
                <div class="admin-stat-card">
                    <span class="stat-kicker">HYPE MEDIÁTICO</span>
                    <strong class="stat-value text-rose" id="admin-stat-hype">${gameInstance.hype || 0}</strong>
                </div>
            </div>

            <!-- Two-Column Body: Controls & CLI Terminal -->
            <div class="admin-main-layout">
                <!-- Left: Quick Action Cards -->
                <div class="admin-controls-pane">
                    <!-- Section: Finanzas -->
                    <div class="admin-box">
                        <div class="admin-box-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="6" y1="12" x2="6.01" y2="12"/><line x1="18" y1="12" x2="18.01" y2="12"/></svg>
                            <span>Gestión de Fondos</span>
                        </div>
                        <div class="admin-funds-input-group">
                            <input type="number" id="admin-input-funds" min="0" step="10000" value="1000000" placeholder="Cantidad en euros">
                            <button type="button" class="admin-btn primary" id="admin-btn-add-funds">+ Añadir</button>
                            <button type="button" class="admin-btn secondary" id="admin-btn-set-funds">= Fijar</button>
                        </div>
                        <div class="admin-pills-row">
                            <button type="button" class="admin-pill-btn" data-add-funds="100000">+100k €</button>
                            <button type="button" class="admin-pill-btn" data-add-funds="1000000">+1M €</button>
                            <button type="button" class="admin-pill-btn" data-add-funds="10000000">+10M €</button>
                            <button type="button" class="admin-pill-btn gold" data-set-funds="50000000">Max 50M €</button>
                        </div>
                    </div>

                    <!-- Section: Puntos de I+D -->
                    <div class="admin-box">
                        <div class="admin-box-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.5M14 2v7.5M8.5 2h7M14 9.5l4 9.5a2 2 0 0 1-1.8 2.8H7.8A2 2 0 0 1 6 19l4-9.5z"/></svg>
                            <span>Puntos de Investigación (RP)</span>
                        </div>
                        <div class="admin-pills-row">
                            <button type="button" class="admin-pill-btn cyan" data-add-rp="50">+50 RP</button>
                            <button type="button" class="admin-pill-btn cyan" data-add-rp="250">+250 RP</button>
                            <button type="button" class="admin-pill-btn cyan" data-add-rp="1000">+1.000 RP</button>
                            <button type="button" class="admin-pill-btn cyan" data-add-rp="5000">+5.000 RP</button>
                        </div>
                    </div>

                    <!-- Section: Personal & Fatiga -->
                    <div class="admin-box">
                        <div class="admin-box-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            <span>Personal, Fatiga & Hype</span>
                        </div>
                        <div class="admin-action-buttons-col">
                            <button type="button" class="admin-action-btn emerald" id="admin-btn-heal-team">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                <span>Recuperar Energía al 100% (Cero Fatiga)</span>
                            </button>
                            <button type="button" class="admin-action-btn violet" id="admin-btn-max-morale">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                <span>Subir Moral de Empleados al 100%</span>
                            </button>
                            <button type="button" class="admin-action-btn rose" id="admin-btn-add-hype">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                <span>Aumentar Hype Mediático (+25 Hype)</span>
                            </button>
                            <button type="button" class="admin-action-btn gold" id="admin-btn-godmode">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-5-6.5 5 2-7.5L2 9h7l3-7z"/></svg>
                                <span>Modo Dios (+50M €, +5.000 RP, 100% Energía)</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Right: Interactive CLI Terminal Screen -->
                <div class="admin-terminal-pane">
                    <div class="term-console-header">
                        <div class="term-dots">
                            <span class="dot-red"></span>
                            <span class="dot-yellow"></span>
                            <span class="dot-green"></span>
                        </div>
                        <span class="term-console-title">bash - 80x24 (root)</span>
                        <button type="button" class="term-clear-btn" id="admin-term-clear">Limpiar</button>
                    </div>
                    <div class="term-console-body" id="admin-term-log">
                        <div class="term-line info">UWUNTU XD KERNEL 3.4.0-DEV (x86_64) // ROOT CONSOLE</div>
                        <div class="term-line info">Sesión administrativa iniciada con privilegios elevados.</div>
                        <div class="term-line comment">Escribe "help" o usa los botones de la izquierda para ejecutar acciones.</div>
                        <div class="term-line success">OK: Sistema sincronizado con la partida actual.</div>
                    </div>
                    <form class="term-input-line" id="admin-term-form">
                        <span class="term-prompt">root@uwuntu:~#</span>
                        <input type="text" id="admin-cli-input" autocomplete="off" spellcheck="false" placeholder="Escribe un comando (ej: help, funds 500000, heal, rp 250)">
                    </form>
                </div>
            </div>
        </div>
    `;

    const statFunds = container.querySelector('#admin-stat-funds');
    const statRP = container.querySelector('#admin-stat-rp');
    const statEnergy = container.querySelector('#admin-stat-energy');
    const statHype = container.querySelector('#admin-stat-hype');
    const termLog = container.querySelector('#admin-term-log');
    const cliInput = container.querySelector('#admin-cli-input');
    const termForm = container.querySelector('#admin-term-form');
    const fundsInput = container.querySelector('#admin-input-funds');

    const appendLog = (text, type = 'normal') => {
        if (!termLog) return;
        const line = document.createElement('div');
        line.className = `term-line ${type}`;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        line.textContent = `[${time}] ${text}`;
        termLog.appendChild(line);
        termLog.scrollTop = termLog.scrollHeight;
    };

    const refreshStats = () => {
        if (statFunds) statFunds.textContent = getFundsFormatted();
        if (statRP) statRP.textContent = `${getRP()} RP`;
        if (statEnergy) statEnergy.textContent = `${getAvgEnergy()}%`;
        if (statHype) statHype.textContent = String(gameInstance.hype || 0);

        const legacyFunds = document.getElementById('admin-current-funds');
        if (legacyFunds) legacyFunds.textContent = getFundsFormatted();

        window.renderHUD?.(gameInstance);
        window.refreshOfficeManager?.();
        window.autosaveCurrentGame?.();
    };

    container.querySelector('#admin-btn-add-funds')?.addEventListener('click', () => {
        const val = Math.max(0, parseInt(fundsInput?.value || 0, 10));
        if (val > 0) {
            gameInstance.funds += val;
            refreshStats();
            appendLog(`+ Fondos añadidos: +${val.toLocaleString('es-ES')} €. Saldo actual: ${getFundsFormatted()}`, 'success');
            window.soundEngine?.playClick?.();
        }
    });

    container.querySelector('#admin-btn-set-funds')?.addEventListener('click', () => {
        const val = Math.max(0, parseInt(fundsInput?.value || 0, 10));
        gameInstance.funds = val;
        refreshStats();
        appendLog(`= Saldo fijado exactamente en: ${val.toLocaleString('es-ES')} €`, 'success');
        window.soundEngine?.playClick?.();
    });

    container.querySelectorAll('[data-add-funds]').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = parseInt(btn.dataset.addFunds, 10);
            gameInstance.funds += val;
            refreshStats();
            appendLog(`+ Fondos añadidos: +${val.toLocaleString('es-ES')} €. Saldo actual: ${getFundsFormatted()}`, 'success');
            window.soundEngine?.playClick?.();
        });
    });

    container.querySelectorAll('[data-set-funds]').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = parseInt(btn.dataset.setFunds, 10);
            gameInstance.funds = val;
            refreshStats();
            appendLog(`= Saldo fijado en: ${val.toLocaleString('es-ES')} €`, 'success');
            window.soundEngine?.playClick?.();
        });
    });

    container.querySelectorAll('[data-add-rp]').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = parseInt(btn.dataset.addRp, 10);
            gameInstance.researchPoints = (gameInstance.researchPoints || 0) + val;
            refreshStats();
            appendLog(`+ Puntos de I+D añadidos: +${val} RP. Total: ${getRP()} RP`, 'success');
            window.soundEngine?.playClick?.();
        });
    });

    container.querySelector('#admin-btn-heal-team')?.addEventListener('click', () => {
        if (gameInstance.employees) {
            gameInstance.employees.forEach(e => {
                e.energy = 100;
                e.stamina = 100;
                e.fatigue = 0;
            });
        }
        refreshStats();
        appendLog(`✓ Fatiga eliminada de todos los empleados (${getEmployeesCount()} miembros al 100% de energía).`, 'success');
        window.soundEngine?.playClick?.();
    });

    container.querySelector('#admin-btn-max-morale')?.addEventListener('click', () => {
        if (gameInstance.employees) {
            gameInstance.employees.forEach(e => {
                e.morale = 100;
            });
        }
        refreshStats();
        appendLog(`✓ Moral de todos los empleados restablecida al 100%.`, 'success');
        window.soundEngine?.playClick?.();
    });

    container.querySelector('#admin-btn-add-hype')?.addEventListener('click', () => {
        gameInstance.hype = (gameInstance.hype || 0) + 25;
        refreshStats();
        appendLog(`+ Hype mediático aumentado en +25 puntos. Total: ${gameInstance.hype}`, 'success');
        window.soundEngine?.playClick?.();
    });

    container.querySelector('#admin-btn-godmode')?.addEventListener('click', () => {
        gameInstance.funds = Math.max(gameInstance.funds, 50000000);
        gameInstance.researchPoints = (gameInstance.researchPoints || 0) + 5000;
        gameInstance.hype = (gameInstance.hype || 0) + 50;
        if (gameInstance.employees) {
            gameInstance.employees.forEach(e => {
                e.energy = 100;
                e.stamina = 100;
                e.fatigue = 0;
                e.morale = 100;
            });
        }
        refreshStats();
        appendLog(`★ MODO DIOS ACTIVADO: 50.000.000 €, +5.000 RP, +50 Hype y 100% Energía/Moral.`, 'gold');
        window.soundEngine?.playClick?.();
    });

    container.querySelector('#admin-term-clear')?.addEventListener('click', () => {
        if (termLog) termLog.innerHTML = '';
        appendLog('Consola reiniciada.', 'comment');
    });

    termForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawCmd = (cliInput?.value || '').trim();
        if (!rawCmd) return;
        cliInput.value = '';

        appendLog(`root@uwuntu:~# ${rawCmd}`, 'input');
        const [cmd, ...args] = rawCmd.split(/\s+/);
        const lowerCmd = cmd.toLowerCase();

        switch (lowerCmd) {
            case 'help':
                appendLog('COMANDOS DISPONIBLES EN TERMINAL ROOT:', 'info');
                appendLog('  funds <num>     Añade fondos al estudio (ej: funds 500000)', 'comment');
                appendLog('  setfunds <num>  Fija saldo exacto (ej: setfunds 10000000)', 'comment');
                appendLog('  rp <num>        Añade puntos de I+D (ej: rp 250)', 'comment');
                appendLog('  heal            Restaura energía y elimina fatiga del equipo', 'comment');
                appendLog('  morale          Sube moral de todos los empleados al 100%', 'comment');
                appendLog('  hype <num>      Aumenta el nivel de hype mediático', 'comment');
                appendLog('  godmode         Fondos, RP y salud máxima simultáneamente', 'comment');
                appendLog('  save            Guarda la partida de forma inmediata', 'comment');
                appendLog('  advance <num>   Avanza la simulación N semanas', 'comment');
                appendLog('  clear           Limpia la pantalla de la consola', 'comment');
                break;

            case 'funds':
            case 'cash':
            case 'money': {
                const amount = parseInt(args[0], 10);
                if (isNaN(amount) || amount <= 0) {
                    appendLog('ERROR: Debes indicar una cantidad válida. Ej: funds 500000', 'error');
                } else {
                    gameInstance.funds += amount;
                    refreshStats();
                    appendLog(`OK: +${amount.toLocaleString('es-ES')} € acreditados. Saldo: ${getFundsFormatted()}`, 'success');
                }
                break;
            }

            case 'setfunds': {
                const amount = parseInt(args[0], 10);
                if (isNaN(amount) || amount < 0) {
                    appendLog('ERROR: Indica un número válido. Ej: setfunds 1000000', 'error');
                } else {
                    gameInstance.funds = amount;
                    refreshStats();
                    appendLog(`OK: Saldo fijado en ${getFundsFormatted()}`, 'success');
                }
                break;
            }

            case 'rp':
            case 'research': {
                const amount = parseInt(args[0], 10) || 100;
                gameInstance.researchPoints = (gameInstance.researchPoints || 0) + amount;
                refreshStats();
                appendLog(`OK: +${amount} RP otorgados. Total: ${getRP()} RP`, 'success');
                break;
            }

            case 'heal':
            case 'stamina':
            case 'energy':
                if (gameInstance.employees) {
                    gameInstance.employees.forEach(emp => {
                        emp.energy = 100;
                        emp.stamina = 100;
                        emp.fatigue = 0;
                    });
                }
                refreshStats();
                appendLog('OK: Toda la plantilla tiene energía al 100% y cero fatiga.', 'success');
                break;

            case 'morale':
                if (gameInstance.employees) {
                    gameInstance.employees.forEach(emp => { emp.morale = 100; });
                }
                refreshStats();
                appendLog('OK: Moral de la plantilla al 100%.', 'success');
                break;

            case 'hype': {
                const amount = parseInt(args[0], 10) || 10;
                gameInstance.hype = (gameInstance.hype || 0) + amount;
                refreshStats();
                appendLog(`OK: +${amount} Hype. Total: ${gameInstance.hype}`, 'success');
                break;
            }

            case 'godmode':
                gameInstance.funds = Math.max(gameInstance.funds, 50000000);
                gameInstance.researchPoints = (gameInstance.researchPoints || 0) + 5000;
                gameInstance.hype = (gameInstance.hype || 0) + 50;
                if (gameInstance.employees) {
                    gameInstance.employees.forEach(e => {
                        e.energy = 100;
                        e.stamina = 100;
                        e.fatigue = 0;
                        e.morale = 100;
                    });
                }
                refreshStats();
                appendLog('★ MODO DIOS ACTIVADO: 50.000.000 €, +5.000 RP, +50 Hype y 100% Energía.', 'gold');
                break;

            case 'save':
                window.autosaveCurrentGame?.();
                appendLog('OK: Partida guardada con éxito en almacenamiento persistente.', 'success');
                break;

            case 'advance': {
                const weeks = Math.min(52, Math.max(1, parseInt(args[0], 10) || 1));
                for (let i = 0; i < weeks; i++) {
                    gameInstance.advanceWeek?.();
                }
                refreshStats();
                appendLog(`OK: Simulación avanzada ${weeks} semana(s).`, 'success');
                break;
            }

            case 'news-2006':
            case 'os-news': {
                gameInstance.createIndustryEvent?.('os_launch_2006');
                appendLog('OK: Noticia de lanzamiento de SO 2006 publicada en La Gaceta Tecnológica.', 'success');
                break;
            }

            case 'update-2006':
            case 'os-update': {
                if (window.uwuntuOS) {
                    window.uwuntuOS.launchApp('app-os-update');
                    appendLog('OK: Abriendo Centro de Actualizaciones de Sistema...', 'success');
                }
                break;
            }

            case 'clear':
                if (termLog) termLog.innerHTML = '';
                break;

            default:
                appendLog(`Comando no reconocido: «${cmd}». Escribe "help" para ver las opciones.`, 'error');
                break;
        }

        window.soundEngine?.playClick?.();
    });
}

// 5.B CUSTOM APP: UWUNTU UPDATE · CENTRO DE ACTUALIZACIONES
export function renderOSUpdateAppContent(container, gameInstance, osInstance) {
    const os = osInstance || window.uwuntuOS;
    const isUpdated = os?.is2006Updated || Boolean(gameInstance?.osUpdated2006);
    const historicalYear = os?.getHistoricalYear ? os.getHistoricalYear() : (1981 + (gameInstance?.year || 1));
    const isAvailable = (historicalYear >= 2006 || os?.forceUpdateAvailable) && !isUpdated;

    if (isUpdated) {
        // Up-to-date screen
        container.innerHTML = `
            <div class="os-update-container up-to-date-view">
                <div class="update-header">
                    <div class="update-header-badge success">
                        <span class="badge-dot-green"></span>
                        <span class="badge-text">SISTEMA AL DÍA</span>
                    </div>
                    <h2 class="update-main-title">Centro de Actualizaciones Uwuntu XD</h2>
                    <p class="update-main-sub">Tu estación de trabajo cuenta con la última versión oficial del sistema operativo.</p>
                </div>

                <div class="update-status-card success-card">
                    <div class="status-icon-box">
                        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="24" cy="24" r="20" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e"/>
                            <polyline points="15 24 21 30 33 18" stroke="#4ade80" stroke-width="3"/>
                        </svg>
                    </div>
                    <div class="status-details">
                        <div class="status-title-row">
                            <h3 class="status-title">Uwuntu XD 2006 · Edición Crystal Aero</h3>
                            <span class="status-badge-active">Versión 6.0 (Build 2006.11)</span>
                        </div>
                        <p class="status-desc">Arquitectura ultranítida de alto rendimiento con aceleración para desarrollo de videojuegos de última generación.</p>
                        <div class="status-features-active">
                            <span class="feat-pill"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6 11 13 4"/></svg> Interfaz Ultranítida Activa</span>
                            <span class="feat-pill"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6 11 13 4"/></svg> Aceleración Gráfica DirectX 9 / OpenGL</span>
                            <span class="feat-pill"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6 11 13 4"/></svg> Antialiasing Crystal Aero</span>
                            <span class="feat-pill"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6 11 13 4"/></svg> Multitarea Fluida 60 FPS</span>
                        </div>
                    </div>
                </div>

                <div class="update-actions-bar">
                    <button type="button" class="btn-check-updates" id="btn-check-updates">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 8A6.5 6.5 0 0 0 4.5 7"></path>
                            <polyline points="4.5 3 4.5 7 8.5 7"></polyline>
                            <path d="M4 12a6.5 6.5 0 0 0 11.5 1"></path>
                            <polyline points="15.5 17 15.5 13 11.5 13"></polyline>
                        </svg>
                        <span>Buscar actualizaciones</span>
                    </button>
                    <button type="button" class="btn-toggle-classic" id="btn-toggle-classic-theme">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="10" cy="10" r="7"/>
                            <path d="M10 3v14"/>
                        </svg>
                        <span>Alternar vista clásica / Crystal Aero</span>
                    </button>
                </div>

                <div class="update-history-section">
                    <h4 class="history-title">Historial de versiones del estudio</h4>
                    <div class="history-list">
                        <div class="history-item current">
                            <div class="hist-bullet active"></div>
                            <div class="hist-info">
                                <div class="hist-header">
                                    <strong>Uwuntu XD 2006 Crystal Aero (v6.0)</strong>
                                    <span class="hist-tag active">Instalado</span>
                                </div>
                                <p>Interfaz con efectos de cristal translúcido, renderizado ultranítido de alta definición, compatibilidad acelerada de motores 3D y estabilidad para grandes producciones.</p>
                            </div>
                        </div>
                        <div class="history-item">
                            <div class="hist-bullet"></div>
                            <div class="hist-info">
                                <div class="hist-header">
                                    <strong>Uwuntu XD Fusion Millennium (v5.0)</strong>
                                    <span class="hist-tag">Anterior</span>
                                </div>
                                <p>Soporte de audio multicanal y entorno de desarrollo de principios de los 2000.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const checkBtn = container.querySelector('#btn-check-updates');
        checkBtn?.addEventListener('click', () => {
            checkBtn.disabled = true;
            checkBtn.innerHTML = `<span>Comprobando repositorios oficiales...</span>`;
            setTimeout(() => {
                checkBtn.disabled = false;
                checkBtn.innerHTML = `
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8A6.5 6.5 0 0 0 4.5 7"/><polyline points="4.5 3 4.5 7 8.5 7"/><path d="M4 12a6.5 6.5 0 0 0 11.5 1"/><polyline points="15.5 17 15.5 13 11.5 13"/></svg>
                    <span>Buscar actualizaciones</span>
                `;
                window.showToast?.('[[DE_ICON_073]] No hay nuevas actualizaciones disponibles. Tu equipo dispone de la versión más reciente.', 'info');
            }, 800);
        });

        const toggleBtn = container.querySelector('#btn-toggle-classic-theme');
        toggleBtn?.addEventListener('click', () => {
            const desk = document.getElementById('uwuntu-desktop-environment');
            if (desk) {
                desk.classList.toggle('os-updated-2006');
                const isNowAero = desk.classList.contains('os-updated-2006');
                window.showToast?.(isNowAero ? '[[DE_ICON_073]] Estética Crystal Aero 2006 activada.' : '[[DE_ICON_060]] Estética clásica activada temporalmente.', 'info');
            }
        });
        return;
    }

    // Update Available Screen
    container.innerHTML = `
        <div class="os-update-container">
            <div class="update-header">
                <div class="update-header-badge ${isAvailable ? 'pulse-blue' : ''}">
                    <span class="badge-dot-blue"></span>
                    <span class="badge-text">${isAvailable ? 'NUEVA VERSIÓN 2006 DISPONIBLE' : 'VERSIÓN EN DESARROLLO (AÑO 2006)'}</span>
                </div>
                <h2 class="update-main-title">Centro de Actualizaciones de Sistema</h2>
                <p class="update-main-sub">La industria informática de 2006 ha dado el salto a la alta definición y gráficos translúcidos.</p>
            </div>

            <div class="update-hero-banner">
                <div class="hero-brand-col">
                    <div class="hero-os-icon">
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="64" height="64" rx="16" fill="url(#aero-grad-bg)"/>
                            <circle cx="32" cy="32" r="22" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
                            <path d="M32 14v18l14 10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
                            <circle cx="32" cy="32" r="5" fill="#38bdf8"/>
                            <defs>
                                <linearGradient id="aero-grad-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#0284c7"/>
                                    <stop offset="0.5" stop-color="#0369a1"/>
                                    <stop offset="1" stop-color="#0f172a"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
                <div class="hero-details-col">
                    <div class="hero-title-row">
                        <h3 class="hero-title">Uwuntu XD 2006 · Crystal Aero</h3>
                        <span class="hero-release-pill">Año 2006 · Build 2006.11</span>
                    </div>
                    <p class="hero-summary">
                        Revolución en la estética y rendimiento de tu estación de trabajo. Introduce el motor visual <strong>Aero Glass</strong> con ventanas translúcidas, tipografía con nitidez de alta resolución, aceleración gráfica para pipelines de desarrollo y mayor fluidez de multitarea.
                    </p>
                    <div class="hero-specs-row">
                        <span class="spec-item"><strong>Requisitos:</strong> Compatibilidad 100%</span>
                        <span class="spec-item"><strong>Descarga:</strong> 2.4 GB (Verificado OK)</span>
                        <span class="spec-item"><strong>Licencia:</strong> Gratuita (Estudio)</span>
                    </div>
                </div>
            </div>

            <!-- Features 4-grid -->
            <div class="update-features-grid">
                <div class="feature-card">
                    <div class="feature-icon-box text-cyan">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                            <line x1="2" y1="8" x2="22" y2="8"/>
                        </svg>
                    </div>
                    <h4 class="feature-title">Interfaz Crystal Aero Ultranítida</h4>
                    <p class="feature-text">Ventanas con acabado de cristal pulido, tipografía optimizada con antialiasing de precisión y contraste equilibrado para evitar el cansancio visual.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon-box text-emerald">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="4" y="4" width="16" height="16" rx="2"/>
                            <rect x="9" y="9" width="6" height="6"/>
                            <line x1="9" y1="1" x2="9" y2="4"/>
                            <line x1="15" y1="1" x2="15" y2="4"/>
                            <line x1="9" y1="20" x2="9" y2="23"/>
                            <line x1="15" y1="20" x2="15" y2="23"/>
                            <line x1="20" y1="9" x2="23" y2="9"/>
                            <line x1="20" y1="14" x2="23" y2="14"/>
                            <line x1="1" y1="9" x2="4" y2="9"/>
                            <line x1="1" y1="14" x2="4" y2="14"/>
                        </svg>
                    </div>
                    <h4 class="feature-title">Aceleración DAG & Motores 3D</h4>
                    <p class="feature-text">Compatibilidad con las APIs de renderizado de 2006 para compilar proyectos más rápido y visualizar árboles de tecnología sin latencia.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon-box text-blue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                            <polyline points="2 17 12 22 22 17"/>
                            <polyline points="2 12 12 17 22 12"/>
                        </svg>
                    </div>
                    <h4 class="feature-title">Multitarea Fluida y Barra Glass</h4>
                    <p class="feature-text">Barra de tareas con reflejo especular de cristal, sombreado volumétrico y transiciones instantáneas entre herramientas del estudio.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon-box text-purple">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <h4 class="feature-title">Seguridad & Notificaciones Proactivas</h4>
                    <p class="feature-text">Bandeja de sistema con indicadores inteligentes y blindaje de procesos para proteger tu código contra fallos y fugas.</p>
                </div>
            </div>

            <!-- Install Box -->
            <div class="update-install-box">
                <div class="install-ready-info" id="install-ready-info">
                    <div class="ready-text-col">
                        <strong>¿Deseas instalar Uwuntu XD 2006 Crystal Aero ahora?</strong>
                        <p>La instalación descargará los paquetes y realizará un reinicio rápido del escritorio (conservando todos tus datos y proyectos intactos).</p>
                    </div>
                    <div class="ready-btn-col">
                        <button type="button" class="btn-install-update" id="btn-start-install-os">
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M10 3v10m-4-4l4 4 4-4M3 17h14"/>
                            </svg>
                            <span>Instalar y Reiniciar Escritorio</span>
                        </button>
                    </div>
                </div>

                <!-- Progress container (hidden by default) -->
                <div class="install-progress-box" id="install-progress-box" hidden>
                    <div class="progress-labels">
                        <span class="progress-status-text" id="install-status-text">Descargando paquetes de sistema...</span>
                        <strong class="progress-pct" id="install-pct-text">0%</strong>
                    </div>
                    <div class="progress-bar-track">
                        <div class="progress-bar-fill" id="install-bar-fill" style="width: 0%;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const installBtn = container.querySelector('#btn-start-install-os');
    installBtn?.addEventListener('click', () => {
        const readyInfo = container.querySelector('#install-ready-info');
        const progressBox = container.querySelector('#install-progress-box');
        const statusText = container.querySelector('#install-status-text');
        const pctText = container.querySelector('#install-pct-text');
        const barFill = container.querySelector('#install-bar-fill');

        if (readyInfo) readyInfo.hidden = true;
        if (progressBox) progressBox.hidden = false;

        let pct = 0;
        const steps = [
            { target: 25, label: 'Descargando paquetes del sistema Uwuntu 2006 (2.4 GB)...' },
            { target: 55, label: 'Instalando controladores gráficos y tipografías ultranítidas Crystal Aero...' },
            { target: 85, label: 'Configurando acelerador de compilación de proyectos y pipelines 3D...' },
            { target: 100, label: '¡Instalación completada! Iniciando reinicio de escritorio...' }
        ];
        let stepIdx = 0;

        const interval = setInterval(() => {
            if (stepIdx < steps.length) {
                const step = steps[stepIdx];
                pct += 4;
                if (pct >= step.target) {
                    pct = step.target;
                    stepIdx++;
                }
                if (statusText) statusText.textContent = step.label;
                if (pctText) pctText.textContent = `${pct}%`;
                if (barFill) barFill.style.width = `${pct}%`;

                if (pct >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        os?.executeOSUpdate?.(() => {
                            renderOSUpdateAppContent(container, gameInstance, os);
                        });
                    }, 400);
                }
            }
        }, 50);
    });
}

// 6. CUSTOM APP: UWUNTU STORE · SOFTWARE HUB
export const STORE_CATALOG = [
    {
        id: 'app-casino', name: 'Casino Royale · Salón privado', shortName: 'Casino',
        category: 'Finanzas & Análisis', categoryKey: 'finance', availableYear: 2010,
        icon: APP_ICONS.casino, badgeColor: '#c49543', author: 'Royale Digital', version: 'v1.0',
        size: '28 MB', rating: '4.2', ratingCount: '2.1k', downloads: '18k',
        description: 'Tragaperras, blackjack y ruleta para apostar fondos o franquicias del estudio.',
        features: ['Tres juegos de azar', 'Apuestas con dinero o franquicias', 'Historial de resultados'], isHero: false
    },
    {
        id: 'app-vread',
        name: 'Vread · Red Social y Comunidad',
        shortName: 'Vread',
        category: 'Redes & Comunidad',
        categoryKey: 'social',
        icon: APP_ICONS.vread,
        badgeColor: '#0ea5e9',
        author: 'Comunidad Abierta Uwuntu',
        version: 'v1.4.2',
        size: '14.8 MB',
        rating: '4.9',
        ratingCount: '12.4k',
        downloads: '84.2k',
        description: 'La primera red social de debate de videojuegos en directo. Recibe el veredicto sin filtros de tu audiencia, quejas por bugs, elogios a la banda sonora y sugerencias de secuelas.',
        features: [
            'Recepción de críticas en directo tras lanzamientos',
            'Seguimiento de hashtags y tendencias de la industria',
            'Publicación de comunicados y noticias del estudio',
            'Simulación de streamers e influencers del sector'
        ],
        isHero: true
    },
    {
        id: 'app-store-synth',
        name: 'AudioSynthesizer 84 · Chiptune FX',
        shortName: 'AudioSynth',
        category: 'Producción de Audio',
        categoryKey: 'audio',
        icon: APP_ICONS.synth,
        badgeColor: '#8b5cf6',
        author: 'RetroWave Chiptunes Org',
        version: 'v2.1.0',
        size: '6.2 MB',
        rating: '4.8',
        ratingCount: '6.8k',
        downloads: '45.1k',
        description: 'Estación de síntesis FM retro para diseñar efectos chiptune y bandas sonoras de 8 y 16 bits. Cuenta con teclado táctil interactivo, generadores de onda de pulso y sierra, y visualizador de frecuencias.',
        features: [
            'Osciladores polifónicos (Square, Saw, Triangle, Sine)',
            'Control interactivo de decay y octavas',
            'Teclado de piano tocable con ratón o teclado físico',
            'Visualizador de espectro sonoro en tiempo real'
        ],
        isHero: false
    },
    {
        id: 'app-store-calc',
        name: 'Calculadora de Regalías & Break-Even',
        shortName: 'Calc Regalías',
        category: 'Finanzas & Análisis',
        categoryKey: 'finance',
        icon: APP_ICONS.calc,
        badgeColor: '#10b981',
        author: 'Dev Finance Suite',
        version: 'v3.0.1',
        size: '3.5 MB',
        rating: '4.7',
        ratingCount: '4.2k',
        downloads: '32.9k',
        description: 'Herramienta de simulación económica que calcula los márgenes netos, punto de equilibrio comercial y proyecciones de retorno sobre la inversión (ROI) para proyectos de desarrollo.',
        features: [
            'Cálculo de márgenes tras deducción de tiendas y royalties',
            'Punto de equilibrio (unidades mínimas requeridas)',
            'Proyecciones de ingresos a 10k, 50k y 250k ventas',
            'Sincronización de costes reales del proyecto en curso'
        ],
        isHero: false
    },
    {
        id: 'app-os-update',
        name: 'Uwuntu Update · Actualizaciones del Sistema',
        shortName: 'Actualizaciones',
        category: 'Herramientas de Sistema',
        categoryKey: 'system',
        icon: APP_ICONS.osUpdate,
        badgeColor: '#0ea5e9',
        author: 'Uwuntu Core Team',
        version: 'v6.0.0',
        size: '2.4 GB',
        rating: '5.0',
        ratingCount: '48.9k',
        downloads: '150k',
        description: 'Centro de control de parches y versiones mayores del sistema operativo para estaciones de desarrollo.',
        features: [
            'Actualización mayor a Uwuntu XD 2006 Crystal Aero',
            'Efectos translúcidos de cristal y nitidez de alta resolución',
            'Acelerador de compilación para árboles de arquitectura DAG',
            'Blindaje de memoria y avisos proactivos en la bandeja'
        ],
        isHero: false
    }
];

export function renderStoreAppContent(container, gameInstance) {
    let currentCategory = 'all';
    let searchQuery = '';

    const STAR_SVG = `<svg viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" stroke-width="1" class="store-star-svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="store-check-svg"><polyline points="20 6 9 17 4 12"/></svg>`;
    const DOWNLOAD_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="store-dl-svg"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
    const TRASH_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="store-trash-svg"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

    function renderView() {
        const os = window.uwuntuOS;
        const installedSet = os ? os.installedApps : new Set();

        const filteredCatalog = STORE_CATALOG.filter(item => {
            if (item.availableYear && (os?.getHistoricalYear?.() ?? gameInstance.getHistoricalYear()) < item.availableYear) return false;
            const matchesCat = currentCategory === 'all' || item.categoryKey === currentCategory;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q ||
                item.name.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                item.author.toLowerCase().includes(q);
            return matchesCat && matchesSearch;
        });

        const heroApp = STORE_CATALOG.find(i => i.isHero) || STORE_CATALOG[0];
        const isHeroInstalled = installedSet.has(heroApp.id);

        container.innerHTML = `
            <div class="store-window-view">
                <!-- Top Toolbar -->
                <header class="store-topbar">
                    <div class="store-brand">
                        <div class="store-logo-wrap">${APP_ICONS.store}</div>
                        <div class="store-brand-meta">
                            <span class="store-kicker">UWUNTU XD WORKSTATION REPOSITORY</span>
                            <h2 class="store-title">Software Hub · Centro de Aplicaciones</h2>
                        </div>
                    </div>
                    <div class="store-search-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="store-search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" id="store-search-input" class="store-search-input" placeholder="Buscar aplicaciones, módulos o paquetes..." value="${searchQuery}" autocomplete="off">
                    </div>
                </header>

                <!-- Category Navigation Pills -->
                <nav class="store-nav-pills" aria-label="Categorías del repositorio">
                    <button type="button" class="store-nav-pill ${currentCategory === 'all' ? 'is-active' : ''}" data-cat="all">
                        <span>Todos los paquetes (${STORE_CATALOG.length})</span>
                    </button>
                    <button type="button" class="store-nav-pill ${currentCategory === 'social' ? 'is-active' : ''}" data-cat="social">
                        <span>Redes & Comunidad (1)</span>
                    </button>
                    <button type="button" class="store-nav-pill ${currentCategory === 'audio' ? 'is-active' : ''}" data-cat="audio">
                        <span>Producción de Audio (1)</span>
                    </button>
                    <button type="button" class="store-nav-pill ${currentCategory === 'finance' ? 'is-active' : ''}" data-cat="finance">
                        <span>Finanzas & Análisis (1)</span>
                    </button>
                </nav>

                <div class="store-viewport">
                    <!-- Featured Hero Banner (App highlight) -->
                    <section class="store-hero-banner store-app-card" data-app-id="${heroApp.id}" style="--hero-accent: ${heroApp.badgeColor};">
                        <div class="hero-bg-glow" aria-hidden="true"></div>
                        <div class="hero-left-col">
                            <div class="hero-badge-row">
                                <span class="hero-pill-kicker">DESTACADO DEL MES</span>
                                <span class="hero-pill-cat">${heroApp.category}</span>
                                <span class="hero-pill-size">${heroApp.size}</span>
                            </div>
                            <h3 class="hero-title">${heroApp.name}</h3>
                            <p class="hero-desc">${heroApp.description}</p>
                            <div class="hero-features-list">
                                ${heroApp.features.map(f => `<span class="hero-feat-tag">${CHECK_SVG} ${f}</span>`).join('')}
                            </div>
                            <div class="hero-stats-row">
                                <div class="hero-stat-item">
                                    <span class="stat-stars">${STAR_SVG} <strong>${heroApp.rating}</strong></span>
                                    <span class="stat-meta">(${heroApp.ratingCount} opiniones)</span>
                                </div>
                                <div class="hero-stat-sep">·</div>
                                <div class="hero-stat-item">
                                    <strong>${heroApp.downloads}</strong>
                                    <span class="stat-meta">descargas</span>
                                </div>
                                <div class="hero-stat-sep">·</div>
                                <div class="hero-stat-item">
                                    <span class="stat-author">${heroApp.author}</span>
                                </div>
                            </div>
                            <div class="hero-action-row" id="hero-action-row">
                                ${isHeroInstalled ? `
                                    <button type="button" class="store-btn primary open-app-btn" data-app-id="${heroApp.id}">
                                        <span>Abrir ${heroApp.shortName}</span>
                                    </button>
                                    <button type="button" class="store-btn danger ghost uninstall-app-btn" data-app-id="${heroApp.id}">
                                        ${TRASH_SVG}
                                        <span>Desinstalar</span>
                                    </button>
                                    <span class="installed-tag">${CHECK_SVG} Instalada en el escritorio</span>
                                ` : `
                                    <button type="button" class="store-btn primary install-app-btn" data-app-id="${heroApp.id}">
                                        ${DOWNLOAD_SVG}
                                        <span class="btn-text">Descargar e Instalar (${heroApp.size})</span>
                                        <div class="install-progress-bar" aria-hidden="true"></div>
                                    </button>
                                    <span class="store-free-badge">Software Gratuito & Open Source</span>
                                `}
                            </div>
                        </div>
                        <div class="hero-right-col">
                            <div class="hero-icon-display">
                                <div class="hero-icon-inner">${heroApp.icon}</div>
                                <div class="hero-icon-rings" aria-hidden="true"></div>
                            </div>
                        </div>
                    </section>

                    <!-- Catalog Section Header -->
                    <div class="store-catalog-header">
                        <div class="catalog-header-text">
                            <h4 class="catalog-section-title">Catálogo de Software Disponible</h4>
                            <p class="catalog-section-subtitle">Instala herramientas complementarias para tu estación de trabajo Uwuntu XD.</p>
                        </div>
                        <span class="catalog-count-pill">${filteredCatalog.length} software disponible</span>
                    </div>

                    <!-- Catalog Grid -->
                    <div class="store-catalog-grid" id="store-catalog-grid">
                        ${filteredCatalog.map(app => {
                            const isInstalled = installedSet.has(app.id);
                            return `
                                <article class="store-app-card" data-app-id="${app.id}" style="--card-accent: ${app.badgeColor};">
                                    <div class="card-top-row">
                                        <div class="card-icon-wrap">${app.icon}</div>
                                        <div class="card-title-group">
                                            <div class="card-cat-line">
                                                <span class="card-cat-badge">${app.category}</span>
                                                <span class="card-version">${app.version}</span>
                                            </div>
                                            <h4 class="card-app-name">${app.name}</h4>
                                            <span class="card-author">${app.author}</span>
                                        </div>
                                    </div>
                                    <p class="card-desc">${app.description}</p>
                                    <div class="card-meta-bar">
                                        <div class="card-rating">
                                            ${STAR_SVG}
                                            <strong>${app.rating}</strong>
                                            <span class="card-count">(${app.ratingCount})</span>
                                        </div>
                                        <div class="card-meta-right">
                                            <span class="card-size">${app.size}</span>
                                            <span class="card-dls">${app.downloads} inst.</span>
                                        </div>
                                    </div>
                                    <div class="card-action-bar">
                                        ${isInstalled ? `
                                            <button type="button" class="store-btn primary open-app-btn" data-app-id="${app.id}">
                                                <span>Abrir</span>
                                            </button>
                                            <button type="button" class="store-btn danger ghost uninstall-app-btn" data-app-id="${app.id}" title="Desinstalar del sistema">
                                                ${TRASH_SVG}
                                            </button>
                                            <span class="card-installed-status">${CHECK_SVG} Instalada</span>
                                        ` : `
                                            <button type="button" class="store-btn primary install-app-btn" data-app-id="${app.id}">
                                                ${DOWNLOAD_SVG}
                                                <span class="btn-text">Instalar (${app.size})</span>
                                                <div class="install-progress-bar" aria-hidden="true"></div>
                                            </button>
                                        `}
                                    </div>
                                </article>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        // Bind Category filter pills
        container.querySelectorAll('.store-nav-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                currentCategory = pill.dataset.cat;
                renderView();
            });
        });

        // Bind Search Input
        const searchInput = container.querySelector('#store-search-input');
        searchInput?.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderView();
            const newInput = container.querySelector('#store-search-input');
            if (newInput) {
                newInput.focus();
                newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
            }
        });

        // Bind Launch App Buttons
        container.querySelectorAll('.open-app-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.appId;
                if (id) os?.launchApp(id);
            });
        });

        // Bind Uninstall App Buttons
        container.querySelectorAll('.uninstall-app-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.appId;
                if (id) {
                    os?.uninstallApp(id, () => renderView());
                }
            });
        });

        // Bind Install App Buttons with animated progress bar
        container.querySelectorAll('.install-app-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.appId;
                if (!id || btn.classList.contains('is-installing')) return;

                btn.classList.add('is-installing');
                btn.disabled = true;
                const textEl = btn.querySelector('.btn-text');
                const progBar = btn.querySelector('.install-progress-bar');

                if (textEl) textEl.textContent = 'Conectando...';

                setTimeout(() => {
                    if (textEl) textEl.textContent = 'Descargando... 45%';
                    if (progBar) progBar.style.width = '45%';
                }, 400);

                setTimeout(() => {
                    if (textEl) textEl.textContent = 'Descargando... 88%';
                    if (progBar) progBar.style.width = '88%';
                }, 850);

                setTimeout(() => {
                    if (textEl) textEl.textContent = 'Instalando paquetes...';
                    if (progBar) progBar.style.width = '100%';
                }, 1250);

                setTimeout(() => {
                    os?.installApp(id, () => {
                        renderView();
                    });
                }, 1600);
            });
        });
    }

    renderView();
}

// 7. CUSTOM APP: AUDIO SYNTHESIZER 84 (FM CHIPTUNE SOUND GENERATOR)
export function renderSynthAppContent(container) {
    let audioCtx = null;
    let currentWave = 'square';
    let currentOctave = 0; // -1, 0, +1
    let decayTime = 0.35;
    let volumeLevel = 0.25;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioClass = window.AudioContext || window.webkitAudioContext;
            if (AudioClass) audioCtx = new AudioClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playFrequency(freq, customWave = null, duration = null) {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const mult = Math.pow(2, currentOctave);
        const actualFreq = freq * mult;

        osc.type = customWave || currentWave;
        osc.frequency.setValueAtTime(actualFreq, ctx.currentTime);

        const dur = duration !== null ? duration : decayTime;
        gain.gain.setValueAtTime(volumeLevel, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + dur);
    }

    const NOTES = [
        { name: 'C4', label: 'Do', freq: 261.63, isBlack: false, key: 'A' },
        { name: 'C#4', label: 'Do#', freq: 277.18, isBlack: true, key: 'W' },
        { name: 'D4', label: 'Re', freq: 293.66, isBlack: false, key: 'S' },
        { name: 'D#4', label: 'Re#', freq: 311.13, isBlack: true, key: 'E' },
        { name: 'E4', label: 'Mi', freq: 329.63, isBlack: false, key: 'D' },
        { name: 'F4', label: 'Fa', freq: 349.23, isBlack: false, key: 'F' },
        { name: 'F#4', label: 'Fa#', freq: 369.99, isBlack: true, key: 'T' },
        { name: 'G4', label: 'Sol', freq: 392.00, isBlack: false, key: 'G' },
        { name: 'G#4', label: 'Sol#', freq: 415.30, isBlack: true, key: 'Y' },
        { name: 'A4', label: 'La', freq: 440.00, isBlack: false, key: 'H' },
        { name: 'A#4', label: 'La#', freq: 466.16, isBlack: true, key: 'U' },
        { name: 'B4', label: 'Si', freq: 493.88, isBlack: false, key: 'J' },
        { name: 'C5', label: 'Do 5', freq: 523.25, isBlack: false, key: 'K' },
        { name: 'C#5', label: 'Do#5', freq: 554.37, isBlack: true, key: 'O' },
        { name: 'D5', label: 'Re 5', freq: 587.33, isBlack: false, key: 'L' }
    ];

    container.innerHTML = `
        <div class="synth-window-view">
            <!-- Synth Rack Header -->
            <header class="synth-header-bar">
                <div class="synth-brand">
                    <div class="synth-logo-icon">${APP_ICONS.synth}</div>
                    <div class="synth-brand-text">
                        <span class="synth-kicker">CHIPTUNE SOUND ENGINE · 8/16-BIT FM</span>
                        <h3 class="synth-title">AudioSynthesizer 84 Workstation</h3>
                    </div>
                </div>
                <div class="synth-status-led" title="DSP Audio Activo">
                    <span class="synth-led-dot"></span>
                    <span class="synth-led-label">DSP 44.1 kHz</span>
                </div>
            </header>

            <!-- Synth Control Rack -->
            <div class="synth-rack-controls">
                <!-- Waveform Select -->
                <div class="synth-control-group">
                    <label class="synth-control-label">Forma de Onda</label>
                    <div class="synth-wave-buttons">
                        <button type="button" class="synth-wave-btn ${currentWave === 'square' ? 'is-active' : ''}" data-wave="square">Cuadrada</button>
                        <button type="button" class="synth-wave-btn ${currentWave === 'sawtooth' ? 'is-active' : ''}" data-wave="sawtooth">Sierra</button>
                        <button type="button" class="synth-wave-btn ${currentWave === 'triangle' ? 'is-active' : ''}" data-wave="triangle">Triángulo</button>
                        <button type="button" class="synth-wave-btn ${currentWave === 'sine' ? 'is-active' : ''}" data-wave="sine">Senoidal</button>
                    </div>
                </div>

                <!-- Octave & Decay -->
                <div class="synth-control-group">
                    <label class="synth-control-label">Octava</label>
                    <div class="synth-octave-buttons">
                        <button type="button" class="synth-oct-btn" data-oct="-1">-1</button>
                        <span class="synth-oct-display" id="synth-oct-label">0 (Normal)</span>
                        <button type="button" class="synth-oct-btn" data-oct="1">+1</button>
                    </div>
                </div>

                <div class="synth-control-group">
                    <label class="synth-control-label" for="synth-decay-slider">Decay: <span id="decay-val">0.35s</span></label>
                    <input type="range" id="synth-decay-slider" min="0.08" max="1.2" step="0.05" value="0.35" class="synth-slider">
                </div>

                <div class="synth-control-group">
                    <label class="synth-control-label" for="synth-vol-slider">Volumen: <span id="vol-val">25%</span></label>
                    <input type="range" id="synth-vol-slider" min="0.05" max="0.6" step="0.05" value="0.25" class="synth-slider">
                </div>
            </div>

            <!-- Quick FX Presets -->
            <div class="synth-presets-bar">
                <span class="presets-label">Presets FX Arcade:</span>
                <button type="button" class="synth-fx-btn" id="fx-jump">Salto 8-bit</button>
                <button type="button" class="synth-fx-btn" id="fx-coin">Moneda / Ítem</button>
                <button type="button" class="synth-fx-btn" id="fx-laser">Láser Blaster</button>
                <button type="button" class="synth-fx-btn" id="fx-powerup">Fanfarria Nivel</button>
            </div>

            <!-- Virtual Piano Keyboard -->
            <div class="synth-keyboard-viewport">
                <div class="synth-piano-keys" id="synth-piano-keys">
                    ${NOTES.map(note => `
                        <button type="button" 
                            class="synth-key ${note.isBlack ? 'key-black' : 'key-white'}" 
                            data-note="${note.name}" 
                            data-freq="${note.freq}"
                            aria-label="Nota ${note.name}">
                            <span class="key-name">${note.label}</span>
                            <span class="key-kbd">${note.key}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Event bindings for controls
    container.querySelectorAll('.synth-wave-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentWave = btn.dataset.wave;
            container.querySelectorAll('.synth-wave-btn').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            playFrequency(440, currentWave, 0.2);
        });
    });

    const octLabel = container.querySelector('#synth-oct-label');
    container.querySelectorAll('.synth-oct-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const delta = Number(btn.dataset.oct);
            currentOctave = Math.max(-1, Math.min(1, currentOctave + delta));
            if (octLabel) {
                octLabel.textContent = currentOctave === 0 ? '0 (Normal)' : (currentOctave > 0 ? '+1 (Agudo)' : '-1 (Grave)');
            }
        });
    });

    const decaySlider = container.querySelector('#synth-decay-slider');
    const decayVal = container.querySelector('#decay-val');
    decaySlider?.addEventListener('input', (e) => {
        decayTime = parseFloat(e.target.value);
        if (decayVal) decayVal.textContent = `${decayTime.toFixed(2)}s`;
    });

    const volSlider = container.querySelector('#synth-vol-slider');
    const volVal = container.querySelector('#vol-val');
    volSlider?.addEventListener('input', (e) => {
        volumeLevel = parseFloat(e.target.value);
        if (volVal) volVal.textContent = `${Math.round(volumeLevel * 100 / 0.6)}%`;
    });

    // Piano key clicks
    container.querySelectorAll('.synth-key').forEach(keyBtn => {
        const freq = parseFloat(keyBtn.dataset.freq);
        const trigger = () => {
            keyBtn.classList.add('is-pressed');
            playFrequency(freq);
            setTimeout(() => keyBtn.classList.remove('is-pressed'), 180);
        };
        keyBtn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            trigger();
        });
    });

    // Presets
    container.querySelector('#fx-jump')?.addEventListener('click', () => {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.16);
        gain.gain.setValueAtTime(volumeLevel, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    });

    container.querySelector('#fx-coin')?.addEventListener('click', () => {
        playFrequency(987.77, 'square', 0.08);
        setTimeout(() => playFrequency(1318.51, 'square', 0.28), 90);
    });

    container.querySelector('#fx-laser')?.addEventListener('click', () => {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(volumeLevel, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
    });

    container.querySelector('#fx-powerup')?.addEventListener('click', () => {
        const notes = [330, 392, 659, 523, 587, 784];
        notes.forEach((f, idx) => {
            setTimeout(() => playFrequency(f, 'triangle', 0.18), idx * 80);
        });
    });
}

// 8. CUSTOM APP: CALCULADORA DE REGALÍAS & BREAK-EVEN
export function renderCalcAppContent(container, gameInstance) {
    let budget = 45000;
    let unitPrice = 19.99;
    let storeCut = 30; // 30% digital store / distributor
    let royaltyCut = 15; // 15% publisher / engine royalty
    let marketingSpend = 12000;

    function formatMoney(num) {
        return Math.round(num).toLocaleString('es-ES') + ' €';
    }

    function calculate() {
        const feePercent = (storeCut + royaltyCut) / 100;
        const netPerUnit = Math.max(0.01, unitPrice * (1 - feePercent));
        const totalFixedCosts = budget + marketingSpend;
        const breakEvenUnits = Math.ceil(totalFixedCosts / netPerUnit);

        const scenarios = [
            { units: 10000, label: '10.000 copias' },
            { units: 50000, label: '50.000 copias' },
            { units: 250000, label: '250.000 copias' }
        ];

        const scenarioResults = scenarios.map(sc => {
            const gross = sc.units * unitPrice;
            const netRevenue = sc.units * netPerUnit;
            const netProfit = netRevenue - totalFixedCosts;
            const roi = totalFixedCosts > 0 ? ((netProfit / totalFixedCosts) * 100).toFixed(0) : 0;
            return {
                ...sc,
                gross,
                netRevenue,
                netProfit,
                roi
            };
        });

        return {
            netPerUnit,
            totalFixedCosts,
            breakEvenUnits,
            scenarioResults
        };
    }

    function renderView() {
        const results = calculate();

        container.innerHTML = `
            <div class="calc-window-view">
                <!-- Header -->
                <header class="calc-header-bar">
                    <div class="calc-brand">
                        <div class="calc-logo-wrap">${APP_ICONS.calc}</div>
                        <div class="calc-brand-text">
                            <span class="calc-kicker">HERRAMIENTA DE ANÁLISIS DE VIABILIDAD</span>
                            <h3 class="calc-title">Calculadora de Regalías & Break-Even</h3>
                        </div>
                    </div>
                    <button type="button" class="calc-sync-btn" id="calc-sync-project" title="Cargar costes del proyecto activo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                        <span>Sincronizar Proyecto</span>
                    </button>
                </header>

                <div class="calc-main-body">
                    <!-- Left: Inputs Form -->
                    <div class="calc-inputs-pane">
                        <h4 class="calc-pane-title">Parámetros del Videojuego</h4>
                        
                        <div class="calc-field">
                            <label for="calc-budget" class="calc-label">Coste de Desarrollo (€):</label>
                            <input type="number" id="calc-budget" class="calc-input" value="${budget}" step="1000" min="0">
                        </div>

                        <div class="calc-field">
                            <label for="calc-marketing" class="calc-label">Presupuesto de Marketing (€):</label>
                            <input type="number" id="calc-marketing" class="calc-input" value="${marketingSpend}" step="1000" min="0">
                        </div>

                        <div class="calc-field">
                            <label for="calc-price" class="calc-label">Precio de Venta al Público (€):</label>
                            <input type="number" id="calc-price" class="calc-input" value="${unitPrice}" step="0.5" min="1">
                        </div>

                        <div class="calc-row-2">
                            <div class="calc-field">
                                <label for="calc-store-cut" class="calc-label">Tienda (%):</label>
                                <input type="number" id="calc-store-cut" class="calc-input" value="${storeCut}" min="0" max="60">
                            </div>
                            <div class="calc-field">
                                <label for="calc-royalty-cut" class="calc-label">Editor / IP (%):</label>
                                <input type="number" id="calc-royalty-cut" class="calc-input" value="${royaltyCut}" min="0" max="60">
                            </div>
                        </div>

                        <div class="calc-summary-pill">
                            <span>Coste Total Fijo: <strong>${formatMoney(results.totalFixedCosts)}</strong></span>
                        </div>
                    </div>

                    <!-- Right: Results Dashboard -->
                    <div class="calc-results-pane">
                        <h4 class="calc-pane-title">Proyección Financiera</h4>

                        <div class="calc-kpi-grid">
                            <div class="calc-kpi-card highlight">
                                <span class="kpi-label">Punto de Equilibrio (Break-Even)</span>
                                <strong class="kpi-value text-emerald">${results.breakEvenUnits.toLocaleString('es-ES')} copias</strong>
                                <span class="kpi-sub">Ventas mínimas para no incurrir en pérdidas</span>
                            </div>

                            <div class="calc-kpi-card">
                                <span class="kpi-label">Margen Neto por Copia</span>
                                <strong class="kpi-value text-cyan">${results.netPerUnit.toFixed(2)} €</strong>
                                <span class="kpi-sub">Tras deducción de ${storeCut + royaltyCut}% en comisiones</span>
                            </div>
                        </div>

                        <!-- Scenarios Table -->
                        <div class="calc-scenarios-box">
                            <h5 class="scenarios-title">Escenarios de Rendimiento Comercial</h5>
                            <div class="scenarios-table">
                                <div class="scenarios-row scenarios-header">
                                    <span>Ventas</span>
                                    <span>Ingreso Bruto</span>
                                    <span>Beneficio Neto</span>
                                    <span>ROI</span>
                                </div>
                                ${results.scenarioResults.map(sc => `
                                    <div class="scenarios-row ${sc.netProfit > 0 ? 'profit-pos' : 'profit-neg'}">
                                        <strong>${sc.label}</strong>
                                        <span>${formatMoney(sc.gross)}</span>
                                        <strong class="${sc.netProfit >= 0 ? 'text-emerald' : 'text-rose'}">
                                            ${sc.netProfit >= 0 ? '+' : ''}${formatMoney(sc.netProfit)}
                                        </strong>
                                        <span class="sc-roi">${sc.roi}%</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        const bindInput = (id, setter) => {
            container.querySelector(id)?.addEventListener('input', (e) => {
                setter(parseFloat(e.target.value) || 0);
                renderView();
            });
        };

        bindInput('#calc-budget', val => { budget = val; });
        bindInput('#calc-marketing', val => { marketingSpend = val; });
        bindInput('#calc-price', val => { unitPrice = val; });
        bindInput('#calc-store-cut', val => { storeCut = val; });
        bindInput('#calc-royalty-cut', val => { royaltyCut = val; });

        container.querySelector('#calc-sync-project')?.addEventListener('click', () => {
            const cur = gameInstance.currentProject;
            if (cur) {
                budget = cur.cost || cur.budget || 50000;
                marketingSpend = Math.round(budget * 0.25);
                window.uwuntuOS?.showWallpaperToast(`Datos sincronizados con «${cur.name || 'Proyecto'}»`);
            } else {
                window.uwuntuOS?.showWallpaperToast('No hay ningún proyecto en desarrollo actualmente. Usando estimación.');
            }
            renderView();
            window.soundEngine?.playClick?.();
        });
    }

    renderView();
}

export function initializeUwuntuOS(gameInstance, worldInstance) {
    const os = new UwuntuOS(gameInstance, worldInstance);
    window.uwuntuOS = os;
    // Backwards compatibility alias for other UI components
    window.studioPhoneNav = os;
    return os;
}
