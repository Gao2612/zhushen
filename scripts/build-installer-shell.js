const { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } = require('fs');
const { join, resolve } = require('path');
const { spawnSync } = require('child_process');

const rootDir = resolve(__dirname, '..');
const desktopUnpackedDir = join(rootDir, 'releases', 'desktop', 'win-unpacked');
const buildRootDir = join(rootDir, 'releases', 'installer-shell-build');
const prepackagedDir = join(buildRootDir, 'prepackaged');
const appTempDir = join(buildRootDir, 'app-temp');
const appAsarPath = join(prepackagedDir, 'resources', 'app.asar');
const desktopPayloadDir = join(prepackagedDir, 'resources', 'desktop-payload');
const electronExePath = join(prepackagedDir, 'zhushen-archive.exe');
const shellExePath = join(prepackagedDir, 'zhushen-installer.exe');
const asarCommand = join(
  rootDir,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'asar.cmd' : 'asar'
);
const builderCommand = join(
  rootDir,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'electron-builder.cmd' : 'electron-builder'
);

function removePath(path) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

function assertFile(path, label) {
  if (!existsSync(path)) {
    throw new Error(label + ' 不存在：' + path);
  }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  if (result.status !== 0) {
    throw new Error('命令执行失败：' + command + ' ' + args.join(' '));
  }
}

function copyDirectory(source, target) {
  mkdirSync(target, { recursive: true });
  if (process.platform !== 'win32') {
    cpSync(source, target, { recursive: true });
    return;
  }
  const result = spawnSync(
    'robocopy',
    [source, target, '/MIR', '/NFL', '/NDL', '/NJH', '/NJS', '/NP'],
    {
      cwd: rootDir,
      stdio: 'inherit',
      shell: false
    }
  );
  if (result.error) {
    throw result.error;
  }
  if (result.status >= 8) {
    throw new Error('目录复制失败：' + source + ' -> ' + target);
  }
}

function copyAppFiles() {
  copyDirectory(
    join(rootDir, 'installer-shell'),
    join(appTempDir, 'installer-shell')
  );
  cpSync(
    join(
      rootDir,
      'manual-build',
      'assets',
      'official-posts',
      '492288870839223557',
      'pv.mp4'
    ),
    join(
      appTempDir,
      'manual-build',
      'assets',
      'official-posts',
      '492288870839223557',
      'pv.mp4'
    )
  );
  cpSync(
    join(rootDir, 'manual-build', 'assets', 'logo', 'logo.png'),
    join(appTempDir, 'manual-build', 'assets', 'logo', 'logo.png')
  );
  writeFileSync(
    join(appTempDir, 'package.json'),
    JSON.stringify({
      name: 'zhushen-installer',
      version: '1.1.0',
      main: 'installer-shell/main.js'
    }),
    'utf8'
  );
}

function preparePrepackagedApp() {
  removePath(prepackagedDir);
  removePath(appTempDir);
  copyDirectory(desktopUnpackedDir, prepackagedDir);
  removePath(desktopPayloadDir);
  mkdirSync(desktopPayloadDir, { recursive: true });
  copyDirectory(desktopUnpackedDir, desktopPayloadDir);
  removePath(appAsarPath);
  if (existsSync(electronExePath)) {
    rmSync(electronExePath, { force: true });
  }
  cpSync(
    join(desktopUnpackedDir, 'zhushen-archive.exe'),
    shellExePath
  );
  mkdirSync(
    join(
      appTempDir,
      'manual-build',
      'assets',
      'official-posts',
      '492288870839223557'
    ),
    { recursive: true }
  );
  mkdirSync(join(appTempDir, 'manual-build', 'assets', 'logo'), {
    recursive: true
  });
  copyAppFiles();
  run(asarCommand, ['pack', appTempDir, appAsarPath]);
}

function buildPortableShell() {
  run(builderCommand, [
    '--config',
    'installer-shell/electron-builder.json',
    '--prepackaged',
    prepackagedDir,
    '--win',
    'portable',
    '--x64'
  ]);
}

assertFile(desktopUnpackedDir, '桌面端解包目录');
assertFile(asarCommand, 'asar 命令');
assertFile(builderCommand, 'electron-builder 命令');
preparePrepackagedApp();
buildPortableShell();
