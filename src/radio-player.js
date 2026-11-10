import { soundEngine } from './audio.js';
import { youtubeVideoId } from './youtube-url.js';
import './radio-player.css';

let panel = null;
let restoreAmbient = false;
let player = null;
let requestId = 0;
let youtubeApiPromise = null;

function loadYouTubeApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (youtubeApiPromise) return youtubeApiPromise;
    youtubeApiPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const previousReady = window.onYouTubeIframeAPIReady;
        const timer = setTimeout(() => { script.remove(); reject(new Error('Tiempo de espera agotado')); }, 15000);
        window.onYouTubeIframeAPIReady = () => {
            clearTimeout(timer);
            previousReady?.();
            resolve(window.YT);
        };
        script.src = 'https://www.youtube.com/iframe_api';
        script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('No se pudo cargar YouTube')); };
        document.head.appendChild(script);
    }).catch(error => { youtubeApiPromise = null; throw error; });
    return youtubeApiPromise;
}

function stopRadioPlayback() {
    requestId++;
    player?.destroy();
    player = null;
    if (restoreAmbient && soundEngine.initialized) soundEngine.startAmbientMusic();
    restoreAmbient = false;
}

export function closeStudioRadio() {
    if (!panel) return;
    stopRadioPlayback();
    panel.remove();
    panel = null;
}

export function openStudioRadio() {
    if (panel) { panel.querySelector('input')?.focus(); return; }
    panel = document.createElement('section');
    panel.className = 'studio-radio-panel';
    panel.setAttribute('aria-label', 'Radio del estudio');
    panel.innerHTML = `<header><div><span>SONIDO DEL ESTUDIO</span><h2>La radio</h2></div><button type="button" data-radio-close aria-label="Cerrar radio y detener música"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header><form novalidate><label for="studio-radio-url">Enlace de YouTube</label><div class="studio-radio-input"><input id="studio-radio-url" type="url" placeholder="https://www.youtube.com/watch?v=…" autocomplete="off" required><button type="submit">Reproducir</button></div><p class="studio-radio-error" role="alert"></p></form><div class="studio-radio-video" hidden></div><p class="studio-radio-hint">Pega el enlace de un vídeo. Usa el reproductor para controlar el volumen y la pausa.</p>`;
    const root = panel;
    const input = panel.querySelector('input');
    const error = panel.querySelector('.studio-radio-error');
    const video = panel.querySelector('.studio-radio-video');
    panel.querySelector('[data-radio-close]').addEventListener('click', closeStudioRadio);
    panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); closeStudioRadio(); } });
    panel.querySelector('form').addEventListener('submit', async event => {
        event.preventDefault();
        const id = youtubeVideoId(input.value);
        if (!id) { error.textContent = 'Introduce una URL válida de un vídeo de YouTube.'; input.focus(); return; }
        error.textContent = '';
        stopRadioPlayback();
        const currentRequest = requestId;
        video.hidden = false;
        video.replaceChildren(document.createElement('div'));
        const hint = root.querySelector('.studio-radio-hint');
        hint.textContent = 'Preparando la reproducción de YouTube…';
        try {
            const YT = await loadYouTubeApi();
            if (currentRequest !== requestId || panel !== root) return;
            player = new YT.Player(video.firstElementChild, {
                videoId: id,
                playerVars: { autoplay: 1, playsinline: 1, origin: window.location.origin },
                events: {
                    onReady: event => { event.target.getIframe().title = 'Reproductor de YouTube'; },
                    onStateChange: event => {
                        if (currentRequest !== requestId) return;
                        if (event.data === YT.PlayerState.PLAYING) {
                            if (soundEngine.musicPlaying) {
                                restoreAmbient = true;
                                soundEngine.stopAmbientMusic();
                            }
                            hint.textContent = 'Al terminar, volverá la música del estudio.';
                        } else if (event.data === YT.PlayerState.ENDED) {
                            stopRadioPlayback();
                            video.hidden = true;
                            video.replaceChildren();
                            hint.textContent = 'La canción ha terminado. Ha vuelto la música del estudio.';
                        }
                    },
                    onError: () => {
                        if (currentRequest !== requestId) return;
                        stopRadioPlayback();
                        video.hidden = true;
                        video.replaceChildren();
                        error.textContent = 'No se puede reproducir este vídeo aquí. Prueba con otro enlace.';
                        hint.textContent = 'La música del estudio seguirá sonando.';
                    },
                    onAutoplayBlocked: () => { hint.textContent = 'Pulsa reproducir en el reproductor para iniciar la canción.'; }
                }
            });
        } catch {
            if (currentRequest !== requestId) return;
            video.hidden = true;
            video.replaceChildren();
            error.textContent = 'No se ha podido cargar YouTube. Comprueba tu conexión y vuelve a intentarlo.';
        }
    });
    document.body.appendChild(panel);
    input.focus();
}
