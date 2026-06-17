const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { join } = require('path');

const internalHosts = new Set([
  'docs.qq.com',
  'www.taptap.cn',
  'taptap.cn'
]);
let desktopIpcRegistered = false;

const isInternalUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol)
      && internalHosts.has(parsedUrl.hostname);
  } catch (error) {
    return false;
  }
};

const createInternalWindow = (url, title) => {
  const window = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 860,
    minHeight: 560,
    backgroundColor: '#08080d',
    title: title || '诸神终应知晓',
    icon: join(__dirname, '..', 'manual-build', 'assets', 'logo', 'logo.png'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  window.webContents.setWindowOpenHandler(({ url: nextUrl }) => {
    if (isInternalUrl(nextUrl)) {
      window.loadURL(nextUrl);
      return { action: 'deny' };
    }
    shell.openExternal(nextUrl);
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, nextUrl) => {
    if (isInternalUrl(nextUrl)) {
      return;
    }
    event.preventDefault();
    shell.openExternal(nextUrl);
  });

  window.loadURL(url);
};

const registerDesktopIpc = () => {
  if (desktopIpcRegistered) {
    return;
  }
  desktopIpcRegistered = true;

  ipcMain.handle('desktop:toggle-fullscreen', (event) => {
    const senderWindow = BrowserWindow.fromWebContents(event.sender);
    if (!senderWindow) {
      return false;
    }
    senderWindow.setFullScreen(!senderWindow.isFullScreen());
    return senderWindow.isFullScreen();
  });

  ipcMain.handle('desktop:get-startup-enabled', () => {
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle('desktop:set-startup-enabled', (event, payload) => {
    const enabled = !!(payload && payload.enabled);
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: process.execPath
    });
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle('desktop:open-internal', (event, payload) => {
    if (!payload || !isInternalUrl(payload.url)) {
      return false;
    }
    createInternalWindow(payload.url, payload.title || '诸神终应知晓');
    return true;
  });
};

const createMainWindow = () => {
  const window = new BrowserWindow({
    width: 1280,
    height: 780,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#08080d',
    title: '诸神终应知晓',
    icon: join(__dirname, '..', 'manual-build', 'assets', 'logo', 'logo.png'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
      sandbox: true,
      webSecurity: true
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternalUrl(url)) {
      createInternalWindow(url, '诸神终应知晓');
      return { action: 'deny' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('file://')) {
      return;
    }
    event.preventDefault();
    if (isInternalUrl(url)) {
      createInternalWindow(url, '诸神终应知晓');
      return;
    }
    shell.openExternal(url);
  });

  window.loadFile(join(__dirname, '..', 'manual-build', 'assets', 'zy.html'));
};

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

app.whenReady().then(() => {
  registerDesktopIpc();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
