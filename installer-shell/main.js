const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const {
  appendFileSync,
  copyFileSync,
  cpSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync
} = require('fs');
const { createHash } = require('crypto');
const https = require('https');
const { basename, dirname, join, relative, sep } = require('path');
const { spawn } = require('child_process');

const appRoot = __dirname;
const productName = '诸神终应知晓';
const executableName = 'zhushen-archive.exe';
const configFileName = 'installer-state.json';
const updateManifestName = 'zhushen-update-manifest.json';
const updateManifestUrl = 'https://github.com/Gao2612/zhushen/releases/latest/download/zhushen-update-manifest.json';

let mainWindow = null;

const getLocalAppData = () => {
  return process.env.LOCALAPPDATA
    || join(app.getPath('home'), 'AppData', 'Local');
};

const getDefaultInstallDir = () => {
  return join(getLocalAppData(), 'Programs', 'zhushen-archive');
};

const getConfigPath = () => {
  return join(app.getPath('userData'), configFileName);
};

const readConfig = () => {
  try {
    return JSON.parse(readFileSync(getConfigPath(), 'utf8'));
  } catch (error) {
    return {};
  }
};

const writeConfig = (config) => {
  mkdirSync(app.getPath('userData'), { recursive: true });
  writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf8');
};

const getInstallDir = () => {
  const config = readConfig();
  return config.installDir || getDefaultInstallDir();
};

const setInstallDir = (installDir) => {
  const config = readConfig();
  config.installDir = installDir;
  writeConfig(config);
};

const writeInstallerLog = (eventName, fields = {}) => {
  const logDir = join(app.getPath('userData'), 'logs');
  mkdirSync(logDir, { recursive: true });
  appendFileSync(
    join(logDir, 'installer.log'),
    JSON.stringify({
      time: new Date().toISOString(),
      event: eventName,
      ...fields
    }) + '\n',
    'utf8'
  );
};

const sendProgress = (step, percent, message) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  mainWindow.webContents.send('installer:progress', {
    step,
    percent,
    message
  });
};

const formatBytes = (bytes) => {
  const value = Number(bytes) || 0;
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const formatEta = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '--';
  }
  if (seconds < 60) {
    return `${Math.ceil(seconds)}s`;
  }
  return `${Math.ceil(seconds / 60)}m`;
};

const toPortablePath = (path) => {
  return path.split(sep).join('/');
};

const hashFile = (path) => {
  const hash = createHash('sha256');
  hash.update(readFileSync(path));
  return hash.digest('hex');
};

const listFiles = (dir) => {
  const files = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  };
  walk(dir);
  return files;
};

const getDirectorySize = (dir) => {
  if (!dir || !existsSync(dir)) {
    return 0;
  }
  return listFiles(dir).reduce((total, filePath) => {
    return total + statSync(filePath).size;
  }, 0);
};

const getDriveFreeBytes = async (targetPath) => {
  const root = (targetPath.match(/^[a-zA-Z]:/) || [''])[0].replace(':', '');
  if (!root) {
    return 0;
  }
  const script = `(Get-PSDrive -Name ${quotePowerShell(root)}).Free`;
  return new Promise((resolve) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { windowsHide: true }
    );
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });
    child.on('exit', () => {
      resolve(Number(output.trim()) || 0);
    });
    child.on('error', () => resolve(0));
  });
};

const getPayloadCandidates = () => {
  const resourcesPath = process.resourcesPath || '';
  return [
    join(resourcesPath, 'desktop-payload'),
    join(resourcesPath, 'app.asar.unpacked', 'desktop-payload'),
    join(appRoot, '..', 'desktop-payload'),
    join(appRoot, '..', 'releases', 'desktop', 'win-unpacked')
  ];
};

const findPayloadDir = () => {
  return getPayloadCandidates().find((path) => {
    return existsSync(join(path, executableName));
  }) || '';
};

const readJsonFile = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    return null;
  }
};

const getEmbeddedManifestPath = () => {
  const payloadDir = findPayloadDir();
  if (!payloadDir) {
    return '';
  }
  return join(payloadDir, 'resources', updateManifestName);
};

const getInstalledManifestPath = () => {
  return join(getInstallDir(), 'resources', updateManifestName);
};

const readEmbeddedManifest = () => {
  return readJsonFile(getEmbeddedManifestPath());
};

const readInstalledManifest = () => {
  return readJsonFile(getInstalledManifestPath());
};

const getPayloadRequiredBytes = () => {
  const manifest = readEmbeddedManifest();
  if (manifest && Array.isArray(manifest.files)) {
    return manifest.files.reduce((total, file) => total + (Number(file.size) || 0), 0);
  }
  return getDirectorySize(findPayloadDir());
};

const getSpaceInfo = async () => {
  const installDir = getInstallDir();
  const requiredBytes = getPayloadRequiredBytes();
  const freeBytes = await getDriveFreeBytes(installDir);
  return {
    requiredBytes,
    freeBytes,
    enough: freeBytes <= 0 || freeBytes > requiredBytes + 256 * 1024 * 1024,
    requiredText: formatBytes(requiredBytes),
    freeText: freeBytes > 0 ? formatBytes(freeBytes) : '--'
  };
};

const getLocalFilePath = (baseDir, portablePath) => {
  return join(baseDir, ...String(portablePath).split('/'));
};

const getFileProblems = (baseDir, manifest, verifyHash = true) => {
  if (!manifest || !Array.isArray(manifest.files)) {
    return [];
  }
  const problems = [];
  for (const file of manifest.files) {
    const targetPath = getLocalFilePath(baseDir, file.path);
    if (!existsSync(targetPath)) {
      problems.push({ file, reason: 'missing' });
      continue;
    }
    const stats = statSync(targetPath);
    if (Number(file.size) && stats.size !== Number(file.size)) {
      problems.push({ file, reason: 'size' });
      continue;
    }
    if (verifyHash && file.sha256 && hashFile(targetPath) !== file.sha256) {
      problems.push({ file, reason: 'hash' });
    }
  }
  return problems;
};

const copyFileEnsured = (sourcePath, targetPath) => {
  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
};

const copyPayloadFiles = (mode, overwriteAll = true) => {
  const payloadDir = findPayloadDir();
  const installDir = getInstallDir();
  const files = listFiles(payloadDir);
  const totalBytes = files.reduce((total, filePath) => total + statSync(filePath).size, 0);
  let copiedBytes = 0;
  const startedAt = Date.now();
  files.forEach((sourcePath, index) => {
    const relativePath = toPortablePath(relative(payloadDir, sourcePath));
    const targetPath = getLocalFilePath(installDir, relativePath);
    const size = statSync(sourcePath).size;
    if (overwriteAll || !existsSync(targetPath)) {
      copyFileEnsured(sourcePath, targetPath);
    }
    copiedBytes += size;
    const elapsed = Math.max(0.5, (Date.now() - startedAt) / 1000);
    const speed = copiedBytes / elapsed;
    const eta = (totalBytes - copiedBytes) / Math.max(1, speed);
    sendProgress(
      mode,
      Math.round((copiedBytes / Math.max(1, totalBytes)) * 100),
      `\u5199\u5165 ${index + 1}/${files.length} · ${formatBytes(speed)}/s · ETA ${formatEta(eta)}`
    );
  });
};

const verifyInstalledFiles = (manifest, progressOffset = 0, progressRange = 100) => {
  const installDir = getInstallDir();
  const files = manifest && Array.isArray(manifest.files) ? manifest.files : [];
  const problems = [];
  files.forEach((file, index) => {
    const percent = progressOffset + Math.round(((index + 1) / Math.max(1, files.length)) * progressRange);
    sendProgress(
      'verify',
      percent,
      `\u6821\u9a8c ${index + 1}/${files.length} · ${file.path}`
    );
    const targetPath = getLocalFilePath(installDir, file.path);
    if (!existsSync(targetPath)) {
      problems.push({ file, reason: 'missing' });
      return;
    }
    if (statSync(targetPath).size !== Number(file.size)) {
      problems.push({ file, reason: 'size' });
      return;
    }
    if (hashFile(targetPath) !== file.sha256) {
      problems.push({ file, reason: 'hash' });
    }
  });
  return problems;
};

const requestJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'ZhushenInstaller',
        Accept: 'application/json'
      }
    }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        response.resume();
        resolve(requestJson(response.headers.location));
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
};

const downloadFileOnce = (url, targetPath, expectedSize, progress) => {
  return new Promise((resolve, reject) => {
    mkdirSync(dirname(targetPath), { recursive: true });
    const tempPath = `${targetPath}.download`;
    const file = createWriteStream(tempPath);
    const startedAt = Date.now();
    let downloaded = 0;
    const request = https.get(url, {
      headers: { 'User-Agent': 'ZhushenInstaller' }
    }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        file.close();
        rmSync(tempPath, { force: true });
        resolve(downloadFileOnce(response.headers.location, targetPath, expectedSize, progress));
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        file.close();
        rmSync(tempPath, { force: true });
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.on('data', (chunk) => {
        downloaded += chunk.length;
        const elapsed = Math.max(0.5, (Date.now() - startedAt) / 1000);
        const speed = downloaded / elapsed;
        const total = Number(expectedSize) || Number(response.headers['content-length']) || downloaded;
        const eta = (total - downloaded) / Math.max(1, speed);
        progress({
          downloaded,
          total,
          speed,
          eta,
          percent: Math.round((downloaded / Math.max(1, total)) * 100)
        });
      });
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          renameSync(tempPath, targetPath);
          resolve(true);
        });
      });
    });
    request.on('error', (error) => {
      file.close();
      rmSync(tempPath, { force: true });
      reject(error);
    });
  });
};

const downloadFileWithRetry = async (file, targetPath, progressOffset, progressRange) => {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await downloadFileOnce(file.url, targetPath, file.size, (progress) => {
        sendProgress(
          'download',
          progressOffset + Math.round((progress.percent / 100) * progressRange),
          `\u4e0b\u8f7d ${file.path} · ${formatBytes(progress.speed)}/s · ETA ${formatEta(progress.eta)} · ${attempt}/3`
        );
      });
      if (file.sha256 && hashFile(targetPath) !== file.sha256) {
        throw new Error('sha256 mismatch');
      }
      return true;
    } catch (error) {
      lastError = error;
      rmSync(targetPath, { force: true });
      sendProgress(
        'retry',
        progressOffset,
        `\u4e0b\u8f7d\u5931\u8d25\uff0c\u6b63\u5728\u91cd\u8bd5 ${attempt}/3`
      );
    }
  }
  throw lastError || new Error('download failed');
};

const fetchRemoteManifest = async () => {
  return await requestJson(updateManifestUrl);
};

const compareBuildId = (remoteManifest, localManifest) => {
  if (!remoteManifest || !remoteManifest.buildId) {
    return false;
  }
  return !localManifest || remoteManifest.buildId !== localManifest.buildId;
};

const getAppExePath = () => {
  return join(getInstallDir(), executableName);
};

const getShortcutPaths = () => {
  const startMenuRoot = process.env.APPDATA
    ? join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs')
    : '';
  return [
    join(app.getPath('desktop'), `${productName}.lnk`),
    startMenuRoot ? join(startMenuRoot, `${productName}.lnk`) : ''
  ].filter(Boolean);
};

const quotePowerShell = (value) => {
  return `'${String(value).replace(/'/g, "''")}'`;
};

const runPowerShell = (script) => {
  const result = spawn(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
    {
      stdio: 'ignore',
      windowsHide: true
    }
  );
  return new Promise((resolve) => {
    result.on('exit', (code) => resolve(code === 0));
    result.on('error', () => resolve(false));
  });
};

const createShortcut = async (shortcutPath, targetPath) => {
  mkdirSync(dirname(shortcutPath), { recursive: true });
  const workingDirectory = dirname(targetPath);
  const script = [
    '$ErrorActionPreference = "Stop"',
    '$shell = New-Object -ComObject WScript.Shell',
    `$shortcut = $shell.CreateShortcut(${quotePowerShell(shortcutPath)})`,
    `$shortcut.TargetPath = ${quotePowerShell(targetPath)}`,
    `$shortcut.WorkingDirectory = ${quotePowerShell(workingDirectory)}`,
    `$shortcut.IconLocation = ${quotePowerShell(targetPath)}`,
    '$shortcut.Save()'
  ].join('; ');
  return await runPowerShell(script);
};

const createShortcuts = async () => {
  const targetPath = getAppExePath();
  for (const shortcutPath of getShortcutPaths()) {
    await createShortcut(shortcutPath, targetPath);
  }
};

const removeShortcuts = () => {
  for (const shortcutPath of getShortcutPaths()) {
    rmSync(shortcutPath, { force: true });
  }
};

const runDetached = (filePath, args = []) => {
  if (!existsSync(filePath)) {
    return false;
  }
  const child = spawn(filePath, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: false
  });
  child.unref();
  return true;
};

const removeInstallDir = () => {
  const installDir = getInstallDir();
  if (!existsSync(installDir)) {
    return;
  }
  rmSync(installDir, { recursive: true, force: true });
};

const installPayload = async () => {
  const payloadDir = findPayloadDir();
  const installDir = getInstallDir();
  const manifest = readEmbeddedManifest();
  writeInstallerLog('install_start', {
    payloadDir,
    installDir,
    payloadCandidates: getPayloadCandidates()
  });
  if (!payloadDir) {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '未找到安装资源',
      message: '安装器中没有包含桌面客户端资源，请重新构建推荐安装器。'
    });
    return false;
  }

  sendProgress('prepare', 8, '正在准备安装目录');
  const spaceInfo = await getSpaceInfo();
  if (!spaceInfo.enough) {
    await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: '\u78c1\u76d8\u7a7a\u95f4\u4e0d\u8db3',
      message: `\u5b89\u88c5\u9700\u8981 ${spaceInfo.requiredText}\uff0c\u5f53\u524d\u53ef\u7528 ${spaceInfo.freeText}\u3002`
    });
    sendProgress('failed', 0, '\u78c1\u76d8\u7a7a\u95f4\u4e0d\u8db3');
    return false;
  }
  mkdirSync(dirname(installDir), { recursive: true });
  removeInstallDir();
  mkdirSync(installDir, { recursive: true });

  sendProgress('copy', 34, '正在写入桌面客户端文件');
  copyPayloadFiles('copy', true);
  if (manifest) {
    const problems = verifyInstalledFiles(manifest, 82, 12);
    if (problems.length > 0) {
      throw new Error(`install verification failed: ${problems.length}`);
    }
  }

  sendProgress('shortcut', 78, '正在创建桌面和开始菜单入口');
  await createShortcuts();

  sendProgress('complete', 100, '安装完成');
  writeInstallerLog('install_complete', {
    installDir,
    executable: getAppExePath()
  });
  return true;
};

const repairPayload = async () => {
  const payloadDir = findPayloadDir();
  const manifest = readEmbeddedManifest();
  if (!payloadDir || !manifest) {
    throw new Error('embedded repair payload is missing');
  }
  const installDir = getInstallDir();
  mkdirSync(installDir, { recursive: true });
  sendProgress('verify', 5, '\u6b63\u5728\u626b\u63cf\u672c\u5730\u6587\u4ef6');
  const problems = getFileProblems(installDir, manifest);
  if (problems.length === 0) {
    sendProgress('complete', 100, '\u6587\u4ef6\u5b8c\u6574\uff0c\u65e0\u9700\u4fee\u590d');
    return { repaired: 0, total: 0 };
  }
  problems.forEach((problem, index) => {
    const sourcePath = getLocalFilePath(payloadDir, problem.file.path);
    const targetPath = getLocalFilePath(installDir, problem.file.path);
    sendProgress(
      'repair',
      10 + Math.round(((index + 1) / problems.length) * 70),
      `\u4fee\u590d ${index + 1}/${problems.length} · ${problem.file.path}`
    );
    copyFileEnsured(sourcePath, targetPath);
  });
  const remaining = verifyInstalledFiles(manifest, 82, 15);
  if (remaining.length > 0) {
    throw new Error(`repair verification failed: ${remaining.length}`);
  }
  await createShortcuts();
  sendProgress('complete', 100, '\u4fee\u590d\u5b8c\u6210');
  return { repaired: problems.length, total: manifest.files.length };
};

const checkRemoteUpdate = async () => {
  const remoteManifest = await fetchRemoteManifest();
  const localManifest = readInstalledManifest() || readEmbeddedManifest();
  const available = compareBuildId(remoteManifest, localManifest);
  return {
    available,
    remote: remoteManifest
      ? {
          version: remoteManifest.version,
          buildId: remoteManifest.buildId,
          generatedAt: remoteManifest.generatedAt
        }
      : null,
    local: localManifest
      ? {
          version: localManifest.version,
          buildId: localManifest.buildId,
          generatedAt: localManifest.generatedAt
        }
      : null
  };
};

const updateFromRemote = async () => {
  const remoteManifest = await fetchRemoteManifest();
  if (!remoteManifest || !Array.isArray(remoteManifest.files)) {
    throw new Error('remote manifest is invalid');
  }
  const installDir = getInstallDir();
  if (!existsSync(getAppExePath())) {
    return await installPayload();
  }
  const problems = getFileProblems(installDir, remoteManifest)
    .filter((problem) => problem.file.url);
  if (problems.length === 0) {
    writeFileSync(
      getInstalledManifestPath(),
      JSON.stringify(remoteManifest, null, 2),
      'utf8'
    );
    sendProgress('complete', 100, '\u5df2\u662f\u6700\u65b0\u7248\u672c');
    return { updated: 0 };
  }
  const totalBytes = problems.reduce((total, problem) => total + Number(problem.file.size || 0), 0);
  const spaceInfo = await getSpaceInfo();
  if (spaceInfo.freeBytes > 0 && spaceInfo.freeBytes < totalBytes + 128 * 1024 * 1024) {
    throw new Error('not enough free space for update');
  }
  for (let index = 0; index < problems.length; index += 1) {
    const file = problems[index].file;
    const targetPath = getLocalFilePath(installDir, file.path);
    await downloadFileWithRetry(
      file,
      targetPath,
      Math.round((index / problems.length) * 85),
      Math.round(85 / problems.length)
    );
  }
  const remaining = verifyInstalledFiles(remoteManifest, 88, 10)
    .filter((problem) => problem.file.url);
  if (remaining.length > 0) {
    throw new Error(`update verification failed: ${remaining.length}`);
  }
  writeFileSync(
    getInstalledManifestPath(),
    JSON.stringify(remoteManifest, null, 2),
    'utf8'
  );
  await createShortcuts();
  sendProgress('complete', 100, '\u66f4\u65b0\u5b8c\u6210');
  return { updated: problems.length };
};

const uninstallPayload = async () => {
  const installDir = getInstallDir();
  writeInstallerLog('uninstall_start', { installDir });
  sendProgress('uninstall', 25, '正在移除快捷方式');
  removeShortcuts();
  sendProgress('uninstall', 68, '正在删除本地客户端文件');
  removeInstallDir();
  sendProgress('complete', 100, '卸载完成');
  writeInstallerLog('uninstall_complete', { installDir });
  return true;
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 720,
    minWidth: 980,
    minHeight: 620,
    title: productName,
    autoHideMenuBar: true,
    backgroundColor: '#07070b',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(appRoot, 'preload.js')
    }
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.loadFile(join(appRoot, 'index.html'));
};

ipcMain.handle('installer:status', async () => {
  const installDir = getInstallDir();
  const payloadDir = findPayloadDir();
  const appExe = getAppExePath();
  const embeddedManifest = readEmbeddedManifest();
  const installedManifest = readInstalledManifest();
  const space = await getSpaceInfo();
  const healthProblems = installedManifest && existsSync(appExe)
    ? getFileProblems(installDir, installedManifest, false).length
    : 0;
  writeInstallerLog('status', {
    resourcesPath: process.resourcesPath || '',
    appRoot,
    payloadDir,
    payloadCandidates: getPayloadCandidates()
  });
  return {
    payloadExists: Boolean(payloadDir),
    installed: existsSync(appExe),
    installDir,
    appExe,
    version: app.getVersion(),
    buildId: installedManifest ? installedManifest.buildId : '',
    embeddedBuildId: embeddedManifest ? embeddedManifest.buildId : '',
    healthProblems,
    space
  };
});

ipcMain.handle('installer:choose-install-dir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择安装位置',
    defaultPath: dirname(getInstallDir()),
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled || result.filePaths.length === 0) {
    return getInstallDir();
  }
  const selectedDir = join(result.filePaths[0], basename(getDefaultInstallDir()));
  setInstallDir(selectedDir);
  return selectedDir;
});

ipcMain.handle('installer:install', async () => {
  try {
    return await installPayload();
  } catch (error) {
    writeInstallerLog('install_failed', {
      message: error.message,
      stack: error.stack
    });
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '安装失败',
      message: error.message || String(error)
    });
    sendProgress('failed', 0, '安装失败');
    return false;
  }
});

ipcMain.handle('installer:repair', async () => {
  try {
    return await repairPayload();
  } catch (error) {
    writeInstallerLog('repair_failed', {
      message: error.message,
      stack: error.stack
    });
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '\u4fee\u590d\u5931\u8d25',
      message: error.message || String(error)
    });
    sendProgress('failed', 0, '\u4fee\u590d\u5931\u8d25');
    return false;
  }
});

ipcMain.handle('installer:reinstall', async () => {
  return await installPayload();
});

ipcMain.handle('installer:check-update', async () => {
  try {
    return await checkRemoteUpdate();
  } catch (error) {
    writeInstallerLog('check_update_failed', {
      message: error.message,
      stack: error.stack
    });
    return {
      available: false,
      error: error.message || String(error)
    };
  }
});

ipcMain.handle('installer:update', async () => {
  try {
    return await updateFromRemote();
  } catch (error) {
    writeInstallerLog('update_failed', {
      message: error.message,
      stack: error.stack
    });
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '\u66f4\u65b0\u5931\u8d25',
      message: error.message || String(error)
    });
    sendProgress('failed', 0, '\u66f4\u65b0\u5931\u8d25');
    return false;
  }
});

ipcMain.handle('installer:uninstall', async () => {
  try {
    if (!existsSync(getInstallDir())) {
      await dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '尚未安装',
        message: '当前电脑尚未安装桌面客户端。'
      });
      return false;
    }
    return await uninstallPayload();
  } catch (error) {
    writeInstallerLog('uninstall_failed', {
      message: error.message,
      stack: error.stack
    });
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '卸载失败',
      message: error.message || String(error)
    });
    sendProgress('failed', 0, '卸载失败');
    return false;
  }
});

ipcMain.handle('installer:launch', () => {
  return runDetached(getAppExePath());
});

ipcMain.handle('installer:open-install-dir', async () => {
  const installDir = getInstallDir();
  if (!existsSync(installDir)) {
    return false;
  }
  await shell.openPath(installDir);
  return true;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
