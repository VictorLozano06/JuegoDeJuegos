export function youtubeVideoId(input) {
    let url;
    try { url = new URL(input.trim()); } catch { return null; }
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    let id = null;
    if (host === 'youtu.be') id = url.pathname.split('/')[1];
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
        const parts = url.pathname.split('/');
        id = url.pathname === '/watch' ? url.searchParams.get('v') : ['embed', 'shorts', 'live'].includes(parts[1]) ? parts[2] : null;
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(id || '') ? id : null;
}
