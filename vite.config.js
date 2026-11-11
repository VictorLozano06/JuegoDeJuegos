import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    plugins: [{
        name: 'dev-empire-online',
        async configureServer(vite) {
            if (vite.config.server.middlewareMode) return;
            const online = await import('./online/server.mjs');
            online.onlineServer.on('error', error => vite.config.logger.error(`No se pudo iniciar el multijugador: ${error.message}`));
            vite.httpServer?.once('close', () => online.onlineServer.close());
            vite.middlewares.use('/__dev_empire_online', (req, res) => {
                const address = req.socket.remoteAddress;
                const host = (req.headers.host || '').replace(/:\d+$/, '');
                if (req.method !== 'GET' || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address) ||
                    !['localhost', '127.0.0.1', '[::1]'].includes(host) ||
                    (req.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(req.headers['sec-fetch-site']))) {
                    res.writeHead(403); res.end(); return;
                }
                res.setHeader('Cache-Control', 'no-store');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ url: online.hostUrl, available: online.onlineServer.listening }));
            });
        }
    }]
});
