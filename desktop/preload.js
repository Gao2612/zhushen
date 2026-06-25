const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ZhushenDesktop', {
  exportData: (data) => ipcRenderer.invoke('desktop:export-data', { data }),
  getAlwaysOnTop: () => ipcRenderer.invoke('desktop:get-always-on-top'),
  getMusicState: () => ipcRenderer.invoke('desktop:get-music-state'),
  getStartupEnabled: () => ipcRenderer.invoke('desktop:get-startup-enabled'),
  importData: () => ipcRenderer.invoke('desktop:import-data'),
  openInternal: (url, title) => ipcRenderer.invoke(
    'desktop:open-internal',
    { url, title }
  ),
  requestUninstall: () => ipcRenderer.invoke('desktop:request-uninstall'),
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke(
    'desktop:set-always-on-top',
    { enabled }
  ),
  setStartupEnabled: (enabled) => ipcRenderer.invoke(
    'desktop:set-startup-enabled',
    { enabled }
  ),
  setMusicState: (state) => ipcRenderer.invoke('desktop:set-music-state', state),
  toggleFullscreen: () => ipcRenderer.invoke('desktop:toggle-fullscreen'),
  windowClose: () => ipcRenderer.invoke('desktop:window-close'),
  windowMinimize: () => ipcRenderer.invoke('desktop:window-minimize'),
  windowToggleMaximize: () => ipcRenderer.invoke('desktop:window-toggle-maximize')
});
