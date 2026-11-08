import { game } from './simulation.js';
import { marketingChannelState, marketingEdition } from './marketing-ui.js';

/**
 * DEV EMPIRE 3D - REALISTIC SMARTPHONE NAVIGATION SYSTEM
 * Ultra-high-fidelity in-game smartphone featuring physical chassis,
 * dynamic status bar, rich personalized squircle icons, frosted glass dock,
 * Studio widget, in-phone Vread social network, in-phone Guide app,
 * and seamless integration with game systems.
 */

const APP_CATALOG = [
    // --- MAIN SCREEN APPS ---
    {
        id: 'app-vread',
        dock: true,
        label: 'Vread',
        shortLabel: 'Vread',
        isInternalApp: true,
        colorClass: 'app--vread',
        gradient: 'linear-gradient(145deg, #0f172a 0%, #030712 100%)',
        shadowColor: 'rgba(6, 182, 212, 0.55)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10h11l9 23L35 10h10L30 40h-11L6 10z" fill="url(#vread-icon-grad)"/>
            <path d="M17 10l9 23 9-23" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
            <path d="M26 33l-3 7h4l3-7z" fill="#38bdf8"/>
            <defs>
                <linearGradient id="vread-icon-grad" x1="6" y1="10" x2="45" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#38bdf8"/>
                    <stop offset="1" stop-color="#06b6d4"/>
                </linearGradient>
            </defs>
        </svg>`
    },
    {
        id: 'app-marketing',
        dock: false,
        label: 'Marketing',
        isInternalApp: true,
        colorClass: 'app--rose',
        gradient: 'linear-gradient(145deg, #f43f5e 0%, #9f1239 100%)',
        shadowColor: 'rgba(244, 63, 94, 0.45)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 18v11h6l13 8V10L14 18H8z" fill="#4c0519" stroke="#fda4af" stroke-width="2" stroke-linejoin="round"/>
            <path d="M14 29l2 10h5l-2.5-10" fill="#881337" stroke="#fecdd3" stroke-width="1.6"/>
            <path d="M21 15v17" stroke="#fb7185" stroke-width="1.6"/>
            <!-- Concentric broadcast soundwaves -->
            <path d="M31 17c2.5 4 2.5 9.5 0 13.5" stroke="#ffe4e6" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M36 13c4.8 6.5 4.8 15.5 0 22" stroke="#fda4af" stroke-width="2" stroke-linecap="round"/>
            <path d="M41 9c7 9 7 21 0 30" stroke="#f43f5e" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="2 3"/>
            <circle cx="27" cy="23.5" r="1.8" fill="#fff"/>
        </svg>`
    },
    {
        id: 'btn-open-dag',
        dock: false,
        label: 'Arquitectura',
        colorClass: 'app--purple',
        gradient: 'linear-gradient(145deg, #8b5cf6 0%, #4338ca 100%)',
        shadowColor: 'rgba(139, 92, 246, 0.45)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="7" width="14" height="13" rx="3.5" fill="#2e1065" stroke="#c4b5fd" stroke-width="2"/>
            <rect x="27" y="7" width="14" height="13" rx="3.5" fill="#2e1065" stroke="#c4b5fd" stroke-width="2"/>
            <rect x="17" y="27" width="14" height="13" rx="3.5" fill="#3730a3" stroke="#e0e7ff" stroke-width="2"/>
            <!-- Data bus paths -->
            <path d="M14 20v4.5h10M34 20v4.5H24" stroke="#a78bfa" stroke-width="2" stroke-dasharray="2 2"/>
            <circle cx="24" cy="24.5" r="2.8" fill="#38bdf8"/>
            <path d="M10 13h8M10 16h5M30 13h8M30 16h5M20 33h8M20 36h5" stroke="#ddd6fe" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`
    },
    {
        id: 'btn-toggle-hologram',
        dock: true,
        label: 'Grafo 3D',
        shortLabel: 'Grafo 3D',
        colorClass: 'app--teal-cyan',
        gradient: 'linear-gradient(145deg, #06b6d4 0%, #0e7490 100%)',
        shadowColor: 'rgba(6, 182, 212, 0.45)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Projector base plate -->
            <ellipse cx="24" cy="41" rx="14" ry="4" fill="#083344" stroke="#22d3ee" stroke-width="1.4"/>
            <!-- Hologram ray cone -->
            <path d="M12 39l8-14m16 14l-8-14" stroke="#67e8f9" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.6"/>
            <!-- 3D Iso cube -->
            <path d="M24 7l14 8v16l-14 8-14-8V15l14-8z" fill="#083344" stroke="#22d3ee" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M10 15l14 8 14-8M24 23v16" stroke="#67e8f9" stroke-width="1.6"/>
            <!-- Vertex nodes -->
            <circle cx="24" cy="7" r="2.8" fill="#a5f3fc"/>
            <circle cx="38" cy="15" r="2.8" fill="#a5f3fc"/>
            <circle cx="38" cy="31" r="2.8" fill="#a5f3fc"/>
            <circle cx="24" cy="39" r="2.8" fill="#a5f3fc"/>
            <circle cx="10" cy="31" r="2.8" fill="#a5f3fc"/>
            <circle cx="10" cy="15" r="2.8" fill="#a5f3fc"/>
            <circle cx="24" cy="23" r="3.4" fill="#22d3ee" stroke="#fff" stroke-width="1.2"/>
        </svg>`
    },
    {
        id: 'btn-liveops',
        dock: false,
        label: 'Live Ops',
        colorClass: 'app--sky',
        gradient: 'linear-gradient(145deg, #0ea5e9 0%, #1d4ed8 100%)',
        shadowColor: 'rgba(14, 165, 233, 0.45)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Server blade 1 -->
            <rect x="9" y="19" width="30" height="9.5" rx="3" fill="#082f49" stroke="#38bdf8" stroke-width="1.8"/>
            <circle cx="15" cy="23.8" r="1.6" fill="#4ade80"/>
            <circle cx="20" cy="23.8" r="1.6" fill="#38bdf8"/>
            <path d="M26 23.8h9" stroke="#7dd3fc" stroke-width="1.6" stroke-linecap="round"/>
            <!-- Server blade 2 -->
            <rect x="9" y="31" width="30" height="9.5" rx="3" fill="#082f49" stroke="#38bdf8" stroke-width="1.8"/>
            <circle cx="15" cy="35.8" r="1.6" fill="#4ade80"/>
            <circle cx="20" cy="35.8" r="1.6" fill="#38bdf8"/>
            <path d="M26 35.8h9" stroke="#7dd3fc" stroke-width="1.6" stroke-linecap="round"/>
            <!-- Pulsing broadcast radar -->
            <path d="M24 19V11m-6 4a8 8 0 0 1 12 0m-15-4a12 12 0 0 1 18 0" stroke="#bae6fd" stroke-width="2" stroke-linecap="round"/>
            <circle cx="24" cy="10" r="2.4" fill="#38bdf8"/>
        </svg>`
    },
    {
        id: 'btn-rival-companies',
        dock: false,
        label: 'Rivales',
        colorClass: 'app--slate',
        gradient: 'linear-gradient(145deg, #475569 0%, #1e293b 100%)',
        shadowColor: 'rgba(71, 85, 105, 0.45)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Gold growth line behind towers -->
            <path d="M6 25l10-8 11 3 15-11" stroke="#facc15" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
            <!-- Left tower -->
            <path d="M7 39V18l8-4v25" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.8"/>
            <!-- Center spire tower -->
            <path d="M18 39V10l12-4v33" fill="#1e293b" stroke="#f1f5f9" stroke-width="2"/>
            <path d="M24 6V2" stroke="#facc15" stroke-width="2" stroke-linecap="round"/>
            <!-- Right tower -->
            <path d="M32 39V21l9-3v21" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.8"/>
            <path d="M5 39h38" stroke="#94a3b8" stroke-width="2"/>
            <!-- Lit windows -->
            <rect x="10" y="21" width="2.4" height="2.4" fill="#38bdf8"/>
            <rect x="10" y="27" width="2.4" height="2.4" fill="#38bdf8"/>
            <rect x="22" y="12" width="2.4" height="2.4" fill="#facc15"/>
            <rect x="22" y="18" width="2.4" height="2.4" fill="#38bdf8"/>
            <rect x="22" y="24" width="2.4" height="2.4" fill="#facc15"/>
            <rect x="22" y="30" width="2.4" height="2.4" fill="#38bdf8"/>
            <rect x="35" y="24" width="2.4" height="2.4" fill="#38bdf8"/>
            <rect x="35" y="30" width="2.4" height="2.4" fill="#facc15"/>
        </svg>`
    },
    {
        id: 'btn-hire',
        dock: false,
        label: 'Personal',
        colorClass: 'app--teal',
        gradient: 'linear-gradient(145deg, #10b981 0%, #047857 100%)',
        shadowColor: 'rgba(16, 185, 129, 0.45)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Background secondary developer -->
            <circle cx="32" cy="16" r="4.5" fill="#064e3b" stroke="#2dd4bf" stroke-width="1.4"/>
            <path d="M26 32c0-3.5 3-6.5 7-6.5s7 3 7 6.5" fill="#064e3b" stroke="#2dd4bf" stroke-width="1.4"/>
            <!-- Primary lead developer -->
            <circle cx="19" cy="17" r="6.2" fill="#065f46" stroke="#5eead4" stroke-width="2"/>
            <path d="M8 38c0-5.8 5-10 11-10s11 4.2 11 10H8z" fill="#047857" stroke="#5eead4" stroke-width="2"/>
            <!-- Golden star talent ribbon -->
            <path d="M17 28l2 3.5 2-3.5" stroke="#facc15" stroke-width="1.8"/>
            <polygon points="19,32 20.2,34.5 22.8,34.8 20.9,36.6 21.4,39.2 19,37.9 16.6,39.2 17.1,36.6 15.2,34.8 17.8,34.5" fill="#facc15"/>
        </svg>`
    },
    {
        id: 'btn-upgrade-office',
        dock: false,
        label: 'Oficinas',
        colorClass: 'app--indigo-deep',
        gradient: 'linear-gradient(145deg, #6366f1 0%, #312e81 100%)',
        shadowColor: 'rgba(99, 102, 241, 0.45)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Skyscraper body -->
            <path d="M9 39V12h20v27" fill="#1e1b4b" stroke="#a5b4fc" stroke-width="2"/>
            <path d="M29 20h10v19H29" fill="#312e81" stroke="#c7d2fe" stroke-width="1.8"/>
            <path d="M5 39h38" stroke="#a5b4fc" stroke-width="2"/>
            <!-- Blueprint lines & windows -->
            <path d="M14 17h10M14 22h10M14 27h10M14 32h10M33 26h3M33 31h3" stroke="#e0e7ff" stroke-width="1.8" stroke-linecap="round"/>
            <!-- Blueprint drafting compass on top corner -->
            <path d="M26 6l12 12m-12 0h12V6" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="26" cy="6" r="2" fill="#38bdf8"/>
        </svg>`
    },
    {
        id: 'btn-company-ip',
        dock: false,
        label: 'Propiedad IP',
        colorClass: 'app--gold',
        gradient: 'linear-gradient(145deg, #f59e0b 0%, #92400e 100%)',
        shadowColor: 'rgba(245, 158, 11, 0.45)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Royal shield crest -->
            <path d="M24 6l14 5.5v13c0 9.5-6.5 16-14 19-7.5-3-14-9.5-14-19v-13L24 6z" fill="#451a03" stroke="#facc15" stroke-width="2.2" stroke-linejoin="round"/>
            <!-- Inner franchise star -->
            <polygon points="24,15 26.5,20.2 32.2,21 28,25.1 29,30.8 24,28.1 19,30.8 20,25.1 15.8,21 21.5,20.2" fill="#fef08a" stroke="#ca8a04" stroke-width="1.2"/>
            <circle cx="24" cy="35" r="2.8" fill="#facc15"/>
        </svg>`
    },
    {
        id: 'btn-community-workshop',
        dock: false,
        label: 'Workshop',
        colorClass: 'app--orange',
        gradient: 'linear-gradient(145deg, #f97316 0%, #c2410c 100%)',
        shadowColor: 'rgba(249, 115, 22, 0.45)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Crossed wrench -->
            <path d="M33 10a5.5 5.5 0 0 0-6.5 1.2l-2 2 7 7 2-2a5.5 5.5 0 0 0-1.2-6.5l-2.2 2.2-2.2-1.2 1.2-2.2h4z" fill="#431407" stroke="#fdba74" stroke-width="1.6"/>
            <path d="M24 19l-13 13a2.5 2.5 0 0 0 0 3.5l1.5 1.5a2.5 2.5 0 0 0 3.5 0l13-13-5-5z" fill="#7c2d12" stroke="#fdba74" stroke-width="1.6"/>
            <!-- Screwdriver -->
            <path d="M14 10l5 5-9 9-3-1-1-3 9-9z" fill="#9a3412" stroke="#fed7aa" stroke-width="1.5"/>
            <path d="M19 15l15 15a2 2 0 0 1 0 3l-1 1a2 2 0 0 1-3 0L15 19l4-4z" fill="#ea580c" stroke="#fed7aa" stroke-width="1.5"/>
            <!-- 3D Mod puzzle cube -->
            <rect x="27" y="27" width="11" height="11" rx="2.5" fill="#ffedd5" stroke="#ea580c" stroke-width="1.8"/>
            <path d="M32.5 27v11M27 32.5h11" stroke="#ea580c" stroke-width="1.2"/>
        </svg>`
    },
    {
        id: 'btn-admin-mode',
        dock: false,
        label: 'Admin',
        colorClass: 'app--graphite',
        gradient: 'linear-gradient(145deg, #334155 0%, #090d16 100%)',
        shadowColor: 'rgba(56, 189, 248, 0.35)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="9" width="34" height="30" rx="4.5" fill="#090d16" stroke="#38bdf8" stroke-width="2.2"/>
            <path d="M7 17h34" stroke="#1e293b" stroke-width="1.8"/>
            <circle cx="12" cy="13" r="1.6" fill="#f43f5e"/>
            <circle cx="16.5" cy="13" r="1.6" fill="#facc15"/>
            <circle cx="21" cy="13" r="1.6" fill="#4ade80"/>
            <!-- Command prompt -->
            <path d="M13 24l4.5 4-4.5 4" stroke="#22d3ee" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 32h8" stroke="#38bdf8" stroke-width="2.4" stroke-linecap="round"/>
            <rect x="31" y="22" width="6" height="6" rx="1.5" fill="#0284c7" stroke="#67e8f9" stroke-width="1"/>
        </svg>`
    },
    {
        id: 'app-guide',
        dock: false,
        label: 'Ayuda',
        isInternalApp: true,
        colorClass: 'app--blue-bright',
        gradient: 'linear-gradient(145deg, #2563eb 0%, #1e3a8a 100%)',
        shadowColor: 'rgba(37, 99, 235, 0.45)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Open tech book -->
            <path d="M9 14c4.5-2.2 10-2.2 15 1v22c-5-3.2-10.5-3.2-15-1V14z" fill="#1e3a8a" stroke="#93c5fd" stroke-width="1.8"/>
            <path d="M39 14c-4.5-2.2-10-2.2-15 1v22c5-3.2 10.5-3.2 15-1V14z" fill="#1d4ed8" stroke="#bfdbfe" stroke-width="1.8"/>
            <path d="M14 20h6M14 25h6M14 30h4M34 20h-6M34 25h-6M34 30h-4" stroke="#dbeafe" stroke-width="1.5" stroke-linecap="round"/>
            <!-- Knowledge lightbulb beacon -->
            <circle cx="24" cy="9.5" r="3.2" fill="#facc15" stroke="#fef08a" stroke-width="1.4"/>
            <path d="M24 4v2.5M19 6.5l1.8 1.8M29 6.5l-1.8 1.8" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`
    },

    // --- DOCK 4 APPS (PINNED IN DOCK) ---
    {
        id: 'btn-edit-profile',
        dock: true,
        label: 'Estudio',
        shortLabel: 'Estudio',
        colorClass: 'app--cyan',
        gradient: 'linear-gradient(145deg, #0ea5e9 0%, #0369a1 100%)',
        shadowColor: 'rgba(14, 165, 233, 0.45)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 40V13l13-6 13 6v27H11z" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" stroke-linejoin="round"/>
            <!-- Windows facade -->
            <rect x="15.5" y="17" width="5.5" height="5.5" rx="1.2" fill="#7dd3fc" opacity="0.9"/>
            <rect x="27" y="17" width="5.5" height="5.5" rx="1.2" fill="#7dd3fc" opacity="0.9"/>
            <rect x="15.5" y="25.5" width="5.5" height="5.5" rx="1.2" fill="#7dd3fc" opacity="0.9"/>
            <rect x="27" y="25.5" width="5.5" height="5.5" rx="1.2" fill="#7dd3fc" opacity="0.9"/>
            <path d="M21 40v-7.5h6V40" fill="#0369a1" stroke="#e0f2fe" stroke-width="1.8"/>
            <circle cx="24" cy="7" r="3.2" fill="#facc15" stroke="#fef08a" stroke-width="1.4"/>
        </svg>`
    },
    {
        id: 'btn-history',
        dock: true,
        label: 'Ventas',
        shortLabel: 'Ventas',
        isInternalApp: true,
        colorClass: 'app--amber',
        gradient: 'linear-gradient(145deg, #d97706 0%, #78350f 100%)',
        shadowColor: 'rgba(217, 119, 6, 0.45)',
        icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 3D Bar chart -->
            <rect x="8" y="27" width="6.5" height="13" rx="1.8" fill="#78350f" stroke="#fbbf24" stroke-width="1.6"/>
            <rect x="17.5" y="19" width="6.5" height="21" rx="1.8" fill="#92400e" stroke="#fbbf24" stroke-width="1.6"/>
            <rect x="27" y="11" width="6.5" height="29" rx="1.8" fill="#b45309" stroke="#fbbf24" stroke-width="1.6"/>
            <!-- Trend arrow -->
            <path d="M8 24l9.5-8 9.5 3.5 10-12" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M31 7.5h6v6" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Gold coin -->
            <circle cx="38" cy="28" r="5.5" fill="#f59e0b" stroke="#fef3c7" stroke-width="1.4"/>
            <circle cx="38" cy="28" r="2.2" fill="#78350f"/>
        </svg>`
    }
];

export function initializeDeviceNav(gameInstance) {
    const bottomDock = document.querySelector('.bottom-dock');
    if (!bottomDock || document.getElementById('studio-device')) return;

    // 1. Sleek Floating Phone Launcher (Closed state)
    const launcher = document.createElement('button');
    launcher.id = 'device-launcher';
    launcher.type = 'button';
    launcher.setAttribute('aria-controls', 'studio-device');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', 'Abrir smartphone del estudio');
    launcher.title = 'Abrir smartphone del estudio (Móvil)';
    launcher.innerHTML = `
        <div class="launcher-phone-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="4"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2.5"></line>
            </svg>
        </div>
        <span class="launcher-text">Móvil</span>
        <span class="launcher-glow" aria-hidden="true"></span>
    `;

    // 2. Realistic Smartphone Device Container
    const phone = document.createElement('section');
    phone.id = 'studio-device';
    phone.hidden = true;
    phone.inert = true;
    phone.setAttribute('aria-label', 'Smartphone de Dev Empire');

    phone.innerHTML = `
        <div class="smartphone-chassis">
            <!-- Physical hardware buttons on side of phone -->
            <div class="phone-hw-btn phone-hw-power" aria-hidden="true"></div>
            <div class="phone-hw-btn phone-hw-vol-up" aria-hidden="true"></div>
            <div class="phone-hw-btn phone-hw-vol-down" aria-hidden="true"></div>

            <!-- Screen bezel & display -->
            <div class="phone-screen">
                <!-- Glossy glass reflection sheen -->
                <div class="phone-glass-sheen" aria-hidden="true"></div>

                <!-- AAA Custom Wallpaper (Deep navy + glowing tech mesh) -->
                <div class="phone-wallpaper" aria-hidden="true">
                    <div class="wp-gradient-base"></div>
                    <div class="wp-glow-orb-top"></div>
                    <div class="wp-glow-orb-bottom"></div>
                    <div class="wp-mesh-pattern"></div>
                </div>

                <!-- Dynamic Island / Sensor notch -->
                <div class="phone-dynamic-island" aria-hidden="true">
                    <div class="phone-camera-lens"></div>
                    <div class="phone-speaker-slit"></div>
                </div>

                <!-- Top Status Bar -->
                <header class="phone-status-bar">
                    <div class="status-left">
                        <span class="status-time" id="phone-clock">10:42</span>
                        <span class="status-net-type">5G</span>
                    </div>
                    <div class="status-right">
                        <!-- Signal bars -->
                        <svg class="status-icon" viewBox="0 0 20 16" fill="currentColor" aria-hidden="true">
                            <rect x="1" y="11" width="3" height="5" rx="0.8"></rect>
                            <rect x="5.5" y="8" width="3" height="8" rx="0.8"></rect>
                            <rect x="10" y="5" width="3" height="11" rx="0.8"></rect>
                            <rect x="14.5" y="1" width="3" height="15" rx="0.8"></rect>
                        </svg>
                        <!-- Wi-Fi waves -->
                        <svg class="status-icon" viewBox="0 0 20 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                            <path d="M2 4.5C6.5 1 13.5 1 18 4.5"></path>
                            <path d="M5 8C8 5.5 12 5.5 15 8"></path>
                            <path d="M8 11.5C9.2 10.5 10.8 10.5 12 11.5"></path>
                            <circle cx="10" cy="14.5" r="1.2" fill="currentColor"></circle>
                        </svg>
                        <!-- Battery Indicator -->
                        <div class="status-battery" title="Batería: 98%">
                            <span class="battery-pct">98%</span>
                            <div class="battery-pill">
                                <div class="battery-fill" style="width: 90%;"></div>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Phone Body Content -->
                <div class="phone-viewport">

                    <!-- VIEW 1: HOMESCREEN (ALL 12 APPS IN SINGLE 4x3 GRID) -->
                    <div class="phone-view phone-view-home active" id="phone-view-home">
                        
                        <!-- Studio Lockscreen / Homescreen Widget -->
                        <div class="phone-widget-studio" id="phone-studio-widget" role="button" tabindex="0" title="Ver detalles del estudio">
                            <div class="widget-row-top">
                                <span class="widget-era-badge" id="phone-widget-era">1987</span>
                                <span class="widget-office-name" id="phone-widget-office">Garaje Retro</span>
                            </div>
                            <h2 class="widget-studio-title" id="phone-widget-studio-name">Mi Estudio</h2>
                            <div class="widget-project-row">
                                <span class="widget-pulse-dot" id="phone-widget-pulse"></span>
                                <span class="widget-project-desc" id="phone-widget-project-desc">Sin proyecto activo</span>
                            </div>
                        </div>

                        <!-- All 12 Main Apps Grid (4 columns x 3 rows) -->
                        <div class="phone-apps-grid-wrap">
                            <div class="phone-apps-grid" id="phone-main-grid"></div>
                        </div>

                        <!-- Bottom Frosted Glass Dock (4 quick access apps) -->
                        <nav class="phone-dock" aria-label="Aplicaciones principales del dock">
                            <div class="phone-dock-inner" id="phone-dock-apps"></div>
                        </nav>
                    </div>

                    <!-- VIEW 2: VREAD SOCIAL NETWORK (TWITTER / X CLONE) -->
                    <div class="phone-view phone-view-vread" id="phone-view-vread" hidden>
                        <header class="vread-app-header">
                            <button type="button" class="phone-nav-back-btn" id="vread-back-btn" aria-label="Volver al inicio">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M15 18l-6-6 6-6"></path>
                                </svg>
                                <span>Inicio</span>
                            </button>
                            <div class="vread-brand-title">
                                <svg class="vread-mini-logo" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                                    <path d="M7 11h11l8 21L34 11h10L29 39h-10L7 11z" fill="url(#vread-logo-grad)"/>
                                    <path d="M18 11l8 21 8-21" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
                                    <defs>
                                        <linearGradient id="vread-logo-grad" x1="7" y1="11" x2="44" y2="39" gradientUnits="userSpaceOnUse">
                                            <stop stop-color="#38bdf8"/>
                                            <stop offset="1" stop-color="#06b6d4"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <span class="vread-name">Vread</span>
                            </div>
                            <button type="button" class="vread-refresh-btn" id="vread-refresh-btn" aria-label="Actualizar publicaciones" title="Actualizar feed">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19"></path>
                                </svg>
                            </button>
                        </header>

                        <!-- Trending Topics Pills Bar -->
                        <div class="vread-trends-bar" id="vread-trends-bar" role="region" aria-label="Tendencias destacadas">
                            <div class="vread-trends-scroller" id="vread-trends-chips"></div>
                        </div>

                        <!-- Vread Feed Tabs -->
                        <div class="vread-feed-tabs" role="tablist" aria-label="Filtros del feed">
                            <button type="button" class="vread-tab active" data-vread-tab="all" role="tab" aria-selected="true">Para ti</button>
                            <button type="button" class="vread-tab" data-vread-tab="reviews" role="tab" aria-selected="false">Opiniones</button>
                            <button type="button" class="vread-tab" data-vread-tab="live" role="tab" aria-selected="false">En directo</button>
                        </div>

                        <!-- Vread Posts Timeline -->
                        <div class="vread-feed-timeline" id="vread-feed-timeline" role="feed" aria-busy="false">
                            <div class="vread-posts-container" id="vread-posts-container"></div>
                        </div>
                    </div>

                    <!-- VIEW 3: IN-PHONE GUIDE & TIPS -->
                    <div class="phone-view phone-view-guide" id="phone-view-guide" hidden>
                        <div class="phone-app-navbar">
                            <button type="button" class="phone-nav-back-btn" id="phone-guide-back-btn" aria-label="Volver a la pantalla de inicio">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M15 18l-6-6 6-6"></path>
                                </svg>
                                <span>Inicio</span>
                            </button>
                            <span class="phone-app-nav-title">Guía de Estudio</span>
                            <div class="nav-spacer"></div>
                        </div>

                        <div class="phone-guide-body">
                            <div class="guide-card">
                                <h3>
                                    <svg class="guide-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M6 11h4m-2-2v4M15 11h.01M18 13h.01M17 7H7a4 4 0 0 0-4 4v3a4 4 0 0 0 4 4l2-2h6l2 2a4 4 0 0 0 4-4v-3a4 4 0 0 0-4-4z"></path>
                                    </svg>
                                    <span>Desarrollo de Videojuegos</span>
                                </h3>
                                <p>Crea nuevos títulos combinando temas y géneros con alta sinergia. La sinergia multiplica las ventas iniciales y las valoraciones de la prensa.</p>
                            </div>
                            <div class="guide-card">
                                <h3>
                                    <svg class="guide-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <circle cx="12" cy="12" r="3"></circle>
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                    </svg>
                                    <span>Arquitectura DAG y Deuda</span>
                                </h3>
                                <p>Estructura tus juegos mediante nodos técnicos. Mantener la deuda técnica baja evita fallos críticos y optimiza los costes de soporte.</p>
                            </div>
                            <div class="guide-card">
                                <h3>
                                    <svg class="guide-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M10 2v7.31L4.35 18.5A2 2 0 0 0 6.07 22h11.86a2 2 0 0 0 1.72-3.5L14 9.31V2z"></path>
                                        <line x1="8.5" y1="2" x2="15.5" y2="2"></line>
                                        <line x1="8" y1="14" x2="16" y2="14"></line>
                                    </svg>
                                    <span>I+D y Motores</span>
                                </h3>
                                <p>Invierte puntos de investigación (RP) en motores propios y tecnologías que perdurarán durante generaciones de hardware.</p>
                            </div>
                            <div class="guide-card">
                                <h3>
                                    <svg class="guide-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8"></path>
                                    </svg>
                                    <span>Atajos de Teclado</span>
                                </h3>
                                <ul class="guide-shortcuts-list">
                                    <li><kbd>N</kbd> <span>Nuevo proyecto</span></li>
                                    <li><kbd>G</kbd> <span>Grafo / Arquitectura</span></li>
                                    <li><kbd>R</kbd> <span>Investigación (I+D)</span></li>
                                    <li><kbd>H</kbd> <span>Equipo & Personal</span></li>
                                    <li><kbd>C</kbd> <span>Top 10 y Ventas</span></li>
                                    <li><kbd>P</kbd> <span>Personalizar Estudio</span></li>
                                    <li><kbd>Esc</kbd> <span>Cerrar / Volver</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- VIEW 5: IN-PHONE LIVE OPS APP -->
                    <div class="phone-view phone-view-liveops" id="phone-view-liveops" hidden>
                        <div class="phone-app-navbar">
                            <button type="button" class="phone-nav-back-btn" id="phone-liveops-back-btn" aria-label="Volver a la pantalla de inicio">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>
                                <span>Inicio</span>
                            </button>
                            <span class="phone-app-nav-title">Live Ops</span>
                            <span class="nav-spacer" aria-hidden="true"></span>
                        </div>
                        <p class="phone-liveops-intro">Actividad, retención e ingresos de servicio.</p>
                        <div class="phone-liveops-body" id="phone-liveops-body"></div>
                    </div>

                    <div class="phone-view phone-view-personnel" id="phone-view-personnel" hidden>
                        <div id="phone-personnel-content"></div>
                    </div>

                    <div class="phone-view phone-view-architecture" id="phone-view-architecture" hidden>
                        <div id="phone-architecture-content"></div>
                    </div>

                    <div class="phone-view phone-view-ip" id="phone-view-ip" hidden>
                        <div id="phone-ip-content"></div>
                    </div>

                    <div class="phone-view phone-view-rivals" id="phone-view-rivals" hidden>
                        <div id="phone-rivals-content"></div>
                    </div>

                    <div class="phone-view phone-view-offices" id="phone-view-offices" hidden>
                        <div id="phone-offices-content"></div>
                    </div>

                    <div class="phone-view phone-view-workshop" id="phone-view-workshop" hidden>
                        <div id="phone-workshop-content"></div>
                    </div>

                    <div class="phone-view phone-view-studio" id="phone-view-studio" hidden>
                        <div id="phone-studio-content"></div>
                    </div>

                    <div class="phone-view phone-view-sales" id="phone-view-sales" hidden>
                        <div id="phone-sales-content"></div>
                    </div>

                    <!-- VIEW 4: IN-PHONE MARKETING APP -->
                    <div class="phone-view phone-view-marketing" id="phone-view-marketing" hidden>
                        <header class="phone-app-header phone-app-header--rose">
                            <button type="button" class="phone-nav-back-btn" id="phone-mkt-back-btn" aria-label="Volver a la pantalla de inicio">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M15 18l-6-6 6-6"></path>
                                </svg>
                                <span>Inicio</span>
                            </button>
                            <div class="phone-app-brand-title">
                                <span class="phone-app-header-icon phone-app-header-icon--rose" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                    </svg>
                                </span>
                                <span class="phone-app-title-text">Marketing</span>
                            </div>
                            <span class="phone-mkt-era-badge" id="phone-mkt-era-badge">1982 / Prensa</span>
                        </header>

                        <!-- Segmented Tabs Bar -->
                        <div class="phone-segmented-tabs" role="tablist" aria-label="Secciones de Marketing">
                            <button type="button" class="phone-seg-tab active" data-mkt-tab="campaigns" role="tab" aria-selected="true">Campañas</button>
                            <button type="button" class="phone-seg-tab" data-mkt-tab="creators" role="tab" aria-selected="false">Creadores</button>
                            <button type="button" class="phone-seg-tab" data-mkt-tab="archive" role="tab" aria-selected="false">Prensa</button>
                        </div>

                        <!-- Scrollable Marketing Body -->
                        <div class="phone-mkt-body" id="phone-mkt-body"></div>
                    </div>

                </div>

                <!-- Bottom Navigation Bar & Home Gesture Pill (CLEAN: NO 'X' BUTTON) -->
                <footer class="phone-navigation-bar">
                    <button type="button" class="phone-home-gesture-bar" id="phone-home-bar" aria-label="Inicio / Minimizar teléfono" title="Inicio / Minimizar">
                        <span class="home-indicator-pill"></span>
                    </button>
                </footer>

            </div>
        </div>
    `;

    // 3. Mount elements
    bottomDock.insertAdjacentElement('afterend', launcher);
    launcher.insertAdjacentElement('afterend', phone);
    bottomDock.classList.add('device-nav-ready');

    // 4. Build App Buttons
    const mainGrid = phone.querySelector('#phone-main-grid');
    const dockContainer = phone.querySelector('#phone-dock-apps');

    function createAppButton(app, isDock = false) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `phone-app-item ${isDock ? 'phone-app--dock' : 'phone-app--grid'} ${app.colorClass || ''}`;
        btn.dataset.appId = app.id;
        btn.setAttribute('aria-label', app.label);

        btn.innerHTML = `
            <div class="app-icon-squircle" style="background: ${app.gradient}; box-shadow: 0 4px 14px ${app.shadowColor};">
                ${app.icon}
                <span class="app-icon-shine" aria-hidden="true"></span>
            </div>
            <span class="app-label-text">${isDock && app.shortLabel ? app.shortLabel : app.label}</span>
        `;

        btn.addEventListener('click', () => {
            if (app.isInternalApp && app.id === 'app-vread') {
                openInternalVread();
                return;
            }
            if (app.isInternalApp && app.id === 'app-marketing') {
                openInternalMarketing();
                return;
            }
            if (app.isInternalApp && app.id === 'app-guide') {
                openInternalGuide();
                return;
            }
            if (app.id === 'btn-liveops') {
                openInternalLiveOps();
                return;
            }
            if (app.id === 'btn-hire') {
                openInternalPersonnel();
                return;
            }
            if (app.id === 'btn-open-dag') {
                window.refreshArchitecturePanel?.();
                openInternalArchitecture();
                return;
            }
            if (app.id === 'btn-company-ip') {
                window.refreshIPPanel?.();
                openInternalIP();
                return;
            }
            if (app.id === 'btn-rival-companies') {
                window.refreshRivalsPanel?.();
                openInternalRivals();
                return;
            }
            if (app.id === 'btn-upgrade-office') {
                window.refreshOfficePanel?.();
                openInternalOffices();
                return;
            }
            if (app.id === 'btn-community-workshop') {
                window.refreshWorkshopPanel?.();
                openInternalWorkshop();
                return;
            }
            if (app.id === 'btn-edit-profile') {
                window.openCompanyStudioPanel?.();
                return;
            }
            if (app.id === 'btn-history') {
                openInternalSales();
                return;
            }

            // Target existing in-game system modal / action
            const target = document.getElementById(app.id);
            if (!target || target.disabled) return;

            btn.classList.add('app-clicked');
            setTimeout(() => {
                btn.classList.remove('app-clicked');
                closePhone();
                target.click();
            }, 100);
        });

        return btn;
    }

    // Populate the app grid and the four pinned dock shortcuts.
    APP_CATALOG.forEach(app => {
        if (app.dock) {
            dockContainer.appendChild(createAppButton(app, true));
        } else {
            mainGrid.appendChild(createAppButton(app, false));
        }
    });

    // 5. Navigation between Views (Homescreen, Vread, Marketing, Guide)
    const homeView = phone.querySelector('#phone-view-home');
    const vreadView = phone.querySelector('#phone-view-vread');
    const guideView = phone.querySelector('#phone-view-guide');
    const marketingView = phone.querySelector('#phone-view-marketing');
    const liveOpsView = phone.querySelector('#phone-view-liveops');
    const personnelView = phone.querySelector('#phone-view-personnel');
    const architectureView = phone.querySelector('#phone-view-architecture');
    const ipView = phone.querySelector('#phone-view-ip');
    const rivalsView = phone.querySelector('#phone-view-rivals');
    const officesView = phone.querySelector('#phone-view-offices');
    const workshopView = phone.querySelector('#phone-view-workshop');
    const studioView = phone.querySelector('#phone-view-studio');
    const salesView = phone.querySelector('#phone-view-sales');
    const vreadBackBtn = phone.querySelector('#vread-back-btn');
    const guideBackBtn = phone.querySelector('#phone-guide-back-btn');
    const mktBackBtn = phone.querySelector('#phone-mkt-back-btn');
    const liveOpsBackBtn = phone.querySelector('#phone-liveops-back-btn');

    const personnelModalWindow = document.querySelector('#modal-hire > .modal-window');
    if (personnelModalWindow) {
        phone.querySelector('#phone-personnel-content').append(personnelModalWindow);
        const backButton = personnelModalWindow.querySelector('.modal-close');
        if (backButton) {
            backButton.textContent = '‹';
            backButton.setAttribute('aria-label', 'Volver al inicio');
            backButton.title = 'Volver al inicio';
            backButton.addEventListener('click', event => {
                event.stopImmediatePropagation();
                returnToHome();
            });
        }
    }

    const architectureModalWindow = document.querySelector('#modal-scope-dag > .modal-window');
    if (architectureModalWindow) {
        phone.querySelector('#phone-architecture-content').append(architectureModalWindow);
        architectureModalWindow.setAttribute('role', 'dialog');
        architectureModalWindow.setAttribute('aria-modal', 'true');
        architectureModalWindow.setAttribute('aria-labelledby', 'scope-menu-title');
        const backButton = architectureModalWindow.querySelector('.modal-close');
        if (backButton) {
            backButton.textContent = '‹';
            backButton.setAttribute('aria-label', 'Volver al inicio');
            backButton.title = 'Volver al inicio';
        }
        const footerButton = architectureModalWindow.querySelector('.menu-footer button');
        if (footerButton) {
            footerButton.removeAttribute('onclick');
            footerButton.textContent = 'Volver al inicio';
            footerButton.addEventListener('click', returnToHome);
        }
    }

    const ipBackdrop = document.getElementById('modal-intellectual-property');
    const ipModalWindow = ipBackdrop?.querySelector('.modal-window');
    if (ipModalWindow) {
        phone.querySelector('#phone-ip-content').append(ipModalWindow);
        ipModalWindow.setAttribute('role', 'dialog');
        ipModalWindow.setAttribute('aria-modal', 'true');
        ipModalWindow.setAttribute('aria-label', 'Empresa / Propiedad intelectual');
        ipBackdrop.hidden = true;
        ipBackdrop.inert = true;
    }

    const rivalsBackdrop = document.getElementById('modal-rival-companies');
    const rivalsModalWindow = rivalsBackdrop?.querySelector('.modal-window');
    if (rivalsModalWindow) {
        phone.querySelector('#phone-rivals-content').append(rivalsModalWindow);
        rivalsModalWindow.setAttribute('role', 'dialog');
        rivalsModalWindow.setAttribute('aria-modal', 'true');
        rivalsModalWindow.setAttribute('aria-label', 'Industria / Empresas rivales');
        const closeButton = rivalsModalWindow.querySelector('.modal-close');
        if (closeButton) {
            closeButton.textContent = '‹';
            closeButton.setAttribute('aria-label', 'Volver al inicio');
        }
        rivalsBackdrop.hidden = true;
        rivalsBackdrop.inert = true;
    }

    const officesBackdrop = document.getElementById('modal-offices');
    const officesModalWindow = officesBackdrop?.querySelector('.office-window');
    if (officesModalWindow) {
        phone.querySelector('#phone-offices-content').append(officesModalWindow);
        const closeButton = officesModalWindow.querySelector('.modal-close');
        if (closeButton) {
            closeButton.textContent = '‹';
            closeButton.setAttribute('aria-label', 'Volver al inicio');
        }
        officesBackdrop.hidden = true;
        officesBackdrop.inert = true;
    }

    const workshopBackdrop = document.getElementById('modal-community-workshop');
    const workshopModalWindow = workshopBackdrop?.querySelector('.workshop-window');
    if (workshopModalWindow) {
        phone.querySelector('#phone-workshop-content').append(workshopModalWindow);
        workshopModalWindow.setAttribute('role', 'dialog');
        workshopModalWindow.setAttribute('aria-modal', 'true');
        workshopModalWindow.setAttribute('aria-labelledby', 'workshop-menu-title');
        const closeButton = workshopModalWindow.querySelector('.modal-close');
        closeButton?.removeAttribute('onclick');
        if (closeButton) {
            closeButton.textContent = '‹';
            closeButton.setAttribute('aria-label', 'Volver al inicio');
        }
        closeButton?.addEventListener('click', returnToHome);
        workshopBackdrop.hidden = true;
        workshopBackdrop.inert = true;
    }

    const studioBackdrop = document.getElementById('modal-company-creator');
    const studioModalWindow = studioBackdrop?.querySelector('.studio-menu');
    const studioContent = phone.querySelector('#phone-studio-content');
    const studioCloseButton = studioModalWindow?.querySelector('.modal-close');
    studioModalWindow?.setAttribute('role', 'dialog');
    studioModalWindow?.setAttribute('aria-modal', 'true');
    studioModalWindow?.setAttribute('aria-labelledby', 'studio-menu-title');
    if (studioCloseButton) {
        studioCloseButton.textContent = '‹';
        studioCloseButton.setAttribute('aria-label', 'Volver al inicio');
    }
    function attachStudioModal() {
        if (studioModalWindow && !studioContent.contains(studioModalWindow)) studioContent.append(studioModalWindow);
        if (studioBackdrop) {
            studioBackdrop.hidden = true;
            studioBackdrop.inert = true;
        }
    }
    function detachStudioModal() {
        if (studioModalWindow && studioBackdrop && !studioBackdrop.contains(studioModalWindow)) studioBackdrop.append(studioModalWindow);
        if (studioBackdrop) {
            studioBackdrop.hidden = false;
            studioBackdrop.inert = false;
        }
    }
    attachStudioModal();

    const salesBackdrop = document.getElementById('modal-history');
    const salesModalWindow = salesBackdrop?.querySelector('.modal-window');
    if (salesModalWindow) {
        phone.querySelector('#phone-sales-content').append(salesModalWindow);
        const backButton = salesModalWindow.querySelector('.modal-close');
        if (backButton) {
            backButton.textContent = '‹';
            backButton.setAttribute('aria-label', 'Volver al inicio');
            backButton.title = 'Volver al inicio';
            backButton.addEventListener('click', event => {
                event.stopImmediatePropagation();
                returnToHome();
            });
        }
        salesBackdrop.hidden = true;
        salesBackdrop.inert = true;
    }

    function hideArchitectureView() {
        architectureView.classList.remove('active');
        architectureView.hidden = true;
    }

    function hideUtilityViews(except = null) {
        for (const view of [rivalsView, officesView, workshopView, studioView]) {
            if (view === except) continue;
            view.classList.remove('active');
            view.hidden = true;
        }
    }

    function hideIPView() {
        ipView.classList.remove('active');
        ipView.hidden = true;
        hideUtilityViews();
    }

    function showExpandedView(target) {
        for (const view of [homeView, vreadView, guideView, marketingView, liveOpsView, personnelView, architectureView, ipView, rivalsView, officesView, workshopView, studioView, salesView]) {
            if (view === target) continue;
            view.classList.remove('active');
            view.hidden = true;
        }
        window.setLiveOpsPhoneTarget?.(null);
        phone.classList.add('is-expanded');
        target.hidden = false;
        requestAnimationFrame(() => {
            target.classList.add('active');
            target.querySelector('.modal-close, .phone-nav-back-btn')?.focus({ preventScroll: true });
        });
    }

    function openInternalRivals() {
        window.refreshRivalsPanel?.();
        showExpandedView(rivalsView);
    }

    function openInternalOffices() {
        window.refreshOfficePanel?.();
        showExpandedView(officesView);
    }

    function openInternalWorkshop() {
        window.refreshWorkshopPanel?.();
        showExpandedView(workshopView);
    }

    function openInternalStudio() {
        attachStudioModal();
        showExpandedView(studioView);
    }

    function hideSalesView() {
        salesView.classList.remove('active');
        salesView.hidden = true;
    }

    function openInternalSales() {
        window.setLiveOpsPhoneTarget?.(null);
        homeView.classList.remove('active');
        homeView.hidden = true;
        vreadView.classList.remove('active');
        vreadView.hidden = true;
        guideView.classList.remove('active');
        guideView.hidden = true;
        marketingView.classList.remove('active');
        marketingView.hidden = true;
        liveOpsView.classList.remove('active');
        liveOpsView.hidden = true;
        personnelView.classList.remove('active');
        personnelView.hidden = true;
        hideArchitectureView();
        hideIPView();
        phone.classList.add('is-expanded');
        salesView.hidden = false;
        window.renderHistoryAndCharts?.();
        requestAnimationFrame(() => salesView.classList.add('active'));
    }

    function openInternalVread() {
        hideSalesView();
        window.setLiveOpsPhoneTarget?.(null);
        phone.classList.remove('is-expanded');
        homeView.classList.remove('active');
        homeView.hidden = true;
        guideView.classList.remove('active');
        guideView.hidden = true;
        marketingView.classList.remove('active');
        marketingView.hidden = true;
        liveOpsView.classList.remove('active');
        liveOpsView.hidden = true;
        personnelView.classList.remove('active');
        personnelView.hidden = true;
        hideArchitectureView();
        hideIPView();
        vreadView.hidden = false;
        requestAnimationFrame(() => vreadView.classList.add('active'));
        renderVreadApp();
    }

    function openInternalMarketing() {
        hideSalesView();
        window.setLiveOpsPhoneTarget?.(null);
        phone.classList.remove('is-expanded');
        homeView.classList.remove('active');
        homeView.hidden = true;
        vreadView.classList.remove('active');
        vreadView.hidden = true;
        guideView.classList.remove('active');
        guideView.hidden = true;
        liveOpsView.classList.remove('active');
        liveOpsView.hidden = true;
        personnelView.classList.remove('active');
        personnelView.hidden = true;
        hideArchitectureView();
        hideIPView();
        marketingView.hidden = false;
        requestAnimationFrame(() => marketingView.classList.add('active'));
        renderMarketingApp();
    }

    function openInternalGuide() {
        hideSalesView();
        window.setLiveOpsPhoneTarget?.(null);
        phone.classList.remove('is-expanded');
        homeView.classList.remove('active');
        homeView.hidden = true;
        vreadView.classList.remove('active');
        vreadView.hidden = true;
        marketingView.classList.remove('active');
        marketingView.hidden = true;
        liveOpsView.classList.remove('active');
        liveOpsView.hidden = true;
        personnelView.classList.remove('active');
        personnelView.hidden = true;
        hideArchitectureView();
        hideIPView();
        guideView.hidden = false;
        requestAnimationFrame(() => guideView.classList.add('active'));
    }

    function openInternalLiveOps() {
        homeView.classList.remove('active');
        homeView.hidden = true;
        vreadView.classList.remove('active');
        vreadView.hidden = true;
        guideView.classList.remove('active');
        guideView.hidden = true;
        marketingView.classList.remove('active');
        marketingView.hidden = true;
        personnelView.classList.remove('active');
        personnelView.hidden = true;
        hideSalesView();
        hideArchitectureView();
        hideIPView();
        phone.classList.add('is-expanded');
        liveOpsView.hidden = false;
        requestAnimationFrame(() => liveOpsView.classList.add('active'));
        window.setLiveOpsPhoneTarget?.(phone.querySelector('#phone-liveops-body'));
    }

    function openInternalPersonnel() {
        homeView.classList.remove('active');
        homeView.hidden = true;
        vreadView.classList.remove('active');
        vreadView.hidden = true;
        guideView.classList.remove('active');
        guideView.hidden = true;
        marketingView.classList.remove('active');
        marketingView.hidden = true;
        liveOpsView.classList.remove('active');
        liveOpsView.hidden = true;
        hideSalesView();
        hideArchitectureView();
        hideIPView();
        phone.classList.add('is-expanded');
        personnelView.hidden = false;
        window.refreshPersonnelPanel?.();
        requestAnimationFrame(() => personnelView.classList.add('active'));
    }

    function openInternalArchitecture() {
        homeView.classList.remove('active');
        homeView.hidden = true;
        vreadView.classList.remove('active');
        vreadView.hidden = true;
        guideView.classList.remove('active');
        guideView.hidden = true;
        marketingView.classList.remove('active');
        marketingView.hidden = true;
        liveOpsView.classList.remove('active');
        liveOpsView.hidden = true;
        personnelView.classList.remove('active');
        personnelView.hidden = true;
        hideSalesView();
        hideIPView();
        phone.classList.add('is-expanded');
        architectureView.hidden = false;
        requestAnimationFrame(() => architectureView.classList.add('active'));
    }

    function openInternalIP() {
        homeView.classList.remove('active');
        homeView.hidden = true;
        vreadView.classList.remove('active');
        vreadView.hidden = true;
        guideView.classList.remove('active');
        guideView.hidden = true;
        marketingView.classList.remove('active');
        marketingView.hidden = true;
        liveOpsView.classList.remove('active');
        liveOpsView.hidden = true;
        personnelView.classList.remove('active');
        personnelView.hidden = true;
        hideSalesView();
        hideArchitectureView();
        hideUtilityViews();
        phone.classList.add('is-expanded');
        ipView.hidden = false;
        requestAnimationFrame(() => ipView.classList.add('active'));
    }

    function returnToHome() {
        phone.classList.remove('is-expanded');
        vreadView.classList.remove('active');
        vreadView.hidden = true;
        guideView.classList.remove('active');
        guideView.hidden = true;
        marketingView.classList.remove('active');
        marketingView.hidden = true;
        liveOpsView.classList.remove('active');
        liveOpsView.hidden = true;
        personnelView.classList.remove('active');
        personnelView.hidden = true;
        hideSalesView();
        hideArchitectureView();
        hideIPView();
        window.setLiveOpsPhoneTarget?.(null);
        homeView.hidden = false;
        requestAnimationFrame(() => homeView.classList.add('active'));
    }

    vreadBackBtn.addEventListener('click', returnToHome);
    guideBackBtn.addEventListener('click', returnToHome);
    mktBackBtn.addEventListener('click', returnToHome);
    liveOpsBackBtn.addEventListener('click', returnToHome);

    // Studio widget click -> Opens Studio Customization modal
    phone.querySelector('#phone-studio-widget').addEventListener('click', () => {
        window.openCompanyStudioPanel?.();
    });

    // 6. VREAD SOCIAL NETWORK GENERATOR & LOGIC
    let currentVreadFilter = 'all';
    let currentVreadTag = null;
    let vreadPostCache = [];

    function generateVreadFeed(currentGame) {
        const studioName = currentGame.companyName || 'Tu Estudio';
        const studioHandle = studioName.normalize('NFD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'estudio';
        const year = currentGame.getHistoricalYear ? currentGame.getHistoricalYear() : (1981 + currentGame.year);
        const history = currentGame.gamesHistory || [];
        const activeProject = currentGame.currentProject;
        const trend = currentGame.marketTrend;

        const posts = [];

        // Trend topics data
        const trendTopicName = trend?.topicId || 'Cyberpunk';
        const trendGenreName = trend?.genreId || 'RPG';

        // 1. Posts about player's released games (praises, critiques, wishlist)
        if (history.length) {
            history.slice(0, 4).forEach((gameItem, i) => {
                const gameName = gameItem.name || `Juego ${i + 1}`;
                const score = Number(gameItem.score || gameItem.finalScore || 7.5);
                const genre = gameItem.genre?.name || 'Acción';

                if (score >= 8.5) {
                    posts.push({
                        id: `post-rev-${gameItem.id || i}-1`,
                        type: 'reviews',
                        author: 'PixelMaster_X',
                        handle: 'pixelmaster',
                        verified: true,
                        time: '12m',
                        text: `¡Qué absoluta locura #{${gameName}} de @${studioHandle}! Llevo 18 horas seguidas enganchado. La historia y el gameplay son una maravilla. 10/10 #GOTY #${genre}`,
                        likes: 3420 + i * 210,
                        reposts: 580 + i * 40,
                        replies: [
                            { author: 'GamerVance', text: 'Opino lo mismo, la banda sonora es una gozada absoluta.' },
                            { author: 'Clara_Dev', text: 'De los mejores lanzamientos de este año sin duda.' }
                        ]
                    });
                    posts.push({
                        id: `post-rev-${gameItem.id || i}-2`,
                        type: 'reviews',
                        author: 'RetroNerd_99',
                        handle: 'retronerd',
                        verified: false,
                        time: '1h',
                        text: `#{${gameName}} es brutal, aunque siendo honesto... ¡me hubiese encantado que tuviese cooperativo online o editor de niveles! Ojalá @${studioHandle} prepare una expansión o secuela pronto.`,
                        likes: 1890,
                        reposts: 320,
                        replies: [
                            { author: 'Niko_Play', text: '¡Totalmente! Si tuviese multijugador le daba un 11/10.' }
                        ]
                    });
                } else if (score >= 6.5) {
                    posts.push({
                        id: `post-rev-${gameItem.id || i}-1`,
                        type: 'reviews',
                        author: 'Alex_Reviews',
                        handle: 'alex_reviews',
                        verified: true,
                        time: '45m',
                        text: `Probando #{${gameName}} de @${studioHandle}. Es muy divertido pero se vuelve algo repetitivo a mitad de partida. Le hubiese sentado bien más variedad de jefes y misiones secundarias. 7.5/10.`,
                        likes: 890,
                        reposts: 115,
                        replies: [
                            { author: 'Sofi_Pixel', text: 'A mí se me hizo un poco corto, pero las ideas base son buenísimas.' }
                        ]
                    });
                    posts.push({
                        id: `post-rev-${gameItem.id || i}-2`,
                        type: 'reviews',
                        author: 'KikeGamer',
                        handle: 'kikegamer',
                        verified: false,
                        time: '3h',
                        text: `Me gustó #{${gameName}}, pero la curva de dificultad está rota en el último tramo. Necesita un parche de balance urgente. Aún así buen intento de @${studioHandle}.`,
                        likes: 620,
                        reposts: 84,
                        replies: []
                    });
                } else {
                    posts.push({
                        id: `post-rev-${gameItem.id || i}-1`,
                        type: 'reviews',
                        author: 'CriticoSinFiltro',
                        handle: 'criticosinfiltro',
                        verified: true,
                        time: '2h',
                        text: `Tenía muchas ganas de probar #{${gameName}} de @${studioHandle}, pero está repleto de bugs y caídas de rendimiento... La idea molaba pero se nota que les faltó optimizar la arquitectura técnica. 5/10.`,
                        likes: 1420,
                        reposts: 410,
                        replies: [
                            { author: 'Dani_Byte', text: 'Cierto, a mí se me cerró dos veces en la pantalla final.' }
                        ]
                    });
                }
            });
        } else {
            posts.push({
                id: 'post-waiting-1',
                type: 'reviews',
                author: 'ComunidadGamer',
                handle: 'comunidad_gamer',
                verified: true,
                time: '25m',
                text: `Toda la comunidad de Vread pendiente del garaje de @${studioHandle}. ¡Hay rumores de que preparan un proyecto ambicioso para este año! #${studioName}`,
                likes: 840,
                reposts: 120,
                replies: []
            });
        }

        // 2. Active project chatter
        if (activeProject) {
            posts.push({
                id: 'post-active-project',
                type: 'reviews',
                author: 'DevLeaks_ES',
                handle: 'devleaks_es',
                verified: true,
                time: '18m',
                text: `[FILTRACIÓN] @${studioHandle} está desarrollando #{${activeProject.name || 'su nuevo proyecto'}}. Las fuentes dicen que la arquitectura de motor y deuda técnica está bajo control. ¡Expectación máxima!`,
                likes: 2150,
                reposts: 490,
                replies: [
                    { author: 'FanDeLosJuegos', text: '¡Por favor que salga pronto!' }
                ]
            });
        }

        // 3. Fake Twitch / Streamers ("tichw falsos")
        const streamerNames = ['SpeedyStreamer', 'Valkiria_TV', 'ElTitoPixel', 'CharlyGaming'];
        const fakeGames = history.length ? history.map(g => g.name) : ['Proyecto Alfa', 'CyberQuest'];

        posts.push({
            id: 'post-stream-1',
            type: 'live',
            author: `${streamerNames[0]} [LIVE]`,
            handle: 'speedy_live',
            verified: true,
            isLive: true,
            time: 'AHORA',
            text: `LIVE en Twich: Intentando pasarme #{${fakeGames[0]}} sin recibir daño en dificultad pesadilla. ¡Pasaos que ya somos más de 24.3k en el chat! twich.tv/speedy_live`,
            likes: 4890,
            reposts: 1240,
            replies: [
                { author: 'ChatMod', text: '¡Ese salto final fue histórico!' }
            ]
        });

        posts.push({
            id: 'post-stream-2',
            type: 'live',
            author: streamerNames[1],
            handle: 'valkiria_tv',
            verified: true,
            time: '2h',
            text: `Clip de la retransmisión de hoy: 'No me esperaba ese giro de guión en #{${fakeGames[0]}}'. Mi cara fue un poema jajaja. Twich Highlight #Clips`,
            likes: 2980,
            reposts: 610,
            replies: []
        });

        posts.push({
            id: 'post-stream-3',
            type: 'live',
            author: streamerNames[2],
            handle: 'eltitopixel',
            verified: false,
            time: '4h',
            text: `¡Mil gracias a @${studioHandle} por la clave de prensa anticipada! Esta noche especial de 6 horas explorando cada rincón del juego.`,
            likes: 1450,
            reposts: 280,
            replies: []
        });

        // 4. Industry trends & gossip ("Tendencias")
        posts.push({
            id: 'post-trend-1',
            type: 'trend',
            author: 'AnalistaVideojuegos',
            handle: 'industry_analyst',
            verified: true,
            time: '35m',
            text: `Análisis de mercado: La combinación de temática #{${trendTopicName}} con género #{${trendGenreName}} está generando los márgenes más altos de este año. La sinergia perfecta es oro puro. #Tendencias`,
            likes: 3120,
            reposts: 740,
            replies: [
                { author: 'IndieDevHub', text: 'Totalmente de acuerdo, la demanda del público está disparada.' }
            ]
        });

        posts.push({
            id: 'post-trend-2',
            type: 'trend',
            author: 'GamerSincero',
            handle: 'gamersincero',
            verified: false,
            time: '5h',
            text: `Saturación evidente: Demasiados clones genéricos en las tiendas. Si los estudios no investigan mejores motores en I+D, la industria va a sufrir un pinchazo serio. #${year}`,
            likes: 1670,
            reposts: 380,
            replies: []
        });

        return posts;
    }

    function renderVreadApp() {
        const currentGame = gameInstance || game;
        if (!currentGame) return;

        vreadPostCache = generateVreadFeed(currentGame);
        renderVreadChips();
        renderVreadTimeline();
    }

    function renderVreadChips() {
        const chipsContainer = phone.querySelector('#vread-trends-chips');
        if (!chipsContainer) return;

        const currentGame = gameInstance || game;
        const studio = currentGame.companyName || 'PixelForge';
        const year = currentGame.getHistoricalYear ? currentGame.getHistoricalYear() : 1987;
        const trend = currentGame.marketTrend;

        const tags = [
            `#${studio.replace(/\s+/g, '')}`,
            `#Goty${year}`,
            `#${trend?.topicId || 'Cyberpunk'}`,
            `#${trend?.genreId || 'RPG'}`,
            '#TwichLive',
            '#GameDev'
        ];

        chipsContainer.innerHTML = tags.map(tag => `
            <button type="button" class="vread-chip ${currentVreadTag === tag ? 'active' : ''}" data-tag="${tag}">
                ${tag}
            </button>
        `).join('');

        chipsContainer.querySelectorAll('.vread-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const tag = chip.dataset.tag;
                currentVreadTag = currentVreadTag === tag ? null : tag;
                renderVreadChips();
                renderVreadTimeline();
            });
        });
    }

    function renderVreadTimeline() {
        const container = phone.querySelector('#vread-posts-container');
        if (!container) return;

        let filtered = vreadPostCache;

        // Filter by tab
        if (currentVreadFilter === 'reviews') {
            filtered = filtered.filter(p => p.type === 'reviews');
        } else if (currentVreadFilter === 'live') {
            filtered = filtered.filter(p => p.type === 'live');
        }

        // Filter by tag if selected
        if (currentVreadTag) {
            const cleanTag = currentVreadTag.replace('#', '').toLowerCase();
            filtered = filtered.filter(p => p.text.toLowerCase().includes(cleanTag));
        }

        if (!filtered.length) {
            container.innerHTML = `
                <div class="vread-empty">
                    <p>No hay publicaciones con estos filtros por ahora.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map((post, idx) => {
            const initials = post.author.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'VR';
            const avatarColorIndex = (idx % 5) + 1;
            const highlightedText = post.text
                .replace(/#\{([^}]+)\}/g, '<span class="vread-mention">#$1</span>')
                .replace(/#([a-zA-Z0-9_]+)/g, '<span class="vread-hashtag">#$1</span>')
                .replace(/@([a-zA-Z0-9_]+)/g, '<span class="vread-handle-mention">@$1</span>');

            return `
                <article class="vread-post" data-post-id="${post.id}">
                    <div class="vread-avatar vread-avatar--${avatarColorIndex}" aria-hidden="true">
                        ${initials}
                    </div>
                    <div class="vread-post-main">
                        <header class="vread-post-head">
                            <span class="vread-author-name">${post.author}</span>
                            ${post.verified ? `
                                <svg class="vread-verified-badge" viewBox="0 0 20 20" fill="currentColor" aria-label="Verificado">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                </svg>
                            ` : ''}
                            <span class="vread-author-handle">@${post.handle}</span>
                            <span class="vread-post-time">· ${post.time}</span>
                        </header>
                        <p class="vread-post-text">${highlightedText}</p>
                        
                        <!-- Interactive Actions Bar -->
                        <div class="vread-actions-bar">
                            <button type="button" class="vread-action-btn vread-action-reply" title="Comentarios">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span>${post.replies?.length || 0}</span>
                            </button>
                            <button type="button" class="vread-action-btn vread-action-repost" title="Republicar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="17 1 21 5 17 9"></polyline>
                                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                    <polyline points="7 23 3 19 7 15"></polyline>
                                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                                </svg>
                                <span>${post.reposts || 0}</span>
                            </button>
                            <button type="button" class="vread-action-btn vread-action-like" title="Me gusta" data-likes="${post.likes}">
                                <svg class="vread-heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span class="vread-likes-count">${formatNumber(post.likes)}</span>
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
                            <details class="vread-replies-accordion">
                                <summary>Ver ${post.replies.length} respuestas</summary>
                                <div class="vread-replies-list">
                                    ${post.replies.map(r => `
                                        <div class="vread-reply-item">
                                            <strong>@${r.author.toLowerCase().replace(/[^a-z0-9]/g, '')}:</strong>
                                            <span>${r.text}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </details>
                        ` : ''}
                    </div>
                </article>
            `;
        }).join('');

        // Wire like click microinteraction
        container.querySelectorAll('.vread-action-like').forEach(likeBtn => {
            likeBtn.addEventListener('click', () => {
                const isLiked = likeBtn.classList.toggle('is-liked');
                let count = parseInt(likeBtn.dataset.likes, 10) || 0;
                count = isLiked ? count + 1 : count;
                likeBtn.dataset.likes = count;
                likeBtn.querySelector('.vread-likes-count').textContent = formatNumber(count);
                likeBtn.classList.add('heart-burst');
                setTimeout(() => likeBtn.classList.remove('heart-burst'), 300);
            });
        });
    }

    function formatNumber(num) {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return String(num);
    }

    // Vread feed tabs switching
    phone.querySelectorAll('.vread-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            phone.querySelectorAll('.vread-tab').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            currentVreadFilter = tab.dataset.vreadTab;
            renderVreadTimeline();
        });
    });

    // Vread refresh button
    phone.querySelector('#vread-refresh-btn').addEventListener('click', () => {
        const btn = phone.querySelector('#vread-refresh-btn');
        btn.classList.add('spinning');
        setTimeout(() => {
            btn.classList.remove('spinning');
            renderVreadApp();
        }, 400);
    });

    // ==========================================================================
    // 6B. MARKETING IN-PHONE APPLICATION LOGIC
    // ==========================================================================
    function renderMarketingApp() {
        const currentGame = gameInstance || game;
        if (!currentGame) return;

        const bodyContainer = phone.querySelector('#phone-mkt-body');
        if (!bodyContainer) return;

        const year = currentGame.getHistoricalYear ? currentGame.getHistoricalYear() : (1981 + currentGame.year);
        if (currentMktTab === 'campaigns') {
            renderMktCampaignsTab(currentGame, bodyContainer, year);
        } else if (currentMktTab === 'creators') {
            renderMktCreatorsTab(currentGame, bodyContainer, year);
        } else if (currentMktTab === 'archive') {
            renderMktArchiveTab(currentGame, bodyContainer, year);
        }
    }

    function getChannelIconSvg(id) {
        if (id === 'magazine_ad') {
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                <path d="M7 8h10M7 12h10M7 16h6"></path>
            </svg>`;
        }
        if (id === 'local_fair') {
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 10l3-5h12l3 5H3z"></path>
                <path d="M5 10v9m14-9v9M5 16h14"></path>
                <path d="M10 7v3m4-3v3"></path>
            </svg>`;
        }
        if (id === 'cd_demo') {
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 3v3m0 12v3"></path>
            </svg>`;
        }
        if (id === 'e3_trailer') {
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                <polygon points="10,9 16,12 10,15" fill="currentColor"></polygon>
            </svg>`;
        }
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16v12H4z"></path>
            <path d="M8 20h8m-4-4v4"></path>
            <polygon points="10,8 14,10 10,12" fill="currentColor"></polygon>
        </svg>`;
    }

    function getChannelCategory(id) {
        const cats = {
            magazine_ad: 'Prensa impresa',
            local_fair: 'Encuentro presencial',
            cd_demo: 'Demo física en disco',
            e3_trailer: 'Presentación internacional',
            digital_demo: 'Festival digital de demos'
        };
        return cats[id] || 'Promoción';
    }

    function getChannelDesignDetails(id) {
        const details = {
            magazine_ad: {
                audience: 'Lectores de prensa especializada',
                condition: 'La reputación del estudio influye en la expectación final generada por la revista.'
            },
            local_fair: {
                audience: 'Público presencial del mercado local',
                condition: 'Aumenta significativamente el reconocimiento de marca local de forma inmediata.'
            },
            cd_demo: {
                audience: 'Compradores de revistas de informática',
                condition: 'El nivel de pulido y la ausencia de bugs en la demo mejoran la conversión a ventas.'
            },
            e3_trailer: {
                audience: 'Público masivo de la feria internacional',
                condition: 'Expectación muy alta, pero con riesgo de downgrade si el juego final no cumple las expectativas.'
            },
            digital_demo: {
                audience: 'Visitantes globales del festival digital de demos',
                condition: 'Genera volumen directo de listas de deseos en tiendas digitales.'
            }
        };
        return details[id] || { audience: 'Audiencia general', condition: '' };
    }

    function renderMktCampaignsTab(currentGame, container, year) {
        const project = currentGame.currentProject;
        const funds = currentGame.funds || 0;
        const options = currentGame.getMarketingOptions ? currentGame.getMarketingOptions() : [];

        if (!options.some(o => o.id === selectedMktChannel)) {
            const firstAvail = options.find(o => o.available) || options[0];
            selectedMktChannel = firstAvail?.id || 'magazine_ad';
        }

        const selectedOption = options.find(o => o.id === selectedMktChannel) || options[0];
        const selectedState = selectedOption ? marketingChannelState(selectedOption, project, funds) : { kind: 'idle', label: 'No disponible' };

        let projectHeroMarkup = '';
        if (project) {
            const hype = Math.round(project.marketingHype || project.hype || 0);
            const awareness = Math.round(project.brandAwareness || 0);
            const wishlists = project.wishlists ? Number(project.wishlists).toLocaleString('es-ES') : '0';
            const actionCount = project.marketingActions?.length || 0;
            const genreName = project.genre?.name || 'Género';
            const platformName = project.platform?.name || 'Plataforma';

            projectHeroMarkup = `
                <div class="mkt-project-card">
                    <div class="mkt-card-badge-row">
                        <span class="mkt-badge-active">PROYECTO ACTIVO</span>
                        <span class="mkt-badge-progress">${Math.round(project.overallProgress || 0)}% desarrollo</span>
                    </div>
                    <h3 class="mkt-project-title">${project.name}</h3>
                    <p class="mkt-project-meta">${genreName} · ${platformName}</p>
                    <div class="mkt-stats-grid">
                        <div class="mkt-stat-box">
                            <span class="mkt-stat-label">Expectación</span>
                            <span class="mkt-stat-value mkt-stat-value--cyan">${hype} pts</span>
                        </div>
                        <div class="mkt-stat-box">
                            <span class="mkt-stat-label">Reconocimiento</span>
                            <span class="mkt-stat-value mkt-stat-value--rose">${awareness} / 100</span>
                        </div>
                        <div class="mkt-stat-box">
                            <span class="mkt-stat-label">Listas deseos</span>
                            <span class="mkt-stat-value mkt-stat-value--amber">${wishlists}</span>
                        </div>
                        <div class="mkt-stat-box">
                            <span class="mkt-stat-label">Tesorería</span>
                            <span class="mkt-stat-value mkt-stat-value--green">$${Math.floor(funds).toLocaleString('es-ES')}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            projectHeroMarkup = `
                <div class="mkt-project-card mkt-project-card--empty">
                    <div class="mkt-card-badge-row">
                        <span class="mkt-badge-idle">EN ESPERA</span>
                    </div>
                    <h3 class="mkt-project-title">Sin proyecto en desarrollo</h3>
                    <p class="mkt-project-meta">Inicia un juego desde Nuevo juego para desbloquear la ejecución de campañas de marketing.</p>
                    <div class="mkt-funds-row">
                        <span>Tesorería disponible:</span>
                        <strong class="mkt-stat-value--green">$${Math.floor(funds).toLocaleString('es-ES')}</strong>
                    </div>
                </div>
            `;
        }

        const channelListMarkup = options.map(opt => {
            const state = marketingChannelState(opt, project, funds);
            const isSelected = opt.id === selectedMktChannel;
            const costFormatted = `$${opt.cost.toLocaleString('es-ES')}`;
            const iconSvg = getChannelIconSvg(opt.id);

            return `
                <button type="button" class="mkt-channel-btn ${isSelected ? 'active' : ''} ${state.kind}" data-channel-id="${opt.id}">
                    <div class="mkt-channel-btn-icon">${iconSvg}</div>
                    <div class="mkt-channel-btn-info">
                        <strong>${opt.label}</strong>
                        <small>${getChannelCategory(opt.id)} · ${costFormatted}</small>
                    </div>
                    <span class="mkt-channel-status-pill mkt-status--${state.kind}">
                        ${state.label}
                    </span>
                </button>
            `;
        }).join('');

        let inspectorMarkup = '';
        if (selectedOption) {
            const optDesign = getChannelDesignDetails(selectedOption.id);
            const canLaunch = selectedState.kind === 'ready';
            const buttonLabel = selectedState.kind === 'done'
                ? 'Campaña ejecutada'
                : (selectedState.kind === 'ready'
                    ? `Lanzar campaña ($${selectedOption.cost.toLocaleString('es-ES')})`
                    : selectedState.label);

            inspectorMarkup = `
                <div class="mkt-inspector-card">
                    <div class="mkt-inspector-header">
                        <div class="mkt-inspector-icon">${getChannelIconSvg(selectedOption.id)}</div>
                        <div class="mkt-inspector-title-wrap">
                            <span class="mkt-inspector-kicker">Ficha técnica</span>
                            <h4>${selectedOption.label}</h4>
                        </div>
                    </div>
                    <p class="mkt-inspector-desc">${selectedOption.detail}</p>
                    <div class="mkt-inspector-facts">
                        <div class="mkt-fact-item">
                            <span>Audiencia:</span>
                            <strong>${optDesign.audience}</strong>
                        </div>
                        <div class="mkt-fact-item">
                            <span>Expectación base:</span>
                            <strong class="text-cyan">+${selectedOption.hype} pts</strong>
                        </div>
                        ${selectedOption.awareness ? `
                        <div class="mkt-fact-item">
                            <span>Reconocimiento:</span>
                            <strong class="text-rose">+${selectedOption.awareness} pts</strong>
                        </div>` : ''}
                        <div class="mkt-fact-item">
                            <span>Coste:</span>
                            <strong class="text-green">$${selectedOption.cost.toLocaleString('es-ES')}</strong>
                        </div>
                    </div>
                    ${optDesign.condition ? `<p class="mkt-inspector-note">${optDesign.condition}</p>` : ''}
                    <button type="button" class="phone-mkt-launch-btn ${canLaunch ? 'ready' : 'disabled'}" ${canLaunch ? '' : 'disabled'} id="phone-mkt-launch-action">
                        ${buttonLabel}
                    </button>
                </div>
            `;
        }

        const records = [project, ...(currentGame.gamesHistory || [])].filter(item => item?.marketingActions?.length);
        let historyMarkup = '';
        if (records.length) {
            historyMarkup = `
                <details class="mkt-history-accordion">
                    <summary>
                        <span>Historial de campañas (${records.length})</span>
                    </summary>
                    <div class="mkt-history-list">
                        ${records.map(rec => {
                const actions = rec.marketingActions || [];
                return `
                                <div class="mkt-history-entry">
                                    <strong>${rec.name}</strong>
                                    <ul>
                                        ${actions.map(act => `
                                            <li>
                                                <span>${act.label || act.id}</span>
                                                <small>$${act.cost?.toLocaleString('es-ES')} · S${act.week || 1}</small>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            `;
            }).join('')}
                    </div>
                </details>
            `;
        }

        container.innerHTML = `
            ${projectHeroMarkup}
            <div class="mkt-section-title">Canales de difusión</div>
            <div class="mkt-channel-stack" id="mkt-channel-stack">
                ${channelListMarkup}
            </div>
            ${inspectorMarkup}
            ${historyMarkup}
        `;

        container.querySelectorAll('[data-channel-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedMktChannel = btn.dataset.channelId;
                renderMarketingApp();
            });
        });

        const launchBtn = container.querySelector('#phone-mkt-launch-action');
        if (launchBtn && !launchBtn.disabled) {
            launchBtn.addEventListener('click', () => {
                if (typeof window.runMarketingMethod === 'function') {
                    window.runMarketingMethod(selectedMktChannel);
                    renderMarketingApp();
                } else if (typeof currentGame.runProjectMarketing === 'function') {
                    currentGame.runProjectMarketing(selectedMktChannel);
                    renderMarketingApp();
                }
            });
        }
    }

    function renderMktCreatorsTab(currentGame, container, year) {
        const project = currentGame.currentProject;
        const history = currentGame.gamesHistory || [];
        const targetGames = [
            ...(project ? [{ id: project.id || `project:${project.name}`, name: `${project.name} (en desarrollo)` }] : []),
            ...history.map(item => ({ id: item.id, name: item.name }))
        ];

        if (!selectedMktCreatorGame || !targetGames.some(g => String(g.id) === String(selectedMktCreatorGame))) {
            selectedMktCreatorGame = targetGames[0]?.id || null;
        }

        const creators = typeof currentGame.getCreatorProfiles === 'function'
            ? (currentGame.getCreatorProfiles(selectedMktCreatorGame) || [])
            : (currentGame.creatorProfiles || []);

        const isStreamingUnlocked = year >= 2006;
        let content = '';

        if (!targetGames.length) {
            content = `
                <div class="mkt-empty-card">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="mkt-empty-icon">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h4>Sin videojuegos disponibles</h4>
                    <p>Crea o publica un juego para poder enviar claves de prensa y retransmisión a creadores.</p>
                </div>
            `;
        } else if (!isStreamingUnlocked) {
            content = `
                <div class="mkt-future-era-card">
                    <div class="mkt-future-header">
                        <div class="mkt-future-badge">EN EL HORIZONTE</div>
                        <h4>El streaming aún no ha llegado</h4>
                    </div>
                    <p class="mkt-future-desc">
                        En el año ${year}, el fenómeno de los creadores de contenido online y retransmisiones en directo todavía no existe en la industria.
                    </p>
                    <div class="mkt-future-unlock-pill">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mkt-mini-icon">
                            <rect x="3" y="11" width="18" height="11" rx="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>Se desbloquea a partir de <strong>2006</strong></span>
                    </div>
                    <details class="mkt-future-preview">
                        <summary>Ver próximos creadores catalogados (${creators.length})</summary>
                        <div class="mkt-creator-list">
                            ${creators.map(c => `
                                <div class="mkt-creator-card disabled">
                                    <div class="mkt-creator-avatar">${c.name.slice(0, 2).toUpperCase()}</div>
                                    <div class="mkt-creator-info">
                                        <strong>${c.name}</strong>
                                        <small>${c.platform || 'Streaming'} · ${(c.followers || c.audience || 0).toLocaleString('es-ES')} seguidores</small>
                                    </div>
                                    <span class="mkt-badge-locked">Bloqueado 2006</span>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                </div>
            `;
        } else {
            const gameSelectOptions = targetGames.map(g => `
                <option value="${g.id}" ${String(g.id) === String(selectedMktCreatorGame) ? 'selected' : ''}>
                    ${g.name}
                </option>
            `).join('');

            content = `
                <div class="mkt-creator-select-bar">
                    <label for="phone-mkt-game-select">Juego destino:</label>
                    <select id="phone-mkt-game-select" class="phone-select">
                        ${gameSelectOptions}
                    </select>
                </div>
                <div class="mkt-creator-list">
                    ${creators.map(creator => {
                const fee = Number(creator.fee || 0) + 25;
                const followers = Number(creator.followers || creator.audience || 0).toLocaleString('es-ES');
                const genres = Array.isArray(creator.genres) ? creator.genres.join(', ') : (creator.genres || 'Variados');
                const alreadySent = Boolean(creator.alreadySent);
                const canAfford = currentGame.funds >= fee;

                return `
                            <div class="mkt-creator-card ${alreadySent ? 'sent' : ''}">
                                <div class="mkt-creator-avatar mkt-avatar--${creator.platform?.toLowerCase() || 'stream'}">
                                    ${creator.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div class="mkt-creator-info">
                                    <div class="mkt-creator-title-row">
                                        <strong>${creator.name}</strong>
                                        <span class="mkt-platform-tag">${creator.platform || 'Twich'}</span>
                                    </div>
                                    <p class="mkt-creator-followers">${followers} seguidores</p>
                                    <p class="mkt-creator-genres">Afinidad: ${genres}</p>
                                    <span class="mkt-creator-cost">Coste paquete: $${fee.toLocaleString('es-ES')}</span>
                                </div>
                                <button type="button" class="phone-mkt-send-key-btn ${alreadySent ? 'sent' : (canAfford ? 'ready' : 'disabled')}" 
                                    data-creator-id="${creator.id}" 
                                    ${alreadySent || !canAfford ? 'disabled' : ''}>
                                    ${alreadySent ? 'Enviada' : 'Enviar clave'}
                                </button>
                            </div>
                        `;
            }).join('')}
                </div>
            `;
        }

        container.innerHTML = `
            <div class="mkt-tab-header">
                <h3>Relaciones con creadores</h3>
                <p>Envía copias promocionales y códigos para que influencers transmitan tus juegos.</p>
            </div>
            ${content}
        `;

        const selectEl = container.querySelector('#phone-mkt-game-select');
        if (selectEl) {
            selectEl.addEventListener('change', (e) => {
                selectedMktCreatorGame = e.target.value;
                renderMarketingApp();
            });
        }

        container.querySelectorAll('.phone-mkt-send-key-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                const creatorId = btn.dataset.creatorId;
                if (typeof window.sendMarketingKeys === 'function') {
                    window.sendMarketingKeys(creatorId);
                    renderMarketingApp();
                } else if (typeof currentGame.sendStreamerKeys === 'function') {
                    currentGame.sendStreamerKeys(selectedMktCreatorGame, creatorId, 1);
                    renderMarketingApp();
                }
            });
        });
    }

    function renderMktArchiveTab(currentGame, container, year) {
        const history = currentGame.gamesHistory || [];
        const archive = currentGame.marketingPressArchive || [];
        const approvalGames = history.filter(item => item.userApproval !== undefined || item.pressScore !== undefined || item.reviewBombing);

        let reviewsMarkup = '';
        if (approvalGames.length) {
            reviewsMarkup = `
                <div class="mkt-archive-section">
                    <h4>Prensa y valoraciones</h4>
                    <div class="mkt-reviews-list">
                        ${approvalGames.slice(0, 8).map(game => {
                const press = game.pressScore != null ? Number(game.pressScore).toFixed(1) : (game.score ? Number(game.score).toFixed(1) : '—');
                const approval = game.userApproval != null ? `${Math.round(game.userApproval)}%` : '—';
                const hasBombing = Boolean(game.reviewBombing);

                return `
                                <div class="mkt-review-item">
                                    <div class="mkt-review-game-info">
                                        <strong>${game.name}</strong>
                                        <small>Lanzado en ${game.releaseYear || game.year || year}</small>
                                    </div>
                                    <div class="mkt-review-badges">
                                        <span class="mkt-badge-press">Prensa ${press}/10</span>
                                        <span class="mkt-badge-users">${approval} aprobación</span>
                                        ${hasBombing ? '<span class="mkt-badge-bombing">Review Bombing</span>' : ''}
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        } else {
            reviewsMarkup = `
                <div class="mkt-archive-section">
                    <h4>Prensa y valoraciones</h4>
                    <p class="mkt-empty-text">Las reseñas de prensa y aprobación de la comunidad se archivarán automáticamente cuando publiques tus juegos.</p>
                </div>
            `;
        }

        let galleryMarkup = '';
        if (archive.length) {
            galleryMarkup = `
                <div class="mkt-archive-section">
                    <h4>Portadas históricas de revista (${archive.length})</h4>
                    <p class="mkt-section-sub">Toca cualquier portada para ver el número completo.</p>
                    <div class="mkt-press-grid">
                        ${archive.map(cover => `
                            <button type="button" class="mkt-press-card" data-cover-id="${cover.id}">
                                <div class="mkt-press-badge">${cover.priceBadge || '$5'}</div>
                                <div class="mkt-press-pub">${cover.publicationName || 'Revista'}</div>
                                <strong class="mkt-press-headline">${cover.headline || 'Portada'}</strong>
                                <div class="mkt-press-footer">
                                    <span>${cover.gameName || 'Juego'}</span>
                                    <span>Año ${cover.year}</span>
                                </div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="mkt-tab-header">
                <h3>Prensa y Hemeroteca</h3>
                <p>Archivo de coberturas editoriales, notas de análisis y portadas históricas conseguidas por tu estudio.</p>
            </div>
            ${reviewsMarkup}
            ${galleryMarkup}
        `;

        container.querySelectorAll('[data-cover-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const coverId = btn.dataset.coverId;
                const cover = archive.find(c => c.id === coverId);
                if (cover && typeof window.showMarketingPressCover === 'function') {
                    window.showMarketingPressCover(cover);
                }
            });
        });
    }

    // Segmented tab switching in Marketing app
    phone.querySelectorAll('.phone-seg-tab[data-mkt-tab]').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            phone.querySelectorAll('.phone-seg-tab[data-mkt-tab]').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabBtn.classList.add('active');
            tabBtn.setAttribute('aria-selected', 'true');
            currentMktTab = tabBtn.dataset.mktTab;
            renderMarketingApp();
        });
    });

    // ==========================================================================
    // 6B. MARKETING IN-PHONE APPLICATION LOGIC
    // ==========================================================================
    let currentMktTab = 'campaigns';
    let selectedMktChannel = 'magazine_ad';
    let selectedMktCreatorGame = null;

    function renderMarketingApp() {
        const currentGame = gameInstance || game;
        if (!currentGame) return;

        const bodyContainer = phone.querySelector('#phone-mkt-body');
        if (!bodyContainer) return;

        const year = currentGame.getHistoricalYear ? currentGame.getHistoricalYear() : (1981 + currentGame.year);
        const [editionLabel] = marketingEdition(year);

        const eraBadge = phone.querySelector('#phone-mkt-era-badge');
        if (eraBadge) eraBadge.textContent = `${year} · ${editionLabel}`;

        if (currentMktTab === 'campaigns') {
            renderMktCampaignsTab(currentGame, bodyContainer, year);
        } else if (currentMktTab === 'creators') {
            renderMktCreatorsTab(currentGame, bodyContainer, year);
        } else if (currentMktTab === 'archive') {
            renderMktArchiveTab(currentGame, bodyContainer, year);
        }
    }

    function getChannelIconSvg(id) {
        if (id === 'magazine_ad') {
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                <path d="M7 8h10M7 12h10M7 16h6"></path>
            </svg>`;
        }
        if (id === 'local_fair') {
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 10l3-5h12l3 5H3z"></path>
                <path d="M5 10v9m14-9v9M5 16h14"></path>
                <path d="M10 7v3m4-3v3"></path>
            </svg>`;
        }
        if (id === 'cd_demo') {
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 3v3m0 12v3"></path>
            </svg>`;
        }
        if (id === 'e3_trailer') {
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                <polygon points="10,9 16,12 10,15" fill="currentColor"></polygon>
            </svg>`;
        }
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16v12H4z"></path>
            <path d="M8 20h8m-4-4v4"></path>
            <polygon points="10,8 14,10 10,12" fill="currentColor"></polygon>
        </svg>`;
    }

    function getChannelCategory(id) {
        const cats = {
            magazine_ad: 'Prensa impresa',
            local_fair: 'Encuentro presencial',
            cd_demo: 'Demo física en disco',
            e3_trailer: 'Presentación internacional',
            digital_demo: 'Festival digital de demos'
        };
        return cats[id] || 'Promoción';
    }

    function getChannelDesignDetails(id) {
        const details = {
            magazine_ad: {
                audience: 'Lectores de prensa especializada',
                condition: 'La reputación del estudio influye en la expectación final generada por la revista.'
            },
            local_fair: {
                audience: 'Público presencial del mercado local',
                condition: 'Aumenta significativamente el reconocimiento de marca local de forma inmediata.'
            },
            cd_demo: {
                audience: 'Compradores de revistas de informática',
                condition: 'El nivel de pulido y la ausencia de bugs en la demo mejoran la conversión a ventas.'
            },
            e3_trailer: {
                audience: 'Público masivo de la feria internacional',
                condition: 'Expectación muy alta, pero con riesgo de downgrade si el juego final no cumple las expectativas.'
            },
            digital_demo: {
                audience: 'Visitantes globales del festival digital de demos',
                condition: 'Genera volumen directo de listas de deseos en tiendas digitales.'
            }
        };
        return details[id] || { audience: 'Audiencia general', condition: '' };
    }

    function renderMktCampaignsTab(currentGame, container, year) {
        const project = currentGame.currentProject;
        const funds = currentGame.funds || 0;
        const options = currentGame.getMarketingOptions ? currentGame.getMarketingOptions() : [];

        if (!options.some(o => o.id === selectedMktChannel)) {
            const firstAvail = options.find(o => o.available) || options[0];
            selectedMktChannel = firstAvail?.id || 'magazine_ad';
        }

        const selectedOption = options.find(o => o.id === selectedMktChannel) || options[0];
        const selectedState = selectedOption ? marketingChannelState(selectedOption, project, funds) : { kind: 'idle', label: 'No disponible' };

        let projectHeroMarkup = '';
        if (project) {
            const hype = Math.round(project.marketingHype || project.hype || 0);
            const awareness = Math.round(project.brandAwareness || 0);
            const wishlists = project.wishlists ? Number(project.wishlists).toLocaleString('es-ES') : '0';
            const actionCount = project.marketingActions?.length || 0;
            const genreName = project.genre?.name || 'Género';
            const platformName = project.platform?.name || 'Plataforma';

            projectHeroMarkup = `
                <div class="mkt-project-card">
                    <div class="mkt-card-badge-row">
                        <span class="mkt-badge-active">PROYECTO ACTIVO</span>
                        <span class="mkt-badge-progress">${Math.round(project.overallProgress || 0)}% desarrollo</span>
                    </div>
                    <h3 class="mkt-project-title">${project.name}</h3>
                    <p class="mkt-project-meta">${genreName} · ${platformName}</p>
                    <div class="mkt-stats-grid">
                        <div class="mkt-stat-box">
                            <span class="mkt-stat-label">Expectación</span>
                            <span class="mkt-stat-value mkt-stat-value--cyan">${hype} pts</span>
                        </div>
                        <div class="mkt-stat-box">
                            <span class="mkt-stat-label">Reconocimiento</span>
                            <span class="mkt-stat-value mkt-stat-value--rose">${awareness} / 100</span>
                        </div>
                        <div class="mkt-stat-box">
                            <span class="mkt-stat-label">Listas deseos</span>
                            <span class="mkt-stat-value mkt-stat-value--amber">${wishlists}</span>
                        </div>
                        <div class="mkt-stat-box">
                            <span class="mkt-stat-label">Tesorería</span>
                            <span class="mkt-stat-value mkt-stat-value--green">$${Math.floor(funds).toLocaleString('es-ES')}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            projectHeroMarkup = `
                <div class="mkt-project-card mkt-project-card--empty">
                    <div class="mkt-card-badge-row">
                        <span class="mkt-badge-idle">EN ESPERA</span>
                    </div>
                    <h3 class="mkt-project-title">Sin proyecto en desarrollo</h3>
                    <p class="mkt-project-meta">Inicia un juego desde Nuevo juego para desbloquear la ejecución de campañas de marketing.</p>
                    <div class="mkt-funds-row">
                        <span>Tesorería disponible:</span>
                        <strong class="mkt-stat-value--green">$${Math.floor(funds).toLocaleString('es-ES')}</strong>
                    </div>
                </div>
            `;
        }

        const channelListMarkup = options.map(opt => {
            const state = marketingChannelState(opt, project, funds);
            const isSelected = opt.id === selectedMktChannel;
            const costFormatted = `$${opt.cost.toLocaleString('es-ES')}`;
            const iconSvg = getChannelIconSvg(opt.id);

            return `
                <button type="button" class="mkt-channel-btn ${isSelected ? 'active' : ''} ${state.kind}" data-channel-id="${opt.id}">
                    <div class="mkt-channel-btn-icon">${iconSvg}</div>
                    <div class="mkt-channel-btn-info">
                        <strong>${opt.label}</strong>
                        <small>${getChannelCategory(opt.id)} · ${costFormatted}</small>
                    </div>
                    <span class="mkt-channel-status-pill mkt-status--${state.kind}">
                        ${state.label}
                    </span>
                </button>
            `;
        }).join('');

        let inspectorMarkup = '';
        if (selectedOption) {
            const optDesign = getChannelDesignDetails(selectedOption.id);
            const canLaunch = selectedState.kind === 'ready';
            const buttonLabel = selectedState.kind === 'done'
                ? 'Campaña ejecutada'
                : (selectedState.kind === 'ready'
                    ? `Lanzar campaña ($${selectedOption.cost.toLocaleString('es-ES')})`
                    : selectedState.label);

            inspectorMarkup = `
                <div class="mkt-inspector-card">
                    <div class="mkt-inspector-header">
                        <div class="mkt-inspector-icon">${getChannelIconSvg(selectedOption.id)}</div>
                        <div class="mkt-inspector-title-wrap">
                            <span class="mkt-inspector-kicker">Ficha técnica</span>
                            <h4>${selectedOption.label}</h4>
                        </div>
                    </div>
                    <p class="mkt-inspector-desc">${selectedOption.detail}</p>
                    <div class="mkt-inspector-facts">
                        <div class="mkt-fact-item">
                            <span>Audiencia:</span>
                            <strong>${optDesign.audience}</strong>
                        </div>
                        <div class="mkt-fact-item">
                            <span>Expectación base:</span>
                            <strong class="text-cyan">+${selectedOption.hype} pts</strong>
                        </div>
                        ${selectedOption.awareness ? `
                        <div class="mkt-fact-item">
                            <span>Reconocimiento:</span>
                            <strong class="text-rose">+${selectedOption.awareness} pts</strong>
                        </div>` : ''}
                        <div class="mkt-fact-item">
                            <span>Coste:</span>
                            <strong class="text-green">$${selectedOption.cost.toLocaleString('es-ES')}</strong>
                        </div>
                    </div>
                    ${optDesign.condition ? `<p class="mkt-inspector-note">${optDesign.condition}</p>` : ''}
                    <button type="button" class="phone-mkt-launch-btn ${canLaunch ? 'ready' : 'disabled'}" ${canLaunch ? '' : 'disabled'} id="phone-mkt-launch-action">
                        ${buttonLabel}
                    </button>
                </div>
            `;
        }

        const records = [project, ...(currentGame.gamesHistory || [])].filter(item => item?.marketingActions?.length);
        let historyMarkup = '';
        if (records.length) {
            historyMarkup = `
                <details class="mkt-history-accordion">
                    <summary>
                        <span>Historial de campañas (${records.length})</span>
                    </summary>
                    <div class="mkt-history-list">
                        ${records.map(rec => {
                const actions = rec.marketingActions || [];
                return `
                                <div class="mkt-history-entry">
                                    <strong>${rec.name}</strong>
                                    <ul>
                                        ${actions.map(act => `
                                            <li>
                                                <span>${act.label || act.id}</span>
                                                <small>$${act.cost?.toLocaleString('es-ES')} · S${act.week || 1}</small>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            `;
            }).join('')}
                    </div>
                </details>
            `;
        }

        container.innerHTML = `
            ${projectHeroMarkup}
            <div class="mkt-section-title">Canales de difusión</div>
            <div class="mkt-channel-stack" id="mkt-channel-stack">
                ${channelListMarkup}
            </div>
            ${inspectorMarkup}
            ${historyMarkup}
        `;

        container.querySelectorAll('[data-channel-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedMktChannel = btn.dataset.channelId;
                renderMarketingApp();
            });
        });

        const launchBtn = container.querySelector('#phone-mkt-launch-action');
        if (launchBtn && !launchBtn.disabled) {
            launchBtn.addEventListener('click', () => {
                if (typeof window.runMarketingMethod === 'function') {
                    window.runMarketingMethod(selectedMktChannel);
                    renderMarketingApp();
                } else if (typeof currentGame.runProjectMarketing === 'function') {
                    currentGame.runProjectMarketing(selectedMktChannel);
                    renderMarketingApp();
                }
            });
        }
    }

    function renderMktCreatorsTab(currentGame, container, year) {
        const project = currentGame.currentProject;
        const history = currentGame.gamesHistory || [];
        const targetGames = [
            ...(project ? [{ id: project.id || `project:${project.name}`, name: `${project.name} (en desarrollo)` }] : []),
            ...history.map(item => ({ id: item.id, name: item.name }))
        ];

        if (!selectedMktCreatorGame || !targetGames.some(g => String(g.id) === String(selectedMktCreatorGame))) {
            selectedMktCreatorGame = targetGames[0]?.id || null;
        }

        const creators = typeof currentGame.getCreatorProfiles === 'function'
            ? (currentGame.getCreatorProfiles(selectedMktCreatorGame) || [])
            : (currentGame.creatorProfiles || []);

        const isStreamingUnlocked = year >= 2006;
        let content = '';

        if (!targetGames.length) {
            content = `
                <div class="mkt-empty-card">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="mkt-empty-icon">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h4>Sin videojuegos disponibles</h4>
                    <p>Crea o publica un juego para poder enviar claves de prensa y retransmisión a creadores.</p>
                </div>
            `;
        } else if (!isStreamingUnlocked) {
            content = `
                <div class="mkt-future-era-card">
                    <div class="mkt-future-header">
                        <div class="mkt-future-badge">EN EL HORIZONTE</div>
                        <h4>El streaming aún no ha llegado</h4>
                    </div>
                    <p class="mkt-future-desc">
                        En el año ${year}, el fenómeno de los creadores de contenido online y retransmisiones en directo todavía no existe en la industria.
                    </p>
                    <div class="mkt-future-unlock-pill">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mkt-mini-icon">
                            <rect x="3" y="11" width="18" height="11" rx="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>Se desbloquea a partir de <strong>2006</strong></span>
                    </div>
                    <details class="mkt-future-preview">
                        <summary>Ver próximos creadores catalogados (${creators.length})</summary>
                        <div class="mkt-creator-list">
                            ${creators.map(c => `
                                <div class="mkt-creator-card disabled">
                                    <div class="mkt-creator-avatar">${c.name.slice(0, 2).toUpperCase()}</div>
                                    <div class="mkt-creator-info">
                                        <strong>${c.name}</strong>
                                        <small>${c.platform || 'Streaming'} · ${(c.followers || c.audience || 0).toLocaleString('es-ES')} seguidores</small>
                                    </div>
                                    <span class="mkt-badge-locked">Bloqueado 2006</span>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                </div>
            `;
        } else {
            const gameSelectOptions = targetGames.map(g => `
                <option value="${g.id}" ${String(g.id) === String(selectedMktCreatorGame) ? 'selected' : ''}>
                    ${g.name}
                </option>
            `).join('');

            content = `
                <div class="mkt-creator-select-bar">
                    <label for="phone-mkt-game-select">Juego destino:</label>
                    <select id="phone-mkt-game-select" class="phone-select">
                        ${gameSelectOptions}
                    </select>
                </div>
                <div class="mkt-creator-list">
                    ${creators.map(creator => {
                const fee = Number(creator.fee || 0) + 25;
                const followers = Number(creator.followers || creator.audience || 0).toLocaleString('es-ES');
                const genres = Array.isArray(creator.genres) ? creator.genres.join(', ') : (creator.genres || 'Variados');
                const alreadySent = Boolean(creator.alreadySent);
                const canAfford = currentGame.funds >= fee;

                return `
                            <div class="mkt-creator-card ${alreadySent ? 'sent' : ''}">
                                <div class="mkt-creator-avatar mkt-avatar--${creator.platform?.toLowerCase() || 'stream'}">
                                    ${creator.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div class="mkt-creator-info">
                                    <div class="mkt-creator-title-row">
                                        <strong>${creator.name}</strong>
                                        <span class="mkt-platform-tag">${creator.platform || 'Twich'}</span>
                                    </div>
                                    <p class="mkt-creator-followers">${followers} seguidores</p>
                                    <p class="mkt-creator-genres">Afinidad: ${genres}</p>
                                    <span class="mkt-creator-cost">Coste paquete: $${fee.toLocaleString('es-ES')}</span>
                                </div>
                                <button type="button" class="phone-mkt-send-key-btn ${alreadySent ? 'sent' : (canAfford ? 'ready' : 'disabled')}" 
                                    data-creator-id="${creator.id}" 
                                    ${alreadySent || !canAfford ? 'disabled' : ''}>
                                    ${alreadySent ? 'Enviada' : 'Enviar clave'}
                                </button>
                            </div>
                        `;
            }).join('')}
                </div>
            `;
        }

        container.innerHTML = `
            <div class="mkt-tab-header">
                <h3>Relaciones con creadores</h3>
                <p>Envía copias promocionales y códigos para que influencers transmitan tus juegos.</p>
            </div>
            ${content}
        `;

        const selectEl = container.querySelector('#phone-mkt-game-select');
        if (selectEl) {
            selectEl.addEventListener('change', (e) => {
                selectedMktCreatorGame = e.target.value;
                renderMarketingApp();
            });
        }

        container.querySelectorAll('.phone-mkt-send-key-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                const creatorId = btn.dataset.creatorId;
                if (typeof window.sendMarketingKeys === 'function') {
                    window.sendMarketingKeys(creatorId);
                    renderMarketingApp();
                } else if (typeof currentGame.sendStreamerKeys === 'function') {
                    currentGame.sendStreamerKeys(selectedMktCreatorGame, creatorId, 1);
                    renderMarketingApp();
                }
            });
        });
    }

    function renderMktArchiveTab(currentGame, container, year) {
        const history = currentGame.gamesHistory || [];
        const archive = currentGame.marketingPressArchive || [];
        const approvalGames = history.filter(item => item.userApproval !== undefined || item.pressScore !== undefined || item.reviewBombing);

        let reviewsMarkup = '';
        if (approvalGames.length) {
            reviewsMarkup = `
                <div class="mkt-archive-section">
                    <h4>Prensa y valoraciones</h4>
                    <div class="mkt-reviews-list">
                        ${approvalGames.slice(0, 8).map(game => {
                const press = game.pressScore != null ? Number(game.pressScore).toFixed(1) : (game.score ? Number(game.score).toFixed(1) : '—');
                const approval = game.userApproval != null ? `${Math.round(game.userApproval)}%` : '—';
                const hasBombing = Boolean(game.reviewBombing);

                return `
                                <div class="mkt-review-item">
                                    <div class="mkt-review-game-info">
                                        <strong>${game.name}</strong>
                                        <small>Lanzado en ${game.releaseYear || game.year || year}</small>
                                    </div>
                                    <div class="mkt-review-badges">
                                        <span class="mkt-badge-press">Prensa ${press}/10</span>
                                        <span class="mkt-badge-users">${approval} aprobación</span>
                                        ${hasBombing ? '<span class="mkt-badge-bombing">Review Bombing</span>' : ''}
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        } else {
            reviewsMarkup = `
                <div class="mkt-archive-section">
                    <h4>Prensa y valoraciones</h4>
                    <p class="mkt-empty-text">Las reseñas de prensa y aprobación de la comunidad se archivarán automáticamente cuando publiques tus juegos.</p>
                </div>
            `;
        }

        let galleryMarkup = '';
        if (archive.length) {
            galleryMarkup = `
                <div class="mkt-archive-section">
                    <h4>Portadas históricas de revista (${archive.length})</h4>
                    <p class="mkt-section-sub">Toca cualquier portada para ver el número completo.</p>
                    <div class="mkt-press-grid">
                        ${archive.map(cover => `
                            <button type="button" class="mkt-press-card" data-cover-id="${cover.id}">
                                <div class="mkt-press-badge">${cover.priceBadge || '$5'}</div>
                                <div class="mkt-press-pub">${cover.publicationName || 'Revista'}</div>
                                <strong class="mkt-press-headline">${cover.headline || 'Portada'}</strong>
                                <div class="mkt-press-footer">
                                    <span>${cover.gameName || 'Juego'}</span>
                                    <span>Año ${cover.year}</span>
                                </div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="mkt-tab-header">
                <h3>Prensa y Hemeroteca</h3>
                <p>Archivo de coberturas editoriales, notas de análisis y portadas históricas conseguidas por tu estudio.</p>
            </div>
            ${reviewsMarkup}
            ${galleryMarkup}
        `;

        container.querySelectorAll('[data-cover-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const coverId = btn.dataset.coverId;
                const cover = archive.find(c => c.id === coverId);
                if (cover && typeof window.showMarketingPressCover === 'function') {
                    window.showMarketingPressCover(cover);
                }
            });
        });
    }

    // Segmented tab switching in Marketing app
    phone.querySelectorAll('.phone-seg-tab[data-mkt-tab]').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            phone.querySelectorAll('.phone-seg-tab[data-mkt-tab]').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabBtn.classList.add('active');
            tabBtn.setAttribute('aria-selected', 'true');
            currentMktTab = tabBtn.dataset.mktTab;
            renderMarketingApp();
        });
    });

    // 7. State Refresh Logic (Clock, Era, Studio, Project, Disabled buttons)
    function refreshPhoneState() {
        const currentGame = gameInstance || game;
        if (!currentGame) return;

        const year = currentGame.getHistoricalYear ? currentGame.getHistoricalYear() : (1981 + currentGame.year);
        const era = year < 1990 ? 'retro' : year < 2006 ? 'pda' : year < 2016 ? 'early' : 'modern';
        phone.dataset.era = era;

        // Clock / in-game time
        const clockEl = phone.querySelector('#phone-clock');
        if (clockEl) {
            const monthStr = String(currentGame.month || 1).padStart(2, '0');
            const weekStr = String(currentGame.week || 1);
            clockEl.textContent = `S${weekStr} · M${monthStr}`;
        }

        // Studio Widget Data
        const widgetEra = phone.querySelector('#phone-widget-era');
        if (widgetEra) widgetEra.textContent = `${year}`;

        const widgetStudio = phone.querySelector('#phone-widget-studio-name');
        if (widgetStudio) widgetStudio.textContent = currentGame.companyName || 'Tu Estudio';

        const widgetOffice = phone.querySelector('#phone-widget-office');
        if (widgetOffice && currentGame.getActiveOffice) {
            widgetOffice.textContent = currentGame.getActiveOffice().name || 'Sede';
        }

        const widgetPulse = phone.querySelector('#phone-widget-pulse');
        const widgetProjDesc = phone.querySelector('#phone-widget-project-desc');
        const hasProject = Boolean(currentGame.currentProject);

        if (widgetPulse && widgetProjDesc) {
            if (hasProject) {
                widgetPulse.className = 'widget-pulse-dot pulse-active';
                widgetProjDesc.textContent = `En desarrollo: ${currentGame.currentProject.name || 'Juego'}`;
            } else {
                widgetPulse.className = 'widget-pulse-dot';
                widgetProjDesc.textContent = 'Listo para nuevo proyecto';
            }
        }

        // Synchronize disabled state with underlying DOM targets
        phone.querySelectorAll('.phone-app-item[data-app-id]').forEach(btn => {
            const targetId = btn.dataset.appId;
            if (targetId && targetId !== 'app-guide' && targetId !== 'app-vread' && targetId !== 'app-marketing' && targetId !== 'btn-open-dag') {
                const domTarget = document.getElementById(targetId);
                const isDisabled = !domTarget || domTarget.disabled;
                btn.disabled = isDisabled;
            }
        });

        // Auto-refresh active in-phone views
        if (marketingView && !marketingView.hidden) {
            renderMarketingApp();
        }
    }

    // 8. Open & Close Transitions
    let hideTimer = null;

    function openPhone() {
        clearTimeout(hideTimer);
        refreshPhoneState();
        returnToHome();

        phone.hidden = false;
        phone.inert = false;
        launcher.setAttribute('aria-expanded', 'true');
        launcher.classList.add('launcher--hidden');

        requestAnimationFrame(() => {
            phone.classList.add('is-open');
        });

        const firstDock = phone.querySelector('.phone-dock .phone-app-item:not(:disabled)');
        if (firstDock) firstDock.focus({ preventScroll: true });
    }

    function closePhone(restoreFocus = true) {
        window.setLiveOpsPhoneTarget?.(null);
        phone.classList.remove('is-expanded');
        clearTimeout(hideTimer);
        phone.classList.remove('is-open');
        launcher.setAttribute('aria-expanded', 'false');
        launcher.classList.remove('launcher--hidden');

        if (restoreFocus) launcher.focus({ preventScroll: true });
        phone.inert = true;

        hideTimer = setTimeout(() => {
            phone.hidden = true;
        }, 240);
    }

    // Launcher click toggles open/close
    launcher.addEventListener('click', () => {
        if (launcher.getAttribute('aria-expanded') === 'true') {
            closePhone();
        } else {
            openPhone();
        }
    });

    // Home indicator bar closes or returns home
    phone.querySelector('#phone-home-bar').addEventListener('click', () => {
        if (!guideView.hidden || !vreadView.hidden || !marketingView.hidden || !liveOpsView.hidden || !personnelView.hidden || !architectureView.hidden || !ipView.hidden || !rivalsView.hidden || !officesView.hidden || !workshopView.hidden || !studioView.hidden) {
            returnToHome();
        } else {
            closePhone();
        }
    });

    // Keyboard handlers
    document.addEventListener('keydown', (event) => {
        if (launcher.getAttribute('aria-expanded') !== 'true') return;

        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopImmediatePropagation();
            if (!guideView.hidden || !vreadView.hidden || !marketingView.hidden || !liveOpsView.hidden || !personnelView.hidden || !architectureView.hidden || !ipView.hidden || !rivalsView.hidden || !officesView.hidden || !workshopView.hidden || !studioView.hidden) {
                returnToHome();
            } else {
                closePhone();
            }
        } else if (phone.contains(event.target)) {
            if (event.key !== 'Tab') {
                event.stopPropagation();
            }
        }
    });

    // Close when clicking outside of the smartphone
    document.addEventListener('pointerdown', (event) => {
        if (launcher.getAttribute('aria-expanded') === 'true' &&
            !phone.contains(event.target) &&
            !launcher.contains(event.target)) {
            closePhone(false);
        }
    });

    const phoneAPI = {
        open: openPhone,
        close: closePhone,
        refresh: refreshPhoneState,
        openMarketing: () => {
            openPhone();
            openInternalMarketing();
        },
        openVread: () => {
            openPhone();
            openInternalVread();
        },
        openGuide: () => {
            openPhone();
            openInternalGuide();
        },
        openPersonnel: () => {
            openPhone();
            openInternalPersonnel();
        },
        openArchitecture: () => {
            openPhone();
            window.refreshArchitecturePanel?.();
            openInternalArchitecture();
        },
        isArchitectureOpen: () => !architectureView.hidden,
        openIP: () => {
            openPhone();
            window.refreshIPPanel?.();
            openInternalIP();
        },
        openRivals: () => {
            openPhone();
            openInternalRivals();
        },
        openOffices: () => {
            openPhone();
            openInternalOffices();
        },
        openWorkshop: () => {
            openPhone();
            openInternalWorkshop();
        },
        openStudio: () => {
            attachStudioModal();
            openPhone();
            openInternalStudio();
        },
        detachStudioModal,
        openSales: () => {
            openPhone();
            openInternalSales();
        },
        isSalesOpen: () => Boolean(salesView && !salesView.hidden),
        refreshSales: () => {
            if (salesView && !salesView.hidden) {
                window.renderHistoryAndCharts?.();
            }
        },
        returnHome: returnToHome,
        refreshMarketing: () => {
            if (marketingView && !marketingView.hidden) {
                renderMarketingApp();
            }
        },
        launcher
    };

    window.studioPhoneNav = phoneAPI;
    return phoneAPI;
}
