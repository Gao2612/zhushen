const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} = require('fs');
const { basename, dirname, join } = require('path');
const { spawn } = require('child_process');

const appRoot = __dirname;
const productName = '诸神终应知晓';
const executableName = 'zhushen-archive.exe';
const configFileName = 'installer-state.json';

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
  mkdirSync(dirname(installDir), { recursive: true });
  removeInstallDir();
  mkdirSync(installDir, { recursive: true });

  sendProgress('copy', 34, '正在写入桌面客户端文件');
  cpSync(payloadDir, installDir, { recursive: true });

  sendProgress('shortcut', 78, '正在创建桌面和开始菜单入口');
  await createShortcuts();

  sendProgress('complete', 100, '安装完成');
  writeInstallerLog('install_complete', {
    installDir,
    executable: getAppExePath()
  });
  return true;
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

ipcMain.handle('installer:status', () => {
  const installDir = getInstallDir();
  const payloadDir = findPayloadDir();
  const appExe = getAppExePath();
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
    version: app.getVersion()
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
