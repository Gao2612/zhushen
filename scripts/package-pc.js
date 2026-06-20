const {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync
} = require('fs');
const { join, resolve } = require('path');

const root = resolve(__dirname, '..');
const version = '1.1.1';
const releaseRoot = join(root, 'releases');
const pcRoot = join(releaseRoot, 'pc');
const packageRoot = join(pcRoot, `zhushen-pc-client-v${version}`);
const assetsSource = join(root, 'manual-build', 'assets');
const assetsTarget = join(packageRoot, 'assets');

if (!existsSync(assetsSource)) {
  throw new Error(`未找到网页资源目录：${assetsSource}`);
}

rmSync(packageRoot, { recursive: true, force: true });
mkdirSync(assetsTarget, { recursive: true });
cpSync(assetsSource, assetsTarget, { recursive: true });

writeFileSync(
  join(packageRoot, '启动诸神终应知晓.bat'),
  [
    '@echo off',
    'setlocal',
    'set "APP_DIR=%~dp0"',
    'set "ENTRY=%APP_DIR%assets\\zy.html"',
    'where msedge >nul 2>nul',
    'if %errorlevel%==0 (',
    '  start "" msedge --app="file:///%ENTRY:\\=/%"',
    '  exit /b 0',
    ')',
    'where chrome >nul 2>nul',
    'if %errorlevel%==0 (',
    '  start "" chrome --app="file:///%ENTRY:\\=/%"',
    '  exit /b 0',
    ')',
    'start "" "%ENTRY%"',
    'exit /b 0',
    ''
  ].join('\r\n'),
  'utf8'
);

writeFileSync(
  join(packageRoot, 'README.txt'),
  [
    '诸神终应知晓 玩家自制史记 PC 便携客户端',
    '',
    '使用方式：',
    '1. 解压整个文件夹。',
    '2. 双击“启动诸神终应知晓.bat”。',
    '3. 优先使用 Edge/Chrome 的应用窗口模式打开，找不到浏览器时回退到默认浏览器。',
    '',
    '说明：',
    '- 这是离线便携客户端，不上传任何收藏或最近浏览数据。',
    '- 第三方网页链接仍会交给浏览器处理。',
    '- 若需要真正的 exe 安装器，后续建议使用 Electron 或 Tauri 打包。',
    ''
  ].join('\r\n'),
  'utf8'
);

copyFileSync(
  join(root, 'app-debug.apk'),
  join(releaseRoot, 'android-debug.apk')
);

console.log(`PC 便携客户端已生成：${packageRoot}`);
