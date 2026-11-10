const SWEEP_SECONDS = 1.85;

/** Controls the menu shot and its handoff without changing OrbitControls' orbit limits. */
export class MenuCamera {
    constructor(THREE, camera, controls) {
        this.camera = camera;
        this.controls = controls;
        this.position = new THREE.Vector3();
        this.target = new THREE.Vector3();
        this.parkFlight = new THREE.CatmullRomCurve3([
            new THREE.Vector3(34, 23, 34),
            new THREE.Vector3(25, 13, 9),
            new THREE.Vector3(28, 17, -14),
            new THREE.Vector3(10, 13, -26),
            new THREE.Vector3(-24, 19, -26),
            new THREE.Vector3(-26, 14, -8),
            new THREE.Vector3(-27, 18, 18),
            new THREE.Vector3(-8, 13, 26)
        ], true, 'centripetal');
        this.pointer = new THREE.Vector2();
        this.parallax = new THREE.Vector2();
        this.motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.active = false;
        this.sweep = null;
        window.addEventListener('pointermove', event => {
            if (!this.active || this.sweep || event.pointerType === 'touch') return;
            this.pointer.set(2 * event.clientX / window.innerWidth - 1, 1 - 2 * event.clientY / window.innerHeight);
        }, { passive: true });
        window.addEventListener('blur', () => this.pointer.set(0, 0));
    }

    enter(desk, time, { park = false } = {}) {
        if (this.sweep) {
            this.controls.domElement.style.opacity = this.sweep.originalOpacity;
            this.sweep.resolve();
        }
        this.sweep = null;
        this.active = true;
        this.park = park;
        this.parkStart = time;
        this.controls.enabled = false;
        this.pointer.set(0, 0);
        this.parallax.set(0, 0);
        this.update(0, time, desk);
    }

    play(position, target, revealOffice) {
        if (!this.active) return Promise.resolve();
        if (this.sweep) return this.sweep.promise;
        if (this.motion.matches) {
            revealOffice?.();
            this.finish(position, target);
            return Promise.resolve();
        }
        const sweep = {
            fromPosition: this.camera.position.clone(),
            fromTarget: this.controls.target.clone(),
            position: position.clone(),
            target: target.clone(),
            elapsed: 0,
            revealOffice,
            dissolves: Boolean(revealOffice),
            originalOpacity: this.controls.domElement.style.opacity,
        };
        sweep.promise = new Promise((resolve, reject) => {
            sweep.resolve = resolve;
            sweep.reject = reject;
        });
        this.sweep = sweep;
        return sweep.promise;
    }

    finish(position, target) {
        this.camera.position.copy(position);
        this.controls.target.copy(target);
        this.camera.lookAt(target);
        this.controls.enabled = true;
        this.active = false;
        if (this.sweep) {
            this.controls.domElement.style.opacity = this.sweep.originalOpacity;
            this.sweep.resolve();
        }
        this.sweep = null;
    }

    update(delta, time, desk) {
        const sweep = this.sweep;
        if (sweep) {
            sweep.elapsed += Math.min(delta, 0.08);
            const progress = Math.min(1, sweep.elapsed / SWEEP_SECONDS);
            const ease = progress * progress * (3 - 2 * progress);
            if (sweep.revealOffice && (progress >= 0.75 || this.motion.matches)) {
                const revealOffice = sweep.revealOffice;
                sweep.revealOffice = null;
                try {
                    revealOffice();
                } catch (error) {
                    sweep.reject(error);
                    this.finish(sweep.position, sweep.target);
                    return;
                }
            }
            if (progress === 1 || this.motion.matches) {
                this.finish(sweep.position, sweep.target);
                return;
            }
            this.position.lerpVectors(sweep.fromPosition, sweep.position, ease);
            // Lift and retreat first to clear the seated founder and the second desk.
            const arc = Math.sin(Math.PI * ease);
            this.position.y += arc * 1.15;
            this.position.z += arc * 2.5;
            this.target.lerpVectors(sweep.fromTarget, sweep.target, ease);
            if (sweep.dissolves) {
                const visibility = Math.min(1, Math.abs(progress - 0.75) / 0.17);
                // The brief dissolve masks the era change for a restored studio.
                this.controls.domElement.style.opacity = String(visibility);
            }
        } else if (this.park) {
            const cycleTime = this.motion.matches ? 0 : Math.max(0, time - this.parkStart);
            const progress = (cycleTime % 70) / 70;
            this.parkFlight.getPointAt(progress, this.position);
            this.target.set(0, 2.5, 0);
            if (!this.motion.matches) {
                this.position.y += Math.sin(cycleTime * 0.9) * 0.035;
                this.position.x += Math.sin(cycleTime * 1.4) * 0.025;
            }
        } else {
            const { x = -1.45, y = 0, z = 0.25 } = desk || {};
            const compact = window.innerWidth <= 700;
            const portraitPullback = compact ? Math.min(2.4, Math.max(0, 0.95 - this.camera.aspect) * 3.6) : 0;
            const sway = this.motion.matches ? 0 : Math.sin(time * 0.5) * 0.05;
            this.parallax.lerp(this.pointer, 1 - Math.exp(-3 * delta));
            const pan = this.motion.matches ? 0 : this.parallax.x * 0.055;
            const tilt = this.motion.matches ? 0 : this.parallax.y * 0.035;
            this.position.set(x + 2.65 + portraitPullback, y + 2.04 + tilt, z + 0.50 + sway + pan);
            this.target.set(x, y + (compact ? 1.46 : 1.75), z + (compact ? 0.51 : 0.91));
        }
        this.camera.position.copy(this.position);
        this.controls.target.copy(this.target);
        this.camera.lookAt(this.target);
    }
}
