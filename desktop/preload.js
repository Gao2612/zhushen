const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ZhushenDesktop', {
  exportData: (data) => ipcRenderer.invoke('desktop:export-data', { data }),
  applyContentDraft: (payload) => ipcRenderer.invoke(
    'desktop:apply-content-draft',
    payload
  ),
  applyRemoteContent: (payload) => ipcRenderer.invoke(
    'desktop:apply-remote-content',
    payload
  ),
  checkRemoteContent: (payload) => ipcRenderer.invoke(
    'desktop:check-remote-content',
    payload
  ),
  downloadRemoteContent: (payload) => ipcRenderer.invoke(
    'desktop:download-remote-content',
    payload
  ),
  getAlwaysOnTop: () => ipcRenderer.invoke('desktop:get-always-on-top'),
  getMusicState: () => ipcRenderer.invoke('desktop:get-music-state'),
  getStartupEnabled: () => ipcRenderer.invoke('desktop:get-startup-enabled'),
  importData: () => ipcRenderer.invoke('desktop:import-data'),
  listContent: () => ipcRenderer.invoke('desktop:list-content'),
  openInternal: (url, title) => ipcRenderer.invoke(
    'desktop:open-internal',
    { url, title }
  ),
  requestUninstall: () => ipcRenderer.invoke('desktop:request-uninstall'),
  rollbackRemoteContent: () => ipcRenderer.invoke('desktop:rollback-remote-content'),
  saveContentDraft: (payload) => ipcRenderer.invoke(
    'desktop:save-content-draft',
    payload
  ),
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
