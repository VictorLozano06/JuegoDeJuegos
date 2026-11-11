import { app, BrowserWindow, net, protocol } from 'electron';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

protocol.registerSchemesAsPrivileged([{ scheme: 'game', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }]);

app.whenReady().then(() => {
    const root = path.join(app.getAppPath(), 'dist');
    protocol.handle('game', (request) => {
        const url = new URL(request.url);
        const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
        const file = path.resolve(root, relative);
        if (url.hostname !== 'local' || !file.startsWith(root + path.sep)) return new Response('Not found', { status: 404 });
        return net.fetch(pathToFileURL(file).toString());
    });
    const window = new BrowserWindow({ width: 1440, height: 900, minWidth: 800, minHeight: 600, title: 'Dev Empire 3D', webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true } });
    window.setMenuBarVisibility(false);
    window.loadURL('game://local/index.html');
});
app.on('window-all-closed', () => app.quit());
