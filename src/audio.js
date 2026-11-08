/**
 * Dev Empire 3D - Procedural Web Audio Engine & Sound Synthesizer
 * High-fidelity dynamic chiptune/lofi sound effects and ambient soundtrack
 * No external audio files needed - 100% synthesized in Web Audio API
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.soundVolume = 0.6;
        this.musicVolume = 0.3;
        this.isMuted = false;
        this.musicPlaying = false;
        this.musicTimer = null;
        this.bpm = 96;
        this.step = 0;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(this.soundVolume, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);

            this.initialized = true;
            this.startAmbientMusic();
        } catch (e) {
            console.warn("Web Audio initialization error:", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (!this.initialized) {
            this.init();
        }
    }

    toggleMute() {
        if (!this.initialized) this.init();
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    setVolumes(soundVolume, musicVolume) {
        this.soundVolume = soundVolume;
        this.musicVolume = musicVolume;
        if (!this.initialized) return;
        const time = this.ctx.currentTime;
        this.sfxGain.gain.setTargetAtTime(this.soundVolume, time, 0.03);
        this.musicGain.gain.setTargetAtTime(this.musicVolume, time, 0.03);
    }

    // --- SOUND EFFECTS ---

    playClick() {
        if (this.isMuted || !this.initialized) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    playBubble(type) {
        if (this.isMuted || !this.initialized) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        let baseFreq = 520;
        let endFreq = 980;
        let wave = 'sine';

        if (type === 'tech') {
            baseFreq = 440;
            endFreq = 880;
            wave = 'triangle';
        } else if (type === 'design') {
            baseFreq = 587.33; // D5
            endFreq = 1174.66; // D6
            wave = 'sine';
        } else if (type === 'bug') {
            baseFreq = 300;
            endFreq = 160;
            wave = 'sawtooth';
        } else if (type === 'research') {
            baseFreq = 783.99; // G5
            endFreq = 1567.98; // G6
            wave = 'sine';
        }

        osc.type = wave;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

        const volume = (type === 'bug') ? 0.15 : 0.22;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    playCash() {
        if (this.isMuted || !this.initialized) return;
        const now = this.ctx.currentTime;

        // Two bright metallic bell harmonics + snap
        const freqs = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.035);

            gain.gain.setValueAtTime(0.25, now + idx * 0.035);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.35);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + idx * 0.035);
            osc.stop(now + idx * 0.035 + 0.36);
        });
    }

    playFanfare(score) {
        if (this.isMuted || !this.initialized) return;
        const now = this.ctx.currentTime;

        if (score >= 8.0) {
            // Triumphant major arpeggio
            const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.09);

                gain.gain.setValueAtTime(0.3, now + i * 0.09);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + (i === notes.length - 1 ? 0.8 : 0.25));

                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now + i * 0.09);
                osc.stop(now + i * 0.09 + (i === notes.length - 1 ? 0.85 : 0.26));
            });
        } else if (score >= 6.0) {
            // Mild positive chime
            const notes = [440, 554.37, 659.25, 880];
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.08);

                gain.gain.setValueAtTime(0.25, now + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now + i * 0.08);
                osc.stop(now + i * 0.08 + 0.32);
            });
        } else {
            // Sad trombone / dissonant drop
            const notes = [370, 349.23, 329.63, 277.18];
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now + i * 0.16);

                gain.gain.setValueAtTime(0.18, now + i * 0.16);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.28);

                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now + i * 0.16);
                osc.stop(now + i * 0.16 + 0.3);
            });
        }
    }

    playKeyboardTap() {
        if (this.isMuted || !this.initialized) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const freq = 1800 + Math.random() * 600;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.015);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.02);
    }

    playCoffeeSound() {
        if (this.isMuted || !this.initialized) return;
        const now = this.ctx.currentTime;
        
        // Filtered white noise puff / steam
        const bufferSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, now);
        filter.Q.setValueAtTime(3.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
    }

    playLevelUp() {
        if (this.isMuted || !this.initialized) return;
        const now = this.ctx.currentTime;
        const scale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5];
        scale.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);

            gain.gain.setValueAtTime(0.2, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.28);
        });
    }

    // --- PROCEDURAL AMBIENT SOUNDTRACK ---
    // A lush, cozy, lo-fi tech groove (chords + subtle bass + warm tone)
    startAmbientMusic() {
        if (this.musicPlaying) return;
        this.musicPlaying = true;

        // Chord progression: Dm9 -> G13 -> Cmaj9 -> Am9
        const chords = [
            [146.83, 220.00, 261.63, 329.63, 392.00], // D3, A3, C4, E4, G4 (Dm9)
            [196.00, 246.94, 293.66, 329.63, 440.00], // G3, B3, D4, E4, A4 (G13)
            [130.81, 196.00, 246.94, 293.66, 329.63], // C3, G3, B3, D4, E4 (Cmaj9)
            [110.00, 164.81, 220.00, 261.63, 329.63]  // A2, E3, A3, C4, E4 (Am9)
        ];

        let chordIndex = 0;
        const stepInterval = (60 / this.bpm) * 1000 * 2; // Every 2 beats

        const playChordStep = () => {
            if (!this.musicPlaying || this.isMuted || !this.ctx) {
                this.musicTimer = setTimeout(playChordStep, stepInterval);
                return;
            }

            const now = this.ctx.currentTime;
            const currentChord = chords[chordIndex];
            chordIndex = (chordIndex + 1) % chords.length;

            // Warm lowpass filter for chill lofi tone
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(950, now);
            filter.frequency.exponentialRampToValueAtTime(650, now + 1.8);
            filter.connect(this.musicGain);

            currentChord.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = idx === 0 ? 'triangle' : 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.02);

                const noteVol = (idx === 0) ? 0.28 : 0.12;
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(noteVol, now + 0.12 + idx * 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

                osc.connect(gain);
                gain.connect(filter);

                osc.start(now);
                osc.stop(now + 2.0);
            });

            this.musicTimer = setTimeout(playChordStep, stepInterval);
        };

        playChordStep();
    }

    playNodeToggle(active) {
        if (this.isMuted || !this.initialized) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        if (active) {
            osc.frequency.setValueAtTime(580, now);
            osc.frequency.exponentialRampToValueAtTime(1160, now + 0.08);
        } else {
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
        }

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    playRefactor() {
        if (this.isMuted || !this.initialized) return;
        const now = this.ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);

            gain.gain.setValueAtTime(0.001, now + i * 0.05);
            gain.gain.linearRampToValueAtTime(0.18, now + i * 0.05 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.45);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.5);
        });
    }

    playDebtAlert() {
        if (this.isMuted || !this.initialized) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(196, now + 0.08);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.26);
    }

    stopAmbientMusic() {
        this.musicPlaying = false;
        if (this.musicTimer) {
            clearTimeout(this.musicTimer);
            this.musicTimer = null;
        }
    }
}

// Global sound manager instance
export const soundEngine = new SoundEngine();

