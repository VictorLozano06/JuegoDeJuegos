const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_SIDE = 256;
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export function isCompanyLogoImage(value) {
    return typeof value === 'string' && /^data:image\/(?:png|jpeg|webp);base64,/i.test(value);
}

/** Replace the contents using DOM APIs so saved logos are never interpreted as HTML. */
export function renderCompanyLogo(target, value, alt = 'Logo del estudio') {
    if (isCompanyLogoImage(value)) {
        const image = document.createElement('img');
        image.src = value;
        image.alt = alt;
        image.className = 'company-logo-image';
        target.replaceChildren(image);
    } else {
        target.textContent = typeof value === 'string' ? value : '';
    }
}

/** Keep all explicitly marked studio avatars in sync without touching other users. */
export function syncStudioAvatars(root, companyLogo) {
    const logo = companyLogo || '[[DE_ICON_001]]';
    root.querySelectorAll('[data-studio-avatar]').forEach(avatar => {
        if (avatar._studioLogo === logo) return;
        avatar._studioLogo = logo;
        renderCompanyLogo(avatar, logo);
    });
}

/** Decode and downsize before storing a compact image in the normal save data. */
export async function prepareCompanyLogo(file) {
    if (!IMAGE_TYPES.has(file?.type)) throw new Error('Elige una imagen PNG, JPG o WebP.');
    if (file.size > MAX_FILE_BYTES) throw new Error('La imagen debe ocupar como máximo 5 MB.');
    const url = URL.createObjectURL(file);
    try {
        const image = new Image();
        image.src = url;
        await image.decode();
        if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth > 16384 || image.naturalHeight > 16384) {
            throw new Error('Las dimensiones de la imagen no son válidas.');
        }
        const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) throw new Error('No se pudo procesar la imagen.');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/webp', 0.85);
    } catch (error) {
        if (error.message === 'Las dimensiones de la imagen no son válidas.' || error.message === 'No se pudo procesar la imagen.') throw error;
        throw new Error('No se pudo leer la imagen. Prueba con otro archivo.');
    } finally {
        URL.revokeObjectURL(url);
    }
}
