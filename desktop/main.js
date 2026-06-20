const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} = require('fs');
const { spawn } = require('child_process');
const { dirname, join } = require('path');

const assetRoot = join(__dirname, '..', 'manual-build', 'assets');
const appIcon = app.isPackaged
  ? join(
      process.resourcesPath,
      'app.asar.unpacked',
      'manual-build',
      'assets',
      'logo',
      'logo.ico'
    )
  : join(assetRoot, 'logo', 'logo.ico');
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
let lastMusicResult = null;

const configureRuntimeStorage = () => {
  if (!app.isPackaged) {
    return;
  }
  const installDir = dirname(dirname(process.execPath));
  const dataRoot = join(installDir, 'data', 'client');
  const paths = {
    userData: dataRoot,
    sessionData: join(dataRoot, 'session'),
    logs: join(dataRoot, 'logs'),
    crashDumps: join(dataRoot, 'crash-dumps')
  };
  for (const path of Object.values(paths)) {
    mkdirSync(path, { recursive: true });
  }
  for (const [name, path] of Object.entries(paths)) {
    app.setPath(name, path);
  }
};

configureRuntimeStorage();

const writeStartupLog = (message, detail) => {
  try {
    const logDir = join(app.getPath('userData'), 'logs');
    mkdirSync(logDir, { recursive: true });
    appendFileSync(
      join(logDir, 'desktop-startup.log'),
      JSON.stringify({
        time: new Date().toISOString(),
        message,
        detail: detail || null
      }) + '\n',
      'utf8'
    );
  } catch (error) {
    // 启动日志不能影响主流程。
  }
};

const getErrorDetail = (error) => {
  if (!error) {
    return '';
  }
  return error.stack || error.message || String(error);
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
      partition: 'persist:zhushen-music',
      sandbox: false,
      webSecurity: true
    }
  });
  musicWindow.on('closed', () => {
    musicWindow = null;
  });
  musicWindow.webContents.on('did-finish-load', () => {
    applyMusicState();
  });
  musicWindow.loadFile(join(__dirname, 'music.html'));
  return musicWindow;
};

const applyMusicState = async () => {
  const window = ensureMusicWindow();
  if (!window || window.isDestroyed()) {
    return false;
  }
  const serializedState = JSON.stringify(musicState);
  try {
    lastMusicResult = await window.webContents.executeJavaScript(
      `window.applyMusicState(${serializedState})`,
      true
    );
    return lastMusicResult;
  } catch (error) {
    lastMusicResult = {
      enabled: musicState.enabled,
      playing: false,
      error: error && error.message ? error.message : String(error),
      volume: musicState.volume
    };
    return lastMusicResult;
  }
};

const destroyMusicWindow = () => {
  if (musicWindow && !musicWindow.isDestroyed()) {
    musicWindow.destroy();
  }
  musicWindow = null;
};

const quotePowerShell = (value) => {
  return `'${String(value).replace(/'/g, "''")}'`;
};

const getShortcutPaths = () => {
  const startMenuRoot = process.env.APPDATA
    ? join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs')
    : '';
  return [
    join(app.getPath('desktop'), '诸神终应知晓.lnk'),
    startMenuRoot ? join(startMenuRoot, '诸神终应知晓.lnk') : ''
  ].filter(Boolean);
};

const createSelfUninstallScript = () => {
  const installDir = dirname(process.execPath);
  const scriptPath = join(
    app.getPath('temp'),
    `zhushen-self-uninstall-${Date.now()}.ps1`
  );
  const shortcutCommands = getShortcutPaths()
    .map((path) => `Remove-Item -LiteralPath ${quotePowerShell(path)} -Force -ErrorAction SilentlyContinue`)
    .join('\r\n');
  const script = [
    '$ErrorActionPreference = "SilentlyContinue"',
    `$targetPid = ${process.pid}`,
    'while (Get-Process -Id $targetPid -ErrorAction SilentlyContinue) {',
    '  Start-Sleep -Milliseconds 300',
    '}',
    'Start-Sleep -Milliseconds 500',
    shortcutCommands,
    `Remove-Item -LiteralPath ${quotePowerShell(installDir)} -Recurse -Force -ErrorAction SilentlyContinue`,
    `Remove-Item -LiteralPath ${quotePowerShell(scriptPath)} -Force -ErrorAction SilentlyContinue`
  ].join('\r\n');
  writeFileSync(scriptPath, script, 'utf8');
  return scriptPath;
};

const runPowerShellScriptDetached = (scriptPath) => {
  const child = spawn(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
    {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    }
  );
  child.unref();
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

  ipcMain.handle('desktop:window-minimize', (event) => {
    const senderWindow = getSenderWindow(event);
    if (senderWindow) {
      senderWindow.minimize();
    }
    return true;
  });

  ipcMain.handle('desktop:window-toggle-maximize', (event) => {
    const senderWindow = getSenderWindow(event);
    if (!senderWindow) {
      return false;
    }
    if (senderWindow.isMaximized()) {
      senderWindow.unmaximize();
    } else {
      senderWindow.maximize();
    }
    return senderWindow.isMaximized();
  });

  ipcMain.handle('desktop:window-close', (event) => {
    const senderWindow = getSenderWindow(event);
    if (senderWindow) {
      senderWindow.close();
    }
    return true;
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
    const nextState = {
      enabled: !!(payload && payload.enabled),
      volume: Math.max(0, Math.min(100, Number(payload && payload.volume) || 0))
    };
    const unchanged = musicState.enabled === nextState.enabled
      && musicState.volume === nextState.volume;
    musicState = nextState;
    if (unchanged && lastMusicResult) {
      return lastMusicResult;
    }
    return await applyMusicState();
  });

  ipcMain.handle('desktop:request-uninstall', async (event) => {
    const senderWindow = getSenderWindow(event);
    const result = await dialog.showMessageBox(senderWindow, {
      type: 'question',
      buttons: ['开始卸载', '取消'],
      defaultId: 1,
      cancelId: 1,
      title: '离开汇流地之前',
      message: '要卸载《诸神终应知晓》桌面客户端吗？',
      detail: '卸载将移除安装目录和快捷方式，不再调用旧安装器。若需保留收藏、最近浏览和设置，请先在设置页导出本地数据。'
    });
    if (result.response !== 0) {
      return { started: false, reason: 'cancelled' };
    }
    runPowerShellScriptDetached(createSelfUninstallScript());
    app.quit();
    return { started: true };
  });
};

const createMainWindow = () => {
  writeStartupLog('create_main_window_start', {
    assetRoot,
    home: join(assetRoot, 'zy.html'),
    homeExists: existsSync(join(assetRoot, 'zy.html'))
  });
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 780,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#08080d',
    title: '诸神终应知晓',
    icon: appIcon,
    frame: false,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
      sandbox: true,
      webviewTag: true,
      webSecurity: true
    }
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    writeStartupLog('main_window_ready_to_show');
  });
  mainWindow.webContents.on('did-fail-load', (
    event,
    errorCode,
    errorDescription,
    validatedUrl
  ) => {
    writeStartupLog('main_window_did_fail_load', {
      errorCode,
      errorDescription,
      validatedUrl
    });
  });
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    writeStartupLog('main_window_render_process_gone', details);
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
  mainWindow.loadFile(join(assetRoot, 'zy.html')).catch((error) => {
    writeStartupLog('main_window_load_failed', getErrorDetail(error));
    dialog.showErrorBox(
      '诸神终应知晓启动失败',
      '主窗口资源加载失败：\n' + getErrorDetail(error)
    );
  });
};

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) {
      return;
    }
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    try {
      writeStartupLog('app_ready');
      registerDesktopIpc();
      ensureMusicWindow();
      createMainWindow();
    } catch (error) {
      writeStartupLog('app_ready_failed', getErrorDetail(error));
      dialog.showErrorBox(
        '诸神终应知晓启动失败',
        getErrorDetail(error)
      );
    }

    app.on('activate', () => {
      if (!mainWindow) {
        createMainWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
