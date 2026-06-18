const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ZhushenInstaller', {
  getStatus: () => ipcRenderer.invoke('installer:status'),
  install: () => ipcRenderer.invoke('installer:install'),
  openInstallDir: () => ipcRenderer.invoke('installer:open-install-dir'),
  uninstall: () => ipcRenderer.invoke('installer:uninstall')
});
