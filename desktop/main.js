const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} = require('fs');
const { spawn, spawnSync } = require('child_process');
const { createHash } = require('crypto');
const { dirname, join, resolve } = require('path');
const { get } = require('https');

const assetRoot = join(__dirname, '..', 'manual-build', 'assets');
const projectRoot = resolve(__dirname, '..');
const contentRoot = join(projectRoot, 'content');
const updateContentRoot = join(projectRoot, 'releases', 'update-content');
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

const normalizeMusicState = (value) => {
  const source = value && typeof value === 'object' ? value : {};
  return {
    enabled: source.enabled !== false,
    volume: Math.max(0, Math.min(100, Number(source.volume) || 45)),
    position: Math.max(0, Number(source.position) || 0),
    updatedAt: source.updatedAt || new Date().toISOString()
  };
};

const getMusicStatePath = () => {
  return join(app.getPath('userData'), 'music-state.json');
};

const loadMusicState = () => {
  try {
    return normalizeMusicState(JSON.parse(readFileSync(getMusicStatePath(), 'utf8')));
  } catch (error) {
    return normalizeMusicState(musicState);
  }
};

const persistMusicState = (state) => {
  const normalizedState = normalizeMusicState({
    ...state,
    updatedAt: new Date().toISOString()
  });
  try {
    mkdirSync(dirname(getMusicStatePath()), { recursive: true });
    writeFileSync(
      getMusicStatePath(),
      JSON.stringify(normalizedState, null, 2),
      'utf8'
    );
  } catch (error) {
    writeStartupLog('music_state_persist_failed', getErrorDetail(error));
  }
  return normalizedState;
};

configureRuntimeStorage();
musicState = loadMusicState();

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

const hashText = (text) => {
  return createHash('sha256').update(String(text)).digest('hex');
};

const hashFile = (path) => {
  return hashText(readFileSync(path, 'utf8'));
};

const readJsonFile = (path) => {
  return JSON.parse(readFileSync(path, 'utf8'));
};

const writeJsonFile = (path, data) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
};

const runProjectCommand = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    shell: false,
    windowsHide: true
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
};

const resolveNodeBinary = () => {
  return process.env.npm_node_execpath || process.env.NODE_BINARY || 'node';
};

const canEditSourceContent = () => {
  return !app.isPackaged && existsSync(contentRoot) && existsSync(join(projectRoot, 'scripts', 'generate-ui.js'));
};

const getDraftRoot = () => {
  return join(app.getPath('userData'), 'drafts');
};

const getRemoteContentRoot = () => {
  return join(app.getPath('userData'), 'remote-content');
};

const contentFiles = {
  characters: 'characters.json',
  concepts: 'concepts.json',
  jokes: 'jokes.json',
  officialPosts: 'official-posts.json',
  fanCreations: 'fan-creations.json'
};

const contentLabels = {
  characters: '角色',
  concepts: '概念',
  jokes: '笑话',
  officialPosts: '官方动态',
  fanCreations: '二创'
};

const getContentFilePath = (dataset) => {
  const file = contentFiles[dataset];
  if (!file) {
    throw new Error(`未知资料集：${dataset}`);
  }
  return join(contentRoot, file);
};

const summarizeContentItem = (dataset, item, index) => {
  if (dataset === 'fanCreations') {
    return {
      index,
      title: item.name || item.title || `二创分组 ${index + 1}`,
      desc: item.base || '',
      raw: item
    };
  }
  return {
    index,
    title: item.name || item.title || item.id || `条目 ${index + 1}`,
    desc: item.desc || item.summary || item.tag || item.category || '',
    raw: item
  };
};

const loadEditableContent = () => {
  const result = {};
  for (const [dataset, file] of Object.entries(contentFiles)) {
    const path = join(contentRoot, file);
    if (!existsSync(path)) {
      result[dataset] = {
        label: contentLabels[dataset],
        available: false,
        items: []
      };
      continue;
    }
    const data = readJsonFile(path);
    const list = Array.isArray(data)
      ? data
      : dataset === 'fanCreations' && Array.isArray(data.artists)
        ? data.artists
        : [];
    result[dataset] = {
      label: contentLabels[dataset],
      available: true,
      items: list.map((item, index) => summarizeContentItem(dataset, item, index))
    };
  }
  return result;
};

const saveContentDraft = (payload) => {
  if (!payload || !payload.dataset) {
    throw new Error('草稿缺少资料集标识');
  }
  const draft = {
    schemaVersion: 1,
    dataset: payload.dataset,
    index: Number(payload.index),
    item: payload.item,
    savedAt: new Date().toISOString()
  };
  const draftPath = join(getDraftRoot(), `${payload.dataset}-${draft.index}.json`);
  writeJsonFile(draftPath, draft);
  return { saved: true, path: draftPath, draft };
};

const applyContentDraft = (payload) => {
  if (!canEditSourceContent()) {
    throw new Error('当前客户端无法直接写入 content 源数据；请在维护仓库环境中使用资料编辑。');
  }
  const draft = payload && payload.item ? payload : readJsonFile(payload.path);
  const dataset = draft.dataset;
  const index = Number(draft.index);
  const filePath = getContentFilePath(dataset);
  const backupPath = join(
    getDraftRoot(),
    'backups',
    `${dataset}-${Date.now()}.json`
  );
  mkdirSync(dirname(backupPath), { recursive: true });
  copyFileSync(filePath, backupPath);
  const data = readJsonFile(filePath);
  if (dataset === 'fanCreations') {
    if (!data || !Array.isArray(data.artists) || !data.artists[index]) {
      throw new Error(`二创分组索引不存在：${index}`);
    }
    data.artists[index] = draft.item;
  } else {
    if (!Array.isArray(data) || !data[index]) {
      throw new Error(`资料条目索引不存在：${index}`);
    }
    data[index] = draft.item;
  }
  writeJsonFile(filePath, data);
  const nodeBinary = resolveNodeBinary();
  const generateResult = runProjectCommand(nodeBinary, [join(projectRoot, 'scripts', 'generate-ui.js')]);
  const verifyResult = generateResult.ok
    ? runProjectCommand(nodeBinary, [join(projectRoot, 'scripts', 'verify-project.js')])
    : generateResult;
  if (!verifyResult.ok) {
    copyFileSync(backupPath, filePath);
    runProjectCommand(nodeBinary, [join(projectRoot, 'scripts', 'generate-ui.js')]);
    throw new Error(
      `应用草稿失败，已恢复备份。\n${verifyResult.stderr || verifyResult.stdout}`
    );
  }
  return {
    applied: true,
    dataset,
    index,
    backupPath,
    generated: generateResult.stdout,
    verified: verifyResult.stdout
  };
};

const downloadText = (url) => {
  return new Promise((resolveDownload, rejectDownload) => {
    get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        rejectDownload(new Error(`下载失败：${response.statusCode} ${url}`));
        response.resume();
        return;
      }
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => resolveDownload(body));
    }).on('error', rejectDownload);
  });
};

const readManifestFromPayload = async (payload) => {
  if (payload && payload.manifestUrl) {
    return JSON.parse(await downloadText(payload.manifestUrl));
  }
  const localManifest = join(updateContentRoot, 'remote-content-manifest.json');
  if (!existsSync(localManifest)) {
    throw new Error('本地远程内容 manifest 不存在，请先运行 npm run content:package');
  }
  return readJsonFile(localManifest);
};

const readBundleForManifest = async (manifest, payload) => {
  if (payload && payload.bundleUrl) {
    return await downloadText(payload.bundleUrl);
  }
  if (payload && payload.manifestUrl) {
    const bundleUrl = new URL(manifest.packageFile || 'content-bundle.json', payload.manifestUrl).href;
    return await downloadText(bundleUrl);
  }
  const localBundle = join(updateContentRoot, manifest.packageFile || 'content-bundle.json');
  if (!existsSync(localBundle)) {
    throw new Error(`内容包不存在：${localBundle}`);
  }
  return readFileSync(localBundle, 'utf8');
};

const verifyContentBundle = (manifest, bundleText) => {
  const expectedPackageHash = manifest.packageSha256;
  const actualPackageHash = hashText(bundleText);
  if (expectedPackageHash && expectedPackageHash !== actualPackageHash) {
    throw new Error(`内容包 hash 不一致：${actualPackageHash}`);
  }
  const bundle = JSON.parse(bundleText);
  const manifestFiles = new Map(
    (manifest.files || []).map((file) => [file.path, file])
  );
  for (const file of bundle.files || []) {
    const expected = manifestFiles.get(file.path);
    if (!expected) {
      throw new Error(`内容包包含 manifest 未声明文件：${file.path}`);
    }
    if (expected.sha256 !== hashText(file.content)) {
      throw new Error(`内容文件 hash 不一致：${file.path}`);
    }
    if (!/\\.(json|md)$/i.test(file.path)) {
      throw new Error(`内容包包含不允许的文件类型：${file.path}`);
    }
  }
  return bundle;
};

const cacheRemoteContent = (manifest, bundleText) => {
  const version = manifest.contentVersion || `content-${Date.now()}`;
  const targetRoot = join(getRemoteContentRoot(), 'cache', version);
  mkdirSync(targetRoot, { recursive: true });
  writeJsonFile(join(targetRoot, 'remote-content-manifest.json'), manifest);
  writeFileSync(join(targetRoot, manifest.packageFile || 'content-bundle.json'), bundleText, 'utf8');
  return targetRoot;
};

const getRemoteContentStatePath = () => {
  return join(getRemoteContentRoot(), 'state.json');
};

const readRemoteContentState = () => {
  try {
    return readJsonFile(getRemoteContentStatePath());
  } catch (error) {
    return {
      schemaVersion: 1,
      activeVersion: null,
      previousVersion: null,
      updatedAt: null
    };
  }
};

const writeRemoteContentState = (state) => {
  const nextState = {
    schemaVersion: 1,
    activeVersion: state.activeVersion || null,
    previousVersion: state.previousVersion || null,
    updatedAt: new Date().toISOString()
  };
  writeJsonFile(getRemoteContentStatePath(), nextState);
  return nextState;
};

const applyRemoteContent = (manifest, bundle) => {
  const state = readRemoteContentState();
  if (canEditSourceContent()) {
    const backupRoot = join(getRemoteContentRoot(), 'backups', `${Date.now()}`);
    mkdirSync(backupRoot, { recursive: true });
    for (const file of bundle.files || []) {
      const targetPath = join(contentRoot, file.path);
      if (!targetPath.startsWith(contentRoot)) {
        throw new Error(`远程内容路径越界：${file.path}`);
      }
      if (existsSync(targetPath)) {
        const backupPath = join(backupRoot, file.path);
        mkdirSync(dirname(backupPath), { recursive: true });
        copyFileSync(targetPath, backupPath);
      }
      mkdirSync(dirname(targetPath), { recursive: true });
      writeFileSync(targetPath, file.content, 'utf8');
    }
    const nodeBinary = resolveNodeBinary();
    const generateResult = runProjectCommand(nodeBinary, [join(projectRoot, 'scripts', 'generate-ui.js')]);
    const verifyResult = generateResult.ok
      ? runProjectCommand(nodeBinary, [join(projectRoot, 'scripts', 'verify-project.js')])
      : generateResult;
    if (!verifyResult.ok) {
      const restoreFiles = (directory) => {
        for (const entry of require('fs').readdirSync(directory, { withFileTypes: true })) {
          const sourcePath = join(directory, entry.name);
          const relativePath = sourcePath.slice(backupRoot.length + 1);
          const targetPath = join(contentRoot, relativePath);
          if (entry.isDirectory()) {
            restoreFiles(sourcePath);
            continue;
          }
          mkdirSync(dirname(targetPath), { recursive: true });
          copyFileSync(sourcePath, targetPath);
        }
      };
      restoreFiles(backupRoot);
      runProjectCommand(nodeBinary, [join(projectRoot, 'scripts', 'generate-ui.js')]);
      throw new Error(`远程内容应用失败，已回滚。\n${verifyResult.stderr || verifyResult.stdout}`);
    }
  }
  return writeRemoteContentState({
    activeVersion: manifest.contentVersion,
    previousVersion: state.activeVersion
  });
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
    musicState = persistMusicState({
      ...musicState,
      position: lastMusicResult && Number(lastMusicResult.position) >= 0
        ? Number(lastMusicResult.position)
        : musicState.position
    });
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

const readMusicPlaybackState = async () => {
  if (!musicWindow || musicWindow.isDestroyed()) {
    return {
      ...musicState,
      playing: false,
      paused: true
    };
  }
  try {
    const playbackState = await musicWindow.webContents.executeJavaScript(
      'window.readMusicState ? window.readMusicState() : null',
      true
    );
    if (playbackState) {
      musicState = persistMusicState({
        ...musicState,
        position: playbackState.position
      });
      lastMusicResult = {
        ...playbackState,
        enabled: musicState.enabled,
        volume: musicState.volume
      };
      return lastMusicResult;
    }
  } catch (error) {
    writeStartupLog('music_state_read_failed', getErrorDetail(error));
  }
  return {
    ...musicState,
    playing: false,
    paused: true
  };
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

  ipcMain.handle('desktop:get-music-state', async () => {
    return await readMusicPlaybackState();
  });

  ipcMain.handle('desktop:set-music-state', async (event, payload) => {
    const nextState = {
      enabled: !!(payload && payload.enabled),
      volume: Math.max(0, Math.min(100, Number(payload && payload.volume) || 0)),
      position: Math.max(
        0,
        Number(payload && payload.position) || Number(musicState.position) || 0
      )
    };
    const unchanged = musicState.enabled === nextState.enabled
      && musicState.volume === nextState.volume
      && Math.abs(Number(musicState.position || 0) - nextState.position) < 1;
    musicState = persistMusicState(nextState);
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

  ipcMain.handle('desktop:list-content', () => {
    return {
      editable: canEditSourceContent(),
      datasets: canEditSourceContent() ? loadEditableContent() : {},
      message: canEditSourceContent()
        ? '当前环境支持写回 content 源数据'
        : '当前客户端只能浏览内容，不能直接写回 content 源数据'
    };
  });

  ipcMain.handle('desktop:save-content-draft', (event, payload) => {
    return saveContentDraft(payload);
  });

  ipcMain.handle('desktop:apply-content-draft', (event, payload) => {
    return applyContentDraft(payload);
  });

  ipcMain.handle('desktop:check-remote-content', async (event, payload) => {
    const manifest = await readManifestFromPayload(payload);
    return {
      manifest,
      state: readRemoteContentState(),
      cached: existsSync(join(getRemoteContentRoot(), 'cache', manifest.contentVersion || ''))
    };
  });

  ipcMain.handle('desktop:download-remote-content', async (event, payload) => {
    const manifest = await readManifestFromPayload(payload);
    const bundleText = await readBundleForManifest(manifest, payload);
    const bundle = verifyContentBundle(manifest, bundleText);
    const cachePath = cacheRemoteContent(manifest, bundleText);
    return {
      downloaded: true,
      contentVersion: manifest.contentVersion,
      cachePath,
      fileCount: bundle.files.length
    };
  });

  ipcMain.handle('desktop:apply-remote-content', async (event, payload) => {
    const manifest = await readManifestFromPayload(payload);
    const bundleText = await readBundleForManifest(manifest, payload);
    const bundle = verifyContentBundle(manifest, bundleText);
    cacheRemoteContent(manifest, bundleText);
    const state = applyRemoteContent(manifest, bundle);
    return {
      applied: true,
      state,
      editableSource: canEditSourceContent()
    };
  });

  ipcMain.handle('desktop:rollback-remote-content', () => {
    const state = readRemoteContentState();
    if (!state.previousVersion) {
      return {
        rolledBack: false,
        reason: '没有可回滚的远程内容版本',
        state
      };
    }
    const nextState = writeRemoteContentState({
      activeVersion: state.previousVersion,
      previousVersion: state.activeVersion
    });
    return {
      rolledBack: true,
      state: nextState
    };
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
