const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ZhushenInstaller', {
  chooseInstallDir: () => ipcRenderer.invoke('installer:choose-install-dir'),
  getStatus: () => ipcRenderer.invoke('installer:status'),
  install: () => ipcRenderer.invoke('installer:install'),
  launch: () => ipcRenderer.invoke('installer:launch'),
  onProgress: (callback) => {
    ipcRenderer.on('installer:progress', (event, payload) => callback(payload));
  },
  openInstallDir: () => ipcRenderer.invoke('installer:open-install-dir'),
  uninstall: () => ipcRenderer.invoke('installer:uninstall')
});
