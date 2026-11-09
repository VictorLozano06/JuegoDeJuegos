/**
 * DEV EMPIRE 3D - Pantalla de Carga 2D
 * Simulación visual del camión de reparto de videojuegos en carretera
 * y su llegada al almacén de videojuegos para la pre-carga total de modelos y texturas 3D.
 * 
 * Cumplimiento de normas del proyecto:
 * - Prohibición estricta de emojis del sistema (agentes/iconografia.md)
 * - Identidad visual coherente, estados y jerarquía clara (agentes/menus.md)
 * - Sin cuadros nativos de JavaScript (agentes/dialogos.md)
 */

const TRUCK_SVG_ICON = `
<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
</svg>`;

const WAREHOUSE_SVG_ICON = `
<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 21V8l9-5 9 5v13H3z"/>
    <path d="M9 21v-7h6v7"/>
    <line x1="9" y1="17" x2="15" y2="17"/>
</svg>`;

const CHECK_SVG_ICON = `
<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
</svg>`;

export const preloadedModels = new Map();

export const ASSET_CATALOG = {
    models: [
        '/models/retro-monitor.glb',
        '/models/retro-keyboard.glb',
        '/models/retro-mouse.glb',
        '/models/silla.glb?v=3',
        '/models/silla.glb',
        '/models/mando-nes.glb',
        '/models/primibot.glb?v=2',
        '/models/primibot.glb',
        '/models/modern-office/planta.glb',
        '/models/modern-office/microondas.glb',
        '/models/modern-office/monitor.glb',
        '/models/modern-office/raton-nuevo.glb',
        '/models/modern-office/taza.glb',
        '/models/modern-office/teclado-nuevo.glb'
    ],
    wallpapers: [
        '/wallpapers/wp_synthwave.jpg',
        '/wallpapers/wp_silicon.jpg',
        '/wallpapers/wp_nebula.jpg',
        '/wallpapers/wp_cybercity.jpg',
        '/wallpapers/wp_quantum.jpg'
    ],
    avatars: [
        '/avatars/avatar_1.jpg',
        '/avatars/avatar_2.jpg',
        '/avatars/avatar_3.jpg',
        '/avatars/avatar_4.jpg',
        '/avatars/avatar_5.jpg',
        '/avatars/avatar_6.jpg',
        '/avatars/avatar_7.jpg',
        '/avatars/avatar_8.jpg'
    ]
};

export class LoadingScreen {
    constructor() {
        this.root = document.getElementById('game-loading-screen');
        this.canvas = document.getElementById('loading-canvas');
        this.ctx = this.canvas?.getContext('2d');
        this.targetProgress = 0;
        this.currentProgress = 0;
        this.elapsed = 0;
        this.arrival = 0;
        this.isDone = false;
        this.isDocked = false;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.completionPromise = new Promise(resolve => this.resolveCompletion = resolve);
        this.onResize = () => this.resize();
        this.onKeyDown = e => {
            if (['Space', 'Enter'].includes(e.code) && this.isDocked) {
                e.preventDefault(); this.triggerEnter();
            }
        };
        this.onEnter = () => this.triggerEnter();
        document.getElementById('loading-enter-btn')?.addEventListener('click', this.onEnter);
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('resize', this.onResize);
        this.resize();
    }
    resize() {
        this.w = window.innerWidth; this.h = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr;
        this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    start() {
        this.root.classList.remove('fade-out'); this.root.style.display = 'flex';
        document.getElementById('loading-completion-row').hidden = true;
        this.lastTime = performance.now();
        this.loop();
    }
    setProgress(ratio) { this.targetProgress = Math.max(this.targetProgress, Math.min(.99, ratio)); }
    setComplete() { this.isDone = true; this.targetProgress = 1; }
    setError() {
        this.failed = true;
        this.root.classList.add('load-failed');
        document.getElementById('loading-status-text').textContent = 'No se ha podido completar la entrega. Recarga para reintentarlo.';
        document.getElementById('loading-dock-status').textContent = 'ENTREGA EN PAUSA';
    }
    waitForCompletion() { return this.completionPromise; }
    triggerEnter() {
        if (!this.isDocked) return;
        this.resolveCompletion?.(); this.resolveCompletion = null;
    }
    hide() {
        this.root.classList.add('fade-out');
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('resize', this.onResize);
        document.getElementById('loading-enter-btn')?.removeEventListener('click', this.onEnter);
        setTimeout(() => { cancelAnimationFrame(this.animFrameId); this.root.style.display = 'none'; }, 700);
    }
    loop() {
        const now = performance.now(), dt = Math.min((now - this.lastTime) / 1000, .05);
        this.lastTime = now; this.elapsed += dt;
        this.update(dt); this.render();
        this.animFrameId = requestAnimationFrame(() => this.loop());
    }
    update(dt) {
        this.currentProgress += (this.targetProgress - this.currentProgress) * Math.min(1, dt * 3);
        if (this.isDone && this.currentProgress > .985) this.arrival = Math.min(1, this.arrival + dt / 2.2);
        if (this.arrival === 1 && !this.isDocked) {
            this.isDocked = true;
            document.getElementById('loading-completion-row').hidden = true;
            document.getElementById('loading-dock-status').textContent = 'ENTREGA COMPLETADA';
            document.getElementById('loading-dock-badge').classList.add('docked');
            this.triggerEnter();
        }
        const pct = this.isDocked ? 100 : Math.min(99, Math.floor(this.currentProgress * 100));
        document.getElementById('loading-percent-text').textContent = `${pct}%`;
        document.getElementById('loading-progress-fill').style.width = `${pct}%`;
        document.getElementById('loading-progress-bar').setAttribute('aria-valuenow', pct);
        if (!this.failed) document.getElementById('loading-status-text').textContent = this.isDocked ? 'Todo listo. Tu próxima gran historia empieza aquí.' : this.isDone ? 'Aparcando en el muelle de entrega…' : pct < 65 ? 'Preparando los juegos para el viaje…' : 'Últimos preparativos para abrir el estudio…';
    }
    render() {
        const c = this.ctx; if (!c) return;
        const w = this.w, h = this.h;
        c.clearRect(0, 0, w, h);
        const sky = c.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#263b47'); sky.addColorStop(.46, '#bc8072'); sky.addColorStop(.75, '#e5b283'); sky.addColorStop(1, '#182d31');
        c.fillStyle = sky; c.fillRect(0, 0, w, h);
        // Fixed art direction coordinates keep the vehicle and destination coherent on every screen.
        const scale = Math.min(w / 1440, h / 820);
        c.save(); c.translate((w - 1440 * scale) / 2, h * .67 - 550 * scale); c.scale(scale, scale);
        const rect = (x,y,w,h,color) => { c.fillStyle=color; c.fillRect(x,y,w,h); };
        const circle = (x,y,r,color) => { c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill(); };
        const poly = (pts,color) => {c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
        const label = (text,x,y,size,color,weight=600) => {c.fillStyle=color;c.font=`${weight} ${size}px Arial`;c.fillText(text,x,y);};
        circle(1040, 245, 76, '#f4c89b');
        for(let i=0;i<5;i++) {
            c.globalAlpha=.12;
            rect(100+i*310,190+(i%3)*38,180,3,'#fff1d4');
        } c.globalAlpha=1;
        const move = this.reducedMotion ? 0 : this.elapsed * 35 * (1-this.arrival);
        for(let layer=0;layer<3;layer++) {
            const y=370+layer*65;
            for(let i=-2;i<13;i++) {
                const x=i*170-(move*(layer+1)*.15)%170;
                poly([[x-30,550],[x,y+30],[x+65,y-45],[x+145,y+25],[x+200,550]], ['#8f7976','#696b68','#44575a'][layer]);
            }
        }
        for(let i=-1;i<19;i++) {
            const x=i*95-move*.6%95, top=435-Math.abs(Math.sin(i*4))*60;
            rect(x,top,65,550-top,'#344c50');
            for(let j=0;j<3;j++) rect(x+12+j*16,top+17,5,10,'#a39b7b');
        }
        rect(-1500,550,4500,250,'#243d40');
        rect(-1500,550,4500,7,'#c4b697');
        rect(-1500,557,4500,12,'#435353');
        for(let i=-2;i<17;i++) rect(i*125-move*3%125,627,62,3,'#8c9789');
        // Destination rolls into the scene only as the real loading work finishes.
        const approach = Math.max(0, Math.min(1,(this.currentProgress-.65)/.35));
        const wx = 1500 - 555 * (1-Math.pow(1-approach,3));
        c.save();c.translate(wx,0);
        rect(0,330,430,220,'#41575a');
        poly([[-15,330],[200,274],[446,330]],'#253e43');
        rect(18,342,394,8,'#9c9c84');
        for(let y=370;y<550;y+=14) rect(12,y,406,1,'#53676a');
        rect(41,386,218,164,'#192f32');
        const glow=c.createLinearGradient(0,380,0,550);glow.addColorStop(0,'#e5b36b');glow.addColorStop(1,'#927355');
        rect(49,393,202,157,glow);
        for(let i=0;i<4;i++){rect(65+i*38,507-(i%2)*23,34,43+(i%2)*23,'#b78c5a');rect(80+i*38,507-(i%2)*23,5,43+(i%2)*23,'#d3b482');}
        rect(285,400,103,63,'#263e42');rect(292,407,89,49,'#829c96');rect(333,407,4,49,'#324a4c');
        label('DEV EMPIRE',44,365,23,'#f6e6c6',800);label('DISTRIBUTION HOUSE',46,382,10,'#bdc8b7');
        label('01',292,494,30,'#bdc8b7');
        rect(27,542,245,8,'#c5b384');
        for(let i=0;i<12;i++) poly([[30+i*20,542],[40+i*20,542],[34+i*20,550],[24+i*20,550]],'#304447');
        circle(272,405,4,this.isDocked?'#b4e3ac':'#efc683');
        c.restore();
        // Purpose-built delivery truck: cream cargo box, petrol cab and painted branding.
        const ease = this.arrival*this.arrival*(3-2*this.arrival);
        const tx = 330+ease*520;
        c.save(); c.translate(tx,599+(this.reducedMotion||this.isDocked?0:Math.sin(this.elapsed*14)*.65));
        c.fillStyle='#14292d66';c.beginPath();c.ellipse(170,8,216,13,0,0,Math.PI*2);c.fill();
        rect(-16,-157,246,127,'#d9d4b9');rect(-16,-157,246,8,'#efe6ca');rect(-16,-33,246,7,'#8b9c96');
        for(let i=0;i<21;i++) rect(-9+i*11,-145,1,100,'#b7bda955');
        rect(-16,-76,246,35,'#2b6868');rect(-16,-46,246,5,'#deac6a');
        label('DEV',10,-108,30,'#2d5356',900);label('EMPIRE',10,-80,30,'#2d5356',900);
        label('GAMES ON THE MOVE',11,-54,10,'#f2e4c7',700);
        // A cartridge emblem is drawn specifically for this game.
        rect(164,-133,44,46,'#2d5356');rect(171,-126,30,23,'#d4d5b9');rect(176,-98,20,11,'#d5ab6b');
        rect(226,-25,115,10,'#1c3035');
        poly([[238,-118],[291,-118],[330,-71],[338,-34],[236,-34]],'#48817e');
        poly([[245,-108],[286,-108],[312,-76],[245,-76]],'#233e48');
        poly([[251,-104],[283,-104],[293,-92],[251,-92]],'#719694');
        rect(243,-66,42,27,'#3b7272');rect(251,-62,13,3,'#cfcead');rect(329,-61,8,17,'#e3bd80');
        rect(319,-37,24,9,'#bec3b2');rect(234,-126,49,8,'#659592');
        rect(224,-106,5,32,'#263d42');rect(-20,-48,5,12,'#d78065');
        for(const x of [28,65,296]) {
            circle(x,-15,22,'#182b30');circle(x,-15,15,'#506569');circle(x,-15,10,'#b7bdad');circle(x,-15,4,'#344d50');
            c.save();c.translate(x,-15);c.rotate(this.reducedMotion?0:this.elapsed*9*(1-ease));
            for(let i=0;i<5;i++){c.rotate(Math.PI*2/5);rect(6,-1,4,2,'#4b6363');}c.restore();
        }
        c.restore();
        // Foreground verge supplies depth without competing with the loading interface.
        rect(-1500,688,4500,4000,'#152d32');rect(-1500,688,4500,3,'#48605e');
        c.restore();
        const vignette=c.createLinearGradient(0,0,0,h);
        vignette.addColorStop(0,'#102329aa');vignette.addColorStop(.27,'#10232900');vignette.addColorStop(.72,'#10232900');vignette.addColorStop(1,'#0c2029');
        c.fillStyle=vignette;c.fillRect(0,0,w,h);
    }
}

export class AssetPreloader {
    constructor(options = {}) {
        this.onProgress = options.onProgress || (() => {});
        this.models = ASSET_CATALOG.models;
        this.wallpapers = ASSET_CATALOG.wallpapers;
        this.avatars = ASSET_CATALOG.avatars;
    }

    async loadAll(worldInstance) {
        // Habilitar caché de Three.js para evitar descargas duplicadas
        if (typeof window !== 'undefined' && window.THREE) {
            window.THREE.Cache.enabled = true;
        }

        const totalItems = this.models.length + this.wallpapers.length + this.avatars.length + 3; // +3 por texturas procedurales y warmup
        let completed = 0;

        const update = (label) => {
            completed++;
            const ratio = completed / totalItems;
            this.onProgress(ratio, label);
        };

        this.onProgress(0.02, 'Conectando con el almacén central de videojuegos...');

        // 1. Pre-cargar modelos 3D GLTF
        const loader = (typeof window !== 'undefined' && window.THREE?.GLTFLoader)
            ? new window.THREE.GLTFLoader()
            : null;

        for (const modelUrl of this.models) {
            const fileName = modelUrl.split('/').pop().replace(/\?.*$/, '');
            try {
                if (loader) {
                    await new Promise((resolve, reject) => {
                        loader.load(
                            modelUrl,
                            (gltf) => { preloadedModels.set(modelUrl, gltf.scene); resolve(); },
                            undefined,
                            (err) => {
                                console.warn(`Aviso de pre-carga en modelo ${modelUrl}:`, err);
                                reject(err);
                            }
                        );
                    });
                } else {
                    // Fallback con fetch para caché HTTP
                    if (typeof window !== 'undefined') throw new Error('GLTFLoader no disponible');
                }
            } catch (e) {
                throw new Error(`No se pudo cargar ${modelUrl}`, { cause: e });
            }
            update(`Descargando modelo 3D: ${fileName}`);
        }

        // 2. Pre-cargar texturas e imágenes de fondos
        for (const wpUrl of this.wallpapers) {
            const fileName = wpUrl.split('/').pop();
            await this.preloadImage(wpUrl);
            update(`Cargando textura de fondo: ${fileName}`);
        }

        // 3. Pre-cargar avatares
        for (const avUrl of this.avatars) {
            const fileName = avUrl.split('/').pop();
            await this.preloadImage(avUrl);
            update(`Cargando textura de avatar: ${fileName}`);
        }

        // 4. Pre-generar texturas procedurales del garaje y oficina
        if (worldInstance && typeof worldInstance.createWhiteboardTexture === 'function') {
            try {
                worldInstance.createWhiteboardTexture();
                worldInstance.createArcadePosterTexture();
            } catch (e) {
                console.warn('Error leve en texturas procedurales:', e);
            }
        }
        update('Verificando texturas dinámicas y pizarras del estudio...');

        // 5. Compilación y calentamiento de shaders WebGL en GPU
        if (worldInstance && worldInstance.renderer && worldInstance.scene && worldInstance.camera) {
            try {
                if (worldInstance.renderer.compileAsync) await worldInstance.renderer.compileAsync(worldInstance.scene, worldInstance.camera);
                else worldInstance.renderer.compile(worldInstance.scene, worldInstance.camera);
                worldInstance.renderer.render(worldInstance.scene, worldInstance.camera);
            } catch (e) {
                throw e;
            }
        }
        update('Compilando shaders y subiendo texturas a la GPU...');

        // 6. Llegada final al almacén
        update('¡Camión de reparto llegando al muelle del almacén!');
    }

    preloadImage(url) {
        return new Promise((resolve) => {
            if (typeof Image === 'undefined') return resolve();
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Resiliente ante errores
            img.src = url;
        });
    }
}

