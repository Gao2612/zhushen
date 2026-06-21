const { app, BrowserWindow, ipcMain } = require('electron');
const { join } = require('path');

const root = join(__dirname, '..');
let window;

app.setPath('userData', join(root, 'tmp', 'electron-client-navigation'));
app.commandLine.appendSwitch('disable-gpu');
ipcMain.handle('desktop:get-music-state', () => ({ enabled: true, volume: 45 }));
ipcMain.handle('desktop:set-music-state', (_event, state) => state);
ipcMain.handle('desktop:get-startup-enabled', () => false);
ipcMain.handle('desktop:get-zoom-factor', () => 1);

async function waitFor(predicate, timeoutMs = 8000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw new Error('等待客户端状态超时');
}

async function run() {
  window = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800,
    webPreferences: {
      preload: join(root, 'desktop', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  });
  await window.loadFile(join(root, 'manual-build', 'assets', 'zy.html'));
  await waitFor(() => window.webContents.executeJavaScript(
    "Boolean(document.querySelector('.desktop-titlebar') && document.querySelector('.profile-drawer'))"
  ));

  const initial = await window.webContents.executeJavaScript(`(() => {
    window.__navigationTestTitlebar = document.querySelector('.desktop-titlebar');
    window.__navigationTestMain = document.querySelector('main.app-shell');
    document.querySelector('.brand-avatar').click();
    return {
      titlebar: document.querySelector('.desktop-titlebar-brand span').textContent,
      drawerOpen: document.querySelector('.profile-drawer').classList.contains('open'),
      profileLinks: document.querySelectorAll('a[href="profile.html"]').length,
      dockArchiveLabels: Array.from(document.querySelectorAll('.desktop-dock a'))
        .filter((link) => link.textContent.trim() === '档案').length,
      backdropPresent: Boolean(document.querySelector('.app-page-backdrop'))
    };
  })()`);
  if (initial.titlebar !== '诸神终应知晓') throw new Error('标题栏文字不正确');
  if (!initial.drawerOpen) throw new Error('头像未打开档案抽屉');
  if (initial.profileLinks !== 0 || initial.dockArchiveLabels !== 0) {
    throw new Error('仍存在独立档案导航入口');
  }
  if (!initial.backdropPresent) throw new Error('页面背景层未创建');

  await window.webContents.executeJavaScript(`(() => {
    document.querySelector('.profile-drawer-close').click();
    document.querySelector('.desktop-dock a[href="official.html"]').click();
  })()`);
  await waitFor(() => window.webContents.executeJavaScript(
    "location.pathname.endsWith('/official.html') && document.querySelector('main h1')?.textContent.includes('官方发布')"
  ));
  const afterNavigation = await window.webContents.executeJavaScript(`(() => ({
    sameTitlebar: window.__navigationTestTitlebar === document.querySelector('.desktop-titlebar'),
    mainReplaced: window.__navigationTestMain !== document.querySelector('main.app-shell'),
    officialActive: document.querySelector('.desktop-dock a[href="official.html"]').classList.contains('active'),
    profileDrawerStillPresent: Boolean(document.querySelector('.profile-drawer')),
    backgroundImage: document.querySelector('.app-page-backdrop img').getAttribute('src')
  }))()`);
  if (!afterNavigation.sameTitlebar || !afterNavigation.mainReplaced) {
    throw new Error('切页未保持客户端外壳或未替换正文');
  }
  if (!afterNavigation.officialActive || !afterNavigation.profileDrawerStillPresent) {
    throw new Error('切页后的导航或档案抽屉状态不正确');
  }
  if (!afterNavigation.backgroundImage.includes('official-posts/')) {
    throw new Error('官方页未切换到对应静态背景');
  }
  console.log('客户端冒烟测试通过：档案抽屉、局部切页、持久外壳与分页面背景均有效。');
}

app.whenReady().then(run).then(() => app.quit()).catch((error) => {
  console.error(error.stack || error.message || error);
  app.exit(1);
});

app.on('window-all-closed', () => {});
