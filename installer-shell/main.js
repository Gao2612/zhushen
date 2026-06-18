const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const { existsSync, readdirSync } = require('fs');
const { join } = require('path');
const { spawn } = require('child_process');

const appRoot = __dirname;
const installerFileName = 'zhushen-archive-1.1.0-win-x64.exe';
const bundledInstaller = join(
  process.resourcesPath || appRoot,
  'installer',
  installerFileName
);

const getLocalAppData = () => {
  return process.env.LOCALAPPDATA
    || join(app.getPath('home'), 'AppData', 'Local');
};

const getInstallDir = () => {
  return join(getLocalAppData(), 'Programs', 'zhushen-archive');
};

const findInstalledUninstaller = () => {
  const installDir = getInstallDir();
  if (!existsSync(installDir)) {
    return '';
  }
  const names = readdirSync(installDir);
  const matched = names.find((name) => {
    return /^uninstall.*\.exe$/i.test(name) || /卸载.*\.exe$/i.test(name);
  });
  return matched ? join(installDir, matched) : '';
};

const runDetached = (filePath, args) => {
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

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1120,
    height: 700,
    minWidth: 940,
    minHeight: 600,
    title: '诸神终应知晓',
    autoHideMenuBar: true,
    backgroundColor: '#07070b',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(appRoot, 'preload.js')
    }
  });
  window.loadFile(join(appRoot, 'index.html'));
};

ipcMain.handle('installer:status', () => {
  const installDir = getInstallDir();
  const appExe = join(installDir, 'zhushen-archive.exe');
  return {
    installerExists: existsSync(bundledInstaller),
    installed: existsSync(appExe),
    installDir,
    installerPath: bundledInstaller,
    uninstallerPath: findInstalledUninstaller()
  };
});

ipcMain.handle('installer:install', async () => {
  if (!existsSync(bundledInstaller)) {
    await dialog.showMessageBox({
      type: 'error',
      title: '未找到安装包',
      message: '安装器中没有包含实际安装包。'
    });
    return false;
  }
  runDetached(bundledInstaller, []);
  return true;
});

ipcMain.handle('installer:uninstall', async () => {
  const uninstaller = findInstalledUninstaller();
  if (!uninstaller) {
    await dialog.showMessageBox({
      type: 'info',
      title: '未找到卸载器',
      message: '当前电脑尚未安装桌面客户端，或安装目录中没有卸载程序。'
    });
    return false;
  }
  runDetached(uninstaller, []);
  return true;
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
