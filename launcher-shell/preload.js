const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ZhushenInstaller', {
  chooseInstallDir: () => ipcRenderer.invoke('installer:choose-install-dir'),
  checkUpdate: () => ipcRenderer.invoke('installer:check-update'),
  getStatus: () => ipcRenderer.invoke('installer:status'),
  install: () => ipcRenderer.invoke('installer:install'),
  launch: () => ipcRenderer.invoke('installer:launch'),
  onProgress: (callback) => {
    ipcRenderer.on('installer:progress', (event, payload) => callback(payload));
  },
  openInstallDir: () => ipcRenderer.invoke('installer:open-install-dir'),
  openExternal: (url) => ipcRenderer.invoke('installer:open-external', url),
  reinstall: () => ipcRenderer.invoke('installer:reinstall'),
  repair: () => ipcRenderer.invoke('installer:repair'),
  update: () => ipcRenderer.invoke('installer:update'),
  uninstall: () => ipcRenderer.invoke('installer:uninstall')
});
