const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ZhushenDesktop', {
  getStartupEnabled: () => ipcRenderer.invoke('desktop:get-startup-enabled'),
  openInternal: (url, title) => ipcRenderer.invoke(
    'desktop:open-internal',
    { url, title }
  ),
  setStartupEnabled: (enabled) => ipcRenderer.invoke(
    'desktop:set-startup-enabled',
    { enabled }
  ),
  toggleFullscreen: () => ipcRenderer.invoke('desktop:toggle-fullscreen')
});
