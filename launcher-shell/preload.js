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
  openLogs: () => ipcRenderer.invoke('installer:open-logs'),
  openExternal: (url) => ipcRenderer.invoke('installer:open-external', url),
  profileExport: () => ipcRenderer.invoke('profile:export'),
  profileGet: () => ipcRenderer.invoke('profile:get'),
  profileImport: () => ipcRenderer.invoke('profile:import'),
  profileSave: (profile) => ipcRenderer.invoke('profile:save', profile),
  reinstall: () => ipcRenderer.invoke('installer:reinstall'),
  repair: () => ipcRenderer.invoke('installer:repair'),
  setCloseAfterLaunch: (enabled) => ipcRenderer.invoke(
    'launcher:set-close-after-launch',
    enabled
  ),
  update: () => ipcRenderer.invoke('installer:update'),
  uninstall: () => ipcRenderer.invoke('installer:uninstall'),
  windowClose: () => ipcRenderer.invoke('window:close'),
  windowMinimize: () => ipcRenderer.invoke('window:minimize')
});
