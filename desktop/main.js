const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const { existsSync, readdirSync, readFileSync, writeFileSync } = require('fs');
const { spawn } = require('child_process');
const { dirname, join } = require('path');
const { pathToFileURL } = require('url');

const assetRoot = join(__dirname, '..', 'manual-build', 'assets');
const appIcon = join(assetRoot, 'logo', 'logo.png');
const zoomStep = 0.1;
const minZoomFactor = 0.6;
const maxZoomFactor = 1.8;

const internalHosts = new Set([
  'docs.qq.com',
  'www.taptap.cn',
  'taptap.cn'
]);
let desktopIpcRegistered = false;
let mainWindow = null;
let musicWindow = null;
let musicState = {
  enabled: true,
  volume: 45
};

const isInternalUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol)
      && internalHosts.has(parsedUrl.hostname);
  } catch (error) {
    return false;
  }
};

const getSenderWindow = (event) => {
  return BrowserWindow.fromWebContents(event.sender);
};

const clampZoomFactor = (factor) => {
  return Math.min(maxZoomFactor, Math.max(minZoomFactor, factor));
};

const setZoomFactor = (window, factor) => {
  const normalizedFactor = clampZoomFactor(Number(factor.toFixed(2)));
  window.webContents.setZoomFactor(normalizedFactor);
  return normalizedFactor;
};

const getMusicHtml = () => {
  const audioUrl = pathToFileURL(
    join(assetRoot, 'audio', 'background_music.oga')
  ).toString();
  return `
<!doctype html>
<html>
<head><meta charset="utf-8"></head>
<body>
<audio id="music" src="${audioUrl}" loop preload="auto"></audio>
<script>
const music = document.getElementById('music');
music.muted = false;
window.applyMusicState = (state) => {
  const volume = Math.max(0, Math.min(1, Number(state.volume || 0) / 100));
  music.volume = volume;
  music.muted = false;
  if (!state.enabled) {
    music.pause();
    return Promise.resolve({
      enabled: false,
      playing: false,
      paused: music.paused,
      volume: Math.round(volume * 100)
    });
  }
  return music.play().then(() => ({
    enabled: true,
    playing: !music.paused,
    paused: music.paused,
    volume: Math.round(volume * 100)
  })).catch((error) => ({
    enabled: true,
    playing: false,
    paused: music.paused,
    volume: Math.round(volume * 100),
    error: error && error.message ? error.message : String(error)
  }));
};
</script>
</body>
</html>`;
};

const ensureMusicWindow = () => {
  if (musicWindow && !musicWindow.isDestroyed()) {
    return musicWindow;
  }
  musicWindow = new BrowserWindow({
    show: false,
    width: 320,
    height: 180,
    skipTaskbar: true,
    paintWhenInitiallyHidden: true,
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true
    }
  });
  musicWindow.setAudioMuted(false);
  musicWindow.on('closed', () => {
    musicWindow = null;
  });
  musicWindow.webContents.on('did-finish-load', () => {
    applyMusicState();
  });
  musicWindow.loadURL(
    'data:text/html;charset=utf-8,' + encodeURIComponent(getMusicHtml())
  );
  return musicWindow;
};

const applyMusicState = async () => {
  const window = ensureMusicWindow();
  if (!window || window.isDestroyed()) {
    return false;
  }
  const serializedState = JSON.stringify(musicState);
  try {
    return await window.webContents.executeJavaScript(
      `window.applyMusicState(${serializedState})`,
      true
    );
  } catch (error) {
    return {
      enabled: musicState.enabled,
      playing: false,
      error: error && error.message ? error.message : String(error),
      volume: musicState.volume
    };
  }
};

const destroyMusicWindow = () => {
  if (musicWindow && !musicWindow.isDestroyed()) {
    musicWindow.destroy();
  }
  musicWindow = null;
};

const getPossibleInstallDirs = () => {
  const dirs = new Set();
  dirs.add(dirname(process.execPath));
  if (process.resourcesPath) {
    dirs.add(dirname(process.resourcesPath));
  }
  return Array.from(dirs).filter((dir) => dir && existsSync(dir));
};

const findUninstaller = () => {
  const candidateNames = [
    'Uninstall 诸神终应知晓.exe',
    '诸神终应知晓 Uninstaller.exe',
    'uninstall.exe',
    'uninst.exe'
  ];
  for (const dir of getPossibleInstallDirs()) {
    for (const name of candidateNames) {
      const candidate = join(dir, name);
      if (existsSync(candidate)) {
        return candidate;
      }
    }
    const matched = readdirSync(dir).find((name) => {
      return /\.exe$/i.test(name) && /(uninstall|uninst|卸载)/i.test(name);
    });
    if (matched) {
      return join(dir, matched);
    }
  }
  return '';
};

const createInternalWindow = (url, title) => {
  const window = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 860,
    minHeight: 560,
    backgroundColor: '#08080d',
    title: title || '诸神终应知晓',
    icon: appIcon,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true,
      webSecurity: true
    }
  });

  const toolbarHtml = `
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<style>
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:#09090d;color:#eee4d2;
font-family:"Microsoft YaHei",Arial,sans-serif;overflow:hidden}
.bar{height:48px;display:flex;align-items:center;gap:8px;padding:8px 12px;
border-bottom:1px solid rgba(212,167,84,.18);background:rgba(9,9,13,.96)}
button{height:32px;border:1px solid rgba(212,167,84,.28);border-radius:999px;
padding:0 12px;color:#f0d78c;background:rgba(212,167,84,.08);cursor:pointer}
button:disabled{opacity:.38;cursor:not-allowed}
.title{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;
color:rgba(238,228,210,.7);font-size:13px}
webview{width:100%;height:calc(100vh - 48px);background:#fff}
</style>
</head>
<body>
<div class="bar">
<button id="back">返回</button>
<button id="forward">前进</button>
<button id="reload">刷新</button>
<button id="copy">复制链接</button>
<button id="browser">浏览器打开</button>
<span class="title" id="title"></span>
</div>
<webview id="view" src="${url}" allowpopups></webview>
<script>
const view = document.getElementById('view');
const title = document.getElementById('title');
const back = document.getElementById('back');
const forward = document.getElementById('forward');
const reload = document.getElementById('reload');
const copy = document.getElementById('copy');
const browser = document.getElementById('browser');
const update = () => {
  title.textContent = view.getTitle() || view.getURL();
  back.disabled = !view.canGoBack();
  forward.disabled = !view.canGoForward();
};
back.addEventListener('click', () => view.canGoBack() && view.goBack());
forward.addEventListener('click', () => view.canGoForward() && view.goForward());
reload.addEventListener('click', () => view.reload());
copy.addEventListener('click', () => navigator.clipboard.writeText(view.getURL()));
browser.addEventListener('click', () => window.open(view.getURL(), '_blank'));
view.addEventListener('did-navigate', update);
view.addEventListener('did-navigate-in-page', update);
view.addEventListener('page-title-updated', update);
view.addEventListener('dom-ready', update);
</script>
</body>
</html>`;

  window.loadURL(
    'data:text/html;charset=utf-8,' + encodeURIComponent(toolbarHtml)
  );
};

const registerShortcuts = (window) => {
  window.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') {
      return;
    }
    if (input.key === 'F11') {
      window.setFullScreen(!window.isFullScreen());
      event.preventDefault();
      return;
    }
    if (input.key === 'Escape' && window.isFullScreen()) {
      window.setFullScreen(false);
      event.preventDefault();
      return;
    }
    if (input.alt && input.key === 'Left' && window.webContents.canGoBack()) {
      window.webContents.goBack();
      event.preventDefault();
      return;
    }
    if (input.alt && input.key === 'Right' && window.webContents.canGoForward()) {
      window.webContents.goForward();
      event.preventDefault();
      return;
    }
    if (!input.control) {
      return;
    }
    if (input.key.toLowerCase() === 'f') {
      window.webContents.executeJavaScript(`
        const input = document.querySelector('[data-search]');
        if (input) { input.focus(); input.select(); }
      `);
      event.preventDefault();
      return;
    }
    if (['+', '='].includes(input.key)) {
      setZoomFactor(window, window.webContents.getZoomFactor() + zoomStep);
      event.preventDefault();
      return;
    }
    if (input.key === '-') {
      setZoomFactor(window, window.webContents.getZoomFactor() - zoomStep);
      event.preventDefault();
      return;
    }
    if (input.key === '0') {
      setZoomFactor(window, 1);
      event.preventDefault();
    }
  });
};

const registerDesktopIpc = () => {
  if (desktopIpcRegistered) {
    return;
  }
  desktopIpcRegistered = true;

  ipcMain.handle('desktop:toggle-fullscreen', (event) => {
    const senderWindow = getSenderWindow(event);
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

  ipcMain.handle('desktop:get-always-on-top', (event) => {
    const senderWindow = getSenderWindow(event);
    return senderWindow ? senderWindow.isAlwaysOnTop() : false;
  });

  ipcMain.handle('desktop:set-always-on-top', (event, payload) => {
    const senderWindow = getSenderWindow(event);
    if (!senderWindow) {
      return false;
    }
    senderWindow.setAlwaysOnTop(!!(payload && payload.enabled));
    return senderWindow.isAlwaysOnTop();
  });

  ipcMain.handle('desktop:get-zoom-factor', (event) => {
    const senderWindow = getSenderWindow(event);
    return senderWindow ? senderWindow.webContents.getZoomFactor() : 1;
  });

  ipcMain.handle('desktop:zoom-in', (event) => {
    const senderWindow = getSenderWindow(event);
    if (!senderWindow) {
      return 1;
    }
    return setZoomFactor(
      senderWindow,
      senderWindow.webContents.getZoomFactor() + zoomStep
    );
  });

  ipcMain.handle('desktop:zoom-out', (event) => {
    const senderWindow = getSenderWindow(event);
    if (!senderWindow) {
      return 1;
    }
    return setZoomFactor(
      senderWindow,
      senderWindow.webContents.getZoomFactor() - zoomStep
    );
  });

  ipcMain.handle('desktop:reset-zoom', (event) => {
    const senderWindow = getSenderWindow(event);
    if (!senderWindow) {
      return 1;
    }
    return setZoomFactor(senderWindow, 1);
  });

  ipcMain.handle('desktop:export-data', async (event, payload) => {
    const result = await dialog.showSaveDialog(getSenderWindow(event), {
      title: '导出本地数据',
      defaultPath: 'zhushen-local-data.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (result.canceled || !result.filePath) {
      return false;
    }
    const data = payload && payload.data ? payload.data : {};
    writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  });

  ipcMain.handle('desktop:import-data', async (event) => {
    const result = await dialog.showOpenDialog(getSenderWindow(event), {
      title: '导入本地数据',
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    const content = readFileSync(result.filePaths[0], 'utf8');
    return JSON.parse(content);
  });

  ipcMain.handle('desktop:get-music-state', () => {
    return musicState;
  });

  ipcMain.handle('desktop:set-music-state', async (event, payload) => {
    musicState = {
      enabled: !!(payload && payload.enabled),
      volume: Math.max(0, Math.min(100, Number(payload && payload.volume) || 0))
    };
    return await applyMusicState();
  });

  ipcMain.handle('desktop:request-uninstall', async (event) => {
    const senderWindow = getSenderWindow(event);
    const uninstallerPath = findUninstaller();
    if (!uninstallerPath) {
      await dialog.showMessageBox(senderWindow, {
        type: 'info',
        title: '未找到卸载器',
        message: '当前可能是便携版或开发版，未找到可直接启动的卸载程序。',
        detail: '如果你安装的是正式安装版，可以从 Windows 设置或开始菜单中卸载。'
      });
      return { started: false, reason: 'not_found' };
    }
    const result = await dialog.showMessageBox(senderWindow, {
      type: 'question',
      buttons: ['开始卸载', '取消'],
      defaultId: 1,
      cancelId: 1,
      title: '离开汇流地之前',
      message: '要启动《诸神终应知晓》的卸载器吗？',
      detail: '卸载前如需保留收藏、最近浏览和设置，请先在设置页导出本地数据。'
    });
    if (result.response !== 0) {
      return { started: false, reason: 'cancelled' };
    }
    const child = spawn(uninstallerPath, [], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    app.quit();
    return { started: true };
  });
};

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 780,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#08080d',
    title: '诸神终应知晓',
    icon: appIcon,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternalUrl(url)) {
      createInternalWindow(url, '诸神终应知晓');
      return { action: 'deny' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
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

  registerShortcuts(mainWindow);
  mainWindow.on('closed', () => {
    mainWindow = null;
    destroyMusicWindow();
  });
  mainWindow.loadFile(join(assetRoot, 'zy.html'));
};

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

app.whenReady().then(() => {
  registerDesktopIpc();
  ensureMusicWindow();
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
