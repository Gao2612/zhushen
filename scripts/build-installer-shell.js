const {
  cpSync,
  existsSync,
  chmodSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} = require('fs');
const { createHash } = require('crypto');
const { join, relative, resolve, sep } = require('path');
const { spawnSync } = require('child_process');
const packageJson = require('../package.json');

const rootDir = resolve(__dirname, '..');
const desktopUnpackedDir = join(rootDir, 'releases', 'desktop', 'win-unpacked');
const buildRootDir = join(rootDir, 'releases', 'installer-shell-build');
const prepackagedDir = join(buildRootDir, 'prepackaged');
const appTempDir = join(buildRootDir, 'app-temp');
const appAsarPath = join(prepackagedDir, 'resources', 'app.asar');
const desktopPayloadDir = join(prepackagedDir, 'resources', 'desktop-payload');
const updateOutputDir = join(rootDir, 'releases', 'update-current');
const electronExePath = join(prepackagedDir, 'zhushen-archive.exe');
const shellExePath = join(prepackagedDir, 'zhushen-installer.exe');
const updateManifestName = 'zhushen-update-manifest.json';
const updateAsarName = 'zhushen-app.asar';
const updateExeName = 'zhushen-archive.exe';
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
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        chmodSync(path, 0o666);
      } catch (error) {
        // Directory chmod or missing file can be ignored before forced removal.
      }
      try {
        rmSync(path, {
          recursive: true,
          force: true,
          maxRetries: 5,
          retryDelay: 250
        });
        return;
      } catch (error) {
        if (attempt === 4) {
          throw error;
        }
      }
    }
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

function hashFile(path) {
  const hash = createHash('sha256');
  hash.update(require('fs').readFileSync(path));
  return hash.digest('hex');
}

function listFiles(dir) {
  const files = [];
  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }
  walk(dir);
  return files;
}

function toPortablePath(path) {
  return path.split(sep).join('/');
}

function createUpdateManifest(payloadDir) {
  const buildId = [
    packageJson.version,
    new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: rootDir,
      encoding: 'utf8',
      shell: process.platform === 'win32'
    }).stdout.trim() || 'local'
  ].join('-');
  const releaseBaseUrl = 'https://github.com/Gao2612/zhushen/releases/latest/download/';
  const remoteAssetMap = {
    'resources/app.asar': updateAsarName,
    'zhushen-archive.exe': updateExeName
  };
  const files = listFiles(payloadDir)
    .map((filePath) => {
      const relativePath = toPortablePath(relative(payloadDir, filePath));
      const stats = statSync(filePath);
      const remoteAssetName = remoteAssetMap[relativePath] || '';
      return {
        path: relativePath,
        size: stats.size,
        sha256: hashFile(filePath),
        url: remoteAssetName ? releaseBaseUrl + encodeURIComponent(remoteAssetName) : ''
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
  return {
    schemaVersion: 1,
    product: 'zhushen-archive',
    version: packageJson.version,
    buildId,
    generatedAt: new Date().toISOString(),
    files
  };
}

function writeUpdateAssets() {
  const manifest = createUpdateManifest(desktopPayloadDir);
  mkdirSync(join(desktopPayloadDir, 'resources'), { recursive: true });
  writeFileSync(
    join(desktopPayloadDir, 'resources', updateManifestName),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );
  mkdirSync(updateOutputDir, { recursive: true });
  for (const assetName of [updateManifestName, updateAsarName, updateExeName]) {
    removePath(join(updateOutputDir, assetName));
  }
  writeFileSync(
    join(updateOutputDir, updateManifestName),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );
  cpSync(
    join(desktopPayloadDir, 'resources', 'app.asar'),
    join(updateOutputDir, updateAsarName)
  );
  cpSync(
    join(desktopPayloadDir, 'zhushen-archive.exe'),
    join(updateOutputDir, updateExeName)
  );
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
    join(
      rootDir,
      'manual-build',
      'assets',
      'official-posts',
      '492288870839223557',
      'cover.jpg'
    ),
    join(
      appTempDir,
      'manual-build',
      'assets',
      'official-posts',
      '492288870839223557',
      'cover.jpg'
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
  writeUpdateAssets();
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
