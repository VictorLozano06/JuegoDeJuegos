/** Office display for the player's annual industry awards. Three is injected so
 * the same manager works with the version used by the scene. */
export class TrophyManager {
    constructor(THREE, parent) {
        this.THREE = THREE;
        this.parent = parent;
        this.group = null;
        this.signature = null;
    }

    // The office builder disposes its own scene before calling reset.
    reset() { this.group = null; this.signature = null; }

    clear() {
        if (!this.group) return;
        const resources = new Set();
        this.group.traverse(node => {
            if (node.geometry) resources.add(node.geometry);
            for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
                if (material) resources.add(material);
            }
        });
        this.parent.remove(this.group);
        resources.forEach(resource => resource.dispose());
        this.group = null;
    }

    sync(awards = [], tier = 1, location = null) {
        const list = Array.isArray(awards) ? awards : [];
        const signature = JSON.stringify([tier, location, list]);
        if (signature === this.signature) return;
        this.clear();
        this.signature = signature;
        if (!list.length) return;

        const T = this.THREE;
        const group = new T.Group();
        group.name = 'Premios de la industria';
        this.group = group;
        this.parent.add(group);
        const gold = new T.MeshStandardMaterial({ color: 0xd9a62b, metalness: 0.9, roughness: 0.2 });
        const base = new T.MeshStandardMaterial({ color: 0x252024, metalness: 0.4, roughness: 0.42 });
        const addBox = (name, material, size, position) => {
            const mesh = new T.Mesh(new T.BoxGeometry(...size), material);
            mesh.name = name;
            mesh.position.set(...position);
            group.add(mesh);
            return mesh;
        };
        const garage = tier === 1;
        if (garage) {
            // Free end of the sideboard beside the coffee station.
            group.position.set(3.34, 1.12, -2.70);
        } else {
            // A lit glass-fronted cabinet against a side wall, away from desks.
            const position = tier === 2 ? [5.35, 0, -4.7]
                : tier === 3 || location === 'studio' ? [8.25, 0, -8.25]
                : location === 'grounds' ? [5.5, 0, 4] : [4.95, 0, -3.65];
            group.position.set(...position);
            const cabinet = new T.MeshStandardMaterial({ color: 0x242e34, metalness: 0.45, roughness: 0.45 });
            const glass = new T.MeshStandardMaterial({ color: 0xbfd9e1, transparent: true, opacity: 0.15, roughness: 0.2, depthWrite: false });
            const glow = new T.MeshBasicMaterial({ color: 0xffd778 });
            addBox('Base de vitrina', cabinet, [1.1, 0.62, 0.48], [0, 0.31, 0]);
            addBox('Fondo de vitrina', cabinet, [1.1, 1.45, 0.06], [0, 1.34, -0.21]);
            addBox('Cristal de vitrina', glass, [1.1, 1.45, 0.025], [0, 1.34, 0.24]);
            addBox('Luz de vitrina', glow, [1.0, 0.035, 0.08], [0, 2.04, 0.05]);
            const light = new T.PointLight(0xffd778, 0.8, 3);
            light.position.set(0, 1.95, 0.12);
            group.add(light);
        }

        // Scale the collection to the available shelf space as it grows.
        const columns = garage ? 3 : 5;
        const rows = Math.ceil(list.length / columns);
        const scale = garage ? Math.min(0.34, 0.58 / Math.max(1, rows)) : Math.min(0.58, 1.3 / Math.max(1, rows));
        const spacing = garage ? 0.12 : 0.2;
        list.forEach((award, index) => {
            const trophy = new T.Group();
            trophy.name = `Trofeo · ${award.categoryName || award.categoryId || 'Premio'} · ${award.year || ''}`;
            trophy.userData.award = { ...award };
            trophy.scale.setScalar(scale);
            const column = index % columns;
            const row = Math.floor(index / columns);
            trophy.position.set((column - (columns - 1) / 2) * spacing, (garage ? 0 : 0.64) + row * scale * 0.85, 0);
            const part = (geometry, material, x, y, z) => {
                const mesh = new T.Mesh(geometry, material);
                mesh.position.set(x, y, z);
                mesh.castShadow = true;
                trophy.add(mesh);
                return mesh;
            };
            part(new T.BoxGeometry(0.3, 0.12, 0.23), base, 0, 0.06, 0);
            part(new T.CylinderGeometry(0.055, 0.105, 0.34, 10), gold, 0, 0.29, 0);
            part(new T.ConeGeometry(0.15, 0.25, 5), gold, 0, 0.58, 0);
            const wingL = part(new T.ConeGeometry(0.07, 0.28, 5), gold, -0.13, 0.56, 0);
            const wingR = part(new T.ConeGeometry(0.07, 0.28, 5), gold, 0.13, 0.56, 0);
            wingL.rotation.z = 0.5;
            wingR.rotation.z = -0.5;
            group.add(trophy);
        });
    }
}
